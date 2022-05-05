const express = require('express');
const router = express.Router();
const stringify = require('csv-stringify')
const pgPool = require('../pgpool').getPool();
var moment = require('moment');
moment().format();

const logger = require('../utils/logger')
const log = logger(module.filename)

const formatStructureRef = structureref => {

    return {
        id: structureref.sre_id,
        libellecourt: structureref.sre_libellecourt,
        libelle: structureref.sre_libelle,
        courriel: structureref.sre_courriel,
        actif: structureref.str_actif
    }
}



// Récupération de la liste des formateurs filtré par rôle
// Essenciellement utilisé pour lister la liste des formateurs
router.get('/liste/', async function (req, res) {
    log.i('::list - In')

    const utilisateurCourant = req.session.user;
    log.d("RoleId utilisateur courant : "+utilisateurCourant.rol_id)

    // si on est admin, on affiche toutes les structures
    if (utilisateurCourant.rol_id == 1) {
        requete = `SELECT sre.*
        from structure_ref sre
        where sre.sre_actif = true
        order by sre.sre_libellecourt asc`;
    } else
    {
        // Si on est MN : On affiche que les structures qui valident les demandes en central
        requete = `SELECT sre.*
        from structure_ref sre
        where sre.sre_actif = true
            and sre_traitementcentral = true
        order by sre.sre_libellecourt asc`;
    }

    log.d('::list - requete',{ requete })
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::list - erreur lors de la récupération des structures référentes.',err.stack);
            return res.status(400).json({message: 'erreur lors de la récupération des structures référentes actives'});
        }
        else {
            log.i('::list - Done')
            const structureref = result.rows.map(formatStructureRef);
            res.json({ structureref });
        }
    })
});

module.exports = router;