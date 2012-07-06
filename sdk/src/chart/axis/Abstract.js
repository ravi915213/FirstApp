/**
 * @class Ext.chart.axis.Abstract
 *
 * An abstract axis class extended by Numeric, Category and Radial axes.
 */
Ext.define('Ext.chart.axis.Abstract', { 

    uses: [
        'Ext.chart.theme.TitleStyle',
        'Ext.chart.theme.LabelStyle',
        'Ext.chart.theme.GridStyle'
    ],

    config: {
        /**
         * @cfg {String} position
         * Where to set the axis. Available options are `left`, `bottom`, `right`, `top`. Default's `bottom`.
         */
        position: 'bottom',
        /**
         * @cfg {Array} fields
         * An array containing the names of the record fields which should be mapped along the axis.
         */
        fields: [],
        labels: [],
        /**
         * @cfg {String} labelTitle
         *
         * The title for the axis.
         */
        labelTitle: null,
        /**
         * @cfg {Object} label
         *
         * The label configuration object for the Axis. This object may include style attributes
         * like `spacing`, `padding`, `font`, and a `renderer` function that receives a string or number and
         * returns a new string with the modified values.
         */
        label: null,
        /**
         * @cfg {Object} grid
         * The grid configuration object for the Axis style. Can contain `stroke` or `fill` attributes.
         * Also may contain an `odd` or `even` property in which you only style things on odd or even rows.
         * For example:
         *
         *
                  grid {
                    odd: {
                      stroke: '#555';
                    }
                    even: {
                      stroke: '#ccc';
                    }
                  }
         *              
         */
        grid: null,

        chart: null,
        steps: 10,
        x: 0,
        y: 0,
        
        /**
         * @cfg {Number} length
         *
         * Offset axis position. Default's 0.
         */
        length: 0,

        /**
         * @cfg {Number} width
         *
         * Offset axis width. Default's 0.
         */
        width: 0,

        startX: 0,
        startY: 0,

        hidden: false
    },

    mixins: { 
      identifiable: 'Ext.mixin.Identifiable',
      observable: 'Ext.util.Observable',
      transformable: 'Ext.chart.Transformable'
    },

    applyPosition: function(pos) {
        // return pos.charAt(0).toUpperCase() + pos.substring(1);
        return pos.toLowerCase();
    },

    constructor: function(config) {
        var me = this;

        me.titleStyle = Ext.create('Ext.chart.theme.TitleStyle', config.labelTitle || {});
        me.labelStyle = Ext.create('Ext.chart.theme.LabelStyle', config.label || {});
        me.gridStyle = Ext.create('Ext.chart.theme.GridStyle', config.grid || {});
        
        this.initConfig(config);
        me.getId();

        me.mixins.observable.constructor.apply(me, arguments);
        me.mixins.transformable.constructor.apply(me, arguments);
    },

    applyLabel: function(data) {
        var me = this;
        Ext.apply(me.labelStyle.style, data);
        return data;
    },

    getLabel: function() {
        var me = this;
        Ext.applyIf(me._label, me.labelStyle.style);
        return me._label;
    },

    initialize: function () {
        var me = this;
        me.labelGroup = me.getSurface().getGroup(me.axisId + "-labels");
    },

    getId: function() {
        return this.axisId || (this.axisId = Ext.id(null, 'ext-axis-'));
    },

    /*
      Called to process a view i.e to make aggregation and filtering over
      a store creating a substore to be used to render the axis. Since many axes
      may do different things on the data and we want the final result of all these
      operations to be rendered we need to call processView on all axes before drawing
      them.
    */
    processView: Ext.emptyFn,

    /**
     * Draws/Updates the axis into the canvas.
    */
    drawAxis: Ext.emptyFn,

    /**
     * Get the {@link Ext.draw.Surface} instance for this axis.
     * @return {Ext.draw.Surface}
     */
    getSurface: function() {
        var me = this,
            surface = me.surface,
            chart = me.getChart();
        if (!surface) {
            surface = me.surface = chart.getSurface(me.getPosition() + 'Axis');
            surface.element.setStyle('zIndex', chart.surfaceZIndexes.axis);
        }
        return surface;
    },

    /**
     * Hides all axis labels.
     */
    hideLabels: function() {
        this.labelGroup.hide();
    },

    /**
     * @private update the position/size of the axis surface. By default we set it to the
     * full chart size; subclasses can change this for custom clipping size.
     */
    updateSurfaceBox: function() {
        var me = this,
            surface = me.getSurface(),
            chart = me.getChart();
        
        surface.element.setTop(0);
        surface.element.setLeft(0);
        surface.setSize(chart.getWidth() || chart.element.getWidth(),
                        chart.getHeight() || chart.element.getHeight());
    },

    getTransformableSurfaces: function() {
        return [this.getSurface()];
    },

    /**
     * @private Reset the axis to its original state, before any user interaction.
     */
    reset: function() {
        this.clearTransform();
    },

    /**
     * Invokes renderFrame on this axis's surface(s)
     */
    renderFrame: function() {
        this.getSurface().renderFrame();
    },


    /* ---------------------------------
      Methods needed for ComponentQuery
     ----------------------------------*/

    //filled by the constructor.
    parent: null,

    getItemId: function() {
        return this.element && this.element.id || this.id || null;
    },

    initCls: function() {
        return (this.cls || '').split(' ');
    },

    isXType: function(xtype) {
        return xtype === 'axis';
    },

    getRefItems: function(deep) {
        var me = this,
            ans = [];

        if (me.labelStyle) {
            ans.push(me.labelStyle);
        }

        if (me.titleStyle) {
            ans.push(me.titleStyle);
        }

        if (me.gridStyle) {
            ans.push(me.gridStyle);
            ans.push(me.gridStyle.oddStyle);
            ans.push(me.gridStyle.evenStyle);
        }

        return ans;
    }
});

