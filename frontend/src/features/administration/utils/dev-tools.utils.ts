/** Whether demo data dev tools should be shown in the UI. */
export function isDevToolsEnabled(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true'
}
