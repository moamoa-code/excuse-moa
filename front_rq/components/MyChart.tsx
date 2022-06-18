import { ResponsiveBar } from "@nivo/bar";
import React from "react";
import { useMediaQuery } from "react-responsive";
// @nivo/core^0.79.0 SSR관련 버그로 0.78.0 사용
// https://stackoverflow.com/questions/71083857/referenceerror-resizeobserver-is-not-defined-with-nivo-and-nextjs

// nivo chart 출하랑분석용 차트
const MyChart = (props) => {
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });
  const { data, keys, indexBy } = props;

  return (
    <>
      {isMobile ? (
        <ResponsiveBar
          data={data}
          keys={keys}
          indexBy={indexBy}
          margin={{ top: 20, right: 30, bottom: 50, left: 30 }}
          padding={0.3}
          groupMode="grouped"
          colors={{ scheme: "nivo" }}
          axisTop={null}
          axisRight={null}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "중량(kg)",
            legendPosition: "middle",
            legendOffset: -40,
          }}
          labelSkipWidth={13}
          labelSkipHeight={12}
          labelTextColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
          }}
          role="application"
        />
      ) : (
        <ResponsiveBar
          data={data}
          keys={keys}
          indexBy={indexBy}
          margin={{ top: 20, right: 130, bottom: 50, left: 60 }}
          padding={0.3}
          groupMode="grouped"
          colors={{ scheme: "nivo" }}
          axisTop={null}
          axisRight={null}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "중량(kg)",
            legendPosition: "middle",
            legendOffset: -40,
          }}
          labelSkipWidth={13}
          labelSkipHeight={12}
          labelTextColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
          }}
          legends={[
            {
              dataFrom: "keys",
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: "left-to-right",
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: "hover",
                  style: {
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
          role="application"
        />
      )}
    </>
  );
};

export default MyChart;
