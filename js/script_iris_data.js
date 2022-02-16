function plot_scatterplot(svg_id, data){
	var margin = {top: 30, right: 30, bottom: 30, left: 30},
		width = $(svg_id).width() - margin.left - margin.right,
		height = $(svg_id).height() - margin.top - margin.bottom;
		
	var canvas = d3.select(svg_id)
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate("+ margin.left +", "+ margin.top +")");
	
	data.then(data =>{
		var xScale = d3.scaleLinear()
		.domain([4, 8])
		.range([0, width]).nice();
		
		var yScale = d3.scaleLinear()
		.domain([0, 9])
		.range([height, 0]).nice();
		
		var color = d3.scaleOrdinal()
            .domain(["Iris-setosa", "Iris-versicolor", "Iris-virginica" ])
            .range(['#98a65d','royalBlue','#de425b'])
		
		var scatter = canvas.selectAll("circle").data(data);
	
		var enter = scatter.enter().append("circle")
		.attr("r", 5);
	
		enter.merge(scatter)
		.attr("cx", function(d) {return xScale(d.sepal_length); })
		.attr("cy", function(d) {return yScale(d.petal_length); })
		.attr("fill", function(d) {return color(d.class)});
		
		var xAxis = d3.axisBottom().scale(xScale).tickFormat(function(d){
			return d3.format(".1f")(d)
		});
		var yAxis = d3.axisLeft().scale(yScale);
		
		var xAxisGroup = canvas.append("g")
		.attr("class", "xAxis")
		.attr("transform", "translate(0, "+ height +")")
		.call(xAxis);
		
		xAxisGroup.append("text")
		.text("Sepal length")
		.attr("dx", width)
		.attr("dy", -15)
		.style('fill', 'black')
		.style("font-size", "12px")
		.style("font-family", "sans-serif")
		.style("text-anchor", "end");
		
		var yAxisGroup = canvas.append("g")
		.attr("class", "yAxis")
		.call(yAxis);
		
		yAxisGroup.append("text")
		.text("Petal length")
		.attr("transform", "rotate(-90)")
		.attr("dx", -10)
		.attr("dy", 20)
		.style('fill', 'black')
		.style("font-size", "12px")
		.style("font-family", "sans-serif")
		.style("text-anchor", "end");
		
		// Color Legend
		const groupOriginX = 800
		const groupOriginY = 10
		
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
		.text(function(d) { return d; });
	})
}

function plot_pieChart(svg_id, data){
	data.then(data => {
		var color = d3.scaleOrdinal()
            .domain(["Iris-setosa_below_avg", "Iris-versicolor_below_avg", 
			"Iris-virginica_below_avg", "Iris-setosa_above_avg", "Iris-versicolor_above_avg", "Iris-virginica_above_avg"])
            .range([ "#003f5c", "#ff6e54", "#ffa600", "#dd5182", "#444e86", "#955196"])
		
		const formattedData = d3.group(data, d => d.class);
		var cleanData = d3.map(formattedData, function(d){
			const sepal_lengths = d3.map(d[1], d => parseFloat(d.sepal_length));
			const sepal_length_avg = d3.sum(sepal_lengths) / sepal_lengths.length;
			
			return {
				key: d[0] + "_below_avg",
				value: sepal_lengths.filter(d => d < sepal_length_avg).length
			};
		});
		
		cleanData = cleanData.concat(d3.map(formattedData, function(d){
			const sepal_lengths = d3.map(d[1], d => parseFloat(d.sepal_length));
			const sepal_length_avg = d3.sum(sepal_lengths) / sepal_lengths.length;
			
			return {
				key: d[0] + "_above_avg",
				value: sepal_lengths.filter(d => d > sepal_length_avg).length
			};
		}));
		
		cleanData.filter(d => d.key !== "");
		
		console.log(cleanData);
		
		var angleData = d3.pie().sort(null).value(d => d.value)(cleanData);
		
		console.log(angleData);
		
		var arcGen = d3.arc()
					.innerRadius(0)
					.outerRadius(200);
		
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
		.attr("d", arcGen)
		.attr("fill", d => color(d.data.key))
		.attr("class", "pie");
		
		var legends = d3.select(svg_id).append("g")
						.attr("transform", "translate(500, 200)")
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
		.text(function(d){
			const string = d.data.key.replaceAll('_',' '); 
			return string.charAt(0).toUpperCase() + string.slice(1);
		})
		.attr("fill", d => color(d.data.key))
		.attr("x", 30)
		.attr("y", 15);
	})
}

