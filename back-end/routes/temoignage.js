const express = require('express');
const router = express.Router();
const pgPool = require('../pgpool').getPool();
const crypto = require("crypto")
const fs = require('fs');
const { encryptText } = require('../utils/crypto')
const { decryptText } = require('../utils/crypto')
const { formatAndSendMail } = require('../utils/mail-service')
const logger = require('../utils/logger')
const log = logger(module.filename)

// affichage des temoignages avec clé
router.post('/kadmin', async function (req, res) {
    const { file } = req.body
    log.i('::list temoignage en attente avec cle- In')
    return pgPool.query(`SELECT tem.id AS id,mes.content AS content, tem.code_b AS code,tem.code_f AS codefront, 
        to_char(mes.date_create,'DD/MM/YYYY HH24:MI') AS date, mes.id AS mes_id,tem.statut AS statut_id,
        tem.typologie AS typologie, tem.anciennete AS anciennete,sta.libelle AS statut_libelle
        FROM temoignage tem
        JOIN messages mes on mes.tem_id = tem.id
        JOIN statut sta on sta.id = tem.statut
        ORDER BY date asc`,
        [],
        (err, result) => {
            if (err) {
                log.w('::list temoignage en attente - Error', err)
                return res.status(400).json({ message: 'erreur sur la requete de list' });
            }
            else {
                const temoignages = result.rows;
                temoignages.forEach(element => {
                    try {
                        element.code = decryptText(Buffer.from(element.code,'base64'),file).toString()
                    }
                    catch {
                        element.code = 'XXX'
                        element.email = 'XXX@XXX.XX'
                        element.erreur= true
                    }
                })
                console.log(temoignages)
                log.i('::list temoignage en attente avec clé- Done '+temoignages.length)
                return res.status(200).json({ temoignages: temoignages });
            }
        })   
})
// affichage des temoignages sans clé
router.get('/admin/', function (req, res) {
    log.i('::list temoignage en attente sans cle- In')
    return pgPool.query(`SELECT tem.id AS id,mes.content AS content, tem.code_b AS code,tem.code_f AS codefront, 
        to_char(mes.date_create,'DD/MM/YYYY HH24:MI') AS date,tem.statut AS statut_id,tem.typologie AS typologie, tem.anciennete AS anciennete,
        sta.libelle AS statut_libelle
        FROM temoignage tem
        JOIN messages mes on mes.tem_id = tem.id
        JOIN statut sta on sta.id = tem.statut
        ORDER BY date asc`,
        [],
        (err, result) => {
            if (err) {
                log.w('::list temoignage en attente - Error', err)
                return res.status(400).json({ message: 'erreur sur la requete de list' });
            }
            else {
                const temoignages = result.rows;
                temoignages.forEach(element => {
                    element.code = 'XXX'
                    element.email = 'XXX@XXX.XX'
                })
                log.i('::list temoignage en attente sans cle- Done')
                return res.status(200).json({ temoignages: temoignages });
            }
        })
})

// affichage d'un témoignage et des messages associés par code utilisateur
router.post('/details/', async function (req, res) {
    const { code } = req.body
    //const code = req.params.code
    log.i('::get by code - In')
    // Chiffrement de la clé Utilisateur via la clé publique
    const hashCode = crypto.createHash('md5').update(code).digest('hex');

    pgPool.query(`SELECT tem.id AS id,mes.content AS content, code_f AS code,to_char(mes.date_create,'DD/MM/YYYY HH24:MI') AS date, mes.sentbyadmin AS admin,
                mes.iv AS iv, mes.id as mes_id, tem.statut AS statut_id,tem.typologie AS typologie, tem.anciennete AS anciennete,sta.libelle AS statut_libelle
                FROM temoignage tem
                JOIN messages mes ON mes.tem_id = tem.id
                JOIN statut sta on sta.id = tem.statut
                WHERE code_f = $1
                ORDER BY date asc`, [$1 = hashCode], (err, result) => {
        if (err) {
            log.w('::get by code- error', err)
            return res.status(400).json({ message: 'erreur sur la requete de récupération des données ' });
        }
        else {
            log.i('::get by code - Done')
            const temoignage = result.rows
            // dechiffrement du champs description de chaque ligne
            temoignage.forEach(element => {
                const key = Buffer.from(code.padEnd(24, "\0"));
                const iv = element.iv
                const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv);
                let decrypted = decipher.update(element.content, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                element.content = JSON.parse(decrypted)
                element.code = code
            });
            log.i('::get by code - Dechiffrement Done')
            return res.status(200).json({ temoignage: temoignage });
        }
    });
})

