///var/www/employboy/nrw_javascript
//trigger passes in a colorscheme object to our main js file
//As well as the value from a get request to determine whether or not to hit the splash screen.
$(window).load(function(){
	var colors = {
		highlight:"rgb(255,212,0)",
		select:"rgb(0,80,160)",
		copy:"rgb(3,14,26)"
	};
		var splash = '';
	
	eb_score.ebinit(colors,splash);
})