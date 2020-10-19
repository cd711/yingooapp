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

const IconmobanB: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M85.333333 128m85.333334 0l192 0q85.333333 0 85.333333 85.333333l0 192q0 85.333333-85.333333 85.333334l-192 0q-85.333333 0-85.333334-85.333334l0-192q0-85.333333 85.333334-85.333333Z"
        fill={getIconColor(color, 0, '#FF4966')}
      />
      <path
        d="M85.333333 554.666667m85.333334 0l192 0q85.333333 0 85.333333 85.333333l0 192q0 85.333333-85.333333 85.333333l-192 0q-85.333333 0-85.333334-85.333333l0-192q0-85.333333 85.333334-85.333333Z"
        fill={getIconColor(color, 1, '#FF4966')}
      />
      <path
        d="M725.333333 46.512885m60.339779 60.339779l120.679557 120.679557q60.339779 60.339779 0 120.679558l-120.679557 120.679557q-60.339779 60.339779-120.679557 0l-120.679558-120.679557q-60.339779-60.339779 0-120.679558l120.679558-120.679557q60.339779-60.339779 120.679557 0Z"
        fill={getIconColor(color, 2, '#FF4966')}
        opacity=".5"
      />
      <path
        d="M554.666667 554.666667m85.333333 0l192 0q85.333333 0 85.333333 85.333333l0 192q0 85.333333-85.333333 85.333333l-192 0q-85.333333 0-85.333333-85.333333l0-192q0-85.333333 85.333333-85.333333Z"
        fill={getIconColor(color, 3, '#FF4966')}
      />
    </svg>
  );
};

IconmobanB.defaultProps = {
  size: 18,
};

export default IconmobanB;
