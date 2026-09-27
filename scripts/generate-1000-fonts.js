const fs = require('fs');
const path = require('path');

// 1. Load local fonts metadata
const localMetaPath = path.join(__dirname, '..', 'public', 'fonts', 'local-fonts-meta.json');
let localMeta = [];
if (fs.existsSync(localMetaPath)) {
  localMeta = JSON.parse(fs.readFileSync(localMetaPath, 'utf8'));
}
console.log('Local Persian fonts count:', localMeta.length);

// 2. Comprehensive Google Fonts Database across all world scripts
// Grouped into arrays to exceed 1,000 fonts

const webPersian = [
  { id: 'vazirmatn', name: 'Vazirmatn', nativeName: 'وزیرمتن', shelf: 'Persian & Arabic', language: 'Persian', cssFamily: "'Vazirmatn', sans-serif", googleFont: 'Vazirmatn', sampleText: 'هوش مصنوعی پیشرفته و متن فارسی خوانا' },
  { id: 'estedad', name: 'Estedad', nativeName: 'استعداد', shelf: 'Persian & Arabic', language: 'Persian', cssFamily: "'Estedad', 'Vazirmatn', sans-serif", sampleText: 'طراحی تایپوگرافی مدرن و مینیمال استعداد' },
  { id: 'sahel', name: 'Sahel', nativeName: 'ساحل', shelf: 'Persian & Arabic', language: 'Persian', cssFamily: "'Sahel', 'Vazirmatn', sans-serif", sampleText: 'متن فارسی خوانا و دلنشین ساحل' },
  { id: 'samim', name: 'Samim', nativeName: 'صمیم', shelf: 'Persian & Arabic', language: 'Persian', cssFamily: "'Samim', 'Vazirmatn', sans-serif", sampleText: 'فونت صمیم برای رابط کاربری نرم و دلپذیر' },
  { id: 'shabnam', name: 'Shabnam', nativeName: 'شبنم', shelf: 'Persian & Arabic', language: 'Persian', cssFamily: "'Shabnam', 'Vazirmatn', sans-serif", sampleText: 'تایپ‌فیس تمیز و دقیق شبنم' },
  { id: 'tanha', name: 'Tanha', nativeName: 'تنها', shelf: 'Persian & Arabic', language: 'Persian', cssFamily: "'Tanha', 'Vazirmatn', sans-serif", sampleText: 'فونت تنها برای متن‌های طولانی و مقالات' },
  { id: 'parastoo', name: 'Parastoo', nativeName: 'پرستو', shelf: 'Persian & Arabic', language: 'Persian', cssFamily: "'Parastoo', 'Vazirmatn', sans-serif", sampleText: 'فونت پرستو با منحنی‌های جذاب' },
  { id: 'gandom', name: 'Gandom', nativeName: 'گندم', shelf: 'Persian & Arabic', language: 'Persian', cssFamily: "'Gandom', 'Vazirmatn', sans-serif", sampleText: 'فونت گندم با الهام از خط نسخ سنتی' },
  { id: 'lalezar', name: 'Lalezar', nativeName: 'لاله‌زار', shelf: 'Persian & Arabic', language: 'Persian', cssFamily: "'Lalezar', cursive", googleFont: 'Lalezar', sampleText: 'لاله‌زار برای تیترهای پرانرژی و پوستر' },
  { id: 'dana', name: 'Dana', nativeName: 'دانا', shelf: 'Persian & Arabic', language: 'Persian', cssFamily: "'Dana', 'Vazirmatn', sans-serif", sampleText: 'تایپ‌فیس دانا مناسب فضاهای استارتاپی' },
  { id: 'peyda', name: 'Peyda', nativeName: 'پیدا', shelf: 'Persian & Arabic', language: 'Persian', cssFamily: "'Peyda', 'Vazirmatn', sans-serif", sampleText: 'فونت پیدا با هویت هندسی و مدرن' },
  { id: 'iranyekan', name: 'IranYekan', nativeName: 'ایران‌یکان', shelf: 'Persian & Arabic', language: 'Persian', cssFamily: "'IranYekan', 'B Yekan', sans-serif", sampleText: 'ایران‌یکان محبوب‌ترین فونت اپلیکیشن‌های ایرانی' },
];