// creation d'un temoignage
router.post('/', async function (req, res) {
    const { content, code, admin } = req.body
    log.i('::post - In')
    // chiffrement du champs description via la clé Utilisateur
    const algorithm = 'aes-192-cbc';
    const key = Buffer.from(code.padEnd(24, "\0"));
    crypto.randomFill(new Uint8Array(16), (err, iv) => {
        if (err) throw err;
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(JSON.stringify(content), 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Chiffrement de la clé Utilisateur via la clé publique
        //const encryptedCode = encryptText(code)/toString
        const encryptedCode = encryptText(code).toString("base64")   
        
        // Hachage du code
        const hashCode = crypto.createHash('md5').update(code).digest('hex');

        // insertion des données en base
        const requeteTem = `INSERT INTO temoignage (code_f,code_b,statut) values($1,$2,0) RETURNING *`;
        log.d('::post - 1ere requete', { requeteTem });
        return pgPool.query(requeteTem, [ hashCode, encryptedCode], async (err, result) => {
            if (err) {
                log.w('::post - Erreur lors de la requête.', err.stack);
                return res.status(400).json({ message: 'erreur lors de la création du témoignage' });
            }
            else {
                const id = result.rows[0].id
                const requeteMes = `INSERT INTO messages (tem_id,content,iv, date_create,sentbyadmin) values($1,$2,$3,NOW(),$4)`;
                log.d('::post - 2eme requete', { requeteMes });
                // insertion des données chiffrées
                return pgPool.query(requeteMes, [ id, encrypted,iv, admin], async (err, result) => {
                    if (err) {
                        log.w('::post - Erreur lors de la requête.', err.stack);
                        return res.status(400).json({ message: 'erreur lors de la création du message' });
                    }
                    else {
                        if (content.email != null && content.email != '' && !admin) {
                            // envoi de mail
                            await formatAndSendMail(content.email, code)
                                .then(() => {
                                    log.d('::post - Mail de confirmation envoyé')
                                })
                                .catch(err => {
                                    log.w(err)
                                    throw err
                                })
                        }
                        return res.status(200).json({ code: code });
                    }
                })
            }   
        })
    })
})

// creation d'un message
router.post('/admin/', async function (req, res) {
    const { id,content, code, admin } = req.body
    console.log(id,content, code, admin)
    log.i('::post by adminUser- In')
    // chiffrement du champs description via la clé Utilisateur
    const algorithm = 'aes-192-cbc';
    const key = Buffer.from(code.padEnd(24, "\0"));
    crypto.randomFill(new Uint8Array(16), (err, iv) => {
        if (err) throw err;
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(JSON.stringify(content), 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // insertion des données en base
        const requete = `INSERT INTO messages (tem_id,content,iv,date_create,sentbyadmin) values($1,$2,$3,NOW(),$4)`;
        log.d('::post by adminUser - requete', { requete });
        return pgPool.query(requete, [id, encrypted, iv,admin], (err, result) => {
            if (err) {
                log.w('::post by adminUser - Erreur lors de la requête.', err.stack);
                return res.status(400).json({ message: 'erreur lors de la sauvegarde du message' });
            }
            else {
                log.i('::post by adminUser - Done')
                return res.status(200).json({ id: id });
            }
        })
    })
})

// Mise à jour d'un temoignage
router.put('/admin/:id', async function (req, res) {
    const id = req.params.id    
    const { typologie,anciennete,statut } = req.body
    console.log(typologie,anciennete,statut )
    log.i('::put by adminUser- In')
    
    const requete = `UPDATE temoignage set typologie=$1,anciennete=$2,statut=$3 WHERE id=$4 RETURNING *`;
    log.d('::put by adminUser - requete', { requete });
    return pgPool.query(requete, [typologie,anciennete,statut,id], (err, result) => {
        if (err) {
            log.w('::put by adminUser - Erreur lors de la requête.', err.stack);
            return res.status(400).json({ message: 'erreur lors de la maj du témoignage' });
        }
        else {
            log.i('::put by adminUser - Done')
            return res.status(200).json({ temoignage: result.rows[0] });
        }
    })
})

module.exports = router;