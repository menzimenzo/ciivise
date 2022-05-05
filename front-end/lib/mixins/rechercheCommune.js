import logger from '~/plugins/logger'
const log = logger('mixins:rechercheCommune')

export default {
    methods: {
        rechercheCommune: function() {
            const cp = this.cp
            log.i('rechercheCommune -In', { cp })
            if (cp.length === 5) {
                // Le code postal fait bien 5 caractères
                const url = process.env.API_URL + "/listecommune?codepostal=" + this.cp;
                return this.$axios.$get(url)
                .then(({ communes }) => {
                    log.i('rechercheCommune -Done')
                    return this.listecommune = communes;
                })
                .catch(error => {
                    log.i('rechercheCommune -Error', error)
                    return this.$toast.error("Une erreur est survenue lors de la récupération des communes")
                })
            } else {
                log.i('rechercheCommune - Code postal incomplet.')
                // On vide la liste car le code postal a changé
                return this.listecommune = ["Veuillez saisir un code postal"];
            }
        },
        rechercheCommuneByCodeInsee: function(code) {
            log.i('rechercheCommune by codeInsee-In', { code })
            if (code.length === 5) {
                // Le code insee fait bien 5 caractères
                const url = process.env.API_URL + "/listecommune/byCodeInsee?codeinsee=" + code;
                return this.$axios.$get(url)
                .then(({ communes }) => {
                    log.i('rechercheCommune -Done')
                    return this.listecommune = communes;
                })
                .catch(error => {
                    log.i('rechercheCommune -Error', error)
                    return this.$toast.error("Une erreur est survenue lors de la récupération des communes par code insee")
                })
            } else {
                log.i('rechercheCommune - Code insee incomplet.')
                // On vide la liste car le code insee a changé
                return this.listecommune = ["Veuillez saisir un code postal"];
            }
        }
    }
}