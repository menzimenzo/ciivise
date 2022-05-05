module.exports = {
    oauthCallback: require('./oauthCallback'),
    pwdLogin: require('./pwdLogin'),
    generateForgotPasswordEncryption: require('./generateForgotPasswordEncryption'),
    getIntervention: require('./getIntervention'),
    
    getUtilisateursFromIntervention: require('./getUtilisateursFromIntervention'),
    postUtilisateursForIntervention: require('./postUtilisateursForIntervention'),
    deleteUtilisateursFromIntervention: require('./deleteUtilisateursFromIntervention'),

    getEnfantsFromIntervention: require('./getEnfantsFromIntervention'),
    postEnfantsForIntervention: require('./postEnfantsForIntervention'),
    putEnfant: require('./putEnfant'),
    deleteEnfant: require('./deleteEnfant'),
    deleteEnfantsFromIntervention: require('./deleteEnfantsFromIntervention'),
    getEnfant: require('./getEnfant'),
    getApiInseeToken: require('./getApiInseeToken') 
}
