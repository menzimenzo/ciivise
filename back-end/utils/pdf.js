

const PDFDocument = require('pdfkit');
const fs = require('fs');
const config = require('../config');

const logger = require('../utils/logger');

const log = logger(module.filename)



async function generate(inter) {
   var nbzero;
   var idformate = "";
   var id = inter[0].id
   //var inter = getIntervention(params)
   //log.d("Intervention", inter)
   //log.d("inter.nbenfants",inter[0].nbEnfants)
   //log.d("inter.enfants",inter[0].enfant)
   var nbenfants = inter[0].nbEnfants
   log.d("INTERVENTION : ",inter[0])
   var dateDebutIntervention = inter[0].dateDebutIntervention.getDate().toString().padStart(2, "0") + "/" + (inter[0].dateDebutIntervention.getMonth() +1 ).toString().padStart(2, "0") + "/" + inter[0].dateDebutIntervention.getFullYear();
   var dateFinIntervention = inter[0].dateFinIntervention.getDate().toString().padStart(2, "0") + "/" + (inter[0].dateDebutIntervention.getMonth() +1 ).toString().padStart(2, "0") + "/" + inter[0].dateDebutIntervention.getFullYear();
   var Lieu = inter[0].piscine.codepostal + " " + inter[0].piscine.cp

   idformate = id.toString();
   for (nbzero=0;nbzero<7-id.toString().length;nbzero++){
       idformate = "0" + idformate;
   }
    var doc = new PDFDocument({
        size: 'A4',
        'dpi':400,
        layout: 'landscape' // default is portrait
      });

    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage
    doc.pipe(fs.createWriteStream(`${config.pathAttestation}${idformate}.pdf`));    

    var indexpage;
    for (indexpage = 1; indexpage <= nbenfants; indexpage++) {
        doc.image("./assets/AAQ_Attestation.jpg", 0,0, {
            cover: [841.89 , 595.28],
            layout : 'landscape'
        });
        var numattestation = "";
        var nbzero;
        var enfantPrenom = ""
        //log.d("enfant", inter[0].enfant[indexpage-1])
        if (inter[0].enfant[indexpage-1].prenom != undefined) {
            enfantPrenom = inter[0].enfant[indexpage-1].prenom
        }
        else
        {
            enfantPrenom = ""
        }

        // Formatage du numéro correspondant à chaque page
        var indexpageformate = inter[0].enfant[indexpage-1].enf_id;
        for (nbzero=0;nbzero<8-indexpage.toString().length;nbzero++){
            indexpageformate = "0" +  indexpageformate;
        }
        // Formatage final du numéro d'intervention
        numattestation = idformate +"-" + indexpageformate;
        // Formatage de la date
        //dateaffichee = dateDebutIntervention.substr(8,2)+"/"+dateDebutIntervention.substr(5,2)+"/"+dateDebutIntervention.substr(0,4);
        //dateaffichee = moment(inter[0].dateDebutIntervention).format("YYYY-MM-DD")
        //dateaffichee = inter[0].dateDebutIntervention

        doc.fontSize(14);
        //doc.text(numattestation,577,352.5,{align:'center'});

        // Doc.text(Objet, X, Y)

        doc.fontSize(18);
        doc.text(numattestation,640,138,{align:'left', width:300});
        if (enfantPrenom != undefined) {
            doc.text(enfantPrenom,505,257,{align:'left', width:400});
        }
        doc.text(dateDebutIntervention,300,282 ,{align:'left'});
        doc.text(dateFinIntervention,503,282,{align:'left'});
        doc.text(Lieu,250,308,{align:'left', width:500});
        //doc.registerFont('Wingdings')
        //doc.font('Wingdings')
        //doc.text(String.fromCharCode(80),370,340,{align:'left'});
        if (inter[0].enfant[indexpage-1].niv_fin == 1) {
            doc.text("X",370,333.8,{align:'left'});
        }
        if (inter[0].enfant[indexpage-1].niv_fin == 2) {
            doc.text("X",464.4,333.8,{align:'left'});
        }
        if (inter[0].enfant[indexpage-1].niv_fin == 3) {
                doc.text("X",558.3,333.8,{align:'left'});
        }
            // dernière page ? pour ne pas ajouter de page vide
        if (indexpage <= nbenfants-1) {
            doc.addPage();
        }
    }
    // Finalize PDF file
    doc.end();
    return id;
};

module.exports.generate = generate





