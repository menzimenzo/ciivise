

const fs = require('fs');
const config = require('../config');
const logger = require('../utils/logger');
const log = logger(module.filename)
const crypto = require("crypto")



function encryptText (plainText) {
  return crypto.publicEncrypt({
    key: fs.readFileSync('public_key.pem', 'utf8'),
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  // We convert the data string to a buffer
  Buffer.from(plainText)
  )
}


function decryptText (encryptedText,file) {
  try {
    return crypto.privateDecrypt(
    {
      //key: fs.readFileSync('private_key.pem', 'utf8'),
      key: file,
      // In order to decrypt the data, we need to specify the
      // same hashing function and padding scheme that we used to
      // encrypt the data in the previous step
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    encryptedText
  )
  }
  catch (err) {
    throw new Error(
     `The certificate key is invalid.\n${err.message}`
    );
   }
}

module.exports.encryptText = encryptText
module.exports.decryptText = decryptText
