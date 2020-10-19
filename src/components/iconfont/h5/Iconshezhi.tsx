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

const Iconshezhi: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M646.528 128c56.021333 0 107.733333 29.866667 135.722667 78.378667h0.042666l134.826667 233.472a156.757333 156.757333 0 0 1 0 156.757333l-134.826667 233.472a156.757333 156.757333 0 0 1-135.765333 78.378667H376.917333c-55.978667 0-107.690667-29.866667-135.68-78.378667l-134.912-233.472a156.757333 156.757333 0 0 1 0-156.757333l134.826667-233.472A156.757333 156.757333 0 0 1 376.917333 128h269.653334z m0 66.005333H376.917333c-32.426667 0-62.336 17.28-78.549333 45.354667l-134.826667 233.472a90.752 90.752 0 0 0 0 90.752l134.826667 233.472a90.752 90.752 0 0 0 78.549333 45.397333h269.653334c32.426667 0 62.336-17.322667 78.549333-45.397333l134.826667-233.472c16.213333-28.074667 16.213333-62.634667 0-90.752l-134.826667-233.472a90.752 90.752 0 0 0-78.592-45.354667z m-134.826667 167.466667a156.757333 156.757333 0 1 1 0 313.514667 156.757333 156.757333 0 0 1 0-313.514667z m0 66.005333a90.752 90.752 0 1 0 0 181.504 90.752 90.752 0 0 0 0-181.504z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Iconshezhi.defaultProps = {
  size: 18,
};

export default Iconshezhi;
