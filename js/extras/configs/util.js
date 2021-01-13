var d3 = require("d3");
var COMMON = require("../extras/common.js")();
var VisualizationUtils = require("../extras/configs/visualization-util.js")();

var currentEvent = require("d3-selection");
var moment = require("moment");

function configuration() {
  var publicMethods = {
    ASCENDING: 1,
    DESCENDING: -1,
    getConfiguration: function (metaData,config) {

    },

    getProperties =function (VisualizationUtils, record) {
        var result = {};

        var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
            dimensions = features.dimensions,
            measures = features.measures,
            colorSet = D3Utils.getDefaultColorset();

        result['dimension'] = D3Utils.getNames(dimensions);
        result['dimensionType'] = D3Utils.getTypes(dimensions);
        result['measure'] = D3Utils.getNames(measures);

        result['maxMes'] = measures.length;

        result['showXaxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis');
        result['showYaxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis');
        result['xAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'X Axis Colour');
        result['yAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'Y Axis Colour');
        result['showXaxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis Label');
        result['showYaxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis Label');
        result['axisScaleLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Axis Scale Label');
        result['showLegend'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Legend');
        result['legendPosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Legend position').toLowerCase();
        result['showGrid'] = VisualizationUtils.getPropertyValue(record.properties, 'Show grid');
        result['isFilterGrid'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Filter Grid');
        result['showSorting'] = VisualizationUtils.getPropertyValue(record.properties, 'Allow Sorting');
        result['alternateDimension'] = VisualizationUtils.getPropertyValue(record.properties, 'Alternative Dimensions');

        result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
        result['showValues'] = [];
        result['displayNameForMeasure'] = [];
        result['fontStyle'] = [];
        result['fontWeight'] = [];
        result['fontSize'] = [];
        result['numberFormat'] = [];
        result['textColor'] = [];
        result['displayColor'] = [];
        result['borderColor'] = [];
        result['displayColorExpression'] = [];
        result['textColorExpression'] = [];
        for (var i = 0; i < result.maxMes; i++) {

            result['showValues'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
            result['displayNameForMeasure'].push(
                VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                result['measure'][i]
            );
            result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
            result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
            result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
            result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
            result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
            var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
            result['displayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
            var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
            result['borderColor'].push((borderColor == null) ? colorSet[i] : borderColor);
            result['displayColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour expression'));
            result['textColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
        }

        if (isNotification) {
            result['showXaxis'] = false;
            result['showYaxis'] = false;
            result['isFilterGrid'] = false;
            result['showLegend'] = false;
            result['showGrid'] = false;
            result['showXaxisLabel'] = false;
            result['showYaxisLabel'] = false;
        }
        return result;
    }
  };

  return publicMethods;
}

module.exports = configuration;
