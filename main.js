
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleGuard = require('role.guard');
var roleHealer = require('role.healer');

module.exports.loop = function () {

/*
    var tower = Game.getObjectById('a34b976a958067d7118a0763');
    if(tower) {
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }
*/

    // garbage collect 10% of the time
    if (Math.floor((Math.random() * 10) + 1) == 10) {
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    }

    var harvesters = 0;
    var upgraders = 0;
    var builders = 0;
    var guards = 0;
    var healers = 0;

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        //console.log('Running '+name+' as '+creep.memory.role);
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
            harvesters++;
        }
        else if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
            upgraders++;
        }
        else if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
            builders++;
        }
        else if(creep.memory.role == 'guard') {
            roleGuard.run(creep);
            guards++;
        }
        else if(creep.memory.role == 'healer') {
            roleHealer.run(creep);
            healers++;
        }
    }

    console.log('Harvesters: '+harvesters+'\tUpgraders: '+upgraders+'\tBuilders: '+builders+'\tGuards: '+guards+'\tHealers:'+healers);

    if(harvesters < 5) {
        Game.spawns.Spawn1.createCreep( [WORK, CARRY, MOVE], null, {role: 'harvester'} );
    }
    else if(upgraders < 4) {
        Game.spawns.Spawn1.createCreep( [WORK, CARRY, MOVE], null, {role: 'upgrader'} );
    }
    else if(builders < 4) {
        Game.spawns.Spawn1.createCreep( [WORK, CARRY, MOVE], null, {role: 'builder'} );
    }
    else if(guards < 0) {
        Game.spawns.Spawn1.createCreep([TOUGH, MOVE, ATTACK, MOVE, ATTACK], null, {role: 'guard'});
    }

    
}