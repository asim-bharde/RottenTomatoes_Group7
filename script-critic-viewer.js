d3.csv("rotten_tomatoes_movies.csv").then(
    function (dataset) {

        // Shuffle array
        const shuffled = dataset.sort(() => 0.5 - Math.random());

        // Get sub-array of first n elements after shuffled
        let random_dataset = shuffled.slice(0, 5);

        var simple_data = []

        for (var i = 0; i < random_dataset.length; i++) {
            b = {
                'movie_title': random_dataset[i].movie_title,
                'tomatometer_rating': parseInt(random_dataset[i].tomatometer_rating),
                'audience_rating': parseInt(random_dataset[i].audience_rating)
            }
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

        var svg = d3.select("#bars")
            .append("svg")
            .attr("width", dimensions.width + dimensions.margin.left + dimensions.margin.right)
            .attr("height", dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + dimensions.margin.left + "," + dimensions.margin.top + ")");

        // List of subgroups = header of the csv files = soil condition here

        var subgroups = Object.keys(simple_data[0]).slice(1)
        console.log(subgroups)

        // List of groups = species here = value of the first column called group -> I show them on the X axis
        var groups = d3.map(simple_data, function (d) { return (d.movie_title) })
        console.log(groups)

        // Add X axis
        var x = d3.scaleBand()
            .domain(groups)
            .range([0, dimensions.width])
            .padding([0.2])
        svg.append("g")
            .attr("transform", "translate(0," + dimensions.height + ")")
            .call(d3.axisBottom(x).tickSize(0))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-45)");

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


    }
)