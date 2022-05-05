<template>
    <div>
      <b-row>
        <b-col cols="4">
        <b-btn
          block
          v-b-toggle.liste-temoignage
          href="#"
          variant="Dark link"
          @click.prevent="switchTab(0)"
          :class="activeTab === 0 ? 'activeBg accordionBtn': 'accordionBtn'">
          <h6>
            <i class="material-icons ml-2 mr-1">people</i> Nouveaux témoignages
          </h6>
        </b-btn>
        </b-col>
        <b-col cols="4">
        <b-btn
          block
          v-b-toggle.suivi-dossier
          href="#"
          variant="Dark link"
          @click.prevent="switchTab(1)"
          :class="activeTab === 1 ? 'activeBg accordionBtn': 'accordionBtn'">
          <h6>
            <i class="material-icons ml-2 mr-1">people</i> Suivi témoignages
          </h6>
        </b-btn>
        </b-col>
        <b-col cols="4">
        <b-btn
          block
          v-b-toggle.stat
          href="#"
          variant="Dark link"
          @click.prevent="switchTab(2)"
          :class="activeTab === 2 ? 'activeBg accordionBtn': 'accordionBtn'">
          <h6>
            <i class="material-icons ml-2 mr-1">leaderboard</i> Statistiques
          </h6>
        </b-btn>  
        </b-col>
      </b-row>
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
        return this.$emit('displayDashboard', false)
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
