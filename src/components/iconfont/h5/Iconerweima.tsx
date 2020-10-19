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

const Iconerweima: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M128.341333 489.472h360.96v-360.96h-360.96v360.96z m90.282667-270.72h180.48v180.48h-180.48v-180.48z m315.818667-90.24v360.96h361.002666v-360.96h-360.96z m270.762666 270.72h-180.48v-180.48h180.48v180.48zM263.765333 354.133333h90.197334V263.893333H263.722667V354.133333zM128.298667 895.573333h360.96v-360.96h-360.96v360.96z m90.282666-270.72h180.48v180.48h-180.48v-180.48z m541.44-360.96H669.866667V354.133333h90.24V263.893333zM534.442667 895.573333h90.282666v-90.282666h-90.282666v90.282666z m90.282666-270.762666v180.48h90.24v-180.48h-90.24z m180.48 180.48h-90.24v90.282666h180.48v-180.48h-90.24v90.197334z m0-180.48h90.24V534.613333h-90.24v90.24z m-270.762666-90.24v90.24h90.282666V534.613333h-90.282666z m-270.72 225.621333h90.24v-90.24H263.722667v90.24z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Iconerweima.defaultProps = {
  size: 18,
};

export default Iconerweima;
