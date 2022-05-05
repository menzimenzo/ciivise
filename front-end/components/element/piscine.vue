<template>
  <b-container class="piscineModal p-5">
    <b-col cols="12" class="text-center mb-3">
      <h2>Sélection d'une piscine</h2>
    </b-col>
    <b-row>
      <b-col cols="3">
        <p>
          Code postal :
        </p>
      </b-col>
      <b-col cols="9">
        <b-form-group class="mb-3 mt-3" >
          <b-form-input
            aria-describedby="inputFormatterHelp"
            v-model="cp"
            type="text"/>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row v-if="!this.newPiscine">
      <b-col cols="3">
        <p>
          Piscine :
        </p>
      </b-col>
      <b-col cols="9">
        <b-form-group>
          <b-form-select class="" v-model="selectedPiscine">
            <option :value="null">-- Choix de la Piscine --</option>
            <option
              v-for="piscine in listepiscine"
              :key="piscine.id"
              :value="piscine">
              {{ piscine.nom }}
            </option>
          </b-form-select>
        </b-form-group>
        <div v-if="selectedPiscine">
          <span>Adresse : {{ this.selectedPiscine.adresse }}</span>
        </div>
      </b-col>
    </b-row>
    <div v-if="this.newPiscine">
    <b-row>
      <b-col cols="3">
        <p>
          Commune :
        </p>
      </b-col>
      <b-col cols="9">
        <b-form-group v-if="this.listecommunes.length > 1">
          <b-form-select class="" v-model="selectedCommune">
            <option :value="null">-- Choix de la Commune --</option>
            <option
              v-for="com in this.listecommunes"
              :key="com.com_id"
              :value="com.cpi_codeinsee">
              {{ com.com_libelle }}
            </option>
          </b-form-select>
        </b-form-group>
        <b-form-group v-else>
          <b-form-input
            aria-describedby="inputFormatterHelp"
            v-model="this.listecommune[0].com_libelle"
            type="text"
            />
        </b-form-group>
      </b-col>
    </b-row>  
    <b-row >
      <b-col cols="3">
        <p>
          Type de piscine :
        </p>
      </b-col>
      <b-col cols="9">
        <b-form-radio-group
          v-model="typePiscine"
          :options="listeType"
          class="plainStacked"
          name="plainStacked"/>
      </b-col>
    </b-row>
    <b-row v-if="this.typePiscine=='temporaire'">  
      <b-col cols="3">
        <p>
          Date de fin :
        </p>
      </b-col>
      <b-col cols="9">
        <b-form-group class="mb-3 mt-3">
          <b-form-input
            v-model="datefin"
            maxlength="10"
            type="date"/>
        </b-form-group>  
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="3">
        <p>Nom :</p>
      </b-col>
       <b-col cols="9">
        <b-form-group class="mb-3 mt-3">
          <b-form-input
            aria-describedby="inputFormatterHelp"
            v-model="nom"
            type="text"/>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row v-if="this.newPiscine">
      <b-col cols="3">
        <p>Adresse :</p>
      </b-col>
      <b-col cols="9">
       <b-form-group class="mb-3 mt-3">
          <b-form-input
            aria-describedby="inputFormatterHelp"
            v-model="adresse"
            type="text"/>
        </b-form-group>
      </b-col>
    </b-row>
    </div>
    <b-row>
      <b-col cols="3" v-if="this.offset==6 && !this.newPiscine">
        <b-button variant="success" v-on:click="CreatePiscine">Piscine manquante</b-button>
      </b-col>
      <b-col cols="3" :offset="this.offset">
        <b-button v-on:click="cancel">Annuler</b-button>
        <b-button variant="success" v-on:click="addPiscine" v-if="this.cp && this.cp.length == 5">Ajouter</b-button>
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import logger from '~/plugins/logger'
import rechercheCommune from '~/lib/mixins/rechercheCommune'
const log = logger('components:element:piscine')

export default {
  mixins: [rechercheCommune],
  props: {
    intervention: {
      type: Object,
      default: () => {
        return {};
      },
    },
    listePiscinesAffichees: {
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
  data() {
    return {
      cp: null,
      selectedPiscine: null,
      selectedCommune: null,
      listepiscine: null,
      listecommunes: {},
      offset: 9,
      newPiscine: false,
      nom: null,
      adresse: null,
      listeType: ['définitive','temporaire'],
      typePiscine: null,
      datefin: null
    };
  },
  watch: {
    cp() {
      this.rechercheCommuneNom();
      this.recherchepiscine();
    }
  },
  methods: {
    rechercheCommuneNom: async function () {
      this.listecommunes = await this.rechercheCommune()
    },
    recherchepiscine: function () {
        this.newPiscine=false
        log.i('recherchepiscine - In')
        const url = process.env.API_URL + "/piscine?codepostal=" + this.cp;
        return this.$axios.$get(url)
          .then(response => {
            log.i('recherchepiscine - Done')
            this.offset=6;
            return this.listepiscine = response.piscines;
          })
          .catch(error => {
            log.w('recherchepiscine - error', error)
            return this.$toast.error("Une erreur est survenue lors de la récupération des piscines")
          });
    },
    addPiscine: async function () {
      log.i('addPiscine - In')
          if (this.newPiscine) {
            if (this.nom && this.adresse && this.typePiscine && this.nom.length > 2 && this.adresse.length > 5 ) {
              const url = process.env.API_URL + "/piscine/new/";
              this.typePiscine == "temporaire" ? this.nom = 'TEMP - '+this.nom : this.nom
              const codeinsee = this.selectedCommune && this.selectedCommune != null ? this.selectedCommune : this.listecommunes[0].cpi_codeinsee ;
              let piscineCreee = await this.$axios.$post(url,{nom: this.nom,adresse:this.adresse,cp:codeinsee})
              if (piscineCreee)
              {
                log.i('addpiscine - Done')
                this.offset=6;
                this.selectedPiscine = piscineCreee.maPiscine;
              }
              else {
                log.w('addpiscine - error', error)
                return this.$toast.error("Une erreur est survenue lors de la sauvegarde de la piscine")
              }
            }
            else {
              return this.$toast.error(`veuillez saisr un nom et une adresse valable pour la nouvelle piscine`)  
            }
          }
          return this.$store.dispatch("post_maPiscine", this.selectedPiscine)
          .then(async piscine => {
            log.i('addPiscine - Done', { piscine })
            await this.$store.dispatch("get_mesPiscines");
            await this.$store.dispatch("get_maPiscine",this.selectedPiscine.id);
            if (this.dansInt) {
              //console.log('mise à jour formIntervention')
              this.intervention.piscine = this.$store.state.maPiscine
              this.listePiscinesAffichees.push(this.$store.state.maPiscine)
              this.$modal.hide("editPiscine")
            } 
            this.$modal.hide("newPiscine");
            return this.$toast.success(`${this.selectedPiscine.nom} ajoutée aux piscines favorites`)
          })
          .catch((error) => {
            log.w('addPiscine - Error', error)
            return this.$toast.error(`${this.selectedPiscine.nom} n'a pas pu être ajoutée aux piscines favorites`)
          })
         /* else {
            return this.$toast.error(`veuillez sélectionner une piscine`)
          }*/
      
    },
    CreatePiscine: function () {
      this.selectedPiscine = null
      this.newPiscine = true
      this.offset=9
    },
    cancel: function () {
      if (this.dansInt) {
        this.$modal.hide("editPiscine");
      } else {
        this.$modal.hide("newPiscine");
      }
    },
  },
};
</script>
<style>
p {
  font-size: 1em;
}
</style>