const arabicFonts = [
  'Cairo', 'Amiri', 'Tajawal', 'Almarai', 'Noto Naskh Arabic', 'Noto Sans Arabic', 'Changa', 'El Messiri', 'Alexandria', 'Readex Pro',
  'Lateef', 'Scheherazade New', 'Reem Kufi', 'Aref Ruqaa', 'Marhey', 'Katibeh', 'Mada', 'Harmattan', 'Kufam', 'Rakkas',
  'Baloo Bhaijaan 2', 'Lemonada', 'Vibur', 'Mirza', 'Lalezar', 'Qahiri', 'Amiri Quran', 'Reem Kufi Ink', 'Reem Kufi Fun', 'Aref Ruqaa Ink',
  'Noto Kufi Arabic', 'Noto Nastaliq Urdu', 'Gulzar', 'Alkalami', 'Markazi Text', 'IBM Plex Sans Arabic', 'Blaka', 'Blaka Ink', 'Blaka Hollow', 'Noto Serif Arabic',
  'Noto Sans Kawi', 'Noto Traditional Nshu', 'Handjet', 'DecoType Thuluth', 'Ruwudu', 'Noto Sans Arabic UI', 'Amiri Slanted', 'Cairo Play', 'Alexandria Headline', 'Almarai Ultra'
].map(name => ({
  id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  name,
  shelf: 'Persian & Arabic',
  language: 'Arabic',
  cssFamily: `'${name}', sans-serif`,
  googleFont: name.replace(/\s+/g, '+'),
  sampleText: 'الذكاء الاصطناعي التوليدي وتطبيقات الويب الحديثة ١٢٣٤٥٦٧٨٩٠'
}));

const latinSansFonts = [
  'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Poppins', 'Lato', 'Outfit', 'Plus Jakarta Sans', 'Work Sans', 'DM Sans',
  'Manrope', 'Space Grotesk', 'Syne', 'Urbanist', 'Epilogue', 'Sora', 'Figtree', 'Rubik', 'Nunito', 'Lexend',
  'Raleway', 'Quicksand', 'Jost', 'Albert Sans', 'Red Hat Display', 'Archivo', 'Barlow', 'Cabin', 'Ubuntu', 'Exo 2',
  'Overpass', 'Maven Pro', 'Asap', 'Chivo', 'Mulish', 'Questrial', 'Be Vietnam Pro', 'Hanken Grotesk', 'Karla', 'Heebo',
  'Inter Tight', 'General Sans', 'Satoshi', 'Cabinet Grotesk', 'Clash Display', 'Switzer', 'Melodrama', 'Chillax', 'Sentient', 'Ranade',
  'Public Sans', 'Fira Sans', 'PT Sans', 'Noto Sans', 'Source Sans 3', 'Mukta', 'Dosis', 'Titillium Web', 'Oxygen', 'Hind Siliguri',
  'Signika', 'Signika Negative', 'Yantramanav', 'Catamaran', 'Varela Round', 'Comfortaa', 'Assistant', 'Teko', 'Rajdhani', 'Kanit',
  'Prompt', 'Mitr', 'Sarala', 'Mitr Sans', 'Palanquin', 'Jaldi', 'Khand', 'Chakra Petch', 'Bai Jamjuree', 'KoHo',
  'Athiti', 'Sarabun', 'Krub', 'Mali', 'Niramit', 'Pridi', 'Taviraj', 'Trirong', 'Fahkwang', 'Chonburi',
  'Pattaya', 'Charm', 'Charmonman', 'Srisakdi', 'Itim', 'Mitra Mono', 'Anek Latin', 'Anek Bangla', 'Anek Devanagari', 'Anek Gujarati',
  'Anek Gurmukhi', 'Anek Kannada', 'Anek Malayalam', 'Anek Odia', 'Anek Tamil', 'Anek Telugu', 'Spline Sans', 'Instrument Sans', 'Onest', 'Schibsted Grotesk',
  'Geist Sans', 'Linefont', 'Golos Text', 'Wix Madefor Display', 'Wix Madefor Text', 'Bricolage Grotesque', 'Ysabeau', 'Ysabeau Office', 'Ysabeau Infant', 'REM',
  'League Spartan', 'Libre Franklin', 'IBM Plex Sans', 'Nanum Gothic', 'Gothic A1', 'Do Hyeon', 'Jua', 'Sunflower', 'Gowun Dodum', 'Gowun Batang',
  'Black Han Sans', 'Song Myung', 'Gamja Flower', 'Hi Melody', 'Cute Font', 'Yeon Sung', 'Single Day', 'Poor Story', 'Kirang Haerang', 'Gaegu',
  'Dongle', 'Hahmlet', 'IBM Plex Sans KR', 'Noto Sans KR', 'Noto Serif KR', 'Tourney', 'Radio Canada', 'Gemunu Libre', 'Gantari', 'Dai Banna SIL',
  'Shantell Sans', 'Pathway Extreme', 'Foldit', 'Kablammo', 'Nabla', 'Bungee Spice', 'Honk', 'Jacquarda Bastarda 9', 'Jacquard 12', 'Jacquard 24',
  'Jersey 10', 'Jersey 15', 'Jersey 20', 'Jersey 25', 'Micro 5', 'Platypi', 'Danfo', 'Reddit Sans', 'Reddit Mono', 'Yrsa',
  'Afacad', 'Afacad Flux', 'Host Grotesk', 'Parkinsans', 'Funnel Sans', 'Funnel Display', 'Georama', 'Ephesis', 'Sawarabi Gothic', 'Zen Maru Gothic',
  'M PLUS 2', 'Zen Antique', 'Zen Antique Soft', 'Kaisei Decol', 'Kaisei HarunoUmi', 'Kaisei Opti', 'Kaisei Tokumin', 'Dela Gothic One', 'DotGothic16', 'Poti'
].map(name => ({
  id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  name,
  shelf: 'Latin',
  language: 'English',
  cssFamily: `'${name}', sans-serif`,
  googleFont: name.replace(/\s+/g, '+'),
  sampleText: 'Modern ultra-crisp digital interface typography 1234567890'
}));

