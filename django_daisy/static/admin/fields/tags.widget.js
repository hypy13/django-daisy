$(document).ready(function () {
    new TomSelect("input.django-tags-input", {
        persist: false,
        createOnBlur: true,
        create: true
    });
})