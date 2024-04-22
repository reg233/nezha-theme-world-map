import {
  CaretRightOutlined,
  CopyrightCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useWebSocket } from "ahooks";
import { ReadyState } from "ahooks/lib/useWebSocket";
import { Collapse, Flex, FloatButton } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "./Card";
import { MemoizedCopyright } from "./Copyright";
import { MemoizedNetwork } from "./Network";
import { WorldMap } from "./WorldMap";
import { transformServer } from "./utils";

export const App = () => {
  useEffect(() => {
    getCountries();
  }, []);

  const [inactiveKey, setInactiveKey] = useState([]);
  const [countries, setCountries] = useState({});

  const copyrightRef = useRef();
  const networkRef = useRef();

  const getCountries = async () => {
    const response = await fetch("/countries.json");
    if (response.status === 200) {
      const json = await response.json();
      setCountries(json);
    }
  };

  const zhCountries = useMemo(() => {
    return Object.entries(countries).reduce((prev, [, { en, zh }]) => {
      prev[en] = zh;
      return prev;
    }, {});
  }, [countries]);

  const { latestMessage: { data = "{}" } = {}, readyState } = useWebSocket(
    getSocketUrl(),
    {
      reconnectLimit: Infinity,
    }
  );

  const [tags, items] = useMemo(() => {
    const { now = 0, servers = [] } = JSON.parse(data);

    const tags = ["WorldMap"];
    const groupedServers = new Map();
    const checkedCountries = new Map();
    for (const server of servers) {
      const newServer = transformServer(now, server);

      const key = newServer.tag || "默认";
      if (groupedServers.has(key)) {
        groupedServers.get(key).push(newServer);
      } else {
        tags.push(key);
        groupedServers.set(key, [newServer]);
      }

      const country = countries[newServer.countryCode];
      if (country) {
        const count = checkedCountries.get(country.en);
        if (count) {
          checkedCountries.set(country.en, count + 1)
        } else {
          checkedCountries.set(country.en, 1);
        }
      }
    }

    const items = [
      {
        children: (
          <WorldMap
            checkedCountries={checkedCountries}
            zhCountries={zhCountries}
          />
        ),
        key: "WorldMap",
        label: "世界地图",
      },
      ...Array.from(groupedServers, ([tag, servers]) => ({
        children: (
          <Flex gap={16} justify="center" wrap="wrap">
            {servers.map((server) => (
              <Card
                country={
                  countries[server.countryCode] || { flag: "🏴‍☠️", zh: "" }
                }
                data={server}
                key={server.id}
                networkRef={networkRef}
              />
            ))}
          </Flex>
        ),
        key: tag,
        label: tag,
      })),
    ];

    return [tags, items];
  }, [data, countries, zhCountries]);

  return (
    <>
      <Collapse
        activeKey={tags.filter((tag) => !inactiveKey.includes(tag))}
        bordered={false}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
        items={items}
        onChange={(activeKey) => {
          setInactiveKey(tags.filter((tag) => !activeKey.includes(tag)));
        }}
      />
      <FloatButton
        icon={
          readyState === ReadyState.Connecting ? (
            <LoadingOutlined />
          ) : (
            <CopyrightCircleOutlined
              style={{ color: "var(--primary-color)" }}
            />
          )
        }
        onClick={() => copyrightRef.current.show()}
      />
      <MemoizedCopyright ref={copyrightRef} />
      <MemoizedNetwork ref={networkRef} />
    </>
  );
};

const getSocketUrl = () => {
  const socketProtocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${socketProtocol}://${window.location.host}/ws`;
};
