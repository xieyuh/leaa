import React, { useState } from 'react';
import { Layout, Menu, Icon } from 'antd';
import { Link, RouteComponentProps } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import logo from '@leaa/dashboard/assets/images/logo/logo-white.svg';
import { IRouteItem } from '@leaa/dashboard/interfaces';
import { masterRoutes, flateMasterRoutes } from '@leaa/dashboard/routes/master.route';
import { authUtil } from '@leaa/dashboard/utils';
import { ALLOW_PERMISSION } from '@leaa/dashboard/constants';
import { SwitchLanguage } from '@leaa/dashboard/components/SwitchLanguage';

import style from './style.less';

interface IProps extends RouteComponentProps {}

const getMenuName = (menu: IRouteItem) => {
  const { t } = useTranslation();

  if (menu.namei18n) {
    return t(`${menu.namei18n}`);
  }

  return menu.name;
};

const makeFlatMenu = (menu: IRouteItem): React.ReactNode => {
  let dom = null;

  // Home
  if (menu.path === '/') {
    return null;
  }

  // hasParam
  if (menu.path.includes(':')) {
    return dom;
  }

  if (menu.isCreate) {
    return dom;
  }

  if (authUtil.getAuthInfo().flatePermissions.includes(menu.permission) || menu.permission === ALLOW_PERMISSION) {
    const currentMenuCreatePermission = `${menu.permission.split('.')[0]}.create`;

    dom = (
      <Menu.Item key={menu.path} className={`g-sidebar-menu-${menu.path}`}>
        <Link to={menu.path}>
          <span className="nav-text">
            {menu.icon && <Icon type={menu.icon} />}
            {getMenuName(menu)}
          </span>
        </Link>

        {menu.canCreate &&
          (authUtil.getAuthInfo().flatePermissions.includes(currentMenuCreatePermission) ||
            menu.permission === ALLOW_PERMISSION) && (
            <Link to={`${menu.path}/create`} className={style['can-create-button']}>
              <Icon type="plus" />
            </Link>
          )}
      </Menu.Item>
    );
  }

  return dom;
};

const makeFlatMenus = (menus: IRouteItem[]): React.ReactNode => {
  return menus.map(menu => {
    if (
      menu.children &&
      (authUtil.getAuthInfo().flatePermissions.includes(menu.permission) || menu.permission === ALLOW_PERMISSION)
    ) {
      return (
        <Menu.SubMenu
          className={`g-sidebar-group-menu-${menu.path}`}
          key={menu.path}
          title={
            <span className="nav-text">
              {menu.icon && <Icon type={menu.icon} />}
              {getMenuName(menu)}
            </span>
          }
        >
          {menu.children.map(subMenu => makeFlatMenu(subMenu))}
        </Menu.SubMenu>
      );
    }

    return makeFlatMenu(menu);
  });
};

export const LayoutSidebar = (props: IProps) => {
  const pathWithoutParams = props.match.path.replace(/(^.*)\/.*/, '$1') || props.match.path;
  const [selectedKeys, setSelectedKeys] = useState<string>(pathWithoutParams);

  const curremtSelectedKey = flateMasterRoutes.find(r => r.path === props.match.path);
  const uiOpenKeys = curremtSelectedKey ? curremtSelectedKey.groupName || '' : '';

  return (
    <Layout.Sider collapsible={false} className={style['full-layout-sidebar']}>
      <div className={style['logo-wrapper']}>
        <Link to="/">
          <img src={logo} alt="" width={40} />
        </Link>
      </div>

      {masterRoutes && (
        <Menu
          className={style['menu-wrapper']}
          defaultSelectedKeys={[selectedKeys]}
          defaultOpenKeys={[uiOpenKeys]}
          selectable
          mode="inline"
          theme="dark"
          onSelect={() => setSelectedKeys(pathWithoutParams)}
        >
          {makeFlatMenus(masterRoutes)}
        </Menu>
      )}

      <div className={style['switch-language-wrapper']}>
        <SwitchLanguage className={style['switch-language']} placement="topLeft" dark />
      </div>
    </Layout.Sider>
  );
};
