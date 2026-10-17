function close_modal() {
    $('.modal-backdrop').click()
}

(() => {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const mobileSidebarMedia = window.matchMedia('(max-width: 63.999rem)');

    if (!menuToggle || !sidebar || !sidebarOverlay) {
        return;
    }

    function setSidebarOpen(isOpen) {
        if (mobileSidebarMedia.matches) {
            sidebar.classList.toggle('is-open', isOpen);
            sidebarOverlay.classList.toggle('is-open', isOpen);
            sidebarOverlay.setAttribute('aria-hidden', String(!isOpen));
            document.body.classList.toggle('sidebar-open', isOpen);
        } else {
            sidebar.classList.toggle('desktop-hidden', !isOpen);
        }

        menuToggle.setAttribute('aria-expanded', String(isOpen));
    }

    menuToggle.setAttribute('aria-expanded', String(!mobileSidebarMedia.matches));

    menuToggle.addEventListener('click', () => {
        const isOpen = mobileSidebarMedia.matches
            ? sidebar.classList.contains('is-open')
            : !sidebar.classList.contains('desktop-hidden');
        setSidebarOpen(!isOpen);
    });

    sidebarOverlay.addEventListener('click', () => setSidebarOpen(false));

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && mobileSidebarMedia.matches && sidebar.classList.contains('is-open')) {
            setSidebarOpen(false);
            menuToggle.focus();
        }
    });

    mobileSidebarMedia.addEventListener('change', () => {
        sidebar.classList.remove('is-open', 'desktop-hidden');
        sidebarOverlay.classList.remove('is-open');
        sidebarOverlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('sidebar-open');
        menuToggle.setAttribute('aria-expanded', String(!mobileSidebarMedia.matches));
    });
})();


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
