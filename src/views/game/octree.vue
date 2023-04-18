<template>
  <div class="three-container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
//引入调试器
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { Capsule } from 'three/examples/jsm/math/Capsule';
import { Octree } from 'three/examples/jsm/math/Octree';
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper.js';

import { onMounted, reactive, ref, toRaw } from 'vue';
// 变量区
//白光
let dirLight;

//地板
let ground;
//环形结
let tourusKnot;

let clock = new THREE.Clock();
let helper;

let keyStates = {}; //{'KeyW':true,'KeyS':false}

// 重力
let GRAVITY = 30;

// 发射炮弹
const spheres = [];
// 球的数量
const NUM_SPHERE = 100;
// 球的半径
const SPHERE_RADIUS = 0.2;
// 球的实体状态
const sphereGeometry = new THREE.IcosahedronGeometry(SPHERE_RADIUS, 5);
const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xbbbb44 });

let sphereIdx = 0;
const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();

let mouseTime = 0;

// player
const player = {
  geometry: new Capsule(
    new THREE.Vector3(0, 0.35, 0),
    new THREE.Vector3(0, 1, 0),
    0.35
  ),
  velocity: new THREE.Vector3(),
  direction: new THREE.Vector3(),
  // 玩家是否在地板的状态
  onFloor: false,
};

// 带碰撞体积的世界
let otreeWorld = new Octree();

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
  //   initAxis();

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
  initGUI();

  //初始化控制器
  //   initController();
};

//初始化的子函数
//初始化场景
const initScene = () => {
  //// 1.创建scene以及物体
  //   创建场景
  scene.value = new THREE.Scene();
  //设置场景背景颜色
  scene.value.background = new THREE.Color(0x88ccee);

  scene.value.fog = new THREE.Fog(0x88ccee, 0, 50);
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
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // 设置camera摆放的位置
  //   将camera放到z轴位置处于5的位置
  //   toRaw 将响应式对象改为普通对象，不用就报错，说Positon无法改变

  //   若不设置看不到z轴
  toRaw(camera.value).position.x = 0;

  toRaw(camera.value).position.y = 0;
  toRaw(camera.value).position.z = 0;

  //   设置摄像机 的旋转
  // 关键你不加，你的鼠标滑动就有问题
  camera.value.rotation.order = 'YXZ';

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

  const loader = new GLTFLoader().load(
    './files/gltf/collision-world.glb',
    (gltf) => {
      console.log(gltf);
      scene.value.add(gltf.scene);
      gltf.scene.traverse((item) => {
        if (item.isMesh) {
          item.castShadow = true;
          item.receiveShadow = true;
          if (item.material.map) {
            item.material.map.anisotropy = 4;
          }
        }
      });
      otreeWorld.fromGraphNode(gltf.scene);
      helper = new OctreeHelper(otreeWorld);
      helper.visible = false;
      scene.value.add(helper);
    }
  );

  document.addEventListener('mousedown', (event) => {
    document.body.requestPointerLock();
    mouseTime = performance.now();
  });
  document.addEventListener('mouseup', (event) => {
    if (document.pointerLockElement !== null) {
      throwBall();
    }
  });

  document.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement === document.body) {
      camera.value.rotation.y = camera.value.rotation.y - event.movementX / 500;
      camera.value.rotation.x = camera.value.rotation.x - event.movementY / 500;

      // camera.value.rotation.y -= event.movementX / 500;
      //   camera.value.rotation.x -=  event.movementY / 500;
    }
  });

  //   创建球体
  for (let i = 0; i < NUM_SPHERE; i++) {
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.value.add(sphere);
    spheres.push({
      mesh: sphere,
      collider: new THREE.Sphere(new THREE.Vector3(0, -100, 0), SPHERE_RADIUS),
      velocity: new THREE.Vector3(),
    });
  }

  console.log(spheres);

  document.addEventListener('keydown', (event) => {
    keyStates[event.code] = true;
  });
  document.addEventListener('keyup', (event) => {
    keyStates[event.code] = false;
  });
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
  //   ambientLight.value = new THREE.AmbientLight(0xffffff, 0.2);
  //   scene.value.add(ambientLight.value);

  //   const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  //   dirLight.position.set(10, 10, 5);
  //   scene.value.add(dirLight);
  const fillLight = new THREE.HemisphereLight(0x4488bb, 0x002244, 0.5);
  fillLight.position.set(2, 1, 1);
  scene.value.add(fillLight);

  const directionalLight = new THREE.DirectionalLight(0xfffffff, 0.8);
  directionalLight.position.set(-5, 25, -1);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.near = 0.01;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.right = 30;
  directionalLight.shadow.camera.left = -30;
  directionalLight.shadow.camera.top = 30;
  directionalLight.shadow.camera.bottom = -30;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.radius = 4;
  directionalLight.shadow.bias = -0.00006;

  scene.value.add(directionalLight);
};

//初始化阴影
const initShadow = () => {
  //开启圆柱体的阴影
  cylinder.value.castShadow = true;
  //开启平面的 接收阴影
  cube.value.receiveShadow = true;
  //开启灯光的阴影
  spotLight.value.castShadow = true;
};

