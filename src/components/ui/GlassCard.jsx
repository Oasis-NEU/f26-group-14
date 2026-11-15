// Frosted-glass container used for the landing hero, the Hot Deals panel,
// and form cards. Variants map to the padding presets in App.css.
//
//   variant - 'hero' | 'panel' | 'card'
export default function GlassCard({ variant = 'panel', className = '', children, ...rest }) {
  const classes = ['glass', `glass--${variant}`]
  if (className) classes.push(className)
  return (
    <div className={classes.join(' ')} {...rest}>
      {children}
    </div>
  )
}
