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

const Icon24Lianjie: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M446.293333 446.293333a32 32 0 0 1 45.269334 45.269334c-41.088 41.130667-41.941333 106.368-2.56 145.792l1.194666 1.365333 1.365334 1.194667 164.906666 164.906666 4.864 4.522667c39.765333 34.773333 101.461333 32.384 140.928-7.082667 41.088-41.088 41.984-106.368 2.56-145.792l-141.354666-141.354666-2.858667-3.242667a32 32 0 0 1 48.128-41.984l141.354667 141.354667 5.845333 6.186666c58.666667 65.066667 55.338667 166.314667-8.405333 230.101334-65.834667 65.792-171.605333 67.242667-236.288 2.56l-164.906667-164.906667-1.237333-1.28a32.512 32.512 0 0 1-1.322667-1.28c-64.682667-64.682667-63.274667-170.496 2.56-236.288zM177.28 177.92c63.744-63.786667 165.034667-67.072 230.101333-8.448l6.186667 5.888 164.906667 164.906667c64.682667 64.682667 63.274667 170.453333-2.56 236.288a32 32 0 1 1-45.226667-45.226667c41.045333-41.130667 41.941333-106.410667 2.56-145.792L368.213333 220.586667c-39.381333-39.424-104.661333-38.570667-145.749333 2.56-39.466667 39.424-41.813333 101.162667-7.125333 140.928l4.565333 4.821333 141.354667 141.354667a32 32 0 0 1-41.984 48.128l-3.285334-2.858667-141.354666-141.354667c-64.682667-64.682667-63.274667-170.453333 2.56-236.288z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24Lianjie.defaultProps = {
  size: 18,
};

export default Icon24Lianjie;
