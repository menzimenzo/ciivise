<template>
    <div>
        <h1 class="mb-5">Bienvenue {{ utilisateurCourant.prenom }}</h1>
        <b-row>
            <b-col cols="4">
                <div class="statCard highlightCard">
                    <p>Total des utilisateurs: {{ totalUsers }}</p>
                </div>
            </b-col>
            <b-col cols="4">
                <div class="statCard">
                    <p>Maîtres nageurs certifiés: {{ totalMnAaq }}</p>
                </div>
            </b-col>
            <b-col cols="4">
                <div class="statCard">
                    <p>Instructeurs AAQ: {{ totalInstAaq }}</p>
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
        totalUsers() {
            return this.users && this.users.length || 0
        },
        totalMnAaq() {
            const mnAaq = this.users.filter(user => user.role == 4)
            return mnAaq && mnAaq.length || 0
        },
        totalInstAaq () {
            const instructeurs = this.users.filter(user => user.role == 3)
            return instructeurs && instructeurs.length || 0
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