var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var UTIL = require('../extras/util.js')();
var $ = require("jquery");
require('datatables.net-dt')
function pivottable() {

    var _NAME = 'pivottable';

    var _isPivoted = [],
        _limit,
        _config = [],
        _dimension = [],
        _dimensionType = [],
        _displayNameForDimension = [],
        _cellColorForDimension = [],
        _fontStyleForDimension = [],
        _fontWeightForDimension = [],
        _fontSizeForDimension = [],
        _textColorForDimension = [],
        _textColorExpressionForDimension = [],
        _textAlignmentForDimension = [],
        _measure = [],
        _displayNameForMeasure = [],
        _cellColorForMeasure = [],
        _cellColorExpressionForMeasure = [],
        _fontStyleForMeasure = [],
        _fontSizeForMeasure = [],
        _numberFormatForMeasure = [],
        _textColorForMeasure = [],
        _textAlignmentForMeasure = [],
        _textColorExpressionForMeasure = [],
        _iconNameForMeasure = [],
        _iconPositionForMeasure = [],
        _iconExpressionForMeasure = [],
        _iconFontWeight = [],
        _iconColor = [],
        _fontWeightForMeasure = [],
        _print,
        broadcast,
        filterParameters,
        _notification = false,
        isLiveEnabled = false,
        _data;

    var _local_data, filterData = [], _showNavigation = true, _local_svg, _originalData, parentContainer, mapper, activePage = 0;

    var unpivotedDimension, nester, pivotedDimension, nestedData, pivotedData = [];
    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.dimensionType(config.dimensionType);
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
        this.limit(config.limit);
    }

    var _baseAccessor = function (value, measure) {
        var me = this;

        if (!arguments.length) {
            /**
             * Getter method call with no arguments
             * E.g. <chart>.<accessor_function>() ==> [<item1>, <item2>]
             */
            return me;
        }

        if (value instanceof Array && measure == void 0) {
            /**
             * Setter method call with only value argument
             * E.g. <chart>.<accessor_function>([<item1>, <item2>]) ==> <chart_function>
             */
            me.splice(0, me.length);
            me.push.apply(me, value);
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error('Invalid measure provided');
        }

        if (value == void 0) {
            /**
             * Getter method call with only measure argument
             * E.g. <chart>.<accessor_function>(<measure>) ==> <item>
             */
            return me[index];
        } else {
            /**
             * Setter method call with both value and measure arguments
             * E.g. <chart>.<accessor_function>(<item>, <measure>) ==> <chart_function>
             */
            me[index] = value;
        }

        return chart;
    }
    var getIcon = function (index, endValue) {
        var iconOutput = "";

        var iconStyle = {
            'font-weight': _iconFontWeight[index] || COMMON.DEFAULT_FONTWEIGHT,
            'color': _iconColor[index] || COMMON.DEFAULT_COLOR,
            'font-size': _fontSizeForMeasure[index] || COMMON.DEFAULT_FONTSIZE,
            'text-align': _textAlignmentForMeasure[index]
        };

        if (_iconExpressionForMeasure[index].length) {
            _iconNameForMeasure[index] = UTIL.expressionEvaluator(_iconExpressionForMeasure[index], endValue, 'icon');
            iconStyle['color'] = UTIL.expressionEvaluator(_iconExpressionForMeasure[index], endValue, 'color');
        }

        iconStyle = JSON.stringify(iconStyle);
        iconStyle = iconStyle.replace(/["{}]/g, '').replace(/,/g, ';');

        iconOutput += "<i  class=\"fa " + _iconNameForMeasure[index] + "\" style=\"" + iconStyle + "\" aria-hidden=\"true\"></i>";



        if (getIconName(index) !== "") {
            return iconOutput;
        }
        return "";
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

    var getValueNumberFormat = function (index, value) {
        var si = _numberFormatForMeasure[index],
            nf = UTIL.getNumberFormatterFn(si, value);

        return nf;
    }

    // var getIcon = function (index) {
    //     if (getIconName(index) !== "") {
    //         return '<span style="display:block; text-align:' + getIconPosition(index) + ';"><i class="' + getIconName(index) + '" aria-hidden="true"></i></span>';
    //     }

    //     return "";
    // }
    var getIconPosition = function (index) {
        return _iconPosition[index];
    }
    var getIconName = function (index) {
        return _iconNameForMeasure[index];
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
            return _cellColorForDimension[_dimension.indexOf(value)]
        }
        return _cellColorForMeasure[_measure.indexOf(value)]
    }

    var getFontStyle = function (value, isDimension) {
        if (isDimension) {
            return _fontStyleForDimension[_dimension.indexOf(value)]
        }
        return _fontStyleForMeasure[_measure.indexOf(value)]
    }

    var getFontWeight = function (value, isDimension) {
        if (isDimension) {
            return _fontWeightForDimension[_dimension.indexOf(value)]
        }
        return _fontWeightForMeasure[_measure.indexOf(value)]
    }

    var getFontSize = function (value, isDimension) {
        if (isDimension) {
            return _fontSizeForDimension[_dimension.indexOf(value)]
        }
        return _fontSizeForMeasure[_measure.indexOf(value)]
    }

    var getTextColor = function (value, isDimension) {
        if (isDimension) {
            return _textColorForDimension[_dimension.indexOf(value)]
        }
        return _textColorForMeasure[_measure.indexOf(value)]
    }

    var getTextAlignment = function (value, isDimension) {
        if (isDimension) {
            return _textAlignmentForDimension[_dimension.indexOf(value)]
        }
        return _textAlignmentForMeasure[_measure.indexOf(value)]
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
    var applyFilter = function () {
        return function () {
            var d = _originalData.filter(function (val) {
                for (var index = 0; index < filterData.length; index++) {
                    if (val[filterData[index].key] == filterData[index].value) {
                        return val;
                    }
                }

            });
            chart.update(d);
            if (broadcast) {
                broadcast.updateWidget = {};
                broadcast.filterSelection.id = null;
                var pageInfo = {
                    'visualizationID': parentContainer.attr('id'),
                    'activePageNo': 0
                }
                broadcast.activePage = pageInfo;
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
        }
    }
    var readerTableChart = function (str, ctr, element) {
        var confirm = ctr.select('div.confirm')
            .style('visibility', 'visible');
        var searchObj = filterData.find(o => o[str.id] === str.textContent);
        var filterText = str.getAttribute("filtervalue") === "null" ? null : str.getAttribute("filtervalue")


        if (!searchObj) {
            var obj = Object();
            obj.key = str.getAttribute("tag");
            obj.value = filterText;
            filterData.push(obj);
        }
        $(str).toggleClass('selected')

       var _filterDimension = broadcast.selectedFilters || {};
        if (broadcast.filterSelection.id) {
           _filterDimension = broadcast.selectedFilters[_dimension[0]] || {};
        } else {
            broadcast.filterSelection.id = parentContainer.attr('id');
        }
        var dimension = str.getAttribute("tag");
        if (_filterDimension[dimension]) {
            var temp = _filterDimension[dimension];
            if (temp.indexOf(filterText) < 0) {
                temp.push(filterText);
            } else {
                temp.splice(temp.indexOf(filterText), 1);
            }
            _filterDimension[dimension] = temp;
        } else {
            _filterDimension[dimension] = [filterText]
        }

        _filterDimension[dimension]._meta = {
            dataType: _dimensionType[_dimension.indexOf(dimension)],
            valueType: 'castValueType'
        };
        UTIL.saveFilterParameters(broadcast, filterParameters, parentContainer, _filterDimension, dimension);

    }

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

    var createEntries = function (datum) {
        var content = "";

        unpivotedDimension.forEach(function (upd) {
            var style = {
                'text-align': getTextAlignment(upd, true),
                //'background-color': getCellColor(upd, true),
                'font-style': getFontStyle(upd, true),
                'font-weight': getFontWeight(upd, true),
                'font-size': getFontSize(upd, true) + 'px',
                'color': getTextColor(upd, true),
            };

            style = JSON.stringify(style);
            style = style.replace(/","/g, ';').replace(/["{}]/g, '');

            content += "<td class='filter'  filterValue=\"" + datum[upd] + "\" tag=\"" + upd + "\"  id=\"" + upd + "\" style=\"" + style + "\">" + UTIL.getDimensionFormatedValue(datum[upd], _dimensionType[_dimension.indexOf(upd)]) + "</td>";
        });

        _measure.forEach(function (m, i) {
            content = getGeneratedRecord(content, [m], 0, datum, i);
        });

        return content;
    }

    var getGeneratedRecord = function (content, parent, depth, datum, i) {
        var temp = mapper.values();
        if (typeof (temp[depth]) == 'object') {
            temp[depth].forEach(function (item) {
                parent.push(item);
                content = getGeneratedRecord(content, parent, depth + 1, datum, i);
            });
        } else {
            var style = {
                'text-align': getTextAlignment(parent[0]),
                //'background-color': getCellColor(parent[0]),
                'font-style': getFontStyle(parent[0]),
                'font-weight': getFontWeight(parent[0]),
                'font-size': getFontSize(parent[0]) + 'px',
                'color': getTextColor(parent[0]),
            };

            if (_textColorExpressionForMeasure[i].length > 0) {
                style['color'] = UTIL.expressionEvaluator(_textColorExpressionForMeasure[i], datum[parent.join('_')], 'color');
            }
            if (_cellColorExpressionForMeasure[i].length > 0) {
                style['background-color'] = UTIL.expressionEvaluator(_cellColorExpressionForMeasure[i], datum[parent.join('_')], 'color');
            }

            style = JSON.stringify(style);
            style = style.replace(/","/g, ';').replace(/["{}]/g, '');
            var icon = "";
            // if (datum[parent.join('_')] !== undefined) {
            icon = getIcon(i, datum[parent.join('_')])
            // )

            content += "<td id=\"" + _dimension[i] + "\"  onClick=\"chart.readerTableChart('" + datum[_dimension[i]] + "',this,_local_svg,'" + datum[parent.join('_')] + "')\"  style=\"" + style + "\">" + ((datum[parent.join('_')] !== undefined) ? getValueNumberFormat(parent[0], datum[parent.join('_')])(datum[parent.join('_')]) + "&nbsp" + icon : "-") + "</td>";
        }

        parent.pop();
        return content;
    }

    var createHeaders = function (iterator, key, depth) {
        var row = "<tr>",
            content = "",
            output = "";

        iterator.forEach(function (item) {
            var style = {
                'text-align': getTextAlignment(key, true),
                //'background-color': '#f7f7f7',
                'font-style': getFontStyle(key, true),
                'font-weight': getFontWeight(key, true),
                'font-size': getFontSize(key, true) + 'px'
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
                    'text-align': getTextAlignment(key, true),
                    'background-color': '#f7f7f7',
                    'font-style': getFontStyle(key, true),
                    'font-weight': getFontWeight(key, true),
                    'font-size': getFontSize(key, true) + 'px'
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

    var createTable = function (data) {
        var id = parentContainer.attr('id');

        var svg = parentContainer;;

        var width = parentContainer.attr('width'),
            height = parentContainer.attr('height');

        if (_print) {
            svg
                .attr('width', 0)
                .attr('height', 0)
        }
        else {
            svg
                .attr('width', width)
                .attr('height', height)
                .style('overflow-x', 'auto');
        }

        nester = d3.nest(),
            pivotedDimension = getPivotedDimension();

        unpivotedDimension = getUnPivotedDimension();

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


        nestedData = nester.entries(data),
            pivotedData = [];

        getGeneratedPivotData(nestedData, 0);

        mapper = d3.map();

        pivotedDimension.forEach(function (pd) {
            mapper.set(pd, getUniqueData(data, pd));
        });

        var table = parentContainer.append('table')
            .attr('id', 'viz_pivot-table')
            .style('width', '100%')
            .style('font-size', '0.7rem')
            .classed('display', true)
            .classed('nowrap', true)
            .classed('table', true)
            .classed('table-condensed', true)
            .classed('table-hover', true);

        var thead = "<thead><tr>",
            tbody = "<tbody>";

        if (_dimension.length === unpivotedDimension.length) {
            unpivotedDimension.forEach(function (upd, i) {
                var style = {
                    'text-align': getTextAlignment(upd, true),
                    'font-weight': getFontWeight(upd, true),
                    'font-style': getFontStyle(upd, true),
                    'font-size': getFontSize(upd, true) + 'px'
                };

                style = JSON.stringify(style);
                style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                thead += "<th style=\"" + style + "\">" + upd + "</th>";
            });
        } else {
            thead += "<th colspan=\"" + unpivotedDimension.length + "\" rowspan=\"" + pivotedDimension.length + "\"></th>";
        }

        _measure.forEach(function (m) {

            var style = {
                'text-align': getTextAlignment(m),
                'background-color': '#f7f7f7',
                'font-style': getFontStyle(m),
                'font-weight': getFontWeight(m),
                'font-size': getFontSize(m) + 'px'
            };

            style = JSON.stringify(style);
            style = style.replace(/","/g, ';').replace(/["{}]/g, '');

            thead += "<th colspan=\"" + getColspanValue(mapper, 0) + "\" style=\"" + style + "\">" + m + "</th>";
        });

        thead += "</tr>";

        mapper.entries().forEach(function (entry, index) {
            thead += createHeaders(entry.value, entry.key, index);
        });

        thead += "</thead>";


        pivotedData.forEach(function (pd) {
            tbody += "<tr>" + createEntries(pd) + "</tr>";
        });

        tbody += "</tbody></table>";


        if (data.length > 0) {
            table.append('thead')
                .html(thead);

            table.append('tbody')
                .html(tbody);
        }

        if (!_print) {
            var _filter = UTIL.createFilterElement()
            $('#' + id).append(_filter)

            if (data < _limit && activePage == 0) {
                _showNavigation = false;
            }
            if (_showNavigation) {
                var pager = '<ul class="pager _pagination" style="margin:0px;float:right;">'
                    + '<li><span id="previous">Previous</span></li>'
                    + '<li><span id="next">Next</span></li>'
                    + '</ul>';

                $('#' + id).append(pager)
            }

            if (activePage == 0) {
                $('#' + id).find('#previous').parent().addClass('hidden');
            }
            if (activePage != 0 && data.length == 0) {
                $('#' + id).find('#next').parent().addClass('hidden');
            }

            var tableHeight = height;
            if (_showNavigation) {
                tableHeight = tableHeight - 75;
            }

            $('#' + parentContainer.attr('id')).find('#viz_pivot-table').dataTable({
                "scrollY": tableHeight,
                "scrollX": true,
                "scrollCollapse": true,
                "ordering": true,
                "info": true,
                "searching": false,
                "aaSorting": [],
                'sDom': 't'
            });

            $($('#' + parentContainer.attr('id') + ' td.filter')).on('click', function () {
                if (isLiveEnabled) {
                    broadcast.$broadcast('FlairBi:livemode-dialog');
                    return;
                }
                readerTableChart.call(this.textContent, this, parentContainer)
            })

            $('#' + id).find('#previous').on('click', function (e, i) {
                if (activePage == 0) {
                    $(this).parent().addClass('disabled');
                    $(this).parent().addClass('hidden');
                    return;
                }
                else {
                    activePage = activePage - 1;
                    var pageInfo = {
                        'visualizationID': id.replace("pivot-content-", ""),
                        'activePageNo': activePage
                    }
                    broadcast.activePage = pageInfo;
                    broadcast.$broadcast('FlairBi:update-table', activePage);
                }
            });

            $('#' + id).find('#next').on('click', function (e, i) {
                activePage = activePage + 1;
                $('#' + id).find('#previous').parent().removeClass('disabled');
                var pageInfo = {
                    'visualizationID': id.replace("pivot-content-", ""),
                    'activePageNo': activePage
                }
                broadcast.activePage = pageInfo;
                broadcast.$broadcast('FlairBi:update-table', activePage);
            });

            svg.select('.filterData')
                .on('click', applyFilter());

            svg.select('.removeFilter')
                .on('click', clearFilter());
        }
    }

    function chart(selection) {
        _local_svg = selection;
        _Local_data = _originalData = _data;
        if (_print && !_notification) {
            parentContainer = selection;
        }
        else {
            parentContainer = d3.select('#' + selection.id)
        }

        createTable(_data);
    }

    chart._getName = function () {
        return _NAME;
    }

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
    }

    chart.update = function (data) {
        _Local_data = data;
        svg = _local_svg;
        filterData = [];
        var id = parentContainer.attr('id');
        $("#" + id).html('')
        createTable(data);
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

    chart.dimensionType = function (value) {
        if (!arguments.length) {
            return _dimensionType;
        }
        _dimensionType = value;
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


    chart.displayNameForDimension = function (value, measure) {
        return _baseAccessor.call(_displayNameForDimension, value, measure);
    }

    chart.cellColorForDimension = function (value, measure) {
        return _baseAccessor.call(_cellColorForDimension, value, measure);;
    }

    chart.fontStyleForDimension = function (value, measure) {
        return _baseAccessor.call(_fontStyleForDimension, value, measure);
    }

    chart.fontWeightForDimension = function (value, measure) {
        return _baseAccessor.call(_fontWeightForDimension, value, measure);
    }

    chart.fontSizeForDimension = function (value, measure) {
        return _baseAccessor.call(_fontSizeForDimension, value, measure);
    }

    chart.textColorForDimension = function (value, measure) {
        return _baseAccessor.call(_textColorForDimension, value, measure);
    }

    chart.textColorExpressionForDimension = function (value, measure) {
        if (!arguments.length) {
            return _textColorExpressionForDimension;
        }

        if (value instanceof Array && measure == void 0) {
            _textColorExpressionForDimension = value.map(function (v) {
                return UTIL.getExpressionConfig(v, ['color']);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error('Invalid measure provided');
        }

        if (value == void 0) {
            return _textColorExpressionForDimension[index];
        } else {
            _textColorExpressionForDimension[index] = UTIL.getExpressionConfig(value, ['color']);
        }
    }

    chart.textAlignmentForDimension = function (value, measure) {
        return _baseAccessor.call(_textAlignmentForDimension, value, measure);
    }

    chart.displayNameForMeasure = function (value, measure) {
        return _baseAccessor.call(_displayNameForMeasure, value, measure);
    }

    chart.cellColorForMeasure = function (value, measure) {
        return _baseAccessor.call(_cellColorForMeasure, value, measure);
    }

    chart.cellColorExpressionForMeasure = function (value, measure) {
        if (!arguments.length) {
            return _cellColorExpressionForMeasure;
        }

        if (value instanceof Array && measure == void 0) {
            _cellColorExpressionForMeasure = value.map(function (v) {
                return UTIL.getExpressionConfig(v, ['color']);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error('Invalid measure provided');
        }

        if (value == void 0) {
            return _cellColorExpressionForMeasure[index];
        } else {
            _cellColorExpressionForMeasure[index] = UTIL.getExpressionConfig(value, ['color']);
        }
    }

    chart.fontStyleForMeasure = function (value, measure) {
        return _baseAccessor.call(_fontStyleForMeasure, value, measure);
    }

    chart.fontSizeForMeasure = function (value, measure) {
        return _baseAccessor.call(_fontSizeForMeasure, value, measure);
    }

    chart.numberFormatForMeasure = function (value, measure) {
        return _baseAccessor.call(_numberFormatForMeasure, value, measure);
    }

    chart.textColorForMeasure = function (value, measure) {
        return _baseAccessor.call(_textColorForMeasure, value, measure);
    }

    chart.textAlignmentForMeasure = function (value, measure) {
        return _baseAccessor.call(_textAlignmentForMeasure, value, measure);
    }

    chart.textColorExpressionForMeasure = function (value, measure) {
        if (!arguments.length) {
            return _textColorExpressionForMeasure;
        }

        if (value instanceof Array && measure == void 0) {
            _textColorExpressionForMeasure = value.map(function (v) {
                return UTIL.getExpressionConfig(v, ['color']);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error('Invalid measure provided');
        }

        if (value == void 0) {
            return _textColorExpressionForMeasure[index];
        } else {
            _textColorExpressionForMeasure[index] = UTIL.getExpressionConfig(value, ['color']);
        }
    }

    chart.iconNameForMeasure = function (value, measure) {
        return _baseAccessor.call(_iconNameForMeasure, value, measure);
    }

    chart.iconPositionForMeasure = function (value, measure) {
        return _baseAccessor.call(_iconPositionForMeasure, value, measure);
    }

    chart.iconExpressionForMeasure = function (value, measure) {
        if (!arguments.length) {
            /**
             * Getter method call with no arguments
             * E.g. <chart>.kpiIconExpression() ==> [<item1>, <item2>]
             */
            return _iconExpressionForMeasure;
        }

        if (value instanceof Array && measure == void 0) {
            /**
             * Setter method call with only value argument
             * E.g. <chart>.kpiIconExpression([<item1>, <item2>]) ==> <chart_function>
             */
            _iconExpressionForMeasure = value.map(function (v) {
                return UTIL.getExpressionConfig(v, ['icon', 'color']);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error('Invalid measure provided');
        }

        if (value == void 0) {
            /**
             * Getter method call with only measure argument
             * E.g. <chart>.kpiIconExpression(<measure>) ==> <item>
             */
            return _iconExpressionForMeasure[index];
        } else {
            /**
             * Setter method call with both value and measure arguments
             * E.g. <chart>.kpiIconExpression(<item>, <measure>) ==> <chart_function>
             */
            _iconExpressionForMeasure[index] = UTIL.getExpressionConfig(value, ['icon', 'color']);
        }

        return chart;
    }

    chart.fontWeightForMeasure = function (value, measure) {
        return _baseAccessor.call(_fontWeightForMeasure, value, measure);
    }

    chart.iconFontWeight = function (value, measure) {
        return _baseAccessor.call(_iconFontWeight, value, measure);
    }


    chart.iconColor = function (value, measure) {
        return _baseAccessor.call(_iconColor, value, measure);
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
    chart.limit = function (value) {
        if (!arguments.length) {
            return _limit;
        }
        _limit = value;
        return chart;
    }

    chart.data = function (value) {
        if (!arguments.length) {
            return _data;
        }
        _data = value;
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
    return chart;
}

module.exports = pivottable;
