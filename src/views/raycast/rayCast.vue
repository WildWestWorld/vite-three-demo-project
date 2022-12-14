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
let white = new THREE.Color('white');
let color = new THREE.Color();
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

//射线
//初始化射线
const rayCaster = new THREE.Raycaster();
//初始化鼠标
//设置mouse的初值，避免让他使用0,0的默认值，让一些小球直接就变色了
//只要设置成画面以外的值就行了 例如 1,1 也就是最右下角
const mouse = new THREE.Vector2(1, 1);

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

  //初始化几何体
  initCube();

  initCylinder();

  //初始化光线
  initAmbientLight();

  //初始化聚光灯
  initSpotLight();
  //初始化聚光灯辅助（可注释）
  //   initSpotLightHelper();

  //初始化射线
  //   initRayCaster();

  //初始化阴影
  initShadow();

  //初始化渲染器
  initRender();

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
  toRaw(camera.value).position.x = -50;

  toRaw(camera.value).position.y = 120;
  toRaw(camera.value).position.z = 200;

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
  //   let geometry = new THREE.PlaneGeometry(80, 80);

  //创建正二十面体

  //   IcosahedronBufferGeometry(半径,大于0时会变成球，默认为0，越大球越圆)
  // radius — 二十面体的半径，默认为1。
  // detail — 默认值为0。将这个值设为一个大于0的数将会为它增加一些顶点，使其不再是一个二十面体。当这个值大于1的时候，实际上它将变成一个球体

  let geometry = new THREE.IcosahedronBufferGeometry(0.5, 3);

  //   几何体的材质
  let meterial = new THREE.MeshPhongMaterial({ color: 'white' });

  //  正式创建几何体,Mesh(几何体，材质)
  //   cube.value = new THREE.Mesh(geometry, meterial);

  // 单面小球的数量
  let amount = 10;
  //开三次方，意味着三个维度
  let count = Math.pow(amount, 3);
  //THREE.IntancedMesh(几何体，材质，产生几何体的数量)  创建一堆的几何体
  cube.value = new THREE.InstancedMesh(geometry, meterial, count);

  let index = 0;
  //偏移的常量
  const offset = (amount - 1) / 2; //(amount -1)/2 = (10-1)/2 =4.5
  //转换矩阵
  const matrix = new THREE.Matrix4();

  //若是要对每一个小球进行设置，则需要用for循环
  //   因为是三个面 所以要循环3次
  for (let i = 0; i < amount; i++) {
    for (let j = 0; j < amount; j++) {
      for (let k = 0; k < amount; k++) {
        //设置转换矩阵的位置
        //这里需要特别说明下 这里是设置每个小球的位置， 取值范围就是(4.5,-4.5(4.5-9))
        // 为什么是9，因为 i是小于amount(10) 的
        //设置好matix 然后再赋值给小球
        matrix.setPosition(offset - i, offset - j, offset - k);
        cube.value.setMatrixAt(index, matrix);
        //再给每个小球设置color
        //因为我们需要Hover时 改变小球颜色，所以我们的颜色要单独抽离出来
        //使用Random的方法产生随机颜色

        // cube.value.setColorAt(
        //   index,
        //   new THREE.Color().setHex(Math.random() * 0xfffffff)
        // );

        //白色
        cube.value.setColorAt(index, white);

        index = index + 1;
      }
    }
  }

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

//初始化阴影
const initShadow = () => {
  //开启圆柱体的阴影
  cylinder.value.castShadow = true;
  //开启平面的 接收阴影
  cube.value.receiveShadow = true;
  //开启灯光的阴影
  spotLight.value.castShadow = true;
};

// //初始化 射线
// const initRayCaster = () => {
//   //射线投影
//   rayCaster.value = new THREE.Raycaster();
// };

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
  // render(场景，相机)
  toRaw(renderer.value).render(toRaw(scene.value), toRaw(camera.value));
  //   创建的cube进行旋转
  //   toRaw(cube.value).rotation.y = toRaw(cube.value).rotation.y + 0.01;

  //requestAnimationFrame来自浏览器 就是一旦有空闲就会再次调用里面放的函数
  //   相当于无线循环render

  //射线
  rayCaster.setFromCamera(mouse, toRaw(camera.value));
  console.log(mouse);

  //射线与物体交集 返回值是相交的物体
  //返回值是一个数组
  const intersection = rayCaster.intersectObject(cube.value);
  if (intersection.length > 0) {
    //射线(intersection[0]) 相交的第一个物体
    const instanceId = intersection[0].instanceId;

    //获取通过对应的id 获取当前点击到小球的颜色，并让color做为临时变量进行存储
    cube.value.getColorAt(instanceId, color);
    //只有这个颜色是白色时我们才去给他去赋值
    if (color.equals(white)) {
      cube.value.setColorAt(instanceId, color.setHex(Math.random() * 0xffffff));

      //改变颜色之后，要给对应的实例一个通知
      cube.value.instanceColor.needsUpdate = true;
    }
  }

  console.log(intersection.length);

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

//监听鼠标
document.addEventListener('mousemove', function (event) {
  // 当前鼠标的位置x / 页面的宽度 得到 当前位置的在页面上的百分比 取值范围是[0,1] 乘2取值范围就是[0,2] 减一取值范围就是[-1,1]
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1; /// 取值范围-1 ~1

  //因为y是从上到下的，所以得取个负号，才能让他从 -1 ~ 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; /// 取值范围 -1~1
});
</script>

<style scoped></style>
