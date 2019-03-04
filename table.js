function table() {

    var _NAME = 'table';

    var _config,
        _dimension,
        _displayNameForDimension,
        _cellColorForDimension,
        _fontStyleForDimension,
        _fontWeightForDimension,
        _fontSizeForDimension,
        _textColorForDimension,
        _textColorExpressionForDimension,
        _textAlignmentForDimension,

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

    var getIcon = function (index) {
        if (getIconName(index) !== "") {
            return '<span style="display:block; text-align:' + getIconPosition(index) + ';"><i class="' + getIconName(index) + '" aria-hidden="true"></i></span>';
        }

        return "";
    }
    var getIconPosition = function (index) {
        return _iconPositionForMeasure[index];
    }
    var getIconName = function (index) {
        return _iconNameForMeasure[index];
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
            var disv = d3.select("#donut");
            $('#donut').css('width', width)
                .css('height', height).css('overflow-y', 'hidden').css('overflow-x', 'auto');

            var table = $('<table id="viz_table" class="display nowrap" style="width:100%"></table>').addClass('table table-condensed table-hover');

            var thead = "<thead><tr>",
                tbody = "<tbody>";

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
            });

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
            });

            thead += "</tr></thead>";
            table.append(thead);

            data.forEach(function (d) {
                tbody += "<tr>";
                _dimension.forEach(function (item, index) {
                    var style = {
                        'text-align': _textAlignmentForDimension[index],
                        'background-color': _cellColorForDimension[index],
                        'font-style': _fontStyleForDimension[index],
                        'font-weight': _fontWeightForDimension[index],
                        'font-size': _fontSizeForDimension[index],
                        'color': _textColorForDimension[index]
                    };

                    style = JSON.stringify(style);
                    style = style.replace(/","/g, ';').replace(/["{}]/g, '');
                    tbody += "<td style=\"" + style + "\">" + d[_dimension[index]] + "</td>";
                });

                _measure.forEach(function (item, index) {
                    var style = {
                        'text-align': _textAlignmentForMeasure[index],
                        'background-color': _cellColorForMeasure[index],
                        'font-style': _fontStyleForMeasure[index],
                        'font-weight': _fontWeightForMeasure[index],
                        'font-size': _fontSizeForMeasure[index],
                        'color': _textColorForMeasure[index]
                    };

                    style = JSON.stringify(style);
                    style = style.replace(/","/g, ';').replace(/["{}]/g, '');
                    tbody += "<td style=\"" + style + "\">" + getIcon(index) + UTIL.getFormattedValue(d[_measure[index]], UTIL.getValueNumberFormat(index, _numberFormatForMeasure)) + "</td>";
                });
                tbody += "</tr>";
            });

            tbody += "</tbody>";
            table.append(tbody);

            $('#donut').append(table);

            $('#donut').find('#viz_table').dataTable({
                scrollY: height - 150,
                scrollX: true,
                scrollCollapse: true,
                ordering: true,
                info: true,

                pagingType: "full_numbers",
                aLengthMenu: [[2, 5, 10, 15, 20, 25, -1], [2, 5, 10, 15, 20, 25, "All"]],
                iDisplayLength: 20,
                bDestroy: true,
                dom: '<"table-header">rt<"table-footer"lp>',
                fnDrawCallback: function (oSettings) {
                    if (oSettings._iDisplayLength > oSettings.fnRecordsDisplay()) {
                        $(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
                        $(oSettings.nTableWrapper).find('.dataTables_info').hide();
                    }
                }
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

    chart.fontWeightForMeasure=function(value){
        if (!arguments.length) {
            return _fontWeightForMeasure;
        }
        _fontWeightForMeasure = value;
        return chart;
    }

    return chart;
}