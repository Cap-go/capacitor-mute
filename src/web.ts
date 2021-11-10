import { WebPlugin } from '@capacitor/core';

import type { MutePlugin } from './definitions';

export class MuteWeb extends WebPlugin implements MutePlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
