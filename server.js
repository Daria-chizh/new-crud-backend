const http = require('http');
const Koa = require('koa');
const Router = require('koa-router');
const cors = require('koa2-cors');
const koaBody = require('koa-body');

const app = new Koa();

app.use(cors({ origin: '*' }));
app.use(koaBody({ json: true }));

let posts = [
  { id: 1, content: 'Post 1', created: '2021-01-01T10:00:00' },
  { id: 2, content: 'Post 2', created: '2021-03-01T10:00:00' }
];

let nextId = 3;

const router = new Router();

router.get('/posts', async (ctx, next) => {
  ctx.response.body = posts;
});

router.post('/posts', async(ctx, next) => {
  const {id, content} = ctx.request.body;

  if (id !== 0) {
    posts = posts.map(o => o.id !== id ? o : {...o, content: content});
    ctx.response.status = 204;
    return;
  }

  posts.push({...ctx.request.body, id: nextId++, created: Date.now()});
  ctx.response.status = 204;
});

router.delete('/posts/:id', async(ctx, next) => {
  const postId = Number(ctx.params.id);
  const index = posts.findIndex(o => o.id === postId);
  if (index !== -1) {
    posts.splice(index, 1);
  }
  ctx.response.status = 204;
});

router.get('/posts/:id', async (ctx) => {
  const postId = Number(ctx.params.id);
  ctx.response.body = posts.find(o => o.id === postId);
});

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 7777;
const server = http.createServer(app.callback());
server.listen(port, () => console.log('server started'));
