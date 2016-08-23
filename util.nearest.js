var UtilNearest = {
    /** @param {Room} room **/
    source: function(room, x, y, threshold) {
        var sources = room.find(FIND_SOURCES_ACTIVE);
        //console.log(sources.length);
	    sources.sort(function(a, b) {
	        var aDeltaX = Math.abs(x - a.pos.x);
	        var aDeltaY = Math.abs(y - a.pos.y);
	        var aDelta = Math.sqrt(aDeltaX + aDeltaY);
	        // ghetto magnitude - avoid SQRT
	        //var aDelta = aDeltaX + aDeltaY;
	        
	        var bDeltaX = Math.abs(x - b.pos.x);
	        var bDeltaY = Math.abs(y - b.pos.y);
	        var bDelta = Math.sqrt(bDeltaX + bDeltaY);
	        //var bDelta = bDeltaX + bDeltaY;
	        
	        return aDelta < bDelta;
	    });
	    
	    // default to closest source
	    var target = sources[0];
	    
	    // if more than X other creeps are targeting, then pick next closest source
	    for (var i in sources) {
	        var count = 0;
	        for (var j in Game.creeps) {
	            jcreep = Game.creeps[j]
	            if ( jcreep.memory.sourceId == sources[i].id ) { 
	                count++;
	            }
	        }
	        if (count < threshold) { 
	            target = sources[i];
	            console.log(sources[i].pos.x+','+sources[i].pos.y+' has count: '+count);
	            break;
	        }
	    }
	    return target.id; 
    }
};

module.exports = UtilNearest;