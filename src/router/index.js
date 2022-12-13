import { createRouter, createWebHistory } from 'vue-router';
import Layout from "@/views/layout/Layout.vue";


const routes = [
    {
        path: '/',
        name: "Layout",
        component: Layout,
        redirect: "/index",
    },
    {
        path: '/index',
        name: "Shadow",
        component: () => import("@/views/shadow/Shadow.vue"),
    },
    {
        path: '/light',
        name: "Light",
        component: () => import("@/views/light/Light.vue")
    },
    {
        path: '/raycast',
        name: "rayCast",
        component: () => import("@/views/raycast/rayCast.vue")
    }


];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;