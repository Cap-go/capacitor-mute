export interface MutePlugin {
  /**
   * check if the device is muted
   *
   */
  isMuted(): Promise<MuteResponse>;
}

export interface MuteResponse {
  value: boolean;
}
