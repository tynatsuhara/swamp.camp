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
                Point.prototype.apply = function (fn) {
                    return new Point(fn(this.x), fn(this.y));
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
                    destDimensions = destDimensions !== null && destDimensions !== void 0 ? destDimensions : sourceDimensions;
                    // const mirroredOffset = new Point(mirrorX ? destDimensions.x : 0, mirrorY ? destDimensions.y : 0)
                    var offset = this.view.offset.times(this.view.zoom).apply(Math.floor);
                    var scaledDestPosition = destPosition. /*plus(mirroredOffset).*/times(this.view.zoom).plus(offset);
                    if (pixelPerfect) {
                        scaledDestPosition = this.pixelize(scaledDestPosition);
                    }
                    var scaledDestDimensions = destDimensions.times(this.view.zoom);
                    var biggestDimension = Math.max(scaledDestDimensions.x, scaledDestDimensions.y); // to make sure things get rendered if rotated at the edge of the screen
                    if (scaledDestPosition.x > this.canvas.width + biggestDimension
                        || scaledDestPosition.x + scaledDestDimensions.x < -biggestDimension
                        || scaledDestPosition.y > this.canvas.height + biggestDimension
                        || scaledDestPosition.y + scaledDestDimensions.y < -biggestDimension) {
                        return;
                    }
                    this.context.save();
                    // Use Math.floor() to prevent tearing between images
                    this.context.translate(Math.floor(scaledDestPosition.x), Math.floor(scaledDestPosition.y));
                    var rotationTranslate = destDimensions.div(2).times(this.view.zoom);
                    this.context.translate(rotationTranslate.x, rotationTranslate.y);
                    this.context.rotate(rotation * Math.PI / 180);
                    this.context.scale(mirrorX ? -1 : 1, mirrorY ? -1 : 1);
                    this.context.drawImage(source, sourcePosition.x, sourcePosition.y, sourceDimensions.x, sourceDimensions.y, -rotationTranslate.x, -rotationTranslate.y, scaledDestDimensions.x, scaledDestDimensions.y);
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
                        .filter(function (component) { return !!component && component.enabled; })
                        .flatMap(function (component) { return component.getRenderMethods(); })
                        .sort(function (a, b) { return a.depth - b.depth; }) // TODO possibly improve this
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
                Game.prototype.initialize = function () { };
                return Game;
            }());
            exports_6("Game", Game);
        }
    };
});
System.register("engine/renderer/RenderMethod", [], function (exports_7, context_7) {
    "use strict";
    var RenderMethod;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [],
        execute: function () {
            RenderMethod = /** @class */ (function () {
                function RenderMethod(depth) {
                    this.depth = depth;
                }
                return RenderMethod;
            }());
            exports_7("RenderMethod", RenderMethod);
        }
    };
});
System.register("engine/renderer/TextRender", ["engine/renderer/RenderMethod"], function (exports_8, context_8) {
    "use strict";
    var RenderMethod_1, TextRender;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (RenderMethod_1_1) {
                RenderMethod_1 = RenderMethod_1_1;
            }
        ],
        execute: function () {
            TextRender = /** @class */ (function (_super) {
                __extends(TextRender, _super);
                function TextRender(text, position, font, color) {
                    if (font === void 0) { font = "20px Comic Sans MS Regular"; }
                    if (color === void 0) { color = "red"; }
                    var _this = _super.call(this, Number.MAX_SAFE_INTEGER) || this;
                    _this.text = text;
                    _this.position = position;
                    _this.font = font;
                    _this.color = color;
                    return _this;
                }
                TextRender.prototype.render = function (context) {
                    context.font = this.font;
                    context.fillStyle = this.color;
                    context.fillText(this.text, this.position);
                };
                return TextRender;
            }(RenderMethod_1.RenderMethod));
            exports_8("TextRender", TextRender);
        }
    };
});
System.register("engine/renderer/BasicRenderComponent", ["engine/component"], function (exports_9, context_9) {
    "use strict";
    var component_1, BasicRenderComponent;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (component_1_1) {
                component_1 = component_1_1;
            }
        ],
        execute: function () {
            BasicRenderComponent = /** @class */ (function (_super) {
                __extends(BasicRenderComponent, _super);
                function BasicRenderComponent(render) {
                    var _this = _super.call(this) || this;
                    _this.render = render;
                    return _this;
                }
                BasicRenderComponent.prototype.getRenderMethods = function () {
                    return [this.render];
                };
                return BasicRenderComponent;
            }(component_1.Component));
            exports_9("BasicRenderComponent", BasicRenderComponent);
        }
    };
});
System.register("engine/profiler", ["engine/View", "engine/Entity", "engine/point", "engine/renderer/TextRender", "engine/renderer/BasicRenderComponent"], function (exports_10, context_10) {
    "use strict";
    var View_1, Entity_1, point_5, TextRender_1, BasicRenderComponent_1, Profiler, round, MovingAverage, profiler;
    var __moduleName = context_10 && context_10.id;
    /**
     * Executes the given function and returns the duration it took to execute as well as the result
     */
    function measure(fn) {
        var start = new Date().getTime();
        var result = fn();
        return [new Date().getTime() - start, result];
    }
    exports_10("measure", measure);
    return {
        setters: [
            function (View_1_1) {
                View_1 = View_1_1;
            },
            function (Entity_1_1) {
                Entity_1 = Entity_1_1;
            },
            function (point_5_1) {
                point_5 = point_5_1;
            },
            function (TextRender_1_1) {
                TextRender_1 = TextRender_1_1;
            },
            function (BasicRenderComponent_1_1) {
                BasicRenderComponent_1 = BasicRenderComponent_1_1;
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
                        new Entity_1.Entity(s.map(function (str, i) { return new BasicRenderComponent_1.BasicRenderComponent(new TextRender_1.TextRender(str, new point_5.Point(60, 70 + 25 * i))); }))
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
            exports_10("profiler", profiler = new Profiler());
        }
    };
});
System.register("engine/debug", [], function (exports_11, context_11) {
    "use strict";
    var debug;
    var __moduleName = context_11 && context_11.id;
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
            exports_11("debug", debug = Object.assign({}, {
                showColliders: false,
                showProfiler: false
            }, loadDebug()));
            window['debug'] = observe(debug);
        }
    };
});
System.register("engine/Assets", [], function (exports_12, context_12) {
    "use strict";
    var Assets, assets;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [],
        execute: function () {
            Assets = /** @class */ (function () {
                function Assets() {
                    this.map = new Map();
                }
                Assets.prototype.loadImageFiles = function (relativePaths) {
                    var _this = this;
                    var promises = relativePaths.map(function (path) { return new Promise(function (resolve) {
                        var loadingImage = new Image();
                        loadingImage.onload = function () {
                            _this.map.set(path, loadingImage);
                            resolve();
                        };
                        loadingImage.src = path;
                    }); });
                    return Promise.all(promises);
                };
                Assets.prototype.getImageByFileName = function (fileName) {
                    var result = this.map.get(fileName);
                    if (!result) {
                        throw new Error("file " + fileName + " does not exist");
                    }
                    return result;
                };
                return Assets;
            }());
            exports_12("assets", assets = new Assets());
        }
    };
});
System.register("engine/util/utils", [], function (exports_13, context_13) {
    "use strict";
    var __moduleName = context_13 && context_13.id;
    function rectContains(rectPosition, rectDimensions, pt) {
        return pt.x >= rectPosition.x && pt.x < rectPosition.x + rectDimensions.x
            && pt.y >= rectPosition.y && pt.y < rectPosition.y + rectDimensions.y;
    }
    exports_13("rectContains", rectContains);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("engine/renderer/LineRender", ["engine/renderer/RenderMethod"], function (exports_14, context_14) {
    "use strict";
    var RenderMethod_2, LineRender;
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [
            function (RenderMethod_2_1) {
                RenderMethod_2 = RenderMethod_2_1;
            }
        ],
        execute: function () {
            LineRender = /** @class */ (function (_super) {
                __extends(LineRender, _super);
                function LineRender(start, end, color, width) {
                    if (color === void 0) { color = "#ff0000"; }
                    if (width === void 0) { width = 1; }
                    var _this = _super.call(this, Number.MAX_SAFE_INTEGER) || this;
                    _this.start = start;
                    _this.end = end;
                    _this.color = color;
                    _this.width = width;
                    return _this;
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
            }(RenderMethod_2.RenderMethod));
            exports_14("LineRender", LineRender);
        }
    };
});
System.register("engine/collision/Collider", ["engine/component", "engine/point", "engine/renderer/LineRender", "engine/debug", "engine/collision/CollisionEngine"], function (exports_15, context_15) {
    "use strict";
    var component_2, point_6, LineRender_1, debug_1, CollisionEngine_1, Collider;
    var __moduleName = context_15 && context_15.id;
    return {
        setters: [
            function (component_2_1) {
                component_2 = component_2_1;
            },
            function (point_6_1) {
                point_6 = point_6_1;
            },
            function (LineRender_1_1) {
                LineRender_1 = LineRender_1_1;
            },
            function (debug_1_1) {
                debug_1 = debug_1_1;
            },
            function (CollisionEngine_1_1) {
                CollisionEngine_1 = CollisionEngine_1_1;
            }
        ],
        execute: function () {
            /**
             * A collider detects intersections with other colliders. If isTrigger=true, a collider
             * just calls the callback functions and does not block the other collider. If isTrigger=false,
             * other colliders will not be able to move in to this collider's space, and callbacks won't be triggered.
             */
            Collider = /** @class */ (function (_super) {
                __extends(Collider, _super);
                /**
                 * @param position top left position
                 * @param layer determines which colliders collide based on the collision matrix
                 */
                function Collider(position, layer, ignoredColliders) {
                    if (layer === void 0) { layer = CollisionEngine_1.CollisionEngine.DEFAULT_LAYER; }
                    if (ignoredColliders === void 0) { ignoredColliders = []; }
                    var _this = _super.call(this) || this;
                    _this.collidingWith = new Set();
                    _this.onColliderEnterCallback = function () { };
                    _this._position = position;
                    _this.layer = layer;
                    _this.ignoredColliders = ignoredColliders;
                    CollisionEngine_1.CollisionEngine.instance.markCollider(_this);
                    return _this;
                }
                Object.defineProperty(Collider.prototype, "position", {
                    get: function () { return this._position; },
                    enumerable: true,
                    configurable: true
                });
                Collider.prototype.start = function (startData) {
                    CollisionEngine_1.CollisionEngine.instance.checkAndUpdateCollisions(this);
                };
                Collider.prototype.update = function (updateData) {
                    CollisionEngine_1.CollisionEngine.instance.markCollider(this);
                };
                Collider.prototype.moveTo = function (point) {
                    var dx = point.x - this.position.x;
                    var dy = point.y - this.position.y;
                    // TODO: Should these branches be handled by the caller?
                    if (CollisionEngine_1.CollisionEngine.instance.canTranslate(this, new point_6.Point(dx, dy))) {
                        this._position = point;
                        CollisionEngine_1.CollisionEngine.instance.checkAndUpdateCollisions(this);
                    }
                    else if (CollisionEngine_1.CollisionEngine.instance.canTranslate(this, new point_6.Point(dx, 0))) {
                        this._position = this._position.plus(new point_6.Point(dx, 0));
                        CollisionEngine_1.CollisionEngine.instance.checkAndUpdateCollisions(this);
                    }
                    else if (CollisionEngine_1.CollisionEngine.instance.canTranslate(this, new point_6.Point(0, dy))) {
                        this._position = this._position.plus(new point_6.Point(0, dy));
                        CollisionEngine_1.CollisionEngine.instance.checkAndUpdateCollisions(this);
                    }
                    return this.position;
                };
                Collider.prototype.updateColliding = function (other, isColliding) {
                    if (isColliding && !this.collidingWith.has(other)) {
                        this.collidingWith.add(other);
                        try {
                            this.onColliderEnterCallback(other);
                        }
                        catch (error) {
                            console.log("collider callback threw error: " + error);
                        }
                    }
                    else if (!isColliding && this.collidingWith.has(other)) {
                        // TODO call onExit
                        this.collidingWith.delete(other);
                    }
                };
                Collider.prototype.onColliderEnter = function (callback) {
                    this.onColliderEnterCallback = callback;
                    return this;
                };
                Collider.prototype.getRenderMethods = function () {
                    if (!debug_1.debug.showColliders) {
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
                Collider.prototype.checkWithinBoundsAfterTranslation = function (translation, other) {
                    var _this = this;
                    this._position = this._position.plus(translation);
                    var result = other.getPoints().some(function (p) { return _this.isWithinBounds(p); });
                    this._position = this._position.minus(translation);
                    return result;
                };
                Collider.prototype.delete = function () {
                    var _this = this;
                    this.collidingWith.forEach(function (c) { return c.updateColliding(_this, false); });
                    _super.prototype.delete.call(this);
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
                        return new point_6.Point(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
                    }
                    return null;
                };
                return Collider;
            }(component_2.Component));
            exports_15("Collider", Collider);
        }
    };
});
System.register("engine/collision/CollisionEngine", ["engine/point", "engine/util/utils"], function (exports_16, context_16) {
    "use strict";
    var point_7, utils_1, CollisionEngine, engine;
    var __moduleName = context_16 && context_16.id;
    return {
        setters: [
            function (point_7_1) {
                point_7 = point_7_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }
        ],
        execute: function () {
            CollisionEngine = /** @class */ (function () {
                function CollisionEngine() {
                    this.colliders = [];
                    this.nextUpdateColliders = [];
                    CollisionEngine.instance = this;
                    this.setCollisionMatrix(new Map());
                }
                /**
                 * @param matrix Each layer key in the matrix will trigger BLOCKING collisions with all of the layer values in the corresponding list (and vice-versa)
                 *               DEFAULT_LAYER will always have BLOCKING collisions with DEFAULT_LAYER
                 */
                CollisionEngine.prototype.setCollisionMatrix = function (matrix) {
                    var bidirectional = new Map();
                    bidirectional.set(CollisionEngine.DEFAULT_LAYER, new Set([CollisionEngine.DEFAULT_LAYER]));
                    for (var _i = 0, _a = Array.from(matrix.keys()); _i < _a.length; _i++) {
                        var r = _a[_i];
                        for (var _b = 0, _c = matrix.get(r); _b < _c.length; _b++) {
                            var c = _c[_b];
                            if (!bidirectional.has(r))
                                bidirectional.set(r, new Set());
                            bidirectional.get(r).add(c);
                            if (!bidirectional.has(c))
                                bidirectional.set(c, new Set());
                            bidirectional.get(c).add(r);
                        }
                    }
                    this.matrix = bidirectional;
                };
                /**
                 * A collider must mark itself in order to be included in any collision calculations in the next update step.
                 * This allows us to keep track of any colliders that are "active"
                 */
                CollisionEngine.prototype.markCollider = function (collider) {
                    this.nextUpdateColliders.push(collider);
                };
                CollisionEngine.prototype.nextUpdate = function () {
                    this.colliders = this.nextUpdateColliders;
                    this.nextUpdateColliders = [];
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
                        return utils_1.rectContains(new point_7.Point(xMax, yMin), new point_7.Point(xMax - xMin, yMax - yMin), pt);
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
                CollisionEngine.prototype.checkAndUpdateCollisions = function (collider) {
                    this.removeDanglingColliders();
                    this.colliders.filter(function (other) { return other !== collider; }).forEach(function (other) {
                        var isColliding = other.enabled
                            && (other.getPoints().some(function (pt) { return collider.isWithinBounds(pt); }) || collider.getPoints().some(function (pt) { return other.isWithinBounds(pt); }));
                        collider.updateColliding(other, isColliding);
                        other.updateColliding(collider, isColliding);
                    });
                };
                // Returns true if the collider can be translated and will not intersect a non-trigger collider in the new position.
                // This DOES NOT check for any possible colliders in the path of the collision and should only be used for small translations.
                CollisionEngine.prototype.canTranslate = function (collider, translation) {
                    var collidingLayers = this.matrix.get(collider.layer);
                    if (!collidingLayers || collidingLayers.size === 0) { // nothing will ever block this collider
                        return true;
                    }
                    this.removeDanglingColliders();
                    var translatedPoints = collider.getPoints().map(function (pt) { return pt.plus(translation); });
                    return !this.colliders
                        .filter(function (other) {
                        return other !== collider && other.enabled && collidingLayers.has(other.layer)
                            && collider.ignoredColliders.indexOf(other) === -1 && other.ignoredColliders.indexOf(collider) === -1;
                    }) // potential collisions
                        .some(function (other) {
                        return translatedPoints.some(function (pt) { return other.isWithinBounds(pt); }) // TODO 
                            || collider.checkWithinBoundsAfterTranslation(translation, other);
                    });
                };
                // unregisters any colliders without an entity
                CollisionEngine.prototype.removeDanglingColliders = function () {
                    var _this = this;
                    var removed = this.colliders.filter(function (other) { return !other.entity; });
                    if (removed.length === 0) {
                        return;
                    }
                    this.colliders = this.colliders.filter(function (other) { return !!other.entity; });
                    removed.forEach(function (r) { return _this.colliders.forEach(function (c) { return c.updateColliding(r, false); }); });
                };
                CollisionEngine.DEFAULT_LAYER = "default";
                return CollisionEngine;
            }());
            exports_16("CollisionEngine", CollisionEngine);
            engine = new CollisionEngine();
        }
    };
});
System.register("engine/engine", ["engine/renderer/Renderer", "engine/input", "engine/profiler", "engine/debug", "engine/collision/CollisionEngine"], function (exports_17, context_17) {
    "use strict";
    var Renderer_1, input_1, profiler_1, debug_2, CollisionEngine_2, UpdateViewsContext, StartData, UpdateData, Engine, ALREADY_STARTED_COMPONENT;
    var __moduleName = context_17 && context_17.id;
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
            function (debug_2_1) {
                debug_2 = debug_2_1;
            },
            function (CollisionEngine_2_1) {
                CollisionEngine_2 = CollisionEngine_2_1;
            }
        ],
        execute: function () {
            UpdateViewsContext = /** @class */ (function () {
                function UpdateViewsContext() {
                }
                return UpdateViewsContext;
            }());
            exports_17("UpdateViewsContext", UpdateViewsContext);
            StartData = /** @class */ (function () {
                function StartData() {
                }
                return StartData;
            }());
            exports_17("StartData", StartData);
            UpdateData = /** @class */ (function () {
                function UpdateData() {
                }
                return UpdateData;
            }());
            exports_17("UpdateData", UpdateData);
            Engine = /** @class */ (function () {
                function Engine(game, canvas) {
                    var _this = this;
                    this.lastUpdateMillis = new Date().getTime();
                    this.game = game;
                    this.renderer = new Renderer_1.Renderer(canvas);
                    this.input = new input_1.Input(canvas);
                    this.game.initialize();
                    requestAnimationFrame(function () { return _this.tick(); });
                }
                Engine.prototype.tick = function () {
                    var _this = this;
                    var time = new Date().getTime();
                    var elapsed = time - this.lastUpdateMillis;
                    if (elapsed == 0) {
                        return;
                    }
                    CollisionEngine_2.CollisionEngine.instance.nextUpdate();
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
                            // Behavior where an entity belongs to multiple views is undefined (revisit later, eg for splitscreen)
                            v.entities.forEach(function (e) { return e.components.forEach(function (c) {
                                if (!c.enabled) {
                                    return;
                                }
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
                    if (debug_2.debug.showProfiler) {
                        profiler_1.profiler.update(elapsed, updateDuration, renderDuration);
                    }
                    this.lastUpdateMillis = time;
                    requestAnimationFrame(function () { return _this.tick(); });
                };
                Engine.prototype.getViews = function (context) {
                    return this.game.getViews(context).concat(debug_2.debug.showProfiler ? [profiler_1.profiler.getView()] : []);
                };
                return Engine;
            }());
            exports_17("Engine", Engine);
            ALREADY_STARTED_COMPONENT = function (startData) {
                throw new Error("start() has already been called on this component");
            };
        }
    };
});
System.register("engine/component", [], function (exports_18, context_18) {
    "use strict";
    var Component;
    var __moduleName = context_18 && context_18.id;
    return {
        setters: [],
        execute: function () {
            Component = /** @class */ (function () {
                function Component() {
                    this.enabled = true;
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
                /**
                 * Override if custom logic is desired when a component or parent entity is deleted
                 */
                Component.prototype.delete = function () {
                    var _a;
                    (_a = this.entity) === null || _a === void 0 ? void 0 : _a.removeComponent(this);
                };
                return Component;
            }());
            exports_18("Component", Component);
        }
    };
});
System.register("engine/Entity", [], function (exports_19, context_19) {
    "use strict";
    var Entity;
    var __moduleName = context_19 && context_19.id;
    return {
        setters: [],
        execute: function () {
            /**
             * An object which exists in the game world and updated by the engine. Should be attached to a game view.
             */
            Entity = /** @class */ (function () {
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
                /**
                 * Disables and removes all components.
                 * Passing a self-destructed entity to the engine will have no effects.
                 */
                Entity.prototype.selfDestruct = function () {
                    this.components.forEach(function (c) { return c.delete(); });
                };
                return Entity;
            }());
            exports_19("Entity", Entity);
        }
    };
});
System.register("engine/renderer/ImageRender", ["engine/renderer/RenderMethod"], function (exports_20, context_20) {
    "use strict";
    var RenderMethod_3, ImageRender;
    var __moduleName = context_20 && context_20.id;
    return {
        setters: [
            function (RenderMethod_3_1) {
                RenderMethod_3 = RenderMethod_3_1;
            }
        ],
        execute: function () {
            ImageRender = /** @class */ (function (_super) {
                __extends(ImageRender, _super);
                function ImageRender(source, sourcePosition, sourceDimensions, position, dimensions, depth, rotation, mirrorX, mirrorY) {
                    if (depth === void 0) { depth = 0; }
                    if (rotation === void 0) { rotation = 0; }
                    if (mirrorX === void 0) { mirrorX = false; }
                    if (mirrorY === void 0) { mirrorY = false; }
                    var _this = _super.call(this, depth) || this;
                    _this.source = source;
                    _this.sourcePosition = sourcePosition,
                        _this.sourceDimensions = sourceDimensions;
                    _this.position = position;
                    _this.dimensions = dimensions;
                    _this.rotation = rotation;
                    _this.mirrorX = mirrorX,
                        _this.mirrorY = mirrorY;
                    return _this;
                }
                ImageRender.prototype.render = function (context) {
                    var pixelPerfect = false; // TODO make this work properly
                    context.drawImage(this.source, this.sourcePosition, this.sourceDimensions, this.position, this.dimensions, this.rotation, pixelPerfect, this.mirrorX, this.mirrorY);
                };
                return ImageRender;
            }(RenderMethod_3.RenderMethod));
            exports_20("ImageRender", ImageRender);
        }
    };
});
System.register("engine/tiles/TileTransform", ["engine/point"], function (exports_21, context_21) {
    "use strict";
    var point_8, TileTransform;
    var __moduleName = context_21 && context_21.id;
    return {
        setters: [
            function (point_8_1) {
                point_8 = point_8_1;
            }
        ],
        execute: function () {
            /**
             * A representation of a rectangular's transform in a world space,
             * either absolute or relative to another TileTransform. Used by
             * tiles (aka sprites).
             *   TODO:
             *     - Maybe use for colliders?
             *     - Add ways to get the relative values (right now getters result translated global values)
             */
            TileTransform = /** @class */ (function () {
                function TileTransform(position, dimensions, // if null, match the dimensions of the source image
                rotation, mirrorX, mirrorY, depth) {
                    if (position === void 0) { position = new point_8.Point(0, 0); }
                    if (dimensions === void 0) { dimensions = null; }
                    if (rotation === void 0) { rotation = 0; }
                    if (mirrorX === void 0) { mirrorX = false; }
                    if (mirrorY === void 0) { mirrorY = false; }
                    if (depth === void 0) { depth = Number.MIN_SAFE_INTEGER; }
                    this._position = position;
                    this.dimensions = dimensions;
                    this._rotation = rotation;
                    this._mirrorX = mirrorX;
                    this._mirrorY = mirrorY;
                    this._depth = depth;
                }
                Object.defineProperty(TileTransform.prototype, "position", {
                    get: function () {
                        if (!this.parentTransform)
                            return this._position;
                        var x = this._position.x;
                        var y = this._position.y;
                        if (!!this.parentTransform.mirrorX) {
                            x = this.parentTransform.dimensions.x - x - this.dimensions.x;
                        }
                        if (!!this.parentTransform.mirrorY) {
                            y = this.parentTransform.dimensions.y - y - this.dimensions.y;
                        }
                        return this.rotatedAround(this.parentTransform.position.plus(new point_8.Point(x, y)), this.parentTransform.centeredPosition, this.parentTransform.rotation);
                    },
                    set: function (value) { this._position = value; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(TileTransform.prototype, "rotation", {
                    get: function () {
                        if (!this.parentTransform)
                            return this._rotation;
                        return this.parentTransform.rotation + this._rotation * (this.mirrorX ? -1 : 1) * (this.mirrorY ? -1 : 1);
                    },
                    set: function (value) { this._rotation = value; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(TileTransform.prototype, "mirrorX", {
                    get: function () {
                        if (!this.parentTransform)
                            return this._mirrorX;
                        return this.parentTransform.mirrorX ? !this._mirrorX : this._mirrorX;
                    },
                    set: function (value) { this._mirrorX = value; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(TileTransform.prototype, "mirrorY", {
                    get: function () {
                        if (!this.parentTransform)
                            return this._mirrorY;
                        return this.parentTransform.mirrorY ? !this._mirrorY : this._mirrorY;
                    },
                    set: function (value) { this._mirrorY = value; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(TileTransform.prototype, "depth", {
                    get: function () {
                        if (!this.parentTransform)
                            return this._depth;
                        return this.parentTransform.depth + this._depth;
                    },
                    set: function (value) { this._depth = value; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(TileTransform.prototype, "centeredPosition", {
                    get: function () {
                        return this.position.plus(this.dimensions.div(2));
                    },
                    enumerable: true,
                    configurable: true
                });
                TileTransform.prototype.rotate = function (angle, around) {
                    if (around === void 0) { around = this.position; }
                    this._rotation += angle;
                    this._position = this.rotatedAround(this.position, around, this._rotation);
                };
                TileTransform.prototype.relativeTo = function (parentTransform) {
                    this.parentTransform = parentTransform;
                    return this;
                };
                TileTransform.prototype.rotatedAround = function (pt, center, angle) {
                    var x = pt.x + this.dimensions.x / 2; // point to rotate around
                    var y = pt.y + this.dimensions.y / 2;
                    var cx = center.x;
                    var cy = center.y;
                    var radians = (Math.PI / 180) * -angle, cos = Math.cos(radians), sin = Math.sin(radians), nx = (cos * (x - cx)) + (sin * (y - cy)) + cx, ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
                    return new point_8.Point(nx - this.dimensions.x / 2, ny - this.dimensions.y / 2);
                };
                return TileTransform;
            }());
            exports_21("TileTransform", TileTransform);
        }
    };
});
System.register("engine/tiles/TileComponent", ["engine/component", "engine/tiles/TileTransform"], function (exports_22, context_22) {
    "use strict";
    var component_3, TileTransform_1, TileComponent;
    var __moduleName = context_22 && context_22.id;
    return {
        setters: [
            function (component_3_1) {
                component_3 = component_3_1;
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
                function TileComponent(tileSource, transform) {
                    if (transform === void 0) { transform = new TileTransform_1.TileTransform(); }
                    var _this = _super.call(this) || this;
                    _this.tileSource = tileSource;
                    _this.transform = transform;
                    if (!transform.dimensions) {
                        transform.dimensions = tileSource.dimensions;
                    }
                    return _this;
                }
                TileComponent.prototype.getRenderMethods = function () {
                    return [this.tileSource.toImageRender(this.transform)];
                };
                return TileComponent;
            }(component_3.Component));
            exports_22("TileComponent", TileComponent);
        }
    };
});
System.register("engine/tiles/TileSource", [], function (exports_23, context_23) {
    "use strict";
    var __moduleName = context_23 && context_23.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("engine/tiles/StaticTileSource", ["engine/renderer/ImageRender", "engine/tiles/TileComponent"], function (exports_24, context_24) {
    "use strict";
    var ImageRender_1, TileComponent_1, StaticTileSource;
    var __moduleName = context_24 && context_24.id;
    return {
        setters: [
            function (ImageRender_1_1) {
                ImageRender_1 = ImageRender_1_1;
            },
            function (TileComponent_1_1) {
                TileComponent_1 = TileComponent_1_1;
            }
        ],
        execute: function () {
            StaticTileSource = /** @class */ (function () {
                /**
                 * Constructs a static (non-animated) tile source
                 */
                function StaticTileSource(image, position, dimensions) {
                    this.image = image;
                    this.position = position;
                    this.dimensions = dimensions;
                }
                StaticTileSource.prototype.toImageRender = function (transform) {
                    var _a;
                    return new ImageRender_1.ImageRender(this.image, this.position, this.dimensions, transform.position, (_a = transform.dimensions) !== null && _a !== void 0 ? _a : this.dimensions, transform.depth, transform.rotation, transform.mirrorX, transform.mirrorY);
                };
                StaticTileSource.prototype.toComponent = function () {
                    return new TileComponent_1.TileComponent(this);
                };
                return StaticTileSource;
            }());
            exports_24("StaticTileSource", StaticTileSource);
        }
    };
});
// Original JavaScript Code from  Marijn Haverbeke (http://eloquentjavascript.net/1st_edition/appendix2.html)
System.register("engine/util/BinaryHeap", [], function (exports_25, context_25) {
    "use strict";
    var BinaryHeap;
    var __moduleName = context_25 && context_25.id;
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
            exports_25("BinaryHeap", BinaryHeap);
        }
    };
});
System.register("engine/util/Grid", ["engine/point", "engine/util/BinaryHeap"], function (exports_26, context_26) {
    "use strict";
    var point_9, BinaryHeap_1, Grid;
    var __moduleName = context_26 && context_26.id;
    return {
        setters: [
            function (point_9_1) {
                point_9 = point_9_1;
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
                    if (getNeighbors === void 0) { getNeighbors = function (pt) { return [new point_9.Point(pt.x, pt.y - 1), new point_9.Point(pt.x - 1, pt.y), new point_9.Point(pt.x + 1, pt.y), new point_9.Point(pt.x, pt.y + 1)]; }; }
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
            exports_26("Grid", Grid);
        }
    };
});
System.register("engine/tiles/ConnectingTile", ["engine/point", "engine/component"], function (exports_27, context_27) {
    "use strict";
    var point_10, component_4, ConnectingTile;
    var __moduleName = context_27 && context_27.id;
    return {
        setters: [
            function (point_10_1) {
                point_10 = point_10_1;
            },
            function (component_4_1) {
                component_4 = component_4_1;
            }
        ],
        execute: function () {
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
            }(component_4.Component));
            exports_27("ConnectingTile", ConnectingTile);
        }
    };
});
System.register("engine/tiles/ConnectingTileSchema", ["engine/point", "engine/tiles/TileTransform", "engine/tiles/ConnectingTile"], function (exports_28, context_28) {
    "use strict";
    var point_11, TileTransform_2, ConnectingTile_1, ConnectingTileSchema;
    var __moduleName = context_28 && context_28.id;
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
             * TODO: This could probably be a lot better and support more complex connecting logic
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
                    return result.toImageRender(new TileTransform_2.TileTransform(position.times(result.dimensions.x), null, rotation));
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
            exports_28("ConnectingTileSchema", ConnectingTileSchema);
        }
    };
});
System.register("engine/collision/BoxCollider", ["engine/collision/Collider", "engine/point", "engine/util/utils", "engine/collision/CollisionEngine"], function (exports_29, context_29) {
    "use strict";
    var Collider_1, point_12, utils_2, CollisionEngine_3, BoxCollider;
    var __moduleName = context_29 && context_29.id;
    return {
        setters: [
            function (Collider_1_1) {
                Collider_1 = Collider_1_1;
            },
            function (point_12_1) {
                point_12 = point_12_1;
            },
            function (utils_2_1) {
                utils_2 = utils_2_1;
            },
            function (CollisionEngine_3_1) {
                CollisionEngine_3 = CollisionEngine_3_1;
            }
        ],
        execute: function () {
            BoxCollider = /** @class */ (function (_super) {
                __extends(BoxCollider, _super);
                function BoxCollider(position, dimensions, layer, ignoredColliders) {
                    if (layer === void 0) { layer = CollisionEngine_3.CollisionEngine.DEFAULT_LAYER; }
                    if (ignoredColliders === void 0) { ignoredColliders = []; }
                    var _this = _super.call(this, position, layer, ignoredColliders) || this;
                    _this.dimensions = dimensions;
                    return _this;
                }
                BoxCollider.prototype.getPoints = function () {
                    return [
                        new point_12.Point(this.position.x, this.position.y),
                        new point_12.Point(this.position.x + this.dimensions.x, this.position.y),
                        new point_12.Point(this.position.x + this.dimensions.x, this.position.y + this.dimensions.y),
                        new point_12.Point(this.position.x, this.position.y + this.dimensions.y)
                    ];
                };
                BoxCollider.prototype.isWithinBounds = function (pt) {
                    return utils_2.rectContains(this.position, this.dimensions, pt);
                };
                return BoxCollider;
            }(Collider_1.Collider));
            exports_29("BoxCollider", BoxCollider);
        }
    };
});
System.register("engine/util/Animator", [], function (exports_30, context_30) {
    "use strict";
    var Animator;
    var __moduleName = context_30 && context_30.id;
    return {
        setters: [],
        execute: function () {
            Animator = /** @class */ (function () {
                /**
                 * @param frames A list of frame durations
                 * @param fn A callback that will be called each time a frame changes, passing the zero-based frame index
                 */
                function Animator(frames, onFrameChange, onFinish) {
                    var _this = this;
                    if (onFrameChange === void 0) { onFrameChange = function () { }; }
                    if (onFinish === void 0) { onFinish = function () { }; }
                    this.time = 0;
                    this.index = 0;
                    this.onFrameChange = onFrameChange;
                    this.onFinish = onFinish;
                    this.frames = [];
                    var durationSoFar = 0;
                    frames.forEach(function (frameDuration) {
                        durationSoFar += frameDuration;
                        _this.frames.push(durationSoFar);
                    });
                    this.duration = durationSoFar;
                    this.update(0);
                }
                Animator.prototype.update = function (elapsedTimeMillis) {
                    this.time += elapsedTimeMillis;
                    while (this.time > this.frames[this.index]) {
                        this.index++;
                        if (this.index === this.frames.length) {
                            this.onFinish();
                        }
                        this.index %= this.frames.length;
                        this.time %= this.duration;
                        this.onFrameChange(this.index);
                    }
                };
                Animator.prototype.getCurrentFrame = function () {
                    return this.index;
                };
                Animator.frames = function (count, msPerFrame) {
                    var result = [];
                    for (var i = 0; i < count; i++) {
                        result.push(msPerFrame);
                    }
                    return result;
                };
                return Animator;
            }());
            exports_30("Animator", Animator);
        }
    };
});
System.register("engine/tiles/AnimatedTileComponent", ["engine/tiles/TileComponent", "engine/util/Animator", "engine/tiles/TileTransform"], function (exports_31, context_31) {
    "use strict";
    var TileComponent_2, Animator_1, TileTransform_3, AnimatedTileComponent;
    var __moduleName = context_31 && context_31.id;
    return {
        setters: [
            function (TileComponent_2_1) {
                TileComponent_2 = TileComponent_2_1;
            },
            function (Animator_1_1) {
                Animator_1 = Animator_1_1;
            },
            function (TileTransform_3_1) {
                TileTransform_3 = TileTransform_3_1;
            }
        ],
        execute: function () {
            AnimatedTileComponent = /** @class */ (function (_super) {
                __extends(AnimatedTileComponent, _super);
                // defaultAnimation has a key of 0, the following is 1, etc
                function AnimatedTileComponent(animations, transform) {
                    if (transform === void 0) { transform = new TileTransform_3.TileTransform(); }
                    var _this = this;
                    if (animations.length < 1) {
                        throw new Error("needs at least one animation!");
                    }
                    var defaultAnimation = animations[0];
                    _this = _super.call(this, defaultAnimation.getTile(0), transform) || this;
                    _this.animations = animations;
                    _this.play(0);
                    return _this;
                }
                AnimatedTileComponent.prototype.currentFrame = function () {
                    return this.animator.getCurrentFrame();
                };
                AnimatedTileComponent.prototype.play = function (animation) {
                    var _this = this;
                    var anim = this.animations[animation];
                    this.animator = new Animator_1.Animator(anim.frames.map(function (f) { return f[1]; }), function (index) {
                        _this.tileSource = anim.getTile(index);
                    });
                };
                AnimatedTileComponent.prototype.update = function (updateData) {
                    if (!this.paused) {
                        this.animator.update(updateData.elapsedTimeMillis);
                    }
                };
                return AnimatedTileComponent;
            }(TileComponent_2.TileComponent));
            exports_31("AnimatedTileComponent", AnimatedTileComponent);
        }
    };
});
System.register("engine/tiles/TileSetAnimation", ["engine/tiles/AnimatedTileComponent"], function (exports_32, context_32) {
    "use strict";
    var AnimatedTileComponent_1, TileSetAnimation;
    var __moduleName = context_32 && context_32.id;
    return {
        setters: [
            function (AnimatedTileComponent_1_1) {
                AnimatedTileComponent_1 = AnimatedTileComponent_1_1;
            }
        ],
        execute: function () {
            TileSetAnimation = /** @class */ (function () {
                /**
                 * @param frames A list of tile sources and a duration in milliseconds that each one will last
                 */
                function TileSetAnimation(frames) {
                    this.frames = frames;
                }
                TileSetAnimation.prototype.getTile = function (index) {
                    return this.frames[index][0];
                };
                TileSetAnimation.prototype.toComponent = function () {
                    return new AnimatedTileComponent_1.AnimatedTileComponent([this]);
                };
                return TileSetAnimation;
            }());
            exports_32("TileSetAnimation", TileSetAnimation);
        }
    };
});
System.register("game/graphics/SingleFileTileLoader", ["engine/point", "engine/tiles/StaticTileSource", "engine/Assets", "engine/tiles/TileSetAnimation"], function (exports_33, context_33) {
    "use strict";
    var point_13, StaticTileSource_1, Assets_1, TileSetAnimation_1, SingleFileTileLoader;
    var __moduleName = context_33 && context_33.id;
    return {
        setters: [
            function (point_13_1) {
                point_13 = point_13_1;
            },
            function (StaticTileSource_1_1) {
                StaticTileSource_1 = StaticTileSource_1_1;
            },
            function (Assets_1_1) {
                Assets_1 = Assets_1_1;
            },
            function (TileSetAnimation_1_1) {
                TileSetAnimation_1 = TileSetAnimation_1_1;
            }
        ],
        execute: function () {
            SingleFileTileLoader = /** @class */ (function () {
                function SingleFileTileLoader(filename, map, tileSize, padding) {
                    if (map === void 0) { map = new Map(); }
                    if (tileSize === void 0) { tileSize = 16; }
                    if (padding === void 0) { padding = 1; }
                    this.filename = filename;
                    this.map = map;
                    this.tileSize = tileSize;
                    this.padding = padding;
                }
                SingleFileTileLoader.prototype.getTileSource = function (key) {
                    var result = this.map.get(key);
                    if (!result) {
                        throw new Error(key + " is not a valid tile");
                    }
                    return this.getTileAt(result);
                };
                SingleFileTileLoader.prototype.getTileAt = function (pos) {
                    return new StaticTileSource_1.StaticTileSource(this.image(), pos.times(this.tileSize + this.padding), new point_13.Point(this.tileSize, this.tileSize));
                };
                SingleFileTileLoader.prototype.getTileSetAnimation = function (key, frames, speed) {
                    var _this = this;
                    var result = this.map.get(key);
                    if (!result) {
                        return null;
                    }
                    return new TileSetAnimation_1.TileSetAnimation(Array.from({ length: frames }, function (k, v) { return v; })
                        .map(function (index) { return _this.getTileAt(result.plus(new point_13.Point(index, 0))); })
                        .map(function (tileSource) { return [tileSource, speed]; }));
                };
                SingleFileTileLoader.prototype.image = function () {
                    return Assets_1.assets.getImageByFileName(this.filename);
                };
                return SingleFileTileLoader;
            }());
            exports_33("SingleFileTileLoader", SingleFileTileLoader);
        }
    };
});
System.register("game/graphics/DungeonTilesetII", ["engine/tiles/StaticTileSource", "engine/point", "engine/tiles/TileSetAnimation", "engine/Assets"], function (exports_34, context_34) {
    "use strict";
    var StaticTileSource_2, point_14, TileSetAnimation_2, Assets_2, map, DungeonTilesetII;
    var __moduleName = context_34 && context_34.id;
    return {
        setters: [
            function (StaticTileSource_2_1) {
                StaticTileSource_2 = StaticTileSource_2_1;
            },
            function (point_14_1) {
                point_14 = point_14_1;
            },
            function (TileSetAnimation_2_1) {
                TileSetAnimation_2 = TileSetAnimation_2_1;
            },
            function (Assets_2_1) {
                Assets_2 = Assets_2_1;
            }
        ],
        execute: function () {
            map = new Map("\n    wall_top_left 16 0 16 16\n    wall_top_mid 32 0 16 16\n    wall_top_right 48 0 16 16\n\n    wall_left 16 16 16 16\n    wall_mid 32 16 16 16\n    wall_right 48 16 16 16\n\n    wall_fountain_top 64 0 16 16\n    wall_fountain_mid_red_anim 64 16 16 16 3\n    wall_fountain_basin_red_anim 64 32 16 16 3\n    wall_fountain_mid_blue_anim 64 48 16 16 3\n    wall_fountain_basin_blue_anim 64 64 16 16 3\n\n    wall_hole_1 48 32 16 16\n    wall_hole_2 48 48 16 16\n\n    wall_banner_red 16 32 16 16\n    wall_banner_blue 32 32 16 16\n    wall_banner_green 16 48 16 16\n    wall_banner_yellow 32 48 16 16\n\n    column_top 80 80 16 16\n    column_mid 80 96 16 16\n    coulmn_base 80 112 16 16\n    wall_column_top 96 80 16 16\n    wall_column_mid 96 96 16 16\n    wall_coulmn_base 96 112 16 16\n\n    wall_goo 64 80 16 16\n    wall_goo_base 64 96 16 16\n\n    floor_1 16 64 16 16\n    floor_2 32 64 16 16\n    floor_3 48 64 16 16\n    floor_4 16 80 16 16\n    floor_5 32 80 16 16\n    floor_6 48 80 16 16\n    floor_7 16 96 16 16\n    floor_8 32 96 16 16\n    floor_ladder 48 96 16 16\n\n    floor_spikes_anim 16 176 16 16 4\n\n    wall_side_top_left 0 112 16 16\n    wall_side_top_right 16 112 16 16\n    wall_side_mid_left 0 128 16 16\n    wall_side_mid_right 16 128 16 16\n    wall_side_front_left 0 144 16 16\n    wall_side_front_right 16 144 16 16\n\n    wall_corner_top_left 32 112 16 16\n    wall_corner_top_right 48 112 16 16\n    wall_corner_left 32 128 16 16\n    wall_corner_right 48 128 16 16\n    wall_corner_bottom_left 32 144 16 16\n    wall_corner_bottom_right 48 144 16 16\n    wall_corner_front_left 32 160 16 16\n    wall_corner_front_right 48 160 16 16\n\n    wall_inner_corner_l_top_left 80 128 16 16\n    wall_inner_corner_l_top_rigth 64 128 16 16\n    wall_inner_corner_mid_left 80 144 16 16\n    wall_inner_corner_mid_rigth 64 144 16 16\n    wall_inner_corner_t_top_left 80 160 16 16\n    wall_inner_corner_t_top_rigth 64 160 16 16\n\n    edge 96 128 16 16\n    hole  96 144 16 16\n\n    doors_all 16 221 64 35\n    doors_frame_left 16 224 16 32\n    doors_frame_top 32 221 32 3\n    doors_frame_righ 63 224 16 32\n    doors_leaf_closed 32 224 32 32\n    doors_leaf_open 80 224 32 32\n\n    chest_empty_open_anim 304 288 16 16 3\n    chest_full_open_anim 304 304 16 16 3\n    chest_mimic_open_anim 304 320 16 16 3\n\n    flask_big_red 288 224 16 16\n    flask_big_blue 304 224 16 16\n    flask_big_green 320 224 16 16\n    flask_big_yellow 336 224 16 16\n\n    flask_red 288 240 16 16\n    flask_blue 304 240 16 16\n    flask_green 320 240 16 16\n    flask_yellow 336 240 16 16\n\n    skull 288 320 16 16\n    crate 288 298 16 22\n\n    coin_anim 288 272 8 8 4\n\n    ui_heart_full 288 256 16 16\n    ui_heart_half 304 256 16 16\n    ui_heart_empty 320 256 16 16\n\n    weapon_knife 293 18 6 13\n    weapon_rusty_sword 307 26 10 21\n    weapon_regular_sword 323 26 10 21\n    weapon_red_gem_sword 339 26 10 21\n    weapon_big_hammer 291 42 10 37\n    weapon_hammer 307 55 10 24\n    weapon_baton_with_spikes 323 57 10 22\n    weapon_mace 339 55 10 24\n    weapon_katana 293 82 6 29\n    weapon_saw_sword 307 86 10 25\n    weapon_anime_sword 322 81 12 30\n    weapon_axe 341 90 9 21\n    weapon_machete 294 121 5 22\n    weapon_cleaver 310 124 8 19\n    weapon_duel_sword 325 113 9 30\n    weapon_knight_sword 339 114 10 29\n    weapon_golden_sword 291 153 10 22\n    weapon_lavish_sword 307 145 10 30\n    weapon_red_magic_staff 324 145 8 30\n    weapon_green_magic_staff 340 145 8 30\n    weapon_spear 293 177 6 30\n\n    tiny_zombie_idle_anim 368 16 16 16 4\n    tiny_zombie_run_anim 432 16 16 16 4\n\n    goblin_idle_anim 368 32 16 16 4\n    goblin_run_anim 432 32 16 16 4\n\n    imp_idle_anim 368 48 16 16 4\n    imp_run_anim 432 48 16 16 4\n\n    skelet_idle_anim 368 80 16 16 4\n    skelet_run_anim 432 80 16 16 4\n\n    muddy_idle_anim 368 112 16 16 4\n    muddy_run_anim 368 112 16 16 4\n\n    swampy_idle_anim 432 112 16 16 4\n    swampy_run_anim 432 112 16 16 4\n\n    zombie_idle_anim 368 144 16 16 4\n    zombie_run_anim 368 144 16 16 4\n\n    ice_zombie_idle_anim 432 144 16 16 4\n    ice_zombie_run_anim 432 144 16 16 4\n\n    masked_orc_idle_anim 368 172 16 20 4\n    masked_orc_run_anim 432 172 16 20 4\n\n    orc_warrior_idle_anim 368 204 16 20 4\n    orc_warrior_run_anim 432 204 16 20 4\n\n    orc_shaman_idle_anim 368 236 16 20 4\n    orc_shaman_run_anim 432 236 16 20 4\n\n    necromancer_idle_anim 368 268 16 20 4\n    necromancer_run_anim 368 268 16 20 4\n\n    wogol_idle_anim 368 300 16 20 4\n    wogol_run_anim 432 300 16 20 4\n\n    chort_idle_anim 368 328 16 24 4\n    chort_run_anim 432 328 16 24 4\n\n    big_zombie_idle_anim 16 270 32 34 4\n    big_zombie_run_anim 144 270 32 34 4\n\n    ogre_idle_anim  16 320 32 32 4\n    ogre_run_anim 144 320 32 32 4\n    \n    big_demon_idle_anim  16 364 32 36 4\n    big_demon_run_anim 144 364 32 36 4\n\n    elf_f_idle_anim 128 4 16 28 4\n    elf_f_run_anim 192 4 16 28 4\n    elf_f_hit_anim 256 4 16 28 1\n\n    elf_m_idle_anim 128 36 16 28 4\n    elf_m_run_anim 192 36 16 28 4\n    elf_m_hit_anim 256 36 16 28 1\n\n    knight_f_idle_anim 128 68 16 28 4\n    knight_f_run_anim 192 68 16 28 4\n    knight_f_hit_anim 256 68 16 28 1\n\n    knight_m_idle_anim 128 100 16 28 4\n    knight_m_run_anim 192 100 16 28 4\n    knight_m_hit_anim 256 100 16 28 1\n\n    wizzard_f_idle_anim 128 132 16 28 4\n    wizzard_f_run_anim 192 132 16 28 4\n    wizzard_f_hit_anim 256 132 16 28 1\n\n    wizzard_m_idle_anim 128 164 16 28 4\n    wizzard_m_run_anim 192 164 16 28 4\n    wizzard_m_hit_anim 256 164 16 28 1\n\n    lizard_f_idle_anim 128 196 16 28 4\n    lizard_f_run_anim 192 196 16 28 4\n    lizard_f_hit_anim 256 196 16 28 1\n\n    lizard_m_idle_anim 128 228 16 28 4\n    lizard_m_run_anim 192 228 16 28 4\n    lizard_m_hit_anim 256 228 16 28 1\n    ".split("\n")
                .map(function (line) { return line.trim(); })
                .filter(function (line) { return !!line; })
                .map(function (line) { return line.split(" "); })
                .map(function (cols) { return [cols[0], cols.slice(1)]; }));
            /**
             * A custom tile loader for the special string-based format
             */
            DungeonTilesetII = /** @class */ (function () {
                function DungeonTilesetII() {
                }
                DungeonTilesetII.prototype.getTileSource = function (key) {
                    var row = map.get(key);
                    if ((row === null || row === void 0 ? void 0 : row.length) != 4) {
                        throw Error("invalid tile spec");
                    }
                    var pos = new point_14.Point(+row[0], +row[1]);
                    var dim = new point_14.Point(+row[2], +row[3]);
                    return new StaticTileSource_2.StaticTileSource(this.getFile(), pos, dim);
                };
                DungeonTilesetII.prototype.getTileSetAnimation = function (key, speed) {
                    var _this = this;
                    var row = map.get(key);
                    if ((row === null || row === void 0 ? void 0 : row.length) != 5) {
                        throw Error("invalid animation spec");
                    }
                    var frames = Array.from({ length: +row[4] }, function (value, key) { return key; })
                        .map(function (frameIndex) {
                        var pos = new point_14.Point(+row[0] + frameIndex * +row[2], +row[1]);
                        var dim = new point_14.Point(+row[2], +row[3]);
                        return new StaticTileSource_2.StaticTileSource(_this.getFile(), pos, dim);
                    })
                        .map(function (tileSource) { return [tileSource, speed]; });
                    return new TileSetAnimation_2.TileSetAnimation(frames);
                };
                DungeonTilesetII.prototype.getFile = function () {
                    return Assets_2.assets.getImageByFileName("images/dungeon_base.png");
                };
                return DungeonTilesetII;
            }());
            exports_34("DungeonTilesetII", DungeonTilesetII);
        }
    };
});
System.register("game/graphics/SplitFileTileLoader", ["engine/tiles/StaticTileSource", "engine/Assets", "engine/point"], function (exports_35, context_35) {
    "use strict";
    var StaticTileSource_3, Assets_3, point_15, SplitFileTileLoader;
    var __moduleName = context_35 && context_35.id;
    return {
        setters: [
            function (StaticTileSource_3_1) {
                StaticTileSource_3 = StaticTileSource_3_1;
            },
            function (Assets_3_1) {
                Assets_3 = Assets_3_1;
            },
            function (point_15_1) {
                point_15 = point_15_1;
            }
        ],
        execute: function () {
            SplitFileTileLoader = /** @class */ (function () {
                function SplitFileTileLoader(dirPath) {
                    this.dirPath = dirPath;
                }
                SplitFileTileLoader.prototype.getTileSource = function (key) {
                    var image = Assets_3.assets.getImageByFileName(this.dirPath + "/" + key + ".png");
                    if (!!image) {
                        return null;
                    }
                    return new StaticTileSource_3.StaticTileSource(image, new point_15.Point(image.width, image.height), new point_15.Point(0, 0));
                };
                SplitFileTileLoader.prototype.getTileSetAnimation = function (key, speed) {
                    throw new Error("Method not implemented.");
                };
                return SplitFileTileLoader;
            }());
            exports_35("SplitFileTileLoader", SplitFileTileLoader);
        }
    };
});
System.register("game/graphics/OneBitTileset", ["engine/point", "game/graphics/SingleFileTileLoader"], function (exports_36, context_36) {
    "use strict";
    var point_16, SingleFileTileLoader_1, OneBitTileset;
    var __moduleName = context_36 && context_36.id;
    return {
        setters: [
            function (point_16_1) {
                point_16 = point_16_1;
            },
            function (SingleFileTileLoader_1_1) {
                SingleFileTileLoader_1 = SingleFileTileLoader_1_1;
            }
        ],
        execute: function () {
            OneBitTileset = /** @class */ (function (_super) {
                __extends(OneBitTileset, _super);
                function OneBitTileset() {
                    return _super.call(this, "images/monochrome_transparent_1_bit.png", new Map([
                        ["slash", new point_16.Point(25, 11)],
                        [" ", new point_16.Point(0, 0)],
                        ["0", new point_16.Point(19, 29)],
                        ["1", new point_16.Point(20, 29)],
                        ["2", new point_16.Point(21, 29)],
                        ["3", new point_16.Point(22, 29)],
                        ["4", new point_16.Point(23, 29)],
                        ["5", new point_16.Point(24, 29)],
                        ["6", new point_16.Point(25, 29)],
                        ["7", new point_16.Point(26, 29)],
                        ["8", new point_16.Point(27, 29)],
                        ["9", new point_16.Point(28, 29)],
                        [":", new point_16.Point(29, 29)],
                        [".", new point_16.Point(30, 29)],
                        ["%", new point_16.Point(31, 29)],
                        ["!", new point_16.Point(19, 25)],
                        ["?", new point_16.Point(21, 25)],
                        ["$", new point_16.Point(19, 28)],
                        ["a", new point_16.Point(19, 30)],
                        ["b", new point_16.Point(20, 30)],
                        ["c", new point_16.Point(21, 30)],
                        ["d", new point_16.Point(22, 30)],
                        ["e", new point_16.Point(23, 30)],
                        ["f", new point_16.Point(24, 30)],
                        ["g", new point_16.Point(25, 30)],
                        ["h", new point_16.Point(26, 30)],
                        ["i", new point_16.Point(27, 30)],
                        ["j", new point_16.Point(28, 30)],
                        ["k", new point_16.Point(29, 30)],
                        ["l", new point_16.Point(30, 30)],
                        ["m", new point_16.Point(31, 30)],
                        ["n", new point_16.Point(19, 31)],
                        ["o", new point_16.Point(20, 31)],
                        ["p", new point_16.Point(21, 31)],
                        ["q", new point_16.Point(22, 31)],
                        ["r", new point_16.Point(23, 31)],
                        ["s", new point_16.Point(24, 31)],
                        ["t", new point_16.Point(25, 31)],
                        ["u", new point_16.Point(26, 31)],
                        ["v", new point_16.Point(27, 31)],
                        ["w", new point_16.Point(28, 31)],
                        ["x", new point_16.Point(29, 31)],
                        ["y", new point_16.Point(30, 31)],
                        ["z", new point_16.Point(31, 31)]
                    ])) || this;
                }
                return OneBitTileset;
            }(SingleFileTileLoader_1.SingleFileTileLoader));
            exports_36("OneBitTileset", OneBitTileset);
        }
    };
});
System.register("game/graphics/OutdoorTileset", ["engine/point", "game/graphics/SingleFileTileLoader"], function (exports_37, context_37) {
    "use strict";
    var point_17, SingleFileTileLoader_2, OutdoorTileset;
    var __moduleName = context_37 && context_37.id;
    return {
        setters: [
            function (point_17_1) {
                point_17 = point_17_1;
            },
            function (SingleFileTileLoader_2_1) {
                SingleFileTileLoader_2 = SingleFileTileLoader_2_1;
            }
        ],
        execute: function () {
            OutdoorTileset = /** @class */ (function (_super) {
                __extends(OutdoorTileset, _super);
                function OutdoorTileset() {
                    return _super.call(this, "images/env_outdoor_recolor.png", new Map([
                        ["tree1base", new point_17.Point(15, 11)],
                        ["tree1top", new point_17.Point(15, 10)],
                        ["tree2base", new point_17.Point(18, 11)],
                        ["tree2top", new point_17.Point(18, 10)],
                        ["redtentNW", new point_17.Point(46, 10)],
                        ["redtentNE", new point_17.Point(47, 10)],
                        ["redtentSW", new point_17.Point(46, 11)],
                        ["redtentSE", new point_17.Point(47, 11)],
                        ["bluetentNW", new point_17.Point(48, 10)],
                        ["bluetentNE", new point_17.Point(49, 10)],
                        ["bluetentSW", new point_17.Point(48, 11)],
                        ["bluetentSE", new point_17.Point(49, 11)],
                        ["campfireOff", new point_17.Point(13, 8)],
                        ["campfireOn", new point_17.Point(14, 8)],
                        ["rock1", new point_17.Point(54, 21)],
                        ["rock2", new point_17.Point(55, 21)],
                        ["rock3", new point_17.Point(56, 21)],
                        ["rock1mossy", new point_17.Point(54, 22)],
                        ["rock2mossy", new point_17.Point(55, 22)],
                        ["rock3mossy", new point_17.Point(56, 22)],
                        ["rockItem", new point_17.Point(33, 9)],
                        ["woodItem", new point_17.Point(34, 9)],
                    ])) || this;
                }
                return OutdoorTileset;
            }(SingleFileTileLoader_2.SingleFileTileLoader));
            exports_37("OutdoorTileset", OutdoorTileset);
        }
    };
});
System.register("game/graphics/Tilesets", ["game/graphics/SingleFileTileLoader", "game/graphics/DungeonTilesetII", "game/graphics/SplitFileTileLoader", "game/graphics/OneBitTileset", "game/graphics/OutdoorTileset"], function (exports_38, context_38) {
    "use strict";
    var SingleFileTileLoader_3, DungeonTilesetII_1, SplitFileTileLoader_1, OneBitTileset_1, OutdoorTileset_1, TILE_SIZE, Tilesets;
    var __moduleName = context_38 && context_38.id;
    return {
        setters: [
            function (SingleFileTileLoader_3_1) {
                SingleFileTileLoader_3 = SingleFileTileLoader_3_1;
            },
            function (DungeonTilesetII_1_1) {
                DungeonTilesetII_1 = DungeonTilesetII_1_1;
            },
            function (SplitFileTileLoader_1_1) {
                SplitFileTileLoader_1 = SplitFileTileLoader_1_1;
            },
            function (OneBitTileset_1_1) {
                OneBitTileset_1 = OneBitTileset_1_1;
            },
            function (OutdoorTileset_1_1) {
                OutdoorTileset_1 = OutdoorTileset_1_1;
            }
        ],
        execute: function () {
            // standard tile size
            exports_38("TILE_SIZE", TILE_SIZE = 16);
            /**
             * Manages different tile sources
             */
            Tilesets = /** @class */ (function () {
                function Tilesets() {
                    this.dungeonCharacters = new DungeonTilesetII_1.DungeonTilesetII();
                    this.tilemap = new SingleFileTileLoader_3.SingleFileTileLoader("images/tilemap.png");
                    this.dungeonTiles = new SingleFileTileLoader_3.SingleFileTileLoader("images/env_dungeon.png");
                    this.indoorTiles = new SingleFileTileLoader_3.SingleFileTileLoader("images/env_indoor.png");
                    this.outdoorTiles = new OutdoorTileset_1.OutdoorTileset();
                    this.oneBit = new OneBitTileset_1.OneBitTileset();
                    this.otherCharacters = new SplitFileTileLoader_1.SplitFileTileLoader("images/individual_characters");
                    Tilesets.instance = this;
                }
                // loaded before the engine starts running the game
                Tilesets.getFilesToLoad = function () {
                    return [
                        "images/monochrome_transparent_1_bit.png",
                        "images/dungeon_base.png",
                        "images/env_dungeon.png",
                        "images/env_indoor.png",
                        "images/env_outdoor.png",
                        "images/env_outdoor_recolor.png",
                        "images/tilemap.png",
                        "images/individual_characters/Alchemist_Idle_1.png",
                        "images/individual_characters/Alchemist_Idle_2.png",
                        "images/individual_characters/Alchemist_Idle_3.png",
                        "images/individual_characters/Alchemist_Idle_4.png",
                        "images/individual_characters/Alchemist_Walk_1.png",
                        "images/individual_characters/Alchemist_Walk_2.png",
                        "images/individual_characters/Alchemist_Walk_3.png",
                        "images/individual_characters/Alchemist_Walk_4.png",
                        "images/individual_characters/Archer_Idle_1.png",
                        "images/individual_characters/Archer_Idle_2.png",
                        "images/individual_characters/Archer_Idle_3.png",
                        "images/individual_characters/Archer_Idle_4.png",
                        "images/individual_characters/Archer_Walk_1.png",
                        "images/individual_characters/Archer_Walk_2.png",
                        "images/individual_characters/Archer_Walk_3.png",
                        "images/individual_characters/Archer_Walk_4.png",
                        "images/individual_characters/Bandit_Idle_1.png",
                        "images/individual_characters/Bandit_Idle_2.png",
                        "images/individual_characters/Bandit_Idle_3.png",
                        "images/individual_characters/Bandit_Idle_4.png",
                        "images/individual_characters/Bandit_Walk_1.png",
                        "images/individual_characters/Bandit_Walk_2.png",
                        "images/individual_characters/Bandit_Walk_3.png",
                        "images/individual_characters/Bandit_Walk_4.png",
                        "images/individual_characters/Bear_Idle_1.png",
                        "images/individual_characters/Bear_Idle_2.png",
                        "images/individual_characters/Bear_Idle_3.png",
                        "images/individual_characters/Bear_Idle_4.png",
                        "images/individual_characters/Bear_Walk_1.png",
                        "images/individual_characters/Bear_Walk_2.png",
                        "images/individual_characters/Bear_Walk_3.png",
                        "images/individual_characters/Bear_Walk_4.png",
                        "images/individual_characters/Bishop_Idle + Walk_1.png",
                        "images/individual_characters/Bishop_Idle + Walk_2.png",
                        "images/individual_characters/Bishop_Idle + Walk_3.png",
                        "images/individual_characters/Bishop_Idle + Walk_4.png",
                        "images/individual_characters/Blacksmith_Idle_1.png",
                        "images/individual_characters/Blacksmith_Idle_2.png",
                        "images/individual_characters/Blacksmith_Idle_3.png",
                        "images/individual_characters/Blacksmith_Idle_4.png",
                        "images/individual_characters/Blacksmith_Walk_1.png",
                        "images/individual_characters/Blacksmith_Walk_2.png",
                        "images/individual_characters/Blacksmith_Walk_3.png",
                        "images/individual_characters/Blacksmith_Walk_4.png",
                        "images/individual_characters/Butcher_Idle_1.png",
                        "images/individual_characters/Butcher_Idle_2.png",
                        "images/individual_characters/Butcher_Idle_3.png",
                        "images/individual_characters/Butcher_Idle_4.png",
                        "images/individual_characters/Butcher_Walk_1.png",
                        "images/individual_characters/Butcher_Walk_2.png",
                        "images/individual_characters/Butcher_Walk_3.png",
                        "images/individual_characters/Butcher_Walk_4.png",
                        "images/individual_characters/Centaur_F_Idle_1.png",
                        "images/individual_characters/Centaur_F_Idle_2.png",
                        "images/individual_characters/Centaur_F_Idle_3.png",
                        "images/individual_characters/Centaur_F_Idle_4.png",
                        "images/individual_characters/Centaur_F_Walk_1.png",
                        "images/individual_characters/Centaur_F_Walk_2.png",
                        "images/individual_characters/Centaur_F_Walk_3.png",
                        "images/individual_characters/Centaur_F_Walk_4.png",
                        "images/individual_characters/Centaur_M_Idle_1.png",
                        "images/individual_characters/Centaur_M_Idle_2.png",
                        "images/individual_characters/Centaur_M_Idle_3.png",
                        "images/individual_characters/Centaur_M_Idle_4.png",
                        "images/individual_characters/Centaur_M_Walk_1.png",
                        "images/individual_characters/Centaur_M_Walk_2.png",
                        "images/individual_characters/Centaur_M_Walk_3.png",
                        "images/individual_characters/Centaur_M_Walk_4.png",
                        "images/individual_characters/Elf_F_Idle_1.png",
                        "images/individual_characters/Elf_F_Idle_2.png",
                        "images/individual_characters/Elf_F_Idle_3.png",
                        "images/individual_characters/Elf_F_Idle_4.png",
                        "images/individual_characters/Elf_F_Walk_1.png",
                        "images/individual_characters/Elf_F_Walk_2.png",
                        "images/individual_characters/Elf_F_Walk_3.png",
                        "images/individual_characters/Elf_F_Walk_4.png",
                        "images/individual_characters/Elf_M_Idle_1.png",
                        "images/individual_characters/Elf_M_Idle_2.png",
                        "images/individual_characters/Elf_M_Idle_3.png",
                        "images/individual_characters/Elf_M_Idle_4.png",
                        "images/individual_characters/Elf_M_Walk_1.png",
                        "images/individual_characters/Elf_M_Walk_2.png",
                        "images/individual_characters/Elf_M_Walk_3.png",
                        "images/individual_characters/Elf_M_Walk_4.png",
                        "images/individual_characters/EliteKnight_Idle_1.png",
                        "images/individual_characters/EliteKnight_Idle_2.png",
                        "images/individual_characters/EliteKnight_Idle_3.png",
                        "images/individual_characters/EliteKnight_Idle_4.png",
                        "images/individual_characters/EliteKnight_Walk_1.png",
                        "images/individual_characters/EliteKnight_Walk_2.png",
                        "images/individual_characters/EliteKnight_Walk_3.png",
                        "images/individual_characters/EliteKnight_Walk_4.png",
                        "images/individual_characters/ElvenKnight_Idle_1.png",
                        "images/individual_characters/ElvenKnight_Idle_2.png",
                        "images/individual_characters/ElvenKnight_Idle_3.png",
                        "images/individual_characters/ElvenKnight_Idle_4.png",
                        "images/individual_characters/ElvenKnight_Walk_1.png",
                        "images/individual_characters/ElvenKnight_Walk_2.png",
                        "images/individual_characters/ElvenKnight_Walk_3.png",
                        "images/individual_characters/ElvenKnight_Walk_4.png",
                        "images/individual_characters/Ent_Idle_1.png",
                        "images/individual_characters/Ent_Idle_2.png",
                        "images/individual_characters/Ent_Idle_3.png",
                        "images/individual_characters/Ent_Idle_4.png",
                        "images/individual_characters/Ent_Walk_1.png",
                        "images/individual_characters/Ent_Walk_2.png",
                        "images/individual_characters/Ent_Walk_3.png",
                        "images/individual_characters/Ent_Walk_4.png",
                        "images/individual_characters/Executioner_Idle_1.png",
                        "images/individual_characters/Executioner_Idle_2.png",
                        "images/individual_characters/Executioner_Idle_3.png",
                        "images/individual_characters/Executioner_Idle_4.png",
                        "images/individual_characters/Executioner_Walk_1.png",
                        "images/individual_characters/Executioner_Walk_2.png",
                        "images/individual_characters/Executioner_Walk_3.png",
                        "images/individual_characters/Executioner_Walk_4.png",
                        "images/individual_characters/Fairy_Idle + Walk_1.png",
                        "images/individual_characters/Fairy_Idle + Walk_2.png",
                        "images/individual_characters/Fairy_Idle + Walk_3.png",
                        "images/individual_characters/Fairy_Idle + Walk_4.png",
                        "images/individual_characters/FatCleric_Idle + Walk_1.png",
                        "images/individual_characters/FatCleric_Idle + Walk_2.png",
                        "images/individual_characters/FatCleric_Idle + Walk_3.png",
                        "images/individual_characters/FatCleric_Idle + Walk_4.png",
                        "images/individual_characters/FatNun_Idle + Walk_1.png",
                        "images/individual_characters/FatNun_Idle + Walk_2.png",
                        "images/individual_characters/FatNun_Idle + Walk_3.png",
                        "images/individual_characters/FatNun_Idle + Walk_4.png",
                        "images/individual_characters/ForestGuardian_Idle_1.png",
                        "images/individual_characters/ForestGuardian_Idle_2.png",
                        "images/individual_characters/ForestGuardian_Idle_3.png",
                        "images/individual_characters/ForestGuardian_Idle_4.png",
                        "images/individual_characters/ForestGuardian_walk_1.png",
                        "images/individual_characters/ForestGuardian_walk_2.png",
                        "images/individual_characters/ForestGuardian_walk_3.png",
                        "images/individual_characters/ForestGuardian_walk_4.png",
                        "images/individual_characters/GnollBrute_Idle_1.png",
                        "images/individual_characters/GnollBrute_Idle_2.png",
                        "images/individual_characters/GnollBrute_Idle_3.png",
                        "images/individual_characters/GnollBrute_Idle_4.png",
                        "images/individual_characters/GnollBrute_Walk_1.png",
                        "images/individual_characters/GnollBrute_Walk_2.png",
                        "images/individual_characters/GnollBrute_Walk_3.png",
                        "images/individual_characters/GnollBrute_Walk_4.png",
                        "images/individual_characters/GnollOverseer_Idle_1.png",
                        "images/individual_characters/GnollOverseer_Idle_2.png",
                        "images/individual_characters/GnollOverseer_Idle_3.png",
                        "images/individual_characters/GnollOverseer_Idle_4.png",
                        "images/individual_characters/GnollOverseer_Walk_1.png",
                        "images/individual_characters/GnollOverseer_Walk_2.png",
                        "images/individual_characters/GnollOverseer_Walk_3.png",
                        "images/individual_characters/GnollOverseer_Walk_4.png",
                        "images/individual_characters/GnollScout_Idle_1.png",
                        "images/individual_characters/GnollScout_Idle_2.png",
                        "images/individual_characters/GnollScout_Idle_3.png",
                        "images/individual_characters/GnollScout_Idle_4.png",
                        "images/individual_characters/GnollScout_Walk_1.png",
                        "images/individual_characters/GnollScout_Walk_2.png",
                        "images/individual_characters/GnollScout_Walk_3.png",
                        "images/individual_characters/GnollScout_Walk_4.png",
                        "images/individual_characters/GnollShaman_Idle_1.png",
                        "images/individual_characters/GnollShaman_Idle_2.png",
                        "images/individual_characters/GnollShaman_Idle_3.png",
                        "images/individual_characters/GnollShaman_Idle_4.png",
                        "images/individual_characters/GnollShaman_Walk_1.png",
                        "images/individual_characters/GnollShaman_Walk_2.png",
                        "images/individual_characters/GnollShaman_Walk_3.png",
                        "images/individual_characters/GnollShaman_Walk_4.png",
                        "images/individual_characters/Golem_Idle_1.png",
                        "images/individual_characters/Golem_Idle_2.png",
                        "images/individual_characters/Golem_Idle_3.png",
                        "images/individual_characters/Golem_Idle_4.png",
                        "images/individual_characters/Golem_Idle_5.png",
                        "images/individual_characters/Golem_Idle_6.png",
                        "images/individual_characters/Golem_Walk_1.png",
                        "images/individual_characters/Golem_Walk_2.png",
                        "images/individual_characters/Golem_Walk_3.png",
                        "images/individual_characters/Golem_Walk_4.png",
                        "images/individual_characters/Golem_Walk_5.png",
                        "images/individual_characters/Golem_Walk_6.png",
                        "images/individual_characters/HeavyKnight_Idle_1.png",
                        "images/individual_characters/HeavyKnight_Idle_2.png",
                        "images/individual_characters/HeavyKnight_Idle_3.png",
                        "images/individual_characters/HeavyKnight_Idle_4.png",
                        "images/individual_characters/HeavyKnight_Walk_1.png",
                        "images/individual_characters/HeavyKnight_Walk_2.png",
                        "images/individual_characters/HeavyKnight_Walk_3.png",
                        "images/individual_characters/HeavyKnight_Walk_4.png",
                        "images/individual_characters/Herald_Idle_1.png",
                        "images/individual_characters/Herald_Idle_2.png",
                        "images/individual_characters/Herald_Idle_3.png",
                        "images/individual_characters/Herald_Idle_4.png",
                        "images/individual_characters/Herald_Walk_1.png",
                        "images/individual_characters/Herald_Walk_2.png",
                        "images/individual_characters/Herald_Walk_3.png",
                        "images/individual_characters/Herald_Walk_4.png",
                        "images/individual_characters/HighElf_F_Idle_1.png",
                        "images/individual_characters/HighElf_F_Idle_2.png",
                        "images/individual_characters/HighElf_F_Idle_3.png",
                        "images/individual_characters/HighElf_F_Idle_4.png",
                        "images/individual_characters/HighElf_F_Walk_1.png",
                        "images/individual_characters/HighElf_F_Walk_2.png",
                        "images/individual_characters/HighElf_F_Walk_3.png",
                        "images/individual_characters/HighElf_F_Walk_4.png",
                        "images/individual_characters/HighElf_M_Idle + Walk_1.png",
                        "images/individual_characters/HighElf_M_Idle + Walk_2.png",
                        "images/individual_characters/HighElf_M_Idle + Walk_3.png",
                        "images/individual_characters/HighElf_M_Idle + Walk_4.png",
                        "images/individual_characters/King_Idle_1.png",
                        "images/individual_characters/King_Idle_2.png",
                        "images/individual_characters/King_Idle_3.png",
                        "images/individual_characters/King_Idle_4.png",
                        "images/individual_characters/King_Walk_1.png",
                        "images/individual_characters/King_Walk_2.png",
                        "images/individual_characters/King_Walk_3.png",
                        "images/individual_characters/King_Walk_4.png",
                        "images/individual_characters/Knight_Idle_1.png",
                        "images/individual_characters/Knight_Idle_2.png",
                        "images/individual_characters/Knight_Idle_3.png",
                        "images/individual_characters/Knight_Idle_4.png",
                        "images/individual_characters/Knight_Walk_1.png",
                        "images/individual_characters/Knight_Walk_2.png",
                        "images/individual_characters/Knight_Walk_3.png",
                        "images/individual_characters/Knight_Walk_4.png",
                        "images/individual_characters/LargeEliteKnight_Idle_1.png",
                        "images/individual_characters/LargeEliteKnight_Idle_2.png",
                        "images/individual_characters/LargeEliteKnight_Idle_3.png",
                        "images/individual_characters/LargeEliteKnight_Idle_4.png",
                        "images/individual_characters/LargeEliteKnight_Walk_1.png",
                        "images/individual_characters/LargeEliteKnight_Walk_2.png",
                        "images/individual_characters/LargeEliteKnight_Walk_3.png",
                        "images/individual_characters/LargeEliteKnight_Walk_4.png",
                        "images/individual_characters/LargeKnight_Idle_1.png",
                        "images/individual_characters/LargeKnight_Idle_2.png",
                        "images/individual_characters/LargeKnight_Idle_3.png",
                        "images/individual_characters/LargeKnight_Idle_4.png",
                        "images/individual_characters/LargeKnight_Walk_1.png",
                        "images/individual_characters/LargeKnight_Walk_2.png",
                        "images/individual_characters/LargeKnight_Walk_3.png",
                        "images/individual_characters/LargeKnight_Walk_4.png",
                        "images/individual_characters/LargeMushroom_Idle_1.png",
                        "images/individual_characters/LargeMushroom_Idle_2.png",
                        "images/individual_characters/LargeMushroom_Idle_3.png",
                        "images/individual_characters/LargeMushroom_Idle_4.png",
                        "images/individual_characters/LargeMushroom_Walk_1.png",
                        "images/individual_characters/LargeMushroom_Walk_2.png",
                        "images/individual_characters/LargeMushroom_Walk_3.png",
                        "images/individual_characters/LargeMushroom_Walk_4.png",
                        "images/individual_characters/Mage_Idle_1.png",
                        "images/individual_characters/Mage_Idle_2.png",
                        "images/individual_characters/Mage_Idle_3.png",
                        "images/individual_characters/Mage_Idle_4.png",
                        "images/individual_characters/Mage_Walk_1.png",
                        "images/individual_characters/Mage_Walk_2.png",
                        "images/individual_characters/Mage_Walk_3.png",
                        "images/individual_characters/Mage_Walk_4.png",
                        "images/individual_characters/MagicShopKeeper_Idle + Walk_1.png",
                        "images/individual_characters/MagicShopKeeper_Idle + Walk_2.png",
                        "images/individual_characters/MagicShopKeeper_Idle + Walk_3.png",
                        "images/individual_characters/MagicShopKeeper_Idle + Walk_4.png",
                        "images/individual_characters/Merchant_Idle_1.png",
                        "images/individual_characters/Merchant_Idle_2.png",
                        "images/individual_characters/Merchant_Idle_3.png",
                        "images/individual_characters/Merchant_Idle_4.png",
                        "images/individual_characters/Merchant_Walk_1.png",
                        "images/individual_characters/Merchant_Walk_2.png",
                        "images/individual_characters/Merchant_Walk_3.png",
                        "images/individual_characters/Merchant_Walk_4.png",
                        "images/individual_characters/MountainKing_Idle + Walk_1.png",
                        "images/individual_characters/MountainKing_Idle + Walk_2.png",
                        "images/individual_characters/MountainKing_Idle + Walk_3.png",
                        "images/individual_characters/MountainKing_Idle + Walk_4.png",
                        "images/individual_characters/NormalCleric_Idle + Walk_1.png",
                        "images/individual_characters/NormalCleric_Idle + Walk_2.png",
                        "images/individual_characters/NormalCleric_Idle + Walk_3.png",
                        "images/individual_characters/NormalCleric_Idle + Walk_4.png",
                        "images/individual_characters/NormalMushroom_Idle_1.png",
                        "images/individual_characters/NormalMushroom_Idle_2.png",
                        "images/individual_characters/NormalMushroom_Idle_3.png",
                        "images/individual_characters/NormalMushroom_Idle_4.png",
                        "images/individual_characters/NormalMushroom_Walk_1.png",
                        "images/individual_characters/NormalMushroom_Walk_2.png",
                        "images/individual_characters/NormalMushroom_Walk_3.png",
                        "images/individual_characters/NormalMushroom_Walk_4.png",
                        "images/individual_characters/NormalNun_Idle + Walk_1.png",
                        "images/individual_characters/NormalNun_Idle + Walk_2.png",
                        "images/individual_characters/NormalNun_Idle + Walk_3.png",
                        "images/individual_characters/NormalNun_Idle + Walk_4.png",
                        "images/individual_characters/Princess_Idle_1.png",
                        "images/individual_characters/Princess_Idle_2.png",
                        "images/individual_characters/Princess_Idle_3.png",
                        "images/individual_characters/Princess_Idle_4.png",
                        "images/individual_characters/Princess_Walk_1.png",
                        "images/individual_characters/Princess_Walk_2.png",
                        "images/individual_characters/Princess_Walk_3.png",
                        "images/individual_characters/Princess_Walk_4.png",
                        "images/individual_characters/Queen_Idle_1.png",
                        "images/individual_characters/Queen_Idle_2.png",
                        "images/individual_characters/Queen_Idle_3.png",
                        "images/individual_characters/Queen_Idle_4.png",
                        "images/individual_characters/Queen_Walk_1.png",
                        "images/individual_characters/Queen_Walk_2.png",
                        "images/individual_characters/Queen_Walk_3.png",
                        "images/individual_characters/Queen_Walk_4.png",
                        "images/individual_characters/Ranger_Idle_1.png",
                        "images/individual_characters/Ranger_Idle_2.png",
                        "images/individual_characters/Ranger_Idle_3.png",
                        "images/individual_characters/Ranger_Idle_4.png",
                        "images/individual_characters/Ranger_Walk_1.png",
                        "images/individual_characters/Ranger_Walk_2.png",
                        "images/individual_characters/Ranger_Walk_3.png",
                        "images/individual_characters/Ranger_Walk_4.png",
                        "images/individual_characters/SkinnyNun_Idle + Walk_1.png",
                        "images/individual_characters/SkinnyNun_Idle + Walk_2.png",
                        "images/individual_characters/SkinnyNun_Idle + Walk_3.png",
                        "images/individual_characters/SkinnyNun_Idle + Walk_4.png",
                        "images/individual_characters/SmallMushroom_Idle_1.png",
                        "images/individual_characters/SmallMushroom_Idle_2.png",
                        "images/individual_characters/SmallMushroom_Idle_3.png",
                        "images/individual_characters/SmallMushroom_Idle_4.png",
                        "images/individual_characters/SmallMushroom_Walk_1.png",
                        "images/individual_characters/SmallMushroom_Walk_2.png",
                        "images/individual_characters/SmallMushroom_Walk_3.png",
                        "images/individual_characters/SmallMushroom_Walk_4.png",
                        "images/individual_characters/TallCleric_Idle + Walk_1.png",
                        "images/individual_characters/TallCleric_Idle + Walk_2.png",
                        "images/individual_characters/TallCleric_Idle + Walk_3.png",
                        "images/individual_characters/TallCleric_Idle + Walk_4.png",
                        "images/individual_characters/Thief_Idle_1.png",
                        "images/individual_characters/Thief_Idle_2.png",
                        "images/individual_characters/Thief_Idle_3.png",
                        "images/individual_characters/Thief_Idle_4.png",
                        "images/individual_characters/Thief_Walk_1.png",
                        "images/individual_characters/Thief_Walk_2.png",
                        "images/individual_characters/Thief_Walk_3.png",
                        "images/individual_characters/Thief_Walk_4.png",
                        "images/individual_characters/Townsfolk_F_Idle_1.png",
                        "images/individual_characters/Townsfolk_F_Idle_2.png",
                        "images/individual_characters/Townsfolk_F_Idle_3.png",
                        "images/individual_characters/Townsfolk_F_Idle_4.png",
                        "images/individual_characters/Townsfolk_F_Walk_1.png",
                        "images/individual_characters/Townsfolk_F_Walk_2.png",
                        "images/individual_characters/Townsfolk_F_Walk_3.png",
                        "images/individual_characters/Townsfolk_F_Walk_4.png",
                        "images/individual_characters/Troll_Idle_1.png",
                        "images/individual_characters/Troll_Idle_2.png",
                        "images/individual_characters/Troll_Idle_3.png",
                        "images/individual_characters/Troll_Idle_4.png",
                        "images/individual_characters/Troll_Walk_1.png",
                        "images/individual_characters/Troll_Walk_2.png",
                        "images/individual_characters/Troll_Walk_3.png",
                        "images/individual_characters/Troll_Walk_4.png",
                        "images/individual_characters/Wizard_Idle + Walk_1.png",
                        "images/individual_characters/Wizard_Idle + Walk_2.png",
                        "images/individual_characters/Wizard_Idle + Walk_3.png",
                        "images/individual_characters/Wizard_Idle + Walk_4.png",
                        "images/individual_characters/Wolf_Idle_1.png",
                        "images/individual_characters/Wolf_Idle_2.png",
                        "images/individual_characters/Wolf_Idle_3.png",
                        "images/individual_characters/Wolf_Idle_4.png",
                        "images/individual_characters/Wolf_Walk_1.png",
                        "images/individual_characters/Wolf_Walk_2.png",
                        "images/individual_characters/Wolf_Walk_3.png",
                        "images/individual_characters/Wolf_Walk_4.png",
                    ];
                };
                return Tilesets;
            }());
            exports_38("Tilesets", Tilesets);
        }
    };
});
System.register("game/world/WorldLocation", ["engine/util/Grid"], function (exports_39, context_39) {
    "use strict";
    var Grid_1, WorldLocation;
    var __moduleName = context_39 && context_39.id;
    return {
        setters: [
            function (Grid_1_1) {
                Grid_1 = Grid_1_1;
            }
        ],
        execute: function () {
            WorldLocation = /** @class */ (function () {
                function WorldLocation() {
                    // Non-moving entities with tile coords (not pixel coords)
                    // Entities may be duplicated in multiple spots 
                    // (entities spawning multiple tiles eg a tent)
                    // BUT an entity should only be in one of these data structures
                    this.ground = new Grid_1.Grid();
                    this.stuff = new Grid_1.Grid();
                    // Entities with a dynamic position
                    this.dynamic = new Set();
                }
                WorldLocation.prototype.getEntities = function () {
                    return Array.from(new Set(this.ground.entries()))
                        .concat(Array.from(new Set(this.stuff.entries())))
                        .concat(Array.from(this.dynamic));
                };
                return WorldLocation;
            }());
            exports_39("WorldLocation", WorldLocation);
        }
    };
});
System.register("game/world/elements/Interactable", ["engine/component"], function (exports_40, context_40) {
    "use strict";
    var component_5, Interactable;
    var __moduleName = context_40 && context_40.id;
    return {
        setters: [
            function (component_5_1) {
                component_5 = component_5_1;
            }
        ],
        execute: function () {
            Interactable = /** @class */ (function (_super) {
                __extends(Interactable, _super);
                function Interactable(position, fn) {
                    var _this = _super.call(this) || this;
                    _this.position = position;
                    _this.interact = fn;
                    return _this;
                }
                Interactable.prototype.interact = function () { };
                return Interactable;
            }(component_5.Component));
            exports_40("Interactable", Interactable);
        }
    };
});
System.register("game/world/elements/Campfire", ["engine/component", "engine/tiles/TileComponent", "engine/tiles/AnimatedTileComponent", "game/graphics/Tilesets", "engine/tiles/TileTransform", "engine/point", "game/world/elements/Interactable", "engine/collision/BoxCollider"], function (exports_41, context_41) {
    "use strict";
    var component_6, TileComponent_3, AnimatedTileComponent_2, Tilesets_1, TileTransform_4, point_18, Interactable_1, BoxCollider_1, Campfire;
    var __moduleName = context_41 && context_41.id;
    return {
        setters: [
            function (component_6_1) {
                component_6 = component_6_1;
            },
            function (TileComponent_3_1) {
                TileComponent_3 = TileComponent_3_1;
            },
            function (AnimatedTileComponent_2_1) {
                AnimatedTileComponent_2 = AnimatedTileComponent_2_1;
            },
            function (Tilesets_1_1) {
                Tilesets_1 = Tilesets_1_1;
            },
            function (TileTransform_4_1) {
                TileTransform_4 = TileTransform_4_1;
            },
            function (point_18_1) {
                point_18 = point_18_1;
            },
            function (Interactable_1_1) {
                Interactable_1 = Interactable_1_1;
            },
            function (BoxCollider_1_1) {
                BoxCollider_1 = BoxCollider_1_1;
            }
        ],
        execute: function () {
            Campfire = /** @class */ (function (_super) {
                __extends(Campfire, _super);
                /**
                 * @param pos relative tile point
                 */
                function Campfire(pos) {
                    var _this = _super.call(this) || this;
                    _this.start = function () {
                        pos = pos.times(Tilesets_1.TILE_SIZE);
                        _this.campfireOff = _this.entity.addComponent(new TileComponent_3.TileComponent(Tilesets_1.Tilesets.instance.outdoorTiles.getTileSource("campfireOff"), new TileTransform_4.TileTransform(pos)));
                        _this.campfireOff.enabled = false;
                        _this.campfireOff.transform.depth = pos.y + Tilesets_1.TILE_SIZE;
                        _this.campfireOn = _this.entity.addComponent(new AnimatedTileComponent_2.AnimatedTileComponent([Tilesets_1.Tilesets.instance.outdoorTiles.getTileSetAnimation("campfireOn", 2, 200)], new TileTransform_4.TileTransform(pos)));
                        _this.campfireOn.enabled = true;
                        _this.campfireOn.transform.depth = pos.y + Tilesets_1.TILE_SIZE;
                        var offset = new point_18.Point(0, 5);
                        _this.entity.addComponent(new BoxCollider_1.BoxCollider(pos.plus(offset), new point_18.Point(Tilesets_1.TILE_SIZE, Tilesets_1.TILE_SIZE).minus(offset)));
                        // Toggle between on/off when interacted with
                        _this.entity.addComponent(new Interactable_1.Interactable(pos.plus(new point_18.Point(Tilesets_1.TILE_SIZE / 2, Tilesets_1.TILE_SIZE / 2)), function () {
                            _this.campfireOff.enabled = _this.campfireOn.enabled;
                            _this.campfireOn.enabled = !_this.campfireOn.enabled;
                        }));
                    };
                    return _this;
                }
                return Campfire;
            }(component_6.Component));
            exports_41("Campfire", Campfire);
        }
    };
});
System.register("game/characters/Weapon", ["engine/component", "engine/tiles/TileComponent", "game/graphics/Tilesets", "engine/tiles/TileTransform", "engine/point", "game/characters/Dude", "engine/util/Animator", "game/world/LocationManager"], function (exports_42, context_42) {
    "use strict";
    var component_7, TileComponent_4, Tilesets_2, TileTransform_5, point_19, Dude_1, Animator_2, LocationManager_1, State, Weapon;
    var __moduleName = context_42 && context_42.id;
    return {
        setters: [
            function (component_7_1) {
                component_7 = component_7_1;
            },
            function (TileComponent_4_1) {
                TileComponent_4 = TileComponent_4_1;
            },
            function (Tilesets_2_1) {
                Tilesets_2 = Tilesets_2_1;
            },
            function (TileTransform_5_1) {
                TileTransform_5 = TileTransform_5_1;
            },
            function (point_19_1) {
                point_19 = point_19_1;
            },
            function (Dude_1_1) {
                Dude_1 = Dude_1_1;
            },
            function (Animator_2_1) {
                Animator_2 = Animator_2_1;
            },
            function (LocationManager_1_1) {
                LocationManager_1 = LocationManager_1_1;
            }
        ],
        execute: function () {
            (function (State) {
                State[State["SHEATHED"] = 0] = "SHEATHED";
                State[State["DRAWN"] = 1] = "DRAWN";
                State[State["ATTACKING"] = 2] = "ATTACKING";
            })(State || (State = {}));
            /**
             * A weapon being wielded by a dude
             */
            Weapon = /** @class */ (function (_super) {
                __extends(Weapon, _super);
                function Weapon(weaponId) {
                    var _this = _super.call(this) || this;
                    _this.state = State.DRAWN;
                    _this.currentAnimationFrame = 0;
                    _this.start = function (startData) {
                        _this.dude = _this.entity.getComponent(Dude_1.Dude);
                        _this.weaponSprite = _this.entity.addComponent(new TileComponent_4.TileComponent(Tilesets_2.Tilesets.instance.dungeonCharacters.getTileSource(weaponId), new TileTransform_5.TileTransform().relativeTo(_this.dude.animation.transform)));
                    };
                    return _this;
                }
                Weapon.prototype.update = function (updateData) {
                    if (!!this.animator) {
                        this.animator.update(updateData.elapsedTimeMillis);
                    }
                    this.animate();
                };
                // TODO find a better place for this?
                Weapon.damageInFrontOfDude = function (dude, attackDistance) {
                    Array.from(LocationManager_1.LocationManager.instance.currentLocation.dynamic)
                        .map(function (e) { return e.getComponent(Dude_1.Dude); })
                        .filter(function (d) { return !!d && d !== dude; })
                        .filter(function (d) { return dude.animation.transform.mirrorX === (d.standingPosition.x < dude.standingPosition.x); }) // enemies the dude is facing
                        .filter(function (d) { return d.standingPosition.distanceTo(dude.standingPosition) < attackDistance; })
                        .forEach(function (d) { return d.damage(1, d.standingPosition.minus(dude.standingPosition), 30); });
                };
                Weapon.prototype.animate = function () {
                    var offsetFromEdge = new point_19.Point(6, 26).minus(this.weaponSprite.transform.dimensions); // for DRAWN/SHEATHED
                    // relative position for DRAWN state when characer is facing right (mirroring logic below)
                    var pos = new point_19.Point(0, 0);
                    var rotation = 0;
                    if (this.state === State.DRAWN) {
                        pos = offsetFromEdge;
                    }
                    else if (this.state === State.SHEATHED) { // TODO add side sheath for swords
                        // center on back
                        pos = offsetFromEdge.plus(new point_19.Point(3, -1));
                    }
                    else if (this.state === State.ATTACKING) {
                        var posWithRotation = this.getAttackAnimationPosition();
                        pos = posWithRotation[0].plus(offsetFromEdge);
                        rotation = posWithRotation[1];
                    }
                    this.weaponSprite.transform.rotation = rotation;
                    this.weaponSprite.transform.mirrorY = this.state == State.SHEATHED;
                    // magic based on the animations
                    var f = this.dude.animation.currentFrame();
                    if (!this.dude.isMoving) {
                        pos = pos.plus(new point_19.Point(0, f == 3 ? 1 : f));
                    }
                    else {
                        pos = pos.plus(new point_19.Point(0, f == 0 ? -1 : -((3 - this.dude.animation.currentFrame()))));
                    }
                    this.weaponSprite.transform.position = pos;
                    // show sword behind character if sheathed
                    this.weaponSprite.transform.depth = this.state == State.SHEATHED ? -1 : 1;
                    // this.weaponSprite.transform.mirrorX = charMirror
                    // TODO maybe keep the slash stuff later
                    // this.slashSprite.enabled = this.animator?.getCurrentFrame() === 3
                    // this.slashSprite.transform.depth = characterAnim.transform.depth + 2
                    // this.slashSprite.transform.mirrorX = charMirror
                    // this.slashSprite.transform.position = characterAnim.transform.position.plus(
                    //     new Point((charMirror ? -1 : 1) * (this.weaponSprite.transform.dimensions.y - 8), 8)
                    // )
                };
                Weapon.prototype.isDrawn = function () {
                    return this.state !== State.SHEATHED;
                };
                Weapon.prototype.toggleSheathed = function () {
                    if (this.state === State.SHEATHED) {
                        this.state = State.DRAWN;
                    }
                    else if (this.state === State.DRAWN) {
                        this.state = State.SHEATHED;
                    }
                };
                Weapon.prototype.attack = function () {
                    var _this = this;
                    if (this.state === State.DRAWN) {
                        setTimeout(function () {
                            if (!_this.enabled) {
                                return;
                            }
                            var attackDistance = _this.weaponSprite.transform.dimensions.y + 4; // add a tiny buffer for small weapons like the dagger to still work
                            Weapon.damageInFrontOfDude(_this.dude, attackDistance);
                        }, 100);
                        this.playAttackAnimation();
                    }
                };
                Weapon.prototype.playAttackAnimation = function () {
                    var _this = this;
                    this.state = State.ATTACKING;
                    this.animator = new Animator_2.Animator(Animator_2.Animator.frames(8, 40), function (index) { return _this.currentAnimationFrame = index; }, function () {
                        _this.state = State.DRAWN; // reset to DRAWN when animation finishes
                        _this.animator = null;
                    });
                };
                /**
                 * Returns (position, rotation)
                 */
                Weapon.prototype.getAttackAnimationPosition = function () {
                    var swingStartFrame = 3;
                    var resettingFrame = 7;
                    if (this.currentAnimationFrame < swingStartFrame) {
                        return [new point_19.Point(this.currentAnimationFrame * 3, 0), 0];
                    }
                    else if (this.currentAnimationFrame < resettingFrame) {
                        return [
                            new point_19.Point((6 - this.currentAnimationFrame) + this.weaponSprite.transform.dimensions.y - swingStartFrame * 3, Math.floor(this.weaponSprite.transform.dimensions.y / 2 - 1)),
                            90
                        ];
                    }
                    else {
                        return [new point_19.Point((1 - this.currentAnimationFrame + resettingFrame) * 3, 2), 0];
                    }
                };
                return Weapon;
            }(component_7.Component));
            exports_42("Weapon", Weapon);
        }
    };
});
System.register("game/items/DroppedItem", ["engine/component", "engine/point", "engine/collision/BoxCollider", "game/characters/Player", "game/characters/Dude", "game/world/LocationManager"], function (exports_43, context_43) {
    "use strict";
    var component_8, point_20, BoxCollider_2, Player_1, Dude_2, LocationManager_2, DroppedItem;
    var __moduleName = context_43 && context_43.id;
    return {
        setters: [
            function (component_8_1) {
                component_8 = component_8_1;
            },
            function (point_20_1) {
                point_20 = point_20_1;
            },
            function (BoxCollider_2_1) {
                BoxCollider_2 = BoxCollider_2_1;
            },
            function (Player_1_1) {
                Player_1 = Player_1_1;
            },
            function (Dude_2_1) {
                Dude_2 = Dude_2_1;
            },
            function (LocationManager_2_1) {
                LocationManager_2 = LocationManager_2_1;
            }
        ],
        execute: function () {
            DroppedItem = /** @class */ (function (_super) {
                __extends(DroppedItem, _super);
                /**
                 * @param position The bottom center where the item should be placed
                 * @param sourceCollider will be ignored to prevent physics issues
                 *
                 * TODO: Add initial velocity
                 */
                function DroppedItem(position, item, velocity, sourceCollider) {
                    if (sourceCollider === void 0) { sourceCollider = null; }
                    var _this = _super.call(this) || this;
                    _this.itemType = item;
                    _this.start = function () {
                        _this.tile = _this.entity.addComponent(item.droppedIconSupplier().toComponent());
                        var pos = position.minus(new point_20.Point(_this.tile.transform.dimensions.x / 2, _this.tile.transform.dimensions.y));
                        _this.tile.transform.position = pos;
                        var colliderSize = new point_20.Point(8, 8);
                        _this.collider = _this.entity.addComponent(new BoxCollider_2.BoxCollider(pos.plus(_this.tile.transform.dimensions.minus(colliderSize).div(2)), colliderSize, DroppedItem.COLLISION_LAYER, !!sourceCollider ? [sourceCollider] : []).onColliderEnter(function (c) { return _this.collide(c); }));
                        _this.reposition();
                    };
                    var moveInterval = setInterval(function () {
                        _this.reposition(velocity);
                        velocity = velocity.times(.6);
                        if (velocity.magnitude() < .1) {
                            clearInterval(moveInterval);
                        }
                    }, 10);
                    return _this;
                }
                DroppedItem.prototype.reposition = function (delta) {
                    if (delta === void 0) { delta = new point_20.Point(0, 0); }
                    var colliderOffset = this.collider.position.minus(this.tile.transform.position);
                    this.tile.transform.position = this.collider.moveTo(this.collider.position.plus(delta)).minus(colliderOffset);
                    this.tile.transform.depth = this.tile.transform.position.y;
                };
                DroppedItem.prototype.collide = function (c) {
                    var _this = this;
                    var player = c.entity.getComponent(Player_1.Player);
                    if (!!player) {
                        setTimeout(function () {
                            var d = player.entity.getComponent(Dude_2.Dude);
                            if (d.isAlive) {
                                player.entity.getComponent(Dude_2.Dude).inventory.addItem(_this.itemType);
                                LocationManager_2.LocationManager.instance.currentLocation.dynamic.delete(_this.entity);
                                _this.entity.selfDestruct();
                            }
                        }, 150);
                    }
                };
                DroppedItem.COLLISION_LAYER = "item";
                return DroppedItem;
            }(component_8.Component));
            exports_43("DroppedItem", DroppedItem);
        }
    };
});
System.register("game/items/Items", ["game/graphics/Tilesets", "engine/Entity", "game/world/LocationManager", "game/items/DroppedItem", "engine/point"], function (exports_44, context_44) {
    "use strict";
    var Tilesets_3, Entity_2, LocationManager_3, DroppedItem_1, point_21, Item, Items, spawnItem;
    var __moduleName = context_44 && context_44.id;
    return {
        setters: [
            function (Tilesets_3_1) {
                Tilesets_3 = Tilesets_3_1;
            },
            function (Entity_2_1) {
                Entity_2 = Entity_2_1;
            },
            function (LocationManager_3_1) {
                LocationManager_3 = LocationManager_3_1;
            },
            function (DroppedItem_1_1) {
                DroppedItem_1 = DroppedItem_1_1;
            },
            function (point_21_1) {
                point_21 = point_21_1;
            }
        ],
        execute: function () {
            Item = /** @class */ (function () {
                function Item(droppedIconSupplier, stackLimit) {
                    if (stackLimit === void 0) { stackLimit = 1; }
                    this.droppedIconSupplier = droppedIconSupplier;
                    this.stackLimit = stackLimit;
                }
                return Item;
            }());
            exports_44("Item", Item);
            exports_44("Items", Items = {
                COIN: new Item(function () { return Tilesets_3.Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150); }),
                ROCK: new Item(function () { return Tilesets_3.Tilesets.instance.outdoorTiles.getTileSource("rockItem"); }, 100),
                WOOD: new Item(function () { return Tilesets_3.Tilesets.instance.outdoorTiles.getTileSource("woodItem"); }, 100),
            });
            /**
             * @param position The bottom center where the item should be placed
             *
             * TODO: Add initial velocity
             */
            exports_44("spawnItem", spawnItem = function (pos, item, velocity, sourceCollider) {
                if (velocity === void 0) { velocity = new point_21.Point(0, 0); }
                if (sourceCollider === void 0) { sourceCollider = null; }
                LocationManager_3.LocationManager.instance.currentLocation.dynamic.add(new Entity_2.Entity([new DroppedItem_1.DroppedItem(pos, item, velocity, sourceCollider)]));
            });
        }
    };
});
System.register("game/items/Inventory", [], function (exports_45, context_45) {
    "use strict";
    var ItemStack, Inventory;
    var __moduleName = context_45 && context_45.id;
    return {
        setters: [],
        execute: function () {
            ItemStack = /** @class */ (function () {
                function ItemStack(item, count) {
                    this.item = item;
                    this.count = count;
                }
                return ItemStack;
            }());
            // TODO flesh this out more when we have more items
            Inventory = /** @class */ (function () {
                function Inventory() {
                    this.inventory = Array.from({ length: 20 });
                    this.countMap = new Map();
                }
                /**
                 * returns true if the item can fit in the inventory
                 */
                Inventory.prototype.addItem = function (item) {
                    var _a, _b;
                    var firstEmptySlot = -1;
                    for (var i = 0; i < this.inventory.length; i++) {
                        var slotValue = this.inventory[i];
                        if (!!slotValue) {
                            if (slotValue.item === item && slotValue.count < item.stackLimit) {
                                slotValue.count++;
                                this.countMap.set(item, 1 + ((_a = this.countMap.get(item)) !== null && _a !== void 0 ? _a : 0));
                                return true;
                            }
                        }
                        else if (firstEmptySlot === -1) {
                            firstEmptySlot = i;
                        }
                    }
                    if (firstEmptySlot !== -1) {
                        this.inventory[firstEmptySlot] = new ItemStack(item, 1);
                        this.countMap.set(item, 1 + ((_b = this.countMap.get(item)) !== null && _b !== void 0 ? _b : 0));
                        return true;
                    }
                    return false;
                };
                Inventory.prototype.getItemCount = function (item) {
                    var _a;
                    return (_a = this.countMap.get(item)) !== null && _a !== void 0 ? _a : 0;
                };
                return Inventory;
            }());
            exports_45("Inventory", Inventory);
        }
    };
});
System.register("game/characters/Dude", ["engine/tiles/AnimatedTileComponent", "engine/point", "engine/component", "engine/collision/BoxCollider", "game/graphics/Tilesets", "game/characters/Weapon", "game/items/Inventory", "game/items/Items"], function (exports_46, context_46) {
    "use strict";
    var AnimatedTileComponent_3, point_22, component_9, BoxCollider_3, Tilesets_4, Weapon_1, Inventory_1, Items_1, Dude;
    var __moduleName = context_46 && context_46.id;
    return {
        setters: [
            function (AnimatedTileComponent_3_1) {
                AnimatedTileComponent_3 = AnimatedTileComponent_3_1;
            },
            function (point_22_1) {
                point_22 = point_22_1;
            },
            function (component_9_1) {
                component_9 = component_9_1;
            },
            function (BoxCollider_3_1) {
                BoxCollider_3 = BoxCollider_3_1;
            },
            function (Tilesets_4_1) {
                Tilesets_4 = Tilesets_4_1;
            },
            function (Weapon_1_1) {
                Weapon_1 = Weapon_1_1;
            },
            function (Inventory_1_1) {
                Inventory_1 = Inventory_1_1;
            },
            function (Items_1_1) {
                Items_1 = Items_1_1;
            }
        ],
        execute: function () {
            Dude = /** @class */ (function (_super) {
                __extends(Dude, _super);
                function Dude(archetype, position, weaponId) {
                    var _this = _super.call(this) || this;
                    _this.inventory = new Inventory_1.Inventory();
                    _this.maxHealth = 4;
                    _this._health = _this.maxHealth;
                    _this.speed = 0.085;
                    _this.relativeColliderPos = new point_22.Point(3, 15);
                    _this.beingKnockedBack = false;
                    _this._position = position;
                    _this.start = function (startData) {
                        var idleAnim = Tilesets_4.Tilesets.instance.dungeonCharacters.getTileSetAnimation(archetype + "_idle_anim", 150);
                        var runAnim = Tilesets_4.Tilesets.instance.dungeonCharacters.getTileSetAnimation(archetype + "_run_anim", 80);
                        _this._animation = _this.entity.addComponent(new AnimatedTileComponent_3.AnimatedTileComponent([idleAnim, runAnim]));
                        if (!!weaponId) {
                            _this._weapon = _this.entity.addComponent(new Weapon_1.Weapon(weaponId));
                        }
                        var colliderSize = new point_22.Point(10, 8);
                        _this.relativeColliderPos = new point_22.Point(_this.animation.transform.dimensions.x / 2 - colliderSize.x / 2, _this.animation.transform.dimensions.y - colliderSize.y);
                        _this.collider = _this.entity.addComponent(new BoxCollider_3.BoxCollider(_this.position.plus(_this.relativeColliderPos), colliderSize, Dude.COLLISION_LAYER));
                    };
                    return _this;
                }
                Object.defineProperty(Dude.prototype, "health", {
                    get: function () { return this._health; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Dude.prototype, "animation", {
                    get: function () { return this._animation; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Dude.prototype, "weapon", {
                    get: function () {
                        return this._weapon;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Dude.prototype, "position", {
                    get: function () {
                        return this._position;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Dude.prototype, "standingPosition", {
                    // bottom center of the tile
                    get: function () {
                        return this.position.plus(new point_22.Point(this.animation.transform.dimensions.x / 2, this.animation.transform.dimensions.y));
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Dude.prototype, "isMoving", {
                    get: function () {
                        return this._isMoving;
                    },
                    enumerable: true,
                    configurable: true
                });
                Dude.prototype.update = function (updateData) {
                    // All other transforms (eg the weapon) are positioned relative to the animation
                    this.animation.transform.position = this.position.plus(this.isAlive ? new point_22.Point(0, 0) : this.deathOffset);
                    this.animation.transform.depth = this.collider.position.y + this.collider.dimensions.y;
                };
                Object.defineProperty(Dude.prototype, "isAlive", {
                    get: function () { return this._health > 0; },
                    enumerable: true,
                    configurable: true
                });
                Dude.prototype.damage = function (damage, direction, knockback) {
                    if (this.isAlive) {
                        this._health -= damage;
                        if (!this.isAlive) {
                            this.die(direction);
                            knockback *= (1 + Math.random());
                        }
                    }
                    this.knockback(direction, knockback);
                };
                Dude.prototype.die = function (direction) {
                    var _this = this;
                    if (direction === void 0) { direction = new point_22.Point(-1, 0); }
                    this._health = 0;
                    var prePos = this.animation.transform.position;
                    this.animation.transform.rotate(90 * (direction.x >= 0 ? 1 : -1), this.standingPosition.minus(new point_22.Point(0, 5)));
                    this.deathOffset = this.animation.transform.position.minus(prePos);
                    this.animation.play(0);
                    this.animation.paused = true;
                    setTimeout(function () { return _this.spawnDrop(); }, 100);
                    this.dropWeapon();
                };
                Dude.prototype.spawnDrop = function () {
                    Items_1.spawnItem(this.standingPosition.minus(new point_22.Point(0, 2)), Items_1.Items.COIN);
                };
                Dude.prototype.dropWeapon = function () {
                    // TODO
                };
                Dude.prototype.knockback = function (direction, knockback) {
                    var _this = this;
                    this.beingKnockedBack = true;
                    var goal = this.position.plus(direction.normalized().times(knockback));
                    var distToStop = 2;
                    var intervalsRemaining = 50;
                    var interval = setInterval(function () {
                        _this.moveTo(_this.position.lerp(.07, goal));
                        intervalsRemaining--;
                        if (intervalsRemaining === 0 || goal.minus(_this.position).magnitude() < distToStop) {
                            clearInterval(interval);
                            _this.beingKnockedBack = false;
                        }
                    }, 10);
                };
                /**
                 * Should be called on EVERY update step for
                 * @param updateData
                 * @param direction the direction they are moving in
                 * @param facingOverride if < 0, will face left, if > 0, will face right. if == 0, will face the direction they're moving
                 */
                Dude.prototype.move = function (updateData, direction, facingOverride) {
                    if (facingOverride === void 0) { facingOverride = 0; }
                    if (this._health <= 0) {
                        return;
                    }
                    if (this.beingKnockedBack) {
                        direction = direction.times(0);
                    }
                    var dx = direction.x;
                    var dy = direction.y;
                    if ((dx < 0 && facingOverride === 0) || facingOverride < 0) {
                        this.animation.transform.mirrorX = true;
                    }
                    else if ((dx > 0 && facingOverride === 0) || facingOverride > 0) {
                        this.animation.transform.mirrorX = false;
                    }
                    var wasMoving = this.isMoving;
                    this._isMoving = dx != 0 || dy != 0;
                    if (this.isMoving) {
                        if (!wasMoving) {
                            this.animation.play(1); // TODO make the run animation backwards if they run backwards :)
                        }
                        var translation = direction.normalized();
                        // this.lerpedLastMoveDir = this.lerpedLastMoveDir.lerp(0.25, translation)
                        var newPos = this._position.plus(translation.times(updateData.elapsedTimeMillis * this.speed));
                        this.moveTo(newPos);
                    }
                    else if (wasMoving) {
                        this.animation.play(0);
                    }
                };
                Dude.prototype.moveTo = function (point) {
                    this._position = this.collider.moveTo(point.plus(this.relativeColliderPos)).minus(this.relativeColliderPos);
                };
                Dude.COLLISION_LAYER = "dube";
                return Dude;
            }(component_9.Component));
            exports_46("Dude", Dude);
        }
    };
});
System.register("game/world/elements/Hittable", ["engine/component", "engine/util/Animator"], function (exports_47, context_47) {
    "use strict";
    var component_10, Animator_3, Hittable;
    var __moduleName = context_47 && context_47.id;
    return {
        setters: [
            function (component_10_1) {
                component_10 = component_10_1;
            },
            function (Animator_3_1) {
                Animator_3 = Animator_3_1;
            }
        ],
        execute: function () {
            Hittable = /** @class */ (function (_super) {
                __extends(Hittable, _super);
                /**
                 * @param position world pixel position (probably centered) referenced for finding hittables
                 */
                function Hittable(position, tileTransforms, onHit) {
                    var _this = _super.call(this) || this;
                    _this.position = position;
                    _this.tileTransforms = new Map(tileTransforms.map(function (t) { return [t, t.position]; }));
                    _this.onHit = onHit;
                    return _this;
                }
                Hittable.prototype.update = function (updateData) {
                    var _a;
                    (_a = this.animator) === null || _a === void 0 ? void 0 : _a.update(updateData.elapsedTimeMillis);
                };
                // TODO limit to certain tools 
                Hittable.prototype.hit = function (dir) {
                    var _this = this;
                    if (!!this.animator) { // already being hit
                        return;
                    }
                    dir = dir.normalized();
                    var frames = [0, 0, 0, 3, 6, 3, 2, 1];
                    this.animator = new Animator_3.Animator(Animator_3.Animator.frames(frames.length, 40), function (index) {
                        _this.tileTransforms.forEach(function (pt, tr) { return tr.position = pt.plus(dir.times(frames[index])); });
                    }, function () { return _this.animator = null; });
                    setTimeout(function () { return _this.onHit(dir); }, 200);
                };
                return Hittable;
            }(component_10.Component));
            exports_47("Hittable", Hittable);
        }
    };
});
System.register("game/characters/Player", ["engine/point", "engine/component", "game/characters/Dude", "game/world/elements/Interactable", "game/world/elements/Hittable"], function (exports_48, context_48) {
    "use strict";
    var point_23, component_11, Dude_3, Interactable_2, Hittable_1, Player;
    var __moduleName = context_48 && context_48.id;
    return {
        setters: [
            function (point_23_1) {
                point_23 = point_23_1;
            },
            function (component_11_1) {
                component_11 = component_11_1;
            },
            function (Dude_3_1) {
                Dude_3 = Dude_3_1;
            },
            function (Interactable_2_1) {
                Interactable_2 = Interactable_2_1;
            },
            function (Hittable_1_1) {
                Hittable_1 = Hittable_1_1;
            }
        ],
        execute: function () {
            Player = /** @class */ (function (_super) {
                __extends(Player, _super);
                function Player() {
                    var _this = _super.call(this) || this;
                    _this.lerpedLastMoveDir = new point_23.Point(1, 0); // used for crosshair
                    Player.instance = _this;
                    return _this;
                }
                Player.prototype.start = function (startData) {
                    this.dude = this.entity.getComponent(Dude_3.Dude);
                };
                Player.prototype.update = function (updateData) {
                    if (!this.dude.isAlive) {
                        return;
                    }
                    // const originalCrosshairPosRelative = this.crosshairs.transform.position.minus(this.position)
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
                    this.dude.move(updateData, new point_23.Point(dx, dy), this.dude.weapon.isDrawn() ? updateData.input.mousePos.x - this.dude.standingPosition.x : 0);
                    if (updateData.input.isKeyDown(70 /* F */)) {
                        this.dude.weapon.toggleSheathed();
                    }
                    if (updateData.input.isMouseDown) {
                        this.dude.weapon.attack();
                        this.hitResource(updateData);
                    }
                    if (updateData.input.isKeyDown(69 /* E */)) {
                        this.interact(updateData);
                    }
                    // FOR TESTING
                    if (updateData.input.isKeyDown(80 /* P */)) {
                        this.dude.damage(.25, new point_23.Point(Math.random() - .5, Math.random() - .5), 30);
                    }
                    // update crosshair position
                    // const relativeLerpedPos = originalCrosshairPosRelative.lerp(0.16, this.lerpedLastMoveDir.normalized().times(TILE_SIZE))
                    // this.crosshairs.transform.position = this.position.plus(relativeLerpedPos)
                    // const crosshairTilePosition = this.crosshairs.transform.position.plus(new Point(TILE_SIZE, TILE_SIZE).div(2)).floorDiv(TILE_SIZE)
                    // if (updateData.input.isKeyDown(InputKey.F)) {
                    //     game.tiles.remove(crosshairTilePosition)
                    // }
                    // if (updateData.input.isKeyDown(InputKey.E)) {
                    //     game.tiles.get(crosshairTilePosition)?.getComponent(Interactable)?.interact()
                    // }
                };
                Player.prototype.interact = function (updateData) {
                    var _this = this;
                    var interactDistance = 20;
                    var interactCenter = this.dude.standingPosition.minus(new point_23.Point(0, 7));
                    var possibilities = updateData.view.entities
                        .map(function (e) { return e.getComponent(Interactable_2.Interactable); })
                        .filter(function (e) { return !!e; })
                        .filter(function (e) { return _this.dude.animation.transform.mirrorX === (e.position.x < interactCenter.x); }); // interactables the dude is facing
                    var closestDist = Number.MAX_SAFE_INTEGER;
                    var closest;
                    for (var _i = 0, possibilities_1 = possibilities; _i < possibilities_1.length; _i++) {
                        var i = possibilities_1[_i];
                        var dist = i.position.distanceTo(interactCenter);
                        if (dist < interactDistance && dist < closestDist) {
                            closestDist = dist;
                            closest = i;
                        }
                    }
                    closest === null || closest === void 0 ? void 0 : closest.interact();
                };
                // for trees and rocks
                Player.prototype.hitResource = function (updateData) {
                    var _this = this;
                    var interactDistance = 20;
                    var interactCenter = this.dude.standingPosition.minus(new point_23.Point(0, 7));
                    var possibilities = updateData.view.entities
                        .map(function (e) { return e.getComponent(Hittable_1.Hittable); })
                        .filter(function (e) { return !!e; })
                        .filter(function (e) { return _this.dude.animation.transform.mirrorX === (e.position.x < interactCenter.x); }); // hittables the dude is facing
                    var closestDist = Number.MAX_SAFE_INTEGER;
                    var closest;
                    for (var _i = 0, possibilities_2 = possibilities; _i < possibilities_2.length; _i++) {
                        var i = possibilities_2[_i];
                        var dist = i.position.distanceTo(interactCenter);
                        if (dist < interactDistance && dist < closestDist) {
                            closestDist = dist;
                            closest = i;
                        }
                    }
                    closest === null || closest === void 0 ? void 0 : closest.hit(closest.position.minus(interactCenter));
                };
                return Player;
            }(component_11.Component));
            exports_48("Player", Player);
        }
    };
});
System.register("game/world/LocationManager", ["game/characters/Player"], function (exports_49, context_49) {
    "use strict";
    var Player_2, LocationManager;
    var __moduleName = context_49 && context_49.id;
    return {
        setters: [
            function (Player_2_1) {
                Player_2 = Player_2_1;
            }
        ],
        execute: function () {
            LocationManager = /** @class */ (function () {
                function LocationManager(startingLocation) {
                    LocationManager.instance = this;
                    this.current = startingLocation;
                }
                Object.defineProperty(LocationManager.prototype, "currentLocation", {
                    get: function () {
                        return this.current;
                    },
                    enumerable: true,
                    configurable: true
                });
                LocationManager.prototype.transition = function (to) {
                    this.currentLocation.dynamic.delete(Player_2.Player.instance.entity);
                    to.dynamic.add(Player_2.Player.instance.entity);
                    this.current = to;
                };
                return LocationManager;
            }());
            exports_49("LocationManager", LocationManager);
        }
    };
});
System.register("game/world/elements/Tent", ["engine/point", "game/graphics/Tilesets", "engine/collision/BoxCollider", "engine/tiles/TileComponent", "engine/tiles/TileTransform", "engine/Entity", "game/world/elements/Interactable", "game/world/LocationManager"], function (exports_50, context_50) {
    "use strict";
    var point_24, Tilesets_5, BoxCollider_4, TileComponent_5, TileTransform_6, Entity_3, Interactable_3, LocationManager_4, TentColor, makeTent, addTile;
    var __moduleName = context_50 && context_50.id;
    return {
        setters: [
            function (point_24_1) {
                point_24 = point_24_1;
            },
            function (Tilesets_5_1) {
                Tilesets_5 = Tilesets_5_1;
            },
            function (BoxCollider_4_1) {
                BoxCollider_4 = BoxCollider_4_1;
            },
            function (TileComponent_5_1) {
                TileComponent_5 = TileComponent_5_1;
            },
            function (TileTransform_6_1) {
                TileTransform_6 = TileTransform_6_1;
            },
            function (Entity_3_1) {
                Entity_3 = Entity_3_1;
            },
            function (Interactable_3_1) {
                Interactable_3 = Interactable_3_1;
            },
            function (LocationManager_4_1) {
                LocationManager_4 = LocationManager_4_1;
            }
        ],
        execute: function () {
            (function (TentColor) {
                TentColor["RED"] = "red";
                TentColor["BLUE"] = "blue";
            })(TentColor || (TentColor = {}));
            exports_50("TentColor", TentColor);
            exports_50("makeTent", makeTent = function (wl, pos, color, teleportTo) {
                var e = new Entity_3.Entity();
                var depth = (pos.y + 1) * Tilesets_5.TILE_SIZE + /* prevent clipping */ 5;
                addTile(wl, e, color + "tentNW", pos, depth);
                addTile(wl, e, color + "tentNE", pos.plus(new point_24.Point(1, 0)), depth);
                addTile(wl, e, color + "tentSW", pos.plus(new point_24.Point(0, 1)), depth);
                addTile(wl, e, color + "tentSE", pos.plus(new point_24.Point(1, 1)), depth);
                e.addComponent(new BoxCollider_4.BoxCollider(pos.plus(new point_24.Point(0, 1)).times(Tilesets_5.TILE_SIZE), new point_24.Point(Tilesets_5.TILE_SIZE * 2, Tilesets_5.TILE_SIZE)));
                e.addComponent(new Interactable_3.Interactable(pos.plus(new point_24.Point(1, 2)).times(Tilesets_5.TILE_SIZE), function () {
                    LocationManager_4.LocationManager.instance.transition(teleportTo);
                }));
            });
            addTile = function (wl, e, s, pos, depth) {
                wl.stuff.set(pos, e);
                var tile = e.addComponent(new TileComponent_5.TileComponent(Tilesets_5.Tilesets.instance.outdoorTiles.getTileSource(s), new TileTransform_6.TileTransform(pos.times(Tilesets_5.TILE_SIZE))));
                tile.transform.depth = depth;
            };
        }
    };
});
System.register("game/world/elements/HittableResource", ["game/world/elements/Hittable", "engine/point", "game/items/Items", "game/graphics/Tilesets", "engine/collision/BoxCollider"], function (exports_51, context_51) {
    "use strict";
    var Hittable_2, point_25, Items_2, Tilesets_6, BoxCollider_5, makeHittable;
    var __moduleName = context_51 && context_51.id;
    return {
        setters: [
            function (Hittable_2_1) {
                Hittable_2 = Hittable_2_1;
            },
            function (point_25_1) {
                point_25 = point_25_1;
            },
            function (Items_2_1) {
                Items_2 = Items_2_1;
            },
            function (Tilesets_6_1) {
                Tilesets_6 = Tilesets_6_1;
            },
            function (BoxCollider_5_1) {
                BoxCollider_5 = BoxCollider_5_1;
            }
        ],
        execute: function () {
            exports_51("makeHittable", makeHittable = function (e, pos, transforms, item) {
                var knockedItemCount = 5;
                var h = new Hittable_2.Hittable(pos, // centered position
                transforms, function (hitDir) {
                    knockedItemCount--;
                    var finishingMove = knockedItemCount === 0;
                    var velocityMultiplier = finishingMove ? .5 : 1;
                    var placeDistance = finishingMove ? 2 : 8;
                    var itemsOut = finishingMove ? 3 : 1;
                    for (var i = 0; i < itemsOut; i++) {
                        var randomness = .5;
                        var itemDirection = hitDir.plus(new point_25.Point(randomness - Math.random() * randomness * 2, randomness - Math.random() * randomness * 2)).normalized();
                        var velocity = itemDirection.times(1 + 3 * Math.random());
                        Items_2.spawnItem(pos.plus(new point_25.Point(0, Tilesets_6.TILE_SIZE / 2)).plus(itemDirection.times(placeDistance)), // bottom center, then randomly adjusted
                        item, velocity.times(velocityMultiplier), e.getComponent(BoxCollider_5.BoxCollider));
                    }
                    if (finishingMove) {
                        e.selfDestruct();
                    }
                });
                e.addComponent(h);
            });
        }
    };
});
System.register("game/world/elements/Tree", ["engine/point", "game/graphics/Tilesets", "engine/collision/BoxCollider", "engine/tiles/TileComponent", "engine/tiles/TileTransform", "engine/Entity", "game/items/Items", "game/world/elements/HittableResource"], function (exports_52, context_52) {
    "use strict";
    var point_26, Tilesets_7, BoxCollider_6, TileComponent_6, TileTransform_7, Entity_4, Items_3, HittableResource_1, TreeType, makeTree, addTile;
    var __moduleName = context_52 && context_52.id;
    return {
        setters: [
            function (point_26_1) {
                point_26 = point_26_1;
            },
            function (Tilesets_7_1) {
                Tilesets_7 = Tilesets_7_1;
            },
            function (BoxCollider_6_1) {
                BoxCollider_6 = BoxCollider_6_1;
            },
            function (TileComponent_6_1) {
                TileComponent_6 = TileComponent_6_1;
            },
            function (TileTransform_7_1) {
                TileTransform_7 = TileTransform_7_1;
            },
            function (Entity_4_1) {
                Entity_4 = Entity_4_1;
            },
            function (Items_3_1) {
                Items_3 = Items_3_1;
            },
            function (HittableResource_1_1) {
                HittableResource_1 = HittableResource_1_1;
            }
        ],
        execute: function () {
            (function (TreeType) {
                TreeType[TreeType["ROUND"] = 1] = "ROUND";
                TreeType[TreeType["POINTY"] = 2] = "POINTY";
            })(TreeType || (TreeType = {}));
            exports_52("TreeType", TreeType);
            exports_52("makeTree", makeTree = function (wl, pos, type) {
                var e = new Entity_4.Entity();
                var depth = (pos.y + 2) * Tilesets_7.TILE_SIZE;
                var top = addTile(wl, e, "tree" + type + "top", pos, depth);
                var bottom = addTile(wl, e, "tree" + type + "base", pos.plus(new point_26.Point(0, 1)), depth);
                var hitboxDims = new point_26.Point(8, 3);
                e.addComponent(new BoxCollider_6.BoxCollider(pos.plus(new point_26.Point(.5, 2)).times(Tilesets_7.TILE_SIZE).minus(new point_26.Point(hitboxDims.x / 2, hitboxDims.y)), hitboxDims));
                var hittableCenter = pos.times(Tilesets_7.TILE_SIZE).plus(new point_26.Point(Tilesets_7.TILE_SIZE / 2, Tilesets_7.TILE_SIZE + Tilesets_7.TILE_SIZE / 2)); // center of bottom tile
                HittableResource_1.makeHittable(e, hittableCenter, [top.transform, bottom.transform], Items_3.Items.WOOD);
                return e;
            });
            addTile = function (wl, e, s, pos, depth) {
                wl.stuff.set(pos, e);
                var tile = e.addComponent(new TileComponent_6.TileComponent(Tilesets_7.Tilesets.instance.outdoorTiles.getTileSource(s), new TileTransform_7.TileTransform(pos.times(Tilesets_7.TILE_SIZE))));
                tile.transform.depth = depth;
                return tile;
            };
        }
    };
});
System.register("game/world/elements/Rock", ["engine/point", "game/graphics/Tilesets", "engine/collision/BoxCollider", "engine/tiles/TileComponent", "engine/tiles/TileTransform", "engine/Entity", "game/items/Items", "game/world/elements/HittableResource"], function (exports_53, context_53) {
    "use strict";
    var point_27, Tilesets_8, BoxCollider_7, TileComponent_7, TileTransform_8, Entity_5, Items_4, HittableResource_2, makeRock;
    var __moduleName = context_53 && context_53.id;
    return {
        setters: [
            function (point_27_1) {
                point_27 = point_27_1;
            },
            function (Tilesets_8_1) {
                Tilesets_8 = Tilesets_8_1;
            },
            function (BoxCollider_7_1) {
                BoxCollider_7 = BoxCollider_7_1;
            },
            function (TileComponent_7_1) {
                TileComponent_7 = TileComponent_7_1;
            },
            function (TileTransform_8_1) {
                TileTransform_8 = TileTransform_8_1;
            },
            function (Entity_5_1) {
                Entity_5 = Entity_5_1;
            },
            function (Items_4_1) {
                Items_4 = Items_4_1;
            },
            function (HittableResource_2_1) {
                HittableResource_2 = HittableResource_2_1;
            }
        ],
        execute: function () {
            exports_53("makeRock", makeRock = function (wl, pos) {
                var e = new Entity_5.Entity();
                var variation = Math.floor(Math.random() * 3) + 1;
                var mossy = Math.random() > .7;
                var tile = e.addComponent(new TileComponent_7.TileComponent(Tilesets_8.Tilesets.instance.outdoorTiles.getTileSource("rock" + variation + (mossy ? 'mossy' : '')), new TileTransform_8.TileTransform(pos.times(Tilesets_8.TILE_SIZE))));
                tile.transform.depth = (pos.y + 1) * Tilesets_8.TILE_SIZE - /* prevent weapon from clipping */ 5;
                tile.transform.mirrorX = Math.random() > .5;
                // TODO
                var hitboxDims = new point_27.Point(12, 4);
                e.addComponent(new BoxCollider_7.BoxCollider(pos.plus(new point_27.Point(.5, 1)).times(Tilesets_8.TILE_SIZE).minus(new point_27.Point(hitboxDims.x / 2, hitboxDims.y + 2)), hitboxDims));
                HittableResource_2.makeHittable(e, pos.plus(new point_27.Point(.5, .5)).times(Tilesets_8.TILE_SIZE), [tile.transform], Items_4.Items.ROCK);
                wl.stuff.set(pos, e);
            });
        }
    };
});
System.register("game/world/MapGenerator", ["engine/point", "engine/tiles/ConnectingTileSchema", "engine/tiles/ConnectingTile", "engine/Entity", "engine/collision/BoxCollider", "game/graphics/Tilesets", "game/world/WorldLocation", "game/world/elements/Campfire", "game/world/elements/Tent", "game/world/elements/Tree", "game/world/elements/Rock"], function (exports_54, context_54) {
    "use strict";
    var point_28, ConnectingTileSchema_1, ConnectingTile_2, Entity_6, BoxCollider_8, Tilesets_9, WorldLocation_1, Campfire_1, Tent_1, Tree_1, Rock_1, MAP_SIZE, MapGenerator;
    var __moduleName = context_54 && context_54.id;
    return {
        setters: [
            function (point_28_1) {
                point_28 = point_28_1;
            },
            function (ConnectingTileSchema_1_1) {
                ConnectingTileSchema_1 = ConnectingTileSchema_1_1;
            },
            function (ConnectingTile_2_1) {
                ConnectingTile_2 = ConnectingTile_2_1;
            },
            function (Entity_6_1) {
                Entity_6 = Entity_6_1;
            },
            function (BoxCollider_8_1) {
                BoxCollider_8 = BoxCollider_8_1;
            },
            function (Tilesets_9_1) {
                Tilesets_9 = Tilesets_9_1;
            },
            function (WorldLocation_1_1) {
                WorldLocation_1 = WorldLocation_1_1;
            },
            function (Campfire_1_1) {
                Campfire_1 = Campfire_1_1;
            },
            function (Tent_1_1) {
                Tent_1 = Tent_1_1;
            },
            function (Tree_1_1) {
                Tree_1 = Tree_1_1;
            },
            function (Rock_1_1) {
                Rock_1 = Rock_1_1;
            }
        ],
        execute: function () {
            MAP_SIZE = 40;
            MapGenerator = /** @class */ (function () {
                function MapGenerator() {
                    this.oldPathSchema = new ConnectingTileSchema_1.ConnectingTileSchema()
                        .vertical(Tilesets_9.Tilesets.instance.outdoorTiles.getTileAt(new point_28.Point(9, 7)))
                        .angle(Tilesets_9.Tilesets.instance.outdoorTiles.getTileAt(new point_28.Point(7, 7)))
                        .tShape(Tilesets_9.Tilesets.instance.outdoorTiles.getTileAt(new point_28.Point(5, 8)))
                        .plusShape(Tilesets_9.Tilesets.instance.outdoorTiles.getTileAt(new point_28.Point(7, 12)))
                        .cap(Tilesets_9.Tilesets.instance.outdoorTiles.getTileAt(new point_28.Point(6, 11)))
                        .single(Tilesets_9.Tilesets.instance.outdoorTiles.getTileAt(new point_28.Point(8, 12)));
                    this.pathSchema = new ConnectingTileSchema_1.ConnectingTileSchema()
                        .vertical(Tilesets_9.Tilesets.instance.tilemap.getTileAt(new point_28.Point(2, 6)))
                        .angle(Tilesets_9.Tilesets.instance.tilemap.getTileAt(new point_28.Point(0, 5)))
                        .tShape(Tilesets_9.Tilesets.instance.tilemap.getTileAt(new point_28.Point(3, 5)))
                        .plusShape(Tilesets_9.Tilesets.instance.tilemap.getTileAt(new point_28.Point(5, 5)))
                        .cap(Tilesets_9.Tilesets.instance.tilemap.getTileAt(new point_28.Point(2, 6)))
                        .single(Tilesets_9.Tilesets.instance.tilemap.getTileAt(new point_28.Point(7, 5)));
                    this.location = new WorldLocation_1.WorldLocation();
                }
                MapGenerator.prototype.doIt = function () {
                    var tentLocation = new WorldLocation_1.WorldLocation();
                    // spawn tent
                    Tent_1.makeTent(this.location, new point_28.Point(5, 5), Tent_1.TentColor.RED, tentLocation);
                    // spawn campfire
                    var campfirePos = new point_28.Point(3, 9);
                    this.location.stuff.set(campfirePos, new Entity_6.Entity([new Campfire_1.Campfire(campfirePos)]));
                    // make the ground
                    this.renderPath(new point_28.Point(-10, -10), new point_28.Point(10, 10), this.pathSchema, 2);
                    this.renderPath(new point_28.Point(10, -10), new point_28.Point(-10, 10), this.pathSchema, 5);
                    this.spawnTrees();
                    this.spawnRocks();
                    // TODO short trees, bushes, fruit, tall grass, etc
                    // spawn grass last, stuff checks for existing paths prior to this by the lack of ground items
                    this.placeGrass();
                    return this.location;
                };
                MapGenerator.prototype.spawnTrees = function () {
                    var _this = this;
                    var trees = Math.random() * 150 + 50;
                    for (var i = 0; i < trees; i++) {
                        var pt = new point_28.Point(Math.floor(Math.random() * MAP_SIZE) - MAP_SIZE / 2, Math.floor(Math.random() * (MAP_SIZE - 1)) - MAP_SIZE / 2);
                        var occupiedPoints = [pt, pt.plus(new point_28.Point(0, 1))];
                        if (occupiedPoints.every(function (p) { return !_this.location.stuff.get(p) && !_this.location.ground.get(p); })) {
                            Tree_1.makeTree(this.location, pt, Math.random() < .7 ? Tree_1.TreeType.POINTY : Tree_1.TreeType.ROUND);
                        }
                    }
                };
                MapGenerator.prototype.spawnRocks = function () {
                    var placedRocks = 0;
                    while (placedRocks < 20) {
                        var p = new point_28.Point(Math.floor(Math.random() * MAP_SIZE) - MAP_SIZE / 2, Math.floor(Math.random() * (MAP_SIZE)) - MAP_SIZE / 2);
                        if (!this.location.stuff.get(p) && !this.location.ground.get(p)) {
                            Rock_1.makeRock(this.location, p);
                            placedRocks++;
                        }
                    }
                };
                MapGenerator.prototype.renderPath = function (start, end, tileSchema, randomness) {
                    var ground = this.location.ground;
                    var stuff = this.location.stuff;
                    var heuristic = function (pt) {
                        var v = pt.distanceTo(end) * Math.random() * randomness;
                        var el = ground.get(pt);
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
                    var isOccupiedFunc = function (pt) {
                        var _a;
                        if (!!((_a = stuff.get(pt)) === null || _a === void 0 ? void 0 : _a.getComponent(BoxCollider_8.BoxCollider))) {
                            return true;
                        }
                        var el = ground.get(pt);
                        if (!el) {
                            return false; // definitely not occupied
                        }
                        var ct = el.getComponent(ConnectingTile_2.ConnectingTile);
                        if (!ct) {
                            return true; // can't connect, therefore occupied
                        }
                        return !tileSchema.canConnect(ct.schema);
                    };
                    var path = ground.findPath(start, end, heuristic, isOccupiedFunc);
                    if (!path) {
                        return;
                    }
                    path.forEach(function (pt) {
                        var entity = new Entity_6.Entity([
                            new ConnectingTile_2.ConnectingTile(tileSchema, ground, pt),
                        ]);
                        ground.set(pt, entity);
                    });
                };
                MapGenerator.prototype.placeGrass = function () {
                    for (var i = -MAP_SIZE / 2; i < MAP_SIZE / 2; i++) {
                        for (var j = -MAP_SIZE / 2; j < MAP_SIZE / 2; j++) {
                            var pt = new point_28.Point(i, j);
                            if (!this.location.ground.get(pt)) {
                                var tile = void 0;
                                if (Math.random() < .65) {
                                    tile = Tilesets_9.Tilesets.instance.tilemap.getTileAt(new point_28.Point(0, Math.floor(Math.random() * 4)));
                                }
                                else {
                                    tile = Tilesets_9.Tilesets.instance.tilemap.getTileAt(new point_28.Point(0, 7));
                                }
                                var tileComponent = tile.toComponent();
                                tileComponent.transform.position = pt.times(Tilesets_9.TILE_SIZE);
                                this.location.ground.set(pt, new Entity_6.Entity([tileComponent]));
                            }
                        }
                    }
                };
                return MapGenerator;
            }());
            exports_54("MapGenerator", MapGenerator);
        }
    };
});
System.register("game/characters/NPC", ["engine/component", "game/characters/Dude", "game/characters/Player", "engine/point"], function (exports_55, context_55) {
    "use strict";
    var component_12, Dude_4, Player_3, point_29, NPC;
    var __moduleName = context_55 && context_55.id;
    return {
        setters: [
            function (component_12_1) {
                component_12 = component_12_1;
            },
            function (Dude_4_1) {
                Dude_4 = Dude_4_1;
            },
            function (Player_3_1) {
                Player_3 = Player_3_1;
            },
            function (point_29_1) {
                point_29 = point_29_1;
            }
        ],
        execute: function () {
            NPC = /** @class */ (function (_super) {
                __extends(NPC, _super);
                function NPC() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                NPC.prototype.start = function (startData) {
                    this.dude = this.entity.getComponent(Dude_4.Dude);
                    this.dude.speed *= Math.random(); // TODO configure speed for different enemies
                };
                NPC.prototype.update = function (updateData) {
                    var followDistance = 75;
                    var buffer = 40; // this basically determines how long they will stop for if they get too close
                    var dist = Player_3.Player.instance.entity.getComponent(Dude_4.Dude).position.minus(this.dude.position);
                    var mag = dist.magnitude();
                    if (mag > followDistance || ((followDistance - mag) < buffer && Player_3.Player.instance.entity.getComponent(Dude_4.Dude).isMoving) && this.dude.isMoving) {
                        this.dude.move(updateData, dist);
                    }
                    else {
                        this.dude.move(updateData, new point_29.Point(0, 0));
                    }
                };
                return NPC;
            }(component_12.Component));
            exports_55("NPC", NPC);
        }
    };
});
System.register("game/characters/DudeFactory", ["engine/Entity", "game/characters/Player", "game/characters/Dude", "game/characters/NPC", "game/world/LocationManager"], function (exports_56, context_56) {
    "use strict";
    var Entity_7, Player_4, Dude_5, NPC_1, LocationManager_5, DudeFactory;
    var __moduleName = context_56 && context_56.id;
    return {
        setters: [
            function (Entity_7_1) {
                Entity_7 = Entity_7_1;
            },
            function (Player_4_1) {
                Player_4 = Player_4_1;
            },
            function (Dude_5_1) {
                Dude_5 = Dude_5_1;
            },
            function (NPC_1_1) {
                NPC_1 = NPC_1_1;
            },
            function (LocationManager_5_1) {
                LocationManager_5 = LocationManager_5_1;
            }
        ],
        execute: function () {
            DudeFactory = /** @class */ (function () {
                function DudeFactory() {
                }
                DudeFactory.prototype.newPlayer = function (pos) {
                    return this.make("knight_f", pos, "weapon_baton_with_spikes", 
                    // "weapon_katana", 
                    // "weapon_knife", 
                    new Player_4.Player());
                };
                DudeFactory.prototype.newElf = function (pos) {
                    return this.make("elf_m", pos, "weapon_katana", new NPC_1.NPC());
                };
                DudeFactory.prototype.newImp = function (pos) {
                    return this.make("skelet", pos, null, new NPC_1.NPC());
                };
                DudeFactory.prototype.make = function (archetype, pos, weapon) {
                    var additionalComponents = [];
                    for (var _i = 3; _i < arguments.length; _i++) {
                        additionalComponents[_i - 3] = arguments[_i];
                    }
                    var e = new Entity_7.Entity([new Dude_5.Dude(archetype, pos, weapon)].concat(additionalComponents));
                    LocationManager_5.LocationManager.instance.currentLocation.dynamic.add(e);
                    return e.getComponent(Dude_5.Dude);
                };
                return DudeFactory;
            }());
            exports_56("DudeFactory", DudeFactory);
        }
    };
});
System.register("game/ui/StringTiles", ["engine/component", "game/graphics/Tilesets", "engine/tiles/TileTransform", "engine/point"], function (exports_57, context_57) {
    "use strict";
    var component_13, Tilesets_10, TileTransform_9, point_30, StringTiles;
    var __moduleName = context_57 && context_57.id;
    return {
        setters: [
            function (component_13_1) {
                component_13 = component_13_1;
            },
            function (Tilesets_10_1) {
                Tilesets_10 = Tilesets_10_1;
            },
            function (TileTransform_9_1) {
                TileTransform_9 = TileTransform_9_1;
            },
            function (point_30_1) {
                point_30 = point_30_1;
            }
        ],
        execute: function () {
            StringTiles = /** @class */ (function (_super) {
                __extends(StringTiles, _super);
                function StringTiles(position) {
                    var _this = _super.call(this) || this;
                    _this.tiles = [];
                    _this.topLeftPos = position;
                    return _this;
                }
                StringTiles.prototype.say = function (s) {
                    var _this = this;
                    if (s.length === 0) {
                        this.tiles = [];
                        return;
                    }
                    this.tiles = Array.from(s).map(function (c, i) {
                        return Tilesets_10.Tilesets.instance.oneBit.getTileSource(c).toImageRender(new TileTransform_9.TileTransform(_this.topLeftPos.plus(new point_30.Point(10 * i, 0))));
                    });
                };
                StringTiles.prototype.clear = function () {
                    this.say("");
                };
                StringTiles.prototype.getRenderMethods = function () {
                    return this.tiles;
                };
                return StringTiles;
            }(component_13.Component));
            exports_57("StringTiles", StringTiles);
        }
    };
});
System.register("game/ui/HUD", ["engine/tiles/AnimatedTileComponent", "game/graphics/Tilesets", "engine/tiles/TileTransform", "engine/point", "engine/tiles/TileComponent", "engine/Entity", "engine/renderer/BasicRenderComponent", "engine/renderer/TextRender", "game/items/Items"], function (exports_58, context_58) {
    "use strict";
    var AnimatedTileComponent_4, Tilesets_11, TileTransform_10, point_31, TileComponent_8, Entity_8, BasicRenderComponent_2, TextRender_2, Items_5, HUD;
    var __moduleName = context_58 && context_58.id;
    return {
        setters: [
            function (AnimatedTileComponent_4_1) {
                AnimatedTileComponent_4 = AnimatedTileComponent_4_1;
            },
            function (Tilesets_11_1) {
                Tilesets_11 = Tilesets_11_1;
            },
            function (TileTransform_10_1) {
                TileTransform_10 = TileTransform_10_1;
            },
            function (point_31_1) {
                point_31 = point_31_1;
            },
            function (TileComponent_8_1) {
                TileComponent_8 = TileComponent_8_1;
            },
            function (Entity_8_1) {
                Entity_8 = Entity_8_1;
            },
            function (BasicRenderComponent_2_1) {
                BasicRenderComponent_2 = BasicRenderComponent_2_1;
            },
            function (TextRender_2_1) {
                TextRender_2 = TextRender_2_1;
            },
            function (Items_5_1) {
                Items_5 = Items_5_1;
            }
        ],
        execute: function () {
            HUD = /** @class */ (function () {
                function HUD() {
                    this.entity = new Entity_8.Entity();
                    this.offset = new point_31.Point(4, 4);
                    this.coinsOffset = new point_31.Point(0, 18);
                    this.hearts = [];
                    // used for determining what should be updated
                    this.lastHealthCount = 0;
                    this.lastMaxHealthCount = 0;
                    this.lastCoinsCount = -1;
                    this.entity.addComponent(new AnimatedTileComponent_4.AnimatedTileComponent([Tilesets_11.Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150)], new TileTransform_10.TileTransform(this.offset.plus(this.coinsOffset))));
                }
                HUD.prototype.get = function (player) {
                    this.updateHearts(player.health, player.maxHealth);
                    this.updateCoins(player.inventory.getItemCount(Items_5.Items.COIN));
                    return this.entity;
                };
                HUD.prototype.updateHearts = function (health, maxHealth) {
                    var _this = this;
                    if (this.lastHealthCount === health && this.lastMaxHealthCount === maxHealth) {
                        return;
                    }
                    this.lastHealthCount = health;
                    this.lastMaxHealthCount = maxHealth;
                    this.hearts.forEach(function (c) { return _this.entity.removeComponent(c); });
                    var heartOffset = new point_31.Point(16, 0);
                    var full = Tilesets_11.Tilesets.instance.dungeonCharacters.getTileSource("ui_heart_full");
                    var half = Tilesets_11.Tilesets.instance.dungeonCharacters.getTileSource("ui_heart_half");
                    var empty = Tilesets_11.Tilesets.instance.dungeonCharacters.getTileSource("ui_heart_empty");
                    var result = [];
                    var fullHearts = Math.floor(health);
                    for (var i = 0; i < fullHearts; i++) {
                        result.push(new TileComponent_8.TileComponent(full, new TileTransform_10.TileTransform(this.offset.plus(heartOffset.times(i)))));
                    }
                    if (health % 1 > .5) {
                        result.push(new TileComponent_8.TileComponent(full, new TileTransform_10.TileTransform(this.offset.plus(heartOffset.times(result.length)))));
                    }
                    else if (health % 1 > 0) {
                        result.push(new TileComponent_8.TileComponent(half, new TileTransform_10.TileTransform(this.offset.plus(heartOffset.times(result.length)))));
                    }
                    while (result.length < maxHealth) {
                        result.push(new TileComponent_8.TileComponent(empty, new TileTransform_10.TileTransform(this.offset.plus(heartOffset.times(result.length)))));
                    }
                    result.forEach(function (c) { return _this.entity.addComponent(c); });
                };
                HUD.prototype.updateCoins = function (coins) {
                    if (this.lastCoinsCount === coins) {
                        return;
                    }
                    this.lastCoinsCount = coins;
                    if (!!this.coinCount) {
                        this.entity.removeComponent(this.coinCount);
                    }
                    this.coinCount = this.entity.addComponent(new BasicRenderComponent_2.BasicRenderComponent(new TextRender_2.TextRender("x" + coins, new point_31.Point(9, 9).plus(this.offset).plus(this.coinsOffset), "24px 'Press Start 2P'", "#facb3e")));
                };
                return HUD;
            }());
            exports_58("HUD", HUD);
        }
    };
});
System.register("game/quest_game", ["engine/point", "engine/game", "engine/View", "game/world/MapGenerator", "game/graphics/Tilesets", "game/characters/DudeFactory", "game/ui/HUD", "game/world/LocationManager", "game/characters/Dude", "engine/collision/CollisionEngine", "game/items/DroppedItem"], function (exports_59, context_59) {
    "use strict";
    var point_32, game_1, View_2, MapGenerator_1, Tilesets_12, DudeFactory_1, HUD_1, LocationManager_6, Dude_6, CollisionEngine_4, DroppedItem_2, ZOOM, QuestGame;
    var __moduleName = context_59 && context_59.id;
    return {
        setters: [
            function (point_32_1) {
                point_32 = point_32_1;
            },
            function (game_1_1) {
                game_1 = game_1_1;
            },
            function (View_2_1) {
                View_2 = View_2_1;
            },
            function (MapGenerator_1_1) {
                MapGenerator_1 = MapGenerator_1_1;
            },
            function (Tilesets_12_1) {
                Tilesets_12 = Tilesets_12_1;
            },
            function (DudeFactory_1_1) {
                DudeFactory_1 = DudeFactory_1_1;
            },
            function (HUD_1_1) {
                HUD_1 = HUD_1_1;
            },
            function (LocationManager_6_1) {
                LocationManager_6 = LocationManager_6_1;
            },
            function (Dude_6_1) {
                Dude_6 = Dude_6_1;
            },
            function (CollisionEngine_4_1) {
                CollisionEngine_4 = CollisionEngine_4_1;
            },
            function (DroppedItem_2_1) {
                DroppedItem_2 = DroppedItem_2_1;
            }
        ],
        execute: function () {
            ZOOM = 3.125;
            QuestGame = /** @class */ (function (_super) {
                __extends(QuestGame, _super);
                function QuestGame() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.tilesets = new Tilesets_12.Tilesets();
                    _this.dudeFactory = new DudeFactory_1.DudeFactory();
                    _this.hud = new HUD_1.HUD();
                    _this.gameEntityView = new View_2.View();
                    _this.uiView = new View_2.View();
                    return _this;
                }
                QuestGame.prototype.initialize = function () {
                    CollisionEngine_4.CollisionEngine.instance.setCollisionMatrix(new Map([
                        [CollisionEngine_4.CollisionEngine.DEFAULT_LAYER, [DroppedItem_2.DroppedItem.COLLISION_LAYER, Dude_6.Dude.COLLISION_LAYER]],
                        [Dude_6.Dude.COLLISION_LAYER, [Dude_6.Dude.COLLISION_LAYER]],
                    ]));
                    // World must be initialized before we do anything else
                    var mapGen = new MapGenerator_1.MapGenerator();
                    var world = mapGen.doIt();
                    this.locationManager = new LocationManager_6.LocationManager(world);
                    this.player = this.dudeFactory.newPlayer(new point_32.Point(-2, 2).times(Tilesets_12.TILE_SIZE));
                    // TEST: Spawn some guys
                    this.dudeFactory.newElf(new point_32.Point(20, 30));
                    this.dudeFactory.newImp(new point_32.Point(80, 30));
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
                        entities: this.locationManager.currentLocation.getEntities()
                    };
                    this.uiView = {
                        zoom: ZOOM,
                        offset: new point_32.Point(0, 0),
                        entities: this.getUIEntities()
                    };
                };
                // entities whose position is fixed on the camera
                QuestGame.prototype.getUIEntities = function () {
                    return [this.hud.get(this.player)];
                    /*
                    const dimensions = new Point(20, 16)  // tile dimensions
            
                    const result: TileComponent[] = []
                    result.push(new TileComponent(Tile.BORDER_1, new Point(0, 0)))
                    result.push(new TileComponent(Tile.BORDER_3, new Point(dimensions.x - 1, 0).times(TILE_SIZE)))
                    result.push(new TileComponent(Tile.BORDER_5, new Point(dimensions.x - 1, dimensions.y - 1).times(TILE_SIZE)))
                    result.push(new TileComponent(Tile.BORDER_7, new Point(0, dimensions.y - 1).times(TILE_SIZE)))
            
                    // horizontal lines
                    for (let i = 1; i < dimensions.x - 1; i++) {
                        result.push(new TileComponent(Tile.BORDER_2, new Point(i, 0).times(TILE_SIZE)))
                        result.push(new TileComponent(Tile.BORDER_6, new Point(i, dimensions.y - 1).times(TILE_SIZE)))
                    }
            
                    // vertical lines
                    for (let j = 1; j < dimensions.y - 1; j++) {
                        result.push(new TileComponent(Tile.BORDER_4, new Point(dimensions.x - 1, j).times(TILE_SIZE)))
                        result.push(new TileComponent(Tile.BORDER_8, new Point(0, j).times(TILE_SIZE)))
                    }
                    */
                };
                return QuestGame;
            }(game_1.Game));
            exports_59("QuestGame", QuestGame);
        }
    };
});
System.register("app", ["game/quest_game", "engine/engine", "game/graphics/Tilesets", "engine/Assets"], function (exports_60, context_60) {
    "use strict";
    var quest_game_1, engine_1, Tilesets_13, Assets_4;
    var __moduleName = context_60 && context_60.id;
    return {
        setters: [
            function (quest_game_1_1) {
                quest_game_1 = quest_game_1_1;
            },
            function (engine_1_1) {
                engine_1 = engine_1_1;
            },
            function (Tilesets_13_1) {
                Tilesets_13 = Tilesets_13_1;
            },
            function (Assets_4_1) {
                Assets_4 = Assets_4_1;
            }
        ],
        execute: function () {
            Assets_4.assets.loadImageFiles(Tilesets_13.Tilesets.getFilesToLoad()).then(function () {
                new engine_1.Engine(new quest_game_1.QuestGame(), document.getElementById('canvas'));
            });
        }
    };
});
System.register("engine/ui/Clickable", ["engine/component", "engine/util/utils"], function (exports_61, context_61) {
    "use strict";
    var component_14, utils_3, Clickable;
    var __moduleName = context_61 && context_61.id;
    return {
        setters: [
            function (component_14_1) {
                component_14 = component_14_1;
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
            }(component_14.Component));
            exports_61("Clickable", Clickable);
        }
    };
});
