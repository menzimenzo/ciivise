<template>
    <div>
<!--
      <br>

      <h2  v-if="connexionType===1">Je me connecte à Aisance Aquatique</h2>
      <h5  v-if="connexionType===2">Connexion en tant que partenaire</h5>
      -->
      <b-card-text style="color:#35495e;">{{information}}</b-card-text>
      <b-form>
        <b-form-group id="emailInputGroup" label="" label-for="emailInput" required>
          <b-form-input
            id="emailInput"
            type="email"
            v-model="mail"
            v-on:keyup.enter="submit"
            required
            name="mail"
            v-validate="{required: true, email: true}"
            aria-describedby="emailFeedback"
            placeholder="Courriel"
            :state="validateState('mail')"
            :disabled="hasToConfirmMail"
          />
          <b-form-invalid-feedback
            id="emailFeedback"
          >Le courriel est obligatoire et doit être valide.</b-form-invalid-feedback>
        </b-form-group>
        <b-form-group id="emailInputGroup" label="" label-for="pwdInput" required>
          <b-form-input
            id="pwdInput"
            type="password"
            v-model="password"
            v-on:keyup.enter="submit"
            required
            name="password"
            v-validate="{required: true, min:8}"
            aria-describedby="pwdFeedback"
            placeholder="Mot de passe"
            :state="validateState('password')"
          />
          <b-form-invalid-feedback
            id="emailFeedback"
          >Le mot de passe est obligatoire.</b-form-invalid-feedback>
        </b-form-group>
        <div class="mb-3 text-right">
          <b-row > 
            <b-col cols="7" >  
              <b-button
                @click="submit"
                variant="success"
                :disabled="errors.any()"
              >{{ hasToConfirmMail ? 'Validation' : 'Connexion'}}</b-button>
              </b-col>
            <b-col cols="5">  
              <nuxt-link to="/mot-de-passe-oublie">
                  Mot de passe oublié
              </nuxt-link>
            </b-col>
          </b-row> 

        </div>
      </b-form>
      <b-row align-h="center" class="text-center">
          <b-col cols="4" v-if="!hasToConfirmMail&&fc">           
            <nuxt-link :to="{
              name:'register',
              params:{ FCauthentified: true }
            }" id="FC-target">
                Je me suis déjà connecté via FranceConnect
            </nuxt-link>
            <b-tooltip target="FC-target" triggers="hover">
                Vous pouvez associer un mot de passe au courriel utilisé lors votre inscription via FranceConnect.
            </b-tooltip>
          </b-col>
      </b-row>
    </div>
</template>

<script>
export default {
  data() {
      return {
          mail: '',
          password: '',
      }
  },
  props: {
    information: {
      type: String
    },
    hasToConfirmMail: {
      type: Boolean,
      default: false
    },
    connexionType: {
      type: Number,
      default: null,
    },
    fc: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    if(this.hasToConfirmMail) {
      this.mail = this.$store.state.utilisateurCourant.mail
    }
  },
  methods: {
    submit: function() {
      this.$validator.validateAll().then(isValid => {
        if (isValid) {
          return this.$emit("submit", { mail: this.mail, password: this.password});
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
    }
  }
};
</script>

<style>
input[type="email" ]
{
    display:block;
    border-top: none;
    border-left: none;
    border-right: none;
    outline:none;
}
input[type="password"]
{
    display:block;
    border-top: none;
    border-left: none;
    border-right: none;

    outline:none;
}
</style>

