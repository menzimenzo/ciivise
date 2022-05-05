import logger from '~/plugins/logger'
const log = logger('mixins:rechercheDepartement')

export default {
    methods: {
        rechercheEpciById: function(code) {
            log.i('rechercheEpciById - In', { code })
            const url = process.env.API_URL + "/listepci/"+code;
            return this.$axios.$get(url)
            .then(({ epci }) => {
                log.i('rechercheEpciById -Done')
                return  this.listepci = epci ;
            })
            .catch(error => {
                log.i('rechercheEpciById -Error', error)
                return this.$toast.error("Une erreur est survenue lors de la récupération de l'EPCI")
            })
        },
        rechercheEpci: function () {
            log.i("rechercheEpci - In");
            if (this.cpEpci && this.cpEpci.length === 5) {
              // Le code postal fait bien 5 caractères
              const url = process.env.API_URL + "/listepci?codepostal=" + this.cpEpci;
              return this.$axios
                .$get(url)
                .then((response) => {
                  log.i("rechercheEpci - Done");
                  if (response.epci && response.epci.length == 0) {
                    this.boolEpci = false;
                  } else {
                    this.boolEpci = true;
                    this.listepci = response.epci;
                  }
                })
                .catch((error) => {
                  log.i("rechercheEpci - Error", error);
                  return this.$toast.error(
                    "Une erreur est survenue lors de la récupération des EPCI"
                  );
                });
            } else {
              // On vide la liste car le code postal a changé
              this.listepci = ["Veuillez saisir un code postal"];
              this.boolEpci = false;
              return Promise.resolve(null);
            }
        }
    }
}