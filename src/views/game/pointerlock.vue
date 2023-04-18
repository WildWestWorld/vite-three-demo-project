<template>
  <div id="blocker">
    <div id="instructions">
      <p style="font-size: 36px">Click to play</p>
      <p>Move:WASD Jump:SPACE Look:MOUSE</p>
    </div>
  </div>

  <div class="three-container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

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

let color = new THREE.Color();
let vertex = new THREE.Vector3();

let moveBackward = false;
let moveFontward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();

let objects = [];
let preTime = performance.now();

let raycaster = new THREE.Raycaster(
  new THREE.Vector3(),
  new THREE.Vector3(0, -1, 0),
  0,
  10
);

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

  const block = document.getElementById('blocker');
  const instructions = document.getElementById('instructions');
  instructions.addEventListener('click', () => {
    cameraController.value.lock();
  });

  cameraController.value.addEventListener('lock', () => {
    instructions.style.display = 'none';
    block.style.display = 'none';
  });

  cameraController.value.addEventListener('unlock', () => {
    instructions.style.display = '';
    block.style.display = '';
  });

  document.addEventListener('keyup', onKeyUp);
  document.addEventListener('keydown', onKeyDown);
};

const onKeyDown = (event) => {
  switch (event.code) {
    case 'ArrowUp':
      moveFontward = true;
      break;

    case 'KeyW':
      moveFontward = true;
      break;

    case 'ArrowDown':
      moveBackward = true;
      break;

    case 'KeyS':
      moveBackward = true;
      break;

    case 'ArrowRight':
      moveRight = true;
      break;

    case 'KeyD':
      moveRight = true;
      break;

    case 'ArrowLeft':
      moveLeft = true;
      break;

    case 'KeyA':
      moveLeft = true;
      break;
  }
};
const onKeyUp = (event) => {
  switch (event.code) {
    case 'ArrowUp':
      moveFontward = false;
      break;

    case 'KeyW':
      moveFontward = false;
      break;

    case 'ArrowDown':
      moveBackward = false;
      break;

    case 'KeyS':
      moveBackward = false;
      break;

    case 'ArrowRight':
      moveRight = false;
      break;

    case 'KeyD':
      moveRight = false;
      break;

    case 'ArrowLeft':
      moveLeft = false;
      break;

    case 'KeyA':
      moveLeft = false;
      break;
    case 'Space':
      if (canJump === true) {
        velocity.y = velocity.y + 350;
      }
      canJump = false;
      break;
  }
};

//初始化的子函数
//初始化场景
const initScene = () => {
  //// 1.创建scene以及物体
  //   创建场景
  scene.value = new THREE.Scene();
  //设置场景背景颜色
  scene.value.background = new THREE.Color(0xffffff);

  scene.fog = new THREE.Fog(0xffffff, 0, 750);
};

