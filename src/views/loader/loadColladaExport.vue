<template>
  <div class="three-container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// 加载collada 加载文件
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import { ColladaExporter } from 'three/examples/jsm/exporters/ColladaExporter';

import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry';
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

let elf;
let effectController;
let teapot;
let teapotGeometry;
let lamberMaterial;
let phoneMaterial;
let material;
let light;
let flatMaterial;
let textureMaterial;

let wireMaterial;
let normalMaterial;
let reflectiveMaterial;

let link;
let colladaExporter;

let textureCube;

let specularColor = new THREE.Color();

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
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    20000
  );
  // 设置camera摆放的位置
  //   将camera放到z轴位置处于5的位置
  //   toRaw 将响应式对象改为普通对象，不用就报错，说Positon无法改变

  //   若不设置看不到z轴
  toRaw(camera.value).position.x = -150;

  toRaw(camera.value).position.y = 137.5;
  toRaw(camera.value).position.z = 325;

  //   camera.value.lookAt(0, 3, 0);
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

  //   初始化导出器
  link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link);
  colladaExporter = new ColladaExporter();
  //   exportCollada();

  //   初始化材料
  const materialColor = new THREE.Color().setHSL(1.0, 1.0, 1.0);
  phoneMaterial = new THREE.MeshPhongMaterial({
    color: materialColor,
    side: THREE.DoubleSide,
  });
  material = phoneMaterial;

  lamberMaterial = new THREE.MeshLambertMaterial({
    color: materialColor,
    side: THREE.DoubleSide,
  });

  flatMaterial = new THREE.MeshPhongMaterial({
    color: materialColor,
    specular: 0x000000,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  //   material = lamberMaterial;

  const loader = new THREE.TextureLoader();
  const textureMap = loader.load('./files/textures/uv/uv_grid_opengl.jpg');
  textureMap.wrapS = THREE.RepeatWrapping;
  textureMap.wrapT = THREE.RepeatWrapping;
  textureMap.anisotropy = 16;
  textureMap.encoding = THREE.sRGBEncoding;

  textureMaterial = new THREE.MeshPhongMaterial({
    color: materialColor,
    map: textureMap,
    side: THREE.DoubleSide,
  });

  wireMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
  });

  const diffuseMap = loader.load(
    './files/textures/floors/FloorsCheckerboard_S_Diffuse.jpg'
  );

  const normalMap = loader.load(
    './files/textures/floors/FloorsCheckerboard_S_Normal.jpg'
  );

  normalMaterial = new THREE.MeshPhongMaterial({
    color: materialColor,
    map: diffuseMap,
    normalMap: normalMap,
    side: THREE.DoubleSide,
  });

  const path = './files/textures/cube/pisa/';
  const urls = [
    path + 'px.png',
    path + 'nx.png',
    path + 'py.png',
    path + 'ny.png',
    path + 'pz.png',
    path + 'nz.png',
  ];
  textureCube = new THREE.CubeTextureLoader().load(urls);
  textureCube.encoding = THREE.sRGBEncoding;
  reflectiveMaterial = new THREE.MeshPhongMaterial({
    color: materialColor,
    envMap: textureCube,
    side: THREE.DoubleSide,
  });

  //   TeapotGeometry(size,segment,bottom,lid,body,filLid,blinn)
  teapotGeometry = new TeapotGeometry(100, 15, true, true, true, 1);
  teapot = new THREE.Mesh(teapotGeometry, material);
  scene.value.add(teapot);

  //   const loader = new ColladaLoader(new THREE.LoadingManager(() => {}));
  //   loader.load('./files/collada/elf/elf.dae', function (collada) {
  //     console.log(collada);
  //     elf = collada.scene;
  //     scene.value.add(elf);
  //   });
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
  ambientLight.value = new THREE.AmbientLight(0x333333);
  scene.value.add(ambientLight.value);

  light = new THREE.DirectionalLight(0xffffff, 1);
  //   dirLight.position.set(1, 1, 0).normalize();
  scene.value.add(light);
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
  cameraController.value = new OrbitControls(
    camera.value,
    renderer.value.domElement
  );

  //设置控制器变换的基础点
  cameraController.value.target.set(0, 3, 0);
};

