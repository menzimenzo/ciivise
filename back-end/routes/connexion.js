const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const logger = require('../utils/logger')
const log = logger(module.filename)

const pgPool = require('../pgpool').getPool();
const config = require('../config');
const { sendEmail, sendValidationMail, sendResetPasswordMail } = require('../utils/mail-service')
const { getAuthorizationUrl, getLogoutUrl, formatUtilisateur } = require('../utils/utils')
const { oauthCallback, pwdLogin, generateForgotPasswordEncryption } = require('../controllers/index')

router.get('/login', (req, res) => {
    log.i('::login via France Connect')
    return res.send({url: getAuthorizationUrl()});
})

// Gère une connexion via mot de passe.
router.post('/pwd-login', pwdLogin)

// Gère une connexion validée avec FC
router.get('/callback', oauthCallback);

// Valide un compte utilisateur avec les infomations complémentaires
router.post('/verify', async (req,res) => {
    log.i('::verify - In')
    if(!req.body.id){
        log.w('::verify - Aucun ID à ajouter en base.') 
        return res.sendStatus(500)
    }
    let wasValidated = req.body.validated
    const tokenFc = req.body.tokenFc
    let user = formatUtilisateur(req.body, false)

    // Vérifier si l'email est déjà utilisé en base.
    // ##############LSC##############
    //const requete = `SELECT uti.*, usr.sre_id FROM utilisateur uti left join uti_sre usr on usr.uti_id = uti.uti_id  WHERE lower(uti.uti_mail)=lower('${mail}')`;
    const mailExistenceQuery = await pgPool.query(`SELECT lower(uti_mail) uti_mail,uti_pwd, uti_tockenfranceconnect, usr.sre_id FROM utilisateur uti left join uti_sre usr on usr.uti_id = uti.uti_id and usr.uts_actif = true WHERE lower(uti.uti_mail)=lower('${user.uti_mail}')`).catch(err => {
        log.w(err)
        throw err
    })

    if(mailExistenceQuery && mailExistenceQuery.rowCount > 0 && mailExistenceQuery.rows[0].uti_pwd && tokenFc) {
        log.d('Vérifications complémentaires nécessaires avant ajout en base. ')
        return res.status(200).json({ existingUser: formatUtilisateur(mailExistenceQuery.rows[0]) })
    } 

    // Pour un maitre nageur, vérifier si le numéro EAPS est présent dans la table ref_eaps
    // Exception pour l'admin, le partenaire et la structure de référence
    if (user.rol_id != 1 && user.rol_id != 2 && user.rol_id != 6 && user.rol_id != 7) {

        if (user.eaps != '') {
            log.d('::verify - Recherche numéro EAPS') 
            const eapslExistenceQuery = await pgPool.query(`SELECT eap_numero FROM ref_eaps WHERE eap_numero='${user.uti_eaps}'`).catch(err => {
                log.w(err)
                throw err

            })
            if (eapslExistenceQuery.rowCount == 0) {
                return res.status(200).json({nonAuthorizedUser: 'Vous n\'êtes pas autorisé(e) à vous créer un compte (carte professionnelle invalide)'})
            }
        }
    }

    log.d('::verify - Mise à jour de l\'utilisateur existant', { insee: user.uti_com_codeinseecontact, mailcontact: user.uti_mailcontact })   
    const bddUserRes = await pgPool.query("UPDATE utilisateur SET  uti_mail = lower($1), uti_nom = $2, uti_prenom = $3, uti_validated = true, \
    uti_eaps = $4, uti_publicontact = $5, uti_mailcontact = lower($7), uti_sitewebcontact = $8, uti_adrcontact = $9, uti_compadrcontact = $10, uti_telephonecontact = $11,  uti_com_codeinseecontact = $12, uti_com_cp_contact = $13, uti_donneleconsparticulieres = $14 WHERE uti_id = $6 RETURNING *", 
    [user.uti_mail, user.uti_nom, user.uti_prenom, user.uti_eaps,Boolean(user.uti_publicontact), user.uti_id, user.uti_mailcontact,user.uti_sitewebcontact,user.uti_adrcontact, user.uti_compadrcontact,user.uti_telephonecontact , user.uti_com_codeinseecontact, user.uti_com_cp_contact, Boolean(user.uti_donneleconsparticulieres)]).catch(err => {
        log.w(':: verify - error on update user', err)
        throw err
    })
    
    // Envoie de l'email de confirmation
    if(!wasValidated && user.rol_id != 1 && user.rol_id != 2 && user.rol_id != 7){
        log.d('::verify - Mail de confirmation envoyé.')
        sendEmail({
            to: user.uti_mail,
            subject: 'création compte, site prévention des noyades,  recensement des maitres nageurs',
            body: `<p>Bonjour,</p>
                <p>Votre compte a bien été créé. <br/><br/>
                Nous vous invitons à faire votre demande auprès de votre formateur Aisance Aquatique la demande d'activation de compte « Aisance Aquatique » .<br/>
                Le site <a href="https://www.sports.gouv.fr/preventiondesnoyades">Prevention des noyades</a> est à votre disposition pour toute information sur le programme Aisance Aquatique.<br/></p>`
            })
        }
     
    user = formatUtilisateur(bddUserRes.rows[0])
    req.session.user = bddUserRes.rows[0]
    
    const isPwdConfirmed = bddUserRes.rows[0] && bddUserRes.rows[0].uti_pwd && bddUserRes.rows[0].pwd_validated
    if(!isPwdConfirmed && !user.tokenFc) {
        log.d('::verify - mot de passe à valider.')
        await sendValidationMail({
            email: bddUserRes.rows[0].uti_mail,
            pwd: bddUserRes.rows[0].uti_pwd,
            id: bddUserRes.rows[0].uti_id,
            siteName: 'Aisance Aquatique',
            url: `${config.FRONT_DOMAIN}`,
        })
        .then(() => {
            log.d('Mail de confirmation envoyé')
            req.session.user = null
        })
        .catch(err => {
            log.w(err)
            throw err
        })
    }

    log.i('::verify - Done')
    return res.send({user, isPwdConfirmed })
})

