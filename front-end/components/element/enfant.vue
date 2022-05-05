<template>
  <b-container class="interventionModal">
    <b-col cols="12" class="text-center">
      <h2 class="mb-3">
        Mise à jour de l'enfant {{ enfant.enf_id }}
        <br />
      </h2>
    </b-col>

    <div class="mb-3 mt-3">
      Id :
      <b-form-input
        aria-describedby="inputFormatterHelp"
        v-model="enfant.enf_id"
        type="text"
        :disabled="true"
      ></b-form-input>
    </div>
    <div class="mb-3 mt-3">
      Prénom :
      <b-form-input
        aria-describedby="inputFormatterHelp"
        v-model="enfant.prenom"
        type="text"
      ></b-form-input>
    </div>
    <!--<b-form-group label="niveau initial :">
      <b-form-select class="liste-deroulante" v-model="enfant.niv_ini">
        <option
          v-for="niveau in listeniveau"
          :key="niveau.value"
          :value="niveau.value"
        >
          {{ niveau.text }}
        </option>
      </b-form-select>
    </b-form-group>-->
    <b-form-group label="niveau atteint :">
      <b-form-select class="liste-deroulante" v-model="enfant.niv_fin">
        <option :value="null">-- Choix du niveau atteint --</option>
        <option
          v-for="niveau in listeniveau"
          :key="niveau.value"
          :value="niveau.value"
        >
          {{ niveau.text }}
        </option>
      </b-form-select>
    </b-form-group>
    <b-row> </b-row>
    <b-row> </b-row>
    <b-row>
      <p class="modal-btns">
        <b-button v-on:click="cancel">Annuler</b-button>
        <b-button
          variant="success"
          v-on:click="putEnfant(enfant, intervention.id)"
          >Mettre à jour</b-button
        >
      </p>
    </b-row>
  </b-container>
</template>
<script>
import Vue from "vue";

export default {
  props: {
    enfant: {
      type: Object,
      default: () => {
        return {};
      },
    },
    intervention: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      listeniveau: [
        { text: "Sans commpétence", value: 0 },
        { text: "Palier 1", value: "1" },
        { text: "Palier 2", value: "2" },
        { text: "Palier 3 ", value: "3" },
      ],
      id: null
    };
  },
  methods: {
    putEnfant: async function (enf, id) {
      const url = process.env.API_URL + "/enfant/" + enf.enf_id;
      return await this.$axios
        .$put(url, { enf, id })
        .then(({ intervention }) => {
          this.$toast.success(`enfant ${enf.enf_id} mis à jour`, []);
          this.$modal.hide("editEnfant");
          this.$store.dispatch("get_intervention", id);
          return this.intervention;
        });
    },
    cancel: function () {
      this.$modal.hide("editEnfant");
    },
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
</style>
