export function dotToBars() {
    d3.csv("rotten_tomatoes_movies.csv").then(
        function (dataset) {

            // Shuffle array
            const shuffled = dataset.sort(() => 0.5 - Math.random());

            // Get sub-array of first n elements after shuffled
            let random_dataset = shuffled.slice(0, 1);

            var simple_data = []

            var b


            if(localStorage.getItem("title") != null){
                simple_data.pop();
                console.log(localStorage.getItem("title"))
                console.log(localStorage.getItem("audience"))
                console.log(localStorage.getItem("critic"))
                // var this_movie = dataset.filter(function(d){
                //     d.movie_title == localStorage.getItem("title")[0]
                // })
                // console.log(this_movie)
                var title = JSON.parse(localStorage.getItem("title"))
                var audience = JSON.parse(localStorage.getItem("audience"))
                var critic = JSON.parse(localStorage.getItem("critic"))
                b = {
                    'movie_title': title['title'],
                    'tomatometer_rating': critic['critic'],
                    'audience_rating': audience['audience']
                }
                console.log(b)
                simple_data.push(b)
            }else{
                b = {
                    'movie_title': random_dataset[0].movie_title,
                    'tomatometer_rating': parseInt(random_dataset[0].tomatometer_rating),
                    'audience_rating': parseInt(random_dataset[0].audience_rating)
                }
                console.log(b)
                simple_data.push(b)
            }
            //console.log(random_dataset)
            console.log(simple_data)

            var dimensions = {
                width: 400,
                height: 300,
                margin: {
                    top: 10,
                    bottom: 75,
                    right: 10,
                    left: 50
                }
            }

            d3.selectAll("#bars > *").remove();

            var svg = d3.select("#bars")
                .append("svg")
                .attr("width", dimensions.width + dimensions.margin.left + dimensions.margin.right)
                .attr("height", dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + dimensions.margin.left + "," + dimensions.margin.top + ")");

            // List of subgroups = header of the csv files = soil condition here

            var subgroups = Object.keys(simple_data[0]).slice(1)
            //console.log(subgroups)

            // List of groups = species here = value of the first column called group -> I show them on the X axis
            var groups = d3.map(simple_data, function (d) { return (d.movie_title) })
            //console.log(groups)

            // Add X axis
            var x = d3.scaleBand()
                .domain(groups)
                .range([0, dimensions.width])
                .padding([0.2])
            svg.append("g")
                .attr("transform", "translate(0," + dimensions.height + ")")
                .call(d3.axisBottom(x).tickSize(0))
                .selectAll("text")
                .style("text-anchor", "center")
                .style("font", "18px times")

            // Add Y axis
            var y = d3.scaleLinear()
                .domain([0, 100])
                .range([dimensions.height, 0]);
            svg.append("g")
                .call(d3.axisLeft(y));

            // Another scale for subgroup position?
            var xSubgroup = d3.scaleBand()
                .domain(subgroups)
                .range([0, x.bandwidth()])
                .padding([0.05])

            // color palette = one color per subgroup
            var color = d3.scaleOrdinal()
                .domain(subgroups)
                .range(['#e41a1c', '#377eb8'])

            svg.append("g")
                .selectAll("g")
                // Enter in data = loop group per group
                .data(simple_data)
                .enter()
                .append("g")
                .attr("transform", function (d) { return "translate(" + x(d.movie_title) + ",0)"; })
                .selectAll("rect")
                .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })
                .enter().append("rect")
                .attr("x", function (d) { return xSubgroup(d.key); })
                .attr("y", function (d) { return y(d.value); })
                .attr("width", xSubgroup.bandwidth())
                .attr("height", function (d) { return dimensions.height - y(d.value); })
                .attr("fill", function (d) { return color(d.key); });

            svg.append("text")
                .attr("x", dimensions.width - 80)
                .attr("y", dimensions.margin.top)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .text("Red: Critic Score")
            svg.append("text")
                .attr("x", dimensions.width - 80)
                .attr("y", dimensions.margin.top + 15)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .text("Blue: Audience Score")


        }
    )
}