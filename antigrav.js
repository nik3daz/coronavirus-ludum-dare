export function createAntigravFixture(shape, ground) {
  let fixture = ground.createFixture({ shape: shape, isSensor: true });

  let SPREAD = 0.02;
  let springs = [];
  let targetHeight = shape.getRadius();
  for (let i = 0; i < 100; i++) {
    springs.push({
      position: targetHeight,
      velocity: 0,
    });
  }

  fixture.updateSprings = () => {
    for (let s of springs) {
      let k = 0.025;
      let x = s.position - targetHeight;
      let acc = -k * x;
      
      s.velocity += acc - s.velocity * 0.0025;
      s.position += s.velocity;
    }
  };

  fixture.propagateSprings = () => {
    for (let i = 0; i < 8; i++) {
      let ldelta = [];
      let rdelta = [];
      for (let s = 0 ; s < springs.length; s++) {
        ldelta.push(SPREAD * (springs[s].position - springs[(s - 1 + springs.length) % springs.length].position));
        rdelta.push(SPREAD * (springs[s].position - springs[(s + 1) % springs.length].position));
      }
      for (let s = 0 ; s < springs.length; s++) {
        let l = springs[(s - 1 + springs.length) % springs.length];
        let r = springs[(s + 1) % springs.length];
        l.position += ldelta[s];
        l.velocity += ldelta[s];
        r.position += rdelta[s];
        r.velocity += rdelta[s];
      }
    }
  };

  fixture.splash = (hero, antigrav) => {
    let ag_p = antigrav.getShape().getCenter();
    ag_p = Vec2.add(ag_p, antigrav.getBody().getTransform().p);
    let h_p = hero.body.getPosition();
    let d = Vec2.sub(h_p, ag_p);
    let angle = Math.atan2(d.y, d.x);

    let h_v = hero.body.getLinearVelocity();
    let h_va = Math.atan2(h_v.y, h_v.x);
    let direction = h_v.length() * Math.sin(h_va - angle) / 50;
    let impact = h_v.length() * Math.cos(h_va - angle) / 50;
    impact = Math.max(Math.min(impact, 5), -5);
    // console.log(direction);


    angle = -angle + 2 * Math.PI;
    angle %= 2 * Math.PI
    let idx = Math.floor(angle / 2 / Math.PI * springs.length);
    let SPREAD = 4;
    for (let i = idx - SPREAD; i <= idx + SPREAD; i++) {
      let angle = (i - idx) / SPREAD * Math.PI;
      let normalized_i = (i + springs.length) % springs.length;
      springs[normalized_i].velocity = impact * Math.cos(angle) + Math.sign(i - idx) * Math.cos(angle) * direction;
    }
  };

  if (shape.getType() !== 'circle')
    return fixture;

  fixture.drawCallback = (fixture, options, Stage) => {
    // console.log(options);

    let shape = fixture.getShape();
    var lw = options.lineWidth;
    var ratio = options.ratio;
    var r = shape.m_radius;
    var cx = r + lw;
    var cy = r + lw;
    var w = r * 2 + lw * 2;
    var h = r * 2 + lw * 2;
    var texture = new Stage.Texture();
    
    texture.draw = function(ctx) {
        // this.size(w, h, ratio);
        // ctx.scale(ratio, ratio);

        ctx.beginPath();
        for (let i = 0; i < springs.length; i++) {
          let angle = i / springs.length * 2 * Math.PI;
          let sx = cx + springs[i].position * Math.cos(angle);
          let sy = cy + springs[i].position * Math.sin(angle);
          if (i == 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        // ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        if (options.fillStyle) {
            ctx.fillStyle = options.fillStyle;
            ctx.fill();
        }
        ctx.lineTo(cx, cy);
        ctx.lineWidth = options.lineWidth;
        ctx.strokeStyle = options.strokeStyle;
        ctx.stroke();
    };
    var image = Stage.image(texture).offset(shape.m_p.x - cx, -shape.m_p.y - cy);
    var node = Stage.create().append(image);
    return node;
  };

  return fixture;
}