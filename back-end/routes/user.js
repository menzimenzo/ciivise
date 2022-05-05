const express = require('express');
const router = express.Router();
const stringify = require('csv-stringify')
const pgPool = require('../pgpool').getPool();
var moment = require('moment');
moment().format();
const { formatUser } = require('../utils/utils')
const logger = require('../utils/logger')
const log = logger(module.filename)

// Récupération de la liste des formateurs filtré par rôle
// Essenciellement utilisé pour lister la liste des formateurs
router.get('/liste/:roleid', async function (req, res) {
    var roleid = req.params.roleid
    const utilisateurCourant = req.session.user;    
    log.i('::list-roleid - In' , { roleid, 'utiCourant': utilisateurCourant.rol_id })

    if (utilisateurCourant.rol_id == 1) {
        // si on est admin, on affiche tous les utilisateurs
        requete = `SELECT uti.*
        from utilisateur uti 
        where rol_id = ${roleid}
        order by uti_nom, uti_prenom asc`;
    }
    else if (utilisateurCourant.rol_id == 5) {
        // On recherche les instructeurs
        // Ceux qui qui sont "Indépendant" ou faisant partie d'une structure qui ne gère pas en central les demandes AAQ
        if (roleid == 3) {

            // si on est admin, on affiche tous les utilisateurs
            requete = `SELECT uti.*
            from utilisateur uti 
            inner join uti_sre uts on uts.uti_id = uti.uti_id 
                and uts.uts_actif = true
            inner join structure_ref sre on sre.sre_id = uts.sre_id and sre_traitementcentral = false
            where rol_id = ${roleid}
            order by uti_nom, uti_prenom asc`;        
        }
        // Pour le else du rôle, ça ne devrait pas arriver
    }
    else if (utilisateurCourant.rol_id == 6) {
        // On est utilisateur de structure de référence alors on renvoie tous les utilisateurs de la structure de référence
        // Pour le rol_id = 3 cela correspond à tous les instructeurs de la structure
        requete = `SELECT uti.*
        from utilisateur uti 
        inner join uti_sre uts on uts.uti_id = uti.uti_id and uts.uts_actif = true
            and uts.sre_id in (select utisre.sre_id from uti_sre utisre where utisre.uti_id = ${utilisateurCourant.uti_id} and utisre.uts_actif = true) 
        where uti.rol_id = ${roleid}
        order by uti_nom, uti_prenom asc`;
    }

    log.d('::list-roleid - requete',{ requete })
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::list-roleid - erreur lors de la récupération.',err.stack);
            return res.status(400).json({message: 'erreur lors de la récupération des utilisateurs par role'});
        }
        else {
            log.i('::list-roleid - Done')
            const users = result.rows.map(formatUser);
            return res.json({ users });
        }
    })
})

