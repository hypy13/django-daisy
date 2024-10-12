$(document).ready(function () {
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