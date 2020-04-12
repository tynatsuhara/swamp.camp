var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
System.register("engine/point", [], function (exports_1, context_1) {
    "use strict";
    var Point;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            Point = /** @class */ (function () {
                function Point(x, y) {
                    this.x = x;
                    this.y = y;
                }
                Point.prototype.times = function (multiplier) {
                    return new Point(this.x * multiplier, this.y * multiplier);
                };
                Point.prototype.div = function (denominator) {
                    return new Point(this.x / denominator, this.y / denominator);
                };
                Point.prototype.plus = function (other) {
                    return new Point(this.x + other.x, this.y + other.y);
                };
                Point.prototype.minus = function (other) {
                    return new Point(this.x - other.x, this.y - other.y);
                };
                Point.prototype.lerp = function (multiplier, goal) {
                    return new Point(this.x + (goal.x - this.x) * multiplier, this.y + (goal.y - this.y) * multiplier);
                };
                return Point;
            }());
            exports_1("Point", Point);
        }
    };
});
System.register("engine/view", ["engine/point"], function (exports_2, context_2) {
    "use strict";
    var point_1, View;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [
            function (point_1_1) {
                point_1 = point_1_1;
            }
        ],
        execute: function () {
            View = /** @class */ (function () {
                function View() {
                    this.zoom = 0; // scale of the view
                    this.offset = new point_1.Point(0, 0); // transform applied to all entities in the view (scaled by zoom)
                    this.entities = []; // entities ordered by depth (back to front)
                }
                return View;
            }());
            exports_2("View", View);
        }
    };
});
System.register("engine/renderer", ["engine/point"], function (exports_3, context_3) {
    "use strict";
    var point_2, Renderer, RenderImage;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (point_2_1) {
                point_2 = point_2_1;
            }
        ],
        execute: function () {
            Renderer = /** @class */ (function () {
                function Renderer(canvas) {
                    this.cameraOffsetX = 0;
                    this.cameraOffsetY = 0;
                    this.canvas = canvas;
                    this.context = canvas.getContext('2d');
                }
                Renderer.prototype.render = function (views) {
                    var _this = this;
                    // make sure stuff doesn't get stretched
                    this.canvas.width = this.canvas.clientWidth;
                    this.canvas.height = this.canvas.clientHeight;
                    this.context.imageSmoothingEnabled = false;
                    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    views.forEach(function (v) { return _this.renderView(v); });
                };
                Renderer.prototype.getDimensions = function () {
                    return new point_2.Point(this.canvas.width, this.canvas.height);
                };
                Renderer.prototype.renderView = function (view) {
                    var _this = this;
                    view.entities.filter(function (e) { return !!e; }).forEach(function (e) {
                        var images = e.getRenderImages();
                        images.filter(function (img) { return !!img; }).forEach(function (img) {
                            var position = e.position.plus(img.dimensions.div(2)).times(view.zoom); // where to draw the img on the canvas (center)
                            var pixelPos = new point_2.Point(_this.pixelNum(position.x, view.zoom), _this.pixelNum(position.y, view.zoom));
                            var rotation = 0 * Math.PI / 180;
                            _this.context.translate(pixelPos.x, pixelPos.y);
                            _this.context.rotate(rotation);
                            _this.context.scale(img.mirrorX ? -1 : 1, img.mirrorY ? -1 : 1);
                            _this.context.drawImage(img.source, img.position.x, img.position.y, img.dimensions.x, img.dimensions.y, _this.pixelNum(view.zoom * (-img.dimensions.x / 2 + (img.mirrorX ? -1 : 1) * view.offset.x), view.zoom), _this.pixelNum(view.zoom * (-img.dimensions.y / 2 + (img.mirrorY ? -1 : 1) * view.offset.y), view.zoom), img.dimensions.x * view.zoom * img.scale, img.dimensions.y * view.zoom * img.scale);
                            _this.context.scale(img.mirrorX ? -1 : 1, img.mirrorY ? -1 : 1);
                            _this.context.rotate(-rotation);
                            _this.context.translate(-pixelPos.x, -pixelPos.y);
                        });
                    });
                };
                Renderer.prototype.pixelNum = function (val, zoom) {
                    return val - (val % zoom);
                };
                return Renderer;
            }());
            exports_3("Renderer", Renderer);
            RenderImage = /** @class */ (function () {
                function RenderImage(source, position, dimensions, rotation, scale, mirrorX, mirrorY) {
                    if (rotation === void 0) { rotation = 0; }
                    if (scale === void 0) { scale = 1; }
                    if (mirrorX === void 0) { mirrorX = false; }
                    if (mirrorY === void 0) { mirrorY = false; }
                    this.source = source;
                    this.position = position;
                    this.dimensions = dimensions;
                    this.rotation = rotation;
                    this.scale = scale;
                    this.mirrorX = mirrorX,
                        this.mirrorY = mirrorY;
                }
                return RenderImage;
            }());
            exports_3("RenderImage", RenderImage);
        }
    };
});
System.register("engine/input", ["engine/point"], function (exports_4, context_4) {
    "use strict";
    var point_3, Input, CapturedInput;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (point_3_1) {
                point_3 = point_3_1;
            }
        ],
        execute: function () {
            Input = /** @class */ (function () {
                function Input(canvas) {
                    var _this = this;
                    this.keys = new Set();
                    this.lastCapture = new CapturedInput();
                    this.mousePos = new point_3.Point(0, 0);
                    this.isMouseDown = false;
                    this.isMouseHeld = false;
                    this.isMouseUp = false;
                    this.canvas = canvas;
                    canvas.onmousedown = function (e) {
                        _this.isMouseDown = true;
                        _this.isMouseHeld = true;
                        _this.isMouseUp = false;
                    };
                    canvas.onmouseup = function (e) {
                        _this.isMouseDown = false;
                        _this.isMouseHeld = false;
                        _this.isMouseUp = true;
                    };
                    canvas.onmousemove = function (e) {
                        _this.mousePos = new point_3.Point(e.x - canvas.offsetLeft, e.y - canvas.offsetTop);
                    };
                    window.onkeydown = function (e) { return _this.keys.add(e.keyCode); };
                    window.onkeyup = function (e) { return _this.keys["delete"](e.keyCode); };
                }
                Input.prototype.captureInput = function () {
                    var _this = this;
                    var keys = Array.from(this.keys);
                    this.lastCapture = new CapturedInput(new Set(keys.filter(function (key) { return !_this.lastCapture.isKeyHeld(key); })), new Set(keys.slice()), new Set(this.lastCapture.getKeysHeld().filter(function (key) { return !_this.keys.has(key); })), this.mousePos, this.isMouseDown, this.isMouseHeld, this.isMouseUp);
                    // reset since these should only be true for 1 tick
                    this.isMouseDown = false;
                    this.isMouseUp = false;
                    return this.lastCapture;
                };
                return Input;
            }());
            exports_4("Input", Input);
            // TODO: Capture mouse input for clickable elements
            CapturedInput = /** @class */ (function () {
                function CapturedInput(keysDown, keysHeld, keysUp, mousePos, isMouseDown, isMouseHeld, isMouseUp) {
                    if (keysDown === void 0) { keysDown = new Set(); }
                    if (keysHeld === void 0) { keysHeld = new Set(); }
                    if (keysUp === void 0) { keysUp = new Set(); }
                    if (mousePos === void 0) { mousePos = new point_3.Point(0, 0); }
                    if (isMouseDown === void 0) { isMouseDown = false; }
                    if (isMouseHeld === void 0) { isMouseHeld = false; }
                    if (isMouseUp === void 0) { isMouseUp = false; }
                    this.mousePos = new point_3.Point(0, 0);
                    this.isMouseDown = false;
                    this.isMouseHeld = false;
                    this.isMouseUp = false;
                    this.keysDown = keysDown;
                    this.keysHeld = keysHeld;
                    this.keysUp = keysUp;
                    this.mousePos = mousePos;
                    this.isMouseDown = isMouseDown;
                    this.isMouseHeld = isMouseHeld;
                    this.isMouseUp = isMouseUp;
                }
                CapturedInput.prototype.scaled = function (zoom) {
                    return new CapturedInput(this.keysDown, this.keysHeld, this.keysUp, this.mousePos.div(zoom), this.isMouseDown, this.isMouseHeld, this.isMouseUp);
                };
                CapturedInput.prototype.getKeysHeld = function () {
                    return Array.from(this.keysUp);
                };
                CapturedInput.prototype.isKeyDown = function (key) {
                    return this.keysDown.has(key);
                };
                CapturedInput.prototype.isKeyHeld = function (key) {
                    return this.keysHeld.has(key);
                };
                CapturedInput.prototype.isKeyUp = function (key) {
                    return this.keysUp.has(key);
                };
                return CapturedInput;
            }());
            exports_4("CapturedInput", CapturedInput);
        }
    };
});
System.register("engine/game", [], function (exports_5, context_5) {
    "use strict";
    var Game;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [],
        execute: function () {
            Game = /** @class */ (function () {
                function Game() {
                }
                return Game;
            }());
            exports_5("Game", Game);
        }
    };
});
System.register("engine/engine", ["engine/renderer", "engine/input"], function (exports_6, context_6) {
    "use strict";
    var renderer_1, input_1, UpdateViewsContext, UpdateData, Engine;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (renderer_1_1) {
                renderer_1 = renderer_1_1;
            },
            function (input_1_1) {
                input_1 = input_1_1;
            }
        ],
        execute: function () {
            UpdateViewsContext = /** @class */ (function () {
                function UpdateViewsContext() {
                }
                return UpdateViewsContext;
            }());
            exports_6("UpdateViewsContext", UpdateViewsContext);
            UpdateData = /** @class */ (function () {
                function UpdateData() {
                }
                return UpdateData;
            }());
            exports_6("UpdateData", UpdateData);
            Engine = /** @class */ (function () {
                function Engine(game, canvas) {
                    var _this = this;
                    this.lastUpdateMillis = new Date().getTime();
                    this.game = game;
                    this.renderer = new renderer_1.Renderer(canvas);
                    this.input = new input_1.Input(canvas);
                    setInterval(function () { return _this.tick(); }, 1 / 60);
                }
                Engine.prototype.tick = function () {
                    var time = new Date().getTime();
                    var elapsed = time - this.lastUpdateMillis;
                    if (elapsed == 0) {
                        return;
                    }
                    var updateViewsContext = {
                        elapsedTimeMillis: elapsed,
                        input: this.input.captureInput(),
                        dimensions: this.renderer.getDimensions()
                    };
                    var views = this.game.getViews(updateViewsContext);
                    views.forEach(function (v) {
                        var updateData = {
                            elapsedTimeMillis: updateViewsContext.elapsedTimeMillis,
                            input: updateViewsContext.input.scaled(v.zoom),
                            dimensions: updateViewsContext.dimensions.div(v.zoom)
                        };
                        // TODO: consider the behavior where an entity belongs to multiple views (eg splitscreen)
                        v.entities.forEach(function (e) { return e.update(updateData); });
                    });
                    this.renderer.render(views);
                    this.lastUpdateMillis = time;
                };
                return Engine;
            }());
            exports_6("Engine", Engine);
        }
    };
});
System.register("engine/entity", [], function (exports_7, context_7) {
    "use strict";
    var Entity;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [],
        execute: function () {
            /**
             * An object which exists in the game world and updated by the engine. Should be attached to a game view.
             */
            Entity = /** @class */ (function () {
                function Entity(position) {
                    this.position = position;
                }
                /**
                 * Called on each update step
                 */
                Entity.prototype.update = function (updateData) { };
                return Entity;
            }());
            exports_7("Entity", Entity);
        }
    };
});
System.register("engine/tileset", ["engine/point", "engine/entity", "engine/renderer"], function (exports_8, context_8) {
    "use strict";
    var point_4, entity_1, renderer_2, TileSet, TileTransform, TileSource, TileEntity, TileSetAnimation, TileSetAnimator, AnimatedTileEntity;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (point_4_1) {
                point_4 = point_4_1;
            },
            function (entity_1_1) {
                entity_1 = entity_1_1;
            },
            function (renderer_2_1) {
                renderer_2 = renderer_2_1;
            }
        ],
        execute: function () {
            TileSet = /** @class */ (function () {
                function TileSet(image, tileSize, padding) {
                    if (padding === void 0) { padding = 0; }
                    this.image = image;
                    this.tileSize = tileSize;
                    this.padding = padding;
                }
                return TileSet;
            }());
            exports_8("TileSet", TileSet);
            TileTransform = /** @class */ (function () {
                function TileTransform() {
                }
                return TileTransform;
            }());
            exports_8("TileTransform", TileTransform);
            TileSource = /** @class */ (function () {
                /**
                 * Constructs a static tile source
                 */
                function TileSource(tileSet, tileSetIndex) {
                    this.tileSet = tileSet;
                    this.tileSetIndex = tileSetIndex;
                }
                TileSource.prototype.toRenderImage = function (transform) {
                    return new renderer_2.RenderImage(this.tileSet.image, new point_4.Point(this.tileSetIndex.x, this.tileSetIndex.y).times(this.tileSet.tileSize + this.tileSet.padding), new point_4.Point(this.tileSet.tileSize, this.tileSet.tileSize), transform.rotation, transform.scale, transform.mirrorX, transform.mirrorY);
                };
                return TileSource;
            }());
            exports_8("TileSource", TileSource);
            /**
             * Represents a static (non-animated) tile entity
             */
            TileEntity = /** @class */ (function (_super) {
                __extends(TileEntity, _super);
                function TileEntity(tileSource, position, transform) {
                    if (position === void 0) { position = new point_4.Point(0, 0); }
                    if (transform === void 0) { transform = new TileTransform(); }
                    var _this = _super.call(this, position) || this;
                    _this.tileSource = tileSource;
                    _this.transform = transform;
                    return _this;
                }
                TileEntity.prototype.getRenderImages = function () {
                    return [this.tileSource.toRenderImage(this.transform)];
                };
                return TileEntity;
            }(entity_1.Entity));
            exports_8("TileEntity", TileEntity);
            TileSetAnimation = /** @class */ (function () {
                /**
                 * @param frames A list of tile sources and a duration in milliseconds that each one will last
                 */
                function TileSetAnimation(frames) {
                    var _this = this;
                    this.frames = [];
                    var timestamp = 0;
                    frames.forEach(function (frame) {
                        timestamp += frame[1];
                        _this.frames.push([frame[0], timestamp]);
                    });
                    this.duration = timestamp;
                }
                return TileSetAnimation;
            }());
            exports_8("TileSetAnimation", TileSetAnimation);
            TileSetAnimator = /** @class */ (function () {
                function TileSetAnimator(animation) {
                    this.time = 0;
                    this.index = 0;
                    this.animation = animation;
                }
                TileSetAnimator.prototype.update = function (elapsedTimeMillis) {
                    this.time += elapsedTimeMillis;
                    if (this.time > this.animation.frames[this.index][1]) {
                        this.index++;
                        if (this.index == this.animation.frames.length) {
                            this.index = 0;
                        }
                    }
                    this.time %= this.animation.duration;
                    return this.getCurrentTileSource();
                };
                TileSetAnimator.prototype.getCurrentTileSource = function () {
                    return this.animation.frames[this.index][0];
                };
                return TileSetAnimator;
            }());
            exports_8("TileSetAnimator", TileSetAnimator);
            AnimatedTileEntity = /** @class */ (function (_super) {
                __extends(AnimatedTileEntity, _super);
                function AnimatedTileEntity(animation, position) {
                    if (position === void 0) { position = new point_4.Point(0, 0); }
                    var _this = this;
                    var animator = new TileSetAnimator(animation);
                    _this = _super.call(this, new TileSetAnimator(animation).getCurrentTileSource(), position) || this;
                    _this.animator = animator;
                    return _this;
                }
                AnimatedTileEntity.prototype.update = function (updateData) {
                    this.tileSource = this.animator.update(updateData.elapsedTimeMillis);
                };
                return AnimatedTileEntity;
            }(TileEntity));
            exports_8("AnimatedTileEntity", AnimatedTileEntity);
        }
    };
});
System.register("game/tiles", ["engine/point", "engine/tileset"], function (exports_9, context_9) {
    "use strict";
    var point_5, tileset_1, TILE_SIZE, TILE_SET, Tile;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (point_5_1) {
                point_5 = point_5_1;
            },
            function (tileset_1_1) {
                tileset_1 = tileset_1_1;
            }
        ],
        execute: function () {
            exports_9("TILE_SIZE", TILE_SIZE = 16);
            TILE_SET = new tileset_1.TileSet(document.getElementById("tileset"), TILE_SIZE, 1);
            Tile = /** @class */ (function () {
                function Tile() {
                }
                Tile.get = function (x, y) {
                    return new tileset_1.TileSource(TILE_SET, new point_5.Point(x, y));
                };
                // environment
                Tile.GROUND_1 = Tile.get(1, 0);
                Tile.GROUND_2 = Tile.get(2, 0);
                Tile.GROUND_3 = Tile.get(3, 0);
                Tile.GROUND_4 = Tile.get(4, 0);
                Tile.GRASS_1 = Tile.get(5, 0);
                Tile.GRASS_2 = Tile.get(6, 0);
                Tile.GRASS_3 = Tile.get(7, 0);
                Tile.TREE_1 = Tile.get(0, 1);
                Tile.TREE_2 = Tile.get(1, 1);
                Tile.TREE_3 = Tile.get(2, 1);
                Tile.TREE_4 = Tile.get(3, 1);
                Tile.TREE_5 = Tile.get(4, 1);
                Tile.TREE_6 = Tile.get(5, 1);
                Tile.CACTUS = Tile.get(6, 1);
                Tile.CACTI = Tile.get(7, 1);
                Tile.TALL_GRASS = Tile.get(0, 2);
                Tile.VINES_TOP = Tile.get(1, 2);
                Tile.VINES_BOTTOM = Tile.get(2, 2);
                Tile.TREES = Tile.get(3, 2);
                Tile.ROUND_TREE = Tile.get(4, 2);
                Tile.ROCKS = Tile.get(5, 2);
                Tile.DEAD_TREE = Tile.get(6, 2);
                Tile.PALM_TREE = Tile.get(7, 2);
                Tile.DOOR_1 = Tile.get(9, 3);
                Tile.DOOR_2 = Tile.get(9, 4);
                Tile.DOOR_3 = Tile.get(9, 5);
                Tile.DOOR_OPEN = Tile.get(9, 6);
                // characters
                Tile.GUY_1 = Tile.get(24, 0);
                Tile.SWORD_1 = Tile.get(35, 0);
                Tile.SWORD_2 = Tile.get(36, 0);
                // weapons
                Tile.CLUB = Tile.get(0, 24);
                Tile.SWORD = Tile.get(0, 29);
                // animations
                Tile.SLASH = Tile.get(24, 11);
                Tile.ARC = Tile.get(25, 11);
                Tile.TRIPLE_SLASH = Tile.get(26, 11);
                Tile.BUBBLES = Tile.get(27, 11);
                // items
                Tile.COIN = Tile.get(22, 4);
                Tile.DIAMOND = Tile.get(23, 4);
                // ui
                Tile.BORDER_1 = Tile.get(0, 16);
                Tile.BORDER_2 = Tile.get(1, 16);
                Tile.BORDER_3 = Tile.get(2, 16);
                Tile.BORDER_4 = Tile.get(2, 17);
                Tile.BORDER_5 = Tile.get(2, 18);
                Tile.BORDER_6 = Tile.get(1, 18);
                Tile.BORDER_7 = Tile.get(0, 18);
                Tile.BORDER_8 = Tile.get(0, 17);
                Tile.DPAD_DEFAULT = Tile.get(27, 22);
                Tile.DPAD_UP = Tile.get(28, 22);
                Tile.DPAD_RIGHT = Tile.get(29, 22);
                Tile.DPAD_DOWN = Tile.get(30, 22);
                Tile.DPAD_LEFT = Tile.get(31, 22);
                Tile.NUM_0 = Tile.get(19, 29);
                Tile.NUM_1 = Tile.get(20, 29);
                Tile.NUM_2 = Tile.get(21, 29);
                Tile.NUM_3 = Tile.get(22, 29);
                Tile.NUM_4 = Tile.get(23, 29);
                Tile.NUM_5 = Tile.get(24, 29);
                Tile.NUM_6 = Tile.get(25, 29);
                Tile.NUM_7 = Tile.get(26, 29);
                Tile.NUM_8 = Tile.get(27, 29);
                Tile.NUM_9 = Tile.get(28, 29);
                return Tile;
            }());
            exports_9("Tile", Tile);
        }
    };
});
System.register("engine/grid", [], function (exports_10, context_10) {
    "use strict";
    var Grid;
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [],
        execute: function () {
            // an infinite grid using x/y coordinates (x increases to the right, y increases down)
            Grid = /** @class */ (function () {
                function Grid() {
                    this.map = new Map();
                }
                Grid.prototype.set = function (pt, entry) {
                    this.map.set(pt, entry);
                };
                // returns null if not present in the grid
                Grid.prototype.get = function (pt) {
                    return this.map.get(pt);
                };
                Grid.prototype.entries = function () {
                    return Array.from(this.map.values());
                };
                return Grid;
            }());
            exports_10("Grid", Grid);
        }
    };
});
System.register("game/player", ["engine/tileset", "engine/point", "game/tiles"], function (exports_11, context_11) {
    "use strict";
    var tileset_2, point_6, tiles_1, Player;
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [
            function (tileset_2_1) {
                tileset_2 = tileset_2_1;
            },
            function (point_6_1) {
                point_6 = point_6_1;
            },
            function (tiles_1_1) {
                tiles_1 = tiles_1_1;
            }
        ],
        execute: function () {
            Player = /** @class */ (function (_super) {
                __extends(Player, _super);
                function Player() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.speed = 1.2;
                    _this.swordAnim = new tileset_2.TileSetAnimator(new tileset_2.TileSetAnimation([
                        [tiles_1.Tile.SWORD_1, 500],
                        [tiles_1.Tile.ARC, 100]
                    ]));
                    return _this;
                }
                Player.prototype.update = function (updateData) {
                    var dx = 0;
                    var dy = 0;
                    if (updateData.input.isKeyHeld(87 /* W */)) {
                        dy--;
                    }
                    if (updateData.input.isKeyHeld(83 /* S */)) {
                        dy++;
                    }
                    if (updateData.input.isKeyHeld(65 /* A */)) {
                        dx--;
                    }
                    if (updateData.input.isKeyHeld(68 /* D */)) {
                        dx++;
                    }
                    if (dx < 0) {
                        this.transform.mirrorX = true;
                    }
                    else if (dx > 0) {
                        this.transform.mirrorX = false;
                    }
                    this.position = new point_6.Point(this.position.x + dx / updateData.elapsedTimeMillis * this.speed, this.position.y + dy / updateData.elapsedTimeMillis * this.speed);
                    // TODO: figure out how to structure components so that we can have a sword, shield, etc with animations
                    this.swordAnim.update(updateData.elapsedTimeMillis);
                };
                Player.prototype.getRenderImages = function () {
                    var mirrored = {
                        rotation: this.transform.rotation,
                        scale: this.transform.scale,
                        mirrorX: false,
                        mirrorY: this.transform.mirrorY
                    };
                    return [
                        this.tileSource.toRenderImage(this.transform),
                        this.swordAnim.getCurrentTileSource().toRenderImage(this.transform)
                    ];
                };
                return Player;
            }(tileset_2.TileEntity));
            exports_11("Player", Player);
        }
    };
});
System.register("game/quest_game", ["engine/point", "engine/game", "engine/view", "game/tiles", "engine/grid", "engine/tileset", "game/player"], function (exports_12, context_12) {
    "use strict";
    var point_7, game_1, view_1, tiles_2, grid_1, tileset_3, player_1, ZOOM, QuestGame;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [
            function (point_7_1) {
                point_7 = point_7_1;
            },
            function (game_1_1) {
                game_1 = game_1_1;
            },
            function (view_1_1) {
                view_1 = view_1_1;
            },
            function (tiles_2_1) {
                tiles_2 = tiles_2_1;
            },
            function (grid_1_1) {
                grid_1 = grid_1_1;
            },
            function (tileset_3_1) {
                tileset_3 = tileset_3_1;
            },
            function (player_1_1) {
                player_1 = player_1_1;
            }
        ],
        execute: function () {
            ZOOM = 2.5;
            QuestGame = /** @class */ (function (_super) {
                __extends(QuestGame, _super);
                function QuestGame() {
                    var _this = _super.call(this) || this;
                    // todo: is there any reason to have this "grid"? is it redundant?
                    _this.grid = new grid_1.Grid();
                    _this.player = new player_1.Player(tiles_2.Tile.GUY_1, new point_7.Point(2, 2).times(tiles_2.TILE_SIZE));
                    _this.gameEntityView = new view_1.View();
                    _this.uiView = new view_1.View();
                    _this.addTileEntityToGrid(1, 1, tiles_2.Tile.GRASS_1);
                    _this.addTileEntityToGrid(2, 1, tiles_2.Tile.GRASS_3);
                    _this.addTileEntityToGrid(1, 2, tiles_2.Tile.GRASS_1);
                    _this.addTileEntityToGrid(1, 4, tiles_2.Tile.GRASS_1);
                    _this.addTileEntityToGrid(2, 3, tiles_2.Tile.ROCKS);
                    _this.addTileEntityToGrid(4, 4, tiles_2.Tile.SWORD);
                    _this.grid.set(new point_7.Point(5, 6), new tileset_3.AnimatedTileEntity(new tileset_3.TileSetAnimation([
                        [tiles_2.Tile.NUM_0, 1000],
                        [tiles_2.Tile.NUM_1, 1000],
                        [tiles_2.Tile.NUM_2, 1000],
                        [tiles_2.Tile.NUM_3, 1000],
                        [tiles_2.Tile.NUM_4, 1000],
                        [tiles_2.Tile.NUM_5, 1000],
                        [tiles_2.Tile.NUM_6, 1000],
                        [tiles_2.Tile.NUM_7, 1000],
                        [tiles_2.Tile.NUM_8, 1000],
                        [tiles_2.Tile.NUM_9, 1000]
                    ])));
                    return _this;
                }
                QuestGame.prototype.addTileEntityToGrid = function (x, y, source) {
                    var pt = new point_7.Point(x, y);
                    this.grid.set(pt, new tileset_3.TileEntity(source, pt.times(tiles_2.TILE_SIZE)));
                };
                // entities in the world space
                QuestGame.prototype.getViews = function (updateViewsContext) {
                    this.updateViews(updateViewsContext);
                    return [this.gameEntityView, this.uiView];
                };
                QuestGame.prototype.updateViews = function (updateViewsContext) {
                    // TODO: figure out how to abstract zoom from entities
                    var cameraGoal = updateViewsContext.dimensions.div(ZOOM).div(2).minus(this.player.position);
                    this.gameEntityView = {
                        zoom: ZOOM,
                        offset: this.gameEntityView.offset.lerp(.03 / updateViewsContext.elapsedTimeMillis, cameraGoal),
                        entities: this.grid.entries().concat([this.player])
                    };
                    this.uiView = {
                        zoom: ZOOM,
                        offset: new point_7.Point(0, 0),
                        entities: this.getUIEntities()
                    };
                };
                // entities whose position is fixed on the camera
                QuestGame.prototype.getUIEntities = function () {
                    var dimensions = new point_7.Point(25, 20); // tile dimensions
                    var result = [];
                    result.push(new tileset_3.TileEntity(tiles_2.Tile.BORDER_1, new point_7.Point(0, 0)));
                    result.push(new tileset_3.TileEntity(tiles_2.Tile.BORDER_3, new point_7.Point(dimensions.x - 1, 0).times(tiles_2.TILE_SIZE)));
                    result.push(new tileset_3.TileEntity(tiles_2.Tile.BORDER_5, new point_7.Point(dimensions.x - 1, dimensions.y - 1).times(tiles_2.TILE_SIZE)));
                    result.push(new tileset_3.TileEntity(tiles_2.Tile.BORDER_7, new point_7.Point(0, dimensions.y - 1).times(tiles_2.TILE_SIZE)));
                    // horizontal lines
                    for (var i = 1; i < dimensions.x - 1; i++) {
                        result.push(new tileset_3.TileEntity(tiles_2.Tile.BORDER_2, new point_7.Point(i, 0).times(tiles_2.TILE_SIZE)));
                        result.push(new tileset_3.TileEntity(tiles_2.Tile.BORDER_6, new point_7.Point(i, dimensions.y - 1).times(tiles_2.TILE_SIZE)));
                    }
                    // vertical lines
                    for (var j = 1; j < dimensions.y - 1; j++) {
                        result.push(new tileset_3.TileEntity(tiles_2.Tile.BORDER_4, new point_7.Point(dimensions.x - 1, j).times(tiles_2.TILE_SIZE)));
                        result.push(new tileset_3.TileEntity(tiles_2.Tile.BORDER_8, new point_7.Point(0, j).times(tiles_2.TILE_SIZE)));
                    }
                    return result;
                };
                return QuestGame;
            }(game_1.Game));
            exports_12("QuestGame", QuestGame);
        }
    };
});
System.register("app", ["game/quest_game", "engine/engine"], function (exports_13, context_13) {
    "use strict";
    var quest_game_1, engine_1;
    var __moduleName = context_13 && context_13.id;
    return {
        setters: [
            function (quest_game_1_1) {
                quest_game_1 = quest_game_1_1;
            },
            function (engine_1_1) {
                engine_1 = engine_1_1;
            }
        ],
        execute: function () {
            new engine_1.Engine(new quest_game_1.QuestGame(), document.getElementById('canvas'));
        }
    };
});
