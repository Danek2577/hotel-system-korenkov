import axios from "axios";

// Хардкод URL для надежности (чтобы не гадать с env)
const BASE_URL = "http://localhost:5000/api/";

const $host = axios.create({
    baseURL: BASE_URL
});

const $authHost = axios.create({
    baseURL: BASE_URL
});

// Самый простой интерцептор: есть токен в localStorage? Суй его в хедер.
$authHost.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') { // Проверка на браузер
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export {
    $host,
    $authHost
}
