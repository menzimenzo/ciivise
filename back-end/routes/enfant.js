const express = require('express');
const router = express.Router();
const { putEnfant, getEnfant } = require('../controllers');

const logger = require('../utils/logger');
const log = logger(module.filename)

router.put('/:id', async function (req, res) {
    const enfant = req.body.enf
    const id = req.body.id
    log.i('::put - In', { id })   
    await putEnfant([enfant, id])
        .then(reso=> {
            log.i('::put - Done', { reso })   
            return res.status(200).json({message: 'ok'})
        })
        .catch(error => {
            log.w('::Mise à jour Enfant - erreur', error)
            return res.status(400).json({message: error.message}); 
        })
})

router.get('/:id', async function (req, res) {
    const id = req.params.id
    log.i('::get - In', { id })   
    const enfant = await getEnfant([id]).catch(error => {
        log.w('::récuperation de l\'enfant - erreur', error)
        return res.status(400).json({message: error.message}); 
    })
    if (enfant) {
        log.i('::get - Done')   
        return res.status(200).json({ enfant })
    }
    else {
        log.i('::get - Done, rien trouvé', { id })   
        return res.status(204).json({message: 'Aucun enfant trouvé avec cet identifiant'})
    }
})

module.exports = router;