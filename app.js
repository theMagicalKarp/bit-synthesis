importScripts('lib/lodash.min.js', 'lib/cannon.min.js');

var i,j,k;
var world = null;
var infected = [];
var particles = [];
var constraints = [];
var lastTime;
var fixedTimeStep = 1.0 / 60.0;
var maxSubSteps = 3;


var newWorld = function (data) {
    world = new CANNON.World();
    world.gravity.set(0, 0, 0);
    var sphereBody;

    for (i=0; i < data.count; i++) {
        sphereBody = new CANNON.Body({
            mass: 5,
            position: new CANNON.Vec3(_.random(-25, 25, true),_.random(-25, 25, true), _.random(-25, 25, true)),
            shape: new CANNON.Sphere(1),
            velocity: new CANNON.Vec3(_.random(-10, 10, true),_.random(-10, 10, true), _.random(-10, 10, true))
        });
        sphereBody.angularVelocity.set(_.random(-1, 1, true),_.random(-1, 1, true),_.random(-1, 1, true));
        world.addBody(sphereBody);
        sphereBody.color = new CANNON.Vec3(0,1,0);
        particles.push(sphereBody);
    }


    sphereBody = new CANNON.Body({
        mass: 5,
        position: new CANNON.Vec3(0, 0, 0),
        shape: new CANNON.Sphere(1),
        velocity: new CANNON.Vec3(_.random(-10, 10, true),_.random(-10, 10, true), _.random(-10, 10, true))
    });
    sphereBody.angularVelocity.set(_.random(-1, 1, true),_.random(-1, 1, true),_.random(-1, 1, true));
    sphereBody.color = new CANNON.Vec3(1,0,0);
    // sphereBody.relatives = [];
    world.addBody(sphereBody);
    infected.push(sphereBody);





    // for(i =0; i < data.count-1; i++) {
    //     var constraint = new CANNON.DistanceConstraint(particles[i], particles[i+1])
    //     constraints.push(constraint);
    //     world.addConstraint(constraint);
    // }

};

self.addEventListener('message', function(e) {
    var data = e.data;

    if (data.command === 'new') {
        newWorld(data);
    }
});


var tick = function() {

    if (world === null) {
        setTimeout(tick, 16);
        return;
    }

    var currTime = new Date().getTime();

    var dt = (currTime - lastTime) / 1000;
    world.step(fixedTimeStep, dt, maxSubSteps);
    lastTime = currTime;

    var stuff = []
    for (j=0; j<infected.length; j++) {
        for (i=0; i<particles.length; i++) {
            if (infected[j].position.distanceTo(particles[i].position) < 10) {
                stuff.push(particles[i]);
                particles[i].color.x = 1;
                particles[i].color.y = 0;
                var constraint = new CANNON.DistanceConstraint(infected[j], particles[i]);
                constraints.push(constraint);
                world.addConstraint(constraint);
            }
        }
    }

    for (j=0; j<stuff.length; j++) {
        particles.splice(particles.indexOf(stuff[j]), 1);
        infected.push(stuff[j])
    }




    var partData = [];
    for (i=0; i < particles.length; i++) {
        partData.push({
            position: particles[i].position,
            quaternion: particles[i].quaternion,
            color: particles[i].color
        });
    }

    for (i=0; i < infected.length; i++) {
        partData.push({
            position: infected[i].position,
            quaternion: infected[i].quaternion,
            color: infected[i].color
        });
    }


    var constData = [];
    for (i=0; i < constraints.length; i++) {
        constData.push([constraints[i].bodyA.position, constraints[i].bodyB.position]);
    }

    self.postMessage({
        particles: partData,
        constraints: constData
    });
    setTimeout(tick, 8);
};
tick();
