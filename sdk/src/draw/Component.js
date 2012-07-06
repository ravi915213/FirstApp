/**
 * @class Ext.draw.Component
 * @extends Ext.Component
 *
 * The Draw Component is a surface in which sprites can be rendered. The Draw Component
 * manages and holds a `Surface` instance: an interface that has
 * an SVG or VML implementation depending on the browser capabilities and where
 * Sprites can be appended.
 * One way to create a draw component is:
 *
 *     var drawComponent = new Ext.draw.Component({
 *         items: [{
 *             type: 'circle',
 *             fill: '#79BB3F',
 *             radius: 100,
 *             x: 100,
 *             y: 100
 *         }]
 *     });
 *
 *     new Ext.Panel({
 *         fullscreen: true,
 *         items: [drawComponent]
 *     });
 *
 * In this case we created a draw component and added a sprite to it.
 * The *type* of the sprite is *circle* so if you run this code you'll see a yellow-ish
 * circle in a Window. When setting `viewBox` to `false` we are responsible for setting the object's position and
 * dimensions accordingly.
 *
 * You can also add sprites by using the surface's add method:
 *
 *     drawComponent.surface.add({
 *         type: 'circle',
 *         fill: '#79BB3F',
 *         radius: 100,
 *         x: 100,
 *         y: 100
 *     });
 *
 * For more information on Sprites, the core elements added to a draw component's surface,
 * refer to the {@link Ext.draw.Sprite} documentation.
 */
Ext.define('Ext.draw.Component', { 
    
    extend: 'Ext.Component',

    uses: [
        'Ext.draw.Surface'
    ],
    /**
     * @cfg {Array} enginePriority
     * Defines the priority order for which Surface implementation to use. The first
     * one supported by the current environment will be used.
     */
    enginePriority: ['Canvas'],

    config: {
        
        baseCls: 'ext-surface',

        componentLayout: 'draw',

        /**
         * @cfg {Boolean} viewBox
         * Turn on view box support which will scale and position items in the draw component to fit to the component while
         * maintaining aspect ratio. Note that this scaling can override other sizing settings on yor items.
         */
        viewBox: true,

        /**
         * @cfg {Boolean} autoSize
         * Turn on autoSize support which will set the bounding div's size to the natural size of the contents.
         */
        autoSize: false,

        /**
         * @cfg {Array} gradients (optional) Define a set of gradients that can be used as `fill` property in sprites.
         * The gradients array is an array of objects with the following properties:
         *
         * <ul>
         * <li><strong>id</strong> - string - The unique name of the gradient.</li>
         * <li><strong>angle</strong> - number, optional - The angle of the gradient in degrees.</li>
         * <li><strong>stops</strong> - object - An object with numbers as keys (from 0 to 100) and style objects
         * as values</li>
         * </ul>
         *

         For example:

         <pre><code>
            gradients: [{
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
            },  {
                id: 'gradientId2',
                angle: 0,
                stops: {
                    0: {
                        color: '#590'
                    },
                    20: {
                        color: '#599'
                    },
                    100: {
                        color: '#ddd'
                    }
                }
            }]
         </code></pre>

         Then the sprites can use `gradientId` and `gradientId2` by setting the fill attributes to those ids, for example:

         <pre><code>
            sprite.setAttributes({
                fill: 'url(#gradientId)'
            }, true);
         </code></pre>

         */
        gradients: []
    },

    cls: 'x-draw-component',

    initialize: function() {
        var me = this,
            viewBox = me.getViewBox(),
            autoSize = me.getAutoSize(),
            bbox, items, width, height, x, y;

        me.callParent();
        me.surface = me.createSurface();
        //Create the Surface on initial render
     
        items = me.surface.getItems();

        if (viewBox || autoSize) {
            bbox = items.getBBox();
            width = bbox.width;
            height = bbox.height;
            x = bbox.x;
            y = bbox.y;
            if (me.getViewBox()) {
                me.surface.setViewBox(x, y, width, height);
            }
            else {
                // AutoSized
                me.autoSizeSurface();
            }
        }

        me.relayEvents(me.getEventsSurface(), Ext.draw.Surface.eventNames);

        // Relay all mouse/touch events from the surface
        me.on('painted', 'onPainted');
        me.sizeMonitor = new Ext.util.SizeMonitor({
            element: me.renderElement,
            callback: me.onResize,
            scope: me
        });
    },

    onPainted: function() {
        var me = this;
        me.sizeMonitor.refresh();
        me.onResize();
    },

    onResize: function () {
        var me = this,
            viewBox = me.getViewBox(),
            autoSize = me.getAutoSize(),
            items = me.surface.getItems(),
            bbox, items, width, height, x, y;

        if (viewBox || autoSize) {
            bbox = items.getBBox();
            width = bbox.width;
            height = bbox.height;
            x = bbox.x;
            y = bbox.y;
            if (me.getViewBox()) {
                me.surface.setViewBox(x, y, width, height);
            }
            else {
                // AutoSized
                me.autoSizeSurface();
            }
        }
        me.surface.setSize(me.element.getWidth(), me.element.getHeight());
        me.surface.updateSurfaceElBox();
        me.surface.renderFrame();
    },

    /**
     * @private Return a reference to the {@link Ext.draw.Surface} instance from which events
     * should be relayed.
     */
    getEventsSurface: function() {
        return this.surface;
    },

    //@private
    autoSizeSurface: function() {
        var me = this,
            items = me.surface.getItems(),
            bbox = items.getBBox(),
            width = bbox.width,
            height = bbox.height;
        items.setAttributes({
            translate: {
                x: -bbox.x,
                //Opera has a slight offset in the y axis.
                y: -bbox.y + (+Ext.isOpera)
            }
        }, true);
        if (me.rendered) {
            me.setSize(width, height);
        }
        me.surface.setSize(width, height);
        me.element.setSize(width, height);
    },

    /**
     * Create the Surface instance. Resolves the correct Surface implementation to
     * instantiate based on the 'enginePriority' config. Once the Surface instance is
     * created you can use the handle to that instance to add sprites. For example:
     *
     <pre><code>
        drawComponent.surface.add(sprite);
     </code></pre>
     */
    createSurface: function(config) {
        var me = this,
            apply = Ext.apply;

        return Ext.draw.Surface.create(apply({}, apply({
                width: me.getWidth(),
                height: me.getHeight(),
                renderTo: me.element,
                id: Ext.id()
            }, config), me.initialConfig));
    },

    /**
     * Some engines need a repaint after the component has been laid out.
     * This is generally handled in Chart.js, and so should only be triggered when 
     * we're strictly adding Sprites to the surface (and not creating a chart).
     */
    repaint: function() {
        if (this.surface) {
            this.surface.renderFrame();
        }
    },

    /**
     * Clean up the Surface instance on component destruction
     */
    destroy: function() {
        var surface = this.surface;
        if (surface) {
            surface.destroy();
        }
        this.sizeMonitor.destroy();
        this.callParent();
    }

});

// Ext.reg('draw', Ext.draw.Component);
