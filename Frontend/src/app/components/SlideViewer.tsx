import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PitchSlidesProps {
  pdfUrl: string;
}

const PitchSlides: React.FC<PitchSlidesProps> = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(800);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfFile, setPdfFile] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch PDF from authenticated URL
  useEffect(() => {
    const fetchPdf = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status}`);
        }
        const blob = await response.blob();
        setPdfFile(blob);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load PDF");
        setIsLoading(false);
      }
    };

    if (pdfUrl) {
      fetchPdf();
    }
  }, [pdfUrl]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setIsLoading(false);
  }

  const changePage = (offset: number) => {
    setPageNumber((prev) => {
      const newPage = prev + offset;
      if (numPages && newPage >= 1 && newPage <= numPages) {
        return newPage;
      }
      return prev;
    });
  };

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const width = entry.contentRect.width;
      const maxWidth = 1100;
      setPageWidth(Math.min(width - 40, maxWidth));
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") changePage(-1);
      if (e.key === "ArrowRight") changePage(1);
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [numPages]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center justify-center relative"
    >
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-white/60 text-sm font-medium">
              Loading slides...
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
          <div className="flex flex-col items-center gap-3 bg-red-900/40 border border-red-500/50 px-6 py-4 rounded-lg">
            <p className="text-red-400 text-sm font-medium">Error loading PDF</p>
            <p className="text-red-300/70 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* PDF Container */}
      <div className="relative w-full h-full flex items-center justify-center overflow-auto">
        {pdfFile ? (
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="text-white/40">Loading PDF...</div>}
            error={<div className="text-red-400 text-sm">Error loading PDF</div>}
            className="flex justify-center w-full h-full"
          >
            <Page
              pageNumber={pageNumber}
              width={pageWidth}
              renderTextLayer={false}
              className="shadow-2xl rounded-lg"
              loading={<div className="text-white/30">Loading page...</div>}
            />
          </Document>
        ) : null}

        {/* Side Navigation Buttons - Left */}
        <button
          onClick={() => changePage(-1)}
          disabled={pageNumber <= 1}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-indigo-600/80 hover:bg-indigo-500 disabled:bg-gray-600/40 disabled:cursor-not-allowed text-white transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Side Navigation Buttons - Right */}
        <button
          onClick={() => changePage(1)}
          disabled={numPages === null || pageNumber >= numPages}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-indigo-600/80 hover:bg-indigo-500 disabled:bg-gray-600/40 disabled:cursor-not-allowed text-white transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-6 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-lg pointer-events-auto">
        <button
          onClick={() => changePage(-1)}
          disabled={pageNumber <= 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg active:scale-95"
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        <div className="flex items-center gap-2 text-white/80">
          <span className="text-sm font-semibold">{pageNumber}</span>
          <span className="text-white/40">/</span>
          <span className="text-sm font-semibold">{numPages || "--"}</span>
        </div>

        <button
          onClick={() => changePage(1)}
          disabled={numPages === null || pageNumber >= numPages}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg active:scale-95"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default PitchSlides;