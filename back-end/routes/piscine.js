const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();

const logger = require('../utils/logger')
const log = logger(module.filename)

router.get('/', function (req, res) {
    log.i('::list - In')    
    const v_codepostal = req.query.codepostal;
    // Recherche des communes correspondant au codepostal
    return pgPool.query(`SELECT pis.pis_id AS id, pis.pis_nom AS nom, pis.pis_x AS x, pis.pis_y AS y, pis.cpi_codeinsee AS codeinsee, cpi.cpi_codepostal AS cp, \
        pis.pis_adr AS adresse FROM piscine pis  
        INNER JOIN codepostal_insee cpi on cpi.cpi_codeinsee = pis.cpi_codeinsee
        WHERE cpi.cpi_codepostal = $1 `,
        [$1 = v_codepostal],
        (err, result) => {
            if (err) {
                log.w('::list - Error', err)
                return res.status(400).json({ message: 'erreur sur la requete de listpiscine' });
            }
            else {
                const piscines = result.rows;
                log.i('::list - Done')
                return res.status(200).json({ piscines });
            }
        })
})


router.get('/user/:id', function (req, res) {
    const uti_id = req.params.id
    log.i('::get - for user - In')
    // Recherche des piscines appartenant au utilisateur
    return pgPool.query(`SELECT pis.pis_id AS id, pis.pis_nom AS nom, pis.pis_x AS x, pis.pis_y AS y,pis.pis_adr AS adresse, \
                com.com_libelle AS cp, p.cpi_codepostal as codepostal, pis.cpi_codeinsee AS codeinsee
                FROM piscine pis  
                INNER JOIN uti_pis upi on upi.pis_id = pis.pis_id
                INNER JOIN commune com on com.cpi_codeinsee = pis.cpi_codeinsee
                LEFT JOIN (SELECT distinct on (cpi_codeinsee) cpi_codeinsee,cpi_codepostal FROM codepostal_insee) p on p.cpi_codeinsee = pis.cpi_codeinsee \
                WHERE upi.uti_id = $1 `,
        [$1 = uti_id],
        (err, result) => {
            if (err) {
                log.w('::get - for user - error', err)
                return res.status(400).json({ message: 'erreur sur la requete de récupération des piscines de l\'utilsateur' + uti_id });
            }
            else {
                log.i('::get - for user - Done')
                const mesPiscines = result.rows;
                return res.status(200).json({ mesPiscines });
            }
        });
});

router.get('/privee/:id', async function (req, res) {
    const id = req.params.id
    log.i('::get - In',{id})

    // Recherche de la piscine par id
    pgPool.query(`SELECT pis.pis_id AS id, pis.pis_nom AS nom, pis.pis_x AS x, pis.pis_y AS y, \
    pis.pis_adr AS adresse, pis.cpi_codeinsee AS codeinsee, com.com_libelle AS libelle, cpi.cpi_codepostal AS cp, \    
    pp.pp_mail AS mailcontact, pp.pp_bassins AS bassins, pp.pp_telephone AS telephonecontact, pp.pp_siteweb AS sitewebcontact, \
    pp.pp_date_ouverture AS dateouverture, pp.pp_profondeur AS profondeur, pp.pp_dimension AS dimension, \
    pp.pp_type AS type, pp.pp_ouverture_annuelle AS ouvertureannuelle, pp.pp_chauffage AS chauffage, pp.pp_vestiaire AS vestiaire, \
    pp.pp_toilettes AS toilettes, pp.pp_salles AS salles, pp.pp_parking AS parking \
    FROM piscine pis  \
    INNER JOIN commune com ON com.cpi_codeinsee = pis.cpi_codeinsee \
    INNER JOIN codepostal_insee cpi on cpi.cpi_codeinsee = pis.cpi_codeinsee
    INNER JOIN piscine_privee pp ON PP.pis_id = pis.pis_id \    
    WHERE pis.pis_id = $1 `, [$1 = id], (err, result) => {
            if (err) {
                log.w('::get - error', err)
                return res.status(400).json({ message: 'erreur sur la requete de récupération de la piscine ' + id });
            }
            else {
                log.i('::get - Done')
                const maPiscine = result.rows[0];
                return res.status(200).json({ maPiscine });
            }
        });
})