// Nouveur user FC mais qui a déjà une connexion via mot de passe.
// Vérification des duplicatas en base sur base de tokenFC et update du user existant
router.put('/confirm-profil-infos', async (req,res) => {
    const user = req.body && req.body.user
    const mail = user && user.mail
    const tokenFc = user && user.tokenFc
    const candidate = user && user.password && await crypto.createHash('md5').update(user.password).digest('hex')
    log.i('::confirm-profil-infos - In', {mail , candidate, tokenFc})

    const authConfirmationQuery = await pgPool.query(`SELECT * FROM utilisateur WHERE lower(uti_mail)=lower('${mail}')`).catch(err => {
        log.w('::confirm-profil-infos - Erreur pendant la suppression des users.', err)
        throw err
    })

    const existingUser = authConfirmationQuery.rows && authConfirmationQuery.rows[0]
    const isMatch = existingUser.uti_pwd && existingUser.uti_pwd === candidate
    if(!isMatch) {
        log.w('::confirm-profil-infos - Les mots de passes ne matchent pas.')
        return res.status(400).json({message: 'Le mot de passe fourni est incorrect ou l\'utilisateur n\'en possède pas. Veuillez contacter l\'assistance.'});        
    }

    await pgPool.query(`DELETE FROM utilisateur WHERE uti_tockenfranceconnect='${tokenFc}' RETURNING *`).catch(err => {
        log.w('::confirm-profil-infos - Erreur pendant la suppression des users.', err)
        throw err
    })
    
    const bddUpdate =  await pgPool.query("UPDATE utilisateur SET uti_tockenfranceconnect = $1, uti_mail = lower($2), uti_prenom = $3, uti_nom = $4 \
    WHERE uti_id = $5 RETURNING *", 
    [tokenFc, mail, user.prenom, user.nom, existingUser.uti_id]).catch(err => {
        log.w('::confirm-profil-infos - Erreur pendant l\'update des infos du user', err)
        throw err
    })
    
    const updatedUser = bddUpdate.rows && bddUpdate.rows[0]
    log.d('::confirm-profil-infos - Done, renvois du user mis à jour', updatedUser)
    req.session.user = updatedUser
    req.accessToken = updatedUser.uti_tockenfranceconnect;
    req.session.accessToken = updatedUser.uti_tockenfranceconnect;
    return res.send(formatUtilisateur(updatedUser))
})

