<template>
  <b-container class="interventionModal">
    <b-row>
      <b-col cols="12" class="text-center">
        <h2 class="mb-3">Edition de l'utilisateur <b>{{ formUser.prenom }} {{ formUser.nom }}</b>
        </h2>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="4">
        <b-form-group label="Nom :" class="mb-3 mt-3">
          <b-form-input
            readonly
            aria-describedby="inputFormatterHelp"
            v-model="formUser.nom"
            type="text"/>
        </b-form-group>
        <b-form-group label="Prénom :" class="mb-3 mt-3">
          <b-form-input
            readonly
            aria-describedby="inputFormatterHelp"
            v-model="formUser.prenom"
            type="text"/>
        </b-form-group>
        <b-form-group label="Courriel :" class="mb-3 mt-3">
          <b-form-input
            readonly
            aria-describedby="inputFormatterHelp"
            v-model="formUser.mail"
            type="text"/>
        </b-form-group>
        <b-form-group 
          label="Numéro de carte professionnelle :"
          id="eapsInputGroup"
          label-for="eapsInput"
          v-if="formUser.role!=1"
          class="mb-3 mt-3">
          <b-form-input
            id="eapsInput"
            type="text"
            v-model="formUser.eaps"
            name="eaps"
            :disabled="!isAdmin()"
            key="eaps-input"/>
        </b-form-group>          
        <b-form-group 
          label="Profil :"
          class="mb-3 mt-3"> 
          <b-form-select
            v-model="role"
            :disabled="!isAdmin()"            
            :options="listeprofil"/>
        </b-form-group>
        <b-form-group v-if="renseignerstructureref()"
          label="Structure de dépendance"
          label-for="lststructureref" 
          required>
            <b-form-select 
              class="liste-deroulante"
              v-model="formUser.structurerefid"
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
        <!-- Si c'est un profil Structure ref,
            le changement de profil MN en MN AAQ entraine
            l'obligation de rentrer le formateur qui a assurer la formation
        -->
        <b-form-group 
          v-if="renseignerinstructeur()"
          label="* Instructeur ayant assuré la formation :"
          label-for="lstinstructeur" >
            <b-form-select 
              class="liste-deroulante"
              v-model="formUser.formateurid"
              :disabled="!isAdmin()"
              name="lstinstructeur"
              v-validate="{ required: true }"
              aria-describedby="lstinstructeurFeedback">
              <option :value="null">-- Choix de l'instructeur --</option>
              <option
                v-for="instructeur in listeinstructeur"
                :key="instructeur.id"
                :value="instructeur.id"
              >{{ instructeur.nom }} {{ instructeur.prenom }}</option>
            </b-form-select>
            <b-form-invalid-feedback id="lstinstructeurFeedback">Un instructeur doit être sélectionné.</b-form-invalid-feedback>
        </b-form-group>
      </b-col>
      <b-col cols="4">
        <b-form-group label="Site Web de contact :" class="mb-3 mt-3">
          <b-form-input
            v-model="formUser.sitewebcontact"
            :disabled="!isAdmin()"
            type="text"
            placeholder="http:// ou https://"/>
        </b-form-group>
        <b-form-group
          id="emailcontactInputGroup"
          label="Courriel de contact :"
          label-for="emailcontactInput"
          class="mb-3 mt-3">
          <b-form-input
            id="emailcontactInput"
            type="email"
            v-model="formUser.mailcontact"
            :disabled="!isAdmin()"
            name="mailcontact"
            key="email-input"
            aria-describedby="emailcontactFeedback"
            placeholder="Courriel contact"/>      
        </b-form-group>
        <b-form-group
          id="telephonecontactInputGroup"
          label="Telephone de contact :"
          label-for="telephonecontactInput"
          class="mb-3 mt-3">
          <b-form-input
            id="telephonecontactInput"
            type="text"
            v-model="formUser.telephonecontact"
            :disabled="!isAdmin()"
            name="telephonecontact"
            key="phone-input"
            aria-describedby="telephonecontactFeedback"
            placeholder="Telephone contact"/> 
        </b-form-group>
        <div v-if="isAdmin()">
          <hr/>
          <div class="mb-3 mt-3">
            Statut utilisateur :
            <b-form-select v-model="formUser.statut" :options="liststatus" />
          </div>
          <div class="mb-3 mt-3">
            <b-form-checkbox
              switch
              v-model="formUser.validated"
              name="check-button"
            >
              Utilisateur validé <b></b>
            </b-form-checkbox>
          </div>
        </div>        
      </b-col>
      <b-col cols="4">
        <b-form-group label="Adresse de  contact :" class="mb-3 mt-3">
          <b-form-input
            type="text"
            v-model="formUser.adrcontact"
            :disabled="!isAdmin()"/>
        </b-form-group>
        <b-form-group label="Complément d'adresse de  contact:" class="mb-3 mt-3">
          <b-form-input
            type="text"
            v-model="formUser.compadrcontact"
            :disabled="!isAdmin()"/>
        </b-form-group>
        <b-form-group id="CodePostal" label="Code Postal :" label-for="cp" class="mb-3 mt-3">
          <b-form-input
            v-model="cp"
            :disabled="!isAdmin()"
            name="codepostal"
            key="cp"
            id="cp"
            type="number"
            placeholder="CP de la commune"/>
        </b-form-group>
        <b-form-group label="Commune" label-for="lstcommune" class="mb-3 mt-3">
          <b-form-select 
            class="liste-deroulante"
            v-model="formUser.cpi_codeinsee"
            :disabled="!isAdmin()"
            name="lstcommune">     
            <option :value="null">-- Choix de la commune --</option>
            <option
              v-for="commune in listecommune"
              :key="commune.cpi_codeinsee"
              :value="commune.cpi_codeinsee"
            >{{ commune.com_libellemaj}}</option>
          </b-form-select>
        </b-form-group>
        <b-form-group id="donneleconCheckGroup" class="mb-3 mt-3">
          <b-form-checkbox-group
            v-model="formUser.donneleconsparticulieres"
            id="donneleconCheck"
            name="donneleconCheck"/>
        </b-form-group>        
        <b-form-group id="publiCheckGroup" class="mb-3 mt-3">
          <b-form-checkbox-group
            v-model="formUser.publicontact"
            id="publiCheck"
            name="publiCheck"/>
        </b-form-group>
      </b-col>
    </b-row>
    <div >
      <b-button v-if="!isAdmin()" v-on:click="$modal.hide('editUser')">Fermer</b-button>
      <b-button v-if="isAdmin()" v-on:click="$modal.hide('editUser')">Annuler</b-button>
      <b-button v-if="isAdmin()" variant="success" v-on:click="checkform">Enregistrer</b-button>
    </div>
  </b-container>
