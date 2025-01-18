export type Reading = {
  slug: string;
  title: string;
  author: string;
  finishedDate: Date | null;
  coverImageSrc: string | null;
  thoughts: string;
  dropped: boolean;
}

const READINGS_CURRENTLY: Reading[] = [
  {
    slug: 'the-story-of-civilization-volume-i-our-oriental-heritage',
    title: 'The Story of Civilization:: Volume I: Our Oriental Heritage',
    author: 'Will Durant',
    finishedDate: null,
    coverImageSrc: '/readings/the-story-of-civilization-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-silmarillion',
    title: 'The Silmarillion',
    author: 'J.R.R. Tolkien',
    finishedDate: null,
    coverImageSrc: '/readings/the-silmarillion-01.jpg',
    thoughts: '', dropped: false
  },
]

const READINGS_2025: Reading[] = []

const READINGS_2024: Reading[] = [
  {
    slug: 'how-to-win-friends-and-influence-people',
    title: 'How to Win Friends and Influence People',
    author: 'Dale Carnegie',
    finishedDate: new Date('2024-01-30'),
    coverImageSrc: '/readings/how-to-win-friends-and-influence-people-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'berserk',
    title: 'Berserk',
    author: 'Kentaro Miura',
    finishedDate: new Date('2024-02-03'),
    coverImageSrc: '/readings/berserk-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'salt-fat-acid-heat',
    title: 'Salt Fat Acid Heat',
    author: 'Samin Nosrat',
    finishedDate: new Date('2024-02-09'),
    coverImageSrc: '/readings/salt-fat-acid-heat-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'gradually-then-suddenly',
    title: 'Gradually, Then Suddenly',
    author: 'Parker Lewis',
    finishedDate: new Date('2024-02-16'),
    coverImageSrc: '/readings/gradually-then-suddenly-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-divine-comedy-purgatorio',
    title: 'The Divine Comedy: The Purgatorio',
    author: 'Dante Alighieri',
    finishedDate: new Date('2024-02-20'),
    coverImageSrc: '/readings/the-divine-comedy-purgatorio-02.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'galapagos',
    title: 'Galapagos',
    author: 'Kurt Vonnegut',
    finishedDate: new Date('2024-03-16'),
    coverImageSrc: '/readings/galapagos-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-divine-comedy-paradiso',
    title: 'The Divine Comedy: The Paradiso',
    author: 'Dante Alighieri',
    finishedDate: new Date('2024-04-16'),
    coverImageSrc: '/readings/the-divine-comedy-paradiso-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'a-prayer-journal',
    title: 'A Prayer Journal',
    author: 'Flannery O\'Connor',
    finishedDate: new Date('2024-05-19'),
    coverImageSrc: '/readings/prayer-journal-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-bible',
    title: 'The Bible',
    author: '',
    finishedDate: new Date('2024-06-11'),
    coverImageSrc: '/readings/holy-bible-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-screwtape-letters',
    title: 'The Screwtape Letters',
    author: 'C.S. Lewis',
    finishedDate: new Date('2024-06-16'),
    coverImageSrc: '/readings/screwtape-letters-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-book-of-five-rings',
    title: 'The Book of Five Rings',
    author: 'Miyamoto Musashi',
    finishedDate: new Date('2024-06-25'),
    coverImageSrc: '/readings/the-book-of-five-rings-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'reasonable-faith',
    title: 'Reasonable Faith',
    author: 'William Lane Craig',
    finishedDate: new Date('2024-08-03'),
    coverImageSrc: '/readings/reasonable-faith-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-everlasting-man',
    title: 'The Everlasting Man',
    author: 'G.K. Chesterton',
    finishedDate: new Date('2024-08-27'),
    coverImageSrc: '/readings/the-everlasting-man-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'saint-thomas-aquinas',
    title: 'Saint Thomas Aquinas',
    author: 'G.K. Chesterton',
    finishedDate: new Date('2024-09-25'),
    coverImageSrc: '/readings/saint-thomas-aquinas-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'when-the-church-was-young',
    title: 'When the Church Was Young',
    author: 'Marcellino D\'Ambrosio',
    finishedDate: new Date('2024-10-20'),
    coverImageSrc: '/readings/when-the-church-was-young-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-promised-neverland',
    title: 'The Promised Neverland',
    author: 'Kaiu Shirai',
    finishedDate: new Date('2024-11-11'),
    coverImageSrc: '/readings/the-promised-neverland-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'story-of-a-soul',
    title: 'Story of a Soul',
    author: 'St. Therese of Lisieux',
    finishedDate: new Date('2024-11-15'),
    coverImageSrc: '/readings/story-of-a-soul-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'catechism-of-the-catholic-church',
    title: 'Catechism of the Catholic Church',
    author: '',
    finishedDate: new Date('2024-11-18'),
    coverImageSrc: '/readings/catechism-of-the-catholic-church-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'walking-with-god',
    title: 'Walking with God',
    author: 'Tim Gray and Jeff Cavins',
    finishedDate: new Date('2024-12-05'),
    coverImageSrc: '/readings/walking-with-god-01.jpg',
    thoughts: '', dropped: false
  },
]

const READINGS_2023: Reading[] = [
  {
    slug: 'the-fiat-standard',
    title: 'The Fiat Standard',
    author: 'Saifedean Ammous',
    finishedDate: new Date('2023-01-10'),
    coverImageSrc: '/readings/the-fiat-standard-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-man-without-a-face',
    title: 'The Man Without a Face',
    author: 'Masha Gessen',
    finishedDate: new Date('2023-01-12'),
    coverImageSrc: '/readings/the-man-without-a-face-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-one-world-schoolhouse',
    title: 'The One World Schoolhouse',
    author: 'Salman Khan',
    finishedDate: new Date('2023-01-16'),
    coverImageSrc: '/readings/the-one-world-schoolhouse-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'euthyphro',
    title: 'Euthyphro',
    author: 'Plato',
    finishedDate: new Date('2023-01-18'),
    coverImageSrc: '/readings/euthyphro-01.jpeg',
    thoughts: '', dropped: false
  },
  {
    slug: 'apology',
    title: 'Apology',
    author: 'Plato',
    finishedDate: new Date('2023-01-18'),
    coverImageSrc: '/readings/apology-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'human-action',
    title: 'Human Action',
    author: 'Ludwig Von Mises',
    finishedDate: new Date('2023-01-22'),
    coverImageSrc: '/readings/human-action-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'crito',
    title: 'Crito',
    author: 'Plato',
    finishedDate: new Date('2023-01-24'),
    coverImageSrc: '/readings/crito-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'where-wizards-stay-up-late',
    title: 'Where Wizards Stay Up Late',
    author: 'Katie Hafner',
    finishedDate: new Date('2023-01-27'),
    coverImageSrc: '/readings/where-wizards-stay-up-late-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'phaedo',
    title: 'Phaedo',
    author: 'Plato',
    finishedDate: new Date('2023-02-23'),
    coverImageSrc: '/readings/phaedo-02.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'andrew-carnegie',
    title: 'Andrew Carnegie',
    author: 'David Nasaw',
    finishedDate: new Date('2023-03-08'),
    coverImageSrc: '/readings/andrew-carnegie-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'mere-christianity',
    title: 'Mere Christianity',
    author: 'C.S. Lewis',
    finishedDate: new Date('2023-03-14'),
    coverImageSrc: '/readings/mere-christianity-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'impromptu',
    title: 'Impromptu',
    author: 'Reid Hoffman',
    finishedDate: new Date('2023-03-26'),
    coverImageSrc: '/readings/impromptu-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'debt',
    title: 'Debt',
    author: 'David Graeber',
    finishedDate: new Date('2023-04-05'),
    coverImageSrc: '/readings/debt-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'softwar',
    title: 'Softwar',
    author: 'Jason P. Lowery',
    finishedDate: new Date('2023-04-29'),
    coverImageSrc: '/readings/softwar-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-bhagavad-gita',
    title: 'The Bhagavad Gita',
    author: '',
    finishedDate: new Date('2023-05-02'),
    coverImageSrc: '/readings/bhagavad-gita-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'cratylus',
    title: 'Cratylus',
    author: 'Plato',
    finishedDate: new Date('2023-05-04'),
    coverImageSrc: '/readings/cratylus-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'theaetetus',
    title: 'Theaetetus',
    author: 'Plato',
    finishedDate: new Date('2023-05-06'),
    coverImageSrc: '/readings/theaetetus-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'napoleon',
    title: 'Napoleon',
    author: 'Andrew Roberts',
    finishedDate: new Date('2023-05-06'),
    coverImageSrc: '/readings/napoleon-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'neuromancer',
    title: 'Neuromancer',
    author: 'William Gibson',
    finishedDate: new Date('2023-05-07'),
    coverImageSrc: '/readings/neuromancer-02.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'orthodoxy',
    title: 'Orthodoxy',
    author: 'G.K. Chesterton',
    finishedDate: new Date('2023-05-13'),
    coverImageSrc: '/readings/orthodoxy-01.webp',
    thoughts: '', dropped: false
  },
  {
    slug: 'deadeye-dick',
    title: 'Deadeye Dick',
    author: 'Kurt Vonnegut',
    finishedDate: new Date('2023-05-15'),
    coverImageSrc: '/readings/deadeye-dick-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'means-of-ascent',
    title: 'Means of Ascent',
    author: 'Robert A. Caro',
    finishedDate: new Date('2023-05-24'),
    coverImageSrc: '/readings/means-of-ascent-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'thus-spoke-zarathustra',
    title: 'Thus Spoke Zarathustra',
    author: 'Friedrich Nietzsche',
    finishedDate: new Date('2023-07-15'),
    coverImageSrc: '/readings/thus-spoke-zarathustra-01.webp',
    thoughts: '', dropped: false
  },
  {
    slug: 'master-of-the-senate',
    title: 'Master of the Senate',
    author: 'Robert A. Caro',
    finishedDate: new Date('2023-08-01'),
    coverImageSrc: '/readings/master-of-the-senate-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'working',
    title: 'Working',
    author: 'Robert A. Caro',
    finishedDate: new Date('2023-09-27'),
    coverImageSrc: '/readings/working-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'hidden-repression',
    title: 'Hidden Repression',
    author: 'Alex Gladstein',
    finishedDate: new Date('2023-10-08'),
    coverImageSrc: '/readings/hidden-repression-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'confessions',
    title: 'Confessions',
    author: 'St. Augustine',
    finishedDate: new Date('2023-10-12'),
    coverImageSrc: '/readings/confessions-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'sophist',
    title: 'Sophist',
    author: 'Plato',
    finishedDate: new Date('2023-10-17'),
    coverImageSrc: '/readings/sophist-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'blood-meridian',
    title: 'Blood Meridian',
    author: 'Cormac McCarthy',
    finishedDate: new Date('2023-10-28'),
    coverImageSrc: '/readings/blood-meridian-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'broken-money',
    title: 'Broken Money',
    author: 'Lyn Alden',
    finishedDate: new Date('2023-11-10'),
    coverImageSrc: '/readings/broken-money-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-dark-forest',
    title: 'The Dark Forest',
    author: 'Cixin Liu',
    finishedDate: new Date('2023-11-15'),
    coverImageSrc: '/readings/the-dark-forest-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'death-s-end',
    title: 'Death\'s End',
    author: 'Cixin Liu',
    finishedDate: new Date('2023-11-25'),
    coverImageSrc: '/readings/deaths-end-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'bluebeard',
    title: 'Bluebeard',
    author: 'Kurt Vonnegut',
    finishedDate: new Date('2023-12-02'),
    coverImageSrc: '/readings/bluebeard-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-killing-joke',
    title: 'The Killing Joke',
    author: 'Alan Moore',
    finishedDate: new Date('2023-12-02'),
    coverImageSrc: '/readings/the-killing-joke-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'facing-violence',
    title: 'Facing Violence',
    author: 'Rory Miller',
    finishedDate: new Date('2023-12-08'),
    coverImageSrc: '/readings/facing-violence-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-creative-act',
    title: 'The Creative Act',
    author: 'Rick Rubin',
    finishedDate: new Date('2023-12-10'),
    coverImageSrc: '/readings/the-creative-act-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-divine-comedy-inferno',
    title: 'The Divine Comedy: The Inferno',
    author: 'Dante Alighieri',
    finishedDate: new Date('2023-12-15'),
    coverImageSrc: '/readings/the-divine-comedy-inferno-01.jpg',
    thoughts: '', dropped: false
  },
]

