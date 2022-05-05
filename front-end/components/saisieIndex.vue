<template>
  <b-container class="interventionModal">
    <b-row>
      <div class="mb-3 mt-3">
        Identifiant:
        <b-form-input
          aria-describedby="inputFormatterHelp"
          v-model="idEnfant"
          type="number"
        ></b-form-input>
      </div>
    </b-row>
    <br />
    <b-row>
      <p class="modal-btns">
        <b-button v-on:click="cancel()" title="Réinitialiser le formulaire"
          >Annuler</b-button
        >

        <b-button variant="success" v-on:click="searchEnfant()"
          >Rechercher</b-button
        >
      </p>
    </b-row>
  </b-container>
</template>
<script>
export default {
  props: {
    intervention: {
      type: Object,
      default: () => {
        return {};
      },
    },
    tableauEnfant: [],
    index: null,
  },
  data() {
    return {
      idEnfant: null,
    };
  },
  methods: {
    cancel: function () {
      this.$modal.hide("saisieIndex");
    },
    searchEnfant: function () {
      let enfantDoublon = [];
      enfantDoublon = this.intervention.enfant.filter((el) => {
        if (el.enf_id == this.idEnfant) {
          return true;
        }
      });

      if (enfantDoublon.length > 0) {
        this.$toast.error(
          `L\'enfant ${this.idEnfant} est déjà présent dans la liste`
        );
      } else {
        const url = process.env.API_URL + "/enfant/" + this.idEnfant;
        return this.$axios
          .$get(url)
          .then((response) => {
            if (response) {
            this.$store.commit("UPDATE_ARRAY_ELM", { key: 'enfants', index: this.index, value: response.enfant});
            this.$toast.success(
              `recupération des données de l\'enfant ${this.idEnfant} effectuée`
            );
            return this.$modal.hide("saisieIndex");
            }
            else {
              return this.$toast.error(`L\'enfant ${this.idEnfant} n\'a pu être trouvé`);  
            }
          })
          .catch((error) => {
            return this.$toast.error(`L\'enfant ${this.idEnfant} n\'a pu être trouvé`);
          });
      }
    },
  },
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
</style>
