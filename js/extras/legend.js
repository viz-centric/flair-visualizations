var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var UTIL = require('../extras/util.js')();

function legend() {
    return function (data, selection, extraParams, localLabelStack) {
        if (extraParams.labelStack == void 0) {
            extraParams.labelStack = [];
        }

        var me = this;

        var width = 12,
            height = 12;

        var legend = selection.append('g')
            .attr('id', function () {
                return me._getName() + '-legend';
            })
            .attr('class', 'legend')
            .attr('display', 'block');

        var legendItem = legend.selectAll('.item')
            .data(data)
            .enter().append('g')
            .attr('class', 'item')
            .attr('id', function (d, i) {
                return me._getName() + '-legend-item' + i;
            })
            .attr('transform', function (d, i) {
                var translate = [0, 0];

                switch (me.legendPosition().toUpperCase()) {
                    case 'TOP':
                        translate = [i * Math.floor(extraParams.width / data.length), 0];
                        break;
                    case 'BOTTOM':
                        translate = [i * Math.floor(extraParams.width / data.length), (extraParams.height - COMMON.PADDING)];
                        break;
                    case 'RIGHT':
                        translate = [(4 / 5) * extraParams.width, i * 20];
                        break;
                    case 'LEFT':
                        translate = [0, i * 20];
                }

                return 'translate(' + translate.toString() + ')';
            })
            .on('mouseover', function (d, i) {
                var k = d3.select(this.parentNode),
                    plot = d3.select(k.node().parentNode).select('.plot')
                d3.select(this).attr('cursor', 'pointer');
                me._legendInteraction('mouseover', d, plot);
            })
            .on('mousemove', function (d, i) {
                var k = d3.select(this.parentNode),
                    plot = d3.select(k.node().parentNode).select('.plot')
                d3.select(this).attr('cursor', 'pointer');
                me._legendInteraction('mousemove', d, plot);
            })
            .on('mouseout', function (d, i) {
                var k = d3.select(this.parentNode),
                    plot = d3.select(k.node().parentNode).select('.plot')
                d3.select(this).attr('cursor', 'pointer');
                me._legendInteraction('mouseout', d, plot);
            })
            .on('click', function (d, i) {
                var rect = d3.select(this).select('rect'),
                    o = parseInt(rect.style('fill-opacity'));

                if (!o) {
                    rect.style('fill-opacity', 1)
                        .style('stroke-width', 0);
                } else {
                    rect.style('fill-opacity', 0)
                        .style('stroke-width', 1);
                }

                me._legendInteraction('click', d);
            });

        legendItem.append('rect')
            .attr('width', width)
            .attr('height', height)
            .style('fill', function (d, i) {
                if (typeof d == 'string') {
                    return COMMON.COLORSCALE(d);
                }
                return COMMON.COLORSCALE(d[me.dimension()]);
            })
            // .style('fill-opacity', function (d, i) {
            //     if (typeof d == 'string') {
            //         return extraParams.labelStack.indexOf(d) == -1 ? 1 : 0;
            //     }
            //     return extraParams.labelStack.indexOf(d[me.dimension()]) == -1 ? 1 : 0;
            // })
            .style('fill-opacity', function (d, i) {
                if (localLabelStack.length > 0) {
                    if (localLabelStack.indexOf(d[me.dimension()]) >= 0) {
                        return 0.5;
                    }
                }
            })
            .style('stroke-width', 1)
            .style('stroke', function (d, i) {
                if (typeof d == 'string') {
                    return COMMON.COLORSCALE(d);
                }
                return COMMON.COLORSCALE(d[me.dimension()]);
            });

        legendItem.append('text')
            .attr('x', 18)
            .attr('y', 10)
            .text(function (d) {
                if (typeof d == 'string') {
                    return d;
                }
                if (me.print() == false) {
                    return d[me.dimension()]
                }
                return d[me.dimension()].toString().substring(0, 5) + "...";
            })
            .text(function (d) {
                if (me.print() == false) {
                    if ((me.legendPosition().toUpperCase() == 'TOP') || (me.legendPosition().toUpperCase() == 'BOTTOM')) {
                        return UTIL.getTruncatedLabel(this, d[me.dimension()], Math.floor(extraParams.width / data.length) - 10);
                    } else if ((me.legendPosition().toUpperCase() == 'LEFT') || (me.legendPosition().toUpperCase() == 'RIGHT')) {
                        return UTIL.getTruncatedLabel(this, d[me.dimension()], extraParams.width / 5);
                    }
                }
                else {
                    if (typeof d == 'string') {
                        return d[me.dimension()].toString().substring(0, 5) + "...";;
                    }
                    return d[me.dimension()].toString().substring(0, 5) + "...";
                }
            })
            .style('fill', COMMON.LEGEND_COLOR)
            .style('font-weight', 'bold')

        var legendWidth = legend.node().getBBox().width,
            legendHeight = legend.node().getBBox().height;

        legendItem.attr('transform', function (d, i) {
            var translate = [0, 0];

            switch (me.legendPosition().toUpperCase()) {
                case 'TOP':
                    translate = [i * Math.floor(extraParams.width / data.length), 0];
                    break;
                case 'BOTTOM':
                    translate = [i * Math.floor(extraParams.width / data.length), (extraParams.height - COMMON.PADDING)];
                    break;
                case 'RIGHT':
                    /* For pie and doughnut chart vertically center the legend items */
                    if (me._getName() == 'pie' || me._getName() == 'doughnut') {
                        translate = [(4 / 5) * extraParams.width, ((extraParams.height / 2) - (legendHeight / 2) + i * 20)];
                    } else {
                        translate = [(extraParams.width - legendWidth), i * 20];
                    }
                    break;
                case 'LEFT':
                    /* For pie and doughnut chart vertically center the legend items */
                    if (me._getName() == 'pie' || me._getName() == 'doughnut') {
                        translate = [0, ((extraParams.height / 2) - (legendHeight / 2) + i * 20)];
                    } else {
                        translate = [0, i * 20];
                    }
            }

            return 'translate(' + translate.toString() + ')';
        });
        var legendBreak = 0,
            legendBreakCount = 0;
        if ((me.legendPosition().toUpperCase() == 'BOTTOM' || me.legendPosition().toUpperCase() == 'TOP') && me.print() == false) {
            legendItem.attr('transform', function (d, i) {
                var count = i,
                    widthSum = 0
                while (count-- != 0) {
                    widthSum += selection.select('#' + me._getName() + '-legend-item' + count).node().getBBox().width + 16;
                }
                if ((widthSum + 100) > extraParams.width) {
                    widthSum = 0;
                    if (legendBreak == 0) {
                        legendBreak = i;
                        legendBreakCount = legendBreakCount + 1;
                    }
                    if (i == (legendBreak * (legendBreakCount + 1))) {
                        legendBreakCount = legendBreakCount + 1;
                    }
                    var newcount = i - (legendBreak * legendBreakCount);
                    while (newcount-- != 0) {
                        widthSum += d3.select('#' + me._getName() + '-legend-item' + newcount).node().getBBox().width + 16;
                    }
                    return 'translate(' + widthSum + ', ' + (me.legendPosition().toUpperCase() == 'TOP' ? legendBreakCount * 20 : (extraParams.height - (legendBreakCount * 20))) + ')';


                }
                return 'translate(' + widthSum + ', ' + (me.legendPosition().toUpperCase() == 'TOP' ? 0 : extraParams.height) + ')';
            });
            extraParams.height = extraParams.height - (20 * legendBreakCount);
        }

        return {
            legendWidth: legend.node().getBBox().width,
            legendHeight: height,
            legendBreakCount: legendBreakCount
        }
    }
}

module.exports = legend;