const READINGS_2022: Reading[] = [
  {
    slug: 'god-bless-you-mr-rosewater',
    title: 'God Bless You, Mr. Rosewater',
    author: 'Kurt Vonnegut',
    finishedDate: new Date('2022-01-11'),
    coverImageSrc: '/readings/god-bless-you-mr-rosewater-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'true-names',
    title: 'True Names',
    author: 'Vernor Vinge',
    finishedDate: new Date('2022-01-16'),
    coverImageSrc: '/readings/true-names-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    finishedDate: new Date('2022-02-11'),
    coverImageSrc: '/readings/meditations-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'east-of-eden',
    title: 'East of Eden',
    author: 'John Steinbeck',
    finishedDate: new Date('2022-02-13'),
    coverImageSrc: '/readings/east-of-eden-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'mastering-the-lightning-network',
    title: 'Mastering the Lightning Network',
    author: 'Andreas M. Antonopoulos',
    finishedDate: new Date('2022-02-25'),
    coverImageSrc: '/readings/mastering-the-lightning-network-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'jailbird',
    title: 'Jailbird',
    author: 'Kurt Vonnegut',
    finishedDate: new Date('2022-03-01'),
    coverImageSrc: '/readings/jailbird-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'bone',
    title: 'Bone',
    author: 'Jeff Smith',
    finishedDate: new Date('2022-03-06'),
    coverImageSrc: '/readings/bone-02.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'letters-from-a-stoic',
    title: 'Letters From a Stoic',
    author: 'Seneca',
    finishedDate: new Date('2022-03-09'),
    coverImageSrc: '/readings/letters-from-a-stoic-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'extreme-privacy',
    title: 'Extreme Privacy',
    author: 'Michael Bazzell',
    finishedDate: new Date('2022-03-12'),
    coverImageSrc: '/readings/extreme-privacy-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'thank-god-for-bitcoin',
    title: 'Thank God for Bitcoin',
    author: 'The Bitcoin and Bible Group',
    finishedDate: new Date('2022-03-14'),
    coverImageSrc: '/readings/thank-god-for-bitcoin-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'check-your-financial-privilege',
    title: 'Check Your Financial Privilege',
    author: 'Alex Gladstein',
    finishedDate: new Date('2022-03-26'),
    coverImageSrc: '/readings/check-your-financial-privilege-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-urban-homestead',
    title: 'The Urban Homestead',
    author: 'Kelly Coyne',
    finishedDate: new Date('2022-03-27'),
    coverImageSrc: '/readings/the-urban-homestead-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'nausicaa-of-the-valley-of-the-wind',
    title: 'Nausicaä of the Valley of the Wind',
    author: 'Hayao Miyazaki',
    finishedDate: new Date('2022-03-30'),
    coverImageSrc: '/readings/nausicaa-01.webp',
    thoughts: '', dropped: false
  },
  {
    slug: 'ghost-in-the-shell',
    title: 'Ghost in the Shell',
    author: 'Masamune Shirow',
    finishedDate: new Date('2022-04-25'),
    coverImageSrc: '/readings/ghost-in-the-shell-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'bitcoin-is-venice',
    title: 'Bitcoin Is Venice',
    author: 'Allen Farrington',
    finishedDate: new Date('2022-04-30'),
    coverImageSrc: '/readings/bitcoin-is-venice-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-mandibles',
    title: 'The Mandibles',
    author: 'Lionel Shriver',
    finishedDate: new Date('2022-05-04'),
    coverImageSrc: '/readings/the-mandibles-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'free-software-free-society',
    title: 'Free Software, Free Society',
    author: 'Richard M. Stallman',
    finishedDate: new Date('2022-05-10'),
    coverImageSrc: '/readings/free-software-free-society-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'working-in-public',
    title: 'Working in Public',
    author: 'Nadia Eghbal',
    finishedDate: new Date('2022-06-07'),
    coverImageSrc: '/readings/working-in-public-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'leviathan-falls',
    title: 'Leviathan Falls',
    author: 'James S.A. Corey',
    finishedDate: new Date('2022-06-19'),
    coverImageSrc: '/readings/leviathan-falls-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'lonesome-dove',
    title: 'Lonesome Dove',
    author: 'Larry McMurtry',
    finishedDate: new Date('2022-06-28'),
    coverImageSrc: '/readings/lonesome-dove-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-aeneid',
    title: 'The Aeneid',
    author: 'Virgil',
    finishedDate: new Date('2022-12-12'),
    coverImageSrc: '/readings/the-aeneid-01.jpg',
    thoughts: '', dropped: false
  },

]

