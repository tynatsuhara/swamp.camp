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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
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
                Point.prototype.plusX = function (dx) {
                    return new Point(this.x + dx, this.y);
                };
                Point.prototype.plusY = function (dy) {
                    return new Point(this.x, this.y + dy);
                };
                Point.prototype.minus = function (other) {
                    return new Point(this.x - other.x, this.y - other.y);
                };
                Point.prototype.lerp = function (multiplier, goal) {
                    var clampedMultiplier = Math.max(Math.min(multiplier, 1), 0);
                    return this.plus(goal.minus(this).times(clampedMultiplier));
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
                /**
                 * Parses a string of the format "(x,y)"
                 * Behavior is undefined when the paramter is incorrectly formatted.
                 */
                Point.fromString = function (s) {
                    var halves = s.replace("(", "").replace(")", "").split(",").map(function (n) { return Number.parseInt(n); });
                    return new Point(halves[0], halves[1]);
                };
                Point.prototype.equals = function (pt) {
                    return pt.x == this.x && pt.y == this.y;
                };
                Point.prototype.apply = function (fn) {
                    return new Point(fn(this.x), fn(this.y));
                };
                Point.ZERO = new Point(0, 0);
                return Point;
            }());
            exports_1("Point", Point);
        }
    };
});
System.register("engine/renderer/RenderContext", ["engine/point"], function (exports_2, context_2) {
    "use strict";
    var point_1, RenderContext;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [
            function (point_1_1) {
                point_1 = point_1_1;
            }
        ],
        execute: function () {
            RenderContext = /** @class */ (function () {
                function RenderContext(canvas, context, view) {
                    this.canvas = canvas;
                    this.context = context;
                    this.view = view;
                    this.width = canvas.width;
                    this.height = canvas.height;
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
                RenderContext.prototype.measureText = function (text) {
                    return this.context.measureText(text);
                };
                RenderContext.prototype.fillText = function (size, font, color, text, point) {
                    var offset = this.view.offset.times(this.view.zoom).apply(Math.floor);
                    this.context.font = size * this.view.zoom + "px '" + font + "'";
                    this.context.fillStyle = color;
                    point = point.times(this.view.zoom).apply(Math.floor).plus(offset);
                    this.context.fillText(text, point.x, point.y + size * this.view.zoom);
                };
                RenderContext.prototype.fillRect = function (x, y, w, h) {
                    this.context.fillRect(x, y, w, h);
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
                    return new point_1.Point(point.x - (point.x % this.view.zoom), point.y - (point.y % this.view.zoom));
                };
                return RenderContext;
            }());
            exports_2("RenderContext", RenderContext);
        }
    };
});
System.register("engine/renderer/Renderer", ["engine/point", "engine/renderer/RenderContext"], function (exports_3, context_3) {
    "use strict";
    var point_2, RenderContext_1, Renderer;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (point_2_1) {
                point_2 = point_2_1;
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
                    this.context = canvas.getContext('2d', { alpha: true });
                    this.resizeCanvas();
                }
                Renderer.prototype.resizeCanvas = function () {
                    // make sure stuff doesn't get stretched
                    this.canvas.width = this.canvas.clientWidth;
                    this.canvas.height = this.canvas.clientHeight;
                };
                Renderer.prototype.render = function (views) {
                    var _this = this;
                    this.resizeCanvas();
                    this.context.imageSmoothingEnabled = false;
                    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    views.forEach(function (v) { return _this.renderView(v); });
                };
                Renderer.prototype.getDimensions = function () {
                    return new point_2.Point(this.canvas.width, this.canvas.height);
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
            exports_3("Renderer", Renderer);
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
                    this.isRightMouseDown = false;
                    this.isRightMouseHeld = false;
                    this.isRightMouseUp = false;
                    this.mouseWheelDeltaY = 0;
                    canvas.oncontextmenu = function () { return false; };
                    canvas.onmousedown = function (e) {
                        if (e.button === 0 /* LEFT */) {
                            _this.isMouseDown = true;
                            _this.isMouseHeld = true;
                            _this.isMouseUp = false;
                        }
                        else if (e.button == 2 /* RIGHT */) {
                            _this.isRightMouseDown = true;
                            _this.isRightMouseHeld = true;
                            _this.isRightMouseUp = false;
                        }
                    };
                    canvas.onmouseup = function (e) {
                        if (e.button === 0 /* LEFT */) {
                            _this.isMouseDown = false;
                            _this.isMouseHeld = false;
                            _this.isMouseUp = true;
                        }
                        else if (e.button === 2 /* RIGHT */) {
                            _this.isRightMouseDown = false;
                            _this.isRightMouseHeld = false;
                            _this.isRightMouseUp = true;
                        }
                    };
                    canvas.onmousemove = function (e) { return _this.mousePos = new point_3.Point(e.x - canvas.offsetLeft, e.y - canvas.offsetTop); };
                    canvas.onwheel = function (e) { return _this.mouseWheelDeltaY = e.deltaY; };
                    window.onkeydown = function (e) { return _this.keys.add(e.keyCode); };
                    window.onkeyup = function (e) { return _this.keys.delete(e.keyCode); };
                }
                Input.prototype.captureInput = function () {
                    var _this = this;
                    console.log();
                    var keys = Array.from(this.keys);
                    this.lastCapture = new CapturedInput(new Set(keys.filter(function (key) { return !_this.lastCapture.isKeyHeld(key); })), new Set(keys.slice()), new Set(this.lastCapture.getKeysHeld().filter(function (key) { return !_this.keys.has(key); })), this.mousePos, this.isMouseDown, this.isMouseHeld, this.isMouseUp, this.isRightMouseDown, this.isRightMouseHeld, this.isRightMouseUp, this.mouseWheelDeltaY);
                    // reset since these should only be true for 1 tick
                    this.isMouseDown = false;
                    this.isMouseUp = false;
                    this.isRightMouseDown = false;
                    this.isRightMouseUp = false;
                    this.mouseWheelDeltaY = 0;
                    return this.lastCapture;
                };
                return Input;
            }());
            exports_4("Input", Input);
            CapturedInput = /** @class */ (function () {
                function CapturedInput(keysDown, keysHeld, keysUp, mousePos, isMouseDown, isMouseHeld, isMouseUp, isRightMouseDown, isRightMouseHeld, isRightMouseUp, mouseWheelDeltaY) {
                    if (keysDown === void 0) { keysDown = new Set(); }
                    if (keysHeld === void 0) { keysHeld = new Set(); }
                    if (keysUp === void 0) { keysUp = new Set(); }
                    if (mousePos === void 0) { mousePos = new point_3.Point(0, 0); }
                    if (isMouseDown === void 0) { isMouseDown = false; }
                    if (isMouseHeld === void 0) { isMouseHeld = false; }
                    if (isMouseUp === void 0) { isMouseUp = false; }
                    if (isRightMouseDown === void 0) { isRightMouseDown = false; }
                    if (isRightMouseHeld === void 0) { isRightMouseHeld = false; }
                    if (isRightMouseUp === void 0) { isRightMouseUp = false; }
                    if (mouseWheelDeltaY === void 0) { mouseWheelDeltaY = 0; }
                    this.mousePos = new point_3.Point(0, 0);
                    this.keysDown = keysDown;
                    this.keysHeld = keysHeld;
                    this.keysUp = keysUp;
                    this.mousePos = mousePos;
                    this.isMouseDown = isMouseDown;
                    this.isMouseHeld = isMouseHeld;
                    this.isMouseUp = isMouseUp;
                    this.isRightMouseDown = isRightMouseDown;
                    this.isRightMouseHeld = isRightMouseHeld;
                    this.isRightMouseUp = isRightMouseUp;
                    this.mouseWheelDeltaY = mouseWheelDeltaY;
                }
                CapturedInput.prototype.scaledForView = function (view) {
                    return new CapturedInput(this.keysDown, this.keysHeld, this.keysUp, this.mousePos.div(view.zoom).minus(view.offset), this.isMouseDown, this.isMouseHeld, this.isMouseUp, this.isRightMouseDown, this.isRightMouseHeld, this.isRightMouseUp, this.mouseWheelDeltaY);
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
System.register("engine/renderer/RenderMethod", [], function (exports_5, context_5) {
    "use strict";
    var RenderMethod;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [],
        execute: function () {
            RenderMethod = /** @class */ (function () {
                function RenderMethod(depth) {
                    this.depth = depth;
                }
                return RenderMethod;
            }());
            exports_5("RenderMethod", RenderMethod);
        }
    };
});
System.register("engine/renderer/TextRender", ["engine/renderer/RenderMethod"], function (exports_6, context_6) {
    "use strict";
    var RenderMethod_1, TextRender;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (RenderMethod_1_1) {
                RenderMethod_1 = RenderMethod_1_1;
            }
        ],
        execute: function () {
            TextRender = /** @class */ (function (_super) {
                __extends(TextRender, _super);
                function TextRender(text, position, fontSizePx, font, color, depth) {
                    if (fontSizePx === void 0) { fontSizePx = 20; }
                    if (font === void 0) { font = "Comic Sans MS Regular"; }
                    if (color === void 0) { color = "red"; }
                    if (depth === void 0) { depth = 0; }
                    var _this = _super.call(this, depth) || this;
                    _this.text = text;
                    _this.position = position;
                    _this.size = fontSizePx;
                    _this.font = font;
                    _this.color = color;
                    return _this;
                }
                TextRender.prototype.render = function (context) {
                    context.fillText(this.size, this.font, this.color, this.text, this.position);
                };
                return TextRender;
            }(RenderMethod_1.RenderMethod));
            exports_6("TextRender", TextRender);
        }
    };
});
System.register("engine/renderer/BasicRenderComponent", ["engine/component"], function (exports_7, context_7) {
    "use strict";
    var component_1, BasicRenderComponent;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [
            function (component_1_1) {
                component_1 = component_1_1;
            }
        ],
        execute: function () {
            BasicRenderComponent = /** @class */ (function (_super) {
                __extends(BasicRenderComponent, _super);
                function BasicRenderComponent() {
                    var renders = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        renders[_i] = arguments[_i];
                    }
                    var _this = _super.call(this) || this;
                    _this.renders = renders;
                    return _this;
                }
                BasicRenderComponent.prototype.getRenderMethods = function () {
                    return this.renders;
                };
                return BasicRenderComponent;
            }(component_1.Component));
            exports_7("BasicRenderComponent", BasicRenderComponent);
        }
    };
});
System.register("engine/profiler", ["engine/View", "engine/Entity", "engine/point", "engine/renderer/TextRender", "engine/renderer/BasicRenderComponent"], function (exports_8, context_8) {
    "use strict";
    var View_1, Entity_1, point_4, TextRender_1, BasicRenderComponent_1, Profiler, round, MovingAverage, profiler;
    var __moduleName = context_8 && context_8.id;
    /**
     * Executes the given function and returns the duration it took to execute as well as the result
     */
    function measure(fn) {
        var start = new Date().getTime();
        var result = fn();
        return [new Date().getTime() - start, result];
    }
    exports_8("measure", measure);
    return {
        setters: [
            function (View_1_1) {
                View_1 = View_1_1;
            },
            function (Entity_1_1) {
                Entity_1 = Entity_1_1;
            },
            function (point_4_1) {
                point_4 = point_4_1;
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
                    this.fpsTracker = new MovingAverage();
                    this.updateTracker = new MovingAverage();
                    this.renderTracker = new MovingAverage();
                }
                Profiler.prototype.update = function (msSinceLastUpdate, msForUpdate, msForRender, componentsUpdated) {
                    this.fpsTracker.record(msSinceLastUpdate);
                    this.updateTracker.record(msForUpdate);
                    this.renderTracker.record(msForRender);
                    this.componentsUpdated = componentsUpdated;
                };
                Profiler.prototype.getView = function () {
                    var s = [
                        "FPS: " + round(1000 / this.fpsTracker.get()) + " (" + round(this.fpsTracker.get()) + " ms per frame)",
                        "update() duration ms: " + round(this.updateTracker.get(), 2),
                        "render() duration ms: " + round(this.renderTracker.get(), 2),
                        "components updated: " + this.componentsUpdated
                    ];
                    return new View_1.View([
                        new Entity_1.Entity(s.map(function (str, i) { return new BasicRenderComponent_1.BasicRenderComponent(new TextRender_1.TextRender(str, new point_4.Point(60, 70 + 25 * i))); }))
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
            exports_8("profiler", profiler = new Profiler());
        }
    };
});
System.register("engine/debug", [], function (exports_9, context_9) {
    "use strict";
    var debug;
    var __moduleName = context_9 && context_9.id;
    function loadDebug() {
        var stored = localStorage.getItem("debug_state");
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
                    localStorage.setItem("debug_state", JSON.stringify(debug));
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
System.register("engine/Assets", [], function (exports_10, context_10) {
    "use strict";
    var Assets, assets;
    var __moduleName = context_10 && context_10.id;
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
            exports_10("assets", assets = new Assets());
        }
    };
});
System.register("engine/util/utils", [], function (exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    function rectContains(rectPosition, rectDimensions, pt) {
        return pt.x >= rectPosition.x && pt.x < rectPosition.x + rectDimensions.x
            && pt.y >= rectPosition.y && pt.y < rectPosition.y + rectDimensions.y;
    }
    exports_11("rectContains", rectContains);
    return {
        setters: [],
        execute: function () {
            // from https://stackoverflow.com/questions/4391575/how-to-find-the-size-of-localstorage
            window["localStorageUsage"] = function () {
                var _lsTotal = 0, _xLen, _x;
                for (_x in localStorage) {
                    if (!localStorage.hasOwnProperty(_x)) {
                        continue;
                    }
                    _xLen = ((localStorage[_x].length + _x.length) * 2);
                    _lsTotal += _xLen;
                    console.log(_x.substr(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB");
                }
                ;
                console.log("Total = " + (_lsTotal / 1024).toFixed(2) + " KB");
            };
        }
    };
});
System.register("engine/renderer/LineRender", ["engine/renderer/RenderMethod"], function (exports_12, context_12) {
    "use strict";
    var RenderMethod_2, LineRender;
    var __moduleName = context_12 && context_12.id;
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
            exports_12("LineRender", LineRender);
        }
    };
});
System.register("engine/collision/Collider", ["engine/component", "engine/point", "engine/renderer/LineRender", "engine/debug", "engine/collision/CollisionEngine"], function (exports_13, context_13) {
    "use strict";
    var component_2, point_5, LineRender_1, debug_1, CollisionEngine_1, Collider;
    var __moduleName = context_13 && context_13.id;
    return {
        setters: [
            function (component_2_1) {
                component_2 = component_2_1;
            },
            function (point_5_1) {
                point_5 = point_5_1;
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
                    if (CollisionEngine_1.CollisionEngine.instance.canTranslate(this, new point_5.Point(dx, dy))) {
                        this._position = point;
                        CollisionEngine_1.CollisionEngine.instance.checkAndUpdateCollisions(this);
                    }
                    else if (CollisionEngine_1.CollisionEngine.instance.canTranslate(this, new point_5.Point(dx, 0))) {
                        this._position = this._position.plus(new point_5.Point(dx, 0));
                        CollisionEngine_1.CollisionEngine.instance.checkAndUpdateCollisions(this);
                    }
                    else if (CollisionEngine_1.CollisionEngine.instance.canTranslate(this, new point_5.Point(0, dy))) {
                        this._position = this._position.plus(new point_5.Point(0, dy));
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
                        return new point_5.Point(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
                    }
                    return null;
                };
                return Collider;
            }(component_2.Component));
            exports_13("Collider", Collider);
        }
    };
});
System.register("engine/collision/CollisionEngine", ["engine/point", "engine/util/utils"], function (exports_14, context_14) {
    "use strict";
    var point_6, utils_1, CollisionEngine, engine;
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [
            function (point_6_1) {
                point_6 = point_6_1;
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
                        return utils_1.rectContains(new point_6.Point(xMax, yMin), new point_6.Point(xMax - xMin, yMax - yMin), pt);
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
            exports_14("CollisionEngine", CollisionEngine);
            engine = new CollisionEngine();
        }
    };
});
System.register("engine/engine", ["engine/renderer/Renderer", "engine/input", "engine/profiler", "engine/debug", "engine/collision/CollisionEngine"], function (exports_15, context_15) {
    "use strict";
    var Renderer_1, input_1, profiler_1, debug_2, CollisionEngine_2, UpdateViewsContext, AwakeData, StartData, UpdateData, Engine, ALREADY_STARTED_COMPONENT;
    var __moduleName = context_15 && context_15.id;
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
            exports_15("UpdateViewsContext", UpdateViewsContext);
            AwakeData = /** @class */ (function () {
                function AwakeData() {
                }
                return AwakeData;
            }());
            exports_15("AwakeData", AwakeData);
            StartData = /** @class */ (function () {
                function StartData() {
                }
                return StartData;
            }());
            exports_15("StartData", StartData);
            UpdateData = /** @class */ (function () {
                function UpdateData() {
                }
                return UpdateData;
            }());
            exports_15("UpdateData", UpdateData);
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
                    var componentsUpdated = 0;
                    var updateDuration = profiler_1.measure(function () {
                        views.forEach(function (v) {
                            v.entities = v.entities.filter(function (e) { return !!e; });
                            var startData = {
                                dimensions: updateViewsContext.dimensions.div(v.zoom)
                            };
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
                                componentsUpdated++;
                            }); });
                        });
                    })[0];
                    var renderDuration = profiler_1.measure(function () {
                        _this.renderer.render(views);
                    })[0];
                    if (debug_2.debug.showProfiler) {
                        profiler_1.profiler.update(elapsed, updateDuration, renderDuration, componentsUpdated);
                    }
                    this.lastUpdateMillis = time;
                    requestAnimationFrame(function () { return _this.tick(); });
                };
                Engine.prototype.getViews = function (context) {
                    return this.game.getViews(context).concat(debug_2.debug.showProfiler ? [profiler_1.profiler.getView()] : []);
                };
                return Engine;
            }());
            exports_15("Engine", Engine);
            ALREADY_STARTED_COMPONENT = function (startData) {
                throw new Error("start() has already been called on this component");
            };
        }
    };
});
System.register("engine/component", [], function (exports_16, context_16) {
    "use strict";
    var Component;
    var __moduleName = context_16 && context_16.id;
    return {
        setters: [],
        execute: function () {
            Component = /** @class */ (function () {
                function Component() {
                    this.enabled = true;
                }
                /**
                 * Called once, immediately after entity is defined and before start() is called.
                 * It is safe to add additional components to the entity in this function.
                 */
                Component.prototype.awake = function (awakeData) { };
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
            exports_16("Component", Component);
        }
    };
});
System.register("engine/Entity", [], function (exports_17, context_17) {
    "use strict";
    var Entity;
    var __moduleName = context_17 && context_17.id;
    return {
        setters: [],
        execute: function () {
            /**
             * An object which is updated by the engine. Should be attached to a game view.
             * An Entity is essentially a logical grouping of components.
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
                    component.awake({});
                    return component;
                };
                Entity.prototype.addComponents = function (components) {
                    var _this = this;
                    components.forEach(function (e) { return _this.addComponent(e); });
                    return components;
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
            exports_17("Entity", Entity);
        }
    };
});
System.register("engine/View", ["engine/point"], function (exports_18, context_18) {
    "use strict";
    var point_7, View;
    var __moduleName = context_18 && context_18.id;
    return {
        setters: [
            function (point_7_1) {
                point_7 = point_7_1;
            }
        ],
        execute: function () {
            View = /** @class */ (function () {
                function View(entities, zoom, offset) {
                    if (entities === void 0) { entities = []; }
                    if (zoom === void 0) { zoom = 1; }
                    if (offset === void 0) { offset = new point_7.Point(0, 0); }
                    this.entities = []; // entities ordered by depth (back to front)
                    this.zoom = 1; // scale of the view
                    this.offset = new point_7.Point(0, 0); // transform applied to all entities in the view (scaled by zoom)
                    this.entities = entities;
                    this.zoom = zoom;
                    this.offset = offset;
                }
                return View;
            }());
            exports_18("View", View);
        }
    };
});
System.register("engine/game", [], function (exports_19, context_19) {
    "use strict";
    var Game;
    var __moduleName = context_19 && context_19.id;
    return {
        setters: [],
        execute: function () {
            Game = /** @class */ (function () {
                function Game() {
                }
                Game.prototype.initialize = function () { };
                return Game;
            }());
            exports_19("Game", Game);
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
                // TODO convert to unstructured object parameter
                function TileTransform(position, dimensions, // if null, match the dimensions of the source image
                rotation, mirrorX, mirrorY, depth) {
                    if (position === void 0) { position = new point_8.Point(0, 0); }
                    if (dimensions === void 0) { dimensions = null; }
                    if (rotation === void 0) { rotation = 0; }
                    if (mirrorX === void 0) { mirrorX = false; }
                    if (mirrorY === void 0) { mirrorY = false; }
                    if (depth === void 0) { depth = 0; }
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
System.register("engine/tiles/StaticTileSource", ["engine/point", "engine/renderer/ImageRender", "engine/tiles/TileTransform", "engine/tiles/TileComponent"], function (exports_24, context_24) {
    "use strict";
    var point_9, ImageRender_1, TileTransform_2, TileComponent_1, StaticTileSource;
    var __moduleName = context_24 && context_24.id;
    return {
        setters: [
            function (point_9_1) {
                point_9 = point_9_1;
            },
            function (ImageRender_1_1) {
                ImageRender_1 = ImageRender_1_1;
            },
            function (TileTransform_2_1) {
                TileTransform_2 = TileTransform_2_1;
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
                StaticTileSource.prototype.toComponent = function (transform) {
                    if (transform === void 0) { transform = new TileTransform_2.TileTransform(); }
                    return new TileComponent_1.TileComponent(this, transform);
                };
                StaticTileSource.prototype.filtered = function (filter) {
                    var canvas = document.createElement("canvas");
                    canvas.width = this.dimensions.x;
                    canvas.height = this.dimensions.y;
                    var context = canvas.getContext("2d");
                    context.imageSmoothingEnabled = false;
                    context.drawImage(this.image, this.position.x, this.position.y, this.dimensions.x, this.dimensions.y, 0, 0, this.dimensions.x, this.dimensions.y);
                    var imageData = context.getImageData(0, 0, this.dimensions.x, this.dimensions.y);
                    filter(imageData);
                    context.putImageData(imageData, 0, 0);
                    return new StaticTileSource(canvas, point_9.Point.ZERO, this.dimensions);
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
                function BinaryHeap(scoreFunction, contents) {
                    var _this = this;
                    if (contents === void 0) { contents = []; }
                    this.content = [];
                    this.scoreFunction = scoreFunction;
                    contents.forEach(function (item) { return _this.push(item); });
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
                BinaryHeap.prototype.peek = function () {
                    if (this.content.length === 0) {
                        throw new Error("cannot call peek() on an empty heap");
                    }
                    return this.content[0];
                };
                BinaryHeap.prototype.remove = function (node) {
                    var length = this.content.length;
                    // To remove a value, we must search through the array to find it.
                    for (var i = 0; i < length; i++) {
                        if (this.content[i] != node)
                            continue;
                        // When it is found, the process seen in 'pop' is repeated to fill up the hole.
                        var end = this.content.pop();
                        // If the element we popped was the one we needed to remove, we're done.
                        if (i == length - 1)
                            break;
                        // Otherwise, we replace the removed element with the popped one, 
                        // and allow it to float up or sink down as appropriate.
                        this.content[i] = end;
                        this.bubbleUp(i);
                        this.sinkDown(i);
                        break;
                    }
                };
                BinaryHeap.prototype.size = function () {
                    return this.content.length;
                };
                BinaryHeap.prototype.getContents = function (sorted) {
                    if (sorted === void 0) { sorted = false; }
                    var copy = __spreadArrays(this.content);
                    if (sorted) {
                        copy.sort(this.scoreFunction);
                    }
                    return copy;
                };
                BinaryHeap.prototype.bubbleUp = function (n) {
                    // Fetch the element that has to be moved.
                    var element = this.content[n], score = this.scoreFunction(element);
                    // When at 0, an element can not go up any further.
                    while (n > 0) {
                        // Compute the parent element's index, and fetch it.
                        var parentN = Math.floor((n + 1) / 2) - 1, parent_1 = this.content[parentN];
                        // If the parent has a lesser score, things are in order and we are done.
                        if (score >= this.scoreFunction(parent_1))
                            break;
                        // Otherwise, swap the parent with the current element and continue.
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
                        // This is used to store the new position of the element, if any.
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
    var point_10, BinaryHeap_1, Grid;
    var __moduleName = context_26 && context_26.id;
    return {
        setters: [
            function (point_10_1) {
                point_10 = point_10_1;
            },
            function (BinaryHeap_1_1) {
                BinaryHeap_1 = BinaryHeap_1_1;
            }
        ],
        execute: function () {
            // an infinite grid using x/y coordinates (x increases to the right, y increases down)
            Grid = /** @class */ (function () {
                function Grid() {
                    this.map = {};
                }
                Grid.prototype.set = function (pt, entry) {
                    this.map[pt.toString()] = entry;
                };
                // returns null if not present in the grid
                Grid.prototype.get = function (pt) {
                    return this.map[pt.toString()];
                };
                Grid.prototype.remove = function (pt) {
                    delete this.map[pt.toString()];
                };
                Grid.prototype.removeAll = function (element) {
                    var _this = this;
                    Object.entries(this.map)
                        .filter(function (kv) { return kv[1] === element; })
                        .forEach(function (kv) { return delete _this.map[kv[0]]; });
                };
                Grid.prototype.entries = function () {
                    return Object.entries(this.map).map(function (tuple) { return [point_10.Point.fromString(tuple[0]), tuple[1]]; });
                };
                Grid.prototype.keys = function () {
                    return Object.keys(this.map).map(function (ptStr) { return point_10.Point.fromString(ptStr); });
                };
                Grid.prototype.values = function () {
                    return Object.values(this.map);
                };
                /**
                 * Returns a path inclusive of start and end
                 */
                Grid.prototype.findPath = function (start, end, heuristic, isOccupied, getNeighbors) {
                    var _this = this;
                    if (heuristic === void 0) { heuristic = function (pt) { return pt.distanceTo(end); }; }
                    if (isOccupied === void 0) { isOccupied = function (pt) { return !!_this.get(pt); }; }
                    if (getNeighbors === void 0) { getNeighbors = function (pt) { return [new point_10.Point(pt.x, pt.y - 1), new point_10.Point(pt.x - 1, pt.y), new point_10.Point(pt.x + 1, pt.y), new point_10.Point(pt.x, pt.y + 1)]; }; }
                    if (isOccupied(start) || isOccupied(end) || start.equals(end)) {
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
                Grid.prototype.save = function () {
                    return this.map;
                };
                Grid.load = function (map) {
                    var g = new Grid();
                    g.map = map;
                    return g;
                };
                return Grid;
            }());
            exports_26("Grid", Grid);
        }
    };
});
System.register("engine/tiles/TileSetAnimation", ["engine/tiles/TileTransform", "engine/tiles/AnimatedTileComponent"], function (exports_27, context_27) {
    "use strict";
    var TileTransform_3, AnimatedTileComponent_1, TileSetAnimation;
    var __moduleName = context_27 && context_27.id;
    return {
        setters: [
            function (TileTransform_3_1) {
                TileTransform_3 = TileTransform_3_1;
            },
            function (AnimatedTileComponent_1_1) {
                AnimatedTileComponent_1 = AnimatedTileComponent_1_1;
            }
        ],
        execute: function () {
            // TODO rename this to align with the interface
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
                TileSetAnimation.prototype.toComponent = function (transform) {
                    if (transform === void 0) { transform = new TileTransform_3.TileTransform(); }
                    return new AnimatedTileComponent_1.AnimatedTileComponent([this]);
                };
                TileSetAnimation.prototype.filtered = function (filter) {
                    return new TileSetAnimation(this.frames.map(function (f) { return [f[0].filtered(filter), f[1]]; }));
                };
                return TileSetAnimation;
            }());
            exports_27("TileSetAnimation", TileSetAnimation);
        }
    };
});
System.register("engine/util/Animator", [], function (exports_28, context_28) {
    "use strict";
    var Animator;
    var __moduleName = context_28 && context_28.id;
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
            exports_28("Animator", Animator);
        }
    };
});
System.register("engine/tiles/AnimatedTileComponent", ["engine/tiles/TileComponent", "engine/util/Animator", "engine/tiles/TileTransform"], function (exports_29, context_29) {
    "use strict";
    var TileComponent_2, Animator_1, TileTransform_4, AnimatedTileComponent;
    var __moduleName = context_29 && context_29.id;
    return {
        setters: [
            function (TileComponent_2_1) {
                TileComponent_2 = TileComponent_2_1;
            },
            function (Animator_1_1) {
                Animator_1 = Animator_1_1;
            },
            function (TileTransform_4_1) {
                TileTransform_4 = TileTransform_4_1;
            }
        ],
        execute: function () {
            AnimatedTileComponent = /** @class */ (function (_super) {
                __extends(AnimatedTileComponent, _super);
                // defaultAnimation has a key of 0, the following is 1, etc
                function AnimatedTileComponent(animations, transform) {
                    if (transform === void 0) { transform = new TileTransform_4.TileTransform(); }
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
                AnimatedTileComponent.prototype.fastForward = function (ms) {
                    this.animator.update(Math.floor(ms));
                };
                return AnimatedTileComponent;
            }(TileComponent_2.TileComponent));
            exports_29("AnimatedTileComponent", AnimatedTileComponent);
        }
    };
});
System.register("engine/collision/BoxCollider", ["engine/collision/Collider", "engine/point", "engine/util/utils", "engine/collision/CollisionEngine"], function (exports_30, context_30) {
    "use strict";
    var Collider_1, point_11, utils_2, CollisionEngine_3, BoxCollider;
    var __moduleName = context_30 && context_30.id;
    return {
        setters: [
            function (Collider_1_1) {
                Collider_1 = Collider_1_1;
            },
            function (point_11_1) {
                point_11 = point_11_1;
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
                        new point_11.Point(this.position.x, this.position.y),
                        new point_11.Point(this.position.x + this.dimensions.x, this.position.y),
                        new point_11.Point(this.position.x + this.dimensions.x, this.position.y + this.dimensions.y),
                        new point_11.Point(this.position.x, this.position.y + this.dimensions.y)
                    ];
                };
                BoxCollider.prototype.isWithinBounds = function (pt) {
                    return utils_2.rectContains(this.position, this.dimensions, pt);
                };
                return BoxCollider;
            }(Collider_1.Collider));
            exports_30("BoxCollider", BoxCollider);
        }
    };
});
System.register("game/graphics/SingleFileTileLoader", ["engine/point", "engine/tiles/StaticTileSource", "engine/Assets", "engine/tiles/TileSetAnimation"], function (exports_31, context_31) {
    "use strict";
    var point_12, StaticTileSource_1, Assets_1, TileSetAnimation_1, SingleFileTileLoader;
    var __moduleName = context_31 && context_31.id;
    return {
        setters: [
            function (point_12_1) {
                point_12 = point_12_1;
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
                SingleFileTileLoader.prototype.getNineSlice = function (key) {
                    var pt = this.map.get(key);
                    if (!pt) {
                        throw new Error(key + " is not a valid tile");
                    }
                    var result = [];
                    for (var y = 0; y < 3; y++) {
                        for (var x = 0; x < 3; x++) {
                            result.push(this.getTileAt(pt.plus(new point_12.Point(x, y))));
                        }
                    }
                    return result;
                };
                SingleFileTileLoader.prototype.getTileSource = function (key) {
                    var result = this.map.get(key);
                    if (!result) {
                        throw new Error(key + " is not a valid tile");
                    }
                    return this.getTileAt(result);
                };
                SingleFileTileLoader.prototype.getTileAt = function (pos) {
                    return new StaticTileSource_1.StaticTileSource(this.image(), pos.times(this.tileSize + this.padding), new point_12.Point(this.tileSize, this.tileSize));
                };
                SingleFileTileLoader.prototype.getTileSetAnimation = function (key, frames, speed) {
                    var _this = this;
                    var result = this.map.get(key);
                    if (!result) {
                        return null;
                    }
                    return new TileSetAnimation_1.TileSetAnimation(Array.from({ length: frames }, function (k, v) { return v; })
                        .map(function (index) { return _this.getTileAt(result.plus(new point_12.Point(index, 0))); })
                        .map(function (tileSource) { return [tileSource, speed]; }));
                };
                SingleFileTileLoader.prototype.image = function () {
                    return Assets_1.assets.getImageByFileName(this.filename);
                };
                return SingleFileTileLoader;
            }());
            exports_31("SingleFileTileLoader", SingleFileTileLoader);
        }
    };
});
System.register("game/graphics/DungeonTilesetII", ["engine/tiles/StaticTileSource", "engine/point", "engine/tiles/TileSetAnimation", "engine/Assets"], function (exports_32, context_32) {
    "use strict";
    var StaticTileSource_2, point_13, TileSetAnimation_2, Assets_2, map, DungeonTilesetII;
    var __moduleName = context_32 && context_32.id;
    return {
        setters: [
            function (StaticTileSource_2_1) {
                StaticTileSource_2 = StaticTileSource_2_1;
            },
            function (point_13_1) {
                point_13 = point_13_1;
            },
            function (TileSetAnimation_2_1) {
                TileSetAnimation_2 = TileSetAnimation_2_1;
            },
            function (Assets_2_1) {
                Assets_2 = Assets_2_1;
            }
        ],
        execute: function () {
            map = new Map("\n    wall_top_left 16 0 16 16\n    wall_top_mid 32 0 16 16\n    wall_top_right 48 0 16 16\n\n    wall_left 16 16 16 16\n    wall_mid 32 16 16 16\n    wall_right 48 16 16 16\n\n    wall_fountain_top 64 0 16 16\n    wall_fountain_mid_red_anim 64 16 16 16 3\n    wall_fountain_basin_red_anim 64 32 16 16 3\n    wall_fountain_mid_blue_anim 64 48 16 16 3\n    wall_fountain_basin_blue_anim 64 64 16 16 3\n\n    wall_hole_1 48 32 16 16\n    wall_hole_2 48 48 16 16\n\n    wall_banner_red 16 32 16 16\n    wall_banner_blue 32 32 16 16\n    wall_banner_green 16 48 16 16\n    wall_banner_yellow 32 48 16 16\n\n    column_top 80 80 16 16\n    column_mid 80 96 16 16\n    coulmn_base 80 112 16 16\n    wall_column_top 96 80 16 16\n    wall_column_mid 96 96 16 16\n    wall_coulmn_base 96 112 16 16\n\n    wall_goo 64 80 16 16\n    wall_goo_base 64 96 16 16\n\n    floor_1 16 64 16 16\n    floor_2 32 64 16 16\n    floor_3 48 64 16 16\n    floor_4 16 80 16 16\n    floor_5 32 80 16 16\n    floor_6 48 80 16 16\n    floor_7 16 96 16 16\n    floor_8 32 96 16 16\n    floor_ladder 48 96 16 16\n\n    floor_spikes_anim 16 176 16 16 4\n\n    wall_side_top_left 0 112 16 16\n    wall_side_top_right 16 112 16 16\n    wall_side_mid_left 0 128 16 16\n    wall_side_mid_right 16 128 16 16\n    wall_side_front_left 0 144 16 16\n    wall_side_front_right 16 144 16 16\n\n    wall_corner_top_left 32 112 16 16\n    wall_corner_top_right 48 112 16 16\n    wall_corner_left 32 128 16 16\n    wall_corner_right 48 128 16 16\n    wall_corner_bottom_left 32 144 16 16\n    wall_corner_bottom_right 48 144 16 16\n    wall_corner_front_left 32 160 16 16\n    wall_corner_front_right 48 160 16 16\n\n    wall_inner_corner_l_top_left 80 128 16 16\n    wall_inner_corner_l_top_rigth 64 128 16 16\n    wall_inner_corner_mid_left 80 144 16 16\n    wall_inner_corner_mid_rigth 64 144 16 16\n    wall_inner_corner_t_top_left 80 160 16 16\n    wall_inner_corner_t_top_rigth 64 160 16 16\n\n    edge 96 128 16 16\n    hole  96 144 16 16\n\n    doors_all 16 221 64 35\n    doors_frame_left 16 224 16 32\n    doors_frame_top 32 221 32 3\n    doors_frame_righ 63 224 16 32\n    doors_leaf_closed 32 224 32 32\n    doors_leaf_open 80 224 32 32\n\n    chest_empty_open_anim 304 288 16 16 3\n    chest_full_open_anim 304 304 16 16 3\n    chest_mimic_open_anim 304 320 16 16 3\n\n    flask_big_red 288 224 16 16\n    flask_big_blue 304 224 16 16\n    flask_big_green 320 224 16 16\n    flask_big_yellow 336 224 16 16\n\n    flask_red 288 240 16 16\n    flask_blue 304 240 16 16\n    flask_green 320 240 16 16\n    flask_yellow 336 240 16 16\n\n    skull 288 320 16 16\n    crate 288 298 16 22\n\n    shield_0 288 336 16 16\n    shield_1 304 336 16 16\n    shield_2 320 336 16 16\n    shield_3 336 336 16 16\n    shield_4 288 352 16 16\n    shield_5 304 352 16 16\n    shield_6 320 352 16 16\n    shield_7 336 352 16 16\n    shield_8 288 368 16 16\n    shield_9 304 368 16 16\n    shield_10 320 368 16 16\n    shield_11 336 368 16 16\n\n    coin_anim 288 272 8 8 4\n\n    ui_heart_full 288 256 16 16\n    ui_heart_half 304 256 16 16\n    ui_heart_empty 320 256 16 16\n\n    weapon_knife 293 18 6 13\n    weapon_rusty_sword 307 26 10 21\n    weapon_regular_sword 323 26 10 21\n    weapon_red_gem_sword 339 26 10 21\n    weapon_big_hammer 291 42 10 37\n    weapon_hammer 307 55 10 24\n    weapon_baton_with_spikes 323 57 10 22\n    weapon_mace 339 55 10 24\n    weapon_katana 293 82 6 29\n    weapon_saw_sword 307 86 10 25\n    weapon_anime_sword 322 81 12 30\n    weapon_axe 341 90 9 21\n    weapon_machete 294 121 5 22\n    weapon_cleaver 310 124 8 19\n    weapon_duel_sword 325 113 9 30\n    weapon_knight_sword 339 114 10 29\n    weapon_golden_sword 291 153 10 22\n    weapon_lavish_sword 307 145 10 30\n    weapon_red_magic_staff 324 145 8 30\n    weapon_green_magic_staff 340 145 8 30\n    weapon_spear 293 177 6 30\n\n    tiny_zombie_idle_anim 368 16 16 16 4\n    tiny_zombie_run_anim 432 16 16 16 4\n\n    goblin_idle_anim 368 32 16 16 4\n    goblin_run_anim 432 32 16 16 4\n\n    imp_idle_anim 368 48 16 16 4\n    imp_run_anim 432 48 16 16 4\n\n    skelet_idle_anim 368 80 16 16 4\n    skelet_run_anim 432 80 16 16 4\n\n    muddy_idle_anim 368 112 16 16 4\n    muddy_run_anim 368 112 16 16 4\n\n    swampy_idle_anim 432 112 16 16 4\n    swampy_run_anim 432 112 16 16 4\n\n    zombie_idle_anim 368 144 16 16 4\n    zombie_run_anim 368 144 16 16 4\n\n    ice_zombie_idle_anim 432 144 16 16 4\n    ice_zombie_run_anim 432 144 16 16 4\n\n    masked_orc_idle_anim 368 172 16 20 4\n    masked_orc_run_anim 432 172 16 20 4\n\n    orc_warrior_idle_anim 368 204 16 20 4\n    orc_warrior_run_anim 432 204 16 20 4\n\n    orc_shaman_idle_anim 368 236 16 20 4\n    orc_shaman_run_anim 432 236 16 20 4\n\n    necromancer_idle_anim 368 268 16 20 4\n    necromancer_run_anim 368 268 16 20 4\n\n    wogol_idle_anim 368 300 16 20 4\n    wogol_run_anim 432 300 16 20 4\n\n    chort_idle_anim 368 328 16 24 4\n    chort_run_anim 432 328 16 24 4\n\n    big_zombie_idle_anim 16 270 32 34 4\n    big_zombie_run_anim 144 270 32 34 4\n\n    ogre_idle_anim  16 320 32 32 4\n    ogre_run_anim 144 320 32 32 4\n    \n    big_demon_idle_anim  16 364 32 36 4\n    big_demon_run_anim 144 364 32 36 4\n\n    elf_f_idle_anim 128 4 16 28 4\n    elf_f_run_anim 192 4 16 28 4\n    elf_f_hit_anim 256 4 16 28 1\n\n    elf_m_idle_anim 128 36 16 28 4\n    elf_m_run_anim 192 36 16 28 4\n    elf_m_hit_anim 256 36 16 28 1\n\n    knight_f_idle_anim 128 68 16 28 4\n    knight_f_run_anim 192 68 16 28 4\n    knight_f_hit_anim 256 68 16 28 1\n\n    knight_m_idle_anim 128 100 16 28 4\n    knight_m_run_anim 192 100 16 28 4\n    knight_m_hit_anim 256 100 16 28 1\n\n    wizzard_f_idle_anim 128 132 16 28 4\n    wizzard_f_run_anim 192 132 16 28 4\n    wizzard_f_hit_anim 256 132 16 28 1\n\n    wizzard_m_idle_anim 128 164 16 28 4\n    wizzard_m_run_anim 192 164 16 28 4\n    wizzard_m_hit_anim 256 164 16 28 1\n\n    lizard_f_idle_anim 128 196 16 28 4\n    lizard_f_run_anim 192 196 16 28 4\n    lizard_f_hit_anim 256 196 16 28 1\n\n    lizard_m_idle_anim 128 228 16 28 4\n    lizard_m_run_anim 192 228 16 28 4\n    lizard_m_hit_anim 256 228 16 28 1\n    ".split("\n")
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
                    if (!row) {
                        return null;
                    }
                    if ((row === null || row === void 0 ? void 0 : row.length) != 4) {
                        throw Error("invalid tile spec");
                    }
                    var pos = new point_13.Point(+row[0], +row[1]);
                    var dim = new point_13.Point(+row[2], +row[3]);
                    return new StaticTileSource_2.StaticTileSource(this.getFile(), pos, dim);
                };
                DungeonTilesetII.prototype.getTileSetAnimation = function (key, speed) {
                    var _this = this;
                    var row = map.get(key);
                    if (!row) {
                        return null;
                    }
                    if ((row === null || row === void 0 ? void 0 : row.length) != 5) {
                        throw Error("invalid animation spec");
                    }
                    var frames = Array.from({ length: +row[4] }, function (value, key) { return key; })
                        .map(function (frameIndex) {
                        var pos = new point_13.Point(+row[0] + frameIndex * +row[2], +row[1]);
                        var dim = new point_13.Point(+row[2], +row[3]);
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
            exports_32("DungeonTilesetII", DungeonTilesetII);
        }
    };
});
System.register("game/graphics/SplitFileTileLoader", ["engine/tiles/StaticTileSource", "engine/Assets", "engine/point", "engine/tiles/TileSetAnimation"], function (exports_33, context_33) {
    "use strict";
    var StaticTileSource_3, Assets_3, point_14, TileSetAnimation_3, SplitFileTileLoader;
    var __moduleName = context_33 && context_33.id;
    return {
        setters: [
            function (StaticTileSource_3_1) {
                StaticTileSource_3 = StaticTileSource_3_1;
            },
            function (Assets_3_1) {
                Assets_3 = Assets_3_1;
            },
            function (point_14_1) {
                point_14 = point_14_1;
            },
            function (TileSetAnimation_3_1) {
                TileSetAnimation_3 = TileSetAnimation_3_1;
            }
        ],
        execute: function () {
            SplitFileTileLoader = /** @class */ (function () {
                function SplitFileTileLoader(dirPath) {
                    this.dirPath = dirPath;
                }
                SplitFileTileLoader.prototype.getTileSource = function (key) {
                    var image = Assets_3.assets.getImageByFileName(this.dirPath + "/" + key + ".png");
                    return new StaticTileSource_3.StaticTileSource(image, new point_14.Point(0, 0), new point_14.Point(image.width, image.height));
                };
                SplitFileTileLoader.prototype.getTileSetAnimation = function (key, frames, speed) {
                    var framesArr = [];
                    for (var i = 1; i <= frames; i++) {
                        framesArr.push(this.getTileSource(key + "_" + i));
                    }
                    return new TileSetAnimation_3.TileSetAnimation(framesArr.map(function (f) { return [f, speed]; }));
                };
                return SplitFileTileLoader;
            }());
            exports_33("SplitFileTileLoader", SplitFileTileLoader);
        }
    };
});
System.register("game/graphics/OneBitTileset", ["engine/point", "game/graphics/SingleFileTileLoader"], function (exports_34, context_34) {
    "use strict";
    var point_15, SingleFileTileLoader_1, OneBitTileset;
    var __moduleName = context_34 && context_34.id;
    return {
        setters: [
            function (point_15_1) {
                point_15 = point_15_1;
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
                        ["tent", new point_15.Point(6, 20)],
                        ["coin", new point_15.Point(22, 4)],
                        ["wood", new point_15.Point(18, 6)],
                        ["rock", new point_15.Point(5, 2)],
                        ["invBoxNW", new point_15.Point(16, 19)],
                        ["textBoxNW", new point_15.Point(16, 16)],
                        ["tooltipLeft", new point_15.Point(16, 16)],
                        ["tooltipCenter", new point_15.Point(17, 16)],
                        ["tooltipRight", new point_15.Point(18, 16)],
                        ["btnLeft_white", new point_15.Point(16, 17)],
                        ["btnCenter_white", new point_15.Point(17, 17)],
                        ["btnRight_white", new point_15.Point(18, 17)],
                        ["btnLeft_red", new point_15.Point(16, 18)],
                        ["btnCenter_red", new point_15.Point(17, 18)],
                        ["btnRight_red", new point_15.Point(18, 18)],
                        ["arrow_up_1", new point_15.Point(28, 20)],
                        ["arrow_right_1", new point_15.Point(29, 20)],
                        ["arrow_down_1", new point_15.Point(30, 20)],
                        ["arrow_left_1", new point_15.Point(31, 20)],
                        ["arrow_up_2", new point_15.Point(28, 21)],
                        ["arrow_right_2", new point_15.Point(29, 21)],
                        ["arrow_down_2", new point_15.Point(30, 21)],
                        ["arrow_left_2", new point_15.Point(31, 21)],
                        ["floppy_drive", new point_15.Point(26, 28)],
                        ["small_arrow_up", new point_15.Point(23, 20)],
                        ["small_arrow_right", new point_15.Point(24, 20)],
                        ["small_arrow_down", new point_15.Point(25, 20)],
                        ["small_arrow_left", new point_15.Point(26, 20)],
                        ["slash", new point_15.Point(25, 11)],
                        [" ", new point_15.Point(0, 0)],
                        ["0", new point_15.Point(19, 29)],
                        ["1", new point_15.Point(20, 29)],
                        ["2", new point_15.Point(21, 29)],
                        ["3", new point_15.Point(22, 29)],
                        ["4", new point_15.Point(23, 29)],
                        ["5", new point_15.Point(24, 29)],
                        ["6", new point_15.Point(25, 29)],
                        ["7", new point_15.Point(26, 29)],
                        ["8", new point_15.Point(27, 29)],
                        ["9", new point_15.Point(28, 29)],
                        [":", new point_15.Point(29, 29)],
                        [".", new point_15.Point(30, 29)],
                        ["%", new point_15.Point(31, 29)],
                        ["!", new point_15.Point(19, 25)],
                        ["?", new point_15.Point(21, 25)],
                        ["$", new point_15.Point(19, 28)],
                        ["a", new point_15.Point(19, 30)],
                        ["b", new point_15.Point(20, 30)],
                        ["c", new point_15.Point(21, 30)],
                        ["d", new point_15.Point(22, 30)],
                        ["e", new point_15.Point(23, 30)],
                        ["f", new point_15.Point(24, 30)],
                        ["g", new point_15.Point(25, 30)],
                        ["h", new point_15.Point(26, 30)],
                        ["i", new point_15.Point(27, 30)],
                        ["j", new point_15.Point(28, 30)],
                        ["k", new point_15.Point(29, 30)],
                        ["l", new point_15.Point(30, 30)],
                        ["m", new point_15.Point(31, 30)],
                        ["n", new point_15.Point(19, 31)],
                        ["o", new point_15.Point(20, 31)],
                        ["p", new point_15.Point(21, 31)],
                        ["q", new point_15.Point(22, 31)],
                        ["r", new point_15.Point(23, 31)],
                        ["s", new point_15.Point(24, 31)],
                        ["t", new point_15.Point(25, 31)],
                        ["u", new point_15.Point(26, 31)],
                        ["v", new point_15.Point(27, 31)],
                        ["w", new point_15.Point(28, 31)],
                        ["x", new point_15.Point(29, 31)],
                        ["y", new point_15.Point(30, 31)],
                        ["z", new point_15.Point(31, 31)],
                        ["autosave", new point_15.Point(18, 8)],
                        ["campfire", new point_15.Point(14, 10)],
                        ["keycap", new point_15.Point(25, 15)],
                        ["leftClick", new point_15.Point(29, 15)],
                        ["rightClick", new point_15.Point(30, 15)],
                    ])) || this;
                }
                return OneBitTileset;
            }(SingleFileTileLoader_1.SingleFileTileLoader));
            exports_34("OneBitTileset", OneBitTileset);
        }
    };
});
System.register("game/graphics/OutdoorTileset", ["engine/point", "game/graphics/SingleFileTileLoader"], function (exports_35, context_35) {
    "use strict";
    var point_16, SingleFileTileLoader_2, OutdoorTileset;
    var __moduleName = context_35 && context_35.id;
    return {
        setters: [
            function (point_16_1) {
                point_16 = point_16_1;
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
                        ["tree1base", new point_16.Point(15, 11)],
                        ["tree1top", new point_16.Point(15, 10)],
                        ["tree2base", new point_16.Point(18, 11)],
                        ["tree2top", new point_16.Point(18, 10)],
                        ["redtentNW", new point_16.Point(46, 10)],
                        ["redtentNE", new point_16.Point(47, 10)],
                        ["redtentSW", new point_16.Point(46, 11)],
                        ["redtentSE", new point_16.Point(47, 11)],
                        ["bluetentNW", new point_16.Point(48, 10)],
                        ["bluetentNE", new point_16.Point(49, 10)],
                        ["bluetentSW", new point_16.Point(48, 11)],
                        ["bluetentSE", new point_16.Point(49, 11)],
                        ["redtentInterior", new point_16.Point(3, 25)],
                        ["redtentCenter", new point_16.Point(4, 26)],
                        ["redtentl", new point_16.Point(0, 26)],
                        ["redtenttip", new point_16.Point(1, 26)],
                        ["redtentr", new point_16.Point(2, 26)],
                        ["bluetentInterior", new point_16.Point(6, 25)],
                        ["bluetentCenter", new point_16.Point(7, 26)],
                        ["bluetentl", new point_16.Point(0, 27)],
                        ["bluetenttip", new point_16.Point(1, 27)],
                        ["bluetentr", new point_16.Point(2, 27)],
                        ["campfireOff", new point_16.Point(13, 8)],
                        ["campfireOn", new point_16.Point(14, 8)],
                        ["rock1", new point_16.Point(54, 21)],
                        ["rock2", new point_16.Point(55, 21)],
                        ["rock3", new point_16.Point(56, 21)],
                        ["rock1mossy", new point_16.Point(54, 22)],
                        ["rock2mossy", new point_16.Point(55, 22)],
                        ["rock3mossy", new point_16.Point(56, 22)],
                        ["rockItem", new point_16.Point(33, 9)],
                        ["woodItem", new point_16.Point(34, 9)],
                        ["dialogueBG", new point_16.Point(6, 28)],
                        ["invBoxFrame", new point_16.Point(9, 25)],
                        ["placingElementFrame_good", new point_16.Point(3, 28)],
                        ["placingElementFrame_bad", new point_16.Point(0, 28)],
                        ["placingElementFrame_small_good", new point_16.Point(0, 25)],
                        ["placingElementFrame_small_bad", new point_16.Point(1, 25)],
                    ])) || this;
                }
                return OutdoorTileset;
            }(SingleFileTileLoader_2.SingleFileTileLoader));
            exports_35("OutdoorTileset", OutdoorTileset);
        }
    };
});
System.register("game/graphics/Tilesets", ["game/graphics/SingleFileTileLoader", "game/graphics/DungeonTilesetII", "game/graphics/SplitFileTileLoader", "game/graphics/OneBitTileset", "game/graphics/OutdoorTileset"], function (exports_36, context_36) {
    "use strict";
    var SingleFileTileLoader_3, DungeonTilesetII_1, SplitFileTileLoader_1, OneBitTileset_1, OutdoorTileset_1, TILE_SIZE, pixelPtToTilePt, Tilesets;
    var __moduleName = context_36 && context_36.id;
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
            exports_36("TILE_SIZE", TILE_SIZE = 16);
            exports_36("pixelPtToTilePt", pixelPtToTilePt = function (pixelPt) {
                return pixelPt.apply(function (n) { return Math.floor(n / TILE_SIZE); });
            });
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
                Tilesets.prototype.getBasicTileSource = function (key) {
                    var sources = [this.outdoorTiles];
                    for (var _i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
                        var src = sources_1[_i];
                        try {
                            return src.getTileSource(key);
                        }
                        catch (e) { }
                    }
                };
                Tilesets.prototype.getBasicTileNineSlice = function (key) {
                    var sources = [this.outdoorTiles, this.tilemap];
                    for (var _i = 0, sources_2 = sources; _i < sources_2.length; _i++) {
                        var src = sources_2[_i];
                        try {
                            return src.getNineSlice(key);
                        }
                        catch (e) { }
                    }
                };
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
            exports_36("Tilesets", Tilesets);
        }
    };
});
System.register("game/saves/LocationManagerSaveState", [], function (exports_37, context_37) {
    "use strict";
    var LocationManagerSaveState;
    var __moduleName = context_37 && context_37.id;
    return {
        setters: [],
        execute: function () {
            LocationManagerSaveState = /** @class */ (function () {
                function LocationManagerSaveState() {
                }
                return LocationManagerSaveState;
            }());
            exports_37("LocationManagerSaveState", LocationManagerSaveState);
        }
    };
});
System.register("game/world/LocationManager", ["game/world/WorldLocation"], function (exports_38, context_38) {
    "use strict";
    var WorldLocation_1, LocationManager;
    var __moduleName = context_38 && context_38.id;
    return {
        setters: [
            function (WorldLocation_1_1) {
                WorldLocation_1 = WorldLocation_1_1;
            }
        ],
        execute: function () {
            LocationManager = /** @class */ (function () {
                function LocationManager() {
                    this.locations = new Map(); // uuid -> location
                    LocationManager.instance = this;
                }
                LocationManager.prototype.get = function (uuid) {
                    return this.locations.get(uuid);
                };
                LocationManager.prototype.newLocation = function (isInterior) {
                    var l = new WorldLocation_1.WorldLocation(this, isInterior);
                    this.locations.set(l.uuid, l);
                    if (!this.currentLocation) {
                        this.currentLocation = l;
                    }
                    return l;
                };
                LocationManager.prototype.exterior = function () {
                    // TODO do this in a less hacky fashion
                    return Array.from(this.locations.values()).filter(function (l) { return !l.isInterior; })[0];
                };
                // transition(toUUID: string) {
                //     const location = this.locations.get(toUUID)
                //     this.currentLocation.dudes.delete(Player.instance.dude)
                //     location.dudes.add(Player.instance.dude)
                //     this.current = location
                // }
                LocationManager.prototype.save = function () {
                    return {
                        locations: Array.from(this.locations.values()).map(function (l) { return l.save(); }),
                        currentLocationUUID: this.currentLocation.uuid
                    };
                };
                LocationManager.load = function (saveState) {
                    var result = new LocationManager();
                    result.locations = new Map();
                    saveState.locations.forEach(function (l) {
                        var loadedLocation = WorldLocation_1.WorldLocation.load(result, l);
                        result.locations.set(l.uuid, loadedLocation);
                    });
                    result.currentLocation = result.locations.get(saveState.currentLocationUUID);
                };
                return LocationManager;
            }());
            exports_38("LocationManager", LocationManager);
        }
    };
});
System.register("game/characters/Weapon", ["engine/component", "engine/tiles/TileComponent", "game/graphics/Tilesets", "engine/tiles/TileTransform", "engine/point", "game/characters/Dude", "engine/util/Animator", "game/world/LocationManager"], function (exports_39, context_39) {
    "use strict";
    var component_4, TileComponent_3, Tilesets_1, TileTransform_5, point_17, Dude_1, Animator_2, LocationManager_1, State, Weapon;
    var __moduleName = context_39 && context_39.id;
    return {
        setters: [
            function (component_4_1) {
                component_4 = component_4_1;
            },
            function (TileComponent_3_1) {
                TileComponent_3 = TileComponent_3_1;
            },
            function (Tilesets_1_1) {
                Tilesets_1 = Tilesets_1_1;
            },
            function (TileTransform_5_1) {
                TileTransform_5 = TileTransform_5_1;
            },
            function (point_17_1) {
                point_17 = point_17_1;
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
                    _this.delay = 0; // delay after the animation ends before the weapon can attack again in millis
                    _this.currentAnimationFrame = 0;
                    _this.start = function (startData) {
                        _this.dude = _this.entity.getComponent(Dude_1.Dude);
                        _this.weaponSprite = _this.entity.addComponent(new TileComponent_3.TileComponent(Tilesets_1.Tilesets.instance.dungeonCharacters.getTileSource(weaponId), new TileTransform_5.TileTransform().relativeTo(_this.dude.animation.transform)));
                        _this._range = _this.weaponSprite.transform.dimensions.y;
                    };
                    return _this;
                }
                Object.defineProperty(Weapon.prototype, "range", {
                    get: function () { return this._range; },
                    enumerable: true,
                    configurable: true
                });
                Weapon.prototype.update = function (updateData) {
                    if (!!this.animator) {
                        this.animator.update(updateData.elapsedTimeMillis);
                    }
                    this.animate();
                };
                // TODO find a better place for this?
                Weapon.damageInFrontOfDude = function (dude, attackDistance) {
                    Array.from(LocationManager_1.LocationManager.instance.currentLocation.dudes)
                        .filter(function (d) { return !!d && d !== dude && d.faction !== dude.faction; })
                        .filter(function (d) { return dude.isFacing(d.standingPosition); })
                        .filter(function (d) { return d.standingPosition.distanceTo(dude.standingPosition) < attackDistance; })
                        .forEach(function (d) { return d.damage(1, d.standingPosition.minus(dude.standingPosition), 30); });
                };
                Weapon.prototype.animate = function () {
                    var offsetFromEdge = this.dude.animation.transform.dimensions
                        .minus(new point_17.Point(9, 2))
                        .minus(this.weaponSprite.transform.dimensions);
                    var pos = new point_17.Point(0, 0);
                    var rotation = 0;
                    if (this.state === State.DRAWN) {
                        pos = offsetFromEdge;
                    }
                    else if (this.state === State.SHEATHED) { // TODO add side sheath for swords
                        // center on back
                        pos = offsetFromEdge.plus(new point_17.Point(3, -1));
                    }
                    else if (this.state === State.ATTACKING) {
                        var posWithRotation = this.getAttackAnimationPosition();
                        pos = posWithRotation[0].plus(offsetFromEdge);
                        rotation = posWithRotation[1];
                    }
                    this.weaponSprite.transform.rotation = rotation;
                    this.weaponSprite.transform.mirrorY = this.state == State.SHEATHED;
                    pos = pos.plus(this.dude.getAnimationOffsetPosition());
                    this.weaponSprite.transform.position = pos;
                    // show sword behind character if sheathed
                    this.weaponSprite.transform.depth = this.state == State.SHEATHED ? -.5 : .5;
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
                Weapon.prototype.isAttacking = function () {
                    return this.state === State.ATTACKING;
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
                    var _a;
                    if (this.dude.shield && !((_a = this.dude.shield) === null || _a === void 0 ? void 0 : _a.canAttack())) {
                        return;
                    }
                    if (this.state === State.DRAWN) {
                        this.state = State.ATTACKING;
                        setTimeout(function () {
                            if (!_this.enabled) {
                                return;
                            }
                            var attackDistance = _this.range + 4; // add a tiny buffer for small weapons like the dagger to still work
                            Weapon.damageInFrontOfDude(_this.dude, attackDistance);
                        }, 100);
                        this.playAttackAnimation();
                    }
                };
                Weapon.prototype.playAttackAnimation = function () {
                    var _this = this;
                    this.animator = new Animator_2.Animator(Animator_2.Animator.frames(8, 40), function (index) { return _this.currentAnimationFrame = index; }, function () {
                        _this.animator = null;
                        setTimeout(function () {
                            _this.state = State.DRAWN; // reset to DRAWN when animation finishes
                        }, _this.delay);
                    });
                };
                /**
                 * Returns (position, rotation)
                 */
                Weapon.prototype.getAttackAnimationPosition = function () {
                    var swingStartFrame = 3;
                    var resettingFrame = 7;
                    if (this.currentAnimationFrame < swingStartFrame) {
                        return [new point_17.Point(this.currentAnimationFrame * 3, 0), 0];
                    }
                    else if (this.currentAnimationFrame < resettingFrame) {
                        return [
                            new point_17.Point((6 - this.currentAnimationFrame) + this.weaponSprite.transform.dimensions.y - swingStartFrame * 3, Math.floor(this.weaponSprite.transform.dimensions.y / 2 - 1)),
                            90
                        ];
                    }
                    else {
                        return [new point_17.Point((1 - this.currentAnimationFrame + resettingFrame) * 3, 2), 0];
                    }
                };
                return Weapon;
            }(component_4.Component));
            exports_39("Weapon", Weapon);
        }
    };
});
System.register("game/items/DroppedItem", ["engine/component", "engine/point", "engine/collision/BoxCollider", "game/characters/Player", "game/world/LocationManager", "game/items/Items"], function (exports_40, context_40) {
    "use strict";
    var component_5, point_18, BoxCollider_1, Player_1, LocationManager_2, Items_1, DroppedItem;
    var __moduleName = context_40 && context_40.id;
    return {
        setters: [
            function (component_5_1) {
                component_5 = component_5_1;
            },
            function (point_18_1) {
                point_18 = point_18_1;
            },
            function (BoxCollider_1_1) {
                BoxCollider_1 = BoxCollider_1_1;
            },
            function (Player_1_1) {
                Player_1 = Player_1_1;
            },
            function (LocationManager_2_1) {
                LocationManager_2 = LocationManager_2_1;
            },
            function (Items_1_1) {
                Items_1 = Items_1_1;
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
                        _this.tile = _this.entity.addComponent(Items_1.ITEM_METADATA_MAP[item].droppedIconSupplier().toComponent());
                        var pos = position.minus(new point_18.Point(_this.tile.transform.dimensions.x / 2, _this.tile.transform.dimensions.y));
                        _this.tile.transform.position = pos;
                        var colliderSize = new point_18.Point(8, 8);
                        _this.collider = _this.entity.addComponent(new BoxCollider_1.BoxCollider(pos.plus(_this.tile.transform.dimensions.minus(colliderSize).div(2)), colliderSize, DroppedItem.COLLISION_LAYER, !!sourceCollider ? [sourceCollider] : []).onColliderEnter(function (c) { return _this.collide(c); }));
                        _this.reposition();
                        var last = new Date().getTime();
                        var move = function () {
                            if (!_this.enabled) {
                                return;
                            }
                            var now = new Date().getTime();
                            var diff = now - last;
                            if (diff > 0) {
                                _this.reposition(velocity);
                                velocity = velocity.times(.6);
                            }
                            if (velocity.magnitude() >= .1) {
                                requestAnimationFrame(move);
                            }
                            last = now;
                        };
                        requestAnimationFrame(move);
                    };
                    return _this;
                }
                DroppedItem.prototype.reposition = function (delta) {
                    if (delta === void 0) { delta = new point_18.Point(0, 0); }
                    var colliderOffset = this.collider.position.minus(this.tile.transform.position);
                    this.tile.transform.position = this.collider.moveTo(this.collider.position.plus(delta)).minus(colliderOffset);
                    this.tile.transform.depth = this.tile.transform.position.y;
                };
                DroppedItem.prototype.collide = function (c) {
                    var _this = this;
                    if (!c.entity) {
                        return;
                    }
                    var player = c.entity.getComponent(Player_1.Player);
                    if (!!player) {
                        setTimeout(function () {
                            var d = player.dude;
                            if (d.isAlive && !!_this.entity) {
                                player.dude.inventory.addItem(_this.itemType);
                                LocationManager_2.LocationManager.instance.currentLocation.droppedItems.delete(_this.entity);
                                _this.entity.selfDestruct();
                            }
                        }, 150);
                    }
                };
                DroppedItem.COLLISION_LAYER = "item";
                return DroppedItem;
            }(component_5.Component));
            exports_40("DroppedItem", DroppedItem);
        }
    };
});
System.register("game/world/elements/Hittable", ["engine/component", "engine/util/Animator"], function (exports_41, context_41) {
    "use strict";
    var component_6, Animator_3, Hittable;
    var __moduleName = context_41 && context_41.id;
    return {
        setters: [
            function (component_6_1) {
                component_6 = component_6_1;
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
                    if (!!this.animator || !this.entity) { // already being hit
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
            }(component_6.Component));
            exports_41("Hittable", Hittable);
        }
    };
});
System.register("game/world/elements/ElementComponent", ["engine/component"], function (exports_42, context_42) {
    "use strict";
    var component_7, ElementComponent;
    var __moduleName = context_42 && context_42.id;
    return {
        setters: [
            function (component_7_1) {
                component_7 = component_7_1;
            }
        ],
        execute: function () {
            /**
             * A component that all world space entities should have in order to be saveable.
             * Elements should no subclass this,
             */
            ElementComponent = /** @class */ (function (_super) {
                __extends(ElementComponent, _super);
                function ElementComponent(type, occupiedPoints, saveFn) {
                    var _this = _super.call(this) || this;
                    _this.type = type;
                    _this.occupiedPoints = occupiedPoints;
                    _this.save = saveFn;
                    return _this;
                }
                ElementComponent.prototype.save = function () {
                    throw new Error("aaaaahhh!");
                };
                return ElementComponent;
            }(component_7.Component));
            exports_42("ElementComponent", ElementComponent);
        }
    };
});
System.register("game/world/elements/HittableResource", ["game/world/elements/Hittable", "engine/point", "game/items/Items", "game/graphics/Tilesets", "engine/collision/BoxCollider", "game/world/LocationManager", "game/world/elements/ElementComponent"], function (exports_43, context_43) {
    "use strict";
    var Hittable_1, point_19, Items_2, Tilesets_2, BoxCollider_2, LocationManager_3, ElementComponent_1, makeHittable;
    var __moduleName = context_43 && context_43.id;
    return {
        setters: [
            function (Hittable_1_1) {
                Hittable_1 = Hittable_1_1;
            },
            function (point_19_1) {
                point_19 = point_19_1;
            },
            function (Items_2_1) {
                Items_2 = Items_2_1;
            },
            function (Tilesets_2_1) {
                Tilesets_2 = Tilesets_2_1;
            },
            function (BoxCollider_2_1) {
                BoxCollider_2 = BoxCollider_2_1;
            },
            function (LocationManager_3_1) {
                LocationManager_3 = LocationManager_3_1;
            },
            function (ElementComponent_1_1) {
                ElementComponent_1 = ElementComponent_1_1;
            }
        ],
        execute: function () {
            exports_43("makeHittable", makeHittable = function (e, pos, transforms, item) {
                var knockedItemCount = 5;
                var h = new Hittable_1.Hittable(pos, // centered position
                transforms, function (hitDir) {
                    knockedItemCount--;
                    var finishingMove = knockedItemCount === 0;
                    var velocityMultiplier = finishingMove ? .6 : 1;
                    var placeDistance = finishingMove ? 2 : 8;
                    var itemsOut = finishingMove ? 3 : 1;
                    for (var i = 0; i < itemsOut; i++) {
                        var randomness = .5;
                        var itemDirection = hitDir.plus(new point_19.Point(randomness - Math.random() * randomness * 2, randomness - Math.random() * randomness * 2)).normalized();
                        var velocity = itemDirection.times(1 + 3 * Math.random());
                        Items_2.spawnItem(pos.plus(new point_19.Point(0, Tilesets_2.TILE_SIZE / 2)).plus(itemDirection.times(placeDistance)), // bottom center, then randomly adjusted
                        item, velocity.times(velocityMultiplier), e.getComponent(BoxCollider_2.BoxCollider));
                    }
                    if (finishingMove) {
                        LocationManager_3.LocationManager.instance.currentLocation.elements.removeAll(e.getComponent(ElementComponent_1.ElementComponent));
                        e.selfDestruct();
                    }
                });
                e.addComponent(h);
            });
        }
    };
});
System.register("game/world/elements/Tree", ["engine/point", "game/graphics/Tilesets", "engine/collision/BoxCollider", "engine/tiles/TileComponent", "engine/tiles/TileTransform", "engine/Entity", "game/world/elements/HittableResource", "game/world/elements/ElementComponent"], function (exports_44, context_44) {
    "use strict";
    var point_20, Tilesets_3, BoxCollider_3, TileComponent_4, TileTransform_6, Entity_2, HittableResource_1, ElementComponent_2, makeTree, addTile;
    var __moduleName = context_44 && context_44.id;
    return {
        setters: [
            function (point_20_1) {
                point_20 = point_20_1;
            },
            function (Tilesets_3_1) {
                Tilesets_3 = Tilesets_3_1;
            },
            function (BoxCollider_3_1) {
                BoxCollider_3 = BoxCollider_3_1;
            },
            function (TileComponent_4_1) {
                TileComponent_4 = TileComponent_4_1;
            },
            function (TileTransform_6_1) {
                TileTransform_6 = TileTransform_6_1;
            },
            function (Entity_2_1) {
                Entity_2 = Entity_2_1;
            },
            function (HittableResource_1_1) {
                HittableResource_1 = HittableResource_1_1;
            },
            function (ElementComponent_2_1) {
                ElementComponent_2 = ElementComponent_2_1;
            }
        ],
        execute: function () {
            exports_44("makeTree", makeTree = function (wl, pos, data) {
                var _a;
                var type = (_a = data["type"]) !== null && _a !== void 0 ? _a : (Math.random() < .7 ? 2 /* POINTY */ : 1 /* ROUND */);
                var e = new Entity_2.Entity();
                var depth = (pos.y + 2) * Tilesets_3.TILE_SIZE;
                var top = addTile(e, "tree" + type + "top", pos, depth);
                var bottom = addTile(e, "tree" + type + "base", pos.plus(new point_20.Point(0, 1)), depth);
                var hitboxDims = new point_20.Point(8, 3);
                e.addComponent(new BoxCollider_3.BoxCollider(pos.plus(new point_20.Point(.5, 2)).times(Tilesets_3.TILE_SIZE).minus(new point_20.Point(hitboxDims.x / 2, hitboxDims.y)), hitboxDims));
                var hittableCenter = pos.times(Tilesets_3.TILE_SIZE).plus(new point_20.Point(Tilesets_3.TILE_SIZE / 2, Tilesets_3.TILE_SIZE + Tilesets_3.TILE_SIZE / 2)); // center of bottom tile
                HittableResource_1.makeHittable(e, hittableCenter, [top.transform, bottom.transform], 2 /* WOOD */);
                return e.addComponent(new ElementComponent_2.ElementComponent(0 /* TREE */, [pos, pos.plusY(1)], function () { return { type: type }; }));
            });
            addTile = function (e, s, pos, depth) {
                var tile = e.addComponent(new TileComponent_4.TileComponent(Tilesets_3.Tilesets.instance.outdoorTiles.getTileSource(s), new TileTransform_6.TileTransform(pos.times(Tilesets_3.TILE_SIZE))));
                tile.transform.depth = depth;
                return tile;
            };
        }
    };
});
System.register("game/world/elements/Rock", ["engine/point", "game/graphics/Tilesets", "engine/collision/BoxCollider", "engine/tiles/TileComponent", "engine/tiles/TileTransform", "engine/Entity", "game/world/elements/HittableResource", "game/world/elements/ElementComponent"], function (exports_45, context_45) {
    "use strict";
    var point_21, Tilesets_4, BoxCollider_4, TileComponent_5, TileTransform_7, Entity_3, HittableResource_2, ElementComponent_3, makeRock;
    var __moduleName = context_45 && context_45.id;
    return {
        setters: [
            function (point_21_1) {
                point_21 = point_21_1;
            },
            function (Tilesets_4_1) {
                Tilesets_4 = Tilesets_4_1;
            },
            function (BoxCollider_4_1) {
                BoxCollider_4 = BoxCollider_4_1;
            },
            function (TileComponent_5_1) {
                TileComponent_5 = TileComponent_5_1;
            },
            function (TileTransform_7_1) {
                TileTransform_7 = TileTransform_7_1;
            },
            function (Entity_3_1) {
                Entity_3 = Entity_3_1;
            },
            function (HittableResource_2_1) {
                HittableResource_2 = HittableResource_2_1;
            },
            function (ElementComponent_3_1) {
                ElementComponent_3 = ElementComponent_3_1;
            }
        ],
        execute: function () {
            exports_45("makeRock", makeRock = function (wl, pos, data) {
                var _a, _b, _c;
                var e = new Entity_3.Entity();
                var variation = (_a = data["v"]) !== null && _a !== void 0 ? _a : (Math.floor(Math.random() * 3) + 1);
                var mossy = (_b = data["m"]) !== null && _b !== void 0 ? _b : (Math.random() > .7);
                var flipped = (_c = data["f"]) !== null && _c !== void 0 ? _c : (Math.random() > .5);
                var tile = e.addComponent(new TileComponent_5.TileComponent(Tilesets_4.Tilesets.instance.outdoorTiles.getTileSource("rock" + variation + (mossy ? 'mossy' : '')), new TileTransform_7.TileTransform(pos.times(Tilesets_4.TILE_SIZE))));
                tile.transform.depth = (pos.y + 1) * Tilesets_4.TILE_SIZE - /* prevent weapon from clipping */ 5;
                tile.transform.mirrorX = flipped;
                // TODO
                var hitboxDims = new point_21.Point(12, 4);
                e.addComponent(new BoxCollider_4.BoxCollider(pos.plus(new point_21.Point(.5, 1)).times(Tilesets_4.TILE_SIZE).minus(new point_21.Point(hitboxDims.x / 2, hitboxDims.y + 2)), hitboxDims));
                HittableResource_2.makeHittable(e, pos.plus(new point_21.Point(.5, .5)).times(Tilesets_4.TILE_SIZE), [tile.transform], 1 /* ROCK */);
                return e.addComponent(new ElementComponent_3.ElementComponent(1 /* ROCK */, [pos], function () { return { v: variation, m: mossy, f: flipped }; }));
            });
        }
    };
});
System.register("game/Controls", [], function (exports_46, context_46) {
    "use strict";
    var Controls;
    var __moduleName = context_46 && context_46.id;
    return {
        setters: [],
        execute: function () {
            exports_46("Controls", Controls = {
                placeElementButton: 88 /* X */,
                interactButton: 69 /* E */,
                closeButton: 27 /* ESC */,
                inventoryButton: 73 /* I */,
                keyString: function (inputKey) {
                    return String.fromCharCode(inputKey);
                }
            });
        }
    };
});
System.register("game/ui/Text", ["engine/point", "engine/renderer/TextRender"], function (exports_47, context_47) {
    "use strict";
    var point_22, TextRender_2, TEXT_PIXEL_WIDTH, TEXT_SIZE, TEXT_FONT, formatText;
    var __moduleName = context_47 && context_47.id;
    return {
        setters: [
            function (point_22_1) {
                point_22 = point_22_1;
            },
            function (TextRender_2_1) {
                TextRender_2 = TextRender_2_1;
            }
        ],
        execute: function () {
            exports_47("TEXT_PIXEL_WIDTH", TEXT_PIXEL_WIDTH = 8);
            exports_47("TEXT_SIZE", TEXT_SIZE = 8);
            exports_47("TEXT_FONT", TEXT_FONT = "Press Start 2P");
            exports_47("formatText", formatText = function (s, color, position, width, alignment, lineSpacing) {
                if (alignment === void 0) { alignment = 0 /* LEFT */; }
                if (lineSpacing === void 0) { lineSpacing = 4; }
                var words = s.split(" ");
                var rows = [];
                var row = "";
                for (var _i = 0, words_1 = words; _i < words_1.length; _i++) {
                    var word = words_1[_i];
                    var newRow = (row + " " + word).trim();
                    if (newRow.length * TEXT_PIXEL_WIDTH < width) {
                        row = newRow;
                    }
                    else {
                        rows.push(row);
                        row = word;
                    }
                }
                rows.push(row);
                return rows.map(function (r, i) {
                    var offset = 0;
                    if (alignment === 1 /* CENTER */) {
                        offset = Math.floor((width - r.length * TEXT_PIXEL_WIDTH) / 2);
                    }
                    else if (alignment === 2 /* RIGHT */) {
                        offset = Math.floor(width - r.length * TEXT_PIXEL_WIDTH);
                    }
                    return new TextRender_2.TextRender(r, position.plus(new point_22.Point(offset, i * (TEXT_SIZE + lineSpacing))), TEXT_SIZE, TEXT_FONT, color);
                });
            });
        }
    };
});
// Utility functions for iterable
System.register("engine/util/Lists", [], function (exports_48, context_48) {
    "use strict";
    var Lists;
    var __moduleName = context_48 && context_48.id;
    return {
        setters: [],
        execute: function () {// Utility functions for iterable
            exports_48("Lists", Lists = {
                minBy: function (list, fn) {
                    if (list.length == 0) {
                        return null;
                    }
                    var smallestAmount = Number.MAX_SAFE_INTEGER;
                    var smallest;
                    for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                        var i = list_1[_i];
                        var amount = fn(i);
                        if (amount < smallestAmount) {
                            smallestAmount = amount;
                            smallest = i;
                        }
                    }
                    return smallest;
                },
                maxBy: function (list, fn) {
                    if (list.length == 0) {
                        return null;
                    }
                    var smallestAmount = Number.MAX_SAFE_INTEGER;
                    var smallest;
                    for (var _i = 0, list_2 = list; _i < list_2.length; _i++) {
                        var i = list_2[_i];
                        var amount = fn(i);
                        if (amount < smallestAmount) {
                            smallestAmount = amount;
                            smallest = i;
                        }
                    }
                    return smallest;
                },
                oneOf: function (list) {
                    return list[Math.floor(Math.random() * list.length)];
                },
            });
        }
    };
});
System.register("game/cutscenes/Camera", ["engine/point", "game/world/MapGenerator", "game/graphics/Tilesets"], function (exports_49, context_49) {
    "use strict";
    var point_23, MapGenerator_1, Tilesets_5, Camera;
    var __moduleName = context_49 && context_49.id;
    return {
        setters: [
            function (point_23_1) {
                point_23 = point_23_1;
            },
            function (MapGenerator_1_1) {
                MapGenerator_1 = MapGenerator_1_1;
            },
            function (Tilesets_5_1) {
                Tilesets_5 = Tilesets_5_1;
            }
        ],
        execute: function () {
            Camera = /** @class */ (function () {
                function Camera() {
                    Camera.instance = this;
                }
                Object.defineProperty(Camera.prototype, "position", {
                    get: function () {
                        return this._position.times(-1); // multiply by -1 because views use "offset"
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Camera.prototype, "dimensions", {
                    get: function () { return this._dimensions; },
                    enumerable: true,
                    configurable: true
                });
                Camera.prototype.focusOnDude = function (dude) {
                    this.dudeTarget = dude;
                    this.pointTarget = null;
                };
                Camera.prototype.focusOnPoint = function (point) {
                    this.pointTarget = point;
                    this.dudeTarget = null;
                };
                Camera.prototype.jump = function (translation) {
                    this._position = this._position.plus(translation);
                };
                Camera.prototype.getUpdatedPosition = function (dimensions, elapsedTimeMillis) {
                    var _a, _b;
                    this._dimensions = dimensions;
                    var xLimit = MapGenerator_1.MapGenerator.MAP_SIZE / 2 * Tilesets_5.TILE_SIZE - dimensions.x / 2;
                    var yLimit = MapGenerator_1.MapGenerator.MAP_SIZE / 2 * Tilesets_5.TILE_SIZE - dimensions.y / 2;
                    var trackedPoint = (_b = (_a = this.dudeTarget) === null || _a === void 0 ? void 0 : _a.position) !== null && _b !== void 0 ? _b : this.pointTarget;
                    var clampedTrackedPoint = new point_23.Point(this.clamp(trackedPoint.x, -xLimit, xLimit), this.clamp(trackedPoint.y, -yLimit, yLimit));
                    var cameraGoal = dimensions.div(2).minus(clampedTrackedPoint);
                    if (!this._position) {
                        this._position = cameraGoal;
                    }
                    else {
                        this._position = this._position.lerp(.0018 * elapsedTimeMillis, cameraGoal);
                    }
                    return this._position;
                };
                Camera.prototype.clamp = function (val, min, max) {
                    return Math.min(Math.max(val, min), max);
                };
                return Camera;
            }());
            exports_49("Camera", Camera);
        }
    };
});
System.register("game/ui/OffScreenMarker", ["engine/point", "engine/util/utils", "engine/util/Lists", "engine/component", "game/graphics/Tilesets", "engine/tiles/TileTransform", "game/world/LocationManager", "game/cutscenes/Camera"], function (exports_50, context_50) {
    "use strict";
    var point_24, utils_3, Lists_1, component_8, Tilesets_6, TileTransform_8, LocationManager_4, Camera_1, OffScreenMarker;
    var __moduleName = context_50 && context_50.id;
    return {
        setters: [
            function (point_24_1) {
                point_24 = point_24_1;
            },
            function (utils_3_1) {
                utils_3 = utils_3_1;
            },
            function (Lists_1_1) {
                Lists_1 = Lists_1_1;
            },
            function (component_8_1) {
                component_8 = component_8_1;
            },
            function (Tilesets_6_1) {
                Tilesets_6 = Tilesets_6_1;
            },
            function (TileTransform_8_1) {
                TileTransform_8 = TileTransform_8_1;
            },
            function (LocationManager_4_1) {
                LocationManager_4 = LocationManager_4_1;
            },
            function (Camera_1_1) {
                Camera_1 = Camera_1_1;
            }
        ],
        execute: function () {
            OffScreenMarker = /** @class */ (function (_super) {
                __extends(OffScreenMarker, _super);
                function OffScreenMarker() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.markerDistFromEdge = 12 + Tilesets_6.TILE_SIZE;
                    return _this;
                }
                OffScreenMarker.prototype.update = function (updateData) {
                    var cameraPos = Camera_1.Camera.instance.position;
                    var cameraDimensions = updateData.dimensions;
                    // TODO make this configurable
                    var dips = Array.from(LocationManager_4.LocationManager.instance.currentLocation.dudes).filter(function (d) { return d.type === 1 /* DIP */; }).map(function (d) { return d.standingPosition; });
                    if (dips.length === 0) {
                        return;
                    }
                    var point = dips[0];
                    if (utils_3.rectContains(cameraPos, cameraDimensions, point)) {
                        this.tileSource = null;
                        return;
                    }
                    var intersect = this.cameraEdgeIntersectPoint(point, cameraPos, cameraDimensions);
                    this.tilePoint = intersect[1]
                        .minus(cameraPos) // offset since this is in the UI view
                        .minus(new point_24.Point(.5, .5).times(Tilesets_6.TILE_SIZE));
                    this.tileSource = "arrow_" + intersect[0] + "_2";
                };
                OffScreenMarker.prototype.getRenderMethods = function () {
                    if (!this.tileSource)
                        return [];
                    return [Tilesets_6.Tilesets.instance.oneBit.getTileSource(this.tileSource).toImageRender(new TileTransform_8.TileTransform(this.tilePoint))];
                };
                OffScreenMarker.prototype.cameraEdgeIntersectPoint = function (outsidePoint, cameraPos, cameraDimensions) {
                    cameraPos = cameraPos.plus(new point_24.Point(1, 1).times(this.markerDistFromEdge));
                    cameraDimensions = cameraDimensions.minus(new point_24.Point(2, 2).times(this.markerDistFromEdge));
                    var midpoint = cameraPos.plus(cameraDimensions.div(2));
                    var pts = [];
                    if (outsidePoint.y < cameraPos.y) { // top
                        pts.push(["up", this.lineIntersectPoint(midpoint, outsidePoint, cameraPos, cameraPos.plusX(cameraDimensions.x))]);
                    }
                    else if (outsidePoint.y > cameraPos.y + cameraDimensions.y) { // bottom
                        pts.push(["down", this.lineIntersectPoint(midpoint, outsidePoint, cameraPos.plusY(cameraDimensions.y), cameraPos.plus(cameraDimensions))]);
                    }
                    if (outsidePoint.x < cameraPos.x) { // left
                        pts.push(["left", this.lineIntersectPoint(midpoint, outsidePoint, cameraPos, cameraPos.plusY(cameraDimensions.y))]);
                    }
                    else if (outsidePoint.x > cameraPos.x + cameraDimensions.x) { // right
                        pts.push(["right", this.lineIntersectPoint(midpoint, outsidePoint, cameraPos.plusX(cameraDimensions.x), cameraPos.plus(cameraDimensions))]);
                    }
                    return Lists_1.Lists.minBy(pts, function (pt) { return pt[1].distanceTo(midpoint); });
                };
                // taken from https://gamedev.stackexchange.com/questions/111100/intersection-of-a-line-and-a-rectangle
                OffScreenMarker.prototype.lineIntersectPoint = function (ps1, pe1, ps2, pe2) {
                    // Get A,B of first line - points : ps1 to pe1
                    var A1 = pe1.y - ps1.y;
                    var B1 = ps1.x - pe1.x;
                    // Get A,B of second line - points : ps2 to pe2
                    var A2 = pe2.y - ps2.y;
                    var B2 = ps2.x - pe2.x;
                    // Get delta and check if the lines are parallel
                    var delta = A1 * B2 - A2 * B1;
                    if (delta === 0) {
                        return null;
                    }
                    // Get C of first and second lines
                    var C2 = A2 * ps2.x + B2 * ps2.y;
                    var C1 = A1 * ps1.x + B1 * ps1.y;
                    // invert delta to make division cheaper
                    var invdelta = 1 / delta;
                    // now return the Vector2 intersection point
                    return new point_24.Point((B2 * C1 - B1 * C2) * invdelta, (A1 * C2 - A2 * C1) * invdelta);
                };
                return OffScreenMarker;
            }(component_8.Component));
            exports_50("OffScreenMarker", OffScreenMarker);
        }
    };
});
System.register("game/ui/HUD", ["game/graphics/Tilesets", "engine/tiles/TileTransform", "engine/point", "engine/tiles/TileComponent", "engine/Entity", "game/ui/OffScreenMarker"], function (exports_51, context_51) {
    "use strict";
    var Tilesets_7, TileTransform_9, point_25, TileComponent_6, Entity_4, OffScreenMarker_1, HUD;
    var __moduleName = context_51 && context_51.id;
    return {
        setters: [
            function (Tilesets_7_1) {
                Tilesets_7 = Tilesets_7_1;
            },
            function (TileTransform_9_1) {
                TileTransform_9 = TileTransform_9_1;
            },
            function (point_25_1) {
                point_25 = point_25_1;
            },
            function (TileComponent_6_1) {
                TileComponent_6 = TileComponent_6_1;
            },
            function (Entity_4_1) {
                Entity_4 = Entity_4_1;
            },
            function (OffScreenMarker_1_1) {
                OffScreenMarker_1 = OffScreenMarker_1_1;
            }
        ],
        execute: function () {
            HUD = /** @class */ (function () {
                function HUD() {
                    this.heartsEntity = new Entity_4.Entity();
                    this.autosaveComponent = new Entity_4.Entity().addComponent(Tilesets_7.Tilesets.instance.oneBit.getTileSource("floppy_drive").toComponent());
                    this.isShowingAutosaveIcon = false;
                    this.offset = new point_25.Point(4, 4);
                    // used for determining what should be updated
                    this.lastHealthCount = 0;
                    this.lastMaxHealthCount = 0;
                    // TODO show this dynamically
                    this.offScreenMarker = this.autosaveComponent.entity.addComponent(new OffScreenMarker_1.OffScreenMarker());
                    HUD.instance = this;
                }
                HUD.prototype.getEntities = function (player, screenDimensions, elapsedMillis) {
                    this.updateHearts(player.health, player.maxHealth);
                    this.updateAutosave(screenDimensions, elapsedMillis);
                    return [this.heartsEntity, this.autosaveComponent.entity];
                };
                HUD.prototype.updateHearts = function (health, maxHealth) {
                    var _this = this;
                    if (this.lastHealthCount === health && this.lastMaxHealthCount === maxHealth) {
                        return;
                    }
                    this.lastHealthCount = health;
                    this.lastMaxHealthCount = maxHealth;
                    this.heartsEntity = new Entity_4.Entity();
                    var heartOffset = new point_25.Point(16, 0);
                    var full = Tilesets_7.Tilesets.instance.dungeonCharacters.getTileSource("ui_heart_full");
                    var half = Tilesets_7.Tilesets.instance.dungeonCharacters.getTileSource("ui_heart_half");
                    var empty = Tilesets_7.Tilesets.instance.dungeonCharacters.getTileSource("ui_heart_empty");
                    var result = [];
                    var fullHearts = Math.floor(health);
                    for (var i = 0; i < fullHearts; i++) {
                        result.push(new TileComponent_6.TileComponent(full, new TileTransform_9.TileTransform(this.offset.plus(heartOffset.times(i)))));
                    }
                    if (health % 1 > .5) {
                        result.push(new TileComponent_6.TileComponent(full, new TileTransform_9.TileTransform(this.offset.plus(heartOffset.times(result.length)))));
                    }
                    else if (health % 1 > 0) {
                        result.push(new TileComponent_6.TileComponent(half, new TileTransform_9.TileTransform(this.offset.plus(heartOffset.times(result.length)))));
                    }
                    while (result.length < maxHealth) {
                        result.push(new TileComponent_6.TileComponent(empty, new TileTransform_9.TileTransform(this.offset.plus(heartOffset.times(result.length)))));
                    }
                    result.forEach(function (c) { return _this.heartsEntity.addComponent(c); });
                };
                HUD.prototype.showSaveIcon = function () {
                    var _this = this;
                    this.isShowingAutosaveIcon = true;
                    setTimeout(function () { _this.isShowingAutosaveIcon = false; }, 3000);
                };
                HUD.prototype.updateAutosave = function (screenDimensions, elapsedMillis) {
                    var base = screenDimensions.minus(this.offset).minus(new point_25.Point(Tilesets_7.TILE_SIZE, Tilesets_7.TILE_SIZE));
                    var lerpRate = 0.005 * elapsedMillis;
                    if (this.autosaveComponent.transform.position.equals(point_25.Point.ZERO)) { // for initializing
                        lerpRate = 1;
                    }
                    var goal = this.isShowingAutosaveIcon ? point_25.Point.ZERO : new point_25.Point(0, 40);
                    this.autosaveComponent.transform.position = this.autosaveComponent.transform.position
                        .minus(base)
                        .lerp(lerpRate, goal)
                        .plus(base);
                };
                return HUD;
            }());
            exports_51("HUD", HUD);
        }
    };
});
System.register("engine/tiles/NineSlice", ["engine/point", "engine/tiles/TileTransform"], function (exports_52, context_52) {
    "use strict";
    var point_26, TileTransform_10, NineSlice;
    var __moduleName = context_52 && context_52.id;
    return {
        setters: [
            function (point_26_1) {
                point_26 = point_26_1;
            },
            function (TileTransform_10_1) {
                TileTransform_10 = TileTransform_10_1;
            }
        ],
        execute: function () {
            exports_52("NineSlice", NineSlice = {
                nineSliceForEach: function (dimensions, fn) {
                    if (dimensions.x < 2 || dimensions.y < 2) {
                        throw new Error("9 slice should be at least 2x2");
                    }
                    var _loop_1 = function (x) {
                        var _loop_2 = function (y) {
                            var getIndex = function () {
                                var edgeTop = y === 0;
                                var edgeBottom = y === dimensions.y - 1;
                                var edgeLeft = x === 0;
                                var edgeRight = x === dimensions.x - 1;
                                if (edgeLeft && edgeTop) {
                                    return 0;
                                }
                                else if (edgeTop && !edgeRight) {
                                    return 1;
                                }
                                else if (edgeTop) {
                                    return 2;
                                }
                                else if (edgeLeft && !edgeBottom) {
                                    return 3;
                                }
                                else if (!edgeTop && !edgeBottom && !edgeLeft && !edgeRight) {
                                    return 4;
                                }
                                else if (edgeRight && !edgeBottom) {
                                    return 5;
                                }
                                else if (edgeLeft && edgeBottom) {
                                    return 6;
                                }
                                else if (edgeBottom && !edgeRight) {
                                    return 7;
                                }
                                else {
                                    return 8;
                                }
                            };
                            fn(new point_26.Point(x, y), getIndex());
                        };
                        for (var y = 0; y < dimensions.y; y++) {
                            _loop_2(y);
                        }
                    };
                    for (var x = 0; x < dimensions.x; x++) {
                        _loop_1(x);
                    }
                },
                /**
                 * @param slice the 9 parts to use to make a rectangle
                 * @param pos top-left top-left position
                 * @param dimensions dimensions of the desired rectangle in tile units
                 * @return All the tiles instantiated. The first element in the list is the main transform, the rest are relative.
                 */
                makeNineSliceComponents: function (slice, pos, dimensions) {
                    if (slice.length !== 9) {
                        throw new Error("nine slice gotta have nine slices ya dip");
                    }
                    if (dimensions.x < 2 || dimensions.y < 2) {
                        throw new Error("9 slice must be at least 2x2");
                    }
                    var tiles = [];
                    tiles.push(slice[0].toComponent(new TileTransform_10.TileTransform(new point_26.Point(0, 0))));
                    tiles.push(slice[2].toComponent(new TileTransform_10.TileTransform(new point_26.Point(dimensions.x - 1, 0))));
                    tiles.push(slice[6].toComponent(new TileTransform_10.TileTransform(new point_26.Point(0, dimensions.y - 1))));
                    tiles.push(slice[8].toComponent(new TileTransform_10.TileTransform(new point_26.Point(dimensions.x - 1, dimensions.y - 1))));
                    // horizontal lines
                    for (var i = 1; i < dimensions.x - 1; i++) {
                        tiles.push(slice[1].toComponent(new TileTransform_10.TileTransform(new point_26.Point(i, 0))));
                        tiles.push(slice[7].toComponent(new TileTransform_10.TileTransform(new point_26.Point(i, dimensions.y - 1))));
                    }
                    // vertical lines
                    for (var j = 1; j < dimensions.y - 1; j++) {
                        tiles.push(slice[3].toComponent(new TileTransform_10.TileTransform(new point_26.Point(0, j))));
                        tiles.push(slice[5].toComponent(new TileTransform_10.TileTransform(new point_26.Point(dimensions.x - 1, j))));
                    }
                    // middle
                    for (var x = 1; x < dimensions.x - 1; x++) {
                        for (var y = 1; y < dimensions.y - 1; y++) {
                            tiles.push(slice[4].toComponent(new TileTransform_10.TileTransform(new point_26.Point(x, y))));
                        }
                    }
                    var mainTransform = tiles[0].transform;
                    tiles.forEach(function (c, i) {
                        c.transform.position = c.transform.position.times(tiles[0].transform.dimensions.x);
                        if (i > 0) {
                            c.transform.relativeTo(mainTransform);
                        }
                    });
                    mainTransform.position = mainTransform.position.plus(pos).apply(Math.floor);
                    return tiles;
                },
                /**
                 * Same as makeNineSliceComponents, but will stretch the middle parts instead of tiling.
                 * This lets you make nine-slices whose dimensions aren't a multiple of the tile size.
                 * @param slice the 9 parts to use to make a rectangle
                 * @param pos top-left top-left position
                 * @param dimensions dimensions of the desired rectangle in pixels. Should be at least TILE_SIZExTILE_SIZE
                 * @return All the tiles instantiated. The first element in the list is the main transform, the rest are relative.
                 */
                makeStretchedNineSliceComponents: function (slice, pos, dimensions) {
                    if (slice.length !== 9) {
                        throw new Error("nine slice gotta have nine slices ya dip");
                    }
                    // if (dimensions.x < 2 || dimensions.y < 2) {
                    // throw new Error("9 slice must be at least 2x2")
                    // }
                    var tiles = [];
                    var topLeft = slice[0].toComponent(new TileTransform_10.TileTransform(new point_26.Point(0, 0)));
                    var tileSize = topLeft.transform.dimensions.x;
                    // corners
                    tiles.push(topLeft);
                    tiles.push(slice[2].toComponent(new TileTransform_10.TileTransform(new point_26.Point(dimensions.x - tileSize, 0))));
                    tiles.push(slice[6].toComponent(new TileTransform_10.TileTransform(new point_26.Point(0, dimensions.y - tileSize))));
                    tiles.push(slice[8].toComponent(new TileTransform_10.TileTransform(new point_26.Point(dimensions.x - tileSize, dimensions.y - tileSize))));
                    // horizontal lines
                    var horizontalDimensions = new point_26.Point(dimensions.x - tileSize * 2, tileSize);
                    tiles.push(slice[1].toComponent(new TileTransform_10.TileTransform(new point_26.Point(tileSize, 0), horizontalDimensions)));
                    tiles.push(slice[7].toComponent(new TileTransform_10.TileTransform(new point_26.Point(tileSize, dimensions.y - tileSize), horizontalDimensions)));
                    // vertical lines
                    var verticalDimensions = new point_26.Point(tileSize, dimensions.y - tileSize * 2);
                    tiles.push(slice[3].toComponent(new TileTransform_10.TileTransform(new point_26.Point(0, tileSize), verticalDimensions)));
                    tiles.push(slice[5].toComponent(new TileTransform_10.TileTransform(new point_26.Point(dimensions.x - tileSize, tileSize), verticalDimensions)));
                    // middle
                    tiles.push(slice[4].toComponent(new TileTransform_10.TileTransform(new point_26.Point(tileSize, tileSize), new point_26.Point(dimensions.x - tileSize * 2, dimensions.y - tileSize * 2))));
                    var mainTransform = tiles[0].transform;
                    tiles.forEach(function (c, i) {
                        if (i > 0) {
                            c.transform.relativeTo(mainTransform);
                        }
                    });
                    mainTransform.position = mainTransform.position.plus(pos).apply(Math.floor);
                    return tiles;
                },
            });
        }
    };
});
System.register("game/ui/Color", [], function (exports_53, context_53) {
    "use strict";
    var Color;
    var __moduleName = context_53 && context_53.id;
    return {
        setters: [],
        execute: function () {
            exports_53("Color", Color = {
                BLACK: "#222222",
                DARK_DARK_PINK: "#5f2d56",
                DARK_PINK: "#993970",
                PINK: "#dc4a7b",
                LIGHT_PINK: "#f78697",
                RED: "#9f294e",
                DARK_RED: "#62232f",
                DARK_ORANGE: "#8f4029",
                ORANGE: "#c56025",
                LIGHT_ORANGE: "#ee8e2e",
                FLESH: "#fccba3",
                SUPER_ORANGE: "#da4e38",
                YELLOW: "#facb3e",
                LIME: "#97da3f",
                GREEN: "#4ba747",
                DARK_GREEN: "#3d734f",
                DARK_DARK_BLUE: "#314152",
                DARK_BLUE: "#417089",
                TEAL: "#49a790",
                BRIGHT_BLUE: "#72d6ce",
                LIGHT_BLUE: "#5698cc",
                PURPLE: "#5956bd",
                DARK_PURPLE: "#473579",
                DARK_PINKLE: "#8156aa",
                PINKLE: "#c278d0",
                LIGHT_PINKLE: "#f0b3dd",
                WHITE: "#fdf7ed",
                TAN: "#d3bfa9",
                LIGHT_BROWN: "#aa8d7a",
                BROWN: "#775c55",
                DARK_BROWN: "#483b3ai",
                /**
                 * @param colorString A string from the Color object
                 * @param a alpha double 0-1
                 */
                getRGB: function (colorString) {
                    var noHash = colorString.replace("#", "");
                    var r = parseInt(noHash.substring(0, 2), 16);
                    var g = parseInt(noHash.substring(2, 4), 16);
                    var b = parseInt(noHash.substring(4, 6), 16);
                    return [r, g, b];
                }
            });
        }
    };
});
System.register("game/ui/Tooltip", ["engine/component", "game/graphics/Tilesets", "engine/point", "engine/renderer/TextRender", "game/ui/Text", "game/ui/Color", "game/ui/UIStateManager"], function (exports_54, context_54) {
    "use strict";
    var component_9, Tilesets_8, point_27, TextRender_3, Text_1, Color_1, UIStateManager_1, Tooltip;
    var __moduleName = context_54 && context_54.id;
    return {
        setters: [
            function (component_9_1) {
                component_9 = component_9_1;
            },
            function (Tilesets_8_1) {
                Tilesets_8 = Tilesets_8_1;
            },
            function (point_27_1) {
                point_27 = point_27_1;
            },
            function (TextRender_3_1) {
                TextRender_3 = TextRender_3_1;
            },
            function (Text_1_1) {
                Text_1 = Text_1_1;
            },
            function (Color_1_1) {
                Color_1 = Color_1_1;
            },
            function (UIStateManager_1_1) {
                UIStateManager_1 = UIStateManager_1_1;
            }
        ],
        execute: function () {
            Tooltip = /** @class */ (function (_super) {
                __extends(Tooltip, _super);
                function Tooltip(text) {
                    if (text === void 0) { text = null; }
                    var _this = _super.call(this) || this;
                    _this.position = new point_27.Point(0, 0);
                    _this.text = text;
                    _this.start = function () {
                        _this.left = _this.entity.addComponent(Tilesets_8.Tilesets.instance.oneBit.getTileSource("tooltipLeft").toComponent());
                        _this.center = _this.entity.addComponent(Tilesets_8.Tilesets.instance.oneBit.getTileSource("tooltipCenter").toComponent());
                        _this.right = _this.entity.addComponent(Tilesets_8.Tilesets.instance.oneBit.getTileSource("tooltipRight").toComponent());
                    };
                    return _this;
                }
                Tooltip.prototype.say = function (text) {
                    this.text = text;
                };
                Tooltip.prototype.clear = function () {
                    this.text = null;
                };
                Tooltip.prototype.update = function (updateData) {
                    var _this = this;
                    var tiles = [this.left, this.center, this.right];
                    tiles.forEach(function (t) {
                        t.enabled = _this.text !== null;
                        t.transform.depth = UIStateManager_1.UIStateManager.UI_SPRITE_DEPTH + 1;
                    });
                    if (this.text === null) {
                        return;
                    }
                    var width = this.text.length * Text_1.TEXT_PIXEL_WIDTH;
                    var leftPos = this.position.plus(new point_27.Point(Tilesets_8.TILE_SIZE / 2, -Tilesets_8.TILE_SIZE)).apply(Math.floor);
                    var centerPos = leftPos.plus(new point_27.Point(Tilesets_8.TILE_SIZE, 0));
                    var rightPos = leftPos.plus(new point_27.Point(width - Tilesets_8.TILE_SIZE + Tooltip.margin * 2, 0)).apply(Math.floor);
                    this.left.transform.position = leftPos;
                    this.center.transform.position = centerPos;
                    this.right.transform.position = rightPos;
                    this.center.transform.dimensions = new point_27.Point(width + Tooltip.margin * 2 - Tilesets_8.TILE_SIZE * 2, Tilesets_8.TILE_SIZE);
                    var totalWidth = width + Tooltip.margin * 2;
                    if (this.position.x + totalWidth > updateData.dimensions.x) {
                        // shift left
                        tiles.forEach(function (t) { return t.transform.position = t.transform.position.plusX(-totalWidth - Tilesets_8.TILE_SIZE); });
                    }
                };
                Tooltip.prototype.getRenderMethods = function () {
                    if (this.text === null) {
                        return [];
                    }
                    return [new TextRender_3.TextRender(this.text, this.left.transform.position.plus(Tooltip.textOffset), Text_1.TEXT_SIZE, Text_1.TEXT_FONT, Color_1.Color.DARK_RED, UIStateManager_1.UIStateManager.UI_SPRITE_DEPTH + 2)];
                };
                Tooltip.margin = 6;
                Tooltip.textOffset = new point_27.Point(Tooltip.margin, Tooltip.margin - 1);
                return Tooltip;
            }(component_9.Component));
            exports_54("Tooltip", Tooltip);
        }
    };
});
System.register("game/ui/PlaceElementFrame", ["engine/component", "game/graphics/Tilesets", "engine/point", "engine/tiles/NineSlice", "game/ui/UIStateManager", "game/world/LocationManager", "game/ui/PlaceElementDisplay", "engine/util/utils", "engine/tiles/TileTransform"], function (exports_55, context_55) {
    "use strict";
    var component_10, Tilesets_9, point_28, NineSlice_1, UIStateManager_2, LocationManager_5, PlaceElementDisplay_1, utils_4, TileTransform_11, PlaceElementFrame;
    var __moduleName = context_55 && context_55.id;
    return {
        setters: [
            function (component_10_1) {
                component_10 = component_10_1;
            },
            function (Tilesets_9_1) {
                Tilesets_9 = Tilesets_9_1;
            },
            function (point_28_1) {
                point_28 = point_28_1;
            },
            function (NineSlice_1_1) {
                NineSlice_1 = NineSlice_1_1;
            },
            function (UIStateManager_2_1) {
                UIStateManager_2 = UIStateManager_2_1;
            },
            function (LocationManager_5_1) {
                LocationManager_5 = LocationManager_5_1;
            },
            function (PlaceElementDisplay_1_1) {
                PlaceElementDisplay_1 = PlaceElementDisplay_1_1;
            },
            function (utils_4_1) {
                utils_4 = utils_4_1;
            },
            function (TileTransform_11_1) {
                TileTransform_11 = TileTransform_11_1;
            }
        ],
        execute: function () {
            /**
             * This is a separate component which exists in the game view instead of the UI view, since it aligns with world tile coordinates
             */
            PlaceElementFrame = /** @class */ (function (_super) {
                __extends(PlaceElementFrame, _super);
                function PlaceElementFrame(dimensions) {
                    var _this = _super.call(this) || this;
                    _this.pixelPtToTilePt = function (pixelPt) {
                        return pixelPt.apply(function (n) {
                            return Math.round(Math.abs(n) / Tilesets_9.TILE_SIZE) * Math.sign(n);
                        });
                    };
                    _this.dimensions = dimensions;
                    if ((_this.dimensions.x === 1 && _this.dimensions.y !== 1) || (_this.dimensions.y === 1 && _this.dimensions.x !== 1)) {
                        throw new Error("haven't implemented small element placing yet :(");
                    }
                    return _this;
                }
                PlaceElementFrame.prototype.start = function () {
                    this.goodTiles = this.entity.addComponents(this.getTiles("good"));
                    this.goodTiles[0].transform.depth = UIStateManager_2.UIStateManager.UI_SPRITE_DEPTH;
                    this.badTiles = this.entity.addComponents(this.getTiles("bad"));
                    this.badTiles[0].transform.depth = UIStateManager_2.UIStateManager.UI_SPRITE_DEPTH;
                };
                PlaceElementFrame.prototype.getTiles = function (suffix) {
                    if (this.dimensions.x === 1 || this.dimensions.y === 1) {
                        return [Tilesets_9.Tilesets.instance.outdoorTiles.getTileSource("placingElementFrame_small_" + suffix).toComponent(new TileTransform_11.TileTransform())];
                    }
                    return NineSlice_1.NineSlice.makeNineSliceComponents(Tilesets_9.Tilesets.instance.outdoorTiles.getNineSlice("placingElementFrame_" + suffix), new point_28.Point(0, 0), this.dimensions);
                };
                PlaceElementFrame.prototype.update = function (updateData) {
                    var startPos = updateData.input.mousePos;
                    var tilePt = this.pixelPtToTilePt(startPos.minus(new point_28.Point(this.dimensions.x / 2, this.dimensions.y / 2).times(Tilesets_9.TILE_SIZE)));
                    var canPlace = this.canPlace(tilePt);
                    this.goodTiles.forEach(function (t) { return t.enabled = canPlace; });
                    this.badTiles.forEach(function (t) { return t.enabled = !canPlace; });
                    this.goodTiles[0].transform.position = tilePt.times(Tilesets_9.TILE_SIZE);
                    this.badTiles[0].transform.position = tilePt.times(Tilesets_9.TILE_SIZE);
                    if (canPlace && updateData.input.isMouseDown) {
                        PlaceElementDisplay_1.PlaceElementDisplay.instance.finishPlacing(tilePt);
                    }
                };
                PlaceElementFrame.prototype.delete = function () {
                    this.goodTiles.forEach(function (t) { return t.delete(); });
                    this.badTiles.forEach(function (t) { return t.delete(); });
                    _super.prototype.delete.call(this);
                };
                PlaceElementFrame.prototype.canPlace = function (pos) {
                    for (var x = pos.x; x < pos.x + this.dimensions.x; x++) {
                        for (var y = pos.y; y < pos.y + this.dimensions.y; y++) {
                            if (!!LocationManager_5.LocationManager.instance.currentLocation.elements.get(new point_28.Point(x, y))) {
                                return false;
                            }
                        }
                    }
                    var p = pos.times(Tilesets_9.TILE_SIZE);
                    var d = this.dimensions.times(Tilesets_9.TILE_SIZE);
                    return !Array.from(LocationManager_5.LocationManager.instance.currentLocation.dudes).some(function (dude) {
                        return utils_4.rectContains(p, d, dude.standingPosition) || utils_4.rectContains(p, d, dude.standingPosition.plusY(-Tilesets_9.TILE_SIZE));
                    });
                };
                return PlaceElementFrame;
            }(component_10.Component));
            exports_55("PlaceElementFrame", PlaceElementFrame);
        }
    };
});
System.register("game/ui/PlaceElementDisplay", ["engine/Entity", "engine/component", "game/world/elements/Elements", "game/Controls", "game/world/LocationManager", "game/characters/Player", "game/ui/PlaceElementFrame"], function (exports_56, context_56) {
    "use strict";
    var Entity_5, component_11, Elements_1, Controls_1, LocationManager_6, Player_2, PlaceElementFrame_1, PlaceElementDisplay;
    var __moduleName = context_56 && context_56.id;
    return {
        setters: [
            function (Entity_5_1) {
                Entity_5 = Entity_5_1;
            },
            function (component_11_1) {
                component_11 = component_11_1;
            },
            function (Elements_1_1) {
                Elements_1 = Elements_1_1;
            },
            function (Controls_1_1) {
                Controls_1 = Controls_1_1;
            },
            function (LocationManager_6_1) {
                LocationManager_6 = LocationManager_6_1;
            },
            function (Player_2_1) {
                Player_2 = Player_2_1;
            },
            function (PlaceElementFrame_1_1) {
                PlaceElementFrame_1 = PlaceElementFrame_1_1;
            }
        ],
        execute: function () {
            PlaceElementDisplay = /** @class */ (function (_super) {
                __extends(PlaceElementDisplay, _super);
                function PlaceElementDisplay() {
                    var _this = _super.call(this) || this;
                    _this.e = new Entity_5.Entity([_this]);
                    PlaceElementDisplay.instance = _this;
                    return _this;
                }
                Object.defineProperty(PlaceElementDisplay.prototype, "isOpen", {
                    get: function () { return !!this.element; },
                    enumerable: true,
                    configurable: true
                });
                PlaceElementDisplay.prototype.update = function (updateData) {
                    if (!this.element) {
                        return;
                    }
                    if (updateData.input.isKeyDown(Controls_1.Controls.closeButton)) {
                        this.close();
                    }
                };
                PlaceElementDisplay.prototype.close = function () {
                    this.element = null;
                    this.placingFrame.delete();
                };
                PlaceElementDisplay.prototype.startPlacing = function (element, successFn) {
                    this.element = element;
                    this.successFn = successFn;
                    this.dimensions = Elements_1.Elements.instance.dimensionsForPlacing(element);
                    this.placingFrame = Player_2.Player.instance.entity.addComponent(new PlaceElementFrame_1.PlaceElementFrame(this.dimensions));
                };
                // Should only be called by PlaceElementFrame
                PlaceElementDisplay.prototype.finishPlacing = function (elementPos) {
                    this.successFn(); // remove from inv
                    LocationManager_6.LocationManager.instance.currentLocation.addWorldElement(this.element, elementPos);
                    this.close();
                };
                PlaceElementDisplay.prototype.getEntities = function () {
                    return [this.e];
                };
                return PlaceElementDisplay;
            }(component_11.Component));
            exports_56("PlaceElementDisplay", PlaceElementDisplay);
        }
    };
});
System.register("game/ui/InventoryDisplay", ["engine/component", "engine/point", "engine/util/utils", "game/graphics/Tilesets", "game/characters/Player", "engine/Entity", "game/ui/UIStateManager", "engine/tiles/NineSlice", "game/ui/Tooltip", "engine/tiles/AnimatedTileComponent", "engine/tiles/TileTransform", "engine/renderer/BasicRenderComponent", "engine/renderer/TextRender", "game/items/Items", "game/ui/Text", "game/ui/Color", "game/Controls", "game/ui/PlaceElementDisplay"], function (exports_57, context_57) {
    "use strict";
    var component_12, point_29, utils_5, Tilesets_10, Player_3, Entity_6, UIStateManager_3, NineSlice_2, Tooltip_1, AnimatedTileComponent_2, TileTransform_12, BasicRenderComponent_2, TextRender_4, Items_3, Text_2, Color_2, Controls_2, PlaceElementDisplay_2, InventoryDisplay;
    var __moduleName = context_57 && context_57.id;
    return {
        setters: [
            function (component_12_1) {
                component_12 = component_12_1;
            },
            function (point_29_1) {
                point_29 = point_29_1;
            },
            function (utils_5_1) {
                utils_5 = utils_5_1;
            },
            function (Tilesets_10_1) {
                Tilesets_10 = Tilesets_10_1;
            },
            function (Player_3_1) {
                Player_3 = Player_3_1;
            },
            function (Entity_6_1) {
                Entity_6 = Entity_6_1;
            },
            function (UIStateManager_3_1) {
                UIStateManager_3 = UIStateManager_3_1;
            },
            function (NineSlice_2_1) {
                NineSlice_2 = NineSlice_2_1;
            },
            function (Tooltip_1_1) {
                Tooltip_1 = Tooltip_1_1;
            },
            function (AnimatedTileComponent_2_1) {
                AnimatedTileComponent_2 = AnimatedTileComponent_2_1;
            },
            function (TileTransform_12_1) {
                TileTransform_12 = TileTransform_12_1;
            },
            function (BasicRenderComponent_2_1) {
                BasicRenderComponent_2 = BasicRenderComponent_2_1;
            },
            function (TextRender_4_1) {
                TextRender_4 = TextRender_4_1;
            },
            function (Items_3_1) {
                Items_3 = Items_3_1;
            },
            function (Text_2_1) {
                Text_2 = Text_2_1;
            },
            function (Color_2_1) {
                Color_2 = Color_2_1;
            },
            function (Controls_2_1) {
                Controls_2 = Controls_2_1;
            },
            function (PlaceElementDisplay_2_1) {
                PlaceElementDisplay_2 = PlaceElementDisplay_2_1;
            }
        ],
        execute: function () {
            InventoryDisplay = /** @class */ (function (_super) {
                __extends(InventoryDisplay, _super);
                function InventoryDisplay() {
                    var _this = _super.call(this) || this;
                    _this.e = new Entity_6.Entity(); // entity for this component
                    _this.showingInv = false;
                    _this.coinsOffset = new point_29.Point(0, -18);
                    _this.e.addComponent(_this);
                    _this.tooltip = _this.e.addComponent(new Tooltip_1.Tooltip("wood x2"));
                    return _this;
                }
                Object.defineProperty(InventoryDisplay.prototype, "isOpen", {
                    get: function () { return this.showingInv; },
                    enumerable: true,
                    configurable: true
                });
                InventoryDisplay.prototype.inventory = function () {
                    return Player_3.Player.instance.dude.inventory;
                };
                InventoryDisplay.prototype.update = function (updateData) {
                    var _this = this;
                    var inv = this.inventory().inventory;
                    var pressI = updateData.input.isKeyDown(Controls_2.Controls.inventoryButton);
                    var pressEsc = updateData.input.isKeyDown(27 /* ESC */);
                    if (this.isOpen && (pressI || pressEsc)) {
                        this.close();
                    }
                    else if (pressI && !UIStateManager_3.UIStateManager.instance.isMenuOpen) {
                        this.show(updateData.dimensions);
                    }
                    if (!this.isOpen) {
                        return;
                    }
                    var hoverIndex = this.getInventoryIndexForPosition(updateData.input.mousePos);
                    if (!!this.trackedTile) { // dragging
                        this.tooltip.clear();
                        if (updateData.input.isMouseUp) { // drop n swap
                            if (hoverIndex !== -1) {
                                var value = inv[this.trackedTileIndex];
                                var currentlyOccupiedSpot = inv[hoverIndex];
                                inv[hoverIndex] = value;
                                inv[this.trackedTileIndex] = currentlyOccupiedSpot;
                            }
                            this.trackedTile = null;
                            // refresh view
                            this.show(updateData.dimensions);
                        }
                        else { // track
                            this.trackedTile.transform.position = this.trackedTile.transform.position.plus(updateData.input.mousePos.minus(this.lastMousPos));
                        }
                    }
                    else if (hoverIndex !== -1 && !!inv[hoverIndex]) { // we're hovering over an item
                        this.tooltip.position = updateData.input.mousePos;
                        var stack = inv[hoverIndex];
                        var name_1 = Items_3.ITEM_METADATA_MAP[stack.item].displayName;
                        var count = stack.count > 1 ? ' x' + stack.count : '';
                        var placeableElement = Items_3.ITEM_METADATA_MAP[stack.item].element;
                        var placePrompt = !!placeableElement ? " [" + Controls_2.Controls.keyString(Controls_2.Controls.placeElementButton) + " to place]" : '';
                        this.tooltip.say("" + name_1 + count + placePrompt);
                        if (!!placeableElement && updateData.input.isKeyDown(Controls_2.Controls.placeElementButton)) {
                            this.close();
                            // TODO this won't work properly with items that stack
                            PlaceElementDisplay_2.PlaceElementDisplay.instance.startPlacing(placeableElement, function () { return inv[hoverIndex] = null; });
                        }
                    }
                    else {
                        this.tooltip.clear();
                    }
                    this.lastMousPos = updateData.input.mousePos;
                    if (updateData.input.isMouseDown) {
                        inv.forEach(function (stack, index) {
                            if (utils_5.rectContains(_this.getPositionForInventoryIndex(index), new point_29.Point(Tilesets_10.TILE_SIZE, Tilesets_10.TILE_SIZE), updateData.input.mousePos)) {
                                _this.trackedTile = _this.tiles[index];
                                _this.trackedTileIndex = index;
                            }
                        });
                    }
                };
                InventoryDisplay.prototype.spawnBG = function () {
                    var _this = this;
                    this.bgTiles = NineSlice_2.NineSlice.makeNineSliceComponents(Tilesets_10.Tilesets.instance.oneBit.getNineSlice("invBoxNW"), this.offset.minus(new point_29.Point(Tilesets_10.TILE_SIZE / 2, Tilesets_10.TILE_SIZE / 2)), new point_29.Point(1 + InventoryDisplay.COLUMNS, 1 + this.inventory().inventory.length / InventoryDisplay.COLUMNS));
                    this.bgTiles.forEach(function (tile) {
                        _this.displayEntity.addComponent(tile);
                    });
                    this.bgTiles[0].transform.depth = UIStateManager_3.UIStateManager.UI_SPRITE_DEPTH;
                };
                InventoryDisplay.prototype.getEntities = function () {
                    return [this.e, this.displayEntity];
                };
                InventoryDisplay.prototype.close = function () {
                    var _this = this;
                    if (!!this.trackedTile) {
                        return;
                    }
                    this.showingInv = false;
                    this.tiles.forEach(function (c, index) {
                        _this.tiles[index] = null;
                    });
                    this.bgTiles.forEach(function (c) {
                        c.delete();
                    });
                    this.bgTiles = [];
                    this.tooltip.clear();
                    this.displayEntity = null;
                };
                InventoryDisplay.prototype.show = function (screenDimensions) {
                    var _this = this;
                    var _a;
                    this.showingInv = true;
                    var displayDimensions = new point_29.Point(InventoryDisplay.COLUMNS, this.inventory().inventory.length / InventoryDisplay.COLUMNS).times(Tilesets_10.TILE_SIZE);
                    this.offset = new point_29.Point(Math.floor(screenDimensions.x / 2 - displayDimensions.x / 2), Math.floor(screenDimensions.y / 5));
                    this.displayEntity = new Entity_6.Entity();
                    // coins
                    this.displayEntity.addComponent(new AnimatedTileComponent_2.AnimatedTileComponent([Tilesets_10.Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150)], new TileTransform_12.TileTransform(this.offset.plus(this.coinsOffset))));
                    this.displayEntity.addComponent(new BasicRenderComponent_2.BasicRenderComponent(new TextRender_4.TextRender("x" + this.inventory().getItemCount(0 /* COIN */), new point_29.Point(9, 1).plus(this.offset).plus(this.coinsOffset), Text_2.TEXT_SIZE, Text_2.TEXT_FONT, Color_2.Color.YELLOW, UIStateManager_3.UIStateManager.UI_SPRITE_DEPTH)));
                    // background
                    this.spawnBG();
                    // icons
                    this.tiles = this.inventory().inventory.map(function (stack, index) {
                        if (!!stack) {
                            var c = Items_3.ITEM_METADATA_MAP[stack.item].inventoryIconSupplier().toComponent();
                            c.transform.depth = UIStateManager_3.UIStateManager.UI_SPRITE_DEPTH + 1;
                            return _this.displayEntity.addComponent(c);
                        }
                    });
                    (_a = this.tiles) === null || _a === void 0 ? void 0 : _a.forEach(function (tile, index) {
                        if (!!tile) {
                            tile.transform.position = _this.getPositionForInventoryIndex(index);
                        }
                    });
                };
                InventoryDisplay.prototype.getPositionForInventoryIndex = function (i) {
                    return new point_29.Point(i % InventoryDisplay.COLUMNS, Math.floor(i / InventoryDisplay.COLUMNS)).times(Tilesets_10.TILE_SIZE).plus(this.offset);
                };
                InventoryDisplay.prototype.getInventoryIndexForPosition = function (pos) {
                    var p = pos.minus(this.offset);
                    var x = Math.floor(p.x / Tilesets_10.TILE_SIZE);
                    var y = Math.floor(p.y / Tilesets_10.TILE_SIZE);
                    if (x < 0 || x >= InventoryDisplay.COLUMNS || y < 0 || y >= Math.floor(this.inventory().inventory.length / InventoryDisplay.COLUMNS)) {
                        return -1;
                    }
                    return y * InventoryDisplay.COLUMNS + x;
                };
                InventoryDisplay.COLUMNS = 10;
                return InventoryDisplay;
            }(component_12.Component));
            exports_57("InventoryDisplay", InventoryDisplay);
        }
    };
});
System.register("game/world/events/QueuedEvent", ["game/characters/DudeFactory", "game/world/MapGenerator", "game/world/LocationManager"], function (exports_58, context_58) {
    "use strict";
    var _a, DudeFactory_1, MapGenerator_2, LocationManager_7, QueuedEventType, EVENT_QUEUE_HANDLERS;
    var __moduleName = context_58 && context_58.id;
    return {
        setters: [
            function (DudeFactory_1_1) {
                DudeFactory_1 = DudeFactory_1_1;
            },
            function (MapGenerator_2_1) {
                MapGenerator_2 = MapGenerator_2_1;
            },
            function (LocationManager_7_1) {
                LocationManager_7 = LocationManager_7_1;
            }
        ],
        execute: function () {
            (function (QueuedEventType) {
                QueuedEventType[QueuedEventType["TRADER_ARRIVAL"] = 0] = "TRADER_ARRIVAL";
            })(QueuedEventType || (QueuedEventType = {}));
            exports_58("QueuedEventType", QueuedEventType);
            exports_58("EVENT_QUEUE_HANDLERS", EVENT_QUEUE_HANDLERS = (_a = {},
                _a[QueuedEventType.TRADER_ARRIVAL] = function () {
                    DudeFactory_1.DudeFactory.instance.new(4 /* HERALD */, MapGenerator_2.MapGenerator.ENTER_LAND_POS, LocationManager_7.LocationManager.instance.exterior());
                    console.log("the trader is here (ノ ″ロ″)ノ");
                },
                _a));
        }
    };
});
System.register("game/saves/SaveGame", [], function (exports_59, context_59) {
    "use strict";
    var Save;
    var __moduleName = context_59 && context_59.id;
    return {
        setters: [],
        execute: function () {
            Save = /** @class */ (function () {
                function Save() {
                }
                return Save;
            }());
            exports_59("Save", Save);
        }
    };
});
System.register("game/world/events/EventQueue", ["engine/util/BinaryHeap", "game/world/events/QueuedEvent"], function (exports_60, context_60) {
    "use strict";
    var BinaryHeap_2, QueuedEvent_1, EventQueue;
    var __moduleName = context_60 && context_60.id;
    return {
        setters: [
            function (BinaryHeap_2_1) {
                BinaryHeap_2 = BinaryHeap_2_1;
            },
            function (QueuedEvent_1_1) {
                QueuedEvent_1 = QueuedEvent_1_1;
            }
        ],
        execute: function () {
            EventQueue = /** @class */ (function () {
                function EventQueue(data) {
                    if (data === void 0) { data = []; }
                    EventQueue.instance = this;
                    this.heap = new BinaryHeap_2.BinaryHeap(function (e) { return e.time; }, data);
                }
                EventQueue.prototype.addEvent = function (event) {
                    this.heap.push(event);
                };
                EventQueue.prototype.processEvents = function (currentTime) {
                    while (this.heap.size() > 0 && this.heap.peek().time <= currentTime) {
                        var event_1 = this.heap.pop();
                        QueuedEvent_1.EVENT_QUEUE_HANDLERS[event_1.type](event_1);
                    }
                };
                EventQueue.prototype.save = function () {
                    return this.heap.getContents();
                };
                return EventQueue;
            }());
            exports_60("EventQueue", EventQueue);
        }
    };
});
System.register("game/world/WorldTime", ["engine/Entity", "engine/component", "game/world/events/EventQueue"], function (exports_61, context_61) {
    "use strict";
    var Entity_7, component_13, EventQueue_1, WorldTime;
    var __moduleName = context_61 && context_61.id;
    return {
        setters: [
            function (Entity_7_1) {
                Entity_7 = Entity_7_1;
            },
            function (component_13_1) {
                component_13 = component_13_1;
            },
            function (EventQueue_1_1) {
                EventQueue_1 = EventQueue_1_1;
            }
        ],
        execute: function () {
            WorldTime = /** @class */ (function (_super) {
                __extends(WorldTime, _super);
                function WorldTime(time) {
                    if (time === void 0) { time = 0; }
                    var _this = _super.call(this) || this;
                    _this._time = 0; // millis
                    WorldTime.instance = _this;
                    _this._time = time;
                    return _this;
                }
                Object.defineProperty(WorldTime.prototype, "time", {
                    get: function () { return this._time; },
                    enumerable: true,
                    configurable: true
                });
                WorldTime.prototype.update = function (updateData) {
                    this._time += updateData.elapsedTimeMillis;
                    // TODO cleanup
                    if (updateData.input.isKeyDown(78 /* N */) || updateData.input.isKeyDown(77 /* M */)) {
                        this._time += updateData.input.isKeyDown(78 /* N */) ? WorldTime.HOUR : WorldTime.MINUTE;
                        console.log("fast forwarding time to " + this.clockTime());
                    }
                    EventQueue_1.EventQueue.instance.processEvents(this.time);
                };
                WorldTime.prototype.getEntity = function () {
                    return new Entity_7.Entity([this]);
                };
                WorldTime.prototype.future = function (_a) {
                    var _b = _a.minutes, minutes = _b === void 0 ? 0 : _b, _c = _a.hours, hours = _c === void 0 ? 0 : _c, _d = _a.days, days = _d === void 0 ? 0 : _d;
                    return this.time + (minutes * WorldTime.MINUTE) + (hours * WorldTime.HOUR) + (days * WorldTime.DAY);
                };
                WorldTime.prototype.clockTime = function () {
                    var hour = Math.floor(this.time % WorldTime.DAY / WorldTime.HOUR);
                    var minute = Math.floor(this.time % WorldTime.HOUR / WorldTime.MINUTE);
                    return (hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour)) + ":" + (minute < 10 ? "0" : "") + minute + " " + (hour < 12 ? "AM" : "PM");
                };
                WorldTime.MINUTE = 1500; // millis in an in-game minute
                WorldTime.HOUR = 60 * WorldTime.MINUTE;
                WorldTime.DAY = 24 * WorldTime.HOUR;
                return WorldTime;
            }(component_13.Component));
            exports_61("WorldTime", WorldTime);
        }
    };
});
System.register("game/SaveManager", ["game/characters/Player", "game/world/LocationManager", "game/ui/UIStateManager", "game/cutscenes/Camera", "game/ui/HUD", "game/world/WorldTime", "game/world/events/EventQueue"], function (exports_62, context_62) {
    "use strict";
    var Player_4, LocationManager_8, UIStateManager_4, Camera_2, HUD_1, WorldTime_1, EventQueue_2, SaveManager;
    var __moduleName = context_62 && context_62.id;
    return {
        setters: [
            function (Player_4_1) {
                Player_4 = Player_4_1;
            },
            function (LocationManager_8_1) {
                LocationManager_8 = LocationManager_8_1;
            },
            function (UIStateManager_4_1) {
                UIStateManager_4 = UIStateManager_4_1;
            },
            function (Camera_2_1) {
                Camera_2 = Camera_2_1;
            },
            function (HUD_1_1) {
                HUD_1 = HUD_1_1;
            },
            function (WorldTime_1_1) {
                WorldTime_1 = WorldTime_1_1;
            },
            function (EventQueue_2_1) {
                EventQueue_2 = EventQueue_2_1;
            }
        ],
        execute: function () {
            SaveManager = /** @class */ (function () {
                function SaveManager() {
                    SaveManager.instance = this;
                }
                SaveManager.prototype.save = function () {
                    if (!Player_4.Player.instance.dude.isAlive) {
                        console.log("cannot save after death");
                        return;
                    }
                    HUD_1.HUD.instance.showSaveIcon();
                    var save = {
                        timeSaved: new Date().getTime(),
                        saveVersion: 0,
                        locations: LocationManager_8.LocationManager.instance.save(),
                        worldTime: WorldTime_1.WorldTime.instance.time,
                        eventQueue: EventQueue_2.EventQueue.instance.save()
                    };
                    console.log("saved game");
                    localStorage.setItem("save", JSON.stringify(save)); // TODO support save slots
                };
                /**
                 * @return true if a save was loaded successfully
                 */
                SaveManager.prototype.load = function () {
                    var blob = localStorage.getItem("save");
                    if (!blob) {
                        console.log("no save found");
                        return false;
                    }
                    var save = JSON.parse(blob);
                    var prettyPrintTimestamp = new Date();
                    prettyPrintTimestamp.setTime(save.timeSaved);
                    console.log("loaded save from " + prettyPrintTimestamp);
                    LocationManager_8.LocationManager.load(save.locations);
                    new WorldTime_1.WorldTime(save.worldTime);
                    new EventQueue_2.EventQueue(save.eventQueue);
                    Camera_2.Camera.instance.focusOnDude(Array.from(LocationManager_8.LocationManager.instance.currentLocation.dudes).filter(function (d) { return d.type === 0 /* PLAYER */; })[0]);
                    // clear existing UI state by overwriting singleton
                    new UIStateManager_4.UIStateManager();
                    return true;
                };
                return SaveManager;
            }());
            exports_62("SaveManager", SaveManager);
        }
    };
});
System.register("game/ui/DudeInteractIndicator", ["game/graphics/Tilesets", "engine/point"], function (exports_63, context_63) {
    "use strict";
    var Tilesets_11, point_30, DudeInteractIndicator;
    var __moduleName = context_63 && context_63.id;
    return {
        setters: [
            function (Tilesets_11_1) {
                Tilesets_11 = Tilesets_11_1;
            },
            function (point_30_1) {
                point_30 = point_30_1;
            }
        ],
        execute: function () {
            exports_63("DudeInteractIndicator", DudeInteractIndicator = {
                NONE: "",
                IMPORTANT_DIALOGUE: "!",
                getTile: function (indicator) {
                    switch (indicator) {
                        case DudeInteractIndicator.NONE:
                            return null;
                        case DudeInteractIndicator.IMPORTANT_DIALOGUE:
                            return Tilesets_11.Tilesets.instance.oneBit.getTileAt(new point_30.Point(19, 25));
                    }
                },
            });
        }
    };
});
System.register("game/ui/TextButton", ["engine/component", "engine/point", "game/graphics/Tilesets", "game/ui/Text", "engine/renderer/TextRender", "game/ui/UIStateManager", "engine/util/utils"], function (exports_64, context_64) {
    "use strict";
    var component_14, point_31, Tilesets_12, Text_3, TextRender_5, UIStateManager_5, utils_6, TextButton;
    var __moduleName = context_64 && context_64.id;
    return {
        setters: [
            function (component_14_1) {
                component_14 = component_14_1;
            },
            function (point_31_1) {
                point_31 = point_31_1;
            },
            function (Tilesets_12_1) {
                Tilesets_12 = Tilesets_12_1;
            },
            function (Text_3_1) {
                Text_3 = Text_3_1;
            },
            function (TextRender_5_1) {
                TextRender_5 = TextRender_5_1;
            },
            function (UIStateManager_5_1) {
                UIStateManager_5 = UIStateManager_5_1;
            },
            function (utils_6_1) {
                utils_6 = utils_6_1;
            }
        ],
        execute: function () {
            TextButton = /** @class */ (function (_super) {
                __extends(TextButton, _super);
                function TextButton(position, text, onClick, buttonColor, textColor, hoverColor) {
                    var _this = _super.call(this) || this;
                    _this.position = position;
                    _this.text = text;
                    _this.onClick = onClick;
                    _this.textColor = textColor;
                    _this.hoverColor = hoverColor;
                    _this.width = _this.text.length * Text_3.TEXT_PIXEL_WIDTH + TextButton.margin * 2;
                    _this.start = function () {
                        _this.left = _this.entity.addComponent(Tilesets_12.Tilesets.instance.oneBit.getTileSource("btnLeft_" + buttonColor).toComponent());
                        _this.center = _this.entity.addComponent(Tilesets_12.Tilesets.instance.oneBit.getTileSource("btnCenter_" + buttonColor).toComponent());
                        _this.right = _this.entity.addComponent(Tilesets_12.Tilesets.instance.oneBit.getTileSource("btnRight_" + buttonColor).toComponent());
                        var leftPos = _this.position.apply(Math.floor);
                        var centerPos = leftPos.plus(new point_31.Point(Tilesets_12.TILE_SIZE, 0));
                        var rightPos = leftPos.plus(new point_31.Point(_this.width - Tilesets_12.TILE_SIZE, 0)).apply(Math.floor);
                        _this.left.transform.position = leftPos;
                        _this.center.transform.position = centerPos;
                        _this.right.transform.position = rightPos;
                        _this.center.transform.dimensions = new point_31.Point(_this.width + TextButton.margin * 2 - Tilesets_12.TILE_SIZE * 2, Tilesets_12.TILE_SIZE);
                        Array.from([_this.left, _this.center, _this.right]).forEach(function (t) { return t.transform.depth = UIStateManager_5.UIStateManager.UI_SPRITE_DEPTH + 1; });
                    };
                    return _this;
                }
                TextButton.prototype.update = function (updateData) {
                    this.hovering = utils_6.rectContains(this.position, new point_31.Point(this.width, Tilesets_12.TILE_SIZE), updateData.input.mousePos);
                    if (this.hovering && updateData.input.isMouseDown) {
                        this.onClick();
                    }
                };
                TextButton.prototype.getRenderMethods = function () {
                    if (this.text === null) {
                        return [];
                    }
                    return [new TextRender_5.TextRender(this.text, this.left.transform.position.plus(TextButton.textOffset), Text_3.TEXT_SIZE, Text_3.TEXT_FONT, this.hovering ? this.hoverColor : this.textColor, UIStateManager_5.UIStateManager.UI_SPRITE_DEPTH + 2)];
                };
                TextButton.margin = 6;
                TextButton.textOffset = new point_31.Point(TextButton.margin, TextButton.margin - 2);
                return TextButton;
            }(component_14.Component));
            exports_64("TextButton", TextButton);
        }
    };
});
System.register("game/ui/ButtonsMenu", ["engine/point", "game/ui/TextButton", "game/ui/UIStateManager", "game/graphics/Tilesets", "engine/tiles/NineSlice", "game/ui/Text", "engine/Entity"], function (exports_65, context_65) {
    "use strict";
    var point_32, TextButton_1, UIStateManager_6, Tilesets_13, NineSlice_3, Text_4, Entity_8, ButtonsMenu;
    var __moduleName = context_65 && context_65.id;
    return {
        setters: [
            function (point_32_1) {
                point_32 = point_32_1;
            },
            function (TextButton_1_1) {
                TextButton_1 = TextButton_1_1;
            },
            function (UIStateManager_6_1) {
                UIStateManager_6 = UIStateManager_6_1;
            },
            function (Tilesets_13_1) {
                Tilesets_13 = Tilesets_13_1;
            },
            function (NineSlice_3_1) {
                NineSlice_3 = NineSlice_3_1;
            },
            function (Text_4_1) {
                Text_4 = Text_4_1;
            },
            function (Entity_8_1) {
                Entity_8 = Entity_8_1;
            }
        ],
        execute: function () {
            exports_65("ButtonsMenu", ButtonsMenu = {
                render: function (screenDimensions, backgroundColor, options) {
                    var longestOption = Math.max.apply(Math, options.map(function (o) { return o.text.length; }));
                    var marginTop = 13;
                    var marginBottom = 12;
                    var marginSide = 9;
                    var buttonPadding = 3;
                    var dimensions = new point_32.Point(longestOption * Text_4.TEXT_PIXEL_WIDTH + marginSide * 2 + TextButton_1.TextButton.margin * 2, (options.length - 1) * buttonPadding + options.length * Tilesets_13.TILE_SIZE + marginTop + marginBottom);
                    var topLeft = screenDimensions.div(2).minus(dimensions.div(2));
                    var backgroundTiles = NineSlice_3.NineSlice.makeStretchedNineSliceComponents(backgroundColor === "red" ? Tilesets_13.Tilesets.instance.oneBit.getNineSlice("invBoxNW") : Tilesets_13.Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"), topLeft, dimensions);
                    backgroundTiles[0].transform.depth = UIStateManager_6.UIStateManager.UI_SPRITE_DEPTH;
                    var e = new Entity_8.Entity();
                    backgroundTiles.forEach(function (tile) { return e.addComponent(tile); });
                    options.forEach(function (option, i) { return e.addComponent(new TextButton_1.TextButton(topLeft.plus(new point_32.Point(dimensions.x / 2 - (Text_4.TEXT_PIXEL_WIDTH * option.text.length / 2) - TextButton_1.TextButton.margin, marginTop + i * (Tilesets_13.TILE_SIZE + buttonPadding))), option.text, function () { return option.fn(); }, option.buttonColor, option.textColor, option.hoverColor)); });
                    return e;
                }
            });
        }
    };
});
System.register("game/ui/ControlsUI", ["game/ui/KeyPressIndicator", "engine/point", "game/graphics/Tilesets", "engine/tiles/TileTransform", "game/ui/Text", "game/ui/Color", "game/ui/UIStateManager"], function (exports_66, context_66) {
    "use strict";
    var KeyPressIndicator_1, point_33, Tilesets_14, TileTransform_13, Text_5, Color_3, UIStateManager_7, makeControlsUI;
    var __moduleName = context_66 && context_66.id;
    return {
        setters: [
            function (KeyPressIndicator_1_1) {
                KeyPressIndicator_1 = KeyPressIndicator_1_1;
            },
            function (point_33_1) {
                point_33 = point_33_1;
            },
            function (Tilesets_14_1) {
                Tilesets_14 = Tilesets_14_1;
            },
            function (TileTransform_13_1) {
                TileTransform_13 = TileTransform_13_1;
            },
            function (Text_5_1) {
                Text_5 = Text_5_1;
            },
            function (Color_3_1) {
                Color_3 = Color_3_1;
            },
            function (UIStateManager_7_1) {
                UIStateManager_7 = UIStateManager_7_1;
            }
        ],
        execute: function () {
            exports_66("makeControlsUI", makeControlsUI = function (dimensions, offset) {
                var topLeft = new point_33.Point(dimensions.x / 2 - Tilesets_14.TILE_SIZE * 4 + 1, dimensions.y / 2 - Tilesets_14.TILE_SIZE * 5).plus(offset);
                var mouseButtVertOffset = 5;
                return __spreadArrays(new KeyPressIndicator_1.KeyPressIndicator(topLeft.plusX(Tilesets_14.TILE_SIZE), 87 /* W */).getRenderMethods(), new KeyPressIndicator_1.KeyPressIndicator(topLeft.plusY(Tilesets_14.TILE_SIZE), 65 /* A */).getRenderMethods(), new KeyPressIndicator_1.KeyPressIndicator(topLeft.plusX(Tilesets_14.TILE_SIZE).plusY(Tilesets_14.TILE_SIZE), 83 /* S */).getRenderMethods(), new KeyPressIndicator_1.KeyPressIndicator(topLeft.plusX(Tilesets_14.TILE_SIZE * 2).plusY(Tilesets_14.TILE_SIZE), 68 /* D */).getRenderMethods(), [
                    Tilesets_14.Tilesets.instance.oneBit.getTileSource("leftClick").toImageRender(new TileTransform_13.TileTransform(topLeft.plusX(Tilesets_14.TILE_SIZE * 4).plusY(mouseButtVertOffset))),
                    Tilesets_14.Tilesets.instance.oneBit.getTileSource("rightClick").toImageRender(new TileTransform_13.TileTransform(topLeft.plusX(Tilesets_14.TILE_SIZE * 4).plusY(Tilesets_14.TILE_SIZE * 1 + mouseButtVertOffset)))
                ], Text_5.formatText("MOVE", Color_3.Color.WHITE, topLeft.plusX(Tilesets_14.TILE_SIZE / 2).plusY(Tilesets_14.TILE_SIZE * 2 + 2), 100), Text_5.formatText("ATTACK", Color_3.Color.WHITE, topLeft.plusX(Tilesets_14.TILE_SIZE * 5).plusY(4 + mouseButtVertOffset), 100), Text_5.formatText("BLOCK", Color_3.Color.WHITE, topLeft.plusX(Tilesets_14.TILE_SIZE * 5).plusY(Tilesets_14.TILE_SIZE + 4 + mouseButtVertOffset), 100)).map(function (r) {
                    r.depth = UIStateManager_7.UIStateManager.UI_SPRITE_DEPTH;
                    return r;
                });
            });
        }
    };
});
System.register("game/items/CraftingRecipe", ["game/items/Inventory", "game/graphics/Tilesets", "engine/point", "game/characters/dialogues/DipIntro"], function (exports_67, context_67) {
    "use strict";
    var Inventory_1, Tilesets_15, point_34, DipIntro_1, getDipRecipes;
    var __moduleName = context_67 && context_67.id;
    return {
        setters: [
            function (Inventory_1_1) {
                Inventory_1 = Inventory_1_1;
            },
            function (Tilesets_15_1) {
                Tilesets_15 = Tilesets_15_1;
            },
            function (point_34_1) {
                point_34 = point_34_1;
            },
            function (DipIntro_1_1) {
                DipIntro_1 = DipIntro_1_1;
            }
        ],
        execute: function () {
            exports_67("getDipRecipes", getDipRecipes = function () { return [{
                    icon: Tilesets_15.Tilesets.instance.oneBit.getTileAt(new point_34.Point(0, 7)),
                    name: "Outdoor Furniture",
                    recipes: [{
                            output: 4 /* CAMPFIRE */,
                            input: [new Inventory_1.ItemStack(1 /* ROCK */, DipIntro_1.ROCKS_NEEDED_FOR_CAMPFIRE), new Inventory_1.ItemStack(2 /* WOOD */, DipIntro_1.WOOD_NEEDED_FOR_CAMPFIRE)],
                        }],
                },
            ]; });
        }
    };
});
System.register("game/graphics/ImageFilters", ["game/ui/Color"], function (exports_68, context_68) {
    "use strict";
    var Color_4, ImageFilters;
    var __moduleName = context_68 && context_68.id;
    return {
        setters: [
            function (Color_4_1) {
                Color_4 = Color_4_1;
            }
        ],
        execute: function () {
            exports_68("ImageFilters", ImageFilters = {
                tint: function (color) {
                    var rgb = Color_4.Color.getRGB(color);
                    return function (img) {
                        for (var i = 0; i < img.data.length; i += 4) {
                            if (img.data[i + 3] !== 0) {
                                img.data[i + 0] = rgb[0];
                                img.data[i + 1] = rgb[1];
                                img.data[i + 2] = rgb[2];
                            }
                        }
                    };
                }
            });
        }
    };
});
System.register("game/ui/CraftingMenu", ["engine/Entity", "engine/component", "engine/point", "game/ui/Color", "engine/renderer/BasicRenderComponent", "game/cutscenes/Camera", "engine/tiles/NineSlice", "game/graphics/Tilesets", "engine/renderer/ImageRender", "game/ui/UIStateManager", "game/items/Items", "game/ui/Text", "engine/tiles/TileTransform", "game/graphics/ImageFilters", "game/characters/Player", "engine/util/utils", "game/ui/Tooltip"], function (exports_69, context_69) {
    "use strict";
    var Entity_9, component_15, point_35, Color_5, BasicRenderComponent_3, Camera_3, NineSlice_4, Tilesets_16, ImageRender_2, UIStateManager_8, Items_4, Text_6, TileTransform_14, ImageFilters_1, Player_5, utils_7, Tooltip_2, CraftingMenu;
    var __moduleName = context_69 && context_69.id;
    return {
        setters: [
            function (Entity_9_1) {
                Entity_9 = Entity_9_1;
            },
            function (component_15_1) {
                component_15 = component_15_1;
            },
            function (point_35_1) {
                point_35 = point_35_1;
            },
            function (Color_5_1) {
                Color_5 = Color_5_1;
            },
            function (BasicRenderComponent_3_1) {
                BasicRenderComponent_3 = BasicRenderComponent_3_1;
            },
            function (Camera_3_1) {
                Camera_3 = Camera_3_1;
            },
            function (NineSlice_4_1) {
                NineSlice_4 = NineSlice_4_1;
            },
            function (Tilesets_16_1) {
                Tilesets_16 = Tilesets_16_1;
            },
            function (ImageRender_2_1) {
                ImageRender_2 = ImageRender_2_1;
            },
            function (UIStateManager_8_1) {
                UIStateManager_8 = UIStateManager_8_1;
            },
            function (Items_4_1) {
                Items_4 = Items_4_1;
            },
            function (Text_6_1) {
                Text_6 = Text_6_1;
            },
            function (TileTransform_14_1) {
                TileTransform_14 = TileTransform_14_1;
            },
            function (ImageFilters_1_1) {
                ImageFilters_1 = ImageFilters_1_1;
            },
            function (Player_5_1) {
                Player_5 = Player_5_1;
            },
            function (utils_7_1) {
                utils_7 = utils_7_1;
            },
            function (Tooltip_2_1) {
                Tooltip_2 = Tooltip_2_1;
            }
        ],
        execute: function () {
            CraftingMenu = /** @class */ (function (_super) {
                __extends(CraftingMenu, _super);
                function CraftingMenu() {
                    var _this = _super.call(this) || this;
                    _this.e = new Entity_9.Entity([_this]); // entity for this component
                    _this.isOpen = false;
                    _this.dimensions = new point_35.Point(160, 158);
                    _this.innerDimensions = _this.dimensions.minus(new point_35.Point(10, 14));
                    _this.scrollOffset = 0;
                    _this.justCraftedRow = -1; // if this is non-negative, this row was just crafted and will be highlighted
                    _this.justOpened = false; // prevent bug where the mouse is held down immediately
                    _this.tooltip = _this.e.addComponent(new Tooltip_2.Tooltip());
                    // caching stuff
                    _this.itemIcons = new Map();
                    _this.tintedIcons = new Map();
                    CraftingMenu.instance = _this;
                    _this.canvas = document.createElement("canvas");
                    _this.canvas.width = _this.innerDimensions.x;
                    _this.canvas.height = _this.innerDimensions.y;
                    _this.context = _this.canvas.getContext("2d", { alpha: false });
                    return _this;
                }
                CraftingMenu.prototype.update = function (updateData) {
                    if (updateData.input.isKeyDown(27 /* ESC */) && this.isOpen) {
                        this.close();
                    }
                    if (this.isOpen) {
                        this.tooltip.clear();
                        this.tooltip.position = updateData.input.mousePos;
                        var rowsTall = 6; // will need to change this if dimensions are adjusted
                        var category = this.recipes[this.recipeCategory];
                        this.scrollOffset -= updateData.input.mouseWheelDeltaY * updateData.elapsedTimeMillis * 0.01;
                        this.scrollOffset = Math.floor(Math.max(Math.min(0, this.scrollOffset), -Math.max(category.recipes.length, rowsTall) * 24 + this.innerDimensions.y));
                        var screenDimensions = Camera_3.Camera.instance.dimensions;
                        var topLeft = screenDimensions.div(2).minus(this.dimensions.div(2)).plusY(-Tilesets_16.TILE_SIZE);
                        this.displayEntity = new Entity_9.Entity(__spreadArrays(this.renderCategories(updateData, topLeft), this.renderRecipes(updateData, topLeft, category.recipes)));
                        this.justOpened = false;
                        if (this.justCraftedRow !== -1) {
                            this.tooltip.say("Crafted!");
                        }
                    }
                };
                CraftingMenu.prototype.close = function () {
                    this.isOpen = false;
                    this.displayEntity = null;
                    this.tooltip.clear();
                };
                CraftingMenu.prototype.show = function (recipes) {
                    this.isOpen = true;
                    this.recipes = recipes;
                    this.scrollOffset = 0;
                    this.justOpened = true;
                    this.selectCategory(0);
                };
                CraftingMenu.prototype.selectCategory = function (category) {
                    this.recipeCategory = category;
                    this.justCraftedRow = -1;
                };
                CraftingMenu.prototype.renderCategories = function (updateData, topLeft) {
                    // TODO category switching
                    var result = [];
                    for (var i = 0; i < this.recipes.length; i++) {
                        var category = this.recipes[i];
                        var pos = topLeft.plusX(i * Tilesets_16.TILE_SIZE * 2);
                        var dims = new point_35.Point(2, 2);
                        var hovered = utils_7.rectContains(pos, dims.times(Tilesets_16.TILE_SIZE), updateData.input.mousePos);
                        result.push.apply(result, NineSlice_4.NineSlice.makeNineSliceComponents(Tilesets_16.Tilesets.instance.oneBit.getNineSlice("invBoxNW"), pos, dims));
                        var icon = i === this.recipeCategory || hovered ? category.icon : this.tintedIcon(category.icon, Color_5.Color.PINK);
                        result.push(icon.toComponent(new TileTransform_14.TileTransform(topLeft.plusX(i * Tilesets_16.TILE_SIZE * 2 + Tilesets_16.TILE_SIZE / 2).plusY(Tilesets_16.TILE_SIZE / 2))));
                        if (!this.justOpened && hovered && updateData.input.isMouseDown) {
                            this.selectCategory(i);
                        }
                        if (hovered) {
                            this.tooltip.say(category.name);
                        }
                    }
                    return result;
                };
                CraftingMenu.prototype.canCraft = function (recipe) {
                    return this.justCraftedRow === -1
                        && !this.justOpened
                        && Player_5.Player.instance.dude.inventory.canAddItem(recipe.output)
                        && recipe.input.every(function (input) { return Player_5.Player.instance.dude.inventory.getItemCount(input.item) >= input.count; });
                };
                CraftingMenu.prototype.renderRecipes = function (updateData, topLeft, recipes) {
                    var _this = this;
                    topLeft = topLeft.plusY(Tilesets_16.TILE_SIZE * 2);
                    this.context.imageSmoothingEnabled = false; // TODO figure out why text is aliased
                    this.context.font = Text_6.TEXT_SIZE + "px '" + Text_6.TEXT_FONT + "'";
                    // draw background
                    var backgroundTiles = NineSlice_4.NineSlice.makeStretchedNineSliceComponents(Tilesets_16.Tilesets.instance.outdoorTiles.getNineSlice("invBoxFrame"), topLeft, this.dimensions);
                    backgroundTiles[0].transform.depth = UIStateManager_8.UIStateManager.UI_SPRITE_DEPTH;
                    this.context.fillStyle = Color_5.Color.RED;
                    this.context.fillRect(0, 0, this.innerDimensions.x, this.innerDimensions.y);
                    var width = this.innerDimensions.x;
                    var margin = 4;
                    var rowHeight = Tilesets_16.TILE_SIZE + margin * 2;
                    var innerOffset = this.dimensions.minus(this.innerDimensions).div(2);
                    var verticalTextOffset = 13;
                    var verticalOffset = this.scrollOffset;
                    var shiftedMousePos = updateData.input.mousePos.plusY(-this.scrollOffset);
                    for (var r = 0; r < recipes.length; r++) {
                        var hovered = utils_7.rectContains(topLeft.plusX(margin).plusY(rowHeight * r + margin * 2), new point_35.Point(this.innerDimensions.x, rowHeight), shiftedMousePos) && utils_7.rectContains(// within the frame itself
                        topLeft.plus(innerOffset), this.innerDimensions, updateData.input.mousePos);
                        var recipe = recipes[r];
                        var craftedItem = Items_4.ITEM_METADATA_MAP[recipe.output];
                        // craft the item
                        if (hovered && updateData.input.isMouseDown && this.canCraft(recipe)) {
                            // TODO a sound effect
                            recipe.input.forEach(function (ingr) {
                                Player_5.Player.instance.dude.inventory.removeItem(ingr.item, ingr.count);
                            });
                            Player_5.Player.instance.dude.inventory.addItem(recipe.output);
                            this.justCraftedRow = r;
                            setTimeout(function () { return _this.justCraftedRow = -1; }, 900);
                        }
                        if (hovered && !this.canCraft(recipe)) {
                            if (!Player_5.Player.instance.dude.inventory.canAddItem(recipe.output)) {
                                this.tooltip.say("Inventory full");
                            }
                            else if (recipe.input.some(function (input) { return Player_5.Player.instance.dude.inventory.getItemCount(input.item) < input.count; })) {
                                this.tooltip.say("Need ingredients");
                            }
                        }
                        else if (hovered) {
                            this.tooltip.say("Click to craft");
                        }
                        // craftable item
                        verticalOffset += margin;
                        var plainIcon = this.getItemIcon(recipe.output);
                        var craftedItemColor = void 0;
                        if (hovered) {
                            if (r === this.justCraftedRow) {
                                craftedItemColor = Color_5.Color.DARK_RED;
                            }
                            else {
                                craftedItemColor = Color_5.Color.WHITE;
                            }
                        }
                        else {
                            craftedItemColor = Color_5.Color.PINK;
                        }
                        this.context.fillStyle = craftedItemColor;
                        var craftedItemIcon = this.tintedIcon(plainIcon, craftedItemColor);
                        this.drawIconAt(craftedItemIcon, margin, verticalOffset);
                        this.context.fillText(craftedItem.displayName, Tilesets_16.TILE_SIZE + margin * 2, verticalTextOffset + verticalOffset);
                        // ingredients
                        // TODO add tooltip when hovering eg "Wood (17/10)"
                        var offsetFromRight = 0;
                        for (var i = 0; i < recipe.input.length; i++) {
                            var ingr = recipe.input[recipe.input.length - i - 1];
                            var plainIngredientIcon = this.getItemIcon(ingr.item);
                            var ingredientIcon = plainIngredientIcon;
                            if (Player_5.Player.instance.dude.inventory.getItemCount(ingr.item) < ingr.count) {
                                this.context.fillStyle = Color_5.Color.DARK_RED;
                                ingredientIcon = this.tintedIcon(ingredientIcon, Color_5.Color.DARK_RED);
                            }
                            else {
                                this.context.fillStyle = craftedItemColor;
                                ingredientIcon = this.tintedIcon(plainIngredientIcon, craftedItemColor);
                            }
                            // const requiredCount = ingr.count
                            // const countStr = `x${requiredCount}`
                            // offsetFromRight += (countStr.length * TEXT_PIXEL_WIDTH + margin)
                            // this.context.fillText(countStr, width - offsetFromRight, verticalTextOffset + verticalOffset)
                            offsetFromRight += Tilesets_16.TILE_SIZE + margin;
                            this.drawIconAt(ingredientIcon, width - offsetFromRight, verticalOffset);
                            if (utils_7.rectContains(
                            // I have no idea why this math works :(
                            new point_35.Point(width - offsetFromRight + margin, verticalOffset + margin * 1.5).plus(topLeft), new point_35.Point(Tilesets_16.TILE_SIZE, Tilesets_16.TILE_SIZE), updateData.input.mousePos)) {
                                var displayName = Items_4.ITEM_METADATA_MAP[ingr.item].displayName;
                                this.tooltip.say(displayName + " (" + Player_5.Player.instance.dude.inventory.getItemCount(ingr.item) + "/" + ingr.count + ")");
                            }
                        }
                        // draw line
                        verticalOffset += (margin + Tilesets_16.TILE_SIZE);
                        this.context.fillStyle = Color_5.Color.DARK_RED;
                        this.context.fillRect(margin, verticalOffset, this.innerDimensions.x - 2 * margin, 1);
                    }
                    var renderComp = new BasicRenderComponent_3.BasicRenderComponent(new ImageRender_2.ImageRender(this.canvas, point_35.Point.ZERO, this.innerDimensions, innerOffset.plus(topLeft).apply(Math.floor), this.innerDimensions, UIStateManager_8.UIStateManager.UI_SPRITE_DEPTH - 10));
                    return __spreadArrays(backgroundTiles, [renderComp]);
                };
                CraftingMenu.prototype.drawIconAt = function (icon, x, y) {
                    this.context.drawImage(icon.image, icon.position.x, icon.position.y, icon.dimensions.x, icon.dimensions.y, x, y, icon.dimensions.x, icon.dimensions.y);
                };
                CraftingMenu.prototype.getItemIcon = function (item) {
                    var cached = this.itemIcons.get(item);
                    if (!!cached) {
                        return cached;
                    }
                    var icon = Items_4.ITEM_METADATA_MAP[item].inventoryIconSupplier();
                    this.itemIcons.set(item, icon);
                    return icon;
                };
                CraftingMenu.prototype.tintedIcon = function (icon, tint) {
                    if (tint === Color_5.Color.WHITE) {
                        return icon;
                    }
                    var cache = this.tintedIcons.get(tint);
                    if (!cache) {
                        cache = new Map();
                        this.tintedIcons.set(tint, cache);
                    }
                    var cached = cache.get(icon);
                    if (!!cached) {
                        return cached;
                    }
                    var f = icon.filtered(ImageFilters_1.ImageFilters.tint(tint));
                    cache.set(icon, f);
                    return f;
                };
                CraftingMenu.prototype.getEntities = function () {
                    return [
                        this.e,
                        this.displayEntity,
                    ];
                };
                return CraftingMenu;
            }(component_15.Component));
            exports_69("CraftingMenu", CraftingMenu);
        }
    };
});
System.register("game/characters/dialogues/DipIntro", ["game/characters/Dialogue", "game/ui/DudeInteractIndicator", "game/Controls", "game/world/LocationManager", "game/world/events/EventQueue", "game/world/events/QueuedEvent", "game/world/WorldTime", "game/ui/CraftingMenu", "game/items/CraftingRecipe"], function (exports_70, context_70) {
    "use strict";
    var _a, Dialogue_1, DudeInteractIndicator_1, Controls_3, LocationManager_9, EventQueue_3, QueuedEvent_2, WorldTime_2, CraftingMenu_1, CraftingRecipe_1, ROCKS_NEEDED_FOR_CAMPFIRE, WOOD_NEEDED_FOR_CAMPFIRE, CRAFT_OPTION, DIP_INTRO_DIALOGUE;
    var __moduleName = context_70 && context_70.id;
    return {
        setters: [
            function (Dialogue_1_1) {
                Dialogue_1 = Dialogue_1_1;
            },
            function (DudeInteractIndicator_1_1) {
                DudeInteractIndicator_1 = DudeInteractIndicator_1_1;
            },
            function (Controls_3_1) {
                Controls_3 = Controls_3_1;
            },
            function (LocationManager_9_1) {
                LocationManager_9 = LocationManager_9_1;
            },
            function (EventQueue_3_1) {
                EventQueue_3 = EventQueue_3_1;
            },
            function (QueuedEvent_2_1) {
                QueuedEvent_2 = QueuedEvent_2_1;
            },
            function (WorldTime_2_1) {
                WorldTime_2 = WorldTime_2_1;
            },
            function (CraftingMenu_1_1) {
                CraftingMenu_1 = CraftingMenu_1_1;
            },
            function (CraftingRecipe_1_1) {
                CraftingRecipe_1 = CraftingRecipe_1_1;
            }
        ],
        execute: function () {
            exports_70("ROCKS_NEEDED_FOR_CAMPFIRE", ROCKS_NEEDED_FOR_CAMPFIRE = 10);
            exports_70("WOOD_NEEDED_FOR_CAMPFIRE", WOOD_NEEDED_FOR_CAMPFIRE = 5);
            CRAFT_OPTION = "<Craft>";
            // TODO: make DIP introduce himself, have player input their name
            exports_70("DIP_INTRO_DIALOGUE", DIP_INTRO_DIALOGUE = (_a = {},
                _a[1 /* DIP_0 */] = function () { return Dialogue_1.dialogueWithOptions(["Phew, thanks for your help! They almost had me. I thought for sure that those Orcs were gonna eat my butt."], DudeInteractIndicator_1.DudeInteractIndicator.IMPORTANT_DIALOGUE, Dialogue_1.option("Are you okay?", 2 /* DIP_1 */), Dialogue_1.option("I expect a reward.", 3 /* DIP_2 */), Dialogue_1.option("... Eat your butt?", 4 /* DIP_3 */)); },
                _a[2 /* DIP_1 */] = function () { return Dialogue_1.dialogue(["I'm alright, just shaken up. You sure know how to handle that blade!"], function () { return new Dialogue_1.NextDialogue(5 /* DIP_BEFRIEND */); }); },
                _a[3 /* DIP_2 */] = function () { return Dialogue_1.dialogue(["I'm grateful, but I don't have much..."], function () { return new Dialogue_1.NextDialogue(5 /* DIP_BEFRIEND */); }); },
                _a[4 /* DIP_3 */] = function () { return Dialogue_1.dialogue(["Swamp Lizard butt is an Orcish delicacy. My species has been hunted to extinction by those savages. I'm the only one left."], function () { return new Dialogue_1.NextDialogue(5 /* DIP_BEFRIEND */); }); },
                _a[5 /* DIP_BEFRIEND */] = function () { return Dialogue_1.dialogue([
                    "You know, this is a very dangerous place. It's tough to survive without someone watching your back.",
                    "How about I help you set up camp? I know these woods better than anyone.",
                    "I'll put together a tent for you, if you collect rocks and wood for a campfire.",
                ], function () { return new Dialogue_1.NextDialogue(6 /* DIP_MAKE_CAMPFIRE */, false); }); },
                _a[6 /* DIP_MAKE_CAMPFIRE */] = function () {
                    if (Dialogue_1.inv().getItemCount(4 /* CAMPFIRE */) > 0) { // campfire has been crafted
                        return Dialogue_1.dialogue(["Great! Try placing the campfire down near my tent. You can open your inventory by pressing [" + String.fromCharCode(Controls_3.Controls.inventoryButton) + "]."], function () { return new Dialogue_1.NextDialogue(7 /* DIP_CAMPFIRE_DONE */, false); });
                    }
                    else if (Dialogue_1.inv().getItemCount(1 /* ROCK */) >= ROCKS_NEEDED_FOR_CAMPFIRE && Dialogue_1.inv().getItemCount(2 /* WOOD */) >= WOOD_NEEDED_FOR_CAMPFIRE) { // can craft
                        return Dialogue_1.dialogueWithOptions(["It looks like you have enough rocks and wood. Should we put together a campfire?"], DudeInteractIndicator_1.DudeInteractIndicator.IMPORTANT_DIALOGUE, new Dialogue_1.DialogueOption(CRAFT_OPTION, function () {
                            CraftingMenu_1.CraftingMenu.instance.show(CraftingRecipe_1.getDipRecipes());
                            return new Dialogue_1.NextDialogue(6 /* DIP_MAKE_CAMPFIRE */, false);
                        }), Dialogue_1.option("Not yet.", 6 /* DIP_MAKE_CAMPFIRE */, false));
                    }
                    else { // do not have enough ingredients to craft
                        return Dialogue_1.dialogue(["We need " + ROCKS_NEEDED_FOR_CAMPFIRE + " rocks and " + WOOD_NEEDED_FOR_CAMPFIRE + " wood to make a campfire. Try hitting big rocks and trees with your sword!"], function () { return new Dialogue_1.NextDialogue(6 /* DIP_MAKE_CAMPFIRE */, false); });
                    }
                },
                _a[7 /* DIP_CAMPFIRE_DONE */] = function () {
                    var campfires = LocationManager_9.LocationManager.instance.currentLocation.elements.values().filter(function (e) { return e.type === 3 /* CAMPFIRE */; });
                    var dipTent = LocationManager_9.LocationManager.instance.currentLocation.elements.values().filter(function (e) { return e.type === 2 /* TENT */; })[0];
                    if (campfires.length > 0) {
                        var lines = [
                            dipTent.occupiedPoints[0].distanceTo(campfires[0].occupiedPoints[0]) < 5
                                ? "That should keep us warm tonight!"
                                : "Well, the fire is a bit far from my tent, but that's okay!",
                            "Here, I've finished putting together your tent. Find a nice spot and plop it down!"
                        ];
                        if (!campfires[0].save()["on"]) {
                            lines.push("By the way, you can light the fire by standing close to it and pressing [" + Controls_3.Controls.keyString(Controls_3.Controls.interactButton) + "].");
                        }
                        return Dialogue_1.dialogue(lines, function () {
                            Dialogue_1.inv().addItem(3 /* TENT */);
                            EventQueue_3.EventQueue.instance.addEvent({
                                type: QueuedEvent_2.QueuedEventType.TRADER_ARRIVAL,
                                time: WorldTime_2.WorldTime.instance.future({ minutes: 10 })
                            });
                            Dialogue_1.saveAfterDialogueStage();
                        }, DudeInteractIndicator_1.DudeInteractIndicator.IMPORTANT_DIALOGUE);
                    }
                    else {
                        return Dialogue_1.dialogue(["You should set up the campfire before it gets dark!"], function () { return new Dialogue_1.NextDialogue(7 /* DIP_CAMPFIRE_DONE */, false); });
                    }
                },
                _a));
        }
    };
});
System.register("game/characters/dialogues/BertoIntro", ["game/characters/Dialogue", "game/ui/DudeInteractIndicator"], function (exports_71, context_71) {
    "use strict";
    var _a, Dialogue_2, DudeInteractIndicator_2, BERTO_INTRO_DIALOGUE;
    var __moduleName = context_71 && context_71.id;
    return {
        setters: [
            function (Dialogue_2_1) {
                Dialogue_2 = Dialogue_2_1;
            },
            function (DudeInteractIndicator_2_1) {
                DudeInteractIndicator_2 = DudeInteractIndicator_2_1;
            }
        ],
        execute: function () {
            exports_71("BERTO_INTRO_DIALOGUE", BERTO_INTRO_DIALOGUE = (_a = {},
                _a[8 /* BERT_0 */] = function () { return Dialogue_2.dialogue(["Good morrow! I, Sir Berto of Dube, present myself unto thee as an emissary of The Honourable King Bob XVIII."], function () { return new Dialogue_2.NextDialogue(8 /* BERT_0 */, false); }, DudeInteractIndicator_2.DudeInteractIndicator.IMPORTANT_DIALOGUE); },
                _a));
        }
    };
});
System.register("game/characters/Dialogue", ["game/SaveManager", "game/ui/DudeInteractIndicator", "game/characters/dialogues/DipIntro", "game/characters/dialogues/BertoIntro", "game/characters/Player"], function (exports_72, context_72) {
    "use strict";
    var SaveManager_1, DudeInteractIndicator_3, DipIntro_2, BertoIntro_1, Player_6, DialogueInstance, dialogueWithOptions, dialogue, option, saveAfterDialogueStage, inv, DialogueOption, NextDialogue, getDialogue, DIALOGUE_SOURCES, DIALOGUE_MAP;
    var __moduleName = context_72 && context_72.id;
    return {
        setters: [
            function (SaveManager_1_1) {
                SaveManager_1 = SaveManager_1_1;
            },
            function (DudeInteractIndicator_3_1) {
                DudeInteractIndicator_3 = DudeInteractIndicator_3_1;
            },
            function (DipIntro_2_1) {
                DipIntro_2 = DipIntro_2_1;
            },
            function (BertoIntro_1_1) {
                BertoIntro_1 = BertoIntro_1_1;
            },
            function (Player_6_1) {
                Player_6 = Player_6_1;
            }
        ],
        execute: function () {
            DialogueInstance = /** @class */ (function () {
                /**
                 * @param lines Will be said one-by-one. TODO: Size restrictions based on UI
                 * @param next Callback called once these lines finish. If present, options will be ignored.
                 *             If the function returns a NextDialogue object, it will be presented next.
                 * @param options If any are provided, and next != null, will be prompted after the last line.
                 *                Clicking an option will execute the corresponding function.
                 *                If the function returns a Dialogue, that will then be prompted.
                 */
                function DialogueInstance(lines, next, options, indicator) {
                    if (indicator === void 0) { indicator = DudeInteractIndicator_3.DudeInteractIndicator.NONE; }
                    this.lines = lines;
                    this.next = next;
                    this.options = options;
                    this.indicator = indicator;
                }
                return DialogueInstance;
            }());
            exports_72("DialogueInstance", DialogueInstance);
            // Shorthand functions for creating dialogue
            exports_72("dialogueWithOptions", dialogueWithOptions = function (lines, indicator) {
                if (indicator === void 0) { indicator = DudeInteractIndicator_3.DudeInteractIndicator.NONE; }
                var options = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    options[_i - 2] = arguments[_i];
                }
                return new DialogueInstance(lines, function () { }, options, indicator);
            });
            exports_72("dialogue", dialogue = function (lines, next, indicator) {
                if (next === void 0) { next = function () { }; }
                if (indicator === void 0) { indicator = DudeInteractIndicator_3.DudeInteractIndicator.NONE; }
                return new DialogueInstance(lines, next, [], indicator);
            });
            exports_72("option", option = function (text, next, open) {
                if (open === void 0) { open = true; }
                return new DialogueOption(text, function () { return new NextDialogue(next, open); });
            });
            exports_72("saveAfterDialogueStage", saveAfterDialogueStage = function () {
                // save after a delay to account for the next dialogue stage being set
                setTimeout(function () { return SaveManager_1.SaveManager.instance.save(); }, 500);
            });
            exports_72("inv", inv = function () { return Player_6.Player.instance.dude.inventory; });
            DialogueOption = /** @class */ (function () {
                function DialogueOption(text, next) {
                    this.text = text;
                    this.next = next;
                }
                return DialogueOption;
            }());
            exports_72("DialogueOption", DialogueOption);
            NextDialogue = /** @class */ (function () {
                function NextDialogue(dialogue, open) {
                    if (open === void 0) { open = true; }
                    this.dialogue = dialogue;
                    this.open = open;
                }
                return NextDialogue;
            }());
            exports_72("NextDialogue", NextDialogue);
            exports_72("getDialogue", getDialogue = function (d) {
                var f = DIALOGUE_MAP[d];
                if (!f) {
                    throw new Error("cannot find dialogue " + d);
                }
                return f();
            });
            DIALOGUE_SOURCES = [
                DipIntro_2.DIP_INTRO_DIALOGUE,
                BertoIntro_1.BERTO_INTRO_DIALOGUE,
            ];
            /**
             * State should only be modified in the "next" functions. If state is changed
             * in the top-level Dialogue functions, it can be triggered repeatedly if the
             * dialogue is opened/closed or if the game is saved then loaded.
             */
            DIALOGUE_MAP = Object.assign.apply(Object, __spreadArrays([{}], DIALOGUE_SOURCES));
        }
    };
});
System.register("game/ui/DialogueDisplay", ["game/characters/Dialogue", "game/graphics/Tilesets", "engine/tiles/NineSlice", "engine/point", "engine/component", "engine/Entity", "engine/renderer/BasicRenderComponent", "game/ui/Text", "game/ui/Color", "game/Controls", "game/ui/UIStateManager", "game/ui/ButtonsMenu"], function (exports_73, context_73) {
    "use strict";
    var Dialogue_3, Tilesets_17, NineSlice_5, point_36, component_16, Entity_10, BasicRenderComponent_4, Text_7, Color_6, Controls_4, UIStateManager_9, ButtonsMenu_1, DialogueDisplay;
    var __moduleName = context_73 && context_73.id;
    return {
        setters: [
            function (Dialogue_3_1) {
                Dialogue_3 = Dialogue_3_1;
            },
            function (Tilesets_17_1) {
                Tilesets_17 = Tilesets_17_1;
            },
            function (NineSlice_5_1) {
                NineSlice_5 = NineSlice_5_1;
            },
            function (point_36_1) {
                point_36 = point_36_1;
            },
            function (component_16_1) {
                component_16 = component_16_1;
            },
            function (Entity_10_1) {
                Entity_10 = Entity_10_1;
            },
            function (BasicRenderComponent_4_1) {
                BasicRenderComponent_4 = BasicRenderComponent_4_1;
            },
            function (Text_7_1) {
                Text_7 = Text_7_1;
            },
            function (Color_6_1) {
                Color_6 = Color_6_1;
            },
            function (Controls_4_1) {
                Controls_4 = Controls_4_1;
            },
            function (UIStateManager_9_1) {
                UIStateManager_9 = UIStateManager_9_1;
            },
            function (ButtonsMenu_1_1) {
                ButtonsMenu_1 = ButtonsMenu_1_1;
            }
        ],
        execute: function () {
            DialogueDisplay = /** @class */ (function (_super) {
                __extends(DialogueDisplay, _super);
                function DialogueDisplay() {
                    var _this = _super.call(this) || this;
                    _this.e = new Entity_10.Entity([_this]);
                    DialogueDisplay.instance = _this;
                    return _this;
                }
                Object.defineProperty(DialogueDisplay.prototype, "isOpen", {
                    get: function () { return !!this.dialogue; },
                    enumerable: true,
                    configurable: true
                });
                DialogueDisplay.prototype.update = function (updateData) {
                    if (!this.dialogue) {
                        return;
                    }
                    if (updateData.input.isKeyDown(Controls_4.Controls.closeButton)) {
                        this.close();
                        return;
                    }
                    var showOptions = this.dialogue.options.length > 0 && this.lineIndex === this.dialogue.lines.length - 1;
                    if (this.letterTicker !== 0 && (updateData.input.isMouseDown || updateData.input.isKeyDown(Controls_4.Controls.interactButton))) {
                        if (this.finishedPrinting) {
                            // go to the next dialogue line
                            if (!showOptions) {
                                this.lineIndex++;
                                this.letterTicker = 0;
                                this.finishedPrinting = false;
                            }
                        }
                        else {
                            // fast-forward the letter printing
                            this.letterTicker += 3.6e+6; // hack to finish printing, presumably there won't be an hour of text
                        }
                    }
                    if (this.lineIndex === this.dialogue.lines.length) {
                        this.completeDudeDialogue(this.dialogue.next);
                        return;
                    }
                    this.letterTicker += updateData.elapsedTimeMillis;
                    // Overwrite previously displayed tiles each time
                    this.displayEntity = new Entity_10.Entity();
                    this.optionsEntity = null;
                    this.renderNextLine(updateData.dimensions);
                    if (showOptions && this.finishedPrinting) {
                        this.renderOptions(updateData.dimensions);
                    }
                };
                DialogueDisplay.prototype.getEntities = function () {
                    if (!this.displayEntity) {
                        return [this.e];
                    }
                    else {
                        return [this.e, this.displayEntity, this.optionsEntity];
                    }
                };
                DialogueDisplay.prototype.completeDudeDialogue = function (nextFn) {
                    var next = nextFn();
                    if (!next) {
                        this.dude.dialogue = 0 /* NONE */;
                        this.close();
                    }
                    else {
                        this.dude.dialogue = next.dialogue;
                        if (next.open) {
                            this.startDialogue(this.dude);
                        }
                        else {
                            this.close();
                        }
                    }
                };
                DialogueDisplay.prototype.close = function () {
                    this.dude = null;
                    this.dialogue = null;
                    this.displayEntity = null;
                };
                DialogueDisplay.prototype.startDialogue = function (dude) {
                    this.dude = dude;
                    this.dialogue = Dialogue_3.getDialogue(dude.dialogue);
                    this.lineIndex = 0;
                    this.letterTicker = 0;
                    this.finishedPrinting = false;
                };
                DialogueDisplay.prototype.renderNextLine = function (screenDimensions) {
                    var _this = this;
                    var dimensions = new point_36.Point(288, 83);
                    var bottomBuffer = Tilesets_17.TILE_SIZE;
                    var topLeft = new point_36.Point(Math.floor(screenDimensions.x / 2 - dimensions.x / 2), Math.floor(screenDimensions.y - dimensions.y - bottomBuffer));
                    var backgroundTiles = NineSlice_5.NineSlice.makeStretchedNineSliceComponents(Tilesets_17.Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"), topLeft, dimensions);
                    backgroundTiles[0].transform.depth = UIStateManager_9.UIStateManager.UI_SPRITE_DEPTH;
                    var topOffset = 2;
                    var margin = 12;
                    var width = dimensions.x - margin * 2;
                    var formattedRenders = Text_7.formatText(this.dialogue.lines[this.lineIndex], Color_6.Color.DARK_RED, topLeft.plus(new point_36.Point(margin, topOffset + margin)), width, 1 /* CENTER */);
                    formattedRenders.forEach(function (fr) { return fr.depth = UIStateManager_9.UIStateManager.UI_SPRITE_DEPTH + 1; });
                    // "type" out the letters
                    if (!this.finishedPrinting) {
                        var millisPerCharacter = 35;
                        var charactersToShow = Math.floor(this.letterTicker / millisPerCharacter);
                        for (var i = 0; i < formattedRenders.length; i++) {
                            var fr = formattedRenders[i];
                            var newStr = "";
                            for (var j = 0; j < fr.text.length; j++) {
                                if (charactersToShow === 0) {
                                    break;
                                }
                                newStr += fr.text.charAt(j);
                                if (fr.text.charAt(j) !== ' ') {
                                    charactersToShow--;
                                }
                                if (j === fr.text.length - 1 && i === formattedRenders.length - 1) {
                                    this.finishedPrinting = true;
                                }
                            }
                            fr.text = newStr;
                        }
                    }
                    backgroundTiles.forEach(function (tile) { return _this.displayEntity.addComponent(tile); });
                    this.displayEntity.addComponent(new (BasicRenderComponent_4.BasicRenderComponent.bind.apply(BasicRenderComponent_4.BasicRenderComponent, __spreadArrays([void 0], formattedRenders)))());
                };
                DialogueDisplay.prototype.renderOptions = function (screenDimensions) {
                    var _this = this;
                    this.optionsEntity = ButtonsMenu_1.ButtonsMenu.render(screenDimensions, "white", this.dialogue.options.map(function (o) {
                        return {
                            text: o.text,
                            fn: function () { return _this.completeDudeDialogue(o.next); },
                            buttonColor: 'white',
                            textColor: Color_6.Color.WHITE,
                            hoverColor: Color_6.Color.DARK_RED
                        };
                    }));
                };
                return DialogueDisplay;
            }(component_16.Component));
            exports_73("DialogueDisplay", DialogueDisplay);
        }
    };
});
System.register("game/cutscenes/CutsceneManager", ["engine/Entity", "game/SaveManager"], function (exports_74, context_74) {
    "use strict";
    var Entity_11, SaveManager_2, CutsceneManager;
    var __moduleName = context_74 && context_74.id;
    return {
        setters: [
            function (Entity_11_1) {
                Entity_11 = Entity_11_1;
            },
            function (SaveManager_2_1) {
                SaveManager_2 = SaveManager_2_1;
            }
        ],
        execute: function () {
            CutsceneManager = /** @class */ (function () {
                function CutsceneManager() {
                    this.entity = null;
                    CutsceneManager.instance = this;
                }
                Object.defineProperty(CutsceneManager.prototype, "isMidCutscene", {
                    get: function () { return !!this.entity; },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * TODO: Handle the case where a cutscene starts, overlapping (this might not matter if we are careful with how we use them)
                 * TODO: Handle saving during a cutscene. Most likely we should just block saving until after.
                 */
                CutsceneManager.prototype.startCutscene = function (cutsceneComponent) {
                    this.entity = new Entity_11.Entity([cutsceneComponent]);
                };
                CutsceneManager.prototype.finishCutscene = function () {
                    this.entity = null;
                    SaveManager_2.SaveManager.instance.save();
                };
                CutsceneManager.prototype.getEntity = function () {
                    return this.entity;
                };
                return CutsceneManager;
            }());
            exports_74("CutsceneManager", CutsceneManager);
        }
    };
});
System.register("game/ui/PauseMenu", ["engine/component", "engine/Entity", "game/ui/UIStateManager", "engine/point", "game/ui/ButtonsMenu", "game/ui/Color", "game/SaveManager", "game/cutscenes/CutsceneManager", "game/ui/ControlsUI", "engine/renderer/BasicRenderComponent"], function (exports_75, context_75) {
    "use strict";
    var component_17, Entity_12, UIStateManager_10, point_37, ButtonsMenu_2, Color_7, SaveManager_3, CutsceneManager_1, ControlsUI_1, BasicRenderComponent_5, PauseMenu;
    var __moduleName = context_75 && context_75.id;
    return {
        setters: [
            function (component_17_1) {
                component_17 = component_17_1;
            },
            function (Entity_12_1) {
                Entity_12 = Entity_12_1;
            },
            function (UIStateManager_10_1) {
                UIStateManager_10 = UIStateManager_10_1;
            },
            function (point_37_1) {
                point_37 = point_37_1;
            },
            function (ButtonsMenu_2_1) {
                ButtonsMenu_2 = ButtonsMenu_2_1;
            },
            function (Color_7_1) {
                Color_7 = Color_7_1;
            },
            function (SaveManager_3_1) {
                SaveManager_3 = SaveManager_3_1;
            },
            function (CutsceneManager_1_1) {
                CutsceneManager_1 = CutsceneManager_1_1;
            },
            function (ControlsUI_1_1) {
                ControlsUI_1 = ControlsUI_1_1;
            },
            function (BasicRenderComponent_5_1) {
                BasicRenderComponent_5 = BasicRenderComponent_5_1;
            }
        ],
        execute: function () {
            PauseMenu = /** @class */ (function (_super) {
                __extends(PauseMenu, _super);
                function PauseMenu() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.e = new Entity_12.Entity([_this]); // entity for this component
                    _this.isOpen = false;
                    return _this;
                }
                PauseMenu.prototype.update = function (updateData) {
                    var pressEsc = updateData.input.isKeyDown(27 /* ESC */);
                    if (pressEsc && this.isOpen) {
                        this.close();
                    }
                    else if (pressEsc && !UIStateManager_10.UIStateManager.instance.isMenuOpen && !CutsceneManager_1.CutsceneManager.instance.isMidCutscene) {
                        this.show(updateData.dimensions);
                    }
                };
                PauseMenu.prototype.close = function () {
                    this.isOpen = false;
                    this.displayEntity = null;
                    this.controlsDisplay = null;
                };
                PauseMenu.prototype.show = function (dimensions) {
                    this.isOpen = true;
                    var buttonColor = "red";
                    var textColor = Color_7.Color.PINK;
                    var hoverColor = Color_7.Color.WHITE;
                    this.displayEntity = ButtonsMenu_2.ButtonsMenu.render(dimensions, "red", [{
                            text: "Save game".toUpperCase(),
                            fn: function () { return SaveManager_3.SaveManager.instance.save(); },
                            buttonColor: buttonColor, textColor: textColor, hoverColor: hoverColor,
                        },
                        {
                            text: "Load last save".toUpperCase(),
                            fn: function () { return SaveManager_3.SaveManager.instance.load(); },
                            buttonColor: buttonColor, textColor: textColor, hoverColor: hoverColor,
                        }]);
                    this.controlsDisplay = new Entity_12.Entity([new (BasicRenderComponent_5.BasicRenderComponent.bind.apply(BasicRenderComponent_5.BasicRenderComponent, __spreadArrays([void 0], ControlsUI_1.makeControlsUI(dimensions, point_37.Point.ZERO))))()]);
                };
                PauseMenu.prototype.getEntities = function () {
                    return [
                        this.e,
                        this.displayEntity,
                        this.controlsDisplay
                    ];
                };
                return PauseMenu;
            }(component_17.Component));
            exports_75("PauseMenu", PauseMenu);
        }
    };
});
System.register("game/ui/UIStateManager", ["game/ui/HUD", "game/characters/Player", "game/ui/InventoryDisplay", "game/ui/DialogueDisplay", "game/ui/PlaceElementDisplay", "game/ui/PauseMenu", "game/ui/CraftingMenu"], function (exports_76, context_76) {
    "use strict";
    var HUD_2, Player_7, InventoryDisplay_1, DialogueDisplay_1, PlaceElementDisplay_3, PauseMenu_1, CraftingMenu_2, UIStateManager;
    var __moduleName = context_76 && context_76.id;
    return {
        setters: [
            function (HUD_2_1) {
                HUD_2 = HUD_2_1;
            },
            function (Player_7_1) {
                Player_7 = Player_7_1;
            },
            function (InventoryDisplay_1_1) {
                InventoryDisplay_1 = InventoryDisplay_1_1;
            },
            function (DialogueDisplay_1_1) {
                DialogueDisplay_1 = DialogueDisplay_1_1;
            },
            function (PlaceElementDisplay_3_1) {
                PlaceElementDisplay_3 = PlaceElementDisplay_3_1;
            },
            function (PauseMenu_1_1) {
                PauseMenu_1 = PauseMenu_1_1;
            },
            function (CraftingMenu_2_1) {
                CraftingMenu_2 = CraftingMenu_2_1;
            }
        ],
        execute: function () {
            UIStateManager = /** @class */ (function () {
                function UIStateManager() {
                    this.hud = new HUD_2.HUD();
                    this.inventory = new InventoryDisplay_1.InventoryDisplay();
                    this.dialogueDisplay = new DialogueDisplay_1.DialogueDisplay();
                    this.placeElementDisplay = new PlaceElementDisplay_3.PlaceElementDisplay();
                    this.pauseMenu = new PauseMenu_1.PauseMenu();
                    this.craftingMenu = new CraftingMenu_2.CraftingMenu();
                    // if this is true, input observed by other components (like the player) 
                    // should be skipped because a menu is open. Other menus should only open
                    // if this is false
                    this.captureInput = false;
                    UIStateManager.instance = this;
                }
                Object.defineProperty(UIStateManager.prototype, "isMenuOpen", {
                    get: function () { return this.captureInput; },
                    enumerable: true,
                    configurable: true
                });
                UIStateManager.prototype.get = function (dimensions, elapsedMillis) {
                    if (!Player_7.Player.instance.dude) {
                        return [];
                    }
                    this.captureInput = this.inventory.isOpen
                        || this.dialogueDisplay.isOpen
                        || this.placeElementDisplay.isOpen
                        || this.pauseMenu.isOpen
                        || this.craftingMenu.isOpen;
                    return this.hud.getEntities(Player_7.Player.instance.dude, dimensions, elapsedMillis)
                        .concat(this.inventory.getEntities())
                        .concat(this.dialogueDisplay.getEntities())
                        .concat(this.placeElementDisplay.getEntities())
                        .concat(this.pauseMenu.getEntities())
                        .concat(this.craftingMenu.getEntities());
                };
                UIStateManager.UI_SPRITE_DEPTH = Number.MAX_SAFE_INTEGER / 2;
                return UIStateManager;
            }());
            exports_76("UIStateManager", UIStateManager);
        }
    };
});
System.register("game/ui/KeyPressIndicator", ["engine/component", "game/graphics/Tilesets", "engine/tiles/TileTransform", "engine/point", "engine/renderer/TextRender", "game/Controls", "game/ui/Text", "game/ui/UIStateManager", "game/ui/Color"], function (exports_77, context_77) {
    "use strict";
    var component_18, Tilesets_18, TileTransform_15, point_38, TextRender_6, Controls_5, Text_8, UIStateManager_11, Color_8, KeyPressIndicator;
    var __moduleName = context_77 && context_77.id;
    return {
        setters: [
            function (component_18_1) {
                component_18 = component_18_1;
            },
            function (Tilesets_18_1) {
                Tilesets_18 = Tilesets_18_1;
            },
            function (TileTransform_15_1) {
                TileTransform_15 = TileTransform_15_1;
            },
            function (point_38_1) {
                point_38 = point_38_1;
            },
            function (TextRender_6_1) {
                TextRender_6 = TextRender_6_1;
            },
            function (Controls_5_1) {
                Controls_5 = Controls_5_1;
            },
            function (Text_8_1) {
                Text_8 = Text_8_1;
            },
            function (UIStateManager_11_1) {
                UIStateManager_11 = UIStateManager_11_1;
            },
            function (Color_8_1) {
                Color_8 = Color_8_1;
            }
        ],
        execute: function () {
            KeyPressIndicator = /** @class */ (function (_super) {
                __extends(KeyPressIndicator, _super);
                function KeyPressIndicator(pos, key) {
                    var _this = _super.call(this) || this;
                    _this.pos = pos;
                    _this.key = key;
                    return _this;
                }
                KeyPressIndicator.prototype.getRenderMethods = function () {
                    return [
                        Tilesets_18.Tilesets.instance.oneBit.getTileSource("keycap").toImageRender(new TileTransform_15.TileTransform(this.pos, null, 0, false, false, UIStateManager_11.UIStateManager.UI_SPRITE_DEPTH)),
                        new TextRender_6.TextRender(Controls_5.Controls.keyString(this.key).toLowerCase(), this.pos.plus(new point_38.Point(4, 4)), Text_8.TEXT_SIZE, Text_8.TEXT_FONT, Color_8.Color.BLACK, UIStateManager_11.UIStateManager.UI_SPRITE_DEPTH)
                    ];
                };
                return KeyPressIndicator;
            }(component_18.Component));
            exports_77("KeyPressIndicator", KeyPressIndicator);
        }
    };
});
System.register("game/world/elements/Interactable", ["engine/component", "engine/point", "game/ui/KeyPressIndicator", "game/Controls", "game/graphics/Tilesets"], function (exports_78, context_78) {
    "use strict";
    var component_19, point_39, KeyPressIndicator_2, Controls_6, Tilesets_19, Interactable;
    var __moduleName = context_78 && context_78.id;
    return {
        setters: [
            function (component_19_1) {
                component_19 = component_19_1;
            },
            function (point_39_1) {
                point_39 = point_39_1;
            },
            function (KeyPressIndicator_2_1) {
                KeyPressIndicator_2 = KeyPressIndicator_2_1;
            },
            function (Controls_6_1) {
                Controls_6 = Controls_6_1;
            },
            function (Tilesets_19_1) {
                Tilesets_19 = Tilesets_19_1;
            }
        ],
        execute: function () {
            Interactable = /** @class */ (function (_super) {
                __extends(Interactable, _super);
                function Interactable(position, fn, uiOffset) {
                    if (uiOffset === void 0) { uiOffset = point_39.Point.ZERO; }
                    var _this = _super.call(this) || this;
                    _this.position = position;
                    _this.interact = fn;
                    _this.uiOffset = uiOffset;
                    return _this;
                }
                Object.defineProperty(Interactable.prototype, "isShowingUI", {
                    get: function () { return this.canInteract; },
                    enumerable: true,
                    configurable: true
                });
                Interactable.prototype.updateIndicator = function (canInteract) {
                    this.canInteract = canInteract;
                };
                Interactable.prototype.interact = function () { };
                Interactable.prototype.getRenderMethods = function () {
                    if (!this.canInteract) {
                        return [];
                    }
                    return new KeyPressIndicator_2.KeyPressIndicator(this.position.minus(new point_39.Point(Tilesets_19.TILE_SIZE / 2, Tilesets_19.TILE_SIZE / 2)).plus(this.uiOffset), Controls_6.Controls.interactButton).getRenderMethods();
                };
                return Interactable;
            }(component_19.Component));
            exports_78("Interactable", Interactable);
        }
    };
});
System.register("game/world/elements/ElementUtils", ["engine/point"], function (exports_79, context_79) {
    "use strict";
    var point_40, ElementUtils;
    var __moduleName = context_79 && context_79.id;
    return {
        setters: [
            function (point_40_1) {
                point_40 = point_40_1;
            }
        ],
        execute: function () {
            exports_79("ElementUtils", ElementUtils = {
                rectPoints: function (position, dimensions) {
                    var result = [];
                    for (var x = 0; x < dimensions.x; x++) {
                        for (var y = 0; y < dimensions.y; y++) {
                            result.push(position.plus(new point_40.Point(x, y)));
                        }
                    }
                    return result;
                }
            });
        }
    };
});
System.register("game/world/Teleporter", ["game/world/elements/Interactable", "engine/point", "game/world/elements/ElementComponent", "engine/Entity", "game/graphics/Tilesets", "engine/tiles/TileTransform", "engine/component"], function (exports_80, context_80) {
    "use strict";
    var Interactable_1, point_41, ElementComponent_4, Entity_13, Tilesets_20, TileTransform_16, component_20, Teleporters, makeTeleporterElement;
    var __moduleName = context_80 && context_80.id;
    return {
        setters: [
            function (Interactable_1_1) {
                Interactable_1 = Interactable_1_1;
            },
            function (point_41_1) {
                point_41 = point_41_1;
            },
            function (ElementComponent_4_1) {
                ElementComponent_4 = ElementComponent_4_1;
            },
            function (Entity_13_1) {
                Entity_13 = Entity_13_1;
            },
            function (Tilesets_20_1) {
                Tilesets_20 = Tilesets_20_1;
            },
            function (TileTransform_16_1) {
                TileTransform_16 = TileTransform_16_1;
            },
            function (component_20_1) {
                component_20 = component_20_1;
            }
        ],
        execute: function () {
            exports_80("Teleporters", Teleporters = {
                teleporterId: function (toUUID, id) {
                    if (id === void 0) { id = null; }
                    return "" + toUUID + (!!id ? "$" + id : '');
                },
            });
            exports_80("makeTeleporterElement", makeTeleporterElement = function (wl, pos, data) {
                var e = new Entity_13.Entity();
                var destinationUUID = data["to"];
                var i = data["i"]; // the position for the interactable
                if (!destinationUUID || !i) {
                    throw new Error("teleporter element must have 'to' and 'i' parameters");
                }
                var interactPos = point_41.Point.fromString(i);
                var id = data["id"];
                var interactComponent = e.addComponent(new Interactable_1.Interactable(interactPos, function () { return wl.useTeleporter(destinationUUID, id); }, new point_41.Point(0, Tilesets_20.TILE_SIZE / 2)));
                // TODO have the arrow pointable in different directions
                e.addComponent(new /** @class */ (function (_super) {
                    __extends(class_1, _super);
                    function class_1() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    class_1.prototype.getRenderMethods = function () {
                        if (interactComponent.isShowingUI) {
                            return [];
                        }
                        return [Tilesets_20.Tilesets.instance.oneBit.getTileSource("small_arrow_down").toImageRender(new TileTransform_16.TileTransform(pos.times(Tilesets_20.TILE_SIZE)))];
                    };
                    return class_1;
                }(component_20.Component)));
                return e.addComponent(new ElementComponent_4.ElementComponent(4 /* TELEPORTER */, [pos], function () { return data; }));
            });
        }
    };
});
System.register("game/world/interior/AsciiInteriorBuilder", ["engine/point"], function (exports_81, context_81) {
    "use strict";
    var point_42, AsciiInteriorBuilder;
    var __moduleName = context_81 && context_81.id;
    return {
        setters: [
            function (point_42_1) {
                point_42 = point_42_1;
            }
        ],
        execute: function () {
            AsciiInteriorBuilder = /** @class */ (function () {
                function AsciiInteriorBuilder() {
                    var ascii = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        ascii[_i] = arguments[_i];
                    }
                    this.ascii = ascii;
                }
                AsciiInteriorBuilder.prototype.map = function (char, fn) {
                    if (char.length !== 1) {
                        throw new Error("\"" + char + "\" should be of length 1");
                    }
                    for (var row = 0; row < this.ascii.length; row++) {
                        for (var col = 0; col < this.ascii[row].length; col++) {
                            if (this.ascii[row][col] == char) {
                                fn(new point_42.Point(col, row));
                            }
                        }
                    }
                    return this;
                };
                return AsciiInteriorBuilder;
            }());
            exports_81("AsciiInteriorBuilder", AsciiInteriorBuilder);
        }
    };
});
System.register("game/world/interior/Tent", ["game/world/LocationManager", "engine/point", "game/graphics/Tilesets", "engine/tiles/NineSlice", "game/world/interior/AsciiInteriorBuilder"], function (exports_82, context_82) {
    "use strict";
    var LocationManager_10, point_43, Tilesets_21, NineSlice_6, AsciiInteriorBuilder_1, makeTentInterior;
    var __moduleName = context_82 && context_82.id;
    return {
        setters: [
            function (LocationManager_10_1) {
                LocationManager_10 = LocationManager_10_1;
            },
            function (point_43_1) {
                point_43 = point_43_1;
            },
            function (Tilesets_21_1) {
                Tilesets_21 = Tilesets_21_1;
            },
            function (NineSlice_6_1) {
                NineSlice_6 = NineSlice_6_1;
            },
            function (AsciiInteriorBuilder_1_1) {
                AsciiInteriorBuilder_1 = AsciiInteriorBuilder_1_1;
            }
        ],
        execute: function () {
            exports_82("makeTentInterior", makeTentInterior = function (outside, color) {
                var l = LocationManager_10.LocationManager.instance.newLocation(true);
                var interactablePos = new point_43.Point(2.5, 4).times(Tilesets_21.TILE_SIZE);
                var teleporter = { to: outside.uuid, pos: interactablePos.plusY(-4) };
                l.addTeleporter(teleporter);
                l.addWorldElement(4 /* TELEPORTER */, new point_43.Point(2, 4), { to: outside.uuid, i: interactablePos.toString() });
                var groundType = color + "tentInterior";
                NineSlice_6.NineSlice.nineSliceForEach(new point_43.Point(5, 4), function (pt, index) { return l.addGroundElement(1 /* BASIC_NINE_SLICE */, pt, { k: groundType, i: index }); });
                new AsciiInteriorBuilder_1.AsciiInteriorBuilder("  ^  ", " /xl ", "/xxxl").map("/", function (pt) { l.addGroundElement(0 /* BASIC */, pt.plusY(-3), { k: color + "tentl" }); })
                    .map("^", function (pt) { l.addGroundElement(0 /* BASIC */, pt.plusY(-3), { k: color + "tenttip" }); })
                    .map("l", function (pt) { l.addGroundElement(0 /* BASIC */, pt.plusY(-3), { k: color + "tentr" }); })
                    .map("x", function (pt) { l.addGroundElement(0 /* BASIC */, pt.plusY(-3), { k: color + "tentCenter" }); });
                return l;
            });
        }
    };
});
System.register("game/world/elements/Tent", ["engine/point", "game/graphics/Tilesets", "engine/collision/BoxCollider", "engine/tiles/TileComponent", "engine/tiles/TileTransform", "engine/Entity", "game/world/elements/Interactable", "game/world/elements/ElementComponent", "game/world/elements/ElementUtils", "game/world/interior/Tent"], function (exports_83, context_83) {
    "use strict";
    var point_44, Tilesets_22, BoxCollider_5, TileComponent_7, TileTransform_17, Entity_14, Interactable_2, ElementComponent_5, ElementUtils_1, Tent_1, makeTent, addTile;
    var __moduleName = context_83 && context_83.id;
    return {
        setters: [
            function (point_44_1) {
                point_44 = point_44_1;
            },
            function (Tilesets_22_1) {
                Tilesets_22 = Tilesets_22_1;
            },
            function (BoxCollider_5_1) {
                BoxCollider_5 = BoxCollider_5_1;
            },
            function (TileComponent_7_1) {
                TileComponent_7 = TileComponent_7_1;
            },
            function (TileTransform_17_1) {
                TileTransform_17 = TileTransform_17_1;
            },
            function (Entity_14_1) {
                Entity_14 = Entity_14_1;
            },
            function (Interactable_2_1) {
                Interactable_2 = Interactable_2_1;
            },
            function (ElementComponent_5_1) {
                ElementComponent_5 = ElementComponent_5_1;
            },
            function (ElementUtils_1_1) {
                ElementUtils_1 = ElementUtils_1_1;
            },
            function (Tent_1_1) {
                Tent_1 = Tent_1_1;
            }
        ],
        execute: function () {
            exports_83("makeTent", makeTent = function (wl, pos, data) {
                var _a, _b;
                var e = new Entity_14.Entity();
                var color = (_a = data["color"]) !== null && _a !== void 0 ? _a : "blue" /* BLUE */;
                var destinationUUID = (_b = data["destinationUUID"]) !== null && _b !== void 0 ? _b : Tent_1.makeTentInterior(wl, color).uuid;
                var interactablePos = pos.plus(new point_44.Point(2, 2)).times(Tilesets_22.TILE_SIZE);
                var sourceTeleporter = { to: destinationUUID, pos: interactablePos.plusY(12) };
                wl.addTeleporter(sourceTeleporter);
                // Set up tiles
                var depth = (pos.y + 1) * Tilesets_22.TILE_SIZE + /* prevent clipping */ 1;
                addTile(wl, e, color + "tentNW", pos.plusX(1), depth);
                addTile(wl, e, color + "tentNE", pos.plus(new point_44.Point(2, 0)), depth);
                addTile(wl, e, color + "tentSW", pos.plus(new point_44.Point(1, 1)), depth);
                addTile(wl, e, color + "tentSE", pos.plus(new point_44.Point(2, 1)), depth);
                e.addComponent(new BoxCollider_5.BoxCollider(pos.plus(new point_44.Point(1, 1)).times(Tilesets_22.TILE_SIZE), new point_44.Point(Tilesets_22.TILE_SIZE * 2, Tilesets_22.TILE_SIZE)));
                // Set up teleporter
                e.addComponent(new Interactable_2.Interactable(interactablePos, function () { return wl.useTeleporter(destinationUUID); }, new point_44.Point(1, -Tilesets_22.TILE_SIZE * 1.4)));
                return e.addComponent(new ElementComponent_5.ElementComponent(2 /* TENT */, ElementUtils_1.ElementUtils.rectPoints(pos, new point_44.Point(4, 3)), function () { return { destinationUUID: destinationUUID, color: color }; }));
            });
            addTile = function (wl, e, s, pos, depth) {
                var tile = e.addComponent(new TileComponent_7.TileComponent(Tilesets_22.Tilesets.instance.outdoorTiles.getTileSource(s), new TileTransform_17.TileTransform(pos.times(Tilesets_22.TILE_SIZE))));
                tile.transform.depth = depth;
            };
        }
    };
});
System.register("game/world/PointLightMaskRenderer", ["engine/point", "engine/renderer/ImageRender", "engine/Entity", "engine/renderer/BasicRenderComponent", "game/cutscenes/Camera", "game/world/MapGenerator", "game/graphics/Tilesets", "engine/util/Grid", "game/ui/UIStateManager", "game/world/WorldTime", "game/ui/Color", "game/world/LocationManager"], function (exports_84, context_84) {
    "use strict";
    var point_45, ImageRender_3, Entity_15, BasicRenderComponent_6, Camera_4, MapGenerator_3, Tilesets_23, Grid_1, UIStateManager_12, WorldTime_3, Color_9, LocationManager_11, PointLightMaskRenderer;
    var __moduleName = context_84 && context_84.id;
    return {
        setters: [
            function (point_45_1) {
                point_45 = point_45_1;
            },
            function (ImageRender_3_1) {
                ImageRender_3 = ImageRender_3_1;
            },
            function (Entity_15_1) {
                Entity_15 = Entity_15_1;
            },
            function (BasicRenderComponent_6_1) {
                BasicRenderComponent_6 = BasicRenderComponent_6_1;
            },
            function (Camera_4_1) {
                Camera_4 = Camera_4_1;
            },
            function (MapGenerator_3_1) {
                MapGenerator_3 = MapGenerator_3_1;
            },
            function (Tilesets_23_1) {
                Tilesets_23 = Tilesets_23_1;
            },
            function (Grid_1_1) {
                Grid_1 = Grid_1_1;
            },
            function (UIStateManager_12_1) {
                UIStateManager_12 = UIStateManager_12_1;
            },
            function (WorldTime_3_1) {
                WorldTime_3 = WorldTime_3_1;
            },
            function (Color_9_1) {
                Color_9 = Color_9_1;
            },
            function (LocationManager_11_1) {
                LocationManager_11 = LocationManager_11_1;
            }
        ],
        execute: function () {
            PointLightMaskRenderer = /** @class */ (function () {
                function PointLightMaskRenderer() {
                    var _this = this;
                    // no lights should live outside of this range
                    this.size = MapGenerator_3.MapGenerator.MAP_SIZE * Tilesets_23.TILE_SIZE; // * 2
                    this.shift = new point_45.Point(this.size / 2, this.size / 2);
                    this.lightTiles = new Map();
                    this.gridDirty = true;
                    this.darkness = 0.4;
                    this.circleCache = new Map();
                    PointLightMaskRenderer.instance = this;
                    this.canvas = document.createElement("canvas");
                    this.canvas.width = this.size;
                    this.canvas.height = this.size;
                    this.context = this.canvas.getContext("2d");
                    // refresh every so often to update transitioning color
                    setInterval(function () { return _this.gridDirty = true; }, WorldTime_3.WorldTime.MINUTE / 10);
                }
                PointLightMaskRenderer.prototype.addLight = function (wl, position, diameter) {
                    if (diameter === void 0) { diameter = 16; }
                    var _a;
                    if (diameter % 2 !== 0) {
                        throw new Error("only even circle px diameters work right now");
                    }
                    this.checkPt(position);
                    var locationLightGrid = (_a = this.lightTiles.get(wl)) !== null && _a !== void 0 ? _a : new Grid_1.Grid();
                    locationLightGrid.set(position, diameter);
                    this.lightTiles.set(wl, locationLightGrid);
                    this.gridDirty = true;
                };
                PointLightMaskRenderer.prototype.removeLight = function (wl, position) {
                    this.checkPt(position);
                    var locationLightGrid = this.lightTiles.get(wl);
                    if (!locationLightGrid) {
                        return; // it is ok to fail silently here
                    }
                    locationLightGrid.remove(position);
                    this.gridDirty = true;
                };
                PointLightMaskRenderer.prototype.updateColorForTime = function () {
                    var time = WorldTime_3.WorldTime.instance.time;
                    var hour = (time % WorldTime_3.WorldTime.DAY) / WorldTime_3.WorldTime.HOUR;
                    var timeSoFar = time % WorldTime_3.WorldTime.HOUR;
                    var clamp01 = function (val) { return Math.min(Math.max(val, 0), 1); };
                    var nightColor = this.colorFromString(Color_9.Color.BLACK, 0.8);
                    var sunriseColor = this.colorFromString(Color_9.Color.PINK, 0.2);
                    var dayColor = this.colorFromString(Color_9.Color.LIGHT_PINK, 0);
                    var sunsetColor = this.colorFromString(Color_9.Color.DARK_PURPLE, 0.2);
                    var transitionTime = WorldTime_3.WorldTime.HOUR;
                    // TODO: make these transitions quicker
                    if (hour >= 5 && hour < 6) {
                        var percentTransitioned = clamp01((timeSoFar + (hour - 5) * WorldTime_3.WorldTime.HOUR) / transitionTime);
                        return this.lerpedColorString(nightColor, sunriseColor, percentTransitioned); // sunrise		
                    }
                    else if (hour >= 6 && hour < 20) {
                        var percentTransitioned = clamp01((timeSoFar + (hour - 6) * WorldTime_3.WorldTime.HOUR) / transitionTime);
                        return this.lerpedColorString(sunriseColor, dayColor, percentTransitioned); // day	
                    }
                    else if (hour >= 20 && hour < 21) {
                        var percentTransitioned = clamp01((timeSoFar + (hour - 20) * WorldTime_3.WorldTime.HOUR) / transitionTime);
                        return this.lerpedColorString(dayColor, sunsetColor, percentTransitioned); // sunset
                    }
                    else {
                        var percentTransitioned = clamp01((timeSoFar + (24 + hour - 21) % 24 * WorldTime_3.WorldTime.HOUR) / transitionTime);
                        return this.lerpedColorString(sunsetColor, nightColor, percentTransitioned); // night			
                    }
                };
                /**
                 * @param colorString A string from the Color object
                 * @param a alpha double 0-1
                 */
                PointLightMaskRenderer.prototype.colorFromString = function (colorString, a) {
                    var noHash = colorString.replace("#", "");
                    var r = parseInt(noHash.substring(0, 2), 16);
                    var g = parseInt(noHash.substring(2, 4), 16);
                    var b = parseInt(noHash.substring(4, 6), 16);
                    return { r: r, g: g, b: b, a: a };
                };
                PointLightMaskRenderer.prototype.lerpedColorString = function (color1, color2, percentTransitioned) {
                    var lerp = function (a, b) { return a + (b - a) * percentTransitioned; };
                    var r = lerp(color1.r, color2.r);
                    var g = lerp(color1.g, color2.g);
                    var b = lerp(color1.b, color2.b);
                    var a = lerp(color1.a, color2.a);
                    this.color = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
                    this.darkness = a;
                };
                PointLightMaskRenderer.prototype.checkPt = function (position) {
                    var lim = this.size / 2;
                    if (position.x < -lim || position.x > lim || position.y < -lim || position.y > lim) {
                        throw new Error("light is outside of valid bounds");
                    }
                };
                PointLightMaskRenderer.prototype.renderToOffscreenCanvas = function () {
                    var _this = this;
                    this.updateColorForTime();
                    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    var location = LocationManager_11.LocationManager.instance.currentLocation;
                    if (location.isInterior || this.darkness === 0) {
                        return;
                    }
                    this.context.fillStyle = this.color;
                    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    var locationLightGrid = this.lightTiles.get(location);
                    if (!locationLightGrid) {
                        return;
                    }
                    locationLightGrid.entries().forEach(function (entry) {
                        var pos = entry[0];
                        var diameter = entry[1];
                        var circleOffset = new point_45.Point(-.5, -.5).times(diameter);
                        var adjustedPos = pos.plus(_this.shift).plus(circleOffset); //.plus(new Point(TILE_SIZE/2, TILE_SIZE/2))
                        _this.makeLightCircle(diameter, adjustedPos, _this.darkness / 2);
                        var innerOffset = Math.floor(diameter / 2 * 1 / 4);
                        _this.makeLightCircle(diameter - innerOffset * 2, adjustedPos.plus(new point_45.Point(innerOffset, innerOffset)), 0);
                    });
                };
                PointLightMaskRenderer.prototype.makeLightCircle = function (diameter, position, alpha) {
                    var center = new point_45.Point(diameter / 2, diameter / 2).minus(new point_45.Point(.5, .5));
                    var imageData = this.context.getImageData(position.x, position.y, diameter, diameter);
                    var cachedCircle = this.circleCache.get(diameter);
                    if (!cachedCircle) {
                        cachedCircle = [];
                        for (var x = 0; x < diameter; x++) {
                            for (var y = 0; y < diameter; y++) {
                                var i = (x + y * diameter) * 4;
                                var pt = new point_45.Point(x, y);
                                cachedCircle[i] = pt.distanceTo(center) < diameter / 2;
                            }
                        }
                        this.circleCache.set(diameter, cachedCircle);
                    }
                    for (var i = 0; i < cachedCircle.length; i += 4) {
                        if (cachedCircle[i]) {
                            imageData.data[i + 3] = Math.min(imageData.data[i + 3], Math.ceil(255 * alpha));
                        }
                    }
                    this.context.putImageData(imageData, position.x, position.y);
                };
                PointLightMaskRenderer.prototype.getEntity = function () {
                    if (this.gridDirty || this.lastLocationRendered !== LocationManager_11.LocationManager.instance.currentLocation) {
                        this.renderToOffscreenCanvas();
                        this.gridDirty = false;
                        this.lastLocationRendered = LocationManager_11.LocationManager.instance.currentLocation;
                    }
                    // prevent tint not extending to the edge
                    var dimensions = Camera_4.Camera.instance.dimensions.plus(new point_45.Point(1, 1));
                    return new Entity_15.Entity([new BasicRenderComponent_6.BasicRenderComponent(new ImageRender_3.ImageRender(this.canvas, Camera_4.Camera.instance.position.plus(this.shift).apply(Math.floor), dimensions, Camera_4.Camera.instance.position.apply(Math.floor), dimensions, UIStateManager_12.UIStateManager.UI_SPRITE_DEPTH - 100 // make sure all UI goes on top of light
                        ))]);
                };
                return PointLightMaskRenderer;
            }());
            exports_84("PointLightMaskRenderer", PointLightMaskRenderer);
        }
    };
});
System.register("game/world/elements/Campfire", ["engine/tiles/TileComponent", "engine/tiles/AnimatedTileComponent", "game/graphics/Tilesets", "engine/tiles/TileTransform", "engine/point", "game/world/elements/Interactable", "engine/collision/BoxCollider", "game/world/elements/ElementComponent", "engine/Entity", "game/world/PointLightMaskRenderer"], function (exports_85, context_85) {
    "use strict";
    var TileComponent_8, AnimatedTileComponent_3, Tilesets_24, TileTransform_18, point_46, Interactable_3, BoxCollider_6, ElementComponent_6, Entity_16, PointLightMaskRenderer_1, makeCampfire;
    var __moduleName = context_85 && context_85.id;
    return {
        setters: [
            function (TileComponent_8_1) {
                TileComponent_8 = TileComponent_8_1;
            },
            function (AnimatedTileComponent_3_1) {
                AnimatedTileComponent_3 = AnimatedTileComponent_3_1;
            },
            function (Tilesets_24_1) {
                Tilesets_24 = Tilesets_24_1;
            },
            function (TileTransform_18_1) {
                TileTransform_18 = TileTransform_18_1;
            },
            function (point_46_1) {
                point_46 = point_46_1;
            },
            function (Interactable_3_1) {
                Interactable_3 = Interactable_3_1;
            },
            function (BoxCollider_6_1) {
                BoxCollider_6 = BoxCollider_6_1;
            },
            function (ElementComponent_6_1) {
                ElementComponent_6 = ElementComponent_6_1;
            },
            function (Entity_16_1) {
                Entity_16 = Entity_16_1;
            },
            function (PointLightMaskRenderer_1_1) {
                PointLightMaskRenderer_1 = PointLightMaskRenderer_1_1;
            }
        ],
        execute: function () {
            exports_85("makeCampfire", makeCampfire = function (wl, pos, data) {
                var _a;
                var e = new Entity_16.Entity();
                var scaledPos = pos.times(Tilesets_24.TILE_SIZE);
                var on = (_a = data["on"]) !== null && _a !== void 0 ? _a : false;
                var campfireOff = e.addComponent(new TileComponent_8.TileComponent(Tilesets_24.Tilesets.instance.outdoorTiles.getTileSource("campfireOff"), new TileTransform_18.TileTransform(scaledPos)));
                campfireOff.enabled = !on;
                campfireOff.transform.depth = scaledPos.y + Tilesets_24.TILE_SIZE;
                var campfireOn = e.addComponent(new AnimatedTileComponent_3.AnimatedTileComponent([Tilesets_24.Tilesets.instance.outdoorTiles.getTileSetAnimation("campfireOn", 2, 200)], new TileTransform_18.TileTransform(scaledPos)));
                campfireOn.enabled = on;
                campfireOn.transform.depth = scaledPos.y + Tilesets_24.TILE_SIZE;
                var offset = new point_46.Point(0, 5);
                e.addComponent(new BoxCollider_6.BoxCollider(scaledPos.plus(offset), new point_46.Point(Tilesets_24.TILE_SIZE, Tilesets_24.TILE_SIZE).minus(offset)));
                var set = function (nowOn) {
                    on = nowOn;
                    campfireOff.enabled = !nowOn;
                    campfireOn.enabled = nowOn;
                    var lightCenterPos = pos.times(Tilesets_24.TILE_SIZE).plus(new point_46.Point(Tilesets_24.TILE_SIZE / 2, Tilesets_24.TILE_SIZE / 2));
                    if (nowOn) {
                        PointLightMaskRenderer_1.PointLightMaskRenderer.instance.addLight(wl, lightCenterPos, Tilesets_24.TILE_SIZE * 8);
                    }
                    else {
                        PointLightMaskRenderer_1.PointLightMaskRenderer.instance.removeLight(wl, lightCenterPos);
                    }
                };
                set(on);
                // Toggle between on/off when interacted with
                e.addComponent(new Interactable_3.Interactable(scaledPos.plus(new point_46.Point(Tilesets_24.TILE_SIZE / 2, Tilesets_24.TILE_SIZE / 2)), function () { return set(!on); }, new point_46.Point(1, -Tilesets_24.TILE_SIZE)));
                return e.addComponent(new ElementComponent_6.ElementComponent(3 /* CAMPFIRE */, [pos], function () { return { on: on }; }));
            });
        }
    };
});
System.register("game/world/elements/Elements", ["game/world/elements/Tree", "game/world/elements/Rock", "engine/point", "game/world/elements/Tent", "game/world/elements/Campfire", "game/world/Teleporter"], function (exports_86, context_86) {
    "use strict";
    var Tree_1, Rock_1, point_47, Tent_2, Campfire_1, Teleporter_1, SavedElement, Elements;
    var __moduleName = context_86 && context_86.id;
    return {
        setters: [
            function (Tree_1_1) {
                Tree_1 = Tree_1_1;
            },
            function (Rock_1_1) {
                Rock_1 = Rock_1_1;
            },
            function (point_47_1) {
                point_47 = point_47_1;
            },
            function (Tent_2_1) {
                Tent_2 = Tent_2_1;
            },
            function (Campfire_1_1) {
                Campfire_1 = Campfire_1_1;
            },
            function (Teleporter_1_1) {
                Teleporter_1 = Teleporter_1_1;
            }
        ],
        execute: function () {
            SavedElement = /** @class */ (function () {
                function SavedElement() {
                }
                return SavedElement;
            }());
            exports_86("SavedElement", SavedElement);
            Elements = /** @class */ (function () {
                function Elements() {
                    var _a;
                    /**
                    * Each of these functions should return an ElementComponent with a nonnull entity
                    * The functions should NOT explicitly add the entity to the given locations, the location should be read-only.
                    * Instead, they should add the occupied points to the occupiedPoints array of the ElementComponent
                    * @param pos the top-left corner of the element
                    * @param args the element's metadata
                    */
                    this.ELEMENT_FUNCTION_MAP = (_a = {},
                        _a[0 /* TREE */] = [Tree_1.makeTree, new point_47.Point(1, 2)],
                        _a[1 /* ROCK */] = [Rock_1.makeRock, new point_47.Point(1, 1)],
                        _a[2 /* TENT */] = [Tent_2.makeTent, new point_47.Point(4, 3)],
                        _a[3 /* CAMPFIRE */] = [Campfire_1.makeCampfire, new point_47.Point(1, 1)],
                        _a[4 /* TELEPORTER */] = [Teleporter_1.makeTeleporterElement, new point_47.Point(1, 1)],
                        _a);
                    Elements.instance = this;
                }
                Elements.prototype.make = function (type, wl, pos, data) {
                    var el = this.ELEMENT_FUNCTION_MAP[type][0](wl, pos, data);
                    if (el.type !== type) {
                        throw new Error("constructed element type doesn't match requested type");
                    }
                    return el;
                };
                Elements.prototype.dimensionsForPlacing = function (type) {
                    return this.ELEMENT_FUNCTION_MAP[type][1];
                };
                return Elements;
            }());
            exports_86("Elements", Elements);
        }
    };
});
System.register("game/items/Items", ["game/graphics/Tilesets", "engine/Entity", "game/world/LocationManager", "game/items/DroppedItem", "engine/point"], function (exports_87, context_87) {
    "use strict";
    var _a, Tilesets_25, Entity_17, LocationManager_12, DroppedItem_1, point_48, ItemMetadata, ITEM_METADATA_MAP, spawnItem;
    var __moduleName = context_87 && context_87.id;
    return {
        setters: [
            function (Tilesets_25_1) {
                Tilesets_25 = Tilesets_25_1;
            },
            function (Entity_17_1) {
                Entity_17 = Entity_17_1;
            },
            function (LocationManager_12_1) {
                LocationManager_12 = LocationManager_12_1;
            },
            function (DroppedItem_1_1) {
                DroppedItem_1 = DroppedItem_1_1;
            },
            function (point_48_1) {
                point_48 = point_48_1;
            }
        ],
        execute: function () {
            ItemMetadata = /** @class */ (function () {
                // TODO maybe make this a builder
                function ItemMetadata(displayName, droppedIconSupplier, inventoryIconSupplier, stackLimit, element) {
                    if (stackLimit === void 0) { stackLimit = Number.MAX_SAFE_INTEGER; }
                    if (element === void 0) { element = null; }
                    this.displayName = displayName;
                    this.droppedIconSupplier = droppedIconSupplier;
                    this.inventoryIconSupplier = inventoryIconSupplier;
                    this.stackLimit = stackLimit;
                    this.element = element;
                }
                return ItemMetadata;
            }());
            exports_87("ItemMetadata", ItemMetadata);
            // Data that doesn't get serialized (TODO make builder pattern)
            exports_87("ITEM_METADATA_MAP", ITEM_METADATA_MAP = (_a = {},
                _a[0 /* COIN */] = new ItemMetadata("Coin", function () { return Tilesets_25.Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150); }, function () { return Tilesets_25.Tilesets.instance.oneBit.getTileSource("coin"); }),
                _a[1 /* ROCK */] = new ItemMetadata("Rock", function () { return Tilesets_25.Tilesets.instance.outdoorTiles.getTileSource("rockItem"); }, function () { return Tilesets_25.Tilesets.instance.oneBit.getTileSource("rock"); }, 100),
                _a[2 /* WOOD */] = new ItemMetadata("Wood", function () { return Tilesets_25.Tilesets.instance.outdoorTiles.getTileSource("woodItem"); }, function () { return Tilesets_25.Tilesets.instance.oneBit.getTileSource("wood"); }, 100),
                _a[3 /* TENT */] = new ItemMetadata("Tent", function () { return null; }, function () { return Tilesets_25.Tilesets.instance.oneBit.getTileSource("tent"); }, 1, 2 /* TENT */),
                _a[4 /* CAMPFIRE */] = new ItemMetadata("Campfire", function () { return null; }, function () { return Tilesets_25.Tilesets.instance.oneBit.getTileSource("campfire"); }, 1, 3 /* CAMPFIRE */),
                _a));
            /**
             * @param position The bottom center where the item should be placed
             *
             * TODO: Add initial velocity
             */
            exports_87("spawnItem", spawnItem = function (pos, item, velocity, sourceCollider) {
                if (velocity === void 0) { velocity = new point_48.Point(0, 0); }
                if (sourceCollider === void 0) { sourceCollider = null; }
                LocationManager_12.LocationManager.instance.currentLocation.droppedItems.add(new Entity_17.Entity([
                    new DroppedItem_1.DroppedItem(pos, item, velocity, sourceCollider)
                ]));
            });
        }
    };
});
System.register("game/items/Inventory", ["game/items/Items"], function (exports_88, context_88) {
    "use strict";
    var Items_5, ItemStack, Inventory;
    var __moduleName = context_88 && context_88.id;
    return {
        setters: [
            function (Items_5_1) {
                Items_5 = Items_5_1;
            }
        ],
        execute: function () {
            ItemStack = /** @class */ (function () {
                function ItemStack(item, count) {
                    this.item = item;
                    this.count = count;
                }
                return ItemStack;
            }());
            exports_88("ItemStack", ItemStack);
            // TODO flesh this out more when we have more items
            Inventory = /** @class */ (function () {
                function Inventory() {
                    this._inventory = Array.from({ length: 20 });
                    this.countMap = new Map();
                }
                Object.defineProperty(Inventory.prototype, "inventory", {
                    get: function () { return this._inventory; },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * returns true if the item can fit in the inventory
                 */
                Inventory.prototype.addItem = function (item) {
                    var _a, _b;
                    var firstEmptySlot = -1;
                    for (var i = 0; i < this.inventory.length; i++) {
                        var slotValue = this.inventory[i];
                        if (!!slotValue) {
                            if (slotValue.item === item && slotValue.count < Items_5.ITEM_METADATA_MAP[item].stackLimit) {
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
                Inventory.prototype.canAddItem = function (item) {
                    var firstEmptySlot = -1;
                    for (var i = 0; i < this.inventory.length; i++) {
                        var slotValue = this.inventory[i];
                        if (!!slotValue) {
                            if (slotValue.item === item && slotValue.count < Items_5.ITEM_METADATA_MAP[item].stackLimit) {
                                return true;
                            }
                        }
                        else if (firstEmptySlot === -1) {
                            firstEmptySlot = i;
                        }
                    }
                    if (firstEmptySlot !== -1) {
                        return true;
                    }
                    return false;
                };
                Inventory.prototype.removeItem = function (item, count) {
                    if (count === void 0) { count = 1; }
                    var currentCount = this.getItemCount(item);
                    if (currentCount < count) {
                        throw new Error("inventory cannot go negative");
                    }
                    this.countMap.set(item, currentCount - count);
                    for (var i = 0; i < this.inventory.length; i++) {
                        var slotValue = this.inventory[i];
                        if ((slotValue === null || slotValue === void 0 ? void 0 : slotValue.item) === item) {
                            while (slotValue.count > 0 && count > 0) {
                                count--;
                                slotValue.count--;
                            }
                            if (slotValue.count === 0) {
                                this.inventory[i] = null;
                            }
                            if (count === 0) {
                                return;
                            }
                        }
                    }
                };
                /**
                 * Returns the total amount of an item in the inventory
                 */
                Inventory.prototype.getItemCount = function (item) {
                    var _a;
                    return (_a = this.countMap.get(item)) !== null && _a !== void 0 ? _a : 0;
                };
                Inventory.prototype.save = function () {
                    return this.inventory;
                };
                Inventory.load = function (stacks) {
                    var inv = new Inventory();
                    inv._inventory = stacks;
                    stacks.forEach(function (stack) {
                        var _a;
                        if (!!stack) {
                            inv.countMap.set(stack.item, stack.count + ((_a = inv.countMap.get(stack.item)) !== null && _a !== void 0 ? _a : 0));
                        }
                    });
                    return inv;
                };
                return Inventory;
            }());
            exports_88("Inventory", Inventory);
        }
    };
});
System.register("game/characters/Shield", ["engine/component", "engine/tiles/TileComponent", "game/graphics/Tilesets", "engine/tiles/TileTransform", "engine/point", "game/characters/Dude"], function (exports_89, context_89) {
    "use strict";
    var component_21, TileComponent_9, Tilesets_26, TileTransform_19, point_49, Dude_2, State, Shield;
    var __moduleName = context_89 && context_89.id;
    return {
        setters: [
            function (component_21_1) {
                component_21 = component_21_1;
            },
            function (TileComponent_9_1) {
                TileComponent_9 = TileComponent_9_1;
            },
            function (Tilesets_26_1) {
                Tilesets_26 = Tilesets_26_1;
            },
            function (TileTransform_19_1) {
                TileTransform_19 = TileTransform_19_1;
            },
            function (point_49_1) {
                point_49 = point_49_1;
            },
            function (Dude_2_1) {
                Dude_2 = Dude_2_1;
            }
        ],
        execute: function () {
            (function (State) {
                State[State["ON_BACK"] = 0] = "ON_BACK";
                State[State["DRAWN"] = 1] = "DRAWN";
            })(State || (State = {}));
            /**
             * A weapon being wielded by a dude
             */
            Shield = /** @class */ (function (_super) {
                __extends(Shield, _super);
                function Shield(shieldId) {
                    var _this = _super.call(this) || this;
                    _this.state = State.DRAWN;
                    _this.blockingActive = false;
                    _this.raisedPerc = 0; // for animation
                    _this.timeToRaiseMs = 75;
                    _this.currentAnimationFrame = 0;
                    _this.start = function (startData) {
                        _this.dude = _this.entity.getComponent(Dude_2.Dude);
                        _this.blockingShieldSprite = _this.entity.addComponent(new TileComponent_9.TileComponent(Tilesets_26.Tilesets.instance.dungeonCharacters.getTileSource(shieldId), new TileTransform_19.TileTransform().relativeTo(_this.dude.animation.transform)));
                    };
                    return _this;
                }
                Shield.prototype.update = function (updateData) {
                    // default (drawn) position
                    var pos = this.dude.animation.transform.dimensions.minus(new point_49.Point(12, 16));
                    if (this.state === State.ON_BACK) {
                        pos = pos.plus(new point_49.Point(-6, -1));
                    }
                    else if (this.state === State.DRAWN) {
                        pos = pos.plus(new point_49.Point(3, 2).times(this.raisedPerc).apply(Math.floor));
                        if (this.blockingActive) { // raising
                            this.raisedPerc = Math.min(this.raisedPerc + updateData.elapsedTimeMillis / this.timeToRaiseMs, 1);
                        }
                        else { // lowering
                            this.raisedPerc = Math.max(this.raisedPerc - updateData.elapsedTimeMillis / this.timeToRaiseMs, 0);
                        }
                    }
                    pos = pos.plus(this.dude.getAnimationOffsetPosition());
                    this.blockingShieldSprite.transform.position = pos;
                    this.blockingShieldSprite.transform.depth = this.raisedPerc === 1 ? .75 : -.75;
                };
                Shield.prototype.toggleOnBack = function () {
                    if (this.state === State.DRAWN) {
                        this.state = State.ON_BACK;
                    }
                    else {
                        this.state = State.DRAWN;
                    }
                };
                Shield.prototype.block = function (blockingActive) {
                    var _a;
                    if (this.state === State.ON_BACK || !this.dude) {
                        return;
                    }
                    if (blockingActive && ((_a = this.dude.weapon) === null || _a === void 0 ? void 0 : _a.isAttacking())) { // you can't start blocking when you're attacking
                        return;
                    }
                    this.blockingActive = blockingActive;
                };
                Shield.prototype.isBlocking = function () {
                    return this.state === State.DRAWN && this.raisedPerc > .5;
                };
                Shield.prototype.canAttack = function () {
                    return this.state === State.DRAWN && this.raisedPerc < .3;
                };
                return Shield;
            }(component_21.Component));
            exports_89("Shield", Shield);
        }
    };
});
System.register("game/characters/AnimationUtils", ["game/graphics/Tilesets"], function (exports_90, context_90) {
    "use strict";
    var Tilesets_27, AnimationUtils;
    var __moduleName = context_90 && context_90.id;
    return {
        setters: [
            function (Tilesets_27_1) {
                Tilesets_27 = Tilesets_27_1;
            }
        ],
        execute: function () {
            exports_90("AnimationUtils", AnimationUtils = {
                getCharacterIdleAnimation: function (characterAnimName) {
                    var animSpeed = 150;
                    var idleAnim = Tilesets_27.Tilesets.instance.dungeonCharacters.getTileSetAnimation(characterAnimName + "_idle_anim", animSpeed);
                    if (!idleAnim) {
                        idleAnim = Tilesets_27.Tilesets.instance.otherCharacters.getTileSetAnimation(characterAnimName + "_Idle", 4, animSpeed);
                    }
                    return idleAnim;
                },
                getCharacterWalkAnimation: function (characterAnimName) {
                    var animSpeed = 80;
                    var idleAnim = Tilesets_27.Tilesets.instance.dungeonCharacters.getTileSetAnimation(characterAnimName + "_run_anim", animSpeed);
                    if (!idleAnim) {
                        idleAnim = Tilesets_27.Tilesets.instance.otherCharacters.getTileSetAnimation(characterAnimName + "_Walk", 4, animSpeed);
                    }
                    return idleAnim;
                },
            });
        }
    };
});
System.register("game/characters/Dude", ["engine/tiles/AnimatedTileComponent", "engine/point", "engine/component", "engine/collision/BoxCollider", "game/graphics/Tilesets", "game/characters/Weapon", "game/items/Items", "game/characters/Shield", "engine/tiles/TileTransform", "game/world/elements/Interactable", "game/characters/Dialogue", "game/ui/DialogueDisplay", "game/ui/DudeInteractIndicator", "game/ui/UIStateManager", "game/characters/AnimationUtils"], function (exports_91, context_91) {
    "use strict";
    var AnimatedTileComponent_4, point_50, component_22, BoxCollider_7, Tilesets_28, Weapon_1, Items_6, Shield_1, TileTransform_20, Interactable_4, Dialogue_4, DialogueDisplay_2, DudeInteractIndicator_4, UIStateManager_13, AnimationUtils_1, Dude;
    var __moduleName = context_91 && context_91.id;
    return {
        setters: [
            function (AnimatedTileComponent_4_1) {
                AnimatedTileComponent_4 = AnimatedTileComponent_4_1;
            },
            function (point_50_1) {
                point_50 = point_50_1;
            },
            function (component_22_1) {
                component_22 = component_22_1;
            },
            function (BoxCollider_7_1) {
                BoxCollider_7 = BoxCollider_7_1;
            },
            function (Tilesets_28_1) {
                Tilesets_28 = Tilesets_28_1;
            },
            function (Weapon_1_1) {
                Weapon_1 = Weapon_1_1;
            },
            function (Items_6_1) {
                Items_6 = Items_6_1;
            },
            function (Shield_1_1) {
                Shield_1 = Shield_1_1;
            },
            function (TileTransform_20_1) {
                TileTransform_20 = TileTransform_20_1;
            },
            function (Interactable_4_1) {
                Interactable_4 = Interactable_4_1;
            },
            function (Dialogue_4_1) {
                Dialogue_4 = Dialogue_4_1;
            },
            function (DialogueDisplay_2_1) {
                DialogueDisplay_2 = DialogueDisplay_2_1;
            },
            function (DudeInteractIndicator_4_1) {
                DudeInteractIndicator_4 = DudeInteractIndicator_4_1;
            },
            function (UIStateManager_13_1) {
                UIStateManager_13 = UIStateManager_13_1;
            },
            function (AnimationUtils_1_1) {
                AnimationUtils_1 = AnimationUtils_1_1;
            }
        ],
        execute: function () {
            Dude = /** @class */ (function (_super) {
                __extends(Dude, _super);
                function Dude(type, faction, characterAnimName, position, weaponId, shieldId, maxHealth, health, speed, inventory, dialogue, blob) {
                    var _this = _super.call(this) || this;
                    _this.relativeColliderPos = new point_50.Point(3, 15);
                    _this.beingKnockedBack = false;
                    _this.type = type;
                    _this.faction = faction;
                    _this._position = position;
                    _this.weaponId = weaponId;
                    _this.shieldId = shieldId;
                    _this.maxHealth = maxHealth;
                    _this._health = health;
                    _this.speed = speed;
                    _this.inventory = inventory;
                    _this.dialogue = dialogue;
                    _this.blob = blob;
                    _this.awake = function () {
                        // Set up animations
                        var idleAnim = AnimationUtils_1.AnimationUtils.getCharacterIdleAnimation(characterAnimName);
                        var runAnim = AnimationUtils_1.AnimationUtils.getCharacterWalkAnimation(characterAnimName);
                        var height = idleAnim.getTile(0).dimensions.y;
                        _this._animation = _this.entity.addComponent(new AnimatedTileComponent_4.AnimatedTileComponent([idleAnim, runAnim], new TileTransform_20.TileTransform(new point_50.Point(0, 28 - height))));
                        _this._animation.fastForward(Math.random() * 1000); // so not all the animations sync up
                        if (!!weaponId) {
                            _this._weapon = _this.entity.addComponent(new Weapon_1.Weapon(weaponId));
                        }
                        if (!!shieldId) {
                            _this._shield = _this.entity.addComponent(new Shield_1.Shield(shieldId));
                        }
                        // Set up collider
                        var colliderSize = new point_50.Point(10, 8);
                        _this.relativeColliderPos = new point_50.Point(_this.animation.transform.dimensions.x / 2 - colliderSize.x / 2, _this.animation.transform.dimensions.y - colliderSize.y);
                        _this.collider = _this.entity.addComponent(new BoxCollider_7.BoxCollider(_this.position.plus(_this.relativeColliderPos), colliderSize, Dude.COLLISION_LAYER));
                        _this.dialogueInteract = _this.entity.addComponent(new Interactable_4.Interactable(new point_50.Point(0, 0), function () {
                            if (!!_this.dialogue) {
                                DialogueDisplay_2.DialogueDisplay.instance.startDialogue(_this);
                            }
                        }));
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
                    get: function () { return this._weapon; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Dude.prototype, "shield", {
                    get: function () { return this._shield; },
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
                        return this.position.plus(new point_50.Point(this.animation.transform.dimensions.x / 2, this.animation.transform.dimensions.y));
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
                    this.animation.transform.position = this.position.plus(this.isAlive ? new point_50.Point(0, 0) : this.deathOffset);
                    this.animation.transform.depth = this.collider.position.y + this.collider.dimensions.y;
                    this.dialogueInteract.position = this.standingPosition.minus(new point_50.Point(0, 5));
                    this.dialogueInteract.uiOffset = new point_50.Point(0, -Tilesets_28.TILE_SIZE * 1.5).plus(this.getAnimationOffsetPosition());
                    this.dialogueInteract.enabled = this.dialogue !== 0 /* NONE */ && DialogueDisplay_2.DialogueDisplay.instance.dude !== this;
                };
                Object.defineProperty(Dude.prototype, "isAlive", {
                    get: function () { return this._health > 0; },
                    enumerable: true,
                    configurable: true
                });
                Dude.prototype.damage = function (damage, direction, knockback) {
                    // TODO: disable friendly fire
                    var _a;
                    // absorb damage if facing the direction of the enemy
                    if (((_a = this.shield) === null || _a === void 0 ? void 0 : _a.isBlocking()) && !this.isFacing(this.standingPosition.plus(direction))) {
                        damage *= .25;
                        knockback *= .3;
                    }
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
                    if (direction === void 0) { direction = new point_50.Point(-1, 0); }
                    this._health = 0;
                    var prePos = this.animation.transform.position;
                    this.animation.transform.rotate(90 * (direction.x >= 0 ? 1 : -1), this.standingPosition.minus(new point_50.Point(0, 5)));
                    this.deathOffset = this.animation.transform.position.minus(prePos);
                    this.animation.play(0);
                    this.animation.paused = true;
                    setTimeout(function () { return _this.spawnDrop(); }, 100);
                    this.dropWeapon();
                };
                Dude.prototype.spawnDrop = function () {
                    // TODO add velocity
                    Items_6.spawnItem(this.standingPosition.minus(new point_50.Point(0, 2)), 0 /* COIN */);
                };
                Dude.prototype.dropWeapon = function () {
                    // TODO
                };
                Dude.prototype.knockback = function (direction, knockback) {
                    var _this = this;
                    if (this.beingKnockedBack) {
                        return;
                    }
                    this.beingKnockedBack = true;
                    var goal = this.position.plus(direction.normalized().times(knockback));
                    var distToStop = 2;
                    var intervalsRemaining = 50;
                    var last = new Date().getTime();
                    var knock = function () {
                        var now = new Date().getTime();
                        var diff = now - last;
                        if (diff > 0) {
                            _this.moveTo(_this.position.lerp(.15 * diff / 30, goal));
                        }
                        intervalsRemaining--;
                        if (intervalsRemaining === 0 || goal.minus(_this.position).magnitude() < distToStop) {
                            _this.beingKnockedBack = false;
                        }
                        else {
                            requestAnimationFrame(knock);
                        }
                        last = now;
                    };
                    requestAnimationFrame(knock);
                };
                Dude.prototype.heal = function (amount) {
                    if (this.isAlive) {
                        this._health = Math.min(this.maxHealth, this.health + amount);
                    }
                };
                /**
                 * Should be called on EVERY update step for
                 * @param updateData
                 * @param direction the direction they are moving in, will be normalized by this code
                 * @param facingOverride if < 0, will face left, if > 0, will face right. if == 0, will face the direction they're moving
                 */
                Dude.prototype.move = function (updateData, direction, facingOverride, maxDistance) {
                    if (facingOverride === void 0) { facingOverride = 0; }
                    if (maxDistance === void 0) { maxDistance = Number.MAX_SAFE_INTEGER; }
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
                        var distance = Math.min(updateData.elapsedTimeMillis * this.speed, maxDistance);
                        var newPos = this._position.plus(translation.times(distance));
                        this.moveTo(newPos);
                    }
                    else if (wasMoving) {
                        this.animation.play(0);
                    }
                };
                /**
                 * @param point World point where the dude will be moved, unless they hit a collider
                 */
                Dude.prototype.moveTo = function (point) {
                    this._position = this.collider.moveTo(point.plus(this.relativeColliderPos)).minus(this.relativeColliderPos);
                };
                Dude.prototype.isFacing = function (pt) {
                    if (pt.x === this.standingPosition.x) {
                        return true;
                    }
                    return this.animation.transform.mirrorX === (pt.x < this.standingPosition.x);
                };
                Dude.prototype.getAnimationOffsetPosition = function () {
                    // magic based on the animations
                    var f = this.animation.currentFrame();
                    var arr;
                    if (!this.isMoving) {
                        arr = [0, 1, 2, 1];
                    }
                    else {
                        arr = [-1, -2, -1, 0];
                    }
                    return new point_50.Point(0, arr[f]);
                };
                Dude.prototype.save = function () {
                    return {
                        type: this.type,
                        pos: this.position.toString(),
                        maxHealth: this.maxHealth,
                        health: this._health,
                        speed: this.speed,
                        weapon: this.weaponId,
                        shield: this.shieldId,
                        inventory: this.inventory.save(),
                        dialogue: this.dialogue,
                        blob: this.blob,
                    };
                };
                Dude.prototype.getRenderMethods = function () {
                    return this.getIndicator();
                };
                Dude.prototype.getIndicator = function () {
                    var indicator = DudeInteractIndicator_4.DudeInteractIndicator.NONE;
                    if (this.dialogue) {
                        indicator = Dialogue_4.getDialogue(this.dialogue).indicator;
                    }
                    var tile = DudeInteractIndicator_4.DudeInteractIndicator.getTile(indicator);
                    if (!tile || this.dialogueInteract.isShowingUI || DialogueDisplay_2.DialogueDisplay.instance.dude === this) {
                        return [];
                    }
                    else {
                        return [tile.toImageRender(new TileTransform_20.TileTransform(this.standingPosition.plusY(-28).plus(new point_50.Point(1, 1).times(-Tilesets_28.TILE_SIZE / 2)).plus(this.getAnimationOffsetPosition()), new point_50.Point(Tilesets_28.TILE_SIZE, Tilesets_28.TILE_SIZE), 0, false, false, UIStateManager_13.UIStateManager.UI_SPRITE_DEPTH))];
                    }
                };
                Dude.COLLISION_LAYER = "dube";
                return Dude;
            }(component_22.Component));
            exports_91("Dude", Dude);
        }
    };
});
System.register("game/characters/Player", ["engine/point", "engine/component", "game/characters/Dude", "game/world/elements/Interactable", "game/world/elements/Hittable", "game/ui/UIStateManager", "game/Controls", "engine/util/Lists"], function (exports_92, context_92) {
    "use strict";
    var point_51, component_23, Dude_3, Interactable_5, Hittable_2, UIStateManager_14, Controls_7, Lists_2, Player;
    var __moduleName = context_92 && context_92.id;
    return {
        setters: [
            function (point_51_1) {
                point_51 = point_51_1;
            },
            function (component_23_1) {
                component_23 = component_23_1;
            },
            function (Dude_3_1) {
                Dude_3 = Dude_3_1;
            },
            function (Interactable_5_1) {
                Interactable_5 = Interactable_5_1;
            },
            function (Hittable_2_1) {
                Hittable_2 = Hittable_2_1;
            },
            function (UIStateManager_14_1) {
                UIStateManager_14 = UIStateManager_14_1;
            },
            function (Controls_7_1) {
                Controls_7 = Controls_7_1;
            },
            function (Lists_2_1) {
                Lists_2 = Lists_2_1;
            }
        ],
        execute: function () {
            Player = /** @class */ (function (_super) {
                __extends(Player, _super);
                function Player() {
                    var _this = _super.call(this) || this;
                    _this.lerpedLastMoveDir = new point_51.Point(1, 0); // used for crosshair
                    Player.instance = _this;
                    window["player"] = _this;
                    return _this;
                }
                Object.defineProperty(Player.prototype, "dude", {
                    get: function () { return this._dude; },
                    enumerable: true,
                    configurable: true
                });
                Player.prototype.start = function (startData) {
                    this._dude = this.entity.getComponent(Dude_3.Dude);
                };
                Player.prototype.update = function (updateData) {
                    if (!this.dude.isAlive) {
                        return;
                    }
                    this.dude.heal(updateData.elapsedTimeMillis / 6500);
                    var possibleInteractable = this.updateInteractables(updateData);
                    // const originalCrosshairPosRelative = this.crosshairs.transform.position.minus(this.position)
                    var dx = 0;
                    var dy = 0;
                    if (!UIStateManager_14.UIStateManager.instance.isMenuOpen) {
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
                    }
                    // TODO: - make this an unlockable feature
                    //       - instead of removing by position, map the light to a source object and remove based on that
                    // const lightPosOffset = -TILE_SIZE/2
                    // PointLightMaskRenderer.instance.removeLight(LocationManager.instance.currentLocation, this.dude.standingPosition.plusY(lightPosOffset))
                    this.dude.move(updateData, new point_51.Point(dx, dy), updateData.input.mousePos.x - this.dude.standingPosition.x);
                    // PointLightMaskRenderer.instance.addLight(LocationManager.instance.currentLocation, this.dude.standingPosition.plusY(lightPosOffset), 100)
                    if (UIStateManager_14.UIStateManager.instance.isMenuOpen) {
                        return;
                    }
                    if (updateData.input.isKeyDown(70 /* F */)) {
                        this.dude.weapon.toggleSheathed();
                        this.dude.shield.toggleOnBack();
                    }
                    if (!!this.dude.shield) {
                        this.dude.shield.block(updateData.input.isRightMouseHeld);
                    }
                    if (updateData.input.isMouseDown) {
                        this.dude.weapon.attack();
                        this.hitResource(updateData); // TODO: restrict the speed at which you can do this (probably easiest once we introduce tools)
                    }
                    if (updateData.input.isKeyDown(Controls_7.Controls.interactButton) && !!possibleInteractable) {
                        possibleInteractable.interact();
                    }
                    // FOR TESTING
                    if (updateData.input.isKeyDown(80 /* P */)) {
                        // this.dude.damage(.25, new Point(Math.random()-.5, Math.random()-.5), 30)
                        this.dude.damage(.25, new point_51.Point(-1, Math.random() - .5), 30);
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
                Player.prototype.updateInteractables = function (updateData) {
                    var _this = this;
                    var interactDistance = 20;
                    var interactCenter = this.dude.standingPosition.minus(new point_51.Point(0, 7));
                    var interactables = updateData.view.entities
                        .map(function (e) { return e.getComponent(Interactable_5.Interactable); })
                        .filter(function (e) { return e === null || e === void 0 ? void 0 : e.enabled; });
                    interactables.forEach(function (i) { return i.updateIndicator(false); });
                    var possibilities = interactables
                        .filter(function (e) { return _this.dude.isFacing(e.position); }) // interactables the dude is facing
                        .filter(function (e) { return e.position.distanceTo(interactCenter) < interactDistance; });
                    var i = Lists_2.Lists.minBy(possibilities, function (e) { return e.position.distanceTo(interactCenter); });
                    if (!!i) {
                        i.updateIndicator(true);
                    }
                    return i;
                };
                // for trees and rocks
                Player.prototype.hitResource = function (updateData) {
                    var _this = this;
                    var interactDistance = 20;
                    var interactCenter = this.dude.standingPosition.minus(new point_51.Point(0, 7));
                    var possibilities = updateData.view.entities
                        .map(function (e) { return e.getComponent(Hittable_2.Hittable); })
                        .filter(function (e) { return !!e; })
                        .filter(function (e) { return _this.dude.isFacing(e.position); });
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
                    closest === null || closest === void 0 ? void 0 : closest.hit(closest.position.minus(interactCenter));
                };
                return Player;
            }(component_23.Component));
            exports_92("Player", Player);
        }
    };
});
System.register("game/characters/NPCSchedule", [], function (exports_93, context_93) {
    "use strict";
    var NPCSchedules;
    var __moduleName = context_93 && context_93.id;
    return {
        setters: [],
        execute: function () {
            exports_93("NPCSchedules", NPCSchedules = {
                SCHEDULE_KEY: "sch",
                newNoOpSchedule: function () { return { type: 0 /* DO_NOTHING */ }; },
                newGoToSchedule: function (pt) { return { type: 1 /* GO_TO_SPOT */, p: pt.toString() }; },
            });
        }
    };
});
System.register("game/characters/NPC", ["engine/component", "game/characters/Dude", "game/characters/Player", "engine/point", "game/world/LocationManager", "game/graphics/Tilesets", "engine/util/Lists", "game/characters/NPCSchedule", "game/ui/DialogueDisplay"], function (exports_94, context_94) {
    "use strict";
    var component_24, Dude_4, Player_8, point_52, LocationManager_13, Tilesets_29, Lists_3, NPCSchedule_1, DialogueDisplay_3, NPC;
    var __moduleName = context_94 && context_94.id;
    return {
        setters: [
            function (component_24_1) {
                component_24 = component_24_1;
            },
            function (Dude_4_1) {
                Dude_4 = Dude_4_1;
            },
            function (Player_8_1) {
                Player_8 = Player_8_1;
            },
            function (point_52_1) {
                point_52 = point_52_1;
            },
            function (LocationManager_13_1) {
                LocationManager_13 = LocationManager_13_1;
            },
            function (Tilesets_29_1) {
                Tilesets_29 = Tilesets_29_1;
            },
            function (Lists_3_1) {
                Lists_3 = Lists_3_1;
            },
            function (NPCSchedule_1_1) {
                NPCSchedule_1 = NPCSchedule_1_1;
            },
            function (DialogueDisplay_3_1) {
                DialogueDisplay_3 = DialogueDisplay_3_1;
            }
        ],
        execute: function () {
            /**
             * Shared logic for different types of NPCs. These should be invoked by an NPC controller component.
             */
            NPC = /** @class */ (function (_super) {
                __extends(NPC, _super);
                function NPC(defaultSchedule) {
                    if (defaultSchedule === void 0) { defaultSchedule = NPCSchedule_1.NPCSchedules.newNoOpSchedule(); }
                    var _this = _super.call(this) || this;
                    _this.isEnemyFn = function () { return false; };
                    _this.findTargetRange = Tilesets_29.TILE_SIZE * 10;
                    _this.enemiesPresent = false;
                    _this.walkPath = null;
                    _this.fleePath = null;
                    _this.awake = function () {
                        _this.dude = _this.entity.getComponent(Dude_4.Dude);
                        if (!_this.dude.blob[NPCSchedule_1.NPCSchedules.SCHEDULE_KEY]) {
                            _this.dude.blob[NPCSchedule_1.NPCSchedules.SCHEDULE_KEY] = defaultSchedule;
                        }
                    };
                    return _this;
                }
                NPC.prototype.awake = function () {
                };
                NPC.prototype.start = function () {
                    var _this = this;
                    this.doWhileLiving(function () { return _this.checkForEnemies(); }, 700 + 600 * Math.random());
                };
                NPC.prototype.update = function (updateData) {
                    /**
                     * NPC behavior:
                     * If threated, fight or flee
                     * otherwise follow their followTarget (if present)
                     * otherwise execute a "standard routine" which can be defined by the controller (TODO)
                     */
                    if (!!this.attackTarget && !this.attackTarget.isAlive) {
                        this.attackTarget = null; // no need to attack a dead dude
                    }
                    if (DialogueDisplay_3.DialogueDisplay.instance.dude === this.dude) {
                        this.dude.move(updateData, point_52.Point.ZERO, Player_8.Player.instance.dude.standingPosition.x - this.dude.standingPosition.x);
                    }
                    else if (this.enemiesPresent) {
                        if (!!this.attackTarget) {
                            this.doAttack(updateData);
                        }
                        else {
                            this.doFlee(updateData);
                        }
                    }
                    else {
                        this.doNormalScheduledActivity(updateData);
                    }
                };
                NPC.prototype.doNormalScheduledActivity = function (updateData) {
                    var schedule = this.getSchedule();
                    if (schedule.type === 0 /* DO_NOTHING */) {
                        this.dude.move(updateData, point_52.Point.ZERO);
                    }
                    else if (schedule.type === 1 /* GO_TO_SPOT */) {
                        this.walkTo(point_52.Point.fromString(schedule["p"]), updateData);
                    }
                };
                NPC.prototype.simulate = function () {
                    this.clearExistingAIState();
                    var schedule = this.getSchedule();
                    if (schedule.type === 0 /* DO_NOTHING */) {
                        // do nothing
                    }
                    else if (schedule.type === 1 /* GO_TO_SPOT */) {
                        this.forceMoveToTilePosition(point_52.Point.fromString(schedule["p"]));
                    }
                };
                NPC.prototype.getSchedule = function () {
                    var schedule = this.dude.blob[NPCSchedule_1.NPCSchedules.SCHEDULE_KEY];
                    if (!schedule) {
                        throw new Error("NPCs must have a \"" + NPCSchedule_1.NPCSchedules.SCHEDULE_KEY + "\" field in the blob. It's possible it got overwritten.");
                    }
                    return schedule;
                };
                NPC.prototype.clearExistingAIState = function () {
                    this.walkPath = null;
                    this.fleePath = null;
                    this.attackTarget = null;
                    this.followTarget = null;
                };
                // fn will execute immediately and every intervalMillis milliseconds until the NPC is dead
                NPC.prototype.doWhileLiving = function (fn, intervalMillis) {
                    var _this = this;
                    if (this.dude.isAlive) {
                        fn();
                    }
                    var interval = setInterval(function () {
                        if (!_this.dude.isAlive) {
                            clearInterval(interval);
                        }
                        else {
                            fn();
                        }
                    }, intervalMillis);
                };
                NPC.prototype.walkTo = function (tilePt, updateData) {
                    // TODO: make sure the existing path is to the same pt
                    if (!this.walkPath || this.walkPath.length === 0) { // only try once per upate() to find a path
                        this.walkPath = this.findPath(tilePt);
                        if (!this.walkPath || this.walkPath.length === 0) {
                            this.dude.move(updateData, point_52.Point.ZERO);
                            return;
                        }
                    }
                    if (this.walkDirectlyTo(this.walkPath[0], updateData, this.walkPath.length === 1)) {
                        this.walkPath.shift();
                    }
                };
                NPC.prototype.doFlee = function (updateData) {
                    if (!this.fleePath || this.fleePath.length === 0) { // only try once per upate() to find a path
                        var l_1 = LocationManager_13.LocationManager.instance.currentLocation;
                        var openPoints = l_1.ground.keys().filter(function (pt) { return !l_1.elements.get(pt); });
                        var pt = openPoints[Math.floor(Math.random() * openPoints.length)];
                        this.fleePath = this.findPath(pt);
                        if (!this.fleePath || this.fleePath.length === 0) {
                            this.dude.move(updateData, point_52.Point.ZERO);
                            return;
                        }
                    }
                    if (this.walkDirectlyTo(this.fleePath[0], updateData)) {
                        this.fleePath.shift();
                    }
                };
                NPC.prototype.doAttack = function (updateData) {
                    var _a, _b;
                    if (!this.dude.weapon || !this.dude.isAlive) {
                        return;
                    }
                    if (!this.attackTarget || !this.attackTarget.isAlive) {
                        this.dude.move(updateData, new point_52.Point(0, 0));
                        return;
                    }
                    var followDistance = (_a = this.dude.weapon.range / 2) !== null && _a !== void 0 ? _a : 20;
                    var buffer = 0; // this basically determines how long they will stop for if they get too close
                    var dist = this.attackTarget.position.minus(this.dude.position);
                    var mag = dist.magnitude();
                    if (mag > followDistance || ((followDistance - mag) < buffer && this.attackTarget.isMoving) && this.dude.isMoving) {
                        this.dude.move(updateData, dist);
                    }
                    else {
                        this.dude.move(updateData, new point_52.Point(0, 0));
                    }
                    if (mag < ((_b = this.dude.weapon) === null || _b === void 0 ? void 0 : _b.range)) {
                        this.dude.weapon.attack();
                    }
                };
                NPC.prototype.doFollow = function (updateData) {
                    var followDistance = 75;
                    var buffer = 40; // this basically determines how long they will stop for if they get too close
                    var dist = Player_8.Player.instance.dude.position.minus(this.dude.position);
                    var mag = dist.magnitude();
                    if (mag > followDistance || ((followDistance - mag) < buffer && Player_8.Player.instance.dude.isMoving) && this.dude.isMoving) {
                        this.dude.move(updateData, dist);
                    }
                    else {
                        this.dude.move(updateData, new point_52.Point(0, 0));
                    }
                };
                // returns true if they are pretty close (half a tile) away from the goal
                NPC.prototype.walkDirectlyTo = function (pt, updateData, stopWhenClose) {
                    if (stopWhenClose === void 0) { stopWhenClose = false; }
                    // const dist = this.dude.standingPosition.distanceTo(pt)
                    var isCloseEnough = this.isCloseEnoughToStopWalking(pt);
                    if (isCloseEnough && stopWhenClose) {
                        this.dude.move(updateData, point_52.Point.ZERO);
                    }
                    else {
                        this.dude.move(updateData, pt.minus(this.dude.standingPosition), 0);
                    }
                    return isCloseEnough;
                };
                NPC.prototype.isCloseEnoughToStopWalking = function (pt) {
                    return this.dude.standingPosition.distanceTo(pt) < 8;
                };
                NPC.prototype.checkForEnemies = function () {
                    var _this = this;
                    var enemies = Array.from(LocationManager_13.LocationManager.instance.currentLocation.dudes)
                        .filter(function (d) { return d.isAlive; })
                        .filter(this.isEnemyFn)
                        .filter(function (d) { return d.standingPosition.distanceTo(_this.dude.standingPosition) < _this.findTargetRange; });
                    this.enemiesPresent = enemies.length > 0;
                    if (!this.dude.weapon) {
                        // should flee instead
                        return;
                    }
                    // attack armed opponents first
                    if (enemies.some(function (d) { return !!d.weapon; })) {
                        enemies = enemies.filter(function (d) { return !!d.weapon; });
                    }
                    var target = Lists_3.Lists.minBy(enemies, function (d) { return d.position.distanceTo(_this.dude.position); });
                    if (!!target) {
                        this.attackTarget = target;
                    }
                };
                NPC.prototype.forceMoveToTilePosition = function (pt) {
                    var pos = this.tilePtToStandingPos(pt).minus(this.dude.standingPosition).plus(this.dude.position);
                    this.dude.moveTo(pos);
                };
                NPC.prototype.findPath = function (tilePt, h) {
                    var _this = this;
                    if (h === void 0) { h = function (pt) { return pt.distanceTo(end); }; }
                    var _a;
                    var start = Tilesets_29.pixelPtToTilePt(this.dude.standingPosition);
                    var end = tilePt;
                    return (_a = LocationManager_13.LocationManager.instance.currentLocation.elements.findPath(start, end, h, function (pt) { return (pt === start ? false : !!LocationManager_13.LocationManager.instance.currentLocation.elements.get(pt)); } // prevent getting stuck "inside" a square
                    )) === null || _a === void 0 ? void 0 : _a.map(function (pt) { return _this.tilePtToStandingPos(pt); }).slice(1); // slice(1) because we don't need the start in the path
                };
                NPC.prototype.tilePtToStandingPos = function (tilePt) {
                    var ptOffset = new point_52.Point(.5, .8);
                    return tilePt.plus(ptOffset).times(Tilesets_29.TILE_SIZE);
                };
                return NPC;
            }(component_24.Component));
            exports_94("NPC", NPC);
        }
    };
});
System.register("game/characters/Enemy", ["engine/component", "game/characters/Dude", "game/characters/NPC"], function (exports_95, context_95) {
    "use strict";
    var component_25, Dude_5, NPC_1, Enemy;
    var __moduleName = context_95 && context_95.id;
    return {
        setters: [
            function (component_25_1) {
                component_25 = component_25_1;
            },
            function (Dude_5_1) {
                Dude_5 = Dude_5_1;
            },
            function (NPC_1_1) {
                NPC_1 = NPC_1_1;
            }
        ],
        execute: function () {
            Enemy = /** @class */ (function (_super) {
                __extends(Enemy, _super);
                function Enemy() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Enemy.prototype.awake = function () {
                    var _this = this;
                    this.dude = this.entity.getComponent(Dude_5.Dude);
                    this.dude.weapon.delay = 500;
                    this.npc = this.entity.getComponent(NPC_1.NPC);
                    this.npc.isEnemyFn = function (d) { return d.faction != _this.dude.faction; };
                };
                return Enemy;
            }(component_25.Component));
            exports_95("Enemy", Enemy);
        }
    };
});
System.register("game/cutscenes/CutscenePlayerController", ["engine/component", "game/characters/Player", "game/characters/Dude", "engine/point"], function (exports_96, context_96) {
    "use strict";
    var component_26, Player_9, Dude_6, point_53, CutscenePlayerController;
    var __moduleName = context_96 && context_96.id;
    return {
        setters: [
            function (component_26_1) {
                component_26 = component_26_1;
            },
            function (Player_9_1) {
                Player_9 = Player_9_1;
            },
            function (Dude_6_1) {
                Dude_6 = Dude_6_1;
            },
            function (point_53_1) {
                point_53 = point_53_1;
            }
        ],
        execute: function () {
            CutscenePlayerController = /** @class */ (function (_super) {
                __extends(CutscenePlayerController, _super);
                function CutscenePlayerController() {
                    var _this = _super.call(this) || this;
                    _this.moveDir = point_53.Point.ZERO;
                    CutscenePlayerController.instance = _this;
                    _this.enabled = false;
                    return _this;
                }
                CutscenePlayerController.prototype.start = function () {
                    this._dude = this.entity.getComponent(Dude_6.Dude);
                };
                CutscenePlayerController.prototype.update = function (updateData) {
                    this._dude.move(updateData, this.moveDir);
                };
                CutscenePlayerController.prototype.startMoving = function (moveDir) {
                    this.moveDir = moveDir;
                };
                CutscenePlayerController.prototype.stopMoving = function () {
                    this.moveDir = point_53.Point.ZERO;
                };
                CutscenePlayerController.prototype.enable = function () {
                    this.enabled = true;
                    Player_9.Player.instance.enabled = false;
                };
                CutscenePlayerController.prototype.disable = function () {
                    this.enabled = false;
                    Player_9.Player.instance.enabled = true;
                };
                return CutscenePlayerController;
            }(component_26.Component));
            exports_96("CutscenePlayerController", CutscenePlayerController);
        }
    };
});
System.register("game/characters/Villager", ["engine/component", "game/characters/NPC"], function (exports_97, context_97) {
    "use strict";
    var component_27, NPC_2, Villager;
    var __moduleName = context_97 && context_97.id;
    return {
        setters: [
            function (component_27_1) {
                component_27 = component_27_1;
            },
            function (NPC_2_1) {
                NPC_2 = NPC_2_1;
            }
        ],
        execute: function () {
            Villager = /** @class */ (function (_super) {
                __extends(Villager, _super);
                function Villager() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Villager.prototype.awake = function () {
                    this.npc = this.entity.getComponent(NPC_2.NPC);
                    this.npc.isEnemyFn = function (d) { return d.faction !== 0 /* VILLAGERS */; };
                };
                return Villager;
            }(component_27.Component));
            exports_97("Villager", Villager);
        }
    };
});
System.register("game/characters/DudeFactory", ["engine/Entity", "engine/point", "game/characters/Player", "game/characters/Dude", "game/characters/NPC", "game/world/LocationManager", "game/characters/Enemy", "game/items/Inventory", "game/cutscenes/CutscenePlayerController", "game/characters/Villager", "game/characters/NPCSchedule", "engine/util/Lists"], function (exports_98, context_98) {
    "use strict";
    var Entity_18, point_54, Player_10, Dude_7, NPC_3, LocationManager_14, Enemy_1, Inventory_2, CutscenePlayerController_1, Villager_1, NPCSchedule_2, Lists_4, DudeFactory;
    var __moduleName = context_98 && context_98.id;
    return {
        setters: [
            function (Entity_18_1) {
                Entity_18 = Entity_18_1;
            },
            function (point_54_1) {
                point_54 = point_54_1;
            },
            function (Player_10_1) {
                Player_10 = Player_10_1;
            },
            function (Dude_7_1) {
                Dude_7 = Dude_7_1;
            },
            function (NPC_3_1) {
                NPC_3 = NPC_3_1;
            },
            function (LocationManager_14_1) {
                LocationManager_14 = LocationManager_14_1;
            },
            function (Enemy_1_1) {
                Enemy_1 = Enemy_1_1;
            },
            function (Inventory_2_1) {
                Inventory_2 = Inventory_2_1;
            },
            function (CutscenePlayerController_1_1) {
                CutscenePlayerController_1 = CutscenePlayerController_1_1;
            },
            function (Villager_1_1) {
                Villager_1 = Villager_1_1;
            },
            function (NPCSchedule_2_1) {
                NPCSchedule_2 = NPCSchedule_2_1;
            },
            function (Lists_4_1) {
                Lists_4 = Lists_4_1;
            }
        ],
        execute: function () {
            DudeFactory = /** @class */ (function () {
                function DudeFactory() {
                    DudeFactory.instance = this;
                }
                /**
                 * Create a new Dude in the specified location, defaults to the exterior world location
                 */
                DudeFactory.prototype.new = function (type, pos, location) {
                    if (location === void 0) { location = LocationManager_14.LocationManager.instance.exterior(); }
                    var d = this.make(type, pos, null, location);
                    location.dudes.add(d);
                    return d;
                };
                /**
                 * Instantiates a Dude+Entity in the specified location
                 */
                DudeFactory.prototype.load = function (saveState, location) {
                    var d = this.make(saveState.type, point_54.Point.fromString(saveState.pos), saveState, location);
                    location.dudes.add(d);
                };
                DudeFactory.prototype.make = function (type, pos, saveState, location) {
                    var _a, _b, _c, _d, _e, _f, _g;
                    // defaults
                    var faction = 0 /* VILLAGERS */;
                    var animationName;
                    var weapon = null;
                    var shield = null;
                    var maxHealth;
                    var speed = 0.085;
                    var dialogue = 0 /* NONE */;
                    var additionalComponents = [];
                    var blob = {};
                    // type-specific defaults
                    switch (type) {
                        case 0 /* PLAYER */: {
                            animationName = "knight_f";
                            weapon = "weapon_regular_sword";
                            shield = "shield_0";
                            maxHealth = 4;
                            additionalComponents = [new Player_10.Player(), new CutscenePlayerController_1.CutscenePlayerController()];
                            break;
                        }
                        case 1 /* DIP */: {
                            animationName = "lizard_f";
                            maxHealth = Number.MAX_SAFE_INTEGER;
                            speed *= .7;
                            additionalComponents = [
                                new NPC_3.NPC(NPCSchedule_2.NPCSchedules.newGoToSchedule(new point_54.Point(0, 0))),
                                new Villager_1.Villager()
                            ];
                            break;
                        }
                        case 4 /* HERALD */: {
                            animationName = "Herald";
                            maxHealth = Number.MAX_SAFE_INTEGER;
                            speed *= .6;
                            dialogue = 8 /* BERT_0 */;
                            additionalComponents = [
                                new NPC_3.NPC(NPCSchedule_2.NPCSchedules.newGoToSchedule(// filter out occupied points to not get stuck in the campfire
                                Lists_4.Lists.oneOf([new point_54.Point(-3, 0), new point_54.Point(-3, 1), new point_54.Point(-2, 0), new point_54.Point(-2, 1)].filter(function (pt) { return !location.elements.get(pt); })))),
                                new Villager_1.Villager()
                            ];
                            break;
                        }
                        case 2 /* ELF */: {
                            animationName = "elf_m";
                            weapon = "weapon_katana";
                            shield = "shield_0";
                            maxHealth = 4;
                            additionalComponents = [new NPC_3.NPC(), new Villager_1.Villager()];
                            speed *= (.3 + Math.random() / 2);
                            break;
                        }
                        case 3 /* ORC_WARRIOR */: {
                            faction = 1 /* ORCS */;
                            animationName = "orc_warrior";
                            weapon = "weapon_baton_with_spikes";
                            additionalComponents = [new NPC_3.NPC(), new Enemy_1.Enemy()];
                            maxHealth = 2;
                            speed *= (.3 + Math.random() / 2);
                            break;
                        }
                        default: {
                            throw new Error("DudeType " + type + " can't be instantiated");
                        }
                    }
                    var health = maxHealth;
                    var inventory = !!(saveState === null || saveState === void 0 ? void 0 : saveState.inventory) ? Inventory_2.Inventory.load(saveState.inventory) : new Inventory_2.Inventory();
                    // use saved data instead of defaults
                    var d = new Dude_7.Dude(type, faction, animationName, pos, (_a = saveState === null || saveState === void 0 ? void 0 : saveState.weapon) !== null && _a !== void 0 ? _a : weapon, (_b = saveState === null || saveState === void 0 ? void 0 : saveState.shield) !== null && _b !== void 0 ? _b : shield, (_c = saveState === null || saveState === void 0 ? void 0 : saveState.maxHealth) !== null && _c !== void 0 ? _c : maxHealth, (_d = saveState === null || saveState === void 0 ? void 0 : saveState.health) !== null && _d !== void 0 ? _d : health, (_e = saveState === null || saveState === void 0 ? void 0 : saveState.speed) !== null && _e !== void 0 ? _e : speed, inventory, (_f = saveState === null || saveState === void 0 ? void 0 : saveState.dialogue) !== null && _f !== void 0 ? _f : dialogue, (_g = saveState === null || saveState === void 0 ? void 0 : saveState.blob) !== null && _g !== void 0 ? _g : blob);
                    new Entity_18.Entity([d].concat(additionalComponents));
                    return d;
                };
                return DudeFactory;
            }());
            exports_98("DudeFactory", DudeFactory);
        }
    };
});
System.register("game/saves/DudeSaveState", [], function (exports_99, context_99) {
    "use strict";
    var DudeSaveState;
    var __moduleName = context_99 && context_99.id;
    return {
        setters: [],
        execute: function () {
            DudeSaveState = /** @class */ (function () {
                function DudeSaveState() {
                }
                return DudeSaveState;
            }());
            exports_99("DudeSaveState", DudeSaveState);
        }
    };
});
System.register("game/saves/LocationSaveState", [], function (exports_100, context_100) {
    "use strict";
    var LocationSaveState;
    var __moduleName = context_100 && context_100.id;
    return {
        setters: [],
        execute: function () {
            LocationSaveState = /** @class */ (function () {
                function LocationSaveState() {
                }
                return LocationSaveState;
            }());
            exports_100("LocationSaveState", LocationSaveState);
        }
    };
});
System.register("game/saves/uuid", [], function (exports_101, context_101) {
    "use strict";
    var newUUID;
    var __moduleName = context_101 && context_101.id;
    return {
        setters: [],
        execute: function () {
            // from https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
            exports_101("newUUID", newUUID = function () {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            });
        }
    };
});
System.register("game/world/ground/GroundComponent", ["engine/component"], function (exports_102, context_102) {
    "use strict";
    var component_28, GroundComponent;
    var __moduleName = context_102 && context_102.id;
    return {
        setters: [
            function (component_28_1) {
                component_28 = component_28_1;
            }
        ],
        execute: function () {
            /**
             * A component that all world space entities should have in order to be saveable.
             * Elements should no subclass this,
             */
            GroundComponent = /** @class */ (function (_super) {
                __extends(GroundComponent, _super);
                function GroundComponent(type, saveFn) {
                    if (saveFn === void 0) { saveFn = function () { return {}; }; }
                    var _this = _super.call(this) || this;
                    _this.type = type;
                    _this.save = saveFn;
                    return _this;
                }
                GroundComponent.prototype.save = function () {
                    throw new Error("yikes");
                };
                return GroundComponent;
            }(component_28.Component));
            exports_102("GroundComponent", GroundComponent);
        }
    };
});
System.register("game/world/WorldLocation", ["engine/util/Grid", "game/saves/uuid", "game/world/elements/Elements", "engine/point", "game/world/LocationManager", "game/world/ground/Ground", "game/characters/DudeFactory", "game/world/Teleporter", "game/characters/Player", "game/cutscenes/Camera", "game/graphics/Tilesets", "game/characters/NPC"], function (exports_103, context_103) {
    "use strict";
    var Grid_2, uuid_1, Elements_2, point_55, LocationManager_15, Ground_1, DudeFactory_2, Teleporter_2, Player_11, Camera_5, Tilesets_30, NPC_4, WorldLocation;
    var __moduleName = context_103 && context_103.id;
    return {
        setters: [
            function (Grid_2_1) {
                Grid_2 = Grid_2_1;
            },
            function (uuid_1_1) {
                uuid_1 = uuid_1_1;
            },
            function (Elements_2_1) {
                Elements_2 = Elements_2_1;
            },
            function (point_55_1) {
                point_55 = point_55_1;
            },
            function (LocationManager_15_1) {
                LocationManager_15 = LocationManager_15_1;
            },
            function (Ground_1_1) {
                Ground_1 = Ground_1_1;
            },
            function (DudeFactory_2_1) {
                DudeFactory_2 = DudeFactory_2_1;
            },
            function (Teleporter_2_1) {
                Teleporter_2 = Teleporter_2_1;
            },
            function (Player_11_1) {
                Player_11 = Player_11_1;
            },
            function (Camera_5_1) {
                Camera_5 = Camera_5_1;
            },
            function (Tilesets_30_1) {
                Tilesets_30 = Tilesets_30_1;
            },
            function (NPC_4_1) {
                NPC_4 = NPC_4_1;
            }
        ],
        execute: function () {
            WorldLocation = /** @class */ (function () {
                function WorldLocation(manager, isInterior) {
                    this._uuid = uuid_1.newUUID();
                    this.dudes = new Set();
                    // Non-moving entities with tile coords (not pixel coords)
                    // Entities may be duplicated in multiple spots 
                    // (entities spawning multiple tiles eg a tent)
                    // BUT an entity should only be in one of these data structures
                    this.elements = new Grid_2.Grid();
                    this.ground = new Grid_2.Grid();
                    // TODO: Make dropped items saveable
                    this.droppedItems = new Set();
                    this.teleporters = {};
                    this.manager = manager;
                    this.isInterior = isInterior;
                }
                Object.defineProperty(WorldLocation.prototype, "uuid", {
                    get: function () { return this._uuid; },
                    enumerable: true,
                    configurable: true
                });
                WorldLocation.prototype.addGroundElement = function (type, pos, data) {
                    if (data === void 0) { data = {}; }
                    var groundComponent = Ground_1.Ground.instance.make(type, this, pos, data);
                    if (!!this.ground.get(pos)) {
                        groundComponent.entity.selfDestruct();
                        return null;
                    }
                    this.ground.set(pos, groundComponent);
                    return groundComponent;
                };
                WorldLocation.prototype.addWorldElement = function (type, pos, data) {
                    var _this = this;
                    if (data === void 0) { data = {}; }
                    var elementComponent = Elements_2.Elements.instance.make(type, this, pos, data);
                    if (elementComponent.occupiedPoints.some(function (pos) { return !!_this.elements.get(pos); })) {
                        elementComponent.entity.selfDestruct();
                        return null;
                    }
                    elementComponent.occupiedPoints.forEach(function (pos) { return _this.elements.set(pos, elementComponent); });
                    return elementComponent;
                };
                WorldLocation.prototype.addTeleporter = function (t) {
                    this.teleporters[Teleporter_2.Teleporters.teleporterId(t.to, t.id)] = t.pos.toString();
                };
                WorldLocation.prototype.getTeleporterLinkedPos = function (to, id) {
                    var dest = LocationManager_15.LocationManager.instance.get(to);
                    var link = dest.teleporters[Teleporter_2.Teleporters.teleporterId(this.uuid, id)];
                    if (!link) {
                        throw new Error("teleporter doesn't have a link on the other side");
                    }
                    return point_55.Point.fromString(link);
                };
                WorldLocation.prototype.useTeleporter = function (to, id) {
                    if (id === void 0) { id = null; }
                    var linkedLocation = LocationManager_15.LocationManager.instance.get(to);
                    var linkedPosition = this.getTeleporterLinkedPos(to, id);
                    var p = Player_11.Player.instance.dude;
                    var beforeTeleportPos = p.standingPosition;
                    this.dudes.delete(p);
                    linkedLocation.dudes.add(p);
                    LocationManager_15.LocationManager.instance.currentLocation = linkedLocation;
                    // fast-forward NPCs along their schedule
                    linkedLocation.dudes.forEach(function (d) { var _a; return (_a = d.entity.getComponent(NPC_4.NPC)) === null || _a === void 0 ? void 0 : _a.simulate(); });
                    // move player
                    var offset = p.standingPosition.minus(p.position);
                    p.moveTo(linkedPosition.minus(offset));
                    // makes the camera lerp a bit in the direction of the door
                    // TODO make this support non up/down doors
                    var niceTransition = Tilesets_30.TILE_SIZE * 2 * (linkedLocation.isInterior ? -1 : 1);
                    Camera_5.Camera.instance.jump(beforeTeleportPos.minus(p.standingPosition).plusY(niceTransition));
                };
                WorldLocation.prototype.getEntities = function () {
                    return Array.from(Array.from(this.dudes.values()).map(function (d) { return d.entity; }))
                        .concat(this.elements.values().map(function (c) { return c.entity; }))
                        .concat(this.ground.values().map(function (c) { return c.entity; }))
                        .concat(Array.from(this.droppedItems));
                };
                WorldLocation.prototype.save = function () {
                    return {
                        uuid: this.uuid,
                        ground: this.saveGround(),
                        elements: this.saveElements(),
                        dudes: Array.from(this.dudes).filter(function (d) { return d.isAlive; }).map(function (d) { return d.save(); }),
                        teleporters: this.teleporters,
                        isInterior: this.isInterior
                    };
                };
                WorldLocation.prototype.saveElements = function () {
                    var topLeftCornerMap = new Map();
                    this.elements.entries().forEach(function (tuple) {
                        var elementComponent = tuple[1];
                        var point = tuple[0];
                        var existingPoint = topLeftCornerMap.get(elementComponent);
                        if (!existingPoint || point.x < existingPoint.x || point.y < existingPoint.y) {
                            topLeftCornerMap.set(elementComponent, point);
                        }
                    });
                    return Array.from(topLeftCornerMap.entries()).map(function (kv) {
                        var el = new Elements_2.SavedElement();
                        el.pos = kv[1].toString();
                        el.type = kv[0].type;
                        el.obj = kv[0].save();
                        return el;
                    });
                };
                WorldLocation.prototype.saveGround = function () {
                    return this.ground.entries().map(function (kv) {
                        var el = new Ground_1.SavedGround();
                        el.pos = kv[0].toString();
                        el.type = kv[1].type;
                        el.obj = kv[1].save();
                        return el;
                    });
                };
                WorldLocation.load = function (locationManager, saveState) {
                    // BUG: RELOADING RETURNS ELEMENTS THAT HAVE BEEN DESTROYED
                    var n = new WorldLocation(locationManager, saveState.isInterior);
                    n._uuid = saveState.uuid;
                    saveState.elements.forEach(function (el) { return n.addWorldElement(el.type, point_55.Point.fromString(el.pos), el.obj); });
                    saveState.ground.forEach(function (el) { return n.addGroundElement(el.type, point_55.Point.fromString(el.pos), el.obj); });
                    saveState.dudes.forEach(function (d) { return DudeFactory_2.DudeFactory.instance.load(d, n); });
                    n.teleporters = saveState.teleporters;
                    return n;
                };
                return WorldLocation;
            }());
            exports_103("WorldLocation", WorldLocation);
        }
    };
});
System.register("game/world/GroundRenderer", ["engine/point", "engine/renderer/ImageRender", "engine/Entity", "engine/renderer/BasicRenderComponent", "game/cutscenes/Camera", "game/world/MapGenerator", "game/graphics/Tilesets", "engine/util/Grid", "game/world/LocationManager", "engine/tiles/TileTransform"], function (exports_104, context_104) {
    "use strict";
    var point_56, ImageRender_4, Entity_19, BasicRenderComponent_7, Camera_6, MapGenerator_4, Tilesets_31, Grid_3, LocationManager_16, TileTransform_21, GroundRenderer;
    var __moduleName = context_104 && context_104.id;
    return {
        setters: [
            function (point_56_1) {
                point_56 = point_56_1;
            },
            function (ImageRender_4_1) {
                ImageRender_4 = ImageRender_4_1;
            },
            function (Entity_19_1) {
                Entity_19 = Entity_19_1;
            },
            function (BasicRenderComponent_7_1) {
                BasicRenderComponent_7 = BasicRenderComponent_7_1;
            },
            function (Camera_6_1) {
                Camera_6 = Camera_6_1;
            },
            function (MapGenerator_4_1) {
                MapGenerator_4 = MapGenerator_4_1;
            },
            function (Tilesets_31_1) {
                Tilesets_31 = Tilesets_31_1;
            },
            function (Grid_3_1) {
                Grid_3 = Grid_3_1;
            },
            function (LocationManager_16_1) {
                LocationManager_16 = LocationManager_16_1;
            },
            function (TileTransform_21_1) {
                TileTransform_21 = TileTransform_21_1;
            }
        ],
        execute: function () {
            /**
             * This is an optimization that pre-renders ground on an offscreen canvas
             */
            GroundRenderer = /** @class */ (function () {
                function GroundRenderer() {
                    // no lights should live outside of this range
                    this.size = MapGenerator_4.MapGenerator.MAP_SIZE * Tilesets_31.TILE_SIZE * 2;
                    this.shift = new point_56.Point(this.size / 2, this.size / 2);
                    this.tiles = new Map();
                    this.gridDirty = true;
                    GroundRenderer.instance = this;
                    this.canvas = document.createElement("canvas");
                    this.canvas.width = this.size;
                    this.canvas.height = this.size;
                    this.context = this.canvas.getContext("2d");
                }
                GroundRenderer.prototype.addTile = function (wl, position, tile) {
                    var _a;
                    this.checkPt(position);
                    var locationTileGrid = (_a = this.tiles.get(wl)) !== null && _a !== void 0 ? _a : new Grid_3.Grid();
                    locationTileGrid.set(position, tile);
                    this.tiles.set(wl, locationTileGrid);
                    this.gridDirty = true;
                };
                GroundRenderer.prototype.removeTile = function (wl, position) {
                    this.checkPt(position);
                    var locationTileGrid = this.tiles.get(wl);
                    if (!locationTileGrid) {
                        return; // it is ok to fail silently here
                    }
                    locationTileGrid.remove(position);
                    this.gridDirty = true;
                };
                GroundRenderer.prototype.checkPt = function (position) {
                    var lim = this.size / 2;
                    if (position.x < -lim || position.x > lim || position.y < -lim || position.y > lim) {
                        throw new Error("light is outside of valid bounds");
                    }
                };
                GroundRenderer.prototype.renderToOffscreenCanvas = function () {
                    var _this = this;
                    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    var location = LocationManager_16.LocationManager.instance.currentLocation;
                    if (location.isInterior) {
                        return;
                    }
                    var locationTileGrid = this.tiles.get(location);
                    if (!locationTileGrid) {
                        return;
                    }
                    locationTileGrid.entries().forEach(function (entry) {
                        var pos = entry[0].times(Tilesets_31.TILE_SIZE).plus(_this.shift);
                        var tile = entry[1];
                        var imageRender = tile.toImageRender(new TileTransform_21.TileTransform());
                        _this.context.drawImage(imageRender.source, imageRender.sourcePosition.x, imageRender.sourcePosition.y, Tilesets_31.TILE_SIZE, Tilesets_31.TILE_SIZE, pos.x, pos.y, Tilesets_31.TILE_SIZE, Tilesets_31.TILE_SIZE);
                    });
                };
                GroundRenderer.prototype.getEntity = function () {
                    if (this.gridDirty || this.lastLocationRendered !== LocationManager_16.LocationManager.instance.currentLocation) {
                        this.renderToOffscreenCanvas();
                        this.gridDirty = false;
                        this.lastLocationRendered = LocationManager_16.LocationManager.instance.currentLocation;
                    }
                    var dimensions = Camera_6.Camera.instance.dimensions.plus(new point_56.Point(1, 1));
                    return new Entity_19.Entity([new BasicRenderComponent_7.BasicRenderComponent(new ImageRender_4.ImageRender(this.canvas, Camera_6.Camera.instance.position.plus(this.shift).apply(Math.floor), dimensions, Camera_6.Camera.instance.position.apply(Math.floor), dimensions, Number.MIN_SAFE_INTEGER))]);
                };
                return GroundRenderer;
            }());
            exports_104("GroundRenderer", GroundRenderer);
        }
    };
});
System.register("game/world/ground/Grass", ["engine/point", "game/graphics/Tilesets", "game/world/ground/GroundComponent", "engine/Entity", "game/world/GroundRenderer"], function (exports_105, context_105) {
    "use strict";
    var point_57, Tilesets_32, GroundComponent_1, Entity_20, GroundRenderer_1, makeGrass;
    var __moduleName = context_105 && context_105.id;
    return {
        setters: [
            function (point_57_1) {
                point_57 = point_57_1;
            },
            function (Tilesets_32_1) {
                Tilesets_32 = Tilesets_32_1;
            },
            function (GroundComponent_1_1) {
                GroundComponent_1 = GroundComponent_1_1;
            },
            function (Entity_20_1) {
                Entity_20 = Entity_20_1;
            },
            function (GroundRenderer_1_1) {
                GroundRenderer_1 = GroundRenderer_1_1;
            }
        ],
        execute: function () {
            exports_105("makeGrass", makeGrass = function (d) {
                var _a;
                var tile;
                var index = (_a = d.data["index"]) !== null && _a !== void 0 ? _a : (Math.random() < .65 ? Math.floor(Math.random() * 4) : 0);
                if (index > 0) {
                    tile = Tilesets_32.Tilesets.instance.tilemap.getTileAt(new point_57.Point(0, index));
                }
                else {
                    tile = Tilesets_32.Tilesets.instance.tilemap.getTileAt(new point_57.Point(0, 7));
                }
                GroundRenderer_1.GroundRenderer.instance.addTile(d.wl, d.pos, tile);
                return new Entity_20.Entity().addComponent(new GroundComponent_1.GroundComponent(2 /* GRASS */, function () { return { index: index }; }));
            });
        }
    };
});
System.register("game/world/ground/Path", ["game/world/ground/GroundComponent", "engine/Entity", "engine/tiles/ConnectingTile", "game/world/ground/Ground"], function (exports_106, context_106) {
    "use strict";
    var GroundComponent_2, Entity_21, ConnectingTile_1, Ground_2, makePath;
    var __moduleName = context_106 && context_106.id;
    return {
        setters: [
            function (GroundComponent_2_1) {
                GroundComponent_2 = GroundComponent_2_1;
            },
            function (Entity_21_1) {
                Entity_21 = Entity_21_1;
            },
            function (ConnectingTile_1_1) {
                ConnectingTile_1 = ConnectingTile_1_1;
            },
            function (Ground_2_1) {
                Ground_2 = Ground_2_1;
            }
        ],
        execute: function () {
            // const oldPathSchema = new ConnectingTileSchema()
            //     .vertical(Tilesets.instance.outdoorTiles.getTileAt(new Point(9, 7)))
            //     .angle(Tilesets.instance.outdoorTiles.getTileAt(new Point(7, 7)))
            //     .tShape(Tilesets.instance.outdoorTiles.getTileAt(new Point(5, 8)))
            //     .plusShape(Tilesets.instance.outdoorTiles.getTileAt(new Point(7, 12)))
            //     .cap(Tilesets.instance.outdoorTiles.getTileAt(new Point(6, 11)))
            //     .single(Tilesets.instance.outdoorTiles.getTileAt(new Point(8, 12)))
            // TODO fix this initializing before Tilesets.instance
            // export const PATH_CONNECTING_SCHEMA = new ConnectingTileSchema()
            //         .vertical(Tilesets.instance.tilemap.getTileAt(new Point(2, 6)))
            //         .angle(Tilesets.instance.tilemap.getTileAt(new Point(0, 5)))
            //         .tShape(Tilesets.instance.tilemap.getTileAt(new Point(3, 5)))
            //         .plusShape(Tilesets.instance.tilemap.getTileAt(new Point(5, 5)))
            //         .cap(Tilesets.instance.tilemap.getTileAt(new Point(2, 6)))
            //         .single(Tilesets.instance.tilemap.getTileAt(new Point(7, 5)))
            exports_106("makePath", makePath = function (d) {
                var e = new Entity_21.Entity();
                var c = new ConnectingTile_1.ConnectingTile(Ground_2.Ground.instance.PATH_CONNECTING_SCHEMA, d.wl.ground, d.pos);
                e.addComponent(c);
                return e.addComponent(new GroundComponent_2.GroundComponent(3 /* PATH */));
            });
        }
    };
});
System.register("game/world/ground/BasicGround", ["game/graphics/Tilesets", "game/world/ground/GroundComponent", "engine/Entity", "engine/tiles/TileTransform"], function (exports_107, context_107) {
    "use strict";
    var Tilesets_33, GroundComponent_3, Entity_22, TileTransform_22, makeBasicGround, makeBasicNineSliceGround;
    var __moduleName = context_107 && context_107.id;
    return {
        setters: [
            function (Tilesets_33_1) {
                Tilesets_33 = Tilesets_33_1;
            },
            function (GroundComponent_3_1) {
                GroundComponent_3 = GroundComponent_3_1;
            },
            function (Entity_22_1) {
                Entity_22 = Entity_22_1;
            },
            function (TileTransform_22_1) {
                TileTransform_22 = TileTransform_22_1;
            }
        ],
        execute: function () {
            // Function that takes a tileSource and returns a ground generation function for it
            exports_107("makeBasicGround", makeBasicGround = function (d) {
                var key = d.data["k"];
                var tile = Tilesets_33.Tilesets.instance.getBasicTileSource(key);
                var c = tile.toComponent(new TileTransform_22.TileTransform(d.pos.times(Tilesets_33.TILE_SIZE)));
                c.transform.depth = Number.MIN_SAFE_INTEGER;
                return new Entity_22.Entity([c]).addComponent(new GroundComponent_3.GroundComponent(0 /* BASIC */, function () { return d.data; }));
            });
            exports_107("makeBasicNineSliceGround", makeBasicNineSliceGround = function (d) {
                var key = d.data["k"];
                var slice = Tilesets_33.Tilesets.instance.getBasicTileNineSlice(key);
                var nineSliceIndex = d.data["i"];
                var c = slice[nineSliceIndex].toComponent(new TileTransform_22.TileTransform(d.pos.times(Tilesets_33.TILE_SIZE)));
                c.transform.depth = Number.MIN_SAFE_INTEGER;
                return new Entity_22.Entity([c]).addComponent(new GroundComponent_3.GroundComponent(1 /* BASIC_NINE_SLICE */, function () { return d.data; }));
            });
        }
    };
});
System.register("game/world/ground/Ledge", ["engine/point", "game/graphics/Tilesets", "game/world/ground/GroundComponent", "engine/Entity", "engine/tiles/TileTransform"], function (exports_108, context_108) {
    "use strict";
    var point_58, Tilesets_34, GroundComponent_4, Entity_23, TileTransform_23, makeLedge;
    var __moduleName = context_108 && context_108.id;
    return {
        setters: [
            function (point_58_1) {
                point_58 = point_58_1;
            },
            function (Tilesets_34_1) {
                Tilesets_34 = Tilesets_34_1;
            },
            function (GroundComponent_4_1) {
                GroundComponent_4 = GroundComponent_4_1;
            },
            function (Entity_23_1) {
                Entity_23 = Entity_23_1;
            },
            function (TileTransform_23_1) {
                TileTransform_23 = TileTransform_23_1;
            }
        ],
        execute: function () {
            // TODO probably get rid of this
            exports_108("makeLedge", makeLedge = function (d) {
                var c = Tilesets_34.Tilesets.instance.tilemap.getTileAt(new point_58.Point(3, 2)).toComponent(new TileTransform_23.TileTransform(d.pos.times(Tilesets_34.TILE_SIZE)));
                c.transform.depth = Number.MIN_SAFE_INTEGER;
                return new Entity_23.Entity([c]).addComponent(new GroundComponent_4.GroundComponent(2 /* GRASS */, function () { return {}; }));
            });
        }
    };
});
System.register("game/world/ground/Ground", ["engine/point", "game/world/ground/Grass", "game/world/ground/Path", "engine/tiles/ConnectingTileSchema", "game/graphics/Tilesets", "game/world/ground/BasicGround", "game/world/ground/Ledge"], function (exports_109, context_109) {
    "use strict";
    var point_59, Grass_1, Path_1, ConnectingTileSchema_1, Tilesets_35, BasicGround_1, Ledge_1, SavedGround, Ground;
    var __moduleName = context_109 && context_109.id;
    return {
        setters: [
            function (point_59_1) {
                point_59 = point_59_1;
            },
            function (Grass_1_1) {
                Grass_1 = Grass_1_1;
            },
            function (Path_1_1) {
                Path_1 = Path_1_1;
            },
            function (ConnectingTileSchema_1_1) {
                ConnectingTileSchema_1 = ConnectingTileSchema_1_1;
            },
            function (Tilesets_35_1) {
                Tilesets_35 = Tilesets_35_1;
            },
            function (BasicGround_1_1) {
                BasicGround_1 = BasicGround_1_1;
            },
            function (Ledge_1_1) {
                Ledge_1 = Ledge_1_1;
            }
        ],
        execute: function () {
            SavedGround = /** @class */ (function () {
                function SavedGround() {
                }
                return SavedGround;
            }());
            exports_109("SavedGround", SavedGround);
            /**
             * Ground and elements are very similar, except that ground components are always 1x1
             */
            Ground = /** @class */ (function () {
                function Ground() {
                    var _a;
                    this.GROUND_FUNCTION_MAP = (_a = {},
                        _a[0 /* BASIC */] = BasicGround_1.makeBasicGround,
                        _a[1 /* BASIC_NINE_SLICE */] = BasicGround_1.makeBasicNineSliceGround,
                        _a[2 /* GRASS */] = Grass_1.makeGrass,
                        _a[3 /* PATH */] = Path_1.makePath,
                        _a[4 /* LEDGE */] = Ledge_1.makeLedge,
                        _a);
                    this.PATH_CONNECTING_SCHEMA = new ConnectingTileSchema_1.ConnectingTileSchema()
                        .vertical(Tilesets_35.Tilesets.instance.tilemap.getTileAt(new point_59.Point(2, 6)))
                        .angle(Tilesets_35.Tilesets.instance.tilemap.getTileAt(new point_59.Point(0, 5)))
                        .tShape(Tilesets_35.Tilesets.instance.tilemap.getTileAt(new point_59.Point(3, 5)))
                        .plusShape(Tilesets_35.Tilesets.instance.tilemap.getTileAt(new point_59.Point(5, 5)))
                        .cap(Tilesets_35.Tilesets.instance.tilemap.getTileAt(new point_59.Point(2, 6)))
                        .single(Tilesets_35.Tilesets.instance.tilemap.getTileAt(new point_59.Point(7, 5)));
                    Ground.instance = this;
                }
                Ground.prototype.make = function (type, wl, pos, data) {
                    var ground = this.GROUND_FUNCTION_MAP[type]({ wl: wl, pos: pos, data: data });
                    if (ground.type !== type) {
                        throw new Error("constructed ground type doesn't match requested type");
                    }
                    return ground;
                };
                return Ground;
            }());
            exports_109("Ground", Ground);
        }
    };
});
System.register("engine/tiles/ConnectingTileSchema", ["engine/point", "engine/tiles/TileTransform", "engine/tiles/ConnectingTile"], function (exports_110, context_110) {
    "use strict";
    var point_60, TileTransform_24, ConnectingTile_2, ConnectingTileSchema;
    var __moduleName = context_110 && context_110.id;
    return {
        setters: [
            function (point_60_1) {
                point_60 = point_60_1;
            },
            function (TileTransform_24_1) {
                TileTransform_24 = TileTransform_24_1;
            },
            function (ConnectingTile_2_1) {
                ConnectingTile_2 = ConnectingTile_2_1;
            }
        ],
        execute: function () {
            /**
             * Defines how a type of connecting tiles interacts with other types of connecting tiles.
             * TODO: This could probably be a lot better and support more complex connecting logic
             * TODO: Move this out of engine
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
                    var n = this.get(grid, new point_60.Point(x, y - 1));
                    var s = this.get(grid, new point_60.Point(x, y + 1));
                    var e = this.get(grid, new point_60.Point(x + 1, y));
                    var w = this.get(grid, new point_60.Point(x - 1, y));
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
                    return result.toImageRender(new TileTransform_24.TileTransform(position.times(result.dimensions.x), null, rotation, false, false, Number.MIN_SAFE_INTEGER));
                };
                ConnectingTileSchema.prototype.get = function (grid, pt) {
                    var el = grid.get(pt);
                    if (el) {
                        var ct = el.entity.getComponent(ConnectingTile_2.ConnectingTile);
                        if (ct && ct.schema.canConnect(this)) {
                            return ct;
                        }
                    }
                };
                return ConnectingTileSchema;
            }());
            exports_110("ConnectingTileSchema", ConnectingTileSchema);
        }
    };
});
System.register("engine/tiles/ConnectingTile", ["engine/point", "engine/component"], function (exports_111, context_111) {
    "use strict";
    var point_61, component_29, ConnectingTile;
    var __moduleName = context_111 && context_111.id;
    return {
        setters: [
            function (point_61_1) {
                point_61 = point_61_1;
            },
            function (component_29_1) {
                component_29 = component_29_1;
            }
        ],
        execute: function () {
            ConnectingTile = /** @class */ (function (_super) {
                __extends(ConnectingTile, _super);
                /**
                 * Connecting tiles require a tile grid. The position parameter should be tile-scale, not pixel-scale.
                 */
                function ConnectingTile(schema, grid, position) {
                    if (position === void 0) { position = new point_61.Point(0, 0); }
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
            }(component_29.Component));
            exports_111("ConnectingTile", ConnectingTile);
        }
    };
});
/*
* A speed-improved perlin and simplex noise algorithms for 2D.
*
* Based on example code by Stefan Gustavson (stegu@itn.liu.se).
* Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
* Better rank ordering method by Stefan Gustavson in 2012.
* Converted to Javascript by Joseph Gentle.
*
* Version 2012-03-09
*
* This code was placed in the public domain by its original author,
* Stefan Gustavson. You may use it as you see fit, but
* attribution is appreciated.
*
*/
System.register("engine/util/Noise", [], function (exports_112, context_112) {
    "use strict";
    var grad3, p, perm, gradP, Noise;
    var __moduleName = context_112 && context_112.id;
    // All noise functions return values in the range of -1 to 1.
    function Grad(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    return {
        setters: [],
        execute: function () {/*
            * A speed-improved perlin and simplex noise algorithms for 2D.
            *
            * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
            * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
            * Better rank ordering method by Stefan Gustavson in 2012.
            * Converted to Javascript by Joseph Gentle.
            *
            * Version 2012-03-09
            *
            * This code was placed in the public domain by its original author,
            * Stefan Gustavson. You may use it as you see fit, but
            * attribution is appreciated.
            *
            */
            Grad.prototype.dot2 = function (x, y) {
                return this.x * x + this.y * y;
            };
            Grad.prototype.dot3 = function (x, y, z) {
                return this.x * x + this.y * y + this.z * z;
            };
            grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
                new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
                new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];
            p = [151, 160, 137, 91, 90, 15,
                131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
                190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
                88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
                77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
                102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
                135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
                5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
                223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
                129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
                251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
                49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
                138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
            // To remove the need for index wrapping, double the permutation table length
            perm = new Array(512);
            gradP = new Array(512);
            Noise = /** @class */ (function () {
                function Noise(seed) {
                    // This isn't a very good seeding function, but it works ok. It supports 2^16
                    // different seed values. Write something better if you need more seeds.
                    this.seed = function (seed) {
                        if (seed > 0 && seed < 1) {
                            // Scale the seed out
                            seed *= 65536;
                        }
                        seed = Math.floor(seed);
                        if (seed < 256) {
                            seed |= seed << 8;
                        }
                        for (var i = 0; i < 256; i++) {
                            var v;
                            if (i & 1) {
                                v = p[i] ^ (seed & 255);
                            }
                            else {
                                v = p[i] ^ ((seed >> 8) & 255);
                            }
                            perm[i] = perm[i + 256] = v;
                            gradP[i] = gradP[i + 256] = grad3[v % 12];
                        }
                    };
                    /*
                    for(var i=0; i<256; i++) {
                      perm[i] = perm[i + 256] = p[i];
                      gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
                    }*/
                    // Skewing and unskewing factors for 2, 3, and 4 dimensions
                    this.F2 = 0.5 * (Math.sqrt(3) - 1);
                    this.G2 = (3 - Math.sqrt(3)) / 6;
                    this.F3 = 1 / 3;
                    this.G3 = 1 / 6;
                    // 2D simplex noise
                    this.simplex2 = function (xin, yin) {
                        var n0, n1, n2; // Noise contributions from the three corners
                        // Skew the input space to determine which simplex cell we're in
                        var s = (xin + yin) * this.F2; // Hairy factor for 2D
                        var i = Math.floor(xin + s);
                        var j = Math.floor(yin + s);
                        var t = (i + j) * this.G2;
                        var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
                        var y0 = yin - j + t;
                        // For the 2D case, the simplex shape is an equilateral triangle.
                        // Determine which simplex we are in.
                        var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
                        if (x0 > y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
                            i1 = 1;
                            j1 = 0;
                        }
                        else { // upper triangle, YX order: (0,0)->(0,1)->(1,1)
                            i1 = 0;
                            j1 = 1;
                        }
                        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
                        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
                        // c = (3-sqrt(3))/6
                        var x1 = x0 - i1 + this.G2; // Offsets for middle corner in (x,y) unskewed coords
                        var y1 = y0 - j1 + this.G2;
                        var x2 = x0 - 1 + 2 * this.G2; // Offsets for last corner in (x,y) unskewed coords
                        var y2 = y0 - 1 + 2 * this.G2;
                        // Work out the hashed gradient indices of the three simplex corners
                        i &= 255;
                        j &= 255;
                        var gi0 = gradP[i + perm[j]];
                        var gi1 = gradP[i + i1 + perm[j + j1]];
                        var gi2 = gradP[i + 1 + perm[j + 1]];
                        // Calculate the contribution from the three corners
                        var t0 = 0.5 - x0 * x0 - y0 * y0;
                        if (t0 < 0) {
                            n0 = 0;
                        }
                        else {
                            t0 *= t0;
                            n0 = t0 * t0 * gi0.dot2(x0, y0); // (x,y) of grad3 used for 2D gradient
                        }
                        var t1 = 0.5 - x1 * x1 - y1 * y1;
                        if (t1 < 0) {
                            n1 = 0;
                        }
                        else {
                            t1 *= t1;
                            n1 = t1 * t1 * gi1.dot2(x1, y1);
                        }
                        var t2 = 0.5 - x2 * x2 - y2 * y2;
                        if (t2 < 0) {
                            n2 = 0;
                        }
                        else {
                            t2 *= t2;
                            n2 = t2 * t2 * gi2.dot2(x2, y2);
                        }
                        // Add contributions from each corner to get the final noise value.
                        // The result is scaled to return values in the interval [-1,1].
                        return 70 * (n0 + n1 + n2);
                    };
                    // 3D simplex noise
                    this.simplex3 = function (xin, yin, zin) {
                        var n0, n1, n2, n3; // Noise contributions from the four corners
                        // Skew the input space to determine which simplex cell we're in
                        var s = (xin + yin + zin) * this.F3; // Hairy factor for 2D
                        var i = Math.floor(xin + s);
                        var j = Math.floor(yin + s);
                        var k = Math.floor(zin + s);
                        var t = (i + j + k) * this.G3;
                        var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
                        var y0 = yin - j + t;
                        var z0 = zin - k + t;
                        // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
                        // Determine which simplex we are in.
                        var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
                        var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
                        if (x0 >= y0) {
                            if (y0 >= z0) {
                                i1 = 1;
                                j1 = 0;
                                k1 = 0;
                                i2 = 1;
                                j2 = 1;
                                k2 = 0;
                            }
                            else if (x0 >= z0) {
                                i1 = 1;
                                j1 = 0;
                                k1 = 0;
                                i2 = 1;
                                j2 = 0;
                                k2 = 1;
                            }
                            else {
                                i1 = 0;
                                j1 = 0;
                                k1 = 1;
                                i2 = 1;
                                j2 = 0;
                                k2 = 1;
                            }
                        }
                        else {
                            if (y0 < z0) {
                                i1 = 0;
                                j1 = 0;
                                k1 = 1;
                                i2 = 0;
                                j2 = 1;
                                k2 = 1;
                            }
                            else if (x0 < z0) {
                                i1 = 0;
                                j1 = 1;
                                k1 = 0;
                                i2 = 0;
                                j2 = 1;
                                k2 = 1;
                            }
                            else {
                                i1 = 0;
                                j1 = 1;
                                k1 = 0;
                                i2 = 1;
                                j2 = 1;
                                k2 = 0;
                            }
                        }
                        // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
                        // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
                        // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
                        // c = 1/6.
                        var x1 = x0 - i1 + this.G3; // Offsets for second corner
                        var y1 = y0 - j1 + this.G3;
                        var z1 = z0 - k1 + this.G3;
                        var x2 = x0 - i2 + 2 * this.G3; // Offsets for third corner
                        var y2 = y0 - j2 + 2 * this.G3;
                        var z2 = z0 - k2 + 2 * this.G3;
                        var x3 = x0 - 1 + 3 * this.G3; // Offsets for fourth corner
                        var y3 = y0 - 1 + 3 * this.G3;
                        var z3 = z0 - 1 + 3 * this.G3;
                        // Work out the hashed gradient indices of the four simplex corners
                        i &= 255;
                        j &= 255;
                        k &= 255;
                        var gi0 = gradP[i + perm[j + perm[k]]];
                        var gi1 = gradP[i + i1 + perm[j + j1 + perm[k + k1]]];
                        var gi2 = gradP[i + i2 + perm[j + j2 + perm[k + k2]]];
                        var gi3 = gradP[i + 1 + perm[j + 1 + perm[k + 1]]];
                        // Calculate the contribution from the four corners
                        var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
                        if (t0 < 0) {
                            n0 = 0;
                        }
                        else {
                            t0 *= t0;
                            n0 = t0 * t0 * gi0.dot3(x0, y0, z0); // (x,y) of grad3 used for 2D gradient
                        }
                        var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
                        if (t1 < 0) {
                            n1 = 0;
                        }
                        else {
                            t1 *= t1;
                            n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
                        }
                        var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
                        if (t2 < 0) {
                            n2 = 0;
                        }
                        else {
                            t2 *= t2;
                            n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
                        }
                        var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
                        if (t3 < 0) {
                            n3 = 0;
                        }
                        else {
                            t3 *= t3;
                            n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
                        }
                        // Add contributions from each corner to get the final noise value.
                        // The result is scaled to return values in the interval [-1,1].
                        return 32 * (n0 + n1 + n2 + n3);
                    };
                    // 2D Perlin Noise
                    this.perlin2 = function (x, y) {
                        // Find unit grid cell containing point
                        var X = Math.floor(x), Y = Math.floor(y);
                        // Get relative xy coordinates of point within that cell
                        x = x - X;
                        y = y - Y;
                        // Wrap the integer cells at 255 (smaller integer period can be introduced here)
                        X = X & 255;
                        Y = Y & 255;
                        // Calculate noise contributions from each of the four corners
                        var n00 = gradP[X + perm[Y]].dot2(x, y);
                        var n01 = gradP[X + perm[Y + 1]].dot2(x, y - 1);
                        var n10 = gradP[X + 1 + perm[Y]].dot2(x - 1, y);
                        var n11 = gradP[X + 1 + perm[Y + 1]].dot2(x - 1, y - 1);
                        // Compute the fade curve value for x
                        var u = this.fade(x);
                        // Interpolate the four results
                        return this.lerp(this.lerp(n00, n10, u), this.lerp(n01, n11, u), this.fade(y));
                    };
                    // 3D Perlin Noise
                    this.perlin3 = function (x, y, z) {
                        // Find unit grid cell containing point
                        var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
                        // Get relative xyz coordinates of point within that cell
                        x = x - X;
                        y = y - Y;
                        z = z - Z;
                        // Wrap the integer cells at 255 (smaller integer period can be introduced here)
                        X = X & 255;
                        Y = Y & 255;
                        Z = Z & 255;
                        // Calculate noise contributions from each of the eight corners
                        var n000 = gradP[X + perm[Y + perm[Z]]].dot3(x, y, z);
                        var n001 = gradP[X + perm[Y + perm[Z + 1]]].dot3(x, y, z - 1);
                        var n010 = gradP[X + perm[Y + 1 + perm[Z]]].dot3(x, y - 1, z);
                        var n011 = gradP[X + perm[Y + 1 + perm[Z + 1]]].dot3(x, y - 1, z - 1);
                        var n100 = gradP[X + 1 + perm[Y + perm[Z]]].dot3(x - 1, y, z);
                        var n101 = gradP[X + 1 + perm[Y + perm[Z + 1]]].dot3(x - 1, y, z - 1);
                        var n110 = gradP[X + 1 + perm[Y + 1 + perm[Z]]].dot3(x - 1, y - 1, z);
                        var n111 = gradP[X + 1 + perm[Y + 1 + perm[Z + 1]]].dot3(x - 1, y - 1, z - 1);
                        // Compute the fade curve value for x, y, z
                        var u = this.fade(x);
                        var v = this.fade(y);
                        var w = this.fade(z);
                        // Interpolate
                        return this.lerp(this.lerp(this.lerp(n000, n100, u), this.lerp(n001, n101, u), w), this.lerp(this.lerp(n010, n110, u), this.lerp(n011, n111, u), w), v);
                    };
                    this.seed(seed);
                }
                // ##### Perlin noise stuff
                Noise.prototype.fade = function (t) {
                    return t * t * t * (t * (t * 6 - 15) + 10);
                };
                Noise.prototype.lerp = function (a, b, t) {
                    return (1 - t) * a + t * b;
                };
                return Noise;
            }());
            exports_112("Noise", Noise);
        }
    };
});
System.register("game/world/MapGenerator", ["engine/point", "engine/tiles/ConnectingTile", "engine/collision/BoxCollider", "game/world/LocationManager", "game/world/ground/Ground", "engine/util/Noise", "engine/util/Grid", "game/graphics/Tilesets"], function (exports_113, context_113) {
    "use strict";
    var point_62, ConnectingTile_3, BoxCollider_8, LocationManager_17, Ground_3, Noise_1, Grid_4, Tilesets_36, MapGenerator;
    var __moduleName = context_113 && context_113.id;
    return {
        setters: [
            function (point_62_1) {
                point_62 = point_62_1;
            },
            function (ConnectingTile_3_1) {
                ConnectingTile_3 = ConnectingTile_3_1;
            },
            function (BoxCollider_8_1) {
                BoxCollider_8 = BoxCollider_8_1;
            },
            function (LocationManager_17_1) {
                LocationManager_17 = LocationManager_17_1;
            },
            function (Ground_3_1) {
                Ground_3 = Ground_3_1;
            },
            function (Noise_1_1) {
                Noise_1 = Noise_1_1;
            },
            function (Grid_4_1) {
                Grid_4 = Grid_4_1;
            },
            function (Tilesets_36_1) {
                Tilesets_36 = Tilesets_36_1;
            }
        ],
        execute: function () {
            MapGenerator = /** @class */ (function () {
                function MapGenerator() {
                    this.location = LocationManager_17.LocationManager.instance.newLocation(false);
                    this.tentPos = new point_62.Point(-3, -3);
                }
                MapGenerator.prototype.doIt = function () {
                    // spawn tent
                    this.location.addWorldElement(2 /* TENT */, this.tentPos, { color: "red" /* RED */ });
                    // make the ground
                    // this.renderPath(new Point(-10, -10), new Point(10, 10), 2)
                    // this.renderPath(new Point(10, -10), new Point(-10, 10), 5)
                    this.spawnTrees();
                    this.spawnRocks();
                    this.clearPathToCenter();
                    // TODO short trees, bushes, fruit, tall grass, etc
                    // spawn grass last, stuff checks for existing paths prior to this by the lack of ground items
                    this.placeGrass();
                    return this.location;
                };
                MapGenerator.prototype.spawnTrees = function () {
                    var _this = this;
                    var trees = Math.random() * 300 + 150;
                    for (var i = 0; i < trees; i++) {
                        var pt = new point_62.Point(Math.floor(Math.random() * MapGenerator.MAP_SIZE) - MapGenerator.MAP_SIZE / 2, Math.floor(Math.random() * (MapGenerator.MAP_SIZE - 1)) - MapGenerator.MAP_SIZE / 2);
                        var occupiedPoints = [pt, pt.plus(new point_62.Point(0, 1))];
                        if (occupiedPoints.every(function (p) { return !_this.location.ground.get(p); })) {
                            this.location.addWorldElement(0 /* TREE */, pt);
                        }
                    }
                };
                MapGenerator.prototype.clearPathToCenter = function () {
                    var typesToClear = [1 /* ROCK */, 0 /* TREE */];
                    // clear in corner
                    for (var x = MapGenerator.MAP_SIZE / 2 - 11; x < MapGenerator.MAP_SIZE / 2; x++) {
                        for (var y = MapGenerator.MAP_SIZE / 2 - 10; y < MapGenerator.MAP_SIZE / 2 - 8; y++) {
                            var element = this.location.elements.get(new point_62.Point(x, y));
                            if (!!element && typesToClear.indexOf(element.type) !== -1) {
                                this.location.elements.removeAll(element);
                            }
                        }
                    }
                    // clear around tent
                    var clearingCorner = this.tentPos.minus(new point_62.Point(1, 0));
                    for (var x = 0; x < 6; x++) {
                        for (var y = 0; y < 4; y++) {
                            var element = this.location.elements.get(clearingCorner.plus(new point_62.Point(x, y)));
                            if (!!element && typesToClear.indexOf(element.type) !== -1) {
                                this.location.elements.removeAll(element);
                            }
                        }
                    }
                };
                MapGenerator.prototype.spawnRocks = function () {
                    var placedRocks = 0;
                    while (placedRocks < 20) {
                        var p = new point_62.Point(Math.floor(Math.random() * MapGenerator.MAP_SIZE) - MapGenerator.MAP_SIZE / 2, Math.floor(Math.random() * (MapGenerator.MAP_SIZE)) - MapGenerator.MAP_SIZE / 2);
                        if (!this.location.ground.get(p) && this.location.addWorldElement(1 /* ROCK */, p)) {
                            placedRocks++;
                        }
                    }
                };
                MapGenerator.prototype.renderPath = function (start, end, randomness) {
                    var _this = this;
                    var ground = this.location.ground;
                    var stuff = this.location.elements;
                    var heuristic = function (pt) {
                        var v = pt.distanceTo(end) * Math.random() * randomness;
                        var el = ground.get(pt);
                        if (!el) {
                            return v;
                        }
                        var ct = el.entity.getComponent(ConnectingTile_3.ConnectingTile);
                        if (!ct || !ct.schema.canConnect(Ground_3.Ground.instance.PATH_CONNECTING_SCHEMA)) {
                            return v;
                        }
                        var reuseCostMultiplier = 1 / 10;
                        return v * reuseCostMultiplier;
                    };
                    var isOccupiedFunc = function (pt) {
                        var _a;
                        if (!!((_a = stuff.get(pt)) === null || _a === void 0 ? void 0 : _a.entity.getComponent(BoxCollider_8.BoxCollider))) {
                            return true;
                        }
                        var el = ground.get(pt);
                        if (!el) {
                            return false; // definitely not occupied
                        }
                        var ct = el.entity.getComponent(ConnectingTile_3.ConnectingTile);
                        if (!ct) {
                            return true; // can't connect, therefore occupied
                        }
                        return !Ground_3.Ground.instance.PATH_CONNECTING_SCHEMA.canConnect(ct.schema);
                    };
                    var path = ground.findPath(start, end, heuristic, isOccupiedFunc);
                    if (!path) {
                        return;
                    }
                    path.forEach(function (pt) { return _this.location.addGroundElement(3 /* PATH */, pt); });
                };
                MapGenerator.prototype.placeGrass = function () {
                    // const levels = this.noise()
                    for (var i = -MapGenerator.MAP_SIZE / 2; i < MapGenerator.MAP_SIZE / 2; i++) {
                        for (var j = -MapGenerator.MAP_SIZE / 2; j < MapGenerator.MAP_SIZE / 2; j++) {
                            var pt = new point_62.Point(i, j);
                            // TODO revisit levels
                            // const thisLevel = levels.get(pt)
                            var isLedge = false; //[pt.plusY(1), pt.plusY(-1), pt.plusX(1), pt.plusX(-1)]
                            // .map(pt => levels.get(pt))
                            // .some(level => level < thisLevel)
                            if (isLedge) {
                                this.location.addGroundElement(4 /* LEDGE */, pt);
                            }
                            else {
                                this.location.addGroundElement(2 /* GRASS */, pt);
                            }
                        }
                    }
                };
                MapGenerator.prototype.noise = function () {
                    var noise = new Noise_1.Noise(Math.random());
                    var grid = new Grid_4.Grid();
                    var str = "";
                    for (var i = -MapGenerator.MAP_SIZE / 2; i < MapGenerator.MAP_SIZE / 2; i++) {
                        for (var j = -MapGenerator.MAP_SIZE / 2; j < MapGenerator.MAP_SIZE / 2; j++) {
                            var value = noise.simplex2(i / 100, j / 100);
                            var v = (Math.floor(2 * (value + 1)));
                            str += v;
                            grid.set(new point_62.Point(j, i), v);
                        }
                        str += "\n";
                    }
                    console.log(str);
                    return grid;
                };
                MapGenerator.MAP_SIZE = 70;
                MapGenerator.ENTER_LAND_POS = new point_62.Point(1, 1).times(MapGenerator.MAP_SIZE / 2 * Tilesets_36.TILE_SIZE).plusY(-Tilesets_36.TILE_SIZE * 10).plusX(Tilesets_36.TILE_SIZE * 2);
                return MapGenerator;
            }());
            exports_113("MapGenerator", MapGenerator);
        }
    };
});
System.register("game/cutscenes/IntroCutscene", ["engine/component", "game/cutscenes/CutscenePlayerController", "game/characters/Player", "engine/point", "game/cutscenes/Camera", "game/cutscenes/CutsceneManager", "game/world/LocationManager", "game/ui/ControlsUI"], function (exports_114, context_114) {
    "use strict";
    var component_30, CutscenePlayerController_2, Player_12, point_63, Camera_7, CutsceneManager_2, LocationManager_18, ControlsUI_2, IntroCutscene;
    var __moduleName = context_114 && context_114.id;
    return {
        setters: [
            function (component_30_1) {
                component_30 = component_30_1;
            },
            function (CutscenePlayerController_2_1) {
                CutscenePlayerController_2 = CutscenePlayerController_2_1;
            },
            function (Player_12_1) {
                Player_12 = Player_12_1;
            },
            function (point_63_1) {
                point_63 = point_63_1;
            },
            function (Camera_7_1) {
                Camera_7 = Camera_7_1;
            },
            function (CutsceneManager_2_1) {
                CutsceneManager_2 = CutsceneManager_2_1;
            },
            function (LocationManager_18_1) {
                LocationManager_18 = LocationManager_18_1;
            },
            function (ControlsUI_2_1) {
                ControlsUI_2 = ControlsUI_2_1;
            }
        ],
        execute: function () {
            // This is the cutscene that plays when the player arrives in the new land
            IntroCutscene = /** @class */ (function (_super) {
                __extends(IntroCutscene, _super);
                function IntroCutscene() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    // durations in ms
                    _this.STOP_WALKING_IN = 2000;
                    _this.PAN_TO_DIP = _this.STOP_WALKING_IN + 750;
                    _this.PAN_BACK = _this.PAN_TO_DIP + 2000;
                    _this.HIDE_CONTROLS = _this.PAN_BACK + 7000;
                    _this.waitingForOrcsToDie = false;
                    _this.showControls = false;
                    return _this;
                }
                /**
                 * 1. position player in corner
                 * 2. player walks in
                 * 3. camera pan to DIP
                 * 4. camera pan back to player
                 * TODO later (maybe in a separate mechanism?):
                 * 5. combat tutorial
                 * ...
                 * N. Once enemies are dead, progress StoryState and autosave
                 */
                IntroCutscene.prototype.start = function (startData) {
                    var _this = this;
                    CutscenePlayerController_2.CutscenePlayerController.instance.enable();
                    CutscenePlayerController_2.CutscenePlayerController.instance.startMoving(new point_63.Point(-1, 0));
                    this.dip = Array.from(LocationManager_18.LocationManager.instance.currentLocation.dudes).filter(function (d) { return d.type === 1 /* DIP */; })[0];
                    setTimeout(function () {
                        CutscenePlayerController_2.CutscenePlayerController.instance.stopMoving();
                    }, this.STOP_WALKING_IN);
                    setTimeout(function () {
                        Camera_7.Camera.instance.focusOnPoint(_this.dip.standingPosition);
                        CutscenePlayerController_2.CutscenePlayerController.instance.disable();
                    }, this.PAN_TO_DIP);
                    setTimeout(function () {
                        _this.showControls = true;
                        Camera_7.Camera.instance.focusOnDude(Player_12.Player.instance.dude);
                        _this.waitingForOrcsToDie = true;
                    }, this.PAN_BACK);
                    setTimeout(function () {
                        _this.showControls = false;
                    }, this.HIDE_CONTROLS);
                };
                IntroCutscene.prototype.update = function (updateData) {
                    if (!this.waitingForOrcsToDie) {
                        return;
                    }
                    if (!this.orcs) {
                        this.orcs = Array.from(LocationManager_18.LocationManager.instance.currentLocation.dudes).filter(function (d) { return d.faction === 1 /* ORCS */; });
                    }
                    // TODO prevent the player from going to a different location until this is over
                    if (!this.orcs.some(function (o) { return o.isAlive; })) {
                        this.dip.dialogue = 1 /* DIP_0 */;
                        CutsceneManager_2.CutsceneManager.instance.finishCutscene();
                    }
                };
                IntroCutscene.prototype.getRenderMethods = function () {
                    if (this.showControls) {
                        return ControlsUI_2.makeControlsUI(Camera_7.Camera.instance.dimensions, Camera_7.Camera.instance.position);
                    }
                    return [];
                };
                return IntroCutscene;
            }(component_30.Component));
            exports_114("IntroCutscene", IntroCutscene);
        }
    };
});
System.register("game/quest_game", ["engine/point", "engine/game", "game/world/MapGenerator", "game/graphics/Tilesets", "game/characters/DudeFactory", "game/world/LocationManager", "game/characters/Dude", "engine/collision/CollisionEngine", "game/items/DroppedItem", "game/ui/UIStateManager", "game/world/elements/Elements", "game/world/ground/Ground", "game/cutscenes/CutsceneManager", "game/cutscenes/IntroCutscene", "game/cutscenes/Camera", "game/SaveManager", "game/world/PointLightMaskRenderer", "game/world/WorldTime", "game/world/events/EventQueue", "game/world/GroundRenderer"], function (exports_115, context_115) {
    "use strict";
    var point_64, game_1, MapGenerator_5, Tilesets_37, DudeFactory_3, LocationManager_19, Dude_8, CollisionEngine_4, DroppedItem_2, UIStateManager_15, Elements_3, Ground_4, CutsceneManager_3, IntroCutscene_1, Camera_8, SaveManager_4, PointLightMaskRenderer_2, WorldTime_4, EventQueue_4, GroundRenderer_2, ZOOM, QuestGame;
    var __moduleName = context_115 && context_115.id;
    return {
        setters: [
            function (point_64_1) {
                point_64 = point_64_1;
            },
            function (game_1_1) {
                game_1 = game_1_1;
            },
            function (MapGenerator_5_1) {
                MapGenerator_5 = MapGenerator_5_1;
            },
            function (Tilesets_37_1) {
                Tilesets_37 = Tilesets_37_1;
            },
            function (DudeFactory_3_1) {
                DudeFactory_3 = DudeFactory_3_1;
            },
            function (LocationManager_19_1) {
                LocationManager_19 = LocationManager_19_1;
            },
            function (Dude_8_1) {
                Dude_8 = Dude_8_1;
            },
            function (CollisionEngine_4_1) {
                CollisionEngine_4 = CollisionEngine_4_1;
            },
            function (DroppedItem_2_1) {
                DroppedItem_2 = DroppedItem_2_1;
            },
            function (UIStateManager_15_1) {
                UIStateManager_15 = UIStateManager_15_1;
            },
            function (Elements_3_1) {
                Elements_3 = Elements_3_1;
            },
            function (Ground_4_1) {
                Ground_4 = Ground_4_1;
            },
            function (CutsceneManager_3_1) {
                CutsceneManager_3 = CutsceneManager_3_1;
            },
            function (IntroCutscene_1_1) {
                IntroCutscene_1 = IntroCutscene_1_1;
            },
            function (Camera_8_1) {
                Camera_8 = Camera_8_1;
            },
            function (SaveManager_4_1) {
                SaveManager_4 = SaveManager_4_1;
            },
            function (PointLightMaskRenderer_2_1) {
                PointLightMaskRenderer_2 = PointLightMaskRenderer_2_1;
            },
            function (WorldTime_4_1) {
                WorldTime_4 = WorldTime_4_1;
            },
            function (EventQueue_4_1) {
                EventQueue_4 = EventQueue_4_1;
            },
            function (GroundRenderer_2_1) {
                GroundRenderer_2 = GroundRenderer_2_1;
            }
        ],
        execute: function () {
            ZOOM = 3;
            QuestGame = /** @class */ (function (_super) {
                __extends(QuestGame, _super);
                function QuestGame() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                QuestGame.prototype.initialize = function () {
                    CollisionEngine_4.CollisionEngine.instance.setCollisionMatrix(new Map([
                        [CollisionEngine_4.CollisionEngine.DEFAULT_LAYER, [DroppedItem_2.DroppedItem.COLLISION_LAYER, Dude_8.Dude.COLLISION_LAYER]],
                        [Dude_8.Dude.COLLISION_LAYER, [Dude_8.Dude.COLLISION_LAYER]],
                    ]));
                    // Initialize singletons
                    new Tilesets_37.Tilesets();
                    new UIStateManager_15.UIStateManager();
                    new SaveManager_4.SaveManager();
                    new DudeFactory_3.DudeFactory();
                    new Elements_3.Elements();
                    new Ground_4.Ground();
                    new Camera_8.Camera();
                    new CutsceneManager_3.CutsceneManager();
                    new PointLightMaskRenderer_2.PointLightMaskRenderer();
                    new GroundRenderer_2.GroundRenderer();
                    if (!SaveManager_4.SaveManager.instance.load()) {
                        this.newGame();
                    }
                };
                QuestGame.prototype.newGame = function () {
                    new LocationManager_19.LocationManager();
                    new WorldTime_4.WorldTime(WorldTime_4.WorldTime.HOUR * 19.5);
                    new EventQueue_4.EventQueue();
                    // World must be initialized before we do anything else
                    new MapGenerator_5.MapGenerator().doIt();
                    var playerStartPos = MapGenerator_5.MapGenerator.ENTER_LAND_POS;
                    var playerDude = DudeFactory_3.DudeFactory.instance.new(0 /* PLAYER */, playerStartPos);
                    Camera_8.Camera.instance.focusOnDude(playerDude);
                    DudeFactory_3.DudeFactory.instance.new(1 /* DIP */, point_64.Point.ZERO);
                    DudeFactory_3.DudeFactory.instance.new(3 /* ORC_WARRIOR */, new point_64.Point(3, 1).times(Tilesets_37.TILE_SIZE));
                    DudeFactory_3.DudeFactory.instance.new(3 /* ORC_WARRIOR */, new point_64.Point(-1, 3).times(Tilesets_37.TILE_SIZE));
                    DudeFactory_3.DudeFactory.instance.new(3 /* ORC_WARRIOR */, new point_64.Point(-4, 0).times(Tilesets_37.TILE_SIZE));
                    // TODO clean up obstacles (trees, rocks, etc) so intro goes smoothly
                    CutsceneManager_3.CutsceneManager.instance.startCutscene(new IntroCutscene_1.IntroCutscene());
                };
                // entities in the world space
                QuestGame.prototype.getViews = function (updateViewsContext) {
                    // TODO: remove this
                    if (updateViewsContext.input.isKeyDown(76 /* L */)) {
                        DudeFactory_3.DudeFactory.instance.new(3 /* ORC_WARRIOR */, new point_64.Point(40, 30));
                    }
                    this.updateViews(updateViewsContext);
                    return [
                        this.gameEntityView,
                        this.uiView
                    ];
                };
                QuestGame.prototype.updateViews = function (updateViewsContext) {
                    var dimensions = updateViewsContext.dimensions.div(ZOOM);
                    var cameraOffset = Camera_8.Camera.instance.getUpdatedPosition(dimensions, updateViewsContext.elapsedTimeMillis);
                    this.gameEntityView = {
                        zoom: ZOOM,
                        offset: cameraOffset,
                        entities: LocationManager_19.LocationManager.instance.currentLocation.getEntities().concat([
                            CutsceneManager_3.CutsceneManager.instance.getEntity(),
                            WorldTime_4.WorldTime.instance.getEntity(),
                            PointLightMaskRenderer_2.PointLightMaskRenderer.instance.getEntity(),
                            GroundRenderer_2.GroundRenderer.instance.getEntity(),
                        ])
                    };
                    this.uiView = {
                        zoom: ZOOM,
                        offset: point_64.Point.ZERO,
                        entities: UIStateManager_15.UIStateManager.instance.get(dimensions, updateViewsContext.elapsedTimeMillis)
                    };
                };
                return QuestGame;
            }(game_1.Game));
            exports_115("QuestGame", QuestGame);
        }
    };
});
System.register("app", ["game/quest_game", "engine/engine", "game/graphics/Tilesets", "engine/Assets"], function (exports_116, context_116) {
    "use strict";
    var quest_game_1, engine_1, Tilesets_38, Assets_4;
    var __moduleName = context_116 && context_116.id;
    return {
        setters: [
            function (quest_game_1_1) {
                quest_game_1 = quest_game_1_1;
            },
            function (engine_1_1) {
                engine_1 = engine_1_1;
            },
            function (Tilesets_38_1) {
                Tilesets_38 = Tilesets_38_1;
            },
            function (Assets_4_1) {
                Assets_4 = Assets_4_1;
            }
        ],
        execute: function () {
            Assets_4.assets.loadImageFiles(Tilesets_38.Tilesets.getFilesToLoad()).then(function () {
                new engine_1.Engine(new quest_game_1.QuestGame(), document.getElementById('canvas'));
            });
        }
    };
});
System.register("engine/renderer/TintRender", ["engine/renderer/RenderMethod"], function (exports_117, context_117) {
    "use strict";
    var RenderMethod_4, TintRender;
    var __moduleName = context_117 && context_117.id;
    return {
        setters: [
            function (RenderMethod_4_1) {
                RenderMethod_4 = RenderMethod_4_1;
            }
        ],
        execute: function () {
            TintRender = /** @class */ (function (_super) {
                __extends(TintRender, _super);
                function TintRender(color, depth) {
                    var _this = _super.call(this, depth) || this;
                    _this.color = color;
                    return _this;
                }
                TintRender.prototype.render = function (context) {
                    context.fillStyle = this.color;
                    context.fillRect(0, 0, context.width, context.height);
                };
                return TintRender;
            }(RenderMethod_4.RenderMethod));
            exports_117("TintRender", TintRender);
        }
    };
});
System.register("engine/ui/Clickable", ["engine/component", "engine/util/utils"], function (exports_118, context_118) {
    "use strict";
    var component_31, utils_8, Clickable;
    var __moduleName = context_118 && context_118.id;
    return {
        setters: [
            function (component_31_1) {
                component_31 = component_31_1;
            },
            function (utils_8_1) {
                utils_8 = utils_8_1;
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
                    if (updateData.input.isMouseDown && utils_8.rectContains(this.position, this.dimensions, updateData.input.mousePos)) {
                        this.onClick();
                    }
                };
                return Clickable;
            }(component_31.Component));
            exports_118("Clickable", Clickable);
        }
    };
});
System.register("game/saves/SerializeObject", ["engine/profiler", "game/saves/uuid"], function (exports_119, context_119) {
    "use strict";
    var profiler_2, uuid_2, serialize, buildObject;
    var __moduleName = context_119 && context_119.id;
    return {
        setters: [
            function (profiler_2_1) {
                profiler_2 = profiler_2_1;
            },
            function (uuid_2_1) {
                uuid_2 = uuid_2_1;
            }
        ],
        execute: function () {
            /**
             * Serializes an object and removes all circular references
             */
            exports_119("serialize", serialize = function (object) {
                var resultObject = {}; // maps string->object with subobjects as uuids
                var topLevelUuidMap = {}; // maps string->object with subobjects as uuids
                var objectUuidMap = new Map(); // maps unique object ref to uuid
                var buildDuration = profiler_2.measure(function () { return buildObject(object, resultObject, topLevelUuidMap, objectUuidMap); })[0];
                console.log("obj built in " + buildDuration);
                return JSON.stringify({
                    uuids: topLevelUuidMap,
                    obj: resultObject
                }, undefined, 4);
            });
            buildObject = function (object, resultObject, topLevelUuidMap, objectUuidMap) {
                var stack = [];
                stack.push({ object: object, resultObject: resultObject });
                var _loop_3 = function () {
                    var _a = stack.pop(), object_1 = _a.object, resultObject_1 = _a.resultObject;
                    Object.keys(object_1).forEach(function (k) {
                        if (object_1 instanceof Object) {
                            var uuid = objectUuidMap.get(object_1);
                            if (!!uuid) { // we have already traversed this object
                                console.log("seen " + uuid);
                                resultObject_1[k] = uuid;
                            }
                            else {
                                uuid = uuid_2.newUUID();
                                resultObject_1[k] = uuid;
                                objectUuidMap.set(object_1, uuid);
                                topLevelUuidMap[uuid] = {};
                                stack.push({
                                    object: object_1[k],
                                    resultObject: topLevelUuidMap[uuid]
                                });
                            }
                        }
                        else {
                            resultObject_1[k] = object_1;
                        }
                    });
                };
                while (stack.length > 0) {
                    _loop_3();
                }
            };
        }
    };
});
System.register("game/ui/StringTiles", ["engine/component", "game/graphics/Tilesets", "engine/tiles/TileTransform", "engine/point"], function (exports_120, context_120) {
    "use strict";
    var component_32, Tilesets_39, TileTransform_25, point_65, StringTiles;
    var __moduleName = context_120 && context_120.id;
    return {
        setters: [
            function (component_32_1) {
                component_32 = component_32_1;
            },
            function (Tilesets_39_1) {
                Tilesets_39 = Tilesets_39_1;
            },
            function (TileTransform_25_1) {
                TileTransform_25 = TileTransform_25_1;
            },
            function (point_65_1) {
                point_65 = point_65_1;
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
                        return Tilesets_39.Tilesets.instance.oneBit.getTileSource(c).toImageRender(new TileTransform_25.TileTransform(_this.topLeftPos.plus(new point_65.Point(10 * i, 0))));
                    });
                };
                StringTiles.prototype.clear = function () {
                    this.say("");
                };
                StringTiles.prototype.getRenderMethods = function () {
                    return this.tiles;
                };
                return StringTiles;
            }(component_32.Component));
            exports_120("StringTiles", StringTiles);
        }
    };
});
