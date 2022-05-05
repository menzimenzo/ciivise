<template>
  <section class="container">
    <b-container class="inscription_validation">
      <b-row>
        <b-col cols="8" offset="2" >
            <div class="text-center mb-3">
              <h1>
                Validation de l'inscription
              </h1>
            </div>
            <user-infos :user="user" :submit-txt="'Je valide mon compte'" @submit="confirmRegistration" :cancelable="false"/>
        </b-col>
      </b-row>
      <modal name="confirmIdentityModal" height="auto" width="900px" :scrollabe="true">
        <connection-form  @submit="confirmUserInfos" :hasToConfirmMail="true" information="Cet email est déjà utilisé sur Aisance Aquatique, veuillez confirmer votre mot de passe." />
      </modal>
    </b-container>
  </section>
</template>

<script>
import { mapState } from 'vuex'
import logger from '~/plugins/logger'
const log = logger('pages:connexion/inscription')

export default {
  components: {
    connectionForm: () => import('~/components/connectionForm.vue'),
    userInfos: () => import('~/components/userInfos.vue')
  },
  computed: {
    ...mapState({
      'user': state => JSON.parse(JSON.stringify(state.utilisateurCourant))
    }),
  },
  methods: {
    // Validation de l'inscription
    confirmRegistration(){
      log.i('confirmRegistration - In')
      const url = process.env.API_URL + '/connexion/verify'
      const body = JSON.parse(JSON.stringify(this.user))
      if (this.user.email) {
        body['mail'] = this.user.email
      }
      return this.$axios.$post(url, body)
        .then(async response => {
          log.i('confirmRegistration - done', { response })          
          if (response.existingUser) {
            this.$modal.show('confirmIdentityModal')
            return 
          }
          if (response.nonAuthorizedUser){
            this.$toast.error(response.nonAuthorizedUser)
            return
          } else if (!response.isPwdConfirmed && !response.user.tokenFc) {
            this.$toast.info("Un email de confirmation d'inscription vous a été envoyé. Veuillez cliquer sur le lien contenu dans ce mail.")
            await this.$store.dispatch('set_utilisateur', null);            
            return this.$router.push('/')
           } else {
            await this.$store.dispatch('set_utilisateur', response.user);
            this.$toast.success('Inscription validée.')
            return this.$router.push('/accueil')
           }
        }).catch(error => {
          log.w('confirmRegistration - Error', { error })
          this.$toast.error(error)
        })
    },
    confirmUserInfos(connexionInfos) {
      log.i('confirmUserInfos - In', { connectionInfos })
      const url = process.env.API_URL + '/connexion/confirm-profil-infos'
      const user = this.user
      user['password'] = connexionInfos.password
      return this.$axios.$put(url, {user})
        .then(async user => {
          log.i('confirmUserInfos - Done', { user })
          await this.$store.dispatch('set_utilisateur', user)
          // Route pour les Maîtres nagueurs MN
          this.$router.push('/accueil')
          this.$toast.success(`Bienvenue ${user.prenom}`)
          this.$toast.info(`Vous pouvez maintenant vous connecter via France Connect et via mot de passe!`)
        }).catch(error => {
          log.w('confirmUserInfos - Error', { error })          
          const err = error.response.data.message || error.message
          this.$toast.error(err)
        })
      
    }
  }
};
</script>
