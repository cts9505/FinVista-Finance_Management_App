import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

export const googleAuth = (code, locationToSend) => {
    const url = `/api/auth/google?code=${code}&latitude=${locationToSend?.latitude || ''}&longitude=${locationToSend?.longitude || ''}`;
    return api.get(url);
};