import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// These styles are necessary for the PDF to look right
// New paths for react-pdf v7+
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
// Standard worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Define the Props interface
interface PitchSlidesProps {
  pdfUrl: string;
}

const PitchSlides: React.FC<PitchSlidesProps> = ({ pdfUrl }) => {
  // Specify that numPages can be a number or null
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

  // Type the argument based on react-pdf's internal structure
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1); // Reset to page 1 if the URL changes
  }

  const changePage = (offset: number): void => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  return (
    <div className="flex flex-col items-center p-4 w-full">
      <div className="border shadow-lg bg-white overflow-hidden rounded-lg">
        // Inside PitchSlides.tsx
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex justify-center"
        >
          <Page
            pageNumber={pageNumber}
            // This makes the slide fit better in your dashboard
            width={800}
            renderTextLayer={false} // Disable if you don't need to select text (makes it cleaner)
            className="shadow-2xl rounded-sm"
          />
        </Document>
      </div>

      <div className="mt-4 flex gap-4 items-center font-semibold">
        <button
          disabled={pageNumber <= 1}
          onClick={() => changePage(-1)}
          className="bg-indigo-600 text-white px-6 py-2 rounded shadow-md disabled:bg-gray-300 transition-colors"
        >
          Previous
        </button>

        <p className="text-gray-700">
          Slide {pageNumber} of {numPages || "--"}
        </p>

        <button
          disabled={numPages === null || pageNumber >= numPages}
          onClick={() => changePage(1)}
          className="bg-indigo-600 text-white px-6 py-2 rounded shadow-md disabled:bg-gray-300 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PitchSlides;
