/* tslint:disable */
/* eslint-disable */

import React, { CSSProperties, DOMAttributes, FunctionComponent } from 'react';
import { getIconColor } from './helper';

interface Props extends DOMAttributes<SVGElement> {
  size?: number;
  color?: string | string[];
  style?: CSSProperties;
  className?: string;
}

const DEFAULT_STYLE: CSSProperties = {
  display: 'block',
};

const Icon24BianjiqiShanchu: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M469.333333 874.24h42.666667v64h-42.666667z"
        fill={getIconColor(color, 0, '#0DBC52')}
      />
      <path
        d="M554.410667 88.874667a117.333333 117.333333 0 0 1 103.338666 61.824l29.866667 55.509333h215.466667a32 32 0 0 1 4.352 63.701333l-4.309334 0.298667h-65.834666l0.042666 547.584a117.333333 117.333333 0 0 1-110.165333 117.12l-7.168 0.213333h-416a117.333333 117.333333 0 0 1-117.333333-117.333333V270.208H120.832A32 32 0 0 1 116.565333 206.506667l4.309334-0.298667h215.68l30.976-56.405333A117.333333 117.333333 0 0 1 462.421333 89.173333l7.978667-0.298666z m218.88 181.333333H250.624l0.042667 547.584c0 25.770667 18.261333 47.274667 42.581333 52.224l5.290667 0.853333 5.461333 0.256h416c29.44 0 53.333333-23.893333 53.333333-53.333333V270.208zM433.792 401.792a32 32 0 0 1 31.701333 27.648l0.298667 4.352v254.208a32 32 0 0 1-63.701333 4.352l-0.298667-4.352V433.792a32 32 0 0 1 32-32z m156.416 0a32 32 0 0 1 31.701333 27.648l0.298667 4.352v254.208a32 32 0 0 1-63.701333 4.352l-0.298667-4.352V433.792a32 32 0 0 1 32-32z m-35.84-248.917333H470.442667a53.333333 53.333333 0 0 0-46.762667 27.733333l-14.037333 25.6h205.312l-13.525334-25.216a53.333333 53.333333 0 0 0-41.173333-27.776l-5.802667-0.341333z"
        fill={getIconColor(color, 1, '#121314')}
      />
    </svg>
  );
};

Icon24BianjiqiShanchu.defaultProps = {
  size: 18,
};

export default Icon24BianjiqiShanchu;
