# node-global-tool
Tools developed using Node which is for CLI use.

## Tools:
- CRLF
- Display current time

## Usage
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

## Setup
npm install -g node-global-tool