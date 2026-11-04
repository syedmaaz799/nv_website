import { site } from '../../config/site.mjs';
import { page, ph, mailAttrs } from '../layout.mjs';

export function render() {
  const body = `
<section class="page-hero legal-hero"><div class="bg-grid" aria-hidden="true"></div>
  <div class="container container--narrow"><p class="eyebrow">Privacy</p><h1 class="display-l" data-split data-split-now>Privacy notice</h1>
    <p class="lede">How ${site.name} handles the information you share through this website.</p></div></section>
<section class="section--tight"><div class="container container--narrow legal">
  <p class="legal__note">This notice is a starting template. Please have it reviewed so it reflects your organisation’s actual practices and the laws that apply to you before launch.</p>
  <h2 class="h4">What we collect</h2>
  <p>When you apply or contact us, we collect the details you choose to provide — such as your name, email address, phone or WhatsApp number, city, background, goals, the program you’re interested in and any message you write.</p>
  <h2 class="h4">How we use it</h2>
  <p>We use this information only to respond to your enquiry, discuss your application, and share information about the program you asked about. We do not sell your personal information.</p>
  <h2 class="h4">Where it goes</h2>
  <p>Depending on how you contact us, your submission may be delivered through a form-processing service, WhatsApp or email. Those services process data under their own privacy policies.</p>
  <h2 class="h4">On your device</h2>
  <p>To avoid losing your progress, the application form saves a draft in your browser’s local storage. It never leaves your device unless you submit it, and it is cleared once your application is handed off. The program finder runs entirely in your browser.</p>
  <h2 class="h4">Your choices</h2>
  <p>You can ask us to access, correct or delete the information you’ve shared at any time by contacting <a class="u-link" ${mailAttrs('Privacy request')}>${ph(site.contact.email)}</a>.</p>
</div></section>`;
  return page({ title: 'Privacy', pageKey: 'privacy', path: 'privacy.html', depth: 0, css: ['about'], js: [], body, description: `Privacy notice for ${site.name}.` });
}
