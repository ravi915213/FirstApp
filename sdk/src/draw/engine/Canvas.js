/**
 * @class Ext.draw.engine.Canvas
 * @extends Ext.draw.Surface
 *
 * Provides specific methods to draw with 2D Canvas element.
 */
Ext.define('Ext.draw.engine.Canvas', { 
 
    extend: 'Ext.draw.Surface',

    uses: [
        'Ext.fx.Frame'
    ],
    //read only style attribute canvas property mapping.
    attributeMap: {
        //rotate: "rotation",
        stroke: "strokeStyle",
        fill: "fillStyle",
        lineWidth: "lineWidth",
        "text-anchor": "textAlign",
        "stroke-width": "lineWidth",
        "stroke-linecap": "lineCap",
        "stroke-linejoin": "lineJoin",
        "stroke-miterlimit": "miterLimit",
        opacity: "globalAlpha",
        font: 'font',
        "font-family": 'font',
        "font-size": 'font',
        shadowColor: "shadowColor",
        shadowOffsetX: "shadowOffsetX",
        shadowOffsetY: "shadowOffsetY",
        shadowBlur: "shadowBlur",
        textBaseline: "textBaseline",
        translate: "translate",
        scale: "scale",
        rotate: "rotate"
    },

    //read only default canvas property value map.
    attributeDefaults: {
        strokeStyle: "rgba(0, 0, 0, 1)",
        fillStyle: "rgba(0, 0, 0, 1)",
        lineWidth: 1,
        lineCap: "square",
        lineJoin: "miter",
        miterLimit: 1,
        shadowColor: "none",
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 0,
        font: "10px 'Helvetica', 'sans-serif'",
        textAlign: "start",
        globalAlpha: 1,
        textBaseline: "middle",
        translate: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        rotate: { degrees: 0 }
    },

    rgbRe: /\s*rgba?\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*(,\s*[0-9\.]+\s*)?\)\s*/,
    gradientRe: /\s*url\s*\(#([^\)]+)\)\s*/,
    srcRe: /^"?([^"]*)"?$/,

    //a map containing the src of the images that have been loaded.
    loadedImages: {},

    //read-only map of value convertions
    //used to convert a gradient id string into a gradient object
    //in a generic way
    attributeParsers: {
        font: function (value, name, sprite, me) {
            var attr = sprite.attr;
            if (!attr.font && attr["font-size"] && attr["font-family"]) {
                return attr.font || attr["font-size"] + "px '" + attr["font-family"] + "'";
            }
            return attr.font;
        },
        fillStyle: function(value, name, sprite, me) {
            if (!value) {
                return value;
            }
            //is a gradient object
            if (Ext.isObject(value)) {
                me.addGradient(value);
                value = 'url(#' + value.id + ')';
            }
            var id = value.match(me.gradientRe);
            if (id) {
                return me.createGradient(me._gradients[id[1]], sprite);
            } else {
                return value == 'none'? 'rgba(0, 0, 0, 0)' : value;
            }
        },
        strokeStyle: function(value, name, sprite, me) {
            if (!value) {
                return value;
            }
            //is a gradient object
            if (Ext.isObject(value)) {
                me.addGradient(value);
                value = 'url(#' + value.id + ')';
            }
            var id = value.match(me.gradientRe);

            if (id) {
                return me.createGradient(me._gradients[id[1]], sprite);
            } else {
                return value == 'none'? 'rgba(0, 0, 0, 0)' : value;
            }
        },
        textAlign: function(value, name, sprite) {
            if (value === 'middle') {
                return 'center';
            }
            return value;
        }
    },

    statics: {
        // @private
        //TODO(nico): should sort also by abstract concept: "priority"
        zIndexSort: function(a, b) {
            var aAttr = a.attr,
                bAttr = b.attr,
                aIndex = aAttr && aAttr.zIndex || -1,
                bIndex = bAttr && bAttr.zIndex || -1,
                val = aIndex - bIndex;
            if (!val) {
                return (a.id > b.id) ? 1 :  -1;
            }
            else {
                return val;
            }
        },

        merge: function(a, b) {
            var i = 0, la = a.length, j = 0, lb = b.length, result = [];
            while (i < la && j < lb) {
                if (this.zIndexSort(a[i], b[j]) <= 0) {
                    result.push(a[i++]);
                } else {
                    result.push(b[j++]);
                }
            }
            while (i < la) {
                result.push(a[i++]);
            }
            while (j < lb) {
                result.push(b[j++]);
            }
            return result;
        },

        // Stable sort.
        mergeSort: function (list) {
            if (list.length <= 1) {
                return list;
            } else if (list.length === 2) {
                if (this.zIndexSort(list[0],list[1]) > 0) {
                    var temp = list[1];
                    list[1] = list[0];
                    list[0] = temp;
                }
                return list;
            } else {
                var mid = list.length >> 1;
                return this.merge(this.mergeSort(list.slice(0, mid)), this.mergeSort(list.slice(mid)));
            }
        }
    },

    constructor: function(config) {
        var me = this;
        //whether to add an event system to the canvas or not
        me.initEvents = 'initEvents' in config ? config.initEvents : true;
        //store a hash of gradient configurations
        me._gradients = {};
        me.callParent(arguments);

        me.initCanvas(config.renderTo, config);

        // Redraw after each animation frame event
        // Only render a frame if there are animations in the queue.
        // TODO(nico): should also check that any of those animations are happening in this surface.
        Ext.fx.Frame.addFrameCallback(me.renderFrame, me);
        //TODO(nico): This should be configurable.
        //disable context menu
        this.surfaceEl.on('contextmenu', function() { return false; });

    },

    //initializes the only canvas instance to draw the shapes to.
    initCanvas: function(container, config) {
        if (this.ctx) {
            return;
        }

        var me = this,
            domContainer = Ext.get(container),
            width = domContainer.getWidth() || config.width,
            height = domContainer.getHeight() || config.height,
            element = me.createWrapEl(container),
            surfaceEl = element.createChild({tag: 'canvas', id: me.id + '-canvas', width: width, height: height}),
            canvas = surfaceEl.dom,
            ctx = canvas.getContext('2d');

        element.setSize(width, height);
        //add an id to the dom div element.

        me.element = element;
        me.surfaceEl = surfaceEl;
        me.ctx = ctx;

        ctx.save();

        //Add event manager for canvas class
        me.initializeEvents();
    },

    getSpriteForEvent: function() {
        return null; //TODO!!!
    },

    //stores the gradient configuration into a hashmap
    parseGradient: function(gradient) {
        return Ext.draw.Draw.parseGradient(gradient);
    },

    //applies the current transformations to the element's matrix
    //TODO(nico): similar to what's found in Svg engine
    transform: function(sprite) {
        var matrix = new Ext.draw.Matrix(),
            transforms = sprite.transformations,
            transformsLength = transforms.length,
            i = 0,
            transform, type;

        for (; i < transformsLength; i++) {
            transform = transforms[i];
            type = transform.type;
            if (type == "translate") {
                matrix.translate(transform.x, transform.y);
            }
            else if (type == "rotate") {
                matrix.rotate(transform.degrees, transform.x, transform.y);
            }
            else if (type == "scale") {
                matrix.scale(transform.x, transform.y, transform.centerX, transform.centerY);
            }
        }
        sprite.matrix = matrix;
    },

    setSize: function(w, h) {
        var width, height,
            me = this,
            canvas = me.surfaceEl.dom;
        if (w && typeof w == 'object') {
            width = w.width;
            height = w.height;
        } else {
            width = w;
            height = h;
        }

        if (width !== canvas.width || height !== canvas.height) {
            me.element.setSize(width, height);
            me.surfaceEl.setSize(width, height);
            canvas.width = width;
            canvas.height = height;
        }

        me.callParent([width, height]);
    },

    tween: function() {
        this.animatedFrame = true;
        this.callParent();
    },

    /**
     * Triggers the re-rendering of the canvas.
     */
    renderFrame: function() {
        this.render();
    },

    render: function() {
        var me = this;
        if (!me.surfaceEl) {
            return;
        }
        me.renderAll();
    },

    createItem: function (config) {
        var sprite = new Ext.draw.Sprite(config);
        sprite.surface = this;
        sprite.matrix = new Ext.draw.Matrix();
        sprite.bbox = {
            plain: 0,
            transform: 0
        };
        return sprite;
    },

    renderAll: function() {
        if (this.dirty) {
            var me = this;
            me.clear();
            //sort by zIndex
            Ext.draw.engine.Canvas.mergeSort(me.getItems().items);
            me.getItems().each(me.renderSprite, me);
            me.dirty = false;
        }
    },

    /**
     * Renders a single sprite into the canvas (without clearing the canvas).
     *
     * @param {Ext.draw.Sprite} sprite The Sprite to be rendered.
     */
    renderSprite: function (sprite) {
        // Clear dirty flags that aren't used by the Canvas renderer
        sprite.dirtyHidden = sprite.dirtyPath = sprite.zIndexDirty = sprite.dirtyFont = sprite.dirty = false;

        if (sprite.attr.hidden) {
            return;
        }
        if (!sprite.matrix) {
            sprite.matrix = new Ext.draw.Matrix();
        }
        var me = this,
            ctx = me.ctx,
            attr = sprite.attr,
            attributeMap = me.attributeMap,
            attributeDefaults = me.attributeDefaults,
            attributeParsers = me.attributeParsers,
            prop, val, propertyValue;

        if (sprite.dirtyTransform) {
            me.applyTransformations(sprite);
            sprite.dirtyTransform = false;
        }
        ctx.save();

        //set matrix state
        sprite.matrix.toCanvas(ctx);

        //set styles
        for (prop in attributeMap) {
            val = attributeMap[prop];
            if (val in attributeParsers) {
                propertyValue = attributeParsers[val]( (prop in attr) ? attr[prop] :  me.availableAttrs[prop], prop, sprite, me);
                if (propertyValue === undefined) {
                    propertyValue = attributeDefaults[val];
                }
                if (ctx[val] != propertyValue) {
                    ctx[val] = propertyValue;
                }
            }
            else if (typeof ctx[val] !== 'function') {
                propertyValue = (prop in attr) ? attr[prop] : attributeDefaults[val];
                if (ctx[val] != propertyValue) {
                    ctx[val] = propertyValue;
                }
            }
        }

        //render shape
        me[sprite.type + 'Render'](sprite);
        ctx.restore();
    },

    circleRender: function(sprite) {
        var me = this,
            ctx = me.ctx,
            attr = sprite.attr,
            x = +(attr.x || 0),
            y = +(attr.y || 0),
            radius = attr.radius,
            pi2 = Ext.draw.Draw.pi2;

        //draw fill circle
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, pi2, true);
        ctx.closePath();
        me.fill();
        me.stroke();
    },

    ellipseRender: function(sprite) {
        var me = this,
            ctx = me.ctx,
            attr = sprite.attr,
            width = attr.width,
            height = attr.height,
            x = +(attr.x || 0),
            y = +(attr.y || 0),
            scaleX = 1,
            scaleY = 1,
            scalePosX = 1,
            scalePosY = 1,
            radius = 0,
            pi2 = Ext.draw.Draw.pi2;

        if (width > height) {
            radius = width / 2;
            scaleY = height / width;
            scalePosY = width / height;
        }
        else {
            radius = height / 2;
            scaleX = width / height;
            scalePosX = height / width;
        }
        ctx.scale(scaleX, scaleY);

        //make fill ellipse
        ctx.beginPath();
        ctx.arc(x * scalePosX, y * scalePosY, radius, 0, pi2, true);
        ctx.closePath();
        me.stroke();
    },

    imageRender: function(sprite) {
        var me = this,
            ctx = me.ctx,
            attr = sprite.attr,
            width = attr.width,
            height = attr.height,
            x = +(attr.x || 0),
            y = +(attr.y || 0),
            src = attr.src && attr.src.match(me.srcRe)[1],
            a, img;

        if (sprite._img && sprite._img.src == src) {
            img = sprite._img;
        } 
        else {
            sprite._img = img = new Image();
            img.height = height;
            img.width = width;

            //absolutize
            a = document.createElement('a');
            a.href = src;
            src = a.href;
            
            if (!me.loadedImages[src]) {
                img.onload = function() {
                    if (!me.loadedImages[src]) {
                        me.loadedImages[src] = true;
                        sprite.dirt();
                        me.renderFrame();
                    }
                };
            }
            
            img.src = src;
            attr.src = src;
        }

        if (me.loadedImages[src]) {
            ctx.drawImage(img, x - width / 2, y - height / 2, width, height);
        }
    },

    rectRender: function(sprite) {
        var me = this,
            ctx = me.ctx,
            attr = sprite.attr,
            width = attr.width,
            height = attr.height,
            x = +(attr.x || 0),
            y = +(attr.y || 0);

        if (isFinite(x) && isFinite(y) && isFinite(width) && isFinite(height)) {
            me.fillRect(x, y, width, height);
            me.strokeRect(x, y, width, height);
        }
    },

    textRender: function(sprite) {
        var me = this,
            ctx = me.ctx,
            bbox = sprite.getBBox(true),
            attr = sprite.attr,
            x = +(attr.x || 0),
            y = +(attr.y || 0),
            text = attr.text;

        if (isFinite(x) && isFinite(y)) {
            me.fillText(text, x, y);
        }
    },

    pathRender: function(sprite) {
        if (!sprite.attr.path) {
            return;
        }

        var me = this,
            ctx = me.ctx,
            attr = sprite.attr,
            path = Ext.draw.Draw.path2curve(attr.path),
            ln = path.length,
            x, y, i;

        ctx.beginPath();
        for (i = 0; i < ln; i++) {
            switch (path[i][0]) {
                case "M":
                    ctx.moveTo(path[i][1], path[i][2]);
                    if (x === null) {
                        x = path[i][1];
                    }
                    if (y === null) {
                        y = path[i][2];
                    }
                break;
                case "C":
                    ctx.bezierCurveTo(path[i][1],
                                      path[i][2],
                                      path[i][3],
                                      path[i][4],
                                      path[i][5],
                                      path[i][6]);
                break;
                case "Z":
                    ctx.lineTo(x, y);
                break;
            }
        }
        //if fill is not transparent then draw it
        if (attr.fill && attr.fill != 'none' && attr.fill != 'rgba(0, 0, 0, 0)') {
            me.fill();
        }
        //if stroke is not transparent then draw it
        if (attr.stroke && attr.stroke != 'none' && attr.stroke != 'rgba(0, 0, 0, 0)') {
            me.stroke();
        }
        ctx.closePath();
    },

    //Contains method used for event handling.
    //Returns the target pointed by the mouse or
    //false otherwise.
    contains: function(x, y) {
        var me = this,
            items = me.getItems().items,
            l = items.length,
            sprite;

        while (l--) {
            sprite = items[l];
            if (me.bboxContains(x, y, sprite)) {
                if (me[sprite.type + 'Contains'](x, y, sprite)) {
                    //TODO(nico): not returning just the sprite because a
                    //more complex object with more informaiton on the event
                    //may be returned.
                    return {
                        target: sprite
                    };
                }
            }
        }

        return false;
    },

    //Whether the point is in the BBox of the shape
    bboxContains: function(x, y, sprite) {
        var bbox = sprite.getBBox();

        return (x >= bbox.x && x <= (bbox.x + bbox.width)
            && (y >= bbox.y && y <= (bbox.y + bbox.height)));
    },

    //Whether the point is in the shape
    circleContains: function(x, y, sprite) {
        var attr = sprite.attr,
            trans = attr.translation,
            cx = (attr.x || 0) + (trans && trans.x || 0),
            cy = (attr.y || 0) + (trans && trans.y || 0),
            dx = x - cx,
            dy = y - cy,
            radius = attr.radius;

        return (dx * dx + dy * dy) <= (radius * radius);
    },

    //Whether the point is in the shape
    ellipseContains: function(x, y, sprite) {
        var attr = sprite.attr,
            trans = attr.translation,
            cx = (attr.x || 0) + (trans && trans.x || 0),
            cy = (attr.y || 0) + (trans && trans.y || 0),
            radiusX = attr.radiusX || (attr.width  / 2) || 0,
            radiusY = attr.radiusY || (attr.height / 2) || 0,
            radius = 0,
            scaleX = 1,
            scaleY = 1,
            dx, dy;

        if (radiusX > radiusY) {
                radius = radiusX;
                scaleY = radiusY / radiusX;
        } else {
            radius = radiusY;
            scaleY = radiusX / radiusY;
        }

        dx = (x - cx) / scaleX;
        dy = (y - cy) / scaleY;

        return (dx * dx + dy * dy) <= (radius * radius);
    },

    //Same behavior as the BBox check, so return true.
    imageContains: function(x, y, sprite) {
        return true;
    },

    //Same behavior as the BBox check, so return true.
    rectContains: function(x, y, sprite) {
        return true;
    },

    //Same behavior as the BBox check, so return true.
    textContains: function(x, y, sprite) {
        return true;
    },

    //TODO(nico): to be implemented later.
    pathContains: function(x, y, sprite) {
        return false;
    },

    createGradient: function(gradient, sprite) {
        var ctx = this.ctx,
            bbox = sprite.getBBox(),
            x1 = bbox.x,
            y1 = bbox.y,
            width = bbox.width,
            height = bbox.height,
            x2 = x1 + width,
            y2 = y1 + height,
            a = Math.round(Math.abs(gradient.degrees || gradient.angle || 0) % 360),
            stops = gradient.stops,
            stop, canvasGradient;

        if (a <= 0) {
            canvasGradient = ctx.createLinearGradient(x1, y1, x1, y2);
        } else if (a <= 45) {
            canvasGradient = ctx.createLinearGradient(x1, y1, x2, y2);
        } else if (a <= 90) {
            canvasGradient = ctx.createLinearGradient(x1, y1, x2, y1);
        } else if (a <= 135) {
            canvasGradient = ctx.createLinearGradient(x2, y1, x1, y2);
        } else if (a <= 180) {
            canvasGradient = ctx.createLinearGradient(x1, y2, x1, y1);
        } else if (a <= 225) {
            canvasGradient = ctx.createLinearGradient(x2, y2, x1, y1);
        } else if (a <= 270) {
            canvasGradient = ctx.createLinearGradient(x2, y1, x1, y1);
        } else if (a <= 315) {
            canvasGradient = ctx.createLinearGradient(x1, y2, x2, y1);
        } else {
            canvasGradient = ctx.createLinearGradient(x1, y1, x2, y2);
        }

        for (stop in stops) {
            if (stops.hasOwnProperty(stop)) {
                canvasGradient.addColorStop((stops[stop].offset || 0) /100, stops[stop].color || '#000');
            }
        }

        return canvasGradient;
    },

    /**
     * Returns the bounding box for the given Sprite as calculated with the Canvas engine.
     *
     * @param {Ext.draw.Sprite} sprite The Sprite to calculate the bounding box for.
     * @param {Boolean} isWithoutTransform Whether to calculate the bounding box with the current transforms or not.
     */
    getBBox: function (sprite, isWithoutTransform) {
        if (sprite.type == 'text') {
            return this.getBBoxText(sprite, isWithoutTransform);
        }
        var realPath = Ext.draw.Surface["getPath" + sprite.type](sprite);
        if (isWithoutTransform) {
            sprite.bbox.plain = sprite.bbox.plain || Ext.draw.Draw.pathDimensions(realPath);
            return sprite.bbox.plain;
        }
        //sprite.bbox.transform = sprite.bbox.transform || Ext.draw.Draw.pathDimensions(Ext.draw.Draw.mapPath(realPath, sprite.matrix));
        //caching the bounding box causes problems :(
        sprite.bbox.transform = Ext.draw.Draw.pathDimensions(Ext.draw.Draw.mapPath(realPath, sprite.matrix));
        return sprite.bbox.transform;
    },

    getBBoxText: function(sprite, isWithoutTransform) {
        var me = this,
            ctx = me.ctx,
            attr = sprite.attr,
            matrix,
            x = attr.x || 0,
            y = attr.y || 0,
            x1, x2, y1, y2,
            x1t, x2t, x3t, x4t,
            y1t, y2t, y3t, y4t,
            width, height,
            font = attr.font,
            height = attr['font-size'] || +(font && font.match(/[0-9]+/)[1]) || 10,
            text = attr.text,
            baseline =  attr.textBaseline || me.attributeDefaults.textBaseline,
            alignment = attr['text-anchor'] || attr.textAlign || me.attributeDefaults.textAlign;

        if (font && ctx.font !== font) {
            ctx.font = font;
        }
        width = ctx.measureText(text).width;

        switch (baseline) {
            case 'top' :
                y -= height;
                break;
            case 'hanging' : 
            case 'ideographic' :
            case 'alphabetic' :
                y -= height * 0.8;
                break;
            case 'middle' :
            case 'center' :
                y -= height * 0.5;
                break;
            case 'bottom' : break;
        }

        switch (alignment) {
            case 'end' :
            case 'right' :
                x -= width;
                break;
            case 'middle' :
            case 'center' :
                x -= width * 0.5;
                break;
        }
        if (!isWithoutTransform) {
            if (sprite.dirtyTransform) {
                me.applyTransformations(sprite);
            }
            matrix = sprite.matrix;
            x1 = x;
            y1 = y;
            x2 = x + width;
            y2 = y + height;
            x1t = matrix.x(x1, y1);
            y1t = matrix.y(x1, y1);

            x2t = matrix.x(x1, y2);
            y2t = matrix.y(x1, y2);

            x3t = matrix.x(x2, y1);
            y3t = matrix.y(x2, y1);

            x4t = matrix.x(x2, y2);
            y4t = matrix.y(x2, y2);

            x = Math.min(x1t, x2t, x3t, x4t);
            y = Math.min(y1t, y2t, y3t, y4t);

            width = Math.abs(x - Math.max(x1t, x2t, x3t, x4t));
            height = Math.abs(y - Math.max(y1t, y2t, y3t, y4t));
        }

        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    },

    /**
     * Returns the region occupied by the canvas.
     */
    getRegion: function() {
        var canvas = this.surfaceEl.dom,
            xy = this.surfaceEl.getXY();

        return {
            left: xy[0],
            top: xy[1],
            right: xy[0] + canvas.width,
            bottom: xy[1] + canvas.height
        };
    },

    //force will force the method to return a value.
    getShadowAttributesArray: function(force) {
        if (force) {
            return [{
                    "stroke-width": 6,
                    "stroke-opacity": 1,
                    stroke: 'rgba(200, 200, 200, 0.5)',
                    translate: {
                        x: 1.2,
                        y: 2
                    }
                },
                {
                    "stroke-width": 4,
                    "stroke-opacity": 1,
                    stroke: 'rgba(150, 150, 150, 0.5)',
                    translate: {
                        x: 0.9,
                        y: 1.5
                    }
                },
                {
                    "stroke-width": 2,
                    "stroke-opacity": 1,
                    stroke: 'rgba(100, 100, 100, 0.5)',
                    translate: {
                        x: 0.6,
                        y: 1
                    }
                }];
        } else {
            return [];
        }
    },

    //force will force the method to return a value.
    getShadowOptions: function(force) {
        return {
            shadowOffsetX: 2,
            //http://code.google.com/p/android/issues/detail?id=16025
            shadowOffsetY: Ext.os.is('Android') ? -2 : 2,
            shadowBlur: 3,
            shadowColor: '#444'
        };
    },

    /**
     * Clears the canvas.
     */
    clear: function() {
        var me = this,
            canvas = me.surfaceEl.dom;
        me.ctx.clearRect(0, 0, canvas.width, canvas.height);
    },

    /**
     * Returns the preferred default value for a sprite attribute.
     */
    getDefaultAttribute: function(name) {
        var me = this,
            map = me.attributeMap,
            def = me.attributeDefaults;

        if (name in map) {
            return def[ map[ name ] ];
        } else if (name in def) {
            return def[name];
        }

        return false;
    },

    /**
     * Destroys the Canvas element and prepares it for Garbage Collection.
     */
    destroy: function() {
        var me = this;
        delete me.ctx;
        me.surfaceEl.destroy();
        delete me.surfaceEl;
        me.element.destroy();
        delete me.element;
        Ext.fx.Frame.removeFrameCallback(me.renderFrame, me);
        me.callParent(arguments);
    }
}, function () {

    function globalAlphaPolyfill(method, type) {
        type = type + '-opacity';
        return (function () {
            var me = this, ctx = me.ctx, globalAlpha = +me.ctx.globalAlpha, opacity = me[type] === undefined ? 1 : me[type];
            if (globalAlpha > 0) {
                if (opacity !== undefined && opacity < 1 && opacity > 0) {
                    ctx.globalAlpha = globalAlpha * opacity;
                    ctx[method].apply(ctx, arguments);
                    ctx.globalAlpha = globalAlpha;
                } else {
                    ctx[method].apply(ctx, arguments);
                }
            }
        });
    }

    this.addMembers({
        stroke : globalAlphaPolyfill('stroke', 'stroke'),
        fill : globalAlphaPolyfill('fill', 'fill'),
        strokeRect : globalAlphaPolyfill('strokeRect', 'stroke'),
        fillRect : globalAlphaPolyfill('fillRect', 'fill'),
        strokeText : globalAlphaPolyfill('strokeText', 'stroke'),
        fillText : globalAlphaPolyfill('fillText', 'fill')
    });

});
