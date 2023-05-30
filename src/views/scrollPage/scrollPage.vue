<template>
  <div class="page page0">
    <h1>Ray投射光线</h1>
    <h3>THREE.Raycaster实现3d交互效果</h3>
  </div>
  <div class="page page1">
    <h1>THREE.BufferGeometry！</h1>
    <h3>应用打造酷炫的三角形</h3>
  </div>
  <div class="page page2">
    <h1>活泼点光源</h1>
    <h3>点光源围绕照亮小球</h3>
  </div>
</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
//引入调试器
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import gsap from 'gsap';
// 性能监视器
import Stats from 'three/examples/jsm/libs/stats.module';

import { onMounted, reactive, ref, toRaw } from 'vue';

let cubeGroup = new THREE.Group();
let sjxGroup = new THREE.Group();
let sphereGroup = new THREE.Group();
let arrGroup = [cubeGroup, sjxGroup, sphereGroup];
let smallBall;
const redMaterial = new THREE.MeshBasicMaterial({
  color: '#ff0000',
});
let cubeArr = [];

// 创建投射光线对象
const raycaster = new THREE.Raycaster();

// 鼠标的位置对象
const mouse = new THREE.Vector2();
const clock = new THREE.Clock();

// 变量区
//白光
let dirLight;

//地板
let ground;
//环形结
let tourusKnot;

// 性能监视器
let stats;

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

  initAni();

  //   initCylinder();

  //初始化光线
  //   initAmbientLight();
  //初始化光线V2
  //   initLight();

  //初始化聚光灯
  //   initSpotLight();
  //初始化聚光灯辅助（可注释）
  //   initSpotLightHelper();

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
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    300
  );
  // 设置camera摆放的位置
  //   将camera放到z轴位置处于5的位置
  //   toRaw 将响应式对象改为普通对象，不用就报错，说Positon无法改变

  //   若不设置看不到z轴
  toRaw(camera.value).position.x = 0;

  toRaw(camera.value).position.y = 0;
  toRaw(camera.value).position.z = 18;

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

  const cubeGeometry = new THREE.BoxBufferGeometry(2, 2, 2);
  const material = new THREE.MeshBasicMaterial({
    wireframe: true,
  });

  // 1000立方体
  cubeGroup = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      for (let z = 0; z < 5; z++) {
        const cube1 = new THREE.Mesh(cubeGeometry, material);
        cube1.position.set(i * 2 - 4, j * 2 - 4, z * 2 - 4);
        cubeGroup.add(cube1);
        cubeArr.push(cube1);
      }
    }
  }

  scene.value.add(cubeGroup);

  // 创建三角形酷炫物体
  // 添加物体
  // 创建几何体
  sjxGroup = new THREE.Group();
  for (let i = 0; i < 50; i++) {
    // 每一个三角形，需要3个顶点，每个顶点需要3个值
    const geometry = new THREE.BufferGeometry();
    const positionArray = new Float32Array(9);
    for (let j = 0; j < 9; j++) {
      if (j % 3 == 1) {
        positionArray[j] = Math.random() * 10 - 5;
      } else {
        positionArray[j] = Math.random() * 10 - 5;
      }
    }
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positionArray, 3)
    );
    let color = new THREE.Color(Math.random(), Math.random(), Math.random());
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    // 根据几何体和材质创建物体
    let sjxMesh = new THREE.Mesh(geometry, material);
    //   console.log(mesh);
    sjxGroup.add(sjxMesh);
  }
  sjxGroup.position.set(0, -30, 0);
  scene.value.add(sjxGroup);

  // 弹跳小球
  sphereGroup = new THREE.Group();
  const sphereGeometry = new THREE.SphereBufferGeometry(1, 20, 20);
  const spherematerial = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
  });
  const sphere = new THREE.Mesh(sphereGeometry, spherematerial);
  // 投射阴影
  sphere.castShadow = true;

  sphereGroup.add(sphere);

  // // 创建平面
  const planeGeometry = new THREE.PlaneBufferGeometry(20, 20);
  const plane = new THREE.Mesh(planeGeometry, spherematerial);
  plane.position.set(0, -1, 0);
  plane.rotation.x = -Math.PI / 2;
  // 接收阴影
  plane.receiveShadow = true;
  sphereGroup.add(plane);

  // 灯光
  // 环境光
  const light = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
  sphereGroup.add(light);

  smallBall = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.1, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  smallBall.position.set(2, 2, 2);
  //直线光源
  const pointLight = new THREE.PointLight(0xff0000, 3);
  // pointLight.position.set(2, 2, 2);
  pointLight.castShadow = true;

  // 设置阴影贴图模糊度
  pointLight.shadow.radius = 20;
  // 设置阴影贴图的分辨率
  pointLight.shadow.mapSize.set(512, 512);

  // 设置透视相机的属性
  smallBall.add(pointLight);
  sphereGroup.add(smallBall);

  sphereGroup.position.set(0, -60, 0);
  scene.value.add(sphereGroup);
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
  renderer.value = new THREE.WebGLRenderer({ alpha: true });

  //开启渲染器中的阴影渲染
  renderer.value.shadowMap.enabled = true;
  renderer.value.physicallyCorrectLights = true;

  //设置像素比例，这样可以让他看起来更适合屏幕
  renderer.value.setPixelRatio(window.devicePixelRatio);

  // 设置渲染的大小
  renderer.value.setSize(window.innerWidth, window.innerHeight);

  renderer.value.outputEncoding = THREE.sRGBEncoding;

  //   将渲染好的数据，放到document里面
  // renderer.value.domElement=我们渲染出来的数据(是一个canvas)
  //   document.body.appendChild(renderer.value.domElement);
  //   let threeContainer = document.querySelector('.three-container');
  //   threeContainer.appendChild(renderer.value.domElement);

  document.body.appendChild(renderer.value.domElement);
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
const initAni = () => {
  gsap.to(cubeGroup.rotation, {
    x: '+=' + Math.PI * 2,
    y: '+=' + Math.PI * 2,
    duration: 10,
    ease: 'power2.inOut',
    repeat: -1,
  });
  gsap.to(sjxGroup.rotation, {
    x: '-=' + Math.PI * 2,
    z: '+=' + Math.PI * 2,
    duration: 12,
    ease: 'power2.inOut',
    repeat: -1,
  });
  gsap.to(smallBall.position, {
    x: -3,
    duration: 6,
    ease: 'power2.inOut',
    repeat: -1,
    yoyo: true,
  });
  gsap.to(smallBall.position, {
    y: 0,
    duration: 0.5,
    ease: 'power2.inOut',
    repeat: -1,
    yoyo: true,
  });
};