const READINGS_2021: Reading[] = [
  {
    slug: 'mastering-bitcoin',
    title: 'Mastering Bitcoin',
    author: 'Andreas M. Antonopoulos',
    finishedDate: new Date('2021-01-09'),
    coverImageSrc: '/readings/mastering-bitcoin-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-three-body-problem',
    title: 'The Three-Body Problem',
    author: 'Cixin Liu',
    finishedDate: new Date('2021-01-28'),
    coverImageSrc: '/readings/the-three-body-problem-01.webp',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-fourth-turning',
    title: 'The Fourth Turning',
    author: 'William Strauss',
    finishedDate: new Date('2021-02-10'),
    coverImageSrc: '/readings/the-fourth-turning-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'genghis-khan-and-the-making-of-the-modern-world',
    title: 'Genghis Khan and the Making of the Modern World',
    author: 'Jack Weatherford',
    finishedDate: new Date('2021-02-17'),
    coverImageSrc: '/readings/genghis-khan-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-bitcoin-standard',
    title: 'The Bitcoin Standard',
    author: 'Saifedean Ammous',
    finishedDate: new Date('2021-03-06'),
    coverImageSrc: '/readings/the-bitcoin-standard-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'bitcoin-and-black-america',
    title: 'Bitcoin & Black America',
    author: 'Isaiah Jackson',
    finishedDate: new Date('2021-03-07'),
    coverImageSrc: '/readings/bitcoin-and-black-america-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-sovereign-individual',
    title: 'The Sovereign Individual',
    author: 'James Dale Davidson',
    finishedDate: new Date('2021-03-10'),
    coverImageSrc: '/readings/the-sovereign-individual-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-art-of-loving',
    title: 'The Art of Loving',
    author: 'Erich Fromm',
    finishedDate: new Date('2021-03-13'),
    coverImageSrc: '/readings/the-art-of-loving-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'beyond-order',
    title: 'Beyond Order',
    author: 'Jordan B. Peterson',
    finishedDate: new Date('2021-03-18'),
    coverImageSrc: '/readings/beyond-order-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-moon-is-a-harsh-mistress',
    title: 'The Moon Is a Harsh Mistress',
    author: 'Robert A. Heinlein',
    finishedDate: new Date('2021-03-18'),
    coverImageSrc: '/readings/the-moon-is-a-harsh-mistress-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'thomas-jefferson',
    title: 'Thomas Jefferson',
    author: 'Jon Meacham',
    finishedDate: new Date('2021-03-30'),
    coverImageSrc: '/readings/thomas-jefferson-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-plague',
    title: 'The Plague',
    author: 'Albert Camus',
    finishedDate: new Date('2021-04-01'),
    coverImageSrc: '/readings/the-plague-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-internet-of-money-volume-one',
    title: 'The Internet of Money Volume One',
    author: 'Andreas M. Antonopoulos',
    finishedDate: new Date('2021-04-03'),
    coverImageSrc: '/readings/the-internet-of-money-volume-one-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-internet-of-money-volume-two',
    title: 'The Internet of Money Volume Two',
    author: 'Andreas M. Antonopoulos',
    finishedDate: new Date('2021-04-04'),
    coverImageSrc: '/readings/the-internet-of-money-volume-two-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-internet-of-money-volume-three',
    title: 'The Internet of Money Volume Three',
    author: 'Andreas M. Antonopoulos',
    finishedDate: new Date('2021-04-08'),
    coverImageSrc: '/readings/the-internet-of-money-volume-three-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'starship-troopers',
    title: 'Starship Troopers',
    author: 'Robert A. Heinlein',
    finishedDate: new Date('2021-04-25'),
    coverImageSrc: '/readings/starship-troopers-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-black-swan',
    title: 'The Black Swan',
    author: 'Nassim Nicholas Taleb',
    finishedDate: new Date('2021-04-26'),
    coverImageSrc: '/readings/the-black-swan-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-law',
    title: 'The Law',
    author: 'Frédéric Bastiat',
    finishedDate: new Date('2021-04-27'),
    coverImageSrc: '/readings/the-law-01.webp',
    thoughts: '', dropped: false
  },
  {
    slug: 'breakfast-of-champions',
    title: 'Breakfast of Champions',
    author: 'Kurt Vonnegut',
    finishedDate: new Date('2021-05-01'),
    coverImageSrc: '/readings/breakfast-of-champions-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'grokking-bitcoin',
    title: 'Grokking Bitcoin',
    author: 'Kalle Rosenbaum',
    finishedDate: new Date('2021-05-02'),
    coverImageSrc: '/readings/grokking-bitcoin-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'inventing-bitcoin',
    title: 'Inventing Bitcoin',
    author: 'Yan Pritzker',
    finishedDate: new Date('2021-05-05'),
    coverImageSrc: '/readings/inventing-bitcoin-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-myth-of-sisyphus',
    title: 'The Myth of Sisyphus',
    author: 'Albert Camus',
    finishedDate: new Date('2021-05-07'),
    coverImageSrc: '/readings/the-myth-of-sisyphus-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'murder-on-the-orient-express',
    title: 'Murder on the Orient Express',
    author: 'Agatha Christie',
    finishedDate: new Date('2021-05-09'),
    coverImageSrc: '/readings/murder-on-the-orient-express-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'mother-night',
    title: 'Mother Night',
    author: 'Kurt Vonnegut',
    finishedDate: new Date('2021-05-15'),
    coverImageSrc: '/readings/mother-night-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'washington',
    title: 'Washington',
    author: 'Ron Chernow',
    finishedDate: new Date('2021-05-16'),
    coverImageSrc: '/readings/washington-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-book-of-satoshi',
    title: 'The Book of Satoshi',
    author: 'Phil Champagne',
    finishedDate: new Date('2021-05-22'),
    coverImageSrc: '/readings/the-book-of-satoshi-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'mastering-ethereum',
    title: 'Mastering Ethereum',
    author: 'Andreas M. Antonopoulos',
    finishedDate: new Date('2021-06-11'),
    coverImageSrc: '/readings/mastering-ethereum-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-bed-of-procrustes',
    title: 'The Bed of Procrustes',
    author: 'Nassim Nicholas Taleb',
    finishedDate: new Date('2021-06-11'),
    coverImageSrc: '/readings/the-bed-of-procrustes-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'titan',
    title: 'Titan',
    author: 'Ron Chernow',
    finishedDate: new Date('2021-07-18'),
    coverImageSrc: '/readings/titan-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'zero-to-one',
    title: 'Zero to One',
    author: 'Peter Thiel',
    finishedDate: new Date('2021-07-30'),
    coverImageSrc: '/readings/zero-to-one-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'bobby-fischer-teaches-chess',
    title: 'Bobby Fischer Teaches Chess',
    author: 'Bobby Fischer',
    finishedDate: new Date('2021-07-30'),
    coverImageSrc: '/readings/bobby-fischer-teaches-chess-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'demons',
    title: 'Demons',
    author: 'Fyodor Dostoevsky',
    finishedDate: new Date('2021-08-17'),
    coverImageSrc: '/readings/demons-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: '21-lessons',
    title: '21 Lessons',
    author: 'Gigi',
    finishedDate: new Date('2021-08-20'),
    coverImageSrc: '/readings/21-lessons-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-journalist-and-the-murderer',
    title: 'The Journalist and the Murderer',
    author: 'Janet Malcolm',
    finishedDate: new Date('2021-08-20'),
    coverImageSrc: '/readings/the-journalist-and-the-murderer-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-rise-and-fall-of-the-third-reich',
    title: 'The Rise and Fall of the Third Reich',
    author: 'William L. Shirer',
    finishedDate: new Date('2021-08-22'),
    coverImageSrc: '/readings/the-rise-and-fall-of-the-third-reich-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'atlas-shrugged',
    title: 'Atlas Shrugged',
    author: 'Ayn Rand',
    finishedDate: new Date('2021-09-04'),
    coverImageSrc: '/readings/atlas-shrugged-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'payments-systems-in-the-us',
    title: 'Payments Systems in the U.S.',
    author: 'Carol Coye Benson',
    finishedDate: new Date('2021-09-05'),
    coverImageSrc: '/readings/payments-systems-in-the-us-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'javascript',
    title: 'Javascript',
    author: 'Douglas Crockford',
    finishedDate: new Date('2021-09-15'),
    coverImageSrc: '/readings/javascript-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'mastery',
    title: 'Mastery',
    author: 'Robert Greene',
    finishedDate: new Date('2021-09-22'),
    coverImageSrc: '/readings/mastery-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'welcome-to-the-monkey-house',
    title: 'Welcome to the Monkey House',
    author: 'Kurt Vonnegut',
    finishedDate: new Date('2021-09-24'),
    coverImageSrc: '/readings/welcome-to-the-monkey-house-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-house-of-morgan',
    title: 'The House of Morgan',
    author: 'Ron Chernow',
    finishedDate: new Date('2021-09-29'),
    coverImageSrc: '/readings/the-house-of-morgan-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-blocksize-war',
    title: 'The Blocksize War',
    author: 'Jonathan Bier',
    finishedDate: new Date('2021-10-04'),
    coverImageSrc: '/readings/the-blocksize-war-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-bullish-case-for-bitcoin',
    title: 'The Bullish Case for Bitcoin',
    author: 'Vijay Boyapati',
    finishedDate: new Date('2021-10-09'),
    coverImageSrc: '/readings/the-bullish-case-for-bitcoin-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'effective-typescript',
    title: 'Effective Typescript',
    author: 'Dan Vanderkam',
    finishedDate: new Date('2021-10-10'),
    coverImageSrc: '/readings/effective-typescript-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'websocket',
    title: 'Websocket',
    author: 'Andrew Lombardi',
    finishedDate: new Date('2021-10-18'),
    coverImageSrc: '/readings/websocket-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-cathedral-and-the-bazaar',
    title: 'The Cathedral & the Bazaar',
    author: 'Eric S. Raymond',
    finishedDate: new Date('2021-10-28'),
    coverImageSrc: '/readings/the-cathedral-and-the-bazaar-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-infinite-machine',
    title: 'The Infinite Machine',
    author: 'Camila Russo',
    finishedDate: new Date('2021-10-29'),
    coverImageSrc: '/readings/the-infinite-machine-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'masters-of-doom',
    title: 'Masters of Doom',
    author: 'David Kushner',
    finishedDate: new Date('2021-11-09'),
    coverImageSrc: '/readings/masters-of-doom-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'layered-money',
    title: 'Layered Money',
    author: 'Nik Bhatia',
    finishedDate: new Date('2021-11-12'),
    coverImageSrc: '/readings/layered-money-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'cryptoeconomics',
    title: 'Cryptoeconomics',
    author: 'Eric Voskuil',
    finishedDate: new Date('2021-12-19'),
    coverImageSrc: '/readings/cryptoeconomics-01.jpg',
    thoughts: '', dropped: false
  },

]

