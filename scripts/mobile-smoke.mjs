import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { get } from 'node:http';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const chromePath = process.env.CHROME_PATH ?? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const appUrl = process.env.APP_URL ?? 'http://127.0.0.1:5174';
const port = Number(process.env.CDP_PORT ?? 9333);
const profileDir = join(process.cwd(), '.tmp', `chrome-profile-${Date.now()}`);
const screenshotPath = join(process.cwd(), 'test-output', 'mobile-smoke.png');

async function fetchJson(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const request = get(url, { method }, (response) => {
      let body = '';
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });
    request.on('error', reject);
  });
}

async function waitForCdpEndpoint() {
  for (let i = 0; i < 50; i += 1) {
    try {
      await fetchJson(`http://127.0.0.1:${port}/json/version`);
      return;
    } catch {
      await delay(120);
    }
  }
  throw new Error('Chrome DevTools Protocol did not become available.');
}

async function createAppTarget() {
  const target = await fetchJson(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(appUrl)}`, 'PUT');
  if (!target.webSocketDebuggerUrl) {
    throw new Error('Could not create an app target for mobile smoke testing.');
  }
  return target.webSocketDebuggerUrl;
}

function createCdpClient(wsUrl, protocolEvents) {
  const socket = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) {
      if (message.method === 'Runtime.exceptionThrown') {
        protocolEvents.push(message.params.exceptionDetails.text);
      }
      if (message.method === 'Runtime.consoleAPICalled') {
        protocolEvents.push(message.params.args.map((arg) => arg.value ?? arg.description).join(' '));
      }
      return;
    }
    const entry = pending.get(message.id);
    if (!entry) return;
    pending.delete(message.id);
    if (message.error) {
      entry.reject(new Error(message.error.message));
    } else {
      entry.resolve(message.result);
    }
  });

  const ready = new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  return {
    async send(method, params = {}) {
      await ready;
      const id = nextId;
      nextId += 1;
      socket.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
      });
    },
    close() {
      socket.close();
    },
  };
}

async function main() {
  await mkdir(join(process.cwd(), '.tmp'), { recursive: true });
  await mkdir(join(process.cwd(), 'test-output'), { recursive: true });

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    '--window-size=390,844',
    appUrl,
  ], { stdio: 'ignore' });

  try {
    await waitForCdpEndpoint();
    const wsUrl = await createAppTarget();
    const protocolEvents = [];
    const cdp = createCdpClient(wsUrl, protocolEvents);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });
    await cdp.send('Page.navigate', { url: appUrl });
    await delay(1200);

    const evalJs = async (expression) => {
      const result = await cdp.send('Runtime.evaluate', {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (result.exceptionDetails) {
        throw new Error(result.exceptionDetails.text);
      }
      return result.result.value;
    };

    const clickText = async (text) => {
      for (let i = 0; i < 30; i += 1) {
        const clicked = await evalJs(`
          (() => {
            const target = [...document.querySelectorAll('button')].find((button) => button.textContent.includes(${JSON.stringify(text)}));
            if (!target) return false;
            target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch' }));
            target.click();
            return true;
          })()
        `);
        if (clicked) return;
        await delay(150);
      }
      const bodyText = await evalJs(`document.body.innerText`);
      const html = await evalJs(`document.documentElement.outerHTML.slice(0, 500)`);
      throw new Error(`Could not click button containing: ${text}. Body text: ${bodyText}. HTML: ${html}. Events: ${protocolEvents.join(' | ')}`);
    };

    const waitFor = async (expression, label) => {
      for (let i = 0; i < 40; i += 1) {
        if (await evalJs(expression)) return;
        await delay(150);
      }
      throw new Error(`Timed out waiting for ${label}`);
    };

    const buttonHeights = await evalJs(`
      [...document.querySelectorAll('button')].map((button) => Math.round(button.getBoundingClientRect().height))
    `);
    if (!buttonHeights.every((height) => height >= 56)) {
      throw new Error(`Initial buttons below 56px: ${buttonHeights.join(', ')}`);
    }

    await clickText('簡單');
    await delay(300);
    await clickText('[角色三]');
    await waitFor(`document.querySelectorAll('.touch-key').length === 4`, 'DOM touch pad');

    const touchHeights = await evalJs(`
      [...document.querySelectorAll('.touch-key')].map((button) => Math.round(button.getBoundingClientRect().height))
    `);
    if (!touchHeights.every((height) => height >= 56)) {
      throw new Error(`Touch buttons below 56px: ${touchHeights.join(', ')}`);
    }

    await evalJs(`
      (() => {
        const up = document.querySelector('.touch-up');
        if (up) up.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }));
      })()
    `);
    await delay(1300);
    await evalJs(`
      (() => {
        const up = document.querySelector('.touch-up');
        if (up) up.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch' }));
      })()
    `);

    await waitFor(`Boolean(document.querySelector('.battle-panel'))`, 'battle panel after DOM movement');
    await clickText('首字提示');

    const hint = await evalJs(`document.querySelector('.feedback')?.textContent ?? ''`);
    if (hint.trim() !== '首字提示：寧') {
      throw new Error(`Scholar hint should reveal only the first character; got "${hint}"`);
    }

    await clickText('寧靜');
    await clickText('確認答案');
    await waitFor(`document.querySelectorAll('.touch-key').length === 4 && !document.querySelector('.battle-panel')`, 'return to map with clean DOM controls');

    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    await writeFile(screenshotPath, Buffer.from(screenshot.data, 'base64'));
    cdp.close();
    console.log(`Mobile smoke test passed. Screenshot: ${screenshotPath}`);
  } finally {
    chrome.kill();
    await new Promise((resolve) => {
      chrome.once('exit', resolve);
      setTimeout(resolve, 1000);
    });
    await rm(profileDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
