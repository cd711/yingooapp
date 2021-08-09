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

const Icon24BianjiqiMoban: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M810.666667 128a85.333333 85.333333 0 0 1 85.333333 85.333333v597.333334a85.333333 85.333333 0 0 1-85.333333 85.333333H213.333333a85.333333 85.333333 0 0 1-85.333333-85.333333V213.333333a85.333333 85.333333 0 0 1 85.333333-85.333333h597.333334z m-336 74.666667H224a21.333333 21.333333 0 0 0-21.333333 21.333333v576a21.333333 21.333333 0 0 0 21.333333 21.333333h250.666667V202.666667z m346.666666 352.981333h-272v265.685333h250.666667a21.333333 21.333333 0 0 0 21.333333-21.333333v-244.352z m-21.333333-352.981333h-250.666667v278.314666h272V224a21.333333 21.333333 0 0 0-21.333333-21.333333z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24BianjiqiMoban.defaultProps = {
  size: 18,
};

export default Icon24BianjiqiMoban;
