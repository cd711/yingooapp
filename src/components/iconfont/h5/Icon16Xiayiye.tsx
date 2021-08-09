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

const Icon16Xiayiye: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M369.28 250.88a48.64 48.64 0 0 0 2.496 60.288l183.168 210.048-181.76 190.08a48.512 48.512 0 0 0-11.84 44.736 46.72 46.72 0 0 0 31.872 34.112c16.256 4.864 33.664 0 45.44-12.288l212.096-221.76a48.064 48.064 0 0 0 13.248-32.384l-0.32-6.4a49.408 49.408 0 0 0-11.392-26.24L440.128 247.744a44.992 44.992 0 0 0-66.048-2.496l-4.864 5.632z"
        fill={getIconColor(color, 0, '#000000')}
      />
    </svg>
  );
};

Icon16Xiayiye.defaultProps = {
  size: 18,
};

export default Icon16Xiayiye;
