var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var UTIL = require('../extras/util.js')();
var $ = require("jquery");

function textobject() {
    var _NAME = COMMON.TextObject;

    var _config,
        descriptive,
        _alignment,
        _textFormat = "Order List",
        _measure,
        _value = [],
        _displayNameForMeasure = [],
        _fontStyle = [],
        _fontWeight = [],
        _numberFormat = [],
        _textColor = [],
        _backgroundColor = [],
        _underline = [],
        _icon = [],
        _numberFormat = [],
        _fontSize = [],
        _iconExpression = [],
        _textColorExpression = [],
        _print;

    var parentWidth, parentHeight, plotWidth, plotHeight, container, parentContainer;

    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 45
    };

    var _setConfigParams = function (config) {
        this.measure(config.measure);
        this.value(config.value);
        this.textFormat(config.textFormat)
        this.displayNameForMeasure(config.displayNameForMeasure);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        this.numberFormat(config.numberFormat);
        this.textColor(config.textColor);
        this.backgroundColor(config.backgroundColor);
        this.underline(config.underline);
        this.fontSize(config.fontSize);
        this.icon(config.icon);
        this.iconExpression(config.iconExpression);
        this.alignment(config.alignment);
        this.textColorExpression(config.textColorExpression);
    }

    var getIcon = function (index, endValue) {
        var iconOutput = "";

        var iconStyle = {
            'font-weight': _fontWeight[index] || COMMON.DEFAULT_FONTWEIGHT,
            'color': _textColor[index] || COMMON.DEFAULT_COLOR,
            'font-size': _fontSize[index] + 'px' || COMMON.DEFAULT_FONTSIZE,
            'padding': '0 10px'
        };

        if (_iconExpression[index].length) {
            _icon[index] = UTIL.expressionEvaluator(_iconExpression[index], endValue, 'icon');
            iconStyle['color'] = UTIL.expressionEvaluator(_iconExpression[index], endValue, 'color');
        }

        iconStyle = JSON.stringify(iconStyle);
        iconStyle = iconStyle.replace(/["{}]/g, '').replace(/,/g, ';');

        iconOutput += "<i  class=\"fa " + _icon[index] + "\" style=\"" + iconStyle + "\" aria-hidden=\"true\"></i>";

        if (_iconExpression[index] !== "") {
            return iconOutput;
        }
        return "";
    }

    function chart(selection) {
        parentContainer = selection;

        if (_print) {
            parentContainer = selection;
        }
        else {
            parentContainer = d3.select('#' + selection.id)
        }

        var width = parentContainer.attr('width'),
            height = parentContainer.attr('height')

        var container = parentContainer.append('div')
            .classed('_container', true)
            .style('width', width - 2 * COMMON.PADDING)
            .style('height', height - 2 * COMMON.PADDING)
            .style('text-align', _alignment)
            .style('padding', COMMON.PADDING);

        var formate = "ol";
        if (_textFormat != "Order List") {
            formate = "ul"
        }

        var html = container.append(formate)
            .style('display', 'inline - table')

        _value.forEach(function (m, index) {
            var style = {
                'background-color': _backgroundColor[index],
                'font-style': _fontStyle[index],
                'font-weight': _fontWeight[index],
                'font-size': _fontSize[index] + "px",
                'color': _textColor[index],
                'text-decoration': _underline[index] == true ? 'underline' : 'none'
            };

            if (_textColorExpression[index].length > 0) {
                style['color'] = UTIL.expressionEvaluator(_textColorExpression[index], _value[index], 'color');
            }

            html.append('li')
                .style('background-color', _backgroundColor[index])
                .style('font-style', _fontStyle[index])
                .style('font-weight', _fontWeight[index])
                .style('font-size', _fontSize[index] + 'px')
                .style('color', style['color'])
                .style('ext-decoration', _underline[index] == true ? 'underline' : 'none')
                .html(_displayNameForMeasure[index] + " <span>" + _value[index] + "</span><span>" + getIcon(index, _value[index]) + "</span>")
        });


        // var html = '<div class="_container"  style="text-align:' + _alignment + '"><' + formate + ' style="display:inline-table;">';
        // for (var index = 0; index < _value.length; index++) {

        //     var style = {
        //         'background-color': _backgroundColor[index],
        //         'font-style': _fontStyle[index],
        //         'font-weight': _fontWeight[index],
        //         'font-size': _fontSize[index] + "px",
        //         'color': _textColor[index],
        //         'text-decoration': _underline[index] == true ? 'underline' : 'none'
        //     };

        //     if (_textColorExpression[index].length > 0) {
        //         style['color'] = UTIL.expressionEvaluator(_textColorExpression[index], _value[index], 'color');
        //     }

        //     style = JSON.stringify(style);
        //     style = style.replace(/","/g, ';').replace(/["{}]/g, '');

        //     html += "<li  style=\"" + style + "\">" + _displayNameForMeasure[index] + " <span>" + _value[index] + "</span><span>" + getIcon(index, _value[index]) + "</span></li>";
        // }
        // html += '</' + formate + '> </div>';
        // parentContainer.innerHTML = html;

    }

    chart._getName = function () {
        return _NAME;
    }

    chart._getHTML = function () {
        return parentContainer.node().outerHTML;
    }

    chart.config = function (value) {
        if (!arguments.length) {
            return _config;
        }
        _config = value;
        _setConfigParams.call(chart, _config);
        return chart;
    }

    chart.measure = function (value) {
        if (!arguments.length) {
            return _measure;
        }
        _measure = value;
        return chart;
    }

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    }

    chart.alignment = function (value) {
        if (!arguments.length) {
            return _alignment;
        }
        _alignment = value;
        return chart;
    }

    chart.textFormat = function (value) {
        if (!arguments.length) {
            return _textFormat;
        }
        _textFormat = value;
        return chart;
    }


    chart.value = function (value, measure) {
        return UTIL.baseAccessor.call(_value, value, measure, _measure, chart);
    }

    chart.displayNameForMeasure = function (value, measure) {
        return UTIL.baseAccessor.call(_displayNameForMeasure, value, measure, _measure, chart);
    }

    chart.fontStyle = function (value, measure) {
        return UTIL.baseAccessor.call(_fontStyle, value, measure, _measure, chart);
    }

    chart.fontWeight = function (value, measure) {
        return UTIL.baseAccessor.call(_fontWeight, value, measure, _measure, chart);
    }

    chart.numberFormat = function (value, measure) {
        return UTIL.baseAccessor.call(_numberFormat, value, measure, _measure, chart);
    }

    chart.textColor = function (value, measure) {
        return UTIL.baseAccessor.call(_textColor, value, measure, _measure, chart);
    }

    chart.backgroundColor = function (value, measure) {
        return UTIL.baseAccessor.call(_backgroundColor, value, measure, _measure, chart);
    }

    chart.underline = function (value, measure) {
        return UTIL.baseAccessor.call(_underline, value, measure, _measure, chart);
    }

    chart.fontSize = function (value, measure) {
        return UTIL.baseAccessor.call(_fontSize, value, measure, _measure, chart);
    }

    chart.icon = function (value, measure) {
        return UTIL.baseAccessor.call(_icon, value, measure, _measure, chart);
    }

    chart.iconExpression = function (value, measure) {
        if (!arguments.length) {
            return _iconExpression;
        }

        if (value instanceof Array && measure == void 0) {
            _iconExpression = value.map(function (v) {
                return UTIL.getExpressionConfig(v, ['icon', 'color']);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error('Invalid measure provided');
        }

        if (value == void 0) {
            return _iconExpression[index];
        } else {
            _iconExpression[index] = UTIL.getExpressionConfig(value, ['icon', 'color']);
        }

        return chart;
    }

    chart.textColorExpression = function (value, measure) {
        if (!arguments.length) {
            return _textColorExpression;
        }

        if (value instanceof Array && measure == void 0) {
            _textColorExpression = value.map(function (v) {
                return UTIL.getExpressionConfig(v, ['color']);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error('Invalid measure provided');
        }

        if (value == void 0) {
            return _textColorExpression[index];
        } else {
            _textColorExpression[index] = UTIL.getExpressionConfig(value, ['color']);
        }
    }
    chart.notification = function (value) {
        if (!arguments.length) {
            return _notification;
        }
        _notification = value;
        return chart;
    }
    return chart;
}

module.exports = textobject;