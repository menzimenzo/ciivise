const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();
const logger = require('../utils/logger')
const log = logger(module.filename)

router.get('/', function (req, res) {
    log.i('::list statut - In')
    return pgPool.query(`SELECT id AS id, libelle AS libelle
        FROM statut tem`,
        [],
        (err, result) => {
            if (err) {
                log.w('::list statut - Error', err)
                return res.status(400).json({ message: 'erreur sur la requete de list' });
            }
            else {
                log.i('::list statut - Done')
                return res.status(200).json({ statuts: result.rows });
            }
        })
})

module.exports = router;