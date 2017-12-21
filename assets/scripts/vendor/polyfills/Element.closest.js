/**
 * Element.closest() polyfill for Internet Explorer IE 9+
 * Matches jQuery.closest()
 *
 * source: https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
 * usage: https://caniuse.com/#feat=element-closest
 */

if (!Element.prototype.matches)
    Element.prototype.matches = Element.prototype.msMatchesSelector ||
                                Element.prototype.webkitMatchesSelector;

if (!Element.prototype.closest)
    Element.prototype.closest = function(s) {
        var el = this;
        if (!document.documentElement.contains(el)) return null;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null); 
        return null;
    };
