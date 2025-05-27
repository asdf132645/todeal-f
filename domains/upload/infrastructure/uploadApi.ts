import { apiClient } from '~/libs/http/apiClient'

export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post('/api/upload/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    console.log('response',response);
    return response // <- 백엔드에서 반환한 image URL
}
