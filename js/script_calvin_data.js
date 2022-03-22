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
	.text(function(d){return "No. of Students: " + d.data.value;});
	
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

function plot_scatter(svg_id, data, col1_name, col2_name) {
	const margin = {top: 60, bottom: 60, left: 60, right: 60};
	const viewPortWidth = $(svg_id).width() 
	const viewPortHeight = $(svg_id).height()
	
	const width = viewPortWidth - (margin.left + margin.right);
	const height = viewPortHeight - (margin.top + margin.bottom);
	
	const canvas = d3.select(svg_id);
	
	canvas.selectAll("g").remove();
	
	const xMin = 0;
	const _xMax = d3.max(data, d => d[col1_name])
	const xMax = _xMax;
	
	const xScale = d3.scaleLinear()
	.domain([xMin, xMax])
	.range([margin.left, width + margin.left]);
	
	const color = d3.scaleOrdinal()
	.domain([xMin, xMax])
	.range(d3.schemeDark2);
	
	const yMin = 0;
	const _yMax = d3.max(data, d => d[col2_name]);
	const yMax = _yMax;
	
	const yScale = d3.scaleLinear()
	.domain([yMin, yMax])
	.range([margin.top + height, margin.top]);
	
	const radius = 5;
	
	const selections = canvas.append("g")
	.selectAll("circle")
	.data(data);
	
	selections.exit().remove();
	
	const enterSelection = selections.enter().append("circle");
	
	enterSelection.append("svg:title")
	.text(d => col1_name + ": " + d[col1_name] + "\n" + col2_name + ": " + d[col2_name]);
	
	enterSelection.merge(selections)
	.on("mouseover", onMouseOver)
	.on("mouseout", onMouseOut)
	.attr("cx", viewPortWidth / 2)
	.attr("cy", viewPortHeight / 2)
	.transition()
	.ease(d3.easeLinear)
	.delay((d, i) => i * 2)
	.duration(100)
	.attr("cx", (d, i) => xScale(d[col1_name]))
	.attr("cy", d => yScale(d[col2_name]))
	.attr("r", radius)
	.attr("fill", d => color(d[col1_name]))
	.attr("stroke", "#f8dfc1")
	.attr("stroke-width", "1px");
	
	function onMouseOver(d, i) {
		d3.select(this)
		.attr("stroke-width", "5px")
		.attr("r", radius * 2);
	}
	
	function onMouseOut(d, i) {
		d3.select(this)
		.attr("stroke-width", "1px")
		.attr("r", radius);
	}
	
	const xAxis = d3.axisBottom().scale(xScale);
	const yAxis = d3.axisLeft().scale(yScale);
	
	canvas.append("g")
	.attr("transform", `translate(0, ${height + margin.top + 10})`)
	.transition()
	.duration(1000)
	.call(xAxis);
	
	canvas.append("g")
	.append("text")
    .attr("text-anchor", "end")
	.attr("x", width + margin.left - 20)
    .attr("y", height + margin.top + 40)
    .text(col1_name)
	.style('fill', 'black')
	.style("font-size", "12px")
	.style("font-family", "sans-serif")
	.style("text-anchor", "end");
	
	canvas.append("g")
	.attr("transform", `translate(${margin.left - 10}, 0)`)
	.transition()
	.duration(1000)
	.call(yAxis);
	
	canvas.append("g")
	.append("text")
    .attr("text-anchor", "end")
	.attr("transform", "rotate(-90)")
	.attr("x", margin.top - 100)
    .attr("y", margin.left + 20)
    .text(col2_name)
	.style('fill', 'black')
	.style("font-size", "12px")
	.style("font-family", "sans-serif")
	.style("text-anchor", "end");
}

