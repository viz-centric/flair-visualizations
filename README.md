

## How to bundle the files

create js files

Include file in **main.js** file

> flair-visualizations/js/main.js

Add visualizations related files inside **`flair-visualizations/js/charts`** directory

Add utils files inside **`flair-visualizations/js/extras `** directory

excute the  webpack command.

> webpack

Webpack command create the **main.bundle.js** file

> flair-visualizations/dist/main.bundle.js


## convert scss to css

##### Install Compass

[http://compass-style.org/install/](http://compass-style.org/install/)

create scss files inside **flair-visualizations/styles/sass/partials** directory

then run command 

> cd styles
 
run command 
> 
> compass compile

compass compile command update or create the screen.css file

> flair-visualizations/styles/stylesheets/screen.css

#### install package 

> npm install 
> git+https://00b635f3054807339ad40a820da7dd4120691229:x-oauth-basic@github.com/DX26-io/flair-visualizations.git

**Import file**

import flairVisualizations from 'flair-visualizations/js/main';

 **How to call visualizations function**

**Example :**

    const clusteredverticalBarChartObj = flairVisualizations
            .clusteredverticalbar()
            .config(config) // pass configuration
            .tooltip(true) // set display tooltip or not
            .print(false)  // disable browser interaction 
            .notification(false) // is notification call
            .data(metaData); // pass data for visualization
          clusteredverticalBarChartObj(div[0]);

## build the project
npm run webpack


