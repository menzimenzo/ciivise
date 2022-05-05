const pgPool = require('../pgpool').getPool()

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports =  async function (req, res) {
	const enfant = req[0]
	const id = req[1]
	log.i('::put - In', { id, enfant })
	const requete = `UPDATE enfant SET enf_prenom=$1 WHERE enf_id = $2 RETURNING *;`;

	const updateEnf = await pgPool.query(requete, [enfant.prenom, enfant.enf_id]).catch(err=> {
			log.w('::put - Erreur survenue lors de la mise à jour du prénom.', { requete, err: err.stack })
			return res.status(400).json({message: 'erreur lors de la mise à jour du prénom de l\'enfant' + enfant.enf_id});
		})

	if (updateEnf) {
		log.i('::put - mise à jour table enfant - Done')
		const secondeRequete = `UPDATE int_enf set niv_ini=$1,niv_fin=$2 WHERE enf_id = $3 AND int_id=$4 RETURNING *;`;
		
		const updateIntEnf = await pgPool.query(secondeRequete, [enfant.niv_ini, enfant.niv_fin, enfant.enf_id, id]).catch(err => {
				log.w('::put - Erreur survenue lors de la mise à jour du niveau de l\'enfant.', { requete, err: err.stack })
				return res.status(400).json({message: 'erreur lors de la mise à jour du niveau de l\'enfant' + enfant.enf_id});
		})
		if (updateIntEnf) {
				log.i('::put - Done')
				res.status(200).json({updateIntEnf})
		}
	}

}
