/**
 * @private
 * @class Ext.chart.legend.View
 * @extends Ext.DataView
 *
 * A DataView specialized for displaying the legend items for a chart. This class is only
 * used internally by {@link Ext.chart.Legend} and should not need to be instantiated directly.
 */
Ext.define('Ext.chart.legend.View', {

    extend: 'Ext.dataview.DataView',
    require: [
        'Ext.Viewport',
        'Ext.draw.Draw'
    ],

    config: {
        itemTpl: [
            '<span class="x-legend-item-marker {[values.disabled?\'x-legend-inactive\':\'\']}" style="background-color:{markerColor};"></span>{label}'
        ],
        store: {
            fields: ['markerColor', 'label', 'series', 'seriesId', 'index', 'disabled'],
            data: []
        },
        baseCls: Ext.baseCSSPrefix + 'legend',
        disableSelection: true,
        scrollable: false,
        legend: false
    },

    componentCls: Ext.baseCSSPrefix + 'legend',
    horizontalCls: Ext.baseCSSPrefix + 'legend-horizontal',

    initialize: function () {
        var me = this,
            scroller = me.getScrollableBehavior().getScrollView(),
            innerSize, outerSize;

        me.callParent(arguments);
        
        me.on('itemtap', me.itemTap);
        
        //append the needed css class
    },

    refresh: function () {
        this.callParent();
    },

    updateLegend: function (legend, oldLegend) {
        if (legend && legend.getChart()) {
            var chart = legend.getChart(),
                series = chart.getSeries();
            chart.on('serieschange', this.refreshStore, this);
            if (series) {
                series.each(function (series) {
                    series.on('titlechange', this.refreshStore, this);
                });
            }
        }
    },

    /**
     * @private Fired when a legend item is tap-held. Initializes a draggable for the
     * held item.
     */
    onTapHold: function (e, target) {
        //TODO(nico):
        //This function is currently disabled until 
        //ST 2 adds dragging capabilities to the framework.
        return;

        // var me = this,
        //     draggable, record, seriesId, combinable;

        // if (!Ext.fly(target).hasCls(me.inactiveItemCls)) {
        //     record = me.getRecord(target);
        //     seriesId = record.get('seriesId');
        //     combinable = me.getStore().findBy(function(record2) {
        //         return record2 !== record && record2.get('seriesId') === seriesId;
        //     });
        //     if (combinable > -1) {
        //         draggable = new Ext.util.Draggable(target, {
        //             threshold: 0,
        //             revert: true,
        //             direction: me.getLegend().isVertical() ? 'vertical' : 'horizontal',
        //             group: seriesId
        //         });

        //         draggable.on('dragend', me.onDragEnd, me);

        //         if (!draggable.dragging) {
        //             draggable.onStart(e);
        //         }
        //     }
        // }
    },

    /**
     * @private Updates the droppable objects for each list item. Should be called whenever
     * the list view is re-rendered.
     */
    updateDroppables: function () {
        var me = this,
            droppables = me.droppables,
            droppable;

        Ext.destroy(droppables);
    },

    /**
     * @private Handles dropping one legend item on another.
     */
    onDrop: function (droppable, draggable) {
        var me = this,
            dragRecord = me.getRecord(draggable.element.dom),
            dropRecord = me.getRecord(droppable.element.dom);
        me.getLegend().onCombine(dragRecord.get('series'), dragRecord.get('index'), dropRecord.get('index'));
    },

    onDragEnd: function (draggable, e) {
        draggable.destroy();
    },

    /**
     * @private Create and return the JSON data for the legend's internal data store
     */
    getStoreData: function () {
        var data = [], info, series = this.getLegend().getChart().getSeries();
        if (series) {
            series.each(function (series) {
                if (series.showInLegend) {
                    info = series.getLegendInfo();
                    Ext.each(info.items, function (item, i) {
                        data.push({
                            label: item.label,
                            markerColor: item.color,
                            series: series,
                            seriesId: Ext.id(series, 'legend-series-'),
                            index: i,
                            disabled: item.disabled
                        });
                    });
                }
            });
        }
        return data;
    },

    /**
     * Updates the internal store to match the current legend info supplied by all the series.
     */
    refreshStore: function () {
        var me = this,
            store = me.getStore(),
            data = me.getStoreData();
        store.setData(data);
        
        // TODO: remove this when iOS update issue goes away.
        Ext.draw.Draw.updateIOS();
    },

    /**
     * Update the legend component to match its current vertical/horizontal orientation
     */
    orient: function (orientation) {
        var me = this,
            legend = me.getLegend(),
            horizontalCls = me.horizontalCls,
            isVertical = legend.isVertical(),
            pos = legend.getDockedPosition();

        orientation = orientation || Ext.Viewport.getOrientation();
        if (me.lastOrientation !== orientation) {
            if (isVertical) {
                me.removeCls(horizontalCls);
            } else {
                me.addCls(horizontalCls);
            }
            me.setSize(null, null);
            me.setDocked(pos);
            // Clean up things set by previous scroller -- Component#setScrollable should be fixed to do this
            // Re-init scrolling in the correct direction
            // me.setScrollable(isVertical ? 'vertical' : 'horizontal');

            if (isVertical) {
                // Fix to the initial natural width so it doesn't expand when items are combined
                me.setSize(me.getWidth());
            }
            if (me.scroller) {
                me.scroller.scrollTo({x: 0, y: 0});
            }
            me.lastOrientation = orientation;
        }
    },

    itemTap: function (target, index, e) {
        var me = this,
            item = Ext.get(target),
            record = me.getStore().getAt(index),
            series = record && record.get('series'),
            threshold = me.getLegend().doubleTapThreshold,
            tapTask = me.tapTask || (me.tapTask = new Ext.util.DelayedTask()),
            now = +new Date(),
            oldEndsX, oldEndsY, axis;
        tapTask.cancel();

        // If the tapped item is a combined item, we need to distinguish between single and
        // double taps by waiting a bit; otherwise trigger the single tap handler immediately.
        if (series.isCombinedItem(index)) {
            if (now - (me.lastTapTime || 0) < threshold) {
                me.doItemDoubleTap(item, index);
            }
            else {
                tapTask.delay(threshold, me.doItemTap, me, [item, index]);
            }
            me.lastTapTime = now;
        } else {
            series.onLegendItemTap(record, index);
            if (series.getAxesForXAndYFields) {
                var axes = series.getAxesForXAndYFields();
                axis = axes.xAxis && series.getChart().getAxes().get(axes.xAxis);
                if (axis && axis.getRange) {
                    oldEndsX = axis.getRange();
                }
                axis = axes.yAxis && series.getChart().getAxes().get(axes.yAxis);
                if (axis && axis.getRange) {
                    oldEndsY = axis.getRange();
                }
            }

            if (oldEndsX && oldEndsY && series.getAxesForXAndYFields) {
                var newEndsX, newEndsY;
                newEndsX = axes.xAxis && series.getChart().getAxes().get(axes.xAxis).getRange();
                newEndsY = axes.xAxis && series.getChart().getAxes().get(axes.yAxis).getRange();
                if (newEndsX[0] !== oldEndsX[0] || newEndsX[1] !== oldEndsX[1] ||
                    newEndsY[0] !== oldEndsY[0] || newEndsY[1] !== oldEndsY[1]) {
                    series.getChart().redraw();
                } else {
                    series.drawSeries();
                    series.getSurface().renderFrame();
                }
            } else {
                series.getChart().redraw();
            }
        }
        me.refreshStore();
    },
    /**
     * @private
     * Handle double-taps on legend items; splits items that are a result of item combination
     */
    doItemDoubleTap: function (item, index) {
        var me = this,
            record = me.getStore().getAt(index),
            series = record.get('series');
        if (record) {
            me.getLegend().onSplit(record.get('series'), record.get('index'));
        }
        series.onLegendItemDoubleTap(record, index);
    },

    /**
     * Reset the legend view back to its initial state before any user interactions.
     */
    reset: function () {
        var me = this;
        me.getStore().each(function (record, i) {
            var series = record.get('series');
            series._index = record.get('index');
            series.showAll();
            Ext.fly(me.getViewItems()[i]).removeCls(me.inactiveItemCls);
            series.clearCombinations();
            series.onLegendReset();
        });

        me.refreshStore();
    }

});


