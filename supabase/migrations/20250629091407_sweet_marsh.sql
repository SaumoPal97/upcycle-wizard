/*
  # Add user signup trigger

  1. New Functions
    - `handle_new_user()` - Automatically creates a user record in public.users when a new user signs up

  2. New Triggers  
    - `on_auth_user_created` - Fires the handle_new_user function when a new user is created in auth.users

  3. Security
    - Function runs with SECURITY DEFINER to bypass RLS during user creation
    - Ensures new users are automatically added to public.users table
*/

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();