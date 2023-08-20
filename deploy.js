#!/usr/bin/env zx

const args = process.argv.slice(3);
console.log(args);
const repo = args[0];
const repo_name = args[1];
const repo_branch = args[2];
const dir = args[3];

cd(`${dir}`);
await $`pwd`;

// 判断是否存在文件夹
if (!fs.existsSync(`./${repo_name}`)) {
  await $`git clone ${repo}`;
}

cd(`./${repo_name}`);
await $`pwd`;

await $`git pull origin ${repo_branch}`;

await $`npm install`;
await $`npm run build`;

// 递归移动文件到上一级目录
await $`rsync -r ./dist ../`;
echo("部署完成");
