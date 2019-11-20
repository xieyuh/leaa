import _lang from './_lang.lang';

const group = 'Group';
const home = 'Home';
const playground = 'Playground';
const test = 'Test';
const debug = 'Debug';
const user = 'User';
const role = 'Role';
const permission = 'Permission';
const category = 'Category';
const article = 'Article';
const ax = 'Ad';
const tag = 'Tag';
const attachment = 'Attachment';
const setting = 'Setting';
const coupon = 'Coupon';
const marketing = 'Marketing';
const content = 'Content';

export default {
  home,
  login: _lang.login,
  regist: _lang.register,
  //
  playground,
  test,
  debug,
  testAny: 'Test Any',
  testAttachment: 'Test Attachment',
  testI18n: 'Test I18n',
  testStore: 'Test Store',
  //
  userGroup: `${user} ${group}`,
  user,
  createUser: `${_lang.create} ${user}`,
  editUser: `${_lang.edit} ${user}`,
  //
  role,
  createRole: `${_lang.create} ${role}`,
  editRole: `${_lang.edit} ${role}`,
  //
  permission,
  createPermission: `${_lang.create} ${permission}`,
  editPermission: `${_lang.edit} ${permission}`,
  //
  category,
  createCategory: `${_lang.create} ${category}`,
  editCategory: `${_lang.edit} ${category}`,
  //
  contentGroup: `${content}`,
  article,
  createArticle: `${_lang.create} ${article}`,
  editArticle: `${_lang.edit} ${article}`,
  //
  ax,
  createAx: `${_lang.create}${ax}`,
  editAx: `${_lang.edit}${ax}`,
  //
  tag,
  createTag: `${_lang.create}${tag}`,
  editTag: `${_lang.edit}${tag}`,
  //
  attachment,
  createAttachment: `${_lang.create}${attachment}`,
  editAttachment: `${_lang.edit}${attachment}`,
  //
  setting,
  //
  marketingGroup: `${marketing}`,
  coupon,
  createCoupon: `${_lang.create}${coupon}`,
  editCoupon: `${_lang.edit}${coupon}`,
};
