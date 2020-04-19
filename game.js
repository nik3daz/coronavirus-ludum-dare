let renderStyle = {
  "antigrav" : { fill: "blue", stroke: "transparent" },
  "wall" : { fill: "#000", stroke: "transparent" },
  "ground" : { fill: "#000", stroke: "transparent" }
};

let lvlData1 = [
  { shape: "circle", type: "antigrav", pos: [11, 0], radius: 9 },
  { shape: "circle", type: "antigrav", pos: [-10, 24], radius: 12 },
  { shape: "circle", type: "antigrav", pos: [-30, 40], radius: 8 },

  { shape: "circle", type: "antigrav", pos: [-36, 67], radius: 3 },
  { shape: "circle", type: "antigrav", pos: [-35, 79], radius: 3.5 },
  { shape: "circle", type: "antigrav", pos: [-22, 77], radius: 7 },
  { shape: "circle", type: "antigrav", pos: [-38, 92], radius: 5 },
  { shape: "circle", type: "antigrav", pos: [-28, 110], radius: 4 },

  // { shape: "rect", type: "antigrav", pos: [-30, 30], size: [1, 3] },
  // { shape: "circle", type: "antigrav", pos: [-2, 3], radius: 8 },
  { shape: "rect", type: "wall", pos: [31.2, 62], size: [0.8, 32], rotation: 0 },
  { shape: "circle", type: "antigrav", pos: [40, 30], radius: 8 }, // HARD path1
  { shape: "rect", type: "antigrav", pos: [40, 62], size: [8, 32], rotation: 0 }, // // HARD path1
  { shape: "circle", type: "antigrav", pos: [40, 94], radius: 8 },
  // { shape: "polygon", type: "wall", pos: [-2, 3], vertices: [1, 2] }

  { shape: "circle", type: "antigrav", pos: [-10, 136], radius: 17 },

  { shape: "rect", type: "ground", pos: [-31, 162], size: [10, 2], rotation: 0 },
  // ===========================================================================
  


];

pl = planck,
Vec2 = pl.Vec2;

let antigravList = [];
let groundFixtures = [];
let gravity;
let world;
let ground;
let groundSize;
let groundFixture;
let hero;

planck.testbed(function (testbed) {
  // testbed.background = "#222222";
  // testbed.background = "linear-gradient(0deg, rgba(251,252,218,1) 0%, rgba(211,248,235,1) 60%, rgba(123,239,247,1) 100%)";
  testbed.background = "linear-gradient(0deg, rgba(144,92,82,1) 0%, rgba(128,56,102,1) 20%, rgba(61,5,101,1) 63%, rgba(10,2,32,1) 100%)";
  testbed.ratio = 16; // Pixel res
  gravity = -80;
  world = new pl.World(Vec2(0, gravity));
  ground = world.createBody(Vec2(0, -88));
  groundSize = Vec2(48, 64);
  groundFixture = ground.createFixture(pl.Box(groundSize.x, groundSize.y), 1.0);
  hero = new Hero({
    body: world.createDynamicBody(Vec2(0, -10)),
    friction: 1
  });

  groundFixture.render = renderStyle['ground'];
  groundFixtures.push(groundFixture);
  
  let wallHeight = 2047; // 2048 is the max for some reason?
  let wallStyle = { fill: "000", stroke: "transparent" };
  ground.createFixture(pl.Box(4, wallHeight, Vec2(groundSize.x-4, wallHeight+groundSize.y-1)), 1.0)
    .render = wallStyle;
  ground.createFixture(pl.Box(4, wallHeight, Vec2(4-groundSize.x, wallHeight+groundSize.y-1)), 1.0)
    .render = wallStyle;

  // -------------------------------------
    // loadRandomCircles({ground: ground, groundHeight:groundSize.y});
  loadLevelData({ lvlDat: lvlData1, ground: ground, groundHeight:groundSize.y });
  // -------------------------------------

  // Implement contact listener.
  world.on("begin-contact", function(contact) {
    let fixtureA = contact.getFixtureA();
    let fixtureB = contact.getFixtureB();

    for (let i = 0; i < groundFixtures.length; i++) {
      if (groundFixtures[i] == fixtureA && fixtureB === hero.fixture ||
          groundFixtures[i] == fixtureB && fixtureA === hero.fixture) {
        hero.onGround = true;
        break;
      }
    }

    if (fixtureA.gameObjectType === 'antigrav') {
      let userData = fixtureB.getBody().getUserData();
      if (userData) {
        userData.touching += 1;
      }
    }

    if (fixtureB.gameObjectType === 'antigrav') {
      let userData = fixtureA.getBody().getUserData();
      if (userData) {
        userData.touching += 1;
      }
    }
  });

  // Implement contact listener.
  world.on("end-contact", function(contact) {
    let fixtureA = contact.getFixtureA();
    let fixtureB = contact.getFixtureB();

    for (let i = 0; i < groundFixtures.length; i++) {
      if (groundFixtures[i] == fixtureA && fixtureB === hero.fixture ||
          groundFixtures[i] == fixtureB && fixtureA === hero.fixture) {
        hero.onGround = false;
        break;
      }
    }

    if (fixtureA.gameObjectType === 'antigrav') {
      let userData = fixtureB.getBody().getUserData();
      if (userData) {
        userData.touching -= 1;
      }
    }

    if (fixtureB.gameObjectType === 'antigrav') {
      let userData = fixtureA.getBody().getUserData();
      if (userData) {
        userData.touching -= 1;
      }
    }
  });

  testbed.step = function() {
    // console.log (testbed.width);
    
    if (hero.body != null) {
      let position = hero.body.getPosition();
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
        let F = Vec2(400, 0);
        hero.body.applyForce(F, position, true);
      } else if (testbed.activeKeys.left) {
        let F = Vec2(-400, 0);
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
    let heroPos = hero.body.getPosition();
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

function loadRandomCircles({ groundHeight }) {
  for (let h = 0; h < 10; h++) {
    for (let i = 0; i < 10; i++) {
      let pos = Vec2(-25 + Math.random() * 50, Math.random() * 100 + h * 100);
      pos.y += groundHeight;
      let j = ground.createFixture({
        shape: pl.Circle(pos, 8.0),
        isSensor: true
      });
      j.render = { fill: "blue", stroke: "transparent" };
      j.gameObjectType = "antigrav";
      antigravList.push(j);
    }
  }
}

function loadLevelData({ lvlDat, groundHeight }) {
  lvlDat.forEach(element => {
    let newObj = null;
    let pos = Vec2(element.pos[0], element.pos[1] + groundHeight);
    let shape;

    if (element.shape === "circle") {
      shape = pl.Circle(pos, element.radius);
    } else if (element.shape === "rect") {
      shape = pl.Box(element.size[0], element.size[1], pos);
    } else {
      let verts = Vec2[element.vertices.size];
      // TODO: Populate the array
      shape = pl.Polygon(verts);
    }

    if (element.type === "antigrav") {
      newObj = createAntigravFixture(shape);
      antigravList.push(newObj);
    } else if (element.type === "wall" || element.type === "ground") {
      newObj = ground.createFixture({ shape: shape }, 1.0);
      groundFixtures.push(newObj);
    }

    if (newObj != null) {
      newObj.gameObjectType = element.type;
      newObj.render = renderStyle[element.type];
    }
  });
}

function createAntigravFixture(shape) {
  return ground.createFixture({ shape: shape, isSensor: true });
}