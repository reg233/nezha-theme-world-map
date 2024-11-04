import {
  CaretRightOutlined,
  CopyrightCircleOutlined,
  LoadingOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useWebSocket } from "ahooks";
import { ReadyState } from "ahooks/lib/useWebSocket";
import { Collapse, Flex, FloatButton } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "./Card";
import { MemoizedCopyright } from "./Copyright";
import { MemoizedNetwork } from "./Network";
import { MemoizedPassword } from "./Password";
import { Tab } from "./Tab";
import { WorldMap } from "./WorldMap";
import { transformServer } from "./utils";

export const App = () => {
  useEffect(() => {
    getCountries();
  }, []);

  const [countries, setCountries] = useState({});

  const passwordRef = useRef();
  const copyrightRef = useRef();
  const networkRef = useRef();

  const getCountries = async () => {
    const localCountries = localStorage.getItem("countries");
    if (localCountries) {
      setCountries(JSON.parse(localCountries));
    }

    const response = await fetch("/countries.json");
    if (response.status === 200) {
      const json = await response.json();
      setCountries(json);

      localStorage.setItem("countries", JSON.stringify(json));
    }
  };

  const zhCountries = useMemo(() => {
    return Object.entries(countries).reduce((prev, [, { en, zh }]) => {
      prev[en] = zh;
      return prev;
    }, {});
  }, [countries]);

  const { latestMessage: { data } = {}, readyState } = useWebSocket(
    getSocketUrl(),
    {
      reconnectLimit: Infinity,
    }
  );

  const [items, tabsItems] = useMemo(() => {
    let newData;
    if (data) {
      localStorage.setItem("data", data);
      newData = data;
    } else {
      newData = localStorage.getItem("data") || "{}";
    }
    const { now = 0, servers = [] } = JSON.parse(newData);

    const groupedServers = new Map();
    const checkedCountries = new Map();
    for (const server of servers) {
      const newServer = transformServer(now, server);

      const key = newServer.tag || "默认";
      if (groupedServers.has(key)) {
        groupedServers.get(key).push(newServer);
      } else {
        groupedServers.set(key, [newServer]);
      }

      const country = countries[newServer.countryCode];
      if (country) {
        const count = checkedCountries.get(country.en);
        if (count) {
          checkedCountries.set(country.en, count + 1);
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
    ];

    const tabsItems = Array.from(groupedServers, ([tag, servers]) => ({
      children: (
        <Flex gap={16} justify="center" wrap="wrap">
          {servers.map((server) => (
            <Card
              country={countries[server.countryCode] || { en: "", zh: "" }}
              data={server}
              key={server.id}
              networkRef={networkRef}
            />
          ))}
        </Flex>
      ),
      key: tag,
      label: tag,
    }));

    return [items, tabsItems];
  }, [data, countries, zhCountries]);

  return (
    <>
      <Collapse
        bordered={false}
        defaultActiveKey="WorldMap"
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
        items={items}
      />
      <div className="tabs">
        {!!tabsItems.length && <Tab items={tabsItems} />}
      </div>
      <FloatButton.Group>
        {readyState !== ReadyState.Open && (
          <FloatButton
            icon={<LockOutlined />}
            onClick={() => passwordRef.current.show()}
          />
        )}
        <FloatButton
          icon={
            readyState === ReadyState.Connecting ? (
              <LoadingOutlined />
            ) : (
              <CopyrightCircleOutlined />
            )
          }
          onClick={() => copyrightRef.current.show()}
        />
      </FloatButton.Group>
      <MemoizedPassword ref={passwordRef} />
      <MemoizedCopyright ref={copyrightRef} />
      <MemoizedNetwork ref={networkRef} />
    </>
  );
};

const getSocketUrl = () => {
  const socketProtocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${socketProtocol}://${window.location.host}/ws`;
};
