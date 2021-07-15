var d3 = require("d3");
var COMMON = require("../extras/common.js")();
var d3layoutcloud = require("../../d3-libs/d3.layout.cloud.js");
var Seedrandom = require("../../d3-libs/seedrandom.min.js");
var $ = require("jquery");
var UTIL = require("../extras/util.js")();

function wordcloud() {
    var _NAME = "wordcloud";

    var _config,
        _dimension,
        _dimensionType,
        _measure,
        _colorSet = [],
        _tooltip,
        _labelColor,
        _print,
        broadcast,
        filterParameters,
        isLiveEnabled = false,
        _notification = false,
        _data;

    var gradientColor = d3.scaleLinear();

    var _local_svg, _Local_data, _originalData;

    var parentContainer, parentWidth, parentHeight;

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.dimensionType(config.dimensionType);
        this.measure(config.measure);
        this.colorSet(config.colorSet);
        this.labelColor(config.labelColor);
        setDefaultColorForChart();
    };

    var setDefaultColorForChart = function () {
        if (_labelColor == null && _labelColor == undefined) {
            _labelColor = COMMON.COLORSCALE(0);
        }
        if (_colorSet.length == 0) {
            _colorSet = UTIL.defaultColours();
        }
    };

    var _buildTooltipData = function (datum, chart) {
        var output = "";
        output +=
            "<table><tr>" +
            "<th>" +
            chart.dimension() +
            ": </th>" +
            "<td>" +
            datum.text +
            "</td>" +
            "</tr><tr>" +
            "<th>" +
            chart.measure() +
            ": </th>" +
            "<td>" +
            getValue(datum.text) +
            " </td>" +
            "</tr></table>";

        return output;
    };

    var setData = function (data) {
        var result = [];
        data.map(function (d) {
            var value = new Object();
            value["text"] = d[_dimension];
            value["size"] = d[_measure];
            result.push(value);
        });
        return result;
    };
    var getValue = function (recoed) {
        var result = 0;
        _Local_data.map(function (val) {
            if (recoed == val[_dimension]) {
                result = val[_measure];
            }
        });
        return result;
    };
    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            var border = d3.select(this).style("fill");
            d3.select(this)
                .style("cursor", "pointer")
                .style("cursor", "pointer")
                .style("fill-opacity", "0.5")
                .style("stroke", border)
                .style("stroke-width", "2px;");

            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(
                    tooltip,
                    _buildTooltipData(d, me),
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
                var border = d3.select(this).style("fill");
                UTIL.updateTooltip.call(
                    tooltip,
                    _buildTooltipData(d, me),
                    container,
                    border
                );
            }
        };
    };

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            var border = d3.select(this).style("fill");
            d3.select(this)
                .style("cursor", "default")
                .style("fill-opacity", "1")
                .style("stroke", "none")
                .style("stroke-width", "0px;");

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

    var getFillColor = function (obj, index, words) {
        if (_labelColor == "single_color") {
            return _colorSet[0];
        } else if (_labelColor == "unique_color") {
            var r = parseInt(Math.abs(Math.sin(index + 50)) * 255),
                g = parseInt(Math.abs(Math.cos(index)) * 255),
                b = parseInt(Math.abs(Math.sin(7 * index - 100)) * 255);
            return d3.rgb(r, g, b);
        } else if (_labelColor == "gradient_color") {
            var color;
            words.map(function (val) {
                if (val[_dimension] == obj.text) {
                    color = gradientColor(val[_measure]);
                }
            });
            return color;
        }
    };

    var setColorDomain = function (values) {
        gradientColor.domain([
            Math.min.apply(Math, values),
            Math.max.apply(Math, values),
        ]);
        gradientColor.range([
            d3.rgb(_colorSet[0]).brighter(),
            d3.rgb(_colorSet[0]).darker(),
        ]);
    };

    function chart(selection) {
        data = UTIL.sortingData(_data, _dimension[0]);
        _Local_data = _originalData = data;

        if (_print && !_notification) {
            parentContainer = selection;
        } else {
            parentContainer = d3.select("#" + selection.id);
        }

        var svg = parentContainer
            .append("svg")
            .attr("width", parentContainer.attr("width"))
            .attr("height", parentContainer.attr("height"));

        var width = +svg.attr("width"),
            height = +svg.attr("height");

        _local_svg = svg;

        parentContainer.append("div").attr("class", "custom_tooltip");

        parentWidth = width - 2 * COMMON.PADDING;
        parentHeight = height - 2 * COMMON.PADDING;

        svg.attr("width", width).attr("height", height);

        drawPlot.call(this, data);
    }

    var drawPlot = function (data) {
        var me = this;

        _Local_data = data;
        if (_tooltip) {
            tooltip = parentContainer.select(".custom_tooltip");
        }
        var colour = d3.schemePaired;

        Seedrandom("heo.");
        data = UTIL.sortData(data, _measure, "ascending");

        var _localTotal = d3.sum(
            data.map(function (d) {
                return d[_measure];
            })
        );

        data.map(function (val) {
            val[_measure] = (val[_measure] * 100) / _localTotal;
            if (val[_measure] < 10) {
                val[_measure] = 10;
            }
        });

        var values = data.map(function (d) {
            return d[_measure];
        });

        setColorDomain(values);

        var words = setData(data);

        d3layoutcloud()
            .size([parentWidth, parentHeight])
            .words(words)
            .rotate(0)
            .padding(5)
            .fontSize(function (d) {
                return d.size;
            })
            .on("end", drawSkillCloud)
            .start();

        function drawSkillCloud(words) {
            var text = _local_svg
                .append("g")
                .attr(
                    "transform",
                    "translate(" +
                    ~~(parentWidth / 2) +
                    "," +
                    ~~(parentHeight / 2) +
                    ")"
                )
                .selectAll("text")
                .data(words)
                .enter()
                .append("text")
                .style("font-size", function (d) {
                    return d.size + "px";
                })
                .style("font-family", "Impact")
                .style("fill", function (d, i) {
                    return getFillColor(d, i, data);
                })
                .attr("text-anchor", "middle")
                .attr("transform", function (d) {
                    return (
                        "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"
                    );
                })
                .text(function (d) {
                    return d.text;
                });

            if (!_print) {
                var _filter = UTIL.createFilterElement();
                $("#" + parentContainer.attr("id")).append(_filter);

                text.on(
                    "mouseover",
                    _handleMouseOverFn.call(chart, tooltip, _local_svg)
                )
                    .on(
                        "mousemove",
                        _handleMouseMoveFn.call(chart, tooltip, _local_svg)
                    )
                    .on(
                        "mouseout",
                        _handleMouseOutFn.call(chart, tooltip, _local_svg)
                    )
                    .on("click", function (d, i) {
                        if (isLiveEnabled) {
                            broadcast.$broadcast("FlairBi:livemode-dialog");
                            return;
                        }
                        var confirm = parentContainer
                            .select(".confirm")
                            .style("visibility", "visible");
                        filter = false;

                        var point = d3.select(this);
                        if (point.classed("selected")) {
                            point.classed("selected", false);
                        } else {
                            point.classed("selected", true);
                        }

                        var _filterDimension = broadcast.selectedFilters || {};


                        var dimension = _dimension;
                        if (_filterDimension[dimension]) {
                            var temp = _filterDimension[dimension];
                            if (temp.indexOf(d.text) < 0) {
                                temp.push(d.text);
                            } else {
                                temp.splice(temp.indexOf(d.text), 1);
                            }
                            _filterDimension[dimension] = temp;
                        } else {
                            _filterDimension[dimension] = [d.text];
                        }
                        _filterDimension[dimension]._meta = {
                            dataType: _dimensionType[0],
                            valueType: "castValueType",
                        };
                        broadcast.saveSelectedFilter(_filterDimension);
                    });

                parentContainer
                    .select(".filterData")
                    .on("click", applyFilter());

                parentContainer
                    .select(".removeFilter")
                    .on("click", clearFilter(parentContainer));
            }
        }
    };

    chart._getName = function () {
        return _NAME;
    };

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
    };

    chart.update = function (data) {
        _local_svg.selectAll("text").remove();

        drawPlot(data);
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

    chart.colorSet = function (value) {
        if (!arguments.length) {
            return _colorSet;
        }
        _colorSet = value;
        return chart;
    };

    chart.labelColor = function (value) {
        if (!arguments.length) {
            return _labelColor;
        }
        _labelColor = value;
        return chart;
    };
    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    };

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    };

    chart.broadcast = function (value) {
        if (!arguments.length) {
            return broadcast;
        }
        broadcast = value;
        return chart;
    };

    chart.filterParameters = function (value) {
        if (!arguments.length) {
            return filterParameters;
        }
        filterParameters = value;
        return chart;
    };
    chart.isLiveEnabled = function (value) {
        if (!arguments.length) {
            return isLiveEnabled;
        }
        isLiveEnabled = value;
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
    return chart;
}
module.exports = wordcloud;
