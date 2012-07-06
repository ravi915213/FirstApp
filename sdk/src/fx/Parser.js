/**
 * @class Ext.fx.Parser
 * @singleton
 * @private
 * Provides methods for parsing, computing and serving special values (colors, numbers, etc) that need
 * to be interpolated during an animation.
 */
Ext.define('Ext.fx.Parser', {
    singleton: true,
    compute: function(from, to, delta) {
        return from + (to - from) * delta;
    },
    
    Color: {
        parse: function(value) {
            var color;
            if (value === color) {
                return null;
            }
            if (value.match(/^#[0-9a-fA-F]{3,6}$/)) {
                color = Ext.draw.Color.fromString(value);
                return [ color.r, color.g, color.b, 1];
            }
            color = value.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/);
            if (color) {
                return [ +color[1], +color[2], +color[3], +color[4]];
            } else {
                color = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                if (color) {
                    return [ +color[1], +color[2], +color[3], 1 ];
                } else if (typeof value === 'string' && (color = Ext.draw.Color.fromName(value))) {
                    return [ color.r, color.g, color.b, 1 ];
                } else if (value === 'none') {
                    return [0, 0, 0, 0];
                } else {
                    return value;
                }
            }
        },

        compute: function(from, to, delta) {
            if (!Ext.isArray(from) || !Ext.isArray(to)) {
                return to || from;
            } else {
                var me = this;
                return [ Ext.fx.Parser.compute(from[0], to[0], delta),
                    Ext.fx.Parser.compute(from[1], to[1], delta),
                    Ext.fx.Parser.compute(from[2], to[2], delta),
                    Ext.fx.Parser.compute(from[3], to[3], delta)];
            }
        },

        serve: function(value) {
            if (typeof value == 'string') {
                return value;
            } else if (value) {
                return 'rgba(' + [ +value[0] >> 0, +value[1] >> 0, +value[2] >> 0, +value[3]].join(',') + ')';
            }
        }
    },

    Object: {
        parse: function(value) {
            var ans = {},
                name;

            for (name in value) {
                ans[name] = Ext.fx.Parser.prepare(name, value[name]);
            }

            return ans;
        },

        compute: function(from, to, delta) {
            var ans = {},
                name, fromValue, toValue, parser;

            for (name in from) {
                parser = Ext.fx.Parser.AttributeParser[name];
                if (parser) {
                    fromValue = from[name];
                    toValue = to[name];
                    ans[name] = parser.compute(fromValue, toValue, delta);
                }
            }

            return ans;
        },

        serve: function(props, unit) {
            var ret = {},
                prop, name, parser;

            for (name in props) {
                parser = Ext.fx.Parser.AttributeParser[name];
                prop = props[name];
                ret[name] = parser.serve(prop, unit);
            }

            return ret;
        }
    },

    Number: {
        parse: function(n) { return n === null ? null : parseFloat(n); },

        compute: function(from, to, delta) {
            if (!Ext.isNumber(from) || !Ext.isNumber(to)) {
                return to || from;
            } else {
                return Ext.fx.Parser.compute(from, to, delta);
            }
        },

        serve: function(value, unit) {
            return unit ? value + unit : value;
        }
    },

    String: {
        parse: function(value) { return value; },

        compute: function(from, to) {
            return to;
        },

        serve: function(value) {
            return value;
        }
    },

    Path: {

        parse: function(value) {
            if (!value.length && !value[0].length) {
                value = Ext.draw.Draw.parsePathString(path);
            }
            return value;
        },

        compute: function(from, to, delta) {
            var i = 0,
                j = 0,
                ans = [],
                l = from.length,
                n, cmd, cmdFrom, cmdTo;

            for (; i < l; ++i) {
                cmd = ans[i] = [];
                cmdFrom = from[i];
                cmdTo = to[i];

                for (j = 0, n = cmdFrom.length; j < n; ++j) {
                    if (typeof cmdFrom[j] == 'number') {
                        cmd[j] = cmdFrom[j] + (cmdTo[j] - cmdFrom[j]) * delta;
                    } else {
                        cmd[j] = cmdFrom[j];
                    }
                }
            }

            return ans;
        },

        serve: function(value) {
            return value;
        }
    },

    Text: {
        parse: function(value) { return value; },

        compute: function(from, to, delta) {
            return from.substr(0, Math.round(from.length * (1 - delta))) + to.substr(Math.round(to.length * (1 - delta)));
        },

        serve: function(value) {
            return value;
        }
    },

    prepare: function(key, value) {
        var parser = Ext.fx.Parser.AttributeParser[key];
        if (!parser && console && console.warn) {
            console.warn('Missing parser for property ' + key + '. Using String parser.');
        }
        return parser ? parser.parse(value) : value;
    }
}, function() {
    var parser = Ext.fx.Parser,
        obj = parser.Object;

    //TODO(nico): Add more parsers here
    parser.AttributeParser = {
        fill:        parser.Color,
        stroke:      parser.Color,
        color:       parser.Color,
        shadowColor: parser.Color,

        x:              parser.Number,
        y:              parser.Number,
        width:          parser.Number,
        height:         parser.Number,
        top:            parser.Number,
        left:           parser.Number,
        bottom:         parser.Number,
        right:          parser.Number,
        margin:         parser.Number,
        degrees:        parser.Number,
        padding:        parser.Number,
        lineWidth:      parser.Number,
        opacity:        parser.Number,
        shadowOffsetX:  parser.Number,
        shadowOffsetY:  parser.Number,
        shadowBlur:     parser.Number,
        radius:         parser.Number,
        size:           parser.Number,
        'stroke-width': parser.Number,
        "font-size":    parser.Number,
        "font-family":  parser.String,
        startAngle:     parser.Number,
        endAngle:       parser.Number,
        margin:         parser.Number,
        rho:            parser.Number,
        startRho:       parser.Number,
        endRho:         parser.Number,

        translate:   obj,
        translation: obj,
        rotate:      obj,
        rotation:    obj,
        scale:       obj,
        scaling:     obj,
        segment:     obj,

        path: parser.Path,

        zIndex:        parser.String,
        index:         parser.String,
        "text-anchor": parser.String,
        type:          parser.String,
        src:           parser.String,
        reset:         parser.String,
        font:          parser.String,
        hidden:        parser.String,
        text:          parser.Text
    };
});
