// NPM imports
var $ = require('jquery');
var THREE = require('three');
var TWEEN = require('tween.js');
var OrbitControls = require('three-orbit-controls')(THREE);

var width;
var height;

var appdiv;
var camera, scene, renderer;

var ray_lstn = [];

function updateSize() {
    width = appdiv.innerWidth();
    height = appdiv.innerHeight();
}

function onWindowResize() {

    updateSize();

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

function onClickRaycast(e) {
    //We create a 2D vector
    vector = new THREE.Vector2();
    //We set its position where the user clicked and we convert it to a number between -1 & 1
    vector.set(
        2*(e.clientX/width)-1,
        1-2*(e.clientY/height)
    );

    //We create a raycaster, which is some kind of laser going through your scene
    raycaster = new THREE.Raycaster();
    //We apply two parameters to the 'laser', its origin (where the user clicked) and the direction (what the camera 'sees')
    raycaster.setFromCamera(vector,camera);

    //We get all the objects the 'laser' find on its way (it returns an array containing the objects)
    for (var i = 0; i < ray_lstn.length; ++i) {

        var targ = ray_lstn[i][1] || scene;

        intersects = raycaster.intersectObjects(targ.children);
        ray_lstn[i][0](intersects);
    }
}

// Initialise renderer
exports.init = function() {

    appdiv = $('.main-app-content');

    ray_lstn = [];

    // Get the size
    updateSize();

    camera = new THREE.PerspectiveCamera( 60, width / height, 0.1, 100 );
    camera.position.set(0,0,2);
    camera.lookAt(new THREE.Vector3(0,0,0));


    scene = new THREE.Scene();
    //scene.fog = new THREE.Fog( 0x000000, 1500, 2100 );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(width, height);

    // Set up controls
    controls = new OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', exports.render );

    appdiv.append(renderer.domElement);

    window.addEventListener( 'resize', onWindowResize, false );

    // Add raycast hit event listener
    renderer.domElement.addEventListener('mousedown', onClickRaycast);
}

exports.render = function() {
    renderer.clear();
    renderer.render( scene, camera );    
}

exports.animate = function() {
    requestAnimationFrame(exports.animate);
    TWEEN.update();
    exports.render();    
}

exports.addObject = function(o) {
    scene.add(o);
}

exports.addClickListener = function(listener, group) {

    group = group || null;

    ray_lstn.push([listener, group]);
}