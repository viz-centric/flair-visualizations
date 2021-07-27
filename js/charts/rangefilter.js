var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var UTIL = require('../extras/util.js')();
var $ = require("jquery");
function rangefilter() {

    var _NAME = 'rangefilter';

    var _config,
        _dimension,
        _dimensionType,
        _measure,
        _dateFormat,
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
        _tooltip,
        broadcast,
        _showXaxis,
        _showYaxis,
        filterParameters;

    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 45
    };

    var x = d3.scalePoint(), y = d3.scaleLinear();

    var _local_svg, data, parseTime, _Local_data, _originalData, tooltip;

    var tickLength = d3.scaleLinear()
        .domain([22, 34])
        .range([2, 4]);


    var parentWidth, parentHeight, container, brush = d3.brushX(), focus;

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.dimensionType(config.dimensionType);
        this.measure(config.measure);
        this.dateFormat(config.dateFormat);
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
        this.showXaxis(config.showXaxis);
        this.showYaxis(config.showYaxis);

    }

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'pointer')
                .style('fill', COMMON.HIGHLIGHTER);
            var border = UTIL.getDisplayColor(_measure.indexOf(d.tag), _displayColor)
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
                var border = UTIL.getDisplayColor(_measure.indexOf(d.tag), _displayColor)
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, border);
            }
        }
    }
    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'pointer')
                .style('fill', function (d1, i) {
                    return UTIL.getBorderColor(_measure.indexOf(d.tag), _borderColor);
                })

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }

    var brushed = function () {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom

        var s = d3.event.selection,
            filterList = [];
        x.domain().forEach((d) => {
            var pos = x(d) + x.bandwidth() / 2;
            if (pos > s[0] && pos < s[1]) {
                filterList.push(d);
            }
        });

        if (filterList.length >= 2) {
            var dates = [filterList[0], filterList[filterList.length - 1]]
            _local_svg.select('.dateRange')
                .text(dates[0] + " -> " + dates[1]);

            if (broadcast) {
               var _filterDimension = broadcast.selectedFilters || {};
                if (broadcast.filterSelection.id) {
                   _filterDimension = broadcast.selectedFilters[_dimension[0]] || {};
                } else {
                    broadcast.filterSelection.id = parentContainer.attr('id');
                }
                var dimension = _dimension[0];

                var _filterParameters = filterParameters.get();

                _filterParameters[dimension] = [dates[0], dates[1]];

                _filterParameters[dimension]._meta = {
                    dataType: _dimensionType[0],
                    valueType: 'dateRangeValueType'
                };

                filterParameters.save(_filterParameters);

                broadcast.$broadcast('flairbiApp:filter');
                broadcast.$broadcast('flairbiApp:filter-add');
                broadcast.$broadcast('flairbiApp:filter-set-date-ranges', { dimensionName: dimension, startDate: dates[0], endDate: dates[1] });
            }
        }
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

    function chart(selection) {
        var dateList = _data.map(function (v) {
            return v[_dimension[0]];
        })
        dateList = UTIL.sortDateRange(dateList);
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
        parentHeight = (height - 2 * COMMON.PADDING - 15);

        svg.attr('width', width)
            .attr('height', height)

        parentContainer.append('div')
            .attr('class', 'custom_tooltip');

        if (_tooltip) {
            tooltip = parentContainer.select('.custom_tooltip');
        }

        var plot = svg.append('g')
            .attr('class', 'daterange-plot')
            .classed('plot', true)
            .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

        var labelStack = [];
        var keys = UTIL.getMeasureList(data[0], _dimension);

        x.rangeRound([0, parentWidth])
            .padding([0.5])
            .domain(data.map(function (d) { return d[_dimension[0]]; }));

        var range = UTIL.getMinMax(data, keys);

        y.rangeRound([parentHeight, 0])
            .domain([range[0], range[1]])
            .nice();

        brush.extent([[0, 0], [parentWidth, parentHeight]])
            .on("brush", brushed);

        var _localXLabels = data.map(function (d) {
            return d[_dimension[0]];
        });

        lineGenerator = d3.line()
            .curve(d3.curveLinear)
            .x(function (d, i) {
                return x(d['data'][_dimension[0]]) + x.bandwidth() / 2;
            })
            .y(function (d, i) {
                return y(d['data'][d['tag']]);
            });

        /* Axes */
        var xAxisGroup;
        var isRotate = false;

        _localXAxis = d3.axisBottom(x)
            .tickSize(0)
            .tickFormat(function (d) {
                if (isRotate == false) {
                    isRotate = UTIL.getTickRotate(d, (parentWidth) / (_localXLabels.length - 1), tickLength);
                }
                return UTIL.getTruncatedTick(d, (parentWidth) / (_localXLabels.length - 1), tickLength, _dimensionType[0]);
            })
            .tickPadding(10);

        if (isRotate) {
            _local_svg.selectAll('.x_axis .tick text')
                .attr("transform", "rotate(-15)");
        }

        xAxisGroup = plot.append('g')
            .attr('class', 'x_axis')
            .attr('visibility', UTIL.getVisibility(_showXaxis))
            .attr('transform', 'translate(0, ' + parentHeight + ')')
            .call(_localXAxis);

        plot.append("g")
            .attr("class", "x_brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", parentHeight);

        var clusterLine = plot.selectAll('.cluster_line')
            .data(keys.filter(function (m) { return labelStack.indexOf(m) == -1; }))
            .enter().append('g')
            .attr('class', 'cluster_line');

        var line = clusterLine.append('path')
            .classed('line-path', true)
            .datum(function (d, i) {
                return data.map(function (datum) { return { "tag": d, "data": datum }; });
            })
            .attr('class', 'line')
            .attr('stroke-dasharray', 'none')
            .style('fill', 'none')
            .attr('stroke', function (d, i) {
                return UTIL.getDisplayColor(_measure.indexOf(d[0]['tag']), _displayColor);
            })
            // .attr("stroke", function (d) {
            //     return (d.x > 50) ? 'red' : 'blue';
            // })
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', 1)
            .attr('d', lineGenerator)

        var point = clusterLine.selectAll('point')
            .data(function (d, i) {
                return data.map(function (datum) { return { "tag": d, "data": datum }; });
            })
            .enter().append('path')
            .attr('class', 'point')
            .attr('stroke', function (d, i) {
                return UTIL.getDisplayColor(_measure.indexOf(d.tag), _displayColor);
            })
            .attr('fill', function (d, i) {
                return UTIL.getBorderColor(_measure.indexOf(d.tag), _borderColor);
            })
            .attr('d', function (d, i) {
                return d3.symbol()
                    .type(d3.symbolCircle)
                    .size(10)();
            })
            .attr('transform', function (d) {
                return 'translate('
                    + (x(d['data'][_dimension[0]]) + x.bandwidth() / 2)
                    + ',' + y(d['data'][d['tag']]) + ')';
            })
            .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
            .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
            .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))

        plot.append('text')
            .style("text-anchor", "middle")
            .attr("class", 'dateRange')
            .attr("x", parentWidth / 2)
            .style("font-size", "10px")
            .style("fill", "#28689c")
            .style("font-weight", "bold")
            .attr("y", 5)
            .attr("dy", ".31em");
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

    chart.showXaxis = function (value) {
        if (!arguments.length) {
            return _showXaxis;
        }
        _showXaxis = value;
        return chart;
    }

    chart.showYaxis = function (value) {
        if (!arguments.length) {
            return _showYaxis;
        }
        _showYaxis = value;
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

    chart.dateFormat = function (value) {
        if (!arguments.length) {
            return _dateFormat;
        }
        _dateFormat = value;
        return chart;
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
    chart.isLiveEnabled = function (value) {
        if (!arguments.length) {
            return isLiveEnabled;
        }
        isLiveEnabled = value;
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
