


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
        if (win) {
            game.data.exp += 10;
        } else {
            game.data.exp += 1;
        }
        console.log(game.data.exp);
        this.gameover = true;
        me.save.exp = game.data.exp;
        //for testing purposes only
        me.save.exp2 = 4;
    }
});

