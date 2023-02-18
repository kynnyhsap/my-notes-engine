import "https://deno.land/std@0.177.0/dotenv/load.ts";
import { Router, Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";

const READWISE_API_KEY = Deno.env.get("READWISE_API_KEY");

const router = new Router();
router.get("/", (ctx) => {
  ctx.response.body = "Hello world!";
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8080 });
