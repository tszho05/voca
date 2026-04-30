export const MAP_SIZE = {
  width: 2400,
  height: 1500,
};

export const MAP_BASE = {
  key: 'vocab-world-base',
  path: 'assets/map/vocab-world-base.png',
};

export type MapPropAsset = {
  key: string;
  path: string;
};

export type MapProp = {
  id: string;
  imageKey: string;
  x: number;
  y: number;
  w: number;
  h: number;
  sortY: number;
};

export type MapBlocker = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export const MAP_PROP_ASSETS: MapPropAsset[] = [
  { key: 'map-prop-forest-tree', path: 'assets/props/forest-tree/single-1.png' },
  { key: 'map-prop-mail-hut', path: 'assets/props/mail-hut/single-1.png' },
  { key: 'map-prop-moss-stone', path: 'assets/props/moss-stone/single-1.png' },
  { key: 'map-prop-town-cottage', path: 'assets/props/town-cottage/single-1.png' },
  { key: 'map-prop-lantern-post', path: 'assets/props/lantern-post/single-1.png' },
  { key: 'map-prop-round-well', path: 'assets/props/round-well/single-1.png' },
  { key: 'map-prop-ruin-pillar', path: 'assets/props/ruin-pillar/single-1.png' },
  { key: 'map-prop-broken-arch', path: 'assets/props/broken-arch/single-1.png' },
  { key: 'map-prop-moon-crystal', path: 'assets/props/moon-crystal/single-1.png' },
];

export const MAP_PROPS: MapProp[] = [
  { id: 'forest-tree-north-west', imageKey: 'map-prop-forest-tree', x: 110, y: 240, w: 176, h: 186, sortY: 240 },
  { id: 'forest-tree-north-road', imageKey: 'map-prop-forest-tree', x: 430, y: 240, w: 156, h: 166, sortY: 240 },
  { id: 'forest-tree-post-hut', imageKey: 'map-prop-forest-tree', x: 676, y: 450, w: 150, h: 160, sortY: 450 },
  { id: 'forest-tree-lower-left', imageKey: 'map-prop-forest-tree', x: 92, y: 1218, w: 176, h: 186, sortY: 1218 },
  { id: 'forest-tree-lower-road', imageKey: 'map-prop-forest-tree', x: 420, y: 1124, w: 156, h: 166, sortY: 1124 },
  { id: 'forest-tree-border', imageKey: 'map-prop-forest-tree', x: 700, y: 1310, w: 168, h: 178, sortY: 1310 },
  { id: 'mail-hut-forest', imageKey: 'map-prop-mail-hut', x: 555, y: 360, w: 190, h: 166, sortY: 360 },
  { id: 'moss-stone-forest-clearing', imageKey: 'map-prop-moss-stone', x: 198, y: 675, w: 122, h: 76, sortY: 675 },
  { id: 'moss-stone-forest-south', imageKey: 'map-prop-moss-stone', x: 612, y: 985, w: 118, h: 72, sortY: 985 },

  { id: 'town-cottage-upper-left', imageKey: 'map-prop-town-cottage', x: 950, y: 392, w: 190, h: 166, sortY: 392 },
  { id: 'town-cottage-upper-right', imageKey: 'map-prop-town-cottage', x: 1320, y: 390, w: 190, h: 166, sortY: 390 },
  { id: 'town-cottage-lower-left', imageKey: 'map-prop-town-cottage', x: 910, y: 1110, w: 202, h: 176, sortY: 1110 },
  { id: 'town-cottage-lower-right', imageKey: 'map-prop-town-cottage', x: 1452, y: 1118, w: 202, h: 176, sortY: 1118 },
  { id: 'round-well-plaza', imageKey: 'map-prop-round-well', x: 1150, y: 760, w: 156, h: 142, sortY: 760 },
  { id: 'lantern-post-west', imageKey: 'map-prop-lantern-post', x: 808, y: 772, w: 72, h: 146, sortY: 772 },
  { id: 'lantern-post-east', imageKey: 'map-prop-lantern-post', x: 1580, y: 760, w: 72, h: 146, sortY: 760 },
  { id: 'lantern-post-south', imageKey: 'map-prop-lantern-post', x: 1228, y: 1248, w: 72, h: 146, sortY: 1248 },

  { id: 'ruin-pillar-north-west', imageKey: 'map-prop-ruin-pillar', x: 1745, y: 362, w: 94, h: 160, sortY: 362 },
  { id: 'ruin-pillar-north-east', imageKey: 'map-prop-ruin-pillar', x: 2180, y: 378, w: 94, h: 160, sortY: 378 },
  { id: 'ruin-pillar-south-west', imageKey: 'map-prop-ruin-pillar', x: 1640, y: 1168, w: 104, h: 176, sortY: 1168 },
  { id: 'ruin-pillar-south-east', imageKey: 'map-prop-ruin-pillar', x: 2292, y: 1260, w: 104, h: 176, sortY: 1260 },
  { id: 'broken-arch-north', imageKey: 'map-prop-broken-arch', x: 2058, y: 458, w: 218, h: 176, sortY: 458 },
  { id: 'broken-arch-south', imageKey: 'map-prop-broken-arch', x: 1990, y: 1090, w: 222, h: 180, sortY: 1090 },
  { id: 'moon-crystal-boss-clearing', imageKey: 'map-prop-moon-crystal', x: 2110, y: 840, w: 132, h: 166, sortY: 840 },
];

