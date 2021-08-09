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

const Icon20Fuzhi: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M848.0256 366.3872c16.8448 0 30.8224 12.4416 33.2288 28.672l0.3584 4.9152v313.6c0 89.6-70.144 162.816-158.464 167.7824l-9.5744 0.256H400.0768a33.5872 33.5872 0 0 1-4.9664-66.8672l4.9152-0.3584h313.6a100.8128 100.8128 0 0 0 100.5568-93.2864l0.256-7.4752V399.9232c0-18.5344 15.0528-33.5872 33.5872-33.5872zM601.6 153.6a134.4 134.4 0 0 1 134.4 134.4v313.6a134.4 134.4 0 0 1-134.4 134.4H288A134.4 134.4 0 0 1 153.6 601.6V288A134.4 134.4 0 0 1 288 153.6h313.6z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon20Fuzhi.defaultProps = {
  size: 18,
};

export default Icon20Fuzhi;
