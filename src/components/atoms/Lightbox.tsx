import { FC, ImgHTMLAttributes, useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

type Props = ImgHTMLAttributes<HTMLImageElement>;

export const Lightbox: FC<Props> = ({ src, alt, ...props }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      document.body.style.overflow = '';
    };
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [mounted]);

  const openLightbox = useCallback(() => {
    dialogRef.current?.showModal();
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    dialogRef.current?.close();
    document.body.style.overflow = '';
  }, []);

  const handleDialogClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        closeLightbox();
      }
    },
    [closeLightbox],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLImageElement>) => {
      if (e.key === 'Enter') {
        openLightbox();
      }
    },
    [openLightbox],
  );

  return (
    <>
      <img
        src={src}
        alt={alt ?? ''}
        {...props}
        className="cursor-zoom-in"
        onClick={openLightbox}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      />
      {mounted &&
        createPortal(
          <dialog
            ref={dialogRef}
            className="lightbox-dialog"
            onClick={handleDialogClick}
            aria-label={alt ? `${alt} の拡大表示` : '画像の拡大表示'}
          >
            <img src={src} alt={alt ?? ''} className="lightbox-image" />
            <button
              className="lightbox-close"
              onClick={closeLightbox}
              aria-label="閉じる"
              type="button"
            >
              &times;
            </button>
          </dialog>,
          document.body,
        )}
    </>
  );
};