export const MAP_BLOCKERS: MapBlocker[] = [
  { id: 'forest-tree-north-west-trunk', x: 84, y: 194, w: 52, h: 48 },
  { id: 'forest-tree-north-road-trunk', x: 407, y: 198, w: 46, h: 44 },
  { id: 'forest-tree-post-hut-trunk', x: 654, y: 406, w: 44, h: 44 },
  { id: 'forest-tree-lower-left-trunk', x: 66, y: 1172, w: 52, h: 48 },
  { id: 'forest-tree-lower-road-trunk', x: 397, y: 1080, w: 46, h: 44 },
  { id: 'forest-tree-border-trunk', x: 675, y: 1264, w: 50, h: 48 },
  { id: 'mail-hut-base', x: 470, y: 285, w: 170, h: 74 },

  { id: 'town-cottage-upper-left-base', x: 870, y: 314, w: 160, h: 76 },
  { id: 'town-cottage-upper-right-base', x: 1240, y: 312, w: 160, h: 76 },
  { id: 'town-cottage-lower-left-base', x: 824, y: 1028, w: 172, h: 80 },
  { id: 'town-cottage-lower-right-base', x: 1366, y: 1036, w: 172, h: 80 },
  { id: 'round-well-base', x: 1090, y: 692, w: 120, h: 66 },
  { id: 'lantern-post-west-base', x: 792, y: 738, w: 32, h: 36 },
  { id: 'lantern-post-east-base', x: 1564, y: 726, w: 32, h: 36 },
  { id: 'lantern-post-south-base', x: 1212, y: 1214, w: 32, h: 36 },

  { id: 'ruin-pillar-north-west-base', x: 1718, y: 326, w: 54, h: 36 },
  { id: 'ruin-pillar-north-east-base', x: 2153, y: 342, w: 54, h: 36 },
  { id: 'ruin-pillar-south-west-base', x: 1610, y: 1128, w: 60, h: 40 },
  { id: 'ruin-pillar-south-east-base', x: 2262, y: 1220, w: 60, h: 40 },
  { id: 'broken-arch-north-left-base', x: 1968, y: 392, w: 52, h: 64 },
  { id: 'broken-arch-north-right-base', x: 2096, y: 392, w: 52, h: 64 },
  { id: 'broken-arch-south-left-base', x: 1898, y: 1024, w: 54, h: 64 },
  { id: 'broken-arch-south-right-base', x: 2030, y: 1024, w: 54, h: 64 },
  { id: 'moon-crystal-base', x: 2056, y: 784, w: 108, h: 56 },
];
