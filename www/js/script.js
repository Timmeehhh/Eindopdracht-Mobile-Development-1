$(function()
{
   //Init App:
   var searchTimeout;
   var idOfPreviousPage = null;
   initApp();
   var long;
   var lat;
   var VenuesURL;
    var searchTimeout;

   function initApp()
   {       
        $("#topBar").toolbar();
        watchID = navigator.geolocation.watchPosition(onSuccess);
        backButton();
        loadLocalStorage();

        $("#menuBtn").on("tap",function()
        {
            if ($.mobile.activePage.attr("id") !== "menu")
            {
                    idOfPreviousPage = $.mobile.activePage.attr("id");
                    $.mobile.changePage("#menu", {transition: 'slidedown'});
                    backButton();
            }
            else
            {
                    $.mobile.changePage("#" + idOfPreviousPage, {transition: 'slideup'});
                    idOfPreviousPage = null;
            }
	});
        
        $('#restaurantsBekijken').on("tap", function(){
            ClearSearchBar();
            getData("restaurantsBekijken");
        });
        
        $('#zoekenInBuurt').on("tap", function(){
            ClearSearchBar();
            getData("zoekenInBuurt");
        });
   }

   function loadLocalStorage()
  {   
    $("#sort_by").val(window.localStorage.getItem("preferredURL"));
    processStorageData();
  }
   
   function processStorageData()
   {
       if (window.localStorage.getItem("preferredURL") == "Top 100 Algemeen")
       {
           VenuesURL = "https://api.eet.nu/venues?tags=lekker-top100";
       }
       else if (window.localStorage.getItem("preferredURL") == "Top 100 Romantisch")
       {
           VenuesURL = "https://api.eet.nu/venues?tags=lekker-top100%2Cromantic";
       }
       
       else if (window.localStorage.getItem("preferredURL") == "Top 100 Franse keuken")
       {
           VenuesURL = "https://api.eet.nu/venues?tags=lekker-top100%2Cfrench";
       }
       else
       {
           VenuesURL = "https://api.eet.nu/venues?tags=lekker-top100";
       }
   }
   
   
   function pageBack()
    {
	switch($.mobile.activePage.attr("id")) 
        {
            case "index":
                    $("#backButton").html("");
                    navigator.app.exitApp(); // exit app.
            break;
            case "restaurantOnLocationFound":
                    $.mobile.changePage("#restaurantOnLocation", { reverse: true, transition: 'slide'});
            break;
            case "menu":
                    $.mobile.changePage("#" + idOfPreviousPage, {transition: 'slideup'});
            break;
            case "restaurantExtraInfo":
                    $.mobile.changePage("#restaurantsBekijken", { reverse: true, transition: 'slide'});
            break;
            default:
                    $.mobile.changePage("#index", { reverse: true, transition: 'slide'});
            break;
		}
		if (idOfPreviousPage == "index") 
		{
			$("#backButton").html("");
		}
		backButton();
    }
   
   $(window).on("swiperight", function(e)
	{
		if ($.mobile.activePage.attr("id") !== "menu")
		{
 			pageBack();
 		}
    });
   
   function backButton()
   {   
        switch($.mobile.activePage.attr("id")) 
        {
                case "index":
                        $("#backButton").html("<a href=\"#\" id=\"settingsPage\" class=\"ui-btn-left ui-btn ui-icon-gear ui-btn-icon-notext ui-shadow ui-corner-all\"  data-role=\"button\" role=\"button\" style=\"border:0;\">Back</a>");
                break;
                default:
                        $("#backButton").html("<a href=\"#\" id=\"pageBack\" class=\"ui-btn-left ui-btn ui-icon-back ui-btn-icon-notext ui-shadow ui-corner-all\"  data-role=\"button\" role=\"button\" style=\"border:0;\">Back</a>");
                break;
        }
   }
   
   $("#backButton").on('tap',function()
   {
        setTimeout(function ()
        {
            goBack();
        }, 500);
   });

   function saveSettings()
  {
    window.localStorage.setItem("preferredURL", $("#sort_by").val());  
    
    loadLocalStorage();

    $.mobile.changePage("#index", {transition: 'slidedown'});
	$("#backButton").html("<a href=\"#\" id=\"settingsPage\" class=\"ui-btn-left ui-btn ui-icon-gear ui-btn-icon-notext ui-shadow ui-corner-all\"  data-role=\"button\" role=\"button\" style=\"border:0;\">Back</a>");
  };

    $("#changeSettings").on('tap', function (){ saveSettings(); });
   
   function goBack()
   {
       switch($.mobile.activePage.attr("id")) 
       {
            case "index":
                ClearListView();
                $.mobile.changePage("#settings", {transition: 'slideup'});
                navigator.app.exitApp(); // exit app.
            break;
            case "restaurantOnLocationFound":
                ClearListView();
                $.mobile.changePage("#restaurantOnLocation", { reverse: true, transition: 'slide'});
            break;
            case "menu":
                ClearListView();
                $.mobile.changePage("#" + idOfPreviousPage, {transition: 'slideup'});
            break;
            case "restaurantExtraInfo":
                $.mobile.changePage("#restaurantsBekijken", { reverse: true, transition: 'slide'});
            break;
            default:
                ClearListView();
                $.mobile.changePage("#index", { reverse: true, transition: 'slide'});
            break;
		}
		if (idOfPreviousPage == "index") 
		{
			$("#backButton").html("");
		}
		backButton();
   }
   
   function processData(result)
   {
	   $.each(result, function(key, value) 
        {
                var html = "<li><a href='#' vid='" + value.id + "' class='detailClick'>";
                if(value.images.cropped[0] != null)
                {
                    html += "<img class='thumb' src='"+value.images.cropped[0]+"' alt='' title=''>";
                }
                else
                {
                    html += "<img class='thumb' src='css/images/notfound.png' alt='' title=''>";
                }
                
                var rating = "";
                if (value.rating != null)
                {
                    rating = "&nbsp; ("+(value.rating)+")";
                }
                
                html += "<strong class='title'>"+value.name + " " + rating + "</strong><span>Categorie: "+value.category+"</span></a></li>";	
                $('.list-view').append(html);
            });
   }
   
   function processData1(result)
   {
	   $.each(result, function( index, value ) {
		alert( index + ": " + value );
		});
	
	}
   
   function getData(Type)
   {
        var url = null;
        ClearListView();
        showLoading();
        
        if (Type === "restaurantsBekijken")
        {
            url = VenuesURL;
			var d1 = new Date();
			if (window.localStorage.getItem("preferredURL") == "Top 100 Algemeen")
		    {
				var d2 = new Date(window.localStorage.getItem("AlgemeenExpiration"));
			    if (window.localStorage.getItem("AlgemeenData") != null && d2 > d1)
				{
					processData(jQuery.parseJSON(window.localStorage.getItem("AlgemeenData")));
					hideLoading();
					return;
				}
		    }
		    else if (window.localStorage.getItem("preferredURL") == "Top 100 Romantisch")
		    {
				var d2 = new Date(window.localStorage.getItem("RomantischExpiration"));
			    if (window.localStorage.getItem("RomantischData") != null && d2 > d1)
				{
					processData(jQuery.parseJSON(window.localStorage.getItem("RomantischData")));
					hideLoading();
					return;
				}
		    }
		   
		    else if (window.localStorage.getItem("preferredURL") == "Top 100 Franse keuken")
		    {
				var d2 = new Date(window.localStorage.getItem("FransExpiration"));
			    if (window.localStorage.getItem("FransData") != null && d2 > d1)
				{
					processData(jQuery.parseJSON(window.localStorage.getItem("FransData")));
					hideLoading();
					return;
				}
		    }
        }
        else if (Type === "zoekenInBuurt")
        {
            watchID = navigator.geolocation.watchPosition(onSuccess);

            url = "https://api.eet.nu/venues?max_distance=5000&geolocation="+lat+","+long;
        }
       
       
       $.get( url, function( data ) 
       {
            var result = data['results'];
			
			var d = new Date();
			d.setDate(d.getDate() + 1);

			if (window.localStorage.getItem("preferredURL") == "Top 100 Algemeen")
		    {
			   window.localStorage.setItem("AlgemeenData", JSON.stringify(result));  
			   window.localStorage.setItem("AlgemeenExpiration", d);
		    }
		    else if (window.localStorage.getItem("preferredURL") == "Top 100 Romantisch")
		    {
			   window.localStorage.setItem("RomantischData", JSON.stringify(result));  
			   window.localStorage.setItem("RomantischExpiration", d);
		    }
		   
		    else if (window.localStorage.getItem("preferredURL") == "Top 100 Franse keuken")
		    {
			   window.localStorage.setItem("FransData", JSON.stringify(result));  
			   window.localStorage.setItem("FransExpiration", d);
		    }


            processData(result);
			
		}).done(function() 
        {
            hideLoading();
		});
   }
   
   function onSuccess(position) 
   {
       long = position.coords.longitude;
       lat = position.coords.latitude;
   }
   
   function search(query)
   {
       if (query === null || query === "")
       {
           getData("restaurantsBekijken");
       }
       else
       {
            ClearListView();
            showLoading();

            $.get( "https://api.eet.nu/venues?query="+query, function( data ) 
			{
                var result = data['results'];

                $.each(result, function(key, value) 
				{
					var html = "<li><a href='#' vid='" + value.id + "' class='detailClick'>";
					if(value.images.cropped[0] != null)
					{
						html += "<img class='thumb' src='"+value.images.cropped[0]+"' alt='' title=''>";
					}
					else
					{
						html += "<img class='thumb' src='css/images/notfound.png' alt='' title=''>";
					}
					html += "<strong class='title'>"+value.name+"</strong><span>Categorie: "+value.category+"</span></a></li>";

                    $('.list-view').append(html);
                });
            }).done(function() 
			{
                    hideLoading();
            });
       }
   }
   
   $('.list-view').on('tap', '.detailClick', function()
   {
        $.mobile.changePage("#restaurantExtraInfo", { reverse: false, transition: 'slide'});
        showLoading();
        $.get( "https://api.eet.nu/venues/"+$(this).attr('vid'), function( data ) 
        {
            var address = data['address'];
            var dataDescription = data.description;
            var showImage = data.images.cropped;
            if (dataDescription === null)
            { 
                dataDescription = "Geen informatie beschikbaar."; 
            }
            
            var dirtyFix = "-" + showImage + "-";
            
            if (dirtyFix == "--")
            {
                showImage = '<tr class="tr_content"><td><i class="sprite sprite-notfound"></i></td></tr>'; 
            }else 
            { 
                showImage = '<tr class="tr_content"><td><img src="'+data.images.cropped+'" class="detailImage" /></td></tr>'; 
            }
            
            var contactHTML = "<table><tr><td>Adres:</td><td>" + address.street + "</td></tr>";
            contactHTML += "<tr><td>Postcode:</td><td>" + address.zipcode + "</td></tr>";
            contactHTML += "<tr><td>Plaats:</td><td>" + address.city + "</td></tr>";
            contactHTML += "<tr><td>Land:</td><td>" + address.country + "</td></tr>";
            
            if (data.facebook_url !== null)
            {
                contactHTML += "<tr><td>Facebook:</td><td><a href='#' class='extern' uri='" + data.facebook_url + "'>Klik hier om naar facebook te gaan</a></td></tr>";
            }
            if (data.twitter !== null)
            {
                contactHTML += "<tr><td>Twitter:</td><td><a href='#' class='extern' uri='http://www.twitter.com/" + data.twitter + "'>Klik hier om naar twitter te gaan</a></td></tr>";
            }
            if (data.website_url !== null)
            {
                contactHTML += "<tr><td>Website:</td><td><a href='#' class='extern' uri='" + data.website_url + "'>Klik hier om de site te openen</a></td></tr>";
            }
            
            contactHTML += "<tr><td>telephone:</td><td>"+ data.telephone +"</td></tr>";
            contactHTML += "</table>";
            
			// mobile view
			$(".tabletView").html('<table width="100%"><tr class="tr_header"><td colspan="2">'+data.name+'</td></tr>'+showImage+'<td>Adres:</td></tr><tr class="tr_header"><td colspan="2">Beschrijving</td></tr><tr class="tr_content" id="description"><td colspan="2">'+dataDescription+'</td></tr><tr class="tr_header"><td colspan="2">Contactinformatie</td></tr></table>');
			$("html, body").animate({ scrollTop: 0 }, "slow");
			$(".insertExtraInfo").html('<table id="detailTable"><tr class="tr_header"><td colspan="2">'+data.name+'</td></tr>'+showImage+'<tr class="tr_header"><td colspan="2">Beschrijving</td></tr><tr class="tr_content" id="description"><td colspan="2">'+dataDescription+'</td></tr><tr class="tr_header"><td colspan="2">Contactinformatie</td></tr><tr class="tr_content"><td colspan="2">' + contactHTML +  '</td></tr><tr class="tr_header"><td colspan="2">Navigeer naar dit restaurant</td></tr><tr class="tr_content"><td colspan="2"><a href="#" class="extern" uri="http://maps.apple.com/?q=' + address.street + ', ' + address.zipcode + ' ' +  address.city + '">Klik hier om te navigeren</a></tr></table>');
			hideLoading();
        });
        
   });
   
   $('.insertExtraInfo').on('tap', '.extern', function()
   {
       window.open($(this).attr('uri'), "_system");
   });
   
   
   $('#webWebsite').on('tap',function()
   {
        window.open("http://www.eet.nu", "_system");
   });
	
    $('#mailButton').on('tap',function()
    {
	   window.location.href = "mailto:support@eetnu.zendesk.com?body=Uw%20vraag%20of%20opmerking."; 
    });
	
    $('#callButton').on('tap',function()
    {
	window.location.href = "tel:0612345678"; 
    });
    
    $('#contactButton').on('tap',function()
    {
		var options = new ContactFindOptions();
		options.filter="Eet.nu"; 
		var fields = ["displayName", "name"];
		navigator.contacts.find(fields, onSuccessContact, onErrorContact, options);
    });
	
	function onSuccessContact(contacts) 
	{
		if (contacts.length > 0)
		{
			alert("Contacgegevens staan al in uw adresboek!");
		}
		else
		{
			var myContact = navigator.contacts.create({"displayName": "Eet.nu"});
			myContact.nickname = "Eet.nu";
			
			var phoneNumbers = [];
			phoneNumbers[0] = new ContactField('work', '0612345678', true);
			myContact.phoneNumbers = phoneNumbers;
			
			var emailAdresses = [];
			emailAdresses[0] = new ContactField('work', 'info@eet.nu', true);
			myContact.emails = emailAdresses;
			
			myContact.save();
			
			alert("Contacgegevens toegevoegd aan uw adresboek!");
		}
	};

	function onErrorContact(contactError) 
	{
		alert('onError!');
	};


    $('.search input').on('keyup', function() 
    {
        $this = $(this);
        searchTimeout = setTimeout(function() 
        {
                search($this.val());
        }, 2000);
    });

   function showLoading()
   {
    var interval = setInterval(function(){
        $.mobile.loading('show');
        clearInterval(interval);
    },1); 
   }
   
   function ClearListView()
    {
        $('.list-view').empty();
    }
    
    function ClearSearchBar()
    {
        $('#searchinput').val('');
    }

   function hideLoading()
   { 
    var interval = setInterval(function(){
        $.mobile.loading('hide');
        clearInterval(interval);
    },1); 
   }
   
});