import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// Define the structure for RSS items
type CustomItem = {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  guid: string;
  categories: string[];
  isoDate: string;
};

// Create a custom parser instance
const parser: Parser<any, CustomItem> = new Parser({
  customFields: {
    item: [
      ['title', 'title'],
      ['link', 'link'],
      ['pubDate', 'pubDate'],
      ['description', 'content'],
      ['guid', 'guid'],
    ],
  },
});

// Maximum number of headlines to return
const MAX_HEADLINES = 10;

export async function GET() {
  try {
    // Fetch the RSS feed from Ynet
    const feed = await parser.parseURL('https://www.ynet.co.il/Integration/StoryRss184.xml');
    
    // Extract and process headlines
    const headlines = feed.items
      .slice(0, MAX_HEADLINES)
      .map((item: CustomItem) => {
        // Clean the title by removing HTML tags
        const cleanTitle = item.title.replace(/<\/?[^>]+(>|$)/g, "");
        
        return {
          title: cleanTitle,
          link: item.link,
          pubDate: item.pubDate,
          guid: item.guid
        };
      });
    
    // Return the processed headlines as JSON
    return NextResponse.json({ 
      success: true, 
      headlines,
      source: 'Ynet News',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching Ynet RSS feed:', error);
    
    // Return an error response
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch news headlines',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 