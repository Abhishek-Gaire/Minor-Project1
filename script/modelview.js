const THREE = require("three");

const scene = new THREE.Scene();

// Set up camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Set up renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load car model
const loader = new THREE.GLTFLoader();
loader.load("../hyundaitucson1.glb", (gltf) => {
  scene.add(gltf.scene);
});

// Animation
const animate = function () {
  requestAnimationFrame(animate);

  // Your animation logic here

  // Render the scene
  renderer.render(scene, camera);
};

animate();
// import * as THREE from "three";

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// const scene = new THREE.Scene();

// const camera = new THREE.PerspectiveCamera(
//   75,
//   window.innerWidth / window.innerHeight,
//   0.1,
//   1000
// );
// camera.position.set(-2.9, 2.5, 6);

// const controls = new OrbitControls(camera, renderer.domElement);

// const boxGeometry = new THREE.BoxGeometry(5, 5, 5);
// const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
// const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
// scene.add(boxMesh);

// const loader = new GLTFLoader();

// const PlaneGeometry = new THREE.PlaneGeometry(50, 50);
// const planeMaterial = new THREE.MeshBasicMaterial({
//   color: 0xffffff,
//   side: THREE.DoubleSide,
// });
// const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
// scene.add(groundMesh);

// function animate() {
//   requestAnimationFrame(animate);
//   renderer.render(scene.camera);
// }
// animate();

// document.getElementById("view").addEventListener("click", () => {
//   document.querySelector(".overlay").style.visibility = "hidden";
//   document.querySelector(".view_back").style.visibility = "visible";
// });

// document.querySelector(".view_back").addEventListener("click", () => {
//   document.querySelector(".overlay").style.visibility = "visible";
//   document.querySelector(".view_back").style.visibility = "hidden";
//   // camera.position.set(-2.9,2.5,6)
// });
