
function sortBySequenceNumber(a, b) {
    return a.order - b.order;
}
function isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
}
const VisualizationUtils = {

    getPropertyValue: function (properties, propertyName, orElse) {
        var properties = properties.filter(function (item) {
            return item.propertyType.name === propertyName;
        });
        var property = properties[0];

        if (!property) {
            if (isFunction(orElse)) {
                return orElse();
            } else {
                return orElse;
            }
        } else {
            if (property.value && property.value.value) {
                return property.value.value
            } else {
                return property.value;
            }
        }
    },

    getFieldPropertyValue: function (field, propertyName, orElse) {
        return this.getPropertyValue(field.properties, propertyName, orElse);
    },

    getDimensionsAndMeasures: function (fields) {
        var dimensions = fields.filter(function (item) {
            return item.feature && item.feature.featureType === 'DIMENSION';
        }).map(function (item) {
            var newItem = {};
            // angular.copy(item, newItem);
            newItem = JSON.parse(JSON.stringify(item));
            newItem.feature.name = newItem.feature.name;
            return newItem;
        }).sort(function (a, b) {
            return sortBySequenceNumber(a.fieldType, b.fieldType);
        });

        var measures = fields.filter(function (item) {
            return item.feature && item.feature.featureType === 'MEASURE'
        }).map(function (item) {
            var newItem = {};
            newItem = JSON.parse(JSON.stringify(item));
            newItem.feature.name = newItem.feature.name;
            return newItem;
        })
            .sort(function (a, b) {
                return sortBySequenceNumber(a.fieldType, b.fieldType);
            });
        return {
            measures: measures,
            dimensions: dimensions
        };
    },

    getNames: function (arr) {
        arr = arr.sort(function (a, b) {
            return a.order - b.order;
        });
        return arr.map(function (item) {
            return item.feature.name;
        });
    },
    getTypes: function (arr) {
        return arr.map(function (item) {
            return item.feature.type;
        });
    },


}

module.exports = VisualizationUtils;