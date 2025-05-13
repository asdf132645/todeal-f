// ~/utils/requestBootpay.ts
import Bootpay from '@bootpay/client-js'


export const requestBootpay = async (
    plan: { id: number; name: string; price: number },
    user: { id: number; name: string; email: string }
) => {
    try {
        await Bootpay.requestPayment({
            application_id: '6822d13e00d008657455b08b', // 🔥 실 앱 ID로 교체
            price: plan.price,
            order_name: plan.name,
            order_id: `order_${Date.now()}`,
            pg: 'nicepay',
            method: 'card', // 🔥 카드결제로 고정
            user_info: {
                id: user.id,
                username: user.name,
                email: user.email
            },
            metadata: {
                user_id: user.id,
                plan_id: plan.id
            },
            extra: {
                display_success_result: true
            }
        })
    } catch (err: any) {
        alert('❌ 결제 실패: ' + (err.message || '에러'))
        console.error('Bootpay Error:', err)
    }
}
