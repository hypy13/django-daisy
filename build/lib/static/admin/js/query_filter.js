// queryModule.js

const QueryModule = (function () {
    let queryMap = {};

    function extractValueFromQueryString(queryString, data_key) {
        const result = {}
        const params = new URLSearchParams(queryString);
        params.forEach((v, k) => {
            if (k.startsWith(data_key)) {
                result[k] = v;  // Store matching key-value pairs
            }
        })

        return result
    }


    function addOrUpdateQueryParameter(value, key) {
        key = key.replace('__exact', '__in')
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
            const formattedVal = encodeURIComponent(queryMap[key])
            return `${formattedKey}=${formattedVal}`;
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
                    queryMap = {...queryMap, ...extractValueFromQueryString(option, dataKey)}
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
