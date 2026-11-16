export const API_URL: string = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000'
).replace(/\/+$/, '')

export const PAGE_SIZE = 10
