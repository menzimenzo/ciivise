const pgPool = require('../pgpool').getPool()
const { formatIntervention } = require('../utils/utils')

const getUtilisateursFromIntervention = require('./getUtilisateursFromIntervention')
const getEnfantsFromIntervention = require('./getEnfantsFromIntervention')

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async function (req, res) {
    const { id, user } = req
    log.i('In', { id })
    if (!id) {
        log.w('id is missing')
        return res.status(400).json({ message: 'L\'id de l\'intervention est manquant' });
    }
    if (!user) {
        log.w('user is missing')
        return res.status(400).json({ message: 'L\'utilisateur est manquant' });
    }

    let whereClause = ""
    if (user.rol_id == 3 || user.rol_id == 4 || user.rol_id == 5) {
        // les formateurs ou maitre nageur AAQ ne voient que leurs interventions
        whereClause += `LEFT JOIN uti_int ui ON ui.int_id = int.int_id  \
            LEFT JOIN utilisateur uti ON ui.uti_id = uti.uti_id \
            LEFT JOIN piscine pis on int.pis_id = pis.pis_id \
            LEFT JOIN structure str on str.str_id = int.str_id \
            LEFT JOIN commune com on com.cpi_codeinsee = pis.cpi_codeinsee \
            LEFT JOIN (SELECT distinct on (cpi_codeinsee) cpi_codeinsee,cpi_codepostal FROM codepostal_insee) p on p.cpi_codeinsee = pis.cpi_codeinsee \
            WHERE uti.uti_id=${user.uti_id} and int.int_id=${id}`
    } 
    if (user.rol_id == 2 ) {
        // role = 2 => partenaire. On affiche une intervention en fonction de la structure  
        whereClause += `LEFT JOIN uti_int ui ON ui.int_id = int.int_id  \
            LEFT JOIN utilisateur uti ON ui.uti_id = uti.uti_id \
            LEFT JOIN piscine pis on int.pis_id = pis.pis_id \
            LEFT JOIN structure str on str.str_id = int.str_id \
            LEFT JOIN commune com on com.cpi_codeinsee = pis.cpi_codeinsee \
            LEFT JOIN (SELECT distinct on (cpi_codeinsee) cpi_codeinsee,cpi_codepostal FROM codepostal_insee) p on p.cpi_codeinsee = pis.cpi_codeinsee \
            WHERE str.str_id=${user.structureId} and int.int_id=${id}`
    }
    if (user.rol_id == 1 ) {
        whereClause += `LEFT JOIN uti_int ui ON ui.int_id = int.int_id  \
            LEFT JOIN utilisateur uti ON ui.uti_id = uti.uti_id \
            LEFT JOIN piscine pis on int.pis_id = pis.pis_id \
            LEFT JOIN structure str on str.str_id = int.str_id \
            LEFT JOIN commune com on com.cpi_codeinsee = pis.cpi_codeinsee \
            LEFT JOIN (SELECT distinct on (cpi_codeinsee) cpi_codeinsee,cpi_codepostal FROM codepostal_insee) p on p.cpi_codeinsee = pis.cpi_codeinsee \
            WHERE int.int_id=${id}` 
    }
    
    const requete = `SELECT int.*, pis.*, p.* ,str.*,com.* FROM intervention int ${whereClause}`;

    log.d('::select from intervention - récuperation via la requête.', { requete });
    let intervention = []
    await Promise.all([pgPool.query(requete), getUtilisateursFromIntervention(id), getEnfantsFromIntervention(id)]).then(values => {
        intervention = values[0].rows.map(formatIntervention)
        intervention[0].utilisateur = values[1]
        intervention[0].enfant = values[2]
     }).catch(error => {
         log.w('Error durant la récupération des information')
         throw error
     })
    log.i('Done')
    return intervention
    
}
