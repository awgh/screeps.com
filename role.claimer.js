//579fa8c60700be0674d2e41f

var RoleClaimer = {
    /** @param {Creep} creep **/
    run: function(creep) {
		let source = Game.flags['claim'];
        let transform = Game.flags['transform'];

        // For room-to-room moves
		if(creep.room != source.room){
		    creep.moveTo(source.pos);
		    return;
		}
		
	    //We're in the same room, transform non-claiming creeps to a more useful type
	    //if( creep.pos.x == transform.pos.x && creep.pos.y == transform.pos.y) {
	    if( creep.pos.isNearTo(transform) ) {
    		if(creep.getActiveBodyparts(CLAIM) == 0){
    		    if(creep.getActiveBodyparts(ATTACK) == 0) {
    		        let d6 = Math.floor((Math.random() * 6) + 1);
    		        if(d6==1)
    		            creep.memory.role = 'upgrader';
    		       else if(d6==2)
    		           creep.memory.role = 'harvester';
    		        else
    		        creep.memory.role = 'builder';
    		    } else {
    		        creep.memory.role = 'guard';
    		    }
    		}
	    }
	    
		// For inside-the-room moves
	    creep.moveTo(source, {costCallback: function(roomName, costMatrix){
	        let swampCost = 5;
	        let exitCost = 255;
	        let plainCost = 1;
	        
            for (let x=0;x<50;++x) {
                for (let y=0;y<50;++y) {
                    let cost;
                    let terrain = Game.map.getTerrainAt(x,y,roomName);
                    if (terrain == 'wall') {
                        cost = 255;
                    } else if (terrain == 'swamp') {
                        cost = swampCost;
                    } else {
                        cost = plainCost;
                    }
                    if (x == 0 || x == 49 || y == 0 || y == 49) {
                        //avoid pathing through exits
                        cost = Math.max(cost, exitCost);
                    }
                    costMatrix.set(x,y, cost);
                }
            }
	    }});

        if(creep.getActiveBodyparts(CLAIM) > 0){
        	let retval = creep.claimController(creep.room.controller); 
        	console.log("CLAIMING RETURNED: "+retval);
        	if(retval == ERR_NOT_IN_RANGE) {
        	} else if(retval == OK || retval == ERR_BUSY){
        	} else if(retval == ERR_NO_BODYPART || retval == ERR_GCL_NOT_ENOUGH){
        	    //creep.memory.role = 'guard'; // hack to send guards over to the new room
        	} else {
        	    console.log('UNHANDLED claimer claimController error: '+retval);
        	}
        }
    }
};

module.exports = RoleClaimer;