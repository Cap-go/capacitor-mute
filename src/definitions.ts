export interface MutePlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
