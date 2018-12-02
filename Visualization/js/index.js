// Global variables
var currentShape = "machine_gun";		// Current shape being shown
var musicFadeTime = 6000;				// Amount in ms for music to fade
var backgroundFadeTime = 3000;			// Amount in ms for background to fade
var music = {};							// Holds Howl objects, where music[shape] refers to the object of that shape
var readyToTransition = false;			// Variable to keep track if all elements are done displaying so scene may transition to next view
var shapes = [							// List of possible shapes
				"machine_gun",
				"bombing",
				"heart",
				"stop_sign",
				"family",
				"syria_map"
			];


// Executes when page finishes loading:
$(document).ready(function() {

	// Loads data for the first time:
	loadData(currentShape);
	changeBackground(currentShape);
	// Sets up tweet generation callback:
	window.setInterval(function(){
	  generateTweets();
	}, 10000);

	// Initializes music:
	shapes.forEach(function(shape){
		var autoplay;
		(shape == currentShape) ? autoplay = true : autoplay = false;
		music[shape] = new Howl({
			src: ['Music/' + shape + '.mp3'],
			autoplay: autoplay,
			loop: true,
			preload: true,
			onfade: function(){
				if(this.volume() == 0){
					this.stop();
				}
			}
		});
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
				// Checks if scene is ready for a transition (i.e. elements from previous transition are done fading):
				if (readyToTransition){
					// By default, background will fade out as defined in header:
					var customFadeOut = backgroundFadeTime;
					// Defines next view:
					var nextShape;
					if (currentShape == "bombing"){
						customFadeOut = 1000;
						nextShape = "family";
					} else if (currentShape == "machine_gun"){
						customFadeOut = 400;
						nextShape = "syria_map";
					} else if (currentShape == "heart"){
						nextShape = "bombing";
					} else if (currentShape == "stop_sign"){
						nextShape = "bombing";
					} else if (currentShape == "syria_map"){
						nextShape = "heart";
					} else if (currentShape == "family"){
						customFadeOut = 500;
						nextShape = "stop_sign";
					}
					// Commands transition:
					readyToTransition = false;
					loadData(nextShape);
	                changeBackground(nextShape, customFadeOut);
					changeSongs(nextShape);
					currentShape = nextShape;
				}
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
function changeBackground(next, customFadeOut) {

	console.log("Changing to " + next);

	// Destroys previous background:
    $("#background").fadeOut(customFadeOut, function(){
		// Destroys old background:
		$("#background").remove();
		// Additional commands:
		if (next != "machine_gun") {
			destroyRain();
		} else if ((next != "family") && (next != "stop_sign")){
			destroyGarden();
		}
	});


	// Creates new background:
	var nextBackground = $("<div></div>").attr("id", "next-background");
	nextBackground.attr("class", "bg");
	nextBackground.hide();
	// Appends next background to body:
	$("body").append(nextBackground);
	// Calls for fade in:
	if (customFadeOut != backgroundFadeTime){
		nextBackground.fadeIn(backgroundFadeTime*1.5, function(){
			// Changes id to become old background:
			$("#next-background").attr("id", "background");
			// Signals that the scene is done transitioning:
			readyToTransition = true;
		});
	} else {
		nextBackground.fadeIn(backgroundFadeTime, function(){
			// Changes id to become old background:
			$("#next-background").attr("id", "background");
			// Signals that the scene is done transitioning:
			readyToTransition = true;
		});
	}

	// Checks for additional actions:
	if (next == "machine_gun"){
		var canvas = $("<canvas></canvas>").attr("id", "canvas");
		nextBackground.append(canvas);
		createRain();
	} else if (next == "bombing"){
		var div1 = $("<div></div>").attr("class", "stars");
		var div2 = $("<div></div>").attr("class", "twinkling");
		var div3 = $("<div></div>").attr("class", "clouds");
		nextBackground.append([div1, div2, div3]);
	} else if (next == "heart"){
		var canvas1 = $("<canvas></canvas>").attr("id", "vines");
		var canvas2 = $("<canvas></canvas>").attr("id", "leaves");
		nextBackground.append([canvas1, canvas2]);
		createVines();
	} else if (next == "stop_sign"){
		var canvas = $("<canvas></canvas>").attr("id", "canvas-city");
		nextBackground.append(canvas);
		createBuildings();
	} else if (next == "family"){
		var canvas = $("<canvas></canvas>").attr("id", "canvas-garden");
		nextBackground.append(canvas);
		createGarden();
	} else if (next == "syria_map"){
		var div = $("<div></div>").attr("id", "div-fire");
		nextBackground.append(div);
	}

}


function generateTweets(){
	// Creates elements:
	var tweetDiv = $("<div></div>").attr("class", "tweet");
	var tweetSpan = $("<span></span>").text("Acredito que devemos parar com a matança");
	// Returns a number between 1 and 8:
	var fontId = Math.floor((Math.random() * 8) + 1);
	// Selects font size:
	var fontSize = 40;
	if (fontId == 1){
		fontSize = 20;
	} else if (fontId == 4){
		fontSize = 30;
	} else if (fontId == 5){
		fontSize = 30;
	} else if (fontId == 7){
		fontSize = 50;
	} else if (fontId == 8){
		fontSize = 30;
	}
	// Applies formatting:
	tweetDiv.css({
		fontFamily: "Font"+fontId,
	    fontSize: fontSize+"px",
		left: "30px",
		top: "30px"
	});
	tweetDiv.append(tweetSpan);
	$("body").append(tweetDiv);
}



// Loads the *next* song, taking care of the fade transition:
function changeSongs(next){
	// Seeks new music to synch with current:
	music[next].play();
	music[next].seek(music[currentShape].seek());
	// Fades current music:
	music[currentShape].fade(1, 0, musicFadeTime);
	// Fades new music:
	music[next].fade(0, 1, musicFadeTime);

}
