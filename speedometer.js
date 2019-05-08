/*global document,window*/
var SpeedometerInit = {
	START_OFFSET: 0.9, //.95 - Just below horizontal (left)
	MID_OFFSET: 1.5,
	END_OFFSET: 2.10 //2.05 - Just below horizontal (right)
};

var Speedometer = {
	ON_COURSE: "OnCourse",
	OFF_COURSE: "OffCourse",
	UNDER_REVIEW: "UnderReview",
	ON_COURSE_COLOR: "#69913a",
	UNDER_REVIEW_COLOR: "#e37222",
	OFF_COURSE_COLOR: "#96151d",
	BACKGROUND_COLOR: "#e6e2d9",
	START_OFFSET: SpeedometerInit.START_OFFSET,
	MID_OFFSET: SpeedometerInit.MID_OFFSET,
	END_OFFSET: SpeedometerInit.END_OFFSET,
	FILL_FACTOR: (SpeedometerInit.MID_OFFSET - SpeedometerInit.START_OFFSET) / 0.5,
	START_ARC: Math.PI * SpeedometerInit.START_OFFSET,
	END_ARC: Math.PI * SpeedometerInit.END_OFFSET,
	START_X: 0,
	START_Y: 0,
	ARC_WIDTH: 15,
	FILL_WIDTH: 15,
	RADIUS: 126,
	NEEDLE_LENGTH: 15,
	NEEDLE_WIDTH: 3,
	PERCENT_Y_OFFSET: 75,
	PERCENT_ADJUST1: 14,
	PERCENT_ADJUST2: 7,
	PERCENT_SUCCESS: 0,
	SUCCESS_FONT_SIZE: 80, //94
	SUCCESS_PERCENT_FONT_SIZE: 38, //42
	SUCCESS_FONT: "px Arial",
	TITLE_SIZE: 14,
	TITLE_FONT: "px Arial",
	TITLE_COLOR: "#000",
	TITLE_Y_OFFSET: 47,
	TITLE_SPACING: 17,
	CTX: null,
	CANVAS: null,
	WIDTH: 275,
	HEIGHT: 235,
	isAnimating: false,
	isCanvasSupported: true,
	shouldAnimateGauge: false
};

var SpeedometerContent = {
	TITLE_LINE1: "",
	TITLE_LINE2: ""
};

// Determine outlook based on percent
function returnSpeedometerOutlook(percent) {
	'use strict';

	if (percent >= 85) {
		return Speedometer.ON_COURSE;
	}
	if (percent < 85 && percent >= 70) {
		return Speedometer.UNDER_REVIEW;
	}
	return Speedometer.OFF_COURSE;
}

// Get fill color based on outlook
function getSpeedometerFillColor(outlook) {
	'use strict';

	if (Speedometer.ON_COURSE === outlook) {
		return Speedometer.ON_COURSE_COLOR; // Green
	}
	if (Speedometer.UNDER_REVIEW === outlook) {
		return Speedometer.UNDER_REVIEW_COLOR; // Yellow
	}
	return Speedometer.OFF_COURSE_COLOR; //Red
}

// Draw background arc
function drawSpeedometerBackground() {
	'use strict';

	// Grey
	Speedometer.CTX.beginPath();
	Speedometer.CTX.lineWidth = Speedometer.ARC_WIDTH;
	Speedometer.CTX.strokeStyle = Speedometer.BACKGROUND_COLOR;
	Speedometer.CTX.arc(Speedometer.START_X, Speedometer.START_Y, Speedometer.RADIUS, Speedometer.START_ARC, Speedometer.END_ARC);
	Speedometer.CTX.stroke();
}

