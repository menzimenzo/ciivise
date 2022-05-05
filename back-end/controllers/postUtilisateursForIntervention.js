const pgPool = require('../pgpool').getPool()

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async (req, res) => {
    const users = req[0]
    const InterventionId = req[1]
    log.i('::post - In', { users, InterventionId })
    const insertion =  async user => {
        await pgPool.query('INSERT INTO uti_int(uti_id,int_id,rol_initial_id) VALUES ($1, $2, $3) returning *', [user.id, InterventionId,user.rol_id])
            .then(res => {
                log.d('::post - insert Utilisateur - int N°' + InterventionId + ' dans uti_int pour ' + user.id + ' Done');
            }) 
            .catch(err => {
                log.w(`::post - erreur sur l\'instertion du user ${user.id} pour l'intervention ${InterventionId}` )
                return err
            })   
    }

    const actions = users.map(insertion)
    await Promise.all(actions)
        .then(() => log.i('::post - Done'))
        .catch(err => {
            log.w('::post - erreur sur la query finale' )
            throw err
        })
}
