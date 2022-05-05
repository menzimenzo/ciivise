<template>
  <b-container class="deleteUserModal">
	  <p>Êtes-vous certain de vouloir supprimer l'utilisateur <strong>{{ userToDelete.nom + ' ' + userToDelete.prenom}}</strong> ?</p>
	  <div class="actions">
		  <button v-on:click="$modal.hide('confirmDeleteUser')" class="btn btn-danger">Annuler</button>
		  <button v-on:click="deleteUser(userToDelete.id);$modal.hide('confirmDeleteUser');" class="btn btn-primary">Confirmer</button>
    </div>
    <br/>
  </b-container>
</template>
<script>

import logger from '~/plugins/logger'
const log = logger('components:confirmation')

export default {
  props : {
    userToDelete: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  methods : {
    deleteUser(userId){
      const url = process.env.API_URL + "/user/"+userId;
      return this.$axios.$delete(url)
        .then(() => {
          log.i('deleteUser -Done');
          this.$store.dispatch("get_users").catch(error => {
            log.w('mounted - Error', error)
            return this.$toast.error('Une erreur est survenue lors de la récupération des users');
          })
        })
        .catch(error => {
          log.i('suiviDemandes -Error', error)
          return this.$toast.error("Une erreur est survenue lors de la suppression d'un user");
        });
    },

  }
}
</script>



