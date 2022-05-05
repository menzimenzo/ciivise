<template>
  <b-container >
    <!--
    <b-row style="margin-top:1%">
      <b-col class="col-12 col-md-4">
        <b-img :src="require('assets/MainAisAqua.png')" width="365%"/>
      </b-col>
      <b-col class="col-8 col-md-4" >
        <b-row >
          <p class="aa-bouton-connexion"  @click="SeLoguer(1)">▷ Je suis maître nageur<sup>(1)</sup><br>Je m’identifie et renseigne mes données<br><br></p>
        </b-row>
        <b-row v-if="this.bt_structureactif">
          <p class="aa-bouton-connexion" @click="SeLoguer(2)">▷ J'appartiens à une structure actrice du dispositif AAQ<br><br></p>
        </b-row>
      </b-col>
    </b-row>
    -->

    <div class="row">
      <b-card class="mb-3">

        <h2  v-if="connexionType===1">Je me connecte à Aisance Aquatique</h2>
        <b-row class="text-center" v-if="this.fc">
          <b-col cols="12">
            <b-img class="fcBtn" @click="connexionutilisateur()"  fluid  :src="require('assets/FCboutons-10.png')" border="0" style="size: 100%;" />
            <br>
            <a
              href="https://franceconnect.gouv.fr/"
              target="_blank"
              style="text-align:center;" 
              >A propos de FranceConnect</a>
          </b-col>
        </b-row>
        <b-row class="text-center" v-if="this.fc">
          <b-col cols="12">
            <span class="otherConnexion">Ou</span>
          </b-col>
        </b-row>
        <b-row class="text-center">
          <b-col cols="12">
          <connectionForm @submit="login" :connexionType="this.connexionType"/>
          </b-col>
        </b-row>
      </b-card>            
    <div class="col-lg-5">
      <b-card class="mb-3">
        <h2>Bienvenue</h2>
        <h5>L’application Aisance Aquatique s’adresse aux maîtres-nageurs<sup>*</sup>, maîtres-nageurs Aisance Aquatique<sup>**</sup>, Instructeurs Aisance Aquatique<sup>***</sup>et professionnels de l'hébergement collectif touristique.</h5>
      </b-card>        
      <b-card class="mb-3">
        <h2>Inscription</h2>

        <br  v-if="this.fc">
        <b-row>
          <b-col cols="6">
          <h5>Vous n'avez pas encore de compte</h5>
            <b-button
              @click="inscription"
              variant="success"
              :disabled="errors.any()"
            >{{ 'Inscription'}}</b-button>
            <br>
            <br  v-if="this.fc">
          </b-col>
          <b-col cols="6" v-if="lienTutoVideo">
            <a v-bind:href="lienTutoVideo" onclick="window.open(this.href); return false;">Comment faire ? Cliquez ici pour accéder au tutoriel vidéo</a>
          </b-col>
        </b-row>
      </b-card>        
    </div>
  </div>
  <div class="definition" >
    <div class="col-lg-11">
        * Un maître-nageur est un éducateur sportif professionnel détenteur d'une carte professionnel. Il est qualifié pour encadrer contre rémunération l'apprentissage de la natation (exemple: BPJEPS AAn, DEJEPS Triathlon, Licence STAPS entraînement sportif "Natation").<br>
        ** Maître-Nageur AAQ : un Maître-Nageur AAQ (Aisance Aquatique) est un Maître-Nageur dont la formation à l’Aisance Aquatique a été validée sur cette application par un Instructeur AAQ (Aisance Aquatique). Il intervient comme encadrant de l’Aisance Aquatique.<br>
        *** Instructeur AAQ : un Instructeur AAQ (Aisance Aquatique) est le formateur des Maîtres-Nageurs AAQ. Il a suivi une formation lui permettant d’acquérir ce statut, accordé par une structure référente. 
    </div>
  </div>
  </b-container>
</template>

<script>
import logger from '~/plugins/logger'
const log = logger('pages:index')

