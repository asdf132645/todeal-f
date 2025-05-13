import { apiClient } from '@/libs/http/apiClient'

export const paymentApi = {
    createStripeCheckout(planId: number): Promise<{ url: string }> {
        return apiClient.post('/api/payments/checkout', { planId })
    }
}
