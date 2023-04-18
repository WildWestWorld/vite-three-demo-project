<template>
  <div class="three-container"></div>
  <div id="speedometer">0.0 km/h</div>
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

let vehicleMesh;

// 定义物体转动姿态 前三个就是x,y,z 最后一个是转动的角度 或者说转动的姿态
let ZERO_QUATERNION = new THREE.Quaternion(0, 0, 0, 1);

let DISABLE_DEACTIVATION = 4;
let clock = new THREE.Clock();

// 物体颜色
let materialDynamic = new THREE.MeshPhongMaterial({ color: 0xfca400 });
let materialStatic = new THREE.MeshPhongMaterial({ color: 0x999999 });
let materialInteractive = new THREE.MeshPhongMaterial({ color: 0x990000 });

let physicsUniverse;
// 变换器，一般用于物体的动作
let tmpTransformation;
let speedometer;

let vehicle;
let syncList = [];

// 设置当前的动作
let actions = {};

// 根据不同的案件试着不同的动作
let keysActions = {
  KeyW: 'acceleration',
  KeyS: 'braking',
  KeyA: 'left',
  KeyD: 'right',
};

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
  Ammo().then(() => {
    // 速度的大小
    speedometer = document.getElementById('speedometer');
    // 设置物体的motion,设置物体的动作
    tmpTransformation = new Ammo.btTransform();
    //    初始化图像
    init();
    initPhysicsUniverse();
    createObjects();
    render();
  });
});
// 方法区

const initGraphics = () => {};
const initPhysicsUniverse = () => {
  // 初始化物理世界 固定的无需理解

  
// 这段代码是在创建物理世界的时候，初始化了一些物理世界的参数，包括碰撞检测配置，碰撞检测分发器，重叠对缓存，顺序脉冲约束求解器。
//   这些参数都是在创建物理世界时必须要初始化的，否则会导致物理世界无法正常工作。
  
  const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  const overlappingPairCache = new Ammo.btDbvtBroadphase();
  const solver = new Ammo.btSequentialImpulseConstraintSolver();

  physicsUniverse = new Ammo.btDiscreteDynamicsWorld(
    dispatcher,
    overlappingPairCache,
    solver,
    collisionConfiguration
  );
  //   设置重力
  physicsUniverse.setGravity(new Ammo.btVector3(0, -9.82, 0));
};

