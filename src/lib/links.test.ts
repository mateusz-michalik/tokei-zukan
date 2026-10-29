import { describe, expect, test } from 'vitest';
import { watchRequestUrl } from './links';

describe('watch request links', () => {
  test('open the watch-request form', () => {
    expect(watchRequestUrl()).toBe('https://github.com/mateusz-michalik/tokei-zukan/issues/new?template=watch-request.yml');
    expect(watchRequestUrl('   ')).toBe(watchRequestUrl());
  });
  test('pre-fill the title with a search, safely encoded', () => {
    const url = new URL(watchRequestUrl(' Tudor Pelagos 39 & "BB58" #1 '));
    expect(url.searchParams.get('template')).toBe('watch-request.yml');
    expect(url.searchParams.get('title')).toBe('Watch request: Tudor Pelagos 39 & "BB58" #1');
    expect(url.hash).toBe('');
  });
});
