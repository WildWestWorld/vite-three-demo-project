<template>
  <div class="three-container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
//引入调试器
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

// 性能监视器
import Stats from 'three/examples/jsm/libs/stats.module';

import { JKCanvasTextureEditor } from './createCanvas.js';

import { onMounted, reactive, ref, toRaw } from 'vue';
// 变量区
//白光
let dirLight;

//地板
let ground;
//环形结
let tourusKnot;
//   判断此次鼠标事件是否是变换事件
let transing = false;
let wall;

// 性能监视器
let stats;

let pointLight;

let cacheObject;
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
const poinitLightHelper = ref(null);

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
  initSpotLight();
  //初始化聚光灯辅助（可注释）
  initSpotLightHelper();

  //初始化阴影
  //   initShadow();

  //初始化参数调试器GUI
  //   initGUI();

  //   初始化性能监视器
  initStats();

  //初始化控制器
  initController();
};

const initStats = () => {
  stats = Stats();
  const statsDom = stats.domElement;
  console.log(statsDom);
  statsDom.style.position = 'fixed';
  statsDom.style.top = '0';
  statsDom.style.right = '5px';
  statsDom.style.left = 'unset';
  document.body.appendChild(statsDom);
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
  axisHelp.value = new THREE.AxesHelper(500);
  toRaw(axisHelp.value).raycast = () => {};

  const gridHelper = new THREE.GridHelper(500, 20);
  gridHelper.colorCenterLine = new THREE.Color(200, 200, 200);
  gridHelper.colorGrid = new THREE.Color(100, 100, 100);

  gridHelper.raycast = () => {};

  //   添加坐标轴
  //   需要特别说明的是横着的红色是x轴，竖着的是绿色的是y轴(!!!)，而朝向我们的是z轴
  scene.value.add(axisHelp.value);
  scene.value.add(gridHelper);
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
    1,
    1000
  );
  // 设置camera摆放的位置
  //   将camera放到z轴位置处于5的位置
  //   toRaw 将响应式对象改为普通对象，不用就报错，说Positon无法改变

  //   若不设置看不到z轴
  toRaw(camera.value).position.x = 200;

  toRaw(camera.value).position.y = 200;
  toRaw(camera.value).position.z = 200;
  toRaw(camera.value).up = new THREE.Vector3(0, 1, 0);

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

  let textureLoader = new THREE.TextureLoader();
  let frameColorTexture = textureLoader.load(
    './files/mtl/WoodFloor024_1K_Color.jpg'
  );
  let frameRoughnessTexture = textureLoader.load(
    './files/mtl/WoodFloor024_1K_Roughness.jpg'
  );
  let frameDisplaTexture = textureLoader.load(
    './files/mtl/WoodFloor024_1K_Displacement.jpg'
  );

  let frameMaterial = new THREE.MeshStandardMaterial({
    map: frameColorTexture,
    roughnessMap: frameRoughnessTexture,
    bumpMap: frameDisplaTexture,
  });

  const objLoader = new OBJLoader();
  const mtlLoader = new MTLLoader();
  mtlLoader.loadAsync('./files/mtl/frame.mtl').then((mtl) => {
    console.error(mtl);
    objLoader
      //   .setMaterials(mtl)
      .loadAsync('./files/obj/frame.obj')
      .then((obj) => {
        obj.position.y = 120;
        obj.position.z = -70;

        const frameMesh = obj.children[0];
        frameMesh.material.dispose();
        frameMesh.material = frameMaterial;

        console.log(obj);

        obj.rotation.y = (Math.PI / 180) * -90;
        obj.scale.set(2, 2, 2);
        scene.value.add(obj);
      });
  });

  const stage = new THREE.Mesh(
    new THREE.BoxBufferGeometry(200, 10, 200),
    new THREE.MeshStandardMaterial({
      //   color: new THREE.Color(0, 75, 75),
      color: 'rgb(0, 75, 75)',
      roughness: 0,
    })
  );

  stage.receiveShadow = true;
  stage.castShadow = true;

  stage.position.y = -5;

  //   stage.addEventListener('mouseenter', () => {
  //     console.log('wall mouseenter');
  //     stage.material.color = new THREE.Color('red');
  //   });

  //   stage.addEventListener('mouseleave', () => {
  //     console.log('wall mouseleave');
  //     stage.material.color = new THREE.Color('rgb(0,75,75)');
  //   });

  scene.value.add(stage);

  let planeTexture = textureLoader.load('./files/img/1.jpg');
  let boxMaterial = new THREE.MeshStandardMaterial({
    color: 'white',
    side: THREE.DoubleSide,
    map: planeTexture,
  });
  let boxGeometry = new THREE.BufferGeometry();
  const size = 10;

  const uv = new Float32Array([
    0, 0, 1, 0, 1, 1, 0, 1,

    0, 0, 1, 0, 1, 1, 0, 1,
  ]);

  //   每三个元素绘制一个点
  //每三个点绘制一个三角形
  const points = new Float32Array([
    -size,
    size,
    size,

    size,
    size,
    size,

    size,
    size,
    -size,

    -size,
    size,
    -size,

    -size,
    -size,
    size,

    size,
    -size,
    size,

    size,
    -size,
    -size,

    -size,
    -size,
    -size,

    -size,
    size,
    size,

    size,
    size,
    -size,

    -size,
    -size,
    -size,

    -size,
    -size,
    size,

    -size,
    size,
    -size,

    size,
    size,
    -size,

    -size,
    -size,
    -size,

    size,
    -size,
    -size,
  ]);

  //  index  里面的值代表的是points 对应的点的索引 (point 每三个元素代表一个点)
  //每三个点代表一个三角形
  const index = [
    0, 1, 2, 2, 3, 0,

    4, 5, 6, 6, 7, 4,

    8, 9, 10, 10, 11, 8,

    12, 14, 13, 14, 12, 15,

    16, 18, 17, 18, 16, 19,

    20, 21, 22, 22, 23, 20,
  ];

  const normals = new Float32Array([
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,

    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,

    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
  ]);

  boxGeometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
  boxGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

  boxGeometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));

  boxGeometry.setIndex(index);
  const box = new THREE.Mesh(boxGeometry, boxMaterial);

  //   new THREE.MeshStandardMaterial({
  //     color: (new THREE.Color().setColorName = 'white'),
  //     metalness: 1,
  //     roughness: 0.3,
  //   });

  const boxNormalHelper = new VertexNormalsHelper(
    box,
    10,
    new THREE.Color('color').getHex
  );
  //   scene.value.add(boxNormalHelper);

  box.castShadow = true;
  box.receiveShadow = true;

  box.position.y = 10;
  //   box.rotation.x = (Math.PI / 180) * 90;

  //   box.position.x = 10;
  //   scene.value.add(box);

  // 相框
  const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(192, 108),
    new THREE.MeshStandardMaterial({ map: planeTexture })
  );

  plane.position.y = 120;
  plane.position.z = -70;

  plane.scale.set(0.3, 0.3, 0.3);
  scene.value.add(plane);

  // 墙面
  wall = new THREE.Mesh(
    new THREE.BoxBufferGeometry(600, 200, 10),
    new THREE.MeshStandardMaterial({ color: 'white' })
  );

  wall.position.y = 100;
  wall.position.z = -80;

  //   重要 不写,光源辅助 还是之前的显示
  wall.updateMatrix();
  wall.updateMatrixWorld();

  //   wall.addEventListener('mouseenter', () => {
  //     console.log('wall mouseenter');
  //     wall.material.color = new THREE.Color('red');
  //   });

  //   wall.addEventListener('mouseleave', () => {
  //     console.log('wall mouseleave');
  //     wall.material.color = new THREE.Color('white');
  //   });

  scene.value.add(wall);
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
  spotLight.value = new THREE.SpotLight(
    0xffffff,
    1,
    500,
    (Math.PI / 180) * 30,
    0,
    0
  );
  spotLight.value.position.set(0, 100, 400);
  //调整聚光灯 的角度，会出现明暗变化
  //   spotLight.value.angle = Math.PI / 4;
  //penumbra属性表示照射面光影衰减百分比，取值在0和1之间， 默认值为 0.0
  //   spotLight.value.penumbra = 0.2;

  spotLight.value.target = wall;

  //开启灯光的阴影
  spotLight.value.castShadow = true;
  //   setTimeout(() => {
  //     spotLightHelper.value.update();
  //   }, 2000);

  scene.value.add(spotLight.value);
};
//初始化聚光灯调试器
const initSpotLightHelper = () => {
  //聚光灯的辅助器
  //THREE.SpotLightHelper(聚光灯的参数)
  spotLightHelper.value = new THREE.SpotLightHelper(spotLight.value);
  //   xxx.raycast = () => {} 不在接收射线探照
  spotLightHelper.value.raycast = () => {};
  spotLightHelper.value.children.forEach((object) => {
    object.raycast = () => {};
  });
  //场景中放入聚光灯辅助器
  scene.value.add(spotLightHelper.value);

  //   poinitLightHelper.value = new THREE.PointLightHelper(
  //     pointLight,
  //     pointLight.distance,
  //     pointLight.color
  //   );
  //   //场景中放入聚光灯辅助器
  //   scene.value.add(poinitLightHelper.value);
};

