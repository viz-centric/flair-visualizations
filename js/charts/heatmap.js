var d3 = require("d3");
var COMMON = require("../extras/common.js")();
var UTIL = require("../extras/util.js")();
var $ = require("jquery");

try {
    var d3Lasso = require("../../d3-libs/d3-lasso.min.js");
} catch (ex) { }
function heatmap() {
    var _NAME = "heatmap";

    var _config,
        _dimension,
        _dimensionType,
        _measure,
        dimLabelColor,
        displayName,
        fontStyleForDimension,
        fontWeightForDimension,
        fontSizeForDimension,
        colorPattern,
        displayColor,
        showValues = [],
        displayNameForMeasure = [],
        showIcon = [],
        valuePosition = [],
        iconName = [],
        iconFontWeight = [],
        iconColor = [],
        iconPosition = [],
        showIcon = [],
        colourCoding = [],
        valueTextColour = [],
        fontStyleForMeasure = [],
        fontWeightForMeasure = [],
        numberFormat = [],
        fontSizeForMeasure = [],
        iconExpression = [],
        _tooltip,
        _print,
        broadcast,
        filterParameters,
        displayColorMeasure = [],
        _notification = false,
        isLiveEnabled = false,
        _data;

    var _local_svg,
        _Local_data,
        _originalData,
        _localLabelStack = [];
    var width, height, cellWidth, cellHeight, parentContainer;
    var margin = {
        top: 30,
        right: 15,
        bottom: 15,
        left: 150,
    };

    var yScale = d3.scaleBand(),
        xScale = d3.scaleBand(),
        gradientColor = d3.scaleLinear();

    var filter = false,
        filterData = [],
        defaultText = 15;

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.dimensionType(config.dimensionType);
        this.measure(config.measure);
        this.dimLabelColor(config.dimLabelColor);
        this.displayName(config.displayName);
        this.displayColor(config.displayColor);
        this.colorPattern(config.colorPattern);
        this.fontStyleForDimension(config.fontStyleForDimension);
        this.fontWeightForDimension(config.fontWeightForDimension);
        this.fontSizeForDimension(config.fontSizeForDimension);
        this.showValues(config.showValues);
        this.displayNameForMeasure(config.displayNameForMeasure);
        this.showIcon(config.showIcon);
        this.valuePosition(config.valuePosition);
        this.iconName(config.iconName);
        this.iconFontWeight(config.iconFontWeight);
        this.iconColor(config.iconColor);
        this.iconPosition(config.iconPosition);
        this.showIcon(config.showIcon);
        this.colourCoding(config.colourCoding);
        this.valueTextColour(config.valueTextColour);
        this.fontStyleForMeasure(config.fontStyleForMeasure);
        this.fontWeightForMeasure(config.fontWeightForMeasure);
        this.numberFormat(config.numberFormat);
        this.fontSizeForMeasure(config.fontSizeForMeasure);
        this.displayColorMeasure(config.displayColorMeasure);
        this.iconExpression(config.iconExpression);
        setDefaultColorForChart();
    };

    var setDefaultColorForChart = function () {
        for (let index = 0; index < _measure.length; index++) {
            if (
                displayColorMeasure[index] == null ||
                displayColorMeasure[index] == undefined
            ) {
                displayColorMeasure[index] = COMMON.COLORSCALE(index);
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
            UTIL.getDimensionFormatedValue(datum.y, _dimensionType[0]) +
            "</td>" +
            "</tr><tr>" +
            "<th>" +
            datum.x +
            ": </th>" +
            "<td>" +
            Math.round(datum.val * 100) / 100 +
            "</td>" +
            "</tr></table>";

        return output;
    };

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;
        return function (d, i) {
            d3.select(this)
                .select("rect")
                .style("cursor", "pointer")
                .style("cursor", "pointer")
                .style("fill-opacity", 0.5);
            var border = d3.select(this).attr("fill");
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
                var border = getFillColor(d);
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
                .select("rect")
                .style("cursor", "default")
                .style("fill", function (d1, i) {
                    return getFillColor(d);
                })
                .style("fill-opacity", 1);

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        };
    };

    var getIconName = function (index) {
        return iconName[index];
    };

    var getIcon = function (index, endValue, d, height) {
        var iconOutput = "";

        switch (iconPosition[index].toUpperCase()) {
            case "CENTER":
                float = "unset";
                paddingLeft = "0px";
                paddingRight = "0px";
                marginTop = height / 2 - 5;
                break;
            case "RIGHT":
                float = "right";
                paddingLeft = "0px";
                paddingRight = "15px";
                marginTop = height / 2 - 5;
                break;
            case "LEFT":
                float = "left";
                paddingLeft = "10px";
                paddingRight = "0px";
                marginTop = height / 2 - 5;
                break;
        }

        var iconStyle = {
            "font-weight": iconFontWeight[index] || COMMON.DEFAULT_FONTWEIGHT,
            color: valueTextColour[index] || COMMON.DEFAULT_COLOR,
            "font-size":
                fontSizeForMeasure[index] + "px" ||
                COMMON.DEFAULT_FONTSIZE + "px",
            float: float,
            "padding-left": paddingLeft,
            "padding-right": paddingRight,
            "margin-top": marginTop + "px",
        };

        if (iconExpression[index].length) {
            iconName[index] = UTIL.expressionEvaluator(
                iconExpression[index],
                endValue,
                "icon"
            );
            iconStyle["color"] = UTIL.expressionEvaluator(
                iconExpression[index],
                endValue,
                "color"
            );
        }

        if (fontSizeForMeasure[index] >= height) {
            iconStyle["font-size"] = fontSizeForMeasure[index] - 5 + "px";
        }

        iconStyle = JSON.stringify(iconStyle);
        iconStyle = iconStyle.replace(/["{}]/g, "").replace(/,/g, ";");

        iconOutput +=
            '<i  class="fa ' +
            iconName[index] +
            '" style="' +
            iconStyle +
            '" aria-hidden="true"></i>';

        if (getIconName(index) !== "") {
            return iconOutput;
        }
        return "";
    };

    var transformData = function (data) {
        var me = this;
        var result = [];
        var x, y, val;

        data.forEach(function (d) {
            d3.range(_measure.length).forEach(function (j) {
                x = _measure[j];
                y = d[_dimension];
                val = d[_measure[j]] || 0;
                result.push({
                    x: x,
                    y: y,
                    column: j,
                    val: val,
                });
            });
        });

        return result;
    };

    var getFillColor = function (data) {
        var colorProp = colourCoding[_measure.indexOf(data.x)],
            val = data.val,
            result;
        colorProp.some(function (c) {
            if (c.hasOwnProperty("upto")) {
                if (val <= c.upto) {
                    result = c.color;
                    return true;
                }
            } else if (c.hasOwnProperty("above")) {
                if (val > c.above) {
                    result = c.color;
                    return true;
                }
            } else if (c.hasOwnProperty("below")) {
                if (val < c.below) {
                    result = c.color;
                    return true;
                }
            } else if (property.hasOwnProperty("default")) {
                result = c.color;
                return true;
            } else {
                result = c.color;
                return true;
            }
        });

        if (isNaN(val)) {
            return colorProp.filter(function (c) {
                return c.hasOwnProperty("default");
            })[0]["color"];
        }

        if (colorPattern == "unique_color") {
            return result || displayColorMeasure[_measure.indexOf(data.x)];
        } else if (colorPattern == "single_color") {
            return result || displayColor;
        } else {
            return result || gradientColor(data.val);
        }
    };
    var getIconPosition = function (data, width) {
        var iconProp = iconPosition[_measure.indexOf(data.x)];
        var padding = 4;

        var offset;

        switch (iconProp.toUpperCase()) {
            case "CENTER":
                offset = "unset";
                break;
            case "RIGHT":
                offset = "right";
                break;
            case "LEFT":
                offset = "left";
                break;
        }

        return offset;
    };
    var getValuePosition = function (data, width) {
        var valPosition = valuePosition[_measure.indexOf(data.x)];
        var padding = 4;

        var offset;

        switch (valPosition.toUpperCase()) {
            case "LEFT":
                offset = 0 + padding;
                break;
            case "CENTER":
                offset = width / 2;
                break;
            case "RIGHT":
                offset = width - 5 * padding;
                break;
        }

        return offset;
    };
    var getValueTextAnchor = function (data) {
        var valPosition = valuePosition[_measure.indexOf(data.x)];

        var anchor;

        switch (valPosition.toUpperCase()) {
            case "LEFT":
                anchor = "start";
                break;
            case "CENTER":
                anchor = "middle";
                break;
            case "RIGHT":
                anchor = "end";
                break;
        }

        return anchor;
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
                data.forEach(function (d) {
                    var temp = d.y;
                    var searchObj = _filter.find(
                        (o) => o[_dimension[0]] === temp
                    );
                    if (searchObj == undefined) {
                        var tempData = _Local_data.filter(function (val) {
                            return val[_dimension[0]] === d.y;
                        });
                        _filter.push(tempData[0]);
                    }
                });
                if (_filter.length > 0) {
                    filterData = _filter;
                }
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
            d3.select(div).select(".confirm").style("visibility", "hidden");
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

        width = +svg.attr("width");
        height = +svg.attr("height");

        parentContainer.append("div").attr("class", "custom_tooltip");

        _local_svg = svg;

        svg.selectAll("g").remove();
        var me = this;

        var plot = svg
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("class", "plot")
            .attr(
                "transform",
                "translate(" + margin.left + ", " + margin.top + ")"
            );

        var yElement = d3
            .set(
                _data.map(function (item) {
                    return item[_dimension[0]];
                })
            )
            .values();
        var xElement = d3.map();

        for (var i = 0; i < _measure.length; i++) {
            xElement.set(i, _measure[i]);
        }

        cellWidth = parseInt(
            (width - margin.left - margin.right) / _measure.length
        );
        cellHeight = parseInt(
            (height - margin.top - margin.bottom) / _data.length
        );

        var offset = 6;

        var mesLabel = plot
            .selectAll(".mesLabel")
            .data(
                xElement.values().map(function (mes) {
                    return displayNameForMeasure[_measure.indexOf(mes)];
                })
            )
            .enter()
            .append("text")
            .attr("class", "mesLabel")
            .text(function (d) {
                return d;
            })
            .text(function (d) {
                if (!_print) {
                    return UTIL.title(
                        UTIL.getTruncatedLabel(this, d, cellWidth)
                    );
                } else {
                    return d.substring(0, 15);
                }
            })
            .attr("transform", "translate(" + cellWidth / 2 + ", -6)")
            .attr("x", function (d, i) {
                return i * cellWidth;
            })
            .attr("y", 0)
            .style("text-anchor", "middle");

        var dimLabel = plot
            .selectAll(".dimLabel")
            .data(yElement)
            .enter()
            .append("text")
            .attr("class", "dimLabel")
            .attr("y", function (d, i) {
                return i * cellHeight;
            })
            .style("fill", dimLabelColor)
            .style("font-style", fontStyleForDimension)
            .style("font-weight", fontWeightForDimension)
            .style("font-size", fontSizeForDimension)
            .style("text-anchor", "end")
            .attr(
                "transform",
                "translate(" + -offset + "," + cellHeight / 1.75 + ")"
            )
            .append("tspan")
            .text(function (d) {
                return d;
            })
            .text(function (d) {
                if (d.length > defaultText) {
                    return d.substring(0, defaultText);
                }
                if (cellHeight < fontSizeForDimension * 2) {
                    return d.substring(0, defaultText) + "...";
                }
                return d;
            })
            .attr("x", 0)
            .attr("y", function (d, i) {
                return i * cellHeight;
            })
            .append("tspan")
            .text(function (d) {
                return d;
            })
            .text(function (d) {
                if (cellHeight < fontSizeForDimension * 2) {
                    return "";
                }
                if (d.length > defaultText * 2) {
                    return d.substring(defaultText, defaultText * 2) + "...";
                }
                if (d.length > defaultText) {
                    return d.substring(defaultText, defaultText * 2);
                }
                return "";
            })
            .attr("x", 0)
            .attr("y", function (d, i) {
                return i * cellHeight + fontSizeForDimension;
            })

            .append("svg:title")
            .text(function (d) {
                return d;
            });

        yScale.domain(yElement).range([0, yElement.length * cellHeight]);

        xScale
            .domain(
                xElement.entries().map(function (element) {
                    return element.key + "_" + element.value;
                })
            )
            .range([0, xElement.size() * cellWidth]);

        data = transformData(_data);

        gradientColor.range([
            d3.rgb(displayColor).brighter(),
            d3.rgb(displayColor).darker(),
        ]);

        gradientColor.domain(
            d3.extent(data, function (d) {
                return d.val;
            })
        );

        if (_tooltip) {
            tooltip = parentContainer.select(".custom_tooltip");
        }

        var cell = plot
            .selectAll(".node")
            .data(data)
            .enter()
            .append("g")
            .attr("transform", function (d) {
                return (
                    "translate(" +
                    xScale(d.column + "_" + d.x) +
                    "," +
                    yScale(d.y) +
                    ")"
                );
            })
            .attr("class", "node");

        drawViz(cell);
        if (!_print) {
            var _filter = UTIL.createFilterElement();
            $("#" + parentContainer.attr("id")).append(_filter);

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
                .items(cell)
                .targetArea(_local_svg);

            lasso
                .on("start", onLassoStart(lasso, _local_svg))
                .on("draw", onLassoDraw(lasso, _local_svg))
                .on("end", onLassoEnd(lasso, _local_svg));

            _local_svg.call(lasso);
        }
    }

    var drawViz = function (element) {
        if (!_print) {
            element
                .append("rect")
                .attr("rx", "3px")
                .attr("ry", "3px")
                .attr("class", "bordered")
                .style("stroke", "#ffffff")
                .style("stroke-width", "2px")
                .attr("width", cellWidth - 1)
                .attr("height", cellHeight - 1)
                .transition()
                .ease(d3.easeQuadIn)
                .duration(COMMON.DURATION)
                .styleTween("fill", function (d) {
                    return d3.interpolateRgb("transparent", getFillColor(d));
                });

            element
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
                    filter = false;
                    if (isLiveEnabled) {
                        broadcast.$broadcast("FlairBi:livemode-dialog");
                        return;
                    }
                    var confirm = parentContainer
                        .select(".confirm")
                        .style("visibility", "visible");
                    var _filter = _Local_data.filter(function (d1) {
                        return d.y === d1[_dimension[0]];
                    });

                    var rect = d3.select(this).select("rect");

                    if (rect.classed("selected")) {
                        rect.classed("selected", false);
                    } else {
                        rect.classed("selected", true);
                    }

                    var _filterDimension = broadcast.selectedFilters || {};
                    var _filterDimension = broadcast.selectedFilters || {};

                    var dimension = _dimension[0];
                    if (_filterDimension[dimension]) {
                        var temp = _filterDimension[dimension];
                        if (temp.indexOf(d.y) < 0) {
                            temp.push(d.y);
                        } else {
                            temp.splice(temp.indexOf(d.y), 1);
                        }
                        _filterDimension[dimension] = temp;
                    } else {
                        _filterDimension[dimension] = [d.y];
                    }

                    _filterDimension[dimension]._meta = {
                        dataType: _dimensionType[0],
                        valueType: "castValueType",
                    };

                  broadcast.saveSelectedFilter(_filterParameters);
                });
        } else {
            element
                .append("rect")
                .attr("rx", "3px")
                .attr("ry", "3px")
                .attr("class", "bordered")
                .style("stroke", "#ffffff")
                .style("stroke-width", "2px")
                .attr("width", cellWidth - 1)
                .attr("height", cellHeight - 1)
                .style("fill", function (d) {
                    return getFillColor(d);
                });
        }

        element
            .append("text")
            .attr("x", function (d) {
                return getValuePosition(d, cellWidth);
            })
            .attr("y", function (d) {
                return cellHeight / 2;
            })
            .attr("dx", "0.2em")
            .attr("dy", "0.2em")
            .text(function (d) {
                var si = numberFormat[_measure.indexOf(d.x)],
                    nf = UTIL.getNumberFormatterFn(si, d.val),
                    value;

                if (si == "Percent") {
                    value = nf(d.val / me.helper.measuresTotal[d.x]);
                } else {
                    value = nf(d.val);
                }

                if (value.indexOf("G") != -1) {
                    value = value.slice(0, -1) + "B";
                }

                return value;
            })
            .style("fill", function (d) {
                return valueTextColour[_measure.indexOf(d.x)];
            })
            .attr("text-anchor", function (d) {
                return getValueTextAnchor(d);
            })
            .attr("visibility", function (d) {
                return UTIL.getVisibility(showValues[_measure.indexOf(d.x)]);
            })
            .style("font-style", function (d) {
                return fontStyleForMeasure[_measure.indexOf(d.x)];
            })
            .style("font-weight", function (d) {
                return fontWeightForMeasure[_measure.indexOf(d.x)];
            })
            .style("font-size", function (d) {
                if (
                    fontSizeForMeasure[_measure.indexOf(d.x)] >=
                    cellHeight - 1
                ) {
                    return fontSizeForMeasure[_measure.indexOf(d.x)] - 5;
                }
                return fontSizeForMeasure[_measure.indexOf(d.x)];
            });

        element
            .append("foreignObject")
            .attr("visibility", function (d) {
                return UTIL.getVisibility(showIcon[_measure.indexOf(d.x)]);
            })
            .attr("width", cellWidth - 1)
            .attr("height", cellHeight - 1)
            .html(function (d) {
                //return '<i class="' + iconName[_measure.indexOf(d.x)] + '" aria-hidden="true" style="font-weight:' + iconFontWeight[_measure.indexOf(d.x)] + ';color:' + iconColor[_measure.indexOf(d.x)] + ';font-size:' + fontSizeForMeasure[_measure.indexOf(d.x)] + 'px;"></i>';

                return getIcon(_measure.indexOf(d.x), d.val, d, cellHeight);
            });
    };

    chart.update = function (data) {
        if (_tooltip) {
            tooltip = parentContainer.select(".custom_tooltip");
        }
        _Local_data = data;
        filterData = [];
        var svg = _local_svg;
        var yElement = d3
            .set(
                data.map(function (item) {
                    return item[_dimension[0]];
                })
            )
            .values();
        var xElement = d3.map();

        for (var i = 0; i < _measure.length; i++) {
            xElement.set(i, _measure[i]);
        }

        (cellWidth = parseInt(
            (width - margin.left - margin.right) / _measure.length
        )),
            (cellHeight = parseInt(
                (height - margin.top - margin.bottom) / data.length
            ));
        var offset = 6;
        var plot = svg.select(".plot");

        plot.selectAll(".dimLabel").remove();

        var offset = 6;
        var dimLabel = plot
            .selectAll(".dimLabel")
            .data(yElement)
            .enter()
            .append("text")
            .attr("class", "dimLabel")
            .attr("y", function (d, i) {
                return i * cellHeight;
            })
            .style("fill", dimLabelColor)
            .style("font-style", fontStyleForDimension)
            .style("font-weight", fontWeightForDimension)
            .style("font-size", fontSizeForDimension)
            .style("text-anchor", "end")
            .attr(
                "transform",
                "translate(" + -offset + "," + cellHeight / 1.75 + ")"
            )
            .append("tspan")
            .text(function (d) {
                return d;
            })
            .text(function (d) {
                if (d.length > defaultText) {
                    return d.substring(0, defaultText);
                }
                if (cellHeight < fontSizeForDimension * 2) {
                    return d.substring(0, defaultText) + "...";
                }
                return d;
            })
            .attr("x", 0)
            .attr("y", function (d, i) {
                return i * cellHeight;
            })
            .append("tspan")
            .text(function (d) {
                return d;
            })
            .text(function (d) {
                if (cellHeight < fontSizeForDimension * 2) {
                    return "";
                }
                if (d.length > defaultText) {
                    return d.substring(defaultText, defaultText * 2) + "...";
                }
                return "";
            })
            .attr("x", 0)
            .attr("y", function (d, i) {
                return i * cellHeight + fontSizeForDimension;
            })

            .append("svg:title")
            .text(function (d) {
                return d;
            });

        yScale.domain(yElement).range([0, yElement.length * cellHeight]);

        xScale
            .domain(
                xElement.entries().map(function (element) {
                    return element.key + "_" + element.value;
                })
            )
            .range([0, xElement.size() * cellWidth]);

        data = transformData(data);

        gradientColor.range([
            d3.rgb(displayColor).brighter(),
            d3.rgb(displayColor).darker(),
        ]);

        gradientColor.domain(
            d3.extent(data, function (d) {
                return d.val;
            })
        );
        var cell = plot.selectAll(".node").data(data);

        var newCell = cell
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return (
                    "translate(" +
                    xScale(d.column + "_" + d.x) +
                    "," +
                    yScale(d.y) +
                    ")"
                );
            });

        cell.exit().remove();

        cell = plot.selectAll(".node");

        cell.select("rect")
            .attr("rx", "3px")
            .attr("ry", "3px")
            .attr("class", "bordered")
            .style("stroke", "#ffffff")
            .style("stroke-width", "2px")
            .attr("width", cellWidth - 1)
            .attr("height", cellHeight - 1)
            .style("fill", function (d) {
                return getFillColor(d);
            });

        cell.select("text")
            .attr("x", function (d) {
                return getValuePosition(d, cellWidth);
            })
            .attr("y", function (d) {
                return cellHeight / 2;
            })
            .attr("dx", "0.2em")
            .attr("dy", "0.2em")
            .text(function (d) {
                var si = numberFormat[_measure.indexOf(d.x)],
                    nf = UTIL.getNumberFormatterFn(si, d.val),
                    value;

                if (si == "Percent") {
                    value = nf(d.val / me.helper.measuresTotal[d.x]);
                } else {
                    value = nf(d.val);
                }

                if (value.indexOf("G") != -1) {
                    value = value.slice(0, -1) + "B";
                }

                return value;
            })
            .style("fill", function (d) {
                return valueTextColour[_measure.indexOf(d.x)];
            })
            .attr("text-anchor", function (d) {
                return getValueTextAnchor(d);
            })
            .attr("visibility", function (d) {
                return UTIL.getVisibility(showValues[_measure.indexOf(d.x)]);
            })
            .style("font-style", function (d) {
                return fontStyleForMeasure[_measure.indexOf(d.x)];
            })
            .style("font-weight", function (d) {
                return fontWeightForMeasure[_measure.indexOf(d.x)];
            })
            .style("font-size", function (d) {
                if (
                    fontSizeForMeasure[_measure.indexOf(d.x)] >=
                    cellHeight - 1
                ) {
                    return fontSizeForMeasure[_measure.indexOf(d.x)] - 5;
                }
                return fontSizeForMeasure[_measure.indexOf(d.x)];
            });

        cell.select("foreignObject")
            .attr("visibility", function (d) {
                return UTIL.getVisibility(showIcon[_measure.indexOf(d.x)]);
            })
            .attr("width", cellWidth - 1)
            .attr("height", cellHeight - 1)
            .html(function (d) {
                //return '<i class="' + iconName[_measure.indexOf(d.x)] + '" aria-hidden="true" style="font-weight:' + iconFontWeight[_measure.indexOf(d.x)] + ';color:' + iconColor[_measure.indexOf(d.x)] + ';font-size:' + fontSizeForMeasure[_measure.indexOf(d.x)] + 'px;"></i>';

                return getIcon(_measure.indexOf(d.x), d.val, d, cellHeight);
            });

        newCell
            .append("rect")
            .attr("rx", "3px")
            .attr("ry", "3px")
            .attr("class", "bordered")
            .style("stroke", "#ffffff")
            .style("stroke-width", "2px")
            .attr("width", cellWidth - 1)
            .attr("height", cellHeight - 1)
            .style("fill", function (d) {
                return getFillColor(d);
            });

        newCell
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
                var _filter = _Local_data.filter(function (d1) {
                    return d.y === d1[_dimension[0]];
                });

                var rect = d3.select(this).select("rect");

                if (rect.classed("selected")) {
                    rect.classed("selected", false);
                } else {
                    rect.classed("selected", true);
                }

                var _filterDimension = broadcast.selectedFilters || {};
                if (broadcast.filterSelection.id) {
                    _filterDimension = broadcast.selectedFilters[_dimension[0]] || {};
                } else {
                    broadcast.filterSelection.id = parentContainer.attr("id");
                }
                var dimension = _dimension[0];
                if (_filterDimension[dimension]) {
                    var temp = _filterDimension[dimension];
                    if (temp.indexOf(d.y) < 0) {
                        temp.push(d.y);
                    } else {
                        temp.splice(temp.indexOf(d.y), 1);
                    }
                    _filterDimension[dimension] = temp;
                } else {
                    _filterDimension[dimension] = [d.y];
                }

                _filterDimension[dimension]._meta = {
                    dataType: _dimensionType[0],
                    valueType: "castValueType",
                };
                broadcast.saveSelectedFilter(_filterDimension);
            });

        newCell
            .append("text")
            .attr("x", function (d) {
                return getValuePosition(d, cellWidth);
            })
            .attr("y", function (d) {
                return cellHeight / 2;
            })
            .attr("dx", "0.2em")
            .attr("dy", "0.2em")
            .text(function (d) {
                var si = numberFormat[_measure.indexOf(d.x)],
                    nf = UTIL.getNumberFormatterFn(si, d.val),
                    value;

                if (si == "Percent") {
                    value = nf(d.val / me.helper.measuresTotal[d.x]);
                } else {
                    value = nf(d.val);
                }

                if (value.indexOf("G") != -1) {
                    value = value.slice(0, -1) + "B";
                }

                return value;
            })
            .style("fill", function (d) {
                return valueTextColour[_measure.indexOf(d.x)];
            })
            .attr("text-anchor", function (d) {
                return getValueTextAnchor(d);
            })
            .attr("visibility", function (d) {
                return UTIL.getVisibility(showValues[_measure.indexOf(d.x)]);
            })
            .style("font-style", function (d) {
                return fontStyleForMeasure[_measure.indexOf(d.x)];
            })
            .style("font-weight", function (d) {
                return fontWeightForMeasure[_measure.indexOf(d.x)];
            })
            .style("font-size", function (d) {
                if (
                    fontSizeForMeasure[_measure.indexOf(d.x)] >=
                    cellHeight - 1
                ) {
                    return fontSizeForMeasure[_measure.indexOf(d.x)] - 5;
                }
                return fontSizeForMeasure[_measure.indexOf(d.x)];
            });

        newCell
            .append("foreignObject")
            .attr("visibility", function (d) {
                return UTIL.getVisibility(showIcon[_measure.indexOf(d.x)]);
            })
            .attr("width", cellWidth - 1)
            .attr("height", cellHeight - 1)
            .html(function (d) {
                //return '<i class="' + iconName[_measure.indexOf(d.x)] + '" aria-hidden="true" style="font-weight:' + iconFontWeight[_measure.indexOf(d.x)] + ';color:' + iconColor[_measure.indexOf(d.x)] + ';font-size:' + fontSizeForMeasure[_measure.indexOf(d.x)] + 'px;"></i>';

                return getIcon(_measure.indexOf(d.x), d.val, d, cellHeight);
            });

        //   drawViz(newCell)

        plot.selectAll(".node").attr("transform", function (d) {
            return (
                "translate(" +
                xScale(d.column + "_" + d.x) +
                "," +
                yScale(d.y) +
                ")"
            );
        });

        _local_svg.select("g.lasso").remove();

        var lasso = d3Lasso
            .lasso()
            .hoverSelect(true)
            .closePathSelect(true)
            .closePathDistance(100)
            .items(cell)
            .targetArea(_local_svg);

        lasso
            .on("start", onLassoStart(lasso, _local_svg))
            .on("draw", onLassoDraw(lasso, _local_svg))
            .on("end", onLassoEnd(lasso, _local_svg));

        _local_svg.call(lasso);
    };

    chart._getName = function () {
        return _NAME;
    };

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
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

    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    };

    chart.dimLabelColor = function (value) {
        if (!arguments.length) {
            return dimLabelColor;
        }
        dimLabelColor = value;
        return chart;
    };

    chart.displayName = function (value) {
        if (!arguments.length) {
            return displayName;
        }
        displayName = value;
        return chart;
    };

    chart.fontWeightForDimension = function (value) {
        if (!arguments.length) {
            return fontWeightForDimension;
        }
        fontWeightForDimension = value;
        return chart;
    };

    chart.fontSizeForDimension = function (value) {
        if (!arguments.length) {
            return fontSizeForDimension;
        }
        fontSizeForDimension = value;
        return chart;
    };

    chart.fontStyleForDimension = function (value) {
        if (!arguments.length) {
            return fontStyleForDimension;
        }
        fontStyleForDimension = value;
        return chart;
    };

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    };

    chart.colorPattern = function (value) {
        if (!arguments.length) {
            return colorPattern;
        }
        colorPattern = value;
        return chart;
    };

    chart.displayColor = function (value) {
        if (!arguments.length) {
            return displayColor;
        }
        displayColor = value;
        return chart;
    };

    chart.showValues = function (value, measure) {
        return UTIL.baseAccessor.call(showValues, value, measure, _measure);
    };
    chart.displayColorMeasure = function (value, measure) {
        return UTIL.baseAccessor.call(
            displayColorMeasure,
            value,
            measure,
            _measure
        );
    };
    chart.displayNameForMeasure = function (value, measure) {
        return UTIL.baseAccessor.call(
            displayNameForMeasure,
            value,
            measure,
            _measure
        );
    };
    chart.showIcon = function (value, measure) {
        return UTIL.baseAccessor.call(showIcon, value, measure, _measure);
    };
    chart.valuePosition = function (value, measure) {
        return UTIL.baseAccessor.call(valuePosition, value, measure, _measure);
    };
    chart.iconName = function (value, measure) {
        return UTIL.baseAccessor.call(iconName, value, measure, _measure);
    };
    chart.iconFontWeight = function (value, measure) {
        return UTIL.baseAccessor.call(iconFontWeight, value, measure, _measure);
    };
    chart.iconColor = function (value, measure) {
        return UTIL.baseAccessor.call(iconColor, value, measure, _measure);
    };
    chart.iconPosition = function (value, measure) {
        return UTIL.baseAccessor.call(iconPosition, value, measure, _measure);
    };
    chart.showIcon = function (value, measure) {
        return UTIL.baseAccessor.call(showIcon, value, measure, _measure);
    };

    chart.colourCoding = function (value, measure) {
        if (!arguments.length) {
            return colourCoding;
        }

        if (value instanceof Array && measure == void 0) {
            colourCoding = value.map(function (v) {
                return UTIL.getExpressionConfig(v, ["color"]);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error("Invalid measure provided");
        }

        if (value == void 0) {
            return colourCoding[index];
        } else {
            colourCoding[index] = UTIL.getExpressionConfig(value, ["color"]);
        }
    };
    chart.valueTextColour = function (value, measure) {
        return UTIL.baseAccessor.call(
            valueTextColour,
            value,
            measure,
            _measure
        );
    };
    chart.fontStyleForMeasure = function (value, measure) {
        return UTIL.baseAccessor.call(
            fontStyleForMeasure,
            value,
            measure,
            _measure
        );
    };
    chart.fontWeightForMeasure = function (value, measure) {
        return UTIL.baseAccessor.call(
            fontWeightForMeasure,
            value,
            measure,
            _measure
        );
    };
    chart.numberFormat = function (value, measure) {
        return UTIL.baseAccessor.call(numberFormat, value, measure, _measure);
    };
    chart.fontSizeForMeasure = function (value, measure) {
        return UTIL.baseAccessor.call(
            fontSizeForMeasure,
            value,
            measure,
            _measure
        );
    };

    chart.iconExpression = function (value, measure) {
        if (!arguments.length) {
            /**
             * Getter method call with no arguments
             * E.g. <chart>.kpiIconExpression() ==> [<item1>, <item2>]
             */
            return iconExpression;
        }

        if (value instanceof Array && measure == void 0) {
            /**
             * Setter method call with only value argument
             * E.g. <chart>.kpiIconExpression([<item1>, <item2>]) ==> <chart_function>
             */
            iconExpression = value.map(function (v) {
                return UTIL.getExpressionConfig(v, ["icon", "color"]);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error("Invalid measure provided");
        }

        if (value == void 0) {
            /**
             * Getter method call with only measure argument
             * E.g. <chart>.kpiIconExpression(<measure>) ==> <item>
             */
            return iconExpression[index];
        } else {
            /**
             * Setter method call with both value and measure arguments
             * E.g. <chart>.kpiIconExpression(<item>, <measure>) ==> <chart_function>
             */
            iconExpression[index] = UTIL.getExpressionConfig(value, [
                "icon",
                "color",
            ]);
        }

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

module.exports = heatmap;
