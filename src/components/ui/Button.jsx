// Single button with visual variants. Pages stay presentation-free by
// passing props instead of styling buttons inline.
//
//   variant - 'primary' (filled blue), 'outline' (border only), 'ghost'
//   size    - 'sm' | 'md' (default) | 'lg'
//   as      - swap the tag out when you need a <Link> or <a> instead of <button>
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  as: Tag = 'button',
  className = '',
  type,
  ...rest
}) {
  const classes = ['btn', `btn--${variant}`]
  if (size === 'sm') classes.push('btn--sm')
  if (size === 'lg') classes.push('btn--lg')
  if (className) classes.push(className)

  // Default <button> to type="button" so forms don't accidentally submit.
  const buttonType = Tag === 'button' ? type ?? 'button' : type
  return (
    <Tag className={classes.join(' ')} type={buttonType} {...rest}>
      {children}
    </Tag>
  )
}
