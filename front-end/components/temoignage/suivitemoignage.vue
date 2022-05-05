<template>
  <b-container>
          <div>
            <h4>Suivi</h4>
            <b-row>
              <b-col cols="4" class="text-left">
                <b-form-group
                id="codeInputGroup"
                label="Code confientiel :"
                label-for="codeInput"
                >
                  <b-form-input
                    id="codeInput"
                    type="text"
                    v-model="code"
                    required
                    name="code"
                    v-validate="{ required: true }"
                    aria-describedby="codeFeedback"
                    placeholder="Code"
                    :state="validateState('code')"
                  />
                  <b-form-invalid-feedback id="codeFeedback"
                    >Le code est obligatoire</b-form-invalid-feedback
                  >
                </b-form-group>
              </b-col>
              <b-col cols="4" class="text-left">
                <b-form-group
                id="emailInputGroup"
                label="Courriel :"
                label-for="emailInput"
                >
                  <b-form-input
                    id="emailInput"
                    type="email"
                    v-model="email"
                    name="email"
                    v-validate="{ required: false }"
                    aria-describedby="emailFeedback"
                    placeholder="adresse électronique de contact"
                    :state="validateState('email')"
                  />
                  <b-form-invalid-feedback id="emailFeedback"
                    >Le courriel n'est pas au bon format</b-form-invalid-feedback
                  >
                </b-form-group>
              </b-col>
            </b-row>
          </div>
          
            <div class="np-chat-container">
              <div class="np-chat-container--holder">
                <div v-for="tem in temoignages" :key="tem.mes_id" :value="tem" style="position: relative" >
                  <b-row class="np-chat-row">
                    <b-col cols=10>
                      <div
                        v-bind:class="[
                          !tem.admin
                            ? 'np-chat--text np-chat--text_sent'
                            : 'np-chat--text np-chat--text_received',
                        ]"
                      >
                        <span class="np-chat--time">{{ tem.date}}:</span><br>
                        <span style="white-space: pre-wrap;">{{tem.content.description}}<br><br></span>
                      </div>
                    </b-col>
                  </b-row>
                </div>
              </div>
            </div>
    <div v-if="temoignages.length> 0">
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
              :state="validateState('description')"
            />
            <b-form-invalid-feedback id="descFeedback"
              >Le champ est obligatoire.</b-form-invalid-feedback
            >
         </b-col>
  
      <b-col cols="2" class="text-left">
          <b-button class="np-input-text--button" @click="repondre" >Envoyer</b-button>
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
  data() {
    return {
      code: null,
      temoignages: [],
      reponse: null,
      email: "",
    };
  },
  watch: {
    code() {
      this.temoignage = {};
      if (this.code && this.code.length == 8) {
        this.chercherMessage();
      }
      else {
        this.temoignages=[]
      }
    },
  },
  methods: {
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
    chercherMessage: function () {
      const url = process.env.API_URL + "/temoignage/details/" ;
      return this.$axios
        .$post(url, {"code": this.code})
        .then((response) => {
          log.d("getTemoignage - Done");
          if (response.temoignage) {
            this.temoignages = response.temoignage;
            this.temoignages.forEach(element => {
              if (element.content.email !='') this.email = element.content.email
            });
          }
        })
        .catch((error) => {
          log.w("getTemoignage - error", error);
          return this.$toast.error(
            "Une erreur est survenue lors de la récupération de votre temoignage"
          );
        });
    },
    repondre: async function () {
      log.i("repondre - In");
      this.$validator.validateAll().then((isValid) => {
        if (!isValid) {
          log.w("depose - Not valid form");
          return this.$toast.error("Veuillez vérifier la validité des champs.");
        }
        !this.email
          ? (this.mail = "")
          : (this.mail = this.mail);
        const url = process.env.API_URL + "/temoignage/admin";
        const content = {
          email: this.email,
          description: this.reponse,
        }
        return this.$axios
          .$post(url, {
            id : this.temoignages[0].id,
            content: content,
            code: this.code,
            admin: false,
          })
          .then((response) => {
            log.i("deposeMessage - Done");
            this.chercherMessage();
            this.reponse = null;
            return this.$toast.success("Votre message a bien été envoyé");
          })
          .catch((error) => {
            log.w("deposeMessage- error", error);
            return this.$toast.error(
              "Une erreur est survenue lors de l'envoi de votre message"
            );
          });
      });
    }
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