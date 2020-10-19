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

const Icondaifukuan: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M774.229333 128.512a146.944 146.944 0 0 1 146.944 146.944v464.085333a146.944 146.944 0 0 1-146.944 146.944H232.789333a146.944 146.944 0 0 1-146.944-146.944V275.456a146.944 146.944 0 0 1 146.944-146.944h541.44z m0 61.866667H232.789333a85.077333 85.077333 0 0 0-85.077333 85.077333v464.085333c0 46.976 38.101333 85.077333 85.077333 85.077334h541.44a85.077333 85.077333 0 0 0 85.077334-85.077334v-85.077333h-278.442667c-38.442667 0-69.632-31.146667-69.632-69.632v-154.666667c0-38.442667 31.146667-69.632 69.632-69.632h278.442667V275.456a85.077333 85.077333 0 0 0-85.077334-85.077333z m85.077334 232.064h-278.442667c-4.266667 0-7.765333 3.413333-7.765333 7.68v154.709333c0 4.266667 3.498667 7.765333 7.765333 7.765333h278.442667V422.4z m-201.130667 46.378666a38.656 38.656 0 1 1 0 77.354667 38.656 38.656 0 0 1 0-77.354667z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icondaifukuan.defaultProps = {
  size: 18,
};

export default Icondaifukuan;
