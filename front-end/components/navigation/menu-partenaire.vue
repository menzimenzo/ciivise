<template>
    <div>
        <b-btn
          block
          v-b-toggle.interventionsStructure
          href="#"
          variant="Dark link"
          @click.prevent="switchTab(0)"
          :class="activeTab === 0 ? 'activeBg accordionBtn': 'accordionBtn'">
          <h4>
            <i class="material-icons ml-2 mr-1">list</i> Interventions de ma structure
          </h4>
        </b-btn>
        <b-btn
          block
          v-b-toggle.addIntervention
          href="#"
          variant="Dark link"
          @click.prevent="switchTab(1)"
          :class="activeTab === 1 ? 'activeBg accordionBtn': 'accordionBtn'">
          <h4>
            <i class="material-icons ml-2 mr-1">create</i> Je saisis une intervention
          </h4>
        </b-btn>
        <b-btn
          block
          v-b-toggle.piscines
          href="#"
          variant="Dark link"
          @click.prevent="switchTab(2)"
          :class="activeTab === 2 ? 'activeBg accordionBtn': 'accordionBtn'">
          <h4>
            <i class="material-icons ml-2 mr-2">pool</i>Mes Piscines
          </h4>
        </b-btn>
        <b-btn
          block
          v-b-toggle.structures
          href="#"
          variant="Dark link"
          @click.prevent="switchTab(3)"
          :class="activeTab === 3 ? 'activeBg accordionBtn': 'accordionBtn'">
          <h4>
            <i class="material-icons ml-2 mr-2">category</i>Ma Structure organisatrice
          </h4>
        </b-btn>
        <b-btn
          block
          v-b-toggle.statistiques
          href="#"
          variant="Dark link"
          @click.prevent="switchTab(4)"
          :class="activeTab === 4 ? 'activeBg accordionBtn': 'accordionBtn'">
          <h4>
            <i class="material-icons ml-2 mr-2">equalizer</i>Statistiques
          </h4>
        </b-btn>
        <b-btn
          block
          v-b-toggle.documents
          href="#"
          variant="Dark link"
          @click.prevent="switchTab(5)"
          :class="activeTab === 5 ? 'activeBg accordionBtn': 'accordionBtn'">
          <h4>
            <i class="material-icons ml-2 mr-2">source</i>Documents utiles
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
            if (tab === 1) {
              this.$emit('resetForm')
            }
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
