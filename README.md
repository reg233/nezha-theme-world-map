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

[演示](https://jks.422000.xyz)

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

[演示](https://jks-tabs.422000.xyz)

## 主要改动

- 增加世界地图
- 默认背景图为必应每日壁纸
- 小鸡的主要信息以标签组形式显示
- 小鸡离线时卡片为灰色
- 增加网络图表
- 支持PWA，可安装到桌面或主屏幕

## 部署

本项目为纯前端，不依赖哪吒服务端渲染，所以需要一个新的站点

下载 [Release](https://github.com/reg233/nezha-theme-world-map/releases/latest) 到站点的对应目录并解压

样式一：nezha-theme-world-map.zip

样式二：nezha-theme-world-map-tabs.zip

在 `Nginx` 或 `Caddy` 的配置文件中反代路径 `/api/*` 和 `/ws` 到哪吒面板地址

### Nginx

暂无

### Caddy

```
example.com {
  root * /var/www/nezha-theme-world-map
  encode zstd gzip
  file_server

  @path {
    path /api/* /ws
  }

  reverse_proxy @path localhost:8008
}
```

## 自定义

### 修改标题

在 `index.html` 中搜索 `监控室` 并替换

### 修改背景图

在 `assets/index-xxxxxxxx.css` 中搜索 `https://imgapi.cn/bing.php` 并替换

### 隐藏地图

在 `assets/index-xxxxxxxx.css` 底部加入以下内容

#### 样式一

```css
.ant-collapse-item:first-child{display:none}
```

#### 样式二

```css
.ant-collapse{display:none}@media only screen and (max-width:767px){.tabs{padding:16px}}@media only screen and (min-width:768px){.tabs{padding:4% 8%}}
```

## 已知问题

小鸡数量超过 100 时样式一会出现明显卡顿，建议使用样式二

## 声明

地图数据来自 [TopoJSON](https://github.com/topojson/world-atlas)，如有异议，请自行替换 `countries-50m.json`
