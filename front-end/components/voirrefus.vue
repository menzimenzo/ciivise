<template>
  <b-container class="voirRefusModal">
	  <p>Motif de refus</p>
    <b-form-textarea
      id="textarea1" 
      v-model="motifrefus"
      placeholder
      readonly="true"
      :rows="4"
    ></b-form-textarea>
    <br/>
	  <div class="actions">
		  <button v-on:click="$modal.hide('voirrefus')" class="btn btn-success">Fermer</button>
    </div>
    <br/>
  </b-container>
</template>
<script>

import logger from '~/plugins/logger'
const log = logger('components:voirrefus')

export default {
  props : {
    motifrefus: {
      type: Object,
      default: () => {
        return {};
      }
    }
  }
}
</script>



