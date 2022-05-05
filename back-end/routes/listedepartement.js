const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();

const logger = require('../utils/logger')
const log = logger(module.filename)

router.get('/', function (req, res) {
        log.i('::listdepartement - In')
        pgPool.query(`SELECT dep_num, dep_libelle FROM departement`,
            (err, result) => {
                if (err) {
                    log.w('::listdepartement - Erreur', err)
                    return res.statusCode(400).json({ message: 'erreur sur la requete de listedepartement' });
                }
                else {
                    log.i('::listdepartement - Done', { count: result.rowCount })
                    const departements = result.rows;
                    return res.status(200).json({ departements });
                }
            });
    });

    router.get('/:id', function (req, res) {
        const id = req.params.id
        log.i('::Get- In', { id })
        pgPool.query(`SELECT dep_num, dep_libelle FROM departement where dep_num=$1`,[id],
            (err, result) => {
                if (err) {
                    log.w('::Get - Erreur', err)
                    return res.statusCode(400).json({ message: 'erreur sur la requete de listedepartement' });
                }
                else {
                    log.i('::get - Done', { count: result.rowCount })
                    const departement = result.rows;
                    return res.status(200).json({ departement });
                }
            });
    });

module.exports = router;