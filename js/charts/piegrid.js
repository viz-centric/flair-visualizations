var d3 = require("d3");
var COMMON = require("../extras/common.js")();
var UTIL = require("../extras/util.js")();
var viz = require("../../d3-libs/viz.js");
var $ = require("jquery");

function piegrid() {
    var _NAME = "piegrid";

    var _config,
        _dimension,
        _dimensionType,
        _measure,
        _sort,
        _tooltip,
        _print,
        broadcast,
        filterParameters,
        _measureDisplayName,
        _showLabel,
        _numberFormat,
        _showValue,
        _fontSize,
        _fontStyle,
        _fontWeight,
        _fontColor,
        _colorSet = [],
        _notification = false,
        isLiveEnabled = false,
        _data;

    var _Local_data, tooltip, parentContainer;

    var m = 20,
        r = 50;

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.dimensionType(config.dimensionType);
        this.measure(config.measure);
        this.tooltip(config.tooltip);
        this.showLabel(config.showLabel);
        this.showValue(config.showValue);
        this.fontSize(config.fontSize);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        this.fontColor(config.fontColor);
        this.measureDisplayName(config.measureDisplayName);
        this.colorSet(config.colorSet);
        this.numberFormat(config.numberFormat);
    };

    var _buildTooltipData = function (datum, chart, data) {
        var output = "";

        var value = UTIL.getFormattedValue(
            _Local_data[data][_measure],
            UTIL.getNumberFormatterFn("Actual", _Local_data[data][_measure])
        );

        output +=
            "<table><tr>" +
            "<th>" +
            _dimension +
            ": </th>" +
            "<td>" +
            UTIL.getDimensionFormatedValue(
                _Local_data[data][_dimension],
                _dimensionType[0]
            ) +
            "</td>" +
            "</tr><tr>" +
            "<th>" +
            _measure +
            ": </th>" +
            "<td>" +
            value +
            " </td>" +
            "</tr></table>";
        return output;
    };

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            var position = d3.select(this.parentNode).attr("class");
            var border = _colorSet[parseInt(position)];
            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(
                    tooltip,
                    _buildTooltipData(d, me, position),
                    container,
                    border
                );
            }
        };
    };

    var _handleMouseMoveFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                var position = d3.select(this.parentNode).attr("class");
                var border = _colorSet[parseInt(position)];
                UTIL.updateTooltip.call(
                    tooltip,
                    _buildTooltipData(d, me, position),
                    container,
                    border
                );
            }
        };
    };

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        };
    };

    var applyFilter = function () {
        return function () {
            if (broadcast) {
                broadcast.applyFilter(
                    broadcast.selectedFilters,
                    broadcast.visualmetadata,
                    broadcast.view
                );
                d3.select(this.parentNode).style("visibility", "hidden");
            }
        };
    };

    var clearFilter = function (div) {
        return function () {
            chart.update(_originalData);
            parentContainer.select(".confirm").style("visibility", "hidden");
        };
    };

    var addText = function (svg, data) {
        var title_dimension = svg
            .append("text")
            .attr("class", "title_dimension")
            .text(function (d, i) {
                return d[0] + "% ";
            })
            .style("text-anchor", "middle")
            .style("fill", _fontColor)
            .style("font-size", _fontSize + "px")
            .style("font-weight", _fontWeight)
            .style("font-style", _fontStyle)
            .attr("visibility", _showValue == true ? "visible" : "hidden");

        svg.append("text")
            .attr("x", 0)
            .text(function (d, i) {
                var value = UTIL.getFormattedValue(
                    data[i][_measure],
                    UTIL.getNumberFormatterFn(_numberFormat, data[i][_measure])
                );
                return value;
            })
            .text(function (d, i) {
                var value = UTIL.getFormattedValue(
                    data[i][_measure],
                    UTIL.getNumberFormatterFn(_numberFormat, data[i][_measure])
                );
                if (!_print) {
                    return UTIL.getTruncatedLabel(this, value, r * 0.8);
                } else {
                    return value;
                }
            })
            .style("text-anchor", "middle")
            .style("fill", _fontColor)
            .style("font-size", _fontSize + "px")
            .style("font-weight", _fontWeight)
            .style("font-style", _fontStyle)
            .attr("visibility", _showLabel == true ? "visible" : "hidden")
            .attr("x", 0)
            .attr("dy", _fontSize + 5);

        var title_measure = svg
            .append("text")
            .attr("class", "title_measure")
            // .text(function (d, i) {
            //     return _Local_data[i][_measure];
            // })
            .text(function (d, i) {
                return data[i][_dimension];
            })
            .text(function (d, i) {
                if (!_print) {
                    return UTIL.getTruncatedLabel(
                        this,
                        UTIL.getDimensionFormatedValue(
                            data[i][_dimension],
                            _dimensionType[0]
                        ),
                        r + m
                    );
                } else {
                    return data[i][_dimension].substring(0, 4);
                }
            })
            .attr("y", r + m - 5)
            .attr("text-anchor", "middle")
            .style("text-anchor", "middle")
            .style("fill", _fontColor)
            .style("font-size", _fontSize + "px")
            .style("font-weight", _fontWeight)
            .style("font-style", _fontStyle);
    };

    function setRadius(width, height, data) {
        var innerBoxLength = (r + m) * 2;
        var columns = width / innerBoxLength;
        var rows = height / innerBoxLength;
        columns = parseInt(columns);
        rows = parseInt(rows);

        if (data.length > columns * rows) {
            r = r - 5;
            setRadius(width, height, data);
        }
        return parseInt(r);
    }

    function chart(selection) {
        data = _data;
        _Local_data = _originalData = data;

        var me = this;

        var _localTotal = d3.sum(
            data.map(function (d) {
                return d[_measure];
            })
        );

        var preData = [];
        _Local_data.map(function (val) {
            var temp = [];
            temp[0] = parseFloat((val[_measure] * 100) / _localTotal).toFixed(
                2
            );
            temp[1] = parseFloat(
                100 - (val[_measure] * 100) / _localTotal
            ).toFixed(2);
            preData.push(temp);
        });

        if (_print && !_notification) {
            parentContainer = selection;
        } else {
            parentContainer = d3.select("#" + selection.id);
        }

        parentContainer.append("div").attr("class", "custom_tooltip");

        if (_tooltip) {
            tooltip = parentContainer.select(".custom_tooltip");
        }

        var width = parentContainer.attr("width"),
            height = parentContainer.attr("height");

        var area = width * height;
        var RR = area / (data.length + 1);
        r = Math.sqrt(RR);
        r = (r - 25) / 2;
        r = setRadius(width, height, data);

        var svg = parentContainer
            .selectAll("svg")
            .data(preData)
            .enter()
            .append("svg")
            .attr("class", function (d, i) {
                return i;
            })
            .attr("width", (r + m) * 2)
            .attr("height", (r + m) * 2)
            .append("g")
            .attr(
                "transform",
                "translate(" + (r + m - 10) + "," + (r + m - 10) + ")"
            );

        if (!_print) {
            var confirm = $(me)
                .parent()
                .find("div.confirm")
                .css("visibility", "hidden");

            var _filter = UTIL.createFilterElement();
            $("#" + parentContainer.attr("id")).append(_filter);

            svg.on(
                "mouseover",
                _handleMouseOverFn.call(chart, tooltip, parentContainer)
            )
                .on(
                    "mousemove",
                    _handleMouseMoveFn.call(chart, tooltip, parentContainer)
                )
                .on(
                    "mouseout",
                    _handleMouseOutFn.call(chart, tooltip, parentContainer)
                )
                .on("click", function (d) {
                    if (isLiveEnabled) {
                        broadcast.$broadcast("FlairBi:livemode-dialog");
                        return;
                    }
                    var index = parseInt(
                        d3.select(this.parentNode).attr("class")
                    );

                    var confirm = parentContainer
                        .select(".confirm")
                        .style("visibility", "visible");

                    var point = d3.select(this).selectAll("path");
                    if (point.classed("selected")) {
                        point.classed("selected", false);
                    } else {
                        point.classed("selected", true);
                    }

                    var _filterDimension = broadcast.selectedFilters || {};

                    var dimension = _dimension;
                    if (_filterDimension[dimension]) {
                        var temp = _filterDimension[dimension];
                        if (temp.indexOf(_Local_data[index][_dimension]) < 0) {
                            temp.push(_Local_data[index][_dimension]);
                        } else {
                            temp.splice(
                                temp.indexOf(_Local_data[index][_dimension]),
                                1
                            );
                        }
                        _filterDimension[dimension] = temp;
                    } else {
                        _filterDimension[dimension] = [
                            _Local_data[index][_dimension],
                        ];
                    }
                    _filterDimension[dimension]._meta = {
                        dataType: _dimensionType[0],
                        valueType: "castValueType",
                    };

                  broadcast.saveSelectedFilter(_filterParameters);
                });

            parentContainer.select(".filterData").on("click", applyFilter());

            parentContainer
                .select(".removeFilter")
                .on("click", clearFilter(parentContainer));
        }

        svg.selectAll("path")
            .data(d3.pie())
            .enter()
            .append("path")
            .attr(
                "d",
                d3
                    .arc()
                    .innerRadius(r * 0.8)
                    .outerRadius(r)
            )
            .style("fill", function (d, i) {
                var path = d3.select(this.parentNode);
                var index = d3.select(path.node().parentElement).attr("class");
                if (i == 1) {
                    d3.select(this).style("fill-opacity", 0.5);
                }
                return _colorSet[parseInt(index)] != undefined
                    ? _colorSet[parseInt(index)]
                    : UTIL.getUniqueColour(index);
            })
            .style("stroke", function (d, i) {
                var path = d3.select(this.parentNode);
                var index = d3.select(path.node().parentElement).attr("class");
                return _colorSet[parseInt(index)] != undefined
                    ? _colorSet[parseInt(index)]
                    : UTIL.getUniqueColour(index);
            })
            .style("stroke-opacity", 0.5);

        addText(svg, data);
    }

    chart._getName = function () {
        return _NAME;
    };

    chart._getHTML = function () {
        return parentContainer.node().outerHTML;
    };

    chart.update = function (data) {
        var width = parentContainer.attr("width"),
            height = parentContainer.attr("height");

        var area = width * height;
        var RR = area / (data.length + 1);
        r = Math.sqrt(RR);
        r = (r - 25) / 2;
        r = setRadius(width, height, data);

        var _localTotal = d3.sum(
            data.map(function (d) {
                return d[_measure];
            })
        );

        var preData = [];
        data.map(function (val) {
            var temp = [];
            temp[0] = parseFloat((val[_measure] * 100) / _localTotal).toFixed(
                2
            );
            temp[1] = parseFloat(
                100 - (val[_measure] * 100) / _localTotal
            ).toFixed(2);
            preData.push(temp);
        });

        parentContainer.selectAll("svg").remove();

        var svg = parentContainer
            .selectAll("svg")
            .data(preData)
            .enter()
            .append("svg")
            .attr("class", function (d, i) {
                return i;
            })
            .attr("width", (r + m) * 2)
            .attr("height", (r + m) * 2)
            .append("g")
            .attr("transform", "translate(" + (r + m) + "," + (r + m) + ")");

        svg.selectAll("path")
            .data(d3.pie())
            .enter()
            .append("path")
            .attr(
                "d",
                d3
                    .arc()
                    .innerRadius(r * 0.8)
                    .outerRadius(r)
            )
            .style("fill", function (d, i) {
                var path = d3.select(this.parentNode);
                var index = d3.select(path.node().parentElement).attr("class");
                if (i == 1) {
                    d3.select(this).style("fill-opacity", 0.5);
                }
                return _colorSet[parseInt(index)] != undefined
                    ? _colorSet[parseInt(index)]
                    : UTIL.getUniqueColour(index);
            })
            .style("stroke", function (d, i) {
                var path = d3.select(this.parentNode);
                var index = d3.select(path.node().parentElement).attr("class");
                return _colorSet[parseInt(index)] != undefined
                    ? _colorSet[parseInt(index)]
                    : UTIL.getUniqueColour(index);
            })
            .style("stroke-opacity", 0.5);

        if (!_print) {
            svg.on(
                "mouseover",
                _handleMouseOverFn.call(chart, tooltip, parentContainer)
            )
                .on(
                    "mousemove",
                    _handleMouseMoveFn.call(chart, tooltip, parentContainer)
                )
                .on(
                    "mouseout",
                    _handleMouseOutFn.call(chart, tooltip, parentContainer)
                )
                .on("click", function (d) {
                    if (isLiveEnabled) {
                        broadcast.$broadcast("FlairBi:livemode-dialog");
                        return;
                    }
                    var index = parseInt(
                        d3.select(this.parentNode).attr("class")
                    );

                    var confirm = parentContainer
                        .select(".confirm")
                        .style("visibility", "visible");

                    var point = d3.select(this).selectAll("path");
                    if (point.classed("selected")) {
                        point.classed("selected", false);
                    } else {
                        point.classed("selected", true);
                    }

                    var _filterDimension = broadcast.selectedFilters || {};

                    var dimension = _dimension;
                    if (_filterDimension[dimension]) {
                        var temp = _filterDimension[dimension];
                        if (temp.indexOf(_Local_data[index][_dimension]) < 0) {
                            temp.push(_Local_data[index][_dimension]);
                        } else {
                            temp.splice(
                                temp.indexOf(_Local_data[index][_dimension]),
                                1
                            );
                        }
                        _filterDimension[dimension] = temp;
                    } else {
                        _filterDimension[dimension] = [
                            _Local_data[index][_dimension],
                        ];
                    }
                    _filterDimension[dimension]._meta = {
                        dataType: _dimensionType[0],
                        valueType: "castValueType",
                    };
                  broadcast.saveSelectedFilter(_filterParameters);
                });

            parentContainer.select(".filterData").on("click", applyFilter());

            parentContainer
                .select(".removeFilter")
                .on("click", clearFilter(parentContainer));
        }

        addText(svg, data);
    };

    chart.config = function (value) {
        if (!arguments.length) {
            return _config;
        }
        _config = value;
        _setConfigParams.call(chart, _config);
        return chart;
    };

    chart.dimension = function (value) {
        if (!arguments.length) {
            return _dimension;
        }
        _dimension = value;
        return chart;
    };

    chart.dimensionType = function (value) {
        if (!arguments.length) {
            return _dimensionType;
        }
        _dimensionType = value;
        return chart;
    };

    chart.measure = function (value) {
        if (!arguments.length) {
            return _measure;
        }
        _measure = value;
        return chart;
    };

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    };

    chart.measureDisplayName = function (value) {
        if (!arguments.length) {
            return _measureDisplayName;
        }
        _measureDisplayName = value;
        return chart;
    };

    chart.showLabel = function (value) {
        if (!arguments.length) {
            return _showLabel;
        }
        _showLabel = value;
        return chart;
    };

    chart.showValue = function (value) {
        if (!arguments.length) {
            return _showValue;
        }
        _showValue = value;
        return chart;
    };

    chart.fontSize = function (value) {
        if (!arguments.length) {
            return _fontSize;
        }
        _fontSize = value;
        return chart;
    };

    chart.fontStyle = function (value) {
        if (!arguments.length) {
            return _fontStyle;
        }
        _fontStyle = value;
        return chart;
    };
    chart.fontWeight = function (value) {
        if (!arguments.length) {
            return _fontWeight;
        }
        _fontWeight = value;
        return chart;
    };
    chart.fontColor = function (value) {
        if (!arguments.length) {
            return _fontColor;
        }
        _fontColor = value;
        return chart;
    };

    chart.sort = function (value) {
        if (!arguments.length) {
            return _sort;
        }
        _sort = value;
        return chart;
    };

    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    };

    chart.broadcast = function (value) {
        if (!arguments.length) {
            return broadcast;
        }
        broadcast = value;
        return chart;
    };
    chart.colorSet = function (value) {
        if (!arguments.length) {
            return _colorSet;
        }
        _colorSet = value;
        return chart;
    };

    chart.filterParameters = function (value) {
        if (!arguments.length) {
            return filterParameters;
        }
        filterParameters = value;
        return chart;
    };
    chart.notification = function (value) {
        if (!arguments.length) {
            return _notification;
        }
        _notification = value;
        return chart;
    };
    chart.data = function (value) {
        if (!arguments.length) {
            return _data;
        }
        _data = value;
        return chart;
    };
    chart.isLiveEnabled = function (value) {
        if (!arguments.length) {
            return isLiveEnabled;
        }
        isLiveEnabled = value;
        return chart;
    };
    chart.numberFormat = function (value) {
        if (!arguments.length) {
            return _numberFormat;
        }
        _numberFormat = value;
        return chart;
    };
    return chart;
}

module.exports = piegrid;
