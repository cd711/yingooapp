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

const Icon24Gengduo: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M245.333333 448a53.333333 53.333333 0 1 1 0 106.666667 53.333333 53.333333 0 0 1 0-106.666667z m277.333334 0a53.333333 53.333333 0 1 1 0 106.666667 53.333333 53.333333 0 0 1 0-106.666667z m277.333333 0a53.333333 53.333333 0 1 1 0 106.666667 53.333333 53.333333 0 0 1 0-106.666667z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24Gengduo.defaultProps = {
  size: 18,
};

export default Icon24Gengduo;
