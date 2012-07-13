Ext.define("FirstApp.view.Main", {
    extend:'Ext.tab.Panel',
    xtype:'main',

    requires:[
        'Ext.chart.Panel',
        'Ext.chart.axis.Numeric',
        'Ext.chart.axis.Category',
        'Ext.chart.series.Line'
    ],

    config:{
        tabBarPosition:'bottom',

        items:[
            {
                xtype:'home'
            },
            {
                xtype:'chartsContainer'
            }
        ]
    }
});
