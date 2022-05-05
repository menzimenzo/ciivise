<template>
  <section class="container">
    <b-container class="profil">
      <b-row>
        <b-col cols="8" offset="2" >
            <div class="text-center mb-3">
              <h1>
                Édition des informations
              </h1>
            </div>
            <user-infos :user="user" :submit-txt="'Enregistrer'" @submit="editProfile" @cancel="cancelEdit" :cancelable="true"/>
        </b-col>
      </b-row>
    </b-container>
  </section>
</template>

<script>
import { mapState } from 'vuex'
import logger from '~/plugins/logger'
const log = logger('pages:index')

export default {
  computed: {
    ...mapState({
      'user': state => JSON.parse(JSON.stringify(state.utilisateurCourant))
    }),
  },
  methods: {
    async editProfile(){
      const url = process.env.API_URL + `/connexion/edit-mon-compte/${this.user.id }`
      log.i('editProfile - In', { url })
      return this.$axios.$put(url, { profil: this.user })
      .then(async response => {
          log.i('editProfile - done', { response })
          await this.$store.dispatch('set_utilisateur', response.user);
          this.$toast.success('Profil enregistré avec succès.')
          // On renvoie vers la route par défaut (redirigé en fonction du profil par le middleware)
          this.$router.push('/')

      }).catch(err => {
        log.w('editProfile - Error', { err })
      })
    },
    async cancelEdit(){
      // Annulation des modifications.
      this.$router.push('/')
    },

  },
  components: {
    userInfos: () => import('~/components/userInfos.vue')
  }
};
</script>
