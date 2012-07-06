/**
 * @class Ext.draw.Sprite
 * @extends Object
 *
 * A Sprite is an object rendered in a Drawing surface. There are different options and types of sprites.
 * The configuration of a Sprite is an object with the following properties:
 *
 * - **type** - (String) The type of the sprite. Possible options are 'circle', 'path', 'rect', 'text', 'square', 'image'.
 * - **group** - (String/Array) The group that this sprite belongs to, or an array of groups. Only relevant when added to a {@link Ext.draw.Surface}. 
 * - **width** - (Number) Used in rectangle sprites, the width of the rectangle.
 * - **height** - (Number) Used in rectangle sprites, the height of the rectangle.
 * - **size** - (Number) Used in square sprites, the dimension of the square.
 * - **radius** - (Number) Used in circle sprites, the radius of the circle.
 * - **x** - (Number) The position along the x-axis.
 * - **y** - (Number) The position along the y-axis.
 * - **path** - (Array) Used in path sprites, the path of the sprite written in SVG-like path syntax.
 * - **opacity** - (Number) The opacity of the sprite.
 * - **fill** - (String) The fill color.
 * - **stroke** - (String) The stroke color.
 * - **stroke-width** - (Number) The width of the stroke.
 * - **font** - (String) Used with text type sprites. The full font description. Uses the same syntax as the CSS `font` parameter.
 * - **text** - (String) Used with text type sprites. The text itself.
 * 
 * Additionally there are three transform objects that can be set with `setAttributes` which are `translate`, `rotate` and
 * `scale`.
 * 
 * For translate, the configuration object contains x and y attributes that indicate where to
 * translate the object. For example:
 * 
 *     sprite.setAttributes({
 *       translate: {
 *        x: 10,
 *        y: 10
 *       }
 *     }, true);
 * 
 * For rotation, the configuration object contains x and y attributes for the center of the rotation (which are optional),
 * and a `degrees` attribute that specifies the rotation in degrees. For example:
 * 
 *     sprite.setAttributes({
 *       rotate: {
 *        degrees: 90
 *       }
 *     }, true);
 * 
 * For scaling, the configuration object contains x and y attributes for the x-axis and y-axis scaling. For example:
 * 
 *     sprite.setAttributes({
 *       scale: {
 *        x: 10,
 *        y: 3
 *       }
 *     }, true);
 *
 * Sprites can be created with a reference to a {@link Ext.draw.Surface}
 *
 *      var drawComponent = Ext.create('Ext.draw.Component', options here...);
 *
 *      var sprite = Ext.create('Ext.draw.Sprite', {
 *          type: 'circle',
 *          fill: '#ff0',
 *          surface: drawComponent.surface,
 *          radius: 5
 *      });
 *
 * Sprites can also be added to the surface as a configuration object:
 *
 *      var sprite = drawComponent.surface.add({
 *          type: 'circle',
 *          fill: '#ff0',
 *          radius: 5
 *      });
 *
 * In order to properly apply properties and render the sprite we have to
 * `show` the sprite setting the option `redraw` to `true`:
 *
 *      sprite.show(true);
 *
 * The constructor configuration object of the Sprite can also be used and passed into the {@link Ext.draw.Surface}
 * add method to append a new sprite to the canvas. For example:
 *
 *     drawComponent.surface.add({
 *         type: 'circle',
 *         fill: '#ffc',
 *         radius: 100,
 *         x: 100,
 *         y: 100
 *     });
 */

/**
 * @cfg {String} type The type of the sprite. Possible options are 'circle', 'path', 'rect', 'text', 'square', 'image'
 */

/**
 * @cfg {Number} width Used in rectangle sprites, the width of the rectangle
 */

/**
 * @cfg {Number} height Used in rectangle sprites, the height of the rectangle
 */

/**
 * @cfg {Number} size Used in square sprites, the dimension of the square
 */

/**
 * @cfg {Number} radius Used in circle sprites, the radius of the circle
 */

/**
 * @cfg {Number} x The position along the x-axis
 */

/**
 * @cfg {Number} y The position along the y-axis
 */

/**
 * @cfg {Array} path Used in path sprites, the path of the sprite written in SVG-like path syntax
 */

/**
 * @cfg {Number} opacity The opacity of the sprite
 */

/**
 * @cfg {String} fill The fill color
 */

/**
 * @cfg {String} stroke The stroke color
 */

/**
 * @cfg {Number} stroke-width The width of the stroke
 */

/**
 * @cfg {String} font Used with text type sprites. The full font description. Uses the same syntax as the CSS font parameter
 */

/**
 * @cfg {String} text Used with text type sprites. The text itself
 */

/**
 * @cfg {String/Array} group The group that this sprite belongs to, or an array of groups. Only relevant when added to a
 * {@link Ext.draw.Surface}
 */

