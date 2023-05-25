<template>
  <!-- 背景音乐 -->
  <div class="bg-muic">
    <audio
      src="./files/OGOD/music/bg-music.mp3"
      loop
      autoplay
      ref="bgMuiscRef"
    ></audio>
  </div>
  <!-- 音乐按钮 -->
  <div class="music-button" @click="changeMusicVolumeState">
    <img
      :src="getAssetsFile('../../../files/OGOD/img/audio-off.png')"
      alt=""
      class="music-off"
      v-if="isMute"
    />
    <img
      :src="getAssetsFile('../../../files/OGOD/img/audio-on.png')"
      alt=""
      class="music-on"
      v-if="!isMute"
    />
  </div>

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

let godEyeMesh;
let arrowMesh;
let textMesh;
let shadowMesh;
let shadowMesh2;

let clock = new THREE.Clock();
let mixer;
let animationAcition;
let angle = 0;

// 创建光点正弦角度
let angle2 = 0;

// 是否动画正在播放中
let isAniPlay = false;

// 神之眼音效 音量大小
let musicVolume = 1;
const isMute = ref(false);
const bgMuiscRef = ref(null);

// 创建气泡点效果
//   储存每个点每帧的移动量
let moveArrX = [];
let moveArrY = [];
//   储存每个点移动时间
let moveTime = [];
//   当前时间
let nowTime = 0;
//   每个光点生成的时间
let joinTime = [];
//   创建一个组对象存放的光点
let group1 = new THREE.Group();

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

// 获取assets静态资源
const getAssetsFile = (url) => {
  return new URL(`${url}`, import.meta.url).href;
};

// 改变音乐状态
const changeMusicVolumeState = () => {
  let currentIsMute = isMute.value;
  isMute.value = !currentIsMute;

  if (isMute.value) {
    bgMuiscRef.value.volume = 0;
    musicVolume = 0;
  } else {
    bgMuiscRef.value.volume = 1;
    musicVolume = 1;
  }
};

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
  //   initGUI();

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
  //   scene.value.background = new THREE.Color(0x888888);
};

