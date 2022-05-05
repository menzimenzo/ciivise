<template>
  <b-form>
    <b-card class="mb-3">
      <b-form-group
        id="emailInputGroup"
        label="Courriel :"
        label-for="emailInput"
        required
      >
        <b-form-input
          id="emailInput"
          type="email"
          v-model="mail"
          required
          name="mail"
          v-validate="{ required: true, email: true }"
          aria-describedby="emailFeedback"
          placeholder="Courriel"
          :state="validateState('mail')"
          :disabled="!isUserRegisteredViaFC"
        />
        <b-form-invalid-feedback id="emailFeedback"
          >Le courriel est obligatoire et doit être
          valide.</b-form-invalid-feedback
        >
      </b-form-group>
      <b-form-group
        label="Prénom :"
        id="prenomInputGroup"
        label-for="prenomInput"
        required
      >
        <b-form-input
          id="prenomInput"
          type="text"
          v-model="user.prenom"
          name="prenom"
          required
          v-validate="{ required: true }"
          aria-describedby="prenomFeedback"
          placeholder="Prénom"
          :disabled="isUserRegisteredViaFC"
          :state="validateState('prenom')"
        />
        <b-form-invalid-feedback id="prenomFeedback"
          >Le prénom est obligatoire.</b-form-invalid-feedback
        >
      </b-form-group>
      <b-form-group
        label="Nom :"
        id="nomInputGroup"
        label-for="nomInput"
        required
      >
        <b-form-input
          id="nomInput"
          type="text"
          v-model="user.nom"
          name="nom"
          key="nom-input"
          v-validate="{ required: true }"
          aria-describedby="nomFeedback"
          placeholder="Nom"
          :disabled="isUserRegisteredViaFC"
          :state="validateState('nom')"
        />
        <b-form-invalid-feedback id="nomFeedback"
          >Le nom est obligatoire.</b-form-invalid-feedback
        >
      </b-form-group>
      <b-form-group 
        label="Numéro de carte professionnelle :"
        id="eapsInputGroup"
        label-for="eapsInput"
        required
        v-if="user.profilId != 1 && user.profilId != 2  && user.profilId != 6 && user.profilId != 7"
      >
        <b-form-input
          id="eapsInput"
          type="text"
          required
          v-model="user.eaps"
          name="eaps"
          key="eaps-input"
          v-validate="{ required: true, regex: /[0-9]{2}[0-9A-B]{1}[0-9]{2}ED[0-9]{4}|[0-9]{3,5}ED[0-9]{3,5}/ }"
          :state="validateState('eaps')"
          aria-describedby="eapsFeedback"
          placeholder="Numéro de carte professionnelle"
        />
