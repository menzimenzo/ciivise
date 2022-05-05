import logger from '~/plugins/logger'
const log = logger('mixins:rechercheDepartement')

export default {
    methods: {
        getDepartements: function () {
        log.i("getDepartements - In");
        const url = process.env.API_URL + "/listedepartement";
        return this.$axios.$get(url)
            .then(({ departements }) => {
                log.i("getDepartements - Done");
                return (this.listdepartement = departements);
            })
            .catch((error) => {
                log.i("getDepartements - Error", error);
                return this.$toast.error("Une erreur est survenue lors de la récupération des départements");
            });
        },
        rechercheDepartement: function(code) {
            log.i('rechercheDepartement by id-In', { code })
            const url = process.env.API_URL + "/listedepartement/"+code;
            return this.$axios.$get(url)
            .then(({ departement }) => {
                log.i('rechercheDepartement -Done')
                return departement;
            })
            .catch(error => {
                log.i('rechercheDepartement -Error', error)
                return this.$toast.error("Une erreur est survenue lors de la récupération du département")
            })
           
        }
    }
}