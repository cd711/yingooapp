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

const Icon24Paizhaoshangchuan: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M598.314667 106.837333a99.413333 99.413333 0 0 1 95.744 71.04l9.088 31.232h71.168a142.506667 142.506667 0 0 1 142.506666 142.506667v412.458667a142.506667 142.506667 0 0 1-142.506666 142.506666H249.344a142.506667 142.506667 0 0 1-142.506667-142.506666V351.616a142.506667 142.506667 0 0 1 142.506667-142.506667h70.826667l9.088-31.232A99.413333 99.413333 0 0 1 424.96 106.837333h173.354667z m176 162.261334H249.344A82.517333 82.517333 0 0 0 166.826667 351.573333v412.458667c0 45.568 36.949333 82.517333 82.517333 82.517333h524.970667a82.517333 82.517333 0 0 0 82.517333-82.517333V351.616a82.517333 82.517333 0 0 0-82.517333-82.517333z m-262.485334 110.506666a166.357333 166.357333 0 1 1 0 332.672 166.357333 166.357333 0 0 1 0-332.714666z m0 59.946667a106.368 106.368 0 1 0 0 212.736 106.368 106.368 0 0 0 0-212.736zM765.866667 343.04a37.504 37.504 0 1 1 37.504 64.938667 37.504 37.504 0 0 1-37.546667-64.938667zM598.314667 166.826667H424.96a39.381333 39.381333 0 0 0-38.101333 27.861333l-4.224 14.421333h258.005333l-4.181333-14.421333a39.381333 39.381333 0 0 0-38.144-27.861333z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24Paizhaoshangchuan.defaultProps = {
  size: 18,
};

export default Icon24Paizhaoshangchuan;
