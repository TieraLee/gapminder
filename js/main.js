// Creates a bootstrap-slider element
$("#yearSlider").slider({
    tooltip: 'always',
    tooltip_position:'bottom'
});
// Listens to the on "change" event for the slider
$("#yearSlider").on('change', function(event){
    // Update the chart on the new value
    updateChart(event.value.newValue);
});

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 60, r: 40, b: 60, l: 60};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Color mapping based on continents
var contintentColors = {Asia: '#fc5a74', Europe: '#fee633',
    Africa: '#24d5e8', Americas: '#82e92d', Oceania: '#fc5a74'};

var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

// axis labels
svg.append('text')
    .attr('class', 'x-axis-label')
    .attr('transform', 'translate('+[((chartWidth / 3)), chartHeight +100]+')')
    .text('GDP/capita in $/year adjusted for inflation');

svg.append('text')
    .attr('class', 'y-axis-label')
    .attr('transform', 'translate('+[padding.l-40, ((chartHeight / 2)+150)]+') rotate(270)')
    .text('Life Expectancy in Years');

//title
svg.append('text')
    .attr('class','title')
    .attr('transform', 'translate(' + [2*(svgWidth/3), padding.t - 10] + ')')
    .text('GapMinder Life Expectancy vs. GDP');

d3.csv('./data/gapminder.csv',
    function(d){
        // This callback formats each row of the data
        return {
            country: d.country,
            year: +d.year,
            population: +d.population,
            continent: d.continent,
            lifeExp: +d.lifeExp,
            gdpPercap: +d.gdpPercap
        };
    },
    function(error, dataset){
        if(error) {
            console.error('Error while loading ./gapminder.csv dataset.');
            console.error(error);
            return;
        }

        // gathering domain information for scales
        var maxGdp = d3.max(dataset, function(d){
            return d.gdpPercap;
        });

        var minGdp = d3.min(dataset, function(d){
            return d.gdpPercap;
        });

        var maxLife = d3.max(dataset, function(d){
            return d.lifeExp;
        });

        var minLife = d3.min(dataset, function(d) {
            return d.lifeExp;
        });

        var maxPop = d3.max(dataset, function(d){
            return d.population;
        });

        var minPop = d3.min(dataset, function(d){
            return d.population;
        });
        // **** Set up your global variables and initialize the chart here ****
        
        countryData = dataset;
        // scales and axes
        xScale = d3.scaleLog()
            .domain([minGdp, maxGdp])
            .range([0, chartWidth]);

        yScale = d3.scaleLinear()
            .domain([minLife, maxLife])
            .range([chartHeight,0]);

        radiusScale = d3.scaleSqrt()
            .domain([minPop,maxPop])
            .range([1,50]);  


        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate('+[padding.l, svgHeight - padding.b]+')')
            .call(d3.axisBottom(xScale).tickValues([500,1000,2000,4000,8000,16000,32000,64000])
                .tickFormat(d3.format(",.0f")));

        svg.append('g')
            .attr('class','y axis')
            .attr('transform', 'translate(' +[padding.l, padding.t] + ')')
            .call(d3.axisLeft(yScale).ticks(5));



    // Create a grid for the y-scale
    
    var xGrid =d3.axisTop(xScale)
        .tickSize(-chartHeight, 0, 0) // Use tick size to create grid line, 0 refers to no domain path
        .tickFormat('')
        .tickValues([500,1000,2000,4000,8000,16000,32000,64000]);

    var yGrid = d3.axisLeft(yScale)
        .tickSize(-chartWidth, 0, 0) // Use tick size to create grid line
        .tickFormat('')
        .ticks(5);

    //Append and call gridlines 
    chartG.append('g')
        .attr('class', 'grid')
        .call(xGrid);

    chartG.append('g')
        .attr('class', 'grid')
        .call(yGrid);

        updateChart(1952);
    });

function updateChart(year) {
    // **** Update the chart based on the year here ****
    var filteredYear = countryData.filter(function(d){
        return d['year'] == year;

    });

    var bubble = chartG.selectAll('.bubble') // use .classname when selecting
        .data(filteredYear, function(d) {
            return d.country;
        });

    var bubbleEnter = bubble.enter()
        .append('g')
        .attr('class','bubble'); // use classname when calling this classsname

  
    bubbleEnter.append('circle')
        .style('fill',function(d){
            return contintentColors[d.continent];
        })
        .style('stroke','black');

    bubble.merge(bubbleEnter)
        .select('circle')
        .attr('cx', function(d){
            return xScale(d.gdpPercap);
        })
        .attr('cy', function(d) {
            return yScale(d.lifeExp);
        })
        .attr('r', function(d){
            return radiusScale(d.population);
        });

    bubble.exit().remove();

}
