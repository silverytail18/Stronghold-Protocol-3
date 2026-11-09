"""Targeted official AudioClips via upstream UnityPy/LZ4AK; pinned upstream voice dumps for other dubs.

Requires requirements.txt plus imageio-ffmpeg==0.6.0 (MP3 encode/decode only).
Source client bundles are read-only. Never substitutes a base bank for a skin bank.
"""
import argparse
import array
import concurrent.futures
import hashlib
import io
import json
import os
from pathlib import Path
import re
import subprocess
import time
import urllib.request
import wave

import aklz4  # registers the upstream LZ4AK decoder
import UnityPy
import imageio_ffmpeg


def digest(data):
    return hashlib.sha256(data).hexdigest()


def ffmpeg(binary, args, data):
    return subprocess.run([binary, '-hide_banner', '-loglevel', 'error', '-threads', '1', *args],
                          input=data, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True).stdout


def verify_audio(binary, data):
    pcm = ffmpeg(binary, ['-i', 'pipe:0', '-map', '0:a:0', '-ac', '1', '-ar', '44100',
                          '-f', 's16le', 'pipe:1'], data)
    samples = array.array('h', pcm)
    seconds = len(samples) / 44100
    peak = max(map(abs, samples), default=0)
    if not 0.1 < seconds < 120 or not peak:
        raise ValueError(f'Invalid/empty battle voice: {seconds}s, peak={peak}')
    return {'decodedSeconds': round(seconds, 6), 'decodedPeak': peak, 'decodedPCMsha256': digest(pcm)}


def download(source):
    # Only media from the pinned repository discovered through GitHub's tree API.
    url = source['url']
    if not re.fullmatch(r'https://raw\.githubusercontent\.com/ArknightsAssets/ArknightsAssets2/[a-f0-9]{40}/assets/dyn/audio/sound_beta_2/voice(?:_en|_kr|_custom)?/[A-Za-z0-9_%#-]+/[A-Za-z0-9_]+\.mp3', url):
        raise ValueError('Unexpected remote voice source: ' + url)
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Stronghold-Protocol-skin-voice'})
            with urllib.request.urlopen(req, timeout=30) as response:
                data = response.read(8 * 1024 * 1024)
            git_hash = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
            if len(data) != source['size'] or git_hash != source['gitSha']:
                raise ValueError('Git tree size/hash mismatch: ' + url)
            return data
        except Exception:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)


