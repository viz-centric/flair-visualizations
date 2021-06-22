var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var currentEvent = require('d3-selection');
var moment = require('moment');
var $ = require("jquery");

function util() {

    var privateMethods = function (precision) {
        if (precision < 0 || precision > 20) {
            throw new RangeError("Formatter precision must be between 0 and 20");
        }
        if (precision !== Math.floor(precision)) {
            throw new RangeError("Formatter precision must be an integer");
        }
    }

    var _boundTooltip = function (container, tooltip, pt) {
        var left = container.offsetLeft,
            width = container.offsetWidth,
            height = container.offsetHeight,
            top = 0;

        var tipLeft = tooltip.offsetLeft,
            tipWidth = tooltip.offsetWidth,
            tipHeight = tooltip.offsetHeight,
            tipTop = tooltip.offsetTop;

        if (tipLeft < left) {
            tooltip.style.left = left + "px";
        }

        if (tipLeft + tipWidth > left + width) {
            tooltip.style.left = (left + width - tipWidth) + 'px';
            if ((left + width - tipWidth) <= 0) {
                tooltip.style.left = '10px';
            }
        }

        if (tipTop < top) {
            tooltip.style.top = top + "px";
        }

        if (tipTop + tipHeight > top + height) {
            tooltip.style.top = (top + height - tipHeight) + 'px';
        }
    }

    var publicMethods = {

        ASCENDING: 1,
        DESCENDING: -1,

        showTooltip: function (tooltip) {
            if (tooltip) tooltip.style('visibility', 'visible');
        },


        updateTooltip: function (data, container, borderColor, chartType) {
            var pt = d3.mouse(container.node()),
                x = pt[0] + 20,
                y = pt[1];
            d3.getEvent = () => require("d3-selection").event;

            // if (notification) {
            //     this
            //         .style("left", d3.event.pageX - 50 + "px")
            //         .style("top", d3.event.pageY - 70 + "px")
            //         .style('border', 'solid 2px')
            //         .style('border-color', borderColor)
            //         .style("display", "inline-block")
            //         .html(data);
            // }
            // else {

            var tooltip = this.node()
            var c = container.node();
            var left = c.clientLeft,
                width = c.clientWidth,
                height = c.clientHeight,
                top = 0;

            this.style('Top', y + 'px')
                .style('Left', x + 'px')
                .style('border', 'solid 2px')
                .style('border-color', borderColor)
                .html(data)
                .style('max-width', width - 20 + "px");

            var tipLeft = tooltip.offsetLeft,
                tipWidth = tooltip.offsetWidth,
                tipHeight = tooltip.offsetHeight,
                tipTop = tooltip.offsetTop;

            //setting tooltip position    
            // to do  
            if (tipLeft < left) {
                tooltip.style.left = left + "px";
            }
            else {
                tooltip.style.left = (left + width - tipWidth - 20) - (width - x) + 'px';
            }

            if (tipLeft + tipWidth > left + width) {
                tooltip.style.left = (left + width - tipWidth - 20) - (width - x) + 'px';
                if ((left + width - tipWidth - 20) - (width - x) <= 0) {
                    tooltip.style.left = '10px';
                }
            }
            else {
                if (parseInt(container.node().getAttribute('width')) - x <= (tipWidth + 20)) {
                    tooltip.style.left = (left + width - tipWidth - 20) - (width - x) + 'px';
                    if (((left + width - tipWidth - 20) - (width - x)) <= 0) {
                        tooltip.style.left = '10px';
                    }
                }
                else {
                    tooltip.style.left = x + 'px';
                }
            }

            if (tipTop < top) {
                tooltip.style.top = top + "px";
            }

            if (tipTop + tipHeight > top + height) {
                tooltip.style.top = (top + height - tipHeight) + 'px';
            }
        },

        hideTooltip: function (tooltip) {
            if (tooltip) tooltip.style('visibility', 'hidden');
        },

        getVisibility: function (isVisible) {
            if (isVisible) {
                return 'visible';
            }
            return 'hidden';
        },
        setAxisColor: function (_local_svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis) {
            var svg = _local_svg;

            svg.selectAll('.y_axis text')
                .style('fill', _yAxisColor)

            svg.selectAll('.x_axis text')
                .style('fill', _xAxisColor)

            svg.selectAll('.y_axis path')
                .style('stroke', _yAxisColor)

            svg.selectAll('.x_axis path')
                .style('stroke', _xAxisColor)

            svg.selectAll('.y_axis line')
                .style('stroke', _yAxisColor)

            svg.selectAll('.x_axis line')
                .style('stroke', _xAxisColor)

            svg.selectAll('.x_axis .tick')
                .style('visibility', UTIL.getVisibility(_showXaxis))

            svg.selectAll('.y_axis .tick')
                .style('visibility', UTIL.getVisibility(_showYaxis))

        },

        getSum: function (data, key) {
            var sum = 0;

            data.forEach(function (d) {
                sum += d[key];
            });

            return sum;
        },
        /**
         * Sorts the data based upon the order and keys
         *
         * @param {array} data Array of objects that needs to be sorted
         * @param {array} keys Array of string (key) that will be used for sorting
         * @param {string} order 'Ascending' or 'Descending' order of sort
         * @return {null}
         */
        sorter: function (data, keys, order) {
            var _sorter = function (x, y, index) {
                if (typeof (keys[index]) == 'undefined') {
                    return 0;
                }

                return +x[keys[index]] > +y[keys[index]] ? -1
                    : +x[keys[index]] < +y[keys[index]] ? 1
                        : _sorter(x, y, index + 1);
            }

            /* sort ascending */
            if (order === 1) {
                data.sort(function (x, y) {
                    return _sorter(y, x, 0);
                });
            }
            /* sort descending */
            else if (order === -1) {
                data.sort(function (x, y) {
                    return _sorter(x, y, 0);
                });
            }
        },
        alternateDimensionHorizontalPosition(arrowDom, sortType, chartType, sortSelectDom, plot) {
            var tipWidth = sortSelectDom.offsetWidth,
                tipHeight = sortSelectDom.offsetHeight;

            arrowDom.style.top = plot / 2 + tipHeight / 2 + "px";
            arrowDom.style.left = "20px";
        },
        positionDownArrow: function (container, arrowDom, sortType, isFilter, chartType, sortSelectDom, plot) {
            var left = container.offsetLeft,
                width = container.offsetWidth,
                height = container.offsetHeight,
                top = 0;

            if (chartType == null || chartType == undefined) {
                chartType = "vertical";
            }

            var offsetLeft,
                offsetTop = 40;

            if (isFilter && chartType == "vertical") {
                offsetTop = offsetTop + COMMON.PADDING + parseInt(d3.select(container).select('.filterElement').attr('height'));
            }
            switch (sortType.toLowerCase()) {
                case "ascending":
                    offsetLeft = 78;
                    break;

                case "descending":
                    offsetLeft = 54;
                    break;

                case "alternatedimension":
                    offsetLeft = width / 2;
                    break;
            }

            if (isFilter && chartType == "horizontal" && sortType.toLowerCase() == "ascending") {
                offsetLeft = 78 + parseInt(d3.select(container).select('.filterElement').attr('width'));
            }

            if (isFilter && chartType == "horizontal" && sortType.toLowerCase() == "descending") {
                offsetLeft = 54 + parseInt(d3.select(container).select('.filterElement').attr('width'));
            }

            if (sortType == "alternatedimension" && chartType == "horizontal") {
                this.alternateDimensionHorizontalPosition(arrowDom, sortType, chartType, sortSelectDom, plot);
            }
            else {
                arrowDom.style.left = (left + width - offsetLeft) + 'px';
                arrowDom.style.top = (top + height - offsetTop) + 'px';
            }

        },
        positionSortSelection: function (container, sortSelectDom, isFilter, chartType, sortType, plot) {
            var left = container.offsetLeft,
                width = container.offsetWidth,
                height = container.offsetHeight,
                top = 0;

            if (chartType == null || chartType == undefined) {
                chartType = "vertical";
            }
            var tipWidth = sortSelectDom.offsetWidth,
                tipHeight = sortSelectDom.offsetHeight;

            var offsetLeft = 11,
                offsetTop = 40;

            if (sortType == "alternatedimension" && chartType == "vertical") {
                offsetLeft = plot / 2;
                tipWidth = tipWidth / 2;
            }

            if (isFilter && chartType == "vertical" || isFilter && chartType == "alternatedimension") {
                offsetTop = offsetTop + COMMON.PADDING + parseInt(d3.select(container).select('.filterElement').attr('height'));
            }
            if (isFilter && chartType == "horizontal") {
                offsetLeft = offsetLeft + COMMON.PADDING + parseInt(d3.select(container).select('.filterElement').attr('width'));
            }

            sortSelectDom.style.left = (left + width - tipWidth - offsetLeft) + 'px';
            sortSelectDom.style.top = (top + height - tipHeight - offsetTop) + 'px';

            if (sortType == "alternatedimension" && chartType == "horizontal") {
                sortSelectDom.style.top = plot / 2 + "px";
                sortSelectDom.style.left = "30px";
            }
        },
        getDimensionFormatedValue(value, type) {
            if (typeof (value) === 'undefined') {
                return "";
            }
            if (value === null) {
                value = "null";
                return value;
            }
            value = value.toString();
            if (COMMON.COMPARABLE_DATA_TYPES.indexOf(type) !== 1 && value.endsWith("00:00:00.000000")) {
                value = value.replace("00:00:00.000000", "")
            }

            if (COMMON.COMPARABLE_DATA_TYPES.indexOf(type) !== 1 && value.endsWith(".000000")) {
                value = value.replace(".000000", "")
            }
            return value;
        },

        getDateFormateString: function (format) {
            var value;
            switch (format) {
                case 'None':
                    value = "YYYY-MM-DD HH:mm:ss.SSSSSS"
                    break;
                case 'DD:MON':
                    value = "DD-MMM"
                    break;
                case 'HH24:MI':
                    value = "HH:mm"
                    break;
                case 'HH24:MI.SSSS':
                    value = "HH:mm.SSSS"
                    break;
                case 'DD-MON HH24:MI':
                    value = "DD-MMM HH:mm"
                    break;
                default:
                    value = "YYYY-MM-DD HH:mm:ss.SSSSSS"
                    break;
            }
            return value;
        },
        getTruncatedTick: function (label, containerLength, scale, type, format) {
            if (typeof (label) === 'undefined') {
                return "";
            }

            if (label === null) {
                label = "null";
            }

            label = label.toString();
            if (format) {
                format = this.getDateFormateString(format);
                var _dateFormat = "YYYY-MM-DD HH:mm:ss.SSSSSS";
                if (COMMON.COMPARABLE_DATA_TYPES.indexOf(type) !== 1) {
                    label = moment(label, _dateFormat).format(format)
                }
            }

            if (COMMON.COMPARABLE_DATA_TYPES.indexOf(type) !== -1 && label.endsWith("00:00:00.000000")) {
                label = label.replace("00:00:00.000000", "")
            }

            var truncLabel = label,
                arr = label.split('');

            if (scale != undefined && scale.invert(label.length) >= containerLength) {
                var charLength = Math.floor(scale(containerLength)) - 3;
                charLength = (charLength < 0) ? 0 : charLength;
                if ((label.length) <= containerLength) {
                    charLength = charLength / 2;
                }
                truncLabel = arr.splice(0, charLength).join('') + '...';
            }

            return truncLabel;
        },
        getTruncatedLabel: function (element, label, containerLength, offset) {
            if (typeof (label) === 'undefined') {
                return "";
            }

            if (label === null) {
                label = "null";
            }

            label = label.toString();

            if (offset === void 0) {
                offset = 0;
            }

            offset += 3;

            var truncLabel = label,
                arr = label.split('');

            if (containerLength < element.getComputedTextLength()) {
                var charLength = parseInt(containerLength * element.getNumberOfChars() / element.getComputedTextLength()) - offset;
                charLength = (charLength < 0) ? 0 : charLength;
                truncLabel = arr.splice(0, charLength).join('') + '...';
            }

            return truncLabel;
        },

        getTickRotate: function (label, containerLength, scale) {
            var isRotate = false;
            if (typeof (label) === 'undefined') {
                return isRotate;
            }
            if (label === null) {
                return isRotate;
            }

            if (scale != undefined && scale.invert(label.length) >= containerLength) {
                isRotate = true;
                if ((label.length) <= containerLength) {
                    isRotate = false;
                }
            }
            return isRotate;
        },

        /**
         * Provides D3's number formatting function
         *
         * @param {string} si Type of Number format to be used
         * @return {function}
         */
        getNumberFormatterFn: function (si, value) {
            if (si === void 0) {
                si = "Actual";
            }
            var result;

            var siMapper = {
                "K": "1e3",
                "M": "1e6",
                "B": "1e9",
            };

            switch (si) {
                case "Actual":
                    {
                        if (value % 1 == 0)
                            result = d3.format('');
                        else
                            result = d3.format('.2f');
                        break;
                    }
                    break;
                case "Percent":
                    result = d3.format('.0%');
                    break;
                default:
                    result = d3.formatPrefix('.2s', siMapper[si]);
                    break;
            }

            return result;
        },

        /**
         * Rounds a number to a given number of digits
         *
         * @param {array} data Array of objects that needs to be sorted
         * @param {array} keys Array of string (key) that will be used for sorting
         * @param {string} order 'Ascending' or 'Descending' order of sort
         * @return {null}
         */
        roundNumber: function (num, scale) {
            if (typeof (scale) == 'undefined') {
                throw new Error('Scale is not specified');
            }

            var exp1 = "e+" + scale,
                exp2 = "e-" + scale;

            label = label.toString();

            var truncLabel = label,
                arr = label.split('');

            if (scale != undefined && scale.invert(label.length) >= containerLength) {
                var charLength = Math.floor(scale(containerLength)) - 3;
                charLength = (charLength < 0) ? 0 : charLength;
                truncLabel = arr.splice(0, charLength).join('') + '...';
            }

            return truncLabel;
        },
        getTruncatedLabel: function (element, label, containerLength, offset) {
            if (typeof (label) === 'undefined') {
                return "";
            }

            if (label === null) {
                label = "null";
            }

            label = label.toString();

            if (offset === void 0) {
                offset = 0;
            }

            offset += 3;

            var truncLabel = label,
                arr = label.split('');

            if (containerLength < element.getComputedTextLength()) {
                var charLength = parseInt(containerLength * element.getNumberOfChars() / element.getComputedTextLength()) - offset;
                charLength = (charLength < 0) ? 0 : charLength;
                truncLabel = arr.splice(0, charLength).join('') + '...';
                truncLabel = truncLabel == '...' ? '' : truncLabel;
            }

            return truncLabel;
        },

        shortScale: function (precision) {
            if (precision === void 0) { precision = 3; }
            privateMethods(precision);
            var suffixes = "KMBTQ";
            var fixedFormatter = d3.format("." + precision + "f");
            var exponentFormatter = d3.format("." + precision + "e");

            var max = Math.pow(10, (3 * (suffixes.length + 1)));
            var min = Math.pow(10, -precision);
            return function (num) {
                var absNum = Math.abs(num);
                if ((absNum < min || absNum >= max) && absNum !== 0) {
                    return exponentFormatter(num);
                }
                var idx = -1;
                while (absNum >= Math.pow(1000, idx + 2) && idx < (suffixes.length - 1)) {
                    idx++;
                }
                var output = "";
                if (idx === -1) {
                    output = fixedFormatter(num);
                    output = parseFloat(output).toString();
                }
                else {
                    output = fixedFormatter(num / Math.pow(1000, idx + 1));
                    output = parseFloat(output) + suffixes[idx];
                }

                if ((num > 0 && output.substr(0, 4) === "1000") || (num < 0 && output.substr(0, 5) === "-1000")) {
                    if (idx < suffixes.length - 1) {
                        idx++;
                        output = fixedFormatter(num / Math.pow(1000, idx + 1));
                        output = parseFloat(output) + suffixes[idx];
                    }
                    else {
                        output = exponentFormatter(num);
                    }
                }
                return output;
            };
        },

        getNumberFormatter: function (si) {
            var result;
            var siMapper = {
                "K": "1e3",
                "M": "1e6",
                "B": "1e9",
            };

            switch (si) {
                case "Actual":
                    result = d3.format('.2f');
                    break;
                case "Percent":
                    result = d3.format('.0%');
                    break;
                default:
                    result = d3.formatPrefix('.2s', siMapper[si]);
                    break;
            }

            return result;
        },

        getFormattedValue: function (value, numberFormat) {
            value = numberFormat(value);

            if (value.indexOf("G") != -1) {
                value = value.slice(0, -1) + " B";
            } else if (value.indexOf("M") != -1) {
                value = value.slice(0, -1) + " M";
            } else if (value.indexOf("k") != -1) {
                value = value.slice(0, -1) + " K";
            } else if (value.indexOf("%") != -1) {
                value = value.slice(0, -1) + " %";
            }

            return value;
        },

        createAlert: function (id, _measure) {
            var output = "";

            output += '<div id="Modal_' + id + '" class="modal fade alter Modal_alert" role="dialog">' +
                '<div class="modal-dialog" role="document">' +
                '<div class="modal-content">' +
                '<div class="modal-header">' +
                ' <h5 class="modal-title" id="exampleModalLabel">Alert Criteria</h5>' +
                '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
                '<span aria-hidden="true">&times;</span>' +
                '</button>' +
                ' </div>' +
                '<div class="modal-body">' +
                '<form>' +
                '<div class="form-group">' +
                '<label for="recipient-name" class="col-form-label">Measure:</label>' +
                ' <select class="form-control measure" id="measure">';

            for (var index = 0; index < _measure.length; index++) {
                output += '<option >' + _measure[index] + '</option>'
            }

            output += ' </select>' +
                '</div>' +
                '<div class="form-group">' +
                '<label for="message-text" class="col-form-label">Threshold :</label>' +
                '<input type="number" class="form-control threshold" id="threshold"></textarea>' +
                '</div>' +
                '</form>' +
                '</div>' +
                '<div class="modal-footer">' +
                '<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>' +
                ' <button type="button" class="btn btn-primary ThresholdSubmit" >Submit</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';

            return output;
        },

        createFilterElement: function () {
            var _filter = '<div class="confirm" style="visibility: hidden;">' +
                '<button class="btn btn-filters filterData btn-primary">' +
                '  <i class="fa fa-check"></i>' +
                '</button>' +
                '<button class="btn btn-filters removeFilter btn-default">' +
                '    <i class="fa fa-times"></i>' +
                '</button>' +
                '</div>';
            return _filter
        },

        createAlertElement: function (id) {
            var _filter = '<div class="filterToggal" id="filter_' + id + '" > <label class="switch">' +
                '<input type="checkbox" checked class="alert">' +
                '<span class="slider round"></span>' +
                '</label></div>';
            return _filter
        },

        displayThreshold: function (threshold, data, keys) {
            for (var index = 0; index < threshold.length; index++) {
                data.filter(function (val) {
                    for (var j = 0; j < keys.length; j++) {
                        if (threshold[index]["measure"] == keys[j]) {
                            if (val[keys[j]] > threshold[0]["threshold"]) {
                                alert('threshold value :' + threshold[0]["threshold"] + " measure: " + keys[j]);
                            }
                        }
                    }
                });
            }
        },

        getDisplayColor: function (index, _measureProp) {
            if (_measureProp[index] == "" || _measureProp[index] == null || _measureProp[index] == undefined) {
                return COMMON.COLORSCALE(index);
            }
            return _measureProp[index]
        },

        getBorderColor: function (index, _measureProp) {
            if (_measureProp[index] == "" || _measureProp[index] == null || _measureProp[index] == undefined) {
                return COMMON.COLORSCALE(index);
            }
            return _measureProp[index];
        },
        sortData: function (data, keys, sortOrder) {
            if (typeof (keys) == 'string') {
                // If keys is string then convert it to array
                keys = [keys];
            }

            // keys must be array type with some entry
            if (typeof (keys.length) == 'undefined') {
                throw "Unsupported data type";
            } else if (keys.length == 0) {
                throw "Empty value exception";
            }

            if (typeof (sortedData) == 'undefined') {
                sortedData = "ascending";
            }

            var sortedData = jQuery.extend(true, [], data); // deep copy

            var _sorter = function (x, y, index) {
                if (typeof (keys[index]) == 'undefined') {
                    return 0;
                }

                return x[keys[index]] > y[keys[index]] ? 1 : x[keys[index]] < y[keys[index]] ? -1 : _sorter(x, y, index + 1);
            }

            if (sortOrder == 'ascending') {
                sortedData.sort(function (x, y) {
                    return _sorter(y, x, 0);
                });
            } else if (sortOrder == 'descending') {
                sortedData.sort(function (x, y) {
                    return _sorter(x, y, 0);
                });
            }

            return sortedData;
        },

        toggleSortSelection: function (sortType, callback, _local_svg, _measure, _Local_data, isFilter, chartType) {
            var me = this;
            var _onRadioButtonClick = function (event) {
                //  $(this).closest('.sort_selection').parent().find('.plot').remove();
                var filterConfig = {}
                filterConfig.key = event.data.measure;
                filterConfig.sortType = sortType;
                filterConfig.isFilter = true;
                callback.call(_local_svg, me.sortData(_Local_data, event.data.measure, sortType), filterConfig);
                var container = _local_svg.node().parentNode;
                $(container).find('.sort_selection').css('visibility', 'hidden');
                $(container).find('.arrow-down').css('visibility', 'hidden');
            }

            //  d3.event.stopPropagation();
            var div = _local_svg.node().parentNode
            var sortWindow = d3.select(div).select('.sort_selection')
                .style('visibility', 'visible');

            sortWindow.selectAll('div').remove();

            var downArrow = d3.select(div).select('.arrow-down')
                .style('visibility', 'visible');

            var options,
                selected;

            for (var i = 0; i < _measure.length; i++) {
                var _divRadio = $('<div></div>').addClass('radio');
                options = '<label><input type="radio" '
                    + (selected == _measure[i] ? 'checked' : '')
                    + ' name="optradio">'
                    + _measure[i]
                    + '</label>';

                _divRadio.append(options);
                $(sortWindow.node()).append(_divRadio);

                _divRadio.find('input').click({
                    data: _Local_data,
                    measure: _measure[i]
                }, _onRadioButtonClick);
            }

            this.positionDownArrow(div, downArrow.node(), sortType, isFilter, chartType, sortWindow.node());
            this.positionSortSelection(div, sortWindow.node(), isFilter, chartType);

        },

        getValueNumberFormat: function (index, _measureProp, value) {
            var si = _measureProp[index],
                siMapper = {
                    "K": "1e3",
                    "M": "1e6",
                    "B": "1e9",
                };
            var result;
            switch (si) {
                case "Actual":
                    {
                        if (value % 1 == 0)
                            result = d3.format('');
                        else
                            result = d3.format('.2f');
                        break;
                    }

                case "Percent":
                    result = d3.format('.0%');
                    break;
                default:
                    result = d3.formatPrefix('.2s', siMapper[si]);
                    break;
            }
            return result;
        },
        setAxisColor: function (_local_svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis) {
            var svg = _local_svg;

            svg.selectAll('.y_axis text')
                .style('fill', _yAxisColor)

            svg.selectAll('.x_axis text')
                .style('fill', _xAxisColor)

            svg.selectAll('.y_axis path')
                .style('stroke', _yAxisColor)

            svg.selectAll('.x_axis path')
                .style('stroke', _xAxisColor)

            svg.selectAll('.y_axis line')
                .style('stroke', _yAxisColor)

            svg.selectAll('.x_axis line')
                .style('stroke', _xAxisColor)

            svg.selectAll('.x_axis .tick')
                .style('visibility', _showXaxis == true ? 'visible' : 'hidden');

            svg.selectAll('.y_axis .tick')
                .style('visibility', _showYaxis == true ? 'visible' : 'hidden');

        },
        getMeasureList: function (data, dimension, measure) {
            var keys = Object.keys(data);
            keys.splice(keys.indexOf(dimension[0]), 1);

            if (measure) {
                var newList = [];
                newList = measure.filter(function (val) {
                    var o = keys.find(x => x == val) || null
                    if (o != null) {
                        return val;
                    }
                })
                return newList;
            }
            return keys;
        },
        sortingData: function (data, key) {
            data.sort(function (a, b) {
                var textA = a[key];
                var textB = b[key];
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
            return data;
        },
        getExpressionConfig: function (expression, args) {
            var config = [],
                temp,
                obj;

            if (!expression || !args.length) {
                return [];
            }

            try {
                expression = expression.split('|');

                expression.forEach(function (item) {
                    obj = {};
                    temp = item.split(',').map(function (c) { return c.trim(); });
                    obj[temp[0].toLowerCase()] = parseFloat(temp[1]) || null;
                    args.forEach(function (arg, i) {
                        obj[arg] = temp[i + 2];
                    });
                    config.push(obj);
                });
            } catch (e) {
                console.error(e);
                throw new Error('Invalid expression format');
            }

            return config;
        },
        roundNumber: function (num, scale) {
            if (typeof (scale) == 'undefined') {
                throw new Error('Scale is not specified');
            }

            var exp1 = "e+" + scale,
                exp2 = "e-" + scale;

            return +(Math.round(num + exp1) + exp2);
        },
        expressionEvaluator: function (expression, value, key) {
            var result = expression.filter(function (t) {
                return t.hasOwnProperty('default');
            });

            if (result.length) {
                result = result[0][key];
            }

            for (var i = 0; i < expression.length; i++) {
                var property = expression[i];
                if (property.hasOwnProperty('upto')) {
                    if (value <= property.upto) {
                        result = property[key];
                        break;
                    }
                } else if (property.hasOwnProperty('above')) {
                    if (value > property.above) {
                        result = property[key];
                        break;
                    }
                }
                else if (property.hasOwnProperty('below')) {
                    if (value < property.below) {
                        result = property[key];
                        break;
                    }
                }
                else if (property.hasOwnProperty('default')) {
                    result = property[key];
                    break;
                }
            }
            return result;
        },

        getFilterData: function (labelStack, filterParameter, data) {
            if (labelStack.indexOf(filterParameter) == -1) {
                labelStack.push(filterParameter);
            } else {
                labelStack.splice(labelStack.indexOf(filterParameter), 1);
            }

            var _filter = []
            data.map(function (val) {
                var obj = new Object();
                var key = Object.keys(val)
                for (var index = 0; index < key.length; index++) {
                    if (labelStack.indexOf(key[index]) == -1) {
                        obj[key[index]] = val[key[index]]
                    }
                }
                _filter.push(obj);
            });
            return _filter;
        },

        getFilterDataForPie: function (labelStack, filterParameter, data, dimension) {
            if (labelStack.indexOf(filterParameter) == -1) {
                labelStack.push(filterParameter);
            } else {
                labelStack.splice(labelStack.indexOf(filterParameter), 1);
            }

            var _filter = []
            _filter = data.filter(function (val) {
                return labelStack.indexOf(val[dimension]) === -1;
            });
            return _filter;
        },

        getFilterDataForLegend: function (labelStack, data) {
            var _filter = []
            data.map(function (val) {
                var obj = new Object();
                var key = Object.keys(val)
                for (var index = 0; index < key.length; index++) {
                    if (labelStack.indexOf(key[index]) == -1) {
                        obj[key[index]] = val[key[index]]
                    }
                }
                _filter.push(obj);
            });
            return _filter;
        },

        sortingView: function (container, parentHeight, parentWidth, legendBreakCount, axisLabelSpace, offsetX, visibility) {

            var sortButton = container.append('g')
                .attr('class', 'sort')
                .style('visibility', this.getVisibility(visibility))
                .attr('transform', function () {
                    return 'translate(0, ' + parseInt((parentHeight - 2 * COMMON.PADDING + 20 + (legendBreakCount * 20))) + ')';
                })

            var ascendingSort = sortButton.append('svg:text')
                .attr('fill', '#afafaf')
                .attr('class', 'ascending')
                .attr('cursor', 'pointer')
                .style('font-family', 'FontAwesome')
                .style('font-size', 12)
                .attr('transform', function () {
                    return 'translate(' + (parentWidth - 3 * offsetX) + ', ' + 2 * axisLabelSpace + ')';
                })
                .style('text-anchor', 'end')
                .text(function () {
                    return "\uf161";
                })

            var descendingSort = sortButton.append('svg:text')
                .attr('fill', '#afafaf')
                .attr('class', 'descending')
                .attr('cursor', 'pointer')
                .style('font-family', 'FontAwesome')
                .style('font-size', 12)
                .attr('transform', function () {
                    return 'translate(' + (parentWidth - 1.5 * offsetX) + ', ' + 2 * axisLabelSpace + ')';
                })
                .style('text-anchor', 'end')
                .text(function () {
                    return "\uf160";
                })

            var resetSort = sortButton.append('svg:text')
                .attr('fill', '#afafaf')
                .attr('class', 'reset')
                .attr('cursor', 'pointer')
                .style('font-family', 'FontAwesome')
                .style('font-size', 12)
                .attr('transform', function () {
                    return 'translate(' + parentWidth + ', ' + 2 * axisLabelSpace + ')';
                })
                .style('text-anchor', 'end')
                .text(function () {
                    return "\uf0c9";
                })
        },

        toggleAlternateDimensionIcon: function (axisGroup, plotWidth, _showXaxisLabel, _xAxisColor, isUpdate, print, alternateDimension, chartType) {
            if (!print) {
                var x = axisGroup.select('.alternateDimension').node().getComputedTextLength() / 2 + (plotWidth / 2) + 5;
                var y = parseFloat((COMMON.AXIS_THICKNESS / 1.5) + COMMON.PADDING);
                var text = "\uf0d7";
                var alternateDimensionList = alternateDimension === null ? 0 : JSON.parse(alternateDimension).length;
                if (chartType === "horizontal") {
                    x = -45;
                    text = "\uf0da";
                    y = (plotWidth / 2) - axisGroup.select('.alternateDimension').node().getComputedTextLength() / 2;
                }

                var visibility = 'hidden';
                if (_showXaxisLabel && alternateDimension !== null)
                    visibility = alternateDimensionList > 0 ? 'visible' : 'hidden';
                if (!isUpdate) {
                    axisGroup.append('g')
                        .attr('transform', function () {
                            return 'translate(' + x + ', ' + y + ')';
                        })
                        .attr('class', 'icon')
                        .append('text')
                        .style('font-family', 'FontAwesome')
                        .style('fill', _xAxisColor)
                        .attr('visibility', visibility)
                        .text(function () {
                            return text;
                        });
                }
                else {
                    axisGroup.select('.icon')
                        .attr('transform', function () {
                            return 'translate(' + x + ', ' + y + ')';
                        })
                        .attr('visibility', visibility);
                }

            }
        },

        toggleAlternateDimension: function (broadcast, plot, _local_svg, alternateDimension, id, isFilter, chartType, displayName) {
            var me = this;
            var selectedFeature = JSON.parse(alternateDimension);
            if (selectedFeature.length > 0) {
                var _onRadioButtonClick = function (event) {
                    event.data.selectedFeature.id = id;
                    console.log(event.data.selectedFeature.featureName);
                    broadcast.$broadcast('flairbiApp:registerAlternateDimension', event.data.selectedFeature);
                    var container = _local_svg.node().parentNode;
                    $(container).find('.sort_selection').css('visibility', 'hidden');
                    $(container).find('.arrow-down').css('visibility', 'hidden');
                    $(container).find('.arrow-left').css('visibility', 'hidden');
                }

                //  d3.event.stopPropagation();
                var div = _local_svg.node().parentNode
                var sortWindow = d3.select(div).select('.sort_selection')
                    .style('visibility', 'visible');

                sortWindow.selectAll('div').remove();

                var downArrow = d3.select(div).select('.arrow-down')
                    .style('visibility', 'visible');

                if (chartType == "horizontal") {
                    downArrow = d3.select(div).select('.arrow-left')
                        .style('visibility', 'visible');
                }

                var options,
                    selected;

                for (var i = 0; i < selectedFeature.length; i++) {
                    var _divRadio = $('<div></div>').addClass('radio');
                    options = '<label><input type="radio" '
                        + (displayName == selectedFeature[i].featureName ? 'checked' : '')
                        + ' name="optradio">'
                        + selectedFeature[i].featureName
                        + '</label>';

                    _divRadio.append(options);
                    $(sortWindow.node()).append(_divRadio);

                    _divRadio.find('input').click({

                        selectedFeature: selectedFeature[i]
                    }, _onRadioButtonClick);
                }

                this.positionDownArrow(div, downArrow.node(), "alternatedimension", isFilter, chartType, sortWindow.node(), plot);
                this.positionSortSelection(div, sortWindow.node(), isFilter, chartType, "alternatedimension", plot);
            }

        },
        /**
       * Base accessor function
       *
       * @param {string|array(string)|null} value "this" value for the measure(s)
       * @param {string|null} measure Measure for which the value is to be set or retrieved
       * @param {array(string)} measures All the available measures
       * @return {string|array(string)|function}
       */
        baseAccessor: function (value, measure, measures, chart) {
            var me = this;

            if (!arguments.length) {
                /**
                 * Getter method call with no arguments
                 * E.g. <chart>.<accessor_function>() ==> [<item1>, <item2>]
                 */
                return me;
            }

            if (value != void 0 && measure == void 0) {
                /**
                 * Setter method call with only value argument
                 * E.g. <chart>.<accessor_function>([<item1>, <item2>]) ==> <chart_function>
                 */
                if (value instanceof Array) {
                    me.splice(0, me.length);
                } else {
                    value = measures.map(function (i) { return value; });
                }

                me.push.apply(me, value);
                return chart;
            }

            var index = measures.indexOf(measure);

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
        },

        title: function (str) {
            var r = '';
            r = str.charAt(0).toUpperCase() + str.substring(1);
            return r;
        },
        convertToNumber: function (str) {
            return parseFloat(str.replace(/,/g, ''));
        },
        getMinMax: function (data, keys) {

            var max = d3.max(data, function (d) {
                return d3.max(keys, function (key) {
                    return parseFloat(d[key]);
                });
            })

            var min = d3.min(data, function (d) {
                return d3.min(keys, function (key) {
                    return parseFloat(d[key]);
                });
            })
            if (min > 0) {
                min = 0;
            }
            if (max < 0 && min < 0) {
                max = 0;
            }
            return [min, max];
        },
        setPlotPosition: function (_legendPosition, _showXaxis, _showYaxis, _showLegend, margin, legendSpace, legendBreakCount, axisLabelSpace, _local_svg) {
            var position = 'translate(' + (_showYaxis == true ? margin : 0) + ', ' + parseInt(legendSpace * 2 + (20 * parseInt(legendBreakCount))) + ')';
            if (_legendPosition.toUpperCase() == 'TOP') {
                position = 'translate(' + (_showYaxis == true ? margin : 0) + ', ' + parseInt(legendSpace * 2 + (20 * parseInt(legendBreakCount))) + ')';
            } else if (_legendPosition.toUpperCase() == 'BOTTOM') {
                position = 'translate(' + (_showYaxis == true ? margin : 0) + ', 0)';
            } else if (_legendPosition.toUpperCase() == 'LEFT') {
                position = 'translate(' + (legendSpace + (_showYaxis == true ? margin : 0) + axisLabelSpace) + ', 0)';
            } else if (_legendPosition.toUpperCase() == 'RIGHT') {
                position = 'translate(' + (_showYaxis == true ? margin : 0) + ', 0)';
            }

            if (!_showLegend) {
                _local_svg.select('.plot')
                    .attr('transform', function () {
                        position = 'translate(' + margin + ', ' + 0 + ')';
                    });
            }
            if (!_showXaxis && !_showLegend) {
                _local_svg.select('.plot')
                    .attr('transform', function () {
                        position = 'translate(' + 0 + ', ' + 0 + ')';
                    });
            }
            return position;
        },
        setAxisColor: function (_xAxisColor, _showXaxis, _yAxisColor, _showYaxis, _local_svg) {

            _local_svg.select('g.x_axis path')
                .style('stroke', _xAxisColor);

            _local_svg.selectAll('g.x_axis .tick')
                .attr('visibility', this.getVisibility(_showXaxis));

            _local_svg.selectAll('g.x_axis .tick text')
                .style('fill', _xAxisColor);

            _local_svg.select('g.y_axis path')
                .style('stroke', _yAxisColor);

            _local_svg.selectAll('g.y_axis .tick')
                .attr('visibility', this.getVisibility(_showYaxis));

            _local_svg.selectAll('g.y_axis .tick text')
                .style('fill', _yAxisColor);

            _local_svg.selectAll('.grid line')
                .style('stroke', '#787878')
                .style('stroke-opacity', '0.5');

        },
        setAxisGridVisibility: function (tickLine, _local_svg, _showGrid, d) {
            if (d == 0) {
                _local_svg.selectAll('g.base_line').classed('base_line', false);
                d3.select(tickLine.parentNode).classed('base_line', true);
                d3.select(tickLine.parentNode).select('line')
                    .style('stroke', '#787878')
                    .style('stroke-width', '2px')
                    .style('stroke-opacity', '1')
                    .style('visibility', 'visible');
            }
            else {
                _local_svg.selectAll('g.base_line').classed('base_line', false);
                d3.select(tickLine.parentNode)
                    .style('visibility', function () {
                        return _showGrid == true ? 'visible' : 'hidden'
                    })
                    .style('stroke', '#787878')
                    .style('stroke-width', '1px')
                    .style('stroke-opacity', '0.5')
            }
        },
        getFilterDataForGrid: function (_data, filterList, key) {
            filterData = []
            _data.map(function (val) {
                if (filterList.indexOf(val[key]) >= 0) {
                    filterData.push(val);
                }
            })
            return filterData;
        },
        defaultColours: function () {
            return ["#439dd3",
                "#0CC69A",
                "#556080",
                "#F0785A",
                "#F0C419",
                "#DBCBD8",
                "#D10257",
                "#BDDBFF",
                "#9BC9FF",
                "#8AD5DD",
                "#EFEFEF",
                "#FF2970",
                "#6DDDC2",
                "#778099",
                "#F3937B",
                "#F3D047",
                "#DA3579",
                "#8EA4BF"];
        },
        sortDateRange: function (list) {
            var sorttedList = list.sort(function (a, b) {
                return new Date(b) - new Date(a);
            });
            sorttedList = sorttedList.map(function (val) {
                return new Date(val);
            });
            return sorttedList;
        },
        getUniqueColour: function (index) {
            var r = parseInt(Math.abs(Math.sin(index + 50)) * 255),
                g = parseInt(Math.abs(Math.cos(index)) * 255),
                b = parseInt(Math.abs(Math.sin(7 * index - 100)) * 255);
            return d3.rgb(r, g, b);
        },
        hasDuplicates: function (array) {
            var valuesSoFar = Object.create(null);
            for (var i = 0; i < array.length; ++i) {
                var value = array[i];
                if (value in valuesSoFar) {
                    return true;
                }
                valuesSoFar[value] = true;
            }
            return false;
        },
        openSchedulerDialog: function (ID, measure, measureValue, dimension, dimensionValue, broadcast) {
            var ThresholdViz = {};
            ThresholdViz.ID = ID;
            ThresholdViz.measure = measure;
            ThresholdViz.measureValue = measureValue;
            ThresholdViz.dimension = dimension;
            ThresholdViz.dimensionValue = dimensionValue;
            broadcast.ThresholdViz = ThresholdViz;
            broadcast.$broadcast('FlairBi:threshold-dialog');
        },
        saveFilterParameters: function (broadcast, filterParameters, parentContainer, _filterDimension, dimension) {
            var idWidget = broadcast.updateWidget[parentContainer.attr('id')];
            broadcast.updateWidget = {};
            broadcast.updateWidget[parentContainer.attr('id')] = idWidget;
            broadcast.filterSelection.filter = _filterDimension;
            var _filterParameters = filterParameters.get();
            _filterParameters[dimension] = _filterDimension[dimension];
            filterParameters.save(_filterParameters);
        }
    }


    return publicMethods;

}


module.exports = util;