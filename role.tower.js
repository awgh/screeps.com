var roomConfig = {
    'W53N31': {
        minWallHits: 20000
    },
    'W52N31': {
        minWallHits: 20000
    }
};

var roleTower = function (tower) {
    if(tower) {
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
        if( tower.energy > tower.energyCapacity / 2 ) {
            var damagedStructures = tower.room.find(FIND_STRUCTURES, 
                { filter: (structure) => 
                    structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART &&
                        structure.hits < structure.hitsMax }); 
            if(damagedStructures && damagedStructures.length > 0 ) { 
                let retval = tower.repair(damagedStructures[0]); 
                if(retval != OK)
                    console.log("tower repair non-walls returned: "+retval);
            }
        }
        if( tower.energy > tower.energyCapacity / 2 ) {
            var walls = tower.room.find(FIND_STRUCTURES, 
                { filter: (structure) => 
                    (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) &&
                        structure.hits < 20000 }); 
            if(walls && walls.length > 0) { 
                let retval = tower.repair(walls[0]); 
                if(retval != OK)
                    console.log("tower repair walls returned: "+retval);
            }
        }
    }
};

module.exports = roleTower;