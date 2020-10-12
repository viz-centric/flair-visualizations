var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var D3Funnel = require('d3-funnel');
const {
    text
} = require('d3');
var UTIL = require('../extras/util.js')();

function funnel() {

    var _NAME = 'funnel';

    var _config,
        _dimension,
        _dimensionType,
        _measure,
        _displayColor,
        _showLabel,
        _fontColor,
        _numberFormat,
        _fontSize,
        _fontStyle,
        _fontWeight,
        _colorSet = [],
        _pinched,
        _inverted,
        _dynamicHeight,
        _colorPattern,
        _triangle,
        _tooltip,
        _labelColor,
        _print,
        broadcast,
        filterParameters,
        isLiveEnabled = false,
        _notification = false,
        _data;

    var gradientColor = d3.scaleLinear();

    var _local_svg, _Local_data, _originalData

    var parentContainer, parentWidth, parentHeight;

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.dimensionType(config.dimensionType);
        this.measure(config.measure);
        this.colorSet(config.colorSet);
        this.labelColor(config.labelColor);
        this.displayColor(config.displayColor);
        this.pinched(config.pinched);
        this.inverted(config.inverted);
        this.dynamicHeight(config.dynamicHeight);
        this.colorPattern(config.colorPattern);
        this.triangle(config.triangle);

        this.showLabel(config.showLabel);
        this.fontColor(config.fontColor);
        this.numberFormat(config.numberFormat);
        this.fontSize(config.fontSize);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        setDefaultColorForChart();
    }

    var setDefaultColorForChart = function () {
        if (_labelColor == null && _labelColor == undefined) {
            _labelColor = COMMON.COLORSCALE(0);
        }
        if (_colorSet.length == 0) {
            _colorSet = UTIL.defaultColours();
        }
    }

    var _buildTooltipData = function (datum, chart) {
        var output = "";
        output += "<table><tr>" +
            "<th>" + chart.dimension() + ": </th>" +
            "<td>" + datum.label.raw + "</td>" +
            "</tr><tr>" +
            "<th>" + chart.measure() + ": </th>" +
            "<td>" + UTIL.getFormattedValue(datum.value, UTIL.getNumberFormatterFn(_numberFormat, datum.value)); + " </td>" +
        "</tr></table>";

        return output;
    }



    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            var border = d3.select(this).style('fill')
            d3.select(this)
                .style('cursor', 'pointer')
                .style('cursor', 'pointer')
                .style('fill-opacity', '0.5')
                .style('stroke', border)
                .style('stroke-width', '2px;');

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
                var border = d3.select(this).style('fill')
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, border);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            var border = d3.select(this).style('fill')
            d3.select(this)
                .style('cursor', 'default')
                .style('fill-opacity', '1')
                .style('stroke', 'none')
                .style('stroke-width', '0px;');

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
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

    var setColorDomain = function (values) {
        gradientColor.domain([Math.min.apply(Math, values), Math.max.apply(Math, values)]);
        gradientColor.range([d3.rgb(_displayColor).brighter(), d3.rgb(_displayColor).darker()])
    }

    var getFillColor = function (data, index) {
        if (_colorPattern == "unique_color") {
            return _colorSet[index];
        } else if (_colorPattern == "single_color") {
            return _displayColor;
        } else {
            return UTIL.rgbToHex(gradientColor(data));
        }
    }

    function chart(selection) {

        data = UTIL.sortingData(_data, _dimension[0])
        _Local_data = _originalData = data;

        if (_print && !_notification) {
            parentContainer = selection;
        } else {
            parentContainer = d3.select('#' + selection.id)
        }

        var values = data.map(function (d) {
            return d[_measure];
        });

        setColorDomain(values)

        for (let index = 0; index < data.length; index++) {
            data[index].label = data[index][_dimension];
            data[index].value = data[index][_measure];
            data[index].backgroundColor = getFillColor(data[index][_measure], index);
            data[index].labelColor = _labelColor
        }

        const options = {
            chart: {
                bottomPinch: _pinched ? 1 : 0,
                bottomWidth: _triangle ? 0 : 1 / 3,
                inverted: _inverted
            },
            block: {
                dynamicHeight: _dynamicHeight,
                fill: {
                    type: 'solid'
                },
                highlight: true
            },
            tooltip: {
                enabled: false
            }
        };
        const chartElement = new D3Funnel('#' + selection.id);
        chartElement.draw(data, options);

        parentContainer.append('div')
            .attr('class', 'custom_tooltip');

        if (_tooltip) {
            tooltip = parentContainer.select('.custom_tooltip');
        }

        d3.select("#" + chartElement.id).selectAll('text')
            .style('fill', _labelColor)
            .style('font-size', _fontSize + "px")
            .style('font-style', _fontWeight)
            .style('font-weight', _fontWeight)
            .text(function (d) {
                var value = parseFloat(this.textContent.split(":")[1].toString().replace(",", ""))
                var formatedValue = UTIL.getFormattedValue(value, UTIL.getNumberFormatterFn(_numberFormat, value));
                return this.textContent.split(":")[0] + " " + formatedValue

            })
            .text(function (d) {
                var value = this.textContent;
                if (!_print) {
                    return UTIL.getTruncatedLabel(
                        this,
                        value,
                        this.parentNode.getBBox().width - 15
                    )
                } else {
                    return value;
                }
            })

        d3.select("#" + chartElement.id).selectAll('path')
            .on('mouseover', _handleMouseOverFn.call(chart, tooltip, parentContainer))
            .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, parentContainer))
            .on('mouseout', _handleMouseOutFn.call(chart, tooltip, parentContainer))
            .on('click', function (d) {
                if (isLiveEnabled) {
                    broadcast.$broadcast('FlairBi:livemode-dialog');
                    return;
                }
                var index = parseInt(d3.select(this.parentNode).attr('class'));

                var confirm = parentContainer.select('.confirm')
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
                _filterDimension[dimension]._meta = {
                    dataType: _dimensionType[0],
                    valueType: 'castValueType'
                };

                UTIL.saveFilterParameters(broadcast, filterParameters, parentContainer, _filterDimension, dimension);
            });

    }

    chart._getName = function () {
        return _NAME;
    }

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
    }

    chart.update = function (data) {

        _local_svg.selectAll('text').remove();

        drawPlot(data);
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

    chart.dimensionType = function (value) {
        if (!arguments.length) {
            return _dimensionType;
        }
        _dimensionType = value;
        return chart;
    }

    chart.measure = function (value) {
        if (!arguments.length) {
            return _measure;
        }
        _measure = value;
        return chart;
    }

    chart.displayColor = function (value) {
        if (!arguments.length) {
            return _displayColor;
        }
        _displayColor = value;
        return chart;
    }


    chart.colorSet = function (value) {
        if (!arguments.length) {
            return _colorSet;
        }
        _colorSet = value;
        return chart;
    }

    chart.labelColor = function (value) {
        if (!arguments.length) {
            return _labelColor;
        }
        _labelColor = value;
        return chart;
    }
    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    }

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
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

    chart.pinched = function (value) {
        if (!arguments.length) {
            return _pinched;
        }
        _pinched = value;
        return chart;
    }
    chart.inverted = function (value) {
        if (!arguments.length) {
            return _inverted;
        }
        _inverted = value;
        return chart;
    }
    chart.dynamicHeight = function (value) {
        if (!arguments.length) {
            return _dynamicHeight;
        }
        _dynamicHeight = value;
        return chart;
    }
    chart.colorPattern = function (value) {
        if (!arguments.length) {
            return _colorPattern;
        }
        _colorPattern = value;
        return chart;
    }
    chart.triangle = function (value) {
        if (!arguments.length) {
            return _triangle;
        }
        _triangle = value;
        return chart;
    }
    chart.showLabel = function (value) {
        if (!arguments.length) {
            return _showLabel;
        }
        _showLabel = value;
        return chart;
    }
    chart.fontColor = function (value) {
        if (!arguments.length) {
            return _fontColor;
        }
        _fontColor = value;
        return chart;
    }
    chart.numberFormat = function (value) {
        if (!arguments.length) {
            return _numberFormat;
        }
        _numberFormat = value;
        return chart;
    }
    chart.fontSize = function (value) {
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
    chart.fontStyle = function (value) {
        if (!arguments.length) {
            return _fontStyle;
        }
        _fontStyle = value;
        return chart;
    }
    return chart;

}
module.exports = funnel;