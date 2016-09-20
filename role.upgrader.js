var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
	    if(creep.carry.energy == 0) {
	        creep.memory.filling = true;
	    } else if(creep.carry.energy == creep.carryCapacity) {
	        creep.memory.filling = false;
	    }
	    var controller = Game.creeps[creep.name].room.controller;
	    
	    if(creep.memory.filling) {
	        
            let target = controller.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    let b = structure.structureType == STRUCTURE_CONTAINER ||
                            structure.structureType == STRUCTURE_LINK      || 
                            structure.structureType == STRUCTURE_STORAGE;
                    if(creep.room.memory.fullComplement) {
                        b = b || STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION;                    
                    }        
                    return b && structure.energy > 0;
                }
            }, {ignoreCreeps: true, maxRooms: 1});
            
            if(target) {
                //console.log(creep.name+' '+target);
        		let retval = creep.withdraw(target, RESOURCE_ENERGY);
        		if(  retval == ERR_NOT_IN_RANGE ) {
        		    creep.moveTo(target, {reusePath: 10});
        		} else if(retval == OK || retval == ERR_BUSY){
        		} else {
        		    console.log('UNHANDLED upgrader withdraw error: '+retval);
        		}
            } else {
                target = controller.pos.findClosestByPath(FIND_SOURCES, {ignoreCreeps: true, maxRooms: 1});
                if(target){
                    let retval = creep.harvest(target); 
        		    if(  retval == ERR_NOT_IN_RANGE ) {
        		        creep.moveTo(target, {reusePath: 10});
        		    } else if(retval == OK || retval == ERR_BUSY){
        		    } else {
        		        console.log('UNHANDLED upgrader harvest error: '+retval);
        		    }            
                }
            }
	    } else if(creep.carry.energy > 0) {
	        let retval = Game.creeps[creep.name].upgradeController(Game.creeps[creep.name].room.controller);
    		if(  retval == ERR_NOT_IN_RANGE ) {
    		    creep.moveTo(Game.creeps[creep.name].room.controller, {reusePath: 10});
    		} else if(retval == OK){
    		} else {
    		    creep.moveTo(Game.creeps[creep.name].room.controller, {reusePath: 10});
    		    console.log('UNHANDLED upgrader upgrade error: '+retval);
    		}
	    }
	}
};

module.exports = roleUpgrader;