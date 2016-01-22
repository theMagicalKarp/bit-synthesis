importScripts('lib/lodash.min.js', 'lib/cannon.min.js');


var world = null
var particles = {};
var constraints = [];
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
            velocity: new CANNON.Vec3(_.random(-10, 10, true),_.random(-10, 10, true), _.random(-10, 10, true))
        });
        sphereBody.angularVelocity.set(_.random(-1, 1, true),_.random(-1, 1, true),_.random(-1, 1, true));
        world.addBody(sphereBody);
        particles[_.uniqueId('particle')] = sphereBody;
    });
    var temp = _.values(particles);

    for(var i =0; i <data.count-1; i++) {
        var constraint = new CANNON.DistanceConstraint(temp[i], temp[i+1])
        constraints.push(constraint);
        world.addConstraint(constraint);
    }
    // for(var i = 0; i < data.count; i+=2) {
    //     var constraint = new CANNON.DistanceConstraint(temp[i], temp[i+1])
    //     constraints.push(constraint);
    //     world.addConstraint(constraint);
    // }


    // var abod = new CANNON.Body({
    //     mass: 5,
    //     position: new CANNON.Vec3(5, 0, 0),
    //     shape: new CANNON.Sphere(1),
    //     velocity: new CANNON.Vec3(1,0, 0)
    // });
    // world.addBody(abod);
    // var bbod = new CANNON.Body({
    //     mass: 5,
    //     position: new CANNON.Vec3(0, 0, 0),
    //     shape: new CANNON.Sphere(1),
    //     velocity: new CANNON.Vec3(-1, 5, 0)
    // });
    // world.addBody(bbod);
    // particles['a'] = abod;
    // particles['b'] = bbod;
    // constraint = new CANNON.DistanceConstraint(abod, bbod);
    // world.addConstraint(constraint);
    // constraints.push(constraint);

    

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

    var partData = _.keys(particles).map(function(key) {
        return {
            position: particles[key].position,
            quaternion: particles[key].quaternion,
            color: particles[key].color
        };
    });

    var constData = _.map(constraints, function(constraint) {
        return [constraint.bodyA.position, constraint.bodyB.position];
    })
    self.postMessage({
        particles: partData,
        constraints: constData
    });

}, 16);