//初始化图形参数控制器
const initGUI = () => {
  GUIController.value = new GUI('调试器');
  //将调试器 默认设置为关闭状态
  GUIController.value.close();

  console.log(colladaExporter);

  effectController = {
    hue: 0.121,
    saturation: 0.73,
    lightness: 0.66,

    metallic: true,
    vertexColor: true,

    // 光
    lhue: 0.04,
    lsaturation: 0.01,
    llightness: 1.0,

    // 光的位置
    lx: 0.32,
    ly: 0.39,
    lz: 0.7,

    //茶壶设置
    size: 100,
    segments: 15,
    lid: true,
    body: true,
    bottom: true,
    filLid: true,
    blinn: false,

    //材质
    material: 'phong',

    exportCollada: exportCollada,
  };

  const colorFolder = GUIController.value.addFolder('颜色');
  colorFolder
    .add(effectController, 'hue', 0.0, 1.0, 0.001)
    .name('hue')
    .onChange(() => {});

  colorFolder
    .add(effectController, 'saturation', 0.0, 1.0, 0.001)
    .name('saturation')
    .onChange();

  colorFolder
    .add(effectController, 'lightness', 0.0, 1.0, 0.001)
    .name('lightness')
    .onChange();

  colorFolder.add(effectController, 'metallic').name('metallic').onChange();

  colorFolder
    .add(effectController, 'vertexColor')
    .name('vertexColor')
    .onChange();

  // 光
  const lightFolder = GUIController.value.addFolder('光');

  lightFolder
    .add(effectController, 'lhue', 0.0, 1.0, 0.001)
    .name('lhue')
    .onChange();

  lightFolder
    .add(effectController, 'lsaturation', 0.0, 1.0, 0.001)
    .name('lsaturation')
    .onChange();

  lightFolder
    .add(effectController, 'llightness', 0.0, 1.0, 0.001)
    .name('llightness')
    .onChange();

  lightFolder.add(effectController, 'lx', 0.0, 1.0, 0.001).name('x').onChange();

  lightFolder.add(effectController, 'ly', 0.0, 1.0, 0.001).name('y').onChange();
  lightFolder.add(effectController, 'lz', 0.0, 1.0, 0.001).name('z').onChange();

  // 茶壶
  const teapotFolder = GUIController.value.addFolder('茶壶');
  teapotFolder
    .add(effectController, 'size', 20, 200, 10)
    .name('size')
    .onChange();

  teapotFolder
    .add(effectController, 'segments', 2, 50, 2)
    .name('segments')
    .onChange();

  teapotFolder.add(effectController, 'lid').name('display lid').onChange();

  teapotFolder.add(effectController, 'body').name('display body').onChange();
  teapotFolder
    .add(effectController, 'bottom')
    .name('display bottom')
    .onChange();

  teapotFolder
    .add(effectController, 'filLid')
    .name('display filLid')
    .onChange();

  teapotFolder.add(effectController, 'blinn').name('display blinn').onChange();

  const materialFolder = GUIController.value.addFolder('材质');
  materialFolder
    .add(effectController, 'material', [
      'phong',
      'lamber',
      'flat',
      'texture',
      'wire',
      'normal',
      'reflect',
    ])
    .name('material')
    .onChange();

  materialFolder.add(effectController, 'exportCollada');

  //   光源调试
  //创建对控制器调试的参数分组
  // const spotLightFolder = GUIController.value.addFolder('Spot Light');
  //分组中添加要调试的参数
  // spotLightFolder.addColor('要调试的东西','要调试物体中的参数','开始范围','结束范围');
  //再利用onChange方法，改变参数后 反馈回 对应的物体
  //value =改动后的值

  //   调试光的颜色
  // spotLightFolder.addColor(spotLight.value, 'color').onChange((value) => {
  //   //改变对应物体属性的值
  //   spotLight.value.color.set(value);
  // });
  //调试光源的角度
  // spotLightFolder.add('要调试的东西','要调试物体中的参数','开始范围','结束范围');

  //直接调用onChange 后直接render 也可以实现
  //   spotLightFolder.addColor(spotLight.value, 'color').onChange(render);
  //   spotLightFolder
  //     .add(spotLight.value, 'angle', 0, Math.PI / 2)
  //     .onChange(render);

  // spotLightFolder
  //   .add(spotLight.value, 'angle', 0, Math.PI / 2)
  //   .onChange((value) => {
  //     spotLight.value.angle = value;
  //     render();
  //     //更新光源 辅助的参数
  //     spotLightHelper.value.update();
  //   });
  //设置光源模糊度
  // spotLightFolder.add(spotLight.value, 'penumbra', 0, 1).onChange(render);

  //camera参数的调整
  // const cameraFolder = GUIController.value.addFolder('CameraFolder');
  //   调控camera的x位置
  // spotLightFolder.add('要调试的东西','要调试物体中的参数','开始范围','结束范围').step('拖动的精度');

  // cameraFolder
  //   .add(camera.value.position, 'x', -1000, 1000)
  //   .step(1)
  //   .onChange(render);
};

