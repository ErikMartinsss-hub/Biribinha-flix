export interface Channel {
  id: string
  name: string
  category: string
  poster?: string
}

// Converte nome do canal para slug da SuperFlix: minusculo, sem espacos, sem caracteres especiais
export const toSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]/g, '')

export const CHANNELS: Channel[] = [
  // Filmes e Séries
  { id: 'amc', name: 'AMC', category: 'Filmes e Séries' },
  { id: 'ae', name: 'A&E', category: 'Filmes e Séries' },
  { id: 'adultswim', name: 'Adult Swim', category: 'Filmes e Séries' },
  { id: 'axn', name: 'AXN', category: 'Filmes e Séries' },
  { id: 'arte1', name: 'Arte1', category: 'Filmes e Séries' },
  { id: 'canale', name: 'Canal E!', category: 'Filmes e Séries' },
  { id: 'canaloff', name: 'Canal Off', category: 'Filmes e Séries' },
  { id: 'cinemax', name: 'Cinemax', category: 'Filmes e Séries' },
  { id: 'fx', name: 'FX', category: 'Filmes e Séries' },
  { id: 'hbo', name: 'HBO', category: 'Filmes e Séries' },
  { id: 'hbo2', name: 'HBO 2', category: 'Filmes e Séries' },
  { id: 'hbofamily', name: 'HBO Family', category: 'Filmes e Séries' },
  { id: 'hbomundi', name: 'HBO Mundi', category: 'Filmes e Séries' },
  { id: 'hboplus', name: 'HBO Plus', category: 'Filmes e Séries' },
  { id: 'hbopop', name: 'HBO Pop', category: 'Filmes e Séries' },
  { id: 'hbosignature', name: 'HBO Signature', category: 'Filmes e Séries' },
  { id: 'hboxtreme', name: 'HBO Xtreme', category: 'Filmes e Séries' },
  { id: 'max', name: 'Max', category: 'Filmes e Séries' },
  { id: 'maxprime', name: 'Max Prime', category: 'Filmes e Séries' },
  { id: 'megapix', name: 'Megapix', category: 'Filmes e Séries' },
  { id: 'telecinepremium', name: 'Telecine Premium', category: 'Filmes e Séries' },
  { id: 'telecineaction', name: 'Telecine Action', category: 'Filmes e Séries' },
  { id: 'telecinetouch', name: 'Telecine Touch', category: 'Filmes e Séries' },
  { id: 'telecinefun', name: 'Telecine Fun', category: 'Filmes e Séries' },
  { id: 'telecinepipoca', name: 'Telecine Pipoca', category: 'Filmes e Séries' },
  { id: 'telecinecult', name: 'Telecine Cult', category: 'Filmes e Séries' },
  { id: 'paramount', name: 'Paramount', category: 'Filmes e Séries' },
  { id: 'sony', name: 'Sony Channel', category: 'Filmes e Séries' },
  { id: 'space', name: 'Space', category: 'Filmes e Séries' },
  { id: 'starchannel', name: 'Star Channel', category: 'Filmes e Séries' },
  { id: 'syfy', name: 'Syfy', category: 'Filmes e Séries' },
  { id: 'tcm', name: 'TCM', category: 'Filmes e Séries' },
  { id: 'universaltv', name: 'Universal TV', category: 'Filmes e Séries' },
  { id: 'warnerchannel', name: 'Warner Channel', category: 'Filmes e Séries' },

  // Documentários
  { id: 'animalplanet', name: 'Animal Planet', category: 'Documentários' },
  { id: 'discoverychannel', name: 'Discovery Channel', category: 'Documentários' },
  { id: 'discoveryhh', name: 'Discovery Home & Health', category: 'Documentários' },
  { id: 'historychannel', name: 'History Channel', category: 'Documentários' },
  { id: 'investigationdiscovery', name: 'Investigation Discovery', category: 'Documentários' },
  { id: 'natgeo', name: 'National Geographic', category: 'Documentários' },

  // Canais Abertos
  { id: 'band', name: 'Band', category: 'Canais Abertos' },
  { id: 'bandsp', name: 'Band SP', category: 'Canais Abertos' },
  { id: 'canalbrasil', name: 'Canal Brasil', category: 'Canais Abertos' },
  { id: 'canalgov', name: 'Canal Gov', category: 'Canais Abertos' },
  { id: 'culturapaulista', name: 'TV Cultura', category: 'Canais Abertos' },
  { id: 'globo', name: 'Globo', category: 'Canais Abertos' },
  { id: 'recordtv', name: 'Record TV', category: 'Canais Abertos' },
  { id: 'redebrasil', name: 'Rede Brasil', category: 'Canais Abertos' },
  { id: 'redetv', name: 'Rede TV!', category: 'Canais Abertos' },
  { id: 'sbt', name: 'SBT', category: 'Canais Abertos' },

  // Notícias
  { id: 'bandnews', name: 'Band News', category: 'Notícias' },
  { id: 'bloomberg', name: 'Bloomberg', category: 'Notícias' },
  { id: 'cnnbrasil', name: 'CNN Brasil', category: 'Notícias' },
  { id: 'globonews', name: 'Globo News', category: 'Notícias' },
  { id: 'jovempan', name: 'Jovem Pan', category: 'Notícias' },
  { id: 'recordnews', name: 'Record News', category: 'Notícias' },

  // Esportes
  { id: 'bandsports', name: 'Band Sports', category: 'Esportes' },
  { id: 'canalgoat', name: 'Canal Goat', category: 'Esportes' },
  { id: 'combate', name: 'Combate', category: 'Esportes' },
  { id: 'espn', name: 'ESPN', category: 'Esportes' },
  { id: 'espn2', name: 'ESPN 2', category: 'Esportes' },
  { id: 'espn3', name: 'ESPN 3', category: 'Esportes' },
  { id: 'espn4', name: 'ESPN 4', category: 'Esportes' },
  { id: 'premiere', name: 'Premiere', category: 'Esportes' },
  { id: 'sportv', name: 'SporTV', category: 'Esportes' },
  { id: 'sportv2', name: 'SporTV 2', category: 'Esportes' },
  { id: 'sportv3', name: 'SporTV 3', category: 'Esportes' },

  // Infantil / Desenhos
  { id: 'cartoonnetwork', name: 'Cartoon Network', category: 'Infantil' },
  { id: 'cartoonito', name: 'Cartoonito', category: 'Infantil' },
  { id: 'disneychannel', name: 'Disney Channel', category: 'Infantil' },
  { id: 'disneyjunior', name: 'Disney Junior', category: 'Infantil' },
  { id: 'gloob', name: 'Gloob', category: 'Infantil' },
  { id: 'nickelodeon', name: 'Nickelodeon', category: 'Infantil' },

  // Música / Variedades
  { id: 'bis', name: 'Bis', category: 'Música' },
  { id: 'mtv', name: 'MTV', category: 'Música' },
  { id: 'woohoo', name: 'Woohoo', category: 'Música' },
]

export const getChannelUrl = (slug: string) => `https://superflixapi.best/canal/${slug}`

export const CHANNEL_CATEGORIES = [
  'Filmes e Séries',
  'Documentários',
  'Canais Abertos',
  'Notícias',
  'Esportes',
  'Infantil',
  'Música',
] as const
