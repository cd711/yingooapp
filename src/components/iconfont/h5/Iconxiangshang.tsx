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

const Iconxiangshang: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M489.685333 299.562667a34.474667 34.474667 0 0 0-23.978666 10.410666l-327.68 334.634667a34.602667 34.602667 0 0 0 49.493333 48.426667l304.042667-310.528 334.762666 311.68a34.645333 34.645333 0 1 0 47.189334-50.730667l-359.466667-334.634667a34.474667 34.474667 0 0 0-24.448-9.258666h0.085333z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Iconxiangshang.defaultProps = {
  size: 18,
};

export default Iconxiangshang;
