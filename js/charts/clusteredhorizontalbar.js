var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var UTIL = require('../extras/util.js')();
var LEGEND = require('../extras/legend_barcharts.js')();
var $ = require("jquery");
var d3Lasso = require("d3-lasso");

function clusteredhorizontalbar() {

    var _NAME = 'clusteredhorizontalbar';

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
        _print;

    var _local_svg, _Local_data, _originalData, _localLabelStack = [], legendBreakCount = 1;

    var parentWidth, parentHeight, plotWidth, plotHeight, container;
    var _localXAxis,
        _localYAxis,
        _localXGrid,
        _localYGrid;

    var x0, x1, _xDimensionGrid = d3.scaleLinear(), y;
    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 45
    };

    var tickLength = d3.scaleLinear()
        .domain([22, 34])
        .range([4, 6]);

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

            var confirm = $(scope).parent().find('div.confirm')
                .css('visibility', 'visible');

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
            if (_filter.length > 0) {
                filterData = _filter;
            }
        }
    }

    var applyFilter = function () {
        return function () {
            if (filterData.length > 0) {
                chart.update(filterData);
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
            var border = UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor)
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
                var border = UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor)
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me, border), container, border);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'default')
                .style('fill', function (d1, i) {
                    return UTIL.getDisplayColor(_measure.indexOf(d1.measure), _displayColor);
                })
                .style('stroke', function (d1, i) {
                    return UTIL.getBorderColor(_measure.indexOf(d1.measure), _borderColor);
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
            _Local_data = _originalData = data;
            var margin = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 45
            };

            div = d3.select(this).node().parentNode;

            var _local_svg = d3.select(this),
                width = div.clientWidth,
                height = div.clientHeight;

            parentWidth = width - 2 * COMMON.PADDING - margin.left;
            parentHeight = (height - 2 * COMMON.PADDING - axisLabelSpace * 2);

            _local_svg.attr('width', width)
                .attr('height', height)

            d3.select(div).append('div')
                .attr('class', 'sort_selection');

            d3.select(div).append('div')
                .attr('class', 'arrow-down');

            var str = UTIL.createAlert($(div).attr('id'), _measure);
            $(div).append(str);

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


            container = _local_svg.append('g')
                .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

            var legendWidth = 0,
                legendHeight = 0;

            plotWidth = parentWidth;
            plotHeight = parentHeight;

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

                switch (_legendPosition) {
                    case 'Top':
                        plotHeight = parentHeight - legendHeight - axisLabelSpace;
                        break;
                    case 'Bottom':
                        plotHeight = parentHeight - legendHeight - axisLabelSpace * 2;
                        break;
                    case 'Right':
                    case 'Left':
                        plotWidth = parentWidth - legendWidth;
                        break;
                }

                if ((_legendPosition == 'Top') || (_legendPosition == 'Bottom')) {
                    plotWidth = parentWidth;
                    plotHeight = parentHeight - 3 * axisLabelSpace;
                    legendSpace = 20;
                } else if ((_legendPosition == 'Left') || (_legendPosition == 'Right')) {
                    var legend = _local_svg.selectAll('.item');
                    legendSpace = legend.node().parentNode.getBBox().width;
                    plotWidth = (parentWidth - legendSpace) - margin.left + axisLabelSpace;
                    plotHeight = parentHeight;

                    legend.attr('transform', function (d, i) {
                        if (_legendPosition == 'Left') {
                            return 'translate(0, ' + i * 20 + ')';

                        }
                        else if (_legendPosition == 'Right') {
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

            if (_tooltip) {
                tooltip = d3.select(this.parentNode).select('#tooltip');
            }

            drawPlot.call(this, data);
        });

    }

    var drawPlot = function (data) {
        var me = this;
        _Local_data = data;

        var confirm = $(me).parent().find('div.confirm')
            .css('visibility', 'hidden');

        x0 = d3.scaleBand()
            .rangeRound([plotHeight, 0])
            .paddingInner(0.1)
            .padding([0.1]);

        x1 = d3.scaleBand()
            .padding(0.2);

        y = d3.scaleLinear()
            .rangeRound([0, plotWidth]);

        var plot = container.append('g')
            .attr('class', 'clusteredhorizontalbar-plot')
            .classed('plot', true)
            .attr('transform', function () {
                if (_legendPosition == 'Top') {
                    return 'translate(' + margin.left + ', ' + parseInt(legendSpace * 2 + (20 * parseInt(legendBreakCount))) + ')';
                } else if (_legendPosition == 'Bottom') {
                    return 'translate(' + margin.left + ', 0)';
                } else if (_legendPosition == 'Left') {
                    return 'translate(' + (legendSpace + margin.left + axisLabelSpace) + ', 0)';
                } else if (_legendPosition == 'Right') {
                    return 'translate(' + margin.left + ', 0)';
                }
            });

        if (!_showLegend) {
            _local_svg.select('.plot')
                .attr('transform', function () {
                    return 'translate(' + margin.left + ', ' + 0 + ')';
                });
        }

        var keys = UTIL.getMeasureList(data[0], _dimension);

        x0.domain(data.map(function (d) { return d[_dimension[0]]; }));
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(data, function (d) {
            return d3.max(keys, function (key) {
                return parseInt(d[key]);
            });
        })]).nice();

        _localYGrid = d3.axisBottom()
            .tickFormat('')
            .tickSize(-plotHeight);

        _localXGrid = d3.axisLeft()
            .tickFormat('')
            .tickSize(-plotWidth);

        _localXGrid.scale(x0);
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

        var cluster = plot.selectAll('.cluster')
            .data(data)
            .enter().append('g')
            .attr('class', 'cluster')
            .attr('transform', function (d) {
                return 'translate(0,' + x0(d[_dimension[0]]) + ')';
            });

        var labelStack = []
        var clusteredhorizontalbar = cluster.selectAll('g.clusteredhorizontalbar')
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
            .attr('class', 'clusteredhorizontalbar');


        drawViz(clusteredhorizontalbar);

        /* Axes */
        var xAxisGroup,
            yAxisGroup;

        _localXAxis = d3.axisBottom(y)
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
                return 'translate(' + (plotWidth) + ', ' + (COMMON.AXIS_THICKNESS / 1.5) + ')';
            })
            .append('text')
            .style('text-anchor', 'end')
            .style('font-weight', 'bold')
            .style('fill', _xAxisColor)
            .attr('visibility', function () {
                return _showXaxisLabel;
            })
            .text(_displayName);

        _setAxisColor(xAxisGroup, _xAxisColor);

        _localYAxis = d3.axisLeft(x0)
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
                return 'translate(' + (-margin.left) + ', ' + (0) + ')';
            })
            .append('text')
            .attr('transform', 'rotate(-90)')
            .style('text-anchor', 'end')
            .style('font-weight', 'bold')
            .style('fill', _yAxisColor)
            .attr('visibility', _showYaxisLabel)
            .text(function () {
                return _displayNameForMeasure.map(function (p) { return p; }).join(', ');
            });

        _setAxisColor(yAxisGroup, _yAxisColor);

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
            }
            );

        d3.select(div).select('.filterData')
            .on('click', applyFilter());

        d3.select(div).select('.removeFilter')
            .on('click', clearFilter(div));

        _local_svg.select('g.lasso').remove()

        var lasso = d3Lasso.lasso()
            .hoverSelect(true)
            .closePathSelect(true)
            .closePathDistance(100)
            .items(cluster)
            .targetArea(_local_svg);

        lasso.on('start', onLassoStart(lasso, me))
            .on('draw', onLassoDraw(lasso, me))
            .on('end', onLassoEnd(lasso, me));

        _local_svg.call(lasso);
    }

    var drawViz = function (element) {
        var me = this;
        if (!_print) {

            element.append('rect')
                .attr("y", function (d) {
                    return x1(d.measure);
                })
                .attr("x", 1)
                .attr("height", x1.bandwidth())
                .attr("width", function (d) {
                    return 0;
                })
                .style('fill', function (d, i) {
                    return UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor);
                })
                .style('stroke', function (d, i) {
                    return UTIL.getBorderColor(_measure.indexOf(d.measure), _borderColor);
                })
                .style('stroke-width', 2)
                .transition()
                .duration(COMMON.DURATION)
                .attr("y", function (d) {
                    return x1(d.measure);
                })
                .attr("x", 1)
                .attr("height", x1.bandwidth())
                .attr("width", function (d) {
                    return y(d[d.measure]);
                })

            element.on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
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
                })
        }
        else {
            element.append('rect')
                .style('fill', function (d, i) {
                    return UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor);
                })
                .style('stroke', function (d, i) {
                    return UTIL.getBorderColor(_measure.indexOf(d.measure), _borderColor);
                })
                .style('stroke-width', 2)
                .attr("y", function (d) {
                    return x1(d.measure);
                })
                .attr("x", 1)
                .attr("height", x1.bandwidth())
                .attr("width", function (d) {
                    return y(d[d.measure]);
                })
        }

        element.append('text')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d[d.measure], UTIL.getValueNumberFormat(i, _numberFormat));
            })
            .attr('x', function (d, i) {
                return y(d[d.measure]) + 20;
            })
            .attr('y', function (d, i) {
                return x1(d['measure']);
            })
            .attr('dx', function (d, i) {
                return offsetX / 8;
            })
            .attr('dy', function (d, i) {
                return x1.bandwidth() / 2 + d3.select(this).style('font-size').replace('px', '') / 2.5;
            })
            .style('text-anchor', 'middle')
            .attr('visibility', function (d, i) {
                return UTIL.getVisibility(_showValues[i]);
            })
            .attr('visibility', function (d, i) {
                var rect = d3.select(this.previousElementSibling).node(),
                    rectWidth = rect.getAttribute('width'),
                    rectHeight = rect.getAttribute('height');

                if (this.getAttribute('visibility') == 'hidden') return 'hidden';

                if ((this.getComputedTextLength() + (offsetX / 2)) > parseFloat(plotWidth - rectWidth)) {
                    return 'hidden';
                }

                if (parseInt(rectHeight) < parseInt(_fontSize[i])) {
                    return 'hidden';
                }
                return 'visible';
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
            });
    }
    /**
     * Builds the html data for the tooltip
     *
     * @param {object} datum Datum forming the arc
     * @param {function} chart Pie chart function
     * @return {string} String encoded HTML data
     */
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

    chart._getName = function () {
        return _NAME;
    }

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
    }

    var _legendMouseOver = function (data, plot) {

        d3.selectAll('g.clusteredhorizontalbar')
            .filter(function (d) {
                return d.measure === data;
            })
            .select('rect')
            .style('fill', COMMON.HIGHLIGHTER);
    }

    var _legendMouseMove = function (data, plot) {

    }

    var _legendMouseOut = function (data, plot) {
        d3.selectAll('g.clusteredhorizontalbar')
            .filter(function (d) {
                return d.measure === data;
            })
            .select('rect')
            .style('fill', function (d, i) {
                return UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor);
            });
    }

    var _legendClick = function (data) {
        var _filter = UTIL.getFilterData(_localLabelStack, data, _originalData)
        drawPlot.call(this, _filter);
    }

    chart.update = function (data) {

        _Local_data = data,
            filterData = [];

        x0 = d3.scaleBand()
            .rangeRound([plotHeight, 0])
            .paddingInner(0.1)
            .padding([0.1]);

        x1 = d3.scaleBand()
            .padding(0.2);

        y = d3.scaleLinear()
            .rangeRound([0, plotWidth]);

        var keys = UTIL.getMeasureList(data[0], _dimension);

        x0.domain(data.map(function (d) { return d[_dimension[0]]; }));
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(data, function (d) {
            return d3.max(keys, function (key) {
                return parseInt(d[key]);
            });
        })]).nice();

        var plot = _local_svg.select('.plot')
        var cluster = plot.selectAll("g.cluster")
            .data(data);

        cluster.enter().append('g')
            .attr('class', 'cluster')
            .attr('transform', function (d) {
                return 'translate(0, ' + x0(d[_dimension[0]]) + ')';
            });

        cluster.exit().remove();

        cluster = plot.selectAll('g.cluster');
        var labelStack = [];
        var clusteredhorizontalbar = cluster.selectAll('g.clusteredhorizontalbar')
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

        clusteredhorizontalbar.select('rect')
            .attr("x", 1)
            .attr("y", function (d) {
                return x1(d.measure);
            })
            .attr("height", x1.bandwidth())
            .attr("width", function (d) {
                return y(d[d.measure]);
            })
            .attr('class', '')

        clusteredhorizontalbar.select('text')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d[d.measure], UTIL.getValueNumberFormat(i, _numberFormat));
            })
            .attr('x', function (d, i) {
                return y(d[d.measure]) + 20;
            })
            .attr('y', function (d, i) {
                return x1(d['measure']);
            })
            .attr('dy', function (d, i) {
                return x1.bandwidth() / 2 + d3.select(this).style('font-size').replace('px', '') / 2.5;
            })
            .attr('visibility', function (d, i) {
                return UTIL.getVisibility(_showValues[i]);
            })
            .attr('visibility', function (d, i) {
                var rect = d3.select(this.previousElementSibling).node(),
                    rectWidth = rect.getAttribute('width'),
                    rectHeight = rect.getAttribute('height');

                if (this.getAttribute('visibility') == 'hidden') return 'hidden';

                if ((this.getComputedTextLength() + (offsetX / 2)) > parseFloat(plotWidth - rectWidth)) {
                    return 'hidden';
                }

                if (parseInt(rectHeight) < parseInt(_fontSize[i])) {
                    return 'hidden';
                }
                return 'visible';
            })

        var newBars = clusteredhorizontalbar.enter().append('g')
            .attr('class', 'clusteredhorizontalbar');

        drawViz(newBars);

        plot.selectAll('g.cluster')
            .attr('transform', function (d) {
                return 'translate(0, ' + x0(d[_dimension[0]]) + ')';
            });

        _localXGrid.scale(x0);
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
            .call(d3.axisBottom(y));

        _setAxisColor(xAxisGroup, _xAxisColor);

        yAxisGroup = plot.select('.y.axis')
            .transition()
            .duration(COMMON.DURATION)
            .call(d3.axisLeft(x0).ticks(null, "s")
                .tickFormat(function (d) {
                    if (d.length > 3) {
                        return d.substring(0, 3) + '...';
                    }
                    return d;
                }));

        _setAxisColor(yAxisGroup, _yAxisColor);

        UTIL.setAxisColor(_local_svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis);
        UTIL.displayThreshold(threshold, data, keys);

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

    chart.stacked = function (value) {
        if (!arguments.length) {
            return _stacked;
        }
        _stacked = value;
        return chart;
    }
    chart.showGrid = function (value) {
        if (!arguments.length) {
            return _showGrid;
        }

        _showGrid = value;
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

    return chart;
}

module.exports = clusteredhorizontalbar;