const createObjects = () => {
  // 创建地板
  createBox(new THREE.Vector3(0, -0.5, 0), ZERO_QUATERNION, 500, 1, 500, 0, 2);
  //斜坡
  const quaternion = new THREE.Quaternion(0, 0, 0, 1);
  quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 18);
  createBox(new THREE.Vector3(0, -1.5, 0), quaternion, 8, 4, 10, 0, 1);

  //墙
  //   墙的大小
  const size = 0.75;
  //   墙的宽
  const nw = 10;
  //   墙的高度
  const nh = 6;
  for (let i = 0; i < nw; i++) {
    for (let j = 0; j < nh; j++) {
      console.log(size * i - (size * (nw - 1)) / 2);
      // 创建盒子
      createBox(
        // x的范围(-4.5 ~ 4.5) , y(0~6)
        new THREE.Vector3(size * i - (size * (nw - 1)) / 2, size * j, 10),
        //无转向姿态
        ZERO_QUATERNION,
        // 大小
        size,
        size,
        size,
        10
      );
    }
  }
  //  创建小车
  createVehicle(new THREE.Vector3(0, 4, -20), ZERO_QUATERNION);
};
// 创建物体(位置，姿态/角度,宽,长,高,重力,摩擦力)
const createBox = (pos, quat, w, l, h, mass, friction) => {
  // 质量
  if (!mass) {
    mass = 0;
  }
  //摩擦力
  if (!friction) {
    friction = 1;
  }
  //   根据 质量是否大于0来设置物体的颜色
  const material = mass > 0 ? materialDynamic : materialStatic;

  const mesh = new THREE.Mesh(
    // 几何的尺寸是我们自定义的参数
    new THREE.BoxBufferGeometry(w, l, h, 1, 1, 1),
    material
  );
  //   设置位置
  mesh.position.copy(pos);
  //是否能转动
  mesh.quaternion.copy(quat);
  scene.value.add(mesh);

  //  初始姿态
  const transform = new Ammo.btTransform();

  //设置单元矩阵
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
  const motionState = new Ammo.btDefaultMotionState(transform);
  const boxShape = new Ammo.btBoxShape(new Ammo.btVector3(w / 2, 1 / 2, h / 2));
  const localInertia = new Ammo.btVector3(0, 0, 0);

  boxShape.calculateLocalInertia(mass, localInertia);
  //   刚体
  const rigidBodyInfor = new Ammo.btRigidBodyConstructionInfo(
    mass,
    motionState,
    boxShape,
    localInertia
  );

  const rigidBody = new Ammo.btRigidBody(rigidBodyInfor);
  rigidBody.setFriction(friction); //设置摩擦系数
  physicsUniverse.addRigidBody(rigidBody);

  if (mass > 0) {
    rigidBody.setActivationState(DISABLE_DEACTIVATION);
      // 同步小车状态
    function sync(dt) {
      const ms = rigidBody.getMotionState();
      if (ms) {
        ms.getWorldTransform(tmpTransformation);
        const p = tmpTransformation.getOrigin();
        const q = tmpTransformation.getRotation();
        mesh.position.set(p.x(), p.y(), p.z());
        mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
      }
    }
    syncList.push(sync);
  }
};
// 创建 小车的主干 (宽,长,高)
const createVehicleMesh = (w, l, h) => {
  //materialInteractive 自定义的材料颜色，深红
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, l, h, 1, 1, 1),
    materialInteractive
  );
  scene.value.add(mesh);
  return mesh;
};
// 创建小车的轮子(半径,宽度)
const createWheelMesh = (radium, width) => {
  // 创建圆形轮廓
  const cylinderG = new THREE.CylinderBufferGeometry(radium, radium, radium);
  // 旋转90度
  cylinderG.rotateZ(Math.PI / 2);
  //创建物体
  const mesh = new THREE.Mesh(cylinderG, materialInteractive);
  mesh.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(width * 1.5, radium * 1.75, radium * 0.25),
      materialInteractive
    )
  );
  //   场景添加物体
  scene.value.add(mesh);
  return mesh;
};
// 创建车子(位置,姿态/角度)
const createVehicle = (pos, quat) => {
  let vehicleWidth = 1.8; //车宽
  let vehicleHeight = 0.6; //车高
  let vehicleLength = 5; // 车长
  let vehicleMass = 800; // 车质量

  //车轮
  let wheelAxisPositionBack = -1; //后轮相对中间位置
  let wheelRadiusBack = 0.4; //后轮半径
  let wheelWidthBack = 0.3; //后轮宽
  let wheelHalfTrackBack = 1; //两后轮的距离
  let wheelAxisHeightBack = 0.3; //后轮轴的高度

  let wheelAxisPositionFront = 1.7;//前轮相对中间的位置
  let wheelRadiusFront = 0.35;//前轮半径
  let wheelWidthFront = 0.2;//前轮宽度
  let wheelHalfTrackFront = 1;//两前轮的 
  let wheelAxisHeightFront = 0.3;

  //摩擦
  let friction = 1000;
  let suspensionStiffness = 20.0; //悬挂刚度
  let suspensionDamping = 2.3; //悬挂放松
  let suspensionCompression = 4.4; //悬挂压缩
  let suspensionRestLength = 0.6;
  let rollInfluence = 0.2;

  //转向
  let steeringIncrement = 0.04;
  let steeringClamp = 0.5; //转向锁止
  let maxEngineForce = 2000; //最大推力
  let maxBreakingForce = 100; //最大刹车

  //初始姿态
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
  const motionState = new Ammo.btDefaultMotionState(transform);

  const boxShape = new Ammo.btBoxShape(
    new Ammo.btVector3(vehicleWidth / 2, vehicleHeight / 2, vehicleLength / 2)
  );
  const localInertia = new Ammo.btVector3(0, 0, 0);
  boxShape.calculateLocalInertia(vehicleMass, localInertia);

  //刚体
  const vehicleBody = new Ammo.btRigidBody(
    new Ammo.btRigidBodyConstructionInfo(
      vehicleMass,
      motionState,
      boxShape,
      localInertia
    )
  );
  vehicleBody.setActivationState(DISABLE_DEACTIVATION);
  physicsUniverse.addRigidBody(vehicleBody);

  vehicleMesh = createVehicleMesh(vehicleWidth, vehicleHeight, vehicleLength);

  let engineForce = 0;
  let vehicleStreering = 0;
  let brakingForce = 0;

  let tuning = new Ammo.btVehicleTuning();
  let rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsUniverse);
  vehicle = new Ammo.btRaycastVehicle(tuning, vehicleBody, rayCaster);
  vehicle.setCoordinateSystem(0, 1, 2);
  physicsUniverse.addAction(vehicle);

  let wheelMeshes = [];
  let wheelDirecitonCS0 = new Ammo.btVector3(0, -1, 0);
  let wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

  function addWheel(isFront, pos, radius, width, index) {
    let wheelInfo = vehicle.addWheel(
      pos,
      wheelDirecitonCS0,
      wheelAxleCS,
      suspensionRestLength,
      radius,
      tuning,
      isFront
    );
    wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
    wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
    wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
    wheelInfo.set_m_frictionSlip(friction);
    wheelInfo.set_m_rollInfluence(rollInfluence);
    console.error(isFront, index);
    wheelMeshes[index] = createWheelMesh(radius, width);
  }

  addWheel(
    true,
    new Ammo.btVector3(
      wheelHalfTrackFront,
      wheelAxisHeightFront,
      wheelAxisPositionFront
    ),
    wheelRadiusFront,
    wheelWidthFront,
    0
  );

  addWheel(
    true,
    new Ammo.btVector3(
      -wheelHalfTrackFront,
      wheelAxisHeightFront,
      wheelAxisPositionFront
    ),
    wheelRadiusFront,
    wheelWidthFront,
    1
  );

  addWheel(
    false,
    new Ammo.btVector3(
      -wheelHalfTrackBack,
      wheelAxisHeightBack,
      wheelAxisPositionBack
    ),
    wheelRadiusBack,
    wheelWidthBack,
    2
  );

  addWheel(
    false,
    new Ammo.btVector3(
      wheelHalfTrackBack,
      wheelAxisHeightBack,
      wheelAxisPositionBack
    ),
    wheelRadiusBack,
    wheelWidthBack,
    3
  );

  function sync(dt) {
    const speed = vehicle.getCurrentSpeedKmHour();
    speedometer.innerHTML = (speed < 0 ? '(R)' : '') + Math.abs(speed);
    // 处理实时的动力情况
    brakingForce = 0;
    engineForce = 0;

    if (actions.acceleration) {
      if (speed < -1) {
        brakingForce = maxBreakingForce;
      } else {
        engineForce = maxEngineForce;
      }
    }

    if (actions.braking) {
      if (speed > 1) {
        brakingForce = maxBreakingForce;
      } else {
        engineForce = -maxEngineForce / 2;
      }
    }

    if (actions.left) {
      if (vehicleStreering < steeringClamp) {
        vehicleStreering = vehicleStreering + steeringIncrement;
      }
    } else {
      if (actions.right) {
        if (vehicleStreering > -steeringClamp) {
          vehicleStreering = vehicleStreering - steeringIncrement;
        } else {
          if (vehicleStreering > -steeringIncrement) {
            vehicleStreering = vehicleStreering + steeringIncrement;
          } else {
            if (vehicleStreering > steeringIncrement) {
              vehicleStreering = vehicleStreering - steeringIncrement;
            } else {
              vehicleStreering = 0;
            }
          }
        }
      }
    }

    vehicle.applyEngineForce(engineForce, 2);
    vehicle.applyEngineForce(engineForce, 3);

    vehicle.setBrake(brakingForce / 2, 0);
    vehicle.setBrake(brakingForce / 2, 1);

    vehicle.setBrake(brakingForce, 2);
    vehicle.setBrake(brakingForce, 3);

    vehicle.setSteeringValue(vehicleStreering, 0);
    vehicle.setSteeringValue(vehicleStreering, 1);

    // 同步几何数据
    let tm, p, q, i;
    let n = vehicle.getNumWheels();
    for (i = 0; i < n; i++) {
      vehicle.updateWheelTransform(i, true);
      tm = vehicle.getWheelTransformWS(i);
      p = tm.getOrigin();
      q = tm.getRotation();
      //   console.warn(wheelMeshes);
      wheelMeshes[i].position.set(p.x(), p.y(), p.z());
      wheelMeshes[i].quaternion.set(q.x(), q.y(), q.z(), q.w());
    }
    //同步车体
    tm = vehicle.getChassisWorldTransform();
    p = tm.getOrigin();
    q = tm.getRotation();

    vehicleMesh.position.set(p.x(), p.y(), p.z());
    vehicleMesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
  }
  syncList.push(sync);
};
// const addWheel = (isFront, pos, radius, width, index) => {
//   let wheelInfo = vehicle.addWheel(
//     pos,
//     wheelDirecitonCS0,
//     wheelAxleCS,
//     suspensionRestLength,
//     radius,
//     tuning,
//     isFront
//   );
//   wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
//   wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
//   wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
//   wheelInfo.set_m_frictionSlip(friction);
//   wheelInfo.set_m_rollInfluence(rollInfluence);

