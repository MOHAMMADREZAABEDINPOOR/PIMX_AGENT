"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STOP_WORDS = exports.MAX_CONTEXT_CHARS = exports.DEFAULT_RETRIEVAL_LIMIT = exports.MAX_TERMS = exports.OVERLAP = exports.TARGET_CHUNK = void 0;
exports.cleanText = cleanText;
exports.chunkText = chunkText;
exports.extractTerms = extractTerms;
exports.cosineSimilarity = cosineSimilarity;
exports.retrievePassages = retrievePassages;
exports.buildSourceContext = buildSourceContext;
exports.computeHash = computeHash;
exports.TARGET_CHUNK = 1250;
exports.OVERLAP = 180;
exports.MAX_TERMS = 180;
exports.DEFAULT_RETRIEVAL_LIMIT = 8;
exports.MAX_CONTEXT_CHARS = 18000;
// Bilingual stop words: English + Persian
exports.STOP_WORDS = new Set([
    // English
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'could', 'did', 'do',
    'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he',
    'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its',
    'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once',
    'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some',
    'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
    'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where',
    'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves',
    // Persian / Farsi
    'یک', 'این', 'آن', 'برای', 'که', 'در', 'از', 'به', 'با', 'را', 'است', 'بود', 'می', 'شود', 'شد', 'نیز', 'یا',
    'تا', 'هم', 'اما', 'اگر', 'چون', 'چه', 'پس', 'بر', 'بی', 'وی', 'او', 'ما', 'من', 'تو', 'شما', 'آنها', 'ایشان',
    'خود', 'دیگر', 'بین', 'روی', 'زیر', 'قبل', 'بعد', 'همین', 'همان', 'هر', 'همه', 'هیچ', 'چند', 'چرا', 'کجا',
    'کی', 'چگونه', 'هست', 'نیست', 'باشند', 'باشید', 'باشیم', 'بوده', 'کرده', 'کرد', 'کنند', 'کنید',
]);
function cleanText(raw) {
    if (!raw)
        return '';
    return raw
        .replace(/\0/g, '')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
function chunkText(raw, targetSize = exports.TARGET_CHUNK, overlap = exports.OVERLAP) {
    const cleaned = cleanText(raw);
    if (!cleaned)
        return [];
    if (cleaned.length <= targetSize)
        return [cleaned];
    const paragraphs = cleaned.split(/\n\s*\n/);
    const chunks = [];
    let current = '';
    for (const para of paragraphs) {
        const p = para.trim();
        if (!p)
            continue;
        if (current.length + p.length + 2 <= targetSize) {
            current = current ? `${current}\n\n${p}` : p;
        }
        else {
            if (current) {
                chunks.push(current);
                // Retain overlap from end of current chunk
                const tail = current.slice(-overlap);
                current = tail ? `${tail} ${p}` : p;
            }
            else {
                // Individual paragraph is longer than targetSize, split by sentence
                let remaining = p;
                while (remaining.length > targetSize) {
                    const windowSlice = remaining.slice(0, targetSize + overlap);
                    // Look for sentence boundary
                    let splitIdx = -1;
                    for (let i = targetSize; i < windowSlice.length; i++) {
                        if (['.', '!', '?', '\n', '؛', '؟'].includes(windowSlice[i])) {
                            splitIdx = i + 1;
                            break;
                        }
                    }
                    if (splitIdx === -1) {
                        splitIdx = targetSize;
                    }
                    chunks.push(remaining.slice(0, splitIdx).trim());
                    remaining = remaining.slice(Math.max(0, splitIdx - overlap)).trim();
                }
                if (remaining) {
                    current = remaining;
                }
            }
        }
    }
    if (current) {
        chunks.push(current);
    }
    // Remove duplicates and empty chunks
    const uniqueChunks = [];
    const seen = new Set();
    for (const c of chunks) {
        const trimmed = c.trim();
        if (trimmed && !seen.has(trimmed)) {
            seen.add(trimmed);
            uniqueChunks.push(trimmed);
        }
    }
    return uniqueChunks;
}
function extractTerms(text, maxTerms = exports.MAX_TERMS) {
    const words = text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !exports.STOP_WORDS.has(w));
    const counts = {};
    for (const w of words) {
        counts[w] = (counts[w] || 0) + 1;
    }
    // Sort by count desc and limit to maxTerms
    const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxTerms);
    return Object.fromEntries(sorted);
}
function cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (const count of Object.values(a)) {
        normA += count * count;
    }
    for (const count of Object.values(b)) {
        normB += count * count;
    }
    if (normA === 0 || normB === 0)
        return 0;
    for (const [term, countA] of Object.entries(a)) {
        if (b[term]) {
            dotProduct += countA * b[term];
        }
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
function retrievePassages(query, sources, chunks, limit = exports.DEFAULT_RETRIEVAL_LIMIT) {
    const cleanedQuery = cleanText(query).toLowerCase();
    const queryTerms = extractTerms(cleanedQuery);
    const sourceMap = new Map(sources.map(s => [s.id, s]));
    const scored = [];
    for (const chunk of chunks) {
        const source = sourceMap.get(chunk.sourceId);
        if (!source)
            continue;
        let chunkTerms = {};
        try {
            chunkTerms = JSON.parse(chunk.termsJson);
        }
        catch {
            chunkTerms = extractTerms(chunk.content);
        }
        let score = cosineSimilarity(queryTerms, chunkTerms);
        // Boost 1: +0.8 if whole cleaned query appears verbatim in chunk
        if (cleanedQuery.length >= 5 && chunk.content.toLowerCase().includes(cleanedQuery)) {
            score += 0.8;
        }
        // Boost 2: +0.12 per query term (>3 chars) that appears in source title
        const titleLower = source.title.toLowerCase();
        for (const term of Object.keys(queryTerms)) {
            if (term.length > 3 && titleLower.includes(term)) {
                score += 0.12;
            }
        }
        scored.push({
            sourceId: source.id,
            sourceTitle: source.title,
            origin: source.origin,
            chunkIndex: chunk.chunkIndex,
            citation: `[S${source.id.slice(0, 4)}:C${chunk.chunkIndex + 1}]`,
            content: chunk.content,
            score,
        });
    }
    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
}
function buildSourceContext(passages, maxChars = exports.MAX_CONTEXT_CHARS) {
    if (passages.length === 0)
        return '';
    const header = `=== RETRIEVED SOURCE PASSAGES (the only factual authority) ===\n`;
    let currentBudget = maxChars - header.length;
    const sections = [];
    for (const p of passages) {
        const section = `\n--- SOURCE PASSAGE ${p.citation} ---\nTitle: ${p.sourceTitle}${p.origin ? ` | Origin: ${p.origin}` : ''}\nContent:\n${p.content}\n`;
        if (sections.length === 0 || section.length <= currentBudget) {
            sections.push(section);
            currentBudget -= section.length;
        }
        else {
            break;
        }
    }
    return header + sections.join('');
}
function computeHash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return Math.abs(hash).toString(16);
}
