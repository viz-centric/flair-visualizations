var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var UTIL = require('../extras/util.js')();
var LEGEND = require('../extras/legend_barcharts.js')();
try {
    var d3Lasso = require("d3-lasso");

} catch (ex) { }

function clusteredverticalbar() {
    var _NAME = 'clusteredverticalbar';

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
        _showValues = [],
        _displayNameForMeasure = [],
        _fontStyle = [],
        _fontWeight = [],
        _numberFormat = [],
        _textColor = [],
        _displayColor = [],
        _borderColor = [],
        _fontSize = [],
        _print,
        broadcast,
        filterParameters,
        isAnimationDisable = false,
        _notification = false;

    var _local_svg, _Local_data, _originalData, _localLabelStack = [], legendBreakCount = 1, yScale = d3.scaleLinear();
    var _localXAxis,
        _localYAxis,
        _localXGrid,
        _localYGrid;
    var parentWidth, parentHeight, plotWidth, plotHeight, container, tooltip;

    var x0 = d3.scaleBand(), x1 = d3.scaleBand(), _xDimensionGrid = d3.scaleLinear(), y = d3.scaleLinear();

    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 45
    };

    var tickLength = d3.scaleLinear()
        .domain([22, 34])
        .range([2, 4]);

    var legendSpace = 20, axisLabelSpace = 20, offsetX = 16, offsetY = 3, div;

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
        this.showGrid(config.showGrid);
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

        output += "<table><tr>"
            + "<th>" + chart.dimension() + ": </th>"
            + "<td>" + datum[chart.dimension()] + "</td>"
            + "</tr><tr>"
            + "<th>" + datum["measure"] + ": </th>"
            + "<td>" + datum[datum["measure"]] + "</td>"
            + "</tr></table>";

        return output;
    }

    var onLassoStart = function (lasso, scope) {
        return function () {
            if (filter) {
                lasso.items().selectAll('rect')
                    .classed('not_possible', true)
                    .classed('selected', false);
            }
        }
    }

    var onLassoDraw = function (lasso, scope) {
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

    var onLassoEnd = function (lasso, scope) {
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

            var confirm = d3.select(scope.node().parentNode).select('div.confirm')
                .style('visibility', 'visible')

            var _filter = [];
            if (data.length > 0) {
                var keys = UTIL.getMeasureList(data[0], _dimension);
                data.forEach(function (d) {
                    var obj = new Object();
                    obj[_dimension[0]] = d[_dimension[0]];
                    for (var index = 0; index < keys.length; index++) {
                        obj[keys[index]] = d[keys[index]];
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

                var _filterDimension = {};
                if (broadcast.filterSelection.id) {
                    _filterDimension = broadcast.filterSelection.filter;
                } else {
                    broadcast.filterSelection.id = $(div).attr('id');
                }
                var dimension = _dimension[0];

                _filterDimension[dimension] = filterData.map(function (d) {
                    return d[_dimension[0]];
                });

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
            var border = UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor)
            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, border, _notification);
            }
        }
    }

    var _handleMouseMoveFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                var border = UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor)
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me, border), container, border, _notification);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'default')
                .style('fill', function (d1, i) {
                    if (d1[d1.measure] < 0) {
                        return UTIL.getDisplayColor(_measure.indexOf(d1.measure), _displayColor);
                    }
                    else {
                        return UTIL.getDisplayColor(_measure.indexOf(d1.measure), _displayColor);
                    }
                })
                .style('stroke', function (d1, i) {
                    if (d1[d1.measure] < 0) {
                        return UTIL.getBorderColor(_measure.indexOf(d1.measure), _borderColor);
                    }
                    else {
                        return UTIL.getBorderColor(_measure.indexOf(d1.measure), _borderColor);
                    }
                });

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

    var setPlotPosition = function () {
        var position = 'translate(' + (_showYaxis == true ? margin.left : 0) + ', ' + parseInt(legendSpace * 2 + (20 * parseInt(legendBreakCount))) + ')';
        if (_legendPosition.toUpperCase() == 'TOP') {
            position = 'translate(' + (_showYaxis == true ? margin.left : 0) + ', ' + parseInt(legendSpace * 2 + (20 * parseInt(legendBreakCount))) + ')';
        } else if (_legendPosition.toUpperCase() == 'BOTTOM') {
            position = 'translate(' + margin.left + ', 0)';
        } else if (_legendPosition.toUpperCase() == 'LEFT') {
            position = 'translate(' + (legendSpace + margin.left + axisLabelSpace) + ', 0)';
        } else if (_legendPosition.toUpperCase() == 'RIGHT') {
            position = 'translate(' + margin.left + ', 0)';
        }

        if (!_showLegend) {
            _local_svg.select('.plot')
                .attr('transform', function () {
                    position = 'translate(' + margin.left + ', ' + 0 + ')';
                });
        }
        if (!_showXaxis && !_showLegend) {
            _local_svg.select('.plot')
                .attr('transform', function () {
                    position = 'translate(' + 0 + ', ' + 0 + ')';
                });
        }
        return position;
    }
    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {
            data = UTIL.sortingData(data, _dimension[0])
            _Local_data = _originalData = data;
            div = d3.select(this).node().parentNode;

            var svg = d3.select(this),
                width = +svg.attr('width'),
                height = +svg.attr('height');

            parentWidth = width - 2 * COMMON.PADDING - (_showYaxis == true ? margin.left : 0);
            parentHeight = (height - 2 * COMMON.PADDING - (_showXaxis == true ? axisLabelSpace * 2 : axisLabelSpace));

            container = svg.append('g')
                .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

            svg.attr('width', width)
                .attr('height', height)

            d3.select(div).append('div')
                .attr('class', 'sort_selection');

            d3.select(div).append('div')
                .attr('class', 'arrow-down');

            drawLegend.call(this);
            drawPlot.call(this, data);
        });

    }

    var drawLegend = function () {
        var legendWidth = 0,
            legendHeight = 0;

        plotWidth = parentWidth;
        plotHeight = parentHeight;
        _local_svg.select('.legend').remove();
        if (_showLegend) {
            var clusteredverticalbarLegend = LEGEND.bind(chart);

            var result = clusteredverticalbarLegend(_legendData, container, {
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

    var drawPlot = function (data) {
        var me = _local_svg;
        filterData = [];
        if (_tooltip) {
            tooltip = d3.select(div).select('.custom_tooltip');
        }
        var plot = container.append('g')
            .attr('class', 'clusteredverticalbar-plot')
            .classed('plot', true)
            .attr('transform', function () {
                return UTIL.setPlotPosition(_legendPosition, _showXaxis, _showYaxis, _showLegend, margin.left, legendSpace, legendBreakCount, axisLabelSpace, _local_svg);
            });

        var keys = UTIL.getMeasureList(data[0], _dimension);

        x0.rangeRound([0, plotWidth])
            .padding([0.2])
            .domain(data.map(function (d) { return d[_dimension[0]]; }));

        x1.padding([0.2])
            .domain(keys).rangeRound([0, x0.bandwidth()]);

        var range = UTIL.getMinMax(data, keys);

        y.rangeRound([plotHeight, 0])
            .domain([range[0], range[1]]);

        var _localXLabels = data.map(function (d) {
            return d[_dimension[0]];
        });

        _xDimensionGrid.domain([0, _localXLabels.length])
            .range([0, plotWidth]);

        _localXGrid = d3.axisBottom()
            .ticks(_localXLabels.length)
            .tickFormat('')
            .tickSize(-plotHeight);

        _localYGrid = d3.axisLeft()
            .tickFormat(function (d) {
                if (d == 0) {
                    _local_svg.selectAll('g.base_line').classed('base_line', false);
                    d3.select(this.parentNode).classed('base_line', true);
                    d3.select(this.parentNode).select('line').style('stroke', '#787878');
                }
            })
            .tickSize(-plotWidth);

        _localXGrid.scale(_xDimensionGrid);
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


        var cluster = plot.selectAll('.cluster')
            .data(data)
            .enter().append('g')
            .attr('class', 'cluster')
            .attr('transform', function (d) {
                return 'translate(' + x0(d[_dimension[0]]) + ', 0)';
            });

        var labelStack = []
        var clusteredverticalbar = cluster.selectAll('g.clusteredverticalbar')
            .data(function (d) {
                return keys.filter(function (m) {
                    return labelStack.indexOf(m) == -1;
                }).map(function (m) {
                    var obj = {};
                    obj[_dimension[0]] = d[_dimension[0]];
                    obj[m] = d[m];
                    obj['dimension'] = _dimension[0];
                    obj['measure'] = m;
                    return obj;
                });
            })
            .enter().append('g')
            .attr('class', 'clusteredverticalbar');

        var rect = drawViz(clusteredverticalbar, keys);

        /* Axes */
        var xAxisGroup,
            yAxisGroup;

        var isRotate = false;

        _localXAxis = d3.axisBottom(x0)
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
            .attr('visibility', UTIL.getVisibility(_showXaxis))
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

        _localYAxis = d3.axisLeft(y)
            .tickSize(0)
            .tickPadding(8)
            .tickFormat(function (d) {
                if ((plotHeight / y.ticks().length) < 11) {
                    return '';
                }
                return UTIL.getTruncatedTick(UTIL.shortScale(2)(d), margin.left - 8, tickLength);
            })

        yAxisGroup = plot.append('g')
            .attr('class', 'y axis')
            .attr('visibility', function () {
                return 'visible';
            })
            .attr('visibility', UTIL.getVisibility(_showYaxis))
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
            .attr('visibility', UTIL.getVisibility(_showYaxisLabel))
            .text(function () {
                return _displayNameForMeasure.map(function (p) { return p; }).join(', ');
            });

        _setAxisColor(yAxisGroup, _yAxisColor);

        if (!_print) {

            var confirm = $(_local_svg).parent().find('div.confirm')
                .css('visibility', 'hidden');

            _local_svg.attr('class', 'chartSvg_' + $(div).attr('id'));

            //remove Threshold popup icon
            // var AlertElement = UTIL.createAlertElement();
            // $(div).append(AlertElement);

            //remove Threshold modal popup 
            // var str = UTIL.createAlert($(div).attr('id'), _measure);
            // $('body').append(str);

            var _filter = UTIL.createFilterElement()
            $(div).append(_filter);

            $(document).on('click', plot, function (e) {
                if ($(div).find('.alert').prop('checked') == false) {
                    var element = e.target.classList.value.split(' ')
                    if (element.indexOf("chartSvg_" + $(div).attr('id')) >= 0) {
                        $('#Modal_' + $(div).attr('id') + ' .measure').val('')
                        $('#Modal_' + $(div).attr('id') + ' .threshold').val('')
                        $('#Modal_' + $(div).attr('id') + ' .measure').attr('disabled', false)
                        $('#Modal_' + $(div).attr('id')).modal('show');
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
            UTIL.sortingView(container, parentHeight, parentWidth + (_showYaxis == true ? margin.left : 0), legendBreakCount, axisLabelSpace, offsetX);

            _local_svg.select('g.sort').selectAll('text')
                .on('click', function () {
                    var order = d3.select(this).attr('class')
                    switch (order) {
                        case 'ascending':
                            UTIL.toggleSortSelection('ascending', drawPlot, _local_svg, keys, _Local_data);
                            break;
                        case 'descending':
                            UTIL.toggleSortSelection('descending', drawPlot, _local_svg, keys, _Local_data);
                            break;
                        case 'reset': {
                            $(_local_svg).parent().find('.sort_selection,.arrow-down').css('visibility', 'hidden');
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

            _local_svg.select('g.lasso').remove();

            var lasso = d3Lasso.lasso()
                .hoverSelect(true)
                .closePathSelect(true)
                .closePathDistance(100)
                .items(cluster)
                .targetArea(_local_svg);

            lasso.on('start', onLassoStart(lasso, _local_svg))
                .on('draw', onLassoDraw(lasso, _local_svg))
                .on('end', onLassoEnd(lasso, _local_svg));

            _local_svg.call(lasso);
        }
    }

    var drawViz = function (element, keys) {
        var rect;
        if (!_print) {
            rect = element.append('rect')
                .attr("height", function (d, i) {
                    if ((d[d.measure] === null) || (isNaN(d[d.measure]))) return 0;
                    return Math.abs(y(0) - y(d[d.measure]));
                })
                .attr("y", function (d, i) {
                    if ((d[d.measure] === null) || (isNaN(d[d.measure]))) {
                        return plotHeight;
                    } else if (d[d.measure] > 0) {
                        return y(d[d.measure]);
                    }

                    return y(0);
                })
                .attr("width", x1.bandwidth())
                .attr("x", function (d, i) {
                    return x1(d.measure);;
                })
                .attr('class', 'bar')
                .style('fill', function (d, i) {
                    if (d[d.measure] < 0) {
                        return UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor);
                    }
                    else {
                        return UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor);
                    }
                })
                .style('stroke', function (d, i) {
                    if (d[d.measure] < 0) {
                        return UTIL.getBorderColor(_measure.indexOf(d.measure), _borderColor);
                    }
                    else {
                        return UTIL.getBorderColor(_measure.indexOf(d.measure), _borderColor);
                    }
                })
                .style('opacity', 0)
                .style('stroke-width', 2);

            rect.transition()
                .duration(COMMON.DURATION)
                .style('opacity', 1)


        }
        else {
            rect = element.append('rect')
                .attr('class', 'bar')
                .style('fill', function (d, i) {
                    if (d[d.measure] < 0) {
                        return UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor);
                    }
                    else {
                        return UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor);
                    }
                })
                .style('stroke', function (d, i) {
                    if (d[d.measure] < 0) {
                        return UTIL.getBorderColor(_measure.indexOf(d1.measure), _borderColor);
                    }
                    else {
                        return UTIL.getBorderColor(_measure.indexOf(d1.measure), _borderColor);
                    }
                })
                .style('stroke-width', 2)
                .attr("height", function (d, i) {
                    if ((d[d.measure] === null) || (isNaN(d[d.measure]))) return 0;
                    return Math.abs(y(0) - y(d[d.measure]));
                })
                .attr("y", function (d, i) {
                    if ((d[d.measure] === null) || (isNaN(d[d.measure]))) {
                        return plotHeight;
                    } else if (d[d.measure] > 0) {
                        return y(d[d.measure]);
                    }

                    return y(0);
                })
                .attr("width", x1.bandwidth())
                .attr("x", function (d, i) {
                    return x1(d.measure);;
                })
        }
        if (!_print || _notification) {
            rect.on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
                .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
                .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
                .on('click', function (d) {
                    if (!_print) {
                        if ($(div).find('.alert').prop('checked') == true) {
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
                                return d[_dimension[0]] === d1[_dimension[0]]
                            })
                            var rect = d3.select(this);
                            if (rect.classed('selected')) {
                                rect.classed('selected', false);
                                filterData.map(function (val, i) {
                                    if (val[_dimension[0]] == d[_dimension[0]]) {
                                        filterData.splice(i, 1)
                                    }
                                })
                            } else {
                                rect.classed('selected', true);
                                var isExist = filterData.filter(function (val) {
                                    if (val[_dimension[0]] == d[_dimension[0]]) {
                                        return val
                                    }
                                })
                                if (isExist.length == 0) {
                                    filterData.push(_filter[0]);
                                }
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
                            _filterDimension[dimension] = filterData.map(function (d) {
                                return d[_dimension[0]];
                            });
                        } else {
                            _filterDimension[dimension] = [d[dimension]];
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
        var text = element.append('text')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d[d.measure], UTIL.getValueNumberFormat(i, _numberFormat));
            })
            .attr('y', function (d, i) {
                if ((d[d['measure']] === null) || (isNaN(d[d['measure']]))) {
                    return plotHeight;
                } else if (d[d['measure']] > 0) {
                    return y(d[d['measure']]);
                }

                return y(0);
            })
            .attr("x", function (d) {
                return x1(d.measure) + (x1.bandwidth() / 2);
            })
            .attr('dy', function (d, i) {
                return COMMON.OFFSET;
            })
            .style('text-anchor', 'middle')
            .attr('visibility', function (d, i) {
                return UTIL.getVisibility(_showValues[i]);
            })
            .style('font-style', function (d, i) {
                return _fontStyle[i];
            })
            .style('font-weight', function (d, i) {
                return _fontWeight[i];
            })
            .style('font-size', function (d, i) {
                return _fontSize[i] + 'px';
            })
            .style('fill', function (d, i) {
                return _textColor[i];
            })
            .attr('visibility', function (d, i) {
                var rect = d3.select(this.previousElementSibling).node(),
                    rectWidth = rect.getAttribute('width'),
                    rectHeight = rect.getAttribute('height');
                if (_notification) {
                    return 'hidden';
                }
                if (!_print) {
                    if (this.getAttribute('visibility') == 'hidden') return 'hidden';

                    if (rectHeight <= ((offsetX / 2) + parseFloat(d3.select(this).style('font-size').replace('px', '')))) {
                        return 'hidden';
                    }

                    if (this.getComputedTextLength() > parseFloat(rectWidth)) {
                        d3.select(this).style('font-size', '9px')
                        d3.select(this).attr('y', y(d[d.measure]) + 9);
                        if (this.getComputedTextLength() > parseFloat(rectWidth)) {
                            return 'hidden';
                        }
                    }
                }
                return 'visible';
            })

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

        plot.selectAll('g.clusteredverticalbar')
            .filter(function (d) {
                return d.measure === data;
            })
            .select('rect')
            .style('fill', COMMON.HIGHLIGHTER);
    }

    var _legendMouseMove = function (data, plot) {

    }

    var _legendMouseOut = function (data, plot) {
        plot.selectAll('g.clusteredverticalbar')
            .filter(function (d) {
                return d.measure === data;
            })
            .select('rect')
            .style('fill', function (d, i) {
                if (d[d.measure] < 0) {
                    return UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor);
                }
                else {
                    return UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor);
                }
            });
    }

    var _legendClick = function (data, plot) {
        var _filter = UTIL.getFilterData(_localLabelStack, data, _Local_data)
        drawPlot.call(this, _filter);
    }

    chart._getName = function () {
        return _NAME;
    }

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
    }

    chart.update = function (data) {

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

        data = UTIL.sortingData(data, _dimension[0])
        if (_tooltip) {
            tooltip = d3.select(div).select('.custom_tooltip');
        }
        var DURATION = COMMON.DURATION;
        if (isAnimationDisable) {
            DURATION = 0;
        }
        _Local_data = data;
        filterData = [];

        var keys = UTIL.getMeasureList(data[0], _dimension);

        var _localXLabels = data.map(function (d) {
            return d[_dimension[0]];
        });

        _xDimensionGrid.domain([0, _localXLabels.length]);

        x0.rangeRound([0, plotWidth])
            .padding([0.2])
            .domain(data.map(function (d) { return d[_dimension[0]]; }));

        x1.padding([0.2])
            .domain(keys).rangeRound([0, x0.bandwidth()]);

        var range = UTIL.getMinMax(data, keys);

        y.rangeRound([plotHeight, 0])
            .domain([range[0], range[1]]);

        var cluster = plot.selectAll("g.cluster")
            .data(data);

        cluster.enter().append('g')
            .attr('class', 'cluster')
            .attr('transform', function (d) {
                return 'translate(' + x0(d[_dimension[0]]) + ', 0)';
            });

        cluster.exit().remove();

        cluster = plot.selectAll('g.cluster');
        var labelStack = [];

        var clusteredverticalbar = cluster.selectAll('g.clusteredverticalbar')
            .data(function (d) {
                return keys.filter(function (m) {
                    return labelStack.indexOf(m) == -1;
                }).map(function (m) {
                    var obj = {};
                    obj[_dimension[0]] = d[_dimension[0]];
                    obj[m] = d[m];
                    obj['dimension'] = _dimension[0];
                    obj['measure'] = m;
                    return obj;
                });
            });

        clusteredverticalbar.select('rect')
            .attr("height", function (d, i) {
                if ((d[d.measure] === null) || (isNaN(d[d.measure]))) return 0;
                return Math.abs(y(0) - y(d[d.measure]));
            })
            .attr("y", function (d, i) {
                if ((d[d.measure] === null) || (isNaN(d[d.measure]))) {
                    return plotHeight;
                } else if (d[d.measure] > 0) {
                    return y(d[d.measure]);
                }

                return y(0);
            })
            .attr("width", x1.bandwidth())
            .attr("x", function (d, i) {
                return x1(d.measure);;
            })
            .attr('class', 'bar')
            .style('fill', function (d, i) {
                if (d[d.measure] < 0) {
                    return UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor);
                }
                else {
                    return UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor);
                }
            })
            .style('stroke', function (d, i) {
                if (d[d.measure] < 0) {
                    return UTIL.getBorderColor(_measure.indexOf(d.measure), _borderColor);
                }
                else {
                    return UTIL.getBorderColor(_measure.indexOf(d.measure), _borderColor);
                }
            })
            .style('opacity', 1)
            .style('stroke-width', 2)
            .transition()
            .duration(DURATION)
            .style('opacity', 1)

        var newBars = clusteredverticalbar.enter().append('g')
            .attr('class', 'clusteredverticalbar');

        drawViz(newBars, keys);

        clusteredverticalbar.select('text')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d[d.measure], UTIL.getValueNumberFormat(i, _numberFormat));
            })
            .attr('y', function (d, i) {
                if ((d[d['measure']] === null) || (isNaN(d[d['measure']]))) {
                    return plotHeight;
                } else if (d[d['measure']] > 0) {
                    return y(d[d['measure']]);
                }

                return y(0);
            })
            .attr("x", function (d) {
                return x1(d.measure) + (x1.bandwidth() / 2);
            })
            .attr('dy', function (d, i) {
                return COMMON.OFFSET;
            })
            .style('text-anchor', 'middle')
            .attr('visibility', function (d, i) {
                return UTIL.getVisibility(_showValues[i]);
            })
            .style('font-style', function (d, i) {
                return _fontStyle[i];
            })
            .style('font-weight', function (d, i) {
                return _fontWeight[i];
            })
            .style('font-size', function (d, i) {
                return _fontSize[i] + 'px';
            })
            .style('fill', function (d, i) {
                return _textColor[i];
            })
            .attr('visibility', function (d, i) {
                var rect = d3.select(this.previousElementSibling).node(),
                    rectWidth = rect.getAttribute('width'),
                    rectHeight = rect.getAttribute('height');
                if (_notification) {
                    return 'hidden';
                }
                if (!_print) {
                    if (this.getAttribute('visibility') == 'hidden') return 'hidden';

                    if (rectHeight <= ((offsetX / 2) + parseFloat(d3.select(this).style('font-size').replace('px', '')))) {
                        return 'hidden';
                    }

                    if (this.getComputedTextLength() > parseFloat(rectWidth)) {
                        d3.select(this).style('font-size', '9px')
                        d3.select(this).attr('y', y(d[d.measure]) + 9);
                        if (this.getComputedTextLength() > parseFloat(rectWidth)) {
                            return 'hidden';
                        }
                    }
                }
                return 'visible';
            })

        plot.selectAll('g.cluster')
            .attr('transform', function (d) {
                return 'translate(' + x0(d[_dimension[0]]) + ', 0)';
            });

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

        xAxisGroup = plot.select('.x.axis')
            .transition()
            .duration(COMMON.DURATION)
            .attr('visibility', UTIL.getVisibility(_showXaxis))
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


        yAxisGroup = plot.select('.y.axis')
            .transition()
            .duration(COMMON.DURATION)
            .attr('visibility', UTIL.getVisibility(_showYaxis))
            .call(_localYAxis);

        _setAxisColor(yAxisGroup, _yAxisColor);


        /* Update Axes Grid */
        _localXGrid.ticks(_localXLabels.length);

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

        _local_svg.select('g.lasso').remove();

        var lasso = d3Lasso.lasso()
            .hoverSelect(true)
            .closePathSelect(true)
            .closePathDistance(100)
            .items(cluster)
            .targetArea(_local_svg);

        lasso.on('start', onLassoStart(lasso, _local_svg))
            .on('draw', onLassoDraw(lasso, _local_svg))
            .on('end', onLassoEnd(lasso, _local_svg));

        _local_svg.call(lasso);

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

    chart.showGrid = function (value) {
        if (!arguments.length) {
            return _showGrid;
        }
        _showGrid = value;
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

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    }

    chart.showValues = function (value, measure) {
        return UTIL.baseAccessor.call(_showValues, value, measure, _measure, chart);
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

    chart.displayColor = function (value, measure) {
        return UTIL.baseAccessor.call(_displayColor, value, measure, _measure, chart);
    }

    chart.borderColor = function (value, measure) {
        return UTIL.baseAccessor.call(_borderColor, value, measure, _measure, chart);
    }

    chart.fontSize = function (value, measure) {
        return UTIL.baseAccessor.call(_fontSize, value, measure, _measure, chart);
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

    return chart;
}

module.exports = clusteredverticalbar;