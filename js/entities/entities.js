game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "player",
                width: 64,
                height: 64,
                spritewidth: "64",
                spriteheight: "64",
                getShape: function() {
                    //sets how high my charecters hit box is and how wide
                    return(new me.Rect(0, 0, 20, 60)).toPolygon();
                }
            }]);

        this.type = "PlayerEntity";
        this.health = 20;
        this.body.setVelocity(5, 25);
        //this keeps track oof which direction your charecter is going
        this.facing = "right";
        //checks what time it is
        this.now = new Date().getTime();
        this.lastHit = this.now;
        this.lastAttack = new Date().getTime();
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

        //this adds the animations that i want for my charecter when he does a specific task
        this.renderable.addAnimation("idle", [78]);
        this.renderable.addAnimation("walk", [117, 118, 119, 120, 121, 122, 123, 124, 125]);
        this.renderable.addAnimation("attack", [65, 66, 67, 68, 69, 70, 71, 72], 80);

        this.renderable.setCurrentAnimation("idle");

    },
    update: function(delta) {
        this.now = new Date().getTime();
        if (me.input.isKeyPressed("right")) {
            //adds to the position of my x by the velocity defined above in
            //set velocity() and multiplying it by me.timer.tick.
            //me.timer.tick makes the movement look smooth
            this.body.vel.x += this.body.accel.x * me.timer.tick;
            this.flipX(true);
            this.facing = "right";
        } else if (me.input.isKeyPressed("left")) {
            this.body.vel.x -= this.body.accel.x * me.timer.tick;
            this.flipX(false);
            this.facing = "left";
        } else {
            this.body.vel.x = 0;
        }

        if (me.input.isKeyPressed("jump") && !this.jumping && !this.falling) {
            this.jumping = true;
            this.body.vel.y -= this.body.accel.y * me.timer.tick;
        } else if (this.body.vel.y === 0) {
            this.jumping = false;
        }


        if (me.input.isKeyPressed("attack")) {
            if (!this.renderable.isCurrentAnimation("attack")) {
                //sets the current animation to attack and then idle after it is done
                this.renderable.setCurrentAnimation("attack", "idle");
                //makes it so that the next time we start this sequence we 
                //begin from the first animation not wherever we left off
                //when we switched to another animation
                this.renderable.setAnimationFrame();
            }
        }

        else if (this.body.vel.x !== 0 && !this.renderable.isCurrentAnimation("attack")) {
            if (!this.renderable.isCurrentAnimation("walk")) {
                this.renderable.setCurrentAnimation("walk");

            }
        } else if (!this.renderable.isCurrentAnimation("attack")) {
            this.renderable.setCurrentAnimation("idle");
        }



        me.collision.check(this, true, this.collideHandler.bind(this), true);
        this.body.update(delta);

        this._super(me.Entity, "update", [delta]);
        return true;
    },
    loseHealth: function(damage) {
        this.health = this.health - damage;
    },
    collideHandler: function(response) {

        if (response.b.type === 'EnemyBaseEntity') {
            var ydif = this.pos.y - response.b.pos.y;
            var xdif = this.pos.x - response.b.pos.x;

            if (ydif < -40 && xdif < 70 && xdif > -5) {
                this.body.falling = false;
                this.body.vel.y = -1;
            }
            //this stops my player from walking to the left
            else if (xdif > -32 && this.facing === 'right' && xdif < 0) {
                this.body.vel.x = 0;
                // keeps my player from nudging the base
                this.pos.x = this.pos.x - 1;
            } else if (xdif < 97 && this.facing === 'left' && xdif > 0) {
                this.body.vel.x = 0;
                this.pos.x = this.pos.x + 1;
            }

            if (this.renderable.isCurrentAnimation("attack") && ((this.now - this.lastHit) >= 1000)) {
                this.lastHit = this.now;
                response.b.loseHealth();
            }
        }else if(response.b.type==='EnemyCreep') {
            var xdif = this.pos.x - response.b.pos.x;
            var ydif = this.pos.y - response.b.pos.y;
            
            if(xdif>0) {
                this.pos.x = this.pos.x + 1;
                 if(this.facing=== "left") {
                    this.body.vel.x = 0;
                }
            }else {
                this.pos.x = this.pos.x - 1;
                if(this.facing=== "right") {
                    this.body.vel.x = 0;
                }
            }
            
            if(this.renderable.isCurrentAnimation("attack") && (this.now - this.lastHit >= 1000)
                    && (Math.abs(ydif) <=40) && 
                    (((xdif>0) && this.facing==="left") || ((xdif<0) && this.facing==="right"))
                    ) {
                response.b.loseHealth(1);
                //updates the timers
            this.lastHit = this.now;
            }
        }
    }
});

game.PlayerBaseEntity = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "tower",
                width: 100,
                height: 100,
                spritewidth: "100",
                spriteheight: "100",
                getShape: function() {
                    return (new me.Rect(0, 0, 100, 75)).toPolygon();
                }
            }]);
        this.broken = false;
        this.health = 10;
        this.alwaysUpdate = true;
        this.body.onCollision = this.onCollision.bind(this);
        this.type = "PlayerBase";

