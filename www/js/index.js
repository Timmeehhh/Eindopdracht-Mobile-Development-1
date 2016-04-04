var idOfPreviousPage = null;


var db;
var contactsFound = 0;

Storage.prototype.setObject = function (key, value)	{ 
	this.setItem(key, JSON.stringify(value)); 
}

Storage.prototype.getObject	= function (key) {
	var value = this.getItem(key);
	return value && JSON.parse(value);
}

pageBack = function ()
{
	switch($.mobile.activePage.attr("id")) {
		case "index":
			$("#backButton").html("");
			navigator.app.exitApp(); // exit app.
		break;
		case "restaurantOnLocationFound":
			$.mobile.changePage("#restaurantOnLocation", { reverse: true, transition: 'slide'});
		break;
		case "restaurantCategory":
			$.mobile.changePage("#pickRestaurant", { reverse: true, transition: 'slide'});
		break;
		case "menu":
			$.mobile.changePage("#" + idOfPreviousPage, {transition: 'slideup'});
		break;
		case "restaurantExtraInfo":
			$.mobile.changePage("#restaurantCategory", { reverse: true, transition: 'slide'});
		break;
		default:
			$.mobile.changePage("#index", { reverse: true, transition: 'slide'});
		break;
	}
	if (idOfPreviousPage == "index") {
		$("#backButton").html("");
	}
	backButton();
}


backButton = function ()
{   
	switch($.mobile.activePage.attr("id")) {
		case "index":
			$("#backButton").html("");
		break;
		// case "menu":
		// 	$("#backButton").html("");
		// break;
		default:
			$("#backButton").html("<a href=\"#\" onclick=\"pageBack()\" id=\"pageBack\" class=\"ui-btn-left ui-btn ui-icon-back ui-btn-icon-notext ui-shadow ui-corner-all\"  data-role=\"button\" role=\"button\" style=\"border:0;\">Back</a>");
		break;
	}
}

$(document).ready(function(e)
{
	backButton();
	$.getJSON('https://api.eet.nu/tags?tags=lekker-top100', 
		function(data){
			var items = [];
			var curTag = "lekker-top100%2C";

			for (i = 0; i < data.results.length; ++i) {
				items.push('<li><a href="#" onclick="nextCatPage(\'' + data.results[i].resources.venues + '\'); return false;" class="ui-btn ui-btn-icon-right ui-icon-carat-r">' + data.results[i].name + '</a></li>');
			}
			 
			 $(".jsonResult").html("");

			  $( "<ul/>", {
			    "class": "ui-listview",
			    "data-role": "listview",
			    html: items.join( "" )
			  }).appendTo( ".jsonResult" ); 
		}
	);
	
	$(window).on("swiperight", function(e)
	{
		if ($.mobile.activePage.attr("id") !== "menu")
		{
 			pageBack();
 		}
    });

    $("#topBar").toolbar();

    $("#changeSettings").on('tap', function (){ saveSettings(); });

	// check on backbutton
	$('a').on('tap',function(){
		backButton();
	});

	$('button').on('tap',function(){
		backButton();
	});

	// #check on backbutton

	$("#menuBtn").on("tap",function(){

		if ($.mobile.activePage.attr("id") !== "menu")
		{
			idOfPreviousPage = $.mobile.activePage.attr("id");
	 	 	$.mobile.changePage("#menu", {transition: 'slidedown'});
		}
		else
		{
			$.mobile.changePage("#" + idOfPreviousPage, {transition: 'slideup'});
			idOfPreviousPage = null;
		}
	});

	$("#indexBtn").on("tap", function (e)
	{
		$.mobile.changePage('#pickRestaurant', {transition: 'slide'});
	});

	// Modules
	$('#webWebsite').on('tap',function(){
		window.open("http://www.eet.nu", "_system");
	});
	$('#mailButton').on('tap',function(){
	   window.location.href = "mailto:support@eetnu.zendesk.com?body=Uw%20vraag%20of%20opmerking."; 
	});
	$('#callButton').on('tap',function(){
	   window.location.href = "tel:0612345678"; 
	});

	$('#searchInKilometers').on('tap',function(){
		$.mobile.changePage('#restaurantOnLocationFound', {transition: 'slide'});
		$("#foundRestaurants").html("<p>Data wordt geladen.. Een moment geduld a.u.b..");
		//geolocation
		setTimeout(function()
		{
			var geo_options = {
			enableHighAccuracy: true, 
			maximumAge : 3000,
			timeout : 60000
			};

			navigator.geolocation.getCurrentPosition(onSuccessGeo, onErrorGeo, geo_options);
		}, 0);
		window.localStorage.setObject("kilometers", $("#kilometers").val());

	});

});