/**
 * @event beforedestroy
 * @event destroy
 * @event render
 * @event mousedown
 * @event mouseup
 * @event mouseover
 * @event mouseout
 * @event mousemove
 * @event click
 * @event rightclick
 * @event mouseenter
 * @event mouseleave
 * @event touchstart
 * @event touchmove
 * @event touchend
 */

Ext.define('Ext.draw.Sprite', { 
 
    mixins: {
        identifiable: 'Ext.mixin.Identifiable',
        observable: 'Ext.util.Observable'
    },

    dirty: false,
    dirtyHidden: false,
    dirtyTransform: false,
    dirtyPath: true,
    dirtyFont: true,
    zIndexDirty: true,
    isSprite: true,
    zIndex: 0,
    fontProperties: [
        'font',
        'font-size',
        'font-weight',
        'font-style',
        'font-family',
        'text-anchor',
        'text'
    ],
    pathProperties: [
        'x',
        'y',
        'd',
        'path',
        'height',
        'width',
        'radius',
        'r',
        'rx',
        'ry',
        'cx',
        'cy'
    ],

    minDefaults: {
        circle: {
            cx: 0,
            cy: 0,
            r: 0,
            fill: "none"
        },
        ellipse: {
            cx: 0,
            cy: 0,
            rx: 0,
            ry: 0,
            fill: "none"
        },
        rect: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            rx: 0,
            ry: 0,
            fill: "none"
        },
        text: {
            x: 0,
            y: 0,
            "text-anchor": "start",
            fill: "#000"
        },
        path: {
            d: "M0,0",
            fill: "none"
        },
        image: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            preserveAspectRatio: "none"
        }
    },

    constructor: function(config) {
        var me = this;
        config = config || {};
        me.id = config.id || Ext.id(null, 'ext-sprite-');
        me.transformations = [];
        me.surface = config.surface;
        me.group = config.group;
        me.type = config.type;
        //attribute bucket
        me.bbox = {};
        me.attr = {
            zIndex: 0,
            translation: {
                x: null,
                y: null
            },
            rotation: {
                degrees: null,
                x: null,
                y: null
            },
            scaling: {
                x: null,
                y: null,
                cx: null,
                cy: null
            }
        };
        //delete not bucket attributes
        delete config.surface;
        delete config.group;
        delete config.type;
        Ext.applyIf(config, me.minDefaults[me.type]);
        me.setAttributes(config);
        
        me.mixins.observable.constructor.apply(me, arguments);

        //make animate instance
        me.fx = new Ext.fx.Sprite({
            sprite: me
        });
    },

    getAttribute: function(name) {
        var me = this,
            attr = me.attr;

        if (name == 'translate' && attr.translation) {
            return attr.translation;
        }
        if (name == 'scale' && attr.scaling) {
            return attr.scaling;
        }
        if (name == 'rotate' && attr.rotation) {
            return attr.rotation;
        }
        if (name in me.attr) {
            return me.attr[name];
        }
        return me.surface.getDefaultAttribute(name) || null;
    },

    /**
     * Change the attributes of the sprite.
     * @param {Object} attrs attributes to be changed on the sprite.
     * @param {Boolean} redraw Flag to immediatly draw the change.
     * @return {Ext.draw.Sprite} this
     */
    setAttributes: function(attrs, redraw) {
        if (!attrs) {
          return this;
        }

        var me = this,
            fontProps = me.fontProperties,
            fontPropsLength = fontProps.length,
            pathProps = me.pathProperties,
            pathPropsLength = pathProps.length,
            hasSurface = !!me.surface,
            custom = hasSurface && me.surface.customAttributes || {},
            spriteAttrs = me.attr,
            attr, i, translate, translation, rotate, rotation, scale, scaling;

        for (attr in custom) {
            if (attrs.hasOwnProperty(attr) && typeof custom[attr] == "function") {
                Ext.apply(attrs, custom[attr].apply(me, [].concat(attrs[attr])));
            }
        }

        // Flag a change in hidden
        if (!!attrs.hidden !== !!spriteAttrs.hidden) {
            me.dirtyHidden = true;
        }

        // Flag path change
        for (i = 0; i < pathPropsLength; i++) {
            attr = pathProps[i];
            if (attr in attrs && attrs[attr] !== spriteAttrs[attr]) {
                me.dirtyPath = true;
                break;
            }
        }

        // Flag zIndex change
        if ('zIndex' in attrs && attrs.zIndex != spriteAttrs.zIndex) {
            me.zIndexDirty = true;
        }

        // Flag font/text change
        for (i = 0; i < fontPropsLength; i++) {
            attr = fontProps[i];
            if (attr in attrs && attrs[attr] !== spriteAttrs[attr]) {
                me.dirtyFont = true;
                break;
            }
        }

        translate = attrs.translate || attrs.translation;
        translation = spriteAttrs.translation;
        if (translate) {
            if ((('x' in translate) && translate.x !== translation.x) ||
                (('y' in translate) && translate.y !== translation.y)) {
                Ext.apply(translation, translate);
                me.dirtyTransform = true;
            }
        }

        rotate = attrs.rotate || attrs.rotation;
        rotation = spriteAttrs.rotation;
        if (rotate) {
            if ((('x' in rotate) && rotate.x !== rotation.x) || 
                (('y' in rotate) && rotate.y !== rotation.y) ||
                (('degrees' in rotate) && rotate.degrees !== rotation.degrees)) {
                Ext.apply(rotation, rotate);
                me.dirtyTransform = true;
            }
        }

        scale = attrs.scale || attrs.scaling;
        scaling = spriteAttrs.scaling;
        if (scale) {
            if ((('x' in scale) && scale.x !== scaling.x) || 
                (('y' in scale) && scale.y !== scaling.y) ||
                (('cx' in scale) && scale.cx !== scaling.cx) ||
                (('cy' in scale) && scale.cy !== scaling.cy)) {
                Ext.apply(scaling, scale);
                me.dirtyTransform = true;
            }
        }

        for (var key in attrs) {
            var v = attrs[key];
            if (key == 'rotate') {
                key = 'rotation';
            } else if (key == 'scale') {
                key = 'scaling';
            } else if (key == 'translate') {
                key = 'translation';
            }
            spriteAttrs[key] = v;
        }

        // If the bbox is changed, then the bbox based transforms should be invalidated.
        if (me.dirtyPath && !me.dirtyTransform) {
            if (spriteAttrs.rotation.x === null ||
                spriteAttrs.rotation.y === null ||
                spriteAttrs.scaling.x === null ||
                spriteAttrs.scaling.y === null) {
                me.dirtyTransform = true;
            }
        }
        
        me.dirt();

        if (redraw === true && hasSurface) {
            me.redraw();
        }
        return this;
    },

    /**
     * Retrieve the bounding box of the sprite. This will be returned as an object with x, y, width, and height properties.
     * @return {Object} bbox
     */
    getBBox: function(isWithoutTransform) {
        return this.surface.getBBox(this, isWithoutTransform);
    },
    
    setText: function(text) {
        return this.surface.setText(this, text);
    },

    /**
     * Hide the sprite.
     * @param {Boolean} redraw Flag to immediatly draw the change.
     * @return {Ext.draw.Sprite} this
     */
    hide: function(redraw) {
        this.setAttributes({
            hidden: true
        }, redraw);
        return this;
    },

    /**
     * Show the sprite.
     * @param {Boolean} redraw Flag to immediatly draw the change.
     * @return {Ext.draw.Sprite} this
     */
    show: function(redraw) {
        this.setAttributes({
            hidden: false
        }, redraw);
        return this;
    },

    /**
     * Remove the sprite.
     */
    remove: function() {
        if (this.surface) {
            this.surface.remove(this);
            return true;
        }
        return false;
    },

    onRemove: function() {
        this.surface.onRemove(this);
    },

    /**
     * Removes the sprite and clears all listeners.
     */
    destroy: function() {
        var me = this;
        if (me.fireEvent('beforedestroy', me) !== false) {
            me.remove();
            me.surface.onDestroy(me);
            if (me.fx) {
                me.fx.stop();
                delete me.fx;
            }
            me.clearListeners();
            me.fireEvent('destroy');
        }
        this.callParent();
    },

    /**
     * Redraw the sprite.
     * @return {Ext.draw.Sprite} this
     */
    redraw: function() {
        this.surface.renderItem(this);
        return this;
    },

    /**
     * Draw a sprite Tween (animation interpolation).
     * @return {Ext.draw.Sprite} this
     */
    tween: function() {
        this.surface.tween(this);
        return this;
    },

    dirt: function() {
        if (!this.dirty) {
            this.dirty = true;
            if (this.surface) {
                this.surface.dirt();
            }
        }
        return this;
    },
    /**
     * Wrapper for setting style properties, also takes single object parameter of multiple styles.
     * @param {String/Object} property The style property to be set, or an object of multiple styles.
     * @param {String} value (optional) The value to apply to the given property, or null if an object was passed.
     * @return {Ext.draw.Sprite} this
     */
    setStyle: function() {
        this.element.setStyle.apply(this.element, arguments);
        return this;
    },

    /**
     * Adds one or more CSS classes to the element. Duplicate classes are automatically filtered out.  Note this method
     * is severly limited in VML.
     * @param {String/Array} className The CSS class to add, or an array of classes
     * @return {Ext.draw.Sprite} this
     */
    addCls: function(obj) {
        this.surface.addCls(this, obj);
        return this;
    },

    /**
     * Removes one or more CSS classes from the element.
     * @param {String/Array} className The CSS class to remove, or an array of classes.  Note this method
     * is severly limited in VML.
     * @return {Ext.draw.Sprite} this
     */
    removeCls: function(obj) {
        this.surface.removeCls(this, obj);
        return this;
    }
});

