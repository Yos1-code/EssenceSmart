import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, getUser } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error: any | null }>;
  uploadAvatar: (file: File) => Promise<{ url: string | null; error: any | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial user
    getUser().then(user => {
      setUser(user || null);
      if (user) {
        fetchProfile(user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user;
        setUser(currentUser || null);
        
        if (currentUser) {
          await fetchProfile(currentUser.id);
          // Update last sign in time
          await supabase
            .from('profiles')
            .update({ last_sign_in: new Date().toISOString() })
            .eq('id', currentUser.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId: string) {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  }

  async function signUp(email: string, password: string, name: string) {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (!error) {
        // Create profile record
        await supabase.from('profiles').insert([
          { 
            id: (await getUser())?.id, 
            email,
            full_name: name,
            is_admin: false
          }
        ]);
      }

      return { error };
    } catch (error) {
      return { error };
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function updateProfile(updates: any) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (!error) {
        setProfile({ ...profile, ...updates });
      }

      return { error };
    } catch (error) {
      return { error };
    }
  }

  async function uploadAvatar(file: File) {
    try {
      if (!user) throw new Error('User is not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const updates = { avatar_url: data.publicUrl };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, ...updates });

      return { url: data.publicUrl, error: null };
    } catch (error) {
      return { url: null, error };
    }
  }

  const value = {
    user,
    profile,
    isLoading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    updateProfile,
    uploadAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}