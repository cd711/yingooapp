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

const Icon32Zhifubaozhifu: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M224 0h576a224 224 0 0 1 224 224v477.184c-0.384 64.64-0.8 105.184-1.248 121.6-0.48 16.416-1.152 30.336-2.08 41.728L969.6 900.096a224 224 0 0 1-106.08 39.104l-617.6 60.64A224 224 0 0 1 0 776.96V224a224 224 0 0 1 224-224z"
        fill={getIconColor(color, 0, '#FFFFFF')}
      />
      <path
        d="M283.488 791.712c-149.568 0-173.28-94.592-165.44-134.208 8.064-39.04 51.2-90.56 134.464-90.56 95.648 0 181.344 24.544 284 74.688-72.224 94.016-160.864 150.08-253.024 150.08zM1024 701.152V197.024A196.896 196.896 0 0 0 827.008 0H196.992A196.896 196.896 0 0 0 0 196.992v630.016A196.896 196.896 0 0 0 196.992 1024h630.016a197.12 197.12 0 0 0 194.016-162.24c-52.256-22.336-278.624-120.16-396.384-176.48-89.728 108.576-183.776 173.792-325.536 173.792-141.44 0-236.032-87.04-224.736-194.016 7.552-70.08 55.52-184.576 264.352-164.928 109.952 10.24 160.32 31.008 250.08 60.64a705.6 705.6 0 0 0 57.12-139.296H248.16v-39.616h196.736V311.232H204.8V267.872h240.096V165.728s2.176-16.16 19.936-16.16H563.2V267.84h256v43.36h-256v70.624h208.832c-19.136 78.144-48.224 150.08-84.864 212.864C747.776 616.544 1024 701.184 1024 701.184z"
        fill={getIconColor(color, 1, '#009FE8')}
      />
    </svg>
  );
};

Icon32Zhifubaozhifu.defaultProps = {
  size: 18,
};

export default Icon32Zhifubaozhifu;
