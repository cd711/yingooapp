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

const Icon24Gongnengjianyi: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M887.68 399.36a32.085333 32.085333 0 0 0-54.186667-16.213333l-149.888 148.053333a54.485333 54.485333 0 0 1-77.653333 0l-75.818667-75.861333c-21.674667-21.674667-21.674667-55.978667 0-75.818667l149.888-149.888c18.048-18.090667 9.002667-48.768-14.464-54.186667-88.490667-16.256-182.4 9.002667-249.216 75.861334-75.861333 74.026667-99.328 180.565333-70.4 276.266666a42.368 42.368 0 0 1-9.045333 43.349334L186.965333 724.48c-21.632 21.674667-21.632 55.978667 0 75.861333l77.653334 75.818667a54.485333 54.485333 0 0 0 77.653333 0l151.722667-151.68c10.837333-10.837333 27.093333-14.464 43.349333-10.837333 93.866667 27.093333 200.448 5.418667 276.309333-70.4 64.981333-65.024 90.282667-157.141333 74.026667-243.84z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24Gongnengjianyi.defaultProps = {
  size: 18,
};

export default Icon24Gongnengjianyi;
