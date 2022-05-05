<template>
  <b-container fluid class="admin">
    <b-row>
      <b-col cols="8">
        <Menu @displayDashboard="displayDashboard" />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12" class="custom-box">
        <b-collapse id="liste-temoignage" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <b-button v-if="!affichageTemoignage" class="np-input-text--button" @click="recupTemoignages" >Actualiser les données</b-button>
            <b-row>
              <b-col cols="12">
            <editable
              v-if="temoignagesToDisplay.length > 0"
              :columns="headers"
              :data="temoignagesToDisplay"
              :removable="false"
              :creable="false"
              :editable="false"
              :loading="loading"
              :defaultSortField="{ key: 'nom', order: 'asc' }">
              <template slot-scope="props" slot="actions">
                <b-btn v-if="!affichageTemoignage&&props.data.item.code!='XXX'" @click="afficherTemoignage(props.data.item.code)" size="sm" class="mr-1" variant="primary">
                  <i class="material-icons">visibility</i>
                </b-btn>
                <b-btn v-if="affichageTemoignage" @click="masquerTemoignage(props.data.item.code)" size="sm" class="mr-1" variant="primary">
                  <i class="material-icons">visibility_off</i>
                </b-btn>
                <b-btn v-if="props.data.item.code!='XXX'" @click="CreerDossier(props.data.item.id,props.data.item.code)" size="sm" class="mr-1" variant="primary">
                  <i class="material-icons">done</i>
                </b-btn>
                <b-btn v-if="props.data.item.code!='XXX'" @click="CloreTemoignage(props.data.item.id)" size="sm" class="mr-1" variant="primary">
                  <i class="material-icons">close</i>
                </b-btn>
              </template>
            </editable>
              </b-col>
            </b-row>
            <div v-show="affichageTemoignage">
              <b-row>
              <b-col cols="8">
                <Temoignage :temoignages="temoignagedechiffres" @reponse="recupMessage"/>
              </b-col>
              <b-col cols="4">
                <div class="suivi" v-if="temoignagedechiffres[0]">
                <Dossier :id="temoignagedechiffres[0].id" />
                </div>
              </b-col>
              </b-row>
            </div>
          </b-card-body>
        </b-collapse>
        <b-collapse id="suivi-dossier" accordion="my-accordion" role="tabpanel">
          <b-card-body><editable
              v-if="temoignages.length > 0"
              :columns="headers"
              :data="temoignages"
              :removable="false"
              :creable="false"
              :editable="false"
              :loading="loading"
              :defaultSortField="{ key: 'date', order: 'asc' }">
              <template slot-scope="props" slot="actions">
                <b-btn @click="afficherTemoignage(props.data.item.code)" size="sm" class="mr-1" variant="primary">
                  <i class="material-icons">edit</i>
                </b-btn>
              </template>
            </editable>
          </b-card-body>
        </b-collapse>
        <b-collapse id="tableaux-de-bord" accordion="my-accordion" role="tabpanel">
        </b-collapse>
        <b-collapse id="stat" accordion="my-accordion" role="tabpanel" v-if="!loading">
         
        </b-collapse>
        <b-collapse id="publication-document" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <file-upload />
          </b-card-body>
        </b-collapse>    
      </b-col>
    </b-row>

  </b-container>
</template>

<script>
import Editable from "~/components/editable/index.vue";
import Menu from "~/components/navigation/menu-admin.vue"
import fileUpload from "~/components/fileUpload.vue";
import Temoignage from '../../components/temoignage/adminAfficherMessages.vue';
import Dossier from '../../components/temoignage/adminAfficherDossier.vue';
import logger from '~/plugins/logger'

const log = logger('pages:admin')

