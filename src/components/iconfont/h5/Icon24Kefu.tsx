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

const Icon24Kefu: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M506.666667 43.093333c204.8 0 370.816 166.058667 370.816 370.858667h46.378666c25.6 0 46.336 20.736 46.336 46.336v185.429333c0 25.6-20.736 46.336-46.336 46.336h-46.378666v69.546667a208.597333 208.597333 0 0 1-208.597334 208.597333h-115.882666a46.336 46.336 0 1 1 0-92.714666h115.882666c64 0 115.882667-51.882667 115.882667-115.882667V413.952a278.144 278.144 0 1 0-556.245333 0v214.101333a64 64 0 0 1-64 64H89.472c-25.6 0-46.336-20.736-46.336-46.336v-185.429333c0-25.6 20.736-46.336 46.336-46.336h46.336c0-204.8 166.058667-370.816 370.858667-370.816zM682.666667 485.376c26.496 0 48 21.504 48 48a218.709333 218.709333 0 0 1-437.333334 0 48 48 0 0 1 96 0 122.709333 122.709333 0 0 0 244.48 14.336l0.64-7.125333 0.213334-7.210667c0-26.496 21.504-48 48-48z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24Kefu.defaultProps = {
  size: 18,
};

export default Icon24Kefu;
