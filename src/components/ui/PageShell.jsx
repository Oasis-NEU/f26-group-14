import ring from '../../assets/ring.png'

// Full-screen gradient page wrapper. The variant decides which gradient to
// paint (the hero pages use a radial glow, the interior pages fade top-to-
// bottom). Pages don't touch background styles themselves — they just pick a
// variant.
//
//   variant   - 'hero' | 'gradient' | 'deep'
//   decorated - show the blue ring decorations in the corners
export default function PageShell({
  variant = 'gradient',
  decorated = false,
  children,
  className = '',
}) {
  const classes = ['page-shell', `page-shell--${variant}`]
  if (className) classes.push(className)
  return (
    <div className={classes.join(' ')}>
      {decorated && (
        <>
          <img src={ring} alt="" className="page-shell__ring page-shell__ring--top-right" />
          <img src={ring} alt="" className="page-shell__ring page-shell__ring--bottom-left" />
        </>
      )}
      <div className="page-shell__content">{children}</div>
    </div>
  )
}
