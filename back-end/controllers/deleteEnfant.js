const pgPool = require('../pgpool').getPool()
//const { formatUtilisateur } = require('../utils/utils')

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async function (req, res) {
    log.i('::delete - In')
    const enfant = req[0]
    const id = req[1]

    //insert dans la table intervention
    const requete = `delete from int_enf where int_id=$1 and enf_id=$2;`;


    const titi = await pgPool.query(requete, [id, enfant]).catch(err => {
        log.w('::put - Erreur survenue lors de la supression de l\'enfant.', { requete, err: err.stack })
        return res.status(400).json({ message: 'erreur lors de la suppression de l\'enfant' + enfant.enf_id });
    })
    if (titi) {
        log.i('::delete - mise à jour table enfant - Done')
        return titi
    }

}


