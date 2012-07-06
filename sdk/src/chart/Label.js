/**
 * @class Ext.chart.Label
 *
 * Labels is a mixin whose methods are appended onto the Series class. Labels is an interface with methods implemented
 * in each of the Series (Pie, Bar, etc) for label creation and label placement.
 *
 * The methods implemented by the Series are:
 *
 * - **`onCreateLabel(storeItem, item, i, display)`** Called each time a new label is created.
 *   The arguments of the method are:
 *   - *`storeItem`* The element of the store that is related to the label sprite.
 *   - *`item`* The item related to the label sprite. An item is an object containing the position of the shape
 *     used to describe the visualization and also pointing to the actual shape (circle, rectangle, path, etc).
 *   - *`i`* The index of the element created (i.e the first created label, second created label, etc)
 *   - *`display`* The display type. May be <b>false</b> if the label is hidden
 *
 *  - **`onPlaceLabel(label, storeItem, item, i, display, animate)`** Called for updating the position of the label.
 *    The arguments of the method are:
 *    - *`label`* The sprite label.</li>
 *    - *`storeItem`* The element of the store that is related to the label sprite</li>
 *    - *`item`* The item related to the label sprite. An item is an object containing the position of the shape
 *      used to describe the visualization and also pointing to the actual shape (circle, rectangle, path, etc).
 *    - *`i`* The index of the element to be updated (i.e. whether it is the first, second, third from the labelGroup)
 *    - *`display`* The display type. May be <b>false</b> if the label is hidden.
 *    - *`animate`* A boolean value to set or unset animations for the labels.
 */
