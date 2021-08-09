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

const Icon24BianjiqiChuizhifanzhuan: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M746.666667 639.146667c30.378667 0 40.704 40.533333 14.08 55.04l-430.250667 234.666666a29.354667 29.354667 0 0 1-43.392-25.728v-234.666666c0-16.213333 13.141333-29.354667 29.354667-29.354667z m-115.072 58.624H345.770667v155.904l285.824-155.904z m232.405333-215.082667a29.312 29.312 0 0 1 4.352 58.325333l-4.352 0.341334H160A29.312 29.312 0 0 1 155.648 482.986667l4.352-0.341334h704zM287.146667 120.832A29.312 29.312 0 0 1 330.453333 95.146667l430.208 234.666666c26.666667 14.506667 16.341333 55.04-14.037333 55.04H316.458667a29.312 29.312 0 0 1-29.354667-29.312z m58.624 49.408v155.904h285.824L345.770667 170.282667z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24BianjiqiChuizhifanzhuan.defaultProps = {
  size: 18,
};

export default Icon24BianjiqiChuizhifanzhuan;
