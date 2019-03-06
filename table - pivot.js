function table() {

    var _NAME = 'table';

    var _config,
        _dimension,
        _measure,
        _displayNameForDimension,
        _cellColorForDimension,
        _fontStyleForDimension,
        _fontWeightForDimension,
        _fontSizeForDimension,
        _textColorForDimension,
        _textColorExpressionForDimension,
        _textAlignmentForDimension,
        _isPivoted,
        _measure,
        _displayNameForMeasure,
        _cellColorForMeasure,
        _cellColorExpressionForMeasure,
        _fontStyleForMeasure,
        _fontSizeForMeasure,
        _numberFormatForMeasure,
        _textColorForMeasure,
        _textAlignmentForMeasure,
        _textColorExpressionForMeasure,
        _iconNameForMeasure,
        _iconPositionForMeasure,
        _iconExpressionForMeasure,
        _fontWeightForMeasure;


    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.displayNameForDimension(config.displayNameForDimension);
        this.cellColorForDimension(config.cellColorForDimension);
        this.fontStyleForDimension(config.fontStyleForDimension);
        this.fontWeightForDimension(config.fontWeightForDimension);
        this.fontSizeForDimension(config.fontSizeForDimension);
        this.textColorForDimension(config.textColorForDimension);
        this.textColorExpressionForDimension(config.textColorExpressionForDimension);
        this.textAlignmentForDimension(config.textAlignmentForDimension);
        this.isPivoted(config.isPivoted);
        this.displayNameForMeasure(config.displayNameForMeasure);
        this.cellColorForMeasure(config.cellColorForMeasure);
        this.cellColorExpressionForMeasure(config.cellColorExpressionForMeasure);
        this.fontStyleForMeasure(config.fontStyleForMeasure);
        this.fontSizeForMeasure(config.fontSizeForMeasure);
        this.numberFormatForMeasure(config.numberFormatForMeasure);
        this.textColorForMeasure(config.textColorForMeasure);
        this.textAlignmentForMeasure(config.textAlignmentForMeasure);
        this.textColorExpressionForMeasure(config.textColorExpressionForMeasure);
        this.iconNameForMeasure(config.iconNameForMeasure);
        this.iconPositionForMeasure(config.iconPositionForMeasure);
        this.iconExpressionForMeasure(config.iconExpressionForMeasure);
        this.fontWeightForMeasure(config.fontWeightForMeasure);


    }

    var getPivotedDimension = function () {
        var result = [];

        _isPivoted.forEach(function (dp, i) {
            if (dp) {
                result.push(_dimension[i]);
            }
        });
        return result;
    }

    var getUnPivotedDimension = function () {
        var result = [];

        _isPivoted.forEach(function (dp, i) {
            if (!dp) {
                result.push(_dimension[i]);
            }
        });
        return result;
    }

    var getValueNumberFormat = function (index) {
        var si = _numberFormatForMeasure[index],
            nf = getNumberFormatter(si);

        return nf;
    }

    var getIcon = function (index) {
        if (getIconName(index) !== "") {
            return '<span style="display:block; text-align:' + getIconPosition(index) + ';"><i class="' + getIconName(index) + '" aria-hidden="true"></i></span>';
        }

        return "";
    }
    var getIconPosition = function (index) {
        return _measureProp[index]['iconPosition'];
    }
    var getIconName = function (index) {
        return _measureProp[index]['iconName'];
    }
    var getDisplayName = function (value, isDimension) {
        if (isDimension) {
            return _displayNameForDimension.filter(function (item) {
                return item['dimension'] == value;
            })[0]['displayName'];
        }
        return _displayNameForMeasure.filter(function (item) {
            return item['measure'] == value;
        })[0]['displayName'];
    }

    var getCellColor = function (value, isDimension) {
        if (isDimension) {
            _cellColorForDimension[ _dimension.indexOf(value)]
        }
        return _cellColorForMeasure[ _measure.indexOf(value)]
    }

    var getFontStyle = function (value, isDimension) {
        if (isDimension) {
            return _fontStyleForDimension[ _dimension.indexOf(value)]
        }
        return _fontStyleForMeasure[ _measure.indexOf(value)]
    }

    var getFontWeight = function (value, isDimension) {
        if (isDimension) {
            return _fontWeightForDimension[ _dimension.indexOf(value)]
        }
        return _fontWeightForMeasure[ _measure.indexOf(value)]
    }

    var getFontSize = function (value, isDimension) {
        if (isDimension) {
            return _fontSizeForDimension[ _dimension.indexOf(value)]
        }
        return _fontSizeForMeasure[ _measure.indexOf(value)]
    }

    var getTextColor = function (value, isDimension) {
        if (isDimension) {
            return _textColorForDimension[ _dimension.indexOf(value)]
        }
        return _textColorForMeasure[ _measure.indexOf(value)]
    }

    var getTextAlignment = function (value, isDimension) {
        if (isDimension) {
            _textAlignmentForDimension[ _dimension.indexOf(value)]
        }
        _textAlignmentForMeasure[ _measure.indexOf(value)]
    }

    var getValueNumberFormat = function (value) {
        var si = _numberFormatForMeasure[ _measure.indexOf(value)]
            nf = UTIL.getNumberFormatter(si);

        return nf;
    }

    var getUniqueData = function (data, pivoted_dimension) {
        var result = [];

        data.forEach(function (d) {
            if (result.indexOf(d[pivoted_dimension]) == -1) {
                result.push(d[pivoted_dimension]);
            }
        });

        return result;
    }

    var getColspanValue = function (mapper, index) {
        var arr = mapper.values().slice(index),
            multiplier = 1;

        arr.forEach(function (v) {
            multiplier *= v.length;
        });

        return multiplier;
    }

    var getCloneFactor = function (mapper, index) {
        var arr = mapper.values(),
            multiplier = _dimension.length;

        for (var i = 0; i < index; i++) {
            multiplier *= arr[i].length;
        }

        return multiplier;
    }
    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {

            var margin = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 45
            };

            var div = d3.select(this);

            var width = +div.attr('width');
            var height = +div.attr('height');
            var disv = d3.select("#pivottable");

            $('#pivottable').css('width', width)
                .css('height', height).css('overflow-y', 'hidden').css('overflow-x', 'auto');

            var nester = d3.nest(),
                pivotedDimension = getPivotedDimension();

            var unpivotedDimension = getUnPivotedDimension();

            unpivotedDimension.forEach(function (dim) {
                nester = nester.key(function (d) {
                    return d[dim];
                })
            });

            nester.rollup(function (values) {
                var _sorter = function (x, y, i) {
                    if (typeof (pivotedDimension[i]) === 'undefined') {
                        return 0;
                    }

                    return x[pivotedDimension[i]] < y[pivotedDimension[i]]
                        ? -1 : x[pivotedDimension[i]] > y[pivotedDimension[i]] ? 1 : _sorter(x, y, i + 1);
                }

                var sortedValues = values.sort(function (x, y) {
                    return _sorter(x, y, 0);
                });

                sortedValues = values;

                var leafNode = function (data, measure, value) {
                    var leafDim = "";

                    pivotedDimension.forEach(function (pd) {
                        leafDim += "_" + data[pd];
                    });

                    return {
                        name: measure + leafDim,
                        value: value
                    };
                }

                var result = [];

                _measure.forEach(function (m) {
                    var temp = sortedValues.map(function (d) {
                        return leafNode(d, m, d[m]);
                    });

                    result = Array.prototype.concat(result, temp);
                });

                return result;
            });

            var nestedData = nester.entries(data),
                pivotedData = [];

            var getGeneratedPivotData = function (nestedData, depth, obj) {
                nestedData.forEach(function (kv) {
                    var a = kv.key;
                    obj = (depth !== 0) ? (jQuery.extend(true, {}, obj) || {}) : {};
                    obj[unpivotedDimension[depth]] = a;

                    if (kv.value) {
                        kv.value.forEach(function (d) {
                            obj[d.name] = d.value;
                        });
                        pivotedData.push(obj);
                    } else {
                        getGeneratedPivotData(kv.values, depth + 1, obj);
                    }
                });
            }
            getGeneratedPivotData(nestedData, 0);

            var mapper = d3.map();

            pivotedDimension.forEach(function (pd) {
                mapper.set(pd, getUniqueData(data, pd));
            });

            var table = $('<table id="viz_pivot-table" class="display nowrap" style="width:100%"></table>').addClass('table table-condensed table-hover');

            var thead = "<thead><tr>",
                tbody = "<tbody>";

            _dimension.forEach(function (item, index) {
                var title = _displayNameForDimension,
                    style = {
                        'text-align': _textAlignmentForDimension[index],
                        'background-color': '#f1f1f1',
                        'font-weight': 'bold'
                    };

                style = JSON.stringify(style);
                style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                if (title != "") {
                    thead += "<th style=\"" + style + "\">" + title + "</th>";
                } else {
                    thead += "<th style=\"" + style + "\">" + item + "</th>";
                }
            });

            _measure.forEach(function (item, index) {
                var title =_displayNameForMeasure[index],
                    style = {
                        'text-align': _textAlignmentForMeasure[index],
                        'background-color': '#f1f1f1',
                        'font-weight': 'bold'
                    };

                style = JSON.stringify(style);
                style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                if (title != "") {
                    thead += "<th style=\"" + style + "\">" + title + "</th>";
                } else {
                    thead += "<th style=\"" + style + "\">" + item + "</th>";
                }
            });

            thead += "</tr></thead>";


            var createHeaders = function (iterator, key, depth) {
                var row = "<tr>",
                    content = "",
                    output = "";

                iterator.forEach(function (item) {
                    var style = {
                        'text-align': getTextAlignment(key, true),
                        'background-color': getCellColor(key, true),
                        'font-style': getFontStyle(key, true),
                        'font-weight': getFontWeight(key, true),
                        'font-size': getFontSize(key, true),
                        'color': getTextColor(key, true)
                    };

                    style = JSON.stringify(style);
                    style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                    content += "<th style=\"" + style + "\" colspan=\"" + getColspanValue(mapper, depth + 1) + "\">" + item + "</th>";
                });

                for (var i = 0; i < getCloneFactor(mapper, depth); i++) {
                    output += content;
                }

                if (depth == (pivotedDimension.length - 1)) {
                    var temp = "";

                    unpivotedDimension.forEach(function (upd) {
                        var style = {
                            'text-align': getTextAlignment(upd, true),
                            'background-color': '#f7f7f7',
                            'font-weight': 'bold'
                        };

                        style = JSON.stringify(style);
                        style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                        temp += "<th style=\"" + style + "\">" + upd + "</th>";
                    });

                    output = temp + output;
                }

                row += output + "</tr>";
                return row;
            }

            mapper.entries().forEach(function (entry, index) {
                thead += createHeaders(entry.value, entry.key, index);
            });

            thead += "</thead>";

            var temp = mapper.values();

            var getGeneratedRecord = function (content, parent, depth, datum) {
                if (typeof (temp[depth]) == 'object') {
                    temp[depth].forEach(function (item) {
                        parent.push(item);
                        content = getGeneratedRecord(content, parent, depth + 1, datum);
                    });
                } else {
                    var style = {
                        'text-align': getTextAlignment(parent[0]),
                        'background-color': getCellColor(parent[0]),
                        'font-style': getFontStyle(parent[0]),
                        'font-weight': getFontWeight(parent[0]),
                        'font-size': getFontSize(parent[0]),
                        'color': getTextColor(parent[0])
                    };

                    style = JSON.stringify(style);
                    style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                    content += "<td  style=\"" + style + "\">" + ((datum[parent.join('_')] !== undefined) ? getValueNumberFormat(parent[0])(datum[parent.join('_')]) : "-") + "</td>";
                }

                parent.pop();
                return content;
            }

            var createEntries = function (datum) {
                var content = "";

                unpivotedDimension.forEach(function (upd) {
                    var style = {
                        'text-align': getTextAlignment(upd, true),
                        'background-color': getCellColor(upd, true),
                        'font-style': getFontStyle(upd, true),
                        'font-weight': getFontWeight(upd, true),
                        'font-size': getFontSize(upd, true),
                        'color': getTextColor(upd, true)
                    };

                    style = JSON.stringify(style);
                    style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                    content += "<td style=\"" + style + "\">" + datum[upd] + "</td>";
                });

                _measure.forEach(function (m) {
                    content = getGeneratedRecord(content, [m], 0, datum);
                });

                return content;
            }

            pivotedData.forEach(function (pd) {
                tbody += "<tr>" + createEntries(pd) + "</tr>";
            });

            tbody += "</tbody></table>";

            table.append((thead + tbody));

            $('#pivottable').append(table);

            $('#pivottable').find('#viz_pivot-table').dataTable({
                scrollY: height - 50,
                scrollX: true,
                scrollCollapse: true,
                ordering: true,
                info: true,
                searching: false,
                'sDom': 't'
            });

        }

        );
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

    chart.isPivoted = function (value) {
        if (!arguments.length) {
            return _isPivoted;
        }
        _isPivoted = value;
        return chart;
    }



    chart.displayNameForDimension = function (value) {
        if (!arguments.length) {
            return _displayNameForDimension;
        }
        _displayNameForDimension = value;
        return chart;
    }

    chart.cellColorForDimension = function (value) {
        if (!arguments.length) {
            return _cellColorForDimension;
        }
        _cellColorForDimension = value;
        return chart;
    }

    chart.fontStyleForDimension = function (value) {
        if (!arguments.length) {
            return _fontStyleForDimension;
        }
        _fontStyleForDimension = value;
        return chart;
    }

    chart.fontWeightForDimension = function (value) {
        if (!arguments.length) {
            return _fontWeightForDimension;
        }
        _fontWeightForDimension = value;
        return chart;
    }

    chart.fontSizeForDimension = function (value) {
        if (!arguments.length) {
            return _fontSizeForDimension;
        }
        _fontSizeForDimension = value;
        return chart;
    }

    chart.textColorForDimension = function (value) {
        if (!arguments.length) {
            return _textColorForDimension;
        }
        _textColorForDimension = value;
        return chart;
    }

    chart.textColorExpressionForDimension = function (value) {
        if (!arguments.length) {
            return _textColorExpressionForDimension;
        }
        _textColorExpressionForDimension = value;
        return chart;
    }

    chart.textAlignmentForDimension = function (value) {
        if (!arguments.length) {
            return _textAlignmentForDimension;
        }
        _textAlignmentForDimension = value;
        return chart;
    }

    chart.displayNameForMeasure = function (value) {
        if (!arguments.length) {
            return _displayNameForMeasure;
        }
        _displayNameForMeasure = value;
        return chart;
    }

    chart.cellColorForMeasure = function (value) {
        if (!arguments.length) {
            return _cellColorForMeasure;
        }
        _cellColorForMeasure = value;
        return chart;
    }

    chart.cellColorExpressionForMeasure = function (value) {
        if (!arguments.length) {
            return _cellColorExpressionForMeasure;
        }
        _cellColorExpressionForMeasure = value;
        return chart;
    }

    chart.fontStyleForMeasure = function (value) {
        if (!arguments.length) {
            return _fontStyleForMeasure;
        }
        _fontStyleForMeasure = value;
        return chart;
    }

    chart.fontSizeForMeasure = function (value) {
        if (!arguments.length) {
            return _fontSizeForMeasure;
        }
        _fontSizeForMeasure = value;
        return chart;
    }

    chart.numberFormatForMeasure = function (value) {
        if (!arguments.length) {
            return _numberFormatForMeasure;
        }
        _numberFormatForMeasure = value;
        return chart;
    }

    chart.textColorForMeasure = function (value) {
        if (!arguments.length) {
            return _textColorForMeasure;
        }
        _textColorForMeasure = value;
        return chart;
    }

    chart.textAlignmentForMeasure = function (value) {
        if (!arguments.length) {
            return _textAlignmentForMeasure;
        }
        _textAlignmentForMeasure = value;
        return chart;
    }

    chart.textColorExpressionForMeasure = function (value) {
        if (!arguments.length) {
            return _textColorExpressionForMeasure;
        }
        _textColorExpressionForMeasure = value;
        return chart;
    }

    chart.iconNameForMeasure = function (value) {
        if (!arguments.length) {
            return _iconNameForMeasure;
        }
        _iconNameForMeasure = value;
        return chart;
    }

    chart.iconPositionForMeasure = function (value) {
        if (!arguments.length) {
            return _iconPositionForMeasure;
        }
        _iconPositionForMeasure = value;
        return chart;
    }

    chart.iconExpressionForMeasure = function (value) {
        if (!arguments.length) {
            return _iconExpressionForMeasure;
        }
        _iconExpressionForMeasure = value;
        return chart; 
    }

    chart.fontWeightForMeasure = function (value) {
        if (!arguments.length) {
            return _fontWeightForMeasure;
        }
        _fontWeightForMeasure = value;
        return chart;
    }
    return chart;
}