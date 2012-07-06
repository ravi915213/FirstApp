/**
 * @class Ext.draw.Surface
 * @extends Object
 *
 * A Surface is an interface to render methods inside a draw {@link Ext.draw.Component}.
 * A Surface contains methods to render sprites, get bounding boxes of sprites, add
 * sprites to the canvas, initialize other graphic components, etc. One of the most used
 * methods for this class is the `add` method, to add Sprites to the surface.
 *
 * Most of the Surface methods are abstract and they have a concrete implementation
 * in VML or SVG engines.
 *
 * A Surface instance can be accessed as a property of a draw component. For example:
 *
 *     drawComponent.surface.add({
 *         type: 'circle',
 *         fill: '#ffc',
 *         radius: 100,
 *         x: 100,
 *         y: 100
 *     });
 *
 * The configuration object passed in the `add` method is the same as described in the {@link Ext.draw.Sprite}
 * class documentation.
 *
 * ### Listeners
 *
 * You can also add event listeners to the surface using the `Observable` listener syntax. Supported events are:
 *
 * - 'mouseup'
 * - 'mousedown'
 * - 'mouseover'
 * - 'mouseout'
 * - 'mousemove'
 * - 'mouseenter'
 * - 'mouseleave'
 * - 'click'
 * - 'dblclick'
 * - 'tap'
 * - 'tapstart'
 * - 'tapend'
 * - 'tapcancel'
 * - 'longpress'
 * - 'doubletap'
 * - 'singletap'
 * - 'touchstart'
 * - 'touchmove'
 * - 'touchend'
 * - 'drag'
 * - 'dragstart'
 * - 'dragend'
 * - 'pinch'
 * - 'pinchstart'
 * - 'pinchend'
 * - 'swipe'
 *
 * For example:
 *
 *     drawComponent.surface.on({
 *        'mousemove': function() {
 *             console.log('moving the mouse over the surface');
 *         }
 *     });
 *
 * ## Example
 *
 *     drawComponent.surface.add([
 *         {
 *             type: 'circle',
 *             radius: 10,
 *             fill: '#f00',
 *             x: 10,
 *             y: 10,
 *             group: 'circles'
 *         },
 *         {
 *             type: 'circle',
 *             radius: 10,
 *             fill: '#0f0',
 *             x: 50,
 *             y: 50,
 *             group: 'circles'
 *         },
 *         {
 *             type: 'circle',
 *             radius: 10,
 *             fill: '#00f',
 *             x: 100,
 *             y: 100,
 *             group: 'circles'
 *         },
 *         {
 *             type: 'rect',
 *             radius: 10,
 *             x: 10,
 *             y: 10,
 *             group: 'rectangles'
 *         },
 *         {
 *             type: 'rect',
 *             radius: 10,
 *             x: 50,
 *             y: 50,
 *             group: 'rectangles'
 *         },
 *         {
 *             type: 'rect',
 *             radius: 10,
 *             x: 100,
 *             y: 100,
 *             group: 'rectangles'
 *         }
 *     ]);
 *
 */
// COMPAT set Ext.baseCSSPrefix
Ext.baseCSSPrefix = 'x-';

