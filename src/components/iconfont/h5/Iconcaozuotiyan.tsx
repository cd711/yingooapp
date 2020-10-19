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

const Iconcaozuotiyan: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M743.68 422.4c-17.066667 0-29.866667 4.266667-38.4 12.8-12.8-29.866667-34.133333-51.2-68.266667-51.2-12.8 0-29.866667 4.266667-38.4 12.8-12.8-29.866667-38.4-51.2-68.266666-51.2-12.8 0-25.6 4.266667-34.133334 8.533333V281.6c0-42.666667-29.866667-72.533333-72.533333-72.533333s-72.533333 34.133333-72.533333 72.533333v285.866667l-46.933334-46.933334c-29.866667-29.866667-81.066667-25.6-106.666666 0-25.6 25.6-42.666667 72.533333-4.266667 110.933334l209.066667 204.8 12.8 12.8c38.4 29.866667 81.066667 46.933333 170.666666 46.933333 209.066667 0 226.133333-110.933333 226.133334-251.733333v-149.333334c4.266667-38.4-25.6-72.533333-68.266667-72.533333zM308.48 277.333333c0-59.733333 51.2-110.933333 110.933333-110.933333 59.733333 0 110.933333 51.2 110.933334 110.933333 0 15.786667 34.133333 15.786667 34.133333 0 8.533333-85.333333-59.733333-149.333333-145.066667-149.333333-81.066667 0-149.333333 68.266667-149.333333 149.333333 0 19.029333 38.4 15.488 38.4 0z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Iconcaozuotiyan.defaultProps = {
  size: 18,
};

export default Iconcaozuotiyan;
