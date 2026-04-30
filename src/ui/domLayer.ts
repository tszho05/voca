import Phaser from 'phaser';

type Cleanup = () => void;

const cleanups: Cleanup[] = [];

function root() {
  const element = document.querySelector<HTMLDivElement>('#ui-root');
  if (!element) {
    throw new Error('Missing #ui-root element');
  }
  return element;
}

export function clearDomLayer() {
  while (cleanups.length > 0) {
    cleanups.pop()?.();
  }
  root().replaceChildren();
}

export function onSceneShutdown(scene: Phaser.Scene) {
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, clearDomLayer);
  scene.events.once(Phaser.Scenes.Events.DESTROY, clearDomLayer);
}

export function bindActivation(element: HTMLElement, handler: () => void) {
  let lastPointerAt = 0;

  const pointerHandler = (event: PointerEvent) => {
    event.preventDefault();
    lastPointerAt = Date.now();
    handler();
  };

  const clickHandler = (event: MouseEvent) => {
    event.preventDefault();
    if (Date.now() - lastPointerAt > 450) {
      handler();
    }
  };

  element.addEventListener('pointerup', pointerHandler);
  element.addEventListener('click', clickHandler);
  cleanups.push(() => {
    element.removeEventListener('pointerup', pointerHandler);
    element.removeEventListener('click', clickHandler);
  });
}

export function makeButton(label: string, className: string, handler: () => void) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  bindActivation(button, handler);
  return button;
}

export function createScreen() {
  clearDomLayer();
  const screen = document.createElement('section');
  screen.className = 'ui-screen';
  root().append(screen);
  return screen;
}

export function mountDomElement(element: HTMLElement) {
  root().append(element);
  return element;
}

export function createMenuCard(title: string, subtitle: string) {
  const card = document.createElement('div');
  card.className = 'menu-card';

  const heading = document.createElement('div');
  heading.className = 'game-title';

  const eyebrow = document.createElement('div');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = '小三中文詞語精靈冒險';

  const h1 = document.createElement('h1');
  h1.textContent = title;

  const support = document.createElement('p');
  support.className = 'support';
  support.textContent = subtitle;

  heading.append(eyebrow, h1, support);
  card.append(heading);
  return card;
}

export function createChoiceGrid() {
  const grid = document.createElement('div');
  grid.className = 'choice-grid';
  return grid;
}

export function createChoiceCard(title: string, detail: string, handler: () => void) {
  const button = makeButton('', 'choice-card', handler);
  const strong = document.createElement('strong');
  strong.textContent = title;
  const span = document.createElement('span');
  span.textContent = detail;
  button.append(strong, span);
  return button;
}

export function createHud(items: string[]) {
  const hud = document.createElement('div');
  hud.className = 'hud';
  items.forEach((item) => {
    const chip = document.createElement('div');
    chip.className = 'hud-chip';
    chip.textContent = item;
    hud.append(chip);
  });
  root().append(hud);
  return hud;
}

export function updateHud(hud: HTMLElement, items: string[]) {
  hud.replaceChildren();
  items.forEach((item) => {
    const chip = document.createElement('div');
    chip.className = 'hud-chip';
    chip.textContent = item;
    hud.append(chip);
  });
}

export function showToast(message: string) {
  const previous = root().querySelector('.toast');
  previous?.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  root().append(toast);
  return toast;
}

export function createTouchPad(onVector: (x: number, y: number) => void) {
  const pad = document.createElement('div');
  pad.className = 'touch-pad';

  const directions = [
    { label: '▲', className: 'touch-up', x: 0, y: -1 },
    { label: '◀', className: 'touch-left', x: -1, y: 0 },
    { label: '▶', className: 'touch-right', x: 1, y: 0 },
    { label: '▼', className: 'touch-down', x: 0, y: 1 },
  ];

  const stop = () => {
    pad.querySelectorAll('.active').forEach((element) => element.classList.remove('active'));
    onVector(0, 0);
  };

  directions.forEach((direction) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `touch-key ${direction.className}`;
    button.textContent = direction.label;
    button.setAttribute('aria-label', direction.label);

    const start = (event: PointerEvent) => {
      event.preventDefault();
      button.classList.add('active');
      onVector(direction.x, direction.y);
    };

    button.addEventListener('pointerdown', start);
    button.addEventListener('pointerup', stop);
    button.addEventListener('pointercancel', stop);
    button.addEventListener('pointerleave', stop);
    cleanups.push(() => {
      button.removeEventListener('pointerdown', start);
      button.removeEventListener('pointerup', stop);
      button.removeEventListener('pointercancel', stop);
      button.removeEventListener('pointerleave', stop);
    });

    pad.append(button);
  });

  const windowStop = () => stop();
  window.addEventListener('pointerup', windowStop);
  window.addEventListener('blur', windowStop);
  cleanups.push(() => {
    window.removeEventListener('pointerup', windowStop);
    window.removeEventListener('blur', windowStop);
  });
  cleanups.push(stop);

  root().append(pad);
  return pad;
}
