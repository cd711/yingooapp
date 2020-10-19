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

const Iconchuanshuwenti: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M686.208 513.792V192a42.666667 42.666667 0 0 0-42.666667-42.666667H394.453333a42.666667 42.666667 0 0 0-42.666666 42.666667v321.792H228.394667a42.666667 42.666667 0 0 0-30.762667 72.192l124.885333 130.133333 132.565334 138.24a85.333333 85.333333 0 0 0 123.178666 0l132.565334-138.24 124.885333-130.133333a42.666667 42.666667 0 0 0-30.805333-72.192h-118.698667z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Iconchuanshuwenti.defaultProps = {
  size: 18,
};

export default Iconchuanshuwenti;
