# Nezha Theme World Map

哪吒监控主题之世界地图，基于 [Amzayo](https://blog.amzayo.com) 设计的主题进行二次修改

## 效果图

### 样式一

#### 桌面端

![Desktop-1-1](/screenshots/desktop-1-1.png)

![Desktop-1-2](/screenshots/desktop-1-2.png)

![Desktop-1-3](/screenshots/desktop-1-3.png)

#### 移动端

<p>
  <img alt="Mobile-1-1" src="/screenshots/mobile-1-1.jpg" width="49%" />
  <img alt="Mobile-1-2" src="/screenshots/mobile-1-2.jpg" width="49%" />
</p>

[演示](https://jks-collapse.pages.dev)

### 样式二

#### 桌面端

![Desktop-2-1](/screenshots/desktop-2-1.png)

![Desktop-2-2](/screenshots/desktop-2-2.png)

![Desktop-2-3](/screenshots/desktop-2-3.png)

#### 移动端

<p>
  <img alt="Mobile-2-1" src="/screenshots/mobile-2-1.jpg" width="49%" />
  <img alt="Mobile-2-2" src="/screenshots/mobile-2-2.jpg" width="49%" />
</p>

[演示](https://jks-tabs.pages.dev)

## 主要改动

- 增加世界地图
- 默认背景图为必应每日壁纸
- 小鸡的主要信息以标签组形式显示
- 小鸡离线时卡片为灰色
- 增加网络图表
- 支持 PWA，可安装到桌面或主屏幕

## 部署

本项目为纯前端，不依赖哪吒服务端渲染，所以需要一个新的站点

### 手动

下载 [样式一](https://github.com/reg233/nezha-theme-world-map/releases/latest/download/nezha-theme-world-map.zip) 或 [样式二](https://github.com/reg233/nezha-theme-world-map/releases/latest/download/nezha-theme-world-map-tabs.zip) 到站点的对应目录并解压

在 `Nginx` 或 `Caddy` 的配置文件中反代路径 `/api/` 、 `/view-password` 、 `/ws` 到哪吒面板地址

#### Nginx

```
location ~ ^(/api/|/view-password) {
    proxy_pass http://localhost:8008;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /ws {
    proxy_pass http://localhost:8008;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

#### Caddy

反代本地

```
example.com {
    root * /var/www/nezha-theme-world-map
    encode zstd gzip
    file_server

    @path {
        path /api/* /ws /view-password
    }

    reverse_proxy @path localhost:8008
}
```

反代远程

```
example.com {
    root * /var/www/nezha-theme-world-map
    encode zstd gzip
    file_server

    @path {
        path /api/* /ws /view-password
    }

    reverse_proxy @path https://foobar.com {
        header_up Host {upstream_hostport}
        header_up -Origin
    }
}
```

### Cloudflare Pages

> [!WARNING]
> 暂不支持密码访问

下载 [样式一](https://github.com/reg233/nezha-theme-world-map/releases/latest/download/nezha-theme-world-map.zip) 或 [样式二](https://github.com/reg233/nezha-theme-world-map/releases/latest/download/nezha-theme-world-map-tabs.zip) 到本地并解压

在 `index.html` 旁边创建一个名为 `_worker.js` 的文件，将下面的代码粘贴进去，再修改第 1 行中的域名

<details>

<summary>_worker.js</summary>

```js
const domain = "example.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handleRequest(request);
    } else if (url.pathname.startsWith("/ws")) {
      return handleWebSocket(request);
    }

    return env.ASSETS.fetch(request);
  },
};

const handleRequest = async (request) => {
  const url = new URL(request.url);
  url.host = domain;

  const modifiedRequest = new Request(url.toString(), {
    headers: request.headers,
    method: request.method,
    body: request.body,
    redirect: "follow",
  });
  const response = await fetch(modifiedRequest);

  return new Response(response.body, response);
};

const handleWebSocket = async (request) => {
  const upgradeHeader = request.headers.get("Upgrade");
  if (upgradeHeader !== "websocket") {
    return new Response("Expected WebSocket", { status: 400 });
  }

  const webSocket = new WebSocket(`wss://${domain}/ws`);
  webSocket.addEventListener("message", (event) => {
    server.send(event.data);
  });

  const [client, server] = Object.values(new WebSocketPair());
  server.accept();
  server.addEventListener("message", (event) => {
    webSocket.send(event.data);
  });

  return new Response(null, { status: 101, webSocket: client });
};
```

</details>

然后在 Cloudflare Pages 创建页面中点击 `上传资产` 按钮将所有文件上传

## 自定义

### 修改标题

在 `index.html` 中搜索 `监控室` 并替换

### 修改背景图

在 `index.html` 中搜索 `https://imgapi.cn/bing.php` 并替换

### 隐藏地图

在 `assets/index-xxxxxxxx.css` 底部加入以下内容

#### 样式一

```css
.ant-collapse-item:first-child{display:none}
```

#### 样式二

```css
.ant-collapse{display:none}@media only screen and (max-width:701px){.tabs{padding:16px}}@media only screen and (min-width:702px){.tabs{padding:4% 16px}}
```

## 已知问题

小鸡数量超过 100 时样式一会出现明显卡顿，建议使用样式二

## 声明

地图数据来自 [TopoJSON](https://github.com/topojson/world-atlas)，如有异议，请自行替换 `countries-50m.json`
