(function() {
    var definitionFunction = function() {
        var constructor = function() {
            this.left = null;
            this.middle = null;
            this.right = null;
            this.last = {
                noButton: null,
                left: null,
                middle: null,
                right: null
            };
            this.pos = null;
            this.callbacks = {
                'drag-left': [],
                'drag-middle': [],
                'drag-right': [],
                'move': [],
                'move-no-button': [],
                'up': [],
                'down': [],
                'up-left': [],
                'up-middle': [],
                'up-right': [],
                'down-left': [],
                'down-middle': [],
                'down-right': []
            };
            this.attachedElement = null;
        };

        constructor.prototype = {
            attach: function(element) {
                this.attachedElement = element;
                element.addEventListener('mousedown', this.down.bind(this));
                element.addEventListener('mouseup', this.up.bind(this));
                element.addEventListener('mousemove', this.move.bind(this));
            },

            detach : function() {
                this.attachedElement = null;
            },

            readGlobalMouse: function(event) {
                var result = {};
                var domElement = event.currentTarget;
                if (event.pageX != undefined && event.pageY != undefined) {
                    result.x = event.pageX;
                    result.y = event.pageY;
                }
                else {
                    result.x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    result.y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }
                return result;
            },

            getElementPosition: function(element) {
                var left = 0;
                var top = 0;
                var e = element;
                while (e.offsetParent != undefined && e.offsetParent != null)
                {
                    left += e.offsetLeft + (e.clientLeft != null ? e.clientLeft : 0);
                    top += e.offsetTop + (e.clientTop != null ? e.clientTop : 0);
                    e = e.offsetParent;
                }
                return {
                    x: left,
                    y: top
                }
            },

            getMousePosition: function(event, domElement) {
                var result = this.readGlobalMouse(event);
                if(domElement) {
                    var elementPosition = this.getElementPosition(domElement);
                    result.x -= elementPosition.x;
                    result.y -= elementPosition.y;
                }
                return result;
            },

            getButtonName: function(buttonCode) {
                var buttonNames = [
                    'left',
                    'middle',
                    'right'
                ];
                return buttonNames[buttonCode];
            },

            down: function(event) {
                if(!this.attachedElement) {
                    return;
                }
                var buttonName = this.getButtonName(event.button);
                this.pos = this.getMousePosition(event, this.attachedElement);
                this[buttonName] = true;
                this.executeCallbacks('down-' + buttonName, [this]);
                this.executeCallbacks('down', [this]);
            },

            up: function(event) {
                if(!this.attachedElement) {
                    return;
                }
                var buttonName = this.getButtonName(event.button);
                this.pos = this.getMousePosition(event, this.attachedElement);
                this[buttonName] = false;
                this.executeCallbacks('up-' + buttonName, [this]);
                this.executeCallbacks('up', [this]);
                this.last[buttonName] = null;
            },

            move: function(event) {
                if(!this.attachedElement) {
                    return;
                }
                var buttonName = 'noButton';
                if(this.left) {
                    buttonName = 'left';
                }
                else if(this.middle) {
                    buttonName = 'middle';
                }
                else if(this.right) {
                    buttonName = 'right';
                }
                this.pos = this.getMousePosition(event, this.attachedElement);
                if(this.last[buttonName] === null) {
                    this.last[buttonName] = this.pos;
                }
                var last = this.last[buttonName];
                var current = this.pos;
                var callbackParams = [this, current.x - last.x, current.y - last.y];

                if(buttonName !== 'noButton') {
                    this.executeCallbacks('drag-' + buttonName, callbackParams);
                    this.last[buttonName] = this.pos;
                }
                this.executeCallbacks('move', callbackParams);
                if(buttonName === 'noButton') {
                    this.executeCallbacks('move-no-button', callbackParams);
                }
            },

            executeCallbacks: function(type, parameters) {
                for(var i = 0 ; i < this.callbacks[type].length ; i++) {
                    var callback = this.callbacks[type][i];
                    callback.apply(null, parameters);
                }
            },

            addCallback: function(type, callback) {
                this.callbacks[type].push(callback);
            }
        };
        return constructor;
    };

    if(typeof define === 'function') {
        define(definitionFunction);
    }
    else {
        PointerInput = definitionFunction();
    }
}) ();