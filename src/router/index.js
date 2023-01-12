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
    },
    {
        path: '/oimoPhysics',
        name: 'OimoPhysics',
        component: () => import("@/views/oimoPhysics/oimoPhysics.vue")
    }, {
        path: '/shadowMapViewer',
        name: 'shadowMapViewer',
        component: () => import("@/views/shadowMapViewer/shadowMapViewer.vue")
    }, {
        path: '/animation',
        name: 'animation',
        component: () => import("@/views/animation/Animation.vue")
    },
    {
        path: '/aniSoldier',
        name: 'aniSoldier',
        component: () => import("@/views/animation/aniSoldier.vue")
    }, {
        path: '/littleTokyo',
        name: 'littleTokyo',
        component: () => import("@/views/littleTokyo/LittleTokyo.vue")
    }, {
        path: '/clipping',
        name: 'clipping',
        component: () => import("@/views/clipping/clipping.vue")
    }, {
        path: '/skybox',
        name: 'skybox',
        component: () => import("@/views/skybox/Skybox.vue")
    }, {
        path: '/pdbLoader',
        name: 'pdbLoader',
        component: () => import("@/views/pdbLoader/PdbLoader.vue")
    }, {
        path: '/extrude',
        name: 'extrude',
        component: () => import("@/views/extrude/Extrude.vue")
    }, {
        path: '/textLoader',
        name: 'textLoader',
        component: () => import("@/views/textLoader/textLoader.vue")
    },{
        path: '/texture',
        name: 'texture',
        component: () => import("@/views/texture/texture.vue")
    }

];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;