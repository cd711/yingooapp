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

const Icon24Xiangceshangchuan: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M788.608 128a154.666667 154.666667 0 0 1 154.666667 154.709333V730.453333a154.666667 154.666667 0 0 1-154.666667 154.709334H218.709333A154.666667 154.666667 0 0 1 64 730.453333V282.709333A154.666667 154.666667 0 0 1 218.709333 128h569.898667z m0 65.152H218.709333c-49.493333 0-89.6 40.106667-89.6 89.557333V730.453333c0 49.493333 40.106667 89.6 89.6 89.6h68.096l302.976-297.301333a154.666667 154.666667 0 0 1 174.805334-29.226667l113.578666 54.016V282.709333c0-49.493333-40.106667-89.6-89.6-89.6z m-153.216 376.106667l-255.573333 250.752h408.746666c49.493333 0 89.6-40.106667 89.6-89.557334v-110.805333l-141.610666-67.370667a89.557333 89.557333 0 0 0-101.162667 16.981334zM300.117333 290.816a113.962667 113.962667 0 1 1 0 227.968 113.962667 113.962667 0 0 1 0-227.968z m0 65.152a48.853333 48.853333 0 1 0 0 97.706667 48.853333 48.853333 0 0 0 0-97.706667z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24Xiangceshangchuan.defaultProps = {
  size: 18,
};

export default Icon24Xiangceshangchuan;
