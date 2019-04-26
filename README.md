# Documentation



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
     * [Sactter Plot Chart](#SCATTER_PLOT_CHART)       
     * [InfoGraphics Chart](#INFOGRAPHICS_CHART)       
     * [KPI Chart](#KPI_CHART)       
     * [Bullet Chart](#BULLET_CHART)      
     * [BoxPlot Chart](#BOXPLOT_CHART)       
     * [Sankey Chart](#COMBO_CHART)       
     * [Table](#Table)       
     * [PivotTable](#PIVOTTABLE) 
     
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
| Legend position   | legendPosition       | Legend position with sides                        | null          | Top|bottom|left|right |
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
        | Font style        | fontStyle             | Style of fonts                                    | null          |                       |
        | Font weight       | fontWeight            | Weight of fonts                                   | null          |                       |
        | Number format     | numberFormat          | Possible number formats                           | null          | K,M,B,Actual           |
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
        | Font style        | fontStyle             | Style of fonts                                    | null          |                       |
        | Font weight       | fontWeight            | Weight of fonts                                   | null          |                       |
        | Number format     | numberFormat          | Possible number formats                           | null          | K,M,B,Actual           |
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
        | Font style        | fontStyle             | Style of fonts                                    | null          |                       |
        | Font weight       | fontWeight            | Weight of fonts                                   | null          |                       |
        | Number format     | numberFormat          | Possible number formats                           | null          | K,M,B,Actual           |
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
        | Font style        | fontStyle             | Style of fonts                                    | null          |                       |
        | Font weight       | fontWeight            | Weight of fonts                                   | null          |                       |
        | Number format     | numberFormat          | Possible number formats                           | null          | K,M,B,Actual           |
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
        | Font style        | fontStyle             | Style of fonts                                    | null          |                       |
        | Font weight       | fontWeight            | Weight of fonts                                   | null          |                       |
        | Number format     | numberFormat          | Possible number formats                           | null          | K,M,B,Actual           |
        | Text colour       | textColor             | The text colour                                   | #617c8c       |                       |
        | Display colour    | displayColor          | An display colour                                 | null          |                       |
        | Border colour     | borderColor           | An border colour                                  | null          |                       |
        | Font size         | fontSize              | Size of fonts                                     | 9             |                       |
        | Line Chart Point type | pointType             | Type of points                                    | null          | Circle,Cross,CrossRot,Dash,Line,Rect,RectRounded,RectRot,Star,Triangle |
        | Line Type             | lineType              | Types of line charts                              | null          | Area/Line                                                              |

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
        | Font style        | fontStyle             | Style of fonts                                    | null          |                       |
        | Font weight       | fontWeight            | Weight of fonts                                   | null          |                       |
        | Number format     | numberFormat          | Possible number formats                           | null          | K,M,B,Actual           |
        | Text colour       | textColor             | The text colour                                   | #617c8c       |                       |
        | Display colour    | displayColor          | An display colour                                 | null          |                       |
        | Border colour     | borderColor           | An border colour                                  | null          |                       |
        | Font size         | fontSize              | Size of fonts                                     | 9             |                       |
        | Line Chart Point type | pointType             | Type of points                                    | null          | Circle,Cross,CrossRot,Dash,Line,Rect,RectRounded,RectRot,Star,Triangle |
        | Line Type             | lineType              | Types of line charts                              | null          | Area/Line                                                              |
        | Combo chart type      | comboChartType        | line or bar                                       | null          | Bar/Line                                                               |

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
        | Show value as  | valueAs              | show labels as option in piece lable                           | null          | Label/Percentage/Value |
        | Value as Arc   | valueAsArc           | Boolean that says value on the segment should be in arc or not | TRUE          |                        |
        | Value position | valuePosition        | Position of value outside or inside pie segment                | null          | Border/Outside         |
        
        
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
        | Show value as  | valueAs              | show labels as option in piece lable                           | null          | Label/Percentage/Value |
        | Value as Arc   | valueAsArc           | Boolean that says value on the segment should be in arc or not | TRUE          |                        |
        | Value position | valuePosition        | Position of value outside or inside pie segment                | null          | Border/Outside         |
        
     * ####  Dimensions
        | Property Name | Config Property Name | Description                  | Default Value | Possible Values |
        |---------------|----------------------|------------------------------|---------------|-----------------|
        | Display name  | dimensionDisplayName | A Display name for Dimension | Displayname   |                 |
        | Display name  | measureDisplayName   | A Display name for Measure   | Displayname   |                 |
        | Font style    | fontStyle            | Style of fonts               | null          |                 |
        | Font weight   | fontWeight           | Weight of fonts              | null          |                 |
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
        | Gauge Type    | gaugeType            | Type of gauges | null          | Half Circle/Radial |       
        
    * ####  Dimensions 
        | Property Name         | Config Property Name | Description                                | Default Value | Possible Values |
        |-----------------------|----------------------|--------------------------------------------|---------------|-----------------|
        | Value on Points       | targetShowValues     | Show value on points for Target Measure    | FALSE         | True|False      |
        | Display name          | targetDisplayName    | A Display name for Target Measure          | Displayname   |                 |
        | Font style            | targetFontStyle      | Style of fonts for Target Measure          | null          |                 |
        | Font weight           | targetFontWeight     | Weight of fonts for Target Measure         | null          |                 |
        | Number format         | targetNumberFormat   | Possible number formats for Target Measure | null          | K,M,B,Actual    |
        | Text colour           | targetTextColor      | The text colour for Target Measure         | #617c8c       |                 |
        | Display colour        | targetDisplayColor   | An display colour for Target Measure       | null          |                 |
        | Value on Points       | showValues           | Show value on points                       | FALSE         | True|False      |
        | Display name          | displayName          | A Display name for Measure                 | Displayname   |                 |
        | Font style            | fontStyle            | Style of fonts                             | null          |                 |
        | Font weight           | fontWeight           | Weight of fonts                            | null          |                 |
        | Number format         | numberFormat         | Possible number formats                    | null          | K,M,B,Actual    |
        | Text colour           | textColor            | The text colour                            | #617c8c       |                 |
        | Display colour        | displayColor         | An display colour                          | null          |                 |
        | Enable Gradient Color | isGradient           | Enable Gradient Color for Source Measure   | FALSE         | True|False      |
