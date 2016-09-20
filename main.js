
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleGuard = require('role.guard');
var roleHealer = require('role.healer');
var roleClaimer = require('role.claimer');
var roleTower = require('role.tower');
var roleScavenge = require('role.scavenge');
var roleMiner = require('role.miner');

var round = function(num) {
    return Math.round(num * 1000) / 1000
}

var debugOutput = "";
var debug = function(str) {
    debugOutput = debugOutput + str + '\n';
}

module.exports.loop = function () {

    PathFinder.use(true); // use the new PathFinder
    var startCpu = Game.cpu.getUsed();
    debugOutput = "";
    
    // LINKS
    // W53N31
    let linkFrom = Game.getObjectById('57cd07fa248105473dade404');
    let linkTo = Game.getObjectById('57ccfd0f84ad11a203bfc886');
    linkFrom.transferEnergy(linkTo);
    // W52N31
    linkFrom = Game.getObjectById('57d8889f89c0fdcd419f8def');
    linkTo = Game.getObjectById('57d87e88adcd2da171ab5ee6');
    linkFrom.transferEnergy(linkTo);

    debug('Link logic used '+ (Game.cpu.getUsed() - startCpu)+' CPU time');
    /*
    **  GARBAGE COLLECTION & CPU STATS
    */
    
    //var d100 = Math.floor((Math.random() * 100) + 1); 
    // garbage collect dead creep memories 1% of the time
    if ( Game.time % 100 == 0) {
        debug('Clearing non-existing creep memory:');
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                debug('\tdeleting'+ name);
            }
        }
    }
    
    // reset room tallies every time
    for(let roomName in Game.rooms) {
        let memory = Memory.rooms[roomName];
        if(!memory) {
            Memory.rooms[roomName] = {};
            memory = Memory.rooms[roomName];
        }
        if(memory){
            memory.tally = {};
            memory.tally.harvesters = 0;
            memory.tally.upgraders = 0;
            memory.tally.builders = 0;
            memory.tally.guards = 0;
            memory.tally.healers = 0;
            memory.tally.claimers = 0;
            memory.tally.miners = 0;
        }
        
        let room = Game.rooms[roomName];
        
        /*
        **  One-time per-room source mapping
        */
        if(!memory.sourceOpenings || !memory.totalOpenings) {
            let sources = room.find(FIND_SOURCES);
            let sourceOpenings = {};
            let totalOpenings = 0;
            for (let i=0; i<sources.length; i++) {
                let look = room.lookForAtArea(LOOK_TERRAIN, sources[i].pos.y-1, sources[i].pos.x-1, sources[i].pos.y+1, sources[i].pos.x+1, true);
                let wallCount = 0;
                look.forEach(function(lookObject) {
                    if( lookObject[lookObject.type] == 'wall' ) {
                        wallCount++;
                    }
                });
                let x = 9 - wallCount;
                sourceOpenings[sources[i].id] = x;
                totalOpenings += x;
            }
            memory.sourceOpenings = sourceOpenings;
            memory.totalOpenings = totalOpenings;
            debug("Performed one-time source mapping for room "+room.name);
        }
        
        /*
        **  TOWER LOGIC
        */
        let towerStartCpu = Game.cpu.getUsed();
        let towers = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_TOWER;
            }
        });
        for(let i in towers) {
            roleTower(towers[i]);
        }
        debug('Tower logic used '+ (Game.cpu.getUsed() - towerStartCpu)+' CPU time');
    }

    debug('Non-creep logic used '+ (Game.cpu.getUsed() - startCpu)+' CPU time');



    /*
    **  CREEP RUN & TALLY
    */
    var ttlThreshold = 100;
    for(let name in Game.creeps) {
        var creep = Game.creeps[name];
        
        var creepStartCpu = Game.cpu.getUsed();
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
            if(creep.spawning || creep.ticksToLive > ttlThreshold)
                creep.room.memory.tally.harvesters++;
        }
        else if(creep.memory.role == 'upgrader') {
            if(creep.room.memory.fullComplement || creep.room.energyCapacityAvailable < 900) {
                roleUpgrader.run(creep);
            }
            if(creep.spawning || creep.ticksToLive > ttlThreshold)
                creep.room.memory.tally.upgraders++;
        }
        else if(creep.memory.role == 'builder') {
            if(creep.room.memory.fullComplement || creep.room.energyCapacityAvailable < 800) {
                roleBuilder.run(creep);
            } else if(creep.room.energyCapacityAvailable > 1200){
                roleScavenge.run(creep);
            }
            if(creep.spawning || creep.ticksToLive > ttlThreshold)
                creep.room.memory.tally.builders++;
        }
        else if(creep.memory.role == 'guard') {
            roleGuard.run(creep);
            if(creep.spawning || creep.ticksToLive > ttlThreshold)
                creep.room.memory.tally.guards++;
        }
        else if(creep.memory.role == 'healer') {
            roleHealer.run(creep);
            if(creep.spawning || creep.ticksToLive > ttlThreshold)
                creep.room.memory.tally.healers++;
        }
        else if(creep.memory.role == 'claimer') {
            roleClaimer.run(creep);
            if(creep.spawning || creep.ticksToLive > ttlThreshold)
                creep.room.memory.tally.claimers++;
        }
        else if(creep.memory.role == 'miner') {
            roleMiner.run(creep);
            if(creep.spawning || creep.ticksToLive > ttlThreshold)
                creep.room.memory.tally.miners++;
        }
        debug('Creep '+name+' \t('+creep.memory.role+' / '+ creep.ticksToLive+')\thas used\t'+(Game.cpu.getUsed() - creepStartCpu)+' CPU time');
    }

    // SPAWNING SECTION
    for( spawnName in Game.spawns ) {
        var spawn = Game.spawns[spawnName];
        Memory.rooms[spawn.room.name].hasSpawn = true;
        var energyCap = spawn.room.energyCapacityAvailable;
        var harvesterCap = Math.ceil(1.5 * Memory.rooms[spawn.room.name].totalOpenings);
        var upgraderCap = 1;
        var builderCap = 1;
        var minerCap = 0;
        
        /*  trigger this if minerals > 0 somehow?
        //  Game.rooms['W53N31'].find(FIND_MINERALS)[0].mineralAmount
        if(energyCap >= 2300) {
            minerCap = 1;
        }
        */
        
        if (energyCap >= 1300) {
            upgraderCap = 1;
            builderCap = 1;
        } else if (energyCap >= 800) {
            upgraderCap = 3;
            builderCap = 1;
        } else if(energyCap >= 450) {
            upgraderCap = 2;
            builderCap = 2;
        } else if(energyCap >= 350) {
            upgraderCap = 2;
            builderCap = 1;
        } else {
            upgraderCap = 2;
            builderCap = 1;
        }
        var guardsCap = 1;//2;//Math.ceil((harvesterCap) / 2);
        let spawned = 0;
    
        spawn.room.memory.fullComplement =  (spawn.room.memory.tally.harvesters >= harvesterCap) && 
                                            (spawn.room.memory.tally.upgraders >= upgraderCap);

        if(!spawn.room.memory.fullComplement) {
            let memory = Memory.rooms[spawn.room.name];
            console.log( 'Room: '+ spawn.room.name + '\tEnergy: '+spawn.room.energyAvailable+' / '+spawn.room.energyCapacityAvailable+'\n' +
                'Harvesters: '+memory.tally.harvesters +'\tUpgraders: '+memory.tally.upgraders+'\t'+'\tBuilders: '+memory.tally.builders+
                '\tGuards: '+memory.tally.guards+'\tMiners:'+memory.tally.miners+'\tClaimers: '+memory.tally.claimers);
        }
    
        if(spawn.room.memory.tally.harvesters < harvesterCap) {
            let args = [];
            if(energyCap < 450 || (spawn.room.memory.tally.harvesters == 0)) {
                args = [WORK, CARRY, MOVE];
            } else if(energyCap < 600) {
                args = [WORK, WORK, CARRY, MOVE, MOVE, MOVE];
            } else if (energyCap < 800) {
                args = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
            } else if (energyCap < 1300) {
                args = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
            } else {
                args = [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE];
            }
            let ret = spawn.createCreep( args, null, {role: 'harvester'} );
            if(ret == OK)
                spawned++;
        }
        if(spawned == 0 && spawn.room.memory.tally.upgraders < upgraderCap) {
            if(energyCap < 350) {
                args = [WORK, CARRY, MOVE];
            } else if(energyCap < 600) {
                args = [WORK, WORK, CARRY, MOVE, MOVE, MOVE];
            } else if (energyCap < 800) {
                args = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
            } else if (energyCap < 1300) {
                args = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
            } else if (spawn.room.memory.totalOpenings > 2) {
                args = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE];
            } else {
                args = [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
            }
            let ret = spawn.createCreep( args, null, {role: 'upgrader'} );
            //spawn.createCreep( [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], null, {role: 'upgrader'} );
            if(ret == OK)
                spawned++;
        }
        if(spawned == 0 && spawn.room.memory.fullComplement && spawn.room.memory.tally.builders < builderCap) {
            if(energyCap < 350) {
                args = [WORK, CARRY, MOVE];
            } else if(energyCap < 450) {
                args = [WORK, WORK, CARRY, MOVE, MOVE];
            } else if (energyCap < 1300) {
                args = [WORK, WORK, CARRY, MOVE, MOVE];
            } else {
                args = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
            }
            //let ret;
            //if( energyCap < 900 || spawn.room.memory.tally.builders == 0 ) {
                ret = spawn.createCreep( args, null, {role: 'builder'} );
            //} else {
            //    ret = spawn.createCreep( [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], null, {role: 'claimer'} );
            //}
            if(ret == OK)
                spawned++;
        }
        if(spawned == 0 && Game.gcl.level > Game.spawns.length && energyCap > 799) {
            let ret = spawn.createCreep( [CLAIM, MOVE], null, {role: 'claimer'} );
            if(ret == OK)
                spawned++;
        }
        if(spawned == 0 && spawn.room.memory.fullComplement && energyCap > 499 && spawn.room.memory.tally.guards < guardsCap) {
            let ret = spawn.createCreep([TOUGH, MOVE, ATTACK, MOVE, ATTACK], null, {role: 'guard'});
            if(ret == OK)
                spawned++;
        }
        if(spawned == 0 && spawn.room.memory.fullComplement && spawn.room.memory.tally.miners < minerCap) {
            let ret = spawn.createCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE], null, {role: 'miner'});
            if(ret == OK)
                spawned++;
        }
    }    
    let elapsed = Game.cpu.getUsed() - startCpu;
    debug('Total time used '+ elapsed +' CPU time\n---------------------------------------------------------\n');
    if(elapsed > 12) 
        console.log(debugOutput);
}