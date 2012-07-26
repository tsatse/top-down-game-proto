if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
            try {
          return fToBind.apply(this instanceof fNOP
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
            } catch(e) {
                //catching what javascriptcore considers an illegal use of instanceof
                return fToBind.apply(oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
            }
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}    

function sketch(setup) {
    var reqAnimFrame = (window.requestAnimationFrame       || 
                       window.webkitRequestAnimationFrame || 
                       window.mozRequestAnimationFrame    || 
                       window.oRequestAnimationFrame      || 
                       window.msRequestAnimationFrame || 
                        function(callback) {
                            window.setTimeout(callback, 1000 / fps);
                        }).bind(window);
    var defaults = {
        width: window.innerWidth,
        height: window.innerHeight,
        fps: 60,
        update: function() {},
        draw: function() {},
        resetState: function() {},
        events: {
            loaded: function() {},
            progress: function() {}
        }
    };

    var canvas = setup.canvas || (function() { return document.body.appendChild(document.createElement('canvas')); }());
    canvas.width = setup.width || defaults.width;
    canvas.height = setup.height || defaults.height;
    var pointerInput = new PointerInput();
    pointerInput.attach(canvas);
    var pointerCallbacks = [
        'down-left',
        'down-middle',
        'down-right',
        'up-left',
        'up-middle',
        'up-right',
        'up',
        'down',
        'drag-left',
        'drag-middle',
        'drag-right'
    ];
    for(var i = 0 ; i < pointerCallbacks.length ; i++) {
        var callbackType = pointerCallbacks[i];
        if(setup[callbackType]) {
            pointerInput.addCallback(callbackType, setup[callbackType].bind(setup));
        }
    }
    if(setup.keydown) {
        document.addEventListener('keydown', setup.keydown.bind(setup));
    }
    if(setup.keyup) {
        document.addEventListener('keyup', setup.keyup.bind(setup));
    }
    var fps = setup.fps || defaults.fps;
    var update = setup.update || defaults.update;
    var draw = setup.draw || defaults.draw;
    var resetState = setup.resetState || defaults.resetState;
    resetState.call(setup);
    var events = setup.events || defaults.events;
    var ctx = canvas.getContext('2d');
    var lastDraw = null;


    if(setup.images) {
        var imageNames = Object.keys(setup.images);
        var images = {};
        var loaded = 0;
        var total = imageNames.length;
        var load = function() {
            loaded += 1;
            if(loaded === total) {
                if(events.loaded) {
                    events.loaded(images);
                }
                reqAnimFrame(drawLoop);
            }
            else {
                if(events.progress) {
                    events.progress((loaded / total) * 100.0);
                }
            }
        };
        var error = function() {
            alert('error loading images');
        }
        for(var i = 0 ; i < imageNames.length ; i++) {
            images[imageNames[i]] = new Image;
            images[imageNames[i]].onload = load;
            images[imageNames[i]].onerror = error;
            images[imageNames[i]].src = setup.images[imageNames[i]];
        }
    }
    else {
        reqAnimFrame(drawLoop);
    }

    function drawLoop(time) {
        if(lastDraw === null) {
            lastDraw = time;
        }
        if(!time || time - lastDraw > 1000 / fps) {
            var dt = time - lastDraw;
            lastDraw = time;
            update.call(setup, dt);
            draw.call(setup, ctx, images, dt);
        }
        reqAnimFrame(drawLoop);
    }
}
