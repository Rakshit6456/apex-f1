import { NextResponse } from 'next/server';

function extractCDATA(str) {
    if (!str) return '';
    const cdata = str.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
    return cdata ? cdata[1].trim() : str.trim();
}

function stripHtml(str) {
    return str.replace(/<[^>]+>/g, '').trim();
}

function parseRSSItems(xml) {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
        const item = match[1];

        const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
        const descMatch = item.match(/<description>([\s\S]*?)<\/description>/);
        const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
        const pubDateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
        const thumbnailMatch = item.match(/media:thumbnail[^>]+url="([^"]+)"/);
        const enclosureMatch = item.match(/<enclosure[^>]+url="([^"]+)"/);
        const categoryMatches = [...item.matchAll(/<category>([\s\S]*?)<\/category>/g)];

        const title = titleMatch ? extractCDATA(titleMatch[1]) : '';
        const description = descMatch ? stripHtml(extractCDATA(descMatch[1])) : '';
        const link = linkMatch ? linkMatch[1].trim().replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
        const pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';
        const image = thumbnailMatch ? thumbnailMatch[1] : (enclosureMatch ? enclosureMatch[1] : null);
        const category = categoryMatches.length > 0
            ? extractCDATA(categoryMatches[0][1])
            : 'Formula 1';

        if (title && link) {
            items.push({ title, description, link, pubDate, image, category });
        }
    }

    return items;
}

export async function GET() {
    try {
        const res = await fetch('https://feeds.bbci.co.uk/sport/formula1/rss.xml', {
            next: { revalidate: 1800 },
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ApexF1/1.0)',
                'Accept': 'application/rss+xml, application/xml, text/xml',
            },
        });

        if (!res.ok) {
            return NextResponse.json({ articles: [] });
        }

        const xml = await res.text();
        const articles = parseRSSItems(xml).slice(0, 15);

        return NextResponse.json({ articles });
    } catch (error) {
        console.error('Error fetching F1 news:', error);
        return NextResponse.json({ articles: [] });
    }
}