def run(args):
    if os.name == 'nt':
        # Keep extraction/conversion below normal priority; all codecs are single-threaded.
        import ctypes
        ctypes.windll.kernel32.SetPriorityClass(ctypes.windll.kernel32.GetCurrentProcess(), 0x4000)
    root = args.root.resolve()
    plan = json.loads(args.plan.read_text(encoding='utf-8'))
    remote = json.loads(args.remote_sources.read_text(encoding='utf-8')) if args.remote_sources else {'files': []}
    binary = imageio_ffmpeg.get_ffmpeg_exe()
    public = root / 'public/assets/local'
    pending = remote['files']
    sources = {(s['voiceId'], s['language'], s['name']): s for s in pending}
    # Four network requests, then serial decode: avoid parallel codec CPU/memory load.
    downloaded = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        jobs = {pool.submit(download, source): source for source in pending}
        for i, job in enumerate(concurrent.futures.as_completed(jobs), 1):
            source = jobs[job]
            downloaded[(source['voiceId'], source['language'], source['name'])] = job.result()
            if i % 56 == 0:
                print(f'downloaded {i}/{len(pending)}', flush=True)
    result = {'format': 1, 'sources': plan['sources'], 'remoteRevision': remote.get('revision'),
              'encoder': 'libmp3lame VBR q3, source sample rate/channels; remote MP3 bytes preserved',
              'banks': []}
    for bank in plan['banks']:
        rec = {**bank, 'clips': []}
        result['banks'].append(rec)
        if not re.fullmatch(r'skins/voice/[a-z]+/[a-z0-9_-]+', bank['outputDir']):
            raise ValueError('Unsafe voice output directory')
        names = sorted(set(name for slot in bank['slots'].values() for name in slot))
        original = {}
        env = None
        if bank['language'] == 'cn':
            bundle = next((base / bank['directory'] / (bank['wordKey'].lower() + '.ab')
                           for base in args.bundle_root if (base / bank['directory'] / (bank['wordKey'].lower() + '.ab')).is_file()), None)
            if bundle is None:
                rec.update(status='absent', reason='local-bank-absent')
                continue
            rec['source'] = {'file': str(bundle), 'sha256': digest(bundle.read_bytes())}
            env = UnityPy.load(str(bundle))
            prefix = f"/{bank['directory']}/{bank['wordKey']}/".lower()
            for key, ref in env.container.items():
                if prefix not in key.lower() or ref.type.name != 'AudioClip':
                    continue
                clip = ref.read()
                if clip.m_Name not in names:
                    continue
                if clip.m_Name in original:
                    raise ValueError('Ambiguous clip: ' + clip.m_Name)
                samples = clip.samples
                if len(samples) != 1:
                    raise ValueError('Ambiguous decoded AudioClip')
                wav = next(iter(samples.values()))
                with wave.open(io.BytesIO(wav), 'rb') as reader:
                    seconds = reader.getnframes() / reader.getframerate()
                mp3 = ffmpeg(binary, ['-i', 'pipe:0', '-map', '0:a:0', '-c:a', 'libmp3lame', '-q:a', '3',
                                      '-map_metadata', '-1', '-write_xing', '0', '-id3v2_version', '0', '-f', 'mp3', 'pipe:1'], wav)
                original[clip.m_Name] = (mp3, {'wavSha256': digest(wav), 'sourceSeconds': seconds,
                                               'sourceRate': clip.m_Frequency, 'sourceChannels': clip.m_Channels})
        staged = []
        for name in names:
            if bank['language'] == 'cn':
                if name not in original:
                    raise ValueError(f"Missing AudioClip: {bank['voiceId']}/{name}")
                data, source = original[name]
            else:
                key = (bank['voiceId'], bank['language'], name)
                if key not in downloaded:
                    continue
                data, source = downloaded[key], sources[key]
            decoded = verify_audio(binary, data)
            if 'sourceSeconds' in source and abs(decoded['decodedSeconds'] - source['sourceSeconds']) > 0.15:
                raise ValueError('Transcoded voice duration mismatch')
            rel = bank['outputDir'] + '/' + name.lower() + '.mp3'
            target = public / rel
            if not target.resolve().is_relative_to(public.resolve()):
                raise ValueError('Voice escaped public assets root')
            if target.exists() and target.read_bytes() != data:
                raise ValueError('Refusing to replace different existing voice: ' + rel)
            staged.append((target, data))
            rec['clips'].append({'name': name, 'url': '/assets/local/' + rel, 'sha256': digest(data),
                                 'size': len(data), **decoded, 'source': source})
        # Publish a bank only once every selected clip has passed verification.
        for target, data in staged:
            target.parent.mkdir(parents=True, exist_ok=True)
            if not target.exists():
                target.write_bytes(data)
        rec['status'] = 'ready' if len(staged) == len(names) else 'partial' if staged else 'absent'
        print(bank['language'], bank['voiceId'], len(staged), rec['status'], flush=True)
        if env:
            del env
    args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'banks': len(result['banks']), 'clips': sum(len(b['clips']) for b in result['banks']),
                      'bytes': sum(c['size'] for b in result['banks'] for c in b['clips'])}), flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', required=True, type=Path)
    parser.add_argument('--plan', required=True, type=Path)
    parser.add_argument('--bundle-root', action='append', type=Path, default=[])
    parser.add_argument('--remote-sources', type=Path)
    parser.add_argument('--report', required=True, type=Path)
    run(parser.parse_args())
