/**
 * @class Ext.fx.Sprite
 * @extends Ext.fx.Frame
 *
 * A class to handle the animation of drawing Sprites.
 *
 * ## Example Code
 *

        var sprite = drawComponent.surface.add({
          type: 'rect',
          width: 100,
          height: 200,
          fill: '#c00'
        });

        var animation = new Ext.fx.Sprite({
            sprite:  sprite,
            duration: 300,
            easing: 'bounceOut'
        });

        animation.start({
          width: 300,
          height: 300
        });

 *
 */

Ext.define('Ext.fx.Sprite', {

  extend: 'Ext.fx.Frame',

  requires: ['Ext.fx.Parser'],

  config: {
    /**
     * @cfg {Object} sprite
     * An {@link Ext.draw.Sprite} instance.
     */
    sprite: null,

    /**
     * @cfg {String} unit
     * Units for values.
     */
    unit: null
  },

  /** Prepares values to be animated in the Sprite */
  prepare: function(sprite, key, value) {
    var me = this,
        parser = Ext.fx.Parser,
        attr = sprite.getAttribute(key),
        from = parser.prepare(key, (attr !== undefined && attr !== null) ? attr : value),
        to = parser.prepare(key, value),
        ans;

    if (key == 'path') {
      ans = Ext.draw.Draw.interpolatePaths(from, to);
      from = ans[0];
      to = ans[1];
    }

    return {
      from: from,
      to: to
    };
  },

  /** Triggers the animation. */
  start: function(attributes) {
    var me = this,
        from = {},
        to = {},
        sprite = me.getSprite(),
        name, parsed;

    for (name in attributes) {
      parsed = me.prepare(sprite, name, attributes[name]);
      from[name] = parsed.from;
      to[name] = parsed.to;
    }

    me.setFrom(from);
    me.setTo(to);

    me.callParent(arguments);
  },

  //compute interpolated values.
  compute: Ext.fx.Parser.Object.compute,
    
  //set the values into the instance.
  set: function(computed) {
    var me = this;
    me.render(me.getSprite(), Ext.fx.Parser.Object.serve(computed, me.getUnit()));
  },

  //render the sprite.
  render: function(sprite, attributes) {
    sprite.setAttributes(attributes, true);
  }
});
