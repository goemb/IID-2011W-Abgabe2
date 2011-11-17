/* ContactPop jQuery Plugin
 *
 * By Jon Raasch
 * http://jonraasch.com
 *
 * Copyright (c)2009 Jon Raasch. All rights reserved.
 * Released under FreeBSD License, see readme.txt
 * Do not remove the above copyright notice or text.
 *
 * For more information please visit: 
 * http://jonraasch.com/blog/contact-pop-jquery-plugin
*/


ContactPop = {
    /************ config **************/
    
    // make sure to keep the trailing comma after each of these variable definitions
    
    replaceHref : '/contact.php', // can be array or string of hrefs or nothing if you want to use jQuery selectors (below)
    
    formPhpLocation : '/Contact-Pop/contact-pop.php', // relative path to the backend contact form
    
    pathToContactPop : '/Contact-Pop', // relative path to the Contact-Pop directory
    
    contactHeadline : 'Contact Us',
    headerBgColor : '#777777', // background color of overlay panel header
    
    overlayFadeIn : 600, // overlay fade in speed (milliseconds)
    overlayFadeOut : 500, // overlay fade out speed (milliseconds)
    
    overlayEasing : '', // if you install the easing plugin (http://gsgd.co.uk/sandbox/jquery/easing/), the info goes here, example: 'easeInOutQuad'
    
    openButtonSelector : '', // set this to use jQuery selectors in addition to the hrefs - string (ex: '.contact, #contact-link')
    closeButtonSelector : '.close-overlay', // this works with any jQuery selector - string (ex: '#close-button, .close')
    
    resetFormEachTime : 0, // resets the form if the overlay is hidden and shown again
    
    fadeOverlayIE : 0, // default off - in IE 7/8 alpha transparency flashes black when ffaded
    fadeOverlayIE6 : 0, // default off - for performance
    
    
    
    /********** end config ************/
    
    obj : {},
    formFields : {},
    submitEvent : 0,
    overlayFade : 1,
    
    appendOverlay : function() {
        // append overlay and panel divs
        ContactPop.obj.overlay = jQuery('<div id="contact-pop-overlay"></div>').appendTo( jQuery('BODY') );
        
        ContactPop.obj.panelWrapper = jQuery('<div id="contact-pop-panel-wrapper"></div>').appendTo( ContactPop.obj.overlay );
        
        ContactPop.obj.panel = jQuery('<div id="contact-pop-panel"></div>').appendTo( ContactPop.obj.panelWrapper );
        
        // append panel headline
        ContactPop.obj.panelHeadline = $( '<h2 id="contact-pop-header">' + ContactPop.contactHeadline + '</h2>') . appendTo( ContactPop.obj.panel );
        
        // set panel headline background color
        if ( ContactPop.headerBgColor != '#777777' ) ContactPop.obj.panelHeadline.css( 'backgroundColor', ContactPop.headerBgColor );
        
        // append panel header close button
        ContactPop.obj.panelHeadline.append( '<a href="#" class="close-overlay">X</a></h2>' );
        
        // append form
        ContactPop.obj.form = jQuery('<form action="' + ContactPop.formPhpLocation + '" method="get" id="contact-pop-form"></div>').appendTo( ContactPop.obj.panel );
        
        // append loading graphic
        ContactPop.obj.loading = jQuery('<div id="contact-pop-loading-gif-wrapper"></div>').appendTo( ContactPop.obj.panel );
        
        ContactPop.obj.loading.append('<img src="' + ContactPop.pathToContactPop + '/img/ajax-loader.gif" alt="" id="contact-pop-loading-gif" />');
    },

    getFormContent : function() {
        // grab form html using jQuery's AJAX API
        jQuery.get( ContactPop.formPhpLocation, { 'ajaxForm' : 1 },  function(html) {                
            if ( html ) {
                ContactPop.obj.loading.fadeOut(200);
                ContactPop.obj.form.html( html );
                ContactPop.attachFormEvents();
            }
        });
    },
    
    attachFormEvents : function() {
        // close buttons
        jQuery( ContactPop.closeButtonSelector, ContactPop.obj.panel).click( function(ev) {
            ev.preventDefault();
            ContactPop.hideOverlay();
        });
        
        // attach submit event each time for IE
        if ( jQuery.browser.msie ) {
            jQuery('input.submit', ContactPop.obj.form).click( function(ev) {
                ev.preventDefault();                
                ContactPop.submitForm();
            });
        }
        // only attach submit event once for other browsers
        else if ( !ContactPop.submitEvent ) {            
            ContactPop.obj.form.submit( function(ev) {
                ev.preventDefault();                
                ContactPop.submitForm();
            });
            
            ContactPop.submitEvent = 1;
        }
    },
    
    checkOverlayFade : function() {
        if ( $.browser.msie && !ContactPop.fadeOverlayIE && !( $.browser.version < 7 && ContactPop.fadeOverlayIE6 ) ) return false;
        else return true;
    },
    
    showOverlay : function() {
        // if first time append the overlay and get the form content
        if ( typeof(ContactPop.obj.overlay) == 'undefined' ) {         
            ContactPop.appendOverlay();
            ContactPop.getFormContent();
        }
        else if ( ContactPop.resetFormEachTime ) ContactPop.getFormContent();
        
        if ( ContactPop.overlayFade ) ContactPop.obj.overlay.fadeIn( ContactPop.overlayFadeOut, ContactPop.overlayEasing );
        else ContactPop.obj.overlay.show();
    },
    
    hideOverlay : function() {
        if ( ContactPop.overlayFade ) ContactPop.obj.overlay.fadeOut( ContactPop.overlayFadeIn, ContactPop.overlayEasing );
        else ContactPop.obj.overlay.hide();
    },
    
    submitForm : function() {
        // add form fields to array
         jQuery('input, select, textarea', ContactPop.obj.form).each( function() {
            ContactPop.addFormField( jQuery(this) );
         });
         
         // set the ajaxForm post value
         ContactPop.formFields['ajaxForm'] = 1;
         
         // fade in the loading graphic
         ContactPop.obj.form.fadeOut(200);
         ContactPop.obj.loading.fadeIn(200);
         
         // post the form with jQuery's AJAX API
        jQuery.post( ContactPop.formPhpLocation, ContactPop.formFields, function(html) {                
            if ( html ) {
                ContactPop.obj.form.html( html );
                ContactPop.obj.loading.fadeOut(200);
                ContactPop.obj.form.fadeIn(200);
                
                ContactPop.attachFormEvents();
            }
          });
    },
    
    addFormField : function( $field ) {
        var fieldName = $field.attr('name');
        if ( fieldName ) ContactPop.formFields[ fieldName ] = $field.val();
    },
    
    init : function() {
        var anchorSelector = '';
        // force array
        if ( typeof( ContactPop.replaceHref ) != 'object' ) ContactPop.replaceHref = [ ContactPop.replaceHref ];
        
        // add anchor selectors
        for ( var i = 0; i < ContactPop.replaceHref.length; i++ ) {
            if ( ContactPop.replaceHref[i] ) anchorSelector += 'a[href=' + ContactPop.replaceHref[i] + '], ';
        }
        
        // add  additional jQuery selectors
        if ( ContactPop.openButtonSelector ) anchorSelector += ContactPop.openButtonSelector;
        else anchorSelector = anchorSelector.substr(0, anchorSelector.length - 2);

        // define ctas and click event
        ContactPop.obj.ctas = jQuery(anchorSelector);
        
        ContactPop.obj.ctas.click( function(ev) {
            ev.preventDefault();
            ContactPop.showOverlay();
        });
        
        // determine if fading overlay or just hide/showing
        ContactPop.overlayFade = ContactPop.checkOverlayFade();
        
        // preload overlay image - keep this in the init() function so the rest of the page loads first
        
        var overlayImg = new Image();
        if ( jQuery.browser.msie && jQuery.browser.version < 7 ) overlayImg.src = ContactPop.pathToContactPop + '/img/overlay-ie6.png';
        
        else overlayImg.src = ContactPop.pathToContactPop + '/img/overlay.png';
    }
};

jQuery(function() {
    // initiate ContactPop once the page loads
    ContactPop.init();
});