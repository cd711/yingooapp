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

const Icon24Shanchu: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M900.010667 195.328a29.312 29.312 0 1 1 0 58.666667h-81.493334l-29.354666 528.384a139.349333 139.349333 0 0 1-139.136 131.626666H344.746667a139.349333 139.349333 0 0 1-139.093334-131.626666L176.341333 253.994667H93.354667a29.312 29.312 0 1 1 0-58.666667h806.656z m-140.288 58.666667H235.093333l29.141334 525.141333a80.64 80.64 0 0 0 80.554666 76.202667h305.237334a80.64 80.64 0 0 0 80.554666-76.202667l29.141334-525.141333zM424.064 397.013333c16.213333 0 29.354667 13.098667 29.354667 29.312v234.794667a29.312 29.312 0 1 1-58.666667 0V426.325333c0-16.213333 13.098667-29.312 29.312-29.312z m146.688 0c16.213333 0 29.312 13.098667 29.312 29.312v234.794667a29.312 29.312 0 1 1-58.666667 0V426.325333c0-16.213333 13.141333-29.312 29.354667-29.312zM606.677333 85.333333a29.312 29.312 0 1 1 0 58.666667H386.688a29.312 29.312 0 1 1 0-58.666667z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24Shanchu.defaultProps = {
  size: 18,
};

export default Icon24Shanchu;
