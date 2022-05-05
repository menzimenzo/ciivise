const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();
const myPdf = require('../utils/pdf')
const stringify = require('csv-stringify')

const { 
    getIntervention, 
    getUtilisateursFromIntervention,
    getEnfantsFromIntervention,
    postUtilisateursForIntervention,
    postEnfantsForIntervention,
    deleteEnfantsFromIntervention,
    deleteUtilisateursFromIntervention } = require('../controllers');

const { formatIntervention } = require('../utils/utils')

const logger = require('../utils/logger');
const log = logger(module.filename)

router.get('/', async function (req, res) {
    log.i('::list - In')
    if (!req.session.user) {
        log.w('::list - User manquant.')
        return res.sendStatus(403)
    }

    const user = req.session.user
    const utilisateurId = user.uti_id
    let whereClause = ""

    if (user.rol_id == 3 || user.rol_id == 4 || user.rol_id == 5) {
        whereClause += `LEFT JOIN uti_int ui ON ui.int_id = int.int_id  \
            LEFT JOIN utilisateur uti ON ui.uti_id = uti.uti_id \
            where uti.uti_id=${utilisateurId}`
        // Utilisateur Administrateur : 
    } else if (user.rol_id == 2) {
            whereClause += `LEFT JOIN structure str on str.str_id = int.str_id \
            where str.str_id=${user.stu_id}`
    } else {
        whereClause = ''
    }
    const requete = `SELECT int.int_id from intervention int ${whereClause} order by int.int_datefinintervention asc`;
    let result = await pgPool.query(requete)
    let interventions = result.rows
    if(interventions) {
        log.d('::list - interventions trouvées.')
        let interventionsCompletes = await Promise.all(interventions.map(async (intervention) => {
            intervention = await getIntervention({id: intervention.int_id,user: user})
            return intervention[0]
        }))

        /*let interventionsCompletes = interventions.map(async intervention => {
            intervention = await getIntervention({id: intervention.int_id,user: user} )
        })*/
        console.log(interventionsCompletes)
        log.i('::list - Done')
        return res.status(200).json({ interventions: interventionsCompletes })
    } else {
        return res.status(200).json({message: 'Aucune intervention trouvée.'})
    }
})

router.get('/csv/:utilisateurId', async function (req, res) {
    // Modification de la récupération de l'utilisateur courant 
    if (!req.session.user) {
        return res.sendStatus(403)
    }
    const user = req.session.user
    const utilisateurId = user.uti_id
    const stru = user.uti_id

    log.i('::csv - In', { utilisateurId, stru })
    let whereClause = ""

    if ( user.rol_id == 3 || user.rol_id == 4 || user.rol_id == 5) {
        whereClause += `where uti.uti_id=${utilisateurId}`
        // Utilisateur Administrateur : 
    } else if (user.rol_id == 2) {
            whereClause += `where str.str_id=${user.stu_id}`
    } 

    const requete = `SELECT int.int_id IdIntervention, 
                    int.int_nombreenfant NbEnfants, 
                    to_char(int.int_datedebutintervention,'DD/MM/YYYY') DateDebutSession, 
                    to_char(int.int_datefinintervention,'DD/MM/YYYY') DateFinSession, 
                    int.int_nbsession NbSessions ,
                    CASE int.int_cai
                        WHEN 1 THEN 'Scolaire'
                        WHEN 2 THEN 'Péri-scolaire'
                        WHEN 3 THEN 'Extra-scolaire'
                        WHEN 4 THEN 'Privé'
                    END  CadreIntervention,
                    CASE int.int_age
                        WHEN 3 THEN 'Petite section'
                        WHEN 4 THEN 'Moyenne section'
                        WHEN 5 THEN 'Grande section'
                        WHEN 6 THEN 'Cours préparatoire'
                    END  ClasseConcernee,  
                    CASE int.int_issubventionnee
                        WHEN true THEN 'Oui'
                        WHEN false THEN 'Non'
                    ELSE 'Non'
                    END  SubventionANS,
                    pis.pis_dataes CodeEquipementSportif,
                    pis.pis_nom PiscineNom,
                    pis.pis_adr PiscineAdresse,
                    p.cpi_codepostal PiscineCodePostal,
                    piscom.com_libelle PiscineCommune,
                    str.str_code CodeStructure,
                    str.str_libelle	LibelleStructure,
                    str.str_adresse	StructureAdresse,
                    str.str_commune	StructureCommune,
                    CASE str.str_type
                        WHEN 1 THEN 'Collectivites territoriales'
                        WHEN 2 THEN 'Clubs / Associations / ligues'
                        WHEN 3 THEN 'Ecoles'
                    END  TypeStructure,  
                    str.str_soustype SousTypeStructure
                    from intervention int 
                    LEFT JOIN uti_int ui ON ui.int_id = int.int_id  \
                    LEFT JOIN utilisateur uti ON ui.uti_id = uti.uti_id \
                    LEFT JOIN piscine pis on int.pis_id = pis.pis_id \
                    LEFT JOIN structure str on str.str_id = int.str_id \
                    LEFT JOIN commune piscom on piscom.cpi_codeinsee = pis.cpi_codeinsee \
                    LEFT JOIN (SELECT distinct on (cpi_codeinsee) cpi_codeinsee,cpi_codepostal FROM codepostal_insee) p on p.cpi_codeinsee = pis.cpi_codeinsee \
                    ${whereClause} order by int.int_datefinintervention desc`;

    return pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::csv - erreur lors de la requête.', err.stack);
            return res.status(400).json({message: 'erreur lors de la récupération de l\'intervention'});
        }
        else {
              let interventions = result.rows;
            if (!interventions || !interventions.length) {
                log.w('::csv - Intervention inexistante.');
                return res.status(400).json({ message: 'Interventions inexistante' });
            }

            return stringify(interventions, {
                quoted: '"',
                header: true
            }, (err, csvContent) => {
                if (err) {
                    log.w('::csv - Erreur lors callback après stringify.', err.stack);
                    return res.status(500)
                } else {
                    log.i('::csv - Done')
                    return res.send(csvContent)
                }
            })
        }
    })
});

