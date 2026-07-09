export function DocumentPrintStyles() {
  return (
    <style>
      {`
        .document-print-area h1 {
          text-align: center;
          color: #502815;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 0;
          text-transform: uppercase;
        }

        .document-print-area h2 {
          color: #502815;
          font-size: 16px;
          font-weight: 700;
          margin-top: 10px;
          margin-bottom: 0;
        }

        .document-print-area h2 + p {
          margin-top: 2px;
        }

        .document-print-area .document-letterhead,
        .document-print-area .document-footer {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .document-print-area .signature-block {
          break-inside: auto;
          page-break-inside: auto;
        }

        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          html,
          body {
            margin: 0;
            padding: 0;
          }

          body * {
            visibility: hidden;
          }

          .document-print-area,
          .document-print-area * {
            visibility: visible;
          }

          .document-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            box-sizing: border-box !important;
            display: block;
            width: 210mm !important;
            min-height: auto;
            max-width: none;
            overflow: visible;
            padding: 10mm 18mm 10mm !important;
            box-shadow: none;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .document-print-area .document-letterhead {
            position: static !important;
            display: flex !important;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 6mm !important;
          }

          .document-print-area .document-footer {
            position: static !important;
            display: block !important;
            margin-top: 12mm;
          }

          .document-print-area .document-watermark {
            position: fixed;
            left: 50%;
            top: 50%;
            width: 145mm;
            opacity: 0.10;
          }

          .document-print-area .document-content {
            display: block;
            gap: 8px !important;
            margin-top: 0;
            padding-bottom: 0;
          }

          .document-print-area .document-content > * + * {
            margin-top: 8px !important;
          }

          .document-print-area h1 {
            margin-top: 0;
          }

          .document-print-area h2 {
            margin-top: 6px !important;
            margin-bottom: 0 !important;
          }

          .document-print-area h2 + p {
            margin-top: 0 !important;
          }

          .document-print-area .signature-block {
            margin-bottom: 0;
            padding-top: 5mm;
          }

          .document-print-area::after {
            content: none !important;
            display: none !important;
          }
        }
      `}
    </style>
  );
}
