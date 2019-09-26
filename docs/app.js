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
System.register("tile", ["util"], function (exports_2, context_2) {
    "use strict";
    var util_1, TileType, Tile;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [
            function (util_1_1) {
                util_1 = util_1_1;
            }
        ],
        execute: function () {
            TileType = /** @class */ (function () {
                function TileType() {
                }
                TileType.BLANK = new util_1.Point(0, 0);
                TileType.GROUND_1 = new util_1.Point(1, 0);
                TileType.GROUND_2 = new util_1.Point(2, 0);
                TileType.GROUND_3 = new util_1.Point(3, 0);
                TileType.GROUND_4 = new util_1.Point(4, 0);
                TileType.GRASS_1 = new util_1.Point(5, 0);
                TileType.GRASS_2 = new util_1.Point(6, 0);
                TileType.GRASS_3 = new util_1.Point(7, 0);
                return TileType;
            }());
            exports_2("TileType", TileType);
            Tile = /** @class */ (function () {
                function Tile(tileSetIndex, position) {
                    this.tileSetIndex = tileSetIndex;
                    this.position = position;
                }
                Tile.prototype.setPosition = function (position) {
                    this.position = position;
                };
                return Tile;
            }());
            exports_2("Tile", Tile);
        }
    };
});
System.register("renderer", [], function (exports_3, context_3) {
    "use strict";
    var CANVAS, CANVAS_CONTEXT, TILE_SET, TILE_SET_SIZE, TILE_SIZE, Renderer;
    var __moduleName = context_3 && context_3.id;
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
                    this.zoom = 2;
                }
                Renderer.prototype.render = function (tiles) {
                    var _this = this;
                    CANVAS_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
                    tiles.forEach(function (t) { return _this.renderTile(t); });
                };
                Renderer.prototype.renderTile = function (tile) {
                    CANVAS_CONTEXT.drawImage(TILE_SET, tile.tileSetIndex.x * TILE_SIZE, tile.tileSetIndex.y * TILE_SIZE, TILE_SIZE, TILE_SIZE, tile.position.x * TILE_SIZE + this.cameraOffsetX, tile.position.y * TILE_SIZE + this.cameraOffsetY, TILE_SIZE * this.zoom, TILE_SIZE * this.zoom);
                };
                return Renderer;
            }());
            exports_3("Renderer", Renderer);
        }
    };
});
System.register("app", ["tile", "renderer", "util"], function (exports_4, context_4) {
    "use strict";
    var tile_1, renderer_1, util_2, currentSessionTicks;
    var __moduleName = context_4 && context_4.id;
    function tick() {
        var RENDERER = new renderer_1.Renderer();
        RENDERER.render([
            new tile_1.Tile(tile_1.TileType.GRASS_1, new util_2.Point(1, 2)),
            new tile_1.Tile(tile_1.TileType.BLANK, new util_2.Point(1, 3)),
            new tile_1.Tile(tile_1.TileType.GROUND_1, new util_2.Point(1, 4)),
            new tile_1.Tile(tile_1.TileType.GROUND_3, new util_2.Point(1, 6))
        ]);
        currentSessionTicks;
    }
    return {
        setters: [
            function (tile_1_1) {
                tile_1 = tile_1_1;
            },
            function (renderer_1_1) {
                renderer_1 = renderer_1_1;
            },
            function (util_2_1) {
                util_2 = util_2_1;
            }
        ],
        execute: function () {
            currentSessionTicks = 0;
            setInterval(tick, 1 / 60);
        }
    };
});
