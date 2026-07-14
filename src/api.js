const API_URL = 'http://localhost:3000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const api = {
  async get(endpoint) {
    const res = await fetch(`${API_URL}${endpoint}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Error: ${res.statusText}`);
    return res.json();
  },
  
  async post(endpoint, data) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async put(endpoint, data) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};

export default api;
