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

const Icon24BianjiqiJuzhongduiqi: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M42.666667 42.666667h938.666666v938.666666H42.666667z"
        fill={getIconColor(color, 0, '#FFFFFF')}
        fill-opacity=".01"
      />
      <path
        d="M746.666667 773.333333a32 32 0 0 1 4.352 63.701334l-4.352 0.298666h-469.333334a32 32 0 0 1-4.352-63.701333l4.352-0.298667h469.333334z m117.333333-195.541333a32 32 0 0 1 4.352 63.701333l-4.352 0.298667H160a32 32 0 0 1-4.352-63.701333l4.352-0.298667h704zM746.666667 382.208a32 32 0 0 1 4.352 63.701333l-4.352 0.298667h-469.333334a32 32 0 0 1-4.352-63.701333l4.352-0.298667h469.333334z m117.333333-195.541333a32 32 0 0 1 4.352 63.701333l-4.352 0.298667H160a32 32 0 0 1-4.352-63.701334l4.352-0.298666h704z"
        fill={getIconColor(color, 1, '#121314')}
      />
    </svg>
  );
};

Icon24BianjiqiJuzhongduiqi.defaultProps = {
  size: 18,
};

export default Icon24BianjiqiJuzhongduiqi;
