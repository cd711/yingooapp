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

const Icon22ToumingWeixuanzhong: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 0c282.763636 0 512 229.236364 512 512s-229.236364 512-512 512S0 794.763636 0 512 229.236364 0 512 0z m0 46.545455C254.929455 46.545455 46.545455 254.929455 46.545455 512s208.384 465.454545 465.454545 465.454545 465.454545-208.384 465.454545-465.454545S769.070545 46.545455 512 46.545455z"
        fill={getIconColor(color, 0, '#DFDFE0')}
      />
    </svg>
  );
};

Icon22ToumingWeixuanzhong.defaultProps = {
  size: 18,
};

export default Icon22ToumingWeixuanzhong;
