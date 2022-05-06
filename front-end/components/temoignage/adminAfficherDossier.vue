<template >
  <b-container>
    <b-row>
      <b-col cols="12" class="text-left">
        <b-form-group
          id="typologieInputGroup"
          name="typologieInputGroup"
          label="Typlogie :"
          label-for="typologieInput"
        >
          <b-form-select
            id="typologieInput"
            v-model="typologie"
            name="typologieInput"
          >
          <option
            v-for="typologie in listTypologie"
            :key="typologie.id"
            :value="typologie"
          >
          {{typologie.libelle}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12" class="text-left">
        <b-form-group
          id="ancienneteInputGroup"
          name="ancienneteInputGroup"
          label="Ancienneté :"
          label-for="ancienneteInput"
        >
          <b-form-select
            id="ancienneteInput"
            v-model="temoignage.anciennete"
            required
            name="ancienneteInput"
          >
            <option>TEST</option>
            <option>AUTRE</option>
          </b-form-select>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12" class="text-left">
        <b-form-group
          id="etatInputGroup"
          name="etatInputGroup"
          label="Etat du dossier :"
          label-for="etatInput"
        >
          <b-form-select
            id="etatInput"
            v-model="statut"
            name="etatInput"
          >
          <option
            v-for="statut in listStatut"
            :key="statut.id"
            :value="statut.id"
          >
          {{listStatut[statut.id].libelle}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="8" class="text-left">
        <b-button
          class="np-input-text--button"
          @click="majDossier()"
          >Mettre à jour</b-button
        >
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import logger from "~/plugins/logger";
const log = logger("components:AdminAfficherDossier");

export default {
  props: {
    temoignage: [],
    listStatut: [],
    listTypologie: [],
  },
  data() {
    return {
      typologie: null,
      anciennete: null,
      statut: null,
    };
  },
  methods: {
    majDossier: async function () {
      log.i("majDossier - In");
      const url = process.env.API_URL + "/temoignage/admin/"+this.temoignage[0].id;
      console.log('url : '+url)
      console.log(this.typologie)
      return this.$axios
        .$put(url, {
          typologie: this.typologie.id,
          anciennete: this.anciennete,
          statut: this.statut,
        })
        .then(() => {
          log.i("majDossier - Done");
          this.typologie = null;
          this.statut = null;
          this.$emit('dossier',true)
          return this.$toast.success("Le dossier a bien été mis à jour");
        })
        .catch((error) => {
          log.w("majDossier- error", error);
          return this.$toast.error(
            "Une erreur est survenue lors de la mise à jour du dossier"
          );
        });
    },
  },
};
</script>
