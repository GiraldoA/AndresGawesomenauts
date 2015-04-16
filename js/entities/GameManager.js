game.GameTimerManager = Object.extend({
    init: function(x, y, settings) {
        this.now = new Date().getTime();
        //keeps track of the last time we made a creep happen
        this.lastCreep = new Date().getTime();
        this.paused = false;
        this.alwaysUpdate = true;
    },
    update: function() {
        //keeps track of the timer
        this.now = new Date().getTime();
        this.goldTimerCheck();
        this.creepTimerCheck();

        return true;
    },
    goldTimerCheck: function() {
        if (Math.round(this.now / 1000) % 20 === 0 && (this.now - this.lastCreep >= 1000)) {
            game.data.gold += (game.data.exp1+ 1);
            console.log("current gold:" + game.data.gold);
        }
    },
    creepTimerCheck: function() {
        if (Math.round(this.now / 1000) % 10 === 0 && (this.now - this.lastCreep >= 1000)) {
            this.lastCreep = this.now;
            var creepe = me.pool.pull("EnemyCreep", 1000, 0, {});
            me.game.world.addChild(creepe, 5);
        }
    }
});

game.HeroDeathManager = Object.extend({
    init: function(x, y, settings) {
        this.alwaysUpdate = true;
    },
    update: function() {
        //if the player is dead then it removes the player and restarts him
        if (game.data.player.dead) {
            me.game.world.removeChild(game.data.player);
            me.state.current().resetPlayer(10, 0);
        }

        return true;
    }
});

game.ExperienceManager = Object.extend({
    init: function(x, y, settings) {
        this.alwaysUpdate = true;
        this.gameover = false;
    },
    update: function() {
        //if the player wins the game he then gets 10 experience
        if (game.data.win === true && !this.gameover) {
            this.gameOver(true);
            //if the player losses the game he gets one experience
        } else if (game.data.win === false && !this.gameover) {
        this.gameOver(false);
        }
        return true;
    },  
    gameOver: function(win) {
        if(win) {
             game.data.exp += 10; 
        }else {
             game.data.exp += 1;
        }
   console.log(game.data.exp);
        this.gameover = true;
        me.save.exp = game.data.exp;
        //for testing purposes only
        me.save.exp2 = 4;
    }
});

game.SpendGold = Object.extend({
   init: function(x, y, settings) {
        this.now = new Date().getTime();
        this.lastBuy = new Date().getTime();
        this.paused = false;
        this.alwatsUpdate = true;
        this.updateWhenPaused = true;
        this.buying = false;
   },
   
   update: function() {
       this.now = new Date().getTime();
       //if the buy key is pressedd it will execute everything in the brackets
       //if the key is pressed then the player will start buying if not then he wont
       if(me.input.isKeyPressed("buy") && this.now-this.lastBuy >=1000) {
           this.lastBuy = this.now;
           if(!this.buying) {
               this.startBuying();
           }
       }else {
           this.stopBuying();
       }
           
       return true;
   },
   
   startBuying: function() {
       this.buying = true;
       me.state.pause(me.state.PLAY);
       game.data.pausePos = me.game.viewport.localToWorld(0, 0);
       game.data.buyscreen = new me.Sprite(game.data.pausePos.x, game.data.pausePos.y, me.loader.getImage('gold-screen'));
       game.data.buyscreen.updateWhenPaused = true;
       game.data.buyscreen.setOpacity(0.8);
       me.game.world.addChild(game.data.buyscreen, 34);
       game.data.player.body.setvelocity(0, 0);
   },
   
   stopBuying: function() {
       this.buying = false;
       me.state.resume(me.state.PLAY);
       game.data.player.body.setVelocity(game.data.playerMoveSpeed, 20);
       me.game.world.removeChild(game.data.buyscreen);
   }
});