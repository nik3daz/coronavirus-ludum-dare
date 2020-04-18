function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

var hero;
var jellies = [];

planck.testbed(function(testbed) {
  let gravity = -80;
  var pl = planck,
    Vec2 = pl.Vec2;
  var world = new pl.World(Vec2(0, gravity));


  hero = new Hero({
    body: world.createDynamicBody(Vec2(-20.0 + 3.0 * 3, 12.0)),
    friction: 1
  });
  var ground = world.createBody();
  let groundFixture = ground.createFixture(
    pl.Edge(Vec2(-200.0, 0.0), Vec2(200.0, 0.0)),
    1.0
  );

  for (let h = 0; h < 10; h++) {
    for (let i = 0; i < 10; i++) {
      let j = ground.createFixture({
        shape: pl.Circle(Vec2(Math.random() * 50, Math.random() * 100 + h * 100), 8.0),
        isSensor: true,
      });
      j.render = {fill: 'blue', stroke:'transparent'};
      j.gameObjectType = 'jelly';
      jellies.push(j);
    }
  }



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

    if (fixtureA.gameObjectType === 'jelly') {
      var userData = fixtureB.getBody().getUserData();
      if (userData) {
        userData.touching += 1;
      }
    }

    if (fixtureB.gameObjectType === 'jelly') {
      var userData = fixtureA.getBody().getUserData();
      if (userData) {
        userData.touching += 1;
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

    if (fixtureA.gameObjectType === 'jelly') {
      var userData = fixtureB.getBody().getUserData();
      if (userData) {
        userData.touching -= 1;
      }
    }

    if (fixtureB.gameObjectType === 'jelly') {
      var userData = fixtureA.getBody().getUserData();
      if (userData) {
        userData.touching -= 1;
      }
    }
  });

  testbed.step = function() {
    if (hero.body != null) {
      var position = hero.body.getPosition();
      hero.body.setLinearDamping(0);

      if (hero.body.getUserData().touching) {
        if (hero.body.getLinearVelocity().y < 0)
          hero.body.setLinearDamping(0.4);

        hero.body.setGravityScale(-0.8);

      } else {
        hero.body.setGravityScale(1);
      }
      // --------------------

      if (testbed.activeKeys.right && testbed.activeKeys.left) {
        // MOVE THE HERO (check activeKeys for WADS and Arrows)
        // Apply NO FORCE
      } else if (testbed.activeKeys.right) {
        var F = Vec2(400, 0);
        hero.body.applyForce(F, position, true);
      } else if (testbed.activeKeys.left) {
        var F = Vec2(-400, 0);
        hero.body.applyForce(F, position, true);
      }

      let hero_v = hero.body.getLinearVelocity();
      if (Math.abs(hero_v.x) > 30) {
          hero_v.x = Math.sign(hero_v.x) * 30;
      }
    //   if (Math.abs(hero_v.y) > 60) {
    //     hero_v.y = Math.sign(hero_v.y) * 60;
    // }
      // hero_v.x *= 0.99
      hero.body.setLinearVelocity(hero_v);
    }

    // MOVE THE CAMERA
    // hero.body.Get
    var heroPos = hero.body.getPosition();
    // if (heroPos.x > testbed.x + 10) {
    //     testbed.x = heroPos.x - 10;
    // } else if (heroPos.x < testbed.x - 10) {
    //     testbed.x = heroPos.x + 10;
    // }

    testbed.x = lerp(testbed.x, heroPos.x, 0.08);
    testbed.y = lerp(testbed.y, -heroPos.y, 0.08);
  };

  return world;
});

document.addEventListener("keydown", e => {
  if (e.key == "ArrowUp" || e.key == "w") {
    // hero.body.setLinearVelocity(planck.Vec2(0, 40));
    hero.jump();
  }
});
