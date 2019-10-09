function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("#scatter").select("svg");

    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // svg params
    var svgHeight = window.innerHeight * 0.9;
    var svgWidth = window.innerWidth * 0.8;

    // Set the X and Y offsets for the state abbreviation text that will appear in the circles


    var margin = {
        top: 40,
        right: 100,
        bottom: 100,
        left: 100
    };


    // Calculate the width and height of the graph
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;


    // Create an SVG wrapper, append an SVG group that will hold the chart, and shift the latter by left and top margins
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Append an SVG group and , set x-axis to the bottom of the chart
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    // Import Data from data.csv
    d3.csv("assets/data/data.csv", function(error, healthInfo) {
        if (error) return console.warn(error);

        // make sure all the appropriate data is numeric
        healthInfo.forEach(function(data) {
            data.healthcare = +data.healthcare;
            data.poverty = +data.poverty;
            data.smokes = +data.smokes;
            data.age = +data.age;
            data.income = +data.income;
            data.obesity = +data.obesity;
        });

        // Create scale functions
        // xLinearScale function above csv import
        var xLinearScale = xScale(healthInfo, chosenXAxis);

        // Create y scale function
        // yLinearScale function above csv import
        var yLinearScale = yScale(healthInfo, chosenYAxis);


        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Append Axes to the chart
        // append x axis
        var xAxis = chartGroup.append("g")
            .classed("chart", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // Append y axis
        //chartGroup.append("g")
        //    .call(leftAxis);

        // Append y axis
        var yAxis = chartGroup.append("g")
            .classed("chart", true)
            .call(leftAxis);


        // Create and append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(healthInfo)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 17)
            .classed("stateCircle", true)
            .attr("stroke-width", "3")
            .attr("opacity", ".8")
            // event listener for mouseover
            .on("mouseover", function() {
                d3.select(this)
                    .transition()
                    .duration(1000);
            })
            // event listener for mouseout
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(1000);
            });


        // Append state Abbrs
        var stateAbbrs = chartGroup.selectAll()
            .data(healthInfo)
            .enter()
            .append("text")
            .classed("stateText", true)
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .text(d => d.abbr)
            .attr("dy", 5)
            .attr("opacity", ".8");


        // Create group for  3 x- axis labels
        var labelsXGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`)
            .classed("aText", true);

        var povertyLabel = labelsXGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("In Poverty (%)");

        var ageLabel = labelsXGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeLabel = labelsXGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Household Income (Median)");

        // Create group for 3 y-axis labels
        var labelsYGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)")
            .attr("dy", "1em")
            .classed("aText", true)

        var obesityLabel = labelsYGroup.append("text")
            .attr("y", 0 - margin.left + 20)
            .attr("x", 0 - (height / 2))
            .attr("value", "obesity") // value to grab for event listener
            .classed("active", true)
            .text("Obesse (%)");

        var smokesLabel = labelsYGroup.append("text")
            .attr("y", 0 - margin.left + 40)
            .attr("x", 0 - (height / 2))
            .attr("value", "smokes") // value to grab for event listener
            .classed("inactive", true)
            .text("Smokes (%)");

        var healthcareLabel = labelsYGroup.append("text")
            .attr("y", 0 - margin.left + 60)
            .attr("x", 0 - (height / 2))
            .attr("value", "healthcare") // value to grab for event listener
            .classed("inactive", true)
            .text("Lacks Healthcare (%)");

        // updateToolTip functions for the circles and the text on the circles
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        var stateAbbrs = updateToolText(chosenXAxis, chosenYAxis, stateAbbrs);

        // x axis labels event listener
        labelsXGroup.selectAll("text")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {

                    // replaces chosenXAxis with value
                    chosenXAxis = value;

                    // updates x scale for new data
                    xLinearScale = xScale(healthInfo, chosenXAxis);

                    // updates x axis with transition
                    xAxis = renderXAxes(xLinearScale, xAxis);

                    // updates circles with new x values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    stateAbbrs = renderText(stateAbbrs, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                    stateAbbrs = updateToolText(chosenXAxis, chosenYAxis, stateAbbrs);

                    // changes classes to change bold text
                    if (chosenXAxis === "poverty") {
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else if (chosenXAxis === "age") {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });


        // y axis labels event listener
        labelsYGroup.selectAll("text")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {

                    // replaces chosenYAxis with value
                    chosenYAxis = value;

                    // updates y scale for new data
                    yLinearScale = yScale(healthInfo, chosenYAxis);

                    // updates y axis with transition
                    yAxis = renderYAxes(yLinearScale, yAxis);

                    // updates circles with new y values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    stateAbbrs = renderText(stateAbbrs, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                    stateAbbrs = updateToolText(chosenXAxis, chosenYAxis, stateAbbrs);

                    // changes classes to change bold text
                    if (chosenYAxis === "obesity") {
                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else if (chosenYAxis === "smokes") {
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else {
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
    });

    // function used for updating x-scale var upon click on axis label
    function xScale(healthInfo, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(healthInfo, d => d[chosenXAxis]) * 0.8,
                d3.max(healthInfo, d => d[chosenXAxis]) * 1
            ])
            .range([0, width]);

        return xLinearScale;

    }


    // function used for updating y-scale var upon click on axis label
    function yScale(healthInfo, chosenYAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(healthInfo, d => d[chosenYAxis]) * 0.8,
                d3.max(healthInfo, d => d[chosenYAxis]) * 1.1
            ])
            .range([height, 0]);

        return yLinearScale;

    }


    // function used for rendering new xAxis upon click on axis label
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
    }


    // function used for rendering new yAxis upon click on axis label
    function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
        yAxis.transition()
            .duration(1000)
            .call(leftAxis);

        return yAxis;
    }


    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]));

        return circlesGroup;
    }


    // function used for updating state abbreviations
    function renderText(stateAbbrs, newXScale, chosenXAxis, newYScale, chosenYAxis) {
        stateAbbrs.transition()
            .duration(1000)
            .attr("x", d => newXScale(d[chosenXAxis]))
            .attr("y", d => newYScale(d[chosenYAxis]));

        return stateAbbrs;
    }


    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

        if (chosenXAxis === "poverty") {
            var xlabel = "Poverty (%) :";
        } else if (chosenXAxis === "age") {
            var xlabel = "Age:";
        } else {
            var xlabel = "Income:";
        }

        if (chosenYAxis === "healthcare") {
            var ylabel = "Lack Healthcare (%) :";
        } else if (chosenYAxis === "smokes") {
            var ylabel = "Smokes (%):";
        } else {
            var ylabel = "Obesse (%):";
        }

        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([80, -70])
            .html(function(d) {
                return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
            });

        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function(data) {
                toolTip.show(data);
            })
            .on("mouseout", function(data, index) {
                toolTip.hide(data);
            });

        return circlesGroup;
    }


    // function used for updating state abbreviation text group with new tooltip
    function updateToolText(chosenXAxis, chosenYAxis, stateAbbrs) {

        if (chosenXAxis === "poverty") {
            var xlabel = "Poverty (%) :";
        } else if (chosenXAxis === "age") {
            var xlabel = "Age:";
        } else {
            var xlabel = "Income: $";
        }

        if (chosenYAxis === "healthcare") {
            var ylabel = "Lack Healthcare (%) :";
        } else if (chosenYAxis === "smokes") {
            var ylabel = "Smokes (%) :";
        } else {
            var ylabel = "Obesse (%):";
        }

        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([70, -80])
            .html(function(d) {
                return (`<strong>${d.state}</strong><br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
            });

        stateAbbrs.call(toolTip);

        stateAbbrs.on("mouseover", function(data) {
                toolTip.show(data);
            })
            // onmouseout event
            .on("mouseout", function(data, index) {
                toolTip.hide(data);
            });

        return stateAbbrs;
    }


};


// Starting point
makeResponsive();


// Event listener for window resize.
// Resize the browser window
d3.select(window).on("resize", makeResponsive);