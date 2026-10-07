/**
 * 全站导航配置 —— 菜单与页脚的唯一数据源。
 *
 * 之前 MobileMenu 和 Footer 各自内联了一份 7 项数组，内容完全相同。
 * 改导航必须同时改两处，漏一处就出现「菜单有、页脚没有」这类错位，
 * 而且不会有任何报错。
 */

export interface NavItem {
  label: string
  path: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: '首页', path: '/' },
  { label: '生活碎碎念', path: '/life' },
  { label: '思考随笔', path: '/pragmatism-connectivism' },
  { label: 'BRAND & AI', path: '/brand-ai' },
  { label: '晓宇友人账', path: '/friends' },
  { label: '关于XIAOYU', path: '/about' },
  { label: '精选文章', path: '/archives' },
]