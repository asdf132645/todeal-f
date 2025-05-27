// utils/api.ts
import axios from 'axios'

const api = axios.create({
    baseURL: 'https://api.to-deal.com', // 실제 백엔드로 변경해야함
    headers: {
        'Content-Type': 'application/json'
    }
})

export default api
