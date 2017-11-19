
/* hex color generator */
function co(lor){
    return (lor +=
    [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
    && (lor.length == 6) ?  lor : co(lor);
}


function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

$.fn.refresh = function() { /* forces to refresh snapshot of jquery selector's selection */
    return $(this.selector);
};
