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
                Point.prototype.plus = function (other) {
                    return new Point(this.x + other.x, this.y + other.y);
                };
                return Point;
            }());
            exports_1("Point", Point);
        }
    };
});
System.register("engine/input", [], function (exports_2, context_2) {
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
System.register("engine/view", [], function (exports_3, context_3) {
    "use strict";
    var View;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [],
        execute: function () {
            View = /** @class */ (function () {
                function View() {
                }
                return View;
            }());
            exports_3("View", View);
        }
    };
});
System.register("engine/renderer", ["engine/point"], function (exports_4, context_4) {
    "use strict";
    var point_1, Renderer, RenderImage;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (point_1_1) {
                point_1 = point_1_1;
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
                    return new point_1.Point(this.canvas.width, this.canvas.height);
                };
                Renderer.prototype.renderView = function (view) {
                    var _this = this;
                    view.entities.forEach(function (e) {
                        var img = e.getRenderImage();
                        _this.context.drawImage(img.source, img.position.x, img.position.y, img.dimensions.x, img.dimensions.y, _this.pixelNum(e.position.x * view.zoom + view.offset.x, view.zoom), _this.pixelNum(e.position.y * view.zoom + view.offset.y, view.zoom), img.dimensions.x * view.zoom, img.dimensions.y * view.zoom);
                    });
                };
                Renderer.prototype.pixelNum = function (val, zoom) {
                    return val - (val % zoom);
                };
                return Renderer;
            }());
            exports_4("Renderer", Renderer);
            RenderImage = /** @class */ (function () {
                function RenderImage() {
                }
                return RenderImage;
            }());
            exports_4("RenderImage", RenderImage);
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
    var renderer_1, input_1, UpdateData, Engine;
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
            UpdateData = /** @class */ (function () {
                function UpdateData() {
                }
                return UpdateData;
            }());
            exports_6("UpdateData", UpdateData);
            Engine = /** @class */ (function () {
                function Engine(game, canvas) {
                    var _this = this;
                    this.input = new input_1.Input();
                    this.lastUpdateMillis = new Date().getTime();
                    this.game = game;
                    this.renderer = new renderer_1.Renderer(canvas);
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
                    var views = this.game.getViews(updateData);
                    views.forEach(function (v) { return v.entities.forEach(function (e) { return e.update(updateData); }); });
                    this.renderer.render(views);
                    this.currentSessionTicks++;
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
            Entity = /** @class */ (function () {
                function Entity(position) {
                    this.position = position;
                }
                Entity.prototype.update = function (updateData) { };
                return Entity;
            }());
            exports_7("Entity", Entity);
        }
    };
});
System.register("game/tiles", ["engine/entity", "engine/point"], function (exports_8, context_8) {
    "use strict";
    var entity_1, point_2, TILE_SET, TILE_SIZE, Tile, TileEntity, Player;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (entity_1_1) {
                entity_1 = entity_1_1;
            },
            function (point_2_1) {
                point_2 = point_2_1;
            }
        ],
        execute: function () {
            TILE_SET = document.getElementById("tileset");
            exports_8("TILE_SIZE", TILE_SIZE = 16);
            Tile = /** @class */ (function () {
                function Tile() {
                }
                Tile.BLANK = new point_2.Point(0, 0);
                Tile.GROUND_1 = new point_2.Point(1, 0);
                Tile.GROUND_2 = new point_2.Point(2, 0);
                Tile.GROUND_3 = new point_2.Point(3, 0);
                Tile.GROUND_4 = new point_2.Point(4, 0);
                Tile.GRASS_1 = new point_2.Point(5, 0);
                Tile.GRASS_2 = new point_2.Point(6, 0);
                Tile.GRASS_3 = new point_2.Point(7, 0);
                Tile.GUY_1 = new point_2.Point(24, 0);
                Tile.BORDER_1 = new point_2.Point(0, 16);
                Tile.BORDER_2 = new point_2.Point(1, 16);
                Tile.BORDER_3 = new point_2.Point(2, 16);
                Tile.BORDER_4 = new point_2.Point(2, 17);
                Tile.BORDER_5 = new point_2.Point(2, 18);
                Tile.BORDER_6 = new point_2.Point(1, 18);
                Tile.BORDER_7 = new point_2.Point(0, 18);
                Tile.BORDER_8 = new point_2.Point(0, 17);
                return Tile;
            }());
            exports_8("Tile", Tile);
            TileEntity = /** @class */ (function (_super) {
                __extends(TileEntity, _super);
                function TileEntity(tileSetIndex, position) {
                    var _this = _super.call(this, position) || this;
                    _this.tileSetIndex = tileSetIndex;
                    return _this;
                }
                TileEntity.prototype.getRenderImage = function () {
                    return {
                        source: TILE_SET,
                        position: new point_2.Point(this.tileSetIndex.x, this.tileSetIndex.y).times(TILE_SIZE + 1),
                        dimensions: new point_2.Point(TILE_SIZE, TILE_SIZE)
                    };
                };
                return TileEntity;
            }(entity_1.Entity));
            exports_8("TileEntity", TileEntity);
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
                    this.position = new point_2.Point(this.position.x + dx / updateData.elapsedTimeMillis * this.speed, this.position.y + dy / updateData.elapsedTimeMillis * this.speed);
                };
                return Player;
            }(TileEntity));
            exports_8("Player", Player);
        }
    };
});
System.register("game/quest_game", ["engine/point", "engine/game", "game/tiles"], function (exports_9, context_9) {
    "use strict";
    var point_3, game_1, tiles_1, TILE_SET, QuestGame;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (point_3_1) {
                point_3 = point_3_1;
            },
            function (game_1_1) {
                game_1 = game_1_1;
            },
            function (tiles_1_1) {
                tiles_1 = tiles_1_1;
            }
        ],
        execute: function () {
            TILE_SET = document.getElementById("tileset");
            QuestGame = /** @class */ (function (_super) {
                __extends(QuestGame, _super);
                function QuestGame() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.worldEntities = [
                        new tiles_1.TileEntity(tiles_1.Tile.GRASS_1, new point_3.Point(1, 1).times(tiles_1.TILE_SIZE)),
                        new tiles_1.Player(tiles_1.Tile.GUY_1, new point_3.Point(2, 2).times(tiles_1.TILE_SIZE))
                    ];
                    return _this;
                }
                // entities in the world space
                QuestGame.prototype.getViews = function (updateData) {
                    var gameEntityView = {
                        zoom: 2.5,
                        offset: new point_3.Point(0, 0),
                        entities: this.worldEntities
                    };
                    var uiView = {
                        zoom: 2.5,
                        offset: new point_3.Point(0, 0),
                        entities: this.getUIEntities()
                    };
                    return [gameEntityView, uiView];
                };
                // entities whose position is fixed on the camera
                QuestGame.prototype.getUIEntities = function () {
                    var dimensions = new point_3.Point(25, 20); // tile dimensions
                    var result = [];
                    result.push(new tiles_1.TileEntity(tiles_1.Tile.BORDER_1, new point_3.Point(0, 0)));
                    result.push(new tiles_1.TileEntity(tiles_1.Tile.BORDER_3, new point_3.Point(dimensions.x - 1, 0).times(tiles_1.TILE_SIZE)));
                    result.push(new tiles_1.TileEntity(tiles_1.Tile.BORDER_5, new point_3.Point(dimensions.x - 1, dimensions.y - 1).times(tiles_1.TILE_SIZE)));
                    result.push(new tiles_1.TileEntity(tiles_1.Tile.BORDER_7, new point_3.Point(0, dimensions.y - 1).times(tiles_1.TILE_SIZE)));
                    // horizontal lines
                    for (var i = 1; i < dimensions.x - 1; i++) {
                        result.push(new tiles_1.TileEntity(tiles_1.Tile.BORDER_2, new point_3.Point(i, 0).times(tiles_1.TILE_SIZE)));
                        result.push(new tiles_1.TileEntity(tiles_1.Tile.BORDER_6, new point_3.Point(i, dimensions.y - 1).times(tiles_1.TILE_SIZE)));
                    }
                    // vertical lines
                    for (var j = 1; j < dimensions.y - 1; j++) {
                        result.push(new tiles_1.TileEntity(tiles_1.Tile.BORDER_4, new point_3.Point(dimensions.x - 1, j).times(tiles_1.TILE_SIZE)));
                        result.push(new tiles_1.TileEntity(tiles_1.Tile.BORDER_8, new point_3.Point(0, j).times(tiles_1.TILE_SIZE)));
                    }
                    return result;
                };
                return QuestGame;
            }(game_1.Game));
            exports_9("QuestGame", QuestGame);
        }
    };
});
System.register("app", ["game/quest_game", "engine/engine"], function (exports_10, context_10) {
    "use strict";
    var quest_game_1, engine_1;
    var __moduleName = context_10 && context_10.id;
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
