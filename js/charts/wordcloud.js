var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var d3layoutcloud = require("../../d3-libs/d3.layout.cloud.js");
var Seedrandom = require("../../d3-libs/seedrandom.min.js");

var UTIL = require('../extras/util.js')();
var LEGEND = require('../extras/legend_barcharts.js')();

try {
    var d3Lasso = require("d3-lasso");

} catch (ex) { }


function wordcloud() {

    var _NAME = 'wordcloud';

    var _config,
        _dimension,
        _measure,
        _colorSet = [],
        _tooltip,

        _print,
        broadcast,
        filterParameters,
        isAnimationDisable = false,
        _notification = false,
        _data;

    var x = d3.scaleBand(), y = d3.scaleLinear();
    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 45
    };

    var _local_svg, _Local_data, _originalData

    var tickLength = d3.scaleLinear()
        .domain([22, 34])
        .range([2, 4]);

    var legendSpace = 20, axisLabelSpace = 20, offsetX = 16, offsetY = 3, parentContainer;
    var parentWidth, parentHeight, plotWidth, plotHeight, container;

    var filter = false, filterData = [];
    var threshold = [];

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.colorSet(config.colorSet);
    }

    var _buildTooltipData = function (datum, chart) {
        var output = "";
        output += "<table><tr>"
            + "<th>" + chart.dimension() + ": </th>"
            + "<td>" + datum.data[chart.dimension()] + "</td>"
            + "</tr><tr>"
            + "<th>" + datum.key + ": </th>"
            + "<td>" + UTIL.getFormattedValue(datum.data[datum.key], UTIL.getValueNumberFormat(_measure.indexOf(datum.key), _numberFormat, datum.data[datum.key])) + " </td>"
            + "</tr></table>";

        return output;
    }

    var setData = function (data) {
        var result = [];
        data.map(function (d) {
            var value = new Object();
            value['text'] = d[_dimension];
            value['size'] = d[_measure];
            result.push(value);
        })
        return result;
    }

    function chart(selection) {

        data = UTIL.sortingData(_data, _dimension[0])
        _Local_data = _originalData = data;

        parentContainer = d3.select('#' + selection.id)

        var svg = parentContainer.append('svg')
            .attr('width', parentContainer.attr('width'))
            .attr('height', parentContainer.attr('height'))

        var width = +svg.attr('width'),
            height = +svg.attr('height');

        _local_svg = svg;

        parentWidth = width - 2 * COMMON.PADDING;
        parentHeight = (height - 2 * COMMON.PADDING);

        container = svg.append('g')
            .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

        svg.attr('width', width)
            .attr('height', height)

        // var data = [
        //     { text: 'javascript', size: 40888 },
        //     { text: 'D3.js', size: 15 },
        //     { text: 'coffeescript', size: 28885 },
        //     { text: 'shaving sheep', size: 28885 },
        //     { text: 'AngularJS', size: 88830 },
        //     { text: 'Ruby', size: 38880 },
        //     { text: 'ECMAScript', size: 15777 },
        //     { text: 'Actionscript', size: 17770 },
        //     { text: 'Linux', size: 27770 },
        //     { text: 'C++', size: 24440 },
        //     { text: 'C#', size: 25444 },
        //     { text: 'JAVA', size: 34448 },
        //     // just copy twice for extra data, else the cloud is a little boring
        //     { text: 'javascript1', size: 40000 },
        //     { text: 'd3.js1', size: 10005 },
        //     { text: 'coffeescript1', size: 44425 },
        //     { text: 'shaving sheep1', size: 44425 },
        //     { text: 'angularjs1', size: 11130 },
        //     { text: 'ruby1', size: 31110 },
        //     { text: 'ecmascript1', size: 11115 },
        //     { text: 'actionscript1', size: 11110 },
        //     { text: 'linux1', size: 20000 },
        //     { text: 'c++1', size: 20000 },
        //     { text: 'c#1', size: 20005 },
        //     { text: 'java1', size: 30008 },
        //     { text: 'javascript2', size: 40000 },
        //     { text: 'd3.js2', size: 10005 },
        //     { text: 'coffeescript2', size: 25000 },
        //     { text: 'shaving sheep2', size: 25000 },
        //     { text: 'angularjs2', size: 30000 },
        //     { text: 'ruby2', size: 30000 },
        //     { text: 'ecmascript2', size: 15000 },
        //     { text: 'actionscript2', size: 10000 },
        //     { text: 'linux2', size: 20000 },
        //     { text: 'c+2+', size: 20000 },
        //     { text: 'c#2', size: 25000 },
        //     { text: 'java2', size: 38000 }
        // ];

        drawPlot.call(this, data);
    }


    var drawPlot = function (data) {
        var me = this;
        if (_tooltip) {
            //  tooltip = d3.select(div).select('.custom_tooltip');
        }
        Seedrandom('heo.');
        var words = setData(data);
        var maxSize = d3.max(words, function (d) { return d.size; });
        var minSize = d3.min(words, function (d) { return d.size; });
        var fontSizeScale = d3.scalePow().exponent(5).domain([0, 1]).range([30, 150]);
        var plot = container.append('g')
            .attr('class', 'stackedverticalbar-plot')
            .classed('plot', true)

        d3layoutcloud()
            .size([parentWidth, parentHeight])
            .words(words)
            .rotate(function() { return ~~(Math.random() * 2) * 90; })
            .font("Impact")
            .fontSize(function (d) {
                return fontSizeScale(d.size / maxSize);;
            })
            .on("end", drawSkillCloud)
            .start();

        // Finally implement `drawSkillCloud`, which performs the D3 drawing:

        // apply D3.js drawing API
        function drawSkillCloud(words) {
            _local_svg
                .append("g")
                .attr("transform", "translate(" + ~~(parentWidth / 2) + "," + ~~(parentHeight / 2) + ")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function (d) {
                    return d.size + "px";
                })
                .style("-webkit-touch-callout", "none")
                .style("-webkit-user-select", "none")
                .style("-khtml-user-select", "none")
                .style("-moz-user-select", "none")
                .style("-ms-user-select", "none")
                .style("user-select", "none")
                .style("cursor", "default")
                .style("font-family", "Impact")
                .style("fill", function (d, i) {
                    return _colorSet[i];
                })
                .attr("text-anchor", "middle")
                .attr("transform", function (d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function (d) {
                    return d.text;
                });
        }
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

    chart.colorSet = function (value) {
        if (!arguments.length) {
            return _colorSet;
        }
        _colorSet = value;
        return chart;
    }

    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
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
    return chart;

}
module.exports = wordcloud;
