<template>
  <b-container class="structureModal p-5">
    <b-col cols="12" class="text-center">
      <h2 class="mb-3">Sélection d'une structure</h2>
    </b-col>
    <b-row>
      <b-col cols="12">
        <b-form-group label="Structure :">
          <b-form-select v-model="selectedStructure">
            <option :value="null">-- Choix de la Structure --</option>
            <option
              v-for="stru in listeStructure"
              :key="stru.type"
              :value="stru.type">
              {{ stru.nom }}
            </option>
          </b-form-select>
        </b-form-group>
        <div v-if="selectedStructure == 1">
          <b-form-group
            required
            id="typeCollectivite"
            label="Type de collectivité territoriale :"
            label-for="typeCollectiviteSelect">
            <b-form-select id="typeCollectiviteSelect" v-model="typeCollectivite">
              <option
                v-for="type in listtypecol"
                :key="type.value"
                :value="type.value"
              >
                {{ type.text }}
              </option>
            </b-form-select>
          </b-form-group>
          <!-- DEPARTEMENT -->
          <div v-if="typeCollectivite == 2">
            <b-form-group
              id="Departement"
              label="Département :"
              required
              label-for="departementSelect"
            >
              <b-form-select
                id="departementSelect"
                v-model="collectivite"
                name="departement"
              >
                <option
                  v-for="departement in listdepartement"
                  :key="departement.dep_num"
                  :value="departement"
                >
                  {{ departement.dep_libelle }}
                </option>
              </b-form-select>
            </b-form-group>
          </div>
          <!-- COMMUNE-->
          <div v-if="typeCollectivite == 1">
            <b-form-group id="CodePostal" label="Code Postal :" label-for="cp">
              <b-form-input
                v-model="cp"
                name="cp"
                key="cp"
                id="cp"
                type="number"
                placeholder="CP de la commune"
              />
            </b-form-group>
            <b-form-group
              id="Commune"
              label="Commune :"
              required
              label-for="communeInput">
              <b-form-select
                name="commune"
                key="commune"
                type="text"
                v-model="collectivite"
                id="communeSelect"
              >
                <option :value="null">-- Choix de la commune --</option>
                <option
                  v-for="commune in listecommune"
                  :key="commune.cpi_codeinsee"
                  :value="commune"
                >
                  {{ commune.com_libellemaj }}
                </option>
              </b-form-select>
            </b-form-group>
          </div>
          <!--EPCI -->
          <div v-if="typeCollectivite == 3">
            <b-form-group
              id="CodePostalEpci"
              label="Code Postal EPCI:"
              label-for="cpEpci">
              <b-form-input
                v-model="cpEpci"
                name="cpEpci"
                key="cpEpci"
                id="cpEpci"
                type="number"
                placeholder="CP d'une des communes de l'EPCI"
              />
            </b-form-group>
            <div v-if="boolEpci == true">
              <b-form-group id="ECPI" label="EPCI :" label-for="epciInput">
                <b-form-select id="epciSelect" v-model="collectivite" name="epcis">
                  <option
                    v-for="epci in listepci"
                    :key="epci.epci_code"
                    :value="epci"
                  >
                    {{ epci.epci_libelle }}
                  </option>
                </b-form-select>
              </b-form-group>
            </div>
            <b-form-group v-if="boolEpci == false">Aucun EPCI correspondant</b-form-group>
          </div>
        </div>
        <b-row class="mb-3 mt-3" align-v="end" v-if="selectedStructure == 2">
          <b-col cols="9">
            Numéro SIREN ou SIRET :
            <b-form-input
              aria-describedby="inputFormatterHelp"
              v-model="siret"
              type="text" />
          </b-col>
          <b-col cols="3">
            <b-button variant="success" v-on:click="recherchesiret">Rechercher</b-button>
          </b-col>
        </b-row>
        <div v-if="boolSiren && selectedStructure == 2">
          <b-form-group id="etab" label="Liste des établissements :">
            <b-form-select
              name="etab"
              key="etab"
              type="text"
              v-model="etab"
              id="etabSelect"
            >
              <option v-for="etab in listeEtab" :key="etab.siret" :value="etab">
                {{ etab.siret + " - " + etab.nom + " - " + etab.adresse }}
              </option>
            </b-form-select>
          </b-form-group>
        </div>
        <div class="mb-3 mt-3" v-if="boolSiret && selectedStructure == 2">
          nom :
          <b-form-input v-model="etab.nom" type="text"></b-form-input>
          adresse :
          <b-form-input v-model="etab.adresse" type="text"></b-form-input>
        </div>
        <b-row class="mb-3 mt-3" align-v="end" v-if="selectedStructure == 3">
          <b-col>
            Numéro UAI ou code postal :
            <b-form-input
              aria-describedby="inputFormatterHelp"
              v-model="uai"
              type="text"
            ></b-form-input>
          </b-col>
          <b-col>
              <b-button variant="success" v-on:click="rechercheEcole">Rechercher</b-button>
          </b-col>
        </b-row>
        <div v-if="boolEcoleCP && selectedStructure == 3">
          <b-form-group id="etab" label="Liste des établissements :">
            <b-form-select
              name="ecoles"
              key="ecoles"
              type="text"
              v-model="etab"
              id="ecoleSelect">
              <option v-for="ecole in listeEtab" :key="ecole.uai" :value="ecole">
                {{ ecole.nom + " - " + ecole.adresse + " - " + ecole.adresse + " " + ecole.cp + " " + ecole.libelleCommune }}
              </option>
            </b-form-select>
          </b-form-group>
        </div>
        <div class="mb-3 mt-3" v-if="boolUAI && selectedStructure == 3">
          nom :
          <b-form-input v-model="etab.nom" type="text"></b-form-input>
          adresse :
          <b-form-input v-model="etab.adresse" type="text"></b-form-input>
        </div>
      </b-col>
    </b-row>
    <div class="modal-btns">
      <b-button v-on:click="cancel">Annuler</b-button>
      <b-button variant="success" v-on:click="addStructure">Ajouter</b-button>
    </div>
  </b-container>
