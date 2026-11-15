import type { MDXComponents } from 'mdx/types';
import { Lightbox } from './src/components/atoms/Lightbox';
import { CodeBlockFigure } from './src/components/atoms/CodeBlockFigure';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    img: (props) => <Lightbox {...props} />,
    figure: (props) => <CodeBlockFigure {...props} />,
    a: ({ href, children, ...props }) => {
      const isExternal = href?.startsWith('http');
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          {...props}
        >
          {children}
        </a>
      );
    },
    ...components,
  };
}
