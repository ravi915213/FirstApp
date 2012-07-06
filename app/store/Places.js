Ext.define('FirstApp.store.Places',{
    extend:'Ext.data.Store',
    alias: 'store.places',

    config:{
        model:'FirstApp.model.Place',
        autoLoad:true,
        proxy:{
            type: 'ajax',
            url:'http://192.168.1.125/slim/charts/line/',
            reader:{
                type:'json',
                rootProperty:'data1'
            }
        }
    }
});