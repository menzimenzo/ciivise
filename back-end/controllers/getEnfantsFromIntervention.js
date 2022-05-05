const pgPool = require('../pgpool').getPool()

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async function (req, res) {
    const idIntervention = req
    log.i('In', { idIntervention })
    if (!idIntervention) {
        log.w('id is missing')
        return res.status(400).json({ message: 'L\'id de l\'intervention est manquant' });
    }

    log.i('::select from int_enf - In ')
    const requete = `SELECT ien.enf_id AS enf_id, ien.niv_ini AS niv_ini, ien.niv_fin AS niv_fin, enf.enf_prenom AS prenom\
    FROM int_enf ien \
    LEFT JOIN enfant enf on enf.enf_id = ien.enf_id \
    LEFT JOIN intervention int on int.int_id = ien.int_id \
    WHERE ien.int_id = ${idIntervention}`

    log.d('::select from int_enf - récuperation via la requête.', { requete });
    const result = await pgPool.query(requete).catch(err => {
        log.w('::put - Erreur survenue lors de la récupération des enfants liés à une intevention.', err)
        return res.status(400).json({ message: 'erreur lors de la récupération des enfants liés à une intevention'});
    })
    
    log.i('::select from int_enf - Done')
    return result.rows
}
