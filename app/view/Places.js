Ext.define('FirstApp.view.Places',{
    extend: "Ext.chart.Chart",
    xtype:'places',

    requires: ['Ext.chart.Panel',
        'Ext.chart.axis.Numeric',
        'Ext.chart.axis.Category',
        'Ext.chart.series.Area'],

    config:{
        id: 'chartPanel',
        layout: 'auto',
        themeCls: 'bar1',
        theme: 'Demo',
        store: 'Places',
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
                            title: 'Details'
                        }
                    ]
                },
                listeners: {
                    'show': function (me, item, panel) {
                        panel.setHtml('<ul><li><b>Year:</b> ' + item.value[0] + '</li><li><b>Sales: </b> ' + item.value[1] + '</li></ul>');
                    }
                }
            },
            {
                type: 'itemcompare',
                offset: {
                    x: -10
                },
                listeners: {
                    'show': function (interaction) {
                        var val1 = interaction.item1.value,
                            val2 = interaction.item2.value;

                        chartPanel.descriptionPanel.setTitle(val1[0] + ' to ' + val2[0] + ' : ' + Math.round((val2[1] - val1[1]) / val1[1] * 100) + '%');
                        chartPanel.headerPanel.getLayout().setAnimation('slide');
                        chartPanel.headerPanel.setActiveItem(1);
                    },
                    'hide': function () {
                        var animation = chartPanel.headerPanel.getLayout().getAnimation();
                        if (animation) {
                            animation.setReverse(true);
                        }
                        chartPanel.headerPanel.setActiveItem(0);
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