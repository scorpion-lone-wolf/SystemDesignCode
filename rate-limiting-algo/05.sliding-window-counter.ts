class SlidingWindowCounter {
  private windowSize; // in sec
  private maxRequest; // max req in second
  private currentWindow: number; // currentWindow time bucket
  private currReqCount: number; // current window req count
  private prevReqCount: number; // prev window req count
  constructor(windowSize: number, maxRequest: number) {
    this.windowSize = windowSize;
    this.maxRequest = maxRequest;
    this.currentWindow = Math.floor(Date.now() / 1000 / windowSize);
    this.currReqCount = 0;
    this.prevReqCount = 0;
  }

  public allowRequest() {
    const nowInSecond = Date.now() / 1000;

    // find which window is currently running
    const window = Math.floor(nowInSecond / this.windowSize);

    if (window !== this.currentWindow) {
      this.prevReqCount = this.currReqCount;
      this.currReqCount = 0;
      this.currentWindow = window;
    }
    const elapsedFraction = (nowInSecond % this.windowSize) / this.windowSize;

    const threshold = (1 - elapsedFraction) * this.prevReqCount + this.currReqCount;

    if (threshold < this.maxRequest) {
      this.currReqCount++;
      return true;
    }
    return false;
  }
}
