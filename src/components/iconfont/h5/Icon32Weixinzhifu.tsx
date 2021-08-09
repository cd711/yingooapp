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

const Icon32Weixinzhifu: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 512m-448 0a448 448 0 1 0 896 0 448 448 0 1 0-896 0Z"
        fill={getIconColor(color, 0, '#FFFFFF')}
      />
      <path
        d="M783.04 0H240.96A240.96 240.96 0 0 0 0 240.96v542.08A240.96 240.96 0 0 0 240.96 1024h542.08A240.96 240.96 0 0 0 1024 783.04V240.96A240.96 240.96 0 0 0 783.04 0zM512 785.12a399.36 399.36 0 0 1-109.312-15.104c-10.176 1.856-20.128 4.8-29.632 8.864L305.92 820.992c-19.84 13.312-26.336 8.288-19.36-15.04l14.912-52.64a84.096 84.096 0 0 0-2.752-30.944c-80.928-53.984-133.12-137.92-133.12-231.904 0-162.304 155.616-294.72 346.368-294.72 116.352 0 219.648 49.28 282.496 124.512L471.648 473.6c-22.24 13.376-44.48 16.192-66.752-4.224l-51.488-46.304c-23.488-7.008-31.84 0.48-25.024 22.464L384 581.632c12.48 20.448 30.976 27.264 62.624 4.224L821.12 357.76a257.76 257.76 0 0 1 37.216 132.672c0 162.336-155.584 294.72-346.336 294.72z"
        fill={getIconColor(color, 1, '#59B64C')}
      />
    </svg>
  );
};

Icon32Weixinzhifu.defaultProps = {
  size: 18,
};

export default Icon32Weixinzhifu;
