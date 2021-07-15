var d3 = require("d3");
var COMMON = require("../extras/common.js")();
var UTIL = require("../extras/util.js")();
var LEGEND = require("../extras/legend.js")();
var $ = require("jquery");
try {
    var d3Lasso = require("../../d3-libs/d3-lasso.min.js");
} catch (ex) { }
function doughnut() {
    /* These are the constant global variable for the function doughnut.
     */
    var _NAME = "doughnut";

    /* These are the private variables that is initialized by the arguments sent
     * by the users and can be updated using public methods.
     */
    var _config,
        _dimension,
        _dimensionType,
        _measure,
        _legend,
        _legendPosition,
        _valueAs,
        _sort,
        _tooltip,
        _print,
        _numberFormat,
        _valuePosition = "outside",
        broadcast,
        filterParameters,
        _measureDisplayName,
        _showLabel,
        _fontSize,
        _fontStyle,
        _fontWeight,
        _fontColor,
        _notification = false,
        isLiveEnabled = false,
        _data;

    /* These are the common variables that is shared across the different private/public
     * methods but is initialized/updated within the methods itself.
     */
    var _local_svg,
        _localTotal = 0,
        _localTransitionTime = 500,
        _localTransitionMap = d3.map(),
        _localSortedMeasureValue = [],
        tooltip,
        _localKey,
        _localLegend,
        _localLabelStack = [],
        _local_data,
        _originalData;

    var filter = false,
        filterData = [],
        container,
        parentContainer,
        plotWidth,
        plotHeight,
        legendBreakCount = 1;

    /* These are the common private functions that is shared across the different private/public
     * methods but is initialized beforehand.
     */
    var _doughnut = d3.pie().sort(null);

    var _arc = d3.arc();

    var _arcMask = d3.arc();

    var _labelArc = d3.arc();

    /* -------------------------------------------------------------------------------- */
    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.dimensionType(config.dimensionType);
        this.measure(config.measure);
        this.legend(config.legend);
        this.legendPosition(config.legendPosition);
        this.valueAs(config.valueAs);
        this.tooltip(config.tooltip);
        this.showLabel(config.showLabel);
        this.fontSize(config.fontSize);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        this.fontColor(config.fontColor);
        this.measureDisplayName(config.measureDisplayName);
        this.numberFormat(config.numberFormat);
    };

    /**
     * Period function that stretches the rendering process
     *
     * @param {number} extraDuration Additional duration value in milliseconds
     * @return {function} Accessor function that computes the duration period
     */
    var _durationFn = function (extraDuration) {
        if (extraDuration === void 0) {
            extraDuration = 0;
        }

        if (isNaN(+extraDuration)) {
            throw new TypeError("Not a number");
        }

        return function (d, i) {
            var t = _localTransitionMap.get(d.value);

            if (!t) {
                t = _localTransitionTime * (d.value / _localTotal);
                _localTransitionMap.set(d.value, t);
            }

            return t + extraDuration;
        };
    };

    /**
     * Delay function that delays the start of rendering process
     *
     * @param {number} extraDelay Additional delay value in milliseconds
     * @return {function} Accessor function that computes the delay period
     */
    var _delayFn = function (extraDelay) {
        if (extraDelay === void 0) {
            extraDelay = 0;
        }

        if (isNaN(+extraDelay)) {
            throw new TypeError("TypeError: Not a number");
        }

        return function (d, i) {
            var i = _localSortedMeasureValue.indexOf(d.value),
                t = 0;

            while (i > 0) {
                i--;
                t += _localTransitionMap.get(_localSortedMeasureValue[i]);
            }

            return t + extraDelay;
        };
    };

    /**
     * Gives the value of hypotenuse using pythagorous theorem
     *
     * @param {number} x Value of perpendicular
     * @param {number} y Value of base
     * @return {number} Value of hypotenuse
     */
    var _pythagorousTheorem = function (x, y) {
        if (isNaN(+x) || isNaN(+y)) {
            throw new Error("TypeError: Not a number");
            return 0;
        }

        return Math.sqrt(Math.pow(+x, 2) + Math.pow(+y, 2));
    };

    /**
     * Label function to provide the label to be shown
     *
     * @return {function} Accessor function that identifies the label text
     */
    var _labelFn = function () {
        return function (d, i) {
            var result;

            switch (_valueAs) {
                case "label":
                    result = UTIL.getDimensionFormatedValue(
                        d.data[_dimension[0]],
                        _dimensionType[0]
                    );
                    break;
                case "value":
                    result = UTIL.getFormattedValue(
                        d.data[_measure[0]],
                        UTIL.getNumberFormatterFn("Actual", d.data[_measure[0]])
                    );
                    break;
                case "percentage":
                    result =
                        ((100 * d.data[_measure[0]]) / _localTotal).toFixed(2) +
                        " %";
                    break;
                default:
                    result = UTIL.getDimensionFormatedValue(
                        d.data[_dimension[0]],
                        _dimensionType[0]
                    );
            }

            return result;
        };
    };

    /**
     * Builds the html data for the tooltip
     *
     * @param {object} datum Datum forming the arc
     * @param {function} chart Doughnut chart function
     * @return {string} String encoded HTML data
     */
    var _buildTooltipData = function (datum, chart) {
        var output = "";

        output +=
            "<table><tr>" +
            "<th>" +
            chart.dimension() +
            ": </th>" +
            "<td>" +
            UTIL.getDimensionFormatedValue(
                datum[chart.dimension()],
                _dimensionType[0]
            ) +
            "</td>" +
            "</tr><tr>" +
            "<th>" +
            chart.measure() +
            ": </th>" +
            "<td>" +
            Math.round(datum[chart.measure()] * 100) / 100 +
            "</td>" +
            "</tr></table>";

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
    var onLassoStart = function (lasso, scope) {
        return function () {
            if (filter) {
                lasso
                    .items()
                    .selectAll("path")
                    .classed("not_possible", true)
                    .classed("selected", false);
            }
        };
    };

    var onLassoDraw = function (lasso, scope) {
        return function () {
            filter = true;
            lasso.items().selectAll("path").classed("selected", false);

            lasso
                .possibleItems()
                .selectAll("path")
                .classed("not_possible", false)
                .classed("possible", true);

            lasso
                .notPossibleItems()
                .selectAll("path")
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
                    .selectAll("path")
                    .classed("not_possible", false)
                    .classed("possible", false);
            }

            lasso.selectedItems().selectAll("path").classed("selected", true);

            lasso.notSelectedItems().selectAll("path");

            var confirm = d3
                .select(scope.node().parentNode)
                .select("div.confirm")
                .style("visibility", "visible");

            var _filter = [];
            if (data.length > 0) {
                data.forEach(function (d) {
                    var obj = new Object();
                    obj[chart.dimension()] = d.data[chart.dimension()];
                    obj[chart.measure()] = d.data[chart.measure()];
                    _filter.push(obj);
                });
            } else {
                filterData = [];
            }
            if (_filter.length > 0) {
                filterData = _filter;
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
    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style("cursor", "pointer");
            var border = d3.select(this).select("path").attr("fill");

            var arcGroup = container.selectAll("g.arc").filter(function (d1) {
                return d1.data[_dimension[0]] === d.data[_dimension[0]];
            });

            arcGroup.select("path").style("fill", COMMON.HIGHLIGHTER);

            var arcMaskGroup = container
                .selectAll("g.arc-mask")
                .filter(function (d1) {
                    return d1.data[_dimension[0]] === d.data[_dimension[0]];
                });

            arcMaskGroup.select("path").style("visibility", "visible");

            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(
                    tooltip,
                    _buildTooltipData(d.data, me),
                    container,
                    border,
                    _notification
                );
            }
        };
    };

    var _handleMouseMoveFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                var border = d3.select(this).select("path").attr("fill");
                UTIL.updateTooltip.call(
                    tooltip,
                    _buildTooltipData(d.data, me),
                    container,
                    border,
                    _notification
                );
            }
        };
    };

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style("cursor", "default");

            var arcGroup = container.selectAll("g.arc").filter(function (d1) {
                return d1.data[_dimension[0]] === d.data[_dimension[0]];
            });

            arcGroup.select("path").style("fill", function (d1) {
                return COMMON.COLORSCALE(d1.data[_dimension[0]]);
            });

            var arcMaskGroup = container
                .selectAll("g.arc-mask")
                .filter(function (d1) {
                    return d1.data[_dimension[0]] === d.data[_dimension[0]];
                });

            arcMaskGroup.select("path").style("visibility", "hidden");

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        };
    };

    var _legendMouseOver = function (data, plot) {
        plot.selectAll("g.arc")
            .filter(function (d) {
                return d.data[_dimension[0]] === data[_dimension[0]];
            })
            .select("path")
            .style("fill", COMMON.HIGHLIGHTER);

        plot.selectAll("g.arc-mask")
            .filter(function (d) {
                return d.data[_dimension[0]] === data[_dimension[0]];
            })
            .select("path")
            .style("visibility", "visible");
    };

    var _legendMouseMove = function (data, plot) { };

    var _legendMouseOut = function (data, plot) {
        plot.selectAll("g.arc")
            .filter(function (d) {
                return d.data[_dimension[0]] === data[_dimension[0]];
            })
            .select("path")
            .style("fill", function (d, i) {
                return COMMON.COLORSCALE(d.data[_dimension[0]]);
            });

        plot.selectAll("g.arc-mask")
            .filter(function (d) {
                return d.data[_dimension[0]] === data[_dimension[0]];
            })
            .select("path")
            .style("visibility", "hidden");
    };

    var _legendClick = function (data) {
        var _filter = UTIL.getFilterDataForPie(
            _localLabelStack,
            data[_dimension[0]],
            _local_data,
            _dimension
        );
        chart.update(_filter);
    };

    var _mergeForTransition = function (fData, sData) {
        var secondSet = d3.set();

        sData.forEach(function (d) {
            secondSet.add(d[_dimension[0]]);
        });

        var onlyFirst = fData
            .filter(function (d) {
                return !secondSet.has(d[_dimension[0]]);
            })
            .map(function (d) {
                var obj = {};

                obj[_dimension[0]] = d[_dimension[0]];
                obj[_measure[0]] = 0;

                return obj;
            });

        return d3.merge([sData, onlyFirst]);
    };

    function chart(selection) {
        data = _local_data = _originalData = _data;

        if (_print && !_notification) {
            parentContainer = selection;
        } else {
            parentContainer = d3.select("#" + selection.id);
        }

        var svg = parentContainer
            .append("svg")
            .attr("width", parentContainer.attr("width"))
            .attr("height", parentContainer.attr("height"));

        data.map(function (d) {
            d[_measure[0]] = Math.abs(d[_measure[0]]);
        });

        _local_svg = svg;

        parentContainer.append("div").attr("class", "custom_tooltip");

        var width = +svg.attr("width"),
            height = +svg.attr("height"),
            parentWidth = width - 2 * COMMON.PADDING,
            parentHeight = height - 2 * COMMON.PADDING,
            outerRadius;

        var me = this;

        if (_tooltip) {
            tooltip = parentContainer.select(".custom_tooltip");
        }

        /* total sum of the measure values */
        _localTotal = d3.sum(
            data.map(function (d) {
                return d[_measure[0]];
            })
        );

        // /* applying sort operation to the data */
        // // UTIL.sorter(data, _measure, _sort);

        // data.sort(function (a, b) {
        //     return d3.ascending(a[_dimension[0]], b[_dimension[0]]);
        // });

        /* extracting measure values only from the data */
        _localSortedMeasureValue = data.map(function (d) {
            return +d[_measure[0]];
        });

        container = svg
            .append("g")
            .classed("container", true)
            .attr(
                "transform",
                "translate(" + COMMON.PADDING + ", " + COMMON.PADDING + ")"
            );

        var legendWidth = 0,
            legendHeight = 0;
        plotWidth = parentWidth;
        plotHeight = parentHeight;

        if (_legend) {
            _localLegend = LEGEND.bind(chart);

            var result = _localLegend(
                data,
                container,
                {
                    width: parentWidth,
                    height: parentHeight,
                    legendBreakCount: legendBreakCount,
                },
                _localLabelStack
            );

            legendWidth = result.legendWidth;
            legendHeight = result.legendHeight;
            legendBreakCount = result.legendBreakCount;

            switch (_legendPosition.toUpperCase()) {
                case "TOP":
                case "BOTTOM":
                    plotHeight =
                        plotHeight -
                        parseFloat(20 * parseFloat(legendBreakCount) + 20);
                    break;
                case "RIGHT":
                case "LEFT":
                    plotWidth = plotWidth - legendWidth;
                    break;
            }
        } else {
            legendBreakCount = 0;
        }
        outerRadius = Math.min(plotWidth, plotHeight) / 2.25;

        /* setting the outerradius of the arc */
        _arc.outerRadius(outerRadius).innerRadius(outerRadius * 0.8);

        /* setting the innerradius and outerradius of the masking arc */
        _arcMask
            .outerRadius(outerRadius * 1.02)
            .innerRadius(outerRadius * 1.01);

        /* setting the outerradius and innerradius of the arc */
        _labelArc.outerRadius(outerRadius).innerRadius(outerRadius * 0.8);

        var plot = container
            .append("g")
            .attr("id", "doughnut-plot")
            .classed("plot", true)
            .attr("transform", function () {
                var translate = [0, 0];

                switch (_legendPosition.toUpperCase()) {
                    case "TOP":
                        translate = [
                            plotWidth / 2,
                            20 * parseFloat(legendBreakCount + 1) +
                            plotHeight / 2,
                        ];
                        break;
                    case "BOTTOM":
                    case "RIGHT":
                        translate = [plotWidth / 2, plotHeight / 2];
                        break;
                    case "LEFT":
                        translate = [
                            legendWidth + plotWidth / 2,
                            plotHeight / 2,
                        ];
                }

                return "translate(" + translate.toString() + ")";
            });

        _localKey = function (d) {
            return d.data[_dimension[0]];
        };

        var centerText = plot
            .append("text")
            .attr("id", "measure-value")
            .style("text-anchor", "middle")
            .style("fill", _fontColor)
            .style("font-size", _fontSize + "px")
            .style("font-weight", _fontWeight)
            .style("font-style", _fontStyle)
            .attr("visibility", _showLabel == true ? "visible" : "hidden")
            .append("tspan")
            .text(function () {
                if (!_print) {
                    return UTIL.getTruncatedLabel(
                        this,
                        _measureDisplayName,
                        outerRadius * 0.8
                    );
                } else {
                    return _measureDisplayName;
                }
            })
            .attr("x", 0)
            .append("tspan")
            .text(function () {
                if (!_print) {
                    return UTIL.getTruncatedLabel(
                        this,
                        UTIL.getFormattedValue(
                            _localTotal,
                            UTIL.getNumberFormatterFn(
                                _numberFormat,
                                _localTotal
                            )
                        ),
                        outerRadius * 0.8
                    );
                } else {
                    return UTIL.getFormattedValue(
                        _localTotal,
                        UTIL.getNumberFormatterFn(_numberFormat, _localTotal)
                    );
                }
            })
            .attr("x", 0)
            .attr("dy", _fontSize + 5);

        var doughnutMask = plot
            .append("g")
            .attr("id", "arc-mask-group")
            .selectAll(".arc-mask")
            .data(_doughnut(data), _localKey)
            .enter()
            .append("g")
            .attr("id", function (d, i) {
                return "arc-mask-group-" + i;
            })
            .classed("arc-mask", true)
            .append("path")
            .attr("id", function (d, i) {
                return "arc-mask-path-" + i;
            })
            .attr("d", _arcMask)
            .style("visibility", "hidden")
            .style("fill", function (d) {
                return COMMON.COLORSCALE(d.data[_dimension[0]]);
            })
            .each(function (d) {
                this._current = d;
            });

        var doughnutArcGroup = plot
            .append("g")
            .attr("id", "arc-group")
            .selectAll(".arc")
            .data(_doughnut(data), _localKey)
            .enter()
            .append("g")
            .attr("id", function (d, i) {
                return "arc-group-" + i;
            })
            .classed("arc", true);

        var doughnutArcPath = doughnutArcGroup
            .append("path")
            .attr("id", function (d, i) {
                return "arc-path-" + i;
            })
            .style("fill", function (d) {
                return COMMON.COLORSCALE(d.data[_dimension[0]]);
            })
            .attr("fill", function (d) {
                return COMMON.COLORSCALE(d.data[_dimension[0]]);
            })
            .each(function (d) {
                this._current = d;
            })
            .attr("d", _arc);

        var doughnutArcTextGroup = plot
            .selectAll(".arc-text")
            .data(_doughnut(data))
            .enter()
            .append("g")
            .attr("id", function (d, i) {
                return "arc-text-group-" + i;
            })
            .classed("arc-text", true);

        var doughnutLabel = doughnutArcTextGroup
            .append("text")
            .attr("transform", function (d) {
                var centroid = _labelArc.centroid(d),
                    x = centroid[0],
                    y = centroid[1],
                    h = _pythagorousTheorem(x, y);

                if (_valuePosition == "inside") {
                    return (
                        "translate(" +
                        outerRadius * (x / h) * 0.85 +
                        ", " +
                        outerRadius * (y / h) * 0.85 +
                        ")"
                    );
                } else {
                    return (
                        "translate(" +
                        outerRadius * (x / h) * 1.05 +
                        ", " +
                        outerRadius * (y / h) * 1.05 +
                        ")"
                    );
                }
            })
            .attr("dy", "0.35em")
            .attr("text-anchor", function (d) {
                if (_valuePosition == "inside") {
                    return "middle";
                } else {
                    return (d.endAngle + d.startAngle) / 2 > Math.PI
                        ? "end"
                        : (d.endAngle + d.startAngle) / 2 < Math.PI
                            ? "start"
                            : "middle";
                }
            })
            .text(_labelFn())
            .text(function (d) {
                if (!_print) {
                    var centroid = _labelArc.centroid(d),
                        x = centroid[0],
                        y = centroid[1],
                        h = _pythagorousTheorem(x, y);

                    if ($(this).attr("text-anchor") == "start") {
                        size = plotWidth / 2 - outerRadius * (x / h) * 1.05;
                    } else {
                        size =
                            plotWidth / 2 -
                            Math.abs(outerRadius * (x / h) * 1.05);
                    }
                    var diff = d.endAngle - d.startAngle;
                    if (diff <= 0.2) {
                    }
                    return UTIL.getTruncatedLabel(this, this.textContent, size);
                } else {
                    return this.textContent;
                }
            })
            .text(function (d) {
                var diff = d.endAngle - d.startAngle;
                if (diff <= 0.2) {
                    return "";
                } else {
                    return this.textContent;
                }
            });

        if (!_print) {
            var confirm = $(me)
                .parent()
                .find("div.confirm")
                .css("visibility", "hidden");

            var _filter = UTIL.createFilterElement();
            $("#" + parentContainer.attr("id")).append(_filter);

            _local_svg.select("g.lasso").remove();

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
                .items(doughnutArcGroup)
                .targetArea(_local_svg);

            lasso
                .on("start", onLassoStart(lasso, _local_svg))
                .on("draw", onLassoDraw(lasso, _local_svg))
                .on("end", onLassoEnd(lasso, _local_svg));

            _local_svg.call(lasso);

            doughnutArcGroup
                .on("mouseover", _handleMouseOverFn.call(chart, tooltip, svg))
                .on("mousemove", _handleMouseMoveFn.call(chart, tooltip, svg))
                .on("mouseout", _handleMouseOutFn.call(chart, tooltip, svg))
                .on("click", function (d, i) {
                    if (isLiveEnabled) {
                        broadcast.$broadcast("FlairBi:livemode-dialog");
                        return;
                    }
                    var confirm = parentContainer
                        .select(".confirm")
                        .style("visibility", "visible");
                    filter = false;

                    var point = d3.select(this).select("path");
                    if (point.classed("selected")) {
                        point.classed("selected", false);
                    } else {
                        point.classed("selected", true);
                    }
                    var obj = new Object();
                    obj[chart.dimension()] = d.data[_dimension[0]];
                    obj[chart.measure()] = d.data[_measure[0]];
                    filterData.push(obj);

                    var _filterDimension = broadcast.selectedFilters || {};

                    var dimension = _dimension[0];
                    if (_filterDimension[dimension]) {
                        var temp = _filterDimension[dimension];
                        if (temp.indexOf(d.data[_dimension[0]]) < 0) {
                            temp.push(d.data[_dimension[0]]);
                        } else {
                            temp.splice(temp.indexOf(d.data[_dimension[0]]), 1);
                        }
                        _filterDimension[dimension] = temp;
                    } else {
                        _filterDimension[dimension] = [d.data[_dimension[0]]];
                    }

                    _filterDimension[dimension]._meta = {
                        dataType: _dimensionType[0],
                        valueType: "castValueType",
                    };
                  broadcast.saveSelectedFilter(_filterParameters);
                });
        }
    }

    /**
     * Private method that delegates legend interactions to respective controllers
     *
     * @param {object} event Mouseevent instance
     * @param {object} datum Record of the data binded to the legend item
     * @return {undefined}
     */
    chart._legendInteraction = function (event, datum, plot) {
        if (_print) {
            // No interaction during print enabled
            return;
        }
        switch (event) {
            case "mouseover":
                _legendMouseOver(datum, plot);
                break;
            case "mousemove":
                _legendMouseMove(datum, plot);
                break;
            case "mouseout":
                _legendMouseOut(datum, plot);
                break;
            case "click":
                _legendClick(datum);
                break;
        }
    };

    chart._getName = function () {
        return _NAME;
    };

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
    };

    chart.update = function (data) {
        if (_localLabelStack.length > 0) {
            data = UTIL.getFilterDataForPie(
                _localLabelStack,
                data[_dimension[0]],
                _local_data,
                _dimension
            );
        }

        data.map(function (d) {
            d[_measure[0]] = Math.abs(d[_measure[0]]);
        });
        if (_tooltip) {
            tooltip = parentContainer.select(".custom_tooltip");
        }
        var svg = _local_svg,
            width = +svg.attr("width"),
            height = +svg.attr("height"),
            parentWidth = width - 2 * COMMON.PADDING,
            parentHeight = height - 2 * COMMON.PADDING,
            filteredData;

        svg.selectAll(".arc path").classed("selected", false);

        // filteredData = data.filter(function (d) {
        //     return _localLabelStack.indexOf(d[_dimension[0]]) == -1;
        // });

        // var prevData = svg.selectAll('g.arc')
        //     .data().map(function (d) { return d.data });

        // if (prevData.length == 0) {
        //     prevData = filteredData;
        // }

        // var oldFilteredData = _mergeForTransition(filteredData, prevData),
        //     newFilteredData = _mergeForTransition(prevData, filteredData);

        _local_svg.select(".legend").remove();

        plotWidth = parentWidth;
        plotHeight = parentHeight;

        if (_legend) {
            _localLegend = LEGEND.bind(chart);

            var result = _localLegend(
                data,
                container,
                {
                    width: parentWidth,
                    height: parentHeight,
                    legendBreakCount: legendBreakCount,
                },
                _localLabelStack
            );

            legendWidth = result.legendWidth;
            legendHeight = result.legendHeight;
            legendBreakCount = result.legendBreakCount;

            switch (_legendPosition.toUpperCase()) {
                case "TOP":
                case "BOTTOM":
                    plotHeight =
                        plotHeight -
                        parseFloat(20 * parseFloat(legendBreakCount) + 20);
                    break;
                case "RIGHT":
                case "LEFT":
                    plotWidth = plotWidth - legendWidth;
                    break;
            }
        }

        outerRadius = Math.min(plotWidth, plotHeight) / 2.25;
        var doughnutMask = svg
            .select("#arc-mask-group")
            .selectAll("g.arc-mask")
            .data(_doughnut(data), _localKey)
            .enter()
            .append("g")
            .attr("id", function (d, i) {
                return "arc-mask-group-" + i;
            })
            .classed("arc-mask", true)
            .append("path")
            .attr("id", function (d, i) {
                return "arc-mask-path-" + i;
            })
            .attr("d", _arcMask)
            .style("fill", function (d) {
                return COMMON.COLORSCALE(d.data[_dimension[0]]);
            })
            .each(function (d) {
                this._current = d;
            });

        doughnutMask = svg
            .selectAll("g.arc-mask")
            .data(_doughnut(data), _localKey);

        doughnutMask
            .select("path")
            .transition()
            .duration(0)
            .attrTween("d", function (d) {
                var interpolate = d3.interpolate(this._current, d);
                var _this = this;
                return function (t) {
                    _this._current = interpolate(t);
                    return _arcMask(_this._current);
                };
            });

        doughnutMask = svg
            .selectAll("g.arc-mask")
            .data(_doughnut(data), _localKey);

        doughnutMask.exit().transition().delay(1000).duration(0).remove();

        var doughnutArcGroup = svg
            .select("#arc-group")
            .selectAll("g.arc")
            .data(_doughnut(data), _localKey)
            .enter()
            .insert("g")
            .attr("id", function (d, i) {
                return "arc-group-" + i;
            })
            .classed("arc", true)
            .classed("selected", false);

        var doughnutArcPath = doughnutArcGroup
            .append("path")
            .attr("id", function (d, i) {
                return "arc-path-" + i;
            })
            .style("fill", function (d) {
                return COMMON.COLORSCALE(d.data[_dimension[0]]);
            })
            .each(function (d) {
                this._current = d;
            });

        doughnutArcGroup = svg
            .selectAll("g.arc")
            .data(_doughnut(data), _localKey);

        doughnutArcGroup
            .select("path")
            .transition()
            .duration(0)
            .attrTween("d", function (d) {
                var interpolate = d3.interpolate(this._current, d);
                var _this = this;
                return function (t) {
                    _this._current = interpolate(t);
                    return _arc(_this._current);
                };
            });

        doughnutArcGroup = svg
            .selectAll("g.arc")
            .data(_doughnut(data), _localKey);

        doughnutArcGroup.exit().transition().delay(1000).duration(0).remove();

        doughnutArcGroup
            .on("mouseover", _handleMouseOverFn.call(chart, tooltip, svg))
            .on("mousemove", _handleMouseMoveFn.call(chart, tooltip, svg))
            .on("mouseout", _handleMouseOutFn.call(chart, tooltip, svg))
            .on("click", function (d, i) {
                if (isLiveEnabled) {
                    broadcast.$broadcast("FlairBi:livemode-dialog");
                    return;
                }
                var confirm = parentContainer
                    .select(".confirm")
                    .style("visibility", "visible");
                filter = false;

                var point = d3.select(this).select("path");
                if (point.classed("selected")) {
                    point.classed("selected", false);
                } else {
                    point.classed("selected", true);
                }
                var obj = new Object();
                obj[chart.dimension()] = d.data[_dimension[0]];
                obj[chart.measure()] = d.data[_measure[0]];
                filterData.push(obj);

                var _filterDimension = broadcast.selectedFilters || {};
                if (broadcast.filterSelection.id) {
                    _filterDimension = broadcast.selectedFilters[_dimension[0]] || {};
                } else {
                    broadcast.filterSelection.id = parentContainer.attr("id");
                }
                var dimension = _dimension[0];
                if (_filterDimension[dimension]) {
                    var temp = _filterDimension[dimension];
                    if (temp.indexOf(d.data[_dimension[0]]) < 0) {
                        temp.push(d.data[_dimension[0]]);
                    } else {
                        temp.splice(temp.indexOf(d.data[_dimension[0]]), 1);
                    }
                    _filterDimension[dimension] = temp;
                } else {
                    _filterDimension[dimension] = [d.data[_dimension[0]]];
                }
                _filterDimension[dimension]._meta = {
                    dataType: _dimensionType[0],
                    valueType: "castValueType",
                };
                broadcast.saveSelectedFilter(_filterDimension);
            });

        var plot = _local_svg.select(".plot");

        plot.selectAll(".arc-text").remove();

        var doughnutArcTextGroup = plot
            .selectAll(".arc-text")
            .data(_doughnut(data))
            .enter()
            .append("g")
            .attr("id", function (d, i) {
                return "arc-text-group-" + i;
            })
            .classed("arc-text", true);

        var doughnutLabel = doughnutArcTextGroup
            .append("text")
            .attr("transform", function (d) {
                var centroid = _labelArc.centroid(d),
                    x = centroid[0],
                    y = centroid[1],
                    h = _pythagorousTheorem(x, y);

                if (_valuePosition == "inside") {
                    return (
                        "translate(" +
                        outerRadius * (x / h) * 0.85 +
                        ", " +
                        outerRadius * (y / h) * 0.85 +
                        ")"
                    );
                } else {
                    return (
                        "translate(" +
                        outerRadius * (x / h) * 1.05 +
                        ", " +
                        outerRadius * (y / h) * 1.05 +
                        ")"
                    );
                }
            })
            .attr("dy", "0.35em")
            .attr("text-anchor", function (d) {
                if (_valuePosition == "inside") {
                    return "middle";
                } else {
                    return (d.endAngle + d.startAngle) / 2 > Math.PI
                        ? "end"
                        : (d.endAngle + d.startAngle) / 2 < Math.PI
                            ? "start"
                            : "middle";
                }
            })
            .text(_labelFn())
            .text(_labelFn())
            .text(function (d) {
                if (!_print) {
                    var centroid = _labelArc.centroid(d),
                        x = centroid[0],
                        y = centroid[1],
                        h = _pythagorousTheorem(x, y);

                    if ($(this).attr("text-anchor") == "start") {
                        size = plotWidth / 2 - outerRadius * (x / h) * 1.05;
                    } else {
                        size =
                            plotWidth / 2 -
                            Math.abs(outerRadius * (x / h) * 1.05);
                    }
                    var diff = d.endAngle - d.startAngle;
                    if (diff <= 0.2) {
                    }
                    return UTIL.getTruncatedLabel(this, this.textContent, size);
                }
            })
            .text(function (d) {
                var diff = d.endAngle - d.startAngle;
                if (diff <= 0.2) {
                    return "";
                } else {
                    return this.textContent;
                }
            });

        plot.select("#measure-value").remove();

        _localTotal = d3.sum(
            data.map(function (d) {
                return d[_measure[0]];
            })
        );

        var centerText = plot
            .append("text")
            .attr("id", "measure-value")
            .style("text-anchor", "middle")
            .style("fill", _fontColor)
            .style("font-size", _fontSize + "px")
            .style("font-weight", _fontWeight)
            .style("font-style", _fontStyle)
            .attr("visibility", _showLabel == true ? "visible" : "hidden")
            .append("tspan")
            .text(function () {
                if (!_print) {
                    return UTIL.getTruncatedLabel(
                        this,
                        _measureDisplayName,
                        outerRadius * 0.8
                    );
                } else {
                    return _measureDisplayName;
                }
            })
            .attr("x", 0)
            .append("tspan")
            .text(function () {
                if (!_print) {
                    return UTIL.getTruncatedLabel(
                        this,
                        UTIL.getFormattedValue(
                            _localTotal,
                            UTIL.getNumberFormatterFn(
                                _numberFormat,
                                _localTotal
                            )
                        ),
                        outerRadius * 0.8
                    );
                } else {
                    return UTIL.getFormattedValue(
                        _localTotal,
                        UTIL.getNumberFormatterFn(_numberFormat, _localTotal)
                    );
                }
            })
            .attr("x", 0)
            .attr("dy", _fontSize + 5);

        _local_svg.select("g.lasso").remove();

        var lasso = d3Lasso
            .lasso()
            .hoverSelect(true)
            .closePathSelect(true)
            .closePathDistance(100)
            .items(doughnutArcGroup)
            .targetArea(_local_svg);

        lasso
            .on("start", onLassoStart(lasso, _local_svg))
            .on("draw", onLassoDraw(lasso, _local_svg))
            .on("end", onLassoEnd(lasso, _local_svg));

        _local_svg.call(lasso);
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
        _doughnut.value(function (d) {
            return d[_measure[0]];
        });
        return chart;
    };

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    };

    chart.legend = function (value) {
        if (!arguments.length) {
            return _legend;
        }
        _legend = value;
        return chart;
    };

    chart.legendPosition = function (value) {
        if (!arguments.length) {
            return _legendPosition;
        }
        _legendPosition = value;
        return chart;
    };

    chart.valueAs = function (value) {
        if (!arguments.length) {
            return _valueAs;
        }
        _valueAs = value;
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

    chart.numberFormat = function (value) {
        if (!arguments.length) {
            return _numberFormat;
        }
        _numberFormat = value;
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

module.exports = doughnut;
