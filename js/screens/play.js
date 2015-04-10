game.PlayScreen = me.ScreenObject.extend({
	/**
	 *  action to perform on state change
	 */
	onResetEvent: function() {
		// reset the score
		game.data.score = 0;
                me.levelDirector.loadLevel("level01");
                
                this.resetPlayer(0, 420);
                
                var gameTimerManager = me.pool.pull("GameTimerManager", 0,  0, {});
                me.game.world.addChild(gameTimerManager, 0); 
                
                var heroDeathManager = me.pool.pull("HeroDeathManager", 0,  0, {});
                me.game.world.addChild(heroDeathManager, 0); 
                
                var experienceManager = me.pool.pull("ExperienceManager", 0, 0, {});
                me.game.world.addChild(experienceManager, 0);
                
                me.input.bindKey(me.input.KEY.RIGHT, "right");
                me.input.bindKey(me.input.KEY.LEFT, "left");
                me.input.bindKey(me.input.KEY.SPACE, "jump");
                me.input.bindKey(me.input.KEY.A, "attack");

		// add our HUD to the game world
		this.HUD = new game.HUD.Container();
		me.game.world.addChild(this.HUD);
	},


	/**
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent: function() {
		// remove the HUD from the game world
		me.game.world.removeChild(this.HUD);
	},
        
        resetPlayer: function(x, y) {
             game.data.player = me.pool.pull("player", x, y, {});
                me.game.world.addChild(game.data.player, 5);
        }
});
