// queryModule.js

const QueryModule = (function () {
    let queryMap = {};

    function extractValueFromQueryString(queryString, key) {
        // Remove the leading '?' if present
        const cleanedQueryString = queryString.startsWith('?') ? queryString.substring(1) : queryString;

        // Create a regex pattern to match the key and capture its value
        const pattern = new RegExp(`${escapeRegExp(key)}=([^&]*)`);

        // Search for the pattern in the query string
        const match = cleanedQueryString.match(pattern);

        return match ? decodeURIComponent(match[1]) : null;  // Return the decoded value or null if not found
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function addOrUpdateQueryParameter(value, key) {
        key = key.replace('__exact', '__in')
        console.log(queryMap);
        if (queryMap[key]) {
            // Append new value to existing key with a comma separator
            if (!queryMap[key].includes(value)) {
                queryMap[key] += `,${value}`;
            }
        } else if (value) {
            // Add the new key-value pair to the map
            queryMap[key] = value;
        }
    }

    function buildQueryString() {
        return '?' + Object.keys(queryMap).map(key => {
            const formattedKey = key.replace('__exact', '__in');
            return `${formattedKey}=${queryMap[key]}`;
        }).join('&');
    }

    function applyFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        queryMap = {};
        const facets = urlParams.get('_facets');
        if (facets) {
            queryMap['_facets'] = true
        }

        let queryString = "";

        $('.filter-select').each(function () {
            const selectedValues = $(this).val();
            const dataKey = $(this).data('key');

            if (selectedValues) {
                selectedValues.forEach(option => {
                    console.log(option, dataKey);
                    const extractedValue = extractValueFromQueryString(option, dataKey);
                    if (extractedValue) {
                        addOrUpdateQueryParameter(extractedValue, dataKey);
                    }
                });
            }
        });

        queryString = buildQueryString();
        console.log(queryString);
        window.location.href = queryString;
    }

    function init() {
        $('#apply-filter').click(applyFilters);
    }

    return {
        init,
        extractValueFromQueryString,
        addOrUpdateQueryParameter,
        applyFilters
    };
})();

// Initialize the module
$(document).ready(function () {
    QueryModule.init();
});
