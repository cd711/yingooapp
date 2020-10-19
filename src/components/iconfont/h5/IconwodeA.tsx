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

const IconwodeA: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 85.333333h341.333333a85.333333 85.333333 0 0 1 85.333334 85.333334v341.333333H512V85.333333z"
        fill={getIconColor(color, 0, '#D7D7DA')}
        opacity=".5"
      />
      <path
        d="M512 512m-426.666667 0a426.666667 426.666667 0 1 0 853.333334 0 426.666667 426.666667 0 1 0-853.333334 0Z"
        fill={getIconColor(color, 1, '#D7D7DA')}
      />
      <path
        d="M715.648 670.378667a32 32 0 0 1 0 45.269333 288 288 0 0 1-407.296 0 32 32 0 0 1 45.226667-45.226667 224 224 0 0 0 316.8 0 32 32 0 0 1 45.269333 0z"
        fill={getIconColor(color, 2, '#FFFFFF')}
      />
    </svg>
  );
};

IconwodeA.defaultProps = {
  size: 18,
};

export default IconwodeA;
