<template>
  <b-container>
    <div v-if="!code">
    <b-row>
      <b-col cols="12" class="text-center">
        <h2 class="mb-3">Saisie d'un nouveau témoignage</h2>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="4" class="text-left">
        <b-form-group
        id="emailInputGroup"
        name="emailInputGroup"
        label="Courriel :"
        label-for="emailInput"
      >
        <b-form-input
          id="emailInput"
          type="email"
          v-model="mail"
          required
          name="mail"
          v-validate="{ required: false, email: true }"
          aria-describedby="emailFeedback"
          placeholder="Courriel"
          :state="validateState('mail')"
        />
        <b-form-invalid-feedback id="emailFeedback"
          >Le courriel doit être dans un format valide.</b-form-invalid-feedback
        >
      </b-form-group>
      </b-col>
    </b-row>
    <b-row v-if="mail && validateState('mail')">
      <b-col cols=12>
        <b-form-checkbox-group
            id="envoiEmailGroup"
            name="envoiEmailGroup"
          >
            <b-form-checkbox 
              id="envoiMail"
              name="envoiMail"
              v-model="envoiEmail" 
              value="true"
               v-validate="{ required: false }"
              >
              <span >En cochant cette case, j'accepte de recevoir des mails à l'adresse renseignée ci-contre lorsqu'un nouveau message est posté suite à mon témoignage.
                Cet email ne sera visible que par les membres de la Ciivise et ne sera communiqué à personne.
              </span>
            </b-form-checkbox>
          </b-form-checkbox-group>
      </b-col>
    </b-row>
    <br>
    <b-row>
      <b-col cols="12" class="text-left">
        <b-form-group
        id="descInputGroup"
        name="descInputGroup"
        label="Description des faits :"
        label-for="descInput"
        required
      >
        <b-form-textarea
          id="descInput"
          v-model="description"
          required
          rows="12"
          name="description"
          v-validate="{ required: true }"
          aria-describedby="descFeedback"
          placeholder="Description des faits"
          :state="validateState('description')"
        />
        <b-form-invalid-feedback id="descFeedback"
          >Le champ est obligatoire.</b-form-invalid-feedback
        >
      </b-form-group>
      </b-col>
    </b-row>
    <b-row>     
        <b-form-group id="legalCheckGroup">
          <b-form-checkbox-group
            id="accordHonneurGroup"
            name="accordHonneurGroup"
          >
            <b-form-checkbox 
              id="accordHonneur" 
              name="accordHonneur" 
              v-model="accordHonneur" 
              value="true"
            >
              <span style="color: red">*</span> En cochant cette case « je
              certifie sur l'honneur l'exactitude des informations ci-dessus ».
            </b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
    </b-row>      
    <b-row>
        <div class="mb-3 text-right">
          <b-button @click="depose" id="depose" name="depose" variant="success">Déposer mon témoignage</b-button>
        </div>
    </b-row>
    </div>
    <div v-else>
      <b-row >
        <b-col cols=8 class=message>
          Votre témoignage a bien été pris en compte, un de nos agents vous répondra aussi rapidement que possible.
        </b-col>
      </b-row>
      <b-row>
        &nbsp;
      </b-row>
      <b-row class="justify-content-md-left">
        <b-col cols=8 class=message>
          Vous pouvez accéder à votre témoignage et aux différents messages échangés grâce au code ci dessous, dans la rubrique "Suivi d'un témoignage".
        </b-col>
      </b-row>
      <b-row>
        &nbsp;
      </b-row>
      <div v-if="mail && envoiEmail">
      <b-row class="justify-content-md-left">
        <b-col cols=8 class=message>
          Un email vous a été adressé à l'adresse {{mail}} avec ce code.
        </b-col>
      </b-row>
      <b-row>
        &nbsp;
      </b-row>
      </div>
      <b-row class="justify-content-md-left">
        <b-col cols=8 class=message>  
          <h3><b>{{code}}</b></h3>
        </b-col>
      </b-row>
      <b-row class="justify-content-md-left">
        <b-col cols=8 class=bouton>  
          <div class="mb-3 text-right">
          <b-button @click="code = null" >Réinitialiser le formulaire</b-button>
        </div>
        </b-col>
      </b-row>
    </div>
  </b-container>
</template>
<script>

import logger from "~/plugins/logger";
const log = logger("components:temoignage");

export default {
  props: {
    efface: [],
  },
  data() {
    return {
      accordHonneur: false,
      description: null,
      mail:null,
      code:null,
      envoiEmail: false
    }
  },
  watch: {
    efface: function () {
      console.log('efface')
    
        this.code = null
    
    }
  },
  methods:{
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
    strRandom: () => {
    var a = 8,
        b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        c = '',
        d = 0,
        e = ''+b;
    for (; d < a; d++) {
      c += e[Math.floor(Math.random() * e.length)];
    }
    return c;
  },
    depose: async function () {
      log.i("depose - In");
      this.$validator.validateAll().then((isValid) => {
        if (this.accordHonneur!="true") {
          log.w("depose - Honor issue");
          return this.$toast.error(
            "Veuillez certifier sur l'honneur l'exactitude des informations déclarées."
          );
        }
        if (!isValid) {
          log.w("depose - Not valid form");
          return this.$toast.error("Veuillez vérifier la validité des champs.");
        }
        const code = this.strRandom()
        const url = process.env.API_URL + "/temoignage/" ;
        const content = {
          email: this.envoiEmail ? this.mail:null,
          description: this.description, 
        }
        return this.$axios
        .$post(url, {  
          content: content,
          code: code, 
          admin:false
          })
        .then(() => {
            log.i("deposeTemoignage - Done");
            this.description=null;
            this.code = code
            return this.$toast.success("Votre témoignage a bien été pris en compte");
        })
        .catch((error) => {
          log.w("deposeTemoignage - error", error);
            return this.$toast.error(
              "Une erreur est survenue lors de la depose de votre temoignage"
            );
        });
      });
    },
  },
};
</script>

<style>
.message{
  text-align: justify;
}

</style>
