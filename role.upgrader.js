var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
	    if(creep.carry.energy == 0) {
	        creep.memory.filling = true;
	        creep.memory.sourceId = null;
	    } else if(creep.carry.energy == creep.carryCapacity) {
	        creep.memory.filling = false;
	    }
	    if(creep.memory.filling) {
            if(creep.memory.sourceId == null){
                creep.memory.sourceId = creep.room.controller.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id;
            }
            var source = Game.getObjectById(creep.memory.sourceId);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            } else {
                //console.log('harvesting '+source.id);
            }
	    } else {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
	    }
	}
};

module.exports = roleUpgrader;