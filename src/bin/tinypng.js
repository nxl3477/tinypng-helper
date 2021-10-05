#!/usr/bin/env node

const program = require('commander')
const inquirer = require('inquirer');
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const zipImage = require('../src/zipImage')



program.on('--help', () => { 
  console.log('    $ tinypng [path]')
  console.log()
})

program.version('0.0.1')



program
  .command('start [relativePath]')
  .action(function (relativePath, cmd) {
    const filePath = relativePath ? path.resolve(process.cwd(), relativePath) : process.cwd()
    zipImage(filePath)
  }); 

  
program
  .command('setkey [tinyKey]')
  .action(function (tinyKey) {
    let _config = {}
    try {
      const curConfig = fs.readFileSync(path.join(__dirname, '../../config.json'))
      Object.assign(_config, { tinypngkey: "" }, JSON.parse(curConfig.toString()))
    } catch(e) {
      
    }
    _config.tinypngkey = tinyKey
    
    fs.writeFileSync(path.join(__dirname, '../../config.json'), JSON.stringify(_config, null, 2) )
  })


program.parse(process.argv);

