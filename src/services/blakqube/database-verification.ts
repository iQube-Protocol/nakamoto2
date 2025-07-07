
import { supabase } from '@/integrations/supabase/client';

export const verifyDatabaseState = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.log('❌ No authenticated user');
      return;
    }

    console.log('=== DATABASE VERIFICATION ===');
    console.log('👤 User ID:', user.user.id);

    // Check user connections
    const { data: connections, error: connectionsError } = await (supabase as any)
      .from('user_connections')
      .select('*')
      .eq('user_id', user.user.id);

    console.log('🔗 User connections:', connections);
    if (connectionsError) console.error('❌ Connections error:', connectionsError);

    // Check wallet connection specifically
    const walletConnection = connections?.find(c => c.service === 'wallet');
    if (walletConnection) {
      console.log('💰 Wallet connection data:', walletConnection.connection_data);
      console.log('💰 KNYT balance in wallet:', walletConnection.connection_data?.knytTokenBalance);
    }

    // Check KNYT personas
    const { data: knytPersonas, error: knytError } = await (supabase as any)
      .from('knyt_personas')
      .select('*')
      .eq('user_id', user.user.id);

    console.log('🧑 KNYT personas in DB:', knytPersonas);
    if (knytError) console.error('❌ KNYT personas error:', knytError);

    if (knytPersonas && knytPersonas.length > 0) {
      console.log('💰 KNYT-COYN-Owned in DB:', knytPersonas[0]["KNYT-COYN-Owned"]);
    }

    // Check Qrypto personas
    const { data: qryptoPersonas, error: qryptoError } = await (supabase as any)
      .from('qrypto_personas')
      .select('*')
      .eq('user_id', user.user.id);

    console.log('🧑 Qrypto personas in DB:', qryptoPersonas);
    if (qryptoError) console.error('❌ Qrypto personas error:', qryptoError);

    console.log('=== DATABASE VERIFICATION COMPLETE ===');

    return {
      connections,
      knytPersonas,
      qryptoPersonas,
      walletConnection
    };
  } catch (error) {
    console.error('❌ Database verification error:', error);
  }
};
