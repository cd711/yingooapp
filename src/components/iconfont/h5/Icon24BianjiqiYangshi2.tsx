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

const Icon24BianjiqiYangshi2: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 42.666667c65.706667 0 124.672 40.533333 148.224 101.888L932.352 853.333333A94.208 94.208 0 0 1 844.373333 981.333333a149.845333 149.845333 0 0 1-140.757333-98.517333l-42.069333-115.456h-299.093334l-42.069333 115.456a149.845333 149.845333 0 0 1-132.565333 98.304L179.626667 981.333333a94.208 94.208 0 0 1-87.936-128L363.776 144.597333A158.762667 158.762667 0 0 1 512 42.666667z m0 42.666666a116.096 116.096 0 0 0-108.373333 74.496L131.498667 868.650667l-1.706667 5.333333A51.541333 51.541333 0 0 0 179.626667 938.666667c45.013333 0 85.248-28.16 100.693333-70.442667l52.309333-143.488h358.784l52.309334 143.488 2.986666 7.296A107.178667 107.178667 0 0 0 844.373333 938.666667a51.541333 51.541333 0 0 0 48.085334-69.973334L620.416 159.786667l-3.114667-7.338667A116.096 116.096 0 0 0 512 85.333333z m33.024 107.946667l165.034667 459.392H313.770667l166.528-459.434667h64.725333z m-30.037333 42.666667h-4.778667L374.613333 609.962667h274.773334l-134.4-374.101334z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24BianjiqiYangshi2.defaultProps = {
  size: 18,
};

export default Icon24BianjiqiYangshi2;
