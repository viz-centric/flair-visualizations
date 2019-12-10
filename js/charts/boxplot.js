var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var UTIL = require('../extras/util.js')();

try {
    var d3Lasso = require("d3-lasso");

} catch (ex) { }
function boxplot() {

    var _NAME = 'boxplot';

    var _config,
        _dimension,
        _measure,
        _tooltip,
        showXaxis,
        showYaxis,
        axisColor,
        showLabels,
        labelColor,
        colorPattern = 'single_color',//unique_color
        numberFormat = [],
        _print,
        _data,
        broadcast,
        filterParameters,
        _notification = false,
        isLiveEnabled = false;

    var x, y;
    var margin = {
        top: 15,
        right: 15,
        bottom: 35,
        left: 35
    };
    var _local_svg, _Local_data, _originalData, horizontalLineConfigs;

    var width, gWidth, height, gHeight;

    var tickLength = d3.scaleLinear()
        .domain([22, 34])
        .range([2, 4]);

    var filter = false, filterData = [];

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.showXaxis(config.showXaxis);
        this.showYaxis(config.showYaxis);
        this.axisColor(config.axisColor);
        this.showLabels(config.showLabels);
        this.labelColor(config.labelColor);
        this.numberFormat(config.numberFormat);
        this.colorPattern(config.colorPattern);
    }

    var _buildTooltipData = function (datum, data) {
        var output = "";
        output += "<table>"
            + "<tr>"
            + "<th>" + _dimension[0] + ": </th>"
            + "<td>" + datum[_dimension[0]] + "</td>"
            + "</tr>"
            + "<tr>"
            + "<th>" + _measure[0] + ": </th>"
            + "<td>" + datum[_measure[0]] + "</td>"
            + "</tr>"
            + "<tr>"
            + "<th>" + _measure[1] + ": </th>"
            + "<td>" + datum[_measure[1]] + "</td>"
            + "</tr>"
            + "<tr>"
            + "<th>" + _measure[2] + ": </th>"
            + "<td>" + datum[_measure[2]] + "</td>"
            + "</tr>"
            + "<tr>"
            + "<th>" + _measure[3] + ": </th>"
            + "<td>" + datum[_measure[3]] + "</td>"
            + "</tr>"
            + "<tr>"
            + "<th>" + _measure[4] + ": </th>"
            + "<td>" + datum[_measure[4]] + "</td>"
            + "</tr>"
            + "</table>";

        return output;
    }

    var onLassoStart = function (lasso, scope) {
        return function () {
            if (filter) {
                lasso.items()
                    .classed('not_possible', true)
                    .classed('selected', false);
            }
        }
    }

    var onLassoDraw = function (lasso, scope) {
        return function () {
            filter = true;
            lasso.items()
                .classed('selected', false);

            lasso.possibleItems().each(function (d, i) {
                var item = d3.select(this).node().className.baseVal.split(' ')[0];
                d3.selectAll('rect.' + item)
                    .classed('not_possible', false)
                    .classed('possible', true);

            });
            lasso.possibleItems()
                .classed('not_possible', false)
                .classed('possible', true);

            lasso.notPossibleItems()
                .classed('not_possible', true)
                .classed('possible', false);
        }
    }

    var onLassoEnd = function (lasso, scope) {
        return function () {
            var data = lasso.selectedItems().data();
            if (!filter) {
                return;
            }
            if (data.length > 0) {
                lasso.items()
                    .classed('not_possible', false)
                    .classed('possible', false);
            }

            lasso.selectedItems()
                .classed('selected', true)

            lasso.notSelectedItems()
                .classed('selected', false);

            d3.select(scope.node().parentNode).select('div.confirm')
                .style('visibility', 'visible')

            if (data.length > 0) {
                filterData = data;
            }
            else {
                filterData = [];
            }
            if (broadcast) {
                var idWidget = broadcast.updateWidget[scope.node().parentNode.id];
                broadcast.updateWidget = {};
                broadcast.updateWidget[scope.node().parentNode.id] = idWidget;

                var _filterList = {}, list = []

                filterData.map(function (val) {
                    list.push(val[_dimension[0]])
                })
                _filterList[_dimension[0]] = list
                broadcast.filterSelection.filter = _filterList;
                filterParameters.save(_filterList);
            }
        }
    }

    var applyFilter = function () {
        return function () {
            if (filterData.length > 0) {
                //Viz renders twice issue
                // chart.update(filterData);
                if (broadcast) {
                    broadcast.updateWidget = {};
                    broadcast.filterSelection.id = null;
                    broadcast.$broadcast('flairbiApp:filter-input-refresh');
                    broadcast.$broadcast('flairbiApp:filter');
                    broadcast.$broadcast('flairbiApp:filter-add');
                    d3.select(this.parentNode)
                        .style('visibility', 'hidden');
                }
            }
        }
    }

    var clearFilter = function (div) {
        return function () {
            chart.update(_originalData);
            d3.select(div).select('.confirm')
                .style('visibility', 'hidden');
        }
    }

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            var border = d3.select(this).attr('fill')
            d3.select(this).style('cursor', 'pointer')
                .attr('fill', COMMON.HIGHLIGHTER);

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
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, border);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'default')
                .attr("fill", function (datum) {
                    if (colorPattern == "Unique Color") {
                        return COMMON.COLORSCALE(i);
                    }
                    else {
                        return COMMON.COLORSCALE(0);
                    }
                })

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }
    var getXLabels = function (data) {
        return data.map(function (d) { return d[_dimension[0]]; })
    }

    var getGlobalMinMax = function (data) {
        var me = this;

        var allValues = [],
            min,
            max;

        data.forEach(function (d) {
            _measure.forEach(function (m) {
                allValues.push(d[m] || 0);
            })
        });

        min = Math.min.apply(Math, allValues);
        max = Math.max.apply(Math, allValues);

        min = min > 0 ? 0 : min

        return [min, max];
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

        width = +svg.attr('width');
        height = +svg.attr('height');

        _local_svg = svg;

        container = svg.append('g')
            .attr("class", "focus")
            .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

        svg.attr('width', width)
            .attr('height', height)

        parentContainer.append('div')
            .attr('class', 'custom_tooltip');

        var globalMin, globalMax, xLabels;

        var minMax = getGlobalMinMax(_data);
        globalMin = minMax[0];
        globalMax = minMax[1];

        xLabels = getXLabels(_data);

        gWidth = width - margin.left - margin.right;
        gHeight = height - margin.top - margin.bottom;

        var barWidth = Math.floor(gWidth / _data.length / 2);
        var me = this;
        if (_tooltip) {
            tooltip = parentContainer.select('.custom_tooltip');
        }

        x = d3
            .scalePoint()
            .domain(xLabels)
            .rangeRound([0, gWidth])
            .padding([0.5]);

        y = d3
            .scaleLinear()
            .domain([globalMin, globalMax])
            .range([gHeight, 0]);

        var plot = svg
            .append("g")
            .attr("class", "plot")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        plot.selectAll(".verticalLines")
            .data(_data)
            .enter()
            .append("line")
            .attr("x1", function (datum) {
                return x(datum[_dimension[0]]);
            })
            .attr("y1", function (datum) {
                return y(datum[_measure[0]]);
            })
            .attr("x2", function (datum) {
                return x(datum[_dimension[0]]);
            })
            .attr("y2", function (datum) {
                return y(datum[_measure[4]]);
            })
            .attr("stroke", "#000")
            .style("stroke-width", 1)
            .attr("fill", "none");

        // Draw the boxes of the box plot, filled and on top of vertical lines
        var rects = plot.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", 'box')
            .attr("width", barWidth)
            .attr("height", function (datum) {
                var height = y(datum[_measure[1]]) - y(datum[_measure[3]]);
                return height;
            })
            .attr("x", function (datum) {
                return x(datum[_dimension[0]]) - (barWidth / 2);
            })
            .attr("y", function (datum) {
                return y(datum[_measure[3]]);
            })
            .attr("fill", function (datum, i) {
                if (colorPattern == "Unique Color") {
                    return COMMON.COLORSCALE(i);
                }
                else {
                    return COMMON.COLORSCALE(0);
                }
            })
            .attr("stroke", "#000")
            .style("stroke-width", 1);

        // Now render all the horizontal lines at once - the whiskers and the median
        horizontalLineConfigs = [
            // Top whisker
            {
                x1: function (datum) { return x(datum[_dimension[0]]) - barWidth / 2 },
                y1: function (datum) { return y(datum[_measure[0]]) },
                x2: function (datum) { return x(datum[_dimension[0]]) + barWidth / 2 },
                y2: function (datum) { return y(datum[_measure[0]]) }
            },
            // Median line
            {
                x1: function (datum) { return x(datum[_dimension[0]]) - barWidth / 2 },
                y1: function (datum) { return y(datum[_measure[2]]) },
                x2: function (datum) { return x(datum[_dimension[0]]) + barWidth / 2 },
                y2: function (datum) { return y(datum[_measure[2]]) }
            },
            // Bottom whisker
            {
                x1: function (datum) { return x(datum[_dimension[0]]) - barWidth / 2 },
                y1: function (datum) { return y(datum[_measure[4]]) },
                x2: function (datum) { return x(datum[_dimension[0]]) + barWidth / 2 },
                y2: function (datum) { return y(datum[_measure[4]]) }
            }
        ];

        for (var i = 0; i < horizontalLineConfigs.length; i++) {
            var lineConfig = horizontalLineConfigs[i];

            // Draw the whiskers at the min for this series
            plot.selectAll(".whiskers")
                .data(data)
                .enter()
                .append("line")
                .attr("x1", lineConfig.x1)
                .attr("y1", lineConfig.y1)
                .attr("x2", lineConfig.x2)
                .attr("y2", lineConfig.y2)
                .attr("stroke", "#000")
                .style("stroke-width", 1)
                .attr("fill", "none");
        }

        var isRotate = false;
        plot.append("g")
            .attr("class", "x_axis")
            .attr("transform", "translate(0," + gHeight + ")")
            .call(d3.axisBottom(x)
                .tickSize(0)
                .tickFormat(function (d) {
                    if (isRotate == false) {
                        isRotate = UTIL.getTickRotate(d, (gWidth) / (xLabels.length - 1), tickLength);
                    }
                    return UTIL.getTruncatedTick(d, (gWidth) / (xLabels.length - 1), tickLength);
                })
                .tickPadding(10))

        plot.append("g")
            .attr("class", "y_axis")
            .call(d3.axisLeft(y).ticks(null, "s"))

        if (isRotate) {
            _local_svg.selectAll('.x_axis .tick text')
                .attr("transform", "rotate(-15)");
        }

        UTIL.setAxisColor("", true, "", true, _local_svg);

        if (!_print) {
            $(me).parent().find('div.confirm')
                .css('visibility', 'hidden');

            var _filter = UTIL.createFilterElement()
            $('#' + parentContainer.attr('id')).append(_filter)

            _local_svg.selectAll('rect.box')
                .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
                .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
                .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
                .on('click', function (d) {
                    if (isLiveEnabled) {
                        broadcast.$broadcast('FlairBi:livemode-dialog');
                        return;
                    }
                    filter = false;

                    parentContainer.select('.confirm')
                        .style('visibility', 'visible');

                    var point = d3.select(this).selectAll('path');
                    if (point.classed('selected')) {
                        point.classed('selected', false);
                    } else {
                        point.classed('selected', true);
                    }

                    var _filterDimension = {};
                    if (broadcast.filterSelection.id) {
                        _filterDimension = broadcast.filterSelection.filter;
                    } else {
                        broadcast.filterSelection.id = parentContainer.attr('id');
                    }
                    var dimension = _dimension[0];
                    if (_filterDimension[dimension]) {
                        var temp = _filterDimension[dimension];
                        if (temp.indexOf(d[_dimension[0]]) < 0) {
                            temp.push(d[_dimension[0]]);
                        } else {
                            temp.splice(temp.indexOf(d[_dimension[0]]), 1);
                        }
                        _filterDimension[dimension] = temp;
                    } else {
                        _filterDimension[dimension] = [d[_dimension[0]]];
                    }

                    var idWidget = broadcast.updateWidget[parentContainer.attr('id')];
                    broadcast.updateWidget = {};
                    broadcast.updateWidget[parentContainer.attr('id')] = idWidget;
                    broadcast.filterSelection.filter = _filterDimension;
                    var _filterParameters = filterParameters.get();
                    _filterParameters[dimension] = _filterDimension[dimension];
                    filterParameters.save(_filterParameters);
                })

            parentContainer.select('.filterData')
                .on('click', applyFilter());

            parentContainer.select('.removeFilter')
                .on('click', clearFilter(parentContainer));

            var lasso = d3Lasso
                .lasso()
                .hoverSelect(true)
                .closePathSelect(true)
                .closePathDistance(100)
                .items(rects)
                .targetArea(_local_svg);

            lasso.on('start', onLassoStart(lasso, _local_svg))
                .on('draw', onLassoDraw(lasso, _local_svg))
                .on('end', onLassoEnd(lasso, _local_svg));

            _local_svg.call(lasso);
        }

    }

    chart._getName = function () {
        return _NAME;
    }

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
    }

    chart.update = function (data) {
        filterData = [];
        var plot = _local_svg.select('.plot');

        plot.selectAll('rect').remove();
        plot.selectAll('line').remove();

        if (_tooltip) {
            tooltip = parentContainer.select('.custom_tooltip');
        }

        var globalMin, globalMax, xLabels;

        var minMax = getGlobalMinMax(data);
        globalMin = minMax[0];
        globalMax = minMax[1];

        xLabels = getXLabels(data);

        var barWidth = Math.floor(gWidth / data.length / 2);

        x = d3
            .scalePoint()
            .domain(xLabels)
            .rangeRound([0, gWidth])
            .padding([0.5]);

        y = d3
            .scaleLinear()
            .domain([globalMin, globalMax])
            .range([gHeight, 0]);

        plot.selectAll(".verticalLines")
            .data(data)
            .enter()
            .append("line")
            .attr("x1", function (datum) {
                return x(datum[_dimension[0]]);
            })
            .attr("y1", function (datum) {
                return y(datum[_measure[0]]);
            })
            .attr("x2", function (datum) {
                return x(datum[_dimension[0]]);
            })
            .attr("y2", function (datum) {
                return y(datum[_measure[4]]);
            })
            .attr("stroke", "#000")
            .style("stroke-width", 1)
            .attr("fill", "none");

        // Draw the boxes of the box plot, filled and on top of vertical lines
        var rects = plot.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", 'box')
            .attr("width", barWidth)
            .attr("height", function (datum) {
                var height = y(datum[_measure[1]]) - y(datum[_measure[3]]);
                return height;
            })
            .attr("x", function (datum) {
                return x(datum[_dimension[0]]) - (barWidth / 2);
            })
            .attr("y", function (datum) {
                return y(datum[_measure[3]]);
            })
            .attr("fill", function (datum, i) {
                if (colorPattern == "Unique Color") {
                    return COMMON.COLORSCALE(i);
                }
                else {
                    return COMMON.COLORSCALE(0);
                }
            })
            .attr("stroke", "#000")
            .style("stroke-width", 1);

        // Now render all the horizontal lines at once - the whiskers and the median
        horizontalLineConfigs = [
            // Top whisker
            {
                x1: function (datum) { return x(datum[_dimension[0]]) - barWidth / 2 },
                y1: function (datum) { return y(datum[_measure[0]]) },
                x2: function (datum) { return x(datum[_dimension[0]]) + barWidth / 2 },
                y2: function (datum) { return y(datum[_measure[0]]) }
            },
            // Median line
            {
                x1: function (datum) { return x(datum[_dimension[0]]) - barWidth / 2 },
                y1: function (datum) { return y(datum[_measure[2]]) },
                x2: function (datum) { return x(datum[_dimension[0]]) + barWidth / 2 },
                y2: function (datum) { return y(datum[_measure[2]]) }
            },
            // Bottom whisker
            {
                x1: function (datum) { return x(datum[_dimension[0]]) - barWidth / 2 },
                y1: function (datum) { return y(datum[_measure[4]]) },
                x2: function (datum) { return x(datum[_dimension[0]]) + barWidth / 2 },
                y2: function (datum) { return y(datum[_measure[4]]) }
            }
        ];

        for (var i = 0; i < horizontalLineConfigs.length; i++) {
            var lineConfig = horizontalLineConfigs[i];

            // Draw the whiskers at the min for this series
            plot.selectAll(".whiskers")
                .data(data)
                .enter()
                .append("line")
                .attr("x1", lineConfig.x1)
                .attr("y1", lineConfig.y1)
                .attr("x2", lineConfig.x2)
                .attr("y2", lineConfig.y2)
                .attr("stroke", "#000")
                .style("stroke-width", 1)
                .attr("fill", "none");
        }

        var isRotate = false;
        plot.select(".x_axis")
            .attr("transform", "translate(0," + gHeight + ")")
            .call(d3.axisBottom(x)
                .tickSize(0)
                .tickFormat(function (d) {
                    if (isRotate == false) {
                        isRotate = UTIL.getTickRotate(d, (gWidth) / (xLabels.length - 1), tickLength);
                    }
                    return UTIL.getTruncatedTick(d, (gWidth) / (xLabels.length - 1), tickLength);
                })
                .tickPadding(10))

        plot.select(".y_axis")
            .call(d3.axisLeft(y).ticks(null, "s"))

        if (isRotate) {
            _local_svg.selectAll('.x_axis .tick text')
                .attr("transform", "rotate(-15)");
        }
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
    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    }
    chart.showXaxis = function (value) {
        if (!arguments.length) {
            return showXaxis;
        }
        showXaxis = value;
        return chart;
    }
    chart.showYaxis = function (value) {
        if (!arguments.length) {
            return showYaxis;
        }
        showYaxis = value;
        return chart;
    }
    chart.axisColor = function (value) {
        if (!arguments.length) {
            return axisColor;
        }
        axisColor = value;
        return chart;
    }
    chart.showLabels = function (value) {
        if (!arguments.length) {
            return showLabels;
        }
        showLabels = value;
        return chart;
    }
    chart.labelColor = function (value) {
        if (!arguments.length) {
            return labelColor;
        }
        labelColor = value;
        return chart;
    }

    chart.colorPattern = function (value) {
        if (!arguments.length) {
            return colorPattern;
        }
        colorPattern = value;
        return chart;
    }

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    }

    chart.data = function (value) {
        if (!arguments.length) {
            return _data;
        }
        _data = value;
        return chart;
    }

    chart.numberFormat = function (value, measure) {
        return UTIL.baseAccessor.call(numberFormat, value, measure, _measure);
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
    chart.notification = function (value) {
        if (!arguments.length) {
            return _notification;
        }
        _notification = value;
        return chart;
    }
    chart.isLiveEnabled = function (value) {
        if (!arguments.length) {
            return isLiveEnabled;
        }
        isLiveEnabled = value;
        return chart;
    }
    return chart;
}
module.exports = boxplot;