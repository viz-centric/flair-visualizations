var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var UTIL = require('../extras/util.js')();
var $ = require("jquery");

function infographics() {

    /* These are the constant global variable for the function kpi.
     */
    var _NAME = 'infographics';

    /* These are the private variables that is initialized by the arguments sent
     * by the users and can be updated using public methods.
     */

    var _config,
        _dimension,
        _dimensionType,
        _measure,
        _chartType,
        _chartDisplayColor,
        _chartBorderColor,
        _kpiDisplayName,
        _kpiAlignment,
        _kpiBackgroundColor,
        _kpiNumberFormat,
        _kpiFontStyle,
        _kpiFontWeight,
        _kpiFontSize,
        _kpiColor,
        _kpiColorExpression,
        _kpiIcon,
        _kpiIconFontWeight,
        _kpiIconColor,
        _kpiIconExpression,
        _tooltip,
        _print,
        _notification = false,
        _data;

    /* These are the common variables that is shared across the different private/public
     * methods but is initialized/updated within the methods itself.
     */
    var _localDiv,
        _localTotal = 0,
        _localPrevKpiValue = 0,
        _localData,
        _localXLabels = [],
        _localMin,
        _localMax,
        _localTooltip, infographics, container;

    /* These are the common private functions that is shared across the different private/public
     * methods but is initialized beforehand.
     */
    var x = d3.scalePoint(),
        y = d3.scaleLinear(),
        lineGenerator = d3.line(),
        areaGenerator = d3.area();

    /* -------------------------------------------------------------------------------- */
    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.dimensionType(config.dimensionType);
        this.measure(config.measure);
        this.chartType(config.chartType);
        this.chartDisplayColor(config.chartDisplayColor);
        this.chartBorderColor(config.chartBorderColor);
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
        this.tooltip(config.tooltip);
        setDefaultColorForChart();
    }

    var _getKpiDisplayName = function () {
        if (_kpiDisplayName.trim() == '') {
            return _measure;
        }

        return _kpiDisplayName;
    }

    var _getKpi = function (value, endValue) {
        var numberOutput = "",
            iconOutput = "";

        var style = {
            'font-style': _kpiFontStyle || COMMON.DEFAULT_FONTSTYLE,
            'font-weight': _kpiFontWeight || COMMON.DEFAULT_FONTWEIGHT,
            'font-size': _kpiFontSize || COMMON.DEFAULT_FONTSIZE + 'px',
            'color': _kpiColor || COMMON.DEFAULT_COLOR
        };

        if (_kpiColorExpression[0]) {
            style['color'] = UTIL.expressionEvaluator(_kpiColorExpression, endValue, 'color');
        }

        style = JSON.stringify(style);
        style = style.replace(/["{}]/g, '').replace(/,/g, ';');

        numberOutput += "<span style='" + style + "'>"

            + UTIL.getFormattedValue(value, UTIL.getNumberFormatterFn(_kpiNumberFormat, value))
            + "</span>";

        var iconStyle = {
            'font-weight': _kpiIconFontWeight || COMMON.DEFAULT_FONTWEIGHT,
            'color': _kpiIconColor || COMMON.DEFAULT_COLOR,
            'font-size': _kpiFontSize || COMMON.DEFAULT_FONTSIZE + 'px'
        };

        if (_kpiIconExpression) {
            _kpiIcon = UTIL.expressionEvaluator(_kpiIconExpression, endValue, 'icon');
            iconStyle['color'] = UTIL.expressionEvaluator(_kpiIconExpression, endValue, 'color');
        }
        if (iconStyle.color[0] == undefined || iconStyle.color[0] == null) {
            if (endValue > 0) {
                iconStyle['color'] = COMMON.POSITIVE_KPI_COLOR;
            }
            else {
                iconStyle['color'] = COMMON.NEGATIVE_KPI_COLOR;
            }
        }
        if (_kpiIcon[0] == null || _kpiIcon[0] == undefined) {
            if (endValue > 0) {
                _kpiIcon = 'fa fa-arrow-up';
            }
            else {
                _kpiIcon = 'fa fa-arrow-down';
            }
        }
        iconStyle = JSON.stringify(iconStyle);
        iconStyle = iconStyle.replace(/["{}]/g, '').replace(/,/g, ';');

        iconOutput += "<i class=\"fa " + _kpiIcon + "\" style=\"" + iconStyle + "\" aria-hidden=\"true\"></i>";

        return numberOutput + "&nbsp;" + iconOutput;
    }

    var setDefaultColorForChart = function () {
        if (_chartDisplayColor == null || _chartDisplayColor == undefined) {
            _chartDisplayColor = COMMON.COLORSCALE(0);
        }
        if (_chartBorderColor == null || _chartBorderColor == undefined) {
            _chartBorderColor = COMMON.COLORSCALE(0);
        }
    }

    /* Builds the html data for the tooltip
     *
     * @param {object} datum Datum forming the arc
     * @param {function} chart Pie chart function
     * @return {string} String encoded HTML data
     */
    var _buildTooltipData = function (datum, chart) {
        var output = "";

        var value = UTIL.getFormattedValue(datum[chart.measure()], UTIL.getNumberFormatterFn(_kpiNumberFormat, datum[chart.measure()]))

        output += "<table><tr>"
            + "<th>" + chart.dimension() + ": </th>"
            + "<td>" + UTIL.getDimensionFormatedValue(datum[chart.dimension()],_dimensionType[0]) + "</td>"
            + "</tr><tr>"
            + "<th>" + chart.measure() + ": </th>"
            + "<td>" + value + "</td>"
            + "</tr></table>";

        return output;
    }

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'pointer');

            var point = container.selectAll('.infographics-point')
                .filter(function (d1) {
                    return d1[_dimension[0]] === d[_dimension[0]];
                });

            point.style('stroke-width', 2);

            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, _chartBorderColor, _notification);
            }
        }
    }

    var _handleMouseMoveFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, _chartBorderColor, _notification);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'default');

            var point = container.selectAll('.infographics-point')
                .filter(function (d1) {
                    return d1[_dimension[0]] === d[_dimension[0]];
                });

            point.style('stroke-width', 0);

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }

    function chart(selection) {

        data = _data;

        if (_print && !_notification) {
            parentContainer = selection;
        }
        else {
            parentContainer = d3.select('#' + selection.id)
        }

        var width = parentContainer.attr('width'),
            height = parentContainer.attr('height'),
            parentWidth = width - 2 * COMMON.PADDING,
            parentHeight = height - 2 * COMMON.PADDING;

        /* total sum of the measure values */
        _localTotal = d3.sum(data.map(function (d) { return d[_measure[0]]; }));

        /* store the data in local variable */
        _localData = data;

        parentContainer.append('div')
            .attr('class', 'custom_tooltip');

        container = parentContainer.append('div')
            .classed('container', true)
            .style('width', parentWidth + 'px')
            .style('height', parentHeight + 'px')
            .style('margin', COMMON.PADDING)
            .style('padding', '0px');

        var graphics = container.append('svg')
            .attr('id', 'graphics')
            .datum(data)
            .attr("width", parentWidth)
            .attr("height", parentHeight)

        if (!_notification) {
            graphics.style("position", 'absolute');
        }

        var info = container.append('div')
            .attr('id', 'info')
            .style('position', 'absolute')
            .style('width', '100%')
            .style('height', '100%')
            .style('pointer-events', 'none');

        if (_tooltip) {
            _localTooltip = parentContainer.select('.custom_tooltip');
        }

        _localDiv = graphics;
        /* Label values for the dimension */
        _localXLabels = data.map(function (d) {
            return d[_dimension[0]];
        });

        var keys = UTIL.getMeasureList(data[0], _dimension);
        var range = UTIL.getMinMax(data, keys);

        /* Minimum and Maximum value of the measures */
        // _localMin = d3.min(data, function (d) { return d[_measure[0]]; });
        // _localMax = d3.max(data, function (d) { return d[_measure[0]]; });
        _localMin = range[0];
        _localMax = range[1];

        x.domain(_localXLabels)
            .padding([0.5])
            .rangeRound([0, parentWidth]);

        y.domain([_localMin, _localMax])
            .range([parentHeight, 0]);

        areaGenerator = d3.area()
            .curve(d3.curveLinear)
            .x(function (d) {
                return x(d[_dimension[0]]);
            })
            .y0(function (d, i) {
                return y(0);
            })
            .y1(function (d) {
                return y(d[_measure[0]]);
            });

        lineGenerator = d3.line()
            .curve(d3.curveLinear)
            .x(function (d) {
                return x(d[_dimension[0]]);
            })
            .y(function (d) {
                return y(d[_measure[0]]);
            });

        var plot = graphics.append('g')
            .attr('transform', 'translate(' + 0 + ', ' + COMMON.PADDING + ')')
            .attr('id', 'infographics-plot');

        var line = plot.append('path')
            .classed('infographics-line', true)
            .style('fill', 'none')
            .style('stroke', _chartBorderColor)
            .style('stroke-width', '3px')
            .attr('d', lineGenerator)

        var area = plot.append('path')
            .classed('infographics-area', true)
            .style('fill', _chartDisplayColor)
            .style('stroke-width', 0)
            .style('opacity', 0.5)
            .attr('d', areaGenerator)

        var points = plot.append('g')
            .attr('id', 'infographics-point-group')
            .selectAll('.infographics-point')
            .data(data)
            .enter().append('circle')
            .classed('infographics-point', true)
            .attr('cx', function (d, i) {
                return x(d[_dimension[0]]);
            })
            .attr('cy', function (d, i) {
                return y(d[_measure[0]]);
            })
            .attr('r', 5)
            .style('fill', _chartBorderColor)
            .style('stroke', _chartBorderColor)
            .style('opacity', 0)
            .style('stroke-width', 1.5)
        var measure, parent, kpi;
        if (!_notification) {
            measure = info.append('div')
                .classed('measure', true)
                .style('justify-content', _kpiAlignment)
                .style('display', 'flex')
                .style('align-items', 'center')
                .style('height', '100%');

            parent = measure.append('div')
                .classed('parent', true)
                .style('background-color', function (d, i1) {
                    return _kpiBackgroundColor || 'transparent';
                })
                .style('border-radius', function (d, i1) {
                    return COMMON.BORDER_RADIUS + 'px';
                })
                .style('display', 'table');

            parent.append('div')
                .attr('id', 'kpi-label')
                .classed('child', true)
                .html(_getKpiDisplayName() + "&nbsp;")
                .style('font-size', _kpiFontSize + 'px')
                .style('padding-left', '5px')
                .style('display', 'table-cell')
                .style('vertical-align', 'middle');


            kpi = parent.append('div')
                .attr('id', 'kpi-measure')
                .classed('child', true)
                .style('font-size', _kpiFontSize + 'px')
                .style('border-radius', function (d, i1) {
                    return COMMON.BORDER_RADIUS + 'px';
                })
                .style('padding', function (d, i1) {
                    return (_kpiFontStyle == 'oblique')
                        ? '3px 8px'
                        : '3px 0px';
                })
                .style('display', 'table-cell')
                .style('vertical-align', 'middle');
        }

        if (!_print) {
            line.transition()
                .duration(COMMON.DURATION)
                .attrTween('stroke-dasharray', function () {
                    var l = this.getTotalLength(),
                        interpolator = d3.interpolateString("0," + l, l + "," + l);

                    return function (t) {
                        return interpolator(t);
                    }
                });

            points.transition()
                .duration(COMMON.DURATION * 2)
                .style('opacity', 1);

            if (kpi) {
                kpi.transition()
                    .ease(d3.easeQuadIn)
                    .duration(COMMON.DURATION)
                    .delay(0)
                    .tween('html', function () {
                        var me = d3.select(this),
                            i = d3.interpolateNumber(_localPrevKpiValue, _localTotal);

                        _localPrevKpiValue = _localTotal;

                        return function (t) {
                            me.html(_getKpi(i(t), _localTotal));
                        }
                    });
            }
        }
        else {
            area.style('opacity', .5)
            line.style('opacity', 1)
            kpi.html(_getKpi(_localTotal, _localTotal))

            var kpiData = graphics.append('text')
                .text(_getKpiDisplayName() + " " + _localTotal)

            if (_kpiAlignment == "right") {
                kpiData
                    .attr('transform', 'translate(' + width + ', ' + height / 2 + ')');
            }
            else if (_kpiAlignment == "left") {
                kpiData
                    .attr('transform', 'translate(' + 0 + ', ' + height / 2 + ')');
            }
            else {
                kpiData
                    .attr('transform', 'translate(' + width / 2 + ', ' + height / 2 + ')')
                    .style('text-anchor', 'middle')
            }

            _localDiv = graphics

        }
        if (!_print || _notification) {
            points.on('mouseover', _handleMouseOverFn.call(chart, _localTooltip, parentContainer))
                .on('mousemove', _handleMouseMoveFn.call(chart, _localTooltip, parentContainer))
                .on('mouseout', _handleMouseOutFn.call(chart, _localTooltip, parentContainer))
                .on('click', function (d, i) {

                });
        }

    }

    chart._getName = function () {
        return _NAME;
    }

    chart._getHTML = function () {
        // return _localDiv.select('svg').node().outerHTML;
        return _localDiv.node().outerHTML;
    }

    chart.update = function (data) {

        var infographics = _localDiv,
            width = infographics.attr('width'),
            height = infographics.attr('height'),
            parentWidth = width - 2 * COMMON.PADDING,
            parentHeight = height - 2 * COMMON.PADDING;

        if (_tooltip) {
            _localTooltip = infographics.select('.custom_tooltip');
        }
        var div = _localDiv;

        /* store the data in local variable */
        _localData = data;

        /* total sum of the measure values */
        _localTotal = d3.sum(data.map(function (d) { return d[_measure[0]]; }));

        /* Minimum and Maximum value of the measures */
        // _localMin = d3.min(data, function (d) { return d[_measure[0]]; });
        // _localMax = d3.max(data, function (d) { return d[_measure[0]]; });
        var keys = UTIL.getMeasureList(data[0], _dimension);
        var range = UTIL.getMinMax(data, keys);

        _localMin = range[0];
        _localMax = range[1];

        /* Label values for the dimension */
        _localXLabels = data.map(function (d) {
            return d[_dimension[0]];
        });

        /* Update the axes scales */
        x.domain(_localXLabels)
            .range([0, parentWidth]);

        y.domain([_localMin, _localMax])
            .range([parentHeight, 0]);

        var plot = div.select('#infographics-plot')
            .data([data]);

        plot.select('path.infographics-line')
            .transition()
            .duration(0)
            .attr('d', lineGenerator)
            .attr('stroke-dasharray', 'none');

        plot.select('path.infographics-area')
            .transition()
            .duration(0)
            .attr('d', areaGenerator);

        plot.selectAll('.infographics-point').remove();

        var points = plot.append('g')
            .attr('id', 'infographics-point-group')
            .selectAll('.infographics-point')
            .data(data)
            .enter().append('circle')
            .classed('infographics-point', true)
            .attr('cx', function (d, i) {
                return x(d[_dimension[0]]);
            })
            .attr('cy', function (d, i) {
                return y(d[_measure[0]]);
            })
            .attr('r', 6)
            .style('fill', _chartBorderColor)
            .style('stroke', _chartBorderColor)
            .style('stroke-opacity', 0.6)
            .style('stroke-width', 1.5)

        points.on('mouseover', _handleMouseOverFn.call(chart, _localTooltip, infographics))
            .on('mousemove', _handleMouseMoveFn.call(chart, _localTooltip, infographics))
            .on('mouseout', _handleMouseOutFn.call(chart, _localTooltip, infographics))

        container.select('#kpi-measure')
            .html(_getKpi(_localTotal, _localTotal))

        container.select('#kpi-label')
            .html(_getKpiDisplayName() + "&nbsp;")
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

    chart.dimensionType = function (value) {
        if (!arguments.length) {
            return _dimensionType;
        }
        _dimensionType = value;
        return chart;
    }

    chart.measure = function (value) {
        if (!arguments.length) {
            return _measure;
        }
        _measure = value;
        return chart;
    }

    chart.chartType = function (value) {
        if (!arguments.length) {
            return _chartType;
        }
        _chartType = value;
        return chart;
    }

    chart.chartBorderColor = function (value) {
        if (!arguments.length) {
            return _chartBorderColor;
        }
        _chartBorderColor = value;
        return chart;
    }

    chart.chartDisplayColor = function (value) {
        if (!arguments.length) {
            return _chartDisplayColor;
        }
        _chartDisplayColor = value;
        return chart;
    }

    chart.kpiDisplayName = function (value) {
        if (!arguments.length) {
            return _kpiDisplayName;
        }
        _kpiDisplayName = value;
        return chart;
    }

    chart.kpiAlignment = function (value) {
        if (!arguments.length) {
            return _kpiAlignment;
        }
        _kpiAlignment = value;
        return chart;
    }

    chart.kpiBackgroundColor = function (value) {
        if (!arguments.length) {
            return _kpiBackgroundColor;
        }
        _kpiBackgroundColor = value;
        return chart;
    }

    chart.kpiNumberFormat = function (value) {
        if (!arguments.length) {
            return _kpiNumberFormat;
        }
        _kpiNumberFormat = value;
        return chart;
    }

    chart.kpiFontStyle = function (value) {
        if (!arguments.length) {
            return _kpiFontStyle;
        }
        _kpiFontStyle = value;
        return chart;
    }

    chart.kpiFontWeight = function (value) {
        if (!arguments.length) {
            return _kpiFontWeight;
        }
        _kpiFontWeight = value;
        return chart;
    }

    chart.kpiFontSize = function (value) {
        if (!arguments.length) {
            return _kpiFontSize;
        }
        _kpiFontSize = value;
        return chart;
    }

    chart.kpiColor = function (value) {
        if (!arguments.length) {
            return _kpiColor;
        }
        _kpiColor = value;
        return chart;
    }

    chart.kpiColorExpression = function (value) {
        if (!arguments.length) {
            return _kpiColorExpression;
        }
        _kpiColorExpression = UTIL.getExpressionConfig(value, ['color']);
        return chart;
    }

    chart.kpiIcon = function (value) {
        if (!arguments.length) {
            return _kpiIcon;
        }
        _kpiIcon = value;
        return chart;
    }

    chart.kpiIconFontWeight = function (value) {
        if (!arguments.length) {
            return _kpiIconFontWeight;
        }
        _kpiIconFontWeight = value;
        return chart;
    }

    chart.kpiIconColor = function (value) {
        if (!arguments.length) {
            return _kpiIconColor;
        }
        _kpiIconColor = value;
        return chart;
    }

    chart.kpiIconExpression = function (value) {
        if (!arguments.length) {
            return _kpiIconExpression;
        }
        _kpiIconExpression = UTIL.getExpressionConfig(value, ['icon', 'color']);
        return chart;
    }

    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    }

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    }
    chart.notification = function (value) {
        if (!arguments.length) {
            return _notification;
        }
        _notification = value;
        return chart;
    }
    chart.data = function (value) {
        if (!arguments.length) {
            return _data;
        }
        _data = value;
        return chart;
    }
    return chart;
}

module.exports = infographics;