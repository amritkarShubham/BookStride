// ─────────────────────────────────────────────────────
// Bookstride — AI Metadata Extraction API Route
// ─────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { textSnippet, pdfMetadata } = await request.json();

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    // If we have a Gemini API key, use AI extraction
    if (apiKey && (textSnippet || pdfMetadata)) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `You are a book metadata extraction system. Analyze the following text from a book and extract metadata.

Text from the book:
---
${textSnippet.slice(0, 4000)}
---

${pdfMetadata ? `PDF internal metadata: ${JSON.stringify(pdfMetadata)}` : ''}

Extract and return ONLY a valid JSON object with these fields:
{
  "title": "Book title",
  "author": "Author name",
  "totalPages": estimated total pages (number or null),
  "description": "Brief 1-2 sentence description",
  "genres": ["genre1", "genre2"],
  "publishedYear": year (number or null)
}

Return ONLY the JSON. No markdown, no explanation.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const metadata = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            success: true,
            source: 'gemini',
            metadata: {
              title: metadata.title || pdfMetadata?.title || '',
              author: metadata.author || pdfMetadata?.author || '',
              totalPages: metadata.totalPages || pdfMetadata?.totalPages || 0,
              description: metadata.description || '',
              genres: metadata.genres || [],
              publishedYear: metadata.publishedYear || null,
            },
          });
        }
      } catch (aiError) {
        console.error('Gemini extraction failed, falling back:', aiError);
      }
    }

    // Fallback: use PDF metadata directly
    if (pdfMetadata) {
      return NextResponse.json({
        success: true,
        source: 'pdf-metadata',
        metadata: {
          title: pdfMetadata.title || '',
          author: pdfMetadata.author || '',
          totalPages: pdfMetadata.totalPages || 0,
          description: '',
          genres: [],
          publishedYear: null,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'No text or metadata provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Metadata extraction error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
