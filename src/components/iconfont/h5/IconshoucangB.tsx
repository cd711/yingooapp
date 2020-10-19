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

const IconshoucangB: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M740.096 598.656l-0.768 0.768a25.429333 25.429333 0 0 0-6.698667 22.144l33.152 201.514667c8.448 51.285333-44.373333 91.306667-89.941333 65.962666L502.570667 793.6a20.736 20.736 0 0 0-20.48 0l-173.226667 95.445333c-45.653333 25.386667-98.901333-14.848-90.026667-66.005333l33.066667-200.96a26.026667 26.026667 0 0 0-7.253333-23.253333l-140.373334-142.976c-35.712-36.309333-16.085333-99.242667 34.389334-107.264l194.005333-29.781334a22.528 22.528 0 0 0 16.853333-13.653333l86.058667-183.253333a61.013333 61.013333 0 0 1 111.104 0l86.314667 183.594666a24.32 24.32 0 0 0 16.512 13.269334l194.56 29.781333c50.517333 7.552 70.229333 70.656 34.645333 106.837333l-138.624 143.274667z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

IconshoucangB.defaultProps = {
  size: 18,
};

export default IconshoucangB;
