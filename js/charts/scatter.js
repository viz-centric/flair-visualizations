var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var UTIL = require('../extras/util.js')();
var LEGEND = require('../extras/scatter_legend.js')();

try {
    var d3Lasso = require("d3-lasso");

} catch (ex) { }


function scatter() {

    var _NAME = 'scatterChart';

    var _config,
        _dimension,
        _measure,
        _showLegend,
        _legendPosition,
        _sort,
        _tooltip,
        _showXaxis,
        _showYaxis,
        _showXaxisLabel,
        _showYaxisLabel,
        _xAxisColor,
        _yAxisColor,
        _showGrid,
        _stacked,
        _displayName,
        _legendData,

        _showValues,
        _displayNameForMeasure,
        _fontStyle,
        _fontWeight,
        _numberFormat,
        _textColor,
        _displayColor,
        _borderColor,
        _fontSize,
        _print;


    var _local_svg, _Local_data;

    var parentWidth, parentHeight, plotWidth, plotHeight;
    var _localXAxis,
        _localYAxis,
        _localXGrid,
        _localYGrid;

    var legendSpace = 20, axisLabelSpace = 20, offsetX = 16, offsetY = 3, div;
    var threshold = [];
    var filter = false, filterData = [];

    var tickLength = d3.scaleLinear()
        .domain([22, 34])
        .range([4, 6]);

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.showLegend(config.showLegend);
        this.legendPosition(config.legendPosition);

        this.showXaxis(config.showXaxis);
        this.showYaxis(config.showYaxis);
        this.showXaxisLabel(config.showXaxisLabel);

        this.showYaxisLabel(config.showYaxisLabel);
        this.xAxisColor(config.xAxisColor);
        this.yAxisColor(config.yAxisColor);
        this.displayName(config.displayName);
        this.showYaxis(config.showYaxis);
        this.showXaxisLabel(config.showXaxisLabel);

        this.showValues(config.showValues);
        this.displayNameForMeasure(config.displayNameForMeasure);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        this.numberFormat(config.numberFormat);
        this.textColor(config.textColor);
        this.displayColor(config.displayColor);
        this.borderColor(config.borderColor);
        this.fontSize(config.fontSize);

        this.legendData(config.displayColor, config.measure);
    }

    var _buildTooltipData = function (datum, chart) {
        var output = "";
        output += "<table>";

        for (let index = 0; index < _dimension.length; index++) {
            output += "<tr><th>" + _dimension[index] + ": </th>";
            output += "<th>" + datum[_dimension[index]] + "</th></tr>";
        }

        for (let index = 0; index < _measure.length; index++) {
            output += "<tr><th>" + _measure[index] + ": </th>";
            output += "<th>" + datum[_measure[index]] + "</th></tr>";
        }
        output += "</table>";

        return output;
    }

    var _setAxisColor = function (axis, color) {
        var path = axis.select('path'),
            ticks = axis.selectAll('.tick');

        path.style('stroke', color);

        ticks.select('line')
            .style('stroke', color);

        ticks.select('text')
            .style('fill', color);
    }
    var onLassoStart = function (lasso, chart) {
        return function () {
            if (filter) {
                lasso.items().selectAll('rect')
                    .classed('not_possible', true)
                    .classed('selected', false);
            }
        }
    }

    var onLassoDraw = function (lasso, chart) {
        return function () {
            filter = true;
            lasso.items().selectAll('rect')
                .classed('selected', false);

            lasso.possibleItems().selectAll('rect')
                .classed('not_possible', false)
                .classed('possible', true);

            lasso.notPossibleItems().selectAll('rect')
                .classed('not_possible', true)
                .classed('possible', false);
        }
    }

    var onLassoEnd = function (lasso, chart) {
        return function () {
            var data = lasso.selectedItems().data();
            if (!filter) {
                return;
            }
            if (data.length > 0) {
                lasso.items().selectAll('rect')
                    .classed('not_possible', false)
                    .classed('possible', false);
            }

            lasso.selectedItems().selectAll('rect')
                .classed('selected', true)

            lasso.notSelectedItems().selectAll('rect');

            var confirm = $(scope).parent().find('div.confirm')
                .css('visibility', 'visible');

            var _filter = [];
            data.forEach(function (d) {
                var obj = new Object();
                obj[_dimension[1]] = d[_dimension[1]];
                for (var index = 0; index < _measure.length; index++) {
                    obj[_measure[index]] = d[_measure[index]];
                }

                _filter.push(obj)
            });
            if (_filter.length > 0) {
                filterData = _filter;
            }
        }
    }

    var applyFilter = function (chart) {
        return function () {
            if (filterData.length > 0) {
                chart(filterData);
            }
        }
    }

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this)
                .style('cursor', 'pointer')
                .style('fill-opacity', .5);

            var border = d3.select(this).attr('fill');
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
                var border = d3.select(this).attr('fill');
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me, border), container, border);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'default')
                .style('fill-opacity', 1)

            var arcGroup = container.selectAll('g.arc')
                .filter(function (d1) {
                    return d1.data[_dimension[1]] === d.data[_dimension[1]];
                });

            arcGroup.select('path')
                .style('fill', function (d1, i) {
                    return COMMON.COLORSCALE(d1.data[_dimension[1]]);
                });

            var arcMaskGroup = container.selectAll('g.arc-mask')
                .filter(function (d1) {
                    return d1.data[_dimension[1]] === d.data[_dimension[1]];
                });

            arcMaskGroup.select('path')
                .style('visibility', 'hidden');

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }

    function chart(selection) {
        _local_svg = selection;
        selection.each(function (data) {
            chart._Local_data = _originalData = data;
            var margin = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 45
            };

            var legendSpace = 20,
                axisLabelSpace = 20,
                offsetX = 16,
                offsetY = 3;

            var div = d3.select(this).node().parentNode;

            var svg = d3.select(this),
                width = +svg.attr('width'),
                height = +svg.attr('height');

            parentWidth = width - 2 * COMMON.PADDING - margin.left;
            parentHeight = (height - 2 * COMMON.PADDING - axisLabelSpace * 2);
            plotWidth = parentWidth;
            plotHeight = parentHeight;
            const color = COMMON.COLORSCALE;

            var container = svg.append('g')
                .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

            _local_total = d3.sum(data.map(function (d) { return d[_measure[0]]; }));

            var plot = container.append('g')
                .attr('class', 'scatter-plot')
                .classed('plot', true)
                .attr('transform', function () {
                    if (_legendPosition == 'top') {
                        return 'translate(' + margin.left + ', ' + legendSpace * 2 + ')';
                    } else if (_legendPosition == 'bottom') {
                        return 'translate(' + margin.left + ', 0)';
                    } else if (_legendPosition == 'left') {
                        return 'translate(' + (legendSpace + margin.left + axisLabelSpace) + ', 0)';
                    } else if (_legendPosition == 'right') {
                        return 'translate(' + margin.left + ', 0)';
                    }
                });

            var keys = UTIL.getMeasureList(data[0], _dimension);

            var maxGDP = d3.max(data, function (d) {
                return d3.max(keys, function (key) {
                    return parseInt(d[key]);
                });
            })
            var minGDP = d3.min(data, function (d) {
                return d3.min(keys, function (key) {
                    return parseInt(d[key]);
                });
            })

            var rScale = d3.scaleLinear()
                .domain([minGDP, maxGDP])
                .range([5, 25]);

            var x = d3.scaleLinear()
                .rangeRound([0, plotWidth])

            var y = d3.scaleLinear()
                .rangeRound([plotHeight - 40, 0]);


            x.domain([0, d3.max(data, function (d) {
                return parseInt(d[_dimension[1]]);
            })]).nice();

            y.domain([0, d3.max(data, function (d) {
                return parseInt(d[_measure[2]]);
            })]).nice();


            var _localXLabels = data.map(function (d) {
                return d[_dimension[0]];
            });

            _localXGrid = d3.axisBottom()
                .ticks(_localXLabels.length)
                .tickFormat('')
                .tickSize(-plotHeight);

            _localYGrid = d3.axisLeft()
                .tickFormat('')
                .tickSize(-plotWidth);

            _localXGrid.scale(x);
            _localYGrid.scale(y);

            plot.append('g')
                .attr('class', 'x grid')
                .attr('visibility', function () {
                    return _showGrid ? 'visible' : 'hidden';
                })
                .attr('transform', 'translate(0, ' + plotHeight + ')')
                .call(_localXGrid);

            plot.append('g')
                .attr('class', 'y grid')
                .attr('visibility', function () {
                    return _showGrid ? 'visible' : 'hidden';
                })
                .call(_localYGrid);

            if (_tooltip) {
                tooltip = d3.select(this.parentNode).select('#tooltip');
            }

            var xAxisGroup,
                yAxisGroup;

            var isRotate = false;

            if (_showXaxis) {
                _localXAxis = d3.axisBottom(x)
                    .tickSize(0)
                    .tickFormat(function (d) {
                        if (isRotate == false) {
                            isRotate = UTIL.getTickRotate(d, (plotWidth) / (_localXLabels.length - 1), tickLength);
                        }
                        return UTIL.getTruncatedTick(d, (plotWidth) / (_localXLabels.length - 1), tickLength);
                    })
                    .tickPadding(10);

                xAxisGroup = plot.append('g')
                    .attr('class', 'x axis')
                    .attr('visibility', function () {
                        return 'visible';
                    })
                    .attr('transform', 'translate(0, ' + parseInt(plotHeight - 40) + ')')
                    .call(_localXAxis);

                xAxisGroup.append('g')
                    .attr('class', 'label')
                    .attr('transform', function () {
                        return 'translate(' + (plotWidth / 2) + ', ' + (COMMON.AXIS_THICKNESS / 1.5) + ')';
                    })
                    .append('text')
                    .style('text-anchor', 'middle')
                    .style('font-weight', 'bold')
                    .style('fill', _xAxisColor)
                    .text(_displayName);

                if (isRotate) {
                    _local_svg.selectAll('.x .tick text')
                        .attr("transform", "rotate(-15)");
                }

                _setAxisColor(xAxisGroup, _xAxisColor);

            }

            if (_showYaxis) {
                _localYAxis = d3.axisLeft(y)
                    .tickSize(0)
                    .tickPadding(8)
                    .tickFormat(function (d) {
                        return UTIL.shortScale(2)(d);
                    });

                yAxisGroup = plot.append('g')
                    .attr('class', 'y axis')
                    .attr('visibility', function () {
                        return 'visible';
                    })
                    .call(_localYAxis);

                yAxisGroup.append('g')
                    .attr('class', 'label')
                    .attr('transform', function () {
                        return 'translate(' + (-COMMON.AXIS_THICKNESS / 1.15) + ', ' + (plotHeight / 2) + ')';
                    })
                    .append('text')
                    .attr('transform', 'rotate(-90)')
                    .style('text-anchor', 'middle')
                    .style('font-weight', 'bold')
                    .style('fill', _yAxisColor)
                    .text(function () {
                        return _displayNameForMeasure.map(function (p) { return p; }).join(', ');
                    });

                _setAxisColor(yAxisGroup, _yAxisColor);
            }

            var dataCircle = plot.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", "circle")
                .attr("cx", function (d) {
                    return x(d[_dimension[1]]);
                })
                .attr("cy", function (d) {
                    return y(d[_measure[2]]);
                })
                .attr("r", function (d) {
                    return rScale(parseInt(d[_measure[0]]));
                })
                .attr("fill", function (d) {
                    return color(d[_dimension[0]]);
                })
                .attr("stroke", function (d) {
                    return color(d[_dimension[0]]);
                })
                .style('fill-opacity', 1)

            if (!_print) {
                dataCircle.on('mouseover', _handleMouseOverFn.call(chart, tooltip, svg))
                    .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, svg))
                    .on('mouseout', _handleMouseOutFn.call(chart, tooltip, svg));
            }

            var legendWidth = 0,
                legendHeight = 0,
                legendBreakCount;

            plotWidth = parentWidth;
            plotHeight = parentHeight;

            if (_showLegend) {
                var clusteredverticalbarLegend = LEGEND.bind(chart);

                var result = clusteredverticalbarLegend(color.domain(), container, {
                    width: parentWidth,
                    height: parentHeight,
                    legendBreakCount: legendBreakCount
                });

                legendWidth = result.legendWidth;
                legendHeight = result.legendHeight;
                legendBreakCount = result.legendBreakCount;

                switch (_legendPosition) {
                    case 'top':
                        plotHeight = parentHeight - legendHeight - axisLabelSpace;
                        break;
                    case 'bottom':
                        plotHeight = parentHeight - legendHeight - axisLabelSpace * 2;
                        break;
                    case 'right':
                    case 'left':
                        plotWidth = parentWidth - legendWidth;
                        break;
                }

                if ((_legendPosition == 'top') || (_legendPosition == 'bottom')) {
                    plotWidth = parentWidth;
                    plotHeight = parentHeight - 3 * axisLabelSpace;
                    legendSpace = 20;
                } else if ((_legendPosition == 'left') || (_legendPosition == 'right')) {
                    var legend = _local_svg.selectAll('.item');
                    legendSpace = legend.node().parentNode.getBBox().width;
                    plotWidth = (parentWidth - legendSpace) - margin.left + axisLabelSpace;
                    plotHeight = parentHeight;

                    legend.attr('transform', function (d, i) {
                        if (_legendPosition == 'left') {
                            return 'translate(0, ' + i * 20 + ')';

                        }
                        else if (_legendPosition == 'right') {
                            return 'translate(' + (parentWidth - legendSpace + axisLabelSpace) + ', ' + i * 20 + ')';
                        }
                    });
                }
            }
            else {
                legendSpace = 0;
                plotWidth = parentWidth;
                plotHeight = parentHeight;
            }

        });

    }

    chart._legendInteraction = function (event, data, plot) {
        if (_print) {
            // No interaction during print enabled
            return;
        }
        switch (event) {
            case 'mouseover':
                _legendMouseOver(data, plot);
                break;
            case 'mousemove':
                _legendMouseMove(data, plot);
                break;
            case 'mouseout':
                _legendMouseOut(data, plot);
                break;
            case 'click':
                _legendClick(data, plot);
                break;
        }
    }
    var _legendMouseOver = function (data, plot) {

        plot.selectAll('circle')
            .filter(function (d) {
                return d[_dimension[0]] === data;
            })
            .style('fill', COMMON.HIGHLIGHTER);
    }

    var _legendMouseMove = function (data, plot) {

    }

    var _legendMouseOut = function (data, plot) {
        var circle = plot.selectAll('circle')
            .filter(function (d) {
                return d[_dimension[0]] === data;
            })
        circle.style('fill', circle.attr('fill'));
    }

    var _legendClick = function (data) {
        var _filter = UTIL.getFilterData(_localLabelStack, data, _originalData)
        drawPlot.call(this, _filter);
    }

    chart._getName = function () {
        return _NAME;
    }

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
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

    chart.showLegend = function (value) {
        if (!arguments.length) {
            return _showLegend;
        }
        _showLegend = value;
        return chart;
    }

    chart.legendPosition = function (value) {
        if (!arguments.length) {
            return _legendPosition;
        }
        _legendPosition = value;
        return chart;
    }

    chart.sort = function (value) {
        if (!arguments.length) {
            return _sort;
        }
        _sort = value;
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

    chart.showXaxisLabel = function (value) {
        if (!arguments.length) {
            return _showXaxisLabel;
        }
        _showXaxisLabel = value;
        return chart;
    }

    chart.showYaxisLabel = function (value) {
        if (!arguments.length) {
            return _showYaxisLabel;
        }
        _showYaxisLabel = value;
        return chart;
    }

    chart.xAxisColor = function (value) {
        if (!arguments.length) {
            return _xAxisColor;
        }
        _xAxisColor = value;
        return chart;
    }

    chart.yAxisColor = function (value) {
        if (!arguments.length) {
            return _yAxisColor;
        }
        _yAxisColor = value;
        return chart;
    }

    chart.showGrid = function (value) {
        if (!arguments.length) {
            return _showGrid;
        }
        _showGrid = value;
        return chart;
    }

    chart.stacked = function (value) {
        if (!arguments.length) {
            return _stacked;
        }
        _stacked = value;
        return chart;
    }

    chart.displayName = function (value) {
        if (!arguments.length) {
            return _displayName;
        }
        _displayName = value;
        return chart;
    }

    chart.legendData = function (measureConfig, measureName) {
        _legendData = {
            measureConfig: measureConfig,
            measureName: measureName
        }
        return _legendData;
    }

    chart.showValues = function (value) {
        if (!arguments.length) {
            return _showValues;
        }
        _showValues = value;
        return chart;
    }

    chart.displayNameForMeasure = function (value) {
        if (!arguments.length) {
            return _displayNameForMeasure;
        }
        _displayNameForMeasure = value;
        return chart;
    }

    chart.fontStyle = function (value) {
        if (!arguments.length) {
            return _fontStyle;
        }
        _fontStyle = value;
        return chart;
    }

    chart.fontWeight = function (value) {
        if (!arguments.length) {
            return _fontWeight;
        }
        _fontWeight = value;
        return chart;
    }

    chart.numberFormat = function (value) {
        if (!arguments.length) {
            return _numberFormat;
        }
        _numberFormat = value;
        return chart;
    }

    chart.textColor = function (value) {
        if (!arguments.length) {
            return _textColor;
        }
        _textColor = value;
        return chart;
    }

    chart.displayColor = function (value) {
        if (!arguments.length) {
            return _displayColor;
        }
        _displayColor = value;
        return chart;
    }

    chart.borderColor = function (value) {
        if (!arguments.length) {
            return _borderColor;
        }
        _borderColor = value;
        return chart;
    }

    chart.fontSize = function (value) {
        if (!arguments.length) {
            return _fontSize;
        }
        _fontSize = value;
        return chart;
    }

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    }
    return chart;
}

module.exports = scatter;
