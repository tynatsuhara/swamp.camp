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
                function View(entities, zoom, offset) {
                    if (entities === void 0) { entities = []; }
                    if (zoom === void 0) { zoom = 1; }
                    if (offset === void 0) { offset = new point_1.Point(0, 0); }
                    this.entities = []; // entities ordered by depth (back to front)
                    this.zoom = 1; // scale of the view
                    this.offset = new point_1.Point(0, 0); // transform applied to all entities in the view (scaled by zoom)
                    this.entities = entities;
                    this.zoom = zoom;
                    this.offset = offset;
                }
                return View;
            }());
            exports_2("View", View);
        }
    };
});
System.register("engine/renderer/RenderContext", ["engine/point"], function (exports_3, context_3) {
    "use strict";
    var point_2, RenderContext;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (point_2_1) {
                point_2 = point_2_1;
            }
        ],
        execute: function () {
            RenderContext = /** @class */ (function () {
                function RenderContext(context, view) {
                    this.context = context;
                    this.view = view;
                }
                Object.defineProperty(RenderContext.prototype, "lineWidth", {
                    set: function (value) { this.context.lineWidth = value; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RenderContext.prototype, "strokeStyle", {
                    set: function (value) { this.context.strokeStyle = value; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RenderContext.prototype, "font", {
                    set: function (value) { this.context.font = value; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(RenderContext.prototype, "fillStyle", {
                    set: function (value) { this.context.fillStyle = value; },
                    enumerable: true,
                    configurable: true
                });
                RenderContext.prototype.fillText = function (text, point) {
                    point = point.plus(this.view.offset).times(this.view.zoom);
                    this.context.fillText(text, point.x, point.y);
                };
                RenderContext.prototype.clearRect = function (x, y, w, h) {
                    this.context.clearRect(x, y, w, h);
                };
                RenderContext.prototype.translate = function (point, pixelPerfect) {
                    if (pixelPerfect === void 0) { pixelPerfect = false; }
                    var pos = point.times(this.view.zoom);
                    if (pixelPerfect) {
                        pos = this.pixelize(pos);
                    }
                    this.context.translate(pos.x, pos.y);
                };
                RenderContext.prototype.drawImage = function (source, sourcePosition, sourceDimensions, destDimensions, pixelPerfect, mirrorX, mirrorY) {
                    var scaledDestPosition = new point_2.Point(-sourceDimensions.x / 2 + (mirrorX ? -1 : 1) * this.view.offset.x, -sourceDimensions.y / 2 + (mirrorY ? -1 : 1) * this.view.offset.y).times(this.view.zoom);
                    if (pixelPerfect) {
                        scaledDestPosition = this.pixelize(scaledDestPosition);
                    }
                    var scaledDestDimensions = destDimensions.times(this.view.zoom);
                    this.context.drawImage(source, sourcePosition.x, sourcePosition.y, sourceDimensions.x, sourceDimensions.y, scaledDestPosition.x, scaledDestPosition.y, scaledDestDimensions.x, scaledDestDimensions.y);
                };
                RenderContext.prototype.rotate = function (angle) {
                    this.context.rotate(angle);
                };
                RenderContext.prototype.scale = function (x, y) {
                    this.context.scale(x, y);
                };
                RenderContext.prototype.beginPath = function () {
                    this.context.beginPath();
                };
                RenderContext.prototype.moveTo = function (point) {
                    point = point.plus(this.view.offset).times(this.view.zoom);
                    this.context.moveTo(point.x, point.y);
                };
                RenderContext.prototype.lineTo = function (point) {
                    point = point.plus(this.view.offset).times(this.view.zoom);
                    this.context.lineTo(point.x, point.y);
                };
                RenderContext.prototype.stroke = function () {
                    this.context.stroke();
                };
                RenderContext.prototype.pixelize = function (point) {
                    return new point_2.Point(point.x - (point.x % this.view.zoom), point.y - (point.y % this.view.zoom));
                };
                return RenderContext;
            }());
            exports_3("RenderContext", RenderContext);
        }
    };
});
System.register("engine/renderer/renderer", ["engine/point", "engine/renderer/RenderContext"], function (exports_4, context_4) {
    "use strict";
    var point_3, RenderContext_1, Renderer;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (point_3_1) {
                point_3 = point_3_1;
            },
            function (RenderContext_1_1) {
                RenderContext_1 = RenderContext_1_1;
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
                    var viewRenderContext = new RenderContext_1.RenderContext(this.context, view);
                    view.entities
                        .filter(function (entity) { return !!entity; })
                        .flatMap(function (entity) { return entity.components; })
                        .filter(function (component) { return !!component; })
                        .flatMap(function (component) { return component.getRenderMethods(); })
                        .forEach(function (renderMethod) { return renderMethod.render(viewRenderContext); });
                };
                return Renderer;
            }());
            exports_4("Renderer", Renderer);
        }
    };
});
System.register("engine/input", ["engine/point"], function (exports_5, context_5) {
    "use strict";
    var point_4, Input, CapturedInput;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (point_4_1) {
                point_4 = point_4_1;
            }
        ],
        execute: function () {
            Input = /** @class */ (function () {
                function Input(canvas) {
                    var _this = this;
                    this.keys = new Set();
                    this.lastCapture = new CapturedInput();
                    this.mousePos = new point_4.Point(0, 0);
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
                        _this.mousePos = new point_4.Point(e.x - canvas.offsetLeft, e.y - canvas.offsetTop);
                    };
                    window.onkeydown = function (e) { return _this.keys.add(e.keyCode); };
                    window.onkeyup = function (e) { return _this.keys.delete(e.keyCode); };
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
            exports_5("Input", Input);
            // TODO: Capture mouse input for clickable elements
            CapturedInput = /** @class */ (function () {
                function CapturedInput(keysDown, keysHeld, keysUp, mousePos, isMouseDown, isMouseHeld, isMouseUp) {
                    if (keysDown === void 0) { keysDown = new Set(); }
                    if (keysHeld === void 0) { keysHeld = new Set(); }
                    if (keysUp === void 0) { keysUp = new Set(); }
                    if (mousePos === void 0) { mousePos = new point_4.Point(0, 0); }
                    if (isMouseDown === void 0) { isMouseDown = false; }
                    if (isMouseHeld === void 0) { isMouseHeld = false; }
                    if (isMouseUp === void 0) { isMouseUp = false; }
                    this.mousePos = new point_4.Point(0, 0);
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
            exports_5("CapturedInput", CapturedInput);
        }
    };
});
System.register("engine/game", [], function (exports_6, context_6) {
    "use strict";
    var Game;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [],
        execute: function () {
            Game = /** @class */ (function () {
                function Game() {
                }
                return Game;
            }());
            exports_6("Game", Game);
        }
    };
});
System.register("engine/renderer/TextRender", ["engine/component"], function (exports_7, context_7) {
    "use strict";
    var component_1, TextRenderComponent;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [
            function (component_1_1) {
                component_1 = component_1_1;
            }
        ],
        execute: function () {
            TextRenderComponent = /** @class */ (function (_super) {
                __extends(TextRenderComponent, _super);
                function TextRenderComponent(text, position, font, color) {
                    if (font === void 0) { font = "20px Comic Sans MS Regular"; }
                    if (color === void 0) { color = "red"; }
                    var _this = _super.call(this) || this;
                    _this.text = text;
                    _this.position = position;
                    _this.font = font;
                    _this.color = color;
                    return _this;
                }
                TextRenderComponent.prototype.getRenderMethods = function () {
                    return [this];
                };
                TextRenderComponent.prototype.render = function (context) {
                    context.font = this.font;
                    context.fillStyle = this.color;
                    context.fillText(this.text, this.position);
                };
                return TextRenderComponent;
            }(component_1.Component));
            exports_7("TextRenderComponent", TextRenderComponent);
        }
    };
});
System.register("engine/profiler", ["engine/view", "engine/entity", "engine/renderer/TextRender", "engine/point"], function (exports_8, context_8) {
    "use strict";
    var view_1, entity_1, TextRender_1, point_5, Profiler, MovingAverage, profiler;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (view_1_1) {
                view_1 = view_1_1;
            },
            function (entity_1_1) {
                entity_1 = entity_1_1;
            },
            function (TextRender_1_1) {
                TextRender_1 = TextRender_1_1;
            },
            function (point_5_1) {
                point_5 = point_5_1;
            }
        ],
        execute: function () {
            Profiler = /** @class */ (function () {
                function Profiler() {
                    this.start = new Date().getTime();
                    this.lastElapsedTimeMillis = 0;
                    this.fpsTracker = new MovingAverage();
                }
                Profiler.prototype.update = function (elapsedTimeMillis) {
                    this.lastElapsedTimeMillis = elapsedTimeMillis;
                    this.fpsTracker.record(elapsedTimeMillis);
                };
                Profiler.prototype.getView = function () {
                    return new view_1.View([
                        new entity_1.Entity([new TextRender_1.TextRenderComponent("FPS: " + Math.round(1000 / this.fpsTracker.get()), new point_5.Point(70, 70))])
                    ]);
                };
                return Profiler;
            }());
            MovingAverage = /** @class */ (function () {
                function MovingAverage() {
                    this.pts = [];
                    this.sum = 0;
                    this.lifetime = 10;
                }
                MovingAverage.prototype.record = function (val) {
                    var now = new Date().getTime();
                    var expireThreshold = now - 1000 * this.lifetime;
                    while (this.pts.length > 0 && this.pts[0][0] < expireThreshold) {
                        var old = this.pts.shift();
                        this.sum -= old[1];
                    }
                    this.pts.push([now, val]);
                    this.sum += val;
                };
                MovingAverage.prototype.get = function () {
                    return this.sum / this.pts.length;
                };
                return MovingAverage;
            }());
            exports_8("profiler", profiler = new Profiler());
        }
    };
});
System.register("engine/debug", [], function (exports_9, context_9) {
    "use strict";
    var debug;
    var __moduleName = context_9 && context_9.id;
    function loadDebug() {
        var stored = localStorage.state;
        if (stored) {
            console.log("loaded debug state from local storage");
            return JSON.parse(stored);
        }
        return {};
    }
    // wrap the DEBUG state so that property changes are observed and saved in local storage
    function observe(obj) {
        var result = {};
        Object.entries(obj).forEach(function (_a) {
            var key = _a[0], val = _a[1];
            Object.defineProperty(result, key, {
                get: function () {
                    return val;
                },
                set: function (value) {
                    debug[key] = value;
                    localStorage.state = JSON.stringify(debug);
                },
                enumerable: true,
                configurable: true
            });
        });
        return result;
    }
    return {
        setters: [],
        execute: function () {
            exports_9("debug", debug = Object.assign({}, {
                showColliders: false,
                showProfiler: false
            }, loadDebug()));
            window['debug'] = observe(debug);
        }
    };
});
System.register("engine/engine", ["engine/renderer/renderer", "engine/input", "engine/profiler", "engine/debug"], function (exports_10, context_10) {
    "use strict";
    var renderer_1, input_1, profiler_1, debug_1, FPS, UpdateViewsContext, StartData, UpdateData, Engine, ALREADY_STARTED_COMPONENT;
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [
            function (renderer_1_1) {
                renderer_1 = renderer_1_1;
            },
            function (input_1_1) {
                input_1 = input_1_1;
            },
            function (profiler_1_1) {
                profiler_1 = profiler_1_1;
            },
            function (debug_1_1) {
                debug_1 = debug_1_1;
            }
        ],
        execute: function () {
            FPS = 60;
            UpdateViewsContext = /** @class */ (function () {
                function UpdateViewsContext() {
                }
                return UpdateViewsContext;
            }());
            exports_10("UpdateViewsContext", UpdateViewsContext);
            StartData = /** @class */ (function () {
                function StartData() {
                }
                return StartData;
            }());
            exports_10("StartData", StartData);
            UpdateData = /** @class */ (function () {
                function UpdateData() {
                }
                return UpdateData;
            }());
            exports_10("UpdateData", UpdateData);
            Engine = /** @class */ (function () {
                function Engine(game, canvas) {
                    var _this = this;
                    this.lastUpdateMillis = new Date().getTime();
                    this.game = game;
                    this.renderer = new renderer_1.Renderer(canvas);
                    this.input = new input_1.Input(canvas);
                    setInterval(function () { return _this.tick(); }, 1000 / FPS);
                }
                Engine.prototype.tick = function () {
                    var time = new Date().getTime();
                    var elapsed = time - this.lastUpdateMillis;
                    profiler_1.profiler.update(elapsed);
                    if (elapsed == 0) {
                        return;
                    }
                    var updateViewsContext = {
                        elapsedTimeMillis: elapsed,
                        input: this.input.captureInput(),
                        dimensions: this.renderer.getDimensions()
                    };
                    var views = this.game.getViews(updateViewsContext);
                    if (debug_1.debug.showProfiler) {
                        views.push(profiler_1.profiler.getView());
                    }
                    views.forEach(function (v) {
                        var startData = {};
                        var updateData = {
                            view: v,
                            elapsedTimeMillis: updateViewsContext.elapsedTimeMillis,
                            input: updateViewsContext.input.scaled(v.zoom),
                            dimensions: updateViewsContext.dimensions.div(v.zoom)
                        };
                        // TODO: consider the behavior where an entity belongs to multiple views (eg splitscreen)
                        v.entities.forEach(function (e) { return e.components.forEach(function (c) {
                            // TODO: maybe do ALL start() calls before we begin updating?
                            if (c.start !== ALREADY_STARTED_COMPONENT) {
                                c.start(startData);
                                c.start = ALREADY_STARTED_COMPONENT;
                            }
                            c.update(updateData);
                        }); });
                    });
                    this.renderer.render(views);
                    this.lastUpdateMillis = time;
                };
                return Engine;
            }());
            exports_10("Engine", Engine);
            ALREADY_STARTED_COMPONENT = function (startData) {
                throw new Error("start() has already been called on this component");
            };
        }
    };
});
System.register("engine/component", [], function (exports_11, context_11) {
    "use strict";
    var Component;
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [],
        execute: function () {
            Component = /** @class */ (function () {
                function Component() {
                }
                /**
                 * Called once, after the component is added to a valid entity and before update() is called
                 */
                Component.prototype.start = function (startData) { };
                /**
                 * Called on each update step
                 */
                Component.prototype.update = function (updateData) { };
                /**
                 * Should be overridden by renderable components
                 */
                Component.prototype.getRenderMethods = function () {
                    return [];
                };
                return Component;
            }());
            exports_11("Component", Component);
        }
    };
});
System.register("engine/renderer/ImageRender", [], function (exports_12, context_12) {
    "use strict";
    var ImageRender;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [],
        execute: function () {
            ImageRender = /** @class */ (function () {
                function ImageRender(source, sourcePosition, dimensions, position, rotation, scale, mirrorX, mirrorY) {
                    if (rotation === void 0) { rotation = 0; }
                    if (scale === void 0) { scale = 1; }
                    if (mirrorX === void 0) { mirrorX = false; }
                    if (mirrorY === void 0) { mirrorY = false; }
                    this.source = source;
                    this.sourcePosition = sourcePosition,
                        this.dimensions = dimensions;
                    this.position = position;
                    this.rotation = rotation;
                    this.scale = scale;
                    this.mirrorX = mirrorX,
                        this.mirrorY = mirrorY;
                }
                ImageRender.prototype.render = function (context) {
                    var position = this.position.plus(this.dimensions.div(2)); // where to draw the this on the canvas (centered)
                    var rotation = 0 * Math.PI / 180;
                    var pixelPerfect = true;
                    context.translate(position, pixelPerfect);
                    context.rotate(rotation);
                    context.scale(this.mirrorX ? -1 : 1, this.mirrorY ? -1 : 1);
                    context.drawImage(this.source, this.sourcePosition, this.dimensions, this.dimensions.times(this.scale), pixelPerfect, this.mirrorX, this.mirrorY);
                    context.scale(this.mirrorX ? -1 : 1, this.mirrorY ? -1 : 1);
                    context.rotate(-rotation);
                    context.translate(position.times(-1), pixelPerfect);
                };
                return ImageRender;
            }());
            exports_12("ImageRender", ImageRender);
        }
    };
});
System.register("engine/tileset", ["engine/point", "engine/renderer/ImageRender", "engine/component"], function (exports_13, context_13) {
    "use strict";
    var point_6, ImageRender_1, component_2, TileSet, TileTransform, TileSource, TileComponent, TileSetAnimation, TileSetAnimator, AnimatedTileComponent;
    var __moduleName = context_13 && context_13.id;
    return {
        setters: [
            function (point_6_1) {
                point_6 = point_6_1;
            },
            function (ImageRender_1_1) {
                ImageRender_1 = ImageRender_1_1;
            },
            function (component_2_1) {
                component_2 = component_2_1;
            }
        ],
        execute: function () {
            // TODO: audit encapsulation of all these classes
            TileSet = /** @class */ (function () {
                function TileSet(image, tileSize, padding) {
                    if (padding === void 0) { padding = 0; }
                    this.image = image;
                    this.tileSize = tileSize;
                    this.padding = padding;
                }
                return TileSet;
            }());
            exports_13("TileSet", TileSet);
            TileTransform = /** @class */ (function () {
                function TileTransform() {
                }
                return TileTransform;
            }());
            exports_13("TileTransform", TileTransform);
            TileSource = /** @class */ (function () {
                /**
                 * Constructs a static tile source
                 */
                function TileSource(tileSet, tileSetIndex) {
                    this.tileSet = tileSet;
                    this.tileSetIndex = tileSetIndex;
                }
                TileSource.prototype.toRenderImage = function (transform) {
                    return new ImageRender_1.ImageRender(this.tileSet.image, new point_6.Point(this.tileSetIndex.x, this.tileSetIndex.y).times(this.tileSet.tileSize + this.tileSet.padding), new point_6.Point(this.tileSet.tileSize, this.tileSet.tileSize), transform.position, transform.rotation, transform.scale, transform.mirrorX, transform.mirrorY);
                };
                return TileSource;
            }());
            exports_13("TileSource", TileSource);
            /**
             * Represents a static (non-animated) tile entity
             */
            TileComponent = /** @class */ (function (_super) {
                __extends(TileComponent, _super);
                function TileComponent(tileSource, position) {
                    if (position === void 0) { position = new point_6.Point(0, 0); }
                    var _this = _super.call(this) || this;
                    _this.transform = new TileTransform();
                    _this.tileSource = tileSource;
                    _this.transform.position = position;
                    return _this;
                }
                TileComponent.prototype.getRenderMethods = function () {
                    return [this.tileSource.toRenderImage(this.transform)];
                };
                return TileComponent;
            }(component_2.Component));
            exports_13("TileComponent", TileComponent);
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
            exports_13("TileSetAnimation", TileSetAnimation);
            TileSetAnimator = /** @class */ (function () {
                function TileSetAnimator(animation) {
                    this.time = 0;
                    this.index = 0;
                    this.animation = animation;
                }
                TileSetAnimator.prototype.update = function (elapsedTimeMillis) {
                    this.time += elapsedTimeMillis;
                    while (this.time > this.animation.frames[this.index][1]) {
                        this.index++;
                        this.index %= this.animation.frames.length;
                        this.time %= this.animation.duration;
                    }
                    return this.getCurrentTileSource();
                };
                TileSetAnimator.prototype.getCurrentTileSource = function () {
                    return this.animation.frames[this.index][0];
                };
                return TileSetAnimator;
            }());
            AnimatedTileComponent = /** @class */ (function (_super) {
                __extends(AnimatedTileComponent, _super);
                function AnimatedTileComponent(animation, position) {
                    if (position === void 0) { position = new point_6.Point(0, 0); }
                    var _this = this;
                    var animator = new TileSetAnimator(animation);
                    _this = _super.call(this, animator.getCurrentTileSource(), position) || this;
                    _this.animator = animator;
                    return _this;
                }
                AnimatedTileComponent.prototype.update = function (updateData) {
                    this.tileSource = this.animator.update(updateData.elapsedTimeMillis);
                };
                return AnimatedTileComponent;
            }(TileComponent));
            exports_13("AnimatedTileComponent", AnimatedTileComponent);
        }
    };
});
System.register("game/tiles", ["engine/point", "engine/tileset"], function (exports_14, context_14) {
    "use strict";
    var point_7, tileset_1, TILE_SIZE, TILE_SET, Tile;
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [
            function (point_7_1) {
                point_7 = point_7_1;
            },
            function (tileset_1_1) {
                tileset_1 = tileset_1_1;
            }
        ],
        execute: function () {
            exports_14("TILE_SIZE", TILE_SIZE = 16);
            TILE_SET = new tileset_1.TileSet(document.getElementById("tileset"), TILE_SIZE, 1);
            Tile = /** @class */ (function () {
                function Tile() {
                }
                Tile.string = function (s) {
                    return Array.from(s).map(function (c) { return Tile.CHARACTER_MAP[c]; });
                };
                Tile.get = function (x, y) {
                    return new tileset_1.TileSource(TILE_SET, new point_7.Point(x, y));
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
                Tile.CHARACTER_MAP = {
                    '0': Tile.get(19, 29),
                    '1': Tile.get(20, 29),
                    '2': Tile.get(21, 29),
                    '3': Tile.get(22, 29),
                    '4': Tile.get(23, 29),
                    '5': Tile.get(24, 29),
                    '6': Tile.get(25, 29),
                    '7': Tile.get(26, 29),
                    '8': Tile.get(27, 29),
                    '9': Tile.get(28, 29),
                    ':': Tile.get(29, 29),
                    '.': Tile.get(30, 29),
                    '%': Tile.get(31, 29),
                    '!': Tile.get(19, 25),
                    '?': Tile.get(21, 25),
                    '$': Tile.get(19, 28),
                    ' ': Tile.get(0, 0),
                    'a': Tile.get(19, 30),
                    'b': Tile.get(20, 30),
                    'c': Tile.get(21, 30),
                    'd': Tile.get(22, 30),
                    'e': Tile.get(23, 30),
                    'f': Tile.get(24, 30),
                    'g': Tile.get(25, 30),
                    'h': Tile.get(26, 30),
                    'i': Tile.get(27, 30),
                    'j': Tile.get(28, 30),
                    'k': Tile.get(29, 30),
                    'l': Tile.get(30, 30),
                    'm': Tile.get(31, 30),
                    'n': Tile.get(19, 31),
                    'o': Tile.get(20, 31),
                    'p': Tile.get(21, 31),
                    'q': Tile.get(22, 31),
                    'r': Tile.get(23, 31),
                    's': Tile.get(24, 31),
                    't': Tile.get(25, 31),
                    'u': Tile.get(26, 31),
                    'v': Tile.get(27, 31),
                    'w': Tile.get(28, 31),
                    'x': Tile.get(29, 31),
                    'y': Tile.get(30, 31),
                    'z': Tile.get(31, 31)
                };
                return Tile;
            }());
            exports_14("Tile", Tile);
        }
    };
});
System.register("engine/entity", [], function (exports_15, context_15) {
    "use strict";
    var Entity;
    var __moduleName = context_15 && context_15.id;
    return {
        setters: [],
        execute: function () {
            /**
             * An object which exists in the game world and updated by the engine. Should be attached to a game view.
             */
            Entity = /** @class */ (function () {
                // TODO: support hierarchical components?
                function Entity(components) {
                    var _this = this;
                    if (components === void 0) { components = []; }
                    this.components = [];
                    components.forEach(function (c) { return _this.addComponent(c); });
                }
                Entity.prototype.addComponent = function (component) {
                    component.entity = this;
                    this.components.push(component);
                    return component;
                };
                Entity.prototype.getComponent = function (componentType) {
                    return this.getComponents(componentType)[0];
                };
                Entity.prototype.getComponents = function (componentType) {
                    return this.components.filter(function (c) { return c instanceof componentType; }).map(function (c) { return c; });
                };
                Entity.prototype.removeComponent = function (component) {
                    this.components = this.components.filter(function (c) { return c !== component; });
                    component.entity = null;
                };
                return Entity;
            }());
            exports_15("Entity", Entity);
        }
    };
});
System.register("engine/grid", [], function (exports_16, context_16) {
    "use strict";
    var Grid;
    var __moduleName = context_16 && context_16.id;
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
            exports_16("Grid", Grid);
        }
    };
});
System.register("engine/renderer/LineRender", [], function (exports_17, context_17) {
    "use strict";
    var LineRender;
    var __moduleName = context_17 && context_17.id;
    return {
        setters: [],
        execute: function () {
            LineRender = /** @class */ (function () {
                function LineRender(start, end, color, width) {
                    if (color === void 0) { color = "#ff0000"; }
                    if (width === void 0) { width = 1; }
                    this.start = start;
                    this.end = end;
                    this.color = color;
                    this.width = width;
                }
                LineRender.prototype.render = function (context) {
                    context.lineWidth = this.width;
                    context.strokeStyle = this.color;
                    context.beginPath();
                    context.moveTo(this.start);
                    context.lineTo(this.end);
                    context.stroke();
                };
                return LineRender;
            }());
            exports_17("LineRender", LineRender);
        }
    };
});
System.register("engine/collision", ["engine/component", "engine/point", "engine/renderer/LineRender", "engine/debug"], function (exports_18, context_18) {
    "use strict";
    var component_3, point_8, LineRender_1, debug_2, CollisionEngine, ENGINE, BoxCollider;
    var __moduleName = context_18 && context_18.id;
    return {
        setters: [
            function (component_3_1) {
                component_3 = component_3_1;
            },
            function (point_8_1) {
                point_8 = point_8_1;
            },
            function (LineRender_1_1) {
                LineRender_1 = LineRender_1_1;
            },
            function (debug_2_1) {
                debug_2 = debug_2_1;
            }
        ],
        execute: function () {
            CollisionEngine = /** @class */ (function () {
                function CollisionEngine() {
                    this.colliders = [];
                }
                CollisionEngine.prototype.registerCollider = function (collider) {
                    this.colliders.push(collider);
                };
                CollisionEngine.prototype.unregisterCollider = function (collider) {
                    this.colliders.filter(function (c) { return c !== collider; });
                };
                CollisionEngine.prototype.checkCollider = function (collider) {
                    this.colliders.filter(function (other) { return other != collider && other.entity; }).forEach(function (other) {
                        var isColliding = !(collider.position.x + collider.dimensions.x < other.position.x // to the left of other
                            || collider.position.x > other.position.x + other.dimensions.x // to the right of other
                            || collider.position.y + collider.dimensions.y < other.position.y // above other
                            || collider.position.y > other.position.y + other.dimensions.y // below other
                        );
                        collider.updateColliding(other, isColliding);
                        other.updateColliding(collider, isColliding);
                    });
                };
                return CollisionEngine;
            }());
            ENGINE = new CollisionEngine();
            BoxCollider = /** @class */ (function (_super) {
                __extends(BoxCollider, _super);
                function BoxCollider(position, dimensions) {
                    var _this = _super.call(this) || this;
                    _this.collidingWith = new Set();
                    _this.onColliderEnterCallback = function () { };
                    _this._position = position;
                    _this.dimensions = dimensions;
                    ENGINE.registerCollider(_this);
                    return _this;
                }
                Object.defineProperty(BoxCollider.prototype, "position", {
                    get: function () { return this._position; },
                    enumerable: true,
                    configurable: true
                });
                BoxCollider.prototype.start = function (startData) {
                    ENGINE.checkCollider(this);
                };
                BoxCollider.prototype.update = function (updateData) { };
                BoxCollider.prototype.moveTo = function (point) {
                    this._position = point;
                    ENGINE.checkCollider(this); // since this is all syncronous, it will work
                    return this.position;
                };
                BoxCollider.prototype.getRenderMethods = function () {
                    if (!debug_2.debug.showColliders) {
                        return [];
                    }
                    var color = this.collidingWith.size > 0 ? "#00ff00" : "#ff0000";
                    return [
                        new LineRender_1.LineRender(this.position, this.position.plus(new point_8.Point(this.dimensions.x, 0)), color),
                        new LineRender_1.LineRender(this.position, this.position.plus(new point_8.Point(0, this.dimensions.y)), color),
                        new LineRender_1.LineRender(this.position.plus(this.dimensions), this.position.plus(new point_8.Point(this.dimensions.x, 0)), color),
                        new LineRender_1.LineRender(this.position.plus(this.dimensions), this.position.plus(new point_8.Point(0, this.dimensions.y)), color),
                    ];
                };
                BoxCollider.prototype.updateColliding = function (other, isColliding) {
                    if (isColliding && !this.collidingWith.has(other)) {
                        this.onColliderEnterCallback(other);
                        this.collidingWith.add(other);
                    }
                    else if (!isColliding && this.collidingWith.has(other)) {
                        // TODO call onExit
                        this.collidingWith.delete(other);
                    }
                };
                BoxCollider.prototype.onColliderEnter = function (callback) {
                    this.onColliderEnterCallback = callback;
                };
                return BoxCollider;
            }(component_3.Component));
            exports_18("BoxCollider", BoxCollider);
        }
    };
});
System.register("game/player", ["engine/tileset", "engine/point", "game/tiles", "engine/entity", "engine/component", "engine/collision"], function (exports_19, context_19) {
    "use strict";
    var tileset_2, point_9, tiles_1, entity_2, component_4, collision_1, instantiatePlayer, Player;
    var __moduleName = context_19 && context_19.id;
    return {
        setters: [
            function (tileset_2_1) {
                tileset_2 = tileset_2_1;
            },
            function (point_9_1) {
                point_9 = point_9_1;
            },
            function (tiles_1_1) {
                tiles_1 = tiles_1_1;
            },
            function (entity_2_1) {
                entity_2 = entity_2_1;
            },
            function (component_4_1) {
                component_4 = component_4_1;
            },
            function (collision_1_1) {
                collision_1 = collision_1_1;
            }
        ],
        execute: function () {
            instantiatePlayer = function () {
                return new entity_2.Entity([
                    new Player(new point_9.Point(0, 0))
                ]);
            };
            Player = /** @class */ (function (_super) {
                __extends(Player, _super);
                function Player(position) {
                    var _this = _super.call(this) || this;
                    _this.speed = 0.07;
                    _this._position = position;
                    return _this;
                }
                Object.defineProperty(Player.prototype, "position", {
                    get: function () {
                        return this._position;
                    },
                    enumerable: true,
                    configurable: true
                });
                Player.prototype.start = function (startData) {
                    this.characterAnim = this.entity.addComponent(new tileset_2.TileComponent(tiles_1.Tile.GUY_1));
                    this.swordAnim = this.entity.addComponent(new tileset_2.AnimatedTileComponent(new tileset_2.TileSetAnimation([
                        [tiles_1.Tile.SWORD_1, 500],
                    ])));
                    this.collider = this.entity.addComponent(new collision_1.BoxCollider(this.position, new point_9.Point(tiles_1.TILE_SIZE, tiles_1.TILE_SIZE)));
                };
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
                        this.characterAnim.transform.mirrorX = true;
                    }
                    else if (dx > 0) {
                        this.characterAnim.transform.mirrorX = false;
                    }
                    if (dx != 0 || dy != 0) {
                        var newPos = new point_9.Point(this._position.x + dx * updateData.elapsedTimeMillis * this.speed, this._position.y + dy * updateData.elapsedTimeMillis * this.speed);
                        this._position = this.collider.moveTo(newPos);
                    }
                    this.characterAnim.transform.position = this._position;
                    this.swordAnim.transform.position = this._position;
                };
                return Player;
            }(component_4.Component));
            exports_19("Player", Player);
        }
    };
});
System.register("game/quest_game", ["engine/entity", "engine/point", "engine/game", "engine/view", "game/tiles", "engine/tileset", "game/player", "engine/collision"], function (exports_20, context_20) {
    "use strict";
    var entity_3, point_10, game_1, view_2, tiles_2, tileset_3, player_1, collision_2, ZOOM, QuestGame;
    var __moduleName = context_20 && context_20.id;
    return {
        setters: [
            function (entity_3_1) {
                entity_3 = entity_3_1;
            },
            function (point_10_1) {
                point_10 = point_10_1;
            },
            function (game_1_1) {
                game_1 = game_1_1;
            },
            function (view_2_1) {
                view_2 = view_2_1;
            },
            function (tiles_2_1) {
                tiles_2 = tiles_2_1;
            },
            function (tileset_3_1) {
                tileset_3 = tileset_3_1;
            },
            function (player_1_1) {
                player_1 = player_1_1;
            },
            function (collision_2_1) {
                collision_2 = collision_2_1;
            }
        ],
        execute: function () {
            ZOOM = 2.5;
            QuestGame = /** @class */ (function (_super) {
                __extends(QuestGame, _super);
                function QuestGame() {
                    var _this = _super.call(this) || this;
                    _this.entities = [];
                    _this.player = new entity_3.Entity([new player_1.Player(new point_10.Point(-2, 2).times(tiles_2.TILE_SIZE))]).getComponent(player_1.Player);
                    _this.gameEntityView = new view_2.View();
                    _this.uiView = {
                        zoom: ZOOM,
                        offset: new point_10.Point(0, 0),
                        entities: _this.getUIEntities()
                    };
                    _this.addTileEntity(1, 1, tiles_2.Tile.GRASS_1);
                    _this.addTileEntity(2, 1, tiles_2.Tile.GRASS_3);
                    _this.addTileEntity(1, 2, tiles_2.Tile.GRASS_1);
                    _this.addTileEntity(1, 4, tiles_2.Tile.GRASS_1);
                    _this.addTileEntity(4, 4, tiles_2.Tile.SWORD);
                    for (var i = 0; i < 25; i++) {
                        for (var j = 0; j < 25; j++) {
                            _this.addTileEntity(i, j, tiles_2.Tile.ROCKS).addComponent(new collision_2.BoxCollider(new point_10.Point(i * tiles_2.TILE_SIZE, j * tiles_2.TILE_SIZE), new point_10.Point(tiles_2.TILE_SIZE, tiles_2.TILE_SIZE).times(0.9)));
                        }
                    }
                    var flutteringGrass = new tileset_3.AnimatedTileComponent(new tileset_3.TileSetAnimation([
                        [tiles_2.Tile.GRASS_1, 900],
                        [tiles_2.Tile.GRASS_3, 750]
                    ]), new point_10.Point(10, 10).times(tiles_2.TILE_SIZE));
                    _this.entities.push(new entity_3.Entity([flutteringGrass]));
                    var tickerComponent = new tileset_3.AnimatedTileComponent(new tileset_3.TileSetAnimation(tiles_2.Tile.string('wowie!').map(function (tile) { return [tile, 300]; })));
                    _this.entities.push(new entity_3.Entity([tickerComponent]));
                    return _this;
                }
                QuestGame.prototype.addTileEntity = function (x, y, source) {
                    var entity = new entity_3.Entity([new tileset_3.TileComponent(source, new point_10.Point(x, y).times(tiles_2.TILE_SIZE))]);
                    this.entities.push(entity);
                    return entity;
                };
                // entities in the world space
                QuestGame.prototype.getViews = function (updateViewsContext) {
                    this.updateViews(updateViewsContext);
                    return [
                        this.gameEntityView,
                        this.uiView
                    ];
                };
                QuestGame.prototype.updateViews = function (updateViewsContext) {
                    // TODO: figure out how to abstract zoom from entities
                    var cameraGoal = updateViewsContext.dimensions.div(ZOOM).div(2).minus(this.player.position);
                    this.gameEntityView = {
                        zoom: ZOOM,
                        offset: this.gameEntityView.offset.lerp(.0018 * updateViewsContext.elapsedTimeMillis, cameraGoal),
                        entities: this.entities.concat([this.player.entity])
                    };
                };
                // entities whose position is fixed on the camera
                QuestGame.prototype.getUIEntities = function () {
                    var dimensions = new point_10.Point(25, 20); // tile dimensions
                    var result = [];
                    result.push(new tileset_3.TileComponent(tiles_2.Tile.BORDER_1, new point_10.Point(0, 0)));
                    result.push(new tileset_3.TileComponent(tiles_2.Tile.BORDER_3, new point_10.Point(dimensions.x - 1, 0).times(tiles_2.TILE_SIZE)));
                    result.push(new tileset_3.TileComponent(tiles_2.Tile.BORDER_5, new point_10.Point(dimensions.x - 1, dimensions.y - 1).times(tiles_2.TILE_SIZE)));
                    result.push(new tileset_3.TileComponent(tiles_2.Tile.BORDER_7, new point_10.Point(0, dimensions.y - 1).times(tiles_2.TILE_SIZE)));
                    // horizontal lines
                    for (var i = 1; i < dimensions.x - 1; i++) {
                        result.push(new tileset_3.TileComponent(tiles_2.Tile.BORDER_2, new point_10.Point(i, 0).times(tiles_2.TILE_SIZE)));
                        result.push(new tileset_3.TileComponent(tiles_2.Tile.BORDER_6, new point_10.Point(i, dimensions.y - 1).times(tiles_2.TILE_SIZE)));
                    }
                    // vertical lines
                    for (var j = 1; j < dimensions.y - 1; j++) {
                        result.push(new tileset_3.TileComponent(tiles_2.Tile.BORDER_4, new point_10.Point(dimensions.x - 1, j).times(tiles_2.TILE_SIZE)));
                        result.push(new tileset_3.TileComponent(tiles_2.Tile.BORDER_8, new point_10.Point(0, j).times(tiles_2.TILE_SIZE)));
                    }
                    return [new entity_3.Entity(result)];
                };
                return QuestGame;
            }(game_1.Game));
            exports_20("QuestGame", QuestGame);
        }
    };
});
System.register("app", ["game/quest_game", "engine/engine"], function (exports_21, context_21) {
    "use strict";
    var quest_game_1, engine_1;
    var __moduleName = context_21 && context_21.id;
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