function plot_groupedBarChart(svg_id, data){
	const yAxisText = "Count";
	
	const satmData = d3.map(data,  v => v.SATM);
	const satmAverage = d3.sum(satmData) / satmData.length;
	
	const satvData = d3.map(data,  v => v.SATV);
	const satvAverage = d3.sum(satvData) / satvData.length;
	
	const actData = d3.map(data,  v => v.ACT);
	const actAverage = d3.sum(actData) / actData.length;
	
	const gpaData = d3.map(data,  v => v.GPA);
	const gpaAverage = d3.sum(gpaData) / gpaData.length;
	
	const aboveAverageData = {
		SATM: satmData.filter(v => v > satmAverage).length,
		SATV: satvData.filter(v => v > satvAverage).length,
		ACT: actData.filter(v => v > actAverage).length,
		GPA: gpaData.filter(v => v > gpaAverage).length,
		type: "Above Average"
	};
	
	const belowAverageData = {
		SATM: satmData.filter(v => v < satmAverage).length,
		SATV: satvData.filter(v => v < satvAverage).length,
		ACT: actData.filter(v => v < actAverage).length,
		GPA: gpaData.filter(v => v < gpaAverage).length,
		type: "Below Average"
	};
	
	const formattedData = [belowAverageData, aboveAverageData];
	
	const groups = formattedData.map(d => d.type);
	
	const subGroups = d3.keys(formattedData[0]);
	subGroups.pop();
	
	const margin = {top: 30, bottom: 60, left: 30, right: 30};
	const viewPortWidth = $(svg_id).width() 
	const viewPortHeight = $(svg_id).height()
	
	const width = viewPortWidth - (margin.left + margin.right);
	const height = viewPortHeight - (margin.top + margin.bottom);
	
	const canvas = d3.select(svg_id)
	.append("svg")
	.attr("x", 0)
	.attr("y", 0)
	.attr("width", viewPortWidth)
	.attr("height", viewPortHeight);
	
	const xBandScale = d3.scaleBand()
	.domain(groups)
	.range([margin.left, width + margin.left])
	.padding(0.6);
	
	const xScale = d3.scaleBand()
	.domain(subGroups)
	.range([0, xBandScale.bandwidth()])
	.padding(0.05);
	
	var color = d3.scaleOrdinal()
	.domain(subGroups)
	.range(['#98a65d','#6771dc','#ea7f68','#de425b']);
	
	const yMin = 0;
	const yMax = Math.max(d3.max(d3.map(formattedData, d => d.SATM)), 
		d3.max(d3.map(formattedData, d => d.SATV)), 
		d3.max(d3.map(formattedData, d => d.ACT)), 
		d3.max(d3.map(formattedData, d => d.GPA))) + 10;
	
	//console.log(yMax);
	
	const yScale = d3.scaleLinear()
	.domain([yMin, yMax])
	.range([height + margin.top, margin.top])
	.nice();
	
	canvas.append("g")
	.selectAll("g")
	.data(formattedData)
	.join("g")
	.attr("transform", function(d){
		//console.log(xBandScale(d.type));  
		return "translate("+ xBandScale(d.type) +", 0)";
	})
	.selectAll("rect")
	.data(function(d){
		return subGroups.map(function(key){
			return {
				key: key,
				value: d[key]
			};
		});
	})
	.join("rect")
	.attr("class", "group_bar_rectangle")
	.on("mouseover", onMouseOver)
	.on("mouseout", onMouseOut)
	.attr("x", d => xScale(d.key))
	.attr("y", d => yScale(d.value))
	.attr("width", xScale.bandwidth())
	.attr("height", d => yScale(yMin) - yScale(d.value))
	.attr("fill", d => color(d.key))
	.append("svg:title")
	.text(d => "Count: " + d.value);
	
	function onMouseOver(d, i) {
		const heightIncrease = 20;
		const widthIncrease = 4;
		
		d3.selectAll(".group_bar_rectangle")
		.attr("class", "group_bar_rectangle_non_highlight");
		
		d3.select(this)
		.attr("class", "group_bar_rectangle")
		.transition()
		.duration(500)
		.attr("x", d => xScale(d.key) - (widthIncrease / 2))
		.attr("y", d => yScale(d.value) - heightIncrease)
		.attr("width", xScale.bandwidth() + widthIncrease)
		.attr("height", d => yScale(yMin) - yScale(d.value) + heightIncrease);
	}
	
	function onMouseOut(d, i) {
		d3.selectAll(".group_bar_rectangle_non_highlight")
		.attr("class", "group_bar_rectangle");
		
		d3.select(this)
		.transition()
		.duration(500)
		.attr("x", d => xScale(d.key))
		.attr("y", d => yScale(d.value))
		.attr("width", xScale.bandwidth())
		.attr("height", d => yScale(yMin) - yScale(d.value));
	}
	
	const xAxis = d3.axisBottom()
	.scale(xBandScale);
	
	const yAxis = d3.axisLeft().scale(yScale);
	
	canvas.append("g")
	.attr("transform", "translate(0, "+ (height + margin.top) +")")
	.call(xAxis)
	.attr("font-size", "12px");
	
	canvas.append("g")
	.attr("transform", "translate("+ margin.left +", 0)")
	.call(yAxis)
	.attr("font-size", "12px")
	.append("text")
	.text(yAxisText)
	.attr("transform", "rotate(-90)")
	.attr("dx", -25)
	.attr("dy", 20)
	.style('fill', 'black')
	.style("font-size", "12px")
	.style("font-family", "sans-serif")
	.style("text-anchor", "end");
	
	// Legend
	const groupOriginX = 850
	const groupOriginY = 29
	
	const group = canvas.append("g")
	.attr("class","legend-group");
	
	const legend = group.selectAll(".legend")
	.data(color.domain().slice().reverse())
	.enter().append("g")
	.attr("class","legend")
	.attr("transform",function(d,i) { 
		return "translate(0," + i * 20 + ")"; 
	});
	
	legend.append("rect")
	.attr("x",groupOriginX - 12)
	.attr("y",groupOriginY + 6)
	.attr("width",18)
	.attr("height",18)
	.style("fill", color);
	
	legend.append("text")
	.attr("x",groupOriginX - 28)
	.attr("y",groupOriginY + 14)
	.attr("dy",".35em")
	.style("text-anchor","end")
	.text(function(d) {
		const string = d.replace('_',' '); 
		return string.charAt(0).toUpperCase() + string.slice(1);
	});
}