router.get('/:id', async function (req, res) {
    log.i('::get - In')
    const id = req.params.id
    const user = req.session.user
    const params = {
        id: id,
        user: user
    }
    console.log(params)
    inter = await getIntervention(params)
    return res.status('200').json({ intervention: inter[0] })
});

router.put('/:id', async function (req, res) {
    const intervention = req.body.intervention
    const id = req.params.id
    log.i('::update - In', { id })
    const { strId, nbEnfants, piscine, dateDebutIntervention,dateFinIntervention,utilisateur,enfant,nbSession,cai,classe,isSubventionnee } = intervention

    const requete = `UPDATE intervention 
        SET str_id= $1,
        int_nombreenfant= $2,
        pis_id = $3,
        int_datedebutintervention = $4,
        int_datefinintervention = $5,
        int_nbsession = $6,
        int_cai =$7,
        int_age = $8,
        int_isSubventionnee = $9,
        int_datemaj = now()
        WHERE int_id = ${id}
        RETURNING *;`

    log.d('::update - requete', { requete })
    return pgPool.query(requete, [strId,
        nbEnfants,
        piscine.id,
        dateDebutIntervention,
        dateFinIntervention,
        nbSession,
        cai,
        classe,
        isSubventionnee
    ], (err, result) => {
        if (err) {
            log.w('::update - erreur lors de la sauvegarde', { requete, erreur: err.stack })
            return res.status(400).json({message: 'erreur lors de la sauvegarde de l\'intervention'});
        }
        else {
            log.i('::update - Done')
            // suppression des données utilisateurs et enfants
            return Promise.all([deleteUtilisateursFromIntervention([id]),deleteEnfantsFromIntervention([id])]).then(() => {  
                // MAJ des données utilsiateurs et enfants
                return Promise.all([postUtilisateursForIntervention([utilisateur,id]),postEnfantsForIntervention([enfant,id])]).then(async () => {
                    const user = req.session.user
                    const params = {
                        id: result.rows[0].int_id,
                        user: user
                    }
                    let inter = await getIntervention(params)
                    log.i('::post - Done')
                    myPdf.generate(inter)  
                    return res.status(200).json({ intervention: inter[0] })
                })
            }).catch( error => {
                log.w('::update - erreur lors de la mise à jour des utilisateurs ou des enfants pour une intervention.', error)
                return res.status(400).json({message: 'Erreur lors de la mise à jour des utilisateurs ou des enfants pour une intervention'})
            })
        }
    })
})

router.post('/', function (req, res) {
    log.i('::post - In')
    const intervention = req.body.intervention
    const userAuthent = req.session.user

    if ( ! intervention.classe) { intervention.classe = null}

    const requete = `insert into intervention 
                    (pis_id,str_id,int_nombreenfant,int_datedebutintervention,int_datefinintervention,int_nbsession, int_cai, int_age,int_datecreation,int_datemaj,int_issubventionnee, uti_createur_id,rol_createur_id) 
                    values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13 ) RETURNING int_id AS int_id`;

    return pgPool.query(requete, [intervention.piscine.id,
    intervention.strId,
    intervention.nbEnfants,
    intervention.dateDebutIntervention,
    intervention.dateFinIntervention,
    intervention.nbSession,
    intervention.cai,
    intervention.classe,
    new Date().toISOString(),
    new Date().toISOString(),
    intervention.isSubventionnee,
    userAuthent.uti_id,
    userAuthent.rol_id], (err, result) => {
        if (err) {
            log.w('::post - erreur lors de l\'insertion dans la table des interventions', { requete, erreur: err.stack })
            return res.status(400).json({ message: 'Erreur lors de la sauvegarde de l\'intervention'});
        }
        else {
            log.d('::post - insert dans intervention Done');
            let int_id = result.rows[0].int_id;
            return Promise.all([postUtilisateursForIntervention([intervention.utilisateur, int_id]),postEnfantsForIntervention([intervention.enfant, int_id])]).then(async () => {
                const user = req.session.user
                const params = {
                    id: int_id,
                    user: user
                }
                const inter = await getIntervention(params)
                log.i('::post - Done')
                myPdf.generate(inter);
                return res.status(200).json({ intervention: inter[0] })
            }).catch( error => {
                log.w('::post - erreur lors des ajouts des utilisateurs ou des enfants pour une intervention.', error)
                return res.status(400).json({ message: 'Erreur lors des ajouts des utilisateurs ou des enfants pour votre intervention'})
            })
        }
    })
})

router.get('/delete/:id', async function (req, res) {
    const id = req.params.id;
    log.i('::delete - In', { id })

    const requete = `DELETE FROM intervention WHERE int_id = $1 RETURNING *;`;

    return pgPool.query(requete, [id], (err, result) => {
        if (err) {
            log.w('::delete - Erreur survenue lors de la suppression.', { requete, err: err.stack })
            return res.status(400).json({message: 'erreur lors de la suppression de l\'intervention ' + id});
        }
        else {
            log.i('::delete - Done')
            // Suppression effectuée avec succès
            return res.status(200).json({message: 'Intervention supprimée avec succès.'});
        }
    })
})

module.exports = router;