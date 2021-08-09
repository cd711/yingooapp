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

const Icon24Daishouhuo: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M729.6 107.434667c40.405333 0 76.928 24.277333 92.586667 61.525333l70.826666 168.789333 0.512 1.194667a28.458667 28.458667 0 0 1 2.816 12.373333V778.24a136.32 136.32 0 0 1-136.32 136.277333H221.994667a136.32 136.32 0 0 1-136.32-136.277333V351.317333c0-4.565333 1.109333-8.96 3.029333-12.8l0.298667-0.768L159.872 168.96a100.437333 100.437333 0 0 1 92.586667-61.525333H729.6z m109.354667 272.597333H143.061333v398.165333a78.933333 78.933333 0 0 0 78.933334 78.933334h538.026666a78.933333 78.933333 0 0 0 78.933334-78.933334V380.032z m-187.477334 100.48a28.714667 28.714667 0 1 1 37.802667 43.178667l-256.981333 224.981333a35.84 35.84 0 0 1-49.792-2.432l-91.733334-97.834667a28.714667 28.714667 0 1 1 41.813334-39.253333l77.525333 82.602667z m78.08-315.733333H252.501333c-17.322667 0-32.981333 10.410667-39.68 26.410666L157.525333 322.56h666.922667l-55.210667-131.413333a43.050667 43.050667 0 0 0-39.68-26.368z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24Daishouhuo.defaultProps = {
  size: 18,
};

export default Icon24Daishouhuo;
