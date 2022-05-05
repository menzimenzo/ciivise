/**
 * Format the url use in the redirection call
 * to the France Connect Authorization and logout API endpoint.
 * @see @link{ https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service# }
 */

var config = require('../config')

module.exports = {

  // TODO hard code state et nonce because they normally generate from every request
  getAuthorizationUrl: () => `${config.franceConnect.FC_URL}${config.franceConnect.AUTHORIZATION_FC_PATH}?`
    + `response_type=code&client_id=${config.franceConnect.CLIENT_ID}&redirect_uri=${config.franceConnect.FS_URL}`
    + `${config.franceConnect.CALLBACK_FS_PATH}&scope=${config.franceConnect.SCOPES}&acr_values=eidas1&state=customState11&nonce=customNonce11`
  /**
   * Format the url 's that is used in a redirect call to France Connect logout API endpoint
   * @returns {string}
   */, 
  getLogoutUrl : req => `${config.franceConnect.FC_URL}${config.franceConnect.LOGOUT_FC_PATH}?id_token_hint=`
    + `${req.session.idToken}&state=customState11&post_logout_redirect_uri=${config.franceConnect.FS_URL}`
    + `${config.franceConnect.LOGOUT_FS_PATH}`,
  formatUtilisateur : (utilisateur, toClient = true) => {
    if(toClient){
      return {
            id: utilisateur.uti_id,
            authId: utilisateur.uti_authid,
            profilId: utilisateur.rol_id,
            statutId: utilisateur.stu_id,
            mail: utilisateur.uti_mail,
            nom: utilisateur.uti_nom,
            prenom: utilisateur.uti_prenom,
            tokenFc: utilisateur.uti_tockenfranceconnect,
            validated: utilisateur.uti_validated,
            eaps: utilisateur.uti_eaps,
            publicontact: utilisateur.uti_publicontact,
            mailcontact: utilisateur.uti_mailcontact,            
            sitewebcontact: utilisateur.uti_sitewebcontact,
            adrcontact: utilisateur.uti_adrcontact,
            compadrcontact: utilisateur.uti_compadrcontact,
            cpi_codeinsee: utilisateur.uti_com_codeinseecontact,
            cp: utilisateur.uti_com_cp_contact,
            telephonecontact: utilisateur.uti_telephonecontact,
            structureId: utilisateur.str_id,
            structurerefid: utilisateur.sre_id,
            datedemande: utilisateur.datedemande, 
            datedebutformation: utilisateur.datedebutformation,
            datefinformation: utilisateur.datefinformation,
            lieuformation: utilisateur.lieuformation,
            donneleconsparticulieres: utilisateur.uti_donneleconsparticulieres,
      }
    } else {
      return {
        uti_id: utilisateur.id,
        uti_authid: utilisateur.uti_authid,
        rol_id: utilisateur.profilId,
        stu_id: utilisateur.statutId,
        uti_mail: utilisateur.mail && utilisateur.mail.toLowerCase(),
        uti_nom: utilisateur.nom,
        uti_prenom: utilisateur.prenom,
        uti_structurelocale: utilisateur.structureLocale,
        uti_tockenfranceconnect: utilisateur.tokenFc,
        uti_validated: utilisateur.validated,
        uti_eaps: utilisateur.eaps,
        uti_publicontact: utilisateur.publicontact,
        uti_mailcontact: utilisateur.mailcontact,
        uti_sitewebcontact: utilisateur.sitewebcontact,
        uti_adrcontact: utilisateur.adrcontact,
        uti_compadrcontact: utilisateur.compadrcontact,
        uti_com_cp_contact: utilisateur.cp,
        uti_com_codeinseecontact: utilisateur.cpi_codeinsee,
        uti_telephonecontact: utilisateur.telephonecontact,
        str_id: utilisateur.structureId,
        sre_id: utilisateur.structurerefid,
        uti_donneleconsparticulieres: utilisateur.donneleconsparticulieres
      }
    }
  },
  formatEmail: mail => mail && mail.trim().toLowerCase(),
  formatIntervention : intervention => {
    return {
      id: intervention.int_id,
      nbEnfants: intervention.int_nombreenfant,
      piscine: {
        id: intervention.pis_id,
        nom: intervention.pis_nom,      
        x: intervention.pis_x,
        y: intervention.pis_y,
        adresse: intervention.pis_adr,
        cp: intervention.com_libelle,
        codepostal: intervention.cpi_codepostal,
      },
      structure: {
        id: intervention.str_id,
        code: intervention.str_code,
        nom: intervention.str_libelle,
        adresse: intervention.str_adresse,
        commune: intervention.str_commune,
        type: intervention.str_type,
        soustype: intervention.str_soustype,
        actif: intervention.str_actif,
      },
      cai: intervention.int_cai,
      classe:intervention.int_age,
      nbSession:intervention.int_nbsession,
      isSubventionnee: intervention.int_isSubventionnee,
      dateDebutIntervention: new Date(intervention.int_datedebutintervention),
      dateFinIntervention: new Date(intervention.int_datefinintervention),
      dateCreation: new Date(intervention.int_datecreation),
      dateMaj: intervention.int_datemaj
    }
  },
  logTrace : (batch, codeerreur, startTime) => {
    var execTime = new Date() - startTime;
    var fichierSupervision = config.PATH_SUPERVISION_BATCH;
    var checkLog;
    if (codeerreur == 0) {
      checkLog = '';
    }
    else {
      checkLog = 'Check log Backend AAQ';
    }
    
    var contenu = formatDate() + '|' + codeerreur + '|' + checkLog + '|ExecTime=' + execTime;

    fs.writeFile(fichierSupervision + '/batch.' + batch + '.txt', contenu, function (err) {
      if (err) throw err;
    });
  },
  formatDate: () => { // Renvoi la date et heure actuelle formatée AAAAMMJJHHMM
    const now = new Date();
    let jour = now.getDate().toString().padStart(2, "0");
    let mois = now.getMonth().toString().padStart(2, "0");
    let annee = now.getFullYear();
    let heure = now.getHours().toString().padStart(2, "0");
    let minute = now.getMinutes().toString().padStart(2, "0");
    let dateTimeFormate = annee + mois + jour + heure + minute;
    return dateTimeFormate;
  },
  formatDemandeAAQ: (demandeaaq, toClient = true) => {
    if(toClient) {
      return {
          id: demandeaaq.dem_id,
          formateurid: demandeaaq.dem_uti_formateur_id,
          demandeurid: demandeaaq.dem_uti_demandeur_id,
          tockendemandeaccord: demandeaaq.dem_tockendemandeaccord,
          tockendemanderefus: demandeaaq.dem_tockendemanderefus,
          datedemande: demandeaaq.dem_datedemande,
          daterelance: demandeaaq.dem_daterelance,
          nbrelance: demandeaaq.dem_nbrelance,
          dateaccord: demandeaaq.dem_dateaccord,
          daterefus: demandeaaq.dem_daterefus,
          motifrefus: demandeaaq.dem_motifrefus,
          dmsid: demandeaaq.dem_dms_id,
          datedebutformation : demandeaaq.dem_datedebutformation,
          datefinformation : demandeaaq.dem_datefinformation,
          inseeformation: demandeaaq.dem_inseeformation
      }
    } else {
      return {
          dem_id: demandeaaq.id,
          dem_uti_formateur_id : demandeaaq.formateurid,
          dem_uti_demandeur_id : demandeaaq.demandeurid,
          dem_tockendemandeaccord : demandeaaq.tockendemandeaccord,
          dem_tockendemanderefus : demandeaaq.tockendemanderefus,
          dem_datedemande : demandeaaq.datedemande,
          dem_daterelance : demandeaaq.daterelance,
          dem_nbrelance : demandeaaq.nbrelance,
          dem_dateaccord : demandeaaq.dateaccord,
          dem_daterefus : demandeaaq.daterefus,
          dem_motifrefus : demandeaaq.motifrefus,
          dem_dms_id : demandeaaq.dmsid,
          dem_datedebutformation: demandeaaq.datedebutformation,
          dem_datefinformation: demandeaaq.datefinformation,
          dem_inseeformation: demandeaaq.inseeformation
      }
    }
  },
  formatUser: user => {
    return {
        id: user.uti_id,
        role: user.rol_id,
        statut: user.stu_id,
        validated: user.uti_validated,
        mail: user.uti_mail,
        nom: user.uti_nom,
        prenom: user.uti_prenom,
        eaps: user.uti_eaps,
        rolLibelle:user.rol_libelle,
        inscription: user.inscription,
        publicontact: user.uti_publicontact,
        mailcontact: user.uti_mailcontact,            
        sitewebcontact: user.uti_sitewebcontact,
        adrcontact: user.uti_adrcontact,
        compadrcontact: user.uti_compadrcontact,
        cpi_codeinsee: user.uti_com_codeinseecontact,
        cp: user.uti_com_cp_contact,
        telephonecontact: user.uti_telephonecontact,
        datedemandeaaq: user.datedemandeaaq,
        dateaccordaaq: user.dateaccordaaq,
        daterefusaaq: user.daterefusaaq,
        statutdemande: user.statutdemande,
        motifrefus: user.motifrefus,        
        instructeur: user.instructeur,
        validationmail: user.validationmail,
        structurerefid: user.structurerefid,
        formateurid: user.formateurid,
        sre_libelle: user.sre_libelle,
        donneleconsparticulieres: user.uti_donneleconsparticulieres,
        datedebutformation: user.datedebutformation,
        lieuformation: user.lieuformation,
        datefinformation: user.datefinformation

    }
  },
  formatUserCSV: user => {
    return {
        id: user.uti_id,
        role: user.rol_id,
        statut: user.stu_id,
        validated: user.uti_validated,
        mail: user.uti_mail,
        nom: user.uti_nom,
        prenom: user.uti_prenom,
        rolLibelle:user.rol_libelle,
        inscription: user.inscription,
        publicontact: user.uti_publicontact,
        mailcontact: user.uti_mailcontact,            
        sitewebcontact: user.uti_sitewebcontact,
        adrcontact: user.uti_adrcontact,
        compadrcontact: user.uti_compadrcontact,
        cpi_codeinsee: user.uti_com_codeinseecontact,
        cp: user.uti_com_cp_contact,
        telephonecontact: user.uti_telephonecontact,
        donneleconsparticulieres: user.uti_donneleconsparticulieres
    }
  }
}
