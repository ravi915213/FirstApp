/**
/**
/**
 * @class Ext.chart.Highlight
 * @ignore
 */
Ext.define('Ext.chart.Highlight', {

    uses: ['Ext.chart.theme.HighlightStyle'],

    statics : {
        getOriginal: function (origin, attr, surface) {
            var result = {};
            for (var prop in attr) {
                if (typeof attr[prop] === 'function') {
                    continue;
                } else {
                    result[prop] = origin[prop] === undefined ? surface.availableAttrs[prop] : origin[prop];
                    if (result[prop] === attr[prop]) {
                        delete result[prop];
                    } else if (typeof attr[prop] === 'object') {
                        result[prop] = this.getOriginal(result[prop], attr[prop], surface);
                    }
                }
            }
            return result;
        }
    },

    config: {
        /**
         * @cfg {Number} [highlightDuration=500]
         * The duration for the highlight effect in milliseconds.
         */
        highlightDuration : 500,

        /**
         * @cfg {Boolean} toggles whether highlighing with {@link Ext.chart.interactions.ItemHighlight itemhighlight}
         * is allowed.
         */
        highlight : true,

        /**
         * @cfg {Object} highlightCfg
         * Configure how the sprites are highlighted by apply this to its config.
         */
        highlightCfg : { }
    },

    highlightedSprites : null,

    /**
     * @event highlight
     * @event unhighlight
     */

    applyHighlight: function (highlight) {
        if (!Ext.isBoolean(highlight)) {
            this.setHighlightCfg(highlight);
            return true;
        }
        return highlight;
    },

    applyHighlightCfg: function (highlightCfg, oldHighlightCfg) {
        return Ext.merge(oldHighlightCfg || {}, highlightCfg || {});
    },

    constructor: function(config) {
        this.highlightStyle = Ext.create('Ext.chart.theme.HighlightStyle');
        this.highlightedSprites = new Ext.util.MixedCollection();
    },

    highlightSprite: function(sprite, animate) {
        var me = this,
            opts = Ext.merge({}, me.highlightStyle.style, me.getHighlightCfg());
        if (animate === undefined) {
            animate = me.getChart().getAnimate();
        }
        if (me.highlightedSprites.contains(sprite)) {
            return;
        }
        me.highlightedSprites.add(sprite);
        if (!sprite.originalAttr) {
            sprite.originalAttr = Ext.chart.Highlight.getOriginal(sprite.attr, opts, sprite.surface);
        }
        if (sprite.highlightFx) {
            sprite.highlightFx.stop();
        }
        if (animate) {
            sprite.highlightFx = new Ext.fx.Sprite({
                sprite: sprite,
                easing: opts.easing || animate.easing || 'easeInOut',
                duration: me.getHighlightDuration() || opts.duration || animate.duration || 500,
                onComplete : function () {
                    delete sprite.highlightFx;
                }
            });
            sprite.highlightFx.start(opts);
        } else {
            sprite.setAttributes(opts, true);
        }
    },

    unHighlightSprite: function (sprite, animate) {
        var me = this,
            opts = Ext.merge({}, me.highlightStyle.style, me.getHighlightCfg());
        if (!sprite) {
            while(me.highlightedSprites.length) {
                me.unHighlightSprite(me.highlightedSprites.first(), animate);
            }
            return;
        }
        if (animate === undefined) {
            animate = this.getChart().getAnimate();
        }
        if (sprite.highlightFx) {
            sprite.highlightFx.stop();
        }
        if (animate) {
            sprite.highlightFx = new Ext.fx.Sprite({
                sprite: sprite,
                easing: opts.easing || animate.easing || 'easeInOut',
                duration: me.getHighlightDuration() || opts.duration || animate.duration || 500,
                onComplete : function () {
                    delete sprite.highlightFx;
                }
            });
            sprite.highlightFx.start(sprite.originalAttr);
        } else {
            sprite.setAttributes(sprite.originalAttr, true);
        }
        me.highlightedSprites.remove(sprite);
    },

    /**
     * Highlight the given series item.
     * @param {Object} item Info about the item; same format as returned by #getItemForPoint.
     */
    highlightItem: function(item) {
        if (!item) {
            return;
        }
        var me = this, sprite = item.sprite,
            animate = me.getChart().getAnimate();
        if (me.getHighlight() === false || !sprite) {
            return;
        }
        me.highlightSprite(sprite, animate);
        me.fireEvent('highlight', item);
    },

    /**
     * Un-highlight any existing highlights
     */
    unHighlightItem: function(item) {
        var me = this, animate = me.getChart().getAnimate();
        if (me.getHighlight() === false) {
            return;
        }
        me.unHighlightSprite(item && item.sprite, animate);
        me.fireEvent('unhighlight');
    },

    cleanHighlights: function() {
        if (this.highlightedItem) {
            delete this.highlightedItem;
        }
        this.unHighlightSprite();
    }
});

