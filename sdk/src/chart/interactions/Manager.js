/**
 * @class Ext.chart.interactions.Manager
 * @extends Ext.AbstractManager
 * @singleton
 * @private
 *
 * A singleton manager instance for chart interactions. Interaction classes register
 * themselves by name with this manager.
 */
Ext.define("Ext.chart.interactions.Manager", {
    singleton: true,
    extend: 'Ext.AbstractManager'
});