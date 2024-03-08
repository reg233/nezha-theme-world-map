import { useRequest } from "ahooks";
import { Modal } from "antd";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { LineChart } from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
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
      const response = await fetch(`/api/v1/monitor/${id}`);
      if (response.status === 200) {
        return response.json();
      }
    },
    {
      ready: !!id,
      onSuccess: (data) => {
        let { result } = data || {};
        if (!result) {
          result = [];
        }

        let series = [];
        let legendData = [];

        for (const monitor of result) {
          let loss = 0;
          let seriesData = [];

          for (let i = 0; i < monitor.created_at.length; i++) {
            const avgDelay = Math.round(monitor.avg_delay[i]);
            if (avgDelay > 1000 * 0.9) {
              loss += 1;
            }
            if (avgDelay > 0) {
              seriesData.push([monitor.created_at[i], avgDelay]);
            }
          }

          const lossRate = ((loss / monitor.created_at.length) * 100).toFixed(
            1
          );
          const legendName = `${monitor.monitor_name} ${lossRate}%`;
          legendData.push(legendName);

          series.push({
            data: seriesData,
            markPoint: {
              data: [
                { name: "Max", type: "max" },
                { name: "Min", type: "min" },
              ],
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
          },
          series,
          xAxis: {
            boundaryGap: false,
            type: "time",
          },
          yAxis: {
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