router.get('/:id', async function (req, res) {
    const id = req.params.id
    log.i('::get - In')
    // Recherche de la piscine par id
    pgPool.query(`SELECT pis.pis_id AS id, pis.pis_nom AS nom, pis.pis_x AS x, pis.pis_y AS y,pis.pis_adr AS adresse, com.com_libelle AS cp
                FROM piscine pis  
                INNER JOIN commune com ON com.cpi_codeinsee = pis.cpi_codeinsee
                WHERE pis.pis_id = $1 `, [$1 = id], (err, result) => {
            if (err) {
                log.w('::get - error', err)
                return res.status(400).json({ message: 'erreur sur la requete de récupération de la piscine ' + id });
            }
            else {
                log.i('::get - Done')
                const maPiscine = result.rows[0];
                return res.status(200).json({ maPiscine });
            }
        });
})

router.post('/privee/', function (req, res) {
    const { nom,adresse,cp,piscine_privee,complement } = req.body
    log.i('::Add - In', { nom,adresse,cp,piscine_privee,complement })
    //insert dans la table piscine
    const requete = `INSERT INTO piscine (pis_nom,pis_adr,cpi_codeinsee,pis_datemaj,piscine_privee,export) values($1,$2,$3,NOW(),$4,true) RETURNING *`;

    log.d('::post - requete', { requete });
    return pgPool.query(requete, [nom,adresse,cp,piscine_privee], (err, result) => {
        if (err) {
            log.w('::post - Erreur lors de la requête.', err.stack);
            return res.status(400).json({ message: 'erreur lors de la sauvegarde de la piscine' });
        }
        else {
            log.i('::post - second request about to start', { rows: result.rows[0].pis_id })
            // insertion table piscine_privee
            const insert = `INSERT INTO piscine_privee (pis_id,pp_date_operation,pp_mail,pp_telephone,pp_date_ouverture,pp_profondeur, \
                pp_dimension,pp_type,pp_ouverture_annuelle,pp_chauffage,pp_vestiaire,pp_toilettes,pp_salles,pp_parking,pp_siteweb,pp_bassins) \
                values($1,NOW(),$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`;

            return pgPool.query(insert, [result.rows[0].pis_id ,complement.mailcontact,complement.telephonecontact,complement.dateouverture,complement.profondeur,complement.dimension,complement.type,complement.ouvertureannuelle,complement.chauffage,complement.vestiaire,complement.toilettes,complement.salles,complement.parking,complement.sitewebcontact,complement.bassins], (err, result) => {
                if (err) {
                    log.w('::post - Erreur lors de l\'insertion dans la table des piscines privees.', err.stack);
                    return res.status(400).json({ message: 'erreur lors de l\'insertion dans la table des piscines privees' });
                }
                else {
                    //Select pour affichage
                    return pgPool.query(`SELECT pis.pis_id AS id, pis.pis_nom AS nom, pis.pis_x AS x, pis.pis_y AS y, cpi.cpi_codepostal AS cp, pis.pis_adr AS adresse
                                FROM piscine pis  
                                JOIN codepostal_insee cpi ON cpi.cpi_codeinsee = pis.cpi_codeinsee
                                WHERE pis.pis_id = $1 `, [$1 = result.rows[0].pis_id],  (err, resu) => {
                    if (err) {
                        log.w('::post - Error', err)
                        return res.status(400).json({ message: 'erreur sur la requete de récupération des piscines de l\'utilsateur' });
                    } else {
                            log.i('::post - Done', { rows: resu.rows })
                            const newPiscine = resu.rows[0];
                            return res.status(200).json({ maPiscine: newPiscine });
                    }});
                }});
        }
    })
})

router.post('/new/', function (req, res) {
    const { nom,adresse,cp } = req.body
    log.i('::Add - In', { nom,adresse,cp })
    //insert dans la table piscine
    const requete = `INSERT INTO piscine (pis_nom,pis_adr,cpi_codeinsee,pis_datemaj) values($1,$2,$3,NOW()) RETURNING *`;

    log.d('::post - requete', { requete });
    return pgPool.query(requete, [nom,adresse,cp], (err, result) => {
        if (err) {
            log.w('::post - Erreur lors de la requête.', err.stack);
            return res.status(400).json({ message: 'erreur lors de la sauvegarde de la piscine' });
        }
        else {
            log.i('::post - second request about to start', { rows: result.rows })
            return pgPool.query(`SELECT pis.pis_id AS id, pis.pis_nom AS nom, pis.pis_x AS x, pis.pis_y AS y, cpi.cpi_codepostal AS cp, pis.pis_adr AS adresse
                        FROM piscine pis  
                        JOIN codepostal_insee cpi ON cpi.cpi_codeinsee = pis.cpi_codeinsee
                        WHERE pis.pis_id = $1 `, [$1 = result.rows[0].pis_id],  (err, resu) => {
            if (err) {
                log.w('::post - Error', err)
                return res.status(400).json({ message: 'erreur sur la requete de récupération des piscines de l\'utilsateur' });
            } else {
                    log.i('::post - Done', { rows: resu.rows })
                    const newPiscine = resu.rows[0];
                    return res.status(200).json({ maPiscine: newPiscine });
            }});
        }
    })
})

