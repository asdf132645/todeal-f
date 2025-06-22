//  geoStore.ts - 기존 코드 보존 + regionDepth1~3 추가
import { defineStore } from 'pinia'
import { Capacitor } from '@capacitor/core'
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
                    if (window.kakao?.maps?.load && window.kakao?.maps?.services?.Geocoder) {
                        window.kakao.maps.load(() => {
                            try {
                                const geocoder = new kakao.maps.services.Geocoder();
                                const coord = new kakao.maps.LatLng(lat, lng);

                                geocoder.coord2RegionCode(lng, lat, (result, status) => {
                                    if (status === kakao.maps.services.Status.OK) {
                                        const region = result.find(r => r.region_type === 'H');
                                        if (!region) return reject('주소 없음');

                                        this.regionName = region.address_name || '알 수 없음';
                                        const parts = region.address_name.split(' ');
                                        this.regionDepth1 = parts[0] || '';
                                        this.regionDepth2 = parts[1] || '';
                                        this.regionDepth3 = parts[2] || '';
                                        resolve();
                                    } else {
                                        reject('주소 변환 실패');
                                    }
                                });
                            } catch (e) {
                                console.error('Geocoder 예외:', e);
                                reject('Geocoder 오류');
                            }
                        });
                    } else {
                        setTimeout(waitForKakao, 100);
                    }
                };

                waitForKakao();
            });
        },

        async initLocationWithConsent(consent: boolean) {
            if (!consent) {
                this.error = '위치 권한이 거부되었습니다.';
                return;
            }

            const isApp = Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios';

            try {
                if (isApp) {
                    // ✅ 권한 확인
                    const permission = await Geolocation.checkPermissions();
                    if (permission.location !== 'granted') {
                        const request = await Geolocation.requestPermissions();
                        if (request.location !== 'granted') {
                            this.error = '위치 권한이 거부되었습니다.';
                            return;
                        }
                    }

                    // ✅ 위치 가져오기
                    const position = await Geolocation.getCurrentPosition({
                        enableHighAccuracy: true,
                        timeout: 10000,
                    });

                    this.latitude = position.coords.latitude;
                    this.longitude = position.coords.longitude;
                    this.initialized = true;
                    this.error = null;
                } else {
                    // ✅ 웹 fallback
                    if ('geolocation' in navigator) {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                this.latitude = position.coords.latitude;
                                this.longitude = position.coords.longitude;
                                this.initialized = true;
                                this.error = null;
                            },
                            (error) => {
                                console.error('[웹 위치 에러]', error);
                                this.error = '브라우저 위치 권한이 거부되었거나 실패했습니다.';
                            },
                            { enableHighAccuracy: true, timeout: 10000 }
                        );
                    } else {
                        this.error = '위치 기능이 지원되지 않는 브라우저입니다.';
                    }
                }
            } catch (e: any) {
                console.error('[위치 가져오기 실패]', e);
                this.error = e?.message || '위치 정보를 가져오지 못했습니다.';
                this.latitude = null;
                this.longitude = null;
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