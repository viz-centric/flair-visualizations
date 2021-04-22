var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var UTIL = require('../extras/util.js')();
var $ = require("jquery");

function gauge() {

    var _NAME = 'gauge';
    var _config,
        measures,
        gaugeType,
        displayName,
        fontStyle,
        fontWeight,
        showValues,
        displayColor,
        isGradient,
        textColor,
        numberFormat,
        targetDisplayName,
        targetFontStyle,
        targetFontWeight,
        targetShowValues,
        targetDisplayColor,
        targetTextColor,
        targetNumberFormat,
        _print,
        _tooltip,
        _notification = false,
        _data;

    var _local_svg, tooltip;

    var emptyArc, fillArc, targetArc, arc, _measure, target, offsetX = 16;
    var ringInset, ringWidth;

    var _setConfigParams = function (config) {
        this.measures(config.measures);
        this.gaugeType(config.gaugeType);
        this.displayName(config.displayName);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        this.showValues(config.showValues);
        this.displayColor(config.displayColor);
        this.isGradient(config.isGradient);
        this.textColor(config.textColor);
        this.numberFormat(config.numberFormat);
        this.targetDisplayName(config.targetDisplayName);
        this.targetFontStyle(config.targetFontStyle);
        this.targetFontWeight(config.targetFontWeight);
        this.targetShowValues(config.targetShowValues);
        this.targetDisplayColor(config.targetDisplayColor);
        this.targetTextColor(config.targetTextColor);
        this.targetNumberFormat(config.targetNumberFormat);
        setDefaultColorForChart();
    }

    var degToRad = function (deg) {
        return deg * Math.PI / 180;
    }

    var setDefaultColorForChart = function () {
        if (displayColor == null || displayColor == undefined) {
            displayColor = COMMON.COLORSCALE(0);
        }
        if (targetDisplayColor == null || targetDisplayColor == undefined) {
            targetDisplayColor = COMMON.COLORSCALE(1);
        }
    }

    var _buildTooltipData = function (datum, chart, value, key) {
        var output = "";

        output += "<table><tr>"
            + "<th>" + key + ": </th>"

            + "<th>" + value + " </th>"

            + "</tr></table>";

        return output;
    }

    var degToRad_circle = function (deg) {
        return deg * Math.PI / 360;
    }

    var percToDeg = function (perc) {
        return perc * 360;
    }

    var percToRad = function (perc) {
        return degToRad(percToDeg(perc));
    }

    var _handleMouseOverFn = function (tooltip, container, key, value) {

        var me = this;
        return function (d, i) {
            d3.select(this).style('cursor', 'pointer')
                .style('fill', COMMON.HIGHLIGHTER);
            var border = d3.select(this).style('stroke')
            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me, key, value), container, border);
            }
        }
    }

    var _handleMouseMoveFn = function (tooltip, container, key, value) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                var border = d3.select(this).style('stroke')
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me, key, value), container, border);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'default')
                .style('fill', function (d1, i) {
                    return d3.select(this).style('stroke')
                })
            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }

    var getTxCenter = function (width, height) {
        if (gaugeType == 'radial') {
            return 'translate(' + (width / 2) + ', ' + (height / 2) + ')';
        } else {
            return 'translate(' + (width / 2) + ', ' + (height - 15) + ')';
        }
    }

    function chart(selection) {

        _Local_data = _originalData = _data;

        if (_print && !_notification) {
            parentContainer = selection;
        }
        else {
            parentContainer = d3.select('#' + selection.id)
        }

        var svg = parentContainer.append('svg')
            .attr('width', parentContainer.attr('width'))
            .attr('height', parentContainer.attr('height'))

        var width = +svg.attr('width'),
            height = +svg.attr('height');

        parentContainer.append('div')
            .attr('class', 'custom_tooltip');

        _local_svg = svg;

        if (_tooltip) {
            tooltip = parentContainer.select('.custom_tooltip');
        }

        var radius;
        var degree = 90;

        if (gaugeType === 'radial') {
            degree = 180;
            radius = Math.min(width, height) / 2;
        } else {
            radius = Math.max(width, height) / 2;
            radius = radius > Math.min(width, height) ? Math.min(width, height) : radius;
        }

        ringInset = radius * 0.3,
            ringWidth = radius * 0.2;

        arc = d3.arc()
            .innerRadius(radius - ringInset - ringWidth)
            .outerRadius(radius - ringInset)
            .startAngle(degToRad(-degree))

        _arc = d3.arc()
            .innerRadius(radius - ringInset - ringWidth)
            .outerRadius(radius - ringInset)
            .startAngle(degToRad(-degree))

        var container = svg.append("g")
            .attr("transform", 'translate(' + COMMON.PADDING + ',' + COMMON.PADDING + ')')

        var legend = container
            .attr('class', 'gauge-legend')
            .selectAll('.item')
            .data(measures)
            .enter().append('g')
            .attr('class', 'item')
            .attr('id', function (d, i) {
                return 'legend' + i;
            })
            .attr('transform', function (d, i) {
                return 'translate(' + i * Math.floor(width / measures.length) + ', 0)';
            })
            .on('mouseover', function (d, i) {
                d3.select(this).attr('cursor', 'pointer')
                if (i == 0) {
                    fillArc.style("fill", COMMON.HIGHLIGHTER)
                }
                else {
                    targetArc.style("fill", COMMON.HIGHLIGHTER)
                }
            })
            .on('mousemove', function (d, i) {
                d3.select(this).attr('cursor', 'pointer')
            })
            .on('mouseout', function (d, i) {
                d3.select(this).attr('cursor', 'default')
                if (i == 0) {
                    fillArc.style("fill", displayColor)
                }
                else {
                    targetArc.style("fill", targetDisplayColor)
                }
            })

        legend.append('rect')
            .attr('x', 4)
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', function (d, i) {
                if (i == 0)
                    return displayColor;
                else
                    return targetDisplayColor;
            })
            .style('stroke', function (d, i) {
                if (i == 0)
                    return displayColor;
                else
                    return targetDisplayColor;
            })
            .style('stroke-width', 0);

        legend.append('text')
            .attr('x', 18)
            .attr('y', 5)
            .attr('dy', function (d) {
                return d3.select(this).style('font-size').replace('px', '') / 2.5;
            })
            .text(function (d, i) {
                if (!_print) {
                    return UTIL.getTruncatedLabel(this, measures[i], Math.floor(width / measures
                        .length), 5);
                }
                else {
                    return measures[i];
                }
            });

        legend.attr('transform', function (d, i) {
            var count = i,
                widthSum = 0
            while (count-- != 0) {
                widthSum += parentContainer.select('#legend' + count).node().getBBox().width + offsetX;
            }
            return 'translate(' + widthSum + ', ' + 0 + ')';
        });

        var plot = container
            .append("g")
            .attr("transform", getTxCenter(width, height))

        emptyArc = plot.append("path")
            .datum({
                endAngle: degToRad(degree)
            })
            .style("fill", ' #efefef')
            .attr("class", "gaugeBackground")
            .attr("d", arc)

        fillArc = plot.append("path")
            .datum({
                endAngle: degToRad(-degree)
            })
            .attr("class", "fillArc")
            .style("fill", displayColor)
            .style("stroke", displayColor)
            .attr("d", arc);

        targetArc = plot.append("path")
            .datum({
                endAngle: degToRad(-degree)
            })
            .attr("class", "targetArc")
            .style("fill", targetDisplayColor)
            .style("stroke", targetDisplayColor)
            .attr("d", arc);

        _measure = plot.append("text")
            .attr("transform", "translate(0," + -(-20 + ringInset / 4) + ")")
            .attr("text-anchor", "middle")
            .style('font-size', '12px')
            .style('font-weight', fontWeight)
            .style('font-style', fontStyle)
            .style('visibility', showValues)
            .style('fill', textColor)
            .attr('dy', function () {
                if (gaugeType === 'radial') {
                    return 0;
                } else {
                    return -15;
                }
            })
            .text(function () {
                return displayName + " " + UTIL.getFormattedValue(_data[0][measures[0]], UTIL.getNumberFormatterFn(numberFormat, _data[0][measures[0]]));
            })

        // displayName + " " + data[0][measures[0]])

        target = plot.append("text")
            .attr("transform", "translate(0," + -(-20 + ringInset / 4 + 15) + ")")
            .attr("text-anchor", "middle")
            .style('font-size', '12px')
            .style('font-weight', targetFontWeight)
            .style('font-style', targetFontStyle)
            .style('visibility', targetShowValues)
            .style('fill', targetTextColor)
            .attr('dy', function () {
                if (gaugeType === 'radial') {
                    return 0;
                } else {
                    return -15;
                }
            })
            .text(function () {
                return displayName + " " + UTIL.getFormattedValue(_data[0][measures[1]], UTIL.getNumberFormatterFn(targetNumberFormat, _data[0][measures[1]]));
            })

        chart.update(_data);

    }

    chart._getName = function () {
        return _NAME;
    }
    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
    }

    chart.update = function (_data) {

        var maxVal = Math.max(_data[0][measures[0]], _data[0][measures[1]]);
        var point = 90
        if (gaugeType === 'radial') {
            point = 0;
        } else {
            point = 90
        }
        var _measurePi = degToRad(Math.floor(_data[0][measures[0]] * 180 / maxVal - point));
        var targetPi = degToRad(Math.floor(_data[0][measures[1]] * 180 / maxVal - point));

        var _measureValue = UTIL.getFormattedValue(_data[0][measures[0]], UTIL.getNumberFormatterFn(numberFormat, _data[0][measures[0]]));
        var _tragetValue = UTIL.getFormattedValue(_data[0][measures[1]], UTIL.getNumberFormatterFn(targetNumberFormat, _data[0][measures[1]]));
        _measure.transition()
            .text(function () {
                return displayName + " " + _measureValue;
            })
            .text(function () {
                if (_print) {
                    return displayName + " " + _measureValue;
                }
                else {
                    return UTIL.getTruncatedLabel(this, displayName + " " + _measureValue, ringInset)
                }
            })

        target.transition()
            .text(function () {
                return targetDisplayName + " " + _tragetValue;
            })
            .text(function () {
                if (_print) {
                    return targetDisplayName + " " + _tragetValue;
                }
                else {
                    return UTIL.getTruncatedLabel(this, targetDisplayName + " " + _tragetValue, ringInset)
                }
            })

        if (!_print) {

            fillArc.transition()
                .duration(1000)
                .styleTween("fill", function () {
                    return d3.interpolate(displayColor);
                })
                .call(arcTween, _measurePi)

            targetArc.transition()
                .duration(1000)
                .styleTween("fill", function () {
                    return d3.interpolate(targetDisplayColor);
                })
                .call(arcTween, targetPi);

            fillArc.on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg, _measureValue, displayName))
                .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg, _measureValue, displayName))
                .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg, _measureValue, displayName))

            targetArc.on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg, _tragetValue, targetDisplayName))
                .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg, _tragetValue, targetDisplayName))
                .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg, _tragetValue, targetDisplayName))
        }
        else {
            fillArc
                .style("fill", function () {
                    return displayColor;
                })
                .datum({
                    endAngle: _measurePi
                })
                .attr("d", arc)

            targetArc
                .style("fill", function () {
                    return targetDisplayColor;
                })
                .datum({
                    endAngle: targetPi
                })
                .attr("d", arc)
        }


    }

    var arcTween = function (transition, newAngle) {
        transition.attrTween("d", function (d) {
            var interpolate = d3.interpolate(d.endAngle, newAngle);
            return function (t) {
                d.endAngle = interpolate(t);
                return arc(d);
            };
        });
    }

    chart.config = function (value) {
        if (!arguments.length) {
            return _config;
        }
        _config = value;
        _setConfigParams.call(chart, _config);
        return chart;
    }
    chart.measures = function (value) {
        if (!arguments.length) {
            return measures;
        }
        measures = value;
        return chart;
    }
    chart.gaugeType = function (value) {
        if (!arguments.length) {
            return gaugeType;
        }
        gaugeType = value;
        return chart;
    }

    chart.displayName = function (value) {
        if (!arguments.length) {
            return displayName;
        }
        displayName = value;
        return chart;
    }

    chart.textColor = function (value) {
        if (!arguments.length) {
            return textColor;
        }
        textColor = value;
        return chart;
    }
    chart.fontStyle = function (value) {
        if (!arguments.length) {
            return fontStyle;
        }
        fontStyle = value;
        return chart;
    }
    chart.fontWeight = function (value) {
        if (!arguments.length) {
            return fontWeight;
        }
        fontWeight = value;
        return chart;
    }

    chart.showValues = function (value) {
        if (!arguments.length) {
            return showValues;
        }
        showValues = value;
        return chart;
    }

    chart.displayColor = function (value) {
        if (!arguments.length) {
            return displayColor;
        }
        displayColor = value;
        return chart;
    }

    chart.isGradient = function (value) {
        if (!arguments.length) {
            return isGradient;
        }
        isGradient = value;
        return chart;
    }

    chart.numberFormat = function (value) {
        if (!arguments.length) {
            return numberFormat;
        }
        numberFormat = value;
        return chart;
    }

    chart.targetDisplayName = function (value) {
        if (!arguments.length) {
            return targetDisplayName;
        }
        targetDisplayName = value;
        return chart;
    }

    chart.targetFontStyle = function (value) {
        if (!arguments.length) {
            return targetFontStyle;
        }
        targetFontStyle = value;
        return chart;
    }

    chart.targetFontWeight = function (value) {
        if (!arguments.length) {
            return targetFontWeight;
        }
        targetFontWeight = value;
        return chart;
    }

    chart.targetShowValues = function (value) {
        if (!arguments.length) {
            return targetShowValues;
        }
        targetShowValues = value;
        return chart;
    }

    chart.targetDisplayColor = function (value) {
        if (!arguments.length) {
            return targetDisplayColor;
        }
        targetDisplayColor = value;
        return chart;
    }

    chart.targetTextColor = function (value) {
        if (!arguments.length) {
            return targetTextColor;
        }
        targetTextColor = value;
        return chart;
    }

    chart.targetNumberFormat = function (value) {
        if (!arguments.length) {
            return targetNumberFormat;
        }
        targetNumberFormat = value;
        return chart;
    }

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    }
    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    }
    chart.data = function (value) {
        if (!arguments.length) {
            return _data;
        }
        _data = value;
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
module.exports = gauge;
