import Tesseract from 'tesseract.js';

/**
 * Extract text from an image using OCR
 * @param buffer - The image file buffer
 * @returns Extracted text
 */
export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  try {
    console.log('Starting OCR text extraction...');

    const result = await Tesseract.recognize(
      buffer,
      'eng', // English language
      {
        logger: (m) => {
          // Optional: log progress
          if (m.status === 'recognizing text') {
            console.log(`OCR progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      }
    );

    const extractedText = result.data.text.trim();
    console.log(
      `OCR extraction successful: ${extractedText.length} characters extracted`
    );

    return extractedText;
  } catch (error) {
    console.error('OCR extraction error:', error);
    return '';
  }
}
