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

const Icon24BianjiqiJinzhi: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M42.666667 42.666667h938.666666v938.666666H42.666667z"
        fill={getIconColor(color, 0, '#FFFFFF')}
        fill-opacity=".01"
      />
      <path
        d="M512 88.874667c233.685333 0 423.125333 189.44 423.125333 423.125333 0 233.685333-189.44 423.125333-423.125333 423.125333-233.685333 0-423.125333-189.44-423.125333-423.125333 0-233.685333 189.44-423.125333 423.125333-423.125333z m0 64a359.125333 359.125333 0 1 0 0 718.250666 359.125333 359.125333 0 0 0 0-718.250666z m-156.970667 157.44l3.584 3.072 352 352a32 32 0 0 1-41.642666 48.341333l-3.584-3.114667-352-352a32 32 0 0 1 41.642666-48.341333z"
        fill={getIconColor(color, 1, '#121314')}
      />
    </svg>
  );
};

Icon24BianjiqiJinzhi.defaultProps = {
  size: 18,
};

export default Icon24BianjiqiJinzhi;
