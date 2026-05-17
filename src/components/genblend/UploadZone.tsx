import { useCallback, useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  label: string;
  hint: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  accent?: "pink" | "indigo";
}

export function UploadZone({ label, hint, value, onChange, accent = "indigo" }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => onChange(reader.result as string);
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const accentRing =
    accent === "pink"
      ? "from-[oklch(0.88_0.12_0)] to-[oklch(0.78_0.16_320)]"
      : "from-[oklch(0.75_0.18_290)] to-[oklch(0.65_0.2_270)]";

  return (
    <div className="relative">
      <div
        className={cn(
          "absolute -inset-0.5 rounded-3xl bg-gradient-to-br opacity-60 blur-xl transition-opacity",
          accentRing,
          drag ? "opacity-100" : "opacity-30",
        )}
        aria-hidden
      />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        onClick={() => !value && inputRef.current?.click()}
        className={cn(
          "group relative aspect-square w-full overflow-hidden rounded-3xl border-2 border-dashed bg-card/80 backdrop-blur transition-all",
          "flex flex-col items-center justify-center p-6 text-center cursor-pointer",
          drag ? "border-primary scale-[1.02]" : "border-border hover:border-primary/60",
        )}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="absolute inset-0 h-full w-full object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute right-3 top-3 z-10 rounded-full bg-background/90 p-2 shadow-soft transition hover:scale-110"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-background/90 px-4 py-2 text-xs font-medium shadow-soft transition hover:scale-105"
            >
              Replace
            </button>
          </>
        ) : (
          <>
            <div className="mb-4 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/30 p-4 transition group-hover:scale-110">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <p className="text-base font-semibold text-foreground">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
              <ImageIcon className="h-3 w-3" /> PNG, JPG up to 10MB
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>
    </div>
  );
}