/* route d'extraction de la liste d'utilisateurs pour le CSV */
/* Pas d'argument, on utilise la structure de l'utilisateur en session */
router.get('/csv', async function (req, res) {
    log.i('::csv - In')
    const utilisateurCourant = req.session.user;
    let requete = "";

    log.d('::csv - Profil de l\'utilisateur : ' + utilisateurCourant.rol_id);
    // Je suis utilisateur "Administrateur" ==> Export de la liste des tous les utilisateurs
    if ( utilisateurCourant.rol_id == 1 ) {
        requete =`SELECT  uti.uti_id As Identifiant , uti.uti_prenom as Prénom, uti.uti_nom As Nom,  rol_libelle as Role, lower(uti.uti_mail) as Courriel,  
        replace(replace(uti_validated::text,'true','Validée'),'false','Non validée') as inscription,replace(replace(uti.pwd_validated::text,'true','Validé'),'false','Non validé') as validationmail, replace(replace(uti_publicontact::text,'true','Oui'),'false','Non') AutorisePublicationContact, 
        lower(uti_mailcontact) MailContact, uti_sitewebcontact SiteInternetContact, uti_telephonecontact TelephoneContact, uti_adrcontact AdresseContact, 
        uti_compadrcontact ComplementAdresseContact, uti_com_cp_contact CodePostalContact, uti_com_codeinseecontact CodeInseeContact, com_art ArtCommune, com_libelle LibelleCommune, dep_num Departement,  replace(replace(uti.uti_donneleconsparticulieres::text,'true','Oui'),'false','Non') donneleconsparticulieres
        from utilisateur  uti
        join profil rol on rol.rol_id = uti.rol_id 
        left join commune com on cpi_codeinsee = uti.uti_com_codeinseecontact
        order by 3,4 asc`;
    } 
/*
    if ( utilisateurCourant.rol_id == 3) {
        requete =`SELECT  uti.uti_id As Identifiant , uti.uti_prenom as Prénom, uti.uti_nom As Nom,  rol_libelle as Role, lower(uti.uti_mail) as Courriel,  
        to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq, to_char(dem.dem_dateaccord, 'DD/MM/YYYY') dateaccordaaq,dem.dem_uti_formateur_id formateurid
        from utilisateur  uti
        inner join profil rol on rol.rol_id = uti.rol_id 
        inner join demande_aaq dem on dem.dem_uti_formateur_id = ${utilisateurCourant.uti_id} and dem.dem_uti_demandeur_id = uti.uti_id
        left join commune com on cpi_codeinsee = uti.uti_com_codeinseecontact
        order by 3,4 asc`;
    }     
    // Je suis utilisateur "Instructeur" ==> Export de la liste des maitres nageurs qui m'ont fait la demande
    if ( utilisateurCourant.rol_id == 6) {
        requete =`SELECT  uti.uti_id As Identifiant , uti.uti_prenom as Prénom, uti.uti_nom As Nom,  rol_libelle as Role, lower(uti.uti_mail) as Courriel,  
        to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq, to_char(dem.dem_dateaccord, 'DD/MM/YYYY') dateaccordaaq, dem.dem_uti_formateur_id formateurid,
        ins.uti_prenom || ' ' || ins.uti_nom instructeur
        from utilisateur  uti
        inner join profil rol on rol.rol_id = uti.rol_id 
        inner join demande_aaq dem on dem.dem_uti_demandeur_id = uti.uti_id 
                                and dem.dem_sre_id in (select utisre.sre_id from uti_sre utisre where uti_id = ${utilisateurCourant.uti_id} and utisre.uts_actif = true) 
        left join utilisateur ins on ins.uti_id = dem.dem_uti_formateur_id
        left join commune com on cpi_codeinsee = uti.uti_com_codeinseecontact
        order by 3,4 asc`;
    } 
    */
    /*
    else
    // TODO : Refaire l'export pour les autre profils
    {
        requete =`SELECT uti.uti_id As Identifiant , uti.uti_prenom as Prénom, uti_nom As Nom,  rol_libelle as Role, lower(uti_mail) as Courriel, 
        replace(replace(uti_validated::text,'true','Validée'),'false','Non validée') as inscription , stu.stu_libelle Statut_Utilisateur,
        str.str_libellecourt As Structure, uti.uti_structurelocale As Struture_Locale
        from utilisateur  uti
        join profil rol on rol.rol_id = uti.rol_id and rol.rol_id <> 1
        join statut_utilisateur  stu on stu.stu_id = uti.stu_id
        where uti.str_id=${utilisateurCourant.str_id} order by 3,4 asc`;
    }
*/
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::csv - Erreur lors de la requête.', { requete, erreur: err.stack});
            return res.status(400).json({message: 'erreur lors de la récupération des utilisateurs'});
        }
        else {
            const users = result.rows;//.map(formatUser);
            if (!users || !users.length) {
                log.w('::csv - Utilisateurs inexistants.')
                return res.status(400).json({ message: 'Utilisateurs inexistants' });
            }
            stringify(users, {
                quoted: '"',
                header: true
            }, (err, csvContent) => {
                if(err){
                    log.w('::csv - erreur',err)
                    return res.status(500)
                } else {
                    log.i('::csv - Done')
                    return res.send(csvContent)
                }
            })            
        }
    })
})

const TOUTES_LES_DEMANDES = "toutesLesDemandes"
const DEMANDES_EN_COURS = "demandesEnCours"
const DEMANDES_VALIDEES = "demandesValidees"
const DEMANDES_REFUSEES = "demandesRefusees"
const DEMANDES_TRAITEES = "demandesTraitees"

const mapDemandeStatutToValue = new Map()
mapDemandeStatutToValue.set(TOUTES_LES_DEMANDES, [1, 2, 3])
mapDemandeStatutToValue.set(DEMANDES_EN_COURS, [1])
mapDemandeStatutToValue.set(DEMANDES_VALIDEES, [2])
mapDemandeStatutToValue.set(DEMANDES_REFUSEES, [3])
mapDemandeStatutToValue.set(DEMANDES_TRAITEES, [2, 3]);

