/* tslint:disable */
/* eslint-disable */

import { CSSProperties, DOMAttributes, FunctionComponent } from 'react';
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

const Icon24Tupianpaixu: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M768 209.066667a36.266667 36.266667 0 0 1 35.968 31.701333l0.298667 4.565333v466.944l43.690666-43.648a36.266667 36.266667 0 0 1 43.178667-6.144l4.437333 2.901334 3.712 3.242666a36.266667 36.266667 0 0 1 3.242667 47.573334l-3.242667 3.712-104.234666 104.234666a36.181333 36.181333 0 0 1-62.549334-17.024l-0.682666-5.333333L731.733333 245.333333c0-20.053333 16.213333-36.266667 36.266667-36.266666z m-149.333333 533.333333a36.266667 36.266667 0 0 1 4.565333 72.234667l-4.565333 0.298666H170.666667a36.266667 36.266667 0 0 1-4.565334-72.234666L170.666667 742.4h448z m0-256a36.266667 36.266667 0 0 1 4.565333 72.234667l-4.565333 0.298666H170.666667a36.266667 36.266667 0 0 1-4.565334-72.234666L170.666667 486.4h448z m0-256a36.266667 36.266667 0 0 1 4.565333 72.234667L618.666667 302.933333H170.666667a36.266667 36.266667 0 0 1-4.565334-72.234666L170.666667 230.4h448z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24Tupianpaixu.defaultProps = {
  size: 18,
};

export default Icon24Tupianpaixu;