//初始化坐标轴
const initAxis = () => {
  // 创建坐标轴 里面的10 是坐标轴的长度
  axisHelp.value = new THREE.AxesHelper(5);

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
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  // 设置camera摆放的位置
  //   将camera放到z轴位置处于5的位置
  //   toRaw 将响应式对象改为普通对象，不用就报错，说Positon无法改变

  //   若不设置看不到z轴
  // toRaw(camera.value).position.x = 10;

  // toRaw(camera.value).position.y = 30;
  //   toRaw(camera.value).position.z = 200;
  toRaw(camera.value).position.y = 10;

  //   camera.value.lookAt(0, 0, 0);
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

  // floor
  let geometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
  geometry.rotateX(-Math.PI / 2);

  let position = geometry.getAttribute('position');
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    vertex.x = vertex.x + Math.random() * 20 - 10;
    vertex.y = vertex.y + Math.random() * 2;
    vertex.z = vertex.z + Math.random() * 20 - 10;
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  //   共享点分离
  geometry = geometry.toNonIndexed();

  position = geometry.getAttribute('position');
  const colors = [];

  for (let i = 0; i < position.count; i++) {
    color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
    colors.push(color.r, color.g, color.b);
  }
  //   console.log(colors);
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  let material = new THREE.MeshBasicMaterial({ vertexColors: true });

  const mesh = new THREE.Mesh(geometry, material);

  scene.value.add(mesh);

  //   物体
  let boxGeometry = new THREE.BoxGeometry(20, 20, 20);
  boxGeometry = boxGeometry.toNonIndexed();
  let boxPosition = boxGeometry.attributes.position;
  let boxColors = [];
  for (let i = 0; i < boxPosition.count; i++) {
    color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
    boxColors.push(color.r, color.g, color.b);
  }
  boxGeometry.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(boxColors, 3)
  );

  for (let i = 0; i < 500; i++) {
    const boxMaterial = new THREE.MeshPhongMaterial({
      specular: 0xffffff,
      vertexColors: true,
      color: color.setHSL(
        Math.random() * 0.3 + 0.5,
        0.75,
        Math.random() * 0.25 + 0.75
      ),
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(
      Math.floor(Math.random() * 20 - 10) * 20,
      Math.floor(Math.random() * 20) * 20 + 10,
      Math.floor(Math.random() * 20 - 10) * 20
    );
    scene.value.add(box);

    objects.push(box);
  }
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
  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.value.add(light);
  //添加环境光
  //   ambientLight.value = new THREE.AmbientLight(0xffffff, 0.2);
  //   scene.value.add(ambientLight.value);

  //   const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  //   dirLight.position.set(10, 10, 5);
  //   scene.value.add(dirLight);
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
  renderer.value = new THREE.WebGLRenderer();

  //开启渲染器中的阴影渲染
  renderer.value.shadowMap.enabled = true;

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
  //   cameraController.value = new OrbitControls(
  //     camera.value,
  //     renderer.value.domElement
  //   );

  cameraController.value = new PointerLockControls(
    toRaw(camera.value),
    toRaw(renderer.value.domElement)
  );

  //设置控制器变换的基础点
  //   cameraController.value.target.set(0, 1, 0);
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

  const time = performance.now();
  //   如果控制器是被锁住的
  if (cameraController.value.isLocked) {
    const delta = (time - preTime) / 1000;
    console.log(delta);

    // x,z 方向收到阻力之后 速度不断减少
    velocity.x = velocity.x - velocity.x * 10.0 * delta;
    velocity.z = velocity.z - velocity.z * 10.0 * delta;

    console.log(velocity);

    // x:右为正
    direction.x = Number(moveRight) - Number(moveLeft);
    // z:前为正
    direction.z = Number(moveFontward) - Number(moveBackward);
    // 方向归一化
    direction.normalize();

    console.warn(direction);

    // x,z方向移动
    if (moveLeft || moveRight) {
      velocity.x = velocity.x + direction.x * 400.0 * delta;
    }
    if (moveFontward || moveBackward) {
      velocity.z = velocity.z + direction.z * 400.0 * delta;
    }

    // 向右移动
    cameraController.value.moveRight(velocity.x * delta);
    // 向前移动
    cameraController.value.moveForward(velocity.z * delta);

    // y方向自由落体
    velocity.y = velocity.y - 9.8 * 100.0 * delta;

    // 是否站在箱子上
    raycaster.ray.origin.copy(cameraController.value.getObject().position)
      .position;
    raycaster.ray.origin.y = raycaster.ray.origin.y - 10;
    const intersections = raycaster.intersectObjects(objects, false);
    const onBox = intersections.length > 0;
    if (onBox === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    cameraController.value.getObject().position.y =
      cameraController.value.getObject().position.y + velocity.y * delta;
    if (cameraController.value.getObject().position.y < 10) {
      velocity.y = 0;
      cameraController.value.getObject().position.y = 10;
      canJump = true;
    }
  }
  preTime = time;

  // 这段代码必须放到最下面
  // render(场景，相机)
  toRaw(renderer.value).render(toRaw(scene.value), toRaw(camera.value));

  requestAnimationFrame(render);
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

<style scoped>
#blocker {
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

#instructions {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  text-align: center;
  font-size: 14px;
  cursor: pointer;
}
</style>
