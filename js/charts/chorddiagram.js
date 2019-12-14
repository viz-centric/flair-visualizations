var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var UTIL = require('../extras/util.js')();
var LEGEND = require('../extras/legend_barcharts.js')();
var viz = require('../../d3-libs/viz.js');
try {
    var d3Lasso = require("d3-lasso");
} catch (ex) { }

function chorddiagram() {
    var _NAME = 'chorddiagram';

    var _config,
        _dimension,
        _measure,
        _tooltip,
        _showLabels,
        _fontStyle,
        _fontWeight,
        _numberFormat,
        _labelColor,
        _colorPattern,
        _fontSize,
        _print,
        broadcast,
        filterParameters,
        isLiveEnabled = false,
        _notification = false,
        _data;

    var _local_svg, _Local_data, _originalData, _localLabelStack = [], parentContainer;

    var colors = UTIL.defaultColours();

    var gradientColor = d3.scaleLinear();

    var filter = false, filterData = [];

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.showLabels(config.showLabels);
        this.colorPattern(config.colorPattern);
        this.showLabels(config.showLabels);
        this.labelColor(config.labelColor);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        this.numberFormat(config.numberFormat);
        this.fontSize(config.fontSize);
    }

    var _buildTooltipData = function (datum, data) {
        var output = "";

        var _filter = _local_svg.selectAll('.chord')
            .filter(function (d1) {
                return (d1.source == datum.source || d1.target == datum.source)
            })
        output += "<table>";
        for (let index = 0; index < _filter.data().length; index++) {
            if (_filter.data()[index].value > 0) {
                output += "<tr>";
                output += "<td>" + _filter.data()[index].source + "</td><td>" + _filter.data()[index].target + "</td><td>" + _filter.data()[index].value + "</td>";
                output += "</tr>";
            }
        }
        output += "</table > ";

        return output;
    }

    var onLassoStart = function (lasso, scope) {
        return function () {
            if (filter) {
                lasso.items().selectAll('path')
                    .classed('not_possible', true)
                    .classed('selected', false);
            }
        }
    }

    var onLassoDraw = function (lasso, scope) {
        return function () {
            filter = true;
            lasso.items().selectAll('path')
                .classed('selected', false);

            lasso.possibleItems().selectAll('path')
                .classed('not_possible', false)
                .classed('possible', true);

            lasso.notPossibleItems().selectAll('path')
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
                lasso.items().selectAll('path')
                    .classed('not_possible', false)
                    .classed('possible', false);
            }

            lasso.selectedItems().selectAll('path')
                .classed('selected', true)

            lasso.notSelectedItems().selectAll('path');

            d3.select(scope.node().parentNode).select('div.confirm')
                .style('visibility', 'visible')

            var _filter = [];
            if (data.length > 0) {
                data.forEach(function (d) {
                    _filter.push(d.source)
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

                var _filterDimension = {};
                if (broadcast.filterSelection.id) {
                    _filterDimension = broadcast.filterSelection.filter;
                } else {
                    broadcast.filterSelection.id = parentContainer.attr('id');
                }
                var dimension = _dimension[0];

                _filterDimension[dimension] = _filter;

                broadcast.filterSelection.filter = _filterDimension;
                var _filterParameters = filterParameters.get();
                _filterParameters[dimension] = _filterDimension[dimension];
                filterParameters.save(_filterParameters);
            }
        }
    }


    var applyFilter = function () {
        return function () {
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

            var filter = container.selectAll('.chord')
                .filter(function (d1) {
                    return !(d1.source == d.source || d1.target == d.source)
                })

            filter.selectAll('path').style('opacity', 0);

            var border = d3.select(this).select('path').style('fill');
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
                var border = d3.select(this).select('path').style('fill');
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, border);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {

        return function (d, i) {
            var filter = container.selectAll('.chord')
                .filter(function (d1) {
                    return !(d1.source == d.source || d1.target == d.source)
                })

            filter.selectAll('path').style('opacity', 0.8);

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }

    function chart(selection) {
        var data = _Local_data = _originalData = _data;

        var me = this;

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

        parentContainer.append('div')
            .attr('class', 'custom_tooltip');

        _local_svg = svg;

        svg.selectAll('g').remove();

        if (_tooltip) {
            tooltip = parentContainer.select('.custom_tooltip');
        }

        svg = svg.attr('width', width)
            .attr('height', height);

        var outerRadius = Math.min(width, height) * 0.5 - 15,
            innerRadius = outerRadius - 20;

        var _keys = [],
            chorddata = [];

        var gdata = []

        data.map(function (val) {
            _keys.push(val[_dimension[0]]);
            _keys.push(val[_dimension[1]]);
        });

        _keys = _keys.filter(function (item, i, ar) {
            return ar.indexOf(item) === i;
        });

        for (var index = 0; index < _keys.length; index++) {
            filterData = data.filter(function (val) {
                if (_keys[index] == val[_dimension[0]] || _keys[index] == val[_dimension[1]]) {
                    return val;
                }
            })
            var arr = new Object();
            arr["key"] = _keys[index];
            arr["value"] = d3.sum(filterData.map(function (d) {
                return d[_measure];
            }));
            gdata.push(arr)

        }

        gradientColor.range([
            d3.rgb(colors[0]).brighter(),
            d3.rgb(colors[0]).darker()
        ])

        gradientColor.domain(d3.extent(gdata, function (d) {
            return d["value"];
        }));

        data.map(function (val) {
            var arr = []
            arr.push(val[_dimension[0]])
            arr.push(val[_dimension[1]])
            arr.push(val[_measure])
            chorddata.push(arr)
        })

        function sort(a, b) { return d3.ascending(sortOrder.indexOf(a), sortOrder.indexOf(b)); }

        var sortOrder = _keys.sort();
        var i = 0;
        var ch = viz.ch().data(chorddata)
            .padding(.01)
            .sort(sort)
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .duration(_print == true ? 0 : 1000)
            .chordOpacity(0.8)
            .labelPadding(.03)
            .fill(function (d) {
                if (_colorPattern == "unique_color") {
                    return colors[sortOrder.indexOf(d)] != undefined ? colors[sortOrder.indexOf(d)] : UTIL.getUniqueColour(sortOrder.indexOf(d));
                    //    return colors[sortOrder.indexOf(d)];
                }
                else if (_colorPattern == "single_color") {
                    return colors[0];
                }
                else if (_colorPattern == 'gradient_color') {
                    var value = gdata.filter(function (val) {
                        if (val["key"] == d) {
                            return val;
                        }
                    })
                    return gradientColor(value[0].value);
                }

            });

        svg.append("g")
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
            .attr('class', 'plot')
            .call(ch);

        var groups = parentContainer.selectAll('.groups')

        groups.selectAll('text')
            .style('fill', _labelColor)
            .style('visibility', UTIL.getVisibility(_showLabels))
            .style('font-size', _fontSize)
            .style('font-style', _fontStyle)
            .style('font-weight', _fontWeight)

        if (!_print) {
            var _filter = UTIL.createFilterElement()
            $('#' + parentContainer.attr('id')).append(_filter);

            parentContainer.select('.filterData')
                .on('click', applyFilter());

            parentContainer.select('.removeFilter')
                .on('click', clearFilter(parentContainer));

            groups
                .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
                .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
                .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
                .on('click', function (d, i) {
                    if (isLiveEnabled) {
                        broadcast.$broadcast('FlairBi:livemode-dialog');
                        return;
                    }
                    parentContainer.select('.confirm')
                        .style('visibility', 'visible');
                    filter = false;

                    var point = d3.select(this).select('path');
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
                        if (temp.indexOf(d.source) < 0) {
                            temp.push(d.source);
                        } else {
                            temp.splice(temp.indexOf(d.source), 1);
                        }
                        _filterDimension[dimension] = temp;
                    } else {
                        _filterDimension[dimension] = [d.source];
                    }

                    var idWidget = broadcast.updateWidget[parentContainer.attr('id')];
                    broadcast.updateWidget = {};
                    broadcast.updateWidget[parentContainer.attr('id')] = idWidget;
                    broadcast.filterSelection.filter = _filterDimension;
                    var _filterParameters = filterParameters.get();
                    _filterParameters[dimension] = _filterDimension[dimension];
                    filterParameters.save(_filterParameters);
                });

            _local_svg.select('g.lasso').remove()

            var lasso = d3Lasso.lasso()
                .hoverSelect(true)
                .closePathSelect(true)
                .closePathDistance(100)
                .items(groups)
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
                _legendClick(data);
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

    var _legendClick = function (data) {
        var _filter = UTIL.getFilterData(_localLabelStack, data, _Local_data)
        drawPlot.call(this, _filter);
    }

    chart._getName = function () {
        return _NAME;
    }

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
    }

    chart.update = function (data, filterConfig) {

        var svg = _local_svg
            .attr('width', parentContainer.attr('width'))
            .attr('height', parentContainer.attr('height'))

        width = +svg.attr('width'),
            height = +svg.attr('height');

        if (_tooltip) {
            tooltip = parentContainer.select('.custom_tooltip');
        }

        _local_svg.selectAll('.plot g').remove();
        var plot = _local_svg.selectAll('.plot');

        var outerRadius = Math.min(width, height) * 0.5 - 15,
            innerRadius = outerRadius - 20;

        var _keys = [],
            chorddata = [];

        var gdata = []

        data.map(function (val) {
            _keys.push(val[_dimension[0]]);
            _keys.push(val[_dimension[1]]);
        });

        _keys = _keys.filter(function (item, i, ar) {
            return ar.indexOf(item) === i;
        });

        for (var index = 0; index < _keys.length; index++) {
            filterData = data.filter(function (val) {
                if (_keys[index] == val[_dimension[0]] || _keys[index] == val[_dimension[1]]) {
                    return val;
                }
            })
            var arr = new Object();
            arr["key"] = _keys[index];
            arr["value"] = d3.sum(filterData.map(function (d) {
                return d[_measure];
            }));
            gdata.push(arr)

        }

        gradientColor.range([
            d3.rgb(colors[0]).brighter(),
            d3.rgb(colors[0]).darker()
        ])

        gradientColor.domain(d3.extent(gdata, function (d) {
            return d["value"];
        }));
        data.map(function (val) {
            var arr = []
            arr.push(val[_dimension[0]])
            arr.push(val[_dimension[1]])
            arr.push(val[_measure])
            chorddata.push(arr)
        })

        function sort(a, b) { return d3.ascending(sortOrder.indexOf(a), sortOrder.indexOf(b)); }

        var sortOrder = _keys.sort();

        var i = 0;
        var ch = viz.ch().data(chorddata)
            .padding(.01)
            .sort(sort)
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .duration(1000)
            .chordOpacity(0.8)
            .labelPadding(.03)
            .fill(function (d) {
                if (_colorPattern == "unique_color") {
                    return colors[sortOrder.indexOf(d)] != undefined ? colors[sortOrder.indexOf(d)] : UTIL.getUniqueColour(sortOrder.indexOf(d));
                }
                else if (_colorPattern == "single_color") {
                    return colors[0];
                }
                else if (_colorPattern == 'gradient_color') {
                    var value = gdata.filter(function (val) {
                        if (val["key"] == d) {
                            return val;
                        }
                    })
                    return gradientColor(value[0].value);
                }

            });

        plot.call(ch);

        parentContainer.selectAll('.groups text')
            .style('fill', _labelColor)
            .style('visibility', UTIL.getVisibility(_showLabels))
            .style('font-size', _fontSize)
            .style('font-style', _fontStyle)
            .style('font-weight', _fontWeight)

        parentContainer.selectAll('.groups')
            .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
            .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
            .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))

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

    chart.showLabels = function (value) {
        if (!arguments.length) {
            return _showLabels;
        }
        _showLabels = value;
        return chart;
    }

    chart.fontSize = function (value) {
        if (!arguments.length) {
            return _fontSize;
        }
        _fontSize = value;
        return chart;
    }

    chart.fontStyle = function (value) {
        if (!arguments.length) {
            return _fontSize;
        }
        _fontSize = value;
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

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    }
    chart.colorPattern = function (value) {
        if (!arguments.length) {
            return _colorPattern;
        }
        _colorPattern = value;
        return chart;
    }
    chart.labelColor = function (value) {
        if (!arguments.length) {
            return _labelColor;
        }
        _labelColor = value;
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
    chart.isFilterGrid = function (value) {
        if (!arguments.length) {
            return _isFilterGrid;
        }
        _isFilterGrid = value;
        return chart;
    }
    return chart;
}

module.exports = chorddiagram;