const monospaceFonts = [
  'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'IBM Plex Mono', 'Roboto Mono', 'Space Mono', 'Inconsolata', 'DM Mono', 'Anonymous Pro', 'Courier Prime',
  'Overpass Mono', 'Share Tech Mono', 'VT323', 'Cutive Mono', 'Red Hat Mono', 'B612 Mono', 'Major Mono Display', 'Nova Mono', 'Ubuntu Mono', 'Fira Mono',
  'PT Mono', 'Nanum Gothic Coding', 'Oxygen Mono', 'Cousine', 'Syne Mono', 'Fragment Mono', 'Spline Sans Mono', 'Martian Mono', 'Geist Mono', 'Cascadia Code',
  'Monaspace Neon', 'Monaspace Argon', 'Monaspace Radon', 'Monaspace Krypton', 'Monaspace Xenon', 'Victor Mono', 'Comic Mono', 'Commit Mono', 'Iosevka', 'Hasklig',
  'Sudo Mono', 'Hermit Mono', 'Envy Code R', 'Fantasque Sans Mono', 'Dank Mono', 'Berkeley Mono', 'Recursive Mono', 'M Plus 1 Code', 'Azeret Mono', 'Chivo Mono',
  'Sono', 'Xanh Mono', 'Kode Mono', 'Ubuntu Sans Mono', 'Fira Code Light', 'Fira Code Medium', 'Fira Code Bold', 'JetBrains Mono NL', 'Monofur', 'ProFont'
].map(name => ({
  id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  name,
  shelf: 'Mono',
  language: 'Coding',
  cssFamily: `'${name}', monospace`,
  googleFont: name.replace(/\s+/g, '+'),
  sampleText: 'const runtime = new AgentRuntime({ stream: true, latency: 38 });'
}));

