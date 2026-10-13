// Build the small, dependency-free Android client using the official SDK tools.
// Optional fixed resource pack; never bundle server credentials or player state.
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const android = path.join(root, 'mobile', 'android');
const source = path.join(android, 'app', 'src', 'main');
const cache = path.join(root, '.cache');
const win = process.platform === 'win32';
const args = process.argv.slice(2);let sdkArgument,embed=false;
for(let i=0;i<args.length;i++){if(args[i]==='--embed-resources')embed=true;else if(args[i]==='--sdk'&&args[i+1])sdkArgument=args[++i];else throw new Error('用法：npm run mobile:build -- [--sdk <SDK 路径>] [--embed-resources]');}
const sdk = path.resolve(sdkArgument || process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || path.join(cache, 'android-sdk'));
const buildTools = path.join(sdk, 'build-tools', '35.0.0');
const platform = path.join(sdk, 'platforms', 'android-35', 'android.jar');
const tool = (name) => path.join(buildTools, name + (win ? '.exe' : ''));
const javaTool = (name) => {const executable=process.env.JAVA_HOME&&path.join(process.env.JAVA_HOME, 'bin', name + (win ? '.exe' : ''));return executable&&existsSync(executable)?executable:name;};

function run(command, parameters, env = process.env) {
  const result = spawnSync(command, parameters, { cwd: root, env, encoding: 'utf8', windowsHide: true, maxBuffer: 8 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`${path.basename(command)} 执行失败：${result.error?.message || result.stderr || result.stdout}`);
  if (result.stderr.trim()) process.stderr.write(result.stderr);
  return result.stdout;
}

async function files(directory, extension) {
  const result = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(full, extension));
    else if (entry.name.endsWith(extension)) result.push(full);
  }
  return result;
}

