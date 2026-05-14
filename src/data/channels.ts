export interface Channel {
  id: string
  name: string
  slug: string
  category: string
  logo?: string
}

export const CHANNELS: Channel[] = [
  { id: 'amc', name: 'AMC', slug: 'amc', category: 'Filmes e Séries' },
  { id: 'hbo', name: 'HBO', slug: 'hbo', category: 'Filmes e Séries' },
  { id: 'hbo2', name: 'HBO 2', slug: 'hbo-2', category: 'Filmes e Séries' },
  { id: 'hboplus', name: 'HBO Plus', slug: 'hbo-plus', category: 'Filmes e Séries' },
  { id: 'hbo-family', name: 'HBO Family', slug: 'hbo-family', category: 'Filmes e Séries' },
  { id: 'hbomundi', name: 'HBO Mundi', slug: 'hbo-mundi', category: 'Filmes e Séries' },
  { id: 'hbopop', name: 'HBO Pop', slug: 'hbo-pop', category: 'Filmes e Séries' },
  { id: 'hbosignature', name: 'HBO Signature', slug: 'hbo-signature', category: 'Filmes e Séries' },
  { id: 'hboplus', name: 'HBO Xtreme', slug: 'hbo-xtreme', category: 'Filmes e Séries' },
  { id: 'max', name: 'Max', slug: 'max', category: 'Filmes e Séries' },
  { id: 'maxprime', name: 'Max Prime', slug: 'max-prime', category: 'Filmes e Séries' },
  { id: 'star', name: 'Star Channel', slug: 'star-channel', category: 'Filmes e Séries' },
  { id: 'fx', name: 'FX', slug: 'fx', category: 'Filmes e Séries' },
  { id: 'axn', name: 'AXN', slug: 'axn', category: 'Filmes e Séries' },
  { id: 'warner', name: 'Warner Channel', slug: 'warner-channel', category: 'Filmes e Séries' },
  { id: 'paramount', name: 'Paramount', slug: 'paramount', category: 'Filmes e Séries' },
  { id: 'megapix', name: 'Megapix', slug: 'megapix', category: 'Filmes e Séries' },
  { id: 'syfy', name: 'Syfy', slug: 'syfy', category: 'Filmes e Séries' },
  { id: 'universal', name: 'Universal TV', slug: 'universal-tv', category: 'Filmes e Séries' },
  { id: 'sony', name: 'Sony Channel', slug: 'sony', category: 'Filmes e Séries' },
  { id: 'cinemax', name: 'Cinemax', slug: 'cinemax', category: 'Filmes e Séries' },
  { id: 'tcm', name: 'TCM', slug: 'tcm', category: 'Filmes e Séries' },
  { id: 'space', name: 'Space', slug: 'space', category: 'Filmes e Séries' },
  { id: 'discovery', name: 'Discovery Channel', slug: 'discovery', category: 'Documentários' },
  { id: 'discoveryh', name: 'Discovery Home & Health', slug: 'discovery-hh', category: 'Documentários' },
  { id: 'discoveryid', name: 'Investigation Discovery', slug: 'investigation-discovery', category: 'Documentários' },
  { id: 'history', name: 'History Channel', slug: 'history', category: 'Documentários' },
  { id: 'natgeo', name: 'National Geographic', slug: 'natgeo', category: 'Documentários' },
  { id: 'animalplanet', name: 'Animal Planet', slug: 'animal-planet', category: 'Documentários' },
  { id: 'globo', name: 'Globo', slug: 'globo', category: 'Abertos' },
  { id: 'band', name: 'Band', slug: 'band', category: 'Abertos' },
  { id: 'sbt', name: 'SBT', slug: 'sbt', category: 'Abertos' },
  { id: 'record', name: 'Record TV', slug: 'record', category: 'Abertos' },
  { id: 'cultura', name: 'TV Cultura', slug: 'tv-cultura', category: 'Abertos' },
  { id: 'redeTV', name: 'Rede TV!', slug: 'redetv', category: 'Abertos' },
  { id: 'cnn', name: 'CNN Brasil', slug: 'cnn-brasil', category: 'Notícias' },
  { id: 'globoNews', name: 'Globo News', slug: 'globo-news', category: 'Notícias' },
  { id: 'recordnews', name: 'Record News', slug: 'record-news', category: 'Notícias' },
  { id: 'bandnews', name: 'Band News', slug: 'band-news', category: 'Notícias' },
  { id: 'jovempan', name: 'Jovem Pan', slug: 'jovem-pan', category: 'Notícias' },
  { id: 'mtv', name: 'MTV', slug: 'mtv', category: 'Música' },
  { id: 'bis', name: 'BIS', slug: 'bis', category: 'Música' },
  { id: 'woohoo', name: 'Woohoo', slug: 'woohoo', category: 'Música' },
  { id: 'espn', name: 'ESPN', slug: 'espn', category: 'Esportes' },
  { id: 'espn2', name: 'ESPN 2', slug: 'espn-2', category: 'Esportes' },
  { id: 'espn3', name: 'ESPN 3', slug: 'espn-3', category: 'Esportes' },
  { id: 'espn4', name: 'ESPN 4', slug: 'espn-4', category: 'Esportes' },
  { id: 'sportv', name: 'SporTV', slug: 'sportv', category: 'Esportes' },
  { id: 'sportv2', name: 'SporTV 2', slug: 'sportv-2', category: 'Esportes' },
  { id: 'sportv3', name: 'SporTV 3', slug: 'sportv-3', category: 'Esportes' },
  { id: 'premiere', name: 'Premiere', slug: 'premiere', category: 'Esportes' },
  { id: 'combate', name: 'Combate', slug: 'combate', category: 'Esportes' },
  { id: 'cartoon', name: 'Cartoon Network', slug: 'cartoon-network', category: 'Infantil' },
  { id: 'nick', name: 'Nickelodeon', slug: 'nickelodeon', category: 'Infantil' },
  { id: 'disney', name: 'Disney Channel', slug: 'disney-channel', category: 'Infantil' },
  { id: 'disneyjr', name: 'Disney Junior', slug: 'disney-junior', category: 'Infantil' },
  { id: 'gloob', name: 'Gloob', slug: 'gloob', category: 'Infantil' },
  { id: 'gloobinho', name: 'Gloobinho', slug: 'gloobinho', category: 'Infantil' },
]

export const CHANNEL_CATEGORIES = [
  'Filmes e Séries',
  'Documentários',
  'Abertos',
  'Notícias',
  'Música',
  'Esportes',
  'Infantil',
] as const

export const getChannelUrl = (slug: string) => `https://superflixapi.online/canal/${slug}`

export const CHANNEL_LOGOS: Record<string, string> = {
  // Seria possivel adicionar URLs de logos aqui
  // Por enquanto usaremos apenas as primeiras letras do nome
}
