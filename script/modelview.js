import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-2.9, 2.5, 6);

const controls = new OrbitControls( camera, renderer.domElement );

const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );

const loader = new GLTFLoader();

loader.load( '../vintage-wagon_cartoon_car.glb',  ( gltf ) => {

	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );

// const boxGeometry = new THREE.BoxGeometry(5, 5, 5);
// const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
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

let animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene,camera);
}
animate();

// document.getElementById("view").addEventListener("click", () => {
//   document.querySelector(".overlay").style.visibility = "hidden";
//   document.querySelector(".view_back").style.visibility = "visible";
// });

// document.querySelector(".view_back").addEventListener("click", () => {
//   document.querySelector(".overlay").style.visibility = "visible";
//   document.querySelector(".view_back").style.visibility = "hidden";
//   // camera.position.set(-2.9,2.5,6)
// });
