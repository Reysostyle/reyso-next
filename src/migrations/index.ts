import * as migration_20261025_081119_initial from './20261025_081119_initial';
import * as migration_20261025_094645_sms_login from './20261025_094645_sms_login';
import * as migration_20261025_103443_orders_payments from './20261025_103443_orders_payments';

export const migrations = [
  {
    up: migration_20261025_081119_initial.up,
    down: migration_20261025_081119_initial.down,
    name: '20261025_081119_initial',
  },
  {
    up: migration_20261025_094645_sms_login.up,
    down: migration_20261025_094645_sms_login.down,
    name: '20261025_094645_sms_login',
  },
  {
    up: migration_20261025_103443_orders_payments.up,
    down: migration_20261025_103443_orders_payments.down,
    name: '20261025_103443_orders_payments'
  },
];
