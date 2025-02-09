<!--
node ./bin/index.js now
node ./bin/index.js version
-->

# node-global-tool

Tools developed using Node which is for CLI use.

## Tools:

- check-memory
- test-pg
- CRLF
- Display current time

## Usage:

### check-memory

```sh
ngt check-memory
```

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

### CRLF

Check or set file if it contains LF/CR/CRLF.

Check if it contains LF/CR/CRLF.

```sh
ngt crlf fish.txt
```

Set file as LF.

```sh
ngt crlf:setlf fish.txt
```

Set file as CR.

```sh
ngt crlf:setcr fish.txt
```

Set file as CRLF.

```sh
ngt crlf:setcrlf fish.txt
```

### Display current time

Show current date and time

```sh
ngt now
```

## Pending features:

- Split log file by date

## Setup:

```sh
npm install -g node-global-tool
```