// 渲染
const render = () => {
  //   创建的cube进行旋转
  //   toRaw(cube.value).rotation.y = toRaw(cube.value).rotation.y + 0.01;

  if (light) {
    light.color.setHSL(
      effectController.lhue,
      effectController.lsaturation,
      effectController.llightness
    );

    light.position.set(
      effectController.lx,
      effectController.ly,
      effectController.lz
    );
  }

  if (effectController.material == 'phong') {
    teapot.material = phoneMaterial;

    //   设置模糊点大小
    teapot.material.specular.copy(specularColor);
  } else if (effectController.material == 'lambert') {
    teapot.material = lamberMaterial;

    //   设置模糊点大小
    teapot.material.specular.copy(specularColor);
  } else if (effectController.material == 'flat') {
    teapot.material = flatMaterial;
  } else if (effectController.material == 'texture') {
    teapot.material = textureMaterial;
  } else if (effectController.material == 'normal') {
    teapot.material = normalMaterial;
  } else if (effectController.material == 'wire') {
    teapot.material = wireMaterial;
  } else if (effectController.material == 'reflect') {
    teapot.material = reflectiveMaterial;
  }

  if (effectController.material == 'reflect') {
    scene.value.background = textureCube;
  } else {
    scene.value.background = new THREE.Color(0xaaaaaa);
  }

  if (effectController.metallic) {
    specularColor.copy(teapot.material.color);
  } else {
    specularColor.setHSL(1, 1, 1);
  }
  console.log(teapot.material);

  if (effectController.vertexColor) {
    teapot.geometry.computeBoundingBox();
    console.log(teapot.geometry);
    const minY = teapot.geometry.boundingBox.min.y;
    const maxY = teapot.geometry.boundingBox.max.y;
    const sizeY = maxY - minY;
    // const colors = [];
    const position = teapot.geometry.getAttribute('position');

    const color = new THREE.BufferAttribute(
      new Float32Array(position.count * 3),
      3
    );

    for (let i = 0; i < position.count; i++) {
      const y = position.getY(i);
      const r = (y - minY) / sizeY;
      const b = 1.0 - r;
      //   colors.push(r * 128, 110, b * 128);
      color.setXYZ(i, r * 128, 110, b * 128);
    }
    teapot.geometry.setAttribute('color', color);

    // teapot.geometry.setAttribute(
    //   'color',
    //   new THREE.Uint8BufferAttribute(colors, 3, true)
    // );
    teapot.material.vertexColor = true;
    teapot.material.needsUpdate = true;
  } else {
    // teapot.material.deleteAttribute('color');
    teapot.material.vertexColor = false;
    teapot.material.needsUpdate = true;
  }

  // 材料
  teapot.material.color.setHSL(
    effectController.hue,
    effectController.saturation,
    effectController.lightness
  );

  teapotGeometry = new TeapotGeometry(
    effectController.size,
    effectController.segments,
    effectController.bottom,
    effectController.lid,
    effectController.body,
    effectController.filLid,
    effectController.blinn
  );
  teapot.geometry = teapotGeometry;

  //   teapotGeometry = new TeapotGeometry(effectController.bottom);

  //   teapotGeometry.lid = effectController.lid;

  //requestAnimationFrame来自浏览器 就是一旦有空闲就会再次调用里面放的函数
  //   相当于无线循环render

  // 这段代码必须放到最下面
  // render(场景，相机)
  toRaw(renderer.value).render(toRaw(scene.value), toRaw(camera.value));

  requestAnimationFrame(render);
};

// 导出模型
const exportCollada = () => {
  // colladaExporter (物体,成功的回调)

  const result = colladaExporter.parse(teapot, undefined, {
    upAxis: 'Y_UP',
    unitName: 'millimeter',
    unitMeter: 0.001,
  });

  console.warn(result);
  let mediaType = 'Phone';
  if (effectController.material === 'wireframe') {
    mediaType = 'Constant';
  }
  if (effectController.material === 'lambert') {
    mediaType = 'Lambert';
  }
  saveString(
    result.data,
    'teapot_' + effectController.material + '_' + mediaType + '.dae'
  );
  result.textures.forEach((text) => {
    saveArrayBuffer(text.data, `${text.name}.${text.ext}`);
  });
};
const saveString = (text, filename) => {
  save(new Blob([text], {}), filename);
};
const saveArrayBuffer = (buffer, filename) => {
  save(new Blob([buffer], { type: 'application/octet-stream' }), filename);
};
const save = (blob, filename) => {
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
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
