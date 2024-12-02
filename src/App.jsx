import {
  CaretRightOutlined,
  CopyrightCircleOutlined,
  LoadingOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useRequest, useWebSocket } from "ahooks";
import { ReadyState } from "ahooks/lib/useWebSocket";
import { Collapse, Flex, FloatButton } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "./Card";
import { MemoizedCopyright } from "./Copyright";
import { MemoizedNetwork } from "./Network";
import { MemoizedPassword } from "./Password";
import { WorldMap } from "./WorldMap";
import { transformServer } from "./utils";

export const App = () => {
  useEffect(() => {
    getCountries();
  }, []);

  const [inactiveKey, setInactiveKey] = useState([]);
  const [countries, setCountries] = useState({});

  const passwordRef = useRef();
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

  const { data: { data: groupList = [] } = {} } = useRequest(async () => {
    const response = await fetch("/api/v1/server-group");
    if (response.status === 200) {
      return response.json();
    }
  });

  const { latestMessage: { data } = {}, readyState } = useWebSocket(
    getSocketUrl(),
    {
      reconnectLimit: Infinity,
    }
  );

  const [groupIds, items] = useMemo(() => {
    const { now = 0, servers = [] } = JSON.parse(data || "{}");

    const groupIds = ["WorldMap"];
    const groupedServers = new Map();
    const checkedCountries = new Map();
    for (const server of servers) {
      const newServer = transformServer(now, server);

      const group = groupList.find((group) => {
        return group.servers && group.servers.includes(newServer.id);
      });
      if (group) {
        newServer.groupId = group.group.id;
        newServer.groupName = group.group.name;
      } else {
        newServer.groupId = -1;
        newServer.groupName = "默认";
      }

      const key = newServer.groupId;
      if (groupedServers.has(key)) {
        groupedServers.get(key).push(newServer);
      } else {
        groupIds.push(key);
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
      ...Array.from(groupedServers, ([groupId, servers]) => ({
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
        key: groupId,
        label: servers[0].groupName,
      })),
    ];

    return [groupIds, items];
  }, [data, groupList, countries, zhCountries]);

  return (
    <>
      <Collapse
        activeKey={groupIds.filter((id) => !inactiveKey.includes(id))}
        bordered={false}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
        items={items}
        onChange={(activeKey) => {
          setInactiveKey(
            groupIds.filter((id) => !activeKey.includes(id.toString()))
          );
        }}
      />
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
  return `${socketProtocol}://${window.location.host}/api/v1/ws/server`;
};
