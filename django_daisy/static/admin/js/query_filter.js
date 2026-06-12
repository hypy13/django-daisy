const QueryModule = (() => {

    function addFacetToQuery(queryString) {
        // Remove the leading '?' and split parameters
        const params = queryString.replace(/^\?/, '').split('&').filter(Boolean);

        // Add the _facets=true parameter at the beginning
        params.unshift('_facets=true');

        // Rebuild the query string
        return '?' + params.join('&');
    }

    /**
     * Extracts a value from a query string based on a data key.
     * If the value isn't shaped like a query string, it's returned as-is
     * (so plain text/checkbox/radio values pass through untouched).
     * @param {string} queryString - The raw value or query string to parse
     * @param {string} dataKey - The key to search for
     * @returns {string|null} - The matching value or null
     */
    const extractValueFromQueryString = (queryString, dataKey) => {
        try {
            if (!queryString.includes('?')) {
                return queryString;
            }

            const params = new URLSearchParams(queryString);
            for (const [key, value] of params) {
                if (key === dataKey) {
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
                if (Array.isArray(values)) {
                    const validValues = values.filter((item) => item != null && item !== '');

                    if (validValues.length > 0) {
                        const joinedValues = validValues
                            .map((item) => encodeURIComponent(item))
                            .join(',');
                        return `${key}=${joinedValues}`;
                    }
                }
                return null;
            })
            .filter(Boolean);

        return queryArray.length ? `?${queryArray.join('&')}` : '';
    };

    /**
     * Resolves which query-string key(s) an input should map to.
     * Falls back to the input's `name` attribute when `data-keys`
     * is missing or empty.
     * @param {HTMLElement} input
     * @returns {string[]}
     */
    const resolveDataKeys = (input) => {
        const declaredKeys = input.dataset.keys
            ?.split(',')
            .map((key) => key.trim())
            .filter(Boolean);

        if (declaredKeys && declaredKeys.length) {
            return declaredKeys;
        }

        const name = input.getAttribute('name');
        return name ? [name] : [];
    };

    /**
     * Reads the selected/entered value(s) from a single form control.
     * @param {HTMLElement} input
     * @returns {string[]}
     */
    const getSelectedValues = (input) => {
        const tag = input.tagName.toLowerCase();

        if (tag === 'select') {
            if (input.multiple) {
                return Array.from(input.selectedOptions || [])
                    .map((option) => option.value)
                    .filter((value) => value != null && value !== '');
            }
            return input.value != null && input.value !== '' ? [input.value] : [];
        }

        if (input.type === 'checkbox' || input.type === 'radio') {
            return input.checked && input.value != null && input.value !== '' ? [input.value] : [];
        }

        // Text inputs, textareas, numbers, dates, etc.
        const value = input.value?.trim();
        return value ? [value] : [];
    };

    /**
     * Determines whether an input contributes to the filter list at all.
     * Excludes non-data controls (buttons, hidden/file fields, the
     * apply button itself, and disabled fields).
     * @param {HTMLElement} input
     * @returns {boolean}
     */
    const isFilterable = (input) => {
        if (input.disabled) return false;

        const excludedTypes = ['hidden', 'submit', 'button', 'reset', 'image', 'file'];
        if (excludedTypes.includes(input.type)) return false;

        if (input.id === 'apply-filter') return false;

        return true;
    };

    /**
     * Applies filters and updates URL based on selected values
     */
    const applyFilters = () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const filterData = {};

            document
                .querySelectorAll('#changelist-filter input, #changelist-filter select, #changelist-filter textarea')
                .forEach((input) => {
                    if (!isFilterable(input)) return;

                    const selectedValues = getSelectedValues(input);
                    if (!selectedValues.length) return;

                    const dataKeys = resolveDataKeys(input);
                    if (!dataKeys.length) return;

                    dataKeys.forEach((key) => {
                        const values = selectedValues
                            .map((value) => extractValueFromQueryString(value, key))
                            .filter((value) => value != null && value !== '');

                        if (!values.length) return;

                        let formattedKey = key;

                        // Treat naturally multi-valued inputs (multi-selects, checkboxes)
                        // as "in" lookups rather than exact matches.
                        if (input.multiple || input.type === 'checkbox') {
                            formattedKey = key.replace('__exact', '__in');
                            if (!formattedKey.match(/__[^_]+$/)) {
                                formattedKey += '__in';
                            }
                        }

                        filterData[formattedKey] = filterData[formattedKey] ? [...filterData[formattedKey], ...values] : values;
                    });
                });

            let queryString = buildQueryString(filterData);

            // Prepend _facets=true if it exists in the URL parameters
            const hasFacets = urlParams.has('_facets');
            if (hasFacets) {
                queryString = addFacetToQuery(queryString);
            }

            window.location.href = queryString || '?';
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    };

    /**
     * Initializes the module by setting up event listeners
     */
    const init = () => hideAllOptions();
    {
        const applyButton = document.getElementById('apply-filter');
        if (applyButton) {
            applyButton.addEventListener('click', applyFilters);
        } else {
            console.warn('Apply filter button not found');
        }
    }

    const hideDefaultAllOption = (select) => {
        const dataKeys = select.dataset.keys
            ?.split(',')
            .map((key) => key.trim())
            .filter(Boolean) || [];
        // this only hide in select, later i should hide in tomSelect component
        // Only __exact keys are useful for distinguishing "All" vs a real choice.
        // __in keys are shared across all options (they list every available id),
        // so they can't be used to tell them apart.
        const exactKeys = dataKeys.filter((key) => key.includes('__exact'));
        if (!exactKeys.length) return;

        Array.from(select.options).forEach((option) => {
            const value = option.value;
            if (!value) return;

            const isAllOption = exactKeys.every((key) => extractValueFromQueryString(value, key) == null);

            if (isAllOption) {
                option.classList.add('hidden');
                option.hidden = true;
                option.disabled = true; // also prevents it from being selectable via keyboard
            }
        });
    };

    /**
     * Runs hideDefaultAllOption over every relevant select in the filter sidebar.
     */
    const hideAllOptions = () => {
        document
            .querySelectorAll('#changelist-filter select[data-keys]')
            .forEach(hideDefaultAllOption);
    };
    // Expose public methods
    return {
        init, extractValueFromQueryString, applyFilters,
    };
})();

// Initialize module when DOM is ready
document.addEventListener('DOMContentLoaded', QueryModule.init);