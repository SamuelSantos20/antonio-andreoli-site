import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { getFilmFrame, getFilmFrameUrl, getFilmLayout, FILM, PHRASE_BOUNDS, PAPER_PATCH } from '../src/data/filmMotion.ts';

const directory = new URL('../public/media/escrita/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json', directory),'utf8'));
assert.equal(manifest.frames, FILM.frames);
assert.equal(manifest.sampleFps, FILM.fps);
assert.equal(manifest.phrase, 'Direito com clareza.');
assert.equal(manifest.audioIncluded, false);
assert.equal(getFilmFrame(0),0);
assert.equal(getFilmFrame(FILM.begin),0);
assert.equal(getFilmFrame(FILM.end),FILM.frames-1);
assert.equal(getFilmFrame(1),FILM.frames-1);
assert.equal(getFilmFrame(0,true),FILM.frames-1);
assert.equal(getFilmFrame(NaN),0);
assert.equal(getFilmFrame(Infinity),0);
assert.equal(getFilmFrameUrl(-10),'/media/escrita/quadro-001.webp');
assert.equal(getFilmFrameUrl(999),'/media/escrita/quadro-128.webp');
assert.equal(getFilmFrameUrl(0,'/antonio-andreoli-site/'),'/antonio-andreoli-site/media/escrita/quadro-001.webp');

const forward=[];
let previous=-1;
for(let step=0;step<=10000;step++) {
 const frame=getFilmFrame(step/10000);
 assert.ok(Number.isInteger(frame)&&frame>=0&&frame<FILM.frames);
 assert.ok(frame>=previous,'Descending progress must never rewind the film.');
 forward.push(frame);previous=frame;
}
for(let step=10000;step>=0;step--) assert.equal(getFilmFrame(step/10000),forward[step],'Ascending progress must select the same exact frame.');
assert.equal(new Set(forward).size,FILM.frames,'Every source frame must be reachable.');

let size=0;
for(let index=0;index<FILM.frames;index++) {
 const bytes=await readFile(new URL(getFilmFrameUrl(index).split('/').at(-1),directory));
 assert.equal(bytes.toString('ascii',0,4),'RIFF');
 assert.equal(bytes.toString('ascii',8,12),'WEBP');
 assert.ok(bytes.length>1000);
 size+=bytes.length;
}
assert.equal(size,manifest.sequenceBytes);
assert.ok(size<3_000_000,'The complete sequence should remain below the agreed 3 MB budget.');
const viewports = [[320,568],[390,844],[768,1024],[1024,768],[1440,900],[1920,1080],[2560,1080],[2560,720],[390,260],[844,390]];
for (const [width,height] of viewports) for (const standalone of [false,true]) {
 const layout=getFilmLayout(width,height,standalone),box=layout.foreground,safe=layout.safeArea;
 assert.ok(Math.abs(box.width/box.height-FILM.width/FILM.height)<1e-10,'The writing must never stretch.');
 const phrase={x:box.x+PHRASE_BOUNDS.x*layout.scale,y:box.y+PHRASE_BOUNDS.y*layout.scale,width:PHRASE_BOUNDS.width*layout.scale,height:PHRASE_BOUNDS.height*layout.scale};
 const epsilon=1e-7;
 assert.ok(phrase.x>=safe.x-epsilon&&phrase.y>=safe.y-epsilon&&phrase.x+phrase.width<=safe.x+safe.width+epsilon&&phrase.y+phrase.height<=safe.y+safe.height+epsilon,`Whole phrase must fit away from controls: ${width}x${height}, standalone=${standalone}`);
 const background=layout.mode==='cover'?box:layout.paperDestination;
 assert.ok(background.x<=epsilon&&background.y<=epsilon&&background.x+background.width>=width-epsilon&&background.y+background.height>=height-epsilon,'The background must cover all four edges.');
}
assert.equal(getFilmLayout(390,844).mode,'paper','Portrait must preserve lettering rather than blindly crop.');
assert.equal(getFilmLayout(1440,900).mode,'cover','Desktop should use the original full-frame cover composition.');
assert.ok(PAPER_PATCH.x>=0&&PAPER_PATCH.y>=PHRASE_BOUNDS.y+PHRASE_BOUNDS.height&&PAPER_PATCH.x+PAPER_PATCH.width<=FILM.width&&PAPER_PATCH.y+PAPER_PATCH.height<=FILM.height,'Background sample stays within the source, below the lettering.');
for(const values of [[0,0],[NaN,Infinity],[-1,-2]]) assert.ok(Number.isFinite(getFilmLayout(...values).scale));
assert.equal((await readdir(directory)).filter(file=>/^quadro-\d{3}\.webp$/.test(file)).length,FILM.frames);
console.log(JSON.stringify({result:'PASS',frames:FILM.frames,samples:10001,sequenceBytes:size,framingCases:viewports.length*2,checked:['deterministic reverse','all frames reachable','first/final hold','reduced motion poster frame','invalid progress','all WebP files','media budget','actual full-bleed geometry','whole phrase safe area','uniform aspect ratio']},null,2));
