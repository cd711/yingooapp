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

const Icon24Gouxuan: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M232.448 531.456a35.84 35.84 0 0 0-52.181333 49.024l162.645333 173.312c16.512 17.621333 43.946667 18.944 62.122667 3.072l451.456-395.221333a35.84 35.84 0 1 0-47.146667-53.888L377.386667 685.909333l-144.938667-154.453333z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24Gouxuan.defaultProps = {
  size: 18,
};

export default Icon24Gouxuan;
