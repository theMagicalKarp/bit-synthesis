importScripts('lib/lodash.min.js', 'lib/cannon.min.js');


var world = null
var particles = {};
var lastTime;
var fixedTimeStep = 1.0 / 60.0;
var maxSubSteps = 3;


var newWorld = function (data) {
    world = new CANNON.World();
    world.gravity.set(0, 0, 0);

    _.range(data.count).forEach(function(i) {
        var sphereBody = new CANNON.Body({
            mass: 5,
            position: new CANNON.Vec3(_.random(-25, 25, true),_.random(-25, 25, true), _.random(-25, 25, true)),
            shape: new CANNON.Sphere(1),
            velocity: new CANNON.Vec3(_.random(-1, 1, true),_.random(-1, 1, true), _.random(-1, 1, true))
        });
        sphereBody.angularVelocity.set(_.random(-1, 1, true),_.random(-1, 1, true),_.random(-1, 1, true));
        // sphereBody.color = new CANNON.Vec3(_.random(.85, .95, true), _.random(.15, .30, true), _.random(.15, .30, true));
        // console.log(sphereBody);
        world.addBody(sphereBody);

        particles[_.uniqueId('particle')] = sphereBody;
    });
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
        return {
            position: particles[key].position,
            quaternion: particles[key].quaternion,
            color: particles[key].color
        };
    });
    self.postMessage(data);

}, 16);

