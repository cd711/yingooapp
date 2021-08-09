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

const Icon20Zhongfutianjia: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
        fill={getIconColor(color, 0, '#000000')}
        opacity=".4"
      />
      <path
        d="M512 227.84a38.4 38.4 0 0 1 38.0416 33.1776l0.3584 5.2224-0.0512 207.3088 207.4112 0.0512a38.4 38.4 0 0 1 5.2224 76.4416l-5.2224 0.3584-207.4112-0.0512 0.0512 207.4112a38.4 38.4 0 0 1-76.4416 5.2224L473.6 757.76l-0.0512-207.4112-207.3088 0.0512a38.4 38.4 0 0 1-5.2224-76.4416L266.24 473.6l207.3088-0.0512L473.6 266.24a38.4 38.4 0 0 1 38.4-38.4z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </svg>
  );
};

Icon20Zhongfutianjia.defaultProps = {
  size: 18,
};

export default Icon20Zhongfutianjia;
