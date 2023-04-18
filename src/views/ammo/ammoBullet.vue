<template>
  <div class="three-container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
//引入调试器
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { onMounted, reactive, ref, toRaw } from 'vue';
// 变量区
//白光
let dirLight;

//地板
let ground;
//环形结
let tourusKnot;

let ZERO_QUATERNION = new THREE.Quaternion(0, 0, 0, 1);
let DISABLE_DEACTIVATION = 4;
let clock = new THREE.Clock();

let materialDynamic = new THREE.MeshPhongMaterial({ color: 0xfca400 });
let materialStatic = new THREE.MeshPhongMaterial({ color: 0x999999 });
let materialInteractive = new THREE.MeshPhongMaterial({ color: 0x99000 });

let physicsUniverse;

let syncList = [];

let actions = {};

let keysActions = {
  KeyW: 'acceleration',
  KeyS: 'braking',
  KeyA: 'left',
  KeyD: 'right',
};

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
  Ammo().then(() => {
    let speedometer = document.getElementById('speedometer');
    let temTransformation = new Ammo.btTransform();
    init();
    initPhysicsUniverse();
    createObjects();
    render();
  });
});
// 方法区

const initGraphics = () => {};
const initPhysicsUniverse = () => {
  const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  const overlappingPairCache = new Ammo.btDbvtBroadphase();
  const solver = new Ammo.btSequentialImpulseConstraintSolver();

  physicsUniverse = new Ammo.btDiscreteDynamicsWorld(
    dispatcher,
    overlappingPairCache,
    solver,
    collisionConfiguration
  );
  physicsUniverse.setGravity(new Ammo.btVector3(0, -9.82, 0));
};

const createObjects = () => {
  //   createBox(new THREE.Vector3(0, -0.5, 0), ZERO_QUATERNION, 500, 1, 500, 0, 2);
  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(40, 1, 40),
    new THREE.MeshPhongMaterial({ color: 0xffffff })
  );
  ground.name = '地面';

  ground.receiveShadow = true;
  ground.castShadow = true;

  ground.position.set(0, -0.5, 0);
  scene.value.add(ground);

  //   塔1
  const tower1 = new THREE.Mesh(
    new THREE.BoxGeometry(4, 10, 4),
    new THREE.MeshPhongMaterial({ color: 0xb03014 })
  );
  tower1.name = '塔1';
  tower1.position.set(-8, 5, 0);
  tower1.receiveShadow = true;
  tower1.castShadow = true;

  scene.value.add(tower1);

  //塔2

  const tower2 = new THREE.Mesh(
    new THREE.BoxGeometry(4, 10, 4),
    new THREE.MeshPhongMaterial({ color: 0xb03014 })
  );
  tower2.name = '塔1';
  tower2.position.set(8, 5, 0);
  tower2.receiveShadow = true;
  tower2.castShadow = true;

  scene.value.add(tower2);

  // 桥
  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(14, 0.4, 3),
    new THREE.MeshPhongMaterial({ color: 0xb3b865 })
  );
  bridge.position.set(0, 10.2, 0);
  bridge.receiveShadow = true;
  bridge.castShadow = true;
  scene.value.add(bridge);
};
const createBox = (pos, quat, w, l, h, mass, friction) => {
  if (!mass) {
    mass = 0;
  }

  if (!friction) {
    friction = 1;
  }

  const material = mass > 0 ? materialDynamic : materialStatic;
  const mesh = new THREE.Mesh(
    new THREE.BoxBufferGeometry(w, l, h, 1, 1, 1),
    material
  );
  mesh.position.copy(pos);
  mesh.quaternion.copy(quat);
  scene.value.add(mesh);

  //  初始姿态
  //  const  transform = new Ammo.btTransform()
  //  transform.setIdentity();
  //  transform.setOrigin( new Ammo.btVector3(pos.x,pos.y,pos.z))
};

