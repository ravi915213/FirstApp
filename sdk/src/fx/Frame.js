/**
 * @class Ext.fx.Frame
 * @extends Ext.fx.Abstract
 *
 * Frame by frame based animation. Will use requestAnimationFrame or timer based animations.
 *
 * ## Example Code
    var fx = Ext.create('Ext.fx.Frame', {
        duration: 1000,

        onCompute: function(from, to, delta) {
            console.log(Ext.fx.Frame.compute(from, to, delta));
        },

        onComplete: function() {
          console.log('animation ended!');
        }
    });

    fx.setFrom(0);
    fx.setTo(10);

    fx.start();
 *
 */
Ext.define('Ext.fx.Frame', {

    extend: 'Ext.fx.Abstract',
    uses: ['Ext.draw.Draw'],
    statics: {

        //Handle frame by frame callbacks.
        //I don't see a better way of doing this since I can't
        //integrate Observable as static methods for a non-singleton class.

        _frameCallbacks: [],

        frameStartTime: +new Date(),

        addFrameCallback: function (callback, scope) {
            scope = scope || this;
            if (Ext.isString(callback)) {
                callback = scope[callback];
            }
            Ext.fx.Frame._frameCallbacks.push({fn: callback, scope: scope});
        },

        removeFrameCallback: function (callback, scope) {
            var index = -1;
            scope = scope || this;
            if (Ext.isString(callback)) {
                callback = scope[callback];
            }
            for (var i = 0; i < this._frameCallbacks.length; i++) {
                var cb = this._frameCallbacks[i];
                if (cb.fn === callback && cb.scope === scope) {
                    index = i;
                    break;
                }
            }
            if (index > -1) {
                Ext.fx.Frame._frameCallbacks.splice(index, 1);
            }
        },

        fireFrameCallbacks: function () {
            var callbacks = this._frameCallbacks,
                i = 0,
                l = callbacks.length;

            for (; i < l; ++i) {
                callbacks[i].fn.apply(callbacks[i].scope, []);
            }
        },

        /* A basic linear interpolation function. */
        compute: function (from, to, delta) {
            return from + (to - from) * delta;
        },

        /* Cross browser animationTime implementation */
        animationTime: (function () {
            //fallback to Date
            var animationStartTimePolyfill = (function () {
                var global = (self || window || this),
                    prefix = ['webkit', 'moz', 'o', 'ms'],
                    i = 0,
                    l = prefix.length,
                    property, dateFallback;

                //check for animationTime
                if (global.animationStartTime) {
                    return function () {
                        return global.animationStartTime;
                    };
                }

                //check for vendor prefixes
                for (; i < l; ++i) {
                    property = prefix[i] + 'AnimationStartTime';
                    if (global[property]) {
                        return function () {
                            return global[property];
                        };
                    }
                }
                if (Date.now) {
                    return Date.now;
                }
                return function () {
                    return +new Date();
                }
            })();

            return function () {
                if (!this.frameStartTime) {
                    return this.frameStartTime = animationStartTimePolyfill();
                }
                return this.frameStartTime;
            }
        })(),

        /* Cross browser requestAnimationFrame implementation */
        requestAnimationFrame: (function () {
            var global = (self || window || this),
                prefix = ['webkit', 'moz', 'o', 'ms'],
                i = 0,
                l = prefix.length,
                method;

            //check for requestAnimationFrame
            if (global.requestAnimationFrame) {
                return function (callback) {
                    global.requestAnimationFrame(function () {
                        callback();
                    });
                };
            }

            //check for vendor prefixes
            for (; i < l; ++i) {
                method = prefix[i] + 'RequestAnimationFrame';
                if (global[method]) {
                    method = global[method];
                    return function (callback) {
                        method(callback);
                    };
                }
            }

            //fallback to setTimeout
            return function (callback) {
                setTimeout(function () {
                    callback();
                }, 1000 / 100);
            };

        })()
    },

    time: null,

    constructor: function (config) {
        this.callParent([config]);
    },

    start: function () {
        var me = this;
        me.animating = true;
        me.time = 0;
        me.callParent(arguments);
        Ext.fx.Frame.ignite();
    },

    //perform a step in the animation (computed on each frame).
    step: function (currentTime) {
        var me = this,
            time = me.time,
            delay = me.getDelay(),
            duration = me.getDuration(),
            delta = 0;

        if (time === 0) {
            time = me.time = currentTime;
        }
        //if not animating, then return
        if (!me.animating) {
            return;
        }

        //hold animation for the delay
        if (currentTime < time + delay) {
            // me.set(me.compute(me.getFrom(), me.getTo(), 0));
            return;
        }
        //if in our time window, then execute animation
        if (currentTime < time + delay + duration) {
            delta = me.getEasing()((currentTime - time - delay) / duration);
            me.set(me.compute(me.getFrom(), me.getTo(), delta));
        } else {
            me.set(me.compute(me.getFrom(), me.getTo(), 1));
            me.getOnComplete().call(me);
            me.animating = false;
        }
    },

    compute: function (from, to, delta) {
        return this.getOnCompute().call(this, delta);
    },

    stop: function () {
        var me = this;
        if (me.animating) {
            me.animating = false;
            me.time = null;
            me.getOnComplete().call(me);
        }
        me.callParent(arguments);
    },

    set: Ext.emptyFn

    //Inherited

    // pause: Ext.emptyFn,

    // resume: Ext.emptyFn,

}, function () {
    //Initialize the endless animation loop.
    var looping = false,
        ExtQueue = Ext.fx.Queue,
        Frame = Ext.fx.Frame;
    
    function loop () {
        Frame.frameStartTime = false;
        Frame.animationTime();
        if (!ExtQueue.empty()) {
            ExtQueue.refresh(Frame.frameStartTime);
            Frame.fireFrameCallbacks();
            Frame.requestAnimationFrame(loop);
        } else {
            looping = false;
        }
    }

    Frame.ignite = function () {
        if (!looping) {
            looping = true;
            Frame.requestAnimationFrame(loop);
            Ext.draw.Draw.updateIOS();
        }
    }

});
