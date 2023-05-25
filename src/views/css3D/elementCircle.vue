<template>
  <!-- <div id="info">
    <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a>
    css3d - periodic table.
  </div> -->
  <!-- <div id="container"></div> -->
  <div class="three-container"></div>

  <div id="menu">
    <button id="table">TABLE</button>
    <button id="sphere">SPHERE</button>
    <button id="helix">HELIX</button>
    <button id="grid">GRID</button>
  </div>
</template>

<script setup>
import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';

import {
  CSS3DRenderer,
  CSS3DObject,
  CSS3DSprite,
} from 'three/examples/jsm/renderers/CSS3DRenderer';

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

// 元素表
const table = [
  'H',
  'Hydrogen',
  '1.00794',
  1,
  1,
  'He',
  'Helium',
  '4.002602',
  18,
  1,
  'Li',
  'Lithium',
  '6.941',
  1,
  2,
  'Be',
  'Beryllium',
  '9.012182',
  2,
  2,
  'B',
  'Boron',
  '10.811',
  13,
  2,
  'C',
  'Carbon',
  '12.0107',
  14,
  2,
  'N',
  'Nitrogen',
  '14.0067',
  15,
  2,
  'O',
  'Oxygen',
  '15.9994',
  16,
  2,
  'F',
  'Fluorine',
  '18.9984032',
  17,
  2,
  'Ne',
  'Neon',
  '20.1797',
  18,
  2,
  'Na',
  'Sodium',
  '22.98976...',
  1,
  3,
  'Mg',
  'Magnesium',
  '24.305',
  2,
  3,
  'Al',
  'Aluminium',
  '26.9815386',
  13,
  3,
  'Si',
  'Silicon',
  '28.0855',
  14,
  3,
  'P',
  'Phosphorus',
  '30.973762',
  15,
  3,
  'S',
  'Sulfur',
  '32.065',
  16,
  3,
  'Cl',
  'Chlorine',
  '35.453',
  17,
  3,
  'Ar',
  'Argon',
  '39.948',
  18,
  3,
  'K',
  'Potassium',
  '39.948',
  1,
  4,
  'Ca',
  'Calcium',
  '40.078',
  2,
  4,
  'Sc',
  'Scandium',
  '44.955912',
  3,
  4,
  'Ti',
  'Titanium',
  '47.867',
  4,
  4,
  'V',
  'Vanadium',
  '50.9415',
  5,
  4,
  'Cr',
  'Chromium',
  '51.9961',
  6,
  4,
  'Mn',
  'Manganese',
  '54.938045',
  7,
  4,
  'Fe',
  'Iron',
  '55.845',
  8,
  4,
  'Co',
  'Cobalt',
  '58.933195',
  9,
  4,
  'Ni',
  'Nickel',
  '58.6934',
  10,
  4,
  'Cu',
  'Copper',
  '63.546',
  11,
  4,
  'Zn',
  'Zinc',
  '65.38',
  12,
  4,
  'Ga',
  'Gallium',
  '69.723',
  13,
  4,
  'Ge',
  'Germanium',
  '72.63',
  14,
  4,
  'As',
  'Arsenic',
  '74.9216',
  15,
  4,
  'Se',
  'Selenium',
  '78.96',
  16,
  4,
  'Br',
  'Bromine',
  '79.904',
  17,
  4,
  'Kr',
  'Krypton',
  '83.798',
  18,
  4,
  'Rb',
  'Rubidium',
  '85.4678',
  1,
  5,
  'Sr',
  'Strontium',
  '87.62',
  2,
  5,
  'Y',
  'Yttrium',
  '88.90585',
  3,
  5,
  'Zr',
  'Zirconium',
  '91.224',
  4,
  5,
  'Nb',
  'Niobium',
  '92.90628',
  5,
  5,
  'Mo',
  'Molybdenum',
  '95.96',
  6,
  5,
  'Tc',
  'Technetium',
  '(98)',
  7,
  5,
  'Ru',
  'Ruthenium',
  '101.07',
  8,
  5,
  'Rh',
  'Rhodium',
  '102.9055',
  9,
  5,
  'Pd',
  'Palladium',
  '106.42',
  10,
  5,
  'Ag',
  'Silver',
  '107.8682',
  11,
  5,
  'Cd',
  'Cadmium',
  '112.411',
  12,
  5,
  'In',
  'Indium',
  '114.818',
  13,
  5,
  'Sn',
  'Tin',
  '118.71',
  14,
  5,
  'Sb',
  'Antimony',
  '121.76',
  15,
  5,
  'Te',
  'Tellurium',
  '127.6',
  16,
  5,
  'I',
  'Iodine',
  '126.90447',
  17,
  5,
  'Xe',
  'Xenon',
  '131.293',
  18,
  5,
  'Cs',
  'Caesium',
  '132.9054',
  1,
  6,
  'Ba',
  'Barium',
  '132.9054',
  2,
  6,
  'La',
  'Lanthanum',
  '138.90547',
  4,
  9,
  'Ce',
  'Cerium',
  '140.116',
  5,
  9,
  'Pr',
  'Praseodymium',
  '140.90765',
  6,
  9,
  'Nd',
  'Neodymium',
  '144.242',
  7,
  9,
  'Pm',
  'Promethium',
  '(145)',
  8,
  9,
  'Sm',
  'Samarium',
  '150.36',
  9,
  9,
  'Eu',
  'Europium',
  '151.964',
  10,
  9,
  'Gd',
  'Gadolinium',
  '157.25',
  11,
  9,
  'Tb',
  'Terbium',
  '158.92535',
  12,
  9,
  'Dy',
  'Dysprosium',
  '162.5',
  13,
  9,
  'Ho',
  'Holmium',
  '164.93032',
  14,
  9,
  'Er',
  'Erbium',
  '167.259',
  15,
  9,
  'Tm',
  'Thulium',
  '168.93421',
  16,
  9,
  'Yb',
  'Ytterbium',
  '173.054',
  17,
  9,
  'Lu',
  'Lutetium',
  '174.9668',
  18,
  9,
  'Hf',
  'Hafnium',
  '178.49',
  4,
  6,
  'Ta',
  'Tantalum',
  '180.94788',
  5,
  6,
  'W',
  'Tungsten',
  '183.84',
  6,
  6,
  'Re',
  'Rhenium',
  '186.207',
  7,
  6,
  'Os',
  'Osmium',
  '190.23',
  8,
  6,
  'Ir',
  'Iridium',
  '192.217',
  9,
  6,
  'Pt',
  'Platinum',
  '195.084',
  10,
  6,
  'Au',
  'Gold',
  '196.966569',
  11,
  6,
  'Hg',
  'Mercury',
  '200.59',
  12,
  6,
  'Tl',
  'Thallium',
  '204.3833',
  13,
  6,
  'Pb',
  'Lead',
  '207.2',
  14,
  6,
  'Bi',
  'Bismuth',
  '208.9804',
  15,
  6,
  'Po',
  'Polonium',
  '(209)',
  16,
  6,
  'At',
  'Astatine',
  '(210)',
  17,
  6,
  'Rn',
  'Radon',
  '(222)',
  18,
  6,
  'Fr',
  'Francium',
  '(223)',
  1,
  7,
  'Ra',
  'Radium',
  '(226)',
  2,
  7,
  'Ac',
  'Actinium',
  '(227)',
  4,
  10,
  'Th',
  'Thorium',
  '232.03806',
  5,
  10,
  'Pa',
  'Protactinium',
  '231.0588',
  6,
  10,
  'U',
  'Uranium',
  '238.02891',
  7,
  10,
  'Np',
  'Neptunium',
  '(237)',
  8,
  10,
  'Pu',
  'Plutonium',
  '(244)',
  9,
  10,
  'Am',
  'Americium',
  '(243)',
  10,
  10,
  'Cm',
  'Curium',
  '(247)',
  11,
  10,
  'Bk',
  'Berkelium',
  '(247)',
  12,
  10,
  'Cf',
  'Californium',
  '(251)',
  13,
  10,
  'Es',
  'Einstenium',
  '(252)',
  14,
  10,
  'Fm',
  'Fermium',
  '(257)',
  15,
  10,
  'Md',
  'Mendelevium',
  '(258)',
  16,
  10,
  'No',
  'Nobelium',
  '(259)',
  17,
  10,
  'Lr',
  'Lawrencium',
  '(262)',
  18,
  10,
  'Rf',
  'Rutherfordium',
  '(267)',
  4,
  7,
  'Db',
  'Dubnium',
  '(268)',
  5,
  7,
  'Sg',
  'Seaborgium',
  '(271)',
  6,
  7,
  'Bh',
  'Bohrium',
  '(272)',
  7,
  7,
  'Hs',
  'Hassium',
  '(270)',
  8,
  7,
  'Mt',
  'Meitnerium',
  '(276)',
  9,
  7,
  'Ds',
  'Darmstadium',
  '(281)',
  10,
  7,
  'Rg',
  'Roentgenium',
  '(280)',
  11,
  7,
  'Cn',
  'Copernicium',
  '(285)',
  12,
  7,
  'Nh',
  'Nihonium',
  '(286)',
  13,
  7,
  'Fl',
  'Flerovium',
  '(289)',
  14,
  7,
  'Mc',
  'Moscovium',
  '(290)',
  15,
  7,
  'Lv',
  'Livermorium',
  '(293)',
  16,
  7,
  'Ts',
  'Tennessine',
  '(294)',
  17,
  7,
  'Og',
  'Oganesson',
  '(294)',
  18,
  7,
];

