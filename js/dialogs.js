window.app.register('dialogs', function(app) {

    'use strict';

    var exports = {},
        jqDialogs;

    var config = {
        toolbar : '#dialogs'
    };

    var onClose= function(jqDialog){
        jqDialog.hide();
        jqDialogs.hide();
        window.app.unRegisterEvent('ENTER');
    };

    var showStart = function(){

        var jqStartDialog = $('#landing', jqDialogs),
            jqStart = $('#btnStartShooting', jqStartDialog);

        jqStart.on('click', function(){
            onClose(jqStartDialog);
            window.app.startSeq();
        });

        jqStartDialog.show();
        jqDialogs.show();

        window.app.registerEvent('ENTER', function(){
            onClose(jqStartDialog);
            window.app.startSeq();
        });

    };

    var showWon = function(){

        var jqWonDialog = $('#winner', jqDialogs),
            jqRestartBtn = $('#btnStartAnother', jqWonDialog);

        jqRestartBtn.on('click', function(){
            onClose(jqWonDialog);
            window.app.startSeq();
        });

        jqWonDialog.show();
        jqDialogs.show();

    };

    var showLose = function(){

        var jqLoseDialog = $('#looser', jqDialogs),
            jqRestartBtn = $('#btnRestart', jqLoseDialog);

        jqRestartBtn.on('click', function(){
            onClose(jqLoseDialog);
            window.app.startSeq();
        });

        jqLoseDialog.show();
        jqDialogs.show();

    };

    var restartScreen = function(){

        var jqRestartDialog = $('#restart', jqDialogs),
            jqBtnResume = $('#btnResume', jqRestartDialog),
            jqBtnRestartGame = $('#btnRestartGame', jqRestartDialog);

        jqBtnResume.on('click', function(){
            window.app.state('paused', false);
            onClose(jqRestartDialog);
        });

        jqBtnRestartGame.on('click', function(){
            onClose(jqRestartDialog);
            window.app.stopSeq();
            window.app.startSeq();
        });

        jqRestartDialog.show();
        jqDialogs.show();
    };


    var showDialogs = function(dialogName){

        jqDialogs = jqDialogs ? jqDialogs.refresh() : $(config.toolbar);

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
                restartScreen();
                break;

            default: throw "Wrong screen requested" + dialogName;

        }

    };

    exports.show = function(dialogName) {
        return showDialogs(dialogName);
    };

    return exports;

});