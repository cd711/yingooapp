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

const Icon52Guan: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1664 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M0 0m461.449505 0l576.81188 0q461.449505 0 461.449505 461.449505l0 0q0 461.449505-461.449505 461.449504l-576.81188 0q-461.449505 0-461.449505-461.449504l0 0q0-461.449505 461.449505-461.449505Z"
        fill={getIconColor(color, 0, '#DFDFE0')}
      />
      <path
        d="M461.449505 461.449505m-403.768317 0a403.768317 403.768317 0 1 0 807.536633 0 403.768317 403.768317 0 1 0-807.536633 0Z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </svg>
  );
};

Icon52Guan.defaultProps = {
  size: 18,
};

export default Icon52Guan;
