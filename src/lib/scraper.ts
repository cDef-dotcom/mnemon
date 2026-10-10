import * as cheerio from 'cheerio';

export interface ScrapedWebpage {
  title: string;
  content: string;
}

export async function scrapeUrl(url: string): Promise<ScrapedWebpage> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: HTTP ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove noise elements
    $('script, style, noscript, iframe, nav, footer, header, aside, svg, form, .ad, .ads, .advertisement, .social-share, .cookie-banner').remove();

    // Determine title
    let title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Web Article';
    title = title.split('|')[0].split(' - ')[0].trim();

    // Extract text from main content container or body
    let container = $('article, main, [role="main"], .article-body, .article-content, .entry-content, .recipe, .recipe-content');
    if (container.length === 0) {
      container = $('body');
    }

    // Collect structured paragraphs and headings
    const textBlocks: string[] = [];
    container.find('h1, h2, h3, h4, p, li, dt, dd, blockquote').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text.length > 0) {
        const tagName = el.tagName.toLowerCase();
        if (tagName.startsWith('h')) {
          textBlocks.push(`\n## ${text}\n`);
        } else if (tagName === 'li') {
          textBlocks.push(`- ${text}`);
        } else {
          textBlocks.push(text);
        }
      }
    });

    const fullContent = textBlocks.join('\n\n');

    return {
      title,
      content: fullContent.length > 50 ? fullContent : $.text().replace(/\s+/g, ' ').trim(),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown scrape error';
    console.error(`[Mnemon Scraper] Error scraping ${url}:`, err);
    throw new Error(`Could not read webpage content from ${url} (${msg})`);
  }
}
