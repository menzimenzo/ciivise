<template>
  <b-container class="accueil">
    <b-row class="mt-1" >
      <b-col  class="col-12 col-md-4">
        <b-img :src="require('assets/MainAisAqua.png')" width="365%"/>
      </b-col>
      <b-col  class="col-12 col-md-8" v-if="!loading">
          <b-card class="mb-3" v-if="maDemandeRefus.length > 0" title="Demande(s) refusée(s)">
               <editable
                :columns="headersRefus"
                :data="maDemandeRefus"
                :removable="false"
                :creable="false"
                :editable="false"
                :noDataLabel="''"
                tableMaxHeight="none"
                :loading="loading"
                :defaultSortField="{ key: 'datedemandeaaq', order: 'asc' }"
              >
              <template slot-scope="props" slot="actions">
                <b-btn  title="Voir le motif de refus" @click="voirMotifRefus(props.data.item.dem_motifrefus)" size="sm" class="mr-1" variant="primary">
                  <i class="material-icons">visibility</i>
                </b-btn>
              </template>              
              </editable>
              <modal name="voirrefus"  height="auto" width="500px" :scrollabe="true">
              <voirrefus  :motifrefus="this.motifrefuscourant"/>
              </modal>
         </b-card>
          <b-card class="mb-3" v-if="!maDemande">
          <b-form>
            <p>Vous êtes connecté avec un rôle "Maître Nageur"</p>
            <p>Si vous suivez ou avez suivi une formation pour les encadrants de l’ Aisance Aquatique :</p>
            <p>Vous avez la possibilité de valoriser cette formation, en recevant le label « Maitre-nageur AAQ ».<br>
            Pour ce faire, précisez la structure ou l’instructeur AAQ qui vous forme ou vous a formé.</p>

            <b-form-group label-for="dateformation" required >

                      <b-card class="mb-3" >
              <u>Informations sur la formation suivie</u>
              <b-row>

              </b-row>
              <b-row>
                <b-col cols="5">
                  <b-form-group
                    id="DateDebutFormation"
                    label="Date de début de formation :"
                    required
                    label-for="dateDebutFormationInput"
                  >
                  <b-form-input
                    maxlength="10"
                    v-model="datedebutformation"
                    required
                    type="date"
                    class="text-date input-width"
                  />
                                    </b-form-group>
                </b-col>
                <b-col cols="5">
                  <b-form-group
                    id="DateFinFormation"
                    label="Date de fin de formation :"
                    required
                    label-for="dateFinFormationInput"
                  >
                    <b-form-input
                      maxlength="10"
                      v-model="datefinformation"
                      required
                      type="date"
                      class="text-date input-width"
                    />
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row>
                <b-col cols="3">
                  <b-form-group
                    id="CodePostal"
                    label="Code Postal :"
                    label-for="cp"
                  >
                    <b-form-input
                      v-model="cpformation"
                      name="cp"
                      key="cp"
                      id="cp"
                      type="number"
                      placeholder="CP lieu"
                    />
                  </b-form-group>
                </b-col>
                <b-col cols="5">
                  <b-form-group
                    id="Commune"
                    label="Lieu de formation :"
                    required
                    label-for="communeInput"
                  >
                    <b-form-select
                      name="commune"
                      key="commune"
                      type="text"
                      v-model="communeformation"
                      id="communeSelect"
                    >
                      <option :value="null">-- Choix lieu --</option>
                      <option
                        v-for="commune in listecommune"
                        :key="commune.cpi_codeinsee"
                        :value="commune"
                      >
                        {{ commune.com_libellemaj }}
                      </option>
                    </b-form-select>
                  </b-form-group>
                </b-col>
              </b-row>
            </b-card >
            </b-form-group>
            <div>
            </div>
            <b-form-group label-for="lststructureref" required >
              <b-form-select
                v-model="structurerefid"
                name="lststructureref"
                aria-describedby="lststructurerefFeedback">
                <option :value="null">-- Choix de la structure de référence --</option>
                <option
                  v-for="structureref in listestructureref"
                  :key="structureref.id"
                  :value="structureref.id"
                >{{ structureref.libellecourt }}</option>
              </b-form-select>
            </b-form-group>
              <b-form-group label-for="lstformateurstrucref" required>
                <b-form-select
                  v-model="formateurrefid"
                  name="lstformateurstrucref"
                  aria-describedby="lstformateurstrucrefFeedback">
                  <option :value="null">-- Choix de l’instructeur de la structure de référence --</option>
                  <option
                    v-for="formateurstrucref in listeformateurstrucref"
                    :key="formateurstrucref.id"
                    :value="formateurstrucref.id"
                  >{{ formateurstrucref.nom }} {{ formateurstrucref.prenom }}</option>
                </b-form-select>
              <b-button variant="success" :disabled="this.formateurrefid == null || this.datedebutformation == null || this.datefinformation == null || this.communeformation == null" v-on:click="validerStrutureRef()">Valider</b-button>
            </b-form-group>
            <p class="mb-4">OU</p>
            <b-form-group label-for="lstformateur" required>
              <b-form-select
                v-model="formateurid"
                name="lstformateur"
                aria-describedby="lstformateurFeedback">
                <option :value="null">-- Choix de l’instructeur --</option>
                <option
                  v-for="formateur in listeformateur"
                  :key="formateur.id"
                  :value="formateur.id"
                >{{ formateur.nom }} {{ formateur.prenom }}</option>
              </b-form-select>
              <b-button variant="success" :disabled="this.formateurid == null || this.datedebutformation == null || this.datefinformation == null || this.communeformation == null" v-on:click="validerFormateur()">Valider</b-button>
            </b-form-group>
          </b-form>
        </b-card>
        <b-card class="mb-3" v-else>
          <p>Vous êtes connecté avec un rôle "Maître Nageur"</p>
          <p>Vous avez une demande en cours pour passer en "Maître Nageur Aisance Aquatique".<br>
          Demande effectuée le {{ this.maDemande.datedemandeaaq}} auprès de {{ this.maDemande.sre_libellecourt}} {{ this.maDemande.uti_prenom}} {{ this.maDemande.uti_nom}}</p>
        </b-card>
      </b-col>
      <b-col class="col-12 col-md-8" v-else>
        Chargement en cours ... veuillez patienter
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapState } from "vuex";
import rechercheCommune from "~/lib/mixins/rechercheCommune";
import Editable from "~/components/editable/index.vue";
import voirrefus from "~/components/voirrefus.vue";

