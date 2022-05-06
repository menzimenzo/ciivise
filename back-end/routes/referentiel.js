const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();
const logger = require('../utils/logger')
const log = logger(module.filename)

router.get('/:libelle', function (req, res) {
    const libelle = req.params.libelle
    log.i('::list referentiel '+libelle+ ' - In')
    const requete='SELECT id AS id, libelle AS libelle FROM '+libelle
    return pgPool.query(requete,
        [],
        (err, result) => {
            if (err) {
                log.w('::list referentiel - Error', err)
                return res.status(400).json({ message: 'erreur sur la requete de list de'+libelle });
            }
            else {
                log.i('::list referentiel '+libelle+ ' - Done')
                return res.status(200).json(result.rows);
            }
        })
})

module.exports = router;