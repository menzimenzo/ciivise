<template>
  <main role="main" class="main validate-pwd">
    <div class="container" role="grid">
      <div
        v-if="!error"
        class="alert alert-info"
        role="alert"
        data-test-alert="validation">
        Validation en cours, vous allez être redirigé automatiquement ...
      </div>
      <div
        v-else
        class="alert alert-warning"
        role="alert"
        data-test-alert="sent">
        Une erreur est survenue. Veuillez réessayer ultérieurement.
      </div>
      <clip-loader :loading="loading" :color="primaryColor" />
    </div>
  </main>
</template>

<script>
import logger from '~/plugins/logger'
const log = logger('lca:pages:validate:_pwd')
import { mapGetters } from 'vuex'
import ClipLoader from '~/node_modules/vue-spinner/src/ClipLoader.vue'

export default {
    layout: '',
    components: {
        ClipLoader
    },
    data() {
        return {
            loading: false,
            error: null
        }
    },
    computed: mapGetters(['primaryColor']),
    mounted() {
        if (this.$Countly && this.$Countly.track_pageview) {
            this.$Countly.track_pageview('/validate/_pwd')
        }
        const pwd = this.$route.params.pwd
        const id = this.$route.query.id
        const url = `${process.env.API_URL}/connexion/enable-mail/${pwd}/user/${id}`
        log.i('mounted - In', { url, pwd, id})
        this.loading = true
        return this.$axios.$get(url)
            .then(res => {
                log.d('mounted - Email validé', res)
                this.$toast.success('Votre mot de passe a été validé.')            
                this.$store.dispatch('set_utilisateur', res.user);
                log.i('mounted - Done')

                // Admin on redirige vers l'écran Admin
                if (res.user.profilId == 1) {
                  return this.$router.push('/admin')
                } else
                if (res.user.profilId == 2 ) {
                  return this.$router.push('/partenaire')
                } else
                if ( res.user.profilId == 7) {
                  return this.$router.push('/proprietaire')
                } else
                // Formateur on redirige vers la liste des MNS AAQ
                if (res.user.profilId == 3) {
                    return this.$router.push('/formateur')
                } else
                // MN AAQ On redirige vers interventions
                if (res.user.profilId == 4) {

                  const url = process.env.API_URL + '/parametres?code=AFFICHE_INTER'
                  this.$axios.$get(url)
                  .then(response => {
                    if (response.par_valeur === "1") {
                      return this.$router.push('/interventions')
                    } else {
                      return this.$router.push('/pageenconstruction')
                    }
                  }).catch(err => {
                    log.w("mounted home - Error on mounted", err);
                  })
   
                } else
                if (res.user.profilId == 5) {
                    return this.$router.push('/accueil')
                }                
                // Structure de Référence
                else if (res.user.profilId == 6) {
                  return this.$router.push('/structureref')
                }
                // Maitre nageur de base sans autorisation, on redirige vers la page d'accueil MN
                else {
                  return this.$router.push('/accueil')
                }
            })
            .catch(e => {
                const message = e.response && e.response.data && e.response.data.message || e.message
                log.w('mounted - validation', message)
                this.$toast.error(message)
                this.error = message
            })
            .finally(() => {
                this.loading = false
            })
    }
}
</script>

<style scoped>
.validate-pwd .container {
    margin-top: 20px;
}
</style>
