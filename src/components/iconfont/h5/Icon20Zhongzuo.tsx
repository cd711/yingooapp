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

const Icon20Zhongzuo: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M726.528 514.048a38.4 38.4 0 0 0-3.4816 50.432l3.4304 3.8912a38.4 38.4 0 0 0 50.3808 3.4816l3.9424-3.4816 180.992-180.992a38.4 38.4 0 0 0 3.4304-50.3808l-3.4304-3.9424L780.8 152.064a38.4 38.4 0 0 0-57.7536 50.3808l3.4304 3.8912 120.064 120.064H333.056a288 288 0 0 0-11.264 575.7952l11.264 0.2048h204.8a32 32 0 0 0 4.7104-63.6416l-4.7104-0.3584h-204.8a224 224 0 0 1-10.8544-447.744l10.8544-0.256h517.0688l-123.648 123.6992z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon20Zhongzuo.defaultProps = {
  size: 18,
};

export default Icon20Zhongzuo;
