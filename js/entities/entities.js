game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
           image: "player",
           width: 64,
           height: 64,
           spritewidth: "64",
           spriteheight: "64",
           getShape: function() {
               return(new me.Rect(0, 0, 64, 64)) .toPolygon();
           }
        }]);
    
    this.body.setVelocity(5, 25);
    
    },
    
    update: function(delta){ 
        if(me.input.isKeyPressed("right")) {
            //adds to the position of my x by the velocity defined above in
            //set velocity() and multiplying it by me.timer.tick.
            //me.timer.tick makes the movement look smooth
            this.body.vel.x += this.body.accel.x * me.timer.tick;
        }else {
            this.body.vel.x =0;
        }
        
        this.body.update(delta);
        return true;
    }
});