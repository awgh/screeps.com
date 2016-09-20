var UtilNearest = {
    /** @param {Room} room **/
    source: function(room, x, y, threshold) {
        let sources = room.find(FIND_SOURCES);
        //console.log(sources.length);
        /*
	    sources.sort(function(a, b) {
	        let aDeltaX = Math.abs(x - a.pos.x);
	        let aDeltaY = Math.abs(y - a.pos.y);
	        //var aDelta = Math.sqrt(aDeltaX + aDeltaY);
	        // ghetto magnitude - avoid SQRT
	        let aDelta = aDeltaX + aDeltaY;
	        
	        let bDeltaX = Math.abs(x - b.pos.x);
	        let bDeltaY = Math.abs(y - b.pos.y);
	        //var bDelta = Math.sqrt(bDeltaX + bDeltaY);
	        let bDelta = bDeltaX + bDeltaY;
	        
	        return aDelta - bDelta;
	    });
	    // default to closest source
	    */
	    
	    let target = sources[0];
	    let targetOpenings = 0;
	    
	    // if more than ceiling(threshold * openings) other harvesters are targeting, then pick next source if more openings
	    for (let i in sources) {
	        let count = 0;
	        for (let j in Game.creeps) {
	            jcreep = Game.creeps[j]
	            if ( jcreep.memory.role == 'harvester' && jcreep.memory.sourceId == sources[i].id ) { 
	                count++;
	            }
	        }
	        let sos = jcreep.room.memory.sourceOpenings[sources[i].id];
	        let to = Math.ceil(threshold * sos ) - count;
	        if(to > targetOpenings) {
	            targetOpenings = to;
	            target = sources[i];
	        }
	    }
	    return target.id; 
    }
};

module.exports = UtilNearest;