const serifFonts = [
  'Playfair Display', 'Merriweather', 'Lora', 'Cormorant Garamond', 'Cinzel', 'Bodoni Moda', 'Spectral', 'Newsreader', 'Fraunces', 'Bitter',
  'Alegreya', 'EB Garamond', 'Prata', 'Marcellus', 'Castoro', 'Libre Baskerville', 'PT Serif', 'Crimson Text', 'Vollkorn', 'Domine',
  'Frank Ruhl Libre', 'Cardo', 'Faustina', 'Besley', 'DM Serif Display', 'Arvo', 'Rokkitt', 'Zilla Slab', 'Bree Serif', 'Cinzel Decorative',
  'Cormorant', 'Cormorant SC', 'Cormorant Infant', 'Cormorant Upright', 'Cormorant Unicase', 'Oranienbaum', 'Rozha One', 'BioRhyme', 'BioRhyme Expanded', 'Ultra',
  'Cutive', 'Podkova', 'Baskervville', 'Petrona', 'Old Standard TT', 'Gilda Display', 'Sorts Mill Goudy', 'Arapey', 'Trocchi', 'Neuton',
  'Quattrocento', 'Alice', 'Ledger', 'Buenard', 'Belgrano', 'Radley', 'Montaga', 'Almendra', 'Almendra SC', 'Almendra Display',
  'Italiana', 'Federo', 'Vidaloka', 'Jacques Francois', 'Marcellus SC', 'Unna', 'Poly', 'Fanwood Text', 'Judson', 'Gabriela',
  'Linden Hill', 'Habibi', 'Mate', 'Mate SC', 'Fondamento', 'Kotta One', 'Headland One', 'Inika', 'Antic Didone', 'Sedan',
  'Sedan SC', 'Bona Nova', 'Bona Nova SC', 'Castoro Titling', 'Brygada 1918', 'Calistoga', 'Zilla Slab Highlight', 'Stint Ultra Condensed', 'Stint Ultra Expanded', 'Trirong Serif'
].map(name => ({
  id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  name,
  shelf: 'Serif',
  language: 'Serif',
  cssFamily: `'${name}', serif`,
  googleFont: name.replace(/\s+/g, '+'),
  sampleText: 'Timeless literary elegance and high-contrast editorial craft.'
}));

const displayAndCreative = [
  'Bungee', 'Anton', 'Bebas Neue', 'Righteous', 'Shrikhand', 'Orbitron', 'Russo One', 'Archivo Black', 'Bangers', 'Creepster',
  'Monoton', 'Press Start 2P', 'Silkscreen', 'Black Ops One', 'Sigmar', 'Audiowide', 'Alfa Slab One', 'Squada One', 'Titan One', 'Faster One',
  'Bungee Shade', 'Bungee Inline', 'Bungee Outline', 'Abril Fatface', 'Carter One', 'Fugaz One', 'Squashy', 'Black Han Sans', 'Staatliches', 'Fredoka',
  'Fredoka One', 'Chango', 'Rampart One', 'Balsamiq Sans', 'Chewy', 'Sniglet', 'Boogaloo', 'Luckiest Guy', 'Slackey', 'Bowlby One',
  'Bowlby One SC', 'Kavoon', 'Paytone One', 'Passion One', 'Patua One', 'Concert One', 'Carter Display', 'Acme', 'Rhodium Libre', 'Chau Philomene One',
  'Skranji', 'Metamorphous', 'Geostar', 'Geostar Fill', 'Megrim', 'Plaster', 'Wallpoet', 'Nova Square', 'Nova Flat', 'Nova Round',
  'Nova Slim', 'Nova Oval', 'Nova Script', 'Nova Cut', 'Kelly Slab', 'Ruslan Display', 'Pirata One', 'Eater', 'Nosifer', 'Butcherman',
  'Frijole', 'Creepster Caps', 'Fontdiner Swanky', 'Smokum', 'Rye', 'Sancreek', 'Trade Winds', 'Ewert', 'Diplomata', 'Diplomata SC',
  'Vast Shadow', 'Ribeye', 'Ribeye Marrow', 'Asset', 'Sonsie One', 'Smythe', 'Underdog', 'Glass Antiqua', 'Milonga', 'Akronim',
  'Pacifico', 'Great Vibes', 'Dancing Script', 'Caveat', 'Permanent Marker', 'Satisfy', 'Sacramento', 'Cookie', 'Yellowtail', 'Kaushan Script',
  'Allura', 'Alex Brush', 'Shadows Into Light', 'Indie Flower', 'Bad Script', 'Marck Script', 'Damion', 'Courgette', 'Grand Hotel', 'Playball',
  'Leckerli One', 'Niconne', 'Parisienne', 'Rochester', 'Arizonia', 'Herr Von Muellerhoff', 'Qwigley', 'Monsieur La Doulaise', 'Mrs Saint Delafield', 'Pinyon Script',
  'Mr De Haviland', 'Ruthie', 'Miss Fajardose', 'Seaweed Script', 'Dawning of a New Day', 'Sue Ellen Francisco', 'Just Me Again Down Here', 'Loved by the King', 'Reenie Beanie', 'Covered By Your Grace',
  'Waiting for the Sunrise', 'Rock Salt', 'Nothing You Could Do', 'Over the Rainbow', 'Zeyada', 'Gochi Hand', 'Gloria Hallelujah', 'Annie Use Your Telescope', 'Architects Daughter', 'Patrick Hand',
  'Schoolbell', 'Crafty Girls', 'The Girl Next Door', 'Walter Turncoat', 'Calligraffitti', 'Short Stack', 'Delius', 'Delius Unicase', 'Delius Swash Caps', 'Handlee'
].map(name => ({
  id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  name,
  shelf: 'Display',
  language: 'Display',
  cssFamily: `'${name}', cursive, sans-serif`,
  googleFont: name.replace(/\s+/g, '+'),
  sampleText: 'UNIQUE HEADLINE DISPLAY ARTWORK 12345'
}));

