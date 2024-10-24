/*global SelectBox, interpolate*/
// Handles related-objects functionality: lookup link for raw_id_fields
// and Add Another links.
'use strict';

function close_modal() {
    $('.modal-toggle').click()
}

{
    const $ = django.jQuery;
    let popupIndex = 0;
    const relatedWindows = [];

    function dismissChildPopups() {
        relatedWindows.forEach(function (win) {
            if (!win.closed) {
                win.dismissChildPopups();
                win.close();
            }
        });
    }


    function setPopupIndex() {
        if (document.getElementsByName("_popup").length > 0) {
            const index = window.name.lastIndexOf("__") + 2;
            popupIndex = parseInt(window.name.substring(index));
        } else {
            popupIndex = 0;
        }
    }

    function addPopupIndex(name) {
        return name + "__" + (popupIndex + 1);
    }

    function removePopupIndex(name) {
        return name.replace(new RegExp("__" + (popupIndex + 1) + "$"), '');
    }

    var getUrlParameter = function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
        return false;
    };
    // console.log(getUrlParameter('_popup'));
    let popNumber = getUrlParameter('_popup');

    function showAdminPopup(triggeringLink, name_regexp, add_popup) {
        $('#generalModal .modal-box').html(
            `<button class="btn"><span class="loading loading-spinner"></span>loading</button>`
        );
        const name = addPopupIndex(triggeringLink.id.replace(name_regexp, ''));
        const target_field_id = triggeringLink.id.replace(/add_|change_|delete_/, '');
        const href = new URL(triggeringLink.href);
        if (add_popup) {
            href.searchParams.set('_popup', 1);
        }

        $.ajax({
            url: href, // The URL of the page you're requesting
            type: 'GET', // The request method (can be GET, POST, etc.)
            success: function (response) {
                // What to do if the request is successful
                var iframe = $('<iframe>', {
                    id: `iframe_${triggeringLink.id}`,
                    frameborder: 0,
                    width: '100%',
                    height: '100%',
                    'data-target-field-id': target_field_id,
                });

                // Append the iframe to your container
                $('.generalModal .modal-box').html(iframe);

                // Write the response to the iframe's document
                var iframeDoc = iframe[0].contentDocument || iframe[0].contentWindow.document;
                iframeDoc.open();
                iframeDoc.write(response);
                iframeDoc.close();
                // You can manipulate the response or update the DOM here
            },
            error: function (error) {
                // What to do if the request fails
                console.log('Error:', error);
            }
        });


        $('.modal-toggle').click()

        return false;
    }

    function showRelatedObjectLookupPopup(triggeringLink) {
        console.log("showRelatedObjectLookupPopup")

        return showAdminPopup(triggeringLink, /^lookup_/, true);
    }

    function dismissRelatedLookupPopup(chosenId) {
        console.log("dismissRelatedLookupPopup")
        const id = $('.modal iframe').attr('data-target-field-id');
        const elem = document.getElementById(id);
        if (elem.classList.contains('vManyToManyRawIdAdminField') && elem.value) {
            elem.value += ',' + chosenId;
            document.getElementById(id).value = chosenId;
        }
        close_modal()
    }

    function showRelatedObjectPopup(triggeringLink) {
        console.log("showRelatedObjectPopup");
        return showAdminPopup(triggeringLink, /^(change|add|delete)_/, false);
    }

    function updateRelatedObjectLinks(triggeringLink) {
        console.log("updateRelatedObjectLinks");
        const $this = $(triggeringLink);

        // const siblings = $this.nextAll('.view-related, .change-related, .delete-related');
        const siblings = $this.parent().parent().find('.view-related, .change-related, .delete-related');
        console.log(siblings)

        if (!siblings.length) {
            return;
        }
        const value = $this.val();
        if (value) {
            siblings.each(function () {
                const elm = $(this);
                elm.attr('href', elm.attr('data-href-template').replace('__fk__', value));
            });
        } else {
            siblings.removeAttr('href');
        }
    }

    function dismissAddRelatedObjectPopup(newId, newRepr) {
        console.log("dismissAddRelatedObjectPopup");
        const id = $('.modal iframe').attr('data-target-field-id');
        const elem = document.getElementById(id);
        try {
            if (elem) {
                const elemName = elem.nodeName.toUpperCase();
                if (elemName === 'SELECT') {
                    elem.options[elem.options.length] = new Option(newRepr, newId, true, true);
                } else if (elemName === 'INPUT') {
                    if (elem.classList.contains('vManyToManyRawIdAdminField') && elem.value) {
                        elem.value += ',' + newId;
                    } else {
                        elem.value = newId;
                    }
                }
                // Trigger a change event to update related links if required.
                $(elem).trigger('change');
            } else {
                const toId = name + "_to";
                const o = new Option(newRepr, newId);
                SelectBox.add_to_cache(toId, o);
                SelectBox.redisplay(toId);
            }

        } catch (e) {
            console.log(e)
        }
        close_modal()
    }

    function dismissChangeRelatedObjectPopup(objId, newRepr, newId) {
        console.log("dismissChangeRelatedObjectPopup");
        try {
            const id = $('.modal iframe').attr('data-target-field-id');
            const selectsSelector = `#${id}, #${id}_from, #${id}`
            const selects = $(selectsSelector);
            selects.find('option').each(function () {
                if (this.value === objId) {
                    this.textContent = newRepr;
                    this.value = newId;
                }
            });
            selects.next().find('.select2-selection__rendered').each(function () {
                // The element can have a clear button as a child.
                // Use the lastChild to modify only the displayed value.
                this.lastChild.textContent = newRepr;
                this.title = newRepr;
            });
        } catch (e) {
            console.log(e);
        }

        close_modal()
    }

    function dismissDeleteRelatedObjectPopup(objId) {
        try {
            console.log('dismissDeleteRelatedObjectPopup')
            const id = $('.modal iframe').attr('data-target-field-id');
            const selectsSelector = interpolate('#%s, #%s_from, #%s_to', [id, id, id]);
            const selects = $(selectsSelector);
            selects.find('option').each(function () {
                if (this.value === objId) {
                    $(this).remove();
                }
            }).trigger('change');

        } catch (e) {
            console.log(e);
        }
        close_modal()
    }

    function fallbackDismissChangeRelatedObjectPopup(error) {
        console.log(error);
        $('.modal-toggle').click()
    }

    window.showRelatedObjectLookupPopup = showRelatedObjectLookupPopup;
    window.dismissRelatedLookupPopup = dismissRelatedLookupPopup;
    window.showRelatedObjectPopup = showRelatedObjectPopup;
    window.updateRelatedObjectLinks = updateRelatedObjectLinks;
    window.dismissAddRelatedObjectPopup = dismissAddRelatedObjectPopup;
    window.dismissChangeRelatedObjectPopup = dismissChangeRelatedObjectPopup;
    window.dismissDeleteRelatedObjectPopup = dismissDeleteRelatedObjectPopup;

    // Kept for backward compatibility
    window.showAddAnotherPopup = showRelatedObjectPopup;
    window.dismissAddAnotherPopup = dismissAddRelatedObjectPopup;
    window.fallbackDismissChangeRelatedObjectPopup = fallbackDismissChangeRelatedObjectPopup;


    $(document).ready(function () {
        setPopupIndex();
        $("a[data-popup-opener]").on('click', function (event) {
            event.preventDefault();
            opener.dismissRelatedLookupPopup(window, $(this).data("popup-opener"));
        });
        $('body').on('click', '.related-widget-wrapper-link[data-popup="yes"]', function (e) {
            e.preventDefault();
            if (this.href) {
                const event = $.Event('django:show-related', {href: this.href});
                $(this).trigger(event);

                if (!event.isDefaultPrevented()) {
                    showRelatedObjectPopup(this);
                }
            }
        });
        $('body').on('change', '.related-widget-wrapper select', function (e) {
            const event = $.Event('django:update-related');
            $(this).trigger(event);
            if (!event.isDefaultPrevented()) {
                updateRelatedObjectLinks(this);
            }
        });
        $('.related-widget-wrapper select').trigger('change');
        $('body').on('click', '.related-lookup', function (e) {
            e.preventDefault();
            const event = $.Event('django:lookup-related');
            $(this).trigger(event);
            if (!event.isDefaultPrevented()) {
                showRelatedObjectLookupPopup(this);
            }
        });
    });
}