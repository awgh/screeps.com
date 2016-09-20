var roleBuilder = {

    findTarget: function(creep) {
        let likelyTarget = null;
    	let likelyTargets = creep.room.find(FIND_CONSTRUCTION_SITES);
	    if(likelyTargets.length){
	        likelyTarget = likelyTargets[0];
	        for( t in likelyTargets ) {
	            if (t.progress > 0) {
	                likelyTarget = t;
	                break;
	            }
	        }
	    }
        return likelyTarget;
    },
    
    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.memory.holdoff) {
            creep.memory.holdoff--;
            if(creep.memory.holdoff <= 0)
                creep.memory.sourceId = null;
        }
        
        if(creep.carry.energy == 0) {
	        creep.memory.filling = true;
	    } else if(creep.carry.energy == creep.carryCapacity) {
	        creep.memory.filling = false;
	    }

        let likelyTarget = this.findTarget(creep); // this is the target the builder will use next
        let src = creep;
        if(likelyTarget) {
            src = likelyTarget;
        }
        
        if(creep.memory.filling) {	    
            if(creep.memory.sourceId == null){
    	        // Modes 1: harvest, 2: withdraw, 3: pickup
                // First Choice: Dropped Energy (verb: harvest)
                let target = null;
                if(creep.memory.holdoff == null || creep.memory.holdoff < 1) {
                    targets = creep.pos.findInRange(FIND_DROPPED_ENERGY, 10, {
                        filter: (d) => {
                            return d.resourceType == RESOURCE_ENERGY && d.energy > 10;  // harvesting causes false positives in the 1-4 range for dropped energy
                        }
                    });
                    if(targets && targets.length > 0){
                        target = creep.pos.findClosestByPath(targets, {ignoreCreeps: true, maxRooms: 1});
                    }
                }
                if( target ) {
                    creep.memory.mode = 3;
                    creep.memory.sourceId = target.id;
                    creep.memory.holdoff = 10;
                }
                if(!target) {
                    // Second Choice: Extensions or Other Structures (verb: withdraw)
                    if(!likelyTarget) {  // if it's going to be upgrading with a link. try that first since it's cheaper
                        targets = creep.room.controller.pos.findInRange(FIND_STRUCTURES, 3, {
                            filter: (structure) => {
                                return     structure.structureType == STRUCTURE_LINK;
                            }
                        });
                        if(targets && targets.length > 0) {
                            //console.log("YIPPEEE: "+creep.room.name);
                            target = targets[0];
                        }
                    }
                    if(!target){
                        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                            filter: (structure) => {
                                let b = structure.structureType == STRUCTURE_EXTENSION ||
                                        structure.structureType == STRUCTURE_LINK;
                                return b && structure.energy > 0;
                            }
                        }, {ignoreCreeps: true, maxRooms: 1});
                    }
                }
                if(target) {
                    creep.memory.mode = 2;
                    creep.memory.sourceId = target.id;
                    creep.memory.holdoff = 10;
                } else {
                    // Third Choice: Mine it ourself (verb: harvest)            
                    target = src.pos.findClosestByPath(FIND_SOURCES, {ignoreCreeps: true, maxRooms: 1});
                    if(target) {
                        creep.memory.mode = 1;
                        creep.memory.sourceId = target.id;
                        creep.memory.holdoff = 20;
                    } else {
                        creep.memory.mode = 0;
                        creep.memory.sourceId = null;
                    }
                }
            } // end if sourceId
            
            let target = Game.getObjectById(creep.memory.sourceId);
            let mode = creep.memory.mode;
            if(target) {
                let retval;
                switch(mode){
                case 1: 
                    retval = creep.harvest(target); 
        		    if(  retval == ERR_NOT_IN_RANGE ) {
        		        creep.moveTo(target, {reusePath: 10});
        		    } else if(retval == OK || retval == ERR_BUSY){
        		    } else if(retval == ERR_INVALID_TARGET) {
        		        creep.memory.sourceId = null;
        		    } else {
        		        console.log('UNHANDLED builder harvest error: '+retval);
        		        console.log(creep.name+'\t'+target+'\t'+target.pos);
        		    }            
        		    break;
                case 2:
            		retval = creep.withdraw(target, RESOURCE_ENERGY);
            		if(  retval == ERR_NOT_IN_RANGE ) {
            		    creep.moveTo(target, {reusePath: 10});
            		} else if(retval == OK || retval == ERR_BUSY){
            		} else if(retval == ERR_FULL) {
            		    creep.memory.filling = false;
            		} else if(retval == ERR_NOT_ENOUGH_RESOURCES || retval == ERR_INVALID_TARGET) {
            		    creep.memory.sourceId = null;
            		} else {
            		    console.log('UNHANDLED builder withdraw error: '+retval);
            		}
            		break;
            	case 3:
            		retval = creep.pickup(target);
            		if(  retval == ERR_NOT_IN_RANGE ) {
            		    creep.moveTo(target, {reusePath: 10});
            		} else if(retval == OK || retval == ERR_BUSY){
            		} else if(retval == ERR_INVALID_TARGET) {
        		        creep.memory.sourceId = null;
            		} else if(retval == ERR_FULL) {
            		    creep.memory.filling = false;
            		} else {
            		    console.log('UNHANDLED builder pickup error: '+retval);
            		}
            		break;
                }
            } 
        } else {
    		let target = likelyTarget;
    		//console.log(creep.name+' lt '+likelyTarget);
    		if(target){
        		let retval = creep.build(target); 
        		if(  retval == ERR_NOT_IN_RANGE ) {
        		    creep.moveTo(target, {reusePath: 10});
        		} else if(retval == OK){
        		} else {
        		    console.log('UNHANDLED builder build error: '+retval);
        		}
    		} else {
    		    let target;
    		    targets = creep.pos.findInRange(FIND_STRUCTURES, 7, {
                    filter: (structure) => {
                        return (
                            (structure.structureType == STRUCTURE_TOWER && (structure.energy < (structure.energyCapacity * 0.9))));// ||
                            //(structure.structureType == STRUCTURE_TERMINAL));
                    }
                }, {ignoreCreeps: true, maxRooms: 1});
                if(targets && targets.length > 0) {
                    target = targets[0];
                }
                if(target) {
            	    let retval = creep.transfer(target, RESOURCE_ENERGY);
    		        if(  retval == ERR_NOT_IN_RANGE ) {
    		            creep.moveTo(target, {reusePath: 10});
    		        } else if(retval == OK){
    		        } else {
    		            console.log('UNHANDLED builder transfer error: '+retval);
    		        }           
                } else {
                    let retval = creep.upgradeController(creep.room.controller);
            		if(  retval == ERR_NOT_IN_RANGE ) {
            		    creep.moveTo(creep.room.controller, {reusePath: 10});
            		} else if(retval == OK){
            		} else {
            		    console.log('UNHANDLED builder upgrade error: '+retval);
            		}    		    
                }
    		}
    	}
	}
};

module.exports = roleBuilder;