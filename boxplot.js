
function boxplot() {

    var _NAME = 'boxplot';

    var _config,
        _dimension,
        _measure,
        _sort,
        _tooltip,
        showXaxis,
        showYaxis,
        axisColor,
        showLabels,
        labelColor,
        numberFormat = []
    displayColor = [];

    var _local_svg,
        _Local_data;

    var x, y;
    var margin = {
        top: 15,
        right: 15,
        bottom: 35,
        left: 35
    };
    var _local_svg, _Local_data, _originalData, _localLabelStack = [], legendBreakCount = 1;
    var div;
    var gWidth, gHeight, container;

    var filter = false, filterData = [];
    var threshold = [];

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.showXaxis(config.showXaxis);
        this.showYaxis(config.showYaxis);
        this.axisColor(config.axisColor);
        this.showLabels(config.showLabels);
        this.labelColor(config.labelColor);
        this.numberFormat(config.numberFormat);
        this.displayColor(config.displayColor);

    }

    var _buildTooltipData = function (datum, chart) {
        var output = "";
        output += "<table><tr>"
            + "<th>" + chart.dimension() + ": </th>"
            + "<td>" + datum.data[chart.dimension()] + "</td>"
            + "</tr><tr>"
            + "<th>" + datum.key + ": </th>"
            + "<td>" + datum.data[datum.key] + "</td>"
            + "</tr></table>";

        return output;
    }

    var onLassoStart = function (lasso, chart) {
        return function () {
            if (filter) {
                lasso.items().selectAll('rect')
                    .classed('not_possible', true)
                    .classed('selected', false);
            }
        }
    }

    var onLassoDraw = function (lasso, chart) {
        return function () {
            filter = true;
            lasso.items().selectAll('rect')
                .classed('selected', false);

            lasso.possibleItems().selectAll('rect').each(function (d, i) {
                var item = d3.select(this).node().className.baseVal.split(' ')[0];
                d3.selectAll('rect.' + item)
                    .classed('not_possible', false)
                    .classed('possible', true);

            });
            lasso.possibleItems().selectAll('rect')
                .classed('not_possible', false)
                .classed('possible', true);

            lasso.notPossibleItems().selectAll('rect')
                .classed('not_possible', true)
                .classed('possible', false);
        }
    }

    var onLassoEnd = function (lasso, chart) {
        return function () {
            var data = lasso.selectedItems().data();
            if (!filter) {
                return;
            }
            if (data.length > 0) {
                lasso.items().selectAll('rect')
                    .classed('not_possible', false)
                    .classed('possible', false);
            }

            lasso.selectedItems().selectAll('rect')
                .classed('selected', true)

            lasso.notSelectedItems().selectAll('rect');

            var confirm = d3.select('.confirm')
                .style('visibility', 'visible');

            var _filter = [];
            var keys = UTIL.getMeasureList(data[0].data, _dimension);
            data.forEach(function (d) {
                var obj = new Object();
                var temp = d.data[_dimension[0]];
                var searchObj = _filter.find(o => o[_dimension[0]] === temp);
                if (searchObj == undefined) {
                    obj[_dimension[0]] = d.data[_dimension[0]];
                    for (var index = 0; index < keys.length; index++) {
                        obj[keys[index]] = d.data[keys[index]];
                    }
                    _filter.push(obj)
                }
            });
            if (_filter.length > 0) {
                filterData = _filter;
            }
        }
    }

    var applyFilter = function (chart) {
        return function () {
            if (filterData.length > 0) {
                chart.update(filterData);
            }
        }
    }

    var clearFilter = function () {
        return function () {
            chart.update(_originalData);
        }
    }

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'pointer')
                .style('cursor', 'pointer')
                .style('fill', COMMON.HIGHLIGHTER);
            var border = UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor)
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
                var border = UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor)
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me, border), container, border);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'default')
                .style('fill', function (d1, i) {
                    return UTIL.getDisplayColor(_measure.indexOf(d1.key), _displayColor);
                })
                .style('stroke', function (d1, i) {
                    return UTIL.getBorderColor(_measure.indexOf(d1.key), _borderColor);
                });

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }
    var getXLabels = function (data) {
        return data.map(function (d) { return d[_dimension[0]]; })
    }

    var getGlobalMinMax = function (data) {
        var me = this;

        var allValues = [],
            min,
            max;

        data.forEach(function (d) {
            _measure.forEach(function (m) {
                allValues.push(d[m] || 0);
            })
        });

        min = Math.min.apply(Math, allValues);
        max = Math.max.apply(Math, allValues);

        min = min > 0 ? 0 : min

        return [min, max];
    }

    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {
            _originalData = data;
            div = d3.select(this).node().parentNode;

            var svg = _local_svg = d3.select(this);

            var width = div.clientWidth,
                height = div.clientHeight;

            svg.attr("width", width).
                attr("height", height);

            var globalMin, globalMax, xLabels;

            var minMax = getGlobalMinMax(data);
            globalMin = minMax[0];
            globalMax = minMax[1];

            xLabels = getXLabels(data);

            gWidth = width - margin.left - margin.right,
                gHeight = height - margin.top - margin.bottom;

            var barWidth = Math.floor(gWidth / data.length / 2);

            x = d3
                .scalePoint()
                .domain(xLabels)
                .rangeRound([0, gWidth])
                .padding([0.5]);

            y = d3
                .scaleLinear()
                .domain([globalMin, globalMax])
                .range([gHeight, 0]);

            var plot = svg
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            d3.selectAll('text.tick')
                .attr("transform", "rotate(-20)");

            var boxPlot = plot
                .append("g")
                .attr("transform", "translate(0,0)");

            var verticalLines = boxPlot
                .selectAll(".verticalLines")
                .data(data)
                .enter()
                .append("line")
                .attr('class', 'verticalLines')
                .attr("stroke", "#000")
                .attr("stroke-width", 1)
                .style("stroke-dasharray", 3)
                .attr("fill", "none");

            var box = boxPlot
                .selectAll(".box")
                .data(data)
                .enter()
                .append("g")
                .attr('class', 'box')
                .attr("id", function (d, i) {
                    return "box" + i;
                })

            var lowerBox = box
                .append("rect")
                .attr("width", barWidth)
                .attr("x", function (d) {
                    return (
                        x(d[_dimension[0]]) -
                        barWidth / 2
                    );
                })
                .attr("y", function (d) {
                    return y(d[_measure[2]]);
                })
                .attr("fill", displayColor[1])
                .attr("stroke", function (d) {
                    return d3
                        .rgb(displayColor[1])
                        .darker();
                })
                .attr("stroke-width", 1)
                .attr("height", 0)
                .transition()
                .duration(800)
                .ease(d3.easeQuadIn)
                .attr("height", function (d) {
                    return y(d[_measure[1]]) - y(d[_measure[2]]);
                });

            var upperBox = box
                .append("rect")
                .attr("width", barWidth)
                .attr("x", function (d) {
                    return (
                        x(d[_dimension[0]]) -
                        barWidth / 2
                    );
                })
                .attr("fill", displayColor[3])
                .attr("stroke", function (d) {
                    return d3
                        .rgb(displayColor[3])
                        .darker();
                })
                .attr("stroke-width", 1)
                .attr("y", function (d) {
                    return y(d[_measure[2]]);
                })
                .attr("height", 0)
                .transition()
                .duration(800)
                .ease(d3.easeQuadIn)
                .attr("height", function (d) {
                    var height =
                        y(d[_measure[2]]) -
                        y(d[_measure[3]]);
                    return height;
                })
                .attr("y", function (d) {
                    return y(d[_measure[3]]);
                })
                .on("end", afterTransition);

            var horizontalLineConfigs = [
                {
                    label: _measure[4],
                    x1: function (d) {
                        return (
                            x(d[_dimension[0]]) -
                            barWidth / 2
                        );
                    },
                    y1: function (d) {
                        return y(d[_measure[4]]);
                    },
                    x2: function (d) {
                        return (
                            x(d[_dimension[0]]) +
                            barWidth / 2
                        );
                    },
                    y2: function (d) {
                        return y(d[_measure[4]]);
                    }
                },
                {
                    label: _measure[2],
                    x1: function (d) {
                        return (
                            x(d[_dimension[0]]) -
                            barWidth / 2
                        );
                    },
                    y1: function (d) {
                        return y(d[_measure[2]]);
                    },
                    x2: function (d) {
                        return (
                            x(d[_dimension[0]]) +
                            barWidth / 2
                        );
                    },
                    y2: function (d) {
                        return y(d[_measure[2]]);
                    }
                },
                {
                    label: _measure[0],
                    x1: function (d) {
                        return (
                            x(d[_dimension[0]]) -
                            barWidth / 2
                        );
                    },
                    y1: function (d) {
                        return y(d[_measure[0]]);
                    },
                    x2: function (d) {
                        return (
                            x(d[_dimension[0]]) +
                            barWidth / 2
                        );
                    },
                    y2: function (d) {
                        return y(d[_measure[0]]);
                    }
                }
            ];

            function afterTransition() {
                verticalLines
                    .attr("x1", function (d) {
                        return x(d[_dimension[0]]);
                    })
                    .attr("y1", function (d) {
                        return y(d[_measure[0]]);
                    })
                    .attr("x2", function (d) {
                        return x(d[_dimension[0]]);
                    })
                    .attr("y2", function (d) {
                        return y(d[_measure[4]]);
                    });

                horizontalLineConfigs.forEach(function (config) {
                    plot
                        .selectAll(".horizontalLines")
                        .data(data)
                        .enter()
                        .append("line")
                        .attr('class', 'horizontalLines')
                        .attr("x1", config.x1)
                        .attr("y1", config.y1)
                        .attr("x2", config.x2)
                        .attr("y2", config.y2)
                        .attr("stroke", function (d) {
                            return displayColor[_measure.indexOf(config.label)];
                        })
                        .attr("stroke-width", 2)
                        .attr("fill", "none");
                });
            }

            plot.append("g")
                .attr("class", "x_axis")
                .attr("transform", "translate(0," + gHeight + ")")
                .call(d3.axisBottom(x))

            plot.append("g")
                .attr("class", "y_axis")
                .call(d3.axisLeft(y).ticks(null, "s"))

            UTIL.setAxisColor(_local_svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis, _showYaxis, _showXaxis);

        });
    }

    chart._getName = function () {
        return _NAME;
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

    chart.measure = function (value) {
        if (!arguments.length) {
            return _measure;
        }
        _measure = value;
        return chart;
    }

    chart.showXaxis = function (value) {
        if (!arguments.length) {
            return showXaxis;
        }
        showXaxis = value;
        return chart;
    }
    chart.showYaxis = function (value) {
        if (!arguments.length) {
            return showYaxis;
        }
        showYaxis = value;
        return chart;
    }
    chart.axisColor = function (value) {
        if (!arguments.length) {
            return axisColor;
        }
        axisColor = value;
        return chart;
    }
    chart.showLabels = function (value) {
        if (!arguments.length) {
            return showLabels;
        }
        showLabels = value;
        return chart;
    }
    chart.labelColor = function (value) {
        if (!arguments.length) {
            return labelColor;
        }
        labelColor = value;
        return chart;
    }

    chart.numberFormat = function (value, measure) {
        return UTIL.baseAccessor.call(numberFormat, value, measure, _measure);
    }

    chart.displayColor = function (value, measure) {
        return UTIL.baseAccessor.call(displayColor, value, measure, _measure);
    }

    return chart;
}
