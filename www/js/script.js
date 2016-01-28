$(function()
{
   //Init App:
   var searchTimeout;
   var idOfPreviousPage = null;
   initApp();
   var long;
   var lat;

   function initApp()
   {       
        $("#topBar").toolbar();
        watchID = navigator.geolocation.watchPosition(onSuccess);
        backButton();
        
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
            getData("restaurantsBekijken");
        });
        
        $('#zoekenInBuurt').on("tap", function(){
            getData("zoekenInBuurt");
        });
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
                        $("#backButton").html("");
                break;
                default:
                        $("#backButton").html("<a href=\"#\" id=\"pageBack\" class=\"ui-btn-left ui-btn ui-icon-back ui-btn-icon-notext ui-shadow ui-corner-all\"  data-role=\"button\" role=\"button\" style=\"border:0;\">Back</a>");
                break;
        }
   }
  
    $.wait = function(ms) {
        var defer = $.Deferred();
        setTimeout(function() { defer.resolve(); }, ms);
        return defer;
    };
   
   $("#backButton").on('tap',function()
   {
       setTimeout(function (){

            goBack();

         }, 500);
   });
   
   function goBack()
   {
       switch($.mobile.activePage.attr("id")) 
       {
            case "index":
                ClearListView();
                $("#backButton").html("");
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
	if (idOfPreviousPage == "index") {
		$("#backButton").html("");
	}
	backButton();
   }
   
   function getData(Type)
   {
       $.mobile.loading('show');
        var url = null;
        ClearListView();
        //showLoading();
        
        if (Type === "restaurantsBekijken")
        {
            url = "https://api.eet.nu/venues?tags=lekker-top100%2Cromantic";
        }
        else if (Type === "zoekenInBuurt")
        {
            watchID = navigator.geolocation.watchPosition(onSuccess);

            url = "https://api.eet.nu/venues?max_distance=5000&geolocation="+lat+","+long;
        }
       
       console.log(url);
       
       $.get( url, function( data ) 
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
                    html += "<img class='thumb' src='img/notfound.png' alt='' title=''>";
                }
                
                var rating = "";
                if (value.rating != null)
                {
                    rating = "&nbsp; ("+(value.rating)+")";
                }
                
                html += "<strong class='title'>"+value.name + " " + rating + "</strong><span>Categorie: "+value.category+"</span></a></li>";

                $('.list-view').append(html);
            });
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

            $.get( "https://api.eet.nu/venues?query="+query, function( data ) {
                    var result = data['results'];

                    $.each(result, function(key, value) {
                            var html = "<li><a href='#' vid='" + value.id + "' class='detailClick'>";
                            if(value.images.cropped[0] != null)
                            {
                                html += "<img class='thumb' src='"+value.images.cropped[0]+"' alt='' title=''>";
                            }
                            else
                            {
                                html += "<img class='thumb' src='img/notfound.png' alt='' title=''>";
                            }
                            html += "<strong class='title'>"+value.name+"</strong><span>Categorie: "+value.category+"</span></a></li>";

                        $('.list-view').append(html);
                    });
            }).done(function() {
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
                showImage = '<tr class="tr_content"><td><img src="../img/notfound.png" /></td></tr>'; 
            }else 
            { 
                showImage = '<tr class="tr_content"><td><img src="'+data.images.cropped+'" /></td></tr>'; 
            }
            
            
            var contactHTML = "<table><tr><td>Adres:</td><td>" + address.street + "</td></tr>";
            contactHTML += "<tr><td>Postcode:</td><td>" + address.zipcode + "</td></tr>";
            contactHTML += "<tr><td>Plaats:</td><td>" + address.city + "</td></tr>";
            contactHTML += "<tr><td>Land:</td><td>" + address.country + "</td></tr>";
            
            if (data.facebook_url !== null)
            {
                contactHTML += "<tr><td>Facebook:</td><td><a href='#' class='extern' uri='" + data.facebook_url + "'>" + data.facebook_url + "</a></td></tr>";
            }
            if (data.twitter !== null)
            {
                contactHTML += "<tr><td>Twitter:</td><td><a href='#' class='extern' uri='http://www.twitter.com/" + data.twitter + "'>" + data.twitter + "</a></td></tr>";
            }
            if (data.website_url !== null)
            {
                contactHTML += "<tr><td>Website:</td><td><a href='#' class='extern' uri='" + data.website_url + "'>" + data.website_url + "</a></td></tr>";
            }
            
            contactHTML += "<tr><td>telephone:</td><td>"+ data.telephone +"</td></tr>";
            contactHTML += "</table>";
            
            
            
                // mobile view
                $(".tabletView").html('<table width="100%"><tr class="tr_header"><td colspan="2">'+data.name+'</td></tr>'+showImage+'<td>Adres:</td></tr><tr class="tr_header"><td colspan="2">Beschrijving</td></tr><tr class="tr_content"><td colspan="2">'+dataDescription+'</td></tr><tr class="tr_header"><td colspan="2">Contactinformatie</td></tr></table>');
                $("html, body").animate({ scrollTop: 0 }, "slow");
                $(".insertExtraInfo").html('<table width="100%"><tr class="tr_header"><td colspan="2">'+data.name+'</td></tr>'+showImage+'<tr class="tr_header"><td colspan="2">Beschrijving</td></tr><tr class="tr_content"><td colspan="2">'+dataDescription+'</td></tr><tr class="tr_header"><td colspan="2">Contactinformatie</td></tr><tr class="tr_content"><td colspan="2">' + contactHTML +  '</td></tr></table>');
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
   
    var searchTimeout;

    $('.search input').on('keyup', function() {
            $this = $(this);
            searchTimeout = setTimeout(function() {
                    search($this.val());
            }, 2000);
    });

   function showLoading()
   {
       $.mobile.loading('show', 
        {
            defaults: true
        });
   }
   
   function ClearListView()
    {
        $('.list-view').empty();
    }
   
   function hideLoading()
   {
      $.mobile.loading('hide');
   }
   
});