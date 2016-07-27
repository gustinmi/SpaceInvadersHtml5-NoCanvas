"use strict";
$(startUp);

var FSHOOTER = window.FSHOOTER = {};

FSHOOTER.resourceManager = function(name){ 
    this.name = name;
    this.registered = {};
};

FSHOOTER.resourceManager.prototype = {
    add: function(name, resObj) {
        if (this.scenes[name]) throw '[FSHOOTER.resourceManager.add] The resource name "' + name + '" is already registered.';
        this.scenes[name] = resObj || {};
    },
    get : function(name){
        return this.registered[name] || null;
    }
};

FSHOOTER.scenes = new FSHOOTER.resourceManager("scenes"); 
FSHOOTER.scenes.add("landing", {
    "name" : "landing",
    "htmlTemplateId" : "#landing",
    "init" : function(){
        $('#btnStart').on("click", function(){
            
        })
    }
});



function startUp() {

    var CONF = {
        bblockNum: 1000,  // how many victims
        LEFT_ARROW: 37,   // ascii keycode <
        RIGHT_ARROW: 39,  // ascii keycode >
        SPACE: 32,        // ascii keycode SPACE
        clickToPixelRatio: 25, // pixel ratio for left right arrow click (one click : RATIO pixels)
        shootDuration : 700, // duration of a shoot
        players : {

            "tibor" : {
                img : "tibor.png",
                nick : "Robit"
            },

            "nika" : {
                img : "nika.png",
                nick : "Glista"
            },

            "vasja" : {
                img : "vasja.png",
                nick : "Vasko"
            },

            "mitja" : {
                img : "mitja.png",
                nick : "Guštin"
            },

        }
    };

    var runtime = {

        shootCounter: 0, // how many shoots fired

        bblockCounter : 0,  // how many family members created

        cannon: {
            width: 284,
            height: 75
        },

        viewport: {
            width: $(window).width(),
            height: $(window).height()
        },

        shootAudio : new Audio("shoot.wav"),

        data : {
            killedCounter : 0,
            shotsFired : 0,
            selectedVictim : undefined,
            selectedShooter : undefined
        }
    };

    var gun = $("#cannon");

    runtime.pageSize = runtime.viewport.width / runtime.cannon.width; // how many guns can be on x axis
    runtime.gunRightMax = runtime.cannon.width * runtime.pageSize - (runtime.cannon.width / 2); // max left offset of a gun, so that at least half of gun is visible

    function jqCannonBall(top, left, id) {
        var props = {
            id: id,
            src: "cannonball.png",
            class: "canonBall",
            css: {
                position: "absolute",
                top: top,
                left: left
            }
        };

        return $("<img/>", props);
    }

    function jqBuildBlock() {

        var id = runtime.bblockCounter++,
            props = {
                src: runtime.data.selectedVictim,
                css: {
                    border: 1,
                    "background-color": "red",
                    padding: "5px"
                },
                class: "bblock",
                id: "bb_" + id,
                data: {
                    name: "normal-div",
                    role: "building-block"
                }
            };

        return $("<img/>", props);
    }

    function startSeq(){

        /* block loop */
        var setT = setInterval(function() {

            //add new block
            var jqNewBlock = jqBuildBlock();
            $("#main").append(jqNewBlock);

            // detect if blocks reached the shooter's cannon >> game over
            var hitList = jqNewBlock.collision("#toolbar");
            if(hitList && hitList.length > 0){
                alert("GAME OVER !!!!");         
                clearInterval(setT);            
            }

            // check for player won (all blocks added to scene)
            CONF.bblockNum--;
            if (!CONF.bblockNum) clearInterval(setT);

        }, 300);
    }

    function moveGun(dir) {
        gun.offset(function(index, curpos) {
            console.log(curpos);

            if (dir === "left" && curpos.left <= -(284 / 2)) return curpos;
            if (dir === "right" && curpos.left > runtime.gunRightMax) return curpos;

            return {
                left: curpos.left + (dir === "left" ? (-CONF.clickToPixelRatio) : CONF.clickToPixelRatio)
            };

        });
    }

    function fire() {
        console.log("fire !!");

        var offsetTop = $("#cannon").offset().top,
            offsetLeft = $("#cannon").offset().left + (runtime.cannon.width / 2) - 20,
            id = "ball_" + runtime.shootCounter,
            jqBall = jqCannonBall(offsetTop, offsetLeft, id); // create cannon ball image

        $("body").append(jqBall); // add it to screen

        jqBall.animate({
            top: 0
        },
        {
            duration: CONF.shootDuration,

            start : function(){
                runtime.data.shotsFired++;
                $("#txtShots").val(runtime.data.shotsFired);
                runtime.shootAudio.play();
            },

            step: function() {
                var hitList = jqBall.collision(".bblock");
                if(hitList && hitList.length > 0){
                    hitList[0].remove();
                    $(this).stop(); // stop animation
                    incKilledCounter();
                }
                
            },

            complete: function() {

            },

            always : function(){
                $(this).remove();

                /*check for victory*/
                if($(".bblock").length < 1){
                    alert("You won !!!!!!!");
                }

                runtime.shootCounter++;

            }
        });
    }

    function incKilledCounter(){
        runtime.data.killedCounter++;
        $("#txtPoints").val(runtime.data.killedCounter);
    }

    function handleArrowPressed(evt) {

        if (evt.keyCode === CONF.LEFT_ARROW)
            moveGun("left");
        else if (evt.keyCode === CONF.RIGHT_ARROW)
            moveGun("right");
        else if (evt.keyCode === CONF.SPACE)
            fire();
        else
            return;

        //return false; // stop propagatio
    }

    function setupPlayers(players){
        var name, options = [];

        for(name in players){
            options.push('<option value="' + name + '">' + players[name].nick + "</option>");
        }

        $("#cbSelectShooter, #cbSelectVictim").html(options.join("")).on("change", function(){

            var id = $(this).attr("id"),
                elt = $(this),
                val = elt.val(),
                player = players[val];

            if(id==="cbSelectShooter"){

                $("#shooterImg").attr("src", player.img);
                runtime.data.selectedVictim = player.img;

            }else if(id==="cbSelectVictim"){

                $("#victimImg").attr("src", player.img);
                runtime.data.selectedShooter = player.img;                
            }

        });
    }

    $(window).on("keydown", handleArrowPressed);
    setupPlayers(CONF.players);
    $("#cbSelectShooter, #cbSelectVictim").trigger("change");

    startSeq();

    // $("#restartBtn").on("click", function(){
    //     startSeq();
    //     $("#main").empty();
    // });

    console.log("Started!");
    console.log(CONF);

}