//初始化坐标轴
const initAxis = () => {
  // 创建坐标轴 里面的10 是坐标轴的长度
  axisHelp.value = new THREE.AxesHelper(50);

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
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  // 设置camera摆放的位置
  //   将camera放到z轴位置处于5的位置
  //   toRaw 将响应式对象改为普通对象，不用就报错，说Positon无法改变

  //   若不设置看不到z轴
  //   toRaw(camera.value).position.x = 10;

  //   toRaw(camera.value).position.y = 30;
  toRaw(camera.value).position.z = 5;

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

  //   创建背景
  //   创建矩形
  let plane = new THREE.PlaneGeometry(160, 80);
  let planeMaterial = new THREE.MeshBasicMaterial();

  let textureLoader = new THREE.TextureLoader();

  let bg = textureLoader.load('./files/OGOD/img/bg-img.jpg');
  planeMaterial.map = bg;

  let planeMesh = new THREE.Mesh(plane, planeMaterial);
  //   将plane 移动Z 不然太大了，看不到全部图片
  planeMesh.translateZ(-60);
  scene.value.add(planeMesh);

  // 创建神之眼模型

  let godEyeGeometry = new THREE.PlaneGeometry(15, 11);
  let godEyeMaterial = new THREE.MeshBasicMaterial();

  let godEyeTexture = textureLoader.load('./files/OGOD/img/god-eye.png');
  godEyeMaterial.map = godEyeTexture;

  godEyeMaterial.transparent = true;
  godEyeMaterial.opacity = 0;

  godEyeMesh = new THREE.Mesh(godEyeGeometry, godEyeMaterial);

  godEyeMesh.name = 'godEye';

  godEyeMesh.translateX(4.8);
  godEyeMesh.translateY(0.75);
  godEyeMesh.translateZ(-25);

  scene.value.add(godEyeMesh);

  //   创建绿光
  let pendantLightGeometry = new THREE.PlaneGeometry(15, 11);
  let pendantLightMaterial = new THREE.MeshBasicMaterial();

  let pendantLightTexture = textureLoader.load(
    './files/OGOD/img/pendant-light.png'
  );
  pendantLightMaterial.map = pendantLightTexture;

  // 设置图片背景透明化 重要！
  pendantLightMaterial.transparent = true;
  pendantLightMaterial.blending = THREE.AdditiveBlending;
  pendantLightMaterial.opacity = 0;

  let pendantLightMesh = new THREE.Mesh(
    pendantLightGeometry,
    pendantLightMaterial
  );

  pendantLightMesh.name = 'pendantLight';

  pendantLightMesh.translateX(5.5);
  pendantLightMesh.translateY(1.6);
  pendantLightMesh.translateZ(-30);

  pendantLightMesh.rotation.x = -0.4;
  pendantLightMesh.rotation.y = 0.2;

  // 缩放模型
  pendantLightMesh.scale.set(0, 0, 0);

  scene.value.add(pendantLightMesh);

  // 创建绿光的关键帧动画
  //   缩放关键帧
  let inScaleTrack = new THREE.KeyframeTrack(
    'pendantLight.scale',
    [0, 30],
    [0.5, 0.5, 0.5, 1, 1, 1]
  );
  // 透明关键帧
  //   缩放关键帧
  let inOpacityTrack = new THREE.KeyframeTrack(
    'pendantLight.material.opacity',
    [0, 30],
    [0, 1]
  );

  //   动画持续时间
  let duration = 30;

  // 设置动画
  let clip = new THREE.AnimationClip('in', duration, [
    inScaleTrack,
    inOpacityTrack,
  ]);
  mixer = new THREE.AnimationMixer(toRaw(scene.value));
  animationAcition = mixer.clipAction(clip);
  // 设置动画播放速率默认是1
  animationAcition.timeScale = 30;

  // 设置动画循环次数 默认无限循环，本次设置为只循环一次
  animationAcition.loop = THREE.LoopOnce;

  // 设置动画完成后停在最后一帧
  animationAcition.clampWhenFinished = true;
  // 播放动画
  //   animationAcition.play();

  // 创建箭头
  let arrowGeometry = new THREE.PlaneGeometry(3, 3);
  let arrowMaterial = new THREE.MeshBasicMaterial();

  let arrowTexture = textureLoader.load('./files/OGOD/img/arrow-img.png');
  arrowMaterial.map = arrowTexture;

  // 设置图片背景透明化 重要！
  arrowMaterial.transparent = true;
  //   arrowMaterial.opacity = 0;

  arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);

  arrowMesh.name = 'arrow';

  arrowMesh.translateX(4);
  //   arrowMesh.translateY(1.6);
  arrowMesh.translateZ(-24);

  scene.value.add(arrowMesh);

  // 创建文字
  let textGeometry = new THREE.PlaneGeometry(9, 1.8);
  let textMaterial = new THREE.MeshBasicMaterial();

  let textTexture = textureLoader.load('./files/OGOD/img/text-img.png');
  textMaterial.map = textTexture;

  // 设置图片背景透明化 重要！
  textMaterial.transparent = true;
  //   textMaterial.opacity = 0;

  textMesh = new THREE.Mesh(textGeometry, textMaterial);

  textMesh.name = 'text';

  textMesh.translateX(1);
  textMesh.translateY(-2.5);
  textMesh.translateZ(-1);

  scene.value.add(textMesh);

  // 创建量角器旁边的光线
  let shadowGeometry = new THREE.PlaneGeometry(12, 60);
  let shadowMaterial = new THREE.MeshBasicMaterial();

  let shadowTexture = textureLoader.load('./files/OGOD/img/shadow-img.jpg');
  shadowMaterial.map = shadowTexture;

  // 设置图片背景透明化 重要！
  shadowMaterial.transparent = true;
  //   shadowMaterial.opacity = 0;

  shadowMaterial.blending = THREE.AdditiveBlending;

  shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial);

  shadowMesh.name = 'shadow';

  shadowMesh.translateX(-10);
  shadowMesh.translateY(10);
  shadowMesh.translateZ(-35);
  shadowMesh.rotation.z = -0.9;
  scene.value.add(shadowMesh);

  // 创建放大镜旁边的光线

  shadowMesh2 = new THREE.Mesh(shadowGeometry, shadowMaterial);

  shadowMesh2.name = 'shadow2';

  shadowMesh2.translateX(25);
  shadowMesh2.translateY(10);
  shadowMesh2.translateZ(-33);
  shadowMesh2.rotation.z = -0.8;

  scene.value.add(shadowMesh2);

  // 创建光点
  //   创建外层光点
  for (let i = 0; i < 40; i++) {
    addDot(-39, 1.3, 1);
  }
  //   创建内层光点
  for (let i = 0; i < 200; i++) {
    addDot(-29, 0.3, 0);
  }
  scene.value.add(group1);
};

