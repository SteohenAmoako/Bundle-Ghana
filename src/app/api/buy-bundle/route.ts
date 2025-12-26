import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { recipientMsisdn, networkId, sharedBundle, price, dataAmount } = await req.json();

  if (!recipientMsisdn || !networkId || !sharedBundle) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const apiKey = process.env.CHEAP_BUNDLES_API_KEY;

  if (!apiKey) {
    console.error('API key is not configured');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  try {
    const response = await fetch('https://cheap-bundles-ghana.azurewebsites.net/api/external/packages/buy-other', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify({ recipientMsisdn, networkId, sharedBundle }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Log the transaction with a failed status
      await supabase.rpc('purchase_bundle_and_log_transaction', {
          p_user_id: session.user.id,
          p_amount: price,
          p_transaction_code: `FAILED-${Date.now()}`,
          p_status: 'failed',
          p_recipient_msisdn: recipientMsisdn,
          p_network_id: networkId,
          p_shared_bundle: sharedBundle,
          p_bundle_amount: dataAmount,
          p_description: `Failed purchase of ${dataAmount} for ${recipientMsisdn}`
      });
      return NextResponse.json({ error: result.message || 'Failed to purchase bundle' }, { status: response.status });
    }

    // Log the successful transaction
    const { error: rpcError } = await supabase.rpc('purchase_bundle_and_log_transaction', {
        p_user_id: session.user.id,
        p_amount: price,
        p_transaction_code: result.transactionCode,
        p_status: 'success',
        p_recipient_msisdn: recipientMsisdn,
        p_network_id: networkId,
        p_shared_bundle: sharedBundle,
        p_bundle_amount: dataAmount,
        p_description: `Purchase of ${dataAmount} for ${recipientMsisdn}`
    });

    if (rpcError) {
        console.error("Error logging successful transaction:", rpcError);
        // Even if logging fails, the purchase was successful. Decide on how to handle this.
        // For now, we'll still return a success response to the client.
    }


    return NextResponse.json({ success: true, ...result });

  } catch (error) {
    console.error('Error purchasing bundle:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
