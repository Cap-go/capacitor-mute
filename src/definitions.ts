export interface MutePlugin {
  isMuted(): Promise<{ value: boolean }>;
}
