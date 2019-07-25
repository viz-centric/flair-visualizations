var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var d3layoutcloud = require("../../d3-libs/d3.layout.cloud.js");
var Seedrandom = require("../../d3-libs/seedrandom.min.js");

var UTIL = require('../extras/util.js')();
var LEGEND = require('../extras/legend_barcharts.js')();

try {
    var d3Lasso = require("d3-lasso");

} catch (ex) { }


function rangefilter() {

    var _NAME = 'rangefilter';

    var _config,
        _dimension,
        _measure,
        _colorSet = [],
        _print,
        _displayNameForMeasure = [],
        _fontStyle = [],
        _fontWeight = [],
        _numberFormat = [],
        _textColor = [],
        _displayColor = [],
        _borderColor = [],
        _fontSize = [],
        _lineType = [],
        _pointType = [],
        _data,
        _tooltip;

    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 45
    };

    var x = d3.scaleTime(), y = d3.scaleLinear();

    var _local_svg, data, _Local_data, _originalData, tooltip;

    var parentWidth, parentHeight, container, brush = d3.brushX(), focus;

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.colorSet(config.colorSet);
        this.labelColor(config.labelColor);
        this.displayNameForMeasure(config.displayNameForMeasure);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        this.numberFormat(config.numberFormat);
        this.textColor(config.textColor);
        this.displayColor(config.displayColor);
        this.borderColor(config.borderColor);
        this.fontSize(config.fontSize);

    }

    var brushed = function () {
        var s = d3.event.selection;

        var dates = s.map(x.invert, x)

        var formatDate = d3.timeFormat("%Y-%m-%d")

        _local_svg.select('.dateRange')
            .text(formatDate(dates[0]) + " -> " + formatDate(dates[1]));
    }

    var _buildTooltipData = function (datum, chart) {
        var output = "";
        output += "<table><tr>"

            + "<th>" + chart.dimension() + ": </th>"
            + "<td>" + datum.data[_dimension[0]] + "</td>"
            + "</tr><tr>"
            + "<th>" + datum.tag + ": </th>"
            // + "<td>" + datum.data[datum.tag] + "</td>"
            + "<td>" + UTIL.getFormattedValue(datum.data[datum.tag], UTIL.getValueNumberFormat(_measure.indexOf(datum.tag), _numberFormat, datum.data[datum.tag])) + " </td>"
            + "</tr></table>";

        return output;
    }

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'pointer')
                .style('fill', COMMON.HIGHLIGHTER);
            var border = UTIL.getDisplayColor(0, _displayColor)
            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, border);
            }
        }
    }
    var _handleMouseMoveFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                var border = UTIL.getDisplayColor(0, _displayColor)
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, border);
            }
        }
    }
    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'pointer')
                .style('fill', function (d1, i) {
                    return UTIL.getBorderColor(0, _borderColor);
                })

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }

    function chart(selection) {
        data = _Local_data = _originalData = _data;

        if (_print) {
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

        _local_svg = svg;

        parentWidth = (width - 2 * COMMON.PADDING);
        parentHeight = (height - 2 * COMMON.PADDING) //* 70 / 100;

        svg.attr('width', width)
            .attr('height', height)

        var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S")
        bisectDate = d3.bisector(function (d) { return d[_dimension[0]]; }).left;

        var line = d3.line()
            .x(function (d) {
                return x(d[_dimension[0]]);
            })
            .y(function (d) {
                return y(d[_measure[0]]);
            });

        x.range([0, parentWidth]);
        y.range([parentHeight, 0]);

        parentContainer.append('div')
            .attr('class', 'custom_tooltip');

        if (_tooltip) {
            tooltip = parentContainer.select('.custom_tooltip');
        }

        var g = svg.append("g")
            .attr("transform", "translate(" + COMMON.PADDING + "," + COMMON.PADDING + ")");

        data.forEach(function (d) {
            d[_dimension[0]] = parseTime(d[_dimension[0]]);
            d[_measure[0]] = +d[_measure[0]];
        });

        x.domain(d3.extent(data, function (d) { return d[_dimension[0]]; }));
        y.domain([d3.min(data, function (d) { return d[_measure[0]]; }) / 1.005, d3.max(data, function (d) { return d[_measure[0]]; }) * 1.005]);

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + parentHeight + ")")
            .call(d3.axisBottom(x));

        g.append('text')
            .style("text-anchor", "middle")
            .attr("class", 'dateRange')
            .attr("x", parentWidth / 2)
            .attr("y", 5)
            .attr("dy", ".31em");

        g.append("path")
            .datum(data)
            .attr("class", "line")
            .attr('stroke-dasharray', 'none')
            .style('fill', 'none')
            .attr('stroke', function (d, i) {
                return UTIL.getDisplayColor(0, _displayColor);
            })
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', 1)
            .attr("d", line);

        g.append("path")
            .datum(data)
            .attr("class", "line")
            .attr('stroke-dasharray', 'none')
            .style('fill', 'none')
            .attr('stroke', function (d, i) {
                return UTIL.getDisplayColor(0, _displayColor);
            })
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', 1)
            .attr("d", line);



        focus = g.append("g")
            .attr("class", "focus")
            .style("display", "none");

        focus.append("line")
            .attr("class", "x-hover-line hover-line")
            .style('stroke', function (d, i) {
                return UTIL.getDisplayColor(0, _displayColor);
            })
            .style('stroke-width', 2)
            .attr("y1", 0)
            .attr("y2", parentHeight);


        focus.append("line")
            .attr("class", "y-hover-line hover-line")
            .style('stroke', function (d, i) {
                return UTIL.getDisplayColor(0, _displayColor);
            })
            .style('stroke-width', 2)
            .attr("x1", parentWidth)
            .attr("x2", parentWidth);

        focus.append("circle")
            .style('fill', function (d, i) {
                return UTIL.getDisplayColor(0, _displayColor);
            })
            .style('stroke', function (d, i) {
                return UTIL.getDisplayColor(0, _displayColor);
            })
            .style('fill-opacity', 0.5)
            .style('stroke-width', '2xp')
            .attr("r", 5);

        focus.append("text")
            .attr("x", 15)
            .attr("dy", ".31em");

        brush.extent([[0, 0], [parentWidth, parentHeight]])
            .on("brush", brushed);

        svg.append("g")
            //.attr("transform", "translate(" + COMMON.PADDING + "," + height * 70 / 100 + ")")
            .attr("transform", "translate(" + COMMON.PADDING + "," + COMMON.PADDING + ")")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x.range())
            .selectAll("rect")
            //.attr("y", -6)
            .attr("height", parentHeight);

        svg.append("rect")
            .attr("transform", "translate(" + COMMON.PADDING + "," + COMMON.PADDING + ")")
            .attr("class", "overlay")
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr("width", parentWidth)
            .attr("height", 10)
            .on("mouseover", function () {
                focus.style("display", null);
            })
            .on("mouseout", function () {
                focus.style("display", "none");
            })
            .on("mousemove", mousemove);

        svg.selectAll('.axis--x .tick').style('visibility', 'hidden');

        var point = g.selectAll('point')
            .data(function (d, i) {
                return data.map(function (datum) { return { "tag": d, "data": datum }; });
            })
            .enter().append('path')
            .attr('class', 'point')
            .attr('stroke', function (d, i) {
                return UTIL.getDisplayColor(0, _displayColor);
            })
            .attr('fill', function (d, i) {
                return UTIL.getBorderColor(0, _borderColor);
            })
            .attr('d', function (d, i) {
                return d3.symbol()
                    .type(d3.symbolCircle)
                    .size(20)();
            })
            .attr('transform', function (d) {
                return 'translate('
                    + (x(d['data'][_dimension[0]]))
                    + ',' + y(d.data[_measure[0]]) + ')';
            })
            // .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
            // .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
            // .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
    }

    var mousemove = function () {

        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0[_dimension[0]] > d1[_dimension[0]] - x0 ? d1 : d0;

        var formatDate = d3.timeFormat("%Y-%m-%d")
        focus.attr("transform", "translate(" + x(d[_dimension[0]]) + "," + y(d[_measure[0]]) + ")");
        focus.select("text").text(function () { return formatDate(d["order_date"]); });
        focus.select(".x-hover-line").attr("y2", parentHeight - y(d[_measure[0]]));
        focus.select(".y-hover-line").attr("x2", parentWidth + parentWidth);
    }

    chart._getName = function () {
        return _NAME;
    }

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
    }

    chart.update = function (data) {

        _local_svg.selectAll('text').remove();

        drawPlot(data);
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

    chart.colorSet = function (value) {
        if (!arguments.length) {
            return _colorSet;
        }
        _colorSet = value;
        return chart;
    }

    chart.labelColor = function (value) {
        if (!arguments.length) {
            return _labelColor;
        }
        _labelColor = value;
        return chart;
    }
    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    }
    chart.showValues = function (value, measure) {
        return UTIL.baseAccessor.call(_showValues, value, measure, _measure);
    }

    chart.displayNameForMeasure = function (value, measure) {
        return UTIL.baseAccessor.call(_displayNameForMeasure, value, measure, _measure);
    }

    chart.fontStyle = function (value, measure) {
        return UTIL.baseAccessor.call(_fontStyle, value, measure, _measure);
    }

    chart.fontWeight = function (value, measure) {
        return UTIL.baseAccessor.call(_fontWeight, value, measure, _measure);
    }

    chart.numberFormat = function (value, measure) {
        return UTIL.baseAccessor.call(_numberFormat, value, measure, _measure);
    }

    chart.textColor = function (value, measure) {
        return UTIL.baseAccessor.call(_textColor, value, measure, _measure);
    }

    chart.displayColor = function (value, measure) {
        return UTIL.baseAccessor.call(_displayColor, value, measure, _measure);
    }

    chart.borderColor = function (value, measure) {
        return UTIL.baseAccessor.call(_borderColor, value, measure, _measure);
    }

    chart.fontSize = function (value, measure) {
        return UTIL.baseAccessor.call(_fontSize, value, measure, _measure);
    }

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    }
    chart.broadcast = function (value) {
        if (!arguments.length) {
            return broadcast;
        }
        broadcast = value;
        return chart;
    }
    chart.filterParameters = function (value) {
        if (!arguments.length) {
            return filterParameters;
        }
        filterParameters = value;
        return chart;
    }
    chart.isAnimationDisable = function (value) {
        if (!arguments.length) {
            return isAnimationDisable;
        }
        isAnimationDisable = value;
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
module.exports = rangefilter;