//初始化渲染器
const initRender = () => {
  // 3.创建render
  // 我们设置WebGL位置
  renderer.value = new THREE.WebGLRenderer({ antialias: true });

  //开启渲染器中的阴影渲染
  renderer.value.shadowMap.enabled = true;
  renderer.value.shadowMap.type = THREE.VSMShadowMap;
  renderer.value.outputEncoding = THREE.sRGBEncoding;
  renderer.value.toneMapping = THREE.ACESFilmicToneMapping;

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
  GUIController.value.add({ debug: true }, 'debug').onChange((value) => {
    helper.visible = value;
  });

  //   光源调试
  //创建对控制器调试的参数分组
  //   const spotLightFolder = GUIController.value.addFolder('Spot Light');
  //分组中添加要调试的参数
  // spotLightFolder.addColor('要调试的东西','要调试物体中的参数','开始范围','结束范围');
  //再利用onChange方法，改变参数后 反馈回 对应的物体
  //value =改动后的值

  //   调试光的颜色
  //   spotLightFolder.addColor(spotLight.value, 'color').onChange((value) => {
  //     //改变对应物体属性的值
  //     spotLight.value.color.set(value);
  //   });
  //调试光源的角度
  // spotLightFolder.add('要调试的东西','要调试物体中的参数','开始范围','结束范围');

  //直接调用onChange 后直接render 也可以实现
  //   spotLightFolder.addColor(spotLight.value, 'color').onChange(render);
  //   spotLightFolder
  //     .add(spotLight.value, 'angle', 0, Math.PI / 2)
  //     .onChange(render);

  //   spotLightFolder
  //     .add(spotLight.value, 'angle', 0, Math.PI / 2)
  //     .onChange((value) => {
  //       spotLight.value.angle = value;
  //       render();
  //       //更新光源 辅助的参数
  //       spotLightHelper.value.update();
  //     });
  //   //设置光源模糊度
  //   spotLightFolder.add(spotLight.value, 'penumbra', 0, 1).onChange(render);

  //   //camera参数的调整
  //   const cameraFolder = GUIController.value.addFolder('CameraFolder');
  //   //   调控camera的x位置
  //   // spotLightFolder.add('要调试的东西','要调试物体中的参数','开始范围','结束范围').step('拖动的精度');

  //   cameraFolder
  //     .add(camera.value.position, 'x', -1000, 1000)
  //     .step(1)
  //     .onChange(render);
};

// 渲染
const render = () => {
  //   创建的cube进行旋转
  //   toRaw(cube.value).rotation.y = toRaw(cube.value).rotation.y + 0.01;

  //requestAnimationFrame来自浏览器 就是一旦有空闲就会再次调用里面放的函数
  //   相当于无线循环render

  //   移动
  const deltaTime = Math.min(0.05, clock.getDelta());

  handleControls(deltaTime);
  // 更新角色信息
  updatePlayer(deltaTime);
  playerCollision();

  updateSpheres(deltaTime);

  teleportPlayerIfOob();

  //   for (let sphere of spheres) {
  //     sphere.mesh.position.copy(sphere.collider.center);
  //   }

  // 这段代码必须放到最下面
  // render(场景，相机)
  toRaw(renderer.value).render(toRaw(scene.value), toRaw(camera.value));

  requestAnimationFrame(render);
};
// 投掷球

const throwBall = () => {
  const sphere = spheres[sphereIdx];
  camera.value.getWorldDirection(player.direction);
  sphere.collider.center
    .copy(player.geometry.end)
    .addScaledVector(player.direction, player.geometry.radius * 1.5);

  const impulse =
    15 + 30 * (1 - Math.exp(mouseTime - performance.now()) * 0.001);
  sphere.velocity.copy(player.direction).multiplyScalar(impulse);
  sphere.velocity.addScaledVector(player.velocity, 2);

  sphereIdx = (sphereIdx + 1) % spheres.length;
};

// 更新球体
const updateSpheres = (deltaTime) => {
  spheres.forEach((item) => {
    item.collider.center.addScaledVector(item.velocity, deltaTime);
    const result = otreeWorld.sphereIntersect(item.collider);
    if (result) {
      item.velocity.addScaledVector(
        result.normal,
        -result.normal.dot(item.velocity) * 1.5
      );
      item.collider.center.add(result.normal.multiplyScalar(result.depth));
    } else {
      item.velocity.y = item.velocity.y - GRAVITY * deltaTime;
    }

    const damping = Math.exp(-1.5 * deltaTime) - 1;
    item.velocity.addScaledVector(item.velocity, damping);

    playerSphereCollsion(item);
  });

  spheresCollision();

  for (let sphere of spheres) {
    sphere.mesh.position.copy(sphere.collider.center);
  }
};

