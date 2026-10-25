import * as migration_20261025_081119_initial from './20261025_081119_initial';

export const migrations = [
  {
    up: migration_20261025_081119_initial.up,
    down: migration_20261025_081119_initial.down,
    name: '20261025_081119_initial'
  },
];
