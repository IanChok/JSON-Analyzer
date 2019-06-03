const parser = require("./parser/parser_main");
const fs = require('fs');
let tempData = fs.readFileSync('./sample-json/transaction.json');

parser('{"and": ["field"]}', '{"field": 1}');

parser('{"and": ["status"]}', tempData);

parser('{"and": ["status", "winners"]}', tempData);