/* route d'extraction de la liste d'utilisateurs pour le CSV */
/* Pas d'argument, on utilise la structure de l'utilisateur en session */
router.get('/csvdemandes/:statut', async function (req, res) {
    log.i('::csvdemandes - In')
    let statut = req.params.statut
    let statutListId = mapDemandeStatutToValue.get(statut)

    if (statutListId === null || statutListId === undefined) {
        log.w("Dev error : le param {statut} n'est pas correct")
    }
    var critereProfilMN = ""
    // Pour les demandes en cours on s'assure qu'il n'y ait que des profils MN
    if (statut === DEMANDES_EN_COURS) {
        critereProfilMN = " and uti.rol_id = 5"
    }
    else
    {
        // Pour les demandes validées ou refusées on peut avoir des profils MNS et MNSAAQ
        critereProfilMN = " and uti.rol_id in (4,5)"
    }
 
    let containsRefus = statutListId.includes(3)

    const utilisateurCourant = req.session.user;
    let requete = "";

    log.d('::csvdemandes - Profil de l\'utilisateur : ' + utilisateurCourant.rol_id);
    log.d('::csvdemandes - ID de l\'utilisateur : ' + utilisateurCourant.uti_id);
    // Je suis utilisateur "Administrateur" ==> Export de la liste des tous les utilisateurs
    if ( utilisateurCourant.rol_id == 1 ) {
        requete = `SELECT uti.uti_id As Identifiant , uti.uti_prenom as Prénom, uti.uti_nom As Nom,  rol_libelle as Role, lower(uti.uti_mail) as Courriel,  
        dms.dms_libelle StatutDemande,to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq, to_char(dem.dem_dateaccord, 'DD/MM/YYYY') dateaccordaaq, ins.uti_prenom || ' ' || ins.uti_nom instructeur, sre.sre_libellecourt structure,cpif.cpi_codepostal codepostallieuformation, comf.com_libelle communelieuformation, to_char(dem_datedebutformation,'DD/MM/YYYY') datedebutformation,
        to_char(dem_datefinformation,'DD/MM/YYYY') datefinformation `

        if (containsRefus) {
            requete += `, to_char(dem.dem_daterefus, 'DD/MM/YYYY') AS daterefus, replace(replace(dem.dem_motifrefus,chr(13),'/'),chr(10),'/') AS motifrefus`
        }

        requete += ` from utilisateur uti
        inner join demande_aaq dem on dem.dem_uti_demandeur_id = uti.uti_id 
        inner join demande_statut dms on dms.dms_id = dem.dem_dms_id AND dms.dms_id in (${statutListId})
        inner join profil pro on pro.rol_id = uti.rol_id ${critereProfilMN}
        left join utilisateur ins on ins.uti_id = dem.dem_uti_formateur_id
        left join codepostal_insee cpif on cpif.cpi_codeinsee = dem.dem_inseeformation and cpif.cpi_codepostal = (select d.cpi_codepostal from codepostal_insee d where d.cpi_codeinsee = cpif.cpi_codeinsee limit 1)
        LEFT JOIN commune comf on comf.cpi_codeinsee = dem.dem_inseeformation 
        inner join structure_ref sre on sre.sre_id = dem.dem_sre_id
                                order by 3,4 asc`;
    } 
    // Je suis utilisateur "Instructeur" ==> Export de la liste des maitres nageurs qui m'ont fait la demande
    if (utilisateurCourant.rol_id == 3) {
        requete = `SELECT  uti.uti_id As Identifiant , uti.uti_prenom as Prénom, uti.uti_nom As Nom,  rol_libelle as Role, lower(uti.uti_mail) as Courriel,  
        dms.dms_libelle StatutDemande,to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq, to_char(dem.dem_dateaccord, 'DD/MM/YYYY') dateaccordaaq,dem.dem_uti_formateur_id instructeurid, ins.uti_prenom || ' ' || ins.uti_nom instructeur,cpif.cpi_codepostal codepostallieuformation, comf.com_libelle communelieuformation, to_char(dem_datedebutformation,'DD/MM/YYYY') datedebutformation,
        to_char(dem_datefinformation,'DD/MM/YYYY') datefinformation `

        if (containsRefus) {
            requete += `, to_char(dem.dem_daterefus, 'DD/MM/YYYY') AS daterefus, replace(replace(dem.dem_motifrefus,chr(13),'/'),chr(10),'/') AS motifrefus`
        }

        requete += ` from utilisateur uti
        inner join profil rol on rol.rol_id = uti.rol_id ${critereProfilMN}
        inner join demande_aaq dem on dem.dem_uti_formateur_id = ${utilisateurCourant.uti_id} and dem.dem_uti_demandeur_id = uti.uti_id
        inner join demande_statut dms on dms.dms_id = dem.dem_dms_id AND dms.dms_id in (${statutListId})
        left join utilisateur ins on ins.uti_id = dem.dem_uti_formateur_id
        left join codepostal_insee cpif on cpif.cpi_codeinsee = dem.dem_inseeformation and cpif.cpi_codepostal = (select d.cpi_codepostal from codepostal_insee d where d.cpi_codeinsee = cpif.cpi_codeinsee limit 1)
        LEFT JOIN commune comf on comf.cpi_codeinsee = dem.dem_inseeformation 
        left join commune com on com.cpi_codeinsee = uti.uti_com_codeinseecontact
        order by 3,4 asc`;
    }     
    // Je suis utilisateur "Structure référente" ==> Export de la liste des maitres nageurs qui m'ont fait la demande
    if (utilisateurCourant.rol_id == 6) {
        requete = `SELECT  uti.uti_id As Identifiant , uti.uti_prenom as Prénom, uti.uti_nom As Nom,  rol_libelle as Role, lower(uti.uti_mail) as Courriel,  
        dms.dms_libelle StatutDemande,to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq, to_char(dem.dem_dateaccord, 'DD/MM/YYYY') dateaccordaaq, dem.dem_uti_formateur_id instructeurid, ins.uti_prenom || ' ' || ins.uti_nom instructeur,cpif.cpi_codepostal codepostallieuformation, comf.com_libelle communelieuformation, to_char(dem_datedebutformation,'DD/MM/YYYY') datedebutformation,
        to_char(dem_datefinformation,'DD/MM/YYYY') datefinformation `

        if (containsRefus) {
            requete += `, to_char(dem.dem_daterefus, 'DD/MM/YYYY')  AS daterefus, replace(replace(dem.dem_motifrefus,chr(13),'/'),chr(10),'/') AS motifrefus`
        }

        requete += ` from utilisateur  uti
        inner join profil rol on rol.rol_id = uti.rol_id ${critereProfilMN}
        inner join demande_aaq dem on dem.dem_uti_demandeur_id = uti.uti_id 
                                and dem.dem_sre_id in (select utisre.sre_id from uti_sre utisre where uti_id = ${utilisateurCourant.uti_id} and utisre.uts_actif = true) 
        inner join demande_statut dms on dms.dms_id = dem.dem_dms_id AND dms.dms_id in (${statutListId}) 
        left join utilisateur ins on ins.uti_id = dem.dem_uti_formateur_id
        left join codepostal_insee cpif on cpif.cpi_codeinsee = dem.dem_inseeformation and cpif.cpi_codepostal = (select d.cpi_codepostal from codepostal_insee d where d.cpi_codeinsee = cpif.cpi_codeinsee limit 1)
        LEFT JOIN commune comf on comf.cpi_codeinsee = dem.dem_inseeformation 
        left join commune com on com.cpi_codeinsee = uti.uti_com_codeinseecontact
        order by 3,4 asc`;
    } 
    log.d("Requete export CSV",requete)
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::csvdemandes - Erreur lors de la requête.', { requete, erreur: err.stack});
            return res.status(400).json({message: 'erreur lors de la récupération des utilisateurs'});
        }
        else {
            const users = result.rows;//.map(formatUser);
            if (!users || !users.length) {
                log.w('::csvdemandes - Utilisateurs inexistants.')
                return res.status(400).json({ message: 'Utilisateurs inexistants' });
            }
            stringify(users, {
                quoted: '"',
                header: true
            }, (err, csvContent) => {
                if(err){
                    log.w('::csvdemandes - erreur',err)
                    return res.status(500)
                } else {
                    log.i('::csvdemandes - Done')
                    return res.send(csvContent)
                }
            })            
        }
    })
})

