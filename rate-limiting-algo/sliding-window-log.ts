class SlidingWindowLog {
  private reqLog: Array<number>;
  private windowSize: number; // in sec
  private maxRequest: number; // allowed now of req per windowSize

  constructor(wSize: number, mReq: number) {
    this.windowSize = wSize;
    this.maxRequest = mReq;
    this.reqLog = [];
  }

  public isRequestAllowed() {
    const currTime = Date.now();

    while (this.reqLog.length > 0 && currTime - this.reqLog[0] > this.windowSize * 1000) {
      this.reqLog.shift();
    }
    if (this.reqLog.length < this.maxRequest) {
      this.reqLog.push(Date.now());
      return true;
    }

    return false;
  }
}
