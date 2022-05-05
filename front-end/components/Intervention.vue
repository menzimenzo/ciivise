<template>
  <b-container>
    <b-row>
      <b-col cols="12" class="text-center">
        <h2 v-if="intervention && intervention.id" class="mb-3">
          Intervention n°{{ intervention.id }} du
          {{ intervention.dateDebutIntervention | date }} au
          {{ intervention.dateFinIntervention | date }}
        </h2>
        <h2 v-else class="mb-3">Saisie d'une nouvelle intervention {{nbjoursavant}}</h2>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        <p class="mb-3">
          Liste des intervenants présents durant l'intervention :
        </p>
        <editable
          :columns="headersEncadrants"
          :data="formIntervention.utilisateur"
          :removable="false"
          :creable="false"
          :editable="false"
          :noDataLabel="''"
          tableMaxHeight="none"
        >
          <template slot-scope="props" slot="actions">
            <b-btn
              @click="deleteMN(props.data.item)"
              size="sm"
              class="mr-1"
              variant="primary"
            >
              <i class="material-icons">delete</i>
            </b-btn>
          </template>
        </editable>
        <b-btn
          @click="editIntervenant(null)"
          class="btn btn-primary btn-lg btn-block"
        >
          <i class="material-icons">add</i>
        </b-btn>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="6">
        <p>Structure pour laquelle j'interviens * :</p>
        <b-form-select
          class="liste-deroulante"
          v-model="formIntervention.structure"
        >
          <option :value="null">-- Choix de la structure --</option>
          <option
            v-for="structure in structuresToDisplay"
            :key="structure.id"
            :value="structure"
          >
            {{ structure.nom }}
          </option>
        </b-form-select>
        <b-btn
          v-if="utilisateurCourant.profilId != 2"
          @click="addStructure()"
          class="btn btn-primary ml-3"
        >
          <i class="material-icons">add</i>
        </b-btn>
      </b-col>
      <b-col cols="6">
        <p>Lieu d'intervention * :</p>
        <b-form-select
          class="liste-deroulante"
          v-model="formIntervention.piscine"
        >
          <option :value="null">-- Choix de la Piscine --</option>
          <option
            v-for="piscine in piscinesToDisplay"
            :key="piscine.id"
            :value="piscine"
          >
            {{ piscine.nom }}
          </option>
        </b-form-select>
        <b-btn @click="addPiscine()" class="btn btn-primary ml-3">
          <i class="material-icons">add</i>
        </b-btn>
      </b-col>
    </b-row>
    <b-row v-if="formIntervention.piscine && formIntervention.piscine.nom" class="mt-2">
      <b-col cols="6">
        <span></span>
      </b-col>
      <b-col cols="6">
        <span>Adresse : {{ formIntervention.piscine.adresse }}
          {{ formIntervention.piscine.cp }}
        </span>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        <p>Période d'intervention * :</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="4">
        <span> Du :&nbsp;</span>
        <b-form-input
          maxlength="10"
          v-model="formIntervention.dateDebutIntervention"
          type="date"
          class="text-date input-width"
        />
      </b-col>
      <b-col cols="4">
        <span>&nbsp; Au :&nbsp;</span>
        <b-form-input
          maxlength="10"
          v-model="formIntervention.dateFinIntervention"
          type="date"
          class="text-date input-width"
        />
      </b-col>
      <b-col cols="4">
        <span>&nbsp;Nombre de séances en piscine :&nbsp;</span>
        <b-form-input
          maxlength="2"
          v-model="formIntervention.nbSession"
          type="number"
          class="text-date input-width"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="3">
        <p>
          Subvention ANS &nbsp;<i
            class="material-icons"
            :id="randomId"
            style="cursor: pointer"
            >info</i
          >:
          <b-popover :target="randomId" triggers="hover focus">
            <span>Cette intervention s'inscrit dans le cadre d'un programme subventionné par l'ANS soit :<br>
              - Pour une classe bleue ou un stage bleu<br>
              - Pour la formation d’intervenants en Aisance Aquatique
            </span>
          </b-popover>
        </p>
      </b-col>
      <b-col cols="9" >
        <b-form-checkbox
          switch
          size="lg"
          class="plainStacked"
          v-model="formIntervention.isSubventionnee" />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="3">
        <p>
          Cadre d'intervention &nbsp;<i
            class="material-icons"
            :id="randomIdBis"
            style="cursor: pointer"
            >info</i
          >:
          <b-popover :target="randomIdBis" triggers="hover focus">
            <b>Péri-scolaire</b> : concerne les activités organisées durant les
            jours d’école ainsi que le mercredi, qu’il y ait ou non école le
            matin.
            <br />
            <b>Extra-scolaire</b> : concerne les accueils organisés les samedis
            sans école, les dimanches et pendant les congés scolaires.
          </b-popover>
        </p>
      </b-col>
      <b-col cols="9">
        <b-form-radio-group
          v-model="formIntervention.cai"
          :options="listecadreintervention"
          class="plainStacked"
          name="plainStacked"/>
      </b-col>
    </b-row>
    <b-row v-if="formIntervention.cai == 1">
      <b-col cols="12" class="my-3">
        <span>Classe concernée * :</span>
        <b-form-select
          class="liste-deroulante"
          v-model="formIntervention.classe"
        >
          <option :value="null">-- Choix de la classe --</option>
          <option
            v-for="classe in listeclasse"
            :key="classe.text"
            :value="classe.value">
            {{ classe.text }}
          </option>
        </b-form-select>
      </b-col>
    </b-row>
    <b-row>
      <!--<b-col cols="4">
        <span>Niveau initial :&nbsp;</span>
        <b-form-select v-model="niveauInitial" class="input-width">
          <option
            v-for="classe in listeniveau"
            :key="classe.value"
            :value="classe.value"
          >
            {{ classe.lib }}
          </option>
        </b-form-select>
      </b-col>-->
      <b-col cols="6">
        <span>Niveau final :&nbsp;</span>
        <b-form-select v-model="niveauFinal" class="input-width">
          <option
            v-for="classe in listeniveau"
            :key="classe.value"
            :value="classe.value"
          >
            {{ classe.lib }}
          </option>
        </b-form-select>
      </b-col>
      <b-col cols="6" v-if="niveauFinal">
        <span>Nombre d'enfants * :&nbsp;</span>
        <b-form-input
          v-model="formIntervention.nbEnfants"
          type="number"
          min="0"
          class="input-width"
        />
      </b-col>
    </b-row>
    <div v-if="hasEnfantsDeclared">
      <b-row>
        <b-col cols="12">
          <p>Liste des {{ formIntervention.nbEnfants }} enfants * :</p>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="12">
          <editable
            :columns="headersEnfants"
            :data="enfants"
            :removable="true"
            :creable="false"
            :editable="true"
            :noDataLabel="''"
            :edit-by-line="true"
            tableMaxHeight="none"
            @update="updateEnfant"
            @remove="removeEnfant"
          >
            <template slot-scope="props" slot="actions">
              <b-btn
                @click="searchEnfant(props.data)"
                size="sm"
                class="mr-1"
                variant="primary"
              >
                <i class="material-icons">search</i>
              </b-btn>
            </template>
          </editable>
        </b-col>
      </b-row>
    </div>
    <b-row id="error" v-if="erreurformulaire.length > 0">
      <span>{{
        erreurformulaire.length == 1
          ? "Veuillez renseigner le champ :"
          : "Veuillez renseigner les champs suivants :"
      }}</span>
    </b-row>
    <b-row id="error" v-if="erreurformulaire.length > 0">
      <ul>
        <li v-for="erreur in erreurformulaire" :key="erreur">
          - {{ erreur }}
        </li>
      </ul>
    </b-row>
    <b-row id="error" v-if="erreurDateFin">
      <span>{{erreurDateFin}}</span>
    </b-row>
    <b-row>
      <b-col cols="12" class="mt-5 text-right">
        <b-button @click="resetform()" v-if="intervention.id">
          Annuler
        </b-button>
        <b-button @click="resetform()" v-else>
          Réinitaliser le formulaire
        </b-button>
        <b-button @click="checkform" variant="success" v-if=" (testDate(intervention.dateFinIntervention,'<',nbjoursapres) && testDate(intervention.dateFinIntervention,'>',nbjoursavant)) || !intervention.dateFinIntervention || this.utilisateurCourant.profilId == 1">
          Enregistrer
        </b-button>
      </b-col>
    </b-row>
    <modal
      name="editIntervenant"
      height="auto"
      width="1100px"
      :scrollabe="true"
    >
      <Intervenant :intervention="formIntervention"/>
    </modal>
    <modal name="editPiscine" height="auto" width="1100px" :scrollabe="true">
      <Piscine :intervention="this.formIntervention" :listePiscinesAffichees="this.piscinesToDisplay" :dansInt="true" />
    </modal>
    <modal name="editStructure" height="auto" width="600px" :scrollabe="true">
      <Structure :intervention="this.formIntervention" :listeStructuresAffichees="this.structuresToDisplay" :dansInt="true" />
    </modal>
    <modal name="saisieIndex" height="auto" width="400px" :scrollabe="true">
      <Saisieindex :intervention="this.formIntervention" :index="this.index" />
    </modal>
  </b-container>