const objects = [];
const targets = { table: [], sphere: [], helix: [], grid: [] };

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
    40,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  // 设置camera摆放的位置
  //   将camera放到z轴位置处于5的位置
  //   toRaw 将响应式对象改为普通对象，不用就报错，说Positon无法改变

  //   若不设置看不到z轴
  //   toRaw(camera.value).position.x = 10;

  //   toRaw(camera.value).position.y = 30;
  toRaw(camera.value).position.z = 3000;

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

  for (let i = 0; i < table.length; i += 5) {
    const element = document.createElement('div');
    element.className = 'element';
    element.style.backgroundColor =
      'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')';

    const number = document.createElement('div');
    number.className = 'number';
    number.textContent = i / 5 + 1;

    element.appendChild(number);

    const symbol = document.createElement('div');
    symbol.className = 'symbol';
    symbol.textContent = table[i];
    element.appendChild(symbol);

    const details = document.createElement('div');
    details.className = 'details';
    details.innerHTML = table[i + 1] + '<br>' + table[i + 2];
    // details.textContent = table[i];
    element.appendChild(details);

    const objectCSS = new CSS3DObject(element);
    objectCSS.position.set(
      (Math.random() - 0.5) * 4000,
      (Math.random() - 0.5) * 4000,
      (Math.random() - 0.5) * 4000
    );

    scene.value.add(objectCSS);
    objects.push(objectCSS);
    const object = new THREE.Object3D();
    object.position.x = table[i + 3] * 140 - 1330;
    object.position.y = -table[i + 4] * 180 + 990;

    targets.table.push(object);
  }

  // sphere
  const vector = new THREE.Vector3();

  for (let i = 0; i < objects.length; i++) {
    const phi = Math.acos(-1 + (2 * i) / objects.length);
    const theta = Math.sqrt(objects.length * Math.PI) * phi;
    const object = new THREE.Object3D();
    object.position.setFromSphericalCoords(800, phi, theta);
    vector.copy(object.position).multiplyScalar(2);
    object.lookAt(vector);
    targets.sphere.push(object);
  }

  //grid
  for (let i = 0; i < objects.length; i++) {
    const object = new THREE.Object3D();

    object.position.x = (i % 5) * 400 - 800;
    object.position.y = -(Math.floor(i / 5) % 5) * 400 + 800;
    object.position.z = Math.floor(i / 25) * 1000 - 2000;

    targets.grid.push(object);
  }

  //helix
  for (let i = 0; i < objects.length; i++) {
    const theta = i * 0.175 + Math.PI;
    const y = -(i * 8) + 450;
    const object = new THREE.Object3D();

    object.position.setFromCylindricalCoords(900, theta, y);
    vector.x = object.position.x * 2;
    vector.y = object.position.y;
    vector.z = object.position.z * 2;

    object.lookAt(vector);

    targets.helix.push(object);
  }

  const buttonTable = document.getElementById('table');
  buttonTable.addEventListener('click', () => {
    transform(targets.table, 2000);
  });

  const sphereTable = document.getElementById('sphere');
  sphereTable.addEventListener('click', () => {
    transform(targets.sphere, 2000);
  });
  const helixTable = document.getElementById('helix');
  helixTable.addEventListener('click', () => {
    transform(targets.helix, 2000);
  });
  const gridTable = document.getElementById('grid');
  gridTable.addEventListener('click', () => {
    transform(targets.grid, 2000);
  });
};

