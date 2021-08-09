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

const Icon24Qubianji: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M465.152 189.653333a32 32 0 0 1 4.352 63.701334l-4.352 0.298666H202.922667c-22.144 0-40.32 16.768-42.666667 38.272l-0.256 4.693334v524.458666c0 22.144 16.725333 40.32 38.229333 42.666667l4.693334 0.256H727.466667c22.101333 0 40.32-16.725333 42.666666-38.229333l0.256-4.693334v-262.229333a32 32 0 0 1 63.701334-4.352l0.298666 4.352v262.229333a106.922667 106.922667 0 0 1-99.882666 106.666667l-7.04 0.256H202.922667a106.922667 106.922667 0 0 1-106.666667-99.882667l-0.256-7.04V296.533333a106.922667 106.922667 0 0 1 99.882667-106.666666l7.04-0.256h262.229333z m258.346667-46.805333a111.488 111.488 0 0 1 157.653333 157.653333l-355.882667 355.882667a32 32 0 0 1-14.890666 8.405333l-149.845334 37.461334a32 32 0 0 1-38.826666-38.826667l37.504-149.802667a32 32 0 0 1 8.405333-14.890666z m112.426666 45.226667a47.488 47.488 0 0 0-67.157333 0l-349.696 349.653333-22.357333 89.472 89.557333-22.4 349.653333-349.568c17.194667-17.237333 18.432-44.373333 3.669334-63.018667z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24Qubianji.defaultProps = {
  size: 18,
};

export default Icon24Qubianji;