const READINGS_2020: Reading[] = [
  {
    slug: 'pride-and-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    finishedDate: new Date('2020-01-01'),
    coverImageSrc: '/readings/pride-and-prejudice-01.webp',
    thoughts: '', dropped: false
  },
  {
    slug: 'run-for-your-life',
    title: 'Run for Your Life',
    author: 'Mark Cucuzzella',
    finishedDate: new Date('2020-01-17'),
    coverImageSrc: '/readings/run-for-your-life-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'anarchist-education-and-the-modern-school',
    title: 'Anarchist Education and the Modern School',
    author: 'Francesc Ferrer I Guárdia',
    finishedDate: new Date('2020-02-14'),
    coverImageSrc: '/readings/anarchist-education-and-the-modern-school-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'why-nations-fail',
    title: 'Why Nations Fail',
    author: 'Daron Acemoğlu',
    finishedDate: new Date('2020-05-10'),
    coverImageSrc: '/readings/why-nations-fail-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-great-mortality',
    title: 'The Great Mortality',
    author: 'John Kelly',
    finishedDate: new Date('2020-05-20'),
    coverImageSrc: '/readings/the-great-mortality-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-three-musketeers',
    title: 'The Three Musketeers',
    author: 'Alexandre Dumas',
    finishedDate: new Date('2020-06-02'),
    coverImageSrc: '/readings/the-three-musketeers-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-power-broker',
    title: 'The Power Broker',
    author: 'Robert A. Caro',
    finishedDate: new Date('2020-06-08'),
    coverImageSrc: '/readings/the-power-broker-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'endurance',
    title: 'Endurance',
    author: 'Alfred Lansing',
    finishedDate: new Date('2020-06-13'),
    coverImageSrc: '/readings/endurance-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'educated',
    title: 'Educated',
    author: 'Tara Westover',
    finishedDate: new Date('2020-06-19'),
    coverImageSrc: '/readings/educated-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: '1984',
    title: '1984',
    author: 'George Orwell',
    finishedDate: new Date('2020-06-27'),
    coverImageSrc: '/readings/1984-02.jpeg',
    thoughts: '', dropped: false
  },
  {
    slug: 'caesar',
    title: 'Caesar',
    author: 'Adrian Goldsworthy',
    finishedDate: new Date('2020-06-28'),
    coverImageSrc: '/readings/caesar-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'phaedrus',
    title: 'Phaedrus',
    author: 'Plato',
    finishedDate: new Date('2020-07-02'),
    coverImageSrc: '/readings/phaedrus-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'beyond-good-and-evil',
    title: 'Beyond Good and Evil',
    author: 'Friedrich Nietzsche',
    finishedDate: new Date('2020-08-02'),
    coverImageSrc: '/readings/beyond-good-and-evil-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-federalist-papers',
    title: 'The Federalist Papers',
    author: 'Alexander Hamilton',
    finishedDate: new Date('2020-09-20'),
    coverImageSrc: '/readings/the-federalist-papers-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'escape-from-freedom',
    title: 'Escape From Freedom',
    author: 'Erich Fromm',
    finishedDate: new Date('2020-10-04'),
    coverImageSrc: '/readings/escape-from-freedom-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'loserthink',
    title: 'Loserthink',
    author: 'Scott Adams',
    finishedDate: new Date('2020-10-10'),
    coverImageSrc: '/readings/loserthink-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'everywhere-all-the-time',
    title: 'Everywhere All the Time',
    author: 'Matt Hern',
    finishedDate: new Date('2020-11-07'),
    coverImageSrc: '/readings/everywhere-all-the-time-01.jpg',
    thoughts: '', dropped: false
  },

]

const READINGS_2019: Reading[] = [
  {
    slug: 'team-of-rivals',
    title: 'Team of Rivals',
    author: 'Doris Kearns Goodwin',
    finishedDate: new Date('2019-02-04'),
    coverImageSrc: '/readings/team-of-rivals-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'anna-karenina',
    title: 'Anna Karenina',
    author: 'Leo Tolstoy',
    finishedDate: new Date('2019-04-10'),
    coverImageSrc: '/readings/anna-karenina-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'american-kingpin',
    title: 'American Kingpin',
    author: 'Nick Bilton',
    finishedDate: new Date('2019-04-13'),
    coverImageSrc: '/readings/american-kingpin-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'tiamats-wrath',
    title: "Tiamat's Wrath",
    author: 'James S.A. Corey',
    finishedDate: new Date('2019-04-20'),
    coverImageSrc: '/readings/tiamats-wrath-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-emperor-of-all-maladies',
    title: 'The Emperor of All Maladies',
    author: 'Siddhartha Mukherjee',
    finishedDate: new Date('2019-06'),
    coverImageSrc: '/readings/the-emperor-of-all-maladies-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'alexander-the-great',
    title: 'Alexander the Great',
    author: 'Philip Freeman',
    finishedDate: new Date('2019-07-19'),
    coverImageSrc: '/readings/alexander-the-great-02.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-48-laws-of-power',
    title: 'The 48 Laws of Power',
    author: 'Robert Greene',
    finishedDate: new Date('2019-07-29'),
    coverImageSrc: '/readings/the-48-laws-of-power-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-simple-path-to-wealth',
    title: 'The Simple Path to Wealth',
    author: 'J.L. Collins',
    finishedDate: new Date('2019-09-11'),
    coverImageSrc: '/readings/the-simple-path-to-wealth-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'surely-youre-joking-mr-feynman',
    title: 'Surely You\'re Joking, Mr. Feynman!',
    author: 'Richard Feynman',
    finishedDate: new Date('2019-09-21'),
    coverImageSrc: '/readings/surely-youre-joking-mr-feynman-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-big-sleep',
    title: 'The Big Sleep',
    author: 'Raymond Chandler',
    finishedDate: new Date('2019-10-09'),
    coverImageSrc: '/readings/the-big-sleep-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-pragmatic-programmer',
    title: 'The Pragmatic Programmer',
    author: 'Andy Hunt',
    finishedDate: new Date('2019-10-25'),
    coverImageSrc: '/readings/the-pragmatic-programmer-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-hard-thing-about-hard-things',
    title: 'The Hard Thing About Hard Things',
    author: 'Ben Horowitz',
    finishedDate: new Date('2019-10-30'),
    coverImageSrc: '/readings/the-hard-thing-about-hard-things-01.jpg',
    thoughts: '', dropped: false
  },

]

