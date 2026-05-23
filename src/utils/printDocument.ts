export type PrintVariant = "full" | "substitute";

const PRINT_STYLE_ID = "teacherforge-print-style";
const PRINT_ROOT_TEST_ID = "tf-print-root";

function getPrintRoot(rootTestId: string) {
  if (typeof document === "undefined") {
    return null;
  }

  return document.querySelector<HTMLElement>(`[data-testid="${rootTestId}"]`);
}

export function ensurePrintStyles() {
  if (typeof document === "undefined") {
    return;
  }

  if (document.getElementById(PRINT_STYLE_ID)) {
    return;
  }

  const styleTag = document.createElement("style");
  styleTag.id = PRINT_STYLE_ID;
  styleTag.textContent = `
    @media print {
      @page {
        margin: 1in;
      }

      html,
      body {
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
      }

      body * {
        visibility: hidden !important;
      }

      [data-testid="${PRINT_ROOT_TEST_ID}"],
      [data-testid="${PRINT_ROOT_TEST_ID}"] * {
        visibility: visible !important;
      }

      [data-testid="${PRINT_ROOT_TEST_ID}"] {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        margin: 0 !important;
        font-size: 12pt !important;
        line-height: 1.45 !important;
      }

      [data-testid="${PRINT_ROOT_TEST_ID}"][data-print-variant="substitute"] [data-testid="teacher-note-section"] {
        display: none !important;
      }
    }
  `;

  document.head.appendChild(styleTag);
}

export function triggerPrint(
  variant: PrintVariant = "full",
  rootTestId = PRINT_ROOT_TEST_ID
) {
  if (typeof window === "undefined") {
    return false;
  }

  ensurePrintStyles();

  const root = getPrintRoot(rootTestId);
  if (root) {
    root.setAttribute("data-print-variant", variant);
  }

  window.print();

  if (root) {
    window.setTimeout(() => {
      root.setAttribute("data-print-variant", "full");
    }, 0);
  }

  return true;
}
