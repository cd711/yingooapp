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

const Icon24BianjiqiFuzhi: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M42.666667 42.666667h938.666666v938.666666H42.666667z"
        fill={getIconColor(color, 0, '#FFFFFF')}
        fill-opacity=".01"
      />
      <path
        d="M844.458667 88.874667c47.872 0 87.125333 37.12 90.453333 84.224l0.213333 6.442666v508.458667c0 47.914667-37.12 87.125333-84.224 90.453333l-6.442666 0.213334h-65.834667l0.042667 39.125333a117.333333 117.333333 0 0 1-110.165334 117.12l-7.168 0.213333H206.208a117.333333 117.333333 0 0 1-117.333333-117.333333V362.666667a117.333333 117.333333 0 0 1 117.333333-117.333334h39.082667l0.042666-65.792c0-47.872 37.12-87.125333 84.181334-90.453333l6.485333-0.213333h508.458667zM661.333333 309.333333H206.208c-29.44 0-53.333333 23.893333-53.333333 53.333334v455.125333c0 29.44 23.893333 53.333333 53.333333 53.333333H661.333333c29.44 0 53.333333-23.893333 53.333334-53.333333V362.666667c0-29.44-23.893333-53.333333-53.333334-53.333334z m183.125334-156.458666H336a26.666667 26.666667 0 0 0-26.368 22.741333l-0.298667 3.925333V245.333333l352 0.042667a117.333333 117.333333 0 0 1 117.12 110.165333l0.213334 7.168v352h65.792a26.666667 26.666667 0 0 0 26.368-22.741333l0.298666-3.925333V179.541333a26.666667 26.666667 0 0 0-22.741333-26.368l-3.925333-0.298666z"
        fill={getIconColor(color, 1, '#121314')}
      />
    </svg>
  );
};

Icon24BianjiqiFuzhi.defaultProps = {
  size: 18,
};

export default Icon24BianjiqiFuzhi;
