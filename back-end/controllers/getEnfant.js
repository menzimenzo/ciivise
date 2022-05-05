const pgPool = require('../pgpool').getPool()

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async function (req, res) {
	log.i('::get - In')
	const idEnfant = req[0]
	const requete = `SELECT * FROM enfant WHERE enf_id = $1;`;

	const enfant = await pgPool.query(requete, [idEnfant]).catch(err => {
		log.w('::get - Erreur survenue lors de la récupération de l\'enfant.', { requete, err: err.stack })
		return res.status(400).json({message: 'erreur lors de la récupération de l\'enfant' + idEnfant});
	})

	if (enfant && enfant.rows.length > 0) {
		log.i('::get - récupération enfant - Done')
		const secondeRequete = `SELECT niv_fin FROM int_enf WHERE enf_id = $1 ORDER BY int_id desc limit 1`;
		const enf_niv = await pgPool.query(secondeRequete, [idEnfant]).catch(err => {
				log.w('::put - Erreur survenue lors de la récupération du niveau de l\'enfant.', { requete, err: err.stack })
				return res.status(400).json({message: 'erreur lors de la récupération du niveau de l\'enfant' + enfant.enf_id});
		})
		
		if (enf_niv) {
			log.i('::get - récupération niveau - Done')
			const format = {
				enf_id: idEnfant,
				prenom: enfant.rows[0].enf_prenom,
				niv_ini: enf_niv.rows[0].niv_fin,
				niv_fin: null
			}
			return format
		}
	}
	else {
		return []
	}
}
