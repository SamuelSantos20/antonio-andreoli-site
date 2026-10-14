import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { getFilmFrame, getFilmFrameUrl, getFilmCrop, FILM } from '../src/data/filmMotion.ts';

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
for(const mobile of [false,true]) {
 const crop=getFilmCrop(mobile);
 assert.ok(crop.x>=0&&crop.y>=0&&crop.width>0&&crop.height>0);
 assert.ok(crop.x+crop.width<=FILM.width&&crop.y+crop.height<=FILM.height);
 // Final lettering occupies approximately x=270..750 and y=178..376 in the supplied film.
 assert.ok(crop.x<=270&&crop.x+crop.width>=750&&crop.y<=178&&crop.y+crop.height>=376,'The crop must preserve the whole phrase.');
 assert.ok(Math.abs(crop.width/crop.height-16/9)<.01);
}
assert.equal((await readdir(directory)).filter(file=>/^quadro-\d{3}\.webp$/.test(file)).length,FILM.frames);
console.log(JSON.stringify({result:'PASS',frames:FILM.frames,samples:10001,sequenceBytes:size,checked:['deterministic reverse','all frames reachable','first/final hold','reduced motion poster frame','invalid progress','all WebP files','media budget','mobile lettering crop']},null,2));
