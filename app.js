function App() {
    this.root = {};

    this.state = {
        paused : false
    };

    this.config = {

        invaderCharacters : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'z', 'x', 'w'],

        invadersMovementNum: 10,  // how many victims
        invaderMoveInterval : 10600,
        speedUpRatio : 1000,

        ESC : 27,

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
    };
    this.jqGun = undefined;
    this.jqInvasionFleete = undefined;
}

App.prototype = {

	register : function(name, factory){
		this.root[name] = factory(this);
	},

    setState: function(key, val){
        this.state[key] = val;
    },

    getState: function(key){
        return this.state[key];
    },

    getConfig: function(){
       return this.config;
    },


    jqFireBall : function (top, left, id) {
        var props = {
            id: id,
            src: "img/cannonball.png",
            class: "canonBall",
            css: {
                position: "absolute",
                top: top,
                left: left
            }
        };

        return $("<img/>", props);
    },

    jqInvader : function (invaderChar) {
        var CONF = this.config,
            charIdx = Math.floor(invaderChar),
            id = CONF.bblockCounter++,
            props = {
                class: "bblock new",
                id: "bb_" + id,
                html : "<span>" + CONF.invaderCharacters[charIdx] + "</span>",
                data: {
                    name: "normal-div",
                    role: "building-block"
                }
            };

        return $("<div/>", props);
    },

    startSeq : function (){

        var i, jqNewBlock, invaderCharNum, CONF = this.config, that = this;
        //debugger;

        $("#txtPoints").text("0");
        $("#txtShots").text("0");

        this.jqInvasionFleete.empty().css('top', '40px').css('left', 0);

        /* fill initial invader grid */

        for(i=0; i< CONF.numOfInvaders; i++){
            invaderCharNum = getRandomInRange(0, CONF.invaderCharacters.length);
            jqNewBlock = this.jqInvader(invaderCharNum);
            this.jqInvasionFleete.append(jqNewBlock);
        }

        /* animate the invaders invaderCharacters */
        CONF.intervals.invaderCharacterChangeInt = setInterval(function(){
            $(".bblock.new").each(function(){
                var charIdx = Math.floor(getRandomInRange(0, CONF.invaderCharacters.length)),
                    invaderChar =  CONF.invaderCharacters[charIdx];
                $("span", $(this)).text(invaderChar);
            });
        }, 1000);

        /* initial first move of invaders */
        setTimeout(function(){
            that.move(that.jqInvasionFleete, 100, 50, 100);

            /* incremental speed moving of invaders */
            CONF.intervals.invaderFleteMoveInt = setInterval(function() {

                that.move(that.jqInvasionFleete, 100, 50, 100);

                /* detect end of game */

                var liveInvaders = $(".bblock.new");
                liveInvaders = liveInvaders.refresh(); // force jquery refresh  snapshot

                var hitList = liveInvaders.collision("#life_lost_wall");
                if(hitList.length > 0){
                    that.stopSeq();
                    app.root.dialogs.show('loseScreen');
                }

                // check for player won (all blocks added to scene)
                CONF.invadersMovementNum--;
                if (!CONF.invadersMovementNum)
                    clearInterval(CONF.intervals.invaderFleteMoveInt);
                else
                    CONF.invaderMoveInterval -=  CONF.speedUpRatio;

            }, CONF.invaderMoveInterval);


        }, 300);

        $(window).on('keydown', this.handleKeyboard);
    },

    stopSeq : function(){
        var  CONF = this.config;

        $(window).off('keydown', this.handleKeyboard);

        this.jqInvasionFleete.stop();
        clearInterval(CONF.intervals.invaderFleteMoveInt);
        clearInterval(CONF.intervals.invaderCharacterChangeInt);
    },

    moveBaseship : function (dir) {
        var CONF = this.config;
        this.jqGun.offset(function(index, curpos) {

            // correct offset limit. baseship stays where she is
            if (dir === "left" && curpos.left <= -(CONF.cannon.width / 2)) return curpos;
            if (dir === "right" && curpos.left > CONF.gunRightMax) return curpos;

            // otherwise move it in accordance with ratio
            return {
                left: curpos.left + (dir === "left" ? (-CONF.clickToPixelRatio) : CONF.clickToPixelRatio)
            };

        });
    },

    fire : function () {
        console.log("fire !!");

        var that = this,
            CONF = this.config,
            offsetTop = $("#cannon").offset().top,
            offsetLeft = $("#cannon").offset().left + (CONF.cannon.width / 2) - 20,
            id = "ball_" + CONF.shootCounter,
            jqBall = this.jqFireBall(offsetTop, offsetLeft, id); // create cannon ball image

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
                        that.incKilledCounter();

                        /*check for victory*/
                        $(".bblock.new").refresh();

                        if($(".bblock.new").length < 1){

                            that.stopSeq();
                            app.root.dialogs.show('wonScreen');

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
    },

    incKilledCounter : function (){
        var CONF = this.config;
        CONF.data.killedCounter++;
        $("#txtPoints").text(CONF.data.killedCounter);
    },

    move : function (jqElt, step1, step2, step3) {
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
    },

    handleKeyboard : function (evt) {
        var  CONF = window.app.getConfig();
        if (evt.keyCode === CONF.LEFT_ARROW)
            window.app.moveBaseship("left");
        else if (evt.keyCode === CONF.RIGHT_ARROW)
            window.app.moveBaseship("right");
        else if (evt.keyCode === CONF.SPACE)
            window.app.fire();
        else if (evt.keyCode === CONF.ESC){
            /*if (app.getState('paused') === true){
                app.setState('paused', false);
                window.app.startSeq();
            }else{
                app.setState('paused', true)
                window.app.stopSeq();
            }*/
            window.app.stopSeq();
        }
        else
            return;
    },


    onStart: function() {
		'use strict';

        var CONF = this.config;

        this.jqGun = $("#cannon"),
        this.jqInvasionFleete = $("#invasion-land");

        if(!this.jqGun || !this.jqInvasionFleete ) throw "Tehnical error. Stopping the game!";

        // callculate actual runtime dimensions based on user's viewport dimensions

        CONF.cannon.width = this.jqGun.width();
        CONF.cannon.height = this.jqGun.height();
        CONF.pageSize = CONF.viewport.width / CONF.cannon.width; // how many guns can be on x axis
        CONF.gunRightMax = CONF.cannon.width * CONF.pageSize - (CONF.cannon.width / 2); // max left offset of a gun, so that at least half of gun is visible

        console.log("Space invaders started!");

        app.root.dialogs.show('startScreen');
    }

};

// bootstrap sequence

(function(){
	var app = new App();
	window.app = app;
	window.register = app.register;
	document.addEventListener("DOMContentLoaded", function() {
		app.onStart();	
	});
})();