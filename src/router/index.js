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
        path: '/clippingHigh',
        name: 'clippingHigh',
        component: () => import("@/views/clipping/clippingHigh.vue")
    }, {
        path: '/clipIntersection',
        name: 'clipIntersection',
        component: () => import("@/views/clipping/clipIntersection.vue")
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
    }, {
        path: '/texture',
        name: 'texture',
        component: () => import("@/views/texture/texture.vue")
    }, {
        path: '/dynamicGeometry',
        name: 'dynamicGeometry',
        component: () => import("@/views/dynamicGeometry/dynamicGeometry.vue")
    }, {
        path: '/morph',
        name: 'morph',
        component: () => import("@/views/morph/morph.vue")
    }, {
        path: '/panorama',
        name: 'panorama',
        component: () => import("@/views/panorama/panorama.vue")
    }, {
        path: '/points',
        name: 'points',
        component: () => import("@/views/points/points.vue")
    }, {
        path: '/shadersOcean',
        name: 'shadersOcean',
        component: () => import("@/views/shaders/shadersOcean.vue")
    }, {
        path: '/shadersSimple',
        name: 'shadersSimple',
        component: () => import("@/views/shaders/shadersSimple.vue")
    }, {
        path: '/shadersPoints',
        name: 'shadersPoints',
        component: () => import("@/views/shaders/shadersPoints.vue")
    }, {
        path: '/shadersLava',
        name: 'shadersLava',
        component: () => import("@/views/shaders/shadersLava.vue")
    }, {
        path: '/glitchPass',
        name: 'glitchPass',
        component: () => import("@/views/glitch/glitchPass.vue")
    }, {
        path: '/outlinePass',
        name: 'outlinePass',
        component: () => import("@/views/outline/outlinePass.vue")
    }, {
        path: '/ammo',
        name: 'ammo',
        component: () => import("@/views/ammo/ammo.vue")
    }, {
        path: '/ammoCar',
        name: 'ammoCar',
        component: () => import("@/views/ammo/ammocar.vue")
    }, {
        path: '/ammoBullet',
        name: 'ammoBullet',
        component: () => import("@/views/ammo/ammoBullet.vue")
    }, {
        path: '/ammoSoft',
        name: 'ammoSoft',
        component: () => import("@/views/ammo/ammoSoft.vue")
    }, {
        path: '/vector',
        name: 'vector',
        component: () => import("@/views/vector/vectorTest.vue")
    }, {
        path: '/loadCollada',
        name: 'loadCollada',
        component: () => import("@/views/loader/loadCollada.vue")
    }, {
        path: '/loadColladaKinematics',
        name: 'loadColladaKinematics',
        component: () => import("@/views/loader/loadColladaKinematics.vue")
    }, {
        path: '/loadColladaWarStar',
        name: 'loadColladaWarStar',
        component: () => import("@/views/loader/loadColladaWarStar.vue")
    }, {
        path: '/loadColladaExport',
        name: 'loadColladaExport',
        component: () => import("@/views/loader/loadColladaExport.vue")
    }, {
        path: '/loadFBX',
        name: 'loadFBX',
        component: () => import("@/views/loader/loadFBX.vue")
    }, {
        path: '/loadDraco',
        name: 'loadDraco',
        component: () => import("@/views/loader/loadDraco.vue")
    }, {
        path: '/loadGLTF',
        name: 'loadGLTF',
        component: () => import("@/views/loader/loadGLTF.vue")
    }, {
        path: '/loadGLTFCompressed',
        name: 'loadGLTFCompressed',
        component: () => import("@/views/loader/loadGLTFCompressed.vue")
    }, {
        path: '/loadIK',
        name: 'loadIK',
        component: () => import("@/views/loader/loadIK.vue")
    }, {
        path: '/helper',
        name: 'helper',
        component: () => import("@/views/helper/Helper.vue")
    }, {
        path: '/terrain',
        name: 'terrain',
        component: () => import("@/views/terrain/Terrain.vue")
    }, {
        path: '/rayCaster',
        name: 'rayCaster',
        component: () => import("@/views/raycast/rayCaster.vue")
    }, {
        path: '/decals',
        name: 'decals',
        component: () => import("@/views/decals/decals.vue")
    }, {
        path: '/game',
        name: 'game',
        component: () => import("@/views/game/octree.vue")
    }, {
        path: '/pointerlock',
        name: 'pointerlock',
        component: () => import("@/views/game/pointerlock.vue")
    }, {
        path: '/butterGeometry',
        name: 'butterGeometry',
        component: () => import("@/views/buffer/butterGeometry.vue")
    }, {
        path: '/drawRange',
        name: 'drawRange',
        component: () => import("@/views/buffer/drawRange.vue")
    }, {
        path: '/line',
        name: 'line',
        component: () => import("@/views/buffer/line.vue")
    }, {
        path: '/particles',
        name: 'particles',
        component: () => import("@/views/buffer/particles.vue")
    }, {
        path: '/setIndex',
        name: 'setIndex',
        component: () => import("@/views/buffer/setIndex.vue")
    }, {
        path: '/integer',
        name: 'integer',
        component: () => import("@/views/buffer/integer.vue")
    }, {
        path: '/instance',
        name: 'instance',
        component: () => import("@/views/buffer/instance.vue")
    }, {
        path: '/instancing',
        name: 'instancing',
        component: () => import("@/views/buffer/instancing.vue")
    }, {
        path: '/css3D',
        name: 'css3D',
        component: () => import("@/views/css3D/css3D.vue")
    }, {
        path: '/mixRender',
        name: 'mixRender',
        component: () => import("@/views/css3D/mixRender.vue")
    }, {
        path: '/tween',
        name: 'tween',
        component: () => import("@/views/css3D/tween.vue")
    }, {
        path: '/elementCircle',
        name: 'elementCircle',
        component: () => import("@/views/css3D/elementCircle.vue")
    }, {
        path: '/mCamera',
        name: 'mCamera',
        component: () => import("@/views/camera/mCamera.vue")
    }, {
        path: '/arrayCamera',
        name: 'arrayCamera',
        component: () => import("@/views/camera/arrayCamera.vue")
    }, {
        path: '/stereo',
        name: 'stereo',
        component: () => import("@/views/stereo/stereo.vue")
    }, {
        path: '/probe',
        name: 'probe',
        component: () => import("@/views/probe/probe.vue")
    }, {
        path: '/cubeCamera',
        name: 'cubeCamera',
        component: () => import("@/views/camera/cubeCamera.vue")
    }, {
        path: '/cubeCameraProbe',
        name: 'cubeCameraProbe',
        component: () => import("@/views/camera/cubeCameraProbe.vue")
    }, {
        path: '/line',
        name: 'line',
        component: () => import("@/views/line/line.vue")
    }, {
        path: '/dashLine',
        name: 'dashLine',
        component: () => import("@/views/line/dashLine.vue")
    },
    {
        path: '/lineWidth',
        name: 'lineWidth',
        component: () => import("@/views/line/lineWidth.vue")
    }, {
        path: '/OGod',
        name: 'OGod',
        component: () => import("@/views/OGod/OGod.vue")
    }, {
        path: '/travelDemo',
        name: 'travelDemo',
        component: () => import("@/views/travel/demo.vue")
    }, {
        path: '/VRSeeRoom',
        name: 'VRSeeRoom',
        component: () => import("@/views/VRSeeRoom/VRSeeRoom.vue")
    }, {
        path: '/island',
        name: 'island',
        component: () => import("@/views/island/Island.vue")
    }, {
        path: '/showCar',
        name: 'showCar',
        component: () => import("@/views/showCar/showCar.vue")
    }, {
        path: '/showCar',
        name: 'showCar',
        component: () => import("@/views/showCar/showCar.vue")
    }, {
        path: '/robot',
        name: 'robot',
        component: () => import("@/views/robot/Robot.vue")
    }, {
        path: '/earth',
        name: 'earth',
        component: () => import("@/views/earth/earth.vue")
    }, {
        path: '/football',
        name: 'football',
        component: () => import("@/views/game/football.vue")
    }, {
        path: '/picture3D',
        name: 'picture3D',
        component: () => import("@/views/css3D/picture3D.vue")
    }, {
        path: '/kirby',
        name: 'kirby',
        component: () => import("@/views/kirby/kirby.vue")
    }, {
        path: '/scrollPage',
        name: 'scrollPage',
        component: () => import("@/views/scrollPage/scrollPage.vue")
    },{
        path: '/shadowMaterial',
        name: 'shadowMaterial',
        component: () => import("@/views/shadowMaterial/shadowMaterial.vue")
    },



];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;