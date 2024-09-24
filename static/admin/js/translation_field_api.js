$(document).ready(function () {

    function get_text(name) {
        var shortTitleInput = null
        $('.json-view-editor select').each(function () {

            // بررسی رشته "language" در مقدار فیلد
            if ($(this).attr('name').toLowerCase().includes('language')) {
                langs = ['en', 'fa', 'ar', 'az', 'ur', 'ru', 'fr', 'es', 'sw', 'id',]
                for (let _lang in langs) {
                    if (!shortTitleInput) {
                        if ($(this).val() === langs[_lang]) {
                            if ($(this).parent().parent().parent().find(`input[name*='${name}']`).val() !== '') {
                                shortTitleInput = $(this).parent().parent().parent().find(`input[name*='${name}']`).val();
                                break
                            }
                        }
                    }
                }
            }
        });
        return shortTitleInput
    }

    // یافتن تمام المان‌های input با نام name
    function add_tr() {

        console.log('sdds')
        $('.json-view-editor').each(function () {
            $('select').each(function () {
                // بررسی رشته "language" در مقدار فیلد
                if ($(this).attr('name').toLowerCase().includes('language')) {

                    $(this).closest('tr').addClass('g-translate')

                }
            });
        });

        var translate_btn = `<button type="button" class="translate_btn"><i class="mi-translate"></i></button>`

        $('.g-translate input').each(function () {
            if ($(this).val() == '') {
                if ($(this).parent().find('.translate_btn').length == 0) {
                    $(this).parent().append(translate_btn)
                }
            }
        })

        $('.translate_btn').one('click', function () {
            console.log('click')
            var $this = $(this);
            $this.prop('disabled', true);

            var target_input = $(this).parent().find('input')
            var name = target_input.attr('name')
            var name = name.replace(/root\[\d+\]/g, '');
            var dist_lang = $(this).parent().parent().parent().find(`select`).val()

            var q = get_text(name)
            console.log(q)
            $.ajax({
                url: `/oneapi-translation/?dist_lang=${dist_lang}&q=${q}`,
                type: 'GET',
                success: function (response) {
                    console.log(response)
                    let editor_id = $('.json-view-editor').attr('id').replace('date-view-editor-', '')

                    // قرار دادن پاسخ در داخل ولیو اینپوتی
                    input_id = target_input.attr('id')
                    input_id = input_id.replace(/\[/g, '.').replace(/\]/g, '');
                    document.getElementById(editor_id).editor.getEditor(input_id).setValue(response.result)
                },
                error: function (xhr, status, error) {
                    console.log('خطا در ارتباط با سرور');
                },
                complete: function (xhr, status) {
                    // فعال کردن دوباره دکمه
                    $this.prop('disabled', false);
                }
            });
        })


    }


    $('.json-editor-btntype-add').click(function () {
        add_tr()
    })
    $('.json-editor-btntype-delete').click(function () {
        add_tr()
    })
    $('.json-view-editor').on('change', function () {
        add_tr()
    })


})