<!--          v-validate="{ required: true, regex: /[0-9]{5}ED[0-9]{4}/ }" -->
        <b-form-invalid-feedback id="eapsFeedback"
          >Le format de la carte professionnelle n'est pas
          respecté.</b-form-invalid-feedback
        >
      </b-form-group>
    </b-card>
    <b-card class="mb-3">
      <div v-if="user.profilId != 1 && user.profilId != 2  && user.profilId != 6 && user.profilId != 7">
        <b-form>
          <b-form-group label="Site Web de contact :">
            <b-form-input
              v-model="user.sitewebcontact"
              type="text"
              placeholder="http:// ou https://"
            />
          </b-form-group>

          <b-form-group
            id="emailcontactInputGroup"
            label="Courriel de contact :"
            label-for="emailcontactInput"
          >
            <b-form-input
              id="emailcontactInput"
              type="email"
              v-model="user.mailcontact"
              name="mailcontact"
              key="email-input"
              aria-describedby="emailcontactFeedback"
              placeholder="Courriel contact"
            />
          </b-form-group>
          <b-form-group
            id="telephonecontactInputGroup"
            label="Telephone de contact :"
            label-for="telephonecontactInput"
          >
            <b-form-input
              id="telephonecontactInput"
              type="text"
              v-model="user.telephonecontact"
              name="telephonecontact"
              key="phone-input"
              aria-describedby="telephonecontactFeedback"
              placeholder="Telephone contact"
            />
          </b-form-group>
          <b-form-group label="Adresse de  contact :">
            <b-form-input type="text" v-model="user.adrcontact" />
          </b-form-group>
          <b-form-group label="Complément d'adresse de  contact :">
            <b-form-input type="text" v-model="user.compadrcontact" />
          </b-form-group>

          <b-form-group id="CodePostal" label="Code Postal :" label-for="cp">
            <b-form-input
              v-model="cp"
              name="codepostal"
              key="cp"
              :state="validateState('codepostal')"
              v-validate="{ length: 5, numeric: true }"
              aria-describedby="cpFeedback"
              id="cp"
              type="number"
              placeholder="CP de la commune"
            />
            <b-form-invalid-feedback id="cpFeedback"
              >Le code postal doit contenir 5
              caractères.</b-form-invalid-feedback
            >
          </b-form-group>
          <b-form-group
            v-if="cp"
            label="Commune"
            label-for="lstcommune"
            require
          >
            <b-form-select
              v-model="user.cpi_codeinsee"
              name="lstcommune"
              v-validate="{ required: true, min: 5, max: 5 }"
              :state="validateState('lstcommune')"
              aria-describedby="lstcommuneFeedback"
            >
              <option :value="null">-- Choix de la commune --</option>
              <option
                v-for="commune in listecommune"
                :key="commune.cpi_codeinsee"
                :value="commune.cpi_codeinsee"
              >
                {{ commune.com_libellemaj }}
              </option>
            </b-form-select>
            <b-form-invalid-feedback id="lstcommuneFeedback"
              >Une commune doit être sélectionnée avec un code postal
              valide.</b-form-invalid-feedback
            >
          </b-form-group>
        </b-form>
        <b-form>
          <b-form-group id="donneleconCheckGroup">
            <b-form-checkbox-group
              v-model="user.donneleconsparticulieres"
              id="donneleconCheck"
              :state="validateState('donneleconCheck')"
              name="donneleconCheck"
            >
              <b-form-checkbox>
                Je donne des leçons particulières.
              </b-form-checkbox>
            </b-form-checkbox-group>
          </b-form-group>
        </b-form>        
        <b-form>
          <b-form-group id="publiCheckGroup">
            <b-form-checkbox-group
              v-model="user.publicontact"
              id="publiCheck"
              :state="validateState('publiCheck')"
              name="publiCheck"
            >
              <b-form-checkbox>
                Je souhaite que ces données soient publiées sur le site
                "prévention des noyades" et qu'elles apparaissent sur la
                cartographie.<br />
                Si vous ne cochez pas cette case vous pourrez tout de même créer
                des interventions et générer des attestations lorsque vous aurez
                accès à l'espace "interventions".
              </b-form-checkbox>
            </b-form-checkbox-group>
          </b-form-group>
        </b-form>
      </div>
      <div v-else>
        <b-form-group label="Structure" v-if="user.profilId == 2">
          <b-form-select
            v-model="selectedStructure"
            :disabled="this.user.validated"
          >
            <option :value="null">-- Choix de la Structure --</option>
            <option
              v-for="stru in listeStructure"
              :key="stru.type"
              :value="stru.type"
            >
              {{ stru.nom }}
            </option>
          </b-form-select>
        </b-form-group>
        <div v-if="selectedStructure == 1">
          <b-form-group
            required
            id="typeCollectivite"
            label="Type de collectivité territoriale :"
            label-for="typeCollectiviteSelect"
          >
            <b-form-select
              id="typeCollectiviteSelect"
              v-model="typeCollectivite"
              :disabled="this.user.validated"
            >
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
                :disabled="this.user.validated"
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
            <b-form-group
              v-if="!this.user.validated"
              id="CodePostal"
              label="Code Postal :"
              label-for="cp"
            >
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
              label-for="communeInput"
            >
              <b-form-select
                name="commune"
                key="commune"
                type="text"
                v-model="collectivite"
                id="communeSelect"
                :disabled="this.user.validated"
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
              v-if="!this.user.validated"
              id="CodePostalEpci"
              label="Code Postal EPCI:"
              label-for="cpEpci"
            >
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
                <b-form-select
                  id="epciSelect"
                  v-model="collectivite"
                  name="epcis"
                  :disabled="this.user.validated"
                >
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
            <b-form-group v-if="boolEpci == false">
              Aucun EPCI correspondant</b-form-group
            >
          </div>
        </div>
        <div v-if="selectedStructure == 2">
          <b-row>
            <b-col cols="9">
              <b-form-group label="Numéro SIREN ou SIRET :">
                <b-form-input
                  aria-describedby="inputFormatterHelp"
                  v-model="siret"
                  type="text"
                  :disabled="this.user.validated"
                />
              </b-form-group>
            </b-col>
            <b-col cols="3">
              <b-button v-if="!this.user.validated"
                variant="success"
                style="margin-top: 30px"
                v-on:click="recherchesiret"
                >Rechercher</b-button
              >
            </b-col>
          </b-row>
        </div>
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
        <div class="mb-3 mt-3" v-if="boolSiret && selectedStructure == 2" >
          nom :
          <b-form-input :disabled="this.user.validated" v-model="etab.nom" type="text"></b-form-input>
          adresse :
          <b-form-input :disabled="this.user.validated" v-model="etab.adresse" type="text"></b-form-input>
        </div>
        <div v-if="selectedStructure == 3">
          <b-row>
            <b-col cols="9">
              <b-form-group label="Numéro UAI ou code postal :">
                <b-form-input
                  aria-describedby="inputFormatterHelp"
                  v-model="uai"
                  type="text"
                  :disabled="this.user.validated"
                />
              </b-form-group>
            </b-col>
            <b-col cols="3">
              <b-button v-if="!this.user.validated"
                variant="success"
                style="margin-top: 30px"
                v-on:click="rechercheEcole"
                >Rechercher</b-button
              >
            </b-col>
          </b-row>
        </div>
        <div v-if="boolEcoleCP && selectedStructure == 3">
          <b-form-group id="etab" label="Liste des établissements :">
            <b-form-select
              name="ecoles"
              key="ecoles"
              type="text"
              v-model="etab"
              id="ecoleSelect"
              :disabled="this.user.validated"
            >
              <option
                v-for="ecole in listeEtab"
                :key="ecole.uai"
                :value="ecole"
              >
                {{
                  ecole.nom +
                  " - " +
                  ecole.adresse +
                  " - " +
                  ecole.adresse +
                  " " +
                  ecole.cp +
                  " " +
                  ecole.libelleCommune
                }}
              </option>
            </b-form-select>
          </b-form-group>
        </div>
        <div class="mb-3 mt-3" v-if="boolUAI && selectedStructure == 3">
          nom :
          <b-form-input :disabled="this.user.validated" v-model="etab.nom" type="text"></b-form-input>
          adresse :
          <b-form-input :disabled="this.user.validated" v-model="etab.adresse" type="text"></b-form-input>
        </div>
      </div>

      <b-card>
        <b-form-group id="legalCheckGroup">
          <b-form-checkbox-group
            
            id="accordHonneur"
            name="accordHonneur"
          >
            <b-form-checkbox v-model="accordHonneur" value="true">
              <span style="color: red">*</span> En cochant cette case « je
              certifie sur l'honneur l'exactitude des informations ci-dessus ».
            </b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
      </b-card>
      
        <b-form-group>
          <span style="color: red">*</span> : Champ obligatoire
        </b-form-group>
        <div class="mb-3 text-right">
          <b-button @click="submit" variant="success">{{ submitTxt }}</b-button>
        </div>
    </b-card>
  </b-form> 
