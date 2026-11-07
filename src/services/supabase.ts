import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://maoedqtcusditxfoobdv.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  'sb_publishable_MTVzzbdBB0aqMX92ti0YEQ_Mb0Mkn-2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  hasTables: boolean;
}> {
  try {
    const { error, count } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return {
        connected: false,
        message: error.message,
        hasTables: false,
      };
    }

    return {
      connected: true,
      message: 'เชื่อมต่อ Supabase Database สำเร็จ',
      hasTables: true,
    };
  } catch (err) {
    return {
      connected: false,
      message: err instanceof Error ? err.message : 'ไม่สามารถเชื่อมต่อ Supabase ได้',
      hasTables: false,
    };
  }
}
