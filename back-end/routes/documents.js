const express    = require('express');
const router     = express.Router();
const stream = require('stream');
let   upload     = require('../utils/multer.config.js')
const pgPool = require('../pgpool').getPool();

const logger = require('../utils/logger')
const log = logger(module.filename)

const selectAllDocumentAdmin = "SELECT document.*, 1 AS deletable, JSON_AGG(rol_id) AS roleIds, JSON_AGG(rol_libelle) AS roleLibelles, " +
    " JSON_AGG(rol_ordre) AS roleOrdre, JSON_AGG(authorized) AS roleAuthorized " +
    " FROM document, (SELECT tuple.*, COUNT(link.doc_id) AS authorized FROM " +
    " (SELECT doc_id, profil.* FROM document , profil ORDER BY doc_id ASC, rol_ordre ASC) AS tuple " +
    " LEFT JOIN document_profil_link link ON tuple.doc_id=link.doc_id AND tuple.rol_id=link.rol_id " +
    " GROUP BY tuple.doc_id, tuple.rol_id, rol_libelle, rol_ordre ORDER BY doc_id, rol_ordre) AS data " +
    " WHERE document.doc_id=data.doc_id GROUP BY document.doc_id"


const selectAllDocument = function(roleId) {
    return `SELECT document.*, 0 AS deletable ` +
        ` FROM document, document_profil_link ` +
        ` WHERE document.doc_id=document_profil_link.doc_id AND document_profil_link.rol_id=${roleId} `
}

router.get('/', function (req, res, next) {
    log.i('::list - In')

    if (req==null || req.session==null || req.session.user==null) {
        log.w("No user => no access")
        res.status(403)
    }

    let queryDocument = req.session.user.rol_id == 1 ? selectAllDocumentAdmin : selectAllDocument(req.session.user.rol_id)

    log.d("Profil "+req.session.user.rol_id+ ", test result : "+(req.session.user.rol_id == 1))

    pgPool.query(
        queryDocument,
        function (err, result) {
            if (err) {
                log.w('::list - erreur', err);
                return res.status(400).json({ message: 'erreur lors de la récupération des documents.' })
            } else {
                log.i('::list - Done, fin de la transaction documents', result.length);
                const documents = result && result.rows
                return res.send(documents);
            }
        })
})


router.get('/:docId', function (req, res, next) {
    const id = req.params.docId
    log.i('::get - In', { id })
    pgPool.query(
        `SELECT * FROM document WHERE doc_id = ${id}`,
        function (err, results) {
            if (err || results.rows.length == 0) {
                log.w('::get - erreur',err);
                return res.status(400).json({ message: 'Erreur lor des la récupération du document.' });
            } else {
                log.i('::get - Done, fin de la transaction documents');
                var file = results.rows[0]
                var fileContents = Buffer.from(file.doc_contenu, "base64");
                var readStream = new stream.PassThrough();
                readStream.end(fileContents);
                
                res.set('Content-disposition', 'attachment; filename=' + file.doc_libelle);
                res.set('Content-Type', file.doc_type);
                return readStream.pipe(res);
            }
        })
})

router.delete('/:docId', function (req, res, next) {
    const id = req.params.docId
    log.i('::delete - In', { id });
    pgPool.query(
        `DELETE FROM document WHERE doc_id = ${id}`,
        function (err, results) {
            if (err) {
                log.w('::delete - erreur',err);
                return res.status(400).json({ message: 'Erreur lor des la suppression du document.' });
            } else {
                log.d('::delete - Done')
                return res.send('OK')
            }
        })
})

router.post('/link', function (req, res) {

        if (req==null || req.session==null || req.session.user==null) {
            log.w("No user => no access")
            res.status(403)
        }
        log.d("user : "+ JSON.stringify(req.session.user))

        const docId = req.body.params.docId
        const roleId = req.body.params.roleId
        const checked = req.body.params.checked

        log.d("Body params : "+docId+" - "+roleId+" - "+checked)

        if (checked || checked==="checked") {
            let requete = `INSERT INTO document_profil_link VALUES (${docId},${roleId})`
            return pgPool.query(requete, (err, result) => {
                if (err) {
                    log.w('::post - Erreur',{ requete, erreur: err.stack});
                    return res.status(400).json({ message: 'erreur lors de la sauvegarde du lien document/role'});
                } else {
                    log.i('::post - Done', { rows: result.rows })
                    return res.status(200).json({ fichier: result.rows[0] });
                }
            })
        } else {

            pgPool.query(
                `DELETE FROM document_profil_link WHERE doc_id=${docId} AND rol_id=${roleId}`,
                function (err, results) {
                    if (err) {
                        log.w('::delete - erreur',err);
                        return res.status(400).json({ message: 'Erreur lor des la suppression du lien profil / document.' });
                    } else {
                        log.d('::delete - Done')
                        return res.send('OK')
                    }
                })
        }
    }
)

router.post('/', upload.single("file"), (req, res) => {
    log.i('::post - In')
    const requete = `INSERT INTO document 
    (doc_type, doc_filename, doc_libelle, doc_contenu) 
    VALUES($1,$2,$3,$4)`;
    // Mantis 86371
    // Correction de l'impossibilité de charger un document
    // Oubli du req. devant file lors de l'audit de code.
    // const file = file
    const file = req.file
    const { libelle } = req.body
    return pgPool.query(requete, [file.mimetype, file.originalname, libelle, file.buffer], (err, result) => {
        if (err) {
            log.w('::post - Erreur',{ requete, erreur: err.stack});
            return res.status(400).json({ message: 'erreur lors de la sauvegarde du fichier'});
        }
        else {
            log.i('::post - Done', { rows: result.rows })
            return res.status(200).json({ fichier: result.rows[0] });
        }
    })
})


module.exports = router;