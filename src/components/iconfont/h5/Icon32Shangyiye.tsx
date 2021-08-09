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

const Icon32Shangyiye: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
        fill={getIconColor(color, 0, '#000000')}
        opacity=".25"
      />
      <path
        d="M341.952 516.32a24.064 24.064 0 0 0 7.264 16.736l233.664 228.8a24.16 24.16 0 0 0 33.824-34.528l-216.832-212.32 217.6-233.76a24.192 24.192 0 0 0-35.392-32.96l-233.664 251.04a24.16 24.16 0 0 0-6.464 17.056v-0.064z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </svg>
  );
};

Icon32Shangyiye.defaultProps = {
  size: 18,
};

export default Icon32Shangyiye;
