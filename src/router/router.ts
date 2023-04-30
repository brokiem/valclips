import {createRouter, createWebHistory} from "vue-router";
import HomeView from "../views/HomeView.vue";
import ReviewView from "../views/ReviewView.vue";
import TermsView from "../views/TermsView.vue";
import PrivacyView from "../views/PrivacyView.vue";
import SearchView from "../views/SearchView.vue";

const routes = [
    { path: '/', component: HomeView },
    { path: '/review', component: ReviewView },
    { path: '/terms', component: TermsView },
    { path: '/privacy', component: PrivacyView },
    { path: '/search', component: SearchView },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
