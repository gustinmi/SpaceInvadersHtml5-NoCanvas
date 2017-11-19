/* global namespace */
window.spainv = {

    isDebug : true,

    /* keyboard events that we listen */
    evtArr : {
        27 : 'ESC',          // ESC key
        37 : 'LEFT_ARROW',   // ascii keycode <
        39 : 'RIGHT_ARROW',  // ascii keycode >
        32 : 'SPACE',        // ascii keycode SPACE
        13 : 'ENTER'         // enter key 
    }

};

function App() {
    this.root = {};

    this.jqDispatcher = undefined;

    this.stateInternal = {
        paused : false,
        killedCounter : 0,
        shotsFired : 0
    };
    this.eventModel = {
        /* this is filled by calling registerEvent*/
    };
    this.config = {

        invaderCharacters : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'z', 'x', 'w'],

        invadersMovementNum: 10,  // how many victims
        invaderMoveInterval : 5000 + 600 + 5000,
        speedUpRatio : 1000,

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

        intervals: {
            invaderCharacterChangeInt : undefined,
            invaderFleteMoveInt : undefined
        },

        fleeteAnimationSteps:{
            left : 100,
            down: 50,
            right: 100
        }
    };
    this.jqGun = undefined;
    this.jqInvasionFleete = undefined;

    this.eventModel = { /* this is filled by calling registerEvent*/ };

}

