var nearest = require('util.nearest');

var roomConfig = {
    'W53N31': {
        maxRangeFromSource: 25
    },
    'W52N31': {
        maxRangeFromSource: 7
    }
};

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.carry.energy == 0) {
	        creep.memory.filling = true;
	    } else if(creep.carry.energy == creep.carryCapacity) {
	        creep.memory.filling = false;
	        creep.memory.destId = null;
	    }
        
        if(creep.memory.filling) {
            //creep.memory.destId = null;
            if(creep.memory.sourceId == null){
                //console.log(creep.name+' is thinking about a new source...');
                creep.memory.sourceId = nearest.source(creep.room, creep.pos.x, creep.pos.y, 1.5);
            }
            let source = Game.getObjectById(creep.memory.sourceId);
    		let retval = creep.harvest(source); 
    		if(  retval == ERR_NOT_IN_RANGE ) {
                creep.moveTo(source, {reusePath: 10});
    		} else if(retval == OK || retval == ERR_BUSY){
    		} else if(retval == ERR_NOT_ENOUGH_RESOURCES){
    		    //creep.memory.filling = false; // let's just go deliver what we've got, source is dry
    		    creep.memory.destId = null;
    		    creep.memory.sourceId = null;
    		} else {
    		    console.log('UNHANDLED harvester harvest error: '+retval);
    		    creep.memory.sourceId = null;  
    		}            
        }
        else {
            if(creep.memory.destId == null){
                //console.log(creep.name+' is thinking about a new destination...');
                let spos = Game.getObjectById(creep.memory.sourceId);
                if(!spos)
                    spos = creep;
                let dst;
                if (creep.room.memory.fullComplement) {
                    dst = creep.pos.findClosestByPath(spos.pos.findInRange(FIND_STRUCTURES, roomConfig[creep.room.name].maxRangeFromSource), {
                            filter: (structure) => {
                                let b = structure.structureType == STRUCTURE_EXTENSION  || 
                                        structure.structureType == STRUCTURE_LINK ||
                                        structure.structureType == STRUCTURE_STORAGE ||
                                        structure.structureType == STRUCTURE_TOWER || 
                                        structure.structureType == STRUCTURE_TERMINAL || 
                                        structure.structureType == STRUCTURE_SPAWN;
                                return b && structure.energy < structure.energyCapacity;
                            }
                    }, {ignoreCreeps: true, maxRooms: 1});
                } else {
                        dst = creep.pos.findClosestByPath(spos.pos.findInRange(FIND_STRUCTURES, roomConfig[creep.room.name].maxRangeFromSource), {
                            filter: (structure) => {
                                let b = structure.structureType == STRUCTURE_EXTENSION  || 
                                        structure.structureType == STRUCTURE_SPAWN;
                                return b && structure.energy < structure.energyCapacity;
                            }
                        }, {ignoreCreeps: true, maxRooms: 1});
                }
                if(dst)
                    creep.memory.destId = dst.id;
            }
            let target = Game.getObjectById(creep.memory.destId);
            if(target) {
        		let retval = creep.transfer(target, RESOURCE_ENERGY);
        		if(  retval == ERR_NOT_IN_RANGE ) {
        		    creep.moveTo(target, {reusePath: 10});
        		} else if(retval == OK){
        		} else if(retval == ERR_INVALID_TARGET || ERR_FULL) {
        		    if(creep.carry.energy < creep.carryCapacity) {
            		    let links = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                            filter: (structure) => {
                                return structure.structureType == STRUCTURE_LINK;
                            }});
                        if(links && links.length > 0)
                        {
                            console.log(creep.name+' proximate link full, filling instead.');
                            creep.memory.filling = true;
                        } else {
                            creep.memory.destId = null;
                        }
        		    } else {
        		        creep.memory.destId = null;
        		    }
        		} else {
        		    console.log('UNHANDLED harvester transfer error: '+retval);
        		    creep.memory.destId = null;
        		}           
            }
        }
	}
};

module.exports = roleHarvester;