import { Check, Copy, Download, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Modal, Spinner } from '../../components/ui';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  fileName: string;
  shareText: string;
  shareUrl: string;
  make: () => Promise<Blob>;
}

/** Previews a locally generated PNG and offers download, native share, copy link and social links. */
export function ShareSheet({ open, onClose, title, fileName, shareText, shareUrl, make }: Props) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    let objectUrl = '';
    setBlob(null);
    setErr('');
    make()
      .then((b) => {
        if (!alive) return;
        objectUrl = URL.createObjectURL(b);
        setBlob(b);
        setUrl(objectUrl);
      })
      .catch((e) => alive && setErr((e as Error).message || 'Could not draw the image on this browser.'));
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const file = blob ? new File([blob], fileName, { type: 'image/png' }) : null;
  const canShareFile = !!file && typeof navigator !== 'undefined' && !!navigator.canShare?.({ files: [file] });

  async function nativeShare() {
    try {
      if (canShareFile && file) await navigator.share({ files: [file], text: `${shareText} ${shareUrl}`, title: 'Taste of Bangladesh' });
      else if (navigator.share) await navigator.share({ text: shareText, url: shareUrl, title: 'Taste of Bangladesh' });
    } catch {
      /* user cancelled the share sheet */
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErr('Copy is blocked in this browser. Select and copy the link below instead.');
    }
  }

  const enc = encodeURIComponent;
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="overflow-hidden rounded-2xl bg-paper" style={{ aspectRatio: '4 / 5' }}>
        {url ? (
          <img src={url} alt={`${title} preview`} className="h-full w-full object-contain" />
        ) : err ? (
          <p className="p-6 text-chili">{err}</p>
        ) : (
          <div className="flex h-full items-center justify-center gap-2 text-ink-soft">
            <Spinner /> Drawing your card…
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          className={`btn-primary ${!url ? 'pointer-events-none opacity-55' : ''}`}
          href={url || undefined}
          download={fileName}
          aria-disabled={!url}
        >
          <Download className="h-4 w-4" /> Download PNG
        </a>
        {typeof navigator !== 'undefined' && 'share' in navigator ? (
          <button className="btn-chili" onClick={nativeShare} disabled={!blob}>
            <Share2 className="h-4 w-4" /> Share
          </button>
        ) : (
          <button className="btn-ghost" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy link'}
          </button>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {'share' in navigator && (
          <button className="btn-ghost min-h-10 px-4" onClick={copy}>
            {copied ? 'Copied' : 'Copy link'}
          </button>
        )}
        <a className="btn-ghost min-h-10 px-4" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${enc(`${shareText} ${shareUrl}`)}`}>
          WhatsApp
        </a>
        <a className="btn-ghost min-h-10 px-4" target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`}>
          Facebook
        </a>
      </div>
      <p className="mt-3 text-xs text-ink-soft">
        The image is drawn on your device. Nothing is posted unless you choose to share it. Social links share the page link; attach the downloaded image yourself.
      </p>
    </Modal>
  );
}
