<template>
  <b-container fluid class="formateurs">
    <b-row>
      <b-col cols="3" v-if="utilisateurCourant.structurerefid==1">
        <MenuInstructeurIndependant @displayDashboard="displayDashboard" />
      </b-col>
      <b-col cols="3" v-if="utilisateurCourant.structurerefid!=1">
        <MenuInstructeurStructure @displayDashboard="displayDashboard" />
      </b-col>
      <b-col cols="9" class="custom-box">
        <b-collapse id="liste-compte-aaq" accordion="my-accordion" role="tabpanel">
          <b-card-body>
              <h2>
                  <i class="material-icons ml-2 mr-2 h2">hourglass_bottom</i>
                  Liste des demandes à valider ({{ this.nbdemandeaaq }})
              </h2>
              <h4>
                  Liste des demandes formulées par les maîtres-nageurs pour la valance "Aisance Aquatique" à valider
              </h4>
              <b-btn @click="exportUsersCsvDemandes('demandesEnCours')" class="mb-2" variant="primary">
              <i class="material-icons" style="font-size: 18px; top: 4px;">import_export</i> Export CSV
            </b-btn>
            <div class="mb-3">
              <b-form inline>
                <label for="nomFilter">Nom:</label>
                <b-input
                  class="ml-2"
                  id="nomFilter"
                  v-model="nomFilter"
                  placeholder="Nom" />
                <label class="ml-3" for="prenomFilter">Prénom:</label>
                <b-input
                  class="ml-2"
                  id="prenomFilter"
                  v-model="prenomFilter"
                  placeholder="Prénom"
                />
              </b-form>
            </div>
            <editable
              v-if="filteredUtilisateurs.length > 0"
              :columns="headers"
              :data="filteredUtilisateurs"
              :removable="false"
              :creable="false"
              :editable="false"
              :loading="loading"
              :defaultSortField="{ key: 'nom', order: 'asc' }"
            >
              <template slot-scope="props" slot="actions">
                <b-btn title="Valider la demande" @click="validerDemande(props.data.item.id)" size="sm" class="mr-1" variant="success">
                  <i class="material-icons">check</i>
                </b-btn>
                <b-btn title="Refuser la demande" @click="refusDemande(props.data.item.id)" size="sm" class="mr-1" variant="danger">
                  <i class="material-icons">cancel</i>
                </b-btn>
                <b-btn title="Voir les informations de l'utilisateur" @click="editUser(props.data.item.id)" size="sm" class="mr-1" variant="primary">
                  <i class="material-icons">preview</i>
                </b-btn>
              </template>
            </editable>
            <p v-else>
              Aucun résultat correspondant à votre recherche.
            </p>
            <modal name="editUser" @closed="closeModalUser" height="auto" width="900px" :scrollabe="true">
              <user />
            </modal>
            <modal name="refusDemande" @closed="closeModalUser" height="auto" width="500px" :scrollabe="true">
              <motifrefus />
            </modal>
            <modal name="validedemande" @closed="closeModalUser" height="auto" width="600px" :scrollabe="true">
              <validedemande />
            </modal>
            
          </b-card-body>
        </b-collapse>
        <b-collapse id="histo-demandes" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <h2>
              <i class="material-icons ml-2 mr-2 h2">grading</i>
              Historique des demandes "Aisance Aquatique" 
            </h2>
            <b-btn @click="exportUsersCsvDemandes('demandesTraitees')" class="mb-2" variant="primary">
              <i class="material-icons" style="font-size: 18px; top: 4px;">import_export</i> Export CSV
            </b-btn>
            <div class="mb-3">
              <b-form inline>
                <label for="nomFilterHisto">Nom:</label>
                <b-input
                  class="ml-2"
                  id="nomFilterHisto"
                  v-model="nomFilterHisto"
                  placeholder="Nom" />
                <label class="ml-3" for="prenomFilterHisto">Prénom:</label>
                <b-input
                  class="ml-2"
                  id="prenomFilterHisto"
                  v-model="prenomFilterHisto"
                  placeholder="Prénom"
                />
              </b-form>
            </div>
            <editable
              v-if="filteredUtilisateursHisto.length > 0"
              :columns="headershisto"
              :data="filteredUtilisateursHisto"
              :removable="false"
              :creable="false"
              :editable="false"
              :loading="loading"
              :defaultSortField="{ key: 'nom', order: 'asc' }"
            >
              <template slot-scope="props" slot="actions">
                <b-btn v-if="props.data.item.motifrefus" title="Voir le motif de refus" @click="voirMotifRefus(props.data.item.motifrefus)" size="sm" class="mr-1" variant="primary">
                  <i class="material-icons">visibility</i>
                </b-btn>
              </template>
            </editable>
            <p v-else>
              Aucun résultat correspondant à votre recherche.
            </p>
            <modal name="voirrefus"  height="auto" width="500px" :scrollabe="true">
              <voirrefus  :motifrefus="this.motifrefuscourant"/>
            </modal>
          </b-card-body>
        </b-collapse>
        <b-collapse id="publication-document" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <list-document />
          </b-card-body>
        </b-collapse>
        <Dashboard v-if="showDashboard" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapState } from "vuex";
