<template>
    <div>
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
