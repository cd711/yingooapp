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

const Icon20Dingwei: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 69.632a409.6 409.6 0 0 1 409.6 409.6c0 132.352-105.1648 280.064-315.5456 442.9824a153.6 153.6 0 0 1-188.1088 0l-18.2784-14.336C201.5232 750.592 102.4 607.6928 102.4 479.232a409.6 409.6 0 0 1 409.6-409.6z m0 307.2a102.4 102.4 0 1 0 0 204.8 102.4 102.4 0 0 0 0-204.8z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon20Dingwei.defaultProps = {
  size: 18,
};

export default Icon20Dingwei;
