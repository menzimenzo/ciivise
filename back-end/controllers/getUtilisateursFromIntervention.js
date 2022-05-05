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

    log.i('::select from utilisateur - In ')
    const requete = `SELECT uti.uti_id AS id, uti.uti_nom AS nom, uti.uti_prenom AS prenom, uti.uti_mail AS mail \
                    FROM utilisateur uti \
                    LEFT JOIN uti_int ui on uti.uti_id = ui.uti_id \
                    LEFT JOIN intervention int on int.int_id = ui.int_id \
                    WHERE int.int_id = ${idIntervention}`

    log.d('::select from utilisateur - récuperation via la requête.', { requete });
    const result = await pgPool.query(requete).catch(err => {
        log.w('::put - Erreur survenue lors de la récupération des utilisateurs d\'une intervention.', err)
        return res.status(400).json({message: 'erreur lors de la récupération des utilisateurs d\'une intervention'})
    })
    log.i('::select from utilisateur - Done')
    return result.rows
}
