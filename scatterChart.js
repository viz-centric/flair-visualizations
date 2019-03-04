function scatter() {

    var _NAME = 'scatterChart';

    var _config,
        _dimension,
        _measure,
        _showLegend,
        _legendPosition,
        _showValueAs,
        _valueAsArc,
        _valuePosition,
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
        _measureProp,
        _legendData,

        _showValues,
        _displayNameForMeasure,
        _fontStyle,
        _fontWeight,
        _numberFormat,
        _textColor,
        _displayColor,
        _borderColor,
        _fontSize;


    var _local_svg,
        _local_total = 0,
        _local_transition_time = 500,
        _local_transition_map = d3.map(),
        _local_sorted_measure_value = [],
        _local_tooltip;


    var filter = false,
        filterData = [];

    var _pie = d3.pie()
        .sort(null);

    var _arc = d3.arc()
        .innerRadius(0);

    var _arcMask = d3.arc();

    var _labelArc = d3.arc();

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.showLegend(config.showLegend);
        this.legendPosition(config.legendPosition);
        this.showValueAs(config.showValueAs);
        this.valueAsArc(config.valueAsArc);
        this.valuePosition(config.valuePosition);
        this.showXaxis(config.showXaxis);
        this.showYaxis(config.showYaxis);
        this.showXaxisLabel(config.showXaxisLabel);

        this.showYaxisLabel(config.showYaxisLabel);
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

        this.legendData(config.displayColor, config.measure);
    }


    /**
     * Period function that stretches the rendering process
     *
     * @param {number} extraDuration Additional duration value in milliseconds
     * @return {function} Accessor function that computes the duration period
     */
    var _durationFn = function (extraDuration) {
        if (extraDuration === void 0) { extraDuration = 0; }

        if (isNaN(+extraDuration)) {
            throw new TypeError('Not a number');
        }

        return function (d, i) {
            var t = _local_transition_map.get(d.value);

            if (!t) {
                t = _local_transition_time * (d.value / _local_total)
                _local_transition_map.set(d.value, t);
            }

            return (t + extraDuration);
        }
    }

    /**
     * Delay function that delays the start of rendering process
     *
     * @param {number} extraDelay Additional delay value in milliseconds
     * @return {function} Accessor function that computes the delay period
     */
    var _delayFn = function (extraDelay) {
        if (extraDelay === void 0) { extraDelay = 0; }

        if (isNaN(+extraDelay)) {
            throw new TypeError('TypeError: Not a number');
        }

        return function (d, i) {
            var i = _local_sorted_measure_value.indexOf(d.value),
                t = 0;

            while (i > 0) {
                i--;
                t += _local_transition_map.get(_local_sorted_measure_value[i]);
            }

            return (t + extraDelay);
        }
    }

    /**
     * Gives the value of hypotenuse using pythagorous theorem
     *
     * @param {number} x Value of perpendicular
     * @param {number} y Value of base
     * @return {number} Value of hypotenuse
     */
    var _pythagorousTheorem = function (x, y) {
        if (isNaN(+x) || isNaN(+y)) {
            throw new Error('TypeError: Not a number');
            return 0;
        }

        return Math.sqrt(Math.pow(+x, 2) + Math.pow(+y, 2));
    }

    /**
     * Builds the html data for the tooltip
     *
     * @param {object} datum Datum forming the arc
     * @param {function} chart Pie chart function
     * @return {string} String encoded HTML data
     */
    var _buildTooltipData = function (datum, chart) {
        var output = "";

        output += "<table><tr>"
            + "<th>" + chart.dimension() + ": </th>"
            + "<td>" + datum[chart.dimension()] + "</td>"
            + "</tr><tr>"
            + "<th>" + datum["measure"] + ": </th>"
            + "<td>" + datum[datum["measure"]] + "</td>"
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
            data.forEach(function (d) {
                var obj = new Object();
                obj[_dimension[0]] = d[_dimension[0]];
                for (var index = 0; index < _measure.length; index++) {
                    obj[_measure[index]] = d[_measure[index]];
                }

                _filter.push(obj)
            });
            if (_filter.length > 0) {
                filterData = _filter;
            }
        }
    }

    var applyFilter = function (chart) {
        return function () {
            if (filterData.length > 0) {
                chart(filterData);
            }
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
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container,border);
            }
        }
    }

    var _handleMouseMoveFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                var border = UTIL.getDisplayColor(_measure.indexOf(d.key), _displayColor)
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me,border), container,border);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'default');

            var arcGroup = container.selectAll('g.arc')
                .filter(function (d1) {
                    return d1.data[_dimension[0]] === d.data[_dimension[0]];
                });

            arcGroup.select('path')
                .style('fill', function (d1, i) {
                    return COMMON.COLORSCALE(d1.data[_dimension[0]]);
                });

            var arcMaskGroup = container.selectAll('g.arc-mask')
                .filter(function (d1) {
                    return d1.data[_dimension[0]] === d.data[_dimension[0]];
                });

            arcMaskGroup.select('path')
                .style('visibility', 'hidden');

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }

    function chart(selection) {
        _local_svg = selection;
        selection.each(function (data) {
            chart._Local_data = _originalData = data;
            var margin = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 45
            };
            var legendSpace = 20,
                axisLabelSpace = 20,
                offsetX = 16,
                offsetY = 3;

            var svg = d3.select(this),
                width = +svg.attr('width'),
                height = +svg.attr('height'),
                parentWidth = width - 2 * COMMON.PADDING - margin.left,
                parentHeight = (height - 2 * COMMON.PADDING - axisLabelSpace * 2);

            var legendWidth = 0,
                legendHeight = 0,
                plotWidth = parentWidth,
                plotHeight = parentHeight,
                legendBreakCount;

            const color = COMMON.COLORSCALE;

            var str = UTIL.createAlert($(div).attr('id'), _measure);
            $(div).append(str);

            var container = svg.append('g')
                .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

            _local_total = d3.sum(data.map(function (d) { return d[_measure[0]]; }));

            var plot = container.append('g')
                .attr('class', 'scatter-plot')
                .classed('plot', true)
                .attr('transform', function () {
                    if (_legendPosition == 'top') {
                        return 'translate(' + margin.left + ', ' + legendSpace * 2 + ')';
                    } else if (_legendPosition == 'bottom') {
                        return 'translate(' + margin.left + ', 0)';
                    } else if (_legendPosition == 'left') {
                        return 'translate(' + (legendSpace + margin.left + axisLabelSpace) + ', 0)';
                    } else if (_legendPosition == 'right') {
                        return 'translate(' + margin.left + ', 0)';
                    }
                });

            var keys = UTIL.getMeasureList(data[0], _dimension);

            var maxGDP = d3.max(data, function (d) {
                return d3.max(keys, function (key) {
                    return parseInt(d[key]);
                });
            })
            var minGDP = d3.min(data, function (d) {
                return d3.min(keys, function (key) {
                    return parseInt(d[key]);
                });
            })

            var rScale = d3.scaleLinear()
                .domain([minGDP, maxGDP])
                .range([5, 25]);

            var x = d3.scaleLinear()
                .rangeRound([0, plotWidth])

            var y = d3.scaleLinear()
                .rangeRound([plotHeight - 40, 0]);


            x.domain([0, d3.max(data, function (d) {
                return parseInt(d[_dimension[0]]);
            })]).nice();

            y.domain([0, d3.max(data, function (d) {
                return parseInt(d[keys[0]]);
            })]).nice();

            plot.append("g")
                .attr("class", "x_axis")
                .attr("transform", "translate(0," + parseInt(plotHeight - 40) + ")")
                .call(d3.axisBottom(x))
                .append("text")
                .attr("x", plotWidth / 2)
                .attr("y", 2 * axisLabelSpace)
                .attr("dy", "0.32em")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .style('text-anchor', 'middle')
                .style('visibility', UTIL.getVisibility(_showXaxisLabel))
                .text(function () {
                    return _displayName;
                });

            plot.append("g")
                .attr("class", "y_axis")
                .call(d3.axisLeft(y).ticks(null, "s"))
                .append("text")
                .attr("x", plotHeight / 2)
                .attr("y", 2 * axisLabelSpace)
                .attr("transform", function (d) { return "rotate(" + 90 + ")"; })
                .attr("dy", "0.32em")
                .style('visibility', UTIL.getVisibility(_showYaxisLabel))
                .attr("font-weight", "bold")
                .style('text-anchor', 'middle')
                .text(function () {
                    return _measureProp.map(function (p) {
                        return p.displayName;
                    }).join(', ');
                });

            plot.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return x(d[_dimension[0]]);
                })
                .attr("cy", function (d) {
                    return y(d[keys[0]]);
                })
                .attr("r", function (d) {
                    return rScale(parseInt(d[keys[1]]));
                })
                .attr("fill", function (d) {
                    return color(d[_measure[2]]);
                })


            if (_showLegend) {
                var scatterChartLegend = LEGEND.bind(chart);

                var result = scatterChartLegend(color.domain(), container, {
                    width: parentWidth,
                    height: parentHeight,
                    legendBreakCount: legendBreakCount
                });

                legendWidth = result.legendWidth;
                legendHeight = result.legendHeight;
                legendBreakCount = result.legendBreakCount;

                switch (_legendPosition) {
                    case 'top':
                        plotHeight = parentHeight - legendHeight - axisLabelSpace;
                        break;
                    case 'bottom':
                        plotHeight = parentHeight - legendHeight - axisLabelSpace * 2;
                        break;
                    case 'right':
                    case 'left':
                        plotWidth = parentWidth - legendWidth;
                        break;
                }
            }

            if (_tooltip) {
                tooltip = d3.select(this.parentNode).select('#tooltip');
            }


            UTIL.setAxisColor(svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis, _showYaxis, _showXaxis);
        });

    }
    /**
     * Builds the html data for the tooltip
     *
     * @param {object} datum Datum forming the arc
     * @param {function} chart Pie chart function
     * @return {string} String encoded HTML data
     */
    chart._legendInteraction = function (event, data) {
        var arcGroup = d3.selectAll('g.arc')
            .filter(function (d) {
                return d.data[_dimension[0]] === data[_dimension[0]];
            });

        if (event === 'mouseover') {
            arcGroup.select('path')
                .style('fill', COMMON.HIGHLIGHTER);
        } else if (event === 'mousemove') {
            // do something
        } else if (event === 'mouseout') {
            arcGroup.select('path')
                .style('fill', function (d, i) {
                    return COMMON.COLORSCALE(d.data[_dimension[0]]);
                });
        } else if (event === 'click') {

        }
    }

    chart._getName = function () {
        return _NAME;
    }

    var _mergeForTransition = function (fData, sData) {
        var secondSet = d3.set();

        sData.forEach(function (d) {
            secondSet.add(d[_dimension[0]]);
        });

        var onlyFirst = fData.filter(function (d) {
            return !secondSet.has(d[_dimension[0]]);
        })
            .map(function (d) {
                var obj = {};

                obj[_dimension[0]] = d[_dimension[0]];
                obj[_measure[0]] = 0;

                return obj;
            });

        return d3.merge([sData, onlyFirst])
            .sort(function (a, b) {
                return a[_measure[0]] > b[_measure] ? _sort
                    : a[_measure[0]] < b[_measure] ? -_sort
                        : 0;
            })
    }

    chart.update = function (data) {
        chart._Local_data = data,
            svg = _local_svg;
        filter = false;
        filterData = [];
        var key = function (d) {
            return d.data[_dimension[0]];
        };

        var prevData = svg.selectAll('g.cluster')
            .data().map(function (d) { return d.data });

        if (prevData.length == 0) {
            prevData = data;
        }

        //  var oldFilteredData = _mergeForTransition(data, prevData),
        //      newFilteredData = _mergeForTransition(prevData, data);

        var cluster = d3.selectAll('g.cluster')
            .data(data);

        cluster.enter().append('g')
            .attr('class', 'cluster')
            .attr('transform', function (d) {
                return 'translate(' + xScaleDim(d[dimension[0]]) + ', 0)';
            });

        cluster.exit().remove();

        cluster = d3.selectAll('g.cluster');
        var labelStack = [];
        var clusteredverticalbar = cluster.selectAll('g.clusteredverticalbar')
            .data(function (d) {
                return _measure.filter(function (m) {
                    return labelStack.indexOf(m) == -1;
                }).map(function (m) {
                    var obj = {};
                    obj[_dimension[0]] = d[_dimension[0]];
                    obj[m] = d[m];
                    obj['dimension'] = _dimension[0];
                    obj['measure'] = m;
                    return obj;
                });
            })
            .enter().append('g')
            .attr('class', 'clusteredverticalbar');


        var rect = clusteredverticalbar.append('rect')
            .attr("x", function (d) {
                return x1(d.measure);
            })
            .attr("y", function (d) { return y(d[d.measure]); })
            .attr("width", x1.bandwidth())
            .attr("height", function (d) {
                return plotHeight - y(d[d.measure]);
            })
            .style('fill', function (d, i) {
                return UTIL.getDisplayColor(i, _displayColor);
            })
            .style('stroke', function (d, i) {
                return UTIL.getBorderColor(i, _borderColor);
            })
            .style('stroke-width', 2)
            .on('mouseover', _handleMouseOverFn.call(chart, tooltip, svg))
            .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, svg))
            .on('mouseout', _handleMouseOutFn.call(chart, tooltip, svg))

        var text = clusteredverticalbar.append('text')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d[d.measure], UTIL.getValueNumberFormat(i, _numberFormat));
            })
            .attr("y", function (d, i) {
                return y(d[d.measure]) - _measureProp[i]['fontSize'];
            })
            .attr("x", function (d) {
                return x1(d.measure);
            })
            .attr('dy', function (d, i) {
                return offsetX / 10;
            })
            .attr('dx', function (d, i) {
                return x1.bandwidth() / 2;
            })
            .style('text-anchor', 'middle')
            .attr('visibility', function (d, i) {
                return UTIL.getVisibility(_measureProp[i]["showValues"]);
            })
            .style('font-style', function (d, i) {
                return _measureProp[i]["fontStyle"];
            })
            .style('font-weight', function (d, i) {
                return _measureProp[i]["fontWeight"];
            })
            .style('font-size', function (d, i) {
                return _measureProp[i]['fontSize'] + 'px';
            })
            .style('fill', function (d, i) {
                return _measureProp[i]["textColor"];
            });
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
        _pie.value(function (d) { return d[_measure[0]]; });
        return chart;
    }

    chart.showLegend = function (value) {
        if (!arguments.length) {
            return _showLegend;
        }
        _showLegend = value;
        return chart;
    }

    chart.legendPosition = function (value) {
        if (!arguments.length) {
            return _legendPosition;
        }
        _legendPosition = value;
        return chart;
    }

    chart.showValueAs = function (value) {
        if (!arguments.length) {
            return _showValueAs;
        }
        _showValueAs = value;
        return chart;
    }

    chart.valueAsArc = function (value) {
        if (!arguments.length) {
            return _valueAsArc;
        }
        _valueAsArc = value;
        return chart;
    }

    chart.valuePosition = function (value) {
        if (!arguments.length) {
            return _valuePosition;
        }
        _valuePosition = value;
        return chart;
    }

    chart.sort = function (value) {
        if (!arguments.length) {
            return _sort;
        }
        _sort = value;
        return chart;
    }

    chart.filterData = function (value) {
        if (!arguments.length) {
            return filterData;
        }
        filterData = value;
        return chart;
    }


    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    }

    chart.showXaxis = function (value) {
        if (!arguments.length) {
            return _showXaxis;
        }
        _showXaxis = value;
        return chart;
    }

    chart.showYaxis = function (value) {
        if (!arguments.length) {
            return _showYaxis;
        }
        _showYaxis = value;
        return chart;
    }

    chart.showXaxisLabel = function (value) {
        if (!arguments.length) {
            return _showXaxisLabel;
        }
        _showXaxisLabel = value;
        return chart;
    }

    chart.showYaxisLabel = function (value) {
        if (!arguments.length) {
            return _showYaxisLabel;
        }
        _showYaxisLabel = value;
        return chart;
    }

    chart.xAxisColor = function (value) {
        if (!arguments.length) {
            return _xAxisColor;
        }
        _xAxisColor = value;
        return chart;
    }

    chart.yAxisColor = function (value) {
        if (!arguments.length) {
            return _yAxisColor;
        }
        _yAxisColor = value;
        return chart;
    }

    chart.showGrid = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _showGrid = value;
        return chart;
    }

    chart.stacked = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _stacked = value;
        return chart;
    }

    chart.displayName = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _displayName = value;
        return chart;
    }

    chart.forEachMeasure = function (value) {
        if (!arguments.length) {
            return _measureProp;
        }
        _measureProp = value;
        return chart;
    }

    chart.legendData = function (measureConfig, measureName) {
        _legendData = {
            measureConfig: measureConfig,
            measureName: measureName
        }
        return _legendData;
    }
    chart.Local_data = function () {
        if (!arguments.length) {
            return _Local_data;
        }
        _Local_data = value;
        return chart;
    }

    chart.showValues = function (value) {
        if (!arguments.length) {
            return _showValues;
        }
        _showValues = value;
        return chart;
    }

    chart.displayNameForMeasure = function (value) {
        if (!arguments.length) {
            return _displayNameForMeasure;
        }
        _displayNameForMeasure = value;
        return chart;
    }

    chart.fontStyle = function (value) {
        if (!arguments.length) {
            return _fontStyle;
        }
        _fontStyle = value;
        return chart;
    }

    chart.fontWeight = function (value) {
        if (!arguments.length) {
            return _fontWeight;
        }
        _fontWeight = value;
        return chart;
    }

    chart.numberFormat = function (value) {
        if (!arguments.length) {
            return _numberFormat;
        }
        _numberFormat = value;
        return chart;
    }

    chart.textColor = function (value) {
        if (!arguments.length) {
            return _textColor;
        }
        _textColor = value;
        return chart;
    }

    chart.displayColor = function (value) {
        if (!arguments.length) {
            return _displayColor;
        }
        _displayColor = value;
        return chart;
    }

    chart.borderColor = function (value) {
        if (!arguments.length) {
            return _borderColor;
        }
        _borderColor = value;
        return chart;
    }

    chart.fontSize = function (value) {
        if (!arguments.length) {
            return _fontSize;
        }
        _fontSize = value;
        return chart;
    }
    return chart;
}