</template>
<script>
import Editable from "~/components/editable/index.vue";
import Intervenant from "~/components/element/Intervenant.vue";
import Piscine from "~/components/element/piscine.vue";
import Structure from "~/components/element/structure.vue";
import Saisieindex from "~/components/saisieIndex.vue";

import { debounce } from "lodash";
import { mapState } from "vuex";
import Vue from "vue";
import moment from "moment";
import logger from "~/plugins/logger";
const log = logger("components:intervention");

const loadFormIntervention = function (intervention, user) {
  log.i("loadFormIntervention - In");
  const formIntervention = JSON.parse(
    JSON.stringify(
      Object.assign(
        {
          //strId: null,
          structure: {},
          piscine: {},
          dateDebutIntervention: null,
          dateFinIntervention: null,
          nbSession: "",
          cai: "",
          classe: "",
          nbEnfants: "",
          isSubventionnee: false,
          enfant: [],
          utilisateur: [],
        },
        intervention
      )
    )
  );
  const dateDebutIntervention = moment(intervention.dateDebutIntervention);
  formIntervention.dateDebutIntervention =
    dateDebutIntervention.format("YYYY-MM-DD");
  const dateFinIntervention = moment(intervention.dateFinIntervention);
  formIntervention.dateFinIntervention =
    dateFinIntervention.format("YYYY-MM-DD");
  if (!formIntervention.id &&( user.profilId == 3 || user.profilId == 4 || user.profilId == 5)) {
    formIntervention.utilisateur.push(user);
  }
  log.i("loadFormIntervention - Done  ");
  return formIntervention;
};