//初始化
const init = () => {
  //初始化场景
  initScene();

  //初始化坐标轴
  initAxis();

  //初始化相机
  initCamera();

  //初始化渲染器
  initRender();

  //初始化几何体
  initCube();

  //   initCylinder();

  //初始化光线
  //   initAmbientLight();
  //初始化光线V2
  initLight();

  //初始化聚光灯
  //   initSpotLight();
  //初始化聚光灯辅助（可注释）
  //   initSpotLightHelper();

  //初始化阴影
  //   initShadow();

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
  //设置场景背景颜色
  scene.value.background = new THREE.Color(0x6fd1e5);
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
    90,
    window.innerWidth / window.innerHeight,
    0.2,
    2000
  );
  // 设置camera摆放的位置
  //   将camera放到z轴位置处于5的位置
  //   toRaw 将响应式对象改为普通对象，不用就报错，说Positon无法改变

  //   若不设置看不到z轴
  toRaw(camera.value).position.x = -14;

  toRaw(camera.value).position.y = 8;
  toRaw(camera.value).position.z = 16;

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
  // let geometry = new THREE.BoxGeometry(2, 2, 2);
  // //   几何体的材质
  // let meterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  // //  正式创建几何体,Mesh(几何体，材质)
  // cube.value = new THREE.Mesh(geometry, meterial);
  //旋转 PlaneGeometry，让他围绕x轴转动 ， Math.PI/2 = 90度 因为背面我们是看不到的所以用负的
  //   cube.value.rotation.x = -Math.PI / 2;
  //将平面下沉，让他不在原点上
  //   cube.value.position.set(0, -1, 0);
  //  将创建好的物体放到我们创建的场景里面
  //   scene.value.add(cube.value);
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
  ambientLight.value = new THREE.AmbientLight(0x707070);
  scene.value.add(ambientLight.value);
  //   ambientLight.value.castShadow = true;
  //   console.log(ambientLight.value);
    
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(-10, 18, 5);
  dirLight.castShadow = true;

  dirLight.shadow.camera.left = -14;
  dirLight.shadow.camera.right = 14;
  dirLight.shadow.camera.top = -14;
  dirLight.shadow.camera.bottom = -14;
  dirLight.shadow.camera.near = 2;
  dirLight.shadow.camera.far = 50;

  scene.value.add(dirLight);
};

//初始化阴影
const initShadow = () => {
  //开启圆柱体的阴影
  //   cylinder.value.castShadow = true;
  //开启平面的 接收阴影
  //   cube.value.receiveShadow = true;
  //开启灯光的阴影
  ambientLight.value.castShadow = true;
};

//初始化渲染器
const initRender = () => {
  // 3.创建render
  // 我们设置WebGL位置
  renderer.value = new THREE.WebGLRenderer({ antialias: true });

  //开启渲染器中的阴影渲染
  renderer.value.shadowMap.enabled = true;
  renderer.value.setClearColor(0xbfd1e5);
  //设置像素比例，这样可以让他看起来更适合屏幕
  renderer.value.setPixelRatio(window.devicePixelRatio);

  // 设置渲染的大小
  renderer.value.setSize(window.innerWidth, window.innerHeight);

  renderer.value.outputEncoding = THREE.sRGBEncoding;

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
  cameraController.value.target.set(0, 2, 0);
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

// 渲染
const render = () => {
  //   创建的cube进行旋转
  //   toRaw(cube.value).rotation.y = toRaw(cube.value).rotation.y + 0.01;

  //requestAnimationFrame来自浏览器 就是一旦有空闲就会再次调用里面放的函数
  //   相当于无线循环render
  if (clock) {
    let dt = clock.getDelta();
    for (let i = 0; i < syncList.length; i++) {
      syncList[i](dt);
      physicsUniverse.stepSimulation(dt, 10);
      cameraController.value.update(dt);
    }
  }
  // 这段代码必须放到最下面
  // render(场景，相机)
  toRaw(renderer.value).render(toRaw(scene.value), toRaw(camera.value));

  requestAnimationFrame(render);
};

// const keydown = (e) => {
//   if (keysActions[e.code]) {
//     actions[keysActions[e.code]] = false;
//     e.preventDefault();
//     e.stopPropagation();
//     return false;
//   }
// };
// const keyup = (e) => {
//   if (keysActions[e.code]) {
//     actions[keysActions[e.code]] = true;
//     e.preventDefault();
//     e.stopPropagation();
//     return false;
//   }
// };

//让渲染的页面随着窗体变化而变化
window.addEventListener('resize', function () {
  camera.value.aspect = window.innerWidth / window.innerHeight;
  // 所以，执行camera.updateProjectionMatrix();的时候，threejs会重新计算相机对象的投影矩阵值。
  camera.value.updateProjectionMatrix();
  //调整页面的大小
  renderer.value.setSize(window.innerWidth, window.innerHeight);
});
// window.addEventListener('keydown', keydown);
// window.addEventListener('keyup', keyup);
</script>

<style scoped></style>