</template>
<script>
import rechercheCommune from '~/lib/mixins/rechercheCommune'

import logger from '~/plugins/logger'
const log = logger('components:element:structure')

export default {
  props: {
    intervention: {
      type: Object,
      default: () => {
        return {};
      },
    },
    listeStructuresAffichees: {
      type: Array,
      default: () => {
        return [];
      },
    },
    
    dansInt: {
      type: Boolean,
      default: false,
    }
  },
  mixins: [rechercheCommune],
  data() {
    return {
      cp: null,
      cpEpci: null,
      siret: null,
      selectedStructure: null,
      etab: {},
      uai: null,
      listeStructure: [
        { type: 1, nom: "collectivites territoriales" },
        { type: 2, nom: "Clubs / Associations / ligues" },
        { type: 3, nom: "Ecoles" },
      ],
      typeCollectivite: null,
      collectivite: null,
      listtypecol: [
        { text: "Commune", value: 1 },
        { text: "Conseil Général", value: 2 },
        { text: "EPCI", value: 3 },
      ],
      listecommune: [
        {
          text: "Veuillez saisir un code postal",
          value: null,
          insee: null,
          cp: null,
          codedep: null,
        },
      ],
      listeEtab: [
        {
          siret: null,
          nom: null,
          commune: null,
          adresse: null,
        },
      ],
      boolEpci: false,
      boolSiret: false,
      boolSiren: false,
      boolEcoleCP: false,
      boolUAI: false,
    };
  },
  watch: {
    cp() {
      this.rechercheCommune();
    },
    cpEpci() {
      this.rechercheepci();
    },
    selectedStructure() {
      this.boolEpci = false;
      this.boolSiret = false;
      this.boolUAI = false;
      this.boolEcoleCP = false;
      this.siret = null;
      this.typeCollectivite = null;
      (this.cp = null), (this.cpEpci = null);
    },
  },
  methods: {
    getDepartements: function () {
      log.i('getDepartements - In')
      const url = process.env.API_URL + "/listedepartement";
      return this.$axios.$get(url)
        .then(({ departements}) => {
          log.i('getDepartements - Done')
          return this.listdepartement = departements
        })
        .catch((error) => {
          log.i('getDepartements - Error', error)
          return this.$toast.error('Une erreur est survenue lors de la récupération des départements')
        })
    },
    rechercheepci: function () {
      log.i('rechercheepci - In')
      if (this.cpEpci && this.cpEpci.length === 5) {
        // Le code postal fait bien 5 caractères
        const url = process.env.API_URL + "/listepci?codepostal=" + this.cpEpci;
        return this.$axios.$get(url)
          .then((response) => {
            log.i('rechercheepci - Done')
            if (response.epci.length == 0) {
              this.boolEpci = false;
            } else {
              this.boolEpci = true;
              this.listepci = response.epci;
            }
          })
          .catch((error) => {
            log.i('rechercheepci - Error', error)
            return this.$toast.error('Une erreur est survenue lors de la récupération des EPCI')
          })
      } else {
        // On vide la liste car le code postal a changé
        this.listepci = ["Veuillez saisir un code postal"];
        this.boolEpci = false;
        return Promise.resolve(null);
      }
    },
    recherchesiret: function () {
      log.i('recherchesiret - In')
      if (this.siret && this.siret.length === 14) {
        log.d('recherchesiret - Search on siret')
        this.boolSiren = false;
        const url = process.env.API_URL + "/insee/siret/" + this.siret;
        return this.$axios.$get(url)
          .then(({ structure }) => {
            log.i('recherchesiret - siret - Done')
            this.boolSiret = true;
            this.etab = structure;
          })
          .catch((error) => {
            log.w('recherchesiret - Error on siret', error)
            return this.$toast.error('Une erreur est survenue lors de la recherche du SIRET')
          });
      }
      if (this.siret && this.siret.length === 9) {
        log.d('recherchesiret - Search on siren')
        this.boolSiret = false;
        const url = process.env.API_URL + "/insee/siren/" + this.siret;
        return this.$axios.$get(url)
          .then((response) => {
            log.i('recherchesiret - siren - Done')
            this.boolSiren = true;
            this.listeEtab = response.etablissements;
          })
          .catch((error) => {
            log.w('recherchesiret - Error on siren', error)
            return this.$toast.error('Une erreur est survenue lors de la recherche du SIREN')
          });
      }
    },
    rechercheEcole: function () {
      if (this.uai && this.uai.length === 5) {
        log.i('rechercheEcole - CP - In')
        this.boolEcoleCP = true;
        const url = process.env.API_URL + "/ecole/cp/" + this.uai;
        return this.$axios.$get(url)
          .then(({ etablissements }) => {
            log.i('rechercheEcole - CP - Done')
            this.boolEcoleCP = true;
            this.listeEtab = etablissements;
          })
          .catch((error) => {
            log.w('rechercheEcole - CP - Error', error)
            return this.$toast.error('Une erreur est survenue lors de la recherche de l\'école par CP')
          });
      }
      if (this.uai && this.uai.length === 8) {
        this.boolUAI = true;
        log.i('rechercheEcole - UAI - In')
        const url = process.env.API_URL + "/ecole/uai/" + this.uai;
        return this.$axios.$get(url)
          .then(({ ecole }) => {
            log.i('rechercheEcole - UAI - Done')
            this.etab = ecole;
          })
          .catch((error) => {
            log.w('rechercheEcole - UAI - Error', error)
            return this.$toast.error('Une erreur est survenue lors de la recherche de l\'école par UAI')
          });
      }
      if (this.uai && this.uai.length != 8 && this.uai.length != 5) {
        return this.$toast.error(`L'UAI ou code postal saisit n'est pas au bon format'`)
      }
    },
    addStructure: async function () {
      log.i('addStructure - In')
      let structure = {
        id: null,
        code: null,
        nom: null,
        type: this.selectedStructure,
        soustype: null,
        commune: null,
        adresse: null,
        actif: true,
      };
      switch (this.selectedStructure) {
        case 1:
          structure.soustype = this.typeCollectivite;
          switch (structure.soustype) {
            case 1:
              structure.nom = 'Commune - ' +this.collectivite.com_libelle;
              structure.code = this.collectivite.cpi_codeinsee;
              structure.commune = this.collectivite.cpi_codeinsee;
              break;
            case 2:
              structure.nom = 'Conseil Général - '+this.collectivite.dep_libelle;
              structure.code = this.collectivite.dep_num;
              break;
            case 3:
              structure.nom = 'EPCI - ' +this.collectivite.epci_libelle;
              structure.code = this.collectivite.epci_code;
              break;
          }
          break;
        case 2:
          structure.nom = this.etab.nom;
          structure.code = this.etab.siret;
          structure.commune = this.etab.commune;
          structure.adresse = this.etab.adresse;
          structure.soustype = this.etab.activite;
          break;
        case 3:
          structure.nom = this.etab.nom;
          structure.code = this.etab.uai;
          structure.commune = this.etab.commune;
          structure.adresse =
            this.etab.adresse +
            " " +
            this.etab.cp +
            " " +
            this.etab.libelleCommune;
          structure.soustype = this.etab.type_libe;
          break;
      }
      
      return this.$store.dispatch("post_structure", [structure, this.$store.state.utilisateurCourant.id])
        .then((structure) => {
          log.i('addStructure - Done')
          this.$store.dispatch("get_structureByUser", this.$store.state.utilisateurCourant.id)
          this.$toast.success(`${structure.nom} ajoutée aux structures favorites`)
          if (this.dansInt) {
            this.intervention.structure = structure
            this.listeStructuresAffichees.push(structure)
          }
          this.$modal.hide("editStructure")      
        })
        .catch((error) => {
          log.w('addStructure - Error', error)
          this.$modal.hide("editStructure");
          return this.$toast.error('Une erreur est survenue lors de l\'ajout de la structure')
        });
    },
    cancel: function () {
      if (this.dansInt) {
        this.$modal.hide("editStructure");
      } else {
        this.$modal.hide("newStructure");
      }
    },
  },
  async mounted() {
    this.getDepartements();
  },
};
</script>
