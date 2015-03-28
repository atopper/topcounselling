/*************************************************************************
 *
 * TOP COUNSELLING CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2014 TOP COUNSELLING
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Top Counselling and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Top Counselling and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Top Counselling.
 **************************************************************************/
;

(function(window, undefined) {
    var menuNS = '.menu';
    var menuLi = menuNS + ' .list ul li';
    var menuA = menuLi + ' a';
    var contentRel = '.content';
/*
    var bookingButton = '.booking';
    var mapButton = '.address';
 */

    $( document ).ready(function() {
        $(menuA).off('click' + menuNS).on('click' + menuNS, function(event) {
            handleContentChange(event);
        });
    });

/*    $( document ).ready(function() {
        $(bookingButton).off('click' + bookingButton).on('click' + bookingButton, function(event) {
            handleContentChange(event);
        });
    });

    $( document ).ready(function() {
        $(mapButton).off('click' + mapButton).on('click' + mapButton, function(event) {
            handleContentChange(event);
        });
    });
 */

    function handleContentChange(event) {
        event.preventDefault();

        var buttonPressed = $(event.currentTarget);
        if (buttonPressed.hasClass('selected')) {
            return;
        }

        var oldContentWell;
        var contentWell = $(contentRel);

        // Handle menu change.
        var selected = $(menuLi).find('.selected');
        var oldContentClass = selected.data('content');
        if (oldContentClass != undefined) {
            oldContentWell = contentWell.find('.' + oldContentClass);
        }
        selected.removeClass('selected');

        buttonPressed.addClass('selected');

        // Handle content well
        var newContentClass = buttonPressed.data('content');

        // Find current and target height.
        var newContent = contentWell.find('.' + newContentClass);
        var curHeight = newContent.height();
        var autoHeight = newContent.css('height', 'auto').height();

        // Hide old and show new.
        oldContentWell.css('z-index',1).animate({height: '0px'}, 250).hide(250);
        newContent.css('z-index',10).height(curHeight).show().animate({height: autoHeight}, 250);
    }

})(window);

