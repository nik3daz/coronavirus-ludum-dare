
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

  fixture.splash = (angle, s) => {
    angle = -angle + 2 * Math.PI;
    angle %= 2 * Math.PI
    springs[Math.floor(angle / 2 / Math.PI * springs.length)].velocity = s;
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