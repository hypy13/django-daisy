// queryModule.js

const QueryModule = (function () {
    let queryMap = {};

    function extractValueFromQueryString(queryString, data_key) {
        const params = new URLSearchParams(queryString);
        let val = null
        params.forEach((v, k) => {
            if (k.startsWith(data_key)) {
                val = v;
            }
        })
        return val
    }

    function extractTheShitOutOfIt(queryString, data_key) {
        const all_params = new URLSearchParams(queryString);
        let this_params = ""
        all_params.forEach((v, k) => {
            v = encodeURIComponent(v)
            if (k.startsWith(data_key)) {
                this_params += `&${k}=${v}`;
            }
        })
        return this_params
    }


    function addOrUpdateQueryParameter(value, key, option) {
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

    function buildQueryString(queryObj) {
        return '?' + Object.keys(queryObj).map(key => {
            let formattedKey = key.replace('__exact', '__in');
            let formattedVal = encodeURIComponent(queryObj[key])
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
        let single_query_string = ""
        $('.filter-select').each(function () {
            let selectedValues = $(this).val();
            let dataKey = $(this).data('key');
            if (dataKey && dataKey.includes('__exact') && selectedValues) {
                selectedValues.forEach(option => {
                    let v = extractValueFromQueryString(option, dataKey)
                    addOrUpdateQueryParameter(v, dataKey, option)
                });
            } else if (dataKey && selectedValues) {
                if (selectedValues instanceof Array) {
                    selectedValues = selectedValues[0]
                }
                single_query_string += extractTheShitOutOfIt(selectedValues, dataKey)
            }
        });

        let multQueryString = buildQueryString(queryMap);

        let queryString = multQueryString + single_query_string
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
