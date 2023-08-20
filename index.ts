import Koa, { Context, Request } from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import * as crypto from "crypto";
import { exec, execSync } from "child_process";

const app = new Koa();
const router = new Router();

const verify_signature = (ctx: Context) => {
  const signature = crypto
    .createHmac("sha256", "quE*#ax87u^DyE")
    .update(JSON.stringify(ctx.request.body))
    .digest("hex");
  return `sha256=${signature}` === ctx.headers["x-hub-signature-256"];
};

router.get("/", (ctx: Context) => {
  ctx.body = "Hello World";
});

router.post("/webhook", (ctx: Context) => {
  if (!verify_signature(ctx)) {
    ctx.status = 401;
    ctx.body = "Unauthorized";
    return;
  }
  if (ctx.request.body!["head_commit"]["message"] === "build") {
    console.log("build");
    // 获取仓库保存路径
    const dir = ctx.query.dir;
    // 获取仓库地址
    const repo = ctx.request.body!["repository"]["clone_url"];
    // 获取仓库名
    const repo_name = ctx.request.body!["repository"]["name"];
    // 获取仓库分支
    const repo_branch = ctx.request.body!["ref"].split("/")[2];
    (function deploy() {
      try {
        execSync(`npm run deploy ${repo} ${repo_name} ${repo_branch} ${dir}`);
      } catch (error) {
        console.log("递归执行");
        deploy();
      }
    })();
    ctx.body = "build";
    return;
  } else {
    console.log("not build");
    ctx.body = "not build";
    return;
  }
});

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
