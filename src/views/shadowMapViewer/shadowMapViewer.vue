<template>
  <div class="three-container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
//引入调试器
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
//阴影覆盖查看器
import { ShadowMapViewer } from 'three/examples/jsm/utils/ShadowMapViewer.js';

import { onMounted, reactive, ref, toRaw } from 'vue';
// 变量区
//白光
let dirLight;
let spotLightV2;

// 白光阴影覆盖查看器
let dirLightShadowMapViewer;
// 聚光灯阴影覆盖查看器
let spotLightShadowMapViewer;

//地板
let ground;
//环形结
let torusKnot;

//时钟用于控制渲染的间隔时间
let clock = new THREE.Clock();

// 场景
const scene = ref(null);
//方块/物体
const cube = ref(null);
//圆柱体
const cylinder = ref(null);

//光线
const ambientLight = ref(null);
//聚光灯
const spotLight = ref(null);
//聚光灯调试器
const spotLightHelper = ref(null);

//阴影
const shadow = ref(null);

//摄像机
const camera = ref(null);
//相机控制器
const cameraController = ref(null);
//图形参数控制器
const GUIController = ref(null);

// 渲染器
const renderer = ref(null);
// 坐标轴
const axisHelp = ref(null);

// 生命周期区
onMounted(() => {
  init();
  render();
});
// 方法区

//初始化
const init = () => {
  //初始化场景
  initScene();

  //初始化坐标轴
  initAxis();

  //初始化相机
  initCamera();

  //初始化几何体
  //   initCube();

  // 初始化几何体
  initMeshes();

  //   initCylinder();

  //初始化光线
  //   initAmbientLight();

  //   初始化光线V2
  initLight();

  //初始化聚光灯
  //   initSpotLight();
  //初始化聚光灯辅助（可注释）
  //   initSpotLightHelper();

  //初始化阴影
  initShadow();

  //初始化阴影辅助器
  initCameraHelper();
  //初始化阴影查看器
  initShadowMapViewer();

  //初始化渲染器
  initRender();

  //初始化参数调试器GUI
  //   initGUI();

  //初始化控制器
  initController();
};

//初始化的子函数
//初始化场景
const initScene = () => {
  //// 1.创建scene以及物体
  //   创建场景
  scene.value = new THREE.Scene();
};

//初始化坐标轴
const initAxis = () => {
  // 创建坐标轴 里面的10 是坐标轴的长度
  axisHelp.value = new THREE.AxesHelper(10);

  //   添加坐标轴
  //   需要特别说明的是横着的红色是x轴，竖着的是绿色的是y轴(!!!)，而朝向我们的是z轴
  scene.value.add(axisHelp.value);
};

//初始化相机
const initCamera = () => {
  //  2.创建camera
  // PerspectiveCamera 离的越近越大，离得越远越小
  //    PerspectiveCamera(摄像机视锥体垂直视野角度,摄像机视锥体长宽比,摄像机视锥体近端面，摄像机视锥体远端面)
  // window.innerWidth / window.innerHeight 透视相机的宽高比
  //PerspectiveCamera(摄像机视锥体垂直视野角度,摄像机视锥体长宽比,摄像机视锥体近端面, 摄像机视锥体远端面)

  camera.value = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // 设置camera摆放的位置
  //   将camera放到z轴位置处于5的位置
  //   toRaw 将响应式对象改为普通对象，不用就报错，说Positon无法改变

  //   若不设置看不到z轴
  toRaw(camera.value).position.x = 0;

  toRaw(camera.value).position.y = 15;
  toRaw(camera.value).position.z = 35;

  camera.value.lookAt(0, 0, 0);
};

