// ~/composables/useAd.ts
export const useAd = () => {
    const showRewardAd = async (): Promise<boolean> => {
        if (!(window as any).admob) {
            console.warn('웹 환경: 광고 생략')
            return true // 웹에서는 테스트용 자동 성공
        }


        return new Promise((resolve) => {
            const admob = (window as any).admob

            // 광고 로드
            admob.rewardvideo.load({ id: 'ca-app-pub-1676077680656282/2288619937' })

            // 로드 완료 → 광고 띄우기
            admob.rewardvideo.on('load', () => {
                admob.rewardvideo.show()
            })

            // 리워드 지급 시
            admob.rewardvideo.on('reward', () => {
                resolve(true)
            })

            // 닫힘 시
            admob.rewardvideo.on('close', () => {
                resolve(false)
            })
        })
    }

    return { showRewardAd }
}
