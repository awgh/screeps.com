var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.carry.energy == 0) {
            
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) && structure.energy >= creep.carryCapacity;
                }
            });
	        if( creep.withdraw(target, RESOURCE_ENERGY ) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
	        }
	    }
    	else {
    		var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    		if( targets.length && creep.build(targets[0]) == ERR_NOT_IN_RANGE ) {
    		    creep.moveTo(targets[0]);
    		}
    	}
	}
};

module.exports = roleBuilder;