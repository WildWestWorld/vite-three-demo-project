<template>
  <div class="three-container"></div>
</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// 性能监视器
import Stats from 'three/examples/jsm/libs/stats.module';
import { onMounted, reactive, ref, toRaw } from 'vue';
// 变量区

// 场景
const scene = ref(null);
//方块/物体
const cube = ref(null);
//摄像机
const camera = ref(null);
//相机控制器
const cameraControler = ref(null);
// 渲染器
const renderer = ref(null);
// 坐标轴
const axisHelp = ref(null);

let stats;

// 生命周期区
onMounted(() => {
  init();
  render();
});
// 方法区

//初始化
const init = () => {
  //// 1.创建scene以及物体
  //   创建场景
  scene.value = new THREE.Scene();
  //   创建对象
  // 创建几何体，BoxGeometry(长，宽，高)
  let geometry = new THREE.BoxGeometry(1, 1, 1);
  //   几何体的材质
  let meterial = new THREE.MeshBasicMaterial({ color: 'grey' });

  //  正式创建几何体,Mesh(几何体，材质)
  cube.value = new THREE.Mesh(geometry, meterial);

  //  将创建好的物体放到我们创建的场景里面
  scene.value.add(cube.value);

  // 创建坐标轴
  axisHelp.value = new THREE.AxesHelper();

  //   添加坐标轴
  //   需要特别说明的是横着的红色是x轴，竖着的是绿色的是y轴(!!!)，而朝向我们的是z轴
  scene.value.add(axisHelp.value);

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
  toRaw(camera.value).position.z = 5;
  //   若不设置看不到z轴
  toRaw(camera.value).position.x = 2;

  toRaw(camera.value).position.y = 1;

  // 3.创建render
  // 我们设置WebGL位置
  renderer.value = new THREE.WebGLRenderer();

  // 设置渲染的大小
  renderer.value.setSize(window.innerWidth, window.innerHeight);

  //   将渲染好的数据，放到document里面
  // renderer.value.domElement=我们渲染出来的数据(是一个canvas)
  //   document.body.appendChild(renderer.value.domElement);
  let threeContainer = document.querySelector('.three-container');
  threeContainer.appendChild(renderer.value.domElement);
  // 4.控制器
  cameraControler.value = new OrbitControls(
    camera.value,
    renderer.value.domElement
  );


};
// 渲染
const render = () => {
  // render(场景，相机)
  //   创建的cube进行旋转
  toRaw(cube.value).rotation.y = toRaw(cube.value).rotation.y + 0.01;
  //requestAnimationFrame来自浏览器 就是一旦有空闲就会再次调用里面放的函数

  stats.update();

  toRaw(renderer.value).render(toRaw(scene.value), toRaw(camera.value));

  //   相当于无线循环render
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
