const express = require('express');
const router = express.Router();
const axios = require('axios');
var moment = require('moment');
const { getApiInseeToken } = require('../controllers/index.js')
moment().format();

const logger = require('../utils/logger')
const log = logger(module.filename)

router.get('/siret/:id', async function (req, res) {
  const now = moment(new Date()).format('YYYY-MM-DD')
  const idsiret = req.params.id
  log.i('::siret - Get - In', idsiret)

  try {
    // Request access token.
    const token = await getApiInseeToken()
    const reponse = await axios.get('https://api.insee.fr/entreprises/sirene/V3/siret/' + idsiret + '?date=' + now, { headers: { "Authorization": `Bearer ${token}` } });
    
    const siren = reponse.data.etablissement.siren
    const siret = reponse.data.etablissement.siret
    const codeInsee = reponse.data.etablissement.adresseEtablissement.codeCommuneEtablissement
    const type = reponse.data.etablissement.uniteLegale.activitePrincipaleUniteLegale
    const nom = reponse.data.etablissement.uniteLegale.denominationUniteLegale
    const numeroVoie = reponse.data.etablissement.adresseEtablissement.numeroVoieEtablissement
    const typeVoie = reponse.data.etablissement.adresseEtablissement.typeVoieEtablissement
    const libelleVoie = reponse.data.etablissement.adresseEtablissement.libelleVoieEtablissement
    const libelleCommune = reponse.data.etablissement.adresseEtablissement.libelleCommuneEtablissement
    const cp = reponse.data.etablissement.adresseEtablissement.codePostalEtablissement
    const complement = reponse.data.etablissement.adresseEtablissement.complementAdresseEtablissement
    const commune = reponse.data.etablissement.adresseEtablissement.codeCommuneEtablissement
    const numeroVoieFormate = numeroVoie && numeroVoie != 'null' ? numeroVoie + ' ' : ''
    const typeVoieFormate = typeVoie && typeVoie != 'null' ? typeVoie + ' ' : ''
    const libelleVoieFormate = libelleVoie && libelleVoie != 'null' ? libelleVoie + ' ' : ''
    const libelleCommuneFormate = libelleCommune && libelleCommune != 'null' ? libelleCommune : ''
    const cpFormate = cp && cp != 'null' ? cp + ' ' : ''
    const complementFormate = complement && complement != 'null' ? complement + ' ' : ''
    const adresse = numeroVoieFormate + typeVoieFormate + libelleVoieFormate + complementFormate + cpFormate + libelleCommuneFormate
    const adresseRue = numeroVoieFormate + typeVoieFormate + libelleVoieFormate + complementFormate
    const structure = {
      siren: siren,
      siret: siret,
      nom: nom,
      numeroVoie: numeroVoie,
      typeVoie: typeVoie,
      libelleVoie: libelleVoie,
      libelleCommune: libelleCommune,
      cp: cp,
      codeInsee: codeInsee,
      complement: complement,
      adresse: adresse,
      adresseRue: adresseRue,
      commune: commune,
      activite: type
    }
    log.i('::siret - Get - Done')
    return res.status(200).json({ structure: structure })
  }
  catch (error) {
    log.w('::siret - Get - Error', error)
    return res.status(404).json({ error })
  }
})

router.get('/siren/:id', async function (req, res) {
  const siren = req.params.id
  log.i('::siren - Get - In', siren)

  try {
    // Request access token.
    const token = await getApiInseeToken()
    const reponse = await axios.get('https://api.insee.fr/entreprises/sirene/V3/siret?q=(siren:' + siren + ' AND periode(etatAdministratifEtablissement:A))', { headers: { "Authorization": `Bearer ${token}` } });
    
    const etablissements = reponse.data.etablissements
    let etablissementsFormate = []
    etablissements.forEach(element => {
      const siren = element.siren
      const siret = element.siret
      const codeInsee = element.adresseEtablissement.codeCommuneEtablissement
      const nom = element.uniteLegale.denominationUniteLegale
      const type =element.uniteLegale.activitePrincipaleUniteLegale
      const numeroVoie = element.adresseEtablissement.numeroVoieEtablissement ? element.adresseEtablissement.numeroVoieEtablissement : ''
      const numeroVoieFormate =  numeroVoie && numeroVoie != '' ? numeroVoie + ' ' : ''
      const typeVoie = element.adresseEtablissement.typeVoieEtablissement ? element.adresseEtablissement.typeVoieEtablissement : ''
      const typeVoieFormate = typeVoie && typeVoie != '' ? typeVoie + ' ' : ''
      const libelleVoie = element.adresseEtablissement.libelleVoieEtablissement ? element.adresseEtablissement.libelleVoieEtablissement : ''
      const libelleVoieFormate = libelleVoie && libelleVoie != '' ? libelleVoie + ' ' : ''
      const libelleCommune = element.adresseEtablissement.libelleCommuneEtablissement ? element.adresseEtablissement.libelleCommuneEtablissement : ''
      const libelleCommuneFormate = libelleCommune && libelleCommune != '' ? libelleCommune : ''
      const cp = element.adresseEtablissement.codePostalEtablissement ? element.adresseEtablissement.codePostalEtablissement : ''
      const cpFormate = cp && cp != '' ? cp + ' ' : ''
      const complement = element.adresseEtablissement.complementAdresseEtablissement ? element.adresseEtablissement.complementAdresseEtablissement : ''
      const complementFormate = complement && complement != '' ? complement + ' ' : ''
      const adresse = numeroVoieFormate + typeVoieFormate + libelleVoieFormate + complementFormate + cpFormate + libelleCommuneFormate
      const adresseRue = numeroVoieFormate + typeVoieFormate + libelleVoieFormate + complementFormate
      const commune = element.adresseEtablissement.codeCommuneEtablissement
      const etablissement = {
        siren: siren,
        siret: siret,
        nom: nom,
        numeroVoie: numeroVoie,
        typeVoie: typeVoie,
        libelleVoie: libelleVoie,
        libelleCommune: libelleCommune,
        cp: cp,
        codeInsee: codeInsee,
        complement: complement,
        adresse: adresse,
        adresseRue: adresseRue,
        commune: commune,
        activite: type
      }
      etablissementsFormate.push(etablissement)
    });
    log.i('::siren - Get - Done')
    console.log(etablissementsFormate)
    return res.status(200).json({ etablissements: etablissementsFormate })
  }
  catch (error) {
    log.w('::siren - Get - Error', error)
    return res.status(404).json({ error })
  }
})

module.exports = router;

