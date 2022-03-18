function plot_pieChart(svg_id, data){
	
	const below_three = parseInt(data.filter(d => d.GPA < 3.00).length);
	const three_to_threePointFive = parseInt(data.filter(d => d.GPA >= 3.0 && d.GPA <= 3.5).length);
	const above_threePointFive = parseInt(data.filter(d => d.GPA > 3.5).length);
		
	console.log(below_three + three_to_threePointFive + above_threePointFive);
		//change
	const cleanData = [
		{ key: "GPA below 3", value: below_three},
		{ key: "GPA between 3 and 3.5", value: three_to_threePointFive},
		{ key: "GPA above 3.5", value: above_threePointFive}
	];
		
	console.log(cleanData);
		
	var color = d3.scaleOrdinal()
            .domain(["GPA below 3", "GPA between 3 and 3.5", "GPA above 3.5" ])
            .range([ "#67b7dc", "#6771dc", "#dc6788"])
		
	var angleData = d3.pie().sort(null).value(d => d.value)(cleanData);
		
	console.log(angleData);
		
	const arcInnerRadius = 00;
	const arcOuterRadius = 200;
		
	var arcGen = d3.arc()
					.innerRadius(arcInnerRadius)
					.outerRadius(arcOuterRadius);
					
	const arcGenHover = d3.arc()
					.innerRadius(arcInnerRadius)
					.outerRadius(arcOuterRadius + 15);
		
	const selections = d3.select(svg_id)
						.append("g")
						.attr("transform", "translate(250, 250)")
						.selectAll("path")
						.data(angleData) 
		
	const enterSelection = selections.enter()
		.append("path");
		
	enterSelection.append("svg:title")
		.text(function(d){return d.data.value;});
		
	enterSelection.merge(selections)
		.on("mouseover", onMouseOver)
		.on("mouseout", onMouseOut)
		.attr("d", arcGen)
		.attr("fill", d => color(d.data.key))
		.attr("class", "pie");
		
		
	function onMouseOver(d, i) {
		d3.select(this)
			.attr("stroke", "gray")
			.transition()
			.duration(200)
			.attr("d", arcGenHover)
			.attr("stroke-width", 1);
	}
		
	function onMouseOut(d, i) {
		d3.select(this)
			.transition()
			.duration(200)
			.attr("d", arcGen)
			.attr("stroke", "none");
	}
		
	var legends = d3.select(svg_id).append("g")
						.attr("transform", "translate(500, 300)")
						.selectAll(".legends").data(angleData);
						
	var legend = legends.enter().append("g")
		.classed("legends", " ")
		.attr("transform", function(d,i){ return "translate(0, "+ (i+1)*30 +")"; });
		
	legend.append("rect")
		.attr("width", 20)
		.attr("height", 20)
		.attr("fill", d => color(d.data.key))
		
	legend.append("text")
		.classed("label", true)
		.text(d => d.data.key)
		.attr("fill", d => color(d.data.key))
		.attr("x", 30)
		.attr("y", 15);
}



function plot_histogram(svg_id, data, col_name){
	const yAxisText = "Count";
	const formattedTextPrefix = yAxisText + " ";
	
	const margin = {top: 30, bottom: 60, left: 30, right: 30};
	const viewPortWidth = $(svg_id).width() 
	const viewPortHeight = $(svg_id).height()
		
	const width = viewPortWidth - (margin.left + margin.right);
	const height = viewPortHeight - (margin.top + margin.bottom);

	const canvas = d3.select(svg_id);
		
	canvas.selectAll("g").remove();
	
	const formatted_data = d3.map(data, function(d){
		return d[col_name];
	});
	
	const xMin = 0;
	const xMax = d3.max(formatted_data);
	
	const xScale = d3.scaleLinear()
	                 .domain([xMin, xMax])
					 .range([margin.left, width + margin.left]);
					 
	const histogram = d3.histogram()
                .value(d => d)   
                .domain(xScale.domain()) 
                .thresholds(xScale.ticks(70));	

	const bins = histogram(formatted_data);

    console.log(bins);
	
	const yMin =  0;
	const yMax = d3.max(d3.map(bins, d => d.length));
	
	const yScale = d3.scaleLinear()
	                 .domain([yMin, yMax])
					 .range([height + margin.top, margin.top])
					 .nice();
					 
					 
	const plotSelections = canvas.append("g")
							.selectAll("rect")
							.data(bins);

	plotSelections.exit().remove();

	const enterSelection = plotSelections.enter().append("rect");
		
	enterSelection.append("svg:title")
		.text(function(d){return formattedTextPrefix + d.length;});
				
	enterSelection.merge(plotSelections)
		.attr("class", "bar_rectangle")
		.on("mouseover", onMouseOver)
		.on("mouseout", onMouseOut)
		.attr("x", d => xScale(d.x0))
		.attr("y", d => yScale(d.length))
		.attr("width", d => xScale(d.x1) - xScale(d.x0))
		.transition()
		.ease(d3.easeExp)
		.delay(function(d, i){ return i * 20; })
		.duration(500)
		.attr("height", d => yScale(yMin) - yScale(d.length));

	const xAxis = d3.axisBottom()
		.scale(xScale);
		
	const yAxis = d3.axisLeft().scale(yScale);

	canvas.append("g")
			.attr("transform", "translate(0, "+ (height + margin.top) +")")
			.transition()
			.duration(1000)
			.call(xAxis)
			.attr("font-size", "12px");
	
	canvas.append("g")
	.append("text")
    .attr("text-anchor", "end")
	.attr("x", width + margin.left - 20)
    .attr("y", height + margin.top + 35)
    .text(col_name)
	.style('fill', 'black')
	.style("font-size", "12px")
	.style("font-family", "sans-serif")
	.style("text-anchor", "end");

	canvas.append("g")
	.attr("transform", "translate("+ margin.left +", 0)")
			.transition()
			.duration(1000)
			.call(yAxis);
			
	canvas.append("g")
	.append("text")
    .attr("text-anchor", "end")
	.attr("transform", "rotate(-90)")
	.attr("x", margin.top - 50)
    .attr("y", margin.left + 20)
    .text(yAxisText)
	.style('fill', 'black')
	.style("font-size", "12px")
	.style("font-family", "sans-serif")
	.style("text-anchor", "end");
			
	function onMouseOver(d, i) {
		const widthIncrease = 4;
		const heightIncrease = 20;
			
		d3.select(this)
			.attr("class", "bar_rectangle_highlight");
			
		d3.select(this)
			.transition()
			.duration(500)
			.attr("x", d => xScale(d.x0) - (widthIncrease / 2))
			.attr("y", d => yScale(d.length) - heightIncrease)
			.attr("width", d => xScale(d.x1) - xScale(d.x0) + widthIncrease)
			.attr("height", d => yScale(yMin) - yScale(d.length) + heightIncrease);
	}
		
	function onMouseOut(d, i) {
		d3.select(this).attr("class", "bar_rectangle");
			
		d3.select(this)
			.transition()
			.duration(500)
			.attr("x", d => xScale(d.x0))
			.attr("y", d => yScale(d.length))
			.attr("width", d => xScale(d.x1) - xScale(d.x0))
			.attr("height", d => yScale(yMin) - yScale(d.length));
	}
}