//   wheelMeshes[index] = createWheelMesh(radius, width);
// };
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
  toRaw(camera.value).position.x = -40;

  toRaw(camera.value).position.y = 20;
  toRaw(camera.value).position.z = -20;

  camera.value.lookAt(0.33, -0.4, 0.85);
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
  ambientLight.value = new THREE.AmbientLight(0x404040);
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
  renderer.value = new THREE.WebGLRenderer({ antialias: true });

  //开启渲染器中的阴影渲染
  renderer.value.shadowMap.enabled = true;
  renderer.value.setClearColor(0xbfd1e5);
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
  if (clock) {
    let dt = clock.getDelta();
    for (let i = 0; i < syncList.length; i++) {
      syncList[i](dt);
    }
    physicsUniverse.stepSimulation(dt, 10);
    cameraController.value.update(dt);
  }
  // 这段代码必须放到最下面
  // render(场景，相机)
  toRaw(renderer.value).render(toRaw(scene.value), toRaw(camera.value));

  requestAnimationFrame(render);
};

//按下按键
const keydown = (e) => {
  //根据我们自定义的数组来控制当前的按键
  // e.code 返回值:示例:KeyW
  //keysActions[KeyW] : acceleration
  //   console.log(e.code);

  if (keysActions[e.code]) {
    actions[keysActions[e.code]] = false;
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
};
const keyup = (e) => {
  console.log(e.code);
  if (keysActions[e.code]) {
    actions[keysActions[e.code]] = true;
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
};

//让渲染的页面随着窗体变化而变化
window.addEventListener('resize', function () {
  camera.value.aspect = window.innerWidth / window.innerHeight;
  // 所以，执行camera.updateProjectionMatrix();的时候，threejs会重新计算相机对象的投影矩阵值。
  camera.value.updateProjectionMatrix();
  //调整页面的大小
  renderer.value.setSize(window.innerWidth, window.innerHeight);
});
window.addEventListener('keydown', keydown);
window.addEventListener('keyup', keyup);
</script>

<style scoped>
#speedometer {
  color: #ffffff;
  background-color: #990000;
  position: absolute;
  bottom: 0px;
  padding: 5px;
  z-index: 99999;
}
</style>
