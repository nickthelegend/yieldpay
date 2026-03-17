import { ethers } from 'ethers'

export async function POST(req: Request) {
  // Only available in fork mode
  if (process.env.NEXT_PUBLIC_USE_FORK !== 'true') {
    return Response.json({ error: 'Only available in fork mode' }, { status: 403 })
  }

  try {
    const { seconds } = await req.json()
    const provider = new ethers.JsonRpcProvider('http://localhost:8545')
    
    await provider.send('evm_increaseTime', [seconds])
    await provider.send('evm_mine', [])

    return Response.json({ success: true, message: `Fast forwarded ${seconds} seconds` })
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
