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

const Icon16Re: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 960c203.264 0 368-152.192 368-339.84 0-187.776-142.976-412.224-375.232-588.16 49.664 230.272 1.28 398.72-145.216 505.28-44.352-39.232-48.192-113.024-11.648-221.44-120.896 55.68-203.904 171.008-203.904 304.256C144 807.808 308.736 960 512 960z"
        fill={getIconColor(color, 0, '#FFCF33')}
      />
      <path
        d="M535.552 920.896c96.64-10.432 147.968-57.856 154.048-142.336-10.88-103.68-44.8-190.464-101.568-260.352-11.52 168.768-138.24 191.68-186.432 250.624-48.192 58.88-11.008 167.68 133.952 152.064z"
        fill={getIconColor(color, 1, '#FFF3BB')}
      />
    </svg>
  );
};

Icon16Re.defaultProps = {
  size: 18,
};

export default Icon16Re;