router.get('/encadrant', async function (req, res) {
    log.i('::encadrant - In')
    const utilisateurCourant = req.session.user;

    const requete =`SELECT uti.uti_id AS id, uti.uti_nom AS nom, uti.uti_prenom AS prenom,uti.uti_mail AS mail,
        uti.uti_validated, stu.stu_libelle, rol.rol_libelle, rol.rol_id
        from utilisateur uti
        join statut_utilisateur stu on stu.stu_id = uti.stu_id
        inner join profil rol on rol.rol_id = uti.rol_id
        where stu.stu_id = 1 
        AND uti.uti_validated = true 
        AND uti.rol_id in (3,4,5)
        order by 3,4 asc`;
    
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::encadrant - Erreur lors de la requête.', { requete, erreur: err.stack});
            return res.status(400).json({message: 'erreur lors de la récupération des encadrants'});
        }
        else {
            const encadrants = result.rows;
            log.d({ encadrants })
            log.i('::encadrant - Done')
            res.json({ encadrants });
        }
    })
});


router.get('/instructeurs', async function (req, res) {
    log.i('::instructeurs - In')
    const utilisateurCourant = req.session.user;
    let requete = "";

    // Je suis utilisateur "Administrateur" ==> Export de la liste des tous les utilisateurs
    if ( utilisateurCourant.rol_id == 1 ) {
        // Liste des instructeurs rattachés à la structures de l'utilisateur
        requete =`SELECT *,uti.uti_id AS id, uti.uti_nom AS nom, uti.uti_prenom AS prenom,uti.uti_mail AS mail,
        uti.uti_validated, sre.sre_libellecourt sre_libelle
        from utilisateur uti
        inner join uti_sre usrcourant on usrcourant.uti_id = uti.uti_id
        inner join uti_sre usrinstructeur on usrinstructeur.sre_id = usrcourant.sre_id 
                                                and uti.uti_id = usrinstructeur.uti_id
                                                and usrinstructeur.uts_actif = true
        inner join structure_ref sre on sre.sre_id = usrcourant.sre_id 
        where uti.rol_id = 3 
        order by 3,4 asc`;
    }
    else
    {
        // Pour tous les autres
        // Liste des instructeurs rattachés à la structures de l'utilisateur
        requete =`SELECT *,uti.uti_id AS id, uti.uti_nom AS nom, uti.uti_prenom AS prenom,uti.uti_mail AS mail,
        uti.uti_validated 
        from utilisateur uti
        inner join uti_sre usrcourant on usrcourant.uti_id = ${utilisateurCourant.uti_id}
        inner join uti_sre usrinstructeur on usrinstructeur.sre_id = usrcourant.sre_id 
                                                and uti.uti_id = usrinstructeur.uti_id
                                                and usrinstructeur.uts_actif = true
        where uti.rol_id = 3 
        order by 3,4 asc`;
    }
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::instructeurs - Erreur lors de la requête.', { requete, erreur: err.stack});
            return res.status(400).json({message: 'erreur lors de la récupération des instructeurs'});
        }
        else {
            const instructeurs = result.rows;
            log.i('::instructeurs - Done')
            res.json({ instructeurs });
        }
    })
});

