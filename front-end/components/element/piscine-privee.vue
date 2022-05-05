<template>
  <b-container class="piscineModal p-5">
    <b-col cols="12" class="text-center mb-3" v-if="!this.maPiscine">
      <h2>Ajout d'une piscine</h2>
    </b-col>
    <b-col cols="12" class="text-center mb-3" v-else>
      <h2>Edition d'une piscine existante</h2>
    </b-col>
    <b-row v-if="!this.maPiscine &&!boolSiren && !boolSiret">
      <b-col cols="9">
        <b-form-group label="Numéro SIREN ou SIRET :" label-for="siren">
          <b-form-input
            aria-describedby="sirenFeedback"
            name="siren"
            id="siren"
            v-model="siret"
            type="text"
            v-validate="{ required: true, regex: /(^[0-9]{9}$)|(^[0-9]{14}$)/ }"
            :state="validateState('siren')"
          />
          <b-form-invalid-feedback id="sirenFeedback"
            >Le SIREN ou SIRET est obligatoire et doit être composé de 9 ou 14
            chiffres</b-form-invalid-feedback
          >
        </b-form-group>
      </b-col>
      <b-col cols="3">
        <b-button
          variant="success"
          style="margin-top: 30px"
          v-on:click="recherchesiret"
          >Rechercher</b-button
        >
      </b-col>
    </b-row>
    <div v-if="boolSiren">
      <b-form-group
        id="etab"
        label="Liste des établissements :"
        label-for="etabSelect"
      >
        <b-form-select
          name="etabSelect"
          key="etab"
          v-model="etab"
          id="etabSelect"
          aria-describedby="etabFeedback"
          v-validate="{ required: true }"
          :state="validateState('etabSelect')"
        >
          <b-form-invalid-feedback id="etabFeedback"
            >Vous devez sélectionner un établissement</b-form-invalid-feedback
          >
          <option v-for="etab in listeEtab" :key="etab.siret" :value="etab">
            {{ etab.siret + " - " + etab.nom + " - " + etab.adresse }}
          </option>
        </b-form-select>
      </b-form-group>
      <b-form-group v-if="etab">
        <b-row>
        <b-col cols="4">
          nom :<b-form-input v-model="etab.nom" type="text"></b-form-input>
        </b-col>
        <b-col cols="4">
          adresse :<b-form-input
            v-model="etab.adresseRue"
            type="text"
          ></b-form-input>
        </b-col>
        <b-col cols="2">
          CP :<b-form-input
            v-model="etab.cp"
            type="text"
          ></b-form-input>
        </b-col>
        <b-col cols="2">
          Ville :<b-form-select v-model="codeinsee">
            <option
              v-for="com in listecommunes"
              :key="com.com_id"
              :value="com.cpi_codeinsee">
              {{com.com_libelle}}
            </option>
          ></b-form-select>
        </b-col>
      </b-row>
      </b-form-group>
    </div>
    <div class="mb-3 mt-3" v-if="boolSiret || this.maPiscine">
      <b-form-group v-if="etab">
        <b-row>
        <b-col cols="4">
          nom :<b-form-input v-model="etab.nom" type="text"></b-form-input>
        </b-col>
        <b-col cols="4">
          adresse :<b-form-input
            v-model="etab.adresseRue"
            type="text"
          ></b-form-input>
        </b-col>
        <b-col cols="2">
          CP :<b-form-input
            v-model="etab.cp"
            type="text"
          ></b-form-input>
        </b-col>
        <b-col cols="2">
          Ville :
          <b-form-select 
            v-model="codeinsee"
            id ="villeInput"
              name="villeInput"
              key="ville-input"
              aria-describedby="villeFeedback"
              v-validate="{ required: true }"
              :state="validateState('villeInput')"
              placeholder="Courriel contact"
              >
        
            <option
              v-for="com in listecommunes"
              :key="com.com_id"
              :value="com.cpi_codeinsee">
              {{com.com_libelle}}
            </option>
          </b-form-select>
          <b-form-invalid-feedback id="villeFeedback"
                >A renseigner.</b-form-invalid-feedback
              >
        </b-col>
      </b-row>
      </b-form-group>
    </div>
    <div v-if="boolSiren || boolSiret || this.maPiscine">
      <b-form>
        <b-row>
          <b-col cols="6">
            <b-form-group
              id="emailcontactInputGroup"
              label="Courriel de contact :"
              label-for="emailcontactInput"
            >
              <b-form-input
                id="emailcontactInput"
                type="email"
                v-model="complement.mailcontact"
                name="emailcontactInput"
                key="email-input"
                aria-describedby="emailcontactFeedback"
                v-validate="{ required: true, email: true }"
                :state="validateState('emailcontactInput')"
                placeholder="Courriel contact"
              />
              <b-form-invalid-feedback id="emailcontactFeedback"
                >L'email est obligatoire et doit avoir un format
                valide.</b-form-invalid-feedback
              >
            </b-form-group>
          </b-col>
          <b-col cols="6">
            <b-form-group
              id="nbBassinInputGroup"
              label="Nombre de bassins :"
              label-for="nbBassinInput"
            >
              <b-form-input
                id="nbBassinInput"
                v-model="complement.bassins"
                name="nbBassinInput"
                aria-describedby="nbBassinFeedback"
                v-validate="{ required: true, digits: 1 }"
                :state="validateState('nbBassinInput')"
                placeholder="Nombre de bassins"
              />
              <b-form-invalid-feedback id="nbBassinFeedback"
                >Le nombre de bassin doit être en entier compris entre 1 et 9</b-form-invalid-feedback
              >
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="6">
            <b-form-group label="Site Web de contact :">
              <b-form-input
                id="siteInput"
                name="siteInput"
                v-model="complement.sitewebcontact"
                placeholder="http:// ou https://"
                aria-describedby="siteFeedback"
                v-validate="{ required: false, max: 50 }"
                :state="validateState('siteInput')"
              />
              <b-form-invalid-feedback id="siteFeedback"
                >Le site web ne peut pas faire plus de 50
                caractères.</b-form-invalid-feedback
              >
            </b-form-group>
          </b-col>
          <b-col cols="6">
            <b-form-group
              id="telephonecontactInputGroup"
              label="Telephone de contact :"
              label-for="telephonecontactInput"
            >
              <b-form-input
                id="telephonecontact"
                type="text"
                v-model="complement.telephonecontact"
                name="telephonecontact"
                key="phone-input"
                aria-describedby="telephonecontactFeedback"
                placeholder="Telephone contact"
                v-validate="{
                  required: false,
                  regex: /(^\+33[0-9]{9}$)|(^0[0-9]{9}$)/,
                }"
                :state="validateState('telephonecontact')"
              />
              <b-form-invalid-feedback id="telephonecontactFeedback"
                >Le Numéro de téléphone n'est pas
                conforme</b-form-invalid-feedback
              >
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="6">
            <b-form-group label="Ouverte toute l'année :">
              <b-form-radio-group v-model="complement.ouvertureannuelle">
                <b-form-radio name="ouvertureAnnuelle" value=true>Oui</b-form-radio>
                <b-form-radio name="ouvertureAnnuelle" value=false>Non</b-form-radio>
              </b-form-radio-group>
            </b-form-group>
          </b-col>
          <b-col cols="6">
             <b-form-group label="Précisions sur les périodes d'ouverture :" >
              <b-form-input  
                v-model="complement.dateouverture"
                type="text"
                id="ouvertureInput"
                name="ouvertureInput"
                aria-describedby="ouvertureFeedback"
                v-validate="{ required: false, max: 100 }"
                :state="validateState('ouvertureInput')"
                placeholder="exemple : du Lundi au Samedi : 9h - 19h"
              />
              <b-form-invalid-feedback id="ouvertureFeedback"
                >Ce champs ne peut pas faire plus de 100
                caractères.</b-form-invalid-feedback
              >
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="6">
            <b-form-group label="Dimensions "
            :id="randomIdBis"
            style="cursor: pointer"
            >
          <b-popover :target="randomIdBis" triggers="hover focus">
            Précisez la dimension (m) de tous les bassins.<br><i>exemple : </i>4 x 10,2 x 5
          </b-popover>
              <b-form-input
                v-model="complement.dimension"
                type="text"
                placeholder="exemple : 5*20"
                id="dimensionInput"
                name="dimensionInput"
                aria-describedby="dimensionFeedback"
                v-validate="{ required: false, max: 50 }"
                :state="validateState('dimensionInput')"
              />
              <b-form-invalid-feedback id="dimensionFeedback"
                >Ce champ ne peut pas faire plus de 50 caractères.
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
          <b-col cols="6">
            <b-form-group label="Profondeur maximale:" :id="randomId"
            style="cursor: pointer"
            >
          <b-popover :target="randomId" triggers="hover focus">
            Précisez la profondeur maximale (cm) de tous les bassins.<br><i>exemple : 120, 300</i>
          </b-popover>
              <b-form-input
                v-model="complement.profondeur"
                type="text"
                id="profondeurInput"
                name="profondeurInput"
                aria-describedby="profondeurFeedback"
                v-validate="{ required: false, max: 50 }"
                :state="validateState('profondeurInput')"
                placeholder="exemple : 60-250"
              />
              <b-form-invalid-feedback id="ouvertureFeedback"
                >Ce champ ne peut pas faire plus de 50 caractères.
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="6">
            <b-form-group label="Eau chauffée :">
              <b-form-radio-group v-model="complement.chauffage">
                <b-form-radio name="eauChauffe" value=true>Oui</b-form-radio>
                <b-form-radio name="eauChauffe" value=false>Non</b-form-radio>
              </b-form-radio-group>
            </b-form-group>
          </b-col>
          <b-col cols="6">
            <b-form-group label="Type de couverture :" >
              <b-form-radio-group
                id="typecouverture"
                v-model="complement.type"
                :options="typeCouverture"
                name="typecouverture"
              >
              </b-form-radio-group>
            </b-form-group>
          </b-col>
        </b-row>
        <b-form-group label="Divers:">
          <b-row>
            <b-col cols="6">
              <b-form-checkbox
                id="checkbox-parking"
                v-model="complement.parking"
                >Parking accessible aux bus</b-form-checkbox
              >
            </b-col>
            <b-col cols="6">
              <b-form-checkbox
                id="checkbox-vestiaire"
                v-model="complement.vestiaire"
                >Vestiaires</b-form-checkbox
              >
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="6">
              <b-form-checkbox
                id="checkbox-toilettes"
                v-model="complement.toilettes"
                >Toilettes</b-form-checkbox
              >
            </b-col>
            <b-col cols="6">
              <b-form-checkbox id="checkbox-salles" v-model="complement.salles"
                >Salles</b-form-checkbox
              >
            </b-col>
          </b-row>
        </b-form-group>
      </b-form>
      <b-row>
        <b-col cols="4" :offset="this.offset">
          <b-button v-on:click="cancel">Annuler</b-button>
          <b-button
            v-if="!this.maPiscine"
            variant="success"
            v-on:click="addPiscine"
            >Ajouter</b-button
          >
          <b-button v-else variant="success" v-on:click="updatePiscine(maPiscine.id)"
            >Modifier</b-button
          >
        </b-col>
      </b-row>
    </div>
  </b-container>
