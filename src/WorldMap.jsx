/* eslint-disable react/prop-types */
import { extent } from "d3-array";
import { geoEqualEarth, geoPath } from "d3-geo";
import { interpolate } from "d3-interpolate";
import { scaleSequential } from "d3-scale";
import { isEqual } from "lodash-es";
import { memo, useEffect, useState } from "react";
import { feature, mesh } from "topojson-client";

export const WorldMap = memo(
  function WorldMap({ checkedCountries, zhCountries }) {
    const [features, setFeatures] = useState([]);
    const [interiors, setInteriors] = useState({});

    useEffect(() => {
      getTopoJSON();
    }, []);

    const getTopoJSON = async () => {
      const response = await fetch("/countries-50m.json");
      if (response.status === 200) {
        const json = await response.json();
        setFeatures(feature(json, json.objects.countries).features);
        setInteriors(mesh(json, json.objects.countries, (a, b) => a !== b));
      }
    };

    const width = 1024;
    const height = width / 2.05;

    const projection = geoEqualEarth().fitExtent(
      [
        [0, 0],
        [width, height],
      ],
      { type: "Sphere" }
    );
    const path = geoPath(projection);

    const color = scaleSequential(
      extent(checkedCountries.values()),
      interpolate("#87ceeb", "#007fff")
    );

    return (
      <svg
        className="world-map"
        height={height}
        width={width}
        viewBox={[0, 0, width, height]}
      >
        <path className="world-map-sphere" d={path({ type: "Sphere" })} />
        <g>
          {features.map((d, i) => {
            const name = d.properties.name;
            const count = checkedCountries.get(name);
            let title = zhCountries[name] || name;
            if (count) {
              title = `${title}\n${count}`;
            }

            return (
              <path
                className={`world-map-country${count ? "-checked" : ""}`}
                d={path(d)}
                fill={color(count)}
                key={`path-${i}`}
              >
                <title>{title}</title>
              </path>
            );
          })}
        </g>
        <path className="world-map-interior" d={path(interiors)} />
      </svg>
    );
  },
  function propsAreEqual(prevProps, nextProps) {
    return (
      isEqual(prevProps.checkedCountries, nextProps.checkedCountries) &&
      isEqual(prevProps.zhCountries, nextProps.zhCountries)
    );
  }
);
