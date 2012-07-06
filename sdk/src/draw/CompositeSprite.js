/**
 * @class Ext.draw.CompositeSprite
 * @extends Ext.util.MixedCollection
 *
 * A composite Sprite handles a group of sprites with common methods to a sprite
 * such as `hide`, `show`, `setAttributes`. These methods are applied to the set of sprites
 * added to the group.
 *
 * CompositeSprite extends {@link Ext.util.MixedCollection} so you can use the same methods
 * in `MixedCollection` to iterate through sprites, add and remove elements, etc.
 *
 * In order to create a CompositeSprite, one has to provide a handle to the surface where it is
 * rendered:
 *
 *     var group = Ext.create('Ext.draw.CompositeSprite', {
 *         surface: drawComponent.surface
 *     });
 *
 * Then just by using `MixedCollection` methods it's possible to add {@link Ext.draw.Sprite}s:
 *
 *     group.add(sprite1);
 *     group.add(sprite2);
 *     group.add(sprite3);
 *
 * And then apply common Sprite methods to them:
 *
 *     group.setAttributes({
 *         fill: '#f00'
 *     }, true);
 */
(function(){
    function createRelayEvent(name) {
        return (function(e) {
            this.fireEvent(name, e);
        });
    }

    function createDispatcherMethod(name) {
        return function() {
            var args = Array.prototype.slice(arguments), items = this.items, l = items.length, i = 0, item;
            for(; i<l; i++){
                item = items[i];
                item[name].apply(item, args);
            };
        };
    }

    function createDispatcherMethodWithAggregation(name, aggregation, init, post) {
        if (!Ext.isFunction(post)) {
            post = function (x) { return x; };
        }
        return function() {
            var result = init.apply(this, arguments), args = Array.prototype.slice(arguments),
                items = this.items, l = this.items, i = 0, item;
            for(; i<l; i++){
                item = items[i];
                result = aggregation(result, item[name].apply(item, args));
            }
            return post(result);
        };
    }

    Ext.define('Ext.draw.CompositeSprite', {

        extend: 'Ext.util.MixedCollection',

        statics: {
            RelayedEvents: ['mousedown', 'mouseup', 'mouseover', 'mouseout', 'click']
        },

        /* End Definitions */
        isCompositeSprite: true,

        constructor: function(config) {
            var me = this;
            if (!config.surface) {
                Ext.error('Specify surface to create Ext.draw.CompositeSprite.');
            }
            config = config || {};
            Ext.apply(me, config);

            me.id = Ext.id(null, 'ext-sprite-group-');

            me.callParent(arguments);
        },

        /**
         * @private
         * @param {Sprite} o
         */
        attachEvents: function(o) {
            var me = this, events = me.relayedEvents;
            if (!me.relayedEvents) {
                events = {scope: me};
                Ext.Array.each(Ext.draw.CompositeSprite.RelayedEvents, function(name) {
                    events[name] = createRelayEvent(name);
                });
                me.relayedEvents = events;
            }
            o.on(events);
        },
        /**
         * @private
         * @param o
         */
        detachEvents: function (o) {
            o.un(this.relayedEvents);
        },

        /**
         * @private
         * @param config
         */
        prepareItem: function(config) {
            if (config.isSprite) {
                return config;
            }
            if (!config.surface) {
                config.surface = this.surface;
            }
            return new Ext.draw.Sprite(config);
        },

        /** Add a Sprite to the Group
         *
         * @param {String} key
         * @param {Ext.draw.Sprite} o
         */
        add: function(key, o) {
            if (o === undefined) {
                o = key;
            }
            if (!o.isSprite) {
                o = this.prepareItem(o);
            }
            key = this.getKey(o);
            var result = this.callParent([key, o]);
            this.attachEvents(result);
            return result;
        },

        /** Insert Sprite into the Group
         *
         * @param {Number} index
         * @param {String} key
         * @param {Ext.draw.Sprite} o
         */
        insert: function(index, key, o) {
            if (o === undefined) {
                o = key;
            }
            if (!o.isSprite) {
                o = this.prepareItem(o);
            }
            key = this.getKey(o);
            if (!o.isSprite) {
                o = new Ext.draw.Sprite(o);
            }
            return this.callParent([index, key, o]);
        },

        /** Remove a Sprite from the Group
         * 
         * @param {Ext.draw.Sprite} o The Sprite to be removed.
         */
        remove: function(o) {
            if (~this.indexOf(o)) { // != -1
                var me = this;
                me.detachEvents(o);
                this.callParent(arguments);
            }
        },

        /** Set attributes to all sprites.
         *
         * @param {Object} o Sprite attribute options just like in {@link Ext.draw.Sprite}.
         */
        setAttributes: createDispatcherMethod('setAttributes'),

        setText: createDispatcherMethod('setText'),

        /** Display all sprites in the Group.
         *
         * @param {Boolean} o Whether to re-render the frame.
         */
        show: createDispatcherMethod('show'),

        /** Hide all sprites in the Group.
         *
         * @param {Boolean} o Whether to re-render the frame.
         */
        hide: createDispatcherMethod('hide'),

        /** Redraw all sprites in the Group.
         *
         * @param {Boolean} o Whether to re-render the frame.
         */
        redraw: createDispatcherMethod('redraw'),

        /** Trigger an animation for all sprites in the Group.
         *
         */
        tween: createDispatcherMethod('tween'),
        dirt: createDispatcherMethod('dirt'),
        setStyle: createDispatcherMethod('setStyle'),
        addCls: createDispatcherMethod('addCls'),
        removeCls: createDispatcherMethod('removeCls'),

        /**
         * Return the minimal bounding box that contains all the sprites bounding boxes in this group.
         */
        getBBox: createDispatcherMethodWithAggregation('getBBox', function(result, current){
            result.l = Math.min(result.l, current.x);
            result.b = Math.max(result.b, current.height + current.y);
            result.t = Math.min(result.t, current.y);
            result.r = Math.max(result.r, current.width + current.x);
            return result;
        }, function () {
            var inf = Infinity;
            return {
                l: inf,
                r: -inf,
                t: inf,
                b: -inf
            };
        }, function(f) {
            return {
                x: f.l,
                y: f.t,
                height: f.b - f.t,
                width: f.r - f.l
            };
        }),

        /**
         * Grab the surface items surface.
         *
         * @return {Ext.draw.Surface} The surface, null if not found
         */
        getSurface: function(){
            var first = this.first();
            if (first) {
                return first.surface;
            }
            return null;
        },

        /**
         * Destroys the SpriteGroup
         */
        destroy: function(){
            var me = this,
                surface = me.surface,
                item;

            if (surface) {
                while (me.getCount() > 0) {
                    item = me.first();
                    me.remove(item);
                    item.destroy();
                }
                surface.removeGroup(me);
            }
            me.callParent();
        }
    });
})();

