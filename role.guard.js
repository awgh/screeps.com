var RoleGuard = {
    /** @param {Creep} creep **/
    run: function(creep) {
    	var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    	if(target && creep.hits > creep.hitsMax - 500 /* no more attack */) {
    		creep.moveTo(target);
    		creep.attack(target);
    	} else {
    	    // don't go home again
    		//creep.moveTo(Game.spawns.Spawn1);
    	}
    }
};

module.exports = RoleGuard;
