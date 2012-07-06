/**
 * @class Ext.chart.axis.Numeric
 * @extends Ext.chart.axis.Axis
 *
 * An axis to handle numeric values. This axis is used for quantitative data as
 * opposed to the category axis. You can set mininum and maximum values to the
 * axis so that the values are bound to that. If no values are set, then the
 * scale will auto-adjust to the values.
 *
 * {@img Ext.chart.axis.Numeric/Ext.chart.axis.Numeric.png Ext.chart.axis.Numeric chart axis}
 *
 * For example:
 *
 *     var store = new Ext.data.JsonStore({
 *          fields: ['name', 'data1', 'data2', 'data3', 'data4', 'data5'],
 *          data: [
 *              {'name':'metric one', 'data1':10, 'data2':12, 'data3':14, 'data4':8, 'data5':13},
 *              {'name':'metric two', 'data1':7, 'data2':8, 'data3':16, 'data4':10, 'data5':3},
 *              {'name':'metric three', 'data1':5, 'data2':2, 'data3':14, 'data4':12, 'data5':7},
 *              {'name':'metric four', 'data1':2, 'data2':14, 'data3':6, 'data4':1, 'data5':23},
 *              {'name':'metric five', 'data1':27, 'data2':38, 'data3':36, 'data4':13, 'data5':33}
 *          ]
 *     });
 *
 *     new Ext.chart.Chart({
 *         renderTo: Ext.getBody(),
 *         width: 500,
 *         height: 300,
 *         store: store,
 *         axes: [{
 *             type: 'Numeric',
 *             grid: true,
 *             position: 'left',
 *             fields: ['data1', 'data2', 'data3', 'data4', 'data5'],
 *             title: 'Sample Values',
 *             grid: {
 *                 odd: {
 *                     opacity: 1,
 *                     fill: '#ddd',
 *                     stroke: '#bbb',
 *                     'stroke-width': 1
 *                 }
 *             },
 *             minimum: 0,
 *             adjustMinimumByMajorUnit: 0
 *         }, {
 *             type: 'Category',
 *             position: 'bottom',
 *             fields: ['name'],
 *             title: 'Sample Metrics',
 *             grid: true,
 *             label: {
 *                 rotate: {
 *                     degrees: 315
 *                 }
 *             }
 *         }],
 *         series: [{
 *             type: 'area',
 *             highlight: false,
 *             axis: 'left',
 *             xField: 'name',
 *             yField: ['data1', 'data2', 'data3', 'data4', 'data5'],
 *             style: {
 *                 opacity: 0.93
 *             }
 *         }]
 *     });
 *
 * In this example we create an axis of Numeric type. We set a minimum value so that
 * even if all series have values greater than zero, the grid starts at zero. We bind
 * the axis onto the left part of the surface by setting <em>position</em> to <em>left</em>.
 * We bind three different store fields to this axis by setting <em>fields</em> to an array.
 * We set the title of the axis to <em>Number of Hits</em> by using the <em>title</em> property.
 * We use a <em>grid</em> configuration to set odd background rows to a certain style and even rows
 * to be transparent/ignored.
 *
 * @constructor
 */