async function build() {
  for (const filename of [platform, tool('aapt2'), tool('zipalign'), path.join(buildTools, 'lib', 'd8.jar'), path.join(buildTools, 'lib', 'apksigner.jar')]) {
    try { await fs.access(filename); }
    catch { throw new Error(`缺少 Android SDK 工具：${filename}\n安装 platforms;android-35 和 build-tools;35.0.0，并设置 ANDROID_HOME；详见 docs/MOBILE.md。`); }
  }
  await fs.mkdir(cache, { recursive: true });
  const work = await fs.mkdtemp(path.join(cache, 'android-build-'));
  try {
    const generated = path.join(work, 'generated');
    const classes = path.join(work, 'classes');
    const dex = path.join(work, 'dex');
    for (const folder of [generated, classes, dex]) await fs.mkdir(folder);
    const manifest = path.join(work, 'AndroidManifest.xml');
    const original = await fs.readFile(path.join(source, 'AndroidManifest.xml'), 'utf8');
    await fs.writeFile(manifest, original.replace('<manifest ', '<manifest package="io.stronghold.protocol" '));
    const version = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8')).version;
    const versionCode = (await fs.readFile(path.join(android, 'app', 'build.gradle'), 'utf8')).match(/\bversionCode\s+(\d+)/)?.[1];
    if(!versionCode)throw new Error('缺少安卓 versionCode');
    const unsigned = path.join(work, 'unsigned.apk');
    const assetArguments=[];
    if(embed){
      const {buildResourcePack}=await import('./build-resource-pack.mjs');const pack=await buildResourcePack();const bundled=path.join(work,'assets');await fs.mkdir(bundled);
      await fs.copyFile(path.join(root,'resource-packs',pack.archive.sha256+'.zip'),path.join(bundled,'resource-pack.zip'));
      await fs.copyFile(path.join(root,'resource-packs',pack.version+'.json'),path.join(bundled,'resource-catalog.json'));
      assetArguments.push('-A',bundled,'-0','zip');
    }
    run(tool('aapt2'), ['compile', '--dir', path.join(source, 'res'), '-o', path.join(work, 'resources.zip')]);
    run(tool('aapt2'), ['link', '-o', unsigned, '--manifest', manifest, '-I', platform, '--java', generated,
      '--min-sdk-version', '26', '--target-sdk-version', '35', '--version-code', versionCode, '--version-name', version, ...assetArguments,path.join(work, 'resources.zip')]);
    run(javaTool('javac'), ['-encoding', 'UTF-8', '-Xlint:-options', '--release', '8', '-classpath', platform, '-d', classes,
      ...await files(path.join(source, 'java'), '.java'), ...await files(generated, '.java')]);
    run(javaTool('java'), ['-cp', path.join(buildTools, 'lib', 'd8.jar'), 'com.android.tools.r8.D8', '--release', '--min-api', '26', '--lib', platform, '--output', dex, ...await files(classes, '.class')]);
    run(javaTool('jar'), ['uf', unsigned, '-C', dex, 'classes.dex']);
    const aligned = path.join(work, 'aligned.apk');
    run(tool('zipalign'), ['-f', '4', unsigned, aligned]);

    const signing = path.join(android, '.signing');
    const key = path.join(signing, 'release.p12');
    const credentialsFile = path.join(signing, 'credentials.json');
    await fs.mkdir(signing, { recursive: true, mode: 0o700 });
    let credentials;
    try { credentials = JSON.parse(await fs.readFile(credentialsFile, 'utf8')); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      try { await fs.access(key); throw new Error('签名密钥已存在，但缺少 credentials.json；请恢复签名文件备份。'); }
      catch (keyError) { if (keyError.code !== 'ENOENT') throw keyError; }
      credentials = { password: randomBytes(32).toString('hex') };
      await fs.writeFile(credentialsFile, JSON.stringify(credentials) + '\n', { mode: 0o600, flag: 'wx' });
    }
    if (typeof credentials.password !== 'string' || !/^[a-f0-9]{64}$/.test(credentials.password)) throw new Error('签名配置无效，请恢复 .signing 备份。');
    const signingEnv = { ...process.env, SP_ANDROID_KEY_PASS: credentials.password };
    try { await fs.access(key); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      run(javaTool('keytool'), ['-genkeypair', '-keystore', key, '-storetype', 'PKCS12', '-alias', 'stronghold', '-keyalg', 'RSA', '-keysize', '3072',
        '-validity', '3650', '-dname', 'CN=Stronghold Protocol Private Server', '-storepass:env', 'SP_ANDROID_KEY_PASS', '-keypass:env', 'SP_ANDROID_KEY_PASS', '-noprompt'], signingEnv);
      await fs.chmod(key, 0o600);
    }
    const signed = path.join(work, 'signed.apk');
    run(javaTool('java'), ['-jar', path.join(buildTools, 'lib', 'apksigner.jar'), 'sign', '--ks', key, '--ks-key-alias', 'stronghold',
      '--ks-pass', 'env:SP_ANDROID_KEY_PASS', '--key-pass', 'env:SP_ANDROID_KEY_PASS', '--out', signed, aligned], signingEnv);
    run(javaTool('java'), ['-jar', path.join(buildTools, 'lib', 'apksigner.jar'), 'verify', '--verbose', signed]);
    run(tool('zipalign'), ['-c', '4', signed]);
    const output = path.join(root, 'mobile', embed ? 'full-dist' : 'dist');
    await fs.mkdir(output, { recursive: true });
    const name=embed?'stronghold-protocol-full.apk':'stronghold-protocol.apk';
    const apk = path.join(output,name);
    await fs.rename(signed, apk);
    const checksum = createHash('sha256').update(await fs.readFile(apk)).digest('hex');
    await fs.writeFile(apk + '.sha256', `${checksum}  ${name}\n`);
    console.log(`APK 已构建并验证签名：${apk}\nSHA-256: ${checksum}\n安装后填写 http://公网IP:3000。请备份 mobile/android/.signing/，后续更新需要同一签名。`);
  } finally {
    // Only remove this script's newly created directory inside the repository cache.
    if (path.resolve(work).startsWith(path.resolve(cache) + path.sep) && path.basename(work).startsWith('android-build-')) await fs.rm(work, { recursive: true, force: true });
  }
}

build().catch((error) => { console.error(error.message); process.exitCode = 1; });
