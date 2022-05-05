<template >
  <b-container>
    <div class="np-chat-container">
      <div class="np-chat-container--holder">
        <div
          v-for="tem in temoignages"
          :key="tem.mes_id"
          :value="tem"
          style="position: relative"
        >
          <b-row class="np-chat-row">
            <b-col cols="9">
              <div
                v-bind:class="[
                  !tem.admin
                    ? 'np-chat--text np-chat--text_sent'
                    : 'np-chat--text np-chat--text_received',
                ]"
              >
                <span class="np-chat--time">{{ tem.date }}:</span><br />
                <span style="white-space: pre-wrap"
                  >{{ tem.content.description }}<br /><br
                /></span>
              </div>
            </b-col>
          </b-row>
        </div>
      </div>
    </div>
    <div v-if="temoignages.length > 0">
      <h4>Répondre</h4>
      <div class="np-chat-container">
        <div class="np-chat-container--holder">
          <b-row class="np-chat-row">
            <b-col cols="10">
              <b-form-textarea
                id="descInput"
                class="np-input-text--value"
                type="textarea"
                v-model="reponse"
                required
                rows="2"
                label="test"
                name="description"
                v-validate="{ required: true }"
                aria-describedby="descFeedback"
                placeholder="Tapez votre message ici"
              />
              <b-form-invalid-feedback id="descFeedback"
                >Le champ est obligatoire.</b-form-invalid-feedback
              >
            </b-col>

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
        </div>
      </div>
    </div>
  </b-container>
</template>

<script>
import logger from "~/plugins/logger";
const log = logger("components:suivitemoignage");

export default {
  props: {
    temoignages: [],
  },
  data() {
    return {
      reponse: null,
    };
  },
  methods: {
    repondre: async function () {
      log.i("repondre - In");
      const url = process.env.API_URL + "/temoignage/admin";
      const content = {
        description: this.reponse,
        email: this.$store.state.utilisateurCourant.mail,
      }
      return this.$axios
        .$post(url, {
          id:this.temoignages[0].id,
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