App.prototype = {

	register : function(name, factory){
		this.root[name] = factory(this);
	},

    registerEvent : function(evtName, evtCb){
        this.eventModel[evtName] = evtCb;
    },

    unRegisterEvent : function(evtName){
        delete this.eventModel[evtName];
    },

    getFleete : function(){
        return this.jqInvasionFleete;
    },

    getConfig: function(){
        return this.config;
    },

    state : function(key, val){
        /* get or set state*/
        if (key && val){
            this.stateInternal[key] = val;
        }else if (key){
            return this.stateInternal[key];
        }
    },

    getEventModel: function(){
        return this.eventModel;
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
                html : '<span style="' +  'color: ' + '#' + co('') +'">' + CONF.invaderCharacters[charIdx] + "</span>",
                data: {
                    name: "normal-div",
                    role: "building-block"
                }
            };

        return $("<div/>", props);
    },

    detectCollision : function(selBase, selCollider){
        var jqBaseObject = $(selBase),
            hitList;

        jqBaseObject = jqBaseObject.refresh();
        hitList = jqBaseObject.collision(selCollider);

        if(hitList.length > 0){
            return true;
        }

    },

    invaderFleeteMoveAnimation : function(){
        var CONF = app.getConfig();

        if (app.state('paused') === true) return;

        app.move(app.getFleete());   // animation loop

        /* detect end of game */

        if(app.detectCollision(".bblock.new", "#life_lost_wall")){
            app.stopSeq();
            app.root.dialogs.show('loseScreen');
        }

        // check for player won (all blocks added to scene)
        CONF.invadersMovementNum--;
        if (!CONF.invadersMovementNum)
            clearInterval(CONF.intervals.invaderFleteMoveInt);
        else
            CONF.invaderMoveInterval -=  CONF.speedUpRatio;


    },


    mamaShipApperance : function(){

        var jqMotherShip = $('.mamaship');

        jqMotherShip.animate({
            left: -201
        },
        {
            duration: 5000,
            easing: "linear",

            start : function(){

            },

            step: function() { /* one step of shot fired animation */

            },

            complete: function() { // only when animation is successfully finished at 0

            },

            always : function(){
                $(this).remove();

            }
        });


    },

    startSeq : function (){

        var i, jqNewBlock, invaderCharNum, CONF = this.config, that = this;

        window.app.root.statusBar.reset();

        this.jqInvasionFleete.empty().css('top', '40px').css('left', 0);

        /* fill initial invader grid */
        for(i=0; i< CONF.numOfInvaders; i++){
            invaderCharNum = getRandomInRange(0, CONF.invaderCharacters.length);
            jqNewBlock = this.jqInvader(invaderCharNum);
            this.jqInvasionFleete.append(jqNewBlock);
        }

        /* animate the invaderCharacters periodically */
        CONF.intervals.invaderCharacterChangeInt = setInterval(function(){
            $(".bblock.new").each(function(){
                var charIdx = Math.floor(getRandomInRange(0, CONF.invaderCharacters.length)),
                    invaderChar =  CONF.invaderCharacters[charIdx];
                $("span", $(this)).text(invaderChar).css('color', '#' + co(''));

            });
        }, 1000);

        window.app.root.statusBar.startTimer();

        /* animation loop for invaders */
        setTimeout(function(){
            /* initial first move of invaders // takes time span of 1 CONF.invaderMoveInterval  */
            that.move(that.jqInvasionFleete);

            /* incremental speed moving of invader fleete */
            CONF.intervals.invaderFleteMoveInt = setInterval(that.invaderFleeteMoveAnimation, CONF.invaderMoveInterval);

        }, 300); // initial delay

        app.registerEvent('LEFT_ARROW', function(){
            window.app.moveBaseship("left");
        });

        app.registerEvent('RIGHT_ARROW', function(){
            window.app.moveBaseship("RIGHT_ARROW");
        });

        app.registerEvent('SPACE', function(){
            window.app.fire();
        });

        app.registerEvent('ESC', function(){
            window.app.state('paused', true);
            that.jqInvasionFleete.stop();
            app.root.dialogs.show('restartScreen');
        });

    },

    stopSeq : function(){
        var  CONF = this.config;

        app.unRegisterEvent('LEFT_ARROW');
        app.unRegisterEvent('RIGHT_ARROW');
        app.unRegisterEvent('SPACE');
        app.unRegisterEvent('ESC');

        this.jqInvasionFleete.stop();
        clearInterval(CONF.intervals.invaderFleteMoveInt);
        clearInterval(CONF.intervals.invaderCharacterChangeInt);

        window.app.root.statusBar.stopTimer();
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
                    //debugger;
                    app.stateInternal.shotsFired++;
                    window.app.root.statusBar.refresh('#txtShots', app.stateInternal.shotsFired);
                    new Audio(CONF.shootAudio).play();

                    that.jqDispatcher.trigger( "spainv:shotfired" );

                },

                step: function() { /* one step of shot fired animation */
                    var hitList, mamaShipKilledBonus;

                    // check for collision (a hit) with invaders
                    hitList = jqBall.collision(".bblock.new");
                    if(hitList && hitList.length > 0){
                        new Audio(CONF.killedAudio).play();

                        $(hitList[0]).toggleClass("new").toggleClass("destroyed");
                        $("span", $(hitList[0])).text(" "); // dont delete it, it will shrink selection

                        $(this).stop(); // stop animation
                        that.incKilledCounter();

                        /*check for victory*/
                        $(".bblock.new").refresh();

                        if($(".bblock.new").length < 1){

                            that.stopSeq();
                            app.root.dialogs.show('wonScreen');

                        }
                    }

                    // if mother ship is passing by, check if shot hit her
                    if ($('.mamaline').has('.mamaship')){

                        hitList = jqBall.collision(".mamaship");
                        if(hitList && hitList.length > 0){
                            new Audio(CONF.killedAudio).play();
                            $('.mamaship').stop().remove();

                            mamaShipKilledBonus = app.state('killedCounter') + Math.floor(getRandomInRange(10, 100));
                            app.state('killedCounter', mamaShipKilledBonus);

                            window.app.root.statusBar.refresh('#txtPoints', mamaShipKilledBonus);

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
        var st = app.state('killedCounter');
        st++;
        app.state('killedCounter', st);
        window.app.root.statusBar.refresh('#txtPoints', st);
    },

    /* animation path for invaders (left, down, right) */
    move : function (jqInvFleet) {
        window.spainv.isDebug && console.log("Invaders Move animation");
        jqInvFleet.stop().animate({
            left: "+=" + app.getConfig().fleeteAnimationSteps.left    // move to the left side
        }, 5000, function() {
            $(this).animate({
                top: "+=" + app.getConfig().fleeteAnimationSteps.down  // move down towards shooter
            }, 600, function() {
                $(this).animate({
                    left: "-=" + app.getConfig().fleeteAnimationSteps.right  // move right
                }, 5000, function(){

                });
            });
        });
    },

    handleKeyboard : function (evt) {
        var eventModel = window.app.getEventModel() ,
            keyName = window.spainv.evtArr[evt.keyCode];
        //debugger;
        if (eventModel.hasOwnProperty(keyName))
            eventModel[keyName]();

    },

    onStart: function() {
		'use strict';

        var CONF = this.config;

        this.jqDispatcher = $("#dispatcher");

        this.jqGun = $("#cannon");
        this.jqInvasionFleete = $("#invasion-land");

        if(!this.jqGun || !this.jqInvasionFleete) throw "Tehnical error. Stopping the game!";

        // callculate actual runtime dimensions based on user's viewport dimensions

        CONF.cannon.width = this.jqGun.width();
        CONF.cannon.height = this.jqGun.height();
        CONF.pageSize = CONF.viewport.width / CONF.cannon.width; // how many guns can be on x axis
        CONF.gunRightMax = CONF.cannon.width * CONF.pageSize - (CONF.cannon.width / 2); // max left offset of a gun, so that at least half of gun is visible

        console.log("Space invaders started!");

        $(window).on('keydown', _.throttle(this.handleKeyboard, 100));

        this.jqDispatcher.on('spainv:shotfired', function(){

            console.log('shot was fired');

        });

        //noinspection JSUnresolvedVariable
        app.root.dialogs.show('startScreen');


        // mother ship handling (random interval)
        (function loop() {
            var rand = getRandomInRange(15500, 10000);
            setTimeout(function() {

                var jqMamaline = $('.mamaline'),
                    jqMamaShip = $('<span class="mamaship">H</span>');

                jqMamaline.append(jqMamaShip);

                console.log("Loop called with random timeout : " + rand);
                app.mamaShipApperance();
                loop();
            }, rand);
        }());

    }

};

// bootstrap sequence

(function(){
	var app = new App();
	window.app = app; // global var for events
	window.register = app.register; // for modules
	document.addEventListener("DOMContentLoaded", function() {
		app.onStart();	
	});
})();