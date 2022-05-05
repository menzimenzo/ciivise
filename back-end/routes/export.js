const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();
var moment = require('moment');
const stringify = require('csv-stringify')
const { formatIntervention, formatDate, logTrace } = require('../utils/utils')
moment().format();

const logger = require('../utils/logger')
const log = logger(module.filename)

/* route d'extraction de la liste d'utilisateurs pour le CSV */
/* Pas d'argument, on utilise la structure de l'utilisateur en session */
// Execution du batch csv localhost/backend/api/batch/csv
router.get('/', async function (req, res) {
    log.i('::export - In')

    var requete = "";

    log.d('::export - Recherche des données : ' + requete);
    requete =`SELECT uti.uti_id As Identifiant, replace(rol_libelle,'Formateur','MaitreNageur') as Role, replace(rol_libelle,'Formateur','Instructeur') as RoleInitial, uti_prenom, uti_nom, substr(uti_nom,1,1) || '.' as uti_plnom, lower(uti_mail) as Courriel, replace(replace(uti_publicontact::text,'true','Oui'),'false','Non') AutorisePublicationContact, 
    lower(uti_mailcontact) MailContact, uti_sitewebcontact SiteInternetContact, uti_telephonecontact TelephoneContact, replace(uti_adrcontact,'"','''') AdresseContact,
    replace(uti_compadrcontact,'"','''') ComplementAdresseContact, uti_com_cp_contact CodePostalContact, uti_com_codeinseecontact CodeInseeContact, com_art ArtCommune, com_libelle LibelleCommune, dep_num Departement, replace(replace(uti.uti_donneleconsparticulieres::text,'true','Oui'),'false','Non')
    from utilisateur  uti
    inner join profil rol on rol.rol_id = uti.rol_id  and rol.rol_id in (3,4,5)
    inner join ref_eaps eaps on eaps.eap_numero = uti.uti_eaps
    left join commune com on cpi_codeinsee = uti.uti_com_codeinseecontact
    where ((uti.uti_validated = true and uti.uti_tockenfranceconnect != '') or uti.pwd_validated = true) and uti.uti_publicontact = true
    order by 3,4 asc`;

    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::csvopendatasoft - Erreur lors de la requête.', { requete, erreur: err.stack});
            return res.status(400).json({message: 'erreur lors de la récupération des utilisateurs'});
        }
        else {
            const csv = result.rows;
            log.d(csv)
            if (!csv || !csv.length) {
                log.w('::csvopendatasoft - Résultat vide.')
                return res.status(400).json({ message: 'Aucun résultat renvoyé par la requête' });
            }
            stringify(csv, {
                quoted: '"',
                header: true,
                escape: '\n'
            }, (err, csvContent) => {
                if(err){
                    log.w('::csv - erreur',err)
                    return res.status(500)
                } else {
                    log.d(csvContent)
                    if (req.query.csv) 
                    {
                        res.attachment(csvContent)
                        res.set('Content-Type', 'text/csv');
                        res.setHeader('Content-disposition', 'attachment; filename=AAQ-Contact.csv');
                    }
                    return res.send(csvContent);

                }
            })            
        }
    })
    log.i('::export - Done')
});

/* route d'extraction de la liste des piscines pour le CSV */
/* Pas d'argument*/
// Execution du batch csv localhost/backend/api/batch/csv/
router.get('/piscines', async function (req, res) {
    log.i('::export - In')

    var requete = "";

    log.d('::export - Recherche des données : ' + requete);
    requete =`SELECT pis.pis_id AS ID, pis.pis_dataes AS ID_DATAES, replace (pis.pis_nom,'"','''') AS NOM, pis_x AS X,pis_y AS Y,\
    replace (pis.pis_adr,'"','''') AS ADRESSE, pis.cpi_codeinsee AS CODEINSEE, com.com_libelle AS COMMUNE, cor.cpi_codepostal AS CODEPOSTAL,
    to_char(pis.pis_datemaj,'DD-MM-YYYY') AS DATEMAJ, replace(replace(pis.piscine_privee::text,'true','Oui'),'false','Non') AS PRIVEE, pp.pp_mail AS MAIL, pp.pp_telephone AS TELEPHONE,
    pp.pp_siteweb AS SITE_WEB, replace(replace(pp.pp_ouverture_annuelle::text,'true','Oui'),'false','Non') AS OUVERTURE_ANNUELLE, pp.pp_date_ouverture AS HORAIRES,
    pp.pp_profondeur AS PROFONDEUR, pp.pp_dimension AS DIMENSIONS, pp.pp_type AS COUVERTURE, replace(replace(pp.pp_chauffage::text,'true','Oui'),'false','Non') AS CHAUFFAGE,
    replace(replace(pp.pp_vestiaire::text,'true','Oui'),'false','Non') AS VESTIAIRES,replace(replace(pp.pp_toilettes::text,'true','Oui'),'false','Non') AS TOILETTES, 
    replace(replace(pp.pp_salles::text,'true','Oui'),'false','Non') AS SALLES, replace(replace(pp.pp_parking::text,'true','Oui'),'false','Non') AS PARKING 
    from piscine pis \
    LEFT JOIN piscine_privee pp ON pp.pis_id = pis.pis_id \
    LEFT JOIN  codepostal_insee cor ON cor.cpi_codeinsee = pis.cpi_codeinsee \
    LEFT JOIN  commune com ON com.cpi_codeinsee = pis.cpi_codeinsee \
    WHERE pis.export = true \
    order by ID desc`
    ;
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::csvopendatasoft - Erreur lors de la requête.', { requete, erreur: err.stack});
            return res.status(400).json({message: 'erreur lors de la récupération des piscines'});
        }
        else {
            const csv = result.rows;
            log.d(csv)
            if (!csv || !csv.length) {
                log.w('::csvopendatasoft - Résultat vide.')
                return res.status(400).json({ message: 'Aucun résultat renvoyé par la requête' });
            }
            stringify(csv, {
                quoted: '"',
                header: true,
                escape: '\n'
            }, (err, csvContent) => {
                if(err){
                    log.w('::csv - erreur',err)
                    return res.status(500)
                } else {
                    log.d(csvContent)
                    if (req.query.csv) 
                    {
                        res.attachment(csvContent)
                        res.set('Content-Type', 'text/csv');
                        res.setHeader('Content-disposition', 'attachment; filename=AAQ-Piscines.csv');
                    }
                    return res.send(csvContent);

                }
            })            
        }
    })
    log.i('::export - Done')
});



