import { LineChartOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Progress, Row, Tag, Tooltip } from "antd";
import { isEqual } from "lodash-es";
import { memo } from "react";
import {
  ArrowDownCircleFill,
  ArrowRepeat,
  ArrowUpCircleFill,
  Clock,
  Cpu,
  DatabaseFillDown,
  DatabaseFillUp,
  Disc,
  Hdd,
  InfoCircleFill,
  Memory,
} from "react-bootstrap-icons";

/* eslint-disable react/prop-types */
export const Card = memo(
  function Card({ country, data, networkRef }) {
    return (
      <div className={`card${data.live ? "" : " card-offline"}`}>
        <Row align="middle" wrap={false}>
          <Col className="name" flex={1}>
            <Tooltip title={country.zh}>{country.flag}</Tooltip>
            &nbsp;
            {data.name}
          </Col>
          <Col>
            <Tooltip
              align={{ offset: [12, 8] }}
              placement="bottomRight"
              title={
                <>
                  负载：{data.load}
                  <br />
                  进程数：{data.processCount}
                  <br />
                  连接数：{data.connectionCount}
                  <br />
                  启动：{data.bootTime}
                  <br />
                  活动：{data.lastActive}
                  <br />
                  版本：{data.version}
                </>
              }
            >
              <InfoCircleFill className="bi bi-info" />
            </Tooltip>
          </Col>
        </Row>
        <Flex className="tags" gap={4} wrap="wrap">
          <Tooltip title={data.cpu}>
            <Tag bordered={false} icon={<Cpu className="bi" />} color="red">
              {data.cpuCore}
            </Tag>
          </Tooltip>
          <Tag bordered={false} icon={<Memory className="bi" />} color="green">
            {data.memoryTotal}
          </Tag>
          <Tag bordered={false} icon={<Hdd className="bi" />} color="blue">
            {data.diskTotal}
          </Tag>
          <Tag
            bordered={false}
            icon={<ArrowRepeat className="bi" />}
            color="purple"
          >
            {data.swapTotal}
          </Tag>
          <Tooltip title={data.platformInfo}>
            <Tag bordered={false} icon={<Disc className="bi" />} color="cyan">
              {data.platform}
            </Tag>
          </Tooltip>
          <Tag bordered={false} icon={<Clock className="bi" />} color="gold">
            {data.uptime}
          </Tag>
        </Flex>
        <Row justify="space-between">
          <Col>CPU</Col>
          <Col>{data.cpuPercent}%</Col>
        </Row>
        <Progress
          className={getProgressClass(data.cpuPercent)}
          percent={data.cpuPercent}
          showInfo={false}
        />
        <Row justify="space-between">
          <Col>内存</Col>
          <Col>
            {data.memoryPercent}% ({data.memoryUsed})
          </Col>
        </Row>
        <Progress
          className={getProgressClass(data.memoryPercent)}
          percent={data.memoryPercent}
          showInfo={false}
        />
        <Row justify="space-between">
          <Col>硬盘</Col>
          <Col>
            {data.diskPercent}% ({data.diskUsed})
          </Col>
        </Row>
        <Progress
          className={getProgressClass(data.diskPercent)}
          percent={data.diskPercent}
          showInfo={false}
        />
        <Row justify="space-between">
          <Col>交换</Col>
          <Col>
            {data.swapPercent}% ({data.swapUsed})
          </Col>
        </Row>
        <Progress
          className={getProgressClass(data.swapPercent)}
          percent={data.swapPercent}
          showInfo={false}
        />
        <Row align="middle">
          <Col className="network-in">
            <div>
              <ArrowDownCircleFill className="bi" /> {data.netInSpeed}
            </div>
            <div>
              <DatabaseFillDown className="bi" /> {data.netInTransfer}
            </div>
          </Col>
          <Col>
            <Button
              icon={<LineChartOutlined />}
              type="link"
              onClick={() => networkRef.current.show(data.id, data.name)}
            />
          </Col>
          <Col className="network-out">
            <div>
              {data.netOutSpeed} <ArrowUpCircleFill className="bi" />
            </div>
            <div>
              {data.netOutTransfer} <DatabaseFillUp className="bi" />
            </div>
          </Col>
        </Row>
      </div>
    );
  },
  function propsAreEqual(prevProps, nextProps) {
    return (
      isEqual(prevProps.country, nextProps.country) &&
      isEqual(prevProps.data, nextProps.data)
    );
  }
);

const getProgressClass = (percent) => {
  if (percent < 51) {
    return "fine";
  } else if (percent < 81) {
    return "warning";
  }

  return "error";
};
