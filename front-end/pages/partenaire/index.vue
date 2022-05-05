<template>
  <b-container fluid class="partenaire">
    <b-row>
      <b-col cols="3">
        <Menu @displayDashboard="displayDashboard" @resetForm="resetIntervention" />
      </b-col>
      <b-col cols="9" class="custom-box">
        <b-collapse id="interventionsStructure" accordion="my-accordion" role="tabpanel">
          <div v-if="interventions.length > 0">
            <b-btn
              @click="exportCsv()"
              class="mb-2"
              variant="primary">
              <i class="material-icons" style="font-size: 18px; top: 4px">import_export</i>
              Export CSV
            </b-btn>
            <editable
              :columns="headers"
              :data="this.interventionsToDisplay"
              :removable="false"
              :creable="false"
              :editable="true"
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
                    @click="editIntervention(props.data.item.id)"
                    size="sm"
                    class="ml-1"
                    variant="primary"
                    v-b-popover.hover="`Modifier l'intervention`"
                  >
                    <i class="material-icons">edit</i>
                  </b-btn>
                  <b-btn
                    @click="downloadPdf(props.data.item.id)"
                    v-if="props.data.blocId == '3'"
                    size="sm"
                    class="ml-1"
                    variant="primary"
                    v-b-popover.hover="`Télécharger l'attestation`"
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
        <b-collapse id="addIntervention" accordion="my-accordion" role="tabpanel" >
          <Intervention :intervention="interventionCourrante" />
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
              tableMaxHeight="none"
            >
            </editable>
          </b-container>
        </b-collapse>
        <b-collapse id="statistiques" accordion="my-accordion" role="tabpanel">
            <h4 class="text-center" v-if="interventions.length == 0 && loadingInt === false">
              Bientôt disponible
            </h4>
        </b-collapse>
        <b-collapse id="documents" accordion="my-accordion" role="tabpanel">
          <b-container>
            <b-row>
              <b-col cols="12">
                <h5 class="mb-3">Documents disponibles:</h5>
                <ul>
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
              </b-col>
            </b-row>
          </b-container>
        </b-collapse>
      </b-col>
    </b-row>
    <modal name="editIntervention" :scrollabe="true" height="1100px" width="1100px" @closed="clearIntervention()">
      <Intervention :intervention="interventionCourrante" />
    </modal>
    <modal name="newPiscine" height="auto" width="900px" :scrollabe="true">
      <Piscine :dansInt="false"/>
    </modal>
    <modal name="newStructure" height="500px" width="800px" :scrollabe="true">
      <Structure :dansInt="false"/>
    </modal>
  </b-container>
</template>

<script>
import Intervention from "~/components/Intervention.vue";
import Piscine from "~/components/element/piscine.vue";
import Structure from "~/components/element/structure.vue";
import Editable from "~/components/editable/index.vue";
import Menu from "~/components/navigation/menu-partenaire.vue"
import { mapState } from "vuex";

export default {
  components: {
    Intervention,
    Editable,
    Piscine,
    Structure,
    Menu
  },
  data() {
    return {
      loadingInt: false,
      interventionsToDisplay: null,
      headers: [
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
        }
      ]
    };
  },
  watch: {
    interventions: function () {
      this.loadingInt = true;
      
        this.interventionsToDisplay = this.interventions;
      
      this.loadingInt = false;
    },

  },
  computed: mapState([
    "interventions",
    "mesPiscines",
    "mesStructures",
    "interventionCourrante",
    "utilisateurCourant",
    "documents",
    "structures"
  ]),
  methods: {
    editIntervention: function (idIntervention) {
      return this.$store
        .dispatch("get_intervention", idIntervention)
        .then(() => {
          this.$modal.show("editIntervention");
        })
        .catch((error) => {
          console.error(
            "Une erreur est survenue lors de la récupération du détail de l'intervention",
            error
          );
        });
    },
    editPiscine: function () {
      this.$modal.show("newPiscine");
    },
    editStructure: function () {
      this.$modal.show("newStructure");
    },
    deleteIntervention: function (idIntervention) {
      console.info("Suppression d'une intervention : " + idIntervention);
      //this.$dialog.confirm({ text: 'Confirmez-vous la suppression définitive d\'intervention', title: 'Suppression'});
      if (confirm("Confirmez-vous la suppression définitive d'intervention")) {
        this.loading = true;
        const url =
          process.env.API_URL + "/interventions/delete/" + idIntervention;
        console.info(url);
        return this.$axios
          .$get(url)
          .then((response) => {
            this.$store.dispatch("get_interventions");
            //this.resetform();
            this.clearIntervention();
            this.$toast.success(
              `Intervention #${idIntervention} a bien été supprimée`,
              {}
            );
          })
          .catch((error) => {
            console.error(
              "Une erreur est survenue lors de la suppresion de l'intervention",
              error
            );
          });
        this.loading = false;
      }
    },
    deletePiscine: function (piscine) {
      this.loading = true;
      const url = process.env.API_URL + "/piscine/delete/";
      piscine.uti_id = this.$store.state.utilisateurCourant.id;
      return this.$axios
        .$post(url, { piscine })
        .then((response) => {
          this.$store.dispatch("get_mesPiscines");
          this.loading = false;
          this.$toast.success(
            `#${piscine.nom} a bien été supprimée de vos piscines favorites`,
            {}
          );
        })
        .catch((error) => {
          console.error(
            "Une erreur est survenue lors de la suppresion de la piscine favorite",
            error
          );
          this.loading = false;
        });
    },
    deleteStructure: function (structure) {
      this.loading = true;
      const url = process.env.API_URL + "/structures/delete";
      return this.$axios
        .$post(url, { structure })
        .then((response) => {
          this.$store.dispatch("get_structureByUser", this.$store.state.utilisateurCourant.id)
          this.loading = false;
          this.$toast.success(
            response,
            {}
          );
        })
        .catch((error) => {
          console.error(
            "Une erreur est survenue lors de la suppresion de la structure favorite",
            error
          );
          this.loading = false;
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
          console.log("Done - Download", { fileName });
        })
        .catch((err) => {
          console.log(JSON.stringify(err));
          this.$toasted.error("Erreur lors du téléchargement: " + err.message);
        });
    },
    clearIntervention() {
      this.$store.commit("reset_interventions");
    },
    displayDashboard(bool) {
      return this.showDashboard = bool
    },
    resetIntervention() {
      this.$store.commit("CLEAN", { key: 'enfants', isArray: true});
      return this.$store.commit("CLEAN", { key: 'interventionCourrante'});
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
          console.log("Done - Download", { fileName });
        })
        .catch((err) => {
          console.log(JSON.stringify(err));
          this.$toasted.error("Erreur lors du téléchargement: " + err.message);
        });
    },
  },
  //
  //  CHARGEMENT ASYNCHRONE DES INTERVENTIONS
  //
  async mounted() {
    this.$store.dispatch("get_mesPiscines"),
    this.$store.dispatch("get_interventions")
    this.$store.dispatch("get_structureByUser", this.$store.state.utilisateurCourant.id)
    this.$store.commit("CLEAN", { key: 'enfants', isArray: true });
  },
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
</style>
