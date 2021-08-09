/* tslint:disable */
/* eslint-disable */

import { CSSProperties, DOMAttributes, FunctionComponent } from 'react';
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

const Icon24BianjiqiHuantu: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M42.666667 42.666667h938.666666v938.666666H42.666667z"
        fill={getIconColor(color, 0, '#FFFFFF')}
        fill-opacity=".01"
      />
      <path
        d="M903.125333 147.541333a32 32 0 0 1 32 32v625.792a32 32 0 0 1-32 32H120.874667a32 32 0 0 1-32-32V179.541333a32 32 0 0 1 32-32z m-32.042666 64H152.874667v561.792h718.208V211.541333zM746.666667 558.208a32 32 0 0 1 4.352 63.744l-4.352 0.256h-469.333334a32 32 0 0 1-4.352-63.701333l4.352-0.298667h469.333334zM316.458667 382.208a32 32 0 0 1 4.309333 63.744l-4.309333 0.256H277.333333a32 32 0 0 1-4.352-63.701333l4.352-0.298667h39.125334z m176 0a32 32 0 0 1 4.309333 63.744l-4.309333 0.256h-39.125334a32 32 0 0 1-4.352-63.701333l4.352-0.298667h39.125334z m254.208 0a32 32 0 0 1 4.352 63.744l-4.352 0.256h-136.874667a32 32 0 0 1-4.352-63.701333l4.352-0.298667H746.666667z"
        fill={getIconColor(color, 1, '#121314')}
      />
    </svg>
  );
};

Icon24BianjiqiHuantu.defaultProps = {
  size: 18,
};

export default Icon24BianjiqiHuantu;
