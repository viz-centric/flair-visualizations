var d3 = require("d3");
var COMMON = require("../extras/common.js")();
var UTIL = require("../extras/util.js")();
var Topojson = require("topojson");
var Worldtopo = require("../../script/world-topo-min.json");
var $ = require("jquery");

try {
    var d3Lasso = require("../../d3-libs/d3-lasso.min.js");
} catch (ex) { }
function map() {
    var _NAME = "map";

    var _config,
        _dimension,
        _dimensionType,
        _measure,
        _numberFormat,
        _displayColor,
        _borderColor,
        _colorPattern,
        _textColor,
        _colourOfLabels,
        _showValue,
        _tooltip,
        _print,
        broadcast,
        filterParameters,
        _data,
        _colorSet = [],
        _notification = false;

    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    };

    var _local_svg,
        _Local_data,
        _originalData,
        parentContainer,
        valueMapper = [],
        container,
        path,
        projection;

    var plotWidth, plotHeight;
    var filter = false,
        filterData = [],
        gradientColor = d3.scaleLinear();

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.dimensionType(config.dimensionType);
        this.measure(config.measure);
        this.numberFormat(config.numberFormat);
        this.displayColor(config.displayColor);
        this.textColor(config.textColor);
        this.borderColor(config.borderColor);
        this.colorPattern(config.colorPattern);
        this.colorSet(config.colorSet);
        this.colourOfLabels(config.colourOfLabels);
        this.showValue(config.showValue);
    };

    var _buildTooltipData = function (datum, chart) {
        var output = "";
        output +=
            "<table><tr>" +
            "<th>" +
            chart.dimension() +
            ": </th>" +
            "<td>" +
            datum.properties.name +
            "</td>" +
            "</tr>" +
            "<tr>" +
            "<th>" +
            chart.measure() +
            ": </th>" +
            "<td>" +
            valueMapper[datum.properties.name] +
            "</td>" +
            "</tr>" +
            "</table>";

        return output;
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

    var getFillColor = function (value, index) {
        if (value) {
            if (_colorPattern == "single_color") {
                return _displayColor;
            } else if (_colorPattern == "unique_color") {
                if (_colorSet[index]) {
                    return _colorSet[index];
                } else {
                    var r = parseInt(Math.abs(Math.sin(index + 50)) * 255),
                        g = parseInt(Math.abs(Math.cos(index)) * 255),
                        b = parseInt(Math.abs(Math.sin(7 * index - 100)) * 255);
                    return d3.rgb(r, g, b);
                }
            } else if (_colorPattern == "gradient_color") {
                return gradientColor(value);
            }
        } else {
            return COMMON.HIGHLIGHTER;
        }
    };

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this)
                .style("cursor", "pointer")
                .style("cursor", "pointer");

            var border = d3.select(this).style("fill");
            //getFillColor(valueMapper[d.properties.name], i);

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
            d3.select(this).style("cursor", "default");
            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        };
    };

    var onLassoStart = function (lasso, scope) {
        return function () {
            if (filter) {
                lasso
                    .items()
                    .classed("not_possible", true)
                    .classed("selected", false);
            }
        };
    };

    var onLassoDraw = function (lasso, scope) {
        return function () {
            filter = true;
            lasso.items().classed("selected", false);

            lasso.possibleItems().each(function (d, i) {
                var item = d3
                    .select(this)
                    .node()
                    .className.baseVal.split(" ")[0];
                d3.selectAll("rect." + item)
                    .classed("not_possible", false)
                    .classed("possible", true);
            });
            lasso
                .possibleItems()
                .classed("not_possible", false)
                .classed("possible", true);

            lasso
                .notPossibleItems()
                .classed("not_possible", true)
                .classed("possible", false);
        };
    };

    var onLassoEnd = function (lasso, scope) {
        return function () {
            var data = lasso.selectedItems().data();
            if (!filter) {
                return;
            }
            if (data.length > 0) {
                lasso
                    .items()
                    .classed("not_possible", false)
                    .classed("possible", false);
            }

            lasso.selectedItems().classed("selected", true);

            lasso.notSelectedItems().classed("selected", false);

            var confirm = d3
                .select(scope.node().parentNode)
                .select("div.confirm")
                .style("visibility", "visible");

            if (data.length > 0) {
                filterData = data;
            } else {
                filterData = [];
            }
            if (broadcast) {
                var _filterDimension = broadcast.selectedFilters || {};

                _filterDimension[_dimension[0]] = filterData.map(function (d) {
                    return d[_dimension[0]];
                });

                _filterDimension[_dimension[0]]._meta = {
                    dataType: _dimensionType[0],
                    valueType: "castValueType",
                };
               broadcast.saveSelectedFilter(_filterDimension);
            }
        };
    };

    function ready(mapData, countries) {
        //    me._mapdata = mapData;

        var country = container
            .selectAll(".country")
            .data(
                Topojson.feature(mapData, mapData.objects.countries).features
            );

        var country = country
            .enter()
            .insert("path")
            .attr("class", "country")
            .style("stroke", "white")
            .style("stroke-width", 1.5)
            .style("opacity", 0.8)
            .attr("id", function (d, i) {
                return d.id;
            })
            .attr("d", path)
            .style("fill", function (d, i) {
                return getFillColor(valueMapper[d.properties.name], i);
            })
            .filter(function (d) {
                return countries.indexOf(d.properties.name) !== -1;
            });

        var round = container
            .selectAll("circle")
            .data(
                Topojson.feature(mapData, mapData.objects.countries).features
            );

        round
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return projection(d3.geoCentroid(d))[0];
            })
            .attr("cy", function (d) {
                return projection(d3.geoCentroid(d))[1];
            })
            .attr("r", 20)
            .style("visibility", function (d) {
                if (_showValue && valueMapper[d.properties.name]) {
                    return "visible";
                } else {
                    return "hidden";
                }
            })
            .style("fill", _textColor)
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 1)
            .attr("fill-opacity", 0.5);

        var labels = container
            .selectAll("text.label")
            .data(
                Topojson.feature(mapData, mapData.objects.countries).features
            );

        labels
            .enter()
            .append("text")
            .attr("x", function (d) {
                return projection(d3.geoCentroid(d))[0];
            })
            .attr("y", function (d) {
                return projection(d3.geoCentroid(d))[1];
            })
            .style("fill", _colourOfLabels)
            .text(function (d) {
                if (valueMapper[d.properties.name]) {
                    return UTIL.getFormattedValue(
                        valueMapper[d.properties.name],
                        UTIL.getNumberFormatterFn(
                            "M",
                            valueMapper[d.properties.name]
                        )
                    );
                } else {
                    return "";
                }
            })
            .style("visibility", function () {
                return UTIL.getVisibility(_showValue);
            })
            .style("text-anchor", "middle")
            .classed("label", true);

        var lasso = d3Lasso
            .lasso()
            .hoverSelect(true)
            .closePathSelect(true)
            .closePathDistance(100)
            .items(country)
            .targetArea(_local_svg);

        lasso
            .on("start", onLassoStart(lasso, _local_svg))
            .on("draw", onLassoDraw(lasso, _local_svg))
            .on("end", onLassoEnd(lasso, _local_svg));

        _local_svg.call(lasso);
    }

    function chart(selection) {
        _Local_data = _originalData = _data;

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
        var me = this;

        svg.selectAll("g").remove();

        svg.attr("width", width).attr("height", height);

        plotWidth = width - margin.left - margin.right * 2;
        plotHeight = height - margin.top - margin.bottom * 2;

        parentContainer.append("div").attr("class", "custom_tooltip");

        if (_tooltip) {
            tooltip = parentContainer.select(".custom_tooltip");
        }

        container = svg
            .append("g")
            .attr("class", "map")
            .attr(
                "transform",
                "translate(" + margin.left + "," + margin.top + ")"
            );

        projection = d3
            .geoMercator()
            .scale(plotWidth / 2 / Math.PI)
            .translate([plotWidth / 2, plotHeight / 1.4]);

        path = d3.geoPath().projection(projection);

        _data.forEach(function (d) {
            valueMapper[d[_dimension[0]]] = d[_measure[0]];
        });

        var countries = Object.keys(valueMapper);

        gradientColor.range([
            d3.rgb(_displayColor).brighter(),
            d3.rgb(_displayColor).darker(),
        ]);

        gradientColor.domain(
            d3.extent(_data, function (d) {
                return d[_measure[0]];
            })
        );

        ready(Worldtopo, countries);

        if (!_print) {
            var confirm = $(me)
                .parent()
                .find("div.confirm")
                .css("visibility", "hidden");

            var _filter = UTIL.createFilterElement();
            $("#" + parentContainer.attr("id")).append(_filter);

            _local_svg
                .selectAll("path.country")
                .on(
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
                    var confirm = parentContainer
                        .select(".confirm")
                        .style("visibility", "visible");

                    var point = d3.select(this);
                    if (point.classed("_selected")) {
                        point.classed("_selected", false);
                        point.style("fill", point.style("stroke"));
                        point.style("stroke", "#FFFFFF");
                    } else {
                        point.classed("_selected", true);
                        point.style("stroke", point.style("fill"));
                        point.style("fill", COMMON.HIGHLIGHTER);
                    }

                    var _filterDimension = broadcast.selectedFilters || {};

                    var dimension = _dimension[0];
                    if (_filterDimension[dimension]) {
                        var temp = _filterDimension[dimension];
                        if (temp.indexOf(d.properties.name) < 0) {
                            temp.push(d.properties.name);
                        } else {
                            temp.splice(temp.indexOf(d.properties.name), 1);
                        }
                        _filterDimension[dimension] = temp;
                    } else {
                        _filterDimension[dimension] = [d.properties.name];
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
    }

    chart._getName = function () {
        return _NAME;
    };
    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
    };

    chart.update = function (data) {
        valueMapper = [];

        container.selectAll(".country").remove();

        data.forEach(function (d) {
            valueMapper[d[_dimension[0]]] = d[_measure[0]];
        });

        var countries = Object.keys(valueMapper);

        gradientColor.range([
            d3.rgb(_displayColor).brighter(),
            d3.rgb(_displayColor).darker(),
        ]);

        gradientColor.domain(
            d3.extent(data, function (d) {
                return d[_measure[0]];
            })
        );

        ready(Worldtopo, countries);

        if (!_print) {
            _local_svg
                .selectAll("path.country")
                .on(
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
                    var confirm = parentContainer
                        .select(".confirm")
                        .style("visibility", "visible");

                    var point = d3.select(this);
                    if (point.classed("_selected")) {
                        point.classed("_selected", false);
                        point.style("fill", point.style("stroke"));
                        point.style("stroke", "#FFFFFF");
                    } else {
                        point.classed("_selected", true);
                        point.style("stroke", point.style("fill"));
                        point.style("fill", COMMON.HIGHLIGHTER);
                    }

                    var _filterDimension = broadcast.selectedFilters || {};

                    var dimension = _dimension[0];
                    if (_filterDimension[dimension]) {
                        var temp = _filterDimension[dimension];
                        if (temp.indexOf(d.properties.name) < 0) {
                            temp.push(d.properties.name);
                        } else {
                            temp.splice(temp.indexOf(d.properties.name), 1);
                        }
                        _filterDimension[dimension] = temp;
                    } else {
                        _filterDimension[dimension] = [d.properties.name];
                    }

                    _filterDimension[dimension]._meta = {
                        dataType: _dimensionType[0],
                        valueType: "castValueType",
                    };
                    broadcast.saveSelectedFilter(_filterParameters);
                });
        }
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

    chart.numberFormat = function (value) {
        if (!arguments.length) {
            return _numberFormat;
        }
        _numberFormat = value;
        return chart;
    };

    chart.displayColor = function (value) {
        if (!arguments.length) {
            return _displayColor;
        }
        _displayColor = value;
        return chart;
    };

    chart.borderColor = function (value) {
        if (!arguments.length) {
            return __borderColor;
        }
        __borderColor = value;
        return chart;
    };

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
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

    chart.textColor = function (value) {
        if (!arguments.length) {
            return _textColor;
        }
        _textColor = value;
        return chart;
    };

    chart.colorPattern = function (value) {
        if (!arguments.length) {
            return _colorPattern;
        }
        _colorPattern = value;
        return chart;
    };

    chart.colourOfLabels = function (value) {
        if (!arguments.length) {
            return _colourOfLabels;
        }
        _colourOfLabels = value;
        return chart;
    };
    chart.colorSet = function (value) {
        if (!arguments.length) {
            return _colorSet;
        }
        _colorSet = value;
        return chart;
    };

    chart.showValue = function (value) {
        if (!arguments.length) {
            return _showValue;
        }
        _showValue = value;
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
    return chart;
}
module.exports = map;
