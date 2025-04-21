const QueryModule = (() => {
    // Store query parameters
    const queryMap = new Map();

    function addFacetToQuery(queryString) {
        // Remove the leading '?' and split parameters
        const params = queryString.replace(/^\?/, '').split('&').filter(Boolean);

        // Add the _facets=true parameter at the beginning
        params.unshift('_facets=true');

        // Rebuild the query string
        return '?' + params.join('&');
    }

    /**
     * Extracts a value from a query string based on a data key
     * @param {string} queryString - The query string to parse
     * @param {string} dataKey - The key to search for
     * @returns {string|null} - The matching value or null
     */
    const extractValueFromQueryString = (queryString, dataKey) => {
        try {
            const params = new URLSearchParams(queryString);
            for (const [key, value] of params) {
                if (key.startsWith(dataKey)) {
                    return value;
                }
            }
            return null;
        } catch (error) {
            console.error('Error parsing query string:', error);
            return null;
        }
    };

    /**
     * Builds a query string from an object
     * @param {Object} queryObj - Object containing query parameters
     * @returns {string} - Formatted query string
     */
    const buildQueryString = (queryObj) => {
        const queryArray = Object.entries(queryObj)
            .map(([key, values]) => {
                let formattedKey = key.replace('__exact', '__in');
                if (!formattedKey.match(/__[^_]+$/)) {
                    formattedKey += '__in';
                }

                if (Array.isArray(values)) {
                    const validValues = values.filter(
                        (item) => item != null && item !== ''
                    );

                    if (validValues.length > 0) {
                        const joinedValues = validValues
                            .map((item) => encodeURIComponent(item))
                            .join(',');
                        return `${formattedKey}=${joinedValues}`;
                    }
                }
                return null;
            })
            .filter(Boolean);

        return queryArray.length ? `?${queryArray.join('&')}` : '';
    };

    /**
     * Applies filters and updates URL based on selected values
     */
    const applyFilters = () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            queryMap.clear();


            const filterData = {};
            document.querySelectorAll('.filter-select').forEach((select) => {
                // Handle both single and multiple select elements
                let selectedValues = [];

                if (select.multiple) {
                    // Multiple select: get all selected options
                    selectedValues = Array.from(select.selectedOptions || [])
                        .map((option) => option.value)
                        .filter((value) => value != null && value !== '');
                } else {
                    // Single select: get the selected value
                    const value = select.value;
                    if (value != null && value !== '') {
                        selectedValues = [value];
                    }
                }

                const dataKeys = select.dataset.keys?.split(',').filter(Boolean) || [];

                dataKeys.forEach((key) => {
                    if (selectedValues.length) {
                        const values = selectedValues
                            .map((value) => extractValueFromQueryString(value, key))
                            .filter(Boolean);

                        if (values.length) {
                            filterData[key] = filterData[key]
                                ? [...filterData[key], ...values]
                                : values;
                        }
                    }
                });
            });

            let queryString = buildQueryString(filterData);

            // Prepend _facets=true if it exists in the URL parameters
            const hasFacets = urlParams.has('_facets');
            if (hasFacets) {
                queryString = addFacetToQuery(queryString)
            }

            if (queryString) {
                console.log(queryString);
                window.location.href = queryString;
            }
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    };

    /**
     * Initializes the module by setting up event listeners
     */
    const init = () => {
        const applyButton = document.getElementById('apply-filter');
        if (applyButton) {
            applyButton.addEventListener('click', applyFilters);
        } else {
            console.warn('Apply filter button not found');
        }
    };

    // Expose public methods
    return {
        init,
        extractValueFromQueryString,
        applyFilters,
    };
})();

// Initialize module when DOM is ready
document.addEventListener('DOMContentLoaded', QueryModule.init);