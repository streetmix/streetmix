var whatIsThis = (function(){
  var whatIsThis = {};

  var infoEl;
  var teaserEl;
  var shieldEl;

  var LOCAL_STORAGE_NAME = 'what-is-this-hidden-';

  var INFO_DELAY = 500;

  var SHIELD_OPACITY_DELAY = 200;

  function _addCssCode(cssCode) {
    var styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    if (styleElement.styleSheet) {
      styleElement.styleSheet.cssText = cssCode;
    } else {
      styleElement.appendChild(document.createTextNode(cssCode));
    }
    document.querySelector('head').appendChild(styleElement);
  };

  function _addCss() {
    var cssCode;

    cssCode = [];
    cssCode.push('#what-is-this-info,');
    cssCode.push('#what-is-this-teaser {');
    cssCode.push('  position: absolute;');
    cssCode.push('  z-index: 999999;');
    cssCode.push('  font-family: "Open Sans", Arial, sans-serif;');
    cssCode.push('  font-size: 13px;');
    cssCode.push('  line-height: 20px;');
    cssCode.push('  left: 50%;');
    cssCode.push('  margin-left: -250px;');
    cssCode.push('  box-sizing: border-box;');
    cssCode.push('  top: -99999px;');
    cssCode.push('  width: 500px;');
    cssCode.push('  border-radius: 3px;');
    cssCode.push('  padding: 10px 20px 20px 20px;');
    cssCode.push('  overflow: hidden;');
    cssCode.push('  box-shadow: 0 2px 5px rgba(0, 0, 0, .5);');
    cssCode.push('  -webkit-transition: background 250ms;');
    cssCode.push('  -moz-transition: background 250ms;');
    cssCode.push('  transition: background 250ms;');
    cssCode.push('}');
    _addCssCode(cssCode.join('\n'));

    cssCode = [];
    cssCode.push('#what-is-this-shield {');
    cssCode.push('  z-index: 999998;');
    cssCode.push('  position: fixed;');
    cssCode.push('  left: 0;');
    cssCode.push('  right: 0;');
    cssCode.push('  top: 0;');
    cssCode.push('  bottom: 0;');
    cssCode.push('  cursor: pointer;');
    cssCode.push('  opacity: 0;');
    cssCode.push('  background: white;');
    cssCode.push('  display: none;');
    cssCode.push('  -webkit-transition: opacity 200ms;');
    cssCode.push('  -moz-transition: opacity 200ms;');
    cssCode.push('  transition: opacity 200ms;');
    cssCode.push('}');
    _addCssCode(cssCode.join('\n'));


    cssCode = [];
    cssCode.push('#what-is-this-info {');
    cssCode.push('  background: white;');
    cssCode.push('}');
    _addCssCode(cssCode.join('\n'));

    cssCode = [];
    cssCode.push('#what-is-this-info::after {');
    cssCode.push('  content: "";');
    cssCode.push('  position: absolute;');
    cssCode.push('  right: 25px;');
    cssCode.push('  bottom: -20px;');
    cssCode.push('  display: block;');
    cssCode.push('  width: 24px;');
    cssCode.push('  height: 66px;');
    cssCode.push('  background-size: 24px 66px;');
    cssCode.push('}');
    _addCssCode(cssCode.join('\n'));

    cssCode = [];
    cssCode.push('#what-is-this-teaser {');
    cssCode.push('  background: white;');
    cssCode.push('  box-sizing: border-box;');
    cssCode.push('  width: 115px;');
    cssCode.push('  height: 45px;');
    cssCode.push('  line-height: 52px;');
    cssCode.push('  left: auto;');
    cssCode.push('  right: 20px;');
    cssCode.push('  top: -50px;');
    cssCode.push('  padding: 0;');
    cssCode.push('  -webkit-user-select: none;');
    cssCode.push('  user-select: none;');
    cssCode.push('  text-align: center;');
    cssCode.push('  position: absolute;');
    cssCode.push('  white-space: nowrap;');
    cssCode.push('  overflow: hidden;');
    cssCode.push('  cursor: pointer;');
    cssCode.push('}');
    _addCssCode(cssCode.join('\n'));

    cssCode = [];
    cssCode.push('#what-is-this-teaser:hover {');
    cssCode.push('  background: rgb(247, 232, 214);');
    cssCode.push('}');
    _addCssCode(cssCode.join('\n'));

    cssCode = [];
    cssCode.push('#what-is-this-teaser:active {');
    cssCode.push('  box-shadow: 0 2px 2px rgba(0, 0, 0, .5);');
    cssCode.push('}');
    _addCssCode(cssCode.join('\n'));

    cssCode = [];
    cssCode.push('#what-is-this-teaser::after {');
    cssCode.push('  content: "";');
    cssCode.push('  position: absolute;');
    cssCode.push('  right: 8px;');
    cssCode.push('  bottom: -40px;');
    cssCode.push('  display: block;');
    cssCode.push('  width: 24px;');
    cssCode.push('  height: 66px;');
    cssCode.push('  background-size: 24px 66px;');
    cssCode.push('}');
    _addCssCode(cssCode.join('\n'));

    cssCode = [];
    cssCode.push('#what-is-this-info p,');
    cssCode.push('#what-is-this-info h1 {');
    cssCode.push('  margin: 10px 0;');
    cssCode.push('}');
    _addCssCode(cssCode.join('\n'));

    cssCode = [];
    cssCode.push('#what-is-this-info h1 {');
    cssCode.push('  font-size: 100%;');
    cssCode.push('  font-weight: 600;');
    cssCode.push('  margin-bottom: 20px;');
    cssCode.push('}');
    _addCssCode(cssCode.join('\n'));

    cssCode = [];
    cssCode.push('#what-is-this-info a {');
    cssCode.push('  color: rgb(50, 100, 200);');
    cssCode.push('}');
    _addCssCode(cssCode.join('\n'));

    cssCode = [];
    cssCode.push('#what-is-this-info a:active {');
    cssCode.push('  position: relative;');
    cssCode.push('  top: 1px;');
    cssCode.push('}');
    _addCssCode(cssCode.join('\n'));

    cssCode = [];
    cssCode.push('#what-is-this-info .close {');
    cssCode.push('  position: absolute;');
    cssCode.push('  bottom: 20px;');
    cssCode.push('  right: 20px;');
    cssCode.push('  z-index: 1000;');
    cssCode.push('}');
    _addCssCode(cssCode.join('\n'));

    cssCode = [];
    cssCode.push('#what-is-this-info ul {');
    cssCode.push('  list-style: none;');
    cssCode.push('  margin: 0;');
    cssCode.push('  padding: 0;');
    cssCode.push('  margin-left: 1em;');
    cssCode.push('}');
    _addCssCode(cssCode.join('\n'));

    cssCode = [];
    cssCode.push('#what-is-this-info li::before {');
    cssCode.push('  content: "·";');
    cssCode.push('  position: absolute;');
    cssCode.push('  width: 1em;');
    cssCode.push('  margin-left: -1em;');
    cssCode.push('  display: inline-block;');
    cssCode.push('}');
    _addCssCode(cssCode.join('\n'));
  }

  function _addHtml() {
    infoEl = document.createElement('div');
    
    var contentEl = document.body.querySelector('#what-is-this-content');

    var els = contentEl.querySelectorAll('a');
    for (var i = 0, el; el = els[i]; i++) {
      el.target = '_blank';
    }
    
    infoEl.innerHTML = contentEl.innerHTML;
    infoEl.innerHTML += '<div class="close"><a onclick="return whatIsThis.hideInfo()" href="#">Close</a></div>';    
    contentEl.parentNode.removeChild(contentEl);

    infoEl.id = 'what-is-this-info';
    // TODO: Remove from here into CSS
    infoEl.style.opacity = .5;
    document.body.appendChild(infoEl);

    teaserEl = document.createElement('div');  
    teaserEl.id = 'what-is-this-teaser';
    teaserEl.innerHTML = 'What is this?';
    document.body.appendChild(teaserEl);

    shieldEl = document.createElement('div');  
    shieldEl.id = 'what-is-this-shield';
    document.body.appendChild(shieldEl);
    shieldEl.addEventListener('click', whatIsThis.hideInfo, false);
    
    teaserEl.addEventListener('click', _showInfo, false);
  }

  function _showInfo() {
    var height = infoEl.offsetHeight;
    // TODO: Add constant
    infoEl.style.top = -(height + 50) + 'px';

    window.setTimeout(_showInfoPart2, 0);
  }

  function _showInfoPart2() {
    // TODO: Remove from here into CSS
    infoEl.style.webkitTransition = 'opacity 750ms, top 750ms';
    infoEl.style.MozTransition = 'opacity 750ms, top 750ms';
    infoEl.style.top = '-10px';
    infoEl.style.opacity = 1;

    shieldEl.style.display = 'block';
    window.setTimeout(function() { shieldEl.style.opacity = '.5'; }, 0);
    
    _hideTeaser();
  }

  function _showInfoWithDelay() {
    window.setTimeout(_showInfo, INFO_DELAY);
  }

  whatIsThis.hideInfo = function() {
    // TODO: Remove from here into CSS
    infoEl.style.webkitTransition = 'opacity 250ms, top 250ms';  
    infoEl.style.MozTransition = 'opacity 250ms, top 250ms';  
    var height = infoEl.offsetHeight;
    infoEl.style.top = -(height + 50) + 'px';
    infoEl.style.opacity = .5;

    shieldEl.style.opacity = 0;
    window.setTimeout(function() { shieldEl.style.display = 'none'; }, SHIELD_OPACITY_DELAY);

    _showTeaser();
    
    return false;
  }

  function _showTeaser() {
    // TODO: Remove from here into CSS
    teaserEl.style.webkitTransition = 'opacity 750ms, top 750ms';
    teaserEl.style.MozTransition = 'opacity 750ms, top 750ms';
    teaserEl.style.top = '-10px';
    teaserEl.style.opacity = 1;  
  }

  function _hideTeaser() {
    // TODO: Remove from here into CSS
    teaserEl.style.webkitTransition = 'opacity 250ms, top 250ms';  
    teaserEl.style.MozTransition = 'opacity 250ms, top 250ms';  
    teaserEl.style.top = '-50px';
    teaserEl.style.opacity = .5;  
  }

  function _start() {
    _addCss();  
    _addHtml();    

    if (webStorageProxy.getItem( (LOCAL_STORAGE_NAME + location.href)) == 'true') {
      _showTeaser();
    } else {
      _showInfoWithDelay();
    }
    
    webStorageProxy.setItem( (LOCAL_STORAGE_NAME + location.href) , true);
  }

  whatIsThis.init = function() {
    document.addEventListener('DOMContentLoaded', _start, false);
  }

  return whatIsThis;
})();

