Ext.define('FirstApp.view.BarChart',{
    extend: "Ext.chart.Chart",
    xtype:'barchart',

    requires: ['Ext.chart.Panel',
        'Ext.chart.axis.Numeric',
        'Ext.chart.axis.Category',
        'Ext.chart.series.Area'],

    config:{
        title: 'Bar Chart',
        layout: 'auto',
        themeCls: 'bar1',
        theme: 'Demo',
        store: 'Sales',
        animate: true,
        shadow: false,
        legend: {
            position:  {
                portrait: 'bottom',
                landscape:'right'
            },
            labelFont: '17px Arial'
        },
        interactions: [
            {
                type: 'reset'
            },
            {
                type: 'togglestacked'
            },
            {
                type: 'panzoom',
                axes: {
                    left: {}
                }
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
                            title: 'Details '
                        }
                    ]
                },
                listeners: {
                    show: function (interaction, item, panel) {
                        var storeItem = item.storeItem;
                        panel.setHtml(['<ul><li><b>Year: </b>' + item.value[0] + '</li>', '<li><b>Sales: </b> ' + item.value[1] + '</li></ul>'].join(''));
                    }
                }
            },
            {
                type: 'itemcompare',

                listeners: {
                    'show': function (interaction) {
                        var val1 = interaction.item1.value,
                            val2 = interaction.item2.value;
                        Ext.Msg.alert(
                            'Compare',
                            'Trend from ' + val1[0] + ' to ' + val2[0] + ': ' +
                                Math.round(val2[1] - val1[1]),
                            interaction.reset,
                            interaction
                        );
                        
                    }

                }
            }

        ],
            axes: [
                {
                    type: 'Numeric',
                    position: 'bottom',
                    fields: ['iphone', 'Android', 'ipad'],
                    label: {

                    },
                    title: 'Number of Sales',
                    minimum: 0,
                    maximum: 100
                },
                {
                    type: 'Category',
                    position: 'left',
                    fields: ['year'],
                    title: 'Year'
                }
            ],
            series: [
                {
                    type: 'bar',
                    xField: 'year',
                    yField: ['iphone', 'Android', 'ipad'],
                    axis: 'bottom',
                    highlight: true,
                    showInLegend: true
                }
            ]
        }
});