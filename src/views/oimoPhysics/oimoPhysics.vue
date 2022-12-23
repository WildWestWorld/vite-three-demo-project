<template>
  <div class="three-container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
//引入调试器
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
//引入物理属性
import { OimoPhysics } from 'three/examples/jsm/physics/OimoPhysics';

import { nextTick, onMounted, reactive, ref, toRaw } from 'vue';
// 变量区
//白光
let hesLight = new THREE.HemisphereLight(); //白色光
//平行光
let dirLight = new THREE.DirectionalLight();

//地板
let floor = new THREE.Mesh(
  new THREE.BoxGeometry(10, 1, 10),
  new THREE.ShadowMaterial({ color: 0x111111 })
); //使用shadowMaterial时必须开启影子

//物体
let boxes = new THREE.InstancedMesh(
  new THREE.BoxGeometry(0.1, 0.1, 0.1),
  new THREE.MeshLambertMaterial(), //用于模拟木头，橡胶，镜面反射差的材质
  100 //生成的个数
);
//球体
let shperes;

//定义物理
let physics;

//掉落开始的起始位置
let fallPositon = new THREE.Vector3();

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
onMounted(async () => {
  await init();
  render();
});
// 方法区

//初始化
const init = async () => {
  //初始化场景
  initScene();

  //初始化坐标轴
  initAxis();

  //初始化相机
  initCamera();

  //初始化几何体
  //   initCube();

  //   initCylinder();

  initMeshes();

  //初始化多个几何体(后添)

  //初始化光线
  //   initAmbientLight();
  //初始化白光(后添)
  initLight();

  //初始化聚光灯
  //   initSpotLight();
  //初始化聚光灯辅助（可注释）
  // initSpotLightHelper();

  //初始化阴影
  initShadow();

  //初始化物理引擎
  await initPhysics();

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
  scene.value.background = new THREE.Color(0x888888);
};

//初始化坐标轴
const initAxis = () => {
  // 创建坐标轴
  axisHelp.value = new THREE.AxesHelper();

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
    0.1,
    1000
  );
  // 设置camera摆放的位置
  //   将camera放到z轴位置处于5的位置
  //   toRaw 将响应式对象改为普通对象，不用就报错，说Positon无法改变

  //   若不设置看不到z轴
  toRaw(camera.value).position.x = 2;

  toRaw(camera.value).position.y = 2;
  toRaw(camera.value).position.z = 2;

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

//初始化多个物体
const initMeshes = () => {
  //设置地板Floor
  floor = new THREE.Mesh(
    new THREE.BoxGeometry(10, 1, 10),
    new THREE.ShadowMaterial({ color: 0x111111 })
  ); //使用shadowMaterial时必须开启影子
  floor.position.set(0, -1, 0);

  scene.value.add(floor);

  //提高box的动画流畅度
  boxes.instanceMatrix.setUsage(THREE.DynamicDrawUsage); //更新每一帧

  //box在上面初始化过了
  //现在需要弄个四维的矩阵来排列物体
  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();
  for (let i = 0; i < boxes.count; i++) {
    matrix.setPosition(0, 0, 0);
    matrix.setPosition(
      Math.random() - 0.5, //取值范围:-0.5~0.5
      Math.random() * 2, //取值范围:0-2
      Math.random() - 0.5
    ); //取值范围:0.5~-0.5;
    boxes.setMatrixAt(i, matrix);
    boxes.setColorAt(i, color.setHex(Math.random() * 0xffffff));
  }
  scene.value.add(boxes);

  //   生成球体
  //初始化球体
  shperes = new THREE.InstancedMesh(
    new THREE.IcosahedronBufferGeometry(0.075, 3),
    new THREE.MeshLambertMaterial(), //用于木头材质的物体
    100
  );

  //提高shperes的动画流畅度
  shperes.instanceMatrix.setUsage(THREE.DynamicDrawUsage); //更新每一帧

  //现在需要弄个四维的矩阵来排列物体

  for (let i = 0; i < shperes.count; i++) {
    matrix.setPosition(0, 0, 0);
    matrix.setPosition(
      Math.random() - 0.5, //取值范围:-0.5~0.5
      Math.random() * 2, //取值范围:0-2
      Math.random() - 0.5
    ); //取值范围:0.5~-0.5;
    shperes.setMatrixAt(i, matrix);
    shperes.setColorAt(i, color.setHex(Math.random() * 0xffffff));
  }
  scene.value.add(shperes);
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
//初始化白光
const initLight = () => {
  //环境光
  //白光添加的变量已经在最上面添加过了
  hesLight.intensity = 0.3;
  //场景添加白光
  scene.value.add(hesLight);

  //平行光
  dirLight = new THREE.DirectionalLight();
  // 我们希望光能够从右边打过来
  dirLight.position.set(5, 5, -5);
  scene.value.add(dirLight);
};

//初始化阴影
const initShadow = () => {
  //开启圆柱体的阴影
  //   cylinder.value.castShadow = true;
  //开启平面的 接收阴影
  //   cube.value.receiveShadow = true;
  //开启灯光的阴影
  //   spotLight.value.castShadow = true;
  dirLight.castShadow = true;

  //提高阴影的质感
  dirLight.shadow.camera.zoom = 2;

  floor.receiveShadow = true;
  boxes.castShadow = true;
  boxes.receiveShadow = true;
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

  //改变渲染器的输入编码方式 ，用了THREE.sRGBEncoding 颜色就回偏亮些，更好看些
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
  cameraController.value.target.y = 1;
  cameraController.value.update();
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
// 初始化物理引擎，默认的物理引擎的调用其实是异步方法
const initPhysics = async () => {
  physics = await OimoPhysics();
  //哪个物体需要加入物理引擎 我们用addMesh（物体，加速度）方法就行 如果加了加速度就会往下落
  physics.addMesh(floor);
  //盒子
  physics.addMesh(boxes, 1);
  //球体
  physics.addMesh(shperes, 1);
};

// 渲染
const render = () => {
  // render(场景，相机)
  toRaw(renderer.value).render(toRaw(scene.value), toRaw(camera.value));
  //   创建的cube进行旋转
  //   toRaw(cube.value).rotation.y = toRaw(cube.value).rotation.y + 0.01;

  //requestAnimationFrame来自浏览器 就是一旦有空闲就会再次调用里面放的函数
  //   相当于无线循环render

  //需要nextTick 因为此时
  //随机的索引
  let randomIndex = Math.floor(Math.random() * boxes.count);
  fallPositon.set(0, Math.random() + 1, 0);
  //随机设置Boxes里面的物体Index，把他设置倒fallPostion 的位置，这样他就能回到对应的位置
  physics.setMeshPosition(boxes, fallPositon, randomIndex);
  physics.setMeshPosition(shperes, fallPositon, randomIndex);
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

<style scoped></style>
