window.app.register('statusBar', function(app) {

    'use strict';

    var exports = {},
        secondsInterval,
        jqToolbar;

    var config = {
        toolbar : '#toolbar'
    };

    var refreshComponent = function(jqSel, val) {
        //debugger;
        jqToolbar = jqToolbar ? jqToolbar.refresh() : $(config.toolbar);
        $(jqSel, jqToolbar).text(val);
    };

    var resetAll = function(){
        jqToolbar = jqToolbar ? jqToolbar.refresh() : $(config.toolbar);
        $('.valueInt', jqToolbar).text("0");
    };

    var timer = function(){

        var seconds = 0,
            el = $('#txtTimer');

        $('#txtTimer').text("0"); // reset game time

        function incrementSeconds() {
            seconds += 1;
            el.text(seconds);
        }

        secondsInterval = setInterval(incrementSeconds, 1550);

    };

    exports.startTimer = function() {
        timer();
    };

    exports.stopTimer = function() {
        clearInterval(secondsInterval);
    };


    exports.refresh = function(name, val) {
        return refreshComponent(name, val);
    };

    exports.reset = function() {
        return resetAll();
    };

    return exports;

});
