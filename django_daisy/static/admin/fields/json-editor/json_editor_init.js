function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}

$(document).ready(function () {
    // Configure default upload handler for JSONEditor
    JSONEditor.defaults.callbacks.upload = {
        "defaultUploadHandler": function (jseditor, type, file, cbs) {
            var xhr = new XMLHttpRequest();
            const htmlElement = document.documentElement;
            let url = '/admin/json-editor-upload-handler/';
            if (htmlElement.hasAttribute('data-use-i18n') && htmlElement.getAttribute('data-use-i18n') === "1") {
                const djangoLang = htmlElement.getAttribute('lang');
                if (djangoLang) {
                    url = `/${djangoLang}${url}`;
                }
            }
            xhr.open('POST', url, true);
            xhr.upload.addEventListener('progress', function (event) {
                if (event.lengthComputable) {
                    var percent = Math.round((event.loaded / event.total) * 100);
                    cbs.updateProgress(percent);
                }
            });
            xhr.addEventListener('load', function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    cbs.success(xhr.responseText);
                } else {
                    cbs.failure('Upload failed: ' + xhr.statusText);
                }
            });
            xhr.addEventListener('error', function () {
                cbs.failure('Upload failed');
            });
            var formData = new FormData();
            formData.append('file', file);
            xhr.send(formData);
        }
    };

    // Initialize JSONEditor for a given editor element
    function initEditorJsonEditor(editor, schema, jsonViewerDiv) {
        let initialData;
        try {
            initialData = JSON.parse(editor.value);
        } catch (e) {
            console.error("Invalid JSON in editor value:", e);
            initialData = [];
        }

        let parsedSchema;
        try {
            parsedSchema = JSON.parse(schema);
        } catch (e) {
            console.error("Invalid JSON in schema:", e);
            return;
        }

        let jsonEditorInstance = new JSONEditor(jsonViewerDiv, {
            theme: 'tailwind',
            schema: parsedSchema,
            disable_edit_json: true,
            disable_properties: true,
            disable_array_delete_all_rows: true,
            disable_array_delete_last_row: true,
            disable_array_reorder: true,
            grid_columns: 3,
            prompt_before_delete: false,
            disable_collapse: true,
            startval: initialData
        });

        $(editor)[0].jsoneditor = jsonEditorInstance

        jsonEditorInstance.on('change', () => {
            try {
                $(editor).val(JSON.stringify(jsonEditorInstance.getValue()));
            } catch (e) {
                console.error("Error stringifying JSON:", e);
            }
        });
    }

    // Initialize a single editor element
    function initializeJsonEditor(editor) {
        if ($(editor).data('json-editor-initialized')) {
            return;
        }
        if ($(editor).parents('#items-empty').length) {
            return;
        }


        let editorId = $(editor).attr('id');
        let schemaElement = $(`#${editorId}-schema-template`);
        let viewerDiv = $(`#${editorId}-viewer`)[0];
        if (!schemaElement.length || !viewerDiv) {
            console.error(`Missing schema or viewer for editor ${editorId}`);
            return;
        }
        let schema = schemaElement.html();
        initEditorJsonEditor(editor, schema, viewerDiv);
        $(editor).data('json-editor-initialized', true);
    }

    // Initialize all existing editors on page load
    $('.django-json-editor-field').each(function (i, editor) {
        initializeJsonEditor(editor);
    });

    // Observe DOM changes to initialize dynamically added editors
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const editors = $(node).find('.django-json-editor-field');
                        if ($(node).hasClass('django-json-editor-field')) {
                            editors.push(node);
                        }
                        editors.each(function (i, editor) {
                            initializeJsonEditor(editor);
                        });
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});