<template >
  <b-container>
    <b-row>
      <b-col cols="12" class="text-left">
        <h2 class="mb-3">Eléments du dossier</h2>
      </b-col>
    </b-row>
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
            v-model="etat"
            required
            name="etatInput"
            v-validate="{ required: true }"
          >
            <option>TEST</option>
            <option>AUTRE</option>
          </b-form-select>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="2" class="text-left">
        <b-button
          class="np-input-text--button"
          @click="
            repondre();
            $emit('reponse', temoignages[0].code);
          "
          >Envoyer</b-button
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
    id: null,
  },
  data() {
    return {
      typologie: null,
      anciennete: null,
      etat: null,
      listTypologie: [
        {"id" : 1, "libelle": "Demande d'audition"},
        {"id" : 2, "libelle": "Témoignage écrit"},
        {"id" : 3, "libelle": "Famille"},
        {"id" : 4, "libelle": "Institutions"},
        {"id" : 5, "libelle": "Autres"},
      ]
    };
  },
  watch: {
    id: function () {
      this.typologie = null;
      this.anciennete = null;
    },
  },
  methods: {
    repondre: async function () {
      log.i("repondre - In");
      const url = process.env.API_URL + "/temoignage/admin";
      const content = {
        description: this.reponse,
        email: this.$store.state.utilisateurCourant.mail,
      };
      return this.$axios
        .$post(url, {
          id: this.temoignages[0].id,
          content: content,
          code: this.temoignages[0].code,
          admin: true,
        })
        .then(() => {
          log.i("deposeMessage - Done");
          this.reponse = "";
          return this.$toast.success("Votre message a bien été envoyé");
        })
        .catch((error) => {
          log.w("deposeMessage- error", error);
          return this.$toast.error(
            "Une erreur est survenue lors de l'envoi de votre message"
          );
        });
    },
  },
};
</script>

<style>
.np-chat-container {
  width: 100%;
  height: 100%;
  position: relative;
  border: none;
  padding: 12px;
  background: #ffffff;
}
.np-chat-container--holder {
  height: 100%;
  overflow-y: auto;
}
.np-chat-row {
  font-size: 12px;
  letter-spacing: 0.4px;
  background: rgb(255, 255, 255);
  word-break: break-word;
  margin: 4px 6px;
  padding: 6px 10px;
  border-radius: 6px;
  color: #fff;
  line-height: 1.4;
}
.np-chat--text {
  width: 80%;
  font-size: 12px;
  letter-spacing: 0.4px;
  background: #eee;
  word-break: break-word;
  margin: 4px 6px;
  padding: 6px 10px;
  border-radius: 6px;
  color: #fff;
  line-height: 1.4;
}
.np-chat--time {
  opacity: 0.7;
}
.np-chat--text_received {
  color: #ffffff;
  background: #252195;
  float: right;
}
.np-chat--text_sent {
  background: #d1d1d1;
  color: #000000;
  float: left;
}

.np-input-text--value {
  position: relative;
  background: #d1d1d1;
  margin: 4px 6px;
  padding: 6px 10px;
  font-size: 12px;
  letter-spacing: 0.4px;
  word-break: break-word;
  border-radius: 6px;
  color: #fff;
  line-height: 1.4;
  outline: none;
}
.np-input-text--button {
  color: #fff;
  margin: 4px 6px;
  padding: 6px 10px;
  font-size: 12px;
  position: relative;
  cursor: pointer;
}
</style>