/**
 * Helper to get an access token from France Connect.
 * @see @link{ https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service# }
 */
const axios =  require('axios')
const querystring =  require('querystring')
const config =  require( '../config')
const pgPool = require('../pgpool').getPool();
const {formatUtilisateur} = require('../utils/utils')

/**
 * Init FranceConnect authentication login process.
 * Make every http call to the different API endpoints.
 */
module.exports = async (req, res, next) => {
  // check if the mandatory Authorization code is there.
  if (!req.query.code) {
    return res.sendStatus(400);
  }

  // Set request params.
  const body = {
    grant_type: 'authorization_code',
    redirect_uri: `${config.franceConnect.FS_URL}${config.franceConnect.CALLBACK_FS_PATH}`,
    client_id: config.franceConnect.CLIENT_ID,
    client_secret: config.franceConnect.CLIENT_SECRET,
    code: req.query.code,
  };

  try {
    // Request access token.
    const { data: { access_token: accessToken, id_token: idToken } } = await axios({
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: querystring.stringify(body),
      url: `${config.franceConnect.FC_URL}${config.franceConnect.TOKEN_FC_PATH}`,
    }).catch(error => {
      console.log(error)
      throw(error)
    });

    // Make a call to the France Connect API endpoint to get user data.
    if (!accessToken) {
      return res.sendStatus(401);
    }

    req.accessToken = accessToken;
    req.session.accessToken = accessToken;
    req.session.idToken = idToken;

    const { data: userInfo } = await axios({
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
      url: `${config.franceConnect.FC_URL}${config.franceConnect.USERINFO_FC_PATH}`,
    });

    if(!userInfo.email){userInfo.email = ''}

    let utilisateur, url,nom

    // ##############LSC###################
    //await pgPool.query('SELECT * from utilisateur where uti_tockenfranceconnect = $1', [$1 = userInfo.sub],
    await pgPool.query('SELECT * , usr.sre_id FROM utilisateur uti left join uti_sre usr on usr.uti_id = uti.uti_id and usr.uts_actif = true  where uti.uti_tockenfranceconnect = $1', [$1 = userInfo.sub],
     
      async (err, result) => {
          if(err){
            console.log(err)
            throw(err)
          }
          //console.log('Nom d\'usage :' + userInfo.preferred_username);
          //console.log('Nom de naissance :' + userInfo.family_name);

          // recuperation du nom d'usage plutot que du nom de naissance
          if (userInfo.preferred_username != undefined && userInfo.preferred_username != '') { 
            console.log('utilisation préférentielle du nom d\'usage plutot que de naissance')
            nom = userInfo.preferred_username
          }
          else
          {
            //console.log('utilisation préférentielle du nom de naissance')
            nom = userInfo.family_name
          }

          // If user was never created we insert it in our database
          if (result.rows.length === 0) {
            console.log("L'utilisateur n'existe pas");
            url = "/connexion/inscription"
            
           
            const { rows } = await pgPool.query(
              'INSERT INTO utilisateur(rol_id,stu_id, uti_mail, uti_nom, uti_prenom,\
                uti_tockenfranceconnect) VALUES($1, $2, lower($3), $4, upper($5), $6) RETURNING *'
              , [ 5, 1, userInfo.email, nom, userInfo.given_name, userInfo.sub]
            ).catch(err => {
              console.log(err)
              throw err
            })
            utilisateur = rows[0]

          // User is logging in
          } else {
            
            utilisateur = result.rows[0]
            // Mantis 68472 - sauvegarde systématique du nom
            const { rows } = await pgPool.query(
              'UPDATE utilisateur SET uti_nom = $1 where uti_id = $2 RETURNING *'
              , [nom,utilisateur.uti_id]
            ).catch(err => {
              console.log('erreur lors de la sauvegarde du nom:'+err)
              throw err
            })
            utilisateur.uti_nom = nom
            // -- fin 68472

            // Vérification de la validité de la carte professionnelle
            console.log('Numéro EAPS :' + utilisateur.uti_eaps)
            await pgPool.query('SELECT eap_numero  \
                                FROM ref_eaps \
                                WHERE eap_numero= $1', [$1 = utilisateur.uti_eaps],
               async (erreaps, resulteaps) => {
                  if(erreaps){
                    console.log(erreaps)
                    throw(erreaps)
                  }
                  if (resulteaps.rows.length === 0) {
                    const { rows } = await pgPool.query(
                      'UPDATE utilisateur SET uti_validated = false where uti_id = $1 RETURNING *'
                      , [utilisateur.uti_id]
                    ).catch(err => {
                      console.log('erreur lors de l\'invalidation du compte:'+err)
                      throw err
                    })
                    // L'utilisateur n'est pas autorisé à se connecter sans avoir mis à jour sa carte professionnelle
                    utilisateur.uti_validated = false    
                  }
                  




              })

          // Account was never validated so is considered as new user
          if(!utilisateur.uti_validated){
            url = "/connexion/inscription"
          // User access the app
          } else {
            if(utilisateur.rol_id == 1){
              url = "/admin"
            } else if(utilisateur.rol_id == 2) {
              // Structure
              url = "/partenaire"
            } else if(utilisateur.rol_id == 3) {
              // FormateurAAQ
              url = "/formateur"
            } else if(utilisateur.rol_id == 4) {
              // MaitreNageurAAQ
              const url = process.env.API_URL + '/parametres?code=AFFICHE_INTER'
              this.$axios.$get(url)
              .then(response => {
                if (response.par_valeur === "1") {
                  url = "/interventions"
                } else {
                  url = "/pageenconstruction"
                }
              }).catch(err => {
                log.w("mounted home - Error on mounted", err);
              })              
              //url = "/interventions"
              //url = "/interventions"
              //url = "/pageenconstruction"
            } else if (utilisateur.rol_id == 6) {
              // Structure de référence 
              url = "/structureref"
            } else {
              // MaitreNageur
              console.log("Route accueil oauthallBack")
              console.log(utilisateur.rol_id)
              //log.d('Route accueil oauthallBack')
              url = "/accueil"
            }
          }        
        }

        //console.log(err.message)
          req.session.user = utilisateur
          return res.send({user: formatUtilisateur(utilisateur), url});
      })
  } catch (error) {
    console.log(error)
    return next(error);
  }
};
