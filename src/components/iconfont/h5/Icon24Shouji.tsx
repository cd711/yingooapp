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

const Icon24Shouji: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M766.634667 42.666667a85.333333 85.333333 0 0 1 85.333333 85.333333v748.714667a85.333333 85.333333 0 0 1-85.333333 85.333333H256.256a85.333333 85.333333 0 0 1-85.333333-85.333333V128a85.333333 85.333333 0 0 1 85.333333-85.333333h510.378667z m-255.146667 725.333333c-40.917333 0-68.138667 34.048-68.138667 68.096 0 47.658667 27.221333 74.922667 68.096 74.922667 40.874667 0 68.096-34.048 68.096-74.922667S552.32 768 511.445333 768z m195.669333-629.973333H308.906667a42.666667 42.666667 0 0 0-42.666667 42.666666v486.698667a42.666667 42.666667 0 0 0 42.666667 42.666667h398.208a42.666667 42.666667 0 0 0 42.666666-42.666667V180.693333a42.666667 42.666667 0 0 0-42.666666-42.666666z"
        fill={getIconColor(color, 0, '#FFC700')}
      />
    </svg>
  );
};

Icon24Shouji.defaultProps = {
  size: 18,
};

export default Icon24Shouji;
