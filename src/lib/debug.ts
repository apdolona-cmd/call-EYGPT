// Debug helper for Firebase sync issues
export const DEBUG = {
  logs: [] as string[],

  log(msg: string, data?: any) {
    const timestamp = new Date().toLocaleTimeString('ar-EG');
    const fullMsg = `[${timestamp}] ${msg}`;
    console.log(fullMsg, data || '');
    this.logs.push(fullMsg);
    if (this.logs.length > 100) this.logs.shift();
  },

  error(msg: string, err?: any) {
    const timestamp = new Date().toLocaleTimeString('ar-EG');
    const fullMsg = `[${timestamp}] ❌ ${msg}`;
    console.error(fullMsg, err || '');
    this.logs.push(fullMsg);
    if (this.logs.length > 100) this.logs.shift();
  },

  success(msg: string, data?: any) {
    const timestamp = new Date().toLocaleTimeString('ar-EG');
    const fullMsg = `[${timestamp}] ✅ ${msg}`;
    console.log(fullMsg, data || '');
    this.logs.push(fullMsg);
    if (this.logs.length > 100) this.logs.shift();
  },

  getLogs(): string {
    return this.logs.join('\n');
  },

  exportLogs(): void {
    const data = this.getLogs();
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firebase-debug-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  },

  copyLogsToClipboard(): void {
    navigator.clipboard.writeText(this.getLogs()).then(() => {
      console.log('✅ Logs copied to clipboard');
    });
  }
};

// Make available in window for debugging
(window as any).DEBUG = DEBUG;
