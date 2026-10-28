/// <reference types="@webgpu/types" />

/** Asynchronous GPU timestamps. Never stall drawing waiting for a measurement. */
export class GpuTimer {
  private readonly queries: GPUQuerySet;
  private readonly resolve: GPUBuffer;
  private readonly readback: GPUBuffer;
  private busy = false;
  private disposed = false;

  constructor(private readonly device: GPUDevice) {
    this.queries = device.createQuerySet({ type: "timestamp", count: 4 });
    this.resolve = device.createBuffer({
      size: 32,
      usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
    });
    this.readback = device.createBuffer({
      size: 32,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
  }

  begin(): boolean {
    if (this.busy) return false;
    this.busy = true;
    return true;
  }
  start(): GPURenderPassTimestampWrites {
    return { querySet: this.queries, beginningOfPassWriteIndex: 0 };
  }
  end(): GPURenderPassTimestampWrites {
    return { querySet: this.queries, endOfPassWriteIndex: 1 };
  }
  bitmap(): GPURenderPassTimestampWrites {
    return {
      querySet: this.queries,
      beginningOfPassWriteIndex: 2,
      endOfPassWriteIndex: 3,
    };
  }
  encode(encoder: GPUCommandEncoder, bitmap: boolean): void {
    const count = bitmap ? 4 : 2;
    encoder.resolveQuerySet(this.queries, 0, count, this.resolve, 0);
    encoder.copyBufferToBuffer(this.resolve, 0, this.readback, 0, count * 8);
  }
  async read(
    bitmap: boolean,
  ): Promise<{ vectorMs: number; bitmapMs?: number } | undefined> {
    try {
      await this.readback.mapAsync(GPUMapMode.READ);
      if (this.disposed) return;
      const ns = new BigUint64Array(this.readback.getMappedRange());
      const result = {
        vectorMs: Number(ns[1] - ns[0]) / 1e6,
        bitmapMs: bitmap ? Number(ns[3] - ns[2]) / 1e6 : undefined,
      };
      this.readback.unmap();
      return result;
    } catch (error) {
      if (!this.disposed) throw error;
    } finally {
      this.busy = false;
    }
  }
  dispose(): void {
    this.disposed = true;
    this.queries.destroy();
    this.resolve.destroy();
    this.readback.destroy();
  }
}
