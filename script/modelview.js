import * as THREE from 'three'
import { OrbitControls ,} from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import * as dat from 'dat.gui';


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(-2.9,2.5,6)

const renderer  = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

const controlss = new OrbitControls( camera, renderer.domElement );

// const boxGeometry = new THREE.BoxGeometry(5,5,5);
// const boxMaterial = new THREE.MeshPhongMaterial({color: 0xff0000})
// const boxMesh = new THREE.Mesh(boxGeometry,boxMaterial)
// // scene.add(boxMesh)


const PlaneGeometry =  new THREE.PlaneGeometry(50,50);
const planeMaterial  = new THREE.MeshBasicMaterial({color:0xFFFFFF, side: THREE.DoubleSide});
const plane = new THREE.Mesh(PlaneGeometry,planeMaterial);
scene.add(plane)
plane.rotation.x = 0.5*Math.PI
const gridHelper = new THREE.GridHelper(10);
// scene.add(gridHelper)

const ambientLight = new THREE.AmbientLight(0xffffff,10)
scene.add(ambientLight)

const loader = new GLTFLoader();
loader.load( './model2/scene.gltf', function ( gltf ) {
    
    scene.add( gltf.scene );
    
}, undefined, function ( error ) {
    
    console.error( error );
    
} );



// window.addEventListener('mouseup',()=>{
//     console.log(camera.position)
// })
function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene,camera);
}
animate()

document.getElementById('view').addEventListener('click',()=>{
    document.querySelector('.overlay').style.visibility = 'hidden'
    document.querySelector('.view_back').style.visibility = 'visible'
})

document.querySelector('.view_back').addEventListener('click',()=>{
    document.querySelector('.overlay').style.visibility = 'visible'
    document.querySelector('.view_back').style.visibility = 'hidden'
    // camera.position.set(-2.9,2.5,6)
})