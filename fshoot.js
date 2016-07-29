"use strict";
$(startUp);

function startUp() {

    var CONF = {
        invadersMovementNum: 10,  // how many victims
        invaderMoveInterval : 5000,
        speedUpRatio : 1000,

        LEFT_ARROW: 37,   // ascii keycode <
        RIGHT_ARROW: 39,  // ascii keycode >
        SPACE: 32,        // ascii keycode SPACE
        clickToPixelRatio: 25, // pixel ratio for left right arrow click (one click : RATIO pixels)
        shootDuration : 700, // duration of a shoot
        numOfInvaders : 40,
    
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

        shootAudio : "sounds/shoot.wav",
        killedAudio : "sounds/invaderkilled.wav",

        data : {
            killedCounter : 0,
            shotsFired : 0
        },

        intervals: {
            invaderCharacterChangeInt : undefined,
            invaderFleteMoveInt : undefined
        }
    };

    var gun = $("#cannon");

    CONF.pageSize = CONF.viewport.width / CONF.cannon.width; // how many guns can be on x axis
    CONF.gunRightMax = CONF.cannon.width * CONF.pageSize - (CONF.cannon.width / 2); // max left offset of a gun, so that at least half of gun is visible

    function jqFireBall(top, left, id) {
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

    function jqInvader(invaderChar) {

        var id = CONF.bblockCounter++,
            props = {
                class: "bblock new",
                id: "bb_" + id,
                html : "<span>" + invaderChar + "</span>",
                data: {
                    name: "normal-div",
                    role: "building-block"
                }
            };

        return $("<div/>", props);
    }

    function startSeq(){


        var i, jqNewBlock, invaders = ["a", "f"];

        /* fill initial invader grid */

        for(i=0; i< CONF.numOfInvaders; i++){
            jqNewBlock = jqInvader(invaders[0]);
            $("#invasion-land").append(jqNewBlock);
        }

        CONF.intervals.invaderCharacterChangeInt = setInterval(function(){ /* animate the pixel like characters */
            $(".bblock.new").each(function(){
                $(this).text() === invaders[0] ?  $(this).text(invaders[1]) : $(this).text(invaders[0]);
            });
        }, 1000);


        /* initial first move of invaders */
        setTimeout(function(){
            move($("#invasion-land"), 100, 50, 100);

            /* incremental speed moving of invaders */
            CONF.intervals.invaderFleteMoveInt = setInterval(function() {
                
                move($("#invasion-land"), 100, 50, 100);
                
                /* TODO detect end of game */

                var liveInvaders = $(".bblock.new");
                liveInvaders = liveInvaders.refresh();

                var hitList = liveInvaders.collision("#life-lost-wall");
                if(hitList && hitList.length > 0){
                    alert("You lost. Game over !");         
                    clearInterval(CONF.intervals.invaderFleteMoveInt);
                    clearInterval(CONF.intervals.invaderCharacterChangeInt);            
                }

                // check for player won (all blocks added to scene)
                CONF.invadersMovementNum--;
                if (!CONF.invadersMovementNum)
                    clearInterval(CONF.intervals.invaderFleteMoveInt);
                else 
                    CONF.invaderMoveInterval -=  CONF.speedUpRatio;

            }, CONF.invaderMoveInterval);


        }, 300);
       
        
    }

    function moveGun(dir) {
        gun.offset(function(index, curpos) {
            console.log(curpos);

            if (dir === "left" && curpos.left <= -(284 / 2)) return curpos;
            if (dir === "right" && curpos.left > CONF.gunRightMax) return curpos;

            return {
                left: curpos.left + (dir === "left" ? (-CONF.clickToPixelRatio) : CONF.clickToPixelRatio)
            };

        });
    }

    function fire() {
        console.log("fire !!");

        var offsetTop = $("#cannon").offset().top,
            offsetLeft = $("#cannon").offset().left + (CONF.cannon.width / 2) - 20,
            id = "ball_" + CONF.shootCounter,
            jqBall = jqFireBall(offsetTop, offsetLeft, id); // create cannon ball image

        $("body").append(jqBall); // add it to screen

        jqBall.animate({
            top: 0                // fire it (send it to top = 0)
        },
        {
            duration: CONF.shootDuration,

            start : function(){
                CONF.data.shotsFired++;
                $("#txtShots").text(CONF.data.shotsFired);
                new Audio(CONF.shootAudio).play();
            },

            step: function() { /* animate the pixel like characters */
                // check for collision (a hit) at every step of animation
                var hitList = jqBall.collision(".bblock.new");
                if(hitList && hitList.length > 0){
                    new Audio(CONF.killedAudio).play();

                    $(hitList[0]).replaceWith('<div class="bblock destroyed"><span>&nbsp;</span></div>');

                    $(this).stop(); // stop animation
                    incKilledCounter();
                }
                
            },

            complete: function() {
                console.log("The cannon bal reached end!");
            }, // only when animation is successfully finished at 0

            always : function(){
                $(this).remove();

                /*check for victory*/
                if(CONF.bblockCounter === 56){
                    alert("You won !!!!!!!");
                }

                CONF.shootCounter++;

            }
        });
    }

    function incKilledCounter(){
        CONF.data.killedCounter++;
        $("#txtPoints").text(CONF.data.killedCounter);
    }

    function move(jqElt, step1, step2, step3) {
        jqElt.animate({
            left: "+=" + step1,
        }, 1000, function() {
            $(this).animate({
                top: "+=" + step2,
            }, 1000, function() {
                $(this).animate({
                    left: "-=" + step3
                }, 1000);
            });
        });   
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

    $(window).on("keydown", handleArrowPressed);

    startSeq();

    console.log("Space invaders started!");
    console.log(CONF);

}