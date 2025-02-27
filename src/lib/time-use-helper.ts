import { msToDisplayString } from './utils.js';

export class TimeUseHelper {
  private static timings: {
    [codeId: string]: { count: number; total: number };
  } = {};

  public static start(codeId: string): void {
    if (!this.timings[codeId]) {
      this.timings[codeId] = { count: 0, total: 0 };
    }
    (this.timings[codeId] as any).start = Date.now();
  }

  public static end(codeId: string): void {
    const timing = this.timings[codeId];
    if (timing && (timing as any).start) {
      const duration = Date.now() - (timing as any).start;
      timing.count += 1;
      timing.total += duration;
      delete (timing as any).start;
    }
  }

  public static show(): void {
    for (const [codeId, timing] of Object.entries(this.timings)) {
      const average = timing.total / timing.count;
      console.log(
        `CodeId: ${codeId}, Runs: ${timing.count}, Total ${msToDisplayString(
          timing.total
        )}, Average Time Use: ${msToDisplayString(average)}`
      );
    }
  }
}

// // Example usage:
// for (let i = 0; i < 100000; i++) {
//   TimeUseHelper.start('codeId1');
//   // Simulate executeSomething()
//   TimeUseHelper.end('codeId1');

//   TimeUseHelper.start('codeId2');
//   // Simulate executeSomething()
//   TimeUseHelper.end('codeId2');
// }

// TimeUseHelper.show();
