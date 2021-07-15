var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var UTIL = require('../extras/util.js')();
var $ = require("jquery");
require('datatables.net-dt');
// require( 'datatables.net-rowgroup' );

function table() {

    var _NAME = 'table';

    var _config = [],
        _dimension = [],
        _dimensionType = [],
        _limit,
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
        _isTotal = false,
        isLiveEnabled = false,
        _print,
        _notification = false,
        broadcast,
        filterParameters,
        _data;

    var _Local_data, _showNavigation = true, filterData = [], _originalData, _local_svg, parentContainer, activePage = 0;

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
        this.showTotal(config.showTotal);
        this.iconFontWeight(config.iconFontWeight);
        this.iconColor(config.iconColor);
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
            'font-size': _fontSizeForMeasure[index] + 'px' || COMMON.DEFAULT_FONTSIZE + 'px',
            'text-align': getIconPosition(index),
            'padding-right': '15px'
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
    var getIconPosition = function (index) {
        return _iconPositionForMeasure[index];
    }
    var getIconName = function (index) {
        return _iconNameForMeasure[index];
    }
    var applyFilter = function () {
        return function () {
            var d = _Local_data.filter(function (val) {
                for (var index = 0; index < filterData.length; index++) {
                    if (val[filterData[index].key] == filterData[index].value) {
                        return val;
                    }
                }
            });
            // chart.update(d);
            if (broadcast) {
                broadcast.updateWidget = {};
                broadcast.filterSelection.id = null;
                var pageInfo = {
                    'visualizationID': _local_svg.attr('id').replace("table-content-", ""),
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
    var clearFilter = function () {
        return function () {
            chart.update(_originalData);
        }
    }
    var readerTableChart = function (str, ctr, element) {
        //  if (COMMON.COMPARABLE_DATA_TYPES.indexOf(_dimensionType[_dimension.indexOf(str.id)]) === -1) {
        var confirm = ctr.select('div.confirm')
            .style('visibility', 'visible');
        var filterText = str.getAttribute("filtervalue") === "null" ? null : str.getAttribute("filtervalue")

        var searchObj = filterData.find(o => o[str.getAttribute("tag")] === str.textContent);
        if (searchObj == undefined) {
            var obj = Object();
            obj.key = str.getAttribute("tag");
            obj.value = filterText;
            filterData.push(obj);
        }

        $('#' + parentContainer.attr('id') + ' td[tag=' + str.getAttribute("tag") + ']').each(function () {
            if (this.textContent === str.textContent) {
                $(this).toggleClass('selected')
            }
        })

       var _filterDimension = broadcast.selectedFilters || {};
        if (broadcast.filterSelection.id) {
           _filterDimension = broadcast.selectedFilters[_dimension[0]] || {};
        } else {
            broadcast.filterSelection.id = d3.select(parentContainer.node()).attr('id');
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

    var createHeaderFooter = function (data) {
        var thead = "<thead class='searchHeader'><tr>";
        var tfoot = "<tfoot class='totalFooter'><tr>";

        _dimension.forEach(function (item, index) {
            var title = _displayNameForDimension[index],
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
            // if (index == 0) {
            //     tfoot += "<th style='border-left:1px solid #d3d4d4;border-right:0px solid #d3d4d4'></th>";
            // }
            // else {
            //     tfoot += "<th style='border-left:0px solid #d3d4d4;border-right:0px solid #d3d4d4'></th>";
            // }

        });

        style = {
            'background-color': '#f1f1f1',
            'font-weight': 'bold'
        };

        style = JSON.stringify(style);
        style = style.replace(/","/g, ';').replace(/["{}]/g, '');

        tfoot += "<th style=\"" + style + "\" colspan=" + _dimension.length + "></th>";

        _measure.forEach(function (item, index) {
            var title = _displayNameForMeasure[index],
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
            var total = d3.sum(data.map(function (d) { return d[_measure[index]]; }));

            tfoot += "<th style=\"" + style + "\" >" + total.toFixed(2) + "</th>";
        });

        thead += "</tr></thead>";
        tfoot += "</tr></tfoot>";

        return {
            thead: thead,
            tfoot: tfoot
        };

    }

    var createTable = function (data) {

        var id = _local_svg.attr('id');

        var width = parentContainer.attr('width'),
            height = parentContainer.attr('height');

        _local_svg
            .attr('width', width)
            .attr('height', height)
        // .style('overflow-y', 'auto')
        // .style('overflow-x', 'auto');

        var table = _local_svg.append('table')
            .attr('id', 'viz_table')
            //.style('width', '100%')
            .classed('display', true)
            .classed('nowrap', true)
            // .classed('table', true)
            .classed('table-striped', true)
            .classed('table-condensed', true)
            .classed('table-hover', true);

        var thead_tfoot = createHeaderFooter(data);

        table.append('thead')
            .html(thead_tfoot.thead);

        var tbody = createBody(data);

        table.append('tbody').html(tbody);

        if (_isTotal) {
            table.append('tfoot')
                .html(thead_tfoot.tfoot);
        }

        if (!_print) {
            if (data < _limit && activePage == 0) {
                _showNavigation = false;
            }
            if (_showNavigation) {
                var pager = '<ul class="pager _pagination" >'
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

            var _filter = UTIL.createFilterElement()
            $('#' + id).append(_filter)

            var dataTable;

            var tableHeight = height - 50;
            if (_isTotal) {
                tableHeight = tableHeight - 30;
            }
            if (_showNavigation) {
                tableHeight = tableHeight - 30;
            }

            dataTable = $('#' + parentContainer.attr('id')).find('#viz_table').DataTable({
                "orderCellsTop": true,
                "paging": false,
                "ordering": true,
                'dom': 'Rlfrtip',
                "autoWidth": true,
                "scrollX": true,
                "scrollY": tableHeight,
                "info": false,
                "aaSorting": [],
                "colResize": {
                    scrollY: 200,
                    resizeTable: true
                }
            });

            dataTable.columns.adjust().draw();

            $('#' + id).find('#previous').on('click', function (e, i) {
                if (activePage == 0) {
                    $(this).parent().addClass('disabled');
                    $(this).parent().addClass('hidden');

                    return;
                }
                else {
                    activePage = activePage - 1;
                    var pageInfo = {
                        'visualizationID': id.replace("table-content-", ""),
                        'activePageNo': activePage
                    }
                    broadcast.activePage = pageInfo;
                    broadcast.$broadcast('FlairBi:update-table', activePage);
                }
            });


            $('#' + id).find('#next').on('click', function (e, i) {
                activePage = activePage + 1;
                var pageInfo = {
                    'visualizationID': id.replace("table-content-", ""),
                    'activePageNo': activePage
                }
                broadcast.activePage = pageInfo;
                broadcast.$broadcast('FlairBi:update-table', activePage);
            });

            $("#viz_table_paginate").css('display', 'blobk')
            $($('#' + parentContainer.attr('id') + ' td.filter')).on('click', function () {
                if (isLiveEnabled) {
                    broadcast.$broadcast('FlairBi:livemode-dialog');
                    return;
                }
                readerTableChart.call(this.textContent, this, parentContainer)
            })

            parentContainer.select('.filterData')
                .on('click', applyFilter());

            parentContainer.select('.removeFilter')
                .on('click', clearFilter());

        }
    }

    var createBody = function (data) {
        var tbody = "<tbody>";
        data.forEach(function (d) {
            tbody += "<tr>";
            _dimension.forEach(function (item, index) {

                var style = {
                    'text-align': _textAlignmentForDimension[index],
                    // 'background-color': _cellColorForDimension[index],
                    'font-style': _fontStyleForDimension[index],
                    'font-weight': _fontWeightForDimension[index],
                    'font-size': _fontSizeForDimension[index] + "px",
                    'color': _textColorForDimension[index]
                };

                style = JSON.stringify(style);
                style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                tbody += "<td class='filter' filterValue=\"" + d[_dimension[index]] + "\" tag=\"" + item + "\"  style=\"" + style + "\">" + UTIL.getDimensionFormatedValue(d[_dimension[index]], _dimensionType[index]) + "</td>";
            });

            _measure.forEach(function (item, index) {
                var style = {
                    'text-align': _textAlignmentForMeasure[index],
                    //'background-color': _cellColorForMeasure[index],
                    'font-style': _fontStyleForMeasure[index],
                    'font-weight': _fontWeightForMeasure[index],
                    'font-size': _fontSizeForMeasure[index] + "px",
                    'color': _textColorForMeasure[index]
                };

                if (_textColorExpressionForMeasure[index].length > 0) {
                    style['color'] = UTIL.expressionEvaluator(_textColorExpressionForMeasure[index], d[_measure[index]], 'color');
                }
                if (_cellColorExpressionForMeasure[index].length > 0) {
                    // style['background-color'] = UTIL.expressionEvaluator(_cellColorExpressionForMeasure[index], d[_measure[index]], 'color');
                }

                style = JSON.stringify(style);
                style = style.replace(/","/g, ';').replace(/["{}]/g, '');
                tbody += "<td class='sum' tag=\"" + item + "\" style=\"" + style + "\">" + getIcon(index, d[_measure[index]]) + UTIL.getFormattedValue(d[_measure[index]], UTIL.getValueNumberFormat(index, _numberFormatForMeasure, d[_measure[index]])) + "</td>";

            });
            tbody += "</tr>";
        });

        tbody += "</tbody>";
        return tbody
    }
    function chart(selection) {
        _Local_data = _originalData = _data;
        if (_print && !_notification) {
            parentContainer = selection;
        }
        else {
            parentContainer = d3.select('#' + selection.id)
        }

        var svg = parentContainer;

        _local_svg = svg;

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
        var id = svg.attr('id');
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

    chart.showTotal = function (value) {
        if (!arguments.length) {
            return _isTotal;
        }
        _isTotal = value;
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

    chart.limit = function (value) {
        if (!arguments.length) {
            return _limit;
        }
        _limit = value;
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

module.exports = table;