function nextCatPage(nextPage) {
	$(".insertExtraInfo").html("");
	$(".tabletView").html("");
	$.mobile.changePage('#restaurantCategory', {transition: 'slide'});
	$(".dataRestaurants").html("<p>Data wordt geladen..");
	var sortedBy = window.localStorage.getObject("sort_by");
	nextPage = nextPage+"&sort_by="+sortedBy;
	$.getJSON(nextPage
	).done(function(data){
			var items = [];
			for (i = 0; i < data.results.length; ++i) {
				if (window.localStorage.getObject("needsReview") === "on" && data.results[i].rating === null) {
					// Don't show the item as it has been turned off by the user.
				}else {
					items.push('<table width="100%" class="restaurant"><tr class="tr_header"><td colspan="2"><a href="#" class="restaurantName" onclick="loadExtraInfo('+data.results[i].id+')">'+ data.results[i].name +'</a><a href="http://maps.google.com/?daddr='+data.results[i].address.street + ' ' + data.results[i].address.zipcode + ' ' + data.results[i].address.city+'" class="linkNavigation">Navigeer</a></td></tr><tr class="tr_content"><td width="50%">Beoordeling:</td><td width="50%">'+ getStars((data.results[i].rating / 10)) +'</td></tr><tr class="tr_content"><td>Straat:</td><td>'+ data.results[i].address.street +'</td></tr><tr class="tr_content"><td>Postcode:</td><td>'+ data.results[i].address.zipcode +'</td></tr><tr class="tr_content"><td>Plaats:</td><td>'+ data.results[i].address.city +'</td></tr><tr class="tr_content"><td>Telefoon:</td><td><a href="tel:'+ data.results[i].telephone +'">'+ data.results[i].telephone +'</a></td></tr></table>');
				}
			}
			$(".dataRestaurants").html("");
			$(".dataRestaurants").append(items.join(""));
	}).fail(function() {
		$(".dataRestaurants").html("<p>Controleer uw internet verbinding. Er kan geen data worden opgehaald. Mits uw internet verbinding stabiel is kan het zijn dat we momenteel geen gegevens op kunnen halen. Probeer het later nog eens.</p>")
	});
}

function showRestaurantsFound(nextPage) {
	$.getJSON(nextPage
	).done(function(data){
			var items = [];
			for (i = 0; i < data.results.length; ++i) {
				//items.add('Naam: '+ String(data.results[i].name) +' <br />');
				if (window.localStorage.getObject("needsReview") === "on" && data.results[i].rating === null) {
					// Don't show them.
				}else {
					items.push('<table width="100%" class="restaurant"><tr class="tr_header"><td colspan="2">'+ data.results[i].name +' <a href="http://maps.google.com/?daddr='+data.results[i].address.street + ' ' + data.results[i].address.zipcode + ' ' + data.results[i].address.city+'" class="linkNavigation">Navigeer</a></td></tr><tr class="tr_content"><td width="50%">Beoordeling:</td><td width="50%">'+ getStars((data.results[i].rating / 10)) +'</td></tr><tr class="tr_content"><td>Straat:</td><td>'+ data.results[i].address.street +'</td></tr><tr class="tr_content"><td>Postcode:</td><td>'+ data.results[i].address.zipcode +'</td></tr><tr class="tr_content"><td>Plaats:</td><td>'+ data.results[i].address.city +'</td></tr><tr class="tr_content"><td>Telefoon:</td><td><a href="tel:'+ data.results[i].telephone +'">'+ data.results[i].telephone +'</a></td></tr></table>');
				}
			}
			$("#foundRestaurants").html("");
			$("#foundRestaurants").append(items.join(""));
	}).fail(function() {
		$("#foundRestaurants").html("<p>Controleer uw internet verbinding. Er kan geen data worden opgehaald. Mits uw internet verbinding stabiel is kan het zijn dat we momenteel geen gegevens op kunnen halen. Probeer het later nog eens.</p>")
	});
}

function loadExtraInfo(venuesId) {
	$(".insertExtraInfo").html("<p>Data wordt geladen..</p>");
	if ($(document).width() > 750) {
		
	}else {
		$.mobile.changePage("#restaurantExtraInfo", { reverse: false, transition: 'slide'});
	}
	$.getJSON("https://api.eet.nu/venues/" + venuesId
	).done(function(data){
		//items.add('Naam: '+ String(data.results[i].name) +' <br />');
		$(".insertExtraInfo").html("");
		$(".tabletView").html("");
		var dataDescription = data.description;
		if (dataDescription === null) { dataDescription = "Geen informatie beschikbaar."; }
		var showImage = data.images.cropped;
		if (showImage === null) {
			showImage = "";
		}else { showImage = '<tr class="tr_content"><td colspan="2"><img src="'+data.images.cropped+'" /></td></tr>'; }
			// mobile view
			$(".tabletView").html('<table width="100%"><tr class="tr_header"><td colspan="2">'+data.name+'</td></tr>'+showImage+'<tr class="tr_header"><td colspan="2">Beschrijving</td></tr><tr class="tr_content"><td colspan="2">'+dataDescription+'</td></tr></table>');
			 $("html, body").animate({ scrollTop: 0 }, "slow");
			$(".insertExtraInfo").html('<table width="100%"><tr class="tr_header"><td colspan="2">'+data.name+'</td></tr>'+showImage+'<tr class="tr_header"><td colspan="2">Beschrijving</td></tr><tr class="tr_content"><td colspan="2">'+dataDescription+'</td></tr></table>');
	}).fail(function() {
		$(".insertExtraInfo").html("<p>Controleer uw internet verbinding. Er kan geen data worden opgehaald. Mits uw internet verbinding stabiel is kan het zijn dat we momenteel geen gegevens op kunnen halen. Probeer het later nog eens.</p>")
	});
}

