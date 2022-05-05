const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();

const logger = require('../utils/logger')
const log = logger(module.filename)

router.get('/', function (req, res) {
    log.i('::listCommunes - In')
    // Mantis 86660
    // const v_codepostal = parseInt(req.query.codepostal)
    // Il ne faut pas parser en Int sinon on perd le 0 devant et les
    // communes des départements 01 à 09 ne sont pas trouvés.
    const v_codepostal = req.query.codepostal
    // Recherche des communes correspondant au codepostal
    return pgPool.query(`SELECT com.*, dep.reg_num
                FROM commune com  
                INNER JOIN codepostal_insee  cpi on cpi.cpi_codeinsee = com.cpi_codeinsee 
                INNER JOIN departement dep on com.dep_num = dep.dep_num
                WHERE cpi.cpi_codepostal=$1`, [v_codepostal],
        (err, result) => {
            if (err) {
                log.w('::listCommunes - erreur', err)
                return res.status(400).json({ message: 'erreur sur la requete de listcommune' });
            }
            else {
                log.i('::listCommunes - done', { count: result.rowCount})
                const communes = result.rows;
                return res.status(200).json({ communes });
            }
        })
})

router.get('/byCodeInsee', function (req, res) {
    log.i('::listCommunes by codeInsee - In')
    const v_codeinsee = parseInt(req.query.codeinsee)
    // Recherche des communes correspondant au codepostal
    return pgPool.query(`SELECT com.*, dep.reg_num
                FROM commune com  
                INNER JOIN codepostal_insee  cpi on cpi.cpi_codeinsee = com.cpi_codeinsee 
                INNER JOIN departement dep on com.dep_num = dep.dep_num
                WHERE cpi.cpi_codeinsee =$1`, [v_codeinsee],
        (err, result) => {
            if (err) {
                log.w('::listCommunes - erreur', err)
                return res.status(400).json({ message: 'erreur sur la requete de listcommune' });
            }
            else {
                log.i('::listCommunes - done', { count: result.rowCount})
                const communes = result.rows;
                return res.status(200).json({ communes });
            }
        })
});

module.exports = router;