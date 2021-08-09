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

const Icon24BianjiqiZuoduiqi: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M42.666667 42.666667h938.666666v938.666666H42.666667z"
        fill={getIconColor(color, 0, '#FFFFFF')}
        fill-opacity=".01"
      />
      <path
        d="M707.541333 773.333333a32 32 0 0 1 4.352 63.701334l-4.352 0.298666H160a32 32 0 0 1-4.352-63.701333l4.352-0.298667h547.541333z m156.458667-195.541333a32 32 0 0 1 4.352 63.701333l-4.352 0.298667H160a32 32 0 0 1-4.352-63.701333l4.352-0.298667h704z m-156.458667-195.584a32 32 0 0 1 4.352 63.701333l-4.352 0.298667H160a32 32 0 0 1-4.352-63.701333l4.352-0.298667h547.541333z m156.458667-195.541333a32 32 0 0 1 4.352 63.701333l-4.352 0.298667H160a32 32 0 0 1-4.352-63.701334l4.352-0.298666h704z"
        fill={getIconColor(color, 1, '#121314')}
      />
    </svg>
  );
};

Icon24BianjiqiZuoduiqi.defaultProps = {
  size: 18,
};

export default Icon24BianjiqiZuoduiqi;
