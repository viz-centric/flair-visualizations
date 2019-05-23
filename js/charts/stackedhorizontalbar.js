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
        _notification = false;;

    var _local_svg, _Local_data, _originalData, _localLabelStack = [], legendBreakCount = 1;
    var legendSpace = 20, axisLabelSpace = 20, offsetX = 16, offsetY = 3, div;
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
            + "<td>" + datum.data[datum.key] + "</td>"
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

            var confirm = $(scope).parent().find('div.confirm')
                .css('visibility', 'visible');

            var _filter = [];
            var keys = UTIL.getMeasureList(data[0].data, _dimension);
            if (data.length > 0) {
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
                var idWidget = broadcast.updateWidget[scope.parentElement.id];
                broadcast.updateWidget = {};
                broadcast.updateWidget[scope.parentElement.id] = idWidget;

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
                .style('fill', function (d1, i) {
                    return UTIL.getDisplayColor(_measure.indexOf(d1.key), _displayColor);
                })
                .style('stroke', function (d1, i) {
                    return UTIL.getBorderColor(_measure.indexOf(d1.key), _borderColor);
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

            svg.attr('width', width)
                .attr('height', height)

            d3.select(div).append('div')
                .attr('class', 'sort_selection');

            d3.select(div).append('div')
                .attr('class', 'arrow-down');

            container = svg.append('g')
                .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

            var legendWidth = 0,
                legendHeight = 0;

            plotWidth = parentWidth;
            plotHeight = parentHeight;

            if (_showLegend) {
                var stackedhorizontalbarLegend = LEGEND.bind(chart);

                var result = stackedhorizontalbarLegend(_legendData, container, {
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
                            return 'translate(' + (parentWidth + axisLabelSpace) + ', ' + i * 20 + ')';
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

    var drawViz = function (element) {
        var me = this;
        var rect;
        if (!_print) {
            rect = element.append('rect')
                .style('fill', function (d, i) {
                    return UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor);
                })
                .style('stroke', function (d, i) {
                    return UTIL.getBorderColor(_measure.indexOf(d.key), _borderColor);
                })
                .attr("y", function (d) {
                    return x(d.data[_dimension[0]]);
                })
                .attr("x", function (d) {
                    return (d[0] < d[1]) ? (y(d[0]) + 1) : (y(d[1]) + 1);
                })
                .attr("width", function (d) {
                    return 0;
                })
                .attr("height", x.bandwidth())
                .style('stroke-width', 2)

            rect.transition()
                .duration(COMMON.DURATION)
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
                .on('end', setValueOnPoints);
        }
        else {
            rect = element.append('rect')
                .style('fill', function (d, i) {
                    return UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor);
                })
                .style('stroke', function (d, i) {
                    return UTIL.getBorderColor(_measure.indexOf(d.key), _borderColor);
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
            setValueOnPoints()
        }

        if (!_print || _notification) {
            rect.on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
                .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
                .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
                .on('click', function (d) {
                    if (!_print) {
                        if ($("#myonoffswitch").prop('checked') == false) {
                            $('#Modal_' + $(div).attr('id') + ' .measure').val(d.key);
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
                                broadcast.filterSelection.id = $(div).attr('id');
                            }
                            var dimension = _dimension[0];
                            if (_filterDimension[dimension]) {
                                _filterDimension[dimension] = filterData.map(function (d) {
                                    return d[_dimension[0]];
                                });
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
                    }

                })
        }

        function setValueOnPoints() {
            element.append('text')
                .text(function (d, i) {
                    return UTIL.getFormattedValue(d.data[d.key], UTIL.getValueNumberFormat(_measure.indexOf(d.key), _numberFormat));
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
                .attr('visibility', function (d, i) {
                    var rect = d3.select(this.previousElementSibling).node(),
                        rectWidth = rect.getAttribute('width'),
                        rectHeight = rect.getAttribute('height');
                    if (_notification) {
                        return 'hidden';
                    }
                    if (!_print) {
                        if (this.getAttribute('visibility') == 'hidden') return 'hidden';

                        if (rectHeight <= parseFloat(d3.select(this).style('font-size').replace('px', ''))) {
                            return 'hidden';
                        }

                        if ((this.getComputedTextLength() + (offsetX / 4)) > parseFloat(rectWidth)) {
                            return 'hidden';
                        }
                    }

                    return 'visible';
                })
                .style('font-style', function (d, i) {
                    return _fontStyle[_measure.indexOf(d.key)];
                })
                .style('font-weight', function (d, i) {
                    return _fontWeight[_measure.indexOf(d.key)];
                })
                .style('font-size', function (d, i) {
                    return _fontSize[_measure.indexOf(d.key)] + 'px';
                })
                .style('fill', function (d, i) {
                    return _textColor[_measure.indexOf(d.key)];
                });
        }
    }
    var drawPlot = function (data) {
        var me = this;
        _Local_data = data;

        var plot = container.append('g')
            .attr('class', 'stackedhorizontalbar-plot')
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

        var keys = UTIL.getMeasureList(data[0], _dimension);

        for (i = 0; i < data.length; i++) {
            var t = 0;
            for (j = 0; j < keys.length; j++) {
                t = parseInt(t) + parseInt(data[i][keys[j]]);
            }
            data[i].total = t;
        }

        x.rangeRound([0, plotHeight])
            .padding([0.5])
            .domain(data.map(function (d) { return d[_dimension[0]]; }));

        y.rangeRound([0, plotWidth])
            .domain([0, d3.max(data, function (d) {
                return d.total;
            })]).nice();

        data.map(function (val) {
            delete val['total'];
        })

        _localYGrid = d3.axisBottom()
            .tickFormat('')
            .tickSize(-plotHeight);

        _localXGrid = d3.axisLeft()
            .tickFormat('')
            .tickSize(-plotWidth);

        _localXGrid.scale(x);
        _localYGrid.scale(y);

        plot.append('g')
            .attr('class', 'x grid')
            .attr('visibility', function () {
                return _showGrid ? 'visible' : 'hidden';
            })
            .call(_localXGrid);

        plot.append('g')
            .attr('class', 'y grid')
            .attr('visibility', function () {
                return _showGrid ? 'visible' : 'hidden';
            })
            .attr('transform', 'translate(0, ' + plotHeight + ')')
            .call(_localYGrid);

        var stack = plot.append('g')
            .attr('class', 'stack')
            .selectAll('g')
            .data(d3.stack().keys(keys)(data))
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
        if (_showXaxis) {
            _localXAxis = d3.axisBottom(y)
                .tickFormat(function (d) {
                    var format = d3.format(".0s")
                    return this.textContent || format(d);
                })
            // .tickSize(0)
            // .tickPadding(10);

            xAxisGroup = plot.append('g')
                .attr('class', 'x axis')
                .attr('visibility', function () {
                    return _showXaxis;
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

            _setAxisColor(xAxisGroup, _xAxisColor);
        }

        if (_showYaxis) {
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
                .attr('class', 'y axis')
                .attr('visibility', _showYaxis)
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

            _setAxisColor(yAxisGroup, _yAxisColor);
        }

        if (!_print) {

            var confirm = $(me).parent().find('div.confirm')
                .css('visibility', 'hidden');

            //remove Threshold modal popup 
            // var str = UTIL.createAlert($(div).attr('id'), _measure);
            // $(div).append(str);

            var _filter = UTIL.createFilterElement()
            $(div).append(_filter);

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
                .items(stackedhorizontalbar)
                .targetArea(_local_svg);

            lasso.on('start', onLassoStart(lasso, me))
                .on('draw', onLassoDraw(lasso, me))
                .on('end', onLassoEnd(lasso, me));

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
                return UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor);
            });
    }

    var _legendClick = function (data) {
        var _filter = UTIL.getFilterData(_localLabelStack, data, _originalData)
        drawPlot.call(this, _filter);
    }

    chart.update = function (data) {
        var DURATION = COMMON.DURATION;
        if (isAnimationDisable) {
            DURATION = 0;
        }
        _Local_data = data;
        filterData = [];

        var keys = UTIL.getMeasureList(data[0], _dimension);
        for (i = 0; i < data.length; i++) {
            var t = 0;
            for (j = 0; j < keys.length; j++) {
                t = parseInt(t) + parseInt(data[i][keys[j]]);
            }
            data[i].total = t;
        }

        x.domain(data.map(function (d) { return d[_dimension[0]]; }));
        y.domain([0, d3.max(data, function (d) {
            return d.total;
        })]).nice();

        data.map(function (val) {
            delete val['total'];
        })

        var plot = _local_svg.select('.plot')

        var stack = plot.select('g.stack').selectAll('g.stackedhorizontalbar-group')
            .data(d3.stack().keys(keys)(data))

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
            .attr("y", function (d) {
                return x(d.data[_dimension[0]]);
            })
            .attr("x", function (d) {
                return (d[0] < d[1]) ? (y(d[0]) + 1) : (y(d[1]) + 1);
            })
            .attr("width", 0)
            .classed('selected', false)
            .classed('possible', false)
            .attr("height", x.bandwidth())
            .style('stroke-width', 2)
            .transition()
            .duration(DURATION)
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

        stackedhorizontalbar.select('text')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d.data[d.key], UTIL.getValueNumberFormat(_measure.indexOf(d.key), _numberFormat));
            })
            .attr('x', function (d, i) {
                return y(d[1]) - 20;
            })
            .attr('y', function (d, i) {
                return x(d.data[_dimension[0]]) + x.bandwidth() / 2;
            })
            .attr('dy', function (d, i) {
                return offsetX / 2;
            })
            .style('text-anchor', 'middle')
            .attr('visibility', function (d, i) {
                return UTIL.getVisibility(_showValues[_measure.indexOf(d.key)]);
            })
            .attr('visibility', function (d, i) {
                if (this.getAttribute('visibility') == 'hidden') return 'hidden';
                var rect = d3.select(this.previousElementSibling).node(),
                    rectWidth = rect.getAttribute('width'),
                    rectHeight = rect.getAttribute('height');

                if (rectHeight <= parseFloat(d3.select(this).style('font-size').replace('px', ''))) {
                    return 'hidden';
                }
                if ((this.getComputedTextLength() + (offsetX / 4)) > parseFloat(rectWidth)) {
                    return 'hidden';
                }
                return 'visible';
            })

        var newBars = stackedhorizontalbar.enter().append('g')
            .attr('class', 'stackedhorizontalbar');

        drawViz(newBars);

        _localXGrid.scale(x);
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

        var xAxisGroup,
            yAxisGroup;

        xAxisGroup = plot.select('.x.axis')
            .transition()
            .duration(COMMON.DURATION)
            .call(_localXAxis);

        _setAxisColor(xAxisGroup, _xAxisColor);

        yAxisGroup = plot.select('.y.axis')
            .transition()
            .duration(COMMON.DURATION)
            .call(_localYAxis);

        _setAxisColor(yAxisGroup, _yAxisColor);

        UTIL.displayThreshold(threshold, data, keys);

        _local_svg.select('g.lasso').remove()

        var lasso = d3Lasso.lasso()
            .hoverSelect(true)
            .closePathSelect(true)
            .closePathDistance(100)
            .items(stackedhorizontalbar)
            .targetArea(_local_svg);

        lasso.on('start', onLassoStart(lasso, div))
            .on('draw', onLassoDraw(lasso, div))
            .on('end', onLassoEnd(lasso, div));

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
    return chart;
}

module.exports = stackedhorizontalbar;
