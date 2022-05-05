<template>
  <b-container class="interventionModal">
    <b-row>
      <b-col cols="12" class="text-center mb-5">
        <h2>Ajout d'un intervenant</h2>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="6" class="mb-3">
        <b-form inline>
          <label for="nameFilter">Saissisez le début du nom d'un intervenant pour l'ajouter :</label>
          <b-input
            class="ml-2"
            id="nameFilter"
            v-model="nameFilter"
            placeholder="Dupond"
          />
        </b-form>
       </b-col>
        <b-col cols="6" class="mb-3">
        <b-row>
          <span>Intervenant non référencé dans l'application ou inconnu :</span>
        </b-row>
        <b-row>
          <b-button @click="addInconnu()">
          Ajouter intervenant inconnu
          </b-button>
        </b-row>
      </b-col>
    </b-row>
    <b-row>
        <b-col cols="12">
          <editable
            :columns="headersEncadrants"
            :data="filteredMN"
            :removable="false"
            :creable="false"
            :editable="false"
            :noDataLabel="''"
            tableMaxHeight="none"
          >
            <template slot-scope="props" slot="actions">
              <b-btn
                @click="addMN(props.data.item)"
                size="sm"
                class="mr-1"
                variant="primary">
                <i class="material-icons">add</i>
              </b-btn>
            </template>
          </editable>
        </b-col>
    </b-row>
  </b-container>
</template>
<script>
import Editable from "~/components/editable/index.vue"
import logger from '~/plugins/logger'
const log = logger('components:element:intervenant')

export default {
  components: {
    Editable,
  },
  props: {
    intervention: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  computed: {
    filteredMN: function () {
      if (this.nameFilter && this.nameFilter.length > 2) {
        return this.listeMaitreNageur.filter((mn) => {
          let isMatch = mn.nom;
          isMatch = isMatch && mn.nom.toLowerCase().indexOf(this.nameFilter.toLowerCase()) > -1;
          return isMatch;
        });
      } else {
        return [];
      }
    },
  },
  data() {
    return {
      headersEncadrants: [
        { path: "nom", title: "Nom", type: "text", sortable: true },
        { path: "prenom", title: "Prénom", type: "text", sortable: true },
        { path: "mail", title: "Courriel", type: "text", sortable: true },
        { path: "rol_libelle", title: "Rôle", type: "text", sortable: true },
        { path: "__slot:actions", title: "Actions", type: "__slot:actions", sortable: false },
      ],
      listeMaitreNageur: [],
      nameFilter: "",
    };
  },
  methods: {
    addInconnu: function () {
      let mn = this.listeMaitreNageur.filter((mn) => {
          let isMatch = mn.nom;
          isMatch = isMatch && mn.nom == 'inconnu' ;
          return isMatch;
      })
      this.intervention.utilisateur.push(mn[0]);
      this.$toast.success(`l'intervenant ${mn[0].nom} est ajouté à la liste`);
      return this.$modal.hide("editIntervenant")
    },
    addMN: function (mn) {
      const present = this.intervention.utilisateur.find(user => user.id == mn.id)
      log.i('addMN - In', { present })
      if (present) {
        this.$toast.error(`l'intervenant ${mn.nom} est déjà présent dans la liste`)
      } else {
        this.intervention.utilisateur.push(mn);
        this.$toast.success(`l'intervenant ${mn.nom} est ajouté à la liste`);
      }
      log.i('addMN - Done')
      this.nameFilter = "";
      return this.$modal.hide("editIntervenant")
    }
  },
  async mounted() {
    log.i('mounted - In')
    const url = process.env.API_URL + "/user/encadrant";
    await this.$axios({
      url: url,
      method: "GET",
    })
      .then(response => {
        log.i('mounted - Done')
        return this.listeMaitreNageur = response.data.encadrants;
      })
      .catch(error => {
        log.w('mounted - error', error)
        return this.$toast.error('Une erreur est survenue lors du chargement des encadrants')
      });
  },
};
</script>

<style>
.interventionModal {
  padding: 30px;
}
</style>
