-- Enable PostGIS for location features (optional)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT role_check CHECK (role IN ('user', 'admin')),
    PRIMARY KEY (id)
);

-- Events table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location GEOGRAPHY(POINT), -- or TEXT for simple address
    tags UUID[], -- Array of user IDs for @mentions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users NOT NULL,
    task TEXT NOT NULL,
    due_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences
CREATE TABLE public.user_preferences (
    user_id UUID REFERENCES public.users PRIMARY KEY,
    theme VARCHAR(10) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT false,
    last_notified TIMESTAMP WITH TIME ZONE
);

-- Add to events table
ALTER TABLE events
ADD COLUMN shared_with UUID[] DEFAULT '{}';
-- Update preferences table
ALTER TABLE user_preferences
ADD COLUMN browser_notifications BOOLEAN DEFAULT false;
ALTER TABLE events
ADD COLUMN shared_with UUID[];

CREATE INDEX idx_events_shared_with ON events USING GIN(shared_with);

-- Indexes for common queries
CREATE INDEX idx_events_user ON public.events(user_id);
CREATE INDEX idx_events_time ON public.events(event_time);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

-- Users table policies
CREATE POLICY "Users can view themselves" ON public.users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can manage users" ON public.users
FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Events table policies
CREATE POLICY "User event access" ON public.events
FOR ALL USING (auth.uid() = user_id);

-- Tasks table policies
CREATE POLICY "User task access" ON public.tasks
FOR ALL USING (auth.uid() = user_id);

-- Preferences table policies
CREATE POLICY "User preference access" ON public.user_preferences
FOR ALL USING (auth.uid() = user_id);