router.post('/create-account-pwd', async (req, res) => {
    log.i('::create-account-pwd - In')
    const { password , mail, confirm, connexionType,role } = req.body
    if(!password || !mail || !confirm || !role) {
        log.w('::create-account-pwd - paramètre manquant')
        throw new Error("Un paramètre manque pour effectuer l'inscription.")
    }
    const formatedMail = mail.toLowerCase()
    const crypted = await crypto.createHash('md5').update(password).digest('hex')
    let bddRes
    let confirmInscription
    let profil
    // Vérifier si l'email est déjà utilisé en base.
    const mailExistenceQuery = await pgPool.query(`SELECT uti_id, lower(uti_mail), uti_tockenfranceconnect, uti_pwd FROM utilisateur WHERE lower(uti_mail)=lower('${formatedMail}')`).catch(err => {
        log.w(err)
        throw err
    })
    if(mailExistenceQuery && mailExistenceQuery.rowCount > 0) {
        if(mailExistenceQuery.rows[0].uti_tockenfranceconnect && !mailExistenceQuery.rows[0].uti_pwd) {
            log.d('::create-account-pwd - Utilisateur déjà connecté via FC.')
            confirmInscription = false
            bddRes = await pgPool.query(`UPDATE utilisateur SET uti_pwd= $1 WHERE uti_id= $2 RETURNING *`, [ crypted, mailExistenceQuery.rows[0].uti_id]
                ).catch(err => {
                    log.w(err)
                    throw err
                })
            await sendValidationMail({
                email: mailExistenceQuery.rows[0].uti_mail,
                pwd: crypted,
                id: mailExistenceQuery.rows[0].uti_id,
                siteName: 'Aisance Aquatique',
                url: `${config.FRONT_DOMAIN}`,
            })
            .then(() => log.d('Mail de confirmation envoyé'))
            .catch(err => {
                log.w(err)
                throw err
            })
        } else {
            log.d('::create-account-pwd - Utilisateur a déjà un password pour ce site.')
            return res.status(400).json({message: 'Cet email est déjà associé à un mot de passe.'});        
        }
    } else {
        log.d('::create-account-pwd - Nouveau user, authentifié via password, à ajouter en base')
        /*if (connexionType == 2) {
            profil = role
        }
        else {
            profil=role
        }*/
        confirmInscription = true    
        bddRes = await pgPool.query(
            'INSERT INTO utilisateur(rol_id, stu_id, uti_mail, uti_validated, uti_pwd)\
            VALUES($1, $2, lower($3), $4, $5) RETURNING *'
            , [role, 1, formatedMail, false, crypted ]
          ).catch(err => {
            log.w(err)
            throw err
          })
    }

    req.session.user = bddRes.rows[0]
    req.accessToken = bddRes.rows[0].uti_pwd;
    req.session.accessToken = bddRes.rows[0].uti_pwd;
    const user = formatUtilisateur(bddRes.rows[0])
    log.i('::create-account-pwd - Done')
    return res.send({ user, confirmInscription })
})

// Envoie l'utilisateur de la session
router.get('/user', (req,res) => {
    if(!req.session || !req.session.user || !req.session.accessToken){
        return res.sendStatus(404)
    }
    return res.send(formatUtilisateur(req.session.user))
})

// Route pour la mise à jour du compte utilisateur à partir de 'MonCompte'
router.put('/edit-mon-compte/:id', async function (req, res) {
    const profil = req.body.profil
    const id = req.params.id
    log.i('::edit-mon-compte - In', { id, profil })

    if(!id) {
        return res.status(400).json({message: 'Aucun ID fournit pour  identifier l\'utilisateur.'});
    }
    const requete = `UPDATE utilisateur SET  
                    uti_mail = lower($1), 
                    uti_nom = $2, 
                    uti_prenom = $3, 
                    uti_validated = true, 
                    uti_eaps = $4, 
                    uti_publicontact = $5, 
                    uti_mailcontact = lower($7), 
                    uti_sitewebcontact = $8, 
                    uti_adrcontact = $9, 
                    uti_compadrcontact = $10, 
                    uti_telephonecontact = $11,  
                    uti_com_codeinseecontact = $12, 
                    uti_com_cp_contact = $13 ,
                    uti_donneleconsparticulieres = $14
                    WHERE uti_id = $6
                    RETURNING *
                    ;`

        
    pgPool.query(requete,[profil.mail, profil.nom, profil.prenom, profil.eaps,Boolean(profil.publicontact), profil.id, profil.mailcontact,profil.sitewebcontact,profil.adrcontact, profil.compadrcontact,profil.telephonecontact , profil.cpi_codeinsee, profil.cp, Boolean(profil.donneleconsparticulieres)], (err, result) => {
        if (err) {
            log.w('::edit-mon-compte - erreur lors de l\'update', {requete, erreur: err.stack});
            return res.status(400).json({message: 'erreur lors de la sauvegarde de l\'utilisateur'});
        }
        else {
            log.i('::edit-mon-compte - Done')
            req.session.user = result.rows[0]
            return res.status(200).json({ user: formatUtilisateur(result.rows[0])});
        }
    })
    log.i('edit-mon-compte::Done')

})

