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

const Icon22Yixuanzhong: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
        fill={getIconColor(color, 0, '#FF4966')}
      />
      <path
        d="M707.490909 339.456a46.545455 46.545455 0 0 1 69.725091 61.44l-3.863273 4.375273-324.887272 325.213091a46.545455 46.545455 0 0 1-61.486546 3.909818l-4.375273-3.863273-136.238545-136.238545a46.545455 46.545455 0 0 1 61.44-69.678546l4.375273 3.863273 103.284363 103.284364 292.026182-292.305455z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </svg>
  );
};

Icon22Yixuanzhong.defaultProps = {
  size: 18,
};

export default Icon22Yixuanzhong;
