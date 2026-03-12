import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {MinMaxGUIHelper} from './camera.js';
import {ColorGUIHelper} from './lighting.js';

let canvas;
let renderer;
let scene;
let camera;
let light;
let directionalLight;
let hemisphereLight;
const fov = 45;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 1000;
/*let left = -1;
let right = 1;
let top = 1;
let bottom = -1;
let near = 5;
let far = 50;*/

main();

function main() {
  canvas = document.querySelector('#c');
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
    logarithmicDepthBuffer: true,
  });
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // scene + camera
  scene = new THREE.Scene();
  //fov = 75;
  //aspect = window.innerWidth / window.innerHeight;
  //camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
  //camera.zoom = 0.2;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);
  //camera.position.z = 20;
  //camera.position.y = 20;

  // lighting

  // ambient light
  const color = 0xFFFFFF;
  const intensity = 1;
  light = new THREE.AmbientLight(color, intensity);
  scene.add(light);

  // directional light
  const dLightColor = 0xFFFFFF;
  const dLight_intensity = 1;
  directionalLight = new THREE.DirectionalLight(dLightColor, dLight_intensity);
  directionalLight.position.set(0, 10, 0);
  directionalLight.target.position.set(-5, 0, 0);
  scene.add(directionalLight);
  scene.add(directionalLight.target);

  // hemisphere light
  const skyColor = 0xB1E1FF;  // light blue
  const groundColor = 0xB97A20;  // brownish orange
  const hemisphere_intensity = 1;
  hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, hemisphere_intensity);
  scene.add(hemisphereLight);

  renderer.render(scene, camera);
}
 
const gui = new GUI();
// camera GUI
gui.add(camera, 'zoom', 0.01, 1, 0.01).listen();
gui.add(camera, 'fov', 1, 180);
const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near');
gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far');
// lighting GUI
// ambient light
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('ambient light color');
gui.add(light, 'intensity', 0, 5, 0.01);
// directional light
gui.addColor(new ColorGUIHelper(directionalLight, 'color'), 'value').name('directional light color');
gui.add(directionalLight, 'intensity', 0, 5, 0.01);
gui.add(directionalLight.target.position, 'x', -10, 10);
gui.add(directionalLight.target.position, 'z', -10, 10);
gui.add(directionalLight.target.position, 'y', 0, 10);
// hemisphere light
gui.addColor(new ColorGUIHelper(hemisphereLight, 'color'), 'value').name('sky light color');
gui.addColor(new ColorGUIHelper(hemisphereLight, 'groundColor'), 'value').name('ground light color');
gui.add(light, 'intensity', 0, 5, 0.01);

const cameraHelper = new THREE.CameraHelper(camera);
scene.add(cameraHelper);

const view1Elem = document.querySelector('#view1');
const view2Elem = document.querySelector('#view2');

const controls = new OrbitControls(camera, view1Elem);

const camera2 = new THREE.PerspectiveCamera(
  60,  // fov
  2,   // aspect
  0.1, // near
  500, // far
);
camera2.position.set(40, 10, 30);
camera2.lookAt(0, 5, 0);
 
const controls2 = new OrbitControls(camera2, view2Elem);
controls2.target.set(0, 5, 0);
controls2.update();

function setScissorForElement(elem) {
  const canvasRect = canvas.getBoundingClientRect();
  const elemRect = elem.getBoundingClientRect();
 
  // compute a canvas relative rectangle
  const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
  const left = Math.max(0, elemRect.left - canvasRect.left);
  const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
  const top = Math.max(0, elemRect.top - canvasRect.top);
 
  const width = Math.min(canvasRect.width, right - left);
  const height = Math.min(canvasRect.height, bottom - top);
 
  // setup the scissor to only render to that part of the canvas
  const positiveYUpBottom = canvasRect.height - bottom;
  renderer.setScissor(left, positiveYUpBottom, width, height);
  renderer.setViewport(left, positiveYUpBottom, width, height);
 
  // return the aspect
  return width / height;
}


function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

// directional light
/*const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);
*/


// boxGeometry - data of the box
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

// texture loader
const loader = new THREE.TextureLoader();

