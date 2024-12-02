import dayjs from "dayjs";

export const transformServer = (now, server) => {
  let {
    country_code: countryCode = "",
    host: {
      arch = "",
      boot_time: bootTime = 0,
      cpu = [],
      disk_total: diskTotal = 0,
      mem_total: memoryTotal = 0,
      platform = "",
      platform_version: platformVersion = "",
      swap_total: swapTotal = 0,
      version = "",
      virtualization = "",
    } = {},
    id = "",
    last_active: lastActive = "",
    name = "",
    state: {
      cpu: cpuUsed = 0,
      disk_used: diskUsed = 0,
      load_1: load1 = 0,
      load_5: load5 = 0,
      load_15: load15 = 0,
      mem_used: memoryUsed = 0,
      net_in_speed: netInSpeed = 0,
      net_in_transfer: netInTransfer = 0,
      net_out_speed: netOutSpeed = 0,
      net_out_transfer: netOutTransfer = 0,
      process_count: processCount = 0,
      swap_used: swapUsed = 0,
      tcp_conn_count: tcpCount = 0,
      udp_conn_count: udpCount = 0,
      uptime = 0,
    } = {},
  } = server;

  let live = false;
  if (server.host) {
    live = now - new Date(lastActive).getTime() < 10 * 1000;
  }

  virtualization = virtualization && `${virtualization}:`;

  return {
    bootTime: dayjs.unix(bootTime).format("YYYY-MM-DD HH:mm:ss"),
    connectionCount: `TCP ${tcpCount} / UDP ${udpCount}`,
    countryCode,
    cpu,
    cpuCore: getCpuCore(cpu),
    cpuPercent: getPercent(cpuUsed, 100),
    diskPercent: getPercent(diskUsed, diskTotal),
    diskTotal: formatBytes(diskTotal),
    diskUsed: formatBytes(diskUsed),
    id,
    lastActive: dayjs(lastActive).format("YYYY-MM-DD HH:mm:ss"),
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
