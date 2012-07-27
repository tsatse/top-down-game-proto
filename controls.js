onload = function() {
    sketch({
        images: {
            spritesheet: 'sheet.png',
            ground: 'ground.png'
        },
        
        resetState: function() {
            this.pos = {x: 0, y: 0};
            this.direction = {x: 0, y: 0};
            this.spriter = {
                tileWidth: 32,
                tileHeight: 32,
                width: 3,
                height: 4,
                goUp: [9, 10, 11, 10],
                goRight: [6, 7, 8, 7],
                goDown: [0, 1, 2, 1],
                goLeft: [3, 4, 5, 4],
                idle: [0]
            };
            this.phase = 0;
        },
        hit: function() {
            this.hitPhase = this.phase;
        },

        keydown: function(event) {
            var moveUnit = 0.2;
            if(!event.ctrlKey) {
                switch(event.keyCode) {
                    case 'W'.charCodeAt():
                    case 'Z'.charCodeAt():
                    case 38:
                        event.preventDefault();
                        this.direction.y = -moveUnit;
                        break;
                    case 'A'.charCodeAt():
                    case 'Q'.charCodeAt():
                    case 37:
                        event.preventDefault();
                        this.direction.x = -moveUnit;
                        break;
                    case 'S'.charCodeAt():
                    case 40:
                        event.preventDefault();
                        this.direction.y = moveUnit;
                        break;
                    case 'D'.charCodeAt():
                    case 39:
                        event.preventDefault();
                        this.direction.x = moveUnit;
                        break;
                    case 'X'.charCodeAt():
                        this.hit();
                        break;
                }
            }
        },

        keyup: function(event) {
            switch(event.keyCode) {
                case 'W'.charCodeAt():
                case 'Z'.charCodeAt():
                case 'S'.charCodeAt():
                case 38:
                case 40:
                    event.preventDefault();
                    this.direction.y = 0;
                    break;
                case 'A'.charCodeAt():
                case 'Q'.charCodeAt():
                case 'D'.charCodeAt():
                case 37:
                case 39:
                    event.preventDefault();
                    this.direction.x = 0;
                    break;
            }
        },

        getTileCoords: function() {
            var action = 'idle';
            var invert = false;
            if(this.direction.y < 0) {
                action = 'goUp';
            }
            else if(this.direction.y > 0) {
                action = 'goDown';
            }
            else if(this.direction.x > 0) {
                action = 'goRight';
            }
            else if(this.direction.x < 0) {
                action = 'goLeft';
            }

            var animArray = this.spriter[action];
            var frameNumber = animArray[Math.floor(this.phase) % animArray.length];
            return {
                x: Math.floor(this.spriter.tileWidth * (frameNumber % this.spriter.width)),
                y: Math.floor(this.spriter.tileHeight * Math.floor(frameNumber / this.spriter.width)),
                invert: invert
            };
        },

        update: function(dt) {
            var dx = this.direction.x;
            var dy = this.direction.y;
            if(dx === 1 && dy === 1 ||
                dx === -1 && dy === -1) {
                dx /= Math.sqrt(2);
                dy /= Math.sqrt(2);
            }

            this.pos.x += dx * dt;
            this.pos.y += dy * dt;
            this.phase += 0.01 * dt;
        },

       draw: function(ctx, images, dt) {
        var m = 3;
            var coords = this.getTileCoords();
            var pattern = ctx.createPattern(images.ground, 'repeat');
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(this.pos.x+16, this.pos.y+32*m-16, 32 * 2, 32);

            ctx.drawImage(images.spritesheet, coords.x, coords.y, this.spriter.tileWidth, this.spriter.tileHeight,
                this.pos.x, this.pos.y, this.spriter.tileWidth * m, this.spriter.tileHeight * m);
        }
    });
}