//初始化几何体
const initCube = () => {
  //   创建对象
  // 创建几何体，BoxGeometry(长，宽，高)
  //   BoxGeometry 立方体
  //   let geometry = new THREE.BoxGeometry(1, 1, 1);

  // PlaneGeometry 平面
  // PlaneGeometry(宽，高)
  let geometry = new THREE.PlaneGeometry(80, 80);
  //   几何体的材质
  let meterial = new THREE.MeshPhongMaterial({ color: 'grey' });

  //  正式创建几何体,Mesh(几何体，材质)
  cube.value = new THREE.Mesh(geometry, meterial);

  //旋转 PlaneGeometry，让他围绕x轴转动 ， Math.PI/2 = 90度 因为背面我们是看不到的所以用负的
  cube.value.rotation.x = -Math.PI / 2;

  //将平面下沉，让他不在原点上
  cube.value.position.set(0, -1, 0);

  //  将创建好的物体放到我们创建的场景里面
  scene.value.add(cube.value);
};
//初始化圆柱体
const initCylinder = () => {
  //   创建对象
  // 创建几何体，BoxGeometry(长，宽，高)
  //   BoxGeometry 立方体
  //   let geometry = new THREE.BoxGeometry(1, 1, 1);

  // CylinderGeometry 圆柱体
  // CylinderGeometry(上圆半径，下圆半径,高度,指定沿X轴分成多少段(段数越多，圆柱越光滑), 指定沿Y轴分成多少段(段数越多，圆柱竖直方向分的面越多),是否无底)
  let geometry = new THREE.CylinderGeometry(5, 5, 2, 24, 1, false);
  //   几何体的材质
  let meterial = new THREE.MeshPhongMaterial({ color: 'grey' });

  //  正式创建几何体,Mesh(几何体，材质)
  cylinder.value = new THREE.Mesh(geometry, meterial);

  cylinder.value.position.set(0, 10, 0);

  //  将创建好的物体放到我们创建的场景里面
  scene.value.add(cylinder.value);
};

//初始化聚光灯
const initSpotLight = () => {
  //初始化聚光灯
  spotLight.value = new THREE.SpotLight(0xffffff, 1);
  spotLight.value.position.set(-50, 80, 0);
  //调整聚光灯 的角度，会出现明暗变化
  spotLight.value.angle = Math.PI / 6;
  //penumbra属性表示照射面光影衰减百分比，取值在0和1之间， 默认值为 0.0
  spotLight.value.penumbra = 0.2;
  scene.value.add(spotLight.value);
};
//初始化聚光灯调试器
const initSpotLightHelper = () => {
  //聚光灯的辅助器
  //THREE.SpotLightHelper(聚光灯的参数)
  spotLightHelper.value = new THREE.SpotLightHelper(spotLight.value);
  //场景中放入聚光灯辅助器
  scene.value.add(spotLightHelper.value);
};

//初始化光线
const initAmbientLight = () => {
  //THREE.AmbientLight(光线的颜色,0.2)
  ambientLight.value = new THREE.AmbientLight(0xffffff, 0.2);
  scene.value.add(ambientLight.value);
};
const initLight = () => {
  //添加环境光
  ambientLight.value = new THREE.AmbientLight(0x404040);
  scene.value.add(ambientLight.value);

  // spot light  聚光灯
  spotLightV2 = new THREE.SpotLight(0xffffff);
  //   聚光灯的名字
  spotLightV2.name = 'Spot light';
  //聚光灯的角度
  spotLightV2.angle = Math.PI / 5;
  //   聚光灯 聚光性
  spotLightV2.penumbra = 0.3;
  // 聚光灯的位置
  spotLightV2.position.set(10, 10, 5);
  scene.value.add(spotLightV2);

  // 直线光
  dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.name = 'Dir light';
  //   从上往下直线照射
  dirLight.position.set(0, 10, 0);
  scene.value.add(dirLight);
};

