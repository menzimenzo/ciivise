const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();
const config =  require( '../config')
const { sendEmail } = require('../utils/mail-service')
const { formatDemandeAAQ } = require('../utils/utils')

const logger = require('../utils/logger');
const log = logger(module.filename)

router.get('/', function (req, res) {
    const { formateurid, demandeurid, structurerefid } = req.query
    log.i('::list - In', { formateurid, demandeurid, structurerefid })    
    if (!formateurid && !demandeurid && !structurerefid) {
        log.w('::list - ID manquant')    
        return res.sendStatus(400).json({ message: 'L\'identifiant du formateur, demandeur ou structureref est manquant.' })
    }

    let whereClause = null 
    let id = null
    if (structurerefid) {
        id = structurerefid
        whereClause = 'dem_sre_id='
    }
    if (demandeurid) {
        id = demandeurid
        whereClause = 'dem_uti_demandeur_id='
    }
    if (formateurid) {
        id = formateurid
        whereClause = 'dem_uti_formateur_id='
    }
    const requete = `SELECT dem.*,to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq,to_char(dem.dem_dateaccord, 'DD/MM/YYYY') dateaccordaaq,uti.uti_nom, uti.uti_prenom, sre.sre_libellecourt,uti.uti_mail, sre.sre_courriel, \ 
    to_char(dem.dem_daterefus, 'DD/MM/YYYY') daterefusaaq,  \ 
    dem.dem_dms_id statutdemande, \ 
    dem.dem_motifrefus motifrefus \ 
    FROM demande_aaq dem \
    LEFT JOIN utilisateur AS uti ON uti.uti_id = dem.dem_uti_formateur_id \
    LEFT JOIN structure_ref as sre on sre.sre_id = dem.dem_sre_id \         
    WHERE ${whereClause}${id} and dem_dms_id in (0,1)`

    log.i('::list - requête', { requete })    
    return pgPool.query(requete,(err, result) => {
        if (err) {
            log.w('::list - error', err)
            return res.status(400).json({ message: 'erreur sur la requete de recherche demande aaq' });
        }
        else {
            log.i('::list - Done')    
            const demandesAaq = result.rows;
            return res.status(200).json({ demandesAaq });
        }
    });
        
})

router.get('/refus/', function (req, res) {
    const { formateurid, demandeurid, structurerefid } = req.query
    log.i('::list refus - In', { formateurid, demandeurid, structurerefid })    
    if (!formateurid && !demandeurid && !structurerefid) {
        log.w('::list refus - ID manquant')    
        return res.sendStatus(400).json({ message: 'L\'identifiant du formateur, demandeur ou structureref est manquant.' })
    }

    let whereClause = null 
    let id = null
    if (structurerefid) {
        id = structurerefid
        whereClause = 'dem_sre_id='
    }
    if (demandeurid) {
        id = demandeurid
        whereClause = 'dem_uti_demandeur_id='
    }
    if (formateurid) {
        id = formateurid
        whereClause = 'dem_uti_formateur_id='
    }
    const requete = `SELECT dem.*,to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq,to_char(dem.dem_daterefus, 'DD/MM/YYYY') daterefusaaq,uti.uti_nom, uti.uti_prenom, sre.sre_libellecourt,uti.uti_mail, sre.sre_courriel \ 
    FROM demande_aaq dem \
    LEFT JOIN utilisateur AS uti ON uti.uti_id = dem.dem_uti_formateur_id \
    LEFT JOIN structure_ref as sre on sre.sre_id = dem.dem_sre_id \         
    WHERE ${whereClause}${id} and dem.dem_dms_id = 3`

    log.i('::list refus - requête', { requete })    
    return pgPool.query(requete,(err, result) => {
        if (err) {
            log.w('::list refus - error', err)
            return res.status(400).json({ message: 'erreur sur la requete de recherche demande aaq' });
        }
        else {
            log.i('::list refus - Done')    
            const demandesAaqRefus = result.rows;
            return res.status(200).json({ demandesAaqRefus });
        }
    });
        
})