//玩家移动
const handleControls = (deltaTime) => {
  //   如果玩家状态是在地上的话，对应的速度加快
  const speedDelta = player.onFloor ? deltaTime * 25 : deltaTime * 8;
  if (keyStates['KeyW']) {
    player.velocity.add(getForwardVector().multiplyScalar(speedDelta));
  }
  if (keyStates['KeyS']) {
    player.velocity.add(getForwardVector().multiplyScalar(-speedDelta));
  }
  if (keyStates['KeyA']) {
    player.velocity.add(getSideVector().multiplyScalar(-speedDelta));
  }
  if (keyStates['KeyD']) {
    player.velocity.add(getSideVector().multiplyScalar(speedDelta));
  }

  //   如果玩家在地板上
  // 如果他按下的按钮是空格键，对应的玩家的位置y就设置为15
  if (player.onFloor) {
    if (keyStates['Space']) {
      player.velocity.y = 15;
    }
  }
};

const updatePlayer = (deltaTime) => {
  let damping = Math.exp(-4 * deltaTime) - 1;
  if (!player.onFloor) {
    player.velocity.y = player.velocity.y - GRAVITY * deltaTime;
    damping = damping * 0.1;
  }

  player.velocity.addScaledVector(player.velocity, damping);
  const deltaPosition = player.velocity.clone().multiplyScalar(deltaTime);
  player.geometry.translate(deltaPosition);

  camera.value.position.copy(player.geometry.end);
};

// 碰撞检测
const playerCollision = () => {
  const result = otreeWorld.capsuleIntersect(player.geometry);
  if (result) {
    // 根据物体的y是否大于0来 设置人物是否在地板上
    if (result.normal.y > 0) {
      player.onFloor = true;
    } else {
      player.onFloor = false;
    }

    // 如果人物不在地面上

    if (!player.onFloor) {
      player.velocity.addScaledVector(
        result.normal,
        -result.normal.dot(player.velocity)
      );
    }
    player.geometry.translate(result.normal.multiplyScalar(result.depth));
  } else {
    player.onFloor = false;
  }
};
// 球体的碰撞检测
const spheresCollision = () => {
  for (let i = 0; i < spheres.length; i++) {
    const s1 = spheres[i];
    for (let j = i + 1; j < spheres.length; j++) {
      const s2 = spheres[j];
      const d2 = s1.collider.center.distanceToSquared(s2.collider.center);
      const r = s1.collider.radius + s2.collider.radius;
      const r2 = r * r;

      if (d2 < r2) {
        const normal = vector1
          .subVectors(s1.collider.center, s2.collider.center)
          .normalize();
        const v1 = vector2.copy(normal).multiplyScalar(normal.dot(s1.velocity));
        const v2 = vector3.copy(normal).multiplyScalar(normal.dot(s2.velocity));
        s1.velocity.add(v2).sub(v1);
        s2.velocity.add(v1).sub(v2);

        const d = r - Math.sqrt(d2) / 2;
        s1.collider.center.addScaledVector(normal, d);
        s2.collider.center.addScaledVector(normal, -d);
      }
    }
  }
};

// 玩家与球的碰撞检测
const playerSphereCollsion = (sphere) => {
  const center = vector1
    .addVectors(player.geometry.start, player.geometry.end)
    .multiplyScalar(0.5);
  const sphere_center = sphere.collider.center;

  const r = player.geometry.radius + sphere.collider.radius;
  const r2 = r * r;

  for (const point of [player.geometry.start, player.geometry.end, center]) {
    const d2 = point.distanceToSquared(sphere_center);
    if (d2 < r2) {
      const normal = vector1.subVectors(point, sphere_center).normalize();
      const v1 = vector2
        .copy(normal)
        .multiplyScalar(normal.dot(player.velocity));
      const v2 = vector3
        .copy(normal)
        .multiplyScalar(normal.dot(sphere.velocity));
      player.velocity.add(v2).sub(v1);
      sphere.velocity.add(v1).sub(v2);
      const d = (r - Math.sqrt(d2)) / 2;
      sphere_center.addScaledVector(normal, -d);
    }
  }
};

const teleportPlayerIfOob = () => {
  if (camera.value.position.y <= -25) {
    player.geometry.start.set(0, 0.35, 0);
    player.geometry.end.set(0, 0.35, 0);
    player.geometry.radius = 0.35;
    camera.value.position.copy(player.geometry.end);
    camera.value.rotation.setScalar(0);
  }
};

const getForwardVector = () => {
  camera.value.getWorldDirection(player.direction);
  player.direction.y = 0;
  player.direction.normalize();
  return player.direction;
};

const getSideVector = () => {
  camera.value.getWorldDirection(player.direction);
  player.direction.y = 0;
  player.direction.normalize();
  player.direction.cross(camera.value.up);

  return player.direction;
};

//让渲染的页面随着窗体变化而变化
window.addEventListener('resize', function () {
  camera.value.aspect = window.innerWidth / window.innerHeight;
  // 所以，执行camera.updateProjectionMatrix();的时候，threejs会重新计算相机对象的投影矩阵值。
  camera.value.updateProjectionMatrix();
  //调整页面的大小
  renderer.value.setSize(window.innerWidth, window.innerHeight);
});
</script>

<style scoped></style>
