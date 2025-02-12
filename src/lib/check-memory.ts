import v8 from 'v8';

export const checkMemory = () => {
  const heapStatistics = v8.getHeapStatistics();
  console.log(
    `Default max-old-space-size: ${
      heapStatistics.heap_size_limit / (1024 * 1024)
    } MB`
  );
  console.log(`` + JSON.stringify(heapStatistics, null, 2));
};
