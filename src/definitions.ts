/**
 * Capacitor Mute Plugin for detecting device mute status.
 *
 * @since 1.0.0
 */
export interface MutePlugin {
  /**
   * Check if the device mute switch is enabled.
   *
   * @returns Promise that resolves with the mute status
   * @throws Error if checking mute status fails
   * @since 1.0.0
   * @example
   * ```typescript
   * const { value } = await Mute.isMuted();
   * if (value) {
   *   console.log('Device is muted');
   * } else {
   *   console.log('Device is not muted');
   * }
   * ```
   */
  isMuted(): Promise<MuteResponse>;

  /**
   * Get the native Capacitor plugin version.
   *
   * @returns Promise that resolves with the plugin version
   * @throws Error if getting the version fails
   * @since 1.0.0
   * @example
   * ```typescript
   * const { version } = await Mute.getPluginVersion();
   * console.log('Plugin version:', version);
   * ```
   */
  getPluginVersion(): Promise<{ version: string }>;
}

/**
 * Response from mute status check.
 *
 * @since 1.0.0
 */
export interface MuteResponse {
  /** True if device is muted, false otherwise */
  value: boolean;
}
