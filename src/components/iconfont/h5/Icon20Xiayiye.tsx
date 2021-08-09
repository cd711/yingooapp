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

const Icon20Xiayiye: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M328.3968 182.016c-10.752 13.824-10.24 33.8944 2.1504 47.1552l266.5472 286.3616-265.3696 259.84a36.5056 36.5056 0 1 0 51.0464 52.1216l290.816-284.672a36.352 36.352 0 0 0 10.9056-25.2928l-0.256-4.9664a36.7104 36.7104 0 0 0-9.472-20.6848l-290.816-312.3712a36.5056 36.5056 0 0 0-51.5584-1.8944l-3.9936 4.4032z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon20Xiayiye.defaultProps = {
  size: 18,
};

export default Icon20Xiayiye;
