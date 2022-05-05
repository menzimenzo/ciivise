const pgPool = require('../pgpool').getPool()
//const { formatUtilisateur } = require('../utils/utils')

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async (req, res) => {
    const id = req[0]

    log.i('::delete utilsateurs from Intervention - In')
    const requete = 'delete from uti_int where int_id=$1'
    const deleteUtiInt = await pgPool.query(requete, [id]).catch(err => {
        log.w('::delete - Erreur survenue lors de la suppression dans uti_int.', { requete, err: err.stack })
        return res.status(400).json({ message: 'Erreur survenue lors de la suppression de la relation intervention - utilisateur'});
    })
    if (deleteUtiInt) {
        log.d('::delete uti_int - int N°' + id + ' Done');
    }
}