</template>
<script>
import { mapState } from "vuex"
import { loadFormUser } from "../lib/utils"
import rechercheCommune from '~/lib/mixins/rechercheCommune'

import logger from '~/plugins/logger'
const log = logger('components:user')

export default {
  mixins: [rechercheCommune],
  data() {
    return {
      cp: null,
      formUser: loadFormUser(this.$store.state.utilisateurSelectionne),
      role: null,
      listeprofil: [
        { text: "Administrateur", value: "1" },
        { text: "Instructeur AAQ", value: "3" },
        { text: "Maître Nageur AAQ", value: "4" },
        { text: "Maître Nageur", value: "5" },
        { text: "Structure de référence", value: "6" },
        { text: "Professionnel de l'hébergement touristique", value: "7" },
      ],
      liststatus: [
        { text: "Actif", value: "1" },
        { text: "Bloqué", value: "2" },
      ],
      listecommune: [
        {
          text: "Veuillez saisir un code postal",
          value: null,
          insee: null,
          cp: null,
          codedep: null
        },
      ],
      listeinstructeur: [
          {
            text: "Veuillez sélectionner un instructeur",
            value: null,
            id: null,
            nom: null,
            prenom: null,
            mail: null
        },
      ],
      disabledInstructeur: false,
      listestructureref: [
        {
          text: "Veuillez sélectionner une structure de référence",
          value: null,
          id: null,
          libellecourt: null,
          courriel: null
        },
      ],
    };
  },
  watch: {
      cp() {
        log.i('cp - saisie du CP')
        this.formUser.cp = this.cp;
        return this.rechercheCommune();
      },
      role() {
        log.i('role - Changement de Profil')
        this.formUser.role = this.role;
        this.renseignerinstructeur();
    }
  },
  computed: { 
    ...mapState(["utilisateurCourant"]) 
  },
  methods: {
    checkform() {
      log.i("checkform - In")
      const erreurformulaire = []
      let formOK = true;

      if (!this.formUser.nom) {
        erreurformulaire.push("Le nom");
        formOK = false;
      }
      if (!this.formUser.prenom) {
        erreurformulaire.push("Le prénom");
        formOK = false;
      }
      if (!this.formUser.mail) {
        erreurformulaire.push("Le mail");
        formOK = false;
      }
      /*
      // MANTIS 88061 : l'instructeur n'est plus obligatoire lors de la bascule de la valance AAQ 

      // Si on est Admin ou structure réf, on oblige la saisie de l'instructeur pour le profil MNS AAQ
      if((this.utilisateurCourant.profilId=="1" || this.utilisateurCourant.profilId=="6") && this.formUser.role =="4") {
        if (!this.formUser.formateurid) {
          erreurformulaire.push("Nom de l'instructeur obligatoire");
          formOK = false;
        }
      }
      */
      // Si on est Admin et que l'on change le profil de l'utilisateur pour le
      // passer en Instructeur AAQ, alors on oblige la saisie de la structure
      // de rattachement
      if(this.utilisateurCourant.profilId=="1" && (this.formUser.role =="3" || this.formUser.role =="6")) {
        if(!this.formUser.structurerefid) {
          erreurformulaire.push("Structure de dépendance obligatoire");
          formOK = false;        
        }
      }
      
      if (!formOK) {
        log.d("Formulaire invalide KO ", erreurformulaire);
        return this.$toast.error(erreurformulaire)
      } else {
        return this.editUtilisateur()
      }
    },
    editUtilisateur() {
      log.i('editUtilisateur - In', { role: this.formUser.role, disabledInstructeur: this.disabledInstructeur })
      if(this.formUser.role === "4" && !this.disabledInstructeur) {
        // Si on est Admin, Instructeur ou structure de référence, le changement de profil engendre la validation de la demande.
        if(this.utilisateurCourant.profilId=="1" || this.utilisateurCourant.profilId=="6" || this.utilisateurCourant.profilId=="3") {
          const url = process.env.API_URL + "/demandeaaq?demandeurid=" + this.formUser.id
          this.$axios.$get(url)
            .then( ({ demandesAaq }) => {
                log.d('editUtilisateur - response for demande', demandesAaq)
                let demandeaaq = demandesAaq[0]
                // Mise à jour du formateur si c'est fait par l'admin ou par la structure référente
                if(demandesAaq && (this.utilisateurCourant.profilId=="6" || this.utilisateurCourant.profilId=="1")) {
                  log.d('editUtilisateur - need to update demand for user')
                  // Lorsque c'est une structure référente qui fait la modification, alors l'id du formateur est mis à jour
                  // Sinon le formateur avait été choisi par le Maitre Nageur lors de la demande
                  demandeaaq['dem_uti_formateur_id'] = this.formUser.formateurid
                }
                if(demandesAaq) {
                  const url = process.env.API_URL + '/demandeaaq/accord'
                  return this.$axios.$put(url, {demandeaaq})                
                }
            })
            .catch(error => {
              log.d("Une erreur est survenue lors de la vérification de la présence d'une demande AAQ",error);
              return this.$toast.error("Une erreur est survenue lors de la vérification de la présence d'une demande AAQ")
            });
        }
      }
       // Mise à jour de l'utilisateur
      return this.$store.dispatch("put_user", this.formUser)
        .then(() => {
          log.i('editUtilisateur - Done')
          this.$modal.hide("editUser")
          return this.$toast.success(`L'utilisateur ${this.formUser.prenom} ${this.formUser.nom} a été mis à jour`)
        })
        .catch((error) => {
          log.d('editUtilisateur - Une erreur est survenue lors de la mise à jour de l\'utilisateur', error)
          return this.$toast.error('Une erreur est survenue lors de la mise à jour de l\'utilisateur')
        })
    },
    isAdmin() {
      return this.utilisateurCourant && this.utilisateurCourant.profilId=="1"
    },
    renseignerinstructeur() {
      return (this.utilisateurCourant.profilId=="1" || this.utilisateurCourant.profilId=="6") && this.formUser.role =="4"
    },
    // Recherche s'il faut faire apparaitre le fait de saisir une structure de référence
    renseignerstructureref() {
      return this.utilisateurCourant.profilId=="1" && (this.formUser.role =="3" || this.formUser.role =="6")
    }, 
    rechercheinstructeurs() {
      log.i('rechercheinstructeurs - In')
      if(this.utilisateurCourant.profilId=="1" || this.utilisateurCourant.profilId=="6") {
        // Lance la recherche sur la liste des formateurs 
        //const url = process.env.API_URL + "/user/liste/3"
        log.d('User sélectionné : ',  this.formUser.id)
        const url = process.env.API_URL + "/user/instructeurstructure/" + this.formUser.id
        return this.$axios.$get(url)
          .then(response => {
            log.i('rechercheinstructeurs - Done')
            return this.listeinstructeur = response.users;
          })
          .catch(error => {
            log.w('rechercheinstructeurs -', error)
            return this.$toast.error("Une erreur est survenue lors de la récupération des instructeurs")
        });
      }
    },
    recherchestructureref() {
      log.i('recherchestructureref - In')
      // Lance la recherche sur la liste des formateurs 
      const url = process.env.API_URL + "/structureref/liste/"
      return this.$axios.$get(url)
        .then(response => {
          log.i('recherchestructureref - Done')
          return this.listestructureref = response.structureref;
        })
        .catch(error => {
          log.i('recherchestructureref -', { error })
          return this.$toast.error("Une erreur est survenue lors de la récupération des structures de référence")
        });
    },  
    isProfilModifiable() {
      // Une fois passé en MN AAQ, l'instructeur ou la structure n'a plus possibilité de retiré l'information
      //return Boolean((this.utilisateurCourant.profilId == "1" || this.utilisateurCourant.profilId == "3" || this.utilisateurCourant.profilId == "6") && this.formUser.role == "4");
      return Boolean((this.utilisateurCourant.profilId == "3" || this.utilisateurCourant.profilId == "6") && this.formUser.role == "4");
    },     
  },
  async mounted() {
    log.i('mounted - In')
    // Suppression du recharhgement users, je ne sais pas pourqui il est présent ici, il ne sert à rien visiblement, d'autant qu'il s'agit de la liste des users
    //await this.$store.dispatch("get_users");
    if (this.formUser.role == 4) {
      this.disabledInstructeur = true
    }
    await this.rechercheinstructeurs();
    // Chargement de la liste des structures de référence
    await this.recherchestructureref() 
    this.role = this.formUser.role;
    if (!this.isAdmin()) {
      // On supprimes les possibilités de profils si on n'est pas Admin
      // On retire les deux premiers éléments en position 0
      this.listeprofil.splice(0, 2);
      // On retire un élément en position 2
      this.listeprofil.splice(2, 1);
      // Il doit rester MN et MN AAQ 
    }
    if(this.formUser.cp) {
      // Recopie du CP dans le champ code postal
      this.cp = this.formUser.cp
      // Recherche de la liste des commune
      this.rechercheCommune()
    }
  }
};
</script>

<style>
.interventionModal {
  padding: 30px;
}
.modal-btns {
  position: relative;
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
