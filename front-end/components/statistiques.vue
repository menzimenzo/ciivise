<template>
  <b-container>
    <b-row align="left">
      Veuillez sélectionner le périmètre des interventions pris en compte :
      <b-form-select
        v-model="typeStat"
        v-on:change="
          viewHisto(typeStat);
          viewDoughnut(typeStat);
        "
      >
        <option
          v-for="(annee, index) in stat"
          :key="annee.a_type"
          :value="index"
        >
          {{ annee.a_type }}
        </option>
      </b-form-select>
    </b-row>
    <b-row align="left"> &nbsp; </b-row>
    <b-row align="left">
      <b-col align="left">
        <h5>
          <i class="material-icons ml-2 mr-1">attribution</i> Evolution
          mensuelle du nombre d'enfants formés<br />
        </h5>
        <barChart
          :chartdata="this.data1"
          :options="this.optionsHisto"
          :width="800"
          :height="400"
        />
      </b-col>
    </b-row>
    <b-row align="left"> &nbsp; </b-row>
    <b-row align="left"> &nbsp; </b-row>
    <b-row align="left">
      <b-col align-self="center">
        <h5>
          <i class="material-icons ml-2 mr-1">attribution</i> Répartition par
          cadre d'intervention<br />
        </h5>
        <doughnut-chart
          :chartdata="data2"
          :options="optionsDoughnut"
          :width="300"
          :height="300"
        />
      </b-col>
      <b-col align-self="center">
        <h5>
          <i class="material-icons ml-2 mr-1">attribution</i> Répartition par
          type de structure<br />
        </h5>
        <doughnut-chart
          :chartdata="data3"
          :options="optionsDoughnut"
          :width="300"
          :height="300"
        />
      </b-col>
      <b-col align-self="center">
        <h5>
          <i class="material-icons ml-2 mr-1">attribution</i> Taux d'utilisateurs actifs<br />
        </h5>
        <doughnut-chart
          :chartdata="data4"
          :options="optionsDoughnut"
          :width="300"
          :height="300"
        />
      </b-col>
    </b-row>
    <b-row align="left"> &nbsp; </b-row>
    <b-row align="left"> &nbsp; </b-row>
    <b-row align="left">
      <h5>
          <i class="material-icons ml-2 mr-1">attribution</i> Tableau de synthèse<br />
        </h5>
      <editable
              :columns="headers"
              :data=stat[0].statsSynthe
              :removable="false"
              :creable="false"
              :editable="false">
            </editable>
    </b-row>
  </b-container>
</template>
<script>
import Editable from "~/components/editable/index.vue";
import BarChart from "~/components/stat/histogramme.vue";
import DoughnutChart from "~/components/stat/doughnut.vue";
import logger from "~/plugins/logger";
const log = logger("components:Statistiques");

