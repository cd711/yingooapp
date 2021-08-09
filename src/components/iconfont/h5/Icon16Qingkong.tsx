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

const Icon16Qingkong: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
        fill={getIconColor(color, 0, '#000000')}
        opacity=".4"
      />
      <path
        d="M290.88 257.6a47.04 47.04 0 0 0-33.28 33.28l-1.28 6.976a47.04 47.04 0 0 0 13.44 38.4L445.504 512l-175.744 175.744a47.04 47.04 0 0 0 21.12 78.656l7.04 1.28a47.04 47.04 0 0 0 38.4-13.44l175.616-175.744 175.744 175.744a47.04 47.04 0 0 0 66.56 0l4.48-5.248a47.04 47.04 0 0 0-4.48-61.248L578.496 512l175.744-175.744a47.04 47.04 0 0 0 0-66.496l-5.312-4.544a47.04 47.04 0 0 0-61.248 4.544L512 445.504 336.32 269.76a47.04 47.04 0 0 0-45.44-12.16z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </svg>
  );
};

Icon16Qingkong.defaultProps = {
  size: 18,
};

export default Icon16Qingkong;
