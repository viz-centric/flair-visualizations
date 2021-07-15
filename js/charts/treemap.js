var d3 = require("d3");
var COMMON = require("../extras/common.js")();
var UTIL = require("../extras/util.js")();
var $ = require("jquery");

try {
    var d3Lasso = require("../../d3-libs/d3-lasso.min.js");
} catch (ex) { }

function treemap() {
    /* These are the constant global variable for the function clusteredverticalbar.
     */
    var _NAME = "treemap";

    /* These are the private variables that is initialized by the arguments sent
     * by the users and can be updated using public methods.
     */

    var _config,
        _dimension,
        _dimensionType,
        _measure,
        showLabel,
        colorPattern,
        showValues,
        valueTextColour,
        fontStyleForMes,
        fontWeightForMes,
        fontSizeForMes,
        numberFormat,
        colorSet,
        showLabelForDimension = [],
        labelColorForDimension = [],
        displayColor = [],
        fontStyleForDimension = [],
        fontWeightForDimension = [],
        fontSizeForDimension = [],
        _print,
        broadcast,
        filterParameters,
        _notification = false,
        isLiveEnabled = false,
        _data;

    /* These are the common variables that is shared across the different private/public
     * methods but is initialized/updated within the methods itself.
     */
    var _local_svg,
        _localTotal,
        _localData = [],
        _tooltip,
        textPadding = 2,
        _originalData,
        width,
        height,
        parentContainer;
    // _localLabelStack;

    /* These are the common private functions that is shared across the different private/public
     * methods but is initialized beforehand.
     */
    var BASE_COLOR = "#ffffff",
        dim1Color = d3.scaleLinear(),
        dim2Color = d3.scaleLinear(),
        filterData = [],
        root,
        treemap,
        nest;
    /* -------------------------------------------------------------------------------- */
    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.dimensionType(config.dimensionType);
        this.measure(config.measure);
        this.showLabel(config.showLabel);
        this.colorPattern(config.colorPattern);
        this.showValues(config.showValues);
        this.colorSet(config.colorSet);
        this.valueTextColour(config.valueTextColour);
        this.fontStyleForMes(config.fontStyleForMes);
        this.fontWeightForMes(config.fontWeightForMes);
        this.fontSizeForMes(config.fontSizeForMes);
        this.numberFormat(config.numberFormat);
        this.showLabelForDimension(config.showLabelForDimension);
        this.labelColorForDimension(config.labelColorForDimension);
        this.displayColor(config.displayColor);
        this.fontStyleForDimension(config.fontStyleForDimension);
        this.fontWeightForDimension(config.fontWeightForDimension);
        this.fontSizeForDimension(config.fontSizeForDimension);
        setDefaultColorForChart();
    };

    var setColorDomainRange = function (arr, dim) {
        var values = [];

        arr.forEach(function (item) {
            if (item.depth == dim) {
                values.push(item.value);
            }
        });

        if (dim == 1) {
            dim1Color.domain([
                Math.min.apply(Math, values),
                Math.max.apply(Math, values),
            ]);
            dim1Color.range([
                d3
                    .rgb(
                        displayColor[0] != undefined
                            ? displayColor[0]
                            : UTIL.getUniqueColour(0)
                    )
                    .brighter(),
                d3
                    .rgb(
                        displayColor[0] != undefined
                            ? displayColor[0]
                            : UTIL.getUniqueColour(0)
                    )
                    .darker(),
            ]);
        } else if (dim == 2) {
            dim2Color.domain([
                Math.min.apply(Math, values),
                Math.max.apply(Math, values),
            ]);
            dim2Color.range([
                d3
                    .rgb(
                        displayColor[1] != undefined
                            ? displayColor[1]
                            : UTIL.getUniqueColour(1)
                    )
                    .brighter(),
                d3
                    .rgb(
                        displayColor[1] != undefined
                            ? displayColor[1]
                            : UTIL.getUniqueColour(1)
                    )
                    .darker(),
            ]);
        }
    };

    var getFillColor = function (obj, index) {
        if (index == 0) {
            return BASE_COLOR;
        }

        if (colorPattern == "single_color") {
            if (_dimension.length == 2) {
                if (obj.children) {
                    return displayColor[0] != undefined
                        ? displayColor[0]
                        : UTIL.getUniqueColour(0);
                } else {
                    return displayColor[1] != undefined
                        ? displayColor[1]
                        : UTIL.getUniqueColour(1);
                }
            } else {
                return displayColor[0] != undefined
                    ? displayColor[0]
                    : UTIL.getUniqueColour(0);
            }
        } else if (colorPattern == "unique_color") {
            return colorSet[index] != undefined
                ? colorSet[index]
                : UTIL.getUniqueColour(index);
        } else if (colorPattern == "gradient_color") {
            if (_dimension.length == 2) {
                if (obj.children) {
                    return dim1Color(obj.value);
                } else {
                    return dim2Color(obj.value);
                }
            } else {
                return dim1Color(obj.value);
            }
        }
    };

    var getFilterLabels = function (obj) {
        var result = [];

        if (_dimension.length == 2) {
            if (obj.children) {
                if (showLabelForDimension[0]) {
                    result = result.concat({
                        node: obj,
                        data: UTIL.getDimensionFormatedValue(
                            obj.data.key,
                            _dimensionType[0]
                        ),
                    });
                }
            } else {
                if (showLabelForDimension[1]) {
                    result = result.concat({
                        node: obj,
                        data: UTIL.getDimensionFormatedValue(
                            obj.data.key,
                            _dimensionType[1]
                        ),
                    });
                }
            }
        } else {
            if (showLabelForDimension[0]) {
                result = result.concat({
                    node: obj,
                    data: UTIL.getDimensionFormatedValue(
                        obj.data.key,
                        _dimensionType[0]
                    ),
                });
            }
        }

        if (showLabelForDimension[0]) {
            var nf = UTIL.getNumberFormatterFn(numberFormat, obj.value),
                value;

            if (numberFormat == "Percent") {
                value = nf(obj.value / _localTotal);
            } else {
                value = nf(obj.value);
            }

            if (value.indexOf("G") != -1) {
                value = value.slice(0, -1) + "B";
            }
            result = result.concat({ node: obj, data: value });
        }

        if (!obj.parent) {
            return [];
        }

        return result;
    };

    var getColorValue = function (data, index) {
        if (
            (data.node.children && _dimension.length == 2) ||
            (!data.node.children && _dimension.length == 1)
        ) {
            if (showLabelForDimension[0]) {
                return labelColorForDimension[0];
            }
        } else {
            if (showLabelForDimension[1]) {
                return labelColorForDimension[1];
            }
        }
        return null;
    };

    var getFontWeightValue = function (obj, index) {
        if (
            (obj.node.children && _dimension.length == 2) ||
            (!obj.node.children && _dimension.length == 1)
        ) {
            if (showLabelForDimension[0]) {
                return fontWeightForDimension[0];
            }
        } else {
            if (showLabelForDimension[1]) {
                return fontWeightForDimension[1];
            }
        }

        return null;
    };

    var getFontStyleValue = function (obj, index) {
        if (
            (obj.node.children && _dimension.length == 2) ||
            (!obj.node.children && _dimension.length == 1)
        ) {
            if (showLabelForDimension[0]) {
                return fontStyleForDimension[0];
            }
        } else {
            if (showLabelForDimension[1]) {
                return fontStyleForDimension[1];
            }
        }

        return null;
    };

    var getFontSizeValue = function (obj, index) {
        if (
            (obj.node.children && _dimension.length == 2) ||
            (!obj.node.children && _dimension.length == 1)
        ) {
            if (showLabelForDimension[0]) {
                return fontSizeForDimension[0];
            }
        } else {
            if (showLabelForDimension[1]) {
                return fontSizeForDimension[1];
            }
        }

        return null;
    };

    var getVisibilityValue = function (element, node) {
        if (!_print) {
            var contWidth = node.x1 - node.x0,
                contHeight = node.y1 - node.y0,
                textWidth = element.getComputedTextLength(),
                textHeight = parseInt(
                    d3.select(element).style("font-size").replace("px", "")
                );

            // if (((textWidth + 2 * textPadding) > contWidth) || ((textHeight + 2 * textPadding) > contHeight)) {
            //     return 'hidden';
            // }

            var valueWidth = d3
                .select(element)
                .selectAll("tspan")
                ._groups[0][1].getComputedTextLength();
            if (valueWidth > contWidth + 2 * textPadding) {
                return "hidden";
            } else {
                var textElement = d3.select(element).selectAll("tspan")
                    ._groups[0][0];
                var text = d3.select(element).selectAll("tspan")
                    ._groups[0][0].textContent;

                contWidth = contWidth - valueWidth - 2 * textPadding;
                d3
                    .select(element)
                    .selectAll("tspan")._groups[0][0].textContent =
                    UTIL.getTruncatedLabel(textElement, text, contWidth);
            }

            return "visible";
        }
        return "visible";
    };

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style("cursor", "pointer");
            // .style('cursor', 'pointer')
            // .style('fill-opacity', .5);
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
                var border = d3.select(this).attr("fill");
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
            var border = d3.select(this).attr("fill");
            d3.select(this)
                .style("cursor", "default")
                .style("fill", function (d1, i) {
                    return border;
                });

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        };
    };

    var setDefaultColorForChart = function () {
        for (let index = 0; index < _dimension.length; index++) {
            if (
                displayColor[index] == null ||
                displayColor[index] == undefined
            ) {
                displayColor[index] = COMMON.COLORSCALE(index);
            }
        }
    };

    var _buildTooltipData = function (datum, chart) {
        var output = "";

        if (datum.data.key != undefined) {
            if (datum.children != undefined) {
                output +=
                    "<table><tr>" +
                    "<tr> <th>" +
                    _dimension[0] +
                    ": </th>" +
                    "<td>" +
                    UTIL.getDimensionFormatedValue(
                        datum.data.key,
                        _dimensionType[0]
                    ) +
                    "</td>" +
                    "</tr>";
            } else {
                if (datum.parent.depth == 0) {
                    output +=
                        "<table><tr>" +
                        "<tr><th>" +
                        _dimension[0] +
                        "</th><th>" +
                        UTIL.getDimensionFormatedValue(
                            datum.data.key,
                            _dimensionType[0]
                        ) +
                        "</th></tr>" +
                        "<tr> <th>" +
                        _measure[0] +
                        ": </th>" +
                        "<td>" +
                        Math.round(datum.data.value * 100) / 100 +
                        "</td>" +
                        "</tr>";
                } else {
                    output +=
                        "<table><tr>" +
                        "<tr><th>" +
                        _dimension[0] +
                        "</th><th>" +
                        datum.parent.data.key +
                        "</th></tr>" +
                        "<tr> <th>" +
                        _dimension[1] +
                        ": </th>" +
                        "<td>" +
                        datum.data.key +
                        "</td>" +
                        "</tr>" +
                        "<tr> <th>" +
                        _measure[0] +
                        ": </th>" +
                        "<td>" +
                        Math.round(datum.data.value * 100) / 100 +
                        "</td>" +
                        "</tr>";
                }
            }

            if (datum.data.values != undefined) {
                for (var index = 0; index < datum.data.values.length; index++) {
                    output +=
                        " <tr> <th>" +
                        datum.data.values[index].key +
                        ": </th>" +
                        "<td>" +
                        Math.round(datum.data.values[index].value * 100) / 100 +
                        "</td>" +
                        "</tr>";
                }
            }
            // else {
            //     output += " <tr> <th>" + _measure[0] + ": </th>"
            //         + "<td>" + Math.round(datum.data.value * 100) / 100 + "</td>"
            //         + "</tr>";
            // }
            output += "</table>";
            return output;
        } else {
            UTIL.hideTooltip(tooltip);
        }
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

            var _filter = {};
            if (data.length > 0) {
                data.forEach(function (d) {
                    if (d.data.key) {
                        if (_dimension.length == 2) {
                            if (d.children) {
                                if (_filter[_dimension[0]]) {
                                    var temp = _filter[_dimension[0]];
                                    if (temp.indexOf(d.data.key) < 0) {
                                        temp.push(d.data.key);
                                    }
                                    _filter[_dimension[0]] = temp;
                                } else {
                                    _filter[_dimension[0]] = [d.data.key];
                                }

                                _filter[_dimension[0]]._meta = {
                                    dataType: _dimensionType[0],
                                    valueType: "castValueType",
                                };
                            } else {
                                if (_filter[_dimension[1]]) {
                                    var temp = _filter[_dimension[1]];
                                    if (temp.indexOf(d.data.key) < 0) {
                                        temp.push(d.data.key);
                                    }
                                    _filter[_dimension[1]] = temp;
                                } else {
                                    _filter[_dimension[1]] = [d.data.key];
                                }
                                _filter[_dimension[1]]._meta = {
                                    dataType: _dimensionType[1],
                                    valueType: "castValueType",
                                };
                            }
                        } else {
                            if (_filter[_dimension[0]]) {
                                var temp = _filter[_dimension[0]];
                                if (temp.indexOf(d.data.key) < 0) {
                                    temp.push(d.data.key);
                                }
                                _filter[_dimension[0]] = temp;
                            } else {
                                _filter[_dimension[0]] = [d.data.key];
                            }
                            _filter[_dimension[0]]._meta = {
                                dataType: _dimensionType[0],
                                valueType: "castValueType",
                            };
                        }
                    }
                });

                if (broadcast) {
                    var _filterDimension = _filter;
                    broadcast.saveSelectedFilter(_filterDimension);
                }
            } else {
                filterData = [];
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

    var drawViz = function (element) {
        var rect = element
            .append("rect")
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("class", "treeRect")
            .attr("width", function (d) {
                return d.x1 - d.x0;
            })
            .attr("height", function (d) {
                return d.y1 - d.y0;
            })
            .attr("fill", function (d, i) {
                return getFillColor(d, i);
            })
            .attr("stroke", function (d, i) {
                return getFillColor(d, i);
            })
            .style("stroke-width", 1)
            .attr("id", function (d, i) {
                return "rect-" + i;
            });

        if (!_print) {
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
                    var filterList = {};
                    if (broadcast.filterSelection.id) {
                        filterList = broadcast.filterSelection.filter;
                    } else {
                        broadcast.filterSelection.id =
                            parentContainer.attr("id");
                    }
                    if (_dimension.length == 2) {
                        if (d.children) {
                            if (filterList[_dimension[0]]) {
                                var temp = filterList[_dimension[0]];
                                if (temp.indexOf(d.data.key) < 0) {
                                    temp.push(d.data.key);
                                } else {
                                    temp.splice(temp.indexOf(d.data.key), 1);
                                }
                                filterList[_dimension[0]] = temp;
                            } else {
                                filterList[_dimension[0]] = [d.data.key];
                            }
                            filterList[_dimension[0]]._meta = {
                                dataType: _dimensionType[0],
                                valueType: "castValueType",
                            };
                        } else {
                            if (filterList[_dimension[1]]) {
                                var temp = filterList[_dimension[1]];
                                if (temp.indexOf(d.data.key) < 0) {
                                    temp.push(d.data.key);
                                } else {
                                    temp.splice(temp.indexOf(d.data.key), 1);
                                }
                                filterList[_dimension[1]] = temp;
                            } else {
                                filterList[_dimension[1]] = [d.data.key];
                            }
                            filterList[_dimension[1]]._meta = {
                                dataType: _dimensionType[1],
                                valueType: "castValueType",
                            };
                        }
                    } else {
                        if (filterList[_dimension[0]]) {
                            var temp = filterList[_dimension[0]];
                            if (temp.indexOf(d.data.key) < 0) {
                                temp.push(d.data.key);
                            } else {
                                temp.splice(temp.indexOf(d.data.key), 1);
                            }
                            filterList[_dimension[0]] = temp;
                        } else {
                            filterList[_dimension[0]] = [d.data.key];
                        }
                        filterList[_dimension[0]]._meta = {
                            dataType: _dimensionType[0],
                            valueType: "castValueType",
                        };
                    }
                    var _filterDimension = _filter;
                    broadcast.saveSelectedFilter(_filterDimension);
                });
        }

        // rect.transition(t)
        //     .attr('width', function (d) {
        //         return d.x1 - d.x0;
        //     })
        //     .attr('height', function (d) {
        //         return d.y1 - d.y0;
        //     })
        //     .attr('fill', function (d, i) {
        //         return getFillColor(d, i)
        //     });

        function afterTransition() {
            element
                .filter(function (d, i) {
                    return d.parent;
                })
                .append("text")
                .attr("class", "information")
                .selectAll("tspan")
                .data(function (d, i) {
                    return getFilterLabels(d);
                })
                .enter()
                .append("tspan")
                .attr("x", function (d, i) {
                    return i ? null : 2;
                })
                .attr("y", "1em")
                .text(function (d, i) {
                    return i == 0 ? d.data + ": " : d.data;
                })
                .attr("fill", function (d, i) {
                    return getColorValue(d, i);
                })
                .style("font-style", function (d, i) {
                    return getFontStyleValue(d, i);
                })
                .style("font-weight", function (d, i) {
                    return getFontWeightValue(d, i);
                })
                .style("font-size", function (d, i) {
                    return getFontSizeValue(d, i);
                })
                .attr("visibility", function (d, i) {
                    var parentNode = d3.select(this).node().parentNode;
                    return getVisibilityValue(parentNode, d.node);
                });
        }
        // if (!_print) {
        //     var t = d3.transition()
        //         .duration(COMMON.DURATION)
        //         .ease(d3.easeQuadIn)
        //         .on('end', afterTransition);
        // }
        // else {
        afterTransition();
        // }
    };
    function chart(selection) {
        data = UTIL.sortingData(_data, _dimension[0]);

        if (_print && !_notification) {
            parentContainer = selection;
        } else {
            parentContainer = d3.select("#" + selection.id);
        }

        var svg = parentContainer
            .append("svg")
            .attr("width", parentContainer.attr("width") - 2 * COMMON.PADDING)
            .attr(
                "height",
                parentContainer.attr("height") - 2 * COMMON.PADDING
            );

        var width = +svg.attr("width"),
            height = +svg.attr("height");

        parentContainer.append("div").attr("class", "custom_tooltip");

        _local_svg = svg;

        /* store the data in local variable */
        _localData = _originalData = data;

        var me = this;

        svg.selectAll("g").remove();

        svg.attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + 0 + ", " + COMMON.PADDING + ")");

        if (_tooltip) {
            tooltip = parentContainer.select(".custom_tooltip");
        }

        treemap = d3
            .treemap()
            .size([width, height])
            .paddingOuter(function (node) {
                if (node.parent) {
                    return 5;
                }
                return 1;
            })
            .paddingTop(function (node) {
                if (node.parent) {
                    return 20;
                }
                return 0;
            })
            .paddingInner(10)
            .round(true);

        if (_dimension.length == 2) {
            nest = this._nest = d3
                .nest()
                .key(function (d) {
                    return d[_dimension[0]];
                })
                .key(function (d) {
                    return d[_dimension[1]];
                })
                .rollup(function (d) {
                    return d3.sum(d, function (d) {
                        return d[_measure[0]];
                    });
                });
        } else {
            nest = this._nest = d3
                .nest()
                .key(function (d) {
                    return d[_dimension[0]];
                })
                .rollup(function (d) {
                    return d3.sum(d, function (d) {
                        return d[_measure[0]];
                    });
                });
        }

        root = d3
            .hierarchy({ values: nest.entries(data) }, function (d) {
                return d.values;
            })
            .sum(function (d) {
                return d.value;
            })
            .sort(function (a, b) {
                return b.value - a.value;
            });

        _localTotal = root.value;

        treemap(root);

        var dim = _dimension.length;

        while (dim > 0) {
            setColorDomainRange(root.descendants(), dim);
            dim -= 1;
        }
        var plot = svg.append("g").attr("class", "plot");

        var cell = plot
            .selectAll(".node")
            .data(root.descendants())
            .enter()
            .append("g")
            .attr("transform", function (d) {
                return "translate(" + d.x0 + "," + d.y0 + ")";
            })
            .attr("class", "node")
            .each(function (d) {
                d.node = this;
            });

        drawViz(cell);

        if (!_print) {
            var _filter = UTIL.createFilterElement();
            //$(div).append(_filter);
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

    chart._getName = function () {
        return _NAME;
    };

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
    };

    chart.update = function (data) {
        data = UTIL.sortingData(data, _dimension[0]);
        _Local_data = data;
        filterData = [];

        if (_dimension.length == 2) {
            nest = this._nest = d3
                .nest()
                .key(function (d) {
                    return d[_dimension[0]];
                })
                .key(function (d) {
                    return d[_dimension[1]];
                })
                .rollup(function (d) {
                    return d3.sum(d, function (d) {
                        return d[_measure[0]];
                    });
                });
        } else {
            nest = this._nest = d3
                .nest()
                .key(function (d) {
                    return d[_dimension[0]];
                })
                .rollup(function (d) {
                    return d3.sum(d, function (d) {
                        return d[_measure[0]];
                    });
                });
        }

        root = d3
            .hierarchy({ values: nest.entries(data) }, function (d) {
                return d.values;
            })
            .sum(function (d) {
                return d.value;
            })
            .sort(function (a, b) {
                return b.value - a.value;
            });

        _localTotal = root.value;

        treemap(root);

        var dim = _dimension.length;

        while (dim > 0) {
            setColorDomainRange(root.descendants(), dim);
            dim -= 1;
        }
        var svg = _local_svg;
        treemap(root);
        var dim = _dimension.length;
        var plot = _local_svg.select(".plot");

        plot.selectAll(".information").remove();
        while (dim > 0) {
            setColorDomainRange(root.descendants(), dim);
            dim -= 1;
        }

        var cell = plot
            .selectAll(".node")
            .data(root.descendants())
            .each(function (d) {
                d.node = this;
            });

        var newCell = cell
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + d.x0 + "," + d.y0 + ")";
            });

        drawViz(newCell);

        cell.exit().remove();

        cell = plot.selectAll(".node");

        var rect = cell
            .select("rect")
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("width", function (d) {
                return d.x1 - d.x0;
            })
            .attr("height", function (d) {
                return d.y1 - d.y0;
            })
            .attr("fill", function (d, i) {
                return getFillColor(d, i);
            })
            .attr("stroke", function (d, i) {
                return getFillColor(d, i);
            })
            .style("stroke-width", 1)
            .classed("selected", false)
            .attr("id", function (d, i) {
                return "rect-" + i;
            });

        cell.filter(function (d, i) {
            return d.parent;
        })
            .append("text")
            .attr("class", "information")
            .selectAll("tspan")
            .data(function (d, i) {
                return getFilterLabels(d);
            })
            .enter()
            .append("tspan")
            .attr("x", function (d, i) {
                return i ? null : 2;
            })
            .attr("y", "1em")
            .text(function (d, i) {
                return i ? "- " + d.data : d.data;
            })
            .attr("fill", function (d, i) {
                return getColorValue(d, i);
            })
            .attr("visibility", function (d, i) {
                var parentNode = d3.select(this).node().parentNode;
                return getVisibilityValue(parentNode, d.node);
            })
            .style("font-style", function (d, i) {
                return getFontStyleValue(d, i);
            })
            .style("font-weight", function (d, i) {
                return getFontWeightValue(d, i);
            })
            .style("font-size", function (d, i) {
                return getFontSizeValue(d, i);
            });

        plot.selectAll(".node").attr("transform", function (d) {
            return "translate(" + d.x0 + "," + d.y0 + ")";
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

    chart.showLabel = function (value) {
        if (!arguments.length) {
            return showLabel;
        }
        showLabel = value;
        return chart;
    };
    chart.colorPattern = function (value) {
        if (!arguments.length) {
            return colorPattern;
        }
        colorPattern = value;
        return chart;
    };
    chart.showValues = function (value) {
        if (!arguments.length) {
            return showValues;
        }
        showValues = value;
        return chart;
    };
    chart.valueTextColour = function (value) {
        if (!arguments.length) {
            return valueTextColour;
        }
        valueTextColour = value;
        return chart;
    };
    chart.fontStyleForMes = function (value) {
        if (!arguments.length) {
            return fontStyleForMes;
        }
        valueTextColour = value;
        return chart;
    };
    chart.fontWeightForMes = function (value) {
        if (!arguments.length) {
            return fontWeightForMes;
        }
        fontWeightForMes = value;
        return chart;
    };
    chart.fontSizeForMes = function (value) {
        if (!arguments.length) {
            return fontSizeForMes;
        }
        fontSizeForMes = value;
        return chart;
    };
    chart.numberFormat = function (value) {
        if (!arguments.length) {
            return numberFormat;
        }
        numberFormat = value;
        return chart;
    };

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    };

    /**
     * ClusteredVerticalBar Measure Showvalue accessor function
     *
     * @param {boolean|array(boolean)|null} value Measure Showvalue value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {boolean|array(boolean)|function}
     */
    chart.showLabelForDimension = function (value, measure) {
        return UTIL.baseAccessor.call(
            showLabelForDimension,
            value,
            measure,
            _measure
        );
    };

    /**
     * ClusteredVerticalBar Measure Displayname accessor function
     *
     * @param {string|array(string)|null} value Measure Displayname value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.labelColorForDimension = function (value, measure) {
        return UTIL.baseAccessor.call(
            labelColorForDimension,
            value,
            measure,
            _measure
        );
    };

    /**
     * ClusteredVerticalBar Measure FontStyle accessor function
     *
     * @param {string|array(string)|null} value Measure FontStyle value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.displayColor = function (value, measure) {
        return UTIL.baseAccessor.call(displayColor, value, measure, _measure);
    };

    /**
     * ClusteredVerticalBar Measure FontWeight accessor function
     *
     * @param {number|array(number)|null} value Measure FontWeight value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {number|array(number)|function}
     */
    chart.fontStyleForDimension = function (value, measure) {
        return UTIL.baseAccessor.call(
            fontStyleForDimension,
            value,
            measure,
            _measure
        );
    };

    /**
     * ClusteredVerticalBar Measure FontSize accessor function
     *
     * @param {number|array(number)|null} value Measure FontSize value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {number|array(number)|function}
     */
    chart.fontWeightForDimension = function (value, measure) {
        return UTIL.baseAccessor.call(
            fontWeightForDimension,
            value,
            measure,
            _measure
        );
    };

    /**
     * ClusteredVerticalBar Measure NumberFormat accessor function
     *
     * @param {string|array(string)|null} value Measure NumberFormat value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.fontSizeForDimension = function (value, measure) {
        return UTIL.baseAccessor.call(
            fontSizeForDimension,
            value,
            measure,
            _measure
        );
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
    chart.colorSet = function (value) {
        if (!arguments.length) {
            return colorSet;
        }
        colorSet = value;
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

module.exports = treemap;
