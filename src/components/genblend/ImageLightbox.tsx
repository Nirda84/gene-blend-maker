import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Download } from "lucide-react";

interface ImageLightboxProps {
  src: string | null;
  alt: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  downloadName?: string;
}

export function ImageLightbox({
  src,
  alt,
  open,
  onOpenChange,
  downloadName,
}: ImageLightboxProps) {
  const handleDownload = () => {
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    a.download = downloadName || "genblend.jpg";
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-[95vw] w-auto border-0 bg-transparent p-0 shadow-none sm:rounded-none [&>button]:bg-background/80 [&>button]:rounded-full [&>button]:p-2 [&>button]:opacity-100 [&>button]:right-2 [&>button]:top-2"
      >
        {src && (
          <div className="relative flex items-center justify-center">
            <img
              src={src}
              alt={alt}
              className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain shadow-glow"
            />
            <button
              type="button"
              onClick={handleDownload}
              className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-2 text-xs font-semibold text-foreground backdrop-blur transition hover:bg-background"
              aria-label="Download image"
            >
              <Download className="h-4 w-4" /> Download
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
