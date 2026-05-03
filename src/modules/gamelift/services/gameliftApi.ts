import apiClient from '@/shared/api/apiClient'
import { useAuthStore } from '@/modules/auth/store/authStore'

export async function fetchGames() {
  const res = await apiClient.get('/gamelift/games')
  return res.data.data
}

export async function initUpload(gameData: {
  game_name: string
  vm_id: string
  manifest: object
}) {
  const res = await apiClient.post('/gamelift/games/init-upload', gameData)
  return res.data.data
}

export async function uploadToS3(url: string, file: File) {
  const finalUrl = url.startsWith('/') ? `${window.location.origin}${url}` : url

  const authStore = useAuthStore()
  const res = await apiClient.put(finalUrl, file, {
    headers: {
      'Content-Type': 'application/zip',
      'Authorization': `Bearer ${authStore.token}`
    },
  })

  return res
}

export async function fetchGameManifest(gameId: string) {
  const res = await apiClient.get(`/gamelift/games/${gameId}/manifest`)
  return res.data.data
}



export async function fetchGame(gameId: string) {
//   const res = await apiClient.get(`gamelift/games/${gameId}`)
//   return res.data.data
}


