# node-global-tool

Tools developed using Node which is for CLI use.

## Tools:

- [check-memory](#check-memory) Check memory of node v8
- [test-pg](#test-pg) Test postgresql connection
- [now](#now) now Display current time
- [rand](#rand) rand Generate random float number
- [rand-int](#rand-int) rand-int Generate random integer number
- [CRLF](#CRLF) Check or set file if it contains LF/CR/CRLF.

## Usage:

### check-memory

```sh
ngt check-memory
```

Check memory of node v8 via heapStatistics

Example output

```
Default max-old-space-size: 4144 MB
{
  "total_heap_size": 17649664,
  "total_heap_size_executable": 524288,
  "total_physical_size": 17649664,
  "total_available_size": 4336030704,
  "used_heap_size": 9011528,
  "heap_size_limit": 4345298944,
  "malloced_memory": 524432,
  "peak_malloced_memory": 1042088,
  "does_zap_garbage": 0,
  "number_of_native_contexts": 2,
  "number_of_detached_contexts": 0,
  "total_global_handles_size": 8192,
  "used_global_handles_size": 2592,
  "external_memory": 2021759
}
```

### test-pg

Test postgresql connection string. Server must use SSL.

```sh
ngt test-pg postgres://postgres:xxxxxxxx@localhost/postgres
```

### now

Show current date and time

```sh
ngt now
```

### rand

Generate random float number with min value and max value

minValue <= output < maxValue

```sh
ngt rand
ngt rand 1 100
```

### rand-int

Generate random integer number with min value and max value

minValue <= output < maxValue

```sh
ngt rand-int
ngt rand-int 1 100
```

### CRLF

Check or set file if it contains LF/CR/CRLF.

Check if it contains LF/CR/CRLF.

```sh
ngt crlf fish.txt
```

Set file as LF.

```sh
ngt crlf fish.txt lf
```

Set file as CR.

```sh
ngt setcr fish.txt cr
```

Set file as CRLF.

```sh
ngt crlf fish.txt crlf
```

## Setup

```sh
npm install -g node-global-tool
```

## Test

```sh
ngt check-memory
```

<!--
## Pending features:

- test redis
- test mysql
- load .env
- Split log file by date

- dev
node ./dist/bin/index.js now
node ./dist/bin/index.js version
npm link

- test in another package
npm link node-global-tool

-->
