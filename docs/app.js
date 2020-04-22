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
                Point.prototype.floorDiv = function (denominator) {
                    return new Point(Math.floor(this.x / denominator), Math.floor(this.y / denominator));
                };
                Point.prototype.plus = function (other) {
                    return new Point(this.x + other.x, this.y + other.y);
                };
                Point.prototype.minus = function (other) {
                    return new Point(this.x - other.x, this.y - other.y);
                };
                Point.prototype.lerp = function (multiplier, goal) {
                    return this.plus(goal.minus(this).times(multiplier));
                };
                Point.prototype.distanceTo = function (pt) {
                    var dx = pt.x - this.x;
                    var dy = pt.y - this.y;
                    return Math.sqrt(dx * dx + dy * dy);
                };
                Point.prototype.magnitude = function () {
                    return this.distanceTo(new Point(0, 0));
                };
                Point.prototype.normalized = function () {
                    return this.div(this.magnitude());
                };
                Point.prototype.toString = function () {
                    return "(" + this.x + "," + this.y + ")";
                };
                Point.prototype.equals = function (pt) {
                    return pt.x == this.x && pt.y == this.y;
                };
                return Point;
            }());
            exports_1("Point", Point);
        }
    };
});
System.register("engine/View", ["engine/point"], function (exports_2, context_2) {
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
                function RenderContext(canvas, context, view) {
                    this.canvas = canvas;
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
                /**
                 * @param source
                 * @param sourcePosition
                 * @param sourceDimensions
                 * @param destPosition the top left corner where the image will be drawn
                 * @param destDimensions
                 * @param rotation (will be mirrored by mirrorX or mirrorY)
                 * @param pixelPerfect
                 * @param mirrorX
                 * @param mirrorY
                 */
                RenderContext.prototype.drawImage = function (source, sourcePosition, sourceDimensions, destPosition, destDimensions, rotation, pixelPerfect, mirrorX, mirrorY) {
                    var mirroredOffset = new point_2.Point(mirrorX ? destDimensions.x : 0, mirrorY ? destDimensions.y : 0);
                    var scaledDestPosition = destPosition.plus(this.view.offset).plus(mirroredOffset).times(this.view.zoom);
                    if (pixelPerfect) {
                        scaledDestPosition = this.pixelize(scaledDestPosition);
                    }
                    var scaledDestDimensions = destDimensions.times(this.view.zoom);
                    if (scaledDestPosition.x > this.canvas.width
                        || scaledDestPosition.x + scaledDestDimensions.x < 0
                        || scaledDestPosition.y > this.canvas.height
                        || scaledDestPosition.y + scaledDestDimensions.y < 0) {
                        return;
                    }
                    this.context.save();
                    this.context.translate(scaledDestPosition.x, scaledDestPosition.y);
                    this.context.scale(mirrorX ? -1 : 1, mirrorY ? -1 : 1);
                    var rotationTranslate = destDimensions.div(2).times(this.view.zoom);
                    this.context.translate(rotationTranslate.x, rotationTranslate.y);
                    this.context.rotate(rotation * Math.PI / 180);
                    this.context.translate(-rotationTranslate.x, -rotationTranslate.y);
                    this.context.drawImage(source, sourcePosition.x, sourcePosition.y, sourceDimensions.x, sourceDimensions.y, 0, 0, scaledDestDimensions.x, scaledDestDimensions.y);
                    this.context.restore();
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
System.register("engine/renderer/Renderer", ["engine/point", "engine/renderer/RenderContext"], function (exports_4, context_4) {
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
                    var viewRenderContext = new RenderContext_1.RenderContext(this.canvas, this.context, view);
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
                CapturedInput.prototype.scaledForView = function (view) {
                    return new CapturedInput(this.keysDown, this.keysHeld, this.keysUp, this.mousePos.div(view.zoom).minus(view.offset), this.isMouseDown, this.isMouseHeld, this.isMouseUp);
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
System.register("engine/renderer/RenderMethod", [], function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("engine/renderer/TextRender", ["engine/component"], function (exports_8, context_8) {
    "use strict";
    var component_1, TextRenderComponent;
    var __moduleName = context_8 && context_8.id;
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
            exports_8("TextRenderComponent", TextRenderComponent);
        }
    };
});
System.register("engine/profiler", ["engine/View", "engine/Entity", "engine/renderer/TextRender", "engine/point"], function (exports_9, context_9) {
    "use strict";
    var View_1, Entity_1, TextRender_1, point_5, Profiler, round, MovingAverage, profiler;
    var __moduleName = context_9 && context_9.id;
    /**
     * Executes the given function and returns the duration it took to execute as well as the result
     */
    function measure(fn) {
        var start = new Date().getTime();
        var result = fn();
        return [new Date().getTime() - start, result];
    }
    exports_9("measure", measure);
    return {
        setters: [
            function (View_1_1) {
                View_1 = View_1_1;
            },
            function (Entity_1_1) {
                Entity_1 = Entity_1_1;
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
                    this.fpsTracker = new MovingAverage();
                    this.updateTracker = new MovingAverage();
                    this.renderTracker = new MovingAverage();
                }
                Profiler.prototype.update = function (msSinceLastUpdate, msForUpdate, msForRender) {
                    this.fpsTracker.record(msSinceLastUpdate);
                    this.updateTracker.record(msForUpdate);
                    this.renderTracker.record(msForRender);
                };
                Profiler.prototype.getView = function () {
                    var s = [
                        "FPS: " + round(1000 / this.fpsTracker.get()) + " (" + round(this.fpsTracker.get()) + " ms per frame)",
                        "update() duration ms: " + round(this.updateTracker.get(), 2),
                        "render() duration ms: " + round(this.renderTracker.get(), 2)
                    ];
                    return new View_1.View([
                        new Entity_1.Entity(s.map(function (str, i) { return new TextRender_1.TextRenderComponent(str, new point_5.Point(60, 70 + 25 * i)); }))
                    ]);
                };
                return Profiler;
            }());
            round = function (val, pow) {
                if (pow === void 0) { pow = 0; }
                var decimals = Math.pow(10, pow);
                return Math.round(val * decimals) / decimals;
            };
            MovingAverage = /** @class */ (function () {
                function MovingAverage() {
                    this.pts = [];
                    this.sum = 0;
                    this.lifetime = 1; // in seconds
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
            exports_9("profiler", profiler = new Profiler());
        }
    };
});
System.register("engine/debug", [], function (exports_10, context_10) {
    "use strict";
    var debug;
    var __moduleName = context_10 && context_10.id;
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
            exports_10("debug", debug = Object.assign({}, {
                showColliders: false,
                showProfiler: false
            }, loadDebug()));
            window['debug'] = observe(debug);
        }
    };
});
System.register("engine/engine", ["engine/renderer/Renderer", "engine/input", "engine/profiler", "engine/debug"], function (exports_11, context_11) {
    "use strict";
    var Renderer_1, input_1, profiler_1, debug_1, UpdateViewsContext, StartData, UpdateData, Engine, ALREADY_STARTED_COMPONENT;
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [
            function (Renderer_1_1) {
                Renderer_1 = Renderer_1_1;
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
            UpdateViewsContext = /** @class */ (function () {
                function UpdateViewsContext() {
                }
                return UpdateViewsContext;
            }());
            exports_11("UpdateViewsContext", UpdateViewsContext);
            StartData = /** @class */ (function () {
                function StartData() {
                }
                return StartData;
            }());
            exports_11("StartData", StartData);
            UpdateData = /** @class */ (function () {
                function UpdateData() {
                }
                return UpdateData;
            }());
            exports_11("UpdateData", UpdateData);
            Engine = /** @class */ (function () {
                function Engine(game, canvas) {
                    var _this = this;
                    this.lastUpdateMillis = new Date().getTime();
                    this.game = game;
                    this.renderer = new Renderer_1.Renderer(canvas);
                    this.input = new input_1.Input(canvas);
                    requestAnimationFrame(function () { return _this.tick(); });
                }
                Engine.prototype.tick = function () {
                    var _this = this;
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
                    var views = this.getViews(updateViewsContext);
                    var updateDuration = profiler_1.measure(function () {
                        views.forEach(function (v) {
                            var startData = {};
                            var updateData = {
                                view: v,
                                elapsedTimeMillis: updateViewsContext.elapsedTimeMillis,
                                input: updateViewsContext.input.scaledForView(v),
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
                    })[0];
                    var renderDuration = profiler_1.measure(function () {
                        _this.renderer.render(views);
                    })[0];
                    if (debug_1.debug.showProfiler) {
                        profiler_1.profiler.update(elapsed, updateDuration, renderDuration);
                    }
                    this.lastUpdateMillis = time;
                    requestAnimationFrame(function () { return _this.tick(); });
                };
                Engine.prototype.getViews = function (context) {
                    // TODO editor
                    return this.game.getViews(context).concat(debug_1.debug.showProfiler ? [profiler_1.profiler.getView()] : []);
                };
                return Engine;
            }());
            exports_11("Engine", Engine);
            ALREADY_STARTED_COMPONENT = function (startData) {
                throw new Error("start() has already been called on this component");
            };
        }
    };
});
System.register("engine/component", [], function (exports_12, context_12) {
    "use strict";
    var Component;
    var __moduleName = context_12 && context_12.id;
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
            exports_12("Component", Component);
        }
    };
});
System.register("engine/Entity", [], function (exports_13, context_13) {
    "use strict";
    var Entity;
    var __moduleName = context_13 && context_13.id;
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
            exports_13("Entity", Entity);
        }
    };
});
System.register("engine/tiles/TileEditor", [], function (exports_14, context_14) {
    "use strict";
    var TileEditor, tileEditor;
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [],
        execute: function () {
            // TODO: Flesh out the tile editor
            TileEditor = /** @class */ (function () {
                function TileEditor() {
                    this.sets = new Map();
                }
                TileEditor.prototype.register = function (id, tileSet) {
                    this.sets.set(id, tileSet);
                };
                TileEditor.prototype.getView = function () {
                    return null;
                };
                return TileEditor;
            }());
            exports_14("tileEditor", tileEditor = new TileEditor());
        }
    };
});
System.register("engine/tiles/TileSet", ["engine/tiles/TileEditor"], function (exports_15, context_15) {
    "use strict";
    var TileEditor_1, TileSet;
    var __moduleName = context_15 && context_15.id;
    return {
        setters: [
            function (TileEditor_1_1) {
                TileEditor_1 = TileEditor_1_1;
            }
        ],
        execute: function () {
            TileSet = /** @class */ (function () {
                function TileSet(id, tileSize, padding) {
                    if (padding === void 0) { padding = 0; }
                    this.image = document.getElementById(id);
                    this.tileSize = tileSize;
                    this.padding = padding;
                    TileEditor_1.tileEditor.register(id, this);
                }
                return TileSet;
            }());
            exports_15("TileSet", TileSet);
        }
    };
});
System.register("engine/renderer/ImageRender", [], function (exports_16, context_16) {
    "use strict";
    var ImageRender;
    var __moduleName = context_16 && context_16.id;
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
                    var pixelPerfect = false; // this can cause flickering between adjacent tiles, TODO make configurable
                    context.drawImage(this.source, this.sourcePosition, this.dimensions, this.position, this.dimensions.times(this.scale), this.rotation, pixelPerfect, this.mirrorX, this.mirrorY);
                };
                return ImageRender;
            }());
            exports_16("ImageRender", ImageRender);
        }
    };
});
System.register("engine/tiles/TileTransform", ["engine/point"], function (exports_17, context_17) {
    "use strict";
    var point_6, TileTransform;
    var __moduleName = context_17 && context_17.id;
    return {
        setters: [
            function (point_6_1) {
                point_6 = point_6_1;
            }
        ],
        execute: function () {
            TileTransform = /** @class */ (function () {
                function TileTransform(position, rotation, scale, mirrorX, mirrorY) {
                    if (position === void 0) { position = new point_6.Point(0, 0); }
                    if (rotation === void 0) { rotation = 0; }
                    if (scale === void 0) { scale = 1; }
                    if (mirrorX === void 0) { mirrorX = false; }
                    if (mirrorY === void 0) { mirrorY = false; }
                    this.position = position;
                    this.rotation = rotation;
                    this.scale = scale;
                    this.mirrorX = mirrorX;
                    this.mirrorY = mirrorY;
                }
                return TileTransform;
            }());
            exports_17("TileTransform", TileTransform);
        }
    };
});
System.register("engine/tiles/TileSource", ["engine/point", "engine/renderer/ImageRender"], function (exports_18, context_18) {
    "use strict";
    var point_7, ImageRender_1, TileSource;
    var __moduleName = context_18 && context_18.id;
    return {
        setters: [
            function (point_7_1) {
                point_7 = point_7_1;
            },
            function (ImageRender_1_1) {
                ImageRender_1 = ImageRender_1_1;
            }
        ],
        execute: function () {
            TileSource = /** @class */ (function () {
                /**
                 * Constructs a static (non-animated) tile source
                 */
                function TileSource(tileSet, tileSetIndex) {
                    this.tileSet = tileSet;
                    this.tileSetIndex = tileSetIndex;
                }
                TileSource.prototype.toImageRender = function (transform) {
                    return new ImageRender_1.ImageRender(this.tileSet.image, new point_7.Point(this.tileSetIndex.x, this.tileSetIndex.y).times(this.tileSet.tileSize + this.tileSet.padding), new point_7.Point(this.tileSet.tileSize, this.tileSet.tileSize), transform.position, transform.rotation, transform.scale, transform.mirrorX, transform.mirrorY);
                };
                return TileSource;
            }());
            exports_18("TileSource", TileSource);
        }
    };
});
// Original JavaScript Code from  Marijn Haverbeke (http://eloquentjavascript.net/1st_edition/appendix2.html)
System.register("engine/util/BinaryHeap", [], function (exports_19, context_19) {
    "use strict";
    var BinaryHeap;
    var __moduleName = context_19 && context_19.id;
    return {
        setters: [],
        execute: function () {// Original JavaScript Code from  Marijn Haverbeke (http://eloquentjavascript.net/1st_edition/appendix2.html)
            BinaryHeap = /** @class */ (function () {
                function BinaryHeap(scoreFunction) {
                    this.content = [];
                    this.scoreFunction = scoreFunction;
                }
                BinaryHeap.prototype.push = function (element) {
                    this.content.push(element);
                    this.bubbleUp(this.content.length - 1);
                };
                BinaryHeap.prototype.pop = function () {
                    var result = this.content[0];
                    var end = this.content.pop();
                    if (this.content.length > 0) {
                        this.content[0] = end;
                        this.sinkDown(0);
                    }
                    return result;
                };
                BinaryHeap.prototype.remove = function (node) {
                    var length = this.content.length;
                    // To remove a value, we must search through the array to find
                    // it.
                    for (var i = 0; i < length; i++) {
                        if (this.content[i] != node)
                            continue;
                        // When it is found, the process seen in 'pop' is repeated
                        // to fill up the hole.
                        var end = this.content.pop();
                        // If the element we popped was the one we needed to remove,
                        // we're done.
                        if (i == length - 1)
                            break;
                        // Otherwise, we replace the removed element with the popped
                        // one, and allow it to float up or sink down as appropriate.
                        this.content[i] = end;
                        this.bubbleUp(i);
                        this.sinkDown(i);
                        break;
                    }
                };
                BinaryHeap.prototype.size = function () {
                    return this.content.length;
                };
                BinaryHeap.prototype.bubbleUp = function (n) {
                    // Fetch the element that has to be moved.
                    var element = this.content[n], score = this.scoreFunction(element);
                    // When at 0, an element can not go up any further.
                    while (n > 0) {
                        // Compute the parent element's index, and fetch it.
                        var parentN = Math.floor((n + 1) / 2) - 1, parent_1 = this.content[parentN];
                        // If the parent has a lesser score, things are in order and we
                        // are done.
                        if (score >= this.scoreFunction(parent_1))
                            break;
                        // Otherwise, swap the parent with the current element and
                        // continue.
                        this.content[parentN] = element;
                        this.content[n] = parent_1;
                        n = parentN;
                    }
                };
                BinaryHeap.prototype.sinkDown = function (n) {
                    // Look up the target element and its score.
                    var length = this.content.length, element = this.content[n], elemScore = this.scoreFunction(element);
                    while (true) {
                        // Compute the indices of the child elements.
                        var child2N = (n + 1) * 2, child1N = child2N - 1;
                        // This is used to store the new position of the element,
                        // if any.
                        var swap = null;
                        // If the first child exists (is inside the array)...
                        if (child1N < length) {
                            // Look it up and compute its score.
                            var child1 = this.content[child1N], child1Score = this.scoreFunction(child1);
                            // If the score is less than our element's, we need to swap.
                            if (child1Score < elemScore)
                                swap = child1N;
                        }
                        // Do the same checks for the other child.
                        if (child2N < length) {
                            var child2 = this.content[child2N], child2Score = this.scoreFunction(child2);
                            if (child2Score < (swap == null ? elemScore : child1Score))
                                swap = child2N;
                        }
                        // No need to swap further, we are done.
                        if (swap == null)
                            break;
                        // Otherwise, swap and continue.
                        this.content[n] = this.content[swap];
                        this.content[swap] = element;
                        n = swap;
                    }
                };
                return BinaryHeap;
            }());
            exports_19("BinaryHeap", BinaryHeap);
        }
    };
});
System.register("engine/util/Grid", ["engine/point", "engine/util/BinaryHeap"], function (exports_20, context_20) {
    "use strict";
    var point_8, BinaryHeap_1, Grid;
    var __moduleName = context_20 && context_20.id;
    return {
        setters: [
            function (point_8_1) {
                point_8 = point_8_1;
            },
            function (BinaryHeap_1_1) {
                BinaryHeap_1 = BinaryHeap_1_1;
            }
        ],
        execute: function () {
            // an infinite grid using x/y coordinates (x increases to the right, y increases down)
            Grid = /** @class */ (function () {
                function Grid() {
                    this.map = new Map();
                }
                Grid.prototype.set = function (pt, entry) {
                    this.map.set(pt.toString(), entry);
                };
                // returns null if not present in the grid
                Grid.prototype.get = function (pt) {
                    return this.map.get(pt.toString());
                };
                Grid.prototype.remove = function (pt) {
                    this.map.delete(pt.toString());
                };
                Grid.prototype.entries = function () {
                    return Array.from(this.map.values());
                };
                Grid.prototype.findPath = function (start, end, heuristic, isOccupied, getNeighbors) {
                    var _this = this;
                    if (heuristic === void 0) { heuristic = function (pt) { return pt.distanceTo(end); }; }
                    if (isOccupied === void 0) { isOccupied = function (pt) { return !!_this.get(pt); }; }
                    if (getNeighbors === void 0) { getNeighbors = function (pt) { return [new point_8.Point(pt.x, pt.y - 1), new point_8.Point(pt.x - 1, pt.y), new point_8.Point(pt.x + 1, pt.y), new point_8.Point(pt.x, pt.y + 1)]; }; }
                    if (isOccupied(start) || isOccupied(end)) {
                        return null;
                    }
                    var gScore = new Map();
                    gScore.set(start.toString(), 0);
                    var fScore = new Map();
                    fScore.set(start.toString(), 0);
                    var cameFrom = new Map();
                    var openSetUnique = new Set();
                    var openSet = new BinaryHeap_1.BinaryHeap(function (p) { return fScore.get(p.toString()); });
                    openSet.push(start);
                    while (openSet.size() > 0) {
                        var current = openSet.pop();
                        openSetUnique.delete(current.toString());
                        if (current.equals(end)) {
                            var path = [];
                            var next = current;
                            while (next) {
                                path.push(next);
                                next = cameFrom.get(next.toString());
                            }
                            return path.reverse();
                        }
                        var currentGScore = gScore.get(current.toString());
                        var neighbors = getNeighbors(current).filter(function (pt) { return !isOccupied(pt) && !pt.equals(start); });
                        for (var _i = 0, neighbors_1 = neighbors; _i < neighbors_1.length; _i++) {
                            var neighbor = neighbors_1[_i];
                            var n = neighbor.toString();
                            var tentativeGScore = currentGScore + current.distanceTo(neighbor);
                            var currentNeighborGScore = gScore.get(n);
                            if (!currentNeighborGScore || tentativeGScore < currentNeighborGScore) {
                                cameFrom.set(n, current);
                                gScore.set(n, tentativeGScore);
                                fScore.set(n, tentativeGScore + heuristic(neighbor));
                                if (!openSetUnique.has(n)) {
                                    openSet.push(neighbor);
                                    openSetUnique.add(n);
                                }
                            }
                        }
                    }
                    return null;
                };
                return Grid;
            }());
            exports_20("Grid", Grid);
        }
    };
});
System.register("engine/tiles/TileComponent", ["engine/point", "engine/component", "engine/tiles/TileTransform"], function (exports_21, context_21) {
    "use strict";
    var point_9, component_2, TileTransform_1, TileComponent;
    var __moduleName = context_21 && context_21.id;
    return {
        setters: [
            function (point_9_1) {
                point_9 = point_9_1;
            },
            function (component_2_1) {
                component_2 = component_2_1;
            },
            function (TileTransform_1_1) {
                TileTransform_1 = TileTransform_1_1;
            }
        ],
        execute: function () {
            /**
             * Represents a static (non-animated) tile entity
             */
            TileComponent = /** @class */ (function (_super) {
                __extends(TileComponent, _super);
                function TileComponent(tileSource, position) {
                    if (position === void 0) { position = new point_9.Point(0, 0); }
                    var _this = _super.call(this) || this;
                    _this.tileSource = tileSource;
                    _this.transform = new TileTransform_1.TileTransform(position);
                    return _this;
                }
                TileComponent.prototype.getRenderMethods = function () {
                    return [this.tileSource.toImageRender(this.transform)];
                };
                return TileComponent;
            }(component_2.Component));
            exports_21("TileComponent", TileComponent);
        }
    };
});
System.register("engine/tiles/ConnectingTile", ["engine/point", "engine/component"], function (exports_22, context_22) {
    "use strict";
    var point_10, component_3, ConnectingTile;
    var __moduleName = context_22 && context_22.id;
    return {
        setters: [
            function (point_10_1) {
                point_10 = point_10_1;
            },
            function (component_3_1) {
                component_3 = component_3_1;
            }
        ],
        execute: function () {
            // TODO unify tile components with a single base class?
            ConnectingTile = /** @class */ (function (_super) {
                __extends(ConnectingTile, _super);
                /**
                 * Connecting tiles require a tile grid. The position parameter should be tile-scale, not pixel-scale.
                 */
                function ConnectingTile(schema, grid, position) {
                    if (position === void 0) { position = new point_10.Point(0, 0); }
                    var _this = _super.call(this) || this;
                    _this.schema = schema;
                    _this.grid = grid;
                    _this.position = position;
                    return _this;
                }
                ConnectingTile.prototype.getRenderMethods = function () {
                    return [this.schema.render(this.grid, this.position)];
                };
                return ConnectingTile;
            }(component_3.Component));
            exports_22("ConnectingTile", ConnectingTile);
        }
    };
});
System.register("engine/tiles/TileGrid", ["engine/util/Grid", "engine/Entity", "engine/tiles/TileComponent"], function (exports_23, context_23) {
    "use strict";
    var Grid_1, Entity_2, TileComponent_1, TileGrid;
    var __moduleName = context_23 && context_23.id;
    return {
        setters: [
            function (Grid_1_1) {
                Grid_1 = Grid_1_1;
            },
            function (Entity_2_1) {
                Entity_2 = Entity_2_1;
            },
            function (TileComponent_1_1) {
                TileComponent_1 = TileComponent_1_1;
            }
        ],
        execute: function () {
            /**
             * A tile grid that uses tile dimensions instead of pixel dimensions
             * (A tile is 1x1 instead of TILE_SIZExTILE_SIZE, then scaled to render)
             *
             * TODO is this class serving a purpose?
             */
            TileGrid = /** @class */ (function (_super) {
                __extends(TileGrid, _super);
                function TileGrid(tileSize) {
                    var _this = _super.call(this) || this;
                    _this.tileSize = tileSize;
                    return _this;
                }
                TileGrid.prototype.createTileEntity = function (source, pos) {
                    var entity = new Entity_2.Entity([new TileComponent_1.TileComponent(source, pos.times(this.tileSize))]);
                    this.set(pos, entity);
                    return entity;
                };
                return TileGrid;
            }(Grid_1.Grid));
            exports_23("TileGrid", TileGrid);
        }
    };
});
System.register("engine/tiles/ConnectingTileSchema", ["engine/point", "engine/tiles/TileTransform", "engine/tiles/ConnectingTile"], function (exports_24, context_24) {
    "use strict";
    var point_11, TileTransform_2, ConnectingTile_1, ConnectingTileSchema;
    var __moduleName = context_24 && context_24.id;
    return {
        setters: [
            function (point_11_1) {
                point_11 = point_11_1;
            },
            function (TileTransform_2_1) {
                TileTransform_2 = TileTransform_2_1;
            },
            function (ConnectingTile_1_1) {
                ConnectingTile_1 = ConnectingTile_1_1;
            }
        ],
        execute: function () {
            /**
             * Defines how a type of connecting tiles interacts with other types of connecting tiles.
             */
            ConnectingTileSchema = /** @class */ (function () {
                function ConnectingTileSchema() {
                }
                // a vertical line
                ConnectingTileSchema.prototype.vertical = function (source) {
                    this._vertical = source;
                    return this;
                };
                // a 90 degree angle, connecting to bottom and right by default
                ConnectingTileSchema.prototype.angle = function (source) {
                    this._angle = source;
                    return this;
                };
                // a T-shaped tile (with the bottom part pointing right)
                ConnectingTileSchema.prototype.tShape = function (source) {
                    this._tShape = source;
                    return this;
                };
                // a plus-shaped tile
                ConnectingTileSchema.prototype.plusShape = function (source) {
                    this._plusShape = source;
                    return this;
                };
                // a tile with one connection (on the bottom)
                ConnectingTileSchema.prototype.cap = function (source) {
                    this._cap = source;
                    return this;
                };
                // a tile with no connections
                ConnectingTileSchema.prototype.single = function (source) {
                    this._single = source;
                    return this;
                };
                // used if we can't figure
                ConnectingTileSchema.prototype.fallback = function (source) {
                    this._fallback = source;
                    return this;
                };
                ConnectingTileSchema.prototype.setCanConnectFunction = function (fn) {
                    this.canConnect = fn;
                    return this;
                };
                ConnectingTileSchema.prototype.canConnect = function (schema) {
                    return schema === this;
                };
                /**
                 * Renders the tile source based on the given grid and position
                 */
                ConnectingTileSchema.prototype.render = function (grid, position) {
                    var x = position.x;
                    var y = position.y;
                    // TODO: add diagonals?
                    var n = this.get(grid, new point_11.Point(x, y - 1));
                    var s = this.get(grid, new point_11.Point(x, y + 1));
                    var e = this.get(grid, new point_11.Point(x + 1, y));
                    var w = this.get(grid, new point_11.Point(x - 1, y));
                    var count = [n, s, e, w].filter(function (dir) { return !!dir; }).length;
                    var result;
                    var rotation = 0;
                    if (count == 4) {
                        result = this._plusShape;
                    }
                    else if (count == 3) {
                        result = this._tShape;
                        if (!n) {
                            rotation = 90;
                        }
                        else if (!e) {
                            rotation = 180;
                        }
                        else if (!s) {
                            rotation = 270;
                        }
                    }
                    else if ((n && s) || (e && w)) {
                        result = this._vertical;
                        if (!n) {
                            rotation = 90;
                        }
                    }
                    else if (count == 2) {
                        result = this._angle;
                        if (n && e) {
                            rotation = 270;
                        }
                        else if (s && w) {
                            rotation = 90;
                        }
                        else if (w && n) {
                            rotation = 180;
                        }
                    }
                    else if (count == 1) {
                        result = this._cap;
                        if (n) {
                            rotation = 180;
                        }
                        else if (e) {
                            rotation = 270;
                        }
                        else if (w) {
                            rotation = 90;
                        }
                    }
                    else {
                        result = this._single;
                    }
                    if (!result) {
                        result = this._fallback;
                        rotation = 0;
                    }
                    // TODO trigger adjacent to update?
                    return result.toImageRender(new TileTransform_2.TileTransform(position.times(grid.tileSize), rotation));
                };
                ConnectingTileSchema.prototype.get = function (grid, pt) {
                    var el = grid.get(pt);
                    if (el) {
                        var ct = el.getComponent(ConnectingTile_1.ConnectingTile);
                        if (ct && ct.schema.canConnect(this)) {
                            return ct;
                        }
                    }
                };
                return ConnectingTileSchema;
            }());
            exports_24("ConnectingTileSchema", ConnectingTileSchema);
        }
    };
});
System.register("game/tiles", ["engine/point", "engine/tiles/TileSet", "engine/tiles/TileSource", "engine/tiles/ConnectingTileSchema"], function (exports_25, context_25) {
    "use strict";
    var point_12, TileSet_1, TileSource_1, ConnectingTileSchema_1, TILE_SIZE, TILE_SET, Tile;
    var __moduleName = context_25 && context_25.id;
    return {
        setters: [
            function (point_12_1) {
                point_12 = point_12_1;
            },
            function (TileSet_1_1) {
                TileSet_1 = TileSet_1_1;
            },
            function (TileSource_1_1) {
                TileSource_1 = TileSource_1_1;
            },
            function (ConnectingTileSchema_1_1) {
                ConnectingTileSchema_1 = ConnectingTileSchema_1_1;
            }
        ],
        execute: function () {
            exports_25("TILE_SIZE", TILE_SIZE = 16);
            TILE_SET = new TileSet_1.TileSet("tileset", TILE_SIZE, 1);
            Tile = /** @class */ (function () {
                function Tile() {
                }
                Tile.string = function (s) {
                    return Array.from(s).map(function (c) { return Tile.CHARACTER_MAP[c]; });
                };
                Tile.get = function (x, y) {
                    return new TileSource_1.TileSource(TILE_SET, new point_12.Point(x, y));
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
                Tile.CROSSHAIRS = Tile.get(25, 14);
                Tile.PATH = new ConnectingTileSchema_1.ConnectingTileSchema()
                    .vertical(Tile.get(8, 1))
                    .angle(Tile.get(9, 1))
                    .tShape(Tile.get(10, 1))
                    .plusShape(Tile.get(11, 1))
                    .cap(Tile.get(12, 1))
                    .single(Tile.get(3, 0))
                    .fallback(Tile.get(23, 2));
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
            exports_25("Tile", Tile);
        }
    };
});
System.register("engine/tiles/TileSetAnimation", [], function (exports_26, context_26) {
    "use strict";
    var TileSetAnimation;
    var __moduleName = context_26 && context_26.id;
    return {
        setters: [],
        execute: function () {
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
            exports_26("TileSetAnimation", TileSetAnimation);
        }
    };
});
System.register("engine/tiles/AnimatedTileComponent", ["engine/point", "engine/tiles/TileComponent"], function (exports_27, context_27) {
    "use strict";
    var point_13, TileComponent_2, AnimatedTileComponent, TileSetAnimator;
    var __moduleName = context_27 && context_27.id;
    return {
        setters: [
            function (point_13_1) {
                point_13 = point_13_1;
            },
            function (TileComponent_2_1) {
                TileComponent_2 = TileComponent_2_1;
            }
        ],
        execute: function () {
            AnimatedTileComponent = /** @class */ (function (_super) {
                __extends(AnimatedTileComponent, _super);
                function AnimatedTileComponent(animation, position) {
                    if (position === void 0) { position = new point_13.Point(0, 0); }
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
            }(TileComponent_2.TileComponent));
            exports_27("AnimatedTileComponent", AnimatedTileComponent);
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
        }
    };
});
System.register("engine/renderer/LineRender", [], function (exports_28, context_28) {
    "use strict";
    var LineRender;
    var __moduleName = context_28 && context_28.id;
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
            exports_28("LineRender", LineRender);
        }
    };
});
System.register("engine/util/utils", [], function (exports_29, context_29) {
    "use strict";
    var __moduleName = context_29 && context_29.id;
    function rectContains(rectPosition, rectDimensions, pt) {
        return pt.x >= rectPosition.x && pt.x < rectPosition.x + rectDimensions.x
            && pt.y >= rectPosition.y && pt.y < rectPosition.y + rectDimensions.y;
    }
    exports_29("rectContains", rectContains);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("engine/collision/Collider", ["engine/component", "engine/point", "engine/renderer/LineRender", "engine/debug", "engine/util/utils"], function (exports_30, context_30) {
    "use strict";
    var component_4, point_14, LineRender_1, debug_2, utils_1, CollisionEngine, ENGINE, Collider;
    var __moduleName = context_30 && context_30.id;
    return {
        setters: [
            function (component_4_1) {
                component_4 = component_4_1;
            },
            function (point_14_1) {
                point_14 = point_14_1;
            },
            function (LineRender_1_1) {
                LineRender_1 = LineRender_1_1;
            },
            function (debug_2_1) {
                debug_2 = debug_2_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
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
                // Needs further testing. No active use case right now.
                CollisionEngine.prototype.tryMove = function (collider, to) {
                    var translation = to.minus(collider.position);
                    var pts = collider.getPoints();
                    // find all colliders within a bounding box
                    var xMin = Math.min.apply(Math, pts.map(function (pt) { return pt.x + Math.min(translation.x, 0); }));
                    var xMax = Math.max.apply(Math, pts.map(function (pt) { return pt.x + Math.max(translation.x, 0); }));
                    var yMin = Math.min.apply(Math, pts.map(function (pt) { return pt.y + Math.min(translation.y, 0); }));
                    var yMax = Math.max.apply(Math, pts.map(function (pt) { return pt.y + Math.max(translation.y, 0); }));
                    var potentialCollisions = this.colliders.filter(function (other) { return other !== collider && other.getPoints().some(function (pt) {
                        return utils_1.rectContains(new point_14.Point(xMax, yMin), new point_14.Point(xMax - xMin, yMax - yMin), pt);
                    }); });
                    // for all pts and all those colliders, find the closest intersection
                    var collisions = pts.flatMap(function (pt) { return potentialCollisions
                        .map(function (other) { return other.lineCast(pt, pt.plus(translation)); })
                        .filter(function (intersect) { return !!intersect; })
                        .map(function (intersect) { return intersect.minus(collider.position); }); } // the distance `pt` can move before it collides with `other`
                    );
                    if (collisions.length > 0) {
                        var dist = collisions.reduce(function (l, r) { return l.magnitude() < r.magnitude() ? l : r; });
                        return collider.position.plus(dist);
                    }
                    else {
                        return to;
                    }
                };
                CollisionEngine.prototype.checkCollider = function (collider) {
                    this.colliders.filter(function (other) { return other !== collider && other.entity && other.isTrigger; }).forEach(function (other) {
                        var isColliding = other.getPoints().some(function (pt) { return collider.isWithinBounds(pt); });
                        collider.updateColliding(other, isColliding);
                        other.updateColliding(collider, isColliding);
                    });
                };
                // Returns true if the collider can be translated and will not intersect a non-trigger collider in the new position.
                // This DOES NOT check for any possible colliders in the path of the collision and should only be used for small translations.
                CollisionEngine.prototype.canTranslate = function (collider, translation) {
                    var translatedPoints = collider.getPoints().map(function (pt) { return pt.plus(translation); });
                    return !this.colliders.filter(function (other) { return other !== collider && other.entity && !other.isTrigger; }).some(function (other) {
                        return translatedPoints.some(function (pt) { return other.isWithinBounds(pt); });
                    });
                };
                return CollisionEngine;
            }());
            ENGINE = new CollisionEngine();
            /**
             * A collider detects intersections with other colliders. If isTrigger=true, a collider
             * just calls the callback functions and does not block the other collider. If isTrigger=false,
             * other colliders will not be able to move in to this collider's space, and callbacks won't be triggered.
             */
            Collider = /** @class */ (function (_super) {
                __extends(Collider, _super);
                function Collider(position, isTrigger) {
                    var _this = _super.call(this) || this;
                    _this.collidingWith = new Set();
                    _this.onColliderEnterCallback = function () { };
                    _this._position = position;
                    _this.isTrigger = isTrigger;
                    ENGINE.registerCollider(_this);
                    return _this;
                }
                Object.defineProperty(Collider.prototype, "position", {
                    get: function () { return this._position; },
                    enumerable: true,
                    configurable: true
                });
                Collider.prototype.start = function (startData) {
                    ENGINE.checkCollider(this);
                };
                Collider.prototype.update = function (updateData) { };
                Collider.prototype.moveTo = function (point) {
                    var dx = point.x - this.position.x;
                    var dy = point.y - this.position.y;
                    // TODO: Should these branches be handled by the caller?
                    if (ENGINE.canTranslate(this, new point_14.Point(dx, dy))) {
                        this._position = point;
                        ENGINE.checkCollider(this);
                    }
                    else if (ENGINE.canTranslate(this, new point_14.Point(dx, 0))) {
                        this._position = this._position.plus(new point_14.Point(dx, 0));
                        ENGINE.checkCollider(this);
                    }
                    else if (ENGINE.canTranslate(this, new point_14.Point(0, dy))) {
                        this._position = this._position.plus(new point_14.Point(0, dy));
                        ENGINE.checkCollider(this);
                    }
                    return this.position;
                };
                Collider.prototype.updateColliding = function (other, isColliding) {
                    if (isColliding && !this.collidingWith.has(other)) {
                        this.onColliderEnterCallback(other);
                        this.collidingWith.add(other);
                    }
                    else if (!isColliding && this.collidingWith.has(other)) {
                        // TODO call onExit
                        this.collidingWith.delete(other);
                    }
                };
                Collider.prototype.onColliderEnter = function (callback) {
                    this.onColliderEnterCallback = callback;
                };
                Collider.prototype.getRenderMethods = function () {
                    if (!debug_2.debug.showColliders) {
                        return [];
                    }
                    var color = this.collidingWith.size > 0 ? "#00ff00" : "#ff0000";
                    var pts = this.getPoints();
                    var lines = [];
                    var lastPt = pts[pts.length - 1];
                    for (var _i = 0, pts_1 = pts; _i < pts_1.length; _i++) {
                        var pt = pts_1[_i];
                        lines.push(new LineRender_1.LineRender(pt, lastPt, color));
                        lastPt = pt;
                    }
                    return lines;
                };
                /**
                 * Returns the first point where a line from start->end intersects with this collider.
                 * Returns null if there is no intersection.
                 */
                Collider.prototype.lineCast = function (start, end) {
                    var result = null;
                    var resultDist = 0;
                    var pts = this.getPoints();
                    var lastPt = pts[pts.length - 1];
                    for (var _i = 0, pts_2 = pts; _i < pts_2.length; _i++) {
                        var pt = pts_2[_i];
                        var intersect = this.lineIntersect(pt, lastPt, start, end);
                        if (!!intersect) {
                            var dist = intersect.distanceTo(start);
                            if (result == null || dist < resultDist) {
                                result = intersect;
                                resultDist = dist;
                            }
                        }
                    }
                    return result;
                };
                Collider.prototype.lineIntersect = function (line1Start, line1End, line2Start, line2End) {
                    // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line
                    var x1 = line1Start.x;
                    var y1 = line1Start.y;
                    var x2 = line1End.x;
                    var y2 = line1End.y;
                    var x3 = line2Start.x;
                    var y3 = line2Start.y;
                    var x4 = line2End.x;
                    var y4 = line2End.y;
                    // lines with the same slope don't intersect
                    if (((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)) == 0) {
                        return null;
                    }
                    var tNumerator = (x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4);
                    var uNumerator = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3));
                    var denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
                    if (tNumerator >= 0 && tNumerator <= denominator && uNumerator >= 0 && uNumerator <= denominator) {
                        var t = tNumerator / denominator;
                        return new point_14.Point(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
                    }
                    return null;
                };
                return Collider;
            }(component_4.Component));
            exports_30("Collider", Collider);
        }
    };
});
System.register("engine/collision/BoxCollider", ["engine/collision/Collider", "engine/point", "engine/util/utils"], function (exports_31, context_31) {
    "use strict";
    var Collider_1, point_15, utils_2, BoxCollider;
    var __moduleName = context_31 && context_31.id;
    return {
        setters: [
            function (Collider_1_1) {
                Collider_1 = Collider_1_1;
            },
            function (point_15_1) {
                point_15 = point_15_1;
            },
            function (utils_2_1) {
                utils_2 = utils_2_1;
            }
        ],
        execute: function () {
            BoxCollider = /** @class */ (function (_super) {
                __extends(BoxCollider, _super);
                function BoxCollider(position, dimensions, isTrigger) {
                    if (isTrigger === void 0) { isTrigger = false; }
                    var _this = _super.call(this, position, isTrigger) || this;
                    _this.dimensions = dimensions;
                    return _this;
                }
                BoxCollider.prototype.getPoints = function () {
                    return [
                        new point_15.Point(this.position.x, this.position.y),
                        new point_15.Point(this.position.x + this.dimensions.x, this.position.y),
                        new point_15.Point(this.position.x + this.dimensions.x, this.position.y + this.dimensions.y),
                        new point_15.Point(this.position.x, this.position.y + this.dimensions.y)
                    ];
                };
                BoxCollider.prototype.isWithinBounds = function (pt) {
                    return utils_2.rectContains(this.position, this.dimensions, pt);
                };
                return BoxCollider;
            }(Collider_1.Collider));
            exports_31("BoxCollider", BoxCollider);
        }
    };
});
System.register("engine/ui/Clickable", ["engine/component", "engine/util/utils"], function (exports_32, context_32) {
    "use strict";
    var component_5, utils_3, Clickable;
    var __moduleName = context_32 && context_32.id;
    return {
        setters: [
            function (component_5_1) {
                component_5 = component_5_1;
            },
            function (utils_3_1) {
                utils_3 = utils_3_1;
            }
        ],
        execute: function () {
            Clickable = /** @class */ (function (_super) {
                __extends(Clickable, _super);
                function Clickable(position, dimensions, onClick) {
                    var _this = _super.call(this) || this;
                    _this.position = position;
                    _this.dimensions = dimensions;
                    _this.onClick = onClick;
                    return _this;
                }
                Clickable.prototype.update = function (updateData) {
                    if (updateData.input.isMouseDown && utils_3.rectContains(this.position, this.dimensions, updateData.input.mousePos)) {
                        this.onClick();
                    }
                };
                return Clickable;
            }(component_5.Component));
            exports_32("Clickable", Clickable);
        }
    };
});
System.register("game/player", ["engine/tiles/AnimatedTileComponent", "engine/tiles/TileSetAnimation", "engine/tiles/TileComponent", "engine/point", "game/tiles", "engine/component", "engine/collision/BoxCollider", "game/quest_game"], function (exports_33, context_33) {
    "use strict";
    var AnimatedTileComponent_1, TileSetAnimation_1, TileComponent_3, point_16, tiles_1, component_6, BoxCollider_1, quest_game_1, Player;
    var __moduleName = context_33 && context_33.id;
    return {
        setters: [
            function (AnimatedTileComponent_1_1) {
                AnimatedTileComponent_1 = AnimatedTileComponent_1_1;
            },
            function (TileSetAnimation_1_1) {
                TileSetAnimation_1 = TileSetAnimation_1_1;
            },
            function (TileComponent_3_1) {
                TileComponent_3 = TileComponent_3_1;
            },
            function (point_16_1) {
                point_16 = point_16_1;
            },
            function (tiles_1_1) {
                tiles_1 = tiles_1_1;
            },
            function (component_6_1) {
                component_6 = component_6_1;
            },
            function (BoxCollider_1_1) {
                BoxCollider_1 = BoxCollider_1_1;
            },
            function (quest_game_1_1) {
                quest_game_1 = quest_game_1_1;
            }
        ],
        execute: function () {
            Player = /** @class */ (function (_super) {
                __extends(Player, _super);
                function Player(position) {
                    var _this = _super.call(this) || this;
                    _this.speed = 0.08;
                    _this.lerpedLastMoveDir = new point_16.Point(1, 0); // used for crosshair
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
                    this.characterAnim = this.entity.addComponent(new TileComponent_3.TileComponent(tiles_1.Tile.GUY_1));
                    this.swordAnim = this.entity.addComponent(new AnimatedTileComponent_1.AnimatedTileComponent(new TileSetAnimation_1.TileSetAnimation([
                        [tiles_1.Tile.SWORD_1, 500],
                    ])));
                    this.collider = this.entity.addComponent(new BoxCollider_1.BoxCollider(this.position, new point_16.Point(tiles_1.TILE_SIZE, tiles_1.TILE_SIZE)));
                    this.crosshairs = this.entity.addComponent(new TileComponent_3.TileComponent(tiles_1.Tile.CROSSHAIRS));
                };
                Player.prototype.update = function (updateData) {
                    var originalCrosshairPosRelative = this.crosshairs.transform.position.minus(this.position);
                    this.move(updateData);
                    // update crosshair position
                    var crosshairDistance = 17;
                    var relativeLerpedPos = originalCrosshairPosRelative.lerp(0.16, this.lerpedLastMoveDir.normalized().times(crosshairDistance));
                    this.crosshairs.transform.position = this.position.plus(relativeLerpedPos);
                    if (updateData.input.isKeyDown(70 /* F */)) {
                        quest_game_1.game.tiles.remove(this.crosshairs.transform.position.plus(new point_16.Point(tiles_1.TILE_SIZE, tiles_1.TILE_SIZE).div(2)).floorDiv(tiles_1.TILE_SIZE));
                    }
                };
                Player.prototype.move = function (updateData) {
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
                    var isMoving = dx != 0 || dy != 0;
                    if (isMoving) {
                        var translation = new point_16.Point(dx, dy);
                        this.lerpedLastMoveDir = this.lerpedLastMoveDir.lerp(0.25, translation);
                        var newPos = this._position.plus(translation.times(updateData.elapsedTimeMillis * this.speed));
                        this._position = this.collider.moveTo(newPos);
                    }
                    this.characterAnim.transform.position = this.position;
                    this.swordAnim.transform.position = this.position;
                };
                return Player;
            }(component_6.Component));
            exports_33("Player", Player);
        }
    };
});
System.register("game/MapGenerator", ["engine/point", "engine/tiles/ConnectingTile", "engine/Entity", "engine/collision/BoxCollider", "game/tiles"], function (exports_34, context_34) {
    "use strict";
    var point_17, ConnectingTile_2, Entity_3, BoxCollider_2, tiles_2, MapGenerator;
    var __moduleName = context_34 && context_34.id;
    return {
        setters: [
            function (point_17_1) {
                point_17 = point_17_1;
            },
            function (ConnectingTile_2_1) {
                ConnectingTile_2 = ConnectingTile_2_1;
            },
            function (Entity_3_1) {
                Entity_3 = Entity_3_1;
            },
            function (BoxCollider_2_1) {
                BoxCollider_2 = BoxCollider_2_1;
            },
            function (tiles_2_1) {
                tiles_2 = tiles_2_1;
            }
        ],
        execute: function () {
            MapGenerator = /** @class */ (function () {
                function MapGenerator() {
                }
                MapGenerator.prototype.renderPath = function (grid, start, end, tileSchema, randomness) {
                    var heuristic = function (pt) {
                        var v = pt.distanceTo(end) * Math.random() * randomness;
                        var el = grid.get(pt);
                        if (!el) {
                            return v;
                        }
                        var ct = el.getComponent(ConnectingTile_2.ConnectingTile);
                        if (!ct || !ct.schema.canConnect(tileSchema)) {
                            return v;
                        }
                        var reuseCostMultiplier = 1 / 10;
                        return v * reuseCostMultiplier;
                    };
                    var occupiedCannotConnect = function (pt) {
                        var el = grid.get(pt);
                        if (!el) {
                            return false; // definitely not occupied
                        }
                        var ct = el.getComponent(ConnectingTile_2.ConnectingTile);
                        if (!ct) {
                            return true; // can't connect, therefore occupied
                        }
                        return !tileSchema.canConnect(ct.schema);
                    };
                    var path = grid.findPath(start, end, heuristic, occupiedCannotConnect);
                    if (!path) {
                        return;
                    }
                    path.forEach(function (pt) {
                        var entity = new Entity_3.Entity([
                            new ConnectingTile_2.ConnectingTile(tileSchema, grid, pt),
                            new BoxCollider_2.BoxCollider(pt.times(tiles_2.TILE_SIZE), new point_17.Point(tiles_2.TILE_SIZE, tiles_2.TILE_SIZE), true)
                        ]);
                        grid.set(pt, entity);
                    });
                };
                return MapGenerator;
            }());
            exports_34("MapGenerator", MapGenerator);
        }
    };
});
System.register("game/quest_game", ["engine/Entity", "engine/point", "engine/game", "engine/View", "game/tiles", "engine/tiles/TileComponent", "game/player", "engine/tiles/TileGrid", "game/MapGenerator", "engine/ui/Clickable"], function (exports_35, context_35) {
    "use strict";
    var Entity_4, point_18, game_1, View_2, tiles_3, TileComponent_4, player_1, TileGrid_1, MapGenerator_1, Clickable_1, ZOOM, QuestGame, game;
    var __moduleName = context_35 && context_35.id;
    return {
        setters: [
            function (Entity_4_1) {
                Entity_4 = Entity_4_1;
            },
            function (point_18_1) {
                point_18 = point_18_1;
            },
            function (game_1_1) {
                game_1 = game_1_1;
            },
            function (View_2_1) {
                View_2 = View_2_1;
            },
            function (tiles_3_1) {
                tiles_3 = tiles_3_1;
            },
            function (TileComponent_4_1) {
                TileComponent_4 = TileComponent_4_1;
            },
            function (player_1_1) {
                player_1 = player_1_1;
            },
            function (TileGrid_1_1) {
                TileGrid_1 = TileGrid_1_1;
            },
            function (MapGenerator_1_1) {
                MapGenerator_1 = MapGenerator_1_1;
            },
            function (Clickable_1_1) {
                Clickable_1 = Clickable_1_1;
            }
        ],
        execute: function () {
            ZOOM = 3.125;
            QuestGame = /** @class */ (function (_super) {
                __extends(QuestGame, _super);
                function QuestGame() {
                    var _this = _super.call(this) || this;
                    _this.tiles = new TileGrid_1.TileGrid(tiles_3.TILE_SIZE);
                    _this.player = new Entity_4.Entity([new player_1.Player(new point_18.Point(-2, 2).times(tiles_3.TILE_SIZE))]).getComponent(player_1.Player);
                    _this.gameEntityView = new View_2.View();
                    _this.uiView = {
                        zoom: ZOOM,
                        offset: new point_18.Point(0, 0),
                        entities: _this.getUIEntities()
                    };
                    var rockPt = new point_18.Point(5, 5);
                    _this.tiles.set(rockPt, new Entity_4.Entity([
                        new TileComponent_4.TileComponent(tiles_3.Tile.ROCKS, rockPt.times(tiles_3.TILE_SIZE)),
                        new Clickable_1.Clickable(rockPt.times(tiles_3.TILE_SIZE), new point_18.Point(tiles_3.TILE_SIZE, tiles_3.TILE_SIZE), function () { return console.log("clicked a fuckin' rock!"); })
                    ]));
                    var mapGen = new MapGenerator_1.MapGenerator();
                    mapGen.renderPath(_this.tiles, new point_18.Point(-10, -10), new point_18.Point(10, 10), tiles_3.Tile.PATH, 2);
                    mapGen.renderPath(_this.tiles, new point_18.Point(10, -10), new point_18.Point(-10, 10), tiles_3.Tile.PATH, 5);
                    return _this;
                }
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
                        entities: this.tiles.entries().concat([this.player.entity])
                    };
                };
                // entities whose position is fixed on the camera
                QuestGame.prototype.getUIEntities = function () {
                    var dimensions = new point_18.Point(20, 16); // tile dimensions
                    var result = [];
                    result.push(new TileComponent_4.TileComponent(tiles_3.Tile.BORDER_1, new point_18.Point(0, 0)));
                    result.push(new TileComponent_4.TileComponent(tiles_3.Tile.BORDER_3, new point_18.Point(dimensions.x - 1, 0).times(tiles_3.TILE_SIZE)));
                    result.push(new TileComponent_4.TileComponent(tiles_3.Tile.BORDER_5, new point_18.Point(dimensions.x - 1, dimensions.y - 1).times(tiles_3.TILE_SIZE)));
                    result.push(new TileComponent_4.TileComponent(tiles_3.Tile.BORDER_7, new point_18.Point(0, dimensions.y - 1).times(tiles_3.TILE_SIZE)));
                    // horizontal lines
                    for (var i = 1; i < dimensions.x - 1; i++) {
                        result.push(new TileComponent_4.TileComponent(tiles_3.Tile.BORDER_2, new point_18.Point(i, 0).times(tiles_3.TILE_SIZE)));
                        result.push(new TileComponent_4.TileComponent(tiles_3.Tile.BORDER_6, new point_18.Point(i, dimensions.y - 1).times(tiles_3.TILE_SIZE)));
                    }
                    // vertical lines
                    for (var j = 1; j < dimensions.y - 1; j++) {
                        result.push(new TileComponent_4.TileComponent(tiles_3.Tile.BORDER_4, new point_18.Point(dimensions.x - 1, j).times(tiles_3.TILE_SIZE)));
                        result.push(new TileComponent_4.TileComponent(tiles_3.Tile.BORDER_8, new point_18.Point(0, j).times(tiles_3.TILE_SIZE)));
                    }
                    return [new Entity_4.Entity(result)];
                };
                return QuestGame;
            }(game_1.Game));
            exports_35("game", game = new QuestGame());
        }
    };
});
System.register("app", ["game/quest_game", "engine/engine"], function (exports_36, context_36) {
    "use strict";
    var quest_game_2, engine_1;
    var __moduleName = context_36 && context_36.id;
    return {
        setters: [
            function (quest_game_2_1) {
                quest_game_2 = quest_game_2_1;
            },
            function (engine_1_1) {
                engine_1 = engine_1_1;
            }
        ],
        execute: function () {
            new engine_1.Engine(quest_game_2.game, document.getElementById('canvas'));
        }
    };
});
