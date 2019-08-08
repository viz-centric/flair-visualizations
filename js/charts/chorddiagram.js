var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var UTIL = require('../extras/util.js')();
var LEGEND = require('../extras/legend_barcharts.js')();
var viz = require('../../d3-libs/viz.js');
try {
    var d3Lasso = require("d3-lasso");
} catch (ex) { }

function chorddiagram() {
    var _NAME = 'chorddiagram';

    var _config,
        _dimension,
        _measure,
        _sort,
        _tooltip,
        _showLabels,
        _fontStyle,
        _fontWeight,
        _numberFormat,
        _labelColor,
        _colorPattern,
        _fontSize,
        _print,
        broadcast,
        filterParameters,
        isAnimationDisable = false,
        _notification = false,
        _data;

    var _local_svg, svgFilter, _Local_data, _originalData, _localLabelStack = [], legendBreakCount = 1, yScale = d3.scaleLinear();
    var _localXAxis,
        _localYAxis,
        _localXGrid,
        _localYGrid;
    var parentWidth, parentHeight, plotWidth, plotHeight, container, tooltip;

    var colors = UTIL.defaultColours();

    var x0 = d3.scaleBand(), x1 = d3.scaleBand(), _xDimensionGrid = d3.scaleLinear(), y = d3.scaleLinear();

    var _x0 = d3.scaleBand(), _x1 = d3.scaleBand(), _y = d3.scaleLinear(), brush = d3.brushX();

    var gradientColor = d3.scaleOrdinal();

    var BASE_COLOR = "#aec7e8", GRADIENT_COLOR = ['#ff9696', '#bc2f2f'];

    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 45
    };

    var tickLength = d3.scaleLinear()
        .domain([22, 34])
        .range([2, 4]);

    var legendSpace = 20, axisLabelSpace = 20, offsetX = 16, offsetY = 3, parentContainer;

    var threshold = [];
    var filter = false, filterData = [];

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.showLabels(config.showLabels);
        this.colorPattern(config.colorPattern);
        this.showLabels(config.showLabels);
        this.labelColor(config.labelColor);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        this.numberFormat(config.numberFormat);
        this.fontSize(config.fontSize);
    }

    var setDefaultColorForChart = function () {
        for (let index = 0; index < _measure.length; index++) {
            if (_displayColor[index] == null || _displayColor[index] == undefined) {
                _displayColor[index] = COMMON.COLORSCALE(index);
            }
            if (_borderColor[index] == null || _borderColor[index] == undefined) {
                _borderColor[index] = COMMON.COLORSCALE(index);
            }
        }
    }

    var _buildTooltipData = function (datum, chart) {
        var output = "";

        var filter = _local_svg.selectAll('.chord')
            .filter(function (d1) {
                return (d1.source == datum.source || d1.target == datum.source)
            })
        output += "<table>";
        for (let index = 0; index < filter.data().length; index++) {
            if (filter.data()[index].value > 0) {
                output += "<tr>";
                output += "<td>" + filter.data()[index].source + "</td><td>" + filter.data()[index].target + "</td><td>" + filter.data()[index].value + "</td>";
                output += "</tr>";
            }
        }
        output += "</table > ";

        return output;
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

            var confirm = d3.select(scope.node().parentNode).select('div.confirm')
                .style('visibility', 'visible')

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
            else {
                filterData = [];
            }

            if (_filter.length > 0) {
                filterData = _filter;
            }

            if (broadcast) {
                var idWidget = broadcast.updateWidget[scope.node().parentNode.id];
                broadcast.updateWidget = {};
                broadcast.updateWidget[scope.node().parentNode.id] = idWidget;

                var _filterList = {}, list = []

                filterData.map(function (val) {
                    list.push(val[_dimension[0]])
                })

                var _filterDimension = {};
                if (broadcast.filterSelection.id) {
                    _filterDimension = broadcast.filterSelection.filter;
                } else {
                    broadcast.filterSelection.id = parentContainer.attr('id');
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

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {

            filter = container.selectAll('.chord')
                .filter(function (d1) {
                    return !(d1.source == d.source || d1.target == d.source)
                })

            filter.selectAll('path').style('opacity', 0);

            var border = d3.select(this).attr('fill')
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
                var border = d3.select(this).attr('fill')
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, border);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            filter = container.selectAll('.chord')
                .filter(function (d1) {
                    return !(d1.source == d.source || d1.target == d.source)
                })

            filter.selectAll('path').style('opacity', 0.8);

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }

    setColorDomain = function (groups) {
        var values = groups.map(function (item) { return item.value; });

        var domain = [],
            range = [];

        var color = d3.scaleLinear()
            .domain([Math.min.apply(Math, values), Math.max.apply(Math, values)])
            .range(GRADIENT_COLOR);

        groups.sort(function (a, b) {
            return (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0);
        });

        groups.forEach(function (item) {
            domain.push(item.index);
            range.push(color(item.value));
        })

        gradientColor.domain(domain);
        gradientColor.range(range);
    }

    getFillColor = function (obj, index) {
        if (_colorPattern == 'single_color') {
            return colors[0];
        } else if (_colorPattern == 'unique_color') {
            var r = parseInt(Math.abs(Math.sin(2 * index + 100)) * 255),
                g = parseInt(Math.abs(Math.cos(index + 75)) * 255),
                b = parseInt(Math.abs(Math.sin(7 * index + 30)) * 255);
            return d3.rgb(r, g, b);
        } else if (_colorPattern == 'gradient_color') {
            return gradientColor(index);
        }
    }

    function chart(selection) {

        data = UTIL.sortingData(_data, _dimension[0])
        _Local_data = _originalData = data;

        var me = this;

        if (_print && !_notification) {
            parentContainer = selection;
        }
        else {
            parentContainer = d3.select('#' + selection.id)
        }

        var svg = parentContainer.append('svg')
            .attr('width', parentContainer.attr('width'))
            .attr('height', parentContainer.attr('height'))

        var width = +svg.attr('width'),
            height = +svg.attr('height');

        parentContainer.append('div')
            .attr('class', 'custom_tooltip');

        _local_svg = svg;

        svg.selectAll('g').remove();

        if (_tooltip) {
            tooltip = parentContainer.select('.custom_tooltip');
        }


        svg = svg.attr('width', width)
            .attr('height', height);

        var outerRadius = Math.min(width, height) * 0.5 - 15,
            innerRadius = outerRadius - 20;


        //var people = ['Lenovo', 'Vivo', 'LG', 'Oppo', 'NOKIA', 'Samsung', 'OnePlus', 'Apple', 'HTC'];
        var people = [],
            chorddata = [];
        data.map(function (val) {
            people.push(val[_dimension[0]]);
            people.push(val[_dimension[1]]);
        })
        people = people.filter(function (item, i, ar) {
            return ar.indexOf(item) === i;
        });

        data.map(function (val) {
            var arr = []
            arr.push(val[_dimension[0]])
            arr.push(val[_dimension[1]])
            arr.push(val[_measure])
            chorddata.push(arr)
        })

        //keep data for testing

        // var chorddata = [
        //     ['Lenovo', 'Vivo', 30],
        //     ['Vivo', 'Lenovo', 30],
        //     ['LG', 'Oppo', 30],
        //     ['Oppo', 'Samsung', 30],
        //     ['NOKIA', 'OnePlus', 30],
        //     ['NOKIA', 'Oppo', 30],
        //     ['OnePlus', 'NOKIA', 30],
        //     ['Samsung', 'NOKIA', 30],
        //     ['Samsung', 'Oppo', 30],
        //     ['Oppo', 'OnePlus', 30],
        //     ['OnePlus', 'Oppo', 30],
        //     ['Lenovo', 'Samsung', 30],
        //     ['Samsung', 'Lenovo', 30],
        //     ['Lenovo', 'Oppo', 30],
        //     ['Oppo', 'Lenovo', 30],
        //     ['Apple', 'Lenovo', 30],
        //     ['Vivo', 'Samsung', 30],
        //     ['Vivo', 'Oppo', 30],
        //     ['Oppo', 'Vivo', 30],
        //     ['Vivo', 'OnePlus', 30],
        //     ['OnePlus', 'Vivo', 30],
        //     ['HTC', 'Oppo', 30],
        //     ['HTC', 'Vivo', 30],
        //     ['Oppo', 'HTC', 30],
        //     ['Oppo', 'Vivo', 30]
        // ]

        function sort(a, b) { return d3.ascending(sortOrder.indexOf(a), sortOrder.indexOf(b)); }

        var sortOrder = people.sort();
        var i = 0;
        var ch = viz.ch().data(chorddata)
            .padding(.01)
            .sort(sort)
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .duration(_print == true ? 0 : 1000)
            .chordOpacity(0.8)
            .labelPadding(.03)
            .fill(function (d) {
                if (_colorPattern == "unique_color") {
                    return colors[sortOrder.indexOf(d)];
                }
                else if (_colorPattern == "single_color") {
                    return colors[0];
                }
                else {

                }

            });

        svg.append("g")
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
            .attr('class', 'plot')
            .call(ch);

        parentContainer.selectAll('.groups text')
            .style('fill', _labelColor)
            .style('visibility', UTIL.getVisibility(_showLabels))
            .style('font-size', _fontSize)
            .style('font-style', _fontStyle)
            .style('font-weight', _fontWeight)

        parentContainer.selectAll('.groups')
            .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
            .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
            .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))

    }  


    chart._legendInteraction = function (event, data, plot) {
        if (_print) {
            // No interaction during print enabled
            return;
        }
        switch (event) {
            case 'mouseover':
                _legendMouseOver(data, plot);
                break;
            case 'mousemove':
                _legendMouseMove(data, plot);
                break;
            case 'mouseout':
                _legendMouseOut(data, plot);
                break;
            case 'click':
                _legendClick(data, plot);
                break;
        }
    }

    var _legendMouseOver = function (data, plot) {

        plot.selectAll('g.clusteredverticalbar')
            .filter(function (d) {
                return d.measure === data;
            })
            .select('rect')
            .style('fill', COMMON.HIGHLIGHTER);
    }

    var _legendMouseMove = function (data, plot) {

    }

    var _legendMouseOut = function (data, plot) {
        plot.selectAll('g.clusteredverticalbar')
            .filter(function (d) {
                return d.measure === data;
            })
            .select('rect')
            .style('fill', function (d, i) {
                if (d[d.measure] < 0) {
                    return UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor);
                }
                else {
                    return UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor);
                }
            });
    }

    var _legendClick = function (data, plot) {
        var _filter = UTIL.getFilterData(_localLabelStack, data, _Local_data)
        drawPlot.call(this, _filter);
    }

    chart._getName = function () {
        return _NAME;
    }

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
    }

    chart.update = function (data, filterConfig) {

        var svg = _local_svg
            .attr('width', parentContainer.attr('width'))
            .attr('height', parentContainer.attr('height'))

        width = +svg.attr('width'),
            height = +svg.attr('height');

        if (_tooltip) {
            tooltip = parentContainer.select('.custom_tooltip');
        }

        _local_svg.selectAll('.plot g').remove();
        var plot = _local_svg.selectAll('.plot');

        var outerRadius = Math.min(width, height) * 0.5 - 15,
            innerRadius = outerRadius - 20;

        //var people = ['Lenovo', 'Vivo', 'LG', 'Oppo', 'NOKIA', 'Samsung', 'OnePlus', 'Apple', 'HTC'];
        var people = [],
            chorddata = [];
        data.map(function (val) {
            people.push(val[_dimension[0]]);
        })
        people = people.filter(function (item, i, ar) {
            return ar.indexOf(item) === i;
        });

        data.map(function (val) {
            var arr = []
            arr.push(val[_dimension[0]])
            arr.push(val[_dimension[1]])
            arr.push(val[_measure])
            chorddata.push(arr)
        })

        function sort(a, b) { return d3.ascending(sortOrder.indexOf(a), sortOrder.indexOf(b)); }

        var sortOrder = people.sort();

        var i = 0;
        var ch = viz.ch().data(chorddata)
            .padding(.01)
            .sort(sort)
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .duration(1000)
            .chordOpacity(0.8)
            .labelPadding(.03)
            .fill(function (d) {
                if (_colorPattern == "unique_color") {
                    return colors[sortOrder.indexOf(d)];
                }
                else if (_colorPattern == "single_color") {
                    return colors[0];
                }
                else {

                }

            });

        plot.call(ch);

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

    chart.showLabels = function (value) {
        if (!arguments.length) {
            return _showLabels;
        }
        _showLabels = value;
        return chart;
    }

    chart.fontSize = function (value) {
        if (!arguments.length) {
            return _fontSize;
        }
        _fontSize = value;
        return chart;
    }

    chart.fontStyle = function (value) {
        if (!arguments.length) {
            return _fontSize;
        }
        _fontSize = value;
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

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    }
    chart.colorPattern = function (value) {
        if (!arguments.length) {
            return _colorPattern;
        }
        _colorPattern = value;
        return chart;
    }
    chart.labelColor = function (value) {
        if (!arguments.length) {
            return _labelColor;
        }
        _labelColor = value;
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

    chart.isAnimationDisable = function (value) {
        if (!arguments.length) {
            return isAnimationDisable;
        }
        isAnimationDisable = value;
        return chart;
    }
    chart.notification = function (value) {
        if (!arguments.length) {
            return _notification;
        }
        _notification = value;
        return chart;
    }
    chart.data = function (value) {
        if (!arguments.length) {
            return _data;
        }
        _data = value;
        return chart;
    }
    chart.isFilterGrid = function (value) {
        if (!arguments.length) {
            return _isFilterGrid;
        }
        _isFilterGrid = value;
        return chart;
    }
    return chart;
}

module.exports = chorddiagram;