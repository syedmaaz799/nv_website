import { PROGRAMS } from '../../data/programs.mjs';
import { esc, each } from '../lib.mjs';
import { page, btn } from '../layout.mjs';

// Served from any path, so links are root-relative.
export function render() {
  const body = `
<section class="page-hero nf"><div class="bg-grid" aria-hidden="true"></div>
  <div class="container nf__inner">
    <p class="nf__code mono" aria-hidden="true">4<span>0</span>4</p>
    <h1 class="h2">This page wandered off the training set.</h1>
    <p class="lede">The link may be outdated, or the page may have moved. Try one of these instead:</p>
    <div class="btn-row">${btn({ href: '/index.html', label: 'Back to home', iconName: 'arrow-right' })}${btn({ href: '/programs/index.html', label: 'All programs', variant: 'ghost' })}</div>
    <ul class="nf__links">${each(PROGRAMS, (p) => `<li><a class="u-link" href="/${p.url}" style="color:${p.accent}">${esc(p.name)}</a></li>`)}</ul>
  </div></section>`;
  const html = page({ title: 'Page not found', pageKey: '404', path: '404.html', depth: 0, css: ['about'], js: [], body, description: 'Page not found.' });
  return html.replace(/(href|src)="\.\/(?!\/)/g, '$1="/').replace(/"base":"\.\/"/, '"base":"/"');
}