function plot_barChart(svg_id, data){
	data.then(data => {
		const yAxisText = "Sepal Length Average";
		const formattedGroup = d3.group(data, d => d.class);
		const formattedData = d3.map(formattedGroup, function(entry){
			const sepal_lengths = d3.map(entry[1], v => parseFloat(v.sepal_length));
			
			return {
				className: entry[0],
				length_avg: d3.format(".2f")(d3.sum(sepal_lengths) / sepal_lengths.length)
			};
		}).filter(d => d.className !== "").sort((a, b) => d3.ascending(a.length_avg, b.length_avg));
		
		console.log(formattedData);
		
		const lengthData = d3.map(formattedData, d => d.length_avg);
		
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

		const xScale = d3.scaleBand()
			.domain(formattedData.map(d => d.className))
			.range([margin.left, width + margin.left])
			.padding(0.5);

		const yMin = 0;
		const yMax = d3.max(lengthData) + 10;
		
		const yScale = d3.scaleLinear()
			.domain([yMin, yMax])
			.range([height + margin.top, margin.top])
			.nice();
	
		const plotSelections = canvas.append("g")
							.attr("fill", "#003f5c")
							.selectAll("rect")
							.data(formattedData);

		plotSelections.exit().remove();

		const enterSelection = plotSelections.enter().append("rect");
		
		enterSelection.append("svg:title")
		.text(function(d){return d.length_avg;});
				
		enterSelection.merge(plotSelections)
		.attr("x", (d, i) => xScale(d.className))
		.attr("y", d => yScale(d.length_avg))
		.attr("width", xScale.bandwidth())
		.attr("height", d => yScale(yMin) - yScale(d.length_avg))
		.attr("class", "barRectangle");

		const xAxis = d3.axisBottom().scale(xScale);
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
	})
}

function plot_groupedBarChart(svg_id, data){
	data.then(data => {
		const yAxisText = "Length Average";
		
		const formattedGroup = d3.group(data, d => d.class);
		const formattedData = d3.map(formattedGroup, function(entry){
			const sepal_lengths = d3.map(entry[1], v => parseFloat(v.sepal_length));
			const sepal_widths = d3.map(entry[1], v => parseFloat(v.sepal_width));
			const petal_lengths = d3.map(entry[1], v => parseFloat(v.petal_length));
			const petal_widths = d3.map(entry[1], v => parseFloat(v.petal_width));
			
			return {
				sepal_length_avg: d3.format(".2f")(d3.sum(sepal_lengths) / sepal_lengths.length),
				sepal_width_avg: d3.format(".2f")(d3.sum(sepal_widths) / sepal_widths.length),
				petal_length_avg: d3.format(".2f")(d3.sum(petal_lengths) / petal_lengths.length),
				petal_width_avg: d3.format(".2f")(d3.sum(petal_widths) / petal_widths.length),
				class: entry[0]
			};
		}).filter(d => d.class !== "");
		
		console.log(formattedData);
		
		const sp_length_avg = d3.map(formattedData, d => d.sepal_length_avg);
		const sp_width_avg = d3.map(formattedData, d => d.sepal_width_avg);
		const p_length_avg = d3.map(formattedData, d => d.petal_length_avg);
		const p_width_avg = d3.map(formattedData, d => d.petal_width_avg);
		
		const subGroups = d3.keys(formattedData[0])
		subGroups.pop();
		//console.log(subGroups);
		
		const groups = d3.map(d3.group(formattedData, d => d.class), d => d[0]).filter(d => d !==  "");
		//console.log(groups);
		
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
		.padding(0.2);
		
		const xScale = d3.scaleBand()
		.domain(subGroups)
		.range([0, xBandScale.bandwidth()])
		.padding(0.05);
		
		var color = d3.scaleOrdinal()
		.domain(subGroups)
		.range(['#98a65d','#f8dfc1','#ea7f68','#de425b']);
		
		const yMin = 0;
		const yMax = Math.max(d3.max(sp_length_avg), d3.max(sp_width_avg), d3.max(p_length_avg), d3.max(p_width_avg)) + 1;
		
		const yScale = d3.scaleLinear()
		.domain([yMin, yMax])
		.range([height + margin.top, margin.top])
		.nice();
		
		canvas.append("g")
		.selectAll("g")
		.data(formattedData)
		.join("g")
		.attr("transform", function(d){
			console.log(xBandScale(d.class));  
			return "translate("+ xBandScale(d.class) +", 0)";
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
		.attr("x", d => xScale(d.key))
		.attr("y", d => yScale(d.value))
		.attr("width", xScale.bandwidth())
		.attr("height", d => yScale(yMin) - yScale(d.value))
		.attr("fill", d => color(d.key))
		.append("svg:title")
		.text(d => d.value);
		
		const xAxis = d3.axisBottom().scale(xBandScale);
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
		const groupOriginY = 15
		
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
			const string = d.replaceAll('_',' '); 
			return string.charAt(0).toUpperCase() + string.slice(1);
		});
	})
}