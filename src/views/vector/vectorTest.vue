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
  // 构造
  let v = new THREE.Vector3();
  console.log(v);
  v = new THREE.Vector3(1, 2, 3);
  console.log(v);

  //   属性
  console.log(v.x);
  console.log(v.y);
  console.log(v.z);

  console.log(v.isVector3); //true
  console.log('hello'.isVector3); //undefined

  v.x = 10;
  v.y = 20;
  v.z = 30;
  console.log(v);

  v.setX(100);
  v.setY(200);
  v.setZ(300);
  console.log(v);

  v.set(20, 40, 60);
  console.log(v);

  //   全部设置成50
  v.setScalar(50);
  console.log(v);
  // 和前面的功能一样
  v.setComponent(0, 33);
  v.setComponent(1, 44);
  v.setComponent(2, 55);
  console.log(v);

  for (let i = 0; i < 3; i++) {
    v.setComponent(i, i * 10);
  }
  console.log(v);

  let v1 = new THREE.Vector3(3, 4, 5);
  v.set(v1.x, v1.y, v1.z);
  console.log(v);

  //   copy
  v.copy(v1);
  console.log(v);

  v = v1;
  console.log(v);

  v.x = 100;
  console.log(v);

  //   clone
  v = v1.clone(); // new 一个对象，分量由v1分量赋值
  console.log(v);

  v = new THREE.Vector3().copy(v1);
  console.log(v);

  //   随机赋值
  //   给每个分量都进行随机参数的赋值 向量计算出的长度不是1
  v.random();
  console.log(v);
  //   一样是随机但是这次 范围是(-1,1) 向量计算出的长度是1
  v.randomDirection();
  console.log(v);

  //计算 0,0,0 到 x,y,z的长度 (a^2+b^2+c^2)
  console.log(v.length());
  //   只做大小比较 不需获取具体的长度
  console.log(v.lengthSq());

  // 分量等比例 放大/缩放
  v.setLength(100);
  console.log(v);
  //归一化 ，长度为1,向量方向不变,就是把刚刚放大的又变为长度为1的向量
  v.normalize();
  console.log(v);

  //   向量的长度
  console.log(v.length());

  //各个分量的和
  console.log(v.manhattanLength);

  v = new THREE.Vector3(-0.8, 0.5, 0.8);
  //   向上取整
  console.log(v.clone().ceil()); // 0,1,1
  //   四舍五入
  console.log(v.clone().round()); // -1,1,1
  //   向下取整
  console.log(v.clone().floor()); // -1,0,0
  //   待小数点的全部化为0
  console.log(v.clone().roundToZero()); // 0,0,0

  //   两个函数比较   取最大值，最小值
  v = new THREE.Vector3(1, 2, 3);
  //1,2,2
  console.log(v.clone().min(new THREE.Vector3(2, 2, 2)));
  //2,2,3
  console.log(v.clone().min(new THREE.Vector3(2, 2, 2)));

  //取中间数 ,必须要三个向量
  v = new THREE.Vector3(10, 20, 30);
  v1 = v
    .clone()
    .clamp(new THREE.Vector3(11, 11, 11), new THREE.Vector3(22, 22, 22));
  console.log(v1);

  //   clampLength()方法用于将向量的长度限制在指定的范围内。

  // clampLength()方法将该向量的长度限制在40到50之间。
  //   这意味着，如果向量的长度小于40，则它将被放大，
  // 如果长度大于50，则它将被缩小，以使其长度等于50。
  // 因此，v1是一个新的向量对象，它与v具有相同的方向，但其长度在40到50之间

  v1 = v.clone().clampLength(40, 50);

  //   clampScalar()方法用于将向量的每个分量限制在指定的范围内。
  // v.clone()方法返回一个新的向量对象，然后我们调用clampScalar()方法将该向量的每个分量限制在11到29之间。
  // 这意味着，如果向量的某个分量小于11，则它将被放大，如果分量大于29，则它将被缩小，以使其值在11到29之间。
  // 因此，v1是一个新的向量对象，它与v具有相同的方向，但其每个分量的值都在11到29之间

  v1 = v.clone().clampScalar(11, 29);
  console.log(v1);

  /// v=>[]
  let v3 = new THREE.Vector3(1, 2, 3);
  let v4 = new THREE.Vector3(4, 5, 6);
  let array = [];

  //将向量转化为数组
  v3.toArray(array, 0);
  console.log(v3);

  //将数组转化为向量
  //后面的数字 是从哪个索引开始
  v4.fromArray(array, 0);
  console.log(v4);

  //向量计算
  v = new THREE.Vector3(-1, 3, 6);
  //取反
  console.log(v.negate());

  //两向量的操作
  // 对应分量的 + - * /
  v1 = new THREE.Vector3(4, 5, 6);
  //分量加法
  //两个方法是一样的
  v.add(v1);
  console.warn(v);
  v.addScalar(100);
  console.log(v);
  //   加上 v1 *100倍的向量
  v.addScaledVector(v1, 100);
  console.warn(v);
  //   连加
  v.addVectors(v1, v1);

  //   分量减法
  v.sub(v1);
  console.log(v);
  //   与上面的方法一样都是做减法
  v.subScalar(100);
  console.log(v);
  //   减去 v1 *100倍的向量
  v.subScaledVector(v1, 100);
  //连减
  v.subVectors(v1, v1);

  //   分量乘法
  v.multiply(v1);
  console.log(v);
  //   与上面的方法一样都是做乘法
  v.multiplyScalar(100);
  console.log(v);
  //   连乘
  v.multiplyVectors(v1, v);

  //   分量除法
  v.divide(v1);
  console.log(v);
  //   与上面的方法一样都是做除法
  v.divideScalar(100);
  console.log(v);
  //   连除
  v.divideVectors(v1, v);

  //点积和叉积
  //点积就是 每个对应位置的值 相乘  1*4+2*5 +3*6
  //若点积为0 等价于 两向量垂直
  v = new THREE.Vector3(1, 2, 3);
  v1 = new THREE.Vector3(4, 5, 6);

  console.log(v.dot(v1));

  //叉积
  //叉积 求出来的值是 就是垂直于两个向量的向量

  //   (a1,a2,a3)x(b1,b2,b3)=(a2b3-a3b2,a3b1-a1b3,a1b2-a2b1)
  v = new THREE.Vector3(3, 0, 0);
  v1 = new THREE.Vector3(0, 4, 0);
  console.log(v.cross(v1)); //0,0,12

  //   计算出两个向量的夹角
  //   向量a×向量b = 点积
  //   向量夹角公式：cosθ=(向量a×向量b) /(|向量a|×|向量b|)
  //最后用cos θ 反求出θ
  console.log(v.angleTo(v1));

  //   计算向量v和向量v1之间的距离
  console.log(v.distanceTo(v1));

  //两个向量顶点的距离
  //   方法可以计算向量v和向量v1之间的曼哈顿距离。
  //   曼哈顿距离是指两个点在南北或东西方向上的距离之和
  v.manhattanDistanceTo(v1);

  console.log(v.manhattanDistanceTo(v1)); // 3+4

  //   lerp方法是该类中的一个方法，用于计算当前向量与另一个向量之间的线性插值。
  //   第二个参数表示插值的权重，取值范围为0到1。
  //   当权重为0时，结果为当前向量；当权重为1时，结果为另一个向量；
  //   当权重为0.5时，结果为两个向量的平均值。

  v.lerp(v1, 1);

  //   判别两个向量是否相同
  console.log(v.equals(v1));

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
    1000
  );
  // 设置camera摆放的位置
  //   将camera放到z轴位置处于5的位置
  //   toRaw 将响应式对象改为普通对象，不用就报错，说Positon无法改变

  //   若不设置看不到z轴
  toRaw(camera.value).position.x = 10;

  toRaw(camera.value).position.y = 30;
  toRaw(camera.value).position.z = 50;

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
