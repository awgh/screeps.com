var nearest = require('util.nearest');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.carry.energy < creep.carryCapacity) {
            if(creep.memory.sourceId == null){
                creep.memory.sourceId = nearest.source(creep.room, creep.pos.x, creep.pos.y, 3);
            }
            var source = Game.getObjectById(creep.memory.sourceId);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            } else {
                //console.log('harvesting '+source.id);
            }
        }
        else {
            creep.memory.sourceId = null;
            
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
            });

            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            } else {
                //console.log('Transferred to '+targets[0].id);
            }
        }
	}
};

module.exports = roleHarvester;