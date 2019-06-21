export async function fetchJson(input, init) {
    const response = await fetch(input, init);
    return await response.json();
}

export function objectToFormData(object) {
    return Object.keys(object).reduce((formData, key) => {
        formData.set(key, object[key]);
        return formData;
    }, new FormData());
}

export function buildUrlQuery(params) {
    return Object.entries(params)
        .map(([key, value]) => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        })
        .join('&');
}

export function parseQueryString(query) {
    const vars = query.split('&');
    const query_string = {};
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split('=');
        const key = decodeURIComponent(pair[0]);
        const value = decodeURIComponent(pair[1]);
        // If first entry with this name
        if (typeof query_string[key] === 'undefined') {
            query_string[key] = decodeURIComponent(value);
            // If second entry with this name
        } else if (typeof query_string[key] === 'string') {
            const arr = [query_string[key], decodeURIComponent(value)];
            query_string[key] = arr;
            // If third or later entry with this name
        } else {
            query_string[key].push(decodeURIComponent(value));
        }
    }
    return query_string;
}
