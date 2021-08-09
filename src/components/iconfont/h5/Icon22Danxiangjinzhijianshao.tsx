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

const Icon22Danxiangjinzhijianshao: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
        fill={getIconColor(color, 0, '#D7D7DA')}
      />
      <path
        d="M253.672727 512a34.909091 34.909091 0 0 1 30.161455-34.583273l4.747636-0.325818h446.836364a34.909091 34.909091 0 0 1 4.747636 69.492364l-4.747636 0.325818H288.581818a34.909091 34.909091 0 0 1-34.909091-34.909091z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </svg>
  );
};

Icon22Danxiangjinzhijianshao.defaultProps = {
  size: 18,
};

export default Icon22Danxiangjinzhijianshao;
