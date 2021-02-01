var VisualizationUtils = require('../configs/visualization-util.js');

let colorSet = [
  '#439dd3',
  '#0CC69A',
  '#556080',
  '#F0785A',
  '#F0C419',
  '#DBCBD8',
  '#D10257',
  '#BDDBFF',
  '#9BC9FF',
  '#8AD5DD',
  '#EFEFEF',
  '#FF2970',
  '#6DDDC2',
  '#778099',
  '#F3937B',
  '#F3D047',
  '#DA3579',
  '#8EA4BF',
];

function Configuration() {
  var publicMethods = {
    GetVerticalBarChartConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;

      result['dimension'] = VisualizationUtils.getNames(dimensions);
      result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
      result['measure'] = VisualizationUtils.getNames(measures);
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
      for (var i = 0; i < measures.length; i++) {
        result['showValues'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
        result['displayNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') || result['measure'][i]);
        result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
        result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
        result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
        result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
        result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
        var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
        result['displayColor'].push(displayColor == null ? colorSet[i] : displayColor);
        var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
        result['borderColor'].push(borderColor == null ? colorSet[i] : borderColor);
        result['displayColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour expression'));
        result['textColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
      }
      return result;
    },
    GetHorizontalBarChartConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;

      result['dimension'] = VisualizationUtils.getNames(dimensions);
      result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
      result['measure'] = VisualizationUtils.getNames(measures);
      result['showXaxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis');
      result['showYaxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis');
      result['xAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'X Axis Colour');
      result['yAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'Y Axis Colour');
      result['showXaxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis Label');
      result['showYaxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis Label');
      result['axisScaleLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Axis Scale Label');
      result['showMoreDimension'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Show more dimension char');
      result['showLegend'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Legend');
      result['legendPosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Legend position').toLowerCase();
      result['showGrid'] = VisualizationUtils.getPropertyValue(record.properties, 'Show grid');
      result['isFilterGrid'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Filter Grid');
      result['showSorting'] = VisualizationUtils.getPropertyValue(record.properties, 'Allow Sorting');
      result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
      result['alternateDimension'] = VisualizationUtils.getPropertyValue(record.properties, 'Alternative Dimensions');
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
      for (var i = 0; i < measures.length; i++) {
        result['showValues'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
        result['displayNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') || result['measure'][i]);
        result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
        result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
        result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
        result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
        result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
        var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
        result['displayColor'].push(displayColor == null ? colorSet[i] : displayColor);
        var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
        result['borderColor'].push(borderColor == null ? colorSet[i] : borderColor);
        result['displayColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour expression'));
        result['textColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
      }
      return result;
    },
    GetLineChartConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;

      result['dimension'] = VisualizationUtils.getNames(dimensions);
      result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
      result['measure'] = VisualizationUtils.getNames(measures);
      result['showXaxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis');
      result['showYaxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis');
      result['xAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'X Axis Colour');
      result['yAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'Y Axis Colour');
      result['showXaxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis Label');
      result['showYaxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis Label');
      result['axisScaleLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Axis Scale Label');
      result['stacked'] = VisualizationUtils.getPropertyValue(record.properties, 'Stacked');
      result['showLegend'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Legend');
      result['legendPosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Legend position').toLowerCase();
      result['showGrid'] = VisualizationUtils.getPropertyValue(record.properties, 'Show grid');
      result['isFilterGrid'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Filter Grid');
      result['showSorting'] = VisualizationUtils.getPropertyValue(record.properties, 'Allow Sorting');
      result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
      result['alternateDimension'] = VisualizationUtils.getPropertyValue(record.properties, 'Alternative Dimensions');
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
      result['lineType'] = [];
      result['pointType'] = [];
      for (var i = 0; i < measures.length; i++) {
        result['showValues'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
        result['displayNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') || result['measure'][i]);
        result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
        result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
        result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
        result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
        result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
        var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
        result['displayColor'].push(displayColor == null ? colorSet[i] : displayColor);
        var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
        result['borderColor'].push(borderColor == null ? colorSet[i] : borderColor);
        result['displayColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour expression'));
        result['textColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
        result['lineType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Type').toLowerCase());
        result['pointType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Chart Point type'));
      }
      return result;
    },
    GetComboChartConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;
      result['dimension'] = VisualizationUtils.getNames(dimensions);
      result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
      result['measure'] = VisualizationUtils.getNames(measures);
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
      result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'];
      result['alternateDimension'] = VisualizationUtils.getPropertyValue(record.properties, 'Alternative Dimensions');
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
      result['comboChartType'] = [];
      result['lineType'] = [];
      result['pointType'] = [];

      for (var i = 0; i < measures.length; i++) {
        result['showValues'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
        result['displayNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') || result['measure'][i]);
        result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
        result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
        result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
        result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
        result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
        var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
        result['displayColor'].push(displayColor == null ? colorSet[i] : displayColor);
        var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
        result['borderColor'].push(borderColor == null ? colorSet[i] : borderColor);
        result['displayColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour expression'));
        result['textColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
        result['comboChartType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Combo chart type'));
        result['lineType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Type').toLowerCase());
        result['pointType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Chart Point type'));
      }
      return result;
    },
    GetPieChartConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;

      result['dimension'] = VisualizationUtils.getNames(dimensions);
      result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
      result['measure'] = VisualizationUtils.getNames(measures);
      result['legend'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Legend');
      result['legendPosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Legend position').toUpperCase();
      result['valueAs'] = VisualizationUtils.getPropertyValue(record.properties, 'Show value as').toLowerCase();
      return result;
    },
    GetDoughnutChartConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;

      result['dimension'] = VisualizationUtils.getNames(dimensions);
      result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
      result['measure'] = VisualizationUtils.getNames(measures);
      result['dimensionDisplayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
      result['measureDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display name') || result['measure'][0];
      result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
      result['legend'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Legend');
      result['legendPosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Legend position').toLowerCase();
      result['valueAs'] = VisualizationUtils.getPropertyValue(record.properties, 'Show value as').toLowerCase();
      result['fontSize'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size');
      result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
      result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
      result['showLabel'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Show Labels');
      result['fontColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Colour of labels');

      return result;
    },
    GetTableChartConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;

      result['dimension'] = VisualizationUtils.getNames(dimensions);
      result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
      result['measure'] = VisualizationUtils.getNames(measures);
      result['maxDim'] = dimensions.length;
      result['maxMes'] = measures.length;
      result['showTotal'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Total');
      result['displayNameForDimension'] = [];
      result['cellColorForDimension'] = [];
      result['fontStyleForDimension'] = [];
      result['fontWeightForDimension'] = [];
      result['fontSizeForDimension'] = [];
      result['textColorForDimension'] = [];
      result['textColorExpressionForDimension'] = [];
      result['textAlignmentForDimension'] = [];

      result['displayNameForMeasure'] = [];
      result['cellColorForMeasure'] = [];
      result['cellColorExpressionForMeasure'] = [];
      result['fontStyleForMeasure'] = [];
      result['fontSizeForMeasure'] = [];
      result['fontWeightForMeasure'] = [];
      result['numberFormatForMeasure'] = [];
      result['textColorForMeasure'] = [];
      result['textAlignmentForMeasure'] = [];
      result['textColorExpressionForMeasure'] = [];
      result['iconNameForMeasure'] = [];
      result['iconFontWeight'] = [];
      result['iconColor'] = [];
      result['iconPositionForMeasure'] = [];
      result['iconExpressionForMeasure'] = [];

      result['limit'] = VisualizationUtils.getPropertyValue(record.properties, 'Limit');
      result['dataGrouping'] = VisualizationUtils.getPropertyValue(record.properties, 'Data Grouping');
      for (var i = 0; i < result.maxDim; i++) {
        result['displayNameForDimension'].push(
          VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Display name') || result['dimension'][i]
        );
        result['cellColorForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Cell colour'));
        result['fontStyleForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style'));
        result['fontWeightForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight'));
        result['fontSizeForDimension'].push(parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size')));
        result['textColorForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour'));
        result['textColorExpressionForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour expression'));
        result['textAlignmentForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Alignment'));
      }

      for (var i = 0; i < result.maxMes; i++) {
        result['displayNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') || result['measure'][i]);
        result['cellColorForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Cell colour'));
        result['cellColorExpressionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Cell colour expression'));
        result['fontStyleForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
        result['fontWeightForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
        result['fontSizeForMeasure'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
        result['numberFormatForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
        result['textColorForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
        result['textAlignmentForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text alignment').toLowerCase());
        result['textColorExpressionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
        result['iconNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name'));
        result['iconPositionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon position'));
        result['iconExpressionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression'));
      }
      return result;
    },
    GetPivotTableChartConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;

      result['dimension'] = VisualizationUtils.getNames(dimensions);
      result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
      result['measure'] = VisualizationUtils.getNames(measures);
      result['maxDim'] = dimensions.length;
      result['maxMes'] = measures.length;

      result['limit'] = VisualizationUtils.getPropertyValue(record.properties, 'Limit');

      result['displayNameForDimension'] = [];
      result['cellColorForDimension'] = [];
      result['fontStyleForDimension'] = [];
      result['fontWeightForDimension'] = [];
      result['fontSizeForDimension'] = [];
      result['textColorForDimension'] = [];
      result['textColorExpressionForDimension'] = [];
      result['textAlignmentForDimension'] = [];
      result['isPivoted'] = [];

      result['displayNameForMeasure'] = [];
      result['cellColorForMeasure'] = [];
      result['cellColorExpressionForMeasure'] = [];
      result['fontStyleForMeasure'] = [];
      result['fontSizeForMeasure'] = [];
      result['fontWeightForMeasure'] = [];
      result['numberFormatForMeasure'] = [];
      result['textColorForMeasure'] = [];
      result['textAlignmentForMeasure'] = [];
      result['textColorExpressionForMeasure'] = [];
      result['iconNameForMeasure'] = [];
      result['iconFontWeight'] = [];
      result['iconColor'] = [];
      result['iconPositionForMeasure'] = [];
      result['iconExpressionForMeasure'] = [];
      for (var i = 0; i < result.maxDim; i++) {
        result['displayNameForDimension'].push(
          VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Display name') || result['dimension'][i]
        );
        result['cellColorForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Cell colour'));
        result['fontStyleForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style'));
        result['fontWeightForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight'));
        result['fontSizeForDimension'].push(parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size')));
        result['textColorForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour'));
        result['textColorExpressionForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour expression'));
        result['textAlignmentForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Alignment'));
        result['isPivoted'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Pivot'));
      }

      for (var i = 0; i < result.maxMes; i++) {
        result['displayNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') || result['measure'][i]);
        result['cellColorForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Cell colour'));
        result['cellColorExpressionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Cell colour expression'));
        result['fontStyleForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
        result['fontWeightForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
        result['fontSizeForMeasure'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
        result['numberFormatForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
        result['textColorForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
        result['textAlignmentForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text alignment').toLowerCase());
        result['textColorExpressionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
        result['iconNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name'));
        result['iconPositionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon position'));
        result['iconExpressionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression'));
      }
      return result;
    },
    GetPieGridChartConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;

      result['dimension'] = VisualizationUtils.getNames(dimensions);
      result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
      result['measure'] = VisualizationUtils.getNames(measures);
      result['colorSet'] = colorSet;
      result['dimensionDisplayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
      result['measureDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display name') || result['measure'][0];
      result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
      result['fontSize'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size');
      result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
      result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
      result['showLabel'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Show Labels');
      result['fontColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Colour of labels');
      result['showValue'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Value on Points');
      return result;
    },
    GetNumberGridChartConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;

      result['dimension'] = VisualizationUtils.getNames(dimensions);
      result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
      result['measure'] = VisualizationUtils.getNames(measures);
      result['colorSet'] = colorSet;
      result['dimensionDisplayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
      result['measureDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display name') || result['measure'][0];
      result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
      result['fontSize'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size');
      result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
      result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
      result['showLabel'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Show Labels');
      result['showValue'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Value on Points');
      result['fontColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Colour of labels');
      result['fontSizeforDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size for display name');
      return result;
    },
    GetSankeyChartConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;
      result['dimension'] = VisualizationUtils.getNames(dimensions);
      result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
      result['measure'] = VisualizationUtils.getNames(measures);
      result['maxDim'] = dimensions.length;
      result['maxMes'] = measures.length;

      result['colorPattern'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Color Pattern').toLowerCase().replace(' ', '_');

      var displayColor = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display colour');
      result['displayColor'] = displayColor == null ? colorSet[0] : displayColor;
      var borderColor = VisualizationUtils.getFieldPropertyValue(measures[0], 'Border colour');
      result['borderColor'] = borderColor == null ? colorSet[1] : borderColor;
      result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
      result['showLabels'] = [];
      result['fontStyle'] = [];
      result['fontWeight'] = [];
      result['fontSize'] = [];
      result['textColor'] = [];
      result['colorList'] = colorSet;
      for (var i = 0; i < result.maxDim; i++) {
        result['showLabels'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Show Labels'));
        result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style'));
        result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight'));
        result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size')));
        result['textColor'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour'));
      }
      return result;
    },
    GetChordDiagramChartConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;
      result['showLabels'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Show Labels');
      result['labelColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Colour of labels');
      result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
      result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
      result['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));
      result['colorPattern'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Color Pattern').toLowerCase().replace(' ', '_');
      result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
      result['dimension'] = VisualizationUtils.getNames(dimensions);
      result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
      result['measure'] = VisualizationUtils.getNames(measures)[0];
    },
    GetBulletChartConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;

      result['dimension'] = VisualizationUtils.getNames(dimensions);
      result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
      result['measures'] = VisualizationUtils.getNames(measures);
      result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
      result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
      result['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));
      result['showLabel'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Value on Points');

      var valueColor = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display colour');
      result['valueColor'] = valueColor == null ? colorSet[0] : valueColor;
      var targetColor = VisualizationUtils.getFieldPropertyValue(measures[1], 'Target colour');
      result['targetColor'] = targetColor == null ? colorSet[1] : targetColor;

      result['orientation'] = VisualizationUtils.getPropertyValue(record.properties, 'Orientation');
      result['segments'] = VisualizationUtils.getPropertyValue(record.properties, 'Segments');
      result['segmentInfo'] = VisualizationUtils.getPropertyValue(record.properties, 'Segment Color Coding');
      result['measureNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
      result['targetNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Number format');

      return result;
    },
    GetHeatmapChartConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;

      result['dimension'] = VisualizationUtils.getNames(dimensions);
      result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
      result['measure'] = VisualizationUtils.getNames(measures);
      result['maxMes'] = measures.length;
      result['dimLabelColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Colour of labels');
      result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
      result['fontStyleForDimension'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
      result['fontWeightForDimension'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
      result['fontSizeForDimension'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));
      result['colorPattern'] = VisualizationUtils.getPropertyValue(record.properties, 'Color Pattern').toLowerCase().replace(' ', '_');

      var displayColor = VisualizationUtils.getPropertyValue(record.properties, 'Display colour');
      result['displayColor'] = displayColor == null ? colorSet[0] : displayColor;

      result['displayNameForMeasure'] = [];
      result['showValues'] = [];
      result['showIcon'] = [];
      result['valuePosition'] = [];
      result['iconName'] = [];
      result['iconExpression'] = [];
      result['iconFontWeight'] = [];
      result['iconPosition'] = [];
      result['iconColor'] = [];
      result['colourCoding'] = [];
      result['valueTextColour'] = [];
      result['displayColorMeasure'] = [];
      result['fontStyleForMeasure'] = [];
      result['fontWeightForMeasure'] = [];
      result['fontSizeForMeasure'] = [];
      result['numberFormat'] = [];

      for (var i = 0; i < result.maxMes; i++) {
        result['displayNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') || result['measure'][i]);
        result['showValues'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
        result['showIcon'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Show Icon'));
        result['valuePosition'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Alignment').toLowerCase());
        result['iconName'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name'));
        result['iconFontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Font weight'));
        result['iconPosition'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon position').toLowerCase());
        result['iconColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
        result['colourCoding'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour expression'));
        result['valueTextColour'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
        result['displayColorMeasure'].push(colorSet[i]);
        result['fontStyleForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
        result['fontWeightForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
        result['fontSizeForMeasure'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
        result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
        result['iconExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression'));
      }
      return result;
    },
    GetTreemapChartConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;

      result['maxDim'] = dimensions.length;
      result['colorPattern'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Color Pattern').toLowerCase().replace(' ', '_');
      result['showValues'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Value on Points');
      result['valueTextColour'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour');
      result['fontStyleForMes'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
      result['fontWeightForMes'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
      result['fontSizeForMes'] = parseInt(VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size'));
      result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
      result['measure'] = [measures[0].feature.name];
      result['dimension'] = [];
      result['dimensionType'] = [];
      result['showLabelForDimension'] = [];
      result['labelColorForDimension'] = [];
      result['fontStyleForDimension'] = [];
      result['fontWeightForDimension'] = [];
      result['fontSizeForDimension'] = [];
      result['displayColor'] = [];
      result['colorSet'] = colorSet;

      for (var i = 0, j = ''; i < result.maxDim; i++, j = i + 1) {
        result['dimension'].push(dimensions[i].feature.name);
        result['dimensionType'].push(dimensions[i].feature.type);
        result['showLabelForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Show Labels'));
        result['labelColorForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Colour of labels'));
        var displayColor = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Display colour');
        result['displayColor'].push(displayColor == null ? colorSet[i] : displayColor);
        //  result['displayColor'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Display colour'));
        result['fontWeightForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight'));
        result['fontStyleForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style'));
        result['fontSizeForDimension'].push(parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size')));
      }
      return result;
    },
    GetScatterPlotConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;

      result['dimension'] = VisualizationUtils.getNames(dimensions);
      result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
      result['measure'] = VisualizationUtils.getNames(measures);
      result['maxMes'] = measures.length;
      result['showXaxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis');
      result['showYaxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis');
      result['xAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'X Axis Colour');
      result['yAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'Y Axis Colour');
      result['showXaxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis Label');
      result['showYaxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis Label');
      result['showLegend'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Legend');
      result['legendPosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Legend position').toLowerCase();
      result['showGrid'] = VisualizationUtils.getPropertyValue(record.properties, 'Show grid');
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
      for (var i = 0; i < result.maxMes; i++) {
        result['showValues'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
        result['displayNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') || result['measure'][i]);
        result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
        result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
        result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
        result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
        result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
        var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
        result['displayColor'].push(displayColor == null ? colorSet[i] : displayColor);
        var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
        result['borderColor'].push(borderColor == null ? colorSet[i] : borderColor);
      }
      return result;
    },
    GetKPIConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;

      result['dimension'] = VisualizationUtils.getNames(dimensions);
      result['measure'] = VisualizationUtils.getNames(measures);
      result['kpiAlignment'] = VisualizationUtils.getPropertyValue(record.properties, 'Text alignment');
      result['isAnimation'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Animation');
      result['kpiDisplayName'] = [];

      result['kpiBackgroundColor'] = [];
      result['kpiNumberFormat'] = [];
      result['kpiFontStyle'] = [];
      result['kpiFontWeight'] = [];
      result['kpiFontSize'] = [];
      result['kpiColor'] = [];
      result['kpiColorExpression'] = [];
      result['kpiIcon'] = [];
      result['kpiIconFontWeight'] = [];
      result['kpiIconColor'] = [];
      result['kpiIconExpression'] = [];
      result['FontSizeforDisplayName'] = [];
      result['showIcon'] = [];
      result['iconSize'] = [];
      for (var i = 0; i < measures.length; i++) {
        result['kpiDisplayName'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') || result['measure'][i]);

        result['kpiBackgroundColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Background Colour'));
        result['kpiNumberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
        result['kpiFontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
        result['kpiFontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
        result['kpiFontSize'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size'));
        result['kpiColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
        result['kpiColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
        result['kpiIcon'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name'));
        result['showIcon'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Show Icon'));
        result['kpiIconFontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Font weight'));
        result['iconSize'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Font size'));

        result['kpiIconColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon colour'));
        result['kpiIconExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression'));
        result['FontSizeforDisplayName'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size for display name'));
      }
      return result;
    },
    GetInfoGraphicConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;

      result['dimension'] = VisualizationUtils.getNames(dimensions);
      result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
      result['measure'] = VisualizationUtils.getNames(measures);
      result['chartType'] = VisualizationUtils.getPropertyValue(record.properties, 'Info graphic Type').toLowerCase();
      var displayColor = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display colour');
      result['chartDisplayColor'] = displayColor == null ? colorSet[0] : displayColor;
      var borderColor = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Border colour');
      result['chartBorderColor'] = borderColor == null ? colorSet[0] : borderColor;

      result['kpiDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display name') || result['dimension'][0];
      result['kpiAlignment'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text alignment');
      result['kpiBackgroundColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Background Colour');
      result['kpiNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
      result['kpiFontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
      result['kpiFontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
      result['kpiFontSize'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size');
      result['kpiColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour');
      result['kpiColorExpression'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour expression');
      result['kpiIcon'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon name');
      result['kpiIconFontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon Font weight');
      result['kpiIconColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon colour');
      result['kpiIconExpression'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon Expression');

      return result;
    },
    GetChordDiagramConfig: function (record) {
      var result = {};
      var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
        dimensions = features.dimensions,
        measures = features.measures;
      result['showLabels'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Show Labels');
      result['labelColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Colour of labels');
      result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
      result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
      result['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));
      result['colorPattern'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Color Pattern').toLowerCase().replace(' ', '_');
      result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
      result['dimension'] = VisualizationUtils.getNames(dimensions);
      result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
      result['measure'] = VisualizationUtils.getNames(measures)[0];

      return result;
    },
  };
  return publicMethods;
}

module.exports = Configuration;
