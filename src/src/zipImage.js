const path = require('path')
const inquirer = require('inquirer');
const ora = require('ora');
const tinify = require("tinify");
const fs = require('fs')
const fse = require('fs-extra')


const lstat = path => new Promise((resolve, reject) => {
  fs.lstat(path, (err, data) => { 
    if( err ) {
      return reject(err)
    }
    resolve(data)
  })
})



async function askUseImgInfoMultiple (imgs=[]) {
  const config = await inquirer.prompt([
    {
      type: "confirm",
      message: "是否压缩全部:",
      name: "isAll",
    },
    {
      type: "confirm",
      message: "是否替换原图:",
      name: "isReplace",
    },
    {
      type: "checkbox",
      message: "选择要压缩的图片:",
      name: "confirmImgs",
      when: function(answers) { // 当watch为true的时候才会提问当前问题
        return !answers.isAll
      },
      choices: imgs.map(img => ({ name: img }))
    }
  ])
  return config
}


// 单张图片是否替换
async function askSingleImg() {
  const config = await inquirer.prompt([
    {
      type: "confirm",
      message: "是否替换原图:",
      name: "isReplace",
    }
  ])
  return config
}


async function zipImage (filePath) {
  const config = require('../../config.json')

  tinify.key = config.tinypngkey

  if( !config.tinypngkey ) {
    throw new Error('使用填写 tinypng key 后使用')
  }

  const rule = /\.(png|svg|jpg|jpeg)$/

  try {
    const stat = await lstat(filePath)
    // 如果是图片
    if( stat.isFile() ) {

      if( !rule.test(filePath) ) {
        return console.error('非图片文件无法压缩！') 
      }

      const userAnswers = await askSingleImg()
      
      const baseName = path.basename(filePath)
      
      const spinner = ora('开始压缩～').start();
      const startTime = +new Date()
      try {
        spinner.text = `玩命压缩中.....`;
        // 发送至 tiny
        const source = await tinify.fromFile(filePath);
        // 是否替换
        if( userAnswers.isReplace ) {
          await source.toFile(filePath)
        } else {
          await fse.ensureDir(path.join(process.cwd(), 'tinypng'))
          await source.toFile(path.join(process.cwd(), `tinypng/${baseName}`))
        }

      }catch(e) {
        console.error(e)
      }

      const endTime = +new Date()
      const seconds = parseInt((endTime - startTime) / 1000) 

      spinner.succeed(`压缩完成！耗时:${seconds}秒   🎉 🎉 🎉`)

    }

    // 如果是文件夹
    if( stat.isDirectory() ) {
      var readDir = fs.readdirSync(filePath);

      const imgs = readDir.filter(file => rule.test(file))
      let waitTinyImgs = []

      const userAnswers = await askUseImgInfoMultiple(imgs)

      if( userAnswers.isAll ) {
        waitTinyImgs = imgs
      }else {
        waitTinyImgs = userAnswers.confirmImgs
      }

      const spinner = ora('开始压缩～').start();
      const startTime = +new Date()
      spinner.color = 'yellow';


      for(let i =0;i < waitTinyImgs.length; i++) {
        const _img = waitTinyImgs[i]
        const fullPath = path.join(filePath, _img)
        const baseName = path.basename(fullPath)
        try {
          spinner.text = `${(i + 1) }/${waitTinyImgs.length} 玩命压缩中.....`;
          const source = await tinify.fromFile(fullPath);
          // 是否替换
          if( userAnswers.isReplace ) {
            await source.toFile(fullPath)
          }else {
            await fse.ensureDir(path.join(filePath, 'tinypng'))
            await source.toFile(path.join(filePath, `tinypng/${baseName}`))
          }
        }catch(e) {
          console.error(e)
        }
      }

      const endTime = +new Date()
      const seconds = parseInt((endTime - startTime) / 1000) 
      spinner.succeed(`压缩完成！${waitTinyImgs.length}张图耗时:${seconds}秒   🎉 🎉 🎉`)

    }
  } catch(e) {
    console.log(e)
    console.error('该文件路径不存在！')
  }

}


module.exports = zipImage