<template>
<section class="container">
    <b-container class="profil">
      <b-card class="mb-3">
        <b-form>
          <b-row>
            <b-col cols="8" offset="2" >
              <div class="text-center mb-3">
                <h1>
                  Chargement de la clé de chiffrage
                </h1>
              </div>
            </b-col>
          </b-row>
          <b-row v-if="this.$store.state.privateKey">
            <b-col cols="8" offset="2" >
              <span>Clé actuelle : {{this.$store.state.privateKey.filename}}</span>
            </b-col>
          </b-row>
          <b-row>
            &nbsp;
          </b-row>
          <b-row>
            <b-col cols="8" offset="2" >
              <input type="file" id="cle" name="cle" @change="onFileChange">
            </b-col>
          </b-row>
          <b-row>
            &nbsp;
          </b-row>
          <b-row v-if="this.privateKey">
            <b-col ols="8" offset="2">
              <b-button class="" @click="valider" >Charger la clé</b-button>
      </b-col>
          </b-row>

        </b-form>
      </b-card>
    </b-container>    
</section>
</template>

<script>

import logger from '~/plugins/logger'

const log = logger('pages:cle')

export default {
  components: {
    
  },
  data() {
    return {
      contenu: null,
      privateKey: null
    };
  },
  methods: {
    onFileChange: function (e) {
      var files = e.target.files || e.dataTransfer.files;
      if (files && files.length && files[0].type == 'application/x-x509-ca-cert') {
        this.readCle(files[0]);
      }
      else {
        this.$store.commit("CLEAN", { key: "privateKey"});
        this.privateKey=null
        return this.$toast.error("Le fichier de clé n'est pas conforme");
      }
    },
    readCle: function (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result.split(',')
        this.privateKey = {
          filename: file.name,
          // conversion du base64 en UTF8
          value: atob(data[1])
        }
       };
      reader.readAsDataURL(file);

    },
    valider: function () {
      this.$store.commit("SET", { key: "privateKey", value: this.privateKey });
      this.$router.push("/admin")
    }
  }
};
</script>
