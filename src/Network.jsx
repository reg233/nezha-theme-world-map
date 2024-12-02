import { useRequest } from "ahooks";
import { Modal } from "antd";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { LineChart } from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  TooltipComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { forwardRef, memo, useImperativeHandle, useState } from "react";

echarts.use([
  LineChart,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  TooltipComponent,
  CanvasRenderer,
]);

const Network = forwardRef(function Network(_, ref) {
  useImperativeHandle(ref, () => ({ show }));

  const show = (id, name) => {
    setOpen(true);
    setId(id);
    setName(name);
  };

  const dismiss = () => {
    setOpen(false);
    setId();
    setName();
    setOptions({});
  };

  const [open, setOpen] = useState(false);
  const [id, setId] = useState();
  const [name, setName] = useState();
  const [options, setOptions] = useState({});

  const { loading } = useRequest(
    async () => {
      const response = await fetch(`/api/v1/service/${id}`);
      if (response.status === 200) {
        return response.json();
      }
    },
    {
      ready: !!id,
      onSuccess: (data) => {
        let { data: monitors = [] } = data || {};

        let series = [];
        let legendData = [];

        for (const monitor of monitors) {
          let loss = 0;
          let seriesData = [];
          let markLineData = [];

          for (let i = 0; i < monitor.created_at.length; i++) {
            const avgDelay = Math.round(monitor.avg_delay[i]);
            if (avgDelay > 0 && avgDelay < 1000) {
              seriesData.push([monitor.created_at[i], avgDelay]);
            } else {
              loss += 1;
              markLineData.push({ xAxis: monitor.created_at[i] });
            }
          }

          const lossRate = ((loss / monitor.created_at.length) * 100).toFixed(
            1
          );
          const legendName = `${monitor.monitor_name} ${lossRate}%`;
          legendData.push(legendName);

          series.push({
            data: seriesData,
            lineStyle: { width: 1 },
            markLine: {
              data: markLineData,
              label: { show: false },
              lineStyle: { opacity: 0.5, width: 0.5 },
              silent: true,
              symbol: "none",
            },
            markPoint: {
              data: [
                { name: "Max", type: "max" },
                {
                  label: { offset: [0, 8] },
                  name: "Min",
                  symbolRotate: 180,
                  type: "min",
                },
              ],
              label: { fontSize: 10, offset: [0, -1] },
              symbolSize: 40,
            },
            name: legendName,
            smooth: true,
            symbol: "none",
            type: "line",
          });
        }

        const options = {
          dataZoom: [
            {
              brushSelect: false,
              end: 100,
              minSpan: 5,
              start: 0,
            },
          ],
          legend: {
            data: legendData,
            pageButtonItemGap: 0,
            pageButtonGap: 8,
            pageIconSize: 12,
            type: "scroll",
          },
          series,
          xAxis: {
            boundaryGap: false,
            type: "time",
          },
          yAxis: {
            axisLabel: {
              formatter: (value) => value,
            },
            boundaryGap: false,
            type: "value",
          },
          tooltip: {
            confine: true,
            transitionDuration: 0,
            trigger: "axis",
          },
        };
        setOptions(options);
      },
    }
  );

  return (
    <Modal
      centered
      footer={null}
      forceRender
      open={open}
      title={name}
      width={1000}
      onCancel={dismiss}
    >
      <ReactEChartsCore
        echarts={echarts}
        lazyUpdate={true}
        loadingOption={{
          color: "#007fff",
          lineWidth: 4,
          spinnerRadius: 16,
          text: "",
        }}
        notMerge={true}
        option={options}
        showLoading={loading}
        style={{ height: 500 }}
      />
    </Modal>
  );
});

export const MemoizedNetwork = memo(Network);
