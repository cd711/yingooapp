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

const Icon24BianjiqiZiti: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M42.666667 42.666667h938.666666v938.666666H42.666667z"
        fill={getIconColor(color, 0, '#FFFFFF')}
        fill-opacity=".01"
      />
      <path
        d="M355.541333 896a32 32 0 0 1-4.309333-63.701333l4.309333-0.298667h124.458667v-640H231.082667v64.469333a32 32 0 0 1-27.648 31.701334l-4.309334 0.298666a32 32 0 0 1-31.701333-27.648l-0.298667-4.352V160a32 32 0 0 1 27.648-31.701333L199.125333 128h625.749334a32 32 0 0 1 31.701333 27.648l0.298667 4.352v96.469333a32 32 0 0 1-63.701334 4.352l-0.298666-4.352V192H544v640h124.458667a32 32 0 0 1 4.309333 63.701333l-4.309333 0.298667H355.541333z"
        fill={getIconColor(color, 1, '#121314')}
      />
    </svg>
  );
};

Icon24BianjiqiZiti.defaultProps = {
  size: 18,
};

export default Icon24BianjiqiZiti;
