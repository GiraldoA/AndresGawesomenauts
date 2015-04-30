game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings) {
        this.setSuper(x, y);
        this.setPlayerTimers();
        this.setAttributes();
        this.type = "PlayerEntity";
        this.setFlags();
        this.lastAttack = new Date().getTime();
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
        this.addAnimation();
        this.renderable.setCurrentAnimation("idle");
    },
    
    setSuper: function(x, y) {
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
    },
    
    setPlayerTimers: function() {
        //checks what time it is
        this.now = new Date().getTime();
        this.lastHit = this.now;
        this.lastSpear = this.now;
        this.lastAttack = new Date().getTime();
    },
    
    setAttributes: function() {
        this.health = game.data.playerHealth;
        this.body.setVelocity(game.data.playerMoveSpeed, 25);
        this.attack = game.data.playerAttack;
    },
    
    setFlags: function() {
        //this keeps track of which direction your charecter is going
        this.facing = "right";
        this.dead = false;
        this.attacking = false;
    },
    
    addAnimation: function() {
        //this adds the animations that i want for my charecter when he does a specific task
        this.renderable.addAnimation("idle", [78]);
        this.renderable.addAnimation("walk", [117, 118, 119, 120, 121, 122, 123, 124, 125]);
        this.renderable.addAnimation("attack", [65, 66, 67, 68, 69, 70, 71, 72], 80);
    },
    
    //every time the player dies he restarts at the top of the screen
    update: function(delta) {
        this.now = new Date().getTime();
        this.dead = this.checkIfDead();
        this.checkIfKeyPressesAndMove();
        this.checkAbilityKeys();
        this.setAnimation();
        me.collision.check(this, true, this.collideHandler.bind(this), true);
        this.body.update(delta);
        this._super(me.Entity, "update", [delta]);
        return true;
    },
    
    checkIfDead: function() {
        if (this.health <= 0) {
            return true;
        }
        return false;
    },
    
    checkIfKeyPressesAndMove: function() {
        if (me.input.isKeyPressed("right")) {
            this.moveRight();
        } else if (me.input.isKeyPressed("left")) {
            this.moveLeft();
        } else {
            this.body.vel.x = 0;
        }
        if (me.input.isKeyPressed("jump") && !this.jumping && !this.falling) {
            this.jump();
        } else if (this.body.vel.y === 0) {
            this.jumping = false;
        }

        this.attacking = me.input.isKeyPressed("attack");
    },
    
    moveRight: function() {
        //adds to the position of my x by the velocity defined above in
        //set velocity() and multiplying it by me.timer.tick.
        //me.timer.tick makes the movement look smooth
        this.body.vel.x += this.body.accel.x * me.timer.tick;
        this.flipX(true);
        this.facing = "right";
    },
    
    moveLeft: function() {
        this.facing = "left";
        this.body.vel.x -= this.body.accel.x * me.timer.tick;
        this.flipX(false);
    },
    
    jump: function() {
        this.jumping = true;
        this.body.vel.y -= this.body.accel.y * me.timer.tick;

    },
    
    checkAbilityKeys: function() {
      if(me.input.isKeyPressed("skill1")) {
          //this.speedBurst();
      }else if(me.input.isKeyPressed("skill2")){
          //this.eatCreep();
      }else if(me.input.isKeyPressed("skill3")) {
          this.throwSpear();
      }  
    },
    //allows my player to throw his spear at enemys
    throwSpear: function() {
        if(this.lastSpear >= game.data.spearTimer && game.data.ability3 > 0) {
        this.lastSpear = this.now;
            var spear = me.pool.pull("spear", this.pos.x, this.pos.y, {}, this.facing);
            me.game.world.addChild(spear, 10);
            
        } 
    },
    
    setAnimation: function() {
        if (this.attacking) {
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
    },
    
    loseHealth: function(damage) {
        this.health = this.health - damage;
    },
    
    collideHandler: function(response) {

        if (response.b.type === 'EnemyBaseEntity') {    
            this.collideWithEnemyBase(response);
        } else if (response.b.type === 'EnemyCreep') {
            this.collideWithEnemyCreep(response);
        }
    },
    
    collideWithEnemyBase: function(response) {
        var ydif = this.pos.y - response.b.pos.y;
        var xdif = this.pos.x - response.b.pos.x;
        if (ydif < -40 && xdif < 70 && xdif > -5) {
            this.body.falling = false;
            this.body.vel.y = -1;
        }
        //this stops my player from walking to the left
        else if (xdif > -32 && this.facing === 'right' && xdif < 0) {
            this.body.vel.x = 0;
        } else if (xdif < 97 && this.facing === 'left' && xdif > 0) {
            this.body.vel.x = 0;
        }
        if (this.renderable.isCurrentAnimation("attack") && ((this.now - this.lastHit) >= game.data.playerAttackTimer)) {
            this.lastHit = this.now;
            response.b.loseHealth(game.data.playerAttack);
        }
    },
    
    collideWithEnemyCreep: function(response) {
        var xdif = this.pos.x - response.b.pos.x;
        var ydif = this.pos.y - response.b.pos.y;

        this.stopMovement(xdif);

        if (this.checkAttack(xdif, ydif)) {
            this.hitCreep(response);
        }
        ;

    },
    
    stopMovement: function(xdif) {
        if (xdif > 0) {
            if (this.facing === "left") {
                this.body.vel.x = 0;
            }
        } else {
            if (this.facing === "right") {
                this.body.vel.x = 0;
            }
        }
    },
    
    checkAttack: function(xdif, ydif) {
        if (this.renderable.isCurrentAnimation("attack") && (this.now - this.lastHit >= game.data.playerAttackTimer)
                && (Math.abs(ydif) <= 40) &&
                (((xdif > 0) && this.facing === "left") || ((xdif < 0) && this.facing === "right"))
                ) {
            //updates the timers
            this.lastHit = this.now;
            return true;
        }
        return false;
    },
    
    hitCreep: function(response) {
        //if the creeps health is less than our attack, execute code in if statement
        if (response.b.health <= game.data.playAttack) {
            //adds one gold for a creep kill
            game.data.gold += 1;
            console.log("current gold:" + game.data.gold);
        }
        response.b.loseHealth(game.data.playerAttack);
    }

});




