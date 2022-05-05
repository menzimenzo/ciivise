<template>
    <div>
        <b-btn
          block
          v-b-toggle.depose
          href="#"
          variant="Dark link"
          @click.prevent="switchTab(1)"
          :class="activeTab === 1 ? 'activeBg accordionBtn': 'accordionBtn'">
          <h4>
            <i class="material-icons ml-2 mr-2">visibility_off</i>Déposer un témoignage
          </h4>
        </b-btn>
           <b-btn
          block
          v-b-toggle.suivi
          href="#"
          variant="Dark link"
          @click.prevent="switchTab(2)"
          :class="activeTab === 2 ? 'activeBg accordionBtn': 'accordionBtn'">
          <h4>
            <i class="material-icons ml-2 mr-2">assignment</i>Suivi d'un témoignage
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
