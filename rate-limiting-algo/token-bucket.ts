class TokenBucket {
  private bucketSize: number; // maximum  no of token that bucket can hold
  private refillRate: number; // rate at which token will be added  per second e.g, 2 token per sec
  private tokens: number; // number of token available
  private lastRefillTime: number; // last time in millisecond when token was added

  constructor(bSize: number, rRate: number) {
    this.bucketSize = bSize;
    this.refillRate = rRate;
    this.tokens = this.refillRate;
    this.lastRefillTime = Date.now();
  }

  private refillBucket(): void {
    const currentTimeInMs = Date.now();
    const timePassedTillLastRefill = currentTimeInMs - this.lastRefillTime;
    // convert it to second
    const timeInSecond = Math.floor(timePassedTillLastRefill / 1000);
    const tokenToBeAdded = timeInSecond * this.refillRate;
    this.tokens = Math.min(this.bucketSize, this.tokens + tokenToBeAdded);
    // update the lastRefillTime to currentTimeInMs
    this.lastRefillTime = currentTimeInMs;
  }

  public canProcessRequests(requestCount: number = 1): boolean {
    // update the tokens
    this.refillBucket();

    if (this.tokens >= requestCount) {
      this.tokens -= requestCount;
      return true;
    }
    return false;
  }
}
