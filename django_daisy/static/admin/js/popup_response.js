/*global opener */

'use strict';
{
    try {
        const initData = JSON.parse(document.getElementById('django-admin-popup-response-constants').dataset.popupResponse);

        switch (initData.action) {
            case 'change':
                window.parent.dismissChangeRelatedObjectPopup(initData.value, initData.obj, initData.new_value);
                break;
            case 'delete':
                window.parent.dismissDeleteRelatedObjectPopup(initData.value);
                break;
            default:
                window.parent.dismissAddRelatedObjectPopup(initData.value, initData.obj);
                break;
        }

    } catch (e) {
        window.parent.fallbackDismissChangeRelatedObjectPopup(e);
    }
}