Ext.define('Ext.chart.axis.Numeric', { 
 
    extend: 'Ext.chart.axis.Axis',

    type: 'numeric',

    config: {

        /**
         * @cfg {Boolean} roundToDecimal
         * Whether to round the result to the given decimals. Defualt's false.
         * If true then the decimals config will determine the number of decimals to round the 
         * number to.
         */
        roundToDecimal: false,
        
        /**
         * @cfg {Number} decimals
         * The number of decimals to round the value to.
         * Default's 2.
         */
        decimals: 2,

        /**
         * @cfg {String} scale
         * The scaling algorithm to use on this axis. May be "linear" or
         * "logarithmic".
         */
        scale: "linear",

        /**
         * @cfg {String} position
         */
        position: 'left',

        /**
         * @cfg {Boolean} adjustMaximumByMajorUnit
         * Indicates whether to extend maximum beyond data's maximum to the nearest
         * majorUnit.
         */
        adjustMaximumByMajorUnit: false,

        /**
         * @cfg {Boolean} adjustMinimumByMajorUnit
         * Indicates whether to extend the minimum beyond data's minimum to the
         * nearest majorUnit.
         */
        adjustMinimumByMajorUnit: false
    },
    
    calcLabels: true,

    constructor: function(config) {
        var me = this,
            label = config.label || {},
            f;

        me.callParent([config]);
        if (me.getRoundToDecimal() === false) {
            return;
        }
        if (label.renderer) {
            f = label.renderer;
            label.renderer = function(v) {
                return me.roundToDecimal( f(v), me.getDecimals() );
            };
        } else {
            label.renderer = function(v) {
                return me.roundToDecimal(v, me.getDecimals());
            };
        }
        me.setLabel(label);
    },

    roundToDecimal: function(v, dec) {
        var val = Math.pow(10, dec || 0);
        return ((v * val) >> 0) / val;
    },

    /**
     * Returns an object with minimum and maximum values taken from processing the bound stores to the axis.
     * @returns An object with `min` and `max` properties.
     */
    getRange: function () {
        var me = this,
            min = isNaN(me.getMinimum()) ? Infinity : me.getMinimum(),
            max = isNaN(me.getMaximum()) ? -Infinity : me.getMaximum(),
            boundSeries = me.getBoundSeries();

        // For each series bound to this axis, ask the series for its min/max values
        // and use them to find the overall min/max.
        boundSeries.each(function(series) {
            var minMax = me.isBoundToField(series.getXField()) ? series.getMinMaxXValues() : series.getMinMaxYValues();
            if (minMax[0] < min) {
                min = minMax[0];
            }
            if (minMax[1] > max) {
                max = minMax[1];
            }
        });
        if (!isFinite(max)) {
            max = me.prevMax || 0;
        }
        if (!isFinite(min)) {
            min = me.prevMin || 0;
        }
        return {min: min, max: max};
    },

    // @private creates a structure with start, end and step points.
    calcEnds: function () {
        var me = this,
            min, max, range,
            zoom = me['zoom' + (me.isSide() ? 'Y' : 'X')],
            endsLocked = me.getChart().endsLocked && (me.prevFrom !== undefined),
            outfrom, outto, out;


        if (endsLocked) {
            min = me.prevFrom;
            max = me.prevTo;
        } else {
            range = me.getRange();
            min = range.min;
            max = range.max;
            // If the max isn't on the floor, we want to ceil the max for a better endpoint.
            if (min != max && Ext.isNumber(max) && (max != (Math.floor(max)))) {
                max = Math.ceil(max);
            }
        }

        // if minimum and maximum are the same in a numeric axis then change the minimum bound.
        if (me.type == 'numeric' && min === max) {
            if (max !== 0) {
                min = max / 2;
            } else {
                min = -1;
            }
        }

        out = Ext.draw.Draw.snapEnds(min, max, (me.getMajorTickSteps() !== false ?  (me.getMajorTickSteps() +1) : me.getSteps()) * zoom, endsLocked);
        outfrom = out.from;
        outto = out.to;

        if (!endsLocked) {
            if (!isNaN(me.getMaximum())) {
                //TODO(nico) users are responsible for their own minimum/maximum values set.
                //Clipping should be added to remove lines in the chart which are below the axis.
                out.to = me.getMaximum();
            }
            if (!isNaN(me.getMinimum())) {
                //TODO(nico) users are responsible for their own minimum/maximum values set.
                //Clipping should be added to remove lines in the chart which are below the axis.
                out.from = me.getMinimum();
            }
        }

        //Adjust after adjusting minimum and maximum
        out.step = (out.to - out.from) / (outto - outfrom) * out.step;

        if (me.getAdjustMaximumByMajorUnit()) {
            out.to += out.getStep();
        }
        if (me.getAdjustMinimumByMajorUnit()) {
            out.from -= out.getStep();
        }
        if (!endsLocked) {
            me.prevTo = out.to;
            me.prevFrom = out.from;
            me.prevMin = min == max ? 0 : min;
            me.prevMax = max;
        }
        return out;
    },

    // @private apply data.
    applyData: function() {
        this.callParent(arguments);
        return this.calcEnds();
    }
});