// Validation du mot de passe.
router.get('/enable-mail/:pwd/user/:id', async function(req, res) {
    const { id, pwd } = req.params
    log.i('::enable-mail - In', { id })
    if(!id) {
        return res.status(400).json({ message: 'Aucun ID fournit pour  identifier l\'utilisateur.'});
    }

    const userQuery = await pgPool.query(`SELECT * FROM utilisateur WHERE uti_id='${id}'`).catch(err => {
        log.w(err)
        throw err
    })
    const user= userQuery.rowCount === 1 && userQuery.rows[0]

    if(!user) {
        return res.status(404).json({message: "L'utilisateur n'existe pas."});        
    }

    log.d('::enable-mail - user found', { user })
    if(user.uti_pwd === pwd && !user.pwd_validated) {
        const requete = `UPDATE utilisateur 
            SET pwd_validated = $1
            WHERE uti_id = $2
            RETURNING *
            ;`    
        pgPool.query(requete,[true, id], (err, result) => {
            if (err) {
                log.w('::enable-mail - erreur lors de l\'update', {requete, erreur: err.stack});
                return res.status(400).json({message: 'erreur lors de la sauvegarde de l\'utilisateur'});
            }
            else {
                log.i('::enable-mail - Done, pwd has been validated.')
                req.session.user = result.rows[0]
                req.accessToken = result.rows[0].uti_pwd;
                req.session.accessToken = result.rows[0].uti_pwd;
                return res.status(200).json({ user: formatUtilisateur(result.rows[0])});
            }
        })
    } else {
        log.w('::enable-mail - erreur concernant le user à valider.')
        return res.status(400).json({message: 'L\'utilisateur a déjà validé son mot de passe ou le mot de passe fournit est incorrecte.'});
    }    
})

// Reset du mot de passe oublié.
router.post('/forgot-password/:mail', async function(req, res) {
    const { mail } = req.params
    log.i('::forgot-password - In', { mail })

    if (!mail) {
        log.w('::forgot-password - mail absent de la requête.')
        return res.status(400).json({ message: 'Une adresse mail valide est nécessaire pour renouveler votre mot de passe.' })
    }
    await generateForgotPasswordEncryption({ mail })
        .then(encryption => {
            log.i('::forgot-password - Done', encryption)
            return sendResetPasswordMail(encryption)
                .then(() => {
                    return res.status(200).json({message: 'ok'})
                })
        }).catch(error => {
            log.w('::forgot-password - erreur', error)
            return res.status(400).json({message: error.message});        
        })
})

router.post('/reset-password', async function(req, res) {
    const { id, old, password } = req.body
    log.i('::reset-password - In', { id, old, password })

    if(!id || !old || !password) {
        log.w('::reset-password - paramètre manquant.')
        return res.status(400).json({ message: 'Un paramètre manque à la requête.' })
    }

    const userQuery = await pgPool.query(`SELECT uti_id, uti_pwd FROM utilisateur WHERE uti_pwd='${old}'`).catch(err => {
        log.w(err)
        throw err
    })
    const user = userQuery.rows && userQuery.rows.find( user => {
        const candidate = user.uti_id && crypto.createHash('md5').update(user.uti_id.toString()).digest('hex')
        return candidate === id
    })
    if(!user) {
        log.w('::reset-password - Utilisateur inexistant.')
        return res.status(404).json({ message: 'Aucun utilisateur trouvé.' })
    }

    log.d('::reset-password - Mise à jour du user.')
    const newPwd= await crypto.createHash('md5').update(password).digest('hex')
    const updateRequete = `UPDATE utilisateur SET uti_pwd=$1, pwd_validated=true WHERE uti_id=$2;`    
    return pgPool.query(updateRequete,[ newPwd, user.uti_id],(err) => {
        if (err) {
            log.w('::reset-password - erreur lors de l\'update', {erreur: err.stack});
            return res.status(400).json({message: 'erreur lors de la sauvegarde du nouveau mot de passe.'});
        }
        else {
            log.i('::reset-password - Done, nouveau mot de passe enregistré.')
            return res.status(200).json({message: 'ok'});
        }
    })
})

// Envoie l'url FC pour se déconnecter
router.get('/logout', async(req, res) => {
    log.i('::logout - In')
    let url
    if(req.session.idToken) url = await getLogoutUrl(req)
    req.session && req.session.destroy()
    res.send({url});
})

// Nettoie la session de l'utilisateur
router.get('/logged-out', (req, res) => {
    log.i('::logged-out - In')    
    // Resetting the id token hint.
    req.session.idToken = null;
    // Resetting the userInfo.
    req.session.user = null;
    return res.send('OK')
})

router.get('/', function (req, res) {
    res.send('Ceci est la route de connexion');
})

module.exports = router;