function displaySpeedometerData(percentSuccess) {
	'use strict';

	var endGaugeRad = Math.PI * (Speedometer.START_OFFSET + ((percentSuccess / 100) * Speedometer.FILL_FACTOR)),
	//startPointerBaseRad = Math.PI * ((Speedometer.START_OFFSET + ((percentSuccess / 100) * Speedometer.FILL_FACTOR)) - 0.01),
	//endPointerBaseRad = Math.PI * ((Speedometer.START_OFFSET + ((percentSuccess / 100) * Speedometer.FILL_FACTOR)) + 0.01),
		pointerTipX = Speedometer.START_X + ((Speedometer.RADIUS - Speedometer.ARC_WIDTH / 2) - Speedometer.NEEDLE_LENGTH ) * (Math.cos(endGaugeRad)),
		pointerTipY = Speedometer.START_Y + ((Speedometer.RADIUS - Speedometer.ARC_WIDTH / 2) - Speedometer.NEEDLE_LENGTH ) * (Math.sin(endGaugeRad)),
		pointerBaseMiddleX = Speedometer.START_X + (Speedometer.RADIUS + Speedometer.FILL_WIDTH / 2) * (Math.cos(endGaugeRad)),
		pointerBaseMiddleY = Speedometer.START_Y + (Speedometer.RADIUS + Speedometer.FILL_WIDTH / 2) * (Math.sin(endGaugeRad));

	// Draw arc percentage fill
	Speedometer.CTX.beginPath();
	Speedometer.CTX.lineWidth = Speedometer.FILL_WIDTH;
	Speedometer.CTX.strokeStyle = getSpeedometerFillColor(returnSpeedometerOutlook(percentSuccess));
	Speedometer.CTX.arc(Speedometer.START_X, Speedometer.START_Y, Speedometer.RADIUS, Speedometer.START_ARC, endGaugeRad);
	Speedometer.CTX.stroke();

	Speedometer.CTX.beginPath();
	Speedometer.CTX.lineWidth = Speedometer.NEEDLE_WIDTH;
	Speedometer.CTX.strokeStyle = getSpeedometerFillColor(returnSpeedometerOutlook(percentSuccess));
	Speedometer.CTX.fillStyle = getSpeedometerFillColor(returnSpeedometerOutlook(percentSuccess));

	Speedometer.CTX.moveTo(pointerTipX, pointerTipY);
	Speedometer.CTX.lineTo(pointerBaseMiddleX, pointerBaseMiddleY);
	Speedometer.CTX.stroke();
	Speedometer.CTX.fill();
}

//Display % success and title
function displaySpeedometerPercent(percentSuccess) {
	'use strict';

	var displayLabel = percentSuccess,
		percentXOffset = 0,
		topY = Speedometer.START_Y - Speedometer.RADIUS + (Speedometer.ARC_WIDTH / 2) + Speedometer.PERCENT_Y_OFFSET;

	// Change x-offset for different percents
	if (percentSuccess < 10) {
		percentXOffset = 5;
	} else if (percentSuccess > 9 && percentSuccess <= 99) {
		percentXOffset = 27;
	} else {
		percentXOffset = 46;
	}

	if (percentSuccess < 1) {
		displayLabel = "<1";
	}

	if (percentSuccess > 99) {
		displayLabel = ">99";
	}

	// Display success percent #
	Speedometer.CTX.font = Speedometer.SUCCESS_FONT_SIZE + Speedometer.SUCCESS_FONT;
	Speedometer.CTX.fillStyle = getSpeedometerFillColor(returnSpeedometerOutlook(percentSuccess));
	Speedometer.CTX.textAlign = "right";
	Speedometer.CTX.textBaseline = "top";

	Speedometer.CTX.fillText(displayLabel, Speedometer.START_X + percentXOffset, topY - Speedometer.PERCENT_ADJUST1);

	// Display % sign
	Speedometer.CTX.font = Speedometer.SUCCESS_PERCENT_FONT_SIZE + Speedometer.SUCCESS_FONT;
	Speedometer.CTX.textBaseline = "top";
	Speedometer.CTX.textAlign = "left";
	Speedometer.CTX.fillText("%", Speedometer.START_X + percentXOffset, topY - Speedometer.PERCENT_ADJUST2);

	// Display Title
	Speedometer.CTX.textBaseline = "alphabetic";
	Speedometer.CTX.textAlign = "center";
	Speedometer.CTX.font = Speedometer.TITLE_SIZE + Speedometer.TITLE_FONT;
	Speedometer.CTX.fillStyle = Speedometer.TITLE_COLOR;
	Speedometer.CTX.fillText(SpeedometerContent.TITLE_LINE1, Speedometer.START_X, Speedometer.START_Y + Speedometer.TITLE_Y_OFFSET);
	Speedometer.CTX.fillText(SpeedometerContent.TITLE_LINE2, Speedometer.START_X, Speedometer.START_Y + Speedometer.TITLE_Y_OFFSET + Speedometer.TITLE_SPACING);
}

