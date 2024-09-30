$(document).ready(function () {
    let editors = document.getElementsByClassName('keyvalue-json-editor-field')
    $(editors).each((index, editor) => {
        let schema_str = JSON.parse(editor.value)
        $(editor).addClass("hidden")
        let json_viewer_div = $(`<div class="json-view-editor"></div>`)
        $(editor).parent().append(json_viewer_div)

        let properties = {
            key: {type: 'string'},
            value: {type: 'string'},
        }

        init(editor, json_viewer_div, properties, schema_str || [])

    })
})


function init(editor, json_viewer_div, properties, start_value = []) {
    let jsoneditor = new JSONEditor(
        json_viewer_div[0], {
            theme: 'bootstrap4',
            schema: {
                type: "array",
                format: 'table',
                title: ' ',
                items: {
                    type: 'object',
                    title: 'item',
                    properties: properties
                },
            },
            disable_edit_json: true,
            disable_properties: false,
            disable_array_delete_all_rows: true,
            disable_array_delete_last_row: true,
            disable_array_reorder: true,
            grid_columns: 3,
            prompt_before_delete: false,
            disable_collapse: true,
            startval: start_value
        })
    jsoneditor.on('change', () => {
        $(editor).val(JSON.stringify(jsoneditor.getValue()))
    })
}
