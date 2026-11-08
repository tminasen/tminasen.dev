import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const robots = fs.readFileSync(
  path.join(process.cwd(), 'public/robots.txt'),
  'utf8',
);
const lines = robots.split('\n').map(line => line.trim());

describe('public/robots.txt', () => {
  it.each([
    '*',
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-User',
    'Claude-SearchBot',
    'PerplexityBot',
    'Google-Extended',
  ])('should allow "%s" explicitly', agent => {
    // Given
    const index = lines.indexOf(`User-agent: ${agent}`);
    // When / Then
    expect(index).toBeGreaterThanOrEqual(0);
    expect(lines[index + 1]).toBe('Allow: /');
  });

  it('should declare the sitemap', () => {
    // Given / When / Then
    expect(lines).toContain('Sitemap: https://tminasen.dev/sitemap.xml');
  });

  it.each([
    '*',
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-User',
    'Claude-SearchBot',
    'PerplexityBot',
    'Google-Extended',
  ])('should not disallow "%s"', agent => {
    // Given
    const rules = rulesFor(agent);
    // When / Then
    expect(rules).not.toContain('Disallow: /');
  });

  it.each([
    'AhrefsBot',
    'SemrushBot',
    'MJ12bot',
    'DotBot',
    'BLEXBot',
    'DataForSeoBot',
  ])('should disallow SEO crawler "%s" for the whole site', agent => {
    // Given
    const rules = rulesFor(agent);
    // When / Then
    expect(rules).toEqual(['Disallow: /']);
  });
});

/**
 * 指定した User-agent が属するグループのルール行（Allow / Disallow）を返す。
 * RFC 9309 に従い、連続する User-agent 行は1つのグループを構成する。
 */
function rulesFor(agent: string): string[] {
  const groups: Array<{ agents: string[]; rules: string[] }> = [];
  let current: { agents: string[]; rules: string[] } | undefined;
  for (const line of lines) {
    if (line.startsWith('User-agent:')) {
      if (!current || current.rules.length > 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(line.slice('User-agent:'.length).trim());
    } else if (/^(Allow|Disallow):/.test(line) && current) {
      current.rules.push(line);
    }
  }
  const group = groups.find(g => g.agents.includes(agent));
  if (!group) {
    throw new Error(`User-agent: ${agent} is not defined`);
  }
  return group.rules;
}
