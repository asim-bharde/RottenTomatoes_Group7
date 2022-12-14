//year on the x-axis
//genre on the y-axis
//on mouse over: show how many fresh
//color scale: amount of rotten/fresh
//change from decades to every 5 years
//starting at 2000
//
//https://d3-graph-gallery.com/graph/heatmap_tooltip.html

import {scatterplot} from './script_rating.js'
//var filters = require('./filters.json')

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
        var movie_genres = ["Action & Adventure", "Comedy", "Drama", "Horror", "Mystery & Suspense", "Kids & Family", "Science Fiction & Fantasy"]

        var heatmap_data = []

        for (var g of decades) {
            for (var v of movie_genres) {
                var b = {
                    'decade': g,
                    'genre': v,
                    'score': 0,
                    'count': 0
                }
                heatmap_data.push(b);
            }
        }


        //console.log(heatmap_data)

        for (var i = 0; i < filtered_data.length; i++) {
            var genres = filtered_data[i].genres.split(',');

            for (var g of genres) {
                g = g.trim()
                for (var j = 0; j < heatmap_data.length; j++) {
                    if (heatmap_data[j].decade == filtered_data[i].original_release_date && heatmap_data[j].genre == g) {
                        heatmap_data[j].count = heatmap_data[j].count + 1;
                        if (filtered_data[i].tomatometer_status == "Certified-Fresh" || filtered_data[i].tomatometer_status == "Fresh") {
                            heatmap_data[j].score = heatmap_data[j].score + 1;
                        }
                    }
                }
            }
        }

        for (var i = 0; i < heatmap_data.length; i++) {
            heatmap_data[i].score = heatmap_data[i].score / heatmap_data[i].count
            heatmap_data[i].score = heatmap_data[i].score * 100;
            heatmap_data[i].score = Math.round(heatmap_data[i].score)
        }

        for (var i = 0; i < heatmap_data.length; i++) {
            //heatmap_data[i].decade = '' + heatmap_data[i].decade + 's';
            if (heatmap_data[i].genre == 'Action & Adventure') {
                heatmap_data[i].genre = 'Action'
            }
            else if (heatmap_data[i].genre == 'Mystery & Suspense') {
                heatmap_data[i].genre = 'Mystery'
            }
            else if (heatmap_data[i].genre == 'Kids & Family') {
                heatmap_data[i].genre = 'Kids/Family'
            }
        }

        //console.log(heatmap_data)


        var dimensions = {
            margin: {
                top: 30,
                bottom: 20,
                right: 30,
                left: 60
            },
            width: 300,
            height: 275,
        }
        var svg = d3.select("#heatmap")
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
            .domain(myVars)
            .padding(0.01);
        svg.append("g")
            .call(d3.axisLeft(y));

        var myColor = d3.scaleLinear()
            .range(["white", "#69b3a2"])
            .domain([1, 100])


        var tooltip = d3.select("#heatmaptext")
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
        var click = function(event, d){
            console.log(d)
            //console.log(event)
            var correct_genre = "";
            if(d.genre == "Action"){
                correct_genre = "Action & Adventure"
            }
            else if (d.genre == "Mystery"){
                correct_genre = "Mystery & Suspense"
            }
            else if (d.genre == "Sci/Fi"){
                correct_genre = "Science Fiction & Fantasy"
            }
            else if (d.genre == "Kids/Family"){
                correct_genre = "Kids & Family"
            }
            else{
                correct_genre = d.genre
            }

            var decade = {
                "decade": d.decade
            }
            var genre = {
                "genre": correct_genre
            }
            if(localStorage.getItem("decade") != null){
                console.log("here")
                localStorage.removeItem("decade")
            }
            if(localStorage.getItem("genre") != null){
                localStorage.removeItem("genre")
            }


            
            if(d3.select(this).attr("class") == "unselected"){
                d3.selectAll("rect")
                .attr("class", "unselected")
                .attr("stroke", "none")
                .attr("stroke-width", 1)
                d3.select(this)
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("class", "selected")
                localStorage.removeItem("rating")
                localStorage.setItem("decade", JSON.stringify(decade))
                localStorage.setItem("genre", JSON.stringify(genre))
                scatterplot(d.genre, d.decade)
            }
            else{
                d3.select(this)
                .attr("stroke", "none")
                .attr("stroke-width", 1)
                .attr("class", "unselected")
                localStorage.removeItem("decade")
                localStorage.removeItem("genre")
                localStorage.removeItem("rating")
                scatterplot(d.genre, d.decade)
            }
            


            
        }
        var mouseleave = function (d) {
            tooltip.style("opacity", 0)
        }

        svg.selectAll()
            .data(heatmap_data, function (d) { return d.decade + ':' + d.genre; })
            .enter()
            .append("rect")
            .attr("x", function (d) { return x(d.decade) })
            .attr("y", function (d) { return y(d.genre) })
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function (d) { return myColor(d.score) })
            .attr("class", "unselected")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .on("click", click) 
    }
)