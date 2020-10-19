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

const Iconshangyiye: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M22.016 517.76a32.085333 32.085333 0 0 0 9.685333 22.314667l311.552 305.066666a32.213333 32.213333 0 0 0 45.098667-46.037333l-289.109333-283.093333 290.133333-311.68a32.256 32.256 0 1 0-47.189333-43.946667L30.634667 495.146667a32.085333 32.085333 0 0 0-8.618667 22.741333v-0.085333z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Iconshangyiye.defaultProps = {
  size: 18,
};

export default Iconshangyiye;