router.get('/liste/', function (req, res) {
    log.i('::list - In')    
    const requete = `select sre.sre_libellecourt, 
                        (SELECT count(*) 
                            from demande_aaq 
                            inner join utilisateur uti on uti.uti_id = demande_aaq.dem_uti_demandeur_id
                            where sre.sre_id = dem_sre_id 
                            and dem_dms_id = 1 and rol_id = 5) dem_en_attente, 
                        (SELECT count(*) from demande_aaq 
                            where sre.sre_id = dem_sre_id 
                            and dem_dms_id = 2) dem_validee, 
                        (SELECT count(*) from demande_aaq 
                            where sre.sre_id = dem_sre_id 
                            and dem_dms_id = 3) dem_refusee, 
                        (SELECT count(*) 
                            from demande_aaq  
                            inner join utilisateur uti on uti.uti_id = demande_aaq.dem_uti_demandeur_id
                            where sre.sre_id = dem_sre_id and ((dem_dms_id = 1 and rol_id = 5) or dem_dms_id <> 1)) dem_total
                    from structure_ref sre
                    where sre_id <> 1
                    union
                    select 'Indépendants', 
                        (SELECT count(*) from demande_aaq 
                            inner join utilisateur uti on uti.uti_id = demande_aaq.dem_uti_demandeur_id
                            where dem_uti_formateur_id is not null 
                            and  dem_sre_id is null 
                            and dem_dms_id = 1 and rol_id = 5) dem_en_attente, 
                        (SELECT count(*) from demande_aaq 
                            where dem_uti_formateur_id is not null 
                            and  dem_sre_id is null 
                            and dem_dms_id = 2) dem_validee, 
                        (SELECT count(*) from demande_aaq 
                            where dem_uti_formateur_id is not null 
                            and  dem_sre_id is null 
                            and dem_dms_id = 3) dem_refusee, 
                        (SELECT count(*) from demande_aaq 
                            inner join utilisateur uti on uti.uti_id = demande_aaq.dem_uti_demandeur_id 
                            where dem_uti_formateur_id is not null 
                            and  dem_sre_id is null and ((dem_dms_id = 1 and rol_id = 5) or dem_dms_id <> 1)) dem_total
                    order by 1`

    log.i('::list - requête', { requete })    
    return pgPool.query(requete,(err, result) => {
        if (err) {
            log.w('::list - error', err)
            return res.status(400).json({ message: 'erreur sur la requete de recherche de la liste demande aaq' });
        }
        else {
            log.i('::list - Done')    
            const suiviDemandes = result.rows;
            return res.status(200).json({ suiviDemandes });
        }
    });
        
})

