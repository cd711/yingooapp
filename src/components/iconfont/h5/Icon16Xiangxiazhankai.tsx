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

const Icon16Xiangxiazhankai: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M773.12 369.28a48.64 48.64 0 0 0-60.288 2.496L502.784 554.944l-190.08-181.76a48.512 48.512 0 0 0-44.736-11.84 46.72 46.72 0 0 0-34.112 31.872 44.992 44.992 0 0 0 12.288 45.44l221.76 212.096c8.64 8.32 20.224 12.992 32.384 13.248l6.4-0.32a49.408 49.408 0 0 0 26.24-11.392l243.328-212.16a44.992 44.992 0 0 0 2.496-66.048l-5.632-4.864z"
        fill={getIconColor(color, 0, '#000000')}
      />
    </svg>
  );
};

Icon16Xiangxiazhankai.defaultProps = {
  size: 18,
};

export default Icon16Xiangxiazhankai;
