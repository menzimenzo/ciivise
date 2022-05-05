const express    = require('express');
const router     = express.Router();
const config     = require('../config');

const logger = require('../utils/logger')
const log = logger(module.filename)

router.get('/:id', function (req, res, next) {
    log.i('::telechargement initialisé.')
    const id        = req.params.id;
    var   idformate = id.toString();
    for (nbzero=0;nbzero<7-id.toString().length;nbzero++){
        idformate = "0" + idformate;
    }
    let fileName = `${config.pathAttestation}${idformate}.pdf`;  // The default name the browser will use
    
    log.i('::telechargement de',fileName)  
    return res.download(fileName);  
})


module.exports = router;