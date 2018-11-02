// Global variables
var currentShape = "machine_gun";		// Current shape being shown
var musicFadeTime = 5000;				// Amount in ms for music to fade
var backgroundFadeTime = 2000;			// Amount in ms for background to fade



// Executes when page finishes loading:
$(document).ready(function() {

    $("#starry").hide();

	// Loads data for the first time:
	loadData(currentShape);
	changeBackground(currentShape);

	// Adds functionality to audio toggle:
	$("#audio-toggle").click(function(){
		$("#grunty1")[0].play();
	});

});


// Wordcloud handler:
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


// Wordcloud handler:
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
                changeBackground("bombing");
				changeSongs("grunty2");
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



// Loads the *next* background, taking care of the fade transition:
function changeBackground(next) {

	console.log("Changing to " + next);

	// Destroys previous background:
    $("#background").fadeOut(backgroundFadeTime, function(){
		// Destroys old background:
		$("#background").remove();
		// Additional commands:
		if (next != "machine_gun") {
			destroyRain();
		}
	});

	// Creates new background:
	var nextBackground = $("<div></div>").attr("id", "next-background");
	nextBackground.attr("class", "bg");
	nextBackground.hide();
	// Appends next background to body:
	$("body").append(nextBackground);
	// Calls for fade in:
	nextBackground.fadeIn(backgroundFadeTime, function(){
		// Changes id to become old background:
		$("#next-background").attr("id", "background");
	});

	// Checks for additional actions:
	if (next == "machine_gun"){
		var canvas = $("<canvas></canvas>").attr("id", "canvas");
		nextBackground.append(canvas);
		$("body").append()
		createRain();
	} else if (next == "bombing"){
		var div1 = $("<div></div>").attr("class", "stars");
		var div2 = $("<div></div>").attr("class", "twinkling");
		var div3 = $("<div></div>").attr("class", "clouds");
		nextBackground.append([div1, div2, div3]);
	}

}




// Loads the *next* song, taking care of the fade transition:
function changeSongs(next){
	// Creates an audio element for next song:
	var nextDOM = $("<audio></audio>").attr("src", "Music/" + next + ".mp3");
	// Adds next song to DOM:
	$("body").append(nextDOM);
	// Prepares next song:
	nextDOM[0].volume = 0;
	nextDOM.trigger("play");
	// Selects current song from DOM:
	var currentDOM = $("#"+currentShape);
	// Activates fade:
	nextDOM[0].currentTime = currentDOM[0].currentTime + 0.1;
	currentDOM.animate({volume: 0}, musicFadeTime, function(){currentDOM.remove();});
	nextDOM.animate({volume: 1}, musicFadeTime);
}
