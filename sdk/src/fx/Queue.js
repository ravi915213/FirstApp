/**
 * @singleton Ext.fx.Queue
 *
 * Manages an animation Queue. Behaves more like a Pool than a Queue.
 *
 */

Ext.define('Ext.fx.Queue', {
  singleton: true,

  queue: [],

  /**
   * Adds an animation to the pool.
   *
   *  @param {Ext.fx.Abstract} The animation to add to the pool.
   *
   * */
  add: function(animation) {
    if (!this.contains(animation)) {
      this.queue.push(animation);
    }
  },

    /**
     * Removes an animation from the pool.
     *
     *  @param {Ext.fx.Abstract} The animation to remove from the pool.
     *
     * */
  remove: function(animation) {
    var me = this,
        queue = me.queue,
        i = 0,
        l = queue.length;

    for (; i < l; ++i) {
      if (queue[i] === animation) {
        queue.splice(i, 1);
        return;
      }
    }
  },

    /**
     * Returns true or false whether it contains the given animation or not.
     *
     *  @param {Ext.fx.Abstract} The animation to check for.
     *
     * */
  contains: function(animation) {
    return this.queue.indexOf(animation) > -1;
  },

    /**
     * Returns true or false whether the pool is empty or not.
     *
     * */
  empty: function () {
    return this.queue.length === 0;
  },

    /**
     * Given a frame time it will filter out finished animations from the pool.
     *
     *  @param {Number} The time in milliseconds.
     *
     * */
  refresh: function(startTime) {
    var me = this,
        queue = me.queue,
        newQueue = [],
        i = 0,
        l = queue.length;

    for (; i < l; ++i) {
      queue[i].step(startTime);
      if (queue[i].animating) {
        newQueue.push(queue[i]);
      }
    }

    me.queue = newQueue;
  }

});

