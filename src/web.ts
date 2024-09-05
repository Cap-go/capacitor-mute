import { WebPlugin } from "@capacitor/core";

import type { MutePlugin, MuteResponse } from "./definitions";

export class MuteWeb extends WebPlugin implements MutePlugin {
  async isMuted(): Promise<MuteResponse> {
    throw new Error("Method not implemented.");
  }
}
