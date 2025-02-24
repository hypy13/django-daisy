function getCookie(name) {
    // Split document.cookie into individual cookie strings
    const cookies = document.cookie.split(';');

    // Iterate through each cookie
    for (let cookie of cookies) {
        // Trim whitespace and split into name-value pair
        const [cookieName, cookieValue] = cookie.trim().split('=');

        // Check if this is the cookie we're looking for
        if (cookieName === name) {
            // Return the decoded value
            return decodeURIComponent(cookieValue);
        }
    }

    // Return null if cookie not found
    return null;
}

$(document).ready(function () {

    JSONEditor.defaults.callbacks.upload = {
        "defaultUploadHandler": function (jseditor, type, file, cbs) {
            // Create a new XMLHttpRequest object
            var xhr = new XMLHttpRequest();
            const htmlElement = document.documentElement;
            let url = '/admin/json-editor-upload-handler/'
            if (htmlElement.hasAttribute('data-use-i18n') && htmlElement.getAttribute('data-use-i18n') === "1") {
                const djangoLang = htmlElement.getAttribute('lang');
                if (djangoLang) {
                    url = `/${djangoLang}${url}`;
                }
            }

            // Configure it to send a POST request to the server endpoint
            xhr.open('POST', url, true);

            // Handle upload progress
            xhr.upload.addEventListener('progress', function (event) {
                if (event.lengthComputable) {
                    var percent = Math.round((event.loaded / event.total) * 100);
                    cbs.updateProgress(percent); // Update progress bar with percentage
                }
            });

            // Handle successful upload
            xhr.addEventListener('load', function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    var response = xhr.responseText; // Server returns the URL as plain text
                    cbs.success(response); // Call success callback with the URL
                } else {
                    cbs.failure('Upload failed: ' + xhr.statusText); // Call failure callback with error
                }
            });

            // Handle upload errors
            xhr.addEventListener('error', function () {
                cbs.failure('Upload failed'); // Call failure callback on network error
            });

            // Prepare the file for upload
            var formData = new FormData();
            formData.append('file', file); // Append the file to FormData

            // Send the request to the server
            xhr.send(formData);
        }
    };

    function init_editor_json_editor(
        editor,
        schema,
        json_viewer_div,
    ) {
        let schema_str = JSON.parse(editor.value)

        let jsoneditor__ = new JSONEditor(
            json_viewer_div, {
                theme: 'tailwind',
                schema: JSON.parse(schema),
                disable_edit_json: true,
                disable_properties: true,
                disable_array_delete_all_rows: true,
                disable_array_delete_last_row: true,
                disable_array_reorder: true,
                grid_columns: 3,
                prompt_before_delete: false,
                disable_collapse: true,
                startval: schema_str || []
            })

        jsoneditor__.on('change', () => {
            $(editor).val(JSON.stringify(jsoneditor__.getValue()))
        })
    }

    $('.django-json-editor-field').each(function (i, editor) {
        let editor_id = $(editor).attr('id')
        init_editor_json_editor(
            editor,
            $(`#${editor_id}-schema-template`).html(),
            $(`#${editor_id}-viewer`)[0]
        )
    })
})