// 创建一个添加光点的方法
// posZ：z轴位置
// scale：缩放大小
// i：y轴范围
const addDot = (posZ, scale, i = 1) => {
  let textureLoader = new THREE.TextureLoader();

  joinTime.push(Date.now());
  // 光点每帧移动的量  范围-0.01~0.01
  moveArrX.push(Math.random() * 0.02 - 0.01);
  moveArrY.push(Math.random() * 0.02 - 0.01);

  // 移动时间为10-20秒
  moveTime.push(Math.round(Math.random() * 10000 + 100000));
  // 光点的位置
  let randomX = Math.random() * 100 - 50;
  let randomY = Math.random() * 50 - 25 * i;

  // 创建光点模型
  let dotGeometry = new THREE.PlaneGeometry(1, 1);
  let dotMaterial = new THREE.MeshBasicMaterial();

  let dotTexture = textureLoader.load('./files/OGOD/img/dot-img.jpg');
  dotMaterial.map = dotTexture;

  // 设置图片背景透明化 重要！
  dotMaterial.transparent = true;
  //   dotMaterial.opacity = 0;

  dotMaterial.blending = THREE.AdditiveBlending;

  let dotMesh = new THREE.Mesh(dotGeometry, dotMaterial);

  dotMesh.name = 'dot';

  //   dotMesh.translateX(-10);
  //   dotMesh.translateY(10);
  dotMesh.translateZ(posZ);
  dotMesh.position.x = randomX * scale;
  dotMesh.position.y = randomY * scale;
  dotMesh.scale.set(scale, scale);
  group1.add(dotMesh);
  //   scene.value.add(dotMesh);
};