export default {
  props: {
    stat: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  components: {
    BarChart,
    DoughnutChart,
    Editable
  },
  data() {
    return {
      data1: {},
      data2: {},
      data3: {},
      data4: {},
      optionsHisto: {},
      optionsDoughnut: {},
      typeStat: 0,
      headers: [
        { path: "a_type", title: "Périmètre", type: "text", sortable: true },
        { path: "nbIntervention", title: "Nb interventions", type: "text", sortable: true },
        { path: "nbEnfants", title: "Nb enfants", type: "text", sortable: true },
        { path: "nbEnfantsMoyen", title: "Moy. enfants", type: "text", sortable: true },
        { path: "nbSession", title: "Nb sessions", type: "text", sortable: true },
        { path: "nbSessionMoyen", title: "Moy. sessions", type: "text", sortable: true },
        { path: "nbIntervenant", title: "Nb intervenants (dont différent)", type: "text", sortable: true },
        { path: "nbIntervenantMoyen", title: "Moy. intervenants", type: "text", sortable: true },
        { path: "nbPiscine", title: "Nb piscines", type: "text", sortable: true },
      ],
      listecadreintervention: [
        { text: `Scolaire`, value: "1" },
        { text: `Péri-scolaire`, value: "2" },
        { text: `Extra-scolaire`, value: "3" },
        { text: `Privé`, value: "4" },
      ],
      listeclasse: [
        { text: `Petite section`, value: "3" },
        { text: `Moyenne section`, value: "4" },
        { text: `Grande section`, value: "5" },
        { text: `Cours préparatoire`, value: "6" },
      ],
    };
  },
  methods: {
    viewHisto(indice) {
      this.data1 = {
        labels: this.stat[indice].labelsHisto,
        datasets: [
          {
            label: "débutant",
            backgroundColor: "#FF9914",
            yAxisID: "A",
            stack: "st1",
            data: this.stat[indice].nbEnfantMensuelNiv0,
          },
          {
            label: "palier 1",
            backgroundColor: "#F21B3F",
            yAxisID: "A",
            stack: "st1",
            data: this.stat[indice].nbEnfantMensuelNiv1,
          },
          {
            label: "palier 2",
            backgroundColor: "#08BDBD",
            yAxisID: "A",
            stack: "st1",
            data: this.stat[indice].nbEnfantMensuelNiv2,
          },
          {
            label: "palier 3",
            backgroundColor: "#CCCCDD",
            yAxisID: "A",
            stack: "st1",
            data: this.stat[indice].nbEnfantMensuelNiv3,
          },
        ],
      };
      this.optionsHisto = {
        responsive: false,
        maintainAspectRatio: true,
        legend: {
          display: true,
        },
        scales: {
          xAxes: [
            {
              id: "st1",
              stacked: true
            },
          ],
          yAxes: [
            {
              id: "A",
              type: "linear",
              display: true,
              position: "left",
              min: 0,
              max: 15,
              stacked: true,
            },
          ],
        },
      };
    },
    viewDoughnut(indice) {
      // Définition de l'objet Data envoyé au 2eme graphique
      this.data2 = {
        datasets: [
          {
            backgroundColor: ["#FF9914", "#F21B3F", "#08BDBD", "#CCCCDD"],
            data: [
              this.stat[indice].cai[0],
              this.stat[indice].cai[1],
              this.stat[indice].cai[2],
              this.stat[indice].cai[3],
            ],
            labels: ["Scolaire", "Péri-scolaire", "Extra-scolaire", "Privé"],
          },
        ],
        labels: ["Scolaire", "Péri-scolaire", "Extra-scolaire", "Privé"],
      };
      this.data3 = {
        datasets: [
          {
            backgroundColor: ["#FF9914", "#F21B3F", "#08BDBD", "#CCCCDD"],
            data: [
              this.stat[indice].typestructure[0],
              this.stat[indice].typestructure[1],
              this.stat[indice].typestructure[2],
            ],
            labels: ["Collectivités", "Clubs / associations", "Ecoles"],
          },
        ],
        labels: ["Collectivités", "Clubs / associations", "Ecoles"],
      };
        this.data4 = {
        datasets: [
          {
            backgroundColor: ["#08BDBD", "#FF9914"],
            data: [
              Math.round(this.stat[0].utilisateurAvecIntervention.length/(this.stat[0].utilisateurAvecIntervention.length+this.stat[0].utilisateurSansIntervention.length)*100),
              Math.round(this.stat[0].utilisateurSansIntervention.length/(this.stat[0].utilisateurAvecIntervention.length+this.stat[0].utilisateurSansIntervention.length)*100),
            ],
            labels: ["Ayant déclaré au monis une intervention", "Aucune intervention déclarée"],
          },
        ],
        labels: ["Ayant déclaré au monis une intervention", "Aucune intervention déclarée"],
      };

      // Définition des options du 2eme et 4eme grahiques
      this.optionsDoughnut = {
        responsive: false,
        maintainAspectRatio: true,
        legend: {
          display: true,
        },
        animation: {
          animateScale: true,
          animateRotate: true,
        },
      };
    },
  },
  async mounted() {
    this.viewHisto(0);
    this.viewDoughnut(0);
  },
};
</script>

<style>
ul {
  list-style-type: none;
}
.input-width {
  width: 100%;
}
.liste-deroulante {
  width: 80%;
}
p {
  font-size: 1.3em;
}
</style>
