var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var d3layoutcloud = require("../../d3-libs/d3.layout.cloud.js");
var Seedrandom = require("../../d3-libs/seedrandom.min.js");

var UTIL = require('../extras/util.js')();
var LEGEND = require('../extras/legend_barcharts.js')();

try {
    var d3Lasso = require("d3-lasso");

} catch (ex) { }


function rangefilter() {

    var _NAME = 'rangefilter';

    var _config,
        _dimension,
        _measure,
        _colorSet = [],
        _print,
        _displayNameForMeasure = [],
        _fontStyle = [],
        _fontWeight = [],
        _numberFormat = [],
        _textColor = [],
        _displayColor = [],
        _borderColor = [],
        _fontSize = [],
        _lineType = [],
        _pointType = [],
        _data;

    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 45
    };

    var tickLength = d3.scaleLinear()
        .domain([22, 34])
        .range([2, 4]);


    var _local_svg, _Local_data, _originalData;

    var x = d3.scalePoint(), y = d3.scaleLinear();

    var parentContainer, parentWidth, parentHeight, parentWidth, parentHeight, container, brush = d3.brushX();

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.colorSet(config.colorSet);
        this.labelColor(config.labelColor);
        this.displayNameForMeasure(config.displayNameForMeasure);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        this.numberFormat(config.numberFormat);
        this.textColor(config.textColor);
        this.displayColor(config.displayColor);
        this.borderColor(config.borderColor);
        this.fontSize(config.fontSize);

    }

    // var brushed = function () {
    //     var s = d3.event.selection,
    //         filterList = [];

    //     var filter = s.map(scale.invert, scale)
    // }

    var brushed = function () {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom

        // get bounds of selection
        var s = d3.event.selection,
            filterList = [];
        x.domain().forEach((d) => {
            var pos = x(d) + x.bandwidth() / 2;
            if (pos > s[0] && pos < s[1]) {
                filterList.push(d);
            }
        });
        _local_svg.select('.line')
            .attr("stroke", function (d) {
                if (filterList.indexOf(d[0].data["order_date"])) {
                    return 'pink';
                }
                else {
                    return 'rad';
                }
            })


        var updatedData = UTIL.getFilterDataForGrid(_data, filterList, _dimension[0]);

    }

    function chart(selection) {

        var dateList = _data.map(function (v) {
            return v[_dimension[0]];
        })
        dateList = UTIL.sortDateRange(dateList);
        data = _Local_data = _originalData = _data;

        if (_print) {
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

        _local_svg = svg;

        parentWidth = (width - 2 * COMMON.PADDING);
        parentHeight = (height - 2 * COMMON.PADDING);

        svg.attr('width', width)
            .attr('height', height)

        var maxDate = new Date(Math.max.apply(null, dateList));
        var minDate = new Date(Math.min.apply(null, dateList));

        var me = this;

        var plot = svg.append('g')
            .attr('class', 'daterange-plot')
            .classed('plot', true)
            .attr('transform', function () {
                return 'translate(' + 0 + ', ' + 0 + ')';
            });

        var labelStack = [];
        var keys = UTIL.getMeasureList(data[0], _dimension);

        x.rangeRound([0, parentWidth])
            .padding([0.5])
            .domain(data.map(function (d) { return d[_dimension[0]]; }));

        var range = UTIL.getMinMax(data, keys);

        y.rangeRound([parentHeight, 0])
            .domain([range[0], range[1]])
            .nice();

        brush.extent([[0, 0], [parentWidth, parentHeight]])
            .on("brush", brushed);

        var _localXLabels = data.map(function (d) {
            return d[_dimension[0]];
        });

        areaGenerator = d3.area()
            .curve(d3.curveLinear)
            .x(function (d, i) {
                return x(d['data'][_dimension[0]]) + x.bandwidth() / 2;
            })
            .y0(function (d, i) {
                return y(0);
            })
            .y1(function (d) {
                return y(d['data'][d['tag']]);
            });

        lineGenerator = d3.line()
            .curve(d3.curveLinear)
            .x(function (d, i) {
                return x(d['data'][_dimension[0]]) + x.bandwidth() / 2;
            })
            .y(function (d, i) {
                return y(d['data'][d['tag']]);
            });

        /* Axes */
        var xAxisGroup;
        var isRotate = false;

        // _localXAxis = d3.axisBottom(x)
        //     .tickSize(0)
        //     .tickFormat(function (d) {
        //         if (isRotate == false) {
        //             isRotate = UTIL.getTickRotate(d, (parentWidth) / (_localXLabels.length - 1), tickLength);
        //         }
        //         return UTIL.getTruncatedTick(d, (parentWidth) / (_localXLabels.length - 1), tickLength);
        //     })
        //     .tickPadding(10);

        // xAxisGroup = plot.append('g')
        //     .attr('class', 'x_axis')
        //     .attr('visibility', 'visible')
        //     .attr('transform', 'translate(0, ' + parentHeight + ')')
        //     .call(_localXAxis);

        plot.append("g")
            .attr("class", "x_brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", parentHeight);

        var clusterLine = plot.selectAll('.cluster_line')
            .data(keys.filter(function (m) { return labelStack.indexOf(m) == -1; }))
            .enter().append('g')
            .attr('class', 'cluster_line');

        var area = clusterLine.append('path')
            .datum(function (d, i) {
                return data.map(function (datum) { return { "tag": d, "data": datum }; });
            })
            .attr('class', 'area')
            .attr('fill', function (d, i) {
                return UTIL.getBorderColor(_measure.indexOf(d[0]['tag']), _borderColor);
            })
            .attr('visibility', function (d, i) {
                return 'visible';
            })
            .style('fill-opacity', 0.5)
            .attr('stroke', 'none')
            .style('stroke-width', 0)
            .style('opacity', 1)
            .attr('d', areaGenerator);

        var line = clusterLine.append('path')
            .classed('line-path', true)
            .datum(function (d, i) {
                return data.map(function (datum) { return { "tag": d, "data": datum }; });
            })
            .attr('class', 'line')
            .attr('stroke-dasharray', 'none')
            .style('fill', 'none')
            .attr('stroke', function (d, i) {
                return UTIL.getDisplayColor(_measure.indexOf(d[0]['tag']), _displayColor);
            })
            // .attr("stroke", function (d) {
            //     return (d.x > 50) ? 'red' : 'blue';
            // })
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', 1)
            .attr('d', lineGenerator)

        var point = clusterLine.selectAll('point')
            .data(function (d, i) {
                return data.map(function (datum) { return { "tag": d, "data": datum }; });
            })
            .enter().append('path')
            .attr('class', 'point')
            .attr('stroke', function (d, i) {
                return UTIL.getDisplayColor(_measure.indexOf(d.tag), _displayColor);
            })
            .attr('fill', function (d, i) {
                return UTIL.getBorderColor(_measure.indexOf(d.tag), _borderColor);
            })
            .attr('d', function (d, i) {
                return d3.symbol()
                    .type(d3.symbolCircle)
                    .size(10)();
            })
            .attr('transform', function (d) {
                return 'translate('
                    + (x(d['data'][_dimension[0]]) + x.bandwidth() / 2)
                    + ',' + y(d['data'][d['tag']]) + ')';
            })
    }

    chart._getName = function () {
        return _NAME;
    }

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
    }

    chart.update = function (data) {

        _local_svg.selectAll('text').remove();

        drawPlot(data);
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

    chart.colorSet = function (value) {
        if (!arguments.length) {
            return _colorSet;
        }
        _colorSet = value;
        return chart;
    }

    chart.labelColor = function (value) {
        if (!arguments.length) {
            return _labelColor;
        }
        _labelColor = value;
        return chart;
    }
    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    }
    chart.showValues = function (value, measure) {
        return UTIL.baseAccessor.call(_showValues, value, measure, _measure);
    }

    chart.displayNameForMeasure = function (value, measure) {
        return UTIL.baseAccessor.call(_displayNameForMeasure, value, measure, _measure);
    }

    chart.fontStyle = function (value, measure) {
        return UTIL.baseAccessor.call(_fontStyle, value, measure, _measure);
    }

    chart.fontWeight = function (value, measure) {
        return UTIL.baseAccessor.call(_fontWeight, value, measure, _measure);
    }

    chart.numberFormat = function (value, measure) {
        return UTIL.baseAccessor.call(_numberFormat, value, measure, _measure);
    }

    chart.textColor = function (value, measure) {
        return UTIL.baseAccessor.call(_textColor, value, measure, _measure);
    }

    chart.displayColor = function (value, measure) {
        return UTIL.baseAccessor.call(_displayColor, value, measure, _measure);
    }

    chart.borderColor = function (value, measure) {
        return UTIL.baseAccessor.call(_borderColor, value, measure, _measure);
    }

    chart.fontSize = function (value, measure) {
        return UTIL.baseAccessor.call(_fontSize, value, measure, _measure);
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
    chart.isLiveEnabled = function (value) {
        if (!arguments.length) {
            return isLiveEnabled;
        }
        isLiveEnabled = value;
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
    return chart;

}
module.exports = rangefilter;