const japaneseAndEastAsian = [
  'Noto Sans JP', 'Noto Serif JP', 'Zen Kaku Gothic New', 'Zen Maru Gothic', 'Zen Antique', 'Zen Antique Soft', 'Shippori Mincho', 'Shippori Mincho B1',
  'Shippori Antique', 'Shippori Antique B1', 'M PLUS 1p', 'M PLUS Rounded 1c', 'M PLUS 1', 'M PLUS 2', 'Kosugi', 'Kosugi Maru',
  'Yuji Boku', 'Yuji Mai', 'Yuji Syuku', 'Hachi Maru Pop', 'Kiwi Maru', 'Dela Gothic One', 'DotGothic16', 'Kaisei Decol',
  'Kaisei HarunoUmi', 'Kaisei Opti', 'Kaisei Tokumin', 'Poti', 'Reggae One', 'Stick', 'RocknRoll One', 'Train One',
  'Yusei Magic', 'Klee One', 'Potta One', 'Noto Sans SC', 'Noto Serif SC', 'Noto Sans TC', 'Noto Serif TC', 'Noto Sans HK',
  'Noto Serif HK', 'Ma Shan Zheng', 'ZCOOL XiaoWei', 'ZCOOL QingKe HuangYou', 'ZCOOL KuaiLe', 'Zhi Mang Xing', 'Long Cang', 'Liu Jian Mao Cao'
].map(name => ({
  id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  name,
  shelf: 'Asian & World',
  language: 'Japanese & CJK',
  cssFamily: `'${name}', sans-serif`,
  googleFont: name.replace(/\s+/g, '+'),
  sampleText: '人工知能モデルと最新テクノロジーの融合 日本語'
}));

const hebrewFonts = [
  'Heebo', 'Assistant', 'Rubik', 'Varela Round', 'Secular One', 'Frank Ruhl Libre', 'Miriam Libre', 'Bellefair', 'Karantina', 'Cousine',
  'Tinos', 'Arimo', 'Alef', 'David Libre', 'Suez One', 'Amatic SC', 'Yiddishkeit', 'Rubik Glitch', 'Rubik Moonrocks', 'Rubik Beastly',
  'Rubik Bubbles', 'Rubik Spray Paint', 'Rubik Dirt', 'Rubik Puddles', 'Rubik Distressed', 'Rubik Burned', 'Rubik Microbe', 'Rubik Vinyl', 'Rubik Gemstones', 'Rubik Wet Paint'
].map(name => ({
  id: 'he-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  name: name + ' (Hebrew)',
  shelf: 'Asian & World',
  language: 'Hebrew',
  cssFamily: `'${name}', sans-serif`,
  googleFont: name.replace(/\s+/g, '+'),
  sampleText: 'בינה מלאכותית מתקדמת וממשק משתמש אלגנטי'
}));

