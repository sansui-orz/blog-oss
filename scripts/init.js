const { Command } = require('commander');
const program = new Command();
// program.parse(process.argv);
const pkgs = program.args;

console.log('deploy 1.1: ', pkgs);