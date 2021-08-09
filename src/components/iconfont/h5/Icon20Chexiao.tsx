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

const Icon20Chexiao: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M297.7792 514.048a38.4 38.4 0 0 1 3.4304 50.432l-3.4304 3.8912a38.4 38.4 0 0 1-50.3808 3.4816l-3.9424-3.4816L62.464 387.3792a38.4 38.4 0 0 1-3.4304-50.3808l3.4304-3.9424L243.456 152.064a38.4 38.4 0 0 1 57.7536 50.3808l-3.4304 3.8912L177.664 326.4H691.2a288 288 0 0 1 11.264 575.7952l-11.264 0.2048h-204.8a32 32 0 0 1-4.7104-63.6416l4.7104-0.3584h204.8a224 224 0 0 0 10.8544-447.744l-10.8544-0.256H174.1312l123.648 123.6992z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon20Chexiao.defaultProps = {
  size: 18,
};

export default Icon20Chexiao;
