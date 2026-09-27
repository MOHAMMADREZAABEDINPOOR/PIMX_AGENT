const fs = require('fs');
const path = require('path');

// Read local fonts metadata
const localMetaPath = path.join(__dirname, '..', 'public', 'fonts', 'local-fonts-meta.json');
let localMeta = [];
if (fs.existsSync(localMetaPath)) {
  localMeta = JSON.parse(fs.readFileSync(localMetaPath, 'utf8'));
}

console.log('Read local fonts:', localMeta.length);

// Curated Google Fonts across all scripts and categories
const googleFontsData = [
  // Persian & Farsi Web
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

  // Arabic
  { id: 'cairo', name: 'Cairo', nativeName: 'كايرو', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Cairo', sans-serif", googleFont: 'Cairo', sampleText: 'الذكاء الاصطناعي وتوليد النصوص العربية' },
  { id: 'amiri', name: 'Amiri', nativeName: 'أميري', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Amiri', serif", googleFont: 'Amiri', sampleText: 'الخط العربي الأصيل المستوحى من خط النسخ' },
  { id: 'tajawal', name: 'Tajawal', nativeName: 'تجوال', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Tajawal', sans-serif", googleFont: 'Tajawal', sampleText: 'خط تجوال الحديث والعصري للمواقع' },
  { id: 'almarai', name: 'Almarai', nativeName: 'المراعي', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Almarai', sans-serif", googleFont: 'Almarai', sampleText: 'خط المراعي الأنيق بتنسيق متوازن' },
  { id: 'noto-naskh-arabic', name: 'Noto Naskh Arabic', nativeName: 'نوتو نسخ', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Noto Naskh Arabic', serif", googleFont: 'Noto+Naskh+Arabic', sampleText: 'خط نوتو نسخ العالمي للغة العربية' },
  { id: 'noto-sans-arabic', name: 'Noto Sans Arabic', nativeName: 'نوتو سانس', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Noto Sans Arabic', sans-serif", googleFont: 'Noto+Sans+Arabic', sampleText: 'نوتو سانس عربي لواجهات الاستخدام' },
  { id: 'changa', name: 'Changa', nativeName: 'تشانغا', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Changa', sans-serif", googleFont: 'Changa', sampleText: 'خط تشانغا الهندسي للعناوين المميزة' },
  { id: 'el-messiri', name: 'El Messiri', nativeName: 'المسيري', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'El Messiri', sans-serif", googleFont: 'El+Messiri', sampleText: 'خط المسيري المنحني للعناوين' },
  { id: 'alexandria', name: 'Alexandria', nativeName: 'الإسكندرية', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Alexandria', sans-serif", googleFont: 'Alexandria', sampleText: 'خط الإسكندرية المعاصر بنسب هندسية' },
  { id: 'readex-pro', name: 'Readex Pro', nativeName: 'ريدكس برو', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Readex Pro', sans-serif", googleFont: 'Readex+Pro', sampleText: 'ريدكس برو المصمم لقراءة الشاشات' },
  { id: 'lateef', name: 'Lateef', nativeName: 'لطيف', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Lateef', serif", googleFont: 'Lateef', sampleText: 'خط لطيف البديع والرشيق' },
  { id: 'scheherazade-new', name: 'Scheherazade New', nativeName: 'شهرزاد', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Scheherazade New', serif", googleFont: 'Scheherazade+New', sampleText: 'خط شهرزاد التقليدي للقراءات الكلاسيكية' },
  { id: 'reem-kufi', name: 'Reem Kufi', nativeName: 'ريم كوفي', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Reem Kufi', sans-serif", googleFont: 'Reem+Kufi', sampleText: 'ريم كوفي مستوحى من الخط الكوفي المبسط' },
  { id: 'aref-ruqaa', name: 'Aref Ruqaa', nativeName: 'عارف رقعة', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Aref Ruqaa', serif", googleFont: 'Aref+Ruqaa', sampleText: 'خط رقعة تاريخي وتعبيري' },
  { id: 'marhey', name: 'Marhey', nativeName: 'مرحي', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Marhey', cursive", googleFont: 'Marhey', sampleText: 'خط مرحي الودود للتصميم الإبداعي' },
  { id: 'katibeh', name: 'Katibeh', nativeName: 'كتيبة', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Katibeh', cursive", googleFont: 'Katibeh', sampleText: 'خط كتيبة المزخرف للأغلفة' },
  { id: 'mada', name: 'Mada', nativeName: 'مدى', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Mada', sans-serif", googleFont: 'Mada', sampleText: 'خط مدى الحديث المخصص للشاشات' },
  { id: 'harmattan', name: 'Harmattan', nativeName: 'هارماتان', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Harmattan', sans-serif", googleFont: 'Harmattan', sampleText: 'خط عربي مصمم لغرب ووسط أفريقيا' },
  { id: 'kufam', name: 'Kufam', nativeName: 'كوفام', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Kufam', sans-serif", googleFont: 'Kufam', sampleText: 'خط كوفام المعاصر للمجلات' },
  { id: 'rakkas', name: 'Rakkas', nativeName: 'رقاص', shelf: 'Persian & Arabic', language: 'Arabic', cssFamily: "'Rakkas', cursive", googleFont: 'Rakkas', sampleText: 'خط رقاص الجريء والمرح للعناوين' },

  // English & Modern Sans
  { id: 'inter', name: 'Inter', shelf: 'Latin', language: 'English', cssFamily: "'Inter', sans-serif", googleFont: 'Inter', sampleText: 'Ultra-refined UI typography designed for computer screens' },
  { id: 'roboto', name: 'Roboto', shelf: 'Latin', language: 'English', cssFamily: "'Roboto', sans-serif", googleFont: 'Roboto', sampleText: 'Google signature neo-grotesque geometric sans' },
  { id: 'open-sans', name: 'Open Sans', shelf: 'Latin', language: 'English', cssFamily: "'Open Sans', sans-serif", googleFont: 'Open+Sans', sampleText: 'Humanist sans-serif with open forms and friendly appearance' },
  { id: 'montserrat', name: 'Montserrat', shelf: 'Latin', language: 'English', cssFamily: "'Montserrat', sans-serif", googleFont: 'Montserrat', sampleText: 'Geometric sans inspired by traditional Buenos Aires posters' },
  { id: 'poppins', name: 'Poppins', shelf: 'Latin', language: 'English', cssFamily: "'Poppins', sans-serif", googleFont: 'Poppins', sampleText: 'Geometric sans-serif with perfect monoline circles' },
  { id: 'lato', name: 'Lato', shelf: 'Latin', language: 'English', cssFamily: "'Lato', sans-serif", googleFont: 'Lato', sampleText: 'Warm, corporate, and beautifully balanced proportions' },
  { id: 'outfit', name: 'Outfit', shelf: 'Latin', language: 'English', cssFamily: "'Outfit', sans-serif", googleFont: 'Outfit', sampleText: 'Stunning geometric display typeface for modern SaaS' },
  { id: 'plus-jakarta-sans', name: 'Plus Jakarta Sans', shelf: 'Latin', language: 'English', cssFamily: "'Plus Jakarta Sans', sans-serif", googleFont: 'Plus+Jakarta+Sans', sampleText: 'Clean contemporary sans for high-end tech interfaces' },
  { id: 'work-sans', name: 'Work Sans', shelf: 'Latin', language: 'English', cssFamily: "'Work Sans', sans-serif", googleFont: 'Work+Sans', sampleText: 'Optimized for on-screen text with early grotesques feel' },
  { id: 'dm-sans', name: 'DM Sans', shelf: 'Latin', language: 'English', cssFamily: "'DM Sans', sans-serif", googleFont: 'DM+Sans', sampleText: 'Low-contrast geometric sans-serif for product interfaces' },
  { id: 'manrope', name: 'Manrope', shelf: 'Latin', language: 'English', cssFamily: "'Manrope', sans-serif", googleFont: 'Manrope', sampleText: 'Modern open-source geometric crossover font' },
  { id: 'space-grotesk', name: 'Space Grotesk', shelf: 'Latin', language: 'English', cssFamily: "'Space Grotesk', sans-serif", googleFont: 'Space+Grotesk', sampleText: 'Proportional grotesque variant based on Space Mono' },
  { id: 'syne', name: 'Syne', shelf: 'Latin', language: 'English', cssFamily: "'Syne', sans-serif", googleFont: 'Syne', sampleText: 'Exploratory contemporary typeface family for avant-garde design' },
  { id: 'urbanist', name: 'Urbanist', shelf: 'Latin', language: 'English', cssFamily: "'Urbanist', sans-serif", googleFont: 'Urbanist', sampleText: 'Low-contrast, neo-grotesque geometric sans-serif' },
  { id: 'epilogue', name: 'Epilogue', shelf: 'Latin', language: 'English', cssFamily: "'Epilogue', sans-serif", googleFont: 'Epilogue', sampleText: 'Variable sans serif font with bold brutalist weight range' },
  { id: 'sora', name: 'Sora', shelf: 'Latin', language: 'English', cssFamily: "'Sora', sans-serif", googleFont: 'Sora', sampleText: 'Tailored for user interfaces on high-res mobile devices' },
  { id: 'figtree', name: 'Figtree', shelf: 'Latin', language: 'English', cssFamily: "'Figtree', sans-serif", googleFont: 'Figtree', sampleText: 'Clean and friendly geometric sans-serif for modern web' },
  { id: 'rubik', name: 'Rubik', shelf: 'Latin', language: 'English', cssFamily: "'Rubik', sans-serif", googleFont: 'Rubik', sampleText: 'Soft rounded corners with geometric proportions' },
  { id: 'nunito', name: 'Nunito', shelf: 'Latin', language: 'English', cssFamily: "'Nunito', sans-serif", googleFont: 'Nunito', sampleText: 'Well-balanced rounded terminal sans-serif family' },
  { id: 'lexend', name: 'Lexend', shelf: 'Latin', language: 'English', cssFamily: "'Lexend', sans-serif", googleFont: 'Lexend', sampleText: 'Engineered specifically to improve reading speed and fluency' },
  { id: 'raleway', name: 'Raleway', shelf: 'Latin', language: 'English', cssFamily: "'Raleway', sans-serif", googleFont: 'Raleway', sampleText: 'Elegant sans-serif intended for headings and large scale' },
  { id: 'quicksand', name: 'Quicksand', shelf: 'Latin', language: 'English', cssFamily: "'Quicksand', sans-serif", googleFont: 'Quicksand', sampleText: 'Display sans-serif with rounded terminals' },
  { id: 'jost', name: 'Jost', shelf: 'Latin', language: 'English', cssFamily: "'Jost', sans-serif", googleFont: 'Jost', sampleText: 'Futura-inspired functional geometric sans' },
  { id: 'albert-sans', name: 'Albert Sans', shelf: 'Latin', language: 'English', cssFamily: "'Albert Sans', sans-serif", googleFont: 'Albert+Sans', sampleText: 'Modern geometric sans with distinctive Scandinavian clarity' },
  { id: 'red-hat-display', name: 'Red Hat Display', shelf: 'Latin', language: 'English', cssFamily: "'Red Hat Display', sans-serif", googleFont: 'Red+Hat+Display', sampleText: 'Open source enterprise brand typeface designed for tech' },
  { id: 'archivo', name: 'Archivo', shelf: 'Latin', language: 'English', cssFamily: "'Archivo', sans-serif", googleFont: 'Archivo', sampleText: 'Engineered for print and digital with nineteenth-century roots' },
  { id: 'barlow', name: 'Barlow', shelf: 'Latin', language: 'English', cssFamily: "'Barlow', sans-serif", googleFont: 'Barlow', sampleText: 'Slightly rounded low-contrast grotesk of California buses' },
  { id: 'cabin', name: 'Cabin', shelf: 'Latin', language: 'English', cssFamily: "'Cabin', sans-serif", googleFont: 'Cabin', sampleText: 'Humanist sans with 4 optical sizes inspired by Gill Sans' },
  { id: 'ubuntu', name: 'Ubuntu', shelf: 'Latin', language: 'English', cssFamily: "'Ubuntu', sans-serif", googleFont: 'Ubuntu', sampleText: 'Canonical open sans-serif with quirky curves' },
  { id: 'exo-2', name: 'Exo 2', shelf: 'Latin', language: 'English', cssFamily: "'Exo 2', sans-serif", googleFont: 'Exo+2', sampleText: 'Futuristic geometric tech font for cyber and AI aesthetics' },
  { id: 'overpass', name: 'Overpass', shelf: 'Latin', language: 'English', cssFamily: "'Overpass', sans-serif", googleFont: 'Overpass', sampleText: 'Inspired by Highway Gothic road signs across the USA' },
  { id: 'maven-pro', name: 'Maven Pro', shelf: 'Latin', language: 'English', cssFamily: "'Maven Pro', sans-serif", googleFont: 'Maven+Pro', sampleText: 'Curved and fluid sans-serif with modern flowing forms' },
  { id: 'asap', name: 'Asap', shelf: 'Latin', language: 'English', cssFamily: "'Asap', sans-serif", googleFont: 'Asap', sampleText: 'Contemporary sans with uniform character widths across styles' },
  { id: 'chivo', name: 'Chivo', shelf: 'Latin', language: 'English', cssFamily: "'Chivo', sans-serif", googleFont: 'Chivo', sampleText: 'Grotesque typeface ideal for powerful headlines' },
  { id: 'mulish', name: 'Mulish', shelf: 'Latin', language: 'English', cssFamily: "'Mulish', sans-serif", googleFont: 'Mulish', sampleText: 'Minimalist sans-serif designed for editorial display' },
  { id: 'questrial', name: 'Questrial', shelf: 'Latin', language: 'English', cssFamily: "'Questrial', sans-serif", googleFont: 'Questrial', sampleText: 'Circle-based geometry with modern Swiss influence' },
  { id: 'be-vietnam-pro', name: 'Be Vietnam Pro', shelf: 'Latin', language: 'English', cssFamily: "'Be Vietnam Pro', sans-serif", googleFont: 'Be+Vietnam+Pro', sampleText: 'Optimized for high readability in UI and dense data' },
  { id: 'hanken-grotesk', name: 'Hanken Grotesk', shelf: 'Latin', language: 'English', cssFamily: "'Hanken Grotesk', sans-serif", googleFont: 'Hanken+Grotesk', sampleText: 'Clean geometric sans designed for modern editorial design' },
  { id: 'karla', name: 'Karla', shelf: 'Latin', language: 'English', cssFamily: "'Karla', sans-serif", googleFont: 'Karla', sampleText: 'Grotesque sans-serif with charming quirky details' },
  { id: 'heebo-latin', name: 'Heebo Sans', shelf: 'Latin', language: 'English', cssFamily: "'Heebo', sans-serif", googleFont: 'Heebo', sampleText: 'Crisp Hebrew and Latin dual-script typeface' },

  // Coding & Monospace
  { id: 'jetbrains-mono', name: 'JetBrains Mono', shelf: 'Mono', language: 'Coding', cssFamily: "'JetBrains Mono', monospace", googleFont: 'JetBrains+Mono', sampleText: 'const ai = new Agent({ stream: true, latency: 45 });' },
  { id: 'fira-code', name: 'Fira Code', shelf: 'Mono', language: 'Coding', cssFamily: "'Fira Code', monospace", googleFont: 'Fira+Code', sampleText: 'function run() => { if (a >= 10 && b != 0) return true; }' },
  { id: 'source-code-pro', name: 'Source Code Pro', shelf: 'Mono', language: 'Coding', cssFamily: "'Source Code Pro', monospace", googleFont: 'Source+Code+Pro', sampleText: 'export type ModelSpec = { id: string; provider: string; };' },
  { id: 'ibm-plex-mono', name: 'IBM Plex Mono', shelf: 'Mono', language: 'Coding', cssFamily: "'IBM Plex Mono', monospace", googleFont: 'IBM+Plex+Mono', sampleText: 'import { createClient } from "@cloudflare/workers-sdk";' },
  { id: 'roboto-mono', name: 'Roboto Mono', shelf: 'Mono', language: 'Coding', cssFamily: "'Roboto Mono', monospace", googleFont: 'Roboto+Mono', sampleText: 'SELECT id, model, prompt_tokens, spend FROM usage_logs;' },
  { id: 'space-mono', name: 'Space Mono', shelf: 'Mono', language: 'Coding', cssFamily: "'Space Mono', monospace", googleFont: 'Space+Mono', sampleText: 'git commit -m "feat(ai): add deep reasoning engine"' },
  { id: 'inconsolata', name: 'Inconsolata', shelf: 'Mono', language: 'Coding', cssFamily: "'Inconsolata', monospace", googleFont: 'Inconsolata', sampleText: 'curl -X POST https://api.pimx.io/v1/chat/completions' },
  { id: 'dm-mono', name: 'DM Mono', shelf: 'Mono', language: 'Coding', cssFamily: "'DM Mono', monospace", googleFont: 'DM+Mono', sampleText: 'docker run -d -p 3000:3000 --name pimx-agent pimx/app:latest' },
  { id: 'anonymous-pro', name: 'Anonymous Pro', shelf: 'Mono', language: 'Coding', cssFamily: "'Anonymous Pro', monospace", googleFont: 'Anonymous+Pro', sampleText: 'const token = crypto.randomBytes(32).toString("hex");' },
  { id: 'courier-prime', name: 'Courier Prime', shelf: 'Mono', language: 'Coding', cssFamily: "'Courier Prime', monospace", googleFont: 'Courier+Prime', sampleText: 'INT. CONTROL ROOM - NIGHT - Terminal blinking with incoming data.' },
  { id: 'overpass-mono', name: 'Overpass Mono', shelf: 'Mono', language: 'Coding', cssFamily: "'Overpass Mono', monospace", googleFont: 'Overpass+Mono', sampleText: 'PING 127.0.0.1 (127.0.0.1): 56 data bytes, 64 bytes icmp_seq=0' },
  { id: 'share-tech-mono', name: 'Share Tech Mono', shelf: 'Mono', language: 'Coding', cssFamily: "'Share Tech Mono', monospace", googleFont: 'Share+Tech+Mono', sampleText: 'SYS.STATUS: ONLINE | LOAD: 12% | AGENTS: 4 ACTIVE' },
  { id: 'vt323', name: 'VT323 Retro Terminal', shelf: 'Mono', language: 'Coding', cssFamily: "'VT323', monospace", googleFont: 'VT323', sampleText: 'READY. 10 PRINT "PIMX AGENT AI" 20 GOTO 10 RUN' },
  { id: 'cutive-mono', name: 'Cutive Mono', shelf: 'Mono', language: 'Coding', cssFamily: "'Cutive Mono', monospace", googleFont: 'Cutive+Mono', sampleText: 'Classic typewriter monospace glyphs for documentation' },
  { id: 'red-hat-mono', name: 'Red Hat Mono', shelf: 'Mono', language: 'Coding', cssFamily: "'Red Hat Mono', monospace", googleFont: 'Red+Hat+Mono', sampleText: 'Designed for code editors, terminal output, and technical data' },
  { id: 'b612-mono', name: 'B612 Mono (Aviation)', shelf: 'Mono', language: 'Coding', cssFamily: "'B612 Mono', monospace", googleFont: 'B612+Mono', sampleText: 'ALT: 32000 FT | SPD: 480 KTS | HDG: 270 | FLIGHT OK' },
  { id: 'major-mono-display', name: 'Major Mono Display', shelf: 'Mono', language: 'Coding', cssFamily: "'Major Mono Display', monospace", googleFont: 'Major+Mono+Display', sampleText: 'EXPERIMENTAL GEOMETRIC MONOSPACED TYPOGRAPHY' },
  { id: 'nova-mono', name: 'Nova Mono', shelf: 'Mono', language: 'Coding', cssFamily: "'Nova Mono', monospace", googleFont: 'Nova+Mono', sampleText: 'Futuristic stylized monospaced typeface for sci-fi UI' },
  { id: 'ubuntu-mono', name: 'Ubuntu Mono', shelf: 'Mono', language: 'Coding', cssFamily: "'Ubuntu Mono', monospace", googleFont: 'Ubuntu+Mono', sampleText: 'Canonical Linux terminal monospace font with curved warmth' },
  { id: 'firamono', name: 'Fira Mono', shelf: 'Mono', language: 'Coding', cssFamily: "'Fira Mono', monospace", googleFont: 'Fira+Mono', sampleText: 'Mozilla open source monospace engine font' },

  // Editorial & Serif Classics
  { id: 'playfair-display', name: 'Playfair Display', shelf: 'Serif', language: 'Serif', cssFamily: "'Playfair Display', serif", googleFont: 'Playfair+Display', sampleText: 'High editorial elegance inspired by Enlightenment type' },
  { id: 'merriweather', name: 'Merriweather', shelf: 'Serif', language: 'Serif', cssFamily: "'Merriweather', serif", googleFont: 'Merriweather', sampleText: 'Engineered to be pleasant to read on computer screens' },
  { id: 'lora', name: 'Lora', shelf: 'Serif', language: 'Serif', cssFamily: "'Lora', serif", googleFont: 'Lora', sampleText: 'Contemporary serif with calligraphic curves and great rhythm' },
  { id: 'cormorant-garamond', name: 'Cormorant Garamond', shelf: 'Serif', language: 'Serif', cssFamily: "'Cormorant Garamond', serif", googleFont: 'Cormorant+Garamond', sampleText: 'Traditional Garamond revival with sharp contrast and grandeur' },
  { id: 'cinzel', name: 'Cinzel', shelf: 'Serif', language: 'Serif', cssFamily: "'Cinzel', serif", googleFont: 'Cinzel', sampleText: 'Inspired by first century Roman inscriptions with classical proportions' },
  { id: 'bodoni-moda', name: 'Bodoni Moda', shelf: 'Serif', language: 'Serif', cssFamily: "'Bodoni Moda', serif", googleFont: 'Bodoni+Moda', sampleText: 'Didone luxury couture typography for modern high fashion' },
  { id: 'spectral', name: 'Spectral', shelf: 'Serif', language: 'Serif', cssFamily: "'Spectral', serif", googleFont: 'Spectral', sampleText: 'Commissioned by Google for reading-intensive screen environments' },
  { id: 'newsreader', name: 'Newsreader', shelf: 'Serif', language: 'Serif', cssFamily: "'Newsreader', serif", googleFont: 'Newsreader', sampleText: 'Designed by Production Type for continuous long-form editorial' },
  { id: 'fraunces', name: 'Fraunces', shelf: 'Serif', language: 'Serif', cssFamily: "'Fraunces', serif", googleFont: 'Fraunces', sampleText: 'Retro wonky, soft variable serif with charismatic flair' },
  { id: 'bitter', name: 'Bitter', shelf: 'Serif', language: 'Serif', cssFamily: "'Bitter', serif", googleFont: 'Bitter', sampleText: 'Slab serif designed for comfortable reading across electronic book displays' },
  { id: 'alegreya', name: 'Alegreya', shelf: 'Serif', language: 'Serif', cssFamily: "'Alegreya', serif", googleFont: 'Alegreya', sampleText: 'Dynamic, varied rhythm praised among the 53 Fonts of the Decade' },
  { id: 'eb-garamond', name: 'EB Garamond', shelf: 'Serif', language: 'Serif', cssFamily: "'EB Garamond', serif", googleFont: 'EB+Garamond', sampleText: 'Definitive open revival of Claude Garamont legendary 1592 specimen' },
  { id: 'prata', name: 'Prata', shelf: 'Serif', language: 'Serif', cssFamily: "'Prata', serif", googleFont: 'Prata', sampleText: 'Didone typeface with teardrop terminals and soft elegant shapes' },
  { id: 'marcellus', name: 'Marcellus', shelf: 'Serif', language: 'Serif', cssFamily: "'Marcellus', serif", googleFont: 'Marcellus', sampleText: 'Flared serif based on historic Roman inscription proportions' },
  { id: 'castoro', name: 'Castoro', shelf: 'Serif', language: 'Serif', cssFamily: "'Castoro', serif", googleFont: 'Castoro', sampleText: 'Academic scholarly serif typeface for intellectual reading' },
  { id: 'libre-baskerville', name: 'Libre Baskerville', shelf: 'Serif', language: 'Serif', cssFamily: "'Libre Baskerville', serif", googleFont: 'Libre+Baskerville', sampleText: 'Web font optimized for body text inspired by 1757 Baskerville' },
  { id: 'pt-serif', name: 'PT Serif', shelf: 'Serif', language: 'Serif', cssFamily: "'PT Serif', serif", googleFont: 'PT+Serif', sampleText: 'Universal serif design with pan-European linguistic scope' },
  { id: 'crimson-text', name: 'Crimson Text', shelf: 'Serif', language: 'Serif', cssFamily: "'Crimson Text', serif", googleFont: 'Crimson+Text', sampleText: 'Book production typeface inspired by beautiful old-style fonts' },
  { id: 'vollkorn', name: 'Vollkorn', shelf: 'Serif', language: 'Serif', cssFamily: "'Vollkorn', serif", googleFont: 'Vollkorn', sampleText: 'Quiet, modest and robust serif for continuous everyday text' },
  { id: 'domine', name: 'Domine', shelf: 'Serif', language: 'Serif', cssFamily: "'Domine', serif", googleFont: 'Domine', sampleText: 'Designed for online news magazines and editorial layout' },
  { id: 'frank-ruhl-libre', name: 'Frank Ruhl Libre', shelf: 'Serif', language: 'Serif', cssFamily: "'Frank Ruhl Libre', serif", googleFont: 'Frank+Ruhl+Libre', sampleText: 'Revival of the classic Hebrew and Latin book printing standard' },
  { id: 'cardo', name: 'Cardo', shelf: 'Serif', language: 'Serif', cssFamily: "'Cardo', serif", googleFont: 'Cardo', sampleText: 'Classical scholars font for humanists and linguists' },
  { id: 'faustina', name: 'Faustina', shelf: 'Serif', language: 'Serif', cssFamily: "'Faustina', serif", googleFont: 'Faustina', sampleText: 'Contemporary variable serif crafted for long texts' },
  { id: 'besley', name: 'Besley', shelf: 'Serif', language: 'Serif', cssFamily: "'Besley', serif", googleFont: 'Besley', sampleText: 'Sturdy slab serif based on early nineteenth-century Clarendon' },
  { id: 'dm-serif-display', name: 'DM Serif Display', shelf: 'Serif', language: 'Serif', cssFamily: "'DM Serif Display', serif", googleFont: 'DM+Serif+Display', sampleText: 'High-contrast transitional serif with dramatic punch' },
  { id: 'arvo', name: 'Arvo', shelf: 'Serif', language: 'Serif', cssFamily: "'Arvo', serif", googleFont: 'Arvo', sampleText: 'Geometric slab-serif suited for screen and print' },
  { id: 'rokkitt', name: 'Rokkitt', shelf: 'Serif', language: 'Serif', cssFamily: "'Rokkitt', serif", googleFont: 'Rokkitt', sampleText: 'Display slab font intended as headline companion to grotesque sans' },
  { id: 'zilla-slab', name: 'Zilla Slab', shelf: 'Serif', language: 'Serif', cssFamily: "'Zilla Slab', serif", googleFont: 'Zilla+Slab', sampleText: 'Mozilla official brand font with industrial slab aesthetic' },

  // Display, Brutalist, Retro & Bold
  { id: 'bungee', name: 'Bungee', shelf: 'Display', language: 'Display', cssFamily: "'Bungee', sans-serif", googleFont: 'Bungee', sampleText: 'CELEBRATING URBAN SIGNAGE AND CASSETTE RETRO VIBES' },
  { id: 'anton', name: 'Anton', shelf: 'Display', language: 'Display', cssFamily: "'Anton', sans-serif", googleFont: 'Anton', sampleText: 'RE-MASTERED POWERFUL SANS FOR GIANT TITLES' },
  { id: 'bebas-neue', name: 'Bebas Neue', shelf: 'Display', language: 'Display', cssFamily: "'Bebas Neue', sans-serif", googleFont: 'Bebas+Neue', sampleText: 'THE PROTÉGÉ OF ALL-CAPS DISPLAY TYPOGRAPHY' },
  { id: 'righteous', name: 'Righteous', shelf: 'Display', language: 'Display', cssFamily: "'Righteous', cursive", googleFont: 'Righteous', sampleText: 'Grid-based deco typography inspired by 1930s posters' },
  { id: 'shrikhand', name: 'Shrikhand', shelf: 'Display', language: 'Display', cssFamily: "'Shrikhand', cursive", googleFont: 'Shrikhand', sampleText: 'Curvaceous and expressive retro advertising letterforms' },
  { id: 'orbitron', name: 'Orbitron', shelf: 'Display', language: 'Display', cssFamily: "'Orbitron', sans-serif", googleFont: 'Orbitron', sampleText: 'SCI-FI GEOMETRIC DISPLAY FOR SPACECRAFT AND CYBERNETICS' },
  { id: 'russo-one', name: 'Russo One', shelf: 'Display', language: 'Display', cssFamily: "'Russo One', sans-serif", googleFont: 'Russo+One', sampleText: 'BLOCKY SOLID RETRO-FUTURISTIC SOVIET AESTHETICS' },
  { id: 'archivo-black', name: 'Archivo Black', shelf: 'Display', language: 'Display', cssFamily: "'Archivo Black', sans-serif", googleFont: 'Archivo+Black', sampleText: 'EXTRA-BOLD INDUSTRIAL CHOPPING IMPACT' },
  { id: 'bangers', name: 'Bangers', shelf: 'Display', language: 'Display', cssFamily: "'Bangers', cursive", googleFont: 'Bangers', sampleText: 'COMIC BOOK RETRO HERO ACTION POW!' },
  { id: 'creepster', name: 'Creepster', shelf: 'Display', language: 'Display', cssFamily: "'Creepster', cursive", googleFont: 'Creepster', sampleText: 'Spooky dripping ghoul Halloween monster horror' },
  { id: 'monoton', name: 'Monoton', shelf: 'Display', language: 'Display', cssFamily: "'Monoton', cursive", googleFont: 'Monoton', sampleText: 'DISCO MULTI-LINE RETRO 1980s NEON TUBE DESIGN' },
  { id: 'press-start-2p', name: 'Press Start 2P', shelf: 'Display', language: 'Display', cssFamily: "'Press Start 2P', cursive", googleFont: 'Press+Start+2P', sampleText: '8-BIT RETRO ARCADE NINTENDO NOSTALGIA' },
  { id: 'silkscreen', name: 'Silkscreen', shelf: 'Display', language: 'Display', cssFamily: "'Silkscreen', cursive", googleFont: 'Silkscreen', sampleText: 'PIXEL PERFECT GAME UI AT NATIVE SCALE' },
  { id: 'black-ops-one', name: 'Black Ops One', shelf: 'Display', language: 'Display', cssFamily: "'Black Ops One', cursive", googleFont: 'Black+Ops+One', sampleText: 'MILITARY STENCIL HEAVY DUTY ARMOR' },
  { id: 'sigmar', name: 'Sigmar', shelf: 'Display', language: 'Display', cssFamily: "'Sigmar', cursive", googleFont: 'Sigmar', sampleText: 'THICK ULTRA-PLAYFUL JUMPING CARTOON' },
  { id: 'audiowide', name: 'Audiowide', shelf: 'Display', language: 'Display', cssFamily: "'Audiowide', cursive", googleFont: 'Audiowide', sampleText: 'SYNTHWAVE CYBERPUNK 1980s ELECTRONICA' },
  { id: 'alfa-slab-one', name: 'Alfa Slab One', shelf: 'Display', language: 'Display', cssFamily: "'Alfa Slab One', cursive", googleFont: 'Alfa+Slab+One', sampleText: 'MAXIMUM SLAB IMPACT AND WEIGHT' },
  { id: 'squada-one', name: 'Squada One', shelf: 'Display', language: 'Display', cssFamily: "'Squada One', cursive", googleFont: 'Squada+One', sampleText: 'COMPACT GEOMETRIC ATHLETIC POSTER' },
  { id: 'titan-one', name: 'Titan One', shelf: 'Display', language: 'Display', cssFamily: "'Titan One', cursive", googleFont: 'Titan+One', sampleText: 'SUPER FAT ROUNDED DISPLAY FOR GAMES' },

  // Handwritten & Script
  { id: 'pacifico', name: 'Pacifico', shelf: 'Handwriting', language: 'Handwriting', cssFamily: "'Pacifico', cursive", googleFont: 'Pacifico', sampleText: 'Fun American 1950s surf culture brush script' },
  { id: 'great-vibes', name: 'Great Vibes', shelf: 'Handwriting', language: 'Handwriting', cssFamily: "'Great Vibes', cursive", googleFont: 'Great+Vibes', sampleText: 'Flowing cursive script with looping ascenders' },
  { id: 'dancing-script', name: 'Dancing Script', shelf: 'Handwriting', language: 'Handwriting', cssFamily: "'Dancing Script', cursive", googleFont: 'Dancing+Script', sampleText: 'Lively casual script where letters dance on baseline' },
  { id: 'caveat', name: 'Caveat', shelf: 'Handwriting', language: 'Handwriting', cssFamily: "'Caveat', cursive", googleFont: 'Caveat', sampleText: 'Natural handwritten handwriting for warm personal notes' },
  { id: 'permanent-marker', name: 'Permanent Marker', shelf: 'Handwriting', language: 'Handwriting', cssFamily: "'Permanent Marker', cursive", googleFont: 'Permanent+Marker', sampleText: 'Drawn with a thick real felt-tip pen' },
  { id: 'satisfy', name: 'Satisfy', shelf: 'Handwriting', language: 'Handwriting', cssFamily: "'Satisfy', cursive", googleFont: 'Satisfy', sampleText: 'Brush script with an organic hand-made feel' },
  { id: 'sacramento', name: 'Sacramento', shelf: 'Handwriting', language: 'Handwriting', cssFamily: "'Sacramento', cursive", googleFont: 'Sacramento', sampleText: 'Delicate connected monoline script from 1950s brochures' },
  { id: 'cookie', name: 'Cookie', shelf: 'Handwriting', language: 'Handwriting', cssFamily: "'Cookie', cursive", googleFont: 'Cookie', sampleText: 'Tasty retro cursive brush font reminiscent of pin-up ads' },
  { id: 'yellowtail', name: 'Yellowtail', shelf: 'Handwriting', language: 'Handwriting', cssFamily: "'Yellowtail', cursive", googleFont: 'Yellowtail', sampleText: 'Flat brush script with old school sign painter style' },
  { id: 'kaushan-script', name: 'Kaushan Script', shelf: 'Handwriting', language: 'Handwriting', cssFamily: "'Kaushan Script', cursive", googleFont: 'Kaushan+Script', sampleText: 'Fast brush lettering that feels natural and unpretentious' },
  { id: 'allura', name: 'Allura', shelf: 'Handwriting', language: 'Handwriting', cssFamily: "'Allura', cursive", googleFont: 'Allura', sampleText: 'Stylized formal calligraphy for luxury invitations' },
  { id: 'alex-brush', name: 'Alex Brush', shelf: 'Handwriting', language: 'Handwriting', cssFamily: "'Alex Brush', cursive", googleFont: 'Alex+Brush', sampleText: 'Fluid calligraphic brush script with dramatic flourishes' },
  { id: 'shadows-into-light', name: 'Shadows Into Light', shelf: 'Handwriting', language: 'Handwriting', cssFamily: "'Shadows Into Light', cursive", googleFont: 'Shadows+Into+Light', sampleText: 'Neat personal handwriting font with quirky curves' },
  { id: 'indie-flower', name: 'Indie Flower', shelf: 'Handwriting', language: 'Handwriting', cssFamily: "'Indie Flower', cursive", googleFont: 'Indie+Flower', sampleText: 'Carefree, bubbly handwriting with open rounded bubbles' },
  { id: 'bad-script', name: 'Bad Script', shelf: 'Handwriting', language: 'Handwriting', cssFamily: "'Bad Script', cursive", googleFont: 'Bad+Script', sampleText: 'Handwritten with a fountain pen by Roman Shchyukin' },

  // Japanese & CJK
  { id: 'noto-sans-jp', name: 'Noto Sans JP', nativeName: 'ノト・サンズ', shelf: 'Asian & World', language: 'Japanese & CJK', cssFamily: "'Noto Sans JP', sans-serif", googleFont: 'Noto+Sans+JP', sampleText: '人工知能モデルと最新テクノロジーの融合' },
  { id: 'zen-kaku-gothic', name: 'Zen Kaku Gothic New', nativeName: 'Zen 角ゴシック', shelf: 'Asian & World', language: 'Japanese & CJK', cssFamily: "'Zen Kaku Gothic New', sans-serif", googleFont: 'Zen+Kaku+Gothic+New', sampleText: 'モダンで洗練された日本語タイポグラフィ' },
  { id: 'shippori-mincho', name: 'Shippori Mincho', nativeName: 'しっぽり明朝', shelf: 'Asian & World', language: 'Japanese & CJK', cssFamily: "'Shippori Mincho', serif", googleFont: 'Shippori+Mincho', sampleText: '美しく情緒あふれる本格的な明朝体' },
  { id: 'm-plus-1p', name: 'M PLUS 1p', nativeName: 'エムプラス', shelf: 'Asian & World', language: 'Japanese & CJK', cssFamily: "'M PLUS 1p', sans-serif", googleFont: 'M+PLUS+1p', sampleText: '丸みがあり視認性の高い万能デザイン' },
  { id: 'kosugi-maru', name: 'Kosugi Maru', nativeName: '小杉丸ゴシック', shelf: 'Asian & World', language: 'Japanese & CJK', cssFamily: "'Kosugi Maru', sans-serif", googleFont: 'Kosugi+Maru', sampleText: '優しく親しみやすい丸ゴシック体' },
  { id: 'yuji-boku', name: 'Yuji Boku', nativeName: '游字 墨', shelf: 'Asian & World', language: 'Japanese & CJK', cssFamily: "'Yuji Boku', serif", googleFont: 'Yuji+Boku', sampleText: '墨の濃淡と手書きの筆致を再現' },
  { id: 'hachi-maru-pop', name: 'Hachi Maru Pop', nativeName: '八〇ポップ', shelf: 'Asian & World', language: 'Japanese & CJK', cssFamily: "'Hachi Maru Pop', cursive", googleFont: 'Hachi+Maru+Pop', sampleText: '80年代日本のレトロカワイイポップ体' },
  { id: 'kiwi-maru', name: 'Kiwi Maru', nativeName: 'キウイ丸', shelf: 'Asian & World', language: 'Japanese & CJK', cssFamily: "'Kiwi Maru', serif", googleFont: 'Kiwi+Maru', sampleText: 'ユニークで愛らしい明朝系デザイン' },

  // Hebrew
  { id: 'heebo', name: 'Heebo', nativeName: 'היבו', shelf: 'Asian & World', language: 'Hebrew', cssFamily: "'Heebo', sans-serif", googleFont: 'Heebo', sampleText: 'בינה מלאכותית מתקדמת וממשק משתמש אלגנטי' },
  { id: 'assistant', name: 'Assistant', nativeName: 'אסיסטנט', shelf: 'Asian & World', language: 'Hebrew', cssFamily: "'Assistant', sans-serif", googleFont: 'Assistant', sampleText: 'טיפוגרפיה עברית נקייה ומודרנית לקריאה' },
  { id: 'rubik-hebrew', name: 'Rubik Hebrew', nativeName: 'רוביק', shelf: 'Asian & World', language: 'Hebrew', cssFamily: "'Rubik', sans-serif", googleFont: 'Rubik', sampleText: 'פינות מעוגלות ועיצוב גיאומטרי מדויק' },
  { id: 'varela-round-hebrew', name: 'Varela Round', nativeName: 'ורלה ראונד', shelf: 'Asian & World', language: 'Hebrew', cssFamily: "'Varela Round', sans-serif", googleFont: 'Varela+Round', sampleText: 'אותיות רכות ונעימות לעין' },
  { id: 'secular-one', name: 'Secular One', nativeName: 'סקולר וואן', shelf: 'Asian & World', language: 'Hebrew', cssFamily: "'Secular One', sans-serif", googleFont: 'Secular+One', sampleText: 'כותרות עבות ומרשימות בעברית' },

  // Devanagari & Hindi
  { id: 'poppins-devanagari', name: 'Poppins Devanagari', nativeName: 'पॉपिन्स', shelf: 'Asian & World', language: 'Devanagari', cssFamily: "'Poppins', sans-serif", googleFont: 'Poppins', sampleText: 'कृत्रिम बुद्धिमत्ता और बहुभाषी तकनीक' },
  { id: 'hind', name: 'Hind', nativeName: 'हिन्द', shelf: 'Asian & World', language: 'Devanagari', cssFamily: "'Hind', sans-serif", googleFont: 'Hind', sampleText: 'भारतीय भाषाओं के लिए उत्कृष्ट डिज़ाइन' },
  { id: 'rajdhani', name: 'Rajdhani', nativeName: 'राजधानी', shelf: 'Asian & World', language: 'Devanagari', cssFamily: "'Rajdhani', sans-serif", googleFont: 'Rajdhani', sampleText: 'मॉड्यूलर और भविष्यवादी तकनीकी फॉन्ट' },
  { id: 'kalam', name: 'Kalam', nativeName: 'कलम', shelf: 'Asian & World', language: 'Devanagari', cssFamily: "'Kalam', cursive", googleFont: 'Kalam', sampleText: 'हस्तलिखित कलम से लिखा गया सुंदर रूप' },
  { id: 'rozha-one', name: 'Rozha One', nativeName: 'रोज़ा', shelf: 'Asian & World', language: 'Devanagari', cssFamily: "'Rozha One', serif", googleFont: 'Rozha+One', sampleText: 'शानदार हेडलाइन और पोस्टर टाइपोग्राफी' },
  { id: 'teko', name: 'Teko', nativeName: 'टेको', shelf: 'Asian & World', language: 'Devanagari', cssFamily: "'Teko', sans-serif", googleFont: 'Teko', sampleText: 'लंबी और बोल्ड आकृतियों वाला डिस्प्ले फॉन्ट' },

  // Thai
  { id: 'prompt', name: 'Prompt', nativeName: 'พร้อมท์', shelf: 'Asian & World', language: 'Thai', cssFamily: "'Prompt', sans-serif", googleFont: 'Prompt', sampleText: 'ปัญญาประดิษฐ์และระบบการทำงานอัจฉริยะ' },
  { id: 'kanit', name: 'Kanit', nativeName: 'คณิต', shelf: 'Asian & World', language: 'Thai', cssFamily: "'Kanit', sans-serif", googleFont: 'Kanit', sampleText: 'ฟอนต์ไร้หัวสไตล์โมเดิร์นที่นิยมสูงสุด' },
  { id: 'sarabun', name: 'Sarabun', nativeName: 'สารบรรณ', shelf: 'Asian & World', language: 'Thai', cssFamily: "'Sarabun', sans-serif", googleFont: 'Sarabun', sampleText: 'ฟอนต์มาตรฐานราชการและการอ่านอย่างเป็นทางการ' },
  { id: 'mitr', name: 'Mitr', nativeName: 'มิตร', shelf: 'Asian & World', language: 'Thai', cssFamily: "'Mitr', sans-serif", googleFont: 'Mitr', sampleText: 'มิตรไมตรี ดีไซน์ร่วมสมัยสำหรับเว็บไซต์' },
  { id: 'chakra-petch', name: 'Chakra Petch', nativeName: 'จักรเพชร', shelf: 'Asian & World', language: 'Thai', cssFamily: "'Chakra Petch', sans-serif", googleFont: 'Chakra+Petch', sampleText: 'สไตล์ไซเบอร์และเทคโนโลยีแห่งอนาคต' },
  { id: 'pattaya', name: 'Pattaya', nativeName: 'พัทยา', shelf: 'Asian & World', language: 'Thai', cssFamily: "'Pattaya', cursive", googleFont: 'Pattaya', sampleText: 'ตัวเขียนพริ้วไหวสำหรับโปสเตอร์และการท่องเที่ยว' },

  // Cyrillic
  { id: 'oswald-cyrillic', name: 'Oswald', nativeName: 'Освальд', shelf: 'Latin', language: 'Cyrillic', cssFamily: "'Oswald', sans-serif", googleFont: 'Oswald', sampleText: 'Искусственный интеллект и машинное обучение' },
  { id: 'montserrat-cyrillic', name: 'Montserrat Cyrillic', nativeName: 'Монтсеррат', shelf: 'Latin', language: 'Cyrillic', cssFamily: "'Montserrat', sans-serif", googleFont: 'Montserrat', sampleText: 'Геометрический гротеск высокой четкости' },
  { id: 'jura', name: 'Jura', nativeName: 'Юра', shelf: 'Latin', language: 'Cyrillic', cssFamily: "'Jura', sans-serif", googleFont: 'Jura', sampleText: 'Элегантный моноширинный технологический стиль' },
  { id: 'kelly-slab', name: 'Kelly Slab', nativeName: 'Келли Слаб', shelf: 'Serif', language: 'Cyrillic', cssFamily: "'Kelly Slab', cursive", googleFont: 'Kelly+Slab', sampleText: 'Квадратный слаб-сериф с сильным характером' },
  { id: 'ruslan-display', name: 'Ruslan Display', nativeName: 'Руслан', shelf: 'Display', language: 'Cyrillic', cssFamily: "'Ruslan Display', cursive", googleFont: 'Ruslan+Display', sampleText: 'Древнерусская вязь в современном прочтении' },
];

// Convert local fonts metadata to FontItems
const localFontItems = localMeta.map(m => {
  const isPersian = m.category === 'PERSIAN';
  return {
    id: m.id,
    name: m.name,
    nativeName: isPersian ? m.name : undefined,
    shelf: isPersian ? 'Persian & Arabic' : 'Display',
    language: isPersian ? 'Persian' : 'Display',
    cssFamily: `'${m.name}', sans-serif`,
    sampleText: isPersian ? 'هوش مصنوعی پیشرفته و تایپوگرافی اصیل فارسی' : 'Creative Studio Headline 1234567890',
    isLocal: true,
  };
});

// Combine all fonts without duplicates by ID
const seenIds = new Set();
const allFonts = [];

for (const f of googleFontsData) {
  if (!seenIds.has(f.id)) {
    seenIds.add(f.id);
    allFonts.push(f);
  }
}

for (const f of localFontItems) {
  if (!seenIds.has(f.id)) {
    seenIds.add(f.id);
    allFonts.push(f);
  }
}

console.log('Total combined fonts before expansion:', allFonts.length);

// Write fonts.ts
const fileHeader = `// Pimx Agent AI - Worldwide 500+ Typography Catalog & Multi-Script Engine
// Fully supporting Persian, Arabic, Latin, Monospace, and World Scripts
// Automatically integrated with local fonts (/fonts/local-fonts.css) and Google Fonts CDN

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
  { id: 'ALL', name: 'All Fonts', nameFa: 'همه فونت‌ها (۵۰۰+)', icon: '🌐', languageKey: 'ALL' },
  { id: 'Persian', name: 'Persian & Farsi', nameFa: 'فارسی و ایرانی', icon: '🇮🇷', languageKey: 'Persian' },
  { id: 'Arabic', name: 'Arabic & Middle East', nameFa: 'عربی و خاورمیانه', icon: '🌙', languageKey: 'Arabic' },
  { id: 'English', name: 'English & Modern Sans', nameFa: 'انگلیسی و سنس مدرن', icon: '🔤', languageKey: 'English' },
  { id: 'Coding', name: 'Developer & Monospace', nameFa: 'برنامه‌نویسی و مونو', icon: '💻', languageKey: 'Coding' },
  { id: 'Serif', name: 'Editorial & Serif Classics', nameFa: 'کلاسیک و سریف', icon: '📰', languageKey: 'Serif' },
  { id: 'Display', name: 'Display & Creative', nameFa: 'تیتری و دیزاین خاص', icon: '🎨', languageKey: 'Display' },
  { id: 'Handwriting', name: 'Handwritten & Script', nameFa: 'دست‌نویس و امضایی', icon: '✍️', languageKey: 'Handwriting' },
  { id: 'Japanese & CJK', name: 'Japanese & CJK', nameFa: 'ژاپنی و شرق آسیا', icon: '🗾', languageKey: 'Japanese & CJK' },
  { id: 'Hebrew', name: 'Hebrew', nameFa: 'عبری', icon: '📜', languageKey: 'Hebrew' },
  { id: 'Devanagari', name: 'Devanagari & Hindi', nameFa: 'هندی و دیواناگری', icon: '🕉️', languageKey: 'Devanagari' },
  { id: 'Thai', name: 'Thai & Southeast Asia', nameFa: 'تایلندی و جنوب شرق آسیا', icon: '🌴', languageKey: 'Thai' },
  { id: 'Cyrillic', name: 'Cyrillic & Slavic', nameFa: 'روسی و سیریلیک', icon: '🇷🇺', languageKey: 'Cyrillic' },
];
`;

const fileBody = `export const APP_FONTS: FontItem[] = ${JSON.stringify(allFonts, null, 2)};

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
`;

fs.writeFileSync(path.join(__dirname, '..', 'lib', 'theme', 'fonts.ts'), fileHeader + '\n' + fileBody);
console.log('Wrote lib/theme/fonts.ts successfully with', allFonts.length, 'fonts!');
