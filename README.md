# Nezha Theme World Map

哪吒监控主题之世界地图，基于 [Amzayo](https://blog.amzayo.com) 设计的主题进行二次修改

## 效果图

### 桌面端

![Desktop 1](/screenshots/desktop_1.png)

![Desktop 2](/screenshots/desktop_2.png)

![Desktop 3](/screenshots/desktop_3.png)

### 移动端

![Mobile 1](/screenshots/mobile_1.jpg)

![Mobile 2](/screenshots/mobile_2.jpg)

[在线体验](https://jk.000.pe)

## 主要改动

- 增加世界地图
- 默认背景图为必应每日壁纸
- 旗帜使用 emoji 显示，不同系统质感不同，Windows 只会显示对应 code
- 增加国家或地区中文提示
- 小鸡的主要信息以标签组形式显示
- 小鸡离线时卡片会加上灰色滤镜
- 增加网络图表

## 部署

本项目为纯前端，不依赖哪吒服务端渲染，所以需要一个新的站点

下载 [Release](https://github.com/reg233/nezha-theme-world-map/releases/latest) 到服务器对应目录并解压，然后配置好 `Nginx` 或 `Caddy` ，只需反代路径 `/api/*` 和 `/ws` 到哪吒面板地址

### Nginx

不会 Nginx，会的大佬请帮帮我，感谢

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

## 已知问题

小鸡数量超过 100 时页面会开始出现明显卡顿，如有大佬有解决方案，请帮帮我，万分感激。若无后续会增加不卡顿的 Tab 样式

台湾旗帜 emoji 在 MacOS 下无法显示

## 声明

地图数据来自 [TopoJSON](https://github.com/topojson/world-atlas)，如有异议，请自行替换 `countries-50m.json`
