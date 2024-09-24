'use strict';
{
    window.addEventListener('load', function () {
        // Add anchor tag for Show/Hide link
        const fieldsets = document.querySelectorAll('fieldset.collapse');
        for (const [i, elem] of fieldsets.entries()) {
            // Don't hide if fields in this fieldset have errors
            if (elem.querySelectorAll('div.errors, ul.errorlist').length === 0) {
                elem.classList.add('collapsed');
                const h2 = elem.querySelector('h2');
                if (!h2){
                    return
                }
                const link = document.createElement('a');
                if (h2) {
                    link.id = 'fieldsetcollapser' + i;
                    link.className = 'collapse-toggle';
                    link.href = '#';
                    link.textContent = 'Show';
                    h2.appendChild(document.createTextNode(' ('));
                    h2.appendChild(link);
                    h2.appendChild(document.createTextNode(')'));
                }

            }
        }
        // Add toggle to hide/show anchor tag
        const toggleFunc = function (ev) {
            if (ev.target.matches('.collapse-toggle')) {
                ev.preventDefault();
                ev.stopPropagation();
                const fieldset = ev.target.closest('fieldset');
                if (fieldset.classList.contains('collapsed')) {
                    // Show
                    ev.target.textContent = 'Hide';
                    fieldset.classList.remove('collapsed');
                } else {
                    // Hide
                    ev.target.textContent = 'Show';
                    fieldset.classList.add('collapsed');
                }
            }
        };
        document.querySelectorAll('fieldset.module').forEach(function (el) {
            el.addEventListener('click', toggleFunc);
        });
    });
}