const READINGS_2018: Reading[] = [
  {
    slug: 'great-expectations',
    title: 'Great Expectations',
    author: 'Charles Dickens',
    finishedDate: new Date('2018-02-12'),
    coverImageSrc: '/readings/great-expectations-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'foundation',
    title: 'Foundation',
    author: 'Isaac Asimov',
    finishedDate: new Date('2018-02-14'),
    coverImageSrc: '/readings/foundation-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'pimp',
    title: 'Pimp',
    author: 'Iceberg Slim',
    finishedDate: new Date('2018-02-24'),
    coverImageSrc: '/readings/pimp-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: '12-rules-for-life',
    title: '12 Rules for Life',
    author: 'Jordan B. Peterson',
    finishedDate: new Date('2018-03-17'),
    coverImageSrc: '/readings/12-rules-for-life-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'notes-from-underground',
    title: 'Notes From Underground',
    author: 'Fyodor Dostoevsky',
    finishedDate: new Date('2018-03-23'),
    coverImageSrc: '/readings/notes-from-underground-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'childhoods-end',
    title: 'Childhood\'s End',
    author: 'Arthur C. Clarke',
    finishedDate: new Date('2018-04-10'),
    coverImageSrc: '/readings/childhoods-end-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'modern-man-in-search-of-a-soul',
    title: 'Modern Man in Search of a Soul',
    author: 'Carl Jung',
    finishedDate: new Date('2018-05-03'),
    coverImageSrc: '/readings/modern-man-in-search-of-a-soul-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-road-to-wigan-pier',
    title: 'The Road to Wigan Pier',
    author: 'George Orwell',
    finishedDate: new Date('2018-05-14'),
    coverImageSrc: '/readings/the-road-to-wigan-pier-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'one-day-in-the-life-of-ivan-denisovich',
    title: 'One Day in the Life of Ivan Denisovich',
    author: 'Aleksandr Solzhenitsyn',
    finishedDate: new Date('2018-05-21'),
    coverImageSrc: '/readings/one-day-in-the-life-of-ivan-denisovich-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'foundation-and-empire',
    title: 'Foundation and Empire',
    author: 'Isaac Asimov',
    finishedDate: new Date('2018-05-27'),
    coverImageSrc: '/readings/foundation-and-empire-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'unix-and-linux-system-administration-handbook',
    title: 'Unix and Linux System Administration Handbook',
    author: 'Evi Nemeth',
    finishedDate: new Date('2018-05-29'),
    coverImageSrc: '/readings/unix-and-linux-system-administration-handbook-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'second-foundation',
    title: 'Second Foundation',
    author: 'Isaac Asimov',
    finishedDate: new Date('2018-06'),
    coverImageSrc: '/readings/second-foundation-02.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'leviathan-wakes',
    title: 'Leviathan Wakes',
    author: 'James S.A. Corey',
    finishedDate: new Date('2018-06-16'),
    coverImageSrc: '/readings/leviathan-wakes-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'eloquent-javascript',
    title: 'Eloquent Javascript',
    author: 'Marijn Haverbeke',
    finishedDate: new Date('2018-06-21'),
    coverImageSrc: '/readings/eloquent-javascript-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'calibans-war',
    title: 'Caliban\'s War',
    author: 'James S.A. Corey',
    finishedDate: new Date('2018-06-22'),
    coverImageSrc: '/readings/calibans-war-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'abaddons-gate',
    title: 'Abaddon\'s Gate',
    author: 'James S.A. Corey',
    finishedDate: new Date('2018-06-26'),
    coverImageSrc: '/readings/abaddons-gate-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'cibola-burn',
    title: 'Cibola Burn',
    author: 'James S.A. Corey',
    finishedDate: new Date('2018-06-30'),
    coverImageSrc: '/readings/cibola-burn-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'nemesis-games',
    title: 'Nemesis Games',
    author: 'James S.A. Corey',
    finishedDate: new Date('2018-07-11'),
    coverImageSrc: '/readings/nemesis-games-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'babylons-ashes',
    title: 'Babylon\'s Ashes',
    author: 'James S.A. Corey',
    finishedDate: new Date('2018-07-31'),
    coverImageSrc: '/readings/babylons-ashes-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'persepolis-rising',
    title: 'Persepolis Rising',
    author: 'James S.A. Corey',
    finishedDate: new Date('2018-08-31'),
    coverImageSrc: '/readings/persepolis-rising-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'strange-dogs',
    title: 'Strange Dogs',
    author: 'James S.A. Corey',
    finishedDate: new Date('2018-09'),
    coverImageSrc: '/readings/strange-dogs-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-butcher-of-anderson-station',
    title: 'The Butcher of Anderson Station',
    author: 'James S.A. Corey',
    finishedDate: new Date('2018-09-04'),
    coverImageSrc: '/readings/the-butcher-of-anderson-station-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-vital-abyss',
    title: 'The Vital Abyss',
    author: 'James S.A. Corey',
    finishedDate: new Date('2018-09-05'),
    coverImageSrc: '/readings/the-vital-abyss-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-churn',
    title: 'The Churn',
    author: 'James S.A. Corey',
    finishedDate: new Date('2018-09-08'),
    coverImageSrc: '/readings/the-churn-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'gods-of-risk',
    title: 'Gods of Risk',
    author: 'James S.A. Corey',
    finishedDate: new Date('2018-09-08'),
    coverImageSrc: '/readings/gods-of-risk-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'vulnerability-management-for-dummies',
    title: 'Vulnerability Management for Dummies',
    author: 'Qualys',
    finishedDate: new Date('2018-09-13'),
    coverImageSrc: '/readings/vulnerability-management-for-dummies-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-perfect-weapon',
    title: 'The Perfect Weapon',
    author: 'David E. Sanger',
    finishedDate: new Date('2018-09-27'),
    coverImageSrc: '/readings/the-perfect-weapon-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-hacker-playbook-two',
    title: 'The Hacker Playbook 2',
    author: 'Peter Kim',
    finishedDate: new Date('2018-10-04'),
    coverImageSrc: '/readings/the-hacker-playbook-two-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'mans-search-for-meaning',
    title: 'Man\'s Search for Meaning',
    author: 'Viktor E. Frankl',
    finishedDate: new Date('2018-10-05'),
    coverImageSrc: '/readings/mans-search-for-meaning-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'bad-blood',
    title: 'Bad Blood',
    author: 'John Carreyrou',
    finishedDate: new Date('2018-10-10'),
    coverImageSrc: '/readings/bad-blood-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-psychopath-test',
    title: 'The Psychopath Test',
    author: 'Jon Ronson',
    finishedDate: new Date('2018-10-16'),
    coverImageSrc: '/readings/the-psychopath-test-02.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'skin-in-the-game',
    title: 'Skin in the Game',
    author: 'Nassim Nicholas Taleb',
    finishedDate: new Date('2018-11-15'),
    coverImageSrc: '/readings/skin-in-the-game-02.jpg',
    thoughts: '', dropped: false
  },

]

const READINGS_2017: Reading[] = [
  {
    slug: 'the-art-of-the-deal',
    title: 'The Art of the Deal',
    author: 'Donald J. Trump',
    finishedDate: new Date('2017-01-27'),
    coverImageSrc: '/readings/the-art-of-the-deal-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'one-hundred-years-of-solitude',
    title: 'One Hundred Years of Solitude',
    author: 'Gabriel García Márquez',
    finishedDate: new Date('2017-05-24'),
    coverImageSrc: '/readings/one-hundred-years-of-solitude-02.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'how-to-read-a-book',
    title: 'How to Read a Book',
    author: 'Mortimer J. Adler',
    finishedDate: new Date('2017-06'),
    coverImageSrc: '/readings/how-to-read-a-book-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'a-wrinkle-in-time',
    title: 'A Wrinkle in Time',
    author: 'Hope Larson',
    finishedDate: new Date('2017-07-30'),
    coverImageSrc: '/readings/a-wrinkle-in-time-graphic-novel-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'gullivers-travels',
    title: 'Gulliver\'s Travels',
    author: 'Jonathan Swift',
    finishedDate: new Date('2017-09-22'),
    coverImageSrc: '/readings/gullivers-travels-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'how-to-fail-at-almost-everything-and-still-win-big',
    title: 'How to Fail at Almost Everything and Still Win Big',
    author: 'Scott Adams',
    finishedDate: new Date('2017-09-26'),
    coverImageSrc: '/readings/how-to-fail-at-almost-everything-and-still-win-big-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'snow-crash',
    title: 'Snow Crash',
    author: 'Neal Stephenson',
    finishedDate: new Date('2017-10-05'),
    coverImageSrc: '/readings/snow-crash-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'stranger-in-a-strange-land',
    title: 'Stranger in a Strange Land',
    author: 'Robert A. Heinlein',
    finishedDate: new Date('2017-10-17'),
    coverImageSrc: '/readings/stranger-in-a-strange-land-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'sapiens',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    finishedDate: new Date('2017-10-21'),
    coverImageSrc: '/readings/sapiens-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'win-bigly',
    title: 'Win Bigly',
    author: 'Scott Adams',
    finishedDate: new Date('2017-11-04'),
    coverImageSrc: '/readings/win-bigly-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-path-to-power',
    title: 'The Path to Power',
    author: 'Robert A. Caro',
    finishedDate: new Date('2017-11-14'),
    coverImageSrc: '/readings/the-path-to-power-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'influence',
    title: 'Influence',
    author: 'Robert B. Cialdini',
    finishedDate: new Date('2017-11-14'),
    coverImageSrc: '/readings/influence-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'pre-suasion',
    title: 'Pre-Suasion',
    author: 'Robert B. Cialdini',
    finishedDate: new Date('2017-12-04'),
    coverImageSrc: '/readings/presuasion-01.jpg',
    thoughts: '', dropped: false
  },

]

