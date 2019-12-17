# Documentation

<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==" alt="Red dot" />





* [Introduction](#Introduction)  
* [Installation](#Installation)      
* [Getting Started](#Installation)  
* [Global Config](#Global_Config)                    
* [Charts](#Charts)       
     * [Clustered Vertical Bar Chart](#CLUSTERED_VERTICAL_BAR_CHART)    
     * [Clustered Horizontal Bar Chart](#CLUSTERED_HORIZONTAL_BAR_CHART)    
     * [Stacked Vertical Bar Chart](#STACKED_VERTICAL_BAR_CHART)     
     * [Stacked Horizontal Bar Chart](#STACKED_HORIZONTAL_BAR_CHART)     
     * [Line Chart](#LINE_CHART)      
     * [Combo Chart](#COMBO_CHART)       
     * [Pie Chart](#PIE_CHART)       
     * [Doughnut Chart](#DOUGHNUT_CHART)       
     * [Gauge Chart](#GAUGE_CHART)       
     * [Scatter Plot Chart](#SCATTER_PLOT_CHART)       
     * [InfoGraphics Chart](#INFOGRAPHICS_CHART)       
     * [KPI Chart](#KPI_CHART)       
     * [Bullet Chart](#BULLET_CHART)      
     * [BoxPlot Chart](#BOXPLOT_CHART)       
     * [Sankey Chart](#COMBO_CHART)       
     * [Table](#TABLE)       
     * [PivotTable](#PIVOTTABLE)    
     * [Map](#MAP)    
     * [TreeMap](#TREEMAP)    
     * [HeatMap](#HEATMAP)  
     
# Introduction
Data Visualization can be understood as a graphical presentation of data to uncover the underlying information that it holds and allow the users to identify the patterns present in it. By delivering information in a vibrant and interactive structure it facilitates users to make quick decisions based upon their roles. What makes a data visualization even more powerful is its ability to process data in real time allowing immediacy in making a decision. On contrary to batch or event-driven visualization real-time analytics is the state of the art tool for any individual or organisation who must take tactical or operational decisions on the fly.

With support for more than 20 different basic and advanced visualizations, the users can view the data from various dimensions whether it be for distribution analytics, relationship analytics or comparison analytics. The Flair BI visualization library is completely open source, allowing any data enthusiasts to use it to create their own custom Business Intelligence tool or simply use the visualizations in their personal projects.

# Installation
Flair-Visualizations can be installed via npm or bower. It is recommended to get Flair-Visualizations this way.

## npm 
``` 
npm install flair-visualizations
```

## bower 
```
bower install flair-visualizations
```

# Global_Config
* ### Body Properties (These are common for all visualizations)
      
| Property Name     | Config Property Name  | Description                                       | Default Value | Possible Values      |
|-------------------|-----------------------|---------------------------------------------------|---------------|----------------------|
| Show X Axis       | showXaxis            | Boolean that says if x axis should be shown       | TRUE          | True|False            |
| Show Y Axis       | showYaxis            | Boolean that says if y axis should be shown       | TRUE          | True|False            |
| X Axis Colour     | xAxisColor           | Colour of X axis                                  | #676a6c       |                       |
| Y Axis Colour     | yAxisColor           | Colour of Y axis                                  | #676a6c       |                       |
| Show X Axis Label | showXaxisLabel       | Boolean that says if x axis label should be shown | TRUE          | True|False            |
| Show Y Axis Label | showYaxisLabel       | Boolean that says if y axis label should be shown | TRUE          | True|False            |
| Show Legend       | showLegend           | Boolean that says if legend should be shown       | TRUE          | True|False            |
| Legend position   | legendPosition       | Legend position with sides                        | Top          | Top|bottom|left|right |
| Show Grid         | showGrid             | Boolean to Show Grid or not                       | TRUE          | True|False            |
| Stacked           | stacked              | Boolean that says if chart is stacked             | TRUE          | True|False            |        
# Charts    

## CLUSTERED_VERTICAL_BAR_CHART

* ### Attributes       

| Type       | Required | Optional |
|------------|----------|----------|
| Dimensions | 1        | 0        |
| Measures   | 1        | 4        |

* ### Configuration Properties    

    * ####  Dimensions      

        | Property Name     | Config Property Name  | Description                                       | Default Value | Possible Values       |
        |-------------------|-----------------------|---------------------------------------------------|---------------|-----------------------|
        | Display name      | displayName           | A Display name                                    | Displayname   |                       |
        

    * ####  Measures   
        | Property Name     | Config Property Name  | Description                                       | Default Value | Possible Values       |
        |-------------------|-----------------------|---------------------------------------------------|---------------|-----------------------|
        | Value on Points   | showValues            | Show value on points                              | false         | true/false             |
        | Display name      | displayNameForMeasure | A Display name for Measure                        | Displayname   |                       |
        | Font style        | fontStyle             | Style of fonts                                    | Normal          | Normal/Italique/Oblique                 |
        | Font weight       | fontWeight            | Weight of fonts                                   | Normal          |   Normal/Bold/100-900                    |
        | Number format     | numberFormat          | Possible number formats                           | Actual          | K,M,B,Actual           |
        | Text colour       | textColor             | The text colour                                   | #617c8c       |                       |
        | Display colour    | displayColor          | An display colour                                 | null          |                       |
        | Border colour     | borderColor           | An border colour                                  | null          |                       |
        | Font size         | fontSize              | Size of fonts                                     | 9             |                       |
        
        
 ![CLUSTERED_VERTICAL_BAR_CHART](https://content.screencast.com/users/khushbum.wa/folders/Default/media/721dd469-c035-42b9-a25f-4f822e528651/ezgif.com-video-to-gif%20(1).gif)

## CLUSTERED_HORIZONTAL_BAR_CHART

* ### Attributes       

| Type       | Required | Optional |
|------------|----------|----------|
| Dimensions | 1        | 0        |
| Measures   | 1        | 4        |

* ### Configuration Properties    

    * ####  Dimensions      

        | Property Name     | Config Property Name  | Description                                       | Default Value | Possible Values       |
        |-------------------|-----------------------|---------------------------------------------------|---------------|-----------------------|
        | Display name      | displayName           | A Display name                                    | Displayname   |                       |
        

    * ####  Measures   
        | Property Name     | Config Property Name  | Description                                       | Default Value | Possible Values       |
        |-------------------|-----------------------|---------------------------------------------------|---------------|-----------------------|
        | Value on Points   | showValues            | Show value on points                              | false         | true/false             |
        | Display name      | displayNameForMeasure | A Display name for Measure                        | Displayname   |                       |
        | Font style        | fontStyle             | Style of fonts                                    | Normal          |    Normal/Italique/Oblique                   |
        | Font weight       | fontWeight            | Weight of fonts                                   | Normal          |       Normal/Bold/100-900                |
        | Number format     | numberFormat          | Possible number formats                           | Actual          | K,M,B,Actual           |
        | Text colour       | textColor             | The text colour                                   | #617c8c       |                       |
        | Display colour    | displayColor          | An display colour                                 | null          |                       |
        | Border colour     | borderColor           | An border colour                                  | null          |                       |
        | Font size         | fontSize              | Size of fonts                                     | 9             |                       |
        

## STACKED_HORIZONTAL_BAR_CHART

* ### Attributes       

| Type       | Required | Optional |
|------------|----------|----------|
| Dimensions | 1        | 0        |
| Measures   | 1        | 4        |

* ### Configuration Properties    

    * ####  Dimensions      

        | Property Name     | Config Property Name  | Description                                       | Default Value | Possible Values       |
        |-------------------|-----------------------|---------------------------------------------------|---------------|-----------------------|
        | Display name      | displayName           | A Display name                                    | Displayname   |                       |
        

    * ####  Measures   
        | Property Name     | Config Property Name  | Description                                       | Default Value | Possible Values       |
        |-------------------|-----------------------|---------------------------------------------------|---------------|-----------------------|
        | Value on Points   | showValues            | Show value on points                              | false         | true/false             |
        | Display name      | displayNameForMeasure | A Display name for Measure                        | Displayname   |                       |
        | Font style        | fontStyle             | Style of fonts                                    | Normal          |     Normal/Italique/Oblique                 |
        | Font weight       | fontWeight            | Weight of fonts                                   | Normal          | Normal/Bold/100-900                     |
        | Number format     | numberFormat          | Possible number formats                           | Actual          | K,M,B,Actual           |
        | Text colour       | textColor             | The text colour                                   | #617c8c       |                       |
        | Display colour    | displayColor          | An display colour                                 | null          |                       |
        | Border colour     | borderColor           | An border colour                                  | null          |                       |
        | Font size         | fontSize              | Size of fonts                                     | 9             |                       |
        

## STACKED_VERTICAL_BAR_CHART

* ### Attributes       

| Type       | Required | Optional |
|------------|----------|----------|
| Dimensions | 1        | 0        |
| Measures   | 1        | 4        |

* ### Configuration Properties    

    * ####  Dimensions      

        | Property Name     | Config Property Name  | Description                                       | Default Value | Possible Values       |
        |-------------------|-----------------------|---------------------------------------------------|---------------|-----------------------|
        | Display name      | displayName           | A Display name                                    | Displayname   |                       |
        

    * ####  Measures   
        | Property Name     | Config Property Name  | Description                                       | Default Value | Possible Values       |
        |-------------------|-----------------------|---------------------------------------------------|---------------|-----------------------|
        | Value on Points   | showValues            | Show value on points                              | false         | true/false             |
        | Display name      | displayNameForMeasure | A Display name for Measure                        | Displayname   |                       |
        | Font style        | fontStyle             | Style of fonts                                    | Normal          | Normal/Italique/Oblique                     |
        | Font weight       | fontWeight            | Weight of fonts                                   | Normal          |   Normal/Bold/100-900                   |
        | Number format     | numberFormat          | Possible number formats                           | Actual          | K,M,B,Actual           |
        | Text colour       | textColor             | The text colour                                   | #617c8c       |                       |
        | Display colour    | displayColor          | An display colour                                 | null          |                       |
        | Border colour     | borderColor           | An border colour                                  | null          |                       |
        | Font size         | fontSize              | Size of fonts                                     | 9             |                       |
        

## LINE_CHART

* ### Attributes       

| Type       | Required | Optional |
|------------|----------|----------|
| Dimensions | 1        | 0        |
| Measures   | 1        | 4        |

* ### Configuration Properties    

    * ####  Dimensions      

        | Property Name     | Config Property Name  | Description                                       | Default Value | Possible Values       |
        |-------------------|-----------------------|---------------------------------------------------|---------------|-----------------------|
        | Display name      | displayName           | A Display name                                    | Displayname   |                       |
        

    * ####  Measures   
        | Property Name     | Config Property Name  | Description                                       | Default Value | Possible Values       |
        |-------------------|-----------------------|---------------------------------------------------|---------------|-----------------------|
        | Value on Points   | showValues            | Show value on points                              | false         | true/false             |
        | Display name      | displayNameForMeasure | A Display name for Measure                        | Displayname   |                       |
        | Font style        | fontStyle             | Style of fonts                                    | Normal          |  Normal/Italique/Oblique                     |
        | Font weight       | fontWeight            | Weight of fonts                                   | Normal          |   Normal/Bold/100-900                    |
        | Number format     | numberFormat          | Possible number formats                           | Actual          | K,M,B,Actual           |
        | Text colour       | textColor             | The text colour                                   | #617c8c       |                       |
        | Display colour    | displayColor          | An display colour                                 | null          |                       |
        | Border colour     | borderColor           | An border colour                                  | null          |                       |
        | Font size         | fontSize              | Size of fonts                                     | 9             |                       |
        | Line Chart Point type | pointType             | Type of points                                    | Circle          | Circle,Cross,CrossRot,Dash,Line,Rect,RectRounded,RectRot,Star,Triangle |
        | Line Type             | lineType              | Types of line charts                              | Line          | Area/Line                                                              |

## COMBO_CHART

* ### Attributes       

| Type       | Required | Optional |
|------------|----------|----------|
| Dimensions | 1        | 0        |
| Measures   | 1        | 4        |

* ### Configuration Properties    

    * ####  Dimensions      

        | Property Name     | Config Property Name  | Description                                       | Default Value | Possible Values       |
        |-------------------|-----------------------|---------------------------------------------------|---------------|-----------------------|
        | Display name      | displayName           | A Display name                                    | Displayname   |                       |
        

    * ####  Measures   
        | Property Name     | Config Property Name  | Description                                       | Default Value | Possible Values       |
        |-------------------|-----------------------|---------------------------------------------------|---------------|-----------------------|
        | Value on Points   | showValues            | Show value on points                              | false         | true/false             |
        | Display name      | displayNameForMeasure | A Display name for Measure                        | Displayname   |                       |
        | Font style        | fontStyle             | Style of fonts                                    | Normal          | Normal/Italique/Oblique  |
        | Font weight       | fontWeight            | Weight of fonts                                   | Normal          |    Normal/Bold/100-900                   |
        | Number format     | numberFormat          | Possible number formats                           | Actual          | K,M,B,Actual           |
        | Text colour       | textColor             | The text colour                                   | #617c8c       |                       |
        | Display colour    | displayColor          | An display colour                                 | null          |                       |
        | Border colour     | borderColor           | An border colour                                  | null          |                       |
        | Font size         | fontSize              | Size of fonts                                     | 9             |                       |
        | Line Chart Point type | pointType             | Type of points                                    | Circle          | Circle,Cross,CrossRot,Dash,Line,Rect,RectRounded,RectRot,Star,Triangle |
        | Line Type             | lineType              | Types of line charts                              | Line          | Area/Line                                                              |
        | Combo chart type      | comboChartType        | line or bar                                       | Bar          | Bar/Line                                                               |

## PIE_CHART

* ### Attributes       

| Type       | Required | Optional |
|------------|----------|----------|
| Dimensions | 1        | 0        |
| Measures   | 1        | 0        |

* ### Configuration Properties    
    * ####  Viz Properties
        | Property Name  | Config Property Name | Description                                                    | Default Value | Possible Values        |
        |----------------|----------------------|----------------------------------------------------------------|---------------|------------------------|
        | Show value as  | valueAs              | show labels as option in piece lable                           | Label          | Label/Percentage/Value |
        | Value as Arc   | valueAsArc           | Boolean that says value on the segment should be in arc or not | TRUE           | true/false             |
        | Value position | valuePosition        | Position of value outside or inside pie segment                | Border          | Border/Outside         |
        
        
## DOUGHNUT_CHART

* ### Attributes       

| Type       | Required | Optional |
|------------|----------|----------|
| Dimensions | 1        | 0        |
| Measures   | 1        | 0        |

* ### Configuration Properties    
    * ####  Viz Properties
        | Property Name  | Config Property Name | Description                                                    | Default Value | Possible Values        |
        |----------------|----------------------|----------------------------------------------------------------|---------------|------------------------|
        | Show value as  | valueAs              | show labels as option in piece lable                           | Label          | Label/Percentage/Value |
        | Value as Arc   | valueAsArc           | Boolean that says value on the segment should be in arc or not | TRUE           | true/false             |
        | Value position | valuePosition        | Position of value outside or inside pie segment                | Border          | Border/Outside         |
        
     * ####  Dimensions
        | Property Name | Config Property Name | Description                  | Default Value | Possible Values |
        |---------------|----------------------|------------------------------|---------------|-----------------|
        | Display name  | dimensionDisplayName | A Display name for Dimension | Displayname   |                 |
        | Display name  | measureDisplayName   | A Display name for Measure   | Displayname   |                 |
        | Font style    | fontStyle            | Style of fonts               | Normal          |   Normal/Italique/Oblique              |
        | Font weight   | fontWeight           | Weight of fonts              | Normal          |    Normal/Bold/100-900             |
        | Text colour   | fontColor            | The text colour              | #617c8c       |                 |
        | Font size     | fontSize             | Size of fonts                | 9             |                 |
        

## GAUGE_CHART

* ### Attributes       

| Type       | Required | Optional |
|------------|----------|----------|
| Dimensions | 0        | 0        |
| Measures   | 2        | 0        |

* ### Configuration Properties    
    * ####  Viz Properties
        | Property Name | Config Property Name | Description    | Default Value | Possible Values    |
        |---------------|----------------------|----------------|---------------|--------------------|
        | Gauge Type    | gaugeType            | Type of gauges | Half Circle          | Half Circle/Radial |       
        
    * ####  Dimensions 
        | Property Name         | Config Property Name | Description                                | Default Value | Possible Values |
        |-----------------------|----------------------|--------------------------------------------|---------------|-----------------|
        | Value on Points       | targetShowValues     | Show value on points for Target Measure    | FALSE         | True|False      |
        | Display name          | targetDisplayName    | A Display name for Target Measure          | Displayname   |                 |
        | Font style            | targetFontStyle      | Style of fonts for Target Measure          | Normal          | Normal/Italique/Oblique                 |
        | Font weight           | targetFontWeight     | Weight of fonts for Target Measure         | Normal          | Normal/Bold/100-900                |
        | Number format         | targetNumberFormat   | Possible number formats for Target Measure | Actual          | K,M,B,Actual    |
        | Text colour           | targetTextColor      | The text colour for Target Measure         | #617c8c       |                 |
        | Display colour        | targetDisplayColor   | An display colour for Target Measure       | null          |                 |
        | Value on Points       | showValues           | Show value on points                       | FALSE         | True|False      |
        | Display name          | displayName          | A Display name for Measure                 | Displayname   |                 |
        | Font style            | fontStyle            | Style of fonts                             | Normal          | Normal/Italique/Oblique  |
        | Font weight           | fontWeight           | Weight of fonts                            | Normal          |  Normal/Bold/100-900               |
        | Number format         | numberFormat         | Possible number formats                    | Actual          | K,M,B,Actual    |
        | Text colour           | textColor            | The text colour                            | #617c8c       |                 |
        | Display colour        | displayColor         | An display colour                          | null          |                 |
        | Enable Gradient Color | isGradient           | Enable Gradient Color for Source Measure   | FALSE         | True|False      |


## TABLE

* ### Attributes       

| Type       | Required | Optional |
|------------|----------|----------|
| Dimensions | 1        | 9        |
| Measures   | 1        | 9        |

* ### Configuration Properties    
    * ####  Dimensions
		| Property Name          | Config Property Name            | Description                               | Default Value          | Possible Values         |
	    |------------------------|---------------------------------|-------------------------------------------|------------------------|-------------------------|
		| Display name           | displayNameForDimension         | A Display name for Dimension              | Displayname            |                         |
		| Font style             | fontStyleForDimension           | Style of fonts for Dimension              | Normal                 | Normal/Italique/Oblique |
		| Font weight            | fontWeightForDimension          | Weight of fonts for Dimension             | Normal                 | Normal/Bold/100-900     |
		| Text colour            | textColorForDimension           | The text colour for Dimension             | #617c8c                |                         |
		| Font size              | fontSizeForDimension            | Size of fonts for Dimension               | 9                      |                         |
		| Cell colour            | cellColorForDimension           | Cell colour for table cells for Dimension | rgba(255, 255, 255, 1) |                         |
		| Text colour expression | textColorExpressionForDimension | The text colour expression for Dimension  | null                   |                         |
		| Text alignment         | textAlignmentForDimension       | Alignment of text for Dimension           | Center                 | Center/Left/Right       |
	
	* ####  Measures	
		| Property Name          | Config Property Name          | Description                                        | Default Value          | Possible Values         |
		|------------------------|-------------------------------|----------------------------------------------------|------------------------|-------------------------|
		| Display name           | displayNameForMeasure         | A Display name for Measure                         | Displayname            |                         |
		| Font style             | fontStyleForMeasure           | Style of fonts for Measure                         | Normal                 | Normal/Italique/Oblique |
		| Font weight            | fontWeightForMeasure          | Weight of fonts for Measure                        | Normal                 | Normal/Bold/100-900     |
		| Text colour            | textColorForMeasure           | The text colour for Measure                        | #617c8c                |                         |
		| Font size              | fontSizeForMeasure            | Size of fonts for Measure                          | 9                      |                         |
		| Cell colour            | cellColorForMeasure           | Cell colour for table cells for Measure            | rgba(255, 255, 255, 1) |                         |
		| Text colour expression | textColorExpressionForMeasure | The text colour expression for Measure             | null                   |                         |
		| Cell colour expression | cellColorExpressionForMeasure | Expression to customize cell colour of table cells | null                   |                         |
		| Icon name              | iconNameForMeasure            | An icon name for Measure                           | null                   |                         |
		| Icon Expression        | iconExpressionForMeasure      | An icon expression for Measure                     | null                   |                         |
		| Text alignment         | textAlignmentForMeasure       | Alignment of text for Measure                      | Center                 | Center/Left/Right       |
		| Icon position          | iconPositionForMeasure        | An icon position for Measure                       | Center                 | Center/Left/Right       |
		| Number format          | numberFormatForMeasure        | Possible number formats for Measure                | Actual                 | K,M,B,Actual            |
		
		
## PIVOTTABLE

* ### Attributes       

| Type       | Required | Optional |
|------------|----------|----------|
| Dimensions | 1        | 4        |
| Measures   | 1        | 9        |

* ### Configuration Properties    
    * ####  Dimensions		
		| Property Name          | Config Property Name            | Description                               | Default Value          | Possible Values         |
		|------------------------|---------------------------------|-------------------------------------------|------------------------|-------------------------|
		| Display name           | displayNameForDimension         | A Display name for Dimension              | Displayname            |                         |
		| Font style             | fontStyleForDimension           | Style of fonts for Dimension              | Normal                 | Normal/Italique/Oblique |
		| Font weight            | fontWeightForDimension          | Weight of fonts for Dimension             | Normal                 | Normal/Bold/100-900     |
		| Text colour            | textColorForDimension           | The text colour for Dimension             | #617c8c                |                         |
		| Font size              | fontSizeForDimension            | Size of fonts for Dimension               | 9                      |                         |
		| Cell colour            | cellColorForDimension           | Cell colour for table cells for Dimension | rgba(255, 255, 255, 1) |                         |
		| Text colour expression | textColorExpressionForDimension | The text colour expression for Dimension  | null                   |                         |
		| Text alignment         | textAlignmentForDimension       | Alignment of text for Dimension           | Center                 | Center/Left/Right       |
		| Pivot                  | isPivoted                       | Pivot the dimension                       | FALSE                  | true/false              |    
		
    * ####  Measures
		| Property Name          | Config Property Name          | Description                                        | Default Value          | Possible Values         |
		|------------------------|-------------------------------|----------------------------------------------------|------------------------|-------------------------|
		| Display name           | displayNameForMeasure         | A Display name for Measure                         | Displayname            |                         |
		| Font style             | fontStyleForMeasure           | Style of fonts for Measure                         | Normal                 | Normal/Italique/Oblique |
		| Font weight            | fontWeightForMeasure          | Weight of fonts for Measure                        | Normal                 | Normal/Bold/100-900     |
		| Text colour            | textColorForMeasure           | The text colour for Measure                        | #617c8c                |                         |
		| Font size              | fontSizeForMeasure            | Size of fonts for Measure                          | 9                      |                         |
		| Cell colour            | cellColorForMeasure           | Cell colour for table cells for Measure            | rgba(255, 255, 255, 1) |                         |
		| Text colour expression | textColorExpressionForMeasure | The text colour expression for Measure             | null                   |                         |
		| Cell colour expression | cellColorExpressionForMeasure | Expression to customize cell colour of table cells | null                   |                         |
		| Icon name              | iconNameForMeasure            | An icon name for Measure                           | null                   |                         |
		| Icon Expression        | iconExpressionForMeasure      | An icon expression for Measure                     | null                   |                         |
		| Text alignment         | textAlignmentForMeasure       | Alignment of text for Measure                      | Center                 | Center/Left/Right       |
		| Icon position          | iconPositionForMeasure        | An icon position for Measure                       | Center                 | Center/Left/Right       |
		| Number format          | numberFormatForMeasure        | Possible number formats for Measure                | Actual                 | K,M,B,Actual            |
		| Icon Font weight       | iconFontWeight                | Weight of icon fonts                               | Normal                 | Normal/Bold/100-900     |
		| Icon colour            | iconColor                     | An Icon colour                                     | null                   |                         |
		
## MAP

* ### Attributes       

| Type       | Required | Optional |
|------------|----------|----------|
| Dimensions | 1        | 1        |
| Measures   | 1        | 1        |

* ### Configuration Properties    
    * ####  Dimensions		
		| Config Property Name | Description             | Default Value | Possible Values |
		|----------------------|-------------------------|---------------|-----------------|
		| numberFormat         | Possible number formats | Actual        | K,M,B,Actual    |
		| displayColor         | An display colour       | null          |                 |
    * ####  Measures
		| Property Name | Config Property Name | Description      | Default Value | Possible Values |
		|---------------|----------------------|------------------|---------------|-----------------|
		| Border colour | borderColor          | An border colour | null          |                 |
		
## TREEMAP

* ### Attributes       

| Type       | Required | Optional |
|------------|----------|----------|
| Dimensions | 1        | 1        |
| Measures   | 1        | 0        |

* ### Configuration Properties    
    * ####  Dimensions		
		| Property Name    | Config Property Name   | Description                   | Default Value | Possible Values         |
		|------------------|------------------------|-------------------------------|---------------|-------------------------|
		| Show Labels      | showLabelForDimension  | Boolean to show labels        | TRUE          | true/false              |
		| Colour of labels | labelColorForDimension | Label colours                 | null          | null                    |
		| Display colour   | displayColor           | An display colour             | null          | null                    |
		| Font style       | fontStyleForDimension  | Style of fonts for Dimension  | Normal        | Normal/Italique/Oblique |
		| Font weight      | fontWeightForDimension | Weight of fonts for Dimension | Normal        | Normal/Bold/100-900     |
		| Font size        | fontSizeForDimension   | Size of fonts for Dimension   | 9             |                         |
	
    * ####  Measures		
		| Property Name   | Config Property Name | Description                     | Default Value | Possible Values         |
		|-----------------|----------------------|---------------------------------|---------------|-------------------------|
		| Value on Points | showValues           | Show value on points            | FALSE         | true/false              |
		| Font size       | fontSizeForMes       | Size of fonts                   | 9             |                         |
		| Font style      | fontStyleForMes      | Style of fonts                  | Normal        | Normal/Italique/Oblique |
		| Font weight     | fontWeightForMes     | Weight of fonts                 | Normal        | Normal/Bold/100-900     |
		| Number format   | numberFormat         | Possible number formats         | Actual        | K,M,B,Actual            |
		| Text colour     | valueTextColour      | The text colour                 | #617c8c       |                         |
		| Color Pattern   | colorPattern         | Color pattern to vizualizations | null          | Single/Gradient/Unique  |
		
## HEATMAP

* ### Attributes       

| Type       | Required | Optional |
|------------|----------|----------|
| Dimensions | 1        | 1        |
| Measures   | 1        | 0        |

* ### Configuration Properties    
    * ####  Dimensions		
		| Property Name    | Config Property Name   | Description                   | Default Value | Possible Values         |
		|------------------|------------------------|-------------------------------|---------------|-------------------------|
		| Colour of labels | dimLabelColor          | Label colours                 | null          | null                    |
		| Display name     | displayName            | A Display name                | Displayname   |                         |
		| Font style       | fontStyleForDimension  | Style of fonts for Dimension  | Normal        | Normal/Italique/Oblique |
		| Font weight      | fontWeightForDimension | Weight of fonts for Dimension | Normal        | Normal/Bold/100-900     |
		| Font size        | fontSizeForDimension   | Size of fonts for Dimension   | 9             |                         |
    * ####  Measures
		| Property Name    | Config Property Name   | Description                   | Default Value | Possible Values         |
		|------------------|------------------------|-------------------------------|---------------|-------------------------|
		| Value on Points  | showValues             | Show value on points          | FALSE         | True/False              |
		| Number format    | numberFormat           | Possible number formats       | Actual        | K,M,B,Actual            |
		| Show Icon        | showIcon               | Boolean to show icons         | TRUE          | true/false              |
		| Color Coding     | colourCoding           | Conditional coloring          | null          |                         |
		| Display name     | displayNameForMeasure  | A Display name for Dimension  | Displayname   |                         |
		| Font style       | fontStyleForMeasure    | Style of fonts for Dimension  | Normal        | Normal/Italique/Oblique |
		| Font weight      | fontWeightForMeasure   | Weight of fonts for Dimension | Normal        | Normal/Bold/100-900     |
		| Text colour      | valueTextColour        | The text colour for Dimension | #617c8c       |                         |
		| Font size        | fontSizeForMeasure     | Size of fonts for Dimension   | 9             |                         |
		| Alignment        | valuePosition          | an alignment                  | Left          | Center/Left/Right       |
		| Icon name        | iconNameForMeasure     | An icon name for Measure      | null          |                         |
		| Icon position    | iconPositionForMeasure | An icon position for Measure  | Center        | Center/Left/Right       |
		| Icon Font weight | iconFontWeight         | Weight of icon fonts          | Normal        | Normal/Bold/100-900     |
		| Icon colour      | iconColor              | An Icon colour                | null          |                         |
					
## BOXPLOT_CHART

* ### Attributes       

| Type       | Required | Optional |
|------------|----------|----------|
| Dimensions | 1        | 0        |
| Measures   | 5        | 0        |

* ### Configuration Properties    
    * ####  Dimensions		
		| Property Name    | Config Property Name | Description             | Default Value | Possible Values |
		|------------------|----------------------|-------------------------|---------------|-----------------|
		| Number format    | numberFormat         | Possible number formats | Actual        | K,M,B,Actual    |
		| Show Labels      | showLabel            | Boolean to show labels  | TRUE          | true/false      |
		| Colour of labels | labelColor           | Label colours           | null          | null            |
    * ####  Measures
		| Property Name    | Config Property Name | Description             | Default Value | Possible Values |
		|------------------|----------------------|-------------------------|---------------|-----------------|
		| Display colour   | displayColor         | An display colour | null        |     |

## BOXPLOT_CHART

* ### Attributes       

| Type       | Required | Optional |
|------------|----------|----------|
| Dimensions | 1        | 0        |
| Measures   | 2        | 0        |

* ### Configuration Properties    
    * ####  Chart Properties		
		| Property Name        | Config Property Name | Description                 | Default Value | Possible Values     |
		|----------------------|----------------------|-----------------------------|---------------|---------------------|
		| Orientation          | orientation          | Orientation of Bullet Chart | Horizontal    | Horizontal/Vertical |
		| Segments             | segments             | No of Segments              | 1             | 1 to 5              |
		| Segment Color Coding | segmentInfo          | Segment Color Coding        | null          |                     |
    * ####  Dimensions		
		| Property Name   | Config Property Name | Description          | Default Value | Possible Values         |
		|-----------------|----------------------|----------------------|---------------|-------------------------|
		| Value on Points | showValues           | Show value on points | FALSE         | true/false              |
		| Font size       | fontSizeForMes       | Size of fonts        | 9             |                         |
		| Font style      | fontStyleForMes      | Style of fonts       | Normal        | Normal/Italique/Oblique |
		| Font weight     | fontWeightForMes     | Weight of fonts      | Normal        | Normal/Bold/100-900     |
    * ####  Measures
		| Property Name  | Config Property Name | Description             | Default Value | Possible Values |
		|----------------|----------------------|-------------------------|---------------|-----------------|
		| Target colour  | targetColor          | Target colour           | #676a6c       | null            |
		| Display colour | displayColor         | An display colour       | null          |                 |
		| Number format  | measureNumberFormat  | Possible number formats | Actual        | K,M,B,Actual    |
		| Number format  | targetNumberFormat   | Possible number formats | Actual        | K,M,B,Actual    |
									
## SANKEY_CHART

* ### Attributes       

| Type       | Required | Optional |
|------------|----------|----------|
| Dimensions | 2        | 3        |
| Measures   | 1        | 0        |

* ### Configuration Properties    
    * ####  Dimensions
		| Property Name   | Config Property Name | Description                        | Default Value | Possible Values         |
		|-----------------|----------------------|------------------------------------|---------------|-------------------------|
		| Font style      | fontStyle            | Style of fonts for Dimension       | Normal        | Normal/Italique/Oblique |
		| Font weight     | fontWeight           | Weight of fonts for Dimension      | Normal        | Normal/Bold/100-900     |
		| Font size       | fontSize             | Size of fonts for Dimension        | 9             |                         |
		| Text colour     | textColor            | The text colour for Target Measure | #617c8c       |                         |
		| Value on Points | showValues           | Show value on points               | FALSE         | True/False              |
	* ####  Measures
		| Property Name  | Config Property Name | Description                     | Default Value | Possible Values        |
		|----------------|----------------------|---------------------------------|---------------|------------------------|
		| Number format  | numberFormat         | Possible number formats         | Actual        | K,M,B,Actual           |
		| Color Pattern  | colorPattern         | Color pattern to vizualizations | null          | Single/Gradient/Unique |
		| Display colour | displayColor         | An display colour               | null          |                        |
		| Border colour  | borderColor          | An border colour                | null          |                        |
		
## SCATTER_PLOT_CHART

* ### Attributes       

| Type       | Required | Optional |
|------------|----------|----------|
| Dimensions | 1        | 0        |
| Measures   | 2        | 1        |

* ### Configuration Properties    

    * ####  Dimensions      

        | Property Name     | Config Property Name  | Description                                       | Default Value | Possible Values       |
        |-------------------|-----------------------|---------------------------------------------------|---------------|-----------------------|
        | Display name      | displayName           | A Display name                                    | Displayname   |                       |
        

    * ####  Measures   
        | Property Name     | Config Property Name  | Description                                       | Default Value | Possible Values       |
        |-------------------|-----------------------|---------------------------------------------------|---------------|-----------------------|
        | Value on Points   | showValues            | Show value on points                              | false         | true/false             |
        | Display name      | displayNameForMeasure | A Display name for Measure                        | Displayname   |                       |
        | Font style        | fontStyle             | Style of fonts                                    | Normal          | Normal/Italique/Oblique                 |
        | Font weight       | fontWeight            | Weight of fonts                                   | Normal          |   Normal/Bold/100-900                    |
        | Number format     | numberFormat          | Possible number formats                           | Actual          | K,M,B,Actual           |
        | Text colour       | textColor             | The text colour                                   | #617c8c       |                       |
        | Display colour    | displayColor          | An display colour                                 | null          |                       |
        | Border colour     | borderColor           | An border colour                                  | null          |                       |
        | Font size         | fontSize              | Size of fonts                                     | 9             |                       |
        
        
