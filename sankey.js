function clusteredhorizontalbar() {

    var _NAME = 'clusteredhorizontalbar';

    var _config,
        dimension = [],
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
        _tooltip;


    var _local_svg, _Local_data, _originalData, _localLabelStack = [], legendBreakCount = 1;

    var parentWidth, parentHeight, plotWidth, plotHeight;

    var margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    };

    var legendSpace = 20, axisLabelSpace = 20, offsetX = 16, offsetY = 3, div;


    var filter = false, filterData = [];

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
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
    }

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
            if (data.length > 0) {
                var keys = UTIL.getMeasureList(data[0], _dimension);
                data.forEach(function (d) {
                    var obj = new Object();
                    obj[_dimension[0]] = d[_dimension[0]];
                    for (var index = 0; index < keys.length; index++) {
                        obj[keys[index]] = d[keys[index]];
                    }
                    _filter.push(obj)
                });
            }
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

    var _handleMouseOverFn = function (tooltip, container,element) {
        var me = this;
debugger
        return function (d, i) {
            d3.select(this).style('cursor', 'pointer');
            var border = UTIL.getDisplayColor(measure.indexOf(d.measure), _displayColor)
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
                var border = UTIL.getDisplayColor(measure.indexOf(d.measure), _displayColor)
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me, border), container, border);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'default')
                .style('fill', function (d1, i) {
                    return UTIL.getDisplayColor(measure.indexOf(d1.measure), _displayColor);
                })
                .style('stroke', function (d1, i) {
                    return UTIL.getBorderColor(measure.indexOf(d1.measure), _borderColor);
                });

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }
    var getUniqueItems = function (array) {
        var filteredArray = array.filter(function (item, pos) {
            return array.indexOf(item) == pos
        });

        return filteredArray;
    }
    var getSankeyData = function (data) {
        var me = this;

        var nodes = [],
            links = [],
            nodeOffsets = [];
        debugger
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
                    'node': counter++,
                    'name': d == null ? 'null' : d,
                    'nodeType': _dimension
                });
            });

            var targetUniqueDimensions = getUniqueItems(data.map(function (d, i) {
                return d[dimension[index + 1]];
            }));

            if (index != (dimension.length - 1)) {
                data.forEach(function (d, i) {
                    var link = {};
                    link.source = nodeOffsets[index] + sourceUniqueDimensions.indexOf(d[_dimension]);
                    link.target = nodes.length + targetUniqueDimensions.indexOf(d[dimension[index + 1]]);
                    link.value = (isNaN(d[measure]) || d[measure] === null) ? 0 : d[measure];
                    links.push(link);
                });
            }
        });

        return { nodes: nodes, links: links };
    }
    var getFillColor = function (d, i) {
        if (colorPattern == 'single_color') {
            return displayColor;
        } else if (colorPattern == 'unique_color') {
            /*var r = parseInt(Math.abs(Math.sin(12*i + i/9)) * 255),
                g = parseInt(Math.abs(Math.cos(9*i)) * 255),
                b = parseInt(Math.abs(Math.sin(i/2-3*i)) * 255);
            return d3.rgb(r, g, b);*/

            return d3.schemeCategory20c[i % (d3.schemeCategory20c.length)];
        } else if (colorPattern == 'gradient_color') {
            return gradientColor(d.value);
        }
    }
    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {
            _Local_data = _originalData = data;

            div = d3.select(this).node().parentNode;

            var _local_svg = d3.select(this),
                width = div.clientWidth,
                height = div.clientHeight;

            var data = getSankeyData(data);

            var svg = d3.select(this);

            svg.selectAll('g').remove();

            svg.attr('width', width)
                .attr('height', height);

            var containerWidth = width - margin.left - margin.right,
                containerHeight = height - margin.top - margin.bottom;

            var container = svg.append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            var sankey = this._sankey = d3.sankey()
                .nodeWidth(12)
                .nodePadding(4)
                .size([containerWidth, containerHeight]);

            var path = sankey.link();

            sankey.nodes(data.nodes)
                .links(data.links)
                .layout(32);

            gradientColor = d3.scaleLinear()

            gradientColor.range([
                d3.rgb(displayColor).brighter(),
                d3.rgb(displayColor).darker()
            ])

            gradientColor.domain(d3.extent(data.nodes, function (d) {
                return d.value;
            }));

            var nodeDistance = data.nodes[0].sourceLinks[0].target.x - data.nodes[0].x - sankey.nodeWidth();

            var link = container.append('g').selectAll('.link')
                .data(data.links)
                .enter().append('path')
                .attr('class', 'link')
                .attr('d', path)
                .style('stroke-width', function (d) { return Math.max(1, d.dy); })
                .sort(function (a, b) { return b.dy - a.dy; })
                .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg, 'link'))
                .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg, 'link'))
                .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg, 'link'))
                .on('click', function (d) {

                    var confirm = d3.select('.confirm')
                        .style('visibility', 'visible');

                    var rect = d3.select(this).select('rect.measure');

                    if (rect.classed('selected')) {
                        rect.classed('selected', false);
                        filterData = filterData.filter(function (val) {
                            if (val[dimension[0]] != d.title) {
                                return val;
                            }
                        })
                    } else {
                        rect.classed('selected', true);
                        var obj = new Object();
                        obj[dimension] = d.title;
                        obj[measures[0]] = d.measures.toString();
                        obj[measures[1]] = d.markers.toString();

                        filterData.push(obj)
                    }
                })
            var drag = d3.drag()
                .subject(function (d) {
                    return d;
                })
                .on('start', function () {
                    startTime = (new Date()).getTime();
                    this.parentNode.appendChild(this);
                })
                .on('drag', function (d) {
                    d3.select(this).attr('transform', 'translate(' + d.x + ', ' + (d.y = Math.max(0, Math.min(containerHeight - d.dy, d3.event.y))
                    ) + ')');
                    sankey.relayout();
                    link.attr('d', path);
                })
            // .on('end', function(d, i) {
            //     var endTime = (new Date()).getTime();

            //     if((endTime - startTime) < 1000) {
            //         // treat as click event
            //         if($rootScope.filterSelection.id && $rootScope.filterSelection.id != record.id) {
            //             return;
            //         }

            //         $rootScope.filterSelection.lasso = false;

            //         var confirm = d3.select(me.container).select('.confirm')
            //             .style('visibility', 'visible');

            //         var filter = {};

            //         if($rootScope.filterSelection.id) {
            //             filter = $rootScope.filterSelection.filter;
            //         } else {
            //             $rootScope.filterSelection.id = me.id;
            //         }

            //         var rect = d3.select(this).select('rect');

            //         if(rect.classed('selected')) {
            //             rect.classed('selected', false);
            //         } else {
            //             rect.classed('selected', true);
            //         }

            //         var dimension = d.nodeType;

            //         if(filter[dimension]) {
            //             var temp = filter[dimension];
            //             if(temp.indexOf(d.name) < 0) {
            //                 temp.push(d.name);
            //             } else {
            //                 temp.splice(temp.indexOf(d.name), 1);
            //             }
            //             filter[dimension] = temp;
            //         } else {
            //             filter[dimension] = [d.name];
            //         }

            //         // Clear out the updateWidget property
            //         var idWidget = $rootScope.updateWidget[me.id];
            //         $rootScope.updateWidget = {};
            //         $rootScope.updateWidget[me.id] = idWidget;

            //         $rootScope.filterSelection.filter = filter;
            //         filterParametersService.save(filter);
            //         $rootScope.$broadcast('flairbiApp:filter-input-refresh');
            //         $rootScope.$broadcast('flairbiApp:filter');
            //     }
            // })

            var node = container.append('g').selectAll('.node')
                .data(data.nodes)
                .enter().append('g')
                .attr('class', 'node')
                .attr('transform', function (d) {
                    return 'translate(' + d.x + ',' + d.y + ')';
                })
                .call(drag);

            node.append('rect')
                .attr('width', sankey.nodeWidth())
                .attr('height', function (d) { return d.dy; })
                .style('cursor', 'move')
                .style('fill', function (d, i) {
                    return getFillColor(d, i);
                })
                .style('stroke', function (d) {
                    return borderColor;
                })
            // .on('mouseover', me.helper.toggleTooltip('visible', 'node', me))
            // .on('mousemove', function () {
            //     var tooltip = d3.select(me.container).select('.tooltip_custom');
            //     var offset = $(me.container).offset();
            //     var x = d3.event.pageX - offset.left,
            //         y = d3.event.pageY - offset.top;

            //     tooltip.style('top', y + 10 + 'px').style('left', x + 10 + 'px');
            //     UTIL.constrainTooltip(me.container, tooltip.node());
            // })
            // .on('mouseout', me.helper.toggleTooltip('hidden', 'node', me));

            node.append('text')
                .attr('x', -6)
                .attr('y', function (d) { return d.dy / 2; })
                .attr('dy', '.35em')
                .attr('text-anchor', 'end')
                .style('pointer-events', 'none')
                .text(function (d) {
                    if (d.dy > 4) {
                        return d.name;
                    }
                    return "";
                })
                .text(function (d) {
                    if (d.dy > 4) {
                        if (dimension.indexOf(d.nodeType) >= dimension.length - 2) {
                            return UTIL.getTruncatedLabel(this, d.name, nodeDistance / 2, 3);
                        }
                        return UTIL.getTruncatedLabel(this, d.name, nodeDistance, 3);
                    }
                    return "";
                })
                // .style('visibility', function (d, i) {
                //     return me.helper.getLabelVisibility(dimension.indexOf(d.nodeType));
                // })
                // .style('font-style', function (d, i) {
                //     return me.helper.getDimFontStyle(dimension.indexOf(d.nodeType));
                // })
                // .style('font-weight', function (d, i) {
                //     return me.helper.getDimFontWeight(dimension.indexOf(d.nodeType));
                // })
                // .style('font-size', function (d, i) {
                //     return me.helper.getDimFontSize(dimension.indexOf(d.nodeType));
                // })
                // .style('fill', function (d, i) {
                //     return me.helper.getLabelColor(dimension.indexOf(d.nodeType));
                // })
                .filter(function (d) { return d.x < containerWidth / 2; })
                .attr('x', 6 + sankey.nodeWidth())
                .attr('text-anchor', 'start');

        });

    }

    var drawPlot = function (data) {
        var me = this;
        _Local_data = data;
        x0 = d3.scaleBand()
            .rangeRound([plotHeight, 0])
            .paddingInner(0.1)
            .padding([0.1]);

        x1 = d3.scaleBand()
            .padding(0.2);

        y = d3.scaleLinear()
            .rangeRound([0, plotWidth]);

        var plot = container.append('g')
            .attr('class', 'clusteredhorizontalbar-plot')
            .classed('plot', true)
            .attr('transform', function () {
                if (_legendPosition == 'top') {
                    return 'translate(' + margin.left + ', ' + parseInt(legendSpace * 2 + (20 * parseInt(legendBreakCount))) + ')';
                } else if (_legendPosition == 'bottom') {
                    return 'translate(' + margin.left + ', 0)';
                } else if (_legendPosition == 'left') {
                    return 'translate(' + (legendSpace + margin.left + axisLabelSpace) + ', 0)';
                } else if (_legendPosition == 'right') {
                    return 'translate(' + margin.left + ', 0)';
                }
            });


        if (!_showLegend) {
            _local_svg.select('.plot')
                .attr('transform', function () {
                    return 'translate(' + margin.left + ', ' + 0 + ')';
                });
        }

        var keys = UTIL.getMeasureList(data[0], _dimension);

        x0.domain(data.map(function (d) { return d[_dimension[0]]; }));
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(data, function (d) {
            return d3.max(keys, function (key) {
                return parseInt(d[key]);
            });
        })]).nice();

        var cluster = plot.selectAll('.cluster')
            .data(data)
            .enter().append('g')
            .attr('class', 'cluster')
            .attr('transform', function (d) {
                return 'translate(0,' + x0(d[_dimension[0]]) + ')';
            });

        var labelStack = []
        var clusteredhorizontalbar = cluster.selectAll('g.clusteredhorizontalbar')
            .data(function (d) {
                return keys.filter(function (m) {
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
            .attr('class', 'clusteredhorizontalbar');


        drawViz(clusteredhorizontalbar);

        plot.append("g")
            .attr("class", "x_axis")
            .attr("transform", "translate(0," + plotHeight + ")")
            .call(d3.axisBottom(y))
            .append("text")
            .attr("x", plotWidth / 2)
            .attr("y", 2 * axisLabelSpace)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .style('text-anchor', 'middle')
            .style('visibility', UTIL.getVisibility(_showXaxisLabel))
            .text(function () {
                return _displayNameForMeasure.map(function (p) { return p; }).join(', ');
            });

        plot.append("g")
            .attr("class", "y_axis")
            .call(d3.axisLeft(x0).ticks(null, "s"))
            .append("text")
            .attr("x", plotHeight / 2)
            .attr("y", 2 * axisLabelSpace)
            .attr("transform", function (d) { return "rotate(" + 90 + ")"; })
            .attr("dy", "0.32em")
            .style('visibility', UTIL.getVisibility(_showYaxisLabel))
            .attr("font-weight", "bold")
            .style('text-anchor', 'middle')
            .text(function () {
                return _displayName;
            });

        UTIL.setAxisColor(_local_svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis, _showYaxis, _showXaxis);

        _local_svg.select('g.sort').remove();
        UTIL.sortingView(container, parentHeight, parentWidth + margin.left, legendBreakCount, axisLabelSpace, offsetX);

        _local_svg.select('g.sort').selectAll('text')
            .on('click', function () {
                var order = d3.select(this).attr('class')
                switch (order) {
                    case 'ascending':
                        UTIL.toggleSortSelection(me, 'ascending', drawPlot, _local_svg, keys, _Local_data);
                        break;
                    case 'descending':
                        UTIL.toggleSortSelection(me, 'descending', drawPlot, _local_svg, keys, _Local_data);
                        break;
                    case 'reset': {
                        _local_svg.select(me.parentElement).select('.plot').remove();
                        drawPlot.call(me, _Local_data);
                        break;
                    }
                }
            }
            );

        d3.select(div).select('.btn-primary')
            .on('click', applyFilter(chart));

        d3.select(div).select('.btn-default')
            .on('click', clearFilter());

        _local_svg.select('g.lasso').remove()
        var lasso = d3.lasso()
            .hoverSelect(true)
            .closePathSelect(true)
            .closePathDistance(100)
            .items(cluster)
            .targetArea(_local_svg);

        lasso.on('start', onLassoStart(lasso, chart))
            .on('draw', onLassoDraw(lasso, chart))
            .on('end', onLassoEnd(lasso, chart));

        _local_svg.call(lasso);
    }

 
    /**
     * Builds the html data for the tooltip
     *
     * @param {object} datum Datum forming the arc
     * @param {function} chart Pie chart function
     * @return {string} String encoded HTML data
     */
    chart._legendInteraction = function (event, data) {
        switch (event) {
            case 'mouseover':
                _legendMouseOver(data);
                break;
            case 'mousemove':
                _legendMouseMove(data);
                break;
            case 'mouseout':
                _legendMouseOut(data);
                break;
            case 'click':
                _legendClick(data);
                break;
        }
    }

    chart._getName = function () {
        return _NAME;
    }

    var _legendMouseOver = function (data) {

        d3.selectAll('g.clusteredhorizontalbar')
            .filter(function (d) {
                return d.measure === data;
            })
            .select('rect')
            .style('fill', COMMON.HIGHLIGHTER);
    }

    var _legendMouseMove = function (data) {

    }

    var _legendMouseOut = function (data) {
        d3.selectAll('g.clusteredhorizontalbar')
            .filter(function (d) {
                return d.measure === data;
            })
            .select('rect')
            .style('fill', function (d, i) {
                return UTIL.getDisplayColor(measure.indexOf(d.measure), _displayColor);
            });
    }

    var _legendClick = function (data) {
        var _filter = UTIL.getFilterData(_localLabelStack, data, _originalData)
        drawPlot.call(this, _filter);
    }

    chart.update = function (data) {

        _Local_data = data,
            filterData = [];

        x0 = d3.scaleBand()
            .rangeRound([plotHeight, 0])
            .paddingInner(0.1)
            .padding([0.1]);

        x1 = d3.scaleBand()
            .padding(0.2);

        y = d3.scaleLinear()
            .rangeRound([0, plotWidth]);

        var keys = UTIL.getMeasureList(data[0], _dimension);

        x0.domain(data.map(function (d) { return d[_dimension[0]]; }));
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(data, function (d) {
            return d3.max(keys, function (key) {
                return parseInt(d[key]);
            });
        })]).nice();

        var plot = _local_svg.select('.plot')
        var cluster = plot.selectAll("g.cluster")
            .data(data);

        cluster.enter().append('g')
            .attr('class', 'cluster')
            .attr('transform', function (d) {
                return 'translate(0, ' + x0(d[_dimension[0]]) + ')';
            });

        cluster.exit()
            .transition()
            .duration(1000)
            .attr('height', 0)
            .attr('y', plotHeight)
            .remove();

        cluster = plot.selectAll('g.cluster');
        var labelStack = [];
        var clusteredhorizontalbar = cluster.selectAll('g.clusteredhorizontalbar')
            .data(function (d) {
                return keys.filter(function (m) {
                    return labelStack.indexOf(m) == -1;
                }).map(function (m) {

                    var obj = {};
                    obj[_dimension[0]] = d[_dimension[0]];
                    obj[m] = d[m];
                    obj['dimension'] = _dimension[0];
                    obj['measure'] = m;
                    return obj;
                });
            });

        clusteredhorizontalbar.select('rect')
            .attr("x", 1)
            .attr("y", function (d) {
                return x1(d.measure);
            })
            .attr("height", x1.bandwidth())
            .attr("width", function (d) {
                return y(d[d.measure]);
            })
            .attr('class', '')

        clusteredhorizontalbar.select('text')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d[d.measure], UTIL.getValueNumberFormat(i, _numberFormat));
            })
            .attr('x', function (d, i) {
                return y(d[d.measure]) + 20;
            })
            .attr('y', function (d, i) {
                return x1(d['measure']);
            })
            .attr('dy', function (d, i) {
                return x1.bandwidth() / 2 + d3.select(this).style('font-size').replace('px', '') / 2.5;
            })
            .attr('visibility', function (d, i) {
                return UTIL.getVisibility(_showValues[i]);
            })
            .attr('visibility', function (d, i) {
                var rect = d3.select(this.previousElementSibling).node(),
                    rectWidth = rect.getAttribute('width'),
                    rectHeight = rect.getAttribute('height');

                if (this.getAttribute('visibility') == 'hidden') return 'hidden';

                if ((this.getComputedTextLength() + (offsetX / 2)) > parseFloat(plotWidth - rectWidth)) {
                    return 'hidden';
                }

                if (parseInt(rectHeight) < parseInt(_fontSize[i])) {
                    return 'hidden';
                }
                return 'visible';
            })

        var newBars = clusteredhorizontalbar.enter().append('g')
            .attr('class', 'clusteredhorizontalbar');

        drawViz(newBars);

        d3.selectAll('g.cluster')
            .attr('transform', function (d) {
                return 'translate(0, ' + x0(d[_dimension[0]]) + ')';
            });

        plot.select('.x_axis')
            .transition()
            .duration(1000)
            .call(d3.axisBottom(y));

        plot.select('.y_axis')
            .transition()
            .duration(1000)
            .call(d3.axisLeft(x0).ticks(null, "s"));

        UTIL.setAxisColor(_local_svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis);
        UTIL.displayThreshold(threshold, data, keys);

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
            return dimension;
        }
        dimension = value;
        return chart;
    }

    chart.measure = function (value) {
        if (!arguments.length) {
            return measure;
        }
        measure = value;
        return chart;
    }

    chart.colorPattern = function (value) {
        if (!arguments.length) {
            return colorPattern;
        }
        colorPattern = value;
        return chart;
    }

    chart.displayColor = function (value) {
        if (!arguments.length) {
            return displayColor;
        }
        displayColor = value;
        return chart;
    }

    chart.sort = function (value) {
        if (!arguments.length) {
            return _sort;
        }
        _sort = value;
        return chart;
    }

    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    }

    chart.borderColor = function (value) {
        if (!arguments.length) {
            return borderColor;
        }
        borderColor = value;
        return chart;
    }

    chart.numberFormat = function (value) {
        if (!arguments.length) {
            return numberFormat;
        }
        numberFormat = value;
        return chart;
    }

    chart.showLabels = function (value, measure) {
        return UTIL.baseAccessor.call(showLabels, value, measure, measure);
    }

    chart.fontStyle = function (value, measure) {
        return UTIL.baseAccessor.call(fontStyle, value, measure, measure);
    }

    chart.fontWeight = function (value, measure) {
        return UTIL.baseAccessor.call(fontWeight, value, measure, measure);
    }

    chart.fontSize = function (value, measure) {
        return UTIL.baseAccessor.call(fontSize, value, measure, measure);
    }

    chart.textColor = function (value, measure) {
        return UTIL.baseAccessor.call(textColor, value, measure, measure);
    }

    return chart;
}