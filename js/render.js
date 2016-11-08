// NPM imports
var $ = require('jquery');
var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);

var width;
var height;

var appdiv;
var camera, scene, renderer;

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

// Initialise renderer
exports.init = function() {

    appdiv = $('.main-app-content');

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

    $('.main-app-content').append(renderer.domElement);

    window.addEventListener( 'resize', onWindowResize, false );
}

exports.render = function() {
    renderer.clear();
    renderer.render( scene, camera );    
}

exports.animate = function() {
    requestAnimationFrame(exports.animate);
    exports.render();
}

exports.addObject = function(o) {
    scene.add(o);
}