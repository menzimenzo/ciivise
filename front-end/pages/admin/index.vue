<template>
  <b-container fluid class="admin">
        <b-card-body>
      <b-row class="menu">
        <b-col cols="1"  >
          <span class="libelle">Etat :</span>
        </b-col>
        <b-col cols="2" >
            <b-form-select
              id="etatInput"
              v-model="statut "
              name="etatInput"
              class="champ"
            >
              <option :value=null>Tous</option>
              <option
                v-for="statut in listStatut"
                :key="statut.id"
                :value="statut.id"
              >
                {{statut.libelle}}
              </option>
            </b-form-select>
        </b-col>
        <b-col cols="1"  >
          <span class="libelle">Numéro :</span>
        </b-col>
        <b-col cols="2" >
     
          <b-form-input
            id="numeroInput"
            v-model="numero"
            name="numero"
            placeholder="numéro de dossier"
          />
        </b-col>
        
      </b-row>
      <b-row>
        <br>
      </b-row>
      <b-row>
        <b-col cols="12">
              <editable
                :columns="headers"
                :data="filteredTemoignages"
                :removable="false"
                :creable="false"
                :editable="false"
                :defaultSortField="{ key: 'nom', order: 'asc' }"
              >
                <template slot-scope="props" slot="actions">
                  <b-btn
                    v-if="!affichageTemoignage && props.data.item.code != 'XXX'"
                    @click="afficherTemoignage(props.data.item.code)"
                    size="sm"
                    class="mr-1"
                    variant="primary"
                  >
                    <i class="material-icons">visibility</i>
                  </b-btn>
                  <b-btn
                    v-if="affichageTemoignage"
                    @click="masquerTemoignage(props.data.item.code)"
                    size="sm"
                    class="mr-1"
                    variant="primary"
                  >
                    <i class="material-icons">visibility_off</i>
                  </b-btn>
                  <b-btn
                    v-if="props.data.item.code != 'XXX'"
                    @click="
                      CreerDossier(props.data.item.id, props.data.item.code)
                    "
                    size="sm"
                    class="mr-1"
                    variant="primary"
                  >
                    <i class="material-icons">done</i>
                  </b-btn>
                  <b-btn
                    v-if="props.data.item.code != 'XXX'"
                    @click="CloreTemoignage(props.data.item.id)"
                    size="sm"
                    class="mr-1"
                    variant="primary"
                  >
                    <i class="material-icons">close</i>
                  </b-btn>
                </template>
              </editable>
        </b-col>
      </b-row>
          <div v-show="affichageTemoignage">
            <b-row>
              <b-col cols="8">
                <Temoignage
                  :temoignages="temoignagedechiffres"
                  @reponse="recupMessage"
                  @dossier="masquerTemoignage"
                />
              </b-col>
              <b-col cols="4">
                <div class="suivi" v-show="temoignagedechiffres">
                  <Dossier :temoignage="temoignagedechiffres"  @dossier="masquerTemoignage" />
                </div>
              </b-col>
            </b-row>
          </div>
    </b-card-body>
  </b-container>
</template>

<script>
import Editable from "~/components/editable/index.vue";
import Temoignage from "../../components/temoignage/adminAfficherMessages.vue";
import Dossier from "../../components/temoignage/adminAfficherDossier.vue";
import logger from "~/plugins/logger";

const log = logger("pages:admin");

