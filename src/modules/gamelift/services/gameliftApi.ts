import apiClient from '@/shared/api/apiClient'

export async function fetchGames() {
  console.log('[fetchGames] → GET /gamelift/games')
  const res = await apiClient.get('/gamelift/games')
  console.log('[fetchGames] ← status:', res.status, '| data:', res.data)
  return res.data
}

export async function initUpload(gameData: {
  game_name: string
  vm_id: string
  manifest: object
}) {
  console.log('[initUpload] → POST /gamelift/games/init-upload | payload:', JSON.stringify(gameData, null, 2))
  const res = await apiClient.post('/gamelift/games/init-upload', gameData)
  console.log('[initUpload] ← status:', res.status, '| raw res.data:', res.data)
  const uploadURL = res.data as string
  console.log('[initUpload] ← upload_url extracted:', uploadURL)
  return uploadURL
}

export async function uploadToS3(url: string, file: File) {
  console.log('[uploadToS3] → PUT')
  console.log('[uploadToS3]   url:', url)
  console.log('[uploadToS3]   url starts with /:', url.startsWith('/'))
  console.log('[uploadToS3]   file name:', file.name, '| size:', file.size, '| type:', file.type)

  let res
  try {
    res = await apiClient.put(url, file)
  } catch (err: any) {
    console.error('[uploadToS3] ✗ request failed')
    console.error('[uploadToS3]   error message:', err.message)
    console.error('[uploadToS3]   config url:', err.config?.url)
    console.error('[uploadToS3]   config baseURL:', err.config?.baseURL)
    console.error('[uploadToS3]   response status:', err.response?.status)
    console.error('[uploadToS3]   response data:', err.response?.data)
    throw err
  }

  console.log('[uploadToS3] ← status:', res.status, '| data:', res.data)
  return res
}

export async function fetchGameManifest(gameId: string) {
  console.log(`[fetchGameManifest] → GET /gamelift/games/${gameId}/manifest`)
  const res = await apiClient.get(`/gamelift/games/${gameId}/manifest`)
  console.log('[fetchGameManifest] ← status:', res.status, '| data:', res.data)
  return res.data.data
}

export async function fetchGame(gameId: string) {
  console.log(`[fetchGame] → GET /gamelift/games/${gameId}`)
  const res = await apiClient.get(`/gamelift/games/${gameId}`)
  console.log('[fetchGame] ← status:', res.status, '| data:', res.data)
  return res.data.data
}