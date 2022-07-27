
var countyURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'
var educationURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'

var countyData
var educationData

var svg = d3.select('svg')

// set the colors for legend
var warna = d3.scaleOrdinal()
                .domain([])
                .range(['#d7301f','#fc8d59','#fdcc8a','#fef0d9'])

// set the scale
let scale = d3.scaleLinear().domain([0,60]).range([50, 300]);

let axis = d3.axisBottom(scale)
            .tickPadding(10)
// since the highest percentega 60.4%, set tick values up to 60
axis.tickValues([0, 15, 30, 45, 60])
    .tickFormat(function(d){
        return d + '%';
    });

// call the axis
d3.select('svg g')
    .call(axis);

// legend with the color
g = d3.select('svg g')
        .attr('id','legend')

// dummy data for 4 different colors
var info = [1, 2, 3, 4]

// spread the 4 colors of the legend
g.selectAll('rect')
    .data(info)
    .join('rect')
    .attr("x", function(d,i){return 50 + i*63})
    .attr("y", -10)
    .attr("width", 63)
    .attr('height',10)
    .attr("fill", function(d){return warna(d) })


var drawMap = () =>{

    let tooltip = d3.select("body")
                .append("div")
                .attr("id","tooltip")
                .style("opacity",0)


    svg.selectAll('path')
            .data(countyData)
            .join('path')
            .attr('d', d3.geoPath())
            .attr('class','county')
            .attr("fill", (countyDataItem) => {
                let id = countyDataItem['id']
                let fips = educationData.find((d)=>{
                    return d['fips'] == id
                })
                let percentage = fips['bachelorsOrHigher']
                if (percentage <= 15){
                    return '#d7301f'
                }else if (percentage <= 30){
                    return '#fc8d59'
                }else if (percentage <= 45){
                    return '#fdcc8a'
                } else {
                    return '#fef0d9'
                }
                })
            .attr('data-fips', (countyDataItem) => countyDataItem['id'])
            .attr('data-education',(countyDataItem) =>{
                let id = countyDataItem['id']
                let fips = educationData.find((d)=>{
                    return d['fips'] == id
                })
                return fips['bachelorsOrHigher']
                })
            .on("mouseover", (event, countyDataItem) =>{
                let id = countyDataItem['id']
                let fips = educationData.find((d)=>{
                    return d['fips'] == id
                })
                tooltip.transition()
                        .attr("data-education", fips['bachelorsOrHigher'])
                        .duration(200)
                        .style("opacity", 0.9)
                        .text(fips['state'] + ' ' + fips['area_name'] + ': ' + fips['bachelorsOrHigher']  + '%')
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () =>{
                tooltip.transition()
                        .duration(500)
                        .style("opacity", 0)
            })

}

d3.json(countyURL).then(
    (data, error) => {
        if(error){
            console.log(error)
        }else{
            countyData = topojson.feature(data, data.objects.counties).features
            d3.json(educationURL).then(
                (data, error) =>{
                    if(error){
                        console.log(error)
                    }else{
                        educationData = data
                        drawMap()
                    }
                }
            )
        }
    }
)