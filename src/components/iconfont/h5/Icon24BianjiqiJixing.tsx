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

const Icon24BianjiqiJixing: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M725.333333 64a122.666667 122.666667 0 0 1 122.666667 122.666667v640A122.666667 122.666667 0 0 1 725.333333 949.333333H298.666667a122.666667 122.666667 0 0 1-122.666667-122.666666v-640A122.666667 122.666667 0 0 1 298.666667 64z m0 74.666667h-42.666666v5.333333a42.666667 42.666667 0 0 1-42.666667 42.666667H384a42.666667 42.666667 0 0 1-42.666667-42.666667V138.666667H298.666667c-24.746667 0-45.098667 18.730667-47.701334 42.752l-0.298666 5.248v640c0 26.496 21.504 48 48 48h426.666666c26.496 0 48-21.504 48-48v-640c0-26.496-21.504-48-48-48z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24BianjiqiJixing.defaultProps = {
  size: 18,
};

export default Icon24BianjiqiJixing;
