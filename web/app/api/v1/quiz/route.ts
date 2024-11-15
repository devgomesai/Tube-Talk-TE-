export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { message } = await req.json();
  } catch (error) {
    console.error('Error handling quiz request:', error);
  }
}
