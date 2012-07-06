/**
 * @class Ext.draw.engine.ImageExporter
 * @singleton
 *
 * The ImageExporter class provides a generate function which generates the export
 * and returns a base64 encoded image dataURL containing all the chart's elements.
 *
 * Used in {@link Ext.draw.Surface#save}
 */
Ext.define('Ext.draw.engine.ImageExporter', {
    
    singleton: true,
    /**
     * Used to generate a base64 encoded image dataURL containing all the chart's elements
     * 
     * @param {Object} config The config object for the export generation
     * @param {Array} surfaces The chart's surfaces
     */
    generate: function(config, surfaces){
        var canvas = document.createElement("canvas"),
            type = config.type || "image/png",
            len = surfaces.length,
            ctx = canvas.getContext("2d"),
            width = surfaces[0].canvas.width,
            height = surfaces[0].canvas.height;
            
            canvas.width = width;
            canvas.height = height;
        
        if(type == "image/jpeg"){
            // draw a white background if user wants to save a jpeg
            // otherwise the alpha channel would result in a black background
            ctx.save();
            ctx.fillStyle = "rgb(255,255,255)";
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }
        
        // drawing all the layers on the canvas
        // considering that they probably have different positions
        for(var i=0; i < len; i++){
            var surface = surfaces[i],
                c = surface.canvas,
                width = surface.element.getWidth(),
                height = surface.element.getHeight(),
                top = surface.element.getStyle('top').replace(/px/, ''),
                left = surface.element.getStyle('left').replace(/px/, '');
                    
            top = isNaN(top)?0:top; 
            left = isNaN(left)?0:left;

            if (width && height) {
                ctx.drawImage(c, left, top);
            }
        }
        
        return canvas.toDataURL(config.type);
    }
});
