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

const Icon24BianjiqiShubiaodian: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M832 117.333333h-640A117.333333 117.333333 0 0 0 74.666667 234.666667v554.666666a117.333333 117.333333 0 0 0 117.333333 117.333334h640a117.333333 117.333333 0 0 0 117.333333-117.333334v-554.666666a117.333333 117.333333 0 0 0-117.333333-117.333334z m-640 64h640c29.44 0 53.333333 23.893333 53.333333 53.333334v554.666666c0 29.44-23.893333 53.333333-53.333333 53.333334h-640c-29.44 0-53.333333-23.893333-53.333333-53.333334v-554.666666c0-29.44 23.893333-53.333333 53.333333-53.333334z"
        fill={getIconColor(color, 0, '#121314')}
      />
      <path
        d="M640 458.666667a117.333333 117.333333 0 0 0-117.333333 117.333333v85.333333a117.333333 117.333333 0 1 0 234.666666 0v-85.333333A117.333333 117.333333 0 0 0 640 458.666667z m0 64c29.44 0 53.333333 23.893333 53.333333 53.333333v85.333333a53.333333 53.333333 0 0 1-106.666666 0v-85.333333c0-29.44 23.893333-53.333333 53.333333-53.333333z"
        fill={getIconColor(color, 1, '#121314')}
      />
      <path
        d="M640 558.933333a21.333333 21.333333 0 0 1 20.992 17.493334l0.341333 3.84v18.346666a21.333333 21.333333 0 0 1-42.325333 3.84l-0.341333-3.84v-18.346666a21.333333 21.333333 0 0 1 21.333333-21.333334z"
        fill={getIconColor(color, 2, '#121314')}
      />
    </svg>
  );
};

Icon24BianjiqiShubiaodian.defaultProps = {
  size: 18,
};

export default Icon24BianjiqiShubiaodian;
