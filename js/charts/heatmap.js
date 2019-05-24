var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var UTIL = require('../extras/util.js')();
try {
    var d3Lasso = require("d3-lasso");

} catch (ex) { }
function heatmap() {

    var _NAME = 'heatmap';

    var _config,
        _dimension,
        _measure,
        dimLabelColor,
        displayName,
        fontStyleForDimension,
        fontWeightForDimension,
        fontSizeForDimension,

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
        _print,
        broadcast,
        filterParameters,
        displayColor = [],
        _notification = false;

    var _local_svg, _Local_data, _originalData, _localLabelStack = [];
    var width, height, cellWidth, cellHeight, div;
    var margin = {
        top: 30,
        right: 15,
        bottom: 15,
        left: 55
    };
    var yScale = d3.scaleBand(),
        xScale = d3.scaleBand();


    var filter = false, filterData = [];

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.dimLabelColor(config.dimLabelColor);
        this.displayName(config.displayName);
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
        this.showIcon(config.showIcon)
        this.colourCoding(config.colourCoding);
        this.valueTextColour(config.valueTextColour);
        this.fontStyleForMeasure(config.fontStyleForMeasure);
        this.fontWeightForMeasure(config.fontWeightForMeasure);
        this.numberFormat(config.numberFormat);
        this.fontSizeForMeasure(config.fontSizeForMeasure);
        this.displayColor(config.displayColor);
    }

    var _buildTooltipData = function (datum, chart) {
        var output = "";

        output += "<table><tr>"
            + "<th>" + chart.dimension() + ": </th>"
            + "<td>" + datum.y + "</td>"
            + "</tr><tr>"
            + "<th>" + datum.x + ": </th>"
            + "<td>" + datum.val + "</td>"
            + "</tr></table>";

        return output;
    }

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;
        return function (d, i) {
            d3.select(this).select('rect').style('cursor', 'pointer')
                .style('cursor', 'pointer')
                .style('fill-opacity', .5);
            var border = d3.select(this).attr('fill');
            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, border, _notification);
            }
        }
    }

    var _handleMouseMoveFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                var border = getFillColor(d);
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me, border), container, border, _notification);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).select('rect').style('cursor', 'default')
                .style('fill', function (d1, i) {
                    return getFillColor(d);
                })
                .style('fill-opacity', 1);

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }


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
                    val: val
                });
            })
        });

        return result;
    }


    var getFillColor = function (data) {
        var colorProp = colourCoding[_measure.indexOf(data.x)],
            val = data.val,
            result;

        if (isNaN(val)) {
            return colorProp.filter(function (c) { return c.hasOwnProperty('default'); })[0]['color'];
        }

        colorProp.some(function (c) {
            if (c.hasOwnProperty('upto')) {
                if (val <= c.upto) {
                    result = c.color;
                    return true;
                }
            } else {
                result = c.color;
                return true;
            }
        });

        return result || displayColor[_measure.indexOf(data.x)];
    }
    var getIconPosition = function (data, width) {
        var iconProp = iconPosition[_measure.indexOf(data.x)]
        var padding = 4;

        var offset;

        switch (iconProp) {
            case 'left':
                offset = 0 + padding;
                break;
            case 'center':
                offset = width / 2 - 2 * padding;
                break;
            case 'right':
                offset = width - 5 * padding;
                break;
        }

        return offset;
    }
    var getValuePosition = function (data, width) {
        var valPosition = valuePosition[_measure.indexOf(data.x)];
        var padding = 4;

        var offset;

        switch (valPosition) {
            case 'left':
                offset = 0 + padding;
                break;
            case 'center':
                offset = width / 2;
                break;
            case 'right':
                offset = width - padding;
                break;
        }

        return offset;
    }
    var getValueTextAnchor = function (data) {
        var valPosition = valuePosition[_measure.indexOf(data.x)];

        var anchor;

        switch (valPosition) {
            case 'left':
                anchor = 'start';
                break;
            case 'center':
                anchor = 'middle';
                break;
            case 'right':
                anchor = 'end';
                break;
        }

        return anchor;
    }

    var onLassoStart = function (lasso, scope) {
        return function () {
            if (filter) {
                lasso.items().selectAll('rect')
                    .classed('not_possible', true)
                    .classed('selected', false);
            }
        }
    }

    var onLassoDraw = function (lasso, scope) {
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

    var onLassoEnd = function (lasso, scope) {
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

            var confirm = $(scope).parent().find('div.confirm')
                .css('visibility', 'visible');

            var _filter = [];
            if (data.length > 0) {
                data.forEach(function (d) {
                    var temp = d.y;
                    var searchObj = _filter.find(o => o[_dimension[0]] === temp);
                    if (searchObj == undefined) {
                        var tempData = _localData.filter(function (val) {
                            return val[_dimension[0]] === d.y
                        })
                        _filter.push(tempData[0])
                    }
                })
                if (_filter.length > 0) {
                    filterData = _filter;
                }
            }
            else {
                filterData = [];
            }
            if (broadcast) {
                var idWidget = broadcast.updateWidget[scope.parentElement.id];
                broadcast.updateWidget = {};
                broadcast.updateWidget[scope.parentElement.id] = idWidget;

                var _filterList = {}, list = []

                filterData.map(function (val) {
                    list.push(val[_dimension[0]])
                })

                var _filterDimension = {};
                if (broadcast.filterSelection.id) {
                    _filterDimension = broadcast.filterSelection.filter;
                } else {
                    broadcast.filterSelection.id = $(div).attr('id');
                }
                var dimension = _dimension[0];

                _filterDimension[dimension] = filterData.map(function (d) {
                    return d[_dimension[0]];
                });

                broadcast.filterSelection.filter = _filterDimension;
                var _filterParameters = filterParameters.get();
                _filterParameters[dimension] = _filterDimension[dimension];
                filterParameters.save(_filterParameters);
            }
        }
    }

    var applyFilter = function () {
        return function () {
            //Viz renders twice issue
            // chart.update(filterData);
            if (broadcast) {
                broadcast.updateWidget = {};
                broadcast.filterSelection.id = null;
                broadcast.$broadcast('flairbiApp:filter-input-refresh');
                broadcast.$broadcast('flairbiApp:filter');
                broadcast.$broadcast('flairbiApp:filter-add');
                d3.select(this.parentNode)
                    .style('visibility', 'hidden');

            }
        }
    }

    var clearFilter = function (div) {
        return function () {
            chart.update(_originalData);
            d3.select(div).select('.confirm')
                .style('visibility', 'hidden');
        }
    }

    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {

            div = d3.select(this).node().parentNode;
            var svg = d3.select(this);

            width = +svg.attr('width');
            height = +svg.attr('height');

            svg.selectAll('g').remove();

            var plot = svg.attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

            /* store the data in local variable */
            _localData = _originalData = data;
            var me = this;
            svg.selectAll('g').remove();

            var plot = svg.attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('class', 'plot')
                .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

            var yElement = d3.set(data.map(function (item) { return item[_dimension[0]]; })).values();
            var xElement = d3.map();

            for (var i = 0; i < _measure.length; i++) {
                xElement.set(i, _measure[i]);
            }

            cellWidth = parseInt((width - margin.left - margin.right) / _measure.length),
                cellHeight = parseInt((height - margin.top - margin.bottom) / data.length);
            var offset = 6;
            var dimLabel = plot.selectAll('.dimLabel')
                .data(yElement)
                .enter().append('text')
                .attr('class', 'dimLabel')
                .text(function (d) { return d; })
                .text(function (d) {
                    if (!_print) {
                        return UTIL.getTruncatedLabel(this, d, (margin.left));
                    }
                    else {
                        if (d.length > 3) {
                            return d.substring(0, 3) + '...';
                        }
                        return d;
                    }
                })
                .attr('x', 0)
                .attr('y', function (d, i) { return i * cellHeight; })
                .style('fill', dimLabelColor)
                .style('font-style', fontStyleForDimension)
                .style('font-weight', fontWeightForDimension)
                .style('font-size', fontSizeForDimension)
                .style('text-anchor', 'end')
                .attr('transform', 'translate(' + -offset + ',' + cellHeight / 1.75 + ')');

            var mesLabel = plot.selectAll('.mesLabel')
                .data(xElement.values().map(function (mes) {
                    return displayNameForMeasure[_measure.indexOf(mes)];
                }))
                .enter().append('text')
                .attr('class', 'mesLabel')
                .text(function (d) { return d; })
                .text(function (d) {
                    return UTIL.title(UTIL.getTruncatedLabel(this, d, cellWidth));
                })
                .attr('x', function (d, i) { return i * cellWidth; })
                .attr('y', 0)
                .style('text-anchor', 'middle')
                .attr('transform', 'translate(' + cellWidth / 2 + ', -6)');

            yScale
                .domain(yElement)
                .range([0, yElement.length * cellHeight]);

            xScale
                .domain(xElement.entries().map(function (element) {
                    return element.key + '_' + element.value;
                }))
                .range([0, xElement.size() * cellWidth]);

            data = transformData(data);
            if (_tooltip) {
                tooltip = d3.select(this.parentNode).select('.custom_tooltip');
            }

            var cell = plot.selectAll(".node")
                .data(data)
                .enter().append('g')
                .attr('transform', function (d) {
                    return 'translate(' + xScale(d.column + '_' + d.x) + ',' + yScale(d.y) + ')';
                })
                .attr('class', 'node')

            drawViz(cell);
            if (!_print) {
                var _filter = UTIL.createFilterElement()
                $(div).append(_filter);

                d3.select(div).select('.filterData')
                    .on('click', applyFilter());

                d3.select(div).select('.removeFilter')
                    .on('click', clearFilter(div));

                _local_svg.select('g.lasso').remove()

                var lasso = d3Lasso.lasso()
                    .hoverSelect(true)
                    .closePathSelect(true)
                    .closePathDistance(100)
                    .items(cell)
                    .targetArea(_local_svg);

                lasso.on('start', onLassoStart(lasso, me))
                    .on('draw', onLassoDraw(lasso, me))
                    .on('end', onLassoEnd(lasso, me));

                _local_svg.call(lasso);
            }
        })

    }

    var drawViz = function (element) {
        if (!_print) {
            element.append('rect')
                .attr('rx', '3px')
                .attr('ry', '3px')
                .attr('class', 'bordered')
                .style('stroke', '#ffffff')
                .style('stroke-width', '2px')
                .attr('width', cellWidth - 1)
                .attr('height', cellHeight - 1)
                .transition()
                .ease(d3.easeQuadIn)
                .duration(COMMON.DURATION)
                .styleTween('fill', function (d) {
                    return d3.interpolateRgb('transparent', getFillColor(d));
                });

            element.on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
                .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
                .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
                .on('click', function (d) {
                    filter = false;
                    var confirm = d3.select(div).select('.confirm')
                        .style('visibility', 'visible');
                    var _filter = _localData.filter(function (d1) {
                        return d.y === d1[_dimension[0]]
                    })

                    var rect = d3.select(this).select('rect');

                    if (rect.classed('selected')) {
                        rect.classed('selected', false);
                    } else {
                        rect.classed('selected', true);
                    }

                    var _filterDimension = {};
                    if (broadcast.filterSelection.id) {
                        _filterDimension = broadcast.filterSelection.filter;
                    } else {
                        broadcast.filterSelection.id = $(div).attr('id');
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

                    var idWidget = broadcast.updateWidget[$(div).attr('id')];
                    broadcast.updateWidget = {};
                    broadcast.updateWidget[$(div).attr('id')] = idWidget;
                    broadcast.filterSelection.filter = _filterDimension;
                    var _filterParameters = filterParameters.get();
                    _filterParameters[dimension] = _filterDimension[dimension];
                    filterParameters.save(_filterParameters);
                });
        }
        else {
            element.append('rect')
                .attr('rx', '3px')
                .attr('ry', '3px')
                .attr('class', 'bordered')
                .style('stroke', '#ffffff')
                .style('stroke-width', '2px')
                .attr('width', cellWidth - 1)
                .attr('height', cellHeight - 1)
                .style('fill', function (d) {
                    return getFillColor(d);
                });
        }

        element.append('text')
            .attr('x', function (d) {
                return getValuePosition(d, cellWidth);
            })
            .attr('y', function (d) {
                return cellHeight / 2;
            })
            .text(function (d) {
                var si = numberFormat[_measure.indexOf(d.x)],
                    nf = UTIL.getNumberFormatter(si),
                    value;

                if (si == "Percent") {
                    // value = nf(d.val / me.helper.measuresTotal[d.x]);
                } else {
                    value = nf(d.val);
                }

                if (value.indexOf("G") != -1) {
                    value = value.slice(0, -1) + "B";
                }

                return value;
            })
            .style('fill', function (d) {
                return valueTextColour[_measure.indexOf(d.x)];
            })
            .attr('text-anchor', function (d) {
                return getValueTextAnchor(d);
            })
            .attr('visibility', function (d) {
                return showValues[_measure.indexOf(d.x)];
            })
            .style('font-style', function (d) {
                return fontStyleForMeasure[_measure.indexOf(d.x)];
            })
            .style('font-weight', function (d) {
                return fontWeightForMeasure[_measure.indexOf(d.x)];
            })
            .style('font-size', function (d) {
                return fontSizeForMeasure[_measure.indexOf(d.x)];
            });


        element.append('foreignObject')
            .attr('x', function (d) {
                return getIconPosition(d, cellWidth);
            })
            .attr('y', function (d) {
                return cellHeight / 2;;
            })
            .attr('visibility', function (d) {
                return UTIL.getVisibility(showIcon[_measure.indexOf(d.x)]);
            })
            .attr('width', cellWidth - 1)
            .attr('height', cellHeight - 1)
            .html(function (d) {
                return '<i class="' + iconName[_measure.indexOf(d.x)] + '" aria-hidden="true" style="font-weight:' + iconFontWeight[_measure.indexOf(d.x)] + ';color:' + iconColor[_measure.indexOf(d.x)] + '"></i>';
            });

    }

    chart.update = function (data) {
        _Local_data = data;
        filterData = [];

        var yElement = d3.set(data.map(function (item) { return item[_dimension[0]]; })).values();
        var xElement = d3.map();

        for (var i = 0; i < _measure.length; i++) {
            xElement.set(i, _measure[i]);
        }

        cellWidth = parseInt((width - margin.left - margin.right) / _measure.length),
            cellHeight = parseInt((height - margin.top - margin.bottom) / data.length);
        var offset = 6;
        var plot = _local_svg.select('.plot');

        plot.selectAll('.dimLabel').remove()

        var dimLabel = plot.selectAll('.dimLabel')
            .data(yElement)
            .enter().append('text')
            .attr('class', 'dimLabel')
            .text(function (d) { return d; })
            .text(function (d) {
                return d;
            })
            .attr('x', 0)
            .attr('y', function (d, i) { return i * cellHeight; })
            .attr('fill', dimLabelColor)
            .style('font-style', fontStyleForDimension)
            .style('font-weight', fontWeightForDimension)
            .style('font-size', fontSizeForDimension)
            .style('text-anchor', 'end')
            .attr('transform', 'translate(' + -offset + ',' + cellHeight / 1.75 + ')');

        yScale
            .domain(yElement)
            .range([0, yElement.length * cellHeight]);

        xScale
            .domain(xElement.entries().map(function (element) {
                return element.key + '_' + element.value;
            }))
            .range([0, xElement.size() * cellWidth]);

        data = transformData(data);

        var cell = plot.selectAll(".node")
            .data(data)

        var newCell = cell.enter().append('g')
            .attr('class', 'node')
            .attr('transform', function (d) {
                return 'translate(' + xScale(d.column + '_' + d.x) + ',' + yScale(d.y) + ')';
            });

        cell.exit().remove();

        cell = plot.selectAll('.node');

        if (!_print) {
            cell.select('rect')
                .attr('rx', '3px')
                .attr('ry', '3px')
                .attr('class', 'bordered')
                .style('stroke', '#ffffff')
                .style('stroke-width', '2px')
                .attr('width', cellWidth - 1)
                .attr('height', cellHeight - 1)
                .transition()
                .ease(d3.easeQuadIn)
                .duration(COMMON.DURATION)
                .styleTween('fill', function (d) {
                    return d3.interpolateRgb('transparent', getFillColor(d));
                });

        }
        else {
            cell.select('rect')
                .attr('rx', '3px')
                .attr('ry', '3px')
                .attr('class', 'bordered')
                .style('stroke', '#ffffff')
                .style('stroke-width', '2px')
                .attr('width', cellWidth - 1)
                .attr('height', cellHeight - 1)
                .style('fill', function (d) {
                    return d3.interpolateRgb('transparent', getFillColor(d));
                })
        }

        cell.select('text')
            .attr('x', function (d) {
                return getValuePosition(d, cellWidth);
            })
            .attr('y', function (d) {
                return cellHeight / 2;
            })
            .text(function (d) {
                var si = numberFormat[_measure.indexOf(d.x)],
                    nf = UTIL.getNumberFormatter(si),
                    value;

                if (si == "Percent") {
                    // value = nf(d.val / me.helper.measuresTotal[d.x]);
                } else {
                    value = nf(d.val);
                }

                if (value.indexOf("G") != -1) {
                    value = value.slice(0, -1) + "B";
                }

                return value;
            })
            .style('fill', function (d) {
                return valueTextColour[_measure.indexOf(d.x)];
            })
            .attr('text-anchor', function (d) {
                return getValueTextAnchor(d);
            })
            .attr('visibility', function (d) {
                return showValues[_measure.indexOf(d.x)];
            })
            .style('font-style', function (d) {
                return fontStyleForMeasure[_measure.indexOf(d.x)];
            })
            .style('font-weight', function (d) {
                return fontWeightForMeasure[_measure.indexOf(d.x)];
            })
            .style('font-size', function (d) {
                return fontSizeForMeasure[_measure.indexOf(d.x)];
            });

        cell.on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
            .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
            .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
            .on('click', function (d) {
                filter = false;
                var confirm = d3.select(div).select('.confirm')
                    .style('visibility', 'visible');
                var _filter = _localData.filter(function (d1) {
                    return d.y === d1[_dimension[0]]
                })
                var rect = d3.select(this).select('rect');
                if (rect.classed('selected')) {
                    rect.classed('selected', false);
                    filterData.map(function (val, i) {
                        if (val[_dimension[0]] == d[_dimension[0]]) {
                            filterData.splice(i, 1)
                        }
                    })
                } else {
                    rect.classed('selected', true);
                    var isExist = filterData.filter(function (val) {
                        if (val[_dimension[0]] == d[_dimension[0]]) {
                            return val
                        }
                    })
                    if (isExist.length == 0) {
                        filterData.push(_filter[0]);
                    }
                }
            });

        newCell.append('rect')
            .attr('rx', '3px')
            .attr('ry', '3px')
            .attr('class', 'bordered')
            .style('stroke', '#ffffff')
            .style('stroke-width', '2px')
            .attr('width', cellWidth - 1)
            .attr('height', cellHeight - 1)
            .transition()
            .ease(d3.easeQuadIn)
            .duration(COMMON.DURATION)
            .styleTween('fill', function (d) {
                return d3.interpolateRgb('transparent', getFillColor(d));
            });

        newCell.append('text')
            .attr('x', function (d) {
                return getValuePosition(d, cellWidth);
            })
            .attr('y', function (d) {
                return cellHeight / 2;
            })
            .text(function (d) {
                var si = numberFormat[_measure.indexOf(d.x)],
                    nf = UTIL.getNumberFormatter(si),
                    value;

                if (si == "Percent") {
                    // value = nf(d.val / me.helper.measuresTotal[d.x]);
                } else {
                    value = nf(d.val);
                }

                if (value.indexOf("G") != -1) {
                    value = value.slice(0, -1) + "B";
                }

                return value;
            })
            .style('fill', function (d) {
                return valueTextColour[_measure.indexOf(d.x)];
            })
            .attr('text-anchor', function (d) {
                return getValueTextAnchor(d);
            })
            .attr('visibility', function (d) {
                return showValues[_measure.indexOf(d.x)];
            })
            .style('font-style', function (d) {
                return fontStyleForMeasure[_measure.indexOf(d.x)];
            })
            .style('font-weight', function (d) {
                return fontWeightForMeasure[_measure.indexOf(d.x)];
            })
            .style('font-size', function (d) {
                return fontSizeForMeasure[_measure.indexOf(d.x)];
            });

        plot.selectAll('.node')
            .attr('transform', function (d) {
                return 'translate(' + xScale(d.column + '_' + d.x) + ',' + yScale(d.y) + ')';
            });

        _local_svg.select('g.lasso').remove()

        var lasso = d3Lasso.lasso()
            .hoverSelect(true)
            .closePathSelect(true)
            .closePathDistance(100)
            .items(cell)
            .targetArea(_local_svg);

        lasso.on('start', onLassoStart(lasso, div))
            .on('draw', onLassoDraw(lasso, div))
            .on('end', onLassoEnd(lasso, div));

        _local_svg.call(lasso);
    }

    chart._getName = function () {
        return _NAME;
    }

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
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

    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    }

    chart.dimLabelColor = function (value) {
        if (!arguments.length) {
            return dimLabelColor;
        }
        dimLabelColor = value;
        return chart;
    }

    chart.displayName = function (value) {
        if (!arguments.length) {
            return displayName;
        }
        displayName = value;
        return chart;
    }

    chart.fontWeightForDimension = function (value) {
        if (!arguments.length) {
            return fontWeightForDimension;
        }
        fontWeightForDimension = value;
        return chart;
    }

    chart.fontSizeForDimension = function (value) {
        if (!arguments.length) {
            return fontSizeForDimension;
        }
        fontSizeForDimension = value;
        return chart;
    }

    chart.fontStyleForDimension = function (value) {
        if (!arguments.length) {
            return fontStyleForDimension;
        }
        fontStyleForDimension = value;
        return chart;
    }

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    }

    chart.showValues = function (value, measure) {
        return UTIL.baseAccessor.call(showValues, value, measure, _measure);
    }
    chart.displayColor = function (value, measure) {
        return UTIL.baseAccessor.call(displayColor, value, measure, _measure);
    }
    chart.displayNameForMeasure = function (value, measure) {
        return UTIL.baseAccessor.call(displayNameForMeasure, value, measure, _measure);
    }
    chart.showIcon = function (value, measure) {
        return UTIL.baseAccessor.call(showIcon, value, measure, _measure);
    }
    chart.valuePosition = function (value, measure) {
        return UTIL.baseAccessor.call(valuePosition, value, measure, _measure);
    }
    chart.iconName = function (value, measure) {
        return UTIL.baseAccessor.call(iconName, value, measure, _measure);
    }
    chart.iconFontWeight = function (value, measure) {
        return UTIL.baseAccessor.call(iconFontWeight, value, measure, _measure);
    }
    chart.iconColor = function (value, measure) {
        return UTIL.baseAccessor.call(iconColor, value, measure, _measure);
    }
    chart.iconPosition = function (value, measure) {
        return UTIL.baseAccessor.call(iconPosition, value, measure, _measure);
    }
    chart.showIcon = function (value, measure) {
        return UTIL.baseAccessor.call(showIcon, value, measure, _measure);
    }

    chart.colourCoding = function (value, measure) {
        if (!arguments.length) {
            return colourCoding;
        }

        if (value instanceof Array && measure == void 0) {
            colourCoding = value.map(function (v) {
                return UTIL.getExpressionConfig(v, ['color']);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error('Invalid measure provided');
        }

        if (value == void 0) {
            return colourCoding[index];
        } else {
            colourCoding[index] = UTIL.getExpressionConfig(value, ['color']);
        }
    }
    chart.valueTextColour = function (value, measure) {
        return UTIL.baseAccessor.call(valueTextColour, value, measure, _measure);
    }
    chart.fontStyleForMeasure = function (value, measure) {
        return UTIL.baseAccessor.call(fontStyleForMeasure, value, measure, _measure);
    }
    chart.fontWeightForMeasure = function (value, measure) {
        return UTIL.baseAccessor.call(fontWeightForMeasure, value, measure, _measure);
    }
    chart.numberFormat = function (value, measure) {
        return UTIL.baseAccessor.call(numberFormat, value, measure, _measure);
    }
    chart.fontSizeForMeasure = function (value, measure) {
        return UTIL.baseAccessor.call(fontSizeForMeasure, value, measure, _measure);
    }

    chart.broadcast = function (value) {
        if (!arguments.length) {
            return broadcast;
        }
        broadcast = value;
        return chart;
    }

    chart.filterParameters = function (value) {
        if (!arguments.length) {
            return filterParameters;
        }
        filterParameters = value;
        return chart;
    }
    chart.notification = function (value) {
        if (!arguments.length) {
            return _notification;
        }
        _notification = value;
        return chart;
    }
    return chart;
}

module.exports = heatmap;
