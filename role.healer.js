var RoleHealer = {
    /** @param {Creep} creep **/
    run: function(creep) {
        let damagedCreep = creep.pos.findNearest(Game.MY_CREEPS, {
            filter: function(object) {
                return object !== creep && object.hits < object.hitsMax;
            }
        });
        if (creep.hits < creep.hitsMax - 100 /* no more heal */) {
        	creep.moveTo(Game.spawns.Spawn1);
        	creep.heal(damagedCreep);
        	return;
        }
        
        if(damagedCreep) {
        	creep.moveTo(damagedCreep);
        	creep.heal(damagedCreep);
        	return;
        }
        
        let guard = creep.pos.findNearest(Game.MY_CREEPS, {
            filter: function(creep) {
    	        return creep.memory.role === 'guard';
            }
        });
        if (guard) {
        	creep.moveTo(guard);
        } else {
        	creep.moveTo(Game.spawns.Spawn1);
        	creep.heal(damagedCreep);
        }
    }
};

module.exports = RoleHealer;
