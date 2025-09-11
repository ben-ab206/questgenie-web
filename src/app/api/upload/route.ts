/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import PDFParser from 'pdf2json';
import mammoth from 'mammoth';

export async function POST(req: NextRequest) {
  try {
    const formData: FormData = await req.formData();
    const uploadedFiles = formData.getAll('file');
    let fileName = '';

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return NextResponse.json({ error: 'No files found' }, { status: 400 });
    }

    const uploadedFile = uploadedFiles[1] || uploadedFiles[0];
    console.log('Uploaded file:', uploadedFile);

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json({ error: 'Invalid file format' }, { status: 400 });
    }

    fileName = uuidv4();
    const fileExtension = getFileExtension(uploadedFile.name);
    
    if (!['pdf', 'docx', 'txt'].includes(fileExtension)) {
      return NextResponse.json({ 
        error: 'Unsupported file format. Only PDF, DOCX, and TXT files are supported.' 
      }, { status: 400 });
    }

    let parsedText = '';

    switch (fileExtension) {
      case 'pdf':
        parsedText = await parsePDF(uploadedFile, fileName);
        break;
      case 'docx':
        parsedText = await parseDOCX(uploadedFile);
        break;
      case 'txt':
        parsedText = await parseTXT(uploadedFile);
        break;
    }

    const response = new NextResponse(parsedText);
    response.headers.set('FileName', fileName);
    response.headers.set('FileType', fileExtension);
    return response;

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process file' }, 
      { status: 500 }
    );
  }
}

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

async function parsePDF(file: File, fileName: string): Promise<string> {
  const tempFilePath = `/tmp/${fileName}.pdf`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(tempFilePath, fileBuffer);

  const parsedText = await new Promise<string>((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);

    pdfParser.on('pdfParser_dataError', (errData: any) => {
      console.log('PDF Parser Error:', errData.parserError);
      reject(new Error(errData.parserError));
    });

    pdfParser.on('pdfParser_dataReady', () => {
      try {
        const text = (pdfParser as any).getRawTextContent();
        resolve(text);
      } catch (error) {
        reject(error);
      }
    });

    pdfParser.loadPDF(tempFilePath);
  });

  await fs.unlink(tempFilePath).catch(console.error);
  return parsedText;
}

async function parseDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (result.messages && result.messages.length > 0) {
      console.log('DOCX parsing messages:', result.messages);
    }
    
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file');
  }
}

async function parseTXT(file: File): Promise<string> {
  try {
    const text = await file.text();
    return text;
  } catch (error) {
    console.error('TXT parsing error:', error);
    throw new Error('Failed to parse TXT file');
  }
}