/* route d'extraction de la liste des interventions pour le CSV */
/* Pas d'argument*/
router.get('/interventions', async function (req, res) {
    log.i('::export - Interventions - In')

    var requete = "";

    requete =`SELECT int.int_id IdIntervention,
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
    p.cpi_codeinsee,
    piscom.com_libelle PiscineCommune,
    str.str_code CodeStructure,
    str.str_libelle LibelleStructure,
    str.str_adresse StructureAdresse,
    str.str_commune StructureCommune,
    CASE str.str_type
        WHEN 1 THEN 'Collectivites territoriales'
        WHEN 2 THEN 'Clubs / Associations / ligues'
        WHEN 3 THEN 'Ecoles'
    END  TypeStructure,  
    str.str_soustype SousTypeStructure,
    utic.uti_nom NomCreateurInt,
    utic.uti_prenom PrenomCreateurInt,
    rolc.rol_libelle RoleCreateurInt,
    uti1.uti_nom NomIntervenant1,
    uti1.uti_prenom PrenomIntervenant1,
    rol1.rol_libelle RoleIntervenant1,
    uti2.uti_nom NomIntervenant2,
    uti2.uti_prenom PrenomIntervenant2,
    rol2.rol_libelle RoleIntervenant2,
    count(distinct(en0.enf_id)) NbEnfantNiv0,
    count(distinct(en1.enf_id)) NbEnfantNiv1,
    count(distinct(en2.enf_id)) NbEnfantNiv2,
    count(distinct(en3.enf_id)) NbEnfantNiv3
    from intervention int
    LEFT JOIN utilisateur utic ON int.uti_createur_id = utic.uti_id
    left join profil rolc on rolc.rol_id = int.rol_createur_id
    LEFT JOIN uti_int ui1 ON ui1.int_id = int.int_id and ui1.uti_id = (select uim.uti_id  from uti_int uim where uim.int_id = int.int_id order by uim.uti_id limit 1)    
    LEFT JOIN utilisateur uti1 ON ui1.uti_id = uti1.uti_id
    left join profil rol1 on rol1.rol_id = ui1.rol_initial_id
    LEFT JOIN uti_int ui2 ON ui2.int_id = int.int_id and ui2.uti_id = (select uim.uti_id  from uti_int uim where uim.int_id = int.int_id and uim.uti_id <> ui1.uti_id order by uim.uti_id limit 1)    
    LEFT JOIN utilisateur uti2 ON ui2.uti_id = uti2.uti_id
    left join profil rol2 on rol2.rol_id = ui2.rol_initial_id
    LEFT JOIN piscine pis on int.pis_id = pis.pis_id
    LEFT JOIN structure str on str.str_id = int.str_id
    LEFT JOIN commune piscom on piscom.cpi_codeinsee = pis.cpi_codeinsee
    LEFT JOIN (SELECT distinct on (cpi_codeinsee) cpi_codeinsee,cpi_codepostal FROM codepostal_insee) p on p.cpi_codeinsee = pis.cpi_codeinsee
    left join int_enf en0 on en0.int_id = int.int_id and en0.niv_fin = 0
    left join int_enf en1 on en1.int_id = int.int_id and en1.niv_fin = 1
    left join int_enf en2 on en2.int_id = int.int_id and en2.niv_fin = 2
    left join int_enf en3 on en3.int_id = int.int_id and en3.niv_fin = 3
        group by 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29
                order by 1`
    ;
    log.d('::export - Recherche des données : ' + requete);

    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::csvopendatasoft - Erreur lors de la requête.', { requete, erreur: err.stack});
            return res.status(400).json({message: 'erreur lors de la récupération des interventions'});
        }
        else {
            const csv = result.rows;
            log.d(csv)
            if (!csv || !csv.length) {
                log.w('::csvopendatasoft - Résultat vide.')
                return res.status(400).json({ message: 'Aucun résultat renvoyé par la requête' });
            }
            stringify(csv, {
                quoted: '"',
                header: true,
                escape: '\n'
            }, (err, csvContent) => {
                if(err){
                    log.w('::csv - erreur',err)
                    return res.status(500)
                } else {
                    log.d(csvContent)
                    if (req.query.csv) 
                    {
                        res.attachment(csvContent)
                        res.set('Content-Type', 'text/csv');
                        res.setHeader('Content-disposition', 'attachment; filename=AAQ-Interventions.csv');
                    }
                    return res.send(csvContent);

                }
            })            
        }
    })

    log.i('::export -Interventions - Done')


});

module.exports = router;