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
System.register("util", [], function (exports_1, context_1) {
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
                return Point;
            }());
            exports_1("Point", Point);
        }
    };
});
System.register("input", [], function (exports_2, context_2) {
    "use strict";
    var Input, CapturedInput;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            Input = /** @class */ (function () {
                function Input() {
                    var _this = this;
                    this.keys = new Set();
                    window.onkeydown = function (e) { return _this.keys.add(e.keyCode); };
                    window.onkeyup = function (e) { return _this.keys["delete"](e.keyCode); };
                }
                Input.prototype.captureInput = function () {
                    var _this = this;
                    var keys = Array.from(this.keys);
                    this.lastCapture = new CapturedInput(new Set(keys.filter(function (key) { return !_this.lastCapture.isKeyHeld(key); })), new Set(keys.slice()));
                    return this.lastCapture;
                };
                return Input;
            }());
            exports_2("Input", Input);
            CapturedInput = /** @class */ (function () {
                function CapturedInput(down, held) {
                    this.down = down;
                    this.held = held;
                }
                CapturedInput.prototype.isKeyDown = function (key) {
                    return this.down.has(key);
                };
                CapturedInput.prototype.isKeyHeld = function (key) {
                    return this.held.has(key);
                };
                return CapturedInput;
            }());
            exports_2("CapturedInput", CapturedInput);
        }
    };
});
System.register("entity", ["util"], function (exports_3, context_3) {
    "use strict";
    var util_1, Tile, Entity, Player;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (util_1_1) {
                util_1 = util_1_1;
            }
        ],
        execute: function () {
            Tile = /** @class */ (function () {
                function Tile() {
                }
                Tile.BLANK = new util_1.Point(0, 0);
                Tile.GROUND_1 = new util_1.Point(1, 0);
                Tile.GROUND_2 = new util_1.Point(2, 0);
                Tile.GROUND_3 = new util_1.Point(3, 0);
                Tile.GROUND_4 = new util_1.Point(4, 0);
                Tile.GRASS_1 = new util_1.Point(5, 0);
                Tile.GRASS_2 = new util_1.Point(6, 0);
                Tile.GRASS_3 = new util_1.Point(7, 0);
                Tile.GUY_1 = new util_1.Point(24, 0);
                Tile.BORDER_1 = new util_1.Point(0, 16);
                Tile.BORDER_2 = new util_1.Point(1, 16);
                Tile.BORDER_3 = new util_1.Point(2, 16);
                Tile.BORDER_4 = new util_1.Point(2, 17);
                Tile.BORDER_5 = new util_1.Point(2, 18);
                Tile.BORDER_6 = new util_1.Point(1, 18);
                Tile.BORDER_7 = new util_1.Point(0, 18);
                Tile.BORDER_8 = new util_1.Point(0, 17);
                return Tile;
            }());
            exports_3("Tile", Tile);
            Entity = /** @class */ (function () {
                function Entity(tileSetIndex, position) {
                    this.tileSetIndex = tileSetIndex;
                    this.position = position;
                }
                Entity.prototype.update = function (updateData) { };
                return Entity;
            }());
            exports_3("Entity", Entity);
            Player = /** @class */ (function (_super) {
                __extends(Player, _super);
                function Player() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.speed = 1.2;
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
                    this.position = new util_1.Point(this.position.x + dx / updateData.elapsedTimeMillis * this.speed, this.position.y + dy / updateData.elapsedTimeMillis * this.speed);
                };
                return Player;
            }(Entity));
            exports_3("Player", Player);
        }
    };
});
System.register("renderer", ["util"], function (exports_4, context_4) {
    "use strict";
    var util_2, CANVAS, CANVAS_CONTEXT, TILE_SET, TILE_SET_SIZE, TILE_SIZE, Renderer;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (util_2_1) {
                util_2 = util_2_1;
            }
        ],
        execute: function () {
            CANVAS = document.getElementById('canvas');
            CANVAS_CONTEXT = CANVAS.getContext('2d');
            TILE_SET = document.getElementById("tileset");
            TILE_SET_SIZE = 32;
            exports_4("TILE_SIZE", TILE_SIZE = 16);
            Renderer = /** @class */ (function () {
                function Renderer() {
                    this.cameraOffsetX = 0;
                    this.cameraOffsetY = 0;
                    this.zoom = 2.5;
                }
                Renderer.prototype.render = function (worldEntities, uiEntities) {
                    var _this = this;
                    CANVAS.width = CANVAS.clientWidth;
                    CANVAS.height = CANVAS.clientHeight;
                    CANVAS_CONTEXT.imageSmoothingEnabled = false;
                    CANVAS_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
                    worldEntities.forEach(function (e) { return _this.renderEntity(e, _this.cameraOffsetX, _this.cameraOffsetY); });
                    uiEntities.forEach(function (e) { return _this.renderEntity(e, 0, 0); });
                };
                Renderer.prototype.getDimensions = function () {
                    return new util_2.Point(CANVAS.width / TILE_SIZE / this.zoom, CANVAS.height / TILE_SIZE / this.zoom);
                };
                Renderer.prototype.renderEntity = function (entity, cameraOffsetX, cameraOffsetY) {
                    CANVAS_CONTEXT.drawImage(TILE_SET, entity.tileSetIndex.x * (TILE_SIZE + 1), entity.tileSetIndex.y * (TILE_SIZE + 1), TILE_SIZE, TILE_SIZE, this.pixelNum(entity.position.x * this.zoom + cameraOffsetX), this.pixelNum(entity.position.y * this.zoom + cameraOffsetY), TILE_SIZE * this.zoom, TILE_SIZE * this.zoom);
                };
                Renderer.prototype.pixelNum = function (val) {
                    return val - val % this.zoom;
                };
                return Renderer;
            }());
            exports_4("Renderer", Renderer);
        }
    };
});
System.register("game", ["entity", "util", "renderer"], function (exports_5, context_5) {
    "use strict";
    var entity_1, util_3, renderer_1, Game;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (entity_1_1) {
                entity_1 = entity_1_1;
            },
            function (util_3_1) {
                util_3 = util_3_1;
            },
            function (renderer_1_1) {
                renderer_1 = renderer_1_1;
            }
        ],
        execute: function () {
            Game = /** @class */ (function () {
                function Game() {
                    this.worldEntities = [
                        new entity_1.Entity(entity_1.Tile.GRASS_1, new util_3.Point(1, 1).times(renderer_1.TILE_SIZE)),
                        new entity_1.Player(entity_1.Tile.GUY_1, new util_3.Point(2, 2).times(renderer_1.TILE_SIZE))
                    ];
                }
                // entities in the world space
                Game.prototype.getWorldEntities = function () {
                    return this.worldEntities;
                };
                // entities whose position is fixed on the camera
                Game.prototype.getUIEntities = function (updateData) {
                    var result = [];
                    result.push(new entity_1.Entity(entity_1.Tile.BORDER_1, new util_3.Point(0, 0)));
                    result.push(new entity_1.Entity(entity_1.Tile.BORDER_3, new util_3.Point(updateData.dimensions.x - 1, 0).times(renderer_1.TILE_SIZE)));
                    result.push(new entity_1.Entity(entity_1.Tile.BORDER_5, new util_3.Point(updateData.dimensions.x - 1, updateData.dimensions.y - 1).times(renderer_1.TILE_SIZE)));
                    result.push(new entity_1.Entity(entity_1.Tile.BORDER_7, new util_3.Point(0, updateData.dimensions.y - 1).times(renderer_1.TILE_SIZE)));
                    // horizontal lines
                    for (var i = 1; i < updateData.dimensions.x - 1; i++) {
                        result.push(new entity_1.Entity(entity_1.Tile.BORDER_2, new util_3.Point(i, 0).times(renderer_1.TILE_SIZE)));
                        result.push(new entity_1.Entity(entity_1.Tile.BORDER_6, new util_3.Point(i, updateData.dimensions.y - 1).times(renderer_1.TILE_SIZE)));
                    }
                    // vertical lines
                    for (var j = 1; j < updateData.dimensions.y - 1; j++) {
                        result.push(new entity_1.Entity(entity_1.Tile.BORDER_4, new util_3.Point(updateData.dimensions.x - 1, j).times(renderer_1.TILE_SIZE)));
                        result.push(new entity_1.Entity(entity_1.Tile.BORDER_8, new util_3.Point(0, j).times(renderer_1.TILE_SIZE)));
                    }
                    return result;
                };
                return Game;
            }());
            exports_5("Game", Game);
        }
    };
});
System.register("app", ["renderer", "input", "game"], function (exports_6, context_6) {
    "use strict";
    var renderer_2, input_1, game_1, UpdateData, Engine;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (renderer_2_1) {
                renderer_2 = renderer_2_1;
            },
            function (input_1_1) {
                input_1 = input_1_1;
            },
            function (game_1_1) {
                game_1 = game_1_1;
            }
        ],
        execute: function () {
            UpdateData = /** @class */ (function () {
                function UpdateData() {
                }
                return UpdateData;
            }());
            exports_6("UpdateData", UpdateData);
            Engine = /** @class */ (function () {
                function Engine() {
                    var _this = this;
                    this.renderer = new renderer_2.Renderer();
                    this.input = new input_1.Input();
                    this.game = new game_1.Game();
                    this.lastUpdateMillis = new Date().getTime();
                    setInterval(function () { return _this.tick(); }, 1 / 60);
                }
                Engine.prototype.tick = function () {
                    var time = new Date().getTime();
                    var elapsed = time - this.lastUpdateMillis;
                    if (elapsed == 0) {
                        return;
                    }
                    var updateData = {
                        currentSessionTicks: this.currentSessionTicks,
                        elapsedTimeMillis: elapsed,
                        input: this.input.captureInput(),
                        dimensions: this.renderer.getDimensions()
                    };
                    var worldEntities = this.game.getWorldEntities();
                    var uiEntities = this.game.getUIEntities(updateData);
                    worldEntities.forEach(function (tile) { return tile.update(updateData); });
                    this.renderer.render(worldEntities, uiEntities);
                    this.currentSessionTicks++;
                    this.lastUpdateMillis = time;
                };
                return Engine;
            }());
            new Engine();
        }
    };
});