// function to make multiple cubes
function makeInstance(geometry, color, x) {
  //const material = new THREE.MeshPhongMaterial({color});
  const materials = [
  new THREE.MeshBasicMaterial({map: loadColorTexture('public/flower-1.jpg')}),
  new THREE.MeshBasicMaterial({map: loadColorTexture('public/flower-2.jpg')}),
  new THREE.MeshBasicMaterial({map: loadColorTexture('public/flower-3.jpg')}),
  new THREE.MeshBasicMaterial({map: loadColorTexture('public/flower-4.jpg')}),
  new THREE.MeshBasicMaterial({map: loadColorTexture('public/flower-5.jpg')}),
  new THREE.MeshBasicMaterial({map: loadColorTexture('public/flower-6.jpg')}),
];
 
  const cube = new THREE.Mesh(geometry, materials);
  scene.add(cube);
 
  cube.position.x = x;
  cube.position.y = 2;
  cube.position.z = 13;
 
  return cube;
}

// make multiple cubes
const cubes = [
  makeInstance(geometry, 0x44aa88,  -5),
  //makeInstance(geometry, 0x8844aa, -2),
  //makeInstance(geometry, 0xaa8844,  2),
];

// sky box
{
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    'public/px.png',
    'public/nx.png',
    'public/py.png',
    'public/ny.png',
    'public/pz.png',
    'public/nz.png',
  ]);
  scene.background = texture;
}

// ground plane
const planeSize = 200;
const texture = loader.load('public/grass.jpg');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
texture.colorSpace = THREE.SRGBColorSpace;
const repeats = planeSize / 2;
texture.repeat.set(repeats, repeats);

const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMat = new THREE.MeshPhongMaterial({
  map: texture,
  side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.rotation.x = Math.PI * -.5;
mesh.position.y = 1;
scene.add(mesh);

// cube + sphere
/*{
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 15);
  scene.add(mesh);
}
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 1, 15);
  scene.add(mesh);
}*/

// trees
{
  // trunk
  const radiusTop = 0.8;
  const radiusBottom = 1;
  const height = 30;
  const radialSegments = 32;

  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    radialSegments
  );
  
  // leaves
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;

  function makeTreeInstance(geometry, x, z) {
    // trunk
    const material = new THREE.MeshPhongMaterial({ color: 0x655741 });
    const cylinder = new THREE.Mesh(geometry, material);
    scene.add(cylinder);
    cylinder.position.x = x;
    cylinder.position.y = 10;
    cylinder.position.z = z;
    // leaves
    const sphereMat = new THREE.MeshPhongMaterial({color: 'rgb(79, 127, 76)'});
    const sphere1Radius = 5;
    const sphere1Geo = new THREE.SphereGeometry(sphere1Radius, sphereWidthDivisions, sphereHeightDivisions);
    const leaf1 = new THREE.Mesh(sphere1Geo, sphereMat);
    leaf1.position.set(cylinder.position.x, cylinder.position.y + 20, cylinder.position.z);
    leaf1.scale.set(1, 0.8, 1);
    scene.add(leaf1);

    const sphere2Radius = 7;
    const sphere2Geo = new THREE.SphereGeometry(sphere2Radius, sphereWidthDivisions, sphereHeightDivisions);
    const leaf2 = new THREE.Mesh(sphere2Geo, sphereMat);
    leaf2.position.set(cylinder.position.x, cylinder.position.y + 12, cylinder.position.z);
    leaf2.scale.set(1, 0.8, 1);
    scene.add(leaf2);

    const sphere3Radius = 9;
    const sphere3Geo = new THREE.SphereGeometry(sphere3Radius, sphereWidthDivisions, sphereHeightDivisions);
    const leaf3 = new THREE.Mesh(sphere3Geo, sphereMat);
    leaf3.position.set(cylinder.position.x, cylinder.position.y + 3, cylinder.position.z);
    leaf3.scale.set(1, 0.6, 1);
    scene.add(leaf3);

    return cylinder;
  }

  const trees = [];

  const range = 100;       // world goes from -50 to 50
  const centerClear = 30; // half of 20x20 area

  for (let i = 0; i < 50; i++) {

    let x, z;

    do {
      x = Math.random() * range * 2 - range;
      z = Math.random() * range * 2 - range;
    } while (Math.abs(x) < centerClear && Math.abs(z) < centerClear);

    trees.push(makeTreeInstance(geometry, x, z));
  }
}

// bushes
{
  // trunk
  const radiusTop = 0.8;
  const radiusBottom = 1;
  const height = 30;
  const radialSegments = 32;

  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    radialSegments
  );
  
  // leaves
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;

  function makeBushInstance(geometry, x, z) {
    const bush = new THREE.Group(); 

    // leaves
    const sphereMat = new THREE.MeshPhongMaterial({color: 'rgb(104, 127, 76)'});
    const sphere1Radius = 4;
    const sphere1Geo = new THREE.SphereGeometry(sphere1Radius, sphereWidthDivisions, sphereHeightDivisions);
    const leaf1 = new THREE.Mesh(sphere1Geo, sphereMat);
    leaf1.position.set(0, 3, 0);
    bush.add(leaf1);

    const sphere2Radius = 4.5;
    const sphere2Geo = new THREE.SphereGeometry(sphere2Radius, sphereWidthDivisions, sphereHeightDivisions);
    const leaf2 = new THREE.Mesh(sphere2Geo, sphereMat);
    leaf2.position.set(-5, 3, 0);
    bush.add(leaf2);

    const sphere3Radius = 5;
    const sphere3Geo = new THREE.SphereGeometry(sphere3Radius, sphereWidthDivisions, sphereHeightDivisions);
    const leaf3 = new THREE.Mesh(sphere3Geo, sphereMat);
    leaf3.position.set(-2, 3, -5);
    bush.add(leaf3);

    bush.position.set(x, 0, z);
    bush.rotation.y = Math.random() * Math.PI * 2;
    let bush_randomScale = Math.random() * (0.8 - 0.4) + 0.4;
    bush.scale.set(bush_randomScale, bush_randomScale, bush_randomScale);

    scene.add(bush);

    return bush;
  }

  const bushes = [];

  const range = 100;       // world goes from -50 to 50
  const centerClear = 20; // half of 20x20 area

  for (let i = 0; i < 100; i++) {

    let x, z;

    do {
      x = Math.random() * range * 2 - range;
      z = Math.random() * range * 2 - range;
    } while (Math.abs(x) < centerClear && Math.abs(z) < centerClear);

    bushes.push(makeBushInstance(geometry, x, z));
  }
}

