if ( window.addEventListener ) {
	window.addEventListener('hashchange', on_hash_change, false);
} else if ( window.attachEvent ) {
	window.attachEvent('onhashchange', on_hash_change);
}

function get_cookie(name){
	if (document.cookie.length > 0){
		start = document.cookie.indexOf(name + '=');
		if (start != -1){
			start += name.length + 1;
			end = document.cookie.indexOf(';', start);
			if (end == -1) end = document.cookie.length;
			return unescape(document.cookie.substring(start, end));
		}
	}
	return '';
}

function randomize(url){
	if (url.indexOf('?') == -1) url += '?'; else url += '&';
	url += 'seed=' + Math.random();
	return url;
}

function hash_to_url(hash){
	var url = window.location.hash;
	url = 'index.php/' + url.substr(1);
	return url;
}

function set_page_content(selector, url, success){
	$(selector).html("<img src=\"/images/ajax-loader.gif\" />");
	url = randomize(url);
	$.ajax({
		type: "GET",
		url: url,
		success: function(data){
			$(selector).hide();
			$(selector).html(data);
			$(selector).fadeIn(250);
			if (success != void 0) success();
		},
		error: function(xhr, statusText, error){
			$(selector).html('<div class="alert"><strong>Error: ' + ' ' + error + '</strong></div>');
		}
	});
}

function access_page(url, success){
	if (url[0] == '#') url = url.substr(1);
	url = randomize(url);
	url = '/index.php/' + url;
	refresh = arguments.length == 3 && arguments[2] == false ? false : true;
	if (refresh){
		$.get(url, function(){
			set_page_content('#page_content', hash_to_url(window.location.hash), success);
		});
	}else{
		$.get(url, success);
	}
}

function load_page(url){
	window.location.hash = url;
	return false;
}

function refresh_page(){
	if (typeof refresh_flag != 'undefined'){
		clearTimeout(refresh_flag);
		delete refresh_flag;
	}
 	set_page_content('#page_content', hash_to_url(window.location.hash));
}

function on_hash_change(){
	if (typeof refresh_flag != 'undefined'){
		clearTimeout(refresh_flag);
		delete refresh_flag;
	}
	set_page_content('#page_content', hash_to_url(window.location.hash));
}

function init_framework(){
	if (window.location.hash != ''){
		set_page_content('#page_content', hash_to_url(window.location.hash));
	}else load_page('main/home');
	var priviledge = get_cookie('priviledge');
	if (priviledge == 'admin') $('#nav_admin').attr({style:"display:block"});
	else $('#nav_admin').attr({style:"display:none"});
}

function load_userinfo(){
	set_page_content('#userinfo', '/index.php/main/userinfo');
}

function login_submit(){
	$('#login_field').modal('hide');
	$('#login_form').ajaxSubmit({
		success: function login_success(responseText, stautsText){
			if (responseText == 'success'){
				load_userinfo();
				set_page_content('#page_content', hash_to_url(window.location.hash));
				var priviledge = get_cookie('priviledge');
				if (priviledge == 'admin') $('#nav_admin').attr({style:"display:block"});
				else $('#nav_admin').attr({style:"display:none"});
			} else $('#page_content').html(responseText);
		}
	});
	return false;
}

function register_submit(){
	$('#register_field').modal('hide');
	$('#register_form').ajaxSubmit({
		success: function(responseText, statusText){
			if (responseText == 'success') load_page('main/home');
			else $('#page_content').html(responseText);
		}
	});
	return false;
}

function code(){hljs.initHighlightingOnLoad();}

$(document).ready(function(){
	$('#toggle_editor').live('change', function (){
		if ($('#toggle_editor').attr("checked")){
			$('.CodeMirror').css({"visibility" : "visible", "display" : "block"});
			$('#texteditor').css({"visibility" : "hidden", "display" : "none", "zIndex" : -10000});
			editor.setValue($('#texteditor').val());
		}else{
			$('.CodeMirror').css({"visibility" : "hidden", "display" : "none"});
			$('#texteditor').css({"visibility" : "visible", "display" : "block", "zIndex" : 10000});
			editor.save();
		}
	}),
	
	$('.case').click(function(){
		var attr = "." + $(this).attr("id");
		$(this).siblings(attr).slideToggle(5);
	}),
	
	$('#navigation li a').click(function(){
		$('#navigation li').removeClass('active');
		$(this).parent().addClass('active');
	}),
	
	$('#logout').live('click', function(){
		access_page('main/logout');
	})
})

