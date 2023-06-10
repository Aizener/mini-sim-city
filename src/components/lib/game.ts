
import { createThreeApp } from './app';
import { AmbientLight, AxesHelper, BoxGeometry, Clock, Color, DirectionalLight, DirectionalLightHelper, DoubleSide, GridHelper, Mesh, MeshBasicMaterial, MeshLambertMaterial, MeshNormalMaterial, MeshStandardMaterial, Object3D, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry, PointLight, PointLightHelper, Raycaster, RepeatWrapping, Scene, ShapeGeometry, SphereGeometry, SpotLight, SpotLightHelper, Texture, TextureLoader, Vector2, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useThrottle } from '../../utils/tools';
import { ref } from 'vue';

const width = window.innerWidth;
const height = window.innerHeight;
const boxes: Mesh<BoxGeometry>[] = [];
const mouse = new Vector2();
const boxSize = 10;
const num = 20;
const geometry = new BoxGeometry(boxSize, boxSize, boxSize);
const textureLoader = new TextureLoader();
const grassTexture = textureLoader.load('/texture/grass.png');
const defaultColor = '#ffffff';
const activeColor = 'green';
let movingCamera = false;

enum BuildType {
  HOUSE = 'HOUSE',
};
export const builds = ref([
  { name: 'commercial1', url: '/texture/commercial1.png', active: true, type: BuildType.HOUSE },
  { name: 'commercial2', url: '/texture/commercial2.png', active: false, type: BuildType.HOUSE },
  { name: 'commercial3', url: '/texture/commercial3.png', active: false, type: BuildType.HOUSE },
  { name: 'industrial1', url: '/texture/industrial1.png', active: false, type: BuildType.HOUSE },
  { name: 'residential2', url: '/texture/residential2.png', active: false, type: BuildType.HOUSE },
  { name: 'residential3', url: '/texture/residential3.png', active: false, type: BuildType.HOUSE },
]);
const buildTextures = builds.value.map(item => {
  const texture = textureLoader.load(item.url);
  texture.name = item.name;
  return texture;
});

const waterTexture = buildTextures.find(item => item.name === 'waternormals')?.clone();
if (waterTexture) {
  waterTexture.wrapS = RepeatWrapping;
  waterTexture.wrapT = RepeatWrapping;
}

const initPlaneBox = () => {
  grassTexture.wrapS = RepeatWrapping;
  grassTexture.wrapT = RepeatWrapping;
  const offset = boxSize * num * 0.5;
  for (let i = 0 ; i < num ; i ++) {
    for (let j = 0 ; j < num ; j ++) {
      const material = new MeshStandardMaterial({
        map: grassTexture,
      });
      const cube = new Mesh(geometry, material);
      cube.receiveShadow = true;
      cube.position.set(i * boxSize - offset, 0, j * boxSize - offset);
      boxes.push(cube);
    }
  }
  return boxes;
}

const initEvents = (scene: Scene) => {
  document.addEventListener('mouseup', (ev: MouseEvent) => {
    if (movingCamera) {
      return;
    }
    const activeObject = boxes.find(item => item.userData.active);
    if (!activeObject) {
      return;
    }
    if (ev.button === 2 && activeObject.userData.children && activeObject.userData.children.length) {
      const removeObject = activeObject.userData.children.pop();
      scene.remove(removeObject);
      return;
    }
    if (ev.button !== 0) {
      return;
    }
    const position = activeObject.position;
    const activeBuild = builds.value.find(item => item.active);
    const buildTexture = buildTextures.find(item => item.name === activeBuild?.name);
    const cube = new Mesh(geometry, new MeshStandardMaterial({ map: buildTexture }));
    cube.receiveShadow = true;
    cube.castShadow = true;
    cube.position.copy(position);
    if (!activeObject.userData.children) {
      activeObject.userData.children = [];
    }
    cube.position.y = (activeObject.userData.children.length + 1) * boxSize;
    const plane = new Mesh(new PlaneGeometry(boxSize, boxSize), new MeshStandardMaterial({ color: '#ccc' }));
    plane.rotation.x = -Math.PI * 0.5;
    plane.position.y = boxSize * 0.5 + 0.1;
    cube.add(plane);
    activeObject.userData.children.push(cube);
    scene.add(cube);
  });
  const mousemove = useThrottle((ev: MouseEvent) => {
    const { offsetX, offsetY } = ev;
    mouse.set(offsetX, offsetY);
  }, 10);
  document.addEventListener('mousemove', mousemove);
}

const initLights = (scene: Scene) => {
  const ambientLight = new AmbientLight(0xffffff, .5);
  const spotLight = new SpotLight(0xffffff, .8);
  spotLight.position.set(150, 150, 150);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 5012;
  spotLight.shadow.mapSize.height = 5012;
  scene.add(ambientLight, spotLight);
  return { spotLight };
}

const setColor = (mesh: Mesh<BoxGeometry>, color: string | number) => {
  (mesh.material as MeshStandardMaterial).color = new Color(color);
  if (mesh.userData.children) {
    mesh.userData.children.forEach((item: Mesh<BoxGeometry>) => {
      (item.material as MeshStandardMaterial).color = new Color(color);
    });
  }
}

export const createGame = () => {
  const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;
  if (!canvas) {
    return;
  }
  const { scene, camera, renderer } = createThreeApp({ canvas, width, height });
  scene.background = new Color(0x777777);
  camera.position.set(0, 200, 80);

  const { spotLight } = initLights(scene);
  const boxes = initPlaneBox();
  scene.add(...boxes);
  initEvents(scene);

  const ball = new Mesh(
    new SphereGeometry(5, 52, 52),
    new MeshNormalMaterial()
  );
  scene.add(ball);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.render(scene, camera);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', () => {
    movingCamera = true;
  });
  controls.addEventListener('end', () => {
    setTimeout(() => {
      movingCamera = false;
    });
  });
  const raycaster = new Raycaster();
  const coords = new Vector2();
  const clock = new Clock();
  const update = () => {
    coords.x = mouse.x / width * 2 - 1;
    coords.y = -mouse.y / height * 2 + 1;
    raycaster.setFromCamera(coords, camera);
    const objects = raycaster.intersectObjects(boxes);
    let target: Mesh<BoxGeometry> | null = null;
    if (objects.length) {
      target = objects[0].object as Mesh<BoxGeometry>;
      target.userData.active = true;
      setColor(target, activeColor);
    }
    
    boxes.forEach(box => {
      if (target !== box) {
        box.userData.active = false;
        setColor(box, defaultColor);
      }
    });

    const elapsedTime = clock.getElapsedTime();
    const x = Math.sin(elapsedTime * 0.05) * 100;
    const z = Math.cos(elapsedTime * 0.05) * 100;
    spotLight.position.set(x, 100, z);
    ball.position.set(x, 100, z);

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(update);
  };
  update();
};