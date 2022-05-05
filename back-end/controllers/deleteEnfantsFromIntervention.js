const pgPool = require('../pgpool').getPool()
//const { formatUtilisateur } = require('../utils/utils')

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async function (req, res) {
    const id = req[0]

    log.i('::delete Enfant from Intervention - In')
    const requete = 'delete from int_enf where int_id=$1'
    const deleteIntEnf = await pgPool.query(requete, [id]).catch(err => {
        log.w('::delete - Erreur survenue lors de la la suppression dans la table int_enf.', { requete, err: err.stack })
        return res.status(400).json({ message: 'Erreur survenue lors de la la suppression de la liaison intervention - enfant' });
    })
    if (deleteIntEnf) {
        log.d('::delete int_enf - int N°' + id + ' Done');
    }
}
