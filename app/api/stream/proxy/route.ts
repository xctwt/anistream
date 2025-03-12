import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const referer = searchParams.get('referer') || 'https://example.com';
    
    if (!url) {
      return NextResponse.json(
        { error: 'Missing URL parameter' }, 
        { status: 400 }
      );
    }
    
    // Decode the URL if it's encoded
    const decodedUrl = decodeURIComponent(url);
    
    // Fetch the HLS stream with appropriate headers
    const response = await fetch(decodedUrl, {
      headers: {
        'Referer': referer,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Origin': new URL(referer).origin,
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch stream: ${response.statusText}` }, 
        { status: response.status }
      );
    }
    
    // Get the content type from the response
    const contentType = response.headers.get('content-type') || 'application/vnd.apple.mpegurl';
    
    // Get the response body
    const body = await response.text();
    
    // Process m3u8 files to handle relative URLs
    let processedBody = body;
    if (contentType.includes('mpegurl')) {
      processedBody = processM3u8(body, decodedUrl);
    }
    
    // Return the stream with appropriate headers
    return new NextResponse(processedBody, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Error proxying stream:', error);
    return NextResponse.json(
      { error: 'Failed to proxy stream' }, 
      { status: 500 }
    );
  }
}

// Process m3u8 files to handle relative URLs
function processM3u8(content: string, baseUrl: string): string {
  const baseUrlObj = new URL(baseUrl);
  const basePath = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
  
  // Replace relative URLs with absolute URLs or proxy URLs
  return content.replace(/^(?!#)(?!https?:\/\/)([^\/].+?)$/gm, (match) => {
    // Determine if it's a full path or just a file name
    if (match.startsWith('/')) {
      // Full path from domain root
      return `${baseUrlObj.origin}${match}`;
    } else {
      // Relative path
      return `${basePath}${match}`;
    }
  });
} 