router.get('/instructeurstructure/:id', async function (req, res) {
    var id = req.params.id
    const utilisateurCourant = req.session.user;    
    log.i('::instructeurstructure-sreid - In' , {id, 'utiCourant': utilisateurCourant.rol_id })

            // si on est admin, on affiche tous les utilisateurs
            requete = `SELECT uti.*
            from utilisateur uti 
            inner join uti_sre uts on uts.uti_id = uti.uti_id and uts.uts_actif = true
            inner join structure_ref sre on sre.sre_id = uts.sre_id 
                and sre.sre_id in (select dem.dem_sre_id from demande_aaq dem where dem.dem_uti_demandeur_id = ${id})
            where uti.rol_id = 3
            order by uti_nom, uti_prenom asc`;        
    log.d('::instructeurstructure-sreid - requete',{ requete })
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::instructeurstructure-sreid - erreur lors de la récupération.',err.stack);
            return res.status(400).json({message: 'erreur lors de la récupération des instructeurs par structure'});
        }
        else {
            log.i('::instructeurstructure-sreid - Done')
            const users = result.rows.map(formatUser);
            return res.json({ users });
        }
    })
})


router.get('/instructeurdunestructure/:id', async function (req, res) {
    var id = req.params.id
    const utilisateurCourant = req.session.user;    
    log.i('::instructeurdunestructure - In - id structureref' , id)

            // si on est admin, on affiche tous les utilisateurs
            requete = `SELECT uti.*
            from utilisateur uti 
            inner join uti_sre uts on uts.uti_id = uti.uti_id and uts.uts_actif = true
            inner join structure_ref sre on sre.sre_id = uts.sre_id and sre.sre_id = ${id}
            where uti.rol_id = 3
            order by uti_nom, uti_prenom asc`;        
    log.d('::instructeurdunestructure - requete',{ requete })
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::instructeurdunestructure - erreur lors de la récupération.',err.stack);
            return res.status(400).json({message: 'erreur lors de la récupération des instructeurs d\'une structureref'});
        }
        else {
            log.i('::instructeurdunestructure - Done')
            const users = result.rows.map(formatUser);
            return res.json({ users });
        }
    })
})

