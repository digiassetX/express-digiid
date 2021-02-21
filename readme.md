# Express Digi-Id

#### Known Bugs
This library is known not to work properly with DigiByte addresses starting with S.  At present no wallets use addresses starting with S for Digi-Id.  Infact other then DigiAsset based logins no wallet will ever use an address starting with S so this bug currently causes 0 issues.


## Installation
``` bash
npm install express-digiid
```

## Usage
``` javascript
//initialize express
const api = express();

//initialize body parser
const bodyParser = require("body-parser");
api.use(bodyParser.urlencoded({ extended: false }));
api.use(bodyParser.json());

//initialize express-digiid
const expressDigiId=require('express-digiid');
const callback_url="https://mydomain.com/digiid/callback"; //leave as undefined if should check every POST command
api.use(expressDigiId.express(callback_url));

//handle login request to a specific callback url
app.post('/subdomain/:subdomain',(req,res,next)=>{
    if (req.digiid===false) {
        /*
         * if callback_url is defined this will never happen an error will be returned to the wallet automatically
         * if callback_url is undefined then all post commands are processed you need to check if this particular page
         * should have been accessed with a valid digiid or not.  if a valid Digi-Id is expected execute
         */
         return res.status(500).json({error: "Digi-Id Invalid Signature"}); 
    } else {
        /*
         * req.digiid will be in the format
         * {
         *  hash:   hex string containing the pubkeyhash of the Digi-Id address.  For databases this is ideal value to store since it is a 20 byte binary value,
         *  sig:    hex signature for the Digi-Id request.  Can be safely ignored most of the time,
         *  address:string address value.  should generally be ignored in favour of hash,
         *  uri:    string containing the uri encoded in the Digi-Id QR code.  params is usually more useful,
         *  params: object containing all the parameters that where in the uri. "x" is the most useful parameter since it is the nonce
         *  paramOrder: array of params in order they where included
         * };
         * you can do any aditional checks you like here.  If successful you should let the wallet know by executing
         */
        return res.status(200).json({
            address:    req.digiid.address,
            nonce:      req.digiid.params.x
        });
    }
    
});

```
