const margin = {top:100, right:10, bottom:50, left:120};

const colors = ['#E04836','#F39D41','#8D5924','#5696BC','#2F5168','#FFFFFF'];

const max_width = 1000;
const max_height = 600;

var width = Math.min(max_width,window.innerWidth) - margin.right - margin.left;
var height = Math.min(max_height,window.innerHeight)- margin.top - margin.bottom;


var g = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var promises = [d3.csv('./data/merged.csv')];

var xScale = d3.scaleLinear()
               .range([0,width]);
var yScale = d3.scaleLog()
               .range([height,0]);

var rScale = d3.scaleSqrt()
               .range([1,40]);

var color = d3.scaleOrdinal().range(colors);

var tooltip = d3.select("div.tooltip");

//const continent = {'europe':0, 'Oceania':1, 'Africa':2};

var xScaleGenerator = d3.axisBottom(xScale);
var yScaleGenerator = d3.axisLeft(yScale)
                        .tickFormat(function(d,i) { 
                        	if ((d == 10)|(d == 100)|(d == 1000)|(d == 10000)|(d == 100000)) return d3.format(".0s")(d);
                        	else return ""; 
                        })
                        .tickSize(0);




var render = function(data){

	xScale.domain(d3.extent(data,(d) => d['per capita GDP']));
	yScale.domain([1,500000]);
	rScale.domain(d3.extent(data,(d) => d.pop));


	g.append("g")
	 .attr("class","xaxis")
     .attr("transform",`translate(${0},${height})`)
	 .call(xScaleGenerator);

	//yScaleGenerator.ticks(6);


    g.append("g")
     .attr("class","yaxis")
     .attr("transform",`translate(${0},${0})`)
	 .call(yScaleGenerator);


	 g.selectAll("circle")
	  .data(data)
	  .enter()
	  .append("circle")
	  .attr("fill",(d) => color(d.continent))
	  .attr("opacity",.5)
	  .attr("cx",(d) => xScale(d['per capita GDP']))
	  .attr("cy",(d) => yScale(d['count']))
	  .attr("r",(d) => rScale(d.pop))
	  .attr("stroke","black").attr("stroke-width",1)
	  .on("mouseover",function(d,i){
                d3.select(this).attr("stroke-width",3);
                return tooltip.style("hidden", false).html(d.name + "<br>" + "Accessions: "+ (d.count-1) );
            })
      .on("mousemove",function(d){
                tooltip.classed("hidden", false)
                       .style("top", (d3.event.pageY) + "px")
                       .style("left", (d3.event.pageX + 10) + "px")
                       .html(d.name + "<br>" + "Accessions: "+ (d.count-1));
            })
      .on("mouseout",function(d,i){
                d3.select(this).attr("stroke","black").attr("stroke-width",1);
                tooltip.classed("hidden", true);
            });

      g.append("text")
       .attr("x",width/2)
       .attr("y",height + 40)
       .attr("text-anchor","middle")
       .text("Per Capita GDP ($)");	

      g.append("text")
       .attr("x",0)
       .attr("y",-50)
       .attr("text-anchor","start")
       .attr("font-size","20")
       .text("Per Capita GDP ($) vs. Number of RILM Records");

       g.append("text")
       .attr("x",0)
       .attr("y",-20)
       .attr("text-anchor","start")
       .text("Area indicates population. Color indicates a country's continent.");


      g.append("text")
       .attr("x",-120)
       .attr("y",height/2)
       .text("RILM Records");

       g.append("text")
       .attr("x",-120)
       .attr("y",height/2 + 20)
       .text("Log Scale");


};



Promise.all(promises).then(function(data){

	countries = data[0];

    countries.forEach(function(d){
        d['per capita GDP'] = +d['per capita GDP'];
        d.count = +d.count + 1;
        d.pop = +d.pop;
    });

   render(countries);

});
