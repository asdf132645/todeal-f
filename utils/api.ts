// utils/api.ts
import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8080', // 여긴 니 백엔드 주소로 맞춰
    headers: {
        'Content-Type': 'application/json'
    }
})

export default api