// 渲染
const render = () => {
  //   let time = clock.getElapsedTime();
  let deltaTime = clock.getDelta();

  //   cubeGroup.rotation.x = time * 0.5;
  //   cubeGroup.rotation.y = time * 0.5;

  //   sjxGroup.rotation.x = time * 0.4;
  //   sjxGroup.rotation.z = time * 0.3;

  //   smallBall.position.x = Math.sin(time) * 3;
  //   smallBall.position.z = Math.cos(time) * 3;
  //   smallBall.position.y = 2 + Math.sin(time * 10) / 2;
  //   sphereGroup.rotation.z = Math.sin(time) * 0.05;
  //   sphereGroup.rotation.x = Math.sin(time) * 0.05;

  //   根据当前滚动的scrolly，去设置相机移动的位置
  camera.value.position.y = -(window.scrollY / window.innerHeight) * 30;

  camera.value.position.x +=
    (mouse.x * 10 - camera.value.position.x) * deltaTime * 5;
  //   controls.update();

  //   创建的cube进行旋转
  //   toRaw(cube.value).rotation.y = toRaw(cube.value).rotation.y + 0.01;

  //requestAnimationFrame来自浏览器 就是一旦有空闲就会再次调用里面放的函数
  //   相当于无线循环render
  //   更新性能监视器
  stats.update();

  // 这段代码必须放到最下面
  // render(场景，相机)
  toRaw(renderer.value).render(toRaw(scene.value), toRaw(camera.value));

  requestAnimationFrame(render);
};

// 让渲染的页面随着窗体变化而变化;
window.addEventListener('resize', function () {
  camera.value.aspect = window.innerWidth / window.innerHeight;
  // 所以，执行camera.updateProjectionMatrix();的时候，threejs会重新计算相机对象的投影矩阵值。
  camera.value.updateProjectionMatrix();
  //调整页面的大小
  renderer.value.setSize(window.innerWidth, window.innerHeight);

  //   设置渲染器的像素比
  renderer.value.setPixelRatio(window.devicePixelRatio);
});

// 监听鼠标的位置
window.addEventListener('mousemove', (event) => {
  mouse.x = event.clientX / window.innerWidth - 0.5;
  mouse.y = event.clientY / window.innerHeight - 0.5;
});

// 监听鼠标的位置
window.addEventListener('click', (event) => {
  //   console.log(event);
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -((event.clientY / window.innerHeight) * 2 - 1);
  raycaster.setFromCamera(mouse, camera.value);
  let result = raycaster.intersectObjects(cubeArr);
  //   console.log(result);
  //   result[0].object.material = redMaterial;
  result.forEach((item) => {
    item.object.material = redMaterial;
  });
});

// 设置当前页
let currentPage = 0;
// 监听滚动事件
window.addEventListener('scroll', () => {
  //   console.log(window.scrollY);
  const newPage = Math.round(window.scrollY / window.innerHeight);
  if (newPage != currentPage) {
    currentPage = newPage;
    console.log('改变页面，当前是：' + currentPage);
    console.log(arrGroup[currentPage].rotation);
    gsap.to(arrGroup[currentPage].rotation, {
      z: '+=' + Math.PI * 2,
      x: '+=' + Math.PI * 2,
      duration: 2,
      onComplete: () => {
        console.log('旋转完成');
      },
    });

    // gsap.to(`.page${currentPage} h1`, {
    //   rotate: "+=360",
    //   duration: 1,
    // });
    gsap.fromTo(
      `.page${currentPage} h1`,
      { x: -300 },
      { x: 0, rotate: '+=360', duration: 1 }
    );
  }
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
body {
  background-color: rgb(36, 58, 66);
}
canvas {
  position: fixed;
  left: 0;
  top: 0;
}
.page {
  height: 100vh;
  display: flex;
  color: #fff;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
  position: relative;
  z-index: 10;
}
.page h1 {
  margin: 60px;
  font-size: 40px;
}

.page h3 {
  font-size: 30px;
}
::-webkit-scrollbar {
  display: none;
}
</style>
