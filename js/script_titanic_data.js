function plot_scatterplot(svg_id, data){
	data.then(data => {
		const baseAge = 30;
		const formattedData = data.filter(d => d.age >= baseAge && d.embarked !== "");
		
		const margin = {top: 60, bottom: 60, left: 60, right: 30};
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
		
		const xScale = d3.scaleLinear()
		.domain([0, formattedData.length - 1])
		.range([margin.left, width + margin.left]);
		
		const yMin = baseAge;
		const yMax = d3.max(formattedData.map(d => d.age));
		
		const yScale = d3.scaleLinear()
		.domain([yMin, yMax])
		.range([margin.top + height, margin.top])
		.nice();
		
		const embarkData = d3.map(formattedData, d => d.embarked);
		const color = d3.scaleOrdinal()
					.domain(embarkData)
					.range(["#003f5c", "#bc5090", "#ffa600"]);
					
		const fareMin = 0;
		const fareMax = d3.max(formattedData, d => d.fare);
		
		const radiusMin = 5;
		const radiusMax = 15;
		
		const radius = d3.scaleLinear()
		.domain([fareMin, fareMax])
		.range([radiusMin, radiusMax])

		const survivalDomain = d3.map(d3.group(formattedData, d => d.survived), d => d[0]);
		
		const survival = d3.scaleOrdinal()
		.domain(survivalDomain)
		.range(["#e31a1c", "#1f78b4"]);
		
		const selections = canvas.selectAll("circle")
						.data(formattedData);
						
		selections.exit().remove();
		
		const enterSelection = selections.enter().append("circle")
		.attr("r", radiusMin)
		.attr("stroke-width","0px")
		.on("mouseover", function(d){
			d3.select(this)
			.attr("stroke-width", "5px")
			.attr("r", radius(d.fare));
		})
		.on("mouseout", function(){
			d3.select(this)
			.attr("stroke-width","0px")
			.attr("r", radiusMin);
		});
		
		enterSelection.append("svg:title")
		.text(function(d){return d.name;});
		
		enterSelection.merge(selections)
		.attr("cx", (d, i) => xScale(i))
		.attr("cy", d => yScale(d.age))
		.attr("fill", d => survival(d.survived))
		.attr("stroke", d => color(d.embarked));
		
		const xAxis = d3.axisBottom().scale(xScale).ticks(0);
		const yAxis = d3.axisLeft().scale(yScale);
		
		canvas.append("g")
		.attr("transform", `translate(0, ${height + margin.top + 10})`)
		.call(xAxis)
		.attr("font-size", "12px")
		.append("text")
		.text("Passengers")
		.attr("dx", margin.left + width)
		.attr("dy", 20)
		.style('fill', 'black')
		.style("font-size", "12px")
		.style("font-family", "sans-serif")
		.style("text-anchor", "end");
		
		canvas.append("g")
		.attr("transform", `translate(${margin.left - 10}, 0)`)
		.call(yAxis)
		.attr("font-size", "12px")
		.append("text")
		.text("Passenger's Age")
		.attr("transform", "rotate(-90)")
		.attr("dx", -25)
		.attr("dy", -30)
		.style('fill', 'black')
		.style("font-size", "12px")
		.style("text-anchor", "end");
		
		// Passenger Suvived Legend
		const psLegendGroup = canvas.append("g")
		.attr("class","legend-group");

		psLegendGroup.append("text")
		.text("Passenger survived?")
		.attr("x",493)
		.attr("y",39)
		.style("font-weight","bold")
		.style("text-anchor","end");

		const psLegend = psLegendGroup.selectAll(".legend")
		.data(survival.domain().slice().reverse())
		.enter().append("g")
		.attr("class","legend")
		.attr("transform",function(d,i) { 
			return "translate(0," + i * 20 + ")"; 
		});

		psLegend.append("rect")
		.attr("x",475)
		.attr("y",45)
		.attr("width",18)
		.attr("height",18)
		.style("fill", survival);

		psLegend.append("text")
		.attr("x",465)
		.attr("y",53)
		.attr("dy",".35em")
		.style("text-anchor","end")
		.text(function(d) { return d; });
		
		// Embarked Legend
		const groupOriginX = 593
		const groupOriginY = 39
		
		const group = canvas.append("g")
		.attr("class","legend-group");

		group.append("text")
		.text("Embarked")
		.attr("x",groupOriginX)
		.attr("y",groupOriginY)
		.style("font-weight","bold")
		.style("text-anchor","end");

		const legend = group.selectAll(".legend")
		.data(color.domain().slice().reverse())
		.enter().append("g")
		.attr("class","legend")
		.attr("transform",function(d,i) { 
			return "translate(0," + i * 20 + ")"; 
		});

		legend.append("rect")
		.attr("x",groupOriginX - 12)
		.attr("y",45)
		.attr("width",18)
		.attr("height",18)
		.style("fill", color);

		legend.append("text")
		.attr("x",groupOriginX - 28)
		.attr("y",53)
		.attr("dy",".35em")
		.style("text-anchor","end")
		.text(function(d) { return d; });
	})
}

