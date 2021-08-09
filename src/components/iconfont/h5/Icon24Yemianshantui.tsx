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

const Icon24Yemianshantui: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M560.64 370.048l48.256-185.429333a46.506667 46.506667 0 0 0-79.616-42.88L223.573333 481.152a46.506667 46.506667 0 0 0 23.978667 76.458667l130.389333 30.549333a46.506667 46.506667 0 0 1 34.389334 57.045333l-48.213334 185.472a46.506667 46.506667 0 0 0 79.616 42.88l305.706667-339.456a46.506667 46.506667 0 0 0-23.978667-76.458666l-130.389333-30.549334a46.506667 46.506667 0 0 1-34.432-57.045333z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24Yemianshantui.defaultProps = {
  size: 18,
};

export default Icon24Yemianshantui;
