import { defineStore } from 'pinia'
import { Geolocation } from '@capacitor/geolocation'

export const useGeoStore = defineStore('geo', {
    state: () => ({
        latitude: null as number | null,
        longitude: null as number | null,
        initialized: false,
        error: null as string | null,
        regionName: '내 위치',
        regionDepth1: '' as string,
        regionDepth2: '' as string,
        regionDepth3: '' as string,
    }),

    actions: {
        setDefaultLocation() {
            this.latitude = 37.5665
            this.longitude = 126.9780
            this.initialized = true
        },

        async fetchRegionName(lat: number, lng: number): Promise<string> {
            return new Promise((resolve, reject) => {
                const waitForKakao = () => {
                    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                        try {
                            const geocoder = new kakao.maps.services.Geocoder()
                            const _coord = new kakao.maps.LatLng(lat, lng)

                            geocoder.coord2RegionCode(lng, lat, (result, status) => {
                                if (status === kakao.maps.services.Status.OK) {
                                    const region = result.find(r => r.region_type === 'H')
                                    resolve(region?.address_name || '알 수 없음')
                                } else {
                                    reject('주소 변환 실패')
                                }
                            })
                        } catch (e) {
                            reject('Geocoder 생성 오류')
                        }
                    } else {
                        setTimeout(waitForKakao, 100)
                    }
                }

                waitForKakao()
            })
        },

        async fetchRegionInfo(lat: number, lng: number): Promise<void> {
            return new Promise((resolve, reject) => {
                const waitForKakao = () => {
                    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                        try {
                            const geocoder = new kakao.maps.services.Geocoder()
                            const coord = new kakao.maps.LatLng(lat, lng)

                            geocoder.coord2RegionCode(lng, lat, (result, status) => {
                                if (status === kakao.maps.services.Status.OK) {
                                    const region = result.find(r => r.region_type === 'H')
                                    if (!region) return reject('주소 없음')

                                    this.regionName = region.address_name || '알 수 없음'
                                    const parts = region.address_name.split(' ')
                                    this.regionDepth1 = parts[0] || ''
                                    this.regionDepth2 = parts[1] || ''
                                    this.regionDepth3 = parts[2] || ''
                                    resolve()
                                } else {
                                    reject('주소 변환 실패')
                                }
                            })
                        } catch {
                            reject('Geocoder 오류')
                        }
                    } else {
                        setTimeout(waitForKakao, 100)
                    }
                }

                waitForKakao()
            })
        },

        async initLocationWithConsent(agree: boolean) {
            if (this.initialized) return

            if (!agree) {
                this.setDefaultLocation()
                try {
                    await this.fetchRegionInfo(this.latitude!, this.longitude!)
                } catch {
                    this.regionName = '주소 확인 실패'
                }
                this.error = '위치 정보를 가져올 수 없습니다. 휴대폰 위치(GPS)를 켜주세요.'
                return
            }

            try {
                const isApp = typeof window !== 'undefined' && !!window.Capacitor

                if (isApp) {
                    // ✅ Capacitor 기반 WebView
                    const permStatus = await Geolocation.checkPermissions()
                    if (permStatus.location !== 'granted') {
                        const req = await Geolocation.requestPermissions()
                        if (req.location !== 'granted') throw new Error('위치 권한 거부됨')
                    }

                    const pos = await Geolocation.getCurrentPosition()
                    this.latitude = pos.coords.latitude
                    this.longitude = pos.coords.longitude
                } else {
                    // ✅ 브라우저 기반
                    await new Promise<void>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(
                            (pos) => {
                                this.latitude = pos.coords.latitude
                                this.longitude = pos.coords.longitude
                                resolve()
                            },
                            (err) => {
                                reject(err)
                            }
                        )
                    })
                }

                this.initialized = true
                this.error = null
                localStorage.setItem('userLat', String(this.latitude))
                localStorage.setItem('userLng', String(this.longitude))
                await this.fetchRegionInfo(this.latitude!, this.longitude!)
            } catch (err) {
                this.setDefaultLocation()
                this.error = '위치 정보를 가져올 수 없습니다. 휴대폰 위치(GPS)를 켜주세요.'
                try {
                    await this.fetchRegionInfo(this.latitude!, this.longitude!)
                } catch {
                    this.regionName = '주소 확인 실패'
                }
                throw err
            }
        },

        async initLocationOnce() {
            return this.initLocationWithConsent(true)
        },

        async initLocationFromStorage() {
            const lat = parseFloat(localStorage.getItem('userLat') || '')
            const lng = parseFloat(localStorage.getItem('userLng') || '')

            if (!isNaN(lat) && !isNaN(lng)) {
                this.latitude = lat
                this.longitude = lng
                this.initialized = true

                try {
                    await this.fetchRegionInfo(lat, lng)
                } catch {
                    this.regionName = '주소 확인 실패'
                }
            } else {
                this.setDefaultLocation()
                try {
                    await this.fetchRegionInfo(this.latitude!, this.longitude!)
                } catch {
                    this.regionName = '주소 확인 실패'
                }
            }
        }
    }
})
