var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var d3bullet = require('../../d3-libs/d3.bullet.js');
var UTIL = require('../extras/util.js')();
try {
    var d3Lasso = require("d3-lasso");

} catch (ex) { }
function bullet() {

    var _NAME = 'bullet';

    var _config,
        dimension,
        measures,
        fontStyle,
        fontWeight,
        fontSize,
        showLabel,
        showLabel,
        valueColor,
        targetColor,
        orientation,
        segments,
        segmentInfo,
        measureNumberFormat,
        targetNumberFormat,
        _tooltip,
        _sort,
        _print,
        broadcast,
        filterParameters;;

    var _local_svg, _Local_data, _originalData;

    var height, width, gWidth, gHeight, bullet;
    var margin = {
        top: 15,
        right: 0,
        bottom: 15,
        left: 0
    };

    var offset = 6, div;

    var filter = false, filterData = [], measuresSum, targetSum;

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measures(config.measures);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        this.fontSize(config.fontSize);
        this.showLabel(config.showLabel);
        this.valueColor(config.valueColor);
        this.targetColor(config.targetColor);
        this.orientation(config.orientation);
        this.segments(config.segments);
        this.segmentInfo(config.segmentInfo);
        this.measureNumberFormat(config.measureNumberFormat);
        this.targetNumberFormat(config.targetNumberFormat);

    }

    var _buildTooltipData = function (datum, chart) {
        var output = "";

        var measureNf = UTIL.getNumberFormatter(measureNumberFormat),
            targetNf = UTIL.getNumberFormatter(targetNumberFormat),
            measure,
            target;

        if (measureNumberFormat == "Percent") {
            measure = measureNf(datum.measures.toString() / measuresSum);
        } else {
            measure = measureNf(datum.measures.toString());
        }

        if (measure.indexOf('G') != -1) {
            measure = measure.slice(0, -1) + "B";
        }

        if (targetNumberFormat == "Percent") {
            target = targetNf(datum.markers.toString() / targetSum);
        } else {
            target = targetNf(datum.markers.toString());
        }

        if (target.indexOf('G') != -1) {
            target = target.slice(0, -1) + "B";
        }

        output += "<table><tr>"
            + "<th>" + chart.dimension() + ": </th>"
            + "<td>" + datum.title + "</td>"
            + "</tr><tr>"
            + "<th>" + 'Value' + ": </th>"
            + "<td>" + measure + "</td>"
            + "</tr><tr>"
            + "<th>" + "Target" + ": </th>"
            + "<td>" + target + "</td>"
            + "</tr>"
            + "</table>";

        return output;
    }

    var setMeasuresSum = function (val) {
        measuresSum = val;
    }

    var setTargetSum = function (val) {
        targetSum = val;
    }

    var onLassoStart = function (lasso, scope) {
        return function () {
            if (filter) {
                lasso.items().selectAll('rect.measure')
                    .classed('not_possible', true)
                    .classed('selected', false);
            }
        }
    }

    var onLassoDraw = function (lasso, scope) {
        return function () {
            filter = true;
            lasso.items().selectAll('rect.measure')
                .classed('selected', false);

            lasso.possibleItems().selectAll('rect.measure')
                .classed('not_possible', false)
                .classed('possible', true);

            lasso.notPossibleItems().selectAll('rect.measure')
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
                lasso.items().selectAll('rect.measure')
                    .classed('not_possible', false)
                    .classed('possible', false);
            }

            lasso.selectedItems().selectAll('rect.measure')
                .classed('selected', true)

            lasso.notSelectedItems().selectAll('rect.measure');

            var confirm = $(scope).parent().find('div.confirm')
                .css('visibility', 'visible');

            var _filter = [];
            if (data.length > 0) {
                data.forEach(function (d) {
                    var obj = new Object();
                    obj[dimension] = d.title;
                    obj[measures[0]] = d.measures.toString();
                    obj[measures[1]] = d.markers.toString();

                    _filter.push(obj)
                });
            }
            else {
                filterData = [];
            }
            if (_filter.length > 0) {
                filterData = _filter;
            }
            if (broadcast) {
                var idWidget = broadcast.updateWidget[scope.parentElement.id];
                broadcast.updateWidget = {};
                broadcast.updateWidget[scope.parentElement.id] = idWidget;

                var _filterList = {}, list = []

                filterData.map(function (val) {
                    list.push(val[dimension[0]])
                })
                _filterList[dimension[0]] = list
                broadcast.filterSelection.filter = _filterList;
                filterParameters.save(_filterList);
            }
        }
    }

    var applyFilter = function () {
        return function () {
            if (filterData.length > 0) {
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
    }

    var clearFilter = function (div) {
        return function () {
            chart.update(_originalData);
            d3.select(div).select('.confirm')
                .style('visibility', 'hidden');
        }
    }

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;
        return function (d, i) {

            d3.select(this).style('cursor', 'pointer')

            d3.select(this).select('.measure')
                .style('fill', targetColor)
                .style('stroke', valueColor)

            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, valueColor);
            }
        }
    }

    var _handleMouseMoveFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, valueColor);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {

            d3.select(this).style('cursor', 'default')

            d3.select(this).select('.measure')
                .style('fill', valueColor)
                .style('stroke', targetColor)

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }
    var getSegmentValues = function (endValue) {
        var me = this,
            _segments = [],
            d;

        d3.range(segments).forEach(function (i) {
            try {
                if (d = segmentInfo[i]['upto']) {
                    _segments.push(d);
                }
            } catch (e) {
                // pass
            }
        });

        if (segments[segments.length - 1] > endValue) {
            _segments.push(segments[segments.length - 1]);
        } else {
            _segments.push(endValue);
        }

        return _segments;
    }

    var getSegmentColors = function (scope) {

        var _segments = {},
            j = segments - 1;

        d3.range(segments).forEach(function (i) {
            try {
                _segments['.s' + j] = segmentInfo[i]['color'];
            } catch (e) {
                _segments['.s' + j] = "#efefef";
            } finally {
                j--;
            }
        });

        return _segments;
    }

    var getMargin = function (containerWidth) {
        var margin = {
            top: 15,
            bottom: 15
        };

        if (orientation == 'Horizontal') {
            if (showLabel) {
                margin['left'] = Math.floor(containerWidth / 8);
            } else {
                margin['left'] = 20;
            }
            margin['right'] = 20;
        } else if (orientation == 'Vertical') {
            margin['left'] = 15;
            margin['right'] = 15;
            margin['top'] = 30;
        }

        return margin;
    }
    var formatUsingCss = function (scope) {
        var bullet = scope.selectAll('.bullet'),
            range = scope.selectAll('.range');

        bullet.style('font', '9px sans-serif');
        bullet.selectAll('.marker')
            .style('stroke', targetColor)
            .style('stroke-width', '2px');

        bullet.selectAll('.tick line')
            .style('stroke', '#666')
            .style('stroke-width', '0.5px');

        bullet.selectAll('.measure').style('fill', valueColor);
        bullet.selectAll('.measure').classed('selected', false);
        //set from config
        //bullet.find('.title').css('font-size', '1.1em');

        if (orientation == 'Vertical') {
            bullet.selectAll('.tick text').each(function (i, d) {
                var text = d;
                //  $(d).text(UTIL.getTruncatedLabel(d, UTIL.shortScale(2)(UTIL.convertToNumber(text)), 25));
            });
        } else {
            bullet.selectAll('.tick text').each(function (i, d) {
                var text = d;
                //  $(d).text(UTIL.getTruncatedLabel(d, UTIL.shortScale(2)(UTIL.convertToNumber(text)), 25));
            });
        }

        var obj;
        for (var property in obj = getSegmentColors(this)) {
            if (obj.hasOwnProperty(property)) {
                range.filter(property).style('fill', obj[property]);
            }
        }
    }
    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {
            _originalData = _Local_data = data;
            div = d3.select(this).node().parentNode;

            var me = this;

            setMeasuresSum(UTIL.getSum(data, measures[0]));
            setTargetSum(UTIL.getSum(data, measures[1]));

            var svg = d3.select(this);
            width = +svg.attr('width');
            height = +svg.attr('height');

            svg.selectAll('g').remove();

            svg.attr('width', width)
                .attr('height', height);

            container = svg.append('g')
                .attr('class', 'plot')

            if (_tooltip) {
                tooltip = d3.select(this.parentNode).select('.custom_tooltip');
            }

            data = data.map(function (item) {
                var d = {};
                d.title = item[dimension[0]];
                d.ranges = getSegmentValues(
                    Math.floor(1.2 * Math.max.apply(Math, [item[measures[0]], item[measures[1]]]))
                );
                d.measures = [item[measures[0]]];
                d.markers = [item[measures[1]]];

                return d;
            });

            if (!_print) {
                bullet = d3bullet(_print)
                    .duration(COMMON.DURATION);
            }
            else {
                bullet = d3bullet(_print)
            }

            var margin = getMargin(width);
            gWidth = Math.floor((width - margin.left - margin.right) / data.length);
            gHeight = Math.floor((height - margin.top - margin.bottom) / data.length);
            offset = 6;
            if (orientation == 'Horizontal') {
                bullet.width(width - margin.left - margin.right);
                if (data.length == 1) {
                    bullet.height(Math.floor(3 * gHeight / 4));
                } else {
                    bullet.height(Math.floor(gHeight / 2));
                }
            } else if (orientation == 'Vertical') {
                bullet.width(height - margin.top - margin.bottom);
                if (data.length == 1) {
                    bullet.height(Math.floor(3 * gWidth / 4));
                } else {
                    bullet.height(Math.floor(gWidth / 2));
                }
            } else {
                throw "Invalid orientation";
            }

            var g = container.selectAll('g')
                .data(data)
                .enter().append('g')
                .attr('id', function (d, i) {
                    return 'group_' + div.id + '_' + i;
                })
                .attr('class', 'bullet')
                .attr('transform', function (d, i) {
                    if (orientation == 'Horizontal') {
                        return 'translate(' + margin.left + ',' + (margin.top + i * gHeight) + ') rotate(0)';
                    } else if (orientation == 'Vertical') {
                        return 'translate(' + (margin.left + i * gWidth) + ',' + (height - margin.top + offset) + ') rotate(-90)';
                    }

                })
                .call(bullet);

            var title = g.append('g')
                .style('text-anchor', function (d) {
                    if (orientation == 'Horizontal') {
                        return 'end';
                    } else if (orientation == 'Vertical') {
                        return 'middle';
                    }
                })
                .attr('display', showLabel ? "inherit" : "none")
                .attr('transform', function (d) {
                    if (orientation == 'Horizontal') {
                        return 'translate(' + -offset + ',' + Math.floor(gHeight / 3.25) + ')';
                    } else if (orientation == 'Vertical') {
                        return 'translate(' + -offset * 2 + ',' + Math.floor(gWidth / 3.25) + ')';
                    }
                })

            title.append('text')
                .attr('class', 'title')
                .style('font-style', fontStyle)
                .style('font-weight', fontWeight)
                .style('font-size', fontSize + 'px')
                .attr('transform', function (d) {
                    if (orientation == 'Horizontal') {
                        return 'rotate(0)';
                    } else if (orientation == 'Vertical') {
                        return 'rotate(90)';
                    }
                })
                .text(function (d) { return d.title; })
                .text(function (d) {
                    if (orientation == 'Horizontal') {
                        if (d.title.length > 3) {
                            return d.title.substring(0, 3) + '...';
                        }
                        return d.title;
                    } else if (orientation == 'Vertical') {
                        return UTIL.getTruncatedLabel(this, d.title, Math.floor(gWidth / 2), offset);
                    }
                });
            formatUsingCss(_local_svg);

            if (!_print) {

                d3.selectAll('g.bullet')
                    .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
                    .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
                    .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
                    .on('click', function (d) {

                        var confirm = d3.select(div).select('.confirm')
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
                    .items(g)
                    .targetArea(_local_svg);

                lasso.on('start', onLassoStart(lasso, me))
                    .on('draw', onLassoDraw(lasso, me))
                    .on('end', onLassoEnd(lasso, me));

                _local_svg.call(lasso);
            }
        });
    }
    chart._getName = function () {
        return _NAME;
    }

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
    }

    chart.update = function (data) {
        _Local_data = data;
        filterData = [];
        var svg = _local_svg;

        data = data.map(function (item) {
            var d = {};
            d.title = item[dimension[0]];
            d.ranges = getSegmentValues(
                Math.floor(1.2 * Math.max.apply(Math, [item[measures[0]], item[measures[1]]]))
            );
            d.measures = [item[measures[0]]];
            d.markers = [item[measures[1]]];

            return d;
        });
        var plot = svg.select('.plot')
        var _bullet = plot.selectAll('.bullet')
            .data(data);

        newBullet = _bullet.enter().append('g')
            .attr('class', 'bullet');

        var margin = getMargin(width);
        gWidth = Math.floor((width - margin.left - margin.right) / data.length);
        gHeight = Math.floor((height - margin.top - margin.bottom) / data.length);

        if (orientation == 'Horizontal') {
            bullet.width(width - margin.left - margin.right);
            if (data.length == 1) {
                bullet.height(Math.floor(3 * gHeight / 4));
            } else {
                bullet.height(Math.floor(gHeight / 2));
            }
        } else if (orientation == 'Vertical') {
            bullet.width(height - margin.top - margin.bottom);
            if (data.length == 1) {
                bullet.height(Math.floor(3 * gWidth / 4));
            } else {
                bullet.height(Math.floor(gWidth / 2));
            }
        } else {
            throw "Invalid orientation";
        }

        _bullet.exit().remove();

        _bullet = plot.selectAll('g.bullet');

        _bullet
            .classed('selected', false)
            .attr('transform', function (d, i) {
                if (orientation == 'Horizontal') {
                    return 'translate(' + margin.left + ',' + (margin.top + i * gHeight) + ') rotate(0)';
                } else if (orientation == 'Vertical') {
                    return 'translate(' + (margin.left + i * gWidth) + ',' + (height - margin.top + offset) + ') rotate(-90)';
                }

            })
            .call(bullet);

        newBullet
            .attr('id', function (d, i) {
                return 'group_' + div.id + '_' + i;
            })
            .attr('class', 'bullet')
            .attr('transform', function (d, i) {
                if (orientation == 'Horizontal') {
                    return 'translate(' + margin.left + ',' + (margin.top + i * gHeight) + ') rotate(0)';
                } else if (orientation == 'Vertical') {
                    return 'translate(' + (margin.left + i * gWidth) + ',' + (height - margin.top + offset) + ') rotate(-90)';
                }

            })
            .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
            .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
            .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
            .on('click', function (d) {
                filter = false;
                var confirm = d3.select(div).select('.confirm')
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

                var _filterDimension = {};
                if (broadcast.filterSelection.id) {
                    _filterDimension = broadcast.filterSelection.filter;
                } else {
                    broadcast.filterSelection.id = $(div).attr('id');
                }
                var dimension = _dimension[0];
                if (_filterDimension[dimension]) {
                    var temp = _filterDimension[dimension];
                    if (temp.indexOf(d.title) < 0) {
                        temp.push(d.title);
                    } else {
                        temp.splice(temp.indexOf(d.title), 1);
                    }
                    _filterDimension[dimension] = temp;
                } else {
                    _filterDimension[dimension] = [d.title];
                }

                var idWidget = broadcast.updateWidget[$(div).attr('id')];
                broadcast.updateWidget = {};
                broadcast.updateWidget[$(div).attr('id')] = idWidget;
                broadcast.filterSelection.filter = _filterDimension;
                var _filterParameters = filterParameters.get();
                _filterParameters[dimension] = _filterDimension[dimension];
                filterParameters.save(_filterParameters);
            })
            .call(bullet);

        plot.selectAll('.title').remove()
        var title = _bullet.append('g')
            .style('text-anchor', function (d) {
                if (orientation == 'Horizontal') {
                    return 'end';
                } else if (orientation == 'Vertical') {
                    return 'middle';
                }
            })
            .attr('display', showLabel ? "inherit" : "none")
            .attr('transform', function (d) {
                if (orientation == 'Horizontal') {
                    return 'translate(' + -offset + ',' + Math.floor(gHeight / 3.25) + ')';
                } else if (orientation == 'Vertical') {
                    return 'translate(' + -offset * 2 + ',' + Math.floor(gWidth / 3.25) + ')';
                }
            })

        title.append('text')
            .attr('class', 'title')
            .style('font-style', fontStyle)
            .style('font-weight', fontWeight)
            .style('font-size', fontSize + 'px')
            .attr('transform', function (d) {
                if (orientation == 'Horizontal') {
                    return 'rotate(0)';
                } else if (orientation == 'Vertical') {
                    return 'rotate(90)';
                }
            })
            .text(function (d) { return d.title; })
            .text(function (d) {
                if (orientation == 'Horizontal') {
                    if (d.title.length > 3) {
                        return d.title.substring(0, 3) + '...';
                    }
                    return d.title;
                } else if (orientation == 'Vertical') {
                    return UTIL.getTruncatedLabel(this, d.title, Math.floor(gWidth / 2), offset);
                }
            });

        formatUsingCss(_local_svg);

        _local_svg.select('g.lasso').remove()

        var lasso = d3Lasso.lasso()
            .hoverSelect(true)
            .closePathSelect(true)
            .closePathDistance(100)
            .items(_bullet)
            .targetArea(_local_svg);

        lasso.on('start', onLassoStart(lasso, div))
            .on('draw', onLassoDraw(lasso, div))
            .on('end', onLassoEnd(lasso, div));

        _local_svg.call(lasso);
    }

    chart.config = function (value) {
        if (!arguments.length) {
            return _config;
        }
        _config = value;
        _setConfigParams.call(chart, _config);
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
    chart.dimension = function (value) {
        if (!arguments.length) {
            return dimension;
        }
        dimension = value;
        return chart;
    }

    chart.measures = function (value) {
        if (!arguments.length) {
            return measures;
        }
        measures = value;
        return chart;
    }

    chart.fontStyle = function (value) {
        if (!arguments.length) {
            return fontStyle;
        }
        fontStyle = value;
        return chart;
    }
    chart.fontWeight = function (value) {
        if (!arguments.length) {
            return fontWeight;
        }
        fontWeight = value;
        return chart;
    }
    chart.fontSize = function (value) {
        if (!arguments.length) {
            return fontSize;
        }
        fontSize = value;
        return chart;
    }
    chart.showLabel = function (value) {
        if (!arguments.length) {
            return showLabel;
        }
        showLabel = value;
        return chart;
    }
    chart.valueColor = function (value) {
        if (!arguments.length) {
            return valueColor;
        }
        valueColor = value;
        return chart;
    }
    chart.targetColor = function (value) {
        if (!arguments.length) {
            return targetColor;
        }
        targetColor = value;
        return chart;
    }
    chart.orientation = function (value) {
        if (!arguments.length) {
            return orientation;
        }
        orientation = value;
        return chart;
    }
    chart.segments = function (value) {
        if (!arguments.length) {
            return segments;
        }
        segments = value;
        return chart;
    }
    chart.segmentInfo = function (value) {
        if (!arguments.length) {
            return segmentInfo;
        }
        segmentInfo = UTIL.getExpressionConfig(value, ['color']);;
        return chart;
    }
    chart.measureNumberFormat = function (value) {
        if (!arguments.length) {
            return measureNumberFormat;
        }
        measureNumberFormat = value;
        return chart;
    }
    chart.targetNumberFormat = function (value) {
        if (!arguments.length) {
            return targetNumberFormat;
        }
        targetNumberFormat = value;
        return chart;
    }

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
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

    return chart;
}

module.exports = bullet;
