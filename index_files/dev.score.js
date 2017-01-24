//Reposition mouse relative function - hded,vded,shiftvalue,restrict must all be defined as object data
//Takes the x and y position of the mouse as arguments
$.fn.rePosition = function (xpos, ypos) {
    //hded and vded are the vertical and horizontal center of the object
    var hded = this.data('hded');
    var vded = this.data('vded');
    //How much the element will move by 
    var shiftvalue = this.data("shiftvalue");
    //How far the element can move
    var restrict = this.data("restrict");
    //The center of the window minus the half the width or height of the element
    var hcent = (eb_win.width() / 2) - hded;
    var vcent = (eb_win.height() / 2) - vded;
    //If the element is not beyond it's boundary
    if (shiftvalue > restrict) {
        //shift value is increased
        gap = shiftvalue - restrict;
        gapdiv = gap / 8;
        shiftvalue = Math.floor(shiftvalue - gapdiv);
    }
    //Calculate the amount of pixels to move by
    var lcalc = ((xpos - hcent) / shiftvalue) - (hded / shiftvalue);
    var tcalc = ((ypos - vcent) / shiftvalue) - (vded / shiftvalue);
    //Change the elements margin to give the impression of horizontal and vertical movement
    this.css('margin-left', lcalc).css('margin-top', tcalc);
    //Change the shift value so that the element can not go beyond it's boundaries 
    this.data("shiftvalue", shiftvalue);
};
//Positions graphics in the center of the screen hded,vded must be defined as object data
var aligncenter = function () {
    //get the window height and width
    var wwidth = eb_win.width();
    var wheight = eb_win.height();
    //hded and vded are the vertical and horizontal center of the object
    var hded = $(this).data('hded');
    var vded = $(this).data('vded');
    //change the physical position of the elements on the page
    $(this).css('left', (wwidth / 2) - hded).css('top', (wheight / 2) - vded);
};
//$.fn.rePosition relies on margins to move on-screen elements. This function resets those margins, reset must be defined as object data 
var resetMargins = function () {
    //Reset is the same as the original shiftvalue 
    $(this).css('margin-left', 0).css('margin-top', 0).data('shiftvalue', $(this).data('reset'));
};
//Determines the size of the current page, takes the window object as an argument
var pageSize = function (elem) {
    if (elem.width() < 800 || elem.height() < 530) {
        return false;
    }
    return true;
};
//When called, it calls pages size to determine the current size of the page and then triggers either the maximize or minimize pseudo-event
var resizePage = function () {
    if (pageSize(eb_win)) {
        eb_sels_splash.sels.body.trigger('max');
    }
    else {
        eb_sels_splash.sels.body.trigger('min');
    }
};
//Minimize function
var minimize = function () {
    //Check the global object doesn't already have a state of min(imized)
    if (eb_win.data('eb_dispmode') != 'min') {
        //Set the display mode to min(imized)
        eb_win.data('eb_dispmode', 'min');
        //Hides the effigy (face) image for IE. Other browsers hide the effi as a result of the css change below 
        eb_sels_splash.sels.effi.hide();
        //Remove the id from the body which will result in a change in the css
        eb_sels_splash.sels.body.removeAttr("id");
        //Deactivate jScrollPane
        eb_sels_main.sels.pane.jScrollPaneRemove();
        //Give the #pane element a display-style of block, this fixes an ie display problem 
        eb_sels_main.sels.pane.css('display', 'block');
    }
};
//Maximize function
var maximize = function () {
    //Check the global object doesn't already have a state of max(imized)
    if (eb_win.data('eb_dispmode') != 'max') {
        //Set the display mode to max(imized) 
        eb_win.data('eb_dispmode', 'max');
        //Displays the effigy (face) image for IE. Other browsers show the effi as a result of the css change below 
        eb_sels_splash.sels.effi.show();
        //Add the id 'max' to the body which will result in a change in the css
        eb_sels_splash.sels.body.attr("id", "max");
        //Activate jScrollPane
        eb_sels_main.sels.pane.jScrollPane();
    }
    //Center both the effigy image and the box container
    eb_sels_splash.sels.effi.trigger('pageadjust');
    eb_sels_main.sels.boxfull.trigger('pageadjust');
};
var loadContent = function (obj, e) {
    //Get the href of the element
    var relpage = obj.attr("href");
    //If a page isn't in the process of being loaded
    if (!eb_win.data('eb_propage')) {
        //If we're not already displaying the page
        if (eb_win.data("eb_curpage") != relpage) {
            //Show that the page is processing a request
            eb_win.data('eb_propage', true);
            //Access the php file which'll return the body content from a html snippet. The same snippet is used when accessing the page without js.
            //Load content to the pane object, passes in the event object
            eb_sels_main.sels.pane.load('/pages' + relpage + '.html', '', function () {
                //no that the page is loaded we can set the previous page
                eb_win.data("eb_prepage", eb_win.data("eb_curpage"));
                //set the forms action, this is incase we switch to dormant js
                $("form").attr("action", relpage).attr("id", relpage);
                //Change the current page
                eb_win.data("eb_curpage", relpage);
                //Change the page's title
                document.title = "Employboy/" + relpage;
                //Call the jScrollPane function as the size of the content in the pane will have changed the scrollbars will need readjusting. 
                eb_sels_main.sels.pane.jScrollPane();
                //Access the php file which'll return the footer content from a html snippet. The same snippet is used when accessing the page without js.
                eb_sels_main.sels.ftcon.load('/pages/footer' + relpage + '.html');
                //pageSwitch returns any javascript that's specific to the page and unbinds any that isn't
                pageSwitch();
                //remove the selected class from any of the menu items and add one for the new page
                eb_sels_main.sels.menua.removeClass('selected');
                obj.addClass('selected');
                //Show that the page is no longer processing
                eb_win.data('eb_propage', false);
            });
        }
    }
    //Prevent the event, namely page call in the href.
    e.preventDefault();
};
//Create a cookie using the cookie plugin
var createCookie = function () {
    $.cookie('eb_skipsplash', true, {
        expires: 1
        , path: '/'
        , domain: 'employboy.com'
        , secure: false
    });
};
//This function creates (almost) all of the pages jquery selctors and caches them in the global object
var eb_selectors = function () {
    var eb_setup_obj = {
            sels: {
                body: $("body")
                , effi: $("#effi")
                , effihold: $("#effihold")
                , effigraphics: $("#effihold,#effi")
            }
            , eb_main: function () {
                var eb_main_obj = {
                        sels: {
                            boxfull: $("#boxfull")
                            , boxscn: $("#boxscn")
                            , pane: $('#pane')
                            , menuhold: $('#menuhold')
                            , menua: $('#menu a')
                            , footmenu: $("#footmenu")
                            , ftcon: $("#ftcon")
                            , paneind: $("#paneind")
                            , pngimages: $("#boxscn,#top,#ftrndtp,#ftrndbt,#btm")
                        }
                    }
                    //After setting up the selectors set up the data that elements will need for page alignment. 
                eb_main_obj.sels.boxscn.data('width', 700);
                eb_main_obj.sels.boxfull.data('hded', eb_main_obj.sels.boxfull.width() / 2).data('vded', eb_main_obj.sels.boxfull.height() / 2);
                return eb_main_obj;
            }
        }
        //After setting up the selectors set up the data that elements will need for page alignment. 
    eb_setup_obj.sels.effihold.data("shiftvalue", 10000).data("reset", 10000).data("restrict", 25).data("hded", eb_setup_obj.sels.effihold.width() / 2).data("vded", eb_setup_obj.sels.effihold.height() / 2);
    eb_setup_obj.sels.effi.data("shiftvalue", 10000).data("reset", 10000).data("restrict", 15).data("hded", eb_setup_obj.sels.effi.width() / 2).data("vded", eb_setup_obj.sels.effi.height() / 2);
    return eb_setup_obj;
};
//This is the step through library for all the pages pseudo-events.
var eb_score = {
    //mylib.ebinit is called from the trigger file.
    ebinit: function (argcolor, argsplash) {
        //the window object is used as a global cache for selectors and data
        eb_win = $(window).data('eb_colors', argcolor).data('eb_splashreq', argsplash).data('eb_splashed', false).data('eb_skip', $.cookie('eb_skipsplash')).data('eb_curpage', $("form").attr("id")).data('eb_prepage', '').data('eb_dispmode', '').data('eb_scroll', false).data('eb_propage', false);
        //Create the main selectors that will be used throughout the score
        eb_sels_splash = new eb_selectors();
        //If the page is set to skip the slash then a argument in the url can overwrite this, the value is negated in order that we don't need another variable
        if (eb_win.data('eb_splashreq') !== '') {
            if (eb_win.data('eb_splashreq') == 'true') {
                eb_win.data('eb_skip', true);
            }
            else if (eb_win.data('eb_splashreq') == 'false') {
                eb_win.data('eb_skip', false);
            }
        }
        //Give the body an id of max, even if the page is too small so as to be using the relevant css.
        eb_sels_splash.sels.body.attr("id", "max");
        //Skip to the main page if the skip argument is true or if the page is too small to display the splash screen
        if (eb_win.data('eb_skip') || !pageSize(eb_win)) {
            return eb_score.mainpage.ebinit()
        }
        else {
            //Otherwise we'll receive the splash screen in the splash lib
            return eb_score.splash.ebinit()
        }
    }, //Splash screen
    splash: {
        ebinit: function () {
            //Indicates that we've met with the splash screen
            eb_win.data('eb_splashed', true);
            //Add the class 'splash' to the body, this is in order to return the relevant css.
            eb_sels_splash.sels.body.addClass("splash");
            //When the mouse is within the effigy change the color of the background holder.
            eb_sels_splash.sels.effi.mouseenter(function () {
                    //gwin.classCols.highlight is passed in from the trigger in the colors object.
                    eb_sels_splash.sels.effihold.stop().animate({
                        backgroundColor: eb_win.data('eb_colors').highlight
                    }, 300)
                }
                //Revert the color of the holder on mouseleave
            ).mouseleave(function () {
                eb_sels_splash.sels.effihold.stop().animate({
                    backgroundColor: eb_win.data('eb_colors').select
                }, 300)
            });
            // ie only interprits mouse movement on the document and not the window
            $(document).bind("mousemove", function (e) {
                // Function triggered on elements so it doesn't to be explicit about the elements, ie - 'this' can be used.
                // Functions must be fired seperately as the objects contain different data.
                eb_sels_splash.sels.effihold.rePosition(e.pageX, e.pageY);
                eb_sels_splash.sels.effi.rePosition(e.pageX, e.pageY);
            });
            //bind any the pseudo-event 'pageadjust' to our graphics and trigger it, fix the pngs for display in ie.
            eb_sels_splash.sels.effigraphics.bind('pageadjust', resetMargins).bind('pageadjust', aligncenter).trigger("pageadjust").ifixpng();
            // bind any resizes on the window and trigger the pseudo-event pageadjust.
            eb_win.bind('resize', function () {
                eb_sels_splash.sels.effigraphics.trigger('pageadjust');
            });
            // If the effigy (face) is clicked initialise the main page.
            eb_sels_splash.sels.effi.bind('click', eb_score.mainpage.ebinit);
            return true;
        }
    }, //Main page
    mainpage: {
        ebinit: function () {
            //Setup our mainpage - selectors and element data
            eb_sels_main = eb_sels_splash.eb_main();
            //Remove the cursor css for the effigy so that it no longer appears clickable
            eb_sels_splash.sels.effi.css('cursor', 'default');
            //Remove the effigy hold graphic.
            eb_sels_splash.sels.effihold.remove();
            //Fix the pngs in the page for display in ie.
            eb_sels_main.sels.pngimages.ifixpng();
            //Bind the pseudo-events min and max to body.
            eb_sels_splash.sels.body.bind('min', minimize).bind('max', maximize);
            //This is a rather clumsy way of accessing methods in the scroll plugin when clicking on the down button just below the content
            //I'm leaving it uncommmented since the jscroll file is also uncommented
            eb_sels_main.sels.paneind.bind('scrollchange', function (e, display) {
                eb_win.data('eb_scroll', display);
                if (display) {
                    $(this).addClass("active");
                }
                else {
                    $(this).removeClass();
                }
            }).bindIf("mousedown", function () {
                $(".jScrollArrowDown").trigger('mousedown');
            }, function () {
                return eb_win.data('eb_scroll')
            }).bindIf("mouseup", function () {
                $(".jScrollArrowDown").trigger('mouseup');
            }, function () {
                return eb_win.data('eb_scroll')
            });
            window.onpopstate = function (event) {
                console.log("pop state");
                if ('state' in event && event.state !== null) {
                    console.log(event.state.state);
                    //console.log("hit this initial");
                    $("#link_" + event.state.state).trigger("click", {
                        log: false
                    });
                };
            };
            //Add the loading arrow to the menu whenever an ajax request is processing, it's floated right.
            $(document).ajaxStart(function () {
                if (!$("#loadhold").length) {
                    eb_sels_main.sels.menuhold.prepend("<div id='loadhold'></div>");
                }
                //When the data's returned fade the loading arrow out and remove it.
            }).ajaxComplete(function () {
                $("#loadhold").fadeOut('slow', function () {
                    $(this).remove()
                });
            });
            //Unbind the original pageadjust which affected the graphics and rebind the pseudo-event to trigger min and max on window resize.
            eb_win.unbind('pageadjust').bind('resize', resizePage);
            //Use Ben Nadal's bindif. If the page is in a state of maximised we fire our loadContent function which will prevent the default click event. 
            eb_sels_main.sels.menua.bindIf("click", function (e, args) {
                loadContent($(this), e);
                //Push states go! If there's no 
                if (!!(window.history && history.pushState)) {
                    //console.log($(this).attr("href"));
                    var log = true;
                    if (typeof args != 'undefined') {
                        log = args.log;
                    };
                    if (log) {
                        //console.log(log,"push");
                        history.pushState({
                            state: $(this).attr("href")
                        }, false, $(this).attr("href"));
                    }
                }
            }, function (e) {
                return (eb_win.data('eb_dispmode') == 'max');
            });
            //If this page size is large enough and it seems the page is being called for the first time then display the resultant animation from the effigy being clicked
            if (!eb_win.data('eb_skip') && pageSize(eb_win)) {
                //We can now stop monitoring the document for mousemovements
                $(document).unbind();
                //Unbind any superflous handlers on our graphics, they are now redundant
                eb_sels_splash.sels.effigraphics.unbind();
                //Bind the diplay box to any page resizes in order to keep it center of screen
                eb_sels_main.sels.boxfull.bind('pageadjust', aligncenter);
                // Stop any currently running animtation on the effigy, bind page adjustments to keep it center of screen and animate the margins, to give it the appearance of movement to the left. 
                eb_sels_splash.sels.effi.stop().bind('pageadjust', aligncenter).animate({
                        marginLeft: -230
                        , marginTop: 0
                    }, 400, //When the effi animation completes and fires it's callback 
                    function () {
                        //remove splash class - only after the animation
                        eb_sels_splash.sels.body.removeClass();
                        //fire the scroll pane, despite the box still not being visible. 
                        eb_sels_main.sels.pane.jScrollPane();
                        //Align the display box to the center of the page. 
                        eb_sels_main.sels.boxfull.trigger('pageadjust');
                        // Set Boxscn to have a width of 0 before animating it to the width set in it's data
                        eb_sels_main.sels.boxscn.width(0).animate({
                                width: eb_sels_main.sels.boxscn.data('width')
                            }, 400, //When the boxscn animation completes and fires it's callback, a callback within a callback - reminds me of inception
                            function () {
                                //The boxscn has style properties attached from the animation which aren't to be kept.
                                //ifixpng must be reapplied for ie as the properties it applies live in the style attribute
                                $(this).removeAttr("style").ifixpng();
                                //Set the global object's state to max
                                eb_win.data('eb_dispmode', 'max');
                                //pageSwitch returns any javascript that's specific to the page and unbinds any that isn't
                                pageSwitch(false);
                                //Create a cookie to say we got this far.
                                createCookie();
                            });
                    });
            }
            else {
                //If the splash step was never reached
                if (eb_win.data('eb_splashed')) {
                    //We can now stop monitoring the document for mousemovements
                    $(document).unbind();
                    //Remove the splash class so as to be using the relevant css.
                    eb_sels_splash.sels.body.removeClass();
                    //Unbind any superflous handlers on our graphics, they are now redundant.
                    eb_sels_splash.sels.effigraphics.unbind();
                }
                else {
                    //If we never hit the splash then the effigy png will need sorting for ie.
                    eb_sels_splash.sels.effi.ifixpng();
                }
                //Change the margin of the effigy so as to appear to the left of our display box, bind the page adjust to keep it centered.
                eb_sels_splash.sels.effi.css('margin-left', -230).bind('pageadjust', aligncenter);
                //Bind the page adjust to the display box to keep it centered.
                eb_sels_main.sels.boxfull.bind('pageadjust', aligncenter);
                //Trigger a resize, this will determine which mode the page displays in depending on the window size (min,max).
                eb_win.trigger('resize');
                //pageSwitch returns any javascript that's specific to the page and unbinds any that isn't
                pageSwitch(false);
                //Create a cookie to say we got this far.
                createCookie();
            }
            return true;
        }
    }
}