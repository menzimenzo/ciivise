<template>
    <div>
      <b-btn
        block
        v-b-toggle.liste-compte-aaq
        href="#"
        variant="Dark link"
        @click.prevent="switchTab(0)"
        :class="activeTab === 0 ? 'activeBg accordionBtn': 'accordionBtn'">
        <h4>
          <i class="material-icons ml-2 mr-1">hourglass_bottom</i> Demandes à valider
        </h4>
      </b-btn>
      <b-btn
        block
        v-b-toggle.histo-demandes
        href="#"
        variant="Dark link"
        @click.prevent="switchTab(1)"
        :class="activeTab === 1 ? 'activeBg accordionBtn': 'accordionBtn'">
        <h4>
          <i class="material-icons ml-2 mr-1">grading</i> Historique des demandes
        </h4>
      </b-btn>
      <b-btn
        block
        v-b-toggle.publication-document
        href="#"
        variant="Dark link"
        @click.prevent="switchTab(2)"
        :class="activeTab === 2 ? 'activeBg accordionBtn': 'accordionBtn'">
        <h4>
          <i class="material-icons ml-2 mr-1">cloud_upload</i> Documents
        </h4>
      </b-btn>
    </div>
</template>

<script>
export default {
    data: function() {
        return  {
            activeTab: null
        }
    },
    methods: {
        switchTab(tab) {
            this.$emit('displayDashboard', false)
            return this.activeTab = tab
        }
    },
    beforeDestroy() {
        return this.$emit('displayDashboard', true)
    }
}
</script>

<style scoped>
.accordionBtn {
  text-align: left;
}

.accordionBtn:focus {
  box-shadow: none;
}

.activeBg {
    background-color: #252195;
    color: white;
}
</style>
