import "https://deno.land/std@0.177.0/dotenv/load.ts";
import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";

const router = new Router();

router.get("/", (ctx) => {
  ctx.response.body = "Hello world!";
});

router.post("/podcast-note", async (ctx) => {
  const data = await ctx.request.body({ type: "json" }).value;

  console.log({ data });

  ctx.response.body = { data };
  ctx.response.status = 200;
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8080 });
