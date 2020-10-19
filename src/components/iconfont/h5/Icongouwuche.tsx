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

const Icongouwuche: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M380.501333 809.685333a59.989333 59.989333 0 1 1 0 119.978667 59.989333 59.989333 0 0 1 0-119.978667z m280.064 0a59.989333 59.989333 0 1 1 0 119.978667 59.989333 59.989333 0 0 1 0-119.978667zM116.48 85.589333c45.994667 0 85.504 32.725333 94.08 77.952l87.04 460.544c4.096 21.717333 23.04 37.418667 45.098667 37.418667h390.528c21.418667 0 40.021333-14.933333 44.757333-35.84l65.28-289.365333a45.909333 45.909333 0 0 0-44.8-56.021334H341.12a30.592 30.592 0 1 1 0-61.184h457.386667a107.093333 107.093333 0 0 1 104.533333 130.688l-65.28 289.365334a107.093333 107.093333 0 0 1-104.533333 83.541333H342.784a107.093333 107.093333 0 0 1-105.258667-87.210667L150.442667 174.933333a34.474667 34.474667 0 0 0-33.92-28.16 30.592 30.592 0 1 1 0-61.184z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icongouwuche.defaultProps = {
  size: 18,
};

export default Icongouwuche;
