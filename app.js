importScripts('lib/lodash.min.js', 'lib/cannon.min.js');

var world = null
var particles = {};
var lastTime;
var fixedTimeStep = 1.0 / 60.0; // seconds
var maxSubSteps = 3;


var newWorld = function (data) {
    world = new CANNON.World();
    world.gravity.set(0, 0, -9.82);


    _.range(data.count).forEach(function(i) {
        var sphereBody = new CANNON.Body({
            mass: 5,
            position: new CANNON.Vec3(_.random(-3, 3, true), _.random(-3, 3, true), 10),
            shape: new CANNON.Box(new CANNON.Vec3(1,1,1))
        });

        world.addBody(sphereBody);

        particles[_.uniqueId('particle')] = sphereBody;
    });

    var groundBody = new CANNON.Body({
        mass: 0 // mass == 0 makes the body static
    });

    var groundShape = new CANNON.Plane();
    groundBody.addShape(groundShape);
    world.addBody(groundBody);

};

self.addEventListener('message', function(e) {
    var data = e.data;

    if (data.command === 'new') {
        newWorld(data);
    }
});


setInterval(function() {
    if (world === null) {
        return;
    }

    var currTime = new Date().getTime();

    var dt = (currTime - lastTime) / 1000;
    world.step(fixedTimeStep, dt, maxSubSteps);
    lastTime = currTime;


    var data = _.keys(particles).map(function(key) {
        return particles[key].position;
    });
    self.postMessage(data);

}, 16);

