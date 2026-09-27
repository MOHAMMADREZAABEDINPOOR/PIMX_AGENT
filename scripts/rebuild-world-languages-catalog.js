const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'lib', 'theme', 'fonts-catalog.json');
const rawCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Authentic World Languages definition (Alphabetically ordered A-Z)
const WORLD_LANGUAGES_DEF = [
  { id: 'Arabic', name: 'Arabic', nativeName: 'العربية', icon: '🌙', sample: 'الذكاء الاصطناعي التوليدي وتطبيقات الويب الحديثة ١٢٣٤٥' },
  { id: 'Bengali', name: 'Bengali', nativeName: 'বাংলা', icon: '🇧🇩', sample: 'কৃত্রিম বুদ্ধিমত্তা এবং আধুনিক ওয়েব প্রযুক্তি ১২৩৪৫' },
  { id: 'Chinese (Simplified)', name: 'Chinese (Simplified)', nativeName: '简体中文', icon: '🇨🇳', sample: '人工智能与下一代现代技术应用 12345' },
  { id: 'Chinese (Traditional)', name: 'Chinese (Traditional)', nativeName: '繁體中文', icon: '🇭🇰', sample: '人工智慧與下一代現代技術應用 12345' },
  { id: 'Czech', name: 'Czech', nativeName: 'Čeština', icon: '🇨🇿', sample: 'Příliš žluťoučký kůň úpěl ďábelské ódy 12345' },
  { id: 'Danish', name: 'Danish', nativeName: 'Dansk', icon: '🇩🇰', sample: 'Quizdeltagerne spiste jordbær med fløde på en ø 12345' },
  { id: 'Dutch', name: 'Dutch', nativeName: 'Nederlands', icon: '🇳🇱', sample: 'Pa’s wijze lynx bezag vroom het fijne dwaas 12345' },
  { id: 'English', name: 'English', nativeName: 'English', icon: '🇬🇧', sample: 'The quick brown fox jumps over the lazy dog 12345' },
  { id: 'Finnish', name: 'Finnish', nativeName: 'Suomi', icon: '🇫🇮', sample: 'Viekas kettu hypähti laiskan koiran ylitse 12345' },
  { id: 'French', name: 'French', nativeName: 'Français', icon: '🇫🇷', sample: 'Portez ce vieux whisky au juge blond qui fume 12345' },
  { id: 'German', name: 'German', nativeName: 'Deutsch', icon: '🇩🇪', sample: 'Zwölf Boxkämpfer jagen Viktor quer über den großen Sylter Deich 12345' },
  { id: 'Greek', name: 'Greek', nativeName: 'Ελληνικά', icon: '🇬🇷', sample: 'Τεχνητή νοημοσύνη και προηγμένη τεχνολογία 12345' },
  { id: 'Gujarati', name: 'Gujarati', nativeName: 'ગુજરાતી', icon: '🇮🇳', sample: 'કૃત્રિમ બુદ્ધિ અને આધુનિક વેબ તકનીક ૧૨૩૪૫' },
  { id: 'Hebrew', name: 'Hebrew', nativeName: 'עברית', icon: '🇮🇱', sample: 'בינה מלאכותית מתקדמת וממשק משתמש אלגנטי 12345' },
  { id: 'Hindi', name: 'Hindi', nativeName: 'हिन्दी', icon: '🇮🇳', sample: 'कृत्रिम बुद्धिमत्ता और बहुभाषी आधुनिक तकनीक भारत 12345' },
  { id: 'Hungarian', name: 'Hungarian', nativeName: 'Magyar', icon: '🇭🇺', sample: 'Árvíztűrő tükörfúrógép és modern mesterséges intelligencia 12345' },
  { id: 'Indonesian', name: 'Indonesian', nativeName: 'Bahasa Indonesia', icon: '🇮🇩', sample: 'Kecerdasan buatan dan teknologi web modern terdepan 12345' },
  { id: 'Italian', name: 'Italian', nativeName: 'Italiano', icon: '🇮🇹', sample: 'Cantami, o Diva, del pelìde Achille l’ira funesta 12345' },
  { id: 'Japanese', name: 'Japanese', nativeName: '日本語', icon: '🇯🇵', sample: '人工知能モデルと最新テクノロジーの融合 日本語 12345' },
  { id: 'Kannada', name: 'Kannada', nativeName: 'ಕನ್ನಡ', icon: '🇮🇳', sample: 'ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ಆಧುನಿಕ ವೆಬ್ ತಂತ್ರಜ್ಞಾನ ೧೨೩೪೫' },
  { id: 'Korean', name: 'Korean', nativeName: '한국어', icon: '🇰🇷', sample: '인공지능 모델과 최신 기술의 완벽한 융합 한국어 12345' },
  { id: 'Malay', name: 'Malay', nativeName: 'Bahasa Melayu', icon: '🇲🇾', sample: 'Kecerdasan buatan dan inovasi teknologi web moden 12345' },
  { id: 'Malayalam', name: 'Malayalam', nativeName: 'മലയാളം', icon: '🇮🇳', sample: 'കൃത്രിമ ബുദ്ധിശക്തിയും ആധുനിക വെബ് സാങ്കേതികവിദ്യയും 12345' },
  { id: 'Marathi', name: 'Marathi', nativeName: 'मराठी', icon: '🇮🇳', sample: 'कृत्रिम बुद्धिमत्ता आणि प्रगत आधुनिक तंत्रज्ञान 12345' },
  { id: 'Norwegian', name: 'Norwegian', nativeName: 'Norsk', icon: '🇳🇴', sample: 'Vår særpregede kunst og kunstige intelligens 12345' },
  { id: 'Persian', name: 'Persian', nativeName: 'فارسی', icon: '🇮🇷', sample: 'هوش مصنوعی پیشرفته و تایپوگرافی اصیل ایرانی ۱۲۳۴۵' },
  { id: 'Polish', name: 'Polish', nativeName: 'Polski', icon: '🇵🇱', sample: 'Zażółć gęślą jaźń w dobie nowoczesnej sztucznej inteligencji 12345' },
  { id: 'Portuguese', name: 'Portuguese', nativeName: 'Português', icon: '🇵🇹', sample: 'O rápido morcego voava sobre a bela maçã verde 12345' },
  { id: 'Romanian', name: 'Romanian', nativeName: 'Română', icon: '🇷🇴', sample: 'Inteligență artificială și tehnologii web moderne 12345' },
  { id: 'Russian', name: 'Russian', nativeName: 'Русский', icon: '🇷🇺', sample: 'Съешь же ещё этих мягких французских булок, да выпей чаю 12345' },
  { id: 'Spanish', name: 'Spanish', nativeName: 'Español', icon: '🇪🇸', sample: 'El veloz murciélago hindú comía feliz cardillo y kiwi 12345' },
  { id: 'Swahili', name: 'Swahili', nativeName: 'Kiswahili', icon: '🇰🇪', sample: 'Akili bandia na teknolojia ya kisasa ya wavuti 12345' },
  { id: 'Swedish', name: 'Swedish', nativeName: 'Svenska', icon: '🇸🇪', sample: 'Flygande bäckasiner söka hwila på mjuk tuva 12345' },
  { id: 'Tagalog', name: 'Tagalog', nativeName: 'Filipino', icon: '🇵🇭', sample: 'Artipisyal na katalinuhan at modernong teknolohiya 12345' },
  { id: 'Tamil', name: 'Tamil', nativeName: 'தமிழ்', icon: '🇮🇳', sample: 'செயற்கை நுண்ணறிவு மற்றும் நவீன இணைய தொழில்நுட்பம் 12345' },
  { id: 'Telugu', name: 'Telugu', nativeName: 'తెలుగు', icon: '🇮🇳', sample: 'కృత్రిమ మేధస్సు మరియు ఆధునిక వెబ్ సాంకేతికత 12345' },
  { id: 'Thai', name: 'Thai', nativeName: 'ไทย', icon: '🇹🇭', sample: 'ปัญญาประดิษฐ์และระบบการทำงานอัจฉریยะ ประเทศไทย 12345' },
  { id: 'Turkish', name: 'Turkish', nativeName: 'Türkçe', icon: '🇹🇷', sample: 'Pijamalı hasta yağız şoföre çabucak güvendi 12345' },
  { id: 'Ukrainian', name: 'Ukrainian', nativeName: 'Українська', icon: '🇺🇦', sample: 'Штучний інтелект та новітні технології майбутнього 12345' },
  { id: 'Urdu', name: 'Urdu', nativeName: 'اردو', icon: '🇵🇰', sample: 'مصنوعی ذہانت اور جدید ترین ویب ٹیکنالوجی ۱۲۳۴۵' },
  { id: 'Vietnamese', name: 'Vietnamese', nativeName: 'Tiếng Việt', icon: '🇻🇳', sample: 'Trí tuệ nhân tạo và công nghệ hiện đại hàng đầu 12345' }
];

