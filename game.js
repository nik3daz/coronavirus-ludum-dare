var lvlData1 = [
  { shape: "circle", pos: [0, 0], radius: 8 },
  { shape: "circle", pos: [0, 0], radius: 8 },
  { shape: "rect", pos: [0, 0], size: [0, 0] }
];

var hero;
var jellies = [];

function loadRandomCircles({ground}) {
  for (let h = 0; h < 10; h++) {
    for (let i = 0; i < 10; i++) {
      var pos = Vec2(-25 + Math.random() * 50, Math.random() * 100 + h * 100);
      pos.y += 65;
      let j = ground.createFixture({
        shape: pl.Circle(pos, 8.0),
        isSensor: true
      });
      j.render = { fill: "blue", stroke: "transparent" };
      j.gameObjectType = "jelly";
      jellies.push(j);
    }
  }
}

function loadLevelData({lvlDat, ground}) {
  lvlDat.forEach(element => {

  });
}

planck.testbed(function(testbed) {
  // testbed.background = "#222222";
  // testbed.background = "linear-gradient(0deg, rgba(251,252,218,1) 0%, rgba(211,248,235,1) 60%, rgba(123,239,247,1) 100%)";
  testbed.background = "linear-gradient(0deg, rgba(144,92,82,1) 0%, rgba(128,56,102,1) 20%, rgba(61,5,101,1) 63%, rgba(10,2,32,1) 100%)";
  testbed.ratio = 16; // Pixel res

  let gravity = -80;
  var pl = planck,
    Vec2 = pl.Vec2;
  var world = new pl.World(Vec2(0, gravity));


  hero = new Hero({
    body: world.createDynamicBody(Vec2(0, -10)),
    friction: 1
  });

  let groundSize = Vec2(48, 64);
  var ground = world.createBody(Vec2(0,-88));
  let groundFixture = ground.createFixture(pl.Box(groundSize.x, groundSize.y), 1.0);
  groundFixture.render = { fill: "#000", stroke: "transparent" };
  
  let wallHeight = 2047; // 2048 is the max for some reason?
  let wallStyle = { fill: "000", stroke: "transparent" };
  ground.createFixture(pl.Box(2, wallHeight, Vec2(groundSize.x-2, wallHeight+groundSize.y-1)), 1.0)
    .render = { fill: "000", stroke: "transparent" };
  ground.createFixture(pl.Box(2, wallHeight, Vec2(2-groundSize.x, wallHeight+groundSize.y-1)), 1.0)
    .render = { fill: "000", stroke: "transparent" };

  loadRandomCircles({ground: ground});
  // loadLevelData({ lvlDat: lvlData1, ground: ground });


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
    // console.log (testbed.width);
    
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
    var heroPos = hero.body.getPosition();
    testbed.x = lerp(testbed.x, heroPos.x, 0.08);
    testbed.y = lerp(testbed.y, Math.min(-heroPos.y, 0), 0.08);
  };

  return world;
});

document.addEventListener("keydown", e => {
  if (e.key == "ArrowUp" || e.key == "w") {
    // hero.body.setLinearVelocity(planck.Vec2(0, 40));
    hero.jump();
  }
});

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}