<template>
  <section class="container">
    <div class="mb-5 mt-5 text-center">
      <h1>
        Connexion en cours...
      </h1>
    </div>
  </section>
</template>

<script>
import logger from '~/plugins/logger'
const log = logger('pages:connexion/login')

export default {
  data() {
    return {
    };
  },
  async mounted() {
    log.i('mounted - In')
    const url = process.env.API_URL + '/connexion/callback?code=' + this.$route.query.code + '&state=' + this.$route.query.state
    this.$axios.$get(url)
    .then(async response => {
      log.i('mounted - Done')
      await this.$store.dispatch('set_utilisateur', response.user);
      return this.$router.push(response.url)
    }).catch(err => {
      log.w('mounted - error', { err })
    })
  }
};
</script>
