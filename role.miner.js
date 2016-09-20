var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var total = _.sum(creep.carry);
        if(total == 0) {
	        creep.memory.filling = true;
	    } else if(total == creep.carryCapacity) {
	        creep.memory.filling = false;
	    }
        
        if(creep.memory.filling) {
            if(creep.memory.sourceId == null){
                let src = creep.pos.findClosestByPath(FIND_MINERALS, {ignoreCreeps: true, maxRooms: 1});
                if(src)
                    creep.memory.sourceId = src.id;
            }
            let source = Game.getObjectById(creep.memory.sourceId);
    		let retval = creep.harvest(source); 
    		if(  retval == ERR_NOT_IN_RANGE ) {
    		    creep.moveTo(source, {reusePath: 10});
    		} else if(retval == OK || retval == ERR_BUSY){
    		} else if(retval == ERR_NOT_ENOUGH_RESOURCES){
    		    creep.memory.filling = false; // let's just go deliver what we've got, source is dry
    		} else {
    		    console.log('UNHANDLED miner harvest error: '+retval);
    		    creep.memory.sourceId = null;  
    		}            
        }
        else {
            if(creep.memory.destId == null){
                /*
                let dst = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return  structure.structureType == STRUCTURE_TERMINAL ||
                                    structure.structureType == STRUCTURE_STORAGE;
                        }
                }, {ignoreCreeps: true});
                */
                let dst = creep.room.terminal;
                var total = _.sum(creep.room.terminal.store);
                if(!dst || total == creep.room.terminal.storeCapacity)
                    dst = creep.room.storage;
                
                if(dst)
                    creep.memory.destId = dst.id;
            }
            
            let target = Game.getObjectById(creep.memory.destId);
            if(target) {
        		let retval = creep.transfer(target, RESOURCE_HYDROGEN);
        		if(  retval == ERR_NOT_IN_RANGE ) {
        		    creep.moveTo(target, {reusePath: 10});
        		} else if(retval == OK){
//        		} else if(retval == ERR_INVALID_TARGET || ERR_FULL) {
//        		    creep.memory.destId = null;
        		} else {
        		    console.log('UNHANDLED miner transfer error: '+retval);
        		    creep.memory.destId = null;
        		}           
            }
        }
	}
};

module.exports = roleMiner;