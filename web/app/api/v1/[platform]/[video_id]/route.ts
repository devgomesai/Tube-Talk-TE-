export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string, video_id: string }> }
) {
  const platform = (await params).platform // 'a', 'b', or 'c'
  const video_id = (await params).video_id // 'd', 'e', or 'f'
  return new Response(`Hello, ${platform} ${video_id}!`)
}
