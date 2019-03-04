function util() {

    var _verifyPrecision = function (precision) {
        if (precision < 0 || precision > 20) {
            throw new RangeError('Formatter precision must be between 0 and 20');
        }
        if (precision !== Math.floor(precision)) {
            throw new RangeError('Formatter precision must be an integer');
        }
    }

    var _boundTooltip = function (container, tooltip) {
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

        updateTooltip: function (data, container,borderColor) {
            var pt = d3.mouse(container.node()),
                x = pt[0] + 15,
                y = pt[1] + 20;

            this.style('top', y + 'px')
                .style('left', x + 'px')
                .style('border',  'solid 2px'+borderColor)
                .html(data);

            _boundTooltip(container.node(), this.node());
        },

        hideTooltip: function (tooltip) {
            if (tooltip) tooltip.style('visibility', 'hidden');
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


        positionDownArrow: function (container, arrowDom, sortType) {
            var left = container.offsetLeft,
                width = container.offsetWidth,
                height = container.offsetHeight,
                top = 0;

            var offsetLeft,
                offsetTop = 40;

            switch (sortType.toLowerCase()) {
                case "ascending":
                    offsetLeft = 78;
                    break;

                case "descending":
                    offsetLeft = 54;
                    break;
            }

            arrowDom.style.left = (left + width - offsetLeft) + 'px';
            arrowDom.style.top = (top + height - offsetTop) + 'px';
        },
        positionSortSelection: function (container, sortSelectDom) {
            var left = container.offsetLeft,
                width = container.offsetWidth,
                height = container.offsetHeight,
                top = 0;

            var tipWidth = sortSelectDom.offsetWidth,
                tipHeight = sortSelectDom.offsetHeight;

            var offsetLeft = 11,
                offsetTop = 40;

            sortSelectDom.style.left = (left + width - tipWidth - offsetLeft) + 'px';
            sortSelectDom.style.top = (top + height - tipHeight - offsetTop) + 'px';
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

        getTruncatedTick: function (label, containerLength, scale) {
            if (typeof (label) === 'undefined') {
                return "";
            }

            if (label === null) {
                label = "null";
            }

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
                    result = d3.format('');
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

        getVisibility: function (isVisible) {
            if (isVisible) {
                return 'visible';
            }
            return 'hidden';
        },

        createAlert: function (id, _measure) {
            var output = "";

            output += '<div id="Modal_' + id + '" class="modal fade alter" role="dialog">' +
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

        displayThreshold: function(threshold,data,keys){
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

        toggleSortSelection: function (scope, sortType, callback, _local_svg, _measure, _Local_data) {
            var _onRadioButtonClick = function (event) {
                $(this).closest('.sort_selection').parent().find('.plot').remove();
                callback.call(scope, UTIL.sortData(_Local_data, event.data.measure, sortType));
            }

            return function (d, i) {
                d3.event.stopPropagation();
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

                UTIL.positionDownArrow(div, downArrow.node(), sortType);
                UTIL.positionSortSelection(div, sortWindow.node());
            }
        },

        getValueNumberFormat: function (index, _measureProp) {
            var si = _measureProp[index],
                siMapper = {
                    "K": "1e3",
                    "M": "1e6",
                    "B": "1e9",
                };

            switch (si) {
                case "Actual":
                    result = d3.format('');
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
        setAxisColor: function (_local_svg,_yAxisColor,_xAxisColor,_showYaxis,_showXaxis) {
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
        getMeasureList: function(data,_dimension){
            var keys = Object.keys(data);
            keys.splice(keys.indexOf(_dimension[0]), 1);
            return keys;
        }
    
    }

    var privateMethods = function (precision) {
        if (precision < 0 || precision > 20) {
            throw new RangeError("Formatter precision must be between 0 and 20");
        }
        if (precision !== Math.floor(precision)) {
            throw new RangeError("Formatter precision must be an integer");
        }
    }



    return publicMethods;

}