export interface NotionPayload {
  userId: string
  personaId?: string
  personaTitle?: string
  summary: string
  metadata?: Record<string, unknown>
  markdownContent?: string
  timestamp?: string
}

export async function sendToNotion(payload: NotionPayload, explicitWebhook?: string) {
  const webhookUrl = explicitWebhook ?? import.meta.env.VITE_NOTION_WEBHOOK_URL

  if (!webhookUrl) {
    throw new Error('Aucune URL de webhook Notion n\'est configurée.');
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...payload,
      timestamp: payload.timestamp ?? new Date().toISOString()
    })
  })

  if (!response.ok) {
    const details = await response.text().catch(() => response.statusText)
    throw new Error(`Envoi vers Notion impossible (${response.status}): ${details}`)
  }

  try {
    return await response.json()
  } catch {
    return null
  }
}