const initMeshes = () => {
  //TorusKnotGeometry(结之间的空隙，线的粗细，清晰程度,???) 专门用于创建结状物体
  let geometry = new THREE.TorusKnotGeometry(25, 8, 75, 20);
  let material = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    shininess: 150, //发亮程度/镜面反射的能力
    specular: 0x222222, //反光的颜色
  });
  //创建环形结
  torusKnot = new THREE.Mesh(geometry, material);
  //   设置放大缩小的系数
  torusKnot.scale.multiplyScalar(1 / 18);
  //环形结的位置
  torusKnot.position.y = 3;
  scene.value.add(torusKnot);

  //   cube
  geometry = new THREE.BoxGeometry(3, 3, 3);
  cube.value = new THREE.Mesh(geometry, material);
  cube.value.position.set(8, 3, 8);
  scene.value.add(cube.value);

  // 地板
  geometry = new THREE.BoxGeometry(10, 0.15, 10);
  material = new THREE.MeshPhongMaterial({
    color: 0xa0adaf,
    shininess: 150,
    specular: 0x111111,
  });
  ground = new THREE.Mesh(geometry, material);
  ground.scale.multiplyScalar(3);
  scene.value.add(ground);
};

//初始化阴影
const initShadow = () => {
  //开启圆柱体的阴影
  //   cylinder.value.castShadow = true;
  //开启平面的 接收阴影
  //   cube.value.receiveShadow = true;
  //开启灯光的阴影
  //   spotLight.value.castShadow = true;

  spotLightV2.castShadow = true;
  dirLight.castShadow = true;

  torusKnot.castShadow = true;
  torusKnot.receiveShadow = true;

  cube.value.castShadow = true;
  cube.value.receiveShadow = true;

  ground.castShadow = false;
  ground.receiveShadow = true;
};

//初始化渲染器
const initRender = () => {
  // 3.创建render
  // 我们设置WebGL位置
  renderer.value = new THREE.WebGLRenderer();

  //开启渲染器中的阴影渲染
  renderer.value.shadowMap.enabled = true;

  //设置像素比例，这样可以让他看起来更适合屏幕
  renderer.value.setPixelRatio(window.devicePixelRatio);

  // 设置渲染的大小
  renderer.value.setSize(window.innerWidth, window.innerHeight);

  //   将渲染好的数据，放到document里面
  // renderer.value.domElement=我们渲染出来的数据(是一个canvas)
  //   document.body.appendChild(renderer.value.domElement);
  let threeContainer = document.querySelector('.three-container');
  threeContainer.appendChild(renderer.value.domElement);
};

//初始化控制器
const initController = () => {
  // 4.控制器
  cameraController.value = new OrbitControls(
    camera.value,
    renderer.value.domElement
  );

  //设置控制器变换的基础点
  cameraController.value.target.set(0, 1, 0);
};

//初始化图形参数控制器
const initGUI = () => {
  GUIController.value = new GUI();
  //将调试器 默认设置为关闭状态
  GUIController.value.close();

  //   光源调试
  //创建对控制器调试的参数分组
  const spotLightFolder = GUIController.value.addFolder('Spot Light');
  //分组中添加要调试的参数
  // spotLightFolder.addColor('要调试的东西','要调试物体中的参数','开始范围','结束范围');
  //再利用onChange方法，改变参数后 反馈回 对应的物体
  //value =改动后的值

  //   调试光的颜色
  spotLightFolder.addColor(spotLight.value, 'color').onChange((value) => {
    //改变对应物体属性的值
    spotLight.value.color.set(value);
  });
  //调试光源的角度
  // spotLightFolder.add('要调试的东西','要调试物体中的参数','开始范围','结束范围');

  //直接调用onChange 后直接render 也可以实现
  //   spotLightFolder.addColor(spotLight.value, 'color').onChange(render);
  //   spotLightFolder
  //     .add(spotLight.value, 'angle', 0, Math.PI / 2)
  //     .onChange(render);

  spotLightFolder
    .add(spotLight.value, 'angle', 0, Math.PI / 2)
    .onChange((value) => {
      spotLight.value.angle = value;
      render();
      //更新光源 辅助的参数
      spotLightHelper.value.update();
    });
  //设置光源模糊度
  spotLightFolder.add(spotLight.value, 'penumbra', 0, 1).onChange(render);

  //camera参数的调整
  const cameraFolder = GUIController.value.addFolder('CameraFolder');
  //   调控camera的x位置
  // spotLightFolder.add('要调试的东西','要调试物体中的参数','开始范围','结束范围').step('拖动的精度');

  cameraFolder
    .add(camera.value.position, 'x', -1000, 1000)
    .step(1)
    .onChange(render);
};