export default {
  components: {
    connectionForm: () => import('~/components/connectionForm.vue')
    /*,
    inscriptionForm: () => import('~/components/inscriptionForm.vue'),
    bienvenueForm: () => import('~/components/bienvenueForm.vue')*/
  },
  data() {
    return {
      lienTutoVideo: null,
      connexionType: 1,
      fc: false,
      bt_structureactif: false,
    };
  },
  methods: {
    connexionutilisateur: function() {
      const url = process.env.API_URL + '/connexion/login'
      log.i('connexionutilisateur - In', { url })
      this.$axios.$get(url)
      .then(response => {
        log.i('connexionutilisateur - Done')
        window.location.replace(response.url)
      }).catch(err => {
        log.w('connexionutilisateur - error', { error })
      })
    },
    inscription: function(e) {
      log.i('inscription - In')
      return this.$router.push('/register')

      
      log.i('inscription - Done')
    },
    login: function(e) {
      log.i('login - In')
      return this.$store.dispatch('login', e)
        .then(() => {
            log.i('login - done - gestion de l\'utilisateur courant.')
            this.formErrors = []
            this.$modal.hide('connexionForm')
            // Route pour les Maîtres nagueurs MN
            if (this.$store.state.utilisateurCourant.profilId == 1) {
              return this.$router.push('/admin')
            }
            if (this.$store.state.utilisateurCourant.profilId == 2 ) {
              return this.$router.push('/partenaire')
            }
             if (this.$store.state.utilisateurCourant.profilId == 7 ) {
              return this.$router.push('/proprietaire')
            }
            if (this.$store.state.utilisateurCourant.profilId == 3) {
              return this.$router.push('/formateur')
            }
            if (this.$store.state.utilisateurCourant.profilId == 6) {
              return this.$router.push('/structureref')
            }
            if (this.$store.state.utilisateurCourant.profilId == 4) {
             
              const url = process.env.API_URL + '/parametres?code=AFFICHE_INTER'
              this.$axios.$get(url)
              .then(response => {
                if (response.par_valeur === "1") {
                  return this.$router.push('/interventions')
                } else {
                  return this.$router.push('/pageenconstruction')
                }
              }).catch(err => {
                log.w("parametre error AFFICHE_INTER", err);
              }) 
              
              
            } else
            {
              return this.$router.push('/accueil')
            }            
        })
        .catch((e) => {
            log.w('login - error', e.stack)
        })
        .finally(() => {
            this.loading = false
        })
    },
    // Fonction permettant d'afficher dynamiquement la partie Login
    // V1 : On ne permet pas de basculer d'un bouton à l'autre
    SeLoguer: function(e) {
        this.connexionType = e
    },
    chargeUrlTuto:function() {
        return "'" + this.lienTutoVideo + "'"
    },
    changeIt:function() {
        document.getElementById('test').innerHTML="<h2>Changed using innerHTML!!</h2>" 
      }
  },
  async mounted() {
    log.i("mounted home - In");
    this.$store.commit('CLEAN', { key: 'cle'})
    // Affiche ou pas le bouton france connect
    const url = process.env.API_URL + '/parametres?code=CONNEXION_FC'
      this.$axios.$get(url)
      .then(response => {
        if (response.par_valeur === "1") {
          log.d("mounted home - France Connect Actif", response)
          this.fc = true
        } else {
          log.d("mounted home - France Connect Inactif")
          this.fc = false
        }
        log.i("mounted home - done")
      }).catch(err => {
        log.w("mounted home - Error on mounted", err);
      })


      const urltuto = process.env.API_URL + '/parametres?code=TUTOINSCRIPTION'
      this.$axios.$get(urltuto)
      .then(response => {
        this.lienTutoVideo = response.par_valeur
      }).catch(err => {
        log.w("mounted home - Error on mounted", err);
      }) 

    // Affiche ou pas le bouton structure
    const urlstruc = process.env.API_URL + '/parametres?code=CONNEXION_STRUCTURE'
      this.$axios.$get(urlstruc)
      .then(response => {
        if (response.par_valeur === "1" ) {
          log.d("mounted home - bt_structureactif Actif", response)
          this.bt_structureactif = true
        } else {
          log.d("mounted home - bt_structureactif Inactif", response)
          this.bt_structureactif = false
        }
        log.i("mounted home - done")
      }).catch(err => {
        log.w("mounted home - Error on mounted", err);
      })
  }
};
</script>

<style>
.definition {
  color:gray;
  font-size: 15px
}
.renvoiBasDePage {
  text-align: center;
  color:gray
}
.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}
.links {
  padding-top: 15px;
}
.fcBtn{
  cursor: pointer;
  margin-bottom: 10px;
}
.aa-welcome-title {
  margin-top: 0vw;
  font-size: 3em;
  font:bold;
  font-family: Arial ;
  --text-transform: uppercase;
  color: rgb(0,0,128)
}
.aa-bouton-connexion {
  cursor: pointer;
  padding-left: 1vw;
  width: 50em;
  padding-right: 1vw;
  font-size: 100%;
  font-family: sans-serif ;
  text-align: left;
  background-color: #104F9F;
  color:white
}

.link-alignement {
  min-width: 80%;
  min-height: 56px;
}
.otherConnexion {
  font-size: 20px;
  color: #e5425a;
  margin: 00px 0;
}
.otherConnexion:before, .otherConnexion:after {
    display: inline-block;
    margin: 0 0 8px 0;
    height: 3px;
    content: " ";
    text-shadow: none;
    background-color: #e5425a;
    width: 200px;
}
.otherConnexion:before {
  margin-right: 20px;
}
.otherConnexion:after {
  margin-left: 20px;
}
@media screen and (min-width: 2000px) {
  .aa-welcome-title {
    margin-top: 100px;
  }
}

</style>

