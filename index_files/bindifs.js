//This function is thanks to Ben Nadel - What a lad!
//http://www.bennadel.com/blog/1771-Enable-And-Disable-jQuery-Event-Handlers-Rather-Than-Bind-And-Unbind-.htm

// This jQuery plugin creates proxied event handlers that
// consult with an additional conditional callback to see if
// the original event handler should be executed.
$.fn.bindIf = function(eventType,eventHandler,ifCondition){
	// Create a new proxy function that wraps around the
	// given bind callback.
	var proxy = function( event ){
		// Execute the IF condition callback first to see if
		// the event handler should be executed.
		if (ifCondition()){
			// Pass the event onto the original event
			// handler.
			eventHandler.apply( this, arguments );
		}
	};
	// Bind the proxy method to the target.
	this.bind( eventType, proxy );
	// Return this to keep jQuery method chaining.
	return( this );
};