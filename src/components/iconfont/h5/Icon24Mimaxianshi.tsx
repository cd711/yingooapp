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

const Icon24Mimaxianshi: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 219.904c168.192 0 306.133333 93.44 411.733333 276.053333l9.216 16.042667-9.258666 16c-105.557333 182.613333-243.498667 276.096-411.690667 276.096-168.192 0-306.133333-93.44-411.733333-276.053333L91.093333 512l9.258667-16C205.866667 313.386667 343.808 219.904 512 219.904z m0 64c-134.954667 0-247.466667 70.826667-339.328 216.021333l-7.509333 12.032 7.509333 12.117334c89.002667 140.672 197.376 211.541333 326.741333 215.808l12.586667 0.213333c134.954667 0 247.466667-70.826667 339.328-216.021333l7.466667-12.117334-7.466667-12.032c-89.002667-140.672-197.376-211.541333-326.741333-215.808z m0 110.762667c9.898667 0 19.498667 1.237333 28.714667 3.541333v87.765333l82.218666 64.384A117.376 117.376 0 1 1 512 394.666667z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24Mimaxianshi.defaultProps = {
  size: 18,
};

export default Icon24Mimaxianshi;
