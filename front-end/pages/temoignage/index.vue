<template>
  <b-container fluid class="partenaire">
    <b-row>
      <b-col cols="3">
        <Menu @displayDashboard="displayDashboard" />
      </b-col>
      <b-col cols="9" class="custom-box">
        <b-collapse id="depose" accordion="my-accordion" role="tabpanel">
          <b-container>
           <Temoignage  />
          </b-container>
        </b-collapse>
        <b-collapse id="suivi" accordion="my-accordion" role="tabpanel">
          <b-container>
           <Suivitemoignage />
          </b-container>
        </b-collapse>
      </b-col>
    </b-row>
  
  </b-container>
</template>

<script>
import Menu from "~/components/navigation/menu-temoignage.vue"
import Temoignage from '../../components/temoignage/temoignage.vue';
import Suivitemoignage from '../../components/temoignage/suivitemoignage.vue';

export default {
  components: {
    Menu,
    Temoignage,
    Suivitemoignage
  },
  data() {
    return {
      reset:null
    };
  },
  methods: {
    displayDashboard(bool) {
      return this.showDashboard = bool
    },
  }
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
</style>
