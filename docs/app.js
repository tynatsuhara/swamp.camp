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
                return Tile;
            }());
            exports_3("Tile", Tile);
            Entity = /** @class */ (function () {
                function Entity(tileSetIndex, position) {
                    this.tileSetIndex = tileSetIndex;
                    this.position = position;
                }
                Entity.prototype.update = function (input) { };
                return Entity;
            }());
            exports_3("Entity", Entity);
            Player = /** @class */ (function (_super) {
                __extends(Player, _super);
                function Player() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Player.prototype.update = function (input) {
                    if (input.isKeyDown(68 /* D */)) {
                        this.position = new util_1.Point(this.position.x + 1, this.position.y);
                        console.log(this.position);
                    }
                };
                return Player;
            }(Entity));
            exports_3("Player", Player);
        }
    };
});
System.register("renderer", [], function (exports_4, context_4) {
    "use strict";
    var CANVAS, CANVAS_CONTEXT, TILE_SET, TILE_SET_SIZE, TILE_SIZE, Renderer;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [],
        execute: function () {
            CANVAS = document.getElementById('canvas');
            CANVAS_CONTEXT = CANVAS.getContext('2d');
            TILE_SET = document.getElementById("tileset");
            TILE_SET_SIZE = 32;
            TILE_SIZE = 16;
            Renderer = /** @class */ (function () {
                function Renderer() {
                    this.cameraOffsetX = 0;
                    this.cameraOffsetY = 0;
                    this.zoom = 2.5;
                }
                Renderer.prototype.render = function (entities) {
                    var _this = this;
                    CANVAS.width = CANVAS.clientWidth;
                    CANVAS.height = CANVAS.clientHeight;
                    CANVAS_CONTEXT.imageSmoothingEnabled = false;
                    CANVAS_CONTEXT.fillStyle = "#472d3c";
                    CANVAS_CONTEXT.rect(0, 0, CANVAS.width, CANVAS.height);
                    CANVAS_CONTEXT.fill();
                    // CANVAS_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height)
                    entities.forEach(function (e) { return _this.renderEntity(e); });
                };
                Renderer.prototype.renderEntity = function (entity) {
                    CANVAS_CONTEXT.drawImage(TILE_SET, entity.tileSetIndex.x * TILE_SIZE, entity.tileSetIndex.y * TILE_SIZE, TILE_SIZE, TILE_SIZE, entity.position.x * TILE_SIZE * this.zoom + this.cameraOffsetX, entity.position.y * TILE_SIZE * this.zoom + this.cameraOffsetY, TILE_SIZE * this.zoom, TILE_SIZE * this.zoom);
                };
                return Renderer;
            }());
            exports_4("Renderer", Renderer);
        }
    };
});
System.register("game", ["entity", "util"], function (exports_5, context_5) {
    "use strict";
    var entity_1, util_2, Game;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (entity_1_1) {
                entity_1 = entity_1_1;
            },
            function (util_2_1) {
                util_2 = util_2_1;
            }
        ],
        execute: function () {
            Game = /** @class */ (function () {
                function Game() {
                    this.tiles = [
                        new entity_1.Player(entity_1.Tile.GROUND_4, new util_2.Point(0, 0)),
                        new entity_1.Entity(entity_1.Tile.GRASS_1, new util_2.Point(1, 2)),
                        new entity_1.Entity(entity_1.Tile.GRASS_3, new util_2.Point(1, 3)),
                        new entity_1.Entity(entity_1.Tile.GROUND_1, new util_2.Point(1, 4)),
                        new entity_1.Entity(entity_1.Tile.GROUND_3, new util_2.Point(1, 6))
                    ];
                }
                Game.prototype.getEntities = function () {
                    return this.tiles;
                };
                return Game;
            }());
            exports_5("Game", Game);
        }
    };
});
System.register("app", ["renderer", "input", "game"], function (exports_6, context_6) {
    "use strict";
    var renderer_1, input_1, game_1, RENDERER, INPUT, GAME, currentSessionTicks;
    var __moduleName = context_6 && context_6.id;
    function tick() {
        var input = INPUT.captureInput();
        var entities = GAME.getEntities();
        entities.forEach(function (tile) { return tile.update(input); });
        RENDERER.render(entities);
        currentSessionTicks++;
    }
    return {
        setters: [
            function (renderer_1_1) {
                renderer_1 = renderer_1_1;
            },
            function (input_1_1) {
                input_1 = input_1_1;
            },
            function (game_1_1) {
                game_1 = game_1_1;
            }
        ],
        execute: function () {
            RENDERER = new renderer_1.Renderer();
            INPUT = new input_1.Input();
            GAME = new game_1.Game();
            currentSessionTicks = 0;
            setInterval(tick, 1 / 60);
        }
    };
});
