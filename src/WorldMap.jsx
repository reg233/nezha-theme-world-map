/* eslint-disable react/prop-types */
import { geoEqualEarth, geoPath } from "d3-geo";
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

    return (
      <svg
        className="world-map"
        height={height}
        width={width}
        viewBox={[0, 0, width, height]}
      >
        <path className="world-map-sphere" d={path({ type: "Sphere" })} />
        <g>
          {features.map((d, i) => (
            <path
              className={`world-map-country${
                checkedCountries.has(d.properties.name) ? "-checked" : ""
              }`}
              d={path(d)}
              key={`path-${i}`}
            >
              <title>
                {zhCountries[d.properties.name] || d.properties.name}
              </title>
            </path>
          ))}
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
