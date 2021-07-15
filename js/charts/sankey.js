var d3 = require("d3");
var COMMON = require("../extras/common.js")();
var d3sankey = require("../../d3-libs/d3.sankey.js");
var UTIL = require("../extras/util.js")();
var $ = require("jquery");
try {
    var d3Lasso = require("../../d3-libs/d3-lasso.min.js");
} catch (ex) { }

function sankey() {
    var _NAME = "sankey";

    var _config,
        dimension = [],
        _dimensionType = [],
        measure = [],
        showLabels = [],
        fontStyle = [],
        fontWeight = [],
        fontSize = [],
        textColor = [],
        colorPattern,
        displayColor,
        borderColor,
        numberFormat,
        _sort,
        _tooltip,
        _print,
        broadcast,
        filterParameters,
        _notification = false,
        isLiveEnabled = false,
        _colorList = [],
        _data;

    var _local_svg,
        _Local_data,
        _originalData,
        _localLabelStack = [];

    var parentWidth, parentHeight, parentWidth, parentHeight, parentContainer;
    var sankey, path, gradientColor, link;
    var margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
    };

    var filter = false,
        filterData = [];

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.dimensionType(config.dimensionType);
        this.measure(config.measure);
        this.showLabels(config.showLabels);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        this.fontSize(config.fontSize);
        this.textColor(config.textColor);
        this.colorPattern(config.colorPattern);
        this.displayColor(config.displayColor);
        this.borderColor(config.borderColor);

        this.numberFormat(config.numberFormat);
        this.colorList(config.colorList);
        setDefaultColorForChart();
    };

    var setDefaultColorForChart = function () {
        if (displayColor[0] == null || displayColor[0] == undefined) {
            displayColor[0] = COMMON.COLORSCALE(0);
        }
        if (borderColor[0] == null || borderColor[0] == undefined) {
            borderColor[0] = COMMON.COLORSCALE(0);
        }
        if (_colorList.length == 0) {
            _colorList = UTIL.defaultColours();
        }
    };

    var _buildTooltipData = function (datum, chart, element) {
        var output = "";
        if (element == "link") {
            output +=
                "<table><tr>" +
                "<th>" +
                datum.source.nodeType +
                ": </th>" +
                "<td>" +
                UTIL.getDimensionFormatedValue(
                    datum.source.name,
                    _dimensionType[0]
                ) +
                "</td>" +
                "</tr><tr>" +
                "<th>" +
                UTIL.getDimensionFormatedValue(
                    datum.target.nodeType,
                    _dimensionType[0]
                ) +
                ": </th>" +
                "<td>" +
                datum.target.name +
                "</td>" +
                "</tr><tr>" +
                "<th>" +
                measure[0] +
                ": </th>" +
                "<td>" +
                Math.round(datum.value * 100) / 100 +
                "</td>" +
                "</tr>" +
                "</table>";
        } else {
            output += "<table><tr>";
            if (datum.nodeType == dimension[0]) {
                output +=
                    "<th>" +
                    datum.nodeType +
                    ": </th>" +
                    "<td>" +
                    datum.name +
                    "</td>" +
                    "</tr>";
                for (var index = 0; index < datum.sourceLinks.length; index++) {
                    output +=
                        "<tr><th>" +
                        datum.sourceLinks[index].target.name +
                        ": </th>" +
                        "<td>" +
                        datum.sourceLinks[index].target.value +
                        "</td>" +
                        "</tr>";
                }
                output += "</table>";
            } else {
                output +=
                    "<th>" +
                    dimension[1] +
                    ": </th>" +
                    "<td>" +
                    datum.name +
                    "</td>" +
                    "</tr><tr>" +
                    "<th>" +
                    measure[0] +
                    ": </th>" +
                    "<td>" +
                    datum.value +
                    "</td>" +
                    "</tr>" +
                    "</table>";
            }
        }
        return output;
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

            lasso.notSelectedItems();

            var confirm = d3
                .select(scope.node().parentNode)
                .select("div.confirm")
                .style("visibility", "visible");

            var _filter = [];
            var _filterList = {};
            if (data.length > 0) {
                data.forEach(function (d) {
                    if (_filterList[d.nodeType]) {
                        var temp = _filterList[d.nodeType];
                        if (temp.indexOf(d.name) < 0) {
                            temp.push(d.name);
                        }
                        _filterList[d.nodeType] = temp;
                    } else {
                        _filterList[d.nodeType] = [d.name];
                    }
                    _filterList[d.nodeType]._meta = {
                        dataType: _dimensionType[dimension.indexOf(d.nodeType)],
                        valueType: "castValueType",
                    };
                });
            } else {
                filterData = [];
            }
            if (_filter.length > 0) {
                filterData = _filterList;
            }

            if (broadcast) {
                var _filterDimension = _filterList;
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

    var _handleMouseOverFn = function (tooltip, container, element) {
        var me = this;
        return function (d, i) {
            d3.select(this).style("cursor", "pointer");
            var border = d3.select(this).style("stroke");
            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(
                    tooltip,
                    _buildTooltipData(d, me, element),
                    container,
                    border
                );
            }
        };
    };

    var _handleMouseMoveFn = function (tooltip, container, element) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                var border = d3.select(this).style("stroke");
                UTIL.updateTooltip.call(
                    tooltip,
                    _buildTooltipData(d, me, element),
                    container,
                    border
                );
            }
        };
    };

    var _handleMouseOutFn = function (tooltip, container, element) {
        var me = this;

        return function (d, i) {
            d3.select(this).style("cursor", "default");

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        };
    };
    var getUniqueItems = function (array) {
        var filteredArray = array.filter(function (item, pos) {
            return array.indexOf(item) == pos;
        });

        return filteredArray;
    };
    var getSankeyData = function (data) {
        var me = this;

        var nodes = [],
            links = [],
            nodeOffsets = [];

        dimension.forEach(function (_dimension, index) {
            var allDimensions = data.map(function (d, i) {
                return d[_dimension];
            });

            nodeOffsets.push(nodes.length);

            var sourceUniqueDimensions = [];
            sourceUniqueDimensions = getUniqueItems(allDimensions);
            sourceUniqueDimensions.forEach(function (d, i) {
                var counter = nodeOffsets[index];
                nodes.push({
                    node: counter++,
                    name: d == null ? "null" : d,
                    nodeType: _dimension,
                });
            });

            var targetUniqueDimensions = getUniqueItems(
                data.map(function (d, i) {
                    return d[dimension[index + 1]];
                })
            );

            if (index != dimension.length - 1) {
                data.forEach(function (d, i) {
                    var link = {};
                    link.source =
                        nodeOffsets[index] +
                        sourceUniqueDimensions.indexOf(d[_dimension]);
                    link.target =
                        nodes.length +
                        targetUniqueDimensions.indexOf(d[dimension[index + 1]]);
                    link.value =
                        isNaN(d[measure]) || d[measure] === null
                            ? 0
                            : d[measure];
                    link.index = sourceUniqueDimensions.indexOf(d[_dimension]);
                    links.push(link);
                });
            }
        });

        return { nodes: nodes, links: links };
    };
    var getFillColor = function (d, i) {
        if (colorPattern == "single_color") {
            return displayColor;
        } else if (colorPattern == "unique_color") {
            return _colorList[i] != undefined
                ? _colorList[i]
                : UTIL.getUniqueColour(i);
        } else if (colorPattern == "gradient_color") {
            return gradientColor(d.value);
        }
    };

    var drag = d3
        .drag()
        .subject(function (d) {
            return d;
        })
        .on("start", function () {
            startTime = new Date().getTime();
            this.parentNode.appendChild(this);
        })
        .on("drag", function (d) {
            d3.select(this).attr(
                "transform",
                "translate(" +
                d.x +
                ", " +
                (d.y = Math.max(
                    0,
                    Math.min(parentHeight - d.dy, d3.event.y)
                )) +
                ")"
            );
            sankey.relayout();
            link.attr("d", path);
        });

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

        parentContainer.append("div").attr("class", "custom_tooltip");

        _local_svg = svg;

        if (_tooltip) {
            tooltip = parentContainer.select(".custom_tooltip");
        }
        var me = this;
        svg.selectAll("g").remove();

        svg.attr("width", width).attr("height", height).attr("class", "sankey");

        var data = getSankeyData(_data);

        parentWidth = width - margin.left - margin.right;
        parentHeight = height - margin.top - margin.bottom;

        var container = svg
            .append("g")
            .attr("class", "plot")
            .attr(
                "transform",
                "translate(" + margin.left + "," + margin.top + ")"
            );

        sankey = d3sankey()
            .nodeWidth(12)
            .nodePadding(4)
            .size([parentWidth, parentHeight]);

        path = sankey.link();

        sankey.nodes(data.nodes).links(data.links).layout(32);

        gradientColor = d3.scaleLinear();

        gradientColor.range([
            d3.rgb(displayColor).brighter(),
            d3.rgb(displayColor).darker(),
        ]);

        gradientColor.domain(
            d3.extent(data.nodes, function (d) {
                return d.value;
            })
        );

        var nodeDistance =
            data.nodes[0].sourceLinks[0].target.x -
            data.nodes[0].x -
            sankey.nodeWidth();

        var node = container
            .append("g")
            .selectAll(".node")
            .data(data.nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        //.call(drag);

        var rect = node
            .append("rect")
            .attr("width", sankey.nodeWidth())
            .attr("height", function (d) {
                return d.dy;
            })
            .attr("class", function (d) {
                return d.name.replace(/ /g, "_");
            })
            .style("cursor", "move")
            .style("fill", function (d, i) {
                return getFillColor(d, i);
            })
            .style("stroke", function (d, i) {
                return getFillColor(d, i);
            });

        node.append("text")
            .attr("x", -6)
            .attr("y", function (d) {
                return d.dy / 2;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .style("pointer-events", "none")
            .text(function (d) {
                if (d.dy > 4) {
                    return UTIL.getDimensionFormatedValue(
                        d.name,
                        dimension.indexOf(d.nodeType)
                    );
                }
                return "";
            })
            .text(function (d) {
                if (!_print) {
                    if (d.dy > 4) {
                        if (
                            dimension.indexOf(d.nodeType) >=
                            dimension.length - 2
                        ) {
                            return UTIL.getTruncatedLabel(
                                this,
                                UTIL.getDimensionFormatedValue(
                                    d.name,
                                    dimension.indexOf(d.nodeType)
                                ),
                                nodeDistance / 2,
                                3
                            );
                        }
                        return UTIL.getTruncatedLabel(
                            this,
                            UTIL.getDimensionFormatedValue(
                                d.name,
                                dimension.indexOf(d.nodeType)
                            ),
                            nodeDistance,
                            3
                        );
                    }
                    return "";
                } else {
                    if (d.dy > 4) {
                        return d.name;
                    }
                    return "";
                }
            })
            .style("visibility", function (d, i) {
                return showLabels[dimension.indexOf(d.nodeType)];
            })
            .style("visibility", function (d, i) {
                var nodeHeight = d3
                    .select(this.parentElement)
                    .select("rect")
                    .attr("height");
                if (
                    parseFloat(fontSize[dimension.indexOf(d.nodeType)]) >
                    parseFloat(nodeHeight)
                ) {
                    return "hidden";
                }
            })
            .style("font-style", function (d, i) {
                return fontStyle[dimension.indexOf(d.nodeType)];
            })
            .style("font-weight", function (d, i) {
                return fontWeight[dimension.indexOf(d.nodeType)];
            })
            .style("font-size", function (d, i) {
                return fontSize[dimension.indexOf(d.nodeType)];
            })
            .style("fill", function (d, i) {
                return textColor[dimension.indexOf(d.nodeType)];
            })
            .filter(function (d) {
                return d.x < parentWidth / 2;
            })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

        link = container
            .append("g")
            .selectAll(".link")
            .data(data.links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", path)
            .style("stroke", function (d, i) {
                if (colorPattern == "single_color") {
                    return _colorList[0];
                } else if (colorPattern == "unique_color") {
                    return _colorList[d.index] != undefined
                        ? _colorList[d.index]
                        : UTIL.getUniqueColour(d.index);
                } else if (colorPattern == "gradient_color") {
                    if (_print) {
                        return _colorList[0];
                    }
                    return d3
                        .select("." + d.source.name.replace(/ /g, "_"))
                        .style("fill");
                }
            })
            .style("stroke-opacity", "0.5")
            .style("fill", "none")
            .style("stroke-width", function (d) {
                return Math.max(1, d.dy);
            })
            .sort(function (a, b) {
                return b.dy - a.dy;
            });

        if (!_print) {
            var _filter = UTIL.createFilterElement();
            $("#" + parentContainer.attr("id")).append(_filter);

            link.on(
                "mouseover",
                _handleMouseOverFn.call(chart, tooltip, _local_svg, "link")
            )
                .on(
                    "mousemove",
                    _handleMouseMoveFn.call(chart, tooltip, _local_svg, "link")
                )
                .on(
                    "mouseout",
                    _handleMouseOutFn.call(chart, tooltip, _local_svg, "link")
                )
                .on("click", function (d) {
                    filter = false;
                    var confirm = parentContainer
                        .select(".confirm")
                        .style("visibility", "visible");

                    if (d.nodeType == dimension[0]) {
                        _Local_data.map(function (val) {
                            if (
                                dimension[0] == d.nodeType &&
                                val[dimension[0]] == d.name
                            ) {
                                var searchObj = _filter.find(
                                    (o) =>
                                        o[dimension[0]] == val[dimension[0]] &&
                                        o[dimension[1]] == val[dimension[1]]
                                );
                                if (!searchObj) {
                                    _filter.push(val);
                                }
                            }
                        });
                    } else {
                        _Local_data.map(function (val) {
                            if (
                                dimension[1] == d.nodeType &&
                                val[dimension[1]] == d.name
                            ) {
                                var searchObj = _filter.find(
                                    (o) =>
                                        o[dimension[0]] == val[dimension[0]] &&
                                        o[dimension[1]] == val[dimension[1]]
                                );
                                if (!searchObj) {
                                    _filter.push(val);
                                }
                            }
                        });
                    }

                    var _filter = _Local_data.filter(function (d1) {
                        return d.data[_dimension[0]] === d1[_dimension[0]];
                    });
                    var rect = d3.select(this);
                    if (rect.classed("selected")) {
                        rect.classed("selected", false);
                        filterData.map(function (val, i) {
                            if (val[_dimension[0]] == d.data[_dimension[0]]) {
                                filterData.splice(i, 1);
                            }
                        });
                    } else {
                        rect.classed("selected", true);
                        var isExist = filterData.filter(function (val) {
                            if (val[_dimension[0]] == d.data[_dimension[0]]) {
                                return val;
                            }
                        });
                        if (isExist.length == 0) {
                            filterData.push(_filter[0]);
                        }
                    }

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
                        dataType: _dimensionType[dimension.indexOf(dimension)],
                        valueType: "castValueType",
                    };

                    broadcast.saveSelectedFilter(_filterDimension);
                });

            node.select("rect")
                .on(
                    "mouseover",
                    _handleMouseOverFn.call(chart, tooltip, _local_svg, "node")
                )
                .on(
                    "mousemove",
                    _handleMouseMoveFn.call(chart, tooltip, _local_svg, "node")
                )
                .on(
                    "mouseout",
                    _handleMouseOutFn.call(chart, tooltip, _local_svg, "node")
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

                    var _filterDimension = broadcast.selectedFilters || {};

                    var _dimension = d.nodeType;
                    if (_filterDimension[_dimension]) {
                        var temp = _filterDimension[_dimension];
                        if (temp.indexOf() < 0) {
                            temp.push(d.name);
                        } else {
                            temp.splice(temp.indexOf(d.name, 1));
                        }
                        _filterDimension[_dimension] = temp;
                    } else {
                        _filterDimension[_dimension] = [d.name];
                    }

                    _filterDimension[_dimension]._meta = {
                        dataType: _dimensionType[dimension.indexOf(d.nodeType)],
                        valueType: "castValueType",
                    };
                    broadcast.saveSelectedFilter(_filterDimension);
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
                .items(node.select("rect"))
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
        data = getSankeyData(data);
        filterData = [];
        var plot = _local_svg.select(".plot");
        path = sankey.link();
        sankey.nodes(data.nodes).links(data.links).layout(32);

        gradientColor.domain(
            d3.extent(data.nodes, function (d) {
                return d.value;
            })
        );
        if (_tooltip) {
            tooltip = parentContainer.select(".custom_tooltip");
        }
        var nodeDistance =
            data.nodes[0].sourceLinks[0].target.x -
            data.nodes[0].x -
            sankey.nodeWidth();

        var node = plot.selectAll(".node").data(data.nodes);

        node.exit().remove();
        var newNode = node
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        node.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

        node.select("rect")
            .attr("width", sankey.nodeWidth())
            .attr("height", function (d) {
                return d.dy;
            })
            .attr("class", function (d) {
                return d.name.replace(/ /g, "_");
            })
            .style("cursor", "move")
            .style("fill", function (d, i) {
                return getFillColor(d, i);
            })
            .style("stroke", function (d, i) {
                return getFillColor(d, i);
            })
            .classed("selected", false)
            .on(
                "mouseover",
                _handleMouseOverFn.call(chart, tooltip, _local_svg, "node")
            )
            .on(
                "mousemove",
                _handleMouseMoveFn.call(chart, tooltip, _local_svg, "node")
            )
            .on(
                "mouseout",
                _handleMouseOutFn.call(chart, tooltip, _local_svg, "node")
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
                    if (d.nodeType == dimension[0]) {
                        _Local_data.map(function (val) {
                            filterData = filterData.filter(function (val) {
                                if (d.name != val[dimension[0]]) {
                                    return val;
                                }
                            });
                        });
                    } else {
                        _Local_data.map(function (val) {
                            filterData = filterData.filter(function (val) {
                                if (d.name != val[dimension[1]]) {
                                    return val;
                                }
                            });
                        });
                    }
                } else {
                    rect.classed("selected", true);
                    if (d.nodeType == dimension[0]) {
                        _Local_data.map(function (val) {
                            if (
                                dimension[0] == d.nodeType &&
                                val[dimension[0]] == d.name
                            ) {
                                var searchObj = filterData.find(
                                    (o) =>
                                        o[dimension[0]] == val[dimension[0]] &&
                                        o[dimension[1]] == val[dimension[1]]
                                );
                                if (!searchObj) {
                                    filterData.push(val);
                                }
                            }
                        });
                    } else {
                        _Local_data.map(function (val) {
                            if (
                                dimension[1] == d.nodeType &&
                                val[dimension[1]] == d.name
                            ) {
                                var searchObj = filterData.find(
                                    (o) =>
                                        o[dimension[0]] == val[dimension[0]] &&
                                        o[dimension[1]] == val[dimension[1]]
                                );
                                if (!searchObj) {
                                    filterData.push(val);
                                }
                            }
                        });
                    }
                }
            });

        node.select("text")
            .attr("x", -6)
            .attr("y", function (d) {
                return d.dy / 2;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .text(function (d) {
                if (d.dy > 4) {
                    return UTIL.getDimensionFormatedValue(
                        d.name,
                        dimension.indexOf(d.nodeType)
                    );
                }
                return "";
            })
            .text(function (d) {
                if (d.dy > 4) {
                    if (dimension.indexOf(d.nodeType) >= dimension.length - 2) {
                        return UTIL.getTruncatedLabel(
                            this,
                            UTIL.getDimensionFormatedValue(
                                d.name,
                                dimension.indexOf(d.nodeType)
                            ),
                            nodeDistance / 2,
                            3
                        );
                    }
                    return UTIL.getTruncatedLabel(
                        this,
                        UTIL.getDimensionFormatedValue(
                            d.name,
                            dimension.indexOf(d.nodeType)
                        ),
                        nodeDistance,
                        3
                    );
                }
                return "";
            })
            .style("visibility", function (d, i) {
                return showLabels[dimension.indexOf(d.nodeType)];
            })
            .style("visibility", function (d, i) {
                var nodeHeight = d3
                    .select(this.parentElement)
                    .select("rect")
                    .attr("height");
                if (
                    parseFloat(fontSize[dimension.indexOf(d.nodeType)]) >
                    parseFloat(nodeHeight)
                ) {
                    return "hidden";
                }
            })
            .style("font-style", function (d, i) {
                return fontStyle[dimension.indexOf(d.nodeType)];
            })
            .style("font-weight", function (d, i) {
                return fontWeight[dimension.indexOf(d.nodeType)];
            })
            .style("font-size", function (d, i) {
                return fontSize[dimension.indexOf(d.nodeType)];
            })
            .style("fill", function (d, i) {
                return textColor[dimension.indexOf(d.nodeType)];
            })
            .filter(function (d) {
                return d.x < parentWidth / 2;
            })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

        newNode
            .append("rect")
            .attr("width", sankey.nodeWidth())
            .attr("height", function (d) {
                return d.dy;
            })
            .attr("class", function (d) {
                return d.name;
            })
            .style("cursor", "move")
            .style("fill", function (d, i) {
                return getFillColor(d, i);
            })
            .style("stroke", function (d, i) {
                return getFillColor(d, i);
            })
            .classed("selected", false);

        newNode
            .append("text")
            .attr("x", -6)
            .attr("y", function (d) {
                return d.dy / 2;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .style("pointer-events", "none")
            .text(function (d) {
                if (d.dy > 4) {
                    return d.name;
                }
                return "";
            })
            .text(function (d) {
                if (d.dy > 4) {
                    if (dimension.indexOf(d.nodeType) >= dimension.length - 2) {
                        return UTIL.getTruncatedLabel(
                            this,
                            UTIL.getDimensionFormatedValue(
                                d.name,
                                dimension.indexOf(d.nodeType)
                            ),
                            nodeDistance / 2,
                            3
                        );
                    }
                    return UTIL.getTruncatedLabel(
                        this,
                        UTIL.getDimensionFormatedValue(
                            d.name,
                            dimension.indexOf(d.nodeType)
                        ),
                        nodeDistance,
                        3
                    );
                }
                return "";
            })
            .style("visibility", function (d, i) {
                return showLabels[dimension.indexOf(d.nodeType)];
            })
            .style("visibility", function (d, i) {
                var nodeHeight = d3
                    .select(this.parentElement)
                    .select("rect")
                    .attr("height");
                if (
                    parseFloat(fontSize[dimension.indexOf(d.nodeType)]) >
                    parseFloat(nodeHeight)
                ) {
                    return "hidden";
                }
            })
            .style("font-style", function (d, i) {
                return fontStyle[dimension.indexOf(d.nodeType)];
            })
            .style("font-weight", function (d, i) {
                return fontWeight[dimension.indexOf(d.nodeType)];
            })
            .style("font-size", function (d, i) {
                return fontSize[dimension.indexOf(d.nodeType)];
            })
            .style("fill", function (d, i) {
                return textColor[dimension.indexOf(d.nodeType)];
            })
            .filter(function (d) {
                return d.x < parentWidth / 2;
            })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

        var link = plot.selectAll(".link").data(data.links);

        link.exit().remove();
        newLink = link
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", path)
            .style("stroke", function (d, i) {
                if (colorPattern == "single_color") {
                    return _colorList[0];
                } else if (colorPattern == "unique_color") {
                    return _colorList[d.index] != undefined
                        ? _colorList[d.index]
                        : UTIL.getUniqueColour(d.index);
                } else if (colorPattern == "gradient_color") {
                    if (_print) {
                        return _colorList[0];
                    }
                    return d3
                        .select("." + d.source.name.replace(/ /g, "_"))
                        .style("fill");
                }
            })
            .style("stroke-width", function (d) {
                return Math.max(1, d.dy);
            })
            .sort(function (a, b) {
                return b.dy - a.dy;
            })
            .on(
                "mouseover",
                _handleMouseOverFn.call(chart, tooltip, _local_svg, "link")
            )
            .on(
                "mousemove",
                _handleMouseMoveFn.call(chart, tooltip, _local_svg, "link")
            )
            .on(
                "mouseout",
                _handleMouseOutFn.call(chart, tooltip, _local_svg, "link")
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

                if (d.nodeType == dimension[0]) {
                    _Local_data.map(function (val) {
                        if (
                            dimension[0] == d.nodeType &&
                            val[dimension[0]] == d.name
                        ) {
                            var searchObj = _filter.find(
                                (o) =>
                                    o[dimension[0]] == val[dimension[0]] &&
                                    o[dimension[1]] == val[dimension[1]]
                            );
                            if (!searchObj) {
                                _filter.push(val);
                            }
                        }
                    });
                } else {
                    _Local_data.map(function (val) {
                        if (
                            dimension[1] == d.nodeType &&
                            val[dimension[1]] == d.name
                        ) {
                            var searchObj = _filter.find(
                                (o) =>
                                    o[dimension[0]] == val[dimension[0]] &&
                                    o[dimension[1]] == val[dimension[1]]
                            );
                            if (!searchObj) {
                                _filter.push(val);
                            }
                        }
                    });
                }
            });

        link.attr("d", path)
            .style("stroke", function (d, i) {
                if (colorPattern == "single_color") {
                    return _colorList[0];
                } else if (colorPattern == "unique_color") {
                    return _colorList[d.index] != undefined
                        ? _colorList[d.index]
                        : UTIL.getUniqueColour(d.index);
                } else if (colorPattern == "gradient_color") {
                    if (_print) {
                        return _colorList[0];
                    }
                    return d3
                        .select("." + d.source.name.replace(/ /g, "_"))
                        .style("fill");
                }
            })
            .style("stroke-width", function (d) {
                return Math.max(1, d.dy);
            })
            .sort(function (a, b) {
                return b.dy - a.dy;
            });

        _local_svg.select("g.lasso").remove();

        var lasso = d3Lasso
            .lasso()
            .hoverSelect(true)
            .closePathSelect(true)
            .closePathDistance(100)
            .items(node.select("rect"))
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
            return dimension;
        }
        dimension = value;
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
            return measure;
        }
        measure = value;
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

    chart.borderColor = function (value) {
        if (!arguments.length) {
            return borderColor;
        }
        borderColor = value;
        return chart;
    };

    chart.numberFormat = function (value) {
        if (!arguments.length) {
            return numberFormat;
        }
        numberFormat = value;
        return chart;
    };

    chart.colorList = function (value) {
        if (!arguments.length) {
            return _colorList;
        }
        _colorList = value;
        return chart;
    };

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    };

    chart.showLabels = function (value, measure) {
        return UTIL.baseAccessor.call(showLabels, value, measure, measure);
    };

    chart.fontStyle = function (value, measure) {
        return UTIL.baseAccessor.call(fontStyle, value, measure, measure);
    };

    chart.fontWeight = function (value, measure) {
        return UTIL.baseAccessor.call(fontWeight, value, measure, measure);
    };

    chart.fontSize = function (value, measure) {
        return UTIL.baseAccessor.call(fontSize, value, measure, measure);
    };

    chart.textColor = function (value, measure) {
        return UTIL.baseAccessor.call(textColor, value, measure, measure);
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

module.exports = sankey;
