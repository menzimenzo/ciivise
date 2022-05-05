<template>
  <b-container fluid class="interventions">
    <b-row>
      <b-col cols="3">
        <Menu @displayDashboard="displayDashboard" @resetForm="resetIntervention" />
      </b-col>
      <b-col cols="9" class="custom-box">
        <b-collapse id="mesInterventions" accordion="my-accordion" role="tabpanel">
            <div v-if="interventions.length > 0">
              <b-btn
                @click="exportCsv()"
                class="mb-2"
                variant="primary">
                <i class="material-icons" style="font-size: 18px; top: 4px">import_export</i>
                Export CSV
              </b-btn>
              <editable
                :columns="headersInterventions"
                :data="this.interventionsToDisplay"
                :removable="false"
                :creable="false"
                :editable="false"
                :noDataLabel="''"
                tableMaxHeight="none"
                :loading="loadingInt"
                :defaultSortField="{
                  key: 'dateFinIntervention',
                  order: 'desc',
                }" >
                <template slot-scope="props" slot="actions">
                  <div style="min-width: 147px">
                    <b-btn
                    v-if="dateDiff(props.data.item.dateFinIntervention) < nbjoursapres"
                      @click="editIntervention(props.data.item.id)"
                      size="sm"
                      class="ml-1"
                      variant="primary"
                      v-b-modal.modal-intervention
                      v-b-popover.hover="`Modifier l'intervention`"
                    >
                      <i class="material-icons">edit</i>
                    </b-btn>
                    <b-btn
                    v-else
                      @click="editIntervention(props.data.item.id)"
                      size="sm"
                      class="ml-1"
                      variant="primary"
                      v-b-modal.modal-intervention
                      v-b-popover.hover="`Consulter l'intervention`"
                    >
                      <i class="material-icons">visibility</i>
                    </b-btn>
                    <b-btn
                      @click="downloadPdf(props.data.item.id)"
                      size="sm"
                      class="ml-1"
                      variant="primary"
                      v-b-popover.hover="`Télécharger les attestations`"
                    >
                      <i class="material-icons">cloud_download</i>
                    </b-btn>
                    <b-btn
                      @click="deleteIntervention(props.data.item.id)"
                      size="sm"
                      class="ml-1"
                      variant="danger"
                      v-b-popover.hover="`Supprimer l'intervention`"
                    >
                      <i class="material-icons">delete_forever</i>
                    </b-btn>
                  </div>
                </template>
              </editable>
            </div>
            <h4 class="text-center" v-if="interventions.length == 0 && loadingInt === false">
              Aucune intervention n'a été créée pour le moment.
            </h4>
        </b-collapse>
        <b-collapse id="addIntervention" accordion="my-accordion" role="tabpanel" v-if="this.loadStore===true">
          <Intervention :intervention="interventionCourrante" :nbjoursavant="nbjoursavant" :nbjoursapres="nbjoursapres" />
        </b-collapse>
        <b-collapse id="piscines" accordion="my-accordion" role="tabpanel">
          <b-container>
            <editable
              :columns="headersPiscine"
              :data="mesPiscines"
              :removable="false"
              :creable="false"
              :editable="false"
              :noDataLabel="''"
              tableMaxHeight="none"
            >
              <template slot-scope="props" slot="actions">
                <div style="min-width: 147px">
                  <b-btn
                    @click="deletePiscine(props.data.item)"
                    size="sm"
                    class="ml-1"
                    variant="danger"
                    v-b-popover.hover="`Supprimer l'intervention`"
                  >
                    <i class="material-icons">delete_forever</i>
                  </b-btn>
                </div>
              </template>
            </editable>
            <b-btn
              @click="editPiscine(null)"
              class="btn btn-primary btn-lg btn-block"
            >
              <i class="material-icons">add</i>
            </b-btn>
          </b-container>
        </b-collapse>
        <b-collapse id="structures" accordion="my-accordion" role="tabpanel">
          <b-container>
            <editable
              :columns="headersStructures"
              :data=structures
              :removable="false"
              :creable="false"
              :editable="false"
              :noDataLabel="''"
              tableMaxHeight="none">
              <template slot-scope="props" slot="actions">
                <div style="min-width: 147px">
                  <b-btn
                    @click="deleteStructure(props.data.item)"
                    size="sm"
                    class="ml-1"
                    variant="danger"
                    v-b-popover.hover="`Supprimer la structure de vos structures favorites`"
                  >
                    <i class="material-icons">delete_forever</i>
                  </b-btn>
                </div>
              </template>
            </editable>
            <b-btn
              @click="editStructure()"
              class="btn btn-primary btn-lg btn-block"
            >
              <i class="material-icons">add</i>
            </b-btn>
          </b-container>
        </b-collapse>
        <b-collapse id="documents" accordion="my-accordion" role="tabpanel">
          <b-container>
            <b-row>
              <b-col cols="12">
                <h5 class="mb-3">Documents disponibles:</h5>
                <ul v-if="documents.length > 0">
                  <li v-for="doc in documents" :key="doc.doc_id">
                    {{ doc.doc_libelle }}
                    <b-img
                      class="img-icon"
                      fluid
                      @click="downloadDoc(doc)"
                      :src="require('assets/pdf-240x240.png')"
                      blank-color="rgba(0,0,0,0.5)"
                    />
                  </li>
                </ul>
                <p v-else>
                  Aucun document n'est disponible actuellement.
                </p>
              </b-col>
            </b-row>
          </b-container>
        </b-collapse>
        <Dashboard v-if="showDashboard"/>
      </b-col>
    </b-row>
    <b-modal id="modal-intervention" name="modal-intervention" scrollabe size="xl" @closed="resetIntervention()" >
      <Intervention :nbjoursavant="nbjoursavant" :nbjoursapres="nbjoursapres" :intervention="interventionCourrante"/>
    </b-modal>
    <modal name="newPiscine" height="auto" width="900px" scrollabe>
      <Piscine :dansInt="false"/>
    </modal>
    <modal name="newStructure" height="auto" width="800px" scrollabe>
       <Structure :dansInt="false"/>
    </modal>
  </b-container>
