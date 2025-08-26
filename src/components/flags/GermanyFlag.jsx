import React from 'react';
import Svg, { Defs, ClipPath, Circle, Rect, G } from 'react-native-svg';

export default function GermanyFlag({ size = 36 }) {
  const r = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}> 
      <Defs>
        <ClipPath id="clip">
          <Circle cx={r} cy={r} r={r} />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip)">
        <Rect x="0" y="0" width={size} height={size / 3} fill="#000000" />
        <Rect x="0" y={size / 3} width={size} height={size / 3} fill="#DD0000" />
        <Rect x="0" y={(2 * size) / 3} width={size} height={size / 3} fill="#FFCE00" />
      </G>
      <Circle cx={r} cy={r} r={r - 0.75} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" fill="transparent" />
    </Svg>
  );
}


