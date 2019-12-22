// Global variables
var currentShape = "machine_gun";		// Current shape being shown
var musicFadeTime = 6000;				// Amount in ms for music to fade
var backgroundFadeTime = 3000;			// Amount in ms for background to fade
var tweetInterval = 6000;				// Interval in ms for tweets to pop on screen
var music = {};							// Holds Howl objects, where music[shape] refers to the object of that shape
var readyToTransition = false;			// Variable to keep track if all elements are done displaying so scene may transition to next view
window.posTabu = "left";				// Variable to hold last tweet generated position (so it wont be repeated)
var tweetData;							// Holds the big Json file
var chosenWordTweets;					// Tweets including the last word clicked by the user
var chosenWord;							// Last word clicked by the user
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
	changeBackground("intro_page");

	// Initializes music:
	shapes.forEach(function(shape){
		music[shape] = new Howl({
			src: ['Music/' + shape + '.mp3'],
			autoplay: false,
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


function startUp(){
	// Loads data for the first time:
	readyToTransition = false;
	loadData();
	// Checks if "enable music" checkbox is checked:
	if ($("#music-checkbox").is(":checked") == true) {
		// Starts music:
		music[currentShape].play();
	}
	changeBackground(currentShape, 1000);
	// Sets functionality of audio toggle button:
	$("#audio-toggle").fadeIn(1000);
	$("#audio-toggle").click(function(){
		if (music[currentShape].playing() == false){
			music[currentShape].play();
		} else {
			music[currentShape].pause();
		}
	});
}


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


function loadData(){
	// Asynchronous data loading
	jQuery.get({ url: 'Visualization/data.json', cache: true }).done(function (data) {
		// Saves data to global variable:
		tweetData = data[0];
		// Generates first wordcloud:
		generateCloud(currentShape);
	});
}


// Wordcloud handler:
function generateCloud(shape) {
	// Get cloud element
	var cloud = document.getElementById("cloud");

	// Remove all child nodes in cloud
	while (cloud.firstChild) {
		cloud.removeChild(cloud.firstChild);
	};

	var wordclouds = []


	// Create div element for country word cloud
	var shapeDiv = document.createElement("div");
	shapeDiv.id = shape;
	shapeDiv.class = "shape";

	cloud.appendChild(shapeDiv);



	// Add data to div so we can retrieve it afterwards
	shapeDiv.data = tweetData.frequencies;

	// Initialize ECharts wordcloud
	var wordcloud = echarts.init(shapeDiv);
	//wordcloud.showLoading();

	// Set wordcloud click callback
	wordcloud.on('click', function (params) {
		console.log(params.data.name, params.data.value, params.dataIndex);
		// Checks if scene is ready for a transition (i.e. elements from previous transition are done fading):
		if (readyToTransition){
			// Cancels all animations:
			breakAll();
			// Revives tweet generation:
			setTimeout(function() {
				generateTweets();
				var f = generateTweets;
				window.setInterval(f, tweetInterval);
			}, tweetInterval*0.33);
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
				nextShape = "machine_gun";
			} else if (currentShape == "syria_map"){
				nextShape = "heart";
			} else if (currentShape == "family"){
				customFadeOut = 500;
				nextShape = "stop_sign";
			}
			// Commands transition:
			readyToTransition = false;
			generateCloud(nextShape);
            changeBackground(nextShape, customFadeOut);
			changeSongs(nextShape);
			currentShape = nextShape;
			chosenWordTweets = params.data.tweets;
			chosenWord = params.data.name;
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
		countrySeries.data = tweetData.frequencies;

		var option = {
			series: countrySeries
		};

		//wordcloud.hideLoading();

		wordcloud.setOption(option);
	}
}



// Loads the *next* background, taking care of the fade transition:
function changeBackground(next, customFadeOut) {
	console.log("Changing to " + next);

	// Destroys previous background:
    $("#background").fadeOut(customFadeOut, function(){
		// Destroys old background:
		$("#background").remove();
		// Additional commands:
		if ((next != "machine_gun") && (next != "intro_page")) {
			destroyRain();
		} else if (next != "family"){
			destroyGarden();
		} else if (next != "stop_sign"){
			destroyBuildings();
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
	if (next == "intro_page"){
		// Builds intro screen:
		var canvas = $("<canvas></canvas>").attr("id", "canvas");
		var logo = $("<img></img>").attr("id", "logo").attr("src", "Visualization/img/social_compassion_logo.png");
		var intro_subtitle = $("<span></span>").attr("id", "intro-subtitle").text(
			"A #PrayForSyria Visualization"
		);
		var intro_text = $("<span></span>").attr("id", "intro-text").text(
			"On March 15th, 2011, a series of popular protests demanding democratic reforms would start a new chapter in Syrian history." +
			" To this day, the war rages on, leaving a trail of death and misery. This visualization collects 222,180 tweets, from March 2011 to December 2018," +
			" in the form of wordclouds, where the largest words are the ones that appear the most. Clicking on a word presents a new visualization and" +
			" showcases tweets containing the chosen word. In total, 6 visualizations and 247 words are available to be explored, featuring sound effects" +
			" from Pink Floyd's Comfortably Numb."
		);
		var checkbox = $("<label></label>").attr("class", "checkbox").html("Enable music").append([
			// Appends input checkbox element:
			$("<input>").attr("type", "checkbox").attr("checked", false).attr("id", "music-checkbox"),
			$("<span></span>").attr("class", "checkmark")
		]);
		var intro_button = $("<a></a>").attr("id", "intro-button").attr("class", "option-button").text("Start").click(function(){
			if (readyToTransition == true){
				startUp();
			}
		});
		var tech_report_button = $("<a></a>").attr("id", "tech-report-button").attr("class", "option-button").text("Read Tech Report").click(function(){
			var win = window.open("Tech_Report.pdf", '_blank');
			win.focus();
		});
		nextBackground.append([canvas, logo, intro_subtitle, intro_text, checkbox, intro_button, tech_report_button]);
		createRain();
	} else if (next == "machine_gun"){
		var oldCanvas = $("canvas").attr("id", "old-canvas");
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
		var canvas = $("<canvas></canvas>").attr("class", "canvas-city").attr("id", "canvas-city");
		nextBackground.append(canvas);
		createBuildings();
	} else if (next == "family"){
		var canvas = $("<canvas></canvas>").attr("class", "canvas-garden").attr("id", "canvas-garden");
		nextBackground.append(canvas);
		createGarden();
	} else if (next == "syria_map"){
		var div = $("<div></div>").attr("id", "div-fire");
		nextBackground.append(div);
	}

}


function generateTweets(){
	// If no word was chosen yet, do nothing:
	if (chosenWordTweets == undefined){
		return;
	}
	// Generates a random tweet text id from 1 to 20:
	var tweetId = Math.floor((Math.random() * 20) + 1);
	// Retrieves chosen tweet:
	var tweetText = chosenWordTweets[tweetId-1];
	// Creates elements:
	var tweetDiv = $("<div></div>").attr("class", "tweet");
	var tweetSpan = $("<span></span>");
	var re = new RegExp(chosenWord, "gi");
	tweetSpan.html(tweetText.replace(re, '<span class="chosen-word">$&</span>'));
	// Generates font style (a number between 1 and 5):
	var fontId = Math.floor((Math.random() * 5) + 1);
	// Selects font size:
	var fontSize = 1.1;
	if (fontId == 1){
		fontSize = 1.8;
	} else if (fontId = 2){
		fontSize = 1.8;
	}
	// Generates which pre-determined area of the screen to put the tweet (a number between 1 and 4):
	posId = Math.floor((Math.random() * 4) + 1);
	// Selects area:
	var left, top;
	var width = 50;
	if ((posId == 1) && (posTabu == "left")){
		left = 3;
		top = 6;
	} else if ((posId == 2) && (posTabu == "left")){
		left = 32;
		top = 4;
	} else if ((posId == 3) && (posTabu == "left")){
		left = 47;
		top = 6;
	} else if ((posId == 4) && (posTabu == "left")){
		left = 68;
		top = 45;
		width = 30;
	} else if ((posId == 1) && (posTabu == "right")){
		left = 9;
		top = 87;
	} else if ((posId == 2) && (posTabu == "right")){
		left = 35;
		top = 86;
	} else if ((posId == 3) && (posTabu == "right")){
	   left = 63;
	   top = 83;
	   width = 35;
	} else if ((posId == 4) && (posTabu == "right")){
		left = 5;
		top = 85;
		width = 40;
	}
	// Switches posTabu:
	if (posTabu == "right"){
		posTabu = "left"
	} else if (posTabu == "left"){
		posTabu = "right"
	}
	// Applies formatting:
	tweetDiv.css({
		fontFamily: "Font"+fontId,
	    fontSize: fontSize+"vw",
		left: left+"vw",
		top: top+"vh",
		width: width+"vw"
	});
	tweetDiv.append(tweetSpan);
	$("body").append(tweetDiv);
}



// Loads the *next* song, taking care of the fade transition:
function changeSongs(next){
	// Only acts if music is playing:
	if (music[currentShape].playing() == true){
		// Seeks new music to synch with current:
		music[next].play();
		music[next].seek(music[currentShape].seek());
		// Fades current music:
		music[currentShape].fade(1, 0, musicFadeTime);
		// Fades new music:
		music[next].fade(0, 1, musicFadeTime);
	}
}
