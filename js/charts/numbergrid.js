var d3 = require('d3');
var UTIL = require('../extras/util.js')();

function numbergrid() {
    var _NAME = 'numbergrid';

    var _config,
        _dimension,
        _measure,
        _sort,
        _tooltip,
        _print,
        broadcast,
        filterParameters,
        _measureDisplayName,
        _showLabel,
        _fontSize,
        _fontStyle,
        _fontWeight,
        _fontColor,
        _fontSizeforDisplayName,
        _colorSet = [],
        _notification = false,
        isLiveEnabled = false,
        _data;

    var _local_svg, _Local_data, tooltip, parentContainer;

    var m = 10, r = 50, h, w;

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.tooltip(config.tooltip);
        this.showLabel(config.showLabel);
        this.fontSize(config.fontSize);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        this.fontColor(config.fontColor);
        this.measureDisplayName(config.measureDisplayName);
        this.fontSizeforDisplayName(config.fontSizeforDisplayName);
        this.colorSet(config.colorSet);
    }

    var _buildTooltipData = function (datum, data) {
        var output = "";

        var filter = _local_svg.selectAll('.chord')
            .filter(function (d1) {
                return (d1.source == datum.source || d1.target == datum.source)
            })
        output += "<table>";
        for (let index = 0; index < filter.data().length; index++) {
            if (filter.data()[index].value > 0) {
                output += "<tr>";
                output += "<td>" + filter.data()[index].source + "</td><td>" + filter.data()[index].target + "</td><td>" + filter.data()[index].value + "</td>";
                output += "</tr>";
            }
        }
        output += "</table > ";

        return output;
    }

    var applyFilter = function () {
        return function () {
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
            parentContainer.select('.confirm')
                .style('visibility', 'hidden');
        }
    }

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {

            filter = container.selectAll('.chord')
                .filter(function (d1) {
                    return !(d1.source == d.source || d1.target == d.source)
                })

            filter.selectAll('path').style('opacity', 0);

            var border = d3.select(this).attr('fill')
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
                var border = d3.select(this).attr('fill')
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, border);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        return function (d, i) {
            filter = container.selectAll('.chord')
                .filter(function (d1) {
                    return !(d1.source == d.source || d1.target == d.source)
                })

            filter.selectAll('path').style('opacity', 0.8);

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }

    var addText = function (svg) {
        svg.append('text')
            .text(function (d) {
                var value = UTIL.getFormattedValue(d[_measure], UTIL.getNumberFormatterFn('Actual', d[_measure]));
                return value;
            })
            .attr('y', (r + m) / 2)
            .attr('x', 10)
            .style('fill', _fontColor)
            .style('font-size', _fontSize + 'px')
            .style('font-weight', _fontWeight)
            .style('font-style', _fontStyle)

        svg.append('text')
            .text(function (d) {
                return d[_dimension];
            })
            .attr('y', (r + m) - 10)
            .attr('x', 10)
            .style('fill', _fontColor)
            .style('font-size', _fontSizeforDisplayName + 'px')
            .style('font-weight', _fontWeight)
            .style('font-style', _fontStyle)
            .text(function (d, i) {
                if (!_print) {
                    return UTIL.getTruncatedLabel(
                        this,
                        d[_dimension],
                        parseFloat((w + m) * 2) - 20)
                }
                else {
                    return d[_dimension].substring(0, 4);
                }
            })
    }

    function setRadius(width, height) {
        var w = r + (r / 3);
        var h = w / 2;

        var innerBoxWidth = (w + 25);
        var innerBoxHeight = (h + 25);

        var columns = width / innerBoxWidth;
        var rows = height / innerBoxHeight;
        columns = parseInt(columns);
        rows = parseInt(rows);

        if (_data.length > (columns * rows)) {
            r = r - 2;
            setRadius(width, height);
        }
        return parseInt(r);
    }

    function chart(selection) {

        data = UTIL.sortingData(_data, _dimension[0])
        _Local_data = _originalData = data;

        UTIL.sorter(_Local_data, _measure, -1);
        var me = this;

        if (_print && !_notification) {
            parentContainer = selection;
        }
        else {
            parentContainer = d3.select('#' + selection.id)
        }

        var width = parentContainer.attr('width'),
            height = parentContainer.attr('height');

        var area = width * height
        var RR = area / (data.length + 1);
        r = Math.sqrt(RR);
        r = (r - 25) / 2;

        r = setRadius(width, height);
        // var h = r - (r / 2);
        w = r + (r / 3);
        h = w / 2;
        var svg = parentContainer.selectAll("svg")
            .data(data)
            .enter().append("svg")
            .attr("class", function (d, i) {
                return i;
            })
            .attr("width", (w + m) * 2)
            .attr("height", (h + m) * 1.7)
            .append("g")
            .attr("transform", "translate(" + (0) + "," + (0) + ")");

        var rect = svg.selectAll("g")
            .data(d3.pie())
            .enter().append("rect")
            .attr("width", (w + m) * 2)
            .attr("height", (h + m) * 1.7)
            .style('fill', function (d, i) {
                var path = d3.select(this.parentNode)
                var index = d3.select(path.node().parentElement).attr('class')
                return _colorSet[parseInt(index)] != undefined ? _colorSet[parseInt(index)] : UTIL.getUniqueColour(index);
            })
            .style('stroke', '#FFFFFF')
            .attr("rx", 10)
            .attr("ry", 10)
            .style('stroke-width', '5px');

        addText(svg);

        if (!_print) {
            $(me).parent().find('div.confirm')
                .css('visibility', 'hidden');

            var _filter = UTIL.createFilterElement()
            $('#' + parentContainer.attr('id')).append(_filter);

            rect.on('mouseover', _handleMouseOverFn.call(chart, tooltip, parentContainer))
                .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, parentContainer))
                .on('mouseout', _handleMouseOutFn.call(chart, tooltip, parentContainer))
                .on('click', function (d) {
                    if (isLiveEnabled) {
                        broadcast.$broadcast('FlairBi:livemode-dialog');
                        return;
                    }
                    var path = d3.select(this.parentNode)
                    var index = parseInt(d3.select(path.node().parentElement).attr('class'))

                    parentContainer.select('.confirm')
                        .style('visibility', 'visible');

                    var point = d3.select(this);
                    if (point.classed('_selected')) {
                        point.classed('_selected', false);
                        point.style('fill-opacity', 1);
                    } else {
                        point.classed('_selected', true);
                        point.style('fill-opacity', 0.5);
                    }

                    var _filterDimension = {};
                    if (broadcast.filterSelection.id) {
                        _filterDimension = broadcast.filterSelection.filter;
                    } else {
                        broadcast.filterSelection.id = parentContainer.attr('id');
                    }
                    var dimension = _dimension;
                    if (_filterDimension[dimension]) {
                        var temp = _filterDimension[dimension];
                        if (temp.indexOf(_Local_data[index][_dimension]) < 0) {
                            temp.push(_Local_data[index][_dimension]);
                        } else {
                            temp.splice(temp.indexOf(_Local_data[index][_dimension]), 1);
                        }
                        _filterDimension[dimension] = temp;
                    } else {
                        _filterDimension[dimension] = [_Local_data[index][_dimension]];
                    }

                    var idWidget = broadcast.updateWidget[parentContainer.attr('id')];
                    broadcast.updateWidget = {};
                    broadcast.updateWidget[parentContainer.attr('id')] = idWidget;
                    broadcast.filterSelection.filter = _filterDimension;
                    var _filterParameters = filterParameters.get();
                    _filterParameters[dimension] = _filterDimension[dimension];
                    filterParameters.save(_filterParameters);
                });

            parentContainer.select('.filterData')
                .on('click', applyFilter());

            parentContainer.select('.removeFilter')
                .on('click', clearFilter(parentContainer));
        }

    }
    chart._getName = function () {
        return _NAME;
    }

    chart._getHTML = function () {
        return parentContainer.node().outerHTML;
    }

    chart.update = function (data, filterConfig) {

        var width = parentContainer.attr('width'),
            height = parentContainer.attr('height');

        r = 50;

        var area = width * height
        var RR = area / (data.length + 1);
        r = Math.sqrt(RR);
        r = (r - 25) / 2;

        r = setRadius(width, height);
        // var h = r - (r / 2);
        w = r + (r / 3);
        h = w / 2;

        UTIL.sorter(data, _measure, -1);

        parentContainer.selectAll("svg").remove();

        var svg = parentContainer.selectAll("svg")
            .data(data)
            .enter().append("svg")
            .attr("class", function (d, i) {
                return i;
            })
            .attr("width", (w + m) * 2)
            .attr("height", (h + m) * 1.7)
            .append("g")
            .attr("transform", "translate(" + (0) + "," + (0) + ")");

        var rect = svg.selectAll("g")
            .data(d3.pie())
            .enter().append("rect")
            .attr("width", (w + m) * 2)
            .attr("height", (h + m) * 1.7)
            .style('fill', function (d, i) {
                var path = d3.select(this.parentNode)
                var index = d3.select(path.node().parentElement).attr('class')
                return _colorSet[parseInt(index)] != undefined ? _colorSet[parseInt(index)] : UTIL.getUniqueColour(index);
            })
            .style('stroke', function (d, i) {
                var path = d3.select(this.parentNode)
                var index = d3.select(path.node().parentElement).attr('class')
                return _colorSet[parseInt(index)] != undefined ? _colorSet[parseInt(index)] : UTIL.getUniqueColour(index);
            })
            .style('stroke', '#FFFFFF')
            .attr("rx", 10)
            .attr("ry", 10)
            .style('stroke-width', '5px');

        addText(svg);
        if (!_print) {
            rect.on('mouseover', _handleMouseOverFn.call(chart, tooltip, parentContainer))
                .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, parentContainer))
                .on('mouseout', _handleMouseOutFn.call(chart, tooltip, parentContainer))
                .on('click', function (d) {
                    if (isLiveEnabled) {
                        broadcast.$broadcast('FlairBi:livemode-dialog');
                        return;
                    }
                    var path = d3.select(this.parentNode)
                    var index = parseInt(d3.select(path.node().parentElement).attr('class'))

                    parentContainer.select('.confirm')
                        .style('visibility', 'visible');

                    var point = d3.select(this);
                    if (point.classed('_selected')) {
                        point.classed('_selected', false);
                        point.style('fill-opacity', 1);
                    } else {
                        point.classed('_selected', true);
                        point.style('fill-opacity', 0.5);
                    }

                    var _filterDimension = {};
                    if (broadcast.filterSelection.id) {
                        _filterDimension = broadcast.filterSelection.filter;
                    } else {
                        broadcast.filterSelection.id = parentContainer.attr('id');
                    }
                    var dimension = _dimension;
                    if (_filterDimension[dimension]) {
                        var temp = _filterDimension[dimension];
                        if (temp.indexOf(_Local_data[index][_dimension]) < 0) {
                            temp.push(_Local_data[index][_dimension]);
                        } else {
                            temp.splice(temp.indexOf(_Local_data[index][_dimension]), 1);
                        }
                        _filterDimension[dimension] = temp;
                    } else {
                        _filterDimension[dimension] = [_Local_data[index][_dimension]];
                    }

                    var idWidget = broadcast.updateWidget[parentContainer.attr('id')];
                    broadcast.updateWidget = {};
                    broadcast.updateWidget[parentContainer.attr('id')] = idWidget;
                    broadcast.filterSelection.filter = _filterDimension;
                    var _filterParameters = filterParameters.get();
                    _filterParameters[dimension] = _filterDimension[dimension];
                    filterParameters.save(_filterParameters);
                });
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

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    }

    chart.measureDisplayName = function (value) {
        if (!arguments.length) {
            return _measureDisplayName;
        }
        _measureDisplayName = value;
        return chart;
    }

    chart.fontSizeforDisplayName = function (value) {
        if (!arguments.length) {
            return _fontSizeforDisplayName;
        }
        _fontSizeforDisplayName = value;
        return chart;
    }

    chart.showLabel = function (value) {
        if (!arguments.length) {
            return _showLabel;
        }
        _showLabel = value;
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
    chart.fontColor = function (value) {
        if (!arguments.length) {
            return _fontColor;
        }
        _fontColor = value;
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

    chart.colorSet = function (value) {
        if (!arguments.length) {
            return _colorSet;
        }
        _colorSet = value;
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
    chart.isLiveEnabled = function (value) {
        if (!arguments.length) {
            return isLiveEnabled;
        }
        isLiveEnabled = value;
        return chart;
    }
    return chart;
}

module.exports = numbergrid;