</template>
<script>
import logger from "~/plugins/logger";
const log = logger("components:element:piscine-privee");
import rechercheCommune from '~/lib/mixins/rechercheCommune'

const loadEtab = function (piscine) {
  log.i("loadEtab - In");
  const etab = {
    nom: piscine ? piscine.nom : null,
    adresseRue: piscine ? piscine.adresse : null,
    cp: piscine ? piscine.cp : null,
    codeinsee: piscine ? piscine.codeinsee : null,
    libelleCommune: piscine ? piscine.libelle : null
  };
  return etab;
};
const loadComplement = function (piscine,userMail) {
  log.i("loadComplement - In");
  const complement = {
    sitewebcontact: piscine ? piscine.sitewebcontact : null,
    bassins: piscine ? piscine.bassins : 1,
    telephonecontact: piscine ? piscine.telephonecontact : null,
    mailcontact: piscine ? piscine.mailcontact : userMail,
    dateouverture: piscine ? piscine.dateouverture : null,
    profondeur: piscine ? piscine.profondeur : null,
    dimension: piscine ? piscine.dimension : null,
    type: piscine ? piscine.type : 'Hybride',
    ouvertureannuelle: piscine ? piscine.ouvertureannuelle : true,
    chauffage: piscine ? piscine.chauffage : false,
    vestiaire: piscine ? piscine.vestiaire : false,
    toilettes: piscine ? piscine.toilettes : false,
    salles: piscine ? piscine.salles : false,
    parking: piscine ? piscine.parking : false,
  };
  return complement;
};

