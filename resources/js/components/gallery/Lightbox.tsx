import { useEffect, useCallback, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Image as ImageIcon } from 'lucide-react';

interface LightboxImage {
    id: number;
    image: string;
    caption: string | null;
    alt_text: string | null;
}

interface Props {
    images: LightboxImage[];
    currentIndex: number;
    open: boolean;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
}

function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

export default function Lightbox({ images, currentIndex, open, onClose, onPrev, onNext }: Props) {
    const [zoomed, setZoomed] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [swiping, setSwiping] = useState(false);
    const [exit, setExit] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const current = images[currentIndex];

    const handleClose = useCallback(() => {
        setExit(true);
        setTimeout(() => {
            setExit(false);
            setZoomed(false);
            setRotation(0);
            onClose();
        }, 200);
    }, [onClose]);

    useEffect(() => {
        if (!open) return;

        const handler = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    handleClose();
                    break;
                case 'ArrowLeft':
                    onPrev();
                    break;
                case 'ArrowRight':
                    onNext();
                    break;
                case '+':
                case '=':
                    setZoomed((z) => !z);
                    break;
                case 'r':
                    setRotation((r) => r + 90);
                    break;
            }
        };
        window.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [open, handleClose, onPrev, onNext]);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
        setSwiping(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!swiping) return;
        setTouchEnd(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const diff = touchStart - touchEnd;
        if (Math.abs(diff) > 60) {
            if (diff > 0) onNext();
            else onPrev();
        }
        setTouchStart(null);
        setTouchEnd(null);
        setSwiping(false);
    };

    const handleBgClick = (e: React.MouseEvent) => {
        if (e.target === containerRef.current) handleClose();
    };

    if (!open || !current) return null;

    const imgSrc = `/storage/${current.image}`;

    return (
        <div
            ref={containerRef}
            onClick={handleBgClick}
            className={cn(
                'fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm transition-opacity duration-200',
                exit ? 'opacity-0' : 'opacity-100'
            )}
        >
            <button
                type="button"
                onClick={handleClose}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
            >
                <X className="size-5" />
            </button>

            {images.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onPrev(); }}
                        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
                    >
                        <ChevronLeft className="size-5" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onNext(); }}
                        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
                    >
                        <ChevronRight className="size-5" />
                    </button>
                </>
            )}

            <div className="flex flex-col items-center justify-center px-4">
                <div className="relative flex items-center justify-center">
                    <img
                        ref={imageRef}
                        src={imgSrc}
                        alt={current.alt_text ?? current.caption ?? `Photo ${currentIndex + 1}`}
                        draggable={false}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className={cn(
                            'max-h-[80vh] max-w-full select-none rounded-lg object-contain transition-all duration-300',
                            zoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                        )}
                        style={{ transform: zoomed ? 'scale(1.5)' : `rotate(${rotation}deg)`, transition: 'transform 0.3s ease' }}
                        onClick={() => setZoomed((z) => !z)}
                    />
                </div>

                <div className="mt-4 flex items-center gap-3 text-center">
                    {current.caption && (
                        <p className="text-sm text-white/70">{current.caption}</p>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => setZoomed((z) => !z)}
                        className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] text-white/60 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
                    >
                        {zoomed ? <ZoomOut className="size-3" /> : <ZoomIn className="size-3" />}
                        {zoomed ? 'Zoom Out' : 'Zoom In'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setRotation((r) => r + 90)}
                        className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] text-white/60 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
                    >
                        <RotateCw className="size-3" />
                        Rotate
                    </button>
                    <span className="text-[10px] text-white/40">
                        {currentIndex + 1} / {images.length}
                    </span>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1.5 px-4 pb-4">
                {images.map((img, i) => (
                    <button
                        key={img.id}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); if (i < currentIndex) onPrev(); else if (i > currentIndex) onNext(); }}
                        className={cn(
                            'h-1 rounded-full transition-all',
                            i === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
