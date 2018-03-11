// camera.js

var live_url    = "http://192.168.1.6:88/cgi-bin/CGIProxy.fcgi?cmd=snapPicture2&usr=guest&pwd=guest";
// var url    = "https://188.183.235.63/cgi-bin/CGIProxy.fcgi?cmd=snapPicture2&usr=guest&pwd=guest";
var nimg   = 0;
var nmax   = 0;
var dir    = "FI9805W_00626E4EB6F5/snap";
var timer  = 0;
var images;
var times;
var bucket_name = "camera-185513.appspot.com";

function fetch_data(date) {
	images = new Array();
	times  = new Array();
    today  = new Date();

	var url = "/images";

	if (date && (date != today.toString("yyyyMMdd"))) {
	    url += "/" + date;
    }

	$.getJSON(url, function (data) {
		for (i=0; i<data.length; i++) {
			images.push(data[i]);
  			parts1 = data[i].split('-');
			parts2 = parts1[2].split('.');
			t = parts2[0];
			times.push(t.substr(0,2)+":"+t.substr(2,2)+":"+t.substr(4,2));
		}
		nmax = data.length-1;
		set_img(nmax);
		document.getElementById("tid").innerHTML=times[nmax];
	});
}
function set_img(n) {
    nimg = n;
    document.getElementById("img").src="http://"+bucket_name+".storage.googleapis.com/" + images[nimg];
	document.getElementById("tid").innerHTML=times[nimg];
	document.getElementById("nimg").innerHTML=nimg;
    // $("#leftpanel").panel("close");
}
function next_img() {
	var more = true;
    nimg += 1;
    if (nimg > nmax) { nimg = nmax; more = false; }
    document.getElementById("img").src="http://"+bucket_name+".storage.googleapis.com/" + images[nimg];
	document.getElementById("tid").innerHTML=times[nimg];
	document.getElementById("nimg").innerHTML=nimg;
	return more;
}
function prev_img() {
	var more = true;
    nimg -= 1;
    if (nimg < 0) { nimg = 0; more = false; }
    document.getElementById("img").src="http://"+bucket_name+".storage.googleapis.com/" + images[nimg];
	document.getElementById("tid").innerHTML=times[nimg];
	document.getElementById("nimg").innerHTML=nimg;
	return more;
}

function draw_timeline() {
	var c = document.getElementById("timeline");
	var ctx = c.getContext("2d");
	ctx.moveTo(0,0);
	ctx.lineTo(200,0);
	ctx.stroke();
}

function film() {
	if ($("#film").text() == "Film") {
        clearTimeout(timer);
		$("#film").button("option", "label", "Stop");
        $("#live").button("option", "label", "Live");
		timer = setTimeout(function() { film_roll();}, 250);
	} else {
		$("#film").button("option", "label", "Film");
		if (timer) {
			clearTimeout(timer);
			timer = 0;
		}
	}
}

function live() {
    if ($("#live").text() == "Live") {
        $("#live").button("option", "label", "Stop");
        $("#film").button("option", "label", "Film");
        clearTimeout(timer);

		var date = new Date();
		document.getElementById("tid").innerHTML = date.toString("HH:mm:ss");
		document.getElementById("nimg").innerHTML="-";
        document.getElementById("img").src=url;

		timer = setTimeout(function() { live_update();}, 1000);

	} else {
		if (timer) {
			clearTimeout(timer);
			timer = 0;
		}
		$("#live").button("option", "label", "Live");
		set_img(nmax);
	}
}

function live_update() {
	var date = new Date();
    document.getElementById("tid").innerHTML = date.toString("HH:mm:ss");
    document.getElementById("img").src = url + "#" + date.getTime();

	timer = setTimeout(function() { live_update();}, 1000);
}

function film_roll() {
	if (next_img()) {
		timer = setTimeout(function() { film_roll();}, 250);
	} else {
		$("#film").button("option", "label", "Film");
	}
}

function parseDate(input) {
  var parts = input.toString().split('-');
  return new Date(parts[0], parts[1]-1, parts[2]); // Note: months are 0-based
}

function prev_day() {
	var date = parseDate(document.getElementById("date").innerHTML)
	date.setDate(date.getDate() - 1);
    document.getElementById("date").innerHTML = date.toString("yyyy-MM-dd");
    fetch_data(date.toString("yyyyMMdd"));
    // $("#leftpanel").panel("close");
}
function next_day() {
	var date = parseDate(document.getElementById("date").innerHTML)
	date.setDate(date.getDate() + 1);
    document.getElementById("date").innerHTML = date.toString("yyyy-MM-dd");
    fetch_data(date.toString("yyyyMMdd"));
    // $("#leftpanel").panel("close");
}

$(document).ready(function(){
	var date = new Date();
    document.getElementById("date").innerHTML = date.toString("yyyy-MM-dd");

    $("div#prev").on("tap", function(){ prev_img() });
    $("div#next").on("tap", function(){ next_img() });
    // $("#content").on("swiperight", function(){ $("#leftpanel").panel("open"); });
    $("a").button();

    fetch_data();
	// draw_timeline();
});

$(document).keydown(function(e){
    if (e.keyCode == 39) {
    	next_img();
        return false;
    } else if (e.keyCode == 37) {
    	prev_img();
        return false;
    } else if (e.keyCode == 38) {
        next_day();
        return false;
    } else if (e.keyCode == 40) {
        prev_day();
        return false;
    } else if (e.keyCode == 27) {
        return false;
    }

});