//adds the animation
        this.renderable.addAnimation("idle", [0]);
        this.renderable.addAnimation("broken", [1]);
        this.renderable.setCurrentAnimation("idle");
    },
    update: function(delta) {
        if (this.health <= 0) {
            this.broken = true;
            this.renderable.setCurrentAnimation("broken");
        }
        this.body.update(delta);

        this._super(me.Entity, "update", [delta]);
        return true;
    },
    loseHealth: function(damage) {
        this.health = this.health - damage;
    },
    onCollision: function() {

    }

});

game.EnemyBaseEntity = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "tower",
                width: 100,
                height: 100,
                spritewidth: "100",
                spriteheight: "100",
                getShape: function() {
                    return (new me.Rect(0, 0, 100, 75)).toPolygon();
                }
            }]);
        this.broken = false;
        this.health = 10;
        this.alwaysUpdate = true;
        this.body.onCollision = this.onCollision.bind(this);

        this.type = "EnemyBaseEntity";

        this.renderable.addAnimation("idle", [0]);
        this.renderable.addAnimation("broken", [1]);
        this.renderable.setCurrentAnimation("idle");
    },
    update: function(delta) {
        if (this.health <= 0) {
            this.broken = true;
            this.renderable.setCurrentAnimation("broken");
        }
        this.body.update(delta);

        this._super(me.Entity, "update", [delta]);
        return true;
    },
    onCollision: function() {

    },
    loseHealth: function() {
        this.health--;
    }

});

game.EnemyCreep = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "creep1",
                width: 32,
                height: 64,
                spritewidth: "32",
                spriteheight: "64",
                getShape: function() {
                    return (new me.Rect(0, 0, 32, 64)).toPolygon();
                }
            }]);
        this.health = 10;
        this.alwaysUpdate = true;
        //this.attacking lets us know if the enemy is currently attacking
        this.attacking = false;
        //keeps track of when our creep last attacked anything
        this.lastAttacking = new Date().getTime();
        //keep track of the last time our creep hit anything
        this.lastHit = new Date().getTime();
        this.now = new Date().getTime();
        this.body.setVelocity(3, 30);

        this.type = "EnemyCreep";
        //adds the animation for my enemy creep to walk
        this.renderable.addAnimation("walk", [3, 4, 5], 80);
        //sets the animation to walk
        this.renderable.setCurrentAnimation("walk");
    },
    
    loseHealth: function(damage) {
        console.log(this.health);
      this.health = this.health - damage;  
    },
    
    update: function(delta) {
        
        if(this.health <=0) {
            //when the creep dies it gets removed from the game world
            me.game.world.removeChild(this);
        }
        
        this.now = new Date().getTime();

        this.body.vel.x -= this.body.accel.x * me.timer.tick;

        me.collision.check(this, true, this.collideHandler.bind(this), true);


        this.body.update(delta);

        this._super(me.Entity, "update", [delta]);

        return true;
    },
    collideHandler: function(response) {
        if (response.b.type === 'PlayerBase') {
            this.attacking = true;
            // this.lastAttacking = this, now;
            this.body.vel.x = 0;
            //keeps moving the creep to the right to maintain its position
            this.pos.x = this.pos.x + 1;
            //checks that it has at least been  1 second before the creep hits the base again
            if ((this.now - this.lastHit >= 1000)) {
                //updates the last hit timer
                this.lastHit = this.now;
                //makes the player base call the lose health function and passes a
                //damage of 1
                response.b.loseHealth(1);
            }
        } else if (response.b.type === 'PlayerEntity') {
            var xdif = this.pos.x - response.b.pos.x;

            this.attacking = true;
            // this.lastAttacking = this, now;

            //keeps moving the creep to the right to maintain its position
            if (xdif > 0) {
                //keeps moving the creep to the right to maintain its position
                this.pos.x = this.pos.x + 1;
                this.body.vel.x = 0;
            }
            //checks that it has at least been  1 second before the creep hits something
            if ((this.now - this.lastHit >= 1000 && xdif > 0)) {
                //updates the last hit timer
                this.lastHit = this.now;
                //makes the player call the lose health function and passes a
                //damage of 1
                response.b.loseHealth(1);
            }

        }

    }
});

game.GameManager = Object.extend({
    init: function(x, y, settings) {
        this.now = new Date().getTime();
        //keeps track of the last time we made a creep happen
        this.lastCreep = new Date().getTime();

        this.alwaysUpdate = true;
    },
    update: function() {
        //keeps track of the timer
        this.now = new Date().getTime();

        if (Math.round(this.now / 1000) % 10 === 0 && (this.now - this.lastCreep >= 1000)) {
            this.lastCreep = this.now;
            var creepe = me.pool.pull("EnemyCreep", 1000, 0, {});
            me.game.world.addChild(creepe, 5);
        }

        return true;
    }
});