// A round profile picture. If the user hasn't uploaded one, shows the first letter of their name.
export default function Avatar({ url, name, size = 96 }) {
  const style = { width: size, height: size, fontSize: size / 2.5 }

  if (url) {
    return <img className="avatar" src={url} alt={`${name}'s profile picture`} style={style} />
  }

  return (
    <div className="avatar avatar-placeholder" style={style} aria-label={`${name}'s profile picture`}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
