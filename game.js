function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

planck.testbed(function (testbed) {
    var pl = planck, Vec2 = pl.Vec2;
    var world = new pl.World(Vec2(0, -10));

    var COUNT = 7;

    var heroBody;

    var sensor;
    var bodies = [];
    var touching = [];

    var ground = world.createBody();
    ground.createFixture(pl.Edge(Vec2(-200.0, 0.0), Vec2(200.0, 0.0)), 10.0);

    if (0) {
        sensor = ground.createFixture({
            shape: pl.Box(10.0, 2.0, Vec2(0.0, 20.0), 0.0),
            isSensor: true,
        });

    } else {
        sensor = ground.createFixture({
            shape: pl.Circle(Vec2(0.0, 10.0), 5.0),
            isSensor: true,
        });
    }

    var circle = pl.Circle(1.0);

    const friction = 2;
    heroBody = world.createDynamicBody(Vec2(-10.0 + 3.0 * 3, 20.0));
    heroBody.setUserData({ touching: false });
    heroBody.createFixture(circle, friction);

    // for (var i = 0; i < COUNT; ++i) {
    //     if (i == 3) continue;
    //     touching[i] = { touching: false };

    //     bodies[i] = world.createDynamicBody(Vec2(-10.0 + 3.0 * i, 20.0));
    //     bodies[i].setUserData(touching[i])
    //     bodies[i].createFixture(circle, 1.0);
    // }

    // Implement contact listener.
    world.on('begin-contact', function (contact) {
        var fixtureA = contact.getFixtureA();
        var fixtureB = contact.getFixtureB();

        if (fixtureA === sensor) {
            var userData = fixtureB.getBody().getUserData();
            if (userData) {
                userData.touching = true;
            }
        }

        if (fixtureB === sensor) {
            var userData = fixtureA.getBody().getUserData();
            if (userData) {
                userData.touching = true;
            }
        }
    });

    // Implement contact listener.
    world.on('end-contact', function (contact) {
        var fixtureA = contact.getFixtureA();
        var fixtureB = contact.getFixtureB();

        if (fixtureA === sensor) {
            var userData = fixtureB.getBody().getUserData();
            if (userData) {
                userData.touching = false;
            }
        }

        if (fixtureB === sensor) {
            var userData = fixtureA.getBody().getUserData();
            if (userData) {
                userData.touching = false;
            }
        }
    });

    testbed.step = function () {

        var ground = sensor.getBody();
        var circle = sensor.getShape();
        var center = ground.getWorldPoint(circle.getCenter());


        if (heroBody != null) {
            var position = heroBody.getPosition();

            var d = Vec2.sub(center, position);
            if (d.lengthSquared() > pl.Math.EPSILON * pl.Math.EPSILON) {
                d.normalize();
                var F = Vec2.mul(d, 300.0);
                heroBody.applyForce(F, position, false);
            }
            // --------------------

            if (testbed.activeKeys.right && testbed.activeKeys.left) {
              // MOVE THE HERO (check activeKeys for WADS and Arrows)
              // Apply NO FORCE
            } else if (testbed.activeKeys.right) {
              var F = Vec2(10, 0);
              heroBody.applyForce(F, position, false);
            } else if (testbed.activeKeys.left) {
              var F = Vec2(-10, 0);
              heroBody.applyForce(F, position, false);
            }
            
            if (testbed.activeKeys.up) {
                var F = Vec2(0, 100);
                heroBody.applyForce(F, position, false);
            }
        }

        // MOVE THE CAMERA
        // heroBody.Get
        var heroPos = heroBody.getPosition();
        // if (heroPos.x > testbed.x + 10) {
        //     testbed.x = heroPos.x - 10;
        // } else if (heroPos.x < testbed.x - 10) {
        //     testbed.x = heroPos.x + 10;
        // }

        testbed.x = lerp(testbed.x, heroPos.x, 0.006);
        testbed.y = lerp(testbed.y, heroPos.y - 20, 0.002);
    };

    return world;
});