function getStars(setStars) {
	var rating = '';
	var setRating = setStars;
	for(c = 0; c < 5; c++) {
		if (setRating >= 2) {
			rating += '<span class="full-star"></span>';
		}else if (setRating >= 1) {
			rating += '<span class="half-star"></span>';
		}else {
			rating += '<span class="star"></span>';
		}
		setRating = (setRating - 2);
	}
	rating += '&nbsp;('+(setStars)+')';
	return rating;
}

function onSuccessGeo (position)
 {
    var distLat = position.coords.latitude;
    var distLon = position.coords.longitude;
    var distance = $("#kilometers").val();
    var sortedBy = window.localStorage.getObject("sort_by");
    distance = (distance * 1000);
   	showRestaurantsFound("https://api.eet.nu/venues?max_distance="+distance+"&geolocation="+distLat+","+distLon+"&sort_by="+sortedBy);
}

// onError Callback receives a PositionError object //
function onErrorGeo (error)
{
   $("#foundRestaurants").html("Locatie niet op kunnen vragen. Probeer het later opnieuw.");
}

function onSuccessContacts (contacts)
{
	var html = "";
	html += '<table width="100%">';
	for (var i = 0; i < contacts.length; i++)
	{
		if ($.trim(contacts[i].displayName).length !== 0 || $.trim(contacts[i].nickName).length !== 0)
		{
			var namePerson = "";
			if ($.trim(contacts[i].displayName).length !== 0) { namePerson = contacts[i].displayName; }else { namePerson = contacts[i].nickName; }
			html += '<tr class="tr_header">';
				if (contacts[i].addresses !== null) {
				 	//html += '<td colspan="2">'+ contacts[i].displayName +' <a href="http://maps.google.com/?daddr='+ contacts[i].addresses[0].streetAddress + ' ' + contacts[i].addresses[0].postalCode + ' ' + contacts[i].addresses[0].locality + '" class="linkNavigation">Navigeer</a></td>';
					html += '<td colspan="2">'+ namePerson +' <a href="http://maps.google.com/?daddr='+ contacts[i].addresses[0].streetAddress + '" class="linkNavigation">Navigeer</a></td>';
				}else {
					html += '<td colspan="2">'+ namePerson + '</td>';
				}
			html += '</tr>';
			html += '<tr class="tr_content">';
				html += '<td>Telefoon:</td>';
				html += '<td>';

				if (contacts[i].phoneNumbers) {
					for (var j = 0; j < contacts[i].phoneNumbers.length; j++) {
						html += '<a href="tel:'+ contacts[i].phoneNumbers[j].value + '">'+contacts[i].phoneNumbers[j].value + '</a><br />';
					}
				}else { html += 'Geen nummer beschikbaar.'; }
				
				html += '</td>';
			html += '</tr>';

			if (contacts[i].addresses !== null) {
				html += '<tr class="tr_content">';
					html += '<td>Straat:</td>';
					html += '<td>'+ contacts[i].addresses[0].streetAddress +'</td>';
				html += '</tr>';
				html += '<tr class="tr_content">';
					html += '<td>Postcode:</td>';
					html += '<td>'+ contacts[i].addresses[0].postalCode +'</td>';
				html += '</tr>';
				html += '<tr class="tr_content">';
					html += '<td>Plaats:</td>';
					html += '<td>'+ contacts[i].addresses[0].locality +'</td>';
				html += '</tr>';
			}
			contactsFound++;
		}
	}
	html += '</table>';
	if (contactsFound == 0) {
		html += 'Helaas, we hebben geen contacten kunnen vinden.';
	}
	if (html != null && contactsFound == 0 || html == "Helaas, we hebben geen contacten kunnen vinden.") {
		$(".loadContacts").html("");
	}
	$(".loadContacts").html($(".loadContacts").html() + html);
}

function onErrorContacts (contactError)
{
	$(".loadContacts").html("Helaas, de contacten konden niet worden geladen.");
}

// Modules //
document.addEventListener("deviceready", onDeviceReady, false);
document.addEventListener("backbutton", pageBack, false);

function onDeviceReady ()
{
	//contacts
	setTimeout(function()
	{
		for(var i = 0; i <= 2; i++) {
			var contactOptions      = new ContactFindOptions();
			contactOptions.multiple = true;
			var fields = ["*"];

			switch(i) {
				case 0:
					contactOptions.filter   = "restaurant";
				break;
				case 1:
					contactOptions.filter   = "snackbar";
				break;
				case 2:
					contactOptions.filter   = "chinees";
				break;
			}

			navigator.contacts.find(fields, onSuccessContacts, onErrorContacts, contactOptions);
		}

	}, 0);
}