const API_BASE_URL = 'https://appserviceproject4tm20241.azurewebsites.net/api/visiage';
const BLOB_BASE_URL = 'https://stproject4tm20241.blob.core.windows.net/mycontainer';

export const fetchData = async (endpoint) => {
    console.log("Fetching data from: " + endpoint);
    const url = `${API_BASE_URL}/${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
    };

    const options = {
        method: 'GET',
        headers,
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error; // Re-throw the error for the calling code to handle
    }
};

export const postData = async (endpoint, body = null) => {
    console.log("Posting data to: " + endpoint);
    const url = `${API_BASE_URL}/${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
    };

    const options = {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error; // Re-throw the error for the calling code to handle
    }
};

export const putData = async (endpoint, body = null) => {
    console.log("Putting data to: " + endpoint);
    const url = `${API_BASE_URL}/${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
    };

    const options = {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error; // Re-throw the error for the calling code to handle
    }
};

export const deleteData = async (endpoint, body = null) => {
    console.log("Deleting data from: " + endpoint);
    const url = `${API_BASE_URL}/${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
    };

    const options = {
        method: 'DELETE',
        headers,
        body: JSON.stringify(body),
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error; // Re-throw the error for the calling code to handle
    }
};

export const fetchBlobUrl = async (blobPath, token) => {
    const url = `${BLOB_BASE_URL}/${blobPath}?${token}`;

    const headers = {
        'Content-Type': 'application/json',
    };

    const options = {
        method: 'GET',
        headers,
    };

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const contentType = response.headers.get('Content-Type');

        if (contentType && contentType.includes('video/mp4')) {
            // Proceed to parse the response as JSON
            const data = response;
            return data.url;
        } else {
            // Handle the case where the response is not JSON
            console.error('Invalid Content-Type. Expected video/mp4.');
            throw new Error('Invalid Content-Type. Expected video/mp4.');
        }
    } catch (error) {
        console.error('API Error:', error);
        throw error; // Re-throw the error for the calling code to handle
    }
};

