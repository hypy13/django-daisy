function close_modal() {
    $('.modal-backdrop').click()
}

$('#menu-toggle').click(() => {
    let sidebar = $('#sidebar')

    if (sidebar.is(":visible")) {
        sidebar.removeClass('!block')
        sidebar.addClass('!hidden')
    } else {
        sidebar.addClass('!block')
        sidebar.removeClass('!hidden')
    }

});


// jquery toggle whole attribute
$.fn.toggleAttr = function (attr, val) {
    var test = $(this).attr(attr);
    if (test) {
        // if attrib exists with ANY value, still remove it
        $(this).removeAttr(attr);
    } else {
        $(this).attr(attr, val);
    }
    return this;
};

// jquery toggle just the attribute value
$.fn.toggleAttrVal = function (attr, val1, val2) {
    var test = $(this).attr(attr);
    if (test === val1) {
        $(this).attr(attr, val2);
        return this;
    }
    if (test === val2) {
        $(this).attr(attr, val1);
        return this;
    }
    // default to val1 if neither
    $(this).attr(attr, val1);
    return this;
};