Ext.define('Ext.chart.Label', {

    /**
     * @cfg {Object} label
     * Object with the following properties:
     *
     * - **display** : String
     *
     * Specifies the presence and position of labels for each pie slice. Either "rotate", "middle", "insideStart",
     * "insideEnd", "outside", "over", "under", or "none" to prevent label rendering.
     * Default value: 'none'.
     *
     * - **color** : String
     *
     * The color of the label text.
     * Default value: '#000' (black).
     *
     * - **contrast** : Boolean
     *
     * True to render the label in contrasting color with the backround.
     * Default value: false.
     *
     * - **field** : String
     *
     * The name of the field to be displayed in the label.
     * Default value: 'name'.
     *
     * - **minMargin** : Number
     *
     * Specifies the minimum distance from a label to the origin of the visualization.
     * This parameter is useful when using PieSeries width variable pie slice lengths.
     * Default value: 50.
     *
     * - **font** : String
     *
     * The font used for the labels.
     * Default value: "11px Helvetica, sans-serif".
     *
     * - **orientation** : String
     *
     * Either "horizontal" or "vertical".
     * Default value: "horizontal".
     *
     * - **renderer** : Function
     *
     * Optional function for formatting the label into a displayable value.
     * Default value: function(v) { return v; }
     */


    //@private a regex to parse url type colors.
    colorStringRe: /url\s*\(\s*#([^\/)]+)\s*\)/,

    //@private
    //how labels are filtered hidden/shown
    labelFilterModel: false,

    //@private the mixin constructor. Used internally by Series.
    constructor: function(config) {
        var me = this;
        me.label = Ext.applyIf(config.label || {}, {
            renderer: function(v) {
                return v;
            }
        });
    },

    initialize: function () {
        var me = this;
        if (me.label.display !== 'none') {
            me.labelsGroup = me.getChart().getSurface('labels').getGroup(me.seriesId + '-labels');
        }
    },

    //@private a method to render all labels in the labelGroup
    renderLabels: function() {
        var me = this,
            chart = me.getChart(),
            items = me.items,
            config = Ext.apply(me.labelStyle.style || {}, me.label || {}),
            display = config.display,
            field = [].concat(config.field),
            group = me.labelsGroup,
            len = me.getRecordCount(),
            itemLength = (items || 0) && items.length,
            ratio = itemLength / len,
            count = 0, index, j, k, item, label,
            sprite;

        if (display == 'none') {
            return;
        }

        me.eachRecord(function(storeItem, i) {
            index = 0;
            for (j = 0; j < ratio; j++) {
                item = items[count];
                label = group.getAt(count);

                //TODO(nico): there are now two label rendering models.
                //one considers that sprites are reused and hidden and non-hidden
                //sprites contiguous. The other model maintains a sparse array 
                //of hidden non-hidden sprites.
                //Eventually the only label rendering model should be the second one
                //(currently used bu the bar chart)
                if (!me.labelFilterModel) {
                    while (me.getExcludes() && me.getExcludes()[index]) {
                        index++;
                    }
                    
                    if (!item && label) {
                        label.hide(true);
                    }

                    if (item && field[j]) {
                        me.renderLabel(label, item, i, j, index, storeItem);
                    }

                } else {
                    if (me.itemHidden(item) && label) {
                        label.hide(true);
                    }

                    if (!me.itemHidden(item) && field[j]) {
                        me.renderLabel(label, item, i, j, index, storeItem);
                    }
                }
                count++;
                index++;
            }
        });
        me.hideLabels(count);
    },

    renderLabel: function(label, item, i, j, index, storeItem) {
        var me = this,
            chart = me.getChart(),
            gradients = chart.gradients,
            animate = chart.getAnimate(),
            config = Ext.apply(me.labelStyle.style || {}, me.label || {}),
            display = config.display,
            field = [].concat(config.field),
            gradientsCount = (gradients || 0) && gradients.length,
            Color = Ext.draw.Color,
            gradient, count = 0, k, colorStopTotal, colorStopIndex, colorStop,
            sprite, spriteColor, spriteBrightness, labelColor, colorString, match;

        if (!label) {
            label = me.onCreateLabel(storeItem, item, i, display, j, index);
        }
        label.show(true);
        me.onPlaceLabel(label, storeItem, item, i, display, animate, j, index);

        //set contrast
        if (config.contrast && item.sprite) {
            sprite = item.sprite;
            //set the color string to the color to be set.
            if (sprite._endStyle) {
                colorString = sprite._endStyle.fill;
            }
            else if (sprite._to) {
                colorString = sprite._to.fill;
            }
            else {
                colorString = sprite.attr.fill;
            }
            colorString = colorString || sprite.attr.fill;
            spriteColor = colorString && Color.fromString(colorString);
            //color wasn't parsed property maybe because it's a gradient id
            if (colorString && !spriteColor) {
                colorString = (match = colorString.match(me.colorStringRe)) && match[1];
                for (k = 0; k < gradientsCount; k++) {
                    gradient = gradients[k];
                    if (gradient.id == colorString) {
                        //avg color stops
                        colorStop = 0;
                        colorStopTotal = 0;
                        for (colorStopIndex in gradient.stops) {
                            colorStop++;
                            colorStopTotal += Color.fromString(gradient.stops[colorStopIndex].color).getGrayscale();
                        }
                        spriteBrightness = (colorStopTotal / colorStop) / 255;
                        break;
                    }
                }
            } else if (spriteColor) {
                spriteBrightness = spriteColor.getGrayscale() / 255;
            }
            if (label.isOutside) {
                spriteBrightness = 1;
            }
            labelColor = Color.fromString(label.attr.color || label.attr.fill).getHSL();

            labelColor[2] = spriteBrightness > 0.5 ? 0.2 : 0.8;
            label.setAttributes({
                fill: String(Color.fromHSL.apply({},
                labelColor))
            },
            true);
        }
    },

    itemHidden: function(item) {
        return false;
    },

    //@private a method to hide labels.
    hideLabels: function(index) {
        var labelsGroup = this.labelsGroup,
            len;
        index = index || 0;
        if (labelsGroup) {
            len = labelsGroup.getCount();
            while (len-->index) {
                labelsGroup.getAt(len).hide(true);
            }
        }
    }
});
