import { registerPlugin } from "@capacitor/core";

import type { MutePlugin } from "./definitions";

const Mute = registerPlugin<MutePlugin>("Mute", {
  web: () => import("./web").then((m) => new m.MuteWeb()),
});

export * from "./definitions";
export { Mute };
