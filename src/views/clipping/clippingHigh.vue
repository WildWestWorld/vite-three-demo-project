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

let group;
let clipMaterial;

let startTime;

const NUM_LOCAL_CLIPPINGS_PLANES = 4;
let localPlanes;
let localPlanesMatrices;

let helpersGroup;

let NUM_GLOBAL_CLIPPINGS_PLANES = 5;
let globalPlanes;
let transformGlobalPlanes;

const transform = new THREE.Matrix4();
const tmpMatrix = new THREE.Matrix4();
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
  initPlanesHelper();

  //初始化参数调试器GUI
  initGUI();

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
  scene.value.background = new THREE.Color(0x888888);
};

//初始化坐标轴
const initAxis = () => {
  // 创建坐标轴 里面的10 是坐标轴的长度
  axisHelp.value = new THREE.AxesHelper(0.5);

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
    36,
    window.innerWidth / window.innerHeight,
    0.25,
    16
  );
  // 设置camera摆放的位置
  //   将camera放到z轴位置处于5的位置
  //   toRaw 将响应式对象改为普通对象，不用就报错，说Positon无法改变

  //   若不设置看不到z轴
  toRaw(camera.value).position.x = 0;

  toRaw(camera.value).position.y = 1.5;
  toRaw(camera.value).position.z = 3;

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
  group = new THREE.Group();

  const geometry = new THREE.BoxGeometry(0.18, 0.18, 0.18);
  clipMaterial = new THREE.MeshPhongMaterial({
    color: 0xee0a10,
    shininess: 100,
    side: THREE.DoubleSide,
    clippingPlanes: createPlanes(NUM_LOCAL_CLIPPINGS_PLANES),
    clipShadows: true,
  });

  for (let z = -2; z <= 2; z++) {
    for (let y = -2; y <= 2; y++) {
      for (let x = -2; x <= 2; x++) {
        const mesh = new THREE.Mesh(geometry, clipMaterial);
        mesh.position.set(x / 5, y / 5, z / 5);
        mesh.castShadow = true;
        group.add(mesh);
      }
    }
  }

  scene.value.add(group);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 3, 1, 1),
    new THREE.MeshPhongMaterial({ color: 0xa0adaf, shininess: 10 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.scale.multiplyScalar(3);
  ground.receiveShadow = true;

  group.position.y = 1;
  scene.value.add(ground);

  localPlanes = [];
  const points = [
    new THREE.Vector3(1, 0, Math.SQRT1_2),
    new THREE.Vector3(-1, 0, Math.SQRT1_2),
    new THREE.Vector3(0, 1, -Math.SQRT1_2),
    new THREE.Vector3(0, -1, -Math.SQRT1_2),
  ];
  const indeces = [0, 1, 2, 0, 2, 3, 0, 3, 1, 1, 3, 2];

  const n = indeces.length / 3;

  for (let i = 0, j = 0; i < n; i++, j += 3) {
    const a = points[indeces[j]];
    const b = points[indeces[j + 1]];
    const c = points[indeces[j + 2]];

    localPlanes.push(new THREE.Plane().setFromCoplanarPoints(a, b, c));
  }
  localPlanesMatrices = localPlanes.map((plane) => {
    const xAxis = new THREE.Vector3();
    const yAxis = new THREE.Vector3();
    const zAxis = plane.normal;
    const trans = new THREE.Vector3();
    const matrix = new THREE.Matrix4();

    if (Math.abs(zAxis.x) > Math.abs(zAxis.z)) {
      yAxis.set(-zAxis.y, -zAxis.x, 0);
    } else {
      yAxis.set(0, -zAxis.z, zAxis.y);
    }
    xAxis.crossVectors(yAxis.normalize(), zAxis);
    plane.coplanarPoint(trans);
    return matrix.set(
      xAxis.x,
      yAxis.x,
      zAxis.x,
      trans.x,
      xAxis.y,
      yAxis.y,
      zAxis.y,
      trans.y,
      xAxis.z,
      yAxis.z,
      zAxis.z,
      trans.z,
      0,
      0,
      0,
      1
    );
  });

  //  global
  globalPlanes = createPlanes(NUM_GLOBAL_CLIPPINGS_PLANES);
  for (let i = 0; i < NUM_GLOBAL_CLIPPINGS_PLANES; i++) {
    const plane = globalPlanes[i];
    const angle = (i * 2 * Math.PI) / NUM_GLOBAL_CLIPPINGS_PLANES;
    plane.normal.set(Math.cos(angle), Math.sin(angle));
    plane.constant = 2.5;
  }
  transformGlobalPlanes = createPlanes(NUM_GLOBAL_CLIPPINGS_PLANES);
};

const createPlanes = (n) => {
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(new THREE.Plane()); //刀
  }
  return result;
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
  ambientLight.value = new THREE.AmbientLight(0xffffff, 0.3);
  scene.value.add(ambientLight.value);

  const spotLight = new THREE.SpotLight(0xffffff, 0.5);
  spotLight.angle = Math.PI / 5;
  spotLight.penumbra = 0.2;
  spotLight.position.set(2, 3, 3);
  spotLight.castShadow = true;

  spotLight.shadow.camera.near = 3;
  spotLight.shadow.camera.far = 10;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  scene.value.add(spotLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(0, 2, 0);
  dirLight.castShadow = true;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 10;

  dirLight.shadow.camera.right = 1;
  dirLight.shadow.camera.left = -1;
  dirLight.shadow.camera.top = 1;
  dirLight.shadow.camera.bottom = -1;

  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;

  //   const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  //   dirLight.position.set(10, 10, 5);
  scene.value.add(dirLight);
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

  renderer.value.localClippingEnabled = true;

  //   将渲染好的数据，放到document里面
  // renderer.value.domElement=我们渲染出来的数据(是一个canvas)
  //   document.body.appendChild(renderer.value.domElement);
  let threeContainer = document.querySelector('.three-container');
  threeContainer.appendChild(renderer.value.domElement);
};

//初始化控制器
const initController = () => {
  startTime = Date.now();

  // 4.控制器
  cameraController.value = new OrbitControls(
    camera.value,
    renderer.value.domElement
  );

  cameraController.value.minDistance = 1;
  cameraController.value.maxDistance = 8;
  cameraController.value.target.y = 1;
  //设置控制器变换的基础点
  //   cameraController.value.target.set(0, 1, 0);
};

//初始化图形参数控制器
const initGUI = () => {
  GUIController.value = new GUI();
  //将调试器 默认设置为关闭状态
  GUIController.value.close();

  let folder = GUIController.value.addFolder('Local clipping');
  folder
    .add(renderer.value, 'localClippingEnabled')
    .name('Enabled')
    .onChange((value) => {
      if (!value) {
        helpersGroup.visible = false;
      } else {
        helpersGroup.visible = true;
      }
    });

  folder.add(clipMaterial, 'clipShadows').name('Shadows');
  folder
    .add(helpersGroup, 'visible')
    .name('visualize')
    .onChange((value) => {
      if (renderer.value.localClippingEnabled) {
        helpersGroup.visible = value;
      }
    });

  folder = GUIController.value.addFolder('Global clipping');
  const globalClipping = { enabled: false };
  folder
    .add(globalClipping, 'enabled')
    .name('Enabled')
    .onChange((value) => {
      renderer.value.clippingPlanes = value ? transformGlobalPlanes : [];
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
  //设置光源模糊度
  //   spotLightFolder.add(spotLight.value, 'penumbra', 0, 1).onChange(render);

  //camera参数的调整
  //   const cameraFolder = GUIController.value.addFolder('CameraFolder');
  //   调控camera的x位置
  // spotLightFolder.add('要调试的东西','要调试物体中的参数','开始范围','结束范围').step('拖动的精度');

  //   cameraFolder
  //     .add(camera.value.position, 'x', -1000, 1000)
  //     .step(1)
  //     .onChange(render);
};

const initPlanesHelper = () => {
  helpersGroup = new THREE.Group();
  helpersGroup.visible = false;

  const planeGeometry = new THREE.PlaneGeometry(3, 3, 1, 1);

  const color = new THREE.Color();
  for (let i = 0; i < NUM_LOCAL_CLIPPINGS_PLANES; i++) {
    const material = new THREE.MeshBasicMaterial({
      color: color.setHSL(i / NUM_LOCAL_CLIPPINGS_PLANES, 0.5, 0.5).getHex(),
      side: THREE.DoubleSide,
      opacity: 0.2,
      transparent: true,
      clippingPlanes: clipMaterial.clippingPlanes.filter((_, j) => {
        return j !== i;
      }),
    });

    const mesh = new THREE.Mesh(planeGeometry, material);

    mesh.matrixAutoUpdate = false;
    helpersGroup.add(mesh);
  }
  scene.value.add(helpersGroup);

  // scene.value.add(helpersGroup);
};

// 渲染
const render = () => {
  //   创建的cube进行旋转
  //   toRaw(cube.value).rotation.y = toRaw(cube.value).rotation.y + 0.01;

  const time = (Date.now() - startTime) / 1000;
  group.rotation.x = time * 0.5;
  group.rotation.y = time * 0.2;
  //requestAnimationFrame来自浏览器 就是一旦有空闲就会再次调用里面放的函数
  //   相当于无线循环render

  group.updateMatrix();
  transform.copy(group.matrix);

  requestAnimationFrame(render);

  assignTransfromedPlanes(clipMaterial.clippingPlanes, localPlanes, transform);

  const helperMeshes = helpersGroup.children;
  for (let i = 0; i < helperMeshes.length; i++) {
    tmpMatrix.multiplyMatrices(transform, localPlanesMatrices[i]);
    setObjectWorldMatrix(helperMeshes[i], tmpMatrix);
  }

  transform.makeRotationY(time * 0.1);

  assignTransfromedPlanes(transformGlobalPlanes, globalPlanes, transform);

  // 这段代码必须放到最下面
  // render(场景，相机)
  toRaw(renderer.value).render(toRaw(scene.value), toRaw(camera.value));
};

const setObjectWorldMatrix = (object, matrix) => {
  const parent = object.parent;
  scene.value.updateMatrixWorld();
  object.matrix.copy(parent.matrixWorld).invert();
  object.applyMatrix4(matrix);
};

const assignTransfromedPlanes = (planesOut, planesIn, matrix) => {
  for (let i = 0; i < planesIn.length; i++) {
    planesOut[i].copy(planesIn[i]).applyMatrix4(matrix);
  }

  //   for (let i = 0, n = planesIn.length; i !== n; ++i) {
  //     planesOut[i].copy(planesIn[i]).applyMatrix4(matrix);
  //   }
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
