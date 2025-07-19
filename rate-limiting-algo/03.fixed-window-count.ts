class FixedWindowCount {
  private windowSize: number; // block window
  private currentWindow: number; // the window that was last processed
  private maxRequest: number;
  private currentRequestCount: number;

  constructor(wSize: number, mRequest: number) {
    this.windowSize = wSize;
    this.maxRequest = mRequest;
    this.currentWindow = Math.floor(Date.now() / 1000 / wSize);
    this.currentRequestCount = 0;
  }

  public isRequestAllowed(): boolean {
    const window = Math.floor(Date.now() / 1000 / this.windowSize);

    if (window !== this.currentWindow) {
      // this means new block has been started from last time it allowed
      this.currentRequestCount = 0;
      this.currentWindow = window;
    }
    if (this.currentRequestCount < this.maxRequest) {
      this.currentRequestCount++;
      return true;
    }
    return false;
  }
}