const transform = (targetData, duration) => {
  TWEEN.removeAll();

  for (let i = 0; i < objects.length; i++) {
    const object = objects[i];
    const target = targetData[i];
    new TWEEN.Tween(object.position)
      .to(
        {
          x: target.position.x,
          y: target.position.y,
          z: target.position.z,
        },
        Math.random() * duration + duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();

    new TWEEN.Tween(object.rotation)
      .to(
        {
          x: target.rotation.x,
          y: target.rotation.y,
          z: target.rotation.z,
        },
        Math.random() * duration + duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();
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
  renderer.value = new CSS3DRenderer();

  //开启渲染器中的阴影渲染
  //   renderer.value.shadowMap.enabled = true;

  //设置像素比例，这样可以让他看起来更适合屏幕
  //   renderer.value.setPixelRatio(window.devicePixelRatio);

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
  cameraController.value = new TrackballControls(
    camera.value,
    renderer.value.domElement
  );

  cameraController.value.minDistance = 500;
  cameraController.value.maxDistance = 6000;

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

  cameraController.value.update();
  TWEEN.update();
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

<!-- 这里不能加scope -->
<style>
/*  */
body {
  margin: 0;
  background-color: #000;
  color: #fff;
  font-family: Monospace;
  font-size: 13px;
  line-height: 24px;
  overscroll-behavior: none;
}

a {
  color: #ff0;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button {
  cursor: pointer;
  text-transform: uppercase;
}

#info {
  position: absolute;
  top: 0px;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  text-align: center;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none;
  z-index: 1; /* TODO Solve this in HTML */
}

a,
button,
input,
select {
  pointer-events: auto;
}

.lil-gui {
  z-index: 2 !important; /* TODO Solve this in HTML */
}

@media all and (max-width: 640px) {
  .lil-gui.root {
    right: auto;
    top: auto;
    max-height: 50%;
    max-width: 80%;
    bottom: 0;
    left: 0;
  }
}

#overlay {
  position: absolute;
  font-size: 16px;
  z-index: 2;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.7);
}

#overlay button {
  background: transparent;
  border: 0;
  border: 1px solid rgb(255, 255, 255);
  border-radius: 4px;
  color: #ffffff;
  padding: 12px 18px;
  text-transform: uppercase;
  cursor: pointer;
}