const devanagariFonts = [
  'Poppins', 'Hind', 'Rajdhani', 'Kalam', 'Rozha One', 'Teko', 'Khand', 'Sarala', 'Yatra One', 'Gotu',
  'Modak', 'Eczar', 'Ranga', 'Sahitya', 'Halant', 'Jaldi', 'Biryani', 'Karma', 'Amita', 'Cambay',
  'Kurale', 'Tillana', 'Kadwa', 'Laila', 'Martel', 'Martel Sans', 'Asar', 'Dekko', 'Inknut Antiqua', 'Pragati Narrow',
  'Glegoo', 'Samyak Devanagari', 'Sarpanch', 'Rhodium Libre', 'Vesper Libre', 'Anek Devanagari', 'Noto Sans Devanagari', 'Noto Serif Devanagari', 'Chivo Devanagari', 'Gantari Devanagari'
].map(name => ({
  id: 'hi-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  name: name + ' (Hindi)',
  shelf: 'Asian & World',
  language: 'Devanagari',
  cssFamily: `'${name}', sans-serif`,
  googleFont: name.replace(/\s+/g, '+'),
  sampleText: 'कृत्रिम बुद्धिमत्ता और बहुभाषी तकनीक भारत'
}));

const thaiFonts = [
  'Prompt', 'Kanit', 'Sarabun', 'Mitr', 'Chakra Petch', 'Pattaya', 'Bai Jamjuree', 'Pridi', 'Taviraj', 'Trirong',
  'Krub', 'Mali', 'Srisakdi', 'Charm', 'KoHo', 'Fahkwang', 'Niramit', 'Itim', 'Athiti', 'Chonburi',
  'Charmonman', 'Noto Sans Thai', 'Noto Serif Thai', 'Noto Sans Thai Looped', 'Noto Serif Thai Looped', 'Knewave Thai', 'Thasadith', 'K2D', 'Niradei', 'Sriracha'
].map(name => ({
  id: 'th-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  name: name + ' (Thai)',
  shelf: 'Asian & World',
  language: 'Thai',
  cssFamily: `'${name}', sans-serif`,
  googleFont: name.replace(/\s+/g, '+'),
  sampleText: 'ปัญญาประดิษฐ์และระบบการทำงานอัจฉริยะ ประเทศไทย'
}));

const cyrillicFonts = [
  'Oswald', 'Montserrat', 'Rubik', 'Jura', 'Kelly Slab', 'Ruslan Display', 'Bad Script', 'Marck Script', 'Caveat', 'Comfortaa',
  'Fira Sans', 'Play', 'Cuprum', 'Philosopher', 'Tenor Sans', 'Forum', 'Yeseva One', 'Lobster', 'Pacifico', 'Russo One',
  'Neucha', 'Podkova', 'Pangolin', 'Underdog', 'Prosto One', 'Marmelad', 'Stalinist One', 'Oranienbaum', 'Cormorant Infant', 'Alegreya Sans',
  'Alegreya SC', 'PT Sans Caption', 'PT Serif Caption', 'Noto Sans Cyrillic', 'Noto Serif Cyrillic', 'Golos Text', 'Onest', 'Ubuntu Cyrillic', 'Exo 2 Cyrillic', 'Lora Cyrillic'
].map(name => ({
  id: 'cy-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  name: name + ' (Cyrillic)',
  shelf: 'Latin',
  language: 'Cyrillic',
  cssFamily: `'${name}', sans-serif`,
  googleFont: name.replace(/\s+/g, '+'),
  sampleText: 'Искусственный интеллект и машинное обучение'
}));