// Speedometer draw function
function drawSpeedometerData(percentSuccess) {
	'use strict';

	drawSpeedometerBackground();
	displaySpeedometerData(percentSuccess);
	displaySpeedometerPercent(percentSuccess);
}

// Animate the Speedometer
function animateSpeedometer(percentSuccess) {
	'use strict';

	// clear
	Speedometer.CTX.clearRect(0, 0, Speedometer.CANVAS.width, Speedometer.CANVAS.height);

	// draw
	drawSpeedometerData(percentSuccess);

	// request new frame
	if (percentSuccess < Speedometer.PERCENT_SUCCESS) {
		percentSuccess += 1;
		window.setTimeout("animateSpeedometer(" + percentSuccess + ")", 1000 / 60);
	} else {
		Speedometer.isAnimating = false;
		Speedometer.CTX.clearRect(0, 0, Speedometer.CANVAS.width, Speedometer.CANVAS.height);
		drawSpeedometerData(Speedometer.PERCENT_SUCCESS);
	}
}

// Check if canvas is supported and init
function checkInitIECanvasForSpeedometer() {
	'use strict';

	if (!(document.createElement('canvas').getContext)) {
		Speedometer.isCanvasSupported = false;
		/*global G_vmlCanvasManager*/
		if (window.G_vmlCanvasManager) {
			if (!document.namespaces.g_vml_) {
				G_vmlCanvasManager.init_(document);
			} else if (Speedometer.CANVAS.tagName.toUpperCase() === "CANVAS") {
				window.G_vmlCanvasManager.initElement(Speedometer.CANVAS);
			}
		}
	}
}

function initSpeedometerColors(onCourse, underReview, offCourse) {
	'use strict';

	Speedometer.ON_COURSE_COLOR = onCourse;
	Speedometer.UNDER_REVIEW_COLOR = underReview;
	Speedometer.OFF_COURSE_COLOR = offCourse;
}

function initSpeedometerText(text1, text2) {
	'use strict';

	SpeedometerContent.TITLE_LINE1 = text1;
	SpeedometerContent.TITLE_LINE2 = text2;
}

// Initialize size and draw
function initAndDrawSpeedometer(wrapper_id, canvas_id, percentSuccess, shouldAnimate, name, planningHorizon) {
	'use strict';

	if (Speedometer.isAnimating) {
		return;
	}

	if (!document.getElementById(canvas_id)) {
		Speedometer.CANVAS = document.createElement('canvas');
		document.getElementById(wrapper_id).appendChild(Speedometer.CANVAS);
	}
	checkInitIECanvasForSpeedometer();

	Speedometer.CANVAS.setAttribute("width", Speedometer.WIDTH);
	Speedometer.CANVAS.setAttribute("height", Speedometer.HEIGHT);
	Speedometer.CANVAS.setAttribute("id", canvas_id);

	Speedometer.CTX = Speedometer.CANVAS.getContext("2d");

	Speedometer.PERCENT_SUCCESS = Math.round(percentSuccess);
	Speedometer.shouldAnimateGauge = shouldAnimate;

	Speedometer.START_X = Speedometer.CANVAS.width / 2;
	Speedometer.START_Y = Speedometer.START_X;

	//Content
	if (name !== undefined && planningHorizon !== undefined) {
		SpeedometerContent.TITLE_LINE1 = "Likelihood that " + name + "'s money";
		SpeedometerContent.TITLE_LINE2 = "will last until " + name + " reaches age " + planningHorizon + ".";
	}

	if (percentSuccess < 1 && Speedometer.isCanvasSupported && Speedometer.shouldAnimateGauge) {
		Speedometer.isAnimating = false;
		drawSpeedometerData(percentSuccess);
	} else if (Speedometer.isCanvasSupported && Speedometer.shouldAnimateGauge) {
		Speedometer.isAnimating = true;
		window.setTimeout("animateSpeedometer(0)", 0);
	} else {
		Speedometer.isAnimating = false;
		drawSpeedometerData(Speedometer.PERCENT_SUCCESS);
	}
}
