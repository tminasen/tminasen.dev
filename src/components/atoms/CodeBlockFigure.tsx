import {
  Children,
  ComponentProps,
  FC,
  isValidElement,
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

// next.config.mjs の rehype-pretty-code の defaultLang。言語指定が無いコードブロックの言語名
const DEFAULT_LANGUAGE = 'plaintext';
const RESET_DELAY_MS = 2000;

type CopyStatus = 'idle' | 'copied' | 'failed';

const COPY_LABELS: Record<CopyStatus, string> = {
  idle: 'コピー',
  copied: 'コピーしました',
  failed: 'コピーできませんでした',
};

const toText = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return toText(node.props.children);
  }
  if (Array.isArray(node)) {
    return node.map(toText).join('');
  }
  return '';
};

const isTitleElement = (node: ReactNode): node is ReactElement =>
  isValidElement<Record<string, unknown>>(node) &&
  node.props['data-rehype-pretty-code-title'] !== undefined;

const findLanguage = (nodes: ReactNode[]): string | undefined => {
  const pre = nodes.find(
    (node): node is ReactElement<{ 'data-language'?: string }> =>
      isValidElement(node) && node.type === 'pre',
  );
  return pre?.props['data-language'];
};

export const CodeBlockFigure: FC<ComponentProps<'figure'>> = ({
  children,
  ...props
}) => {
  const figureRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [status, setStatus] = useState<CopyStatus>('idle');

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (!('data-rehype-pretty-code-figure' in props)) {
    return <figure {...props}>{children}</figure>;
  }

  const nodes = Children.toArray(children);
  const titleNode = nodes.find(isTitleElement);
  const language = findLanguage(nodes);
  const label =
    titleNode !== undefined
      ? toText(titleNode)
      : language !== DEFAULT_LANGUAGE
        ? language
        : undefined;

  const handleCopy = async () => {
    const code = figureRef.current?.querySelector('pre')?.textContent ?? '';
    let result: CopyStatus = 'failed';
    try {
      await navigator.clipboard.writeText(code);
      result = 'copied';
    } catch {
      // クリップボード API が無い・拒否された場合は「コピーできませんでした」を表示する
    }
    setStatus(result);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus('idle'), RESET_DELAY_MS);
  };

  return (
    <figure ref={figureRef} {...props}>
      <div className="code-block-bar">
        <span className="code-block-label">{label}</span>
        <button
          type="button"
          className="code-block-copy"
          aria-live="polite"
          onClick={handleCopy}
        >
          {COPY_LABELS[status]}
        </button>
      </div>
      {nodes.filter(node => !isTitleElement(node))}
    </figure>
  );
};
