var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var UTIL = require('../extras/util.js')();
var LEGEND = require('../extras/legend_barcharts.js')();

try {
    var d3Lasso = require("d3-lasso");

} catch (ex) { }

function line() {

    var _NAME = 'line';

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
        _showGrid,
        _xAxisColor,
        _yAxisColor,
        _displayName,
        _legendData,
        _showValues = [],
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
        _print,
        broadcast,
        filterParameters,
        _notification = false;

    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 45
    };

    var _local_svg, _Local_data, _originalData, _localLabelStack = [], legendBreakCount = 1;
    var _localXAxis,
        _localYAxis,
        _localXGrid,
        _localYGrid;

    var x = d3.scalePoint(), y = d3.scaleLinear();

    var tickLength = d3.scaleLinear()
        .domain([22, 34])
        .range([2, 4]);

    var legendSpace = 20, axisLabelSpace = 20, offsetX = 16, offsetY = 3, div;
    var parentWidth, parentHeight, plotWidth, plotHeight, container;
    var threshold = [];
    var filter = false, filterData = [];

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
        this.showGrid(config.showGrid);
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
        this.lineType(config.lineType);
        this.pointType(config.pointType);
        this.legendData(config.displayColor, config.measure);
    }
    var getPointType = function (index) {
        var symbol = null;

        switch (_pointType[index].toLowerCase()) {
            case "rectrounded":
                symbol = d3.symbolDiamond;
                break;

            case "rectrot":
                symbol = d3.symbolDiamond;
                break;

            case "star":
                symbol = d3.symbolStar;
                break;

            case "triangle":
                symbol = d3.symbolTriangle;
                break;

            case "circle":
                symbol = d3.symbolCircle;
                break;

            case "cross":
                symbol = d3.symbolCross;
                break;

            case "crossrot":
                symbol = d3.symbolCross;
                break;

            case "dash":
                symbol = d3.symbolWye;
                break;

            case "line":
                symbol = d3.symbolWye;
                break;

            case "rect":
                symbol = d3.symbolSquare;
                break;

            default:
                symbol = d3.symbolCircle;
        }

        return symbol;
    }
    var _buildTooltipData = function (datum, chart) {
        var output = "";
        output += "<table><tr>"

            + "<th>" + chart.dimension() + ": </th>"
            + "<td>" + datum.data[_dimension[0]] + "</td>"
            + "</tr><tr>"
            + "<th>" + datum.tag + ": </th>"
            + "<td>" + datum.data[datum.tag] + "</td>"
            + "</tr></table>";

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

            var confirm = $(scope).parent().find('div.confirm')
                .css('visibility', 'visible');

            var _filter = [];
            if (data.length > 0) {
                data.forEach(function (d) {
                    var obj = new Object();
                    obj[_dimension[0]] = d.data[_dimension[0]];
                    for (var index = 0; index < _measure.length; index++) {
                        obj[_measure[index]] = d.data[_measure[index]];
                    }

                    _filter.push(obj)
                });
            }
            else {
                filterData = [];
            }
            if (_filter.length > 0) {
                filterData = _filter;
            }
            if (broadcast) {
                var idWidget = broadcast.updateWidget[scope.parentElement.id];
                broadcast.updateWidget = {};
                broadcast.updateWidget[scope.parentElement.id] = idWidget;

                var _filterList = {}, list = []

                filterData.map(function (val) {
                    list.push(val[_dimension[0]])
                })
                list = list.filter(function (item, i, ar) { return ar.indexOf(item) === i; });
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
            d3.select(this).style('cursor', 'pointer')
                .style('fill', COMMON.HIGHLIGHTER);
            var border = UTIL.getDisplayColor(_measure.indexOf(d.tag), _displayColor)
            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, border,_notification);
            }
        }
    }
    var _handleMouseMoveFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                var border = UTIL.getDisplayColor(_measure.indexOf(d.tag), _displayColor)
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me, border), container, border,_notification);
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

    var _setAxisColor = function (axis, color) {
        var path = axis.select('path'),
            ticks = axis.selectAll('.tick');

        path.style('stroke', color);

        ticks.select('line')
            .style('stroke', color);

        ticks.select('text')
            .style('fill', color);
    }

    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {
            _originalData = data;
            div = d3.select(this).node().parentNode;

            var svg = d3.select(this),
                width = +svg.attr('width'),
                height = +svg.attr('height');

            parentWidth = width - 2 * COMMON.PADDING - (_showXaxis == true ? margin.left : 0);
            parentHeight = (height - 2 * COMMON.PADDING - (_showYaxis == true ? axisLabelSpace * 2 : 0));

            container = svg.append('g')
                .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

            svg.attr('width', width)
                .attr('height', height)

            d3.select(div).append('div')
                .attr('class', 'sort_selection');

            d3.select(div).append('div')
                .attr('class', 'arrow-down');

            container = svg.append('g')
                .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

            var legendWidth = 0,
                legendHeight = 0,
                legendBreakCount;

            plotWidth = parentWidth;
            plotHeight = parentHeight;

            if (_showLegend) {
                var LineLegend = LEGEND.bind(chart);

                var result = LineLegend(_legendData, container, {
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
                            return 'translate(' + (parentWidth - legendSpace + axisLabelSpace + 10) + ', ' + i * 20 + ')';
                        }
                    });
                }
            }
            else {
                legendSpace = 0;
                plotWidth = parentWidth;
                plotHeight = parentHeight;
            }

            if (_tooltip) {
                tooltip = d3.select(this.parentNode).select('.custom_tooltip');
            }

            drawPlot.call(this, data);
        });

    }

    var drawPlot = function (data) {
        var me = this;
        _Local_data = data;

        var plot = container.append('g')
            .attr('class', 'line-plot')
            .classed('plot', true)
            .attr('transform', function () {
                if (_legendPosition == 'top') {
                    return 'translate(' + margin.left + ', ' + parseInt(legendSpace * 2 + (20 * parseInt(legendBreakCount))) + ')';
                } else if (_legendPosition == 'bottom') {
                    return 'translate(' + margin.left + ', 0)';
                } else if (_legendPosition == 'left') {
                    return 'translate(' + (legendSpace + margin.left + axisLabelSpace) + ', 0)';
                } else if (_legendPosition == 'right') {
                    return 'translate(' + margin.left + ', 0)';
                }
            });

        if (!_showLegend) {
            _local_svg.select('.plot')
                .attr('transform', function () {
                    return 'translate(' + margin.left + ', ' + 0 + ')';
                });
        }
        if (!_showXaxis) {
            _local_svg.select('.plot')
                .attr('transform', function () {
                    return 'translate(' + 0 + ', ' + 0 + ')';
                });
        }

        var labelStack = [];
        var keys = UTIL.getMeasureList(data[0], _dimension);

        x.rangeRound([0, plotWidth])
            .padding([0.5])
            .domain(data.map(function (d) { return d[_dimension[0]]; }));

        y.rangeRound([plotHeight, 0])
            .domain([0, d3.max(data, function (d) {
                return d3.max(keys, function (key) {
                    return parseInt(d[key]);
                });
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

        var areaGenerator = d3.area()
            .curve(d3.curveLinear)
            .x(function (d, i) {
                return x(d['data'][_dimension[0]]) + x.bandwidth() / 2;
            })
            .y0(plotHeight)
            .y1(function (d) {
                return y(d['data'][d['tag']]);
            });

        var lineGenerator = d3.line()
            .curve(d3.curveLinear)
            .x(function (d, i) {
                return x(d['data'][_dimension[0]]) + x.bandwidth() / 2;
            })
            .y(function (d, i) {
                return y(d['data'][d['tag']]);
            });

        var clusterLine = plot.selectAll('.cluster_line')
            .data(keys.filter(function (m) { return labelStack.indexOf(m) == -1; }))
            .enter().append('g')
            .attr('class', 'cluster_line');

        var area = clusterLine.append('path')
            .datum(function (d, i) {
                return data.map(function (datum) { return { "tag": d, "data": datum }; });
            })
            .attr('class', 'area')
            .attr('fill', function (d, i) {
                return UTIL.getBorderColor(_measure.indexOf(d[0]['tag']), _borderColor);
            })
            .attr('visibility', function (d, i) {
                if (_lineType[(_measure.indexOf(d[0]['tag']))] == "area") {
                    return 'visible'
                }
                else {
                    return 'hidden';
                }
            })
            .style('fill-opacity', 0.5)
            .attr('stroke', 'none')
            .style('stroke-width', 0)
            .style('opacity', 0)
            .attr('d', areaGenerator);

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
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', 1)

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
                    .type(getPointType(_measure.indexOf(d.tag)))
                    .size(40)();
            })
            .attr('transform', function (d) {
                return 'translate('
                    + (x(d['data'][_dimension[0]]) + x.bandwidth() / 2)
                    + ',' + y(d['data'][d['tag']]) + ')';
            })

        var text = clusterLine.selectAll('text')
            .data(function (d, i) {
                return data.map(function (d) { return { "index": i, "data": d }; });
            })
            .enter().append('text')
            .attr('x', function (d, i) {
                return x(d['data'][_dimension[0]]);
            })
            .attr('y', function (d, i) {
                return y(d['data'][_measure[d['index']]]);
            })
            .attr('dy', function (d, i) {
                return -2 * offsetY;
            })
            .style('text-anchor', 'middle')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d['data'][_measure[d['index']]], UTIL.getValueNumberFormat(d["index"], _numberFormat));
            })
            .text(function (d, i) {
                if (!_print) {
                    var width = (1 - x.padding()) * plotWidth / (_localXLabels.length - 1);
                    return UTIL.getTruncatedLabel(this, d3.select(this).text(), width);
                }
                else {
                    return UTIL.getFormattedValue(d['data'][_measure[d['index']]], UTIL.getValueNumberFormat(d["index"], _numberFormat));
                }
            })
            .attr('visibility', function (d, i) {
                return UTIL.getVisibility(_showValues[d['index']]);
            })
            .style('font-style', function (d, i) {
                return _fontStyle[d['index']];
            })
            .style('font-weight', function (d, i) {
                return _fontWeight[d['index']];
            })
            .style('font-size', function (d, i) {
                return _fontSize[d['index']];
            })
            .style('fill', function (d, i) {
                return _textColor[d['index']];
            });

        if (!_print) {
            point.on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
                .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
                .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
                .on('click', function (d) {
                    if ($("#myonoffswitch").prop('checked') == false) {
                        $('#Modal_' + $(div).attr('id') + ' .measure').val(d.measure);
                        $('#Modal_' + $(div).attr('id') + ' .threshold').val('');
                        $('#Modal_' + $(div).attr('id') + ' .measure').attr('disabled', true);;
                        $('#Modal_' + $(div).attr('id')).modal('toggle');
                    }
                    else {
                        filter = false;
                        var confirm = d3.select(div).select('.confirm')
                            .style('visibility', 'visible');
                        var _filter = _Local_data.filter(function (d1) {
                            return d.data[_dimension[0]] === d1[_dimension[0]]
                        })
                        var rect = d3.select(this);
                        if (rect.classed('selected')) {
                            rect.classed('selected', false);
                            filterData.map(function (val, i) {
                                if (val[_dimension[0]] == d.data[_dimension[0]]) {
                                    filterData.splice(i, 1)
                                }
                            })
                        } else {
                            rect.classed('selected', true);
                            var isExist = filterData.filter(function (val) {
                                if (val[_dimension[0]] == d.data[_dimension[0]]) {
                                    return val
                                }
                            })
                            if (isExist.length == 0) {
                                filterData.push(_filter[0]);
                            }
                        }

                        var _filterDimension = {};
                        if (broadcast.filterSelection.id) {
                            _filterDimension = broadcast.filterSelection.filter;
                        } else {
                            broadcast.filterSelection.id = $(div).attr('id');
                        }
                        var dimension = _dimension[0];
                        if (_filterDimension[dimension]) {
                            var temp = _filterDimension[dimension];
                            if (temp.indexOf(d.data[_dimension[0]]) < 0) {
                                temp.push(d.data[_dimension[0]]);
                            } else {
                                temp.splice(temp.indexOf(d.data[_dimension[0]]), 1);
                            }
                            _filterDimension[dimension] = temp;
                        } else {
                            _filterDimension[dimension] = [d.data[_dimension[0]]];
                        }

                        var idWidget = broadcast.updateWidget[$(div).attr('id')];
                        broadcast.updateWidget = {};
                        broadcast.updateWidget[$(div).attr('id')] = idWidget;
                        broadcast.filterSelection.filter = _filterDimension;
                        var _filterParameters = filterParameters.get();
                        _filterParameters[dimension] = _filterDimension[dimension];
                        filterParameters.save(_filterParameters);
                    }
                })
        }

        /* Axes */
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
                .attr('transform', 'translate(0, ' + plotHeight + ')')
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
                .attr('visibility', UTIL.getVisibility(_showXaxisLabel))
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
                .attr('visibility', UTIL.getVisibility(_showYaxisLabel))
                .text(function () {
                    return _displayNameForMeasure.map(function (p) { return p; }).join(', ');
                });

            _setAxisColor(yAxisGroup, _yAxisColor);
        }

        if (!_print) {

            //remove Threshold modal popup 
            // var str = UTIL.createAlert($(div).attr('id'), _measure);
            // $(div).append(str);

            var confirm = $(me).parent().find('div.confirm')
                .css('visibility', 'hidden');

            var _filter = UTIL.createFilterElement()
            $(div).append(_filter);

            line
                .on("mouseover", function (d) {
                    d3.select(this)
                        .style("stroke-width", "2.5px")
                        .style("cursor", "pointer");
                })
                .on("mouseout", function (d) {
                    d3.select(this)
                        .style("stroke-width", "1.5px")
                        .style("cursor", "none");
                })
                .attr('d', lineGenerator)
                .transition()
                .duration(COMMON.DURATION)
                .attrTween('stroke-dasharray', function () {
                    var l = this.getTotalLength(),
                        i = d3.interpolateString("0," + l, l + "," + l);
                    return function (t) { return i(t); };
                });

            area.transition()
                .duration(COMMON.DURATION)
                .styleTween('opacity', function () {
                    var interpolator = d3.interpolateNumber(0, 1);

                    return function (t) {
                        return interpolator(t);
                    }
                });

            $(document).on('click', '_local_svg', function (e) {
                if ($("#myonoffswitch").prop('checked') == false) {
                    var element = e.target
                    if (element.tagName == "_local_svg") {
                        $('#Modal_' + $(div).attr('id') + ' .measure').val('')
                        $('#Modal_' + $(div).attr('id') + ' .threshold').val('')
                        $('#Modal_' + $(div).attr('id') + ' .measure').attr('disabled', false)
                        $('#Modal_' + $(div).attr('id')).modal('toggle');
                    }
                }
            })

            $(document).on('click', '#Modal_' + $(div).attr('id') + ' .ThresholdSubmit', function (e) {
                var newValue = $('#Modal_' + $(div).attr('id') + ' .threshold').val();
                var obj = new Object()
                obj.measure = $('#Modal_' + $(div).attr('id') + ' .measure').val()
                obj.threshold = newValue;
                threshold.push(obj);
                $('#Modal_' + $(div).attr('id')).modal('toggle');
            })

            _local_svg.select('g.sort').remove();
            UTIL.sortingView(container, parentHeight, parentWidth + margin.left, legendBreakCount, axisLabelSpace, offsetX);

            _local_svg.select('g.sort').selectAll('text')
                .on('click', function () {
                    var order = d3.select(this).attr('class')
                    switch (order) {
                        case 'ascending':
                            UTIL.toggleSortSelection(me, 'ascending', drawPlot, _local_svg, keys, _Local_data);
                            break;
                        case 'descending':
                            UTIL.toggleSortSelection(me, 'descending', drawPlot, _local_svg, keys, _Local_data);
                            break;
                        case 'reset': {
                            $(me).parent().find('.sort_selection,.arrow-down').css('visibility', 'hidden');
                            _local_svg.select('.plot').remove()
                            drawPlot.call(me, _Local_data);
                            break;
                        }
                    }
                });

            d3.select(div).select('.filterData')
                .on('click', applyFilter());

            d3.select(div).select('.removeFilter')
                .on('click', clearFilter(div));

            _local_svg.select('g.lasso').remove()

            var lasso = d3Lasso.lasso()
                .hoverSelect(true)
                .closePathSelect(true)
                .closePathDistance(100)
                .items(point)
                .targetArea(_local_svg);

            lasso.on('start', onLassoStart(lasso, me))
                .on('draw', onLassoDraw(lasso, me))
                .on('end', onLassoEnd(lasso, me))

            _local_svg.call(lasso);
        }
        else {
            line
                .attr('d', lineGenerator)
            area
                .style('opacity', 1);
        }

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

        var line = plot.selectAll('.line')
            .filter(function (d, i) {
                return d[i].tag === data;
            })
            .style("stroke-width", "2.5px")
            .style('stroke', COMMON.HIGHLIGHTER);
    }

    var _legendMouseMove = function (data, plot) {

    }

    var _legendMouseOut = function (data, plot) {
        var line = plot.selectAll('.line')
            .filter(function (d, i) {
                return d[i].tag === data;
            })
            .style("stroke-width", "1.5px")
            .style('stroke', function (d, i) {
                return UTIL.getDisplayColor(_measure.indexOf(d[0]['tag']), _displayColor);
            });
    }

    var _legendClick = function (data) {
        var _filter = UTIL.getFilterData(_localLabelStack, data, _originalData)
        drawPlot.call(this, _filter);
    }

    chart.update = function (data) {

        chart._Local_data = data;
        filterData = [];

        var plot = _local_svg.select('.plot')
        var chartplot = _local_svg.select('.chart')
        labelStack = [];

        var _localXLabels = data.map(function (d) {
            return d[_dimension[0]];
        });

        var keys = UTIL.getMeasureList(data[0], _dimension);

        x.domain(data.map(function (d) {
            return d[_dimension[0]];
        }));
        y.domain([0, d3.max(data, function (d) {
            return d3.max(keys, function (key) {
                return parseInt(d[key]);
            });
        })]).nice();

        var areaGenerator = d3.area()
            .curve(d3.curveLinear)
            .x(function (d, i) {
                return x(d['data'][_dimension[0]]) + x.bandwidth() / 2;
            })
            .y0(plotHeight)
            .y1(function (d) {
                return y(d['data'][d['tag']]);
            });

        var lineGenerator = d3.line()
            .curve(d3.curveLinear)
            .x(function (d, i) {
                return x(d['data'][_dimension[0]]) + x.bandwidth() / 2;
            })
            .y(function (d, i) {
                return y(d['data'][d['tag']]);
            });

        var clusterLine = plot.selectAll('.cluster_line')
            .data(keys.filter(function (m) { return labelStack.indexOf(m) == -1; }))

        var line = clusterLine.select('path.line')
            .classed('line-path', true)
            .datum(function (d, i) {
                return data.map(function (datum) { return { "tag": d, "data": datum }; });
            })
            .attr('stroke-dasharray', 'none')
            .attr('d', lineGenerator)
            .transition()
            .duration(COMMON.DURATION)
            .attrTween('stroke-dasharray', function () {
                var l = this.getTotalLength(),
                    i = d3.interpolateString("0," + l, l + "," + l);
                return function (t) { return i(t); };
            });


        var area = clusterLine.select('path.area')
            .datum(function (d, i) {
                return data.map(function (datum) { return { "tag": d, "data": datum }; });
            })
            .attr('d', areaGenerator)
            .style('fill-opacity', 0.5)
            .attr('stroke', 'none')
            .style('stroke-width', 0)
            .style('opacity', 0)
            .transition()
            .duration(COMMON.DURATION)
            .styleTween('opacity', function () {
                var interpolator = d3.interpolateNumber(0, 1);

                return function (t) {
                    return interpolator(t);
                }
            });

        plot.selectAll('path.point').remove()


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
                    .type(getPointType(_measure.indexOf(d.tag)))
                    .size(40)();
            })
            .attr('transform', function (d) {
                return 'translate('
                    + (x(d['data'][_dimension[0]]) + x.bandwidth() / 2)
                    + ',' + y(d['data'][d['tag']]) + ')';
            })
            .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
            .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
            .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
            .on('click', function (d) {
                if ($("#myonoffswitch").prop('checked') == false) {
                    $('#Modal_' + $(div).attr('id') + ' .measure').val(d.measure);
                    $('#Modal_' + $(div).attr('id') + ' .threshold').val('');
                    $('#Modal_' + $(div).attr('id') + ' .measure').attr('disabled', true);;
                    $('#Modal_' + $(div).attr('id')).modal('toggle');
                }
                else {
                    filter = false;
                    var confirm = d3.select(div).select('.confirm')
                        .style('visibility', 'visible');
                    var _filter = _Local_data.filter(function (d1) {
                        return d.data[_dimension[0]] === d1[_dimension[0]]
                    })
                    var rect = d3.select(this);
                    if (rect.classed('selected')) {
                        rect.classed('selected', false);
                        filterData.map(function (val, i) {
                            if (val[_dimension[0]] == d.data[_dimension[0]]) {
                                filterData.splice(i, 1)
                            }
                        })
                    } else {
                        rect.classed('selected', true);
                        var isExist = filterData.filter(function (val) {
                            if (val[_dimension[0]] == d.data[_dimension[0]]) {
                                return val
                            }
                        })
                        if (isExist.length == 0) {
                            filterData.push(_filter[0]);
                        }
                    }
                }
            })


        var lineText = clusterLine.selectAll('text')
            .data(function (d, i) {
                return data.map(function (d) { return { "index": i, "data": d }; });
            })

        lineText.exit().remove();

        lineText.enter().append('text')
            .attr('x', function (d, i) {
                return x(d['data'][_dimension[0]]);
            })
            .attr('y', function (d, i) {
                return y(d['data'][_measure[d['index']]]);
            })
            .attr('dy', function (d, i) {
                return -2 * offsetY;
            })
            .style('text-anchor', 'middle')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d['data'][_measure[d['index']]], UTIL.getValueNumberFormat(d["index"], _numberFormat));
            })
            .text(function (d, i) {
                var width = (1 - x.padding()) * plotWidth / (_localXLabels.length - 1);
                return UTIL.getTruncatedLabel(this, d3.select(this).text(), width);
            })
            .attr('visibility', function (d, i) {
                return UTIL.getVisibility(_showValues[d['index']]);
            })
            .style('font-style', function (d, i) {
                return _fontStyle[d['index']];
            })
            .style('font-weight', function (d, i) {
                return _fontWeight[d['index']];
            })
            .style('font-size', function (d, i) {
                return _fontSize[d['index']];
            })
            .style('fill', function (d, i) {
                return _textColor[d['index']];
            });

        lineText
            .attr('x', function (d, i) {
                return x(d['data'][_dimension[0]]);
            })
            .attr('y', function (d, i) {
                return y(d['data'][_measure[d['index']]]);
            })
            .text(function (d, i) {
                return UTIL.getFormattedValue(d['data'][_measure[d['index']]], UTIL.getValueNumberFormat(d["index"], _numberFormat));
            })
            .text(function (d, i) {
                var width = (1 - x.padding()) * plotWidth / (_localXLabels.length - 1);
                return UTIL.getTruncatedLabel(this, d3.select(this).text(), width);
            })

        var xAxisGroup,
            yAxisGroup;

        var isRotate = false;

        _localXAxis
            .tickFormat(function (d) {
                if (isRotate == false) {
                    isRotate = UTIL.getTickRotate(d, (plotWidth) / (_localXLabels.length - 1), tickLength);
                }
                return UTIL.getTruncatedTick(d, (plotWidth) / (_localXLabels.length - 1), tickLength);
            })

        if (_showXaxis) {
            xAxisGroup = plot.select('.x.axis')
                .transition()
                .duration(COMMON.DURATION)
                .call(_localXAxis);

            _setAxisColor(xAxisGroup, _xAxisColor);

            if (isRotate) {
                _local_svg.selectAll('.x .tick text')
                    .attr("transform", "rotate(-15)");
            }
            else {
                _local_svg.selectAll('.x .tick text')
                    .attr("transform", "rotate(0)");
            }
        }

        if (_showYaxis) {
            yAxisGroup = plot.select('.y.axis')
                .transition()
                .duration(COMMON.DURATION)
                .call(_localYAxis);

            _setAxisColor(yAxisGroup, _yAxisColor);
        }

        /* Update Axes Grid */
        _localXGrid.ticks(x);
        _localYGrid.scale(y);

        plot.select('.x.grid')
            .transition()
            .duration(COMMON.DURATION)
            .attr('visibility', function () {
                return _showGrid ? 'visible' : 'hidden';
            })
            .call(_localXGrid);

        plot.select('.y.grid')
            .transition()
            .duration(COMMON.DURATION)
            .attr('visibility', function () {
                return _showGrid ? 'visible' : 'hidden';
            })
            .call(_localYGrid);

        UTIL.displayThreshold(threshold, data, keys);
        _local_svg.select('g.lasso').remove()

        var lasso = d3Lasso.lasso()
            .hoverSelect(true)
            .closePathSelect(true)
            .closePathDistance(100)
            .items(point)
            .targetArea(_local_svg);

        lasso.on('start', onLassoStart(lasso, div))
            .on('draw', onLassoDraw(lasso, div))
            .on('end', onLassoEnd(lasso, div))

        _local_svg.call(lasso);

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

    chart.showGrid = function (value) {
        if (!arguments.length) {
            return _showGrid;
        }
        _showGrid = value;
        return chart;
    }

    chart.legendData = function (measureConfig, measureName) {
        _legendData = {
            measureConfig: measureConfig,
            measureName: measureName
        }
        return _legendData;
    }

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
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

    chart.lineType = function (value, measure) {
        return UTIL.baseAccessor.call(_lineType, value, measure, _measure);
    }

    chart.pointType = function (value, measure) {
        return UTIL.baseAccessor.call(_pointType, value, measure, _measure);
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
    return chart;
}

module.exports = line;