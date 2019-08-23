var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var UTIL = require('../extras/util.js')();
var LEGEND = require('../extras/legend_barcharts.js')();

try {
    var d3Lasso = __webpack_require__(/*! d3-lasso */ "./node_modules/d3-lasso/build/d3-lasso.js");

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
        _notification = false,
        _data,
        _isFilterGrid = false,
        _showSorting = true;

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
    var _x = d3.scalePoint(), _y = d3.scaleLinear(), brush = d3.brushX();
    var FilterControlHeight = 100;

    var areaGenerator = d3.area(), lineGenerator = d3.line();

    var tickLength = d3.scaleLinear()
        .domain([22, 34])
        .range([2, 4]);

    var legendSpace = 20, axisLabelSpace = 20, offsetX = 16, offsetY = 3, parentContainer;
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
        this.isFilterGrid(config.isFilterGrid);
        this.showSorting(config.showSorting);
        setDefaultColorForChart()
        this.legendData(_displayColor, config.measure, config.displayNameForMeasure);
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

    var setDefaultColorForChart = function () {
        for (let index = 0; index < _measure.length; index++) {
            if (_displayColor[index] == null || _displayColor[index] == undefined) {
                _displayColor[index] = COMMON.COLORSCALE(index);
            }
            if (_borderColor[index] == null || _borderColor[index] == undefined) {
                _borderColor[index] = COMMON.COLORSCALE(index);
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

            var confirm = d3.select(scope.node().parentNode).select('div.confirm')
                .style('visibility', 'visible')

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
                var idWidget = broadcast.updateWidget[scope.node().parentNode.id];
                broadcast.updateWidget = {};
                broadcast.updateWidget[scope.node().parentNode.id] = idWidget;

                var _filterList = {}, list = []

                filterData.map(function (val) {
                    list.push(val[_dimension[0]])
                })

                list = list.filter(function (item, i, ar) { return ar.indexOf(item) === i; });

                var _filterDimension = {};
                if (broadcast.filterSelection.id) {
                    _filterDimension = broadcast.filterSelection.filter;
                } else {
                    broadcast.filterSelection.id = parentContainer.attr('id');
                }
                var dimension = _dimension[0];

                _filterDimension[dimension] = list;

                broadcast.filterSelection.filter = _filterDimension;
                var _filterParameters = filterParameters.get();
                _filterParameters[dimension] = _filterDimension[dimension];
                filterParameters.save(_filterParameters);
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
    var clearFilter = function (parentContainer) {
        return function () {
            chart.update(_originalData);
            parentContainer.select('.confirm')
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

    var drawLegend = function () {
        var legendWidth = 0,
            legendHeight = 0;

        plotWidth = parentWidth;
        plotHeight = parentHeight;
        _local_svg.select('.legend').remove();
        if (_showLegend) {
            var stackedverticalbarLegend = LEGEND.bind(chart);

            var result = stackedverticalbarLegend(_legendData, container, {
                width: parentWidth,
                height: parentHeight,
                legendBreakCount: legendBreakCount
            });

            legendWidth = result.legendWidth;
            legendHeight = result.legendHeight;
            legendBreakCount = result.legendBreakCount;

            switch (_legendPosition.toUpperCase()) {
                case 'TOP':
                    plotHeight = parentHeight - legendHeight - axisLabelSpace;
                    break;
                case 'BOTTOM':
                    plotHeight = parentHeight - legendHeight - axisLabelSpace * 2;
                    break;
                case 'RIGHT':
                case 'LEFT':
                    plotWidth = parentWidth - legendWidth;
                    break;
            }

            if ((_legendPosition.toUpperCase() == 'TOP') || (_legendPosition.toUpperCase() == 'BOTTOM')) {
                plotWidth = parentWidth;
                plotHeight = parentHeight - 3 * axisLabelSpace;
                legendSpace = 20;
            } else if ((_legendPosition.toUpperCase() == 'LEFT') || (_legendPosition.toUpperCase() == 'RIGHT')) {
                var legend = _local_svg.selectAll('.item');
                legendSpace = legend.node().parentNode.getBBox().width;
                plotWidth = (parentWidth - legendSpace) - margin.left + axisLabelSpace;
                plotHeight = parentHeight;

                legend.attr('transform', function (d, i) {
                    if (_legendPosition.toUpperCase() == 'LEFT') {
                        return 'translate(0, ' + i * 20 + ')';

                    }
                    else if (_legendPosition.toUpperCase() == 'RIGHT') {
                        return 'translate(' + (parentWidth - legendSpace + axisLabelSpace + 10) + ', ' + i * 20 + ')';
                    }
                });
            }
        }
        else {
            legendSpace = 0;
            parentHeight = parentHeight - axisLabelSpace;
            plotWidth = parentWidth;
            plotHeight = parentHeight;
        }
    }
    var brushed = function () {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom

        // get bounds of selection
        var s = d3.event.selection,
            filterList = [];
        _x.domain().forEach((d) => {
            var pos = _x(d) + _x.bandwidth() / 2;
            if (pos > s[0] && pos < s[1]) {
                filterList.push(d);
            }
        });
        var updatedData = UTIL.getFilterDataForGrid(_data, filterList, _dimension[0]);
        if (updatedData.length > 0) {
            chart.update(updatedData);
        }
    }
    function chart(selection) {

        data = UTIL.sortingData(_data, _dimension[0])
        _Local_data = _originalData = data;

        if (_isFilterGrid) {
            if (!(Object.keys(broadcast.filterSelection.filter).length === 0 && broadcast.filterSelection.filter.constructor === Object)) {
                _isFilterGrid = false;
            }
        }

        if (_print && !_notification) {
            parentContainer = selection;
        }
        else {
            parentContainer = d3.select('#' + selection.id)
        }

        var containerHeight = parentContainer.attr('height');
        if (_isFilterGrid) {
            containerHeight = containerHeight * 80 / 100;
            FilterControlHeight = containerHeight * 20 / 100;
        }

        var svg = parentContainer.append('svg')
            .attr('width', parentContainer.attr('width'))
            .attr('height', containerHeight)

        var width = +svg.attr('width'),
            height = +svg.attr('height');

        _local_svg = svg;

        parentWidth = width - 2 * COMMON.PADDING - (_showYaxis == true ? margin.left : 0);
        parentHeight = (height - 2 * COMMON.PADDING - (_showXaxis == true ? axisLabelSpace * 2 : axisLabelSpace));

        container = svg.append('g')
            .attr("class", "focus")
            .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

        svg.attr('width', width)
            .attr('height', height)

        parentContainer.append('div')
            .attr('class', 'sort_selection');

        parentContainer.append('div')
            .attr('class', 'arrow-down');

        parentContainer.append('div')
            .attr('class', 'custom_tooltip');

        drawLegend.call(this);
        drawPlot.call(this, data);
    }

    var drawPlot = function (data) {
        var me = this;
        if (_tooltip) {
            tooltip = parentContainer.select('.custom_tooltip');
        }
        var plot = container.append('g')
            .attr('class', 'line-plot')
            .classed('plot', true)
            .attr('transform', function () {
                return UTIL.setPlotPosition(_legendPosition, _showXaxis, _showYaxis, _showLegend, margin.left, legendSpace, legendBreakCount, axisLabelSpace, _local_svg);
            });

        var labelStack = [];
        var keys = UTIL.getMeasureList(data[0], _dimension);

        x.rangeRound([0, plotWidth])
            .padding([0.5])
            .domain(data.map(function (d) { return d[_dimension[0]]; }));

        var range = UTIL.getMinMax(data, keys);

        y.rangeRound([plotHeight, 0])
            .domain([range[0], range[1]])
            .nice();

        drawPlotForFilter.call(this, data);

        var _localXLabels = data.map(function (d) {
            return d[_dimension[0]];
        });

        _localXGrid = d3.axisBottom()
            .ticks(_localXLabels.length)
            .tickFormat('')
            .tickSize(-plotHeight);

        _localYGrid = d3.axisLeft()
            .tickFormat(function (d) {
                UTIL.setAxisGridVisibility(this, _local_svg, _showGrid, d)
            })
            .tickSize(-plotWidth);

        _localXGrid.scale(x);
        _localYGrid.scale(y);

        plot.append('g')
            .attr('class', 'x grid')
            .attr('visibility', UTIL.getVisibility(_showGrid))
            .attr('transform', 'translate(0, ' + plotHeight + ')')
            .call(_localXGrid);

        plot.append('g')
            .attr('class', 'y grid')
            .attr('visibility', 'visible')
            .call(_localYGrid);

        areaGenerator = d3.area()
            .curve(d3.curveLinear)
            .x(function (d, i) {
                return x(d['data'][_dimension[0]]) + x.bandwidth() / 2;
            })
            .y0(function (d, i) {
                return y(0);
            })
            .y1(function (d) {
                return y(d['data'][d['tag']]);
            });

        lineGenerator = d3.line()
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
                if (_lineType[(_measure.indexOf(d[0]['tag']))].toUpperCase() == "AREA") {
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
                return data.map(function (datum) { return { "tag": d, "data": datum }; });
            })
            .enter().append('text')
            .attr('x', function (d, i) {
                return x(d['data'][_dimension[0]]);
            })
            .attr('y', function (d, i) {
                return y(d.data[d.tag]);
            })
            .attr('dy', function (d, i) {
                return -2 * offsetY;
            })
            .style('text-anchor', 'middle')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d.data[d.tag], UTIL.getValueNumberFormat(_measure.indexOf(d.tag), _numberFormat, d.data[d.tag]));
            })
            .text(function (d, i) {
                if (!_print) {
                    var width = (1 - x.padding()) * plotWidth / (_localXLabels.length - 1);
                    return UTIL.getTruncatedLabel(this, d3.select(this).text(), width);
                }
                else {
                    return UTIL.getFormattedValue(d.data[d.tag], UTIL.getValueNumberFormat(_measure.indexOf(d.tag), _numberFormat, d.data[d.tag]));
                }
            })
            .attr('visibility', function (d, i) {
                if (_notification) {
                    return 'hidden';
                }
                return UTIL.getVisibility(_showValues[_measure.indexOf(d.tag)]);
            })
            .style('font-style', function (d, i) {
                return _fontStyle[_measure.indexOf(d.tag)];
            })
            .style('font-weight', function (d, i) {
                return _fontWeight[_measure.indexOf(d.tag)];
            })
            .style('font-size', function (d, i) {
                return _fontSize[_measure.indexOf(d.tag)];
            })
            .style('fill', function (d, i) {
                return _textColor[_measure.indexOf(d.tag)];
            });

        if (!_print || _notification) {
            point.on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
                .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
                .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
                .on('click', function (d) {
                    if (!_print) {
                        if (broadcast != undefined && broadcast.isThresholdAlert) {
                            var ThresholdViz = {};
                            ThresholdViz.ID = parentContainer.attr('vizID');
                            ThresholdViz.measure = d.tag;
                            ThresholdViz.measureValue = d.data[d.tag];
                            ThresholdViz.dimension = _dimension[0];
                            ThresholdViz.dimensionValue = d.data[_dimension[0]];
                            broadcast.ThresholdViz = ThresholdViz;
                            broadcast.$broadcast('FlairBi:threshold-dialog');
                        }
                        else {
                            filter = false;
                            var confirm = parentContainer.select('.confirm')
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
                                broadcast.filterSelection.id = parentContainer.attr('id');
                            }
                            var dimension = _dimension[0];
                            if (_filterDimension[dimension]) {
                                _filterDimension[dimension] = filterData.map(function (d) {
                                    return d[_dimension[0]];
                                });
                            } else {
                                _filterDimension[dimension] = [d.data[_dimension[0]]];
                            }

                            var idWidget = broadcast.updateWidget[parentContainer.attr('id')];
                            broadcast.updateWidget = {};
                            broadcast.updateWidget[parentContainer.attr('id')] = idWidget;
                            broadcast.filterSelection.filter = _filterDimension;
                            var _filterParameters = filterParameters.get();
                            _filterParameters[dimension] = _filterDimension[dimension];
                            filterParameters.save(_filterParameters);
                        }
                    }

                })
        }

        /* Axes */
        var xAxisGroup,
            yAxisGroup;

        var isRotate = false;

        _localXAxis = d3.axisBottom(x)
            .tickSize(0)
            .tickFormat(function (d) {
                if (isRotate == false) {
                    isRotate = UTIL.getTickRotate(d, (plotWidth) / (_localXLabels.length ), tickLength);
                }
                return UTIL.getTruncatedTick(d, (plotWidth) / (_localXLabels.length ), tickLength);
            })
            .tickPadding(10);

        xAxisGroup = plot.append('g')
            .attr('class', 'x_axis')
            .attr('visibility', 'visible')
            .attr('transform', 'translate(0, ' + plotHeight + ')')
            .call(_localXAxis);

        xAxisGroup.append('g')
            .attr('class', 'label')
            .attr('transform', function () {
                return 'translate(' + (plotWidth / 2) + ', ' + parseFloat((COMMON.AXIS_THICKNESS / 1.5) + COMMON.PADDING) + ')';
            })
            .append('text')
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .style('fill', _xAxisColor)
            .attr('visibility', UTIL.getVisibility(_showXaxisLabel))
            .text(_displayName);

        if (isRotate) {
            _local_svg.selectAll('.x_axis .tick text')
                .attr("transform", "rotate(-15)");
        }

        _localYAxis = d3.axisLeft(y)
            .tickSize(0)
            .tickPadding(8)
            .tickFormat(function (d) {
                return UTIL.shortScale(2)(d);
            });

        yAxisGroup = plot.append('g')
            .attr('class', 'y_axis')
            .attr('visibility', 'visible')
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

        UTIL.setAxisColor(_xAxisColor, _showXaxis, _yAxisColor, _showYaxis, _local_svg);

        if (!_print) {

            //remove Threshold modal popup 
            // var str = UTIL.createAlert($(div).attr('id'), _measure);
            // $(div).append(str);

            var confirm = $(me).parent().find('div.confirm')
                .css('visibility', 'hidden');

            var _filter = UTIL.createFilterElement()
            $('#' + parentContainer.attr('id')).append(_filter);

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
                        $('#Modal_' + parentContainer.attr('id') + ' .measure').val('')
                        $('#Modal_' + parentContainer.attr('id') + ' .threshold').val('')
                        $('#Modal_' + parentContainer.attr('id') + ' .measure').attr('disabled', false)
                        $('#Modal_' + parentContainer.attr('id')).modal('toggle');
                    }
                }
            })

            $(document).on('click', '#Modal_' + parentContainer.attr('id') + ' .ThresholdSubmit', function (e) {
                var newValue = $('#Modal_' + parentContainer.attr('id') + ' .threshold').val();
                var obj = new Object()
                obj.measure = $('#Modal_' + parentContainer.attr('id') + ' .measure').val()
                obj.threshold = newValue;
                threshold.push(obj);
                $('#Modal_' + parentContainer.attr('id')).modal('toggle');
            })

            _local_svg.select('g.sort').remove();
            UTIL.sortingView(container, parentHeight, parentWidth + (_showYaxis == true ? margin.left : 0), legendBreakCount, axisLabelSpace, offsetX, _showSorting);


            _local_svg.select('g.sort').selectAll('text')
                .on('click', function () {
                    var order = d3.select(this).attr('class')
                    switch (order) {
                        case 'ascending':
                            UTIL.toggleSortSelection('ascending', chart.update, _local_svg, keys, _Local_data, _isFilterGrid);
                            break;
                        case 'descending':
                            UTIL.toggleSortSelection('descending', chart.update, _local_svg, keys, _Local_data, _isFilterGrid);
                            break;
                        case 'reset': {
                            chart.update.call(me, _Local_data);
                            drawPlotForFilter.call(this, _originalData);
                            break;
                        }
                    }
                });

            parentContainer.select('.filterData')
                .on('click', applyFilter());

            parentContainer.select('.removeFilter')
                .on('click', clearFilter(parentContainer));
            _local_svg.select('g.lasso').remove()

            var lasso = d3Lasso.lasso()
                .hoverSelect(true)
                .closePathSelect(true)
                .closePathDistance(100)
                .items(point)
                .targetArea(_local_svg);

            lasso.on('start', onLassoStart(lasso, _local_svg))
                .on('draw', onLassoDraw(lasso, _local_svg))
                .on('end', onLassoEnd(lasso, _local_svg))

            _local_svg.call(lasso);
        }
        else {
            line
                .attr('d', lineGenerator)
            area
                .style('opacity', 1);
        }

    }
    var drawPlotForFilter = function (data) {
        if (!_print) {
            var keys = UTIL.getMeasureList(data[0], _dimension);
            var range = UTIL.getMinMax(data, keys);
            parentContainer.select('.filterElement').remove();
            svgFilter = parentContainer.append('svg')
                .attr('width', parentContainer.attr('width'))
                .attr('height', FilterControlHeight)
                .attr('class', 'filterElement')
                .style('visibility', UTIL.getVisibility(_isFilterGrid));

            _x.rangeRound([0, parseInt(_local_svg.attr('width') - 2 * COMMON.PADDING)])
                .padding([0.5])
                .domain(data.map(function (d) { return d[_dimension[0]]; }));

            var range = UTIL.getMinMax(data, keys);

            _y.rangeRound([FilterControlHeight - COMMON.PADDING, 0])
                .domain([range[0], range[1]])
                .nice();

            brush.extent([[0, 0], [parentContainer.attr('width'), FilterControlHeight]])
                .on("brush", brushed);

            var separationLine = svgFilter.append("line")
                .attr("stroke", COMMON.SEPARATIONLINE)
                .attr("x1", COMMON.PADDING)
                .attr("x2", parseInt(_local_svg.attr('width') - 2 * COMMON.PADDING))
                .attr("y1", "0")
                .attr("y1", "0")
                .style("stroke-dasharray", ("3, 3"));

            var context = svgFilter.append("g")
                .attr("class", "context")
                .attr('width', parentContainer.attr('width'))
                .attr('height', FilterControlHeight)
                .attr('transform', 'translate(' + COMMON.PADDING + ', ' + 0 + ')');

            _localXAxisForFilter = d3.axisBottom(_x)
                .tickSize(0)
                .tickFormat(function (d) {
                    return '';
                })
                .tickPadding(10);

            context.append("g")
                .attr("class", "x axis_filter")
                .attr("transform", "translate(0," + parseInt(FilterControlHeight - COMMON.PADDING) + ")")
                .call(_localXAxisForFilter);

            context.append("g")
                .attr("class", "x_brush")
                .call(brush)
                .selectAll("rect")
                .attr("y", -6)
                .attr("height", FilterControlHeight + 7);

            var labelStack = [];

            var _areaGenerator = d3.area()
                .curve(d3.curveLinear)
                .x(function (d, i) {
                    return _x(d['data'][_dimension[0]]) + _x.bandwidth() / 2;
                })
                .y0(function (d, i) {
                    return _y(0);
                })
                .y1(function (d) {
                    return _y(d['data'][d['tag']]);
                });

            var _lineGenerator = d3.line()
                .curve(d3.curveLinear)
                .x(function (d, i) {
                    return _x(d['data'][_dimension[0]]) + x.bandwidth() / 2;
                })
                .y(function (d, i) {
                    return _y(d['data'][d['tag']]);
                });

            var cluster_lineFilter = context.selectAll('.cluster_lineFilter')
                .data(keys.filter(function (m) { return labelStack.indexOf(m) == -1; }))
                .enter().append('g')
                .attr('class', 'cluster_lineFilter');

            var areaFilter = cluster_lineFilter.append('path')
                .datum(function (d, i) {
                    return data.map(function (datum) { return { "tag": d, "data": datum }; });
                })
                .attr('class', 'areaFilter')
                .attr('fill', function (d, i) {
                    return UTIL.getBorderColor(_measure.indexOf(d[0]['tag']), _borderColor);
                })
                .attr('visibility', function (d, i) {
                    if (_lineType[(_measure.indexOf(d[0]['tag']))].toUpperCase() == "AREA") {
                        return 'visible'
                    }
                    else {
                        return 'hidden';
                    }
                })
                .style('fill-opacity', 0.3)
                .attr('stroke', 'none')
                .style('stroke-width', 0)
                .style('opacity', 1)
                .attr('d', _areaGenerator);

            var lineFilter = cluster_lineFilter.append('path')
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
                .attr('d', _lineGenerator)
                .style('stroke-opacity', 0.6)
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
        var _filter = UTIL.getFilterData(_localLabelStack, data, _Local_data)
        drawPlot.call(this, _filter);
    }

    chart.update = function (data, filterConfig) {

        if (_isFilterGrid) {
            if (!(Object.keys(broadcast.filterSelection.filter).length === 0 && broadcast.filterSelection.filter.constructor === Object)) {
                _isFilterGrid = false;
            }
        }

        var containerHeight = parentContainer.attr('height');
        if (_isFilterGrid) {
            containerHeight = containerHeight * 80 / 100;
            FilterControlHeight = containerHeight * 20 / 100;
        }

        var svg = _local_svg
            .attr('width', parentContainer.attr('width'))
            .attr('height', containerHeight)

        var svg = _local_svg,
            width = +svg.attr('width'),
            height = +svg.attr('height');

        parentWidth = width - 2 * COMMON.PADDING - (_showYaxis == true ? margin.left : 0);
        parentHeight = (height - 2 * COMMON.PADDING - (_showXaxis == true ? axisLabelSpace * 2 : axisLabelSpace));

        drawLegend.call(this);

        var plot = _local_svg.select('.plot')
            .attr('transform', function () {
                return UTIL.setPlotPosition(_legendPosition, _showXaxis, _showYaxis, _showLegend, margin.left, legendSpace, legendBreakCount, axisLabelSpace, _local_svg);
            });

        if (filterConfig) {
            if (!filterConfig.isFilter) {
                data = UTIL.sortingData(data, _dimension[0]);
            }
            else {
                drawPlotForFilter.call(this, UTIL.sortData(_originalData, filterConfig.key, filterConfig.sortType));
            }
        }
        else {
            data = UTIL.sortingData(data, _dimension[0]);
        }

        if (_tooltip) {
            tooltip = parentContainer.select('.custom_tooltip');
        }
        _Local_data = data;
        filterData = [];

        var chartplot = _local_svg.select('.chart')
        labelStack = [];

        var _localXLabels = data.map(function (d) {
            return d[_dimension[0]];
        });

        var keys = UTIL.getMeasureList(data[0], _dimension);

        x.rangeRound([0, plotWidth])
            .padding([0.5])
            .domain(data.map(function (d) { return d[_dimension[0]]; }));

        var range = UTIL.getMinMax(data, keys);

        y.rangeRound([plotHeight, 0])
            .domain([range[0], range[1]])
            .nice();

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
                if (!_print) {
                    if (broadcast != undefined && broadcast.isThresholdAlert) {
                        var ThresholdViz = {};
                        ThresholdViz.ID = parentContainer.attr('vizID');
                        ThresholdViz.measure = d.tag;
                        ThresholdViz.measureValue = d.data[d.tag];
                        ThresholdViz.dimension = _dimension[0];
                        ThresholdViz.dimensionValue = d.data[_dimension[0]];
                        broadcast.ThresholdViz = ThresholdViz;
                        broadcast.$broadcast('FlairBi:threshold-dialog');
                    }
                    else {
                        filter = false;
                        var confirm = parentContainer.select('.confirm')
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
                            broadcast.filterSelection.id = parentContainer.attr('id');
                        }
                        var dimension = _dimension[0];
                        if (_filterDimension[dimension]) {
                            _filterDimension[dimension] = filterData.map(function (d) {
                                return d[_dimension[0]];
                            });
                        } else {
                            _filterDimension[dimension] = [d.data[_dimension[0]]];
                        }

                        var idWidget = broadcast.updateWidget[parentContainer.attr('id')];
                        broadcast.updateWidget = {};
                        broadcast.updateWidget[parentContainer.attr('id')] = idWidget;
                        broadcast.filterSelection.filter = _filterDimension;
                        var _filterParameters = filterParameters.get();
                        _filterParameters[dimension] = _filterDimension[dimension];
                        filterParameters.save(_filterParameters);
                    }
                }

            })


        var lineText = clusterLine.selectAll('text')
            .data(function (d, i) {
                return data.map(function (datum) { return { "tag": d, "data": datum }; });
            })

        lineText.exit().remove();

        lineText.enter().append('text')
            .attr('x', function (d, i) {
                return x(d['data'][_dimension[0]]);
            })
            .attr('y', function (d, i) {
                return y(d.data[d.tag]);
            })
            .attr('dy', function (d, i) {
                return -2 * offsetY;
            })
            .style('text-anchor', 'middle')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d.data[d.tag], UTIL.getValueNumberFormat(_measure.indexOf(d.tag), _numberFormat, d.data[d.tag]));
            })
            .text(function (d, i) {
                if (!_print) {
                    var width = (1 - x.padding()) * plotWidth / (_localXLabels.length - 1);
                    return UTIL.getTruncatedLabel(this, d3.select(this).text(), width);
                }
                else {
                    return UTIL.getFormattedValue(d.data[d.tag], UTIL.getValueNumberFormat(_measure.indexOf(d.tag), _numberFormat, d.data[d.tag]));
                }
            })
            .attr('visibility', function (d, i) {
                if (_notification) {
                    return 'hidden';
                }
                return UTIL.getVisibility(_showValues[_measure.indexOf(d.tag)]);
            })
            .style('font-style', function (d, i) {
                return _fontStyle[_measure.indexOf(d.tag)];
            })
            .style('font-weight', function (d, i) {
                return _fontWeight[_measure.indexOf(d.tag)];
            })
            .style('font-size', function (d, i) {
                return _fontSize[_measure.indexOf(d.tag)];
            })
            .style('fill', function (d, i) {
                return _textColor[_measure.indexOf(d.tag)];
            });

        lineText
            .attr('x', function (d, i) {
                return x(d['data'][_dimension[0]]);
            })
            .attr('y', function (d, i) {
                return y(d.data[d.tag]);
            })
            .attr('dy', function (d, i) {
                return -2 * offsetY;
            })
            .style('text-anchor', 'middle')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d.data[d.tag], UTIL.getValueNumberFormat(_measure.indexOf(d.tag), _numberFormat, d.data[d.tag]));
            })
            .text(function (d, i) {
                if (!_print) {
                    var width = (1 - x.padding()) * plotWidth / (_localXLabels.length - 1);
                    return UTIL.getTruncatedLabel(this, d3.select(this).text(), width);
                }
                else {
                    return UTIL.getFormattedValue(d.data[d.tag], UTIL.getValueNumberFormat(_measure.indexOf(d.tag), _numberFormat, d.data[d.tag]));
                }
            })
            .attr('visibility', function (d, i) {
                if (_notification) {
                    return 'hidden';
                }
                return UTIL.getVisibility(_showValues[_measure.indexOf(d.tag)]);
            })
            .style('font-style', function (d, i) {
                return _fontStyle[_measure.indexOf(d.tag)];
            })
            .style('font-weight', function (d, i) {
                return _fontWeight[_measure.indexOf(d.tag)];
            })
            .style('font-size', function (d, i) {
                return _fontSize[_measure.indexOf(d.tag)];
            })
            .style('fill', function (d, i) {
                return _textColor[_measure.indexOf(d.tag)];
            });

        var xAxisGroup,
            yAxisGroup;

        var isRotate = false;

        _localXAxis
            .tickFormat(function (d) {
                if (isRotate == false) {
                    isRotate = UTIL.getTickRotate(d, (plotWidth) / (_localXLabels.length), tickLength);
                }
                return UTIL.getTruncatedTick(d, (plotWidth) / (_localXLabels.length ), tickLength);
            })


        xAxisGroup = plot.select('.x_axis')
            .attr('transform', 'translate(0, ' + plotHeight + ')')
            .attr('visibility', 'visible')
            .call(_localXAxis);

        if (isRotate) {
            _local_svg.selectAll('.x_axis .tick text')
                .attr("transform", "rotate(-15)");
        }
        else {
            _local_svg.selectAll('.x_axis .tick text')
                .attr("transform", "rotate(0)");
        }

        yAxisGroup = plot.select('.y_axis')
            .attr('visibility', 'visible')
            .call(_localYAxis);

        UTIL.setAxisColor(_xAxisColor, _showXaxis, _yAxisColor, _showYaxis, _local_svg);

        /* Update Axes Grid */
        _localXGrid
            .ticks(_localXLabels.length)
            .tickFormat('')
            .tickSize(-plotHeight);

        _localYGrid
            .tickFormat(function (d) {
                UTIL.setAxisGridVisibility(this, _local_svg, _showGrid, d)
            })
            .tickSize(-plotWidth);

        _localXGrid.scale(x);
        _localYGrid.scale(y);

        plot.select('.x.grid')
            .attr('transform', 'translate(0, ' + plotHeight + ')')
            .attr('visibility', 'visible')
            .call(_localXGrid);

        plot.select('.y.grid')
            .attr('visibility', 'visible')
            .call(_localYGrid);

        UTIL.displayThreshold(threshold, data, keys);
        _local_svg.select('g.lasso').remove()

        _local_svg.select('g.sort')
            .style('visibility', UTIL.getVisibility(_showSorting))

        var lasso = d3Lasso.lasso()
            .hoverSelect(true)
            .closePathSelect(true)
            .closePathDistance(100)
            .items(point)
            .targetArea(_local_svg);

        lasso.on('start', onLassoStart(lasso, _local_svg))
            .on('draw', onLassoDraw(lasso, _local_svg))
            .on('end', onLassoEnd(lasso, _local_svg))

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

   chart.legendData = function (measureConfig, measureName, displayNameForMeasure) {
        _legendData = {
           measureConfig: measureConfig,
            measureName: measureName,
            displayName: displayNameForMeasure
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
    chart.data = function (value) {
        if (!arguments.length) {
            return _data;
        }
        _data = value;
        return chart;
    }
    chart.isFilterGrid = function (value) {
        if (!arguments.length) {
            return _isFilterGrid;
        }
        _isFilterGrid = value;
        return chart;
    }
    chart.showSorting = function (value) {
        if (!arguments.length) {
            return _showSorting;
        }
        _showSorting = value;
        return chart;
    }
    return chart;
}

module.exports = line;
