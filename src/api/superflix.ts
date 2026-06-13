const BASE = 'https://superflixapi.cyou'

export const getStreamUrl = (type: 'filme' | 'serie', id: number, season?: number, episode?: number) => {
  if (type === 'serie') {
    return `${BASE}/serie/${id}/${season ?? 1}/${episode ?? 1}`
  }
  return `${BASE}/filme/${id}`
}
