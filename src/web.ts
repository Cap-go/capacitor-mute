import { WebPlugin } from '@capacitor/core';

import type { MutePlugin } from './definitions';

export class MuteWeb extends WebPlugin implements MutePlugin {
  async isMuted(): Promise<{value: boolean}> {
    console.log('isMuted');
    throw new Error("Method not implemented.");
  }
}
