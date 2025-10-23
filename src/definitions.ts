export interface MutePlugin {
  /**
   * check if the device is muted
   *
   */
  isMuted(): Promise<MuteResponse>;
}

export interface MuteResponse {
  value: boolean;

  /**
   * Get the native Capacitor plugin version
   *
   * @returns {Promise<{ id: string }>} an Promise with version for this device
   * @throws An error if the something went wrong
   */
  getPluginVersion(): Promise<{ version: string }>;
}
