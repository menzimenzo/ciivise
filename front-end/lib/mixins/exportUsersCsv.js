import logger from '~/plugins/logger'
const log = logger('mixins:exportUsersCsv')

export default {
    methods: {
        exportUsersCsv() {
            log.i('exportUsersCsv - In')
            return this.$axios({
                url: process.env.API_URL + "/user/csv",
                method: "GET",
                responseType: "blob"
            })
            .then(response => {
            log.d('exportUsersCsv - response from server')
            // Crée un objet blob avec le contenue du CSV et un lien associé
            const url = window.URL.createObjectURL(new Blob([response.data]));
            // Crée un lien caché pour télécharger le fichier
            const link = document.createElement("a");
            link.href = url;
            const fileName = "Aisance Aquatique - Utilisateurs.csv";
            link.setAttribute("download", fileName);
            // Télécharge le fichier
            link.click();
            link.remove();
            log.i('exportUsersCsv - Done Dowload', { fileName })
            })
            .catch(err => {
            log.w('exportUsersCsv - Error', JSON.stringify(err))
            return this.$toasted.error("Erreur lors du téléchargement: " + err.message);
            });
        },
        exportUsersCsvDemandes(statut) {
            log.i('exportUsersCsvDemandes - In')
            return this.$axios({
                url: process.env.API_URL + "/user/csvdemandes/"+statut,
                method: "GET",
                responseType: "blob"
            })
            .then(response => {
            log.d('exportUsersCsvDemandes - response from server')
            // Crée un objet blob avec le contenue du CSV et un lien associé
            const url = window.URL.createObjectURL(new Blob([response.data]));
            // Crée un lien caché pour télécharger le fichier
            const link = document.createElement("a");
            link.href = url;
            const fileName = "Aisance Aquatique "+statut.toLowerCase()+" - Utilisateurs.csv";
            link.setAttribute("download", fileName);
            // Télécharge le fichier
            link.click();
            link.remove();
            log.i('exportUsersCsvDemandes - Done Dowload', { fileName })
            })
            .catch(err => {
            log.w('exportUsersCsvDemandes - Error', JSON.stringify(err))
            return this.$toasted.error("Erreur lors du téléchargement: " + err.message);
            });
        }
    }
}
