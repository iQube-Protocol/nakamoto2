
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

interface KNYTPersonaReward {
  id: string;
  user_id: string;
  linkedin_connected: boolean;
  metamask_connected: boolean;
  data_completed: boolean;
  reward_claimed: boolean;
  reward_amount: number;
  created_at: string;
  updated_at: string;
}

export const useKNYTPersona = () => {
  const { user } = useAuth();
  const [knytPersonaActivated, setKnytPersonaActivated] = useState(false);
  const [knytPersonaVisible, setKnytPersonaVisible] = useState(false);
  const [rewardData, setRewardData] = useState<KNYTPersonaReward | null>(null);
  const [canClaimReward, setCanClaimReward] = useState(false);

  useEffect(() => {
    if (user) {
      checkKNYTPersonaStatus();
    }
  }, [user]);

  const checkKNYTPersonaStatus = async () => {
    if (!user) return;

    try {
      // Check if reward record exists
      const { data: reward, error } = await supabase
        .from('knyt_persona_rewards')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching KNYT Persona reward:', error);
        return;
      }

      if (reward) {
        setRewardData(reward);
        setKnytPersonaActivated(true);
        setKnytPersonaVisible(true);
        
        // Check if user can claim reward
        const canClaim = reward.linkedin_connected && 
                        reward.metamask_connected && 
                        reward.data_completed && 
                        !reward.reward_claimed;
        setCanClaimReward(canClaim);
      }
    } catch (error) {
      console.error('Error in checkKNYTPersonaStatus:', error);
    }
  };

  const activateKNYTPersona = async () => {
    if (!user) return false;

    try {
      // Create or update reward record
      const { data, error } = await supabase
        .from('knyt_persona_rewards')
        .upsert({
          user_id: user.id,
          linkedin_connected: false,
          metamask_connected: false,
          data_completed: false,
          reward_claimed: false,
          reward_amount: 2800
        })
        .select()
        .single();

      if (error) {
        console.error('Error activating KNYT Persona:', error);
        return false;
      }

      setRewardData(data);
      setKnytPersonaActivated(true);
      setKnytPersonaVisible(true);
      
      toast.success('KNYT Persona DataQube activated! Complete all requirements to earn 2,800 Satoshi (2 $KNYT = $2.80)');
      return true;
    } catch (error) {
      console.error('Error in activateKNYTPersona:', error);
      return false;
    }
  };

  const deactivateKNYTPersona = () => {
    setKnytPersonaActivated(false);
    setKnytPersonaVisible(false);
    setRewardData(null);
    setCanClaimReward(false);
  };

  const hideKNYTPersona = () => {
    setKnytPersonaVisible(false);
  };

  const updateRewardProgress = async (updates: Partial<Pick<KNYTPersonaReward, 'linkedin_connected' | 'metamask_connected' | 'data_completed'>>) => {
    if (!user || !rewardData) return;

    try {
      const { data, error } = await supabase
        .from('knyt_persona_rewards')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reward progress:', error);
        return;
      }

      setRewardData(data);
      
      // Check if user can now claim reward
      const canClaim = data.linkedin_connected && 
                      data.metamask_connected && 
                      data.data_completed && 
                      !data.reward_claimed;
      setCanClaimReward(canClaim);

      if (canClaim) {
        toast.success('🎉 All requirements completed! You can now claim your 2,800 Satoshi reward!');
      }
    } catch (error) {
      console.error('Error in updateRewardProgress:', error);
    }
  };

  const claimReward = async () => {
    if (!user || !rewardData || !canClaimReward) return false;

    try {
      const { error } = await supabase
        .from('knyt_persona_rewards')
        .update({ reward_claimed: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error claiming reward:', error);
        return false;
      }

      setRewardData(prev => prev ? { ...prev, reward_claimed: true } : null);
      setCanClaimReward(false);
      
      toast.success('🎉 Congratulations! You have successfully claimed 2,800 Satoshi (2 $KNYT = $2.80)!');
      return true;
    } catch (error) {
      console.error('Error in claimReward:', error);
      return false;
    }
  };

  return {
    knytPersonaActivated,
    knytPersonaVisible,
    activateKNYTPersona,
    deactivateKNYTPersona,
    hideKNYTPersona,
    rewardData,
    canClaimReward,
    updateRewardProgress,
    claimReward,
    checkKNYTPersonaStatus
  };
};
