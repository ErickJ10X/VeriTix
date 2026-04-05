import type { H3Event } from 'h3'
import type { PaginatedResponse } from '~/types'
import { getQuery } from 'h3'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

function getQueryValue(event: H3Event, key: string): string | undefined {
  const value = getQuery(event)[key]

  if (Array.isArray(value)) {
    return value[0]?.toString()
  }

  return value?.toString()
}

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<PaginatedResponse<unknown>>(event, '/events', {
    method: 'GET',
    query: {
      page: getQueryValue(event, 'page'),
      limit: getQueryValue(event, 'limit'),
      city: getQueryValue(event, 'city'),
      genreId: getQueryValue(event, 'genreId'),
      formatId: getQueryValue(event, 'formatId'),
      dateFrom: getQueryValue(event, 'dateFrom'),
      dateTo: getQueryValue(event, 'dateTo'),
      search: getQueryValue(event, 'search'),
    },
  })
})
