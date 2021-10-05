# tinypng-helper
一个基于 tinypng 的快捷图片压缩命令工具

# Install

```
npm install tinypng-helper -g
```

# configuration

需要先去 [tinypng](https://tinypng.com/developers/reference/nodejs) 申请一个 key， 在此设置

```shell
tinypng setkey (key)
```


# Usage

指定文件路径/文件夹路径

```shell
// 指定到文件
tinypng start /Users/xxx/Documents/work_space/other/resours/test.jpg
//  指定到文件夹
tinypng start /Users/xxx/Documents/work_space/other/resours
// 相对路径
tinypng start ./testpath/demo
```


当前目录运行

```shell
tinypng start
```