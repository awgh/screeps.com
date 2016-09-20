var roleScavenge = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.carry.energy < creep.carryCapacity) {
            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_LINK        ||
                            structure.structureType == STRUCTURE_STORAGE)    && structure.energy > 0;
                }
            }, {ignoreCreeps: true, maxRooms: 1});

            if(target) {
        		let retval = creep.withdraw(target, RESOURCE_ENERGY);
        		if(  retval == ERR_NOT_IN_RANGE ) {
        		    creep.moveTo(target);
        		} else if(retval == OK || retval == ERR_BUSY){
        		} else {
        		    console.log('UNHANDLED scavenge withdraw error: '+retval);
        		}
            } 
        } else {
		    let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION && (structure.energy < structure.energyCapacity));
                }
            }, {ignoreCreeps: true, maxRooms: 1});
            if(target) {
        	    let retval = creep.transfer(target, RESOURCE_ENERGY);
		        if(  retval == ERR_NOT_IN_RANGE ) {
		            creep.moveTo(target);
		        } else if(retval == OK){
		        } else {
		            console.log('UNHANDLED scavenge transfer error: '+retval);
		        }           
            } 
    	}
	}
};

module.exports = roleScavenge;