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
System.register("engine/input", ["engine/point"], function (exports_2, context_2) {
    "use strict";
    var point_1, Input, CapturedInput;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [
            function (point_1_1) {
                point_1 = point_1_1;
            }
        ],
        execute: function () {
            Input = /** @class */ (function () {
                function Input(canvas) {
                    var _this = this;
                    this.keys = new Set();
                    this.lastCapture = new CapturedInput();
                    this.mousePos = new point_1.Point(0, 0);
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
                        _this.mousePos = new point_1.Point(e.x - canvas.offsetLeft, e.y - canvas.offsetTop);
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
            exports_2("Input", Input);
            // TODO: Capture mouse input for clickable elements
            CapturedInput = /** @class */ (function () {
                function CapturedInput(keysDown, keysHeld, keysUp, mousePos, isMouseDown, isMouseHeld, isMouseUp) {
                    if (keysDown === void 0) { keysDown = new Set(); }
                    if (keysHeld === void 0) { keysHeld = new Set(); }
                    if (keysUp === void 0) { keysUp = new Set(); }
                    if (mousePos === void 0) { mousePos = new point_1.Point(0, 0); }
                    if (isMouseDown === void 0) { isMouseDown = false; }
                    if (isMouseHeld === void 0) { isMouseHeld = false; }
                    if (isMouseUp === void 0) { isMouseUp = false; }
                    this.mousePos = new point_1.Point(0, 0);
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
            exports_2("CapturedInput", CapturedInput);
        }
    };
});
System.register("engine/view", ["engine/point"], function (exports_3, context_3) {
    "use strict";
    var point_2, View;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (point_2_1) {
                point_2 = point_2_1;
            }
        ],
        execute: function () {
            View = /** @class */ (function () {
                function View() {
                    this.zoom = 0; // scale of the view
                    this.offset = new point_2.Point(0, 0); // transform applied to all entities in the view (scaled by zoom)
                    this.entities = []; // entities ordered by depth (back to front)
                }
                return View;
            }());
            exports_3("View", View);
        }
    };
});
System.register("engine/renderer", ["engine/point"], function (exports_4, context_4) {
    "use strict";
    var point_3, Renderer, RenderImage;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (point_3_1) {
                point_3 = point_3_1;
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
                    return new point_3.Point(this.canvas.width, this.canvas.height);
                };
                Renderer.prototype.renderView = function (view) {
                    var _this = this;
                    view.entities.forEach(function (e) {
                        var img = e.getRenderImage();
                        var position = e.position.plus(img.dimensions.div(2)).times(view.zoom); // center of object to draw
                        var rotation = 0 * Math.PI / 180;
                        _this.context.translate(position.x, position.y);
                        _this.context.rotate(rotation);
                        _this.context.drawImage(img.source, img.position.x, img.position.y, img.dimensions.x, img.dimensions.y, _this.pixelNum(view.zoom * (-img.dimensions.x / 2 + view.offset.x), view.zoom), _this.pixelNum(view.zoom * (-img.dimensions.y / 2 + view.offset.y), view.zoom), img.dimensions.x * view.zoom * img.scale, img.dimensions.y * view.zoom * img.scale);
                        _this.context.rotate(-rotation);
                        _this.context.translate(-position.x, -position.y);
                    });
                };
                Renderer.prototype.pixelNum = function (val, zoom) {
                    return val - (val % zoom);
                };
                return Renderer;
            }());
            exports_4("Renderer", Renderer);
            RenderImage = /** @class */ (function () {
                function RenderImage(source, position, dimensions, rotation, scale) {
                    if (rotation === void 0) { rotation = 0; }
                    if (scale === void 0) { scale = 1; }
                    this.source = source;
                    this.position = position;
                    this.dimensions = dimensions;
                    this.rotation = rotation;
                    this.scale = scale;
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
System.register("game/tiles", ["engine/entity", "engine/point", "engine/renderer"], function (exports_8, context_8) {
    "use strict";
    var entity_1, point_4, renderer_2, TILE_SET, TILE_SIZE, Tile, TileEntity, Player;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (entity_1_1) {
                entity_1 = entity_1_1;
            },
            function (point_4_1) {
                point_4 = point_4_1;
            },
            function (renderer_2_1) {
                renderer_2 = renderer_2_1;
            }
        ],
        execute: function () {
            TILE_SET = document.getElementById("tileset");
            exports_8("TILE_SIZE", TILE_SIZE = 16);
            Tile = /** @class */ (function () {
                function Tile() {
                }
                // environment
                Tile.GROUND_1 = new point_4.Point(1, 0);
                Tile.GROUND_2 = new point_4.Point(2, 0);
                Tile.GROUND_3 = new point_4.Point(3, 0);
                Tile.GROUND_4 = new point_4.Point(4, 0);
                Tile.GRASS_1 = new point_4.Point(5, 0);
                Tile.GRASS_2 = new point_4.Point(6, 0);
                Tile.GRASS_3 = new point_4.Point(7, 0);
                Tile.TREE_1 = new point_4.Point(0, 1);
                Tile.TREE_2 = new point_4.Point(1, 1);
                Tile.TREE_3 = new point_4.Point(2, 1);
                Tile.TREE_4 = new point_4.Point(3, 1);
                Tile.TREE_5 = new point_4.Point(4, 1);
                Tile.TREE_6 = new point_4.Point(5, 1);
                Tile.CACTUS = new point_4.Point(6, 1);
                Tile.CACTI = new point_4.Point(7, 1);
                Tile.TALL_GRASS = new point_4.Point(0, 2);
                Tile.VINES_TOP = new point_4.Point(1, 2);
                Tile.VINES_BOTTOM = new point_4.Point(2, 2);
                Tile.TREES = new point_4.Point(3, 2);
                Tile.ROUND_TREE = new point_4.Point(4, 2);
                Tile.ROCKS = new point_4.Point(5, 2);
                Tile.DEAD_TREE = new point_4.Point(6, 2);
                Tile.PALM_TREE = new point_4.Point(7, 2);
                Tile.DOOR_1 = new point_4.Point(9, 3);
                Tile.DOOR_2 = new point_4.Point(9, 4);
                Tile.DOOR_3 = new point_4.Point(9, 5);
                Tile.DOOR_OPEN = new point_4.Point(9, 6);
                // characters
                Tile.GUY_1 = new point_4.Point(24, 0);
                // items
                Tile.COIN = new point_4.Point(22, 4);
                Tile.DIAMOND = new point_4.Point(23, 4);
                // ui
                Tile.BORDER_1 = new point_4.Point(0, 16);
                Tile.BORDER_2 = new point_4.Point(1, 16);
                Tile.BORDER_3 = new point_4.Point(2, 16);
                Tile.BORDER_4 = new point_4.Point(2, 17);
                Tile.BORDER_5 = new point_4.Point(2, 18);
                Tile.BORDER_6 = new point_4.Point(1, 18);
                Tile.BORDER_7 = new point_4.Point(0, 18);
                Tile.BORDER_8 = new point_4.Point(0, 17);
                Tile.DPAD_DEFAULT = new point_4.Point(27, 22);
                Tile.DPAD_UP = new point_4.Point(28, 22);
                Tile.DPAD_RIGHT = new point_4.Point(29, 22);
                Tile.DPAD_DOWN = new point_4.Point(30, 22);
                Tile.DPAD_LEFT = new point_4.Point(31, 22);
                return Tile;
            }());
            exports_8("Tile", Tile);
            TileEntity = /** @class */ (function (_super) {
                __extends(TileEntity, _super);
                function TileEntity(tileSetIndex, position, rotation, scale) {
                    if (rotation === void 0) { rotation = 0; }
                    if (scale === void 0) { scale = 1; }
                    var _this = _super.call(this, position) || this;
                    _this.tileSetIndex = tileSetIndex;
                    _this.rotation = rotation;
                    _this.scale = scale;
                    return _this;
                }
                TileEntity.prototype.setTileSetIndex = function (tileSetIndex) {
                    this.tileSetIndex = tileSetIndex;
                };
                TileEntity.prototype.getRenderImage = function () {
                    return new renderer_2.RenderImage(TILE_SET, new point_4.Point(this.tileSetIndex.x, this.tileSetIndex.y).times(TILE_SIZE + 1), new point_4.Point(TILE_SIZE, TILE_SIZE), this.rotation, this.scale);
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
                    this.position = new point_4.Point(this.position.x + dx / updateData.elapsedTimeMillis * this.speed, this.position.y + dy / updateData.elapsedTimeMillis * this.speed);
                };
                return Player;
            }(TileEntity));
            exports_8("Player", Player);
        }
    };
});
System.register("game/quest_game", ["engine/point", "engine/game", "engine/view", "game/tiles"], function (exports_9, context_9) {
    "use strict";
    var point_5, game_1, view_1, tiles_1, ZOOM, QuestGame;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (point_5_1) {
                point_5 = point_5_1;
            },
            function (game_1_1) {
                game_1 = game_1_1;
            },
            function (view_1_1) {
                view_1 = view_1_1;
            },
            function (tiles_1_1) {
                tiles_1 = tiles_1_1;
            }
        ],
        execute: function () {
            ZOOM = 2.5;
            QuestGame = /** @class */ (function (_super) {
                __extends(QuestGame, _super);
                function QuestGame() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.player = new tiles_1.Player(tiles_1.Tile.GUY_1, new point_5.Point(2, 2).times(tiles_1.TILE_SIZE));
                    _this.worldEntities = [
                        new tiles_1.TileEntity(tiles_1.Tile.GRASS_1, new point_5.Point(1, 1).times(tiles_1.TILE_SIZE)),
                        _this.player
                    ];
                    _this.gameEntityView = new view_1.View();
                    _this.uiView = new view_1.View();
                    return _this;
                }
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
                        entities: this.worldEntities
                    };
                    this.uiView = {
                        zoom: ZOOM,
                        offset: new point_5.Point(0, 0),
                        entities: this.getUIEntities()
                    };
                };
                // entities whose position is fixed on the camera
                QuestGame.prototype.getUIEntities = function () {
                    var dimensions = new point_5.Point(25, 20); // tile dimensions
                    var result = [];
                    result.push(new tiles_1.TileEntity(tiles_1.Tile.BORDER_1, new point_5.Point(0, 0)));
                    result.push(new tiles_1.TileEntity(tiles_1.Tile.BORDER_3, new point_5.Point(dimensions.x - 1, 0).times(tiles_1.TILE_SIZE)));
                    result.push(new tiles_1.TileEntity(tiles_1.Tile.BORDER_5, new point_5.Point(dimensions.x - 1, dimensions.y - 1).times(tiles_1.TILE_SIZE)));
                    result.push(new tiles_1.TileEntity(tiles_1.Tile.BORDER_7, new point_5.Point(0, dimensions.y - 1).times(tiles_1.TILE_SIZE)));
                    // horizontal lines
                    for (var i = 1; i < dimensions.x - 1; i++) {
                        result.push(new tiles_1.TileEntity(tiles_1.Tile.BORDER_2, new point_5.Point(i, 0).times(tiles_1.TILE_SIZE)));
                        result.push(new tiles_1.TileEntity(tiles_1.Tile.BORDER_6, new point_5.Point(i, dimensions.y - 1).times(tiles_1.TILE_SIZE)));
                    }
                    // vertical lines
                    for (var j = 1; j < dimensions.y - 1; j++) {
                        result.push(new tiles_1.TileEntity(tiles_1.Tile.BORDER_4, new point_5.Point(dimensions.x - 1, j).times(tiles_1.TILE_SIZE)));
                        result.push(new tiles_1.TileEntity(tiles_1.Tile.BORDER_8, new point_5.Point(0, j).times(tiles_1.TILE_SIZE)));
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