router.post('/', function (req, res) {
    const { maPiscine } = req.body
    log.i('::posts - In', { maPiscine })
    //insert dans la table uti_pis
    const requete = `INSERT INTO uti_pis (uti_id,pis_id) values($1,$2 ) RETURNING *`;

    log.d('::post - requete', { requete });
    return pgPool.query(requete, [maPiscine.utilisateurId,maPiscine.id], (err, result) => {
        if (err) {
            log.w('::post - Erreur lors de la requête.', err.stack);
            return res.status(400).json({ message: 'erreur lors de la sauvegarde de la piscine favorite' });
        }
        else {
            log.i('::post - second request about to start', { rows: result.rows })
            return pgPool.query(`SELECT pis.pis_id AS id, pis.pis_nom AS nom, pis.pis_x AS x, pis.pis_y AS y, cpi.cpi_codepostal AS cp, pis.pis_adr AS adresse
                        FROM piscine pis  
                        JOIN codepostal_insee cpi ON cpi.cpi_codeinsee = pis.cpi_codeinsee
                        WHERE pis.pis_id = $1 `, [$1 = maPiscine.id],  (err, resu) => {
            if (err) {
                log.w('::post - Error', err)
                return res.status(400).json({ message: 'erreur sur la requete de récupération des piscines de l\'utilsateur' + uti_id });
            } else {
                    log.i('::post - Done', { rows: resu.rows })
                    const newPiscine = resu.rows[0];
                    return res.status(200).json({ maPiscine: newPiscine });
            }});
        }
    })
})

