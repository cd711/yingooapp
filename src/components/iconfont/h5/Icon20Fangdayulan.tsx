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

const Icon20Fangdayulan: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
        fill={getIconColor(color, 0, '#000000')}
        opacity=".4"
      />
      <path
        d="M440.7808 554.496a38.4 38.4 0 1 1 61.0304 44.9536l-3.0208 5.0176-3.7376 4.352-133.632 133.5296 78.0288 0.0512c14.9504 0 28.0576 8.5504 34.4576 21.8624l2.0992 5.1712 1.3824 5.632 0.512 5.7344a38.4 38.4 0 0 1-27.136 36.5568l-5.5296 1.3824-5.7856 0.4608H267.776l-4.352-0.4608-2.6624-0.4096-3.9936-1.0752-3.7376-1.4848-5.6832-3.1744-3.7376-2.8672-1.28-1.1776-4.096-4.608-3.3792-5.3248-1.536-3.1744-1.0752-3.072-1.3824-5.888-0.3072-3.072L230.4 780.8V610.1504a38.4 38.4 0 1 1 74.9568-11.3664l1.3824 5.632 0.4608 5.7344-0.1024 77.9776 133.632-133.632zM604.3648 230.912l5.7856-0.512 172.4928 0.0512 3.6864 0.3584 3.8912 0.768 2.6624 0.768 3.7376 1.4848 5.6832 3.1744 3.7376 2.8672 1.28 1.1776 4.0448 4.5568 1.9456 2.7136 1.536 2.6624 1.4336 3.1744 1.1264 3.072 1.3824 6.0416 0.4096 5.5296v170.6496a38.4 38.4 0 1 1-74.9568 11.3664l-1.3824-5.632-0.4608-5.7344-0.0512-78.0288-133.5296 133.632a38.4 38.4 0 0 1-44.7488 6.9632l-5.2224-3.2256-4.3008-3.7376a38.4 38.4 0 0 1-6.7072-44.9536l2.9696-4.9664 3.7376-4.352L688.128 307.0976l-77.9776 0.1024a38.144 38.144 0 0 1-34.4576-21.8624l-2.0992-5.1712-1.3824-5.632L571.6992 268.8a38.4 38.4 0 0 1 27.136-36.5568L604.3136 230.912z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </svg>
  );
};

Icon20Fangdayulan.defaultProps = {
  size: 18,
};

export default Icon20Fangdayulan;
