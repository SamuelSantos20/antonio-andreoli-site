import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { defaultProfessionalConfig as config } from '../src/config/professional.ts';

const server = await createServer({ server:{middlewareMode:true,watch:null}, appType:'custom' });
const noop=()=>{};
const rendered={};
try {
 for(const [file,name,props] of [
  ['/src/components/AtuacaoSection.tsx','AtuacaoSection',{}],
  ['/src/components/AtendimentoSection.tsx','AtendimentoSection',{config,onSpeakWithAntonio:noop}],
  ['/src/components/PilaresSection.tsx','PilaresSection',{config}],
  ['/src/components/ContatoSection.tsx','ContatoSection',{config,onSpeakWithAntonio:noop,onSaveContact:noop}],
  ['/src/pages/ContactPage.tsx','ContactPage',{config,onNavigateHome:noop,onSpeakWithAntonio:noop,onSaveContact:noop,onGoogleReview:noop}],
  ['/src/components/HeroNarrativeSection.tsx','HeroNarrativeSection',{config,onSpeakWithAntonio:noop,onExploreClick:noop,reducedMotion:true,onToggleReducedMotion:noop,motionLocked:true}],
 ]) {
  const module=await server.ssrLoadModule(file);
  rendered[name]=renderToStaticMarkup(createElement(module[name],props));
 }
 assert.equal((rendered.AtuacaoSection.match(/<article /g)||[]).length,3);
 for(const name of ['AtuacaoSection','AtendimentoSection','PilaresSection','ContatoSection']) {
  assert.ok(rendered[name].includes('aria-labelledby='));
  assert.ok(rendered[name].includes('<h2'));
  assert.ok(!/shadow-|rounded-2xl|bg-\[#FFFFFF\]/.test(rendered[name]),'Main sections must use open layouts.');
 }
 for(const name of ['AtendimentoSection','ContatoSection','ContactPage','HeroNarrativeSection']) assert.ok(rendered[name].includes('https://wa.me/5521999623802?text='));
 assert.ok(rendered.ContactPage.includes('(21) 99962-3802'));
 for (const name of ['ContatoSection','ContactPage']) {
  assert.ok(rendered[name].includes('<address>R. Promotor Sá Carvalho, 292<br/>'));
  assert.ok(rendered[name].includes('Nova Iguaçu'));
  assert.ok(rendered[name].includes('26216-180'));
 }
 assert.ok(!rendered.ContactPage.includes('Avaliar no Google'),'No unavailable review action.');
 assert.ok(!rendered.ContactPage.includes('>Site<'),'No redundant Site contact row.');
 assert.ok(rendered.HeroNarrativeSection.includes('pen-story--still'));
 assert.ok(rendered.HeroNarrativeSection.includes('/media/escrita/final.webp'));
 assert.ok(!rendered.HeroNarrativeSection.includes('<canvas'),'Reduced motion must show the final image.');
 assert.ok(!rendered.HeroNarrativeSection.includes('stroke-dasharray'),'The rejected artificial lettering must not render.');
 assert.ok(rendered.PilaresSection.includes('Antônio'));
 assert.ok(rendered.PilaresSection.includes('Andreoli'));
 assert.ok(rendered.PilaresSection.includes('OAB/RJ 064430'));
 console.log(JSON.stringify({result:'PASS',renderedComponents:Object.keys(rendered),checked:['semantic headings','open service layouts','confirmed WhatsApp','no unavailable contact channels','reduced motion final image','old lettering removed','professional identification']},null,2));
} finally { await server.close(); }
