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
            required
            name="typologieInput"
            v-validate="{ required: true }"
          >
          <option
            v-for="typologie in listTypologie"
            :key="typologie.id"
            :value="typologie.id"
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
            v-model="anciennete"
            required
            name="ancienneteInput"
            v-validate="{ required: true }"
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
            v-model="statut "
            required
            name="etatInput"
            v-validate="{ required: true }"
          >
          <option
            v-for="statut in listStatut"
            :key="statut.id"
            :value="statut.id"
          >
          {{statut.libelle}}</option>
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
    temoignage: null,
  },
  data() {
    return {
      typologie: null,
      anciennete: null,
      statut: null,
      listTypologie: [
        {"id" : 1, "libelle": "Demande d'audition"},
        {"id" : 2, "libelle": "Témoignage écrit"},
        {"id" : 3, "libelle": "Famille"},
        {"id" : 4, "libelle": "Institutions"},
        {"id" : 5, "libelle": "Autres"},
      ],
      listStatut: [
        {"id" : 0, "libelle": "Nouveau"},
        {"id" : 1, "libelle": "Terminé"},
        {"id" : 2, "libelle": "Refusé"},
      ]
    };
  },
  watch: {
    /*"temoignagedechiffres[0].id": function () {
      this.typologie = null;
      this.anciennete = null;
    },*/
  },
  methods: {
    majDossier: async function () {
      log.i("majDossier - In");
      const url = process.env.API_URL + "/temoignage/admin/"+this.temoignage[0].id;
      return this.$axios
        .$put(url, {
          typologie: this.typologie,
          anciennete: this.anciennete,
          statut: this.statut,
        })
        .then((result) => {
          log.i("majDossier - Done");
          //this.temoignage = result
          this.reponse = "";
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
