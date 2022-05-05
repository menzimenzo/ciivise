<template>
    <div>
        <h1 class="mb-5">Bienvenue {{ utilisateurCourant.prenom }}</h1>
        <b-row>
            <b-col cols="4">
                <div class="statCard">
                    <p>Total des interventions effectuées: {{ totalInterventions }}</p>
                </div>
            </b-col>
            <b-col cols="4">
                <div class="statCard">
                    <p>Vous êtes intervenu dans {{ totalPiscines }} piscines</p>
                </div>
            </b-col>
            <b-col cols="4">
                <div class="statCard">
                    <p>Vous êtes intervenu pour {{ totalStructures }} structures</p>
                </div>
            </b-col>
        </b-row>
        <b-row class="mt-3" v-if="totalEnfants && totalEnfants > 0">
            <b-col cols="12">
                <div class="statCard text-center highlightCard">
                    <p>{{ totalEnfants }} enfants ont pu évoluer grâce à vous!</p>
                </div>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    computed: {
        ...mapState(["utilisateurCourant", "interventions", "mesPiscines", 'structures']),
        totalInterventions() {
            return this.interventions && this.interventions.length || 0
        },
        totalPiscines() {
            return this.mesPiscines && this.mesPiscines.length || 0
        },
        totalStructures() {
            return this.structures && this.structures.length || 0
        },
        totalEnfants() {
            return this.interventions && this.interventions.map(intervention => intervention.nbEnfants).reduce((a,b) => a+b, 0) || 0
        }
    } 
}
</script>

<style scoped>
.statCard {
    background-color: #252195;
    color: white;
    border-radius: 10px;
    padding: 20px;
    height: 100%;
}
.highlightCard {
    background-color: #e5425a; 
}
</style>