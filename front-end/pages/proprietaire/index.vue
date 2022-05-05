<template>
  <b-container fluid class="partenaire">
    <b-row>
      <b-col cols="3">
        <Menu @displayDashboard="displayDashboard" />
      </b-col>
      <b-col cols="9" class="custom-box">
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
                @click="editPiscine(props.data.item)"
                size="sm"
                class="mr-1"
                variant="primary">
                <i class="material-icons">edit</i>
              </b-btn>
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
              @click="editPiscine()"
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
    <modal name="newPiscine" height="auto" width="900px" :scrollabe="true">
      <PiscinePrivee :maPiscine="piscineToDisplay"/>
    </modal>
  </b-container>
</template>

<script>
import PiscinePrivee from "~/components/element/piscine-privee.vue";
import Editable from "~/components/editable/index.vue";
import Menu from "~/components/navigation/menu-proprietaire.vue"
import { mapState } from "vuex";

export default {
  components: {
    Editable,
    PiscinePrivee,
    Menu
  },
  data() {
    return {
      piscineToDisplay: null,
      userId: null,
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
      ]
    };
  },
  computed: mapState([
    "mesPiscines",
    "utilisateurCourant",
    "documents",
  ]),
  methods: {
    editPiscine: function (pis) {
      if (pis) {
        const url = process.env.API_URL + "/piscine/privee/"+pis.id;
        return this.$axios
          .$get(url, {})
          .then((response) => {
            this.piscineToDisplay = response.maPiscine
            this.$modal.show("newPiscine");
          })
          .catch((error) => {$
            return this.$toast.error(
                `${this.selectedPiscine.nom} n'a pas pu être modifi`
              );
          });
      }
      else {
        this.piscineToDisplay = null;
        this.$modal.show("newPiscine");
      }
    },
    deletePiscine: function (piscine) {
      this.loading = true;
      this.userId = this.$store.state.utilisateurCourant.id
      const url = process.env.API_URL + "/piscine/delete/privee/" + piscine.id;
      return this.$axios
        .$post(url, { userId : this.userId })
        .then((response) => {
          this.$store.dispatch("get_mesPiscines");
          this.loading = false;
          this.$toast.success(
            `#${piscine.nom} a bien été supprimée`,
            {}
          );
        })
        .catch((error) => {
          return this.$toast.error(
              `${piscine.nom} n'a pas pu être supprimée`
            );
          this.loading = false;
        });
    },
    displayDashboard(bool) {
      return this.showDashboard = bool
    },
  },
  //
  //  CHARGEMENT ASYNCHRONE DES INTERVENTIONS
  //
  async mounted() {
    this.$store.dispatch("get_mesPiscines")
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
