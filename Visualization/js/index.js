

function getCountrySeries(wordcloud) {

	var ret = {
		name: wordcloud._dom.id,
		type: 'wordCloud',
		shape: 'circle',
		left: 'center',
		top: 'center',
		sizeRange: [11, 130],
		rotationRange: [0, 90],
		rotationStep: 90,
		gridSize: 4,
		textStyle: {
			normal: {
				fontFamily: 'sans-serif',
				fontWeight: 'bold',
				// Set word colors according to country, or random if not specified
				color: function () {
					// Random color
					return 'hsl(0,100%,' + Math.round(Math.random() * 40 + 40) + "%)";
				}
			},
			emphasis: {
				shadowBlur: 10,
				shadowColor: '#ddd'
			}
		}
	};
	return ret;
}

function loadData(shape) {
	// Get cloud element
	var cloud = document.getElementById("cloud");

	// Remove all child nodes in cloud
	while (cloud.firstChild) {
		cloud.removeChild(cloud.firstChild);
	};

	var wordclouds = []

	// Asynchronous data loading
	jQuery.get({ url: 'Visualization/data.json', cache: false }).done(function (data) {
		//data = JSON.parse(data);


		data.forEach(function (country) {

			// Create div element for country word cloud
			var shapeDiv = document.createElement("div");
			shapeDiv.id = shape;
			shapeDiv.class = "shape";

			cloud.appendChild(shapeDiv);



			// Add data to div so we can retrieve it afterwards
			shapeDiv.data = country.frequencies;

			// Initialize ECharts wordcloud
			var wordcloud = echarts.init(shapeDiv);
			//wordcloud.showLoading();

			// Set wordcloud click callback
			wordcloud.on('click', function (params) {
				console.log(params.data.name, params.data.value, params.dataIndex);
				loadData("bombing");
                changeBackground();
			});

			// Add wordcloud to list
			wordclouds.push(wordcloud);

			// Create image for country word cloud mask
			var maskImage = new Image();
			maskImage.src = 'Visualization/img/' + shape + ".png";

			// LOad mask image
			maskImage.onload = function () {
				// Get country series for ECharts wordcloud option
				var countrySeries = getCountrySeries(wordcloud);

				countrySeries.maskImage = maskImage;
				countrySeries.data = country.frequencies;

				var option = {
					series: countrySeries
				};

				//wordcloud.hideLoading();

				wordcloud.setOption(option);
			}
		});
	});
}

function changeBackground() {

    $("#rain").fadeOut(2000);

    $("#starry").fadeIn(2000);
}


$(document).ready(function() {

    $("#starry").hide();

	// Load data for the first time
	loadData("machine_gun");

	// Create rain effect:
	createRain();

});