export default {
  mixins: [rechercheCommune],
  props: {
    maPiscine: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      offset: 8,
      cp: null,
      boolSiren: false,
      boolSiret: false,
      etab: loadEtab(this.maPiscine),
      siret: null,
      complement: loadComplement(this.maPiscine,this.$store.state.utilisateurCourant.mail),
      typeCouverture: ["Couverte", "Hybride", "Extérieure"],
      listecommunes: [],
      codeinsee: null,
      // Nécessaire pour le fonctionnement des popovers quand plusieurs composants intervention sont sur la page
      randomId: "popover-" + Math.floor(Math.random() * 100000),
      randomIdBis: "popover-" + Math.floor(Math.random() * 100000),
    };
  },
  mounted() {
    if (this.etab.cp) {this.rechercheListeCommunes(this.etab.cp)}
  },
  watch: {
    "etab.cp" () {
      if (this.etab.cp.length === 5) {
        this.rechercheListeCommunes(this.etab.cp)
      }
      else {
        this.codeinsee=null;
      }
    }
  },
  methods: {
    rechercheListeCommunes : async function (codepostal) {
        this.cp = codepostal
        const reponse = await this.rechercheCommune()
        this.listecommunes = reponse
        this.codeinsee= this.etab.codeinsee
    },
    addPiscine: async function () {
      log.i("addPiscine - In");
      if (this.complement.bassins == '') {this.complement.bassins = 0 }
      this.$validator.validateAll().then(async (isValid) => {
        if (
          this.etab.nom &&
          this.etab.adresse &&
          this.etab.nom.length > 2 &&
          this.etab.adresse.length > 5 &&
          this.codeinsee
        ) {
          const url = process.env.API_URL + "/piscine/privee/";
          let piscineCreee = await this.$axios.$post(url, {
            nom: this.etab.nom,
            adresse: this.etab.adresseRue,
            cp: this.codeinsee,
            piscine_privee: true,
          
            complement: this.complement,
          });
          if (piscineCreee) {
            log.i("addpiscine - Done");
            this.offset = 6;
            this.selectedPiscine = piscineCreee.maPiscine;
          } else {
            log.w("addpiscine - error", error);
            return this.$toast.error(
              "Une erreur est survenue lors de la sauvegarde de la piscine"
            );
          }
        } else {
          return this.$toast.error(
            `veuillez renseigner tous les champs obligatoires`
          );
        }
        return this.$store
          .dispatch("post_maPiscine", this.selectedPiscine)
          .then(async (piscine) => {
            log.i("addPiscine - Done", { piscine });
            await this.$store.dispatch("get_mesPiscines");
            await this.$store.dispatch(
              "get_maPiscine",
              this.selectedPiscine.id
            );
            this.$modal.hide("newPiscine");
            return this.$toast.success(
              `${this.selectedPiscine.nom} ajoutée aux piscines déclarées`
            );
          })
          .catch((error) => {
            log.w("addPiscine - Error", error);
            return this.$toast.error(
              `${this.selectedPiscine.nom} n'a pas pu être ajoutée aux piscines déclarées`
            );
          });
      });
    },
    updatePiscine: async function (id) {
      log.i("updatePiscine - In");
      this.$validator.validateAll().then(async (isValid) => {
        if (
          this.etab.nom &&
          this.etab.adresseRue &&
          this.etab.nom.length > 2 &&
          this.etab.adresseRue.length > 5 &&
          this.codeinsee
        ) {
          if (this.complement.bassins == '') {this.complement.bassins = 0 }
          const url = process.env.API_URL + "/piscine/privee/" + id;
          let piscineCreee = await this.$axios.$put(url, {
            nom: this.etab.nom,
            adresse: this.etab.adresseRue,
            cp: this.codeinsee,
            piscine_privee: true,
            complement: this.complement,
          });
          if (piscineCreee) {
            log.i("updatepiscine - Done");
            this.offset = 6;
            this.selectedPiscine = piscineCreee.maPiscine;
          } else {
            log.w("addpiscine - error", error);
            return this.$toast.error(
              "Une erreur est survenue lors de la MAJ de la piscine"
            );
          }
        } else {
          return this.$toast.error(
            `veuillez renseigner tous les champs obligatoires`
          );
        }
        return this.$store.dispatch("get_mesPiscines")
            .then( () => {
              this.$modal.hide("newPiscine");
              return this.$toast.success(
              `${this.selectedPiscine.nom} a été modifiée`
            );
            })
          })
          .catch((error) => {
            log.w("updatePiscine - Error", error);
            return this.$toast.error(
              `${this.selectedPiscine.nom} n'a pas pu être modifiée`
            );
      });
    },
    recherchesiret: function () {
      log.i("recherchesiret - In");
      this.$validator.validateAll().then(async (isValid) => {
        if (this.siret.length === 14) {
          log.d("recherchesiret - Search on siret");
          this.boolSiren = false;
          const url = process.env.API_URL + "/insee/siret/" + this.siret;
          return this.$axios
            .$get(url)
            .then(({ structure }) => {
              log.i("recherchesiret - siret - Done");
              this.boolSiret = true;
              this.etab = structure;
            })
            .catch((error) => {
              log.w("recherchesiret - Error on siret", error);
              return this.$toast.error(
                "Une erreur est survenue lors de la recherche du SIRET"
              );
            });
        }
        if (this.siret.length === 9) {
          log.d("recherchesiret - Search on siren");
          this.boolSiret = false;
          const url = process.env.API_URL + "/insee/siren/" + this.siret;
          return this.$axios
            .$get(url)
            .then((response) => {
              log.i("recherchesiret - siren - Done");
              this.boolSiren = true;
              this.listeEtab = response.etablissements;
            })
            .catch((error) => {
              log.w("recherchesiret - Error on siren", error);
              return this.$toast.error(
                "Une erreur est survenue lors de la recherche du SIREN"
              );
            });
        }
      });
    },
    cancel: function () {
      if (this.dansInt) {
        this.$modal.hide("editPiscine");
      } else {
        this.$modal.hide("newPiscine");
      }
    },
    validateState(ref) {
      if (!this.veeFields) {
        return null;
      }
      if (
        this.veeFields[ref] &&
        (this.veeFields[ref].dirty || this.veeFields[ref].validated)
      ) {
        return !this.errors.has(ref);
      }

      return null;
    },
  },
};
</script>
<style>
p {
  font-size: 1em;
}
</style>