router.get('/demandes', async function (req, res) {
    log.i('::demandes - In')
    const utilisateurCourant = req.session.user
    let requete = "";
    
    if ( utilisateurCourant.rol_id == 1) {
        // si on est admin ==> on affiche les demandes de toutes les structures
        requete =`SELECT  uti.*,replace(replace(uti.uti_validated::text,'true','Validée'),'false','Non validée') as inscription,pro.rol_libelle, to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq, to_char(dem.dem_dateaccord, 'DD/MM/YYYY') dateaccordaaq, ins.uti_prenom || ' ' || ins.uti_nom instructeur, sre.sre_libellecourt sre_libelle, cpi.cpi_codepostal || '-' || com.com_libelle lieuformation, to_char(dem_datedebutformation,'DD/MM/YYYY') datedebutformation, to_char(dem_datefinformation,'DD/MM/YYYY') datefinformation,
        to_char(dem.dem_daterefus, 'DD/MM/YYYY') daterefusaaq,  
        dem.dem_dms_id statutdemande,
        dem.dem_motifrefus motifrefus
        from utilisateur  uti
        inner join demande_aaq dem on dem.dem_uti_demandeur_id = uti.uti_id 
        inner join profil pro on pro.rol_id = uti.rol_id
        left join utilisateur ins on ins.uti_id = dem.dem_uti_formateur_id
        left join codepostal_insee cpi on cpi.cpi_codeinsee = dem.dem_inseeformation  and cpi.cpi_codepostal = (select d.cpi_codepostal from codepostal_insee d where d.cpi_codeinsee = cpi.cpi_codeinsee limit 1)
        LEFT JOIN commune com on com.cpi_codeinsee = dem.dem_inseeformation 
        inner join structure_ref sre on sre.sre_id = dem.dem_sre_id
                                order by 3,4 asc`;
    }
    // Je suis utilisateur "gestionnaire de structure de référence" ==> on affiche les demandes de ma structure
    else if ( utilisateurCourant.rol_id == 6) 
    {
        requete =`SELECT  uti.*,replace(replace(uti.uti_validated::text,'true','Validée'),'false','Non validée') as inscription,pro.rol_libelle, to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq, to_char(dem.dem_dateaccord, 'DD/MM/YYYY') dateaccordaaq, ins.uti_prenom || ' ' || ins.uti_nom instructeur, sre.sre_libellecourt sre_libelle, cpi.cpi_codepostal || '-' || com.com_libelle lieuformation, to_char(dem_datedebutformation,'DD/MM/YYYY') datedebutformation, to_char(dem_datefinformation,'DD/MM/YYYY') datefinformation,
        to_char(dem.dem_daterefus, 'DD/MM/YYYY') daterefusaaq,  
        dem.dem_dms_id statutdemande,
        dem.dem_motifrefus motifrefus
        from utilisateur  uti
        inner join demande_aaq dem on dem.dem_uti_demandeur_id = uti.uti_id 
                                and dem.dem_sre_id in (select utisre.sre_id from uti_sre utisre where utisre.uti_id = ${utilisateurCourant.uti_id} and utisre.uts_actif = true) 
        inner join profil pro on pro.rol_id = uti.rol_id
        left join utilisateur ins on ins.uti_id = dem.dem_uti_formateur_id
        left join codepostal_insee cpi on cpi.cpi_codeinsee = dem.dem_inseeformation  and cpi.cpi_codepostal = (select d.cpi_codepostal from codepostal_insee d where d.cpi_codeinsee = cpi.cpi_codeinsee limit 1)
        LEFT JOIN commune com on com.cpi_codeinsee = dem.dem_inseeformation 
        inner join structure_ref sre on sre.sre_id = dem.dem_sre_id

                                order by 3,4 asc`;
    } 
    else
    {
        // si on est instructeur (formateur), on affiche seulements les utilisateurs qui on une demande en cours
        // Sauf les Admin créés sur structure
        /*
                datedemandeaaq: user.datedemandeaaq,
        dateaccordaaq: user.dateaccordaaq,
                daterefusaaq: user.daterefusaaq,
        statutdemande: user.statutdemande,
        motifrefus: user.motifrefus, 
        */
        requete = `SELECT uti.*,replace(replace(uti.uti_validated::text,'true','Validée'),'false','Non validée') as inscription,
        pro.rol_libelle, to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq, 
        to_char(dem.dem_dateaccord, 'DD/MM/YYYY') dateaccordaaq, 
        'Indépendant' sre_libelle, 
        cpi.cpi_codepostal || '-' || com.com_libelle lieuformation, 
        to_char(dem_datedebutformation,'DD/MM/YYYY') datedebutformation, 
        to_char(dem_datefinformation,'DD/MM/YYYY') datefinformation,
        to_char(dem.dem_daterefus, 'DD/MM/YYYY') daterefusaaq,  
        dem.dem_dms_id statutdemande,
        dem.dem_motifrefus motifrefus
        from utilisateur uti 
        inner join demande_aaq dem on dem.dem_uti_formateur_id = ${utilisateurCourant.uti_id} and uti.uti_id = dem_uti_demandeur_id
        join profil pro on pro.rol_id = uti.rol_id
        left join codepostal_insee cpi on cpi.cpi_codeinsee = dem.dem_inseeformation  and cpi.cpi_codepostal = (select d.cpi_codepostal from codepostal_insee d where d.cpi_codeinsee = cpi.cpi_codeinsee limit 1)
        LEFT JOIN commune com on com.cpi_codeinsee = dem.dem_inseeformation 
        order by uti_id asc`;
    }
    log.d('::demandes - requete',{ requete })
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::demandes - erreur lors de la récupération.',err.stack);
            return res.status(400).json({message: 'erreur lors de la récupération des utilisateurs'});
        }
        else {
            log.i('::demandes - Done')
            const users = result.rows.map(formatUser);
            res.json({ users });
        }
    })
})

