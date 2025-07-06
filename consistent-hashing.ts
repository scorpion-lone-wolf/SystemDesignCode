import { createHash } from "crypto";

class ConsistentHashing {
  private ring: Map<number, string>; // Hash ring: maps virtual node hash → physical server
  private servers: Set<string>; // Set of actual physical servers
  private nVirtualNodes: number; // Number of virtual nodes per physical server
  // Sorted list of hash values (virtual node positions) on the ring.
  // When we hash a key, we find the first hash in this list that is ≥ key's hash (clockwise search).
  // That hash maps to a server in the ring.
  private sortedKeys: number[];

  constructor(servers: string[], nVirtualNodes: number = 3) {
    this.servers = new Set();
    this.ring = new Map();
    this.nVirtualNodes = nVirtualNodes;
    this.sortedKeys = [];

    // Initialize the ring with the given servers
    for (const server of servers) {
      this.servers.add(server);
      this.addServer(server);
    }
  }

  /**
   * Computes a 32-bit hash for a given key using MD5.
   * MD5 produces a 128-bit hexadecimal string, but we extract the first 8 hex digits (32 bits).
   */
  private hash(key: string): number {
    const hash = createHash("md5").update(key).digest("hex"); // 128-bit hex string
    return parseInt(hash.substring(0, 8), 16); // First 8 hex chars = 32 bits (8 * 4), will always fit in a 32-bit unsigned integer
  }

  /**
   * Adds a physical server to the hash ring with its virtual nodes.
   * Each virtual node is uniquely identified by `${server}-${i}`.
   */
  public addServer(server: string): void {
    for (let i = 0; i < this.nVirtualNodes; i++) {
      const virtualNodeKey = `${server}-${i}`;
      const hash = this.hash(virtualNodeKey);
      this.ring.set(hash, server);
      this.sortedKeys.push(hash);
    }

    this.sortedKeys.sort((a, b) => a - b); // Keep keys sorted for efficient lookup
    this.servers.add(server);
  }

  /**
   * Removes a server and all its virtual nodes from the ring.
   */
  public removeServer(server: string): void {
    if (!this.servers.has(server)) return;

    this.servers.delete(server);

    for (let i = 0; i < this.nVirtualNodes; i++) {
      const virtualNodeKey = `${server}-${i}`;
      const hash = this.hash(virtualNodeKey);
      this.ring.delete(hash);
      this.sortedKeys = this.sortedKeys.filter(key => key !== hash);
    }
  }

  /**
   * Finds the closest server (clockwise) responsible for the given key.
   * If the hash exceeds all keys, wrap around to the first key (circular ring).
   */
  public getServer(key: string): string | undefined {
    const hash = this.hash(key);

    // Find first hash ≥ key’s hash (clockwise)
    const index = this.sortedKeys.findIndex(pos => pos >= hash);

    // If no such hash found, wrap to start of ring
    const targetIndex = index === -1 ? 0 : index;
    const serverHash = this.sortedKeys[targetIndex];
    return this.ring.get(serverHash);
  }
}

// Example usage:

const servers = ["S0", "S1", "S2", "S3", "S4"];
const ch = new ConsistentHashing(servers);

console.log("UserA ->", ch.getServer("UserA"));
console.log("UserB ->", ch.getServer("UserB"));

ch.addServer("S5");
console.log("After adding S5:");
console.log("UserA ->", ch.getServer("UserA"));
console.log("UserB ->", ch.getServer("UserB"));

ch.removeServer("S2");
console.log("After removing S2:");
console.log("UserA ->", ch.getServer("UserA"));
console.log("UserB ->", ch.getServer("UserB"));
