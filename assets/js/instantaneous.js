jQuery.fn.shuffleElements = function () {
	var o = $(this);
	for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};	

function config(parameter) {
	var config;
	$.ajax({
	  url: 'config.json',
	  async: false,
	  dataType: 'json',
	  success: function (data) {
	    config = data.config;
	  }
	})
	return config[parameter];
}

$(window).scroll(function() {
   if($(window).scrollTop() + $(window).height() == $(document).height()) {
	   getNext();
   }
});			

function getNext(){
	var next_url = $(".next").data('next');
	if (next_url != "") {
		pollInstagram(next_url, 0, 3);
	}
}	

function itemCount(next_url, item_count){
	$.ajax({
		method: "GET",
		url: next_url,
		dataType: "jsonp",
		jsonp: "callback",
		success: function(data) {
			$.each(data.data, function(i, item) {
				item_count++;
			});
			if(data.pagination.next_url) {
				itemCount(data.pagination.next_url, item_count);
			} else {
				$("#item_count").html(item_count).fadeIn('slow');
			}
		}
	});	
}

function pollInstagram(next_url, page_limit) {
	$.ajax({
		method: "GET",
		url: next_url,
		dataType: "jsonp",
		jsonp: "callback",
		jsonpCallback: "jsonpcallback",
		success: function(data) {
			$.each(data.data, function(i, item) {
				item_count++;
				if (item.caption != null){username = item.caption.from.username}else{username = 'Ver Foto'}
				$(".instagram ul").append("<li class='instagram-placeholder'><a target='_blank' href='" + item.link +"'><img class='instagram-image' src='" + item.images.thumbnail.url +"' /><span>"+username+"</span></a></li>");   						
			});
			if(data.pagination.next_url) {
				$(".next").data('next', data.pagination.next_url);
			} else {
				$(".next").data('next', '');
			}
			if (page_limit > 1)  {
				page_limit--;
				pollInstagram(data.pagination.next_url, page_limit);
			} else {
			
				$('body').css('background','#000');								
				var play = 0;
				$("ul[data-liffect] img").shuffleElements().each(function (i) {
					$(this).attr("style", "-webkit-animation-delay:" + i * 100 + "ms;"
							+ "-moz-animation-delay:" + i * 100 + "ms;"
							+ "-o-animation-delay:" + i * 100 + "ms;"
							+ "animation-delay:" + i * 100 + "ms;");
					play++;
					if (play == $("ul[data-liffect] img").size()) {
						$("ul[data-liffect]").addClass("play")
					}
				});						
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$("#log").val($("#log").val() + 'Error\n');
		}
	});
}

$(document).ready(function() { 

	document.title = config('hashtag');
	$("#favicon").attr("href", config('favicon'));
	$('#instalogo').html('<img src="'+config('logo_url')+'" />');
	$('.insta-tag').html('#' + config('hashtag'));	

	var item_count = 0;
	var page_limit = 3;			

	ancho = $("body").width();
	alto = $("body").height();
	
	// Fix temporal para Firefox
	
		if (alto==0) {alto=1000}
		if (ancho==0) {ancho=1200}
	
	page_limit = (Math.round((((ancho/150) * (alto/150)) / 16)))+1;
	
	pollInstagram('https://api.instagram.com/v1/tags/'+ config('hashtag') +'/media/recent?access_token='+ config('access_token') , page_limit);
	itemCount('https://api.instagram.com/v1/tags/'+ config('hashtag') +'/media/recent?access_token='+ config('access_token'), item_count);
});

