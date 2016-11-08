// NPM imports
window.$ = require('jquery');
// Local imports
window.Renderer = require('./render.js');
window.Lattice = require('./lattice.js');

// Bootstrap the whole thing!
$(document).ready(function() {
    Renderer.init();
    Renderer.animate();
    Lattice.init();
})