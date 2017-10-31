window.app.register('dialogs', function(app) {

    'use strict';

    var exports = {};

    var config = {
        selDialogs : '#dialogs'
    };

    var showStart = function(){

        var jqDialogs = $(config.selDialogs),
            jqStartDialog = $('#landing', jqDialogs),
            jqStart = $('#btnStartShooting', jqStartDialog);

        jqStart.on('click', function(){

            jqStartDialog.hide();
            jqDialogs.hide();

            window.app.startSeq();

        });

        jqStartDialog.show();
        jqDialogs.show();

    };

    var showWon = function(){

        var jqDialogs = $(config.selDialogs),
            jqWonDialog = $('#winner', jqDialogs),
            jqRestartBtn = $('#btnStartAnother', jqWonDialog);

        jqRestartBtn.on('click', function(){

            jqWonDialog.hide();
            jqDialogs.hide();

            window.app.startSeq();

        });

        jqWonDialog.show();
        jqDialogs.show();

    };

    var showLose = function(){

        var jqDialogs = $(config.selDialogs),
            jqLoseDialog = $('#looser', jqDialogs),
            jqRestartBtn = $('#btnRestart', jqLoseDialog);

        jqRestartBtn.on('click', function(){

            jqLoseDialog.hide();
            jqDialogs.hide();

            window.app.startSeq();

        });

        jqLoseDialog.show();
        jqDialogs.show();

    };

    var showDialogs = function(dialogName){

        switch(dialogName){

            case 'startScreen' :
                showStart();
                break;
            case 'wonScreen':
                showWon();
                break;
            case 'loseScreen':
                showLose();
                break;
            case 'restartScreen':
            default: throw "Wrong screen requested" + dialogName;

        }

    };

    exports.show = function(dialogName) {
        return showDialogs(dialogName);
    };

    return exports;

});