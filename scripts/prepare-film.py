"""Prepare the supplied film as reversible, silent WebP frames.
Optional tooling: pip install imageio-ffmpeg pillow
Run: python scripts/prepare-film.py /absolute/path/to/source.mp4
The app itself does not require Python.
"""
from pathlib import Path
import argparse
import json
import subprocess
import imageio_ffmpeg
from PIL import Image

parser=argparse.ArgumentParser()
parser.add_argument('video',type=Path)
args=parser.parse_args()
source=args.video.resolve()
if not source.is_file():
    parser.error('The source video does not exist.')
root=Path(__file__).resolve().parents[1]
out=root/'public'/'media'/'escrita'
out.mkdir(parents=True,exist_ok=True)
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
common=[ffmpeg,'-y','-hide_banner','-loglevel','error']
subprocess.run(common+['-i',str(source),'-vf','trim=start=0.4,setpts=(PTS-STARTPTS)*8/7.6,fps=16,scale=960:540','-frames:v','128','-c:v','libwebp','-quality','78',str(out/'quadro-%03d.webp')],check=True)
for name,time,width,height,quality in [('inicio.webp','0.4',960,540,'82'),('final.webp','7.92',1280,720,'85')]:
    subprocess.run(common+['-ss',time,'-i',str(source),'-frames:v','1','-vf',f'scale={width}:{height}','-quality',quality,str(out/name)],check=True)
files=[out/f'quadro-{index:03d}.webp' for index in range(1,129)]
for file in files:
    with Image.open(file) as image:
        image.load()
        assert image.size==(960,540)
manifest={
 'source':source.name,'duration':8,'sourceFps':24,'sampleFps':16,
 'frames':128,'width':960,'height':540,'phrase':'Direito com clareza.',
 'sequenceBytes':sum(file.stat().st_size for file in files),
 'audioIncluded':False,'sourceTrimStart':0.4,'sourceUsedDuration':7.6
}
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(manifest,ensure_ascii=False,indent=2))
