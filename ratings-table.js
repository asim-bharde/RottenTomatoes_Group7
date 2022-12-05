//year on the x-axis
//genre on the y-axis
//on mouse over: show how many fresh
//color scale: amount of rotten/fresh
//change from decades to every 5 years
//starting at 2000
//
//https://d3-graph-gallery.com/graph/heatmap_tooltip.html

import {scatterplot} from './script_rating.js';

d3.csv("rotten_tomatoes_movies.csv").then(
    function (data) {
        
        //replace the original_release_date with just the year
        for (let i = 0; i < data.length; i++) {
            data[i].original_release_date = data[i].original_release_date.split('-')[0]
        }

        for (let i = 0; i < data.length; i++) {
            data[i].original_release_date = Math.floor(data[i].original_release_date / 5) * 5
        }
        //console.log(data)

        var filtered_data = data.filter(function (e) { return e.original_release_date > 1999 })

        //console.log(filtered_data)

        //var myGroups = ["2000", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s"]
        var decades = [2000, 2005, 2010, 2015, 2020]
        var myVars = ["Action", "Comedy", "Drama", "Horror", "Mystery", "Kids/Family", "Sci/Fi"]
        var movie_genres = ["G","PG","PG-13","R","NR"]

        var heatmap_data = []

        for (var g of decades) {
            for (var v of movie_genres) {
                var b = {
                    'decade': g,
                    'rating': v,
                    'score': 0,
                    'count': 0
                }
                heatmap_data.push(b);
            }
        }

        for(var i = 0; i < filtered_data.length; i++){
            for(var j = 0; j < heatmap_data.length; j++){
                if(heatmap_data[j].rating == filtered_data[i].content_rating && heatmap_data[j].decade == filtered_data[i].original_release_date){
                    heatmap_data[j].count = heatmap_data[j].count + 1;
                    if(filtered_data[i].tomatometer_status == "Fresh" || filtered_data[i].tomatometer_status == "Certified-Fresh"){
                        heatmap_data[j].score = heatmap_data[j].score + 1;
                    }
                }
            }
        }

        //console.log(heatmap_data)

        for (var i = 0; i < heatmap_data.length; i++) {
            if(heatmap_data[i].count == 0){
                heatmap_data[i].score = 0;
                continue;
            }
            heatmap_data[i].score = heatmap_data[i].score / heatmap_data[i].count
            heatmap_data[i].score = heatmap_data[i].score * 100;
            heatmap_data[i].score = Math.round(heatmap_data[i].score)
        }


        //console.log(heatmap_data)


        var dimensions = {
            margin: {
                top: 30,
                bottom: 30,
                right: 30,
                left: 60
            },
            width: 300,
            height: 350,
        }
        var svg = d3.select("#ratingheatmap")
            .append("svg")
            .attr("width", dimensions.width + dimensions.margin.left + dimensions.margin.right)
            .attr("height", dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + dimensions.margin.left + "," + dimensions.margin.top + ")");



        var x = d3.scaleBand()
            .range([0, dimensions.width])
            .domain(decades)
            .padding(0.01);
        svg.append("g")
            .attr("transform", "translate(0," + dimensions.height + ")")
            .call(d3.axisBottom(x))

        // Build X scales and axis:
        var y = d3.scaleBand()
            .range([dimensions.height, 0])
            .domain(movie_genres)
            .padding(0.01);
        svg.append("g")
            .call(d3.axisLeft(y));

        var myColor = d3.scaleLinear()
            .range(["white", "#69b3a2"])
            .domain([1, 100])


        var tooltip = d3.select("#ratingheatmaptext")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        var mouseover = function (d) {
            tooltip.style("opacity", 1)
        }
        var mousemove = function (event, d) {
            tooltip
                .html(d.score + "% of these movies were Fresh or Certified Fresh")
                .style("left", (d3.pointer(this)[0] + 70) + "px")
                .style("top", (d3.pointer(this)[1]) + "px")
        }
        var click = function(event, d) {
            console.log(d)
            //console.log(event)
            var decade = {
                "decade": d.decade
            }
            var rating = {
                "rating": d.rating
            }
            if(localStorage.getItem("rating") != null){
                console.log("here")
                localStorage.removeItem("rating")
            }
            if(localStorage.getItem("decade") != null){
                localStorage.removeItem("decade")
            }
            localStorage.setItem("decade", JSON.stringify(decade))
            localStorage.setItem("rating", JSON.stringify(rating))

            scatterplot()
        }
        var mouseleave = function (d) {
            tooltip.style("opacity", 0)
        }

        svg.selectAll()
            .data(heatmap_data, function (d) { return d.decade + ':' + d.rating; })
            .enter()
            .append("rect")
            .attr("x", function (d) { return x(d.decade) })
            .attr("y", function (d) { return y(d.rating) })
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function (d) { return myColor(d.score) })
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .on("click", function(event, d){click(event, d)})
    }
)