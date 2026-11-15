(function () {
    'use strict';

    function init(root) {
        root.querySelectorAll('textarea.toastui-editor-field').forEach(function (textarea) {
            if (textarea.dataset.toastuiReady || textarea.name.indexOf('__prefix__') !== -1) return;
            textarea.dataset.toastuiReady = '1';
            var container = document.createElement('div');
            textarea.insertAdjacentElement('afterend', container);
            var csrf = textarea.form && textarea.form.querySelector('[name=csrfmiddlewaretoken]');
            var editor;

            function post(url, data) {
                return fetch(url, {
                    method: 'POST', body: data, credentials: 'same-origin',
                    headers: { 'X-CSRFToken': csrf ? csrf.value : '' }
                }).then(function (response) {
                    if (!response.ok) throw new Error('Request failed');
                    return response.json();
                });
            }
            function upload(blob) {
                if (!textarea.dataset.uploadUrl) return Promise.reject(new Error('Uploads disabled'));
                var data = new FormData();
                data.append('file', blob, blob.name || 'image');
                return post(textarea.dataset.uploadUrl, data);
            }
            function failure(error) { window.alert(error.message || 'The attachment request failed.'); }
            function button(text, action) {
                var element = document.createElement('button');
                element.type = 'button';
                element.textContent = text;
                element.addEventListener('click', action);
                return element;
            }
            function insert(item) {
                editor.exec('addLink', { linkUrl: item.url, linkText: item.name });
                editor.focus();
            }
            editor = new toastui.Editor({
                el: container,
                height: '400px',
                usageStatistics: false,
                initialEditType: 'markdown',
                initialValue: textarea.value,
                events: { change: function () { if (editor) textarea.value = editor.getMarkdown(); } },
                hooks: { addImageBlobHook: function (blob, callback) {
                    upload(blob).then(function (data) { callback(data.url, blob.name || 'image'); }).catch(failure);
                } }
            });
            textarea.style.display = 'none';
            textarea.removeAttribute('required');
            if (!textarea.dataset.uploadUrl) return;

            var controls = document.createElement('div');
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = '.png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.zip,.docx,.xlsx,.pptx';
            input.hidden = true;
            input.addEventListener('change', function () {
                if (!input.files.length) return;
                upload(input.files[0]).then(insert).catch(failure);
                input.value = '';
            });
            controls.appendChild(button('Attach file', function () { input.click(); }));
            controls.appendChild(input);
            container.insertAdjacentElement('afterend', controls);

            if (!textarea.dataset.attachmentsUrl || !textarea.dataset.deleteUrl) return;
            var list = document.createElement('div');
            list.hidden = true;
            controls.appendChild(button('Manage attachments', function () {
                list.hidden = !list.hidden;
                if (!list.hidden) loadPage(1);
            }));
            controls.appendChild(list);
            function loadPage(page) {
                fetch(textarea.dataset.attachmentsUrl + '?page=' + page, { credentials: 'same-origin' })
                    .then(function (response) {
                        return response.json().then(function (data) {
                            if (!response.ok) throw new Error(data.error || 'The attachment request failed.');
                            return data;
                        });
                    }).then(function (data) {
                        list.replaceChildren();
                        if (!data.items.length) list.appendChild(document.createTextNode('No attachments.'));
                        data.items.forEach(function (item) {
                            var row = document.createElement('div');
                            row.appendChild(document.createTextNode(item.name + ' '));
                            row.appendChild(button('Insert link', function () { insert(item); }));
                            row.appendChild(button('Delete', function () {
                                if (!window.confirm('Permanently delete this file? Remove its links from this and any other content.')) return;
                                var form = new FormData();
                                form.append('id', item.id);
                                post(textarea.dataset.deleteUrl, form).then(function () { loadPage(page); }).catch(failure);
                            }));
                            list.appendChild(row);
                        });
                        if (page > 1) list.appendChild(button('Previous', function () { loadPage(page - 1); }));
                        if (data.has_more) list.appendChild(button('Next', function () { loadPage(page + 1); }));
                    }).catch(failure);
            }
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(document); });
    else init(document);
    document.addEventListener('formset:added', function (event) { init(event.target); });
}());
