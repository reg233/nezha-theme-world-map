export const transformServer = (now, server) => {
  let {
    Host: {
      Arch: arch = "",
      BootTime: bootTime = 0,
      CountryCode: countryCode = "",
      CPU: cpu = [],
      DiskTotal: diskTotal = 0,
      MemTotal: memoryTotal = 0,
      Platform: platform = "",
      PlatformVersion: platformVersion = "",
      SwapTotal: swapTotal = 0,
      Version: version = "",
      Virtualization: virtualization = "",
    } = {},
    ID: id = "",
    LastActive: lastActive = "",
    Name: name = "",
    State: {
      CPU: cpuUsed = 0,
      DiskUsed: diskUsed = 0,
      Load1: load1 = 0,
      Load5: load5 = 0,
      Load15: load15 = 0,
      MemUsed: memoryUsed = 0,
      NetInSpeed: netInSpeed = 0,
      NetInTransfer: netInTransfer = 0,
      NetOutSpeed: netOutSpeed = 0,
      NetOutTransfer: netOutTransfer = 0,
      ProcessCount: processCount = 0,
      SwapUsed: swapUsed = 0,
      TcpConnCount: tcpCount = 0,
      UdpConnCount: udpCount = 0,
      Uptime: uptime = 0,
    } = {},
    Tag: tag = "",
  } = server;

  let live = false;
  if (server.Host) {
    live = now - new Date(lastActive).getTime() < 10 * 1000;
  }

  virtualization = virtualization && `${virtualization}:`;

  return {
    bootTime: new Date(bootTime * 1000).toLocaleString(),
    connectionCount: `TCP ${tcpCount} / UDP ${udpCount}`,
    countryCode,
    cpu,
    cpuCore: getCpuCore(cpu),
    cpuPercent: getPercent(cpuUsed, 100),
    diskPercent: getPercent(diskUsed, diskTotal),
    diskTotal: formatBytes(diskTotal),
    diskUsed: formatBytes(diskUsed),
    id,
    lastActive: new Date(lastActive).toLocaleString(),
    live,
    load: `${load1.toFixed(2)} / ${load5.toFixed(2)} / ${load15.toFixed(2)}`,
    memoryPercent: getPercent(memoryUsed, memoryTotal),
    memoryTotal: formatBytes(memoryTotal),
    memoryUsed: formatBytes(memoryUsed),
    name,
    netInSpeed: `${formatBytes(netInSpeed)}/s`,
    netInTransfer: formatBytes(netInTransfer),
    netOutSpeed: `${formatBytes(netOutSpeed)}/s`,
    netOutTransfer: formatBytes(netOutTransfer),
    platform: platform.includes("Windows") ? "Windows" : capitalize(platform),
    platformInfo:
      platform &&
      `${capitalize(platform)}-${platformVersion} [${virtualization}${arch}]`,
    processCount,
    swapPercent: getPercent(swapUsed, swapTotal),
    swapTotal: formatBytes(swapTotal),
    swapUsed: formatBytes(swapUsed),
    tag,
    uptime: formatUptime(uptime),
    version,
  };
};

const getCpuCore = (cpu) => {
  if (!(cpu || []).length) {
    return "?";
  }

  cpu = cpu[0];
  let core = cpu.match(/(\d|\.)+(?= Physical Core)/g);
  core = core ? (core.length ? core[0] : "?") : "?";
  if (core === "?") {
    core = cpu.match(/(\d|\.)+(?= Virtual Core)/g);
    core = core ? (core.length ? core[0] : "?") : "?";
    return core === "?" ? "?" : `${core}C`;
  }

  return `${core}C`;
};

const formatBytes = (bytes) => {
  if (!+bytes) return "0B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))}${sizes[i]}`;
};

const capitalize = (s) => {
  return (s && s[0].toUpperCase() + s.slice(1)) || "?";
};

const formatUptime = (uptime) => {
  if (uptime > 60 * 60 * 24) {
    return `${Math.floor(uptime / (60 * 60 * 24))}天`;
  } else if (uptime > 60 * 60) {
    return `${Math.floor(uptime / (60 * 60))}时`;
  } else if (uptime > 60) {
    return `${Math.floor(uptime / 60)}分`;
  } else {
    return `${uptime}秒`;
  }
};

const getPercent = (used, total) => {
  return parseInt((used / total) * 100) || 0;
};
