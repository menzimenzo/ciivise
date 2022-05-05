const pgPool = require('../pgpool').getPool()

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async function (req, res) {
    const enfants= req[0]
    const interventionId = req[1]

    log.i('::post - In', { enfants, interventionId })
    for (var i = 0; i < enfants.length ; i++) {
        let requete
        let params = []
        
        if (enfants[i].enf_id) {
            requete =  `UPDATE enfant SET enf_prenom = $1 WHERE enf_id=$2 RETURNING enf_id`    
            params = [enfants[i].prenom,enfants[i].enf_id]
        } else {
            requete =  `INSERT INTO enfant(enf_prenom) values($1) RETURNING enf_id`    
            params = [enfants[i].prenom]
        }

        log.d('::post -  params requete' , { params })
        const bddEnfantRes = await pgPool.query(requete,params).catch(err => {
            log.w('::POST - Erreur survenue lors de la l\'insertion dans la table enfants.', { requete, err: err.stack })
            return res.status(400).json({message: 'Erreur survenue lors de la l\'insertion dans la table enfants'});
        })
        if (bddEnfantRes) {
            log.d('::post - insert enfants '+bddEnfantRes.rows[0].enf_id + '- Done');
            const secondeRequete = `INSERT INTO int_enf(int_id,enf_id,niv_ini,niv_fin) VALUES ($1,$2,$3,$4)`
            const bddInsertIntenf = await pgPool.query(secondeRequete,[interventionId, bddEnfantRes.rows[0].enf_id,enfants[i].niv_ini,enfants[i].niv_fin]).catch(err => {
                log.w('::POST - Erreur survenue lors de la l\'insertion dans la table int_enf.', { secondeRequete, err: err.stack })
                return res.status(400).json({message: 'Erreur survenue lors de la l\'insertion dans la table int_enf'});
            })
            if (bddInsertIntenf) {
                log.d('::post - insert enfants - int N°' + interventionId + ' enfants n°' + bddEnfantRes.rows[0].enf_id + ' Done')
            }
        }
    }
    log.i('::post - Done')
}
