function treemap() {

    /* These are the constant global variable for the function clusteredverticalbar.
     */
    var _NAME = 'treemap';

    /* These are the private variables that is initialized by the arguments sent
     * by the users and can be updated using public methods.
     */

    var _config,
        _dimension,
        _measure,
        showLabel,
        colorPattern,
        showValues,
        valueTextColour,
        fontStyleForMes,
        fontWeightForMes,
        fontSizeForMes,
        numberFormat,

        showLabelForDimension = [],
        labelColorForDimension = [],
        displayColor = [],
        fontStyleForDimension = [],
        fontWeightForDimension = [],
        fontSizeForDimension = [];

    /* These are the common variables that is shared across the different private/public 
     * methods but is initialized/updated within the methods itself.
     */
    var _localSVG,
        _localTotal,
        _localXAxis,
        _localYAxis,
        _localXGrid,
        _localYGrid,
        _localData,
        _localXLabels = [],
        _localLegend,
        _localTooltip;
    // _localLabelStack;

    /* These are the common private functions that is shared across the different private/public 
     * methods but is initialized beforehand.
     */
    var BASE_COLOR = '#ffffff',
        dim1Color = d3.scaleLinear(),

        dim2Color = d3.scaleLinear();
    /* -------------------------------------------------------------------------------- */
    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.showLabel(config.showLabel);
        this.colorPattern(config.colorPattern);
        this.showValues(config.showValues);
        this.valueTextColour(config.valueTextColour);
        this.fontStyleForMes(config.fontStyleForMes);
        this.fontWeightForMes(config.fontWeightForMes);
        this.fontSizeForMes(config.fontSizeForMes);
        this.numberFormat(config.numberFormat);


        this.showLabelForDimension(config.showLabelForDimension);
        this.labelColorForDimension(config.labelColorForDimension);
        this.displayColor(config.displayColor);
        this.fontStyleForDimension(config.fontStyleForDimension);
        this.fontWeightForDimension(config.fontWeightForDimension);
        this.fontSizeForDimension(config.fontSizeForDimension);
    }

    var setColorDomainRange = function (arr, dim) {
        var values = [];

        arr.forEach(function (item) {
            if (item.depth == dim) {
                values.push(item.value);
            }
        });

        if (dim == 1) {
            dim1Color.domain([Math.min.apply(Math, values), Math.max.apply(Math, values)]);
            dim1Color.range([d3.rgb(displayColor[0]).brighter(), d3.rgb(displayColor[0]).darker()])
        } else if (dim == 2) {
            dim2Color.domain([Math.min.apply(Math, values), Math.max.apply(Math, values)]);
            dim2Color.range([d3.rgb(displayColor[1]).brighter(), d3.rgb(displayColor[1]).darker()])
        }
    }

    var getFillColor = function (obj, index) {
        if (index == 0) {
            return BASE_COLOR;
        }

        if (colorPattern == 'single_color') {
            if (_dimension.length == 2) {
                if (obj.children) {
                    return displayColor[0];
                } else {
                    return displayColor[1];
                }
            } else {
                return this.displayColor[0];
            }/*
            var lightness = 0.70 + obj.depth / 10;
            return d3.hsl(213, .13, lightness);*/
        } else if (colorPattern == 'unique_color') {
            /*var r = parseInt(Math.abs(Math.sin(5*index)) * 255),
                g = parseInt(Math.abs(Math.cos(3*index)) * 255),
                b = parseInt(Math.abs(Math.sin(7*index)) * 255);
            return d3.rgb(r, g, b);*/
            var defaultColors = ['#4897D8',
                '#ED5752',
                '#5BC8AC',
                '#20948B',
                '#9A9EAB',
                '#755248',
                '#FA6E59',
                '#CF3721',
                '#31A9B8',
                '#EFEFEF',
                '#34675C',
                '#AF4425'
            ]
            return defaultColors[index % (defaultColors.length)];
            // return d3.schemeCategory20c[index % (d3.schemeCategory20c.length)];
        } else if (colorPattern == 'gradient_color') {
            debugger
            if (_dimension.length == 2) {
                if (obj.children) {
                    return dim1Color(obj.value);
                } else {
                    return dim2Color(obj.value);
                }
            } else {
                return dim1Color(obj.value);
            }
        }
    }

    var getFilterLabels = function (obj) {
        var result = [];

        if (_dimension.length == 2) {
            if (obj.children) {
                if (showLabel) {
                    result = result.concat({ node: obj, data: obj.data.key });
                }
            } else {
                if (showLabel) {
                    result = result.concat({ node: obj, data: obj.data.key });
                }
            }
        } else {
            if (showLabel) {
                result = result.concat({ node: obj, data: obj.data.key });
            }
        }

        if (showLabel) {
            var nf = UTIL.getNumberFormatter(numberFormat),
                value;

            if (numberFormat == "Percent") {
                value = nf(obj.value / _localTotal);
            } else {
                value = nf(obj.value);
            }

            if (value.indexOf("G") != -1) {
                value = value.slice(0, -1) + "B";
            }
            result = result.concat({ node: obj, data: value });
        }

        if (!obj.parent) {
            return [];
        }

        return result;
    }

    var getColorValue = function (data, index) {
        if (index === 0) {
            if ((data.node.children && _dimension.length == 2) || (!data.node.children && _dimension.length == 1)) {
                if (showLabel) {
                    return valueTextColour[0];
                }
            } else {
                if (this.showLabel2) {
                    return valueTextColour[0];
                }
            }
        } else if (showLabel) {
            return valueTextColour[0];
        }

        return null;
    }

    function chart(selection) {
        _localSVG = selection;

        selection.each(function (data) {


            var padding = 15,
                offsetHeight = 15,
                offsetWidth = 30;

            var div = d3.select(this).node().parentNode;
            _local_svg = d3.select(this);

            var width = div.clientWidth - 2 * COMMON.PADDING,
                height = div.clientHeight - 2 * COMMON.PADDING;

            var svg = d3.select(this);

            /* store the data in local variable */
            _localData = data;

            var me = this;

            svg.selectAll('g').remove();

            svg.attr('width', width)
                .attr('height', height)
                .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

            var treemap = this._treemap = d3.treemap()
                .size([width, height])
                .paddingOuter(function (node) {
                    if (node.parent) {
                        return 3;
                    }
                    return 1;
                })
                .paddingTop(function (node) {
                    if (node.parent) {
                        return 20;
                    }
                    return padding;
                })
                .paddingInner(3)
                .round(true);

            if (_dimension.length == 2) {
                var nest = this._nest = d3.nest()
                    .key(function (d) { return d[_dimension[0]]; })
                    .key(function (d) { return d[_dimension[1]]; })
                    .rollup(function (d) { return d3.sum(d, function (d) { return d[_measure[0]]; }); });
            } else {
                var nest = this._nest = d3.nest()
                    .key(function (d) { return d[_dimension[0]]; })
                    .rollup(function (d) { return d3.sum(d, function (d) { return d[_measure[0]]; }); });
            }

            var root = d3.hierarchy({ values: nest.entries(data) }, function (d) { return d.values; })
                .sum(function (d) { return d.value; })
                .sort(function (a, b) { return b.value - a.value; });

            _localTotal = root.value;

            treemap(root);

            var dim = _dimension.length;

            while (dim > 0) {
                setColorDomainRange(root.descendants(), dim);
                dim -= 1;
            }
            
            var cell = svg.selectAll('.node')
                .data(root.descendants())
                .enter().append('g')
                .attr('transform', function (d) {
                    return 'translate(' + d.x0 + ',' + d.y0 + ')';
                })
                .attr('class', 'node')
                .each(function (d) { d.node = this; });

            cell.filter(function (d, i) { return d.parent; })
                .append('text')
                .selectAll('tspan')
                .data(function (d, i) {
                    return getFilterLabels(d);
                })
                .enter().append('tspan')
                .attr('x', function (d, i) {
                    return i ? null : 2;
                })
                .attr('y', '1em')
                .text(function (d, i) {
                    return i ? ', ' + d.data : d.data;
                })
                .attr('fill', function (d, i) {
                    return getColorValue(d, i);
                })
            // .attr('visibility', function (d, i) {
            //     var parentNode = d3.select(this).node().parentNode;
            //     return me.helper.getVisibilityValue(parentNode, d.node);
            // })
            // .style('font-style', function (d, i) {
            //     return me.helper.getFontStyleValue(d, i);
            // })
            // .style('font-weight', function (d, i) {
            //     return me.helper.getFontWeightValue(d, i);
            // })
            // .style('font-size', function (d, i) {
            //     return me.helper.getFontSizeValue(d, i);
            // });

            var t = d3.transition()
                .duration(400)
                .ease(d3.easeQuadIn)


            var rect = cell.append('rect')
                .attr('rx', 2)
                .attr('ry', 2)
                .attr('width', function (d) {
                    return d.x1 - d.x0;
                })
                .attr('height', function (d) {
                    return d.y1 - d.y0;
                })
                .attr('fill', function (d, i) {
                    return getFillColor(d, i);
                })
                .attr('id', function (d, i) {
                    return 'rect-' + i;
                });

            rect.transition(t)
                .attr('width', function (d) {
                    return d.x1 - d.x0;
                })
                .attr('height', function (d) {
                    return d.y1 - d.y0;
                })
                .attr('fill', function (d, i) {
                    return getFillColor(d, i)
                });

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

    chart.showLabel = function (value) {
        if (!arguments.length) {
            return showLabel;
        }
        showLabel = value;
        return chart;
    }
    chart.colorPattern = function (value) {
        if (!arguments.length) {
            return colorPattern;
        }
        colorPattern = value;
        return chart;
    }
    chart.showValues = function (value) {
        if (!arguments.length) {
            return showValues;
        }
        showValues = value;
        return chart;
    }
    chart.valueTextColour = function (value) {
        if (!arguments.length) {
            return valueTextColour;
        }
        valueTextColour = value;
        return chart;
    }
    chart.fontStyleForMes = function (value) {
        if (!arguments.length) {
            return fontStyleForMes;
        }
        valueTextColour = value;
        return chart;
    }
    chart.fontWeightForMes = function (value) {
        if (!arguments.length) {
            return fontWeightForMes;
        }
        fontWeightForMes = value;
        return chart;
    }
    chart.fontSizeForMes = function (value) {
        if (!arguments.length) {
            return fontSizeForMes;
        }
        fontSizeForMes = value;
        return chart;
    }
    chart.numberFormat = function (value) {
        if (!arguments.length) {
            return numberFormat;
        }
        numberFormat = value;
        return chart;
    }

    /**
     * ClusteredVerticalBar Measure Showvalue accessor function
     *
     * @param {boolean|array(boolean)|null} value Measure Showvalue value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {boolean|array(boolean)|function}
     */
    chart.showLabelForDimension = function (value, measure) {
        return UTIL.baseAccessor.call(showLabelForDimension, value, measure, _measure);
    }

    /**
     * ClusteredVerticalBar Measure Displayname accessor function
     *
     * @param {string|array(string)|null} value Measure Displayname value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.labelColorForDimension = function (value, measure) {
        return UTIL.baseAccessor.call(labelColorForDimension, value, measure, _measure);
    }

    /**
     * ClusteredVerticalBar Measure FontStyle accessor function
     *
     * @param {string|array(string)|null} value Measure FontStyle value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.displayColor = function (value, measure) {
        return UTIL.baseAccessor.call(displayColor, value, measure, _measure);
    }

    /**
     * ClusteredVerticalBar Measure FontWeight accessor function
     *
     * @param {number|array(number)|null} value Measure FontWeight value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {number|array(number)|function}
     */
    chart.fontStyleForDimension = function (value, measure) {
        return UTIL.baseAccessor.call(fontStyleForDimension, value, measure, _measure);
    }

    /**
     * ClusteredVerticalBar Measure FontSize accessor function
     *
     * @param {number|array(number)|null} value Measure FontSize value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {number|array(number)|function}
     */
    chart.fontWeightForDimension = function (value, measure) {
        return UTIL.baseAccessor.call(fontWeightForDimension, value, measure, _measure);
    }

    /**
     * ClusteredVerticalBar Measure NumberFormat accessor function
     *
     * @param {string|array(string)|null} value Measure NumberFormat value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.fontSizeForDimension = function (value, measure) {
        return UTIL.baseAccessor.call(fontSizeForDimension, value, measure, _measure);
    }

    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    }

    return chart;
}