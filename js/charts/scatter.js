var d3 = require("d3");
var COMMON = require("../extras/common.js")();
var UTIL = require("../extras/util.js")();
var LEGEND = require("../extras/scatter_legend.js")();
var $ = require("jquery");
try {
    var d3Lasso = require("../../d3-libs/d3-lasso.min.js");
} catch (ex) { }

function scatter() {
    var _NAME = "scatterChart";

    var _config,
        _dimension,
        _dimensionType,
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
        _showValues,
        _displayNameForMeasure,
        _fontStyle,
        _fontWeight,
        _numberFormat,
        _textColor,
        _displayColor,
        _borderColor,
        _fontSize,
        _print,
        broadcast,
        filterParameters,
        _notification = false,
        isLiveEnabled = false,
        _data;

    var _local_svg,
        _Local_data,
        _originalData,
        _localLabelStack = [],
        legendBreakCount = 1;
    var legendSpace = 20,
        axisLabelSpace = 20,
        offsetX = 16,
        offsetY = 3,
        parentContainer,
        color;
    var parentWidth, parentHeight, plotWidth, plotHeight, container;
    var _localXAxis, _localYAxis, _localXGrid, _localYGrid;

    var x = d3.scaleLinear(),
        y = d3.scaleLinear();

    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 45,
    };

    var filter = false,
        filterData = [];
    var threshold = [];

    var tickLength = d3.scaleLinear().domain([22, 34]).range([4, 6]);

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.dimensionType(config.dimensionType);
        this.measure(config.measure);
        this.showLegend(config.showLegend);
        this.legendPosition(config.legendPosition);

        this.showXaxis(config.showXaxis);
        this.showYaxis(config.showYaxis);
        this.showXaxisLabel(config.showXaxisLabel);

        this.showYaxisLabel(config.showYaxisLabel);
        this.xAxisColor(config.xAxisColor);
        this.yAxisColor(config.yAxisColor);
        this.displayName(config.displayName);
        this.showYaxis(config.showYaxis);
        this.showXaxisLabel(config.showXaxisLabel);
        this.showGrid(config.showGrid);
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
    };

    var _buildTooltipData = function (datum, chart) {
        var output = "";
        output += "<table>";

        for (let index = 0; index < _dimension.length; index++) {
            output += "<tr><th>" + _dimension[index] + ": </th>";
            output += "<td>" + datum[_dimension[index]] + "</td></tr>";
        }

        for (let index = 0; index < _measure.length; index++) {
            output += "<tr><th>" + _measure[index] + ": </th>";
            output +=
                "<td>" +
                Math.round(datum[_measure[index]] * 100) / 100 +
                "</td></tr>";
        }
        output += "</table>";

        return output;
    };

    var _setAxisColor = function (axis, color) {
        var path = axis.select("path"),
            ticks = axis.selectAll(".tick");

        path.style("stroke", color);

        ticks.select("line").style("stroke", color);

        ticks.select("text").style("fill", color);
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

            lasso.notSelectedItems().selectAll("circle");

            var confirm = d3
                .select(scope.node().parentNode)
                .select("div.confirm")
                .style("visibility", "visible");

            var _filter = [];

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

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this)
                .style("cursor", "pointer")
                .style("fill-opacity", 0.5);

            var border = d3.select(this).style("fill");
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
            d3.select(this).style("cursor", "default").style("fill-opacity", 1);

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        };
    };

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

        parentWidth =
            width - 2 * COMMON.PADDING - (_showYaxis == true ? margin.left : 0);
        parentHeight =
            height -
            2 * COMMON.PADDING -
            (_showXaxis == true ? axisLabelSpace * 2 : axisLabelSpace);

        plotWidth = parentWidth;
        plotHeight = parentHeight;

        container = svg
            .append("g")
            .attr(
                "transform",
                "translate(" + COMMON.PADDING + ", " + COMMON.PADDING + ")"
            );

        svg.attr("width", width).attr("height", height);

        parentContainer.append("div").attr("class", "custom_tooltip");

        drawPlot.call(this, _data);
        drawLegend.call(this, _data);
    }

    var drawLegend = function (data) {
        var legendWidth = 0,
            legendHeight = 0;

        var list = [];

        data.map(function (val) {
            list.push(val[_dimension[0]]);
        });
        list = list.filter(function (item, i, ar) {
            return ar.indexOf(item) === i;
        });
        if (_showLegend) {
            _local_svg.select(".legend").remove();
            var clusteredverticalbarLegend = LEGEND.bind(chart);

            var result = clusteredverticalbarLegend(list, container, {
                width: parentWidth,
                height: parentHeight,
                legendBreakCount: legendBreakCount,
            });

            legendWidth = result.legendWidth;
            legendHeight = result.legendHeight;
            legendBreakCount = result.legendBreakCount;

            switch (_legendPosition.toUpperCase()) {
                case "TOP":
                    plotHeight = parentHeight - legendHeight - axisLabelSpace;
                    break;
                case "BOTTOM":
                    plotHeight =
                        parentHeight - legendHeight - axisLabelSpace * 2;
                    break;
                case "RIGHT":
                case "LEFT":
                    plotWidth = parentWidth - legendWidth;
                    break;
            }

            if (
                _legendPosition.toUpperCase() == "TOP" ||
                _legendPosition.toUpperCase() == "BOTTOM"
            ) {
                plotWidth = parentWidth;
                plotHeight = parentHeight - 3 * axisLabelSpace;
                legendSpace = 20;
            } else if (
                _legendPosition.toUpperCase() == "LEFT" ||
                _legendPosition.toUpperCase() == "RIGHT"
            ) {
                var legend = _local_svg.selectAll(".item");
                legendSpace = legend.node().parentNode.getBBox().width;
                plotWidth =
                    parentWidth - legendSpace - margin.left + axisLabelSpace;
                plotHeight = parentHeight;

                legend.attr("transform", function (d, i) {
                    if (_legendPosition.toUpperCase() == "LEFT") {
                        return "translate(0, " + i * 20 + ")";
                    } else if (_legendPosition.toUpperCase() == "RIGHT") {
                        return (
                            "translate(" +
                            (parentWidth - legendSpace + axisLabelSpace + 10) +
                            ", " +
                            i * 20 +
                            ")"
                        );
                    }
                });
            }
        } else {
            legendSpace = 0;
            plotWidth = parentWidth;
            plotHeight = parentHeight;
        }
    };

    var drawPlot = function (data) {
        var me = this;
        color = null;
        color = COMMON.COLORSCALE;
        _local_total = d3.sum(
            data.map(function (d) {
                return d[_measure[0]];
            })
        );

        var plot = container
            .append("g")
            .attr("class", "scatter-plot")
            .classed("plot", true)
            .attr("transform", function () {
                if (_legendPosition.toUpperCase() == "TOP") {
                    return (
                        "translate(" +
                        margin.left +
                        ", " +
                        legendSpace * 2 +
                        ")"
                    );
                } else if (_legendPosition.toUpperCase() == "BOTTOM") {
                    return "translate(" + margin.left + ", 0)";
                } else if (_legendPosition.toUpperCase() == "LEFT") {
                    return (
                        "translate(" +
                        (legendSpace + margin.left + axisLabelSpace) +
                        ", 0)"
                    );
                } else if (_legendPosition.toUpperCase() == "RIGHT") {
                    return "translate(" + margin.left + ", 0)";
                }
            });

        if (!_showLegend) {
            _local_svg.select(".plot").attr("transform", function () {
                return "translate(" + margin.left + ", " + 0 + ")";
            });
        }
        if (!_showXaxis) {
            _local_svg.select(".plot").attr("transform", function () {
                return "translate(" + 0 + ", " + 0 + ")";
            });
        }

        var keys = UTIL.getMeasureList(data[0], _dimension);

        var maxGDP = d3.max(data, function (d) {
            return d3.max(keys, function (key) {
                return parseFloat(d[key]);
            });
        });
        var minGDP = d3.min(data, function (d) {
            return d3.min(keys, function (key) {
                return parseFloat(d[key]);
            });
        });

        var maxGDP = d3.max(data, (d) => d[_measure[1]]);
        var minGDP = d3.min(data, (d) => d[_measure[1]]);

        var rScale = d3.scaleLinear().domain([minGDP, maxGDP]).range([5, 25]);

        var maxx = d3.max(data, (d) => d[_measure[2]]);
        var minx = d3.min(data, (d) => d[_measure[2]]);

        x.rangeRound([0, plotWidth]).domain([minx, maxx]);

        var maxy = d3.max(data, (d) => d[_measure[0]]);
        var miny = d3.min(data, (d) => d[_measure[0]]);

        y.rangeRound([plotHeight - 40, 0]).domain([miny, maxy]);

        var _localXLabels = data.map(function (d) {
            return d[_dimension[0]];
        });

        _localXGrid = d3
            .axisBottom()
            .ticks(_localXLabels.length)
            .tickFormat("")
            .tickSize(-plotHeight + 40);

        _localYGrid = d3.axisLeft().tickFormat("").tickSize(-plotWidth);

        _localXGrid.scale(x);
        _localYGrid.scale(y);

        plot.append("g")
            .attr("class", "x grid")
            .attr("visibility", "visible")
            .attr(
                "transform",
                "translate(0, " + parseInt(plotHeight - 40) + ")"
            )
            .call(_localXGrid);

        plot.append("g")
            .attr("class", "y grid")
            .attr("visibility", "visible")
            .call(_localYGrid);

        if (_tooltip) {
            tooltip = parentContainer.select(".custom_tooltip");
        }

        var xAxisGroup, yAxisGroup;

        var isRotate = false;

        var dataCircle = plot
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cx", function (d) {
                return x(d[_measure[2]]);
            })
            .attr("cy", function (d) {
                return y(d[_measure[0]]);
            })
            .attr("r", function (d) {
                return rScale(parseInt(d[_measure[1]]));
            })
            .style("fill", function (d) {
                return color(d[_dimension[0]]);
            })
            .attr("stroke", function (d) {
                return color(d[_dimension[0]]);
            })
            .style("fill-opacity", 1);

        if (_showXaxis) {
            _localXAxis = d3
                .axisBottom(x)
                .tickSize(0)
                .tickFormat(function (d) {
                    if (isRotate == false) {
                        isRotate = UTIL.getTickRotate(
                            d,
                            plotWidth / _localXLabels.length,
                            tickLength
                        );
                    }
                    return UTIL.getTruncatedTick(
                        d,
                        plotWidth / _localXLabels.length,
                        tickLength,
                        _dimensionType[0]
                    );
                })
                .tickPadding(10);

            xAxisGroup = plot
                .append("g")
                .attr("class", "x_axis")
                .attr("visibility", function () {
                    return "visible";
                })
                .attr(
                    "transform",
                    "translate(0, " + parseInt(plotHeight - 40) + ")"
                )
                .call(_localXAxis);

            xAxisGroup
                .append("g")
                .attr("class", "label")
                .attr("transform", function () {
                    return (
                        "translate(" +
                        plotWidth / 2 +
                        ", " +
                        parseFloat(
                            COMMON.AXIS_THICKNESS / 1.5 + COMMON.PADDING
                        ) +
                        ")"
                    );
                })
                .append("text")
                .style("text-anchor", "middle")
                .style("font-weight", "bold")
                .style("fill", _xAxisColor)
                .attr("visibility", UTIL.getVisibility(_showXaxisLabel))
                .text(_displayName);

            if (isRotate) {
                _local_svg
                    .selectAll(".x_axis .tick text")
                    .attr("transform", "rotate(-15)");
            }

            _setAxisColor(xAxisGroup, _xAxisColor);
        }

        if (_showYaxis) {
            _localYAxis = d3
                .axisLeft(y)
                .tickSize(0)
                .tickPadding(8)
                .tickFormat(function (d) {
                    return UTIL.shortScale(2)(d);
                });

            yAxisGroup = plot
                .append("g")
                .attr("class", "y_axis")
                .attr("visibility", function () {
                    return "visible";
                })
                .call(_localYAxis);

            yAxisGroup
                .append("g")
                .attr("class", "label")
                .attr("transform", function () {
                    return (
                        "translate(" +
                        -COMMON.AXIS_THICKNESS / 1.15 +
                        ", " +
                        plotHeight / 2 +
                        ")"
                    );
                })
                .append("text")
                .attr("transform", "rotate(-90)")
                .style("text-anchor", "middle")
                .style("font-weight", "bold")
                .style("fill", _yAxisColor)
                .attr("visibility", UTIL.getVisibility(_showYaxisLabel))
                .text(function () {
                    return _displayNameForMeasure
                        .map(function (p) {
                            return p;
                        })
                        .join(", ");
                })
                .text(function () {
                    var text = _displayNameForMeasure
                        .map(function (p) {
                            return p;
                        })
                        .join(", ");
                    if (!_print) {
                        return UTIL.getTruncatedLabel(this, text, plotHeight);
                    } else {
                        return text;
                    }
                })
                .append("svg:title")
                .text(function (d, i) {
                    return _displayNameForMeasure
                        .map(function (p) {
                            return p;
                        })
                        .join(", ");
                });
        }

        if (!_print) {
            var confirm = $(me)
                .parent()
                .find("div.confirm")
                .css("visibility", "hidden");

            //remove Threshold modal popup
            // var str = UTIL.createAlert($(div).attr('id'), _measure);
            // $(div).append(str);

            var _filter = UTIL.createFilterElement();
            $("#" + parentContainer.attr("id")).append(_filter);

            $(document).on("click", "_local_svg", function (e) {
                if ($("#myonoffswitch").prop("checked") == false) {
                    var element = e.target;
                    if (element.tagName == "_local_svg") {
                        $(
                            "#Modal_" + parentContainer.attr("id") + " .measure"
                        ).val("");
                        $(
                            "#Modal_" +
                            parentContainer.attr("id") +
                            " .threshold"
                        ).val("");
                        $(
                            "#Modal_" + parentContainer.attr("id") + " .measure"
                        ).attr("disabled", false);
                        $("#Modal_" + parentContainer.attr("id")).modal(
                            "toggle"
                        );
                    }
                }
            });

            $(document).on(
                "click",
                "#Modal_" + parentContainer.attr("id") + " .ThresholdSubmit",
                function (e) {
                    var newValue = $(
                        "#Modal_" + parentContainer.attr("id") + " .threshold"
                    ).val();
                    var obj = new Object();
                    obj.measure = $(
                        "#Modal_" + parentContainer.attr("id") + " .measure"
                    ).val();
                    obj.threshold = newValue;
                    threshold.push(obj);
                    $("#Modal_" + parentContainer.attr("id")).modal("toggle");
                }
            );
            parentContainer.select(".filterData").on("click", applyFilter());

            parentContainer
                .select(".removeFilter")
                .on("click", clearFilter(parentContainer));

            _local_svg.select("g.lasso").remove();
            var lasso = d3Lasso
                .lasso()
                .hoverSelect(true)
                .closePathSelect(true)
                .closePathDistance(100)
                .items(dataCircle)
                .targetArea(_local_svg);

            lasso
                .on("start", onLassoStart(lasso, _local_svg))
                .on("draw", onLassoDraw(lasso, _local_svg))
                .on("end", onLassoEnd(lasso, _local_svg));

            _local_svg.call(lasso);
        }
        if (!_print || _notification) {
            dataCircle
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
                .on("click", function (d) {
                    if (!_print) {
                        if (isLiveEnabled) {
                            broadcast.$broadcast("FlairBi:livemode-dialog");
                            return;
                        }
                        filter = false;
                        var confirm = parentContainer
                            .select(".confirm")
                            .style("visibility", "visible");
                        var rect = d3.select(this);
                        if (rect.classed("selected")) {
                            rect.classed("selected", false);
                        } else {
                            rect.classed("selected", true);
                        }
                        if (_localLabelStack.indexOf(d[_dimension[0]]) == -1) {
                            _localLabelStack.push(d[_dimension[0]]);
                        } else {
                            _localLabelStack.splice(
                                _localLabelStack.indexOf(d[_dimension[0]]),
                                1
                            );
                        }

                        var _filter = _Local_data.filter(function (val) {
                            if (
                                _localLabelStack.indexOf(val[_dimension[0]]) ==
                                -1
                            ) {
                                return val;
                            }
                        });

                        filterData = _filter;

                        var _filterDimension = broadcast.selectedFilters || {};
                        s
                        var dimension = _dimension[0];
                        if (_filterDimension[dimension]) {
                            var temp = _filterDimension[dimension];
                            if (temp.indexOf(d[_dimension[0]]) < 0) {
                                temp.push(d[_dimension[0]]);
                            } else {
                                temp.splice(temp.indexOf(d[_dimension[0]]), 1);
                            }
                            _filterDimension[dimension] = temp;
                        } else {
                            _filterDimension[dimension] = [d[_dimension[0]]];
                        }
                        _filterDimension[dimension]._meta = {
                            dataType: _dimensionType[0],
                            valueType: "castValueType",
                        };
                        broadcast.saveSelectedFilter(_filterDimension);
                    }
                });
        }
    };

    chart._legendInteraction = function (event, data, plot) {
        if (_print) {
            // No interaction during print enabled
            return;
        }
        switch (event) {
            case "mouseover":
                _legendMouseOver(data, plot);
                break;
            case "mousemove":
                _legendMouseMove(data, plot);
                break;
            case "mouseout":
                _legendMouseOut(data, plot);
                break;
            case "click":
                _legendClick(data, plot);
                break;
        }
    };
    var _legendMouseOver = function (data, plot) {
        plot.selectAll("circle")
            .filter(function (d) {
                return d[_dimension[0]] === data;
            })
            .style("fill", COMMON.HIGHLIGHTER);
    };

    var _legendMouseMove = function (data, plot) { };

    var _legendMouseOut = function (data, plot) {
        var circle = plot.selectAll("circle").filter(function (d) {
            return d[_dimension[0]] === data;
        });
        circle.style("fill", circle.attr("stroke"));
    };

    var _legendClick = function (data) {
        if (_localLabelStack.indexOf(data) == -1) {
            _localLabelStack.push(data);
        } else {
            _localLabelStack.splice(_localLabelStack.indexOf(data), 1);
        }

        var _filter = _Local_data.filter(function (val) {
            if (_localLabelStack.indexOf(val[_dimension[0]]) == -1) {
                return val;
            }
        });

        drawPlot.call(this, _filter);
    };

    chart._getName = function () {
        return _NAME;
    };

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
    };

    chart.update = function (data) {
        var svg = _local_svg
            .attr("width", parentContainer.attr("width"))
            .attr("height", parentContainer.attr("height"));

        var width = +svg.attr("width"),
            height = +svg.attr("height");

        parentWidth =
            width - 2 * COMMON.PADDING - (_showYaxis == true ? margin.left : 0);
        parentHeight =
            height -
            2 * COMMON.PADDING -
            (_showXaxis == true ? axisLabelSpace * 2 : axisLabelSpace);

        plotWidth = parentWidth;
        plotHeight = parentHeight;

        if (_tooltip) {
            tooltip = parentContainer.select(".custom_tooltip");
        }

        (_Local_data = data), (filterData = []);
        var plot = _local_svg.select(".plot");

        var keys = UTIL.getMeasureList(data[0], _dimension);

        var maxGDP = d3.max(data, function (d) {
            return d3.max(keys, function (key) {
                return parseFloat(d[key]);
            });
        });
        var minGDP = d3.min(data, function (d) {
            return d3.min(keys, function (key) {
                return parseFloat(d[key]);
            });
        });

        var maxGDP = d3.max(data, (d) => d[_measure[1]]);
        var minGDP = d3.min(data, (d) => d[_measure[1]]);

        var rScale = d3.scaleLinear().domain([minGDP, maxGDP]).range([5, 25]);

        var maxx = d3.max(data, (d) => d[_measure[2]]);
        var minx = d3.min(data, (d) => d[_measure[2]]);

        x.rangeRound([0, plotWidth]).domain([minx, maxx]);

        var maxy = d3.max(data, (d) => d[_measure[0]]);
        var miny = d3.min(data, (d) => d[_measure[0]]);

        y.rangeRound([plotHeight - 40, 0]).domain([miny, maxy]);

        var _localXLabels = data.map(function (d) {
            return d[_dimension[0]];
        });

        var circle = plot.selectAll("circle").data(data);

        circle.exit().remove();

        circle
            .attr("cx", function (d) {
                return x(d[_measure[2]]);
            })
            .attr("cy", function (d) {
                return y(d[_measure[0]]);
            })
            .attr("r", function (d) {
                return rScale(parseInt(d[_measure[1]]));
            })
            .style("fill", function (d) {
                return color(d[_dimension[0]]);
            })
            .attr("stroke", function (d) {
                return color(d[_dimension[0]]);
            })
            .style("fill-opacity", 1)
            .classed("selected", false);

        circle
            .enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cx", function (d) {
                return x(d[_measure[2]]);
            })
            .attr("cy", function (d) {
                return y(d[_measure[0]]);
            })
            .attr("r", function (d) {
                return rScale(parseInt(d[_measure[1]]));
            })
            .style("fill", function (d) {
                return color(d[_dimension[0]]);
            })
            .attr("stroke", function (d) {
                return color(d[_dimension[0]]);
            })
            .style("fill-opacity", 1)
            .classed("selected", false)
            .on(
                "mouseover",
                _handleMouseOverFn.call(chart, tooltip, _local_svg)
            )
            .on(
                "mousemove",
                _handleMouseMoveFn.call(chart, tooltip, _local_svg)
            )
            .on("mouseout", _handleMouseOutFn.call(chart, tooltip, _local_svg))
            .on("click", function (d) {
                if (isLiveEnabled) {
                    broadcast.$broadcast("FlairBi:livemode-dialog");
                    return;
                }
                filter = false;
                var confirm = parentContainer
                    .select(".confirm")
                    .style("visibility", "visible");
                var rect = d3.select(this);
                if (rect.classed("selected")) {
                    rect.classed("selected", false);
                } else {
                    rect.classed("selected", true);
                }
                if (_localLabelStack.indexOf(d[_dimension[0]]) == -1) {
                    _localLabelStack.push(d[_dimension[0]]);
                } else {
                    _localLabelStack.splice(
                        _localLabelStack.indexOf(d[_dimension[0]]),
                        1
                    );
                }

                var _filter = _Local_data.filter(function (val) {
                    if (_localLabelStack.indexOf(val[_dimension[0]]) == -1) {
                        return val;
                    }
                });

                filterData = _filter;

                var _filterDimension = broadcast.selectedFilters || {};
                if (broadcast.filterSelection.id) {
                    _filterDimension = broadcast.selectedFilters[_dimension[0]] || {};
                } else {
                    broadcast.filterSelection.id = parentContainer.attr("id");
                }
                var dimension = _dimension[0];
                if (_filterDimension[dimension]) {
                    var temp = _filterDimension[dimension];
                    if (temp.indexOf(d[_dimension[0]]) < 0) {
                        temp.push(d[_dimension[0]]);
                    } else {
                        temp.splice(temp.indexOf(d[_dimension[0]]), 1);
                    }
                    _filterDimension[dimension] = temp;
                } else {
                    _filterDimension[dimension] = [d[_dimension[0]]];
                }
                _filterDimension[dimension]._meta = {
                    dataType: _dimensionType[0],
                    valueType: "castValueType",
                };
                broadcast.saveSelectedFilter(_filterDimension);
            });

        var _localXLabels = data.map(function (d) {
            return d[_dimension[0]];
        });

        var xAxisGroup, yAxisGroup;

        var isRotate = false;

        _localXAxis.tickFormat(function (d) {
            if (isRotate == false) {
                isRotate = UTIL.getTickRotate(
                    d,
                    plotWidth / _localXLabels.length,
                    tickLength
                );
            }
            return UTIL.getTruncatedTick(
                d,
                plotWidth / _localXLabels.length,
                tickLength,
                _dimensionType[0]
            );
        });

        if (_showXaxis) {
            xAxisGroup = plot
                .select(".x_axis")
                .transition()
                .duration(COMMON.DURATION)
                .call(_localXAxis);

            _setAxisColor(xAxisGroup, _xAxisColor);

            if (isRotate) {
                _local_svg
                    .selectAll(".x_axis .tick text")
                    .attr("transform", "rotate(-15)");
            } else {
                _local_svg
                    .selectAll(".x_axis .tick text")
                    .attr("transform", "rotate(0)");
            }
        }

        if (_showYaxis) {
            yAxisGroup = plot
                .select(".y_axis")
                .transition()
                .duration(COMMON.DURATION)
                .call(_localYAxis);
        }

        /* Update Axes Grid */
        _localXGrid.scale(x);
        _localYGrid.scale(y);

        plot.select(".x.grid")
            .transition()
            .duration(COMMON.DURATION)
            .attr("visibility", "visible")
            .call(_localXGrid);

        plot.select(".y.grid")
            .transition()
            .duration(COMMON.DURATION)
            .attr("visibility", "visible")
            .call(_localYGrid);

        _local_svg.select("g.lasso").remove();
        var lasso = d3Lasso
            .lasso()
            .hoverSelect(true)
            .closePathSelect(true)
            .closePathDistance(100)
            .items(circle)
            .targetArea(_local_svg);

        lasso
            .on("start", onLassoStart(lasso, _local_svg))
            .on("draw", onLassoDraw(lasso, _local_svg))
            .on("end", onLassoEnd(lasso, _local_svg));

        _local_svg.call(lasso);

        drawLegend.call(this, data);
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

    chart.showLegend = function (value) {
        if (!arguments.length) {
            return _showLegend;
        }
        _showLegend = value;
        return chart;
    };

    chart.legendPosition = function (value) {
        if (!arguments.length) {
            return _legendPosition;
        }
        _legendPosition = value;
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

    chart.showXaxis = function (value) {
        if (!arguments.length) {
            return _showXaxis;
        }
        _showXaxis = value;
        return chart;
    };

    chart.showYaxis = function (value) {
        if (!arguments.length) {
            return _showYaxis;
        }
        _showYaxis = value;
        return chart;
    };

    chart.showXaxisLabel = function (value) {
        if (!arguments.length) {
            return _showXaxisLabel;
        }
        _showXaxisLabel = value;
        return chart;
    };

    chart.showYaxisLabel = function (value) {
        if (!arguments.length) {
            return _showYaxisLabel;
        }
        _showYaxisLabel = value;
        return chart;
    };

    chart.xAxisColor = function (value) {
        if (!arguments.length) {
            return _xAxisColor;
        }
        _xAxisColor = value;
        return chart;
    };

    chart.yAxisColor = function (value) {
        if (!arguments.length) {
            return _yAxisColor;
        }
        _yAxisColor = value;
        return chart;
    };

    chart.showGrid = function (value) {
        if (!arguments.length) {
            return _showGrid;
        }
        _showGrid = value;
        return chart;
    };

    chart.stacked = function (value) {
        if (!arguments.length) {
            return _stacked;
        }
        _stacked = value;
        return chart;
    };

    chart.displayName = function (value) {
        if (!arguments.length) {
            return _displayName;
        }
        _displayName = value;
        return chart;
    };

    chart.legendData = function (measureConfig, measureName) {
        _legendData = {
            measureConfig: measureConfig,
            measureName: measureName,
        };
        return _legendData;
    };

    chart.showValues = function (value) {
        if (!arguments.length) {
            return _showValues;
        }
        _showValues = value;
        return chart;
    };

    chart.displayNameForMeasure = function (value) {
        if (!arguments.length) {
            return _displayNameForMeasure;
        }
        _displayNameForMeasure = value;
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

    chart.numberFormat = function (value) {
        if (!arguments.length) {
            return _numberFormat;
        }
        _numberFormat = value;
        return chart;
    };

    chart.textColor = function (value) {
        if (!arguments.length) {
            return _textColor;
        }
        _textColor = value;
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
            return _borderColor;
        }
        _borderColor = value;
        return chart;
    };

    chart.fontSize = function (value) {
        if (!arguments.length) {
            return _fontSize;
        }
        _fontSize = value;
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
    return chart;
}

module.exports = scatter;
