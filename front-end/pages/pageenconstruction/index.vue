<template>
  <b-container class="accueil">
    <b-row style="margin-top:1%">
      <b-col  class="col-12 col-md-4">
        <b-img :src="require('assets/MainAisAqua.png')" width="365%"/>
      </b-col>
      <b-col  class="col-12 col-md-8" >
        <b-card class="mb-3" >
          <p>          
            Vous tentez d'accéder aux interventions Aisance Aquatique.<br><br>
            Cette page est actuellement en cours de construction.
          </p>
        </b-card>            
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
//import Intervention from "~/components/Intervention.vue";
import { mapState } from "vuex";
export default {
  components: {
  },
  data() {
    return {
    };
  },
  watch: {

  },
  computed: mapState([
    "utilisateurCourant"
  ]),
};
</script>

<style>
.accordionBtn {
  text-align: left;
}

.accordionBtn:focus {
  box-shadow: none;
}

.accordion-chevron {
  position: relative;
  top: 5px;

  -webkit-transition: 0.4s ease-in-out;
  -moz-transition: 0.4s ease-in-out;
  -o-transition: 0.4s ease-in-out;
  transition: 0.4s ease-in-out;
  color: #252195;
}

a:not(.collapsed) .accordion-chevron {
  -webkit-transform: rotate(90deg);
  transform: rotate(90deg);
  -moz-transform: rotate(90deg);
}

.InfoMN {
  cursor: default;
  padding-left: 1vw;
  width: 50em;
  padding-right: 1vw;
  border-block-color: rgb(0, 0, 0);
  font-size: 100%;
  font-family: sans-serif ;
  text-align: left;
  background-color: #ffffff;
  color:rgb(0, 0, 0)
}

</style>
