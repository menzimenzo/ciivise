<template>
  <b-container fluid>
    <b-row class="main-header">
      <b-col cols="2" class="text-center">
        <nuxt-link :to="redirectAcc" title="Afficher la page d'accueil" style="text-decoration: none" >
          <b-img fluid :src="require('assets/Gouvernement_PiloteMS.jpg')" width="80%" blank-color="rgba(0,0,0,0.5)" />
        </nuxt-link>
      </b-col>
      <b-col cols="4" classe="titre">
        <h1>Plateforme de signalement</h1>
      </b-col>
      <b-col cols="2" >
        <a href="https://www.ciivise.fr">
        <b-img fluid :src="require('assets/logo.jpg')" width="100%" href="https://www.ciivise.fr"/>
        </a>
      </b-col>
      <b-col cols="3">
       <nuxt-link to="/cle" v-if="this.$store.state.privateKey && this.$store.state.privateKey.value != null && this.$store.state.utilisateurCourant">
        <b-img fluid :src="require('assets/lockgreen.png')" class="lockButton"  />
      </nuxt-link>
      <nuxt-link to="/cle" v-if="(!this.$store.state.privateKey || this.$store.state.privateKey.value == null) && this.$store.state.utilisateurCourant">
        <b-img fluid :src="require('assets/lockred.png')" class="lockButton" />
      </nuxt-link>
      </b-col>
    <div class="accountMenu" v-if="utilisateurCourant">
      <b-col cols="2">
      <b-dropdown  id="accountBtn"  >
        <template slot="button-content">{{utilisateurCourant && utilisateurCourant.prenom}} {{utilisateurCourant && utilisateurCourant.nom}}</template>
        <b-dropdown-item to="/connexion/profil">
          Mon compte
        </b-dropdown-item>
        <b-dropdown-item href="#" @click.prevent="logout()">Se déconnecter</b-dropdown-item>
      </b-dropdown>
      </b-col>
    </div>
  </b-row>
  </b-container>
</template>
<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      AfficheIntervention: false,
      AutInterMNS: false
    }
  },
   computed:{ 
    ...mapState(['utilisateurCourant']),
    redirectAcc() {
      let path= '/'
      if(!this.utilisateurCourant ) {
          path = '/temoignage'
      }
      return path
    }
  },
  methods: {
    logout() {
      this.$store.commit("CLEAN", { key: "privateKey"});
      return this.$axios.$get(process.env.API_URL + '/connexion/logout').then(async response => {
        response.url ? window.location.replace(response.url) : this.$router.push('/')
        return this.$store.dispatch('logout')
      })
    }
  }
};
</script>

<style>

.titre {
  color: #252195;
}
.main-header {
  margin-bottom: 20px;
  text-align: center;
  margin-top:10px;
  position: relative;
  font-family: Arial, Helvetica, sans-serif
}
.accountMenu {
  position: absolute;
  top: 10px;
  right: 15px;
  z-index: 10;
  display: inline-flex;
}
.accountMenu .menuLink img {
  margin-right: 10px;
}
.accountMenu .menuLink {
  position: relative;
  text-decoration: none;
  margin-right: 10px;
  padding-right: 5px;
  transition: all ease-in-out 0.3s;
}
.accountMenu .menuLink:hover {
  color: #FFBA35;
}
.accountMenu .menuLink:hover::after {
  content: "";
  position: absolute;
  left:0;
  width: 100%;
  bottom: 0;
  border: 1px solid #FFBA35;
}
.lockButton {
  border:none;
  width:15%;
}

#accountBtn button{
  background-color: white;
  color: #666;
  border: 0px solid #FFBA35;
  border-bottom: 1px solid #FFBA35;
  border-radius: 0px;
}
.settingsBtn {
  margin-right: 10px;
  background-color: white; 
}
.settingsBtn i {
  position: relative;
  top: 4px;
}
</style>
