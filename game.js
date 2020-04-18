function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

var hero;

planck.testbed(function(testbed) {
  let gravity = -80;
  var pl = planck,
    Vec2 = pl.Vec2;
  var world = new pl.World(Vec2(0, gravity));

  // var bodies = [];
  // var touching = [];

  var ground = world.createBody();
  let groundFixture = ground.createFixture(
    pl.Edge(Vec2(-200.0, 0.0), Vec2(200.0, 0.0)),
    20.0
  );

  var jelly = ground.createFixture({
    shape: pl.Circle(Vec2(0.0, 10.0), 5.0),
    isSensor: true
  });

  hero = new Hero({
    body: world.createDynamicBody(Vec2(-20.0 + 3.0 * 3, 12.0)),
    friction: 2
  });

  // for (var i = 0; i < COUNT; ++i) {
  //     if (i == 3) continue;
  //     touching[i] = { touching: false };

  //     bodies[i] = world.createDynamicBody(Vec2(-10.0 + 3.0 * i, 20.0));
  //     bodies[i].setUserData(touching[i])
  //     bodies[i].createFixture(circle, 1.0);
  // }

  // Implement contact listener.
  world.on("begin-contact", function(contact) {
    var fixtureA = contact.getFixtureA();
    var fixtureB = contact.getFixtureB();

    if (
      (fixtureA == hero.fixture && fixtureB == groundFixture) ||
      (fixtureB == hero.fixture && fixtureA == groundFixture)
    ) {
      hero.onGround = true;
    }

    if (fixtureA === jelly) {
      var userData = fixtureB.getBody().getUserData();
      if (userData) {
        userData.touching = true;
      }
    }

    if (fixtureB === jelly) {
      var userData = fixtureA.getBody().getUserData();
      if (userData) {
        userData.touching = true;
      }
    }
  });

  // Implement contact listener.
  world.on("end-contact", function(contact) {
    var fixtureA = contact.getFixtureA();
    var fixtureB = contact.getFixtureB();

    if (
      (fixtureA === hero.fixture && fixtureB === groundFixture) ||
      (fixtureB === hero.fixture && fixtureA === groundFixture)
    ) {
      hero.onGround = false;
    }

    if (fixtureA === jelly) {
      var userData = fixtureB.getBody().getUserData();
      if (userData) {
        userData.touching = false;
      }
    }

    if (fixtureB === jelly) {
      var userData = fixtureA.getBody().getUserData();
      if (userData) {
        userData.touching = false;
      }
    }
  });

  testbed.step = function() {
    var ground = jelly.getBody();
    var circle = jelly.getShape();
    var center = ground.getWorldPoint(circle.getCenter());

    if (hero.body != null) {
      var position = hero.body.getPosition();

      var d = Vec2.sub(center, position);
      var distance = d.lengthSquared();
      if (distance < 30) {
        d.normalize();
        var F = Vec2.mul(d, 300.0);
        hero.body.applyForce(F, position, false);
      }
      // --------------------

      if (testbed.activeKeys.right && testbed.activeKeys.left) {
        // MOVE THE HERO (check activeKeys for WADS and Arrows)
        // Apply NO FORCE
      } else if (testbed.activeKeys.right) {
        var F = Vec2(600, 0);
        hero.body.applyForce(F, position, false);
      } else if (testbed.activeKeys.left) {
        var F = Vec2(-600, 0);
        hero.body.applyForce(F, position, false);
      }

      let hero_v = hero.body.getLinearVelocity();
      if (hero_v.x > 20) {
        hero.body.setLinearVelocity(Vec2(20, hero_v.y));
      }
    }

    // MOVE THE CAMERA
    // hero.body.Get
    var heroPos = hero.body.getPosition();
    // if (heroPos.x > testbed.x + 10) {
    //     testbed.x = heroPos.x - 10;
    // } else if (heroPos.x < testbed.x - 10) {
    //     testbed.x = heroPos.x + 10;
    // }

    testbed.x = lerp(testbed.x, heroPos.x, 0.006);
    // testbed.y = lerp(testbed.y, heroPos.y - 20, 0.002);
  };

  return world;
});

document.addEventListener("keydown", e => {
  if (e.key == "ArrowUp" || e.key == "w") {
    // hero.body.setLinearVelocity(planck.Vec2(0, 40));
    hero.jump();
  }
});
