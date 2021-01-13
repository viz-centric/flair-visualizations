var VisualizationUtils = require("../configs/visualization-util.js");

function getConfiguration(record) {
  if (record.metadataVisual.name === "Clustered Vertical Bar Chart") {
    return getPropertiesBarChart(record);
  }
}

function getPropertiesBarChart(record) {
  var result = {};

  var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
    dimensions = features.dimensions,
    measures = features.measures,
    colorSet = [
      "#439dd3",
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
      "#8EA4BF",
    ];

  result["dimension"] = VisualizationUtils.getNames(dimensions);
  result["dimensionType"] = VisualizationUtils.getTypes(dimensions);
  result["measure"] = VisualizationUtils.getNames(measures);

  result["maxMes"] = measures.length;

  result["showXaxis"] = VisualizationUtils.getPropertyValue(
    record.properties,
    "Show X Axis"
  );
  result["showYaxis"] = VisualizationUtils.getPropertyValue(
    record.properties,
    "Show Y Axis"
  );
  result["xAxisColor"] = VisualizationUtils.getPropertyValue(
    record.properties,
    "X Axis Colour"
  );
  result["yAxisColor"] = VisualizationUtils.getPropertyValue(
    record.properties,
    "Y Axis Colour"
  );
  result["showXaxisLabel"] = VisualizationUtils.getPropertyValue(
    record.properties,
    "Show X Axis Label"
  );
  result["showYaxisLabel"] = VisualizationUtils.getPropertyValue(
    record.properties,
    "Show Y Axis Label"
  );
  result["axisScaleLabel"] = VisualizationUtils.getPropertyValue(
    record.properties,
    "Axis Scale Label"
  );
  result["showLegend"] = VisualizationUtils.getPropertyValue(
    record.properties,
    "Show Legend"
  );
  result["legendPosition"] = VisualizationUtils.getPropertyValue(
    record.properties,
    "Legend position"
  ).toLowerCase();
  result["showGrid"] = VisualizationUtils.getPropertyValue(
    record.properties,
    "Show grid"
  );
  result["isFilterGrid"] = VisualizationUtils.getPropertyValue(
    record.properties,
    "Show Filter Grid"
  );
  result["showSorting"] = VisualizationUtils.getPropertyValue(
    record.properties,
    "Allow Sorting"
  );
  result["alternateDimension"] = VisualizationUtils.getPropertyValue(
    record.properties,
    "Alternative Dimensions"
  );

  result["displayName"] =
    VisualizationUtils.getFieldPropertyValue(dimensions[0], "Display name") ||
    result["dimension"][0];
  result["showValues"] = [];
  result["displayNameForMeasure"] = [];
  result["fontStyle"] = [];
  result["fontWeight"] = [];
  result["fontSize"] = [];
  result["numberFormat"] = [];
  result["textColor"] = [];
  result["displayColor"] = [];
  result["borderColor"] = [];
  result["displayColorExpression"] = [];
  result["textColorExpression"] = [];
  for (var i = 0; i < result.maxMes; i++) {
    result["showValues"].push(
      VisualizationUtils.getFieldPropertyValue(measures[i], "Value on Points")
    );
    result["displayNameForMeasure"].push(
      VisualizationUtils.getFieldPropertyValue(measures[i], "Display name") ||
        result["measure"][i]
    );
    result["fontStyle"].push(
      VisualizationUtils.getFieldPropertyValue(measures[i], "Font style")
    );
    result["fontWeight"].push(
      VisualizationUtils.getFieldPropertyValue(measures[i], "Font weight")
    );
    result["fontSize"].push(
      parseInt(
        VisualizationUtils.getFieldPropertyValue(measures[i], "Font size")
      )
    );
    result["numberFormat"].push(
      VisualizationUtils.getFieldPropertyValue(measures[i], "Number format")
    );
    result["textColor"].push(
      VisualizationUtils.getFieldPropertyValue(measures[i], "Text colour")
    );
    var displayColor = VisualizationUtils.getFieldPropertyValue(
      measures[i],
      "Display colour"
    );
    result["displayColor"].push(
      displayColor == null ? colorSet[i] : displayColor
    );
    var borderColor = VisualizationUtils.getFieldPropertyValue(
      measures[i],
      "Border colour"
    );
    result["borderColor"].push(borderColor == null ? colorSet[i] : borderColor);
    result["displayColorExpression"].push(
      VisualizationUtils.getFieldPropertyValue(
        measures[i],
        "Display colour expression"
      )
    );
    result["textColorExpression"].push(
      VisualizationUtils.getFieldPropertyValue(
        measures[i],
        "Text colour expression"
      )
    );
  }
  return result;
}

module.exports = getConfiguration;
