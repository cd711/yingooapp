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

const Iconqubaocun: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M611.968 108.8a200.533333 200.533333 0 0 1 141.824 58.752l113.322667 113.322667A200.533333 200.533333 0 0 1 925.866667 422.698667v398.634666a115.2 115.2 0 0 1-115.2 115.2H213.333333a115.2 115.2 0 0 1-115.2-115.2v-597.333333A115.2 115.2 0 0 1 213.333333 108.8z m0 59.733333L328.533333 168.490667V309.333333a12.8 12.8 0 0 0 9.856 12.458667L341.333333 322.133333h298.666667a29.866667 29.866667 0 0 1 4.053333 59.477334L640 381.866667H341.333333a72.533333 72.533333 0 0 1-72.277333-66.261334L268.8 309.333333V168.490667L213.333333 168.533333a55.466667 55.466667 0 0 0-55.168 49.792L157.866667 224v597.333333a55.466667 55.466667 0 0 0 55.466666 55.466667l55.466667-0.042667V608a72.533333 72.533333 0 0 1 66.261333-72.277333L341.333333 535.466667h341.333334a72.533333 72.533333 0 0 1 72.277333 66.261333l0.256 6.272v268.757333l55.466667 0.042667a55.466667 55.466667 0 0 0 55.168-49.792l0.298666-5.674667V422.698667a140.8 140.8 0 0 0-41.258666-99.584l-113.322667-113.322667a140.8 140.8 0 0 0-99.584-41.258667z m70.698667 426.666667H341.333333a12.8 12.8 0 0 0-12.458666 9.856l-0.341334 2.944v268.757333h366.933334V608a12.8 12.8 0 0 0-9.856-12.458667L682.666667 595.2z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Iconqubaocun.defaultProps = {
  size: 18,
};

export default Iconqubaocun;
