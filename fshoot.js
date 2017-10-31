"use strict";

window.SPAINV = {
    
    debug: false,

    invaderCharacters : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'z', 'x', 'w'],

    fns : {
        restart : undefined,
        stop : undefined
    }
};

$(function startUp() {

    var CONF = {
            invadersMovementNum: 10,  // how many victims
            invaderMoveInterval : 10600,
            speedUpRatio : 1000,

            LEFT_ARROW: 37,   // ascii keycode <
            RIGHT_ARROW: 39,  // ascii keycode >
            SPACE: 32,        // ascii keycode SPACE
            clickToPixelRatio: 25, // pixel ratio for left right arrow click (one click : RATIO pixels)
            shootDuration : 700, // duration of a shoot
            numOfInvaders : 40,
            pageSize : undefined, // how many ships can be on x axis (use to multiply effect of pressing left and right arrow )
            gunRightMax : undefined, // max right offset for players's ship 
            shootCounter: 0, // how many shoots fired
            bblockCounter : 0,  // how many family members created

            cannon: {
                width: undefined,
                height: undefined
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
        },
        jqGun = $("#cannon"),
        jqInvasionFleete = $("#invasion-land");

    if(!jqGun || !jqInvasionFleete ) throw "Tehnical error. Stopping the game!";   

    // callculate actual runtime dimensions based on user's viewport dimensions

    CONF.cannon.width = jqGun.width();
    CONF.cannon.height = jqGun.height();
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
        var charIdx = Math.floor(invaderChar),
            id = CONF.bblockCounter++,
            props = {
                class: "bblock new",
                id: "bb_" + id,
                html : "<span>" + window.SPAINV.invaderCharacters[charIdx] + "</span>",
                data: {
                    name: "normal-div",
                    role: "building-block"
                }
            };

        return $("<div/>", props);
    }

    function startSeq(){

        var i, jqNewBlock, invaderCharNum;

        /* fill initial invader grid */

        for(i=0; i< CONF.numOfInvaders; i++){
            invaderCharNum = getRandomInRange(0, window.SPAINV.invaderCharacters.length);
            jqNewBlock = jqInvader(invaderCharNum);
            jqInvasionFleete.append(jqNewBlock);
        }

        /* animate the invaders invaderCharacters */
        CONF.intervals.invaderCharacterChangeInt = setInterval(function(){ 
            $(".bblock.new").each(function(){
                var charIdx = Math.floor(getRandomInRange(0, window.SPAINV.invaderCharacters.length)),
                    invaderChar =  window.SPAINV.invaderCharacters[charIdx];
                $("span", $(this)).text(invaderChar);
            });
        }, 1000);


        /* initial first move of invaders */
        setTimeout(function(){
            move(jqInvasionFleete, 100, 50, 100);

            /* incremental speed moving of invaders */
            CONF.intervals.invaderFleteMoveInt = setInterval(function() {
                
                move(jqInvasionFleete, 100, 50, 100);
                
                /* detect end of game */

                var liveInvaders = $(".bblock.new");
                liveInvaders = liveInvaders.refresh(); // force jquery refresh  snapshot

                var hitList = liveInvaders.collision("#life_lost_wall");
                if(hitList.length > 0){

                    alert("You lost. Game over !");         
                    stopSeq();           
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

    function stopSeq(){
        jqInvasionFleete.stop();
        clearInterval(CONF.intervals.invaderFleteMoveInt);
        clearInterval(CONF.intervals.invaderCharacterChangeInt);         

        //$(window).off("keydown", handleArrowPressed);
    }

    function moveBaseship(dir) {
        jqGun.offset(function(index, curpos) {
            
            // correct offset limit. baseship stays where she is
            if (dir === "left" && curpos.left <= -(CONF.cannon.width / 2)) return curpos;
            if (dir === "right" && curpos.left > CONF.gunRightMax) return curpos;

            // otherwise move it in accordance with ratio
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

            step: function() { /* animate the pixel like invaderCharacters */
                // check for collision (a hit) at every step of animation
                var hitList = jqBall.collision(".bblock.new");
                if(hitList && hitList.length > 0){
                    new Audio(CONF.killedAudio).play();

                    $(hitList[0]).toggleClass("new").toggleClass("destroyed");
                    $("span", $(hitList[0])).text(" ");

                    $(this).stop(); // stop animation
                    incKilledCounter();

                    /*check for victory*/
                    $(".bblock.new").refresh();
                    
                    if($(".bblock.new").length < 1){
                        alert("You won !!!!!!!");
                        stopSeq();
                    }
                }
                
            },

            complete: function() {
                console.log("The cannon bal reached end!");
            }, // only when animation is successfully finished at 0

            always : function(){
                $(this).remove();

                CONF.shootCounter++;

            }
        });
    }

    function incKilledCounter(){
        CONF.data.killedCounter++;
        $("#txtPoints").text(CONF.data.killedCounter);
    }

    function move(jqElt, step1, step2, step3) {
        jqElt.stop().animate({
            left: "+=" + step1
        }, 5000, function() {
            $(this).animate({
                top: "+=" + step2
            }, 600, function() {
                $(this).animate({
                    left: "-=" + step3
                }, 5000);
            });
        });   
    }

    function handleKeyboard(evt) {

        if (evt.keyCode === CONF.LEFT_ARROW)
            moveBaseship("left");
        else if (evt.keyCode === CONF.RIGHT_ARROW)
            moveBaseship("right");
        else if (evt.keyCode === CONF.SPACE)
            fire();
        else
            return;

        //return false; // stop propagatio
    }

    window.addEventListener('keydown', handleKeyboard);
    startSeq();

    // global functions for controlling the game engine from browser's Javascript console
    window.SPAINV.fns.restart = startSeq;
    window.SPAINV.fns.stop = stopSeq;

    console.log("Space invaders started!");
});