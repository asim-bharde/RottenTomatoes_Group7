import {dotToBars} from './script-critic-viewer.js'

export function scatterplot() {

    d3.csv("rotten_tomatoes_movies.csv").then(
        function (dataset) {

            //console.log(dataset)

            var bad_rating = "NC17"

            for (let i = 0; i < dataset.length; i++) {
                dataset[i].original_release_date = dataset[i].original_release_date.split('-')[0]
            }
            for (let i = 0; i < dataset.length; i++) {
                dataset[i].original_release_date = Math.floor(dataset[i].original_release_date / 10) * 10
            }
            var filtered_data = dataset.filter(function (d) { return d.original_release_date > 1999 })

            filtered_data = filtered_data.filter(function (d){ return d.content_rating != bad_rating})

            if(localStorage.length > 0){
                if(localStorage.getItem("genre") != null){
                    var genre_filter = JSON.parse(localStorage.getItem("genre"))
                    filtered_data = filtered_data.filter(function(d) { 
                        var genre_list = d.genres.split(",")
                        var new_genre_list = genre_list.map(s => (s.trim()))
                        return new_genre_list.includes(genre_filter['genre'])
                    })
                }

                if(localStorage.getItem("decade") != null){
                    var decade_filter = JSON.parse(localStorage.getItem("decade"))
                    filtered_data = filtered_data.filter(function(d) { return d.original_release_date >= decade_filter['decade'] && d.original_release_date <= decade_filter['decade'] + 5})
                }

                if(localStorage.getItem("rating") != null){
                    var rating_filter = JSON.parse(localStorage.getItem("rating"))
                    filtered_data = filtered_data.filter(function(d) { return d.content_rating == rating_filter['rating']})
                }
                //filtered_data2 = filtered_data.filter(function(d) { return d.genres == genre_filter})
                
                
            }

            d3.selectAll("#scatterplot > *").remove(); 

            var movie_genres = ["Action & Adventure", "Comedy", "Drama", "Horror", "Mystery & Suspense", "Kids & Family", "Science Fiction & Fantasy"]
            var genre_colors = ["orange", "yellow", "pink", "black", "red", "purple", "green", "blue"]
            var color = d3.scaleOrdinal()
                .domain(movie_genres)
                .range(genre_colors);

            function get_genre(d) {
                let genres = d.genres.split(',');
                let this_genre = genres[0];
                return this_genre;
            }


            var dimensions = {
                width: 1000,
                height: 700,
                margin: {
                    top: 10,
                    bottom: 50,
                    right: 10,
                    left: 50
                }
            }

            //console.log(filtered_data)
            var groups = ["G", "PG", "PG-13", "R", "NC-17", "NR"]


            var svg = d3.select("#scatterplot")
                .style("width", dimensions.width)
                .style("height", dimensions.height)

            //console.log(dataset[9].original_release_date.substring(5, 9))

            var xAccessor = d => d.content_rating
            var yAccessor = d => d.tomatometer_rating



            //d3.map(dataset, d=>d.content_rating)
            var xScale = d3.scaleBand()
                .domain(filtered_data.map(xAccessor)) // label by Rating
                .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
                .padding([0.3])
            console.log(xScale.domain())

            var yScale = d3.scaleLinear()
                .domain([0, 100]) // score is normally on a scale of 0-100
                .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top])

            var xAxisGen = d3.axisBottom(xScale)
                .scale(xScale)
            var yAxisGen = d3.axisLeft(yScale)

            var xAxisValue = "Content Rating"

            var xAxis = svg.append('g')
                .attr("class", "x axis")
                .attr("transform", "translate(0, " + (dimensions.height - dimensions.margin.bottom) + ")")
                .call(xAxisGen)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("transform", "rotate(0)")

            svg.append("text")
                .attr("y", dimensions.height - 15)
                .attr("x", dimensions.width / 2)
                .attr("text-anchor", "end")
                .attr("stroke", "black")
                .text(xAxisValue) // CHANGE to by dynamic for x-var type


            svg.append('g')
                .attr("class", "y axis")
                .attr("transform", "translate(" + (dimensions.margin.left) + ",0)")
                .call(yAxisGen)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -(dimensions.height / 2))
                .attr("y", 8)
                .attr("dy", "-5.1em")
                .attr("text-anchor", "end")
                .attr("stroke", "black")
                .text("Rotten Tomatoes Score")



            var x = d => xScale(xAccessor(d)) + xScale.bandwidth() / 2
            var y = d => yScale(yAccessor(d))

            dataset.forEach(function (d) {
                d.x = x(d);
                d.y = y(d);
                d.color = color(get_genre(d));
                d.r = 2;
            })

            var layout = d3.forceSimulation(filtered_data)
                .force('x', d3.forceX(d => x(d)).strength(0.1))
                .force('y', d3.forceY(d => y(d)).strength(0.8))
                .force('collisions', d3.forceCollide(d => d.r).strength(1))
                .on('tick', tick)



            function createNodes() {
                var n = svg.append("g")
                    .selectAll(".dot")
                    .data(filtered_data)
                    .enter()
                    .append("circle")
                    .attr("class", "dot")
                    .attr("id", d => d.movie_title)
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
                    .attr("fill", d => d.color)
                    .on('mouseover', function(d){
                        d3.select(this).attr("stroke", "black")
                        .attr("stroke-width", "2px")
                        .style("cursor", "pointer")
                    })
                    .on('mouseout', function(d){
                        d3.select(this)
                          .attr("stroke-width", "0px")
                    })
                    /////////////////////////////////
                    .on('click', function(d, i){
                        dotToBars()
                    })
                n.transition().duration(500)
                    .attr("r", d => d.r)
                return n
            }

            var nodes = createNodes();

            svg.append("text")
                .attr("x", dimensions.width / 2)
                .attr("y", dimensions.margin.top + 10)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .text("Rotten Tomatoes Score vs. Content Rating");

            function rating_to_int(d) {
                switch (d) {
                    case "G":
                        return 0;
                    case "PG":
                        return 1;
                    case "PG-13":
                        return 2;
                    case "R":
                        return 3;
                    case "NC-17":
                        return 4;
                    case "NR":
                        return 5;
                    default:
                        break;
                }
            }


            function node_arr(val, sub_arr, arr, push_to_arr) {
                if (!push_to_arr) {
                    sub_arr[0] = val;
                    return sub_arr;
                } else {
                    sub_arr[1] = val;
                    arr.push(sub_arr);
                    return arr;
                }
            }

            function tick(e) {
                svg.selectAll(".dot").attr("cx", function (d) { return d.x; })
                    .attr("cy", function (d) { return d.y; });
            }
        })
}