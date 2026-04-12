import type { MDXComponents } from 'mdx/types';
import { Lightbox } from './src/components/atoms/Lightbox';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    img: (props) => <Lightbox {...props} />,
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