//初始化光线
const initAmbientLight = () => {
  //THREE.AmbientLight(光线的颜色,0.2)
  ambientLight.value = new THREE.AmbientLight(0xffffff, 0.2);
  scene.value.add(ambientLight.value);
};
const initLight = () => {
  //添加环境光
  ambientLight.value = new THREE.AmbientLight('rgb(255, 255, 255)', 0.3);
  scene.value.add(ambientLight.value);

  //   const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  //   dirLight.position.set(10, 10, 5);
  //   scene.value.add(dirLight);

  pointLight = new THREE.PointLight('rgb(255, 0, 0)', 0.7, 50, 0.1);
  //   pointLight.position.set(100, 100, 100);

  pointLight.position.set(20, 20, 20);

  //   scene.value.add(pointLight);
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
  //抗锯齿 antialias: true 设置了图形更平滑
  renderer.value = new THREE.WebGLRenderer({ antialias: true });

  //开启渲染器中的阴影渲染
  renderer.value.shadowMap.enabled = true;

  //设置像素比例，这样可以让他看起来更适合屏幕
  renderer.value.setPixelRatio(window.devicePixelRatio);

  // 设置渲染的大小
  renderer.value.setSize(window.innerWidth, window.innerHeight);

  //   renderer.value.setClearColor('rgb(255,255,255)');
  //   renderer.value.clearColor();

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

  //   改变 cameraController的鼠标动作
  //DOLLY放大缩小
  //PAN平面移动
  //ROTATE旋转
  cameraController.value.mouseButtons = {
    LEFT: null,
    RIGHT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
  };

  //设置控制器变换的基础点
  cameraController.value.target.set(0, 1, 0);

  //   初始化射线
  const raycaster = new THREE.Raycaster();

  const transformControls = new TransformControls(
    camera.value,
    renderer.value.domElement
  );

  const target = new THREE.Object3D();
  transformControls.attach(target);
  scene.value.add(transformControls);
  scene.value.add(target);

  transformControls.addEventListener('mousedown', (event) => {
    console.log('mousedown');
    transing = true;
  });

  document.addEventListener('keyup', (event) => {
    if (event.key === 'e') {
      transformControls.mode = 'scale';
      return false;
    }
    if (event.key === 'r') {
      transformControls.mode = 'rotate';
      return false;
    }
    if (event.key === 't') {
      transformControls.mode = 'translate';
      return false;
    }
  });

  let x = 0;
  let y = 0;
  const mouse = new THREE.Vector2();

  renderer.value.domElement.addEventListener('mousedown', (event) => {
    // // 选取物体
    raycaster.setFromCamera(mouse, camera.value);
    // scene.value.remove(transformControls);

    const intersection = raycaster.intersectObjects(
      scene.value.children,
      false
    );

    if (intersection.length) {
      const object = intersection[0].object;
      //   scene.value.add(transformControls);

      //   transformControls.attach(object);
      object.dispatchEvent({ type: 'mousedown' });
    }
  });

  renderer.value.domElement.addEventListener('mousemove', (event) => {
    x = event.offsetX;
    y = event.offsetY;

    const width = renderer.value.domElement.offsetWidth;
    const height = renderer.value.domElement.offsetHeight;

    mouse.x = (x / width) * 2 - 1;
    mouse.y = (-y * 2) / height + 1;

    // 选取物体
    raycaster.setFromCamera(mouse, camera.value);
    // scene.value.remove(transformControls);

    const intersection = raycaster.intersectObjects(scene.value.children);
    // scene.value.add(transformControls);

    if (intersection.length) {
      const object = intersection[0].object;

      if (object !== cacheObject) {
        if (cacheObject) {
          cacheObject.dispatchEvent({ type: 'mouseleave' });
          cacheObject.material.color.multiplyScalar(0.5);
        }

        object.dispatchEvent({ type: 'mouseenter' });
        object.addEventListener('mouseenter', (event) => {
          console.log('mouseenter');
        });
      } else {
        if (object == cacheObject) {
          object.dispatchEvent({ type: 'mousemove' });
          object.addEventListener('mousemove', (event) => {
            console.log('mouseenter');
          });
        }
        if (object.material) {
          object.material.color.multiplyScalar(2);
          cacheObject = object;
        }
      }

      //   if (object.material) {
      //     object.material.color.multiplyScalar(2);
      //     cacheObject = object;
      //   } else {
      //     if (cacheObject) {
      //       cacheObject.material.color.multiplyScalar(0.5);
      //     }
      //     cacheObject = null;
      //   }

      //   transformControls.attach(object);
    } else {
      if (cacheObject) {
        cacheObject.dispatchEvent({ type: 'mouseleave' });
        cacheObject.material.color.multiplyScalar(0.5);
      }
      cacheObject = null;
    }
  });

  renderer.value.domElement.addEventListener('mouseup', (event) => {
    // // 选取物体
    raycaster.setFromCamera(mouse, camera.value);
    // scene.value.remove(transformControls);

    const intersection = raycaster.intersectObjects(
      scene.value.children,
      false
    );

    if (intersection.length) {
      const object = intersection[0].object;
      //   scene.value.add(transformControls);

      //   transformControls.attach(object);
      object.dispatchEvent({ type: 'mouseup' });
    }
  });

  renderer.value.domElement.addEventListener('click', (event) => {
    console.log('click');
    if (transing) {
      transing = false;
      return false;
    }

    // // 选取物体
    raycaster.setFromCamera(mouse, camera.value);
    // scene.value.remove(transformControls);

    const intersection = raycaster.intersectObjects(
      scene.value.children,
      false
    );

    if (intersection.length) {
      const object = intersection[0].object;
      //   scene.value.add(transformControls);

      //   transformControls.attach(object);
      object.dispatchEvent({ type: 'click' });
    }
  });
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
  //   toRaw(cube.value).position.x = toRaw(cube.value).position.x - 0.01;
  //   toRaw(camera.value).position.x = toRaw(camera.value).position.x - 0.01;
  //requestAnimationFrame来自浏览器 就是一旦有空闲就会再次调用里面放的函数
  //   相当于无线循环render
  //   更新性能监视器
  stats.update();

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

<style scoped></style>
