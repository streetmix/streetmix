/**
 * Element.closest() polyfill for Internet Explorer
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
        var ancestor = this;
        if (!document.documentElement.contains(el)) return null;
        do {
            if (ancestor.matches(s)) return ancestor;
            ancestor = ancestor.parentElement;
        } while (ancestor !== null);
        return el;
    };
