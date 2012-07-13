Ext.define('FirstApp.store.Sales',{
    extend:'Ext.data.Store',
    alias: 'store.sales',

    config:{
        model:'FirstApp.model.Sale',
        autoLoad:true,
        proxy:{
            type: 'ajax',
            url:'http://192.168.1.130/slim/charts/line/',
            reader:{
                type:'json',
                rootProperty:'data1'
            }
        }
    }
});