#!/usr/bin/env node

import commander = require('commander');
import parser = require('./parser');

let inputPath, outputPath;

commander.arguments('<input-path> <output-path>', )
    .action((inputPathArg, outputPathArg) => { 
        inputPath = inputPathArg;
        outputPath = outputPathArg;
    })
    .parse(process.argv);

if (typeof inputPath === 'undefined') {
    console.error('<input-path> argument is required, this should point to the root directory of your Angular 2+ application. See --help for more info.');
   process.exit(1);
}
if (typeof outputPath === 'undefined') {
   console.error('<outputPath> argument is required, this should point to a directory where the visualisation should be placed. See --help for more info.');
   process.exit(1);
}

new parser.Parser().parseNgModulesAndWriteToJson(inputPath, outputPath);