router.get('/:id', async function (req, res) {
    const { id } = req.params
    log.i('::get - In', { id })
    const utilisateurCourant = req.session.user
    if ( utilisateurCourant.rol_id == 1 || utilisateurCourant.rol_id == 3 || utilisateurCourant.rol_id == 6) {
        // si on est admin, on affiche l'utilisateur
        requete = `SELECT uti.*,uti_sre.sre_id structurerefid,  dem.dem_uti_formateur_id formateurid,
            replace(replace(uti.uti_validated::text,'true','Validée'),'false','Non validée') as inscription, rol.rol_libelle,
            to_char(dem_datedebutformation,'DD/MM/YYYY') datedebutformation, 
            to_char(dem_datefinformation,'DD/MM/YYYY') datefinformation,
            cpi.cpi_codepostal || '-' || com.com_libelle lieuformation
            from utilisateur uti 
            join profil rol on rol.rol_id = uti.rol_id
            left join uti_sre on uti_sre.uti_id = uti.uti_id and uti_sre.uts_actif = true
            left join demande_aaq dem on dem.dem_uti_demandeur_id = uti.uti_id and dem.dem_dms_id = 1
            left join codepostal_insee cpi on cpi.cpi_codeinsee = dem.dem_inseeformation
            LEFT JOIN commune com on com.cpi_codeinsee = dem.dem_inseeformation 
            where uti.uti_id=${id} order by uti.uti_id asc`;

        log.d('::get - select un USER, requête = '+requete)
        pgPool.query(requete, (err, result) => {
            if (err) { 
                log.w('::get - Erreur lors de la requête', err.stack)
                return res.status(400).json({message: 'erreur lors de la récupération de l\'utilisateur'});
            }
            else {
                const user = result.rows && result.rows.length && result.rows[0];
                if (!user) {
                    log.w('::get - Utilisateur inexistant')
                    return res.status(400).json({ message: 'Utilisateur inexistant' });
                }
                log.d('::get - Done')
                res.json({ user: formatUser(user) });
            }
        })
    }
});

router.get('/', async function (req, res) {
    log.i('::list - In')
    const utilisateurCourant = req.session.user
    let requete = "";
    log.d('UtilisateurCourant!',utilisateurCourant.rol_id)
    if ( utilisateurCourant.rol_id == 1) {
        // si on est admin, on affiche tous les utilisateurs
        requete = `SELECT uti.*, pro.rol_libelle,replace(replace(uti.uti_validated::text,'true','Validée'),'false','Non validée'),replace(replace(uti.uti_validated::text,'true','Validée'),'false','Non validée') as inscription,replace(replace(uti.pwd_validated::text,'true','Validé'),'false','Non validé') as validationmail
        from utilisateur uti 
        join profil pro on pro.rol_id = uti.rol_id
        order by uti_id asc`;
    }
    // Je suis utilisateur "gestionnaire de struture de référence" ==> on affiche les demandes de ma structure
    else if ( utilisateurCourant.rol_id == 6) 
    {
        requete =`SELECT  uti.*,replace(replace(uti.uti_validated::text,'true','Validée'),'false','Non validée') as inscription,pro.rol_libelle, to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq, to_char(dem.dem_dateaccord, 'DD/MM/YYYY') dateaccordaaq, ins.uti_prenom || ' ' || ins.uti_nom instructeur,
        to_char(dem.dem_daterefus, 'DD/MM/YYYY') daterefusaaq,  
        dem.dem_dms_id statutdemande,  
        dem.dem_motifrefus motifrefus         
        from utilisateur  uti
        inner join demande_aaq dem on dem.dem_uti_demandeur_id = uti.uti_id 
                                and dem.dem_sre_id in (select utisre.sre_id from uti_sre utisre where utisre.uti_id = ${utilisateurCourant.uti_id} and utisre.uts_actif = true) 
        inner join profil pro on pro.rol_id = uti.rol_id
        left join utilisateur ins on ins.uti_id = dem.dem_uti_formateur_id

                                order by 3,4 asc`;
    } 
    else
    {
        // si on est formateur, on affiche seulements les utilisateurs qui on une demande en cours
        // Sauf les Admin créés sur structure
        requete = `SELECT uti.*,replace(replace(uti.uti_validated::text,'true','Validée'),'false','Non validée') as inscription,pro.rol_libelle, to_char(dem.dem_datedemande, 'DD/MM/YYYY') datedemandeaaq, to_char(dem.dem_dateaccord, 'DD/MM/YYYY') dateaccordaaq,cpi.cpi_codepostal || '-' || com.com_libelle lieuformation, to_char(dem_datedebutformation,'DD/MM/YYYY') datedebutformation, to_char(dem_datefinformation,'DD/MM/YYYY') datefinformation,
        to_char(dem.dem_daterefus, 'DD/MM/YYYY') daterefusaaq,  
        dem.dem_dms_id statutdemande,  
        dem.dem_motifrefus motifrefus         
        from utilisateur uti 
        inner join demande_aaq dem on dem.dem_uti_formateur_id = ${utilisateurCourant.uti_id} and uti.uti_id = dem_uti_demandeur_id
        join profil pro on pro.rol_id = uti.rol_id
        left join codepostal_insee cpi on cpi.cpi_codeinsee = dem.dem_inseeformation and cpi.cpi_codepostal = (select d.cpi_codepostal  from codepostal_insee d where cpi.cpi_codeinsee = d.cpi_codeinsee limit 1)
        LEFT JOIN commune com on com.cpi_codeinsee = dem.dem_inseeformation 
        order by uti_id asc`;
    }
    log.d('::list - requete',{ requete })
    pgPool.query(requete, (err, result) => {
        if (err) {
            log.w('::list - erreur lors de la récupération.',err.stack);
            return res.status(400).json({message: 'erreur lors de la récupération des utilisateurs'});
        }
        else {
            log.i('::list - Done')
            const users = result.rows.map(formatUser);
            res.json({ users });
        }
    })
})

