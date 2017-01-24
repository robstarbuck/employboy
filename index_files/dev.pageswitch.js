//evalField is pertinent to the contact page. Though it may be used elsewhere
//Argument one is the working object as the element passed in since references to 'this' in the function's ajax call will refer to the XMLHttpRequest object
//Argument two determines whether the request was asynchronous
var evalField = function (obj, async) {
    var obj = $(obj);
    //Set up variables.
    var valid = 0;
    var error_msg = '';
    var field = obj.attr("name");
    var syncreturn = false;
    //Ajax call, though really Ajaj
    $.ajax({
        //Whether or not the call will be asynchronous
        async: async
        , type: 'POST', //calls a page with a php object that validates an argument with regex.
        url: "/pages/" + eb_win.data('eb_curpage') + ".html", //The elements name and value are passed in, name will be used to determine the means for validating the value. 
        data: {
            name: field
            , value: obj.attr("value")
        }
        , success: function (data) {
            //if the data is valid
            valid = data.valid;
            //if it is valid
            if (valid) {
                //set syncreturn to true, though it might not be used another if would be pointless 
                syncreturn = true;
                //If the validation has run before an error message will be present, this will be removed 
                $("#" + field + "_error").remove();
            }
            else {
                //if the value is invalid get the error returned in the data. 
                error_msg = data.errormessage;
                //if the error message doesn't already exist append it to the field.
                if (!$("#" + field + "_error").length) {
                    $("#" + field + "_label").append("<span class='error' id='" + field + "_error'>" + error_msg + "</span>");
                }
            }
        }
        , dataType: "json"
    });
    //In instances where the method $.ajax method is called synchronously return the result of the validation.
    if (!async) {
        return syncreturn;
    }
}
var pageFunctions = {
        //holder for any elements attached to functionality
        elems: '', //contact page, this must match the name of the page
        contact: function () {
            //relevant elements, used for unbinding
            pageFunctions.elems = $("form#contact,#contact input[type='text'],#contact textarea");
            //get the text inputs and the textareas 
            //When focus is lost from any of the fields fire validation 
            formelements = $("#contact input[type='text'],#contact textarea").bind('blur.contact', //When focus is lost from any of the fields fire validation. async is passed in as extra paramters to the event.
                function (e, async) {
                    //Ensure the page is in it's maximum state else do nothing
                    if (eb_win.data('eb_dispmode') == 'max') {
                        //Change the css for the parent's parent back to it's original state
                        $(this).parent().parent().removeClass("focus");
                        //Fire the evaluation method asynchronously if the async arugment was not passed in
                        if (typeof async === 'undefined') {
                            //we don't need anything returned
                            evalField($(this), true);
                        }
                        //If the async argument was passed in evalField's ajax method will fire synchronously so we can retrieve and result of the evalField
                        else {
                            return evalField($(this), false);
                        }
                    }
                }
                //On focus
            ).bind('focus.contact', function () {
                //Ensure the page is in it's maximum state else do nothing.
                if (eb_win.data('eb_dispmode') == 'max') {
                    //Change the css for the parent's parent back to it's focused state
                    $(this).parent().parent().addClass("focus");
                }
            });
            //If the contact form is submitted
            $("form#contact").bind('submit.contact', function (e) {
                //Ensure the page is in it's maximum state else do nothing.
                if (eb_win.data('eb_dispmode') == 'max') {
                    var datapass = new Array();
                    var formvalid = true;
                    var processdiv = "<div class='process' id='contact_alert'>Your message is being processed.</div>";
                    //Loop through each of the elements in the form, triggering the blur handler fires evalField
                    //Using triggerHandler actually returns the result of the function (thanks 1.4)
                    formelements.each(function (ind, elem) {
                        if (!$(elem).triggerHandler('blur', false)) {
                            //if any of the fields is invalid so too is the form
                            formvalid = false;
                        }
                    });
                    //Show that the ajax request is being processed
                    if ($("#contact_alert").length) {
                        $("#contact_alert").replaceWith(processdiv);
                    }
                    else {
                        $("#content").append(processdiv);
                    }
                    //The ajax is called regardless of whether or not the form is valid 
                    $.ajax({
                        async: true
                        , type: 'POST'
                        , url: "/pages/" + formvalid + ".html"
                        , data: $(this).serializeArray()
                        , success: function (data) {
                            //if form data was sent then empty all of the fields, I can't remember why reset didn't work here but I did try it
                            if (data.result == "1") {
                                formelements.each(function () {
                                    this.value = '';
                                })
                            }
                            //replace any message that exists otherwise create a new one
                            if ($("#contact_alert").length) {
                                $("#contact_alert").replaceWith(data.divmessage);
                            }
                            else {
                                $("#content").append(data.divmessage);
                            }
                        }
                        , dataType: "json"
                    });
                    //prevent the form from actually sending
                    e.preventDefault();
                }
            })
            return true;
        }
    }
    //The only public methods in the page, this is called and then it in turn calls any available method pertinent to the current page
var pageSwitch = function () {
    //If a previous page is registered and the page elements aren't empty then unbind any functions
    if (eb_win.data("eb_prepage") != '' && pageFunctions.elems != '') {
        pageFunctions.elems.unbind('.' + eb_win.data("eb_prepage"));
    }
    //determine the function to be called using eval and the current page
    console.log(eb_win.data('eb_curpage'));
    functioneval = eval('pageFunctions.' + eb_win.data('eb_curpage').replace('/', ''));
    //if the function exists then call it
    if (functioneval && $.isFunction(functioneval)) {
        functioneval();
    }
}