whatIsThis.init();


// interface for interacting with web storage (local storage and session storage). 
// A final parameter of true on all methods specifies to use session storage 
// (non-persistant storage). A final parameter of false on all methods specifies to use
// local storage (persistent storage). E.g. webStorageProxy.setItem("name","Anselm",true) 
// for session storage or webStorageProxy.getItem("name") for local storage (note omitted
// 'true' value).
// Note that values stored in local storage are not accessible from session storage and 
// vice versa. They both work on different objects within the browser.
var webStorageProxy = (function(){
  var webStorageProxy = {};

	// set an item value specified by the key. Returns the value.
	webStorageProxy.setItem = function(key, value, sessionOnly) {
		var storage = _sessionOrLocal(sessionOnly);
		storage.setItem(key,value);
		return value;
	}
	
	// get an item specified by the key. Returns null if the item has no value.
	webStorageProxy.getItem = function(key, sessionOnly) {
		var storage = _sessionOrLocal(sessionOnly);
		return storage.getItem(key);
	}
	
	// remove an item specified by the key. Returns true if the item existed and it was
	// removed. Returns false if the item didn't exist to begin with.
	webStorageProxy.removeItem = function(key, sessionOnly) {
		var storage = _sessionOrLocal(sessionOnly);
		var returnVal = true;
		if (!storage.getItem(key)) returnVal = false;		
		if (returnVal) storage.removeItem(key);
		
		return returnVal;
	}
	
	// internal function for whether to use local or session storage.
	function _sessionOrLocal(sessionOnly)
	{
		var storage;
		(sessionOnly) ? storage = sessionStorage : storage = localStorage;
		return storage;
	}
	
  return webStorageProxy;
})();