#notSupported {
  width: 50%;
  margin: auto;
  background-color: #f00;
  margin-top: 20px;
  padding: 10px;
}

/*  */
a {
  color: #8ff;
}

#menu {
  position: absolute;
  bottom: 20px;
  width: 100%;
  text-align: center;
}

.element {
  width: 120px;
  height: 160px;
  box-shadow: 0px 0px 12px rgba(0, 255, 255, 0.5);
  border: 1px solid rgba(127, 255, 255, 0.25);
  font-family: Helvetica, sans-serif;
  text-align: center;
  line-height: normal;
  cursor: default;
}

.element:hover {
  box-shadow: 0px 0px 12px rgba(0, 255, 255, 0.75);
  border: 1px solid rgba(127, 255, 255, 0.75);
}

.element .number {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 12px;
  color: rgba(127, 255, 255, 0.75);
}

.element .symbol {
  position: absolute;
  top: 40px;
  left: 0px;
  right: 0px;
  font-size: 60px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.75);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.95);
}

.element .details {
  position: absolute;
  bottom: 15px;
  left: 0px;
  right: 0px;
  font-size: 12px;
  color: rgba(127, 255, 255, 0.75);
}

button {
  color: rgba(127, 255, 255, 0.75);
  background: transparent;
  outline: 1px solid rgba(127, 255, 255, 0.75);
  border: 0px;
  padding: 5px 10px;
  cursor: pointer;
}

button:hover {
  background-color: rgba(0, 255, 255, 0.5);
}

button:active {
  color: #000000;
  background-color: rgba(0, 255, 255, 0.75);
}
</style>