router.delete('/:id', async function (req, res) {

    const currentUser = req.session.user
    const id = req.params.id
    log.i("Delete user " + id)

    if (currentUser.rol_id == 1) { // admin

        const requete = " DELETE FROM utilisateur WHERE uti_id = $1 AND uti_validated=false RETURNING * "
        log.d(requete)

        return pgPool.query(requete, [id], (err, result) => {

            if (err) {

                log.w('::delete - Erreur survenue lors de la suppression utilisateur.', {requete, err: err.stack});
                return res.status(400).json({message: 'erreur lors de la suppression du document ' + id});

            } else {

                try {
                    pgPool.query("INSERT INTO log_suppression VALUES ($1, current_timestamp, 'user', $2, $3, $4)", [currentUser.uti_id, id, JSON.stringify(result.rows[0]), 'Suppression d\'un utilisateur'], (err, result) => {})
                } catch (e) {
                    log.w(e.message)
                }
                log.i('::delete utilisateur - Done')
                // Suppression effectuée avec succès
                return res.status(200).json({message: 'Document supprimée avec succès.'});
            }
        });

    } else {

        return res.status(403);
    }
})


router.put('/:id', async function (req, res) {
    const user = req.body.utilisateurSelectionne
    const id = req.params.id
    log.i('::update - In', { id })
    let { nom, prenom, mail, role, validated, statut,eaps,publicontact,mailcontact,sitewebcontact,adrcontact,compadrcontact,cpi_codeinsee,cp,telephonecontact,structurerefid, donneleconsparticulieres } = user
    if (role==3 || role==6) {

        const requeteStructure = `SELECT sre_id, uts_actif FROM uti_sre WHERE uti_id = ${id} and sre_id = ${structurerefid}`
        log.d(requeteStructure)
        const userQuery = await pgPool.query(requeteStructure).catch(err => {
            log.w(err)
            throw err
        })
        if(userQuery.rowCount == 0) {
            const requeteCreUtiStr = `INSERT INTO uti_sre (uti_id,sre_id,uts_actif) VALUES (${id}, ${structurerefid}, true) RETURNING *`
            // Aucune structure ne correspond à celle demandée
            log.d('Aucune structure correspondante pour cet utilisateur on créé le lien.')
            log.d(requeteCreUtiStr)
            const { rows } =  pgPool.query(requeteCreUtiStr).catch(err => {
              })
        }
        // On passe à inactif toutes les structures autres que celle sélectionnée
        // On passe à actif la structure sélectionnée
        const requeteMajUtiStr = `UPDATE uti_sre SET uts_actif = (sre_id=${structurerefid}) WHERE uti_id = ${id} RETURNING *`
        // Aucune structure ne correspond à celle demandée
        log.d(requeteMajUtiStr)
        const { rows } = await pgPool.query(requeteMajUtiStr).catch(err => {
            throw err
        })
    }

    // Mise à jour de l'utilisateur
    const requete = `UPDATE utilisateur 
    SET uti_nom = $1,
    uti_prenom = $2,
    uti_mail = lower($3),
    uti_validated = $4,
    rol_id = $5,
    stu_id = $6,
    uti_eaps= $7,
    uti_publicontact = $8,
    uti_mailcontact = $9,
    uti_sitewebcontact = $10,
    uti_adrcontact = $11,
    uti_compadrcontact = $12,
    uti_com_codeinseecontact = $13,
    uti_com_cp_contact = $14,
    uti_telephonecontact = $15,
    uti_donneleconsparticulieres  = $16
    WHERE uti_id = ${id}
    RETURNING *
    ;`
    pgPool.query(requete,[nom,
        prenom,
        mail,
        validated,
        role,
        statut,
        eaps,
        publicontact,
        mailcontact,
        sitewebcontact,
        adrcontact,
        compadrcontact,
        cpi_codeinsee,
        cp,
        telephonecontact,
        donneleconsparticulieres], (err, result) => {
        if (err) {
            log.w('::update - erreur lors de l\'update', {requete, erreur: err.stack});
            return res.status(400).json({message: 'erreur lors de la sauvegarde de l\'utilisateur'});
        }
        else {
            log.i('::update - Done')
            // Si c'est un rôle Instructeur qui est mise à jour alors
            // On vérifie si c'est la même structure de référence
            // Si c'est la Même : RAS
            // Si elle est différente alors, il faut la remplacer.
            return res.status(200).json({ user: formatUser(result.rows[0])});
        }
    })
})

module.exports = router;