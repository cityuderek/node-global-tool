const _ = require('lodash');
const { nfa, fileUtil } = require('node-fa/util');
var crlf = require('crlf');

const split = (str, seperator, targetLen) => {
  let strs = str.split(seperator);
  return fixArrLen(strs, targetLen, '');
};

const fixArrLen = (arr, targetLen, fillValue) => {
  if (arr.length > targetLen) {
    return arr.slice(0, targetLen);
  } else if (arr.length < targetLen) {
    return [...arr, ...Array(targetLen - arr.length).fill(fillValue)];
  }

  return arr;
};

const testPg = (connectionString) => {
  console.log(`testPg; connectionString=${connectionString}`);

  // testPostgres.js
  const { Client } = require('pg');

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  client
    .connect()
    .then(() => {
      console.log('Connected to PostgreSQL successfully!');
      return client.query('SELECT NOW(), version()');
      // return client.query('SELECT NOW()');
    })
    .then((result) => {
      console.log('Current time:', result.rows[0]);
    })
    .catch((err) => {
      console.error('Connection error:', err.stack);
    })
    .finally(() => {
      client.end();
    });
};

const checkMemory = () => {
  const v8 = require('v8');
  const heapStatistics = v8.getHeapStatistics();
  console.log(
    `Default max-old-space-size: ${
      heapStatistics.heap_size_limit / (1024 * 1024)
    } MB`
  );
  console.log(`` + JSON.stringify(heapStatistics, null, 2));
};

exports.execCmd = async (cmds, options) => {
  // console.log(`cmd=${cmd}`, options);
  const cmdGroup = cmds[0].toLowerCase();
  let { file, folder } = options;
  // console.log(nfa.nowDtmStr);
  let [mainCmd, subCmd] = split(cmdGroup, ':', 2);
  console.log(`mainCmd=${mainCmd}, subCmd=${subCmd}`);

  // let x = 'main';
  // let strs = x.split(':');
  // console.log(`strs`, strs);
  // console.log(`Array`, Array(2 - strs.length).fill(''));

  if (mainCmd === 'now') {
    console.log(nfa.nowDtmStr());
    Math.random();
  } else if (mainCmd === 'rand') {
    let min = nfa.gov(cmds, 0, 1);
    let max = nfa.gov(cmds, 1, 2);

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    console.log(rand(min, max));
  } else if (mainCmd === 'check-memory') {
    checkMemory();
    ////
  } else if (mainCmd === 'test-pg') {
    testPg(cmds[1]);
    ////
  } else if (mainCmd === 'randInt') {
    let min = nfa.gov(cmds, 0, 1);
    let max = nfa.gov(cmds, 1000000, 2);

    function randInt(min, max) {
      return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    }
    console.log(randInt(min, max));
    ////
  } else if (mainCmd === 'crlf') {
    if (!file && cmds.length > 1) {
      file = cmds[1];
    }
    // let ctt = await fileUtil.readFileSync(file);
    // console.log(`CRLF file=${file}`, ctt);
    if (subCmd === 'setlf') {
      crlf.set(file, 'LF', function (err, ending) {
        console.log(`file=${file} LF`);
      });
    } else if (subCmd === 'setcrlf') {
      crlf.set(file, 'CRLF', function (err, ending) {
        console.log(`file=${file} CRLF`);
      });
    } else if (subCmd === 'setcr') {
      crlf.set(file, 'CR', function (err, ending) {
        console.log(`file=${file} CR`);
      });
    } else {
      crlf.get(file, null, function (err, ending) {
        console.log(`file=${file}`, ending);
      });
    }
    ////
  } else if (mainCmd === 'version') {
    console.log(`1.0.2 2025-02-10`);
    ////
  } else {
    console.log(
      `Unsupportted command; cmd=${cmds.join(' ')}, options=`,
      options
    );
  }
};
