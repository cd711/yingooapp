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

const Icon20Guanbi: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M448.6656 507.904L201.6256 260.9664a41.3696 41.3696 0 1 1 58.5216-58.4704l246.9376 246.9888 247.04-246.9888a41.3696 41.3696 0 0 1 58.5216 58.4704L565.6064 507.904l247.04 246.9888a41.3696 41.3696 0 0 1-58.5216 58.4704l-246.9888-246.9888-246.9888 246.9888a41.3696 41.3696 0 1 1-58.5216-58.4704L448.6656 507.904z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon20Guanbi.defaultProps = {
  size: 18,
};

export default Icon20Guanbi;
