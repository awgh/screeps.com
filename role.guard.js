var RoleGuard = {
    /** @param {Creep} creep **/
    run: function(creep) {
    	
    	let target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        
    	if(target && creep.hits > creep.hitsMax - 500 /* no more attack */) {
    		creep.moveTo(target);
    		creep.attack(target);
    	} else if(creep.room.memory.guardPos) {
    	    //Memory.rooms['W53N31'].guardPos = new RoomPosition(30, 36, 'W53N31');
    	    //Memory.rooms['W52N31'].guardPos = new RoomPosition(36, 12, 'W52N31');
	    	creep.moveTo(creep.room.memory.guardPos.x, creep.room.memory.guardPos.y, {reusePath: 10});
    	} else {
    	    // random walk - call it a patrol
    	    let d8 = Math.floor((Math.random() * 8) + 1);
    	    creep.move(d8);
    	}
    }
};

module.exports = RoleGuard;
