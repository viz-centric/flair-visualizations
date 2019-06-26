var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var UTIL = require('../extras/util.js')();
var LEGEND = require('../extras/legend_barcharts.js')();

try {
    var d3Lasso = require("d3-lasso");

} catch (ex) { }

function stackedhorizontalbar() {

    var _NAME = 'stackedhorizontalbar';

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
        _notification = false,
        _data;

    var _local_svg, _Local_data, _originalData, _localLabelStack = [], legendBreakCount = 1;
    var legendSpace = 20, axisLabelSpace = 20, offsetX = 16, offsetY = 3, parentContainer;
    var parentWidth, parentHeight, plotWidth, plotHeight, container;
    var _localXAxis,
        _localYAxis,
        _localXGrid,
        _localYGrid;

    var x = d3.scaleBand(), y = d3.scaleLinear();

    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 45
    };

    var filter = false, filterData = [];
    var threshold = [];
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
        this.showGrid(config.showGrid);
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
            + "<td>" + datum.data[_dimension[0]] + "</td>"
            + "</tr><tr>"
            + "<th>" + datum.key + ": </th>"
            + "<td>" + UTIL.getFormattedValue(datum.data[datum.key], UTIL.getValueNumberFormat(_measure.indexOf(datum.key), _numberFormat, datum.data[datum.key])) + " </td>"
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
                var keys = UTIL.getMeasureList(data[0].data, _dimension);
                data.forEach(function (d) {
                    var obj = new Object();
                    var temp = d.data[_dimension[0]];
                    var searchObj = _filter.find(o => o[_dimension[0]] === temp);
                    if (searchObj == undefined) {
                        obj[_dimension[0]] = d.data[_dimension[0]];
                        for (var index = 0; index < keys.length; index++) {
                            obj[keys[index]] = d.data[keys[index]];
                        }
                        _filter.push(obj)
                    }
                });
            }
            else {
                filterData = []
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
                    broadcast.filterSelection.id = parentContainer.attr('id');
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
            parentContainer.select('.confirm')
                .style('visibility', 'hidden');
        }
    }
    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'pointer')
                .style('cursor', 'pointer')
                .style('fill', COMMON.HIGHLIGHTER);
            var border = UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor)
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
                var border = UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor)
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me, border), container, border, _notification);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'default')
                .style('fill', function (d, i) {
                    if (d.data[d.key] < 0) {
                        return UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor);
                    }
                    else {
                        return UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor);
                    }
                })
                .style('stroke', function (d, i) {
                    if (d.data[d.key] < 0) {
                        return UTIL.getBorderColor(_measure.indexOf(d.key), _borderColor);
                    }
                    else {
                        return UTIL.getBorderColor(_measure.indexOf(d.key), _borderColor);
                    }
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

    function chart(selection) {
        data = UTIL.sortingData(_data, _dimension[0])
        _Local_data = _originalData = data;
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

        _local_svg = svg;

        parentWidth = width - 2 * COMMON.PADDING - (_showYaxis == true ? margin.left : 0);
        parentHeight = (height - 2 * COMMON.PADDING - (_showXaxis == true ? axisLabelSpace * 2 : axisLabelSpace));

        container = svg.append('g')
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

    var drawViz = function (element) {
        var me = this;
        var rect;
        if (!_print) {
            rect = element.append('rect')
                .style('fill', function (d, i) {
                    if (d.data[d.key] < 0) {
                        return UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor);
                    }
                    else {
                        return UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor);
                    }
                })
                .style('stroke', function (d, i) {
                    if (d.data[d.key] < 0) {
                        return UTIL.getBorderColor(_measure.indexOf(d.key), _borderColor);
                    }
                    else {
                        return UTIL.getBorderColor(_measure.indexOf(d.key), _borderColor);
                    }
                })
                .attr("y", function (d) {
                    return x(d.data[_dimension[0]]);
                })
                .attr("x", function (d) {
                    return (d[0] < d[1]) ? (y(d[0]) + 1) : (y(d[1]) + 1);
                })
                .attr("width", function (d) {
                    return Math.abs(y(d[1]) - y(d[0]));
                })
                .attr("height", x.bandwidth())
                .style('opacity', 0)
                .style('stroke-width', 2)

            rect.transition()
                .duration(COMMON.DURATION)
                .style('opacity', 1)

        }
        else {
            rect = element.append('rect')
                .style('fill', function (d, i) {
                    if (d.data[d.key] < 0) {
                        return UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor);
                    }
                    else {
                        return UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor);
                    }
                })
                .style('stroke', function (d, i) {
                    if (d.data[d.key] < 0) {
                        return UTIL.getBorderColor(_measure.indexOf(d.key), _borderColor);
                    }
                    else {
                        return UTIL.getBorderColor(_measure.indexOf(d.key), _borderColor);
                    }
                })
                .attr("y", function (d) {
                    return x(d.data[_dimension[0]]);
                })
                .attr("x", function (d) {
                    return (d[0] < d[1]) ? (y(d[0]) + 1) : (y(d[1]) + 1);
                })
                .attr("width", function (d) {
                    return Math.abs(y(d[1]) - y(d[0]));
                })
                .attr("height", x.bandwidth())
                .style('stroke-width', 2)

        }

        if (!_print || _notification) {
            rect.on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
                .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
                .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
                .on('click', function (d) {
                    if (!_print) {
                        if ($("#myonoffswitch").prop('checked') == false) {
                            $('#Modal_' + parentContainer.attr('id') + ' .measure').val(d.key);
                            $('#Modal_' + parentContainer.attr('id') + ' .threshold').val('');
                            $('#Modal_' + parentContainer.attr('id') + ' .measure').attr('disabled', true);;
                            $('#Modal_' + parentContainer.attr('id')).modal('toggle');
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


        element.append('text')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d.data[d.key], UTIL.getValueNumberFormat(_measure.indexOf(d.key), _numberFormat, d.data[d.key]));
            })
            .attr('x', function (d, i) {
                return y(d[1]) - 20;
            })
            .attr('y', function (d, i) {
                return x(d.data[_dimension[0]]) + x.bandwidth() / 2;
            })
            .attr('dy', function (d, i) {
                return offsetX / 4;
            })
            .style('text-anchor', 'middle')
            .attr('visibility', function (d, i) {
                return UTIL.getVisibility(_showValues[_measure.indexOf(d.key)]);
            })
            .style('font-size', function (d, i) {
                return _fontSize[_measure.indexOf(d.key)] + 'px';
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

                    if (parseInt(rectHeight) < parseInt(_fontSize[i])) {
                        d3.select(this).style('font-size', parseInt(rectHeight) - 2 + 'px')
                        d3.select(this).attr('x', function (d, i) {
                            return y(d[1]) - 20;
                        })
                    }
                    if ((this.getComputedTextLength()) > parseFloat(rectWidth)) {
                        return 'hidden';
                    }
                }
            })
            .style('font-style', function (d, i) {
                return _fontStyle[_measure.indexOf(d.key)];
            })
            .style('font-weight', function (d, i) {
                return _fontWeight[_measure.indexOf(d.key)];
            })
            .style('fill', function (d, i) {
                return _textColor[_measure.indexOf(d.key)];
            });

    }
    var drawPlot = function (data) {
        var me = this,
            labelStack = [];
        if (_tooltip) {
            tooltip = parentContainer.select('.custom_tooltip');
        }
        var plot = container.append('g')
            .attr('class', 'stackedhorizontalbar-plot')
            .classed('plot', true)
            .attr('transform', function () {
                return UTIL.setPlotPosition(_legendPosition, _showXaxis, _showYaxis, _showLegend, margin.left, legendSpace, legendBreakCount, axisLabelSpace, _local_svg);
            });

        var keys = UTIL.getMeasureList(data[0], _dimension);

        x.rangeRound([0, plotHeight])
            .padding([0.5])
            .domain(data.map(function (d) { return d[_dimension[0]]; }));

        var range = UTIL.getMinMax(data, keys);

        y.rangeRound([0, plotWidth])
            .domain([range[0], range[1]])
            .nice();

        // var _yTicks = y.ticks(),
        //     yDiff = _yTicks[1] - _yTicks[0],
        //     correctionVal = 15;

        // if ((_yTicks[_yTicks.length - 1] + yDiff) > range[1] + correctionVal) {
        //     y.domain([range[0], (_yTicks[_yTicks.length - 1] + yDiff)])
        // } else {
        //     y.domain([range[0], (_yTicks[_yTicks.length - 1] + 2 * yDiff)])
        // }

        var posTotal,
            negTotal;

        data.forEach(function (d) {
            posTotal = 0;
            negTotal = 0;
            keys.forEach(function (m) {
                d[m] = +d[m];
                if (d[m] >= 0) {
                    posTotal += d[m];
                } else {
                    negTotal += d[m];
                }
            });
            d.posTotal = posTotal;
            d.negTotal = negTotal;
        });

        y.domain([
            d3.min(data, function (d) { return d.negTotal; }),
            d3.max(data, function (d) { return d.posTotal; })
        ]).nice();

        // var _yTicks = y.ticks(),
        //     yDiff = _yTicks[1] - _yTicks[0];

        // y.domain([range[0], (_yTicks[_yTicks.length - 1] + yDiff)])

        data.map(function (val) {
            delete val['negTotal'];
            delete val['posTotal'];
        })

        _localYGrid = d3.axisBottom()
            .tickFormat(function (d) {
                UTIL.setAxisGridVisibility(this, _local_svg, _showGrid, d)
            })
            .tickSize(-plotHeight);

        _localXGrid = d3.axisLeft()
            .tickFormat('')
            .tickSize(-plotWidth);

        _localXGrid.scale(x);
        _localYGrid.scale(y);

        plot.append('g')
            .attr('class', 'x grid')
            .attr('visibility', UTIL.getVisibility(_showGrid))
            .call(_localXGrid);

        plot.append('g')
            .attr('class', 'y grid')
            .attr('visibility', 'visible')
            .attr('transform', 'translate(0, ' + plotHeight + ')')
            .call(_localYGrid);

        var stack = plot.append('g')
            .attr('class', 'stack')
            .selectAll('g')
            .data(d3.stack()
                .keys(keys.filter(function (d) {
                    return labelStack.indexOf(d) == -1;
                }))
                .offset(d3.stackOffsetDiverging)(data)
            )
            .enter().append('g')
            .attr('class', 'stackedhorizontalbar-group');

        var stackedhorizontalbar = stack.selectAll('g')
            .data(function (d, i) {
                d.forEach(function (datum) {
                    datum.key = d.key;
                })
                return d;
            })
            .enter().append('g')
            .attr('class', 'stackedhorizontalbar');

        drawViz(stackedhorizontalbar);

        var xAxisGroup,
            yAxisGroup;

        _localXAxis = d3.axisBottom(y)
            .tickFormat(function (d) {
                var format = d3.format(".0s")
                return this.textContent || format(d);
            })
        // .tickSize(0)
        // .tickPadding(10);

        xAxisGroup = plot.append('g')
            .attr('class', 'x_axis')
            .attr('transform', 'translate(0, ' + plotHeight + ')')
            .attr('visibility', 'visible')
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

        _localYAxis = d3.axisLeft(x)
            .tickSize(0)
            .tickFormat(function (d) {
                if (d.length > 3) {
                    return d.substring(0, 3) + '...';
                }
                return d;
            })
            .tickPadding(8)

        yAxisGroup = plot.append('g')
            .attr('class', 'y_axis')
            .attr('visibility', 'visible')
            .call(_localYAxis);

        yAxisGroup.append('g')
            .attr('class', 'label')
            .attr('transform', function () {
                return 'translate(' + (-margin.left) + ', ' + (plotHeight / 2) + ')';
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

            var confirm = $(me).parent().find('div.confirm')
                .css('visibility', 'hidden');

            //remove Threshold modal popup 
            // var str = UTIL.createAlert(parentContainer.attr('id'), _measure);
            // $(parentContainer).append(str);

            var _filter = UTIL.createFilterElement()
            $('#' + parentContainer.attr('id')).append(_filter);

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
                            $(me).parent().find('.sort_selection,.arrow-down').css('visibility', 'hidden');
                            _local_svg.select('.plot').remove()
                            drawPlot.call(me, _Local_data);
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
                .items(stackedhorizontalbar)
                .targetArea(_local_svg);

            lasso.on('start', onLassoStart(lasso, _local_svg))
                .on('draw', onLassoDraw(lasso, _local_svg))
                .on('end', onLassoEnd(lasso, _local_svg));

            _local_svg.call(lasso);
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

        d3.selectAll('g.stackedhorizontalbar')
            .filter(function (d) {
                return d.key === data;
            })
            .select('rect')
            .style('fill', COMMON.HIGHLIGHTER);
    }

    var _legendMouseMove = function (data, plot) {

    }

    var _legendMouseOut = function (data, plot) {
        d3.selectAll('g.stackedhorizontalbar')
            .filter(function (d) {
                return d.key === data;
            })
            .select('rect')
            .style('fill', function (d, i) {
                if (d.data[d.key] < 0) {
                    return UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor);
                }
                else {
                    return UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor);
                }
            })

    }

    var _legendClick = function (data) {
        var _filter = UTIL.getFilterData(_localLabelStack, data, _Local_data)
        drawPlot.call(this, _filter);
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

        data = UTIL.sortingData(data, _dimension[0]);
        var labelStack = [];
        if (_tooltip) {
            tooltip = parentContainer.select('.custom_tooltip');
        }
        var DURATION = COMMON.DURATION;
        if (isAnimationDisable) {
            DURATION = 0;
        }
        _Local_data = data;
        filterData = [];

        var keys = UTIL.getMeasureList(data[0], _dimension);

        x.rangeRound([0, plotHeight])
            .padding([0.5])
            .domain(data.map(function (d) { return d[_dimension[0]]; }));

        var range = UTIL.getMinMax(data, keys);

        y.rangeRound([0, plotWidth])
            .domain([range[0], range[1]])
            .nice();

        // var _yTicks = y.ticks(),
        //     yDiff = _yTicks[1] - _yTicks[0],
        //     correctionVal = 15;

        // if ((_yTicks[_yTicks.length - 1] + yDiff) > range[1] + correctionVal) {
        //     y.domain([range[0], (_yTicks[_yTicks.length - 1] + yDiff)])
        // } else {
        //     y.domain([range[0], (_yTicks[_yTicks.length - 1] + 2 * yDiff)])
        // }

        var posTotal,
            negTotal;

        data.forEach(function (d) {
            posTotal = 0;
            negTotal = 0;
            keys.forEach(function (m) {
                d[m] = +d[m];
                if (d[m] >= 0) {
                    posTotal += d[m];
                } else {
                    negTotal += d[m];
                }
            });
            d.posTotal = posTotal;
            d.negTotal = negTotal;
        });

        y.domain([
            d3.min(data, function (d) { return d.negTotal; }),
            d3.max(data, function (d) { return d.posTotal; })
        ]).nice();

        // var _yTicks = y.ticks(),
        //     yDiff = _yTicks[1] - _yTicks[0];

        // y.domain([range[0], (_yTicks[_yTicks.length - 1] + yDiff)]);

        data.map(function (val) {
            delete val['negTotal'];
            delete val['posTotal'];
        })

        var stack = plot.select('g.stack').selectAll('g.stackedhorizontalbar-group')
            .data(d3.stack()
                .keys(keys.filter(function (d) {
                    return labelStack.indexOf(d) == -1;
                }))
                .offset(d3.stackOffsetDiverging)(data)
            )

        stack.enter().append('g')
            .attr('class', 'stackedhorizontalbar-group');

        stack.exit().remove();

        var stackedhorizontalbarGroup = plot.select('g.stack').selectAll('g.stackedhorizontalbar-group');

        var stackedhorizontalbar = stackedhorizontalbarGroup.selectAll('g.stackedhorizontalbar')
            .data(function (d, i) {
                d.forEach(function (datum) {
                    datum.key = d.key;
                })
                return d;
            });

        stackedhorizontalbar.exit().remove();

        stackedhorizontalbar.select('rect')
            .style('fill', function (d, i) {
                if (d.data[d.key] < 0) {
                    return UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor);
                }
                else {
                    return UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor);
                }
            })
            .style('stroke', function (d, i) {
                if (d.data[d.key] < 0) {
                    return UTIL.getBorderColor(_measure.indexOf(d.key), _borderColor);
                }
                else {
                    return UTIL.getBorderColor(_measure.indexOf(d.key), _borderColor);
                }
            })
            .attr("y", function (d) {
                return x(d.data[_dimension[0]]);
            })
            .attr("x", function (d) {
                return (d[0] < d[1]) ? (y(d[0]) + 1) : (y(d[1]) + 1);
            })
            .attr("width", function (d) {
                return Math.abs(y(d[1]) - y(d[0]));
            })
            .attr("height", x.bandwidth())
            .style('opacity', 0)
            .style('stroke-width', 2)
            .transition()
            .duration(DURATION)
            .style('opacity', 1)

        stackedhorizontalbar.select('text')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d.data[d.key], UTIL.getValueNumberFormat(_measure.indexOf(d.key), _numberFormat, d.data[d.key]));
            })
            .attr('x', function (d, i) {
                return y(d[1]) - 20;
            })
            .attr('y', function (d, i) {
                return x(d.data[_dimension[0]]) + x.bandwidth() / 2;
            })
            .attr('dy', function (d, i) {
                return offsetX / 4;
            })
            .style('text-anchor', 'middle')
            .attr('visibility', function (d, i) {
                return UTIL.getVisibility(_showValues[_measure.indexOf(d.key)]);
            })
            .style('font-size', function (d, i) {
                return _fontSize[_measure.indexOf(d.key)] + 'px';
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

                    if (parseInt(rectHeight) < parseInt(_fontSize[i])) {
                        d3.select(this).style('font-size', parseInt(rectHeight) - 2 + 'px')
                        d3.select(this).attr('x', function (d, i) {
                            return y(d[1]) - 20;
                        })
                    }
                    if ((this.getComputedTextLength()) > parseFloat(rectWidth)) {
                        return 'hidden';
                    }
                }
            })



        var newBars = stackedhorizontalbar.enter().append('g')
            .attr('class', 'stackedhorizontalbar');

        drawViz(newBars);

        _localXGrid.scale(x);
        _localYGrid.scale(y);

        plot.select('.x.grid')
            .transition()
            .duration(COMMON.DURATION)
            .attr('visibility', UTIL.getVisibility(_showGrid))
            .call(_localXGrid);

        plot.select('.y.grid')
            .attr('transform', 'translate(0, ' + plotHeight + ')')
            .transition()
            .duration(COMMON.DURATION)
            .attr('visibility', 'visible')
            .call(_localYGrid);

        var xAxisGroup,
            yAxisGroup;

        xAxisGroup = plot.select('.x_axis')
            .attr('transform', 'translate(0, ' + plotHeight + ')')
            .transition()
            .duration(COMMON.DURATION)
            .attr('visibility', 'visible')
            .call(_localXAxis);

        yAxisGroup = plot.select('.y_axis')
            .transition()
            .duration(COMMON.DURATION)
            .attr('visibility', 'visible')
            .call(_localYAxis);

        UTIL.setAxisColor(_xAxisColor, _showXaxis, _yAxisColor, _showYaxis, _local_svg);

        UTIL.displayThreshold(threshold, data, keys);

        _local_svg.select('g.lasso').remove()

        var lasso = d3Lasso.lasso()
            .hoverSelect(true)
            .closePathSelect(true)
            .closePathDistance(100)
            .items(stackedhorizontalbar)
            .targetArea(_local_svg);

        lasso.on('start', onLassoStart(lasso, _local_svg))
            .on('draw', onLassoDraw(lasso, _local_svg))
            .on('end', onLassoEnd(lasso, _local_svg));

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

module.exports = stackedhorizontalbar;
