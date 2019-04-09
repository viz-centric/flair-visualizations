var Express = require('express');
var app = Express();
var jsdom = require('jsdom');
var flairVisualizations = require('./js/main');

app.engine('.html', require('ejs').__express);
app.set('views', __dirname);
app.set('view engine', 'html');

app.locals.flairVisualizations = require('./dist/main.bundle');

var data = [{
    city: '2',
    cost: 5
}, {
    city: '3',
    cost: 4
}, {
    city: '4',
    cost: 8
}, {
    city: '5',
    cost: 10
}];

var config = {
    dimension: ['city'],
    measure: ['cost'],
    legend: true, // true|false
    legendPosition: 'left', // top|bottom|right|left
    value: 'label', // label|value|percentage
    valueAsArc: true, // true|false
    valuePosition: 'outside' // inside|outside
};

console.log(flairVisualizations);

app.get('/', function(req, res) {
    res.render('ssr', {
        data: data,
        config: config
    });
});

app.listen(3000);

console.log('Listening on port 3000...');