const READINGS_2016: Reading[] = [
  {
    slug: 'the-man-in-the-high-castle',
    title: 'The Man in the High Castle',
    author: 'Philip K. Dick',
    finishedDate: new Date('2016-01-23'),
    coverImageSrc: '/readings/the-man-in-the-high-castle-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'capitalism-and-freedom',
    title: 'Capitalism and Freedom',
    author: 'Milton Friedman',
    finishedDate: new Date('2016-02-16'),
    coverImageSrc: '/readings/capitalism-and-freedom-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'cloud-atlas',
    title: 'Cloud Atlas',
    author: 'David Mitchell',
    finishedDate: new Date('2016-02-28'),
    coverImageSrc: '/readings/cloud-atlas-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'stardust',
    title: 'Stardust',
    author: 'Neil Gaiman',
    finishedDate: new Date('2016-03-21'),
    coverImageSrc: '/readings/stardust-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'how-google-works',
    title: 'How Google Works',
    author: 'Eric Schmidt',
    finishedDate: new Date('2016-03-31'),
    coverImageSrc: '/readings/how-google-works-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'shantaram',
    title: 'Shantaram',
    author: 'Gregory David Roberts',
    finishedDate: new Date('2016-05-08'),
    coverImageSrc: '/readings/shantaram-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-war-of-art',
    title: 'The War of Art',
    author: 'Steven Pressfield',
    finishedDate: new Date('2016-05-12'),
    coverImageSrc: '/readings/the-war-of-art-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'bird-by-bird',
    title: 'Bird by Bird',
    author: 'Anne Lamott',
    finishedDate: new Date('2016-06-17'),
    coverImageSrc: '/readings/bird-by-bird-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'on-writing',
    title: 'On Writing',
    author: 'Stephen King',
    finishedDate: new Date('2016-06-21'),
    coverImageSrc: '/readings/on-writing-02.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'steal-like-an-artist',
    title: 'Steal Like an Artist',
    author: 'Austin Kleon',
    finishedDate: new Date('2016-07-16'),
    coverImageSrc: '/readings/steal-like-an-artist-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'other-desert-cities',
    title: 'Other Desert Cities',
    author: 'Jon Robin Baitz',
    finishedDate: new Date('2016-10-09'),
    coverImageSrc: '/readings/other-desert-cities-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'player-piano',
    title: 'Player Piano',
    author: 'Kurt Vonnegut',
    finishedDate: new Date('2016-10-11'),
    coverImageSrc: '/readings/player-piano-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'narconomics',
    title: 'Narconomics',
    author: 'Tom Wainwright',
    finishedDate: new Date('2016-10-30'),
    coverImageSrc: '/readings/narconomics-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-sirens-of-titan',
    title: 'The Sirens of Titan',
    author: 'Kurt Vonnegut',
    finishedDate: new Date('2016-12-02'),
    coverImageSrc: '/readings/the-sirens-of-titan-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'fooled-by-randomness',
    title: 'Fooled by Randomness',
    author: 'Nassim Nicholas Taleb',
    finishedDate: new Date('2016-12-11'),
    coverImageSrc: '/readings/fooled-by-randomness-02.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'antifragile',
    title: 'Antifragile',
    author: 'Nassim Nicholas Taleb',
    finishedDate: new Date('2016-12-31'),
    coverImageSrc: '/readings/antifragile-02.jpg',
    thoughts: '', dropped: false
  },

]

const READINGS_2015: Reading[] = [
  {
    slug: 'why-the-militia',
    title: 'Why the Militia',
    author: 'Red Beckman',
    finishedDate: new Date('2015-01-02'),
    coverImageSrc: '/readings/why-the-militia-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-beginners-guide-to-insight-meditation',
    title: 'The Beginner\'s Guide to Insight Meditation',
    author: 'Arinna Weisman',
    finishedDate: new Date('2015-01-02'),
    coverImageSrc: '/readings/the-beginners-guide-to-insight-meditation-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'homage-to-catalonia',
    title: 'Homage to Catalonia',
    author: 'George Orwell',
    finishedDate: new Date('2015-01-09'),
    coverImageSrc: '/readings/homage-to-catalonia-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'your-first-meteor-application',
    title: 'Your First Meteor Application',
    author: 'David Turnbull',
    finishedDate: new Date('2015-01-19'),
    coverImageSrc: '/readings/your-first-meteor-application-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'benjamin-franklin',
    title: 'Benjamin Franklin',
    author: 'Walter Isaacson',
    finishedDate: new Date('2015-02-08'),
    coverImageSrc: '/readings/benjamin-franklin-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-age-of-innocence',
    title: 'The Age of Innocence',
    author: 'Edith Wharton',
    finishedDate: new Date('2015-02-26'),
    coverImageSrc: '/readings/the-age-of-innocence-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'ready-player-one',
    title: 'Ready Player One',
    author: 'Ernest Cline',
    finishedDate: new Date('2015-03-04'),
    coverImageSrc: '/readings/ready-player-one-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'boxers-and-saints',
    title: 'Boxers & Saints',
    author: 'Gene Luen Yang',
    finishedDate: new Date('2015-03-20'),
    coverImageSrc: '/readings/boxers-and-saints-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'steppenwolf',
    title: 'Steppenwolf',
    author: 'Hermann Hesse',
    finishedDate: new Date('2015-04'),
    coverImageSrc: '/readings/steppenwolf-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'war-and-peace-in-the-global-village',
    title: 'War and Peace in the Global Village',
    author: 'Marshall McLuhan',
    finishedDate: new Date('2015-05-16'),
    coverImageSrc: '/readings/war-and-peace-in-the-global-village-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'toward-a-libertarian-society',
    title: 'Toward a Libertarian Society',
    author: 'Walter Block',
    finishedDate: new Date('2015-07-11'),
    coverImageSrc: '/readings/toward-a-libertarian-society-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-martian',
    title: 'The Martian',
    author: 'Andy Weir',
    finishedDate: new Date('2015-07-16'),
    coverImageSrc: '/readings/the-martian-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-circle',
    title: 'The Circle',
    author: 'Dave Eggers',
    finishedDate: new Date('2015-07-27'),
    coverImageSrc: '/readings/the-circle-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'doing-good-better',
    title: 'Doing Good Better',
    author: 'William Macaskill',
    finishedDate: new Date('2015-08-29'),
    coverImageSrc: '/readings/doing-good-better-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'symposium',
    title: 'Symposium',
    author: 'Plato',
    finishedDate: new Date('2015-12-09'),
    coverImageSrc: '/readings/symposium-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-principles-of-beautiful-web-design',
    title: 'The Principles of Beautiful Web Design',
    author: 'Jason Beaird',
    finishedDate: new Date('2015-12-14'),
    coverImageSrc: '/readings/the-principles-of-beautiful-web-design-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'pen-pals',
    title: 'Pen Pals',
    author: 'Aaron Cometbus',
    finishedDate: new Date('2015-12-28'),
    coverImageSrc: '/readings/pen-pals-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-road-less-traveled',
    title: 'The Road Less Traveled',
    author: 'M. Scott Peck',
    finishedDate: new Date('2015-12-28'),
    coverImageSrc: '/readings/the-road-less-traveled-01.jpg',
    thoughts: '', dropped: false
  },

]

const READINGS_2014: Reading[] = [
  {
    slug: 'divine-fury',
    title: 'Divine Fury',
    author: 'Darrin M. McMahon',
    finishedDate: new Date('2014-01'),
    coverImageSrc: '/readings/divine-fury-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'crime-and-punishment',
    title: 'Crime and Punishment',
    author: 'Fyodor Dostoevsky',
    finishedDate: new Date('2014-01-14'),
    coverImageSrc: '/readings/crime-and-punishment-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'crossing-the-mangrove',
    title: 'Crossing the Mangrove',
    author: 'Maryse Condé',
    finishedDate: new Date('2014-02'),
    coverImageSrc: '/readings/crossing-the-mangrove-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'a-study-in-scarlet',
    title: 'A Study in Scarlet',
    author: 'Arthur Conan Doyle',
    finishedDate: new Date('2014-04'),
    coverImageSrc: '/readings/a-study-in-scarlet-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'a-peoples-history-of-the-united-states',
    title: 'A People\'s History of the United States',
    author: 'Howard Zinn',
    finishedDate: new Date('2014-04-08'),
    coverImageSrc: '/readings/a-peoples-history-of-the-united-states-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'economics-in-one-lesson',
    title: 'Economics in One Lesson',
    author: 'Henry Hazlitt',
    finishedDate: new Date('2014-05-02'),
    coverImageSrc: '/readings/economics-in-one-lesson-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-fall',
    title: 'The Fall',
    author: 'Albert Camus',
    finishedDate: new Date('2014-05-04'),
    coverImageSrc: '/readings/the-fall-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'a-clockwork-orange',
    title: 'A Clockwork Orange',
    author: 'Anthony Burgess',
    finishedDate: new Date('2014-05-11'),
    coverImageSrc: '/readings/a-clockwork-orange-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'dune',
    title: 'Dune',
    author: 'Frank Herbert',
    finishedDate: new Date('2014-06-10'),
    coverImageSrc: '/readings/dune-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-deacons-for-defense',
    title: 'The Deacons for Defense',
    author: 'Lance Hill',
    finishedDate: new Date('2014-07-03'),
    coverImageSrc: '/readings/the-deacons-for-defense-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-brothers-karamazov',
    title: 'The Brothers Karamazov',
    author: 'Fyodor Dostoevsky',
    finishedDate: new Date('2014-08-18'),
    coverImageSrc: '/readings/the-brothers-karamazov-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-anatomy-of-the-state',
    title: 'The Anatomy of the State',
    author: 'Murray N. Rothbard',
    finishedDate: new Date('2014-08-21'),
    coverImageSrc: '/readings/anatomy-of-the-state-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 't-sql-fundamentals',
    title: 'T-SQL Fundamentals',
    author: 'Itzik Ben-Gan',
    finishedDate: new Date('2014-09'),
    coverImageSrc: '/readings/t-sql-fundamentals-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-art-of-learning',
    title: 'The Art of Learning',
    author: 'Josh Waitzkin',
    finishedDate: new Date('2014-10-06'),
    coverImageSrc: '/readings/the-art-of-learning-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'so-you-want-to-play-go-beginner-level-one',
    title: 'So You Want to Play Go: Beginner Level One',
    author: 'Jonathan Hop',
    finishedDate: new Date('2014-10-15'),
    coverImageSrc: '/readings/so-you-want-to-play-go-beginner-level-one-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'training-kit-exam-70-461-querying-microsoft-sql-server-2012-mcsa',
    title: 'Training Kit (Exam 70-461) Querying Microsoft SQL Server 2012 (MCSA)',
    author: 'Dejan Sarka',
    finishedDate: new Date('2014-10-24'),
    coverImageSrc: '/readings/querying-microsoft-sql-server-2012-02.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'superintelligence',
    title: 'Superintelligence',
    author: 'Nick Bostrom',
    finishedDate: new Date('2014-11-10'),
    coverImageSrc: '/readings/superintelligence-02.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-privatization-of-roads-and-highways',
    title: 'The Privatization of Roads and Highways',
    author: 'Walter Block',
    finishedDate: new Date('2014-11-23'),
    coverImageSrc: '/readings/the-privatization-of-roads-and-highways-02.jpg',
    thoughts: '', dropped: false
  },

]

