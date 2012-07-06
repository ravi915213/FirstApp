Ext.define('FirstApp.view.PlacesContainer',{
    extend:'Ext.NavigationView',
    xtype:'placesContainer',

    config:{
        title:'Charts',
        iconCls:'maps',
        items:[
            {
                xtype:'places'

            },
            {
                xtype:'piechart'

            }
        ]
    }
})