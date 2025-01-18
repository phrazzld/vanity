export type Place = {
  id: string
  name: string
  lat: number
  lng: number
  note?: string
}

export const PLACES: Place[] = [
  {
    id: '1',
    name: 'san francisco',
    lat: 37.7749,
    lng: -122.4194,
    note: 'fog city feasting'
  },
  {
    id: '2',
    name: 'los angeles',
    lat: 34.0522,
    lng: -118.2437,
    note: 'caught in la la land'
  },
  {
    id: '3',
    name: 'santa barbara',
    lat: 34.4208,
    lng: -119.6982,
    note: 'coastal calm'
  },
  {
    id: '4',
    name: 'portland',
    lat: 45.5152,
    lng: -122.6784,
    note: 'sip sippin that artisanal coffee'
  },
  {
    id: '5',
    name: 'nashville',
    lat: 36.1627,
    lng: -86.7816,
    note: 'honky tonk hysteria'
  },
  {
    id: '6',
    name: 'miami',
    lat: 25.7617,
    lng: -80.1918,
    note: 'sunlit neon paradise'
  },
  {
    id: '7',
    name: 'hong kong',
    lat: 22.3193,
    lng: 114.1694,
    note: 'skyscraper sorcery'
  },
  {
    id: '8',
    name: 'berlin',
    lat: 52.52,
    lng: 13.405,
    note: 'techno nights for days'
  },
  {
    id: '9',
    name: 'munich',
    lat: 48.1351,
    lng: 11.582,
    note: 'oktoberfest forever'
  },
  {
    id: '10',
    name: 'london',
    lat: 51.5072,
    lng: -0.1276,
    note: 'sipping tea in london town'
  },
  {
    id: '11',
    name: 'paris',
    lat: 48.8566,
    lng: 2.3522,
    note: 'oui oui croissant illusions'
  },
  {
    id: '12',
    name: 'barcelona',
    lat: 41.3851,
    lng: 2.1734,
    note: 'gaudí reveries'
  },
  {
    id: '13',
    name: 'madrid',
    lat: 40.4168,
    lng: -3.7038,
    note: 'late-night tapas mania'
  },
  {
    id: '14',
    name: 'chania',
    lat: 35.5138,
    lng: 24.018,
    note: 'crystal waters, ancient vibes'
  },
  {
    id: '15',
    name: 'budapest',
    lat: 47.4979,
    lng: 19.0402,
    note: 'danube drifting, ruin bar thriving'
  },
  {
    id: '16',
    name: 'holbox',
    lat: 21.5215,
    lng: -87.3086,
    note: 'laid-back island hush'
  },
  {
    id: '17',
    name: 'cancún',
    lat: 21.1619,
    lng: -86.8515,
    note: 'resort frolic by the sea'
  },
  {
    id: '18',
    name: 'san josé, costa rica',
    lat: 9.9281,
    lng: -84.0907,
    note: 'pura vida in the big city'
  },
  {
    id: '19',
    name: 'la fortuna, costa rica',
    lat: 10.4715,
    lng: -84.6453,
    note: 'volcanic wonders, hot springs bliss'
  },
  {
    id: '20',
    name: 'nuevo arenal, costa rica',
    lat: 10.5337,
    lng: -84.9158,
    note: 'misty lakeside chill'
  },
  {
    id: '21',
    name: 'knoxville',
    lat: 35.9606,
    lng: -83.9207,
    note: 'rocky top rollin'
  },
  {
    id: '22',
    name: 'petaluma',
    lat: 38.2324,
    lng: -122.6367,
    note: 'sonoma county swirl'
  },
  {
    id: '23',
    name: 'santa rosa',
    lat: 38.4404,
    lng: -122.7141,
    note: 'wine country trifecta'
  },
  {
    id: '24',
    name: 'berkeley',
    lat: 37.8715,
    lng: -122.273,
    note: 'free speech mecca, quirky vibes'
  },
  {
    id: '25',
    name: 'santa cruz',
    lat: 36.9741,
    lng: -122.0308,
    note: 'surf city chill'
  },
  {
    id: '26',
    name: 'laytonville',
    lat: 39.6901,
    lng: -123.4831,
    note: 'off-grid, stargazing zone'
  },
  {
    id: '27',
    name: 'willits',
    lat: 39.4093,
    lng: -123.3558,
    note: 'gateway to the redwoods'
  },
  {
    id: '28',
    name: 'ukiah',
    lat: 39.1502,
    lng: -123.2078,
    note: 'mendocino foothills mellow'
  },
  {
    id: '29',
    name: 'oakland',
    lat: 37.8044,
    lng: -122.2711,
    note: 'bay area grit and soul'
  },
  {
    id: '30',
    name: 'san diego',
    lat: 32.7157,
    lng: -117.1611,
    note: 'america’s finest city allegedly'
  },
  {
    id: '31',
    name: 'austin',
    lat: 30.2672,
    lng: -97.7431,
    note: 'keep it weird, ya’ll'
  },
  {
    id: '32',
    name: 'dallas',
    lat: 32.7767,
    lng: -96.797,
    note: 'big d hustle'
  },
  {
    id: '33',
    name: 'boise',
    lat: 43.615,
    lng: -116.2023,
    note: 'idaho gem state glow'
  },
  {
    id: '34',
    name: 'denver',
    lat: 39.7392,
    lng: -104.9903,
    note: 'mile-high mania'
  },
  {
    id: '35',
    name: 'aspen',
    lat: 39.1911,
    lng: -106.8175,
    note: 'mountain bougie glitz'
  },
  {
    id: '36',
    name: 'phoenix',
    lat: 33.4484,
    lng: -112.074,
    note: 'sweltering desert sprawl'
  },
  {
    id: '37',
    name: 'baltimore',
    lat: 39.2904,
    lng: -76.6122,
    note: 'crabcake hustle'
  },
  {
    id: '38',
    name: 'new york city',
    lat: 40.7128,
    lng: -74.006,
    note: 'the city that never sleeps, huh'
  },
  {
    id: '39',
    name: 'washington dc',
    lat: 38.9072,
    lng: -77.0369,
    note: 'capitol drama incarnate'
  },
  {
    id: '40',
    name: 'dalton',
    lat: 34.7698,
    lng: -84.9702,
    note: 'carpet capital of the world??'
  },
  {
    id: '41',
    name: 'chicago',
    lat: 41.8781,
    lng: -87.6298,
    note: 'deep dish delirium'
  },
  {
    id: '42',
    name: 'oaxaca',
    lat: 17.0732,
    lng: -96.7266,
    note: 'mole, mezcal, magical nights'
  },
  {
    id: '43',
    name: 'rome',
    lat: 41.9028,
    lng: 12.4964,
    note: 'eternal city empire'
  },
  {
    id: '44',
    name: 'florence',
    lat: 43.7696,
    lng: 11.2558,
    note: 'renaissance wonderland'
  },
  {
    id: '45',
    name: 'amalfi',
    lat: 40.6333,
    lng: 14.6029,
    note: 'cliffside lemon dream'
  },
  {
    id: '46',
    name: 'oahu',
    lat: 21.4389,
    lng: -158.0001,
    note: 'aloha wave riding'
  },
  {
    id: '47',
    name: 'boston',
    lat: 42.3601,
    lng: -71.0589,
    note: 'wicked smart kid'
  },
  {
    id: '48',
    name: 'cascades, idaho',
    lat: 44.5163,
    lng: -115.9644,
    note: 'mountain lakes & secrecy'
  },
  {
    id: '49',
    name: 'reno',
    lat: 39.5296,
    lng: -119.8138,
    note: 'biggest little city claims'
  },
  {
    id: '50',
    name: 'las vegas',
    lat: 36.1699,
    lng: -115.1398,
    note: 'sin city illusions'
  },
  {
    id: '51',
    name: 'sausalito',
    lat: 37.8591,
    lng: -122.4853,
    note: 'bayfront chill across the golden gate'
  },
  {
    id: '52',
    name: 'yuba city',
    lat: 39.1404,
    lng: -121.6169,
    note: 'heart of the valley farmland'
  },
  {
    id: '53',
    name: 'mendocino',
    lat: 39.3071,
    lng: -123.7995,
    note: 'windswept coastal hush'
  },
  {
    id: '54',
    name: 'fort bragg',
    lat: 39.4457,
    lng: -123.8053,
    note: 'glass beach, pacific breeze'
  },
  {
    id: '55',
    name: 'san luis obispo',
    lat: 35.2828,
    lng: -120.6596,
    note: 'slo life, tri-tip mania'
  },
  {
    id: '56',
    name: 'yosemite',
    lat: 37.8651,
    lng: -119.5383,
    note: 'granite giants and waterfalls, unbelievably gorg'
  },
  {
    id: '57',
    name: 'franklin',
    lat: 35.9251,
    lng: -86.8689,
    note: 'small-town tennessee gem'
  },
  {
    id: '58',
    name: 'daly city',
    lat: 37.6879,
    lng: -122.4702,
    note: 'the gateway to fogtown, basically sf’s cousin'
  },
  {
    id: '59',
    name: 'san jose',
    lat: 37.3382,
    lng: -121.8863,
    note: 'silicon valley sprawl meets taco truck heaven'
  },
  {
    id: '60',
    name: 'san rafael',
    lat: 37.9735,
    lng: -122.5311,
    note: 'marin hub with hidden charm'
  },
  {
    id: '61',
    name: 'fairfax',
    lat: 37.9869,
    lng: -122.5889,
    note: 'hipster mountain biker paradise'
  },
  {
    id: '62',
    name: 'larkspur',
    lat: 37.9341,
    lng: -122.535,
    note: 'golden gate ferry vibes'
  },
  {
    id: '63',
    name: 'san anselmo',
    lat: 37.9744,
    lng: -122.5615,
    note: 'quiet downtown, scenic creeks'
  },
  {
    id: '64',
    name: 'novato',
    lat: 38.1074,
    lng: -122.5697,
    note: 'suburb with rolling hills, chill nooks'
  },
  {
    id: '65',
    name: 'sebastopol',
    lat: 38.4021,
    lng: -122.8239,
    note: 'boho orchard sprawl and art enclaves'
  },
  {
    id: '66',
    name: 'inverness',
    lat: 38.0979,
    lng: -122.8522,
    note: 'gateway to point reyes hush'
  },
  {
    id: '67',
    name: 'bodega bay',
    lat: 38.3339,
    lng: -123.0486,
    note: 'hitchcock vibes, fresh crab, breezy coasts'
  },
  {
    id: '68',
    name: 'point reyes',
    lat: 38.0694,
    lng: -122.8064,
    note: 'windswept trails, local oysters, big mood'
  },
  {
    id: '69',
    name: 'mexico city',
    lat: 19.4326,
    lng: -99.1332,
    note: 'cdmx hustle, dope street food, cultural overload'
  }
]