(function() {

Ext.define('Ext.draw.Surface', { 
 
    mixins: {
      identifiable: 'Ext.mixin.Identifiable',
      observable: 'Ext.util.Observable'
    },

    uses: [
        'Ext.draw.engine.Canvas',
        'Ext.draw.Sprite',
        'Ext.draw.Matrix',
        'Ext.draw.CompositeSprite'
    ],

    statics: {
        /**
         * Create and return a new concrete Surface instance appropriate for the current environment.
         * @param {Object} config Initial configuration for the Surface instance
         * @param {Array} enginePriority Optional order of implementations to use; the first one that is
         *                available in the current environment will be used. Defaults to
         *                <code>['Svg', 'Vml']</code>.
         */
        create: function(config, enginePriority) {
            return new Ext.draw.engine.Canvas(config);
            enginePriority = enginePriority || ['Canvas', 'Svg'];

            var i = 0,
                len = enginePriority.length;

            for (; i < len; i++) {
                //if (Ext.supports[enginePriority[i]]) {
                    //return new Ext.draw.engine[enginePriority[i]](config);
                    //return new Ext.draw.engine.Svg(config);
                //}
            }
            return false;
        },
        /**
         * Saves the passed surface array based on the config parameters.
         *
         * The following config object properties affect the saving process:
         * - **type** - string - The export type. Supported types: 'svg': returns the chart's Svg-String, 'image/png': returns the chart as png, 'image/jpeg': returns the chart as jpeg. Default: 'image/png'
         *
         * Used in {@link Ext.chart.Chart#save}
         *
         * @param {Object} config The config object for the export generation
         * @param {Array} surfaces The surfaces that should be saved
         *
         */
        save: function(config, surfaces){
            var surfacesList = [],
                series = [],
                overlays = [],
                others = [],
                axes = [],
                exportEngine = 'Image';
                
            for(var i in surfaces){
            
                if(surfaces.hasOwnProperty(i)){
                    // TODO better implementation
                    if(i == 'main'){
                        surfacesList.push(surfaces[i]);
                    }else if(i.indexOf('Overlay') != -1){
                        overlays.push(surfaces[i]);
                    }else if(i.indexOf('Axis') != -1){
                        axes.push(surfaces[i]);
                    }else if(i.indexOf('series') != -1){
                        series.push(surfaces[i]);
                    }else{
                        others.push(surfaces[i]);
                    }
                }
            }

            surfacesList = surfacesList.concat(axes, series, overlays, others);

            // check type and if canvas is supported
            if(config.type == 'svg' || (!document.createElement('canvas').getContext)){
                exportEngine = 'Svg';
            }
                
            return Ext.draw.engine[exportEngine + 'Exporter'].generate(config, surfacesList);
        },

        // @private
        rectPath: function (x, y, w, h, r) {
            if (r) {
                return [["M", x + r, y], ["l", w - r * 2, 0], ["a", r, r, 0, 0, 1, r, r], ["l", 0, h - r * 2], ["a", r, r, 0, 0, 1, -r, r], ["l", r * 2 - w, 0], ["a", r, r, 0, 0, 1, -r, -r], ["l", 0, r * 2 - h], ["a", r, r, 0, 0, 1, r, -r], ["z"]];
            }
            return [["M", x, y], ["l", w, 0], ["l", 0, h], ["l", -w, 0], ["z"]];
        },

        // @private
        ellipsePath: function (x, y, rx, ry) {
            if (ry == null) {
                ry = rx;
            }
            return [["M", x, y], ["m", 0, -ry], ["a", rx, ry, 0, 1, 1, 0, 2 * ry], ["a", rx, ry, 0, 1, 1, 0, -2 * ry], ["z"]];
        },

        // @private
        getPathpath: function (el) {
            return el.attr.path;
        },

        // @private
        getPathcircle: function (el) {
            var a = el.attr, r = 'radius' in a ? a.radius : a.r;
            return this.ellipsePath(a.x, a.y, r);
        },

        // @private
        getPathellipse: function (el) {
            var a = el.attr;
            return this.ellipsePath(a.x, a.y, 'radiusX' in a ? a.radiusX : a.rx, 'radiusY' in a ? a.radiusY : a.ry);
        },

        // @private
        getPathrect: function (el) {
            var a = el.attr;
            return this.rectPath(a.x, a.y, a.width, a.height, a.r);
        },

        // @private
        getPathimage: function (el) {
            var a = el.attr;
            return this.rectPath(a.x || 0, a.y || 0, a.width, a.height);
        },

        // @private
        getPathtext: function (el) {
            var bbox = this.getBBoxText(el);
            return this.rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
        },
        
        eventNames: [
            'mouseup',
            'mousedown',
            'mouseover',
            'mouseout',
            'mousemove',
            'mouseenter',
            'mouseleave',
            'click',
            'dblclick',
            'tap',
            'tapstart',
            'tapend',
            'tapcancel',
            'longpress',
            'doubletap',
            'singletap',
            'touchstart',
            'touchmove',
            'touchend',
            'drag',
            'dragstart',
            'dragend',
            'pinch',
            'pinchstart',
            'pinchend',
            'swipe'
        ]
    },
    
    // @private
    container: undefined,
    x: 0,
    y: 0,
    zoomX: 1,
    zoomY: 1,
    panX: 0,
    panY: 0,
    dirty: true,

    // @private
    availableAttrs: {
        blur: 0,
        "clip-rect": "0 0 1e9 1e9",
        cursor: "default",
        cx: 0,
        cy: 0,
        'dominant-baseline': 'auto',
        fill: "none",
        "fill-opacity": 1,
        font: '10px "Arial"',
        "font-family": '"Arial"',
        "font-size": "10",
        "font-style": "normal",
        "font-weight": 400,
        gradient: "",
        height: 0,
        hidden: false,
        href: "http://sencha.com/",
        opacity: 1,
        path: "M0,0",
        radius: 0,
        rx: 0,
        ry: 0,
        scale: "1 1",
        src: "",
        stroke: "none",
        "stroke-dasharray": "",
        "stroke-linecap": "butt",
        "stroke-linejoin": "butt",
        "stroke-miterlimit": 0,
        "stroke-opacity": 1,
        "stroke-width": 1,
        target: "_blank",
        text: "",
        "text-anchor": "middle",
        title: "Ext Draw",
        width: 0,
        x: 0,
        y: 0,
        zIndex: 0
    },

    config: {
        /**
         * @cfg {Number} height
         * The height of this component in pixels (defaults to auto).
         * <b>Note</b> to express this dimension as a percentage or offset see {@link Ext.Component#anchor}.
         */
        height: 352,

        /**
         * @cfg {Number} width
         * The width of this component in pixels (defaults to auto).
         * <b>Note</b> to express this dimension as a percentage or offset see {@link Ext.Component#anchor}.
         */
        width: 512,

        background: false,

        renderTo: false,

        items: [],

        groups: [],

        gradients: []
    },

    constructor: function(config) {
        var me = this;

        me.initConfig(config);

        me.domRef = Ext.getDoc().dom;
        me.customAttributes = {};
        me.mixins.observable.constructor.apply(me, arguments);

        me.getId();
        
        if (me.getRenderTo()) {
            me.render(me.getRenderTo());
        }
    },

    /**
     * @private initializes surface events. Should be called after render.
     */
    initializeEvents: function() {
        //NOTE: drag events have been moved to a deferred function.

        var me = this, events = {};
        Ext.Array.each(Ext.draw.Surface.eventNames, function(name) {
            events[name] = function (e){
                me.processEvent.apply(me, [name].concat(Array.prototype.slice.call(arguments)));
            }
        });
        //<deprecated product=charts since=2.0>
        events.taphold = events.longpress;
        //</deprecated>
        events.scope = me;
        me.element.on(events);
    },

    /**
     * Add a custom attribute to the surface
     * @param {String} attr
     * @param {Function} handler
     */
    addCustomAttribute: function(attr, handler) {
        var me = this;
        me.customAttributes[attr] = handler;
        this.dirt();
    },

    /**
     * Remove a custom attribute.
     * @param {String} attr The name of the custom attribute.
     */
    removeCustomAttribute: function(attr) {
       delete this.customAttributes[attr];
    },

    // TODO: check if this is needed any more
    initializeDragEvents: function() {
        var me = this;

        if (me.dragEventsInitialized) {
            return;
        }

        me.dragEventsInitialized = true;

//        me.element.on({
//            scope: me,
//            dragstart: me.onDragStart,
//            drag: me.onDrag,
//            dragend: me.onDragEnd
//        });
    },

    // @private called to initialize components in the surface
    // this is dependent on the underlying implementation.
    initSurface: Ext.emptyFn,

    // @private called to setup the surface to render an item
    //this is dependent on the underlying implementation.
    renderItem: Ext.emptyFn,

    // @private
    renderItems: Ext.emptyFn,

    renderFrame: function () {
        this.dirty = false;
    },

    // @private
    setViewBox: Ext.emptyFn,

    // @private
    tween: Ext.emptyFn,

    /**
     * Adds one or more CSS classes to the element. Duplicate classes are automatically filtered out.
     *
     * For example:
     *
     *          drawComponent.surface.addCls(sprite, 'x-visible');
     *
     * @param {Object} sprite The sprite to add the class to.
     * @param {String/Array} className The CSS class to add, or an array of classes
     */
    addCls: Ext.emptyFn,

    /**
     * Removes one or more CSS classes from the element.
     *
     * For example:
     *
     *      drawComponent.surface.removeCls(sprite, 'x-visible');
     *
     * @param {Object} sprite The sprite to remove the class from.
     * @param {String/Array} className The CSS class to remove, or an array of classes
     */
    removeCls: Ext.emptyFn,

    /**
     * Sets CSS style attributes to an element.
     *
     * For example:
     *
     *      drawComponent.surface.setStyle(sprite, {
     *          'cursor': 'pointer'
     *      });
     *
     * @param {Object} sprite The sprite to add, or an array of classes to
     * @param {Object} styles An Object with CSS styles.
     */
    setStyle: Ext.emptyFn,

    // @private
    createWrapEl: function(container) {
        return Ext.fly(container).createChild({tag: 'div', cls: Ext.baseCSSPrefix + 'surface-wrap', style: 'overflow:hidden', id: this.id + '-wrap'});
    },

    // @private
    applyGradients: function(gradients) {
        var result = {};
        if (gradients) {
            Ext.each(gradients, function (gradient){
                gradient = this.parseGradient(gradient);
                result[gradient.id] = gradient;
            }, this);
        }
        return result;
    },

    // @private
    applyItems: function(items, oldItems) {
        var result;
        if (items instanceof Ext.draw.CompositeSprite) {
            result = items;
        } else {
            result = new Ext.draw.CompositeSprite({surface: this});
            result.addAll(this.prepareItems(items, true));
        }

        if (oldItems) {
            if (items != oldItems) {
                oldItems.destroy();
            }
        }

        return result;
    },

    applyGroups: function(groups, oldGroups) {
        var result = new Ext.util.MixedCollection();
        if (groups instanceof Ext.util.MixedCollection) {
            result = groups;
        } else {
            result.addAll(groups);
        }
        if (oldGroups) {
            oldGroups.each(function (group) {
                if (!result.contains()) {
                    group.destroy();
                }
            });
        }
        return result;
    },

    // @private
    applyBackground: function(background) {
        var me = this,
            gradientId,
            gradient,
            width = me.getWidth(),
            height = me.getHeight();
        if (background) {
            if (background.renderGradient) {
                gradient = background.renderGradient;
                gradientId = gradient.id;
                me.addGradient(gradient);
                return me.add({
                    type: 'rect',
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                    fill: 'url(#' + gradientId + ')',
                    zIndex: -100
                });
            } else if (background.fill) {
                return me.add({
                    type: 'rect',
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                    fill: background.fill,
                    zIndex: -100
                });
            } else if (background.image) {
                return me.add({
                    type: 'image',
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                    src: background.image,
                    zIndex: -100
                });
            }
        }
    },

    /**
     * Sets the size of the surface. Accomodates the background (if any) to fit the new size too.
     *
     * For example:
     *
     *      drawComponent.surface.setSize(500, 500);
     *
     * This method is generally called when also setting the size of the draw Component.
     *
     * @param {Number} w The new width of the canvas.
     * @param {Number} h The new height of the canvas.
     */
    setSize: function(w, h) {
        if (this.getBackground()) {
            this.getBackground().setAttributes({
                width: w,
                height: h,
                hidden: false
            }, true);
        }
        this.setWidth(w);
        this.setHeight(h);
        this.updateSurfaceElBox();
    },

    // @private
    scrubAttrs: function(sprite) {
        var me = this,
            attrs = {},
            exclude = {},
            sattr = sprite.attr,
            i;
        for (i in sattr) {
            // Narrow down attributes to the main set
            if (me.translateAttrs.hasOwnProperty(i)) {
                // Translated attr
                attrs[me.translateAttrs[i]] = sattr[i];
                exclude[me.translateAttrs[i]] = true;
            }
            else if (me.availableAttrs.hasOwnProperty(i) && !exclude[i]) {
                // Passtrhough attr
                attrs[i] = sattr[i];
            }
        }
        return attrs;
    },

    // @private - Normalize a delegated single event from the main container to each sprite and sprite group
    processEvent: function(name, e) {
        var me = this,
            sprite = me.getSpriteForEvent(e);
        if (sprite) {
            sprite.fireEvent(name, sprite, e);
        }
        me.fireEvent.apply(me, arguments);
    },

    /**
     * @protected - For a given event, find the Sprite corresponding to it if any.
     * @return {Ext.draw.Sprite} The sprite instance, or null if none found.
     */
    getSpriteForEvent: function(e) {
        return null;
    },

    /**
     * Add a gradient definition to the Surface. Note that in some surface engines, adding
     * a gradient via this method will not take effect if the surface has already been rendered.
     * Therefore, it is preferred to pass the gradients as an item to the surface config, rather
     * than calling this method, especially if the surface is rendered immediately (e.g. due to
     * 'renderTo' in its config). For more information on how to create gradients in the Chart
     * configuration object please refer to {@link Ext.chart.Chart}.
     *
     * The gradient object to be passed into this method is composed by:
     *
     *
     *  - **id** - string - The unique name of the gradient.
     *  - **angle** - number, optional - The angle of the gradient in degrees.
     *  - **stops** - object - An object with numbers as keys (from 0 to 100) and style objects as values.
     *
     *
     For example:
                drawComponent.surface.addGradient({
                    id: 'gradientId',
                    angle: 45,
                    stops: {
                        0: {
                            color: '#555'
                        },
                        100: {
                            color: '#ddd'
                        }
                    }
                });
     */
    addGradient: function(grad) {
        var me = this;
        grad = me.parseGradient(grad);
        me.getGradients()[grad.id] = grad;
    },
    parseGradient: Ext.emptyFn,

    /**
     * Add a Sprite to the surface. See {@link Ext.draw.Sprite} for the configuration object to be passed into this method.
     *
     * For example:
     *
     *     drawComponent.surface.add({
     *         type: 'circle',
     *         fill: '#ffc',
     *         radius: 100,
     *         x: 100,
     *         y: 100
     *     });
     *
    */
    add: function() {
        var me = this,
            args = Array.prototype.slice.call(arguments),
            hasMultipleArgs = args.length > 1,
            sprite, items, i, ln, item, results;

        if (hasMultipleArgs || Ext.isArray(args[0])) {
            items = hasMultipleArgs ? args : args[0];
            results = [];

            for (i = 0, ln = items.length; i < ln; i++) {
                item = items[i];
                item = me.add(item);
                results.push(item);
            }

            return results;
        }
        sprite = me.prepareItems(args[0], true)[0];
        me.normalizeSpriteCollection(sprite);
        me.onAdd(sprite);
        me.dirt();
        return sprite;
    },

    /**
     * @private
     * Insert or move a given sprite into the correct position in the items
     * MixedCollection, according to its zIndex. Will be inserted at the end of
     * an existing series of sprites with the same or lower zIndex. If the sprite
     * is already positioned within an appropriate zIndex group, it will not be moved.
     * This ordering can be used by subclasses to assist in rendering the sprites in
     * the correct order for proper z-index stacking.
     * @param {Ext.draw.Sprite} sprite
     * @return {Number} the sprite's new index in the list
     */
    normalizeSpriteCollection: function(sprite) {
        var items = this.getItems(),
            zIndex = sprite.attr.zIndex,
            idx = items.indexOf(sprite);

        if (idx < 0 || (idx > 0 && items.getAt(idx - 1).attr.zIndex > zIndex) ||
                (idx < items.length - 1 && items.getAt(idx + 1).attr.zIndex < zIndex)) {
            items.removeAt(idx);
            idx = items.findIndexBy(function(otherSprite) {
                return otherSprite.attr.zIndex > zIndex;
            });
            if (idx < 0) {
                idx = items.length;
            }
            items.insert(idx, sprite);
        }
        return idx;
    },

    onAdd: function(sprite) {
        var group = sprite.group,
            draggable = sprite.draggable,
            groups, ln, i;
        if (group) {
            groups = [].concat(group);
            ln = groups.length;
            for (i = 0; i < ln; i++) {
                group = groups[i];
                this.getGroup(group).add(sprite);
            }
            delete sprite.group;
        }
        if (draggable) {
            sprite.initDraggable();
        }
    },

    /**
     * Remove a given sprite from the surface, optionally destroying the sprite in the process.
     * You can also call the sprite own `remove` method.
     *
     * For example:
     *
     *      drawComponent.surface.remove(sprite);
     *      //or...
     *      sprite.remove();
     *
     * @param {Ext.draw.Sprite} sprite
     * @param {Boolean} destroySprite
     * @return {Number} the sprite's new index in the list
     */
    remove: function(sprite, destroySprite) {
        if (sprite) {
            this.getItems().remove(sprite);
            this.getGroups().each(function(item) {
                item.remove(sprite);
            });
            sprite.onRemove();
            if (destroySprite === true) {
                sprite.destroy();
            }
            this.dirt();
        }
    },

    /**
     * Remove all sprites from the surface, optionally destroying the sprites in the process.
     *
     * For example:
     *
     *      drawComponent.surface.removeAll();
     *
     * @param {Boolean} destroySprites Whether to destroy all sprites when removing them.
     * @return {Number} The sprite's new index in the list.
     */
    removeAll: function(destroySprites) {
        var items = this.getItems().items,
            ln = items.length,
            i;
        for (i = ln - 1; i > -1; i--) {
            this.remove(items[i], destroySprites);
        }
    },

    onRemove: Ext.emptyFn,

    onDestroy: Ext.emptyFn,

    // @private
    applyTransformations: function(sprite) {
        sprite.bbox.transform = 0;
        sprite.dirtyTransform = false;

        var me = this,
            dirty = false,
            attr = sprite.attr;

        if (attr.translation.x != null || attr.translation.y != null) {
            me.translate(sprite);
            dirty = true;
        }
        if (attr.scaling.x != null || attr.scaling.y != null) {
            me.scale(sprite);
            dirty = true;
        }
        if (attr.rotation.degrees != null) {
            me.rotate(sprite);
            dirty = true;
        }
        if (dirty) {
            sprite.bbox.transform = 0;
            me.transform(sprite);
            sprite.transformations = [];
        }
    },

    // @private
    rotate: function (sprite) {
        var bbox,
            deg = sprite.attr.rotation.degrees,
            centerX = sprite.attr.rotation.x,
            centerY = sprite.attr.rotation.y,
            trans = sprite.attr.translation,
            dx = trans && trans.x || 0,
            dy = trans && trans.y || 0;
        if (!Ext.isNumber(centerX) || !Ext.isNumber(centerY)) {
            bbox = this.getBBox(sprite, true); //isWithoutTransform=true
            centerX = !Ext.isNumber(centerX) ? (bbox.x + dx) + bbox.width / 2 : centerX;
            centerY = !Ext.isNumber(centerY) ? (bbox.y + dy) + bbox.height / 2 : centerY;
        }
        sprite.transformations.push({
            type: "rotate",
            degrees: deg,
            x: centerX,
            y: centerY
        });
    },

    // @private
    translate: function(sprite) {
        var x = sprite.attr.translation.x || 0,
            y = sprite.attr.translation.y || 0;
        sprite.transformations.push({
            type: "translate",
            x: x,
            y: y
        });
    },

    // @private
    scale: function(sprite) {
        var bbox,
            x = sprite.attr.scaling.x || 1,
            y = sprite.attr.scaling.y || 1,
            centerX = sprite.attr.scaling.centerX,
            centerY = sprite.attr.scaling.centerY;

        if (!Ext.isNumber(centerX) || !Ext.isNumber(centerY)) {
            bbox = this.getBBox(sprite);
            centerX = !Ext.isNumber(centerX) ? bbox.x + bbox.width / 2 : centerX;
            centerY = !Ext.isNumber(centerY) ? bbox.y + bbox.height / 2 : centerY;
        }
        sprite.transformations.push({
            type: "scale",
            x: x,
            y: y,
            centerX: centerX,
            centerY: centerY
        });
    },

    createGroup: function(id) {
        var group = this.getGroups().get(id);
        if (!group) {
            group = new Ext.draw.CompositeSprite({surface: this});
            group.id = id || Ext.id(null, 'ext-surface-group-');
            this.getGroups().add(group);
        }
        this.dirt();
        return group;
    },

    removeGroup: function(group) {
        if (Ext.isString(group)){
            group = this.getGroups().get(group);
        }
        if (group) {
            this.getGroups().remove(group);
        }
        this.dirt();
    },
    /**
     * Returns a new group or an existent group associated with the current surface.
     * The group returned is a {@link Ext.draw.CompositeSprite} group.
     *
     * For example:
     *
     *      var spriteGroup = drawComponent.surface.getGroup('someGroupId');
     *
     * @param {String} id The unique identifier of the group.
     * @return {Object} The {@link Ext.draw.CompositeSprite}.
     */
    getGroup: function(id) {
        if (typeof id == "string") {
            var group = this.getGroups().get(id);
            if (!group) {
                group = this.createGroup(id);
            }
        } else {
            group = id;
        }
        return group;
    },
    
    // @private
    prepareItems: function(items, applyDefaults) {
        items = [].concat(items);
        // Make sure defaults are applied and item is initialized
        var item, i, ln, me = this;
        for (i = 0, ln = items.length; i < ln; i++) {
            item = items[i];
            if (!(item instanceof Ext.draw.Sprite)) {
                // Temporary, just take in configs...
                item.surface = me;
                items[i] = me.createItem(item);
            } else {
                item.surface = me;
            }
        }
        return items;
    },

    /**
     * Changes the text in the sprite element. The sprite must be a `text` sprite.
     * This method can also be called from {@link Ext.draw.Sprite}.
     *
     * For example:
     *
     *      var spriteGroup = drawComponent.surface.setText(sprite, 'my new text');
     *
     * @param {Object} sprite The Sprite to change the text.
     * @param {String} text The new text to be set.
     */
    setText: Ext.emptyFn,

    //@private Creates an item and appends it to the surface. Called
    //as an internal method when calling `add`.
    createItem: Ext.emptyFn,

    /**
     * Retrieves the id of this component.
     * Will autogenerate an id if one has not already been set.
     */
    getId: function() {
        return this.id || (this.id = Ext.id(null, 'ext-surface-'));
    },

    /**
     * Destroys the surface. This is done by removing all components from it and
     * also removing its reference to a DOM element.
     *
     * For example:
     *
     *      drawComponent.surface.destroy();
     */
    destroy: function() {
        delete this.domRef;
        this.removeAll(true);
        this.setGroups([]);
        this.getItems().destroy();
        this.callParent();
    },

    //Empty the surface (without destroying it)
    clear: Ext.emtpyFn,

    dirt: function () {
        this.dirty = true;
    },

    /**
     * @private update the position/size/clipping of the series surface to match the current
     * chartBBox and the stored zoom/pan properties.
     */
    updateSurfaceElBox: function() {

        var me = this,
            floor = Math.floor,
            surfaceWidth = me.getWidth(),
            surfaceHeight = me.getHeight(),
            width = floor(surfaceWidth * me.zoomX),
            height = floor(surfaceHeight * me.zoomY),
            panX = me.panX,
            panY = me.panY,
            maxWidth = 2000,
            maxHeight = 1500,
            surfaceEl = me.surfaceEl,
            surfaceDom = surfaceEl.dom,
            ctx = me.surfaceEl.dom.getContext('2d'),
            setTranslation = false,
            newWidth, newHeight,
            diffX, diffY;

        // adjust the surfaceEl to match current zoom/pan; only if the size is changing to prevent
        // the canvas from getting cleared as happens when width/height are set.
        if (surfaceDom.width != width || surfaceDom.height != height) {
            surfaceEl.setSize(width, height);
            surfaceDom.width = width;
            surfaceDom.height = height;

            //TODO(nico): this is canvas specific.
            //this with the pixel check should be moved to
            //Canvas.js.
            if (setTranslation) {
                ctx.translate(diffX, diffY);
            }
        }

        surfaceEl.setTop(panY);
        surfaceEl.setLeft(panX);
        this.dirt();
    },

    /**
     * Sets the persistent transform and updates the surfaceEl's size and position to match.
     * @param {Number} panX
     * @param {Number} panY
     * @param {Number} zoomX
     * @param {Number} zoomY
     */
    setSurfaceTransform: function(panX, panY, zoomX, zoomY) {
        var me = this;
        me.panX = panX;
        me.panY = panY;
        me.zoomX = zoomX;
        me.zoomY = zoomY;
        me.setSurfaceFastTransform(null);
        me.updateSurfaceElBox();
        me.renderFrame();
    },

    /**
     * Sets a fast CSS3 transform on the surfaceEl.
     * @param {Ext.draw.Matrix} matrix
     */
    setSurfaceFastTransform: function(matrix) {
        this.transformMatrix = matrix;
        this.surfaceEl.setStyle({
            webkitTransformOrigin: '0 0',
            webkitTransform: matrix ? matrix.toSvg() :'matrix(1,0,0,1,0,0)'
        });
        this.renderFrame();
    },

    /**
     * Returns the preferred default value for a sprite attribute.
     */
    getDefaultAttribute: function(name) {
        var me = this;
        if (name in me.availableAttrs) {
            return me.availableAttrs[name];
        }
        return false;
    }

});
})();


