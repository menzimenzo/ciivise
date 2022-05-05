<template>
  <b-container class="refusModal">
      <b-col cols="12">
    <b-row>
        <h2 class="mb-3">Motif refus de la demande <b>{{ formUser.prenom }} {{ formUser.nom }}</b>
        </h2>
    </b-row>
    <b-row>
          <span>Indiquez le motif de refus de la demande de valence * :</span>
          <b-form-textarea
            id="textarea1" 
            v-model="motifrefus"
            placeholder
            :rows="4"
          ></b-form-textarea>
          <span>Le motif de refus sera envoyé par courriel au demandeur et sera visible sur son écran d'accueil de l'application</span>
          <span v-if="utilisateurCourant.profilId == 6">Cette information sera également diffusée et accessible pour l'instructeur AAQ associé à cette demande</span>
    </b-row>
    <b-row>
      <div class="mb-3 mt-3">
        <b-button v-on:click="$modal.hide('refusDemande')">Annuler</b-button>
        <b-button variant="danger" v-on:click="checkform">Refuser la valence</b-button>
      </div>
    </b-row>
      </b-col>
  </b-container>
</template>
<script>
import { mapState } from "vuex"
import { loadFormUser } from "../lib/utils"

import logger from '~/plugins/logger'
const log = logger('components:motifrefus')

export default {
  data() {
    return {
      motifrefus: null,
      formUser: loadFormUser(this.$store.state.utilisateurSelectionne)
    };
  },
  computed: { 
    ...mapState(["utilisateurCourant"]) 
  },
  methods: {
    checkform() {
      log.i("checkform - In")
      const erreurformulaire = []
      let formOK = true;
      if (!this.motifrefus) {
        erreurformulaire.push("Le motif de refus de la demande est obligatoire");
        formOK = false;
      }
      
      if (!formOK) {
        log.d("Formulaire invalide KO ", erreurformulaire);
        return this.$toast.error(erreurformulaire)
      } else {
        return this.refuseDemande()
      }
    },
    refuseDemande() {
      log.i('motifRefus - In', { role: this.formUser.role, disabledInstructeur: this.disabledInstructeur })
      // Si on est Admin, Instructeur ou structure de référence, le changement de profil engendre la validation de la demande.
      const url = process.env.API_URL + "/demandeaaq?demandeurid=" + this.formUser.id
      this.$axios.$get(url)
        .then( ({ demandesAaq }) => {
            log.d('motifRefus - response for demande', demandesAaq)
            let demandeaaq = demandesAaq[0]
            // Mise à jour du formateur si c'est fait par l'admin ou par la structure référente
            if(demandesAaq) {
              demandeaaq['dem_motifrefus'] = this.motifrefus
              const url = process.env.API_URL + '/demandeaaq/refus'
              return this.$axios.$put(url, {demandeaaq}).then(() => {
                log.i('motifRefus - Done')
                this.$modal.hide("refusDemande")
                return this.$toast.success(`La demande de ${this.formUser.prenom} ${this.formUser.nom} a été refusée`)
              })
              .catch((error) => {
                log.d('editUtilisateur - Une erreur est survenue lors de la mise à jour de l\'utilisateur', error)
                return this.$toast.error('Une erreur est survenue lors de la mise à jour de l\'utilisateur')
              })
            }
        })
        .catch(error => {
          log.d("Une erreur est survenue lors de la vérification de la présence d'une demande AAQ",error);
          return this.$toast.error("Une erreur est survenue lors de la vérification de la présence d'une demande AAQ")
        }
      );
    },

  },
  async mounted() {
    log.i('mounted - In')
          log.d("utilisateurcourant",this.utilisateurCourant)

  }
};
</script>

<style>
.interventionModal {
  padding: 30px;
}
.modal-btns {
  position: absolute;
  bottom: 10px;
  right: 10px;
}
.hr {
  margin-top: 1rem;
  margin-bottom: 1rem;
  border: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