</template>

<script>
import Intervention from "~/components/Intervention.vue";
import Piscine from "~/components/element/piscine.vue";
import Structure from "~/components/element/structure.vue";
import Editable from "~/components/editable/index.vue";
import Menu from "~/components/navigation/menu-interventions.vue"
import Dashboard from "~/components/dashboard/mn.vue"

import { mapState } from "vuex";
import logger from '~/plugins/logger'
const log = logger('pages:interventions')

export default {
  components: {
    Intervention,
    Editable,
    Piscine,
    Structure,
    Menu,
    Dashboard
  },
  data() {
    return {
      loadingInt: false,
      loadStore: false,
      interventionsToDisplay: null,
      showDashboard: true,
      nbjoursavant : 5,
      nbjoursapres : 5,
      headersInterventions: [
        {
          path: "id",
          title: "N° d'intervention",
          type: "text",
          sortable: true,
        },
        {
          path: "structure.nom",
          title: "Structure",
          type: "text",
          sortable: true,
        },
        {
          path: "piscine.nom",
          title: "Piscine",
          type: "text",
          sortable: true,
        },
        {
          path: "dateFinIntervention",
          title: "Date",
          type: "date",
          sortable: true,
          filter: "date",
        },
        {
          path: "nbEnfants",
          title: "Nombre d'enfants",
          type: "text",
          sortable: true,
        },
        {
          path: "dateMaj",
          title: "Modification",
          type: "date",
          sortable: true,
          filter: "timestamp",
        },
        {
          path: "__slot:actions",
          title: "Actions",
          type: "__slot:actions",
          sortable: false,
        },
      ],
      headersPiscine: [
        {
          path: "nom",
          title: "Nom",
          type: "text",
          sortable: true,
        },
        {
          path: "adresse",
          title: "Adresse",
          type: "text",
          sortable: true,
        },
        {
          path: "cp",
          title: "Commune",
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
      headersStructures: [
        {
          path: "nom",
          title: "Nom",
          type: "text",
          sortable: true,
        },
        {
          path: "adresse",
          title: "Adresse",
          type: "text",
          sortable: true,
        },
        {
          path: "code",
          title: "Code",
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
    };
  },
  watch: {
    interventions: function () {
      this.loadingInt = true;
      if (this.utilisateurCourant.profilId == 2) {
        this.interventionsToDisplay = this.interventions.filter((x) => {
          var isMatch = true;
          isMatch =
            isMatch &&
            (String(x.structureId) == this.utilisateurCourant.structureId ||
              String(x.utiId) == this.utilisateurCourant.id);
          return isMatch;
        });
      } else {
        this.interventionsToDisplay = this.interventions;
      }
      this.loadingInt = false;
    },

  },
  computed: mapState([
    "interventions",
    "mesPiscines",
    "interventionCourrante",
    "utilisateurCourant",
    "documents",
    "structures"
  ]),
  async mounted() {
    await this.$store.dispatch("get_mesPiscines"),
    await this.$store.dispatch("get_interventions")
    await this.$store.dispatch("get_structureByUser", this.$store.state.utilisateurCourant.id)
    await this.$store.commit("CLEAN", { key: 'enfants', isArray: true });
    let url = process.env.API_URL + '/parametres?code=NBJOURAPRES'
    await this.$axios.$get(url)
    .then(response => {
        this.nbjoursapres = Number(response.par_valeur)
    }).catch(err => {
      log.w("mounted home - Error on mounted", err);
    })
    url = process.env.API_URL + '/parametres?code=NBJOURAVANT'
    await this.$axios.$get(url)
    .then(response => {
        this.nbjoursavant = Number(response.par_valeur)
      log.i("mounted intervention - done")
    }).catch(err => {
      log.w("mounted home - Error on mounted", err);
    })
    this.loadStore = true
  },
  methods: {
    dateDiff: function (maDate) {
      const maDateFormatee = new Date(maDate).getTime()
      const today = new Date().getTime()
      const diffTime = today - maDateFormatee
      const diffDays = Math.trunc(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays
    },
    editIntervention: function (idIntervention) {
      log.i('editIntervention - In')
      return this.$store.dispatch("get_intervention", idIntervention)
        .catch((error) => {
          log.w('editIntervention', error)
          return this.$toast.error("Une erreur est survenue lors de la récupération du détail de l'intervention")
        })
    },
    editPiscine: function () {
      this.$modal.show("newPiscine");
    },
    editStructure: function () {
      this.$modal.show("newStructure");
    },
    deleteIntervention: function(idIntervention) {
      log.i('deleteIntervention - In', { idIntervention })
      if (confirm("Confirmez-vous la suppression définitive d'intervention")) {
        this.loading = true;
        const url = process.env.API_URL + "/interventions/delete/" + idIntervention;
        return this.$axios.$get(url)
          .then((response) => {
            log.d('deleteIntervention - Done on server', { response })
            this.$store.dispatch("get_interventions");
            this.resetIntervention();
            this.loading = false;
            log.i('deleteIntervention - Done')
            return this.$toast.success(`Intervention #${idIntervention} a bien été supprimée`)
          })
          .catch((error) => {
            log.w('deleteIntervention', { error })
            this.loading = false;
            return this.$toast.error('Une erreur est survenue lors de la suppresion de l\'intervention')
          });
      }
    },
    deletePiscine: function (piscine) {
      log.i('deletePiscine - In', { piscine })
      this.loading = true;
      const url = process.env.API_URL + "/piscine/delete/";
      piscine.uti_id = this.$store.state.utilisateurCourant.id;
      return this.$axios.$post(url, { piscine })
        .then((response) => {
          log.d('deletePiscine - Done on server', { response  })
          this.$store.dispatch("get_mesPiscines");
          this.loading = false;
          log.i('deletePiscine - Done')
          return this.$toast.success(`#${piscine.nom} a bien été supprimée de vos piscines favorites`)
        })
        .catch((error) => {
          log.w('deletePiscine', { error })
          this.loading = false;
          return this.$toast.error('Une erreur est survenue lors de la suppresion de la piscine')
        });
    },
    deleteStructure: function (structure) {
      log.i('deleteStructure - In', { structure })
      this.loading = true;
      const url = process.env.API_URL + "/structures/delete";
      const param = {
        structureId: structure.id,
        userId : this.$store.state.utilisateurCourant.id
      }
      return this.$axios.$post(url, param)
        .then((response) => {
          log.d('deleteStructure - Done on server', { response })
          this.$store.dispatch("get_structureByUser", this.$store.state.utilisateurCourant.id)
          this.loading = false;
          log.i('deleteStructure - Done')
          return this.$toast.success('La structure a bien été supprimée de vos structures favorites')
        })
        .catch((error) => {
          log.w('deleteStructure', { error })
          this.loading = false;
          return this.$toast.error('Une erreur est survenue lors de la suppresion de la structure')
        });
    },
    downloadPdf: function (id) {
      this.$axios({
        url: process.env.API_URL + "/pdf/" + id,
        method: "GET",
        responseType: "blob", // important
      }).then((response) => {
        // Crée un objet blob avec le contenue du CSV et un lien associé
        const url = window.URL.createObjectURL(new Blob([response.data]));
        // Crée un lien caché pour télécharger le fichier
        const link = document.createElement("a");
        link.href = url;
        var idformate = "";
        var nbzero;
        idformate = id.toString();
        for (nbzero = 0; nbzero < 7 - id.toString().length; nbzero++) {
          idformate = "0" + idformate;
        }
        idformate = "AAQ_Attestation-" + idformate;
        link.setAttribute("download", `${idformate}.pdf`); //or any other extension
        document.body.appendChild(link);
        // Télécharge le fichier
        link.click();
        link.remove();
      });
    },
    downloadDoc: function (doc) {
      this.$axios({
        url: process.env.API_URL + "/documents/" + doc.doc_id,
        method: "GET",
        responseType: "blob",
      })
        .then((response) => {
          // https://gist.github.com/javilobo8/097c30a233786be52070986d8cdb1743
          // Crée un objet blob avec le contenue du CSV et un lien associé
          const url = window.URL.createObjectURL(new Blob([response.data]));
          // Crée un lien caché pour télécharger le fichier
          const link = document.createElement("a");
          link.href = url;
          const fileName = doc.doc_filename;
          link.setAttribute("download", fileName);
          // Télécharge le fichier
          link.click();
          link.remove();
        })
        .catch((err) => {
          this.$toasted.error("Erreur lors du téléchargement: " + err.message);
        });
    },
    exportCsv() {
      this.$axios({
        url:
          process.env.API_URL +
          "/interventions/csv/" +
          this.utilisateurCourant.id,
        // url: apiUrl + '/droits/' + 17,
        method: "GET",
        responseType: "blob",
      })
        .then((response) => {
          // https://gist.github.com/javilobo8/097c30a233786be52070986d8cdb1743
          // Crée un objet blob avec le contenue du CSV et un lien associé
          const url = window.URL.createObjectURL(new Blob([response.data]));
          // Crée un lien caché pour télécharger le fichier
          const link = document.createElement("a");
          link.href = url;
          const fileName = "Aisance Aquatique - Interventions.csv";
          link.setAttribute("download", fileName);
          // Télécharge le fichier
          link.click();
          link.remove();
        })
        .catch((err) => {
          this.$toasted.error("Erreur lors du téléchargement: " + err.message);
        });
    },
    displayDashboard(bool) {
      return this.showDashboard = bool
    },
    resetIntervention() {
      this.$store.commit("CLEAN", { key: 'enfants', isArray: true});
      return this.$store.commit("CLEAN", { key: 'interventionCourrante'});
    }
  }
};
</script>

<style>
.accordionBtn {
  text-align: left;
}

.accordionBtn:focus {
  box-shadow: none;
}

.accordion-chevron {
  position: relative;
  top: 5px;

  -webkit-transition: 0.4s ease-in-out;
  -moz-transition: 0.4s ease-in-out;
  -o-transition: 0.4s ease-in-out;
  transition: 0.4s ease-in-out;
  color: #252195;
}

a:not(.collapsed) .accordion-chevron {
  -webkit-transform: rotate(90deg);
  transform: rotate(90deg);
  -moz-transform: rotate(90deg);
}

#modal-intervention___BV_modal_footer_ {
  display: none;
}
</style>
