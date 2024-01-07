import * as THREE from 'three'

const renderer = new THREE.WebGLRenderer({antialias:true})
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setClearColor(0x000000);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight,1,1000);
camera.position.set(4,5,11);

const groundGeometry = new THREE.PlaneGeometry(20,20,32,32);
groundGeometry.rotateX(-Math.PI/2);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    side: THREE.DoubleSide
});
const groundMesh = new THREE.Mesh(groundGeometry,groundMaterial)
scene.add(groundMesh)


function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene.camera)
}
animate()