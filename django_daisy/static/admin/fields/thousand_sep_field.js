function convertPersianToEnglish(value) {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    for (let i = 0; i < persianNumbers.length; i++) {
        value = value.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
    }

    return value;
}

function formatNumber(input) {
    let value = convertPersianToEnglish(input.value);
    // Remove any existing thousand separators and non-digit characters
    value = value.replace(/,/g, '').replace(/\D/g, '');

    // Add thousand separators
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Update the input value
    input.value = value;
}