import { apiClient } from './apiClient'
import { getVisitorId } from '@/utils/visitorId'

/**
 * Fire-and-forget: powers the "Traffic" section of the Django admin
 * dashboard (see rj-backend apps.analytics). Never throws - a blocked or
 * failed beacon shouldn't affect the page the visitor is actually using.
 */
export function recordPageView(path: string): void {
  apiClient
    .post('/analytics/pageview/', {
      path,
      referrer: document.referrer.slice(0, 255),
      visitor_id: getVisitorId(),
    })
    .catch(() => {})
}
