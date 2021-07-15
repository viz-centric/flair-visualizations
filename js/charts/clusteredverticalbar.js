var d3 = require("d3");
var COMMON = require("../extras/common.js")();
var UTIL = require("../extras/util.js")();
var LEGEND = require("../extras/legend_barcharts.js")();
var $ = require("jquery");
try {
    var d3Lasso = require("../../d3-libs/d3-lasso.min.js");
} catch (ex) { }

function clusteredverticalbar() {
    var _NAME = "clusteredverticalbar";

    var _config,
        _dimension,
        _alternateDimension,
        _measure,
        _showLegend,
        _legendPosition,
        _dateFormate,
        _sort,
        _tooltip,
        _showXaxis,
        _showYaxis,
        _showXaxisLabel,
        _showYaxisLabel,
        _axisScaleLabel = COMMON.SHOWAXISLABEL,
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
        _displayColorExpression = [],
        _textColorExpression = [],
        _fontSize = [],
        _print,
        broadcast,
        filterParameters,
        isLiveEnabled = false,
        _notification = false,
        _data,
        _isFilterGrid = false,
        _showSorting = true;

    var _local_svg,
        svgFilter,
        _Local_data,
        _originalData,
        _localLabelStack = [],
        legendBreakCount = 1,
        _localXLabels;
    var _localXAxis, _localYAxis, _localXGrid, _localYGrid;
    var parentWidth, parentHeight, plotWidth, plotHeight, container, tooltip;

    var x0 = d3.scaleBand(),
        x1 = d3.scaleBand(),
        _xDimensionGrid = d3.scaleLinear(),
        y = d3.scaleLinear();

    var _x0 = d3.scaleBand(),
        _x1 = d3.scaleBand(),
        _y = d3.scaleLinear(),
        brush = d3.brushX();

    var FilterControlHeight = 100;

    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 45,
    };

    var tickLength = d3.scaleLinear().domain([22, 34]).range([2, 4]);

    var legendSpace = 20,
        axisLabelSpace = 20,
        offsetX = 16,
        offsetY = 3,
        parentContainer;

    var threshold = [];
    var filter = false,
        filterData = [];

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.dimensionType(config.dimensionType);
        this.alternateDimension(config.alternateDimension);
        this.measure(config.measure);
        this.showLegend(config.showLegend);
        this.legendPosition(config.legendPosition);
        this.dateFormate(config.dateFormate);
        this.showXaxis(config.showXaxis);
        this.showYaxis(config.showYaxis);
        this.showXaxisLabel(config.showXaxisLabel);
        this.showYaxisLabel(config.showYaxisLabel);
        this.axisScaleLabel(config.axisScaleLabel);
        this.showGrid(config.showGrid);
        this.xAxisColor(config.xAxisColor);
        this.yAxisColor(config.yAxisColor);
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
        this.isFilterGrid(config.isFilterGrid);
        this.showSorting(config.showSorting);
        this.displayColorExpression(config.displayColorExpression);
        this.textColorExpression(config.textColorExpression);
        setDefaultColorForChart();
        this.legendData(
            _displayColor,
            config.measure,
            config.displayNameForMeasure
        );
    };

    var setDefaultColorForChart = function () {
        for (let index = 0; index < _measure.length; index++) {
            if (
                _displayColor[index] == null ||
                _displayColor[index] == undefined
            ) {
                _displayColor[index] = COMMON.COLORSCALE(index);
            }
            if (
                _borderColor[index] == null ||
                _borderColor[index] == undefined
            ) {
                _borderColor[index] = COMMON.COLORSCALE(index);
            }
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
            UTIL.getDimensionFormatedValue(
                datum[chart.dimension()],
                _dimensionType[0]
            ) +
            "</td>" +
            "</tr><tr>" +
            "<th>" +
            datum["measure"] +
            ": </th>" +
            "<td>" +
            UTIL.getFormattedValue(
                datum[datum["measure"]],
                UTIL.getValueNumberFormat(
                    _measure.indexOf(datum["measure"]),
                    _numberFormat,
                    datum[datum["measure"]]
                )
            ) +
            " </td>" +
            "</tr></table>";

        return output;
    };

    var onLassoStart = function (lasso, scope) {
        return function () {
            if (filter) {
                lasso
                    .items()
                    .selectAll("rect")
                    .classed("not_possible", true)
                    .classed("selected", false);
            }
        };
    };

    var onLassoDraw = function (lasso, scope) {
        return function () {
            filter = true;
            lasso.items().selectAll("rect").classed("selected", false);

            lasso
                .possibleItems()
                .selectAll("rect")
                .classed("not_possible", false)
                .classed("possible", true);

            lasso
                .notPossibleItems()
                .selectAll("rect")
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
                    .selectAll("rect")
                    .classed("not_possible", false)
                    .classed("possible", false);
            }

            lasso.selectedItems().selectAll("rect").classed("selected", true);

            lasso.notSelectedItems().selectAll("rect");

            var confirm = d3
                .select(scope.node().parentNode)
                .select("div.confirm")
                .style("visibility", "visible");

            var _filter = [];
            if (data.length > 0) {
                var keys = UTIL.getMeasureList(data[0], _dimension, _measure);
                data.forEach(function (d) {
                    var obj = new Object();
                    obj[_dimension[0]] = d[_dimension[0]];
                    for (var index = 0; index < keys.length; index++) {
                        obj[keys[index]] = d[keys[index]];
                    }

                    _filter.push(obj);
                });
            } else {
                filterData = [];
                return;
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

    var applyFilter = function () {
        return function () {
            if (filterData.length > 0) {
                if (broadcast) {
                    broadcast.applyFilter(
                        broadcast.selectedFilters,
                        broadcast.visualmetadata,
                        broadcast.view
                    );
                    d3.select(this.parentNode).style("visibility", "hidden");
                }
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
                .style("fill", COMMON.HIGHLIGHTER);
            var border = UTIL.getDisplayColor(
                _measure.indexOf(d.measure),
                _displayColor
            );
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
                var border = UTIL.getDisplayColor(
                    _measure.indexOf(d.measure),
                    _displayColor
                );
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
            d3.select(this)
                .style("cursor", "default")
                .style("fill", function (d1, i) {
                    if (
                        _displayColorExpression[_measure.indexOf(d.measure)]
                            .length
                    ) {
                        if (
                            UTIL.expressionEvaluator(
                                _displayColorExpression[
                                _measure.indexOf(d.measure)
                                ],
                                d1[d1.measure],
                                "color"
                            ).length > 0
                        ) {
                            return UTIL.expressionEvaluator(
                                _displayColorExpression[
                                _measure.indexOf(d.measure)
                                ],
                                d[d.measure],
                                "color"
                            );
                        } else {
                            return UTIL.getDisplayColor(
                                _measure.indexOf(d.measure),
                                _displayColor
                            );
                        }
                    } else {
                        return UTIL.getDisplayColor(
                            _measure.indexOf(d.measure),
                            _displayColor
                        );
                    }
                })
                .style("stroke", function (d1, i) {
                    if (d1[d1.measure] < 0) {
                        return UTIL.getBorderColor(
                            _measure.indexOf(d.measure),
                            _borderColor
                        );
                    } else {
                        return UTIL.getBorderColor(
                            _measure.indexOf(d.measure),
                            _borderColor
                        );
                    }
                });

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        };
    };

    var brushed = function () {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom")
            return; // ignore brush-by-zoom

        // get bounds of selection
        var s = d3.event.selection,
            filterList = [];
        _x0.domain().forEach((d) => {
            var pos = _x0(d) + _x0.bandwidth() / 2;
            if (pos > s[0] && pos < s[1]) {
                filterList.push(d);
            }
        });
        var updatedData = UTIL.getFilterDataForGrid(
            _data,
            filterList,
            _dimension[0]
        );
        if (updatedData.length > 0) {
            chart.update(updatedData, null, true);
        }
    };

    function chart(selection) {
        _Local_data = _originalData = _data;

        if (_isFilterGrid) {
            if (
                !(
                    Object.keys(broadcast.filterSelection.filter).length ===
                    0 &&
                    broadcast.filterSelection.filter.constructor === Object
                )
            ) {
                _isFilterGrid = false;
            }
        }

        if (_print && !_notification) {
            parentContainer = selection;
        } else {
            parentContainer = d3.select("#" + selection.id);
        }

        var containerHeight = parentContainer.attr("height");
        if (_isFilterGrid) {
            containerHeight = (containerHeight * 80) / 100;
            FilterControlHeight = (containerHeight * 20) / 100;
        }

        var svg = parentContainer
            .append("svg")
            .attr("width", parentContainer.attr("width"))
            .attr("height", containerHeight);

        var width = +svg.attr("width"),
            height = +svg.attr("height");

        _local_svg = svg;

        parentWidth =
            width - 2 * COMMON.PADDING - (_showYaxis == true ? margin.left : 0);
        parentHeight =
            height -
            2 * COMMON.PADDING -
            (_showXaxis == true ? axisLabelSpace * 2 : axisLabelSpace);

        if (!_showXaxis && !_showXaxisLabel) {
            parentHeight = height - 2 * COMMON.PADDING;
        }

        container = svg
            .append("g")
            .attr("class", "focus")
            .attr(
                "transform",
                "translate(" + COMMON.PADDING + ", " + COMMON.PADDING + ")"
            );

        svg.attr("width", width).attr("height", height);

        parentContainer.append("div").attr("class", "sort_selection");

        parentContainer.append("div").attr("class", "arrow-down");

        parentContainer.append("div").attr("class", "custom_tooltip");

        drawLegend.call(this);
        drawPlot.call(this, _data);
    }

    var drawLegend = function () {
        var legendWidth = 0,
            legendHeight = 0;

        plotWidth = parentWidth;
        plotHeight = parentHeight;
        _local_svg.select(".legend").remove();
        if (_showLegend) {
            var clusteredverticalbarLegend = LEGEND.bind(chart);

            var result = clusteredverticalbarLegend(
                _legendData,
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
            parentHeight =
                parentHeight - (_notification == true ? 0 : axisLabelSpace);
            plotWidth = parentWidth;
            plotHeight = parentHeight;
        }
    };

    var drawPlot = function (data) {
        var me = _local_svg;

        filterData = [];
        if (_tooltip) {
            tooltip = parentContainer.select(".custom_tooltip");
        }
        var plot = container
            .append("g")
            .attr("class", "clusteredverticalbar-plot")
            .classed("plot", true)
            .attr("transform", function () {
                return UTIL.setPlotPosition(
                    _legendPosition,
                    _showXaxis,
                    _showYaxis,
                    _showLegend,
                    margin.left,
                    legendSpace,
                    legendBreakCount,
                    axisLabelSpace,
                    _local_svg
                );
            });

        var keys = UTIL.getMeasureList(data[0], _dimension, _measure);

        x0.rangeRound([0, plotWidth])
            .padding([0.2])
            .paddingInner(0.1)
            .domain(
                data.map(function (d) {
                    return d[_dimension[0]];
                })
            );

        x1.padding([0.2]).domain(keys).rangeRound([0, x0.bandwidth()]);

        var range = UTIL.getMinMax(data, keys);

        y.rangeRound([plotHeight, 0]).domain([range[0], range[1]]).nice();

        drawPlotForFilter.call(this, data);

        _localXLabels = data.map(function (d) {
            return d[_dimension[0]];
        });

        _xDimensionGrid.domain([0, _localXLabels.length]).range([0, plotWidth]);

        _localXGrid = d3
            .axisBottom()
            .ticks(_localXLabels.length)
            .tickFormat("")
            .tickSize(-plotHeight);

        _localYGrid = d3
            .axisLeft()
            .tickFormat(function (d) {
                UTIL.setAxisGridVisibility(this, _local_svg, _showGrid, d);
            })
            .tickSize(-plotWidth);

        _localXGrid.scale(_xDimensionGrid);
        _localYGrid.scale(y);

        plot.append("g")
            .attr("class", "x grid")
            .attr("visibility", UTIL.getVisibility(_showGrid))
            .attr("transform", "translate(0, " + plotHeight + ")")
            .call(_localXGrid);

        plot.append("g")
            .attr("class", "y grid")
            .attr("visibility", "visible")
            .call(_localYGrid);

        var cluster = plot
            .selectAll(".cluster")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "cluster")
            .attr("transform", function (d) {
                return "translate(" + x0(d[_dimension[0]]) + ", 0)";
            });

        var labelStack = [];
        var clusteredverticalbar = cluster
            .selectAll("g.clusteredverticalbar")
            .data(function (d) {
                return keys
                    .filter(function (m) {
                        return labelStack.indexOf(m) == -1;
                    })
                    .map(function (m) {
                        var obj = {};
                        obj[_dimension[0]] = d[_dimension[0]];
                        obj[m] = d[m];
                        obj["dimension"] = _dimension[0];
                        obj["measure"] = m;
                        return obj;
                    });
            })
            .enter()
            .append("g")
            .attr("class", "clusteredverticalbar");

        var rect = drawViz(clusteredverticalbar, keys);

        /* Axes */
        var xAxisGroup, yAxisGroup;

        var isRotate = false;

        _localXAxis = d3
            .axisBottom(x0)
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
                    _dimensionType[0],
                    _dateFormate
                );
            })
            .tickPadding(10);

        xAxisGroup = plot
            .append("g")
            .attr("class", "x_axis")
            .attr("transform", "translate(0, " + plotHeight + ")")
            .attr("visibility", "visible")
            .call(_localXAxis);

        xAxisGroup
            .append("g")
            .attr("class", "label")
            .attr("transform", function () {
                return (
                    "translate(" +
                    plotWidth / 2 +
                    ", " +
                    parseFloat(COMMON.AXIS_THICKNESS / 1.5 + COMMON.PADDING) +
                    ")"
                );
            })
            .append("text")
            .attr("class", "alternateDimension")
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("fill", _xAxisColor)
            .attr("visibility", UTIL.getVisibility(_showXaxisLabel))
            .text(_displayName)
            .on("click", function () {
                UTIL.toggleAlternateDimension(
                    broadcast,
                    plotWidth,
                    _local_svg,
                    _alternateDimension,
                    parentContainer.attr("vizID"),
                    _isFilterGrid,
                    "vertical",
                    _displayName
                );
            });

        UTIL.toggleAlternateDimensionIcon(
            xAxisGroup,
            plotWidth,
            _showXaxisLabel,
            _xAxisColor,
            false,
            _print,
            _alternateDimension
        );

        if (isRotate) {
            _local_svg
                .selectAll(".x_axis .tick text")
                .attr("transform", "rotate(-15)");
        }

        _localYAxis = d3
            .axisLeft(y)
            .tickSize(0)
            .tickPadding(8)
            .tickFormat(function (d) {
                if (_axisScaleLabel == "Formated") {
                    return UTIL.shortScale(2)(d);
                } else {
                    return d.toString().length > 3
                        ? d.toString().substring(0, 3) + "..."
                        : d;
                }
            });

        yAxisGroup = plot
            .append("g")
            .attr("class", "y_axis")
            .attr("visibility", "visible")
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
                }
                return text.substring(0, 50) + "...";
            })
            .append("svg:title")
            .text(function (d, i) {
                return _displayNameForMeasure
                    .map(function (p) {
                        return p;
                    })
                    .join(", ");
            });

        UTIL.setAxisColor(
            _xAxisColor,
            _showXaxis,
            _yAxisColor,
            _showYaxis,
            _local_svg
        );

        if (!_print) {
            var confirm = $(_local_svg)
                .parent()
                .find("div.confirm")
                .css("visibility", "hidden");

            var _filter = UTIL.createFilterElement();

            $("#" + parentContainer.attr("id")).append(_filter);

            _local_svg.select("g.sort").remove();
            UTIL.sortingView(
                container,
                parentHeight,
                parentWidth + (_showYaxis == true ? margin.left : 0),
                legendBreakCount,
                axisLabelSpace,
                offsetX,
                _showSorting
            );

            _local_svg
                .select("g.sort")
                .selectAll("text")
                .on("click", function () {
                    var order = d3.select(this).attr("class");
                    switch (order) {
                        case "ascending":
                            UTIL.toggleSortSelection(
                                "ascending",
                                chart.update,
                                _local_svg,
                                keys,
                                _Local_data,
                                _isFilterGrid
                            );
                            break;
                        case "descending":
                            UTIL.toggleSortSelection(
                                "descending",
                                chart.update,
                                _local_svg,
                                keys,
                                _Local_data,
                                _isFilterGrid
                            );
                            break;
                        case "reset": {
                            // $(_local_svg).parent().find('.sort_selection,.arrow-down').css('visibility', 'hidden');
                            // _local_svg.select('.plot').remove()
                            chart.update.call(me, _Local_data);
                            drawPlotForFilter.call(this, _originalData);
                            break;
                        }
                    }
                });

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
                .items(cluster)
                .targetArea(_local_svg);

            lasso
                .on("start", onLassoStart(lasso, _local_svg))
                .on("draw", onLassoDraw(lasso, _local_svg))
                .on("end", onLassoEnd(lasso, _local_svg));

            _local_svg.call(lasso);
        }
    };

    var drawPlotForFilter = function (data) {
        if (!_print) {
            var keys = UTIL.getMeasureList(data[0], _dimension, _measure);
            var range = UTIL.getMinMax(data, keys);
            parentContainer.select(".filterElement").remove();
            svgFilter = parentContainer
                .append("svg")
                .attr("width", parentContainer.attr("width"))
                .attr("height", FilterControlHeight)
                .attr("class", "filterElement")
                .style("visibility", UTIL.getVisibility(_isFilterGrid));

            _x0.rangeRound([
                0,
                parseInt(_local_svg.attr("width") - 2 * COMMON.PADDING),
            ])
                .padding([0.2])
                .paddingInner(0.1)
                .domain(
                    data.map(function (d) {
                        return d[_dimension[0]];
                    })
                );

            _x1.padding([0.2]).domain(keys).rangeRound([0, _x0.bandwidth()]);

            _y.rangeRound([FilterControlHeight - COMMON.PADDING, 0])
                .domain([range[0], range[1]])
                .nice();

            brush
                .extent([
                    [0, 0],
                    [parentContainer.attr("width"), FilterControlHeight],
                ])
                .on("brush", brushed);

            var separationLine = svgFilter
                .append("line")
                .attr("stroke", COMMON.SEPARATIONLINE)
                .attr("x1", COMMON.PADDING)
                .attr(
                    "x2",
                    parseInt(_local_svg.attr("width") - 2 * COMMON.PADDING)
                )
                .attr("y1", "0")
                .attr("y1", "0")
                .style("stroke-dasharray", "3, 3");

            var context = svgFilter
                .append("g")
                .attr("class", "context")
                .attr("width", parentContainer.attr("width"))
                .attr("height", FilterControlHeight)
                .attr(
                    "transform",
                    "translate(" + COMMON.PADDING + ", " + 0 + ")"
                );

            _localXAxisForFilter = d3
                .axisBottom(_x0)
                .tickSize(0)
                .tickFormat(function (d) {
                    return "";
                })
                .tickPadding(10);

            context
                .append("g")
                .attr("class", "x axis_filter")
                .attr(
                    "transform",
                    "translate(0," +
                    parseInt(FilterControlHeight - COMMON.PADDING) +
                    ")"
                )
                .call(_localXAxisForFilter);

            context
                .append("g")
                .attr("class", "x_brush")
                .call(brush)
                .selectAll("rect")
                .attr("y", -6)
                .attr("height", FilterControlHeight + 7);

            var clusterFilter = context
                .selectAll(".clusterFilter")
                .data(data)
                .enter()
                .append("g")
                .attr("class", "clusterFilter")
                .attr("transform", function (d) {
                    return "translate(" + _x0(d[_dimension[0]]) + ", 0)";
                });

            var labelStack = [];
            var clusteredverticalbarFilter = clusterFilter
                .selectAll("g.clusteredverticalbarFilter")
                .data(function (d) {
                    return keys
                        .filter(function (m) {
                            return labelStack.indexOf(m) == -1;
                        })
                        .map(function (m) {
                            var obj = {};
                            obj[_dimension[0]] = d[_dimension[0]];
                            obj[m] = d[m];
                            obj["dimension"] = _dimension[0];
                            obj["measure"] = m;
                            return obj;
                        });
                })
                .enter()
                .append("g")
                .attr("class", "clusteredverticalbarFilter");

            clusteredverticalbarFilter
                .append("rect")
                .style("fill", function (d, i) {
                    if (
                        _displayColorExpression[_measure.indexOf(d.measure)]
                            .length
                    ) {
                        if (
                            UTIL.expressionEvaluator(
                                _displayColorExpression[
                                _measure.indexOf(d.measure)
                                ],
                                d[d.measure],
                                "color"
                            ).length > 0
                        ) {
                            return UTIL.expressionEvaluator(
                                _displayColorExpression[
                                _measure.indexOf(d.measure)
                                ],
                                d[d.measure],
                                "color"
                            );
                        } else {
                            return UTIL.getDisplayColor(
                                _measure.indexOf(d.measure),
                                _displayColor
                            );
                        }
                    } else {
                        return UTIL.getDisplayColor(
                            _measure.indexOf(d.measure),
                            _displayColor
                        );
                    }
                })
                .style("stroke", function (d, i) {
                    if (d[d.measure] < 0) {
                        return UTIL.getBorderColor(
                            _measure.indexOf(d.measure),
                            _borderColor
                        );
                    } else {
                        return UTIL.getBorderColor(
                            _measure.indexOf(d.measure),
                            _borderColor
                        );
                    }
                })
                .style("fill-opacity", 0.6)
                .style("stroke-opacity", 0.6)
                .style("stroke-width", 1)
                .attr("height", function (d, i) {
                    if (d[d.measure] === null || isNaN(d[d.measure])) return 0;
                    return Math.abs(_y(0) - _y(d[d.measure]));
                })
                .attr("y", function (d, i) {
                    if (d[d.measure] === null || isNaN(d[d.measure])) {
                        return plotHeight;
                    } else if (d[d.measure] > 0) {
                        return _y(d[d.measure]);
                    }

                    return _y(0);
                })
                .attr("width", _x1.bandwidth())
                .attr("x", function (d, i) {
                    return _x1(d.measure);
                });
        }
    };

    var drawViz = function (element, keys) {
        rect = element
            .append("rect")
            .attr("class", "bar")
            .style("fill", function (d, i) {
                if (
                    _displayColorExpression[_measure.indexOf(d.measure)].length
                ) {
                    if (
                        UTIL.expressionEvaluator(
                            _displayColorExpression[
                            _measure.indexOf(d.measure)
                            ],
                            d[d.measure],
                            "color"
                        ).length > 0
                    ) {
                        return UTIL.expressionEvaluator(
                            _displayColorExpression[
                            _measure.indexOf(d.measure)
                            ],
                            d[d.measure],
                            "color"
                        );
                    } else {
                        return UTIL.getDisplayColor(
                            _measure.indexOf(d.measure),
                            _displayColor
                        );
                    }
                } else {
                    return UTIL.getDisplayColor(
                        _measure.indexOf(d.measure),
                        _displayColor
                    );
                }
            })
            .style("stroke", function (d, i) {
                if (d[d.measure] < 0) {
                    return UTIL.getBorderColor(
                        _measure.indexOf(d.measure),
                        _borderColor
                    );
                } else {
                    return UTIL.getBorderColor(
                        _measure.indexOf(d.measure),
                        _borderColor
                    );
                }
            })
            .style("stroke-width", 1)
            .attr("height", function (d, i) {
                if (d[d.measure] === null || isNaN(d[d.measure])) return 0;
                return Math.abs(y(0) - y(d[d.measure]));
            })
            .attr("y", function (d, i) {
                if (d[d.measure] === null || isNaN(d[d.measure])) {
                    return plotHeight;
                } else if (d[d.measure] > 0) {
                    return y(d[d.measure]);
                }
                return y(0);
            })
            .attr("width", x1.bandwidth())
            .attr("x", function (d, i) {
                return x1(d.measure);
            });

        if (!_print || _notification) {
            rect.on(
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
                        if (broadcast && broadcast.isThresholdAlert) {
                            UTIL.openSchedulerDialog(
                                parentContainer.attr("vizID"),
                                d.measure,
                                d[d.measure],
                                d.dimension,
                                d[d.dimension],
                                broadcast
                            );
                        } else {
                            if (isLiveEnabled) {
                                broadcast.$broadcast("FlairBi:livemode-dialog");
                                return;
                            }

                            filter = false;
                            var confirm = parentContainer
                                .select(".confirm")
                                .style("visibility", "visible");
                            var _filter = _Local_data.filter(function (d1) {
                                return d[_dimension[0]] === d1[_dimension[0]];
                            });
                            var rect = d3.select(this);
                            if (rect.classed("selected")) {
                                rect.classed("selected", false);
                                filterData.map(function (val, i) {
                                    if (
                                        val[_dimension[0]] == d[_dimension[0]]
                                    ) {
                                        filterData.splice(i, 1);
                                    }
                                });
                            } else {
                                rect.classed("selected", true);
                                var isExist = filterData.filter(function (val) {
                                    if (
                                        val[_dimension[0]] == d[_dimension[0]]
                                    ) {
                                        return val;
                                    }
                                });
                                if (isExist.length == 0) {
                                    filterData.push(_filter[0]);
                                }
                            }

                            var _filterDimension = broadcast.selectedFilters || {};
                            _filterDimension[_dimension[0]] = filterData.map(
                                function (d) {
                                    return d[_dimension[0]];
                                }
                            );

                            _filterDimension[_dimension[0]]._meta = {
                                dataType: _dimensionType[0],
                                valueType: "castValueType",
                            };
                            broadcast.saveSelectedFilter(_filterDimension);
                        }
                    }
                });
        }
        var text = element
            .append("text")
            .text(function (d, i) {
                return UTIL.getFormattedValue(
                    d[d.measure],
                    UTIL.getValueNumberFormat(i, _numberFormat, d[d.measure])
                );
            })
            .attr("y", function (d, i) {
                if (d[d["measure"]] === null || isNaN(d[d["measure"]])) {
                    return plotHeight;
                } else if (d[d["measure"]] > 0) {
                    return y(d[d["measure"]]) + _fontSize[i];
                }

                return y(0) + _fontSize[i];
            })
            .attr("x", function (d) {
                return x1(d.measure) + x1.bandwidth() / 2;
            })
            .attr("dy", function (d, i) {
                return COMMON.OFFSET;
            })
            .style("text-anchor", "middle")
            .attr("visibility", function (d, i) {
                return UTIL.getVisibility(_showValues[i]);
            })
            .style("font-style", function (d, i) {
                return _fontStyle[i];
            })
            .style("font-weight", function (d, i) {
                return _fontWeight[i];
            })
            .style("font-size", function (d, i) {
                return _fontSize[i] + "px";
            })
            .style("fill", function (d, i) {
                if (_textColorExpression[_measure.indexOf(d.measure)].length) {
                    if (
                        UTIL.expressionEvaluator(
                            _textColorExpression[_measure.indexOf(d.measure)],
                            d[d.measure],
                            "color"
                        ).length > 0
                    ) {
                        return UTIL.expressionEvaluator(
                            _textColorExpression[_measure.indexOf(d.measure)],
                            d[d.measure],
                            "color"
                        );
                    } else {
                        return _textColor[_measure.indexOf(d.measure)];
                    }
                } else {
                    return _textColor[_measure.indexOf(d.measure)];
                }
            })
            .attr("visibility", function (d, i) {
                var rect = d3.select(this.previousElementSibling).node(),
                    rectWidth = rect.getAttribute("width"),
                    rectHeight = rect.getAttribute("height");
                if (_notification) {
                    return "hidden";
                }
                if (!_print) {
                    if (this.getAttribute("visibility") == "hidden")
                        return "hidden";

                    if (
                        rectHeight <=
                        offsetX / 2 +
                        parseFloat(
                            d3
                                .select(this)
                                .style("font-size")
                                .replace("px", "")
                        )
                    ) {
                        return "hidden";
                    }

                    if (this.getComputedTextLength() > parseFloat(rectWidth)) {
                        d3.select(this).style("font-size", "9px");
                        d3.select(this).attr("y", y(d[d.measure]) + 9);
                        if (
                            this.getComputedTextLength() > parseFloat(rectWidth)
                        ) {
                            return "hidden";
                        }
                    }
                } else {
                    var textInfo = d3.select(this).node().getBBox();
                    if (textInfo.width >= rectWidth) {
                        return "hidden";
                    }
                    if (textInfo.height >= rectHeight) {
                        return "hidden";
                    }
                }
                if (
                    rectHeight <=
                    offsetX / 2 +
                    parseFloat(
                        d3.select(this).style("font-size").replace("px", "")
                    )
                ) {
                    return "hidden";
                }
                return "visible";
            });
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
        plot.selectAll("g.clusteredverticalbar")
            .filter(function (d) {
                return d.measure === data;
            })
            .select("rect")
            .style("fill", COMMON.HIGHLIGHTER);
    };

    var _legendMouseMove = function (data, plot) { };

    var _legendMouseOut = function (data, plot) {
        plot.selectAll("g.clusteredverticalbar")
            .filter(function (d) {
                return d.measure === data;
            })
            .select("rect")
            .style("fill", function (d, i) {
                if (
                    _displayColorExpression[_measure.indexOf(d.measure)].length
                ) {
                    if (
                        UTIL.expressionEvaluator(
                            _displayColorExpression[
                            _measure.indexOf(d.measure)
                            ],
                            d[d.measure],
                            "color"
                        ).length > 0
                    ) {
                        return UTIL.expressionEvaluator(
                            _displayColorExpression[
                            _measure.indexOf(d.measure)
                            ],
                            d[d.measure],
                            "color"
                        );
                    } else {
                        return UTIL.getDisplayColor(
                            _measure.indexOf(d.measure),
                            _displayColor
                        );
                    }
                } else {
                    return UTIL.getDisplayColor(
                        _measure.indexOf(d.measure),
                        _displayColor
                    );
                }
            });
    };

    var _legendClick = function (data, plot) {
        var _filter = UTIL.getFilterData(_localLabelStack, data, _Local_data);
        drawPlot.call(this, _filter);
    };

    chart._getName = function () {
        return _NAME;
    };

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
    };

    chart.update = function (data, filterConfig, filterGrid) {
        if (!filterGrid) {
            _Local_data = data;
        }
        if (_localLabelStack.length > 0) {
            if (filterGrid) {
                data = UTIL.getFilterDataForLegend(_localLabelStack, data);
            } else {
                data = UTIL.getFilterDataForLegend(
                    _localLabelStack,
                    _Local_data
                );
            }
        }

        if (_isFilterGrid) {
            if (
                !(
                    Object.keys(broadcast.selectedFilters).length === 0 &&
                    broadcast.selectedFilters.constructor === Object
                )
            ) {
                _isFilterGrid = false;
            }
        }

        var containerHeight = parentContainer.attr("height");
        if (_isFilterGrid) {
            containerHeight = (containerHeight * 80) / 100;
            FilterControlHeight = (containerHeight * 20) / 100;
        }

        var svg = _local_svg
            .attr("width", parentContainer.attr("width"))
            .attr("height", containerHeight);

        var svg = _local_svg,
            width = +svg.attr("width"),
            height = +svg.attr("height");

        parentWidth =
            width - 2 * COMMON.PADDING - (_showYaxis == true ? margin.left : 0);
        parentHeight =
            height -
            2 * COMMON.PADDING -
            (_showXaxis == true ? axisLabelSpace * 2 : axisLabelSpace);

        if (!_showXaxis && !_showXaxisLabel) {
            parentHeight = height - 2 * COMMON.PADDING;
        }

        parentContainer
            .select(".filterElement")
            .style("visibility", UTIL.getVisibility(_isFilterGrid));

        drawLegend.call(this);

        var plot = _local_svg.select(".plot").attr("transform", function () {
            return UTIL.setPlotPosition(
                _legendPosition,
                _showXaxis,
                _showYaxis,
                _showLegend,
                margin.left,
                legendSpace,
                legendBreakCount,
                axisLabelSpace,
                _local_svg
            );
        });

        if (filterConfig) {
            if (filterConfig.isFilter) {
                data = UTIL.sortData(
                    _data,
                    filterConfig.key,
                    filterConfig.sortType
                );
                drawPlotForFilter.call(this, _data);
            }
        } else {
            if (!filterGrid) {
                drawPlotForFilter.call(this, _data);
            }
        }

        if (_tooltip) {
            tooltip = parentContainer.select(".custom_tooltip");
        }

        var DURATION = COMMON.DURATION;
        if (isLiveEnabled) {
            DURATION = 0;
        }
        filterData = [];

        var keys = UTIL.getMeasureList(data[0], _dimension, _measure);

        _localXLabels = data.map(function (d) {
            return d[_dimension[0]];
        });

        _xDimensionGrid.domain([0, _localXLabels.length]).range([0, plotWidth]);

        x0.rangeRound([0, plotWidth])
            .padding([0.2])
            .paddingInner(0.1)
            .domain(
                data.map(function (d) {
                    return d[_dimension[0]];
                })
            );

        x1.padding([0.2]).domain(keys).rangeRound([0, x0.bandwidth()]);

        var range = UTIL.getMinMax(data, keys);

        y.rangeRound([plotHeight, 0]).domain([range[0], range[1]]).nice();

        var cluster = plot.selectAll("g.cluster").data(data);

        cluster
            .enter()
            .append("g")
            .attr("class", "cluster")
            .attr("transform", function (d) {
                return "translate(" + x0(d[_dimension[0]]) + ", 0)";
            });

        cluster.exit().remove();

        cluster = plot.selectAll("g.cluster");
        var labelStack = [];

        var clusteredverticalbar = cluster
            .selectAll("g.clusteredverticalbar")
            .data(function (d) {
                return keys
                    .filter(function (m) {
                        return labelStack.indexOf(m) == -1;
                    })
                    .map(function (m) {
                        var obj = {};
                        obj[_dimension[0]] = d[_dimension[0]];
                        obj[m] = d[m];
                        obj["dimension"] = _dimension[0];
                        obj["measure"] = m;
                        return obj;
                    });
            });

        clusteredverticalbar
            .select("rect")
            .attr("height", function (d, i) {
                if (d[d.measure] === null || isNaN(d[d.measure])) return 0;
                return Math.abs(y(0) - y(d[d.measure]));
            })
            .attr("y", function (d, i) {
                if (d[d.measure] === null || isNaN(d[d.measure])) {
                    return plotHeight;
                } else if (d[d.measure] > 0) {
                    return y(d[d.measure]);
                }

                return y(0);
            })
            .attr("width", x1.bandwidth())
            .attr("x", function (d, i) {
                return x1(d.measure);
            })
            .attr("class", "bar")
            .style("fill", function (d, i) {
                if (
                    _displayColorExpression[_measure.indexOf(d.measure)].length
                ) {
                    if (
                        UTIL.expressionEvaluator(
                            _displayColorExpression[
                            _measure.indexOf(d.measure)
                            ],
                            d[d.measure],
                            "color"
                        ).length > 0
                    ) {
                        return UTIL.expressionEvaluator(
                            _displayColorExpression[
                            _measure.indexOf(d.measure)
                            ],
                            d[d.measure],
                            "color"
                        );
                    } else {
                        return UTIL.getDisplayColor(
                            _measure.indexOf(d.measure),
                            _displayColor
                        );
                    }
                } else {
                    return UTIL.getDisplayColor(
                        _measure.indexOf(d.measure),
                        _displayColor
                    );
                }
            })
            .style("stroke", function (d, i) {
                if (d[d.measure] < 0) {
                    return UTIL.getBorderColor(
                        _measure.indexOf(d.measure),
                        _borderColor
                    );
                } else {
                    return UTIL.getBorderColor(
                        _measure.indexOf(d.measure),
                        _borderColor
                    );
                }
            })
            .style("opacity", 1);

        var newBars = clusteredverticalbar
            .enter()
            .append("g")
            .attr("class", "clusteredverticalbar");

        drawViz(newBars, keys);

        clusteredverticalbar
            .select("text")
            .text(function (d, i) {
                return UTIL.getFormattedValue(
                    d[d.measure],
                    UTIL.getValueNumberFormat(i, _numberFormat, d[d.measure])
                );
            })
            .attr("y", function (d, i) {
                if (d[d["measure"]] === null || isNaN(d[d["measure"]])) {
                    return plotHeight;
                } else if (d[d["measure"]] > 0) {
                    return y(d[d["measure"]]) + _fontSize[i];
                }

                return y(0) + _fontSize[i];
            })
            .attr("x", function (d) {
                return x1(d.measure) + x1.bandwidth() / 2;
            })
            .attr("dy", function (d, i) {
                return COMMON.OFFSET;
            })
            .style("text-anchor", "middle")
            .attr("visibility", function (d, i) {
                return UTIL.getVisibility(_showValues[i]);
            })
            .style("font-style", function (d, i) {
                return _fontStyle[i];
            })
            .style("font-weight", function (d, i) {
                return _fontWeight[i];
            })
            .style("font-size", function (d, i) {
                return _fontSize[i] + "px";
            })
            .style("fill", function (d, i) {
                if (_textColorExpression[_measure.indexOf(d.measure)].length) {
                    if (
                        UTIL.expressionEvaluator(
                            _textColorExpression[_measure.indexOf(d.measure)],
                            d[d.measure],
                            "color"
                        ).length > 0
                    ) {
                        return UTIL.expressionEvaluator(
                            _textColorExpression[_measure.indexOf(d.measure)],
                            d[d.measure],
                            "color"
                        );
                    } else {
                        return _textColor[_measure.indexOf(d.measure)];
                    }
                } else {
                    return _textColor[_measure.indexOf(d.measure)];
                }
            })
            .attr("visibility", function (d, i) {
                var rect = d3.select(this.previousElementSibling).node(),
                    rectWidth = rect.getAttribute("width"),
                    rectHeight = rect.getAttribute("height");
                if (_notification) {
                    return "hidden";
                }
                if (!_print) {
                    if (this.getAttribute("visibility") == "hidden")
                        return "hidden";

                    if (
                        rectHeight <=
                        offsetX / 2 +
                        parseFloat(
                            d3
                                .select(this)
                                .style("font-size")
                                .replace("px", "")
                        )
                    ) {
                        return "hidden";
                    }

                    if (this.getComputedTextLength() > parseFloat(rectWidth)) {
                        d3.select(this).style("font-size", "9px");
                        d3.select(this).attr("y", y(d[d.measure]) + 9);
                        if (
                            this.getComputedTextLength() > parseFloat(rectWidth)
                        ) {
                            return "hidden";
                        }
                    }
                }
                return "visible";
            });

        plot.selectAll("g.cluster").attr("transform", function (d) {
            return "translate(" + x0(d[_dimension[0]]) + ", 0)";
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
                _dimensionType[0],
                _dateFormate
            );
        });

        xAxisGroup = plot
            .select(".x_axis")
            .attr("transform", "translate(0, " + plotHeight + ")")
            .attr("visibility", "visible")
            .call(_localXAxis);

        xAxisGroup.select(".alternateDimension").text(_displayName);

        UTIL.toggleAlternateDimensionIcon(
            xAxisGroup,
            plotWidth,
            _showXaxisLabel,
            _xAxisColor,
            true,
            _print,
            _alternateDimension
        );

        if (isRotate) {
            _local_svg
                .selectAll(".x_axis .tick text")
                .attr("transform", "rotate(-15)");
        } else {
            _local_svg
                .selectAll(".x_axis .tick text")
                .attr("transform", "rotate(0)");
        }

        yAxisGroup = plot
            .select(".y_axis")
            .attr("visibility", "visible")
            .call(_localYAxis);

        UTIL.setAxisColor(
            _xAxisColor,
            _showXaxis,
            _yAxisColor,
            _showYaxis,
            _local_svg
        );

        /* Update Axes Grid */
        _localXGrid
            .ticks(_localXLabels.length)
            .tickFormat("")
            .tickSize(-plotHeight);

        _localYGrid
            .tickFormat(function (d) {
                UTIL.setAxisGridVisibility(this, _local_svg, _showGrid, d);
            })
            .tickSize(-plotWidth);

        _localXGrid.scale(_xDimensionGrid);
        _localYGrid.scale(y);

        plot.select(".x.grid")
            .attr("transform", "translate(0, " + plotHeight + ")")
            .attr("visibility", UTIL.getVisibility(_showGrid))
            .call(_localXGrid);

        plot.select(".y.grid").attr("visibility", "visible").call(_localYGrid);

        _local_svg.select(".sort").attr("transform", function () {
            return (
                "translate(0, " +
                parseInt(
                    parentHeight -
                    2 * COMMON.PADDING +
                    20 +
                    legendBreakCount * 20
                ) +
                ")"
            );
        });

        _local_svg.select("g.lasso").remove();

        _local_svg
            .select("g.sort")
            .style("visibility", UTIL.getVisibility(_showSorting));
        var lasso = d3Lasso
            .lasso()
            .hoverSelect(true)
            .closePathSelect(true)
            .closePathDistance(100)
            .items(cluster)
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

    chart.alternateDimension = function (value) {
        if (!arguments.length) {
            return _alternateDimension;
        }
        _alternateDimension = value;
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

    chart.dateFormate = function (value) {
        if (!arguments.length) {
            return _dateFormate;
        }
        _dateFormate = value;
        return chart;
    };

    chart.dateFormate = function (value) {
        if (!arguments.length) {
            return _dateFormate;
        }
        _dateFormate = value;
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

    chart.axisScaleLabel = function (value) {
        if (!arguments.length) {
            return _axisScaleLabel;
        }
        _axisScaleLabel = value;
        return chart;
    };

    chart.showGrid = function (value) {
        if (!arguments.length) {
            return _showGrid;
        }
        _showGrid = value;
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

    chart.displayName = function (value) {
        if (!arguments.length) {
            return _displayName;
        }
        _displayName = value;
        return chart;
    };

    chart.legendData = function (
        measureConfig,
        measureName,
        displayNameForMeasure
    ) {
        _legendData = {
            measureConfig: measureConfig,
            measureName: measureName,
            displayName: displayNameForMeasure,
        };
        return _legendData;
    };

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    };

    chart.showValues = function (value, measure) {
        return UTIL.baseAccessor.call(
            _showValues,
            value,
            measure,
            _measure,
            chart
        );
    };

    chart.displayNameForMeasure = function (value, measure) {
        return UTIL.baseAccessor.call(
            _displayNameForMeasure,
            value,
            measure,
            _measure,
            chart
        );
    };

    chart.fontStyle = function (value, measure) {
        return UTIL.baseAccessor.call(
            _fontStyle,
            value,
            measure,
            _measure,
            chart
        );
    };

    chart.fontWeight = function (value, measure) {
        return UTIL.baseAccessor.call(
            _fontWeight,
            value,
            measure,
            _measure,
            chart
        );
    };

    chart.numberFormat = function (value, measure) {
        return UTIL.baseAccessor.call(
            _numberFormat,
            value,
            measure,
            _measure,
            chart
        );
    };

    chart.textColor = function (value, measure) {
        return UTIL.baseAccessor.call(
            _textColor,
            value,
            measure,
            _measure,
            chart
        );
    };

    chart.displayColor = function (value, measure) {
        return UTIL.baseAccessor.call(
            _displayColor,
            value,
            measure,
            _measure,
            chart
        );
    };

    chart.borderColor = function (value, measure) {
        return UTIL.baseAccessor.call(
            _borderColor,
            value,
            measure,
            _measure,
            chart
        );
    };

    chart.fontSize = function (value, measure) {
        return UTIL.baseAccessor.call(
            _fontSize,
            value,
            measure,
            _measure,
            chart
        );
    };

    chart.textColorExpression = function (value, measure) {
        if (!arguments.length) {
            return _textColorExpression;
        }

        if (value instanceof Array && measure == void 0) {
            _textColorExpression = value.map(function (v) {
                return UTIL.getExpressionConfig(v, ["color"]);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error("Invalid measure provided");
        }

        if (value == void 0) {
            return _textColorExpression[index];
        } else {
            _textColorExpression[index] = UTIL.getExpressionConfig(value, [
                "color",
            ]);
        }
    };

    chart.displayColorExpression = function (value, measure) {
        if (!arguments.length) {
            return _displayColorExpression;
        }

        if (value instanceof Array && measure == void 0) {
            _displayColorExpression = value.map(function (v) {
                return UTIL.getExpressionConfig(v, ["color"]);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error("Invalid measure provided");
        }

        if (value == void 0) {
            return _displayColorExpression[index];
        } else {
            _displayColorExpression[index] = UTIL.getExpressionConfig(value, [
                "color",
            ]);
        }
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
    chart.isFilterGrid = function (value) {
        if (!arguments.length) {
            return _isFilterGrid;
        }
        _isFilterGrid = value;
        return chart;
    };
    chart.showSorting = function (value) {
        if (!arguments.length) {
            return _showSorting;
        }
        _showSorting = value;
        return chart;
    };
    return chart;
}

module.exports = clusteredverticalbar;
