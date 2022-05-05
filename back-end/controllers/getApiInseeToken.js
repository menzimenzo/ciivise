const axios = require('axios');

const logger = require('../utils/logger')
const log = logger(module.filename)

module.exports = async function() {
    log.i('In')
    const url = "https://api.insee.fr/token"
    const headers = {
        "Authorization": "Basic Sk1fb2xoT1BSVXRVOE9FV212U2pHUW9HWjNRYTpCSVljNHJJOWRMMzFXZ2xBQ1o0MFJEdW5rSmdh",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    const params = new URLSearchParams()
    params.append("grant_type","client_credentials" )
    params.append("client_secret","BIYc4rI9dL31WglACZ40RDunkJga" )
    params.append("client_id","JM_olhOPRUtU8OEWmvSjGQoGZ3Qa" )

    const response = await axios.post(url, params, headers)
        .catch(err => {
            log.w('Error on api.insee', err)
            throw new Error('Une erreur est survenue lors de la génération du token pour l\'API INSEE.')
        })
    log.i('Done')
    return response && response.data && response.data.access_token
}
