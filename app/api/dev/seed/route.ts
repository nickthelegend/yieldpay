import { ethers } from 'ethers'

export async function POST(req: Request) {
  // Only available in fork mode
  if (process.env.NEXT_PUBLIC_USE_FORK !== 'true') {
    return Response.json({ error: 'Only available in fork mode' }, { status: 403 })
  }

  try {
    const { address } = await req.json()
    const provider = new ethers.JsonRpcProvider('http://localhost:8545')
    const WHALE = '0x5754284f345afc66a98fbB0a0Afe71e0F007B949'
    const USDT = '0xdac17f958d2ee523a2206206994597c13d831ec7'

    // Impersonate whale
    await provider.send('anvil_impersonateAccount', [WHALE])

    // Give whale ETH for gas
    await provider.send('anvil_setBalance', [
      WHALE,
      '0x56BC75E2D63100000' // 100 ETH in hex
    ])

    // Give target ETH for gas
    await provider.send('anvil_setBalance', [
      address,
      '0x56BC75E2D63100000'
    ])

    // Transfer USDT
    const whaleSigner = await provider.getSigner(WHALE)
    const usdt = new ethers.Contract(USDT, [
      'function transfer(address to, uint256 amount) returns (bool)'
    ], whaleSigner)

    const tx = await usdt.transfer(address, 10_000n * 1_000_000n)
    await tx.wait()

    // Stop impersonating
    await provider.send('anvil_stopImpersonatingAccount', [WHALE])

    return Response.json({ 
      success: true, 
      message: '10,000 USDT + 100 ETH sent to ' + address, 
      txHash: tx.hash 
    })
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
