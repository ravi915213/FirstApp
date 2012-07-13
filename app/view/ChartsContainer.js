Ext.define('FirstApp.view.ChartsContainer',{
    extend:'Ext.NavigationView',
    xtype:'chartsContainer',

    config:{
        title:'Charts',
        iconCls:'maps',
        items:[
            {
                xtype:'barchart'

            },
            {
                xtype:'piechart'

            }
        ]
    }
})