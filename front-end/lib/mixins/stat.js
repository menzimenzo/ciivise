import _ from 'lodash';

export default {
    methods: {
        TemplateStats: function () {
            this.a_type = ""
            this.nbIntervention = 0
            this.nbEnfants = 0
            this.nbSession = 0
            this.nbIntervenant = 0
            this.duree = 0
            this.nbSubANS = 0
            this.nbIntervenant = 0
            this.nbEnfantMensuel = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            this.nbEnfantMensuelNiv0 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            this.nbEnfantMensuelNiv1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            this.nbEnfantMensuelNiv2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            this.nbEnfantMensuelNiv3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            this.labelsHisto = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            this.typestructure = [0, 0, 0]
            this.cai = [0, 0, 0, 0]
            this.statsSynthe = []
            this.piscine = []
            this.intervenant = []
            this.utilisateurSansIntervention = []
            this.utilisateurAvecIntervention = []
            this.tauxConversionUtilisateur = 0
        },
        roundDecimal: function (nombre, precision) {
            var precision = precision || 2;
            var tmp = Math.pow(10, precision);
            return Math.round(nombre * tmp) / tmp;
        },
        statCal: function (interventions, users) {
            let stat = {}
            let indiceBase = null;
            let anneeBase = null;
            let labelBase = null;
            // stat globales
            stat[0] = new this.TemplateStats()
            stat[0].a_type = "Toutes les interventions"
            // stat CL
            stat[1] = new this.TemplateStats()
            stat[1].a_type = "Collectivités"
            // stat Clubs
            stat[2] = new this.TemplateStats()
            stat[2].a_type = "Clubs"
            // stat Ecoles
            stat[3] = new this.TemplateStats()
            stat[3].a_type = "Ecoles"


            /* ===== INTERVENTIONS ===== */
            interventions.forEach(intervention => {
                const typeStructure = intervention.structure.type
                const mois = Number(new Date(intervention.dateFinIntervention).getMonth()) + 1;
                const annee = Number(new Date(intervention.dateFinIntervention).getYear());
                const nbEnfants = Number(intervention.nbEnfants);
                const enfants = intervention.enfant
                const cai = Number(intervention.cai);
                const nbIntervenant = Number(intervention.utilisateur.length)
                const nbSession = Number(intervention.nbSession)
                const piscineId = intervention.piscine.id
                const intervenant = intervention.utilisateur
                const duree = (new Date(intervention.dateFinIntervention).getTime() - new Date(intervention.dateDebutIntervention).getTime()) / (1000 * 3600 * 24)
                let indiceMensuel = -1
                let indiceMensuelCorrige = -1
                let indiceAnnuel = -1

                /* ===  PREPARATION DES INDICES === */
                // tous les tableaux sont indicés sur indiceMensuel qui est a 0 pour la plus ancienne intervention (date de fin)
                if (indiceBase === null) {
                    indiceBase = annee * 12 + mois
                    if (mois < 10) {
                        labelBase = Number(1900 + annee) + "-0" + Number(mois);
                    } else {
                        labelBase = Number(1900 + annee) + "-" + Number(mois);
                    }
                }
                indiceMensuel = annee * 12 + mois - indiceBase
                // l'indice mensuel corrige sert pour les séries annualisées
                indiceMensuelCorrige = mois - 1
                if (anneeBase === null) {
                    anneeBase = annee
                }
                // on ajoute 4 car le 0, 1, 2 et 3 sont prix par le national, les CL, les Clubs et les écoles
                indiceAnnuel = annee - anneeBase + 4

                // on crée la variable de stat annuelle si elle n'existe pas
                if (!stat[indiceAnnuel]) {
                    stat[indiceAnnuel] = new this.TemplateStats()
                    stat[indiceAnnuel].a_type = annee + 1900
                }

                // recension des piscines uniques
                if (stat[0].piscine.indexOf(piscineId) === -1) {
                    stat[0].piscine.push(piscineId)
                }
                if (stat[typeStructure].piscine.indexOf(piscineId) === -1) {
                    stat[typeStructure].piscine.push(piscineId)
                }
                if (stat[indiceAnnuel].piscine.indexOf(piscineId) === -1) {
                    stat[indiceAnnuel].piscine.push(piscineId)
                }
                // recension des intervenants uniques
                intervenant.forEach(uti => {
                    if (stat[0].intervenant.indexOf(uti.id) === -1) {
                        stat[0].intervenant.push(uti.id)
                    }
                    if (stat[typeStructure].intervenant.indexOf(uti.id) === -1) {
                        stat[typeStructure].intervenant.push(uti.id)
                    }
                    if (stat[indiceAnnuel].intervenant.indexOf(uti.id) === -1) {
                        stat[indiceAnnuel].intervenant.push(uti.id)
                    }
                })

                stat[0].nbIntervention++
                stat[typeStructure].nbIntervention++
                stat[indiceAnnuel].nbIntervention++
                stat[0].nbEnfants += nbEnfants
                stat[typeStructure].nbEnfants += nbEnfants
                stat[indiceAnnuel].nbEnfants += nbEnfants
                stat[0].nbSession += nbSession
                stat[typeStructure].nbSession += nbSession
                stat[indiceAnnuel].nbSession += nbSession
                stat[0].cai[cai - 1]++
                stat[typeStructure].cai[cai - 1]++
                stat[indiceAnnuel].cai[cai - 1]++
                stat[0].duree += duree
                stat[typeStructure].duree += duree
                stat[indiceAnnuel].duree += duree
                stat[0].typestructure[typeStructure - 1]++
                stat[typeStructure].typestructure[typeStructure - 1]++
                stat[indiceAnnuel].typestructure[typeStructure - 1]++
                stat[0].nbIntervenant = stat[0].nbIntervenant + nbIntervenant
                stat[typeStructure].nbIntervenant += nbIntervenant
                stat[indiceAnnuel].nbIntervenant += nbIntervenant
                // Calcul des stats mensuelles
                if (!stat[0].nbEnfantMensuel[indiceMensuel]) {
                    stat[0].nbEnfantMensuel[indiceMensuel] = 0
                    stat[0].nbEnfantMensuelNiv0[indiceMensuel] = 0
                    stat[0].nbEnfantMensuelNiv1[indiceMensuel] = 0
                    stat[0].nbEnfantMensuelNiv2[indiceMensuel] = 0
                    stat[0].nbEnfantMensuelNiv3[indiceMensuel] = 0
                }
                stat[0].nbEnfantMensuel[indiceMensuel] += nbEnfants

                if (!stat[typeStructure].nbEnfantMensuel[indiceMensuel]) {
                    stat[typeStructure].nbEnfantMensuel[indiceMensuel] = 0
                    stat[typeStructure].nbEnfantMensuelNiv0[indiceMensuel] = 0
                    stat[typeStructure].nbEnfantMensuelNiv1[indiceMensuel] = 0
                    stat[typeStructure].nbEnfantMensuelNiv2[indiceMensuel] = 0
                    stat[typeStructure].nbEnfantMensuelNiv3[indiceMensuel] = 0
                }
                stat[typeStructure].nbEnfantMensuel[indiceMensuel] += nbEnfants

                if (!stat[indiceAnnuel].nbEnfantMensuel[indiceMensuelCorrige]) {
                    stat[indiceAnnuel].nbEnfantMensuel[indiceMensuelCorrige] = 0
                    stat[indiceAnnuel].nbEnfantMensuelNiv0[indiceMensuelCorrige] = 0
                    stat[indiceAnnuel].nbEnfantMensuelNiv1[indiceMensuelCorrige] = 0
                    stat[indiceAnnuel].nbEnfantMensuelNiv2[indiceMensuelCorrige] = 0
                    stat[indiceAnnuel].nbEnfantMensuelNiv3[indiceMensuelCorrige] = 0
                }
                stat[indiceAnnuel].nbEnfantMensuel[indiceMensuelCorrige] += nbEnfants

                // boucle sur les enfants pour récupérer le détail par niveau
                enfants.forEach(enfant => {
                    switch (enfant.niv_fin) {
                        case "0":
                            stat[0].nbEnfantMensuelNiv0[indiceMensuel]++
                            stat[typeStructure].nbEnfantMensuelNiv0[indiceMensuel]++
                            stat[indiceAnnuel].nbEnfantMensuelNiv0[indiceMensuelCorrige]++
                            break;
                        case "1":
                            stat[0].nbEnfantMensuelNiv1[indiceMensuel]++
                            stat[typeStructure].nbEnfantMensuelNiv1[indiceMensuel]++
                            stat[indiceAnnuel].nbEnfantMensuelNiv1[indiceMensuelCorrige]++
                            break;
                        case "2":
                            stat[0].nbEnfantMensuelNiv2[indiceMensuel]++
                            stat[typeStructure].nbEnfantMensuelNiv2[indiceMensuel]++
                            stat[indiceAnnuel].nbEnfantMensuelNiv2[indiceMensuelCorrige]++
                            break;
                        case "3":
                            stat[0].nbEnfantMensuelNiv3[indiceMensuel]++
                            stat[typeStructure].nbEnfantMensuelNiv3[indiceMensuel]++
                            stat[indiceAnnuel].nbEnfantMensuelNiv3[indiceMensuelCorrige]++
                            break;
                        default:
                    }
                })
            })

            let histoBase = new Date(new Date(labelBase).getYear() + 1900, Number(new Date(labelBase).getMonth()))
            for (let j in stat) {
                // Mise à jour des valeurs vides
                for (let i = 0; i < stat[j].nbEnfantMensuel.length; i++) {
                    if (!stat[j].nbEnfantMensuel[i]) {
                        stat[j].nbEnfantMensuel[i] = 0
                        stat[j].nbEnfantMensuelNiv0[i] = 0
                        stat[j].nbEnfantMensuelNiv1[i] = 0
                        stat[j].nbEnfantMensuelNiv2[i] = 0
                        stat[j].nbEnfantMensuelNiv3[i] = 0
                    }

                    if (j < 4) {
                        // calcul des labels pour les séries dont on ne connait pas le nombre d'élements
                        let maDate = new Date(histoBase.getYear() + 1900, histoBase.getMonth())
                        maDate = (new Date(maDate.setMonth(histoBase.getMonth() + i)))
                        stat[j].labelsHisto[i] = maDate.toLocaleDateString().substring(3)
                    }
                    else {
                        // pour les séries avec j >= 4 (les séries annuelles)
                        i < 9 ? stat[j].labelsHisto[i] = '0' + (i + 1) + '/' + stat[j].a_type : stat[j].labelsHisto[i] = (i + 1) + '/' + stat[j].a_type
                    }
                }
                // calcul des valeurs moyennees

                stat[0].statsSynthe[j] = {
                    a_type: stat[j].a_type,
                    nbIntervention: stat[j].nbIntervention,
                    nbEnfants: stat[j].nbEnfants,
                    nbEnfantsMoyen: this.roundDecimal(stat[j].nbEnfants / stat[j].nbIntervention, 2),
                    nbSession: stat[j].nbSession,
                    nbSessionMoyen: this.roundDecimal(stat[j].nbSession / stat[j].nbIntervention, 2),
                    nbIntervenant: stat[j].nbIntervenant + ' (' + stat[j].intervenant.length + ')',
                    nbIntervenantMoyen: this.roundDecimal(stat[j].nbIntervenant / stat[j].nbIntervention, 2),
                    dureeMoyenne: this.roundDecimal(stat[j].duree / stat[j].nbIntervention, 2),
                    nbSubANS: stat[j].nbSubANS,
                    nbPiscine: stat[j].piscine.length
                }
            }

            // statistiques sur les utilisateurs
            users.forEach(us => {
                if (us.role == 4 || us.role == 3) {
                    if (stat[0].intervenant.indexOf(us.id) === -1) {
                        stat[0].utilisateurSansIntervention.push(us.id)
                    }
                    else {
                        stat[0].utilisateurAvecIntervention.push(us.id)
                    }
                }
            })
            this.$store.commit('set_statStructure', stat)
        }
    }
}