router.put('/privee/:id', function (req, res) {
    const id = req.params.id
    console.log('---------------')
    console.log(req.body)
    console.log('---------------')
    const { nom,adresse,cp,piscine_privee,complement } = req.body
    log.i('::Put - In', { nom,adresse,cp,piscine_privee,complement })
    //update dans la table piscine
    const requete = `UPDATE piscine set pis_nom = $1,pis_adr = $2,cpi_codeinsee = $3, pis_datemaj = NOW(),piscine_privee = $4 where pis_id = $5 RETURNING *`;

    log.d('::put - requete', { requete });
    return pgPool.query(requete, [nom,adresse,cp,piscine_privee,id], (err, result) => {
        if (err) {
            log.w('::put - Erreur lors de la MAJ de la piscine.', err.stack);
            return res.status(400).json({ message: 'erreur lors de la MAJ de la piscine' });
        }
        else {
            log.i('::put - second request about to start', { rows: result.rows[0].pis_id })
            // insertion table piscine_privee
            const update = `UPDATE piscine_privee SET pp_date_operation=NOW(),pp_mail=$1,pp_telephone=$2,pp_date_ouverture=$3,pp_profondeur=$4, \
                pp_dimension=$5,pp_type=$6,pp_ouverture_annuelle=$7,pp_chauffage=$8,pp_vestiaire=$9,pp_toilettes=$10,pp_salles=$11,pp_parking=$12,pp_siteweb=$13,pp_bassins=$14 \
                WHERE pis_id=$15 RETURNING *`;

            return pgPool.query(update, [complement.mailcontact,complement.telephonecontact,complement.dateouverture,complement.profondeur,complement.dimension,complement.type,complement.ouvertureannuelle,complement.chauffage,complement.vestiaire,complement.toilettes,complement.salles,complement.parking,complement.sitewebcontact,complement.bassins,result.rows[0].pis_id ], (err, result) => {
                if (err) {
                    log.w('::put - Erreur lors de la MAJ de la table des piscines privees.', err.stack);
                    return res.status(400).json({ message: 'erreur lors de l\'update dans la table des piscines privees' });
                }
                else {
                    //Select pour affichage
                    return pgPool.query(`SELECT pis.pis_id AS id, pis.pis_nom AS nom, pis.pis_x AS x, pis.pis_y AS y, cpi.cpi_codepostal AS cp, pis.pis_adr AS adresse
                                FROM piscine pis  
                                JOIN codepostal_insee cpi ON cpi.cpi_codeinsee = pis.cpi_codeinsee
                                WHERE pis.pis_id = $1 `, [$1 = result.rows[0].pis_id],  (err, resu) => {
                    if (err) {
                        log.w('::put - Error', err)
                        return res.status(400).json({ message: 'erreur sur la requete de récupération des piscines de l\'utilsateur' });
                    } else {
                            log.i('::put - Done', { rows: resu.rows })
                            const newPiscine = resu.rows[0];
                            return res.status(200).json({ maPiscine: newPiscine });
                    }});
                }});
        }
    })
})
router.post('/delete/privee/:id', async function (req, res) {
    const id = req.params.id
    const {userId} = req.body
    log.i('::delete privee - In', {id})
    const requete = `SELECT pis_id FROM intervention WHERE pis_id = $1;`;

    pgPool.query(requete, [id], (err, result) => {
        if (err) {
            log.w('::delete - Erreur survenue lors de la vérification de l\'existence d\'interventions dans cette piscine', { requete, err: err.stack })
            return res.status(400).json({ message: `Erreur lors de la vérification sur la piscine ${id} ` });
        }
        else {
            const nb = result.rows.length
            if (nb && nb > 0) {
                /* Si une intervention contient la piscine à supprimer alors on ne supprime que
                /  les informations contenues dans la table piscine_privee et la relation uti - piscine
                /  Ainsi on évite les problèmes lors de l'affichage de l'intervention, la piscine n'apparait
                /  plus dans les piscines préférées de l'utilisateur */
                log.i('::delete - Impossible de supprimer la piscine, des interventions ont été saisies dedans')
                const deleteRequete = `DELETE FROM piscine_privee WHERE pis_id = $1;`;
                pgPool.query(deleteRequete, [id], (err, result) => {
                    if (err) {
                        log.w('::delete - Erreur survenue lors de la suppression de cette piscine', { requete, err: err.stack })
                        return res.status(400).json({ message: `Erreur lors de la suppression de la piscine ${id} ` });
                    }
                    else {
                        log.i('::delete - Suppression des données de la table piscine_privee Done')
                        // Suppression de la relation utilisateur / piscine
                        const dernierDelete = `DELETE FROM uti_pis WHERE pis_id = $1 AND uti_id=$2 ;`;
                        pgPool.query(dernierDelete, [id,userId], (err, result) => {
                            if (err) {
                                log.w('::delete - Erreur survenue lors de la suppression du lien utilisateur - piscine', { requete, err: err.stack })
                                return res.status(400).json({ message: `Erreur lors de la suppression de la piscine ${id} des piscines de l'utiliateur` });
                            }
                            else {
                                log.i('::delete - Done')
                                // mise à jour du flag export
                                const updateExport = `UPDATE piscine SET export=false WHERE pis_id = $1;`;
                                pgPool.query(updateExport, [id], (err, result) => {
                                    if (err) {
                                        log.w('::update - Erreur survenue lors de la maj de la piscine', { requete, err: err.stack })
                                        return res.status(400).json({ message: `Erreur lors de la MAJ de la piscine ${id}` });
                                    }
                                    else {
                                        log.i('::update - Done')
                                        return res.status(200).json('piscine supprimée');
                                    }
                                })
                            }
                        })
                    }
                })
            }
            else {
                const deleteRequete = `DELETE FROM piscine WHERE pis_id = $1;`;
                pgPool.query(deleteRequete, [id], (err, result) => {
                    if (err) {
                        log.w('::delete - Erreur survenue lors de la suppression de cette piscine', { requete, err: err.stack })
                        return res.status(400).json({ message: `Erreur lors de la suppression de la piscine ${id} ` });
                    }
                    else {
                        log.i('::delete - piscine Done')
                        // Suppression de la relation utilisateur / piscine
                        const dernierDelete = `DELETE FROM uti_pis WHERE pis_id = $1 AND uti_id=$2 ;`;
                        pgPool.query(dernierDelete, [id,userId], (err, result) => {
                            if (err) {
                                log.w('::delete - Erreur survenue lors de la suppression du lien utilisateur - piscine', { requete, err: err.stack })
                                return res.status(400).json({ message: `Erreur lors de la suppression de la piscine ${id} des piscines de l'utiliateur` });
                            }
                            else {
                                log.i('::delete - Done')
                                return res.status(200).json('piscine supprimée');
                            }
                        })
                    }
                })
            }
        }
    })
})

router.post('/delete/', async function (req, res) {
    log.i('::delete - In')
    const maPiscine = req.body.piscine
    const requete = `DELETE FROM  uti_pis WHERE uti_id = $1 and pis_id = $2 RETURNING *;`;

    pgPool.query(requete, [maPiscine.uti_id, maPiscine.id], (err, result) => {
        if (err) {
            log.w('::delete - Erreur survenue lors de la suppression.', { requete, err: err.stack })
            return res.status(400).json({ message: `Erreur lors de la suppression de la piscine favorite ${id} ` });
        }
        else {
            log.i('::delete - Done')
            return res.status(200).json(result.rows[0]);
        }
    })
})

module.exports = router;