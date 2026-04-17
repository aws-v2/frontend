const API_BASE_V1 = '/api/v1'

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchGames() {
    const res = await fetch(`${API_BASE_V1}/gamelift/games`, {
        headers: { ...getAuthHeaders() },
    })
    if (!res.ok) throw new Error('Failed to fetch games')
    const json = await res.json()
    return json.data
}

export async function initUpload(gameData: { game_name: string; vm_id: string; manifest: object }) {
    const res = await fetch(`${API_BASE_V1}/gamelift/games/init-upload`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(gameData),
    })
    if (!res.ok) throw new Error('Failed to initiate upload')
    const json = await res.json()
    return json.data
}

export async function uploadToS3(url: string, file: File) {
    const finalUrl = url.startsWith('/') ? `${window.location.origin}${url}` : url
    const res = await fetch(finalUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': 'application/zip',
            ...getAuthHeaders(),
        },
    })
    if (!res.ok) throw new Error('Failed to upload file to storage')
    return res
}

export async function fetchGameManifest(gameId: string) {
    const res = await fetch(`${API_BASE_V1}/gamelift/games/${gameId}/manifest`, {
        headers: { ...getAuthHeaders() },
    })
    if (!res.ok) throw new Error('Failed to fetch game manifest')
    const json = await res.json()
    return json.data
}
