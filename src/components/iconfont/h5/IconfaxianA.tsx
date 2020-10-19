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

const IconfaxianA: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M905.728 358.954667c-64.298667-111.061333-193.152-221.013333-330.794667-239.146667-233.898667-30.805333-448.426667 133.845333-479.232 367.701333a691.925333 691.925333 0 0 0-3.498666 102.528c105.557333-81.28 235.861333-123.050667 368.469333-162.261333 143.957333-44.032 291.413333-80.896 445.056-68.821333z"
        fill={getIconColor(color, 0, '#D7D7DA')}
        opacity=".5"
      />
      <path
        d="M142.165333 736.64a426.752 426.752 0 0 0 795.904-237.866667s83.328-50.517333 44.586667-105.258666c-43.648-62.421333-667.008 55.168-931.285333 244.906666-64.853333 51.072 90.794667 98.218667 90.794666 98.218667z"
        fill={getIconColor(color, 1, '#D7D7DA')}
      />
    </svg>
  );
};

IconfaxianA.defaultProps = {
  size: 18,
};

export default IconfaxianA;
