class LeakyBucket {
  private bucketSize: number; // total size of request that can be added as queue.
  private consumptionRate: number; // how many req per second we can consume
  private currentReqSizeInQueue: number;
  private lastConsumeTime: number; // it tracks last time we have consume the consumptionRate number of req

  constructor(bSize: number, cRate: number) {
    this.bucketSize = bSize;
    this.consumptionRate = cRate;
    this.currentReqSizeInQueue = 0;
    this.lastConsumeTime = Date.now();
  }
  private calaculateRequestInBucketLeft() {
    const timePassedInSec = Math.floor((Date.now() - this.lastConsumeTime) / 1000);
    const totalConsumedfromLastTime = Math.floor(timePassedInSec * this.consumptionRate);
    if (totalConsumedfromLastTime >= 1) {
      this.currentReqSizeInQueue = Math.max(
        0,
        this.currentReqSizeInQueue - totalConsumedfromLastTime
      );
      this.lastConsumeTime = Date.now();
    }
  }

  public canProcessRequests(): boolean {
    this.calaculateRequestInBucketLeft();
    if (this.currentReqSizeInQueue < this.bucketSize) {
      this.currentReqSizeInQueue++;
      return true;
    }
    return false;
  }
}

const bucket = new LeakyBucket(5, 1); // bucketSize = 5, consumptionRate = 1 req/sec

let requestCount = 0;

const interval = setInterval(() => {
  requestCount++;
  const accepted = bucket.canProcessRequests();
  const time = new Date().toISOString().split("T")[1]; // just HH:MM:SS.mmm

  console.log(`[${time}] Request ${requestCount}: ${accepted ? "✅ Accepted" : "❌ Rejected"}`);

  if (requestCount >= 10) {
    clearInterval(interval);
    console.log("Test complete.");
  }
}, 300); // try sending one request every 300ms (faster than consumption rate)
