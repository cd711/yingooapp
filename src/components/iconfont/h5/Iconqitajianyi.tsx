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

const Iconqitajianyi: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M423.509333 565.76c35.754667 0 64.682667 28.928 64.682667 64.682667v165.973333a65.237333 65.237333 0 0 1-64.682667 64.725333H257.450667a64.682667 64.682667 0 0 1-64.682667-64.682666v-166.016c0-35.754667 28.928-64.725333 64.682667-64.725334h166.058666z m351.573334 0c35.797333 0 64.725333 28.928 64.725333 64.682667v165.973333c0 35.797333-28.928 64.725333-64.682667 64.725333h-166.016a64.682667 64.682667 0 0 1-64.725333-64.682666v-166.016c0-35.754667 28.970667-64.725333 64.725333-64.725334h165.973334z m-351.573334-351.658667c35.754667 0 64.682667 28.928 64.682667 64.682667v166.058667a65.152 65.152 0 0 1-64.682667 64.256H257.450667a64.682667 64.682667 0 0 1-64.682667-64.682667V278.4c0-35.370667 28.928-64.298667 64.682667-64.298667h166.058666z m268.586667 0a148.053333 148.053333 0 0 1 147.712 147.712 147.712 147.712 0 0 1-147.712 147.285334A148.053333 148.053333 0 0 1 544.426667 361.386667a147.712 147.712 0 0 1 147.712-147.285334z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Iconqitajianyi.defaultProps = {
  size: 18,
};

export default Iconqitajianyi;
