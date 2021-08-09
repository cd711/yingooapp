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

const Icon24BianjiqiYangshi: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M42.666667 42.666667h938.666666v938.666666H42.666667z"
        fill={getIconColor(color, 0, '#FFFFFF')}
        fill-opacity=".01"
      />
      <path
        d="M419.413333 178.688l2.645334 3.84 2.218666 4.394667 273.749334 664.874666a32 32 0 0 1-57.258667 28.288l-1.92-3.882666-88.490667-214.912H238.933333l-88.448 214.912a32 32 0 0 1-60.586666-20.266667l1.408-4.138667L365.056 186.922667a32.042667 32.042667 0 0 1 54.357333-8.234667z m483.712 614.186667a32 32 0 0 1 4.309334 63.701333l-4.309334 0.298667h-78.250666a32 32 0 0 1-4.309334-63.701334l4.309334-0.298666h78.250666z m0-195.541334a32 32 0 0 1 4.309334 63.701334l-4.309334 0.298666H746.666667a32 32 0 0 1-4.352-63.701333L746.666667 597.333333h156.458666zM394.666667 283.136l-129.365334 314.154667h258.688L394.666667 283.136z m508.458666 118.613333a32 32 0 0 1 4.309334 63.744l-4.309334 0.298667h-234.666666a32 32 0 0 1-4.352-63.701333l4.352-0.298667h234.666666z m0-195.541333a32 32 0 0 1 4.309334 63.701333l-4.309334 0.298667h-312.917333a32 32 0 0 1-4.309333-63.701333l4.309333-0.298667h312.917333z"
        fill={getIconColor(color, 1, '#121314')}
      />
    </svg>
  );
};

Icon24BianjiqiYangshi.defaultProps = {
  size: 18,
};

export default Icon24BianjiqiYangshi;