const READINGS_2013: Reading[] = [
  {
    slug: 'business-model-generation',
    title: 'Business Model Generation',
    author: 'Alexander Osterwalder',
    finishedDate: new Date('2013-01'),
    coverImageSrc: '/readings/business-model-generation-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-deadline',
    title: 'The Deadline',
    author: 'Tom Demarco',
    finishedDate: new Date('2013-01'),
    coverImageSrc: '/readings/the-deadline-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'keep-the-aspidistra-flying',
    title: 'Keep the Aspidistra Flying',
    author: 'George Orwell',
    finishedDate: new Date('2013-02'),
    coverImageSrc: '/readings/keep-the-aspidistra-flying-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-art-of-war',
    title: 'The Art of War',
    author: 'Sun Tzu',
    finishedDate: new Date('2013-03'),
    coverImageSrc: '/readings/the-art-of-war-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'here-comes-everybody',
    title: 'Here Comes Everybody',
    author: 'Clay Shirky',
    finishedDate: new Date('2013-03'),
    coverImageSrc: '/readings/here-comes-everybody-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'brave-new-war',
    title: 'Brave New War',
    author: 'John Robb',
    finishedDate: new Date('2013-03'),
    coverImageSrc: '/readings/brave-new-war-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'peopleware',
    title: 'Peopleware',
    author: 'Tom Demarco',
    finishedDate: new Date('2013-03'),
    coverImageSrc: '/readings/peopleware-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'emergence',
    title: 'Emergence',
    author: 'Steven Johnson',
    finishedDate: new Date('2013-04'),
    coverImageSrc: '/readings/emergence-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-metamorphosis-of-prime-intellect',
    title: 'The Metamorphosis of Prime Intellect',
    author: 'Roger Williams',
    finishedDate: new Date('2013-04'),
    coverImageSrc: '/readings/the-metamorphosis-of-prime-intellect-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-autobiography-of-malcolm-x',
    title: 'The Autobiography of Malcolm X',
    author: 'Malcolm X',
    finishedDate: new Date('2013-04'),
    coverImageSrc: '/readings/the-autobiography-of-malcolm-x-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'nikola-tesla',
    title: 'Nikola Tesla',
    author: 'Sean Patrick',
    finishedDate: new Date('2013-05-22'),
    coverImageSrc: '/readings/nikola-tesla-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'cognitive-surplus',
    title: 'Cognitive Surplus',
    author: 'Clay Shirky',
    finishedDate: new Date('2013-05-22'),
    coverImageSrc: '/readings/cognitive-surplus-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'hackers-and-painters',
    title: 'Hackers and Painters',
    author: 'Paul Graham',
    finishedDate: new Date('2013-05-23'),
    coverImageSrc: '/readings/hackers-and-painters-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'a-game-of-thrones',
    title: 'A Game of Thrones',
    author: 'George R.R. Martin',
    finishedDate: new Date('2013-06'),
    coverImageSrc: '/readings/a-game-of-thrones-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'pedagogy-of-the-oppressed',
    title: 'Pedagogy of the Oppressed',
    author: 'Paulo Friere',
    finishedDate: new Date('2013-06-23'),
    coverImageSrc: '/readings/pedagogy-of-the-oppressed-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'a-clash-of-kings',
    title: 'A Clash of Kings',
    author: 'George R.R. Martin',
    finishedDate: new Date('2013-07'),
    coverImageSrc: '/readings/a-clash-of-kings-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'a-storm-of-swords',
    title: 'A Storm of Swords',
    author: 'George R.R. Martin',
    finishedDate: new Date('2013-07'),
    coverImageSrc: '/readings/a-storm-of-swords-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'essential-fish-care-in-aquaponics',
    title: 'Essential Fish Care in Aquaponics',
    author: 'Victoria Kelley',
    finishedDate: new Date('2013-08'),
    coverImageSrc: '/readings/essential-fish-care-in-aquaponics-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'aquaponics',
    title: 'Aquaponics: Entrepreneurs Embrace Technology that Holds Key to Strengthening Local Food Systems and Increasing Food Security',
    author: 'Melinda Clark',
    finishedDate: new Date('2013-08'),
    coverImageSrc: '/readings/aquaponics-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: '7-myths-about-aquaponics',
    title: '7 Myths About Aquaponics',
    author: 'Michelle Booth',
    finishedDate: new Date('2013-08'),
    coverImageSrc: '/readings/7-myths-about-aquaponics-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'aquaponic-gardening',
    title: 'Aquaponic Gardening',
    author: 'Sylvia Bernstein',
    finishedDate: new Date('2013-08'),
    coverImageSrc: '/readings/aquaponic-gardening-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-urban-food-revolution',
    title: 'The Urban Food Revolution',
    author: 'Peter Ladner',
    finishedDate: new Date('2013-08'),
    coverImageSrc: '/readings/the-urban-food-revolution-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'a-dance-with-dragons',
    title: 'A Dance With Dragons',
    author: 'George R.R. Martin',
    finishedDate: new Date('2013-08'),
    coverImageSrc: '/readings/a-dance-with-dragons-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'a-feast-for-crows',
    title: 'A Feast for Crows',
    author: 'George R.R. Martin',
    finishedDate: new Date('2013-08'),
    coverImageSrc: '/readings/a-feast-for-crows-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'letters-to-a-young-teacher',
    title: 'Letters to a Young Teacher',
    author: 'Jonathan Kozol',
    finishedDate: new Date('2013-09'),
    coverImageSrc: '/readings/letters-to-a-young-teacher-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-post-american-world',
    title: 'The Post-American World',
    author: 'Fareed Zakaria',
    finishedDate: new Date('2013-09'),
    coverImageSrc: '/readings/the-post-american-world-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'cats-cradle',
    title: 'Cat\'s Cradle',
    author: 'Kurt Vonnegut',
    finishedDate: new Date('2013-09'),
    coverImageSrc: '/readings/cats-cradle-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-4-hour-workweek',
    title: 'The 4-Hour Workweek',
    author: 'Timothy Ferriss',
    finishedDate: new Date('2013-11'),
    coverImageSrc: '/readings/the-4-hour-workweek-01.jpg',
    thoughts: '', dropped: false
  },

]

