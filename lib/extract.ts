import PDFParser from 'pdf2json';
import mammoth from 'mammoth';
import { extractTextFromImage } from './ocr';

/**
 * Extract text from a PDF file
 * @param buffer - The PDF file buffer
 * @returns Extracted text
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve) => {
    try {
      const pdfParser = new PDFParser(null, true);

      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error('PDF parsing error:', errData?.parserError);
        resolve('');
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          // Extract text from PDF data
          let text = '';

          if (pdfData && pdfData.Pages) {
            for (const page of pdfData.Pages) {
              if (page.Texts) {
                for (const textItem of page.Texts) {
                  if (textItem.R) {
                    for (const run of textItem.R) {
                      if (run.T) {
                        // Decode URI encoded text
                        text += decodeURIComponent(run.T) + ' ';
                      }
                    }
                  }
                }
                text += '\n'; // New line after each page
              }
            }
          }

          const cleanedText = text.trim();
          console.log(
            `PDF extraction successful: ${cleanedText.length} characters extracted`
          );
          resolve(cleanedText);
        } catch (error) {
          console.error('PDF text extraction error:', error);
          resolve('');
        }
      });

      pdfParser.parseBuffer(buffer);
    } catch (error) {
      console.error('PDF extraction error:', error);
      resolve('');
    }
  });
}

/**
 * Extract text from a DOCX file
 * @param buffer - The DOCX file buffer
 * @returns Extracted text
 */
async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  } catch (error) {
    console.error('DOCX extraction error:', error);
    return '';
  }
}

/**
 * Extract text from a file based on its type
 * @param file - The file to extract text from
 * @returns Extracted text
 */
export async function extractText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    // Determine file type and extract accordingly
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractPdfText(buffer);
    } else if (
      fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword' ||
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc')
    ) {
      return await extractDocxText(buffer);
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      // Plain text file
      return buffer.toString('utf-8').trim();
    } else if (
      fileType === 'image/png' ||
      fileType === 'image/jpeg' ||
      fileType === 'image/jpg' ||
      fileName.endsWith('.png') ||
      fileName.endsWith('.jpg') ||
      fileName.endsWith('.jpeg')
    ) {
      // Extract text from image using OCR
      return await extractTextFromImage(buffer);
    } else {
      console.warn(`Unsupported file type for text extraction: ${fileType}`);
      return '';
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    return '';
  }
}

/**
 * Extract text from a file stored in Supabase Storage
 * @param storageKey - The storage key/path of the file
 * @param bucket - The bucket name
 * @param supabase - Supabase client
 * @returns Extracted text
 */
export async function extractTextFromStorage(
  storageKey: string,
  bucket: 'uploads' | 'audio' | 'reports',
  supabase: any
): Promise<string> {
  try {
    // Download the file from storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(storageKey);

    if (error) {
      console.error('Storage download error:', error);
      return '';
    }

    // Convert blob to buffer
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine file type from extension
    const extension = storageKey.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      return await extractPdfText(buffer);
    } else if (extension === 'docx' || extension === 'doc') {
      return await extractDocxText(buffer);
    } else if (extension === 'txt') {
      return buffer.toString('utf-8').trim();
    } else if (
      extension === 'png' ||
      extension === 'jpg' ||
      extension === 'jpeg'
    ) {
      return await extractTextFromImage(buffer);
    } else {
      console.warn(`Unsupported file extension for extraction: ${extension}`);
      return '';
    }
  } catch (error) {
    console.error('Extract from storage error:', error);
    return '';
  }
}
