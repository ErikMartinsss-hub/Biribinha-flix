import axios from 'axios'

const api = axios.create({
  baseURL: 'https://reidosembeds.com/api',
})

export interface ChannelData {
  id: string
  name: string
  category: string
  poster?: string
}

export interface EmbedData {
  provider: string
  quality: string
  slug: string
  embed_url: string
}

export interface EventData {
  id: string
  title: string
  description: string
  poster: string
  time1?: string
  time2?: string
  visual_model: 'versus' | 'event'
  event_logo?: string
  competition_logo?: string
  sport_key: string
  start_time: string
  end_time: string
  status: 'live' | 'upcoming' | 'finished'
  category: string
  competition: string
  slug: string
  page_url: string
  embeds: EmbedData[]
}

export interface EventsResponse {
  success: boolean
  data: EventData[]
  total: number
}

export const getChannels = () =>
  api.get<{ success: boolean; data: ChannelData[] }>('/channels').then(r => r.data.data)

export const getChannelById = (id: string) =>
  api.get<{ success: boolean; data: ChannelData }>(`/channels/${id}`).then(r => r.data.data)

export const getChannelCategories = () =>
  api.get<{ success: boolean; data: string[] }>('/channels/categories').then(r => r.data.data)

export const getChannelsByCategory = (category: string) =>
  api.get<{ success: boolean; data: ChannelData[] }>('/channels', { params: { category } }).then(r => r.data.data)

export const getEvents = (params?: { category?: string; status?: string }) =>
  api.get<EventsResponse>('/eventos', { params }).then(r => r.data.data)

export const getEventById = (id: string) =>
  api.get<{ success: boolean; data: EventData }>(`/eventos/${id}`).then(r => r.data.data)

export const getEventCategories = () =>
  api.get<{ success: boolean; data: string[] }>('/eventos/categories').then(r => r.data.data)

export const searchGlobal = (q: string) =>
  api.get<{ success: boolean; data: any[] }>('/pesquisa', { params: { q } }).then(r => r.data.data)

export default api
