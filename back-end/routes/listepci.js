const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();

const logger = require('../utils/logger')
const log = logger(module.filename)

router.get('/', function (req, res) {
    log.i('::listepci - In')
    const v_codepostal = req.query.codepostal;
    // Recherche des EPCI correspondant au codepostal
    pgPool.query(`SELECT ep.epci_id,ep.epci_code, ep.epci_libelle from epci ep
                JOIN codepostal_insee cpi on cpi.cpi_codeinsee = ep.com_codeinsee
                WHERE cpi.cpi_codepostal = '${v_codepostal}' limit 1`,
        (err, result) => {
            if (err) {
                log.w('::listepci - Erreur', err);
                return res.status(400).json({ message: 'Erreur survenue lors de la récupération des collectivités territoriales.' });
            }
            else {
                log.i('::listepci - Done', { count: result.rowCount})
                const epci = result.rows;
                return res.status(200).json({ epci });
            }
        });
});

router.get('/:id', function (req, res) {
    const id = req.params.id
    log.i('::listepci by Id - In', {id})
    // Recherche des EPCI correspondant au code ECI
    pgPool.query(`SELECT ep.epci_id,ep.epci_code, ep.epci_libelle from epci ep
                WHERE ep.epci_code = '${id}' limit 1`,
        (err, result) => {
            if (err) {
                log.w('::listepci - Erreur', err);
                return res.status(400).json({ message: 'Erreur survenue lors de la récupération des collectivités territoriales.' });
            }
            else {
                log.i('::listepci - Done', { count: result.rowCount})
                const epci = result.rows;
                return res.status(200).json({ epci });
            }
        });
});

module.exports = router;