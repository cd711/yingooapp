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

const Icon24Jiahao: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M475.605333 475.605333V203.52a32.213333 32.213333 0 1 1 64.426667 0v272.128h272.213333a32.213333 32.213333 0 0 1 0 64.426667h-272.213333v272.213333a32.213333 32.213333 0 0 1-64.426667 0v-272.213333H203.477333a32.213333 32.213333 0 0 1 0-64.426667h272.128z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24Jiahao.defaultProps = {
  size: 18,
};

export default Icon24Jiahao;