export default {
  props: {
    intervention: {
      type: Object,
      default: () => {
        return {};
      }
    },
    nbjoursavant: {
      type: Number,
      default: () => {
        return 9;
      }
    },
    nbjoursapres: {
      type: Number,
      default: () => {
        return 0;
      }
    }
  },
  components: {
    Editable,
    Intervenant,
    Piscine,
    Saisieindex,
    Structure,
  },
  data() {
    return {
      formIntervention: loadFormIntervention(
        this.intervention,
        this.$store.state.utilisateurCourant
      ),
      erreurformulaire: [],
      erreurDateFin: null,
      structuresToDisplay: [],
      piscinesToDisplay: [],
      index: null,
      niveauInitial: null,
      niveauFinal: null,
      headersEncadrants: [
        { path: "nom", title: "Nom", type: "text", sortable: true },
        { path: "prenom", title: "Prénom", type: "text", sortable: true },
        { path: "mail", title: "Courriel", type: "text", sortable: true },
        {
          path: "__slot:actions",
          title: "Actions",
          type: "__slot:actions",
          sortable: false,
        },
      ],
      listecadreintervention: [
        { text: `Scolaire`, value: "1" },
        { text: `Péri-scolaire`, value: "2" },
        { text: `Extra-scolaire`, value: "3" },
        { text: `Privé`, value: "4" },
      ],
      listeclasse: [
        { text: `Petite section`, value: "3" },
        { text: `Moyenne section`, value: "4" },
        { text: `Grande section`, value: "5" },
        { text: `Cours préparatoire`, value: "6" },
      ],
      headersEnfants: [
        {
          path: "__slot:actions",
          title: "Recherche",
          type: "__slot:actions",
          sortable: false,
          editable: true,
        },
        { 
          path: "enf_id",
          title: "Identifiant",
          type: "text",
          sortable: true,
          editable: false,
        },
        {
          path: "prenom",
          title: "Prénom",
          type: "text",
          sortable: true,
          editable: true,
        },
        /*{
          path: "niv_ini",
          title: "niveau initial",
          type: "select",
          options: [
            { lib: "Débutant", value: "0" },
            { lib: "Palier 1", value: "1" },
            { lib: "Palier 2", value: "2" },
            { lib: "Palier 3 ", value: "3" },
          ],
          sortable: true,
          editable: true,
        },*/
        {
          path: "niv_fin",
          title: "niveau atteint",
          type: "select",
          options: [
            { lib: "Débutant", value: "0" },
            { lib: "Palier 1", value: "1" },
            { lib: "Palier 2", value: "2" },
            { lib: "Palier 3 ", value: "3" },
          ],
          sortable: true,
          editable: true,
        },
      ],
      listeniveau: [
        { lib: "Débutant", value: "0" },
        { lib: "Palier 1", value: "1" },
        { lib: "Palier 2", value: "2" },
        { lib: "Palier 3 ", value: "3" },
      ],
      // Nécessaire pour le fonctionnement des popovers quand plusieurs composants intervention sont sur la page
      randomId: "popover-" + Math.floor(Math.random() * 100000),
      randomIdBis: "popover-" + Math.floor(Math.random() * 100000),
    };
  },
  computed: {
    ...mapState([
      "mesPiscines",
      "interventionCourrante",
      "utilisateurCourant",
      "structures",
      "piscines",
    ]),
    hasEnfantsDeclared() {
      return this.intervention.id
        ? this.intervention.nbEnfants > 0
        : this.formIntervention.nbEnfants &&
            this.formIntervention.nbEnfants > 0;
    },
    enfants() {
      return this.$store.state.enfants;
    }
  },
  watch: {
    intervention(intervention) {
      Vue.set(
        this,
        "formIntervention",
        loadFormIntervention(intervention, this.$store.state.utilisateurCourant)
      );
      this.structuresToDisplay = []
      // Mise à jour de structuresToDisplay
      if (this.$store.state.structures.length) {
        this.structuresToDisplay = [...this.$store.state.structures]
        if ( Object.keys(this.formIntervention.structure).length != 0 && this.formIntervention.structure.constructor === Object ) {
          const index = this.structuresToDisplay.findIndex(structure => structure.id === this.formIntervention.structure.id)
          if(index === -1) this.structuresToDisplay.push(this.formIntervention.structure)
        }
      }

      this.piscinesToDisplay = []
      // Mise à jour de piscinesToDisplay
      if (this.$store.state.mesPiscines) {
        this.piscinesToDisplay = [...this.$store.state.mesPiscines]   
        if ( Object.keys(this.formIntervention.piscine).length != 0 && this.formIntervention.piscine.constructor === Object ) {
          const index = this.piscinesToDisplay.findIndex(piscine => piscine.id === this.formIntervention.piscine.id)
          if(index === -1) {
            this.piscinesToDisplay.push(this.formIntervention.piscine)
          }
        }
      }
    },
    "formIntervention.nbEnfants": debounce(function () {
      log.i("Watch - In - formIntervention.nbEnfants");
      if (
        !this.formIntervention.id && this.formIntervention.nbEnfants !== "" && !this.niveauFinal
      ) {
        return this.$toast.error(
          "Veuillez d'abord sélectionner le niveau final lié à cette intervention. Vous pourrez le changer par la suite."
        );
      }

      const reference = parseInt(this.formIntervention.nbEnfants);
      const enfantsStore = JSON.parse(JSON.stringify(this.enfants));
      let array = [];
      let enfant = {
        id: null,
        prenom: null,
        niv_ini: this.niveauInitial,
        niv_fin: this.niveauFinal,
      };
      if (enfantsStore.length == 0) {
        for (let i = 0; i < this.formIntervention.nbEnfants; i++) {
          array.push(enfant);
        }
        this.$store.commit("SET", { key: "enfants", value: array });
      } else if (enfantsStore.length !== reference) {
        const isSuperior = enfantsStore.length > reference;

        log.d("Watch - formIntervention.nbEnfants", { isSuperior });
        if (isSuperior) {
          const nbLgnes = enfantsStore.length - reference;
          let msg = "";
          nbLgnes == 1
            ? (msg =
                "Vous allez effacer la dernière ligne saisie. Êtes vous sûr ?")
            : (msg =
                "Vous allez effacer les " +
                nbLgnes +
                " dernières lignes saisies. Êtes vous sûr ?");
          if (confirm(msg)) {
            this.$store.commit("SPLICE_END", {
              key: "enfants",
              number: nbLgnes,
            });
          }
        } else {
          const nbLgnes = reference - enfantsStore.length;
          for (let i = 0; i < nbLgnes; i++) {
            enfantsStore.push(enfant);
          }
          return this.$store.commit("SET", {
            key: "enfants",
            value: enfantsStore,
          });
        }
      }
    }, 500),
  },
  async mounted() {  
    this.resetform();
  },
  methods: {
    removeEnfant: function (evenement) {
      log.i("removeEnfant - In");
      const index = evenement.index;
      this.$store.commit("SPLICE", { key: "enfants", index });
      return (this.formIntervention.nbEnfants = this.enfants.length);
    },
    updateEnfant: function (evenement) {
      log.i("updateEnfant - In");
      return this.$store.commit("UPDATE_ARRAY_ELM", {
        key: "enfants",
        index: evenement.index,
        value: evenement.item,
      });
    },
    searchEnfant: function (param) {
      this.index = param.index;
      this.$modal.show("saisieIndex");
    },
    addPiscine: function () {
      this.$modal.show("editPiscine");
    },
    addStructure: function () {
      this.$modal.show("editStructure");
    },
    editIntervenant: function () {
      this.$modal.show("editIntervenant");
    },
    deleteMN: function (mn) {
      log.i("deleteMN - In");
      const Index = this.formIntervention.utilisateur.findIndex(
        (uti) => uti.id == mn.id
      );
      log.i("deleteMN - Done");
      return this.formIntervention.utilisateur.splice(Index, 1);
    },
    resetform: function () {
      log.i("resetform - In");
      this.erreurformulaire = [];
      this.erreurDateFin = null;
      return Promise.all([
        this.$store.commit("CLEAN", { key: "interventionCourrante" }),
        this.$store.commit("CLEAN", { key: "enfants", isArray: true }),
      ]).then(() => {
        log.i("resetform - Done");
        this.formIntervention.nbEnfants = "";
        //this.niveauInitial = null;
        this.niveauFinal = null ;
        this.formIntervention.isSubventionnee = false;
        if (
          (this.utilisateurCourant.profilId == 3 ||
            this.utilisateurCourant.profilId == 4) &&
          !this.interventionCourrante.id
        ) {
          log.d("resetForm - resetting users.");
          this.formIntervention.utilisateur = [];
          return this.formIntervention.utilisateur.push(
            this.utilisateurCourant
          );
        }
      });
    },

    showPDF: function(id) {
      log.d("Téléchargement de l'attestation")
      this.$axios({
        url: process.env.API_URL + "/pdf/" + id,
        method: "GET",
        responseType: "blob" // important
      }).then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        var idformate = "";
        var nbzero;
        idformate = id.toString();
        for (nbzero=0;nbzero<7-id.toString().length;nbzero++){
            idformate = "0" + idformate;
        }
        idformate = "AAQ_Attestation-" + idformate;  
        //console.log("intervention : " + idformate);      
        log.d("intervention : ", idformate);
        link.setAttribute("download", `${idformate}.pdf`); //or any other extension
        document.body.appendChild(link);
        link.click();
      });
    },
    testDate: function(maDate,comp,borne) {
      const maDateFormatee = new Date(maDate).getTime()
      const today = new Date().getTime()
      const diffTime = today - maDateFormatee;
      const diffDays = Math.trunc(diffTime / (1000 * 60 * 60 * 24)); 
      if (comp === '>') {
        if (diffDays > borne) {return true}
      }
      if (comp === '<') {
        if (diffDays < borne) { return true}
      }
      return false;
    },
    checkform: function () {
      log.i("checkform - In");
      this.erreurformulaire = [];
      this.erreurDateFin = null;
      var formOK = true;

      if (
        !this.formIntervention.utilisateur ||
        this.formIntervention.utilisateur.length == 0
      ) {
        this.erreurformulaire.push("Les intervenants");
        formOK = false;
      }
      if (!this.formIntervention.structure || !this.formIntervention.structure.id) {
        this.erreurformulaire.push("La structure");
        formOK = false;
      }
      if (!this.formIntervention.piscine || !this.formIntervention.piscine.id) {
        this.erreurformulaire.push("Le lieu d'intervention");
        formOK = false;
      }
      if (!this.formIntervention.dateDebutIntervention) {
        this.erreurformulaire.push("La date de début d'intervention");
        formOK = false;
      }
      if (!this.formIntervention.dateFinIntervention) {
        this.erreurformulaire.push("La date de fin d'intervention");
        formOK = false;
      }
      if (!this.formIntervention.nbSession) {
        this.erreurformulaire.push("Le nombre de session de l'intervention");
        formOK = false;
      }
      if (!this.formIntervention.nbEnfants) {
        this.erreurformulaire.push("Le nombre d'enfants");
        formOK = false;
      }
      if (!this.formIntervention.cai) {
        this.erreurformulaire.push("Le cadre d'intervention");
        formOK = false;
      }
      if (!this.testDate(this.formIntervention.dateFinIntervention,'<',this.nbjoursapres) || !this.testDate(this.formIntervention.dateFinIntervention,'>',this.nbjoursavant)) {
        this.erreurDateFin = 'La date de fin n\'est pas dans l\'intervale [dateJour - '+this.nbjoursapres+' ; dateJour + '+Math.abs(this.nbjoursavant)+'].'
        return
      }
      if (!formOK) {
        log.i("checkForm - Done - Formulaire invalide", this.erreurformulaire);
        return;
      }
      log.d("checkForm - Done - formulaire valide.");
      const intervention = {
        id: this.formIntervention.id,
        strId: this.formIntervention.structure.id,
        dateDebutIntervention: this.formIntervention.dateDebutIntervention,
        dateFinIntervention: this.formIntervention.dateFinIntervention,
        nbSession: this.formIntervention.nbSession,
        piscine: this.formIntervention.piscine,
        nbEnfants: this.enfants.length,
        cai: this.formIntervention.cai,
        classe: this.formIntervention.classe,
        utilisateur: this.formIntervention.utilisateur,
        enfant: this.enfants,
        isSubventionnee: this.formIntervention.isSubventionnee
      };

      const action =
        intervention && intervention.id
          ? "put_intervention"
          : "post_intervention";
      log.d("checkForm - action on store", { intervention, action });
      return this.$store
        .dispatch(action, intervention)
        .then((serverIntervention) => {
          log.d("checkForm - response from server", serverIntervention);
          var action = [];
          if (intervention) {
            this.$toasted.success("Pour télécharger les attestations : ", {
                  action: {
                    text : "Cliquez ICI",
                    onClick : () => {
                    this.showPDF(serverIntervention.id);
                  }
              }
            }).goAway(15000)
          }
          const interventionLabel = serverIntervention && serverIntervention.id ? "#" + serverIntervention.id : ""
          log.i("checkForm - Done");
          this.$toast.success(`Intervention ${interventionLabel} enregistrée`);
          if (!this.formIntervention.id) {
            return this.resetform();
          }
        })
        .catch((error) => {
          log.w("Une erreur est survenue lors de la sauvegarde de l'intervention", error)
        });
    },
  },
};
</script>

<style>
ul {
  list-style-type: none;
}
.input-width {
  width: 100%;
}
.liste-deroulante {
  width: 80%;
}
p {
  font-size: 1.3em;
}
</style>
