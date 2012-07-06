Ext.define('FirstApp.model.Place',{
    extend:'Ext.data.Model',
    config:{
        fields:[
            {name: "year", type: "string"},
            {name: "iphone", type: "string"},
            {name: "Android", type: "string"},
			{name: "ipad", type: "string"}
        ]
    }
});