export default {
  components: {
    Editable,
    Temoignage,
    Dossier,
  },
  data() {
    return {
      headers: [
        { path: "date", title: "Date", type: "text", sortable: true },
        {
          path: "id",
          title: "Numéro de dossier",
          type: "text",
          sortable: true,
        },
        {
          path: "statut_libelle",
          title: "Etat du dossier",
          type: "text",
          sortable: true,
        },
        {
          path: "__slot:actions",
          title: "Actions",
          type: "__slot:actions",
          sortable: false,
        },
      ],
      temoignages: [],
      temoignagesToDisplay: [],
      temoignagedechiffres: [],
      affichageTemoignage: false,
      listStatut: [],
      statut: 0,
      numero: null,
    };
  },
  async mounted() {
    log.i("mounted - In");
    await this.recupStatuts();
    await this.recupTemoignages();
    log.d("mounted - Done");
  },
  computed: {
    filteredTemoignages: function() {
      //log.i('filteredTemoignages - In')
      if (this.statut || this.numero) {
      return this.temoignagesToDisplay.filter(tem => {
        var isMatch = true;
        if (this.statut ) {
          isMatch = isMatch &&  tem.statut_libelle == this.statut
        }
        if (this.numero ) {
          isMatch = isMatch &&  tem.id.toString().indexOf(this.numero) > -1
       }
        log.d('filteredTemoignages - Done', { isMatch })
        return isMatch;
      })
      }
      else {
        return this.temoignagesToDisplay
      }

    }
  },
  methods: {
    recupStatuts: function () {
      log.i("recupStatuts - In");
      const url = process.env.API_URL + "/statut/";
      return this.$axios
        .$get(url, {})
        .then((response) => {
          this.listStatut = response.statuts;
          log.d("recupStatuts - Done");
        })
        .catch((error) => {
          log.w("recupStatuts - error", error);
          return this.$toast.error(
            "Une erreur est survenue lors de la récupération des statuts de dossier"
          );
        });
    },
    recupTemoignages: function () {
      log.i("recupTemoignages - In");
      if (
        this.$store.state.privateKey &&
        this.$store.state.privateKey.value != null
      ) {
        const url = process.env.API_URL + "/temoignage/kadmin/";
        return this.$axios
          .$post(url, {
            file: this.$store.state.privateKey.value,
          })
          .then((response) => {
            let problemeCle = false;
            if (response.temoignages) {
              this.temoignages = response.temoignages;
              this.temoignagesToDisplay = [];
              this.codeToDisplay = [];
              // on elimine les codes déjà présents
              this.temoignages.forEach((element) => {
                if (this.codeToDisplay.indexOf(element.codefront) == -1) {
                  this.codeToDisplay.push(element.codefront);
                  this.temoignagesToDisplay.push(element);
                }
                if (element.erreur) {
                  problemeCle = true;
                }
              });
              if (problemeCle) {
                this.$toast.error(
                  "La clé personnelle chargée ne permet pas de décrypter les données"
                );
              }
              console.log(this.temoignagesToDisplay);
              log.d("recupTemoignages - Done");
            }
          })
          .catch((error) => {
            log.w("recupTemoignages - error", error);
            return this.$toast.error(
              "Une erreur est survenue lors de la récupération des temoignages"
            );
          });
      } else {
        const url = process.env.API_URL + "/temoignage/admin";
        return this.$axios
          .$get(url, {})
          .then((response) => {
            log.d("recupTemoignages - Done");
            if (response.temoignages) {
              this.temoignages = response.temoignages;
              this.temoignagesToDisplay = [];
              this.codeToDisplay = [];
              // on elimine les codes déjà présents
              this.temoignages.forEach((element) => {
                if (this.codeToDisplay.indexOf(element.codefront) == -1) {
                  this.codeToDisplay.push(element.codefront);
                  this.temoignagesToDisplay.push(element);
                }
              });
              return this.$toast.error(
                "Vous devez charger votre clé personnelle pour visualiser les témoignages"
              );
            }
          })
          .catch((error) => {
            log.w("recupTemoignages - error", error);
            return this.$toast.error(
              "Une erreur est survenue lors de la récupération des messages"
            );
          });
      }
    },
    afficherTemoignage: function (code) {
      log.i("afficherTemoignage - In");
      const url = process.env.API_URL + "/temoignage/details/";
      return this.$axios
        .$post(url, { code: code })
        .then((response) => {
          if (response.temoignage) {
            console.log("Dedans");
            this.temoignagedechiffres = response.temoignage;
            this.temoignagesToDisplay = this.temoignagesToDisplay.filter(
              (c) => c.code === code
            );
            this.affichageTemoignage = true;
          }
          log.d("afficherTemoignage - Done");
        })
        .catch((error) => {
          log.w("afficherTemoignage - error", error);
          return this.$toast.error(
            "Une erreur est survenue lors de la récupération des temoignages"
          );
        });
    },
    masquerTemoignage: function (code) {
      console.log('dedans')
      this.affichageTemoignage = false;
      this.recupTemoignages();
    },
    recupMessage: async function (code) {
      this.recupTemoignages();
      this.afficherTemoignage(code);
    },
    displayDashboard(bool) {
      return (this.showDashboard = false);
    },
  },
};
</script>
<style >
.suivi {
  text-align: left;
  padding: 10px;
}
.libelle {
  text-align: right;
  padding: 4px;
}
.champ {
  text-align: left;
  padding: 4px;
}
.menu {
  padding-top: 6px;
  padding-bottom: 6px;
  background-color: #a5a5a5;
}
</style>
