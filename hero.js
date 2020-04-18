var pl = planck, Vec2 = pl.Vec2;

class Hero {
    constructor({body, friction}) {
        this.body = body;
        this.fixture = this.body.createFixture(pl.Circle(1.0), friction);
        this.body.setUserData({ onGround: false, touching: 0 });
    }

    get onGround() { return this.body.getUserData().onGround; }
    set onGround(onG) { 
        console.log("onGround: " + onG);
        this.body.getUserData().onGround = onG;
    }

    jump() {
        if (!this.onGround) return;
        console.log("JUMP");
        this.body.setLinearVelocity(Vec2(0, 40));
    }
}
