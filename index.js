const addressDecoder=require('crypto-address-decoder');
const crypto=require('crypto');
const secp256k1 = require('secp256k1');






const MAGIC_BYTES = Buffer.from('\x19DigiByte Signed Message:\n');

/**
 * Creates a buffer from a number using a special Bitcoin encoding
 * @param {int} n
 * @return {Buffer}
 */
const varintBufNum = function(n) {
    let buf;
    if (n < 253) {
        buf = new Buffer.alloc(1);
        buf.writeUInt8(n, 0);
    } else if (n < 0x10000) {
        buf = new Buffer.alloc(1 + 2);
        buf.writeUInt8(253, 0);
        buf.writeUInt16LE(n, 1);
    } else if (n < 0x100000000) {
        buf = new Buffer.alloc(1 + 4);
        buf.writeUInt8(254, 0);
        buf.writeUInt32LE(n, 1);
    } else {
        buf = new Buffer.alloc(1 + 8);
        buf.writeUInt8(255, 0);
        buf.writeInt32LE(n & -1, 1);
        buf.writeUInt32LE(Math.floor(n / 0x100000000), 5);
    }
    return buf;
};


/**
 * Calculates the addressHash for a specific uri and signature
 * @param {string|Buffer}  uri
 * @param {string|Buffer}  signature
 * @return {string}
 */
module.exports.calc=calc=function(uri,signature) {
    //make sure signature is a buffer
    signature=Buffer.from(signature,'hex');

    //get signature header
    let first = (signature[0] - 27);
    //let comp = ((first & 4) !== 0);
    let rec = first & 3;

    //compute the hash of the uri
    const messageBuffer = Buffer.from(uri);
    const prefix2 = varintBufNum(messageBuffer.length);
    let buf = Buffer.concat([MAGIC_BYTES, prefix2, messageBuffer]);
    buf=crypto.createHash('sha256').update(buf).digest();
    const hash=crypto.createHash('sha256').update(buf).digest();

    //calculate the public key of the address
    buf=Buffer.from(secp256k1.ecdsaRecover(
        signature.slice(1),
        rec,
        hash
    ));
    buf=crypto.createHash('sha256').update(buf).digest();
    return crypto.createHash('ripemd160').update(buf).digest('hex');
}

/**
 * Checks if a uri,signature, and addressHash match and returns true or false
 * Signature and addressHash are hex string.
 * @param {string|Buffer}  uri
 * @param {string|Buffer}  signature
 * @param {string|Buffer}  addressHash
 * @return {boolean}
 */
module.exports.check=check=function(uri,signature,addressHash) {
    try {
        //verify uri and signature match addressHash
        return (calc(uri,signature)===addressHash);
    } catch (_) {
        //if signature was invalid then an error may have been generated
        return false;
    }
}



/**
 *
 * @param {string|[string]|boolean} callback_url
 * @return {function(...[*]=)}
 */
module.exports.express = function (callback_url=false) {
    //make input an array if its a string
    callback_url=(typeof callback_url==="string")?[callback_url]:callback_url;

    //return function to execute
    return function (req, res, next) {
        //set that digi-id did not successfully happen
        req.digiid=false;

        //skip if not post request
        if (req.method !== "POST") return next();

        //skip if not the callback url
        if ((callback_url!==false)&&(callback_url.indexOf(req.url)===-1)) return next();


        //make sure necessary values are present
        const postValue=req.body;
        if ((postValue.address===undefined)||(postValue.signature===undefined)||(postValue.uri===undefined)) {
            if (callback_url!==false) return res.status(500).json({error: "Digi-ID Input Missing"});   //fail if callback was defined
            return next();
        }


        //make sure signature is valid
        const {data} = addressDecoder(postValue.address);
        const sig = (new Buffer.from(postValue.signature, 'base64')).toString('hex');
        const pubkeyHash=calc(postValue.uri, sig);
        if (pubkeyHash!==data) {
            if (callback_url!==false) return res.status(500).json({error: "Digi-ID Invalid Signature"});   //fail if callback was defined
            return next();
        }


        //decode uri components
        req.digiid={
            hash:   pubkeyHash,
            sig:    sig,
            address:postValue.address,
            uri:    postValue.uri,
            params: {}
        };      //things passed but no parameters yet
        const indexOfQuestionMark=postValue.uri.indexOf('?');
        if (indexOfQuestionMark===-1) return next();
        const urlParams = new URLSearchParams(postValue.uri.substr(indexOfQuestionMark+1));
        for (const [key, value] of urlParams) {
            req.digiid.params[key]=value;
        }

        //do next express plugin
        next();
    }
}