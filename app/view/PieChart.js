/**
 * Created with JetBrains WebStorm.
 * User: ravikumarg
 * Date: 7/5/12
 * Time: 1:58 PM
 * To change this template use File | Settings | File Templates.
 */
Ext.define('FirstApp.view.PieChart',{
    extend: "Ext.chart.Chart",
    xtype: 'piechart',

    requires: ['Ext.chart.Panel',
        'Ext.chart.axis.Numeric',
        'Ext.chart.axis.Category',
        'Ext.chart.series.Pie'
    ],

    config:{
        title: 'Pie Chart',
        fullscreen: true,
        layout: 'auto',
        themeCls: 'pie1',
        theme: 'Demo',
        store: 'Sales',
        shadow: false,
        animate: true,
        insetPadding: 20,
        legend: {
            position: 'left'
        },
        interactions: [
            {
                type: 'reset',
                confirm: true
            },
            {
                type: 'rotate'
            },
            'itemhighlight',
            {
                type: 'iteminfo',
                gesture: 'longpress',
                panel: {
                    items: [
                        {
                            docked: 'top',
                            xtype: 'toolbar',
                            title: 'Iphone Sales '
                        }
                    ]
                },

                listeners: {
                    show: function (interaction, item, panel) {
                        var storeItem = item.storeItem;
                        panel.setHtml(['<ul><li><b>Year: </b>' + storeItem.get('year') + '</li>', '<li><b>Num of Sales: </b> ' + storeItem.get('iphone') + '</li></ul>'].join(''));
                    }
                }
            }
        ],
        series: [
            {
                type: 'pie',
                field: 'iphone',
                showInLegend: true,
                highlight: false,
                listeners: {
                    'labelOverflow': function (label, item) {
                        item.useCallout = true;
                    }
                },
                // Example to return as soon as styling arrives for callouts
                callouts: {
                    renderer: function (callout, storeItem) {
                        callout.label.setAttributes({
                            text: storeItem.get('year')
                        }, true);
                    },
                    filter: function () {
                        return false;
                    },
                    box: {
                        //no config here.
                    },
                    lines: {
                        'stroke-width': 2,
                        offsetFromViz: 20
                    },
                    label: {
                        font: 'italic 14px Arial'
                    },
                    styles: {
                        font: '14px Arial'
                    }
                },
                label: {
                    field: 'year'
                }
            }
        ]
    }
});