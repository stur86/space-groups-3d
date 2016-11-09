// NPM imports
var THREE = require('three');
var TWEEN = require('tween.js');

var SYMDATA = require('./symgroup_data.json');

var lsize = 12; // Default starting point
// Actual scene-space size will be 1

// Other stuff
var anim_t = 500;
var base_scale = 0.01;
var scale_fac = 5;

// Lattice parameters
var lattice_abc = [[1, 1, 2], [90, 90, 120]]; // Starting with a cube
var lattice_cart;
// Symmetry group
var current_group = 'P -1';

// Cell box
var boxGeom, boxMat, boxMesh;

// Points
var pGroup;
var textureLoader = new THREE.TextureLoader();
var pointTex = textureLoader.load("img/point.png");
var pointMat = new THREE.SpriteMaterial( { map: pointTex, color: 0xffffff, fog: true });
var pointArr; // Array of tweens

function latticePoint(sprite) {
    this.sprite = sprite;
    this.tween = null;
}

function computeCartesian() {
    // Computes Cartesian lattice from abc parameters

    var cart = [];

    function rad2deg(x) {
        return x/180.0*Math.PI;
    }

    rad_ang = lattice_abc[1].map(rad2deg);
    sin = rad_ang.map(Math.sin);
    cos = rad_ang.map(Math.cos);
    cart = cart.concat([sin[2], cos[2], 0.0]);
    cart = cart.concat([0.0, 1.0, 0.0]);
    cart = cart.concat([(cos[1]-cos[0]*cos[2])/sin[2], cos[0], 0.0]);
    cart[8] = Math.sqrt(1.0-cart[6]*cart[6]-cart[7]*cart[7]);
    cart = cart.map(function(x, i) {
                            return x*lattice_abc[0][Math.floor(i/3)];
                    });

    lattice_cart = new THREE.Matrix3();
    lattice_cart.fromArray(cart).transpose();
}

function computeGeom() {

    boxGeom = new THREE.Geometry();

    // Create all vertices and faces
    for (var xs = -0.5; xs < 1; ++xs) {
        for (var ys = -0.5; ys < 1; ++ys) {
            for (var zs = -0.5; zs < 1; ++zs) {
                var fp = new THREE.Vector3(xs, ys, zs)
                                  .applyMatrix3(lattice_cart);
                boxGeom.vertices.push(fp);
            }
        }
    }

    boxGeom.faces = [
        new THREE.Face3(0,1,2),
        new THREE.Face3(2,1,3),
        new THREE.Face3(4,5,6),
        new THREE.Face3(6,5,7),
        new THREE.Face3(0,1,4),
        new THREE.Face3(4,1,5),
        new THREE.Face3(2,3,6),
        new THREE.Face3(6,3,7),
        new THREE.Face3(0,2,4),
        new THREE.Face3(4,2,6),
        new THREE.Face3(1,3,5),
        new THREE.Face3(5,3,7),
    ];

    boxGeom = new THREE.EdgesGeometry(boxGeom); // Convert to wireframe
}

function threefySymData() {

    for (var group in SYMDATA) {
        // Convert the operators to THREE.js format
        var ops = SYMDATA[group].ops;
        for (var i = 0; i < ops.length; ++i) {
            var mat_arr = ops[i][0];
            ops[i][0] = new THREE.Matrix3();
            ops[i][0].fromArray(mat_arr);
            ops[i][1] = new THREE.Vector3(ops[i][1][0],
                                          ops[i][1][1],
                                          ops[i][1][2]);
        }
        SYMDATA.ops = ops;
    }
}

function renderBox() {

    boxMat = new THREE.LineBasicMaterial( { color: 0xaaaaaa, linewidth: 2} );
    boxMesh = new THREE.LineSegments(boxGeom, boxMat);

    Renderer.addObject(boxMesh);

}

function visualiseSymmetry(xyz) {
    var x0 = xyz[0];
    var y0 = xyz[1];
    var z0 = xyz[2];

    var sprite = pointArr[x0][y0][z0].sprite;

    var tween = new TWEEN.Tween({s: base_scale})
                    .to({s: base_scale*scale_fac}, anim_t)
                    .easing(TWEEN.Easing.Elastic.InOut)
                    .onUpdate( function () {
                        sprite.scale.set(this.s, this.s, this.s);
                    })
                    .chain(new TWEEN.Tween({s: base_scale*scale_fac})
                        .to({s: base_scale}, anim_t)
                        .easing(TWEEN.Easing.Elastic.InOut)
                        .onUpdate( function () {
                            sprite.scale.set(this.s, this.s, this.s);
                        }))
                    .start();
}

exports.init = function() {

    computeCartesian();
    computeGeom();
    renderBox();
    threefySymData();

    group = new THREE.Group();
    // Initialise the lattice of points
    pointArr = [];
    for (var x = 0; x < lsize; ++x) {
        pointArr.push([]);
        for (var y = 0; y < lsize; ++y) {
            pointArr[x].push([]);
            for (var z = 0; z < lsize; ++z) {
                var fp = new THREE.Vector3(x, y, z)
                                  .multiplyScalar(1.0/lsize)
                                  .addScalar(-0.5+0.5/lsize)
                                  .applyMatrix3(lattice_cart);

                var mat = pointMat.clone();
                //mat.color.setRGB( (x*0.5) +0.5, (y*0.5) +0.5, (z*0.5)+0.5);
                var sprite = new THREE.Sprite( mat );
                sprite.position.set(fp.x, fp.y, fp.z);
                sprite.scale.set(base_scale, base_scale, base_scale);
                sprite.data_index = [x,y,z];
                group.add(sprite);

                pointArr[x][y].push(new latticePoint(sprite));
            }
        }        
    }

    Renderer.addObject(group);
    Renderer.addClickListener(function(i) {
        if (i.length < 1)
            return;
        visualiseSymmetry(i[0].object.data_index);
    }, group);
}

