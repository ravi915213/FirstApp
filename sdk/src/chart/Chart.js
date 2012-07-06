/**
 * @class Ext.chart.Chart
 * @extends Ext.draw.Component
 *
 * The Ext.chart package provides the capability to visualize data.
 * Each chart binds directly to an Ext.data.Store enabling automatic updates of the chart.
 * A chart configuration object has some overall styling options as well as an array of axes
 * and series. A chart instance example could look like:
 *
  <pre><code>
    new Ext.chart.Chart({
        renderTo: Ext.getBody(),
        width: 800,
        height: 600,
        animate: true,
        store: store1,
        shadow: true,
        theme: 'Category1',
        legend: {
            position: 'right'
        },
        axes: [ ...some axes options... ],
        series: [ ...some series options... ]
    });
  </code></pre>
 *
 * In this example we set the `width` and `height` of the chart, we decide whether our series are
 * animated or not and we select a store to be bound to the chart. We also turn on shadows for all series,
 * select a color theme `Category1` for coloring the series, set the legend to the right part of the chart and
 * then tell the chart to render itself in the body element of the document. For more information about the axes and
 * series configurations please check the documentation of each series (Line, Bar, Pie, etc).
 *
 * @xtype chart
 */

Ext.define('Ext.chart.Chart', { 
 
    extend: 'Ext.draw.Component',
    xtype: 'chart',

    mixins: {
        theme: 'Ext.chart.theme.Theme'
    },
    
    uses: [
        'Ext.draw.Draw',
        'Ext.chart.Legend',
        'Ext.chart.interactions.Abstract',
        'Ext.chart.axis.Axis',
        'Ext.util.SizeMonitor'
    ],
    /**
     * @event beforerefresh
     * Fires before a refresh to the chart data is called.  If the beforerefresh handler returns
     * <tt>false</tt> the {@link #refresh} action will be cancelled.
     * @param {Ext.chart.Chart} this
     */

    /**
     * @event refresh
     * Fires after the chart data has been refreshed.
     * @param {Ext.chart.Chart} this
     */

    /**
     * @event redraw
     * Fires after the chart is redrawn
     * @param {Ext.chart.Chart} this
     */

    /**
     * @event itemmousemove
     * Fires when the mouse is moved on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemmouseup
     * Fires when a mouseup event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemmousedown
     * Fires when a mousedown event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemmouseover
     * Fires when the mouse enters a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemmouseout
     * Fires when the mouse exits a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemclick
     * Fires when a click event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemdoubleclick
     * Fires when a doubleclick event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemtap
     * Fires when a tap event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemtapstart
     * Fires when a tapstart event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemtapend
     * Fires when a tapend event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemtapcancel
     * Fires when a tapcancel event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemtaphold
     * Fires when a taphold event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemdoubletap
     * Fires when a doubletap event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemsingletap
     * Fires when a singletap event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemtouchstart
     * Fires when a touchstart event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemtouchmove
     * Fires when a touchmove event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemtouchend
     * Fires when a touchend event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemdragstart
     * Fires when a dragstart event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemdrag
     * Fires when a drag event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemdragend
     * Fires when a dragend event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itempinchstart
     * Fires when a pinchstart event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itempinch
     * Fires when a pinch event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itempinchend
     * Fires when a pinchend event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */
    /**
     * @event itemswipe
     * Fires when a swipe event occurs on a series item.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */

    /**
     * @property version Current Version of Touch Charts
     * @type {String}
     */
    version : '2.0.0b',

    // @private
    viewBox: false,
    
    config: {

        /**
         * @cfg {Ext.data.Store} store
         * The store that supplies data to this chart.
         */
        store: null,

        /**
         * @cfg {Boolean/Object} shadow (optional) true for the default shadow configuration (shadowOffsetX: 2, shadowOffsetY: 2, shadowBlur: 3, shadowColor: '#444')
         * or a standard shadow config object to be used for default chart shadows.
         */
        shadow: false,

        /**
         * @cfg {Boolean/Object} animate (optional) true for the default animation (easing: 'ease' and duration: 500)
         * or a standard animation config object to be used for default chart animations.
         */
        animate: false,

        /**
         * @cfg {Ext.chart.series.Series} series
         * Array of {@link Ext.chart.series.Series Series} instances or config objects. For example:
         *
         * series: [{
         *      type: 'column',
         *      axis: 'left',
         *      listeners: {
         *          'afterrender': function() {
         *              console('afterrender');
         *          }
         *      },
         *      xField: 'category',
         *      yField: 'data1'
         * }]
         */
        series: [],

        /**
         * @cfg {Ext.chart.axis.Axis} axes
         * Array of {@link Ext.chart.axis.Axis Axis} instances or config objects. For example:
         *
         * axes: [{
         *      type: 'Numeric',
         *      position: 'left',
         *      fields: ['data1'],
         *      title: 'Number of Hits',
         *      minimum: 0,
         *      //one minor tick between two major ticks
         *      minorTickSteps: 1
         * }, {
         *      type: 'Category',
         *      position: 'bottom',
         *      fields: ['name'],
         *      title: 'Month of the Year'
         * }]
         */
        axes: [],

        /**
         * @cfg {Boolean/Object} legend (optional) true for the default legend display or a legend config object. 
         */
        legend: null,
        
        /**
         * @cfg {String} theme (optional) The name of the theme to be used. A theme defines the colors and
         * other visual displays of tick marks on axis, text, title text, line colors, marker colors and styles, etc.
         * Possible theme values are 'Base', 'Green', 'Sky', 'Red', 'Purple', 'Blue', 'Yellow' and also six category themes
         * 'Category1' to 'Category6'. Default value is 'Base'.
         */
        theme: 'Base',

        /**
         * @cfg {String}
         * The class name used only in theming system.
         */
        themeCls: '',
        /**
         * @cfg {Boolean/Array} colors Array of colors/gradients to override the color of items and legends.
         */
        colors: null,

        /**
         * @cfg {Number} insetPadding Set the amount of inset padding in pixels for the chart.
         */
        insetPadding: 10,

        /**
         * @cfg {Object|Boolean} background (optional) Set the chart background. This can be a gradient object, image, or color.
         *
         * For example, if `background` were to be a color we could set the object as
         *
         <pre><code>
            background: {
                //color string
                fill: '#ccc'
            }
         </code></pre>

         You can specify an image by using:

         <pre><code>
            background: {
                image: 'http://path.to.image/'
            }
         </code></pre>

         Also you can specify a gradient by using the gradient object syntax:

         <pre><code>
            background: {
                gradient: {
                    id: 'gradientId',
                    angle: 45,
                    stops: {
                        0: {
                            color: '#555'
                        }
                        100: {
                            color: '#ddd'
                        }
                    }
                }
            }
         </code></pre>
         */
        background: false,

        maxGutter: [0, 0],

        /**
         * @cfg {Array} interactions
         * Interactions are optional modules that can be plugged in to a chart to allow the user to interact
         * with the chart and its data in special ways. The `interactions` config takes an Array of Object
         * configurations, each one corresponding to a particular interaction class identified by a `type` property:
         *
         *     new Ext.chart.Chart({
         *         renderTo: Ext.getBody(),
         *         width: 800,
         *         height: 600,
         *         store: store1,
         *         axes: [ ...some axes options... ],
         *         series: [ ...some series options... ],
         *         interactions: [{
         *             type: 'interactiontype'
         *             // ...additional configs for the interaction...
         *         }]
         *     });
         *
         * When adding an interaction which uses only its default configuration (no extra properties other than `type`),
         * you can alternately specify only the type as a String rather than the full Object:
         *
         *     interactions: ['reset', 'rotate']
         *
         * The current supported interaction types include:
         *
         * - {@link Ext.chart.interactions.PanZoom panzoom} - allows pan and zoom of axes
         * - {@link Ext.chart.interactions.ItemCompare itemcompare} - allows selection and comparison of two data points
         * - {@link Ext.chart.interactions.ItemHighlight itemhighlight} - allows highlighting of series data points
         * - {@link Ext.chart.interactions.ItemInfo iteminfo} - allows displaying details of a data point in a popup panel
         * - {@link Ext.chart.interactions.PieGrouping piegrouping} - allows selection of multiple consecutive pie slices
         * - {@link Ext.chart.interactions.Rotate rotate} - allows rotation of pie and radar series
         * - {@link Ext.chart.interactions.Reset reset} - allows resetting of all user interactions to the default state
         * - {@link Ext.chart.interactions.ToggleStacked togglestacked} - allows toggling a multi-yField bar/column chart between stacked and grouped
         *
         * See the documentation for each of those interaction classes to see how they can be configured.
         *
         * Additional custom interactions can be registered with the {@link Ext.chart.interactions.Manager interaction manager}.
         */
        interactions: [],


        /**
         * @cfg {Object} toolbar
         * Optional configuration for this chart's toolbar. The toolbar docks itself to one side of the chart
         * and can contain buttons for handling certain actions. For example, if the chart legend is configured
         * with {@link Ext.chart.Legend#dock dock:true} then a button for bringing up the legend will be placed
         * in this toolbar. Custom may also be added to the toolbar if desired.
         *
         * See the {@link Ext.chart.Toolbar} docs for the recognized config properties.
         */
        toolbar: {}
    },

    colorArrayStyle: [],

    /**
     * @private The z-indexes to use for the various surfaces
     */
    surfaceZIndexes: {
        main: 0,
        axis: 1,
        series: 2,
        overlay: 3,
        events: 4
    },
    
    constructor: function(config) {
        var me = this,
            defaultAnim,
            p, i, l, colors, color, colorArrayStyle;

        config = Ext.apply({}, config);
        if (me.gradients) {
            Ext.apply(config, { gradients: me.gradients });
        }
        if (me.background) {
            Ext.apply(config, { background: me.background });
        }
        if (config.animate) {
            defaultAnim = {
                easing: 'easeInOut',
                duration: 500
            };
            if (Ext.isObject(config.animate)) {
                config.animate = Ext.applyIf(config.animate, defaultAnim);
            }
            else {
                config.animate = defaultAnim;
            }
        }

        me.chartBBox = {x: 0, y: 0, width: 0, height: 0};
        if (config.theme) {
            me.applyStyles(config.theme);
        }

        me.callParent(arguments);

        this.surface.destroy();
        delete this.surface;
    },

    applyStyles: function (theme) {
        var me = this;
        me.mixins.theme.applyStyles.call(me, theme);
        me.colorArrayStyle = [];
        if (me.style && me.style.colors) {
            colors = me.style.colors;
            colorArrayStyle = me.colorArrayStyle;
            for (i = 0, l = colors.length; i < l; ++i) {
                color = colors[i];
                if (Ext.isObject(color)) {
                    for (p in me.surfaces) {
                        me.surfaces[p].addGradient(color);
                    }
                    colorArrayStyle.push('url(#' + color.id + ')');
                } else {
                    colorArrayStyle.push(color);
                }
            }
        }
    },

    initialize: function() {
        var me = this, ref;

        Ext.applyIf(me, {
            zoom: {
                width: 1,
                height: 1,
                x: 0,
                y: 0
            }
        });
        me.maxGutter = me.maxGutter || [0, 0];

        if (me.tipRenderer) {
            ref = me.getFunctionRef(me.tipRenderer);
            me.setTipRenderer(ref.fn, ref.scope);
        }
        
        me.callParent();

        me.getAxes().each(function (axis) {
            if(axis.initialize) {
                axis.initialize();
            }
        });
        me.getSeries().each(function (series) {
            if (series.initialize) {
                series.initialize();
            }
        });
        me.getInteractions().each(function(interaction) {
            interaction.initializeDefaults({
                type: 'beforerender'
            });
            if (me.getAnimate()) {
                //on after render callback should remove itself since it's
                //only called once.
                var callback = function() {
                    me.getInteractions().each(function(interaction) {
                        interaction.initializeDefaults({
                            type: 'afterrender'
                        });
                    });
                    me.getSeries().get(0).removeListener('afterrender', callback);
                };
            } else {
                interaction.initializeDefaults();
            }
            if (interaction.initialize) {
                interaction.initialize();
            }
        });

        Ext.Viewport.on('orientationchange', me.redraw, me);
    },

    onPainted: function() {
        this.callParent();
        var me = this;
        me.getSurface('main');

        me.applyStyles();
        me.onResize();
    },

    onResize: function () {
        var me = this;
        if (!me.resizeTask) {
            me.resizeTask = new Ext.util.DelayedTask(function() { me.redraw(true); }, me);
        } else {
            me.resizeTask.cancel();
        }
        me.resizeTask.delay(1);
    },
    
    getEventsSurface: function() {
        return this.getSurface('events');
    },

    getSurface: function(name) {
        var me = this,
            surfaces = me.surfaces || (me.surfaces = {}),
            surface = surfaces[name],
            zIndexes = me.surfaceZIndexes,
            element;
        if (!surface) {
            surface = surfaces[name] = me.createSurface({
                background: null,
                initEvents: (name == 'events')
            });
            element = surface.element;
            element.setStyle('position', 'absolute');
            element.setStyle('top', 0);
            element.setStyle('left', 0);
            // Apply z-index if surface name is in the surfaceZIndexes mapping
            if (name in zIndexes) {
                element.setStyle('zIndex', zIndexes[name]);
            } else {
                element.setStyle('zIndex', zIndexes.main);
            }
        }
        return surface;
    },

    applyColors: function (colors) {
        if (Ext.isArray(colors)) {
            var me = this, colorArrayStyle = colors.slice(0),
                i, l, color;
            for (i = 0, l = colors.length; i < l; ++i) {
                color = colors[i];
                if (Ext.isObject(color)) {
                    for (p in me.surfaces) {
                        me.surfaces[p].addGradient(color);
                    }
                    colorArrayStyle.push('url(#' + color.id + ')');
                } else {
                    colorArrayStyle.push(color);
                }
            }
            return colorArrayStyle;
        }
        return colors;
    },

    getColorsStyle: function () {
        return this.getColors() || this.colorArrayStyle;
    },

    applyToolbar: function(toolbar, currentToolbarInstance) {
        return Ext.factory(toolbar, Ext.chart.Toolbar, currentToolbarInstance);
    },

    updateToolbar: function(toolbar) {
        if (toolbar) {
            toolbar.setChart(this);
        }
    },
    
    applyAxes: function (axes, oldAxes) {
        var me = this,
            collection = new Ext.util.MixedCollection(false, function(a) { return a.getPosition(); }),
            ln = axes.length, i;
        if (!axes) {
            return;
        }
        if (!Ext.isArray(axes) && !(axes instanceof Ext.util.MixedCollection)) {
            axes = [axes];
            ln = 1;
        }
        if (Ext.isArray(axes)) {
            axes.each = function(fn) { Ext.each(axes, fn); };
        }

        axes.each(function (axis) {
            if (!(axis instanceof Ext.chart.axis.Axis)) {
                axis.chart = me;
                collection.add(axis = Ext.create('Ext.chart.axis.' + me.capitalize(axis.type), axis));
            }
        });
        if (oldAxes) {
            oldAxes.each(function (axis) {
                if (!collection.contains(axis)) {
                    axis.destroy();
                }
            });
        }
        return collection;
    },

    updateTheme: function (n, o) {
        this.applyStyles();
    },

    updateAxes: function (n, o) {
        this.applyStyles();
    },

    updateSeries: function (newSeries, oldSeries) {
        this.applyStyles();
    },

    applySeries: function (series, oldSeries) {
        var me = this,
            collection = new Ext.util.MixedCollection(false, function(a) { return a.seriesId; }),
            ln = series.length, i;
        if (!series) {
            return;
        }
        if (!Ext.isArray(series) && !(series instanceof Ext.util.MixedCollection)) {
            series = [series];
            ln = 1;
        }
        if (Ext.isArray(series)) {
            series.each = function(fn) { Ext.each(series, fn); };
        }
        series.each(function (series) {
            if (!(series instanceof Ext.chart.series.Series)) {
                series.chart = me;
                collection.add(series = Ext.create('Ext.chart.series.' + me.capitalize(series.type), series));
            }
        });
        if (oldSeries) {
            oldSeries.each(function (seriesItem) {
                if (!collection.contains(seriesItem)) {
                    seriesItem.destroy();
                }
            });
        }
        return collection;
    },

    applyInteractions: function (interactions) {
        var me = this,
            collection = new Ext.util.MixedCollection(false, function(a) {
                return a.type;
            }),
            ln = interactions.length, i;

        if (!interactions) {
            return;
        }
        if (!Ext.isArray(interactions) && !(interactions instanceof Ext.util.MixedCollection)) {
            interactions = [interactions];
            ln = 1;
        }
        if (Ext.isArray(interactions)) {
            interactions.each = function(fn) { Ext.each(interactions, fn); };
        }
        interactions.each(function (interaction) {
            if (Ext.isString(interaction)) {
                interaction = {type: interaction};
            }
            if (!(interaction instanceof Ext.chart.interactions.Abstract)) {
                interaction.chart = me;
                collection.add(interaction = Ext.chart.interactions.Manager.create(interaction));
                
            }
        });
        return collection;
    },

    applyLegend: function (legend, oldLegend) {
        var me = this;
        if (legend === oldLegend) {
            return legend;
        }
        legend = Ext.factory(legend, Ext.chart.Legend, oldLegend);
        if (oldLegend && oldLegend !== legend) {
            oldLegend.un({
                scope: me,
                combine : me.redraw,
                split: me.redraw
            });
        }
        return legend;
    },
    
    updateLegend: function (legend) {
        var me = this;
        if (legend) {
            legend.setChart(this);
            legend.un({
                scope: me,
                combine : me.redraw,
                split: me.redraw
            });
        }
        return legend;
    },

    applyStore: function(store, currentStore) {
        var me = this,
            initial = !me.storeIsBound;

        store = store && Ext.StoreMgr.lookup(store);
        if (!initial && currentStore && store !== currentStore) {
            if (currentStore.autoDestroy) {
                currentStore.destroy();
            }
            else {
                currentStore.un({
                    scope: me,
                    refresh: me.delayRefresh
                });
            }
        }
        if (store && (initial || store !== currentStore)) {
            store.on({
                scope: me,
                refresh: me.delayRefresh
            });
        }
        me.storeIsBound = true;
        if (store && !initial) {
            me.refresh();
        }
        return store;
    },
    /**
     * Override the call to repaint and do nothing here. Repainting is handled by the draw/redraw methods in Chart.
     */
    repaint: Ext.emptyFn,

    /**
     * Redraw the chart. If animations are set this will animate the chart too.
     * @param {Boolean} resize (optional) flag which changes the default origin points of the chart for animations.
     */
    redraw: function(resize) {
        var me = this,
            toolbar,
            width = me.getWidth(), 
            height = me.getHeight(), 
            legend = me.getLegend(),
            toUpdate = false;

        if (!Ext.isNumber(width) || !Ext.isNumber(height)) {
            width = me.element.getWidth();
            height = me.element.getHeight();
        }
        toUpdate = width != me.curWidth || height != me.curHeight;
        if (toUpdate) {
            resize = true;
        }
        
        if (resize) {
            me.curWidth = width;
            me.curHeight = height;

            me.chartBBox = {
                x: 0,
                y: 0,
                height: me.curHeight,
                width: me.curWidth
            };

            if (toUpdate) {
                me.getEventsSurface().setSize(width, height);
                me.getSurface('main').setSize(width, height);
            }

            if (legend) {
                legend.updateLocation();
            }

            me.updateMaxGutter();

            me.dirtyStore = false;


            me.getAxes().each(me.preprocessAxis, me);

            legend = me.getLegend();
            if (legend) {
                legend.orient();
            }

            toolbar = me.getToolbar();
            if (toolbar) {
                toolbar.orient();
            }
            
        }

        //process all views (aggregated data etc) on stores before rendering.
        me.getAxes().each(function(axis) {
            axis.processView();
        });
        me.getAxes().each(function(axis) {
            if (axis.getHidden()) {
                return;
            }
            axis.drawAxis(true);
        });

        me.alignAxes();
        
        if (toUpdate) {
            // Reposition legend based on new axis alignment
            if (legend) {
                legend.updateLocation();
            }
        }
        // Draw axes and series
        me.resizing = !!resize;

        me.getAxes().each(me.drawAxis, me);
        me.getSeries().each(me.drawCharts, me);

        Ext.iterate(me.surfaces, function(name, surface) {
             surface.renderFrame();
        });

        me.resizing = false;

        // TODO: check on specific versions of iOS for this. it is too damn slow.
//        if (Ext.os.is.iPad) {
//            Ext.repaint();
//        }

        me.fireEvent('redraw', me);
    },

    /**
     * @private
     * Return the x and y position of the given event relative to the chart's series area.
     */
    getEventXY: function(e) {
        e = (e.changedTouches && e.changedTouches[0]) || e.event || e.browserEvent || e;

        var me = this,
            chartXY = me.element.getXY(),
            chartBBox = me.chartBBox,
            x = e.pageX - chartXY[0] - chartBBox.x,
            y = e.pageY - chartXY[1] - chartBBox.y;

        return [x, y];
    },

    /**
     * Given an x/y point relative to the chart, find and return the first series item that
     * matches that point.
     * @param {Number} x
     * @param {Number} y
     * @return {Object} an object with `series` and `item` properties, or `false` if no item found
     */
    getItemForPoint: function(x, y) {
        var me = this,
            i = 0,
            items = me.getSeries().items,
            l = items.length,
            series, item;

        for (; i < l; i++) {
            series = items[i];
            item = series.getItemForPoint(x, y);
            if (item) {
                return item;
            }
        }

        return false;
    },
    /**
     * Given an x/y point relative to the chart, find and return all series items that match that point.
     * @param {Number} x
     * @param {Number} y
     * @return {Array} an array of objects with `series` and `item` properties
     */
    getItemsForPoint: function(x, y) {
        var me = this,
            items = [];

        me.getSeries().each(function(series) {
            var item = series.getItemForPoint(x, y);
            if (item) {
                items.push(item);
            }
        });

        return items;
    },

    capitalize: function(string) {
        return string.charAt(0).toUpperCase() + string.substr(1);
    },

    // @private buffered refresh for when we update the store
    delayRefresh: function() { 
        var me = this;
        if (!me.refreshTask) {
            me.refreshTask = new Ext.util.DelayedTask(me.refresh, me);
        }
        me.refreshTask.delay(1);
    },

    // @private
    refresh: function() {
        var me = this,
            undef;
        if (me.refreshTask) {
            me.refreshTask.cancel();
        }
        me.dirtyStore = true;

        if (me.curWidth != undef && me.curHeight != undef && me.fireEvent('beforerefresh', me) !== false) {
            me.redraw();
            me.fireEvent('refresh', me);
        }
    },

    /**
     * Changes the data store bound to this chart and refreshes it.
     * @param {Ext.data.Store} store The store to bind to this chart
     */
    bindStore: function(store) {
        this.setStore(store);
    },

    // @private Create Axis
    preprocessAxis: function(axis) {
        var me = this,
            chartBBox = me.chartBBox,
            w = chartBBox.width,
            h = chartBBox.height,
            x = chartBBox.x,
            y = chartBBox.y,
            config = {
                chart: me,
                parent: me,
                x: 0,
                y: 0
            };
        switch (axis.getPosition()) {
            case 'top':
                Ext.apply(config, {
                    length: w,
                    width: h,
                    startX: x,
                    startY: y
                });
            break;
            case 'bottom':
                Ext.apply(config, {
                    length: w,
                    width: h,
                    startX: x,
                    startY: h
                });
            break;
            case 'left':
                Ext.apply(config, {
                    length: h,
                    width: w,
                    startX: x,
                    startY: h
                });
            break;
            case 'right':
                Ext.apply(config, {
                    length: h,
                    width: w,
                    startX: w,
                    startY: h
                });
            break;
        }

        axis.setConfig(config);
    },


    /**
     * @private Adjust the dimensions and positions of each axis and the chart body area after accounting
     * for the space taken up on each side by the axes and legend.
     */
    alignAxes: function() {
        var me = this,
            axes = me.getAxes(),
            legend = me.getLegend(),
            edges = ['top', 'right', 'bottom', 'left'],
            chartBBox,
            //get padding from sass styling or property setting.
            insetPadding = me.getInsetPadding() || +me.style.padding || 10,
            insets;

        //store the original configuration for insetPadding.
        if (Ext.isObject(insetPadding)) {
            me.setInsetPadding(Ext.apply({} ,insetPadding));
            insets = {
                top: insetPadding.top || 0,
                right: insetPadding.right || 0,
                bottom: insetPadding.bottom || 0,
                left: insetPadding.left || 0
            };
        } else {
            me.setInsetPadding(insetPadding);
            insets = {
                top: insetPadding,
                right: insetPadding,
                bottom: insetPadding,
                left: insetPadding
            };
        }

        me.insets = insets;

        function getAxis(edge) {
            return axes.get(edge);
        }

        // Find the space needed by axes and legend as a positive inset from each edge
        Ext.each(edges, function(edge) {
            var isVertical = (edge === 'left' || edge === 'right'),
                axis = getAxis(edge),
                bbox;

            // Add legend size if it's on this edge
            if (legend) {
                if (legend.getDockedPosition() === edge) {
                    insets[edge] += legend.getInsetSize();
                }
            }

            // Add axis size if there's one on this edge only if it has been
            //drawn before.
            if (axis && axis.bbox) {
                bbox = axis.bbox;
                insets[edge] += (isVertical ? bbox.width : bbox.height);
            }
        });
        // Build the chart bbox based on the collected inset values
        chartBBox = {
            x: insets.left,
            y: insets.top,
            width: me.curWidth - insets.left - insets.right,
            height: me.curHeight- insets.top - insets.bottom
        };
        me.chartBBox = chartBBox;

        // Go back through each axis and set its size, position, and relative start point based on the
        // corresponding edge of the chartBBox
        axes.each(function(axis) {
            var pos = axis.getPosition(),
                axisBBox = !axis.getHidden() && axis.bbox || {width: 0, height: 0},
                isVertical = (pos === 'left' || pos === 'right'),
                config = {
                    x : (pos === 'left' ? chartBBox.x - axisBBox.width : chartBBox.x),
                    y : (pos === 'top' ? chartBBox.y - axisBBox.height : chartBBox.y),
                    width : (isVertical ? axisBBox.width + chartBBox.width: axisBBox.height + chartBBox.height),
                    length : (isVertical ? chartBBox.height : chartBBox.width),
                    startX : (isVertical ? (pos === 'left' ? axisBBox.width : chartBBox.width) : 0),
                    startY : (pos === 'top' ? axisBBox.height : chartBBox.height)
                };
            axis.setConfig(config);
        });
    },

    // @private
    updateMaxGutter: function() {
        var me = this,
            maxGutter = me.getMaxGutter().slice();
        me.getSeries().each(function(s) {
            var gutter = s.getGutters && s.getGutters() || [0, 0];
            maxGutter[0] = Math.max(maxGutter[0], gutter[0]);
            maxGutter[1] = Math.max(maxGutter[1], gutter[1]);
        });
        me.maxGutter = maxGutter;
    },

    // @private draw axis.
    drawAxis: function(axis) {
        if (axis.getHidden()) {
            return;
        }
        axis.drawAxis();
    },

    // @private draw series.
    drawCharts: function(series) {
        series.drawSeries();
        if (!this.getAnimate()) {
            series.fireEvent('afterrender');
        }
    },
    /**
     * Used to save a chart.
     *
     * The following config object properties affect the saving process:
     * - **type** - string - The intended export type. Supported types: 'svg': returns the chart's Svg-String, 'image/png': returns the chart as png, 'image/jpeg': returns the chart as jpeg. Default: 'image/png'
     *
     *  <h2>Example usage:</h2>
     *  <code><pre>
     chartInstance.save({
        type: 'image/png'
     });
     * </pre></code>
     * 
     * @param {Object} config The config object for the export generation
     */
    save: function(config){
        // width and height config properties don't affect export right now
        // TODO(patrick): take width/height into account at export generation
        return Ext.draw.Surface.save(config, this.surfaces);
    },
    /**
     * Reset the chart back to its initial state, before any user interaction.
     * @param {Boolean} skipRedraw if `true`, redrawing of the chart will be skipped.
     */
    reset: function(skipRedraw) {
        var me = this,
            legend = me.getLegend();

        me.getAxes().each(function(axis) {
            if (axis.reset) {
                axis.reset();
            }
        });

        me.getSeries().each(function(series) {
            if (series.reset) {
                series.reset();
            }
        });

        if (legend && legend.reset) {
            legend.reset();
        }

        if (!skipRedraw) {
            me.redraw();
        }
    },

    // @private remove gently.
    destroy: function() {
        var me = this;
        Ext.iterate(this.surfaces, function(name, surface) {
            surface.destroy();
        });
        me.setStore(null);
        me.setLegend(false);
        me.setSeries([]);
        me.setAxes([]);
        me.setInteractions([]);
        me.setToolbar(null);
        Ext.Viewport.un('orientationchange', me.redraw, me);
        this.callParent(arguments);
    },

    /* ---------------------------------
      Methods needed for ComponentQuery
     ----------------------------------*/

    parent: null,

    getItemId: function() {
        return this.element && this.element.id || this.id || null;
    },

    initCls: function() {
        // Workaround for [cls=xxx] ComponentQueries to work.
        // In Component.initCls method, this.cls will be deleted,
        // we need to revert it to make CQ function which is used in theme system.
        var cls = this.cls,
            result = this.callParent();
        this.cls = cls;
        return result;
    },

    isXType: function(xtype) {
        return xtype === 'chart';
    },

    getRefItems: function(deep) {
        var me = this,
            ans = [];

        me.getSeries() && me.getSeries().each(function(series) {
            if (series.getRefItems) {
                ans.push(series);
                if (deep) {
                    if (series.markerStyle) {
                        ans.push(series.markerStyle);
                    }
                    if (series.labelStyle) {
                        ans.push(series.labelStyle);
                    }
                    if (series.calloutStyle) {
                        ans.push(series.calloutStyle);
                    }
                }
            }
        });

        me.getAxes() && me.getAxes().each(function(axis) {
            if (axis.getRefItems) {
                ans.push(axis);
                if (axis.labelStyle) {
                    ans.push(axis.labelStyle);
                }
                if (axis.gridStyle) {
                    ans.push(axis.gridStyle);
                    ans.push(axis.gridStyle.oddStyle);
                    ans.push(axis.gridStyle.evenStyle);
                }
            }
        });

        me.getInteractions() && me.getInteractions().each(function(interaction) {
            ans.push(interaction);
            if (deep) {
                ans = ans.concat(interaction.getRefItems(deep));
            }
        });

        return ans;
    }
});

if (!Ext.util.DelayedTask) {
    Ext.util.DelayedTask = function(fn, scope, args) {
        var me = this,
            id,
            call = function() {
                clearInterval(id);
                id = null;
                fn.apply(scope, args || []);
            };

        /**
         * Cancels any pending timeout and queues a new one
         * @param {Number} delay The milliseconds to delay
         * @param {Function} newFn (optional) Overrides function passed to constructor
         * @param {Object} newScope (optional) Overrides scope passed to constructor. Remember that if no scope
         * is specified, <code>this</code> will refer to the browser window.
         * @param {Array} newArgs (optional) Overrides args passed to constructor
         */
        this.delay = function(delay, newFn, newScope, newArgs) {
            me.cancel();
            fn = newFn || fn;
            scope = newScope || scope;
            args = newArgs || args;
            id = setInterval(call, delay);
        };

        /**
         * Cancel the last queued timeout
         */
        this.cancel = function(){
            if (id) {
                clearInterval(id);
                id = null;
            }
        };
    };
}
