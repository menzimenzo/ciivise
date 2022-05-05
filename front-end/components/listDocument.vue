<template>
      <b-row>
        <b-col cols="12">
          <h5 >Documents disponibles: </h5>
          <ul v-if="documents.length > 0">
            <li v-for="doc in documents" :key="doc.doc_id">
              <hr/>
              {{doc.doc_libelle}}
              <b-img class="img-icon" fluid  @click="downloadDoc(doc)" :src="require('assets/pdf-240x240.png')" blank-color="rgba(0,0,0,0.5)" />
              <b-button v-if="doc.deletable" variant="danger" class="ml-3" @click="deleteFile(doc.doc_id)" size="sm"><i class="material-icons">delete</i></b-button>
              <br/>
              <div v-for="(i, index) in doc.roleids" :key="i" style="display: inline-block;padding-top:20px;">
                <!-- Admin -->
                <div v-if="doc.roleids[index]===1" style="display: inline-block;width: 250px;">
                  <input type="checkbox" checked="checked" disabled/> {{doc.rolelibelles[index]}}
                </div>
                <div v-else-if="doc.roleauthorized[index]===1" style="display: inline-block;width: 250px;">
                  <input :id="'link-'+doc.doc_id+'-'+doc.roleids[index]" type="checkbox" checked="checked" v-on:click="saveLink(doc.doc_id, doc.roleids[index])"/> {{doc.rolelibelles[index]}}
                </div>
                <div v-else style="display: inline-block;width: 250px;">
                  <input :id="'link-'+doc.doc_id+'-'+doc.roleids[index]" type="checkbox" v-on:click="saveLink(doc.doc_id, doc.roleids[index])"/> {{doc.rolelibelles[index]}}
                </div>
              </div>
            </li>
          </ul>
          <div v-else>Aucun document disponible</div>
        </b-col>
      </b-row>
</template>
<script>
import { mapState } from 'vuex'

import logger from '~/plugins/logger'
const log = logger('components:fileUpload')

export default {
  computed: {
    ...mapState(['documents'])
  },
  methods: {
    deleteFile: function(id) {
      log.i('deleteFile - In')
      return this.$axios.delete(process.env.API_URL + '/documents/' + id)
        .then(res => {
          log.i('deleteFile - Done', res)
          return this.$store.dispatch('get_documents')
        }).catch(err => {
          log.w('deleteFile - error', error)
          return this.$toast.error('Une erreur est survenue lors de la suppression du document.')
        })
    },
    saveLink: function(docId, roleId) {
      let key = "link-"+docId+"-"+roleId
      let checked = document.getElementById(key).checked
      //alert(docId+" "+roleId+" "+checked)
      log.i('saveLink - In')
      let params = {docId, roleId, checked}
      this.$axios.post(process.env.API_URL + '/documents/link', { params }
      ).then((response) => {
        log.d('saveLink - Response from the server')

        log.i('saveLink - Done')
      }).catch(err => {
        log.w('deleteFile - error', error)
        return this.$toast.error('Une erreur est survenue lors de l\'enregistrement du lien document/role.')
      })
    },
    downloadDoc: function(doc) {
      log.i('downloadDoc - In')
      this.$axios({
        url: process.env.API_URL + '/documents/'+doc.doc_id,
        method: 'GET',
        responseType: 'blob'
      }).then((response) => {
        log.d('downloadDoc - Response from the server')
        // Crée un objet blob avec le contenue du CSV et un lien associé
        const url = window.URL.createObjectURL(new Blob([response.data]))
        // Crée un lien caché pour télécharger le fichier
        const link = document.createElement('a')
        link.href = url
        const fileName = doc.doc_filename
        link.setAttribute('download', fileName)
        // Télécharge le fichier
        link.click()
        link.remove()
        log.i('downloadDoc - Done')
      }).catch(err => {
        log.w('deleteFile - error', error)
        return this.$toast.error('Une erreur est survenue lors du téléchargement du document.')
      })
    },
  },
  mounted(){
    this.$store.dispatch('get_documents')
  }
};
</script>
