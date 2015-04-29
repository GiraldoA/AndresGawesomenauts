


game.ExperienceManager = Object.extend({
    init: function(x, y, settings) {
        this.alwaysUpdate = true;
        this.gameover = false;
    },
    update: function() {
        //if the player wins the game he then gets 10 experience
        if (game.data.win === true && !this.gameover) {
            this.gameOver(true);
            alert("YOU WIN!!!");
            //if the player losses the game he gets one experience
        } else if (game.data.win === false && !this.gameover) {
            this.gameOver(false);
            alert("YOU LOSE!");
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




        $.ajax({
            type: "POST",
            url: "php/controller/save-user.php",
            data: {
                exp: game.data.exp,
                exp1: game.data.exp1,
                exp2: game.data.exp2,
                exp3: game.data.exp3,
                exp4: game.data.exp4,
            },
            dataType: "text"
        })
                .success(function(response) {
                    if (response === "true") {
                        me.state.change(me.state.MENU);
                    } else {
                        alert(response);
                    }
                })
                .fail(function(response) {
                    alert("Fail");
                });

    }
});