function plot_pieChart(svg_id, data){
	data.then(data => {
		const below_thirty = parseInt(data.filter(d => d.age < 30).length);
		const thirty_to_sixty = parseInt(data.filter(d => d.age >= 30 && d.age <= 60).length);
		const above_sixty = parseInt(data.filter(d => d.age > 60).length);
		
		console.log(below_thirty + thirty_to_sixty + above_sixty);
		
		const cleanData = [
			{ key: "Below Thirty", value: below_thirty},
			{ key: "Thirty to Sixty", value: thirty_to_sixty},
			{ key: "Above Sixty", value: above_sixty}
		];
		
		console.log(cleanData);
		
		var color = d3.scaleOrdinal()
            .domain(["Below Thirty", "Thirty to Sixty", "Above Sixty" ])
            .range([ "#003f5c", "#bc5090", "#ffa600"])
		
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
	})
}

function plot_barChart(svg_id, data){
	data.then(data => {
		const yAxisText = "Count";
		
		//console.log(data);
		const formattedGroup = d3.group(data, d => d.passenger_class);
		//console.log(formattedGroup);
		
		const formattedData = d3.map(formattedGroup, function(entry){
			//console.log(d3.map(entry[1], v => v.survived ));
			return {
				passenger_class: entry[0],
				survived_count: parseInt(d3.map(entry[1],  v => v.survived).filter(v => v == "Yes").length)
			};
		}).filter(d => d.passenger_class !== "");
		//map function returns an array where every element is some modified form of the same element in the data array.
		console.log(formattedData);
		
		const survivedCountData = d3.map(formattedData, d => d.survived_count);
		
		const margin = {top: 30, bottom: 60, left: 30, right: 30};
		const viewPortWidth = $(svg_id).width() 
		const viewPortHeight = $(svg_id).height()
		
		const width = viewPortWidth - (margin.left + margin.right);
		const height = viewPortHeight - (margin.top + margin.bottom);

		const canvas = d3.select(svg_id);

		const xScale = d3.scaleBand()
			.domain(formattedData.map(d => d.passenger_class))
			.range([margin.left, width + margin.left])
			.padding(0.5);

		const yMin = 0;
		const yMax = d3.max(survivedCountData) + 10;
		
		const yScale = d3.scaleLinear()
			.domain([yMin, yMax])
			.range([height+margin.top, margin.top])
			.nice();
	

		const plotSelections = canvas.append("g")
							.selectAll("rect")
							.data(formattedData);

		plotSelections.exit().remove();

		const enterSelection = plotSelections.enter().append("rect");
		
		enterSelection.append("svg:title")
		.text(function(d){return "Total People Survived: " + d.survived_count;});
				
		enterSelection.merge(plotSelections)
		.attr("class", "bar_rectangle")
		.on("mouseover", onMouseOver)
		.on("mouseout", onMouseOut)
		.attr("x", (d, i) => xScale(d.passenger_class))
		.attr("y", d => yScale(d.survived_count))
		.attr("width", xScale.bandwidth())
		.transition()
		.ease(d3.easeLinear)
		.duration(500)
		.delay(function(d, i){ return i * 50; })
		.attr("height", d => yScale(yMin) - yScale(d.survived_count));

		const xAxis = d3.axisBottom()
		.scale(xScale)
		.tickFormat(v => "Class " + v );
		
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
			
		function onMouseOver(d, i) {
			d3.select(this)
			.attr("class", "bar_rectangle_highlight");
			
			d3.select(this)
			.transition()
			.duration(500)
			.attr("width", xScale.bandwidth() + 5)
			.attr("y", d => yScale(d.survived_count) - 20)
			.attr("height", d => yScale(yMin) - yScale(d.survived_count) + 20);
		}
		
		function onMouseOut(d, i) {
			d3.select(this).attr("class", "bar_rectangle");
			
			d3.select(this)
			.transition()
			.duration(500)
			.attr("width", xScale.bandwidth())
			.attr("y", d => yScale(d.survived_count))
			.attr("height", d => yScale(yMin) - yScale(d.survived_count));
		}
	})
}

function plot_groupedBarChart(svg_id, data){
	data.then(data => {
		const yAxisText = "Count";
		
		const formattedGroup = d3.group(data, d => d.passenger_class); 
		//console.log(formattedGroup);
		
		const formattedData = d3.map(formattedGroup, function(entry){
			return {
				male_survived: parseInt(entry[1].filter(d => d.sex == "male" && d.survived == "Yes").length),
				male_dead: parseInt(entry[1].filter(d => d.sex == "male" && d.survived == "No").length),
				female_survived: parseInt(entry[1].filter(d => d.sex == "female" && d.survived == "Yes").length),
				female_dead: parseInt(entry[1].filter(d => d.sex == "female" && d.survived == "No").length),
				passenger_class: entry[0]
			};
		}).filter(d => d.passenger_class !== "");
		
		//console.log(formattedData);
		
		const male_survived_count = d3.map(formattedData, d => d.male_survived);
		const male_death_count = d3.map(formattedData, d => d.male_dead);
		const female_survived_count = d3.map(formattedData, d => d.female_survived);
		const female_death_count = d3.map(formattedData, d => d.female_dead);
		
		const subGroups = d3.keys(formattedData[0])
		subGroups.pop();
		//console.log(subGroups);
		
		const groups = d3.map(d3.group(formattedData, d => d.passenger_class), d => d[0]).filter(d => d !==  "");
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
		const yMax = Math.max(d3.max(male_survived_count), d3.max(male_death_count), d3.max(female_survived_count), d3.max(female_death_count)) + 10;
		
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
			//console.log(xBandScale(d.passenger_class));  
			return "translate("+ xBandScale(d.passenger_class) +", 0)";
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
		
		const xAxis = d3.axisBottom()
		.scale(xBandScale)
		.tickFormat(v => "Class " + v);
		
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
	})
}