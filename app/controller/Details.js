Ext.define('FirstApp.controller.Details', {
    extend: 'Ext.app.Controller',
    
    config: {
        refs: {
            placesContainer:'placesContainer'
        },
        control: {
            'placesContainer places':{
                itemtap:'onItemTap'
            }

        }
    }
    ,
    onItemTap:function(list,index,target,record){
        this.getPlacesContainer().push({
            xtype:'pieChart',
            title:record.data.year,
            data:record.data
        })

    }

});