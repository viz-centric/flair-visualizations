var d3 = require('d3');
var COMMON = require('../extras/common.js')(),
    UTIL = require('../extras/util.js')();

function kpi() {

    /* These are the constant global variable for the function kpi.
     */
    var _NAME = 'kpi';

    /* These are the private variables that is initialized by the arguments sent
     * by the users and can be updated using public methods.
     */

    var _config,
        _dimension,
        _measure,
        _kpiAlignment,
        /* Initialization of these variable is important, otherwise Windows object
         * will be sent during calling of baseAccessor function
         */
        _kpiDisplayName = [],
        _kpiBackgroundColor = [],
        _kpiNumberFormat = [],
        _kpiFontStyle = [],
        _kpiFontWeight = [],
        _kpiFontSize = [],
        _kpiColor = [],
        _kpiColorExpression = [],
        _kpiIcon = [],
        _kpiIconFontWeight = [],
        _kpiIconColor = [],
        _kpiIconExpression = [],
        _FontsizeForDisplayName = [],
        _showIcon = [],
        _iconSize = [],
        _isAnimation,
        _print,
        _notification = false,
        _data;
    /* These are the common variables that is shared across the different private/public
     * methods but is initialized/updated within the methods itself.
     */
    var _localDiv,
        _localTotal = [],
        _localPrevKpiValue = [0, 0],
        _Local_data,
        _localLabelFontSize = [1.2, 0.9],
        parentContainer,
        plot,
        height, width, container;

    /* These are the common private functions that is shared across the different private/public
     * methods but is initialized beforehand.
     */


    /* -------------------------------------------------------------------------------- */
    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.kpiDisplayName(config.kpiDisplayName);
        this.kpiAlignment(config.kpiAlignment);
        this.kpiBackgroundColor(config.kpiBackgroundColor);
        this.kpiNumberFormat(config.kpiNumberFormat);
        this.kpiFontStyle(config.kpiFontStyle);
        this.kpiFontWeight(config.kpiFontWeight);
        this.kpiFontSize(config.kpiFontSize);
        this.kpiColor(config.kpiColor);
        this.kpiColorExpression(config.kpiColorExpression);
        this.kpiIcon(config.kpiIcon);
        this.kpiIconFontWeight(config.kpiIconFontWeight);
        this.kpiIconColor(config.kpiIconColor);
        this.kpiIconExpression(config.kpiIconExpression);
        this.FontsizeForDisplayName(config.FontSizeforDisplayName);
        this.showIcon(config.showIcon);
        this.iconSize(config.iconSize);
        this.isAnimation(config.isAnimation);
    }

    /**
     * Gives label for a particular measure
     *
     * @param {number} index Index for a particular measure
     * @return {string}
     */
    var _getKpiDisplayName = function (index) {
        if (_kpiDisplayName[index] != undefined && _kpiDisplayName[index].trim() == '') {
            return _measure[index];
        }

        return _kpiDisplayName[index];
    }

    setFont = function () {
        var containerSize = parseInt(d3.select(container).node().style('width')) + 100;
        var heightIcon = parseInt(d3.select(container).node().style('height'));


        if (width - 2 * COMMON.PADDING < containerSize) {
            var newFontSize = parseInt(container.selectAll('.child span').style('font-size')) - 5;
            var newIconSize = parseInt(container.selectAll('.child i').style('font-size')) - 5;

            if (newFontSize >= 9) {
                container.selectAll('.child span').style('font-size', newFontSize + 'px')
            }
            if (newIconSize >= 9) {
                container.selectAll('.child i').style('font-size', newIconSize + 'px')

            }

            //working on it


            // container.selectAll('.child i')
            //     .style('height', newFontSize + 'px')
            //     .style('display', 'flex')
            //     .style('align-items', 'center')

            setFont();
        }
        else {

            //working on it

            // container.selectAll('.child i')
            //     .style('height', _kpiFontSize[0] + 'px')
            //     .style('display', 'flex')
            //     .style('align-items', 'center')
            return true;
        }
    }

    /**
     * HTML data for the KPI value
     *
     * @param {number} value Accumulated value of the measure
     * @param {number} endValue End value upto which the transition should occur
     * @param {nummber} index Index of the measure for which the HTML output of the KPI is required
     * @return {string}
     */
    var _getKpi = function (value, endValue, index) {
        var numberOutput = "",
            iconOutput = "";

        var style = {
            'font-style': _kpiFontStyle[index] || COMMON.DEFAULT_FONTSTYLE,
            'font-weight': _kpiFontWeight[index] || COMMON.DEFAULT_FONTWEIGHT,
            'font-size': _kpiFontSize[index] + 'px' || COMMON.DEFAULT_FONTSIZE,
            'color': _kpiColor[index] || COMMON.DEFAULT_COLOR,
            'display': index == 0 ? 'flex' : 'inline-block',
            'align-items': 'center'
        };

        if (_kpiColorExpression[index].length) {
            style['color'] = UTIL.expressionEvaluator(_kpiColorExpression[index], endValue, 'color');
        }

        style = JSON.stringify(style);
        style = style.replace(/["{}]/g, '').replace(/,/g, ';');

        numberOutput += "<span style='" + style + "'>"
            + UTIL.getFormattedValue(value, UTIL.getNumberFormatterFn(_kpiNumberFormat[index], value));

        numberOutput = + "</span>";

        var iconStyle = {
            'font-weight': _kpiIconFontWeight[index] || COMMON.DEFAULT_FONTWEIGHT,
            'color': _kpiIconColor[index] || (endValue > 0 ? COMMON.POSITIVE_KPI_COLOR : COMMON.NEGATIVE_KPI_COLOR),
            'font-size': _iconSize[index] + 'px' || COMMON.DEFAULT_FONTSIZE,
            'display': _showIcon[index] == true ? 'inline-block' : 'none'
            // 'float': index == 1 ? 'left' : 'right'
        };



        if (_kpiIconExpression[index].length) {
            _kpiIcon[index] = UTIL.expressionEvaluator(_kpiIconExpression[index], endValue, 'icon');
            iconStyle['color'] = UTIL.expressionEvaluator(_kpiIconExpression[index], endValue, 'color');
        }
        if (_kpiIcon[index] == null || _kpiIcon[index] == undefined) {
            if (endValue > 0) {
                _kpiIcon[index] = 'fa fa-arrow-up';
            }
            else {
                _kpiIcon[index] = 'fa fa-arrow-down';
            }
        }
        iconStyle = JSON.stringify(iconStyle);
        iconStyle = iconStyle.replace(/["{}]/g, '').replace(/,/g, ';');

        iconOutput += "<i class=\"" + _kpiIcon[index] + "\" style=\"" + iconStyle + "\" aria-hidden=\"true\"></i>";

        return index ? ("<div style='white-space:nowrap;display:flex;align-items:center;'>" + iconOutput + "&nbsp;" + numberOutput + "</div>")
            : ("<div style='white-space:nowrap;display:flex;align-items:center;'>" + numberOutput + "&nbsp;" + iconOutput + "</div>");
    }

    function chart(selection) {
        
        _Local_data = _originalData = _data;

        if (_print && !_notification) {
            parentContainer = selection;
        }
        else {
            parentContainer = d3.select('#' + selection.id)
        }

        width = parentContainer.attr('width')
        height = parentContainer.attr('height')

        _localDiv = parentContainer

        /* total sum of the measure values */
        _localTotal = _measure.map(function (m) {
            return d3.sum(_data.map(function (d) { return d[m]; }));
        });

        container = parentContainer.append('div')
            .classed('_container', true)
            .style('position', 'absolute')

            .style('width', width - 2 * COMMON.PADDING)
            .style('height', height - 2 * COMMON.PADDING)
            .style('padding', COMMON.PADDING);

        if (_kpiAlignment == "Center") {
            container.style('top', '50%')
                .style('left', '50%')
                .style('transform', 'translate(-50%, -50%)')


        }
        else if (_kpiAlignment == "Left") {
            container.style('top', '50%')
                .style('left', 0)
                .style('transform', 'translate(0, -50%)')
        }
        else {
            container.style('top', '50%')
                .style('right', '0px')
                .style('left', 'unset')
                .style('transform', 'translate(-5%, -50%)')
        }

        _measure.forEach(function (m, i) {
            var measure = container.append('div')
                .classed('measure', true)
                .style('display', 'flex')
                .style('height', '50%')
                .style('align-items', function (d, i) {
                    return i ? 'center' : 'flex-end';
                })
                .append('div')
                .classed('parent', true)
                .style('display', 'block')
                .style('width', 'auto')
                .style('height', 'auto')

            measure.append('div')
                .attr('id', function (d, i1) {
                    return 'kpi-label-' + i;
                })
                .style('display', 'block')
                .classed('child', true)
                .html(_getKpiDisplayName(i))
                .style('font-size', function (d, i) {

                    return _FontsizeForDisplayName[i] + 'px'

                })
                .style('padding-left', '5px')
                .style('text-align', function (d, i1) {
                    return i ? 'right' : 'Left';
                });

            var kpiMeasure = measure.insert('div', (function () {
                return i ? ':first-child' : null;
            })())
                .attr('id', function (d, i1) {
                    return 'kpi-measure-' + i;
                })
                .classed('child', true)
                .style('font-size', function () {

                    return _kpiFontSize[i] + 'px'

                })
                .style('border-radius', function (d, i1) {
                    return COMMON.BORDER_RADIUS + 'px';
                })
                .style('background-color', function (d, i1) {
                    return _kpiBackgroundColor[i] || 'transparent';
                })
                .style('padding', function (d, i1) {
                    return (_kpiFontStyle[i] == 'oblique' && i)
                        ? '3px 8px'
                        : '3px 0px';
                })
                .style('display', function (d, i1) {
                    return 'contents';
                })
                .style('line-height', 1)

            if (!_print && _isAnimation) {
                kpiMeasure.transition()
                    .ease(d3.easeQuadIn)
                    .duration(1000)
                    .delay(0)
                    .tween('html', function () {
                        var me = d3.select(this),
                            interpolator = d3.interpolateNumber(_localPrevKpiValue[i], _localTotal[i]);

                        _localPrevKpiValue[i] = _localTotal[i];

                        return function (t) {
                            me.html(_getKpi(interpolator(t), _localTotal[i], i));
                            setFont()
                        }
                    });
            }
            else {
                kpiMeasure.html(_getKpi(_localTotal[i], _localTotal[i], i));
            }
            setFont()
        });

        if (_print) {

            plot = parentContainer.append('svg')
                .attr('class', 'KPI')
                .attr('width', width - 2 * COMMON.PADDING)
                .attr('height', height - 2 * COMMON.PADDING)

            plot.append('foreignObject')
                .attr('class', 'plot')
                .html(_localDiv.node().outerHTML);

            plot = d3.select('.KPI');

        }
    }

    chart._getName = function () {
        return _NAME;
    }

    chart._getHTML = function () {
        return _localDiv.node().outerHTML;
    }

    chart.update = function (data) {
        var div = _localDiv;

        /* store the data in local variable */
        _Local_data = data;

        /* total sum of the measure values */
        _localTotal = _measure.map(function (m) {
            return d3.sum(data.map(function (d) { return d[m]; }));
        });

        _measure.forEach(function (m, i) {

            if (!_print && _isAnimation) {
                div.select('#kpi-measure-' + i)
                    .transition()
                    .ease(d3.easeQuadIn)
                    .duration(500)
                    .delay(0)
                    .tween('html', function () {
                        var me = d3.select(this),
                            interpolator = d3.interpolateNumber(_localPrevKpiValue[i], _localTotal[i]);

                        _localPrevKpiValue[i] = _localTotal[i];

                        return function (t) {
                            me.html(_getKpi(interpolator(t), _localTotal[i], i));
                            setFont()
                        }
                    }).on("end", setFont);
            }
            else {
                div.select('#kpi-measure-' + i)
                    .html(_getKpi(_localTotal[i], _localTotal[i], i));
            }
            setFont()
        });

        var container = parentContainer.select('._container');

        if (_kpiAlignment == "Center") {
            container.style('top', '50%')
                .style('left', '50%')
                .style('transform', 'translate(-50%, -50%)')
        }
        else if (_kpiAlignment == "Left") {
            container.style('top', '50%')
                .style('left', 0)
                .style('transform', 'translate(0, -50%)')
        }
        else {
            container.style('top', '50%')
                .style('right', '0px')
                .style('left', 'unset')
                .style('transform', 'translate(-5%, -50%)')
        }

        //  setFont();
    }

    chart.config = function (value) {
        if (!arguments.length) {
            return _config;
        }
        _config = value;
        _setConfigParams.call(chart, _config);
        return chart;
    }

    chart.dimension = function (value) {
        if (!arguments.length) {
            return _dimension;
        }
        _dimension = value;
        return chart;
    }

    chart.measure = function (value) {
        if (!arguments.length) {
            return _measure;
        }
        _measure = value;
        return chart;
    }

    chart.kpiAlignment = function (value) {
        if (!arguments.length) {
            return _kpiAlignment;
        }
        _kpiAlignment = value;
        return chart;
    }

    chart.iconSize = function (value, measure) {
        return UTIL.baseAccessor.call(_iconSize, value, measure, _measure);
    }

    /**
     * KPI Displayname accessor function
     *
     * @param {string|array(string)|null} value Displayname value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiDisplayName = function (value, measure) {
        return UTIL.baseAccessor.call(_kpiDisplayName, value, measure, _measure);
    }

    /**
    * KPI Background Color accessor function
    *
    * @param {string|array(string)|null} value Background Color value for the measure(s)
    * @param {string|null} measure Measure for which the value is to be set or retrieved
    * @return {string|array(string)|function}
    */
    chart.kpiBackgroundColor = function (value, measure) {
        return UTIL.baseAccessor.call(_kpiBackgroundColor, value, measure, _measure);
    }

    /**
     * KPI Number Format accessor function
     *
     * @param {string|array(string)|null} value Number Format value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiNumberFormat = function (value, measure) {
        return UTIL.baseAccessor.call(_kpiNumberFormat, value, measure, _measure);
    }

    /**
     * KPI Font Style accessor function
     *
     * @param {string|array(string)|null} value Font Style value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiFontStyle = function (value, measure) {
        return UTIL.baseAccessor.call(_kpiFontStyle, value, measure, _measure);
    }

    /**
     * KPI Font Weight accessor function
     *
     * @param {string|array(string)|null} value Font Weight value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiFontWeight = function (value, measure) {
        return UTIL.baseAccessor.call(_kpiFontWeight, value, measure, _measure);
    }

    /**
     * KPI Font Size accessor function
     *
     * @param {string|array(string)|null} value Font Size value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiFontSize = function (value, measure) {
        return UTIL.baseAccessor.call(_kpiFontSize, value, measure, _measure);
    }

    /**
     * KPI Font Color accessor function
     *
     * @param {string|array(string)|null} value Font Color value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiColor = function (value, measure) {
        return UTIL.baseAccessor.call(_kpiColor, value, measure, _measure);
    }

    /**
     * KPI Font Color Expression accessor function
     *
     * @param {string|array(string)|null} value Font Color Expression value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiColorExpression = function (value, measure) {
        if (!arguments.length) {
            /**
             * Getter method call with no arguments
             * E.g. <chart>.kpiColorExpression() ==> [<item1>, <item2>]
             */
            return _kpiColorExpression;
        }

        if (value instanceof Array && measure == void 0) {
            /**
             * Setter method call with only value argument
             * E.g. <chart>.kpiColorExpression([<item1>, <item2>]) ==> <chart_function>
             */
            _kpiColorExpression = value.map(function (v) {
                return UTIL.getExpressionConfig(v, ['color']);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error('Invalid measure provided');
        }

        if (value == void 0) {
            /**
             * Getter method call with only measure argument
             * E.g. <chart>.kpiColorExpression(<measure>) ==> <item>
             */
            return _kpiColorExpression[index];
        } else {
            /**
             * Setter method call with both value and measure arguments
    * E.g. <chart>.kpiColorExpression(<item>, <measure>) ==> <chart_function>
             */
            _kpiColorExpression[index] = UTIL.getExpressionConfig(value, ['color']);
        }

        return chart;
    }

    /**
     * KPI Icon accessor function
     *
     * @param {string|array(string)|null} value Icon value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiIcon = function (value, measure) {
        return UTIL.baseAccessor.call(_kpiIcon, value, measure, _measure);
    }

    /**
     * KPI Icon Font Weight accessor function
     *
     * @param {string|array(string)|null} value Icon Font Weight value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiIconFontWeight = function (value, measure) {
        return UTIL.baseAccessor.call(_kpiIconFontWeight, value, measure, _measure);
    }

    /**
     * KPI Icon Color accessor function
     *
     * @param {string|array(string)|null} value Icon Color value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiIconColor = function (value, measure) {
        return UTIL.baseAccessor.call(_kpiIconColor, value, measure, _measure);
    }

    /**
     * KPI Icon Color Expression accessor function
     *
     * @param {string|array(string)|null} value Icon Color Expression value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiIconExpression = function (value, measure) {
        if (!arguments.length) {
            /**
             * Getter method call with no arguments
             * E.g. <chart>.kpiIconExpression() ==> [<item1>, <item2>]
             */
            return _kpiIconExpression;
        }

        if (value instanceof Array && measure == void 0) {
            /**
             * Setter method call with only value argument
             * E.g. <chart>.kpiIconExpression([<item1>, <item2>]) ==> <chart_function>
             */
            _kpiIconExpression = value.map(function (v) {
                return UTIL.getExpressionConfig(v, ['icon', 'color']);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error('Invalid measure provided');
        }

        if (value == void 0) {
            /**
             * Getter method call with only measure argument
             * E.g. <chart>.kpiIconExpression(<measure>) ==> <item>
             */
            return _kpiIconExpression[index];
        } else {
            /**
             * Setter method call with both value and measure arguments
             * E.g. <chart>.kpiIconExpression(<item>, <measure>) ==> <chart_function>
             */
            _kpiIconExpression[index] = UTIL.getExpressionConfig(value, ['icon', 'color']);
        }

        return chart;
    }

    chart.showIcon = function (value) {
        if (!arguments.length) {
            return _showIcon;
        }
        _showIcon = value;
        return chart;
    }

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    }
    chart.FontsizeForDisplayName = function (value) {
        if (!arguments.length) {
            return _FontsizeForDisplayName;
        }
        _FontsizeForDisplayName = value;
        return chart;
    }
    chart.data = function (value) {
        if (!arguments.length) {
            return _data;
        }
        _data = value;
        return chart;
    }
    chart.isAnimation = function (value) {
        if (!arguments.length) {
            return _isAnimation;
        }
        _isAnimation = value;
        return chart;
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

module.exports = kpi;