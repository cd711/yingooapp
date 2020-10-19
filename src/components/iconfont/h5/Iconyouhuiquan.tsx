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

const Iconyouhuiquan: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M788.608 138.666667a154.666667 154.666667 0 0 1 154.666667 154.709333V415.146667c0 13.653333-8.490667 25.685333-20.949334 30.421333l-4.309333 1.28a93.312 93.312 0 0 0-0.426667 181.76 33.28 33.28 0 0 1 25.685334 32.426667v80.042666a154.666667 154.666667 0 0 1-154.666667 154.709334H218.709333A154.666667 154.666667 0 0 1 64 741.12v-78.506667c0-13.952 8.661333-26.24 21.376-31.146666l4.394667-1.322667a93.44 93.44 0 0 0-0.512-182.101333 32.554667 32.554667 0 0 1-25.258667-31.701334V293.376A154.666667 154.666667 0 0 1 218.709333 138.666667h569.898667z m0 65.152H218.709333c-49.493333 0-89.6 40.106667-89.6 89.557333v99.285333a158.592 158.592 0 0 1 0 292.992v55.466667c0 49.493333 40.106667 89.6 89.6 89.6h569.898667c49.450667 0 89.557333-40.106667 89.557333-89.6v-56.96a158.421333 158.421333 0 0 1 0-292.693333v-98.133334c0-49.450667-40.106667-89.514667-89.6-89.514666z m-162.858667 382.634666a32.554667 32.554667 0 0 1 0 65.109334H381.525333a32.554667 32.554667 0 1 1 0-65.109334z m0-203.52a32.554667 32.554667 0 0 1 0 65.109334H381.525333a32.554667 32.554667 0 1 1 0-65.109334z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Iconyouhuiquan.defaultProps = {
  size: 18,
};

export default Iconyouhuiquan;
