export async function translateWithPapago(
    text: string,
    sourceLang: string,
    targetLang: string
): Promise<string> {
    const config = useRuntimeConfig()

    const clientId = config.public.papagoClientId
    const clientSecret = config.papagoClientSecret

    const res = await fetch('https://naveropenapi.apigw.ntruss.com/nmt/v1/translation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-NCP-APIGW-API-KEY-ID': clientId,
            'X-NCP-APIGW-API-KEY': clientSecret
        },
        body: new URLSearchParams({
            source: sourceLang,
            target: targetLang,
            text
        })
    })

    const json = await res.json()
    return json.message?.result?.translatedText ?? '[번역 실패]'
}
