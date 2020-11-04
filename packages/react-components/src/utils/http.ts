let baseUrl = ""

export const setBaseUrl = (base: string) => {
    baseUrl = base
}

export const requestClient = async (uri: string) => {
   const res = await fetch(`${baseUrl}${uri}`)
   return res.json()
}