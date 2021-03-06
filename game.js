import { createAntigravFixture } from '/antigrav.js';

let renderStyle = {
  antigrav: { fill: "#00428e", stroke: "transparent" },
  wall: { fill: "#17192f", stroke: "transparent" }, // 14240b
  ground: { fill: "#17192f", stroke: "transparent" } // 1e2f15
};

// Use this during LevelDesign for faster loading
let sectionsToLoad = [
  true, // Section 1
  true, // Section 2
  true  // Section 3
];

let heroStartLoc = Vec2(-20, -20);
// let heroStartLoc = Vec2(10, 301);
// let heroStartLoc = Vec2(0, 200);

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
  // testbed.background = "linear-gradient(0deg, rgba(149,224,189,1) 0%, rgba(95,180,247,1) 38%, rgba(3,68,152,1) 100%)";
  // testbed.background = "linear-gradient(0deg, rgba(215,207,155,1) 0%, rgba(144,189,221,1) 38%, rgba(59,113,255,1) 100%)";
  testbed.background = "linear-gradient(0deg, rgba(97,182,200,1) 0%, rgba(103,162,204,1) 38%, rgba(41,82,190,1) 100%)";
  // testbed.background = "linear-gradient(0deg, rgba(144,92,82,1) 0%, rgba(128,56,102,1) 20%, rgba(61,5,101,1) 63%, rgba(10,2,32,1) 100%)";
  testbed.ratio = 8; // Pixel res
  gravity = -80;
  world = new pl.World(Vec2(0, gravity));

  hero = new Hero({
    body: world.createDynamicBody(heroStartLoc),
    friction: 1
  });

  ground = world.createBody(Vec2(0, -88));
  groundSize = Vec2(169, 64);
  groundFixture = ground.createFixture(pl.Box(groundSize.x, groundSize.y), 1.0);

  groundFixture.render = renderStyle['ground'];
  groundFixtures.push(groundFixture);

  // light-red: #ff9fa0
  hero.body.render = { fill: "#ffe79e", stroke: "transparent" }; // 
  
  let wallHeight = 2047; // 2048 is the max for some reason?
  let wallWidth = 64;
  ground.createFixture(pl.Box(wallWidth, wallHeight, Vec2(groundSize.x-wallWidth, wallHeight+groundSize.y-1)), 1.0)
    .render = renderStyle["wall"];
  ground.createFixture(pl.Box(wallWidth, wallHeight, Vec2(wallWidth-groundSize.x, wallHeight+groundSize.y-1)), 1.0)
    .render = renderStyle["wall"];

  // -------------------------------------
    // loadRandomCircles({ground: ground, groundHeight:groundSize.y});
  if (sectionsToLoad.length > 0 && sectionsToLoad[0])
    loadLevelData({ lvlDat: section1Data, groundHeight: groundSize.y });
  if (sectionsToLoad.length > 1 && sectionsToLoad[1])
    loadLevelData({ lvlDat: section2Data, groundHeight: groundSize.y });
  if (sectionsToLoad.length > 2 && sectionsToLoad[2])
    loadLevelData({ lvlDat: section3Data, groundHeight: groundSize.y });

  // -------------------------------------

  // Implement contact listener.
  world.on("begin-contact", function(contact) {
    let fixtureA = contact.getFixtureA();
    let fixtureB = contact.getFixtureB();
    let antigrav;
    if (fixtureB.gameObjectType === 'antigrav')
      antigrav = fixtureB;

    if (fixtureA.gameObjectType === 'antigrav')
      antigrav = fixtureA;

    let heroFixture;
    if (fixtureB === hero.fixture)
      heroFixture = fixtureB;

    if (fixtureA === hero.fixture)
      heroFixture = fixtureA;

    for (let i = 0; i < groundFixtures.length; i++) {
      if (groundFixtures[i] === fixtureA && fixtureB === hero.fixture ||
          groundFixtures[i] === fixtureB && fixtureA === hero.fixture) {
        hero.onGround = true;
        break;
      }
    }

    if (antigrav) {
      let userData = hero.body.getUserData();
      let ag_shape = antigrav.getShape();
      // console.log(ag_shape);
      if (ag_shape.m_type === 'circle') {
        antigrav.splash(hero, antigrav);
      }
      
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
      if (groundFixtures[i] === fixtureA && fixtureB === hero.fixture ||
          groundFixtures[i] === fixtureB && fixtureA === hero.fixture) {
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
    let antigrav;
    if (fixtureB.gameObjectType === 'antigrav')
      antigrav = fixtureB;

    if (fixtureA.gameObjectType === 'antigrav')
      antigrav = fixtureA;

    if (antigrav) {
      let userData = hero.body.getUserData();
      let ag_shape = antigrav.getShape();
      if (ag_shape.m_type === 'circle') {
        // Apply forces to Circle Shaoes
        antigrav.splash(hero, antigrav);
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

        if (hero.body.getUserData().ignoreAntigrav) {
          hero.body.setGravityScale(0.4);
        } else {
          hero.body.setGravityScale(-0.8);
        }
          

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

    for (let a of antigravList) {
      a.updateSprings();
      a.propagateSprings();
    }

    // MOVE THE CAMERA
    let heroPos = hero.body.getPosition();
    testbed.x = lerp(testbed.x, heroPos.x, 0.08);
    testbed.y = lerp(testbed.y, Math.min(-heroPos.y, 0), 0.08);
  };

  return world;
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

// =================================================

let section1YDelta = 0;
let section1Data = [
  { shape: "rect", type: "antigrav", pos: [0, 23 + section1YDelta], size: [50, 12], rotation: 0 },
  { shape: "circle", type: "antigrav", pos: [-20, 0 + section1YDelta], radius: 2 },
  
  { shape: "circle", type: "antigrav", pos: [22, 56 + section1YDelta], radius: 6 },
  { shape: "circle", type: "antigrav", pos: [0, 82 + section1YDelta], radius: 16 },
  { shape: "circle", type: "antigrav", pos: [-14, 132 + section1YDelta], radius: 24 },

  { shape: "rect", type: "ground", pos: [18, 170+section1YDelta], size: [24, 2] },
  { shape: "rect", type: "wall", pos: [-4, 173+section1YDelta], size: [2, 2] },
  { shape: "rect", type: "wall", pos: [-4, 203+section1YDelta], size: [2, 8] },
  { shape: "rect", type: "ground", pos: [-22, 210+section1YDelta], size: [20, 2] },

  { shape: "rect", type: "wall", pos: [-25, 195+section1YDelta], size: [25, 2], rotation: 35*Math.PI/180 },
  { shape: "circle", type: "antigrav", pos: [33, 184 + section1YDelta], radius: 4 },
  { shape: "circle", type: "antigrav", pos: [17, 198 + section1YDelta], radius: 6 },
  { shape: "circle", type: "antigrav", pos: [4, 208 + section1YDelta], radius: 3 },

  // { shape: "rect", type: "wall", pos: [0, 300+section1YDelta], size: [16, 0.8] },
  // { shape: "circle", type: "antigrav", pos: [0, 300 + section1YDelta], radius: 32 },
  
  { shape: "rect", type: "wall", pos: [-31.2, 244 + section1YDelta], size: [0.8, 16], rotation: 0 },
  { shape: "circle", type: "antigrav", pos: [-40, 228 + section1YDelta], radius: 8 },
  { shape: "rect", type: "antigrav", pos: [-40, 244 + section1YDelta], size: [8, 16], rotation: 0 }, // // HARD path1
  { shape: "circle", type: "antigrav", pos: [-40, 260 + section1YDelta], radius: 8 },

  { shape: "rect", type: "ground", pos: [7.7, 230+section1YDelta], size: [36, 2] },
  { shape: "rect", type: "ground", pos: [7.7, 310+section1YDelta], size: [36, 2] },  
  { shape: "circle", type: "antigrav", pos: [-36, 290 + section1YDelta], radius: 4 }

];

let section2YDelta = 340;
let section2Data = [
  { shape: "circle", type: "antigrav", pos: [36, -28+section2YDelta], radius: 3 },
  { shape: "circle", type: "antigrav", pos: [34, -24+section2YDelta], radius: 3 },
  { shape: "circle", type: "antigrav", pos: [31, -20+section2YDelta], radius: 3 },
  { shape: "circle", type: "antigrav", pos: [28, -16+section2YDelta], radius: 3 },

  { shape: "circle", type: "antigrav", pos: [11, section2YDelta], radius: 9 },
  { shape: "circle", type: "antigrav", pos: [-10, 24 + section2YDelta], radius: 12 },
  { shape: "circle", type: "antigrav", pos: [-22, 48 + section2YDelta], radius: 8 },

  { shape: "circle", type: "antigrav", pos: [-36, 67 + section2YDelta], radius: 3 },
  { shape: "circle", type: "antigrav", pos: [-32, 79 + section2YDelta], radius: 3.5 },
  { shape: "circle", type: "antigrav", pos: [-18, 75 + section2YDelta], radius: 7 },
  { shape: "circle", type: "antigrav", pos: [-34, 92 + section2YDelta], radius: 4.5 },
  { shape: "circle", type: "antigrav", pos: [-28, 110 + section2YDelta], radius: 4 },

  { shape: "circle", type: "antigrav", pos: [-10, 136 + section2YDelta], radius: 17 },

  { shape: "rect", type: "ground", pos: [-25, 178 + section2YDelta], size: [16, 2], rotation: 0 },
];

let section3YDelta = 20 + section2YDelta;
let section3Data = [
  // Upward SLIDE
  { shape: "rect", type: "wall", pos: [-7.4, 176.4+section3YDelta], size: [28, 0.8], rotation: -10*Math.PI/180 },
  { shape: "rect", type: "wall", pos: [4, 183.1+section3YDelta], size: [38, 0.4], rotation: -10*Math.PI/180 },
  { shape: "rect", type: "ground", pos: [4.14, 183.8+section3YDelta], size: [38, 0.4], rotation: -10*Math.PI/180 },
  { shape: "rect", type: "antigrav", pos: [0, 179.5+section3YDelta], size: [42, 4.2], rotation: -10*Math.PI/180 },
  { shape: "circle", type: "antigrav", pos: [31, 163.5+section3YDelta], radius: 15 },
  { shape: "circle", type: "antigrav", pos: [-34, 195+section3YDelta], radius: 14 }
];

function loadLevelData({ lvlDat, groundHeight }) {
  lvlDat.forEach(element => {
    let newObj = null;
    let pos = Vec2(element.pos[0], element.pos[1] + groundHeight);
    let shape;

    if (element.shape === "circle") {
      shape = pl.Circle(pos, element.radius);
    } else if (element.shape === "rect") {
      let rotation = element.rotation ?? 0;
      shape = pl.Box(element.size[0], element.size[1], pos, rotation);
    } else {
      let verts = Vec2[element.vertices.size];
      // TODO: Populate the array
      shape = pl.Polygon(verts);
    }

    if (element.type === "antigrav") {
      newObj = createAntigravFixture(shape, ground);
      antigravList.push(newObj);
    } else if (element.type === "wall" || element.type === "ground") {
      newObj = ground.createFixture({ shape: shape }, 1.0);
      if (element.type === "ground") { groundFixtures.push(newObj); }
    }

    if (newObj != null) {
      newObj.gameObjectType = element.type;
      newObj.render = renderStyle[element.type];
    }
  });
}

// =================================================

document.addEventListener("keydown", e => {
  if (e.key == "ArrowUp" || e.key == "w") {
    hero.jump();
  } else if (e.key == "ArrowDown" || e.key == "s") {
    hero.setIgnoreAntigrav(true);
  }
});

document.addEventListener("keyup", e => {
  if (e.key == "ArrowDown" || e.key == "s") {
    hero.setIgnoreAntigrav(false);
  }
});

// =================================================