</template>

<script>
import rechercheCommune from "~/lib/mixins/rechercheCommune";
import rechercheDepartement from "~/lib/mixins/rechercheDepartement";
import rechercheEpci from "~/lib/mixins/rechercheEpci";

import logger from "~/plugins/logger";
const log = logger("components:userInfos");

export default {
  mixins: [
    rechercheCommune,
    rechercheDepartement,
    rechercheEpci,
  ],
  props: ["submitTxt", "user", "cancelable"],
  data() {
    return {
      cp: null,
      isPubliChecked: false,
      accordHonneur: false,
      listecommune: [
        {
          text: "Veuillez saisir un code postal",
          value: null,
          insee: null,
          cp: null,
          codedep: null,
        },
      ],
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
      listeEtab: [
        {
          siret: null,
          nom: null,
          commune: null,
          adresse: null,
        },
      ],
      listdepartement: null,
      listepci: [
        {
          epci_code:null,
          epci_libelle:null,
          epci_id:null
        }
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
      this.user.cp = this.cp;
      return this.rechercheCommune();
    },
    cpEpci() {
      this.rechercheEpci();
    },
    selectedStructure() {
      if (!this.user.validated) {
        this.boolEpci = false;
        this.boolSiret = false;
        this.boolUAI = false;
        this.boolEcoleCP = false;
        this.siret = null;
        this.typeCollectivite = null;
        (this.cp = null), (this.cpEpci = null);
      }
    },
  },
  async mounted() {
    if (this.user.profilId < 3) {
      this.getDepartements();
    }

    if (this.user.profilId == 2 && this.user.validated) {
      await this.$store.dispatch(
        "get_structureByUser",
        this.$store.state.utilisateurCourant.id
      );
      this.selectedStructure = this.$store.state.structures[0].type;
      switch (this.selectedStructure) {
        case "1":
          this.typeCollectivite = this.$store.state.structures[0].soustype;
          let code = this.$store.state.structures[0].code
          switch (this.typeCollectivite) {
            case "1":
              let commune = await this.rechercheCommuneByCodeInsee(code);
              if (commune && commune.length == 1) {
                this.collectivite = commune[0];
              }
              break;
            case "2":
              let departement = await this.rechercheDepartement(code);
              if (departement && departement.length == 1) {
                this.collectivite = departement[0];
                }
              break;
            case "3":
              let epci = await this.rechercheEpciById(code);
              if (epci && epci.length == 1) {
                this.collectivite = epci[0];
                this.boolEpci = true
              }
              break;
          }
          break;
        case "2":
          this.siret = this.$store.state.structures[0].code;
          this.etab.siret = this.$store.state.structures[0].code;
          this.etab.nom = this.$store.state.structures[0].nom;
          this.etab.adresse = this.$store.state.structures[0].adresse;
          this.boolSiret=true;
          break;
        case "3":
          this.uai = this.$store.state.structures[0].code
          this.etab.nom = this.$store.state.structures[0].nom;
          this.etab.adresse = this.$store.state.structures[0].adresse;
          this.boolUAI=true;
          break;
      }
    }
    // Chargement du CP enregistré (utile pour l'utilisation dans "Mon Compte")
    this.cp = this.user.cp;
  },
  computed: {
    mail: {
      get() {
        return this.$store.state.utilisateurCourant.mail;
      },
      set(value) {
        return this.$store.dispatch("set_state_element", {
          key: "utilisateurCourant.mail",
          value,
        });
      },
    },
    isUserRegisteredViaFC() {
      return Boolean(this.user && this.user.tokenFc);
    },
  },
  methods: {
    submit: function () {
      log.i("submit - In");
      this.$validator.validateAll().then((isValid) => {
        // Correction Mantis 86383
        //if (!this.accordHonneur) {
        if (this.accordHonneur!="true") {
          log.w("submit - Honor issue");
          this.user.cpi_codeinsee = null;
          return this.$toast.error(
            "Veuillez certifier sur l'honneur l'exactitude des informations déclarées."
          );
        }
        if (!isValid) {
          log.w("submit - Not valid form");
          return this.$toast.error("Veuillez vérifier la validité des champs.");
        }
        if ((this.user.profilId != 1 && this.user.profilId != 2 ) || this.user.validated) {
          log.d("submit - Starting to submit");
          this.$store.dispatch("set_state_element", {
            key: "utilisateurCourant",
            value: this.user,
          });
          return this.$emit("submit");
        } else {
          log.d("submit - Profil ID equal 1 or 2");
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
            case 1 || '1':
              structure.soustype = this.typeCollectivite;
              switch (structure.soustype) {
                case 1 || '1':
                  structure.nom = "Commune - " + this.collectivite.com_libelle;
                  structure.code = this.collectivite.cpi_codeinsee;
                  structure.commune = this.collectivite.cpi_codeinsee;
                  break;
                case 2 || '2':
                  structure.nom =
                    "Conseil Général - " + this.collectivite.dep_libelle;
                  structure.code = this.collectivite.dep_num;
                  break;
                case 3 || '3':
                  structure.nom = "EPCI - " + this.collectivite.epci_libelle;
                  structure.code = this.collectivite.epci_code;
                  this.$store.dispatch(
                    "get_structureByUser",
                    this.$store.state.utilisateurCourant.id
                  );
                  break;
              }
              break;
            case 2 || '2':
              structure.nom = this.etab.nom;
              structure.code = this.etab.siret;
              structure.commune = this.etab.commune;
              structure.adresse = this.etab.adresse;
              structure.soustype = this.etab.activite;
              break;
            case 3 || '3':
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
          log.d("submit - structure is ready");
          return this.$store
            .dispatch("post_structure", [
              structure,
              this.$store.state.utilisateurCourant.id,
            ])
            .then(() => {
              this.$store.dispatch(
                "get_structureByUser",
                this.$store.state.utilisateurCourant.id
              );
              this.$store.dispatch("set_state_element", {
                key: "utilisateurCourant",
                value: this.user,
              });
              log.i("submit - Done");
              return this.$emit("submit");
            });
        }
      });
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
    recherchesiret: function () {
      log.i("recherchesiret - In");
      if (this.siret && this.siret.length === 14) {
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
      if (this.siret && this.siret.length === 9) {
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
    },
    rechercheEcole: function () {
      if (this.uai && this.uai.length === 5) {
        log.i("rechercheEcole - CP - In");
        this.boolEcoleCP = true;
        const url = process.env.API_URL + "/ecole/cp/" + this.uai;
        return this.$axios
          .$get(url)
          .then(({ etablissements }) => {
            log.i("rechercheEcole - CP - Done");
            this.boolEcoleCP = true;
            this.listeEtab = etablissements;
          })
          .catch((error) => {
            log.w("rechercheEcole - CP - Error", error);
            return this.$toast.error(
              "Une erreur est survenue lors de la recherche de l'école par CP"
            );
          });
      }
      if (this.uai && this.uai.length === 8) {
        this.boolUAI = true;
        log.i("rechercheEcole - UAI - In");
        const url = process.env.API_URL + "/ecole/uai/" + this.uai;
        return this.$axios
          .$get(url)
          .then(({ ecole }) => {
            log.i("rechercheEcole - UAI - Done");
            this.etab = ecole;
          })
          .catch((error) => {
            log.w("rechercheEcole - UAI - Error", error);
            return this.$toast.error(
              "Une erreur est survenue lors de la recherche de l'école par UAI"
            );
          });
      }
      if (this.uai && this.uai.length != 8 && this.uai.length != 5) {
        return this.$toast.error(
          `L'UAI ou code postal saisit n'est pas au bon format'`
        );
      }
    },
    emitUser: function () {
      return this.$store.dispatch("set_state_element", {
        key: "utilisateurCourant",
        value: this.user,
      });
    },
  },
};
</script>