// Curated top authentic fonts for specific world languages (at least 6-8 per language)
const SPECIFIC_LANGUAGE_FONTS = {
  'Spanish': [
    { name: 'Montserrat', family: 'Montserrat, sans-serif' },
    { name: 'Alegreya', family: 'Alegreya, serif' },
    { name: 'Merriweather', family: 'Merriweather, serif' },
    { name: 'Lora', family: 'Lora, serif' },
    { name: 'Rubik', family: 'Rubik, sans-serif' },
    { name: 'Cinzel', family: 'Cinzel, serif' },
    { name: 'Source Sans 3', family: 'Source Sans 3, sans-serif' },
    { name: 'Playfair Display', family: 'Playfair Display, serif' }
  ],
  'French': [
    { name: 'Cormorant Garamond', family: 'Cormorant Garamond, serif' },
    { name: 'EB Garamond', family: 'EB Garamond, serif' },
    { name: 'Parisienne', family: 'Parisienne, cursive' },
    { name: 'Alex Brush', family: 'Alex Brush, cursive' },
    { name: 'Bodoni Moda', family: 'Bodoni Moda, serif' },
    { name: 'Cinzel Decorative', family: 'Cinzel Decorative, serif' },
    { name: 'Marcellus', family: 'Marcellus, serif' }
  ],
  'German': [
    { name: 'Fira Sans', family: 'Fira Sans, sans-serif' },
    { name: 'UnifrakturMaguntia', family: 'UnifrakturMaguntia, cursive' },
    { name: 'Cinzel', family: 'Cinzel, serif' },
    { name: 'Crimson Pro', family: 'Crimson Pro, serif' },
    { name: 'Albert Sans', family: 'Albert Sans, sans-serif' },
    { name: 'Titillium Web', family: 'Titillium Web, sans-serif' }
  ],
  'Italian': [
    { name: 'Cinzel', family: 'Cinzel, serif' },
    { name: 'Bodoni Moda', family: 'Bodoni Moda, serif' },
    { name: 'Prata', family: 'Prata, serif' },
    { name: 'Castoro', family: 'Castoro, serif' },
    { name: 'Playfair Display', family: 'Playfair Display, serif' },
    { name: 'Cardo', family: 'Cardo, serif' }
  ],
  'Portuguese': [
    { name: 'Raleway', family: 'Raleway, sans-serif' },
    { name: 'Mulish', family: 'Mulish, sans-serif' },
    { name: 'Cinzel Decorative', family: 'Cinzel Decorative, serif' },
    { name: 'Jost', family: 'Jost, sans-serif' },
    { name: 'Libre Baskerville', family: 'Libre Baskerville, serif' },
    { name: 'Barlow', family: 'Barlow, sans-serif' }
  ],
  'Russian': [
    { name: 'PT Sans', family: 'PT Sans, sans-serif' },
    { name: 'PT Serif', family: 'PT Serif, serif' },
    { name: 'Jura', family: 'Jura, sans-serif' },
    { name: 'Oswald', family: 'Oswald, sans-serif' },
    { name: 'Playfair Display', family: 'Playfair Display, serif' },
    { name: 'Rubik', family: 'Rubik, sans-serif' },
    { name: 'Fira Sans', family: 'Fira Sans, sans-serif' },
    { name: 'Roboto Slab', family: 'Roboto Slab, serif' }
  ],
  'Ukrainian': [
    { name: 'Arsenal', family: 'Arsenal, sans-serif' },
    { name: 'Comfortaa', family: 'Comfortaa, cursive' },
    { name: 'Kelly Slab', family: 'Kelly Slab, cursive' },
    { name: 'Russo One', family: 'Russo One, sans-serif' },
    { name: 'PT Sans', family: 'PT Sans, sans-serif' },
    { name: 'Oswald', family: 'Oswald, sans-serif' }
  ],
  'Polish': [
    { name: 'Lato', family: 'Lato, sans-serif' },
    { name: 'Krona One', family: 'Krona One, sans-serif' },
    { name: 'Syne', family: 'Syne, sans-serif' },
    { name: 'Plus Jakarta Sans', family: 'Plus Jakarta Sans, sans-serif' },
    { name: 'Epilogue', family: 'Epilogue, sans-serif' },
    { name: 'Space Grotesk', family: 'Space Grotesk, sans-serif' }
  ],
  'Czech': [
    { name: 'Urbanist', family: 'Urbanist, sans-serif' },
    { name: 'Manrope', family: 'Manrope, sans-serif' },
    { name: 'DM Sans', family: 'DM Sans, sans-serif' },
    { name: 'Outfit', family: 'Outfit, sans-serif' },
    { name: 'Sora', family: 'Sora, sans-serif' },
    { name: 'Cinzel', family: 'Cinzel, serif' }
  ],
  'Dutch': [
    { name: 'Inter', family: 'Inter, sans-serif' },
    { name: 'Work Sans', family: 'Work Sans, sans-serif' },
    { name: 'Quicksand', family: 'Quicksand, sans-serif' },
    { name: 'Cabin', family: 'Cabin, sans-serif' },
    { name: 'Nunito', family: 'Nunito, sans-serif' },
    { name: 'Rubik', family: 'Rubik, sans-serif' }
  ],
  'Swedish': [
    { name: 'Josefin Sans', family: 'Josefin Sans, sans-serif' },
    { name: 'Barlow Semi Condensed', family: 'Barlow Semi Condensed, sans-serif' },
    { name: 'Karla', family: 'Karla, sans-serif' },
    { name: 'Overpass', family: 'Overpass, sans-serif' },
    { name: 'Figtree', family: 'Figtree, sans-serif' }
  ],
  'Danish': [
    { name: 'Cinzel', family: 'Cinzel, serif' },
    { name: 'Syne', family: 'Syne, sans-serif' },
    { name: 'Alata', family: 'Alata, sans-serif' },
    { name: 'Archivo', family: 'Archivo, sans-serif' },
    { name: 'Public Sans', family: 'Public Sans, sans-serif' }
  ],
  'Finnish': [
    { name: 'Exo 2', family: 'Exo 2, sans-serif' },
    { name: 'Asap', family: 'Asap, sans-serif' },
    { name: 'Chivo', family: 'Chivo, sans-serif' },
    { name: 'Catamaran', family: 'Catamaran, sans-serif' },
    { name: 'Mitr', family: 'Mitr, sans-serif' }
  ],
  'Norwegian': [
    { name: 'Golos Text', family: 'Golos Text, sans-serif' },
    { name: 'Schibsted Grotesk', family: 'Schibsted Grotesk, sans-serif' },
    { name: 'Albert Sans', family: 'Albert Sans, sans-serif' },
    { name: 'Hanken Grotesk', family: 'Hanken Grotesk, sans-serif' },
    { name: 'Spline Sans', family: 'Spline Sans, sans-serif' }
  ],
  'Turkish': [
    { name: 'Oswald', family: 'Oswald, sans-serif' },
    { name: 'Ubuntu', family: 'Ubuntu, sans-serif' },
    { name: 'Barlow', family: 'Barlow, sans-serif' },
    { name: 'Teko', family: 'Teko, sans-serif' },
    { name: 'Yanone Kaffeesatz', family: 'Yanone Kaffeesatz, sans-serif' },
    { name: 'Bebas Neue', family: 'Bebas Neue, cursive' }
  ],
  'Romanian': [
    { name: 'Signika', family: 'Signika, sans-serif' },
    { name: 'Alegreya Sans', family: 'Alegreya Sans, sans-serif' },
    { name: 'Domine', family: 'Domine, serif' },
    { name: 'Bree Serif', family: 'Bree Serif, serif' },
    { name: 'Bitter', family: 'Bitter, serif' }
  ],
  'Hungarian': [
    { name: 'Ruda', family: 'Ruda, sans-serif' },
    { name: 'Maven Pro', family: 'Maven Pro, sans-serif' },
    { name: 'Kalam', family: 'Kalam, cursive' },
    { name: 'Lexend', family: 'Lexend, sans-serif' },
    { name: 'Spectral', family: 'Spectral, serif' }
  ],
  'Indonesian': [
    { name: 'Plus Jakarta Sans', family: 'Plus Jakarta Sans, sans-serif' },
    { name: 'Nunito', family: 'Nunito, sans-serif' },
    { name: 'Rubik', family: 'Rubik, sans-serif' },
    { name: 'Poppins', family: 'Poppins, sans-serif' },
    { name: 'Inter', family: 'Inter, sans-serif' }
  ],
  'Malay': [
    { name: 'Mukta', family: 'Mukta, sans-serif' },
    { name: 'Hind', family: 'Hind, sans-serif' },
    { name: 'Poppins', family: 'Poppins, sans-serif' },
    { name: 'Lexend Deca', family: 'Lexend Deca, sans-serif' },
    { name: 'DM Sans', family: 'DM Sans, sans-serif' }
  ],
  'Swahili': [
    { name: 'Ubuntu', family: 'Ubuntu, sans-serif' },
    { name: 'Sora', family: 'Sora, sans-serif' },
    { name: 'Outfit', family: 'Outfit, sans-serif' },
    { name: 'Work Sans', family: 'Work Sans, sans-serif' },
    { name: 'Montserrat', family: 'Montserrat, sans-serif' }
  ],
  'Tagalog': [
    { name: 'Poppins', family: 'Poppins, sans-serif' },
    { name: 'Quicksand', family: 'Quicksand, sans-serif' },
    { name: 'Mulish', family: 'Mulish, sans-serif' },
    { name: 'Inter', family: 'Inter, sans-serif' },
    { name: 'Barlow', family: 'Barlow, sans-serif' }
  ],
  'Hindi': [
    { name: 'Noto Sans Devanagari', family: 'Noto Sans Devanagari, sans-serif' },
    { name: 'Noto Serif Devanagari', family: 'Noto Serif Devanagari, serif' },
    { name: 'Rozha One', family: 'Rozha One, serif' },
    { name: 'Yatra One', family: 'Yatra One, cursive' },
    { name: 'Teko', family: 'Teko, sans-serif' },
    { name: 'Rajdhani', family: 'Rajdhani, sans-serif' },
    { name: 'Kalam', family: 'Kalam, cursive' },
    { name: 'Eczar', family: 'Eczar, serif' }
  ],
  'Bengali': [
    { name: 'Noto Sans Bengali', family: 'Noto Sans Bengali, sans-serif' },
    { name: 'Noto Serif Bengali', family: 'Noto Serif Bengali, serif' },
    { name: 'Galada', family: 'Galada, cursive' },
    { name: 'Mina', family: 'Mina, sans-serif' },
    { name: 'Atma', family: 'Atma, cursive' },
    { name: 'Hind Siliguri', family: 'Hind Siliguri, sans-serif' }
  ],
  'Tamil': [
    { name: 'Noto Sans Tamil', family: 'Noto Sans Tamil, sans-serif' },
    { name: 'Noto Serif Tamil', family: 'Noto Serif Tamil, serif' },
    { name: 'Catamaran', family: 'Catamaran, sans-serif' },
    { name: 'Mukta Malar', family: 'Mukta Malar, sans-serif' },
    { name: 'Coiny', family: 'Coiny, cursive' },
    { name: 'Pavanam', family: 'Pavanam, sans-serif' }
  ],
  'Telugu': [
    { name: 'Noto Sans Telugu', family: 'Noto Sans Telugu, sans-serif' },
    { name: 'Noto Serif Telugu', family: 'Noto Serif Telugu, serif' },
    { name: 'Ramabhadra', family: 'Ramabhadra, sans-serif' },
    { name: 'Suranna', family: 'Suranna, serif' },
    { name: 'Mallanna', family: 'Mallanna, sans-serif' },
    { name: 'Tenali Ramakrishna', family: 'Tenali Ramakrishna, sans-serif' }
  ],
  'Kannada': [
    { name: 'Noto Sans Kannada', family: 'Noto Sans Kannada, sans-serif' },
    { name: 'Noto Serif Kannada', family: 'Noto Serif Kannada, serif' },
    { name: 'Hubballi', family: 'Hubballi, cursive' },
    { name: 'Anek Kannada', family: 'Anek Kannada, sans-serif' },
    { name: 'Baloo Tamma 2', family: 'Baloo Tamma 2, cursive' }
  ],
  'Malayalam': [
    { name: 'Noto Sans Malayalam', family: 'Noto Sans Malayalam, sans-serif' },
    { name: 'Noto Serif Malayalam', family: 'Noto Serif Malayalam, serif' },
    { name: 'Manjari', family: 'Manjari, sans-serif' },
    { name: 'Gayathri', family: 'Gayathri, sans-serif' },
    { name: 'Chilanka', family: 'Chilanka, cursive' },
    { name: 'Anek Malayalam', family: 'Anek Malayalam, sans-serif' }
  ],
  'Gujarati': [
    { name: 'Noto Sans Gujarati', family: 'Noto Sans Gujarati, sans-serif' },
    { name: 'Noto Serif Gujarati', family: 'Noto Serif Gujarati, serif' },
    { name: 'Rasa', family: 'Rasa, serif' },
    { name: 'Mogra', family: 'Mogra, cursive' },
    { name: 'Anek Gujarati', family: 'Anek Gujarati, sans-serif' }
  ],
  'Marathi': [
    { name: 'Noto Sans Devanagari', family: 'Noto Sans Devanagari, sans-serif' },
    { name: 'Gotu', family: 'Gotu, sans-serif' },
    { name: 'Modak', family: 'Modak, cursive' },
    { name: 'Anek Devanagari', family: 'Anek Devanagari, sans-serif' },
    { name: 'Yatra One', family: 'Yatra One, cursive' }
  ],
  'Urdu': [
    { name: 'Noto Nastaliq Urdu', family: 'Noto Nastaliq Urdu, serif' },
    { name: 'Gulzar', family: 'Gulzar, serif' },
    { name: 'Amiri', family: 'Amiri, serif' },
    { name: 'Lateef', family: 'Lateef, cursive' },
    { name: 'Scheherazade New', family: 'Scheherazade New, serif' },
    { name: 'Reem Kufi', family: 'Reem Kufi, sans-serif' }
  ],
  'Chinese (Simplified)': [
    { name: 'Noto Sans SC', family: 'Noto Sans SC, sans-serif' },
    { name: 'Noto Serif SC', family: 'Noto Serif SC, serif' },
    { name: 'Ma Shan Zheng', family: 'Ma Shan Zheng, cursive' },
    { name: 'Zhi Mang Xing', family: 'Zhi Mang Xing, cursive' },
    { name: 'ZCOOL XiaoWei', family: 'ZCOOL XiaoWei, serif' },
    { name: 'ZCOOL QingKe HuangYou', family: 'ZCOOL QingKe HuangYou, cursive' },
    { name: 'ZCOOL KuaiLe', family: 'ZCOOL KuaiLe, cursive' },
    { name: 'Long Cang', family: 'Long Cang, cursive' }
  ],
  'Chinese (Traditional)': [
    { name: 'Noto Sans TC', family: 'Noto Sans TC, sans-serif' },
    { name: 'Noto Serif TC', family: 'Noto Serif TC, serif' },
    { name: 'Noto Sans HK', family: 'Noto Sans HK, sans-serif' },
    { name: 'Noto Serif HK', family: 'Noto Serif HK, serif' },
    { name: 'Chiron Sung HK', family: 'Chiron Sung HK, serif' },
    { name: 'Chiron Hei HK', family: 'Chiron Hei HK, sans-serif' }
  ],
  'Japanese': [
    { name: 'Noto Sans JP', family: 'Noto Sans JP, sans-serif' },
    { name: 'Noto Serif JP', family: 'Noto Serif JP, serif' },
    { name: 'M PLUS 1p', family: 'M PLUS 1p, sans-serif' },
    { name: 'M PLUS Rounded 1c', family: 'M PLUS Rounded 1c, sans-serif' },
    { name: 'Sawarabi Mincho', family: 'Sawarabi Mincho, serif' },
    { name: 'Sawarabi Gothic', family: 'Sawarabi Gothic, sans-serif' },
    { name: 'Shippori Mincho', family: 'Shippori Mincho, serif' },
    { name: 'Zen Kaku Gothic New', family: 'Zen Kaku Gothic New, sans-serif' },
    { name: 'Zen Maru Gothic', family: 'Zen Maru Gothic, sans-serif' },
    { name: 'Klee One', family: 'Klee One, cursive' },
    { name: 'Kaisei Decol', family: 'Kaisei Decol, serif' },
    { name: 'Dela Gothic One', family: 'Dela Gothic One, cursive' }
  ],
  'Korean': [
    { name: 'Noto Sans KR', family: 'Noto Sans KR, sans-serif' },
    { name: 'Noto Serif KR', family: 'Noto Serif KR, serif' },
    { name: 'Nanum Gothic', family: 'Nanum Gothic, sans-serif' },
    { name: 'Nanum Myeongjo', family: 'Nanum Myeongjo, serif' },
    { name: 'Nanum Pen Script', family: 'Nanum Pen Script, cursive' },
    { name: 'Nanum Brush Script', family: 'Nanum Brush Script, cursive' },
    { name: 'Black Han Sans', family: 'Black Han Sans, sans-serif' },
    { name: 'Do Hyeon', family: 'Do Hyeon, sans-serif' },
    { name: 'Song Myung', family: 'Song Myung, serif' },
    { name: 'Gowun Dodum', family: 'Gowun Dodum, sans-serif' },
    { name: 'Gowun Batang', family: 'Gowun Batang, serif' }
  ]
};

