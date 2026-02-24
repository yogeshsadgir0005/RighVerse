import axios from '../utils/axios';


// --- PUBLIC ---
export const fetchLaws = async (params) => {
  const res = await axios.get('/laws', { params });
  return res.data;
};

export const suggestLaws = async (q) => {
  const res = await axios.get(`/laws/suggest`, { params: { q } });
  return res.data;
};

// --- ADMIN ---
// NOTE: Passing token in headers for security
const getAuthHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

export const adminListLaws = async (params, token) => {
  const res = await axios.get(`/laws/admin/list`, { 
    params, 
    ...getAuthHeaders(token) 
  });
  return res.data;
};

export const adminCreateLaw = async (data, token) => {
  const res = await axios.post('/laws', data, getAuthHeaders(token));
  return res.data;
};

export const adminUpdateLaw = async (id, data, token) => {
  const res = await axios.put(`/laws/${id}`, data, getAuthHeaders(token));
  return res.data;
};

export const adminDeleteLaw = async (id, token) => {
  const res = await axios.delete(`/laws/${id}`, getAuthHeaders(token));
  return res.data;
};

export const adminTogglePublish = async (id, token) => {
  const res = await axios.patch(`/laws/${id}/publish`, {}, getAuthHeaders(token));
  return res.data;
};