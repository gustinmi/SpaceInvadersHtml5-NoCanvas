
function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

$.fn.refresh = function() { /* forces to refresh snapshot of jquery selector's selection */
    return $(this.selector);
};
