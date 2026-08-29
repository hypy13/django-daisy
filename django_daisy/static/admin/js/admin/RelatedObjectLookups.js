/*global SelectBox, interpolate*/
// Handles related-objects functionality: lookup link for raw_id_fields
// and Add/Change/Delete Another links in DaisyUI modals via iframe src.
'use strict';

function close_modal() {
    $('#generalModal').prop('checked', false);
    $('.modal-toggle').prop('checked', false);
    $('.generalModal .modal-box iframe').attr('src', 'about:blank');
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
            popupIndex = parseInt(window.name.substring(index), 10) || 0;
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

    function getUrlParameter(sParam) {
        const sPageURL = window.location.search.substring(1);
        const sURLVariables = sPageURL.split('&');

        for (let i = 0; i < sURLVariables.length; i++) {
            const sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] === sParam) {
                return typeof sParameterName[1] === 'undefined' ? true : decodeURIComponent(sParameterName[1]);
            }
        }
        return false;
    }

    function showAdminPopup(triggeringLink, name_regexp, add_popup) {
        let _this = triggeringLink;
        if (_this && _this.nodeName !== "A") {
            _this = $(_this).closest('a')[0] || _this;
        }
        const $this = $(_this);

        let src = $this.attr("href") || $this.attr('data-href-template') || '';
        if (!src) {
            return false;
        }
        src = src.replace(/&amp;/g, '&');

        if ($this.hasClass("change-related") || $this.hasClass("view-related") || $this.hasClass("delete-related") || src.indexOf('__fk__') !== -1) {
            const selected_id = $this.closest(".related-widget-wrapper").find("select, input").val();
            if (!selected_id) {
                return false;
            }
            src = src.replace('__fk__', encodeURIComponent(selected_id));
        }

        if (add_popup || (src.indexOf('?_popup=1') === -1 && src.indexOf('&_popup=1') === -1)) {
            if (src.indexOf('?') === -1) {
                src += '?_popup=1';
            } else {
                src += '&_popup=1';
            }
        }

        const childParam = getUrlParameter('child');
        const nextChild = childParam ? (parseInt(childParam, 10) + 1) : 1;
        if (src.indexOf('child=') === -1) {
            src += '&child=' + nextChild;
        }

        const triggeringId = _this.id || '';
        let target_field_id = '';
        if (triggeringId) {
            target_field_id = triggeringId.replace(/^(lookup_|add_|change_|delete_|view_)/, '');
        } else {
            const $wrapper = $this.closest('.related-widget-wrapper');
            if ($wrapper.length) {
                const $input = $wrapper.find('select, input').first();
                if ($input.length && $input.attr('id')) {
                    target_field_id = $input.attr('id');
                }
            }
        }
        const winName = triggeringId ? triggeringId.replace(/^(lookup_|add_|change_|delete_|view_)/, '') : 'related_popup';

        if ($('#generalModal').length === 0) {
            $('body').append(`
                <input type="checkbox" id="generalModal" class="modal-toggle"/>
                <dialog class="modal generalModal">
                    <div class="modal-box w-full -mr-[10px] md:w-11/12 max-w-5xl h-[85vh] p-0 flex justify-center items-center relative overflow-hidden"></div>
                    <label class="modal-backdrop" for="generalModal">Close</label>
                </dialog>
            `);
        }

        const iframeId = triggeringId ? `iframe_${triggeringId}` : 'iframe_general_popup';

        const modalContent = `
            <div class="iframe-container relative w-full h-full flex flex-col">
                <div class="iframe-loading absolute inset-0 flex justify-center items-center bg-base-100/70 z-10">
                    <button class="btn btn-ghost pointer-events-none">
                        <span class="loading loading-spinner"></span>
                        <span>Loading...</span>
                    </button>
                </div>
                <iframe
                    id="${iframeId}"
                    name="${winName}"
                    win-name="${winName}"
                    src="${src}"
                    frameborder="0"
                    style="width: 100%; height: 100%; border: none; border-radius: 10px;"
                    class="w-full h-full border-0 rounded-box"
                    data-target-field-id="${target_field_id}">
                </iframe>
            </div>
        `;

        $('.generalModal .modal-box').html(modalContent);

        const $iframe = $(`#${iframeId}`);
        $iframe.on('load', function () {
            $('.generalModal .iframe-loading').fadeOut(200);
        });

        setTimeout(function () {
            $('.generalModal .iframe-loading').fadeOut(200);
        }, 1500);

        $this.attr('data-iframe', src);
        $('#generalModal').prop('checked', true);

        return false;
    }

    function showRelatedObjectLookupPopup(triggeringLink) {
        return showAdminPopup(triggeringLink, /^lookup_/, true);
    }

    function dismissRelatedLookupPopup(win, chosenId) {
        if (typeof chosenId === 'undefined') {
            chosenId = win;
        }
        const id = $('.modal iframe').attr('data-target-field-id');
        const elem = document.getElementById(id);
        if (elem) {
            if (elem.classList.contains('vManyToManyRawIdAdminField') && elem.value) {
                elem.value += ',' + chosenId;
            } else {
                elem.value = chosenId;
            }
            $(elem).trigger('change');
        }
        close_modal();
    }

    function showRelatedObjectPopup(triggeringLink) {
        return showAdminPopup(triggeringLink, /^(change|add|delete|view)_/, false);
    }

    function updateRelatedObjectLinks(triggeringLink) {
        const $this = $(triggeringLink);
        const siblings = $this.parent().parent().find('.view-related, .change-related, .delete-related');

        if (!siblings.length) {
            return;
        }
        const value = $this.val();
        if (value) {
            siblings.each(function () {
                const elm = $(this);
                const template = elm.attr('data-href-template');
                if (template) {
                    elm.attr('href', template.replace('__fk__', encodeURIComponent(value)));
                }
            });
        } else {
            siblings.removeAttr('href');
        }
    }

    function dismissAddRelatedObjectPopup(win, newId, newRepr) {
        if (typeof newRepr === 'undefined') {
            newRepr = newId;
            newId = win;
        }
        const id = $('.modal iframe').attr('data-target-field-id');
        const elem = document.getElementById(id);
        try {
            if (elem) {
                const elemName = elem.nodeName.toUpperCase();
                if (elemName === 'SELECT') {
                    elem.options[elem.options.length] = new Option(newRepr, newId, true, true);
                    if (elem.tomselect) {
                        elem.tomselect.addOption({value: newId, text: newRepr});
                        elem.tomselect.addItem(newId);
                    }
                } else if (elemName === 'INPUT') {
                    if (elem.classList.contains('vManyToManyRawIdAdminField') && elem.value) {
                        elem.value += ',' + newId;
                    } else {
                        elem.value = newId;
                    }
                }
                $(elem).trigger('change');
            } else {
                const toId = id + "_to";
                if (typeof SelectBox !== 'undefined') {
                    const o = new Option(newRepr, newId);
                    SelectBox.add_to_cache(toId, o);
                    SelectBox.redisplay(toId);
                }
            }
        } catch (e) {
            console.log("ERROR dismissAddRelatedObjectPopup: ", e);
        }
        close_modal();
    }

    function dismissChangeRelatedObjectPopup(win, objId, newRepr, newId) {
        if (typeof newId === 'undefined') {
            newId = newRepr;
            newRepr = objId;
            objId = win;
        }
        try {
            const id = $('.modal iframe').attr('data-target-field-id');
            const elem = document.getElementById(id);
            if (elem && elem.tomselect) {
                elem.tomselect.updateOption(objId, {value: newId, text: newRepr});
            }
            const selectsSelector = `#${id}, #${id}_from, #${id}_to`;
            const selects = $(selectsSelector);
            selects.find('option').each(function () {
                if (this.value === objId) {
                    this.textContent = newRepr;
                    this.value = newId;
                }
            });
            selects.next().find('.select2-selection__rendered').each(function () {
                this.lastChild.textContent = newRepr;
                this.title = newRepr;
            });
            selects.trigger('change');
        } catch (e) {
            console.log("ERROR dismissChangeRelatedObjectPopup: ", e);
        }
        close_modal();
    }

    function dismissDeleteRelatedObjectPopup(win, objId) {
        if (typeof objId === 'undefined') {
            objId = win;
        }
        try {
            const id = $('.modal iframe').attr('data-target-field-id');
            const elem = document.getElementById(id);
            if (elem && elem.tomselect) {
                elem.tomselect.removeOption(objId);
            }
            const selectsSelector = `#${id}, #${id}_from, #${id}_to`;
            const selects = $(selectsSelector);
            selects.find('option').each(function () {
                if (this.value === objId) {
                    $(this).remove();
                }
            }).trigger('change');
        } catch (e) {
            console.log("ERROR dismissDeleteRelatedObjectPopup: ", e);
        }
        close_modal();
    }

    function fallbackDismissChangeRelatedObjectPopup(error) {
        console.log("fallbackDismissChangeRelatedObjectPopup", error);
        close_modal();
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
    window.close_modal = close_modal;

    $(document).ready(function () {
        setPopupIndex();
        $("a[data-popup-opener]").on('click', function (event) {
            event.preventDefault();
            opener.dismissRelatedLookupPopup(window, $(this).data("popup-opener"));
        });
        $('body').on('click', '.related-widget-wrapper-link', function (e) {
            e.preventDefault();
            let _this = this;
            if (this.nodeName !== "A") {
                _this = $(this).closest('a')[0] || e.target;
            }
            const href = $(_this).attr('href') || $(_this).attr('data-href-template');
            if (href) {
                const event = $.Event('django:show-related', {href: href});
                $(_this).trigger(event);

                if (!event.isDefaultPrevented()) {
                    showRelatedObjectPopup(_this);
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
            let _this = this;
            if (this.nodeName !== "A") {
                _this = $(this).closest('a')[0] || e.target;
            }
            const event = $.Event('django:lookup-related');
            $(_this).trigger(event);
            if (!event.isDefaultPrevented()) {
                showRelatedObjectLookupPopup(_this);
            }
        });
    });
}