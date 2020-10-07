require('nodeunit');
const digiid = require('../index');
const addressDecoder=require('crypto-address-decoder');


module.exports = {
    'calc D address': function(test) {
        const hexSig=Buffer.from('HzPHzie/tjhZFQSufXpzJdn3HWS5zjXK2ediZJEMtn4pHPovTTAxIV0C6ZyYtS1KS4/aK4aWbsij8LKU4xDYPXY=','Base64');
        const hexPubkeyHash=addressDecoder('D9688jftCYNMF1x3kB38SPue5jvkXCiVrF').data;
        test.equal(digiid.calc('aaa',hexSig),hexPubkeyHash);
        test.done();
    },
    'calc dgb address': function(test) {
        const hexSig=Buffer.from('HxKh/GTiKlwdHDcjMcskDQ59NrO4bbdVDWVCFM9l5vSZMzgsA2RG2hn4ut3jEGrXmcDfgrCWOvKj27lhLW6YGg4=','Base64');
        const hexPubkeyHash=addressDecoder('dgb1qjzs7dpyzay79320lnva6zwavartkrvqxmw4svp').data;
        test.equal(digiid.calc('bbb',hexSig),hexPubkeyHash);
        test.done();
    },
    'calc S address': function(test) {
        const hexSig=Buffer.from('IDCvQYgoJ3gvhwcNy6W45d3yyy30McHKSjj6ZMguheEUM0zHsAhPyzwjAVMNqTtO3+Dp3k+PIJz2IxmpdBg5joc=','Base64');
        const hexPubkeyHash=addressDecoder('SZBrMzpNupyTcRU77L5cP7MYuhj68HSfXT').data;
        test.equal(digiid.calc('bbb',hexSig),hexPubkeyHash);
        test.done();
    },
    'check D address': function(test) {
        const hexSig=Buffer.from('HzPHzie/tjhZFQSufXpzJdn3HWS5zjXK2ediZJEMtn4pHPovTTAxIV0C6ZyYtS1KS4/aK4aWbsij8LKU4xDYPXY=','Base64');
        const hexPubkeyHash=addressDecoder('D9688jftCYNMF1x3kB38SPue5jvkXCiVrF').data;
        test.equal(digiid.check('aaa',hexSig,hexPubkeyHash),true);
        test.done();
    }

};

