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

const Icon24BianjiqiChongyin: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M844.458667 148.48c37.802667 0 68.437333 30.634667 68.437333 68.437333v590.250667c0 37.76-30.634667 68.437333-68.437333 68.437333H179.541333a68.437333 68.437333 0 0 1-68.437333-68.437333V216.917333c0-37.802667 30.634667-68.437333 68.437333-68.437333z m-289.152 366.336l-99.242667 115.882667a29.354667 29.354667 0 0 1-40.618667 3.797333l-77.269333-61.866667-168.405333 168.362667v66.133333a9.813333 9.813333 0 0 0 4.864 8.448l2.304 0.981334 2.602666 0.384h664.917334a9.813333 9.813333 0 0 0 9.770666-9.813334v-63.744l-298.922666-228.522666z m289.152-307.669333H179.541333a9.813333 9.813333 0 0 0-9.770666 9.813333v441.130667l145.493333-145.493334a29.354667 29.354667 0 0 1 34.986667-4.864l4.053333 2.730667 75.648 60.501333 98.901333-115.370666a29.312 29.312 0 0 1 40.106667-4.181334l285.226667 218.154667V216.917333a9.813333 9.813333 0 0 0-7.125334-9.386666l-2.602666-0.384zM326.229333 328.021333a58.666667 58.666667 0 1 1 0 117.333334 58.666667 58.666667 0 0 1 0-117.333334z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24BianjiqiChongyin.defaultProps = {
  size: 18,
};

export default Icon24BianjiqiChongyin;