import logger from '~/plugins/logger'
const log = logger('pages:accueil')

export default {
    components: 
    {
      Editable,
      voirrefus
    },
    mixins: [
      rechercheCommune
    ],
  data() {
    return {
      motifrefuscourant: null,
      datedebutformation : null,
      datefinformation : null,
      cpformation: null,
      communeformation: null,
      listecommune: [
        {
          text: "Veuillez saisir un code postal",
          value: null,
          insee: null,
          cp: null,
          codedep: null,
        },
      ],
      loading: false,
      formateurid: null,
      formateurrefid: null,
      structurerefid: null,
      maDemande: null,        
      maDemandeRefus : [],
      listeformateur: [
        {
          text: "Veuillez sélectionner un formateur",
          value: null,
          id: null,
          nom: null,
          prenom: null,
          mail: null
        },
      ],
      listeformateurstrucref: [
        {
          text: "Veuillez sélectionner un formateur",
          value: null,
          id: null,
          nom: null,
          prenom: null,
          mail: null
        },
      ],

      listestructureref: [
        {
          text: "Veuillez sélectionner une structure de référence",
          value: null,
          id: null,
          libellecourt: null,
          courriel: null
        },
      ],
      headers: [
        { path: "id", title: "Id", type: "text", sortable: true },
        { path: "nom", title: "Nom", type: "text", sortable: true },
        { path: "prenom", title: "Prénom", type: "text", sortable: true }
      ],
      headersRefus: [
        { path: "datedemandeaaq", title: "Date de la demande", type: "text", sortable: true },
        { path: "daterefusaaq", title: "Date de refus", type: "text", sortable: true },
        { path: "uti_nom", title: "Instructeur", type: "text", sortable: true },
        { path: "sre_libellecourt", title: "Structure", type: "text", sortable: true },
        { path: "__slot:actions", title: "Actions",type: "__slot:actions",sortable: false}
      ],
    };
  },
  computed: mapState(["utilisateurCourant", "demandeaaq" ]),
  watch: {
    "structurerefid": function () {
      this.rechercheformateurstrucref(this.structurerefid)
    },
    cpformation() {
      this.cp = this.cpformation;
      return this.rechercheCommune();
    },

  },
  methods: {
    rechercheformateur: function() {
      log.i('rechercheformateur - In')
      const url = process.env.API_URL + "/user/liste/3"
      return this.$axios.$get(url)
        .then(response => {
          log.i('rechercheformateur - Done')
          return this.listeformateur = response.users;
        })
        .catch(error => {
          log.w('rechercheformateur - ', { error })
          return this.$toast.error("Une erreur est survenue lors de la récupération des formateurs")
        });
    },
    recherchestructureref: function() {
      log.i('recherchestructureref - In')
      const url = process.env.API_URL + "/structureref/liste/"
      return this.$axios.$get(url)
        .then(response => {
          log.i('recherchestructureref - Done')
          return this.listestructureref = response.structureref;
        })
        .catch(error => {
          log.w('recherchestructureref - ', { error })
          return this.$toast.error("Une erreur est survenue lors de la récupération des structures de référence")
        });
    },

    rechercheformateurstrucref: function(idstructureref) {
      log.i('rechercheformateurstrucref - In')
      const url = process.env.API_URL + "/user/instructeurdunestructure/" + idstructureref
      return this.$axios.$get(url)
        .then(response => {
          log.i('rechercheformateurstrucref - Done')
          return this.listeformateurstrucref = response.users;
        })
        .catch(error => {
          log.w('rechercheformateur - ', { error })
          return this.$toast.error("Une erreur est survenue lors de la récupération des formateurs de la structure de référence")
        });
    },
    chargedemande: function() {
      const url = process.env.API_URL + "/demandeaaq?demandeurid="+this.utilisateurCourant.id
      log.i('chargeDemande - In', { url })
      return this.$axios.$get(url)
        .then( response => {
          const demandesAaq = response && response.demandesAaq
          if(demandesAaq && demandesAaq.length === 1) {
            log.i('chargeDemande - Une demande est en cours')
            return this.maDemande = demandesAaq[0];
          } else if(demandesAaq && demandesAaq.length > 1){
            log.w('chargeDemande - Plusieurs demandes sont en cours')
            return this.$toast.error('Il semblerait que vous ayez plusieurs demandes en cours, veuillez contacter l\'assistance.')
          } else {
            log.d('chargeDemande - aucune demande en cours.')
          }
        })
        .catch(error => {
          log.w('chargeDemande - Une erreur est survenue lors de la récupération de la demande', error)
          return this.$toast.error('Une erreur est survenue lors de la récupération de la demande.')
        })
    },
    chargedemanderefus: function() {
      const url = process.env.API_URL + "/demandeaaq/refus?demandeurid="+this.utilisateurCourant.id
      log.i('chargeDemandeRefusées - In', { url })
      return this.$axios.$get(url)
        .then( response => {
          const demandesAaqRefus = response && response.demandesAaqRefus 
          if(demandesAaqRefus && demandesAaqRefus.length > 0) {
            log.i('chargeDemandeRefusée - Au moins une demande est en refusée')
            return this.maDemandeRefus = demandesAaqRefus;
          } else if(demandesAaqRefus && demandesAaqRefus.length > 1){
            log.w('chargeDemandeRefuse - Plusieurs demandes sont en cours')
            return this.$toast.error('Il semblerait que vous ayez plusieurs demandes en cours, veuillez contacter l\'assistance.')      
          } else {
            log.d('chargeDemandeRefusées - aucune demande en cours.')
          }
        })
        .catch(error => {
          log.w('chargeDemandeRefus - Une erreur est survenue lors de la récupération de la demande', error)
          return this.$toast.error('Une erreur est survenue lors de la récupération de la demande.')      
        })
    },

    validerFormateur: function() {
      log.i('validerFormateur - In', this.formateurid)
      if (this.formateurid) {
        const url = process.env.API_URL + '/demandeaaq/'
        const body = {
          datedebutformation: this.datedebutformation,
          datefinformation: this.datefinformation,
          inseeformation: this.communeformation.cpi_codeinsee,
          formateurId: this.formateurid,
          demandeurId: this.utilisateurCourant.id
        }
        return this.$axios.$post(url, body)
          .then(({ maDemande }) => {
            log.i('validerFormateur - Done', { maDemande })
            this.maDemande = maDemande
            this.$toast.success('Votre demande a été envoyée.')
            return this.chargedemande()
          })
          .catch(error => {
            log.w('validerFormateur - Error', error)
            return this.$toast.error('Une erreur est survenue lors du dépot de la demande')
          })
      }
      else
      {
        this.$toast.error('L\'instructeur indépendant est obligatoire pour valider la demande.')
      }
    },
    validerStrutureRef: function() {
      log.i('validerStrutureRef - In', this.structurerefid)

      if (this.structurerefid && this.formateurrefid) {
        const url = process.env.API_URL + '/demandeaaq/'
        const body = {
          datedebutformation: this.datedebutformation,
          datefinformation: this.datefinformation,
          inseeformation: this.communeformation.cpi_codeinsee,
          formateurId: this.formateurrefid,
          structurerefid: this.structurerefid,
          demandeurId: this.utilisateurCourant.id
        }
        return this.$axios.$post(url, body)
          .then(({ maDemande }) => {
            log.i('validerStrutureRef - Done', { maDemande })
            this.maDemande = maDemande
            this.$toast.success('Votre demande a été envoyée.')
            return this.chargedemande()
          })
          .catch(error => {
            log.w('validerStrutureRef - Error', error)
            return this.$toast.error('Une erreur est survenue lors du dépot de la demande')
          })
      }
    },
    voirMotifRefus: function(refus) {
      this.motifrefuscourant = refus
      return this.$modal.show('voirrefus');

    }
  },
  async created() {
  if (this.utilisateurCourant.profilId != 2) {
    log.i('created - In')
    this.loading = true;
    // Chargement de la liste des formateurs
    await this.rechercheformateur()
    // Chargement de la liste des structures de référence
    await this.recherchestructureref()
    // Chargement de la demande
    await this.chargedemande() 
    // Chargement des demandes refusées
    await this.chargedemanderefus()
    this.loading = false;
    }
  }
};
</script>

<style scoped>
select {
  width: 80%;
}
</style>
