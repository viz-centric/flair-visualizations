var d3 = require('d3');

function common() {
    return {
        MARGIN: 15,
        PADDING: 15,
        OFFSET: 10,
        DEFAULT_FONTSTYLE: 'normal',
        DEFAULT_FONTSIZE: '60px',
        DEFAULT_FONTWEIGHT: 200,
        DEFAULT_COLOR: '#DC1C50',
        NEGATIVE_DISPLAY_COLOR: '#DC143C',
        NEGATIVE_BORDER_COLOR: '#DC143C',
        POSITIVE_KPI_COLOR: '#009933',
        NEGATIVE_KPI_COLOR: '#ff0000',
        LEGEND_COLOR: '#6B6A5D',
        HIGHLIGHTER: '#DCDCDC',
        SEPARATIONLINE: '#676a6c',
        BORDER_RADIUS: 5,
        DURATION: 1000,
        AXIS_THICKNESS: 50,
        SHOWAXISLABEL: 'Formated',
        LINETYPE: {
            AREA: "AREA",
            LINE: "LINE"
        },
        COMPARABLE_DATA_TYPES: ['timestamp', 'date', 'datetime'],
        COLORSCALE: d3.scaleOrdinal()
            .range([
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
            ])
    }
}

module.exports = common;