//初始化阴影辅助器
const initCameraHelper = () => {
  // 聚光灯
  // 设置阴影摄影机的近点
  spotLightV2.shadow.camera.near = 8;
  //设置摄影机的远点
  spotLightV2.shadow.camera.far = 30;

  spotLightV2.shadow.mapSize.width = 1024;
  spotLightV2.shadow.mapSize.height = 1024;
  scene.value.add(new THREE.CameraHelper(spotLightV2.shadow.camera));

  //直线光
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 10;
  //   设置直线光的照射范围
  dirLight.shadow.camera.right = 15;
  dirLight.shadow.camera.left = -15;
  dirLight.shadow.camera.top = 15;
  dirLight.shadow.camera.bottom = -15;

  scene.value.add(new THREE.CameraHelper(dirLight.shadow.camera));
};
//初始化阴影覆盖查看器
const initShadowMapViewer = () => {
  dirLightShadowMapViewer = new ShadowMapViewer(dirLight);
  spotLightShadowMapViewer = new ShadowMapViewer(spotLightV2);
  resizeShadowMapViewer();
};
//shadowMapViewer子函数
const resizeShadowMapViewer = () => {
  const size = window.innerWidth * 0.15;
  dirLightShadowMapViewer.position.x = 10;
  dirLightShadowMapViewer.position.y = 10;
  dirLightShadowMapViewer.size.width = size;
  dirLightShadowMapViewer.size.height = size;
  dirLightShadowMapViewer.update();

  //用set就不用需要update
  spotLightShadowMapViewer.size.set(size, size);
  spotLightShadowMapViewer.position.set(size + 20, 10);
};

// 渲染
const render = () => {
  // render(场景，相机)
  toRaw(renderer.value).render(toRaw(scene.value), toRaw(camera.value));
  //   创建的cube进行旋转
  //   toRaw(cube.value).rotation.y = toRaw(cube.value).rotation.y + 0.01;

  //requestAnimationFrame来自浏览器 就是一旦有空闲就会再次调用里面放的函数
  //   相当于无线循环render

  // 从时钟拿到间隔时间
  const delta = clock.getDelta();
  // 为什么乘delta 为了使画面显示更流畅
  torusKnot.rotation.x = torusKnot.rotation.x + 0.25 * delta;
  torusKnot.rotation.y = torusKnot.rotation.y + 2 * delta;
  torusKnot.rotation.z = torusKnot.rotation.z + 1 * delta;

  cube.value.rotation.x = cube.value.rotation.x + 0.25 * delta;
  cube.value.rotation.y = cube.value.rotation.y + 2 * delta;
  cube.value.rotation.z = cube.value.rotation.z + 1 * delta;

  // 必须要在render函数下调用阴影查看器的render 才能生效
  dirLightShadowMapViewer.render(renderer.value);
  spotLightShadowMapViewer.render(renderer.value);

  requestAnimationFrame(render);
};

//让渲染的页面随着窗体变化而变化
window.addEventListener('resize', function () {
  camera.value.aspect = window.innerWidth / window.innerHeight;
  // 所以，执行camera.updateProjectionMatrix();的时候，threejs会重新计算相机对象的投影矩阵值。
  camera.value.updateProjectionMatrix();
  //调整页面的大小
  renderer.value.setSize(window.innerWidth, window.innerHeight);

  resizeShadowMapViewer();
  dirLightShadowMapViewer.updateForWindowResize();
  spotLightShadowMapViewer.updateForWindowResize();
});
</script>

<style scoped></style>
