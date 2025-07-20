import { Hono } from 'hono'
// import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'
import { HTTPException } from 'hono/http-exception';

export const runtime = 'edge';

const app = new Hono().basePath('/api');

// app.use(
//   '*',
//   cors({
//     origin: '*',            // 允许所有来源
//     allowMethods: ['*'],   // 允许所有 HTTP 方法
//     allowHeaders: ['*'],    // 允许所有请求头
//     exposeHeaders: ['*'],  // 暴露所有响应头
//   })
// );

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello from Hono!',
  })
});

app.post('/test-post', (c) => {
  return c.json({
    message: 'Hello test post!!!!!',
  });
});

app.post('/get-github-access-token', async (c) => {
   try {
    // 1. 获取原始请求数据
    const originalBody = await c.req.json();

    // 2. 配置目标 API (以 JSONPlaceholder 为例)
    const targetUrl = 'https://github.com/login/oauth/access_token';
    
    // 3. 转发请求
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        ...c.req.header,
      },
      body: originalBody,
    });

    // 4. 处理目标 API 响应
    if (!response.ok) {
      const error = await response.text();
      throw new HTTPException(response.status as any, { message: error });
    }

    const result = await response.json();

    // 5. 返回目标 API 的响应
    return c.json({
      success: true,
      status: response.status,
      data: result
    });
  } catch (error) {
    console.error('Forwarding error:', error);
    if (error instanceof HTTPException) {
      return c.json({
        success: false,
        status: error.status,
        message: error.message
      }, error.status);
    }
    return c.json({
      success: false,
      status: 500,
      message: 'Internal server error'
    }, 500);
  }
});


export const GET = handle(app);

export const POST = handle(app);
