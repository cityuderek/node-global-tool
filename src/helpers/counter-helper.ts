class CounterHelper {
  name: string = '';
  counters: { [key in string]: number } = {};

  constructor(name = 'Counter') {
    this.name = name;
    this.clear();
  }

  static test() {
    let counterHelper = new CounterHelper();
    counterHelper.add('main', 11);
    counterHelper.add('main', 22);
    counterHelper.add('ffff', 33);
    counterHelper.add('ffff', 44);
    console.log(`getCounters=`, counterHelper.getCounters());
    console.log(`getCounter.main=`, counterHelper.getCounter('main'));
    console.log(`getCounter.xxx=`, counterHelper.getCounter('xxx'));
  }

  add(key: string = 'main', count: number = 1): number {
    if (!this.counters[key]) {
      this.counters[key] = count;
    } else {
      this.counters[key] += count;
    }
    return this.counters[key];
  }

  resultToString(delimiter = '='): string {
    let str = `${this.name}\r\n`;
    const keys = Object.keys(this.counters);
    if (keys.length > 0) {
      Object.keys(this.counters)
        .sort()
        .forEach((key) => {
          str += `${key}${delimiter}${this.counters[key]}\r\n`;
        });
    } else {
      str = `${this.name} empty\r\n`;
    }
    return str;
  }

  show(delimiter = '='): void {
    let str = this.resultToString(delimiter);
    console.log(str);
  }

  getCounters(): { [key in string]: number } {
    return this.counters;
  }

  getCounter(key = 'main'): number {
    return this.counters[key] ? this.counters[key] : 0;
  }

  clear(): void {
    this.counters = {};
  }
}

export default CounterHelper;
