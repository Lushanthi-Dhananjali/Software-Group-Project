interface Props { id: string; src: string; title: string; }
export function RestrictedVideoPlayer({ id, src, title }: Props) { return <iframe id={id} src={src} title={title} className="h-full w-full border-0" allowFullScreen />; }
export default function LivePlayer(props: Props) { return <RestrictedVideoPlayer {...props} />; }