// textures
function loadColorTexture( path ) {
  const texture = loader.load( path );
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// cottage obj
{
    // load obj
    const objLoader = new OBJLoader();

    // load obj materials
    const mtlLoader = new MTLLoader();
    mtlLoader.load('public/cottage.mtl', (mtl) => {
    mtl.preload();
    objLoader.setMaterials(mtl);
    objLoader.load('public/cottage.obj', (root) => {
      scene.add(root);
      //root.scale.set(0.05, 0.05, 0.05);
      //root.position.y = -0.5;
    });
  });
}

// cat obj
let cat;
{
    // load obj
    const objLoader = new OBJLoader();

    // load obj materials
    const mtlLoader = new MTLLoader();
    mtlLoader.load('public/cat.mtl', (mtl) => {
    mtl.preload();
    objLoader.setMaterials(mtl);
    objLoader.load('public/cat.obj', (root) => {
      cat = root
      scene.add(cat);
      cat.scale.set(0.05, 0.05, 0.05);
      cat.position.set(1, 1, 15);
      cat.rotation.x = -Math.PI / 2;
    });
  });
}

// animation
function render(time) {
  time *= 0.001;  // convert time to seconds

  // cat rotation
  if (cat) {
    cat.rotation.z = time*3;
  }

  cubes.forEach((cube, ndx) => {
      const speed = 1 + ndx * .1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
  });

    resizeRendererToDisplaySize(renderer);

  // turn on the scissor
  renderer.setScissorTest(true);

  // render the original view
  {
    const aspect = setScissorForElement(view1Elem);

    // adjust the camera for this aspect
    camera.left   = -aspect;
    camera.right  =  aspect;
    camera.updateProjectionMatrix();
    cameraHelper.update();

    // don't draw the camera helper in the original view
    cameraHelper.visible = false;

    //scene.background.set(0x000000);
    //scene.background = new THREE.Color(0x000000);

    // render
    renderer.render(scene, camera);
  }

  // render from the 2nd camera
  {
    const aspect = setScissorForElement(view2Elem);

    // adjust the camera for this aspect
    camera2.aspect = aspect;
    camera2.updateProjectionMatrix();

    // draw the camera helper in the 2nd view
    cameraHelper.visible = true;

    //scene.background.set(0x000040);

    renderer.render(scene, camera2);
  }
 
  requestAnimationFrame(render);
}
requestAnimationFrame(render);