export default {
  components: {
    Editable,
    fileUpload,
    Menu,
    Temoignage,
    Dossier
  },
  data() {
    return {
      loading: true,
      showDashboard: false,
      isModalVisible: false,
      isModalDossierVisible: false,
      headers: [
        { path: "date", title: "Date", type: "text", sortable: true },
        { path: "email", title: "Courriel", type: "text", sortable: true },
        { path: "code", title: "Code", type: "text", sortable: true },
        { path: "__slot:actions", title: "Actions", type: "__slot:actions", sortable: false }
      ],
      temoignages: [],
      temoignagesToDisplay:[],
      temoignagedechiffres: [],
      affichageTemoignage: false
    };
  },
 
  async mounted() {
    log.i('mounted - In')
    this.loading = true;
    await this.recupTemoignages()
    this.loading = false
    
  },
  methods: {
    showConfirmationDialog(user) {
      this.currentUserToDelete = user;
      return this.$modal.show('confirmDeleteUser');
    },
    CreerDossier: function(id,code) {
      this.isModalDossierVisible=true
      this.$modal.show("creerdossier");
      
    },
    recupTemoignages: function () {
      if (this.$store.state.privateKey && this.$store.state.privateKey.value != null )  {
      const url = process.env.API_URL + "/temoignage/adminaveccle/" ;
      return this.$axios
        .$post(url, {
          file: this.$store.state.privateKey.value
        })
        .then((response) => {
            log.d("getTemoignage - Done");
            let problemeCle = false
            if (response.temoignages) {
              this.temoignages=response.temoignages
              this.temoignagesToDisplay = []
              this.codeToDisplay = []
              // on elimine les codes déjà présents
              this.temoignages.forEach(element => {
                if (this.codeToDisplay.indexOf(element.codefront) == -1) {
                  this.codeToDisplay.push(element.codefront)
                  this.temoignagesToDisplay.push(element)
                }
                if (element.erreur) {
                  problemeCle = true
                }
              });
              if (problemeCle) {
                this.$toast.error("La clé personnelle chargée ne permet pas de décrypter les données")
              }
              this.loading = false

            }
        })
        .catch((error) => {
          log.w("getTemoignages - error", error);
            return this.$toast.error(
              "Une erreur est survenue lors de la récupération des temoignages"
            );
        });
      }
      else {
        const url = process.env.API_URL + "/temoignage/admin";
        return this.$axios
          .$get(url, {})
          .then((response) => {
            log.d("getTemoignage - Done");
            if (response.temoignages) {
              this.temoignages=response.temoignages
              this.temoignagesToDisplay = []
              this.codeToDisplay = []
              // on elimine les codes déjà présents
              this.temoignages.forEach(element => {
                if (this.codeToDisplay.indexOf(element.codefront) == -1) {
                  this.codeToDisplay.push(element.codefront)
                  this.temoignagesToDisplay.push(element)
                }
              })
              this.loading = false
              return this.$toast.error("Vous devez charger votre clé personnelle pour visualiser les témoignages")
            }
          })
          .catch((error) => {
            log.w("deposeMessage- error", error);
            return this.$toast.error(
              "Une erreur est survenue lors de la récupération des témoignages"
            );
          });
      }
    },
    afficherTemoignage: function(code) {
        log.i('afficherTemoignage - In')
        const url = process.env.API_URL + "/temoignage/details/" ;
        return this.$axios
          .$post(url, {"code":code})
          .then((response) => {
              log.d("getTemoignage - Done");
              if (response.temoignage) {
                this.temoignagedechiffres = response.temoignage;
                this.temoignagesToDisplay = this.temoignagesToDisplay.filter(c => c.code === code)
                this.affichageTemoignage = true
              }
          })
          .catch((error) => {
            log.w("getTemoignages - error", error);
              return this.$toast.error(
                "Une erreur est survenue lors de la récupération des temoignages"
              );
          });
    },
    masquerTemoignage: function(code) {
      this.affichageTemoignage = false
      this.recupTemoignages()
    },
    recupMessage: async function (code) {
      this.recupTemoignages()
      this.afficherTemoignage(code)
    },
    displayDashboard(bool) {
      return this.showDashboard = false
    },
    indicateursDemandesAaq(){
      const url = process.env.API_URL + "/demandeaaq/liste";
      return this.$axios.$get(url)
      .then(({suiviDemandes }) => {
          log.i('suiviDemandes -Done')
          return this.suiviDemandes = suiviDemandes;
      })
      .catch(error => {
          log.i('suiviDemandes -Error', error)
          return this.$toast.error("Une erreur est survenue lors de la récupération des indicateurs de demande")
      })
    }
  }
};
</script>
<style >
.suivi {
text-align: left;
padding: 10px;
//background: rgb(107, 100, 216);
position: fixed;

}

</style>
