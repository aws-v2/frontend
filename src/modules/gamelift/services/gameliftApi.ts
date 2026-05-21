import apiClient from '@/shared/api/apiClient'
import { baseLogger } from '@/shared/config/logger'

/**
 * Small helper to time requests consistently
 */
function startTimer(label: string) {
  const start = Date.now()
  return {
    end: (meta?: Record<string, any>) => {
      const duration = Date.now() - start
      baseLogger.info(`[${label}] completed`, {
        duration_ms: duration,
        ...meta,
      })
    },
  }
}

/**
 * Fetch all games
 */
export async function fetchGames() {
  const timer = startTimer('fetchGames')

  baseLogger.info('[fetchGames] request started', {
    method: 'GET',
    endpoint: '/gamelift/games',
  })

  try {
    const res = await apiClient.get('/gamelift/games')

    baseLogger.info('[fetchGames] response received', {
      status: res.status,
      has_data: !!res.data,
    })

    timer.end({
      status: res.status,
    })

    return res.data
  } catch (err: any) {
    baseLogger.error('[fetchGames] request failed', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    })
    throw err
  }
}

/**
 * Init upload session (GameLift → Storage Service via backend)
 */
export async function initUpload(formData: FormData) {
  const timer = startTimer('initUpload')

  baseLogger.info('[initUpload] request started', {
    endpoint: '/gamelift/games/init-upload',
    game_name: formData.get('game_name'),
    vm_id: formData.get('vm_id'),
    package_name: formData.get('package_name'),
    has_file: !!formData.get('file'),
  })

  try {
    const res = await apiClient.post(
      '/gamelift/games/init-upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    // 🔥 FULL RESPONSE LOG
    baseLogger.info('[initUpload] raw response received', {
      status: res.status,
      data: res.data,
    })

    const result = res.data as {
      game_id: string
      upload_url: string
      object_key: string
      sha256_hint?: string
    }

    timer.end({
      status: res.status,
      game_id: result.game_id,
      object_key: result.object_key,
    })

    baseLogger.info('[initUpload] upload metadata received', {
      game_id: result.game_id,
      object_key: result.object_key,
      upload_url: result.upload_url,
      sha256_hint: result.sha256_hint,
    })

    return result
  } catch (err: any) {
    baseLogger.error('[initUpload] request failed', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    })

    throw err
  }
}
/**
 * Direct upload to S3 / object storage via presigned URL
 */
export async function uploadToS3(url: string, file: File) {
  const timer = startTimer('uploadToS3')

  baseLogger.info('[uploadToS3] upload started', {
    url,
    file_name: file.name,
    file_size: file.size,
    file_type: file.type,
  })

  try {
    const res = await apiClient.put(url, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      // important for presigned URLs (avoid interceptors modifying request)
      transformRequest: [(data) => data],
    })

    baseLogger.info('[uploadToS3] upload successful', {
      status: res.status,
    })

    timer.end({
      status: res.status,
      file_size: file.size,
    })

    return res
  } catch (err: any) {
    baseLogger.error('[uploadToS3] upload failed', {
      message: err.message,
      url,
      file_name: file.name,
      status: err.response?.status,
      response_data: err.response?.data,
    })

    throw err
  }
}

/**
 * Fetch game manifest (CAS-ready metadata)
 */
export async function fetchGameManifest(gameId: string) {
  const timer = startTimer('fetchGameManifest')

  baseLogger.info('[fetchGameManifest] request started', {
    endpoint: `/gamelift/games/${gameId}/manifest`,
    game_id: gameId,
  })

  try {
    const res = await apiClient.get(`/gamelift/games/${gameId}/manifest`)

    baseLogger.info('[fetchGameManifest] response received', {
      status: res.status,
    })

    timer.end({
      status: res.status,
      game_id: gameId,
    })

    return res.data.data
  } catch (err: any) {
    baseLogger.error('[fetchGameManifest] request failed', {
      message: err.message,
      game_id: gameId,
      status: err.response?.status,
    })
    throw err
  }
}

/**
 * Fetch single game
 */
export async function fetchGame(gameId: string) {
  const timer = startTimer('fetchGame')

  baseLogger.info('[fetchGame] request started', {
    endpoint: `/gamelift/games/${gameId}`,
    game_id: gameId,
  })

  try {
    const res = await apiClient.get(`/gamelift/games/${gameId}`)

    baseLogger.info('[fetchGame] response received', {
      status: res.status,
    })

    timer.end({
      status: res.status,
      game_id: gameId,
    })

    return res.data.data
  } catch (err: any) {
    baseLogger.error('[fetchGame] request failed', {
      message: err.message,
      game_id: gameId,
      status: err.response?.status,
    })
    throw err
  }
}