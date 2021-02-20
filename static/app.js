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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
                Point.prototype.manhattanDistanceTo = function (pt) {
                    return Math.abs(pt.x - this.x) + Math.abs(pt.y - this.y);
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
                /**
                 * Returns a new point which has been slightly shifted a random amount
                 * @param xRandom The new x will be shifted a relative distance of [-xRandom, xRandom]
                 * @param yRandom The new y will be shifted a relative distance of [-yRandom, yRandom]
                 *                If omitted, this will be the same as xRandom
                 */
                Point.prototype.randomlyShifted = function (xRandom, yRandom) {
                    if (yRandom === void 0) { yRandom = xRandom; }
                    return this.plus(new Point(xRandom - Math.random() * xRandom * 2, yRandom - Math.random() * yRandom * 2));
                };
                Point.ZERO = new Point(0, 0);
                return Point;
            }());
            exports_1("Point", Point);
        }
    };
});
System.register("engine/util/utils", [], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    function rectContains(rectPosition, rectDimensions, pt) {
        return pt.x >= rectPosition.x && pt.x < rectPosition.x + rectDimensions.x
            && pt.y >= rectPosition.y && pt.y < rectPosition.y + rectDimensions.y;
    }
    exports_2("rectContains", rectContains);
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
System.register("engine/Entity", [], function (exports_3, context_3) {
    "use strict";
    var Entity, NO_COMPONENT;
    var __moduleName = context_3 && context_3.id;
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
                    this.componentCache = new Map();
                    components.forEach(function (c) { return _this.addComponent(c); });
                }
                Entity.prototype.addComponent = function (component) {
                    if (!component) {
                        return;
                    }
                    this.componentCache.clear();
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
                    var value = this.componentCache.get(componentType);
                    if (!value || value === NO_COMPONENT) {
                        value = this.getComponents(componentType)[0];
                        this.componentCache.set(componentType, value !== null && value !== void 0 ? value : NO_COMPONENT);
                    }
                    return value;
                };
                Entity.prototype.getComponents = function (componentType) {
                    return this.components.filter(function (c) { return c instanceof componentType; }).map(function (c) { return c; });
                };
                Entity.prototype.removeComponent = function (component) {
                    this.componentCache.clear();
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
            exports_3("Entity", Entity);
            NO_COMPONENT = {};
        }
    };
});
System.register("engine/View", ["engine/point"], function (exports_4, context_4) {
    "use strict";
    var point_1, View;
    var __moduleName = context_4 && context_4.id;
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
            exports_4("View", View);
        }
    };
});
System.register("engine/renderer/RenderContext", ["engine/point"], function (exports_5, context_5) {
    "use strict";
    var point_2, RenderContext;
    var __moduleName = context_5 && context_5.id;
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
                    this.width = canvas.width;
                    this.height = canvas.height;
                }
                Object.defineProperty(RenderContext.prototype, "lineWidth", {
                    set: function (value) { this.context.lineWidth = value; },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(RenderContext.prototype, "strokeStyle", {
                    set: function (value) { this.context.strokeStyle = value; },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(RenderContext.prototype, "font", {
                    set: function (value) { this.context.font = value; },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(RenderContext.prototype, "fillStyle", {
                    set: function (value) { this.context.fillStyle = value; },
                    enumerable: false,
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
                RenderContext.prototype.fillRect = function (pos, dimensions) {
                    pos = pos.plus(this.view.offset).times(this.view.zoom);
                    dimensions = dimensions.times(this.view.zoom);
                    this.context.fillRect(pos.x, pos.y, dimensions.x, dimensions.y);
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
            exports_5("RenderContext", RenderContext);
        }
    };
});
System.register("engine/renderer/RenderMethod", [], function (exports_6, context_6) {
    "use strict";
    var RenderMethod;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [],
        execute: function () {
            RenderMethod = /** @class */ (function () {
                function RenderMethod(depth) {
                    this.depth = depth;
                }
                return RenderMethod;
            }());
            exports_6("RenderMethod", RenderMethod);
        }
    };
});
System.register("engine/component", [], function (exports_7, context_7) {
    "use strict";
    var Component, ALREADY_STARTED_COMPONENT;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [],
        execute: function () {
            Component = /** @class */ (function () {
                function Component() {
                    this.enabled = true;
                }
                Object.defineProperty(Component.prototype, "isStarted", {
                    get: function () { return this.start === ALREADY_STARTED_COMPONENT; },
                    enumerable: false,
                    configurable: true
                });
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
                 * Called on each update step, before rendering
                 */
                Component.prototype.update = function (updateData) { };
                /**
                 * Called on each update step, after rendering
                 */
                Component.prototype.lateUpdate = function (updateData) { };
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
            exports_7("Component", Component);
            exports_7("ALREADY_STARTED_COMPONENT", ALREADY_STARTED_COMPONENT = function () {
                throw new Error("start() has already been called on this component");
            });
        }
    };
});
System.register("engine/debug", [], function (exports_8, context_8) {
    "use strict";
    var _debug, debug;
    var __moduleName = context_8 && context_8.id;
    function loadDebug() {
        var stored = localStorage.getItem("debug_state");
        if (stored) {
            console.log("loaded debug state from local storage");
            return JSON.parse(stored);
        }
        return {};
    }
    return {
        setters: [],
        execute: function () {
            _debug = Object.assign({}, {
                showColliders: false,
                showProfiler: false
            }, loadDebug());
            exports_8("debug", debug = new Proxy(_debug, {
                set: function (target, property, value, receiver) {
                    var success = Reflect.set(target, property, value, receiver);
                    if (success) {
                        localStorage.setItem("debug_state", JSON.stringify(_debug));
                    }
                    return success;
                }
            }));
            window['debug'] = debug;
        }
    };
});
System.register("engine/renderer/LineRender", ["engine/renderer/RenderMethod"], function (exports_9, context_9) {
    "use strict";
    var RenderMethod_1, LineRender;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (RenderMethod_1_1) {
                RenderMethod_1 = RenderMethod_1_1;
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
            }(RenderMethod_1.RenderMethod));
            exports_9("LineRender", LineRender);
        }
    };
});
System.register("engine/collision/Collider", ["engine/component", "engine/debug", "engine/point", "engine/renderer/LineRender", "engine/collision/CollisionEngine"], function (exports_10, context_10) {
    "use strict";
    var component_1, debug_1, point_3, LineRender_1, CollisionEngine_1, Collider;
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [
            function (component_1_1) {
                component_1 = component_1_1;
            },
            function (debug_1_1) {
                debug_1 = debug_1_1;
            },
            function (point_3_1) {
                point_3 = point_3_1;
            },
            function (LineRender_1_1) {
                LineRender_1 = LineRender_1_1;
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
                    _this._position = position;
                    _this.layer = layer;
                    _this.ignoredColliders = ignoredColliders;
                    CollisionEngine_1.collisionEngine.markCollider(_this);
                    return _this;
                }
                Object.defineProperty(Collider.prototype, "position", {
                    get: function () { return this._position; },
                    enumerable: false,
                    configurable: true
                });
                Collider.prototype.update = function (updateData) {
                    CollisionEngine_1.collisionEngine.markCollider(this);
                };
                Collider.prototype.moveTo = function (point) {
                    var dx = point.x - this.position.x;
                    var dy = point.y - this.position.y;
                    // TODO: Should these branches be handled by the caller?
                    if (CollisionEngine_1.collisionEngine.canTranslate(this, new point_3.Point(dx, dy))) {
                        this._position = point;
                    }
                    else if (CollisionEngine_1.collisionEngine.canTranslate(this, new point_3.Point(dx, 0))) {
                        this._position = this._position.plus(new point_3.Point(dx, 0));
                    }
                    else if (CollisionEngine_1.collisionEngine.canTranslate(this, new point_3.Point(0, dy))) {
                        this._position = this._position.plus(new point_3.Point(0, dy));
                    }
                    return this.position;
                };
                Collider.prototype.forceSetPosition = function (point) {
                    this._position = point;
                    return this.position;
                };
                Collider.prototype.getRenderMethods = function () {
                    if (!debug_1.debug.showColliders) {
                        return [];
                    }
                    var color = "#ff0000";
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
                        lastPt = pt;
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
                        return new point_3.Point(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
                    }
                    return null;
                };
                return Collider;
            }(component_1.Component));
            exports_10("Collider", Collider);
        }
    };
});
System.register("engine/collision/BoxCollider", ["engine/point", "engine/util/utils", "engine/collision/Collider", "engine/collision/CollisionEngine"], function (exports_11, context_11) {
    "use strict";
    var point_4, utils_1, Collider_1, CollisionEngine_2, BoxCollider;
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [
            function (point_4_1) {
                point_4 = point_4_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (Collider_1_1) {
                Collider_1 = Collider_1_1;
            },
            function (CollisionEngine_2_1) {
                CollisionEngine_2 = CollisionEngine_2_1;
            }
        ],
        execute: function () {
            BoxCollider = /** @class */ (function (_super) {
                __extends(BoxCollider, _super);
                function BoxCollider(position, dimensions, layer, ignoredColliders) {
                    if (layer === void 0) { layer = CollisionEngine_2.CollisionEngine.DEFAULT_LAYER; }
                    if (ignoredColliders === void 0) { ignoredColliders = []; }
                    var _this = _super.call(this, position, layer, ignoredColliders) || this;
                    _this.dimensions = dimensions;
                    return _this;
                }
                BoxCollider.prototype.getPoints = function () {
                    return [
                        new point_4.Point(this.position.x, this.position.y),
                        new point_4.Point(this.position.x + this.dimensions.x, this.position.y),
                        new point_4.Point(this.position.x + this.dimensions.x, this.position.y + this.dimensions.y),
                        new point_4.Point(this.position.x, this.position.y + this.dimensions.y)
                    ];
                };
                BoxCollider.prototype.isWithinBounds = function (pt) {
                    return utils_1.rectContains(this.position, this.dimensions, pt);
                };
                return BoxCollider;
            }(Collider_1.Collider));
            exports_11("BoxCollider", BoxCollider);
        }
    };
});
System.register("engine/collision/CollisionEngine", ["engine/point", "engine/util/utils"], function (exports_12, context_12) {
    "use strict";
    var point_5, utils_2, CollisionEngine, collisionEngine;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [
            function (point_5_1) {
                point_5 = point_5_1;
            },
            function (utils_2_1) {
                utils_2 = utils_2_1;
            }
        ],
        execute: function () {
            CollisionEngine = /** @class */ (function () {
                function CollisionEngine() {
                    this.colliders = [];
                    this.nextUpdateColliders = [];
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
                        return utils_2.rectContains(new point_5.Point(xMax, yMin), new point_5.Point(xMax - xMin, yMax - yMin), pt);
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
                // Returns true if the collider can be translated and will not intersect a non-trigger collider in the new position.
                // This DOES NOT check for any possible colliders in the path of the collision and should only be used for small translations.
                CollisionEngine.prototype.canTranslate = function (collider, translation) {
                    var collidingLayers = this.matrix.get(collider.layer);
                    if (!collidingLayers || collidingLayers.size === 0) { // nothing will ever block this collider
                        return true;
                    }
                    this.removeDanglingColliders();
                    // const translatedPoints = collider.getPoints().map(pt => pt.plus(translation))
                    var bc = collider;
                    var newTranslatedPos = bc.position.plus(translation);
                    return !this.colliders
                        .filter(function (other) {
                        return other !== collider && other.enabled && collidingLayers.has(other.layer)
                            && collider.ignoredColliders.indexOf(other) === -1 && other.ignoredColliders.indexOf(collider) === -1;
                    }) // potential collisions
                        .some(function (other) {
                        // TODO: Support nob-box-colliders
                        var obc = other;
                        return !(newTranslatedPos.x > obc.position.x + obc.dimensions.x ||
                            newTranslatedPos.y > obc.position.y + obc.dimensions.y ||
                            newTranslatedPos.x + bc.dimensions.x < obc.position.x ||
                            newTranslatedPos.y + bc.dimensions.y < obc.position.y);
                        // return translatedPoints.some(pt => other.isWithinBounds(pt))  // TODO 
                        //         || collider.checkWithinBoundsAfterTranslation(translation, other)
                    });
                };
                // unregisters any colliders without an entity
                CollisionEngine.prototype.removeDanglingColliders = function () {
                    var removed = this.colliders.filter(function (other) { return !other.entity; });
                    if (removed.length === 0) {
                        return;
                    }
                    this.colliders = this.colliders.filter(function (other) { return !!other.entity; });
                };
                CollisionEngine.DEFAULT_LAYER = "default";
                return CollisionEngine;
            }());
            exports_12("CollisionEngine", CollisionEngine);
            exports_12("collisionEngine", collisionEngine = new CollisionEngine());
        }
    };
});
System.register("engine/game", [], function (exports_13, context_13) {
    "use strict";
    var Game;
    var __moduleName = context_13 && context_13.id;
    return {
        setters: [],
        execute: function () {
            Game = /** @class */ (function () {
                function Game() {
                }
                Game.prototype.initialize = function () { };
                return Game;
            }());
            exports_13("Game", Game);
        }
    };
});
System.register("engine/input", ["engine/point"], function (exports_14, context_14) {
    "use strict";
    var point_6, Input, CapturedInput;
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [
            function (point_6_1) {
                point_6 = point_6_1;
            }
        ],
        execute: function () {
            Input = /** @class */ (function () {
                function Input(canvas) {
                    var _this = this;
                    this.keys = new Set();
                    this.lastCapture = new CapturedInput();
                    this.mousePos = new point_6.Point(0, 0);
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
                    canvas.onmousemove = function (e) { return _this.mousePos = new point_6.Point(e.x - canvas.offsetLeft, e.y - canvas.offsetTop); };
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
            exports_14("Input", Input);
            CapturedInput = /** @class */ (function () {
                function CapturedInput(keysDown, keysHeld, keysUp, mousePos, isMouseDown, isMouseHeld, isMouseUp, isRightMouseDown, isRightMouseHeld, isRightMouseUp, mouseWheelDeltaY) {
                    if (keysDown === void 0) { keysDown = new Set(); }
                    if (keysHeld === void 0) { keysHeld = new Set(); }
                    if (keysUp === void 0) { keysUp = new Set(); }
                    if (mousePos === void 0) { mousePos = new point_6.Point(0, 0); }
                    if (isMouseDown === void 0) { isMouseDown = false; }
                    if (isMouseHeld === void 0) { isMouseHeld = false; }
                    if (isMouseUp === void 0) { isMouseUp = false; }
                    if (isRightMouseDown === void 0) { isRightMouseDown = false; }
                    if (isRightMouseHeld === void 0) { isRightMouseHeld = false; }
                    if (isRightMouseUp === void 0) { isRightMouseUp = false; }
                    if (mouseWheelDeltaY === void 0) { mouseWheelDeltaY = 0; }
                    this.mousePos = new point_6.Point(0, 0);
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
            exports_14("CapturedInput", CapturedInput);
        }
    };
});
System.register("engine/renderer/TextRender", ["engine/renderer/RenderMethod"], function (exports_15, context_15) {
    "use strict";
    var RenderMethod_2, TextRender;
    var __moduleName = context_15 && context_15.id;
    return {
        setters: [
            function (RenderMethod_2_1) {
                RenderMethod_2 = RenderMethod_2_1;
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
            }(RenderMethod_2.RenderMethod));
            exports_15("TextRender", TextRender);
        }
    };
});
System.register("engine/renderer/BasicRenderComponent", ["engine/component"], function (exports_16, context_16) {
    "use strict";
    var component_2, BasicRenderComponent;
    var __moduleName = context_16 && context_16.id;
    return {
        setters: [
            function (component_2_1) {
                component_2 = component_2_1;
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
            }(component_2.Component));
            exports_16("BasicRenderComponent", BasicRenderComponent);
        }
    };
});
System.register("engine/profiler", ["engine/View", "engine/Entity", "engine/point", "engine/renderer/TextRender", "engine/renderer/BasicRenderComponent"], function (exports_17, context_17) {
    "use strict";
    var View_1, Entity_1, point_7, TextRender_1, BasicRenderComponent_1, Profiler, round, MovingAverage, profiler;
    var __moduleName = context_17 && context_17.id;
    /**
     * Executes the given function and returns the duration it took to execute as well as the result
     */
    function measure(fn) {
        var start = new Date().getTime();
        var result = fn();
        return [new Date().getTime() - start, result];
    }
    exports_17("measure", measure);
    return {
        setters: [
            function (View_1_1) {
                View_1 = View_1_1;
            },
            function (Entity_1_1) {
                Entity_1 = Entity_1_1;
            },
            function (point_7_1) {
                point_7 = point_7_1;
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
                    this.lateUpdateTracker = new MovingAverage();
                    this.tracked = new Map();
                }
                Profiler.prototype.updateEngineTickStats = function (msSinceLastUpdate, msForUpdate, msForRender, msForLateUpdate, componentsUpdated) {
                    this.fpsTracker.record(msSinceLastUpdate);
                    this.updateTracker.record(msForUpdate);
                    this.renderTracker.record(msForRender);
                    this.lateUpdateTracker.record(msForLateUpdate);
                    this.componentsUpdated = componentsUpdated;
                };
                Profiler.prototype.customTrackMovingAverage = function (key, value, displayFn) {
                    var tracker = this.tracked.get(key);
                    if (!tracker) {
                        tracker = [new MovingAverage(), displayFn];
                        this.tracked.set(key, tracker);
                    }
                    tracker[0].record(value);
                };
                Profiler.prototype.getView = function () {
                    var s = __spreadArrays([
                        "FPS: " + round(1000 / this.fpsTracker.get()) + " (" + round(this.fpsTracker.get()) + " ms per frame)",
                        "update() duration ms: " + round(this.updateTracker.get(), 2),
                        "render() duration ms: " + round(this.renderTracker.get(), 2),
                        "lateUpdate() duration ms: " + round(this.lateUpdateTracker.get(), 2),
                        "components updated: " + this.componentsUpdated
                    ], Array.from(this.tracked.values()).map((function (v) { return v[1](v[0].get()); })));
                    return new View_1.View([
                        new Entity_1.Entity(s.map(function (str, i) { return new BasicRenderComponent_1.BasicRenderComponent(new TextRender_1.TextRender(str, new point_7.Point(60, 70 + 25 * i))); }))
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
            exports_17("profiler", profiler = new Profiler());
        }
    };
});
System.register("engine/renderer/Renderer", ["engine/point", "engine/renderer/RenderContext"], function (exports_18, context_18) {
    "use strict";
    var point_8, RenderContext_1, Renderer;
    var __moduleName = context_18 && context_18.id;
    return {
        setters: [
            function (point_8_1) {
                point_8 = point_8_1;
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
                    return new point_8.Point(this.canvas.width, this.canvas.height);
                };
                Renderer.prototype.renderView = function (view) {
                    var viewRenderContext = new RenderContext_1.RenderContext(this.canvas, this.context, view);
                    view.entities
                        .flatMap(function (entity) { return entity === null || entity === void 0 ? void 0 : entity.components; })
                        .filter(function (component) { return !!component && component.enabled && component.isStarted; })
                        .flatMap(function (component) { return component.getRenderMethods(); })
                        .filter(function (render) { return !!render; })
                        .sort(function (a, b) { return a.depth - b.depth; }) // TODO possibly improve this
                        .forEach(function (renderMethod) { return renderMethod.render(viewRenderContext); });
                };
                return Renderer;
            }());
            exports_18("Renderer", Renderer);
        }
    };
});
System.register("engine/engine", ["engine/collision/CollisionEngine", "engine/component", "engine/debug", "engine/input", "engine/profiler", "engine/renderer/Renderer"], function (exports_19, context_19) {
    "use strict";
    var CollisionEngine_3, component_3, debug_2, input_1, profiler_1, Renderer_1, UpdateViewsContext, AwakeData, StartData, UpdateData, Engine;
    var __moduleName = context_19 && context_19.id;
    return {
        setters: [
            function (CollisionEngine_3_1) {
                CollisionEngine_3 = CollisionEngine_3_1;
            },
            function (component_3_1) {
                component_3 = component_3_1;
            },
            function (debug_2_1) {
                debug_2 = debug_2_1;
            },
            function (input_1_1) {
                input_1 = input_1_1;
            },
            function (profiler_1_1) {
                profiler_1 = profiler_1_1;
            },
            function (Renderer_1_1) {
                Renderer_1 = Renderer_1_1;
            }
        ],
        execute: function () {
            UpdateViewsContext = /** @class */ (function () {
                function UpdateViewsContext() {
                }
                return UpdateViewsContext;
            }());
            exports_19("UpdateViewsContext", UpdateViewsContext);
            AwakeData = /** @class */ (function () {
                function AwakeData() {
                }
                return AwakeData;
            }());
            exports_19("AwakeData", AwakeData);
            StartData = /** @class */ (function () {
                function StartData() {
                }
                return StartData;
            }());
            exports_19("StartData", StartData);
            UpdateData = /** @class */ (function () {
                function UpdateData() {
                }
                return UpdateData;
            }());
            exports_19("UpdateData", UpdateData);
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
                    CollisionEngine_3.collisionEngine.nextUpdate();
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
                                if (!c.isStarted) {
                                    c.start(startData);
                                    c.start = component_3.ALREADY_STARTED_COMPONENT;
                                }
                                c.update(updateData);
                                componentsUpdated++;
                            }); });
                        });
                    })[0];
                    var renderDuration = profiler_1.measure(function () {
                        _this.renderer.render(views);
                    })[0];
                    var lateUpdateDuration = profiler_1.measure(function () {
                        views.forEach(function (v) {
                            var updateData = {
                                view: v,
                                elapsedTimeMillis: updateViewsContext.elapsedTimeMillis,
                                input: updateViewsContext.input.scaledForView(v),
                                dimensions: updateViewsContext.dimensions.div(v.zoom)
                            };
                            v.entities.forEach(function (e) { return e.components.forEach(function (c) {
                                c.lateUpdate(updateData);
                            }); });
                        });
                    })[0];
                    if (debug_2.debug.showProfiler) {
                        profiler_1.profiler.updateEngineTickStats(elapsed, updateDuration, renderDuration, lateUpdateDuration, componentsUpdated);
                    }
                    this.lastUpdateMillis = time;
                    requestAnimationFrame(function () { return _this.tick(); });
                };
                Engine.prototype.getViews = function (context) {
                    return this.game.getViews(context).concat(debug_2.debug.showProfiler ? [profiler_1.profiler.getView()] : []);
                };
                return Engine;
            }());
            exports_19("Engine", Engine);
        }
    };
});
System.register("engine/util/Animator", [], function (exports_20, context_20) {
    "use strict";
    var Animator;
    var __moduleName = context_20 && context_20.id;
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
                    this.onFrameChange(0);
                }
                Animator.prototype.update = function (elapsedTimeMillis) {
                    if (this.paused) {
                        return;
                    }
                    this.time += elapsedTimeMillis;
                    while (this.time > this.frames[this.index]) {
                        this.index++;
                        if (this.index === this.frames.length) {
                            this.onFinish();
                            // the onFinish callback might pause the animator, so check again
                            if (this.paused) {
                                return;
                            }
                        }
                        this.index %= this.frames.length;
                        this.time %= this.duration;
                        this.onFrameChange(this.index);
                    }
                };
                Animator.prototype.getCurrentFrame = function () {
                    return this.index;
                };
                Animator.prototype.setCurrentFrame = function (f) {
                    if (f < 0 || f >= this.frames.length) {
                        throw new Error("invalid frame");
                    }
                    this.index = f;
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
            exports_20("Animator", Animator);
        }
    };
});
System.register("engine/renderer/ImageRender", ["engine/renderer/RenderMethod"], function (exports_21, context_21) {
    "use strict";
    var RenderMethod_3, ImageRender;
    var __moduleName = context_21 && context_21.id;
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
            exports_21("ImageRender", ImageRender);
        }
    };
});
System.register("engine/tiles/TileTransform", ["engine/point"], function (exports_22, context_22) {
    "use strict";
    var point_9, TileTransform;
    var __moduleName = context_22 && context_22.id;
    return {
        setters: [
            function (point_9_1) {
                point_9 = point_9_1;
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
                    if (position === void 0) { position = new point_9.Point(0, 0); }
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
                TileTransform.new = function (_a) {
                    var _b = _a.position, position = _b === void 0 ? new point_9.Point(0, 0) : _b, _c = _a.dimensions, dimensions = _c === void 0 ? null : _c, // if null, match the dimensions of the source image
                    _d = _a.rotation, // if null, match the dimensions of the source image
                    rotation = _d === void 0 ? 0 : _d, _e = _a.mirrorX, mirrorX = _e === void 0 ? false : _e, _f = _a.mirrorY, mirrorY = _f === void 0 ? false : _f, _g = _a.depth, depth = _g === void 0 ? 0 : _g;
                    return new TileTransform(position, dimensions, rotation, mirrorX, mirrorY, depth);
                };
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
                        return this.rotatedAround(this.parentTransform.position.plus(new point_9.Point(x, y)), this.parentTransform.centeredPosition, this.parentTransform.rotation);
                    },
                    set: function (value) { this._position = value; },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(TileTransform.prototype, "rotation", {
                    get: function () {
                        if (!this.parentTransform)
                            return this._rotation;
                        return this.parentTransform.rotation + this._rotation * (this.mirrorX ? -1 : 1) * (this.mirrorY ? -1 : 1);
                    },
                    set: function (value) { this._rotation = value; },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(TileTransform.prototype, "mirrorX", {
                    get: function () {
                        if (!this.parentTransform)
                            return this._mirrorX;
                        return this.parentTransform.mirrorX ? !this._mirrorX : this._mirrorX;
                    },
                    set: function (value) { this._mirrorX = value; },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(TileTransform.prototype, "mirrorY", {
                    get: function () {
                        if (!this.parentTransform)
                            return this._mirrorY;
                        return this.parentTransform.mirrorY ? !this._mirrorY : this._mirrorY;
                    },
                    set: function (value) { this._mirrorY = value; },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(TileTransform.prototype, "depth", {
                    get: function () {
                        if (!this.parentTransform)
                            return this._depth;
                        return this.parentTransform.depth + this._depth;
                    },
                    set: function (value) { this._depth = value; },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(TileTransform.prototype, "centeredPosition", {
                    get: function () {
                        return this.position.plus(this.dimensions.div(2));
                    },
                    enumerable: false,
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
                    return new point_9.Point(nx - this.dimensions.x / 2, ny - this.dimensions.y / 2);
                };
                return TileTransform;
            }());
            exports_22("TileTransform", TileTransform);
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
    var point_10, ImageRender_1, TileTransform_1, TileComponent_1, StaticTileSource;
    var __moduleName = context_24 && context_24.id;
    return {
        setters: [
            function (point_10_1) {
                point_10 = point_10_1;
            },
            function (ImageRender_1_1) {
                ImageRender_1 = ImageRender_1_1;
            },
            function (TileTransform_1_1) {
                TileTransform_1 = TileTransform_1_1;
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
                    if (transform === void 0) { transform = new TileTransform_1.TileTransform(); }
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
                    return new StaticTileSource(canvas, point_10.Point.ZERO, this.dimensions);
                };
                return StaticTileSource;
            }());
            exports_24("StaticTileSource", StaticTileSource);
        }
    };
});
System.register("engine/tiles/TileComponent", ["engine/component", "engine/tiles/TileTransform"], function (exports_25, context_25) {
    "use strict";
    var component_4, TileTransform_2, TileComponent;
    var __moduleName = context_25 && context_25.id;
    return {
        setters: [
            function (component_4_1) {
                component_4 = component_4_1;
            },
            function (TileTransform_2_1) {
                TileTransform_2 = TileTransform_2_1;
            }
        ],
        execute: function () {
            /**
             * Represents a static (non-animated) tile entity
             */
            TileComponent = /** @class */ (function (_super) {
                __extends(TileComponent, _super);
                function TileComponent(tileSource, transform) {
                    if (transform === void 0) { transform = new TileTransform_2.TileTransform(); }
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
            }(component_4.Component));
            exports_25("TileComponent", TileComponent);
        }
    };
});
System.register("engine/tiles/TileSetAnimation", ["engine/tiles/TileTransform", "engine/tiles/AnimatedTileComponent"], function (exports_26, context_26) {
    "use strict";
    var TileTransform_3, AnimatedTileComponent_1, TileSetAnimation;
    var __moduleName = context_26 && context_26.id;
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
                function TileSetAnimation(frames, onFinish) {
                    if (onFinish === void 0) { onFinish = function () { }; }
                    this.frames = frames;
                    this.onFinish = onFinish;
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
            exports_26("TileSetAnimation", TileSetAnimation);
        }
    };
});
System.register("engine/tiles/AnimatedTileComponent", ["engine/util/Animator", "engine/tiles/TileComponent", "engine/tiles/TileTransform"], function (exports_27, context_27) {
    "use strict";
    var Animator_1, TileComponent_2, TileTransform_4, AnimatedTileComponent;
    var __moduleName = context_27 && context_27.id;
    return {
        setters: [
            function (Animator_1_1) {
                Animator_1 = Animator_1_1;
            },
            function (TileComponent_2_1) {
                TileComponent_2 = TileComponent_2_1;
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
                    _this.goToAnimation(0);
                    return _this;
                }
                AnimatedTileComponent.prototype.currentFrame = function () {
                    return this.animator.getCurrentFrame();
                };
                AnimatedTileComponent.prototype.goToAnimation = function (animation) {
                    var _this = this;
                    var anim = this.animations[animation];
                    this.animator = new Animator_1.Animator(anim.frames.map(function (f) { return f[1]; }), function (index) {
                        _this.tileSource = anim.getTile(index);
                    }, anim.onFinish);
                    return this;
                };
                AnimatedTileComponent.prototype.pause = function () {
                    this.animator.paused = true;
                };
                AnimatedTileComponent.prototype.play = function () {
                    this.animator.paused = false;
                };
                AnimatedTileComponent.prototype.update = function (updateData) {
                    if (!this.animator.paused) {
                        this.animator.update(updateData.elapsedTimeMillis);
                    }
                };
                AnimatedTileComponent.prototype.fastForward = function (ms) {
                    this.animator.update(Math.floor(ms));
                };
                // This won't currently refresh the animation
                AnimatedTileComponent.prototype.applyFilter = function (filter) {
                    this.animations = this.animations.map(function (a) { return a.filtered(filter); });
                };
                return AnimatedTileComponent;
            }(TileComponent_2.TileComponent));
            exports_27("AnimatedTileComponent", AnimatedTileComponent);
        }
    };
});
System.register("game/ui/Color", [], function (exports_28, context_28) {
    "use strict";
    var getRGB, getHSL;
    var __moduleName = context_28 && context_28.id;
    return {
        setters: [],
        execute: function () {
            exports_28("getRGB", getRGB = function (color) {
                var noHash = color.replace("#", "");
                var r = parseInt(noHash.substring(0, 2), 16);
                var g = parseInt(noHash.substring(2, 4), 16);
                var b = parseInt(noHash.substring(4, 6), 16);
                return [r, g, b];
            });
            exports_28("getHSL", getHSL = function (color) {
                // https://css-tricks.com/converting-color-spaces-in-javascript/
                var rgb = getRGB(color);
                // Make r, g, and b fractions of 1
                var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
                // Find greatest and smallest channel values
                var cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0;
                // Calculate hue
                if (delta == 0)
                    h = 0;
                // Red is max
                else if (cmax == r)
                    h = ((g - b) / delta) % 6;
                // Green is max
                else if (cmax == g)
                    h = (b - r) / delta + 2;
                // Blue is max
                else
                    h = (r - g) / delta + 4;
                h = Math.round(h * 60);
                // Make negative hues positive behind 360°
                if (h < 0)
                    h += 360;
                // Calculate lightness
                l = (cmax + cmin) / 2;
                // Calculate saturation
                s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
                // Multiply l and s by 100
                s = +(s * 100).toFixed(1);
                l = +(l * 100).toFixed(1);
                return [h, s, l];
            });
        }
    };
});
System.register("game/graphics/ImageFilters", ["game/ui/Color", "engine/point"], function (exports_29, context_29) {
    "use strict";
    var Color_1, point_11, ImageFilters;
    var __moduleName = context_29 && context_29.id;
    return {
        setters: [
            function (Color_1_1) {
                Color_1 = Color_1_1;
            },
            function (point_11_1) {
                point_11 = point_11_1;
            }
        ],
        execute: function () {
            exports_29("ImageFilters", ImageFilters = {
                /**
                 * any oldColor pixels will be set to newColor
                 */
                recolor: function (oldColor, newColor) {
                    var rgbOld = Color_1.getRGB(oldColor);
                    var rgbNew = Color_1.getRGB(newColor);
                    return function (img) {
                        var d = img.data;
                        for (var i = 0; i < img.data.length; i += 4) {
                            if (d[i] === rgbOld[0] && d[i + 1] === rgbOld[1] && d[i + 2] === rgbOld[2]) {
                                img.data[i] = rgbNew[0];
                                img.data[i + 1] = rgbNew[1];
                                img.data[i + 2] = rgbNew[2];
                            }
                        }
                    };
                },
                /**
                 * recolors all opaque pixels the given color
                 */
                tint: function (color) {
                    var rgb = Color_1.getRGB(color);
                    return function (img) {
                        for (var i = 0; i < img.data.length; i += 4) {
                            if (img.data[i + 3] !== 0) {
                                img.data[i] = rgb[0];
                                img.data[i + 1] = rgb[1];
                                img.data[i + 2] = rgb[2];
                            }
                        }
                    };
                },
                /**
                 * makes pixels invisible based on the given probability function
                 */
                dissolve: function (dissolveProbabilityFn) {
                    return function (img) {
                        for (var x = 0; x < img.width; x++) {
                            for (var y = 0; y < img.height; y++) {
                                if (Math.random() < dissolveProbabilityFn(new point_11.Point(x, y))) {
                                    var i = (x + y * img.width) * 4;
                                    img.data[i + 3] = 0;
                                }
                            }
                        }
                    };
                },
            });
        }
    };
});
System.register("engine/Assets", [], function (exports_30, context_30) {
    "use strict";
    var Assets, assets;
    var __moduleName = context_30 && context_30.id;
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
                    return this.map.get(fileName);
                };
                return Assets;
            }());
            exports_30("assets", assets = new Assets());
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
                    if (tileSize === void 0) { tileSize = new point_12.Point(16, 16); }
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
                    return new StaticTileSource_1.StaticTileSource(this.image(), new point_12.Point(pos.x * (this.tileSize.x + this.padding), pos.y * (this.tileSize.y + this.padding)), this.tileSize);
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
            map = new Map("\n    wall_top_left 16 0 16 16\n    wall_top_mid 32 0 16 16\n    wall_top_right 48 0 16 16\n\n    wall_left 16 16 16 16\n    wall_mid 32 16 16 16\n    wall_right 48 16 16 16\n\n    wall_fountain_top 64 0 16 16\n    wall_fountain_mid_red_anim 64 16 16 16 3\n    wall_fountain_basin_red_anim 64 32 16 16 3\n    wall_fountain_mid_blue_anim 64 48 16 16 3\n    wall_fountain_basin_blue_anim 64 64 16 16 3\n\n    wall_hole_1 48 32 16 16\n    wall_hole_2 48 48 16 16\n\n    wall_banner_red 16 32 16 16\n    wall_banner_blue 32 32 16 16\n    wall_banner_green 16 48 16 16\n    wall_banner_yellow 32 48 16 16\n\n    column_top 80 80 16 16\n    column_mid 80 96 16 16\n    coulmn_base 80 112 16 16\n    wall_column_top 96 80 16 16\n    wall_column_mid 96 96 16 16\n    wall_coulmn_base 96 112 16 16\n\n    wall_goo 64 80 16 16\n    wall_goo_base 64 96 16 16\n\n    floor_1 16 64 16 16\n    floor_2 32 64 16 16\n    floor_3 48 64 16 16\n    floor_4 16 80 16 16\n    floor_5 32 80 16 16\n    floor_6 48 80 16 16\n    floor_7 16 96 16 16\n    floor_8 32 96 16 16\n    floor_ladder 48 96 16 16\n\n    floor_spikes_anim 16 176 16 16 4\n\n    wall_side_top_left 0 112 16 16\n    wall_side_top_right 16 112 16 16\n    wall_side_mid_left 0 128 16 16\n    wall_side_mid_right 16 128 16 16\n    wall_side_front_left 0 144 16 16\n    wall_side_front_right 16 144 16 16\n\n    wall_corner_top_left 32 112 16 16\n    wall_corner_top_right 48 112 16 16\n    wall_corner_left 32 128 16 16\n    wall_corner_right 48 128 16 16\n    wall_corner_bottom_left 32 144 16 16\n    wall_corner_bottom_right 48 144 16 16\n    wall_corner_front_left 32 160 16 16\n    wall_corner_front_right 48 160 16 16\n\n    wall_inner_corner_l_top_left 80 128 16 16\n    wall_inner_corner_l_top_rigth 64 128 16 16\n    wall_inner_corner_mid_left 80 144 16 16\n    wall_inner_corner_mid_rigth 64 144 16 16\n    wall_inner_corner_t_top_left 80 160 16 16\n    wall_inner_corner_t_top_rigth 64 160 16 16\n\n    edge 96 128 16 16\n    hole  96 144 16 16\n\n    doors_all 16 221 64 35\n    doors_frame_left 16 224 16 32\n    doors_frame_top 32 221 32 3\n    doors_frame_righ 63 224 16 32\n    doors_leaf_closed 32 224 32 32\n    doors_leaf_open 80 224 32 32\n\n    chest_empty_open_anim 304 288 16 16 3\n    chest_full_open_anim 304 304 16 16 3\n    chest_mimic_open_anim 304 320 16 16 3\n\n    flask_big_red 288 224 16 16\n    flask_big_blue 304 224 16 16\n    flask_big_green 320 224 16 16\n    flask_big_yellow 336 224 16 16\n\n    flask_red 288 240 16 16\n    flask_blue 304 240 16 16\n    flask_green 320 240 16 16\n    flask_yellow 336 240 16 16\n\n    skull 288 320 16 16\n    crate 288 298 16 22\n\n    shield_0 288 336 16 16\n    shield_1 304 336 16 16\n    shield_2 320 336 16 16\n    shield_3 336 336 16 16\n    shield_4 288 352 16 16\n    shield_5 304 352 16 16\n    shield_6 320 352 16 16\n    shield_7 336 352 16 16\n    shield_8 288 368 16 16\n    shield_9 304 368 16 16\n    shield_10 320 368 16 16\n    shield_11 336 368 16 16\n\n    coin_anim 288 272 8 8 4\n\n    ui_heart_full 288 256 16 16\n    ui_heart_half 304 256 16 16\n    ui_heart_empty 320 256 16 16\n\n    weapon_knife 293 18 6 13\n    weapon_rusty_sword 307 26 10 21\n    weapon_regular_sword 323 26 10 21\n    weapon_red_gem_sword 339 26 10 21\n    weapon_big_hammer 291 42 10 37\n    weapon_hammer 307 55 10 24\n    weapon_baton_with_spikes 323 57 10 22\n    weapon_mace 339 55 10 24\n    weapon_katana 293 82 6 29\n    weapon_saw_sword 307 86 10 25\n    weapon_anime_sword 322 81 12 30\n    weapon_axe 341 90 9 21\n    weapon_machete 294 121 5 22\n    weapon_cleaver 310 124 8 19\n    weapon_duel_sword 325 113 9 30\n    weapon_knight_sword 339 114 10 29\n    weapon_golden_sword 291 153 10 22\n    weapon_lavish_sword 307 145 10 30\n    weapon_red_magic_staff 324 145 8 30\n    weapon_green_magic_staff 340 145 8 30\n    weapon_spear 293 177 6 30\n    weapon_pickaxe 303 187 20 20\n\n    tiny_zombie_idle_anim 368 16 16 16 4\n    tiny_zombie_run_anim 432 16 16 16 4\n\n    goblin_idle_anim 368 32 16 16 4\n    goblin_run_anim 432 32 16 16 4\n\n    imp_idle_anim 368 48 16 16 4\n    imp_run_anim 432 48 16 16 4\n\n    skelet_idle_anim 368 80 16 16 4\n    skelet_run_anim 432 80 16 16 4\n\n    muddy_idle_anim 368 112 16 16 4\n    muddy_run_anim 368 112 16 16 4\n\n    swampy_idle_anim 432 112 16 16 4\n    swampy_run_anim 432 112 16 16 4\n\n    zombie_idle_anim 368 144 16 16 4\n    zombie_run_anim 368 144 16 16 4\n\n    ice_zombie_idle_anim 432 144 16 16 4\n    ice_zombie_run_anim 432 144 16 16 4\n\n    masked_orc_idle_anim 368 172 16 20 4\n    masked_orc_run_anim 432 172 16 20 4\n\n    orc_warrior_idle_anim 368 204 16 20 4\n    orc_warrior_run_anim 432 204 16 20 4\n\n    orc_shaman_idle_anim 368 236 16 20 4\n    orc_shaman_run_anim 432 236 16 20 4\n\n    necromancer_idle_anim 368 268 16 20 4\n    necromancer_run_anim 368 268 16 20 4\n\n    wogol_idle_anim 368 300 16 20 4\n    wogol_run_anim 432 300 16 20 4\n\n    chort_idle_anim 368 328 16 24 4\n    chort_run_anim 432 328 16 24 4\n\n    big_zombie_idle_anim 16 270 32 34 4\n    big_zombie_run_anim 144 270 32 34 4\n\n    ogre_idle_anim  16 320 32 32 4\n    ogre_run_anim 144 320 32 32 4\n    \n    big_demon_idle_anim  16 364 32 36 4\n    big_demon_run_anim 144 364 32 36 4\n\n    elf_f_idle_anim 128 4 16 28 4\n    elf_f_run_anim 192 4 16 28 4\n    elf_f_hit_anim 256 4 16 28 1\n\n    elf_m_idle_anim 128 36 16 28 4\n    elf_m_run_anim 192 36 16 28 4\n    elf_m_hit_anim 256 36 16 28 1\n\n    knight_f_idle_anim 128 68 16 28 4\n    knight_f_run_anim 192 68 16 28 4\n    knight_f_hit_anim 256 68 16 28 1\n\n    knight_m_idle_anim 128 100 16 28 4\n    knight_m_run_anim 192 100 16 28 4\n    knight_m_hit_anim 256 100 16 28 1\n\n    wizzard_f_idle_anim 128 132 16 28 4\n    wizzard_f_run_anim 192 132 16 28 4\n    wizzard_f_hit_anim 256 132 16 28 1\n\n    wizzard_m_idle_anim 128 164 16 28 4\n    wizzard_m_run_anim 192 164 16 28 4\n    wizzard_m_hit_anim 256 164 16 28 1\n\n    lizard_f_idle_anim 128 196 16 28 4\n    lizard_f_run_anim 192 196 16 28 4\n    lizard_f_hit_anim 256 196 16 28 1\n\n    lizard_m_idle_anim 128 228 16 28 4\n    lizard_m_run_anim 192 228 16 28 4\n    lizard_m_hit_anim 256 228 16 28 1\n    ".split("\n")
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
                DungeonTilesetII.prototype.getTileSetAnimationFrames = function (key) {
                    var _this = this;
                    var row = map.get(key);
                    if (!row) {
                        return null;
                    }
                    if ((row === null || row === void 0 ? void 0 : row.length) != 5) {
                        throw Error("invalid animation spec");
                    }
                    return Array.from({ length: +row[4] }, function (value, key) { return key; })
                        .map(function (frameIndex) {
                        var pos = new point_13.Point(+row[0] + frameIndex * +row[2], +row[1]);
                        var dim = new point_13.Point(+row[2], +row[3]);
                        return new StaticTileSource_2.StaticTileSource(_this.getFile(), pos, dim);
                    });
                };
                DungeonTilesetII.prototype.getTileSetAnimation = function (key, speed) {
                    var frames = this.getTileSetAnimationFrames(key);
                    if (!frames) {
                        return null;
                    }
                    return new TileSetAnimation_2.TileSetAnimation(frames.map(function (tileSource) { return [tileSource, speed]; }));
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
                    if (!image) {
                        return null;
                    }
                    return new StaticTileSource_3.StaticTileSource(image, new point_14.Point(0, 0), new point_14.Point(image.width, image.height));
                };
                SplitFileTileLoader.prototype.getTileSetAnimation = function (key, frames, speed) {
                    var framesArr = [];
                    for (var i = 1; i <= frames; i++) {
                        var image = this.getTileSource(key + "_" + i);
                        if (!image) {
                            return null;
                        }
                        framesArr.push(image);
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
                        ["treePointy", new point_15.Point(0, 1)],
                        ["treeRound", new point_15.Point(4, 1)],
                        ["spike_club", new point_15.Point(1, 24)],
                        ["axe", new point_15.Point(7, 29)],
                        ["pickaxe", new point_15.Point(11, 27)],
                        ["sword", new point_15.Point(2, 28)],
                        ["spear", new point_15.Point(8, 27)],
                        ["tent", new point_15.Point(6, 20)],
                        ["coin", new point_15.Point(22, 4)],
                        ["wood", new point_15.Point(18, 6)],
                        ["rock", new point_15.Point(5, 2)],
                        ["iron", new point_15.Point(31, 0)],
                        ["mushroom", new point_15.Point(31, 1)],
                        ["house", new point_15.Point(8, 19)],
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
                        ["mushroomPlaced", new point_16.Point(29, 9)],
                        ["mushroom", new point_16.Point(30, 9)],
                        ["treeRoundSapling", new point_16.Point(27, 8)],
                        ["treeRoundSmall", new point_16.Point(15, 9)],
                        ["treeRoundBase", new point_16.Point(15, 11)],
                        ["treeRoundTop", new point_16.Point(15, 10)],
                        ["treePointySapling", new point_16.Point(27, 7)],
                        ["treePointySmall", new point_16.Point(18, 9)],
                        ["treePointyBase", new point_16.Point(18, 11)],
                        ["treePointyTop", new point_16.Point(18, 10)],
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
                        ["grass1", new point_16.Point(22, 10)],
                        ["grass2", new point_16.Point(22, 11)],
                        ["rock1", new point_16.Point(54, 21)],
                        ["rock2", new point_16.Point(55, 21)],
                        ["rock3", new point_16.Point(56, 21)],
                        ["rock1mossy", new point_16.Point(54, 22)],
                        ["rock2mossy", new point_16.Point(55, 22)],
                        ["rock3mossy", new point_16.Point(56, 22)],
                        ["rockItem", new point_16.Point(33, 9)],
                        ["woodItem", new point_16.Point(34, 9)],
                        ["ironItem", new point_16.Point(35, 9)],
                        ["dialogueBG", new point_16.Point(6, 28)],
                        ["invBoxFrame", new point_16.Point(9, 25)],
                        ["placingElementFrame_good", new point_16.Point(3, 28)],
                        ["placingElementFrame_bad", new point_16.Point(0, 28)],
                        ["placingElementFrame_small_good", new point_16.Point(0, 25)],
                        ["placingElementFrame_small_bad", new point_16.Point(1, 25)],
                        ["placingElementFrame_1x2_good_top", new point_16.Point(0, 23)],
                        ["placingElementFrame_1x2_good_bottom", new point_16.Point(0, 24)],
                        ["placingElementFrame_1x2_bad_top", new point_16.Point(1, 23)],
                        ["placingElementFrame_1x2_bad_bottom", new point_16.Point(1, 24)],
                        ["hardwood1", new point_16.Point(8, 2)],
                        ["hardwood2", new point_16.Point(9, 2)],
                        ["hardwood3", new point_16.Point(8, 3)],
                        ["hardwood4", new point_16.Point(9, 3)],
                    ])) || this;
                }
                return OutdoorTileset;
            }(SingleFileTileLoader_2.SingleFileTileLoader));
            exports_35("OutdoorTileset", OutdoorTileset);
        }
    };
});
System.register("game/graphics/ExtraCharacterSet2TileLoader", ["engine/Assets", "engine/point", "engine/tiles/StaticTileSource", "engine/tiles/TileSetAnimation"], function (exports_36, context_36) {
    "use strict";
    var Assets_4, point_17, StaticTileSource_4, TileSetAnimation_4, ROW_WIDTH, ROW_START, TILE_HEIGHT, TILE_WIDTH, CHARACTERS, ExtraCharacterSet2TileLoader;
    var __moduleName = context_36 && context_36.id;
    return {
        setters: [
            function (Assets_4_1) {
                Assets_4 = Assets_4_1;
            },
            function (point_17_1) {
                point_17 = point_17_1;
            },
            function (StaticTileSource_4_1) {
                StaticTileSource_4 = StaticTileSource_4_1;
            },
            function (TileSetAnimation_4_1) {
                TileSetAnimation_4 = TileSetAnimation_4_1;
            }
        ],
        execute: function () {
            ROW_WIDTH = 160;
            ROW_START = 32;
            TILE_HEIGHT = 32;
            TILE_WIDTH = 16;
            // maps to [column, row]
            CHARACTERS = new Map([
                ["prisoner1", [1, 1]],
                ["prisoner2", [1, 3]],
            ]);
            ExtraCharacterSet2TileLoader = /** @class */ (function () {
                function ExtraCharacterSet2TileLoader() {
                }
                ExtraCharacterSet2TileLoader.prototype.getIdleAnimation = function (key, speed) {
                    return this.getAnimation(key, speed, 0);
                };
                ExtraCharacterSet2TileLoader.prototype.getWalkAnimation = function (key, speed) {
                    return this.getAnimation(key, speed, 4);
                };
                ExtraCharacterSet2TileLoader.prototype.getAnimation = function (key, speed, offset) {
                    var _this = this;
                    var result = CHARACTERS.get(key);
                    if (!result) {
                        return null;
                    }
                    var col = result[0];
                    var row = result[1];
                    var pos = new point_17.Point(col * ROW_WIDTH, ROW_START + TILE_HEIGHT * row);
                    return new TileSetAnimation_4.TileSetAnimation(Array.from({ length: 4 }, function (k, v) { return v; })
                        .map(function (index) { return _this.getTileAt(pos.plusX(TILE_WIDTH * (index + offset))); })
                        .map(function (tileSource) { return [tileSource, speed]; }));
                };
                ExtraCharacterSet2TileLoader.prototype.getTileAt = function (pos) {
                    return new StaticTileSource_4.StaticTileSource(this.image(), pos, new point_17.Point(TILE_WIDTH, TILE_HEIGHT));
                };
                ExtraCharacterSet2TileLoader.prototype.image = function () {
                    return Assets_4.assets.getImageByFileName("images/extra_characters.png");
                };
                return ExtraCharacterSet2TileLoader;
            }());
            exports_36("ExtraCharacterSet2TileLoader", ExtraCharacterSet2TileLoader);
        }
    };
});
System.register("game/graphics/OGTileset", ["engine/point", "game/graphics/SingleFileTileLoader"], function (exports_37, context_37) {
    "use strict";
    var point_18, SingleFileTileLoader_3, OGTileset;
    var __moduleName = context_37 && context_37.id;
    return {
        setters: [
            function (point_18_1) {
                point_18 = point_18_1;
            },
            function (SingleFileTileLoader_3_1) {
                SingleFileTileLoader_3 = SingleFileTileLoader_3_1;
            }
        ],
        execute: function () {
            OGTileset = /** @class */ (function (_super) {
                __extends(OGTileset, _super);
                function OGTileset() {
                    return _super.call(this, "images/tilemap.png", new Map([
                        ["wallLeft", new point_18.Point(7, 5)],
                        ["wallCenter", new point_18.Point(8, 5)],
                        ["wallRight", new point_18.Point(9, 5)],
                    ])) || this;
                }
                return OGTileset;
            }(SingleFileTileLoader_3.SingleFileTileLoader));
            exports_37("OGTileset", OGTileset);
        }
    };
});
System.register("game/graphics/Tilesets", ["game/graphics/SingleFileTileLoader", "game/graphics/DungeonTilesetII", "game/graphics/SplitFileTileLoader", "game/graphics/OneBitTileset", "game/graphics/OutdoorTileset", "engine/point", "game/graphics/ExtraCharacterSet2TileLoader", "game/graphics/OGTileset"], function (exports_38, context_38) {
    "use strict";
    var SingleFileTileLoader_4, DungeonTilesetII_1, SplitFileTileLoader_1, OneBitTileset_1, OutdoorTileset_1, point_19, ExtraCharacterSet2TileLoader_1, OGTileset_1, TILE_SIZE, TILE_DIMENSIONS, pixelPtToTilePt, Tilesets;
    var __moduleName = context_38 && context_38.id;
    return {
        setters: [
            function (SingleFileTileLoader_4_1) {
                SingleFileTileLoader_4 = SingleFileTileLoader_4_1;
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
            },
            function (point_19_1) {
                point_19 = point_19_1;
            },
            function (ExtraCharacterSet2TileLoader_1_1) {
                ExtraCharacterSet2TileLoader_1 = ExtraCharacterSet2TileLoader_1_1;
            },
            function (OGTileset_1_1) {
                OGTileset_1 = OGTileset_1_1;
            }
        ],
        execute: function () {
            // standard tile size
            exports_38("TILE_SIZE", TILE_SIZE = 16);
            exports_38("TILE_DIMENSIONS", TILE_DIMENSIONS = new point_19.Point(TILE_SIZE, TILE_SIZE));
            exports_38("pixelPtToTilePt", pixelPtToTilePt = function (pixelPt) {
                return pixelPt.apply(function (n) { return Math.floor(n / TILE_SIZE); });
            });
            /**
             * Manages different tile sources
             */
            Tilesets = /** @class */ (function () {
                function Tilesets() {
                    this.dungeonCharacters = new DungeonTilesetII_1.DungeonTilesetII();
                    this.tilemap = new OGTileset_1.OGTileset();
                    this.dungeonTiles = new SingleFileTileLoader_4.SingleFileTileLoader("images/env_dungeon.png");
                    this.indoorTiles = new SingleFileTileLoader_4.SingleFileTileLoader("images/env_indoor.png");
                    this.outdoorTiles = new OutdoorTileset_1.OutdoorTileset();
                    this.oneBit = new OneBitTileset_1.OneBitTileset();
                    this.extraCharacterSet1 = new SplitFileTileLoader_1.SplitFileTileLoader("images/individual_characters");
                    this.extraCharacterSet2 = new ExtraCharacterSet2TileLoader_1.ExtraCharacterSet2TileLoader();
                    // not allowed
                }
                Object.defineProperty(Tilesets, "instance", {
                    get: function () {
                        if (!this._instance) {
                            this._instance = new Tilesets();
                        }
                        return this._instance;
                    },
                    enumerable: false,
                    configurable: true
                });
                Tilesets.prototype.getBasicTileSource = function (key) {
                    var sources = [this.outdoorTiles, this.tilemap];
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
                        "images/extra_characters.png",
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
                        // "images/individual_characters/Bishop_Idle + Walk_1.png",
                        // "images/individual_characters/Bishop_Idle + Walk_2.png",
                        // "images/individual_characters/Bishop_Idle + Walk_3.png",
                        // "images/individual_characters/Bishop_Idle + Walk_4.png",
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
                        // "images/individual_characters/Fairy_Idle + Walk_1.png",
                        // "images/individual_characters/Fairy_Idle + Walk_2.png",
                        // "images/individual_characters/Fairy_Idle + Walk_3.png",
                        // "images/individual_characters/Fairy_Idle + Walk_4.png",
                        // "images/individual_characters/FatCleric_Idle + Walk_1.png",
                        // "images/individual_characters/FatCleric_Idle + Walk_2.png",
                        // "images/individual_characters/FatCleric_Idle + Walk_3.png",
                        // "images/individual_characters/FatCleric_Idle + Walk_4.png",
                        // "images/individual_characters/FatNun_Idle + Walk_1.png",
                        // "images/individual_characters/FatNun_Idle + Walk_2.png",
                        // "images/individual_characters/FatNun_Idle + Walk_3.png",
                        // "images/individual_characters/FatNun_Idle + Walk_4.png",
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
                        // "images/individual_characters/HighElf_M_Idle + Walk_1.png",
                        // "images/individual_characters/HighElf_M_Idle + Walk_2.png",
                        // "images/individual_characters/HighElf_M_Idle + Walk_3.png",
                        // "images/individual_characters/HighElf_M_Idle + Walk_4.png",
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
                        // "images/individual_characters/MagicShopKeeper_Idle + Walk_1.png",
                        // "images/individual_characters/MagicShopKeeper_Idle + Walk_2.png",
                        // "images/individual_characters/MagicShopKeeper_Idle + Walk_3.png",
                        // "images/individual_characters/MagicShopKeeper_Idle + Walk_4.png",
                        "images/individual_characters/Merchant_Idle_1.png",
                        "images/individual_characters/Merchant_Idle_2.png",
                        "images/individual_characters/Merchant_Idle_3.png",
                        "images/individual_characters/Merchant_Idle_4.png",
                        "images/individual_characters/Merchant_Walk_1.png",
                        "images/individual_characters/Merchant_Walk_2.png",
                        "images/individual_characters/Merchant_Walk_3.png",
                        "images/individual_characters/Merchant_Walk_4.png",
                        // "images/individual_characters/MountainKing_Idle + Walk_1.png",
                        // "images/individual_characters/MountainKing_Idle + Walk_2.png",
                        // "images/individual_characters/MountainKing_Idle + Walk_3.png",
                        // "images/individual_characters/MountainKing_Idle + Walk_4.png",
                        // "images/individual_characters/NormalCleric_Idle + Walk_1.png",
                        // "images/individual_characters/NormalCleric_Idle + Walk_2.png",
                        // "images/individual_characters/NormalCleric_Idle + Walk_3.png",
                        // "images/individual_characters/NormalCleric_Idle + Walk_4.png",
                        "images/individual_characters/NormalMushroom_Idle_1.png",
                        "images/individual_characters/NormalMushroom_Idle_2.png",
                        "images/individual_characters/NormalMushroom_Idle_3.png",
                        "images/individual_characters/NormalMushroom_Idle_4.png",
                        "images/individual_characters/NormalMushroom_Walk_1.png",
                        "images/individual_characters/NormalMushroom_Walk_2.png",
                        "images/individual_characters/NormalMushroom_Walk_3.png",
                        "images/individual_characters/NormalMushroom_Walk_4.png",
                        // "images/individual_characters/NormalNun_Idle + Walk_1.png",
                        // "images/individual_characters/NormalNun_Idle + Walk_2.png",
                        // "images/individual_characters/NormalNun_Idle + Walk_3.png",
                        // "images/individual_characters/NormalNun_Idle + Walk_4.png",
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
                        // "images/individual_characters/SkinnyNun_Idle + Walk_1.png",
                        // "images/individual_characters/SkinnyNun_Idle + Walk_2.png",
                        // "images/individual_characters/SkinnyNun_Idle + Walk_3.png",
                        // "images/individual_characters/SkinnyNun_Idle + Walk_4.png",
                        "images/individual_characters/SmallMushroom_Idle_1.png",
                        "images/individual_characters/SmallMushroom_Idle_2.png",
                        "images/individual_characters/SmallMushroom_Idle_3.png",
                        "images/individual_characters/SmallMushroom_Idle_4.png",
                        "images/individual_characters/SmallMushroom_Walk_1.png",
                        "images/individual_characters/SmallMushroom_Walk_2.png",
                        "images/individual_characters/SmallMushroom_Walk_3.png",
                        "images/individual_characters/SmallMushroom_Walk_4.png",
                        // "images/individual_characters/TallCleric_Idle + Walk_1.png",
                        // "images/individual_characters/TallCleric_Idle + Walk_2.png",
                        // "images/individual_characters/TallCleric_Idle + Walk_3.png",
                        // "images/individual_characters/TallCleric_Idle + Walk_4.png",
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
                        // "images/individual_characters/Wizard_Idle + Walk_1.png",
                        // "images/individual_characters/Wizard_Idle + Walk_2.png",
                        // "images/individual_characters/Wizard_Idle + Walk_3.png",
                        // "images/individual_characters/Wizard_Idle + Walk_4.png",
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
// Utility functions for iterable
System.register("engine/util/Lists", [], function (exports_39, context_39) {
    "use strict";
    var Lists;
    var __moduleName = context_39 && context_39.id;
    return {
        setters: [],
        execute: function () {// Utility functions for iterable
            exports_39("Lists", Lists = {
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
                    var biggestAmount = Number.MIN_SAFE_INTEGER;
                    var biggest;
                    for (var _i = 0, list_2 = list; _i < list_2.length; _i++) {
                        var i = list_2[_i];
                        var amount = fn(i);
                        if (amount > biggestAmount) {
                            biggestAmount = amount;
                            biggest = i;
                        }
                    }
                    return biggest;
                },
                oneOf: function (list) {
                    return list[Math.floor(Math.random() * list.length)];
                },
                shuffle: function (list) {
                    var currentIndex = list.length, temporaryValue, randomIndex;
                    // While there remain elements to shuffle...
                    while (0 !== currentIndex) {
                        // Pick a remaining element...
                        randomIndex = Math.floor(Math.random() * currentIndex);
                        currentIndex -= 1;
                        // And swap it with the current element.
                        temporaryValue = list[currentIndex];
                        list[currentIndex] = list[randomIndex];
                        list[randomIndex] = temporaryValue;
                    }
                }
            });
        }
    };
});
System.register("game/Controls", [], function (exports_40, context_40) {
    "use strict";
    var Controls;
    var __moduleName = context_40 && context_40.id;
    return {
        setters: [],
        execute: function () {
            exports_40("Controls", Controls = {
                interactButton: 69 /* E */,
                interactButtonSecondary: 70 /* F */,
                closeButton: 27 /* ESC */,
                inventoryButton: 73 /* I */,
                keyString: function (inputKey) {
                    return String.fromCharCode(inputKey);
                }
            });
        }
    };
});
// Original JavaScript Code from  Marijn Haverbeke (http://eloquentjavascript.net/1st_edition/appendix2.html)
System.register("engine/util/BinaryHeap", [], function (exports_41, context_41) {
    "use strict";
    var BinaryHeap;
    var __moduleName = context_41 && context_41.id;
    return {
        setters: [],
        execute: function () {// Original JavaScript Code from  Marijn Haverbeke (http://eloquentjavascript.net/1st_edition/appendix2.html)
            BinaryHeap = /** @class */ (function () {
                function BinaryHeap(scoreFunction) {
                    this.content = [];
                    this.scoreFunction = scoreFunction;
                }
                BinaryHeap.prototype.clear = function () {
                    this.content = [];
                };
                BinaryHeap.prototype.pushAll = function (elements) {
                    var _this = this;
                    elements.forEach(function (item) { return _this.push(item); });
                };
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
            exports_41("BinaryHeap", BinaryHeap);
        }
    };
});
System.register("engine/util/Grid", ["engine/point", "engine/util/BinaryHeap"], function (exports_42, context_42) {
    "use strict";
    var point_20, BinaryHeap_1, Grid;
    var __moduleName = context_42 && context_42.id;
    return {
        setters: [
            function (point_20_1) {
                point_20 = point_20_1;
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
                    this._valuesCache = null;
                    this.map[pt.toString()] = entry;
                };
                /**
                 * @returns the element at the point or null if not present in the grid
                 */
                Grid.prototype.get = function (pt) {
                    return this.map[pt.toString()];
                };
                Grid.prototype.remove = function (pt) {
                    this._valuesCache = null;
                    delete this.map[pt.toString()];
                };
                Grid.prototype.removeAll = function (element) {
                    var _this = this;
                    this._valuesCache = null;
                    Object.entries(this.map)
                        .filter(function (kv) { return kv[1] === element; })
                        .forEach(function (kv) { return delete _this.map[kv[0]]; });
                };
                Grid.prototype.clear = function () {
                    this.map = {};
                    this._valuesCache = null;
                };
                Grid.prototype.entries = function () {
                    return Object.entries(this.map).map(function (tuple) { return [point_20.Point.fromString(tuple[0]), tuple[1]]; });
                };
                Grid.prototype.keys = function () {
                    return Object.keys(this.map).map(function (ptStr) { return point_20.Point.fromString(ptStr); });
                };
                /**
                 * @returns a set of all unique values in the grid
                 */
                Grid.prototype.values = function () {
                    if (!this._valuesCache) {
                        this._valuesCache = Array.from(new Set(Object.values(this.map)));
                    }
                    return this._valuesCache;
                };
                /**
                 * Returns a path inclusive of start and end
                 */
                Grid.prototype.findPath = function (start, end, _a) {
                    var _this = this;
                    var _b = _a === void 0 ? {} : _a, _c = _b.heuristic, heuristic = _c === void 0 ? function (pt) { return pt.manhattanDistanceTo(end); } : _c, _d = _b.distance, distance = _d === void 0 ? function (a, b) { return a.manhattanDistanceTo(b); } : _d, _e = _b.isOccupied, isOccupied = _e === void 0 ? function (pt) { return !!_this.get(pt); } : _e, _f = _b.getNeighbors, getNeighbors = _f === void 0 ? function (pt) { return [new point_20.Point(pt.x, pt.y - 1), new point_20.Point(pt.x - 1, pt.y), new point_20.Point(pt.x + 1, pt.y), new point_20.Point(pt.x, pt.y + 1)]; } : _f;
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
                    var startTime = new Date().getTime();
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
                            var tentativeGScore = currentGScore + distance(current, neighbor);
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
            exports_42("Grid", Grid);
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
System.register("engine/util/Noise", [], function (exports_43, context_43) {
    "use strict";
    var grad3, p, perm, gradP, Noise;
    var __moduleName = context_43 && context_43.id;
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
            exports_43("Noise", Noise);
        }
    };
});
System.register("game/world/elements/ElementComponent", ["engine/component", "game/world/LocationManager"], function (exports_44, context_44) {
    "use strict";
    var component_5, LocationManager_1, ElementComponent;
    var __moduleName = context_44 && context_44.id;
    return {
        setters: [
            function (component_5_1) {
                component_5 = component_5_1;
            },
            function (LocationManager_1_1) {
                LocationManager_1 = LocationManager_1_1;
            }
        ],
        execute: function () {
            /**
             * A component that all world space entities should have in order to be saveable.
             * Elements should not subclass this.
             */
            ElementComponent = /** @class */ (function (_super) {
                __extends(ElementComponent, _super);
                function ElementComponent(type, pos, occupiedPoints, saveFn) {
                    var _this = _super.call(this) || this;
                    _this.type = type;
                    _this.pos = pos;
                    _this.occupiedPoints = occupiedPoints;
                    _this.save = saveFn;
                    return _this;
                }
                ElementComponent.prototype.save = function () {
                    throw new Error("aaaaahhh!");
                };
                ElementComponent.prototype.delete = function () {
                    var _this = this;
                    _super.prototype.delete.call(this);
                    LocationManager_1.LocationManager.instance.getLocations().forEach(function (l) { return l.removeElement(_this); });
                };
                return ElementComponent;
            }(component_5.Component));
            exports_44("ElementComponent", ElementComponent);
        }
    };
});
System.register("game/ui/Text", ["engine/point", "engine/renderer/TextRender"], function (exports_45, context_45) {
    "use strict";
    var point_21, TextRender_2, TEXT_PIXEL_WIDTH, TEXT_SIZE, TEXT_FONT, formatText;
    var __moduleName = context_45 && context_45.id;
    return {
        setters: [
            function (point_21_1) {
                point_21 = point_21_1;
            },
            function (TextRender_2_1) {
                TextRender_2 = TextRender_2_1;
            }
        ],
        execute: function () {
            exports_45("TEXT_PIXEL_WIDTH", TEXT_PIXEL_WIDTH = 8);
            exports_45("TEXT_SIZE", TEXT_SIZE = 8);
            exports_45("TEXT_FONT", TEXT_FONT = "Press Start 2P");
            exports_45("formatText", formatText = function (s, color, position, width, alignment, lineSpacing) {
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
                    return new TextRender_2.TextRender(r, position.plus(new point_21.Point(offset, i * (TEXT_SIZE + lineSpacing))), TEXT_SIZE, TEXT_FONT, color);
                });
            });
        }
    };
});
System.register("game/ui/LocationTransition", ["engine/component", "engine/point", "engine/renderer/ImageRender", "engine/util/Animator", "game/characters/Player", "game/cutscenes/Camera", "game/ui/UIStateManager"], function (exports_46, context_46) {
    "use strict";
    var component_6, point_22, ImageRender_2, Animator_2, Player_1, Camera_1, UIStateManager_1, makeCircle, FRAMES, SPEED, LocationTransition;
    var __moduleName = context_46 && context_46.id;
    return {
        setters: [
            function (component_6_1) {
                component_6 = component_6_1;
            },
            function (point_22_1) {
                point_22 = point_22_1;
            },
            function (ImageRender_2_1) {
                ImageRender_2 = ImageRender_2_1;
            },
            function (Animator_2_1) {
                Animator_2 = Animator_2_1;
            },
            function (Player_1_1) {
                Player_1 = Player_1_1;
            },
            function (Camera_1_1) {
                Camera_1 = Camera_1_1;
            },
            function (UIStateManager_1_1) {
                UIStateManager_1 = UIStateManager_1_1;
            }
        ],
        execute: function () {
            makeCircle = function (context, radius, centerPos) {
                if (radius === 0) {
                    return;
                }
                var relativeCenter = new point_22.Point(radius, radius).minus(new point_22.Point(.5, .5));
                var imageDataOffset = centerPos.plusX(-radius).plusY(-radius);
                var diameter = 2 * radius;
                var imageData = context.getImageData(imageDataOffset.x, imageDataOffset.y, diameter, diameter);
                for (var x = 0; x < diameter; x++) {
                    for (var y = 0; y < diameter; y++) {
                        var i = (x + y * diameter) * 4;
                        var pt = new point_22.Point(x, y);
                        if (relativeCenter.distanceTo(pt) < diameter / 2) {
                            imageData.data[i + 3] = 0;
                        }
                    }
                }
                context.putImageData(imageData, imageDataOffset.x, imageDataOffset.y);
            };
            FRAMES = 12;
            SPEED = 30;
            LocationTransition = /** @class */ (function (_super) {
                __extends(LocationTransition, _super);
                function LocationTransition() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                LocationTransition.prototype.transition = function (callback) {
                    var _this = this;
                    var centerPos = Player_1.Player.instance.dude.standingPosition.plusY(-12)
                        .minus(Camera_1.Camera.instance.position)
                        .apply(Math.floor);
                    var dims = Camera_1.Camera.instance.dimensions.plusX(1).plusY(1);
                    var maxRadius = dims.div(2).magnitude();
                    // circles big->small->big
                    var renders = [];
                    for (var i = 0; i < FRAMES; i++) {
                        var radius = Math.floor(maxRadius / FRAMES * i);
                        var canvas = document.createElement("canvas");
                        canvas.width = dims.x;
                        canvas.height = dims.y;
                        var context = canvas.getContext("2d", { alpha: true });
                        context.fillStyle = "#222222" /* BLACK */;
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        makeCircle(context, radius, centerPos);
                        var render = new ImageRender_2.ImageRender(canvas, point_22.Point.ZERO, dims, point_22.Point.ZERO, dims, UIStateManager_1.UIStateManager.UI_SPRITE_DEPTH + 10000);
                        renders.push(render);
                        if (renders.length > 1) {
                            renders.unshift(render);
                        }
                    }
                    var transitionFrame = FRAMES - 1;
                    var blackScreenSpeed = 12 * SPEED;
                    this.animator = new Animator_2.Animator(Array.from({ length: FRAMES * 2 - 1 }, function (v, k) { return k === transitionFrame ? blackScreenSpeed : SPEED; }), function (frame) {
                        if (!!_this.animator) {
                            _this.render = renders[frame];
                        }
                        if (frame === transitionFrame) {
                            callback();
                        }
                    }, function () {
                        _this.animator = null;
                        _this.render = null;
                    });
                };
                LocationTransition.prototype.update = function (updateData) {
                    var _a;
                    (_a = this.animator) === null || _a === void 0 ? void 0 : _a.update(updateData.elapsedTimeMillis);
                };
                LocationTransition.prototype.getRenderMethods = function () {
                    return [this.render];
                };
                return LocationTransition;
            }(component_6.Component));
            exports_46("LocationTransition", LocationTransition);
        }
    };
});
System.register("game/ui/OffScreenMarker", ["engine/point", "engine/util/utils", "engine/util/Lists", "engine/component", "game/graphics/Tilesets", "engine/tiles/TileTransform", "game/world/LocationManager", "game/cutscenes/Camera"], function (exports_47, context_47) {
    "use strict";
    var point_23, utils_3, Lists_1, component_7, Tilesets_1, TileTransform_5, LocationManager_2, Camera_2, OffScreenMarker;
    var __moduleName = context_47 && context_47.id;
    return {
        setters: [
            function (point_23_1) {
                point_23 = point_23_1;
            },
            function (utils_3_1) {
                utils_3 = utils_3_1;
            },
            function (Lists_1_1) {
                Lists_1 = Lists_1_1;
            },
            function (component_7_1) {
                component_7 = component_7_1;
            },
            function (Tilesets_1_1) {
                Tilesets_1 = Tilesets_1_1;
            },
            function (TileTransform_5_1) {
                TileTransform_5 = TileTransform_5_1;
            },
            function (LocationManager_2_1) {
                LocationManager_2 = LocationManager_2_1;
            },
            function (Camera_2_1) {
                Camera_2 = Camera_2_1;
            }
        ],
        execute: function () {
            OffScreenMarker = /** @class */ (function (_super) {
                __extends(OffScreenMarker, _super);
                function OffScreenMarker() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.markerDistFromEdge = 12 + Tilesets_1.TILE_SIZE;
                    return _this;
                }
                OffScreenMarker.prototype.update = function (updateData) {
                    var cameraPos = Camera_2.Camera.instance.position;
                    var cameraDimensions = updateData.dimensions;
                    // TODO make this configurable
                    var dips = Array.from(LocationManager_2.LocationManager.instance.currentLocation.dudes).filter(function (d) { return d.type === 1 /* DIP */; }).map(function (d) { return d.standingPosition; });
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
                        .minus(new point_23.Point(.5, .5).times(Tilesets_1.TILE_SIZE));
                    this.tileSource = "arrow_" + intersect[0] + "_2";
                };
                OffScreenMarker.prototype.getRenderMethods = function () {
                    if (!this.tileSource)
                        return [];
                    return [Tilesets_1.Tilesets.instance.oneBit.getTileSource(this.tileSource).toImageRender(new TileTransform_5.TileTransform(this.tilePoint))];
                };
                OffScreenMarker.prototype.cameraEdgeIntersectPoint = function (outsidePoint, cameraPos, cameraDimensions) {
                    cameraPos = cameraPos.plus(new point_23.Point(1, 1).times(this.markerDistFromEdge));
                    cameraDimensions = cameraDimensions.minus(new point_23.Point(2, 2).times(this.markerDistFromEdge));
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
                    return new point_23.Point((B2 * C1 - B1 * C2) * invdelta, (A1 * C2 - A2 * C1) * invdelta);
                };
                return OffScreenMarker;
            }(component_7.Component));
            exports_47("OffScreenMarker", OffScreenMarker);
        }
    };
});
System.register("game/ui/HUD", ["engine/Entity", "engine/point", "engine/tiles/TileComponent", "engine/tiles/TileTransform", "game/graphics/Tilesets", "game/ui/LocationTransition", "game/ui/OffScreenMarker"], function (exports_48, context_48) {
    "use strict";
    var Entity_2, point_24, TileComponent_3, TileTransform_6, Tilesets_2, LocationTransition_1, OffScreenMarker_1, HUD;
    var __moduleName = context_48 && context_48.id;
    return {
        setters: [
            function (Entity_2_1) {
                Entity_2 = Entity_2_1;
            },
            function (point_24_1) {
                point_24 = point_24_1;
            },
            function (TileComponent_3_1) {
                TileComponent_3 = TileComponent_3_1;
            },
            function (TileTransform_6_1) {
                TileTransform_6 = TileTransform_6_1;
            },
            function (Tilesets_2_1) {
                Tilesets_2 = Tilesets_2_1;
            },
            function (LocationTransition_1_1) {
                LocationTransition_1 = LocationTransition_1_1;
            },
            function (OffScreenMarker_1_1) {
                OffScreenMarker_1 = OffScreenMarker_1_1;
            }
        ],
        execute: function () {
            HUD = /** @class */ (function () {
                function HUD() {
                    this.heartsEntity = new Entity_2.Entity();
                    this.autosaveComponent = new Entity_2.Entity().addComponent(Tilesets_2.Tilesets.instance.oneBit.getTileSource("floppy_drive").toComponent());
                    this.isShowingAutosaveIcon = false;
                    this.offset = new point_24.Point(4, 4);
                    // used for determining what should be updated
                    this.lastHealthCount = 0;
                    this.lastMaxHealthCount = 0;
                    this.locationTransition = new Entity_2.Entity().addComponent(new LocationTransition_1.LocationTransition());
                    // TODO show this dynamically
                    this.offScreenMarker = this.autosaveComponent.entity.addComponent(new OffScreenMarker_1.OffScreenMarker());
                    HUD.instance = this;
                }
                HUD.prototype.getEntities = function (player, screenDimensions, elapsedMillis) {
                    this.updateHearts(player.health, player.maxHealth);
                    this.updateAutosave(screenDimensions, elapsedMillis);
                    return [
                        this.heartsEntity,
                        this.autosaveComponent.entity,
                        this.locationTransition.entity
                    ];
                };
                HUD.prototype.updateHearts = function (health, maxHealth) {
                    var _this = this;
                    if (this.lastHealthCount === health && this.lastMaxHealthCount === maxHealth) {
                        return;
                    }
                    this.lastHealthCount = health;
                    this.lastMaxHealthCount = maxHealth;
                    this.heartsEntity = new Entity_2.Entity();
                    var heartOffset = new point_24.Point(16, 0);
                    var full = Tilesets_2.Tilesets.instance.dungeonCharacters.getTileSource("ui_heart_full");
                    var half = Tilesets_2.Tilesets.instance.dungeonCharacters.getTileSource("ui_heart_half");
                    var empty = Tilesets_2.Tilesets.instance.dungeonCharacters.getTileSource("ui_heart_empty");
                    var result = [];
                    var fullHearts = Math.floor(health);
                    for (var i = 0; i < fullHearts; i++) {
                        result.push(new TileComponent_3.TileComponent(full, new TileTransform_6.TileTransform(this.offset.plus(heartOffset.times(i)))));
                    }
                    if (health % 1 > .5) {
                        result.push(new TileComponent_3.TileComponent(full, new TileTransform_6.TileTransform(this.offset.plus(heartOffset.times(result.length)))));
                    }
                    else if (health % 1 > 0) {
                        result.push(new TileComponent_3.TileComponent(half, new TileTransform_6.TileTransform(this.offset.plus(heartOffset.times(result.length)))));
                    }
                    while (result.length < maxHealth) {
                        result.push(new TileComponent_3.TileComponent(empty, new TileTransform_6.TileTransform(this.offset.plus(heartOffset.times(result.length)))));
                    }
                    result.forEach(function (c) { return _this.heartsEntity.addComponent(c); });
                };
                HUD.prototype.showSaveIcon = function () {
                    var _this = this;
                    this.isShowingAutosaveIcon = true;
                    setTimeout(function () { _this.isShowingAutosaveIcon = false; }, 3000);
                };
                HUD.prototype.updateAutosave = function (screenDimensions, elapsedMillis) {
                    var base = screenDimensions.minus(this.offset).minus(new point_24.Point(Tilesets_2.TILE_SIZE, Tilesets_2.TILE_SIZE));
                    var lerpRate = 0.005 * elapsedMillis;
                    if (this.autosaveComponent.transform.position.equals(point_24.Point.ZERO)) { // for initializing
                        lerpRate = 1;
                    }
                    var goal = this.isShowingAutosaveIcon ? point_24.Point.ZERO : new point_24.Point(0, 40);
                    this.autosaveComponent.transform.position = this.autosaveComponent.transform.position
                        .minus(base)
                        .lerp(lerpRate, goal)
                        .plus(base);
                };
                return HUD;
            }());
            exports_48("HUD", HUD);
        }
    };
});
System.register("engine/tiles/NineSlice", ["engine/point", "engine/tiles/TileTransform"], function (exports_49, context_49) {
    "use strict";
    var point_25, TileTransform_7, NineSlice;
    var __moduleName = context_49 && context_49.id;
    return {
        setters: [
            function (point_25_1) {
                point_25 = point_25_1;
            },
            function (TileTransform_7_1) {
                TileTransform_7 = TileTransform_7_1;
            }
        ],
        execute: function () {
            exports_49("NineSlice", NineSlice = {
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
                            fn(new point_25.Point(x, y), getIndex());
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
                    tiles.push(slice[0].toComponent(new TileTransform_7.TileTransform(new point_25.Point(0, 0))));
                    tiles.push(slice[2].toComponent(new TileTransform_7.TileTransform(new point_25.Point(dimensions.x - 1, 0))));
                    tiles.push(slice[6].toComponent(new TileTransform_7.TileTransform(new point_25.Point(0, dimensions.y - 1))));
                    tiles.push(slice[8].toComponent(new TileTransform_7.TileTransform(new point_25.Point(dimensions.x - 1, dimensions.y - 1))));
                    // horizontal lines
                    for (var i = 1; i < dimensions.x - 1; i++) {
                        tiles.push(slice[1].toComponent(new TileTransform_7.TileTransform(new point_25.Point(i, 0))));
                        tiles.push(slice[7].toComponent(new TileTransform_7.TileTransform(new point_25.Point(i, dimensions.y - 1))));
                    }
                    // vertical lines
                    for (var j = 1; j < dimensions.y - 1; j++) {
                        tiles.push(slice[3].toComponent(new TileTransform_7.TileTransform(new point_25.Point(0, j))));
                        tiles.push(slice[5].toComponent(new TileTransform_7.TileTransform(new point_25.Point(dimensions.x - 1, j))));
                    }
                    // middle
                    for (var x = 1; x < dimensions.x - 1; x++) {
                        for (var y = 1; y < dimensions.y - 1; y++) {
                            tiles.push(slice[4].toComponent(new TileTransform_7.TileTransform(new point_25.Point(x, y))));
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
                    var topLeft = slice[0].toComponent(new TileTransform_7.TileTransform(new point_25.Point(0, 0)));
                    var tileSize = topLeft.transform.dimensions.x;
                    // corners
                    tiles.push(topLeft);
                    tiles.push(slice[2].toComponent(new TileTransform_7.TileTransform(new point_25.Point(dimensions.x - tileSize, 0))));
                    tiles.push(slice[6].toComponent(new TileTransform_7.TileTransform(new point_25.Point(0, dimensions.y - tileSize))));
                    tiles.push(slice[8].toComponent(new TileTransform_7.TileTransform(new point_25.Point(dimensions.x - tileSize, dimensions.y - tileSize))));
                    // horizontal lines
                    var horizontalDimensions = new point_25.Point(dimensions.x - tileSize * 2, tileSize);
                    tiles.push(slice[1].toComponent(new TileTransform_7.TileTransform(new point_25.Point(tileSize, 0), horizontalDimensions)));
                    tiles.push(slice[7].toComponent(new TileTransform_7.TileTransform(new point_25.Point(tileSize, dimensions.y - tileSize), horizontalDimensions)));
                    // vertical lines
                    var verticalDimensions = new point_25.Point(tileSize, dimensions.y - tileSize * 2);
                    tiles.push(slice[3].toComponent(new TileTransform_7.TileTransform(new point_25.Point(0, tileSize), verticalDimensions)));
                    tiles.push(slice[5].toComponent(new TileTransform_7.TileTransform(new point_25.Point(dimensions.x - tileSize, tileSize), verticalDimensions)));
                    // middle
                    tiles.push(slice[4].toComponent(new TileTransform_7.TileTransform(new point_25.Point(tileSize, tileSize), new point_25.Point(dimensions.x - tileSize * 2, dimensions.y - tileSize * 2))));
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
System.register("game/characters/weapons/WeaponType", [], function (exports_50, context_50) {
    "use strict";
    var WeaponType;
    var __moduleName = context_50 && context_50.id;
    return {
        setters: [],
        execute: function () {
            (function (WeaponType) {
                WeaponType[WeaponType["NONE"] = 99999] = "NONE";
                WeaponType[WeaponType["UNARMED"] = 100000] = "UNARMED";
                WeaponType[WeaponType["KNIFE"] = 100001] = "KNIFE";
                WeaponType[WeaponType["SHITTY_SWORD"] = 100002] = "SHITTY_SWORD";
                WeaponType[WeaponType["SWORD"] = 100003] = "SWORD";
                WeaponType[WeaponType["FANCY_SWORD"] = 100004] = "FANCY_SWORD";
                WeaponType[WeaponType["BIG_HAMMER"] = 100005] = "BIG_HAMMER";
                WeaponType[WeaponType["HAMMER"] = 100006] = "HAMMER";
                WeaponType[WeaponType["CLUB"] = 100007] = "CLUB";
                WeaponType[WeaponType["MACE"] = 100008] = "MACE";
                WeaponType[WeaponType["KATANA"] = 100009] = "KATANA";
                WeaponType[WeaponType["SERRATED_SWORD"] = 100010] = "SERRATED_SWORD";
                WeaponType[WeaponType["BIG_SWORD"] = 100011] = "BIG_SWORD";
                WeaponType[WeaponType["AXE"] = 100012] = "AXE";
                WeaponType[WeaponType["MACHETE"] = 100013] = "MACHETE";
                WeaponType[WeaponType["CLEAVER"] = 100014] = "CLEAVER";
                WeaponType[WeaponType["FENCING_SWORD"] = 100015] = "FENCING_SWORD";
                WeaponType[WeaponType["GREATSWORD"] = 100016] = "GREATSWORD";
                WeaponType[WeaponType["GOLD_SWORD"] = 100017] = "GOLD_SWORD";
                WeaponType[WeaponType["BIG_GOLD_SWORD"] = 100018] = "BIG_GOLD_SWORD";
                WeaponType[WeaponType["STAFF_1"] = 100019] = "STAFF_1";
                WeaponType[WeaponType["STAFF_2"] = 100020] = "STAFF_2";
                WeaponType[WeaponType["SPEAR"] = 100021] = "SPEAR";
                WeaponType[WeaponType["PICKAXE"] = 100022] = "PICKAXE";
            })(WeaponType || (WeaponType = {}));
            exports_50("WeaponType", WeaponType);
        }
    };
});
System.register("game/characters/NPCSchedule", [], function (exports_51, context_51) {
    "use strict";
    var NPCSchedules;
    var __moduleName = context_51 && context_51.id;
    return {
        setters: [],
        execute: function () {
            exports_51("NPCSchedules", NPCSchedules = {
                SCHEDULE_KEY: "sch",
                newNoOpSchedule: function () { return ({ type: 0 /* DO_NOTHING */ }); },
                newGoToSchedule: function (tilePoint) { return ({ type: 1 /* GO_TO_SPOT */, p: tilePoint.toString() }); },
                newFreeRoamInDarkSchedule: function () { return ({ type: 2 /* ROAM_IN_DARKNESS */ }); },
                newFreeRoamSchedule: function (
                // TODO: new params
                pauseFrequencyMin, pauseFrequencyMax, pauseDurationMin, pauseDurationMax) {
                    if (pauseFrequencyMin === void 0) { pauseFrequencyMin = 0; }
                    if (pauseFrequencyMax === void 0) { pauseFrequencyMax = 0; }
                    if (pauseDurationMin === void 0) { pauseDurationMin = 0; }
                    if (pauseDurationMax === void 0) { pauseDurationMax = 0; }
                    return ({
                        type: 3 /* ROAM */,
                        fl: pauseFrequencyMin,
                        fh: pauseFrequencyMax,
                        dl: pauseDurationMin,
                        dh: pauseDurationMax,
                    });
                },
                newDefaultVillagerSchedule: function () { return ({ type: 4 /* DEFAULT_VILLAGER */ }); }
            });
        }
    };
});
System.register("game/ui/DudeInteractIndicator", ["game/graphics/Tilesets", "engine/point"], function (exports_52, context_52) {
    "use strict";
    var Tilesets_3, point_26, DudeInteractIndicator;
    var __moduleName = context_52 && context_52.id;
    return {
        setters: [
            function (Tilesets_3_1) {
                Tilesets_3 = Tilesets_3_1;
            },
            function (point_26_1) {
                point_26 = point_26_1;
            }
        ],
        execute: function () {
            exports_52("DudeInteractIndicator", DudeInteractIndicator = {
                NONE: "",
                IMPORTANT_DIALOGUE: "!",
                getTile: function (indicator) {
                    switch (indicator) {
                        case DudeInteractIndicator.NONE:
                            return null;
                        case DudeInteractIndicator.IMPORTANT_DIALOGUE:
                            return Tilesets_3.Tilesets.instance.oneBit.getTileAt(new point_26.Point(19, 25));
                    }
                },
            });
        }
    };
});
System.register("game/world/events/EventQueue", ["engine/util/BinaryHeap", "game/world/events/QueuedEvent"], function (exports_53, context_53) {
    "use strict";
    var BinaryHeap_2, QueuedEvent_1, EventQueue;
    var __moduleName = context_53 && context_53.id;
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
                function EventQueue() {
                    this.heap = new BinaryHeap_2.BinaryHeap(function (e) { return e.time; });
                    EventQueue._instance = this;
                }
                Object.defineProperty(EventQueue, "instance", {
                    get: function () {
                        if (!this._instance) {
                            this._instance = new EventQueue();
                        }
                        return this._instance;
                    },
                    enumerable: false,
                    configurable: true
                });
                EventQueue.prototype.initialize = function (data) {
                    if (data === void 0) { data = []; }
                    this.heap.clear();
                    this.heap.pushAll(data);
                };
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
            exports_53("EventQueue", EventQueue);
        }
    };
});
System.register("game/world/TimeUnit", [], function (exports_54, context_54) {
    "use strict";
    var TimeUnit;
    var __moduleName = context_54 && context_54.id;
    return {
        setters: [],
        execute: function () {
            TimeUnit = /** @class */ (function () {
                function TimeUnit() {
                }
                TimeUnit.MINUTE = 1500; // millis in an in-game minute
                TimeUnit.HOUR = 60 * TimeUnit.MINUTE;
                TimeUnit.DAY = 24 * TimeUnit.HOUR;
                return TimeUnit;
            }());
            exports_54("TimeUnit", TimeUnit);
        }
    };
});
System.register("game/world/WorldTime", ["engine/Entity", "engine/component", "game/world/events/EventQueue", "game/world/TimeUnit"], function (exports_55, context_55) {
    "use strict";
    var Entity_3, component_8, EventQueue_1, TimeUnit_1, WorldTime;
    var __moduleName = context_55 && context_55.id;
    return {
        setters: [
            function (Entity_3_1) {
                Entity_3 = Entity_3_1;
            },
            function (component_8_1) {
                component_8 = component_8_1;
            },
            function (EventQueue_1_1) {
                EventQueue_1 = EventQueue_1_1;
            },
            function (TimeUnit_1_1) {
                TimeUnit_1 = TimeUnit_1_1;
            }
        ],
        execute: function () {
            WorldTime = /** @class */ (function (_super) {
                __extends(WorldTime, _super);
                function WorldTime() {
                    var _this = _super.call(this) || this;
                    _this._time = 0; // millis
                    _this.title = window.document.title;
                    WorldTime._instance = _this;
                    return _this;
                }
                Object.defineProperty(WorldTime, "instance", {
                    get: function () {
                        if (!this._instance) {
                            this._instance = new WorldTime();
                        }
                        return this._instance;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(WorldTime.prototype, "time", {
                    get: function () { return this._time; },
                    enumerable: false,
                    configurable: true
                });
                WorldTime.prototype.initialize = function (time) {
                    this._time = time;
                };
                WorldTime.prototype.update = function (updateData) {
                    this._time += updateData.elapsedTimeMillis;
                    // TODO cleanup
                    if (updateData.input.isKeyDown(78 /* N */) || updateData.input.isKeyDown(77 /* M */)) {
                        this._time += updateData.input.isKeyDown(78 /* N */) ? TimeUnit_1.TimeUnit.HOUR : TimeUnit_1.TimeUnit.MINUTE;
                        console.log("fast forwarding time to " + this.clockTime());
                    }
                    EventQueue_1.EventQueue.instance.processEvents(this.time);
                    window.document.title = this.title + " | " + this.clockTime();
                };
                WorldTime.prototype.getEntity = function () {
                    return new Entity_3.Entity([this]);
                };
                WorldTime.prototype.future = function (_a) {
                    var _b = _a.minutes, minutes = _b === void 0 ? 0 : _b, _c = _a.hours, hours = _c === void 0 ? 0 : _c, _d = _a.days, days = _d === void 0 ? 0 : _d;
                    return this.time + (minutes * TimeUnit_1.TimeUnit.MINUTE) + (hours * TimeUnit_1.TimeUnit.HOUR) + (days * TimeUnit_1.TimeUnit.DAY);
                };
                WorldTime.prototype.clockTime = function () {
                    var hour = Math.floor(this.time % TimeUnit_1.TimeUnit.DAY / TimeUnit_1.TimeUnit.HOUR);
                    var minute = Math.floor(this.time % TimeUnit_1.TimeUnit.HOUR / TimeUnit_1.TimeUnit.MINUTE);
                    return (hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour)) + ":" + (minute < 10 ? "0" : "") + minute + " " + (hour < 12 ? "AM" : "PM");
                };
                return WorldTime;
            }(component_8.Component));
            exports_55("WorldTime", WorldTime);
        }
    };
});
System.register("game/ui/Tooltip", ["engine/component", "game/graphics/Tilesets", "engine/point", "engine/renderer/TextRender", "game/ui/Text", "game/ui/UIStateManager", "engine/util/Lists", "engine/tiles/TileTransform"], function (exports_56, context_56) {
    "use strict";
    var component_9, Tilesets_4, point_27, TextRender_3, Text_1, UIStateManager_2, Lists_2, TileTransform_8, Tooltip;
    var __moduleName = context_56 && context_56.id;
    return {
        setters: [
            function (component_9_1) {
                component_9 = component_9_1;
            },
            function (Tilesets_4_1) {
                Tilesets_4 = Tilesets_4_1;
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
            function (UIStateManager_2_1) {
                UIStateManager_2 = UIStateManager_2_1;
            },
            function (Lists_2_1) {
                Lists_2 = Lists_2_1;
            },
            function (TileTransform_8_1) {
                TileTransform_8 = TileTransform_8_1;
            }
        ],
        execute: function () {
            Tooltip = /** @class */ (function (_super) {
                __extends(Tooltip, _super);
                function Tooltip() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.position = new point_27.Point(0, 0);
                    _this.tiles = [];
                    return _this;
                }
                Tooltip.prototype.say = function (text) {
                    this.text = text.split("\n");
                };
                Tooltip.prototype.clear = function () {
                    this.text = null;
                    this.tiles = [];
                };
                Tooltip.prototype.update = function (updateData) {
                    if (!this.text) {
                        return;
                    }
                    var longestLineLength = Lists_2.Lists.maxBy(this.text, function (line) { return line.length; }).length;
                    var width = longestLineLength * Text_1.TEXT_PIXEL_WIDTH;
                    var leftPos = this.position.plus(new point_27.Point(Tilesets_4.TILE_SIZE / 2, -Tilesets_4.TILE_SIZE)).apply(Math.floor);
                    var centerPos = leftPos.plus(new point_27.Point(Tilesets_4.TILE_SIZE, 0));
                    var rightPos = leftPos.plus(new point_27.Point(width - Tilesets_4.TILE_SIZE + Tooltip.margin * 2, 0)).apply(Math.floor);
                    var spacing = 6;
                    var centerWidth = new point_27.Point(width + Tooltip.margin * 2 - Tilesets_4.TILE_SIZE * 2, Tilesets_4.TILE_SIZE);
                    var tiles = [];
                    for (var i = 0; i < (this.text.length - 1) * 2 + 1; i++) {
                        // left
                        tiles.push(Tilesets_4.Tilesets.instance.oneBit.getTileSource("tooltipLeft").toImageRender(new TileTransform_8.TileTransform(leftPos.plusY(-i * spacing), Tilesets_4.TILE_DIMENSIONS, 0, false, false, UIStateManager_2.UIStateManager.UI_SPRITE_DEPTH + 1)));
                        // center
                        tiles.push(Tilesets_4.Tilesets.instance.oneBit.getTileSource("tooltipCenter").toImageRender(new TileTransform_8.TileTransform(centerPos.plusY(-i * spacing), centerWidth, 0, false, false, UIStateManager_2.UIStateManager.UI_SPRITE_DEPTH + 1)));
                        // right
                        tiles.push(Tilesets_4.Tilesets.instance.oneBit.getTileSource("tooltipRight").toImageRender(new TileTransform_8.TileTransform(rightPos.plusY(-i * spacing), Tilesets_4.TILE_DIMENSIONS, 0, false, false, UIStateManager_2.UIStateManager.UI_SPRITE_DEPTH + 1)));
                    }
                    this.tiles = tiles;
                    var totalWidth = width + Tooltip.margin * 2;
                    if (this.position.x + totalWidth > updateData.dimensions.x) {
                        // shift left
                        this.tiles.forEach(function (t) { return t.position = t.position.plusX(-totalWidth - Tilesets_4.TILE_SIZE); });
                    }
                };
                Tooltip.prototype.getRenderMethods = function () {
                    var _this = this;
                    if (!this.text) {
                        return [];
                    }
                    return this.text.map(function (line, index) { return new TextRender_3.TextRender(line, _this.tiles[0].position.plus(Tooltip.textOffset).plusY((_this.text.length - index - 1) * -(Text_1.TEXT_SIZE + 4)), Text_1.TEXT_SIZE, Text_1.TEXT_FONT, "#62232f" /* DARK_RED */, UIStateManager_2.UIStateManager.UI_SPRITE_DEPTH + 2); }).concat(this.tiles);
                };
                Tooltip.margin = 6;
                Tooltip.textOffset = new point_27.Point(Tooltip.margin, Tooltip.margin - 1);
                return Tooltip;
            }(component_9.Component));
            exports_56("Tooltip", Tooltip);
        }
    };
});
System.register("game/ui/CraftingMenu", ["engine/Entity", "engine/component", "engine/point", "engine/renderer/BasicRenderComponent", "game/cutscenes/Camera", "engine/tiles/NineSlice", "game/graphics/Tilesets", "engine/renderer/ImageRender", "game/ui/UIStateManager", "game/items/Items", "game/ui/Text", "engine/tiles/TileTransform", "game/graphics/ImageFilters", "game/characters/Player", "engine/util/utils", "game/ui/Tooltip"], function (exports_57, context_57) {
    "use strict";
    var Entity_4, component_10, point_28, BasicRenderComponent_2, Camera_3, NineSlice_1, Tilesets_5, ImageRender_3, UIStateManager_3, Items_1, Text_2, TileTransform_9, ImageFilters_1, Player_2, utils_4, Tooltip_1, CraftingMenu;
    var __moduleName = context_57 && context_57.id;
    return {
        setters: [
            function (Entity_4_1) {
                Entity_4 = Entity_4_1;
            },
            function (component_10_1) {
                component_10 = component_10_1;
            },
            function (point_28_1) {
                point_28 = point_28_1;
            },
            function (BasicRenderComponent_2_1) {
                BasicRenderComponent_2 = BasicRenderComponent_2_1;
            },
            function (Camera_3_1) {
                Camera_3 = Camera_3_1;
            },
            function (NineSlice_1_1) {
                NineSlice_1 = NineSlice_1_1;
            },
            function (Tilesets_5_1) {
                Tilesets_5 = Tilesets_5_1;
            },
            function (ImageRender_3_1) {
                ImageRender_3 = ImageRender_3_1;
            },
            function (UIStateManager_3_1) {
                UIStateManager_3 = UIStateManager_3_1;
            },
            function (Items_1_1) {
                Items_1 = Items_1_1;
            },
            function (Text_2_1) {
                Text_2 = Text_2_1;
            },
            function (TileTransform_9_1) {
                TileTransform_9 = TileTransform_9_1;
            },
            function (ImageFilters_1_1) {
                ImageFilters_1 = ImageFilters_1_1;
            },
            function (Player_2_1) {
                Player_2 = Player_2_1;
            },
            function (utils_4_1) {
                utils_4 = utils_4_1;
            },
            function (Tooltip_1_1) {
                Tooltip_1 = Tooltip_1_1;
            }
        ],
        execute: function () {
            CraftingMenu = /** @class */ (function (_super) {
                __extends(CraftingMenu, _super);
                function CraftingMenu() {
                    var _this = _super.call(this) || this;
                    _this.e = new Entity_4.Entity([_this]); // entity for this component
                    _this.isOpen = false;
                    _this.dimensions = new point_28.Point(160, 158);
                    _this.innerDimensions = _this.dimensions.minus(new point_28.Point(10, 14));
                    _this.scrollOffset = 0;
                    _this.justCraftedRow = -1; // if this is non-negative, this row was just crafted and will be highlighted
                    _this.justOpened = false; // prevent bug where the mouse is held down immediately
                    _this.tooltip = _this.e.addComponent(new Tooltip_1.Tooltip());
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
                        var topLeft = screenDimensions.div(2).minus(this.dimensions.div(2)).plusY(-Tilesets_5.TILE_SIZE);
                        this.displayEntity = new Entity_4.Entity(__spreadArrays(this.renderCategories(updateData, topLeft), this.renderRecipes(updateData, topLeft, category.recipes)));
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
                    var result = [];
                    for (var i = 0; i < this.recipes.length; i++) {
                        var category = this.recipes[i];
                        var pos = topLeft.plusX(i * Tilesets_5.TILE_SIZE * 2);
                        var dims = new point_28.Point(2, 2);
                        var hovered = utils_4.rectContains(pos, dims.times(Tilesets_5.TILE_SIZE), updateData.input.mousePos);
                        result.push.apply(result, NineSlice_1.NineSlice.makeNineSliceComponents(Tilesets_5.Tilesets.instance.oneBit.getNineSlice("invBoxNW"), pos, dims));
                        var icon = i === this.recipeCategory || hovered ? category.icon : this.tintedIcon(category.icon, "#dc4a7b" /* PINK */);
                        result.push(icon.toComponent(new TileTransform_9.TileTransform(topLeft.plusX(i * Tilesets_5.TILE_SIZE * 2 + Tilesets_5.TILE_SIZE / 2).plusY(Tilesets_5.TILE_SIZE / 2))));
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
                        && Player_2.Player.instance.dude.inventory.canAddItem(recipe.output)
                        && recipe.input.every(function (input) { return Player_2.Player.instance.dude.inventory.getItemCount(input.item) >= input.count; });
                };
                CraftingMenu.prototype.renderRecipes = function (updateData, topLeft, recipes) {
                    var _this = this;
                    topLeft = topLeft.plusY(Tilesets_5.TILE_SIZE * 2);
                    this.context.imageSmoothingEnabled = false; // TODO figure out why text is aliased
                    this.context.font = Text_2.TEXT_SIZE + "px '" + Text_2.TEXT_FONT + "'";
                    // draw background
                    var backgroundTiles = NineSlice_1.NineSlice.makeStretchedNineSliceComponents(Tilesets_5.Tilesets.instance.outdoorTiles.getNineSlice("invBoxFrame"), topLeft, this.dimensions);
                    backgroundTiles[0].transform.depth = UIStateManager_3.UIStateManager.UI_SPRITE_DEPTH;
                    this.context.fillStyle = "#9f294e" /* RED */;
                    this.context.fillRect(0, 0, this.innerDimensions.x, this.innerDimensions.y);
                    var width = this.innerDimensions.x;
                    var margin = 4;
                    var rowHeight = Tilesets_5.TILE_SIZE + margin * 2;
                    var innerOffset = this.dimensions.minus(this.innerDimensions).div(2);
                    var verticalTextOffset = 13;
                    var verticalOffset = this.scrollOffset;
                    var shiftedMousePos = updateData.input.mousePos.plusY(-this.scrollOffset);
                    for (var r = 0; r < recipes.length; r++) {
                        var hovered = utils_4.rectContains(topLeft.plusX(margin).plusY(rowHeight * r + margin * 2), new point_28.Point(this.innerDimensions.x, rowHeight), shiftedMousePos) && utils_4.rectContains(// within the frame itself
                        topLeft.plus(innerOffset), this.innerDimensions, updateData.input.mousePos);
                        var recipe = recipes[r];
                        var craftedItem = Items_1.ITEM_METADATA_MAP[recipe.output];
                        // craft the item
                        if (hovered && updateData.input.isMouseDown && this.canCraft(recipe)) {
                            // TODO a sound effect
                            recipe.input.forEach(function (ingr) {
                                Player_2.Player.instance.dude.inventory.removeItem(ingr.item, ingr.count);
                            });
                            Player_2.Player.instance.dude.inventory.addItem(recipe.output);
                            this.justCraftedRow = r;
                            setTimeout(function () { return _this.justCraftedRow = -1; }, 900);
                        }
                        if (hovered && !this.canCraft(recipe)) {
                            if (!Player_2.Player.instance.dude.inventory.canAddItem(recipe.output)) {
                                this.tooltip.say("Inventory full");
                            }
                            else if (recipe.input.some(function (input) { return Player_2.Player.instance.dude.inventory.getItemCount(input.item) < input.count; })) {
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
                                craftedItemColor = "#62232f" /* DARK_RED */;
                            }
                            else {
                                craftedItemColor = "#fdf7ed" /* WHITE */;
                            }
                        }
                        else {
                            craftedItemColor = "#dc4a7b" /* PINK */;
                        }
                        this.context.fillStyle = craftedItemColor;
                        var craftedItemIcon = this.tintedIcon(plainIcon, craftedItemColor);
                        this.drawIconAt(craftedItemIcon, margin, verticalOffset);
                        this.context.fillText(craftedItem.displayName, Tilesets_5.TILE_SIZE + margin * 2, verticalTextOffset + verticalOffset);
                        // ingredients
                        var offsetFromRight = 0;
                        for (var i = 0; i < recipe.input.length; i++) {
                            var ingr = recipe.input[recipe.input.length - i - 1];
                            var plainIngredientIcon = this.getItemIcon(ingr.item);
                            var ingredientIcon = plainIngredientIcon;
                            if (Player_2.Player.instance.dude.inventory.getItemCount(ingr.item) < ingr.count) {
                                this.context.fillStyle = "#62232f" /* DARK_RED */;
                                ingredientIcon = this.tintedIcon(ingredientIcon, "#62232f" /* DARK_RED */);
                            }
                            else {
                                this.context.fillStyle = craftedItemColor;
                                ingredientIcon = this.tintedIcon(plainIngredientIcon, craftedItemColor);
                            }
                            // const requiredCount = ingr.count
                            // const countStr = `x${requiredCount}`
                            // offsetFromRight += (countStr.length * TEXT_PIXEL_WIDTH + margin)
                            // this.context.fillText(countStr, width - offsetFromRight, verticalTextOffset + verticalOffset)
                            offsetFromRight += Tilesets_5.TILE_SIZE + margin;
                            this.drawIconAt(ingredientIcon, width - offsetFromRight, verticalOffset);
                            if (utils_4.rectContains(
                            // I have no idea why this math works :(
                            new point_28.Point(width - offsetFromRight + margin, verticalOffset + margin * 1.5).plus(topLeft), new point_28.Point(Tilesets_5.TILE_SIZE, Tilesets_5.TILE_SIZE), updateData.input.mousePos)) {
                                var displayName = Items_1.ITEM_METADATA_MAP[ingr.item].displayName;
                                this.tooltip.say(displayName + " (" + Player_2.Player.instance.dude.inventory.getItemCount(ingr.item) + "/" + ingr.count + ")");
                            }
                        }
                        // draw line
                        verticalOffset += (margin + Tilesets_5.TILE_SIZE);
                        this.context.fillStyle = "#62232f" /* DARK_RED */;
                        this.context.fillRect(margin, verticalOffset, this.innerDimensions.x - 2 * margin, 1);
                    }
                    var renderComp = new BasicRenderComponent_2.BasicRenderComponent(new ImageRender_3.ImageRender(this.canvas, point_28.Point.ZERO, this.innerDimensions, innerOffset.plus(topLeft).apply(Math.floor), this.innerDimensions, UIStateManager_3.UIStateManager.UI_SPRITE_DEPTH - 10));
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
                    var icon = Items_1.ITEM_METADATA_MAP[item].inventoryIconSupplier();
                    this.itemIcons.set(item, icon);
                    return icon;
                };
                CraftingMenu.prototype.tintedIcon = function (icon, tint) {
                    if (tint === "#fdf7ed" /* WHITE */) {
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
            }(component_10.Component));
            exports_57("CraftingMenu", CraftingMenu);
        }
    };
});
System.register("game/characters/dialogues/DipIntro", ["game/characters/Dialogue", "game/ui/DudeInteractIndicator", "game/Controls", "game/world/LocationManager", "game/world/events/EventQueue", "game/world/events/QueuedEvent", "game/world/WorldTime", "game/ui/CraftingMenu", "game/items/CraftingRecipe"], function (exports_58, context_58) {
    "use strict";
    var _a, Dialogue_1, DudeInteractIndicator_1, Controls_1, LocationManager_3, EventQueue_2, QueuedEvent_2, WorldTime_1, CraftingMenu_1, CraftingRecipe_1, ROCKS_NEEDED_FOR_CAMPFIRE, WOOD_NEEDED_FOR_CAMPFIRE, CRAFT_OPTION, DIP_STARTING_DIALOGUE, DIP_1, DIP_2, DIP_3, DIP_BEFRIEND, DIP_MAKE_CAMPFIRE, DIP_CRAFT, DIP_INTRO_DIALOGUE;
    var __moduleName = context_58 && context_58.id;
    return {
        setters: [
            function (Dialogue_1_1) {
                Dialogue_1 = Dialogue_1_1;
            },
            function (DudeInteractIndicator_1_1) {
                DudeInteractIndicator_1 = DudeInteractIndicator_1_1;
            },
            function (Controls_1_1) {
                Controls_1 = Controls_1_1;
            },
            function (LocationManager_3_1) {
                LocationManager_3 = LocationManager_3_1;
            },
            function (EventQueue_2_1) {
                EventQueue_2 = EventQueue_2_1;
            },
            function (QueuedEvent_2_1) {
                QueuedEvent_2 = QueuedEvent_2_1;
            },
            function (WorldTime_1_1) {
                WorldTime_1 = WorldTime_1_1;
            },
            function (CraftingMenu_1_1) {
                CraftingMenu_1 = CraftingMenu_1_1;
            },
            function (CraftingRecipe_1_1) {
                CraftingRecipe_1 = CraftingRecipe_1_1;
            }
        ],
        execute: function () {
            exports_58("ROCKS_NEEDED_FOR_CAMPFIRE", ROCKS_NEEDED_FOR_CAMPFIRE = 8);
            exports_58("WOOD_NEEDED_FOR_CAMPFIRE", WOOD_NEEDED_FOR_CAMPFIRE = 4);
            CRAFT_OPTION = "<Craft>";
            exports_58("DIP_STARTING_DIALOGUE", DIP_STARTING_DIALOGUE = "dip-0");
            DIP_1 = "dip-1", DIP_2 = "dip-2", DIP_3 = "dip-3", DIP_BEFRIEND = "dip-4", DIP_MAKE_CAMPFIRE = "dip-5", DIP_CRAFT = "dip-6";
            // TODO: make DIP introduce himself, have player input their name
            exports_58("DIP_INTRO_DIALOGUE", DIP_INTRO_DIALOGUE = (_a = {},
                _a[DIP_STARTING_DIALOGUE] = function () { return Dialogue_1.dialogueWithOptions(["Phew, thanks for your help! They almost had me. I thought for sure that those Orcs were gonna eat my butt."], DudeInteractIndicator_1.DudeInteractIndicator.IMPORTANT_DIALOGUE, Dialogue_1.option("Are you okay?", DIP_1), Dialogue_1.option("I expect a reward.", DIP_2), Dialogue_1.option("... Eat your butt?", DIP_3)); },
                _a[DIP_1] = function () { return Dialogue_1.dialogue(["I'm alright, just shaken up. You sure know how to handle that blade!"], function () { return new Dialogue_1.NextDialogue(DIP_BEFRIEND); }); },
                _a[DIP_2] = function () { return Dialogue_1.dialogue(["I'm grateful, but I don't have much..."], function () { return new Dialogue_1.NextDialogue(DIP_BEFRIEND); }); },
                _a[DIP_3] = function () { return Dialogue_1.dialogue(["Swamp Lizard butt is an Orcish delicacy. My species has been hunted to extinction by those savages. I'm the only one left."], function () { return new Dialogue_1.NextDialogue(DIP_BEFRIEND); }); },
                _a[DIP_BEFRIEND] = function () { return Dialogue_1.dialogue([
                    "You know, this is a very dangerous place. It's tough to survive without someone watching your back.",
                    "How about I help you set up camp? I know these woods better than anyone.",
                    "I'll put together a tent for you, if you collect rocks and wood for a campfire.",
                ], function () { return new Dialogue_1.NextDialogue(DIP_MAKE_CAMPFIRE, false); }); },
                _a[DIP_MAKE_CAMPFIRE] = function () {
                    var campfires = LocationManager_3.LocationManager.instance.currentLocation.getElementsOfType(4 /* CAMPFIRE */);
                    var dipTent = LocationManager_3.LocationManager.instance.currentLocation.getElementsOfType(3 /* TENT */)[0];
                    if (campfires.length > 0) { // campfire has been placed
                        var lines = [
                            dipTent.occupiedPoints[0].distanceTo(campfires[0].occupiedPoints[0]) < 5
                                ? "That should keep us warm tonight!"
                                : "Well, the fire is a bit far from my tent, but that's okay!",
                            "It's important to keep your camp well-lit out here. There's no telling what danger lurks in the darkness..."
                        ];
                        if (campfires[0].save()["logs"] === 0) {
                            lines.push("You can add logs to the fire by standing close to it and pressing [" + Controls_1.Controls.keyString(Controls_1.Controls.interactButton) + "].");
                        }
                        lines.push("Here, I've finished putting together your tent. Find a nice spot and plop it down!");
                        return Dialogue_1.dialogue(lines, function () {
                            Dialogue_1.inv().addItem(3 /* TENT */);
                            EventQueue_2.EventQueue.instance.addEvent({
                                type: QueuedEvent_2.QueuedEventType.HERALD_ARRIVAL,
                                time: WorldTime_1.WorldTime.instance.future({ minutes: 10 })
                            });
                            Dialogue_1.saveAfterDialogueStage();
                            return new Dialogue_1.NextDialogue(DIP_CRAFT, false);
                        }, DudeInteractIndicator_1.DudeInteractIndicator.IMPORTANT_DIALOGUE);
                    }
                    else if (Dialogue_1.inv().getItemCount(4 /* CAMPFIRE */) > 0) { // campfire has been crafted
                        return Dialogue_1.dialogue(["Try placing the campfire down near my tent. You can open your inventory by pressing [" + String.fromCharCode(Controls_1.Controls.inventoryButton) + "]."], function () { return new Dialogue_1.NextDialogue(DIP_MAKE_CAMPFIRE, false); });
                    }
                    else if (Dialogue_1.inv().getItemCount(1 /* ROCK */) >= ROCKS_NEEDED_FOR_CAMPFIRE && Dialogue_1.inv().getItemCount(2 /* WOOD */) >= WOOD_NEEDED_FOR_CAMPFIRE) { // can craft
                        return Dialogue_1.dialogueWithOptions(["It looks like you have enough rocks and wood. Should we put together a campfire?"], DudeInteractIndicator_1.DudeInteractIndicator.IMPORTANT_DIALOGUE, new Dialogue_1.DialogueOption(CRAFT_OPTION, function () {
                            CraftingMenu_1.CraftingMenu.instance.show(CraftingRecipe_1.getDipRecipes());
                            return new Dialogue_1.NextDialogue(DIP_MAKE_CAMPFIRE, false);
                        }), Dialogue_1.option("Not yet.", DIP_MAKE_CAMPFIRE, false));
                    }
                    else { // do not have enough ingredients to craft
                        return Dialogue_1.dialogue(["We need " + ROCKS_NEEDED_FOR_CAMPFIRE + " rocks and " + WOOD_NEEDED_FOR_CAMPFIRE + " wood to make a campfire. Try hitting big rocks and trees with your sword!"], function () { return new Dialogue_1.NextDialogue(DIP_MAKE_CAMPFIRE, false); });
                    }
                },
                _a[DIP_CRAFT] = function () {
                    return Dialogue_1.dialogueWithOptions(["Can I help you make something?"], DudeInteractIndicator_1.DudeInteractIndicator.NONE, new Dialogue_1.DialogueOption(CRAFT_OPTION, function () {
                        CraftingMenu_1.CraftingMenu.instance.show(CraftingRecipe_1.getDipRecipes());
                        return new Dialogue_1.NextDialogue(DIP_CRAFT, false);
                    }), Dialogue_1.option("Nope.", DIP_CRAFT, false));
                },
                _a));
        }
    };
});
System.register("game/items/CraftingRecipe", ["game/items/Inventory", "game/graphics/Tilesets", "engine/point", "game/characters/dialogues/DipIntro"], function (exports_59, context_59) {
    "use strict";
    var Inventory_1, Tilesets_6, point_29, DipIntro_1, getDipRecipes;
    var __moduleName = context_59 && context_59.id;
    return {
        setters: [
            function (Inventory_1_1) {
                Inventory_1 = Inventory_1_1;
            },
            function (Tilesets_6_1) {
                Tilesets_6 = Tilesets_6_1;
            },
            function (point_29_1) {
                point_29 = point_29_1;
            },
            function (DipIntro_1_1) {
                DipIntro_1 = DipIntro_1_1;
            }
        ],
        execute: function () {
            exports_59("getDipRecipes", getDipRecipes = function () { return [{
                    icon: Tilesets_6.Tilesets.instance.oneBit.getTileAt(new point_29.Point(0, 7)),
                    name: "Outdoor Furniture",
                    recipes: [{
                            output: 4 /* CAMPFIRE */,
                            input: [new Inventory_1.ItemStack(1 /* ROCK */, DipIntro_1.ROCKS_NEEDED_FOR_CAMPFIRE), new Inventory_1.ItemStack(2 /* WOOD */, DipIntro_1.WOOD_NEEDED_FOR_CAMPFIRE)],
                        }],
                }, {
                    icon: Tilesets_6.Tilesets.instance.oneBit.getTileAt(new point_29.Point(10, 27)),
                    name: "Equipment",
                    recipes: [{
                            output: 100022 /* PICKAXE */,
                            input: [new Inventory_1.ItemStack(5 /* IRON */, 3), new Inventory_1.ItemStack(2 /* WOOD */, 5)],
                        }, {
                            output: 100012 /* AXE */,
                            input: [new Inventory_1.ItemStack(5 /* IRON */, 3), new Inventory_1.ItemStack(2 /* WOOD */, 5)],
                        }, {
                            output: 100021 /* SPEAR */,
                            input: [new Inventory_1.ItemStack(1 /* ROCK */, 1), new Inventory_1.ItemStack(2 /* WOOD */, 3)],
                        }],
                }, {
                    icon: Tilesets_6.Tilesets.instance.oneBit.getTileAt(new point_29.Point(0, 19)),
                    name: "Buildings",
                    recipes: [{
                            output: 3 /* TENT */,
                            input: [new Inventory_1.ItemStack(2 /* WOOD */, 5)],
                        }, {
                            output: 6 /* HOUSE */,
                            input: [new Inventory_1.ItemStack(1 /* ROCK */, 5), new Inventory_1.ItemStack(2 /* WOOD */, 5)],
                        }],
                }]; });
        }
    };
});
System.register("game/ui/SellMenu", ["engine/Entity", "engine/component", "engine/point", "engine/renderer/BasicRenderComponent", "game/cutscenes/Camera", "engine/tiles/NineSlice", "game/graphics/Tilesets", "engine/renderer/ImageRender", "game/ui/UIStateManager", "game/items/Items", "game/ui/Text", "game/graphics/ImageFilters", "game/characters/Player", "engine/util/utils", "game/ui/Tooltip", "engine/tiles/AnimatedTileComponent", "engine/tiles/TileTransform", "engine/renderer/TextRender", "game/SaveManager"], function (exports_60, context_60) {
    "use strict";
    var Entity_5, component_11, point_30, BasicRenderComponent_3, Camera_4, NineSlice_2, Tilesets_7, ImageRender_4, UIStateManager_4, Items_2, Text_3, ImageFilters_2, Player_3, utils_5, Tooltip_2, AnimatedTileComponent_2, TileTransform_10, TextRender_4, SaveManager_1, SellMenu;
    var __moduleName = context_60 && context_60.id;
    return {
        setters: [
            function (Entity_5_1) {
                Entity_5 = Entity_5_1;
            },
            function (component_11_1) {
                component_11 = component_11_1;
            },
            function (point_30_1) {
                point_30 = point_30_1;
            },
            function (BasicRenderComponent_3_1) {
                BasicRenderComponent_3 = BasicRenderComponent_3_1;
            },
            function (Camera_4_1) {
                Camera_4 = Camera_4_1;
            },
            function (NineSlice_2_1) {
                NineSlice_2 = NineSlice_2_1;
            },
            function (Tilesets_7_1) {
                Tilesets_7 = Tilesets_7_1;
            },
            function (ImageRender_4_1) {
                ImageRender_4 = ImageRender_4_1;
            },
            function (UIStateManager_4_1) {
                UIStateManager_4 = UIStateManager_4_1;
            },
            function (Items_2_1) {
                Items_2 = Items_2_1;
            },
            function (Text_3_1) {
                Text_3 = Text_3_1;
            },
            function (ImageFilters_2_1) {
                ImageFilters_2 = ImageFilters_2_1;
            },
            function (Player_3_1) {
                Player_3 = Player_3_1;
            },
            function (utils_5_1) {
                utils_5 = utils_5_1;
            },
            function (Tooltip_2_1) {
                Tooltip_2 = Tooltip_2_1;
            },
            function (AnimatedTileComponent_2_1) {
                AnimatedTileComponent_2 = AnimatedTileComponent_2_1;
            },
            function (TileTransform_10_1) {
                TileTransform_10 = TileTransform_10_1;
            },
            function (TextRender_4_1) {
                TextRender_4 = TextRender_4_1;
            },
            function (SaveManager_1_1) {
                SaveManager_1 = SaveManager_1_1;
            }
        ],
        execute: function () {
            // this is mostly copied from CraftingMenu and InventoryDisplay
            SellMenu = /** @class */ (function (_super) {
                __extends(SellMenu, _super);
                function SellMenu() {
                    var _this = _super.call(this) || this;
                    _this.e = new Entity_5.Entity([_this]); // entity for this component
                    _this.coinsOffset = new point_30.Point(7, -11); // for the spinny coin in the corner
                    _this.isOpen = false;
                    _this.dimensions = new point_30.Point(160, 158);
                    _this.innerDimensions = _this.dimensions.minus(new point_30.Point(10, 14));
                    _this.scrollOffset = 0;
                    _this.justSoldRow = -1; // if this is non-negative, this row was just sold and will be highlighted
                    _this.justOpened = false; // prevent bug where the mouse is held down immediately
                    _this.tooltip = _this.e.addComponent(new Tooltip_2.Tooltip());
                    // caching stuff
                    _this.itemIcons = new Map();
                    _this.tintedIcons = new Map();
                    SellMenu.instance = _this;
                    _this.canvas = document.createElement("canvas");
                    _this.canvas.width = _this.innerDimensions.x;
                    _this.canvas.height = _this.innerDimensions.y;
                    _this.context = _this.canvas.getContext("2d", { alpha: false });
                    return _this;
                }
                SellMenu.prototype.update = function (updateData) {
                    if (updateData.input.isKeyDown(27 /* ESC */) && this.isOpen) {
                        this.close();
                    }
                    if (this.isOpen) {
                        this.tooltip.clear();
                        this.tooltip.position = updateData.input.mousePos;
                        var rowsTall = 6; // will need to change this if dimensions are adjusted
                        this.scrollOffset -= updateData.input.mouseWheelDeltaY * updateData.elapsedTimeMillis * 0.01;
                        this.scrollOffset = Math.floor(Math.max(Math.min(0, this.scrollOffset), -Math.max(this.items.length, rowsTall) * 24 + this.innerDimensions.y));
                        this.displayEntity = new Entity_5.Entity(this.renderRecipes(updateData, this.getTopLeft(), this.items));
                        this.justOpened = false;
                        if (this.justSoldRow !== -1) {
                            this.tooltip.say("Sold!");
                        }
                    }
                };
                SellMenu.prototype.close = function () {
                    this.isOpen = false;
                    this.displayEntity = null;
                    this.coinEntity = null;
                    this.tooltip.clear();
                };
                SellMenu.prototype.show = function (items) {
                    this.isOpen = true;
                    this.items = items;
                    this.scrollOffset = 0;
                    this.justOpened = true;
                    this.coinEntity = new Entity_5.Entity([
                        new AnimatedTileComponent_2.AnimatedTileComponent([Tilesets_7.Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150)], new TileTransform_10.TileTransform(this.getTopLeft().plus(this.coinsOffset)))
                    ]);
                };
                SellMenu.prototype.getTopLeft = function () {
                    var screenDimensions = Camera_4.Camera.instance.dimensions;
                    return screenDimensions.div(2).minus(this.dimensions.div(2));
                };
                SellMenu.prototype.canSell = function (sale) {
                    return this.justSoldRow === -1
                        && !this.justOpened
                        && Player_3.Player.instance.dude.inventory.getItemCount(sale.item) >= sale.count;
                };
                SellMenu.prototype.renderRecipes = function (updateData, topLeft, items) {
                    var _this = this;
                    var inv = Player_3.Player.instance.dude.inventory;
                    var coinCountComponent = new BasicRenderComponent_3.BasicRenderComponent(new TextRender_4.TextRender("x" + inv.getItemCount(0 /* COIN */), new point_30.Point(9, 1).plus(topLeft).plus(this.coinsOffset), Text_3.TEXT_SIZE, Text_3.TEXT_FONT, "#facb3e" /* YELLOW */, UIStateManager_4.UIStateManager.UI_SPRITE_DEPTH));
                    this.context.imageSmoothingEnabled = false; // TODO figure out why text is aliased
                    this.context.font = Text_3.TEXT_SIZE + "px '" + Text_3.TEXT_FONT + "'";
                    // draw background
                    var backgroundTiles = NineSlice_2.NineSlice.makeStretchedNineSliceComponents(Tilesets_7.Tilesets.instance.outdoorTiles.getNineSlice("invBoxFrame"), topLeft, this.dimensions);
                    backgroundTiles[0].transform.depth = UIStateManager_4.UIStateManager.UI_SPRITE_DEPTH;
                    this.context.fillStyle = "#9f294e" /* RED */;
                    this.context.fillRect(0, 0, this.innerDimensions.x, this.innerDimensions.y);
                    var width = this.innerDimensions.x;
                    var margin = 4;
                    var rowHeight = Tilesets_7.TILE_SIZE + margin * 2;
                    var innerOffset = this.dimensions.minus(this.innerDimensions).div(2);
                    var verticalTextOffset = 13;
                    var verticalOffset = this.scrollOffset;
                    var shiftedMousePos = updateData.input.mousePos.plusY(-this.scrollOffset);
                    for (var r = 0; r < items.length; r++) {
                        var hovered = utils_5.rectContains(topLeft.plusX(margin).plusY(rowHeight * r + margin * 2), new point_30.Point(this.innerDimensions.x, rowHeight), shiftedMousePos) && utils_5.rectContains(// within the frame itself
                        topLeft.plus(innerOffset), this.innerDimensions, updateData.input.mousePos);
                        var sale = items[r];
                        var saleItem = Items_2.ITEM_METADATA_MAP[sale.item];
                        var sellable = this.canSell(sale);
                        // sell the item
                        if (hovered && updateData.input.isMouseDown && sellable) {
                            // TODO a sound effect
                            inv.removeItem(sale.item, sale.count);
                            SaveManager_1.saveManager.setState({
                                coins: SaveManager_1.saveManager.getState().coins + sale.price
                            });
                            this.justSoldRow = r;
                            setTimeout(function () { return _this.justSoldRow = -1; }, 900);
                        }
                        if (hovered && !sellable) {
                            this.tooltip.say("Not enough resources");
                        }
                        else if (hovered) {
                            this.tooltip.say("Click to sell " + sale.count + "/" + inv.getItemCount(sale.item));
                        }
                        // craftable item
                        verticalOffset += margin;
                        var plainIcon = this.getItemIcon(sale.item);
                        var itemColor = "#dc4a7b" /* PINK */;
                        if (hovered) {
                            if (r === this.justSoldRow) {
                                itemColor = "#62232f" /* DARK_RED */;
                            }
                            else if (sellable) {
                                itemColor = "#fdf7ed" /* WHITE */;
                            }
                        }
                        if (!sellable) {
                            itemColor = "#62232f" /* DARK_RED */;
                        }
                        this.context.fillStyle = itemColor;
                        var craftedItemIcon = this.tintedIcon(plainIcon, itemColor);
                        this.drawIconAt(craftedItemIcon, margin, verticalOffset);
                        this.context.fillText(sale.count + "x " + saleItem.displayName, Tilesets_7.TILE_SIZE + margin * 2, verticalTextOffset + verticalOffset);
                        // coinage
                        var offsetFromRight = 0;
                        var coinIcon = this.getItemIcon(0 /* COIN */);
                        var ingredientIcon = this.tintedIcon(coinIcon, itemColor === "#fdf7ed" /* WHITE */ ? "#facb3e" /* YELLOW */ : itemColor); // make coin icon yellow on hover
                        this.context.fillStyle = itemColor;
                        var countStr = "" + sale.price;
                        offsetFromRight += (countStr.length * Text_3.TEXT_PIXEL_WIDTH + margin);
                        this.context.fillText(countStr, width - offsetFromRight, verticalTextOffset + verticalOffset);
                        offsetFromRight += Tilesets_7.TILE_SIZE;
                        this.drawIconAt(ingredientIcon, width - offsetFromRight, verticalOffset);
                        // draw line
                        verticalOffset += (margin + Tilesets_7.TILE_SIZE);
                        this.context.fillStyle = "#62232f" /* DARK_RED */;
                        this.context.fillRect(margin, verticalOffset, this.innerDimensions.x - 2 * margin, 1);
                    }
                    var renderComp = new BasicRenderComponent_3.BasicRenderComponent(new ImageRender_4.ImageRender(this.canvas, point_30.Point.ZERO, this.innerDimensions, innerOffset.plus(topLeft).apply(Math.floor), this.innerDimensions, UIStateManager_4.UIStateManager.UI_SPRITE_DEPTH - 10));
                    return __spreadArrays(backgroundTiles, [renderComp, coinCountComponent]);
                };
                SellMenu.prototype.drawIconAt = function (icon, x, y) {
                    this.context.drawImage(icon.image, icon.position.x, icon.position.y, icon.dimensions.x, icon.dimensions.y, x, y, icon.dimensions.x, icon.dimensions.y);
                };
                SellMenu.prototype.getItemIcon = function (item) {
                    var cached = this.itemIcons.get(item);
                    if (!!cached) {
                        return cached;
                    }
                    var icon = Items_2.ITEM_METADATA_MAP[item].inventoryIconSupplier();
                    this.itemIcons.set(item, icon);
                    return icon;
                };
                SellMenu.prototype.tintedIcon = function (icon, tint) {
                    if (tint === "#fdf7ed" /* WHITE */) {
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
                    var f = icon.filtered(ImageFilters_2.ImageFilters.tint(tint));
                    cache.set(icon, f);
                    return f;
                };
                SellMenu.prototype.getEntities = function () {
                    return [
                        this.e,
                        this.displayEntity,
                        this.coinEntity
                    ];
                };
                return SellMenu;
            }(component_11.Component));
            exports_60("SellMenu", SellMenu);
        }
    };
});
System.register("game/saves/uuid", [], function (exports_61, context_61) {
    "use strict";
    var newUUID;
    var __moduleName = context_61 && context_61.id;
    return {
        setters: [],
        execute: function () {
            // from https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
            exports_61("newUUID", newUUID = function () {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            });
        }
    };
});
System.register("game/world/Barrier", ["engine/collision/BoxCollider", "engine/collision/CollisionEngine", "engine/component", "engine/Entity", "engine/point"], function (exports_62, context_62) {
    "use strict";
    var BoxCollider_1, CollisionEngine_4, component_12, Entity_6, point_31, Barrier;
    var __moduleName = context_62 && context_62.id;
    return {
        setters: [
            function (BoxCollider_1_1) {
                BoxCollider_1 = BoxCollider_1_1;
            },
            function (CollisionEngine_4_1) {
                CollisionEngine_4 = CollisionEngine_4_1;
            },
            function (component_12_1) {
                component_12 = component_12_1;
            },
            function (Entity_6_1) {
                Entity_6 = Entity_6_1;
            },
            function (point_31_1) {
                point_31 = point_31_1;
            }
        ],
        execute: function () {
            Barrier = /** @class */ (function (_super) {
                __extends(Barrier, _super);
                function Barrier(position, dimensions, allow) {
                    if (allow === void 0) { allow = []; }
                    var _this = _super.call(this) || this;
                    _this.position = position;
                    _this.dimensions = dimensions;
                    _this.allow = allow;
                    return _this;
                }
                Barrier.prototype.awake = function () {
                    this.entity.addComponent(new BoxCollider_1.BoxCollider(this.position, this.dimensions, CollisionEngine_4.CollisionEngine.DEFAULT_LAYER));
                };
                Barrier.fromJson = function (obj) {
                    return new Entity_6.Entity([
                        new Barrier(point_31.Point.fromString(obj['p']), point_31.Point.fromString(obj['d']), obj['a'])
                    ]);
                };
                Barrier.prototype.toJson = function () {
                    return {
                        p: this.position.toString(),
                        d: this.dimensions.toString(),
                        a: this.allow
                    };
                };
                Barrier.PLAYER_ONLY = "player-only";
                return Barrier;
            }(component_12.Component));
            exports_62("Barrier", Barrier);
        }
    };
});
System.register("game/world/elements/ElementUtils", ["engine/point"], function (exports_63, context_63) {
    "use strict";
    var point_32, ElementUtils;
    var __moduleName = context_63 && context_63.id;
    return {
        setters: [
            function (point_32_1) {
                point_32 = point_32_1;
            }
        ],
        execute: function () {
            exports_63("ElementUtils", ElementUtils = {
                rectPoints: function (position, dimensions) {
                    var result = [];
                    for (var x = 0; x < dimensions.x; x++) {
                        for (var y = 0; y < dimensions.y; y++) {
                            result.push(position.plus(new point_32.Point(x, y)));
                        }
                    }
                    return result;
                }
            });
        }
    };
});
System.register("game/world/ground/GroundComponent", ["engine/component"], function (exports_64, context_64) {
    "use strict";
    var component_13, GroundComponent;
    var __moduleName = context_64 && context_64.id;
    return {
        setters: [
            function (component_13_1) {
                component_13 = component_13_1;
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
            }(component_13.Component));
            exports_64("GroundComponent", GroundComponent);
        }
    };
});
System.register("game/world/WorldLocation", ["engine/Entity", "engine/point", "engine/util/Grid", "game/characters/DudeFactory", "game/characters/NPC", "game/characters/Player", "game/cutscenes/Camera", "game/saves/uuid", "game/ui/HUD", "game/world/Barrier", "game/world/elements/Elements", "game/world/elements/ElementUtils", "game/world/ground/Ground", "game/world/LocationManager", "game/world/MapGenerator", "game/world/Teleporter"], function (exports_65, context_65) {
    "use strict";
    var Entity_7, point_33, Grid_1, DudeFactory_1, NPC_1, Player_4, Camera_5, uuid_1, HUD_1, Barrier_1, Elements_1, ElementUtils_1, Ground_1, LocationManager_4, MapGenerator_1, Teleporter_1, WorldLocation;
    var __moduleName = context_65 && context_65.id;
    return {
        setters: [
            function (Entity_7_1) {
                Entity_7 = Entity_7_1;
            },
            function (point_33_1) {
                point_33 = point_33_1;
            },
            function (Grid_1_1) {
                Grid_1 = Grid_1_1;
            },
            function (DudeFactory_1_1) {
                DudeFactory_1 = DudeFactory_1_1;
            },
            function (NPC_1_1) {
                NPC_1 = NPC_1_1;
            },
            function (Player_4_1) {
                Player_4 = Player_4_1;
            },
            function (Camera_5_1) {
                Camera_5 = Camera_5_1;
            },
            function (uuid_1_1) {
                uuid_1 = uuid_1_1;
            },
            function (HUD_1_1) {
                HUD_1 = HUD_1_1;
            },
            function (Barrier_1_1) {
                Barrier_1 = Barrier_1_1;
            },
            function (Elements_1_1) {
                Elements_1 = Elements_1_1;
            },
            function (ElementUtils_1_1) {
                ElementUtils_1 = ElementUtils_1_1;
            },
            function (Ground_1_1) {
                Ground_1 = Ground_1_1;
            },
            function (LocationManager_4_1) {
                LocationManager_4 = LocationManager_4_1;
            },
            function (MapGenerator_1_1) {
                MapGenerator_1 = MapGenerator_1_1;
            },
            function (Teleporter_1_1) {
                Teleporter_1 = Teleporter_1_1;
            }
        ],
        execute: function () {
            WorldLocation = /** @class */ (function () {
                function WorldLocation(isInterior, allowPlacing) {
                    this._uuid = uuid_1.newUUID();
                    this.dudes = new Set();
                    // Non-moving entities with tile coords (not pixel coords)
                    // Entities may be duplicated in multiple spots 
                    // (entities spawning multiple tiles eg a tent)
                    // BUT an entity should only be in one of these data structures
                    this.elements = new Grid_1.Grid();
                    this.occupied = new Grid_1.Grid();
                    this.ground = new Grid_1.Grid();
                    // TODO: Make dropped items saveable
                    this.droppedItems = new Set();
                    this.teleporters = {};
                    this.barriers = [];
                    this.isInterior = isInterior;
                    this.allowPlacing = allowPlacing;
                }
                Object.defineProperty(WorldLocation.prototype, "uuid", {
                    get: function () { return this._uuid; },
                    enumerable: false,
                    configurable: true
                });
                WorldLocation.prototype.addGroundElement = function (type, pos, data) {
                    if (data === void 0) { data = {}; }
                    if (!!this.ground.get(pos)) {
                        return null;
                    }
                    var groundComponent = Ground_1.Ground.instance.make(type, this, pos, data);
                    this.ground.set(pos, groundComponent);
                    return groundComponent;
                };
                /**
                 * @param type
                 * @param pos tile point
                 * @param data
                 */
                WorldLocation.prototype.addElement = function (type, pos, data) {
                    var _this = this;
                    if (data === void 0) { data = {}; }
                    var factory = Elements_1.Elements.instance.getElementFactory(type);
                    var elementPts = ElementUtils_1.ElementUtils.rectPoints(pos, factory.dimensions);
                    if (elementPts.some(function (pt) { return !!_this.elements.get(pt); })) {
                        return null;
                    }
                    var el = factory.make(this, pos, data);
                    if (el.type !== type) {
                        throw new Error("constructed element type doesn't match requested type");
                    }
                    else if (el.pos !== pos) {
                        throw new Error("constructed element position doesn't match requested position");
                    }
                    else if (!el.entity) {
                        throw new Error("constructed element has a null entity");
                    }
                    elementPts.forEach(function (pt) { return _this.elements.set(pt, el); });
                    el.occupiedPoints.forEach(function (pt) { return _this.occupied.set(pt, el); });
                    return el;
                };
                WorldLocation.prototype.getElementsOfType = function (type) {
                    return this.elements.values().filter(function (el) { return el.type === type; });
                };
                WorldLocation.prototype.getElements = function () {
                    return this.elements.values();
                };
                /**
                 * @returns the element at the position. NOTE this can return an
                 *          element even if this is an "empty" square
                 */
                WorldLocation.prototype.getElement = function (pos) {
                    return this.elements.get(pos);
                };
                /**
                 * @returns true if this position in the grid has a solid item
                 *          (aka it cannot be walked through)
                 */
                WorldLocation.prototype.isOccupied = function (pos) {
                    return !!this.occupied.get(pos);
                };
                WorldLocation.prototype.removeElementAt = function (pos) {
                    this.removeElement(this.getElement(pos));
                };
                WorldLocation.prototype.removeElement = function (el) {
                    this.elements.removeAll(el);
                    this.occupied.removeAll(el);
                };
                WorldLocation.prototype.findPath = function (tileStart, tileEnd, heuristic) {
                    var _this = this;
                    return this.occupied.findPath(tileStart, tileEnd, {
                        heuristic: function (pt) { return heuristic(pt, tileEnd); },
                        isOccupied: function (pt) {
                            // Assuming this is used for character-to-character pathfinding, the start
                            // and end points in the grid should be assumed to be open. For instance,
                            // the character might be slightly in an "occupied" square, EG if they
                            // are standing directly adjacent to the trunk of a tree.
                            if (pt.equals(tileStart) || pt.equals(tileEnd)) {
                                return false;
                            }
                            var buffer = 5;
                            if (pt.x < -MapGenerator_1.MapGenerator.MAP_SIZE / 2 - buffer || pt.x > MapGenerator_1.MapGenerator.MAP_SIZE / 2 + buffer
                                || pt.y < -MapGenerator_1.MapGenerator.MAP_SIZE / 2 - buffer || pt.y > MapGenerator_1.MapGenerator.MAP_SIZE / 2 + buffer) {
                                return true;
                            }
                            return !!_this.occupied.get(pt);
                        }
                    });
                };
                WorldLocation.prototype.addTeleporter = function (t) {
                    var teleporterId = Teleporter_1.Teleporters.teleporterId(t.to, t.id);
                    this.teleporters[teleporterId] = t.pos.toString();
                };
                WorldLocation.prototype.getTeleporter = function (toUUID) {
                    return Object.entries(this.teleporters)
                        .filter(function (kv) { return kv[0].startsWith(toUUID); })
                        .map(function (kv) { return ({
                        to: toUUID,
                        pos: point_33.Point.fromString(kv[1]),
                        id: Teleporter_1.Teleporters.getId(kv[0])
                    }); })[0];
                };
                WorldLocation.prototype.getTeleporterLinkedPos = function (to, id) {
                    var dest = LocationManager_4.LocationManager.instance.get(to);
                    var teleporterId = Teleporter_1.Teleporters.teleporterId(this.uuid, id);
                    var link = dest.teleporters[teleporterId];
                    if (!link) {
                        throw new Error("teleporter " + teleporterId + " not found");
                    }
                    return point_33.Point.fromString(link);
                };
                WorldLocation.prototype.npcUseTeleporter = function (dude, teleporter) {
                    var linkedLocation = LocationManager_4.LocationManager.instance.get(teleporter.to);
                    var linkedPosition = this.getTeleporterLinkedPos(teleporter.to, teleporter.id);
                    this.dudes.delete(dude);
                    linkedLocation.dudes.add(dude);
                    dude.location = linkedLocation;
                    var offset = dude.standingPosition.minus(dude.position);
                    dude.moveTo(linkedPosition.minus(offset), true);
                };
                WorldLocation.prototype.useTeleporter = function (to, id) {
                    var _this = this;
                    if (id === void 0) { id = null; }
                    HUD_1.HUD.instance.locationTransition.transition(function () {
                        var linkedLocation = LocationManager_4.LocationManager.instance.get(to);
                        var linkedPosition = _this.getTeleporterLinkedPos(to, id);
                        var p = Player_4.Player.instance.dude;
                        var beforeTeleportPos = p.standingPosition;
                        _this.dudes.delete(p);
                        linkedLocation.dudes.add(p);
                        p.location = linkedLocation;
                        LocationManager_4.LocationManager.instance.currentLocation = linkedLocation;
                        // fast-forward NPCs along their schedule
                        linkedLocation.dudes.forEach(function (d) { var _a; return (_a = d.entity.getComponent(NPC_1.NPC)) === null || _a === void 0 ? void 0 : _a.simulate(); });
                        // move player
                        var offset = p.standingPosition.minus(p.position);
                        p.moveTo(linkedPosition.minus(offset), true);
                        Camera_5.Camera.instance.jump(beforeTeleportPos.minus(p.standingPosition));
                    });
                };
                WorldLocation.prototype.setBarriers = function (barriers) {
                    this.barriers = barriers.map(function (b) { return b.entity || new Entity_7.Entity([b]); });
                };
                WorldLocation.prototype.getEntities = function () {
                    return Array.from(Array.from(this.dudes.values()).map(function (d) { return d.entity; }))
                        .concat(this.elements.values().map(function (c) { return c.entity; }))
                        .concat(this.ground.values().map(function (c) { return c.entity; }))
                        .concat(Array.from(this.droppedItems))
                        .concat(this.barriers);
                };
                WorldLocation.prototype.getDude = function (dudeType) {
                    return Array.from(this.dudes.values()).filter(function (d) { return d.type === dudeType; })[0];
                };
                WorldLocation.prototype.save = function () {
                    return {
                        uuid: this.uuid,
                        ground: this.saveGround(),
                        elements: this.saveElements(),
                        dudes: Array.from(this.dudes).filter(function (d) { return d.isAlive && !!d.entity; }).map(function (d) { return d.save(); }),
                        teleporters: this.teleporters,
                        barriers: this.barriers.map(function (b) { return b.getComponent(Barrier_1.Barrier).toJson(); }),
                        isInterior: this.isInterior,
                        allowPlacing: this.allowPlacing,
                    };
                };
                WorldLocation.prototype.saveElements = function () {
                    return this.elements.values().map(function (entity) {
                        var el = new Elements_1.SavedElement();
                        el.pos = entity.pos.toString();
                        el.type = entity.type;
                        el.obj = entity.save();
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
                WorldLocation.load = function (saveState) {
                    var n = new WorldLocation(saveState.isInterior, saveState.allowPlacing);
                    n._uuid = saveState.uuid;
                    n.teleporters = saveState.teleporters;
                    n.barriers = saveState.barriers.map(function (b) { return Barrier_1.Barrier.fromJson(b); });
                    saveState.elements.forEach(function (el) { return n.addElement(el.type, point_33.Point.fromString(el.pos), el.obj); });
                    saveState.ground.forEach(function (el) { return n.addGroundElement(el.type, point_33.Point.fromString(el.pos), el.obj); });
                    saveState.dudes.forEach(function (d) { return DudeFactory_1.DudeFactory.instance.load(d, n); });
                    return n;
                };
                return WorldLocation;
            }());
            exports_65("WorldLocation", WorldLocation);
        }
    };
});
System.register("game/world/GroundRenderer", ["engine/point", "engine/renderer/ImageRender", "engine/Entity", "engine/renderer/BasicRenderComponent", "game/cutscenes/Camera", "game/world/MapGenerator", "game/graphics/Tilesets", "engine/util/Grid", "game/world/LocationManager", "engine/tiles/TileTransform"], function (exports_66, context_66) {
    "use strict";
    var point_34, ImageRender_5, Entity_8, BasicRenderComponent_4, Camera_6, MapGenerator_2, Tilesets_8, Grid_2, LocationManager_5, TileTransform_11, GroundRenderer;
    var __moduleName = context_66 && context_66.id;
    return {
        setters: [
            function (point_34_1) {
                point_34 = point_34_1;
            },
            function (ImageRender_5_1) {
                ImageRender_5 = ImageRender_5_1;
            },
            function (Entity_8_1) {
                Entity_8 = Entity_8_1;
            },
            function (BasicRenderComponent_4_1) {
                BasicRenderComponent_4 = BasicRenderComponent_4_1;
            },
            function (Camera_6_1) {
                Camera_6 = Camera_6_1;
            },
            function (MapGenerator_2_1) {
                MapGenerator_2 = MapGenerator_2_1;
            },
            function (Tilesets_8_1) {
                Tilesets_8 = Tilesets_8_1;
            },
            function (Grid_2_1) {
                Grid_2 = Grid_2_1;
            },
            function (LocationManager_5_1) {
                LocationManager_5 = LocationManager_5_1;
            },
            function (TileTransform_11_1) {
                TileTransform_11 = TileTransform_11_1;
            }
        ],
        execute: function () {
            /**
             * This is an optimization that pre-renders ground on an offscreen canvas
             */
            GroundRenderer = /** @class */ (function () {
                function GroundRenderer() {
                    // no lights should live outside of this range
                    this.size = MapGenerator_2.MapGenerator.MAP_SIZE * Tilesets_8.TILE_SIZE * 2;
                    this.shift = new point_34.Point(this.size / 2, this.size / 2);
                    this.tiles = new Map();
                    this.gridDirty = true;
                    GroundRenderer._instance = this;
                    this.canvas = document.createElement("canvas");
                    this.canvas.width = this.size;
                    this.canvas.height = this.size;
                    this.context = this.canvas.getContext("2d");
                }
                Object.defineProperty(GroundRenderer, "instance", {
                    get: function () {
                        if (!this._instance) {
                            this._instance = new GroundRenderer();
                        }
                        return this._instance;
                    },
                    enumerable: false,
                    configurable: true
                });
                GroundRenderer.prototype.addTile = function (wl, position, tile) {
                    var _a;
                    this.checkPt(position);
                    var locationTileGrid = (_a = this.tiles.get(wl)) !== null && _a !== void 0 ? _a : new Grid_2.Grid();
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
                    var location = LocationManager_5.LocationManager.instance.currentLocation;
                    if (location.isInterior) {
                        return;
                    }
                    var locationTileGrid = this.tiles.get(location);
                    if (!locationTileGrid) {
                        return;
                    }
                    locationTileGrid.entries().forEach(function (entry) {
                        var pos = entry[0].times(Tilesets_8.TILE_SIZE).plus(_this.shift);
                        var tile = entry[1];
                        var imageRender = tile.toImageRender(new TileTransform_11.TileTransform());
                        _this.context.drawImage(imageRender.source, imageRender.sourcePosition.x, imageRender.sourcePosition.y, Tilesets_8.TILE_SIZE, Tilesets_8.TILE_SIZE, pos.x, pos.y, Tilesets_8.TILE_SIZE, Tilesets_8.TILE_SIZE);
                    });
                };
                GroundRenderer.prototype.getEntity = function () {
                    if (this.gridDirty || this.lastLocationRendered !== LocationManager_5.LocationManager.instance.currentLocation) {
                        this.renderToOffscreenCanvas();
                        this.gridDirty = false;
                        this.lastLocationRendered = LocationManager_5.LocationManager.instance.currentLocation;
                    }
                    var dimensions = Camera_6.Camera.instance.dimensions.plus(new point_34.Point(1, 1));
                    return new Entity_8.Entity([new BasicRenderComponent_4.BasicRenderComponent(new ImageRender_5.ImageRender(this.canvas, Camera_6.Camera.instance.position.plus(this.shift).apply(Math.floor), dimensions, Camera_6.Camera.instance.position.apply(Math.floor), dimensions, Number.MIN_SAFE_INTEGER))]);
                };
                return GroundRenderer;
            }());
            exports_66("GroundRenderer", GroundRenderer);
        }
    };
});
System.register("game/world/ground/Grass", ["engine/component", "engine/Entity", "engine/point", "engine/tiles/TileTransform", "game/graphics/Tilesets", "game/world/GroundRenderer", "game/world/LocationManager", "game/world/ground/GroundComponent"], function (exports_67, context_67) {
    "use strict";
    var component_14, Entity_9, point_35, TileTransform_12, Tilesets_9, GroundRenderer_1, LocationManager_6, GroundComponent_1, INDEX, TALL_GRASS_COUNT, makeGrass, TallGrass;
    var __moduleName = context_67 && context_67.id;
    return {
        setters: [
            function (component_14_1) {
                component_14 = component_14_1;
            },
            function (Entity_9_1) {
                Entity_9 = Entity_9_1;
            },
            function (point_35_1) {
                point_35 = point_35_1;
            },
            function (TileTransform_12_1) {
                TileTransform_12 = TileTransform_12_1;
            },
            function (Tilesets_9_1) {
                Tilesets_9 = Tilesets_9_1;
            },
            function (GroundRenderer_1_1) {
                GroundRenderer_1 = GroundRenderer_1_1;
            },
            function (LocationManager_6_1) {
                LocationManager_6 = LocationManager_6_1;
            },
            function (GroundComponent_1_1) {
                GroundComponent_1 = GroundComponent_1_1;
            }
        ],
        execute: function () {
            INDEX = "i";
            TALL_GRASS_COUNT = "t";
            exports_67("makeGrass", makeGrass = function (d) {
                var _a, _b;
                var tile;
                var index = (_a = d.data[INDEX]) !== null && _a !== void 0 ? _a : (Math.random() < .65 ? Math.floor(Math.random() * 4) : 0);
                var tallGrass = (_b = d.data[TALL_GRASS_COUNT]) !== null && _b !== void 0 ? _b : (Math.random() < 0.05 ? 1 : 0);
                if (index > 0) {
                    tile = Tilesets_9.Tilesets.instance.tilemap.getTileAt(new point_35.Point(0, index));
                }
                else {
                    tile = Tilesets_9.Tilesets.instance.tilemap.getTileAt(new point_35.Point(0, 7));
                }
                GroundRenderer_1.GroundRenderer.instance.addTile(d.wl, d.pos, tile);
                var e = new Entity_9.Entity();
                for (var i = 0; i < tallGrass; i++) {
                    e.addComponent(new TallGrass(d.pos));
                }
                return e.addComponent(new GroundComponent_1.GroundComponent(2 /* GRASS */, function () {
                    var _a;
                    return (_a = {},
                        _a[INDEX] = index,
                        _a[TALL_GRASS_COUNT] = tallGrass,
                        _a);
                }));
            });
            TallGrass = /** @class */ (function (_super) {
                __extends(TallGrass, _super);
                function TallGrass(tilePos) {
                    var _this = _super.call(this) || this;
                    _this.tilePos = tilePos;
                    var offset = new point_35.Point(-6 + Math.round(Math.random() * 11), -Tilesets_9.TILE_SIZE + 2 + Math.round(Math.random() * (Tilesets_9.TILE_SIZE - 2)));
                    var grassPos = tilePos.times(Tilesets_9.TILE_SIZE).plus(offset);
                    var render = Tilesets_9.Tilesets.instance.outdoorTiles
                        .getTileSource("grass" + Math.ceil(Math.random() * 2))
                        .toImageRender(new TileTransform_12.TileTransform(grassPos, null, 0, Math.random() > .5, false, grassPos.y + Tilesets_9.TILE_SIZE));
                    _this.getRenderMethods = function () { return [render]; };
                    return _this;
                }
                TallGrass.prototype.update = function () {
                    if (LocationManager_6.LocationManager.instance.currentLocation.isOccupied(this.tilePos)) {
                        this.delete();
                    }
                };
                return TallGrass;
            }(component_14.Component));
        }
    };
});
System.register("engine/tiles/ConnectingTileSchema", ["engine/point", "engine/tiles/TileTransform", "engine/tiles/ConnectingTile"], function (exports_68, context_68) {
    "use strict";
    var point_36, TileTransform_13, ConnectingTile_1, ConnectingTileSchema;
    var __moduleName = context_68 && context_68.id;
    return {
        setters: [
            function (point_36_1) {
                point_36 = point_36_1;
            },
            function (TileTransform_13_1) {
                TileTransform_13 = TileTransform_13_1;
            },
            function (ConnectingTile_1_1) {
                ConnectingTile_1 = ConnectingTile_1_1;
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
                    var n = this.get(grid, new point_36.Point(x, y - 1));
                    var s = this.get(grid, new point_36.Point(x, y + 1));
                    var e = this.get(grid, new point_36.Point(x + 1, y));
                    var w = this.get(grid, new point_36.Point(x - 1, y));
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
                    return result.toImageRender(new TileTransform_13.TileTransform(position.times(result.dimensions.x), null, rotation, false, false, Number.MIN_SAFE_INTEGER));
                };
                ConnectingTileSchema.prototype.get = function (grid, pt) {
                    var el = grid.get(pt);
                    if (el) {
                        var ct = el.entity.getComponent(ConnectingTile_1.ConnectingTile);
                        if (ct && ct.schema.canConnect(this)) {
                            return ct;
                        }
                    }
                };
                return ConnectingTileSchema;
            }());
            exports_68("ConnectingTileSchema", ConnectingTileSchema);
        }
    };
});
System.register("engine/tiles/ConnectingTile", ["engine/point", "engine/component"], function (exports_69, context_69) {
    "use strict";
    var point_37, component_15, ConnectingTile;
    var __moduleName = context_69 && context_69.id;
    return {
        setters: [
            function (point_37_1) {
                point_37 = point_37_1;
            },
            function (component_15_1) {
                component_15 = component_15_1;
            }
        ],
        execute: function () {
            ConnectingTile = /** @class */ (function (_super) {
                __extends(ConnectingTile, _super);
                /**
                 * Connecting tiles require a tile grid. The position parameter should be tile-scale, not pixel-scale.
                 */
                function ConnectingTile(schema, grid, position) {
                    if (position === void 0) { position = new point_37.Point(0, 0); }
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
            }(component_15.Component));
            exports_69("ConnectingTile", ConnectingTile);
        }
    };
});
System.register("game/world/ground/Path", ["game/world/ground/GroundComponent", "engine/Entity", "engine/tiles/ConnectingTile", "game/world/ground/Ground"], function (exports_70, context_70) {
    "use strict";
    var GroundComponent_2, Entity_10, ConnectingTile_2, Ground_2, makePath;
    var __moduleName = context_70 && context_70.id;
    return {
        setters: [
            function (GroundComponent_2_1) {
                GroundComponent_2 = GroundComponent_2_1;
            },
            function (Entity_10_1) {
                Entity_10 = Entity_10_1;
            },
            function (ConnectingTile_2_1) {
                ConnectingTile_2 = ConnectingTile_2_1;
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
            exports_70("makePath", makePath = function (d) {
                var e = new Entity_10.Entity();
                var c = new ConnectingTile_2.ConnectingTile(Ground_2.Ground.instance.PATH_CONNECTING_SCHEMA, d.wl.ground, d.pos);
                e.addComponent(c);
                return e.addComponent(new GroundComponent_2.GroundComponent(3 /* PATH */));
            });
        }
    };
});
System.register("game/world/ground/BasicGround", ["game/graphics/Tilesets", "game/world/ground/GroundComponent", "engine/Entity", "engine/tiles/TileTransform"], function (exports_71, context_71) {
    "use strict";
    var Tilesets_10, GroundComponent_3, Entity_11, TileTransform_14, makeBasicGround, makeBasicNineSliceGround;
    var __moduleName = context_71 && context_71.id;
    return {
        setters: [
            function (Tilesets_10_1) {
                Tilesets_10 = Tilesets_10_1;
            },
            function (GroundComponent_3_1) {
                GroundComponent_3 = GroundComponent_3_1;
            },
            function (Entity_11_1) {
                Entity_11 = Entity_11_1;
            },
            function (TileTransform_14_1) {
                TileTransform_14 = TileTransform_14_1;
            }
        ],
        execute: function () {
            // Function that takes a tileSource and returns a ground generation function for it
            exports_71("makeBasicGround", makeBasicGround = function (g, d, rotation) {
                var key = d.data["k"];
                var tile = Tilesets_10.Tilesets.instance.getBasicTileSource(key);
                var c = tile.toComponent(new TileTransform_14.TileTransform(d.pos.times(Tilesets_10.TILE_SIZE)));
                c.transform.depth = Number.MIN_SAFE_INTEGER;
                c.transform.rotation = rotation;
                return new Entity_11.Entity([c]).addComponent(new GroundComponent_3.GroundComponent(g, function () { return d.data; }));
            });
            exports_71("makeBasicNineSliceGround", makeBasicNineSliceGround = function (d) {
                var key = d.data["k"];
                var slice = Tilesets_10.Tilesets.instance.getBasicTileNineSlice(key);
                var nineSliceIndex = d.data["i"];
                var c = slice[nineSliceIndex].toComponent(new TileTransform_14.TileTransform(d.pos.times(Tilesets_10.TILE_SIZE)));
                c.transform.depth = Number.MIN_SAFE_INTEGER;
                return new Entity_11.Entity([c]).addComponent(new GroundComponent_3.GroundComponent(1 /* BASIC_NINE_SLICE */, function () { return d.data; }));
            });
        }
    };
});
System.register("game/world/ground/Ledge", ["engine/point", "game/graphics/Tilesets", "game/world/ground/GroundComponent", "engine/Entity", "engine/tiles/TileTransform"], function (exports_72, context_72) {
    "use strict";
    var point_38, Tilesets_11, GroundComponent_4, Entity_12, TileTransform_15, makeLedge;
    var __moduleName = context_72 && context_72.id;
    return {
        setters: [
            function (point_38_1) {
                point_38 = point_38_1;
            },
            function (Tilesets_11_1) {
                Tilesets_11 = Tilesets_11_1;
            },
            function (GroundComponent_4_1) {
                GroundComponent_4 = GroundComponent_4_1;
            },
            function (Entity_12_1) {
                Entity_12 = Entity_12_1;
            },
            function (TileTransform_15_1) {
                TileTransform_15 = TileTransform_15_1;
            }
        ],
        execute: function () {
            // TODO probably get rid of this
            exports_72("makeLedge", makeLedge = function (d) {
                var c = Tilesets_11.Tilesets.instance.tilemap.getTileAt(new point_38.Point(3, 2)).toComponent(new TileTransform_15.TileTransform(d.pos.times(Tilesets_11.TILE_SIZE)));
                c.transform.depth = Number.MIN_SAFE_INTEGER;
                return new Entity_12.Entity([c]).addComponent(new GroundComponent_4.GroundComponent(2 /* GRASS */, function () { return {}; }));
            });
        }
    };
});
System.register("game/world/ground/Ground", ["engine/point", "game/world/ground/Grass", "game/world/ground/Path", "engine/tiles/ConnectingTileSchema", "game/graphics/Tilesets", "game/world/ground/BasicGround", "game/world/ground/Ledge"], function (exports_73, context_73) {
    "use strict";
    var point_39, Grass_1, Path_1, ConnectingTileSchema_1, Tilesets_12, BasicGround_1, Ledge_1, SavedGround, Ground;
    var __moduleName = context_73 && context_73.id;
    return {
        setters: [
            function (point_39_1) {
                point_39 = point_39_1;
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
            function (Tilesets_12_1) {
                Tilesets_12 = Tilesets_12_1;
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
            exports_73("SavedGround", SavedGround);
            /**
             * Ground and elements are very similar, except that ground components are always 1x1
             */
            Ground = /** @class */ (function () {
                function Ground() {
                    var _a;
                    this.GROUND_FUNCTION_MAP = (_a = {},
                        _a[0 /* BASIC */] = function (d) { return BasicGround_1.makeBasicGround(0 /* BASIC */, d, 0); },
                        _a[5 /* BASIC_ROTATED_180 */] = function (d) { return BasicGround_1.makeBasicGround(5 /* BASIC_ROTATED_180 */, d, 180); },
                        _a[1 /* BASIC_NINE_SLICE */] = BasicGround_1.makeBasicNineSliceGround,
                        _a[2 /* GRASS */] = Grass_1.makeGrass,
                        _a[3 /* PATH */] = Path_1.makePath,
                        _a[4 /* LEDGE */] = Ledge_1.makeLedge,
                        _a);
                    this.PATH_CONNECTING_SCHEMA = new ConnectingTileSchema_1.ConnectingTileSchema()
                        .vertical(Tilesets_12.Tilesets.instance.tilemap.getTileAt(new point_39.Point(2, 6)))
                        .angle(Tilesets_12.Tilesets.instance.tilemap.getTileAt(new point_39.Point(0, 5)))
                        .tShape(Tilesets_12.Tilesets.instance.tilemap.getTileAt(new point_39.Point(3, 5)))
                        .plusShape(Tilesets_12.Tilesets.instance.tilemap.getTileAt(new point_39.Point(5, 5)))
                        .cap(Tilesets_12.Tilesets.instance.tilemap.getTileAt(new point_39.Point(2, 6)))
                        .single(Tilesets_12.Tilesets.instance.tilemap.getTileAt(new point_39.Point(7, 5)));
                    Ground._instance = this;
                }
                Object.defineProperty(Ground, "instance", {
                    get: function () {
                        if (!this._instance) {
                            this._instance = new Ground();
                        }
                        return this._instance;
                    },
                    enumerable: false,
                    configurable: true
                });
                Ground.prototype.make = function (type, wl, pos, data) {
                    var ground = this.GROUND_FUNCTION_MAP[type]({ wl: wl, pos: pos, data: data });
                    if (ground.type !== type) {
                        throw new Error("constructed ground type doesn't match requested type");
                    }
                    return ground;
                };
                return Ground;
            }());
            exports_73("Ground", Ground);
        }
    };
});
System.register("game/world/interior/InteriorUtils", ["engine/point", "game/graphics/Tilesets", "game/world/Barrier"], function (exports_74, context_74) {
    "use strict";
    var point_40, Tilesets_13, Barrier_2, BARRIER_WIDTH, SIDE_PADDING, TOP_BOT_PADDING, InteriorUtils;
    var __moduleName = context_74 && context_74.id;
    return {
        setters: [
            function (point_40_1) {
                point_40 = point_40_1;
            },
            function (Tilesets_13_1) {
                Tilesets_13 = Tilesets_13_1;
            },
            function (Barrier_2_1) {
                Barrier_2 = Barrier_2_1;
            }
        ],
        execute: function () {
            BARRIER_WIDTH = 30;
            SIDE_PADDING = 7;
            TOP_BOT_PADDING = 3;
            exports_74("InteriorUtils", InteriorUtils = {
                makeBarriers: function (tileDimensions) {
                    return [
                        // left
                        new Barrier_2.Barrier(new point_40.Point(-BARRIER_WIDTH + SIDE_PADDING, -BARRIER_WIDTH), new point_40.Point(BARRIER_WIDTH, tileDimensions.y * Tilesets_13.TILE_SIZE + 2 * BARRIER_WIDTH)),
                        // right
                        new Barrier_2.Barrier(new point_40.Point(tileDimensions.x * Tilesets_13.TILE_SIZE - SIDE_PADDING, -BARRIER_WIDTH), new point_40.Point(BARRIER_WIDTH, tileDimensions.y * Tilesets_13.TILE_SIZE + 2 * BARRIER_WIDTH)),
                        // top
                        new Barrier_2.Barrier(new point_40.Point(-BARRIER_WIDTH, -BARRIER_WIDTH + TOP_BOT_PADDING), new point_40.Point(tileDimensions.x * Tilesets_13.TILE_SIZE + 2 * BARRIER_WIDTH, BARRIER_WIDTH)),
                        // bottom
                        new Barrier_2.Barrier(new point_40.Point(-BARRIER_WIDTH, tileDimensions.y * Tilesets_13.TILE_SIZE - TOP_BOT_PADDING), new point_40.Point(tileDimensions.x * Tilesets_13.TILE_SIZE + 2 * BARRIER_WIDTH, BARRIER_WIDTH)),
                    ];
                }
            });
        }
    };
});
System.register("game/world/interior/House", ["engine/point", "game/graphics/Tilesets", "game/world/LocationManager", "game/world/WorldLocation", "game/world/interior/InteriorUtils"], function (exports_75, context_75) {
    "use strict";
    var point_41, Tilesets_14, LocationManager_7, WorldLocation_1, InteriorUtils_1, makeHouseInterior;
    var __moduleName = context_75 && context_75.id;
    return {
        setters: [
            function (point_41_1) {
                point_41 = point_41_1;
            },
            function (Tilesets_14_1) {
                Tilesets_14 = Tilesets_14_1;
            },
            function (LocationManager_7_1) {
                LocationManager_7 = LocationManager_7_1;
            },
            function (WorldLocation_1_1) {
                WorldLocation_1 = WorldLocation_1_1;
            },
            function (InteriorUtils_1_1) {
                InteriorUtils_1 = InteriorUtils_1_1;
            }
        ],
        execute: function () {
            exports_75("makeHouseInterior", makeHouseInterior = function (outside) {
                var l = new WorldLocation_1.WorldLocation(true, true);
                LocationManager_7.LocationManager.instance.add(l);
                var dimensions = new point_41.Point(7, 5);
                var interactablePos = new point_41.Point(dimensions.x / 2, dimensions.y).times(Tilesets_14.TILE_SIZE);
                var teleporter = { to: outside.uuid, pos: interactablePos.plusY(-4) };
                l.setBarriers(InteriorUtils_1.InteriorUtils.makeBarriers(dimensions));
                l.addTeleporter(teleporter);
                l.addElement(5 /* TELEPORTER */, new point_41.Point(3, 5), { to: outside.uuid, i: interactablePos.toString() });
                var woodType = Math.ceil(Math.random() * 2);
                for (var x = 0; x < dimensions.x; x++) {
                    for (var y = 0; y < dimensions.y; y++) {
                        l.addGroundElement(0 /* BASIC */, new point_41.Point(x, y), { k: "hardwood" + woodType });
                    }
                    var topAndBottomTiles = ["wallCenter", "wallCenter"];
                    if (x === 0) {
                        topAndBottomTiles = ["wallLeft", "wallRight"];
                    }
                    else if (x === dimensions.x - 1) {
                        topAndBottomTiles = ["wallRight", "wallLeft"];
                    }
                    l.addGroundElement(0 /* BASIC */, new point_41.Point(x, -1), { k: topAndBottomTiles[0] });
                    l.addGroundElement(5 /* BASIC_ROTATED_180 */, new point_41.Point(x, -2), { k: topAndBottomTiles[1] });
                }
                return l;
            });
        }
    };
});
System.register("game/world/elements/ElementFactory", [], function (exports_76, context_76) {
    "use strict";
    var ElementFactory;
    var __moduleName = context_76 && context_76.id;
    return {
        setters: [],
        execute: function () {
            ElementFactory = /** @class */ (function () {
                function ElementFactory() {
                }
                /**
                 * @param pos The position of the element in tile coordinates (not pixel coordinates!)
                 */
                ElementFactory.prototype.canPlace = function (pos) {
                    return true;
                };
                return ElementFactory;
            }());
            exports_76("ElementFactory", ElementFactory);
        }
    };
});
System.register("game/world/elements/House", ["engine/collision/BoxCollider", "engine/component", "engine/Entity", "engine/point", "engine/tiles/TileComponent", "engine/tiles/TileTransform", "game/graphics/Tilesets", "game/world/interior/House", "game/world/elements/ElementComponent", "game/world/elements/ElementFactory", "game/world/elements/ElementUtils", "game/world/elements/Interactable"], function (exports_77, context_77) {
    "use strict";
    var BoxCollider_2, component_16, Entity_13, point_42, TileComponent_4, TileTransform_16, Tilesets_15, House_1, ElementComponent_1, ElementFactory_1, ElementUtils_2, Interactable_1, RESIDENT_ATTRIBUTE, HouseFactory, House;
    var __moduleName = context_77 && context_77.id;
    return {
        setters: [
            function (BoxCollider_2_1) {
                BoxCollider_2 = BoxCollider_2_1;
            },
            function (component_16_1) {
                component_16 = component_16_1;
            },
            function (Entity_13_1) {
                Entity_13 = Entity_13_1;
            },
            function (point_42_1) {
                point_42 = point_42_1;
            },
            function (TileComponent_4_1) {
                TileComponent_4 = TileComponent_4_1;
            },
            function (TileTransform_16_1) {
                TileTransform_16 = TileTransform_16_1;
            },
            function (Tilesets_15_1) {
                Tilesets_15 = Tilesets_15_1;
            },
            function (House_1_1) {
                House_1 = House_1_1;
            },
            function (ElementComponent_1_1) {
                ElementComponent_1 = ElementComponent_1_1;
            },
            function (ElementFactory_1_1) {
                ElementFactory_1 = ElementFactory_1_1;
            },
            function (ElementUtils_2_1) {
                ElementUtils_2 = ElementUtils_2_1;
            },
            function (Interactable_1_1) {
                Interactable_1 = Interactable_1_1;
            }
        ],
        execute: function () {
            RESIDENT_ATTRIBUTE = "rez";
            /**
             * At runtime, a building exterior consists of several components:
             *   1. Tiles, the visual component
             *   2. A collider
             *   3. A door teleporter
             * Data that is saved:
             *   1. Element type
             *   2. "Occupied points" which determines occupied squares in the world grid
             *   3. Misc metadata about the building
             */
            HouseFactory = /** @class */ (function (_super) {
                __extends(HouseFactory, _super);
                function HouseFactory() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.type = 6 /* HOUSE */;
                    _this.dimensions = new point_42.Point(5, 4);
                    return _this;
                }
                HouseFactory.prototype.make = function (wl, pos, data) {
                    var _a;
                    var e = new Entity_13.Entity();
                    var destinationUUID = (_a = data["destinationUUID"]) !== null && _a !== void 0 ? _a : House_1.makeHouseInterior(wl).uuid;
                    var interactablePos = pos.plus(new point_42.Point(2.5, 3)).times(Tilesets_15.TILE_SIZE);
                    wl.addTeleporter({ to: destinationUUID, pos: interactablePos.plusY(12) });
                    // Set up tiles
                    var depth = (pos.y + 3) * Tilesets_15.TILE_SIZE;
                    var addTile = function (tileSheetPos, pos) {
                        var tile = Tilesets_15.Tilesets.instance.tilemap.getTileAt(tileSheetPos);
                        var el = e.addComponent(new TileComponent_4.TileComponent(tile, new TileTransform_16.TileTransform(pos.times(Tilesets_15.TILE_SIZE))));
                        el.transform.depth = depth;
                    };
                    // flat roof
                    var flatRoofTopLeft = new point_42.Point(6, 0);
                    var basePos = pos.plusX(1);
                    addTile(flatRoofTopLeft.plusX(1), basePos);
                    addTile(flatRoofTopLeft.plusX(2), basePos.plusX(1));
                    addTile(flatRoofTopLeft.plusX(3), basePos.plusX(2));
                    addTile(flatRoofTopLeft.plusY(2).plusX(1), basePos.plusY(1));
                    addTile(flatRoofTopLeft.plusY(2).plusX(2), basePos.plusY(1).plusX(1));
                    addTile(flatRoofTopLeft.plusY(2).plusX(3), basePos.plusY(1).plusX(2));
                    // door
                    addTile(new point_42.Point(7, 6), basePos.plusY(2).plusX(1));
                    // no windows
                    addTile(new point_42.Point(7, 5), basePos.plusY(2));
                    addTile(new point_42.Point(9, 5), basePos.plusY(2).plusX(2));
                    // alternative with windows
                    // addTile(new Point(5, 6), basePos.plusY(2))
                    // addTile(new Point(6, 6), basePos.plusY(2).plusX(2))
                    e.addComponent(new BoxCollider_2.BoxCollider(basePos.plus(new point_42.Point(0, 1)).times(Tilesets_15.TILE_SIZE), new point_42.Point(Tilesets_15.TILE_SIZE * 3, Tilesets_15.TILE_SIZE * 2)));
                    // Set up teleporter
                    e.addComponent(new Interactable_1.Interactable(interactablePos, function () { return wl.useTeleporter(destinationUUID); }, new point_42.Point(0, -Tilesets_15.TILE_SIZE * 1.4)));
                    var resident = data[RESIDENT_ATTRIBUTE];
                    var house = e.addComponent(new House(destinationUUID));
                    house.setResident(resident);
                    return e.addComponent(new ElementComponent_1.ElementComponent(6 /* HOUSE */, pos, ElementUtils_2.ElementUtils.rectPoints(pos.plus(new point_42.Point(1, 1)), new point_42.Point(3, 2)), function () {
                        var _a;
                        return (_a = {
                                destinationUUID: destinationUUID
                            },
                            _a[RESIDENT_ATTRIBUTE] = house.getResident(),
                            _a);
                    }));
                };
                return HouseFactory;
            }(ElementFactory_1.ElementFactory));
            exports_77("HouseFactory", HouseFactory);
            House = /** @class */ (function (_super) {
                __extends(House, _super);
                function House(locationUUID) {
                    var _this = _super.call(this) || this;
                    _this.locationUUID = locationUUID;
                    return _this;
                }
                House.prototype.hasResident = function () {
                    return !!this.resident;
                };
                House.prototype.isResidentPending = function () {
                    return this.resident === House.PENDING_RESIDENT;
                };
                House.prototype.setResidentPending = function () {
                    this.resident = House.PENDING_RESIDENT;
                };
                House.prototype.setResident = function (uuid) {
                    this.resident = uuid;
                };
                House.prototype.getResident = function () {
                    return this.resident;
                };
                House.PENDING_RESIDENT = "pending";
                return House;
            }(component_16.Component));
            exports_77("House", House);
        }
    };
});
System.register("game/characters/dialogues/BertoIntro", ["game/ui/DudeInteractIndicator", "game/ui/SellMenu", "game/world/elements/House", "game/world/events/EventQueue", "game/world/events/QueuedEvent", "game/world/LocationManager", "game/world/WorldTime", "game/characters/Dialogue"], function (exports_78, context_78) {
    "use strict";
    var _a, DudeInteractIndicator_2, SellMenu_1, House_2, EventQueue_3, QueuedEvent_3, LocationManager_8, WorldTime_2, Dialogue_2, BERTO_STARTING_DIALOGUE, BERT_MENU, BERT_MENU_INTRO, BERT_VILLAGERS, BERT_VILLAGER_NEEDS_HOUSE, BERT_LEAVING, getItemsToSell, getGreeting, BERTO_INTRO_DIALOGUE;
    var __moduleName = context_78 && context_78.id;
    return {
        setters: [
            function (DudeInteractIndicator_2_1) {
                DudeInteractIndicator_2 = DudeInteractIndicator_2_1;
            },
            function (SellMenu_1_1) {
                SellMenu_1 = SellMenu_1_1;
            },
            function (House_2_1) {
                House_2 = House_2_1;
            },
            function (EventQueue_3_1) {
                EventQueue_3 = EventQueue_3_1;
            },
            function (QueuedEvent_3_1) {
                QueuedEvent_3 = QueuedEvent_3_1;
            },
            function (LocationManager_8_1) {
                LocationManager_8 = LocationManager_8_1;
            },
            function (WorldTime_2_1) {
                WorldTime_2 = WorldTime_2_1;
            },
            function (Dialogue_2_1) {
                Dialogue_2 = Dialogue_2_1;
            }
        ],
        execute: function () {
            exports_78("BERTO_STARTING_DIALOGUE", BERTO_STARTING_DIALOGUE = "bert-start");
            BERT_MENU = "bert-menu", BERT_MENU_INTRO = "bert-menu-intro", BERT_VILLAGERS = "bert-villagers", BERT_VILLAGER_NEEDS_HOUSE = "bert-vil-house", BERT_LEAVING = "bert-leaving";
            getItemsToSell = function () {
                return [{
                        item: 2 /* WOOD */,
                        count: 10,
                        price: 5,
                    },
                    {
                        item: 1 /* ROCK */,
                        count: 10,
                        price: 5,
                    },
                    {
                        item: 5 /* IRON */,
                        count: 10,
                        price: 20,
                    }];
            };
            getGreeting = function () {
                return "Tally ho!";
            };
            exports_78("BERTO_INTRO_DIALOGUE", BERTO_INTRO_DIALOGUE = (_a = {},
                _a[BERTO_STARTING_DIALOGUE] = function () { return Dialogue_2.dialogueWithOptions(["Good morrow! I, Sir Berto of Dube, present myself unto thee as an emissary of The Honourable King Bob XVIII.",
                    "Should thy choose to collect raw materials, I will purchase them on behalf of The Kingdom.",
                    "Upon receipt of a fee and construction of an appropriate dwelling, I can also bring tax-paying subjects to populate thy settlement.",
                    "Tradesmen! Knights! Worthless peons to scrub latrines and polish thy armor!",
                    "Art thou interested in any of my services at the moment?"], DudeInteractIndicator_2.DudeInteractIndicator.IMPORTANT_DIALOGUE, Dialogue_2.option("Sure!", BERT_MENU, true), Dialogue_2.option("Maybe later.", BERT_MENU_INTRO, false)); },
                _a[BERT_MENU_INTRO] = function () { return Dialogue_2.dialogue([getGreeting()], function () { return new Dialogue_2.NextDialogue(BERT_MENU, true); }); },
                _a[BERT_MENU] = function () { return Dialogue_2.dialogueWithOptions(["How shall I assist thee?"], DudeInteractIndicator_2.DudeInteractIndicator.NONE, new Dialogue_2.DialogueOption("What are you buying?", function () {
                    SellMenu_1.SellMenu.instance.show(getItemsToSell());
                    return new Dialogue_2.NextDialogue(BERT_MENU_INTRO, false);
                }), new Dialogue_2.DialogueOption("We need a new settler.", function () {
                    return new Dialogue_2.NextDialogue(BERT_VILLAGERS, true);
                }), Dialogue_2.option("Never mind.", BERT_MENU_INTRO, false)); },
                _a[BERT_VILLAGERS] = function () { return Dialogue_2.dialogueWithOptions(["At present, only felonious peons can be spared by The King.",
                    "Shall I return to The Kingdom, bringing word that thou art requesting a settler?"], DudeInteractIndicator_2.DudeInteractIndicator.NONE, new Dialogue_2.DialogueOption("Bring me a criminal.", function () {
                    var openHouses = LocationManager_8.LocationManager.instance.currentLocation.getElementsOfType(6 /* HOUSE */)
                        .map(function (e) { return e.entity.getComponent(House_2.House); })
                        .filter(function (house) { return !house.hasResident(); });
                    if (openHouses.length === 0) {
                        return new Dialogue_2.NextDialogue(BERT_VILLAGER_NEEDS_HOUSE, true);
                    }
                    openHouses[0].setResidentPending();
                    EventQueue_3.EventQueue.instance.addEvent({
                        type: QueuedEvent_3.QueuedEventType.HERALD_DEPARTURE,
                        time: WorldTime_2.WorldTime.instance.time
                    });
                    return new Dialogue_2.NextDialogue(BERT_LEAVING, true);
                }), Dialogue_2.option("Never mind.", BERT_MENU_INTRO, false)); },
                _a[BERT_VILLAGER_NEEDS_HOUSE] = function () { return Dialogue_2.dialogue(["Alas, thy settlement does not have appropriate lodging for a new settler.",
                    "Return to me once thou hast constructed a home."], function () { return new Dialogue_2.NextDialogue(BERT_MENU_INTRO, false); }); },
                _a[BERT_LEAVING] = function () { return Dialogue_2.dialogue(["I shall return posthaste!"], function () { return new Dialogue_2.NextDialogue(BERT_MENU_INTRO, false); }); },
                _a));
        }
    };
});
System.register("game/characters/dialogues/GenericDialogue", ["engine/util/Lists", "game/characters/Dialogue"], function (exports_79, context_79) {
    "use strict";
    var _a, Lists_3, Dialogue_3, GenericDialogue, GENERIC_DIALOGUE;
    var __moduleName = context_79 && context_79.id;
    return {
        setters: [
            function (Lists_3_1) {
                Lists_3 = Lists_3_1;
            },
            function (Dialogue_3_1) {
                Dialogue_3 = Dialogue_3_1;
            }
        ],
        execute: function () {
            (function (GenericDialogue) {
                GenericDialogue["HELLO"] = "hello";
            })(GenericDialogue || (GenericDialogue = {}));
            exports_79("GenericDialogue", GenericDialogue);
            exports_79("GENERIC_DIALOGUE", GENERIC_DIALOGUE = (_a = {},
                _a[GenericDialogue.HELLO] = function () { return Dialogue_3.dialogue([Lists_3.Lists.oneOf(["Hello!", "Greetings."])], function () { return new Dialogue_3.NextDialogue(GenericDialogue.HELLO, false); }); },
                _a));
        }
    };
});
System.register("game/world/Vignette", ["engine/component", "engine/point", "engine/renderer/ImageRender", "game/ui/Color", "game/ui/UIStateManager"], function (exports_80, context_80) {
    "use strict";
    var component_17, point_43, ImageRender_6, Color_2, UIStateManager_5, Vignette;
    var __moduleName = context_80 && context_80.id;
    return {
        setters: [
            function (component_17_1) {
                component_17 = component_17_1;
            },
            function (point_43_1) {
                point_43 = point_43_1;
            },
            function (ImageRender_6_1) {
                ImageRender_6 = ImageRender_6_1;
            },
            function (Color_2_1) {
                Color_2 = Color_2_1;
            },
            function (UIStateManager_5_1) {
                UIStateManager_5 = UIStateManager_5_1;
            }
        ],
        execute: function () {
            Vignette = /** @class */ (function (_super) {
                __extends(Vignette, _super);
                function Vignette(topLeftPosition, diameter) {
                    var _this = _super.call(this) || this;
                    _this.padding = 128;
                    _this.rings = 8;
                    _this.ringWidth = _this.padding / _this.rings;
                    _this.getRenderMethods = function () { return [_this.render]; };
                    _this.start = function () {
                        var canvas = document.createElement("canvas");
                        canvas.width = canvas.height = diameter;
                        var context = canvas.getContext("2d");
                        var imageData = context.getImageData(0, 0, diameter, diameter);
                        var rgb = Color_2.getRGB("#222222" /* BLACK */);
                        var center = new point_43.Point(diameter / 2, diameter / 2).apply(Math.floor);
                        for (var x = 0; x < diameter; x++) {
                            for (var y = 0; y < diameter; y++) {
                                var i = (x + y * diameter) * 4;
                                var pt = new point_43.Point(x, y);
                                var dist = pt.distanceTo(center);
                                var distFromLightEdge = dist - (diameter / 2 - _this.padding);
                                if (distFromLightEdge > 0) {
                                    var ring = Math.min(Math.floor(distFromLightEdge / _this.ringWidth), _this.rings);
                                    imageData.data[i + 0] = rgb[0];
                                    imageData.data[i + 1] = rgb[1];
                                    imageData.data[i + 2] = rgb[2];
                                    imageData.data[i + 3] = 255 * ring / _this.rings * .95;
                                }
                            }
                        }
                        context.putImageData(imageData, 0, 0);
                        _this.render = new ImageRender_6.ImageRender(canvas, new point_43.Point(0, 0), new point_43.Point(diameter, diameter), topLeftPosition, new point_43.Point(diameter, diameter), UIStateManager_5.UIStateManager.UI_SPRITE_DEPTH - 100 // make sure all UI goes on top of light
                        );
                    };
                    return _this;
                }
                return Vignette;
            }(component_17.Component));
            exports_80("Vignette", Vignette);
        }
    };
});
System.register("game/world/OutdoorDarknessMask", ["engine/Entity", "engine/point", "engine/renderer/BasicRenderComponent", "engine/renderer/ImageRender", "engine/util/Grid", "game/cutscenes/Camera", "game/graphics/Tilesets", "game/ui/UIStateManager", "game/world/LocationManager", "game/world/MapGenerator", "game/world/TimeUnit", "game/world/Vignette", "game/world/WorldTime"], function (exports_81, context_81) {
    "use strict";
    var Entity_14, point_44, BasicRenderComponent_5, ImageRender_7, Grid_3, Camera_7, Tilesets_16, UIStateManager_6, LocationManager_9, MapGenerator_3, TimeUnit_2, Vignette_1, WorldTime_3, OutdoorDarknessMask;
    var __moduleName = context_81 && context_81.id;
    return {
        setters: [
            function (Entity_14_1) {
                Entity_14 = Entity_14_1;
            },
            function (point_44_1) {
                point_44 = point_44_1;
            },
            function (BasicRenderComponent_5_1) {
                BasicRenderComponent_5 = BasicRenderComponent_5_1;
            },
            function (ImageRender_7_1) {
                ImageRender_7 = ImageRender_7_1;
            },
            function (Grid_3_1) {
                Grid_3 = Grid_3_1;
            },
            function (Camera_7_1) {
                Camera_7 = Camera_7_1;
            },
            function (Tilesets_16_1) {
                Tilesets_16 = Tilesets_16_1;
            },
            function (UIStateManager_6_1) {
                UIStateManager_6 = UIStateManager_6_1;
            },
            function (LocationManager_9_1) {
                LocationManager_9 = LocationManager_9_1;
            },
            function (MapGenerator_3_1) {
                MapGenerator_3 = MapGenerator_3_1;
            },
            function (TimeUnit_2_1) {
                TimeUnit_2 = TimeUnit_2_1;
            },
            function (Vignette_1_1) {
                Vignette_1 = Vignette_1_1;
            },
            function (WorldTime_3_1) {
                WorldTime_3 = WorldTime_3_1;
            }
        ],
        execute: function () {
            OutdoorDarknessMask = /** @class */ (function () {
                function OutdoorDarknessMask() {
                    // no lights should live outside of this range
                    this.size = MapGenerator_3.MapGenerator.MAP_SIZE * Tilesets_16.TILE_SIZE;
                    this.shift = new point_44.Point(this.size / 2, this.size / 2);
                    this.lightTiles = new Map(); // grid of light diameter
                    this.gridDirty = true;
                    this.darkness = 0.4;
                    this.circleCache = new Map();
                    this.vignetteEntity = new Entity_14.Entity([new Vignette_1.Vignette(new point_44.Point(1, 1).times(-this.size / 2), this.size)]);
                    OutdoorDarknessMask._instance = this;
                }
                Object.defineProperty(OutdoorDarknessMask, "instance", {
                    get: function () {
                        if (!this._instance) {
                            this._instance = new OutdoorDarknessMask();
                        }
                        return this._instance;
                    },
                    enumerable: false,
                    configurable: true
                });
                OutdoorDarknessMask.prototype.start = function () {
                    var _this = this;
                    this.canvas = document.createElement("canvas");
                    this.canvas.width = this.size;
                    this.canvas.height = this.size;
                    this.context = this.canvas.getContext("2d");
                    // refresh every so often to update transitioning color
                    setInterval(function () { return _this.updateColorForTime(); }, 1000);
                };
                OutdoorDarknessMask.prototype.addLight = function (wl, position, diameter) {
                    var _a;
                    if (diameter === void 0) { diameter = 16; }
                    if (diameter % 2 !== 0) {
                        throw new Error("only even circle px diameters work right now");
                    }
                    this.checkPt(position);
                    var locationLightGrid = (_a = this.lightTiles.get(wl)) !== null && _a !== void 0 ? _a : new Grid_3.Grid();
                    locationLightGrid.set(position, diameter);
                    this.lightTiles.set(wl, locationLightGrid);
                    this.gridDirty = true;
                };
                OutdoorDarknessMask.prototype.removeLight = function (wl, position) {
                    this.checkPt(position);
                    var locationLightGrid = this.lightTiles.get(wl);
                    if (!locationLightGrid) {
                        return; // it is ok to fail silently here
                    }
                    locationLightGrid.remove(position);
                    this.gridDirty = true;
                };
                /**
                 * @return alpha 0-255 (total light to total darkness)
                 */
                OutdoorDarknessMask.prototype.isDark = function (pixelPt) {
                    if (this.darkness < .6) {
                        return false;
                    }
                    var grid = this.lightTiles.get(LocationManager_9.LocationManager.instance.currentLocation);
                    // TODO optimize this pre-computing light values in a grid, this will get expensive as we add more lights
                    return !grid ? true : !grid.entries().some(function (entry) { return entry[0].distanceTo(pixelPt) < entry[1] * .5; });
                };
                OutdoorDarknessMask.prototype.updateColorForTime = function () {
                    var time = WorldTime_3.WorldTime.instance.time;
                    var hour = (time % TimeUnit_2.TimeUnit.DAY) / TimeUnit_2.TimeUnit.HOUR;
                    var timeSoFar = time % TimeUnit_2.TimeUnit.HOUR;
                    var clamp01 = function (val) { return Math.min(Math.max(val, 0), 1); };
                    var nightColor = this.colorFromString("#222222" /* BLACK */, 0.8);
                    var sunriseColor = this.colorFromString("#dc4a7b" /* PINK */, 0.2);
                    var dayColor = this.colorFromString("#f78697" /* LIGHT_PINK */, 0);
                    var sunsetColor = this.colorFromString("#473579" /* DARK_PURPLE */, 0.2);
                    var transitionTime = TimeUnit_2.TimeUnit.HOUR;
                    // TODO: make these transitions quicker
                    if (hour >= 5 && hour < 6) {
                        var percentTransitioned = clamp01((timeSoFar + (hour - 5) * TimeUnit_2.TimeUnit.HOUR) / transitionTime);
                        this.lerpColorString(nightColor, sunriseColor, percentTransitioned); // sunrise		
                    }
                    else if (hour >= 6 && hour < 20) {
                        var percentTransitioned = clamp01((timeSoFar + (hour - 6) * TimeUnit_2.TimeUnit.HOUR) / transitionTime);
                        this.lerpColorString(sunriseColor, dayColor, percentTransitioned); // day	
                    }
                    else if (hour >= 20 && hour < 21) {
                        var percentTransitioned = clamp01((timeSoFar + (hour - 20) * TimeUnit_2.TimeUnit.HOUR) / transitionTime);
                        this.lerpColorString(dayColor, sunsetColor, percentTransitioned); // sunset
                    }
                    else {
                        var percentTransitioned = clamp01((timeSoFar + (24 + hour - 21) % 24 * TimeUnit_2.TimeUnit.HOUR) / transitionTime);
                        this.lerpColorString(sunsetColor, nightColor, percentTransitioned); // night			
                    }
                };
                /**
                 * @param colorString A string from the Color object
                 * @param a alpha double 0-1
                 */
                OutdoorDarknessMask.prototype.colorFromString = function (colorString, a) {
                    var noHash = colorString.replace("#", "");
                    var r = parseInt(noHash.substring(0, 2), 16);
                    var g = parseInt(noHash.substring(2, 4), 16);
                    var b = parseInt(noHash.substring(4, 6), 16);
                    return { r: r, g: g, b: b, a: a };
                };
                OutdoorDarknessMask.prototype.lerpColorString = function (color1, color2, percentTransitioned) {
                    var lerp = function (a, b) { return a + (b - a) * percentTransitioned; };
                    var oldColor = this.color;
                    var r = lerp(color1.r, color2.r);
                    var g = lerp(color1.g, color2.g);
                    var b = lerp(color1.b, color2.b);
                    var a = lerp(color1.a, color2.a);
                    this.color = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
                    this.darkness = a;
                    if (oldColor !== this.color) {
                        this.gridDirty = true;
                    }
                };
                OutdoorDarknessMask.prototype.checkPt = function (position) {
                    var lim = this.size / 2;
                    if (position.x < -lim || position.x > lim || position.y < -lim || position.y > lim) {
                        throw new Error("light is outside of valid bounds");
                    }
                };
                OutdoorDarknessMask.prototype.renderToOffscreenCanvas = function () {
                    var _this = this;
                    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    var location = LocationManager_9.LocationManager.instance.currentLocation;
                    if (this.darkness === 0) {
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
                        var circleOffset = new point_44.Point(-.5, -.5).times(diameter);
                        var adjustedPos = pos.plus(_this.shift).plus(circleOffset); //.plus(new Point(TILE_SIZE/2, TILE_SIZE/2))
                        _this.makeLightCircle(diameter, adjustedPos, _this.darkness / 2);
                        var innerOffset = Math.floor(diameter / 2 * 1 / 4);
                        _this.makeLightCircle(diameter - innerOffset * 2, adjustedPos.plus(new point_44.Point(innerOffset, innerOffset)), 0);
                    });
                };
                OutdoorDarknessMask.prototype.makeLightCircle = function (diameter, position, alpha) {
                    var center = new point_44.Point(diameter / 2, diameter / 2).minus(new point_44.Point(.5, .5));
                    var imageData = this.context.getImageData(position.x, position.y, diameter, diameter);
                    var cachedCircle = this.circleCache.get(diameter);
                    if (!cachedCircle) {
                        cachedCircle = [];
                        for (var x = 0; x < diameter; x++) {
                            for (var y = 0; y < diameter; y++) {
                                var i = (x + y * diameter) * 4;
                                var pt = new point_44.Point(x, y);
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
                OutdoorDarknessMask.prototype.getEntities = function () {
                    if (!this.color) {
                        this.updateColorForTime();
                    }
                    if (this.gridDirty || this.lastLocationRendered !== LocationManager_9.LocationManager.instance.currentLocation) {
                        this.renderToOffscreenCanvas();
                        // this.updateLitGrid()
                        this.gridDirty = false;
                        this.lastLocationRendered = LocationManager_9.LocationManager.instance.currentLocation;
                    }
                    // prevent tint not extending to the edge
                    var dimensions = Camera_7.Camera.instance.dimensions.plus(new point_44.Point(1, 1));
                    var dynamicDarknessEntity = new Entity_14.Entity([new BasicRenderComponent_5.BasicRenderComponent(new ImageRender_7.ImageRender(this.canvas, Camera_7.Camera.instance.position.plus(this.shift).apply(Math.floor), dimensions, Camera_7.Camera.instance.position.apply(Math.floor), dimensions, UIStateManager_6.UIStateManager.UI_SPRITE_DEPTH - 100 // make sure all UI goes on top of light
                        ))]);
                    var result = [dynamicDarknessEntity];
                    var location = LocationManager_9.LocationManager.instance.currentLocation;
                    if (!location.isInterior) {
                        result.push(this.vignetteEntity);
                    }
                    return result;
                };
                return OutdoorDarknessMask;
            }());
            exports_81("OutdoorDarknessMask", OutdoorDarknessMask);
        }
    };
});
System.register("game/world/elements/Campfire", ["engine/component", "engine/tiles/TileComponent", "engine/tiles/AnimatedTileComponent", "game/graphics/Tilesets", "engine/tiles/TileTransform", "engine/point", "game/world/elements/Interactable", "engine/collision/BoxCollider", "game/world/elements/ElementComponent", "engine/Entity", "game/world/OutdoorDarknessMask", "game/ui/DialogueDisplay", "game/world/WorldTime", "game/world/TimeUnit", "game/characters/dialogues/ItemDialogues", "game/world/elements/ElementFactory"], function (exports_82, context_82) {
    "use strict";
    var component_18, TileComponent_5, AnimatedTileComponent_3, Tilesets_17, TileTransform_17, point_45, Interactable_2, BoxCollider_3, ElementComponent_2, Entity_15, OutdoorDarknessMask_1, DialogueDisplay_1, WorldTime_4, TimeUnit_3, ItemDialogues_1, ElementFactory_2, CampfireFactory, Campfire;
    var __moduleName = context_82 && context_82.id;
    return {
        setters: [
            function (component_18_1) {
                component_18 = component_18_1;
            },
            function (TileComponent_5_1) {
                TileComponent_5 = TileComponent_5_1;
            },
            function (AnimatedTileComponent_3_1) {
                AnimatedTileComponent_3 = AnimatedTileComponent_3_1;
            },
            function (Tilesets_17_1) {
                Tilesets_17 = Tilesets_17_1;
            },
            function (TileTransform_17_1) {
                TileTransform_17 = TileTransform_17_1;
            },
            function (point_45_1) {
                point_45 = point_45_1;
            },
            function (Interactable_2_1) {
                Interactable_2 = Interactable_2_1;
            },
            function (BoxCollider_3_1) {
                BoxCollider_3 = BoxCollider_3_1;
            },
            function (ElementComponent_2_1) {
                ElementComponent_2 = ElementComponent_2_1;
            },
            function (Entity_15_1) {
                Entity_15 = Entity_15_1;
            },
            function (OutdoorDarknessMask_1_1) {
                OutdoorDarknessMask_1 = OutdoorDarknessMask_1_1;
            },
            function (DialogueDisplay_1_1) {
                DialogueDisplay_1 = DialogueDisplay_1_1;
            },
            function (WorldTime_4_1) {
                WorldTime_4 = WorldTime_4_1;
            },
            function (TimeUnit_3_1) {
                TimeUnit_3 = TimeUnit_3_1;
            },
            function (ItemDialogues_1_1) {
                ItemDialogues_1 = ItemDialogues_1_1;
            },
            function (ElementFactory_2_1) {
                ElementFactory_2 = ElementFactory_2_1;
            }
        ],
        execute: function () {
            CampfireFactory = /** @class */ (function (_super) {
                __extends(CampfireFactory, _super);
                function CampfireFactory() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.type = 4 /* CAMPFIRE */;
                    _this.dimensions = new point_45.Point(1, 1);
                    return _this;
                }
                CampfireFactory.prototype.make = function (wl, pos, data) {
                    var _a, _b;
                    var e = new Entity_15.Entity();
                    var scaledPos = pos.times(Tilesets_17.TILE_SIZE);
                    var campfireOff = e.addComponent(new TileComponent_5.TileComponent(Tilesets_17.Tilesets.instance.outdoorTiles.getTileSource("campfireOff"), new TileTransform_17.TileTransform(scaledPos)));
                    campfireOff.transform.depth = scaledPos.y + Tilesets_17.TILE_SIZE;
                    var campfireOn = e.addComponent(new AnimatedTileComponent_3.AnimatedTileComponent([Tilesets_17.Tilesets.instance.outdoorTiles.getTileSetAnimation("campfireOn", 2, 200)], new TileTransform_17.TileTransform(scaledPos)));
                    campfireOn.transform.depth = scaledPos.y + Tilesets_17.TILE_SIZE;
                    var offset = new point_45.Point(0, 5);
                    e.addComponent(new BoxCollider_3.BoxCollider(scaledPos.plus(offset), new point_45.Point(Tilesets_17.TILE_SIZE, Tilesets_17.TILE_SIZE).minus(offset)));
                    var logsOnFire = (_a = data["logs"]) !== null && _a !== void 0 ? _a : 0;
                    var lastLogConsumedTime = (_b = data["llct"]) !== null && _b !== void 0 ? _b : 0;
                    var updateFire = function (logCount) {
                        campfireOff.enabled = logCount === 0;
                        campfireOn.enabled = !campfireOff.enabled;
                        var lightCenterPos = pos.times(Tilesets_17.TILE_SIZE).plus(new point_45.Point(Tilesets_17.TILE_SIZE / 2, Tilesets_17.TILE_SIZE / 2));
                        if (campfireOn.enabled) {
                            OutdoorDarknessMask_1.OutdoorDarknessMask.instance.addLight(wl, lightCenterPos, Tilesets_17.TILE_SIZE * (5 + logCount / 2));
                        }
                        else {
                            OutdoorDarknessMask_1.OutdoorDarknessMask.instance.removeLight(wl, lightCenterPos);
                        }
                    };
                    var cf = e.addComponent(new Campfire(logsOnFire, lastLogConsumedTime, updateFire));
                    // Toggle between on/off when interacted with
                    e.addComponent(new Interactable_2.Interactable(scaledPos.plus(new point_45.Point(Tilesets_17.TILE_SIZE / 2, Tilesets_17.TILE_SIZE / 2)), function () {
                        DialogueDisplay_1.DialogueDisplay.instance.startDialogue(cf);
                    }, new point_45.Point(1, -Tilesets_17.TILE_SIZE)));
                    return e.addComponent(new ElementComponent_2.ElementComponent(4 /* CAMPFIRE */, pos, [pos], function () { return { logs: cf.logs, llct: cf.lastLogConsumedTime }; }));
                };
                return CampfireFactory;
            }(ElementFactory_2.ElementFactory));
            exports_82("CampfireFactory", CampfireFactory);
            Campfire = /** @class */ (function (_super) {
                __extends(Campfire, _super);
                function Campfire(logs, lastLogConsumedTime, updateFire) {
                    var _this = _super.call(this) || this;
                    _this.dialogue = ItemDialogues_1.CAMPFIRE_DIALOGUE;
                    _this.logs = logs;
                    _this.lastLogConsumedTime = lastLogConsumedTime;
                    _this.updateFire = updateFire;
                    updateFire(_this.logs);
                    return _this;
                }
                Campfire.prototype.update = function () {
                    var logsBeforeUpdate = this.logs;
                    while (this.logs > 0 && WorldTime_4.WorldTime.instance.time > this.lastLogConsumedTime + Campfire.LOG_DURATION) {
                        this.lastLogConsumedTime += Campfire.LOG_DURATION;
                        this.logs--;
                    }
                    if (logsBeforeUpdate !== this.logs) {
                        this.updateFire(this.logs);
                    }
                };
                Campfire.prototype.addLogs = function (count) {
                    if (this.logs === 0) {
                        this.lastLogConsumedTime = WorldTime_4.WorldTime.instance.time;
                    }
                    this.logs += count;
                    this.updateFire(this.logs);
                };
                Campfire.LOG_CAPACITY = 12;
                Campfire.LOG_DURATION_HOURS = 2;
                Campfire.LOG_DURATION = Campfire.LOG_DURATION_HOURS * TimeUnit_3.TimeUnit.HOUR;
                return Campfire;
            }(component_18.Component));
            exports_82("Campfire", Campfire);
        }
    };
});
System.register("game/characters/dialogues/ItemDialogues", ["game/characters/Dialogue", "game/ui/DudeInteractIndicator", "game/ui/DialogueDisplay", "game/world/elements/Campfire", "game/characters/Player"], function (exports_83, context_83) {
    "use strict";
    var _a, Dialogue_4, DudeInteractIndicator_3, DialogueDisplay_2, Campfire_1, Player_5, CAMPFIRE_DIALOGUE, ITEM_DIALOGUES;
    var __moduleName = context_83 && context_83.id;
    return {
        setters: [
            function (Dialogue_4_1) {
                Dialogue_4 = Dialogue_4_1;
            },
            function (DudeInteractIndicator_3_1) {
                DudeInteractIndicator_3 = DudeInteractIndicator_3_1;
            },
            function (DialogueDisplay_2_1) {
                DialogueDisplay_2 = DialogueDisplay_2_1;
            },
            function (Campfire_1_1) {
                Campfire_1 = Campfire_1_1;
            },
            function (Player_5_1) {
                Player_5 = Player_5_1;
            }
        ],
        execute: function () {
            exports_83("CAMPFIRE_DIALOGUE", CAMPFIRE_DIALOGUE = "campfire");
            exports_83("ITEM_DIALOGUES", ITEM_DIALOGUES = (_a = {},
                _a[CAMPFIRE_DIALOGUE] = function () {
                    // the fire can be dead, almost dead, partially full, almost entirely full, or totally full
                    var cf = DialogueDisplay_2.DialogueDisplay.instance.dialogueSource;
                    var logCount = cf.logs;
                    var playerLogCount = Player_5.Player.instance.dude.inventory.getItemCount(2 /* WOOD */);
                    var logsYouCanAdd = Math.min(Campfire_1.Campfire.LOG_CAPACITY - logCount, playerLogCount);
                    var completeDialogue = function (logsTransferred) {
                        return function () {
                            Player_5.Player.instance.dude.inventory.removeItem(2 /* WOOD */, logsTransferred);
                            cf.addLogs(logsTransferred);
                            return new Dialogue_4.NextDialogue(CAMPFIRE_DIALOGUE, false);
                        };
                    };
                    var cancelText = "Leave";
                    if (logsYouCanAdd === 0) {
                        return Dialogue_4.dialogue([playerLogCount === 0 ? "You don't have any logs to add to the fire." : "The fire already has the maximum amount of logs."], completeDialogue(0));
                    }
                    else if (logsYouCanAdd === 1) {
                        return Dialogue_4.dialogueWithOptions([playerLogCount === 1 ? "You only have one log to add to the fire." : "You can fit one more log in the fire."], DudeInteractIndicator_3.DudeInteractIndicator.NONE, new Dialogue_4.DialogueOption("Add log", completeDialogue(1)), new Dialogue_4.DialogueOption(cancelText, completeDialogue(0)));
                    }
                    var prompt;
                    if (logCount === 1) {
                        prompt = "The fire will go out soon. You can add up to " + logsYouCanAdd + " more logs right now.";
                    }
                    else if (logCount === 0) {
                        prompt = "Add logs to ignite the fire? You can add up to " + logsYouCanAdd + " logs.";
                    }
                    else {
                        prompt = "The fire will burn for at least " + (logCount - 1) * Campfire_1.Campfire.LOG_DURATION_HOURS + " more hours. You can add up to " + logsYouCanAdd + " more logs right now.";
                    }
                    return Dialogue_4.dialogueWithOptions([prompt], DudeInteractIndicator_3.DudeInteractIndicator.NONE, new Dialogue_4.DialogueOption("Add " + logsYouCanAdd + " logs", completeDialogue(logsYouCanAdd)), new Dialogue_4.DialogueOption("Add one log", completeDialogue(1)), new Dialogue_4.DialogueOption(cancelText, completeDialogue(0)));
                },
                _a));
        }
    };
});
System.register("game/characters/Dialogue", ["game/SaveManager", "game/ui/DudeInteractIndicator", "game/characters/dialogues/BertoIntro", "game/characters/dialogues/DipIntro", "game/characters/dialogues/GenericDialogue", "game/characters/dialogues/ItemDialogues", "game/characters/Player"], function (exports_84, context_84) {
    "use strict";
    var SaveManager_2, DudeInteractIndicator_4, BertoIntro_1, DipIntro_2, GenericDialogue_1, ItemDialogues_2, Player_6, EMPTY_DIALOGUE, DialogueInstance, dialogueWithOptions, dialogue, option, saveAfterDialogueStage, inv, DialogueOption, NextDialogue, getDialogue, DIALOGUE_SOURCES, DIALOGUE_MAP;
    var __moduleName = context_84 && context_84.id;
    return {
        setters: [
            function (SaveManager_2_1) {
                SaveManager_2 = SaveManager_2_1;
            },
            function (DudeInteractIndicator_4_1) {
                DudeInteractIndicator_4 = DudeInteractIndicator_4_1;
            },
            function (BertoIntro_1_1) {
                BertoIntro_1 = BertoIntro_1_1;
            },
            function (DipIntro_2_1) {
                DipIntro_2 = DipIntro_2_1;
            },
            function (GenericDialogue_1_1) {
                GenericDialogue_1 = GenericDialogue_1_1;
            },
            function (ItemDialogues_2_1) {
                ItemDialogues_2 = ItemDialogues_2_1;
            },
            function (Player_6_1) {
                Player_6 = Player_6_1;
            }
        ],
        execute: function () {
            exports_84("EMPTY_DIALOGUE", EMPTY_DIALOGUE = "-");
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
                    if (indicator === void 0) { indicator = DudeInteractIndicator_4.DudeInteractIndicator.NONE; }
                    this.lines = lines;
                    this.next = next;
                    this.options = options;
                    this.indicator = indicator;
                }
                return DialogueInstance;
            }());
            exports_84("DialogueInstance", DialogueInstance);
            // Shorthand functions for creating dialogue
            exports_84("dialogueWithOptions", dialogueWithOptions = function (lines, indicator) {
                if (indicator === void 0) { indicator = DudeInteractIndicator_4.DudeInteractIndicator.NONE; }
                var options = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    options[_i - 2] = arguments[_i];
                }
                return new DialogueInstance(lines, function () { }, options, indicator);
            });
            exports_84("dialogue", dialogue = function (lines, next, indicator) {
                if (next === void 0) { next = function () { }; }
                if (indicator === void 0) { indicator = DudeInteractIndicator_4.DudeInteractIndicator.NONE; }
                return new DialogueInstance(lines, next, [], indicator);
            });
            exports_84("option", option = function (text, nextDialogue, open) {
                if (open === void 0) { open = true; }
                return new DialogueOption(text, function () { return new NextDialogue(nextDialogue, open); });
            });
            exports_84("saveAfterDialogueStage", saveAfterDialogueStage = function () {
                // save after a delay to account for the next dialogue stage being set
                setTimeout(function () { return SaveManager_2.saveManager.save(); }, 500);
            });
            exports_84("inv", inv = function () { return Player_6.Player.instance.dude.inventory; });
            DialogueOption = /** @class */ (function () {
                function DialogueOption(text, next) {
                    this.text = text;
                    this.next = next;
                }
                return DialogueOption;
            }());
            exports_84("DialogueOption", DialogueOption);
            NextDialogue = /** @class */ (function () {
                /**
                 * @param dialogue the unique dialogue key
                 * @param open true if the dialogue should be shown immediately
                 */
                function NextDialogue(dialogue, open) {
                    if (open === void 0) { open = true; }
                    if (!dialogue) {
                        throw new Error("dialogue can't be null");
                    }
                    this.dialogue = dialogue;
                    this.open = open;
                }
                return NextDialogue;
            }());
            exports_84("NextDialogue", NextDialogue);
            // export const enum Dialogue {
            //     NONE = 0,
            //     DIP_0, DIP_1, DIP_2, DIP_3, DIP_BEFRIEND, DIP_MAKE_CAMPFIRE, DIP_CRAFT,
            //     BERT_0, BERT_MENU, BERT_MENU_INTRO, BERT_VILLAGERS,
            //     CAMPFIRE
            // }
            /**
             * @param dialogue the unique dialogue key
             */
            exports_84("getDialogue", getDialogue = function (dialogue) {
                if (dialogue === EMPTY_DIALOGUE) {
                    return;
                }
                var f = DIALOGUE_MAP[dialogue];
                if (!f) {
                    throw new Error("cannot find dialogue " + dialogue);
                }
                return f();
            });
            DIALOGUE_SOURCES = [
                DipIntro_2.DIP_INTRO_DIALOGUE,
                BertoIntro_1.BERTO_INTRO_DIALOGUE,
                ItemDialogues_2.ITEM_DIALOGUES,
                GenericDialogue_1.GENERIC_DIALOGUE,
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
System.register("game/ui/TextButton", ["engine/component", "engine/point", "engine/renderer/TextRender", "engine/tiles/TileTransform", "engine/util/utils", "game/graphics/Tilesets", "game/ui/Text", "game/ui/UIStateManager"], function (exports_85, context_85) {
    "use strict";
    var component_19, point_46, TextRender_5, TileTransform_18, utils_6, Tilesets_18, Text_4, UIStateManager_7, TextButton;
    var __moduleName = context_85 && context_85.id;
    return {
        setters: [
            function (component_19_1) {
                component_19 = component_19_1;
            },
            function (point_46_1) {
                point_46 = point_46_1;
            },
            function (TextRender_5_1) {
                TextRender_5 = TextRender_5_1;
            },
            function (TileTransform_18_1) {
                TileTransform_18 = TileTransform_18_1;
            },
            function (utils_6_1) {
                utils_6 = utils_6_1;
            },
            function (Tilesets_18_1) {
                Tilesets_18 = Tilesets_18_1;
            },
            function (Text_4_1) {
                Text_4 = Text_4_1;
            },
            function (UIStateManager_7_1) {
                UIStateManager_7 = UIStateManager_7_1;
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
                    _this.width = _this.text.length * Text_4.TEXT_PIXEL_WIDTH + TextButton.margin * 2;
                    _this.start = function () {
                        var leftPos = _this.position.apply(Math.floor);
                        var centerPos = leftPos.plus(new point_46.Point(Tilesets_18.TILE_SIZE, 0));
                        var rightPos = leftPos.plus(new point_46.Point(_this.width - Tilesets_18.TILE_SIZE, 0)).apply(Math.floor);
                        _this.left = Tilesets_18.Tilesets.instance.oneBit.getTileSource("btnLeft_" + buttonColor).toImageRender(new TileTransform_18.TileTransform(leftPos));
                        _this.center = Tilesets_18.Tilesets.instance.oneBit.getTileSource("btnCenter_" + buttonColor).toImageRender(new TileTransform_18.TileTransform(centerPos, new point_46.Point(_this.width + TextButton.margin * 2 - Tilesets_18.TILE_SIZE * 2, Tilesets_18.TILE_SIZE)));
                        _this.right = Tilesets_18.Tilesets.instance.oneBit.getTileSource("btnRight_" + buttonColor).toImageRender(new TileTransform_18.TileTransform(rightPos));
                        Array.from([_this.left, _this.center, _this.right]).forEach(function (t) { return t.depth = UIStateManager_7.UIStateManager.UI_SPRITE_DEPTH + 1; });
                    };
                    return _this;
                }
                TextButton.prototype.update = function (updateData) {
                    this.hovering = utils_6.rectContains(this.position, new point_46.Point(this.width, Tilesets_18.TILE_SIZE), updateData.input.mousePos);
                    if (this.hovering && updateData.input.isMouseDown) {
                        this.onClick();
                    }
                };
                TextButton.prototype.getRenderMethods = function () {
                    if (this.text === null) {
                        return [];
                    }
                    return [new TextRender_5.TextRender(this.text, this.left.position.plus(TextButton.textOffset), Text_4.TEXT_SIZE, Text_4.TEXT_FONT, this.hovering ? this.hoverColor : this.textColor, UIStateManager_7.UIStateManager.UI_SPRITE_DEPTH + 2), this.left, this.center, this.right];
                };
                TextButton.margin = 6;
                TextButton.textOffset = new point_46.Point(TextButton.margin, TextButton.margin - 2);
                return TextButton;
            }(component_19.Component));
            exports_85("TextButton", TextButton);
        }
    };
});
System.register("game/ui/ButtonsMenu", ["engine/point", "game/ui/TextButton", "game/ui/UIStateManager", "game/graphics/Tilesets", "engine/tiles/NineSlice", "game/ui/Text", "engine/Entity"], function (exports_86, context_86) {
    "use strict";
    var point_47, TextButton_1, UIStateManager_8, Tilesets_19, NineSlice_3, Text_5, Entity_16, ButtonsMenu;
    var __moduleName = context_86 && context_86.id;
    return {
        setters: [
            function (point_47_1) {
                point_47 = point_47_1;
            },
            function (TextButton_1_1) {
                TextButton_1 = TextButton_1_1;
            },
            function (UIStateManager_8_1) {
                UIStateManager_8 = UIStateManager_8_1;
            },
            function (Tilesets_19_1) {
                Tilesets_19 = Tilesets_19_1;
            },
            function (NineSlice_3_1) {
                NineSlice_3 = NineSlice_3_1;
            },
            function (Text_5_1) {
                Text_5 = Text_5_1;
            },
            function (Entity_16_1) {
                Entity_16 = Entity_16_1;
            }
        ],
        execute: function () {
            // TODO: Update this to use the color replace filter instead of different sprites
            exports_86("ButtonsMenu", ButtonsMenu = {
                render: function (screenDimensions, backgroundColor, options) {
                    var longestOption = Math.max.apply(Math, options.map(function (o) { return o.text.length; }));
                    var marginTop = 13;
                    var marginBottom = 12;
                    var marginSide = 9;
                    var buttonPadding = 3;
                    var dimensions = new point_47.Point(longestOption * Text_5.TEXT_PIXEL_WIDTH + marginSide * 2 + TextButton_1.TextButton.margin * 2, (options.length - 1) * buttonPadding + options.length * Tilesets_19.TILE_SIZE + marginTop + marginBottom);
                    var topLeft = screenDimensions.div(2).minus(dimensions.div(2));
                    var backgroundTiles = NineSlice_3.NineSlice.makeStretchedNineSliceComponents(backgroundColor === "red" ? Tilesets_19.Tilesets.instance.oneBit.getNineSlice("invBoxNW") : Tilesets_19.Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"), topLeft, dimensions);
                    backgroundTiles[0].transform.depth = UIStateManager_8.UIStateManager.UI_SPRITE_DEPTH;
                    var e = new Entity_16.Entity();
                    backgroundTiles.forEach(function (tile) { return e.addComponent(tile); });
                    options.forEach(function (option, i) { return e.addComponent(new TextButton_1.TextButton(topLeft.plus(new point_47.Point(dimensions.x / 2 - (Text_5.TEXT_PIXEL_WIDTH * option.text.length / 2) - TextButton_1.TextButton.margin, marginTop + i * (Tilesets_19.TILE_SIZE + buttonPadding))), option.text, function () { return option.fn(); }, option.buttonColor, option.textColor, option.hoverColor)); });
                    return e;
                }
            });
        }
    };
});
System.register("game/ui/DialogueDisplay", ["game/characters/Dialogue", "game/graphics/Tilesets", "engine/tiles/NineSlice", "engine/point", "engine/component", "engine/Entity", "engine/renderer/BasicRenderComponent", "game/ui/Text", "game/Controls", "game/ui/UIStateManager", "game/ui/ButtonsMenu"], function (exports_87, context_87) {
    "use strict";
    var Dialogue_5, Tilesets_20, NineSlice_4, point_48, component_20, Entity_17, BasicRenderComponent_6, Text_6, Controls_2, UIStateManager_9, ButtonsMenu_1, DialogueDisplay;
    var __moduleName = context_87 && context_87.id;
    return {
        setters: [
            function (Dialogue_5_1) {
                Dialogue_5 = Dialogue_5_1;
            },
            function (Tilesets_20_1) {
                Tilesets_20 = Tilesets_20_1;
            },
            function (NineSlice_4_1) {
                NineSlice_4 = NineSlice_4_1;
            },
            function (point_48_1) {
                point_48 = point_48_1;
            },
            function (component_20_1) {
                component_20 = component_20_1;
            },
            function (Entity_17_1) {
                Entity_17 = Entity_17_1;
            },
            function (BasicRenderComponent_6_1) {
                BasicRenderComponent_6 = BasicRenderComponent_6_1;
            },
            function (Text_6_1) {
                Text_6 = Text_6_1;
            },
            function (Controls_2_1) {
                Controls_2 = Controls_2_1;
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
                    _this.e = new Entity_17.Entity([_this]);
                    DialogueDisplay.instance = _this;
                    return _this;
                }
                Object.defineProperty(DialogueDisplay.prototype, "isOpen", {
                    get: function () { return !!this.dialogue; },
                    enumerable: false,
                    configurable: true
                });
                DialogueDisplay.prototype.update = function (updateData) {
                    if (!this.dialogue) {
                        return;
                    }
                    // We don't allow the user to close dialogue because it might end up in a weird state
                    // if (updateData.input.isKeyDown(Controls.closeButton)) {
                    //     this.close()
                    //     return
                    // }
                    var showOptions = this.dialogue.options.length > 0 && this.lineIndex === this.dialogue.lines.length - 1;
                    if (this.letterTicker !== 0 && (updateData.input.isMouseDown || updateData.input.isKeyDown(Controls_2.Controls.interactButton))) {
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
                        this.completeSourceDialogue(this.dialogue.next);
                        return;
                    }
                    this.letterTicker += updateData.elapsedTimeMillis;
                    // Overwrite previously displayed tiles each time
                    this.displayEntity = new Entity_17.Entity();
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
                DialogueDisplay.prototype.completeSourceDialogue = function (nextFn) {
                    var next = nextFn();
                    if (!next) {
                        this.dialogueSource.dialogue = Dialogue_5.EMPTY_DIALOGUE;
                        this.close();
                    }
                    else {
                        this.dialogueSource.dialogue = next.dialogue;
                        if (next.open) {
                            this.startDialogue(this.dialogueSource);
                        }
                        else {
                            this.close();
                        }
                    }
                };
                DialogueDisplay.prototype.close = function () {
                    this.dialogueSource = null;
                    this.dialogue = null;
                    this.displayEntity = null;
                };
                DialogueDisplay.prototype.startDialogue = function (dialogueSource) {
                    this.dialogueSource = dialogueSource;
                    this.dialogue = Dialogue_5.getDialogue(dialogueSource.dialogue);
                    this.lineIndex = 0;
                    this.letterTicker = 0;
                    this.finishedPrinting = false;
                };
                DialogueDisplay.prototype.renderNextLine = function (screenDimensions) {
                    var _this = this;
                    var dimensions = new point_48.Point(288, 83);
                    var bottomBuffer = Tilesets_20.TILE_SIZE;
                    var topLeft = new point_48.Point(Math.floor(screenDimensions.x / 2 - dimensions.x / 2), Math.floor(screenDimensions.y - dimensions.y - bottomBuffer));
                    var backgroundTiles = NineSlice_4.NineSlice.makeStretchedNineSliceComponents(Tilesets_20.Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"), topLeft, dimensions);
                    backgroundTiles[0].transform.depth = UIStateManager_9.UIStateManager.UI_SPRITE_DEPTH;
                    var topOffset = 2;
                    var margin = 12;
                    var width = dimensions.x - margin * 2;
                    var formattedRenders = Text_6.formatText(this.dialogue.lines[this.lineIndex], "#62232f" /* DARK_RED */, topLeft.plus(new point_48.Point(margin, topOffset + margin)), width, 1 /* CENTER */);
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
                    this.displayEntity.addComponent(new (BasicRenderComponent_6.BasicRenderComponent.bind.apply(BasicRenderComponent_6.BasicRenderComponent, __spreadArrays([void 0], formattedRenders)))());
                };
                DialogueDisplay.prototype.renderOptions = function (screenDimensions) {
                    var _this = this;
                    this.optionsEntity = ButtonsMenu_1.ButtonsMenu.render(screenDimensions, "white", this.dialogue.options.map(function (o) {
                        return {
                            text: o.text,
                            fn: function () { return _this.completeSourceDialogue(o.next); },
                            buttonColor: 'white',
                            textColor: "#fdf7ed" /* WHITE */,
                            hoverColor: "#62232f" /* DARK_RED */
                        };
                    }));
                };
                return DialogueDisplay;
            }(component_20.Component));
            exports_87("DialogueDisplay", DialogueDisplay);
        }
    };
});
System.register("game/characters/NPC", ["engine/component", "engine/point", "engine/util/Lists", "game/graphics/Tilesets", "game/ui/DialogueDisplay", "game/world/elements/House", "game/world/LocationManager", "game/world/OutdoorDarknessMask", "game/world/TimeUnit", "game/characters/Dude", "game/characters/NPCSchedule", "game/characters/Player"], function (exports_88, context_88) {
    "use strict";
    var component_21, point_49, Lists_4, Tilesets_21, DialogueDisplay_3, House_3, LocationManager_10, OutdoorDarknessMask_2, TimeUnit_4, Dude_1, NPCSchedule_1, Player_7, NPC;
    var __moduleName = context_88 && context_88.id;
    return {
        setters: [
            function (component_21_1) {
                component_21 = component_21_1;
            },
            function (point_49_1) {
                point_49 = point_49_1;
            },
            function (Lists_4_1) {
                Lists_4 = Lists_4_1;
            },
            function (Tilesets_21_1) {
                Tilesets_21 = Tilesets_21_1;
            },
            function (DialogueDisplay_3_1) {
                DialogueDisplay_3 = DialogueDisplay_3_1;
            },
            function (House_3_1) {
                House_3 = House_3_1;
            },
            function (LocationManager_10_1) {
                LocationManager_10 = LocationManager_10_1;
            },
            function (OutdoorDarknessMask_2_1) {
                OutdoorDarknessMask_2 = OutdoorDarknessMask_2_1;
            },
            function (TimeUnit_4_1) {
                TimeUnit_4 = TimeUnit_4_1;
            },
            function (Dude_1_1) {
                Dude_1 = Dude_1_1;
            },
            function (NPCSchedule_1_1) {
                NPCSchedule_1 = NPCSchedule_1_1;
            },
            function (Player_7_1) {
                Player_7 = Player_7_1;
            }
        ],
        execute: function () {
            NPC = /** @class */ (function (_super) {
                __extends(NPC, _super);
                function NPC(defaultSchedule) {
                    if (defaultSchedule === void 0) { defaultSchedule = NPCSchedule_1.NPCSchedules.newNoOpSchedule(); }
                    var _this = _super.call(this) || this;
                    _this.isEnemyFn = function () { return false; };
                    _this.pathFindingHeuristic = function (pt, goal) { return pt.manhattanDistanceTo(goal); };
                    _this.findTargetRange = Tilesets_21.TILE_SIZE * 10;
                    _this.enemiesPresent = false;
                    _this.canTalk = function () {
                        return !_this.enemiesPresent;
                    };
                    _this.walkPath = null;
                    _this.fleePath = null;
                    _this.targetPath = null;
                    _this.awake = function () {
                        _this.dude = _this.entity.getComponent(Dude_1.Dude);
                        if (!_this.dude.blob[NPCSchedule_1.NPCSchedules.SCHEDULE_KEY]) {
                            _this.setSchedule(defaultSchedule);
                        }
                    };
                    return _this;
                }
                NPC.prototype.awake = function () {
                };
                NPC.prototype.start = function () {
                    var _this = this;
                    this.doWhileLiving(function () { return _this.checkForEnemies(); }, 1000 + 1000 * Math.random());
                };
                NPC.prototype.update = function (updateData) {
                    /**
                     * NPC behavior:
                     * If threated, fight or flee
                     * otherwise follow their followTarget (if present)
                     * otherwise execute a "standard routine" which can be defined by the controller (TODO)
                     */
                    // clear their attack target if the target has died
                    if (!!this.attackTarget && !this.attackTarget.isAlive) {
                        this.attackTarget = null;
                        this.targetPath = null;
                    }
                    if (DialogueDisplay_3.DialogueDisplay.instance.dialogueSource === this.dude) {
                        // don't move when talking
                        this.dude.move(updateData, point_49.Point.ZERO, Player_7.Player.instance.dude.standingPosition.x - this.dude.standingPosition.x);
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
                        this.dude.move(updateData, point_49.Point.ZERO);
                    }
                    else if (schedule.type === 1 /* GO_TO_SPOT */) {
                        this.walkTo(point_49.Point.fromString(schedule["p"]), updateData);
                    }
                    else if (schedule.type === 3 /* ROAM */) {
                        this.doFlee(updateData, 0.5);
                    }
                    else if (schedule.type === 2 /* ROAM_IN_DARKNESS */) {
                        this.doFlee(updateData, OutdoorDarknessMask_2.OutdoorDarknessMask.instance.isDark(this.dude.standingPosition) ? 0.5 : 1, function (pt) { return OutdoorDarknessMask_2.OutdoorDarknessMask.instance.isDark(pt.times(Tilesets_21.TILE_SIZE)); });
                    }
                    else if (schedule.type === 4 /* DEFAULT_VILLAGER */) {
                        var home = this.findHomeLocation();
                        // TODO: decide what default villager behavior should be
                        if (this.dude.location === home) {
                            // roam around inside
                            this.doFlee(updateData, 0.5);
                        }
                        else if (!home) {
                            // TODO: homeless behavior
                            this.doFlee(updateData, 0.5);
                        }
                        else {
                            this.findTeleporter(home.uuid);
                            this.goToTeleporter(updateData);
                        }
                    }
                    else {
                        throw new Error("unimplemented schedule type");
                    }
                };
                NPC.prototype.simulate = function () {
                    this.clearExistingAIState();
                    var schedule = this.getSchedule();
                    if (schedule.type === 1 /* GO_TO_SPOT */) {
                        this.forceMoveToTilePosition(point_49.Point.fromString(schedule["p"]));
                    }
                    else if (schedule.type === 4 /* DEFAULT_VILLAGER */) {
                        // TODO 
                        var home = this.findHomeLocation();
                        if (this.dude.location !== home) {
                            this.useTeleporter(LocationManager_10.LocationManager.instance.exterior().getTeleporter(home.uuid));
                        }
                    }
                };
                NPC.prototype.setSchedule = function (schedule) {
                    this.dude.blob[NPCSchedule_1.NPCSchedules.SCHEDULE_KEY] = schedule;
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
                    this.targetPath = null;
                    this.teleporterTarget = null;
                    // this.followTarget = null
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
                            this.dude.move(updateData, point_49.Point.ZERO);
                            return;
                        }
                    }
                    if (this.walkDirectlyTo(this.walkPath[0], updateData, this.walkPath.length === 1)) {
                        this.walkPath.shift();
                    }
                };
                NPC.prototype.doFlee = function (updateData, speedMultiplier, ptSelectionFilter) {
                    if (speedMultiplier === void 0) { speedMultiplier = 1; }
                    if (ptSelectionFilter === void 0) { ptSelectionFilter = function () { return true; }; }
                    if (!this.fleePath || this.fleePath.length === 0) { // only try once per upate() to find a path
                        var l_1 = LocationManager_10.LocationManager.instance.currentLocation;
                        var openPoints = l_1.ground.keys().filter(function (pt) { return !l_1.isOccupied(pt); });
                        var pt = void 0;
                        for (var i = 0; i < 5; i++) {
                            pt = openPoints[Math.floor(Math.random() * openPoints.length)];
                            if (ptSelectionFilter(pt)) {
                                break;
                            }
                        }
                        if (!pt) {
                            this.dude.move(updateData, point_49.Point.ZERO);
                            return;
                        }
                        this.fleePath = this.findPath(pt);
                        if (!this.fleePath || this.fleePath.length === 0) {
                            this.dude.move(updateData, point_49.Point.ZERO);
                            return;
                        }
                    }
                    if (this.walkDirectlyTo(this.fleePath[0], updateData, false, speedMultiplier)) {
                        this.fleePath.shift();
                    }
                };
                NPC.prototype.doAttack = function (updateData) {
                    var _a;
                    if (!this.dude.isAlive) {
                        return;
                    }
                    if (!this.dude.weapon || !this.attackTarget || !this.targetPath || !this.attackTarget.isAlive) {
                        this.dude.move(updateData, point_49.Point.ZERO);
                        return;
                    }
                    // TODO maybe switch dynamically between A* and direct walking?
                    // const followDistance = this.dude.weapon.getRange()/2 ?? 20
                    // const buffer = 0  // this basically determines how long they will stop for if they get too close
                    var dist = this.attackTarget.standingPosition.minus(this.dude.standingPosition);
                    var mag = dist.magnitude();
                    // if (mag > followDistance || ((followDistance-mag) < buffer && this.attackTarget.isMoving) && this.dude.isMoving) {
                    //     this.dude.move(updateData, dist)
                    // } else {
                    //     this.dude.move(updateData, new Point(0, 0))
                    // }
                    if (mag < ((_a = this.dude.weapon) === null || _a === void 0 ? void 0 : _a.getRange())) {
                        this.dude.weapon.attack(true);
                    }
                    else {
                        this.dude.weapon.cancelAttack();
                    }
                    if (this.targetPath.length === 0) {
                        this.targetPath = this.findPath(Tilesets_21.pixelPtToTilePt(this.attackTarget.standingPosition), this.dude.standingPosition);
                    }
                    if (!this.targetPath || this.targetPath.length === 0) {
                        this.dude.move(updateData, point_49.Point.ZERO);
                        return;
                    }
                    if (this.walkDirectlyTo(this.targetPath[0], updateData, false, 1, this.targetPath.length < 2 ? (this.attackTarget.standingPosition.x - this.dude.standingPosition.x) : 0)) {
                        this.targetPath.shift();
                    }
                };
                // private followTarget: Dude
                // private doFollow(updateData: UpdateData) {
                //     const followDistance = 75
                //     const buffer = 40  // this basically determines how long they will stop for if they get too close
                //     const dist = Player.instance.dude.standingPosition.minus(this.dude.standingPosition)
                //     const mag = dist.magnitude()
                //     if (mag > followDistance || ((followDistance-mag) < buffer && Player.instance.dude.isMoving) && this.dude.isMoving) {
                //         this.dude.move(updateData, dist)
                //     } else {
                //         this.dude.move(updateData, new Point(0, 0))
                //     }
                // }
                // returns true if they are pretty close (half a tile) away from the goal
                NPC.prototype.walkDirectlyTo = function (pt, updateData, stopWhenClose, speedMultiplier, facingOverride) {
                    if (stopWhenClose === void 0) { stopWhenClose = false; }
                    if (speedMultiplier === void 0) { speedMultiplier = 1; }
                    if (facingOverride === void 0) { facingOverride = 0; }
                    var isCloseEnough = this.isCloseEnoughToStopWalking(pt);
                    if (isCloseEnough && stopWhenClose) {
                        this.dude.move(updateData, point_49.Point.ZERO, facingOverride);
                    }
                    else {
                        var pos = this.dude.standingPosition;
                        this.dude.move(updateData, pt.minus(this.dude.standingPosition), facingOverride, speedMultiplier);
                        if (!this.dude.standingPosition.equals(pos)) {
                            this.lastMovePos = new Date().getMilliseconds();
                        }
                    }
                    return isCloseEnough;
                };
                NPC.prototype.stuck = function () { return new Date().getMilliseconds() - this.lastMovePos > 1000; };
                NPC.prototype.isCloseEnoughToStopWalking = function (pt) {
                    return this.dude.standingPosition.distanceTo(pt) < 8;
                };
                NPC.prototype.checkForEnemies = function () {
                    var _this = this;
                    var enemies = Array.from(LocationManager_10.LocationManager.instance.currentLocation.dudes)
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
                    var target = Lists_4.Lists.minBy(enemies, function (d) { return d.standingPosition.distanceTo(_this.dude.standingPosition); });
                    if (!!target) {
                        var shouldComputePath = true;
                        if (target === this.attackTarget && !!this.targetPath && this.targetPath.length > 0) {
                            // We're already tracking this target. Only update the path if they have gotten closer, 
                            // otherwise the attack() function will automatically extend the path.
                            // const currentGoal = pixelPtToTilePt(this.targetPath[this.targetPath.length-1])
                            var newGoal = Tilesets_21.pixelPtToTilePt(target.standingPosition);
                            var currentPos = Tilesets_21.pixelPtToTilePt(this.dude.standingPosition);
                            if (this.targetPath.length <= currentPos.manhattanDistanceTo(newGoal)) {
                                shouldComputePath = false;
                            }
                        }
                        if (this.stuck) {
                            shouldComputePath = true;
                        }
                        if (shouldComputePath) {
                            this.targetPath = this.findPath(Tilesets_21.pixelPtToTilePt(target.standingPosition));
                        }
                        this.attackTarget = target;
                    }
                };
                NPC.prototype.forceMoveToTilePosition = function (pt) {
                    var pos = this.tilePtToStandingPos(pt).minus(this.dude.standingPosition).plus(this.dude.position);
                    this.dude.moveTo(pos, true);
                };
                NPC.prototype.findPath = function (tilePt, pixelPtStart) {
                    var _this = this;
                    var _a;
                    if (pixelPtStart === void 0) { pixelPtStart = this.dude.standingPosition; }
                    var start = Tilesets_21.pixelPtToTilePt(pixelPtStart);
                    var end = tilePt;
                    // TODO: NPCs can sometimes get stuck if their starting square is "occupied"
                    return (_a = LocationManager_10.LocationManager.instance.currentLocation
                        .findPath(start, end, this.pathFindingHeuristic)) === null || _a === void 0 ? void 0 : _a.map(function (pt) { return _this.tilePtToStandingPos(pt); }).slice(1); // slice(1) because we don't need the start in the path
                };
                NPC.prototype.findTeleporter = function (uuid) {
                    var _a;
                    if (((_a = this.teleporterTarget) === null || _a === void 0 ? void 0 : _a.to) !== uuid) {
                        this.teleporterTarget = this.dude.location.getTeleporter(uuid);
                    }
                };
                NPC.prototype.goToTeleporter = function (updateData) {
                    if (!this.teleporterTarget) {
                        return;
                    }
                    var standingTile = Tilesets_21.pixelPtToTilePt(this.dude.standingPosition);
                    var tilePt = Tilesets_21.pixelPtToTilePt(this.teleporterTarget.pos);
                    this.walkTo(tilePt, updateData);
                    if (standingTile.manhattanDistanceTo(tilePt) <= 1) {
                        this.useTeleporter(this.teleporterTarget);
                    }
                };
                NPC.prototype.useTeleporter = function (teleporter) {
                    this.dude.location.npcUseTeleporter(this.dude, teleporter);
                    this.clearExistingAIState();
                };
                NPC.prototype.findHomeLocation = function () {
                    var _this = this;
                    var houses = LocationManager_10.LocationManager.instance.exterior().getElementsOfType(6 /* HOUSE */)
                        .map(function (el) { return el.entity.getComponent(House_3.House); })
                        .filter(function (house) { return house.getResident() === _this.dude.uuid; });
                    if (houses.length > 0) {
                        return LocationManager_10.LocationManager.instance.get(houses[0].locationUUID);
                    }
                };
                NPC.prototype.tilePtToStandingPos = function (tilePt) {
                    var ptOffset = new point_49.Point(.5, .8);
                    return tilePt.plus(ptOffset).times(Tilesets_21.TILE_SIZE);
                };
                /**
                 * TODO: Support simulation for NPCs which are not in the current location?
                 * Example: You're in an NPC's house, they should come inside when it's time.
                 * Alternatively, this could be done using the EventQueue.
                 */
                NPC.SCHEDULE_FREQUENCY = 10 * TimeUnit_4.TimeUnit.MINUTE;
                return NPC;
            }(component_21.Component));
            exports_88("NPC", NPC);
        }
    };
});
System.register("game/ui/NotificationDisplay", ["engine/component", "engine/Entity", "engine/point", "engine/renderer/TextRender", "engine/tiles/NineSlice", "engine/tiles/TileTransform", "game/cutscenes/Camera", "game/graphics/ImageFilters", "game/graphics/Tilesets", "game/ui/Text", "game/ui/UIStateManager"], function (exports_89, context_89) {
    "use strict";
    var component_22, Entity_18, point_50, TextRender_6, NineSlice_5, TileTransform_19, Camera_8, ImageFilters_3, Tilesets_22, Text_7, UIStateManager_10, Notifications, OFFSET, ICON_WIDTH, NotificationComponent, NotificationDisplay;
    var __moduleName = context_89 && context_89.id;
    return {
        setters: [
            function (component_22_1) {
                component_22 = component_22_1;
            },
            function (Entity_18_1) {
                Entity_18 = Entity_18_1;
            },
            function (point_50_1) {
                point_50 = point_50_1;
            },
            function (TextRender_6_1) {
                TextRender_6 = TextRender_6_1;
            },
            function (NineSlice_5_1) {
                NineSlice_5 = NineSlice_5_1;
            },
            function (TileTransform_19_1) {
                TileTransform_19 = TileTransform_19_1;
            },
            function (Camera_8_1) {
                Camera_8 = Camera_8_1;
            },
            function (ImageFilters_3_1) {
                ImageFilters_3 = ImageFilters_3_1;
            },
            function (Tilesets_22_1) {
                Tilesets_22 = Tilesets_22_1;
            },
            function (Text_7_1) {
                Text_7 = Text_7_1;
            },
            function (UIStateManager_10_1) {
                UIStateManager_10 = UIStateManager_10_1;
            }
        ],
        execute: function () {
            exports_89("Notifications", Notifications = {
                NEW_VILLAGER: { text: "Someone has arrived!" }
            });
            OFFSET = new point_50.Point(-4, 4);
            ICON_WIDTH = 20;
            NotificationComponent = /** @class */ (function (_super) {
                __extends(NotificationComponent, _super);
                function NotificationComponent(n) {
                    var _this = _super.call(this) || this;
                    if (!n.isExpired) {
                        var expirationTime_1 = Date.now() + 5000;
                        n.isExpired = function () { return Date.now() > expirationTime_1; };
                    }
                    _this.n = n;
                    _this.awake = function () {
                        var textPixelWidth = n.text.length * Text_7.TEXT_PIXEL_WIDTH;
                        _this.width = textPixelWidth + Tilesets_22.TILE_SIZE + (!!n.icon ? ICON_WIDTH : 0);
                        _this.height = Tilesets_22.TILE_SIZE * 2 - 2;
                        var pos = _this.getPositon();
                        var backgroundTiles = NineSlice_5.NineSlice.makeStretchedNineSliceComponents(Tilesets_22.Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"), pos, new point_50.Point(_this.width, _this.height));
                        backgroundTiles.forEach(function (c) { return _this.entity.addComponent(c); });
                        _this.t = backgroundTiles[0].transform;
                        if (!!n.icon) {
                            var icon = Tilesets_22.Tilesets.instance.oneBit.getTileSource(n.icon)
                                .filtered(ImageFilters_3.ImageFilters.tint("#62232f" /* DARK_RED */))
                                .toComponent(TileTransform_19.TileTransform.new({
                                position: new point_50.Point(Tilesets_22.TILE_SIZE / 2, 7),
                                depth: UIStateManager_10.UIStateManager.UI_SPRITE_DEPTH + 1
                            }).relativeTo(_this.t));
                            _this.entity.addComponent(icon);
                        }
                    };
                    return _this;
                }
                NotificationComponent.prototype.update = function (updateData) {
                    this.t.position = this.getPositon(updateData.elapsedTimeMillis);
                };
                NotificationComponent.prototype.getRenderMethods = function () {
                    var textPos = this.t.position.plusX(Tilesets_22.TILE_SIZE / 2 + (!!this.n.icon ? ICON_WIDTH : 0)).plusY(this.height / 2 - Text_7.TEXT_SIZE / 2 + .5);
                    return [
                        new TextRender_6.TextRender(this.n.text, textPos, Text_7.TEXT_SIZE, Text_7.TEXT_FONT, "#62232f" /* DARK_RED */, UIStateManager_10.UIStateManager.UI_SPRITE_DEPTH + 1)
                    ];
                };
                NotificationComponent.prototype.isOffScreen = function () {
                    return this.t.position.x > Camera_8.Camera.instance.dimensions.x;
                };
                NotificationComponent.prototype.getPositon = function (elapsedMillis) {
                    if (elapsedMillis === void 0) { elapsedMillis = 0; }
                    var index = NotificationDisplay.instance.getNotifications().indexOf(this.n);
                    var yOffset = 32 * index + OFFSET.y;
                    var offScreenPos = new point_50.Point(Camera_8.Camera.instance.dimensions.x + 10, yOffset);
                    if (!this.t) {
                        return offScreenPos;
                    }
                    var onScreenPos = new point_50.Point(Camera_8.Camera.instance.dimensions.x - this.width + OFFSET.x, yOffset);
                    var goalPosition = this.n.isExpired() ? offScreenPos : onScreenPos;
                    var diff = goalPosition.minus(this.t.position);
                    var lerpRate = 0.22;
                    if (diff.magnitude() < 1) {
                        return goalPosition;
                    }
                    else {
                        return this.t.position.plus(diff.times(lerpRate)).apply(Math.floor);
                    }
                };
                return NotificationComponent;
            }(component_22.Component));
            NotificationDisplay = /** @class */ (function (_super) {
                __extends(NotificationDisplay, _super);
                function NotificationDisplay() {
                    var _this = _super.call(this) || this;
                    _this.nComponents = [];
                    NotificationDisplay.instance = _this;
                    _this.displayEntity = new Entity_18.Entity([_this]);
                    return _this;
                }
                NotificationDisplay.prototype.push = function (notification) {
                    var component = new NotificationComponent(notification);
                    this.nComponents.push(component);
                    new Entity_18.Entity([component]);
                };
                NotificationDisplay.prototype.update = function (updateData) {
                    this.nComponents = this.nComponents.filter(function (n) { return !(n.isOffScreen() && n.n.isExpired()); });
                };
                NotificationDisplay.prototype.getNotifications = function () {
                    return this.nComponents.map(function (nc) { return nc.n; });
                };
                NotificationDisplay.prototype.getEntities = function () {
                    return [this.displayEntity].concat(this.nComponents.map(function (c) { return c.entity; }));
                };
                return NotificationDisplay;
            }(component_22.Component));
            exports_89("NotificationDisplay", NotificationDisplay);
        }
    };
});
System.register("game/world/events/QueuedEvent", ["game/characters/DudeFactory", "game/world/MapGenerator", "game/world/LocationManager", "game/characters/NPCSchedule", "game/characters/NPC", "game/graphics/Tilesets", "game/world/events/EventQueue", "game/world/WorldTime", "game/world/elements/House", "game/ui/NotificationDisplay"], function (exports_90, context_90) {
    "use strict";
    var _a, DudeFactory_2, MapGenerator_4, LocationManager_11, NPCSchedule_2, NPC_2, Tilesets_23, EventQueue_4, WorldTime_5, House_4, NotificationDisplay_1, QueuedEventType, EVENT_QUEUE_HANDLERS;
    var __moduleName = context_90 && context_90.id;
    return {
        setters: [
            function (DudeFactory_2_1) {
                DudeFactory_2 = DudeFactory_2_1;
            },
            function (MapGenerator_4_1) {
                MapGenerator_4 = MapGenerator_4_1;
            },
            function (LocationManager_11_1) {
                LocationManager_11 = LocationManager_11_1;
            },
            function (NPCSchedule_2_1) {
                NPCSchedule_2 = NPCSchedule_2_1;
            },
            function (NPC_2_1) {
                NPC_2 = NPC_2_1;
            },
            function (Tilesets_23_1) {
                Tilesets_23 = Tilesets_23_1;
            },
            function (EventQueue_4_1) {
                EventQueue_4 = EventQueue_4_1;
            },
            function (WorldTime_5_1) {
                WorldTime_5 = WorldTime_5_1;
            },
            function (House_4_1) {
                House_4 = House_4_1;
            },
            function (NotificationDisplay_1_1) {
                NotificationDisplay_1 = NotificationDisplay_1_1;
            }
        ],
        execute: function () {
            (function (QueuedEventType) {
                QueuedEventType[QueuedEventType["SIMULATE_NPCS"] = 0] = "SIMULATE_NPCS";
                QueuedEventType[QueuedEventType["HERALD_ARRIVAL"] = 1] = "HERALD_ARRIVAL";
                QueuedEventType[QueuedEventType["HERALD_DEPARTURE"] = 2] = "HERALD_DEPARTURE";
                QueuedEventType[QueuedEventType["HERALD_RETURN_WITH_NPC"] = 3] = "HERALD_RETURN_WITH_NPC";
            })(QueuedEventType || (QueuedEventType = {}));
            exports_90("QueuedEventType", QueuedEventType);
            exports_90("EVENT_QUEUE_HANDLERS", EVENT_QUEUE_HANDLERS = (_a = {},
                _a[QueuedEventType.SIMULATE_NPCS] = function () {
                    LocationManager_11.LocationManager.instance.getLocations()
                        .filter(function (l) { return l !== LocationManager_11.LocationManager.instance.currentLocation; })
                        .flatMap(function (l) { return Array.from(l.dudes); })
                        .forEach(function (d) { return d.entity.getComponent(NPC_2.NPC).simulate(); });
                    EventQueue_4.EventQueue.instance.addEvent({
                        type: QueuedEventType.SIMULATE_NPCS,
                        time: WorldTime_5.WorldTime.instance.time + NPC_2.NPC.SCHEDULE_FREQUENCY
                    });
                },
                _a[QueuedEventType.HERALD_ARRIVAL] = function () {
                    DudeFactory_2.DudeFactory.instance.new(4 /* HERALD */, MapGenerator_4.MapGenerator.ENTER_LAND_POS, LocationManager_11.LocationManager.instance.exterior());
                    NotificationDisplay_1.NotificationDisplay.instance.push(NotificationDisplay_1.Notifications.NEW_VILLAGER);
                },
                _a[QueuedEventType.HERALD_DEPARTURE] = function (data) {
                    var goalPosition = MapGenerator_4.MapGenerator.ENTER_LAND_POS;
                    var berto = LocationManager_11.LocationManager.instance.exterior().getDude(4 /* HERALD */);
                    if (!berto) {
                        return;
                    }
                    var npc = berto.entity.getComponent(NPC_2.NPC);
                    var sched = data.oldSchedule || npc.getSchedule();
                    npc.setSchedule(NPCSchedule_2.NPCSchedules.newGoToSchedule(Tilesets_23.pixelPtToTilePt(goalPosition)));
                    // check repeatedly until he's at the goal
                    if (berto.standingPosition.distanceTo(goalPosition) > Tilesets_23.TILE_SIZE) {
                        console.log("still en route -- potentially stuck");
                        EventQueue_4.EventQueue.instance.addEvent({
                            type: QueuedEventType.HERALD_DEPARTURE,
                            time: WorldTime_5.WorldTime.instance.future({ minutes: 2 }),
                            oldSchedule: sched
                        });
                    }
                    else {
                        console.log("we've arrived!");
                        EventQueue_4.EventQueue.instance.addEvent({
                            type: QueuedEventType.HERALD_RETURN_WITH_NPC,
                            time: WorldTime_5.WorldTime.instance.future({ hours: 12 }),
                            normalSchedule: sched
                        });
                    }
                },
                _a[QueuedEventType.HERALD_RETURN_WITH_NPC] = function (data) {
                    NotificationDisplay_1.NotificationDisplay.instance.push(NotificationDisplay_1.Notifications.NEW_VILLAGER);
                    var berto = LocationManager_11.LocationManager.instance.exterior().getDude(4 /* HERALD */);
                    if (!berto) {
                        return;
                    }
                    berto.entity.getComponent(NPC_2.NPC).setSchedule(data.normalSchedule);
                    var villager = DudeFactory_2.DudeFactory.instance.new(7 /* VILLAGER */, MapGenerator_4.MapGenerator.ENTER_LAND_POS, LocationManager_11.LocationManager.instance.exterior());
                    var house = LocationManager_11.LocationManager.instance.exterior().getElementsOfType(6 /* HOUSE */)
                        .map(function (e) { return e.entity.getComponent(House_4.House); })
                        .filter(function (house) { return house.isResidentPending(); })[0];
                    house === null || house === void 0 ? void 0 : house.setResident(villager.uuid);
                },
                _a));
        }
    };
});
System.register("game/saves/SaveGame", [], function (exports_91, context_91) {
    "use strict";
    var Save, SaveState;
    var __moduleName = context_91 && context_91.id;
    return {
        setters: [],
        execute: function () {
            Save = /** @class */ (function () {
                function Save() {
                }
                return Save;
            }());
            exports_91("Save", Save);
            /**
             * This is for data that is written by game components
             */
            SaveState = /** @class */ (function () {
                function SaveState() {
                    this.coins = 0;
                }
                return SaveState;
            }());
            exports_91("SaveState", SaveState);
        }
    };
});
System.register("game/SaveManager", ["game/characters/Player", "game/saves/SaveGame", "game/world/LocationManager", "game/ui/UIStateManager", "game/cutscenes/Camera", "game/ui/HUD", "game/world/WorldTime", "game/world/events/EventQueue"], function (exports_92, context_92) {
    "use strict";
    var Player_8, SaveGame_1, LocationManager_12, UIStateManager_11, Camera_9, HUD_2, WorldTime_6, EventQueue_5, SAVE_KEY, SaveManager, saveManager;
    var __moduleName = context_92 && context_92.id;
    return {
        setters: [
            function (Player_8_1) {
                Player_8 = Player_8_1;
            },
            function (SaveGame_1_1) {
                SaveGame_1 = SaveGame_1_1;
            },
            function (LocationManager_12_1) {
                LocationManager_12 = LocationManager_12_1;
            },
            function (UIStateManager_11_1) {
                UIStateManager_11 = UIStateManager_11_1;
            },
            function (Camera_9_1) {
                Camera_9 = Camera_9_1;
            },
            function (HUD_2_1) {
                HUD_2 = HUD_2_1;
            },
            function (WorldTime_6_1) {
                WorldTime_6 = WorldTime_6_1;
            },
            function (EventQueue_5_1) {
                EventQueue_5 = EventQueue_5_1;
            }
        ],
        execute: function () {
            SAVE_KEY = "save";
            SaveManager = /** @class */ (function () {
                function SaveManager() {
                }
                /**
                 * Adds all key/values in newState to the save state.
                 * This DOES NOT flush the data, and save() should be
                 * called after if you want to immediately persist it.
                 */
                SaveManager.prototype.setState = function (newState) {
                    if (!this.state) {
                        this.getState();
                    }
                    this.state = __assign(__assign({}, this.state), newState);
                };
                SaveManager.prototype.getState = function () {
                    if (!this.state) {
                        if (this.saveFileExists()) {
                            // pre-load this before "load" is called to display data on the main menu
                            this.state = this.getSavedData().state;
                        }
                        else {
                            this.state = new SaveGame_1.SaveState();
                        }
                    }
                    return this.state;
                };
                SaveManager.prototype.save = function () {
                    if (!Player_8.Player.instance.dude.isAlive) {
                        console.log("cannot save after death");
                        return;
                    }
                    HUD_2.HUD.instance.showSaveIcon();
                    var save = {
                        timeSaved: new Date().getTime(),
                        saveVersion: 0,
                        locations: LocationManager_12.LocationManager.instance.save(),
                        worldTime: WorldTime_6.WorldTime.instance.time,
                        eventQueue: EventQueue_5.EventQueue.instance.save(),
                        state: this.state,
                    };
                    console.log("saved game");
                    localStorage.setItem(SAVE_KEY, JSON.stringify(save)); // TODO support save slots
                };
                SaveManager.prototype.saveFileExists = function () {
                    return !!localStorage.getItem(SAVE_KEY);
                };
                SaveManager.prototype.deleteSave = function () {
                    localStorage.removeItem(SAVE_KEY);
                };
                /**
                 * @return true if a save was loaded successfully
                 */
                SaveManager.prototype.load = function () {
                    var save = this.getSavedData();
                    var prettyPrintTimestamp = new Date();
                    prettyPrintTimestamp.setTime(save.timeSaved);
                    console.log("loaded save from " + prettyPrintTimestamp);
                    WorldTime_6.WorldTime.instance.initialize(save.worldTime);
                    LocationManager_12.LocationManager.instance.initialize(save.locations);
                    EventQueue_5.EventQueue.instance.initialize(save.eventQueue);
                    Camera_9.Camera.instance.focusOnDude(Array.from(LocationManager_12.LocationManager.instance.currentLocation.dudes).filter(function (d) { return d.type === 0 /* PLAYER */; })[0]);
                    // clear existing UI state
                    UIStateManager_11.UIStateManager.instance.destroy();
                };
                SaveManager.prototype.getSavedData = function () {
                    var saveJson = localStorage.getItem(SAVE_KEY);
                    if (!saveJson) {
                        console.log("no save found");
                        return;
                    }
                    return JSON.parse(saveJson);
                };
                return SaveManager;
            }());
            exports_92("saveManager", saveManager = new SaveManager());
        }
    };
});
System.register("game/ui/PlaceElementFrame", ["engine/component", "game/graphics/Tilesets", "engine/point", "engine/tiles/NineSlice", "game/ui/UIStateManager", "game/world/LocationManager", "game/ui/PlaceElementDisplay", "engine/util/utils", "engine/tiles/TileTransform", "game/world/elements/Elements"], function (exports_93, context_93) {
    "use strict";
    var component_23, Tilesets_24, point_51, NineSlice_6, UIStateManager_12, LocationManager_13, PlaceElementDisplay_1, utils_7, TileTransform_20, Elements_2, PlaceElementFrame;
    var __moduleName = context_93 && context_93.id;
    return {
        setters: [
            function (component_23_1) {
                component_23 = component_23_1;
            },
            function (Tilesets_24_1) {
                Tilesets_24 = Tilesets_24_1;
            },
            function (point_51_1) {
                point_51 = point_51_1;
            },
            function (NineSlice_6_1) {
                NineSlice_6 = NineSlice_6_1;
            },
            function (UIStateManager_12_1) {
                UIStateManager_12 = UIStateManager_12_1;
            },
            function (LocationManager_13_1) {
                LocationManager_13 = LocationManager_13_1;
            },
            function (PlaceElementDisplay_1_1) {
                PlaceElementDisplay_1 = PlaceElementDisplay_1_1;
            },
            function (utils_7_1) {
                utils_7 = utils_7_1;
            },
            function (TileTransform_20_1) {
                TileTransform_20 = TileTransform_20_1;
            },
            function (Elements_2_1) {
                Elements_2 = Elements_2_1;
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
                            return Math.round(Math.abs(n) / Tilesets_24.TILE_SIZE) * Math.sign(n);
                        });
                    };
                    _this.dimensions = dimensions;
                    if ((_this.dimensions.x === 1 && _this.dimensions.y > 2) || (_this.dimensions.y === 1 && _this.dimensions.x !== 1)) {
                        throw new Error("haven't implemented small element placing yet :(");
                    }
                    return _this;
                }
                PlaceElementFrame.prototype.start = function () {
                    this.goodTiles = this.entity.addComponents(this.getTiles("good"));
                    this.goodTiles[0].transform.depth = UIStateManager_12.UIStateManager.UI_SPRITE_DEPTH;
                    this.badTiles = this.entity.addComponents(this.getTiles("bad"));
                    this.badTiles[0].transform.depth = UIStateManager_12.UIStateManager.UI_SPRITE_DEPTH;
                };
                PlaceElementFrame.prototype.getTiles = function (suffix) {
                    if (this.dimensions.equals(new point_51.Point(1, 2))) {
                        var top_1 = Tilesets_24.Tilesets.instance.outdoorTiles.getTileSource("placingElementFrame_1x2_" + suffix + "_top")
                            .toComponent(new TileTransform_20.TileTransform());
                        var bottom = Tilesets_24.Tilesets.instance.outdoorTiles.getTileSource("placingElementFrame_1x2_" + suffix + "_bottom")
                            .toComponent(new TileTransform_20.TileTransform(new point_51.Point(0, Tilesets_24.TILE_SIZE)).relativeTo(top_1.transform));
                        return [top_1, bottom];
                    }
                    if (this.dimensions.x === 1 || this.dimensions.y === 1) {
                        return [Tilesets_24.Tilesets.instance.outdoorTiles.getTileSource("placingElementFrame_small_" + suffix).toComponent(new TileTransform_20.TileTransform())];
                    }
                    return NineSlice_6.NineSlice.makeNineSliceComponents(Tilesets_24.Tilesets.instance.outdoorTiles.getNineSlice("placingElementFrame_" + suffix), new point_51.Point(0, 0), this.dimensions);
                };
                PlaceElementFrame.prototype.update = function (updateData) {
                    var startPos = updateData.input.mousePos;
                    var tilePt = this.pixelPtToTilePt(startPos.minus(new point_51.Point(this.dimensions.x / 2, this.dimensions.y / 2).times(Tilesets_24.TILE_SIZE)));
                    var canPlace = this.canPlace(tilePt);
                    this.goodTiles.forEach(function (t) { return t.enabled = canPlace; });
                    this.badTiles.forEach(function (t) { return t.enabled = !canPlace; });
                    this.goodTiles[0].transform.position = tilePt.times(Tilesets_24.TILE_SIZE);
                    this.badTiles[0].transform.position = tilePt.times(Tilesets_24.TILE_SIZE);
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
                            var pt = new point_51.Point(x, y);
                            // there's already an element here
                            if (!!LocationManager_13.LocationManager.instance.currentLocation.getElement(pt)) {
                                return false;
                            }
                            // there's no ground here
                            if (!LocationManager_13.LocationManager.instance.currentLocation.ground.get(pt)) {
                                return false;
                            }
                        }
                    }
                    var p = pos.times(Tilesets_24.TILE_SIZE);
                    var d = this.dimensions.times(Tilesets_24.TILE_SIZE);
                    var intersectingDudes = Array.from(LocationManager_13.LocationManager.instance.currentLocation.dudes).some(function (dude) {
                        return utils_7.rectContains(p, d, dude.standingPosition) || utils_7.rectContains(p, d, dude.standingPosition.plusY(-Tilesets_24.TILE_SIZE));
                    });
                    if (intersectingDudes) {
                        return false;
                    }
                    return Elements_2.Elements.instance.getElementFactory(PlaceElementDisplay_1.PlaceElementDisplay.instance.getElementType()).canPlace(pos);
                };
                return PlaceElementFrame;
            }(component_23.Component));
            exports_93("PlaceElementFrame", PlaceElementFrame);
        }
    };
});
System.register("game/ui/PlaceElementDisplay", ["engine/Entity", "engine/component", "game/world/elements/Elements", "game/Controls", "game/world/LocationManager", "game/characters/Player", "game/ui/PlaceElementFrame"], function (exports_94, context_94) {
    "use strict";
    var Entity_19, component_24, Elements_3, Controls_3, LocationManager_14, Player_9, PlaceElementFrame_1, PlaceElementDisplay;
    var __moduleName = context_94 && context_94.id;
    return {
        setters: [
            function (Entity_19_1) {
                Entity_19 = Entity_19_1;
            },
            function (component_24_1) {
                component_24 = component_24_1;
            },
            function (Elements_3_1) {
                Elements_3 = Elements_3_1;
            },
            function (Controls_3_1) {
                Controls_3 = Controls_3_1;
            },
            function (LocationManager_14_1) {
                LocationManager_14 = LocationManager_14_1;
            },
            function (Player_9_1) {
                Player_9 = Player_9_1;
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
                    _this.e = new Entity_19.Entity([_this]);
                    PlaceElementDisplay.instance = _this;
                    return _this;
                }
                Object.defineProperty(PlaceElementDisplay.prototype, "isOpen", {
                    get: function () { return this.element !== null && this.element !== undefined; },
                    enumerable: false,
                    configurable: true
                });
                PlaceElementDisplay.prototype.update = function (updateData) {
                    if (!this.element) {
                        return;
                    }
                    if (updateData.input.isKeyDown(Controls_3.Controls.closeButton)) {
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
                    this.dimensions = Elements_3.Elements.instance.getElementFactory(element).dimensions;
                    this.placingFrame = Player_9.Player.instance.entity.addComponent(new PlaceElementFrame_1.PlaceElementFrame(this.dimensions));
                };
                // Should only be called by PlaceElementFrame
                PlaceElementDisplay.prototype.finishPlacing = function (elementPos) {
                    this.successFn(); // remove from inv
                    LocationManager_14.LocationManager.instance.currentLocation.addElement(this.element, elementPos);
                    this.close();
                };
                PlaceElementDisplay.prototype.getEntities = function () {
                    return [this.e];
                };
                PlaceElementDisplay.prototype.getElementType = function () {
                    return this.element;
                };
                return PlaceElementDisplay;
            }(component_24.Component));
            exports_94("PlaceElementDisplay", PlaceElementDisplay);
        }
    };
});
System.register("game/ui/InventoryDisplay", ["engine/component", "engine/Entity", "engine/point", "engine/renderer/BasicRenderComponent", "engine/renderer/TextRender", "engine/tiles/AnimatedTileComponent", "engine/tiles/NineSlice", "engine/tiles/TileTransform", "game/characters/Player", "game/characters/weapons/WeaponType", "game/Controls", "game/cutscenes/Camera", "game/graphics/Tilesets", "game/items/Items", "game/SaveManager", "game/world/LocationManager", "game/ui/PlaceElementDisplay", "game/ui/Text", "game/ui/Tooltip", "game/ui/UIStateManager"], function (exports_95, context_95) {
    "use strict";
    var component_25, Entity_20, point_52, BasicRenderComponent_7, TextRender_7, AnimatedTileComponent_4, NineSlice_7, TileTransform_21, Player_10, WeaponType_1, Controls_4, Camera_10, Tilesets_25, Items_3, SaveManager_3, LocationManager_15, PlaceElementDisplay_2, Text_8, Tooltip_3, UIStateManager_13, InventoryDisplay;
    var __moduleName = context_95 && context_95.id;
    return {
        setters: [
            function (component_25_1) {
                component_25 = component_25_1;
            },
            function (Entity_20_1) {
                Entity_20 = Entity_20_1;
            },
            function (point_52_1) {
                point_52 = point_52_1;
            },
            function (BasicRenderComponent_7_1) {
                BasicRenderComponent_7 = BasicRenderComponent_7_1;
            },
            function (TextRender_7_1) {
                TextRender_7 = TextRender_7_1;
            },
            function (AnimatedTileComponent_4_1) {
                AnimatedTileComponent_4 = AnimatedTileComponent_4_1;
            },
            function (NineSlice_7_1) {
                NineSlice_7 = NineSlice_7_1;
            },
            function (TileTransform_21_1) {
                TileTransform_21 = TileTransform_21_1;
            },
            function (Player_10_1) {
                Player_10 = Player_10_1;
            },
            function (WeaponType_1_1) {
                WeaponType_1 = WeaponType_1_1;
            },
            function (Controls_4_1) {
                Controls_4 = Controls_4_1;
            },
            function (Camera_10_1) {
                Camera_10 = Camera_10_1;
            },
            function (Tilesets_25_1) {
                Tilesets_25 = Tilesets_25_1;
            },
            function (Items_3_1) {
                Items_3 = Items_3_1;
            },
            function (SaveManager_3_1) {
                SaveManager_3 = SaveManager_3_1;
            },
            function (LocationManager_15_1) {
                LocationManager_15 = LocationManager_15_1;
            },
            function (PlaceElementDisplay_2_1) {
                PlaceElementDisplay_2 = PlaceElementDisplay_2_1;
            },
            function (Text_8_1) {
                Text_8 = Text_8_1;
            },
            function (Tooltip_3_1) {
                Tooltip_3 = Tooltip_3_1;
            },
            function (UIStateManager_13_1) {
                UIStateManager_13 = UIStateManager_13_1;
            }
        ],
        execute: function () {
            InventoryDisplay = /** @class */ (function (_super) {
                __extends(InventoryDisplay, _super);
                function InventoryDisplay() {
                    var _this = _super.call(this) || this;
                    _this.e = new Entity_20.Entity(); // entity for this component
                    _this.tiles = [];
                    _this.showingInv = false;
                    _this.coinsOffset = new point_52.Point(0, -18);
                    _this.canUseItems = false;
                    _this.e.addComponent(_this);
                    _this.tooltip = _this.e.addComponent(new Tooltip_3.Tooltip());
                    InventoryDisplay.instance = _this;
                    return _this;
                }
                Object.defineProperty(InventoryDisplay.prototype, "isOpen", {
                    get: function () { return this.showingInv; },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(InventoryDisplay.prototype, "playerInv", {
                    get: function () {
                        return Player_10.Player.instance.dude.inventory;
                    },
                    enumerable: false,
                    configurable: true
                });
                InventoryDisplay.prototype.lateUpdate = function (updateData) {
                    var _this = this;
                    var pressI = updateData.input.isKeyDown(Controls_4.Controls.inventoryButton);
                    var pressEsc = updateData.input.isKeyDown(27 /* ESC */);
                    if (this.isOpen && (pressI || pressEsc)) {
                        this.close();
                    }
                    else if (pressI && !UIStateManager_13.UIStateManager.instance.isMenuOpen) {
                        this.show();
                    }
                    if (!this.isOpen) {
                        return;
                    }
                    var hoverResult = this.getHoveredInventoryIndex(updateData.input.mousePos);
                    var hoverInv = hoverResult[0];
                    var hoverIndex = hoverResult[1];
                    if (!!this.trackedTile) { // dragging
                        this.tooltip.clear();
                        if (updateData.input.isMouseUp) { // drop n swap
                            var canDeposit = true;
                            if (hoverIndex !== -1) {
                                var draggedValue = this.trackedTileInventory.getStack(this.trackedTileIndex);
                                // Don't let players store their currently equipped gear
                                if (this.trackedTileInventory === this.playerInv && hoverInv === this.tradingInv) {
                                    if (!!WeaponType_1.WeaponType[draggedValue.item] && this.playerInv.getItemCount(draggedValue.item) === draggedValue.count) {
                                        canDeposit = false;
                                    }
                                }
                                // Swap the stacks
                                if (canDeposit) {
                                    var currentlyOccupiedSpotValue = hoverInv.getStack(hoverIndex);
                                    hoverInv.setStack(hoverIndex, draggedValue);
                                    this.trackedTileInventory.setStack(this.trackedTileIndex, currentlyOccupiedSpotValue);
                                }
                            }
                            this.trackedTileInventory = null;
                            this.trackedTile = null;
                            // refresh view
                            this.show(this.onClose, this.tradingInv);
                        }
                        else { // track
                            this.trackedTile.transform.position = this.trackedTile.transform.position.plus(updateData.input.mousePos.minus(this.lastMousPos));
                        }
                    }
                    else if (hoverIndex > -1 && !!hoverInv.getStack(hoverIndex)) { // we're hovering over an item
                        this.tooltip.position = updateData.input.mousePos;
                        var stack_1 = hoverInv.getStack(hoverIndex);
                        var item_1 = Items_3.ITEM_METADATA_MAP[stack_1.item];
                        var count = stack_1.count > 1 ? ' x' + stack_1.count : '';
                        var actions = [];
                        var decrementStack_1 = function () {
                            if (stack_1.count === 1) {
                                hoverInv.setStack(hoverIndex, null);
                            }
                            else {
                                stack_1.count--;
                            }
                        };
                        if (item_1.element !== null && LocationManager_15.LocationManager.instance.currentLocation.allowPlacing) {
                            actions.push({
                                verb: 'place',
                                actionFn: function () {
                                    _this.close();
                                    PlaceElementDisplay_2.PlaceElementDisplay.instance.startPlacing(item_1.element, decrementStack_1);
                                }
                            });
                        }
                        if (!!item_1.equippable && Player_10.Player.instance.dude.weaponType !== item_1.equippable) {
                            actions.push({
                                verb: 'equip',
                                actionFn: function () {
                                    _this.close();
                                    Player_10.Player.instance.dude.setWeapon(item_1.equippable);
                                }
                            });
                        }
                        if (!!item_1.consumable) {
                            actions.push({
                                verb: 'eat',
                                actionFn: function () {
                                    item_1.consumable();
                                    decrementStack_1();
                                }
                            });
                        }
                        // We currently only support up to 2 interaction types per item
                        var interactButtonOrder_1 = [Controls_4.Controls.interactButton, Controls_4.Controls.interactButtonSecondary];
                        var tooltipString_1 = "" + item_1.displayName + count;
                        actions.forEach(function (action, i) {
                            tooltipString_1 += "\n[" + Controls_4.Controls.keyString(interactButtonOrder_1[i]) + " to " + action.verb + "]";
                        });
                        this.tooltip.say(tooltipString_1);
                        if (this.canUseItems) {
                            actions.forEach(function (action, i) {
                                if (updateData.input.isKeyDown(interactButtonOrder_1[i])) {
                                    action.actionFn();
                                }
                            });
                        }
                    }
                    else {
                        this.tooltip.clear();
                    }
                    // Re-check isOpen because actions could have closed the menu
                    if (this.isOpen) {
                        this.canUseItems = true;
                        this.lastMousPos = updateData.input.mousePos;
                        if (updateData.input.isMouseDown) {
                            if (!!hoverInv && !!hoverInv.getStack(hoverIndex)) {
                                this.trackedTileInventory = hoverInv;
                                // some stupid math to account for the fact that this.tiles contains tiles from potentially two inventories
                                this.trackedTile = this.tiles[hoverIndex + (hoverInv === this.playerInv ? 0 : this.playerInv.size)];
                                this.trackedTileIndex = hoverIndex;
                            }
                        }
                    }
                };
                InventoryDisplay.prototype.getOffsetForInv = function (inv) {
                    if (inv === this.tradingInv) {
                        return this.tradingInvOffset;
                    }
                    else {
                        return this.offset;
                    }
                };
                InventoryDisplay.prototype.spawnBG = function (inv) {
                    var _this = this;
                    var offset = this.getOffsetForInv(inv);
                    var bgTiles = NineSlice_7.NineSlice.makeNineSliceComponents(Tilesets_25.Tilesets.instance.oneBit.getNineSlice("invBoxNW"), offset.minus(new point_52.Point(Tilesets_25.TILE_SIZE / 2, Tilesets_25.TILE_SIZE / 2)), new point_52.Point(1 + InventoryDisplay.COLUMNS, 1 + inv.size / InventoryDisplay.COLUMNS));
                    bgTiles.forEach(function (tile) { return _this.displayEntity.addComponent(tile); });
                    bgTiles[0].transform.depth = UIStateManager_13.UIStateManager.UI_SPRITE_DEPTH;
                };
                InventoryDisplay.prototype.getEntities = function () {
                    return [this.e, this.displayEntity];
                };
                InventoryDisplay.prototype.close = function () {
                    if (!!this.trackedTile) {
                        return;
                    }
                    this.showingInv = false;
                    this.tiles = [];
                    this.tooltip.clear();
                    this.displayEntity = null;
                    this.tradingInv = null;
                    this.canUseItems = false;
                    if (this.onClose) {
                        this.onClose();
                        this.onClose = null;
                    }
                };
                InventoryDisplay.prototype.show = function (onClose, tradingInv) {
                    if (onClose === void 0) { onClose = null; }
                    if (tradingInv === void 0) { tradingInv = null; }
                    this.onClose = onClose;
                    this.tradingInv = tradingInv;
                    var screenDimensions = Camera_10.Camera.instance.dimensions;
                    this.showingInv = true;
                    this.tiles = [];
                    var displayDimensions = new point_52.Point(InventoryDisplay.COLUMNS, this.playerInv.size / InventoryDisplay.COLUMNS).times(Tilesets_25.TILE_SIZE);
                    this.offset = new point_52.Point(Math.floor(screenDimensions.x / 2 - displayDimensions.x / 2), Math.floor(screenDimensions.y / 5));
                    this.tradingInvOffset = this.offset.plusY(Tilesets_25.TILE_SIZE * 3.5);
                    this.displayEntity = new Entity_20.Entity([
                        // coins
                        new AnimatedTileComponent_4.AnimatedTileComponent([Tilesets_25.Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150)], new TileTransform_21.TileTransform(this.offset.plus(this.coinsOffset))),
                        new BasicRenderComponent_7.BasicRenderComponent(new TextRender_7.TextRender("x" + SaveManager_3.saveManager.getState().coins, new point_52.Point(9, 1).plus(this.offset).plus(this.coinsOffset), Text_8.TEXT_SIZE, Text_8.TEXT_FONT, "#facb3e" /* YELLOW */, UIStateManager_13.UIStateManager.UI_SPRITE_DEPTH))
                    ]);
                    this.renderInv(this.playerInv);
                    if (!!this.tradingInv) {
                        this.renderInv(this.tradingInv);
                    }
                };
                InventoryDisplay.prototype.renderInv = function (inv) {
                    // background
                    this.spawnBG(inv);
                    // icons
                    for (var i = 0; i < inv.size; i++) {
                        var stack = inv.getStack(i);
                        var tile = null;
                        if (!!stack) {
                            var c = Items_3.ITEM_METADATA_MAP[stack.item].inventoryIconSupplier().toComponent();
                            c.transform.depth = UIStateManager_13.UIStateManager.UI_SPRITE_DEPTH + 1;
                            tile = this.displayEntity.addComponent(c);
                            tile.transform.position = this.getPositionForInventoryIndex(i, inv);
                        }
                        this.tiles.push(tile);
                    }
                };
                InventoryDisplay.prototype.getPositionForInventoryIndex = function (i, inv) {
                    return new point_52.Point(i % InventoryDisplay.COLUMNS, Math.floor(i / InventoryDisplay.COLUMNS)).times(Tilesets_25.TILE_SIZE)
                        .plus(this.getOffsetForInv(inv));
                };
                /**
                 * @return a tuple of [inventory, index of that inventory which is hovered]
                 *         the result is non-null but inventory can be null
                 */
                InventoryDisplay.prototype.getHoveredInventoryIndex = function (pos) {
                    var _this = this;
                    var getIndexForOffset = function (inv) {
                        var p = pos.minus(_this.getOffsetForInv(inv));
                        var x = Math.floor(p.x / Tilesets_25.TILE_SIZE);
                        var y = Math.floor(p.y / Tilesets_25.TILE_SIZE);
                        if (x < 0 || x >= InventoryDisplay.COLUMNS || y < 0 || y >= Math.floor(inv.size / InventoryDisplay.COLUMNS)) {
                            return -1;
                        }
                        return y * InventoryDisplay.COLUMNS + x;
                    };
                    var index = getIndexForOffset(this.playerInv);
                    if (index > -1) {
                        return [this.playerInv, index];
                    }
                    if (!!this.tradingInv) {
                        var tradingIndex = getIndexForOffset(this.tradingInv);
                        if (tradingIndex > -1) {
                            return [this.tradingInv, tradingIndex];
                        }
                    }
                    return [null, -1];
                };
                InventoryDisplay.COLUMNS = 10;
                return InventoryDisplay;
            }(component_25.Component));
            exports_95("InventoryDisplay", InventoryDisplay);
        }
    };
});
System.register("game/cutscenes/CutsceneManager", ["engine/Entity", "game/SaveManager"], function (exports_96, context_96) {
    "use strict";
    var Entity_21, SaveManager_4, CutsceneManager;
    var __moduleName = context_96 && context_96.id;
    return {
        setters: [
            function (Entity_21_1) {
                Entity_21 = Entity_21_1;
            },
            function (SaveManager_4_1) {
                SaveManager_4 = SaveManager_4_1;
            }
        ],
        execute: function () {
            CutsceneManager = /** @class */ (function () {
                function CutsceneManager() {
                    this.entity = null;
                    CutsceneManager._instance = this;
                }
                Object.defineProperty(CutsceneManager, "instance", {
                    get: function () {
                        if (!this._instance) {
                            this._instance = new CutsceneManager();
                        }
                        return this._instance;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(CutsceneManager.prototype, "isMidCutscene", {
                    get: function () { return !!this.entity; },
                    enumerable: false,
                    configurable: true
                });
                /**
                 * TODO: Handle the case where a cutscene starts, overlapping (this might not matter if we are careful with how we use them)
                 * TODO: Handle saving during a cutscene. Most likely we should just block saving until after.
                 */
                CutsceneManager.prototype.startCutscene = function (cutsceneComponent) {
                    this.entity = new Entity_21.Entity([cutsceneComponent]);
                };
                CutsceneManager.prototype.finishCutscene = function () {
                    this.entity = null;
                    SaveManager_4.saveManager.save();
                };
                CutsceneManager.prototype.getEntity = function () {
                    return this.entity;
                };
                return CutsceneManager;
            }());
            exports_96("CutsceneManager", CutsceneManager);
        }
    };
});
System.register("game/ui/ControlsUI", ["game/ui/KeyPressIndicator", "engine/point", "game/graphics/Tilesets", "engine/tiles/TileTransform", "game/ui/Text", "game/ui/UIStateManager"], function (exports_97, context_97) {
    "use strict";
    var KeyPressIndicator_1, point_53, Tilesets_26, TileTransform_22, Text_9, UIStateManager_14, makeControlsUI;
    var __moduleName = context_97 && context_97.id;
    return {
        setters: [
            function (KeyPressIndicator_1_1) {
                KeyPressIndicator_1 = KeyPressIndicator_1_1;
            },
            function (point_53_1) {
                point_53 = point_53_1;
            },
            function (Tilesets_26_1) {
                Tilesets_26 = Tilesets_26_1;
            },
            function (TileTransform_22_1) {
                TileTransform_22 = TileTransform_22_1;
            },
            function (Text_9_1) {
                Text_9 = Text_9_1;
            },
            function (UIStateManager_14_1) {
                UIStateManager_14 = UIStateManager_14_1;
            }
        ],
        execute: function () {
            exports_97("makeControlsUI", makeControlsUI = function (dimensions, offset) {
                var topLeft = new point_53.Point(dimensions.x / 2 - Tilesets_26.TILE_SIZE * 4 + 1, dimensions.y / 2 - Tilesets_26.TILE_SIZE * 5).plus(offset);
                var mouseButtVertOffset = 5;
                return __spreadArrays(new KeyPressIndicator_1.KeyPressIndicator(topLeft.plusX(Tilesets_26.TILE_SIZE), 87 /* W */).getRenderMethods(), new KeyPressIndicator_1.KeyPressIndicator(topLeft.plusY(Tilesets_26.TILE_SIZE), 65 /* A */).getRenderMethods(), new KeyPressIndicator_1.KeyPressIndicator(topLeft.plusX(Tilesets_26.TILE_SIZE).plusY(Tilesets_26.TILE_SIZE), 83 /* S */).getRenderMethods(), new KeyPressIndicator_1.KeyPressIndicator(topLeft.plusX(Tilesets_26.TILE_SIZE * 2).plusY(Tilesets_26.TILE_SIZE), 68 /* D */).getRenderMethods(), [
                    Tilesets_26.Tilesets.instance.oneBit.getTileSource("leftClick").toImageRender(new TileTransform_22.TileTransform(topLeft.plusX(Tilesets_26.TILE_SIZE * 4).plusY(mouseButtVertOffset))),
                    Tilesets_26.Tilesets.instance.oneBit.getTileSource("rightClick").toImageRender(new TileTransform_22.TileTransform(topLeft.plusX(Tilesets_26.TILE_SIZE * 4).plusY(Tilesets_26.TILE_SIZE * 1 + mouseButtVertOffset)))
                ], Text_9.formatText("MOVE", "#fdf7ed" /* WHITE */, topLeft.plusX(Tilesets_26.TILE_SIZE / 2).plusY(Tilesets_26.TILE_SIZE * 2 + 2), 100), Text_9.formatText("ATTACK", "#fdf7ed" /* WHITE */, topLeft.plusX(Tilesets_26.TILE_SIZE * 5).plusY(4 + mouseButtVertOffset), 100), Text_9.formatText("BLOCK", "#fdf7ed" /* WHITE */, topLeft.plusX(Tilesets_26.TILE_SIZE * 5).plusY(Tilesets_26.TILE_SIZE + 4 + mouseButtVertOffset), 100)).map(function (r) {
                    r.depth = UIStateManager_14.UIStateManager.UI_SPRITE_DEPTH;
                    return r;
                });
            });
        }
    };
});
System.register("game/ui/PauseMenu", ["engine/component", "engine/Entity", "game/ui/UIStateManager", "engine/point", "game/ui/ButtonsMenu", "game/SaveManager", "game/cutscenes/CutsceneManager", "game/ui/ControlsUI", "engine/renderer/BasicRenderComponent"], function (exports_98, context_98) {
    "use strict";
    var component_26, Entity_22, UIStateManager_15, point_54, ButtonsMenu_2, SaveManager_5, CutsceneManager_1, ControlsUI_1, BasicRenderComponent_8, PauseMenu;
    var __moduleName = context_98 && context_98.id;
    return {
        setters: [
            function (component_26_1) {
                component_26 = component_26_1;
            },
            function (Entity_22_1) {
                Entity_22 = Entity_22_1;
            },
            function (UIStateManager_15_1) {
                UIStateManager_15 = UIStateManager_15_1;
            },
            function (point_54_1) {
                point_54 = point_54_1;
            },
            function (ButtonsMenu_2_1) {
                ButtonsMenu_2 = ButtonsMenu_2_1;
            },
            function (SaveManager_5_1) {
                SaveManager_5 = SaveManager_5_1;
            },
            function (CutsceneManager_1_1) {
                CutsceneManager_1 = CutsceneManager_1_1;
            },
            function (ControlsUI_1_1) {
                ControlsUI_1 = ControlsUI_1_1;
            },
            function (BasicRenderComponent_8_1) {
                BasicRenderComponent_8 = BasicRenderComponent_8_1;
            }
        ],
        execute: function () {
            PauseMenu = /** @class */ (function (_super) {
                __extends(PauseMenu, _super);
                function PauseMenu() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.e = new Entity_22.Entity([_this]); // entity for this component
                    _this.isOpen = false;
                    return _this;
                }
                PauseMenu.prototype.update = function (updateData) {
                    var pressEsc = updateData.input.isKeyDown(27 /* ESC */);
                    if (pressEsc && this.isOpen) {
                        this.close();
                    }
                    else if (pressEsc && !UIStateManager_15.UIStateManager.instance.isMenuOpen && !CutsceneManager_1.CutsceneManager.instance.isMidCutscene) {
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
                    var textColor = "#dc4a7b" /* PINK */;
                    var hoverColor = "#fdf7ed" /* WHITE */;
                    this.displayEntity = ButtonsMenu_2.ButtonsMenu.render(dimensions, "red", [{
                            text: "Save game".toUpperCase(),
                            fn: function () { return SaveManager_5.saveManager.save(); },
                            buttonColor: buttonColor, textColor: textColor, hoverColor: hoverColor,
                        },
                        {
                            text: "Load last save".toUpperCase(),
                            fn: function () { return SaveManager_5.saveManager.load(); },
                            buttonColor: buttonColor, textColor: textColor, hoverColor: hoverColor,
                        }]);
                    this.controlsDisplay = new Entity_22.Entity([new (BasicRenderComponent_8.BasicRenderComponent.bind.apply(BasicRenderComponent_8.BasicRenderComponent, __spreadArrays([void 0], ControlsUI_1.makeControlsUI(dimensions, point_54.Point.ZERO))))()]);
                };
                PauseMenu.prototype.getEntities = function () {
                    return [
                        this.e,
                        this.displayEntity,
                        this.controlsDisplay
                    ];
                };
                return PauseMenu;
            }(component_26.Component));
            exports_98("PauseMenu", PauseMenu);
        }
    };
});
System.register("game/ui/UIStateManager", ["game/ui/HUD", "game/characters/Player", "game/ui/InventoryDisplay", "game/ui/DialogueDisplay", "game/ui/PlaceElementDisplay", "game/ui/PauseMenu", "game/ui/CraftingMenu", "game/ui/SellMenu", "game/ui/NotificationDisplay"], function (exports_99, context_99) {
    "use strict";
    var HUD_3, Player_11, InventoryDisplay_1, DialogueDisplay_4, PlaceElementDisplay_3, PauseMenu_1, CraftingMenu_2, SellMenu_2, NotificationDisplay_2, UIStateManager;
    var __moduleName = context_99 && context_99.id;
    return {
        setters: [
            function (HUD_3_1) {
                HUD_3 = HUD_3_1;
            },
            function (Player_11_1) {
                Player_11 = Player_11_1;
            },
            function (InventoryDisplay_1_1) {
                InventoryDisplay_1 = InventoryDisplay_1_1;
            },
            function (DialogueDisplay_4_1) {
                DialogueDisplay_4 = DialogueDisplay_4_1;
            },
            function (PlaceElementDisplay_3_1) {
                PlaceElementDisplay_3 = PlaceElementDisplay_3_1;
            },
            function (PauseMenu_1_1) {
                PauseMenu_1 = PauseMenu_1_1;
            },
            function (CraftingMenu_2_1) {
                CraftingMenu_2 = CraftingMenu_2_1;
            },
            function (SellMenu_2_1) {
                SellMenu_2 = SellMenu_2_1;
            },
            function (NotificationDisplay_2_1) {
                NotificationDisplay_2 = NotificationDisplay_2_1;
            }
        ],
        execute: function () {
            UIStateManager = /** @class */ (function () {
                function UIStateManager() {
                    this.hud = new HUD_3.HUD();
                    this.inventory = new InventoryDisplay_1.InventoryDisplay();
                    this.dialogueDisplay = new DialogueDisplay_4.DialogueDisplay();
                    this.placeElementDisplay = new PlaceElementDisplay_3.PlaceElementDisplay();
                    this.pauseMenu = new PauseMenu_1.PauseMenu();
                    this.craftingMenu = new CraftingMenu_2.CraftingMenu();
                    this.sellMenu = new SellMenu_2.SellMenu();
                    this.notificationDisplay = new NotificationDisplay_2.NotificationDisplay();
                    // if this is true, input observed by other components (like the player) 
                    // should be skipped because a menu is open. Other menus should only open
                    // if this is false
                    this.captureInput = false;
                    UIStateManager._instance = this;
                }
                Object.defineProperty(UIStateManager, "instance", {
                    get: function () {
                        if (!this._instance) {
                            this._instance = new UIStateManager();
                        }
                        return this._instance;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(UIStateManager.prototype, "isMenuOpen", {
                    get: function () { return this.captureInput; },
                    enumerable: false,
                    configurable: true
                });
                // Resets the singleton UIStateManager
                UIStateManager.prototype.destroy = function () {
                    UIStateManager._instance = new UIStateManager();
                };
                UIStateManager.prototype.get = function (dimensions, elapsedMillis) {
                    if (!Player_11.Player.instance.dude) {
                        return [];
                    }
                    this.captureInput = this.inventory.isOpen
                        || this.dialogueDisplay.isOpen
                        || this.placeElementDisplay.isOpen
                        || this.pauseMenu.isOpen
                        || this.craftingMenu.isOpen
                        || this.sellMenu.isOpen;
                    return this.hud.getEntities(Player_11.Player.instance.dude, dimensions, elapsedMillis)
                        .concat(this.inventory.getEntities())
                        .concat(this.dialogueDisplay.getEntities())
                        .concat(this.placeElementDisplay.getEntities())
                        .concat(this.pauseMenu.getEntities())
                        .concat(this.craftingMenu.getEntities())
                        .concat(this.sellMenu.getEntities())
                        .concat(this.notificationDisplay.getEntities());
                };
                UIStateManager.UI_SPRITE_DEPTH = Number.MAX_SAFE_INTEGER / 2;
                return UIStateManager;
            }());
            exports_99("UIStateManager", UIStateManager);
        }
    };
});
System.register("game/ui/KeyPressIndicator", ["engine/component", "game/graphics/Tilesets", "engine/tiles/TileTransform", "engine/point", "engine/renderer/TextRender", "game/Controls", "game/ui/Text", "game/ui/UIStateManager"], function (exports_100, context_100) {
    "use strict";
    var component_27, Tilesets_27, TileTransform_23, point_55, TextRender_8, Controls_5, Text_10, UIStateManager_16, KeyPressIndicator;
    var __moduleName = context_100 && context_100.id;
    return {
        setters: [
            function (component_27_1) {
                component_27 = component_27_1;
            },
            function (Tilesets_27_1) {
                Tilesets_27 = Tilesets_27_1;
            },
            function (TileTransform_23_1) {
                TileTransform_23 = TileTransform_23_1;
            },
            function (point_55_1) {
                point_55 = point_55_1;
            },
            function (TextRender_8_1) {
                TextRender_8 = TextRender_8_1;
            },
            function (Controls_5_1) {
                Controls_5 = Controls_5_1;
            },
            function (Text_10_1) {
                Text_10 = Text_10_1;
            },
            function (UIStateManager_16_1) {
                UIStateManager_16 = UIStateManager_16_1;
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
                        Tilesets_27.Tilesets.instance.oneBit.getTileSource("keycap").toImageRender(new TileTransform_23.TileTransform(this.pos, null, 0, false, false, UIStateManager_16.UIStateManager.UI_SPRITE_DEPTH)),
                        new TextRender_8.TextRender(Controls_5.Controls.keyString(this.key).toLowerCase(), this.pos.plus(new point_55.Point(4, 4)), Text_10.TEXT_SIZE, Text_10.TEXT_FONT, "#222222" /* BLACK */, UIStateManager_16.UIStateManager.UI_SPRITE_DEPTH)
                    ];
                };
                return KeyPressIndicator;
            }(component_27.Component));
            exports_100("KeyPressIndicator", KeyPressIndicator);
        }
    };
});
System.register("game/world/elements/Interactable", ["engine/component", "engine/point", "game/ui/KeyPressIndicator", "game/Controls", "game/graphics/Tilesets", "game/ui/UIStateManager"], function (exports_101, context_101) {
    "use strict";
    var component_28, point_56, KeyPressIndicator_2, Controls_6, Tilesets_28, UIStateManager_17, Interactable;
    var __moduleName = context_101 && context_101.id;
    return {
        setters: [
            function (component_28_1) {
                component_28 = component_28_1;
            },
            function (point_56_1) {
                point_56 = point_56_1;
            },
            function (KeyPressIndicator_2_1) {
                KeyPressIndicator_2 = KeyPressIndicator_2_1;
            },
            function (Controls_6_1) {
                Controls_6 = Controls_6_1;
            },
            function (Tilesets_28_1) {
                Tilesets_28 = Tilesets_28_1;
            },
            function (UIStateManager_17_1) {
                UIStateManager_17 = UIStateManager_17_1;
            }
        ],
        execute: function () {
            Interactable = /** @class */ (function (_super) {
                __extends(Interactable, _super);
                function Interactable(position, fn, uiOffset, isInteractable) {
                    if (uiOffset === void 0) { uiOffset = point_56.Point.ZERO; }
                    if (isInteractable === void 0) { isInteractable = function () { return !UIStateManager_17.UIStateManager.instance.isMenuOpen; }; }
                    var _this = _super.call(this) || this;
                    _this.position = position;
                    _this.interact = fn;
                    _this.uiOffset = uiOffset;
                    _this.isInteractable = isInteractable;
                    return _this;
                }
                Object.defineProperty(Interactable.prototype, "isShowingUI", {
                    get: function () { return this.showUI; },
                    enumerable: false,
                    configurable: true
                });
                Interactable.prototype.updateIndicator = function (showUI) {
                    this.showUI = showUI;
                };
                Interactable.prototype.interact = function () { };
                Interactable.prototype.getRenderMethods = function () {
                    if (!this.showUI) {
                        return [];
                    }
                    return new KeyPressIndicator_2.KeyPressIndicator(this.position.minus(new point_56.Point(Tilesets_28.TILE_SIZE / 2, Tilesets_28.TILE_SIZE / 2)).plus(this.uiOffset), Controls_6.Controls.interactButton).getRenderMethods();
                };
                return Interactable;
            }(component_28.Component));
            exports_101("Interactable", Interactable);
        }
    };
});
System.register("game/world/Teleporter", ["engine/component", "engine/Entity", "engine/point", "engine/tiles/TileTransform", "game/graphics/Tilesets", "game/world/elements/ElementComponent", "game/world/elements/Interactable", "game/world/elements/ElementFactory"], function (exports_102, context_102) {
    "use strict";
    var component_29, Entity_23, point_57, TileTransform_24, Tilesets_29, ElementComponent_3, Interactable_3, ElementFactory_3, Teleporters, TeleporterFactory;
    var __moduleName = context_102 && context_102.id;
    return {
        setters: [
            function (component_29_1) {
                component_29 = component_29_1;
            },
            function (Entity_23_1) {
                Entity_23 = Entity_23_1;
            },
            function (point_57_1) {
                point_57 = point_57_1;
            },
            function (TileTransform_24_1) {
                TileTransform_24 = TileTransform_24_1;
            },
            function (Tilesets_29_1) {
                Tilesets_29 = Tilesets_29_1;
            },
            function (ElementComponent_3_1) {
                ElementComponent_3 = ElementComponent_3_1;
            },
            function (Interactable_3_1) {
                Interactable_3 = Interactable_3_1;
            },
            function (ElementFactory_3_1) {
                ElementFactory_3 = ElementFactory_3_1;
            }
        ],
        execute: function () {
            exports_102("Teleporters", Teleporters = {
                teleporterId: function (toUUID, id) {
                    if (id === void 0) { id = null; }
                    return "" + toUUID + (!!id ? "$" + id : '');
                },
                getId: function (teleporterId) {
                    var dollarIndex = teleporterId.indexOf("$");
                    return dollarIndex === -1 ? undefined : teleporterId.substring(teleporterId.indexOf("$") + 1);
                }
            });
            TeleporterFactory = /** @class */ (function (_super) {
                __extends(TeleporterFactory, _super);
                function TeleporterFactory() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.type = 5 /* TELEPORTER */;
                    _this.dimensions = new point_57.Point(1, 1);
                    return _this;
                }
                TeleporterFactory.prototype.make = function (wl, pos, data) {
                    var e = new Entity_23.Entity();
                    var destinationUUID = data["to"];
                    var i = data["i"]; // the position for the interactable
                    if (!destinationUUID || !i) {
                        throw new Error("teleporter element must have 'to' and 'i' parameters");
                    }
                    var interactPos = point_57.Point.fromString(i);
                    var id = data["id"];
                    var interactComponent = e.addComponent(new Interactable_3.Interactable(interactPos, function () { return wl.useTeleporter(destinationUUID, id); }, new point_57.Point(0, Tilesets_29.TILE_SIZE / 2)));
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
                            return [Tilesets_29.Tilesets.instance.oneBit.getTileSource("small_arrow_down").toImageRender(new TileTransform_24.TileTransform(pos.times(Tilesets_29.TILE_SIZE)))];
                        };
                        return class_1;
                    }(component_29.Component)));
                    return e.addComponent(new ElementComponent_3.ElementComponent(5 /* TELEPORTER */, pos, [pos], function () { return data; }));
                };
                return TeleporterFactory;
            }(ElementFactory_3.ElementFactory));
            exports_102("TeleporterFactory", TeleporterFactory);
        }
    };
});
System.register("game/world/elements/Chest", ["engine/collision/BoxCollider", "engine/Entity", "engine/point", "engine/tiles/AnimatedTileComponent", "engine/tiles/TileSetAnimation", "engine/tiles/TileTransform", "game/graphics/Tilesets", "game/items/Inventory", "game/ui/InventoryDisplay", "game/world/elements/ElementComponent", "game/world/elements/ElementFactory", "game/world/elements/Interactable"], function (exports_103, context_103) {
    "use strict";
    var BoxCollider_4, Entity_24, point_58, AnimatedTileComponent_5, TileSetAnimation_5, TileTransform_25, Tilesets_30, Inventory_2, InventoryDisplay_2, ElementComponent_4, ElementFactory_4, Interactable_4, INVENTORY, ChestFactory;
    var __moduleName = context_103 && context_103.id;
    return {
        setters: [
            function (BoxCollider_4_1) {
                BoxCollider_4 = BoxCollider_4_1;
            },
            function (Entity_24_1) {
                Entity_24 = Entity_24_1;
            },
            function (point_58_1) {
                point_58 = point_58_1;
            },
            function (AnimatedTileComponent_5_1) {
                AnimatedTileComponent_5 = AnimatedTileComponent_5_1;
            },
            function (TileSetAnimation_5_1) {
                TileSetAnimation_5 = TileSetAnimation_5_1;
            },
            function (TileTransform_25_1) {
                TileTransform_25 = TileTransform_25_1;
            },
            function (Tilesets_30_1) {
                Tilesets_30 = Tilesets_30_1;
            },
            function (Inventory_2_1) {
                Inventory_2 = Inventory_2_1;
            },
            function (InventoryDisplay_2_1) {
                InventoryDisplay_2 = InventoryDisplay_2_1;
            },
            function (ElementComponent_4_1) {
                ElementComponent_4 = ElementComponent_4_1;
            },
            function (ElementFactory_4_1) {
                ElementFactory_4 = ElementFactory_4_1;
            },
            function (Interactable_4_1) {
                Interactable_4 = Interactable_4_1;
            }
        ],
        execute: function () {
            INVENTORY = 'i';
            ChestFactory = /** @class */ (function (_super) {
                __extends(ChestFactory, _super);
                function ChestFactory() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.type = 8 /* CHEST */;
                    _this.dimensions = new point_58.Point(1, 1);
                    return _this;
                }
                ChestFactory.prototype.make = function (wl, pos, data) {
                    var inventory = !!data[INVENTORY] ? Inventory_2.Inventory.load(data[INVENTORY]) : new Inventory_2.Inventory(20);
                    var tiles = Tilesets_30.Tilesets.instance.dungeonCharacters.getTileSetAnimationFrames("chest_empty_open_anim");
                    var openSpeed = 80;
                    var closeSpeed = 20;
                    var animator = new AnimatedTileComponent_5.AnimatedTileComponent([
                        // opening
                        new TileSetAnimation_5.TileSetAnimation([[tiles[0], openSpeed], [tiles[1], openSpeed], [tiles[2], openSpeed]], function () { return animator.pause(); }),
                        // closing
                        new TileSetAnimation_5.TileSetAnimation([[tiles[2], closeSpeed], [tiles[1], closeSpeed], [tiles[0], closeSpeed]], function () { return animator.pause(); }),
                    ], TileTransform_25.TileTransform.new({ position: pos.times(Tilesets_30.TILE_SIZE), depth: pos.y * Tilesets_30.TILE_SIZE + Tilesets_30.TILE_SIZE }));
                    animator.pause();
                    var interactable = new Interactable_4.Interactable(pos.times(Tilesets_30.TILE_SIZE).plusX(Tilesets_30.TILE_SIZE / 2).plusY(10), function () {
                        InventoryDisplay_2.InventoryDisplay.instance.show(function () { return animator.goToAnimation(1).play(); }, inventory);
                        animator.goToAnimation(0).play();
                    }, new point_58.Point(0, -17));
                    var collider = new BoxCollider_4.BoxCollider(pos.times(Tilesets_30.TILE_SIZE).plusY(9), new point_58.Point(Tilesets_30.TILE_SIZE, 7));
                    var e = new Entity_24.Entity([animator, interactable, collider]);
                    return e.addComponent(new ElementComponent_4.ElementComponent(this.type, pos, [pos], function () {
                        var _a;
                        return (_a = {},
                            _a[INVENTORY] = inventory.save(),
                            _a);
                    }));
                };
                return ChestFactory;
            }(ElementFactory_4.ElementFactory));
            exports_103("ChestFactory", ChestFactory);
        }
    };
});
System.register("game/world/elements/Hittable", ["engine/component", "engine/util/Animator"], function (exports_104, context_104) {
    "use strict";
    var component_30, Animator_3, Hittable;
    var __moduleName = context_104 && context_104.id;
    return {
        setters: [
            function (component_30_1) {
                component_30 = component_30_1;
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
                 * @param tileTransforms the tiles which will be moved
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
                    setTimeout(function () { return _this.onHit(dir); }, 150);
                };
                return Hittable;
            }(component_30.Component));
            exports_104("Hittable", Hittable);
        }
    };
});
System.register("game/world/elements/Mushroom", ["engine/component", "engine/Entity", "engine/point", "engine/tiles/TileComponent", "engine/tiles/TileTransform", "game/characters/DudeFactory", "game/graphics/Tilesets", "game/items/Items", "game/world/LocationManager", "game/world/TimeUnit", "game/world/WorldTime", "game/world/elements/ElementComponent", "game/world/elements/ElementFactory", "game/world/elements/Hittable"], function (exports_105, context_105) {
    "use strict";
    var component_31, Entity_25, point_59, TileComponent_6, TileTransform_26, DudeFactory_3, Tilesets_31, Items_4, LocationManager_16, TimeUnit_5, WorldTime_7, ElementComponent_5, ElementFactory_5, Hittable_1, NEXT_GROWTH_TIME, MushroomFactory, GrowableShroom;
    var __moduleName = context_105 && context_105.id;
    return {
        setters: [
            function (component_31_1) {
                component_31 = component_31_1;
            },
            function (Entity_25_1) {
                Entity_25 = Entity_25_1;
            },
            function (point_59_1) {
                point_59 = point_59_1;
            },
            function (TileComponent_6_1) {
                TileComponent_6 = TileComponent_6_1;
            },
            function (TileTransform_26_1) {
                TileTransform_26 = TileTransform_26_1;
            },
            function (DudeFactory_3_1) {
                DudeFactory_3 = DudeFactory_3_1;
            },
            function (Tilesets_31_1) {
                Tilesets_31 = Tilesets_31_1;
            },
            function (Items_4_1) {
                Items_4 = Items_4_1;
            },
            function (LocationManager_16_1) {
                LocationManager_16 = LocationManager_16_1;
            },
            function (TimeUnit_5_1) {
                TimeUnit_5 = TimeUnit_5_1;
            },
            function (WorldTime_7_1) {
                WorldTime_7 = WorldTime_7_1;
            },
            function (ElementComponent_5_1) {
                ElementComponent_5 = ElementComponent_5_1;
            },
            function (ElementFactory_5_1) {
                ElementFactory_5 = ElementFactory_5_1;
            },
            function (Hittable_1_1) {
                Hittable_1 = Hittable_1_1;
            }
        ],
        execute: function () {
            NEXT_GROWTH_TIME = "ngt";
            MushroomFactory = /** @class */ (function (_super) {
                __extends(MushroomFactory, _super);
                function MushroomFactory() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.type = 7 /* MUSHROOM */;
                    _this.dimensions = new point_59.Point(1, 1);
                    return _this;
                }
                MushroomFactory.prototype.make = function (wl, pos, data) {
                    var _a;
                    var nextGrowthTime = (_a = data[NEXT_GROWTH_TIME]) !== null && _a !== void 0 ? _a : this.nextGrowthTime();
                    var e = new Entity_25.Entity();
                    var randomOffset = new point_59.Point(0, -4).randomlyShifted(3, 3);
                    var depth = (pos.y + 1) * Tilesets_31.TILE_SIZE + randomOffset.y;
                    var addTile = function (s, pos) {
                        var tile = e.addComponent(new TileComponent_6.TileComponent(Tilesets_31.Tilesets.instance.outdoorTiles.getTileSource(s), new TileTransform_26.TileTransform(pos.times(Tilesets_31.TILE_SIZE).plus(randomOffset))));
                        tile.transform.depth = depth;
                        return tile;
                    };
                    var tile = addTile("mushroomPlaced", pos);
                    var hittableCenter = pos.times(Tilesets_31.TILE_SIZE).plus(new point_59.Point(Tilesets_31.TILE_SIZE / 2, Tilesets_31.TILE_SIZE / 2));
                    e.addComponent(new Hittable_1.Hittable(hittableCenter, [tile.transform], function (dir) {
                        e.selfDestruct();
                        var itemDirection = dir.randomlyShifted(.2).normalized();
                        Items_4.spawnItem(pos.times(Tilesets_31.TILE_SIZE).plusY(Tilesets_31.TILE_SIZE).plusX(Tilesets_31.TILE_SIZE / 2), 9 /* MUSHROOM */, itemDirection.times(5));
                    }));
                    e.addComponent(new GrowableShroom(nextGrowthTime, function () {
                        e.selfDestruct();
                        DudeFactory_3.DudeFactory.instance.new(6 /* SHROOM */, pos.times(Tilesets_31.TILE_SIZE).plusY(-Tilesets_31.TILE_SIZE).plusX(-Tilesets_31.TILE_SIZE / 2), LocationManager_16.LocationManager.instance.exterior());
                    }));
                    return e.addComponent(new ElementComponent_5.ElementComponent(this.type, pos, [pos], function () {
                        var _a;
                        return (_a = {},
                            _a[NEXT_GROWTH_TIME] = nextGrowthTime,
                            _a);
                    }));
                };
                MushroomFactory.prototype.canPlace = function (pos) {
                    return LocationManager_16.LocationManager.instance.currentLocation.ground.get(pos.plusY(1)).type === 2 /* GRASS */;
                };
                MushroomFactory.prototype.nextGrowthTime = function () {
                    // grow every 12-24 hours
                    return WorldTime_7.WorldTime.instance.time + TimeUnit_5.TimeUnit.DAY * (0.5 + Math.random() / 2);
                };
                return MushroomFactory;
            }(ElementFactory_5.ElementFactory));
            exports_105("MushroomFactory", MushroomFactory);
            GrowableShroom = /** @class */ (function (_super) {
                __extends(GrowableShroom, _super);
                function GrowableShroom(nextGrowthTime, growFn) {
                    var _this = _super.call(this) || this;
                    _this.nextGrowthTime = nextGrowthTime;
                    _this.growFn = growFn;
                    return _this;
                }
                GrowableShroom.prototype.lateUpdate = function () {
                    if (WorldTime_7.WorldTime.instance.time < this.nextGrowthTime) {
                        return;
                    }
                    this.growFn();
                };
                return GrowableShroom;
            }(component_31.Component));
        }
    };
});
System.register("game/world/elements/HittableResource", ["engine/collision/BoxCollider", "engine/point", "game/graphics/Tilesets", "game/items/Items", "game/world/LocationManager", "game/world/elements/ElementComponent", "game/world/elements/Hittable"], function (exports_106, context_106) {
    "use strict";
    var BoxCollider_5, point_60, Tilesets_32, Items_5, LocationManager_17, ElementComponent_6, Hittable_2, HittableResource;
    var __moduleName = context_106 && context_106.id;
    return {
        setters: [
            function (BoxCollider_5_1) {
                BoxCollider_5 = BoxCollider_5_1;
            },
            function (point_60_1) {
                point_60 = point_60_1;
            },
            function (Tilesets_32_1) {
                Tilesets_32 = Tilesets_32_1;
            },
            function (Items_5_1) {
                Items_5 = Items_5_1;
            },
            function (LocationManager_17_1) {
                LocationManager_17 = LocationManager_17_1;
            },
            function (ElementComponent_6_1) {
                ElementComponent_6 = ElementComponent_6_1;
            },
            function (Hittable_2_1) {
                Hittable_2 = Hittable_2_1;
            }
        ],
        execute: function () {
            HittableResource = /** @class */ (function (_super) {
                __extends(HittableResource, _super);
                function HittableResource(position, tileTransforms, freeResources, maxResources, itemSupplier) {
                    var _this = _super.call(this, position, tileTransforms, function (hitDir) { return _this.hitCallback(hitDir); }) || this;
                    _this.freeResources = freeResources;
                    _this.maxResources = maxResources;
                    _this.itemSupplier = itemSupplier;
                    return _this;
                }
                HittableResource.prototype.hitCallback = function (hitDir) {
                    this.freeResources--;
                    if (this.freeResources < 0 && this.freeResources > HittableResource.negativeThreshold) {
                        return;
                    }
                    var finishingMove = this.freeResources < 0;
                    var velocityMultiplier = finishingMove ? .6 : 1;
                    var placeDistance = finishingMove ? 2 : 8;
                    var itemsOut = finishingMove ? 3 : 1;
                    for (var i = 0; i < itemsOut; i++) {
                        var items = this.itemSupplier();
                        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                            var item = items_1[_i];
                            var itemDirection = hitDir.randomlyShifted(.5).normalized();
                            var velocity = itemDirection.times(1 + 3 * Math.random());
                            Items_5.spawnItem(this.position.plus(new point_60.Point(0, Tilesets_32.TILE_SIZE / 2)).plus(itemDirection.times(placeDistance)), // bottom center, then randomly adjusted
                            item, velocity.times(velocityMultiplier), this.entity.getComponent(BoxCollider_5.BoxCollider));
                        }
                    }
                    if (finishingMove) {
                        LocationManager_17.LocationManager.instance.currentLocation.removeElement(this.entity.getComponent(ElementComponent_6.ElementComponent));
                        this.entity.selfDestruct();
                    }
                };
                // TODO actually call this 
                HittableResource.prototype.replenish = function () {
                    if (!!this.entity && this.enabled) {
                        this.freeResources = Math.min(Math.max(this.freeResources + 1, 0), this.maxResources);
                    }
                };
                HittableResource.negativeThreshold = -4;
                return HittableResource;
            }(Hittable_2.Hittable));
            exports_106("HittableResource", HittableResource);
        }
    };
});
System.register("game/world/elements/Rock", ["engine/point", "game/graphics/Tilesets", "engine/collision/BoxCollider", "engine/tiles/TileComponent", "engine/tiles/TileTransform", "engine/Entity", "game/world/elements/ElementComponent", "game/world/elements/HittableResource", "game/characters/Player", "game/characters/weapons/WeaponType", "game/world/elements/ElementFactory"], function (exports_107, context_107) {
    "use strict";
    var point_61, Tilesets_33, BoxCollider_6, TileComponent_7, TileTransform_27, Entity_26, ElementComponent_7, HittableResource_1, Player_12, WeaponType_2, ElementFactory_6, RockFactory;
    var __moduleName = context_107 && context_107.id;
    return {
        setters: [
            function (point_61_1) {
                point_61 = point_61_1;
            },
            function (Tilesets_33_1) {
                Tilesets_33 = Tilesets_33_1;
            },
            function (BoxCollider_6_1) {
                BoxCollider_6 = BoxCollider_6_1;
            },
            function (TileComponent_7_1) {
                TileComponent_7 = TileComponent_7_1;
            },
            function (TileTransform_27_1) {
                TileTransform_27 = TileTransform_27_1;
            },
            function (Entity_26_1) {
                Entity_26 = Entity_26_1;
            },
            function (ElementComponent_7_1) {
                ElementComponent_7 = ElementComponent_7_1;
            },
            function (HittableResource_1_1) {
                HittableResource_1 = HittableResource_1_1;
            },
            function (Player_12_1) {
                Player_12 = Player_12_1;
            },
            function (WeaponType_2_1) {
                WeaponType_2 = WeaponType_2_1;
            },
            function (ElementFactory_6_1) {
                ElementFactory_6 = ElementFactory_6_1;
            }
        ],
        execute: function () {
            RockFactory = /** @class */ (function (_super) {
                __extends(RockFactory, _super);
                function RockFactory() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.type = 2 /* ROCK */;
                    _this.dimensions = new point_61.Point(1, 1);
                    return _this;
                }
                RockFactory.prototype.make = function (wl, pos, data) {
                    var _a, _b, _c, _d;
                    var e = new Entity_26.Entity();
                    var variation = (_a = data["v"]) !== null && _a !== void 0 ? _a : (Math.floor(Math.random() * 3) + 1);
                    var mossy = (_b = data["m"]) !== null && _b !== void 0 ? _b : (Math.random() > .7);
                    var flipped = (_c = data["f"]) !== null && _c !== void 0 ? _c : (Math.random() > .5);
                    var maxResourcesCount = 6;
                    var availableResources = (_d = data["a"]) !== null && _d !== void 0 ? _d : maxResourcesCount;
                    var tile = e.addComponent(new TileComponent_7.TileComponent(Tilesets_33.Tilesets.instance.outdoorTiles.getTileSource("rock" + variation + (mossy ? 'mossy' : '')), new TileTransform_27.TileTransform(pos.times(Tilesets_33.TILE_SIZE))));
                    tile.transform.depth = (pos.y + 1) * Tilesets_33.TILE_SIZE - /* prevent weapon from clipping */ 5;
                    tile.transform.mirrorX = flipped;
                    var hitboxDims = new point_61.Point(12, 4);
                    e.addComponent(new BoxCollider_6.BoxCollider(pos.plus(new point_61.Point(.5, 1)).times(Tilesets_33.TILE_SIZE).minus(new point_61.Point(hitboxDims.x / 2, hitboxDims.y + 2)), hitboxDims));
                    var hittableResource = e.addComponent(new HittableResource_1.HittableResource(pos.plus(new point_61.Point(.5, .5)).times(Tilesets_33.TILE_SIZE), [tile.transform], availableResources, maxResourcesCount, function () {
                        if (Player_12.Player.instance.dude.weaponType === WeaponType_2.WeaponType.PICKAXE) {
                            return Math.random() > .5 ? [5 /* IRON */] : [1 /* ROCK */];
                        }
                        else {
                            return Math.random() > .9 ? [5 /* IRON */] : [1 /* ROCK */];
                        }
                    }));
                    return e.addComponent(new ElementComponent_7.ElementComponent(2 /* ROCK */, pos, [pos], function () { return { v: variation, m: mossy, f: flipped, a: hittableResource.freeResources }; }));
                };
                return RockFactory;
            }(ElementFactory_6.ElementFactory));
            exports_107("RockFactory", RockFactory);
        }
    };
});
System.register("game/world/interior/AsciiInteriorBuilder", ["engine/point"], function (exports_108, context_108) {
    "use strict";
    var point_62, AsciiInteriorBuilder;
    var __moduleName = context_108 && context_108.id;
    return {
        setters: [
            function (point_62_1) {
                point_62 = point_62_1;
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
                                fn(new point_62.Point(col, row));
                            }
                        }
                    }
                    return this;
                };
                return AsciiInteriorBuilder;
            }());
            exports_108("AsciiInteriorBuilder", AsciiInteriorBuilder);
        }
    };
});
System.register("game/world/interior/Tent", ["game/world/WorldLocation", "game/world/LocationManager", "engine/point", "game/graphics/Tilesets", "engine/tiles/NineSlice", "game/world/interior/AsciiInteriorBuilder", "game/world/interior/InteriorUtils"], function (exports_109, context_109) {
    "use strict";
    var WorldLocation_2, LocationManager_18, point_63, Tilesets_34, NineSlice_8, AsciiInteriorBuilder_1, InteriorUtils_2, makeTentInterior;
    var __moduleName = context_109 && context_109.id;
    return {
        setters: [
            function (WorldLocation_2_1) {
                WorldLocation_2 = WorldLocation_2_1;
            },
            function (LocationManager_18_1) {
                LocationManager_18 = LocationManager_18_1;
            },
            function (point_63_1) {
                point_63 = point_63_1;
            },
            function (Tilesets_34_1) {
                Tilesets_34 = Tilesets_34_1;
            },
            function (NineSlice_8_1) {
                NineSlice_8 = NineSlice_8_1;
            },
            function (AsciiInteriorBuilder_1_1) {
                AsciiInteriorBuilder_1 = AsciiInteriorBuilder_1_1;
            },
            function (InteriorUtils_2_1) {
                InteriorUtils_2 = InteriorUtils_2_1;
            }
        ],
        execute: function () {
            exports_109("makeTentInterior", makeTentInterior = function (outside, color) {
                var isPlayerTent = color === "blue" /* BLUE */;
                var l = new WorldLocation_2.WorldLocation(true, isPlayerTent);
                LocationManager_18.LocationManager.instance.add(l);
                var floorDimensions = new point_63.Point(5, 4);
                l.setBarriers(InteriorUtils_2.InteriorUtils.makeBarriers(floorDimensions));
                var interactablePos = new point_63.Point(2.5, 4).times(Tilesets_34.TILE_SIZE);
                var teleporter = { to: outside.uuid, pos: interactablePos.plusY(-4) };
                l.addTeleporter(teleporter);
                l.addElement(5 /* TELEPORTER */, new point_63.Point(2, 4), { to: outside.uuid, i: interactablePos.toString() });
                var groundType = color + "tentInterior";
                NineSlice_8.NineSlice.nineSliceForEach(floorDimensions, function (pt, index) { return l.addGroundElement(1 /* BASIC_NINE_SLICE */, pt, { k: groundType, i: index }); });
                new AsciiInteriorBuilder_1.AsciiInteriorBuilder("  ^  ", " /xl ", "/xxxl").map("/", function (pt) { l.addGroundElement(0 /* BASIC */, pt.plusY(-3), { k: color + "tentl" }); })
                    .map("^", function (pt) { l.addGroundElement(0 /* BASIC */, pt.plusY(-3), { k: color + "tenttip" }); })
                    .map("l", function (pt) { l.addGroundElement(0 /* BASIC */, pt.plusY(-3), { k: color + "tentr" }); })
                    .map("x", function (pt) { l.addGroundElement(0 /* BASIC */, pt.plusY(-3), { k: color + "tentCenter" }); });
                return l;
            });
        }
    };
});
System.register("game/world/elements/Tent", ["engine/collision/BoxCollider", "engine/Entity", "engine/point", "engine/tiles/TileComponent", "engine/tiles/TileTransform", "game/graphics/Tilesets", "game/world/interior/Tent", "game/world/elements/ElementComponent", "game/world/elements/ElementFactory", "game/world/elements/ElementUtils", "game/world/elements/Interactable"], function (exports_110, context_110) {
    "use strict";
    var BoxCollider_7, Entity_27, point_64, TileComponent_8, TileTransform_28, Tilesets_35, Tent_1, ElementComponent_8, ElementFactory_7, ElementUtils_3, Interactable_5, TentFactory, addTile;
    var __moduleName = context_110 && context_110.id;
    return {
        setters: [
            function (BoxCollider_7_1) {
                BoxCollider_7 = BoxCollider_7_1;
            },
            function (Entity_27_1) {
                Entity_27 = Entity_27_1;
            },
            function (point_64_1) {
                point_64 = point_64_1;
            },
            function (TileComponent_8_1) {
                TileComponent_8 = TileComponent_8_1;
            },
            function (TileTransform_28_1) {
                TileTransform_28 = TileTransform_28_1;
            },
            function (Tilesets_35_1) {
                Tilesets_35 = Tilesets_35_1;
            },
            function (Tent_1_1) {
                Tent_1 = Tent_1_1;
            },
            function (ElementComponent_8_1) {
                ElementComponent_8 = ElementComponent_8_1;
            },
            function (ElementFactory_7_1) {
                ElementFactory_7 = ElementFactory_7_1;
            },
            function (ElementUtils_3_1) {
                ElementUtils_3 = ElementUtils_3_1;
            },
            function (Interactable_5_1) {
                Interactable_5 = Interactable_5_1;
            }
        ],
        execute: function () {
            /**
             * At runtime, a building exterior consists of several components:
             *   1. Tiles, the visual component
             *   2. A collider
             *   3. A door teleporter
             * Data that is saved:
             *   1. Element type
             *   2. "Occupied points" which determines occupied squares in the world grid
             *   3. Misc metadata about the building
             */
            TentFactory = /** @class */ (function (_super) {
                __extends(TentFactory, _super);
                function TentFactory() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.type = 3 /* TENT */;
                    _this.dimensions = new point_64.Point(4, 3);
                    return _this;
                }
                TentFactory.prototype.make = function (wl, pos, data) {
                    var _a, _b;
                    var e = new Entity_27.Entity();
                    var color = (_a = data["color"]) !== null && _a !== void 0 ? _a : "blue" /* BLUE */;
                    var destinationUUID = (_b = data["destinationUUID"]) !== null && _b !== void 0 ? _b : Tent_1.makeTentInterior(wl, color).uuid;
                    var interactablePos = pos.plus(new point_64.Point(2, 2)).times(Tilesets_35.TILE_SIZE);
                    var sourceTeleporter = { to: destinationUUID, pos: interactablePos.plusY(12) };
                    wl.addTeleporter(sourceTeleporter);
                    // Set up tiles
                    var depth = (pos.y + 1) * Tilesets_35.TILE_SIZE + /* prevent clipping */ 1;
                    addTile(e, color + "tentNW", pos.plusX(1), depth);
                    addTile(e, color + "tentNE", pos.plus(new point_64.Point(2, 0)), depth);
                    addTile(e, color + "tentSW", pos.plus(new point_64.Point(1, 1)), depth);
                    addTile(e, color + "tentSE", pos.plus(new point_64.Point(2, 1)), depth);
                    e.addComponent(new BoxCollider_7.BoxCollider(pos.plus(new point_64.Point(1, 1)).times(Tilesets_35.TILE_SIZE), new point_64.Point(Tilesets_35.TILE_SIZE * 2, Tilesets_35.TILE_SIZE)));
                    // Set up teleporter
                    e.addComponent(new Interactable_5.Interactable(interactablePos, function () { return wl.useTeleporter(destinationUUID); }, new point_64.Point(1, -Tilesets_35.TILE_SIZE * 1.4)));
                    return e.addComponent(new ElementComponent_8.ElementComponent(3 /* TENT */, pos, ElementUtils_3.ElementUtils.rectPoints(pos.plus(new point_64.Point(1, 1)), new point_64.Point(2, 1)), function () { return { destinationUUID: destinationUUID, color: color }; }));
                };
                return TentFactory;
            }(ElementFactory_7.ElementFactory));
            exports_110("TentFactory", TentFactory);
            addTile = function (e, s, pos, depth) {
                var tile = e.addComponent(new TileComponent_8.TileComponent(Tilesets_35.Tilesets.instance.outdoorTiles.getTileSource(s), new TileTransform_28.TileTransform(pos.times(Tilesets_35.TILE_SIZE))));
                tile.transform.depth = depth;
            };
        }
    };
});
System.register("game/world/elements/Tree", ["engine/point", "game/graphics/Tilesets", "engine/collision/BoxCollider", "engine/tiles/TileComponent", "engine/tiles/TileTransform", "engine/Entity", "game/world/elements/HittableResource", "game/world/elements/ElementComponent", "game/characters/weapons/WeaponType", "game/characters/Player", "game/world/elements/ElementFactory", "engine/component", "game/world/WorldTime", "game/world/TimeUnit", "game/world/LocationManager"], function (exports_111, context_111) {
    "use strict";
    var point_65, Tilesets_36, BoxCollider_8, TileComponent_9, TileTransform_29, Entity_28, HittableResource_2, ElementComponent_9, WeaponType_3, Player_13, ElementFactory_8, component_32, WorldTime_8, TimeUnit_6, LocationManager_19, NEXT_GROWTH_TIME, SIZE, AVAILABLE_RESOURCES, TreeFactory, GrowableTree;
    var __moduleName = context_111 && context_111.id;
    return {
        setters: [
            function (point_65_1) {
                point_65 = point_65_1;
            },
            function (Tilesets_36_1) {
                Tilesets_36 = Tilesets_36_1;
            },
            function (BoxCollider_8_1) {
                BoxCollider_8 = BoxCollider_8_1;
            },
            function (TileComponent_9_1) {
                TileComponent_9 = TileComponent_9_1;
            },
            function (TileTransform_29_1) {
                TileTransform_29 = TileTransform_29_1;
            },
            function (Entity_28_1) {
                Entity_28 = Entity_28_1;
            },
            function (HittableResource_2_1) {
                HittableResource_2 = HittableResource_2_1;
            },
            function (ElementComponent_9_1) {
                ElementComponent_9 = ElementComponent_9_1;
            },
            function (WeaponType_3_1) {
                WeaponType_3 = WeaponType_3_1;
            },
            function (Player_13_1) {
                Player_13 = Player_13_1;
            },
            function (ElementFactory_8_1) {
                ElementFactory_8 = ElementFactory_8_1;
            },
            function (component_32_1) {
                component_32 = component_32_1;
            },
            function (WorldTime_8_1) {
                WorldTime_8 = WorldTime_8_1;
            },
            function (TimeUnit_6_1) {
                TimeUnit_6 = TimeUnit_6_1;
            },
            function (LocationManager_19_1) {
                LocationManager_19 = LocationManager_19_1;
            }
        ],
        execute: function () {
            NEXT_GROWTH_TIME = "ngt";
            SIZE = "s"; // one of [1, 2, 3]
            AVAILABLE_RESOURCES = "a";
            TreeFactory = /** @class */ (function (_super) {
                __extends(TreeFactory, _super);
                function TreeFactory(type) {
                    var _this = _super.call(this) || this;
                    _this.dimensions = new point_65.Point(1, 2);
                    _this.type = type;
                    return _this;
                }
                TreeFactory.prototype.make = function (wl, pos, data) {
                    var _this = this;
                    var _a, _b, _c;
                    var maxResourcesCount = 4;
                    var nextGrowthTime = (_a = data[NEXT_GROWTH_TIME]) !== null && _a !== void 0 ? _a : this.nextGrowthTime();
                    var size = (_b = data[SIZE]) !== null && _b !== void 0 ? _b : 1;
                    var availableResources = (_c = data[AVAILABLE_RESOURCES]) !== null && _c !== void 0 ? _c : maxResourcesCount;
                    var e = new Entity_28.Entity();
                    var randomOffset = new point_65.Point(0, -4).randomlyShifted(2, 4);
                    var depth = (pos.y + 2) * Tilesets_36.TILE_SIZE + randomOffset.y;
                    var addTile = function (s, pos) {
                        var tile = e.addComponent(new TileComponent_9.TileComponent(Tilesets_36.Tilesets.instance.outdoorTiles.getTileSource(s), new TileTransform_29.TileTransform(pos.times(Tilesets_36.TILE_SIZE).plus(randomOffset))));
                        tile.transform.depth = depth;
                        return tile;
                    };
                    var prefix = this.type === 0 /* TREE_ROUND */ ? "treeRound" : "treePointy";
                    var tiles;
                    if (size === 3) {
                        tiles = [addTile(prefix + "Top", pos), addTile(prefix + "Base", pos.plus(new point_65.Point(0, 1)))];
                    }
                    else {
                        tiles = [addTile("" + prefix + ["Sapling", "Small"][size - 1], pos.plus(new point_65.Point(0, 1)))];
                    }
                    var hitboxDims = new point_65.Point(8, 3);
                    e.addComponent(new BoxCollider_8.BoxCollider(pos.plus(new point_65.Point(.5, 2)).times(Tilesets_36.TILE_SIZE).minus(new point_65.Point(hitboxDims.x / 2, hitboxDims.y)).plus(randomOffset), hitboxDims));
                    var saplingType = this.type === 0 /* TREE_ROUND */ ? 7 /* ROUND_SAPLING */ : 8 /* POINTY_SAPLING */;
                    var hittableCenter = pos.times(Tilesets_36.TILE_SIZE).plus(new point_65.Point(Tilesets_36.TILE_SIZE / 2, Tilesets_36.TILE_SIZE + Tilesets_36.TILE_SIZE / 2)).plus(randomOffset); // center of bottom tile
                    var hittableResource = e.addComponent(new HittableResource_2.HittableResource(hittableCenter, tiles.map(function (t) { return t.transform; }), availableResources, maxResourcesCount, function () {
                        if (size === 1 || (size === 2 && Math.random() > .5)) {
                            return [];
                        }
                        var getItem = function () { return Math.random() < .2 ? saplingType : 2 /* WOOD */; };
                        if (Player_13.Player.instance.dude.weaponType === WeaponType_3.WeaponType.AXE) {
                            return [getItem(), getItem()];
                        }
                        else {
                            return [getItem()];
                        }
                    }));
                    if (size < 3) {
                        e.addComponent(new GrowableTree(nextGrowthTime, function () {
                            var _a;
                            e.selfDestruct();
                            wl.addElement(_this.type, pos, (_a = {},
                                _a[NEXT_GROWTH_TIME] = _this.nextGrowthTime(),
                                _a[SIZE] = Math.min(size + 1, 3),
                                _a[AVAILABLE_RESOURCES] = hittableResource.freeResources,
                                _a));
                        }));
                    }
                    return e.addComponent(new ElementComponent_9.ElementComponent(this.type, pos, [pos.plusY(1)], function () {
                        var _a;
                        return _a = {},
                            _a[NEXT_GROWTH_TIME] = nextGrowthTime,
                            _a[SIZE] = size,
                            _a[AVAILABLE_RESOURCES] = hittableResource.freeResources,
                            _a;
                    }));
                };
                TreeFactory.prototype.canPlace = function (pos) {
                    return LocationManager_19.LocationManager.instance.currentLocation.ground.get(pos.plusY(1)).type === 2 /* GRASS */;
                };
                TreeFactory.prototype.nextGrowthTime = function () {
                    // grow every 24-48 hours
                    return WorldTime_8.WorldTime.instance.time + TimeUnit_6.TimeUnit.DAY * (1 + Math.random());
                };
                return TreeFactory;
            }(ElementFactory_8.ElementFactory));
            exports_111("TreeFactory", TreeFactory);
            GrowableTree = /** @class */ (function (_super) {
                __extends(GrowableTree, _super);
                function GrowableTree(nextGrowthTime, growFn) {
                    var _this = _super.call(this) || this;
                    _this.nextGrowthTime = nextGrowthTime;
                    _this.growFn = growFn;
                    return _this;
                }
                GrowableTree.prototype.lateUpdate = function () {
                    if (WorldTime_8.WorldTime.instance.time < this.nextGrowthTime) {
                        return;
                    }
                    this.growFn();
                };
                return GrowableTree;
            }(component_32.Component));
        }
    };
});
System.register("game/world/elements/Elements", ["game/world/Teleporter", "game/world/elements/Campfire", "game/world/elements/Chest", "game/world/elements/House", "game/world/elements/Mushroom", "game/world/elements/Rock", "game/world/elements/Tent", "game/world/elements/Tree"], function (exports_112, context_112) {
    "use strict";
    var Teleporter_2, Campfire_2, Chest_1, House_5, Mushroom_1, Rock_1, Tent_2, Tree_1, SavedElement, Elements;
    var __moduleName = context_112 && context_112.id;
    return {
        setters: [
            function (Teleporter_2_1) {
                Teleporter_2 = Teleporter_2_1;
            },
            function (Campfire_2_1) {
                Campfire_2 = Campfire_2_1;
            },
            function (Chest_1_1) {
                Chest_1 = Chest_1_1;
            },
            function (House_5_1) {
                House_5 = House_5_1;
            },
            function (Mushroom_1_1) {
                Mushroom_1 = Mushroom_1_1;
            },
            function (Rock_1_1) {
                Rock_1 = Rock_1_1;
            },
            function (Tent_2_1) {
                Tent_2 = Tent_2_1;
            },
            function (Tree_1_1) {
                Tree_1 = Tree_1_1;
            }
        ],
        execute: function () {
            SavedElement = /** @class */ (function () {
                function SavedElement() {
                }
                return SavedElement;
            }());
            exports_112("SavedElement", SavedElement);
            Elements = /** @class */ (function () {
                function Elements() {
                    var _a;
                    this.ELEMENT_FACTORIES = (_a = {},
                        _a[0 /* TREE_ROUND */] = new Tree_1.TreeFactory(0 /* TREE_ROUND */),
                        _a[1 /* TREE_POINTY */] = new Tree_1.TreeFactory(1 /* TREE_POINTY */),
                        _a[2 /* ROCK */] = new Rock_1.RockFactory(),
                        _a[3 /* TENT */] = new Tent_2.TentFactory(),
                        _a[4 /* CAMPFIRE */] = new Campfire_2.CampfireFactory(),
                        _a[5 /* TELEPORTER */] = new Teleporter_2.TeleporterFactory(),
                        _a[6 /* HOUSE */] = new House_5.HouseFactory(),
                        _a[7 /* MUSHROOM */] = new Mushroom_1.MushroomFactory(),
                        _a[8 /* CHEST */] = new Chest_1.ChestFactory(),
                        _a);
                    Elements._instance = this;
                }
                Object.defineProperty(Elements, "instance", {
                    get: function () {
                        if (!this._instance) {
                            this._instance = new Elements();
                        }
                        return this._instance;
                    },
                    enumerable: false,
                    configurable: true
                });
                Elements.prototype.getElementFactory = function (type) {
                    return this.ELEMENT_FACTORIES[type];
                };
                return Elements;
            }());
            exports_112("Elements", Elements);
        }
    };
});
System.register("game/world/MapGenerator", ["engine/point", "engine/util/Grid", "engine/util/Lists", "engine/util/Noise", "game/graphics/Tilesets", "game/world/LocationManager", "game/world/WorldLocation"], function (exports_113, context_113) {
    "use strict";
    var point_66, Grid_4, Lists_5, Noise_1, Tilesets_37, LocationManager_20, WorldLocation_3, MapGenerator;
    var __moduleName = context_113 && context_113.id;
    return {
        setters: [
            function (point_66_1) {
                point_66 = point_66_1;
            },
            function (Grid_4_1) {
                Grid_4 = Grid_4_1;
            },
            function (Lists_5_1) {
                Lists_5 = Lists_5_1;
            },
            function (Noise_1_1) {
                Noise_1 = Noise_1_1;
            },
            function (Tilesets_37_1) {
                Tilesets_37 = Tilesets_37_1;
            },
            function (LocationManager_20_1) {
                LocationManager_20 = LocationManager_20_1;
            },
            function (WorldLocation_3_1) {
                WorldLocation_3 = WorldLocation_3_1;
            }
        ],
        execute: function () {
            MapGenerator = /** @class */ (function () {
                function MapGenerator() {
                    this.location = LocationManager_20.LocationManager.instance.add(new WorldLocation_3.WorldLocation(false, true));
                    this.tentPos = new point_66.Point(-3, -3);
                    MapGenerator._instance = this;
                }
                Object.defineProperty(MapGenerator, "instance", {
                    get: function () {
                        if (!this._instance) {
                            this._instance = new MapGenerator();
                        }
                        return this._instance;
                    },
                    enumerable: false,
                    configurable: true
                });
                MapGenerator.prototype.generateExterior = function () {
                    // spawn tent
                    this.location.addElement(3 /* TENT */, this.tentPos, { color: "red" /* RED */ });
                    // make the ground
                    // this.renderPath(new Point(-10, -10), new Point(10, 10), 2)
                    // this.renderPath(new Point(10, -10), new Point(-10, 10), 5)
                    this.spawnTreesAtEdge();
                    this.spawnTrees();
                    this.spawnRocks();
                    this.clearPathToCenter();
                    // TODO short trees, bushes, fruit, tall grass, etc
                    // spawn grass last, stuff checks for existing paths prior to this by the lack of ground items
                    this.placeGrass();
                    return this.location;
                };
                MapGenerator.prototype.spawnTreesAtEdge = function () {
                    var _this = this;
                    var vignetteEdge = MapGenerator.MAP_SIZE / 2 - 1;
                    var denseStartEdge = vignetteEdge - 8;
                    var possibilities = [];
                    for (var x = -MapGenerator.MAP_SIZE / 2; x < MapGenerator.MAP_SIZE / 2; x++) {
                        for (var y = -MapGenerator.MAP_SIZE / 2; y < MapGenerator.MAP_SIZE / 2; y++) {
                            var distToCenter = new point_66.Point(x, y).distanceTo(point_66.Point.ZERO);
                            var pt = new point_66.Point(x, y);
                            if (distToCenter > vignetteEdge) {
                                possibilities.push(pt);
                            }
                            else if (distToCenter > denseStartEdge) {
                                var chance = (distToCenter - denseStartEdge) / (vignetteEdge - denseStartEdge);
                                if (Math.random() < chance) {
                                    possibilities.push(pt);
                                }
                            }
                        }
                    }
                    Lists_5.Lists.shuffle(possibilities);
                    possibilities.forEach(function (pt) { return _this.spawnTree(pt); });
                };
                MapGenerator.prototype.spawnTrees = function () {
                    var trees = Math.random() * 300 + 150;
                    for (var i = 0; i < trees; i++) {
                        var pt = new point_66.Point(Math.floor(Math.random() * MapGenerator.MAP_SIZE) - MapGenerator.MAP_SIZE / 2, Math.floor(Math.random() * (MapGenerator.MAP_SIZE - 1)) - MapGenerator.MAP_SIZE / 2);
                        this.spawnTree(pt);
                    }
                };
                MapGenerator.prototype.spawnTree = function (pt) {
                    this.location.addElement(Math.random() < .7 ? 1 /* TREE_POINTY */ : 0 /* TREE_ROUND */, pt, { s: 3 } // make adult trees
                    );
                };
                MapGenerator.prototype.clearPathToCenter = function () {
                    var typesToClear = [2 /* ROCK */, 1 /* TREE_POINTY */, 0 /* TREE_ROUND */];
                    // clear in corner
                    for (var x = MapGenerator.MAP_SIZE / 2 - 11; x < MapGenerator.MAP_SIZE / 2 + 10; x++) {
                        for (var y = MapGenerator.MAP_SIZE / 2 - 25; y < MapGenerator.MAP_SIZE / 2 - 23; y++) {
                            var element = this.location.getElement(new point_66.Point(x, y));
                            if (!!element && typesToClear.indexOf(element.type) !== -1) {
                                this.location.removeElement(element);
                            }
                        }
                    }
                    // clear around tent
                    var clearingCorner = this.tentPos.minus(new point_66.Point(1, 0));
                    for (var x = 0; x < 6; x++) {
                        for (var y = 0; y < 4; y++) {
                            var element = this.location.getElement(clearingCorner.plus(new point_66.Point(x, y)));
                            if (!!element && typesToClear.indexOf(element.type) !== -1) {
                                this.location.removeElement(element);
                            }
                        }
                    }
                };
                MapGenerator.prototype.spawnRocks = function () {
                    var placedRocks = 0;
                    while (placedRocks < 20) {
                        var p = new point_66.Point(Math.floor(Math.random() * MapGenerator.MAP_SIZE) - MapGenerator.MAP_SIZE / 2, Math.floor(Math.random() * (MapGenerator.MAP_SIZE)) - MapGenerator.MAP_SIZE / 2);
                        if (!this.location.ground.get(p) && this.location.addElement(2 /* ROCK */, p)) {
                            placedRocks++;
                        }
                    }
                };
                // renderPath(
                //     start: Point, 
                //     end: Point, 
                //     randomness: number
                // ) {
                //     const ground = this.location.ground
                //     const stuff = this.location.elements
                //     const heuristic = (pt: Point): number => {
                //         const v = pt.manhattanDistanceTo(end) * Math.random() * randomness
                //         const el = ground.get(pt)
                //         if (!el) {
                //             return v
                //         }
                //         const ct = el.entity.getComponent(ConnectingTile)
                //         if (!ct || !ct.schema.canConnect(Ground.instance.PATH_CONNECTING_SCHEMA)) {
                //             return v
                //         }
                //         const reuseCostMultiplier = 1/10
                //         return v * reuseCostMultiplier
                //     }
                //     const isOccupiedFunc = (pt: Point) => {
                //         if (!!stuff.get(pt)?.entity.getComponent(BoxCollider)) {
                //             return true
                //         }
                //         const el = ground.get(pt)
                //         if (!el) {
                //             return false  // definitely not occupied
                //         }
                //         const ct = el.entity.getComponent(ConnectingTile)
                //         if (!ct) {
                //             return true  // can't connect, therefore occupied
                //         }
                //         return !Ground.instance.PATH_CONNECTING_SCHEMA.canConnect(ct.schema)
                //     }
                //     const path = ground.findPath(
                //         start, 
                //         end, 
                //         { 
                //             heuristic: heuristic,  
                //             isOccupied: isOccupiedFunc
                //         }
                //     )
                //     if (!path) {
                //         return
                //     }
                //     path.forEach(pt => this.location.addGroundElement(GroundType.PATH, pt))
                // }
                MapGenerator.prototype.placeGrass = function () {
                    // const levels = this.noise()
                    for (var i = -MapGenerator.MAP_SIZE / 2; i < MapGenerator.MAP_SIZE / 2; i++) {
                        for (var j = -MapGenerator.MAP_SIZE / 2; j < MapGenerator.MAP_SIZE / 2; j++) {
                            var pt = new point_66.Point(i, j);
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
                            value = (value + 1) / 2; // scale to 0-1
                            var v = (Math.floor(9 * value));
                            str += v;
                            grid.set(new point_66.Point(j, i), v);
                        }
                        str += "\n";
                    }
                    console.log(str);
                    return grid;
                };
                MapGenerator.MAP_SIZE = 70;
                MapGenerator.ENTER_LAND_POS = new point_66.Point(1, 1).times(MapGenerator.MAP_SIZE / 2 * Tilesets_37.TILE_SIZE).plusY(-Tilesets_37.TILE_SIZE * 25).plusX(Tilesets_37.TILE_SIZE * 2);
                return MapGenerator;
            }());
            exports_113("MapGenerator", MapGenerator);
        }
    };
});
System.register("game/cutscenes/Camera", ["engine/point", "game/world/MapGenerator", "game/graphics/Tilesets"], function (exports_114, context_114) {
    "use strict";
    var point_67, MapGenerator_5, Tilesets_38, Camera;
    var __moduleName = context_114 && context_114.id;
    return {
        setters: [
            function (point_67_1) {
                point_67 = point_67_1;
            },
            function (MapGenerator_5_1) {
                MapGenerator_5 = MapGenerator_5_1;
            },
            function (Tilesets_38_1) {
                Tilesets_38 = Tilesets_38_1;
            }
        ],
        execute: function () {
            Camera = /** @class */ (function () {
                function Camera() {
                    this.shakeOffset = point_67.Point.ZERO;
                    Camera._instance = this;
                }
                Object.defineProperty(Camera, "instance", {
                    get: function () {
                        if (!this._instance) {
                            this._instance = new Camera();
                        }
                        return this._instance;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Camera.prototype, "position", {
                    get: function () {
                        // multiply by -1 because views use "offset"
                        return this._position.times(-1).minus(this.shakeOffset);
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Camera.prototype, "dimensions", {
                    get: function () { return this._dimensions; },
                    enumerable: false,
                    configurable: true
                });
                Camera.prototype.shake = function (power, duration) {
                    this.shakePower = power;
                    this.shakeDuration = duration;
                };
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
                    var xLimit = MapGenerator_5.MapGenerator.MAP_SIZE / 2 * Tilesets_38.TILE_SIZE - dimensions.x / 2;
                    var yLimit = MapGenerator_5.MapGenerator.MAP_SIZE / 2 * Tilesets_38.TILE_SIZE - dimensions.y / 2;
                    var trackedPoint = (_b = (_a = this.dudeTarget) === null || _a === void 0 ? void 0 : _a.position) !== null && _b !== void 0 ? _b : this.pointTarget;
                    var clampedTrackedPoint = new point_67.Point(this.clamp(trackedPoint.x, -xLimit, xLimit), this.clamp(trackedPoint.y, -yLimit, yLimit));
                    var cameraGoal = dimensions.div(2).minus(clampedTrackedPoint);
                    if (!this._position) {
                        this._position = cameraGoal;
                    }
                    else {
                        this._position = this._position.lerp(.0018 * elapsedTimeMillis, cameraGoal);
                    }
                    if (this.shakeDuration > 0) {
                        this.shakePower *= (1 - elapsedTimeMillis / this.shakeDuration);
                        this.shakeDuration -= elapsedTimeMillis;
                        this.shakeOffset = new point_67.Point(Math.random() - .5, Math.random() - .5).times(this.shakePower);
                    }
                    return this._position.plus(this.shakeOffset);
                };
                Camera.prototype.clamp = function (val, min, max) {
                    return Math.min(Math.max(val, min), max);
                };
                return Camera;
            }());
            exports_114("Camera", Camera);
        }
    };
});
System.register("game/world/TownStats", ["game/SaveManager"], function (exports_115, context_115) {
    "use strict";
    var SaveManager_6, TownStat, TownStats;
    var __moduleName = context_115 && context_115.id;
    return {
        setters: [
            function (SaveManager_6_1) {
                SaveManager_6 = SaveManager_6_1;
            }
        ],
        execute: function () {
            TownStat = /** @class */ (function () {
                function TownStat(id) {
                    this.id = id;
                }
                TownStat.prototype.adjust = function (adjustment) {
                    var _a;
                    var existingStats = SaveManager_6.saveManager.getState().townStats || {};
                    var currentValue = existingStats[this.id] || 0;
                    SaveManager_6.saveManager.setState({
                        townStats: __assign(__assign({}, existingStats), (_a = {}, _a[this.id] = currentValue + adjustment, _a))
                    });
                    console.log("new stat value for " + this.id + ": " + SaveManager_6.saveManager.getState().townStats[this.id]);
                };
                return TownStat;
            }());
            TownStats = /** @class */ (function () {
                function TownStats() {
                    /**
                     * TODO: Determine additional stats. Ideas:
                     *   - relationships with other nations such as centaurs and gnolls
                     *   - safety/strength of your military for sending them out (protecting villagers in the forest)
                     *   - black magic (converse to theocracy)
                     */
                    this.happiness = new TownStat("happiness");
                    this.theocracy = new TownStat("theocracy");
                }
                Object.defineProperty(TownStats, "instance", {
                    get: function () {
                        if (!this._instance) {
                            this._instance = new TownStats();
                        }
                        return this._instance;
                    },
                    enumerable: false,
                    configurable: true
                });
                return TownStats;
            }());
            exports_115("TownStats", TownStats);
        }
    };
});
System.register("game/characters/Player", ["engine/component", "engine/debug", "engine/point", "engine/util/Lists", "game/Controls", "game/cutscenes/Camera", "game/graphics/Tilesets", "game/ui/NotificationDisplay", "game/ui/UIStateManager", "game/world/elements/Interactable", "game/world/LocationManager", "game/characters/Dude", "game/characters/DudeFactory"], function (exports_116, context_116) {
    "use strict";
    var component_33, debug_3, point_68, Lists_6, Controls_7, Camera_11, Tilesets_39, NotificationDisplay_3, UIStateManager_18, Interactable_6, LocationManager_21, Dude_2, DudeFactory_4, Player;
    var __moduleName = context_116 && context_116.id;
    return {
        setters: [
            function (component_33_1) {
                component_33 = component_33_1;
            },
            function (debug_3_1) {
                debug_3 = debug_3_1;
            },
            function (point_68_1) {
                point_68 = point_68_1;
            },
            function (Lists_6_1) {
                Lists_6 = Lists_6_1;
            },
            function (Controls_7_1) {
                Controls_7 = Controls_7_1;
            },
            function (Camera_11_1) {
                Camera_11 = Camera_11_1;
            },
            function (Tilesets_39_1) {
                Tilesets_39 = Tilesets_39_1;
            },
            function (NotificationDisplay_3_1) {
                NotificationDisplay_3 = NotificationDisplay_3_1;
            },
            function (UIStateManager_18_1) {
                UIStateManager_18 = UIStateManager_18_1;
            },
            function (Interactable_6_1) {
                Interactable_6 = Interactable_6_1;
            },
            function (LocationManager_21_1) {
                LocationManager_21 = LocationManager_21_1;
            },
            function (Dude_2_1) {
                Dude_2 = Dude_2_1;
            },
            function (DudeFactory_4_1) {
                DudeFactory_4 = DudeFactory_4_1;
            }
        ],
        execute: function () {
            Player = /** @class */ (function (_super) {
                __extends(Player, _super);
                function Player() {
                    var _this = _super.call(this) || this;
                    _this.lerpedLastMoveDir = new point_68.Point(1, 0); // used for crosshair
                    Player.instance = _this;
                    return _this;
                }
                Object.defineProperty(Player.prototype, "dude", {
                    get: function () { return this._dude; },
                    enumerable: false,
                    configurable: true
                });
                Player.prototype.start = function (startData) {
                    var _this = this;
                    this._dude = this.entity.getComponent(Dude_2.Dude);
                    this.dude.setOnDamageCallback(function (blocked) {
                        if (!_this.dude.isAlive) {
                            Camera_11.Camera.instance.shake(6, 600);
                        }
                        else if (blocked) {
                            Camera_11.Camera.instance.shake(2.5, 400);
                        }
                        else {
                            Camera_11.Camera.instance.shake(3.5, 400);
                        }
                    });
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
                    if (!UIStateManager_18.UIStateManager.instance.isMenuOpen) {
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
                    this.dude.move(updateData, new point_68.Point(dx, dy), this.dude.rolling() ? 0 : updateData.input.mousePos.x - this.dude.standingPosition.x, 1 + (this.dude.rolling() ? 1.2 : 0));
                    // PointLightMaskRenderer.instance.addLight(LocationManager.instance.currentLocation, this.dude.standingPosition.plusY(lightPosOffset), 100)
                    if (UIStateManager_18.UIStateManager.instance.isMenuOpen) {
                        return;
                    }
                    var rollingBackwards = (dx > 0 && updateData.input.mousePos.x < this.dude.standingPosition.x)
                        || (dx < 0 && updateData.input.mousePos.x > this.dude.standingPosition.x);
                    if (updateData.input.isKeyDown(32 /* SPACE */)
                        && (dx !== 0 || dy !== 0)
                        && !rollingBackwards) {
                        this.dude.roll();
                    }
                    if (updateData.input.isKeyDown(70 /* F */)) {
                        this.dude.weapon.toggleSheathed();
                        this.dude.shield.toggleOnBack();
                    }
                    if (!!this.dude.shield) {
                        this.dude.shield.block(updateData.input.isRightMouseHeld);
                    }
                    if (updateData.input.isMouseHeld) {
                        this.dude.weapon.attack(updateData.input.isMouseDown);
                    }
                    else {
                        this.dude.weapon.cancelAttack();
                    }
                    if (updateData.input.isKeyDown(Controls_7.Controls.interactButton) && !!possibleInteractable) {
                        possibleInteractable.interact();
                    }
                    // Commands which are used for testing and development
                    if (debug_3.debug.enableDevControls) {
                        var mouseTilePos = Tilesets_39.pixelPtToTilePt(updateData.input.mousePos);
                        if (updateData.input.isKeyDown(75 /* K */)) {
                            DudeFactory_4.DudeFactory.instance.new(3 /* ORC_WARRIOR */, updateData.input.mousePos);
                        }
                        if (updateData.input.isKeyDown(76 /* L */)) {
                            DudeFactory_4.DudeFactory.instance.new(5 /* HORNED_DEMON */, updateData.input.mousePos);
                        }
                        if (updateData.input.isKeyDown(186 /* SEMICOLON */)) {
                            DudeFactory_4.DudeFactory.instance.new(3 /* ORC_WARRIOR */, updateData.input.mousePos);
                        }
                        if (updateData.input.isKeyDown(222 /* QUOTE */)) {
                            NotificationDisplay_3.NotificationDisplay.instance.push({
                                text: "ORC ATTACK!",
                                icon: "sword",
                            });
                        }
                        if (updateData.input.isKeyDown(188 /* COMMA */)) {
                            LocationManager_21.LocationManager.instance.currentLocation.addElement(8 /* CHEST */, mouseTilePos);
                        }
                        if (updateData.input.isKeyDown(190 /* PERIOD */)) {
                            LocationManager_21.LocationManager.instance.currentLocation.removeElementAt(mouseTilePos);
                        }
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
                    var interactCenter = this.dude.standingPosition.minus(new point_68.Point(0, 7));
                    var interactables = updateData.view.entities
                        .map(function (e) { return e.getComponent(Interactable_6.Interactable); })
                        .filter(function (e) { return e === null || e === void 0 ? void 0 : e.enabled; });
                    interactables.forEach(function (i) { return i.updateIndicator(false); });
                    var possibilities = interactables
                        .filter(function (e) { return _this.dude.isFacing(e.position); }) // interactables the dude is facing
                        .filter(function (e) { return e.position.distanceTo(interactCenter) < interactDistance; })
                        .filter(function (e) { return e.isInteractable(); });
                    var i = Lists_6.Lists.minBy(possibilities, function (e) { return e.position.distanceTo(interactCenter); });
                    if (!!i) {
                        i.updateIndicator(true);
                    }
                    return i;
                };
                return Player;
            }(component_33.Component));
            exports_116("Player", Player);
        }
    };
});
System.register("game/characters/Enemy", ["engine/component", "game/graphics/Tilesets", "game/world/OutdoorDarknessMask", "game/characters/Dude", "game/characters/NPC"], function (exports_117, context_117) {
    "use strict";
    var component_34, Tilesets_40, OutdoorDarknessMask_3, Dude_3, NPC_3, Enemy;
    var __moduleName = context_117 && context_117.id;
    return {
        setters: [
            function (component_34_1) {
                component_34 = component_34_1;
            },
            function (Tilesets_40_1) {
                Tilesets_40 = Tilesets_40_1;
            },
            function (OutdoorDarknessMask_3_1) {
                OutdoorDarknessMask_3 = OutdoorDarknessMask_3_1;
            },
            function (Dude_3_1) {
                Dude_3 = Dude_3_1;
            },
            function (NPC_3_1) {
                NPC_3 = NPC_3_1;
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
                    this.dude = this.entity.getComponent(Dude_3.Dude);
                    this.npc = this.entity.getComponent(NPC_3.NPC);
                    if (this.dude.factions.includes(1 /* ORCS */)) {
                        // Orcs only show up to siege, so they will find you wherever you're hiding
                        this.npc.findTargetRange = Number.MAX_SAFE_INTEGER;
                    }
                    // DEMON enemies will avoid light
                    // TODO: make them burn in the light or something?
                    // TODO: Consider splitting this class up 
                    if (this.dude.factions.includes(3 /* DEMONS */)) {
                        this.npc.isEnemyFn = function (d) {
                            return !d.factions.includes(3 /* DEMONS */) && OutdoorDarknessMask_3.OutdoorDarknessMask.instance.isDark(d.standingPosition);
                        };
                        this.npc.pathFindingHeuristic = function (pt, goal) {
                            return pt.distanceTo(goal) + (OutdoorDarknessMask_3.OutdoorDarknessMask.instance.isDark(pt.times(Tilesets_40.TILE_SIZE)) ? 0 : 100);
                        };
                        this.npc.findTargetRange *= 3;
                    }
                    else {
                        this.npc.isEnemyFn = function (d) { return d.isEnemy(_this.dude); };
                    }
                };
                Enemy.prototype.update = function () {
                    if (this.dude.weapon) {
                        this.dude.weapon.setDelayBetweenAttacks(500);
                    }
                };
                return Enemy;
            }(component_34.Component));
            exports_117("Enemy", Enemy);
        }
    };
});
System.register("game/cutscenes/CutscenePlayerController", ["engine/component", "game/characters/Player", "game/characters/Dude", "engine/point"], function (exports_118, context_118) {
    "use strict";
    var component_35, Player_14, Dude_4, point_69, CutscenePlayerController;
    var __moduleName = context_118 && context_118.id;
    return {
        setters: [
            function (component_35_1) {
                component_35 = component_35_1;
            },
            function (Player_14_1) {
                Player_14 = Player_14_1;
            },
            function (Dude_4_1) {
                Dude_4 = Dude_4_1;
            },
            function (point_69_1) {
                point_69 = point_69_1;
            }
        ],
        execute: function () {
            CutscenePlayerController = /** @class */ (function (_super) {
                __extends(CutscenePlayerController, _super);
                function CutscenePlayerController() {
                    var _this = _super.call(this) || this;
                    _this.moveDir = point_69.Point.ZERO;
                    CutscenePlayerController.instance = _this;
                    _this.enabled = false;
                    return _this;
                }
                CutscenePlayerController.prototype.start = function () {
                    this._dude = this.entity.getComponent(Dude_4.Dude);
                };
                CutscenePlayerController.prototype.update = function (updateData) {
                    this._dude.move(updateData, this.moveDir);
                };
                CutscenePlayerController.prototype.startMoving = function (moveDir) {
                    this.moveDir = moveDir;
                };
                CutscenePlayerController.prototype.stopMoving = function () {
                    this.moveDir = point_69.Point.ZERO;
                };
                CutscenePlayerController.prototype.enable = function () {
                    this.enabled = true;
                    Player_14.Player.instance.enabled = false;
                };
                CutscenePlayerController.prototype.disable = function () {
                    this.enabled = false;
                    Player_14.Player.instance.enabled = true;
                };
                return CutscenePlayerController;
            }(component_35.Component));
            exports_118("CutscenePlayerController", CutscenePlayerController);
        }
    };
});
System.register("game/characters/ShroomNPC", ["engine/component", "game/graphics/Tilesets", "game/world/LocationManager", "game/world/TimeUnit", "game/world/WorldTime", "game/characters/Dude", "game/characters/DudeFactory", "game/characters/Enemy", "game/characters/weapons/WeaponType"], function (exports_119, context_119) {
    "use strict";
    var component_36, Tilesets_41, LocationManager_22, TimeUnit_7, WorldTime_9, Dude_5, DudeFactory_5, Enemy_1, WeaponType_4, SIZE, NEXT_GROWTH_TIME, ShroomNPC;
    var __moduleName = context_119 && context_119.id;
    return {
        setters: [
            function (component_36_1) {
                component_36 = component_36_1;
            },
            function (Tilesets_41_1) {
                Tilesets_41 = Tilesets_41_1;
            },
            function (LocationManager_22_1) {
                LocationManager_22 = LocationManager_22_1;
            },
            function (TimeUnit_7_1) {
                TimeUnit_7 = TimeUnit_7_1;
            },
            function (WorldTime_9_1) {
                WorldTime_9 = WorldTime_9_1;
            },
            function (Dude_5_1) {
                Dude_5 = Dude_5_1;
            },
            function (DudeFactory_5_1) {
                DudeFactory_5 = DudeFactory_5_1;
            },
            function (Enemy_1_1) {
                Enemy_1 = Enemy_1_1;
            },
            function (WeaponType_4_1) {
                WeaponType_4 = WeaponType_4_1;
            }
        ],
        execute: function () {
            SIZE = "s"; // one of [1, 2, 3]
            NEXT_GROWTH_TIME = "ngt";
            ShroomNPC = /** @class */ (function (_super) {
                __extends(ShroomNPC, _super);
                function ShroomNPC() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                ShroomNPC.prototype.awake = function () {
                    var _this = this;
                    this.dude = this.entity.getComponent(Dude_5.Dude);
                    this.dude.droppedItemSupplier = function () { return 9 /* MUSHROOM */; };
                    this.dude.blob[SIZE] = this.dude.blob[SIZE] || 1;
                    this.dude.blob[NEXT_GROWTH_TIME] = this.dude.blob[NEXT_GROWTH_TIME] || this.nextGrowthTime();
                    if (this.dude.blob[SIZE] == 3) {
                        this.dude.setWeapon(WeaponType_4.WeaponType.UNARMED);
                        this.enemy = this.entity.addComponent(new Enemy_1.Enemy());
                    }
                    // medium shrooms go aggro if hit, lil guys flee
                    this.dude.setOnDamageCallback(function () {
                        // NPC will flee until it has a non-NONE weapon
                        if (_this.dude.blob[SIZE] == 2 && !_this.dude.weapon) {
                            _this.dude.setWeapon(WeaponType_4.WeaponType.UNARMED);
                        }
                        // Adding enemy component will cause them to flee or engage in combat
                        if (!_this.enemy) {
                            _this.enemy = _this.entity.addComponent(new Enemy_1.Enemy());
                        }
                    });
                };
                ShroomNPC.prototype.lateUpdate = function (data) {
                    if (WorldTime_9.WorldTime.instance.time < this.dude.blob[NEXT_GROWTH_TIME]) {
                        return;
                    }
                    var ogSize = this.dude.blob[SIZE];
                    this.dude.blob[NEXT_GROWTH_TIME] = this.nextGrowthTime();
                    if (ogSize === 3 || Math.random() > 0.5) {
                        // spread more shrooms
                        var tilePos = Tilesets_41.pixelPtToTilePt(this.dude.standingPosition);
                        var plantedShroom = LocationManager_22.LocationManager.instance.exterior().addElement(7 /* MUSHROOM */, tilePos);
                        if (!!plantedShroom) {
                            // successfully planted
                            return;
                        }
                    }
                    // grow
                    var newSize = ogSize + 1;
                    this.dude.blob[SIZE] = newSize;
                    // overwrite the animation
                    var newData = this.dude.save();
                    newData.anim = ["SmallMushroom", "NormalMushroom", "LargeMushroom",][newSize - 1];
                    // delete and respawn the shroom dude
                    this.entity.selfDestruct();
                    DudeFactory_5.DudeFactory.instance.load(newData, LocationManager_22.LocationManager.instance.exterior());
                };
                ShroomNPC.prototype.isAggro = function () {
                    return !!this.enemy && this.dude.blob[SIZE] > 1;
                };
                ShroomNPC.prototype.nextGrowthTime = function () {
                    // grow every 12-24 hours
                    return WorldTime_9.WorldTime.instance.time + TimeUnit_7.TimeUnit.DAY * (0.5 + Math.random() / 2);
                };
                return ShroomNPC;
            }(component_36.Component));
            exports_119("ShroomNPC", ShroomNPC);
        }
    };
});
System.register("game/characters/Centaur", ["engine/component", "game/characters/dialogues/GenericDialogue", "game/characters/Dude", "game/characters/NPC"], function (exports_120, context_120) {
    "use strict";
    var component_37, GenericDialogue_2, Dude_6, NPC_4, Centaur;
    var __moduleName = context_120 && context_120.id;
    return {
        setters: [
            function (component_37_1) {
                component_37 = component_37_1;
            },
            function (GenericDialogue_2_1) {
                GenericDialogue_2 = GenericDialogue_2_1;
            },
            function (Dude_6_1) {
                Dude_6 = Dude_6_1;
            },
            function (NPC_4_1) {
                NPC_4 = NPC_4_1;
            }
        ],
        execute: function () {
            Centaur = /** @class */ (function (_super) {
                __extends(Centaur, _super);
                function Centaur() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Centaur.prototype.awake = function () {
                    this.npc = this.entity.getComponent(NPC_4.NPC);
                    this.dude = this.entity.getComponent(Dude_6.Dude);
                    this.dude.dialogue = GenericDialogue_2.GenericDialogue.HELLO;
                    this.npc.isEnemyFn = function (d) {
                        // TODO: Make centaurs potential enemies
                        return !d.factions.includes(5 /* CENTAURS */)
                            && !d.factions.includes(0 /* VILLAGERS */);
                    };
                };
                Centaur.prototype.isAggro = function () {
                    // TODO: Make centaurs potential enemies
                    return false;
                };
                return Centaur;
            }(component_37.Component));
            exports_120("Centaur", Centaur);
        }
    };
});
System.register("game/characters/Villager", ["engine/component", "game/characters/Dude", "game/characters/NPC", "game/world/OutdoorDarknessMask", "game/characters/ShroomNPC", "game/characters/Centaur"], function (exports_121, context_121) {
    "use strict";
    var component_38, Dude_7, NPC_5, OutdoorDarknessMask_4, ShroomNPC_1, Centaur_1, Villager;
    var __moduleName = context_121 && context_121.id;
    return {
        setters: [
            function (component_38_1) {
                component_38 = component_38_1;
            },
            function (Dude_7_1) {
                Dude_7 = Dude_7_1;
            },
            function (NPC_5_1) {
                NPC_5 = NPC_5_1;
            },
            function (OutdoorDarknessMask_4_1) {
                OutdoorDarknessMask_4 = OutdoorDarknessMask_4_1;
            },
            function (ShroomNPC_1_1) {
                ShroomNPC_1 = ShroomNPC_1_1;
            },
            function (Centaur_1_1) {
                Centaur_1 = Centaur_1_1;
            }
        ],
        execute: function () {
            Villager = /** @class */ (function (_super) {
                __extends(Villager, _super);
                function Villager() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Villager.prototype.awake = function () {
                    var _this = this;
                    this.npc = this.entity.getComponent(NPC_5.NPC);
                    this.dude = this.entity.getComponent(Dude_7.Dude);
                    this.npc.isEnemyFn = function (d) {
                        // Villagers will only flee from demons if the villager is in the dark or really close to the demon
                        if (d.factions.includes(3 /* DEMONS */)) {
                            return OutdoorDarknessMask_4.OutdoorDarknessMask.instance.isDark(_this.dude.standingPosition)
                                || d.standingPosition.distanceTo(_this.dude.standingPosition) < 30;
                        }
                        // Villagers only flee from shrooms if the shroom is aggro
                        if (d.factions.includes(4 /* SHROOMS */)) {
                            return d.entity.getComponent(ShroomNPC_1.ShroomNPC).isAggro();
                        }
                        // Villagers only flee from centaurs if the centaur is aggro
                        if (d.factions.includes(5 /* CENTAURS */)) {
                            return d.entity.getComponent(Centaur_1.Centaur).isAggro();
                        }
                        return !d.factions.includes(0 /* VILLAGERS */);
                    };
                };
                return Villager;
            }(component_38.Component));
            exports_121("Villager", Villager);
        }
    };
});
System.register("game/characters/DudeFactory", ["engine/Entity", "engine/point", "game/characters/Player", "game/characters/Dude", "game/characters/NPC", "game/world/LocationManager", "game/characters/Enemy", "game/items/Inventory", "game/characters/Dialogue", "game/cutscenes/CutscenePlayerController", "game/characters/Villager", "game/characters/NPCSchedule", "engine/util/Lists", "game/characters/weapons/WeaponType", "game/characters/dialogues/BertoIntro", "game/characters/ShroomNPC", "game/saves/uuid", "game/characters/Centaur"], function (exports_122, context_122) {
    "use strict";
    var Entity_29, point_70, Player_15, Dude_8, NPC_6, LocationManager_23, Enemy_2, Inventory_3, Dialogue_6, CutscenePlayerController_1, Villager_1, NPCSchedule_3, Lists_7, WeaponType_5, BertoIntro_2, ShroomNPC_2, uuid_2, Centaur_2, DudeFactory;
    var __moduleName = context_122 && context_122.id;
    return {
        setters: [
            function (Entity_29_1) {
                Entity_29 = Entity_29_1;
            },
            function (point_70_1) {
                point_70 = point_70_1;
            },
            function (Player_15_1) {
                Player_15 = Player_15_1;
            },
            function (Dude_8_1) {
                Dude_8 = Dude_8_1;
            },
            function (NPC_6_1) {
                NPC_6 = NPC_6_1;
            },
            function (LocationManager_23_1) {
                LocationManager_23 = LocationManager_23_1;
            },
            function (Enemy_2_1) {
                Enemy_2 = Enemy_2_1;
            },
            function (Inventory_3_1) {
                Inventory_3 = Inventory_3_1;
            },
            function (Dialogue_6_1) {
                Dialogue_6 = Dialogue_6_1;
            },
            function (CutscenePlayerController_1_1) {
                CutscenePlayerController_1 = CutscenePlayerController_1_1;
            },
            function (Villager_1_1) {
                Villager_1 = Villager_1_1;
            },
            function (NPCSchedule_3_1) {
                NPCSchedule_3 = NPCSchedule_3_1;
            },
            function (Lists_7_1) {
                Lists_7 = Lists_7_1;
            },
            function (WeaponType_5_1) {
                WeaponType_5 = WeaponType_5_1;
            },
            function (BertoIntro_2_1) {
                BertoIntro_2 = BertoIntro_2_1;
            },
            function (ShroomNPC_2_1) {
                ShroomNPC_2 = ShroomNPC_2_1;
            },
            function (uuid_2_1) {
                uuid_2 = uuid_2_1;
            },
            function (Centaur_2_1) {
                Centaur_2 = Centaur_2_1;
            }
        ],
        execute: function () {
            DudeFactory = /** @class */ (function () {
                function DudeFactory() {
                    DudeFactory._instance = this;
                }
                Object.defineProperty(DudeFactory, "instance", {
                    get: function () {
                        if (!this._instance) {
                            this._instance = new DudeFactory();
                        }
                        return this._instance;
                    },
                    enumerable: false,
                    configurable: true
                });
                /**
                 * Create a new Dude in the specified location, defaults to the exterior world location
                 */
                DudeFactory.prototype.new = function (type, pos, location) {
                    if (location === void 0) { location = LocationManager_23.LocationManager.instance.exterior(); }
                    return this.make(type, pos, null, location);
                };
                /**
                 * Instantiates a Dude+Entity in the specified location
                 */
                DudeFactory.prototype.load = function (saveState, location) {
                    this.make(saveState.type, point_70.Point.fromString(saveState.pos), saveState, location);
                };
                DudeFactory.prototype.make = function (type, pos, saveState, location) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                    // defaults
                    var factions = [0 /* VILLAGERS */];
                    var animationName;
                    var weapon = WeaponType_5.WeaponType.NONE;
                    var shield = null;
                    var maxHealth;
                    var speed = 0.085;
                    var dialogue = Dialogue_6.EMPTY_DIALOGUE;
                    var additionalComponents = [];
                    var blob = {};
                    var defaultInventory = new Inventory_3.Inventory();
                    // type-specific defaults
                    switch (type) {
                        case 0 /* PLAYER */: {
                            animationName = "knight_f";
                            weapon = WeaponType_5.WeaponType.SWORD;
                            shield = "shield_0";
                            maxHealth = 4;
                            additionalComponents = [new Player_15.Player(), new CutscenePlayerController_1.CutscenePlayerController()];
                            window["player"] = additionalComponents[0];
                            defaultInventory.addItem(100003 /* SWORD */);
                            break;
                        }
                        case 1 /* DIP */: {
                            animationName = "lizard_f";
                            maxHealth = Number.MAX_SAFE_INTEGER;
                            speed *= .7;
                            additionalComponents = [
                                new NPC_6.NPC(NPCSchedule_3.NPCSchedules.newGoToSchedule(new point_70.Point(0, 0))),
                                new Villager_1.Villager()
                            ];
                            window["dip"] = additionalComponents[0];
                            break;
                        }
                        case 4 /* HERALD */: {
                            animationName = "Herald";
                            maxHealth = Number.MAX_SAFE_INTEGER;
                            speed *= .6;
                            dialogue = BertoIntro_2.BERTO_STARTING_DIALOGUE;
                            additionalComponents = [
                                new NPC_6.NPC(NPCSchedule_3.NPCSchedules.newGoToSchedule(// filter out occupied points to not get stuck in the campfire
                                Lists_7.Lists.oneOf([new point_70.Point(-3, 0), new point_70.Point(-3, 1), new point_70.Point(-2, 0), new point_70.Point(-2, 1)].filter(function (pt) { return !location.isOccupied(pt); })))),
                                new Villager_1.Villager()
                            ];
                            window["berto"] = additionalComponents[0];
                            break;
                        }
                        case 2 /* ELF */: {
                            animationName = "elf_m";
                            weapon = WeaponType_5.WeaponType.KATANA;
                            shield = "shield_0";
                            maxHealth = 4;
                            additionalComponents = [new NPC_6.NPC(), new Villager_1.Villager()];
                            speed *= (.3 + Math.random() / 2);
                            break;
                        }
                        case 3 /* ORC_WARRIOR */: {
                            factions = [1 /* ORCS */];
                            animationName = "orc_warrior";
                            weapon = WeaponType_5.WeaponType.CLUB;
                            additionalComponents = [new NPC_6.NPC(), new Enemy_2.Enemy()];
                            maxHealth = 2;
                            speed *= (.3 + Math.random() / 2);
                            break;
                        }
                        case 5 /* HORNED_DEMON */: {
                            factions = [3 /* DEMONS */];
                            animationName = "chort";
                            weapon = WeaponType_5.WeaponType.UNARMED;
                            additionalComponents = [new NPC_6.NPC(NPCSchedule_3.NPCSchedules.newFreeRoamInDarkSchedule()), new Enemy_2.Enemy()];
                            maxHealth = 2;
                            speed *= (.6 + Math.random() / 5);
                            break;
                        }
                        case 6 /* SHROOM */:
                            factions = [4 /* SHROOMS */];
                            animationName = "SmallMushroom";
                            additionalComponents = [new NPC_6.NPC(NPCSchedule_3.NPCSchedules.newFreeRoamSchedule()), new ShroomNPC_2.ShroomNPC()];
                            maxHealth = 2;
                            speed *= (.6 + Math.random() / 5);
                            break;
                        case 7 /* VILLAGER */:
                            animationName = "prisoner" + Math.ceil(Math.random() * 2);
                            maxHealth = 4;
                            // TODO: add a new type of schedule for a villager with a home
                            additionalComponents = [new NPC_6.NPC(NPCSchedule_3.NPCSchedules.newDefaultVillagerSchedule()), new Villager_1.Villager()];
                            break;
                        case 8 /* CENTAUR */:
                            factions = [5 /* CENTAURS */];
                            animationName = "Centaur_M";
                            additionalComponents = [new NPC_6.NPC(NPCSchedule_3.NPCSchedules.newFreeRoamSchedule()), new Centaur_2.Centaur()];
                            maxHealth = 2;
                            speed *= .5;
                            break;
                        default: {
                            throw new Error("DudeType " + type + " can't be instantiated");
                        }
                    }
                    // use saved data instead of defaults
                    var d = new Dude_8.Dude((_a = saveState === null || saveState === void 0 ? void 0 : saveState.uuid) !== null && _a !== void 0 ? _a : uuid_2.newUUID(), type, factions, (_b = saveState === null || saveState === void 0 ? void 0 : saveState.anim) !== null && _b !== void 0 ? _b : animationName, pos, (_c = saveState === null || saveState === void 0 ? void 0 : saveState.weapon) !== null && _c !== void 0 ? _c : weapon, (_d = saveState === null || saveState === void 0 ? void 0 : saveState.shield) !== null && _d !== void 0 ? _d : shield, (_e = saveState === null || saveState === void 0 ? void 0 : saveState.maxHealth) !== null && _e !== void 0 ? _e : maxHealth, (_f = saveState === null || saveState === void 0 ? void 0 : saveState.health) !== null && _f !== void 0 ? _f : maxHealth, (_g = saveState === null || saveState === void 0 ? void 0 : saveState.speed) !== null && _g !== void 0 ? _g : speed, !!(saveState === null || saveState === void 0 ? void 0 : saveState.inventory) ? Inventory_3.Inventory.load(saveState.inventory) : defaultInventory, (_h = saveState === null || saveState === void 0 ? void 0 : saveState.dialogue) !== null && _h !== void 0 ? _h : dialogue, (_j = saveState === null || saveState === void 0 ? void 0 : saveState.blob) !== null && _j !== void 0 ? _j : blob);
                    new Entity_29.Entity([d].concat(additionalComponents));
                    location.dudes.add(d);
                    d.location = location;
                    return d;
                };
                return DudeFactory;
            }());
            exports_122("DudeFactory", DudeFactory);
        }
    };
});
System.register("game/saves/DudeSaveState", [], function (exports_123, context_123) {
    "use strict";
    var DudeSaveState;
    var __moduleName = context_123 && context_123.id;
    return {
        setters: [],
        execute: function () {
            // Nothing in here should be nullable, or the logic in DudeFactory could break
            DudeSaveState = /** @class */ (function () {
                function DudeSaveState() {
                }
                return DudeSaveState;
            }());
            exports_123("DudeSaveState", DudeSaveState);
        }
    };
});
System.register("game/saves/LocationSaveState", [], function (exports_124, context_124) {
    "use strict";
    var LocationSaveState;
    var __moduleName = context_124 && context_124.id;
    return {
        setters: [],
        execute: function () {
            LocationSaveState = /** @class */ (function () {
                function LocationSaveState() {
                }
                return LocationSaveState;
            }());
            exports_124("LocationSaveState", LocationSaveState);
        }
    };
});
System.register("game/saves/LocationManagerSaveState", [], function (exports_125, context_125) {
    "use strict";
    var LocationManagerSaveState;
    var __moduleName = context_125 && context_125.id;
    return {
        setters: [],
        execute: function () {
            LocationManagerSaveState = /** @class */ (function () {
                function LocationManagerSaveState() {
                }
                return LocationManagerSaveState;
            }());
            exports_125("LocationManagerSaveState", LocationManagerSaveState);
        }
    };
});
System.register("game/world/LocationManager", ["game/world/WorldLocation"], function (exports_126, context_126) {
    "use strict";
    var WorldLocation_4, LocationManager;
    var __moduleName = context_126 && context_126.id;
    return {
        setters: [
            function (WorldLocation_4_1) {
                WorldLocation_4 = WorldLocation_4_1;
            }
        ],
        execute: function () {
            LocationManager = /** @class */ (function () {
                function LocationManager() {
                    this.locations = new Map(); // uuid -> location
                    LocationManager._instance = this;
                    window["locationManager"] = this;
                }
                Object.defineProperty(LocationManager, "instance", {
                    get: function () {
                        if (!this._instance) {
                            this._instance = new LocationManager();
                        }
                        return this._instance;
                    },
                    enumerable: false,
                    configurable: true
                });
                LocationManager.prototype.get = function (uuid) {
                    return this.locations.get(uuid);
                };
                LocationManager.prototype.add = function (location) {
                    this.locations.set(location.uuid, location);
                    if (!this.currentLocation) {
                        this.currentLocation = location;
                    }
                    return location;
                };
                LocationManager.prototype.exterior = function () {
                    if (!this.ext) {
                        // TODO do this in a less hacky fashion
                        this.ext = Array.from(this.locations.values()).filter(function (l) { return !l.isInterior; })[0];
                    }
                    return this.ext;
                };
                LocationManager.prototype.getLocations = function () {
                    return Array.from(this.locations.values());
                };
                LocationManager.prototype.save = function () {
                    return {
                        values: Array.from(this.locations.values()).map(function (l) { return l.save(); }),
                        currentLocationUUID: this.currentLocation.uuid
                    };
                };
                LocationManager.prototype.initialize = function (saveState) {
                    var _this = this;
                    this.locations = new Map();
                    saveState.values.forEach(function (l) {
                        var loadedLocation = WorldLocation_4.WorldLocation.load(l);
                        _this.locations.set(l.uuid, loadedLocation);
                    });
                    this.currentLocation = this.locations.get(saveState.currentLocationUUID);
                };
                return LocationManager;
            }());
            exports_126("LocationManager", LocationManager);
        }
    };
});
System.register("game/items/DroppedItem", ["engine/collision/BoxCollider", "engine/component", "engine/point", "game/characters/Player", "game/world/LocationManager", "game/items/Items", "game/SaveManager"], function (exports_127, context_127) {
    "use strict";
    var BoxCollider_9, component_39, point_71, Player_16, LocationManager_24, Items_6, SaveManager_7, DroppedItem;
    var __moduleName = context_127 && context_127.id;
    return {
        setters: [
            function (BoxCollider_9_1) {
                BoxCollider_9 = BoxCollider_9_1;
            },
            function (component_39_1) {
                component_39 = component_39_1;
            },
            function (point_71_1) {
                point_71 = point_71_1;
            },
            function (Player_16_1) {
                Player_16 = Player_16_1;
            },
            function (LocationManager_24_1) {
                LocationManager_24 = LocationManager_24_1;
            },
            function (Items_6_1) {
                Items_6 = Items_6_1;
            },
            function (SaveManager_7_1) {
                SaveManager_7 = SaveManager_7_1;
            }
        ],
        execute: function () {
            DroppedItem = /** @class */ (function (_super) {
                __extends(DroppedItem, _super);
                /**
                 * @param position The bottom center where the item should be placed
                 * @param sourceCollider will be ignored to prevent physics issues
                 */
                function DroppedItem(position, item, velocity, sourceCollider) {
                    if (sourceCollider === void 0) { sourceCollider = null; }
                    var _this = _super.call(this) || this;
                    _this.itemType = item;
                    _this.start = function () {
                        _this.tile = _this.entity.addComponent(Items_6.ITEM_METADATA_MAP[item].droppedIconSupplier().toComponent());
                        var pos = position.minus(new point_71.Point(_this.tile.transform.dimensions.x / 2, _this.tile.transform.dimensions.y));
                        _this.tile.transform.position = pos;
                        var colliderSize = new point_71.Point(8, 8);
                        _this.collider = _this.entity.addComponent(new BoxCollider_9.BoxCollider(pos.plus(_this.tile.transform.dimensions.minus(colliderSize).div(2)), colliderSize, DroppedItem.COLLISION_LAYER, !!sourceCollider ? [sourceCollider] : []));
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
                    _this.update = function () {
                        var colliding = Player_16.Player.instance.dude.standingPosition.plusY(-6).distanceTo(position) < 12;
                        if (colliding) {
                            _this.update = function () { };
                            setTimeout(function () {
                                if (Player_16.Player.instance.dude.isAlive && !!_this.entity) {
                                    if (_this.itemType === 0 /* COIN */) {
                                        SaveManager_7.saveManager.setState({
                                            coins: SaveManager_7.saveManager.getState().coins + 1
                                        });
                                    }
                                    if (_this.itemType === 0 /* COIN */ || Player_16.Player.instance.dude.inventory.addItem(_this.itemType)) {
                                        LocationManager_24.LocationManager.instance.currentLocation.droppedItems.delete(_this.entity);
                                        _this.entity.selfDestruct();
                                    }
                                }
                            }, 150);
                        }
                    };
                    return _this;
                }
                DroppedItem.prototype.reposition = function (delta) {
                    if (delta === void 0) { delta = new point_71.Point(0, 0); }
                    var colliderOffset = this.collider.position.minus(this.tile.transform.position);
                    this.tile.transform.position = this.collider.moveTo(this.collider.position.plus(delta)).minus(colliderOffset);
                    this.tile.transform.depth = this.tile.transform.position.y + this.tile.transform.dimensions.y;
                };
                DroppedItem.COLLISION_LAYER = "item";
                return DroppedItem;
            }(component_39.Component));
            exports_127("DroppedItem", DroppedItem);
        }
    };
});
System.register("game/items/Items", ["game/graphics/Tilesets", "engine/Entity", "game/world/LocationManager", "game/items/DroppedItem", "engine/point", "game/characters/weapons/WeaponType", "game/characters/Player"], function (exports_128, context_128) {
    "use strict";
    var _a, Tilesets_42, Entity_30, LocationManager_25, DroppedItem_1, point_72, WeaponType_6, Player_17, ItemMetadata, ITEM_METADATA_MAP, spawnItem;
    var __moduleName = context_128 && context_128.id;
    return {
        setters: [
            function (Tilesets_42_1) {
                Tilesets_42 = Tilesets_42_1;
            },
            function (Entity_30_1) {
                Entity_30 = Entity_30_1;
            },
            function (LocationManager_25_1) {
                LocationManager_25 = LocationManager_25_1;
            },
            function (DroppedItem_1_1) {
                DroppedItem_1 = DroppedItem_1_1;
            },
            function (point_72_1) {
                point_72 = point_72_1;
            },
            function (WeaponType_6_1) {
                WeaponType_6 = WeaponType_6_1;
            },
            function (Player_17_1) {
                Player_17 = Player_17_1;
            }
        ],
        execute: function () {
            ItemMetadata = /** @class */ (function () {
                // TODO maybe make this a builder
                function ItemMetadata(_a) {
                    var displayName = _a.displayName, inventoryIconSupplier = _a.inventoryIconSupplier, _b = _a.droppedIconSupplier, droppedIconSupplier = _b === void 0 ? function () { return null; } : _b, _c = _a.stackLimit, stackLimit = _c === void 0 ? 99 : _c, _d = _a.element, element = _d === void 0 ? null : _d, // for placing elements
                    _e = _a.equippable, // for placing elements
                    equippable = _e === void 0 ? null : _e, _f = _a.consumable, consumable = _f === void 0 ? null : _f;
                    this.displayName = displayName;
                    this.droppedIconSupplier = droppedIconSupplier;
                    this.inventoryIconSupplier = inventoryIconSupplier;
                    this.stackLimit = stackLimit;
                    this.element = element;
                    this.equippable = equippable;
                    this.consumable = consumable;
                }
                return ItemMetadata;
            }());
            exports_128("ItemMetadata", ItemMetadata);
            // Data that doesn't get serialized (TODO make builder pattern)
            exports_128("ITEM_METADATA_MAP", ITEM_METADATA_MAP = (_a = {},
                _a[0 /* COIN */] = new ItemMetadata({
                    displayName: "Coin",
                    inventoryIconSupplier: function () { return Tilesets_42.Tilesets.instance.oneBit.getTileSource("coin"); },
                    droppedIconSupplier: function () { return Tilesets_42.Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150); },
                    stackLimit: Number.MAX_SAFE_INTEGER,
                }),
                _a[1 /* ROCK */] = new ItemMetadata({
                    displayName: "Rock",
                    inventoryIconSupplier: function () { return Tilesets_42.Tilesets.instance.oneBit.getTileSource("rock"); },
                    droppedIconSupplier: function () { return Tilesets_42.Tilesets.instance.outdoorTiles.getTileSource("rockItem"); },
                }),
                _a[2 /* WOOD */] = new ItemMetadata({
                    displayName: "Wood",
                    inventoryIconSupplier: function () { return Tilesets_42.Tilesets.instance.oneBit.getTileSource("wood"); },
                    droppedIconSupplier: function () { return Tilesets_42.Tilesets.instance.outdoorTiles.getTileSource("woodItem"); },
                }),
                _a[3 /* TENT */] = new ItemMetadata({
                    displayName: "Tent",
                    inventoryIconSupplier: function () { return Tilesets_42.Tilesets.instance.oneBit.getTileSource("tent"); },
                    stackLimit: 1,
                    element: 3 /* TENT */
                }),
                _a[4 /* CAMPFIRE */] = new ItemMetadata({
                    displayName: "Campfire",
                    inventoryIconSupplier: function () { return Tilesets_42.Tilesets.instance.oneBit.getTileSource("campfire"); },
                    stackLimit: 1,
                    element: 4 /* CAMPFIRE */
                }),
                _a[5 /* IRON */] = new ItemMetadata({
                    displayName: "Iron",
                    inventoryIconSupplier: function () { return Tilesets_42.Tilesets.instance.oneBit.getTileSource("iron"); },
                    droppedIconSupplier: function () { return Tilesets_42.Tilesets.instance.outdoorTiles.getTileSource("ironItem"); },
                }),
                _a[6 /* HOUSE */] = new ItemMetadata({
                    displayName: "House",
                    inventoryIconSupplier: function () { return Tilesets_42.Tilesets.instance.oneBit.getTileSource("house"); },
                    stackLimit: 1,
                    element: 6 /* HOUSE */
                }),
                _a[7 /* ROUND_SAPLING */] = new ItemMetadata({
                    displayName: "Sapling",
                    inventoryIconSupplier: function () { return Tilesets_42.Tilesets.instance.oneBit.getTileSource("treeRound"); },
                    droppedIconSupplier: function () { return Tilesets_42.Tilesets.instance.outdoorTiles.getTileSource("treeRoundSapling"); },
                    element: 0 /* TREE_ROUND */
                }),
                _a[8 /* POINTY_SAPLING */] = new ItemMetadata({
                    displayName: "Sapling",
                    inventoryIconSupplier: function () { return Tilesets_42.Tilesets.instance.oneBit.getTileSource("treePointy"); },
                    droppedIconSupplier: function () { return Tilesets_42.Tilesets.instance.outdoorTiles.getTileSource("treePointySapling"); },
                    element: 1 /* TREE_POINTY */
                }),
                _a[9 /* MUSHROOM */] = new ItemMetadata({
                    displayName: "Mushroom",
                    inventoryIconSupplier: function () { return Tilesets_42.Tilesets.instance.oneBit.getTileSource("mushroom"); },
                    droppedIconSupplier: function () { return Tilesets_42.Tilesets.instance.outdoorTiles.getTileSource("mushroom"); },
                    element: 7 /* MUSHROOM */,
                    consumable: function () { return Player_17.Player.instance.dude.heal(1); }
                }),
                // TODO add other weapons
                _a[100012 /* AXE */] = new ItemMetadata({
                    displayName: "Axe",
                    inventoryIconSupplier: function () { return Tilesets_42.Tilesets.instance.oneBit.getTileSource("axe"); },
                    stackLimit: 1,
                    equippable: WeaponType_6.WeaponType.AXE
                }),
                _a[100022 /* PICKAXE */] = new ItemMetadata({
                    displayName: "Pickaxe",
                    inventoryIconSupplier: function () { return Tilesets_42.Tilesets.instance.oneBit.getTileSource("pickaxe"); },
                    stackLimit: 1,
                    equippable: WeaponType_6.WeaponType.PICKAXE
                }),
                _a[100003 /* SWORD */] = new ItemMetadata({
                    displayName: "Sword",
                    inventoryIconSupplier: function () { return Tilesets_42.Tilesets.instance.oneBit.getTileSource("sword"); },
                    stackLimit: 1,
                    equippable: WeaponType_6.WeaponType.SWORD
                }),
                _a[100021 /* SPEAR */] = new ItemMetadata({
                    displayName: "Spear",
                    inventoryIconSupplier: function () { return Tilesets_42.Tilesets.instance.oneBit.getTileSource("spear"); },
                    stackLimit: 1,
                    equippable: WeaponType_6.WeaponType.SPEAR
                }),
                _a));
            /**
             * @param position The bottom center where the item should be placed
             */
            exports_128("spawnItem", spawnItem = function (pos, item, velocity, sourceCollider) {
                if (velocity === void 0) { velocity = new point_72.Point(0, 0); }
                if (sourceCollider === void 0) { sourceCollider = null; }
                LocationManager_25.LocationManager.instance.currentLocation.droppedItems.add(new Entity_30.Entity([
                    new DroppedItem_1.DroppedItem(pos, item, velocity, sourceCollider)
                ]));
            });
        }
    };
});
System.register("game/items/Inventory", ["game/items/Items"], function (exports_129, context_129) {
    "use strict";
    var Items_7, ItemStack, Inventory;
    var __moduleName = context_129 && context_129.id;
    return {
        setters: [
            function (Items_7_1) {
                Items_7 = Items_7_1;
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
            exports_129("ItemStack", ItemStack);
            // TODO flesh this out more when we have more items
            Inventory = /** @class */ (function () {
                function Inventory(size) {
                    if (size === void 0) { size = 20; }
                    this.countMap = new Map();
                    this.stacks = Array.from({ length: size });
                }
                Object.defineProperty(Inventory.prototype, "size", {
                    get: function () {
                        return this.stacks.length;
                    },
                    enumerable: false,
                    configurable: true
                });
                Inventory.prototype.getStack = function (index) {
                    return this.stacks[index];
                };
                Inventory.prototype.setStack = function (index, stack) {
                    this.stacks[index] = stack;
                    this.recomputeCountsMap();
                };
                /**
                 * returns true if the item can fit in the inventory
                 */
                Inventory.prototype.addItem = function (item) {
                    var _a, _b;
                    var firstEmptySlot = -1;
                    for (var i = 0; i < this.stacks.length; i++) {
                        var slotValue = this.stacks[i];
                        if (!!slotValue) {
                            if (slotValue.item === item && slotValue.count < Items_7.ITEM_METADATA_MAP[item].stackLimit) {
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
                        this.stacks[firstEmptySlot] = new ItemStack(item, 1);
                        this.countMap.set(item, 1 + ((_b = this.countMap.get(item)) !== null && _b !== void 0 ? _b : 0));
                        return true;
                    }
                    return false;
                };
                Inventory.prototype.canAddItem = function (item) {
                    var firstEmptySlot = -1;
                    for (var i = 0; i < this.stacks.length; i++) {
                        var slotValue = this.stacks[i];
                        if (!!slotValue) {
                            if (slotValue.item === item && slotValue.count < Items_7.ITEM_METADATA_MAP[item].stackLimit) {
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
                    for (var i = 0; i < this.stacks.length; i++) {
                        var slotValue = this.stacks[i];
                        if ((slotValue === null || slotValue === void 0 ? void 0 : slotValue.item) === item) {
                            while (slotValue.count > 0 && count > 0) {
                                count--;
                                slotValue.count--;
                            }
                            if (slotValue.count === 0) {
                                this.stacks[i] = null;
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
                    return this.stacks;
                };
                Inventory.prototype.recomputeCountsMap = function () {
                    var _this = this;
                    this.countMap = new Map();
                    this.stacks.forEach(function (stack) {
                        if (!!stack) {
                            _this.countMap.set(stack.item, _this.getItemCount(stack.item) + stack.count);
                        }
                    });
                };
                Inventory.load = function (stacks) {
                    var inv = new Inventory();
                    inv.stacks = stacks;
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
            exports_129("Inventory", Inventory);
        }
    };
});
System.register("game/characters/DudeAnimationUtils", ["game/graphics/ImageFilters", "game/graphics/Tilesets", "game/SaveManager"], function (exports_130, context_130) {
    "use strict";
    var ImageFilters_4, Tilesets_43, SaveManager_8, maybeFilter, DudeAnimationUtils;
    var __moduleName = context_130 && context_130.id;
    return {
        setters: [
            function (ImageFilters_4_1) {
                ImageFilters_4 = ImageFilters_4_1;
            },
            function (Tilesets_43_1) {
                Tilesets_43 = Tilesets_43_1;
            },
            function (SaveManager_8_1) {
                SaveManager_8 = SaveManager_8_1;
            }
        ],
        execute: function () {
            maybeFilter = function (characterAnimName, blob, anim) {
                if (!anim) {
                    throw new Error("no animation found for \"" + characterAnimName + "\"");
                }
                if (characterAnimName === "knight_f") {
                    var color = SaveManager_8.saveManager.getState().plume;
                    if (!!color) {
                        return anim
                            .filtered(ImageFilters_4.ImageFilters.recolor("#dc4a7b" /* PINK */, color[0]))
                            .filtered(ImageFilters_4.ImageFilters.recolor("#f78697" /* LIGHT_PINK */, color[1]));
                    }
                }
                return anim;
            };
            exports_130("DudeAnimationUtils", DudeAnimationUtils = {
                getCharacterIdleAnimation: function (characterAnimName, blob) {
                    var animSpeed = 150;
                    var anim = Tilesets_43.Tilesets.instance.dungeonCharacters.getTileSetAnimation(characterAnimName + "_idle_anim", animSpeed)
                        || Tilesets_43.Tilesets.instance.extraCharacterSet1.getTileSetAnimation(characterAnimName + "_Idle", 4, animSpeed)
                        || Tilesets_43.Tilesets.instance.extraCharacterSet2.getIdleAnimation(characterAnimName, animSpeed);
                    return maybeFilter(characterAnimName, blob, anim);
                },
                getCharacterWalkAnimation: function (characterAnimName, blob) {
                    var animSpeed = 80;
                    var anim = Tilesets_43.Tilesets.instance.dungeonCharacters.getTileSetAnimation(characterAnimName + "_run_anim", animSpeed)
                        || Tilesets_43.Tilesets.instance.extraCharacterSet1.getTileSetAnimation(characterAnimName + "_Walk", 4, animSpeed)
                        || Tilesets_43.Tilesets.instance.extraCharacterSet2.getWalkAnimation(characterAnimName, animSpeed);
                    return maybeFilter(characterAnimName, blob, anim);
                },
            });
        }
    };
});
System.register("game/characters/weapons/Shield", ["engine/component", "engine/tiles/TileComponent", "game/graphics/Tilesets", "engine/tiles/TileTransform", "engine/point", "game/characters/Dude"], function (exports_131, context_131) {
    "use strict";
    var component_40, TileComponent_10, Tilesets_44, TileTransform_30, point_73, Dude_9, State, Shield;
    var __moduleName = context_131 && context_131.id;
    return {
        setters: [
            function (component_40_1) {
                component_40 = component_40_1;
            },
            function (TileComponent_10_1) {
                TileComponent_10 = TileComponent_10_1;
            },
            function (Tilesets_44_1) {
                Tilesets_44 = Tilesets_44_1;
            },
            function (TileTransform_30_1) {
                TileTransform_30 = TileTransform_30_1;
            },
            function (point_73_1) {
                point_73 = point_73_1;
            },
            function (Dude_9_1) {
                Dude_9 = Dude_9_1;
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
                    _this.timeToRaiseMs = 120;
                    _this.currentAnimationFrame = 0;
                    _this.start = function (startData) {
                        _this.dude = _this.entity.getComponent(Dude_9.Dude);
                        _this.blockingShieldSprite = _this.entity.addComponent(new TileComponent_10.TileComponent(Tilesets_44.Tilesets.instance.dungeonCharacters.getTileSource(shieldId), new TileTransform_30.TileTransform().relativeTo(_this.dude.animation.transform)));
                    };
                    return _this;
                }
                Shield.prototype.update = function (updateData) {
                    // default (drawn) position
                    var pos = this.dude.animation.transform.dimensions.minus(new point_73.Point(12, 16));
                    if (this.state === State.ON_BACK) {
                        pos = pos.plus(new point_73.Point(-6, -1));
                    }
                    else if (this.state === State.DRAWN) {
                        pos = pos.plus(new point_73.Point(5, 4).times(this.raisedPerc < .7 ? this.raisedPerc : 1.4 - this.raisedPerc).apply(Math.floor));
                        if (this.blockingActive) { // raising
                            this.raisedPerc = Math.min(this.raisedPerc + updateData.elapsedTimeMillis / this.timeToRaiseMs, 1);
                        }
                        else { // lowering
                            this.raisedPerc = Math.max(this.raisedPerc - updateData.elapsedTimeMillis / this.timeToRaiseMs, 0);
                        }
                    }
                    pos = pos.plus(this.dude.getAnimationOffsetPosition());
                    this.blockingShieldSprite.transform.position = pos;
                    this.blockingShieldSprite.transform.depth = this.raisedPerc > .7 ? .75 : -.75;
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
                    return this.state === State.DRAWN && this.raisedPerc > .3;
                };
                Shield.prototype.canAttack = function () {
                    return this.state === State.DRAWN && this.raisedPerc < .5;
                };
                return Shield;
            }(component_40.Component));
            exports_131("Shield", Shield);
        }
    };
});
System.register("game/characters/weapons/Weapon", ["engine/component", "game/world/LocationManager", "game/characters/Dude", "game/world/elements/Hittable", "engine/point"], function (exports_132, context_132) {
    "use strict";
    var component_41, LocationManager_26, Dude_10, Hittable_3, point_74, Weapon;
    var __moduleName = context_132 && context_132.id;
    return {
        setters: [
            function (component_41_1) {
                component_41 = component_41_1;
            },
            function (LocationManager_26_1) {
                LocationManager_26 = LocationManager_26_1;
            },
            function (Dude_10_1) {
                Dude_10 = Dude_10_1;
            },
            function (Hittable_3_1) {
                Hittable_3 = Hittable_3_1;
            },
            function (point_74_1) {
                point_74 = point_74_1;
            }
        ],
        execute: function () {
            Weapon = /** @class */ (function (_super) {
                __extends(Weapon, _super);
                function Weapon() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Weapon.prototype.awake = function () {
                    this.dude = this.entity.getComponent(Dude_10.Dude);
                };
                // TODO find a better place for these static functions?
                Weapon.getEnemiesInRange = function (attacker, attackDistance) {
                    return Array.from(LocationManager_26.LocationManager.instance.currentLocation.dudes)
                        .filter(function (d) { return !!d && d !== attacker && d.isEnemy(attacker); })
                        .filter(function (d) { return attacker.isFacing(d.standingPosition); })
                        .filter(function (d) { return d.standingPosition.distanceTo(attacker.standingPosition) < attackDistance; });
                };
                Weapon.hitResources = function (dude) {
                    var interactDistance = 20;
                    var interactCenter = dude.standingPosition.minus(new point_74.Point(0, 7));
                    var possibilities = LocationManager_26.LocationManager.instance.currentLocation.getElements()
                        .map(function (e) { return e.entity.getComponent(Hittable_3.Hittable); })
                        .filter(function (e) { return !!e; })
                        .filter(function (e) { return dude.isFacing(e.position); });
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
                /**
                 * This will be called on any frame that attack() is not called
                 */
                Weapon.prototype.cancelAttack = function () { };
                return Weapon;
            }(component_41.Component));
            exports_132("Weapon", Weapon);
        }
    };
});
System.register("game/characters/weapons/UnarmedWeapon", ["game/characters/weapons/Weapon", "game/characters/weapons/WeaponType"], function (exports_133, context_133) {
    "use strict";
    var Weapon_1, WeaponType_7, State, UnarmedWeapon;
    var __moduleName = context_133 && context_133.id;
    return {
        setters: [
            function (Weapon_1_1) {
                Weapon_1 = Weapon_1_1;
            },
            function (WeaponType_7_1) {
                WeaponType_7 = WeaponType_7_1;
            }
        ],
        execute: function () {
            (function (State) {
                State[State["DRAWN"] = 0] = "DRAWN";
                State[State["ATTACKING"] = 1] = "ATTACKING";
            })(State || (State = {}));
            UnarmedWeapon = /** @class */ (function (_super) {
                __extends(UnarmedWeapon, _super);
                function UnarmedWeapon() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.state = State.DRAWN;
                    return _this;
                }
                UnarmedWeapon.prototype.getType = function () {
                    return WeaponType_7.WeaponType.UNARMED;
                };
                UnarmedWeapon.prototype.setDelayBetweenAttacks = function (delayMillis) {
                    this.delay = delayMillis;
                };
                UnarmedWeapon.prototype.isAttacking = function () {
                    return this.state === State.ATTACKING;
                };
                UnarmedWeapon.prototype.toggleSheathed = function () { };
                UnarmedWeapon.prototype.getRange = function () {
                    return 15;
                };
                UnarmedWeapon.prototype.attack = function (newAttack) {
                    var _this = this;
                    if (this.state === State.ATTACKING) {
                        return;
                    }
                    if (!newAttack) {
                        return;
                    }
                    var enemies = Weapon_1.Weapon.getEnemiesInRange(this.dude, this.getRange() * 1.5);
                    if (enemies.length === 0) {
                        return;
                    }
                    this.state = State.ATTACKING;
                    var closestEnemy = enemies[0];
                    var attackDir = closestEnemy.standingPosition.minus(this.dude.standingPosition);
                    this.dude.knockback(attackDir, 30); // pounce
                    closestEnemy.damage(1, closestEnemy.standingPosition.minus(this.dude.standingPosition), 50);
                    setTimeout(function () { return _this.state = State.DRAWN; }, this.delay);
                };
                return UnarmedWeapon;
            }(Weapon_1.Weapon));
            exports_133("UnarmedWeapon", UnarmedWeapon);
        }
    };
});
System.register("game/characters/weapons/MeleeWeapon", ["game/characters/weapons/Weapon", "engine/tiles/TileTransform", "engine/point", "game/graphics/Tilesets", "engine/util/Animator"], function (exports_134, context_134) {
    "use strict";
    var Weapon_2, TileTransform_31, point_75, Tilesets_45, Animator_4, State, MeleeWeapon;
    var __moduleName = context_134 && context_134.id;
    return {
        setters: [
            function (Weapon_2_1) {
                Weapon_2 = Weapon_2_1;
            },
            function (TileTransform_31_1) {
                TileTransform_31 = TileTransform_31_1;
            },
            function (point_75_1) {
                point_75 = point_75_1;
            },
            function (Tilesets_45_1) {
                Tilesets_45 = Tilesets_45_1;
            },
            function (Animator_4_1) {
                Animator_4 = Animator_4_1;
            }
        ],
        execute: function () {
            (function (State) {
                State[State["SHEATHED"] = 0] = "SHEATHED";
                State[State["DRAWN"] = 1] = "DRAWN";
                State[State["ATTACKING"] = 2] = "ATTACKING";
            })(State || (State = {}));
            MeleeWeapon = /** @class */ (function (_super) {
                __extends(MeleeWeapon, _super);
                function MeleeWeapon(weaponType, weaponId, offsetFromCenter) {
                    var _this = _super.call(this) || this;
                    _this.state = State.DRAWN;
                    _this.delayBetweenAttacks = 0; // delay after the animation ends before the weapon can attack again in millis
                    _this.currentAnimationFrame = 0;
                    _this.start = function (startData) {
                        _this.weaponSprite = Tilesets_45.Tilesets.instance.dungeonCharacters.getTileSource(weaponId);
                        _this.weaponTransform = new TileTransform_31.TileTransform(point_75.Point.ZERO, _this.weaponSprite.dimensions).relativeTo(_this.dude.animation.transform);
                        _this.offsetFromCenter = offsetFromCenter;
                        _this._range = _this.weaponSprite.dimensions.y;
                        _this.slashSprite = _this.entity.addComponent(Tilesets_45.Tilesets.instance.oneBit.getTileSource("slash").toComponent());
                    };
                    _this.weaponType = weaponType;
                    return _this;
                }
                MeleeWeapon.prototype.update = function (updateData) {
                    if (!!this.animator) {
                        this.animator.update(updateData.elapsedTimeMillis);
                    }
                    this.animate();
                };
                MeleeWeapon.prototype.getRenderMethods = function () {
                    return [this.weaponSprite.toImageRender(this.weaponTransform)];
                };
                MeleeWeapon.prototype.getType = function () {
                    return this.weaponType;
                };
                MeleeWeapon.prototype.setDelayBetweenAttacks = function (delayMs) {
                    this.delayBetweenAttacks = delayMs;
                };
                MeleeWeapon.prototype.isAttacking = function () {
                    return this.state === State.ATTACKING;
                };
                MeleeWeapon.prototype.toggleSheathed = function () {
                    if (this.state === State.SHEATHED) {
                        this.state = State.DRAWN;
                    }
                    else if (this.state === State.DRAWN) {
                        this.state = State.SHEATHED;
                    }
                };
                MeleeWeapon.prototype.getRange = function () {
                    return this._range;
                };
                MeleeWeapon.prototype.attack = function (newAttack) {
                    var _this = this;
                    var _a;
                    if (this.dude.shield && !((_a = this.dude.shield) === null || _a === void 0 ? void 0 : _a.canAttack())) {
                        return;
                    }
                    if (newAttack && this.state === State.DRAWN) {
                        this.state = State.ATTACKING;
                        setTimeout(function () { return _this.damageEnemies(); }, 100);
                        this.playAttackAnimation();
                    }
                };
                MeleeWeapon.prototype.damageEnemies = function () {
                    var _this = this;
                    if (!this.enabled) {
                        return;
                    }
                    var attackDistance = this.getRange() + 4; // add a tiny buffer for small weapons like the dagger to still work
                    // TODO maybe only allow big weapons to hit multiple targets
                    var enemies = Weapon_2.Weapon.getEnemiesInRange(this.dude, attackDistance);
                    enemies.forEach(function (d) {
                        d.damage(1, d.standingPosition.minus(_this.dude.standingPosition), 30);
                    });
                    if (this.dude.type === 0 /* PLAYER */ && enemies.length === 0) {
                        Weapon_2.Weapon.hitResources(this.dude);
                    }
                };
                MeleeWeapon.prototype.animate = function () {
                    var _a;
                    var offsetFromEdge = new point_75.Point(this.dude.animation.transform.dimensions.x / 2 - this.weaponTransform.dimensions.x / 2, this.dude.animation.transform.dimensions.y - this.weaponTransform.dimensions.y).plus(this.offsetFromCenter);
                    var pos = new point_75.Point(0, 0);
                    var rotation = 0;
                    if (this.state === State.DRAWN) {
                        pos = offsetFromEdge;
                    }
                    else if (this.state === State.SHEATHED) { // TODO add side sheath for swords
                        // center on back
                        pos = offsetFromEdge.plus(new point_75.Point(3, -1));
                    }
                    else if (this.state === State.ATTACKING) {
                        var posWithRotation = this.getAttackAnimationPosition();
                        pos = posWithRotation[0].plus(offsetFromEdge);
                        rotation = posWithRotation[1];
                    }
                    this.weaponTransform.rotation = rotation;
                    this.weaponTransform.mirrorY = this.state == State.SHEATHED;
                    pos = pos.plus(this.dude.getAnimationOffsetPosition());
                    this.weaponTransform.position = pos;
                    // show sword behind character if sheathed
                    this.weaponTransform.depth = this.state == State.SHEATHED ? -.5 : .5;
                    var frame = (_a = this.animator) === null || _a === void 0 ? void 0 : _a.getCurrentFrame();
                    this.slashSprite.enabled = frame === 3;
                    this.slashSprite.transform.depth = this.dude.animation.transform.depth + 2;
                    this.slashSprite.transform.mirrorX = this.weaponTransform.mirrorX;
                    this.slashSprite.transform.position = this.dude.animation.transform.position.plus(new point_75.Point((this.weaponTransform.mirrorX ? -1 : 1) * (this.weaponTransform.dimensions.y - 10), 8));
                };
                MeleeWeapon.prototype.playAttackAnimation = function () {
                    var _this = this;
                    this.animator = new Animator_4.Animator(Animator_4.Animator.frames(8, 40), function (index) { return _this.currentAnimationFrame = index; }, function () {
                        _this.animator = null;
                        setTimeout(function () {
                            _this.state = State.DRAWN; // reset to DRAWN when animation finishes
                        }, _this.delayBetweenAttacks);
                    });
                };
                /**
                 * Returns (position, rotation)
                 */
                MeleeWeapon.prototype.getAttackAnimationPosition = function () {
                    var swingStartFrame = 3;
                    var resettingFrame = 7;
                    if (this.currentAnimationFrame < swingStartFrame) {
                        return [new point_75.Point(this.currentAnimationFrame * 3, 0), 0];
                    }
                    else if (this.currentAnimationFrame < resettingFrame) {
                        return [
                            new point_75.Point((6 - this.currentAnimationFrame) + this.weaponTransform.dimensions.y - swingStartFrame * 3, Math.floor(this.weaponTransform.dimensions.y / 2 - 1)),
                            90
                        ];
                    }
                    else {
                        return [new point_75.Point((1 - this.currentAnimationFrame + resettingFrame) * 3, 2), 0];
                    }
                };
                return MeleeWeapon;
            }(Weapon_2.Weapon));
            exports_134("MeleeWeapon", MeleeWeapon);
        }
    };
});
System.register("game/characters/weapons/Projectile", ["engine/collision/BoxCollider", "engine/component", "engine/Entity", "engine/point", "game/world/LocationManager", "game/items/DroppedItem", "engine/util/Lists"], function (exports_135, context_135) {
    "use strict";
    var BoxCollider_10, component_42, Entity_31, point_76, LocationManager_27, DroppedItem_2, Lists_8, Projectile, spawnProjectile;
    var __moduleName = context_135 && context_135.id;
    return {
        setters: [
            function (BoxCollider_10_1) {
                BoxCollider_10 = BoxCollider_10_1;
            },
            function (component_42_1) {
                component_42 = component_42_1;
            },
            function (Entity_31_1) {
                Entity_31 = Entity_31_1;
            },
            function (point_76_1) {
                point_76 = point_76_1;
            },
            function (LocationManager_27_1) {
                LocationManager_27 = LocationManager_27_1;
            },
            function (DroppedItem_2_1) {
                DroppedItem_2 = DroppedItem_2_1;
            },
            function (Lists_8_1) {
                Lists_8 = Lists_8_1;
            }
        ],
        execute: function () {
            Projectile = /** @class */ (function (_super) {
                __extends(Projectile, _super);
                /**
                 * @param position The bottom center where the item should be placed
                 * @param sourceCollider will be ignored to prevent physics issues
                 */
                function Projectile(position, sprite, item, velocity, attacker) {
                    var _this = _super.call(this) || this;
                    _this.itemType = item;
                    _this.start = function () {
                        _this.tile = _this.entity.addComponent(sprite.toComponent());
                        var pos = position.minus(new point_76.Point(_this.tile.transform.dimensions.x / 2, _this.tile.transform.dimensions.y));
                        _this.tile.transform.position = pos;
                        _this.tile.transform.rotation = velocity.x > 0 ? 90 : -90;
                        _this.tile.transform.mirrorX = velocity.x > 0;
                        var colliderSize = new point_76.Point(8, 8);
                        var sourceCollider = attacker.entity.getComponent(BoxCollider_10.BoxCollider);
                        _this.collider = _this.entity.addComponent(new BoxCollider_10.BoxCollider(pos.plus(new point_76.Point(10, 10)), colliderSize, DroppedItem_2.DroppedItem.COLLISION_LAYER, !!sourceCollider ? [sourceCollider] : []));
                        _this.reposition();
                        var last = new Date().getTime();
                        var move = function () {
                            if (!_this.enabled) {
                                return;
                            }
                            var now = new Date().getTime();
                            var diff = now - last;
                            if (diff > 0) {
                                if (_this.reposition(velocity)) {
                                    // collided, short circuit
                                    var enemy = _this.getEnemy(attacker, _this.collider.position.plus(_this.collider.dimensions), velocity, 20);
                                    if (!!enemy) {
                                        _this.collider.delete();
                                        velocity = point_76.Point.ZERO;
                                        // make the projectile stick to the enemy
                                        var relativeOffset = _this.tile.transform.position.minus(enemy.animation.transform.position);
                                        var relativeDepth = _this.tile.transform.depth - enemy.animation.transform.depth;
                                        _this.tile.transform.relativeTo(enemy.animation.transform);
                                        _this.tile.transform.position = relativeOffset;
                                        _this.tile.transform.depth = relativeDepth;
                                        _this.tile.transform.position = new point_76.Point(_this.tile.transform.dimensions.y - 10, relativeOffset.y);
                                        enemy.damage(1, enemy.standingPosition.minus(attacker.standingPosition), 30);
                                    }
                                }
                                velocity = velocity.times(.6);
                            }
                            if (velocity.magnitude() >= .1) {
                                requestAnimationFrame(move);
                            }
                            else {
                                setTimeout(function () { return _this.entity.selfDestruct(); }, 5000);
                            }
                            last = now;
                        };
                        requestAnimationFrame(move);
                    };
                    return _this;
                }
                Projectile.prototype.getEnemy = function (attacker, projectilePos, velocity, attackDistance) {
                    var allEnemies = Array.from(LocationManager_27.LocationManager.instance.currentLocation.dudes)
                        .filter(function (d) { return !!d && d !== attacker && d.isEnemy(attacker); })
                        .filter(function (d) { return d.standingPosition.distanceTo(projectilePos) < attackDistance; });
                    return Lists_8.Lists.minBy(allEnemies, function (d) { return d.standingPosition.manhattanDistanceTo(projectilePos); });
                };
                /**
                 * returns true if it successfully moved
                 */
                Projectile.prototype.reposition = function (delta) {
                    if (delta === void 0) { delta = new point_76.Point(0, 0); }
                    var colliderOffset = this.collider.position.minus(this.tile.transform.position);
                    var beforePos = this.tile.transform.position;
                    this.tile.transform.position = this.collider.moveTo(this.collider.position.plus(delta).apply(Math.floor)).minus(colliderOffset);
                    this.tile.transform.depth = this.tile.transform.position.y + this.tile.transform.dimensions.y - 14;
                    var afterPos = this.tile.transform.position;
                    return beforePos.distanceTo(afterPos) >= 0.05;
                };
                return Projectile;
            }(component_42.Component));
            exports_135("spawnProjectile", spawnProjectile = function (pos, sprite, item, velocity, attacker) {
                LocationManager_27.LocationManager.instance.currentLocation.droppedItems.add(new Entity_31.Entity([
                    new Projectile(pos, sprite, item, velocity, attacker)
                ]));
            });
        }
    };
});
System.register("game/characters/weapons/SpearWeapon", ["game/characters/weapons/Weapon", "game/characters/weapons/WeaponType", "engine/tiles/TileTransform", "engine/point", "game/graphics/Tilesets", "engine/util/Animator", "game/characters/weapons/Projectile"], function (exports_136, context_136) {
    "use strict";
    var Weapon_3, WeaponType_8, TileTransform_32, point_77, Tilesets_46, Animator_5, Projectile_1, State, SpearWeapon;
    var __moduleName = context_136 && context_136.id;
    return {
        setters: [
            function (Weapon_3_1) {
                Weapon_3 = Weapon_3_1;
            },
            function (WeaponType_8_1) {
                WeaponType_8 = WeaponType_8_1;
            },
            function (TileTransform_32_1) {
                TileTransform_32 = TileTransform_32_1;
            },
            function (point_77_1) {
                point_77 = point_77_1;
            },
            function (Tilesets_46_1) {
                Tilesets_46 = Tilesets_46_1;
            },
            function (Animator_5_1) {
                Animator_5 = Animator_5_1;
            },
            function (Projectile_1_1) {
                Projectile_1 = Projectile_1_1;
            }
        ],
        execute: function () {
            (function (State) {
                State[State["SHEATHED"] = 0] = "SHEATHED";
                State[State["DRAWN"] = 1] = "DRAWN";
                State[State["DRAWING"] = 2] = "DRAWING";
                State[State["ATTACKING"] = 3] = "ATTACKING";
            })(State || (State = {}));
            SpearWeapon = /** @class */ (function (_super) {
                __extends(SpearWeapon, _super);
                function SpearWeapon() {
                    var _this = _super.call(this) || this;
                    _this.state = State.DRAWN;
                    _this.delayBetweenAttacks = 0; // delay after the animation ends before the weapon can attack again in millis
                    _this.timeDrawn = 0;
                    _this.frameCount = 6;
                    _this.currentAnimationFrame = 0;
                    _this.start = function (startData) {
                        _this.weaponSprite = Tilesets_46.Tilesets.instance.dungeonCharacters.getTileSource("weapon_spear");
                        _this.weaponTransform = new TileTransform_32.TileTransform(point_77.Point.ZERO, _this.weaponSprite.dimensions).relativeTo(_this.dude.animation.transform);
                        _this.offsetFromCenter = new point_77.Point(-5, 0);
                        _this._range = _this.weaponSprite.dimensions.y;
                    };
                    return _this;
                }
                SpearWeapon.prototype.update = function (updateData) {
                    if (this.state === State.DRAWING) {
                        this.timeDrawn += updateData.elapsedTimeMillis;
                    }
                    if (!!this.animator) {
                        this.animator.update(updateData.elapsedTimeMillis);
                    }
                    this.animate();
                };
                SpearWeapon.prototype.getRenderMethods = function () {
                    return [this.weaponSprite.toImageRender(this.weaponTransform)];
                };
                SpearWeapon.prototype.getType = function () {
                    return WeaponType_8.WeaponType.SPEAR;
                };
                SpearWeapon.prototype.setDelayBetweenAttacks = function (delayMs) {
                    this.delayBetweenAttacks = delayMs;
                };
                SpearWeapon.prototype.isAttacking = function () {
                    return this.state === State.DRAWING || this.state === State.ATTACKING;
                };
                SpearWeapon.prototype.toggleSheathed = function () {
                    if (this.state === State.SHEATHED) {
                        this.state = State.DRAWN;
                    }
                    else if (this.state === State.DRAWN) {
                        this.state = State.SHEATHED;
                    }
                };
                SpearWeapon.prototype.getRange = function () {
                    return this._range;
                };
                /**
                 * @param newAttack
                 */
                SpearWeapon.prototype.attack = function (newAttack) {
                    var _a;
                    if (this.dude.shield && !((_a = this.dude.shield) === null || _a === void 0 ? void 0 : _a.canAttack())) {
                        return;
                    }
                    if (newAttack && this.state === State.DRAWN) {
                        this.state = State.DRAWING;
                    }
                };
                SpearWeapon.prototype.cancelAttack = function () {
                    var _this = this;
                    if (this.state !== State.DRAWING) {
                        return;
                    }
                    var timeToThrow = 500;
                    if (this.timeDrawn > timeToThrow) {
                        this.dude.inventory.removeItem(100021 /* SPEAR */, 1);
                        this.dude.setWeapon(WeaponType_8.WeaponType.UNARMED);
                        var newTransform = new TileTransform_32.TileTransform(this.weaponTransform.position, this.weaponTransform.dimensions, this.weaponTransform.rotation, this.weaponTransform.mirrorX, this.weaponTransform.mirrorY, this.weaponTransform.depth);
                        Projectile_1.spawnProjectile(newTransform.position.plusY(24), this.weaponSprite, 100021 /* SPEAR */, new point_77.Point(40 * this.dude.facingMultipler(), 4.5), this.dude);
                    }
                    else {
                        this.state = State.ATTACKING;
                        setTimeout(function () { return _this.damageEnemies(); }, 100);
                        this.playAttackAnimation();
                    }
                    this.timeDrawn = 0;
                };
                SpearWeapon.prototype.damageEnemies = function () {
                    var _this = this;
                    if (!this.enabled) {
                        return;
                    }
                    var attackDistance = this.getRange() + 4; // add a tiny buffer for small weapons like the dagger to still work
                    // TODO maybe only allow big weapons to hit multiple targets
                    Weapon_3.Weapon.getEnemiesInRange(this.dude, attackDistance).forEach(function (d) {
                        d.damage(1, d.standingPosition.minus(_this.dude.standingPosition), 30);
                    });
                };
                SpearWeapon.prototype.getBasePosition = function (rotation) {
                    var offset = new point_77.Point(this.dude.animation.transform.dimensions.x / 2 - this.weaponTransform.dimensions.x / 2, this.dude.animation.transform.dimensions.y - this.weaponTransform.dimensions.y).plus(this.offsetFromCenter);
                    if (rotation === 90) {
                        offset = offset.plus(new point_77.Point(10, 10));
                    }
                    return offset.plus(this.dude.getAnimationOffsetPosition());
                };
                SpearWeapon.prototype.animate = function () {
                    var drawSpeed = 100;
                    var pos = point_77.Point.ZERO;
                    var rotation = 0;
                    if (this.state === State.DRAWN) {
                        if (!this.dude.shield || this.dude.shield.canAttack()) {
                            rotation = 90;
                        }
                    }
                    else if (this.state === State.SHEATHED) {
                        // center on back
                        pos = new point_77.Point(3, -2);
                    }
                    else if (this.state === State.DRAWING) {
                        var drawn = Math.floor(this.timeDrawn / -drawSpeed);
                        pos = new point_77.Point(Math.max(drawn, -4), 0);
                        rotation = 90;
                    }
                    else if (this.state === State.ATTACKING) {
                        var posWithRotation = this.getAttackAnimationPosition();
                        pos = posWithRotation[0];
                        rotation = posWithRotation[1];
                    }
                    pos = pos.plus(this.getBasePosition(rotation));
                    this.weaponTransform.rotation = rotation;
                    this.weaponTransform.position = pos;
                    // show sword behind character if sheathed
                    this.weaponTransform.depth = this.state == State.SHEATHED ? -.5 : .5;
                    this.weaponTransform.mirrorY = rotation === 90;
                };
                SpearWeapon.prototype.playAttackAnimation = function () {
                    var _this = this;
                    this.animator = new Animator_5.Animator(Animator_5.Animator.frames(this.frameCount, 40), function (index) { return _this.currentAnimationFrame = index; }, function () {
                        _this.animator = null;
                        // TODO: use delayBetweenAttacks to allow NPCs to use spears
                        _this.state = State.DRAWN; // reset to DRAWN when animation finishes
                    });
                };
                /**
                 * Returns (position, rotation)
                 */
                SpearWeapon.prototype.getAttackAnimationPosition = function () {
                    if (this.currentAnimationFrame >= this.frameCount - 1) {
                        return [new point_77.Point(2, 0), 90];
                    }
                    else {
                        var x = [8, 14, 16, 12, 8][this.currentAnimationFrame];
                        return [new point_77.Point(x, 0), 90];
                    }
                };
                return SpearWeapon;
            }(Weapon_3.Weapon));
            exports_136("SpearWeapon", SpearWeapon);
        }
    };
});
System.register("game/characters/weapons/WeaponFactory", ["game/characters/weapons/WeaponType", "game/characters/weapons/UnarmedWeapon", "game/characters/weapons/MeleeWeapon", "engine/point", "game/characters/weapons/SpearWeapon"], function (exports_137, context_137) {
    "use strict";
    var WeaponType_9, UnarmedWeapon_1, MeleeWeapon_1, point_78, SpearWeapon_1, WeaponFactory;
    var __moduleName = context_137 && context_137.id;
    return {
        setters: [
            function (WeaponType_9_1) {
                WeaponType_9 = WeaponType_9_1;
            },
            function (UnarmedWeapon_1_1) {
                UnarmedWeapon_1 = UnarmedWeapon_1_1;
            },
            function (MeleeWeapon_1_1) {
                MeleeWeapon_1 = MeleeWeapon_1_1;
            },
            function (point_78_1) {
                point_78 = point_78_1;
            },
            function (SpearWeapon_1_1) {
                SpearWeapon_1 = SpearWeapon_1_1;
            }
        ],
        execute: function () {
            exports_137("WeaponFactory", WeaponFactory = {
                // TODO support additional weapons
                make: function (type) {
                    switch (type) {
                        case WeaponType_9.WeaponType.NONE:
                            return null;
                        case WeaponType_9.WeaponType.UNARMED:
                            return new UnarmedWeapon_1.UnarmedWeapon();
                        case WeaponType_9.WeaponType.SWORD:
                            return new MeleeWeapon_1.MeleeWeapon(WeaponType_9.WeaponType.SWORD, "weapon_regular_sword", new point_78.Point(-6, -2));
                        case WeaponType_9.WeaponType.CLUB:
                            return new MeleeWeapon_1.MeleeWeapon(WeaponType_9.WeaponType.CLUB, "weapon_baton_with_spikes", new point_78.Point(-6, -2));
                        case WeaponType_9.WeaponType.PICKAXE:
                            return new MeleeWeapon_1.MeleeWeapon(WeaponType_9.WeaponType.PICKAXE, "weapon_pickaxe", new point_78.Point(-5, -2));
                        case WeaponType_9.WeaponType.AXE:
                            return new MeleeWeapon_1.MeleeWeapon(WeaponType_9.WeaponType.AXE, "weapon_axe", new point_78.Point(-3, -1));
                        case WeaponType_9.WeaponType.SPEAR:
                            return new SpearWeapon_1.SpearWeapon();
                        default:
                            throw new Error("weapon type " + type + " is not supported yet");
                    }
                }
            });
        }
    };
});
System.register("game/characters/Dude", ["engine/collision/BoxCollider", "engine/component", "engine/point", "engine/tiles/AnimatedTileComponent", "engine/tiles/TileTransform", "game/graphics/ImageFilters", "game/graphics/Tilesets", "game/items/Items", "game/ui/DialogueDisplay", "game/ui/DudeInteractIndicator", "game/ui/UIStateManager", "game/world/elements/Interactable", "game/characters/Dialogue", "game/characters/DudeAnimationUtils", "game/characters/NPC", "game/characters/weapons/Shield", "game/characters/weapons/WeaponFactory", "game/characters/weapons/WeaponType"], function (exports_138, context_138) {
    "use strict";
    var BoxCollider_11, component_43, point_79, AnimatedTileComponent_6, TileTransform_33, ImageFilters_5, Tilesets_47, Items_8, DialogueDisplay_5, DudeInteractIndicator_5, UIStateManager_19, Interactable_7, Dialogue_7, DudeAnimationUtils_1, NPC_7, Shield_1, WeaponFactory_1, WeaponType_10, Dude;
    var __moduleName = context_138 && context_138.id;
    return {
        setters: [
            function (BoxCollider_11_1) {
                BoxCollider_11 = BoxCollider_11_1;
            },
            function (component_43_1) {
                component_43 = component_43_1;
            },
            function (point_79_1) {
                point_79 = point_79_1;
            },
            function (AnimatedTileComponent_6_1) {
                AnimatedTileComponent_6 = AnimatedTileComponent_6_1;
            },
            function (TileTransform_33_1) {
                TileTransform_33 = TileTransform_33_1;
            },
            function (ImageFilters_5_1) {
                ImageFilters_5 = ImageFilters_5_1;
            },
            function (Tilesets_47_1) {
                Tilesets_47 = Tilesets_47_1;
            },
            function (Items_8_1) {
                Items_8 = Items_8_1;
            },
            function (DialogueDisplay_5_1) {
                DialogueDisplay_5 = DialogueDisplay_5_1;
            },
            function (DudeInteractIndicator_5_1) {
                DudeInteractIndicator_5 = DudeInteractIndicator_5_1;
            },
            function (UIStateManager_19_1) {
                UIStateManager_19 = UIStateManager_19_1;
            },
            function (Interactable_7_1) {
                Interactable_7 = Interactable_7_1;
            },
            function (Dialogue_7_1) {
                Dialogue_7 = Dialogue_7_1;
            },
            function (DudeAnimationUtils_1_1) {
                DudeAnimationUtils_1 = DudeAnimationUtils_1_1;
            },
            function (NPC_7_1) {
                NPC_7 = NPC_7_1;
            },
            function (Shield_1_1) {
                Shield_1 = Shield_1_1;
            },
            function (WeaponFactory_1_1) {
                WeaponFactory_1 = WeaponFactory_1_1;
            },
            function (WeaponType_10_1) {
                WeaponType_10 = WeaponType_10_1;
            }
        ],
        execute: function () {
            Dude = /** @class */ (function (_super) {
                __extends(Dude, _super);
                function Dude(uuid, type, factions, characterAnimName, position, weaponType, shieldId, maxHealth, health, speed, inventory, dialogue, blob) {
                    var _this = _super.call(this) || this;
                    _this.relativeColliderPos = new point_79.Point(3, 15);
                    _this.droppedItemSupplier = function () { return 0 /* COIN */; };
                    _this.knockIntervalCallback = 0;
                    _this.isRolling = false;
                    _this.canRoll = true;
                    _this.uuid = uuid;
                    _this.type = type;
                    _this.factions = factions;
                    _this._position = position;
                    _this.shieldId = shieldId;
                    _this.maxHealth = maxHealth;
                    _this._health = health;
                    _this.speed = speed;
                    _this.inventory = inventory;
                    _this.dialogue = dialogue;
                    _this.blob = blob;
                    _this.awake = function () {
                        // Set up animations
                        _this.characterAnimName = characterAnimName;
                        var idleAnim = DudeAnimationUtils_1.DudeAnimationUtils.getCharacterIdleAnimation(characterAnimName, blob);
                        var runAnim = DudeAnimationUtils_1.DudeAnimationUtils.getCharacterWalkAnimation(characterAnimName, blob);
                        var height = idleAnim.getTile(0).dimensions.y;
                        _this._animation = _this.entity.addComponent(new AnimatedTileComponent_6.AnimatedTileComponent([idleAnim, runAnim], new TileTransform_33.TileTransform(new point_79.Point(0, 28 - height))));
                        _this._animation.fastForward(Math.random() * 1000); // so not all the animations sync up
                        _this.setWeapon(weaponType);
                        if (!!shieldId) {
                            _this._shield = _this.entity.addComponent(new Shield_1.Shield(shieldId));
                        }
                        // Set up collider
                        // TODO: Add collider size options for tiny and large enemies
                        var colliderSize = new point_79.Point(10, 8);
                        _this.relativeColliderPos = new point_79.Point(_this.animation.transform.dimensions.x / 2 - colliderSize.x / 2, _this.animation.transform.dimensions.y - colliderSize.y);
                        _this.collider = _this.entity.addComponent(new BoxCollider_11.BoxCollider(_this.position.plus(_this.relativeColliderPos), colliderSize, _this.type === 0 /* PLAYER */ ? Dude.PLAYER_COLLISION_LAYER : Dude.NPC_COLLISION_LAYER));
                        _this.dialogueInteract = _this.entity.addComponent(new Interactable_7.Interactable(new point_79.Point(0, 0), function () { return DialogueDisplay_5.DialogueDisplay.instance.startDialogue(_this); }, point_79.Point.ZERO, function () { var _a; return !UIStateManager_19.UIStateManager.instance.isMenuOpen && !!_this.dialogue && ((_a = _this.entity.getComponent(NPC_7.NPC)) === null || _a === void 0 ? void 0 : _a.canTalk()); }));
                    };
                    return _this;
                }
                Object.defineProperty(Dude.prototype, "health", {
                    get: function () { return this._health; },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Dude.prototype, "animation", {
                    get: function () { return this._animation; },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Dude.prototype, "weapon", {
                    get: function () { return this._weapon; },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Dude.prototype, "weaponType", {
                    get: function () { var _a, _b; return (_b = (_a = this.weapon) === null || _a === void 0 ? void 0 : _a.getType()) !== null && _b !== void 0 ? _b : WeaponType_10.WeaponType.NONE; },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Dude.prototype, "shield", {
                    get: function () { return this._shield; },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Dude.prototype, "position", {
                    get: function () {
                        return this._position;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Dude.prototype, "standingPosition", {
                    // bottom center of the tile
                    get: function () {
                        return this.position.plus(new point_79.Point(this.animation.transform.dimensions.x / 2, this.animation.transform.dimensions.y));
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Dude.prototype, "isMoving", {
                    get: function () {
                        return this._isMoving;
                    },
                    enumerable: false,
                    configurable: true
                });
                Dude.prototype.update = function (updateData) {
                    this.animation.transform.depth = this.collider.position.y + this.collider.dimensions.y;
                    // All other transforms (eg the weapon) are positioned relative to the animation
                    this.animation.transform.position = this.position;
                    if (!this.isAlive) {
                        this.animation.transform.position = this.animation.transform.position.plus(this.deathOffset);
                    }
                    else if (this.isRolling && this.animation.transform.rotation !== 0) {
                        this.animation.transform.position = this.animation.transform.position.plus(this.rollingOffset);
                    }
                    if (!!this.dialogueInteract) {
                        this.dialogueInteract.position = this.standingPosition.minus(new point_79.Point(0, 5));
                        this.dialogueInteract.uiOffset = new point_79.Point(0, -Tilesets_47.TILE_SIZE * 1.5).plus(this.getAnimationOffsetPosition());
                        this.dialogueInteract.enabled = this.dialogue !== Dialogue_7.EMPTY_DIALOGUE && DialogueDisplay_5.DialogueDisplay.instance.dialogueSource !== this;
                    }
                };
                Dude.prototype.setWeapon = function (type) {
                    if (!!this.weapon) {
                        this.entity.removeComponent(this.weapon);
                    }
                    this._weapon = WeaponFactory_1.WeaponFactory.make(type);
                    if (!!this._weapon) {
                        this.entity.addComponent(this._weapon);
                    }
                };
                Object.defineProperty(Dude.prototype, "isAlive", {
                    get: function () { return this._health > 0; },
                    enumerable: false,
                    configurable: true
                });
                Dude.prototype.damage = function (damage, direction, knockback) {
                    var _a;
                    if (this.rolling()) {
                        return;
                    }
                    // absorb damage if facing the direction of the enemy
                    var blocked = ((_a = this.shield) === null || _a === void 0 ? void 0 : _a.isBlocking()) && !this.isFacing(this.standingPosition.plus(direction));
                    if (blocked) {
                        damage *= .25;
                        knockback *= .4;
                    }
                    if (this.isAlive) {
                        this._health -= damage;
                        if (!this.isAlive) {
                            this.die(direction);
                            knockback *= (1 + Math.random());
                        }
                    }
                    this.knockback(direction, knockback);
                    if (!!this.onDamageCallback) {
                        this.onDamageCallback(blocked);
                    }
                };
                Dude.prototype.setOnDamageCallback = function (fn) {
                    this.onDamageCallback = fn;
                };
                Dude.prototype.die = function (direction) {
                    var _this = this;
                    if (direction === void 0) { direction = new point_79.Point(-1, 0); }
                    this._health = 0;
                    var prePos = this.animation.transform.position;
                    this.animation.transform.rotate(90 * (direction.x >= 0 ? 1 : -1), this.standingPosition.minus(new point_79.Point(0, 5)));
                    this.deathOffset = this.animation.transform.position.minus(prePos);
                    this.animation.goToAnimation(0);
                    this.animation.pause();
                    setTimeout(function () { return Items_8.spawnItem(_this.standingPosition.minus(new point_79.Point(0, 2)), _this.droppedItemSupplier()); }, 100);
                    this.dropWeapon();
                    setTimeout(function () { return _this.dissolve(); }, 1000);
                };
                // TODO maybe use this for demons in sunlight
                Dude.prototype.dissolve = function () {
                    var _this = this;
                    this.collider.enabled = false;
                    var dissolveChance = .1;
                    var interval = setInterval(function () {
                        _this.animation.applyFilter(ImageFilters_5.ImageFilters.dissolve(function () { return dissolveChance; }));
                        _this.animation.goToAnimation(0); // refresh even though it's paused
                        if (dissolveChance >= 1) {
                            _this.entity.selfDestruct();
                            clearInterval(interval);
                        }
                        dissolveChance *= 2;
                    }, 200);
                };
                Dude.prototype.dropWeapon = function () {
                    // TODO
                };
                Dude.prototype.knockback = function (direction, knockback) {
                    var _this = this;
                    if (this.knockIntervalCallback !== 0) {
                        window.cancelAnimationFrame(this.knockIntervalCallback);
                    }
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
                            _this.knockIntervalCallback = 0;
                        }
                        else {
                            _this.knockIntervalCallback = requestAnimationFrame(knock);
                        }
                        last = now;
                    };
                    this.knockIntervalCallback = requestAnimationFrame(knock);
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
                Dude.prototype.move = function (updateData, direction, facingOverride, speedMultiplier, maxDistance) {
                    if (facingOverride === void 0) { facingOverride = 0; }
                    if (speedMultiplier === void 0) { speedMultiplier = 1; }
                    if (maxDistance === void 0) { maxDistance = Number.MAX_SAFE_INTEGER; }
                    if (this._health <= 0) {
                        return;
                    }
                    if (this.knockIntervalCallback !== 0) { // being knocked back, don't let em walk
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
                            this.animation.goToAnimation(1); // TODO make the run animation backwards if they run backwards :)
                        }
                        var translation = direction.normalized();
                        // this.lerpedLastMoveDir = this.lerpedLastMoveDir.lerp(0.25, translation)
                        var distance = Math.min(updateData.elapsedTimeMillis * this.speed * speedMultiplier, maxDistance);
                        var newPos = this._position.plus(translation.times(distance));
                        this.moveTo(newPos);
                    }
                    else if (wasMoving) {
                        this.animation.goToAnimation(0);
                    }
                };
                /**
                 * @param point World point where the dude will be moved, unless they hit a collider (with skipColliderCheck = false)
                 */
                Dude.prototype.moveTo = function (point, skipColliderCheck) {
                    var _this = this;
                    if (skipColliderCheck === void 0) { skipColliderCheck = false; }
                    var moveFn = skipColliderCheck
                        ? function (pos) { return _this.collider.forceSetPosition(pos); }
                        : function (pos) { return _this.collider.moveTo(pos); };
                    this._position = moveFn(point.plus(this.relativeColliderPos)).minus(this.relativeColliderPos);
                };
                Dude.prototype.roll = function () {
                    var _this = this;
                    if (!this.canRoll) {
                        return;
                    }
                    var setRotation = function (rot, offset) {
                        if (_this.animation.transform.mirrorX) {
                            _this.animation.transform.rotation = -rot;
                            _this.rollingOffset = new point_79.Point(-offset.x, offset.y);
                        }
                        else {
                            _this.animation.transform.rotation = rot;
                            _this.rollingOffset = offset;
                        }
                    };
                    var speed = 80;
                    this.isRolling = true;
                    this.canRoll = false;
                    setRotation(90, new point_79.Point(6, 8));
                    setTimeout(function () { return setRotation(180, new point_79.Point(0, 14)); }, speed);
                    setTimeout(function () { return setRotation(270, new point_79.Point(-6, 8)); }, speed * 2);
                    setTimeout(function () {
                        setRotation(0, point_79.Point.ZERO);
                        _this.isRolling = false;
                    }, speed * 3);
                    setTimeout(function () { return _this.canRoll = true; }, 750);
                };
                Dude.prototype.rolling = function () {
                    return this.isRolling;
                };
                /**
                 * Returns true if these dudes have no factions in common
                 */
                Dude.prototype.isEnemy = function (d) {
                    var _this = this;
                    return !d.factions.some(function (fac) { return _this.factions.includes(fac); });
                };
                Dude.prototype.isFacing = function (pt) {
                    if (pt.x === this.standingPosition.x) {
                        return true;
                    }
                    return this.animation.transform.mirrorX === (pt.x < this.standingPosition.x);
                };
                Dude.prototype.facingMultipler = function () {
                    return this.animation.transform.mirrorX ? -1 : 1;
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
                    return new point_79.Point(0, arr[f]);
                };
                Dude.prototype.save = function () {
                    return {
                        uuid: this.uuid,
                        type: this.type,
                        pos: this.position.toString(),
                        anim: this.characterAnimName,
                        maxHealth: this.maxHealth,
                        health: this._health,
                        speed: this.speed,
                        weapon: this.weaponType,
                        shield: this.shieldId,
                        inventory: this.inventory.save(),
                        dialogue: this.dialogue,
                        blob: this.blob,
                    };
                };
                Dude.prototype.getRenderMethods = function () {
                    return this.getIndicator();
                };
                Dude.prototype.delete = function () {
                    this.location.dudes.delete(this);
                    _super.prototype.delete.call(this);
                };
                Dude.prototype.getIndicator = function () {
                    var _a;
                    var indicator = DudeInteractIndicator_5.DudeInteractIndicator.NONE;
                    if (!!this.dialogue && this.dialogue != Dialogue_7.EMPTY_DIALOGUE) {
                        indicator = Dialogue_7.getDialogue(this.dialogue).indicator;
                    }
                    var tile = DudeInteractIndicator_5.DudeInteractIndicator.getTile(indicator);
                    if (!tile || ((_a = this.dialogueInteract) === null || _a === void 0 ? void 0 : _a.isShowingUI) || DialogueDisplay_5.DialogueDisplay.instance.dialogueSource === this) {
                        return [];
                    }
                    else {
                        return [tile.toImageRender(new TileTransform_33.TileTransform(this.standingPosition.plusY(-28).plus(new point_79.Point(1, 1).times(-Tilesets_47.TILE_SIZE / 2)).plus(this.getAnimationOffsetPosition()), new point_79.Point(Tilesets_47.TILE_SIZE, Tilesets_47.TILE_SIZE), 0, false, false, UIStateManager_19.UIStateManager.UI_SPRITE_DEPTH))];
                    }
                };
                Dude.PLAYER_COLLISION_LAYER = "playa";
                Dude.NPC_COLLISION_LAYER = "npc";
                return Dude;
            }(component_43.Component));
            exports_138("Dude", Dude);
        }
    };
});
System.register("game/cutscenes/IntroCutscene", ["engine/component", "game/cutscenes/CutscenePlayerController", "game/characters/Player", "engine/point", "game/cutscenes/Camera", "game/cutscenes/CutsceneManager", "game/world/LocationManager", "game/ui/ControlsUI", "game/characters/dialogues/DipIntro"], function (exports_139, context_139) {
    "use strict";
    var component_44, CutscenePlayerController_2, Player_18, point_80, Camera_12, CutsceneManager_2, LocationManager_28, ControlsUI_2, DipIntro_3, IntroCutscene;
    var __moduleName = context_139 && context_139.id;
    return {
        setters: [
            function (component_44_1) {
                component_44 = component_44_1;
            },
            function (CutscenePlayerController_2_1) {
                CutscenePlayerController_2 = CutscenePlayerController_2_1;
            },
            function (Player_18_1) {
                Player_18 = Player_18_1;
            },
            function (point_80_1) {
                point_80 = point_80_1;
            },
            function (Camera_12_1) {
                Camera_12 = Camera_12_1;
            },
            function (CutsceneManager_2_1) {
                CutsceneManager_2 = CutsceneManager_2_1;
            },
            function (LocationManager_28_1) {
                LocationManager_28 = LocationManager_28_1;
            },
            function (ControlsUI_2_1) {
                ControlsUI_2 = ControlsUI_2_1;
            },
            function (DipIntro_3_1) {
                DipIntro_3 = DipIntro_3_1;
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
                    CutscenePlayerController_2.CutscenePlayerController.instance.startMoving(new point_80.Point(-1, 0));
                    this.dip = Array.from(LocationManager_28.LocationManager.instance.currentLocation.dudes).filter(function (d) { return d.type === 1 /* DIP */; })[0];
                    setTimeout(function () {
                        CutscenePlayerController_2.CutscenePlayerController.instance.stopMoving();
                    }, this.STOP_WALKING_IN);
                    setTimeout(function () {
                        Camera_12.Camera.instance.focusOnPoint(_this.dip.standingPosition);
                        CutscenePlayerController_2.CutscenePlayerController.instance.disable();
                    }, this.PAN_TO_DIP);
                    setTimeout(function () {
                        _this.showControls = true;
                        Camera_12.Camera.instance.focusOnDude(Player_18.Player.instance.dude);
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
                        this.orcs = Array.from(LocationManager_28.LocationManager.instance.currentLocation.dudes).filter(function (d) { return d.factions.includes(1 /* ORCS */); });
                    }
                    // TODO prevent the player from going to a different location until this is over
                    if (!this.orcs.some(function (o) { return o.isAlive; })) {
                        this.dip.dialogue = DipIntro_3.DIP_STARTING_DIALOGUE;
                        CutsceneManager_2.CutsceneManager.instance.finishCutscene();
                    }
                };
                IntroCutscene.prototype.getRenderMethods = function () {
                    if (this.showControls) {
                        return ControlsUI_2.makeControlsUI(Camera_12.Camera.instance.dimensions, Camera_12.Camera.instance.position);
                    }
                    return [];
                };
                return IntroCutscene;
            }(component_44.Component));
            exports_139("IntroCutscene", IntroCutscene);
        }
    };
});
System.register("game/scenes/GameScene", ["engine/collision/CollisionEngine", "engine/point", "game/characters/Dude", "game/characters/DudeFactory", "game/cutscenes/Camera", "game/cutscenes/CutsceneManager", "game/cutscenes/IntroCutscene", "game/graphics/Tilesets", "game/items/DroppedItem", "game/SaveManager", "game/ui/UIStateManager", "game/world/GroundRenderer", "game/world/LocationManager", "game/world/MapGenerator", "game/world/OutdoorDarknessMask", "game/world/TimeUnit", "game/world/WorldTime", "game/world/events/EventQueue", "game/world/events/QueuedEvent", "game/characters/NPC", "engine/renderer/BasicRenderComponent", "game/characters/Player", "engine/renderer/LineRender", "engine/Entity", "engine/debug", "game/world/Barrier"], function (exports_140, context_140) {
    "use strict";
    var CollisionEngine_5, point_81, Dude_11, DudeFactory_6, Camera_13, CutsceneManager_3, IntroCutscene_1, Tilesets_48, DroppedItem_3, SaveManager_9, UIStateManager_20, GroundRenderer_2, LocationManager_29, MapGenerator_6, OutdoorDarknessMask_5, TimeUnit_8, WorldTime_10, EventQueue_6, QueuedEvent_4, NPC_8, BasicRenderComponent_9, Player_19, LineRender_2, Entity_32, debug_4, Barrier_3, ZOOM, GameScene;
    var __moduleName = context_140 && context_140.id;
    return {
        setters: [
            function (CollisionEngine_5_1) {
                CollisionEngine_5 = CollisionEngine_5_1;
            },
            function (point_81_1) {
                point_81 = point_81_1;
            },
            function (Dude_11_1) {
                Dude_11 = Dude_11_1;
            },
            function (DudeFactory_6_1) {
                DudeFactory_6 = DudeFactory_6_1;
            },
            function (Camera_13_1) {
                Camera_13 = Camera_13_1;
            },
            function (CutsceneManager_3_1) {
                CutsceneManager_3 = CutsceneManager_3_1;
            },
            function (IntroCutscene_1_1) {
                IntroCutscene_1 = IntroCutscene_1_1;
            },
            function (Tilesets_48_1) {
                Tilesets_48 = Tilesets_48_1;
            },
            function (DroppedItem_3_1) {
                DroppedItem_3 = DroppedItem_3_1;
            },
            function (SaveManager_9_1) {
                SaveManager_9 = SaveManager_9_1;
            },
            function (UIStateManager_20_1) {
                UIStateManager_20 = UIStateManager_20_1;
            },
            function (GroundRenderer_2_1) {
                GroundRenderer_2 = GroundRenderer_2_1;
            },
            function (LocationManager_29_1) {
                LocationManager_29 = LocationManager_29_1;
            },
            function (MapGenerator_6_1) {
                MapGenerator_6 = MapGenerator_6_1;
            },
            function (OutdoorDarknessMask_5_1) {
                OutdoorDarknessMask_5 = OutdoorDarknessMask_5_1;
            },
            function (TimeUnit_8_1) {
                TimeUnit_8 = TimeUnit_8_1;
            },
            function (WorldTime_10_1) {
                WorldTime_10 = WorldTime_10_1;
            },
            function (EventQueue_6_1) {
                EventQueue_6 = EventQueue_6_1;
            },
            function (QueuedEvent_4_1) {
                QueuedEvent_4 = QueuedEvent_4_1;
            },
            function (NPC_8_1) {
                NPC_8 = NPC_8_1;
            },
            function (BasicRenderComponent_9_1) {
                BasicRenderComponent_9 = BasicRenderComponent_9_1;
            },
            function (Player_19_1) {
                Player_19 = Player_19_1;
            },
            function (LineRender_2_1) {
                LineRender_2 = LineRender_2_1;
            },
            function (Entity_32_1) {
                Entity_32 = Entity_32_1;
            },
            function (debug_4_1) {
                debug_4 = debug_4_1;
            },
            function (Barrier_3_1) {
                Barrier_3 = Barrier_3_1;
            }
        ],
        execute: function () {
            ZOOM = 3;
            GameScene = /** @class */ (function () {
                function GameScene() {
                }
                GameScene.prototype.initialize = function () {
                    CollisionEngine_5.collisionEngine.setCollisionMatrix(new Map([
                        [CollisionEngine_5.CollisionEngine.DEFAULT_LAYER, [DroppedItem_3.DroppedItem.COLLISION_LAYER, Dude_11.Dude.PLAYER_COLLISION_LAYER, Dude_11.Dude.NPC_COLLISION_LAYER]],
                        [Dude_11.Dude.PLAYER_COLLISION_LAYER, [Dude_11.Dude.NPC_COLLISION_LAYER]],
                        [Barrier_3.Barrier.PLAYER_ONLY, [Dude_11.Dude.PLAYER_COLLISION_LAYER]]
                    ]));
                };
                GameScene.prototype.continueGame = function () {
                    // Wait to initialize since it will begin a coroutine
                    OutdoorDarknessMask_5.OutdoorDarknessMask.instance.start();
                    SaveManager_9.saveManager.load();
                };
                GameScene.prototype.newGame = function () {
                    SaveManager_9.saveManager.deleteSave();
                    // Wait to initialize since it will begin a coroutine
                    OutdoorDarknessMask_5.OutdoorDarknessMask.instance.start();
                    WorldTime_10.WorldTime.instance.initialize(TimeUnit_8.TimeUnit.HOUR * 19.5);
                    // World must be initialized before we do anything else
                    MapGenerator_6.MapGenerator.instance.generateExterior();
                    var playerStartPos = MapGenerator_6.MapGenerator.ENTER_LAND_POS;
                    var playerDude = DudeFactory_6.DudeFactory.instance.new(0 /* PLAYER */, playerStartPos);
                    Camera_13.Camera.instance.focusOnDude(playerDude);
                    DudeFactory_6.DudeFactory.instance.new(1 /* DIP */, point_81.Point.ZERO);
                    DudeFactory_6.DudeFactory.instance.new(3 /* ORC_WARRIOR */, new point_81.Point(3, 1).times(Tilesets_48.TILE_SIZE));
                    DudeFactory_6.DudeFactory.instance.new(3 /* ORC_WARRIOR */, new point_81.Point(-1, 3).times(Tilesets_48.TILE_SIZE));
                    DudeFactory_6.DudeFactory.instance.new(3 /* ORC_WARRIOR */, new point_81.Point(-4, 0).times(Tilesets_48.TILE_SIZE));
                    // TODO clean up obstacles (trees, rocks, etc) so intro goes smoothly
                    CutsceneManager_3.CutsceneManager.instance.startCutscene(new IntroCutscene_1.IntroCutscene());
                    EventQueue_6.EventQueue.instance.addEvent({
                        type: QueuedEvent_4.QueuedEventType.SIMULATE_NPCS,
                        time: WorldTime_10.WorldTime.instance.time + NPC_8.NPC.SCHEDULE_FREQUENCY
                    });
                };
                GameScene.prototype.getViews = function (updateViewsContext) {
                    this.updateViews(updateViewsContext);
                    return [
                        this.gameEntityView,
                        this.uiView
                    ];
                };
                GameScene.prototype.updateViews = function (updateViewsContext) {
                    var dimensions = updateViewsContext.dimensions.div(ZOOM);
                    var cameraOffset = Camera_13.Camera.instance.getUpdatedPosition(dimensions, updateViewsContext.elapsedTimeMillis);
                    this.gameEntityView = {
                        zoom: ZOOM,
                        offset: cameraOffset,
                        entities: LocationManager_29.LocationManager.instance.currentLocation.getEntities()
                            .concat(OutdoorDarknessMask_5.OutdoorDarknessMask.instance.getEntities())
                            .concat([
                            CutsceneManager_3.CutsceneManager.instance.getEntity(),
                            WorldTime_10.WorldTime.instance.getEntity(),
                            GroundRenderer_2.GroundRenderer.instance.getEntity(),
                            this.getDebugEntity()
                        ])
                    };
                    this.uiView = {
                        zoom: ZOOM,
                        offset: point_81.Point.ZERO,
                        entities: UIStateManager_20.UIStateManager.instance.get(dimensions, updateViewsContext.elapsedTimeMillis)
                    };
                };
                GameScene.prototype.getDebugEntity = function () {
                    var _a;
                    if (!((_a = Player_19.Player.instance) === null || _a === void 0 ? void 0 : _a.dude) || !debug_4.debug.showGrid) {
                        return;
                    }
                    var base = Tilesets_48.pixelPtToTilePt(Player_19.Player.instance.dude.standingPosition);
                    var lines = [];
                    var gridRange = 50;
                    // vertical lines
                    for (var i = -gridRange; i < gridRange; i++) {
                        var top_2 = base.times(Tilesets_48.TILE_SIZE).plusX(i * Tilesets_48.TILE_SIZE).plusY(-gridRange * Tilesets_48.TILE_SIZE);
                        lines.push(new LineRender_2.LineRender(top_2, top_2.plusY(2 * gridRange * Tilesets_48.TILE_SIZE)));
                    }
                    // horizontal lines
                    for (var i = -gridRange; i < gridRange; i++) {
                        var left = base.times(Tilesets_48.TILE_SIZE).plusX(-gridRange * Tilesets_48.TILE_SIZE).plusY(i * Tilesets_48.TILE_SIZE);
                        lines.push(new LineRender_2.LineRender(left, left.plusX(2 * gridRange * Tilesets_48.TILE_SIZE)));
                    }
                    return new Entity_32.Entity([new (BasicRenderComponent_9.BasicRenderComponent.bind.apply(BasicRenderComponent_9.BasicRenderComponent, __spreadArrays([void 0], lines)))()]);
                };
                return GameScene;
            }());
            exports_140("GameScene", GameScene);
        }
    };
});
System.register("game/ui/MainMenuButton", ["engine/component", "engine/point", "engine/renderer/TextRender", "engine/util/utils", "game/graphics/Tilesets", "game/ui/Text", "game/ui/UIStateManager"], function (exports_141, context_141) {
    "use strict";
    var component_45, point_82, TextRender_9, utils_8, Tilesets_49, Text_11, UIStateManager_21, MainMenuButton;
    var __moduleName = context_141 && context_141.id;
    return {
        setters: [
            function (component_45_1) {
                component_45 = component_45_1;
            },
            function (point_82_1) {
                point_82 = point_82_1;
            },
            function (TextRender_9_1) {
                TextRender_9 = TextRender_9_1;
            },
            function (utils_8_1) {
                utils_8 = utils_8_1;
            },
            function (Tilesets_49_1) {
                Tilesets_49 = Tilesets_49_1;
            },
            function (Text_11_1) {
                Text_11 = Text_11_1;
            },
            function (UIStateManager_21_1) {
                UIStateManager_21 = UIStateManager_21_1;
            }
        ],
        execute: function () {
            MainMenuButton = /** @class */ (function (_super) {
                __extends(MainMenuButton, _super);
                function MainMenuButton(position, text, onClick) {
                    var _this = _super.call(this) || this;
                    _this.width = 500;
                    _this.position = position.apply(Math.floor);
                    _this.text = text;
                    _this.onClick = onClick;
                    return _this;
                }
                MainMenuButton.prototype.update = function (updateData) {
                    this.hovering = utils_8.rectContains(this.position.plusX(-this.width / 2).plusY(-4), new point_82.Point(this.width, Tilesets_49.TILE_SIZE), updateData.input.mousePos);
                    if (this.hovering && updateData.input.isMouseDown) {
                        this.onClick();
                    }
                };
                MainMenuButton.prototype.getRenderMethods = function () {
                    if (this.text === null) {
                        return [];
                    }
                    var text = this.hovering
                        ? "> " + this.text + "  "
                        : "  " + this.text + "  ";
                    var offset = Math.floor((this.width - text.length * Text_11.TEXT_PIXEL_WIDTH) / 2);
                    return [new TextRender_9.TextRender(text.toUpperCase(), this.position.plusX(-this.width / 2).plusX(offset), Text_11.TEXT_SIZE, Text_11.TEXT_FONT, this.hovering ? "#fdf7ed" /* WHITE */ : "#417089" /* DARK_BLUE */, UIStateManager_21.UIStateManager.UI_SPRITE_DEPTH)];
                };
                return MainMenuButton;
            }(component_45.Component));
            exports_141("MainMenuButton", MainMenuButton);
        }
    };
});
System.register("engine/renderer/RectRender", ["engine/point", "engine/renderer/RenderMethod"], function (exports_142, context_142) {
    "use strict";
    var point_83, RenderMethod_4, RectRender;
    var __moduleName = context_142 && context_142.id;
    return {
        setters: [
            function (point_83_1) {
                point_83 = point_83_1;
            },
            function (RenderMethod_4_1) {
                RenderMethod_4 = RenderMethod_4_1;
            }
        ],
        execute: function () {
            RectRender = /** @class */ (function (_super) {
                __extends(RectRender, _super);
                function RectRender(_a) {
                    var _b = _a === void 0 ? {} : _a, _c = _b.depth, depth = _c === void 0 ? 0 : _c, _d = _b.position, position = _d === void 0 ? point_83.Point.ZERO : _d, _e = _b.dimensions, dimensions = _e === void 0 ? point_83.Point.ZERO : _e, _f = _b.color, color = _f === void 0 ? "#ff0000" : _f;
                    var _this = _super.call(this, depth) || this;
                    _this.position = position;
                    _this.dimensions = dimensions;
                    _this.color = color;
                    return _this;
                }
                RectRender.prototype.render = function (context) {
                    context.fillStyle = this.color;
                    context.fillRect(this.position, this.dimensions);
                };
                return RectRender;
            }(RenderMethod_4.RenderMethod));
            exports_142("RectRender", RectRender);
        }
    };
});
System.register("game/ui/PlumePicker", ["engine/component", "engine/Entity", "engine/point", "engine/renderer/RectRender", "engine/util/utils", "game/graphics/Tilesets", "game/SaveManager"], function (exports_143, context_143) {
    "use strict";
    var component_46, Entity_33, point_84, RectRender_1, utils_9, Tilesets_50, SaveManager_10, CUSTOMIZATION_OPTIONS, PlumePicker;
    var __moduleName = context_143 && context_143.id;
    return {
        setters: [
            function (component_46_1) {
                component_46 = component_46_1;
            },
            function (Entity_33_1) {
                Entity_33 = Entity_33_1;
            },
            function (point_84_1) {
                point_84 = point_84_1;
            },
            function (RectRender_1_1) {
                RectRender_1 = RectRender_1_1;
            },
            function (utils_9_1) {
                utils_9 = utils_9_1;
            },
            function (Tilesets_50_1) {
                Tilesets_50 = Tilesets_50_1;
            },
            function (SaveManager_10_1) {
                SaveManager_10 = SaveManager_10_1;
            }
        ],
        execute: function () {
            // array of [dark, light] pairs
            CUSTOMIZATION_OPTIONS = [
                ["#5f2d56" /* DARK_DARK_PINK */, "#993970" /* DARK_PINK */],
                ["#993970" /* DARK_PINK */, "#dc4a7b" /* PINK */],
                ["#dc4a7b" /* PINK */, "#f78697" /* LIGHT_PINK */],
                ["#62232f" /* DARK_RED */, "#9f294e" /* RED */],
                ["#8f4029" /* DARK_ORANGE */, "#c56025" /* ORANGE */],
                ["#c56025" /* ORANGE */, "#ee8e2e" /* LIGHT_ORANGE */],
                ["#ee8e2e" /* LIGHT_ORANGE */, "#facb3e" /* YELLOW */],
                ["#4ba747" /* GREEN */, "#97da3f" /* LIME */],
                ["#3d734f" /* DARK_GREEN */, "#4ba747" /* GREEN */],
                ["#314152" /* DARK_DARK_BLUE */, "#417089" /* DARK_BLUE */],
                ["#417089" /* DARK_BLUE */, "#5698cc" /* LIGHT_BLUE */],
                ["#49a790" /* TEAL */, "#72d6ce" /* BRIGHT_BLUE */],
                ["#473579" /* DARK_PURPLE */, "#5956bd" /* PURPLE */],
                ["#8156aa" /* DARK_PINKLE */, "#c278d0" /* PINKLE */],
                ["#c278d0" /* PINKLE */, "#f0b3dd" /* LIGHT_PINKLE */],
                ["#aa8d7a" /* LIGHT_BROWN */, "#d3bfa9" /* TAN */],
                ["#775c55" /* BROWN */, "#aa8d7a" /* LIGHT_BROWN */],
                ["#483b3ai" /* DARK_BROWN */, "#775c55" /* BROWN */],
            ];
            PlumePicker = /** @class */ (function (_super) {
                __extends(PlumePicker, _super);
                function PlumePicker(callback) {
                    var _this = _super.call(this) || this;
                    _this.position = point_84.Point.ZERO; // top-center position
                    _this.entity = new Entity_33.Entity([_this]);
                    _this.callback = callback;
                    _this.originalSavedColor = SaveManager_10.saveManager.getState().plume;
                    if (!!_this.originalSavedColor) {
                        _this.select(_this.originalSavedColor);
                    }
                    else {
                        _this.select(["#dc4a7b" /* PINK */, "#f78697" /* LIGHT_PINK */]);
                    }
                    return _this;
                }
                /**
                 * Called when the user "cancels", to prevent overwriting the plume data
                 */
                PlumePicker.prototype.reset = function () {
                    if (!!this.originalSavedColor) {
                        this.select(this.originalSavedColor);
                    }
                };
                PlumePicker.prototype.select = function (colors) {
                    this.selected = colors;
                    SaveManager_10.saveManager.setState({ plume: colors });
                    this.callback(colors);
                };
                PlumePicker.prototype.update = function (updateData) {
                    var _this = this;
                    var sqSize = Tilesets_50.TILE_SIZE;
                    var rowLen = 9;
                    var topLeftPos = this.position.plusX(-rowLen * sqSize / 2);
                    this.renders = CUSTOMIZATION_OPTIONS.map(function (colors, index) {
                        var position = topLeftPos.plusX((index % rowLen) * Tilesets_50.TILE_SIZE)
                            .plusY(Math.floor(index / rowLen) * Tilesets_50.TILE_SIZE);
                        var dimensions = new point_84.Point(Tilesets_50.TILE_SIZE, Tilesets_50.TILE_SIZE);
                        var hovered = utils_9.rectContains(position, dimensions, updateData.input.mousePos);
                        var big = hovered || JSON.stringify(colors) == JSON.stringify(_this.selected);
                        var bigBuffer = 2;
                        if (hovered && updateData.input.isMouseDown) {
                            _this.select(colors);
                        }
                        return new RectRender_1.RectRender({
                            position: position.plus(big ? new point_84.Point(-bigBuffer, -bigBuffer) : point_84.Point.ZERO),
                            dimensions: dimensions.plus(big ? new point_84.Point(bigBuffer, bigBuffer).times(2) : point_84.Point.ZERO),
                            color: colors[1],
                            depth: big && !hovered ? 2 : hovered ? 1 : 0
                        });
                    });
                };
                PlumePicker.prototype.getRenderMethods = function () {
                    return this.renders;
                };
                return PlumePicker;
            }(component_46.Component));
            exports_143("PlumePicker", PlumePicker);
        }
    };
});
System.register("game/scenes/MainMenuScene", ["engine/debug", "engine/Entity", "engine/point", "game/characters/DudeAnimationUtils", "game/SaveManager", "game/ui/MainMenuButton", "game/ui/PlumePicker"], function (exports_144, context_144) {
    "use strict";
    var debug_5, Entity_34, point_85, DudeAnimationUtils_2, SaveManager_11, MainMenuButton_1, PlumePicker_1, ZOOM, MainMenuScene;
    var __moduleName = context_144 && context_144.id;
    return {
        setters: [
            function (debug_5_1) {
                debug_5 = debug_5_1;
            },
            function (Entity_34_1) {
                Entity_34 = Entity_34_1;
            },
            function (point_85_1) {
                point_85 = point_85_1;
            },
            function (DudeAnimationUtils_2_1) {
                DudeAnimationUtils_2 = DudeAnimationUtils_2_1;
            },
            function (SaveManager_11_1) {
                SaveManager_11 = SaveManager_11_1;
            },
            function (MainMenuButton_1_1) {
                MainMenuButton_1 = MainMenuButton_1_1;
            },
            function (PlumePicker_1_1) {
                PlumePicker_1 = PlumePicker_1_1;
            }
        ],
        execute: function () {
            ZOOM = 3;
            MainMenuScene = /** @class */ (function () {
                function MainMenuScene(continueFn, newGameFn) {
                    var _this = this;
                    this.plumes = new PlumePicker_1.PlumePicker(function (color) {
                        _this.knight = new Entity_34.Entity().addComponent(DudeAnimationUtils_2.DudeAnimationUtils.getCharacterIdleAnimation("knight_f", { color: color }).toComponent());
                    });
                    this.continueFn = continueFn;
                    this.newGameFn = newGameFn;
                    if (SaveManager_11.saveManager.saveFileExists() && debug_5.debug.autoPlay) {
                        this.continueFn();
                    }
                }
                MainMenuScene.prototype.getViews = function (updateViewsContext) {
                    var _this = this;
                    var dimensions = updateViewsContext.dimensions.div(ZOOM);
                    var saveFileExists = SaveManager_11.saveManager.saveFileExists();
                    var center = dimensions.floorDiv(2);
                    var lineSpacing = 16;
                    var menuTop = center.plusY(-20);
                    this.plumes.position = menuTop;
                    this.knight.transform.position = menuTop.minus(this.knight.transform.dimensions.floorDiv(2).plusY(24));
                    var buttons = [];
                    if (this.newGame) {
                        var top_3 = menuTop.plusY(42);
                        buttons.push(new MainMenuButton_1.MainMenuButton(top_3, "start" + (saveFileExists ? " (delete old save)" : ""), this.newGameFn));
                        if (saveFileExists) {
                            buttons.push(new MainMenuButton_1.MainMenuButton(top_3.plusY(lineSpacing), "cancel", function () {
                                _this.newGame = false;
                                _this.plumes.reset();
                            }));
                        }
                    }
                    else {
                        if (saveFileExists) {
                            buttons.push(new MainMenuButton_1.MainMenuButton(menuTop, "load last save", this.continueFn));
                        }
                        buttons.push(new MainMenuButton_1.MainMenuButton(menuTop.plusY(lineSpacing * buttons.length), "New game", function () { _this.newGame = true; }));
                    }
                    var entities = [
                        this.knight.entity,
                        new Entity_34.Entity(buttons)
                    ];
                    if (this.newGame) {
                        entities.push(this.plumes.entity);
                    }
                    return [{
                            zoom: ZOOM,
                            offset: point_85.Point.ZERO,
                            entities: entities
                        }];
                };
                return MainMenuScene;
            }());
            exports_144("MainMenuScene", MainMenuScene);
        }
    };
});
System.register("game/quest_game", ["engine/game", "game/scenes/GameScene", "game/scenes/MainMenuScene"], function (exports_145, context_145) {
    "use strict";
    var game_1, GameScene_1, MainMenuScene_1, QuestGame;
    var __moduleName = context_145 && context_145.id;
    return {
        setters: [
            function (game_1_1) {
                game_1 = game_1_1;
            },
            function (GameScene_1_1) {
                GameScene_1 = GameScene_1_1;
            },
            function (MainMenuScene_1_1) {
                MainMenuScene_1 = MainMenuScene_1_1;
            }
        ],
        execute: function () {
            QuestGame = /** @class */ (function (_super) {
                __extends(QuestGame, _super);
                function QuestGame() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.scene = 0 /* MAIN_MENU */;
                    _this.game = new GameScene_1.GameScene();
                    _this.mainMenu = new MainMenuScene_1.MainMenuScene(function () { return _this.continueGame(); }, function () { return _this.startNewGame(); });
                    return _this;
                }
                QuestGame.prototype.initialize = function () {
                    this.game.initialize();
                };
                QuestGame.prototype.continueGame = function () {
                    this.scene = 1 /* GAME */;
                    this.game.continueGame();
                };
                QuestGame.prototype.startNewGame = function () {
                    this.scene = 1 /* GAME */;
                    this.game.newGame();
                };
                // entities in the world space
                QuestGame.prototype.getViews = function (updateViewsContext) {
                    switch (this.scene) {
                        case 0 /* MAIN_MENU */:
                            return this.mainMenu.getViews(updateViewsContext);
                        case 1 /* GAME */:
                            return this.game.getViews(updateViewsContext);
                    }
                };
                return QuestGame;
            }(game_1.Game));
            exports_145("QuestGame", QuestGame);
        }
    };
});
System.register("app", ["game/quest_game", "engine/engine", "game/graphics/Tilesets", "engine/Assets"], function (exports_146, context_146) {
    "use strict";
    var quest_game_1, engine_1, Tilesets_51, Assets_5;
    var __moduleName = context_146 && context_146.id;
    return {
        setters: [
            function (quest_game_1_1) {
                quest_game_1 = quest_game_1_1;
            },
            function (engine_1_1) {
                engine_1 = engine_1_1;
            },
            function (Tilesets_51_1) {
                Tilesets_51 = Tilesets_51_1;
            },
            function (Assets_5_1) {
                Assets_5 = Assets_5_1;
            }
        ],
        execute: function () {
            Assets_5.assets.loadImageFiles(Tilesets_51.Tilesets.getFilesToLoad()).then(function () {
                new engine_1.Engine(new quest_game_1.QuestGame(), document.getElementById('canvas'));
            });
        }
    };
});
System.register("engine/ui/Clickable", ["engine/component", "engine/util/utils"], function (exports_147, context_147) {
    "use strict";
    var component_47, utils_10, Clickable;
    var __moduleName = context_147 && context_147.id;
    return {
        setters: [
            function (component_47_1) {
                component_47 = component_47_1;
            },
            function (utils_10_1) {
                utils_10 = utils_10_1;
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
                    if (updateData.input.isMouseDown && utils_10.rectContains(this.position, this.dimensions, updateData.input.mousePos)) {
                        this.onClick();
                    }
                };
                return Clickable;
            }(component_47.Component));
            exports_147("Clickable", Clickable);
        }
    };
});
System.register("engine/util/Comparators", [], function (exports_148, context_148) {
    "use strict";
    var Comparators;
    var __moduleName = context_148 && context_148.id;
    return {
        setters: [],
        execute: function () {
            exports_148("Comparators", Comparators = {
                orderBy: function (fn) {
                    return function (a, b) { return fn(a) - fn(b); };
                }
            });
        }
    };
});
var FACES = [0, 1, 2, 3, 4, 5];
var SIDES = 6;
var STARTING_DICE = 5;
var factorial = function (num) {
    var result = num;
    if (num === 0 || num === 1)
        return 1;
    while (num > 1) {
        num--;
        result *= num;
    }
    return result;
};
var choose = function (n, k) {
    return factorial(n) / (factorial(k) * factorial(n - k));
};
// const probabilityExactly = (faceCount: number, totalDice: number) => {
//     faceCount = Math.max(faceCount, 0)
//     return choose(totalDice, faceCount) * Math.pow(1/6, faceCount) * Math.pow(5/6, totalDice - faceCount)
// }
var probabilityAtLeast = function (faceCount, totalDice) {
    faceCount = Math.max(faceCount, 0);
    if (faceCount === 0)
        return 1;
    var n = totalDice;
    var q = faceCount;
    var result = 0;
    for (var x = q; x <= n; x++) {
        result += (choose(n, x) * Math.pow(1 / 6, x) * Math.pow(5 / 6, n - x));
    }
    return result;
};
var probabilityWithHand = function (hand, bid, totalDice) {
    return probabilityAtLeast(bid.count - hand[bid.face], totalDice - hand[bid.face]);
};
var rollDice = function (diceInHand) {
    var rolls = [0, 0, 0, 0, 0, 0];
    for (var i = 0; i < diceInHand; i++) {
        var r = Math.floor(Math.random() * SIDES);
        rolls[r]++;
    }
    return rolls;
};
var DicePlayer = /** @class */ (function () {
    function DicePlayer(name) {
        this.diceCount = STARTING_DICE;
        this.name = name;
        this.roll();
    }
    DicePlayer.prototype.roll = function () {
        this.hand = rollDice(this.diceCount);
    };
    DicePlayer.prototype.aiFirstBid = function () {
        var possibleBids = [];
        for (var i = 0; i < SIDES; i++) {
            for (var j = 0; j < this.hand[i]; j++) {
                possibleBids.push(i);
            }
        }
        return {
            face: possibleBids[Math.floor(Math.random() * possibleBids.length)],
            count: 1
        };
    };
    /**
     * @return a new bid or null to call "liar"
     */
    DicePlayer.prototype.aiPlayRound = function (bid, totalDice) {
        /**
         * options:
         *   increase bid: face, number, or both
         *   call liar
         *
         * steps:
         *   1. are they a liar or not? (considering your own dice + probability)
         *   2. they're not lying.
         */
        var _this = this;
        var probabilityOfPreviousBid = probabilityAtLeast(bid.count, totalDice);
        // we KNOW it's true, increase face safely by 1
        if (this.hand[bid.face] > bid.count) {
            return {
                face: bid.face,
                count: bid.count + 1
            };
        }
        console.log("probabilityOfPreviousBid=" + probabilityOfPreviousBid);
        if (probabilityOfPreviousBid < .2) {
            return null;
        }
        var possibleBids = [];
        // increase count by 1
        possibleBids.push({
            face: bid.face,
            count: bid.count + 1,
        });
        // increase face
        for (var f = bid.face + 1; f < SIDES; f++) {
            possibleBids.push({
                face: f,
                count: bid.count,
            });
        }
        // increase bid
        for (var f = 0; f < SIDES; f++) {
            possibleBids.push({
                face: f,
                count: bid.count + 1,
            });
        }
        // TODO add randomness and random bluffing
        possibleBids.sort(function (a, b) { return probabilityWithHand(_this.hand, b, totalDice) - probabilityWithHand(_this.hand, a, totalDice); });
        return possibleBids[0];
    };
    return DicePlayer;
}());
var doGame = function () {
    var allPlayers = [
        new DicePlayer("Tyler"),
        new DicePlayer("Miya"),
        new DicePlayer("Lane"),
        new DicePlayer("Gumball"),
    ];
    console.log(allPlayers);
    var s = function (bid) { return bid.count + "x" + (bid.face + 1); };
    var playersInGame = __spreadArrays(allPlayers);
    var previousPlayer = playersInGame.shift();
    playersInGame.push(previousPlayer);
    var _loop_3 = function () {
        var bid = previousPlayer.aiFirstBid();
        console.log(previousPlayer + ": starting bid " + s(bid));
        while (!!bid) {
            var p = playersInGame.shift();
            playersInGame.push(p);
            var totalDice = playersInGame.map(function (p) { return p.diceCount; }).reduce(function (a, b) { return a + b; });
            var nextBid = p.aiPlayRound(bid, totalDice);
            if (!nextBid) {
                console.log(p.name + ": " + previousPlayer.name + " is a liar!");
                var wasLie = playersInGame.map(function (p) { return p.hand[bid.face]; }).reduce(function (a, b) { return a + b; }) < bid.count;
                // TODO make the loser start the next round
                if (wasLie) {
                    previousPlayer.diceCount--;
                    console.log("it was a lie: " + previousPlayer.name + " loses a die");
                }
                else {
                    p.diceCount--;
                    console.log("it wasn't a lie: " + p.name + " loses a die");
                }
            }
            else {
                console.log(p.name + " bids " + s(nextBid));
            }
            previousPlayer = p;
            bid = nextBid;
            playersInGame.forEach(function (p) {
                if (p.diceCount == 0) {
                    console.log(p.name + " eliminated");
                }
            });
            playersInGame = playersInGame.filter(function (p) { return p.diceCount > 0; });
        }
        if (playersInGame.length == 1) {
            return "break";
        }
        playersInGame.forEach(function (p) { return p.roll(); });
    };
    while (true) {
        var state_1 = _loop_3();
        if (state_1 === "break")
            break;
    }
    console.log(playersInGame[0].name + " wins!");
};
window['dice'] = doGame;
System.register("game/saves/SerializeObject", ["engine/profiler", "game/saves/uuid"], function (exports_149, context_149) {
    "use strict";
    var profiler_2, uuid_3, serialize, buildObject;
    var __moduleName = context_149 && context_149.id;
    return {
        setters: [
            function (profiler_2_1) {
                profiler_2 = profiler_2_1;
            },
            function (uuid_3_1) {
                uuid_3 = uuid_3_1;
            }
        ],
        execute: function () {
            /**
             * Serializes an object and removes all circular references
             */
            exports_149("serialize", serialize = function (object) {
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
                var _loop_4 = function () {
                    var _a = stack.pop(), object_1 = _a.object, resultObject_1 = _a.resultObject;
                    Object.keys(object_1).forEach(function (k) {
                        if (object_1 instanceof Object) {
                            var uuid = objectUuidMap.get(object_1);
                            if (!!uuid) { // we have already traversed this object
                                console.log("seen " + uuid);
                                resultObject_1[k] = uuid;
                            }
                            else {
                                uuid = uuid_3.newUUID();
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
                    _loop_4();
                }
            };
        }
    };
});
// TODO
System.register("game/ui/StringTiles", ["engine/component", "game/graphics/Tilesets", "engine/tiles/TileTransform", "engine/point"], function (exports_150, context_150) {
    "use strict";
    var component_48, Tilesets_52, TileTransform_34, point_86, StringTiles;
    var __moduleName = context_150 && context_150.id;
    return {
        setters: [
            function (component_48_1) {
                component_48 = component_48_1;
            },
            function (Tilesets_52_1) {
                Tilesets_52 = Tilesets_52_1;
            },
            function (TileTransform_34_1) {
                TileTransform_34 = TileTransform_34_1;
            },
            function (point_86_1) {
                point_86 = point_86_1;
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
                        return Tilesets_52.Tilesets.instance.oneBit.getTileSource(c).toImageRender(new TileTransform_34.TileTransform(_this.topLeftPos.plus(new point_86.Point(10 * i, 0))));
                    });
                };
                StringTiles.prototype.clear = function () {
                    this.say("");
                };
                StringTiles.prototype.getRenderMethods = function () {
                    return this.tiles;
                };
                return StringTiles;
            }(component_48.Component));
            exports_150("StringTiles", StringTiles);
        }
    };
});
