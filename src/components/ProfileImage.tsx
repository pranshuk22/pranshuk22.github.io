type ProfileImageProps = {
  className: string
}

function ProfileImage({ className }: ProfileImageProps) {
  return (
    <img
      className={className}
      src={`${import.meta.env.BASE_URL}images/profile.jpg`}
      width="1512"
      height="1600"
      alt="Portrait of Pranshu Kumar"
      decoding="async"
    />
  )
}

export default ProfileImage
