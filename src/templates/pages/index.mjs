/** Page registry: every HTML file the build writes. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PROGRAMS } from '../../data/programs.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const stamp = `?t=${Date.now()}`;
const load = async (name) => (fs.existsSync(path.join(here, `${name}.mjs`)) ? import(pathToFileURL(path.join(here, `${name}.mjs`)).href + stamp) : null);

const mods = Object.fromEntries(await Promise.all(['home', 'programs', 'program', 'apply', 'contact', 'about', 'privacy', 'notfound'].map(async (n) => [n, await load(n)])));

export const PAGES = [
  mods.home && { out: 'index.html', priority: 1.0, render: () => mods.home.render() },
  mods.programs && { out: 'programs/index.html', priority: 0.9, render: () => mods.programs.render() },
  ...(mods.program ? PROGRAMS.map((p) => ({ out: p.url, priority: 0.9, render: () => mods.program.render(p) })) : []),
  mods.apply && { out: 'apply.html', priority: 0.8, render: () => mods.apply.render() },
  mods.contact && { out: 'contact.html', priority: 0.7, render: () => mods.contact.render() },
  mods.about && { out: 'about.html', priority: 0.7, render: () => mods.about.render() },
  mods.privacy && { out: 'privacy.html', priority: 0.3, render: () => mods.privacy.render() },
  mods.notfound && { out: '404.html', noindex: true, render: () => mods.notfound.render() },
].filter(Boolean);