import exportUsersCsvDemandes from '~/lib/mixins/exportUsersCsv'

import Editable from "~/components/editable/index.vue";
import user from "~/components/user.vue";
import motifrefus from "~/components/motifrefus.vue";
import voirrefus from "~/components/voirrefus.vue";
import validedemande from "~/components/validedemande.vue";

import MenuInstructeurIndependant from "~/components/navigation/menu-instructeur-independant.vue"
import MenuInstructeurStructure from "~/components/navigation/menu-instructeur-structure.vue"
import Dashboard from '../../components/dashboard/instructeur.vue';

import logger from '~/plugins/logger'
import ListDocument from "@/components/listDocument";
const log = logger('pages:formateur')

export default {
  components: {
    ListDocument,
    Editable,
    MenuInstructeurIndependant,
    MenuInstructeurStructure,
    Dashboard,
    user,
    motifrefus,
    voirrefus,
    validedemande
  },
  mixins: [exportUsersCsvDemandes],
  data() {
    return {
      loading: true,
      motifrefuscourant: null,
      showDashboard: true,
      headers: [
        { path: "id", title: "N° d'utilisateur", type: "text", sortable: true },
        { path: "nom", title: "Nom", type: "text", sortable: true },
        { path: "prenom", title: "Prénom", type: "text", sortable: true },
        { path: "datedemandeaaq", title: "Date demande", type: "text", sortable: true },
        // date de formation = date de début de formation
        { path: "dateconcatformation", title: "Date de formation", type: "text", sortable: true },
        { path: "lieuformation", title: "Lieu de formation", type: "text", sortable: true },
        { path: "__slot:actions", title: "Actions",type: "__slot:actions",sortable: false}
      ],
      headershisto: [
        { path: "id", title: "Id", type: "text", sortable: true },
        { path: "nom", title: "Nom", type: "text", sortable: true },
        { path: "prenom", title: "Prénom", type: "text", sortable: true },
        { path: "datedemandeaaq", title: "Date demande", type: "text", sortable: true },
        { path: "dateaccordaaq", title: "Date validation", type: "text", sortable: true },
        { path: "daterefusaaq", title: "Date refus", type: "text", sortable: true },
        { path: "__slot:actions", title: "Actions",type: "__slot:actions",sortable: false}
      ],
      nomFilter: "",
      prenomFilter: "",
      nomFilterHisto: "",
      prenomFilterHisto: "",
      // Par défaut le filtre es positionné sur role "Maitre Nageur" car ce sont ces comptes qui sont à valider par l'instructeur
      roleFilter:"MaitreNageur",
      listeRole: [
        { text: "Maitre Nageur AAQ", value: "MaitreNageurAAQ" },
        { text: "Maitre Nageur", value: "MaitreNageur" },
        { text: "Tous", value: "Tous" }
      ],
      nbdemandeaaq: 0
    };
  },
  computed: {
    ...mapState(["utilisateurCourant","users","documents"]),
    filteredUtilisateurs: function() {
      log.i('filteredUtilisateurs - In')
      return this.users.filter(user => {
        let isMatch = true
        if (this.nomFilter != "") {
          isMatch = isMatch && user.nom.toLowerCase().indexOf(this.nomFilter.toLowerCase()) > -1
        }
        if (this.prenomFilter != "") {
          isMatch = isMatch && user.prenom.toLowerCase().indexOf(this.prenomFilter.toLowerCase()) > -1
        }
        // On garde les rôles  MNS (5) pour les demandes en cours (1)
        isMatch = isMatch && (user.role == 5 && user.statutdemande == 1)
        log.d('filteredUtilisateurs - Done', { isMatch })
        return isMatch;
      });
    },
    filteredUtilisateursHisto: function() {
      log.i('filteredUtilisateursHisto - In')
      return this.users.filter(user => {
        console.log("user statutdemande",user.statutdemande)
        console.log("user dateaccordaaq",user.dateaccordaaq)
        console.log("user daterefusaaq",user.daterefusaaq)
        console.log("user ",user)
        
        let isMatch = true
        if (this.nomFilterHisto != "") {
          isMatch = isMatch && user.nom.toLowerCase().indexOf(this.nomFilterHisto.toLowerCase()) > -1
        }
        if (this.prenomFilterHisto != "") {
          isMatch = isMatch && user.prenom.toLowerCase().indexOf(this.prenomFilterHisto.toLowerCase()) > -1
        }
        // On garde les rôles MNSAAQ (4) ou MNS (5) pour les demandes refusés (3)
        // On garde les rôles MNSAAQ (4) pour les demandes accordées (2)
        isMatch = isMatch && (
          (
            (user.role == 4 || user.role == 5) && user.statutdemande == 3
          )
          || 
          (user.role == 4 && user.statutdemande == 2)
        )
        log.d('filteredUtilisateurs - Done', { isMatch })
        return isMatch;
      });
    }
  },
  async mounted() {
    this.loading = true;
    await this.$store.dispatch("get_users")
      .catch(error => {
          log.w("mounted - Une erreur est survenue lors de la récupération des utilisateurs", error)
          return this.$toast.error('Une erreur est survenue lors de la récupération des utilisateurs')
      })
    this.nbdemandeaaq = this.filteredUtilisateurs.length;

    const url = process.env.API_URL + "/user/ ";
    await this.$axios({
      url: url,
      method: "GET",
    })
      .then(response => {
        log.i('mounted - Done')
        return this.listeInstructeurs = response.data.instructeurs;
      })
      .catch(error => {
        log.w('mounted - error', error)
        return this.$toast.error('Une erreur est survenue lors du chargement des instructeurs')
      });

    this.loading = false;
  },
  methods: {
    displayDashboard(bool) {
      return this.showDashboard = bool
    },

    editUser: function(id) {
      log.i('getUser - In')
      return this.$store.dispatch("get_user", id)
        .then(() => {
          log.i('getUser - Done')
          return this.$modal.show("editUser");
        })
        .catch(error => {
          log.w('getUser - Une erreur est survenue lors de la récupération du détail de l\'utilisateur', { error })
          return this.$toast.error('Une erreur est survenue lors de la récupération du détail de l\'utilisateur')
        })
    },
    validerDemande: function(id) {
      log.i('validerDemande - In')
      return this.$store.dispatch("get_user", id)
        .then(() => {
          log.i('validerDemande - Done')
          return this.$modal.show("validedemande");
        })
        .catch(error => {
          log.w('validerDemande - Une erreur est survenue lors de la récupération du détail de l\'utilisateur', { error })
          return this.$toast.error('Une erreur est survenue lors de la récupération du détail de l\'utilisateur')
        })
    },
    refusDemande: function(id) {
      log.i('getUser - In', id)
      return this.$store.dispatch("get_user", id)
        .then(() => {
          log.i('getUser - Done')
          return this.$modal.show("refusDemande");
        })
        .catch(error => {
          log.w('getUser - Une erreur est survenue lors de la récupération du détail de l\'utilisateur', { error })
          return this.$toast.error('Une erreur est survenue lors de la récupération du détail de l\'utilisateur')
        })
    },

    voirMotifRefus: function(refus) {
      this.motifrefuscourant = refus
      return this.$modal.show('voirrefus');

    },

    async ChargeListeUtilisateur() {
      // Changement de route pour pouvoir gérer les demandes par l'Admin
      await this.$store.dispatch("get_users_demandes").catch(error => {
          log.w('mounted - Error', error)
          return this.$toast.error('Une erreur est survenue lors de la récupération des users')
      })
      this.nbdemandeaaq = this.filteredUtilisateurs.length;
    },

    closeModalUser: function() {
      // Repositionnement du compteur au retour de l'Edit du user
      // Mais uniquement si on revient d'un compte MN sinon on ne fait pas de mise à jour.
      // Repositionnement du compteur au retour de l'Edit du user
      // Mais uniquement si on revient d'un compte MN sinon on ne fait pas de mise à jour.
      //if (this.roleFilter=="MaitreNageur") {
      this.ChargeListeUtilisateur();
      //}
      this.nbdemandeaaq = this.filteredUtilisateurs.length;
    }
  }
}
</script>
