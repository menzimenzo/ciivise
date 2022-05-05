<template>
    <div>
        <h1 class="mb-5">Bienvenue {{ utilisateurCourant.prenom }}</h1>
        <b-row>
            <b-col cols="4" v-if="utilisateurCourant.structurerefid==1">
                <div class="statCard highlightCard" >
                    <p >Demandes à valider : {{ totalDemandesMnAaq }}</p>
                </div>
            </b-col>
            <b-col cols="4">
                <div class="statCard">
                    <!--
                    <p>Demandes validées par votre structure : {{ totalHistoDemandes }}</p>
-->
                    <p v-if="utilisateurCourant.structurerefid!=1">Demandes traitées par votre structure : {{ totalHistoDemandes }}</p>
                    <p v-if="utilisateurCourant.structurerefid==1">Demandes traitées : {{ totalHistoDemandes }}</p>
                </div>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    computed: {
        ...mapState(["utilisateurCourant", "users"]),
        totalDemandesMnAaq() {
            const DemandesMnAaq = this.users.filter(user => user.role == 5 && user.statutdemande == 1 )
            return DemandesMnAaq && DemandesMnAaq.length || 0
        },
        totalHistoDemandes () {
            const HistoDemandeMnAaq = this.users.filter(user => (
          (
            (user.role == 4 || user.role == 5) && user.statutdemande == 3
          )
          || 
          (user.role == 4 && user.statutdemande == 2)
        ))
            return HistoDemandeMnAaq && HistoDemandeMnAaq.length || 0
        },
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