const READINGS_2012: Reading[] = [
  {
    slug: 'the-entrepreneurial-investor',
    title: 'The Entrepreneurial Investor',
    author: 'Paul Orfalea',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/the-entrepreneurial-investor-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-soft-revolution',
    title: 'The Soft Revolution',
    author: 'Neil Postman',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/the-soft-revolution-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'news-from-a-parallel-world',
    title: 'News From a Parallel World',
    author: 'Richard Raznikov',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/news-from-a-parallel-world-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'thinking-fast-and-slow',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/thinking-fast-and-slow-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'disciplined-dreaming',
    title: 'Disciplined Dreaming',
    author: 'Josh Linkner',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/disciplined-dreaming-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'aftershock',
    title: 'Aftershock',
    author: 'Robert B. Reich',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/aftershock-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'rich-dad-poor-dad',
    title: 'Rich Dad, Poor Dad',
    author: 'Robert T. Kiyosaki',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/rich-dad-poor-dad-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'persuasion',
    title: 'Persuasion',
    author: 'James Borg',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/persuasion-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'on-the-road',
    title: 'On the Road',
    author: 'Jack Kerouac',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/on-the-road-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'slaughterhouse-five',
    title: 'Slaughterhouse-Five',
    author: 'Kurt Vonnegut',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/slaughterhouse-five-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'what-makes-a-terrorist',
    title: 'What Makes a Terrorist',
    author: 'Alan B. Krueger',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/what-makes-a-terrorist-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-prince',
    title: 'The Prince',
    author: 'Niccoló Machiavelli',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/the-prince-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'program-design-with-pseudocode',
    title: 'Program Design With Pseudocode',
    author: 't.e. Bailey',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/program-design-with-pseudocode-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-four-steps-to-the-epiphany',
    title: 'The Four Steps to the Epiphany',
    author: 'Steve Blank',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/the-four-steps-to-the-epiphany-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'moneyball',
    title: 'Moneyball',
    author: 'Michael Lewis',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/moneyball-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'negotiating-rationally',
    title: 'Negotiating Rationally',
    author: 'Max H. Bazerman',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/negotiating-rationally-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'merchants-of-immortality',
    title: 'Merchants of Immortality',
    author: 'Stephen S. Hall',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/merchants-of-immortality-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'thinking-strategically',
    title: 'Thinking Strategically',
    author: 'Avinash K. Dixit',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/thinking-strategically-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-e-myth-revisited',
    title: 'The E-Myth Revisited',
    author: 'Michael E. Gerber',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/the-e-myth-revisited-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'flow',
    title: 'Flow',
    author: 'Mihály Csíkszentmihályi',
    finishedDate: new Date('2012'),
    coverImageSrc: '/readings/flow-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'steve-jobs',
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    finishedDate: new Date('2012-07'),
    coverImageSrc: '/readings/steve-jobs-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'rework',
    title: 'Rework',
    author: 'Jason Fried',
    finishedDate: new Date('2012-07'),
    coverImageSrc: '/readings/rework-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'genome',
    title: 'Genome',
    author: 'Matt Ridley',
    finishedDate: new Date('2012-07'),
    coverImageSrc: '/readings/genome-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-power-of-habit',
    title: 'The Power of Habit',
    author: 'Charles Duhigg',
    finishedDate: new Date('2012-08'),
    coverImageSrc: '/readings/the-power-of-habit-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'brave-new-world',
    title: 'Brave New World',
    author: 'Aldous Huxley',
    finishedDate: new Date('2012-08'),
    coverImageSrc: '/readings/brave-new-world-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'outliers',
    title: 'Outliers',
    author: 'Malcolm Gladwell',
    finishedDate: new Date('2012-09'),
    coverImageSrc: '/readings/outliers-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'never-let-me-go',
    title: 'Never Let Me Go',
    author: 'Kazuo Ishiguro',
    finishedDate: new Date('2012-09'),
    coverImageSrc: '/readings/never-let-me-go-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'i-robot',
    title: 'I, Robot',
    author: 'Isaac Asimov',
    finishedDate: new Date('2012-10'),
    coverImageSrc: '/readings/i-robot-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'a-scanner-darkly',
    title: 'A Scanner Darkly',
    author: 'Philip K. Dick',
    finishedDate: new Date('2012-10'),
    coverImageSrc: '/readings/a-scanner-darkly-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'go-for-beginners',
    title: 'Go for Beginners',
    author: 'Kaoru Iwamoto',
    finishedDate: new Date('2012-10'),
    coverImageSrc: '/readings/go-for-beginners-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'fight-club',
    title: 'Fight Club',
    author: 'Chuck Palahniuk',
    finishedDate: new Date('2012-10'),
    coverImageSrc: '/readings/fight-club-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-open-classroom',
    title: 'The Open Classroom',
    author: 'Herbert R. Kohl',
    finishedDate: new Date('2012-11'),
    coverImageSrc: '/readings/the-open-classroom-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'operating-manual-for-spaceship-earth',
    title: 'Operating Manual for Spaceship Earth',
    author: 'R. Buckminster Fuller',
    finishedDate: new Date('2012-11'),
    coverImageSrc: '/readings/operating-manual-for-spaceship-earth-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-mythical-man-month',
    title: 'The Mythical Man-Month',
    author: 'Frederick P. Brooks Jr.',
    finishedDate: new Date('2012-12'),
    coverImageSrc: '/readings/mythical-man-month-01.jpg',
    thoughts: '', dropped: false
  },

]

const READINGS_2011: Reading[] = [
  {
    slug: 'making-ideas-happen',
    title: 'Making Ideas Happen',
    author: 'Scott Belsky',
    finishedDate: new Date('2011'),
    coverImageSrc: '/readings/making-ideas-happen-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'inside-steves-brain',
    title: 'Inside Steve\'s Brain',
    author: 'Leander Kahney',
    finishedDate: new Date('2011'),
    coverImageSrc: '/readings/inside-steves-brain-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'john-dies-at-the-end',
    title: 'John Dies at the End',
    author: 'David Wong',
    finishedDate: new Date('2011'),
    coverImageSrc: '/readings/john-dies-at-the-end-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'spin-selling',
    title: 'Spin Selling',
    author: 'Neil Rackham',
    finishedDate: new Date('2011'),
    coverImageSrc: '/readings/spin-selling-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-art-of-the-start',
    title: 'The Art of the Start',
    author: 'Guy Kawasaki',
    finishedDate: new Date('2011'),
    coverImageSrc: '/readings/the-art-of-the-start-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'the-fountainhead',
    title: 'The Fountainhead',
    author: 'Ayn Rand',
    finishedDate: new Date('2011'),
    coverImageSrc: '/readings/the-fountainhead-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'phil-gordons-little-green-book',
    title: 'Phil Gordon\'s Little Green Book',
    author: 'Phil Gordon',
    finishedDate: new Date('2011'),
    coverImageSrc: '/readings/phil-gordons-little-green-book-01.jpg',
    thoughts: '', dropped: false
  },
  {
    slug: 'illusions',
    title: 'Illusions',
    author: 'Richard Bach',
    finishedDate: new Date('2011'),
    coverImageSrc: '/readings/illusions-01.jpg',
    thoughts: '', dropped: false
  },
]

const READINGS_DROPPED = [
  {
    slug: 'designing-data-intensive-applications',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    finishedDate: null,
    coverImageSrc: '/readings/designing-data-intensive-applications-01.jpg',
    thoughts: 'some short notes here about the meaning of quality and the tension between classical and romantic approaches...',
    dropped: true
  },
  {
    slug: 'man-and-woman-he-created-them-a-theology-of-the-body',
    title: 'Man and Woman He Created Them: A Theology of the Body',
    author: 'John Paul II',
    finishedDate: null,
    coverImageSrc: '/readings/man-and-woman-he-created-them-01.jpg',
    thoughts: '', dropped: true
  },
  {
    slug: 'paradise-lost',
    title: 'Paradise Lost',
    author: 'John Milton',
    finishedDate: null,
    coverImageSrc: '/readings/paradise-lost-01.jpg',
    thoughts: '', dropped: true
  },
  {
    slug: 'scaling-people',
    title: 'Scaling People',
    author: 'Claire Hughes Johnson',
    finishedDate: null,
    coverImageSrc: '/readings/scaling-people-01.jpg',
    thoughts: '', dropped: true
  },
  {
    slug: 'structure-and-interpretation-of-computer-programs-second-edition',
    title: 'Structure and Interpretation of Computer Programs, Second Edition',
    author: 'Abelson and Sussman',
    finishedDate: null,
    coverImageSrc: '/readings/structure-and-interpretation-of-computer-programs-01.jpg',
    thoughts: '', dropped: true
  },
  {
    slug: 'shorter-summa',
    title: 'Shorter Summa',
    author: 'St. Thomas Aquinas',
    finishedDate: null,
    coverImageSrc: '/readings/shorter-summa-01.jpg',
    thoughts: '', dropped: true
  },
  {
    slug: 'dominion',
    title: 'Dominion',
    author: 'Tom Holland',
    finishedDate: null,
    coverImageSrc: '/readings/dominion-01.jpg',
    thoughts: '', dropped: true
  },
  {
    slug: 'how-the-catholic-church-built-western-civilization',
    title: 'How the Catholic Church Built Western Civilization',
    author: 'Thomas E. Woods, Jr.',
    finishedDate: null,
    coverImageSrc: '/readings/how-the-catholic-church-built-western-civilization-01.jpg',
    thoughts: '', dropped: true
  },
]

export const READINGS: Reading[] = [
  ...READINGS_CURRENTLY,
  ...READINGS_2025,
  ...READINGS_2024,
  ...READINGS_2023,
  ...READINGS_2022,
  ...READINGS_2021,
  ...READINGS_2020,
  ...READINGS_2019,
  ...READINGS_2018,
  ...READINGS_2017,
  ...READINGS_2016,
  ...READINGS_2015,
  ...READINGS_2014,
  ...READINGS_2013,
  ...READINGS_2012,
  ...READINGS_2011,
].sort((a, b) => {
  // handle null values first
  if (a.finishedDate === null && b.finishedDate === null) return 0
  if (a.finishedDate === null) return -1 // move `null` to the end
  if (b.finishedDate === null) return 1 // move `null` to the end

  // compare actual dates
  return b.finishedDate.getTime() - a.finishedDate.getTime()
}).concat(READINGS_DROPPED)