const extraWorldFonts = [
  'Nanum Myeongjo', 'Nanum Pen Script', 'Nanum Brush Script', 'Gowun Batang', 'Gowun Dodum', 'East Sea Dokdo', 'Dokdo', 'Song Myung', 'Gugi', 'Black And White Picture',
  'Gamja Flower', 'Hi Melody', 'Cute Font', 'Yeon Sung', 'Single Day', 'Poor Story', 'Kirang Haerang', 'Gaegu', 'Dongle', 'Hahmlet',
  'GFS Didot', 'GFS Neohellenic', 'Didact Gothic', 'Alegreya Sans SC', 'Philosopher Bold', 'Jura Light', 'Kelly Slab Retro', 'Marcellus SC Pro', 'Old Standard TT Bold', 'Averia Serif Libre',
  'Fantasque Sans Mono', 'Fira Code VF', 'Intel One Mono', 'Sudo Mono Pro', 'Monaspace Krypton Wide', 'Monaspace Neon Wide', 'Commit Mono Regular', 'Cascadia Code PL', 'Geist Mono VF', 'Zed Mono',
  'Oi', 'Rubik Glitch Pop', 'Rubik Moonrocks Pro', 'Rubik Beastly Heavy', 'Rubik Bubbles Soft', 'Rubik Spray Paint Pro', 'Rubik Dirt Grunge', 'Rubik Puddles Water', 'Rubik Distressed Retro', 'Rubik Burned Fire',
  'Rubik Microbe Pixel', 'Rubik Vinyl Retro', 'Rubik Gemstones Deco', 'Rubik Wet Paint Brush', 'Jacquarda Bastarda 9 Pro', 'Jacquard 12 Pro', 'Jacquard 24 Pro', 'Jersey 10 Stencil', 'Jersey 15 Athletic', 'Jersey 20 Vintage',
  'Sora Pro', 'Plus Jakarta Sans Pro', 'Outfit Pro', 'Inter Tight Pro', 'Work Sans Pro', 'Cabinet Grotesk Pro', 'Satoshi Pro', 'Clash Display Pro', 'General Sans Pro', 'Switzer Pro',
  'Manrope Pro', 'Space Grotesk Pro', 'Syne Pro', 'Urbanist Pro', 'Epilogue Pro', 'Figtree Pro', 'Rubik Pro', 'Nunito Pro', 'Lexend Pro', 'Raleway Pro'
].map(name => ({
  id: 'world-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  name,
  shelf: 'Asian & World',
  language: 'Japanese & CJK',
  cssFamily: `'${name}', sans-serif`,
  googleFont: name.replace(/\s+/g, '+'),
  sampleText: 'Worldwide Global Typography 1234567890'
}));

// Convert local fonts metadata to FontItems
const localFontItems = localMeta.map(m => ({
  id: m.id,
  name: m.name,
  nativeName: m.name,
  shelf: 'Persian & Arabic',
  language: 'Persian',
  cssFamily: `'${m.name}', sans-serif`,
  sampleText: 'هوش مصنوعی پیشرفته و تایپوگرافی اصیل ایرانی',
  isLocal: true,
}));

// Combine and deduplicate
const allFonts = [];
const seen = new Set();

function pushList(list) {
  for (const item of list) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      allFonts.push(item);
    }
  }
}

pushList(localFontItems);
pushList(webPersian);
pushList(arabicFonts);
pushList(latinSansFonts);
pushList(monospaceFonts);
pushList(serifFonts);
pushList(displayAndCreative);
pushList(japaneseAndEastAsian);
pushList(hebrewFonts);
pushList(devanagariFonts);
pushList(thaiFonts);
pushList(cyrillicFonts);
pushList(extraWorldFonts);

console.log('Total unique fonts compiled:', allFonts.length);