router.post('/', async function (req, res) {
    const { demandeurId, formateurId, structurerefid,datedebutformation,inseeformation, datefinformation } = req.body

   // gérération des tocken de refus et d'accord pour l'envoie par mail.
    let tockendemanderefus = null
    let tockendemandeaccord = null
    var nomInstructeur
    var courrielInstructeur
    log.d('::post - Params : ', { formateurId, structurerefid,datedebutformation,inseeformation,datefinformation })
    if (formateurId && !structurerefid) {
        log.d('::post - get formateur')
        const requete = `SELECT uti_mail,uti_prenom FROM utilisateur WHERE uti_id = ${formateurId}`
        log.d('::post - requete / formateurId : ', requete)

        // Recherche de l'instructuer demandé pour la demande aaq
        await pgPool.query(requete,(err, result) => {
            if (err) {
                log.w('::post - Erreur sur le get du formateur', err)
                return res.status(400).json({ message: 'erreur sur la requete de recherche du mail du formateur' });
            }
            else 
            {
                const formateuraaq = result.rows && result.rows[0];
                log.d('::post - formateuraaq : ', { formateuraaq })
                courrielInstructeur = formateuraaq.uti_mail
                nomInstructeur = " "+formateuraaq.uti_prenom;
            }
        })
    }
    if (structurerefid) {
        log.d('::post - get Structureref')
        const requete = `SELECT sre_courriel FROM structure_ref WHERE sre_id = ${structurerefid}`
        // Recherche de la structure de référence demandé pour la demande aaq
        await pgPool.query(requete,(err, result) => {
            if (err) {
                log.w('::post - Erreur sur le get de la structure de référence', err)
                return res.status(400).json({ message: 'erreur sur la requete de recherche du mail du formateur' });
            }
            else 
            {
                const structurerefaaq = result.rows && result.rows[0];
                log.d('::post - structurerefaaq : ', { structurerefaaq })
                courrielInstructeur = structurerefaaq.sre_courriel
                nomInstructeur = ""
            }
        })
    }

    const now = new Date()
    const datecreation = now.getFullYear() + "-" + eval(now.getMonth() + 1) + "-" + now.getDate()
    const requete = `INSERT INTO demande_aaq (dem_uti_demandeur_id,dem_uti_formateur_id,dem_sre_id,dem_tockendemandeaccord,dem_tockendemanderefus,dem_datedemande,dem_dms_id, dem_datedebutformation, dem_inseeformation, dem_datefinformation) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;
    log.d('::post - requete', { requete });
    return pgPool.query(requete, [demandeurId, formateurId, structurerefid, tockendemandeaccord, tockendemanderefus, datecreation,1,datedebutformation,inseeformation,datefinformation ],
        (err, result) => {  
            if (err) {
                log.w('::post - Erreur lors de la requête.', err.stack);
                return res.status(400).json({message: 'erreur lors de la sauvegarde de la la demande au formateur'});
            }
            else {
                log.i('::post - Done', result);
                const demandeclient =  formatDemandeAAQ( result.rows[0])
                log.d('::post - sending mail', { courrielInstructeur })
                sendEmail({
                    to: courrielInstructeur,
                    subject: 'Demande de compte Aisance Aquatique',
                    body: `<p>Bonjour${nomInstructeur},</p>
                        <p>Vous avez une nouvelle demande pour changer le profil d'un utilisateur. <br/><br/>
                        Nous vous invitons à vous rendre sur le site « Aisance Aquatique » pour changer le profil du demandeur.<br/>
                        Rappel du site <a href="${config.franceConnect.FS_URL}">SI Aisance Aquatique.<br/></p>`
                    })

                log.i(':: post - Done')    
                return res.status(200).json({ maDemande: demandeclient });
            }
        })
})

router.post('/delete/', async function (req, res) {
    log.i('::delete - In')
    const maDemande = req.body.demandeaaq
    const requete = `DELETE FROM  demandeaaq 
            WHERE dem_id = $1 
            RETURNING *
            ;`;

    pgPool.query(requete, [maDemande.dem_id], (err, result) => {
        if (err) {
            log.w('::delete - Erreur survenue lors de la suppression de la demande.', { requete, err: err.stack })
            return res.status(400).json({message: 'erreur lors de la suppression de la demande AAQ ' + id});
        }
        else {
            log.i('::delete - Done')
            // Suppression effectuée avec succès
            return res.status(200).json(result.rows[0]);

        }
    })
})

router.put('/accord', async (req,res) => {
    const demandeaaq = req.body && req.body.demandeaaq
    const demandeid = demandeaaq && demandeaaq.dem_id
    const demandeurid = demandeaaq && demandeaaq.dem_uti_demandeur_id
    const formateurid = demandeaaq && demandeaaq.dem_uti_formateur_id
    const structurerefid = demandeaaq && demandeaaq.dem_sre_id
    var envoyerMailInstructeur = false
    var nomInstructeur = null
    var mailInstructeur = null
    var nomDemandeur = null
    var prenomDemandeur = null
    var mailDemandeur = null
    log.i('::accords - In', {demandeaaq , formateurid})

    if (structurerefid) {
        // Si la demande est confirmée, on envoie un mail à l'instructeur si cela a été validé par la structure de référence
        const requeteFormateur = `SELECT uti_mail, uti_prenom FROM utilisateur WHERE uti_id = ${formateurid}`
        log.d(requeteFormateur)
        const userQuery = await pgPool.query(requeteFormateur).catch(erruser => {
            log.w(erruser)
            throw erruser
        })
        // Trouvé, on envoie le mail à l'instructeur
        log.d('::accords - Nb utilisateur trouvé : ', userQuery.rowCount)
        if(userQuery.rowCount == "1") {
            envoyerMailInstructeur = true
            nomInstructeur = userQuery.rows[0].uti_prenom
            mailInstructeur = userQuery.rows[0].uti_mail
            log.d('::accords - envoyerMailInstructeur : ', envoyerMailInstructeur)
        }
    }

    // Si la demande est confirmée, on envoie un mail au demandeur initial pour l'informer que sa demande a été acceptée
    const requeteDemandeur = `SELECT uti_mail, uti_prenom, uti_nom FROM utilisateur WHERE uti_id = ${demandeurid}`
    log.d(requeteDemandeur)
    const userDemQuery = await pgPool.query(requeteDemandeur).catch(errdemandeur => {
        log.w(errdemandeur)
        throw errdemandeur
    })
    // Trouvé, on envoie le mail à l'instructeur
    log.d('::accords - Nb utilisateur trouvé : ', userDemQuery.rowCount)
    if(userDemQuery.rowCount == "1") {
        nomDemandeur = userDemQuery.rows[0].uti_nom
        prenomDemandeur = userDemQuery.rows[0].uti_prenom
        mailDemandeur = userDemQuery.rows[0].uti_mail
        sendEmail({
            to: mailDemandeur,
            subject: 'Aisance Aquatique : Validation de votre demande de profil Aisance Aquatique',
            body: `<p>Bonjour ${prenomDemandeur},</p><br/>
                <p>Votre demande d'accès à l'application avec un profil « Maître Nageur Aisance Aquatique » a été validée.<br/><br/>
                Ce mail vous a été envoyé automatiquement à partir du site  <a href="${config.franceConnect.FS_URL}">Aisance Aquatique.<br/></p>`
            })        
    }
       
    const bddUpdate =  await pgPool.query("UPDATE demande_aaq SET dem_dateaccord = now(), dem_uti_formateur_id = $1, dem_dms_id = 2 \
    WHERE dem_id = $2 RETURNING *", 
    [formateurid, demandeid])
    .catch(err => {
        log.w('::accords - Erreur pendant l\'update des infos du demandeaaq', err)
        throw err
    })
    const updatedDemandeaaq = bddUpdate.rows && bddUpdate.rows[0]
    log.i('::accords - Done, renvois du user mis à jour', updatedDemandeaaq)

    if (envoyerMailInstructeur) {
        log.i('::accords - Envoie du mail à  : ', nomInstructeur)
        sendEmail({
            to: mailInstructeur,
            subject: 'Aisance Aquatique : Validation par votre structure',
            body: `<p>Bonjour ${nomInstructeur},</p><br/>
                <p>La demande de ${prenomDemandeur} ${nomDemandeur} a été validée par votre structure de référence et vous êtes identifié comme l'instructeur ayant dispensé la formation. <br/><br/>
                Le profil « Maître Nageur Aisance Aquatique » lui a été attribué. Un courriel a été envoyé à l'intéressé.<br/><br/>
                Ce mail vous a été envoyé automatiquement à partir du site  <a href="${config.franceConnect.FS_URL}">SI Aisance Aquatique.<br/></p>`
            })
    }        
    return res.send(updatedDemandeaaq)
})


router.put('/refus', async (req,res) => {
    const demandeaaq = req.body && req.body.demandeaaq
    const demandeid = demandeaaq && demandeaaq.dem_id
    const demandeurid = demandeaaq && demandeaaq.dem_uti_demandeur_id
    const formateurid = demandeaaq && demandeaaq.dem_uti_formateur_id
    const motifrefus = demandeaaq && demandeaaq.dem_motifrefus
    const structurerefid = demandeaaq && demandeaaq.dem_sre_id
    var envoyerMailInstructeur = false
    var nomInstructeur = null
    var mailInstructeur = null
    var nomDemandeur = null
    var prenomDemandeur = null
    var mailDemandeur = null
    log.i('::refus - In', {demandeaaq , formateurid})

    if (structurerefid) {
        // Si la demande est confirmée, on envoie un mail à l'instructeur si cela a été validé par la structure de référence
        const requeteFormateur = `SELECT uti_mail, uti_prenom FROM utilisateur WHERE uti_id = ${formateurid}`
        log.d(requeteFormateur)
        const userQuery = await pgPool.query(requeteFormateur).catch(erruser => {
            log.w(erruser)
            throw erruser
        })
        // Trouvé, on envoie le mail à l'instructeur
        log.d('::refus - Nb utilisateur trouvé : ', userQuery.rowCount)
        if(userQuery.rowCount == "1") {
            envoyerMailInstructeur = true
            nomInstructeur = userQuery.rows[0].uti_prenom
            mailInstructeur = userQuery.rows[0].uti_mail
            log.d('::refus - envoyerMailInstructeur : ', envoyerMailInstructeur)
        }
    }

    // Si la demande est confirmée, on envoie un mail au demandeur initial pour l'informer que sa demande a été acceptée
    const requeteDemandeur = `SELECT uti_mail, uti_prenom, uti_nom FROM utilisateur WHERE uti_id = ${demandeurid}`
    log.d(requeteDemandeur)
    const userDemQuery = await pgPool.query(requeteDemandeur).catch(errdemandeur => {
        log.w(errdemandeur)
        throw errdemandeur
    })
    // Trouvé, on envoie le mail au demandeur
    log.d('::refus - Nb utilisateur trouvé : ', userDemQuery.rowCount)
    if(userDemQuery.rowCount == "1") {
        nomDemandeur = userDemQuery.rows[0].uti_nom
        prenomDemandeur = userDemQuery.rows[0].uti_prenom
        mailDemandeur = userDemQuery.rows[0].uti_mail
        sendEmail({
            to: mailDemandeur,
            subject: 'Aisance Aquatique : Refus de votre demande de profil Aisance Aquatique',
            body: `<p>Bonjour ${prenomDemandeur},</p><br/>
                <p>Votre demande d'accès à l'application avec un profil « Maître Nageur Aisance Aquatique » a été refusée.<br/>
                Motif : <br/><br/>${motifrefus.replace(/\n/g, '<br/>')}
                <br/><br/>
                Ce mail vous a été envoyé automatiquement à partir du site  <a href="${config.franceConnect.FS_URL}">Aisance Aquatique.<br/></p>`
            })        
    }
       
    const bddUpdate =  await pgPool.query("UPDATE demande_aaq SET dem_daterefus = now(), dem_motifrefus = $1, dem_dms_id = 3 \
    WHERE dem_id = $2 RETURNING *", 
    [motifrefus, demandeid])
    .catch(err => {
        log.w('::refus - Erreur pendant l\'update du refus de la demandeaaq', err)
        throw err
    })
    const updatedDemandeaaq = bddUpdate.rows && bddUpdate.rows[0]
    log.i('::refus - Done, renvois du user mis à jour', updatedDemandeaaq)

    if (envoyerMailInstructeur) {
        log.i('::refus - Envoie du mail à  : ', nomInstructeur)
        sendEmail({
            to: mailInstructeur,
            subject: 'Aisance Aquatique : Refus par votre structure',
            body: `<p>Bonjour ${nomInstructeur},</p><br/>
                <p>La demande de ${prenomDemandeur} ${nomDemandeur} a été refusée par votre structure de référence et vous êtes identifié comme l'instructeur ayant dispensé la formation. <br/><br/>
                Motif : <br/><br/>${motifrefus.replace(/\n/g, '<br/>')}
                <br/><br/>
                Ce mail vous a été envoyé automatiquement à partir du site  <a href="${config.franceConnect.FS_URL}">SI Aisance Aquatique.<br/></p>`
            })
    }        
    return res.send(updatedDemandeaaq)
})

router.get('/accord/:tockenaccord/demande/:id', async function(req, res) {
    const id = req.params.id
    log.i('::enable-mail with tockenaccord - In', { id })
    if(!id) {
        return res.status(400).json({message: 'Aucun ID fournit pour  identifier l\'utilisateur.'});
    }

    const userQuery = await pgPool.query(`SELECT * FROM utilisateur WHERE uti_id='${id}'`).catch(err => {
        log.w(err)
        throw err
    })
    const user= userQuery.rowCount === 1 && userQuery.rows[0]

    if(!user) {
        return res.status(404).json({message: "L'utilisateur n'existe pas."});        
    }

    log.d('::enable-mail with tockenaccord - user found', { user })
    const requete = `UPDATE utilisateur 
        SET pwd_validated = $1
        WHERE uti_id = $2
        RETURNING *
        ;`    
    return pgPool.query(requete,[true, id], (err, result) => {
        if (err) {
            log.w('::enable-mail with tockenaccord - erreur lors de l\'update', {requete, erreur: err.stack});
            return res.status(400).json({message: 'erreur lors de la sauvegarde de l\'utilisateur'});
        }
        else {
            log.i('::enable-mail with tockenaccord - Done, pwd has been validated.')
            req.session.user = result.rows[0]
            req.accessToken = result.rows[0].uti_pwd;
            req.session.accessToken = result.rows[0].uti_pwd;
            return res.status(200).json({ user: formatUtilisateur(result.rows[0])});
        }
    })
})

module.exports = router;