// Build sample map
const sampleMap = {};
WORLD_LANGUAGES_DEF.forEach(l => {
  sampleMap[l.id] = l.sample;
});

// Process catalog
const finalCatalog = [];
const seenKeys = new Set();

function addFontToCatalog(f) {
  const key = `${f.language}:${f.name.toLowerCase()}`;
  if (seenKeys.has(key)) return;
  seenKeys.add(key);
  finalCatalog.push(f);
}

// 1. Process existing catalog fonts
rawCatalog.forEach(f => {
  let lang = f.language;
  // Eliminate artificial categories
  if (lang === 'Coding' || lang === 'Serif' || lang === 'Display') {
    lang = 'English';
  } else if (lang === 'Devanagari') {
    lang = 'Hindi';
  } else if (lang === 'Japanese & CJK') {
    lang = 'Japanese';
  } else if (lang === 'Cyrillic') {
    lang = 'Russian';
  }

  // Assign updated language and sample text
  const cleanFont = {
    ...f,
    language: lang,
    sampleText: sampleMap[lang] || f.sampleText || sampleMap.English
  };
  addFontToCatalog(cleanFont);
});

// 2. Add specific fonts for each required world language
for (const [lang, fonts] of Object.entries(SPECIFIC_LANGUAGE_FONTS)) {
  fonts.forEach(item => {
    const safeId = `${lang.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    addFontToCatalog({
      id: safeId,
      name: item.name,
      language: lang,
      cssFamily: item.family,
      googleFont: item.name.replace(/\s+/g, '+'),
      sampleText: sampleMap[lang] || sampleMap.English,
      isLocal: false
    });
  });
}

// 3. Check language counts and ensure every single language in WORLD_LANGUAGES_DEF has >= 5 fonts
const counts = {};
finalCatalog.forEach(f => {
  counts[f.language] = (counts[f.language] || 0) + 1;
});

console.log('Language counts before guarantee:');
console.log(counts);

// For any language with < 5 fonts, supplement with high-quality multilingual web fonts
WORLD_LANGUAGES_DEF.forEach(langDef => {
  const currentCount = counts[langDef.id] || 0;
  if (currentCount < 5) {
    const deficit = 5 - currentCount;
    const universalFallbacks = [
      { name: 'Noto Sans', family: "'Noto Sans', sans-serif" },
      { name: 'Noto Serif', family: "'Noto Serif', serif" },
      { name: 'Inter', family: "'Inter', sans-serif" },
      { name: 'Roboto', family: "'Roboto', sans-serif" },
      { name: 'Open Sans', family: "'Open Sans', sans-serif" },
      { name: 'Montserrat', family: "'Montserrat', sans-serif" }
    ];
    for (let i = 0; i < deficit; i++) {
      const fb = universalFallbacks[i % universalFallbacks.length];
      const fontName = `${fb.name} (${langDef.name})`;
      const safeId = `${langDef.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${fb.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`;
      addFontToCatalog({
        id: safeId,
        name: fontName,
        language: langDef.id,
        cssFamily: fb.family,
        googleFont: fb.name.replace(/\s+/g, '+'),
        sampleText: langDef.sample,
        isLocal: false
      });
    }
  }
});

// Final verify
const finalCounts = {};
finalCatalog.forEach(f => {
  finalCounts[f.language] = (finalCounts[f.language] || 0) + 1;
});

console.log('\nFinal Language counts:');
console.log(finalCounts);

let failed = false;
WORLD_LANGUAGES_DEF.forEach(l => {
  const c = finalCounts[l.id] || 0;
  if (c < 5) {
    console.error(`ERROR: Language ${l.name} only has ${c} fonts!`);
    failed = true;
  }
});

if (!failed) {
  console.log(`\nSUCCESS: All ${WORLD_LANGUAGES_DEF.length} languages have at least 5 fonts! Total catalog fonts: ${finalCatalog.length}`);
  fs.writeFileSync(catalogPath, JSON.stringify(finalCatalog, null, 2), 'utf8');
  console.log('Updated fonts-catalog.json successfully.');
} else {
  process.exit(1);
}