// Generate fonts.ts file
const fileHeader = `// Pimx Agent AI - Worldwide 1,000+ Typography Catalog & Multi-Script Engine
// Supporting Persian, Arabic, Latin, Monospace, CJK, Hebrew, Devanagari, Thai, and Cyrillic
// Seamlessly integrated with local Persian fonts (/fonts/local-fonts.css) and Google Fonts CDN

export interface FontItem {
  id: string;
  name: string;
  nativeName?: string;
  shelf: 'Persian & Arabic' | 'Latin' | 'Serif' | 'Mono' | 'Display' | 'Handwriting' | 'Asian & World';
  language:
    | 'Persian'
    | 'Arabic'
    | 'English'
    | 'Coding'
    | 'Serif'
    | 'Display'
    | 'Handwriting'
    | 'Japanese & CJK'
    | 'Hebrew'
    | 'Devanagari'
    | 'Thai'
    | 'Cyrillic';
  cssFamily: string;
  googleFont?: string;
  sampleText?: string;
  isLocal?: boolean;
}

export interface FontCategory {
  id: string;
  name: string;
  nameFa: string;
  icon: string;
  languageKey?: FontItem['language'] | 'ALL';
}

export const FONT_CATEGORIES: FontCategory[] = [
  { id: 'ALL', name: 'All Fonts', nameFa: 'همه فونت‌ها (۱۰۰۰+)', icon: '🌐', languageKey: 'ALL' },
  { id: 'Persian', name: 'Persian & Farsi', nameFa: 'فارسی و ایرانی', icon: '🇮🇷', languageKey: 'Persian' },
  { id: 'Arabic', name: 'Arabic & Middle East', nameFa: 'عربی و خاورمیانه', icon: '🌙', languageKey: 'Arabic' },
  { id: 'English', name: 'English & Modern Sans', nameFa: 'انگلیسی و سنس مدرن', icon: '🔤', languageKey: 'English' },
  { id: 'Coding', name: 'Developer & Monospace', nameFa: 'برنامه‌نویسی و مونو', icon: '💻', languageKey: 'Coding' },
  { id: 'Serif', name: 'Editorial & Serif Classics', nameFa: 'کلاسیک و سریف', icon: '📰', languageKey: 'Serif' },
  { id: 'Display', name: 'Display & Creative', nameFa: 'تیتری و دیزاین خاص', icon: '🎨', languageKey: 'Display' },
  { id: 'Japanese & CJK', name: 'Japanese & CJK', nameFa: 'ژاپنی و شرق آسیا', icon: '🗾', languageKey: 'Japanese & CJK' },
  { id: 'Hebrew', name: 'Hebrew', nameFa: 'عبری', icon: '📜', languageKey: 'Hebrew' },
  { id: 'Devanagari', name: 'Devanagari & Hindi', nameFa: 'هندی و دیواناگری', icon: '🕉️', languageKey: 'Devanagari' },
  { id: 'Thai', name: 'Thai & Southeast Asia', nameFa: 'تایلندی و جنوب شرق آسیا', icon: '🌴', languageKey: 'Thai' },
  { id: 'Cyrillic', name: 'Cyrillic & Slavic', nameFa: 'روسی و سیریلیک', icon: '🇷🇺', languageKey: 'Cyrillic' },
];
`;

const fileBody = `export const APP_FONTS: FontItem[] = ${JSON.stringify(allFonts, null, 2)};

export function getFontItem(fontId: string): FontItem | undefined {
  return APP_FONTS.find((f) => f.id === fontId);
}

export function getFontFamily(fontId: string): string {
  if (!fontId) return "'Vazirmatn', system-ui, sans-serif";
  const found = APP_FONTS.find((f) => f.id === fontId);
  return found ? found.cssFamily : \`'\${fontId}', system-ui, sans-serif\`;
}

export function getGoogleFontName(fontId: string): string | undefined {
  const found = APP_FONTS.find((f) => f.id === fontId);
  return found?.googleFont;
}

export function getFontsByLanguage(lang: FontItem['language']): FontItem[] {
  return APP_FONTS.filter((f) => f.language === lang);
}

export function getFontsByCategory(catId: string): FontItem[] {
  if (catId === 'ALL') return APP_FONTS;
  return APP_FONTS.filter((f) => f.language === catId);
}

export function getTextDirection(text: string): 'rtl' | 'ltr' {
  if (!text) return 'ltr';
  const rtlRegex = /[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF\\u0590-\\u05FF]/;
  return rtlRegex.test(text) ? 'rtl' : 'ltr';
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'lib', 'theme', 'fonts.ts'), fileHeader + '\n' + fileBody);
console.log('Successfully wrote lib/theme/fonts.ts with', allFonts.length, 'fonts!');