const playEyeGodMusic = () => {
  // 创建audio 标签
  let audio = document.createElement('audio');
  //  链接地址
  audio.src = './files/OGOD/music/eye-mouseover.mp3';
  //   自动播放
  audio.autoplay = true;
  //  音量大小
  audio.volume = musicVolume;
  document.body.appendChild(audio);
  // 当音效播放完毕就移除标签
  audio.addEventListener('ended', () => {
    document.body.removeChild(audio);
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
  ambientLight.value = new THREE.AmbientLight(0xffffff, 0.2);
  scene.value.add(ambientLight.value);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 10, 5);
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

  //   renderer.value.outputEncoding = THREE.sRGBEncoding;
  renderer.value.setClearColor(0xaaaaaa, 1);

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

// 渲染
const render = () => {
  //   创建的cube进行旋转
  //   toRaw(cube.value).rotation.y = toRaw(cube.value).rotation.y + 0.01;

  //requestAnimationFrame来自浏览器 就是一旦有空闲就会再次调用里面放的函数
  //   相当于无线循环render

  //   开启动画
  mixer.update(clock.getDelta());

  //   箭头上下移动动画
  arrowMesh.position.y = 9 + Math.sin(angle) * 0.5;
  angle = angle + 0.05;

  // 光点移动动画
  for (let i = 0; i < group1.children.length; i++) {
    // 记录当前时间
    nowTime = Date.now();
    let item = group1.children[i];
    // 移动每个光点
    item.position.x = item.position.x + moveArrX[i];
    item.position.y = item.position.y + moveArrY[i];

    // 判断 消逝时间是否到
    if (nowTime - joinTime[i] < moveTime[i]) {
      // 判断是大点还是小点
      if (item.position.z == 39) {
        item.material.opacity = (0.5 * (Math.sin(angle2) + 2.5)) / 3.5;
      } else {
        item.material.opacity = (0.5 * (Math.sin(angle2) + 4)) / 5;
      }
    } else {
      item.material.opacity = item.material.opacity - 0.0005;
    }

    //   如果时间到了透明度为0就移除并重新添加新的点
    if (item.material.opacity <= 0) {
      // 获取消失的点的参数
      let itemArguments = [item.position.z, item.scale.x];
      // 移除当前点
      group1.remove(item);
      // 移除其他参数里面的数据
      moveArrX.splice(i, 1);
      moveArrY.splice(i, 1);
      moveTime.splice(i, 1);
      joinTime.splice(i, 1);

      addDot(itemArguments[0], itemArguments[1]);
    }
  }

  //   持续改变angle2的大小,出现闪烁效果
  angle2 = angle2 + 0.03;

  // 这段代码必须放到最下面
  // render(场景，相机)
  toRaw(renderer.value).render(toRaw(scene.value), toRaw(camera.value));

  requestAnimationFrame(render);
};

const mouseEvent = (e) => {
  camera.value.position.x = -(e.offsetX - window.innerWidth / 2) / 10000;
  camera.value.position.y = -(e.offsetY - window.innerHeight / 2) / 4000;
  camera.value.lookAt(scene.value.position);

  //   鼠标在屏幕上的坐标
  let Sx = e.clientX;
  let Sy = e.clientY;

  // 检测鼠标是否放入 神之眼 ，如果放入就播放绿光动画

  //   将屏幕坐标转换为设备坐标 -1~1
  let x = (Sx / window.innerWidth) * 2 - 1;
  let y = -(Sy / window.innerHeight) * 2 + 1;

  // 标准坐标转化为三维坐标
  let standardVector = new THREE.Vector3(x, y, 0.5);
  let worldVector = standardVector.unproject(camera.value);

  //   射线投射方向 =worldVector 坐标 - 相机位置坐标
  let ray = worldVector.sub(camera.value.position).normalize();
  //   创建射线投射对象
  let raycaster = new THREE.Raycaster(toRaw(camera.value).position, ray);

  //   raycaster.setFromCamera(mouse, toRaw(camera.value));

  //   返回射线选中对象 若没选中长度为0
  let intersects = raycaster.intersectObjects([godEyeMesh]);
  if (intersects.length > 0) {
    if (!isAniPlay) {
      isAniPlay = true;
      animationAcition.paused = false;
      animationAcition.timeScale = 120;
      animationAcition.play();
      // 播放音效
      playEyeGodMusic();

      //   改变鼠标样式变成pointer
      document.body.style.cursor = 'pointer';
    }

    // console.error('检测到');
  } else {
    isAniPlay = false;

    animationAcition.paused = true;
    animationAcition.timeScale = -50;
    animationAcition.paused = false;
    document.body.style.cursor = 'default';

    // console.log('没检测到');
  }
};

document.body.addEventListener('mousemove', mouseEvent);

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
.music-button {
  position: absolute;
  top: 20px;
  left: 100px;
  cursor: pointer;
}
.music-button img {
  position: absolute;
  left: 0;
  right: 0;
  width: 30px;
  height: 30px;
}
</style>
