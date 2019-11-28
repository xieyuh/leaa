import React from 'react';
import cx from 'classnames';
import { Link } from 'react-router-dom';

import { NullTag } from '@leaa/dashboard/src/components';

import style from './style.module.less';

interface IProps {
  className?: string;
  id: number | string | undefined;
  link?: string;
  size?: 'small' | 'large';
  linkNormalColor?: boolean;
}

export const IdTag = (props: IProps) => {
  const idDom = (
    <div className={style['id-tag-inner']}>
      <sup className={style['id-tag-symbol']}>#</sup>
      <strong className={style['id-tag-text']}>{!props.id ? '_' : props.id}</strong>
    </div>
  );

  return (
    <div
      className={cx(
        style['id-tag-wrapper'],
        props.className,
        style[`id-tag-wrapper--size-${props.size}`],
        'g-id-tag-wrapper',
        {
          [style['id-tag-wrapper--empty']]: !props.id,
          [style['id-tag-wrapper--link-normal-color']]: props.linkNormalColor,
        },
      )}
    >
      {props.link && props.id ? <Link to={props.link}>{idDom}</Link> : <NullTag opacity={0.4} />}
    </div>
  );
};